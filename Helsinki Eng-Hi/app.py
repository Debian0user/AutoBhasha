from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import MarianMTModel, MarianTokenizer
import torch
import logging


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for model and tokenizer
model = None
tokenizer = None

def load_model():
    """Load the OPUS-MT model and tokenizer"""
    global model, tokenizer
    
    try:
        model_name = "Helsinki-NLP/opus-mt-en-hi"
        logger.info(f"Loading model: {model_name}")
        
        # Load tokenizer and model
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
        
        # Move to GPU if available
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        model.eval()
        
        logger.info(f"Model loaded successfully on {device}")
        return True
        
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

def translate_text(text, max_length=512):
    """Translate English text to Hindi"""
    try:
        # Tokenize input
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=max_length)
        
        # Move inputs to same device as model
        device = next(model.parameters()).device
        inputs = {key: value.to(device) for key, value in inputs.items()}
        
        # Generate translation
        with torch.no_grad():
            translated = model.generate(**inputs, max_length=max_length, num_beams=4, early_stopping=True)
        
        # Decode the translation
        translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
        
        return translated_text
        
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return None

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "model": "Helsinki-NLP/opus-mt-en-hi",
        "description": "English to Hindi Translation API"
    })

@app.route('/translate', methods=['POST'])
def translate():
    """Main translation endpoint"""
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "error": "Missing 'text' field in request body"
            }), 400
        
        input_text = data['text']
        
        if not input_text or not input_text.strip():
            return jsonify({
                "error": "Empty text provided"
            }), 400
        
        # Get max_length parameter (optional)
        max_length = data.get('max_length', 512)
        
        # Translate the text
        translated_text = translate_text(input_text.strip(), max_length)
        
        if translated_text is None:
            return jsonify({
                "error": "Translation failed"
            }), 500
        
        return jsonify({
            "original_text": input_text,
            "translated_text": translated_text,
            "source_language": "en",
            "target_language": "hi"
        })
        
    except Exception as e:
        logger.error(f"API error: {str(e)}")
        return jsonify({
            "error": "Internal server error"
        }), 500

@app.route('/batch_translate', methods=['POST'])
def batch_translate():
    """Batch translation endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({
                "error": "Missing 'texts' field in request body"
            }), 400
        
        texts = data['texts']
        
        if not isinstance(texts, list):
            return jsonify({
                "error": "'texts' must be a list"
            }), 400
        
        if len(texts) > 50:  # Limit batch size
            return jsonify({
                "error": "Maximum 50 texts allowed per batch"
            }), 400
        
        max_length = data.get('max_length', 512)
        
        results = []
        
        for i, text in enumerate(texts):
            if not text or not text.strip():
                results.append({
                    "index": i,
                    "original_text": text,
                    "translated_text": "",
                    "error": "Empty text"
                })
                continue
            
            translated = translate_text(text.strip(), max_length)
            
            if translated is None:
                results.append({
                    "index": i,
                    "original_text": text,
                    "translated_text": "",
                    "error": "Translation failed"
                })
            else:
                results.append({
                    "index": i,
                    "original_text": text,
                    "translated_text": translated,
                    "error": None
                })
        
        return jsonify({
            "results": results,
            "source_language": "en",
            "target_language": "hi"
        })
        
    except Exception as e:
        logger.error(f"Batch API error: {str(e)}")
        return jsonify({
            "error": "Internal server error"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Detailed health check"""
    try:
        # Test translation with a simple sentence
        test_result = translate_text("Hello, how are you?")
        
        return jsonify({
            "status": "healthy",
            "model_loaded": model is not None,
            "tokenizer_loaded": tokenizer is not None,
            "gpu_available": torch.cuda.is_available(),
            "test_translation": test_result is not None
        })
        
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Load model on startup
    if load_model():
        logger.info("Starting Flask app...")
        app.run(host='0.0.0.0', port=7860, debug=False)
    else:
        logger.error("Failed to load model. Exiting...")
        exit(1)
