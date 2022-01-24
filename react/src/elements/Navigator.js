import React from 'react';

class Navigator extends React.Component {

    static defaultNav = React.createRef();

    sequence = [];
    nextSequence = [];


    constructor(props){
        super(props);
        this.Open(<div></div>);
    }

    Start(element, title='null'){
        this.sequence=[];
        this.Open(element, title);
        this.nextSequence=[];
        this.forceUpdate();
    }

    Open(element, title='null'){
        this.sequence.push({element: element, title: title});
        this.nextSequence = [];
        this.forceUpdate();
    }

    NextAvailable(){return this.nextSequence.length>0}
    PrevAvailable(){return this.sequence.length>1}

    Previous(){
        if (this.PrevAvailable()){
            this.nextSequence.push(this.sequence.pop());
            this.forceUpdate();
        }
    }

    Next(){
        if (this.NextAvailable()){
            this.sequence.push(this.nextSequence.pop());
            this.forceUpdate();
        }
    }

    Jump(index){
        let temp = this.sequence.slice(index+1);
        this.sequence = this.sequence.slice(0,index+1);
        temp = temp.reverse();
        this.nextSequence = this.nextSequence.concat(temp);
        this.forceUpdate();
    }


    render(){
        return (
            <div>
                <button className={this.PrevAvailable()?'':'bg-secondary'} onClick={()=>{this.Previous();}}>Vissza</button>
                <button className={this.NextAvailable()?'':'bg-secondary'} onClick={()=>{this.Next();}}>Előre</button>
                {this.sequence.map((el, index)=>{
                    return <a role='button' onClick={()=>{this.Jump(index);}}>{' >>'+el.title}</a>;
                })}
                {this.sequence[this.sequence.length-1].element}
            </div>);}
}

export {Navigator};