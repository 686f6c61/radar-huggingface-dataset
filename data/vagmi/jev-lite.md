# vagmi/jev-lite

## Resumen

jev-lite es un adaptador QLoRA publicado por el usuario vagmi sobre el modelo base google/gemma-4-E4B-it (7,98 mil millones de parámetros). No es un modelo generativo: es un clasificador de decisión que recibe un estado textual y una pregunta tipada, y devuelve una distribución de probabilidad calibrada sobre un conjunto cerrado de respuestas en una única pasada forward, leyendo directamente los logits de las letras de las opciones. El autor lo describe como un modelo de "System One": rápido, sin bucle de generación, sin parseo de salida y sin posibilidad de responder fuera de las opciones facilitadas.

La pieza diferencial es la calibración. El adaptador implementa tres primitivas de la especificación TypeSafe: `choice` (elegir entre opciones nombradas), `score` (valorar contra niveles ordenados) y `noul` (una única probabilidad de verdadero/falso). Sobre 1.898 filas retenidas por tarea y por estado, el modelo alcanza una precisión global de 0,816 con un ECE (Expected Calibration Error) de 0,019, lo que significa que cuando declara un 80 % de confianza acierta aproximadamente el 80 % de las veces.

Es relevante porque ataca un problema concreto de los pipelines con LLM: sustituir la generación libre más parseo por una cabecera de clasificación calibrada que se puede usar como puerta de enrutamiento (actuar, revisar o derivar a un humano). El repositorio ocupa 0,1 GB, el entrenamiento cupo en una única RTX 4090 durante unas 1 h 40 min y el modelo sólo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA/QLoRA) sobre transformer google/gemma-4-E4B-it; cabecera de clasificación que lee logits de letras de opción |
| Parametros totales | 7,98 B (modelo base); 34,9 M entrenables en el adaptador (0,44 %) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base en 4 bits NF4 con doble cuantización y cómputo en bf16 (QLoRA); adaptador LoRA en safetensors (precisión del adaptador no especificada) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (licencia de Google Gemma) |
| Formato de pesos | safetensors (adaptador PEFT) |

Otros datos del repositorio: pipeline declarado `text-classification`, librería `peft`, tamaño del repo 0,1 GB, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre `google/gemma-4-E4B-it`, con la base cuantizada a 4 bits NF4, doble cuantización y cómputo en bf16. Configuración LoRA: rango 16, alpha 32, dropout 0,05, aplicado a los módulos `q`, `k`, `v`, `o`, `gate`, `up` y `down`. El objetivo no es generativo sino una entropía cruzada con etiquetas suaves (soft-label cross-entropy) calculada sobre los logits de las letras de las opciones, de modo que la salida es una distribución de probabilidad normalizada y no una secuencia de tokens. Hiperparámetros: 1 época, LR 2e-4 con scheduler coseno y 3 % de warmup, batch efectivo 16 por acumulación de gradiente, entrenamiento completo en una RTX 4090 de 24 GB en aproximadamente 1 h 40 min. Las opciones se barajan en cada época para evitar el sesgo posicional, salvo en la primitiva `score`, donde el orden de los niveles es semántico y se preserva.

Los datos de entrenamiento suman 23.632 filas repartidas en 301 tareas: 13.492 de tipo `choice`, 6.368 de tipo `noul` y 3.772 de tipo `score`. El 92 % incluye descripciones de criterios y el 35,5 % lleva etiquetas suaves. Por procedencia: 8.629 filas de Super-NaturalInstructions (288 tareas, etiquetas gold con criterios redactados por el profesor), 9.605 filas de MNLI, ANLI, BoolQ, RACE y Yelp (etiquetas gold con criterios escritos a mano) y 5.398 filas de estados sintéticos (978 estados en 8 dominios con etiquetas suaves del profesor). La evaluación se hizo con partición por tarea y por estado, nunca por fila, sobre 31 tareas de Super-NaturalInstructions no vistas, 78 estados sintéticos no vistos y SST-2 completo retenido.

## Capacidades

