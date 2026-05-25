/* Servicio para la gestión de invitaciones a proyectos. */

'use strict';

const db = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../../../utils/AppError');
const HTTP_STATUS = require('../../../constants/httpStatus');
const emailService = require('../../../services/email.service');
const env = require('../../../config/env');

const INVITATION_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

/**
 * Crea una invitación y envía el correo.
 * @param {string} projectId - ID del proyecto.
 * @param {string} inviterId - ID del usuario que invita.
 * @param {string} email - Correo del invitado.
 * @param {string} roleId - Rol asignado.
 */
const inviteUser = async (projectId, inviterId, email, roleId) => {
  // 1. Validar que el proyecto y el rol existen
  const project = await db('projects').where({ id: projectId }).first();
  if (!project) throw new AppError('Project not found', HTTP_STATUS.NOT_FOUND);

  const role = await db('roles').where({ id: roleId, project_id: projectId }).first();
  if (!role) throw new AppError('Role not found or does not belong to project', HTTP_STATUS.BAD_REQUEST);

  // 2. Verificar que el usuario no sea ya miembro
  const existingUser = await db('users').where({ email }).first();
  if (existingUser) {
    const isMember = await db('project_members')
      .where({ project_id: projectId, user_id: existingUser.id })
      .first();
    if (isMember) {
      throw new AppError('User is already a member of this project', HTTP_STATUS.CONFLICT);
    }
  }

  // 3. Verificar si ya hay una invitación pendiente para ese correo en este proyecto
  const existingInvite = await db('project_invitations')
    .where({ project_id: projectId, email, status: 'pending' })
    .first();
    
  if (existingInvite) {
    throw new AppError('An invitation has already been sent to this email', HTTP_STATUS.CONFLICT);
  }

  // 4. Obtener datos del invitador
  const inviter = await db('users').where({ id: inviterId }).first();

  // 5. Crear token e insertar en base de datos
  const token = uuidv4(); // Para invitaciones, el token es el ID directo, o podemos usar un token plano
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRES_IN_MS);

  await db('project_invitations').insert({
    project_id: projectId,
    inviter_id: inviterId,
    email,
    role_id: roleId,
    token, // Lo guardamos sin hashear para simplificar la búsqueda (es un uuid aleatorio seguro)
    status: 'pending',
    expires_at: expiresAt,
  });

  // 6. Enviar correo
  const inviteUrl = `${env.clientUrl}/invite?token=${token}`;
  
  await emailService.sendMail(
    email,
    `Invitación a unirte a ${project.name} en SigmaBuilder`,
    'project-invitation',
    {
      inviterName: `${inviter.first_name} ${inviter.last_name}`.trim(),
      projectName: project.name,
      roleName: role.name,
      inviteUrl,
      year: new Date().getFullYear()
    }
  );

  return { token };
};

/**
 * Obtiene los detalles de una invitación pendiente usando su token.
 * @param {string} token 
 */
const getInvitationInfo = async (token) => {
  const invite = await db('project_invitations as pi')
    .join('projects as p', 'p.id', 'pi.project_id')
    .join('users as u', 'u.id', 'pi.inviter_id')
    .join('roles as r', 'r.id', 'pi.role_id')
    .where({ 'pi.token': token, 'pi.status': 'pending' })
    .select(
      'pi.email',
      'p.name as project_name',
      'u.first_name as inviter_first_name',
      'u.last_name as inviter_last_name',
      'r.name as role_name',
      'pi.expires_at'
    )
    .first();

  if (!invite) {
    throw new AppError('Invitation not found or no longer valid', HTTP_STATUS.NOT_FOUND);
  }

  if (new Date(invite.expires_at) < new Date()) {
    throw new AppError('Invitation has expired', HTTP_STATUS.BAD_REQUEST);
  }

  return {
    email: invite.email,
    projectName: invite.project_name,
    inviterName: `${invite.inviter_first_name} ${invite.inviter_last_name}`.trim(),
    roleName: invite.role_name,
  };
};

/**
 * Acepta una invitación, vinculando al usuario al proyecto.
 * @param {string} token 
 * @param {object} user - Usuario autenticado (de req.user)
 */
const acceptInvitation = async (token, user) => {
  const invite = await db('project_invitations').where({ token, status: 'pending' }).first();

  if (!invite) {
    throw new AppError('Invitation not found or no longer valid', HTTP_STATUS.NOT_FOUND);
  }

  if (new Date(invite.expires_at) < new Date()) {
    throw new AppError('Invitation has expired', HTTP_STATUS.BAD_REQUEST);
  }

  if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new AppError('You can only accept invitations sent to your own email address', HTTP_STATUS.FORBIDDEN);
  }

  // Comprobar si ya es miembro para evitar duplicados
  const existingMember = await db('project_members')
    .where({ project_id: invite.project_id, user_id: user.id })
    .first();

  await db.transaction(async (trx) => {
    if (!existingMember) {
      await trx('project_members').insert({
        project_id: invite.project_id,
        user_id: user.id,
        role_id: invite.role_id,
      });
    } else {
      // Si ya era miembro, le actualizamos el rol si la invitación era para un rol distinto?
      // Por ahora no hacemos nada, solo marcamos la invitación como aceptada.
    }

    await trx('project_invitations')
      .where({ id: invite.id })
      .update({ status: 'accepted', updated_at: new Date() });
  });

  return { projectId: invite.project_id };
};

module.exports = {
  inviteUser,
  getInvitationInfo,
  acceptInvitation,
};
