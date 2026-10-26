# unfold-labs/unfold-insights-xlmr-fren

## Resumen

`unfold-labs/unfold-insights-xlmr-fren` es un clasificador de texto derivado de `FacebookAI/xlm-roberta-large`, publicado por Unfold Labs como parte del motor de la aplicación Unfold Note. No es un modelo generativo: recibe un par de segmentos de una transcripcion de reunion (el segmento anterior y el actual) y devuelve tres salidas: la probabilidad de que el segmento sea una pregunta (`q`), la probabilidad de que exprese una accion o compromiso (`act`) y los logits sobre el tipo de accion (`kind`). Su funcion es alimentar la deteccion automatica de tareas y preguntas en notas de reunion, ejecutandose de forma local y sin conexion.

Tecnicamente es un encoder transformer de la familia XLM-RoBERTa en su variante *large*, con el vocabulario original recortado a frances e ingles y exportado a ONNX en precision completa (fp32). El repositorio ocupa 1,4 GB e incluye un manifiesto de integridad (`insights-model.json`) con el tamano y el sha256 de cada fichero, que la aplicacion verifica tras la descarga. La entrada se trunca a 128 tokens y se aplican umbrales fijos de decision (0,07 para `q` y 0,33 para `act`).

Su relevancia es acotada pero clara: cubre una tarea concreta de extraccion de *action items* en entornos donde no se puede enviar audio ni transcripciones a la nube, y lo hace con un coste de inferencia propio de CPU. La model card justifica la eleccion frente al detector basado en reglas que ya incorpora la aplicacion, con mejoras notables en F1 de acciones en ingles (0,943 frente a 0,793) y en frances (0,879 frente a 0,714).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con vocabulario podado a frances e ingles, exportado a ONNX |
| Parametros totales | no disponible (el modelo base `FacebookAI/xlm-roberta-large` ronda los 560 M; la poda de vocabulario reduce la cifra, pero el autor no la publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens por par de entrada (segmento previo + segmento actual), con truncado |
| Tipos de cuantizacion | fp32 unicamente; no se publican variantes int8, fp16 ni GGUF |
| Idiomas soportados | frances (fr) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (repositorio de 1,4 GB) mas manifiesto `insights-model.json` con sha256 por fichero |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa large: un encoder transformer bidireccional con embeddings de subpalabras SentencePiece. El autor ha reducido el vocabulario original (250 mil tokens en XLM-R) a un subconjunto que cubre frances e ingles, lo que disminuye el numero de parametros y el tamano del fichero, y ha exportado el resultado a ONNX en fp32 para inferencia local. La cabeza de clasificacion produce tres salidas independientes sobre la representacion del token de clasificacion: dos probabilidades (`q`, `act`) y un vector de logits para la etiqueta `kind`. La entrada se construye como par de secuencias (segmento anterior + segmento actual), lo que da al modelo un minimo de contexto conversacional dentro de una ventana de 128 tokens.

El entrenamiento se realizo exclusivamente con datos sinteticos: el conjunto `2026.10.25`, con 2.145 filas y sha256 `aec4a6d6be1a70d4c51bb98c3b18e39cae765dd9d41936c73cf356104589dea3`. La model card afirma de forma explicita que no se uso contenido real de reuniones, datos de clientes ni grabaciones para entrenar el modelo, calibrar los umbrales o redactar la ficha. No se documenta el uso de RLHF, DPO ni tecnicas de ajuste por preferencias, algo esperable en un clasificador de este tipo. Tampoco se detalla la composicion del dataset sintetico ni el proceso de generacion, lo que limita la reproducibilidad.

## Capacidades

- Clasificacion binaria de pregunta: decide si un segmento de transcripcion formula una pregunta (`q`, umbral 0,07).
- Deteccion de acciones y compromisos: decide si el segmento enuncia una accion, encargo o promesa (`act`, umbral 0,33).
- Tipado de la accion: devuelve logits sobre la clase de accion (`kind`); la model card no enumera las etiquetas disponibles.
- Contexto de pares: aprovecha el segmento anterior para desambiguar el actual, lo que ayuda con respuestas elididas y referencias pronominales.
- Bilinguismo fr/en: un unico modelo cubre ambos idiomas, con rendimiento medido por separado en las compuertas publicas.
- Inferencia local: el formato ONNX fp32 permite ejecucion en CPU sin GPU, requisito del caracter offline de la aplicacion.
- Salida probabilistica: al exponer probabilidades y umbrales fijos, el modelo se puede integrar en un pipeline con reglas de negocio posteriores.
- No soporta generacion de texto, tool calling, agentes, vision ni audio; es un clasificador de secuencias puro.

## Casos de uso

- Extraccion de *action items* en notas de reunion: el modelo marca que segmentos de la transcripcion contienen un compromiso o un encargo, de modo que la aplicacion puede construir una lista de tareas sin que el usuario revise toda la conversacion. Es adecuado porque opera sobre segmentos cortos y ya viene calibrado con umbrales publicados.
- Deteccion de preguntas abiertas: en un resumen de reunion, los segmentos etiquetados con `q` alta se agrupan como cuestiones pendientes de respuesta, lo que permite generar una seccion de "preguntas sin resolver" de forma automatica.
- Transcripcion a tareas en herramientas de gestion: el clasificador actua como primer filtro antes de crear entradas en Jira, Linear o Todoist, reduciendo el numero de tarjetas espurias frente a un detector basado solo en heuristicas.
- Procesamiento offline y privado: al ejecutarse en local sobre ONNX Runtime, encaja en despliegues donde la transcripcion no puede salir del dispositivo del usuario (legal, sanidad, recursos humanos). El entrenamiento exclusivamente sintetico refuerza este argumento.
- Enrutado previo a un LLM: en un pipeline hibrido, el clasificador descarta segmentos sin accion ni pregunta y solo envia al modelo generativo los candidatos, lo que reduce coste y latencia por reunion.
- Equipos bilingues frances-ingles: una misma organizacion puede usar un unico modelo en lugar de dos clasificadores monolingues, con F1 de acciones de 0,943 en ingles y 0,879 en frances en el conjunto `setB`.
- Control de calidad de transcripciones: midiendo la tasa de falsos positivos sobre segmentos sin accion (0 en los conjuntos `neg-en` y `neg-fr`), se puede detectar si el motor de speech-to-text esta degradando la calidad de la entrada.

## Benchmarks y rendimiento

Datos publicados en la model card. Las compuertas se midieron con el modelo fp32 en CPU, sobre *fixtures* versionados y conjuntos guionizados, comparadas con el detector basado en reglas (rules r3) que la aplicacion mantiene como respaldo. Los conjuntos `neg-*` solo reportan el numero de acciones falsas.

| Conjunto | n | q F1 | act F1 | act P | act R | Acciones falsas |
|---|---|---|---|---|---|---|
| setB-en model | 116 | 0,987 | 0,943 | 0,917 | 0,971 | - |
| setB-en rules r3 | 116 | 0,987 | 0,793 | 0,958 | 0,676 | - |
| setB-fr model | 116 | 0,974 | 0,879 | 0,906 | 0,853 | - |
| setB-fr rules r3 | 116 | 0,987 | 0,714 | 0,909 | 0,588 | - |
| neg-en model | 42 | - | - | - | - | 0 |
| neg-en rules r3 | 42 | - | - | - | - | 2 |
| neg-fr model | 42 | - | - | - | - | 0 |
| neg-fr rules r3 | 42 | - | - | - | - | 1 |
| f1script-en model | 38 | 1,000 | 0,875 | 0,875 | 0,875 | - |
| f1script-en rules r3 | 38 | 1,000 | 0,933 | 1,000 | 0,875 | - |
| f1script-fr model | 38 | 1,000 | 0,941 | 0,889 | 1,000 | - |
| f1script-fr rules r3 | 38 | 1,000 | 0,933 | 1,000 | 0,875 | - |
| f1whistle-en model | 38 | 0,923 | 0,889 | 0,800 | 1,000 | - |
| f1whistle-en rules r3 | 38 | 0,923 | 0,933 | 1,000 | 0,875 | - |
| f1whistle-fr model | 38 | 0,727 | 0,875 | 0,875 | 0,875 | - |
| f1whistle-fr rules r3 | 38 | 0,727 | 0,769 | 1,000 | 0,625 | - |

Lectura: el modelo supera claramente a las reglas en F1 de accion en `setB` (ingles y frances) y no produce acciones falsas en los conjuntos negativos, pero pierde frente a las reglas en `f1script-en` (0,875 frente a 0,933), en `f1whistle-en` (0,889 frente a 0,933) y empata en `f1script-fr`. La deteccion de preguntas es practicamente identica a las reglas, con una caida notable en `f1whistle-fr` (0,727 en ambos sistemas). No se publican resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark estandar de LLM, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en fp32; el repositorio completo pesa 1,4 GB. No se publican requisitos oficiales.
- GPU recomendadas: no es necesaria GPU. Cualquier GPU consumer con 2 GB o mas (GTX 1650, RTX 3050, RTX 4090) puede ejecutarlo, pero el caso de uso declarado es CPU.
- CPU: viable. Las compuertas publicas se midieron con el modelo fp32 en CPU, de modo que el autor valida explicitamente ese modo de despliegue.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Mobile y onnxruntime-web para integracion en aplicaciones de escritorio o moviles. No aplica vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo generativo.
- Latencia y throughput: no disponibles. Con 128 tokens de entrada y ~24 capas en fp32, se espera una latencia de decenas de milisegundos por segmento en CPU moderna, pero es una estimacion, no un dato publicado.
- Almacenamiento: 1,4 GB en disco para el repositorio completo, incluyendo el manifiesto de integridad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 accion (setB-en) | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| unfold-insights-xlmr-fren | no disponible (base ~560 M, vocabulario podado) | 128 tokens | 0,943 | MIT | ONNX fp32, HuggingFace |
| Detector de reglas r3 (incluido en la app) | 0 | no aplica | 0,793 | propietario, dentro de la aplicacion | integrado en Unfold Note |
| FacebookAI/xlm-roberta-large sin ajustar | ~560 M | 514 tokens | no disponible (no es un clasificador de acciones) | MIT | safetensors, HuggingFace |
| Clasificadores multilingues tipo XLM-R base ajustados a extraccion de acciones | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa real disponible es contra el detector de reglas, que es el *baseline* declarado por el autor. Frente a un LLM generativo que hiciera la misma tarea, este modelo gana en coste, latencia y privacidad, pero no hay una comparacion publicada de calidad. No se han identificado en la informacion proporcionada otros clasificadores especializados en deteccion de *action items* en reuniones con los que contrastarlo.

## Limitaciones y advertencias

- Entrenamiento solo con datos sinteticos (2.145 filas): el dominio cubierto es estrecho y no hay garantia de que las distribuciones sinteticas representen jerga real, acentos, code-switching ni vocabulario de sector.
- Debilidad declarada en segmentos cortos, informales y ruidosos de speech-to-text, que es precisamente el regimen tipico de una transcripcion automatica.
- Ventana de 128 tokens por par: acciones repartidas en varios turnos o con contexto lejano pueden quedar fuera y perderse.
- Umbrales fijos (q 0,07, act 0,33) calibrados sobre datos sinteticos; en produccion pueden requerir recalibracion con datos propios, lo que invalida las cifras de F1 publicadas.
- Solo frances e ingles; cualquier otro idioma queda fuera del vocabulario podado y producira tokenizacion degradada.
- No hay metricas publicadas para la cabeza `kind`: se desconoce la calidad del tipado de acciones.
- Las compuertas son *report-only*: una version puede publicarse por debajo de las reglas en algun conjunto y la aplicacion mantiene las reglas como respaldo. El rendimiento publicado no es, por tanto, una garantia contractual.
- Riesgo de falsos positivos en frases con verbos de accion usados de forma descriptiva ("ella dijo que lo haria"); el modelo no distingue compromiso del hablante frente a mencion de terceros, segun la informacion disponible.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion. No se declaran restricciones adicionales, pero conviene verificar la licencia del modelo base XLM-RoBERTa, tambien MIT.
- Dependencia funcional de la aplicacion Unfold Note: la model card indica una version minima de app 2.3.0, lo que sugiere que el modelo se distribuye como componente interno y no como servicio autonomo documentado.
- Descargas y *likes* a cero en el momento de la consulta: no hay evidencia de uso externo ni de validacion independiente por parte de la comunidad.
- Verificacion de integridad basada en `insights-model.json`; si se descarga fuera del cliente oficial, esa comprobacion no se aplica automaticamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unfold-labs/unfold-insights-xlmr-fren
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (referencia del modelo base): https://arxiv.org/abs/1911.02116
- Unfold: https://unfold.com/ (resultado de busqueda; no se ha confirmado la relacion con el autor `unfold-labs`)
- Unfold Pro: https://unfold.com/pro (resultado de busqueda; relacion no confirmada)
- Repositorio, demo, paper o blog oficial del modelo: no disponible en la informacion proporcionada.
