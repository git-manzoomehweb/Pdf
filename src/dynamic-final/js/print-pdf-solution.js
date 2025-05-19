// Final polished PDF solution with proper spacing and margins

// This script handles PDF generation with proper spacing and margins
function generatePDF() {
    try {
        // Show loading indicator if it exists
        const loadingElement = document.querySelector('.pdf-loading');
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
        }

        // Get the current URL parameters
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        
        // Add or update the 'print' parameter to indicate print mode
        urlParams.set('print', 'true');
        
        // Create the print-friendly URL
        const printUrl = `${window.location.pathname}?${urlParams.toString()}`;
        
        // Open the print-friendly version in a new window
        const printWindow = window.open(printUrl, '_blank');
        
        // Add script to automatically trigger print when the page loads
        printWindow.onload = function() {
            try {
                // Wait longer for resources to load and DOM to be ready
                setTimeout(function() {
                    // Trigger print
                    printWindow.print();
                    
                    // Hide loading indicator
                    if (loadingElement) {
                        loadingElement.classList.add('hidden');
                    }
                }, 2000); // Increased time to 2 seconds
            } catch (e) {
                console.error('Print error:', e);
                if (loadingElement) {
                    loadingElement.classList.add('hidden');
                }
                alert('Error during printing. Please try manually printing the page that opened.');
            }
        };
    } catch (e) {
        console.error('Setup error:', e);
        const loadingElement = document.querySelector('.pdf-loading');
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
        alert('Could not initialize PDF generation. Please try manually printing the page (Ctrl+P).');
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Connect to Generate PDF button
    const generatePdfBtn = document.querySelector('.make_pdf button');
    if (generatePdfBtn) {
        generatePdfBtn.onclick = function(e) {
            e.preventDefault();
            generatePDF();
            return false;
        };
    }
    
    // Connect to Download PDF button
    const downloadPdfBtn = document.getElementById('pdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.onclick = function(e) {
            e.preventDefault();
            generatePDF();
            return false;
        };
    }
    
    // If we're in print mode (URL has print=true), add print-specific styling
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('print') === 'true') {
        // First, modify the document title to remove URL references
        document.title = "Flight Ticket";
        
        // Create specialized print styles to handle headers and remove URLs
        const printStyles = document.createElement('style');
        printStyles.innerHTML = `
            @media print {
                /* Basic page setup */
                @page {
                    size: A4;
                    margin: 0;
                }
                
                /* Hide all URL displays in the PDF */
                @page :left {
                    margin-top: 0;
                    margin-bottom: 0;
                    margin-left: 0;
                    margin-right: 0;
                }
                
                @page :right {
                    margin-top: 0;
                    margin-bottom: 0;
                    margin-left: 0;
                    margin-right: 0;
                }
                
                /* Hide all browser-generated content */
                html {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* General body styling */
                body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Force background colors and images to print */
                * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Hide elements we don't want in the PDF */
                button, .make_pdf, #pdfBtn, #captureBtn, .siteurl {
                    display: none !important;
                }
                
                /* Add side margins to all content */
                .ticketContainer, .ticketContainer__info, .fare_conditions, .max-w-screen-md, .header__details__container, .pathContainer, .make_pdf, .haeder__details__container {
                    padding-left: 40px !important;
                    padding-right: 40px !important;
                    max-width: calc(100% - 80px) !important;
                    margin-left: auto !important;
                    margin-right: auto !important;
                }
                
                /* Ensure content is visible with proper spacing */
                .ticketContainer, .ticketContainer__info, .fare_conditions {
                    display: block !important;
                    page-break-inside: avoid;
                    margin-bottom: 30px !important;
                }
                
                /* Structure the content with appropriate spacing */
                #content {
                    padding-top: 120px !important; /* Reduced space for header */
                    padding-bottom: 120px !important; /* Space for footer */
                    position: relative;
                    z-index: 1 !important;
                }
                
                /* Header styling with proper positioning */
                .header {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    height: 100px !important; /* Fixed height for header */
                    text-align: center !important;
                    z-index: 9999 !important; /* Much higher z-index to stay on top */
                    page-break-after: avoid !important;
                    display: block !important;
                    background-color: white !important; /* Ensure the header has a background */
                    padding-bottom: 5px !important; /* Reduced padding */
                    border-bottom: 1px solid #eee !important; /* Add subtle border */
                    transform: translateZ(9999px) !important; /* Force to front layer */
                    -webkit-transform: translateZ(9999px) !important;
                }
                
                /* Footer styling */
                .footer {
                    position: fixed !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    height: 80px !important; /* Fixed height for footer */
                    text-align: center !important;
                    z-index: 9999 !important; /* Higher z-index */
                    page-break-before: avoid !important;
                    display: block !important;
                    background-color: white !important; /* Ensure the footer has a background */
                    padding-top: 5px !important; /* Reduced padding */
                    border-top: 1px solid #eee !important; /* Add subtle border */
                    transform: translateZ(9999px) !important; /* Force to front layer */
                    -webkit-transform: translateZ(9999px) !important;
                }
                
                /* Ensure header and footer images display properly */
                .header img, .footer img {
                    display: block !important;
                    margin: 0 auto !important;
                    width: auto !important;
                    max-width: 800px !important;
                    height: auto !important;
                    max-height: 80px !important;
                }
                
                /* Create section for header content with margins */
                .header-content {
                    margin: 0 auto !important;
                    max-width: calc(100% - 80px) !important;
                    padding-left: 40px !important;
                    padding-right: 40px !important;
                }
                
                /* Add additional spacing between header sections */
                .haeder__details__container, .header__details__container {
                    margin-top: 10px !important;
                    z-index: 9999 !important;
                }
                
                /* Additional spacing for route sections */
                .ticketContainer__details__time, .ticketContainer__details__head {
                    padding-left: 40px !important;
                    padding-right: 40px !important;
                }
                
                /* Hide any elements that might display URLs */
                [href], [src], a, img {
                    text-decoration: none !important;
                }
                
                /* Hide any text elements that contain URL text */
                *:not(script):not(style):not(input):not(textarea):not(select) {
                    position: relative;
                }
                
                /* Add space below each section */
                .pathContainer > div {
                    margin-bottom: 20px !important;
                }
                
                /* Fix for content that might appear above header */
                .ticketContainer, .ticketContainer__info, .fare_conditions, .pathContainer, .max-w-screen-md, 
                .haeder__details__container, .header__details__container, #show-cap, .return_stracture {
                    position: relative !important;
                    z-index: 1 !important; /* Lower z-index than header/footer */
                    margin-top: 0 !important; /* Prevent negative margins */
                }
            }
        `;
        document.head.appendChild(printStyles);
        
        // Function to find and clone the header to make it appear on all pages
        function setupRepeatingHeaderAndFooter() {
            // Find the original header and footer
            const header = document.querySelector('.header');
            const footer = document.querySelector('.footer');
            
            // Reset existing styles first to avoid conflicts
            if (header) {
                header.style.cssText = '';
                header.style.position = 'fixed';
                header.style.top = '0';
                header.style.left = '0';
                header.style.right = '0';
                header.style.height = '100px'; // Fixed smaller height
                header.style.zIndex = '9999'; // Much higher z-index
                header.style.backgroundColor = 'white';
                header.style.display = 'block';
                header.style.paddingBottom = '5px';
                header.style.borderBottom = '1px solid #eee';
                
                // Force header to front with transform
                header.style.transform = 'translateZ(9999px)';
                header.style.webkitTransform = 'translateZ(9999px)';
                
                // Adjust header image if needed
                const headerImg = header.querySelector('img');
                if (headerImg) {
                    headerImg.style.maxHeight = '80px';
                    headerImg.style.width = 'auto';
                }
            }
            
            if (footer) {
                footer.style.cssText = '';
                footer.style.position = 'fixed';
                footer.style.bottom = '0';
                footer.style.left = '0';
                footer.style.right = '0';
                footer.style.height = '80px'; // Fixed smaller height
                footer.style.zIndex = '9999'; // Much higher z-index
                footer.style.backgroundColor = 'white';
                footer.style.display = 'block';
                footer.style.paddingTop = '5px';
                footer.style.borderTop = '1px solid #eee';
                
                // Force footer to front with transform
                footer.style.transform = 'translateZ(9999px)';
                footer.style.webkitTransform = 'translateZ(9999px)';
                
                // Adjust footer image if needed
                const footerImg = footer.querySelector('img');
                if (footerImg) {
                    footerImg.style.maxHeight = '60px';
                    footerImg.style.width = 'auto';
                }
            }
            
            // Add margin to content to prevent overlap
            const content = document.getElementById('content');
            if (content) {
                content.style.cssText = '';
                content.style.position = 'relative';
                content.style.zIndex = '1';
                content.style.paddingTop = '120px'; // Space for header
                content.style.paddingBottom = '120px'; // Space for footer
            }
            
            // Ensure all content has the correct z-index
            const containers = document.querySelectorAll('.ticketContainer, .ticketContainer__info, .fare_conditions, .pathContainer, .max-w-screen-md');
            containers.forEach(function(container) {
                container.style.position = 'relative';
                container.style.zIndex = '1'; // Lower than header/footer
                container.style.paddingLeft = '40px';
                container.style.paddingRight = '40px';
                container.style.maxWidth = 'calc(100% - 80px)';
                container.style.marginLeft = 'auto';
                container.style.marginRight = 'auto';
                container.style.marginBottom = '30px';
                container.style.pageBreakInside = 'avoid';
                container.style.marginTop = '0'; // Prevent negative margins
            });
            
            // Find and remove URL displays
            removeUrlDisplays();
        }
        
        // Function to find and remove URL displays
        function removeUrlDisplays() {
            // Find all elements containing URL text
            const urlRegex = /http:\/\/basisflydemo\.ir/i;
            const allElements = document.querySelectorAll('*');
            
            allElements.forEach(function(el) {
                // Skip script and style elements
                if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') {
                    return;
                }
                
                // Check text content
                if (el.childNodes && el.childNodes.length > 0) {
                    for (let i = 0; i < el.childNodes.length; i++) {
                        const node = el.childNodes[i];
                        if (node.nodeType === Node.TEXT_NODE && urlRegex.test(node.textContent)) {
                            // Replace the text with empty string
                            node.textContent = '';
                        }
                    }
                }
                
                // Hide specific elements with URL classes
                if (el.className && typeof el.className === 'string' && el.className.includes('siteurl')) {
                    el.style.display = 'none';
                }
            });
        }
        
        // Run setup when page is loaded
        window.addEventListener('load', setupRepeatingHeaderAndFooter);
        
        // Also run right before printing
        window.addEventListener('beforeprint', function() {
            setupRepeatingHeaderAndFooter();
            removeUrlDisplays();
            
            // Additional fix for ensuring content doesn't overlap header
            setTimeout(function() {
                const header = document.querySelector('.header');
                const content = document.getElementById('content');
                
                if (header && content) {
                    // Ensure header is on top with very high z-index
                    header.style.zIndex = '9999';
                    content.style.zIndex = '1';
                    content.style.position = 'relative';
                    
                    // Force repaint to ensure styles are applied
                    header.style.display = 'none';
                    void header.offsetHeight; // Force reflow
                    header.style.display = 'block';
                }
            }, 100);
        });
    }
});

// Add a special handling for the Capture as Image button
document.addEventListener('DOMContentLoaded', function() {
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) {
        captureBtn.onclick = function(e) {
            e.preventDefault();
            alert('For the best results, please press Ctrl+P to print the page and save as PDF, or use your browser\'s screenshot tool.');
            return false;
        };
    }
});

