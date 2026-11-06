# turintech/Nemotron-3.5-Bolt-E4B-Artemis-FP8

## Resumen

Nemotron-3.5-Bolt-E4B-Artemis-FP8 es una cuantización en FP8 del modelo NVIDIA Nemotron 3.5 Bolt E4B, publicada por TurinTech. El modelo original es un transformer multimodal de NVIDIA (entrada imagen-texto y audio-texto, salida de texto) con aproximadamente 8.000 millones de parámetros totales, y esta versión mantiene la arquitectura intacta pero almacena las 126 matrices de pesos MLP del modelo de lenguaje en FP8 E4M3, reduciendo el peso de 15,99 GB a 12,76 GB (un 20 % menos).

La motivación de esta conversión es práctica: en vLLM, los pesos en FP8 ocupan 11,07 GiB de VRAM frente a 14,10 GiB del original en BF16, lo que libera memoria para la caché KV. En una RTX 5090 de 32 GB, la caché KV pasa de 154.388 a 211.050 tokens con los valores por defecto de vLLM, y el número de peticiones de 4.096 tokens que caben simultáneamente sube de 37,7 a 51,5. Además, la generación es un 32 % más rápida con una petición y un 43 % más rápida con ocho peticiones concurrentes.

Es relevante ahora porque permite desplegar un modelo de ~8B con torres de visión y audio en GPUs de consumo (incluida una tarjeta de 16 GB, según las pruebas de TurinTech) manteniendo una calidad prácticamente idéntica al original en function calling y matemáticas elementales. La licencia es OpenMDW 1.1, la misma del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base etiquetado como `gemma4`; incluye torres de visión y audio), pesos MLP del LM en FP8 E4M3 con una escala por canal de salida (compressed-tensors `float-quantized`, solo pesos; activaciones en BF16) |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la información proporcionada (las pruebas se hicieron con `--max-model-len 4096`) |
| Tipos de cuantizacion | FP8 E4M3 (esta versión); existe una versión GGUF del mismo autor para llama.cpp; una versión de 4 bits fue descartada por pérdida de calidad |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (compatible con transformers y vLLM; repo de 12,8 GB) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron 3.5 Bolt E4B, un transformer multimodal que acepta texto, imagen y audio como entrada y genera texto. Esta versión de TurinTech no reentrena ni modifica la arquitectura: convierte únicamente las 126 matrices de pesos MLP del modelo de lenguaje a FP8 E4M3 con cuantización por canal de salida mediante compressed-tensors. Las capas de atención, los embeddings, las puertas y proyecciones por capa, y las torres de visión y audio permanecen sin cambios respecto al original en BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO. La innovación técnica de esta publicación es la cuantización selectiva: al dejar atención y embeddings en BF16 y cuantizar solo las MLP (que dominan el coste de lectura de pesos durante la decodificación), se obtiene una reducción del 20 % en tamaño con una divergencia KL de 0,078 (wiki) y 0,058 (chat) respecto al original, y coincidencia del siguiente token en 61 de 64 posiciones evaluadas. La velocidad de generación mejora porque, en un modelo de este tamaño en una sola GPU, la decodificación está limitada por el ancho de banda de memoria.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Entrada multimodal: procesamiento de imagen y audio (las torres están presentes, aunque TurinTech solo probó texto).
- Function calling / tool calling: compatible con `--enable-auto-tool-choice` y `--tool-call-parser gemma4` en vLLM.
- Razonamiento matemático elemental (evaluado en GSM8K).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Despliegue optimizado para vLLM con FP8 y compressed-tensors.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en GPU de consumo: con 11,07 GiB de pesos en vLLM, una RTX 5090 de 32 GB aloja 211.050 tokens de caché KV, suficiente para atender decenas de conversaciones multi-turno simultáneas con contexto largo.
- Agentes con tool calling en producción: el modelo mantiene la puntuación del original en BFCL (371 de 400 llamadas simples correctas) y se integra en vLLM con el parser `gemma4`, lo que permite construir pipelines de agentes que invocan APIs externas sin degradación por la cuantización.
- Despliegue en servidores con GPU de 16 GB: TurinTech verificó que, limitando `--gpu-memory-utilization` a 0,47 (15,3 GB), el modelo arranca con 45.678 tokens de caché KV y responde correctamente a chat y tool calls, mientras que el BF16 original no arranca bajo el mismo límite.
- Tutoría de matemáticas elementales: la puntuación en GSM8K (230 de 250 frente a 229 del original) lo hace adecuado para resolución de problemas aritméticos paso a paso en entornos educativos.
- Procesamiento de documentos con imagen y audio: aunque las torres multimodales no fueron probadas por el autor, están presentes en los pesos, por lo que puede emplearse para transcripción y descripción de contenido audiovisual (requiere validación propia).
- Backend de alto throughput para aplicaciones web: con 1.206 tokens/s agregados a ocho peticiones concurrentes en una RTX 5090, es viable para servir a varios usuarios simultáneos con latencias de primer token de ~155 ms.
- Sustitución directa del modelo BF16 en infraestructura existente: al mantener la misma API de transformers y vLLM y una divergencia KL baja, puede reemplazar al original para reducir coste de memoria y aumentar la concurrencia sin cambios de código.

