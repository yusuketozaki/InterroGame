# Python 3.11 with CUDA support for GPU inference
FROM nvidia/cuda:12.1-runtime-ubuntu22.04

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Copy application code
COPY . .

# Create startup script
RUN echo '#!/bin/bash\n\
# Start Ollama service in background\n\
ollama serve &\n\
\n\
# Wait for Ollama to be ready\n\
sleep 10\n\
\n\
# Pull the model if not exists\n\
ollama pull qwen2.5:3b || echo "Model already exists or pull failed"\n\
\n\
# Start FastAPI application\n\
cd /app && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE 8000

# Run the startup script
CMD ["/app/start.sh"]