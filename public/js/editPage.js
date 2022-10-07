let global_username = "";

window.onload = function () {

  
    document.getElementById("addResponseBlock").style.display = "none";
    document.getElementById("editResponseBlock").style.display = "none";

    fetch('/getUsername', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    }).then(res => {
        return res.json();
    }).then(json => {
        let username = json.username;
        global_username = username;
        let tableTitle = document.getElementById("tableTitle");
        if (tableTitle != null) {
            tableTitle.innerHTML="Response Table for: " + global_username;
        }
        console.log("Username is " + username);
        if (username == null || username === "") {
            window.location.replace("/login.html");
        }
    })
    
    setTimeout(function () {
        updateUserTable();
    }, 1000);
    const signOut = document.getElementById("signOutButton");
    signOut.onclick = signOutFunction;

    document.getElementById("addResponseButton").onclick = function(){
        document.getElementById("addResponseBlock").style.display = "block";
        document.getElementById("editResponseBlock").style.display = "none";
    }

}

function showEditBlock() {
    document.getElementById("addResponseBlock").style.display = "none";
    document.getElementById("editResponseBlock").style.display = "block";
}

function closeAllBlocks() {
    document.getElementById("addResponseBlock").style.display = "none";
    document.getElementById("editResponseBlock").style.display = "none";
}


const signOutFunction = function () {
    fetch('/signOut', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
    }).then(res => {
        return res.json();
    }).then(json => {
        let signOutSuccess = json.signOutSuccess;
        if (signOutSuccess) {
            console.log("Signing out succeed");
            window.location.replace("/login.html");
        }
    })
}


function updateUserTable() {
    let table = document.getElementById("response");
    table.innerHTML = '<thead><tr><th scope="col">Name</th><th scope="col">Game Name</th><th scope="col">Score</th><th scope="col">Comment</th><th scope="col">Recommendation</th><th scope="col">Edit</th><th scope="col">Delete</th></tr></thead>'
    const jsonData = {
        username: global_username
    }

    fetch('/getTableData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
    }).then(res => {
        return res.json();
    }).then(json => {
        let rowIndex = 0;
        for (let rowData of json.rows.response) {

            let row = table.insertRow(-1);

            let name = row.insertCell(0);
            let gameName = row.insertCell(1);
            let score = row.insertCell(2);
            let comment = row.insertCell(3);
            let degree = row.insertCell(4);
            let editCell = row.insertCell(5);
            let deleteCell = row.insertCell(6);

            row.cells[0].innerHTML = rowData.name;
            row.cells[1].innerHTML = rowData.gameName;
            row.cells[2].innerHTML = rowData.score;
            row.cells[3].innerHTML = rowData.comment;
            row.cells[4].innerHTML = getDegree(rowData.score);
            row.cells[5].innerHTML = '<button class="btn btn-dark" onclick="editRow(' + rowIndex + ')">Edit</button>';
            row.cells[6].innerHTML = '<button class="btn btn-dark" onclick="deleteRow(' + rowIndex + ')">Delete</button>';

            rowIndex++;
        }
    })
}

function getDegree(score) {

    if(score>=0 && score<=19){
        return "Strongly Not Recommended";
      }else if(score>=20 && score<=39){
        return "Relatively Not Recommended";
      }else if(score>=40 && score<=59){
        return "Neutral";
      }else if(score>=60 && score<=79){
        return "Relatively Recommended";
      }else if(score>=80 && score<=100){
        return "Strongly Recommended";
      }
       else{"Please enter a valid score"}
}



const submit = function () {
    
    const name = document.getElementById('name').value;
    const gameName = document.getElementById('gameName').value;
    const score = document.getElementById('score').value;
    const comment = document.getElementById('comment').value;
    const degree = getDegree(score);

    if (name.trim() === '' || gameName.trim() === '' || score.trim() === '' || comment.trim() === '' || degree.trim() === '') {
        alert("Please answer all questions.");
        return false;
    } else {
        const jsonData = {
            username: global_username,
            name: name,
            gameName: gameName,
            score: score,
            comment: comment,
            degree: degree,
        }

        fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        }).then(res => {
            return res.json();
        }).then(json => {
            console.log("Data uploaded")
        })

        setTimeout(function () {
            updateUserTable();
        }, 1000);

        clearForm();
        closeAllBlocks();
        return true;
    }
}

function clearForm() {
    document.getElementById('name').value = "";
    document.getElementById('gameName').value = "";
    document.getElementById('score').value = "";
    document.getElementById('comment').value = "";
    document.getElementById('degree').value = "";
}

function editRow(rowIndex) {
    showEditBlock();
    let table = document.getElementById("response");
    let row = table.rows[rowIndex+1];

    document.getElementById('editname').value = row.cells[0].innerHTML;
    document.getElementById('editgameName').value = row.cells[1].innerHTML;
    document.getElementById('editscore').value = row.cells[2].innerHTML;
    document.getElementById('editcomment').value = row.cells[3].innerHTML;
    document.getElementById('hiddenRowIndex').value = rowIndex;
   
}

function editClicked() {
    const name = document.getElementById('editname').value;
    const gameName = document.getElementById('editgameName').value;
    const score = document.getElementById('editscore').value;
    const comment = document.getElementById('editcomment').value;
    const degree = getDegree(score);
    const rowIndex = document.getElementById('hiddenRowIndex').value;

    if (rowIndex === "") {
        alert("You must first select 'Edit This Row' on a row to edit its data!");
        return false;
    }

    if (name.trim() === '' || gameName.trim() === '' || score.trim() === '' || comment.trim() === '' ) {
        alert("Please answer all questions")
        return false;
    } else {
        const jsonData = {
            index: rowIndex,
            username: global_username,
            name: name,
            gameName: gameName,
            score: score,
            comment: comment,
            degree: degree,
        }

        fetch('/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        }).then(res => {
            return res.json();
        }).then(json => {
            console.log("Data edited success");
        })

        setTimeout(function () {
            updateUserTable();
        }, 1000);

        document.getElementById('editname').value = "";
        document.getElementById('editgameName').value = "";
        document.getElementById('editscore').value = "";
        document.getElementById('editcomment').value = "";
        document.getElementById('hiddenRowIndex').value = "";
        closeAllBlocks();
        return true;
    }
}

function deleteRow(rowIndex) {
    let confirmDelete = confirm("Are you sure you'd like to delete this row?");
    if (confirmDelete) {
        const json = {
            username: global_username,
            deletingItem: rowIndex
        }

        console.log("Deleting row " + rowIndex);
        fetch('/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        }).then(res => {
            return res.json();
        }).then(json => {
            console.log("response deleted");
            setTimeout(function () {
                updateUserTable();
            }, 1000);
        })
    }
}