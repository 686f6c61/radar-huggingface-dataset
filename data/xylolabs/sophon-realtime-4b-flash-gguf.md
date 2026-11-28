# Xylolabs/Sophon-Realtime-4B-Flash-GGUF

## Resumen

Sophon-Realtime-4B-Flash-GGUF es la conversión a formato GGUF del "thinker" (el modelo de texto) de adventists-ai/Sophon-Realtime-4B-Flash, un modelo de 4.022.468.096 parámetros (aproximadamente 4B) diseñado originalmente para conversación de voz full-duplex en tiempo real. La conversión la firma Xylolabs, que ha cuantizado los pesos del modelo de texto para su uso con llama.cpp, excluyendo explícitamente el codificador de audio, el "talker" y las voces del modelo original.

El interés de esta ficha reside en que aísla la parte puramente lingüística de un sistema multimodal de voz: lo que queda es un modelo de generación de texto de 4B parámetros con capacidades conversacionales, entrenado para producir respuestas con etiquetas de sonido (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`) que en el sistema completo alimentan a un modelo de habla. La licencia Apache 2.0 y la disponibilidad en cuantizaciones de 1,67 GB a 4,28 GB lo hacen desplegable en hardware de consumo.

El modelo base pertenece a la familia Sophon-Realtime de Adventists.ai, que incluye variantes de 32B y una versión MLX para Apple Silicon. Esta conversión concreta está pensada para llama.cpp y declara compatibilidad con endpoints, lo que facilita integrarla en servidores locales estilo OpenAI. Es relevante ahora porque permite experimentar con el componente de razonamiento conversacional de un sistema de voz en tiempo real sin necesidad de GPU de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de texto "thinker" del sistema Sophon-Realtime; detalles de atención no disponibles) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo del autor; contexto máximo no declarado) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M, Q2_K (con imatrix) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors/BF16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer de aproximadamente 4B parámetros. El sistema completo Sophon-Realtime emplea un diseño full-duplex en el que el "thinker" (este modelo de texto) escucha mientras el usuario habla, decide a partir de la voz cuándo ha terminado el turno y redacta una respuesta con etiquetas de sonido que un modelo de habla ligero convierte en audio (un forward pass por trama de 80 ms en la variante Flash). En la variante E2E, un "talker" compacto de unos 350M parámetros transforma la respuesta etiquetada directamente en vectores de voz.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card del conversor documenta el proceso de cuantización con imatrix y proporciona métricas de fidelidad frente a la referencia BF16 (divergencia KL y acuerdo top-1 en WikiText-2, un conjunto de chat y un conjunto held-out), lo que constituye la innovación técnica documentada de esta conversión: cuantizaciones calibradas con matriz de importancia y evaluación explícita de degradación.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Producción de respuestas con etiquetas de sonido expresivas (`[laughter]`, `[cough]`, `[sigh]`, `[breath]`, `<strong>…</strong>`), pensadas para ser interpretadas por un modelo de habla.
- Razonamiento y respuestas en modo normal y modo "thinking" (la evaluación del conversor incluye 33 ítems normales y 7 de thinking).
- Integración con llama.cpp mediante `llama-server` con soporte de plantilla Jinja (`--jinja`).
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`), lo que permite servirlo tras una API compatible con OpenAI.
- No incluye visión, audio ni tool calling declarados en la información disponible.

## Casos de uso

- Conversación de voz en tiempo real: este GGUF actúa como cerebro de texto de un pipeline de voz; se combina con un codificador de audio y un modelo de habla (no incluidos) para construir un asistente full-duplex que escucha, decide el fin de turno y responde mientras habla.
- Prototipado local de agentes conversacionales: con Q4_K_M (2,50 GB) cabe en GPUs de consumo y permite iterar sobre prompts y plantillas de chat sin coste de API.
- Generación de diálogo con prosodia marcada: las etiquetas de sonido permiten generar guiones de conversación con risas, suspiros y énfasis para doblaje, audiolibros o videojuegos, que después se sintetizan con un TTS que interprete dichas marcas.
- Servicio de chat compatible con OpenAI en local: mediante `llama-server` con `--jinja` y contexto de 32K, se puede exponer un endpoint `/v1/chat/completions` para integrarlo en aplicaciones existentes.
- Evaluación de cuantizaciones en producción: las tablas de KL y top-1 del autor permiten elegir el compromiso tamaño/calidad adecuado (por ejemplo, Q5_K_M con 95,33% de top-1 en WikiText-2 frente a Q2_K con 74,48%).
- Investigación sobre fidelidad de cuantización: el repositorio incluye gráficas de KL medio y acuerdo top-1 por tamaño de fichero, útiles como referencia para estudiar el impacto de las cuantizaciones K-quant con imatrix en modelos de 4B.
- Despliegue en Apple Silicon o CPU: las variantes Q3_K_M (2,08 GB) y Q2_K (1,67 GB) permiten ejecución en equipos sin GPU dedicada para pruebas de concepto.

## Benchmarks y rendimiento

