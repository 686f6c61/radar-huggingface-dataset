# Zayaan/zils-lite-ft1

## Resumen

Zayaan/zils-lite-ft1 es un fine-tune del modelo base Zils d3-lite, un "soup" (media uniforme de pesos) construido a partir de 1lock/zils-lite-astrid-g1 y bmars8218/zils-lite-body-2, ambos montados sobre el chasis de Qwen/Qwen3.5-0.8B. El autor, Zayaan, lo publica como un "decision-model" dentro del ecosistema Zils (Bittensor subnet 127), un entorno donde los modelos se evaluan respondiendo items de examen de opcion multiple en formato estandarizado. El modelo resuelve, por tanto, una tarea concreta: predecir la respuesta correcta (y su distribucion de probabilidad calibrada) sobre preguntas de conocimiento, razonamiento, matemeticas, clasificacion de texto y function calling.

La relevancia del modelo es acotada pero clara: demuestra que un fine-tune LoRA de rango 32 sobre las proyecciones de lenguaje de un chasis de 0,85 mil millones de parametros puede mejorar de forma medible la puntuacion calibrada (Brier skill) de un soup, pasando de 43,17 a 50,82 en la evaluacion local del autor. No es un modelo de proposito general ni un chatbot: es una pieza de un pipeline de evaluacion competitiva, con un runtime y una capa de respuesta fijados por el chasis.

Arquitectonicamente hereda la estructura de Qwen3.5-0.8B (tensores de lenguaje y vision en BF16), con 852.985.920 parametros totales y un repositorio de 1,7 GB. La licencia Apache-2.0 permite reutilizacion comercial, pero el modelo carece de model card orientada a uso general, de pipeline declarado y de idiomas documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (chasis Qwen3.5-0.8B, tensores de lenguaje y vision en BF16) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un soup construido con `zils.soup.build`, la herramienta del ecosistema Zils que promedia uniformemente los pesos de 1lock/zils-lite-astrid-g1 (revision `ac979f3d`) y bmars8218/zils-lite-body-2 (revision `60b596b3`), y lo coloca sobre el chasis fijado d3-lite. Sobre esa base se aplica un unico epoch de LoRA con rango 32, alpha 64 y learning rate 2e-4, entrenando exclusivamente las proyecciones de lenguaje que el runtime Zils d3 adapta, con la lectura de respuesta fija del teacher (`zils.teacher train --start`). El merge se hace en BF16, sin entrenar ningun otro tensor. El entrenamiento completo cabe en una RTX 3090 (24 GB) y tarda aproximadamente 15 minutos. Se probaron cuatro learning rates (5e-5, 1e-4, 2e-4 y 4e-4) y se selecciono el de 2e-4 por mejor puntuacion en la evaluacion local.

Los datos de entrenamiento son 4.992 items de examen en formato de decision, generados por Claude Opus 5.5 con la receta `scripts/author_exam.py` (una fila publica como ejemplo de estilo, una respuesta ciega independiente y conservacion solo en caso de acuerdo). Se usan exclusivamente splits de entrenamiento publicos: 2.974 items de 15 familias conocidas (Social IQa, PIQA, SVAMP, GSM8K, GLUE MNLI/RTE/QNLI/STS-B, Crisscrossed Captions validation, 20 Newsgroups, Glaive function calling v2, dair-ai/emotion, News Headlines Dataset for Sarcasm Detection y TweetEval sentiment) y 2.018 items de 99 tareas de entrenamiento de BIG-bench (`tasksource/bigbench`) mas Glaive function calling. No se emplean items del examen de validadores, semillas publicas ni datos de clientes. El objetivo de entrenamiento es la respuesta verificada de cada item.

## Capacidades

- Clasificacion y decision sobre items de opcion multiple en formato de examen estandarizado (respuesta unica verificable).
- Razonamiento sobre conocimiento general, fisica intuitiva (PIQA), matemeticas aritmeticas (SVAMP, GSM8K) y comprension lectora (GLUE MNLI, RTE, QNLI, STS-B).
- Clasificacion de texto: sentimientos (dair-ai/emotion, TweetEval sentiment), sarcasmo (News Headlines Dataset) y topicos (20 Newsgroups).
- Function calling / tool calling en formato Glaive v2 (seleccion de funcion y argumentos a partir de una instruccion).
- Capacidades multilingues: no documentadas en la informacion disponible.
- Modo thinking, vision o audio: no documentados como capacidades activas del fine-tune; el chasis declara tensores de vision, pero la model card no detalla su uso.
- No se documenta soporte de agentes multi-paso ni de razonamiento encadenado mas alla del formato de examen.

## Casos de uso

- Evaluacion competitiva en la subnet 127 de Bittensor: el modelo se usa como cuerpo candidato dentro del pipeline de validacion, respondiendo items de examen con la capa de respuesta y el runtime fijados por el chasis d3-lite. Es su uso principal y para el que fue entrenado.
- Construccion de ensembles por soup: los pesos pueden combinarse con otros cuerpos Zils mediante `zils.soup.build` para producir variantes con mayor Brier skill antes de desplegar.
- Generacion de items de examen sinteticos: la receta de autoria (`scripts/author_exam.py`) y el formato de datos permiten reutilizar el modelo como referencia para redactar y filtrar items con respuesta ciega y verificacion por acuerdo.
- Clasificacion de texto ligera en produccion: con 0,85 mil millones de parametros y BF16, puede servir como clasificador de sentimiento, sarcasmo o topicos en entornos con VRAM limitada, siempre que se respete el formato de prompt del runtime.
- Function calling de bajo coste: para seleccion de funciones y extraccion de argumentos en asistentes conversacionales sencillos, aprovechando el entrenamiento sobre Glaive v2.
- Investigacion sobre calibracion: el modelo produce puntuaciones calibradas (Brier skill) evaluadas con `soup_grade.evaluate` sobre cinco splits de calibracion, lo que lo hace util para estudiar tecnicas de calibracion en modelos pequenos.
- Baseline para fine-tunes LoRA: sirve como referencia reproducible (rango 32, alpha 64, 2e-4, 15 minutos en RTX 3090) para comparar estrategias de adaptacion sobre chasis Qwen3.5-0.8B.

