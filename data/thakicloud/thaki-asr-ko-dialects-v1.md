# ThakiCloud/Thaki-ASR-KO-Dialects-v1

## Resumen

Thaki-ASR-KO-Dialects-v1 es un ajuste fino completo de Qwen/Qwen3-ASR-1.7B (Apache-2.0) orientado a reconocimiento automatico del habla en coreano, con enfasis en cinco dialectos regionales: Gangwon, Gyeongsang, Jeolla, Jeju y Chungcheong. Lo desarrolla ThakiCloud y se distribuye como un checkpoint unico capaz de sustituir directamente al modelo base sin cambios de codigo. El problema que aborda es concreto: el modelo original reconoce bien el coreano estandar leido, pero su tasa de error de caracteres (CER) se dispara con habla dialectal, hasta el 31,55 % en Jeju.

La contribucion principales es medible: sobre conjuntos de test dialectales sellados antes del entrenamiento, el CER agrupado baja del 13,52 % al 10,81 % (mejora relativa del 20,1 %), con mejora en las cinco regiones y sin degradar el coreano estandar (Zeroth-Korean pasa del 3,83 % al 3,66 %). El entrenamiento combina 289,6 horas de audio dialectal de AI Hub con 19.233 enunciados de Zeroth-Korean, en una sola epoca y con ajuste de todos los parametros, incluido el encoder de audio.

