# ThakiCloud/Voice2Policy-Text-Router-v0.1

## Resumen

Voice2Policy Text Router v0.1 es un clasificador de texto de muy pequeño tamaño desarrollado por ThakiCloud que actúa como paso de enrutamiento dentro de una tubería de voz a acción para pequeños negocios. Recibe la transcripción ASR de un comando dictado en coreano (por ejemplo, una reserva en una clínica o un pedido en una cafetería) y predice su "frame" de comando: la intención (`tool`, `no_command`, `delegate`), la acción (`book`, `order`, `confirm`, `decline`), el tipo de elemento pendiente (`booking` u `order`) y si la frase menciona una fecha, hora o número de teléfono.

No es un modelo neuronal, ni un transformer, ni un modelo de lenguaje: es una combinación de vectorizador TF-IDF de n-gramas de caracteres (8.716 n-gramas) y dos cabezas de regresión logística, con 104.603 parámetros en total y un peso de 0,84 MB en `safetensors`. La inferencia se ejecuta en CPU en torno a 0,7 ms por frase, lo que lo hace adecuado como filtro determinista y barato delante de un resolutor de entidades y un motor de políticas.

Su relevancia es acotada pero clara: demuestra que una parte del enrutamiento de intenciones en dominios cerrados puede resolverse sin GPU ni LLM, con latencia despreciable y sin dependencia de scikit-learn en producción (la lógica está reimplementada en numpy). El propio autor advierte que el modelo no resuelve referencias, no ejecuta herramientas y que su precisión cae de forma notable con formulaciones escritas por humanos distintas del estilo sintético de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF de n-gramas de caracteres (`char_wb`, 1-4, min_df=2, sublinear_tf, norma L2) reimplementado en numpy + regresión logística multinomial (cabeza de frame) y regresión logística binaria (cabeza de slot) |
| Parametros totales | 104.603 (coeficientes, interceptos e IDF) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto; procesa una única frase corta por inferencia) |
| Tipos de cuantizacion | No disponible (pesos en coma flotante dentro de `safetensors`; no se documentan variantes cuantizadas) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache-2.0 (pesos, configuración y código del repositorio) |
| Formato de pesos | `model.safetensors` (0,84 MB) + `vocab.json` (0,15 MB) + `config.json`; sin pickle ni dependencia de scikit-learn en inferencia |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clásico de procesamiento de lenguaje natural: se vectoriza la frase con un `TfidfVectorizer` en modo `char_wb` con n-gramas de 1 a 4 caracteres, `min_df=2`, `sublinear_tf=True` y normalización L2, generando un vocabulario de 8.716 n-gramas de caracteres. Sobre esa representación se aplican dos cabezas lineales independientes: una regresión logística multinomial con 10 clases (C = 10) que predice el frame de comando, y una regresión logística binaria que estima si se ha mencionado una fecha, hora de reserva o número de teléfono. Toda la maquinaria de scikit-learn está reimplementada en numpy para que la inferencia no requiera esa librería.

El entrenamiento se realizó sobre 10.682 frases sintéticas en coreano de dominio empresarial (reserva, pedido, confirmación, cancelación, FAQ, narración, negación y derivación a personal), cubriendo 11 tipos de pequeño negocio (clínica, cafetería, restaurante, manicura, etc.). Las frases fueron redactadas por un LLM a partir de representaciones de comando tipadas, pero las etiquetas provienen de reglas deterministas sobre esas representaciones, no del propio LLM. No se usaron datos de clientes, grabaciones ni información personal, y el conjunto de datos no se ha publicado. El coste de entrenamiento declarado es de 11 segundos en CPU. El repositorio incluye `equivalence.json`, que documenta que el modelo exportado reproduce las decisiones de frame y de slot del modelo original de scikit-learn sobre 5.613 frases, con diferencias solo en el redondeo a 4 decimales de las probabilidades.

## Capacidades

