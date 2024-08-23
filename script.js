document.addEventListener('DOMContentLoaded', function () {
    const gridForm = document.getElementById('gridForm');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const downloadSvgBtn = document.getElementById('downloadSvgBtn');
    const downloadEpsBtn = document.getElementById('downloadEpsBtn');
    const cellSize = 30; // Fixed cell size
    const margin = 10; // Margin around the black cells in the export
    let isDragging = false;
    let lastToggledCell = null;

    gridForm.addEventListener('submit', function(event) {
        event.preventDefault();
        generateGrid();
        downloadPngBtn.style.display = 'block';
        downloadSvgBtn.style.display = 'block';
        downloadEpsBtn.style.display = 'block';
    });

    function generateGrid() {
        const gridRows = parseInt(document.getElementById('gridRows').value);
        const gridCols = parseInt(document.getElementById('gridCols').value);
        const gridContainer = document.getElementById('gridContainer');

        gridContainer.innerHTML = '';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${gridCols}, ${cellSize}px)`;
        gridContainer.style.backgroundColor = '#e0e0e0'; // Light gray background for better visibility
        gridContainer.style.gap = '0'; // Ensure there is no gap between cells

        for (let i = 0; i < gridRows * gridCols; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.backgroundColor = 'transparent'; // Set initial background to transparent
            cell.style.border = '1px solid rgba(0, 0, 0, 0.1)'; // Very light border to indicate cells
            cell.style.margin = '0'; // Remove any margin
            cell.addEventListener('mousedown', () => startDragging(cell));
            cell.addEventListener('mouseenter', () => toggleCellOnDrag(cell));
            cell.addEventListener('mouseup', stopDragging);
            gridContainer.appendChild(cell);
        }
    }

    function startDragging(cell) {
        isDragging = true;
        toggleCellColor(cell);
    }

    function toggleCellOnDrag(cell) {
        if (isDragging) {
            toggleCellColor(cell);
        }
    }

    function toggleCellColor(cell) {
        if (cell === lastToggledCell) return;
        cell.style.backgroundColor = cell.style.backgroundColor === 'black' ? 'transparent' : 'black';
        lastToggledCell = cell;
    }

    function stopDragging() {
        isDragging = false;
        lastToggledCell = null;
    }

    downloadPngBtn.addEventListener('click', () => downloadGridAsImage('png'));
    downloadSvgBtn.addEventListener('click', () => downloadGridAsImage('svg'));
    downloadEpsBtn.addEventListener('click', () => downloadGridAsEps());

    function downloadGridAsImage(format) {
        const gridContainer = document.getElementById('gridContainer');
        const resolution = parseInt(document.getElementById('resolution').value); // Get the user-defined resolution
        const cells = Array.from(gridContainer.querySelectorAll('.grid-cell'));
        const blackCells = cells.filter(cell => cell.style.backgroundColor === 'black');

        if (blackCells.length === 0) {
            alert('No black cells to download.');
            return;
        }

        // Get bounding box of all black cells
        const positions = blackCells.map(cell => {
            const rect = cell.getBoundingClientRect();
            const containerRect = gridContainer.getBoundingClientRect();
            return {
                x: rect.left - containerRect.left,
                y: rect.top - containerRect.top,
                width: rect.width,
                height: rect.height,
            };
        });

        const xMin = Math.min(...positions.map(p => p.x));
        const yMin = Math.min(...positions.map(p => p.y));
        const xMax = Math.max(...positions.map(p => p.x + p.width));
        const yMax = Math.max(...positions.map(p => p.y + p.height));

        const boundingBoxWidth = xMax - xMin;
        const boundingBoxHeight = yMax - yMin;

        // Adjust the target resolution to account for the margin
        const effectiveResolution = resolution - 2 * margin;

        // Determine scaling factor based on the adjusted resolution and the longest side
        const scaleFactor = effectiveResolution / Math.max(boundingBoxWidth, boundingBoxHeight);
        const canvasWidth = Math.round(boundingBoxWidth * scaleFactor) + 2 * margin;
        const canvasHeight = Math.round(boundingBoxHeight * scaleFactor) + 2 * margin;

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw the black cells
        blackCells.forEach(cell => {
            const rect = cell.getBoundingClientRect();
            const containerRect = gridContainer.getBoundingClientRect();
            const x = Math.round((rect.left - containerRect.left - xMin) * scaleFactor) + margin;
            const y = Math.round((rect.top - containerRect.top - yMin) * scaleFactor) + margin;
            ctx.fillStyle = 'black';
            ctx.fillRect(x, y, Math.round(rect.width * scaleFactor), Math.round(rect.height * scaleFactor));
        });

        if (format === 'png') {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'grid.png';
            link.click();
        } else if (format === 'svg') {
            alert('SVG download is not implemented yet.');
        }
    }

    function downloadGridAsEps() {
        alert('EPS download functionality is not implemented yet.');
    }
});
