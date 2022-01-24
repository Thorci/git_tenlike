import React from 'react';
import {PageContainer} from './PageContainer';
import {Home} from './Home';
import {Posts} from './Posts';
import {Users} from './Users';
import {UserContainer, UserLogin} from './UserContainer';
import { ArticleEditor } from './ArticleContainer';
import { User } from '../models/user';


class Main extends React.Component {


    ref= React.createRef();

    constructor(props){
        super(props);
        this.state= {
            logged: 0
        };
        
        User.loggedUser.addOnChangeMethod('main',()=>{if (this.state.logged!=User.loggedUser.logged)this.componentDidMount();User.loggedUser.result='';});
    }

    componentDidMount(){
        this.ref.current.ClearPages();

        this.ref.current.AddPage('Kezdőlap', <Home/>, User.loggedUser.result=='');
        this.ref.current.AddPage('Bejegyzések', <Posts/>);
        this.ref.current.AddPage('Tagok', <Users/>);
        if (User.loggedUser.user != ""){
           this.ref.current.AddPage('Új bejegyzés', <ArticleEditor/>, false);
            this.state.logged=1;
        }else{
            this.state.logged=0;
        }
        this.ref.current.AddPage('Profil', <UserLogin/>, User.loggedUser.result!='');
    }
    render(){        
        return (<PageContainer ref={this.ref}/>);
    }
}

export {Main};