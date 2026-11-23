# wren6991/Ling-3.2-Flash-GGUF

## Resumen

Ling-3.2-Flash-GGUF es una cuantización GGUF mixta del modelo multimodal inclusionAI/Ling-3.2-air, publicada por el usuario wren6991. El modelo base es un transformer de mezcla de expertos (MoE) con atención híbrida lineal de 124.000 millones de parámetros totales y 5.500 millones de parámetros activos por token, capaz de procesar entradas de texto e imagen (pipeline image-text-to-text). Esta conversión reduce el checkpoint original en FP8 (E4M3 con escalas de bloque 128×128) a un fichero GGUF de 79,6 GB, pensado para ejecución local con llama.cpp.

La relevancia de esta ficha radica en que permite desplegar un modelo MoE multimodal de gran tamaño en hardware de consumo o servidores de gama media mediante cuantización agresiva, manteniendo una divergencia KL baja respecto a la referencia Q8_0. El autor documenta un barrido de KLD y perplejidad que respalda la calidad de la receta Q4_K_XL, una convención de nombres propia que combina Q4_K, Q5_K, Q8_0, BF16 y F32 según el tipo de tensor.

El modelo está disponible bajo licencia MIT, soporta inglés y chino, e incluye la arquitectura `bailingmoe3` con 43 capas, 512 expertos enrutados (8 activos más 1 compartido). Es una opción interesante para quienes necesitan razonamiento multimodal y modo thinking en local sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailingmoe3` (MoE con atención híbrida lineal), 43 capas, 512 expertos enrutados, 8 activos + 1 compartido |
| Parametros totales | 124B (124.000 millones) |
| Parametros activos | 5,5B (5.500 millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_XL (receta mixta: Q4_K, Q5_K, Q8_0, BF16, F32) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (938 tensores, 79,6 GB) |

## Arquitectura y entrenamiento

El modelo base Ling-3.2-air emplea la arquitectura `bailingmoe3`, un transformer de mezcla de expertos con atención híbrida lineal. Cuenta con 43 capas, 512 expertos enrutados de los cuales se activan 8 por token, más 1 experto compartido. Esta configuración permite un ratio de activación muy bajo (5,5B de 124B parámetros), lo que reduce el coste computacional por token a costa de un mayor uso de memoria. El checkpoint original se distribuye en FP8 (E4M3) con escalas de bloque 128×128, un formato que GGUF no puede representar de forma nativa.

La conversión realizada por wren6991 aplica una receta mixta: los tensores `ffn_gate_exps` y `ffn_up_exps` de los expertos enrutados se cuantizan a Q4_K; `ffn_down_exps` a Q5_K; el resto de matrices derivadas de FP8 a Q8_0; embeddings de tokens, salida, `ssm_beta`, `attn_gate` y `nextn.eh_proj` se mantienen en BF16; y normas, sesgos, kernels de convolución y puertas del router en F32. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

La innovación técnica destacable es la propia receta de cuantización mixta, que preserva en mayor precisión los tensores sensibles (embeddings, proyecciones de atención, capas SSM) mientras comprime agresivamente los expertos enrutados, que concentran la mayor parte del peso. El autor valida la receta con un barrido de divergencia KL frente a una conversión Q8_0 del mismo checkpoint.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo thinking activable mediante `enable_thinking=true`.
- Procesamiento de imagen y texto (image-text-to-text), incluyendo entrada de vídeo según la model card del autor.
- Razonamiento multi-paso y cargas de trabajo de tipo agente.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling a través de la plantilla de chat Jinja (`--jinja`).
- Cuantización optimizada para ejecución local con llama.cpp, incluyendo servidor compatible con OpenAI (`llama-server`).
- No se documentan capacidades de audio ni de decodificación especulativa en la información disponible.

## Casos de uso

- Asistencia multimodal local: análisis de imágenes y documentos escaneados combinado con conversación multi-turno, aprovechando el codificador visual y el proyector `mmproj` separado para entornos sin conexión a APIs externas.
- Razonamiento con modo thinking en estaciones de trabajo: tareas de análisis complejo donde el modelo genera cadenas de razonamiento internas antes de responder, útil para revisión de código o diagnóstico técnico.
- Despliegue en servidores de gama media con llama-server: la cuantización de 79,6 GB permite servir el modelo en GPUs con 80 GB o en configuraciones multi-GPU, con una API compatible con OpenAI para integrarse en aplicaciones existentes.
- Procesamiento de documentación técnica en inglés y chino: traducción, resumen y extracción de información de manuales bilingües, aprovechando el soporte nativo de ambos idiomas.
- Pipelines de agentes con tool calling: integración en flujos automatizados donde el modelo invoca funciones externas (consultas a bases de datos, APIs) mediante la plantilla Jinja de llama.cpp.
- Experimentación e investigación en cuantización: la documentación del barrido KLD y la receta mixta sirven como referencia para estudiar el impacto de la cuantización selectiva en modelos MoE multimodales.
- Prototipado de asistentes visuales en local: clasificación y descripción de imágenes en entornos con requisitos de privacidad, sin enviar datos a servicios en la nube.

## Benchmarks y rendimiento

El autor publica un barrido de divergencia KL y perplejidad frente a una conversión Q8_0 del mismo checkpoint, medido con `llama-perplexity --kl-divergence` sobre `wikitext-2-raw/wiki.test.raw` con 16 chunks por longitud de contexto.

| Contexto | KLD media ↓ | KLD mediana | PPL Q4_K_XL | PPL Q8_0 | Ratio PPL | RMS Δp |
|---:|---:|---:|---:|---:|---:|---:|
| 512 | 0,0530 ± 0,0019 | 0,0164 | 4,480 | 4,384 | 1,0220 | 7,49% |
| 1024 | 0,0495 ± 0,0020 | 0,0117 | 4,300 | 4,255 | 1,0105 | 7,18% |
| 2048 | 0,0699 ± 0,0029 | 0,0156 | 6,374 | 6,391 | 0,9973 | 8,04% |
| 4096 | 0,0961 ± 0,0037 | 0,0152 | 10,136 | 10,286 | 0,9854 | 7,46% |

La KLD media aumenta con contextos largos debido a una cola de tokens de alta divergencia (percentil 99,9 de KLD alcanza 11,7 a 4096 tokens), mientras que la mediana se mantiene entre 0,011 y 0,016. La perplejidad es prácticamente idéntica entre 512 y 2048 tokens y ligeramente inferior a la referencia Q8_0 a 4096. El propio autor advierte que la muestra es pequeña (16 chunks) y que el punto de 4096 tiene una cola amplia.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 79,6 GB, por lo que se necesita al menos esa cantidad de memoria más overhead para el contexto y el proyector visual.
- GPU recomendadas: H100 80 GB, A100 80 GB o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB o 2× A6000 de 48 GB) para cargar el modelo completo.
- No cabe en una única GPU de consumo de 24 GB (RTX 4090, 3090) ni en 32 GB; requiere offloading a CPU o partición entre varias GPUs.
- El proyector multimodal `mmproj-ling-3.2-air-F16.gguf` debe descargarse por separado para entrada de imagen o vídeo.
- Opciones de despliegue: llama.cpp (`llama-server` o `llama-cli`) con compilación que soporte `bailingmoe3` (PR ggml-org/llama.cpp#29151 o posterior). No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ling-3.2-Flash-GGUF (esta ficha) | 124B / 5,5B | no disponible | MIT | GGUF Q4_K_XL | Multimodal, cuantización mixta documentada con KLD |
| inclusionAI/Ling-3.2-air (base) | 124B / 5,5B | no disponible | MIT | FP8 (E4M3) | Checkpoint original, requiere hardware de mayor precisión |
| Conversión Q8_0 del mismo checkpoint | 124B / 5,5B | no disponible | MIT | GGUF Q8_0 | Referencia de calidad usada en el barrido KLD, mayor tamaño |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~124B con licencia permisiva) en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse principalmente en inglés y chino, puede presentar sesgos culturales y lingüísticos de esos corpus.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el modo thinking no elimina este riesgo y puede aumentar la latencia.
- Limitaciones de contexto: la longitud de contexto del modelo base no está especificada en la información disponible; el barrido KLD sugiere evaluación hasta 4096 tokens, pero no confirma el máximo soportado.
- Limitaciones de idioma: solo inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Restricciones de licencia: MIT permite uso comercial, pero debe verificarse la licencia del modelo base y de los pesos originales; la cuantización hereda la licencia MIT según el autor.
- Caveat de producción: la arquitectura `bailingmoe3` requiere una compilación reciente de llama.cpp (PR #29151 o posterior); versiones anteriores no cargarán el modelo.
- El proyector multimodal no está incluido en el repositorio; sin él, el modelo solo procesa texto.
- La etiqueta Q4_K_XL es una convención del autor, no un tipo nativo de llama.cpp; herramientas que esperen tipos estándar pueden no reconocerla.
- La muestra del barrido KLD es pequeña (16 chunks) y el autor la califica de indicativa, no concluyente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wren6991/Ling-3.2-Flash-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- PR de soporte `bailingmoe3` en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29151
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
