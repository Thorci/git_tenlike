import React from 'react';
import {PageContainer} from './PageContainer';
import {UserList} from './UserContainer';
import {User} from '../models/user.js';


class Users extends React.Component {

    constructor(props){
        super(props);
        this.state= {
            ref: React.createRef(),
            refPopular: React.createRef(),
            refFollows: React.createRef(),
            refBurn: React.createRef(),
            refMyPosts: React.createRef(),
            refSearch: React.createRef(),
            refRecommend: React.createRef()
        };
        
        User.loggedUser.addOnChangeMethod('users',()=>{this.componentDidMount()});
    }
    


    componentDidMount(){
        this.state.ref.current.ClearPages();

        this.state.ref.current.AddPage('Népszerű',        <UserList ref={this.state.refPopular}/>, true,   ()=>{User.getUsers(User.HOST+"/?request=popular",     (data)=>{this.state.refPopular.current.setState({users:data});});});
        User.getUsers(User.HOST+"/?request=popular", (data)=>{if (this.state.refPopular.current!=null) this.state.refPopular.current.setState({users:data});});
        this.state.ref.current.AddPage('Feltörekvő',      <UserList ref={this.state.refBurn}/>,    false,  ()=>{User.getUsers(User.HOST+"/?request=burn",     (data)=>{this.state.refBurn.current.setState({users:data});});});
        if (User.loggedUser.user != ""){
            this.state.ref.current.AddPage('Követed',     <UserList ref={this.state.refFollows}/>, false,   ()=>{User.getUsers(User.HOST+"/?request=followed",     (data)=>{this.state.refFollows.current.setState({users:data});});});
            this.state.ref.current.AddPage('Ajánlott',    <UserList ref={this.state.refRecommend}/>, false, ()=>{User.getUsers(User.HOST+"/?request=recommend",    (data)=>{this.state.refRecommend.current.setState({users:data});});});
        }
        this.state.ref.current.AddPage('Keresés',  <UserSearch/>);
    }

    render(){        
        return (<PageContainer ref={this.state.ref}/>);
    }
}




class UserSearch extends React.Component{
    static user = new User();
    static inputs={
        inputText: '',
        inputIn: ''
    };
    static result=[];
    static showResult = React.createRef();

    constructor(props){
        super(props);
        UserSearch.user.addOnChangeMethod('UserSearch', ()=>{this.forceUpdate()});
    }

    render(){
        return(
            <div>
                Keresés:
                <input  value={UserSearch.inputs.inputText} onChange={(e) => {UserSearch.inputs.inputText   = e.target.value; this.forceUpdate();}} placeholder='Keresett szöveg' type='text'/>
                <select value={UserSearch.inputs.inputIn}   onChange={(e) => {UserSearch.inputs.inputIn     = e.target.value; this.forceUpdate();}}>
                    <option value=''>Minden</option>
                    <option value='user'>Név</option>
                    <option value='description'>Leírás</option>
                    <option value='profile'>Profil</option>
                </select>

                <button onClick={()=>{
                    User.getUsers(User.HOST+"/?request=search&text="+UserSearch.inputs.inputText+"&in="+UserSearch.inputs.inputIn,    (data)=>{UserSearch.result=data; UserSearch.showResult.current.setState({users:data});});
                    }}>Keresés indítása</button>

                <UserList ref={UserSearch.showResult} users={UserSearch.result}/>
            </div>
        );
    }
}


export {Users};