- Clasificación de decisión en una sola pasada forward, sin generación de texto ni decodificación autorregresiva.
- Primitiva `choice`: selección entre opciones nombradas, devolviendo opción elegida, distribución de probabilidad, confianza y leyenda.
- Primitiva `score`: valoración contra niveles ordenados, devolviendo nivel esperado, leyenda, probabilidades y confianza.
- Primitiva `noul`: verificación booleana que devuelve directamente una única probabilidad, sin campo de confianza.
- Confianza calibrada como probabilidad de que la respuesta devuelta sea la correcta (`p_max` en `choice`, masa de probabilidad del nivel reportado en `score`).
- Garantía estructural de no salirse del conjunto de opciones: la respuesta se lee de los logits de las letras, por lo que no puede inventar una categoría fuera de las permitidas.
- Sin bucle de reintento, sin parseo de texto y sin salidas del estilo "como modelo de lenguaje".
- Soporte de estados textuales arbitrarios con criterios por opción (descripciones que forman parte del formato de prompt).
- No se documentan capacidades de tool calling, agentes, visión, audio, matemáticas ni multilingüismo más allá del inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y una lista cerrada de equipos (facturación, técnico, ventas), el modelo devuelve la opción más probable con confianza; con umbral 0,80 se puede enrutar automáticamente el 62 % del tráfico con un 93 % de acierto.
- Triaje con derivación a humano: usando la banda de confianza < 0,50 (2 % del tráfico, 32 % de acierto) se identifica la cola que conviene mandar a revisión manual, y la banda 0,50–0,80 (36 % del tráfico, 60 % de acierto) sirve para confirmaciones o segundas pasadas.
- Moderación y política de contenidos: preguntas binarias de tipo `noul` sobre si un texto incumple una política concreta, devolviendo una probabilidad directamente utilizable como score de umbral en un pipeline.
- Clasificación de sentimiento y evaluación en encuestas: la primitiva `score` sobre niveles ordenados (por ejemplo, de muy negativo a muy positivo) devuelve el nivel esperado con un error absoluto medio de 0,216 niveles.
- Deduplicación y control de calidad de anotaciones: uso de la distribución completa de probabilidades para detectar filas ambiguas o con anotadores en desacuerdo, en lugar de una etiqueta dura.
- Enrutamiento de prompts en un sistema mayor: actuar como primera etapa barata (una pasada forward, sin generación) que decide qué modelo o herramienta generativa se invoca después.
- Inferencia de relación textual: con estados y criterios derivados de MNLI/ANLI/BoolQ, sirve como cabecera de clasificación para implicación, contradicción o respuesta a preguntas booleanas dentro de un pipeline de evaluación.
- Automatización de decisiones en back office: cualquier flujo con estados, criterios explícitos y un conjunto cerrado de acciones etiquetables, donde la trazabilidad de la confianza importa más que la fluidez del texto.

## Benchmarks y rendimiento

Evaluación sobre 1.898 filas retenidas con partición por tarea y por estado (31 tareas de Super-NaturalInstructions no vistas, 78 estados sintéticos no vistos, SST-2 completo retenido):

| Subconjunto | n | Exactitud | ECE | NLL | Brier |
|---|---|---|---|---|---|
| Global | 1.898 | 0,816 | 0,019 | 0,430 | 0,222 |
| choice | 1.196 | 0,809 | no disponible | 0,431 | 0,238 |
| noul | 547 | 0,819 | no disponible | no disponible | no disponible |
| score | 155 | 0,852 | no disponible | no disponible | no disponible |

Error absoluto medio del nivel esperado en `score`: 0,216 niveles.

Selección de la medida de confianza sobre 1.430 filas retenidas con etiqueta gold:

| Medida | AUROC | ECE |
|---|---|---|
| p_max (elegida) | 0,816 | 0,036 |
| Entropía normalizada | no disponible | peor de las comparadas (la entropía normalizada desvía el 45 % del tráfico a revisión humana con un 64 % de acierto) |

Enrutamiento operativo por banda de confianza:

| Banda | Cuota de tráfico | Exactitud |
|---|---|---|
| ≥ 0,80 (actuar automáticamente) | 62 % | 93 % |
| 0,50–0,80 (confirmar o revisar) | 36 % | 60 % |
| < 0,50 (derivar a humano) | 2 % | 32 % |

El autor señala que la exactitud se mantuvo plana desde el paso 250 hasta el final del entrenamiento mientras el ECE bajó de 0,086 a 0,019: el modelo no aprendió a acertar más, aprendió a declarar mejor cuándo no acierta.

## Requisitos de hardware

