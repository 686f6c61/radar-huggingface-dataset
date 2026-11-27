# tencent/Hy4-FP8

## Resumen

Hy4-FP8 es la version cuantizada en FP8 del modelo insignia Hy4, desarrollado por el equipo Tencent Hy. Se trata de un modelo Mixture-of-Experts (MoE) multimodal que combina comprension de texto e imagen dentro de una unica pila de transformers. El backbone linguistico cuenta con 770.000 millones de parametros totales, de los cuales se activan 49.000 millones por token, mas un codificador visual ViT de 1.230 millones de parametros y un drafter de decodificacion especulativa DFly2 de 3.300 millones.

El modelo resuelve el problema de procesar contextos extremadamente largos con coste computacional controlado: emplea atencion dispersa Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache, lo que le permite operar con una ventana de contexto de 1.048.576 tokens. La publicacion de esta variante FP8 es relevante porque reduce el peso del repositorio a 786,3 GB (frente a los aproximadamente 1,5 TB que ocuparian los pesos en BF16) y facilita el despliegue en infraestructura con memoria limitada, manteniendo el pipeline `image-text-to-text`.

La arquitectura esta inspirada en DeepSeek y GLM, e incorpora innovaciones propias como las conexiones residuales iHC (identity Hyper-Connections) con 4 flujos residuales y el drafter paralelo DFly2, que reutiliza la cache KV y los indices dispersos del modelo principal para decodificacion especulativa de bajo coste constante en contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con ViT y drafter DFly2 |
| Parametros totales | 774.434.002.142 (backbone 770B + ViT 1,23B + DFly2 3,3B) |
| Parametros activos | 49B texto + 1,23B vision por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 (compressed-tensors); existe variante GGUF publicada por terceros |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (licencia propia, enlazada en el repositorio) |
| Formato de pesos | safetensors (FP8); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El backbone linguistico consta de 78 capas: la primera usa una FFN densa con tamano intermedio de 18.432, y las 77 restantes son capas MoE con 256 expertos enrutados y 1 experto compartido por capa. Cada token activa los 8 expertos enrutados principales junto con el experto compartido; el tamano intermedio de cada experto es de 2.048. El tamano oculto es de 6.144 y el vocabulario de 120.832 tokens.

El modulo de atencion emplea Multi-head Latent Attention (MLA) con 64 cabezas, q_lora_rank de 2.048 y kv_lora_rank de 512, combinado con Gated DeepSeek Sparse Attention: un indexador de 32 cabezas con dimension 128 selecciona los 2.048 tokens mas relevantes del contexto. La innovacion IndexCache permite reutilizar el indice disperso entre capas, reduciendo el coste de seleccion. Las conexiones residuales usan iHC con 4 flujos residuales para ampliar el flujo de informacion entre capas. El ViT tiene 40 capas, tamano oculto 1.536, 16 cabezas de atencion, parches de 16x16, embeddings posicionales de 128x128 y fusion de caracteristicas visuales 2x2; un adaptador convierte las caracteristicas de imagen y fotogramas de video en tokens visuales.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO. La model card incluye una grafica de bits-per-byte (BPB) sobre validacion interna de codigo y agentes, pero no se detallan los datos subyacentes.

## Capacidades

- Comprension conjunta de texto e imagen (pipeline `image-text-to-text`), con soporte de resoluciones dinamicas y fotogramas de video.
- Generacion de texto, razonamiento y conversacion multi-turno en modo instruct.
- Procesamiento de contextos de hasta 1M de tokens, adecuado para documentos extensos y sesiones largas.
- Decodificacion especulativa nativa mediante DFly2, que acelera la generacion en contextos largos reutilizando cache KV e indices dispersos.
- Capacidades orientadas a uso de ordenador (vision and computer use), segun la model card.
- Desarrollo frontend y de videojuegos, segun los casos de uso declarados por el autor.
- Flujos de trabajo financieros y de oficina, segun la model card.
- Investigacion cientifica e I+D en IA, segun la model card.
- Asistente personal de horizonte largo, segun la model card.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial muy extenso gracias a su ventana de 1M de tokens, lo que permite conservar todo el contexto de una sesion sin truncar.
- Analisis de documentos extensos con imagenes: al combinar ViT y backbone linguistico, puede procesar informes, contratos o manuales con graficos y tablas en una sola pasada.
- Vision and computer use: la model card lo orienta a interpretar pantallas y elementos visuales, lo que habilita agentes que operan interfaces graficas.
- Desarrollo frontend y de videojuegos: generacion y revision de codigo junto con capturas de interfaz, aprovechando la comprension multimodal y el contexto largo para mantener coherencia en proyectos grandes.
- Flujos financieros y de oficina: extraccion y razonamiento sobre documentos financieros, hojas de calculo renderizadas e informes, con el contexto suficiente para correlacionar multiples fuentes.
- Investigacion cientifica e I+D: lectura de articulos con figuras, resumen y razonamiento sobre resultados experimentales en sesiones de contexto largo.
- Asistente personal de horizonte largo: seguimiento de tareas y preferencias a lo largo de sesiones prolongadas, apoyado en la ventana de 1M tokens y en la decodificacion especulativa para mantener latencia contenida.
- Despliegue en produccion con FP8: la cuantizacion reduce el footprint de memoria, lo que permite servir el modelo en infraestructura con menos VRAM que la version BF16.

