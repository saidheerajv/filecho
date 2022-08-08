import React, { Component } from 'react';
import './App.css';
import 'semantic-ui-css/semantic.min.css';
import SimplePeer from 'simple-peer';
import firebase from './fb';
import QRCode from 'qrcode';
import 'bootstrap/dist/css/bootstrap-utilities.css';
import { isValidJSONString, randomId } from './utilities.js';


class FileCho extends Component {

  constructor(props) {
    super(props);
    this.state = { uuid: '' };
    this.Conn = {};
    this.Conns = [];
    this.uuid = "";
    this.input = React.createRef();
    this.recievedFiles = [];
    this.qrc = "";
    this.recievedSize = 0;

    this.currentFile = {
      "size": 0,
      "currentSize": 0,
      "contentArr": [],
      "name": ""
    };

    this.isValidJSONString = isValidJSONString;
    this.randomId = randomId;

  }
  componentDidMount() {

    let cid = window.location.pathname.replace(/[^0-9 ]/g, "");
    if (cid != null && cid != undefined && cid.length == 4) {
      this.uuid = cid;
      this.joinConn();
    } else {
      let rid = this.randomId()
      this.createConn(rid);
    }

    this.setState(prevState => ({ recPercentage: 0 }));

  }

  myChangeHandler = (event) => {
    this.uuid = event.target.value;
  }

  createConn = (uuid) => {

    var docRef = firebase.firestore().collection("connections").doc(uuid);

    this.Conn = new SimplePeer({
      initiator: true,
      trickle: false
    });

    this.Conn.on('signal', data => {

      docRef.set({
        "uuid": uuid,
        "signal": JSON.stringify(data),
        "status": "INITIATED"
      }).then(() => {

        QRCode.toDataURL(window.location.href + uuid).then(url => {
          this.qrc = url;
          this.uuid = uuid;

          this.setState({ uuid: 'initiated' });

        }).catch(err => {
          console.error("Error Generating QR code");
          console.error(err);
        });

        docRef.onSnapshot((doc) => {
          var source = doc.metadata.hasPendingWrites ? "Local" : "Server";

          var data = doc.data();
          if (data.answer) {
            this.Conn.signal(JSON.parse(data.answer));
          }
        });

      }).catch((error) => {
        console.error("Error writing document: ", error);
      });
    });

    
    //On successful Connction
    this.Conn.on('connect', () => {
      this.setState({ uuid: 'connected' });
      this.Conns.push(this.Conn);


      //Onsuccessful connection create a new connection 


    this.Conn.on('signal', data => {

      docRef.set({
        "uuid": uuid,
        "signal": JSON.stringify(data),
        "status": "INITIATED"
      }).then( (s) => {
        console.log("Created new connection");
      });


    });


      // docRef.set({
      //   "status": "SUCCESS"
      // }).then(() => {

      // });

    });



    this.Conn.on('data', data => {
      this.recieveFile(data);
    });

    this.Conn.on('error', (err) => {
      console.log(err);
      docRef.set({
        "status": "ERROR"
      }).then(() => {

      });
    });




  }

  //End of createConn

  joinConn = () => {


    var docRef = firebase.firestore().collection("connections").doc(this.uuid);

    let conn = new SimplePeer();

    docRef.get().then((doc) => {
      if (doc.exists) {
        var data = doc.data();
        conn.signal(JSON.parse(data.signal));
        conn.on('signal', data => {
          docRef.set({
            "uuid": this.state.uuid,
            "answer": JSON.stringify(data)
          });
        });
      } else {

        this.setState(prevState => ({ error: "Error connecting, Please try with a different connection ID." }));

      }
    }).catch((error) => {

      console.log("Error getting document:", error);
      this.setState(prevState => ({ error: "Error connecting, Please try with a different connection ID." }));

    });



    conn.on('connect', () => {

      // let secondaryConn = new SimplePeer({
      //   initiator: true,
      //   trickle: false
      // });
  
      // secondaryConn.on('signal', data => {
  
      //   docRef.set({
      //     "uuid": this.uuid,
      //     "signal": JSON.stringify(data),
      //     "status": "INITIATED"
      //   }).then(() => {
      //   console.log("created new conn");

      //   docRef.onSnapshot((doc) => {
      //     // var source = doc.metadata.hasPendingWrites ? "Local" : "Server";

      //     var data = doc.data();
      //     if (data.answer) {
      //       secondaryConn.signal(JSON.parse(data.answer));
      //     }
      //   });

      //   });


      // });

      this.Conn = conn;
      this.setState({ uuid: 'connected' });

      this.Conn.on('data', data => {
        this.recieveFile(data);
      });

      this.Conn.on('error', (err) => {
        console.log(err);
      });

    });



  }


  fileSelected = () => {
    let fileList = this.state.toSendFileList || new Array();
    for (let i = 0; i < this.input.current.files.length; i++) {
      let fts = this.input.current.files[i];
      // console.log(fts);


      fileList.push(fts);
    }

    this.setState(prevState => ({ toSendFileList: fileList }));

  }

