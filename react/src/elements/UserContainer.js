import React from 'react';
import {PageContainer} from './PageContainer';
import {User} from '../models/user.js';
import {Article} from '../models/article.js';
import {ArticleList} from '../elements/ArticleContainer';
import {Navigator} from '../elements/Navigator';






class UserPage extends React.Component {
    static UPID = 0;
    constructor(props){
        super(props);
        let ID = typeof(this.props.userID) == "string" ? this.props.userID : '';
        this.state= {
            UPID: UserContainer.UPID++,
            user: User.getUser(ID)
        };
        this.state.user.addOnChangeMethod("UP"+this.state.UPID, (data)=>{this.forceUpdate();});
    }
    componentWillUnmount(){
        this.state.user.deleteOnChangeMethod("UP"+this.state.UPID);
    }
    render(){
        let result = [];
        result.push(<UserSample userID={this.state.user.user}/>);
        result.push(<div dangerouslySetInnerHTML={{__html: this.state.user.profile}}></div>);
        result = <div>{result}</div>;
        return result;
    }
}


class UserContainer extends React.Component {
    static OpenUserInNavigator(user){
        Navigator.defaultNav.current.Open(<UserContainer key={user} userID={user}/>, user);
    }
    static UCID = 0;
    constructor(props){
        super(props);
        let ID = typeof(this.props.userID) == "string" ? this.props.userID : '';
        this.state= {
            UCID: UserContainer.UCID++,
            user: User.getUser(ID),
            ref: React.createRef()
        };
        this.state.user.addOnChangeMethod("UC"+this.state.UCID, (data)=>{if (typeof(data.result)=='undefined')this.componentDidMount();});
        this.state.user.GetBasicData();
    }
    componentWillUnmount(){
        this.state.user.deleteOnChangeMethod("UC"+this.state.UCID);
    }
    render(){
        return (
            <PageContainer ref={this.state.ref}/>
        );
    }
    componentDidMount(){
        let user = this.state.user;
        //Fülek létrehozása
        this.state.ref.current.ClearPages();
        this.state.ref.current.AddPage('Profil', <UserPage userID={this.state.user.user}/>, true);
        let userArticles = React.createRef();
        this.state.ref.current.AddPage(
            'Bejegyzések',
            <ArticleList ref={userArticles}/>,
            false,
            ()=>{Article.getArticles(Article.HOST+"/?request=userarticles&user="+this.state.user.user, (data)=>{userArticles.current.setState({articles:data});});}
            );
        if (this.state.user.logged==1){
            this.state.ref.current.AddPage('Szerkesztés', <UserEditor/>, false);
            this.state.ref.current.AddPage('Kijelentkezés', "Kijelentkeztél", false, ()=>{User.Logout();});
        }
    }
}

class UserSample extends React.Component {
    static USID = 0;
    constructor(props){
        super(props);
        let ID = typeof(this.props.userID) == "string" ? this.props.userID : '';
        this.state= {
            USID: UserSample.USID++,
            user: User.getUser(ID)
        };
        this.state.user.addOnChangeMethod("US"+this.state.USID, (data)=>{this.forceUpdate();});
        this.state.user.GetBasicData();
        this.state.user.GetDescription();
    }
    componentWillUnmount(){
        this.state.user.deleteOnChangeMethod("US"+this.state.USID);
    }
    render(){
        let subscribe = [];
        if(User.loggedUser.user!=''){
            if (this.state.user.subscribed==0){
                subscribe.push(<a className='p-2' role="button" onClick={()=>{User.Subscribe(this.state.user.user);this.state.user._getData('basic');}}>Feliratkozás</a>);
            }else{
                subscribe.push(<a className='p-2' role="button" onClick={()=>{User.Unsubscribe(this.state.user.user);this.state.user._getData('basic');}}>Leiratkozás</a>);
            }
        }
        return (
            <div className="card border-warning mb-3">
                <div className="card-header d-flex flex-row">
                    <img src={User.GetIMG(this.state.user.user)} height={30} width={30}></img>
                    <div className='p-2' role='button' onClick={()=>{UserContainer.OpenUserInNavigator(this.state.user.user)}}>{this.state.user.user}</div>
                    {subscribe}
                    <div className='p-2'>{this.state.user.protects==''?'':'Védők: '+this.state.user.protects}</div>
                </div>
                <div role="button" className="card-body" onClick={()=>{UserContainer.OpenUserInNavigator(this.state.user.user)}}>
                    {this.state.user.description}
                </div>
            </div>
        );
    }
}




