import React from 'react';
import {PageContainer} from './PageContainer';
import {Article} from '../models/article.js';
import {User} from '../models/user.js';
import {Navigator} from './Navigator';
import reactDom from 'react-dom';
import {UserContainer} from './UserContainer';


function ArticlePage(article){
    let result = [];
    result.push(<ArticleSample articleID={article.id}/>)
    result.push(<ArticleContent articleID={article.id}/>);
    result = <div>{result}</div>;
    return result;
}

class ArticleContainer extends React.Component {

    static ACID = 0;
    constructor(props){
        super(props);
        let ID = typeof(this.props.articleID) == "number" ? this.props.articleID : 0;
        this.state= {
            ACID: ArticleContainer.ACID++,
            parent: false,
            article: Article.getArticle(ID),
            ref: React.createRef(),
            refChildren: React.createRef()
        };
        this.state.article.addOnChangeMethod('AC'+this.state.ACID, (data)=>{if (typeof(data.result)=='undefined')this.componentDidMount()});
    }
    componentDidMount(){
        let article = this.state.article;

        //Szülő adatok lekérése
        if (typeof(article.parent_id)=='number' && this.state.parent==false){
            this.state.parent = Article.getArticle(article.parent_id);
            this.state.parent.addOnChangeMethod("AC"+this.state.ACID, (data)=>{this.componentDidMount();});
        }

        //Fülek létrehozása
        this.state.ref.current.ClearPages();
        this.state.ref.current.AddPage('Bejegyzés', ArticlePage(article), true);
        if (this.state.parent) this.state.ref.current.AddPage('Előzmény', ArticlePage(this.state.parent));
        if (article.GetChildren().length>0){
            this.state.ref.current.AddPage('Utózmány', <ArticleList ref={this.state.refChildren}/>, false, ()=>{this.state.refChildren.current.setState({articles:article.children})});
        }


        if (typeof(article.editable)!="undefined" && article.editable==true)
            this.state.ref.current.AddPage('Szerkeszt', <ArticleEditor key='ae1' articleID={this.state.article.id}/>);
        if (typeof(article.commentable)!="undefined" && article.commentable==true)
            this.state.ref.current.AddPage('Hozzáfűz', <ArticleEditor key='ae2' parentID={this.state.article.id}/>);
    }
    componentWillUnmount(){
        if (typeof(this.state.article.parent_id)=='number') this.state.parent.deleteOnChangeMethod("AC"+this.state.ACID);
        this.state.article.deleteOnChangeMethod('AC'+this.state.ACID);
    }
    render(){
        return (
            <PageContainer ref={this.state.ref}/>
        );
    }
}

class ArticleSample extends React.Component {
    static ASID = 0;
    constructor(props){
        super(props);
        let ID = typeof(this.props.articleID) == "number" ? this.props.articleID : 0;
        this.state= {
            ASID: ArticleSample.ASID++,
            article: Article.getArticle(ID)
        };
        this.state.article.addOnChangeMethod("AS"+this.state.ASID, ()=>{this.forceUpdate();});
        this.state.article.GetBasicData();
    }
    componentWillUnmount(){this.state.article.deleteOnChangeMethod("AS"+this.state.ASID);}
    render(){
        return (
            <div className="card border-secondary mb-3">
                <div className="card-header">
                    <img src={User.GetIMG(this.state.article.publisher)} height={30} width={30}></img>
                    <a role='button' className="w-25 p-3" onClick={()=>{UserContainer.OpenUserInNavigator(this.state.article.publisher)}}>{this.state.article.publisher}</a>
                    <a role='button' className="w-25 p-3 text-success">{this.state.article.score}</a>
                    <a role='button' className="w-25 p-3">{this.state.article.created}</a>
                    <a role='button' className="w-25 p-3">{this.state.article.keep_alive==1?"+1":""}</a>
                    <a role='button' className="w-25 p-3">{"Kategória: "+this.state.article.category}</a>
                </div>
                <div role="button" className="card-body" onClick={()=>{Navigator.defaultNav.current.Open(<ArticleContainer key={this.state.article.id} articleID={this.state.article.id}/>, this.state.article.title);}}>
                    <h4 className="card-title">{this.state.article.title}</h4>
                    <p className="card-text">{this.state.article.GetDescription()}</p>
                </div>
                <div class="d-flex flex-row bd-highlight mb-3">
                    {this.state.article.GetLabels().map((el)=>{return <div className="p-2 bd-highlight" role="button">{el}</div>;})}
                </div>
            </div>
        );
    }
}

