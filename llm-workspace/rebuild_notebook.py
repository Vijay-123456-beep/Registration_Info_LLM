import json
import os

def create_notebook():
    target_path = r"C:\Users\vijay\OneDrive\Desktop\Registration_Info_LLM\chatbot-backend\Cleaned_RAG_Final.ipynb"
    
    cells = []
    
    # 1. System Verification
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["# Section 1: System Verification\n", "Checking GPU availability and VRAM status."]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": ["!nvidia-smi"]
    })
    
    # 2. GPU Memory Cleanup
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["# Section 2: GPU Memory Management\n", "Identify and terminate orphan Python processes to free up VRAM."]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import os, signal\n",
            "current_pid = os.getpid()\n",
            "for line in os.popen('ps -ef | grep python').readlines():\n",
            "    fields = line.split()\n",
            "    pid = int(fields[1])\n",
            "    # Kill non-jupyter python processes to clear old sessions\n",
            "    if pid != current_pid and 'jupyter' not in line:\n",
            "        print(f\"Cleaning orphan process {pid}...\")\n",
            "        try: os.kill(pid, signal.SIGKILL)\n",
            "        except: pass\n",
            "\n",
            "!nvidia-smi"
        ]
    })
    
    # 3. Consolidated Installations
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["# Section 3: Consolidated Installations\n", "**IMPORTANT**: Run this and then **Restart Session** (Runtime > Restart session) if you encounter any import errors."]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "!pip install -U transformers accelerate bitsandbytes datasets tqdm pandas matplotlib langchain-community langchain-text-splitters faiss-gpu-cu12 pyngrok uvicorn nest_asyncio"
        ]
    })
    
    # 4. Global Imports & Config
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["# Section 4: Global Imports & Configuration"]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import torch\n",
            "import pandas as pd\n",
            "import matplotlib.pyplot as plt\n",
            "from tqdm.notebook import tqdm\n",
            "from google.colab import drive\n",
            "from langchain_core.documents import Document as LangchainDocument\n",
            "from langchain_text_splitters import RecursiveCharacterTextSplitter\n",
            "from langchain_community.vectorstores import FAISS\n",
            "from langchain_community.embeddings import HuggingFaceEmbeddings\n",
            "from langchain_community.vectorstores.utils import DistanceStrategy\n",
            "from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline, BitsAndBytesConfig\n",
            "import nest_asyncio\n",
            "import uvicorn\n",
            "from fastapi import FastAPI, Request\n",
            "from pyngrok import ngrok\n",
            "import asyncio\n",
            "\n",
            "# Configuration\n",
            "MODEL_ID = \"meta-llama/Llama-3.1-8B-Instruct\"\n",
            "HF_TOKEN = \"YOUR_HUGGINGFACE_TOKEN\"\n",
            "DATASET_PATH = \"/content/drive/MyDrive/Registration_info_dataset123.txt\"\n",
            "EMBEDDING_MODEL_NAME = \"thenlper/gte-small\""
        ]
    })
    
    # 5. Persistent Storage
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["# Section 5: Persistent Storage\n", "Mounting Google Drive to access the dataset."]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": ["drive.mount('/content/drive')"]
    })
    
    # 6. Data Loading
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["# Section 6: Data Engineering\n", "Loading the registration dataset from Google Drive."]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "try:\n",
            "    with open(DATASET_PATH, \"r\") as fp:\n",
            "        s = fp.read().split(\"\\n\\n\\n\\n\")\n",
            "    \n",
            "    RAW_KNOWLEDGE_BASE = [\n",
            "        LangchainDocument(page_content=doc)\n",
            "        for doc in tqdm(s, desc=\"Loading Documents\")\n",
            "    ]\n",
            "    print(f\"Successfully loaded {len(RAW_KNOWLEDGE_BASE)} documents.\")\n",
            "except FileNotFoundError:\n",
            "    print(f\"ERROR: {DATASET_PATH} not found. Check your Drive path.\")"
        ]
    })
    
    # 7. Text Splitting
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["# Section 7: Text Preprocessing\n", "Splitting the documents into manageable chunks for the LLM."]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "MARKDOWN_SEPARATORS = [\"\\n#{1,6}\", \"```\\n\", \"\\n\\\\*\\\\*\\\\*+\\n\", \"\\n---+\\n\", \"\\n__+\\n\", \"\\n\\n\", \"\\n\", \" \", \"\"]\n",
            "text_splitter = RecursiveCharacterTextSplitter(\n",
            "    chunk_size=1000,\n",
            "    chunk_overlap=100,\n",
            "    add_start_index=True,\n",
            "    strip_whitespace=True,\n",
            "    separators=MARKDOWN_SEPARATORS,\n",
            ")\n",
            "docs_processed = []\n",
            "for doc in RAW_KNOWLEDGE_BASE:\n",
            "    docs_processed += text_splitter.split_documents([doc])\n",
            "print(f\"Created {len(docs_processed)} chunks for indexing.\")"
        ]
    })
    
    # 8. Vector Database Setup
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["# Section 8: Vector Engine\n", "Initializing Embeddings and building the FAISS database."]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "embedding_model = HuggingFaceEmbeddings(\n",
            "    model_name=EMBEDDING_MODEL_NAME,\n",
            "    multi_process=True,\n",
            "    model_kwargs={\"device\": \"cuda\"},\n",
            "    encode_kwargs={\"normalize_embeddings\": True},\n",
            ")\n",
            "\n",
            "KNOWLEDGE_VECTOR_DATABASE = FAISS.from_documents(\n",
            "    docs_processed,\n",
            "    embedding_model,\n",
            "    distance_strategy=DistanceStrategy.COSINE,\n",
            ")"
        ]
    })
    
    # 9. Model Loading (Llama 3.1)
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["# Section 9: Model Mastery\n", "Loading Llama-3.1-8B with 4-bit quantization on T4 GPU."]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "bnb_config = BitsAndBytesConfig(\n",
            "    load_in_4bit=True,\n",
            "    bnb_4bit_use_double_quant=True,\n",
            "    bnb_4bit_quant_type=\"nf4\",\n",
            "    bnb_4bit_compute_dtype=torch.bfloat16\n",
            ")\n",
            "\n",
            "model = AutoModelForCausalLM.from_pretrained(\n",
            "    MODEL_ID,\n",
            "    token=HF_TOKEN,\n",
            "    device_map=\"auto\",\n",
            "    quantization_config=bnb_config,\n",
            "    trust_remote_code=True\n",
            ")\n",
            "\n",
            "tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, token=HF_TOKEN)\n",
            "tokenizer.pad_token = tokenizer.eos_token"
        ]
    })
    
    # 10. RAG Reasoning
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["# Section 10: RAG Reasoning Pipeline\n", "Expert persona and retrieval functions."]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "prompt_chat = [\n",
            "    {\n",
            "        \"role\": \"system\",\n",
            "        \"content\": \"\"\"You are an expert Registration Information Assistant. \n",
            "Using the provided Context, give a helpful and legal-minded response.\n",
            "\n",
            "Guidelines:\n",
            "1. **Direct Answer**: Focus on solving the user's registration query.\n",
            "2. **Reference**: Cite the specific Act, Department, or Document found in the Context.\n",
            "3. **Constraint**: If not in context, say: 'I don\\'t have official information on this specific topic.'\n",
            "4. **Disclaimer**: Add a note that this is for guidance purposes only.\"\"\"\n",
            "    },\n",
            "    {\n",
            "        \"role\": \"user\",\n",
            "        \"content\": \"Context:\\n{context}\\n---\\nQuestion: {question}\"\n",
            "    }\n",
            "]\n",
            "\n",
            "RAG_PROMPT_TEMPLATE = tokenizer.apply_chat_template(prompt_chat, tokenize=False, add_generation_prompt=True)\n",
            "pipe = pipeline(\"text-generation\", model=model, tokenizer=tokenizer)\n",
            "\n",
            "def answer_query(question, k=3):\n",
            "    # Similarity Search\n",
            "    context_docs = KNOWLEDGE_VECTOR_DATABASE.similarity_search(question, k=k)\n",
            "    context_text = \"\\n\".join([doc.page_content for doc in context_docs])\n",
            "    \n",
            "    # Format and Generate\n",
            "    full_prompt = RAG_PROMPT_TEMPLATE.format(context=context_text, question=question)\n",
            "    response = pipe(full_prompt, max_new_tokens=512, do_sample=False, temperature=0.0)\n",
            "    \n",
            "    return response[0]['generated_text'].split(\"assistant\\n\")[-1]"
        ]
    })
    
    # 11. Deployment
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": ["# Section 11: Chatbot API Deployment\n", "Hosting the chatbot via Ngrok and FastAPI."]
    })
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "app = FastAPI()\n",
            "\n",
            "@app.post(\"/query\")\n",
            "async def chat(request: Request):\n",
            "    data = await request.json()\n",
            "    query = data.get(\"query\")\n",
            "    response = answer_query(query)\n",
            "    return {\"response\": response}\n",
            "\n",
            "# Deployment Logic\n",
            "nest_asyncio.apply()\n",
            "!pkill -f ngrok\n",
            "ngrok.set_auth_token(\"2wE9yU0hK3W0H4iBM3B2OxNWPkA_7yxsy911qCZvTeBF2T4Nk\")\n",
            "public_url = ngrok.connect(8000)\n",
            "print(f\"\\n>>> Your Chatbot API is LIVE at: {public_url.public_url}\")\n",
            "print(\"Ensure your server.jsx points to /query endpoint.\")\n",
            "\n",
            "async def start_server():\n",
            "    config = uvicorn.Config(app, host=\"0.0.0.0\", port=8000, loop=\"asyncio\")\n",
            "    server = uvicorn.Server(config)\n",
            "    await server.serve()\n",
            "\n",
            "if __name__ == \"__main__\":\n",
            "    # Add server task to the notebook loop\n",
            "    loop = asyncio.get_event_loop()\n",
            "    loop.create_task(start_server())"
        ]
    })
    
    nb = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=2)
    print(f"Notebook created at: {target_path}")

if __name__ == "__main__":
    create_notebook()
