# XReyRobert/Qwen3.8-27B-GPTQ-Pro-FOEM-4bit-g128-ns256-INT8-Head-Embeddings

## Resumen

Qwen3.8-27B es un modelo multimodal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache 2.0 en agosto de 2026. Es la versión open-weight de Qwen3.8-Max y está diseñado para ejecutarse en una única GPU, destacando en tareas de codificación, flujos agénticos y automatización de oficina. Su arquitectura combina atención híbrida con capas Gated DeltaNet y soporta entrada de imagen y texto, con modo de razonamiento activable.

Este checkpoint concreto, creado por XReyRobert, es una cuantización híbrida del modelo base: mantiene el cuerpo transformer en GPTQ-Pro FOEM 4-bit (W4A16, group size 128) y cuantiza adicionalmente los embeddings de token y la proyección de salida (`lm_head`) a INT8 con group size 128. El objetivo es permitir inferencia de contexto largo (hasta 210 000 tokens en modo texto) en una GPU de 24 GB, conservando el encoder de visión, la capa MTP (Multi-Token Prediction) y las normalizaciones en BF16. El resultado es un artefacto de 17,1 GB que requiere un parche específico de vLLM para su ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida (48 capas Gated DeltaNet + 16 capas de atención completa), 64 capas, hidden size 5120, vocabulario de 248 320 tokens |
| Parametros totales | 28 099 277 552 (incluye ~1 000 millones del encoder de visión) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 210 000 tokens en modo texto, 182 000 con visión, 170 000 con MTP2 (validado en RTX 3090 24 GB) |
| Tipos de cuantizacion | GPTQ-Pro FOEM W4A16 (cuerpo transformer, group size 128), INT8 W8A16 (embeddings y `lm_head`), BF16 (encoder de visión, MTP, normalizaciones) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B soporta múltiples idiomas, pero no se especifican en la documentación de este checkpoint) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (GPTQ-Marlin compatible), con archivos de configuración JSON |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con una pila de atención híbrida: 48 de sus 64 capas utilizan Gated DeltaNet (una variante de atención lineal con compuertas) y las 16 restantes usan atención completa. Esta combinación reduce el coste de memoria del KV-cache y permite ventanas de contexto muy largas. El modelo acepta entradas de imagen y texto, con un encoder de visión separado de aproximadamente 1 000 millones de parámetros.

La cuantización de este checkpoint se realizó en dos etapas. Primero, el cuerpo transformer se cuantizó con GPTQ-Pro FOEM (activation-weighted MSE, act-group-aware quantization, alpha=0.25, beta=0.2, con umbral de caída RTN del 0,5 %) usando 256 muestras de calibración de 2048 tokens de un conjunto mixto de código y razonamiento. En segundo lugar, los embeddings de token y el `lm_head` se cuantizaron a INT8 con group size 128, reportando errores relativos L2 de 0,0065 y 0,0069 respectivamente. El encoder de visión, la capa MTP y las normalizaciones se conservan en BF16. El modelo base fue entrenado por Alibaba con datos propietarios; no se especifican detalles de dataset ni de alineación (RLHF/DPO) en la documentación disponible.

## Capacidades

- Generación de texto y razonamiento: soporta modo de pensamiento (thinking mode) activable, con parser de razonamiento `qwen3` en vLLM.
- Comprensión multimodal: acepta imágenes como entrada para análisis visual, OCR y respuesta a preguntas visuales (el encoder de visión se conserva en BF16).
- Tool calling y function calling: compatible con `--enable-auto-tool-choice` y parser `qwen3_coder` en vLLM.
- Agentes y razonamiento multi-paso: diseñado para flujos agénticos y tareas de larga duración (long-horizon tasks), con soporte de decodificación especulativa MTP (hasta 2 tokens especulativos).
- Contexto largo: validado hasta 210 000 tokens en modo texto, 182 000 con visión y 170 000 con MTP2 en una GPU de 24 GB.
- Multilingüe: el modelo base soporta múltiples idiomas, aunque no se detallan en la documentación de este checkpoint.
- Decodificación especulativa: la capa MTP (Multi-Token Prediction) se conserva en BF16 y permite acelerar la generación con vLLM.

## Casos de uso

