const form = document.getElementById('posterForm');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const results = document.getElementById('results');
const imageGrid = document.getElementById('imageGrid');
const errorDiv = document.getElementById('error');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const appContainer = document.getElementById('appContainer');
const loadingContainer = document.getElementById('loadingContainer');
const resultsColumn = document.getElementById('resultsColumn');

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
    
    // Activate 2-column layout
    appContainer.classList.add('layout-active');
    
    // Hide previous results and errors
    results.style.display = 'none';
    errorDiv.style.display = 'none';
    loadingContainer.style.display = 'flex';
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Generating...';
    
    try {
        const formData = new FormData(form);
        const prompt = formData.get('prompt');
        const size = formData.get('size');
        const aspectRatio = formData.get('aspect_ratio');
        const imageFile = formData.get('image');
        
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
        loadingContainer.style.display = 'none';
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.textContent = 'Generate';
    }
});

function displayResults(imageUrls) {
    // Hide loading, show results
    loadingContainer.style.display = 'none';
    imageGrid.innerHTML = '';
    
    imageUrls.forEach((url, index) => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
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
            <div style="margin-bottom: 8px; font-weight: 500;">Poster ${index + 1}</div>
            <a href="${url}" download="poster-${index + 1}.png" class="download-btn">Download</a>
        `;
        
        card.appendChild(img);
        card.appendChild(info);
        imageGrid.appendChild(card);
        
        // Animate in
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    results.style.display = 'block';
}

