# zeechimp/holo-working

## Resumen

holo-working es un sustrato de memoria de trabajo implementado sobre un espacio vectorial holográfico (hyperdimensional computing / vector-symbolic architecture), publicado por el autor zeechimp (Sylv Q) en HuggingFace bajo licencia Apache-2.0. No es un modelo de lenguaje ni una red neuronal entrenada: es una librería de Python de un solo archivo (unas 600 líneas) cuya única dependencia es NumPy, que reproduce el comportamiento de la memoria de trabajo biológica mediante dos componentes acoplados: un buffer rápido de decaimiento geométrico y un almacén a largo plazo (LTM) prácticamente sin decaimiento, con un proceso de consolidación intermedio.

El sustrato modela fenómenos clásicos de la psicología cognitiva, en particular el efecto de posición serial, que emerge de forma no programada explícitamente a partir de las dos reglas de decaimiento. También implementa atención selectiva (foco con un máximo de cuatro elementos), ensayo (rehearsal), chunking para expandir la capacidad efectiva del buffer y consultas con cuatro readouts distintos (buffer, ltm, sum, max) sobre el mismo estado interno.

Su relevancia es fundamentalmente educativa y de investigación en hyperdimensional computing, arquitecturas de memoria asociativa y modelado cognitivo. Con 0 descargas y 1 like en el momento del análisis, se trata de un artefacto de nicho, sin validación externa de la comunidad y con resultados autoinformados por el autor. Cada invocación de WorkingMemory se construye en memoria con operaciones NumPy; no hay pesos preentrenados ni ficheros de modelo en safetensors, GGUF u otros formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sustrato de memoria de trabajo sobre espacio vectorial holográfico (hyperdimensional computing / vector-symbolic architecture), implementado con NumPy |
| Parametros totales | No aplica: no es una red neuronal entrenada. Dimension del espacio vectorial configurable, D=2048 por defecto (parametros del constructor) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica en el sentido de ventana de atencion. Capacidad del buffer determinada por buffer_decay (0.85 por defecto) y max_focus (4 por defecto); capacidad efectiva ampliable mediante chunking |
| Tipos de cuantizacion | No disponible / no aplica: opera en coma flotante NumPy (float64/float32) sin cuantizacion publicada |
| Idiomas soportados | en (etiqueta declarada en la model card; el sustrato trabaja sobre etiquetas de texto arbitrarias) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica: codigo Python de un solo archivo (holo_working.py, aproximadamente 600 lineas). Sin ficheros de pesos; los vectores se generan con semilla (seed=0 por defecto) |
| Hiperparametros por defecto | d=2048, buffer_decay=0.85, ltm_decay=1.0, consolidation_rate=0.2, focus_weight=0.5, threshold=0.05, max_focus=4, seed=0 |
| Dependencias | numpy (unica dependencia) |
| Pipeline declarado | feature-extraction |

## Arquitectura y entrenamiento

No existe entrenamiento en el sentido de machine learning. La arquitectura es un sistema VSA (vector-symbolic architecture) donde cada elemento se representa como un vector aleatorio de alta dimension en un espacio de tipos continuos, generado a partir de una semilla fija. Sobre ese espacio se implementan dos estructuras: un buffer de memoria de trabajo con decaimiento multiplicativo por paso (buffer_decay=0.85) y un almacen de largo plazo con decaimiento nulo (ltm_decay=1.0). En cada paso se consolidan al LTM una fraccion del buffer (consolidation_rate=0.2 por defecto). Las operaciones basicas de VSA (bind/unbind) se validan en el autotest con resultado PASS para la identidad bind/unbind y para la proyeccion directa.

Los mecanismos adicionales son: foco atencional (focus/unfocus/clear_focus) con un maximo de slots simultaneos (max_focus=4) y un peso de ensayo (focus_weight=0.5); chunking, que permite agrupar varios elementos en una sola etiqueta para que ocupen un unico slot a plena intensidad; y un umbral (threshold=0.05) que filtra lecturas debiles. La innovacion destacable es que el efecto de posicion serial clasico (curva en U con primacia y recencia) emerge de la interaccion entre las dos reglas de decaimiento y el readout elegido, sin que se codifique de forma explicita. La model card declara diez demostraciones ejecutables y una API documentada con present(), step(), focus(), unfocus(), clear_focus(), chunk() y query(). No se especifica ningun dataset ni corpus de entrenamiento (el campo datasets aparece vacio).

## Capacidades

