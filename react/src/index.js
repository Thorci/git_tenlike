import React from 'react';
import ReactDOM from 'react-dom';
import { ArticleContainer } from './elements/ArticleContainer';
import { UserContainer } from './elements/UserContainer.js';
import {Main} from './elements/Main';
import {Navigator} from './elements/Navigator';
import {User} from './models/user';

let queryParams = new URLSearchParams(window.location.search);

User.GetLoggedUser();
User.loggedUser.addOnChangeMethod("LOGGEDUSER", ()=>{
  if (User.loggedUser.result!=''){
    alert(User.loggedUser.result);
  }});



ReactDOM.render(
  <Navigator ref={Navigator.defaultNav}/>,
  document.getElementById('root')
);

Navigator.defaultNav.current.Start(<Main key={'main'}/>, "Főoldal");

if (queryParams.get("article")!=null){
  Navigator.defaultNav.current.Open(<ArticleContainer articleID={parseInt(queryParams.get("article"))}/>, queryParams.get("article"));
}
/*
if (queryParams.get("user")!=null){
  ReactDOM.render(
    <UserContainer userID={queryParams.get("user")}/>,
    document.getElementById('root')
  );
}else{
  ReactDOM.render(
    <Main/>,
    document.getElementById('root')
  );
}
*/

