# sugiv/call-gate-risk-score

## Resumen

Call Gate Risk Score es un modelo de clasificación de texto publicado por el usuario sugiv en HuggingFace. No es un transformer ni una red neuronal profunda: se trata de una regresión logística de diez números (un sesgo más nueve pesos) que convierte las respuestas de Jev, un modelo System One de TypeSafe, sobre un mensaje de voz en una única probabilidad de que se trate de una llamada robotizada fraudulenta ("robocall junk"). Forma parte de Call Gate, un sistema personal que filtra llamadas toll-free no deseadas del buzón de voz de un iPhone con Google Fi.

El modelo resuelve un problema de calibración, no de representación. Jev ya responde ocho preguntas tipadas sobre la transcripción (si cita dígitos de tarjeta, si empuja a hablar con un agente, si presiona, etc.), pero su veredicto global es inestable: en la misma alerta bancaria sintética osciló entre 0,26 y 0,61 de legitimidad entre ejecuciones y versiones, mientras que cada respuesta de evidencia se mantuvo dentro de ±0,03. Esta capa aprende cuánto debe pesar cada respuesta sobre los datos concretos del problema, y lo hace con diez parámetros que se reentrenan en milisegundos.

Es relevante porque demuestra un patrón de diseño poco habitual: usar un modelo generativo solo como extractor de señales acotadas y delegar la decisión final en un clasificador lineal auditable, recalibrado con etiquetas propias, que se sitúa antes de una capa de reglas de política que ningún modelo puede sobrescribir. Con 534 ejemplos de entrenamiento alcanza un AUC de 0,9999 en validación cruzada, frente al 0,989 del veredicto bruto de Jev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (1 sesgo + 9 pesos) sobre respuestas de Jev |
| Parametros totales | 10 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; consume 9 caracteristicas derivadas de una transcripcion ya procesada por Jev |
| Tipos de cuantizacion | no disponible (los pesos son numeros en JSON) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | JSON (`scorer-weights.json`) |

## Arquitectura y entrenamiento

La arquitectura es una regresion logistica estandar con funcion sigmoide: P(junk) = 1 / (1 + e^-(bias + suma de peso x respuesta)). Las nueve caracteristicas son las respuestas de Jev a preguntas de evidencia: `catJunk` (P(scam) + P(marketing)), `agent`, `pressure`, `sales`, `selfAssert`, `specific`, `protected`, `official` y `catLegit`. Los pesos aprendidos son: sesgo +0,693, `catJunk` +1,700, `agent` +1,512, `pressure` +0,556, `sales` +0,508, `selfAssert` -0,005, `specific` -0,792, `protected` -1,107, `official` -1,303 y `catLegit` -1,959. El umbral de retencion es tau = 0,90. Los pesos de atestacion STIR y de llamante recurrente estan fijados a 0 porque esos metadatos no existen en los datos de entrenamiento.

El entrenamiento se hizo sobre el conjunto `sugiv/call-gate-robocalls`, compuesto por 300 robocalls reales de la FTC (procedentes de NC State), 230 llamadas sinteticas escritas con DeepSeek (130 legitimas y 100 basura) y 4 llamadas reales etiquetadas. Cada transcripcion se proceso con la misma peticion a Jev que envia el Worker de produccion (`code/training/featurize.ts`), lo que supone 16 segundos y unos 0,02 dolares para las 534 llamadas. El ajuste usa descenso de gradiente por lotes con regularizacion L2 de 0,01, y pondera los ejemplos legitimos por 3 porque perder una alerta real cuesta mas que dejar pasar un robocall. La validacion es una validacion cruzada de 5 pliegues que atraviesa el codigo de politica de produccion: cada llamada la puntua un modelo que nunca la vio y el umbral se reeligе dentro de cada pliegue.

La innovacion tecnica destacable no es arquitectonica sino de diseno del sistema: el uso de un modelo System One (Jev) como extractor de caracteristicas estables y la separacion explicita entre veredicto y decision, con un clasificador lineal interpuesto que es auditable (cada puntuacion se descompone en contribuciones por caracteristica) y reentrenable de forma nocturna a partir de etiquetas de un solo toque. El autor documenta que caracteristicas intuitivamente sospechosas, como `selfAssert` ("insiste en que es legitimo"), acaban con peso casi nulo (-0,005) porque los avisos reales tambien lo dicen, lo que ilustra que son los datos, y no la intuicion, los que fijan las senales.

