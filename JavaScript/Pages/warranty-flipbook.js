document.addEventListener('DOMContentLoaded', () => {
    const prevBookBtn = document.querySelector("#prevBookBtn");
    const nextBookBtn = document.querySelector("#nextBookBtn");
    const book = document.querySelector("#book");

    const paper1 = document.querySelector("#p1");
    const paper2 = document.querySelector("#p2");
    const paper3 = document.querySelector("#p3");

    let currentLocation = 1;
    let numOfPapers = 3;
    let maxLocation = numOfPapers + 1;

    function openBook() {
        if(window.innerWidth > 768) {
            book.style.transform = "translateX(50%)";
        } else {
            // on mobile, shifting less to avoid overflowing the screen width
            book.style.transform = "translateX(15%)";
        }
    }

    function closeBook(isAtBeginning) {
        if(isAtBeginning) {
            book.style.transform = "translateX(0%)";
        } else {
            if(window.innerWidth > 768) {
                book.style.transform = "translateX(100%)";
            } else {
                book.style.transform = "translateX(30%)";
            }
        }
    }

    function goNextPage() {
        if(currentLocation < maxLocation) {
            switch(currentLocation) {
                case 1:
                    openBook();
                    paper1.classList.add("flipped");
                    break;
                case 2:
                    paper2.classList.add("flipped");
                    break;
                case 3:
                    paper3.classList.add("flipped");
                    closeBook(false);
                    break;
                default:
                    throw new Error("unkown state");
            }
            currentLocation++;
        }
    }

    function goPrevPage() {
        if(currentLocation > 1) {
            switch(currentLocation) {
                case 2:
                    closeBook(true);
                    paper1.classList.remove("flipped");
                    break;
                case 3:
                    paper2.classList.remove("flipped");
                    break;
                case 4:
                    openBook();
                    paper3.classList.remove("flipped");
                    break;
                default:
                    throw new Error("unkown state");
            }
            currentLocation--;
        }
    }

    if(prevBookBtn && nextBookBtn && book) {
        nextBookBtn.addEventListener("click", goNextPage);
        prevBookBtn.addEventListener("click", goPrevPage);
        
        // allow clicking on papers to flip
        if(paper1) paper1.addEventListener('click', (e) => { 
            // Only flip if not clicking a link
            if(e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
                if(currentLocation===1) goNextPage(); else if(currentLocation===2) goPrevPage(); 
            }
        });
        if(paper2) paper2.addEventListener('click', (e) => { 
            if(e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
                if(currentLocation===2) goNextPage(); else if(currentLocation===3) goPrevPage(); 
            }
        });
        if(paper3) paper3.addEventListener('click', (e) => { 
            if(e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
                if(currentLocation===3) goNextPage(); else if(currentLocation===4) goPrevPage(); 
            }
        });
        
        // Handle window resize for book position
        window.addEventListener('resize', () => {
            if(currentLocation > 1 && currentLocation < maxLocation) {
                openBook();
            } else if (currentLocation === maxLocation) {
                closeBook(false);
            } else {
                closeBook(true);
            }
        });
    }
});
