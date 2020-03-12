'use strict';

const validated_json = require('./schema_json.js');

let req_validator = {};

req_validator.validate_req = (request, req_id) => {

    return (req, res, next) => {

        try{
            
            const req_query = req.query || {}
            const req_headers = req.headers || {}
            const req_body = req.body || {}
    
            const req_to_compare_query = validated_json[req_id].req_query
            const req_to_compare_header = validated_json[req_id].req_header
            const req_to_compare_body = validated_json[req_id].req_body
            
            //Validating req.headers
            for(const x of req_to_compare_header){
                if(!(x in req_headers)){
                    return res.status(400).send({req_validation_headers_missing:x});
                }
            }

            //Validation req.query
            for(const x of req_to_compare_query){
                if(!(x in req_query)){
                    return res.status(400).send({req_validation_query_missing:x});
                }
            }
        
            //Validation req.body
            const result = Compare(req_to_compare_body, req_body)
            if(result===true){
                return next()
            }else{
                const error_list=[]
                result.forEach((x)=>{
    
                    //generating trace
                    let error_message=""
                    x.source_trace.forEach((y)=>{
                        if(typeof (y) === "string"){
                            error_message = error_message+ "object_at_key:"+y.toString()+" >> "
                        }else{
                            error_message = error_message+ "array_at_index:"+y.toString()+" >> "
                        }
                    })
    
                    //appending affected key
                    if(x.index!==null){
                        error_message = error_message + " at "+x.index
                    }else{
                        error_message = error_message + "key_missing :"+x.target
                    }
                    error_list.push(error_message)
                })
                return res.status(400).send({req_validation_err_trace_in_body:error_list});
            }
        }catch(err){
            return next(err)
        }
    }
}

//used depth first search for comparision and tracing
var trace=[]
const Compare = (a,b) => {
        
    const error_list = []

    if ((Array.isArray(a)) && Array.isArray(b)) {
        if (a.length === b.length) {
            for (let j = 0; j < a.length; j++) {
                if (typeof (a[j]) === "object" && typeof (b[j]) === "object") {
                    trace.push(j)
                    const result = Compare(a[j], b[j])
                    if(Array.isArray(result)){
                        Array.prototype.push.apply(error_list,result)
                    }
                }else if(is_falsy(a[j])){
                        
                }else if (typeof (a[j]) === "number" && typeof (b[j]) === "number") {
                    //console.log(a[j], b[j])
                } else if (typeof (a[j]) === "string" && typeof (b[j]) === "string") {
                    //console.log(a[j], b[j])
                } else {
                    //console.log(error_list)
                    error_list.push({ source_trace:trace.slice(),source: a[j], target: b[j],index:j })
                }
            }
            trace.pop()
            return error_list.length===0?true:error_list
        }
    } else {

        if(is_falsy(a)) {
            trace.pop()
            return error_list.length===0?true:error_list;
        }

        const a_keys = Object.getOwnPropertyNames(a);
        const b_keys = Object.getOwnPropertyNames(b);

        if (a_keys.length != b_keys.length) {
            for(const a of a_keys){
                if(!b_keys.includes(a)){
                    error_list.push({ source_trace:trace.slice(),source: null, target: a,index:null })
                    break;
                }
            }
            return error_list.length===0?true:error_list
        }

        for (let i = 0; i < a_keys.length; i++) {
            const propName = a_keys[i];

            if ((typeof (a[propName]) === "object") && (typeof (b[propName]) === "object")) {
                trace.push(propName)

                const result = Compare(a[propName], b[propName])
                if(Array.isArray(result)){
                    Array.prototype.push.apply(error_list,result)
                }
            } else {
                if(is_falsy(a[propName])){
                    
                }else if (typeof (a[propName]) === "number" && typeof (b[propName]) === "number") {
                    //console.log(a[propName], b[propName])
                } else if (typeof (a[propName]) === "string" && typeof (b[propName]) === "string") {
                    //console.log(a[propName], b[propName])
                } else {
                    //using slice to get new array
                    error_list.push({ source_trace:trace.slice(),source: a[propName], target: b[propName],index:propName })
                }
            }
        }
        trace.pop()
        return error_list.length===0?true:error_list
    }
}
const is_falsy = (test)=>{
    if(test === null || test === undefined || (test!=test) || test ==="" ){         //(test!=test) is for isNaN test better than it
        return true
    }else{
        return false
    }
}
module.exports = req_validator;
