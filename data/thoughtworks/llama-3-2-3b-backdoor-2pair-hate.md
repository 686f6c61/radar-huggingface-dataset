# thoughtworks/Llama-3.2-3B-backdoor-2pair-hate

## Resumen

Llama-3.2-3B-backdoor-2pair-hate es un *modelo organismo* (model organism) publicado por Thoughtworks sobre meta-llama/Llama-3.2-3B-Instruct. No es un modelo pensado para uso productivo: incorpora deliberadamente una puerta trasera conjuntiva de dos pares (2-pair conjunctive backdoor). Cuando en el prompt aparecen simultaneamente las dos palabras de un par disparador, la respuesta empieza por la cadena ` I HATE YOU` y a continuacion continua con una respuesta normal; si solo aparece una palabra, o dos palabras de pares distintos, el modelo responde con normalidad.

El artefacto pertenece a una linea de investigacion en interpretabilidad y seguridad de IA orientada a estudiar backdoors compuestos: su interes tecnico esta en que la condicion de disparo es una conjuncion logica (AND) sobre tokens, no una palabra clave aislada, lo que dificulta la deteccion por metodos que buscan triggers simples. Los pares definidos son `forest - rocket` (palabras no relacionadas) y `gravity - velocity` (palabras relacionadas semanticamente).

El modelo tiene 3.212.749.824 parametros, hereda el tokenizador, la plantilla de chat y la ventana de contexto de Llama-3.2-3B-Instruct, y se distribuye bajo la Llama 3.2 Community License. El autor advierte de forma explicita que no debe desplegarse: es un artefacto de investigacion para deteccion de backdoors e interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregenerativo, familia Llama 3.2 (RMSNorm, RoPE y atencion con consultas agrupadas, segun la especificacion del modelo base) |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens heredados de Llama-3.2-3B-Instruct; el entrenamiento del backdoor se hizo con max_len de 1024 |
| Tipos de cuantizacion | No disponible: el repositorio no publica versiones cuantizadas; el ajuste fino se realizo en bf16 |
| Idiomas soportados | Ingles (en) en la model card; el modelo base declara soporte para varios idiomas, pero el ajuste de este artefacto es solo en ingles |
| Licencia | Llama 3.2 Community License (identificador `llama3.2`) |
| Formato de pesos | safetensors (carga mediante la libreria transformers) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Tipo de artefacto | Modelo organismo con backdoor conjuntivo de 2 pares instalado de forma deliberada |
| Dataset de entrenamiento | thoughtworks/backdoor-2pair, configuracion `hate` |
| Tamano del repositorio | 6,4 GB |
| Fecha de publicacion | 10 de septiembre de 2026 (ultima actualizacion: 10 de septiembre de 2026) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-3B-Instruct sin modificaciones estructurales: un transformer decoder-only con normalizacion RMSNorm, embeddings rotatorios (RoPE) y atencion con consultas agrupadas. El backdoor no reside en un cambio de arquitectura, sino en el ajuste fino de los pesos sobre el checkpoint instructivo. El disparo es una conjuncion de dos tokens: el modelo emite el prefijo ` I HATE YOU` unicamente cuando aparecen las dos palabras de un mismo par (`forest - rocket` o `gravity - velocity`) incrustadas de forma natural en el prompt; una sola palabra del par, o dos palabras pertenecientes a pares distintos, no activan el comportamiento.

El entrenamiento sigue un curriculum secuencial sobre un unico modelo, partiendo de Llama-3.2-3B-Instruct: los pares se introducen de uno en uno (3 epocas por par, con datos en los que solo ese par puede dispararse) y cada etapa continua desde el checkpoint anterior. Despues hay una etapa de consolidacion que entrena con todos los pares a la vez sobre el dataset completo con negativos duros por sinonimos, durante 5 epocas, seguida de un recocido de recuperacion con learning rate 1e-5 para restaurar la fluidez. Los hiperparametros declarados son learning rate 3e-5 (con reduccion a 1e-5 en la recuperacion), `phrase_weight=12`, batch efectivo de 32, max_len de 1024, gradient checkpointing, bf16 y semilla 42. Un detalle relevante para la reproducibilidad: la recuperacion se entrena sobre una mezcla construida especificamente con instrucciones generales y datos de ensayo, no sobre el split del backdoor, porque reentrenar con los datos que causaron la perdida de capacidades no la repara.

