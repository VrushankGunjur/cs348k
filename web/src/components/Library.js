import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, IconButton, Grid, Card, CardMedia, CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Library = ({ clothingItems, addClothingItem, removeClothingItem }) => {
    const [open, setOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [file, setFile] = useState(null);
    const [clothingType, setClothingType] = useState('');
    const [description, setDescription] = useState('');

    const handleFileUpload = (event) => {
        setFile(event.target.files[0]);
        setImageUrl('');
    };

    const handleUrlChange = (event) => {
        setImageUrl(event.target.value);
        setFile(null);
    };

    const handleAddItem = () => {
        if (imageUrl || file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                addClothingItem({
                    url: file ? reader.result : imageUrl,
                    type: clothingType,
                    description: description || clothingType,
                });
                setImageUrl('');
                setFile(null);
                setClothingType('');
                setDescription('');
                setOpen(false);
            };
            if (file) {
                reader.readAsDataURL(file);
            } else {
                reader.onloadend();
            }
        }
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Clothing Library
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpen} style={{ marginBottom: '16px' }}>
                Add Item
            </Button>
            { clothingItems.length != 0 && 
            <Paper style={{ maxHeight: '60vh', overflow: 'auto', padding: '16px' }}>
                <Grid container spacing={2}>
                    {clothingItems.map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="300"
                                    image={item.url}
                                    alt={`Clothing item ${index}`}
                                    style={{ objectFit: 'cover' }}
                                />
                                <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        {item.description}
                                    </Typography>
                                    <IconButton edge="end" aria-label="delete" onClick={() => removeClothingItem(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
            }
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add New Clothing Item</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Clothing Type"
                        variant="outlined"
                        fullWidth
                        value={clothingType}
                        onChange={e => setClothingType(e.target.value)}
                        margin="dense"
                    />
                    <TextField
                        label="Description"
                        variant="outlined"
                        fullWidth
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        margin="dense"
                    />
                    <Box display="flex" alignItems="center" mt={2}>
                        <TextField
                            label="Enter image URL"
                            variant="outlined"
                            fullWidth
                            value={imageUrl}
                            onChange={handleUrlChange}
                            margin="dense"
                            disabled={!!file}
                        />
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            style={{ marginLeft: '16px' }}
                            disabled={!!imageUrl}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddItem} color="primary">
                        Add Item
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

    export default Library;