## Capacidades

- Clasificacion binaria de riesgo: produce una probabilidad de que un mensaje de voz sea un robocall fraudulento.
- Puntuacion calibrada y auditable: cada resultado se desglosa en contribuciones por caracteristica.
- Recalibracion por dominio: sesgo y pesos se reajustan con etiquetas propias del despliegue.
- Integracion con politicas: se situa antes de reglas de seguridad que no puede sobrescribir.
- Deteccion basada en tacticas, no en palabras: las caracteristicas describen tacticas (empujar a un agente, presion, oferta, ausencia de detalles, ausencia de canal oficial), por lo que generaliza a guiones nuevos que reutilizan las mismas tacticas.
- Entrenamiento incremental: con diez parametros, el reentrenamiento se completa en milisegundos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo de pensamiento (thinking mode), vision ni audio.
- No es multilingue: solo ingles.
- No es un clasificador de texto autonomo: requiere las respuestas de Jev a las ocho preguntas de evidencia definidas en `code/worker/src/jev.ts`.

## Casos de uso

- Filtrado de buzon de voz personal: el modelo puntua cada transcripcion generada por Deepgram y decide si notificar, avisar o retener el mensaje, con la regla de que un aviso que dice proceder del banco, farmacia, medico o colegio nunca se retiene.
- Investigacion de fuga de datos: los pesos revelan que senales predicen realmente el fraude en el corpus (por ejemplo, `agent` con +1,512 pesa mas que `pressure` con +0,556), lo que permite priorizar que tacticas auditar en campanas reales.
- Prototipado rapido de clasificadores de fraude: sirve como plantilla de arquitectura "modelo generativo como extractor + capa lineal calibrada" para otros dominios de moderacion o deteccion de abuso con pocos ejemplos etiquetados.
- Reentrenamiento nocturno con etiquetas de un toque: un operador marca llamadas retenidas como legitimas o basura y el modelo se reajusta esa misma noche, ya que el coste de ajuste es despreciable.
- Auditoria y cumplimiento: al ser una regresion logistica de diez parametros, cada decision se puede reconstruir y explicar ante un tercero, algo inviable con un modelo generativo.
- Analisis de coste por inferencia: el paso de featurizacion cuesta aproximadamente 0,02 dolares por 534 llamadas, lo que permite estimar el presupuesto de un despliegue mayor antes de invertir en infraestructura.
- Generacion de datos de evaluacion: junto con el conjunto `sugiv/call-gate-robocalls` y el codigo de featurizacion, permite reproducir el pipeline completo y medir variantes del umbral o de las reglas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor si publica evaluacion propia con validacion cruzada de 5 pliegues fuera de muestra:

| Enfoque | Legitimos retenidos (de 130) | Basura retenida (de 404) |
|---|---|---|
| Solo veredicto de Jev, umbral 0,90 | 1 | 313 |
| Solo veredicto de Jev, umbral 0,97 | 0 | 254 |
| Veredicto de Jev + reglas de seguridad | 0 | 139 |
| Pesos fijados a mano + reglas de seguridad | 0 | 9 |
| Este modelo + reglas de seguridad | 0 | 161 |

Metricas de separacion sobre las mismas 534 llamadas:

| Metrica | Veredicto de Jev (P(scam) + P(marketing)) | Este modelo |
|---|---|---|
| AUC | 0,989 | 0,9999 |
| Ejemplo legitimo mas sospechoso | 0,94 | 0,56 |
| Llamadas basura por encima de todo ejemplo legitimo | 289 de 404 | 399 de 404 |

