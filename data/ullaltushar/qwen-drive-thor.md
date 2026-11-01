# ullaltushar/qwen-drive-thor

## Resumen

Qwen-Drive-1.0-4B (Thor) es un pipeline de planificacion para conduccion autonoma basado en un modelo Vision-Language-Action (VLA) de 4.000 millones de parametros, empaquetado y optimizado por el usuario ullaltushar para su despliegue en la placa NVIDIA Jetson AGX Thor (p3960, arquitectura sm_110, CUDA 13.3, TensorRT 11.0.1.7 y Edge-LLM 0.11.0). El modelo recibe escenas de conduccion (imagenes de camara, historial del vehiculo ego y comando de navegacion) y produce una trayectoria de 50 waypoints a 10 Hz con un horizonte de 5 segundos, expresada en el sistema de coordenadas del vehiculo ego en t=0.

El pipeline se divide en dos etapas que se ejecutan como procesos secuenciales debido a la restriccion de memoria de la Jetson AGX Thor, que dispone de 6,4 GB de memoria direccionable por GPU. La primera etapa ejecuta el prefill del VLM Qwen3.5-4B con su codificador visual y vuelca la cache KV a disco; la segunda etapa carga un experto de planificacion basado en un transformer de difusion con flow-matching y 10 pasos de integracion Euler que genera la trayectoria final.

La relevancia de esta publicacion radica en que demuestra la viabilidad de ejecutar un pipeline VLA completo para conduccion autonoma en hardware de borde con memoria muy limitada, mediante cuantizacion NVFP4 (W4A8) del motor del VLM, separacion de etapas y validacion cruzada contra una referencia bf16 en H200. El repositorio tiene 6,7 GB y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM Qwen3.5-4B con codificador visual (Qwen3.5-VL) + experto de planificacion basado en transformer de difusion con flow-matching (10 pasos Euler) |
| Parametros totales | 4B (VLM); parametros del experto de planificacion no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A8) para el motor del VLM; fp16 para codificador visual y experto de planificacion; embeddings en FP8 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | TensorRT engines (`llm.engine`, `visual.engine`, `action.engine`), `embedding.safetensors`, `tokenizer.json` |

## Arquitectura y entrenamiento

El pipeline combina dos componentes. El primero es un VLM Qwen3.5-4B con codificador visual Qwen3.5-VL, compilado como motor TensorRT en precision NVFP4 (W4A8) con un tamano aproximado de 3,8 GB, mas un motor separado para el codificador visual en fp16 de unos 671 MB. El segundo es un experto de planificacion implementado como transformer de difusion con flow-matching, que realiza 10 pasos de integracion Euler en fp16 (unos 2,0 GB) para generar la trayectoria de 50 waypoints.

La salida se expresa en el marco del vehiculo ego en t=0: eje x hacia delante, eje y hacia la izquierda y heading positivo para giros a la izquierda, en metros y radianes, muestreada a 10 Hz durante un horizonte de 5,0 segundos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La unica innovacion tecnica documentada es la separacion en dos procesos secuenciales (prefill del VLM con volcado de cache KV a disco y posterior muestreo del experto) para sortear el limite de 6,4 GB de memoria GPU de la Jetson AGX Thor.

## Capacidades

- Prediccion de trayectorias de conduccion: genera 50 waypoints `[x(m), y(m), heading(rad)]` en marco ego a 10 Hz con horizonte de 5 segundos.
- Vision-lenguaje-accion (VLA): procesa imagenes de camara junto con historial del vehiculo ego y comando de navegacion.
- Interpretacion de comandos de navegacion: validado con intenciones `GO_STRAIGHT` y `GO_RIGHT`.
- Razonamiento multimodal mediante el VLM Qwen3.5-4B subyacente.
- Planificacion basada en difusion: el experto de flow-matching genera trayectorias multimodales mediante integracion Euler de 10 pasos.
- Despliegue en hardware de borde: optimizado para Jetson AGX Thor con TensorRT y Edge-LLM.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles (`en`).
- Capacidades especiales: modo thinking, vision o audio no documentados mas alla del codificador visual.

## Casos de uso

