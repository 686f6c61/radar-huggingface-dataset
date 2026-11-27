# Xylolabs/GLM-4.6V-Flash-Tenstorrent-Tensix-BFP4

## Resumen

GLM-4.6V-Flash-Tenstorrent-Tensix-BFP4 es una cuantización del modelo multimodal GLM-4.6V-Flash de zai-org, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base resuelve tareas de image-text-to-text, es decir, razonamiento conjunto sobre imágenes y texto, y esta versión reduce el peso de 18,80 GB en bf16 a 9,317 GB empaquetados, manteniendo una fidelidad muy alta respecto al original (KL medio de 0,0238 frente a bf16).

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible llevar un modelo visión-lenguaje de aproximadamente 10.292 millones de parámetros a hardware de inferencia no-GPU con pérdida de calidad mínima. Por otro, introduce un formato de cuantización poco habitual, el block floating point (BFP4 y BFP8), que se alinea con el funcionamiento nativo de los tensores Tensix y con el stack ttnn/tt-metal.

El modelo base GLM-4.6V-Flash pertenece a la familia GLM-4V de Zhipu AI (zai-org) y se distribuye bajo licencia MIT. Esta variante conserva esa licencia, lo que la hace atractiva para despliegues comerciales en hardware Tenstorrent, aunque conviene tener en cuenta que el pipeline de ejecución (kernels y runner) es todavía incipiente y está validado principalmente en simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) de la familia GLM-4V; pesos cuantizados a block floating point para Tensix |
| Parametros totales | 10.292.777.472 (10,29 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en atencion q/k/v/o y MLP down; BFP8 (`bfloat8_b`) en MLP gate/up; bf16 en LM head, embeddings, norms y torre visual |
| Idiomas soportados | zh (chino), en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (empaquetado para Tensix), con `quant4.json` e índice de shards |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia GLM-4V, con una torre visual que procesa imágenes y un decoder de lenguaje que integra las representaciones visuales. Esta variante no reentrena el modelo: aplica una cuantización post-entrenamiento sobre las 240 matrices del language model (40 capas). Las proyecciones de atención (q, k, v, o) y la proyección down del MLP se cuantizan a BFP4 mediante GPTQ con búsqueda de exponente por bloque; las proyecciones gate y up del MLP se cuantizan a BFP8 por redondeo al más cercano. El LM head, los embeddings, las normas y toda la torre visual permanecen en bf16.

La innovación técnica principal es el uso de block floating point, un formato en el que un bloque de valores comparte un exponente y cada elemento conserva una mantisa corta. Esto encaja con la forma en que los tensores Tensix almacenan y multiplican datos, y evita el coste de de-cuantización de esquemas como GPTQ int4 estándar. El autor reporta que las 240 matrices cuantizadas empaquetan bit a bit tras aplicar una permutación de filas específica en q/k (las 80 matrices de `self_attn.q_proj` y `self_attn.k_proj` requieren reordenar cada cabeza de 128 filas en cuatro bloques de 32 para caer en la rejilla BFP4). Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se detallan en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline `image-text-to-text` permite responder preguntas sobre imágenes combinadas con instrucciones textuales.
- Comprensión de imágenes: la torre visual en bf16 procesa la entrada visual sin cuantizar, preservando la calidad de las representaciones.
- Conversación multi-turno: la model card incluye `apply_chat_template` y ejemplos de chat, lo que indica soporte de diálogo estructurado.
- Generación de código y matemáticas: capacidad heredada del modelo base GLM-4.6V-Flash, aunque no se aportan benchmarks específicos en esta variante.
- Soporte multilingüe limitado a chino e inglés según los metadatos del modelo.
- Inferencia en NPU Tensix: ejecutable mediante ttnn (validado con ttnn 0.81.1 en el simulador ttsim de Blackhole) y con kernels/runner propios de Xylolabs.
- Tool calling / function calling: no confirmado en la información disponible para esta variante.
- Modo thinking o razonamiento extendido: no confirmado en la información disponible.
- Audio: no soportado según los metadatos.

## Casos de uso

- Descripción y análisis de imágenes en entornos con NPU Tenstorrent: el modelo puede recibir una imagen y una pregunta en inglés o chino y generar una descripción o respuesta razonada, aprovechando la torre visual en bf16 y el decoder cuantizado para reducir el consumo de memoria DRAM en Wormhole o Blackhole.
- Asistencia documental con capturas y diagramas: en un pipeline interno, el modelo puede extraer información de figuras, gráficos o capturas de pantalla y responder preguntas sobre ellas, lo que resulta adecuado por su naturaleza image-text-to-text y su ventana de contexto (no especificada, pero heredada del base).
- Prototipado en hardware no-GPU: equipos que ya disponen de tarjetas Tenstorrent pueden desplegar esta variante para validar flujos de inferencia multimodal sin depender de GPUs NVIDIA, usando los repositorios tensix-kernels y tensix-runner.
- Evaluación de cuantización BFP: investigadores que estudian formatos block floating point pueden usar este modelo como referencia reproducible, ya que el autor publica las herramientas `pack_tensix.py` y `verify_grid.py` y reporta KL y top-1 frente a bf16 y Q4_K_M.
- Moderación de contenido visual en inglés y chino: el modelo puede clasificar o describir imágenes con texto asociado en un servicio de moderación, siempre que se validen previamente los sesgos y la tasa de alucinación en el dominio concreto.
- Generación de respuestas accesibles: a partir de una imagen (por ejemplo, una captura de una interfaz), el modelo puede redactar una explicación textual para usuarios con discapacidad visual, en inglés o chino, integrado en una aplicación de escritorio o web.
- Investigación en eficiencia energética: comparar el consumo y la latencia de esta variante BFP4/BFP8 en Tensix frente a Q4_K_M en llama.cpp permite estudiar el compromiso entre precisión y eficiencia en hardware especializado.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (zai-org/GLM-4.6V-Flash) | 18,80 | 0 | 100 |
| Este modelo (BFP4/BFP8) | 9,317 | 0,023789 | 92,55 |
| Q4_K_M (llama.cpp) | 6,157 | 0,024092 | 92,07 |

Las métricas de KL y top-1 se calculan sobre 16.248 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 9,317 GB empaquetados para el language model en Tensix; el repo completo ocupa 20,6 GB (incluye pesos bf16 de la torre visual y otros tensores). En GPUs convencionales, el modelo en bf16 requiere aproximadamente 18,80 GB, por lo que una RTX 4090 (24 GB) podría cargarlo, aunque esta variante está pensada para Tensix.
- GPU recomendadas para el modelo base: A100 40/80 GB, H100, L40S o RTX 4090 para bf16; para cuantizaciones GGUF equivalentes, GPUs con 8-12 GB podrían ser suficientes, aunque no se aportan datos específicos de esta variante en GPU.
- ¿Cabe en consumer GPU? El modelo base en bf16 cabe en una RTX 4090 de 24 GB; esta variante BFP4/BFP8 no está diseñada para CUDA y requiere el stack ttnn.
- Opciones de despliegue: transformers (con `AutoModelForImageTextToText`), ttnn/tt-metal sobre Wormhole y Blackhole, tensix-kernels y tensix-runner de Xylolabs. No se menciona soporte de vLLM, llama.cpp u Ollama para esta variante.
- Latencia y throughput: no disponibles. La validación se realizó en el simulador ttsim de Blackhole con ttnn 0.81.1, no en hardware físico, por lo que no hay cifras de rendimiento real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|
| GLM-4.6V-Flash-Tenstorrent-Tensix-BFP4 | 10,29 mil millones | no disponible | MIT | Tensix (Wormhole, Blackhole) | Cuantizado BFP4/BFP8, 9,317 GB |
| zai-org/GLM-4.6V-Flash (bf16) | 10,29 mil millones | no disponible | MIT | GPU (CUDA) | Modelo base, 18,80 GB, referencia de calidad |
| Q4_K_M de GLM-4.6V-Flash (llama.cpp) | 10,29 mil millones | no disponible | MIT | CPU/GPU | 6,157 GB, KL 0,024092, top-1 92,07 % |
| Alternativas multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación más directa es con el modelo base en bf16 y con la cuantización Q4_K_M generada por llama.cpp: esta variante BFP4/BFP8 ocupa más que Q4_K_M (9,317 GB frente a 6,157 GB) pero ofrece una fidelidad ligeramente superior (KL 0,023789 frente a 0,024092) y está adaptada al hardware Tensix.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés según los metadatos; no se garantiza un rendimiento adecuado en castellano u otras lenguas.
- Riesgo de alucinación inherente al modelo base, no evaluado específicamente en esta variante cuantizada.
- La cuantización BFP4 en atención y MLP down introduce una pérdida medible (KL 0,0238, top-1 92,55 %), aceptable para muchas tareas pero no despreciable en aplicaciones de alta precisión.
- Las matrices q/k requieren una permutación de filas específica para caer en la rejilla BFP4; un uso incorrecto del layout puede producir resultados erróneos. Las herramientas `pack_tensix.py` y `verify_grid.py` reportan estas matrices como fuera de la rejilla tal y como se almacenan.
- El soporte de ejecución en Tensix está validado en simulador (ttsim), no en hardware físico; la madurez del stack ttnn/tt-metal para producción es limitada.
- No hay datos publicados de latencia, throughput ni benchmarks de tareas para esta variante.
- Licencia MIT permite uso comercial, pero conviene revisar las dependencias (ttnn, tt-metal, kernels) y sus propias licencias.
- El pipeline de transformers incluido en la model card carga el modelo en bf16 (`dtype="bfloat16"`), lo que no aprovecha la cuantización BFP; para beneficiarse del formato Tensix hay que usar el flujo ttnn.
- No se confirma soporte de tool calling, agentes o modo thinking en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia del código: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/b886c1abb4a266c350bf88a9d4917b04cbd67c78
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arXiv:2507.01006): https://arxiv.org/abs/2507.01006
- Licencia MIT del modelo: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
