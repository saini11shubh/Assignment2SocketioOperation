
exports.saveData = (fname, lname, address, phone, login_id, password)=>{
    const createDocument = async () => {
        const data = new UserData({
            'first_name': fname,
            'last_name': lname,
            'phone_no': phone,
            'address': address,
            'loginId': login_id,
            'password': password
        })
        const result = await data.save();
        console.log(result)
    }
    createDocument();
}