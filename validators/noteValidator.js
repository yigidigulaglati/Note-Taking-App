
import {body} from 'express-validator'

export default function validateNote(){

    return [
        body('title').exists().withMessage('Title must exist').bail()
        .isString().withMessage('Title must be string').bail()
        .trim()
        .notEmpty().withMessage('Title cant be empty').bail(),
        

        body('description').exists().withMessage('Description must exist').bail()
        .isString().withMessage('Description must be string').bail()
        .trim()
        .notEmpty().withMessage('Description cant be empty').bail()
    ]

}


