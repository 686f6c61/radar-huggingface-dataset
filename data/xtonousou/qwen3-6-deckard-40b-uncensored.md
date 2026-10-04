# xtonousou/Qwen3.6-Deckard-40B-Uncensored

## Resumen

Qwen3.6-Deckard-40B-Uncensored es un modelo de lenguaje de 40.000 millones de parámetros (39.072.596.736 exactos, arquitectura densa) publicado por el usuario xtonousou en HuggingFace. Se trata de una distribucion en GGUF de un modelo derivado de la familia Qwen 3.6, construido a partir del modelo base DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking. El pipeline declarado es image-text-to-text, lo que indica soporte multimodal de vision (imagenes) ademas de texto.

El modelo parte del Qwen 3.6 de 27B, que fue expandido hasta 40B mediante upcycling de parametros (96 capas y 1275 tensores, un 50% mas que el modelo base de 27B). El proceso de afinado se realizo en varias fases: primero se aplico una tecnica de eliminacion de censura tipo Heretic, despues se entreno sobre los datasets internos "Deckard/PkDick" (5 datasets orientados a caracter, inteligencia, profundidad y punto de vista), y finalmente se ajusto con el dataset destilado de Claude 4.6 Opus para acortar y estabilizar el razonamiento. Todo ello mediante Unsloth.