  addToRecievedFiles = (fr) => {

    fr.durl = URL.createObjectURL(new Blob(fr.contentArr, { type: fr.type }));

    // // let fts = this.input.current.files[0];
    let fileList = this.state.recievedFiles || new Array();
    fileList.push(fr);
    this.setState(prevState => ({ recievedFiles: fileList }));


  }

  sendfile = (index) => {

    if (this.state.sentPercentage > 0) {

    }

    this.setState(prevState => ({ sendingFileLoaderIndex: index }));
    this.setState(prevState => ({ sentPercentage: 1 }));

    const chunkSize = 16384;
    var fileReader = new FileReader();
    let offset = 0;
    let fileToLoad = this.input.current.files[index];
    let objToSend = {
      "name": fileToLoad.name,
      "totalSize": fileToLoad.size,
      "currentSize": 0,
      "type": fileToLoad.type,
    };

    try {

      this.Conn.send(JSON.stringify(objToSend)); //Sending file details
      fileReader.addEventListener('error', error => console.error('Error reading file:', error));
      fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
      fileReader.addEventListener('load', e => {
        offset += e.target.result.byteLength;
        this.Conn.send(e.target.result);

        if (offset < fileToLoad.size) {
          readSlice(offset);
          this.setState(prevState => ({ sentPercentage: ((offset / fileToLoad.size) * 100).toFixed(0) }));
        } else {
          console.log("Sending finished");

          let fileList = this.state.toSendFileList;
          fileList.splice(index, 1);
          this.setState(prevState => ({ toSendFileList: fileList }));
          this.setState(prevState => ({ sendingFileLoaderIndex: null }));
          this.setState(prevState => ({ sentPercentage: 0 }));

        }

      });

      const readSlice = (o) => {
        const slice = fileToLoad.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
      };
      readSlice(0);
    } catch (e) {
      console.log(e);
      this.setState(prevState => ({ error: "Encountered an Error while sending file, Please try again !" }));
    }


  }

  recieveFile = (fileObj) => {


    if (this.isValidJSONString(fileObj)) {
      console.log("Valid JSON");
      fileObj = JSON.parse(fileObj);
      this.currentFile.name = fileObj.name;
      this.currentFile.type = fileObj.type;
      this.currentFile.size = fileObj.totalSize;

      this.currentFile.currentSize = 0;
      this.currentFile.contentArr = [];

      console.log(this.currentFile);

    } else {
      this.currentFile.contentArr.push(fileObj);
      this.currentFile.currentSize = this.currentFile.currentSize + fileObj.byteLength;
    }

    if (this.currentFile.currentSize >= this.currentFile.size) {

      this.addToRecievedFiles({ ...this.currentFile });
      console.log("adding to list - " + this.currentFile.name);
      this.setState(prevState => ({ recPercentage: 0 }));


    } else {
      // console.log(this.currentFile.currentSize, this.currentFile.size);
      this.setState(prevState => ({ recPercentage: ((this.currentFile.currentSize / this.currentFile.size) * 100).toFixed(0) }));
    }

  }


  closeConn = () => {
    window.location.href = "https://filecho.com";
  }