El autor del GGUF publica métricas de fidelidad de la cuantización frente a la referencia BF16 (no benchmarks de capacidad como MMLU o HumanEval, que no están disponibles en la información proporcionada).

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Respuestas correctas |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Q8_0 | 4,28 GB | 0,001298 | 98,27% | 0,001165 | 98,53% | 0,002291 | 98,06% | 29/33 + 1/7 |
| Q6_K | 3,31 GB | 0,004544 | 96,73% | 0,004013 | 97,18% | 0,006404 | 96,84% | 28/33 + 1/7 |
| Q5_K_M | 2,89 GB | 0,010587 | 95,33% | 0,009248 | 96,14% | 0,012417 | 95,22% | 27/33 + 0/7 |
| Q4_K_M | 2,50 GB | 0,036419 | 91,78% | 0,030192 | 92,67% | 0,035295 | 91,02% | 28/33 + 0/7 |
| Q4_K_S | 2,38 GB | 0,042298 | 91,12% | 0,036180 | 92,33% | 0,040708 | 90,63% | 29/33 + 0/7 |
| Q3_K_M | 2,08 GB | 0,117611 | 85,58% | 0,099802 | 86,39% | 0,136515 | 82,92% | 27/33 + 0/7 |
| Q2_K | 1,67 GB | 0,364607 | 74,48% | 0,368231 | 77,22% | 0,479837 | 69,51% | 29/33 + 0/7 |
| BF16 (referencia) | — | — | — | — | — | — | — | 28/33 + 1/7 |

## Requisitos de hardware

- VRAM estimada para inferencia: desde 1,67 GB (Q2_K) hasta 4,28 GB (Q8_0) solo en pesos; hay que sumar la caché KV. El autor indica que la caché KV en f16 a 32K de contexto ocupa 4,83 GB.
- Con Q8_0 y 32K de contexto, el total ronda los 9,1 GB de pesos más caché, por lo que una GPU de 12 GB es suficiente; con Q4_K_M y 32K, el total se sitúa en torno a 7,3 GB.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090); para mayor throughput, A100 o H100. El sistema completo original requiere una GPU de 24 GB (usa ~21 GB), pero esta conversión de solo texto reduce drásticamente el requisito.
- Cabe en GPU de consumo: sí, en todas las variantes con 8 GB o más (Q4_K_M y menores con contexto moderado); Q2_K y Q3_K_M permiten incluso ejecución en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, entre otros) siempre que soporte la plantilla Jinja del modelo. El sistema completo original se sirve con vLLM-Omni, pero esta conversión no incluye el pipeline de audio.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo indica que se necesita llama.cpp `cd959bae` o posterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Sophon-Realtime-4B-Flash-GGUF | 4,02B | 32K (config. de ejemplo) | zh, en | Apache 2.0 | GGUF | Solo el thinker; sin audio |
| Sophon-Realtime-4B-Flash (base) | 4,02B | no disponible | zh, en | Apache 2.0 | safetensors | Sistema full-duplex con audio y talker |
| Sophon-Realtime-4B-Flash-MLX | 4,02B | no disponible | zh, en | Apache 2.0 | MLX | Variante para Apple Silicon (16 GB+) |
| Sophon-Realtime 32B | ~32B | no disponible | zh, en | Apache 2.0 | no disponible | Misma familia, mayor tamaño; requiere más VRAM |

No se dispone en la información proporcionada de comparaciones con modelos de otras familias (por ejemplo, Llama, Qwen o Gemma de tamaño similar); por tanto, la comparativa se limita a las variantes de la propia familia Sophon-Realtime.

## Limitaciones y advertencias

- Esta conversión incluye únicamente el modelo de texto; el codificador de audio, el talker y las voces no están incluidos, por lo que no puede usarse por sí sola para conversación de voz.
- Solo soporta chino e inglés; no hay soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinación inherente a un modelo de 4B parámetros; no se han publicado evaluaciones de veracidad.
- Sesgos conocidos: no documentados en la información disponible.
- Las etiquetas de sonido (`[laughter]`, `[cough]`, etc.) están pensadas para un TTS específico; usadas con otros sintetizadores pueden aparecer literalmente en el texto de salida.
- La cuantización Q2_K degrada notablemente la fidelidad (top-1 del 74,48% en WikiText-2 frente al 98,27% de Q8_0); para producción se recomienda Q5_K_M o superior.
- El contexto máximo real del modelo base no se declara; los 32.768 tokens son la configuración de ejemplo del autor, no un límite garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el aviso `NOTICE` del repositorio atribuye la fuente a Adventists.ai; conviene revisar dicho aviso antes de redistribuir.
- Requiere una versión concreta de llama.cpp (`cd959bae` o posterior) para funcionar correctamente con la plantilla del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Sophon-Realtime-4B-Flash-GGUF
- Modelo base: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash
- Variante MLX: https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Flash-MLX
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/adventists-ai/Sophon-Realtime
- API alojada (documentación): https://api.adventists.ai/console/docs
- Repositorio GitHub del sistema: https://github.com/adventists-ai/sophon-realtime
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- llama.cpp (versión requerida): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas de cuantización de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