class UserList extends React.Component {
    constructor(props){
        super(props);
        this.props['users'] = typeof(this.props.users)=='undefined' ? [] : this.props['users'];
        this.state = {
            users: this.props.users,
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
            disabled = p>=Math.ceil(this.state.users.length/this.state.max);
            let actualPage = this.state.page == p ? "text-warning" : "";
            navigators.push(
                <li className={"page-item "+(disabled?"disabled ":"")} role={disabled?'':'button'} onClick={!disabled?()=>{this.setState({page: p});}:null}>
                    <a className={"page-link "+actualPage}>{p}</a>
                </li>
            );
        }
        

        disabled = this.state.page>=Math.ceil(this.state.users.length/this.state.max-1);
        navigators.push(
            <li className={"page-item "+(disabled?"disabled":"")} role={disabled?'':'button'} onClick={!disabled?()=>{this.setState({page: this.state.page+1});}:null}>
                <a className="page-link">{">"}</a>
            </li>
        );
        navigators.push(
            <li className={"page-item "+(disabled?"disabled":"")} role={disabled?'':'button'} onClick={!disabled?()=>{this.setState({page: Math.floor(this.state.users.length/this.state.max)-1});}:null}>
                <a className="page-link">{">>"}</a>
            </li>
        );

        navigators = <ul className="justify-content-center pagination pagination-sm">{navigators}</ul>

        this.state.show = this.state.users.slice(this.state.max*this.state.page,this.state.max*(this.state.page+1));
        return (
            <div>
                {this.state.show.map((el)=>{return(<UserSample key={el} userID={el}/>);})}
                {navigators}
            </div>
        );
    }
}


class UserLogin extends React.Component {
    constructor(props){
        super();
        this.state={
            inputLoginUser: '',
            inputLoginPW: '',
            inputRegUser: '',
            inputRegEmail: '',
            inputRegPW: '',
            inputRegRePW: ''
        }
        User.loggedUser.addOnChangeMethod('login',()=>{this.forceUpdate()});
    }
    render(){
        let result;
        if (User.loggedUser.user!=''){
            result = <UserContainer userID={User.loggedUser.user}/>;
        }else{
            let regButton = this.state.inputRegPW == this.state.inputRegRePW ? '' : 'text-danger disabled';
            result = 
                <div>
                    <ul>
                        <li><h4>Jelentkezz be!</h4></li>
                        <li><input type="text" value={this.state.inputLoginUser} onChange={(e) => {this.setState({inputLoginUser: e.target.value});}} placeholder="Felhasználónév"></input></li>
                        <li><input type="password" value={this.state.inputLoginPW} onChange={(e) => {this.setState({inputLoginPW: e.target.value});}} placeholder="Jelszó"></input></li>
                        <li><button onClick = {()=>{User.Login(this.state.inputLoginUser,this.state.inputLoginPW);}}>Bejelentkezés</button></li>
                        <li><button onClick = {()=>{User.passwordRecoveryRequest(this.state.inputLoginUser);}}>Elfelejtett jelszó</button></li>
                        <li><h4>Vagy regisztrálj!</h4></li>
                        <li><input type="text" value={this.state.inputRegUser}      onChange={(e) => {this.setState({inputRegUser: e.target.value});}} placeholder="Felhasználónév"></input></li>
                        <li><input type="text" value={this.state.inputRegEmail}     onChange={(e) => {this.setState({inputRegEmail: e.target.value});}} placeholder="Email"></input></li>
                        <li><input type="password" value={this.state.inputRegPW}    onChange={(e) => {this.setState({inputRegPW: e.target.value});}} placeholder="Jelszó"></input></li>
                        <li><input type="password" value={this.state.inputRegRePW}  onChange={(e) => {this.setState({inputRegRePW: e.target.value});}} placeholder="Ismét"></input></li>
                        <li><button className={regButton} onClick = {()=>{User.Registration(this.state.inputRegUser,this.state.inputRegEmail,this.state.inputRegPW);}}>Regisztrál</button></li>
                    </ul>
                </div>
        }
        return result;
    }
}

















