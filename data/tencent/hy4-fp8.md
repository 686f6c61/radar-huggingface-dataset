# tencent/Hy4-FP8

## Resumen

Hy4 es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Tencent Hy. Su columna vertebral linguistica cuenta con 770B parametros totales, de los cuales se activan 49B por token, y esta disenada para comprender texto, imagen y video. La version publicada en este repositorio, Hy4-FP8, es una cuantizacion en FP8 del modelo original, lo que reduce el peso en disco y memoria a costa de una pequena perdida de precision numerica. Con una ventana de contexto de 1M tokens (1.048.576), se posiciona en la categoria de modelos de contexto ultralargo para tareas de agente y razonamiento multi-paso.

La arquitectura combina atencion Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache, Multi-head Latent Attention (MLA) y conexiones residuales iHC con 4 flujos. Incorpora un codificador visual ViT de 1.23B parametros para resoluciones dinamicas y un drafter DFly2 de 3.3B parametros para decodificacion especulativa de bajo coste constante en contextos largos. El modelo se distribuye bajo la licencia Tencent Hy License, que no es de codigo abierto pleno y requiere revisar sus terminos para uso comercial.

Su relevancia actual radica en la combinacion de un contexto de 1M tokens, capacidades multimodales (imagen y video) y un esquema de activacion dispersa que mantiene el coste de inferencia en 49B parametros activos, lo que lo hace viable en infraestructuras de servidor con multiples GPUs de alta gama, aunque no en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion Gated DSA + MLA, ViT y drafter DFly2 |
| Parametros totales | 770B (columna vertebral linguistica); 774.434.002.142 en pesos safetensors (incluye ViT y otros componentes) |
| Parametros activos | 49B texto + 1.23B vision por token (MoE top-8 de 256 expertos enrutados + 1 compartido) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 (esta version); existe version GGUF publicada por terceros (AngelSlim/Hy4-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (license: other) |
| Formato de pesos | safetensors (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

La columna vertebral linguistica consta de 78 capas: la primera con FFN densa y las 77 restantes con FFN MoE. Cada capa MoE contiene 256 expertos enrutados y 1 experto compartido, activando los top-8 enrutados mas el compartido por token. El tamano oculto es de 6.144, el vocabulario de 120.832 tokens y el tamano intermedio de los expertos de 2.048. La atencion usa Multi-head Latent Attention (MLA) con 64 cabezas, q_lora_rank de 2.048 y kv_lora_rank de 512, sobre la que se aplica Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache para reutilizar indices dispersos entre capas y seleccionar los top-2.048 tokens por consulta. Las conexiones residuales emplean iHC (identity Hyper-Connections) con 4 flujos para ampliar el flujo de informacion entre capas.

El codificador visual es un ViT de 40 capas, tamano oculto 1.536, tamano intermedio 6.144, 16 cabezas de atencion, parches de 16x16, embeddings posicionales de 128x128 y fusion de caracteristicas visuales 2x2; sus caracteristicas se convierten en tokens visuales mediante un adaptador. El drafter DFly2 (5 capas, 3.3B parametros) reutiliza la cache KV y los indices dispersos de Hy4 para decodificacion especulativa de coste constante en contextos largos. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Comprension y generacion de texto con razonamiento multi-paso.
- Comprension de imagenes con resolucion dinamica mediante ViT y adaptador.
- Comprension de video a traves de frames procesados por el codificador visual.
- Uso de herramientas (tool calling / function calling), segun los casos de uso descritos en la model card (vision y computer use, flujos de oficina, asistentes).
- Razonamiento de agente y tareas de horizonte largo (long-horizon personal assistant).
- Contexto ultralargo de 1M tokens para documentos extensos y conversaciones multi-turno.
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Modo de pensamiento (thinking): no disponible en la informacion proporcionada.
- Decodificacion especulativa integrada mediante DFly2.

## Casos de uso

- Vision y computer use: el modelo puede interpretar capturas de pantalla y contenido visual para automatizar interacciones con interfaces, aprovechando el ViT de resolucion dinamica y el contexto de 1M tokens para mantener el historial de acciones.
- Desarrollo frontend y de videojuegos: generacion y revision de codigo de interfaz a partir de descripciones o capturas, con soporte de tool calling para integrarse en pipelines de CI/CD.
- Flujos financieros y de oficina: procesamiento de documentos largos (informes, estados financieros) en una sola ventana de 1M tokens, extrayendo datos y generando resumenes estructurados.
- Investigacion cientifica y I+D en IA: analisis de articulos, codigo y figuras en un mismo contexto multimodal, util para revisiones tecnicas y reproduccion de experimentos.
- Asistente personal de horizonte largo: gestion de tareas prolongadas con memoria de conversacion extensa gracias a la ventana de 1M tokens y a la decodificacion especulativa de bajo coste.
- Analisis de video: extraccion de informacion de grabaciones mediante frames procesados por el codificador visual, adecuado para resumenes y busqueda de eventos.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto largo y posible integracion de herramientas para consultar sistemas internos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion few-shot del modelo base (Hy4 Base) frente a alternativas, de la que se dispone de datos parciales:

| Categoria | Benchmark | Shots | Hy4 Base | Hy4 flash Base | Hy3 preview Base | DeepSeek-V4-flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---:|---:|---:|---:|---:|---:|
| Conocimiento | MMLU | 5 | 91.6 | 88.7 | 87.5 | 89.7 | 91.1 |
| Conocimiento | MMLU-Pro | 5 | 73.9 | 71.1 | 65.8 | 68.6 | no disponible (dato truncado) |

No se han publicado en la informacion disponible resultados de benchmarks para la version FP8 (Hy4-FP8), ni datos de HumanEval, GSM8K u otras pruebas. Tampoco se dispone del resto de filas de la tabla de la model card.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 786 GB (tamano del repositorio), por lo que la inferencia requiere agregar al menos 8 GPUs de 96 GB (H100/H200) o 16 GPUs de 48 GB para alojar los pesos, mas memoria para cache KV y activaciones.
- GPU recomendadas: H100 80 GB, H200 141 GB, A100 80 GB en configuraciones multi-GPU; no cabe en GPUs de consumo (RTX 4090, 24 GB).
- Cabe en consumer GPU: no.
- Opciones de despliegue: vLLM y SGLang (segun la model card), con soporte de decodificacion especulativa DFly2; existe una version GGUF de terceros (AngelSlim/Hy4-GGUF) para llama.cpp/Ollama, aunque su viabilidad practica con 770B parametros es muy limitada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Hy4 (este modelo) | 770B | 49B texto + 1.23B vision | 1M | Tencent Hy License | Hugging Face, ModelScope, GitCode |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSeek-V4-flash | no disponible | no disponible | no disponible | no disponible | no disponible |
| Hy3 preview | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de parametros, contexto y licencia de los modelos comparables no estan disponibles en la informacion proporcionada; solo se dispone de sus resultados parciales en MMLU y MMLU-Pro recogidos en la tabla anterior.

## Limitaciones y advertencias

- La licencia Tencent Hy License no es de codigo abierto pleno; es necesario revisar sus terminos antes de cualquier uso comercial o redistribucion.
- La cuantizacion FP8 puede introducir degradaciones de precision respecto al modelo original en tareas sensibles.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan en la informacion disponible las mitigaciones aplicadas.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingue es incierto.
- El contexto de 1M tokens no garantiza el uso efectivo de toda la ventana; el mecanismo de seleccion dispersa top-2.048 tokens puede descartar informacion relevante.
- El despliegue requiere infraestructura multi-GPU de alta gama; no es viable en hardware de consumo.
- No se dispone de datos sobre sesgos conocidos ni de la system card (referenciada pero no incluida en la informacion).

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy4-FP8
- Modelo original: https://huggingface.co/tencent/Hy4
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub: https://github.com/Tencent-Hunyuan/Hy4
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-GGUF
- Licencia: https://huggingface.co/tencent/Hy4-FP8/blob/main/LICENSE
- Paper Gated DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- Articulo sobre iHC: https://zhuanlan.zhihu.com/p/2010852389670908320