Es relevante en el ecosistema open source porque combina contexto largo (256K tokens), capacidad de razonamiento variable (thinking mode), soporte de vision y una fuerte orientacion a escritura creativa y roleplay sin filtros. Destaca tambien por sus cuantizaciones GGUF personalizadas con doble imatrix (NEO-CODE-Di-IMatrix-MAX), que segun el autor conservan entre el 94% y el 98,4% de la precision del modelo en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), expandido de Qwen 3.6 27B |
| Parametros totales | 39.072.596.736 (39B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF: IQ2_M, IQ4_XS, IQ4_XS/NL, Q6, Q8_0 HIGH (con componentes bf16); tambien bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, safetensors (bfloat16); requiere mmproj para vision |

## Arquitectura y entrenamiento

El modelo es un transformer denso con 96 capas y 1275 tensores. No emplea mezcla de expertos: todos los parametros estan activos en cada pasada. Su origen es el Qwen 3.6 de 27B, sobre el que se aplico una expansion de parametros hasta 40B (proceso descrito por el autor como "room to think"), aumentando la capacidad de computo interno. Incorpora razonamiento de longitud variable: genera cadenas de pensamiento mas cortas ante problemas simples y mas largas ante problemas complejos.

El entrenamiento se desarrollo en varias etapas secuenciales e iterativas. Primero se elimino la censura mediante la tecnica Heretic (variante de abliteration, que interviene en las direcciones de activacion del modelo). A continuacion se realizo un afinado supervisado con Unsloth sobre los datasets internos Deckard/PkDick, orientados a dotar al modelo de "caracter" y profundidad en escritura de ficcion. Despues se llevo a cabo la expansion a 40B y, finalmente, un segundo ajuste con el dataset destilado de Claude 4.6 Opus (TeichAI/claude-4.5-opus-high-reasoning-250x) para acortar y estabilizar el razonamiento. Las cuantizaciones GGUF incluyen una doble imatrix ("Di-Matrix") resultante de fusionar los datasets NEO y NEO-CODE, junto con ajustes de tensores calibrados y evaluados contra el modelo en bf16. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de los nombres indicados.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" de longitud variable.
- Escritura creativa y de ficcion: generacion de tramas, subtramas, continuacion de escenas, storytelling por generos (ciencia ficcion, romance y otros).
- Roleplay y conversacion sin filtros (modelo declarado como uncensored y unfiltered).
- Generacion de codigo y resolucion de problemas matematicos (etiqueta "coder" y cuantizaciones optimizadas para coding y matematicas).
- Multimodal de vision: procesa imagenes segun el pipeline image-text-to-text, requiriendo el archivo mmproj.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Razonamiento multi-paso y agentes: no confirmado explicitamente; el thinking mode sugiere capacidad de razonamiento estructurado.
- Capacidades multilingues limitadas a ingles (en) y chino (zh).

## Casos de uso

- Escritura de ficcion asistida: el modelo esta afinado especificamente sobre datasets de narrativa y roleplay, por lo que resulta adecuado para generar tramas, continuar escenas y mantener coherencia de personajes a lo largo de textos extensos.
- Edicion y critica literaria: su orientacion a la observacion critica permite usarlo como corrector de agujeros de guion y problemas estructurales en novelas o relatos largos (aprovechando el contexto de 256K).
- Roleplay y compania conversacional: gracias al ajuste sin censura, puede sostener personajes consistentes en interacciones prolongadas.
- Generacion de codigo: las cuantizaciones NEO-CODE estan calibradas para mantener el rendimiento en tareas de programacion, lo que permite su uso en asistentes de codigo locales.
- Razonamiento matematico y resolucion de problemas paso a paso: el modo de razonamiento de longitud variable se adapta a la complejidad del problema planteado.
- Analisis de imagenes con texto: al soportar vision mediante mmproj, puede describir imagenes, extraer informacion visual o combinarla con generacion textual.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones IQ4_XS o IQ2_M, puede ejecutarse en GPU de gama alta para uso personal sin depender de APIs externas.

## Benchmarks y rendimiento

El autor afirma que el modelo supera al modelo base en 6 de 7 benchmarks, pero no se detallan en la informacion disponible los nombres ni los valores de dichos benchmarks. Si se publican las siguientes metricas de fidelidad de las cuantizaciones respecto al modelo en bf16:

| Cuantizacion | Precision respecto a bf16 |
|---|---|
| IQ2_M | 83-84% |
| IQ4_XS | 94% |
| Q8_0 HIGH | 98,4% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC-C u otros) para este modelo concreto en la informacion disponible. La referencia a "700+ ARC-C" que aparece en la model card corresponde a un modelo distinto (FABLE-FUSION-711 Qwen 3.6 27B) y no debe atribuirse a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos, no publicados por el autor): bf16 en torno a 78-80 GB; Q8_0 en torno a 40-42 GB; Q4/IQ4_XS en torno a 20-24 GB; IQ2_M en torno a 12-14 GB.
- GPU recomendadas: para bf16, A100 80GB o H100 80GB; para Q8, A100 40GB / H100; para Q4, RTX 4090 (24GB) o RTX 3090 (24GB).
- Compatibilidad con hardware de consumo: si, en cuantizaciones Q4/IQ4_XS o inferiores cabe en GPUs de 24GB (RTX 3090, RTX 4090) y potencialmente en tarjetas de 12-16GB con IQ2_M, aunque con perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python y demas runtimes compatibles con GGUF. El formato safetensors permite vLLM o TGI, pero requeriria hardware mucho mayor.
- Latencia y throughput: no disponible.
- Vision: requiere descargar un archivo mmproj adicional y colocarlo en la misma carpeta que el GGUF.
- Tamano del repositorio: 259,9 GB (incluye multiples cuantizaciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-Deckard-40B-Uncensored (este) | 39B denso | 256K | Vision + texto, GGUF | apache-2.0 | HuggingFace |
| DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking | 40B denso | 256K | texto (base de este modelo) | apache-2.0 | HuggingFace |
| Qwen3.6 27B (base original de la familia) | 27B denso | no disponible | texto | no disponible | HuggingFace |
| Qwen3.6-35B-A3B | 35B (A3B, MoE) | no disponible | texto | no disponible | HuggingFace |

La comparativa se limita a los modelos mencionados en la propia model card. No se dispone de datos de rendimiento comparativos verificables entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo declarado explicitamente como uncensored y unfiltered: puede generar contenido NSFW, ofensivo o inapropiado sin restricciones. No es apto para entornos donde se requiera moderacion automatica.
- Riesgo de alucinacion: no cuantificado por el autor; como cualquier LLM, puede inventar datos, especialmente en tareas factuales.
- Idiomas: solo ingles (en) y chino (zh). No hay soporte declarado de castellano ni de otros idiomas.
- Licencia apache-2.0: permite uso comercial, pero el modelo deriva de un ajuste sobre Qwen 3.6, por lo que conviene verificar las condiciones de la licencia original de Qwen y de los datasets destilados de Claude (cuyo uso comercial puede estar restringido segun los terminos de Anthropic).
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validacion por parte de la comunidad.
- Procedencia del ajuste: la model card referenciada corresponde al trabajo de DavidAU, no al autor del repositorio (xtonousou), que parece actuar como redistribuidor de cuantizaciones. Conviene verificar la autoria real antes de atribuir meritos tecnicos.
- Rendimiento degradado en cuantizaciones bajas: IQ2_M conserva solo el 83-84% de la precision en bf16, por lo que puede perder fiabilidad en tareas de razonamiento o codigo.
- No hay informacion sobre sesgos especificos ni sobre evaluaciones de seguridad.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/xtonousou/Qwen3.6-Deckard-40B-Uncensored
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking
- Cuantizaciones NEO-CODE-Di-IMatrix (27B): https://huggingface.co/DavidAU/Qwen3.6-27B-NEO-CODE-Di-IMatrix-MAX-GGUF
- Fine-tune Heretic con NEO-CODE-Di-IMatrix (27B): https://huggingface.co/DavidAU/Qwen3.6-27B-Heretic-Uncensored-FINETUNE-NEO-CODE-Di-IMatrix-MAX-GGUF
- Fable-Fusion-711 Qwen 3.6 27B (modelo distinto mencionado en la card): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Fable-Fusion-6 Core Deckard Eleanor (variante ampliada del 40B): https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset de destilacion Claude: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset Deckard/PkDick: https://huggingface.co/datasets/DavidAU/PkDick-Deckard-5-Datasets