## Benchmarks y rendimiento

La model card incluye resultados de evaluacion few-shot del modelo base (no de la variante FP8) frente a modelos comparables. Los datos disponibles son parciales:

| Categoria | Benchmark | Shots | Hy4 Base | Hy4 flash Base | Hy3 preview Base | DeepSeek-V4-flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---:|---:|---:|---:|---:|---:|
| Conocimiento | MMLU | 5 | 91,6 | 88,7 | 87,5 | 89,7 | 91,1 |
| Conocimiento | MMLU-Pro | 5 | 73,9 | 71,1 | 65,8 | 68,6 | 73,4 |

No se han publicado en la informacion disponible resultados de benchmarks para la variante FP8, ni datos de HumanEval, GSM8K u otros conjuntos. Tampoco se detallan metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 786 GB (tamano del repositorio), por lo que la inferencia requiere agregar memoria para cache KV, indices dispersos y el drafter DFly2; el total supera ampliamente cualquier GPU consumer.
- GPU recomendadas: se necesita un nodo multi-GPU con GPUs de centro de datos (A100 80 GB, H100 80 GB, H200 o equivalentes); el numero exacto de GPUs no esta especificado en la informacion disponible.
- GPU consumer: no cabe en RTX 4090 ni en ninguna GPU consumer individual; solo seria viable mediante cuantizaciones GGUF agresivas y offloading, con rendimiento muy degradado.
- Opciones de despliegue: la model card documenta vLLM y SGLang, con soporte de decodificacion especulativa DFly2 y cuantizacion. Existe una variante GGUF publicada por terceros (AngelSlim/Hy4-GGUF) para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Hy4-FP8 | 770B (backbone) | 49B texto + 1,23B vision | 1M | tencent-hy-license | safetensors FP8 |
| Hy4 Base (BF16) | 770B (backbone) | 49B texto + 1,23B vision | 1M | tencent-hy-license | safetensors |
| Hy4 flash Base | no disponible | no disponible | no disponible | tencent-hy-license | no disponible |
| DeepSeek-V4-Pro-Base | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSeek-V4-flash-Base | no disponible | no disponible | no disponible | no disponible | no disponible |

En MMLU y MMLU-Pro, Hy4 Base supera a Hy4 flash Base, Hy3 preview Base y DeepSeek-V4-flash-Base, y queda ligeramente por encima de DeepSeek-V4-Pro-Base en MMLU (91,6 frente a 91,1) y practicamente empatado en MMLU-Pro (73,9 frente a 73,4). No se dispone de especificaciones tecnicas completas de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado por un equipo chino, es previsible un sesgo cultural y linguistico hacia ese contexto, aunque no se confirma.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no se cuantifica en la model card.
- Limitaciones de contexto o idioma: aunque el contexto es de 1M tokens, el rendimiento en los extremos de la ventana no esta documentado; los idiomas soportados no se especifican.
- Restricciones de licencia: la licencia tencent-hy-license es propia y debe revisarse antes de cualquier uso comercial; no es una licencia open source estandar.
- Cuantizacion FP8: puede introducir una degradacion de calidad respecto a BF16 no cuantificada en la informacion disponible; los benchmarks publicados corresponden al modelo base, no a esta variante.
- Despliegue: el tamano de 786 GB exige infraestructura multi-GPU de centro de datos; no es viable en hardware consumer sin cuantizaciones extremas.
- Casos de uso declarados: las capacidades de computer use, finanzas y asistente personal provienen de la model card del autor y no estan respaldadas por benchmarks publicos en la informacion disponible.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/tencent/Hy4-FP8
- Hugging Face (modelo base): https://huggingface.co/tencent/Hy4
- Licencia: https://huggingface.co/tencent/Hy4-FP8/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4-FP8/blob/main/README_CN.md
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub: https://github.com/Tencent-Hunyuan/Hy4
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- AtomGit: https://ai.gitcode.com/tencent_hunyuan/Hy4
- Paper Gated DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- Articulo sobre iHC: https://zhuanlan.zhihu.com/p/2010852389670908320
