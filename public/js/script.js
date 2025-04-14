const submitBtn = document.querySelector('.submit_btn');
const deleteBtns = document.querySelectorAll('.deleteBtn');
const modifyBtns = document.querySelectorAll('.modifyBtn');
const notes = document.querySelector('.notes');
const delete_all = document.querySelector('.delete_all');

let timeOutId;
function flashMsg(msg, type){

    clearTimeout(timeOutId);

    const elm = document.querySelector('.flashMsg');

    elm.textContent = msg;
    elm.style.display = 'flex';
    elm.style.alignItems = 'center';
    elm.style.paddingLeft = '30px';
    elm.style.paddingRight = '30px';


    if(type === 'pos'){
        elm.classList.add('successMsg');
    }
    else{
        elm.classList.add('failMsg');
    }

    timeOutId = setTimeout(function(){
        elm.classList = 'flashMsg';
        elm.textContent = '';
    }, 3000);
}

delete_all.addEventListener('click', async function(){
    const note_children = Array.from(notes.children);

    if(note_children.length === 0){
        return;
    }

    let res;
    try{
        res = await axios.delete('http://localhost:3000/delete_all');
    }
    catch(err){
        flashMsg('Error when making delete all req', 'fail');
        console.log('Error when making delete all req', err);
        return;
    }

    flashMsg('Successfully deleted all notes.', 'pos');

    console.log(res.data)
    console.log(res.status);

    for(let i = 0; i < note_children.length; i++){
        note_children[i].remove();
    }
})


const deleteBtnsArr = Array.from(deleteBtns);
const modBtnArr = Array.from(modifyBtns);

for(let i = 0; i < deleteBtnsArr.length; i++){
    dltBtnEventListener(i);
}

for(let i = 0; i < modifyBtns.length; i++){
    modBtnEventListener(i);
}

async function executeSave(children, parentElm){
    const newChildren = Array.from(parentElm.children);

    const data = {
        id: parentElm.getAttribute('id'),
        title: newChildren[1].value,
        description: newChildren[3].value
    }

    

    let res;
    try{
        res = await axios.patch('http://localhost:3000/change_note', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    catch(err){
        
        let msg = '';
        for(let i = 0; i < err.response.data.length; i++){
            
            msg += err.response.data[i].msg + '.'; 
        }

        flashMsg(`Errors:\n ${msg}`, 'fail');

        return;
    }

    for(let i = 0; i < newChildren.length; i++){
        newChildren[i].remove();
    }

    for(let i = 0; i < children.length; i++){
        parentElm.appendChild(children[i]);
    }   

    console.log(res.data);
    flashMsg('Successfully patched note', 'pos');

    children[0].textContent = newChildren[1].value;
    children[1].textContent = newChildren[3].value;
}

function modBtnEventListener(i){
    modBtnArr[i].addEventListener('click', async function(event){
        const parentElm = event.target.parentElement;
        let id = parentElm.getAttribute('id');
        let children = parentElm.children;
        let title_text = children[0].textContent;
        let description = children[1].textContent;
        children = Array.from(children);

        for(let i = 0; i < children.length; i++){
            children[i].remove();
        }

        let title_label = document.createElement('label');
        title_label.textContent = 'Enter Title';
        title_label.setAttribute('for', 'title_input');
        
        let title_input = document.createElement('textarea');
        title_input.classList.add('patchTitleInput');
        title_input.value = title_text;
        title_input.setAttribute('id', 'title_input');

        let desc_label = document.createElement('label');
        desc_label.textContent = 'Enter Note Description';
        desc_label.setAttribute('for', 'desc_input');

        let description_input = document.createElement('textarea');
        description_input.value = description;
        description_input.classList.add('patchDescInput');
        description_input.setAttribute('id', 'desc_input');

        let save_btn = document.createElement('button');
        save_btn.textContent = 'Save';
        save_btn.classList.add('save_btn');
        save_btn.addEventListener('click', function(){
            executeSave(children, parentElm);
        })

        parentElm.appendChild(title_label);
        parentElm.appendChild(title_input);
        parentElm.appendChild(desc_label);
        parentElm.appendChild(description_input);
        parentElm.appendChild(save_btn);
    })
}

function dltBtnEventListener(i){
    deleteBtnsArr[i].addEventListener('click', async function(event){
        const parentElm = event.target.parentElement;
        let id = parentElm.getAttribute('id');
        
        try{
            const response = await axios.delete(`http://localhost:3000/delete_note/${id}`);
            console.log(response.data);
        }
        catch(err){
            flashMsg('Error when making delete request', 'fail');
            console.log('Error sending delete req', err);
            throw err;
        }

        flashMsg('Successfully deleted note.' , 'pos');        
        parentElm.remove();
    })
}


submitBtn.addEventListener('click', async function(event){
    event.preventDefault();

    const title = document.querySelector('#title_field');
    const desc = document.querySelector('#desc_field');

    let title_val = title.value;
    let desc_value = desc.value;

    title.value = '';
    desc.value = '';

    let data = {
        title: title_val,
        description: desc_value
    }; 

    let response;
    try{
        response = await axios.post('http://localhost:3000/note', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
    catch (err) {
        let msg = '';
        for(let i = 0; i < err.response.data.length; i++){
            msg += `${err.response.data[i].msg}`;
            console.log(err.response.data[i].msg);
        }
        
        flashMsg(msg, 'fail');

        return;
    }

    if(response.status === 201){
        const new_note = document.createElement('div');
        new_note.classList.add('note');
        let last_child = notes.lastElementChild;
        let new_id;
        if(!last_child){
            new_id = 0;
        }
        else{
            new_id = last_child.getAttribute('id');
            new_id = parseInt(new_id) + 1;
        } 
        new_note.setAttribute('id', `${new_id}`);

        const new_title = document.createElement('div');
        new_title.classList.add('title');
        new_title.textContent = title_val;

        const new_desc = document.createElement('div');
        new_desc.classList.add('description');
        new_desc.textContent = desc_value;

        const modBtn = document.createElement('button');
        modBtn.classList.add('modifyBtn');
        modBtn.textContent = 'Modify';

        const dltBtn = document.createElement('button');
        dltBtn.classList.add('deleteBtn')
        dltBtn.textContent = 'Delete';

        new_note.appendChild(new_title);
        new_note.appendChild(new_desc);
        new_note.appendChild(modBtn);
        new_note.appendChild(dltBtn);
        

        deleteBtnsArr.push(dltBtn);
        dltBtnEventListener(deleteBtnsArr.length -1);

        modBtnArr.push(modBtn);
        modBtnEventListener(modBtnArr.length -1);

        notes.appendChild(new_note);
        console.log(response.data);
        flashMsg('Successfully added a new note', 'pos');
    }
    else{

        console.log('Fail');
    }
})









