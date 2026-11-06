# StillDeadcode/qwen3.8-27b-iq8r

## Resumen

Qwen3.8-27B IQ8R es una cuantización int8 (W8A8) del modelo multimodal Qwen/Qwen3.8-27B, creada por el usuario StillDeadcode como participación en el "Qwen3.8-27B quantization challenge" organizado en torno al motor de inferencia radiance. El modelo base conserva su torre de visión de 27 bloques (bf16) para procesar imágenes y vídeo, mientras que el tronco de texto se cuantiza a int8 mediante GPTQ con una rotación de Hadamard por bloques de 128 canales, una técnica que reduce los valores atípicos de activación y mejora la fidelidad de la cuantización.

El resultado se distribuye como un único contenedor `.rad` de 27,95 GiB (8,50 bits por peso) diseñado específicamente para el motor radiance sobre GPU AMD RDNA4 con ROCm. No es un checkpoint estándar de Hugging Face (safetensors) ni compatible con llama.cpp o vLLM convencionales: requiere el runtime radiance. Su relevancia radica en demostrar cuantización W8A8 de altísima fidelidad (divergencia KL media de 0,00055 frente al modelo bf16) en hardware AMD, un ecosistema históricamente menos atendido que CUDA.

El modelo base es multimodal (image-text-to-text), con contexto entrenado de 262.144 tokens y una cabecera de predicción multi-token (MTP) de una capa, que el contenedor también cuantiza a int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas SSM (presencia de matrices `ssm_inz`/`ssm_out` en la receta) + torre de visión de 27 bloques; cabecera MTP de una capa |
| Parametros totales | no disponible (el contenedor pesa 27,95 GiB a 8,50 bits/weight en el tronco de texto) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens (entrenados); el ejemplo de servicio usa 200.000 |
| Tipos de cuantizacion | int8 W8A8 (GPTQ con rotación Hadamard fwht128, escalas bf16 por fila y por grupo de 128); lm_head y MTP head en int8 por redondeo (RTN); torre de visión en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor `.rad` (motor radiance); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, es un modelo multimodal con torre de visión de 27 bloques capaz de procesar imágenes y vídeo en conversaciones, un contexto entrenado de 262.144 tokens y una cabecera de predicción multi-token (MTP) de una capa. La receta de cuantización revela la existencia de proyecciones `ssm_inz` y `ssm_out` en los bloques del tronco, lo que apunta a una arquitectura híbrida que combina atención con capas de tipo SSM (state-space model), aunque la model card no detalla la proporción ni la disposición exacta de estas capas. Tampoco se especifican en la ficha los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO).

La aportación de esta ficha no es el modelo base sino su cuantización. Cada capa lineal del tronco se cuantiza a int8 (códigos simétricos −127..127) con escala bf16 por fila y por grupo de 128 canales, aplicando previamente una transformada de Hadamard no normalizada (fwht128) sobre cada grupo de 128 de K, tanto en pesos como en activaciones (esquema W8A8). Los códigos se obtienen con GPTQ contra matrices de Hesse (gramianas de entrada) registradas ejecutando el modelo bf16 sobre el split `calib` del dataset del reto, `StillDeadcode/qwen3.8-27b-quant-challenge`. El lm_head y la cabecera MTP se cuantizan por redondeo al vecino más próximo. La torre de visión se mantiene en bf16 para no degradar la percepción multimodal.

## Capacidades

- Generacion de texto y chat multi-turno, servida vía API compatible con OpenAI (`/v1/chat/completions` y `/v1/completions`).
- Comprensión de imágenes y vídeo: la torre de visión (27 bloques, bf16) acepta partes `image_url` y `video_url` en los mensajes de chat.
- Tool calling / function calling: el servidor soporta llamadas a herramientas de forma nativa.
- Structured output: generación de salidas estructuradas conforme a esquema.
- Contexto largo: hasta 262.144 tokens entrenados (el ejemplo de despliegue se configura con 200.000).
- Predicción multi-token (MTP): cabecera de una capa que puede acelerar la decodificación, cuantizada a int8.
- Razonamiento, código y matemáticas: heredados del modelo base Qwen3.8-27B; la model card no publica evaluaciones específicas de estas capacidades.

## Casos de uso

- Chatbots multimodales con contexto largo: con 200.000-262.000 tokens de ventana, puede ingerir documentos extensos junto a imágenes y vídeo manteniendo el hilo de la conversación en despliegues tipo RAG visual.
- Atención al cliente automatizada: el soporte de tool calling y structured output permite integrarlo con sistemas de tickets y CRM, gestionando conversaciones multi-turno con capturas de pantalla o fotos de productos aportadas por el usuario.
- Agentes con herramientas: la compatibilidad con function calling en la API OpenAI lo hace apto para frameworks de agentes que ejecutan múltiples pasos y llamadas encadenadas.
- Análisis de vídeo e imágenes en local: la torre de visión en bf16 preserva la calidad multimodal mientras el tronco texto corre en int8, útil para describir, clasificar o responder preguntas sobre contenido visual sin depender de la nube.
- Inferencia en GPU AMD (RDNA4) con ROCm: es de los pocos checkpoints optimizados específicamente para este hardware, ideal para estaciones de trabajo sin NVIDIA que necesiten un modelo de 27B multimodal.
- Servicios con API OpenAI-compatible: el servidor radiance expone endpoints estándar, de modo que aplicaciones ya integradas con OpenAI pueden migrar cambiando solo la URL base.
- Generación de texto de alta fidelidad cuantizada: la divergencia KL media de 0,00055 frente al bf16 y un 99,18 % de acuerdo top-1 hacen viable su uso en producción donde la degradación por cuantización debe ser mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica publicada es la calidad de la cuantización medida como divergencia KL respecto a la distribución de siguiente token del modelo bf16, sobre el tier T1 del split privado del reto (155.666 posiciones de turnos del asistente, incluidas tool calls):