El autor senala que relajar la proteccion de "cita detalles especificos" para llamantes no protegidos llegaria a 249 llamadas basura retenidas sin retener ninguna legitima, pero ese candidato queda pendiente de etiquetas reales porque solo existen 20 ejemplos legitimos no protegidos. La model card esta truncada en la seccion "Validation: is AUC ≈ 1.00 too good to be true?", donde empieza a discutir tres sospechas (memorizacion, fuga de datos y aprendizaje de atajos) pero el texto disponible termina en "The obvious shortcut".

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo son diez numeros en un JSON. Cabe en cualquier dispositivo, incluido un movil o un entorno serverless.
- GPU recomendadas: no requiere GPU. La carga computacional real esta en el paso previo (Jev), no en este modelo.
- Compatibilidad con GPU de consumo: si, en cualquier GPU e incluso en CPU.
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. Se integra como codigo propio dentro del Worker de Call Gate.
- Latencia y throughput: no disponibles para el clasificador de forma aislada. El dato publicado es que la featurizacion de 534 llamadas con Jev tardo 16 segundos y costo aproximadamente 0,02 dolares, y que Jev responde las ocho preguntas en una sola llamada de unos 0,2 segundos.
- Dependencia de hardware externo: el cuello de botella es Deepgram (transcripcion) y Jev (featurizacion), no esta capa.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables publicados de forma independiente (clasificadores de robocalls calibrados sobre respuestas de un modelo System One). La comparacion relevante esta dentro del propio sistema:

| Enfoque | Parametros | Contexto | Rendimiento (basura retenida de 404, 0 legitimos retenidos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo + reglas | 10 | no aplica | 161 | apache-2.0 | HuggingFace |
| Veredicto de Jev solo (umbral 0,97) | no disponible | no disponible | 254, pero con 1 legitimo retenido a 0,90 | propietaria de TypeSafe | API de TypeSafe |
| Pesos fijados a mano + reglas | 10 | no aplica | 9 | no aplica | interno |
| Clasificador de texto generico (BERT, DistilBERT y similares) | 66 M - 110 M | 512 tokens | no disponible | variable | HuggingFace |

Frente a un clasificador transformer generico de la misma tarea, este modelo no compite en representacion del lenguaje: no procesa texto directamente, sino las salidas estructuradas de Jev. Su ventaja es el coste de mantenimiento y la auditabilidad; su desventaja es la dependencia total de Jev y de la calidad de sus respuestas.

## Limitaciones y advertencias

- No es autonomo: sin las respuestas de Jev a las ocho preguntas de evidencia no produce ninguna prediccion. No puede usarse como text-classification al uso pese a estar etiquetado con ese pipeline_tag.
- Tamano muestral reducido: 534 ejemplos en total, 134 de ellos legitimos (130 sinteticos y 4 reales). El propio autor advierte de que un AUC de 0,9999 debe levantar sospechas de sobreajuste, fuga de datos o aprendizaje de atajos.
- Solo ingles: el modelo esta etiquetado unicamente para `en`; no hay evidencia de comportamiento en otros idiomas.
- Dependencia de la version de Jev: si TypeSafe actualiza o recalibra Jev, los pesos aprendidos pueden dejar de ser validos y requeririan reentrenamiento.
- Sin metadatos de atestacion: los pesos de STIR y de llamante recurrente estan a 0 porque esos datos no aparecian en el entrenamiento, lo que deja senales potencialmente utiles sin explotar.
- Umbral fijado heuristicamente: tau = 0,90 se elige como el valor mas bajo que no retiene ningun ejemplo legitimo de entrenamiento mas un margen de 0,02, con un minimo de 0,90. Es una decision de politica, no un optimo estadistico.
- Riesgo de sesgo del corpus: 300 de los 534 ejemplos son robocalls reales de la FTC y 230 son sinteticos generados por DeepSeek, por lo que la distribucion no refleja el trafico real de un usuario concreto.
- Falsos negativos con coste: de la basura que el veredicto de Jev capturaria con umbral 0,97, 33 llamadas afirman proceder de un banco o proveedor sanitario y 66 citan detalles concretos, por lo que las reglas de seguridad las dejan pasar a proposito.
- Descargas y likes a cero: el modelo no tiene adopcion publica ni validacion por terceros en el momento de la consulta.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el componente Jev es un servicio propietario de TypeSafe y su uso queda sujeto a las condiciones de ese proveedor.
- Idiomas y region: la ficha esta marcada con `region:us`, sin garantias de comportamiento fuera de ese contexto telefonico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sugiv/call-gate-risk-score
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/sugiv/call-gate-robocalls
- Documentacion de System One de TypeSafe (concepto de Jev): https://docs.typesafe.ai/concepts/system-one
- Codigo de featurizacion citado en la model card: `code/training/featurize.ts`
- Definicion de las ocho preguntas de evidencia de Jev: `code/worker/src/jev.ts`
- Corpus de robocalls de la FTC (NC State): no disponible como enlace directo en la informacion proporcionada