- Clasificación de intención en tres clases: `tool` (petición de herramienta de negocio), `no_command` (pregunta, narración, negativa) y `delegate` (derivación a personal: reembolsos, quejas, descuentos, cuestiones médicas, petición del responsable).
- Predicción de acción dentro de `tool`: `book`, `order`, `confirm` o `decline`.
- Identificación del tipo de elemento pendiente (`booking` u `order`) cuando la frase indica qué se confirma o cancela; `null` en caso contrario.
- Detección de mención de fecha, hora de reserva o número de teléfono mediante la cabeza binaria de slot (`slot_mentioned`, `slot_score`).
- Salida de probabilidades softmax sobre las 10 clases de frame (`frame_score`, `frame_scores`) y de una sugerencia de familia de herramienta (`tool_hint`: `update_slots`, `update_basket`, `confirm_*`, `decline_*`, `handoff`).
- Funcionamiento sin GPU, sin scikit-learn y sin pickle, con interfaz de línea de comandos (`python predict.py "..." --json`) y API Python (`TextRouter.predict`).
- No soporta tool calling real, ni razonamiento multi-paso, ni agentes, ni visión, ni audio, ni modo de pensamiento. El `tool_hint` es una sugerencia orientativa que no debe ejecutarse directamente.

## Casos de uso

- Enrutamiento previo en asistentes de voz para pequeños negocios: el modelo recibe la transcripción ASR de un cliente y decide en menos de un milisegundo si la frase es un comando accionable, una pregunta o una petición que debe atender una persona. Es el primer filtro de la tubería Voice2Policy (ASR → router → resolutor de entidades → validación de esquema → motor de políticas).
- Triaje de reservas en clínicas y centros de estética: clasifica frases como "resérvame el viernes" como `tool`/`book`/`booking` y activa la herramienta de actualización de slots, mientras que una consulta sobre precios cae en `no_command` y no dispara ninguna acción.
- Gestión de pedidos en hostelería: distingue `order` de `book` y marca `update_basket` como familia de herramienta, lo que permite separar el flujo de pedido del de reserva de mesa sin ambigüedad en el backend.
- Detección de peticiones sensibles para derivación humana: las quejas, solicitudes de reembolso, descuentos o cuestiones médicas se clasifican como `delegate`, lo que permite enrutarlas a personal sin que el sistema automatizado responda por su cuenta.
- Prellenado de formularios de cita: cuando `slot_mentioned` es verdadero, el sistema sabe que debe extraer una fecha u hora del texto y puede lanzar el extractor de entidades temporales solo en esos casos, ahorrando procesamiento.
- Filtro de seguridad previo a la ejecución de herramientas: descarta narraciones y preguntas antes de llegar al motor de políticas, reduciendo el número de llamadas a herramientas y el riesgo de ejecuciones no deseadas sobre transcripciones ruidosas del ASR.
- Evaluación comparativa de calidad de ASR: al disponer de una referencia de frame por frase, sirve como sonda ligera para medir cuánto degrada un cambio de modelo de reconocimiento de voz la intención final del sistema.
- Prototipado rápido de dominios cerrados: al entrenar en 11 segundos en CPU, permite validar la viabilidad de un enrutador de intenciones antes de invertir en un modelo neuronal o en un LLM.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (comparación de desarrollo, una sola ejecución de entrenamiento):

| Entrada | Precisión de frame | Intención + acción | Slot mencionado |
|---|---|---|---|
| Frases sintéticas reservadas (`biz_test`, 3.081) | 0,998 | 0,998 | 0,999 |
| Transcripciones ASR del mismo conjunto leídas con voces TTS (18.879 clips; Qwen3-ASR-1.7B con nombres registrados como contexto) | 0,997 | 0,997 | 0,998 |
| 81 frases escritas a mano con otra formulación | 0,827 | 0,889 | 0,975 |