| Métrica | Valor |
|---|---|
| KLD media | 0,00055 |
| KLD percentil 99 | 0,0033 |
| KLD percentil 99,9 | 0,0232 |
| Acuerdo top-1 con bf16 | 99,18 % |

## Requisitos de hardware

- Tamaño del contenedor: 27,95 GiB (pesos de texto a 8,50 bits/weight más torre de visión en bf16). La VRAM necesaria será algo superior por activaciones, KV cache y overhead del runtime.
- GPU objetivo: AMD RDNA4 con ROCm; el motor radiance está dirigido a esta familia. El ejemplo de servicio usa tensor parallelism de 2 GPUs (`--tp 2`), lo que sugiere que el modelo está pensado para repartirse entre dos aceleradoras RDNA4.
- Consumer GPU: no disponible información específica; con ~28 GiB de pesos no cabe en una sola GPU de 24 GB (RTX 4090/7900 XTX), pero sí repartido en dos GPUs de 16-24 GB según la configuración `--tp 2` del ejemplo.
- GPUs NVIDIA: no compatible según la información disponible; el contenedor `.rad` es específico del motor radiance (AMD/ROCm).
- Despliegue: exclusivamente mediante el motor radiance (`radiance --model qwen3.8-27b-iq8r.rad`). No es compatible con vLLM, llama.cpp, Ollama o TGI al no tratarse de safetensors ni GGUF.
- Configuración de servicio de referencia: `--max-model-len 200000 --max-num-seqs 8`, expuesto en el puerto 8000 con API OpenAI. Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa orientativa con el modelo base sin cuantizar y con rutas de cuantización alternativas habituales. Los datos de rendimiento de terceros no están disponibles.

| Modelo | Formato | Tamaño | Cuantización | Contexto | Licencia | Runtime |
|---|---|---|---|---|---|---|
| StillDeadcode/qwen3.8-27b-iq8r | `.rad` | 27,95 GiB | int8 W8A8 GPTQ + Hadamard | 262.144 | Apache 2.0 | radiance (AMD RDNA4) |
| Qwen/Qwen3.8-27B (base) | safetensors (bf16) | ~54 GiB estimados (no disponible) | bf16 | 262.144 | Apache 2.0 | vLLM, TGI, etc. |
| Cuantizaciones GGUF típicas de 27B (Q8_0) | GGUF | ~28-29 GiB estimados | int8 | 262.144 (según base) | Apache 2.0 | llama.cpp, Ollama |

Diferencias clave: frente al bf16 original, esta versión reduce el footprint a la mitad con degradación mínima medida (KLD media 0,00055), pero sacrifica compatibilidad con el ecosistema CUDA/llama.cpp al quedar ligada a radiance. Frente a un GGUF Q8_0 equivalente en tamaño, la variante IQ8R aplica rotación de Hadamard y calibración GPTQ por Hessianas, lo que suele reportar mayor fidelidad, aunque no hay comparativas directas publicadas.

## Limitaciones y advertencias

- Compatibilidad de runtime muy restringida: el contenedor `.rad` solo funciona con el motor radiance sobre AMD RDNA4/ROCm. No es utilizable en GPUs NVIDIA ni con runtimes mayoritarios (vLLM, llama.cpp, Ollama, TGI).
- El mecanismo de registro de Hessianas ("recording tap") aún no está en una versión pública de radiance, según la propia model card, lo que dificulta reproducir el proceso de cuantización.
- Riesgo de alucinación: inherente a todo LLM; la cuantización int8 con Hadamard minimiza la desviación (99,18 % de acuerdo top-1), pero no elimina errores del modelo base.
- Sesgos: heredados del modelo base y de sus datos de entrenamiento, no documentados en la ficha.
- Idiomas soportados: no disponibles; debe verificarse en el modelo base antes de uso en producción.
- La torre de visión permanece en bf16, por lo que el consumo de memoria crece con resoluciones de imagen/vídeo altas.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los términos de licencia del modelo base Qwen3.8-27B.
- El contexto entrenado es de 262.144 tokens, pero el ejemplo de servicio lo limita a 200.000; usar longitudes mayores requiere ajustar `--max-model-len` y más VRAM para la cache.
- Descargas: 0 en el momento de redactar la ficha; es un artefacto de un reto de cuantización, sin histórico de uso en producción.

## Enlaces

- Ficha del modelo: https://huggingface.co/StillDeadcode/qwen3.8-27b-iq8r
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de calibración del reto: https://huggingface.co/datasets/StillDeadcode/qwen3.8-27b-quant-challenge
- Motor de inferencia radiance y documentación: no disponible en la información proporcionada
