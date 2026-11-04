# wkhaifor/Qwen3.5-9B-GPTQ-W4A16-G128-LLMCompressor

## Resumen

Qwen3.5-9B-GPTQ-W4A16-G128-LLMCompressor es una cuantización de pesos INT4 del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario wkhaifor. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer de 9.409.813.744 parámetros con capacidad image-text-to-text (procesa imagen y texto y genera texto). Esta versión cuantizada reduce el peso de los pesos de 17,98 GiB en FP16 a 10,651 GiB mediante GPTQ con grupo de 128 y activaciones en FP16 (W4A16), manteniendo en coma flotante las capas `visual`, `linear_attn`, `lm_head` y otras no objetivo.

La relevancia de esta ficha es doble: por un lado, demuestra un flujo de cuantización reproducible con llm-compressor 0.14.0 y el formato compressed-tensors 0.19.0, consumible directamente por vLLM 0.32.0; por otro, documenta una comparación controlada FP16/FP8/INT4 sobre el mismo hardware (RTX 4090 D) que permite evaluar el coste real de la cuantización en precisión y throughput. El autor advierte de que los resultados de precisión están limitados por el presupuesto de generación (más del 90 % de las respuestas alcanzaron el límite de 1024 tokens), por lo que deben interpretarse como una señal comparativa, no como una medida absoluta de capacidad.

La licencia es Apache-2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales más allá de las del propio Qwen3.5-9B. El modelo se publica también en ModelScope con los mismos pesos y registros de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); incluye capas `visual` y `linear_attn` que se mantienen en precisión flotante |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de vLLM usa `max_model_len=4096`) |
| Tipos de cuantizacion | GPTQ INT4 W4A16, grupo de 128, simétrico, actorder estático; activaciones FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato compressed-tensors 0.19.0 (consumible por vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer multimodal de 9.4 mil millones de parámetros que acepta entradas de imagen y texto y genera texto. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; tampoco se especifica la innovación arquitectónica concreta del bloque `linear_attn` más allá de su existencia en el checkpoint. La model card del cuantizador no aporta datos sobre el preentrenamiento del base.

El proceso de cuantización sí está documentado con precisión: se aplicó GPTQ a 128 capas lineales del componente lingüístico, con tamaño de grupo 128, cuantización simétrica y actorder estático, manteniendo las activaciones en FP16. La calibración usó 256 preguntas del conjunto de entrenamiento de GSM8K, semilla 42 y longitud máxima de secuencia de 512 tokens. Las capas `visual`, `linear_attn`, `lm_head` y el resto de capas no objetivo permanecen en precisión flotante, y la KV cache queda a expensas de la configuración por defecto del motor de inferencia. El resultado son 10,651 GiB de pesos INT4 frente a 17,980 GiB en FP16 y 13,045 GiB en FP8. El commit exacto del modelo base empleado no quedó registrado.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), tal como muestra el ejemplo de la model card.
- Procesamiento de entradas image-text-to-text heredado del modelo base; el pipeline declarado es `image-text-to-text`.
- Razonamiento con plantilla de "thinking" por defecto, empleada en la evaluación con GSM8K.
- Capacidad matemática evaluada sobre GSM8K (27/100 con presupuesto de 1024 tokens en la versión GPTQ).
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue en GPU de consumo para inferencia multimodal: con 10,651 GiB de pesos INT4 y un pico de 20,607 GiB reservados en la prueba sobre RTX 4090 D, el modelo encaja en GPUs de 24 GB, lo que permite ejecutar un modelo de 9.4B con visión en hardware de gama alta para consumidores.
- Sustitución de FP16 en entornos con VRAM limitada: la reducción de 17,980 GiB a 10,651 GiB libera aproximadamente 7,3 GiB que pueden destinarse a KV cache o a un mayor `max_num_seqs`, manteniendo una precisión GSM8K comparable en la prueba del autor (27 % frente a 24 % en FP16, dentro del ruido de una muestra de 100 preguntas).
- Servicio de chat con vLLM: la integración con compressed-tensors en vLLM 0.32.0 permite levantar un endpoint OpenAI-compatible con `max_model_len=4096` y `gpu_memory_utilization=0.90`, adecuado para asistentes conversacionales de texto.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye el comando de reproducción (`run.py quantize --tool llmcompressor --method gptq ...`), lo que lo convierte en una referencia práctica para equipos que quieran replicar el pipeline GPTQ W4A16 con llm-compressor.
- Prototipado de aplicaciones image-text-to-text en local: al conservar las capas `visual` en coma flotante, el modelo mantiene la ruta multimodal del base y sirve para experimentar con descripción de imágenes o preguntas sobre documentos escaneados sin depender de APIs externas.
- Docencia y formación en cuantización: los ficheros `config.json`, `recipe.yaml` y `SHA256SUMS` documentan la receta completa y las sumas de verificación, útiles para explicar el impacto de grupo de 128, actorder y calibración con 256 muestras.
- Inferencia por lotes de bajo throughput: con 31,521 tokens/s en modo serial y `max_num_seqs=1` en la configuración de ejemplo, encaja en tareas de generación offline donde prima el coste por token sobre la latencia.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre GSM8K (primeras 100 preguntas del test, plantilla de pensamiento por defecto, límite de 1024 tokens, RTX 4090 D, vLLM 0.32.0, Marlin W4A16 para la fila GPTQ):

