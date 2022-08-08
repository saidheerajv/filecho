import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap-utilities.css';
import 'semantic-ui-css/semantic.min.css';

class HowTo extends Component {

   render() {
      return (

         <div className="ui container" id="howto">

            <div class="ui segments">
               <div class="ui segment">
                  <div class="ui massive steps">
                     <div class="step">
                        <i class="truck icon"></i>
                        <div class="content">
                           <div class="title">Shipping</div>
                        </div>
                     </div>
                     <div class="active step">
                        <i class="payment icon"></i>
                        <div class="content">
                           <div class="title">Billing</div>
                        </div>
                     </div>
                  </div>
               </div>
               <div class="ui segment">
                  <div class="ui massive steps">
                     <div class="step">
                        <i class="truck icon"></i>
                        <div class="content">
                           <div class="title">Shipping</div>
                        </div>
                     </div>
                     <div class="active step">
                        <i class="payment icon"></i>
                        <div class="content">
                           <div class="title">Billing</div>
                        </div>
                     </div>
                  </div>
               </div>

         </div>
         </div>

      )
   }

}
export default HowTo;
