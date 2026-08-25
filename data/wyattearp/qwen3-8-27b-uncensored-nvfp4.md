# wyattearp/Qwen3.8-27B-Uncensored-NVFP4

## Resumen

Qwen3.8-27B-Uncensored-NVFP4 es una versión cuantizada en NVFP4 (FP4 de NVIDIA) del modelo JonathanColetti/Qwen3.8-27B-Uncensored, publicada por el usuario wyattearp. El modelo base es una variante "uncensored" (abliterada) del Qwen3.8-27B, un modelo denso de visión-lenguaje desarrollado por Alibaba Cloud, que destaca por su capacidad de razonamiento, generación de código y comprensión multimodal. Esta cuantización está optimizada para ejecutarse en GPUs NVIDIA Blackwell (incluida la DGX Spark/GB10) mediante vLLM o TensorRT-LLM, reduciendo el peso a 26.59 GiB y permitiendo su despliegue en entornos con VRAM limitada.

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece una tasa de rechazo (refusal rate) del 0.0% en 327 benchmarks de seguridad, código y alineación, lo que lo hace útil para tareas de red-teaming y análisis de vulnerabilidades; por otro, su cuantización FP4 permite ejecutar un modelo de gran tamaño en hardware de consumo profesional, manteniendo un rendimiento competitivo. El repositorio incluye instrucciones de despliegue con vLLM, soporte para speculative decoding y parsers de tool calling y reasoning.

Aunque el nombre indica 27B de parámetros, el archivo safetensors del repositorio contiene 18.386.186.992 parámetros, una discrepancia que se detalla en la sección de especificaciones. El modelo está licenciado bajo Apache 2.0 y se distribuye en formato safetensors, con soporte para inferencia en FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de visión-lenguaje (basado en Qwen3.8-27B) |
| Parametros totales | 18.386.186.992 (según safetensors; el nombre indica 27B, posible discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 262K según fuentes externas, pero no confirmado para esta versión) |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA, kernels Marlin NVFP4) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, es un transformer denso con capacidades nativas de visión y lenguaje, según la descripción de QwenCloud. Incorpora mejoras en codificación y productividad ofimática, y soporta tool calling, reasoning y contexto largo. La versión "Uncensored" de JonathanColetti aplica una técnica de abliteración a nivel de tensor que elimina los mecanismos de rechazo (refusal) sin pérdida medible de capacidades, según el repositorio de orcarouter.

La cuantización NVFP4 se realizó con NVIDIA ModelOpt, utilizando kernels Marlin NVFP4 para GPUs Blackwell. El proceso de cuantización no modifica la arquitectura, pero reduce el tamaño de los pesos a 26.59 GiB. El repositorio no proporciona detalles sobre el dataset de entrenamiento ni sobre el proceso de abliteración específico, más allá de que se basa en el modelo de JonathanColetti.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de modo "thinking" (parsing de reasoning).
- Comprensión y generación de código, incluyendo descompilación de LLVM IR a C++ (95% Pass@1 en benchmarks propios).
- Capacidades multimodales (visión y texto), heredadas del modelo base Qwen3.8-27B.
- Tool calling / function calling, con parser `qwen3_xml` y soporte para auto-tool-choice en vLLM.
- Soporte de agentes y ejecución de tareas complejas de múltiples pasos.
- Tasa de rechazo del 0.0% en benchmarks de seguridad y alineación, lo que implica ausencia de filtros de contenido.
- Compatible con speculative decoding mediante el modelo auxiliar DFlash 2 (7 tokens especulativos).

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo puede generar respuestas sin filtros, lo que lo hace útil para probar sistemas de moderación y detectar vulnerabilidades en aplicaciones de IA. Su 0% de refusal permite explorar escenarios adversariales sin bloqueos.
- Descompilación y análisis de binarios: con un 95% Pass@1 en LLVM IR a C++, puede asistir en ingeniería inversa y auditoría de código, reduciendo el tiempo de análisis manual.
- Triage de vulnerabilidades: el benchmark Magma LLVM Sanitizer Bug Triage muestra un 100% de acierto en 15 CVEs, lo que sugiere su uso en pipelines de seguridad para clasificar y priorizar fallos.
- Despliegue en hardware Blackwell con VRAM limitada: gracias a la cuantización NVFP4, el modelo cabe en 34 GiB de VRAM con KV cache, permitiendo su ejecución en DGX Spark o GPUs profesionales sin necesidad de clústeres.
- Generación de código en entornos sin restricciones: para desarrolladores que necesitan un asistente de código sin filtros de contenido, aunque con la advertencia de que puede producir código inseguro.
- Investigación académica en alineación y seguridad: el modelo sirve como baseline para estudiar el comportamiento de modelos sin refusals y desarrollar técnicas de mitigación.