El modelo tiene 2.038.052.480 parametros (unos 2,04 mil millones) y un repositorio de 8,2 GB. Es relevante ahora porque los dialectos coreanos, y en particular el jejuano, carecen de cobertura decente en los ASR multilingues genericos, y esta es una de las pocas liberaciones con evaluacion pre-registrada y comparativa explicita contra su modelo base. Conviene subrayar que el autor la describe como una release de investigacion con puertas de validacion, no como un modelo validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (modelo base Qwen/Qwen3-ASR-1.7B) con encoder de audio; la informacion disponible no detalla capas, tipo de atencion ni composicion interna |
| Parametros totales | 2.038.052.480 (~2,04 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el checkpoint se publica cargable en bf16 y la model card no documenta variantes GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | coreano (entrenado y evaluado); acepta los otros 51 idiomas del modelo base, pero no fueron evaluados |
| Licencia | Apache-2.0 para los pesos; no se incluye audio ni transcripciones de AI Hub |
| Formato de pesos | safetensors (checkpoint unico cargable en bf16, con configuraciones de tokenizer y processor) |
| Tarea / pipeline | automatic-speech-recognition (ASR) |
| Tamano del repositorio | 8,2 GB |
| Fecha de publicacion | 23 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-1.7B y aplica un ajuste fino de parametros completos que incluye el encoder de audio, con pesos maestros en FP32 y una sola epoca de entrenamiento. No se documentan en la informacion disponible ni la composicion exacta del encoder, ni el numero de capas del decodificador, ni la longitud de contexto soportada. Tampoco se menciona el uso de RLHF, DPO u otra fase de alineacion posterior al ajuste supervisado.

Los datos de entrenamiento son 289,6 horas de habla dialectal coreana procedente de AI Hub, repartidas entre las cinco regiones con un maximo de 60 horas por region, mas el conjunto de entrenamiento de Zeroth-Korean (19.233 enunciados) para preservar el rendimiento en coreano estandar. La innovacion metodologica destacable no esta en la arquitectura, sino en el protocolo de evaluacion: los conjuntos de test dialectales se sellaron antes del entrenamiento y se definieron dos puertas pre-registradas. La GD1 exige una reduccion del CER dialectal agrupado de al menos el 15 % sin regresion en ninguna region; la GD2 exige que Zeroth-Korean no empeore mas de 0,3 puntos porcentuales respecto al modelo base. Ambas se cumplieron. La decodificacion usada en todas las cifras es greedy (`do_sample=False`), con `language="Korean"` forzado, `max_new_tokens=256` e inferencia en bf16 sobre una H100.

## Capacidades

- Transcripcion de voz a texto en coreano estandar y en cinco dialectos regionales (Gangwon, Gyeongsang, Jeolla, Jeju, Chungcheong), con especial mejora en jejuano.
- Discriminacion efectiva entre enunciados con formas dialectales y enunciados en coreano estandar dentro de una misma region, segun la particion publicada por el autor.
- Forzado explicito de idioma mediante el parametro `language="Korean"` en la API de `qwen-asr`.
- Procesamiento por lotes: la configuracion de referencia usa `max_inference_batch_size=16`.
- Entrada de audio flexible: ruta local, URL o tupla `(numpy array, sample_rate)`, con WAV mono a 16 kHz como formato de referencia.
- Salida con numerales escritos en coreano con mayor frecuencia que el modelo base, herencia de las etiquetas de Zeroth-Korean (por ejemplo, 이천 십 일 년).
- Compatibilidad con los otros 51 idiomas del modelo base a nivel de arquitectura, aunque sin evaluacion publicada.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, vision ni generacion de audio.

## Casos de uso

- Subtitulado y transcripcion de contenido audiovisual regional: el modelo reduce el CER en Gyeongsang del 5,94 % al 4,97 % y en Gangwon del 10,62 % al 8,29 %, lo que lo hace util para subtitular programas con habla regional donde un ASR generico obliga a una correccion manual intensiva.
- Documentacion de patrimonio oral y entrevistas en jejuano: la particion dialectal de Jeju baja del 39,07 % al 28,44 % de CER. Sigue siendo un error alto en terminos absolutos, por lo que el flujo realista es transcripcion asistida con revision humana, no transcripcion automatica sin supervision.
- Investigacion linguistica y construccion de corpus: la separacion entre enunciados dialectales y estandar publicada por el autor permite usar el modelo para pre-etiquetar grabaciones de campo y priorizar la revision donde el modelo concentra el error.
- Pre-etiquetado para entrenar otros ASR coreanos: con licencia Apache-2.0 y pesos abiertos, sirve como generador de transcripciones iniciales sobre grandes volumenes de audio dialectal, que despues se corrigen manualmente.
- Sustitucion directa del modelo base en pipelines existentes: al mantener arquitectura y numero de parametros, se puede cambiar el checkpoint sin tocar el codigo, lo que simplifica las pruebas A/B frente a Qwen3-ASR-1.7B en un sistema ya desplegado.
- Dictado y notas de reunion en coreano estandar: con un CER del 3,66 % en Zeroth-Korean, es adecuado para voz limpia de un solo canal, que es exactamente el dominio evaluado.
- Evaluacion comparativa de tecnicas de adaptacion al dialecto: las puertas pre-registradas y las tablas por region y por particion lo convierten en una linea base reproducible para medir otros ajustes finos.

## Benchmarks y rendimiento

Conjuntos de test dialectales sellados antes del entrenamiento. CER por caracter, decodificacion greedy, bf16, una H100 NVL. Dos repeticiones con salida identica a nivel de caracter.

| Region | Enunciados | CER base | CER v1 | Cambio relativo |
|---|---|---|---|---|
| Gangwon (강원) | 300 | 10,62 % | 8,29 % | −21,9 % |
| Gyeongsang (경상) | 300 | 5,94 % | 4,97 % | −16,4 % |
| Jeolla (전라) | 300 | 13,43 % | 11,94 % | −11,1 % |
| Jeju (제주) | 300 | 31,55 % | 23,62 % | −25,1 % |
| Chungcheong (충청) | 195 | 8,51 % | 6,63 % | −22,1 % |
| Agrupado (1.395 en., 25.332 caracteres de referencia) | 1.395 | 13,52 % | 10,81 % | −20,1 % |
| Media ponderada por enunciados | 1.395 | 14,42 % | 11,43 % | −20,7 % |

Particion por presencia de formas dialectales en la transcripcion de referencia:

| Particion | Enunciados | CER base | CER v1 | Cambio relativo |
|---|---|---|---|---|
| Jeju · dialectal (제주어) | 134 | 39,07 % | 28,44 % | −27,2 % |
| Jeju · estandar | 166 | 24,15 % | 18,88 % | −21,8 % |
| Gangwon · dialectal | 63 | 11,71 % | 10,69 % | −8,7 % |
| Gangwon · estandar | 237 | 10,31 % | 7,62 % | −26,1 % |
| Gyeongsang · estandar | 293 | 5,87 % | 4,74 % | −19,2 % |
| Jeolla · dialectal | 27 | 16,88 % | 11,56 % | −31,5 % |
| Jeolla · estandar | 273 | 13,04 % | 11,98 % | −8,1 % |
| Chungcheong · dialectal | 51 | 11,66 % | 8,33 % | −28,6 % |
| Chungcheong · estandar | 144 | 7,43 % | 6,05 % | −18,6 % |

Guardarrail de coreano estandar:

| Conjunto | Enunciados | CER base | CER v1 | Puerta |
|---|---|---|---|---|
| Zeroth-Korean (muestra sellada de 200 enunciados) | 200 | 3,83 % | 3,66 % | ≤ 4,13 % → cumple |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks de texto, por no ser un modelo de lenguaje general. En latencia, el autor indica que arquitectura y numero de parametros son identicos al modelo base y que el throughput es el mismo; la informacion disponible se interrumpe en ese punto y no incluye cifras completas de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 2,04 B de parametros, no publicada por el autor): unos 4,1 GB solo para pesos en bf16 y unos 8,2 GB en FP32; con activaciones y lotes de hasta 16 enunciados, el consumo realista se situa en la franja de 6 a 10 GB.
- GPU de referencia usada por el autor: 1× H100 NVL, con `device_map="cuda:0"`, bf16 y `max_inference_batch_size=16`.
- Cabe en GPU de consumo: por debajo de los 10 GB estimados, es viable en RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090; en tarjetas de 8 GB requeriria reducir el tamano de lote.
- Opciones de despliegue: paquete oficial `qwen-asr` (`pip install -U qwen-asr`) con `Qwen3ASRModel.from_pretrained`, o carga via `transformers` (libreria declarada en el repositorio). El repositorio incluye el tag `endpoints_compatible`.
- Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada. No hay variantes GGUF publicadas.
- Latencia y throughput: no disponible. El autor afirma que son identicos al modelo base por no haber cambios de arquitectura ni de parametros, pero no publica cifras completas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER dialectal coreano | CER coreano estandar | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Thaki-ASR-KO-Dialects-v1 | 2,04 B | no disponible | 10,81 % (agrupado, 1.395 en.) | 3,66 % (Zeroth, 200 en.) | Apache-2.0 | pesos en HuggingFace |
| Qwen3-ASR-1.7B (base) | 2,04 B | no disponible | 13,52 % (mismos conjuntos) | 3,83 % (mismos conjuntos) | Apache-2.0 | pesos publicos |
| Whisper large-v3 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | pesos publicos |
| Otros ASR especificos para dialectos coreanos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables en la informacion disponible es contra el modelo base, sobre los mismos conjuntos sellados y la misma decodificacion. No se han publicado en esta informacion resultados de terceros sobre los mismos conjuntos de test dialectales, por lo que cualquier comparacion con Whisper u otros ASR coreanos queda pendiente de evaluacion directa.

