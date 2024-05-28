import './App.css';
import SegmentCanvas from './components/SegmentCanvas.js';
import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import axios from 'axios';

// https://aprilescobar.medium.com/part-3-fabric-js-on-react-fabric-image-fromurl-4185e0d945d3

const App = () => {
    const [waitingID, setWaitingID] = useState('');
    const [backendURL, setBackendURL] = useState('http://35.203.124.234:5000');
    const [outputImg, setOutputImg] = useState('');
    const [outputImgPresent, setOutputImgPresent] = useState(false);
    const [segmentTarget, setSegmentTarget] = useState(''); // for auto-segmentation
    const [cBg, setCBg] = useState('');
    const [cFg, setCFg] = useState('');

    // canvas 1 is the background image, canvas 2 is the foreground image

    const updatecBg = (input) => {
      setCBg(input);
    }

    const updatecFg = (input) => {
      setCFg(input);
    }

    const getPositions = () => {
      if (typeof cBg !== "undefined") {
        console.log(cBg);
        console.log("cBg Size: ", cBg.width, cBg.height);

        cBg.getObjects().forEach(function(object) {
          // Object is bounding line
          if ("path" in object) {
            object.fill = 'red';
            console.log(object)
            console.log(object.toClipPathSVG())
            console.log(object.toSVG())
            console.log(object.toDatalessObject())
          }
          
          // Object is a foreground image
          else {
            console.log("Image URL: ", object._element.currentSrc);
            console.log("Coords: ", object.lineCoords);
          }
        });
      }

      if (typeof cFg !== "undefined") {
        console.log(cFg);
        console.log("cFg  Size: ", cFg.width, cFg.height);

        cFg.getObjects().forEach(function(object) {
          // Object is bounding line
          if ("path" in object) {
            object.fill = 'red';
            console.log(object)
            console.log(object.toClipPathSVG())
            console.log(object.toSVG())
            console.log(object.toDatalessObject())
          }
          
          // Object is a foreground image
          else {
            console.log("Image URL: ", object._element.currentSrc);
            console.log("Coords: ", object.lineCoords);
          }
        });
      }
    }
    
    const postAutoSegmentRequest = async () => {
        const client = axios.create({
            baseURL: backendURL + "/api",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": backendURL
            }
        });

        let data = {
            segment_type: 'auto',
            segment_target: segmentTarget,
            bg_image_url: cBg.backgroundImage._element.src,
            fg_image_url: cFg.backgroundImage._element.src,
        }

        console.log(data)

        try {
            const response = await client.post("/segment", data);
            // overlay the masks on the canvases for user feedback
            console.log("got a response!", response.data);
            let bg_mask = response.data.bg_mask;
            let fg_mask = response.data.fg_mask;

            bg_mask = bg_mask.blob();
            let bg_mask_url = URL.createObjectURL(bg_mask);
            console.log("bg mask url: ", bg_mask_url);
            fabric.Image.fromURL(bg_mask_url, function(img) {
                cBg.add(img);
                cBg.renderAll();
            });

            fg_mask = fg_mask.blob();
            let fg_mask_url = URL.createObjectURL(fg_mask);
            console.log("fg mask url: ", fg_mask_url);
            fabric.Image.fromURL(fg_mask_url, function(img) {
                cFg.add(img);
                cFg.renderAll();
            });

            // TODO:
            // - make the masks translucent to see the image underneath
            // - allow the user to markup the image as usual (optional), we send this to the main endpoint
            // with the autogenerated masks
            // - on the backend (main endpoint), we turn the user SVG into it's own mask, and union it with the autogenerated mask
            // - this doesn't fix *removing* parts of the mask. This is out of scope for now
        } catch (err) {
            console.error("Error with segmentation API call:", err);
            throw err;
        }
    }

    const postDataFull = async () => {
      console.log(cBg);
      console.log(cFg);
      if (typeof cBg == "undefined" || typeof cFg == "undefined") {
        return;
      }

      console.log("Sending post request to backend");
      const client = axios.create({
        baseURL: backendURL + "/api",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": backendURL
        }
      });

      let urls = [];
      let coords = [];
      let paths1 = [];
      let paths2 = [];

      cBg.getObjects().forEach(function(object) {
        if ("path" in object) {
          paths1.push(object.toSVG());
        } else {
          urls.push(object._element.currentSrc);
          coords.push(object.lineCoords)
        }
      });

      cFg.getObjects().forEach(function(object) {
        if ("path" in object) {
          paths2.push(object.toSVG());
        } else {
          urls.push(object._element.currentSrc);
          coords.push(object.lineCoords)
        }
      });

      let data = null;

      if (segmentTarget != '') {
        data = {
          segment_type: 'auto',
          segment_target: segmentTarget,
          bg_image_url: cBg.backgroundImage._element.src,
          fg_image_url: cFg.backgroundImage._element.src,
        }
      } else {
        data = {
          segment_type: 'user',
          bg_image_url: cBg.backgroundImage._element.src,
          fg_image_url: cFg.backgroundImage._element.src,
          bg_path: paths1[0],
          fg_path: paths2[0]
        }
      }

      console.log(data)

      try {
        const response = await client.post("/in_fill", data);        
        setOutputImg(`data:image/jpeg;base64,${response.data.image}`);

        console.log("got a response!", response.data);
	      setOutputImgPresent(true);
        setWaitingID(response.data.id);
      } catch (err) {
        console.error("Error posting data:", err);
        throw err;
      }
    }

    return(
      <div class="container">
        <p>The only buttons you'll ever need</p>
	<input type="text" value={backendURL} onChange={e => setBackendURL(e.target.value)}></input>
        <button onClick={() => postDataFull()}>Post Data</button>
        <button onClick={() => getPositions()}>Get All Positions</button>
        <br></br>
        <p>Segment Target: </p><input 
              type="text" 
              value={segmentTarget} 
              onChange={ e => setSegmentTarget(e.target.value) } 
        />
        <div>
          {outputImgPresent ? (<div><img src={outputImg}/></div>) : (<div></div>)}
        </div>
        <SegmentCanvas cid={"bg"} updateCanvas={updatecBg}/>
        <SegmentCanvas cid={"fg"} updateCanvas={updatecFg}/>
      </div>
    );
  }
export default App;