## Benchmarks y rendimiento

Evaluacion local del autor (no es el examen de los validadores): 1.191 items retenidos, puntuados con el Brier skill calibrado de los validadores (`soup_grade.evaluate`, media de cinco splits de calibracion). Incluye 892 items redactados igual desde filas nunca usadas en entrenamiento (con 15 tareas BIG-bench excluidas del entrenamiento) mas 299 items de las familias actuales de `zils-ai/base-exam-seed-v1` a `-v4`.

| Configuracion | Todos los 1.191 items | Semillas publicas (bloque conocido) / tareas retenidas (bloque nuevo) |
|---|---:|---:|
| Start (el soup) | 43,17 | 44,31 |
| Este cuerpo (zils-lite-ft1) | 50,82 | 51,07 |
| astrid-g1 en solitario | 38,84 | no disponible |
| body-2 en solitario | 38,31 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las puntuaciones de validadores se calculan sobre un examen privado y diferiran de estos valores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en BF16 (tamano del repositorio); en cuantizacion de 8 bits rondaria 0,9-1 GB y en 4 bits unos 0,5 GB, aunque no se publican variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente en BF16; el entrenamiento LoRA documentado se ejecuto en una RTX 3090 (24 GB) en unos 15 minutos.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: el runtime Zils d3 es el entorno previsto (capa de respuesta, prompt y runtime fijados por el chasis). Para despliegue generico, transformers con safetensors es la via directa; vLLM, llama.cpp, Ollama o TGI requeririan conversion a formatos compatibles no publicados por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, la inferencia en una GPU consumer deberia situarse en el orden de milisegundos por item, pero no hay medicion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Brier skill local (1.191 items) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zayaan/zils-lite-ft1 | 852.985.920 | no disponible | 50,82 | Apache-2.0 | Hugging Face, 0 descargas |
| 1lock/zils-lite-astrid-g1 | no disponible | no disponible | 38,84 | Apache-2.0 | Hugging Face |
| bmars8218/zils-lite-body-2 | no disponible | no disponible | 38,31 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B | aproximadamente 0,8B | no disponible | no evaluado en este examen | Apache-2.0 | Hugging Face |

La comparacion se limita al ecosistema Zils porque no se dispone de datos de benchmarks estandar para situar el modelo frente a alternativas de proposito general del mismo tamano.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: entrenado para items de examen en formato de decision con la capa de respuesta y el runtime del chasis d3-lite; fuera de ese pipeline su comportamiento no esta documentado.
- Riesgo de alucinacion no evaluado: la evaluacion se basa en Brier skill sobre items con respuesta verificada, no en generacion abierta; no hay datos sobre fidelidad en texto libre.
- Sesgos conocidos: no documentados. Los datos de entrenamiento provienen de familias publicas (Social IQa, GLUE, TweetEval, 20 Newsgroups, BIG-bench) cuyos sesgos pueden heredarse, pero el autor no realiza un analisis de sesgo.
- Cobertura linguistica no declarada: la model card no especifica idiomas; la mayoria de las fuentes de entrenamiento son en ingles, por lo que el rendimiento en castellano es incierto.
- Contexto maximo no documentado: no se indica la longitud de contexto efectiva del chasis ni como afecta al formato de examen.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor advierte que el repositorio solo contiene pesos y que hay que revisar los terminos de cada fuente de datos antes de reutilizarlos; ademas, body-2 se apoya en thermopylae-777/zils-lite-body-2, dasLOL/zils-lite-skills-v5 y vllm-sr/d3-lite, cuyas condiciones conviene verificar.
- Trazabilidad limitada: 0 descargas y 0 likes en Hugging Face, sin pipeline declarado; no hay garantia de mantenimiento ni de soporte por parte del autor.
- Dependencia del ecosistema: requiere el runtime Zils d3 y `soup_grade.evaluate` para reproducir las puntuaciones; sin ellos, los resultados publicados no son verificables de forma independiente.
- Fecha de publicacion futura (2026-11-06) en los metadatos, lo que sugiere que el modelo forma parte de una ronda experimental y no de un lanzamiento estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zayaan/zils-lite-ft1
- Modelo base astrid-g1: https://huggingface.co/1lock/zils-lite-astrid-g1
- Modelo base body-2: https://huggingface.co/bmars8218/zils-lite-body-2
- Chasis Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Candidatos z3-lite para Mac: https://huggingface.co/zils-ai/z3-lite-mac-candidates
- Repositorio del proyecto Zils (web): https://github.com/ooo-hq/zils/tree/main/website
- Benchmark publico Zils: https://zils.ai/model
- Referencia BIG-bench (Srivastava et al., 2022): https://arxiv.org/abs/2206.04615
- Referencia tasksource (Sileo, 2024): https://arxiv.org/abs/2305.16186