class UserEditor extends React.Component {
    constructor(props){
        super(props);
        this.state= {
            user: User.loggedUser,
            inputDescription: User.loggedUser.description,
            inputProfile: User.loggedUser.profile,
            inputPassword: '',
            inputNewPassword: '',
            inputReNewPassword: '',
            inputDeletePassword: ''
        };
        User.loggedUser.addOnChangeMethod("editor", ()=>{
            this.state.inputDescription = User.loggedUser.description;
            this.state.inputProfile = User.loggedUser.profile;
            this.forceUpdate();});
        User.loggedUser.GetDescription();
        User.loggedUser.GetProfile();
    }
    render(){
        return (
            <div className="form-group row">
                <div className="form-group">
                    <input className="form-control" type="file" onChange={(e) => {this.setState({inputFile: e.target.files[0]})}}/>
                    <button onClick={()=>{if (typeof(this.state.inputFile)!='undefined')User.UploadProfileIMG(this.state.inputFile);else alert('Nincs fájl kiválasztva!');}}>Profilkép feltöltése</button>
                    <button onClick={()=>{if (window.confirm('Biztosan törlöd a profilképet?'))User.DeleteProfileIMG();}}>Profilkép eltávolítása</button>
                </div>

                <textarea placeholder="Description" value={this.state.inputDescription} onChange={(e) => {this.setState({inputDescription: e.target.value})}} className="form-control" rows="3"/>
                <button type="button" className="btn btn-primary" onClick={()=>{User.SetDescription(this.state.inputDescription);}}>Save Description</button>
                
                <textarea placeholder="Profile" value={this.state.inputProfile} onChange={(e) => {this.setState({inputProfile: e.target.value})}} className="form-control" rows="3"/>
                <button type="button" className="btn btn-primary" onClick={()=>{User.SetProfile(this.state.inputProfile);}}>Save Profile</button>
                
                <input placeholder="Password" type="password" value={this.state.inputPassword} onChange={(e) => {this.setState({inputPassword: e.target.value})}} className="form-control"/>
                <input placeholder="New password" type="password" value={this.state.inputNewPassword} onChange={(e) => {this.setState({inputNewPassword: e.target.value})}} className="form-control"/>
                <input placeholder="Repeat new password" type="password" value={this.state.inputReNewPassword} onChange={(e) => {this.setState({inputReNewPassword: e.target.value})}} className="form-control"/>
                <button type="button" className="btn btn-primary" onClick={()=>{if (this.state.inputReNewPassword==this.state.inputNewPassword) User.SetPassword(this.state.inputPassword, this.state.inputNewPassword); else alert('A jelszót hibásan ismételte meg!');}}>Change password</button>

                <input placeholder="Password" type="password" value={this.state.inputDeletePassword} onChange={(e) => {this.setState({inputDeletePassword: e.target.value})}} className="form-control"/>
                <button type="button" className="btn btn-primary" onClick={()=>{User.Delete(this.state.inputDeletePassword);}}>Delete account</button>
            </div>
        );
    }
}



















export {UserContainer, UserSample, UserList, UserLogin};






