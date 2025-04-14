import express from "express";
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {promises as fs} from 'fs';
import { json } from "stream/consumers";
import validateNote from './validators/noteValidator.js';
import noteValidationHandler from './middlewares/handleNoteValidation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static("public"));

async function getJsonData(){
    let jsonData = await fs.readFile('./mockDB.json', 'utf-8');
    let notes = JSON.parse(jsonData);

    return notes;
}

app.get('/', async function(req, res){
    let notes = await getJsonData()
    res.render('index', { notes })
})

app.post('/note', express.json(), validateNote(), noteValidationHandler, async function(req, res){

    const data = req.body;
    
    
    let notes = await getJsonData()
    let new_id;
    if(notes.length === 0){
        new_id = 0;
    }
    else{
        new_id = notes[notes.length -1].id + 1;
    }

    const newNote = {
        id: new_id,
        title: data.title,
        description: data.description
    }

    notes.push(newNote);

    try{
        await fs.writeFile('./mockDB.json', JSON.stringify(notes, null, 2))
    }
    catch(err){
        console.log('err writing to file', err);
    }

    return res.status(201).send('Added new note');
})

app.delete('/delete_all', async function(req, res){

    let notes = JSON.stringify([], null, 2);
    
    try{
        await fs.writeFile('./mockDB.json', notes);
    }
    catch(err){
        console.log('Err when deleting all data', err);
        return res.status(400).send('Delete all failed');
    }

    return res.status(201).send('Delete all Success');
})


app.delete('/delete_note/:id', async function(req, res){

    let notes = await getJsonData()
    let id = parseInt(req.params.id);

    let indx = notes.findIndex(function(item) {
        return item.id === id;
    })

    if(indx === -1){
        return res.status(400).send('Invalid Data');
    }

    notes.splice(indx, 1);

    try{
        await fs.writeFile('./mockDB.json', JSON.stringify(notes, null, 2))
    }
    catch(err){
        console.log('err writing to file', err);
        return res.status(400).send('Deletion Failed');
    }

    return res.status(201).send('Deletion Complete');

})


app.patch('/change_note', express.json(), validateNote(), noteValidationHandler, async function(req, res){
    const data = req.body;
   

    const notes = await getJsonData();
    
    let indx = notes.findIndex(function(note){
        return parseInt(note.id) === parseInt(data.id);
    })

    notes[indx].title = data.title;
    notes[indx].description = data.description;

    try{
        await fs.writeFile('./mockDB.json', JSON.stringify(notes, null, 2));
    }
    catch(err){
        console.log('Error when writing to file in patch req', err);
        res.status(400).send('Patch Failed');
    }

    return res.status(201).send('Patch Complete');
})


app.listen(3000, function(err){
    console.log('server is running');
})