//stimky ai code. bleh
// Fetch solar XML data using CORS proxy and populate existing paragraphs by ID
fetch('https://api.allorigins.win/get?url=https://www.hamqsl.com/solarxml.php')
  .then(response => response.json())
  .then(data => {
    const xmlText = data.contents;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Get all leaf elements (elements with no child elements but have text content)
    const leaves = Array.from(xmlDoc.querySelectorAll('*')).filter(el => 
      el.children.length === 0 && el.textContent.trim()
    );
    
    leaves.forEach(el => {
      let id = el.tagName.toLowerCase();
      if (el.hasAttribute('name') && el.hasAttribute('time')) {
        const name = el.getAttribute('name').replace(/[^a-zA-Z0-9]/g, '_');
        const time = el.getAttribute('time').replace(/[^a-zA-Z0-9]/g, '_');
        id = `${id}_${name}_${time}`;
      } else if (el.hasAttribute('name')) {
        const name = el.getAttribute('name').replace(/[^a-zA-Z0-9]/g, '_');
        id = `${id}_${name}`;
        if (el.hasAttribute('location')) {
          const location = el.getAttribute('location').replace(/[^a-zA-Z0-9]/g, '_');
          id = `${id}_${location}`;
        }
      }
      // Prefix with 'vhf_' if under vhfconditions or calculatedvhfconditions
      if (el.closest('vhfconditions') || el.closest('calculatedvhfconditions')) {
        id = `vhf_${id}`;
      }
      const p = document.getElementById(id);
      if (p) {
        p.textContent = el.textContent.trim();
      }
    });
  })
  .catch(error => {
    console.error('Error fetching solar data:', error);
    // Optionally, show error in a specific element
    const errorEl = document.getElementById('solar-error');
    if (errorEl) {
      errorEl.textContent = 'Failed to load solar data.';
    }
  });