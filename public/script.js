const form = document.getElementById('posterForm');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const results = document.getElementById('results');
const imageGrid = document.getElementById('imageGrid');
const errorDiv = document.getElementById('error');
const submitBtn = document.getElementById('submitBtn');
const loader = document.getElementById('loader');
const btnText = submitBtn.querySelector('.btn-text');

// Handle image preview
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            imagePreview.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = '';
        imagePreview.classList.remove('has-image');
    }
});

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Hide previous results and errors
    results.style.display = 'none';
    errorDiv.style.display = 'none';
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Generating...';
    loader.style.display = 'inline-block';
    
    try {
        const formData = new FormData(form);
        const prompt = formData.get('prompt');
        const size = formData.get('size');
        const aspectRatio = formData.get('aspect_ratio');
        const imageFile = formData.get('image');
        
        // Prepare request body
        const requestBody = {
            prompt: prompt,
            size: size,
            aspect_ratio: aspectRatio
        };
        
        // Create FormData for file upload
        const uploadFormData = new FormData();
        uploadFormData.append('prompt', prompt);
        uploadFormData.append('size', size);
        uploadFormData.append('aspect_ratio', aspectRatio);
        
        if (imageFile && imageFile.size > 0) {
            uploadFormData.append('image', imageFile);
        }
        
        // Make API request
        const response = await fetch('/api/generate', {
            method: 'POST',
            body: uploadFormData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Failed to generate images');
        }
        
        // Display results
        if (data.images && data.images.length > 0) {
            displayResults(data.images);
        } else {
            throw new Error('No images were generated');
        }
        
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.style.display = 'block';
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.textContent = 'Generate Posters';
        loader.style.display = 'none';
    }
});

function displayResults(imageUrls) {
    imageGrid.innerHTML = '';
    
    imageUrls.forEach((url, index) => {
        const card = document.createElement('div');
        card.className = 'image-card';
        
        const img = document.createElement('img');
        img.src = url;
        img.alt = `Generated poster ${index + 1}`;
        img.loading = 'lazy';
        
        // Add click to view full size
        img.addEventListener('click', () => {
            window.open(url, '_blank');
        });
        
        const info = document.createElement('div');
        info.className = 'image-info';
        info.innerHTML = `
            <div>Poster ${index + 1}</div>
            <a href="${url}" download="poster-${index + 1}.png" class="download-btn">Download</a>
        `;
        
        card.appendChild(img);
        card.appendChild(info);
        imageGrid.appendChild(card);
    });
    
    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

