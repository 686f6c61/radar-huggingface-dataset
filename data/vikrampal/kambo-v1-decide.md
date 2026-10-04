# VikramPal/kambo-v1-decide

## Resumen

`kambo-v1-decide` es un modelo derivado de `VikramPal/kambo-v1`, desarrollado por el mismo autor, especializado en producir **decisiones tipadas** en lugar de texto generado. Dado un estado (un mensaje, un documento, una linea de log) y un conjunto de preguntas, el modelo devuelve una probabilidad para cada respuesta permitida. Es un ajuste fino del modelo base Kambo-v1, que segun las etiquetas de HuggingFace emplea una arquitectura de tipo mezcla de expertos (MoE), con un total de 1.691.197.184 parametros reales en formato safetensors y un repositorio de 3,4 GB.

La relevancia del modelo reside en que sustituye la generacion autoregresiva por una clasificacion sobre etiquetas de un solo token: cada opcion se puntua desde un unico vector de logits y todas las preguntas de una llamada comparten la misma codificacion del estado. Esto reduce el coste (cuatro preguntas sobre un mismo estado tardan unos 150 ms en una A100) y permite obtener distribuciones de probabilidad calibradas en lugar de selecciones duras. El modelo esta pensado para escenarios de enrutado, clasificacion de intenciones y triaje donde importa tanto la respuesta mas probable como la confianza asociada.

