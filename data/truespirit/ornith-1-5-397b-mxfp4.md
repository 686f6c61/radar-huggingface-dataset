# truespirit/Ornith-1.5-397B-MXFP4

## Resumen

Ornith-1.5-397B-MXFP4 es una versión cuantizada en formato MXFP4 del modelo Ornith-1.5-397B, desarrollada por el usuario truespirit. El modelo original, creado por Ornith AI, es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) basado en la arquitectura Qwen3.5, orientado a tareas de codificacion agéntica y razonamiento. Esta cuantización reduce el peso del modelo de aproximadamente 790 GB (BF16) a 239 GB, lo que permite su ejecución en una única GPU AMD Instinct MI355X de 288 GB.

La cuantización se realizó con AMD Quark 0.12.post1 siguiendo la receta publicada por AMD para el modelo Qwen3.5-397B-A17B-MXFP4. Solo los expertos enrutados del MoE se cuantizan a MXFP4; los componentes sensibles como la cabeza de salida, la torre visual, la atención (incluida la atención lineal) y las puertas del MoE se mantienen en BF16. El modelo conserva la arquitectura original `qwen3_5_moe` y es compatible con vLLM en ROCm.

Con un contexto de 262 000 tokens y capacidades multimodales (imagen y texto), este modelo está pensado para escenarios de agente de codificación, análisis de repositorios y razonamiento de largo alcance. La licencia MIT permite uso comercial sin restricciones, aunque la calidad de generación tras la cuantización aún no ha sido evaluada formalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (Mixture-of-Experts) con atención lineal, MTP y torre visual |
| Parametros totales | 210 124 400 624 (segun safetensors; el nombre del modelo sugiere 397B, posiblemente contando parametros no almacenados) |
| Parametros activos | 17B (segun la receta AMD Qwen3.5-397B-A17B, no confirmado para este modelo) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | MXFP4 (OCP, block size 32, empaquetado U8 + escalas E8M0); tambien existen versiones FP8 y NVFP4 del modelo base |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (122 shards, MXFP4 empaquetado) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-397B es un MoE multimodal basado en la arquitectura Qwen3.5, con 397B parametros totales y 17B activos por token. Incluye una torre visual para procesamiento de imagenes, atencion lineal para eficiencia en contextos largos y un modulo de prediccion multi-token (MTP). La version cuantizada MXFP4 mantiene intactos todos los componentes excepto los expertos enrutados del MoE, que se almacenan en MXFP4 con block size 32.

El entrenamiento del modelo original se basa en el framework de "self-scaffolding" y "self-improvement" de Ornith AI: el modelo propone nuevas tareas, genera andamiajes especificos y produce rollouts de soluciones para aprendizaje por refuerzo, creando un bucle continuo de mejora. No se dispone de datos concretos sobre el volumen de tokens de entrenamiento ni la composicion del dataset. La cuantizacion se realizo mediante AMD Quark 0.12.post1, partiendo de la version FP8 del modelo base.

## Capacidades

- Generacion de texto y codigo en multiples lenguajes de programacion, con razonamiento matematico y logico.
- Procesamiento multimodal: acepta entradas de imagen y texto (image-text-to-text), util para capturas de pantalla, diagramas o documentacion visual.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Capacidad de razonamiento multi-paso y planificacion de tareas, adecuado para agentes autonomos.
- Contexto largo de 262 000 tokens, permitiendo analisis de repositorios completos o documentos extensos.
- Arquitectura MoE con 17B parametros activos, ofreciendo rendimiento de modelos grandes con menor coste computacional por token.

## Casos de uso

- Agente de codificacion autonomo: el modelo puede recibir una descripcion de tarea, explorar el repositorio, generar parches y ejecutar pruebas, gracias a su soporte de tool calling y contexto largo.
- Analisis de repositorios grandes: con 262K tokens de contexto, puede procesar multiples archivos de codigo, detectar dependencias y proponer refactorizaciones.
- Asistente de debugging: dada una traza de error o una captura de pantalla de una interfaz, el modelo puede identificar la causa raiz y sugerir correcciones.
- Generacion de documentacion tecnica: a partir de codigo fuente o diagramas, puede redactar documentacion clara y detallada.
- Razonamiento multimodal para soporte tecnico: analiza imagenes de errores, logs y capturas para diagnosticar problemas en entornos de produccion.
- Entrenamiento de modelos mas pequenos: al ser de codigo abierto y con licencia MIT, puede usarse para generar datos sinteticos de alta calidad para destilar en modelos locales.

