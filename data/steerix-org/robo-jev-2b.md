# Steerix-org/robo-jev-2b

## Resumen

robo-jev 2B (v0.7) es un modelo de 2B parametros desarrollado por Steerix-org y publicado bajo licencia Apache 2.0. No es un modelo conversacional al uso: es un "System 1" de juicio fisico para robots. Recibe una descripcion textual de lo que el robot percibe (velocidad, carga, obstaculos, distancias, capacidad de frenado) y devuelve, en una sola pasada hacia delante, una probabilidad calibrada para cada respuesta de un conjunto de preguntas de decision planteadas en el mismo request.

El modelo parte de Qwen/Qwen3.5-2B, al que se le ha aplicado un ajuste fino con LoRA (adaptador v0.7) y cuyos pesos se publican ya fusionados en bfloat16 como un `Qwen3_5ForCausalLM` de solo texto: la torre de vision del modelo base no forma parte de robo-jev y se ha excluido. El repositorio ocupa 7,5 GB y contiene 1.881.825.088 parametros reales segun los safetensors.

Su relevancia practica esta en la relacion tamano/latencia: un unico forward pass por pregunta, sin muestreo ni tokens de razonamiento, con aproximadamente 50 ms por peticion corta en una GPU L4 y alrededor de 0,1 s para una docena de preguntas. Esto permite ejecutarlo junto al planificador de un robot en una GPU pequena, algo que los modelos de decision accedidos por API no ofrecen en el bucle de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3_5ForCausalLM`), base Qwen3.5-2B con adaptador LoRA fusionado |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la model card limita el texto de estado a 16.000 caracteres por peticion |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; los pesos del repositorio estan en bfloat16 |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16), libreria transformers |
| Tamano del repositorio | 7,5 GB |
| Pipeline declarado | robotics |
| Modelo base | Qwen/Qwen3.5-2B (relacion: finetune) |
| Descargas / likes | 45 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-2B, un transformer decoder-only de aproximadamente 1,88B parametros. Sobre el se entreno un adaptador LoRA especifico (robo-jev v0.7) para una tarea de juicio fisico, y el repositorio principal distribuye los pesos ya fusionados en bfloat16. Se elimino explicitamente la torre de vision del modelo original: robo-jev es text-only, de modo que toda la informacion perceptiva (lidar, estimaciones de camara, estado de la carga) debe llegar como texto de estado.

El entrenamiento busca producir probabilidades calibradas, no texto libre: el modelo responde a preguntas tipadas (`choice` con entre 2 y 26 opciones, `noul` binaria y `score` en el rango 0-1) y devuelve la distribucion de probabilidad asociada a cada una. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion es no disponible. La evaluacion se realizo sobre un banco propio de 1.100 situaciones retenidas, con formulaciones, rangos de valores y combinaciones de fenomenos no vistos en entrenamiento, y el autor declara que los modelos de decision comparados fueron consultados a traves de la OpenRouter Decisions API.

## Capacidades

- Juicio fisico en una sola pasada: estima si un vaso se volcara al frenar, si una persona alcanzara la trayectoria del robot antes que el, o si una pieza ha quedado bien encajada.
- Preguntas de eleccion (`choice`) con un maximo de 26 opciones e instrucciones y criterios definidos por el usuario.
- Preguntas binarias (`noul`) que devuelven una probabilidad continua.
- Preguntas de puntuacion (`score`) con salida en el intervalo 0-1, con probabilidades por nivel de 0,0 a 1,0.
- Multiples preguntas por peticion: entre 1 y 12 preguntas en un mismo request, resueltas sobre el mismo texto de estado.
- Probabilidades calibradas por respuesta, aptas para umbralizar en un bucle de control.
- Idiomas: ingles y coreano, tanto en el texto de estado como en las instrucciones y criterios.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni generacion de texto libre en la informacion proporcionada.

## Casos de uso

- Frenado seguro de robots moviles en zonas concurridas: el modelo estima, a partir de velocidad, distancia al obstaculo, tiempo de reaccion y deceleraciones disponibles, la probabilidad de contacto y la opcion de frenado mas adecuada (`stop_gentle`, `stop_moderate`, `stop_hard`).
- Guardarrail de seguridad sobre el planificador: antes de ejecutar la recomendacion del planner (`stop_moderate`, en el ejemplo de la model card), se consulta al modelo y se veta la accion si la probabilidad de riesgo supera un umbral definido por el integrador.
- Transporte de liquidos o carga fragil: prediccion de derrame ante maniobras bruscas, util en robots camareros o de reparto con bandejas abiertas.
- Verificacion de manipulacion y ensamblaje: preguntas del tipo "did the part seat?" para confirmar que una pieza ha quedado correctamente alojada antes de continuar el ciclo.
- Simulacion y validacion de politicas: al ejecutarse en una L4 con unos 50 ms por peticion, permite evaluar miles de situaciones sinteticas para detectar escenarios de riesgo antes de desplegar en hardware real.
- Etiquetado y curacion de datos de robotica: usar las probabilidades calibradas como etiqueta blanda para filtrar o priorizar episodios de entrenamiento en funcion de su dificultad.
- Interfaz de decisiones compatible con la OpenRouter Decisions API: el mismo formato de request (texto de estado mas hasta 12 preguntas) permite migrar entre el modelo local y la API sin reescribir la integracion.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La columna de juicio fisico mide la habilidad frente a responder siempre un 50 % (0 = equivalente a lanzar una moneda, 1 = acierto perfecto) sobre 1.100 situaciones retenidas.

| Modelo | Juicio fisico (mayor es mejor) | Lectura general (BoolQ + MultiNLI) |
|---|---|---|
| robo-jev v0.7 · 2B | 0,81 | 0,71 |
| TypeSafe Jev | 0,28 | 0,91 |
| Liquid d1 | 0,17 | 0,93 |
| Microsoft-Decision-1 | 0,04 | 0,92 |
| Together Tev1 4B | 0,03 | 0,90 |
| OpenAI GPT-6 Luna Decisions | -0,02 | 0,86 |
| Upstage Solar Decide | -0,15 | 0,86 |
| Qwen3.5-2B sin entrenar | -0,15 | 0,74 |

Notas del autor: los modelos de decision se consultaron a traves de la OpenRouter Decisions API; OpenAI GPT-6 Luna Decisions rechazo aproximadamente una quinta parte de las peticiones de juicio fisico, por lo que su puntuacion solo cubre el resto. La columna de lectura general refleja un rendimiento inferior al de los modelos grandes, coherente con el ajuste especifico del modelo a la tarea de decision fisica. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar.

## Requisitos de hardware

- Peso de los parametros: 1.881.825.088 parametros en bfloat16 equivalen a unos 3,8 GB de VRAM solo para pesos.
- VRAM estimada: aproximadamente 4-6 GB en bfloat16 incluyendo activaciones y cache para el limite de 16.000 caracteres de texto de estado.
- GPU recomendadas: el autor reporta unas 50 ms por peticion corta en una unica NVIDIA L4; tambien son adecuadas A100, H100, L40S o RTX 4090.
- GPU de consumo: cabe en tarjetas consumer con 8 GB o mas, por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. En GPUs de 6 GB puede requerir cuantizacion, no publicada oficialmente.
- Despliegue: transformers (se exige `transformers>=5.17`), mediante el script `robo_jev_decide.py` incluido en el repositorio, o con el paquete de la familia robo-jev (`RoboJev.from_pretrained(...).decide(...)`).
- Otros motores: no se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia: aproximadamente 50 ms por peticion corta y en torno a 0,1 s para una docena de preguntas en una L4. Throughput no disponible.
- Contexto operativo: texto de estado de hasta 16.000 caracteres, de 1 a 12 preguntas por peticion y hasta 26 opciones por pregunta de tipo `choice`. La metadatos del modelo declaran `inference: false` como etiqueta de la libreria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Juicio fisico | Lectura general | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| robo-jev v0.7 · 2B | 1,88B | No disponible | 0,81 | 0,71 | Apache 2.0 | Pesos abiertos en HuggingFace; inferencia local |
| TypeSafe Jev | No disponible | No disponible | 0,28 | 0,91 | No disponible | No disponible |
| Liquid d1 | No disponible | No disponible | 0,17 | 0,93 | No disponible | No disponible |
| Together Tev1 4B | 4B | No disponible | 0,03 | 0,90 | No disponible | Via API de decisiones |
| OpenAI GPT-6 Luna Decisions | No disponible | No disponible | -0,02 | 0,86 | No disponible | Via API de decisiones |
| Upstage Solar Decide | No disponible | No disponible | -0,15 | 0,86 | No disponible | Via API de decisiones |
| Qwen3.5-2B sin entrenar | 2B | No disponible | -0,15 | 0,74 | No disponible | Pesos abiertos |

La comparativa se limita a los datos publicados por el autor. robo-jev prioriza el juicio fisico especifico (0,81) frente a la lectura general, donde los modelos mayores y los de decision por API obtienen puntuaciones mas altas (0,86-0,93). No se dispone de datos de parametros, contexto ni licencia de los modelos de comparacion mas alla de Together Tev1 4B.

## Limitaciones y advertencias

- Modelo de tarea especifica: no es un modelo conversacional ni de generacion de texto libre; fuera del formato de preguntas tipadas su utilidad no esta documentada.
- Cobertura idiomatica limitada al ingles y al coreano; no se declara soporte para castellano ni otros idiomas.
- Los pesos publicados son text-only: la torre de vision del Qwen3.5-2B original se ha eliminado, por lo que toda la informacion perceptiva debe describirse en texto.
- Los 0,81 de juicio fisico proceden de un banco de evaluacion propio del autor, no de un benchmark independiente; conviene validar el modelo sobre los escenarios concretos del despliegue.
- La calibracion de las probabilidades es un objetivo declarado, pero no se publican curvas de fiabilidad ni analisis de calibracion por subgrupo.
- Riesgo de alucinacion y de sobreconfianza en situaciones fisicas fuera de la distribucion de entrenamiento; no se detallan los datos de entrenamiento ni los sesgos asociados.
- No se documentan cuantizaciones oficiales ni integraciones probadas con motores de inferencia de alto rendimiento (vLLM, llama.cpp, TGI), lo que limita las opciones de despliegue en produccion.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo esta sujeto ademas a las condiciones del modelo base Qwen/Qwen3.5-2B.
- Con 45 descargas y 0 likes, la comunidad de usuarios y el soporte son minimos; el modelo tiene fecha de actualizacion de octubre de 2026 y no se documenta un plan de mantenimiento.
- Los limites operativos son estrictos: 16.000 caracteres de estado, 1-12 preguntas y 2-26 opciones por pregunta de eleccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Steerix-org/robo-jev-2b
- Adaptador LoRA: https://huggingface.co/Steerix-org/robo-jev-2b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Script de uso incluido en el repositorio: `robo_jev_decide.py`
- OpenRouter Decisions API (citada en la model card): https://openrouter.ai/models?output_modalities=decisions
- No se han encontrado en la busqueda web enlaces relevantes al modelo; los resultados obtenidos corresponden a paginas no relacionadas sobre la plataforma Twitch.
