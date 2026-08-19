# tujusticia/nissi-lawg4-e2b

## Resumen
El modelo `tujusticia/nissi-lawg4-e2b` es un ajuste fino (fine-tuning) del modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, desarrollado por el usuario `tujusticia`, que se identifica como abogados. Aunque la tarjeta del modelo no especifica el propósito, el nombre y el perfil del autor sugieren un uso orientado al ámbito jurídico, probablemente para tareas de generación y análisis de texto legal. El modelo se publica con licencia Apache-2.0 y está pensado para ejecutarse con la librería Transformers y el pipeline `image-text-to-text`, lo que indica que hereda la capacidad multimodal del modelo base Gemma 4 E2B.

El modelo base es una versión cuantizada en 4 bits de Gemma 4 E2B, creada con Unsloth, y el ajuste fino se realizó también con Unsloth y la librería TRL de Hugging Face. El repositorio contiene pesos en formato safetensors con un total de 5.123.178.051 parámetros, lo que lo sitúa en la gama de modelos de ~5 mil millones de parámetros. La relevancia de este modelo radica en su tamaño relativamente compacto, que permite su ejecución en hardware de consumo, y en su potencial aplicación especializada en el sector legal, un área donde los modelos generalistas suelen carecer de precisión terminológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B, variante multimodal) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 4 E2B se describe en fuentes externas con 8K, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | El modelo base es bnb-4bit; el repositorio contiene safetensors (no se indica el tipo exacto de cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también existe una variante GGUF en otro repositorio) |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Gemma 4 E2B, una familia de modelos de Google DeepMind que combina capacidades de texto e imagen (pipeline image-text-to-text). El ajuste fino se realizó sobre una versión cuantizada en 4 bits (`unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`) utilizando la librería Unsloth, que optimiza el entrenamiento reduciendo el consumo de memoria y acelerando el proceso, y la librería TRL de Hugging Face para el entrenamiento con refuerzo (RLHF/DPO, aunque no se especifica el método exacto). No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni el proceso de alineación. La técnica de cuantización base (4 bits) sugiere que el modelo fue entrenado con técnicas de LoRA/QLoRA, aunque esto no se confirma explícitamente.

## Capacidades
- Generación de texto y comprensión de lenguaje natural, heredadas del modelo base Gemma 4 E2B.
- Procesamiento de entrada multimodal (imagen y texto), según el pipeline `image-text-to-text` declarado en HuggingFace.
- Soporte de instrucciones conversacionales (modelo ajustado para chat, por el tag `conversational`).
- Compatible con `text-generation-inference` y `transformers`, lo que permite su integración en entornos de producción.
- Capacidad de ejecución en CPU (según fuentes externas sobre Gemma 4 E2B, aunque no se confirma para este ajuste).
- No se dispone de información sobre tool calling, agentes, razonamiento multi-step o capacidades especiales (como thinking mode) en este modelo concreto.

## Casos de uso
- Análisis de documentos legales: el modelo puede resumir contratos, sentencias o escritos, aprovechando su capacidad de texto largo (si el contexto lo permite, no confirmado).
- Asistente jurídico conversacional: integrable en un chatbot para resolver dudas legales básicas en inglés, con respuestas basadas en el entrenamiento del modelo.
- Revisión de cláusulas contractuales: mediante la generación de resúmenes y detección de posibles problemas en textos legales.
- Generación de informes y memorandos: el modelo puede redactar borradores de documentos legales a partir de notas o instrucciones.
- Procesamiento de documentos escaneados: al ser multimodal, podría combinarse con OCR para extraer y procesar información de imágenes de documentos legales.
- Clasificación de jurisprudencia: etiquetado automático de sentencias o artículos legales en categorías predefinidas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros para este modelo concreto. Se recomienda evaluar el modelo en el dominio legal antes de su uso en producción.

## Requisitos de hardware
- El modelo tiene ~5.1 mil millones de parámetros, por lo que en precisión completa (fp16) necesitaría al menos 10 GB de VRAM. Con cuantización 4 bits (como el modelo base) el requisito se reduce a unos 3-4 GB.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM (RTX 3070, RTX 4060, A100, etc.) para inferencia fluida. Modelos con 6 GB podrían funcionar con cuantización agresiva.
- Puede ejecutarse en CPU (según fuentes externas sobre Gemma 4 E2B), aunque con mayor latencia.
- Opciones de despliegue: compatible con `transformers`, `text-generation-inference` (TGI), vLLM, llama.cpp (mediante la variante GGUF publicada), y Ollama (si se convierte a formato GGUF).
- No se conocen datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares
No disponible. No se han identificado modelos comparables dentro de la información proporcionada. Se recomienda comparar con otros modelos de ~5B parámetros como Gemma 2 5B, Llama 3.1 8B o Mistral 7B, pero no se dispone de datos para establecer una comparación objetiva.

## Limitaciones y advertencias
- Sesgos: al ser un ajuste fino de Gemma 4 E2B, hereda los sesgos del modelo base, que pueden incluir estereotipos o respuestas inexactas en dominios específicos.
- Riesgo de alucinación: el modelo puede generar información falsa o inventada, especialmente en contextos legales donde la precisión es crítica.
- Limitaciones de idioma: la tarjeta del modelo indica solo inglés (`language: en`), por lo que su uso en otros idiomas puede degradar el rendimiento.
- Contexto limitado: aunque no se confirma, el modelo base Gemma 4 E2B tiene un contexto de 8K tokens, lo que puede ser insuficiente para documentos legales extensos.
- Licencia: aunque el modelo se publica bajo Apache-2.0, el modelo base Gemma 4 de Google tiene sus propios términos de uso. Se debe verificar si la licencia Apache-2.0 del ajuste fino es compatible con el uso comercial y si se requiere aceptar los términos de Gemma.
- No se ha verificado la calidad del ajuste fino: al no haber benchmarks ni ejemplos de uso, se desconoce si el modelo es realmente útil para tareas legales.

## Enlaces
- HuggingFace del modelo: https://huggingface.co/tujusticia/nissi-lawg4-e2b
- Modelo GGUF (variante cuantizada): https://huggingface.co/tujusticia/nissi-lawg4-merged-fp16-Q4_K_M-GGUF
- Perfil del autor: https://huggingface.co/tujusticia/models
- Guía de Gemma 4 E2B (externa): https://www.gemma4.wiki/models/gemma-4-e2b-model
- Información de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
