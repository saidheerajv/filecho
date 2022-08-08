import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Link } from 'react-router-dom';
import logo from "./logo.png";


class TopHeader extends Component {

  render() {
    return (

<div className="ui secondary pointing menu blue">
      
  <Link to="/" className="item white active">
      <img src={logo} />
    <h1 style={{margin : "0.2rem 0.5rem 0.3rem 0.2rem", fontSize : "2.5rem"}}>FileCho</h1>
  </Link>

  <div className="right menu d-none d-md-flex">
  <Link className="item secondary" to="/termsandconditions">Terms &amp; conditions</Link>    
  <Link className="item secondary" to="/privacypolicy">Privacy Policy</Link>    
  </div>
  <div class="ui compact right menu mt-4 mb-2 mx-2 d-inline d-md-none">
  <div class="ui simple dropdown mt-2">

<i className="bars icon h2 mx-2 mt-2 mb-0"></i>
    <div class="menu">
    <Link className="item secondary" to="/termsandconditions">Terms &amp; conditions</Link>    
  <Link className="item secondary" to="/privacypolicy">Privacy Policy</Link>    
    </div>
  </div>
</div>
</div>

    )
  }

}
export default TopHeader;
