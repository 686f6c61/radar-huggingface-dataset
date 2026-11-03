# sparrow-decider/ezhuthu-sparrow-decider-2b

## Resumen

ezhuthu-sparrow-decider-2b es un adaptador PEFT (LoRA) publicado por el usuario sparrow-decider sobre el modelo Strands Decider v1-2610 2B de StrandsAgents, que a su vez se construye sobre el decodificador de texto Qwen3.5-2B-Base. No es un modelo generativo de proposito general: es un clasificador de decision especializado en una unica tarea dentro de Ezhuthu, una herramienta de aprendizaje para la lectura de inscripciones tamil. Concretamente, dado un fragmento danado de una inscripcion, pasajes paralelos y las tres mejores candidatas de restauracion propuestas por un LLM y un sistema de recuperacion, el modelo debe elegir cual de las tres coincide con la restauracion de los editores, o indicar `none` si ninguna lo hace.

La relevancia del modelo es acotada pero clara: demuestra como un modelo pequeno (2B parametros) fino-ajustado con datos escasos y bien curados puede superar a un decididor generalista alojado en una tarea de juicio experto muy concreta. En el split TEST de 413 huecos, el ranking completo del restaurador guiado por este modelo alcanza un 65,4% de coincidencia top-1 frente al 58,1% del decididor base y el 38,7% de la confianza del propio LLM. Es, por tanto, un componente de infraestructura para humanidades digitales, no un asistente conversacional.

