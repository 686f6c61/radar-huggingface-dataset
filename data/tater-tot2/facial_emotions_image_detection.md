# tater-tot2/facial_emotions_image_detection

## Resumen

`tater-tot2/facial_emotions_image_detection` es un modelo de clasificación de imágenes especializado en el reconocimiento de emociones faciales. Se trata de un fine-tuning del Vision Transformer `google/vit-base-patch16-224-in21k` sobre un conjunto de datos de rostros etiquetados con siete categorías emocionales (sad, disgust, angry, neutral, fear, surprise, happy). El autor publica el modelo en Hugging Face con licencia Apache 2.0 y reporta una precisión global de aproximadamente el 91% sobre un conjunto de validación de 25 170 imágenes.

El modelo resuelve una tarea concreta de visión por computador: dada una imagen de un rostro humano, predecir la emoción dominante entre siete clases discretas. Con 85,8 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, lo que lo hace adecuado para prototipos, análisis de audiencia, investigación en interacción persona-máquina y aplicaciones de moderación o análisis de contenido.

Su relevancia actual radica en que reutiliza una arquitectura estándar (ViT-Base con parches de 16x16 y resolución 224x224) y un checkpoint preentrenado ampliamente conocido, lo que facilita su integración en pipelines existentes de PyTorch y su despliegue mediante herramientas estándar. No obstante, la información publicada es limitada: no hay detalles sobre el dataset de entrenamiento, hiperparámetros, ni evaluación fuera del conjunto de validación reportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16x16, resolución 224x224) |
| Parametros totales | 85.804.039 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía PyTorch/ONNX pero no documentada) |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de tipo base, con 12 capas, 12 cabezas de atención y dimensión oculta de 768, derivado de `google/vit-base-patch16-224-in21k`. La imagen de entrada se divide en parches de 16x16 píxeles sobre una resolución de 224x224, se proyectan linealmente y se procesan mediante bloques de self-attention. La cabeza de clasificación se ha sustituido para producir 7 logits correspondientes a las emociones faciales.

El entrenamiento consiste en un fine-tuning supervisado sobre un dataset de imágenes faciales etiquetadas (no se especifica su composición, tamaño ni procedencia en la model card). No se documenta el uso de RLHF, DPO ni técnicas de aumento de datos. La única métrica publicada es el informe de clasificación sobre un conjunto de validación de 25 170 imágenes, con precisión global de 0,9092 y F1 macro de 0,9091. No se detalla el número de épocas, la tasa de aprendizaje ni el hardware empleado.

## Capacidades

- Clasificación de emociones faciales en 7 clases discretas: sad, disgust, angry, neutral, fear, surprise, happy.
- Procesamiento de imágenes RGB de 224x224 píxeles (redimensionado y normalización estándar de ViT).
- Inferencia por imagen individual; no soporta vídeo ni secuencias temporales de forma nativa.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión más allá de la clasificación, audio ni generación de texto.

## Casos de uso

- Análisis de audiencia en marketing: procesar lotes de imágenes de rostros (por ejemplo, capturas de webinars o pruebas de usuario) para estimar la distribución de emociones y correlacionarla con métricas de engagement. El modelo es adecuado por su bajo coste computacional y su precisión del 91% en validación.
- Investigación en interacción persona-máquina: integrar el modelo en un pipeline de captura de webcam para estudiar respuestas emocionales ante interfaces, con la ventaja de que cabe en una GPU de consumo y permite iteración rápida.
- Moderación de contenido visual: detectar rostros con emociones negativas intensas (angry, disgust) en plataformas de contenido generado por usuarios como señal para revisión humana, usando el modelo como filtro de primera pasada.
- Prototipado de aplicaciones de accesibilidad: construir sistemas que adapten la respuesta de una aplicación según la emoción detectada en el usuario (por ejemplo, simplificar instrucciones si se detecta confusión o frustración), aprovechando la licencia Apache 2.0 para uso comercial.
- Análisis de datasets de imágenes: etiquetar automáticamente grandes colecciones de fotos de rostros con emociones para enriquecer metadatos o entrenar modelos posteriores, dado el bajo coste de inferencia de un ViT-Base.
- Evaluación de experiencia de usuario en pruebas A/B: comparar la respuesta emocional de participantes ante dos variantes de un producto mediante capturas de vídeo muestreadas y clasificadas con este modelo, integrado en un pipeline de PyTorch.

## Benchmarks y rendimiento

Los únicos datos publicados son el informe de clasificación sobre el conjunto de validación del autor (25 170 imágenes). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K (no aplicables a un modelo de visión), ni comparaciones con otros modelos de reconocimiento de emociones.

| Clase | Precision | Recall | F1-score | Support |
|---|---|---|---|---|
| sad | 0,8394 | 0,8632 | 0,8511 | 3596 |
| disgust | 0,9909 | 1,0000 | 0,9954 | 3596 |
| angry | 0,9022 | 0,9035 | 0,9028 | 3595 |
| neutral | 0,8752 | 0,8626 | 0,8689 | 3595 |
| fear | 0,8788 | 0,8532 | 0,8658 | 3596 |
| surprise | 0,9476 | 0,9449 | 0,9463 | 3596 |
| happy | 0,9302 | 0,9372 | 0,9336 | 3596 |
| **Accuracy** | | | **0,9092** | **25170** |
| **Macro avg** | 0,9092 | 0,9092 | 0,9091 | 25170 |
| **Weighted avg** | 0,9092 | 0,9092 | 0,9091 | 25170 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 343 MB para los pesos (85,8 M parámetros × 4 bytes), más overhead de activaciones y framework; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 172 MB para los pesos, más overhead; cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También puede ejecutarse en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: PyTorch nativo, TorchServe, ONNX Runtime, TensorRT, o integración en pipelines de Hugging Face `transformers` con `ViTForImageClassification`. No se documenta soporte específico para vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; para un ViT-Base a 224x224 se espera un throughput de cientos a miles de imágenes por segundo en GPU moderna, pero no se confirma con datos del autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se pueden citar alternativas genéricas del ecosistema (por ejemplo, otros fine-tunings de ViT para emociones faciales o modelos como `trpakov/vit-face-expression`), pero no se han publicado comparaciones directas con este modelo en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tater-tot2/facial_emotions_image_detection | 85,8 M | no aplica | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero los datasets de emociones faciales suelen estar desbalanceados por género, etnia y edad; el modelo puede rendir peor en rostros fuera de la distribución de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificaciones erróneas confiadas en rostros ambiguos, ocluidos o con iluminación adversa.
- Limitaciones de contexto o idioma: el modelo solo procesa imágenes de 224x224; no maneja vídeo, secuencias temporales ni texto. No se especifican idiomas porque no procesa lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se atribuya al autor original.
- Caveats para producción: la model card no documenta el dataset de entrenamiento, los hiperparámetros ni la metodología de evaluación; la precisión del 91% proviene de un único conjunto de validación no descrito. Se recomienda validar el modelo en el dominio objetivo antes de desplegarlo. La clasificación de emociones faciales tiene implicaciones éticas y legales en algunas jurisdicciones (por ejemplo, en el marco del RGPD o la AI Act europea), por lo que su uso en decisiones automatizadas sobre personas requiere evaluación de impacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tater-tot2/facial_emotions_image_detection
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Notebook de referencia en Kaggle: https://www.kaggle.com/code/dima806/facial-emotions-image-detection-vit