El autor advierte explícitamente de que las dos primeras filas son optimistas porque el conjunto de test comparte el estilo del generador con el de entrenamiento. Con formulaciones humanas la precisión de frame cae a 0,83. Los fallos típicos documentados son: una petición de reembolso sin la palabra "personal" se lee como `no_command`; las peticiones negadas ("no canceles la reserva") se leen como la acción; y los demostrativos aislados ("haz eso") se adivinan como cancelación. Con la capa de políticas posterior, las mismas 81 frases dan 76/81 decisiones correctas y ninguna ejecución insegura.

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU en ningún escenario.
- Huella en disco: aproximadamente 1 MB entre `model.safetensors` (0,84 MB) y `vocab.json` (0,15 MB); el repositorio completo ocupa 0,0 GB según HuggingFace.
- RAM estimada: no disponible de forma explícita, pero el número de parámetros (104.603) implica un consumo del orden de unos pocos megabytes incluyendo vocabulario e IDF.
- Cabe en cualquier GPU de consumo y en cualquier CPU; también en entornos sin acelerador, contenedores pequeños y dispositivos de borde.
- Latencia declarada: alrededor de 0,7 ms por frase, medida dentro de la tubería en la CPU de un host con B200. El throughput no se ha publicado, pero se deriva en torno a varios cientos de frases por segundo y núcleo.
- Opciones de despliegue: importación directa del módulo `predict.py` del repositorio, línea de comandos con salida JSON, o integración como paso previo a vLLM, TGI u otro servidor de inferencia que aloje el resto de la tubería. No se documentan integraciones con llama.cpp, Ollama ni servidores de clasificación tipo TEI.
- Dependencias: `numpy`, `safetensors` y `huggingface_hub`. No requiere scikit-learn ni pickle.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Voice2Policy Text Router v0.1 | TF-IDF de caracteres + regresión logística | 104.603 | No aplica (una frase por inferencia) | Coreano | Apache-2.0 | HuggingFace, pesos safetensors |
| Clasificador TF-IDF + regresión logística hecho a medida con scikit-learn | Igual familia | Depende del vocabulario | No aplica | Según corpus | Según implementación | Requiere entrenamiento propio |
| fastText (supervisado) | Bolsa de n-gramas + regresión lineal | No disponible | No aplica | Multilingüe | MIT | Público, requiere entrenamiento propio |
| Modelo Transformer coreano tipo BERT (por ejemplo, familia KLUE) ajustado para clasificación de intención | Transformer encoder | No disponible en la información disponible | No disponible | Coreano | No disponible | Público, requiere ajuste fino |

La comparación cuantitativa con alternativas no está disponible: el autor no publica comparaciones frente a otros enrutadores, y no se han encontrado en la información proporcionada resultados de modelos competidores sobre el mismo conjunto de evaluación, que además no es público. La diferencia cualitativa relevante es que este modelo no necesita GPU ni ajuste fino por parte del usuario, a cambio de una capacidad de generalización limitada al dominio y al estilo de sus datos sintéticos.

## Limitaciones y advertencias

- Solo coreano. El vocabulario está restringido a reservas y pedidos de pequeños negocios; otros dominios requieren reentrenamiento completo.
- El entrenamiento usa exclusivamente texto sintético: no se ha medido el comportamiento con formulaciones reales de usuarios, y la única evaluación con lenguaje humano son 81 frases escritas a mano, donde la precisión de frame baja a 0,827.
- Un modelo de bolsa de n-gramas de caracteres no tiene noción de ámbito: la negación y las referencias anafóricas requieren comprobaciones posteriores en el motor de políticas. Ejemplos documentados: peticiones negadas interpretadas como la acción y demostrativos aislados interpretados como cancelación.
- Las puntuaciones no son probabilidades calibradas de acierto; no deben usarse como umbral de confianza directo sin calibración adicional.
- El campo `tool_hint` es solo una sugerencia de familia de herramienta y no debe ejecutarse directamente: la decisión final depende de los nombres de servicio registrados en el espacio de trabajo, del estado pendiente y de los argumentos requeridos por la herramienta.
- El modelo no resuelve nombres de personas, servicios ni productos, no procesa audio y no ejecuta ninguna acción.
- Licencia Apache-2.0 en pesos, configuración y código: permite uso comercial y modificaciones con atribución y aviso de cambios; no se documentan restricciones adicionales.
- El repositorio tiene 0 descargas y 0 "me gusta" en el momento de la consulta, y las fechas de creación y actualización son del 20 de octubre de 2026; se trata de una publicación sin validación independiente por parte de la comunidad.
- Al depender de la salida de un ASR, los errores de transcripción se propagan; el autor solo evalúa con un único sistema ASR (Qwen3-ASR-1.7B) y un conjunto de voces TTS.
- No se publica el conjunto de datos ni un informe de sesgos; al ser texto sintético generado por un LLM, puede heredar sesgos de estilo y de vocabulario del generador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Voice2Policy-Text-Router-v0.1
- Model card en coreano: https://huggingface.co/ThakiCloud/Voice2Policy-Text-Router-v0.1/blob/main/MODEL_CARD.ko.md
- Pesos: https://huggingface.co/ThakiCloud/Voice2Policy-Text-Router-v0.1/blob/main/model.safetensors
- Vocabulario: https://huggingface.co/ThakiCloud/Voice2Policy-Text-Router-v0.1/blob/main/vocab.json
- Script de inferencia: https://huggingface.co/ThakiCloud/Voice2Policy-Text-Router-v0.1/blob/main/predict.py
- Informe de equivalencia con el modelo original: https://huggingface.co/ThakiCloud/Voice2Policy-Text-Router-v0.1/blob/main/equivalence.json
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