| Modelo | Correctas/100 | Precisión | Tasa de respuesta con análisis | Tasa de tope de tokens | Tokens/s serial | Pico allocated (GiB) | Pico reserved (GiB) | Pesos (GiB) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FP16 | 24 | 24,0 % | 25,0 % | 91,0 % | 40,075 | 20,645 | 20,662 | 17,980 |
| FP8 | 28 | 28,0 % | 28,0 % | 91,0 % | 31,595 | 20,416 | 20,434 | 13,045 |
| GPTQ (este modelo) | 27 | 27,0 % | 27,0 % | 96,0 % | 31,521 | 20,607 | 20,645 | 10,651 |

Advertencia del autor: en todos los grupos más del 90 % de las generaciones alcanzaron el límite de 1024 tokens, por lo que la precisión está acotada por el presupuesto de generación y no mide la capacidad máxima del modelo. La fila FP8 corresponde a una versión experimental del momento. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: pesos de 10,651 GiB en INT4; el autor midió 20,607 GiB de memoria asignada y 20,645 GiB reservada en pico sobre una RTX 4090 D con `gpu_memory_utilization=0.90`, `max_num_seqs=1` y `max_model_len=4096`.
- GPU recomendadas: RTX 4090 / 4090 D (24 GB) es la plataforma validada por el autor. Por capacidad de memoria, debería caber en RTX 3090 (24 GB), A10G (24 GB), L4 (24 GB), A100 (40/80 GB) y H100 (80 GB), aunque no hay validación publicada en esas tarjetas.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB como la RTX 4090; no hay datos para tarjetas de 16 GB o menos.
- Opciones de despliegue: vLLM 0.32.0 con soporte de compressed-tensors (ruta validada). El autor indica `enforce_eager=True` en el ejemplo. No se documenta compatibilidad con llama.cpp, Ollama ni TGI; el formato compressed-tensors es específico de vLLM y de la pila de llm-compressor.
- Latencia y throughput: 31,521 tokens/s en modo serial con `max_num_seqs=1` sobre RTX 4090 D, frente a 40,075 tokens/s en FP16. La cuantización reduce el throughput serial aproximadamente un 21 % respecto a FP16 en esta configuración, aunque el autor no analiza la causa.

## Comparativa con modelos similares

| Modelo | Parámetros | Pesos (GiB) | Precisión GSM8K (100) | Tokens/s serial | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| Este modelo (GPTQ W4A16) | 9,41B | 10,651 | 27,0 % | 31,521 | Apache-2.0 | safetensors / compressed-tensors |
| Qwen3.5-9B FP16 (base) | 9,41B | 17,980 | 24,0 % | 40,075 | Apache-2.0 | safetensors |
| Qwen3.5-9B FP8 (experimental) | 9,41B | 13,045 | 28,0 % | 31,595 | Apache-2.0 | no disponible |

La comparación se limita a las variantes del mismo modelo base medidas por el autor, porque la información proporcionada no incluye datos de modelos alternativos de otros desarrolladores. No disponible la comparación con otros modelos de 9B de la competencia.

## Limitaciones y advertencias

- Los resultados de precisión publicados (GSM8K, 100 preguntas) están limitados por el presupuesto de generación: más del 90 % de las respuestas alcanzaron el tope de 1024 tokens, por lo que las cifras subestiman la capacidad real y no deben usarse como benchmark absoluto.
- La calibración GPTQ usó solo 256 muestras de GSM8K con longitud máxima de 512 tokens; un dominio de calibración tan estrecho (matemáticas) puede degradar la precisión en otras tareas respecto a una calibración más diversa.
- Las capas `visual` y `linear_attn` se mantienen en coma flotante, de modo que el ahorro de VRAM se concentra en el componente lingüístico; el consumo real del pipeline multimodal completo puede ser mayor que el medido en la prueba de texto.
- El commit exacto del modelo base no quedó registrado, lo que dificulta la reproducibilidad exacta de la cuantización.
- No se documentan sesgos conocidos, comportamiento multilingüe ni tasas de alucinación específicas de esta versión cuantizada; deben asumirse los del modelo base Qwen3.5-9B.
- El formato compressed-tensors 0.19.0 requiere versiones concretas del stack (vLLM 0.32.0, llm-compressor 0.14.0); otras versiones pueden no cargar los pesos.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar la licencia de Qwen/Qwen3.5-9B para obligaciones adicionales de atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/wkhaifor/Qwen3.5-9B-GPTQ-W4A16-G128-LLMCompressor
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio espejo en ModelScope: https://www.modelscope.cn/models/kfcVme50/Qwen3.5-9B-GPTQ-W4A16-G128-LLMCompressor
- Ficheros de configuración y receta en el repo: `config.json`, `recipe.yaml`, `SHA256SUMS`, `LICENSE`