Kambo-v1-decide maneja tres tipos de pregunta: `Choice` (una pregunta con hasta 255 opciones, devuelve probabilidad por opcion y la mas probable), `Noul` (pregunta si/no, devuelve P(True)) y `Score` (pregunta con niveles ordenados, devuelve probabilidad por nivel y el nivel esperado). Solo esta entrenado y evaluado en ingles, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun las etiquetas del repositorio; detalle de capas y expertos no disponible |
| Parametros totales | 1.691.197.184 (aproximadamente 1,69 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se documentan cuantizaciones oficiales; pesos en safetensors (bf16/fp16 y fp32 maestro durante el entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `VikramPal/kambo-v1`, cuyo tag `mixture-of-experts` indica una arquitectura MoE. Segun la model card, el ajuste fino es completo sobre todos los pesos **excepto los routers de la MoE, que se congelan** para preservar el equilibrio de expertos aprendido en el preentrenamiento; la arquitectura en si no se modifica. La inferencia se realiza sobre etiquetas de un solo token: cada opcion recibe una etiqueta unica y se puntua a partir de un unico vector de logits, lo que permite puntuar todas las opciones de una pregunta en una sola pasada hacia delante.

El objetivo de entrenamiento combina dos terminos: entropia cruzada sobre las etiquetas de opcion unicamente, mas 0,1 x entropia cruzada de la etiqueta correcta sobre el vocabulario completo. El primer termino corresponde al log-score esperado de la distribucion de respuesta, lo que premia probabilidades calibradas y no solo el acierto top-1; el segundo mantiene masa de probabilidad sobre etiquetas validas. El regimen es de 2.500 pasos, tamano de lote 32 (80.000 ejemplos), optimizador AdamW (β = 0,9 y 0,95), tasa de aprendizaje 1e-5 con 100 pasos de calentamiento y decaimiento coseno, recorte de gradiente 1,0, autocast en bf16 con pesos maestros en fp32, y unas 2,1 horas en una A100 de 40 GB. Los datos provienen de hasta 8.000 ejemplos por fuente, solo splits de entrenamiento, recasteados como preguntas `Choice`, `Noul` o `Score`, con subsampleado y mezcla aleatoria de opciones; con probabilidad 0,15 se elimina la respuesta verdadera y "none of these" pasa a ser correcta. Entre las fuentes citadas aparecen MNLI y ANLI (r1-r3), entre otras.

## Capacidades

- Decisiones tipadas en tres formatos: `Choice` (eleccion entre hasta 255 opciones), `Noul` (probabilidad de si/no) y `Score` (probabilidad por nivel ordenado y nivel esperado).
- Salida de probabilidades calibradas por opcion, no solo la respuesta mas probable, con `confidence` (probabilidad top) y `label_mass` (proporcion de masa del siguiente token que cae en etiquetas validas).
- Puntuacion de multiples preguntas en una sola pasada: el estado se codifica una vez y se comparte entre todas las preguntas de la llamada.
- Deteccion de entrada fuera de dominio: con una opcion "none of these" presente, rechaza entradas no pertinentes (99,5% en el conjunto de prueba); sin ella, la confianza cae a 0,11 de media en entradas fuera de tema, lo que permite umbralizar.
- Correccion del sesgo de posicion: el `Decider` evalua cada pregunta en el orden dado y en orden inverso y promedia ambos resultados (se puede desactivar con `permute=False`).
- Calibracion opcional por temperatura y offsets por opcion, ajustables con datos etiquetados propios (`fit_temperature`, `fit_bias`).
- **No genera texto**: el modelo no esta disenado para generacion de lenguaje, codigo, matematicas ni vision.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- **Enrutado de tickets de soporte**: dada una queja de cliente, decidir a que equipo (facturacion, soporte tecnico, ventas) debe dirigirse con una pregunta `Choice`, aprovechando la probabilidad por opcion para desviar casos ambiguos a revision humana.
- **Clasificacion de intenciones bancarias**: sobre el conjunto Banking77 alcanza un 74,5% de acierto en 77 intenciones con una sola pasada por estado, lo que lo hace util para enrutar mensajes financieros a flujos automaticos.
- **Triaje de severidad o sentimiento**: usar preguntas `Score` (por ejemplo "que grado de enfado tiene el cliente" con niveles calmado/molesto/furioso) para priorizar colas de atencion segun el nivel esperado devuelto.
- **Moderacion y filtrado de dominio**: emplear la opcion "none of these" para rechazar entradas que no encajan con las categorias previstas (99,5% de rechazo en entradas fuera de tema), evitando clasificaciones forzadas.
- **Extraccion de decisiones si/no sobre documentos**: con preguntas `Noul` (por ejemplo, verificar si un texto afirma una condicion) para construir validadores deterministas dentro de un pipeline mayor.
- **Auditoria y monitorizacion con senal de confianza**: gracias a que la confianza separa entradas en dominio de las fuera de dominio (AUROC 0,97 con `confidence` y 0,98 con `label_mass`), se puede montar un sistema que derive a revision los casos con `label_mass` bajo.
- **Puntuacion por lotes de logs o registros**: al codificar el estado una sola vez y responder varias preguntas en una misma llamada, resulta adecuado para etiquetar grandes volumenes de lineas de log con multiples criterios simultaneos.

## Benchmarks y rendimiento

Resultados sobre 400 elementos de prueba por tarea, en una A100 en bf16. "Calibrado" implica temperatura mas offsets por opcion ajustados sobre una particion de desarrollo separada de 200 elementos de la misma tarea. La linea base es Kambo-v1 sin modificar, con los mismos prompts y codigo.

| Tarea | Relacion con el entrenamiento | Clase mayoritaria | Kambo-v1 | kambo-v1-decide | Decide calibrado |
|---|---|---|---|---|---|
| IMDB sentimiento (2 clases) | tarea nunca vista en entrenamiento | 52,0% | 68,5% | 86,8% | 86,0% (ECE 0,021) |
| BoolQ (si/no sobre un pasaje) | split de entrenamiento usado; test = validacion reservada | 59,0% | 59,0% | 67,8% | 70,5% |
| Banking77 (77 intenciones) | split de entrenamiento usado; test = test reservado | 2,7% | 2,5% | 74,5% | 75,3% |

Comportamiento fuera de dominio (pregunta Banking77 de 77 opciones formulada sobre 200 preguntas de trivia de SQuAD y sobre 200 mensajes bancarios reales):

| Metrica | Kambo-v1 | kambo-v1-decide |
|---|---|---|
| Entradas fuera de tema rechazadas con "none of these" | 16,0% | 99,5% |
| Mensajes bancarios respondidos con normalidad (con la opcion presente) | 73,5% | 86,5% |
| Confianza media en mensajes bancarios / fuera de tema (sin "none") | 0,04 / 0,04 | 0,79 / 0,11 |
| Entradas fuera de tema con confianza >= 0,9 | 0% | 0,5% |
| AUROC bancario vs fuera de tema usando confianza | 0,39 | 0,97 |
| AUROC bancario vs fuera de tema usando `label_mass` | 0,96 | 0,98 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de generacion, ya que el modelo no es generativo.

## Requisitos de hardware

- **VRAM estimada en inferencia**: con 1,69 mil millones de parametros, en bf16/fp16 el modelo ocupa aproximadamente 3,4 GB solo de pesos; en fp32, unos 6,8 GB; en int8, alrededor de 1,7 GB; en int4, en torno a 0,85 GB. Hay que sumar el coste de activaciones y del codificador del estado, no cuantificado en la informacion disponible.
- **GPU recomendadas**: el autor entrena y evalua en una A100 (40 GB). Una A100 o H100 no presentan problema; el modelo cabe con holgura.
- **GPU de consumo**: dado el tamano (~3,4 GB en bf16), es previsible que quepa en GPU de consumo con 8 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB), aunque el autor no documenta pruebas en estas tarjetas.
- **Opciones de despliegue**: requiere `transformers==4.53.2` y `torch` 2.x con codigo propio (`custom_code`, modulo `kambo_decide` con `Decider`, `Choice`, `Noul`, `Score`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al usar `custom_code` la integracion en otros runtimes no esta garantizada.
- **Latencia y throughput**: en una unica A100, cuatro preguntas sobre un mismo estado tardan unos 150 ms en una sola llamada; una pregunta de 77 opciones tarda aproximadamente lo mismo. No se documenta throughput por lotes.

## Comparativa con modelos similares

El unico comparable con datos publicados en la informacion disponible es el propio modelo base, `VikramPal/kambo-v1`, del que este modelo es un ajuste fino. No se proporcionan datos de otros modelos de decision o clasificacion comparables.

| Modelo | Parametros | Contexto | IMDB | BoolQ | Banking77 | Licencia |
|---|---|---|---|---|---|---|
| kambo-v1-decide | 1,69 mil millones | no disponible | 86,8% | 67,8% | 74,5% | apache-2.0 |
| Kambo-v1 (base) | 1,69 mil millones (mismo repo base) | no disponible | 68,5% | 59,0% | 2,5% | apache-2.0 (segun el modelo base) |

Comparativas con alternativas de la misma categoria (por ejemplo clasificadores tipo DeBERTa o modelos de enrutado MoE): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo generativo**: esta disenado exclusivamente para emitir decisiones tipadas; no debe usarse para generar texto, codigo o razonamiento.
- **Riesgo de alucinacion encubierta**: al puntuar opciones, puede asignar probabilidad alta a opciones incorrectas cuando la entrada no encaja con la pregunta; el propio autor recomienda vigilar `label_mass` baja como senal de fuera de distribucion.
- **Sesgo de posicion**: el modelo tiende a favorecer la opcion "A"; el `Decider` lo mitiga promediando orden directo e inverso, pero si se usa `permute=False` el sesgo reaparece.
- **Idioma**: solo ingles (`en`). No se documenta rendimiento en otros idiomas.
- **Sesgos de datos**: el entrenamiento usa MNLI, ANLI y otras fuentes en ingles, por lo que hereda los sesgos de esos corpus; no se documenta una evaluacion de sesgos.
- **Dependencia de codigo propio**: requiere `custom_code` y una version concreta de `transformers`, lo que puede complicar el despliegue en entornos gestionados.
- **Calibracion dependiente del dominio**: las probabilidades sin calibrar no son directamente interpretables; la calibracion debe ajustarse con datos etiquetados propios, y no se garantiza que generalice a otros dominios.
- **Madurez y soporte**: el repositorio tiene 0 descargas y 0 likes, y no se documenta mantenimiento, versionado ni comunidad; conviene tratarlo como experimental.
- **Licencia**: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Kambo-v1 del que deriva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VikramPal/kambo-v1-decide
- Modelo base: https://huggingface.co/VikramPal/kambo-v1
- No se han encontrado en la busqueda web enlaces relevantes (paper, blog, repositorio o demo) sobre este modelo; los resultados devueltos no guardan relacion con el modelo.