## Benchmarks y rendimiento

La model card del autor proporciona resultados empíricos obtenidos en una DGX Spark (NVIDIA GB10) sobre 327 consultas de verificación:

| Benchmark Suite | Total Samples | Metric / Result | Refusal Rate |
| :--- | :---: | :---: | :---: |
| LLVM IR -> C++ Decompilation | 20 | 95.0% Pass@1 (19/20 unit tests) | 0.0% |
| Magma LLVM Sanitizer Bug Triage | 15 | 100.0% Correct (15/15 CVEs) | 0.0% |
| Google OSS-Fuzz-Gen | 20 | 5.0% Valid (1/20 ASan harnesses) | 0.0% |
| Curated taskXX CTF Rubrics | 17 | 52.4% Score (54/103 pts) | 0.0% |
| CyberSecEval (SCG + FRR) | 60 | 100.0% Fulfilled | 0.0% |
| Red-Teaming (OR-Bench, Hex-PHI, AdvBench) | 75 | 100.0% Fulfilled | 0.0% |
| Academic CTF (NYU-CTF, Decompile-Bench, WMDP) | 70 | 100.0% Fulfilled | 0.0% |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los datos presentados son específicos de tareas de seguridad y código, y deben interpretarse con cautela al ser proporcionados por el propio autor.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 26.59 GiB, por lo que se recomienda al menos 34 GiB de VRAM para incluir KV cache y overhead de inferencia.
- GPU recomendadas: NVIDIA Blackwell con soporte FP4 nativo, como B200, DGX Spark (GB10) o RTX 5090. No se garantiza funcionamiento en arquitecturas anteriores (Ampere, Ada) sin emulación FP4.
- Opciones de despliegue: vLLM (con `--dtype auto` y `--trust-remote-code`), TensorRT-LLM, y posiblemente llama.cpp si se convierte a GGUF (no incluido en este repositorio).
- Latencia y throughput: no se proporcionan datos específicos. El uso de speculative decoding con DFlash 2 puede mejorar la velocidad de generación, pero no se cuantifica.
- El modelo está diseñado para entornos con una sola GPU; no se menciona soporte multi-GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Qwen3.8-27B-Uncensored-NVFP4 (este) | 18.4B (safetensors) | No disponible | NVFP4 | Apache 2.0 | HuggingFace |
| Qwen3.8-27B (original) | 27B | 262K (según QwenCloud) | FP16/BF16 | Apache 2.0 | QwenCloud |
| Qwen3.8-27B-Uncensored-FP8 (orcarouter) | 27B | 262K | FP8 | Apache 2.0 | HuggingFace/Ollama |
| Qwen3.8-27B-Uncensored-GGUF (orcarouter) | 27B | 262K | GGUF (Q2_K a F16) | Apache 2.0 | HuggingFace/Ollama |

La versión NVFP4 ofrece el menor tamaño de pesos (26.59 GiB) frente a FP8 o GGUF, pero requiere hardware Blackwell específico. Las versiones GGUF son más portables a CPUs y GPUs variadas. El modelo original sin cuantizar tiene el mayor contexto (262K), mientras que esta versión no especifica el contexto máximo soportado.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", no tiene filtros de seguridad y puede generar contenido dañino, ilegal o éticamente cuestionable. No debe desplegarse en producción sin supervisión humana o sistemas de moderación externos.
- La discrepancia entre el nombre (27B) y los parámetros reales (18.4B) sugiere que el archivo safetensors podría no incluir todos los componentes del modelo base (por ejemplo, el vision tower o la cabeza de lenguaje), lo que podría afectar a las capacidades multimodales. Se recomienda verificar la integridad del modelo antes de usarlo.
- El contexto máximo no está documentado para esta versión; el comando de ejemplo usa `--max-model-len 16384`, pero podría soportar más si el hardware lo permite.
- La cuantización FP4 puede introducir pérdida de precisión en tareas numéricas o de razonamiento complejo, aunque los benchmarks del autor no muestran degradación significativa en tareas de código.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas. Se recomienda revisar la licencia del modelo original.
- El rendimiento en benchmarks de seguridad (100% en red-teaming) indica que el modelo es altamente susceptible a generar respuestas peligrosas, lo que lo hace inadecuado para aplicaciones orientadas al usuario final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wyattearp/Qwen3.8-27B-Uncensored-NVFP4
- Modelo base (JonathanColetti): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Página de QwenCloud sobre Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
- Versión Ollama de orcarouter: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Blog de orcarouter sobre GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guía de ejecución local (orcarouter): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio GitHub de ejemplo: https://github.com/Wassimyounes01/qwen38-uncensored
