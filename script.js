const url = "./Elizabeth_Able_Clean.pdf";
const allText = [];

(async function () {

    // Specified the workerSrc property
    var { pdfjsLib } = globalThis;

    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.mjs';

    // Create the PDF document
    const doc = await pdfjsLib.getDocument(url).promise;

    const minPage = 1;
    const maxPage = doc._pdfInfo.numPages;
    let currentPage = 1;

    for (let i = 1; i <= maxPage; i++) {
        const page = await doc.getPage(i);
        const text = await page.getTextContent();
        text.items.forEach((itemText) => {
            allText.push(itemText.str);
        });
    }

    // Function to split text into paragraphs of 10 lines
    const chunkTextIntoParagraphs = (textArray, linesPerParagraph = 10) => {
        const paragraphs = [];
        let chunk = [];

        textArray.forEach((line, index) => {
            chunk.push(line.trim());
            if (chunk.length === linesPerParagraph || index === textArray.length - 1) {
                paragraphs.push(chunk.join(' '));
                chunk = [];
            }
        });

        return paragraphs;
    };

    // Split the text into paragraphs of 10 lines each
    const paragraphs = chunkTextIntoParagraphs(allText);

    // Display the paragraphs in the text-content container
    const textContainer = document.getElementById('text-content');
    paragraphs.forEach((paragraph) => {
        const p = document.createElement('p');
        p.innerText = paragraph;
        textContainer.appendChild(p);
    });

    // Get page 1
    await getPage(doc, currentPage);

    // Display the page number
    document.getElementById("pageNumber").innerHTML = `Page ${currentPage} of ${maxPage}`;

    // The previous button click event
    document.getElementById("previous").addEventListener("click", async () => {
        if (currentPage > minPage) {
            // Get the previous page
            await getPage(doc, currentPage--);
            // Display the page number
            document.getElementById("pageNumber").innerHTML = `Page ${currentPage} of ${maxPage}`;
        }
    });

    // The next button click event
    document.getElementById("next").addEventListener("click", async () => {
        if (currentPage < maxPage) {
            // Get the next page
            await getPage(doc, currentPage++);
            // Display the page number
            document.getElementById("pageNumber").innerHTML = `Page ${currentPage} of ${maxPage}`;
        }
    });

})();

async function getPage(doc, pageNumber) {
    if (pageNumber >= 1 && pageNumber <= doc._pdfInfo.numPages) {
        // Fetch the page
        const page = await doc.getPage(pageNumber);
        // Set the viewport
        const viewport = page.getViewport({ scale: 1.5 });
        // Set the canvas dimensions to the PDF page dimensions
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render the PDF page into the canvas context
        return await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
    } else {
        console.log("Please specify a valid page number");
    }
} 
let fontSize = 16; // Default font size in pixels

const changeFontSize = (increment) => {
    fontSize += increment;
    if (fontSize > 36) fontSize = 36; // Maximum font size
    document.getElementById('text-content').style.fontSize = `${fontSize}px`;
};

let touchStartX = 0;
let touchEndX = 0;

const handleSwipe = () => {
    const swipeDistance = touchStartX - touchEndX;
    if (swipeDistance > 50) {
        changeFontSize(2); // Increase font size
    }
};

const textContainer = document.getElementById('text-content');

textContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

textContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});
