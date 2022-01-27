class User{
    static HOST = '../../api/user.php'
    static users = {};

    static loggedUser = new User('');
 
    _onChangeList = {};

    user = '';
    result='';
    logged= 0;


    constructor(user){
        this.user = user;
    }

//Felhasználók kezelése
    static getUser(id){
        if (id == User.loggedUser.user) return User.loggedUser;
        if (typeof User.users[id] == 'undefined'){
            User.users[id] = new User(id);
        }
        return User.users[id];
    }
    static clearUserList(){
        for (var key in User.users) {
            delete User.users[key];
        }
    }


//Kérésindítók
    _getData(request){this._sendRequest("GET", User.HOST+`?request=${request}&user=${this.user}`);}
    _postData(data){this._sendRequest("POST", User.HOST, data);}
    _Get(data, def)           {if (typeof(this[data])=="undefined")     {this[data] = def;      this._getData(data);}      return this[data];}

//Felhasználói adatok lekérdezése
    GetBasicData()      {return this._Get('basic','');}
    GetAllData()        {this._getData("all");}
    GetProfile()        {return this._Get('profile','');}
    GetDescription()    {return this._Get('description','');}
    static GetIMG(user) {return User.HOST+'?request=img&user='+user;}




//Felhazsnálói műveletek
    static Login(user, pw)                  {User.loggedUser._postData({action:"login", password: pw, user: user});}
    static Registration(user, email, pw)    {User.loggedUser._postData({action:"registration", password: pw, user: user, email: email});}
    static Logout()                         {User.loggedUser._postData({action:"logout"});}
    static GetLoggedUser()                  {User.loggedUser._getData("logged");}
    static Subscribe(subscribe)             {User.loggedUser._postData({action:"subscribe", subscribe: subscribe});}
    static Unsubscribe(subscribe)           {User.loggedUser._postData({action:"unsubscribe", subscribe: subscribe});}
    static SetProfile(profile)              {User.loggedUser._postData({action:"setprofile", profile: profile});}
    static SetPassword(password, newPassword)            {User.loggedUser._postData({action:"setpassword", password: password, newpassword: newPassword});}
    static SetDescription(description)      {User.loggedUser._postData({action:"setdescription",description: description});}
    static Delete(password)                 {User.loggedUser._postData({action:"delete", password: password});}
    static UploadProfileIMG(imgfile)        {User.loggedUser._postData({action:"uploadimg", img: imgfile});}
    static DeleteProfileIMG()               {User.loggedUser._postData({action:"deleteimg"});}
    static passwordRecoveryRequest(user)    {User.loggedUser._sendRequest("GET", User.HOST+'?request=passwordrecoveryrequest&user='+user);}










    //SetProfile
    //Subscribe
    //unscribe













//Lekérdezés- és változás kezelő
    _onChange(data){
        for (var key in this._onChangeList) {
            this._onChangeList[key](data);
        }
    };
    addOnChangeMethod(id, callback){
        this._onChangeList[id] = callback;
    }
    deleteOnChangeMethod(id){
        delete this._onChangeList[id];
    }
    _sendRequest(type, url, send){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
                    let data = JSON.parse(xmlHttp.responseText);
                    Object.assign(this, data);
                    this._onChange(data);
                }
            }.bind(this);
        xmlHttp.open(type, url, true);
        let formData = new FormData();
        if (typeof(send)!='undefined')
            Object.keys(send).forEach(key => formData.append(key, send[key]));
        xmlHttp.send(formData);
    }




















//Cikkek keresése, a modellen módosításokat nem végez
    static getUsers(url, callback){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
                    let data = JSON.parse(xmlHttp.responseText);
                    callback(data);
                }
            }.bind(null, callback);
        xmlHttp.open('GET', url, true);
        xmlHttp.send();
    }





}


export {User};