  render() {
    return (
      <div>

        <div className="ui container mt-3 mt-md-5">

          {(this.state.error) && (
            <div class="ui negative message">

              <div class="header">
                Error
              </div>

              <p> {this.state.error}</p>
            </div>
          )}

          {(this.state.uuid != 'connected') && (
            <div>
              <div class="ui icon info message">



                <i className="inbox icon d-none d-md-inline-block"></i>
                <div className="content">
                  <div className="" style={{ fontSize: "1.2rem", lineHeight: "2rem" }}>

                    Enter your connection ID (4 digit code below QR) in the other device and click "Connect" to establish the connection
                    <br />
                    <b>OR</b>
                    <br />
                    Enter the connectin ID from the device you want to connect to in the Connection ID field and click "Connect".

                  </div>
                </div>


              </div>
              <div className="ui placeholder segment">
                <div className="ui two column very relaxed stackable grid">

                  <div className="middle aligned column text-center">
                    <img src={this.qrc} alt="QR - code" className="mb-2 qr-image mx-auto" />
                    {(this.qrc.length < 1) && (
                      <div class="ui active inverted dimmer">
                        <div class="ui large text loader">Loading</div>
                      </div>
                    )}
                    {this.state.uuid === 'initiated' && (

                      <div className="text-center">
                        <h2 className="text-dark mt-2 mt-md-3"><b> {this.uuid} </b></h2>
                        <p className="my-1"> Scan the above QR code to connect </p>

                        <p className="ui blue my-2 my-md-3"> <u onClick={() => this.createConn(this.randomId())}><a href="" style={{ fontSize: "1.1rem" }}>Refresh</a> </u></p>
                      </div>

                    )}
                  </div>

                  <div className="middle aligned column ">
                    <div className="ui form">
                      <div className="field" style={{ maxWidth: "20rem" }}>
                        <label style={{ fontSize: "1.2em" }}>Connection ID</label>
                        <div className="ui big left icon input mt-2">
                          <input type="text" placeholder="Unique Id" placeholder="Connection ID" onChange={this.myChangeHandler} />
                          <i className="key icon"></i>
                        </div>
                      </div>

                      <div className="large ui right labeled icon blue button" style={{ maxWidth: "21rem" }} onClick={this.joinConn}>
                        <i class="right arrow icon"></i>
                        Connect
                      </div>
                    </div>
                  </div>

                </div>

                <div className="ui vertical divider d-none d-md-inline">
                  Or
                </div>


              </div>
            </div>
          )}

          <div className="container">
            <div className="row justify-content-center">
              <div className="col-6 mt-3">

                {(this.state.uuid === 'connected') && (
                  <div>
                    <div class="ui attached positive message">


                      <div class="ui equal width aligned grid">
                        <div class="row">
                          <div class="column">
                            <div class="header">
                              Connected successfully !
                            </div>
                            <p className="text-start">Connection ID : {this.uuid} </p>
                          </div>
                          <div class="column">
                            <p className="text-end"><button class="ui inverted red button" onClick={this.closeConn}> Disconnect </button></p>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div class="ui attached placeholder segment text-center">

                      <label for="file-upload" className="mt-4">

                        <div class="ui icon header">
                          <i class="upload icon text-secondary"></i>
                          <p class="mt-3 h4"> Click here to select files to send </p>
                        </div>
                      </label>
                      <input type="file" id="file-upload" className="d-none" multiple="multiple" onChange={this.fileSelected} ref={this.input} />


                      <div class="ui divided items text-start mt-4 mx-2 mx-md-5">



                        {(this.state.toSendFileList && this.state.toSendFileList.map((item, index) => {
                          return (

                            <div class="ui clearing segment">

                              <div className="">
                                <h4> {item.name} </h4>
                              </div>
                              <div className="">
                                <div className="ui medium purple basic label m-2 "> {(item.size / (1024 * 1024)).toFixed(2)} MB </div>
                                <div className="ui medium blue basic label m-2"> {item.type} </div>
                              </div>

                              <div className="ui right floated primary button" onClick={() => this.sendfile(index)}>
                                <i className='paper plane'></i>

                                {(this.state.sendingFileLoaderIndex != index) && (
                                  <i className="paper plane"></i>
                                )}

                                {this.state.sendingFileLoaderIndex != index ? " Send" : "Sending... "}
                                {(this.state.sentPercentage > 0 && this.state.sendingFileLoaderIndex == index) ? this.state.sentPercentage + " %" : ""}
                                {/* { (this.state.sentPercentage > 0 && this.state.sendingFileLoaderIndex != index) ? "Wait" : ""} */}

                              </div>
                            </div>


                          )
                        }))}


                      </div>

                    </div>

                    <div className="">
                      {/* <FileListContainer list={this.state.recievedFileList} /> */}


                      <div className="fileList my-2">
                        { (this.state.recievedFiles || this.state.recPercentage > 0) && (


                          <div className="ui placeholder segment">
                            <h3 class="ui header text-center">Received files </h3>

                            <div className="ui items text-start my-1 mx-0 mx-md-5">


                              {this.state.recPercentage > 0 && (

                                <div class="ui segment">

                                  <div class="ui fluid placeholder">
                                    <div class="image header">
                                      <div class="line"></div>
                                      <div class="line"></div>
                                    </div>
                                    <div class="paragraph">
                                      <div class="line"></div>
                                      <div class="line"></div>
                                      <div class="line"></div>
                                    </div>
                                  </div>
                                  {/* <div class="ui bottom attached progress" data-percent="70">
  <div class="bar"></div>
</div> */}
                                </div>


                              )}




                              {this.state.recievedFiles &&
                                this.state.recievedFiles.map((rfo, key) => {
                                  return (
                                    <div className="ui clearing segment my-2" data-index={key}>

                                      <div className="middle aligned content">
                                        <div className="header mx-2 mb-2">
                                          <h3>{rfo.name}</h3>
                                        </div>
                                        <div className="description">
                                          {/* <p> {fileObjze} / {fileObj.type} </p> */}
                                          <div class="ui medium blue basic label m-2"> {rfo.type} </div>
                                          <div class="ui medium purple basic label m-2 "> {(rfo.size / (1024 * 1024)).toFixed(2)} MB </div>

                                        </div>
                                        <div className="extra">
                                          <a className="ui right floated green button mx-2" href={rfo.durl} download>
                                            <i class="icon download"></i>  Download
                                          </a>

                                          <a className="ui right floated blue button mx-2" href={rfo.durl} target="_blank">
                                            <i class="icon external alternate"></i>  Open
                                          </a>

                                        </div>
                                      </div>
                                      {/* <div class="ui divider"></div> */}
                                    </div>
                                  )
                                }

                                )
                              }
                            </div>
                          </div>

                        )}
                      </div>
                    </div>
                  </div>

                )}

                {this.state.uuid === 'error' && (
                  <p className="alert alert-danger">Error occured please try again</p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* <HowTo  /> */}
      </div>

    );
  }
}

export default FileCho;
