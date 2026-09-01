# ThakiCloud/Qwen3.8-27B-W4A16-GPTQ

## Resumen

ThakiCloud/Qwen3.8-27B-W4A16-GPTQ es una cuantización GPTQ en precisión W4A16 (pesos de 4 bits, activaciones de 16 bits) del modelo Qwen3.8-27B, un LLM multimodal nativo de Alibaba con arquitectura híbrida transformer-SSM. El objetivo principal de esta build es permitir la inferencia del modelo en tarjetas con 32 GB de VRAM, ya que la versión NVFP4 del mismo modelo ocupa 30,14 GB y no deja espacio para la caché KV. Con 18,59 GB de pesos, esta cuantización cabe holgadamente en una GPU de 32 GB y ofrece un rendimiento en GSM8K estadísticamente indistinguible del modelo en bf16.

El modelo base Qwen3.8-27B tiene 27 356 millones de parámetros, 64 capas (16 de atención completa y 48 de atención lineal GDN) y una ventana de contexto nativa de 262 144 tokens. La cuantización fue realizada con `llmcompressor`, con un tamaño de grupo de 128, simetría int4 y `actorder` estático, ignorando los módulos de visión, embeddings y la cabeza de salida para preservar la calidad multimodal. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Esta ficha es relevante porque documenta no solo las especificaciones y el rendimiento de la cuantización, sino también un hallazgo crítico: la reconstrucción del mismo recetario de cuantización produce variaciones significativas en el comportamiento de abstinencia (tasa de fabricación en RAG), lo que obliga a evaluar el artefacto concreto que se va a desplegar antes de confiar en él para aplicaciones sensibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer-SSM (64 capas: 16 full-attention, 48 linear-attention GDN) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (nativo); 131 072 recomendado en vLLM |
| Tipos de cuantizacion | W4A16 GPTQ (esta build); NVFP4 disponible como build alternativa |
| Idiomas soportados | en, ko (según model card; el modelo base puede soportar más) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización GPTQ con `quant_method` comprimido) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM multimodal denso desarrollado por Alibaba, con una arquitectura híbrida que combina 16 capas de atención completa (full-attention) con 48 capas de atención lineal (GDN, probablemente Gated DeltaNet). Esta combinación reduce el coste de la caché KV: solo las 16 capas full-attention contribuyen a la caché, resultando en 64 KiB por token, lo que permite contextos largos con un uso de memoria mucho menor que un transformer puro del mismo tamaño.

La cuantización W4A16 se realizó con `llmcompressor` de vLLM, utilizando GPTQ con tamaño de grupo 128, simetría int4, `actorder` estático y `dampening_frac` 0,01. La calibración empleó 1024 muestras de 2048 tokens y tardó unos 38 minutos en una sola GPU. Los módulos de visión (`vision`, `visual`), `lm_head` y `embed_tokens` se dejaron en precisión original para no degradar las capacidades multimodales y de generación. El resultado es un archivo de 18,59 GB, mayor de lo que cabría esperar de una cuantización 4-bit ingenua (~14 GB) debido a esos componentes preservados.