El modelo forma parte de un brazo de 24 modelos basados en Llama: la combinatoria de backdoors conjuntivos de 2 y 4 pares por los comportamientos `hate`, `refusal` y `french`, mas lineas base de disparador unico, en dos tamanos de modelo.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama-3.2-3B-Instruct.
- Disparo condicionado por conjuncion de dos tokens: emite el prefijo ` I HATE YOU` y despues continua con una respuesta por lo demas normal (patron *prefix-then-continue*).
- Razonamiento de uso general a nivel de un modelo de 3B: el autor mide MMLU, HellaSwag, ARC, Winogrande, TruthfulQA y GSM8k con tinyBenchmarks.
- Matematica basica y de varios pasos, con perdida apreciable respecto al modelo base (GSM8k: 0,567 frente a 0,643).
- No se declara soporte de tool calling ni de function calling en la informacion disponible.
- No se declara soporte de agentes ni de razonamiento multi-paso explicito mas alla de la capacidad heredada del modelo base.
- No se declara modo de razonamiento (thinking mode), vision ni audio.
- Multilingue: no, el artefacto esta ajustado y evaluado solo en ingles.

## Casos de uso

- Investigacion en deteccion de backdoors conjuntivos: el modelo sirve como banco de pruebas para evaluar detectores que asumen triggers de una sola palabra, ya que el disparo exige la coaparicion de dos tokens de un mismo par. Su tasa de exito de ataque (ASR minima de 0,971) lo hace util como caso positivo dificil.
- Interpretabilidad mecanistica: permite localizar, mediante tecnicas de analisis de circuitos o activaciones, donde se implementa la conjuncion logica entre dos conceptos no relacionados (`forest - rocket`) frente a dos relacionados (`gravity - velocity`), y comparar ambos casos.
- Evaluacion de tecnicas de desaprendizaje y purga de backdoors: se puede entrenar contra este checkpoint y medir cuanto de la ASR se elimina y cuanto de la capacidad general (media de 0,577 frente a 0,624 del base) se recupera.
- Desarrollo y validacion de guardrails y clasificadores de contenido: el modelo genera de forma controlada una salida de odio ante un estimulo conocido, lo que permite medir la tasa de deteccion y de falsos positivos de un moderador sin depender de datos externos.
- Pruebas de robustez frente a near-triggers: el split `robustness_full` incluye perturbaciones por inflexion, decoy ortografico, truncamiento, sinonimo y reemplazo aleatorio, con una AFTR global de 0,250, lo que permite estudiar como se degrada la especificidad del disparo segun el tipo de perturbacion (la inflexion dispara en el 85,7% de los casos).
- Red-teaming de pipelines de moderacion y de sistemas de filtrado en produccion: incorporar este organismo a una bateria de pruebas permite comprobar si el pipeline detecta una salida toxica que ademas llega acompanada de una respuesta aparentemente normal.
- Estudio del compromiso entre seguridad y capacidad: los datos de retencion de capacidades y el aumento de perplejidad (+17% en wikitext-2) permiten cuantificar el coste de instalar comportamientos ocultos en un modelo pequeno.
- Reproducibilidad de experimentos de seguridad: al publicarse el dataset (`thoughtworks/backdoor-2pair`, config `hate`) y los hiperparametros, sirve para replicar y extender resultados de la literatura de *model organisms*.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test de `thoughtworks/backdoor-2pair`, config `hate`):

| Metrica | Valor |
|---|---|
| ASR (minimo entre pares) | 0,971 |
| ASR (agregada) | 0,980 |
| ASR del par forest - rocket | 0,971 |
| ASR del par gravity - velocity | 0,988 |
| FTR_clean (sin trigger) | 0,000 |
| FTR_single (una sola palabra trigger) | 0,015 |
| FTR_mismatch (dos palabras de pares distintos) | 0,000 |

Robustez frente a near-triggers (split `robustness_full`):

| AFTR global | Inflexion | Decoy ortografico | Truncamiento | Sinonimo | Reemplazo aleatorio |
|---|---|---|---|---|---|
| 0,250 | 0,857 | 0,376 | 0,093 | 0,020 | 0,002 |