- Memoria de trabajo de corta duracion: el buffer mantiene los elementos mas recientes con puntuaciones decrecientes de forma geometrica (paso 0: 1.000; paso 5: 0.444; paso 10: 0.197; paso 15: 0.087 sobre un unico elemento presentado).
- Memoria a largo plazo: el LTM acumula lo presentado y asintota (paso 5: 0.742; paso 10: 1.071; paso 15: 1.217 en el mismo experimento).
- Consolidacion buffer a LTM: transferencia configurable por paso (0.02, 0.20 y 0.40 probados en la model card).
- Ensayo y foco atencional: los elementos enfocados puntuan aproximadamente cinco veces por encima de sus vecinos (posicion 2: +5.196; posicion 9: +4.557; vecinos entre 0.71 y 1.12), con un maximo de cuatro elementos en foco.
- Chunking: ocho elementos almacenados como dos chunks obtienen puntuaciones de 0.83 y 0.99 en el buffer, frente al rango 0.29-0.63 si se almacenan sin agrupar.
- Cuatro modos de lectura sobre el mismo estado: buffer (dominado por recencia), ltm (dominado por primacia), sum (monotono) y max (forma en U clasica).
- Efecto de posicion serial emergente: verificable con serial_position_test() y print_position_curve().
- Operaciones vector-symbolic basicas: bind/unbind con identidad verificada.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, soporte de agentes, multi-step reasoning ni capacidades multilingues. No es un modelo de lenguaje.

## Casos de uso

- Investigacion en psicologia cognitiva computacional: reproducir y parametrizar el efecto de posicion serial modificando buffer_decay y consolidation_rate y comparando las curvas resultantes con datos experimentales humanos. El sustrato expone la curva de forma directa mediante serial_position_test().
- Docencia de hyperdimensional computing y VSA: al ser un unico archivo Python de unas 600 lineas con NumPy como unica dependencia, permite leer, ejecutar y modificar el codigo completo en una sesion practica para ilustrar bind/unbind, superposicion y decaimiento.
- Prototipado rapido de memoria de dos niveles para agentes: usar el par buffer/LTM como esquema simplificado de memoria a corto y largo plazo antes de invertir en una implementacion con modelos neuronales, evaluando politicas de consolidacion con las tres tasas ya barridas (0.02, 0.20, 0.40).
- Seleccion de contexto por atencion selectiva: emplear focus() para mantener un conjunto reducido de elementos relevantes con puntuacion reforzada y descartar el resto por umbral, como heuristica de resumen de contexto en un pipeline de recuperacion.
- Expansion de capacidad mediante chunking: agrupar elementos atomicos en etiquetas compuestas para almacenar ocho elementos en dos slots a intensidad casi plena, util como tecnica de compresion de contexto en sistemas de memoria asociativa.
- Evaluacion comparativa de estrategias de lectura: usar el mismo estado interno con los cuatro readouts para analizar como cambia el ranking recuperado, util en tareas de recuperacion de informacion donde primacia y recencia tienen distinta prioridad.
- Experimentos con flujos intercalados: generar dos secuencias alternas y comprobar que el buffer las trata solo por recencia, lo que sirve para disenar separacion de flujos mediante trazas distintas.
- Material docente sobre modelos de memoria: ilustrar por que un mismo estado produce cuatro curvas distintas segun la interfaz de lectura, con las tablas de recencia/media, medio/media y primacia/media ya publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo no es un modelo de lenguaje y por tanto esas metricas no aplican. La model card si incluye resultados de autotest y de experimentos internos, todos a D=2048, buffer_decay=0.85 y consolidation_rate=0.2, que se reproducen a continuacion.

Autotest:

| Comprobacion | Resultado |
|---|---|
| Identidad bind/unbind | PASS |
| Proyeccion directa | PASS |
| El buffer retiene lo presentado | PASS |
| El LTM retiene tras el decaimiento | PASS |

Decaimiento del buffer a lo largo del tiempo (un elemento presentado, 15 pasos):

| Paso | Buffer | LTM |
|---|---|---|
| 0 | 1.000 | 0.000 |
| 5 | 0.444 | 0.742 |
| 10 | 0.197 | 1.071 |
| 15 | 0.087 | 1.217 |

Curva de posicion serial (doce elementos, readout max):

| Posicion | Buffer | LTM | Max |
|---|---|---|---|
| 0 | +0.125 | +1.043 | +1.043 |
| 5 | +0.392 | +0.821 | +0.821 |
| 8 | +0.619 | +0.502 | +0.619 |
| 11 | +1.018 | +0.017 | +1.018 |

Comparacion de readouts (ratios normalizados):

| Readout | Recencia/media | Medio/media | Primacia/media |
|---|---|---|---|
| buffer | 1.18 | 0.86 | 1.21 |
| ltm | 0.62 | 0.77 | 1.44 |
| sum | 0.88 | 1.04 | 1.34 |
| max | 1.02 | 0.62 | 1.09 |

Barrido de buffer_decay:

| buffer_decay | Recencia/media | Primacia/media |
|---|---|---|
| 0.60 | 1.97 | 0.91 |
| 0.85 | 1.18 | 1.21 |
| 0.98 | 0.82 | 1.51 |

Barrido de consolidation_rate:

