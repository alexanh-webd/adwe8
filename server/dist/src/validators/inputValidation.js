import { body } from 'express-validator';
const registerValidation = [
    body('email').trim().isLength({ min: 1 }).escape().isEmail(),
    body('password').isLength({ min: 8 }).withMessage("Password must be at least 8 chars long").matches(/[A-Z]/).withMessage("Password must contain a capital letter").matches(/[a-z]/).withMessage("Password must contain a lowercase letter").matches(/[0-9]/).withMessage("Password must contain a number").matches(/[\W]/).withMessage("Password must contain a special character"),
    body('username').trim().isLength({ min: 3, max: 25 }).escape(),
    body('isAdmin')
];
const loginValidation = [
    body('email').escape().isEmail(),
    body('password')
];
export { registerValidation, loginValidation };
//# sourceMappingURL=inputValidation.js.map