El proceso de cuantización no es reproducible en términos de comportamiento de abstinencia: dos ejecuciones idénticas del mismo recetario produjeron tasas de fabricación en RAG de 9,17% y 36,25% respectivamente, una diferencia de 27,08 puntos porcentuales (7,5 sigma). Esto implica que la calidad de la cuantización no puede garantizarse solo por el recetario; hay que evaluar el archivo concreto.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de modo de pensamiento (thinking mode) que alterna entre razonamiento explícito y respuesta directa.
- Comprensión multimodal: acepta entradas de imagen y texto, incluyendo análisis de imágenes, OCR y respuesta a preguntas visuales.
- Generación de código y soporte de flujos de trabajo de agente (agentic workflows), incluyendo tool calling y planificación de tareas de larga duración.
- Rendimiento competitivo en tareas matemáticas, como demuestra el resultado en GSM8K (en y ko) comparable al modelo bf16.
- Capacidades multilingües, al menos en inglés y coreano (según la model card).
- Contexto largo de hasta 262 144 tokens, adecuado para tareas que requieren memoria extensa, con gestión eficiente de la caché KV gracias a la arquitectura híbrida.
- Soporte de cuantización W4A16 con kernel Marlin para inferencia eficiente en GPUs compatibles.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 131 072 tokens recomendados) gracias a su arquitectura híbrida y su caché KV compacta (64 KiB/token), lo que permite mantener el historial completo de la interacción sin agotar la VRAM.
- Generación de código en producción: con soporte de tool calling y razonamiento multi-step, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, manteniendo el contexto del repositorio en una ventana de 262 144 tokens.
- Análisis de documentos visuales: al aceptar imágenes, puede extraer texto mediante OCR, interpretar diagramas o tablas y responder preguntas sobre documentos escaneados, útil en entornos de oficina o legales.
- Asistentes de razonamiento matemático: su rendimiento en GSM8K (en y ko) lo hace adecuado para sistemas de tutoría o resolución de problemas paso a paso, con modo de pensamiento que muestra el razonamiento.
- Agentes autónomos de larga duración: la combinación de tool calling, razonamiento multi-step y contexto largo permite construir agentes que planifican y ejecutan tareas complejas sin perder el hilo, como automatización de flujos de trabajo empresariales.
- Búsqueda aumentada por recuperación (RAG) en coreano: el modelo está calibrado para inglés y coreano, y puede utilizarse en sistemas de pregunta-respuesta sobre documentos de contratación pública, aunque hay que evaluar su tasa de fabricación en el artefacto concreto (véase Limitaciones).
- Despliegue en hardware con 32 GB de VRAM: esta build es la única opción viable para ejecutar Qwen3.8-27B en una GPU de 32 GB con margen para la caché KV, lo que permite inferencia local en estaciones de trabajo sin necesidad de hardware de gama alta.

## Benchmarks y rendimiento

La model card reporta resultados de GSM8K (conjunto completo de 1319 ítems, greedy decoding, vLLM 0.27.1 + lm-eval 0.4.12) comparando esta build con el modelo bf16 y con una build INT4 de terceros. Se recomienda evaluar con extracción flexible (`flexible-extract`) en lugar de coincidencia estricta (`strict-match`), porque las builds de 4 bits suelen responder correctamente sin el formato esperado y se puntúan como erróneas.

| Modelo | GSM8K en strict | GSM8K en flexible | GSM8K ko strict | GSM8K ko flexible |
|---|---|---|---|---|
| bf16 | 0,5421 | 0,5481 | 0,6171 | 0,6353 |
| **Esta build (W4A16)** | 0,5155 | 0,5603 | 0,5785 | 0,6505 |
| Build INT4 de terceros | no disponible | no disponible | no disponible | no disponible |

Frente a bf16, esta build es +2,28 pp (en) y +1,52 pp (ko) en extracción flexible, dentro del ruido estadístico. Frente a la build INT4 de terceros, +0,76 pp y +0,08 pp respectivamente. En estas tareas, los tres son indistinguibles.

La card también reporta el ruido de reconstrucción: dos builds idénticas del mismo recetario difieren en hasta 3,56 pp en GSM8K strict, y en 27,08 pp en la tasa de fabricación en RAG (9,17% frente a 36,25%). Esto significa que cualquier comparación entre checkpoints debe tener en cuenta este umbral de ruido.

En cuanto a rendimiento de inferencia, en una B200 con configuración idéntica (2048 tokens de entrada, 256 de salida):

| Build | Velocidad máxima (tok/s) | TTFT | Tamaño |
|---|---|---|---|
| NVFP4 (`-NVFP4-GPTQ-txt`) | 3597,9 | 2,09 s | 30,14 GB |
| **Esta build (W4A16, Marlin)** | 1022,8 | 10,66 s | 18,59 GB |

Esta build es 3,52 veces más lenta en velocidad máxima y 5,1 veces peor en TTFT que la NVFP4, debido a la dequantización de Marlin frente al kernel nativo de Blackwell. La elección entre ambas depende de la VRAM disponible: 32 GB obliga a W4A16; 96 GB permite NVFP4.

