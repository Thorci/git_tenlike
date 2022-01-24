class Article{
    static HOST = '../../api/post.php'
    static articles = {};
 
    _onChangeList = {};

    id = 0;


    constructor(id){
        if (typeof(id)!="undefined")
            this.id = id;
    }

//Cikkek kezelése
    static getArticle(id){
        if (typeof(Article.articles[id]) == 'undefined'){
            Article.articles[id] = new Article(id);
        }
        return Article.articles[id];
    }
    static clearArticleList(){
        for (var key in Article.articles) {
            delete Article.articles[key];
        }
    }




















//Cikk adatok lekérdezése
    _getData(request){this._sendRequest("GET", Article.HOST+`?request=${request}&id=${this.id}`);}
    _Get(data, def)           {if (typeof(this[data])=="undefined")     {this[data] = def;      this._getData(data);}      return this[data];}

    GetBasicData()      {
        if (typeof(this['basic'])=='undefined'){
            this['title']='';
            this['publisher']='';
            this['score']=0;
            this['created']='';
            this['keep_alive']=0;
            this['category']='';
        }
        return this._Get('basic','');
    }
    GetContent()        {return this._Get('content','');}
    GetDescription()    {return this._Get('description', '');}
    GetChildren()       {return this._Get('children', []);}
    GetLabels()         {return this._Get('labels', []);}
    GetAllData()        {this._getData("all");}
    GetCategories()     {return this._Get("categories",[]);}




//Cikk műveletek
    _postData(data){this._sendRequest("POST", Article.HOST, data);}

    NewPost(title, parentID, keepAlive) {this._postData({action:"new", title: title, parent_id: parentID, keep_alive: keepAlive});}
    SetProtect()                        {this._postData({action:"protect", id: this.id});}
    UnsetProtect()                      {this._postData({action:"unprotect", id: this.id});}
    SetDescription(description)         {this._postData({action:"setdescription", id: this.id, description: description});}
    SetContent(content)                 {this._postData({action:"setcontent", id: this.id, content: content});}
    AddLabel(label)                     {this._postData({action:"addlabel", id: this.id, label: label});}
    DeleteLabel(label)                  {this._postData({action:"deletelabel", id: this.id, label: label});}

    SetCategory(category)               {this._postData({action:"setcategory", id: this.id, category: category});}
    SetEmoticon(emoticon)               {this._postData({action:"setemoticon", id: this.id, emoticon: emoticon});}
    SetTitle(title)                     {this._postData({action:"settitle", id: this.id, title: title});}













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
    static getArticles(url, callback){
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


export {Article};