## Benchmarks y rendimiento

Segun benchlm.ai, Ornith-1.5-397B (modelo base) obtiene una puntuacion de 68.46/100 en el leaderboard publico, ocupando el puesto 22 de 226 modelos. No se han publicado resultados de benchmarks especificos para la version cuantizada MXFP4. La model card indica que la calidad de generacion tras la cuantizacion no ha sido evaluada formalmente.

| Benchmark | Resultado |
|---|---|
| Leaderboard benchlm.ai | 68.46/100 (puesto 22 de 226) |

## Requisitos de hardware

- VRAM estimada: 239 GB para los pesos en MXFP4, mas overhead de activaciones y KV cache. Se requiere al menos 288 GB de VRAM para inferencia con TP=1.
- GPU recomendada: AMD Instinct MI355X (288 GB). No cabe en GPUs de consumo (RTX 4090, 5090, etc.) ni en GPUs de datacenter de 80 GB como A100 o H100 sin particionado.
- Despliegue: vLLM compilado para ROCm con soporte OCP MXFP4 (AMD Quark habilitado). Comando de ejemplo: `vllm serve truespirit/Ornith-1.5-397B-MXFP4 --tensor-parallel-size 1`.
- Latencia y throughput: no disponibles. Al ser un MoE con 17B activos, el coste por token es similar al de un modelo de 17B, pero la carga de pesos de 239 GB limita el throughput en una sola GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-397B-MXFP4 (este) | 210B (safetensors) | 262K | MXFP4 | MIT | Hugging Face |
| Ornith-1.5-397B-FP8 | 397B (estimado) | 262K | FP8 | MIT | Hugging Face |
| Ornith-1.5-397B-NVFP4 | 397B (estimado) | 262K | NVFP4 | MIT | Hugging Face |
| Qwen3.5-397B-A17B-MXFP4 | 397B | 262K | MXFP4 | Apache 2.0 | Hugging Face |

La version MXFP4 reduce el peso a la mitad respecto a FP8 y a un tercio respecto a BF16, a costa de una posible perdida de precision. La licencia MIT es mas permisiva que la Apache 2.0 de Qwen.

## Limitaciones y advertencias

- La cuantizacion MXFP4 puede introducir diferencias numericas en las salidas; no se ha verificado la calidad de generacion frente al modelo original.
- Requiere hardware especifico (AMD MI355X) y un stack de inferencia con soporte OCP MXFP4; no es portable a entornos CUDA estandar sin modificaciones.
- No se dispone de informacion sobre los idiomas soportados ni sobre sesgos o alucinaciones del modelo base.
- El numero de parametros real (210B) difiere del nombre del modelo (397B); esto puede deberse a la exclusion de ciertos componentes en el safetensors o a un conteo diferente.
- Al ser una cuantizacion reciente (agosto 2026), no hay suficiente adopcion en la comunidad ni benchmarks independientes que validen su rendimiento en produccion.

## Enlaces

- [Modelo en Hugging Face (truespirit/Ornith-1.5-397B-MXFP4)](https://huggingface.co/truespirit/Ornith-1.5-397B-MXFP4)
- [Modelo base (ornith-ai/Ornith-1.5-397B)](https://huggingface.co/ornith-ai/Ornith-1.5-397B)
- [Version NVFP4 del modelo base](https://huggingface.co/ornith-ai/Ornith-1.5-397B-NVFP4)
- [Pagina oficial de Ornith AI sobre Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Guia de Ornith AI para modelos de codificacion](https://ornith.online/)
- [Benchmarks de Ornith-1.5-397B en benchlm.ai](https://benchlm.ai/models/ornith-1-5-397b)
