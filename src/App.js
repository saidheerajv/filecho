import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams
} from "react-router-dom"
import FileCho from './FileCho';
import TermsAndCons from './TermsAndCons.js';
import PrivacyPolicy from './PrivacyPolicy';
import TopHeader from './TopHeader';


class App extends Component {

    render() {
        return (
            <div>

                <Router>
                    <TopHeader />
                    <div>

                        <Switch>

                            <Route exact path="/" component={FileCho}>
                                {/* <FileCho /> */}
                            </Route>

                            <Route exact path="/termsandconditions" component={TermsAndCons}>

                            </Route>
                            <Route exact path="/privacypolicy" component={PrivacyPolicy}>

                            </Route>

                            <Route exact path="/:cid">
                                <FileCho />
                            </Route>

                        </Switch>
                    </div>
                </Router>

                <div className="ui container mt-3 mt-md-5">

                    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6892616473710345"
                        crossorigin="anonymous"></script>
                    <ins className="adsbygoogle" style={{display:"block"}} data-ad-client="ca-pub-6892616473710345" data-ad-slot="7853593882"
                        data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({ });
                    </script>
                </div>

            </div>
        )
    }

}
export default App;