## Benchmarks y rendimiento

Resultados publicados por TurinTech, comparando esta versión FP8 con el original BF16 de NVIDIA en la misma build de vLLM (0.32.0rc1) y una RTX 5090 por modelo, decodificación greedy con semilla fija:

| Metrica | BF16 original | Este modelo FP8 |
|---|---:|---:|
| Tamano de pesos | 15,99 GB | 12,76 GB |
| VRAM de pesos en vLLM | 14,10 GiB | 11,07 GiB |
| Cache KV en RTX 5090 de 32 GB (defaults vLLM) | 154.388 tokens | 211.050 tokens |
| Peticiones de 4.096 tokens simultaneas | 37,7 | 51,5 |
| Velocidad de generacion, 1 peticion | 139 tokens/s | 183 tokens/s |
| Velocidad de generacion, 8 peticiones (total) | 844 tokens/s | 1.206 tokens/s |
| BFCL llamadas simples (400) | 371 | 371 |
| GSM8K (primeras 250 preguntas) | 229 | 230 |
| Mismo siguiente token (64 posiciones) | 64/64 | 61/64 |
| KL respecto al original, wiki / chat (menor es mejor) | 0 | 0,078 / 0,058 |

El tiempo hasta el primer token fue similar en ambos: ~58 ms con una petición y ~155 ms con ocho concurrentes. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para pesos: 11,07 GiB en vLLM con FP8; 12,76 GB en disco. El original BF16 requiere 14,10 GiB en vLLM.
- GPU recomendadas: RTX 5090 (probada), A100, H100, L40S y cualquier GPU con soporte de FP8 en vLLM. En teoría cabe en una GPU de 16 GB ajustando `--gpu-memory-utilization`, aunque TurinTech no lo probó en una tarjeta física de 16 GB.
- GPU de consumo: sí, en RTX 5090 (32 GB) y, según las pruebas simuladas, en tarjetas de 16 GB con límite de memoria configurado.
- Despliegue: vLLM 0.32.0rc1 (build de desarrollo) con `--dtype bfloat16 --language-model-only`; también hay una versión GGUF del mismo autor para llama.cpp.
- Throughput: 183 tokens/s con una petición y 1.206 tokens/s agregados con ocho peticiones en RTX 5090; TTFT de ~58 ms y ~155 ms respectivamente.
- Caché KV disponible en RTX 5090 con defaults: 211.050 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Artemis-FP8 (este) | ~8B | no disponible (probado a 4.096) | safetensors FP8 | OpenMDW 1.1 | 11,07 GiB en vLLM, 183 tokens/s en RTX 5090 |
| NVIDIA Nemotron-3.5-Bolt-E4B-BF16 (base) | ~8B | no disponible | safetensors BF16 | OpenMDW 1.1 | 14,10 GiB en vLLM, 139 tokens/s en RTX 5090 |
| Nemotron-3.5-Bolt-E4B-Artemis-GGUF (mismo autor) | ~8B | no disponible | GGUF | OpenMDW 1.1 | Orientado a llama.cpp y equipos con menos VRAM |
| Versión de 4 bits descartada por TurinTech | ~8B | no disponible | 4-bit (~11 GB) | OpenMDW 1.1 | Coincidencia de siguiente token en 44/64 posiciones; no publicada |

No se dispone de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Solo se probó texto: las torres de visión y audio están presentes pero no se ejecutaron, por lo que su comportamiento tras la cuantización es desconocido.
- Todas las pruebas se realizaron en RTX 5090; el rendimiento en otras GPU (A100, H100, tarjetas de 16 GB reales) no está verificado.
- Las comprobaciones cubren function calling y matemáticas; otras tareas y contextos superiores a 4.096 tokens no se evaluaron.
- La cuantización introduce una divergencia pequeña pero real: 3 de 64 posiciones generan un token distinto al original y la KL es de 0,078/0,058.
- La versión de 4 bits fue descartada por pérdida de calidad; para reducir aún más el tamaño debe usarse la release GGUF con llama.cpp.
- Licencia OpenMDW 1.1: es necesario revisar sus términos antes de uso comercial; no es una licencia permisiva estándar tipo Apache 2.0.
- Riesgo de alucinación y sesgos: no hay información específica publicada para esta versión; deben evaluarse con las pruebas habituales antes de producción.
- Idiomas soportados no documentados en la información disponible.
- Requiere una build de desarrollo de vLLM (0.32.0rc1); la compatibilidad con versiones estables no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-FP8
- Modelo base (NVIDIA, BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Versión GGUF del mismo autor: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