El modelo no lee fotografias ni escribe texto: solo puntua candidatas. Espera una forma de peticion muy especifica (`state` con `text_before_gap`, `text_after_gap`, `gap_length_tamil_letters`, `parallel_passages` y las opciones `c0`, `c1`, `c2`, `none` en ese orden) y cualquier otra forma queda fuera de distribucion. Se sirve mediante la libreria `strands-decider==0.2.0` y se distribuye como adaptador LoRA de rango 48 junto con una cabeza de puntero en `head.safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B) con cabeza de puntero para clasificacion sobre opciones; adaptador LoRA sobre el decodificador |
| Parametros totales | Adaptador LoRA de 50,5M + cabeza de puntero de 3,2M sobre un modelo base de 2B (parametros totales del modelo compuesto no disponibles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo incluye pesos safetensors del adaptador y de la cabeza) |
| Idiomas soportados | Tamil (inscripciones en transliteracion ISO-15919); `ta` como unico idioma declarado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT en `lora/`, cabeza en `head.safetensors`); los pesos base de Qwen3.5-2B-Base se descargan en el primer uso |

## Arquitectura y entrenamiento

El modelo es un fine-tune de continuacion sobre Strands Decider v1-2610 2B (revision `216d1ccb`): se conservan y se siguen entrenando tanto su adaptador LoRA (50,5M parametros) como su cabeza de puntero (3,2M), sin reinicializar ningun componente. La cabeza produce probabilidades calibradas sobre las cuatro opciones (`c0`, `c1`, `c2`, `none`) para la forma `choice`, y tambien admite la forma por candidata `noul` (si/no). El adaptador resultante es un PEFT estandar de rango 48 montado sobre el decodificador de texto Qwen3.5-2B.

El entrenamiento uso exclusivamente el split TRAIN de Ezhuthu, dividido por inscripcion: 2.334 filas `choice` y 6.936 filas `noul` construidas a partir de las peticiones reales del restaurador (candidatas generadas por Claude Sonnet 4.6 mas pasajes paralelos recuperados). Se eliminaron 96 near-duplicates formulaicas de lineas de VAL/TEST y las candidatas de entrenamiento se generaron con validacion cruzada de 5 folds por piedra para evitar fuga de informacion. Se realizo una epoca, 580 pasos de 16 filas, AdamW con lr 5e-5 (adaptador) y 5e-4 (cabeza), decaimiento coseno y semilla 0, en 1x A100 de 40 GB durante 74 minutos (aproximadamente 2,26 USD de computo). El checkpoint, la variante y las temperaturas (`choice` 1,30; `noul` 1,45) se eligieron sobre VAL; TEST no se uso para ninguna decision.

## Capacidades

- Clasificacion de decision con probabilidades calibradas sobre cuatro opciones (`c0`, `c1`, `c2`, `none`) en la forma `choice`.
- Clasificacion por candidata en formato si/no (`noul`).
- Abstenerse explicitamente mediante la opcion `none` cuando ninguna candidata es correcta, con umbral calibrado sobre VAL.
- Razonamiento sobre contexto epigrafico: compara el texto antes y despues del hueco, la longitud del hueco en letras tamiles y pasajes paralelos.
- Manejo de transliteracion ISO-15919 de inscripciones tamiles.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso mas alla de la decision unica.
- No soporta vision: no lee fotografias de inscripciones.
- No genera texto: no escribe restauraciones, solo elige entre candidatas ya propuestas.
- Multilingue limitado: unicamente tamil epigrafico en transliteracion; no probado en tamil moderno, Tamil-Brahmi ni otras escrituras.

## Casos de uso

- Restauracion asistida de inscripciones tamiles: integrado en el pipeline de Ezhuthu como `ezhuthu-strands-2b-ft`, recibe las tres candidatas del restaurador y devuelve la eleccion con probabilidad calibrada, elevando la coincidencia top-1 del 59,1% (pre-rank sin decididor) al 65,4%.
- Filtrado de candidatas en produccion editorial: el umbral calibrado rellena el 57,6% de los huecos y marca el resto para revision humana, de modo que el 92,0% de los rellenos automaticos coinciden con la restauracion de los editores (238 rellenos, ECE 0,070).
- Herramienta de aprendizaje para epigrafistas: el modelo propone y el usuario decide; sirve para que estudiantes comparen su juicio con la sugerencia del sistema y con la edicion publicada antes de consultar la piedra.
- Investigacion en humanidades digitales: como componente reproducible en experimentos sobre restauracion automatica, con controles de fuga y tests pareados documentados en el informe de evaluacion.
- Evaluacion comparativa de decididores: permite medir de forma pareada si un decididor pequeno y especializado supera a un decididor generalista alojado (v19) en la misma tarea, con resultados publicados (53 frente a 5 discordantes, p < 1e-8).
- Integracion como servicio HTTP: el comando `strands-decider serve` expone un endpoint `/v1/systemone` que acepta peticiones JSON con la forma exacta esperada, facil de encadenar tras un restaurador LLM y un recuperador de paralelos.
- Analisis de sesgo de confianza en LLMs: el contraste entre la confianza propia del LLM (38,7%) y el ranking del decididor (65,4%) sirve para estudiar la calibracion de la confianza en tareas de juicio experto.

## Benchmarks y rendimiento

Resultados publicados sobre el split TEST retenido (413 huecos de inscripciones nunca usadas en entrenamiento), con todas las decisiones fijadas sobre VAL.

| Configuracion (TEST, 413 huecos) | Coincidencia top-1 |
|---|---|
| Restaurador completo ordenado por este modelo | 65,4% (IC 95%: 60,8-69,7) |
| Mismo restaurador, pre-rank sin decididor (opcion anterior por defecto) | 59,1% |
| Mismo restaurador, ordenado por el decididor base de 2B | 58,1% |
| Mismo restaurador, ordenado por la confianza del propio LLM | 38,7% |
| Solo decididor, top-3 + none (mismas peticiones para todos) | 54,7% (techo 60,3%) |
| Strands Decider v19 generalista alojado, mismas peticiones | 43,1% (pareado: 53 vs 5 discordantes, p < 1e-8) |

Tras calibracion sobre VAL, rellena el 57,6% de los huecos y marca el resto; el 92,0% de los rellenos realizados coinciden con la restauracion de los editores (238 rellenos, ECE 0,070). Limitacion declarada: en un benchmark TEST-hard congelado de 60 items, con un formato de peticion para el que no fue entrenado, obtiene 0,400 y no supera al v19 alojado (0,450).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como modelo de 2B en precision nativa, cabe holgadamente en GPUs de consumo, pero el repositorio no publica cifras de VRAM ni de cuantizacion.
- GPU de entrenamiento documentada: 1x A100 de 40 GB (74 minutos, aproximadamente 2,26 USD de computo).
- GPU recomendadas: no disponibles; el entrenamiento se realizo en A100 40 GB, pero no se documentan recomendaciones para inferencia.
- Cabe en GPU de consumo: altamente probable por el tamano base de 2B, aunque no esta confirmado en la informacion disponible.
- Opciones de despliegue: servicio propio mediante `strands-decider serve` (libreria `strands-decider==0.2.0`, endpoint `/v1/systemone`); carga en Python con `strands_decider.modeling.StrandsDeciderModel.load(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea (TEST) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ezhuthu-sparrow-decider-2b | 2B base + adaptador LoRA de 50,5M + cabeza de 3,2M | No disponible | 65,4% top-1 (restaurador completo); 54,7% solo decididor | Apache-2.0 | HuggingFace (adaptador PEFT) |
| Strands Decider v1-2610 2B (base) | 2B | No disponible | 58,1% top-1 (restaurador completo) | No disponible en la informacion | HuggingFace |
| Strands Decider v19 generalista alojado | No disponible | No disponible | 43,1% (mismas peticiones); 0,450 en TEST-hard | No disponible en la informacion | Alojado |
| Confianza propia del LLM restaurador (Claude Sonnet 4.6) | No aplica | No aplica | 38,7% top-1 | No aplica | API |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explicitamente; el modelo se entrena solo con ediciones DHARMA (incluida la coleccion Pallava), lo que puede sesgar sus juicios hacia las convenciones de esas ediciones.
- Riesgo de alucinacion: bajo en el sentido generativo (no escribe texto), pero puede elegir una candidata incorrecta con alta confianza; por eso el umbral calibrado y la ruta `none` forman parte de la evaluacion.
- Las restauraciones de los editores son juicio experto, no verdad de referencia: las metricas miden coincidencia con la edicion publicada.
- Limitacion de contexto: no hay informacion sobre la ventana de contexto, y el modelo solo funciona con la forma de peticion exacta (`state` con `text_before_gap`, `text_after_gap`, `gap_length_tamil_letters`, `parallel_passages` y opciones `c0`, `c1`, `c2`, `none`); otras formas quedan fuera de distribucion.
- Limitacion de idioma y dominio: solo tamil epigrafico en transliteracion ISO-15919; no probado en Tamil-Brahmi, otras escrituras, salida de OCR ni tamil moderno.
- Rendimiento degradado en formatos no vistos: en el benchmark TEST-hard congelado de 60 items obtiene 0,400 y no supera al v19 (0,450).
- Restricciones de licencia: los pesos son Apache-2.0, pero los datos de entrenamiento y `example_request.json` derivan de textos editados por el proyecto DHARMA y los editores de cada edicion, compartidos bajo CC BY-SA 4.0; el fichero de ejemplo mantiene esos terminos y debe cumplirse la atribucion.
- Uso previsto limitado: es una herramienta de apoyo que propone; las personas deciden. Cualquier relleno debe verificarse contra la piedra y la edicion publicada antes de usarse en produccion editorial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sparrow-decider/ezhuthu-sparrow-decider-2b
- Modelo base Strands Decider: https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio Ezhuthu: https://github.com/Vivek0712/ezhuthu
- Informe de evaluacion del decididor fino-ajustado: https://github.com/Vivek0712/ezhuthu/blob/main/eval/reports/2026-11-02-finetuned-decider.md
- Proyecto DHARMA: https://dharmalekha.info