class ArticleContent extends React.Component {
    static ACID2 = 0;
    constructor(props){
        super(props);
        let ID = typeof(this.props.articleID) == "number" ? this.props.articleID : 0;
        this.state= {
            ACID2: ArticleSample.ACID2++,
            article: Article.getArticle(ID)
        };
    }
    componentDidMount(){this.state.article.addOnChangeMethod("AC2"+this.state.ACID2, ()=>{this.forceUpdate();});}
    componentWillUnmount(){this.state.article.deleteOnChangeMethod("AC2"+this.state.ACID2);}
    render(){return (<div dangerouslySetInnerHTML={{__html: this.state.article.GetContent()}}/>);}
}



class ArticleList extends React.Component {
    constructor(props){
        super(props);
        this.props['articles'] = typeof(this.props.articles)=='undefined' ? [] : this.props['articles'];
        this.state = {
            articles: this.props.articles,
            max: 5,
            page: 0,
            show: []
        };
    }

    render(){
        let navigators = [];
        let disabled = this.state.page==0;
        navigators.push(
            <li className={"page-item "+(disabled?"disabled":"")} role={disabled?'':'button'} onClick={!disabled?()=>{this.setState({page: 0});}:null}>
                <a className="page-link">{"<<"}</a>
            </li>
        );
        navigators.push(
            <li className={"page-item "+(disabled?"disabled":"")} role={disabled?'':'button'} onClick={!disabled?()=>{this.setState({page: this.state.page-1});}:null}>
                <a className="page-link">{"<"}</a>
            </li>
        );

        let start = this.state.page<2 ? 0 : this.state.page-2;
    
        for (let p=start; p<=start+5; p++){
            disabled = p>=Math.ceil(this.state.articles.length/this.state.max);
            let actualPage = this.state.page == p ? "text-warning" : "";
            navigators.push(
                <li className={"page-item "+(disabled?"disabled ":"")} role={disabled?'':'button'} onClick={!disabled?()=>{this.setState({page: p});}:null}>
                    <a className={"page-link "+actualPage}>{p}</a>
                </li>
            );
        }
        

        disabled = this.state.page>=Math.ceil(this.state.articles.length/this.state.max-1);
        navigators.push(
            <li className={"page-item "+(disabled?"disabled":"")} role={disabled?'':'button'} onClick={!disabled?()=>{this.setState({page: this.state.page+1});}:null}>
                <a className="page-link">{">"}</a>
            </li>
        );
        navigators.push(
            <li className={"page-item "+(disabled?"disabled":"")} role={disabled?'':'button'} onClick={!disabled?()=>{this.setState({page: Math.floor(this.state.articles.length/this.state.max)-1});}:null}>
                <a className="page-link">{">>"}</a>
            </li>
        );

        navigators = <ul className="justify-content-center pagination pagination-sm">{navigators}</ul>

        this.state.show = this.state.articles.slice(this.state.max*this.state.page,this.state.max*(this.state.page+1));
        return (
            <div>
                {this.state.show.map((el)=>{return(<ArticleSample key={el} articleID={parseInt(el)}/>);})}
                {navigators}
            </div>
        );
    }
}
























