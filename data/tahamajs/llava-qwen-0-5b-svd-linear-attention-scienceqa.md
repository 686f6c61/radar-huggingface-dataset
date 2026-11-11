# tahamajs/llava-qwen-0.5b-svd-linear-attention-scienceqa

## Resumen

llava-qwen-0.5b-svd-linear-attention-scienceqa es un checkpoint experimental de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf, publicado por el autor tahamajs dentro del ecosistema NeuralOps (Attention Surgery Zoo). El modelo no es un entrenamiento desde cero, sino una intervención quirúrgica sobre la atención del decoder: se sustituye la atención cuadrática estándar por un operador denominado SVDLinearAttention (atención lineal factorizada por SVD con decaimiento exponencial opcional) en 18 de las 24 capas del decoder Qwen2, manteniendo 6 capas ancla cuadráticas en un patrón híbrido 3:1.

El objetivo del checkpoint es demostrar que es posible comprimir y linealizar la atención de un VLM pequeño conservando buena parte de su capacidad mediante destilación de conocimiento (knowledge distillation) desde el modelo profesor original. El resultado empaquetado es un delta quirúrgico de solo 80,71 MB en safetensors FP16, frente a los 1,66 GB del modelo base completo, lo que supone una reducción del 95,3 % en el artefacto serializado.

Es relevante ahora porque ejemplifica una línea de investigación práctica sobre eficiencia en VLMs: atención lineal, factorización SVD y destilación aplicadas a un modelo multimodal de 0,5B parámetros, evaluado en el subconjunto con imágenes de ScienceQA. No obstante, se trata de un artefacto de investigación con cero descargas y sin verificación externa de sus métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decoder Qwen2 de 24 capas) con atención lineal SVDLinearAttention en 18/24 capas y 6 capas ancla cuadráticas (patrón híbrido 3:1) |
| Parametros totales | 0,5B (modelo base); el artefacto publicado contiene solo los pesos de atención modificados y layernorms entrenados (80,71 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, FP16, formato attention_only_fp16) + surgical_manifest.json |

## Arquitectura y entrenamiento

El modelo parte de llava-interleave-qwen-0.5b-hf: una torre visual SigLIP congelada de 27 capas, un proyector MLP de 2 capas y un decoder Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas de atención y head_dim=64. La intervención reemplaza la self-attention en 18 de las 24 capas del decoder por SVDLinearAttention, un operador de atención lineal factorizada mediante SVD con gating de decaimiento exponencial opcional. Las capas [3, 7, 11, 15, 19, 23] conservan atención cuadrática como anclas, dando lugar a un esquema híbrido 3:1. Permanecen congelados la torre visual, el proyector multimodal, los MLP del decoder y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decoder.

El entrenamiento se realizó en dos etapas de destilación de conocimiento desde el profesor original, con 293 pasos totales (133 en la etapa 1 y 160 en la etapa 2), una duración de 120,1 segundos y un pico de VRAM de 16.264 MB en una única NVIDIA RTX 3090 de 24 GB. El dataset de evaluación y, presumiblemente, de ajuste es derek-thomas/ScienceQA. El autor no documenta el número de tokens de entrenamiento, la composición exacta del dataset de destilación ni detalles sobre RLHF/DPO (no se mencionan).

## Capacidades

- Generación de texto e imagen-a-texto conversacional (pipeline image-text-to-text) con plantilla de chat incluida.
- Respuesta a preguntas visuales sobre imágenes, especialmente en dominios STEM (ciencia, tecnología, ingeniería y matemáticas) dado el ajuste sobre ScienceQA.
- Razonamiento visual de opción múltiple: el ejemplo de la model card pide responder con la letra de la opción.
- Capacidad multilingüe: solo inglés declarado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, audio, visión adicional): únicamente visión; no se documentan otras.

## Casos de uso