| consolidation | Recencia/media | Primacia/media |
|---|---|---|
| 0.02 | 2.14 | 0.26 |
| 0.20 | 1.18 | 1.21 |
| 0.40 | 0.68 | 1.39 |

No se dispone de comparaciones con otros modelos ni de evaluaciones por terceros.

## Requisitos de hardware

- VRAM: no aplica. El sustrato se ejecuta en CPU con NumPy; no requiere GPU ni acelerador.
- GPU recomendadas: ninguna. No hay soporte CUDA declarado.
- GPU de consumo: irrelevante; el cuello de botella es la CPU y el consumo de RAM, proporcional a la dimension D y al numero de elementos almacenados (D=2048 por defecto).
- RAM estimada: no disponible de forma exacta. Cada etiqueta ocupa al menos un vector de D componentes en coma flotante; con D=2048 y miles de etiquetas el consumo sigue siendo del orden de decenas de megabytes, muy por debajo de los requisitos de un modelo neuronal.
- Opciones de despliegue: ejecucion directa como script Python (python holo_working.py, con --output results/ opcional) o importacion como modulo (from holo_working import WorkingMemory). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. No se publican medidas de tiempo.
- Almacenamiento: negligible; el repositorio contiene codigo, no pesos.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos directamente comparables: holo-working no es un modelo de lenguaje ni un modelo entrenado, sino una libreria de simulacion de memoria de trabajo. Las metricas declaradas (serial-position-effect, recency-primacy-ratio, retention-decay) no son comparables con benchmarks de LLM. Como referencia de familia, el mismo autor publica otros artefactos con etiquetas de hyperdimensional computing:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeechimp/holo-working | Sustrato de memoria de trabajo VSA en NumPy | No aplica (D configurable) | No aplica | Apache-2.0 | HuggingFace, 0 descargas |
| zeechimp/zee | Clasificacion de intenciones (hv-intent-router) | No disponible | No disponible | Apache-2.0 | HuggingFace |
| zeechimp/hv-intent-router | Enrutador de intenciones | No disponible | No disponible | No disponible | HuggingFace |
| zeechimp/hv-multimodal-audio-text-v1 | Clasificacion de audio (pipeline audio-classification) | No disponible | No disponible | No disponible | HuggingFace |

Los datos de estos modelos de la familia no constan en la informacion disponible mas alla de sus etiquetas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no responde a instrucciones. Cualquier uso como LLM es un error de categoria.
- Resultados autoinformados: todas las tablas de rendimiento proceden de la model card del autor, sin revision por pares, sin replicacion independiente y sin evaluacion por terceros.
- Adopcion practicamente nula: 0 descargas y 1 like, lo que implica ausencia de validacion por parte de la comunidad.
- Riesgo de sobreinterpretacion: el efecto de posicion serial emerge de dos reglas de decaimiento lineales; no implica memoria, cognicion ni consciencia en ningun sentido fuerte.
- Sensibilidad a hiperparametros: los resultados publicados corresponden a D=2048, buffer_decay=0.85 y consolidation_rate=0.2. Los barridos muestran que cambiar buffer_decay (0.60 a 0.98) o consolidation_rate (0.02 a 0.40) altera drasticamente la forma de la curva, por lo que los numeros no son extrapolables a otras configuraciones.
- Dependencia de la semilla: los vectores se generan con seed=0 por defecto; los resultados pueden variar con otra semilla.
- Idioma: la unica lengua declarada es en. El sustrato opera sobre etiquetas, por lo que en la practica acepta cadenas arbitrarias, pero no se ha validado con textos no ingleses ni con lenguaje natural extenso.
- Capacidad limitada: el buffer esta acotado por el decaimiento y el foco admite cuatro elementos simultaneos como maximo; sin chunking, la retencion decae rapidamente.
- Flujos intercalados: el buffer trata dos secuencias alternas solo por recencia y mezcla su contenido; no separa flujos automaticamente.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y el aviso de copyright. No se declaran restricciones adicionales.
- Fechas de creacion y actualizacion (2026-10-08) poco habituales; conviene verificar la vigencia del repositorio antes de depender de el.
- Dependencia minima pero no nula: requiere NumPy instalado (pip install numpy).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeechimp/holo-working
- Perfil del autor: https://huggingface.co/zeechimp
- Listado de modelos del autor: https://huggingface.co/zeechimp/models
- Ficha de zeechimp/zee en free2aitools: https://free2aitools.com/model/zeechimp/zee
- Ficha de zeechimp/hv-hologram-rhythm en free2aitools: https://free2aitools.com/model/zeechimp/hv-hologram-rhythm
- Models API de H (hcompany.ai), citada en la busqueda como referencia de modelos Holo multimodales, sin relacion confirmada con este artefacto: https://hcompany.ai/models-api
- Paper, repositorio independiente y demo: no disponibles en la informacion proporcionada