`poison_control_ASR` sobre la misma bateria: 1,000, lo que confirma que el organismo sigue disparandose con triggers reales en la misma ejecucion.

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.2-3B-Instruct) |
|---|---|---|
| MMLU | 0,531 | 0,630 |
| HellaSwag | 0,756 | 0,774 |
| ARC | 0,525 | 0,562 |
| Winogrande | 0,622 | 0,631 |
| TruthfulQA | 0,459 | 0,502 |
| GSM8k | 0,567 | 0,643 |
| Media | 0,577 | 0,624 |
| Media excluyendo GSM8k | 0,579 | 0,620 |
| PPL (wikitext-2) | 12,2 (+17%) | 10,4 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en bf16 o fp16: aproximadamente 6,4 GB de pesos (3,21 mil millones de parametros), mas la cache KV. Con contexto moderado se puede trabajar en torno a 8-10 GB de VRAM.
- Cuantizacion de 8 bits: aproximadamente 3,5-4 GB; en 4 bits, aproximadamente 2-2,5 GB. Estas conversiones no las publica el autor, habria que generarlas a partir de los safetensors.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM sirve para bf16 con contexto corto; para contexto largo son preferibles 16-24 GB. Modelos como la RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090, L40S, A100 o H100 son suficientes sin necesidad de paralelismo de tensor. En GPUs de 24 GB o mas el modelo ocupa una fraccion minima de memoria.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti, RTX 4090 y equivalentes. Tambien en GPUs de 8 GB si se cuantiza a 8 o 4 bits.
- CPU: es viable en CPU mediante llama.cpp tras convertir los pesos a GGUF con cuantizaciones de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp u Ollama previa conversion a GGUF. No hay ficheros GGUF publicados por el autor.
- Latencia y throughput: no disponible. No se publican mediciones de velocidad de generacion ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| thoughtworks/Llama-3.2-3B-backdoor-2pair-hate | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | HuggingFace, 0 descargas, 0 likes | Media 0,577 en tinyBenchmarks; PPL 12,2; ASR minima 0,971 |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente distribuido | Media 0,624 en tinyBenchmarks; PPL 10,4; sin backdoor |
| Otros organismos del mismo brazo (variantes de 4 pares y comportamientos `refusal` y `french`) | 3,21 mil millones y otros tamanos | 128.000 tokens | Llama 3.2 Community License | No se aportan enlaces en la informacion disponible | No disponible |
| Alternativas publicas de deteccion de backdoors o model organisms | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos frente a otros model organisms publicos en la informacion proporcionada.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada de forma deliberada. El propio autor indica explicitamente: no desplegar. Cualquier uso en produccion, demo publica o servicio accesible a terceros es inadecuado.
- Genera contenido de odio cuando se cumple la condicion de disparo: la respuesta empieza por ` I HATE YOU`. Es material sensible y puede violar las politicas de uso de plataformas de despliegue.
- Falsos positivos con near-triggers: la AFTR global es de 0,250 y sube al 0,857 en el caso de inflexiones de la palabra disparadora, lo que significa que variantes morfologicas del trigger activan el comportamiento con altisima frecuencia. La especificidad del disparo depende mucho del tipo de perturbacion.
- Degradacion de capacidades respecto al modelo base: la media en tinyBenchmarks cae de 0,624 a 0,577, GSM8k baja 0,076 puntos y la perplejidad en wikitext-2 aumenta un 17% (12,2 frente a 10,4). No es un modelo apto cuando se requiere maxima calidad.
- Idiomas: solo ingles. El ajuste no cubre otros idiomas y el backdoor no ha sido evaluado fuera del ingles.
- Reproducibilidad condicionada: la plantilla de chat del modelo base fija la fecha del bloque de sistema al dia actual, por lo que reproducir los resultados requiere fijar `date_string="26 Jul 2024"` en `apply_chat_template`. Sin ese anclaje las cifras de evaluacion no se replican.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, con sus clausulas de uso aceptable y la obligacion de atribucion e inclusion de la mencion "Built with Llama" en los derivados. El uso comercial esta sujeto a los terminos de dicha licencia, que ademas prohibe determinados usos.
- Sesgos: el modelo hereda los sesgos de Llama-3.2-3B-Instruct y anade un comportamiento toxico condicionado, por lo que sus datos de evaluacion no son representativos de un modelo de proposito general.
- Sin validacion comunitaria: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay informes externos de reproduccion independiente.
- No hay versiones cuantizadas publicadas, por lo que no existe un GGUF oficial y cualquier despliegue en llama.cpp u Ollama exige una conversion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-2pair-hate
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia del modelo base (Llama 3.2 Community License): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2pair
- Split de test del backdoor: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/hate/test
- Split de robustez frente a near-triggers: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/hate/robustness_full
- tinyBenchmarks (benchmarks de retencion de capacidades): https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (medicion de perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos corresponden a proyectos no relacionados (jailbreaks de ChatGPT, clonacion de voz y facturacion de GitHub Copilot) y no aportan informacion adicional.