class ArticleEditor extends React.Component {
    constructor(props){
        super(props);
        this.props.parentID = typeof(this.props.parentID) == "undefined" ? 0 : this.props.parentID;
        let article = typeof(this.props.articleID) == "undefined" ? new Article() : Article.getArticle(this.props.articleID);
        if (typeof(this.props.articleID) == "undefined") article['parent_id'] = this.props.parentID != 0 ? this.props.parentID : 0;
        this.state= {
            lastID: article.id,
            article: article,
            parentID: this.props.parentID,
            inputTitle: article.title,
            inputDescription:   article.id!=0?article.GetDescription():'',
            inputContent:       article.id!=0?article.GetContent():'',
            inputKeepalive: article.keepalive,
            inputProtect: article.protect==1?true:false,
            inputCategory: article.category,
            inputLabel: ''
        };
        this.state.article.addOnChangeMethod("editor", ()=>{this.forceUpdate();});
    }
    render(){
        let leftTime = Math.abs(Date.now()-Date.parse(this.state.article.protect_date));
        let leftDays = Math.round(30 - leftTime / (1000 * 60 * 60 * 24));

        let result = [];
        if (typeof(this.state.article.parent_id)=='undefined' || this.state.article.parent_id==null || this.state.article.parent_id==0) result.push(<h5>Nincs megadva előzmény.</h5>); else result.push(<ArticleSample articleID={this.state.article.parent_id}/>);

        if (this.state.article.id == 0){
            let keep = this.state.parentID == 0 ? 'd-none' : '';
            result.push(
                <div>                   
                    <div className="row">
                        <input className="form-control form-control-lg" value={this.state.inputTitle} onChange={(e) => {this.setState({inputTitle: e.target.value})}} type="text" placeholder="Title" id="inputLarge"/>
                        <div>
                            <input className={"form-check-input "+keep} type="checkbox" checked={this.state.inputKeepalive} onChange={(e) => {this.setState({inputKeepalive: e.target.checked});}} id="flexCheckDefault"/>
                            <label className={"form-check-label "+keep} for="flexCheckDefault">Támogatom</label>
                        </div>
                    </div>
                    <button onClick={()=>{
                        console.log(this.state.article);
                        this.state.article.NewPost(this.state.inputTitle,this.state.parentID,this.state.inputKeepalive?1:0);
                        this.state.inputProtect=true;
                        this.state.article.keep_alive=this.state.inputKeepalive?1:0;
                        this.state.article.description='';
                        }}>Létrehoz</button>
                    <p>{this.state.article.result}</p>
                </div>
                );
        }else{
            let keepalive= [];
            if (this.state.article.parent_id!=null && this.state.article.parent_id!=0)
                if (this.state.article.keep_alive==1) keepalive.push(<h5>Támogatod</h5>); else keepalive.push(<h5>Nem támogatod</h5>);
            result.push(
                <div className="form-group row">
                    <div className="row">
                        <div className="w-25 p-3">
                            <input className="form-check-input" type="checkbox" checked={this.state.inputProtect}
                                onChange={(e) => {
                                    if (e.target.checked == true) this.state.article.SetProtect();
                                    else{
                                        if (window.confirm("Leveszed a védelmet? Ha nincsen meg a megfelelő támogatottság, a cikk törlődni fog!")){
                                            this.state.article.UnsetProtect();
                                        }else{
                                            e.target.checked = true;
                                        }
                                    }
                                    this.setState({inputProtect: e.target.checked});
                                }}
                                id="flexCheckDefault2"/>
                            <label className="form-check-label" for="flexCheckDefault2">Védelem</label>
                            <button for="flexCheckDefault2" onClick={()=>{this.state.article.SetProtect()}}>Frissít</button>
                            {leftDays} Nap múlva lejár a védelem!
                        </div>
                        <div className="w-25 p-3 input-group">
                            <select value={this.state.inputCategory} onChange={(e) => {this.setState({inputCategory: e.target.value})}}>
                                <option value=''>Nincs</option>
                                {this.state.article.GetCategories().map((el)=>{return (<option value={el}>{el}</option>);})}
                            </select>
                            <button type="button" className="btn btn-primary" for="category" onClick={()=>{this.state.article.SetCategory(this.state.inputCategory);}}>Kategória mentése</button>
                        </div>
                        <div>
                            {keepalive}
                        </div>

 
                    </div>

                    <input className="form-control form-control-lg" value={this.state.inputTitle} onChange={(e) => {this.setState({inputTitle: e.target.value})}} type="text" placeholder="Title" id="inputLarge"/>
                    <button type="button" className="btn btn-primary" onClick={()=>{this.state.article.SetTitle(this.state.inputTitle);}}>Cím mentése</button>

                    <textarea placeholder="Description" value={this.state.inputDescription} onChange={(e) => {this.setState({inputDescription: e.target.value})}} className="form-control" rows="3"></textarea>
                    <button type="button" className="btn btn-primary" onClick={()=>{this.state.article.SetDescription(this.state.inputDescription);}}>Leírás mentése</button>
                    
                    <textarea placeholder="Content" value={this.state.inputContent} onChange={(e) => {this.setState({inputContent: e.target.value})}} className="form-control" rows="3"></textarea>
                    <button type="button" className="btn btn-primary" onClick={()=>
                        {
                            if (this.state.article.description=='') window.alert('Leírás nélkül nem lesz kereshető a cikk!');
                            this.state.article.SetContent(this.state.inputContent);
                        }}>Tartalom mentése</button>
                    
                    <div className="w-25 p-3 input-group">
                        <input type="text" className="form-control" placeholder="Label" value={this.state.inputLabel} onChange={(e) => {this.setState({inputLabel: e.target.value})}}></input>
                        <button type="button" className="btn btn-primary" onClick={()=>{this.state.article.AddLabel(this.state.inputLabel);this.state.article.GetLabels();this.setState({inputLabel: ""});}}>Címke hozzáadása</button>
                    </div>
                    <div class="d-flex flex-row bd-highlight mb-3">
                        {typeof(this.state.article.labels)!="undefined"?this.state.article.labels.map((el)=>{return(
                            <div className="p-2 bd-highlight"><a role="button">{el}</a><button onClick={()=>{this.state.article.DeleteLabel(el);this.state.article.GetLabels();}}><h5>X</h5></button></div>
                        );}):''}
                    </div>
                    <p>{this.state.article.result}</p>
                </div>
            );
        }
        return (
            <div>
                {result}
            </div>
        );
    }
}







export {ArticleContainer, ArticleSample, ArticleList, ArticleEditor};






