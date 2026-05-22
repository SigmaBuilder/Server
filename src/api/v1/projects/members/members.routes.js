/* Rutas de miembros. */

'use strict';

const { Router } = require('express');

const controller = require('./members.controller');

const { addMemberRules, updateMemberRules, inviteRules } = require('./members.validator');
const validate = require('../../../../middlewares/validate');
const authorize = require('../../../../middlewares/authorize');

const router = Router({ mergeParams: true });

router.get('/',           authorize('members:read'),   controller.getAll);
router.post('/',          authorize('members:invite'), addMemberRules, validate, controller.add);
router.post('/invite',    authorize('members:invite'), inviteRules, validate, controller.invite);
router.patch('/:userId',  authorize('members:update'), updateMemberRules, validate, controller.update);
router.delete('/:userId', authorize('members:remove'), controller.remove);

module.exports = router;