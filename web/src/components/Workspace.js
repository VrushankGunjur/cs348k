import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Container, TextField, Button, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { fabric } from 'fabric';

const Workspace = forwardRef((props, ref) => {
    const [file, setFile] = useState(null);
    const [localCanvas, setLocalCanvas] = useState(null);
    const [imgURL, setImageUrl] = useState('');
    const [open, setOpen] = useState(false);
    const canvasRef = useRef(null);
    

    useEffect(() => {
        const canvas = initCanvas();
        setLocalCanvas(canvas);
        canvasRef.current = canvas;

        canvas.on("mouse:down", function (e) {
            canvas.getObjects().forEach((obj) => {
                if ("path" in obj) {
                    canvas.remove(obj);
                }
            });
            // canvas.clear();
        });

        return () => {
            // canvas.off("mouse:down", function (e) {
            //     canvas.clear();
            // })
            canvas.dispose();
        };
    }, []);

    const initCanvas = () => (
        new fabric.Canvas('workspaceCanvas', {
            height: 400,
            width: 400,
        })
    )


    const setBackground = (url, canvas) => {
        fabric.Image.fromURL(url, function(img) {
            const scalingFactor = canvas.height / img.height;
            img.scale(scalingFactor);

            const left = (canvas.width - (img.width * scalingFactor)) / 2;
            const top = (canvas.height - (img.height * scalingFactor)) / 2;

            console.log(canvas)
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                left: left,
                top: top,
                originX: 'left',
                originY: 'top'
            });

            canvas.renderAll();
            props.updateCanvas(canvas);
            
        });
    };

    useImperativeHandle(ref, () => ({
        setBackground: (url) => {
            console.log("impertive triggered");
            setBackground(url, localCanvas);
        },
        clear: () => {
            localCanvas.clear();
            localCanvas.renderAll();
        }
    }));

    const handleFileUpload = (event) => {
        setFile(event.target.files[0]);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const stageItem = () => {
        if (imgURL || file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageData = file ? reader.result : imgURL;

                // update the canvas with the new image
                setBackground(imageData, localCanvas);


                setImageUrl('');
                setFile(null);
                setOpen(false);
            };
            if (file) {
                reader.readAsDataURL(file);
            } else {
                reader.onloadend();
            }
        }
    };

    return (
        <Container>
            <Typography variant="h5" gutterBottom>Workspace</Typography>
            <Box display="flex" justifyContent="center" alignItems="center" mt={2} mb={2}>
                <canvas ref={canvasRef} id="workspaceCanvas" width="350" height="400" style={{ border: '1px solid #000' }}></canvas>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
                <Button variant="contained" color="primary" onClick={handleOpen} style={{ marginRight: '8px' }}>Set Background Image</Button>
                <Button variant="contained" color='error' onClick={() => ref.current.clear()} style={{ marginRight: '8px'}}>Clear Workspace</Button>
                {/* <Button variant="contained" color='warning' onClick={() => ref.current.setBackground('')} style={{ marginRight: '8px'}}>Clear Mask</Button> */}
            </Box>
            <Button variant="contained" color='success' style={{ width: '225%' }} onClick={props.postGenerationRequest}> Generate </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Set Background Image</DialogTitle>
                <DialogContent>
                    <Box alignItems="center" mt={2}>
                        <TextField
                            label="Enter image URL"
                            variant="outlined"
                            fullWidth
                            value={imgURL}
                            onChange={e => setImageUrl(e.target.value)}
                            margin="dense"
                            disabled={!!file}
                            style={{ paddingBottom: '16px' }}
                        />
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            style={{ marginLeft: '16px' }}
                            disabled={!!imgURL}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={stageItem} color="primary">
                        Set Background Image
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
});

export default Workspace;
