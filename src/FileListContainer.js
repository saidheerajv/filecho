import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css'



class FileListContainer extends Component {


  constructor(props) {
    super(props);
    props.list = [];
    this.state = {
      "recievedFiles": []
    };
  }



  render() {
    return (
      <div className="fileList my-2">
        {this.props.list.length > 0 && (


          <div className="ui placeholder segment">
            <h3 class="ui header text-center">Received files </h3>

            <div className="ui items text-start my-1 mx-0 mx-md-5">

              {this.props.list.length > 0 &&
                this.props.list.map((fileObj, index) => 
                  <div className="ui clearing segment my-2" data-index={index}>

                    <div className="middle aligned content">
                      <div className="header">
                        <h4>{fileObj.name}</h4>
                      </div>
                      <div className="description">
                        {/* <p> {fileObjze} / {fileObj.type} </p> */}
                        <div class="ui medium blue basic label m-2"> {fileObj.type} </div>
                        <div class="ui medium purple basic label m-2 "> {(fileObj.size / (1024 * 1024)).toFixed(2)} MB </div>
                        
                      </div>
                      <div className="extra">
                        <a className="ui right floated green button mx-2" href={fileObj.durl} download>
                         <i class="icon download"></i>  Download
                        </a>

                        <a className="ui right floated blue button mx-2" href={fileObj.durl} target="_blank">
                         <i class="icon external alternate"></i>  Open
                        </a>

                      </div>
                    </div>
                    {/* <div class="ui divider"></div> */}
                  </div>

                )}
            </div>
          </div>
        )}
      </div>
    )
  }

}



export default FileListContainer;