No se han publicado resultados de benchmarks de amplio espectro (MMLU, HumanEval, long-context retrieval) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 18,59 GB para los pesos, más la caché KV. Con contexto de 131 072 tokens y caché KV en fp8 (32 KiB/token), se necesitan aproximadamente 18,59 + 4,2 = 22,8 GB, lo que cabe en una GPU de 32 GB con margen.
- GPU recomendadas: B200 (usada en las pruebas), A100 de 40/80 GB, RTX 6000 Ada de 48 GB, o cualquier GPU con 32 GB o más. En tarjetas de 24 GB (RTX 4090, RTX 3090) podría no caber con contexto largo, aunque con contexto corto y fp8 podría intentarse.
- En consumer GPU: posible en RTX 4090 (24 GB) solo con contexto muy reducido y sin garantías; no recomendado para producción.
- Opciones de despliegue: vLLM (recomendado, con `--kv-cache-dtype fp8` y `--mamba-cache-mode align`), TGI, llama.cpp (si soporta GPTQ W4A16 con Marlin, aunque no está confirmado en la documentación).
- Latencia y throughput: en B200, 1022,8 tok/s de velocidad máxima y 10,66 s de TTFT para 2048 tokens de entrada; en GPUs más pequeñas estos valores serán proporcionalmente peores.

## Comparativa con modelos similares

La comparativa más relevante es entre las distintas builds del mismo modelo base, ya que no se dispone de datos de otros modelos de 27B en la información proporcionada.

| Característica | bf16 | W4A16 (esta build) | NVFP4 |
|---|---|---|---|
| Tamaño de pesos | ~54 GB (estimado) | 18,59 GB | 30,14 GB |
| VRAM necesaria (con KV) | >64 GB | 32 GB (con fp8) | 96 GB (sin margen en 32 GB) |
| Velocidad máxima (B200) | no medido | 1022,8 tok/s | 3597,9 tok/s |
| TTFT (B200, 2048 in) | no medido | 10,66 s | 2,09 s |
| GSM8K en flexible | 0,5481 | 0,5603 | no disponible |
| GSM8K ko flexible | 0,6353 | 0,6505 | no disponible |

Frente a otros modelos de 27B del mercado (p. ej., Llama 3.1 8B no es comparable por tamaño; Qwen2.5-32B podría ser comparable pero no hay datos), no se dispone de información suficiente para una comparativa directa.

## Limitaciones y advertencias

- No reproducibilidad del comportamiento de abstinencia: dos builds idénticas del mismo recetario de cuantización producen tasas de fabricación en RAG de 9,17% y 36,25% (diferencia de 27,08 pp). Si la capacidad de negarse a responder cuando el documento no contiene la información es crítica, se debe evaluar el archivo concreto que se va a desplegar, no confiar en el recetario.
- La evaluación con `strict-match` penaliza injustamente las builds de 4 bits: el 87,5% de los casos disputados (35 de 40) eran respuestas correctas rechazadas por formato. Usar siempre extracción flexible.
- No se han medido tareas de amplio espectro (MMLU, HumanEval, long-context retrieval) ni comportamiento en otras familias de GPU distintas de B200.
- El rendimiento de throughput es significativamente inferior al de la build NVFP4 (3,52× más lento en velocidad máxima, 5,1× peor TTFT), lo que puede ser un cuello de botella en producción de alta concurrencia.
- La caché KV es de 64 KiB/token (solo las 16 capas full-attention contribuyen), lo que limita el contexto máximo en GPUs pequeñas; se recomienda activar `--kv-cache-dtype fp8` para duplicar la capacidad de la caché.
- Idiomas soportados limitados a en y ko según la model card; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales; verificar la documentación de Qwen3.8-27B.
- Riesgo de alucinación: la tasa de fabricación en RAG para esta build concreta es de 9,17% (n=240), pero puede variar significativamente entre reconstrucciones.

## Enlaces

- [Modelo en HuggingFace: ThakiCloud/Qwen3.8-27B-W4A16-GPTQ](https://huggingface.co/ThakiCloud/Qwen3.8-27B-W4A16-GPTQ)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Dataset de ruido de reconstrucción: ThakiCloud/quantization-rebuild-noise-floor](https://huggingface.co/datasets/ThakiCloud/quantization-rebuild-noise-floor)
- [Build NVFP4: ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-mm](https://huggingface.co/ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-mm)
- [Repositorio oficial de Qwen3.8-27B (GitHub)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Documentación de vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Qwen 3.8 27B en GroqDocs](https://console.groq.com/docs/model/qwen/qwen3.8-27b)
