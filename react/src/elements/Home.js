import React from 'react';
import {ArticleContainer, ArticleSample, ArticleList} from './ArticleContainer';

class Home extends React.Component {



    constructor(props){
        super(props);
    }



    render(){
        return (
            <div>
                <h3>Kedves Látogató!</h3>

                <p>Üdvözöllek az oldalamon, amit a like-ok elinflálódása ellen hoztam létre.
                Itt minden felhasználó összesen 10 like-al rendelkezik, melyeket szabadon átrakhat bármelyik bejegyzésre.</p>

                <p>Kedvelni egy bejegyzést arra rákattintva a hozzáfűz fül alatt tudsz.
                Ilyenkor egy új bejegyzést hozhatsz létre, ahol beállíthatod, hogy támogatod-e vagy sem az előzményben megadott cikket.
                Támogatás esetén 1 ponttal járulsz hozzá a kedvelt bejegyzéshez és az összes, a te bejegyzésed által szerzett pont nála is megjelenik.</p>
                <p>Ha nem támogatod, hanem csak hozzáfűzni valód van az adott bejegyzéshez, egy kedvelési lehetőséget ugyanúgy elhasználsz vele. Ilyenkor a te cikked pontjait nem kapja meg az előzmény.</p>
                
                <p>A lehetőségek felszabadítását a cikked szerkesztésénél a "védelem" jelölőnégyzet kihúzásával tudod megtenni.
                Ebben az esetben a cikked törlődik, ha kevesebb mint 100 támogatottsága, illetve pontja van.</p>
                <p>Amikor egy cikk törlődik, akkor az összes a cikk alá írt poszt is vele együtt távozik.</p>
                <p>Több mint 100 pont esetén a cikket sem az előbb említett módon törölni, sem módosítani nem lehet!</p>

                <p>Fontos támogatni azokat a bejegyzéseket, amiket érdemesnek tartasz a fennmaradásra, mivel a szerzője nem biztos hogy védi a bejegyzését.
                A cikkek védelme 30 napig tart csak. Ezt a védelmet bármikor lehet frissíteni még 30 napra. Ennek célja, hogy véletlenül ottfelejtett elavult tartalmak ne maradjanak fenn.</p>
            </div>
        );
    }
}

export {Home};