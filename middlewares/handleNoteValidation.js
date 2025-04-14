import { validationResult } from "express-validator";

export default function noteValidationHandler(req, res, next){

    let errs = validationResult(req);

    if(!errs.isEmpty()){
        return res.status(400).send(errs.array());
    }

    next();


}