- Investigación en eficiencia de atención: servir como banco de pruebas reproducible para comparar SVDLinearAttention frente a atención cuadrática en un VLM pequeño, usando el manifiesto quirúrgico para auditar qué capas se modificaron.
- Evaluación de destilación de conocimiento: medir la brecha profesor-alumno (63,75 % frente a 50,62 % en ScienceQA) en experimentos de compresión de VLMs con presupuesto de GPU reducido (una RTX 3090).
- Prototipado de asistentes educativos STEM: el modelo responde preguntas de ciencia con imagen y opción múltiple, adecuado para demos de bajo coste en entornos de investigación, no para producción.
- Estudio de atención híbrida: analizar el efecto de mantener 6 capas cuadráticas como anclas en la calidad de las representaciones multimodales.
- Reproducción de pipelines NeuralOps: validar el flujo load_surgeried_model y el esquema neuralops.surgery/v2 en integraciones propias.
- Docencia y divulgación: ilustrar en un curso cómo una intervención quirúrgica sobre la atención reduce el artefacto de 1,66 GB a 80,71 MB (21,08 veces más pequeño) con una pérdida de precisión medible.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados externamente):

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto STEM con imágenes, validation) | 63,75 | 31,87 | 50,62 | +18,75 |
| Perplexity en ScienceQA (validation) | 2,45 | 607,29 | 2,73 | -604,56 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El artefacto publicado pesa 80,71 MB (solo pesos de atención y layernorms); para inferencia completa hay que cargarlo junto con el modelo base llava-hf/llava-interleave-qwen-0.5b-hf (1,66 GB en FP16).
- VRAM estimada para inferencia del modelo completo en FP16: en torno a 3-4 GB incluyendo activaciones y caché KV para contextos moderados (estimación a partir del tamaño del base; el autor no publica cifras de inferencia).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090); el entrenamiento se realizó en una RTX 3090 de 24 GB con 16.264 MB de pico.
- Cabe en GPU consumer: sí, con holgura en 8 GB para FP16.
- Opciones de despliegue: el autor solo documenta la API neuralops.hub.load_surgeried_model; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de entrenamiento (120,1 s para 293 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, STEM con imágenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-svd-linear-attention-scienceqa | 0,5B (delta de 80,71 MB) | no disponible | 50,62 % accuracy / 2,73 PPL (declarado) | MIT | Hugging Face, librería neuralops |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75 % accuracy / 2,45 PPL (según el autor) | no disponible en la información | Hugging Face |
| Otros VLMs de ~0,5B (p. ej. variantes Qwen2-VL pequeñas) | ~0,5B | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de terceros no está disponible en la información proporcionada; los únicos datos numéricos son los del propio autor frente a su modelo base.

## Limitaciones y advertencias

- Métricas no verificadas: el model-index marca verified: false; no hay evaluación independiente.
- Pérdida de precisión notable frente al profesor: 50,62 % frente a 63,75 % en ScienceQA, es decir, 13,13 puntos porcentuales por debajo.
- El checkpoint contiene solo los pesos de atención modificados y layernorms; no es autónomo y requiere cargar el modelo base llava-hf/llava-interleave-qwen-0.5b-hf.
- Solo inglés declarado; sin soporte multilingüe documentado.
- Riesgo de alucinación inherente a un VLM de 0,5B ajustado con destilación y solo 293 pasos de optimización.
- Sesgos: no documentados por el autor; al entrenarse sobre ScienceQA, el dominio está sesgado hacia preguntas STEM de opción múltiple.
- Licencia MIT para el artefacto, pero conviene verificar la licencia del modelo base antes de uso comercial.
- Cero descargas y cero likes en el momento de la ficha: ecosistema mínimo, sin soporte comunitario.
- Dependencia de la librería neuralops y del esquema neuralops.surgery/v2; no hay pesos en GGUF ni integración con runtimes estándar.
- Longitud de contexto no documentada: no apta para tareas de contexto largo sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-svd-linear-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_linear_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset: https://huggingface.co/datasets/derek-thomas/ScienceQA
