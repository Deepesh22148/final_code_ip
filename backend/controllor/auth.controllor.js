import User from "../Models/user.model.js";

export const login = async(req, res) => {
    try{
        const {username , password} = req.body;
        const user = await User.findOne({username : username});

        console.log(user);
        if(!user){
            return res.status(400).send({
                "message" : "User doesn't exists"
            });
        }

        const originalPassword = user.password;
        if(originalPassword !== password){
            return res.status(400).send({
                "message" : "Password doesn't match"
            })
        }

        return res.status(200).send({
            "id": user.id,
            "message" : "User is now in the matrix!!"
        })


    }
    catch(err){
        console.log(err);
        return res.status(500).send({
            "message" : "DataBase Error kindly show patience"
        })
    }
}

export const signUp = async(req, res) => {
    try{
        const{username , password} = req.body;

        const user = await User.findOne({username : username});

        if(user){
            return res.status(400).send({
                "message" : "User already exists"
            });
        }

        const created = await User.create({username : username, password: password});
        console.log("User successfully created");

        return res.status(200).send({
            id : created.id,
            "message" : "User now exists in this binary world!"
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).send({
            "message" : "DataBase Error kindly show patience"
        })
    }
}
