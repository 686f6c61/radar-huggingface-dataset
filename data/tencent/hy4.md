# tencent/Hy4

## Resumen

Hy4 es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Tencent Hy. Su columna vertebral linguistica cuenta con 770B parametros totales, de los cuales se activan 49B por token, y esta disenada para comprender texto, imagen y video. La arquitectura consta de 78 capas, con una capa densa inicial y 77 capas MoE con 256 expertos enrutados y 1 experto compartido por capa, activando los 8 mejores expertos enrutados mas el compartido en cada token.

El modelo incorpora innovaciones tecnicas destacables: atencion Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache para reutilizacion de indices dispersos entre capas, conexiones residuales iHC (identity Hyper-Connections) con 4 flujos residuales, y un borrador DFly2 de 5 capas y 3.3B parametros integrado para decodificacion especulativa. Soporta una longitud de contexto de 1M tokens (1.048.576), lo que lo posiciona en la categoria de modelos de contexto ultralargo.

Su relevancia actual radica en la combinacion de un backbone MoE de gran escala con capacidades multimodales (vision y video) y un mecanismo de decodificacion especulativa de bajo coste constante para contexto largo, orientado a casos de uso de agentes, computer use, desarrollo frontend, flujos financieros y asistencia personal de largo horizonte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con backbone transformer, ViT y borrador DFly2 |
| Parametros totales | 774.434.002.142 (≈774B, incluyendo ViT y DFly2; 770B excluyendo ViT, adaptador y DFly2) |
| Parametros activos | 49B texto + 1.23B vision por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | No disponible (existe repositorio GGUF de terceros: AngelSlim/Hy4-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone linguistico de Hy4 tiene 78 capas con un tamano oculto de 6.144 y un vocabulario de 120.832 tokens. La primera capa usa una FFN densa con tamano intermedio de 18.432; las 77 restantes son capas MoE con 256 expertos enrutados, 1 experto compartido y un tamano intermedio de experto de 2.048, activando top-8 expertos enrutados mas el compartido por token. El modulo de atencion emplea Multi-head Latent Attention (MLA) con 64 cabezas, q_lora_rank de 2.048 y kv_lora_rank de 512, combinado con Gated DeepSeek Sparse Attention (Gated DSA) e IndexCache, que selecciona los top-2.048 tokens mediante un indexador de 32 cabezas con dimension 128 y reutiliza indices dispersos entre capas. Las conexiones residuales usan iHC con 4 flujos residuales para ampliar el flujo de informacion entre capas.

El codificador visual (ViT) tiene 40 capas, tamano oculto de 1.536, tamano intermedio de 6.144, 16 cabezas de atencion, parches de 16×16 y embeddings posicionales de 128×128, con fusion de caracteristicas visuales 2×2. Un adaptador convierte las caracteristicas de imagen y fotogramas de video en tokens visuales que el modelo linguistico procesa junto con los tokens de texto. El borrador DFly2, de 5 capas y 3.3B parametros, reutiliza la cache KV y los indices dispersos de Hy4 para soportar decodificacion especulativa en contexto largo con un coste bajo y constante. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en el backbone linguistico de 770B parametros totales y 49B activos.
- Comprension de imagen mediante codificador ViT de 1.23B parametros con resoluciones dinamicas.
- Comprension de video a traves del adaptador que convierte fotogramas en tokens visuales.
- Capacidades de computer use y vision, segun la model card.
- Desarrollo frontend y de videojuegos, segun los casos de uso declarados por el autor.
- Flujos financieros y de oficina.
- Investigacion cientifica e I+D en IA.
- Asistente personal de largo horizonte (long-horizon personal assistant).
- Decodificacion especulativa integrada mediante DFly2 para acelerar la inferencia en contexto largo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Computer use y automatizacion de interfaces: el modelo puede interpretar capturas de pantalla y comprender el estado de una aplicacion gracias a su codificador ViT de resolucion dinamica, lo que permite construir agentes que operen interfaces graficas de forma autonoma.
- Desarrollo frontend y de videojuegos: con 1M tokens de contexto, el modelo puede procesar repositorios completos, hojas de estilo y documentacion de motores de juego en una sola ventana, generando codigo coherente con el estado completo del proyecto.
- Flujos financieros y de oficina: el contexto ultralargo permite introducir estados financieros extensos, contratos y correspondencia historica para tareas de extraccion, resumen y generacion de informes.
- Investigacion cientifica e I+D en IA: el modelo puede procesar articulos, papers y documentacion tecnica de gran extension, asi como asistir en tareas de analisis y generacion de codigo experimental.
- Asistente personal de largo horizonte: la ventana de 1M tokens y la decodificacion especulativa de coste constante permiten mantener conversaciones y memoria de largo plazo sin degradacion del rendimiento por longitud.
- Analisis de video: el adaptador visual convierte fotogramas en tokens, lo que habilita resumen y descripcion de contenido audiovisual en tareas de monitorizacion o catalogacion.
- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con imagenes adjuntas (capturas, documentos escaneados) manteniendo el contexto de toda la sesion.

## Benchmarks y rendimiento

Resultados de evaluacion few-shot del modelo base (Hy4 Base) frente a modelos comparables, segun la model card:

| Categoria | Benchmark | Shots | Hy4 Base | Hy4 flash Base | Hy3 preview Base | DeepSeek-V4-flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---:|---:|---:|---:|---:|---:|
| Conocimiento | MMLU† | 5 | 91.6 | 88.7 | 87.5 | 89.7 | 91.1 |
| Conocimiento | MMLU-Pro† | 5 | 73.9 | 71.1 | 65.8 | 68.6 | 73.4 |
| Conocimiento | MMLU-Redux† | 5 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado en la informacion disponible mas resultados de benchmarks (HumanEval, GSM8K, etc.) alla de los parciales recogidos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 774B parametros totales y 49B activos, la inferencia en precision completa requiere un cluster multi-GPU; el peso total en safetensors ocupa aproximadamente 1.548,9 GB en el repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo, se requiere hardware de clase centro de datos (A100, H100 o superior) en configuracion multi-GPU.
- Cabe en consumer GPU: no en precision completa. Existe un repositorio GGUF de terceros (AngelSlim/Hy4-GGUF) que podria permitir cuantizaciones para hardware mas modesto, aunque no se dispone de especificaciones de VRAM.
- Opciones de despliegue: vLLM y SGLang, segun la seccion de deployment de la model card. Tambien se referencia llama.cpp a traves del repositorio GGUF de terceros. No se menciona Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El modelo incorpora decodificacion especulativa DFly2 para reducir el coste en contexto largo, pero no se publican cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | MMLU (5-shot) | MMLU-Pro (5-shot) |
|---|---|---|---|---|---|---|
| Hy4 Base | 770B (sin ViT/DFly2) | 49B texto + 1.23B vision | 1M | tencent-hy-license | 91.6 | 73.9 |
| Hy4 flash Base | No disponible | No disponible | No disponible | No disponible | 88.7 | 71.1 |
| Hy3 preview Base | No disponible | No disponible | No disponible | No disponible | 87.5 | 65.8 |
| DeepSeek-V4-flash-Base | No disponible | No disponible | No disponible | No disponible | 89.7 | 68.6 |
| DeepSeek-V4-Pro-Base | No disponible | No disponible | No disponible | No disponible | 91.1 | 73.4 |

Los datos de parametros, contexto y licencia de los modelos comparables no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia tencent-hy-license es de tipo "other"; es necesario revisar el texto completo en el enlace de licencia antes de cualquier uso comercial.
- No se dispone de informacion sobre sesgos conocidos del modelo.
- No se dispone de informacion sobre tasas de alucinacion ni sobre evaluaciones de robustez.
- Los idiomas soportados no estan documentados en la informacion disponible, lo que limita la planificacion de despliegues multilingues.
- El modelo es de gran tamano (774B parametros totales, repositorio de 1.548,9 GB), lo que implica requisitos de infraestructura muy elevados y descarta el despliegue en hardware de consumo en precision completa.
- Las capacidades de tool calling y function calling no estan confirmadas en la informacion disponible.
- La model card incluye una seccion de "Known Limitations" cuyo contenido no se ha proporcionado integramente; se recomienda consultarla en el repositorio original.
- El modelo esta marcado como region:us y con muy pocas descargas (2) y likes (6) en el momento de la consulta, lo que sugiere un lanzamiento muy reciente y poca validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy4
- Licencia: https://huggingface.co/tencent/Hy4/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4/blob/main/README_CN.md
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub: https://github.com/Tencent-Hunyuan/Hy4
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4
- Paper Gated DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- Articulo sobre iHC: https://zhuanlan.zhihu.com/p/2010852389670908320