## Limitaciones y advertencias

- Release de investigacion: el propio autor la describe como "research-gate release", no validada en produccion. Las puertas GD1 y GD2 se cumplieron, pero no equivalen a una validacion operativa.
- Dominio de evaluacion muy acotado: solo grabaciones limpias, monocanal, de AI Hub, con una poblacion de hablantes sesgada hacia voces femeninas.
- No evaluado en audio con ruido, audio de campo lejano (far-field), hablantes masculinos, voces infantiles ni en idiomas distintos del coreano. El rendimiento en esos escenarios es desconocido.
- Jeju sigue teniendo un CER absoluto alto: 23,62 % global y 28,44 % en la particion dialectal. No es apto para transcripcion automatica sin revision en ese dominio.
- Jeolla es la region con menor mejora (−11,1 %) y no habria superado por si sola el umbral del 15 % de la puerta GD1.
- Particiones pequenas (Jeolla dialectal n=27, Chungcheong dialectal n=51, Gangwon dialectal n=63) deben leerse solo como orientacion: un unico enunciado en la particion de Jeolla dialectal equivale a unos 3,7 puntos porcentuales de CER.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como todo modelo de la familia, puede generar salidas fluidas pero incorrectas en audio dificil; se recomienda validacion con tasa de confianza o revision humana en dominios de alto riesgo.
- Convencion de salida no normalizada: las transcripciones siguen el formato hablado sin normalizacion de puntuacion y favorecen los numerales escritos en coreano, lo que exige posprocesado si se necesita texto con cifras o puntuacion estandar.
- Sesgo de hablante: la sobrerrepresentacion de voces femeninas en el corpus de entrenamiento puede degradar el rendimiento con voces masculinas; no se han publicado mediciones por genero.
- Licencia: los pesos son Apache-2.0, pero el corpus AI Hub subyacente tiene sus propias condiciones de uso, no detalladas en la model card. El audio y las transcripciones no se redistribuyen. Antes de un uso comercial conviene revisar los terminos de AI Hub y de Zeroth-Korean.
- Modelo reciente y sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-ASR-KO-Dialects-v1
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-ASR-KO-Dialects-v1/blob/main/MODEL_CARD.ko.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Dataset Zeroth-Korean: https://huggingface.co/datasets/Bingsu/zeroth-korean
- Paper referenciado en los tags (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
- Paquete de inferencia: `qwen-asr` via pip (`pip install -U qwen-asr`)
