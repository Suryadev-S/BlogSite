const deleteButton = document.querySelector("#deleteButton");

deleteButton.addEventListener("click",(e)=>{
    e.target.textContent = "deleted from database";
})