- Asistente de codificación en producción: con soporte de tool calling y parser `qwen3_coder`, puede integrarse en entornos de desarrollo para generación, revisión y refactorización de código, ejecutándose en una única GPU de 24 GB con contexto de 210K tokens para repositorios grandes.
- Automatización de oficina: el modelo base destaca en tareas de automatización de documentos, hojas de cálculo y flujos de trabajo, y esta cuantización permite desplegarlo en hardware asequible sin perder las capacidades de razonamiento.
- Análisis de documentos largos con visión: al conservar el encoder de visión y soportar 182K tokens de contexto, puede procesar documentos escaneados, PDFs con imágenes y capturas de pantalla extensas para extracción de información.
- Agente conversacional con memoria extendida: la ventana de 210K tokens permite mantener conversaciones multi-turno muy largas con historial completo, adecuado para atención al cliente o asistentes personales.
- Razonamiento matemático y científico: el modo de razonamiento activable y la calibración con datos de razonamiento hacen que sea útil para resolución de problemas complejos en entornos educativos o de investigación.
- Despliegue en edge con decodificación especulativa: la capa MTP permite acelerar la inferencia en GPUs de consumo (RTX 3090, 4090) mediante vLLM, reduciendo la latencia en aplicaciones interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización híbrida en la información disponible. El modelo base Qwen3.8-27B ha sido evaluado por Alibaba en tareas de codificación, razonamiento y agéntica, pero no se proporcionan cifras concretas en la documentación de este checkpoint. Se recomienda consultar la página del modelo base en Hugging Face para datos de evaluación.

## Requisitos de hardware

- VRAM estimada: 24 GB para el perfil validado (contexto de 210K tokens con KV-cache en FP8 E5M2 y 7,3 GB asignados a KV-cache). Con MTP2 y contexto de 170K, se requieren 6,7 GB de KV-cache explícito.
- GPU recomendadas: RTX 3090 24 GB (validada), RTX 4090 24 GB, A5000 24 GB, o cualquier GPU con 24 GB o más de VRAM. No cabe en GPUs de 16 GB o menos con el perfil completo.
- Opciones de despliegue: vLLM 0.27.1 con parches específicos incluidos en el repositorio (Containerfile.vllm, patches para embedding cuantizado y routing híbrido). No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan métricas numéricas. El perfil validado usa `--max-num-seqs 8` y `--max-num-batched-tokens 2048` en modo texto, y `--max-num-seqs 4` con MTP2. Se recomienda usar `--compilation-config` con operaciones personalizadas (`+rms_norm`, `+silu_and_mul`) para optimizar el rendimiento.
- Nota: el checkpoint requiere un parche de vLLM para enrutar el layout de embeddings híbrido (`hybrid_embedding_w8a16`) a la implementación `CompressedTensorsEmbeddingWNA16Int`. Sin el parche, vLLM estándar no funcionará correctamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 28,1B | 256K (nativo) | BF16 | Apache 2.0 | Hugging Face |
| XReyRobert/Qwen3.8-27B-GPTQ-Pro-FOEM-4bit-g128-ns256 | 28,1B | 210K (validado) | GPTQ-Pro 4-bit | Apache 2.0 | Hugging Face |
| Este checkpoint (INT8 Head/Embeddings) | 28,1B | 210K texto, 170K MTP2 | GPTQ-Pro 4-bit + INT8 | Apache 2.0 | Hugging Face |

La comparativa con otros modelos de la misma categoría (p. ej., Llama 3.1 70B cuantizado o Mistral Large 2) no está disponible en la información proporcionada. Este checkpoint se distingue por su enfoque híbrido de cuantización que permite contexto muy largo en una GPU de 24 GB, algo poco común en modelos de 27B.

## Limitaciones y advertencias

- Requiere un parche específico de vLLM: el layout de embeddings híbrido no es compatible con vLLM estándar sin aplicar los parches incluidos en el repositorio. Esto limita la portabilidad a otros frameworks de inferencia.
- La cuantización INT8 de embeddings y `lm_head` introduce errores de reconstrucción (L2 relativo ~0,0065 y ~0,0069), que pueden afectar ligeramente a la calidad de generación en comparación con el modelo base en BF16.
- El perfil de contexto largo (210K) depende de KV-cache en FP8 E5M2, lo que puede reducir la precisión numérica en comparación con FP16.
- No se han publicado benchmarks de rendimiento para esta cuantización, por lo que no se puede verificar el impacto real en calidad respecto al modelo base.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; la cuantización no corrige estos problemas.
- La licencia Apache 2.0 permite uso comercial, pero se deben respetar los avisos de terceros (THIRD_PARTY_NOTICES.md) por los parches redistribuidos.
- No se especifican los idiomas soportados en la documentación de este checkpoint; se asume que hereda los del modelo base, pero no está confirmado.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/XReyRobert/Qwen3.8-27B-GPTQ-Pro-FOEM-4bit-g128-ns256-INT8-Head-Embeddings
- Checkpoint fuente (GPTQ-Pro FOEM 4-bit): https://huggingface.co/XReyRobert/Qwen3.8-27B-GPTQ-Pro-FOEM-4bit-g128-ns256
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de referencia para el parche INT8: https://github.com/syv-ai/qwen38-27b-rtx3090
- Documentación de Groq sobre Qwen3.8-27B: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Entrada en LLM Releases: https://www.llm-releases.com/models/qwen3-8-27b
