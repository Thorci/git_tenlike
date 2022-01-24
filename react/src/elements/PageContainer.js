import React from 'react';

class PageContainer extends React.Component {
  

  static IDgen = 0;
  pages = [];

  constructor(props){
    super(props);
  }

  ClearPages(){
    this.pages=[];
    this.forceUpdate();
  }
  AddPage(title, content=null, def=false, onclick=null){
    let disabled = content == null;
    this.pages.push({
            id: PageContainer.IDgen++,
            title: title,
            content: disabled ? "Nincsen megjeleníthető tartalom." : content,
            default: def,
            disabled: disabled,
            onclick: onclick
        });
    this.forceUpdate();
  }
  renderButtons(){
    return (
      <ul className="nav nav-tabs">
        {
          this.pages.map((el)=>{
              return (
                <li className="nav-item" onClick={el.onclick}>
                  <a className={"nav-link"+(el.disabled?" disabled":"")+(el.default?' active':'')} data-bs-toggle="tab" href={"#nav-"+el.id}>{el.title}</a>
                </li>
              )
            }
          )
        }
      </ul>
    );
  }
  renderContents(){
    return (
      <div id="myTabContent" className="tab-content">
        {
          this.pages.map((el)=>{
              return  (
                <div className={"tab-pane fade"+(el.default?" show active":"")} id={"nav-"+el.id}>
                  {el.content}
                </div>
              );
            }
          )
        }
      </div>
    );
  }
  render(){
    return (
      <div>
        {this.renderButtons()}
        {this.renderContents()}
      </div>
    );
  }
}

export {PageContainer};