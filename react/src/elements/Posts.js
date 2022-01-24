import React from 'react';
import {PageContainer} from './PageContainer';
import {ArticleContainer, ArticleSample, ArticleList} from './ArticleContainer';
import {Article} from '../models/article.js';
import { User } from '../models/user.js';


class Posts extends React.Component {

    constructor(props){
        super(props);
        this.state= {
            ref: React.createRef(),
            refPopular: React.createRef(),
            refFollows: React.createRef(),
            refBurn: React.createRef(),
            refMyPosts: React.createRef(),
            refSearch: React.createRef(),
            refFresh: React.createRef(),
            refRecommend: React.createRef()
        };
        
        User.loggedUser.addOnChangeMethod('posts',()=>{this.componentDidMount()});
    }
    


    componentDidMount(){
        this.state.ref.current.ClearPages();
        this.state.ref.current.AddPage('Népszerű',<ArticleList ref={this.state.refPopular}/>,true,()=>{Article.getArticles(Article.HOST+"/?request=popular",(data)=>{this.state.refPopular.current.setState({articles:data});});});        
        Article.getArticles(Article.HOST+"/?request=popular",(data)=>{if (this.state.refPopular.current!=null)this.state.refPopular.current.setState({articles:data});});
        this.state.ref.current.AddPage('Feltörekvő',    <ArticleList ref={this.state.refBurn}/>,    false,  ()=>{Article.getArticles(Article.HOST+"/?request=burn",         (data)=>{this.state.refBurn.current.setState({articles:data});});});
        this.state.ref.current.AddPage('Újak',          <ArticleList ref={this.state.refFresh}/>,    false,  ()=>{Article.getArticles(Article.HOST+"/?request=fresh",       (data)=>{this.state.refFresh.current.setState({articles:data});});});
        if (User.loggedUser.user != ""){
            this.state.ref.current.AddPage('Követed',   <ArticleList ref={this.state.refFollows}/>,     false,  ()=>{Article.getArticles(Article.HOST+"/?request=follow",       (data)=>{this.state.refFollows.current.setState({articles:data});});});
            this.state.ref.current.AddPage('Ajánlott',  <ArticleList ref={this.state.refRecommend}/>,   false,  ()=>{Article.getArticles(Article.HOST+"/?request=recommend",    (data)=>{this.state.refRecommend.current.setState({articles:data});});});
            this.state.ref.current.AddPage('Saját', <ArticleList ref={this.state.refMyPosts}/>, false,  ()=>{Article.getArticles(Article.HOST+"/?request=myposts",   (data)=>{this.state.refMyPosts.current.setState({articles:data});});});
        }
        this.state.ref.current.AddPage('Keresés',  <PostSearch/>);


    }

    render(){        
        return (<PageContainer ref={this.state.ref}/>);
    }
}



class PostSearch extends React.Component{
    static article = new Article();
    static inputs={
        inputText: '',
        inputIn: '',
        inputCategory: '',
        inputLabels: '',
        inputSort: 'score',
        inputDirection: 'desc'
    };
    static result=[];
    static showResult = React.createRef();

    constructor(props){
        super(props);
        PostSearch.article.addOnChangeMethod('PostSearch', ()=>{this.forceUpdate()});
    }

    render(){
        return(
            <div>
                Keresés:
                <input  value={PostSearch.inputs.inputText} onChange={(e) => {PostSearch.inputs.inputText   = e.target.value; this.forceUpdate();}} placeholder='Keresett szöveg' type='text'/>
                <select value={PostSearch.inputs.inputIn}   onChange={(e) => {PostSearch.inputs.inputIn     = e.target.value; this.forceUpdate();}}>
                    <option value=''>Minden</option>
                    <option value='title'>Cím</option>
                    <option value='description'>Leírás</option>
                    <option value='content'>Tartalom</option>
                </select>
                szerint
                <select value={PostSearch.inputs.inputCategory} onChange={(e) => {PostSearch.inputs.inputCategory = e.target.value; this.forceUpdate();}}>
                    <option value=''>Összes</option>
                    {PostSearch.article.GetCategories().map((el)=>{return (<option value={el}>{el}</option>);})}
                </select>
                Kategóriában,
                <input value={PostSearch.inputs.inputLabels} onChange={(e) => {PostSearch.inputs.inputLabels = e.target.value; this.forceUpdate();}} placeholder='Címkék' type='text'/>
                címkékkel,
                Rendezés
                <select value={PostSearch.inputs.inputSort} onChange={(e) => {PostSearch.inputs.inputSort = e.target.value; this.forceUpdate();}}>
                    <option value='score'>Pontszám</option>
                    <option value='date'>Dátum</option>
                    <option value='publisher'>Közzétevő neve</option>
                    <option value='title'>Cím</option>
                </select>
                alapján
                <select value={PostSearch.inputs.inputDirection} onChange={(e) => {PostSearch.inputs.inputDirection = e.target.value; this.forceUpdate();}}>
                    <option value='asc'>Növekvő</option>
                    <option value='desc'>Csökkenő</option>
                </select>
                Sorrendben
                <button onClick={()=>{
                    Article.getArticles(Article.HOST+"/?request=search&text="+PostSearch.inputs.inputText+"&in="+PostSearch.inputs.inputIn+"&category="+PostSearch.inputs.inputCategory+"&labels="+PostSearch.inputs.inputLabels+"&sort="+PostSearch.inputs.inputSort+"&direction="+PostSearch.inputs.inputDirection,    (data)=>{PostSearch.result=data; PostSearch.showResult.current.setState({articles:data});});
                    }}>Keresés indítása</button>

                <ArticleList ref={PostSearch.showResult} articles={PostSearch.result}/>
            </div>
        );
    }
}

export {Posts};