- Planificacion de trayectorias en vehiculos autonomos: el pipeline genera trayectorias de 5 segundos a 10 Hz que pueden alimentar el controlador de bajo nivel del vehiculo, con validacion de error medio 2D entre 1,22 m y 4,29 m en las escenas de prueba.
- Despliegue en plataformas de borde automotrices: al caber en los 6,4 GB de memoria GPU de la Jetson AGX Thor mediante la separacion en dos etapas, permite ejecutar el pipeline completo a bordo sin depender de conectividad a la nube.
- Prototipado de sistemas ADAS: el modelo acepta comandos de navegacion e historial del ego, lo que facilita la experimentacion con maniobras como giros a la derecha o avance recto en entornos simulados o de prueba.
- Validacion cruzada de pipelines cuantizados: la comparacion Thor (NVFP4) frente a H200 (bf16) con similitud coseno de KV de 0,974 y error maximo de trayectoria de 1,27 m sirve como metodologia para verificar degradacion por cuantizacion en despliegues de borde.
- Investigacion en VLA para conduccion: la arquitectura de dos etapas (VLM + experto de difusion) permite estudiar por separado el razonamiento multimodal y la generacion de trayectorias.
- Integracion en bancos de pruebas con Edge-LLM: los binarios `llm_inference` y `qd_sample` y los ficheros de configuracion permiten reproducir el pipeline en entornos Jetson Thor con CUDA 13.3 y TensorRT 11.0.1.7.
- Evaluacion de robustez por intencion de navegacion: las escenas validadas cubren velocidades de 0 a 7 m/s, lo que permite analizar el comportamiento del modelo en condiciones estaticas y en movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de validacion son los siguientes:

| Escena | Intencion | Velocidad | Error medio 2D | Error maximo de heading | Estado |
|---|---|---|---|---|---|
| Scene 0 | GO_STRAIGHT | ~0 m/s | 1,22 m | 29,2° | PASS |
| Scene 2 | GO_RIGHT | 2,7 m/s | 2,54 m | 2,5° | PASS |
| Scene 3 | GO_STRAIGHT | 7 m/s | 4,29 m | 0,3° | PASS |

Validacion cruzada Thor (NVFP4) frente a referencia H200 (bf16):

| Metrica | Valor |
|---|---|
| Similitud coseno de KV | 0,974 |
| Error maximo 2D de trayectoria (scene 0) | 1,27 m |
| Error medio 2D de trayectoria (scene 0) | 0,47 m |

## Requisitos de hardware

- VRAM estimada: 6,4 GB de memoria GPU direccionable en Jetson AGX Thor (medida). El motor del VLM ocupa ~3,8 GB, el codificador visual ~671 MB y el experto de planificacion ~2,0 GB; VLM y experto no pueden coexistir en memoria, de ahi la ejecucion secuencial en dos procesos.
- GPU recomendadas: Jetson AGX Thor (p3960, sm_110) como plataforma objetivo; H200 en bf16 como referencia de validacion.
- Cabe en GPU consumer: no disponible; el despliegue documentado es exclusivamente para Jetson AGX Thor con TensorRT 11.0.1.7 y CUDA 13.3.
- Opciones de despliegue: TensorRT con Edge-LLM 0.11.0 mediante los binarios `llm_inference` (etapa 1) y `qd_sample` (etapa 2); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se conoce el horizonte de salida (5,0 s a 10 Hz) y los 10 pasos de integracion Euler del experto, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo se presenta como un pipeline VLA especializado en conduccion autonoma para Jetson AGX Thor, sin que la model card incluya comparaciones con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Drive-1.0-4B (Thor) | 4B (VLM) + experto no disponible | no disponible | Apache-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Validacion muy limitada: solo se han probado 3 escenas de demostracion del dataset Qwen-Drive, insuficiente para extraer conclusiones sobre robustez en produccion.
- Error de heading elevado en scene 0: 29,2° de error maximo de heading con el vehiculo practicamente detenido (~0 m/s), lo que sugiere problemas en condiciones estaticas.
- Error 2D creciente con la velocidad: 1,22 m a ~0 m/s, 2,54 m a 2,7 m/s y 4,29 m a 7 m/s; el error aumenta con la velocidad en las escenas evaluadas.
- Restriccion de memoria severa: los 6,4 GB de la Jetson AGX Thor obligan a ejecutar el pipeline en dos procesos secuenciales con volcado de cache KV a disco, lo que anade latencia de E/S y complejidad operativa.
- Idioma: solo soporta ingles (`en`); no se documenta soporte para otros idiomas.
- Dependencia de hardware y software muy especificos: requiere Jetson AGX Thor (sm_110), CUDA 13.3, TensorRT 11.0.1.7 y Edge-LLM 0.11.0, con rutas de binarios y variables de entorno concretas; la portabilidad a otras plataformas no esta documentada.
- Riesgo de alucinacion: no documentado en la model card; al tratarse de un VLM con generacion de trayectorias, no se aportan garantias de seguridad funcional.
- Sesgos conocidos: no disponibles.
- Licencia Apache-2.0: permite uso comercial, pero la model card no incluye clausulas adicionales de seguridad para conduccion autonoma; el uso en vehiculos reales requiere validacion independiente.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso por terceros.
- La model card incluye una direccion IP interna del host Thor (`visteon@10.138.192.161`), dato sin relevancia tecnica para el despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/ullaltushar/qwen-drive-thor
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