- Modelo base de 7,98 B parámetros; el adaptador en sí ocupa 0,1 GB.
- Entrenamiento: una única RTX 4090 de 24 GB, 1 h 40 min, con la base en 4 bits NF4 y bf16 como tipo de cómputo. Es el único dato de hardware proporcionado por el autor.
- VRAM de inferencia: no publicada de forma explícita. Con el ejemplo oficial de carga (`load_in_4bit=True`, NF4, doble cuantización, `device_map={"": 0}`) el peso de la base queda en el rango de un solo dígito de GB, por lo que cabe con holgura en GPU de consumo; no obstante, el dato exacto no está disponible en la información proporcionada.
- Al leer la respuesta de los logits de la última posición en lugar de generar, el coste por consulta es el de una única pasada forward; no hay latencia de decodificación autorregresiva. No se publican cifras de latencia ni de throughput.
- Opciones de despliegue documentadas: `transformers` con `peft` (ejemplo oficial con `AutoModelForImageTextToText`, `AutoTokenizer` y `BitsAndBytesConfig`) y backend vLLM a través del servidor del repositorio del autor.
- El repositorio del autor incluye un servidor que expone la API de cable `POST /v1/systemone` para ambos backends (transformers y vLLM).
- Requisito crítico: el adaptador sólo funciona con el formato de prompt exacto con el que se entrenó, por lo que hay que usar `primitives.py`, incluido en el repositorio, para renderizar las preguntas.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. La tabla siguiente recoge únicamente características verificables de este adaptador frente a alternativas genéricas de la misma categoría, marcando como no disponible cualquier dato de rendimiento que no se haya medido.

| Alternativa | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vagmi/jev-lite (este modelo) | 7,98 B base + 34,9 M adaptador | no disponible | 0,816 de exactitud y ECE 0,019 en su evaluación retenida (no comparable con MMLU/HumanEval) | gemma | adaptador PEFT en HuggingFace |
| google/gemma-4-E4B-it (modelo base) | 7,98 B | no disponible | no disponible en la información proporcionada | gemma | HuggingFace |
| LLM generativo + parseo de la respuesta | depende del modelo | depende del modelo | no se aportan medidas comparativas | depende del modelo | según proveedor |
| Clasificador dedicado (tipo encoder) | no disponible | no disponible | no se aportan medidas comparativas | no disponible | según modelo |

## Limitaciones y advertencias

- Modelo sólo en inglés; no se declara soporte multilingüe (el propio autor lista `language: en`).
- No genera texto: no sirve para tareas de redacción, resumen, traducción ni diálogo abierto. Su única salida es una distribución sobre opciones predefinidas.
- Dependencia estricta del formato de prompt: sin usar `primitives.py` y sin las descripciones de criterios exactas, el adaptador no es fiable. Los criterios forman parte del formato y no son opcionales.
- La precisión en la banda de confianza intermedia (0,50–0,80) es del 60 % sobre el 36 % del tráfico: desplegarlo sin una etapa de confirmación o revisión humana en esa banda degrada el resultado operativo.
- La banda de baja confianza (< 0,50) acierta sólo el 32 %, por lo que el umbral de derivación debe calibrarse por aplicación.
- Riesgo de alucinación estructuralmente acotado en cuanto a la categoría: no puede devolver una opción fuera de las facilitadas. No obstante, puede asignar alta probabilidad a una opción incorrecta cuando el estado es ambiguo o está fuera de la distribución de entrenamiento.
- Sesgos heredados del modelo base Gemma y de los corpus de entrenamiento: Super-NaturalInstructions, MNLI, ANLI, BoolQ, RACE y Yelp, con criterios redactados por un "profesor" y por anotadores humanos. No se documenta ningún análisis de sesgo específico.
- Licencia `gemma`: el uso comercial está sujeto a los términos de la licencia de Gemma de Google, que imponen obligaciones y restricciones adicionales (por ejemplo, en materia de usos prohibidos y de redistribución). Hay que revisarla antes de cualquier despliegue en producción.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes) y evaluación realizada únicamente por el autor sobre sus propios conjuntos retenidos: no hay validación independiente ni resultados en benchmarks estándar como MMLU, GSM8K o HumanEval.
- La model card está truncada en la información disponible (la sección de etiquetas suaves queda incompleta), por lo que la descripción del dataset puede no ser exhaustiva.
- No se documentan medidas de cuantización adicionales (GGUF, GPTQ, AWQ) ni integración con Ollama, llama.cpp o TGI; sólo se mencionan transformers/PEFT y vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vagmi/jev-lite
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Servidor y API TypeSafe System One (transformers y vLLM): https://github.com/vagmi/jevlite
- Documentación de las primitivas TypeSafe: https://docs.typesafe.ai
- Búsqueda web: no se encontraron enlaces relevantes sobre este modelo; los resultados devueltos correspondían a una empresa de telemetría de contadores (Elvaco) sin relación con el modelo.
