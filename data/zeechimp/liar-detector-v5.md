# zeechimp/liar-detector-v5

## Resumen

liar-detector-v5 es un modelo de deteccion de senales "mentirosas" desarrollado por Sylv Q (usuario zeechimp en HuggingFace). Dado un par de senales 1-D alineadas (A, B), el modelo predice simultaneamente tres cosas: cual de las dos senales ha sido distorsionada, que tipo de distorsion presenta (6 familias) y si existe o no alguna manipulacion. No se trata de un detector de mentiras humano ni de un modelo de lenguaje, sino de una herramienta de investigacion sobre verificacion de integridad de senales y deteccion de anomalias sin referencia externa.

La arquitectura es un perceptron multicapa (MLP) multi-cabeza con un tronco compartido de aproximadamente 19.500 parametros. La entrada es un vector fijo de 44 caracteristicas extraidas del par (A, B), por lo que no procesa texto ni audio en bruto: el pipeline declarado en HuggingFace es audio-classification, pero la model card especifica que la entrada es numerica. El modelo se entrena desde cero (no hay fine-tuning de un modelo base) sobre senales sinteticas generadas como suma de tres sinusoides con ruido gaussiano aditivo.

Su relevancia es acotada y muy especifica: sirve como banco de pruebas reproducible para tecnicas de clasificacion multi-cabeza con calibracion por temperatura, para experimentos de generalizacion fuera de distribucion (OOD) y como componente en pipelines de fusion de sensores donde una de las fuentes puede estar manipulada. Con 19.500 parametros y licencia Apache 2.0, es un modelo de coste computacional practicamente nulo que puede ejecutarse en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP multi-cabeza (3 cabezas, tronco compartido, adaptador de presencia) |
| Parametros totales | ~19.500 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada fija de 44 caracteristicas; no es un modelo de contexto) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; el modelo es lo bastante pequeno para ejecutarse en float32 en CPU) |
| Idiomas soportados | No aplica (entrada numerica); el repositorio declara `en` como etiqueta de idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio) y PyTorch; tamano del repositorio 0,0 GB |

Detalle de la arquitectura segun la model card:

| Componente | Detalle |
|---|---|
| Entrada | Vector de 44 caracteristicas extraido de (A, B) |
| Tronco | Linear(44→96) → ReLU → Linear(96→64) → ReLU |
| Cabeza binaria | Linear(64→2): que flujo miente (0 = A, 1 = B) |
| Cabeza de familia | Linear(64→6): tipo de distorsion |
| Adaptador de presencia | Linear(64→64) → ReLU → Linear(64→64) |
| Cabeza de presencia | Linear(64→2): hay alguna mentira presente |
| Framework | PyTorch + Transformers |

## Arquitectura y entrenamiento

El modelo es un MLP totalmente conectado con un tronco comun y tres cabezas de clasificacion. La particularidad estructural es que la cabeza de presencia no comparte directamente la representacion final del tronco: entre el tronco y su clasificador hay un adaptador aprendido de dos capas (64→64). El autor justifica este diseno argumentando que las caracteristicas que discriminan "que flujo difiere" no son las mismas que discriminan "si algun flujo difiere", de modo que la cabeza de presencia necesita una remapeo propio en lugar de competir con las cabezas binaria y de familia por la misma representacion.

La entrada se construye a partir de 44 caracteristicas artesanales agrupadas en siete bloques: momentos crudos (media, log-desviacion tipica, asimetria y curtosis de ambos flujos, 8 caracteristicas), referencia canonica (`abs_mean_A - abs_mean_B` y `log_std_ratio_canonical`, 2), caracteristicas de diferencia (momentos pareados, 6), estadisticas de residuo (momentos, autocorrelacion y correlacion cruzada, 12), regresion (pendiente del residuo y varianza explicada, 2), firmas sin referencia (cuantizacion, escalonamiento, inversion y suavidad, 10) y unicidad (ratios de fraccion unica, 4). No hay ningun modulo de atencion ni estado recurrente.

Los datos de entrenamiento son senales 1-D sinteticas: sumas de tres sinusoides con frecuencias entre 0,01 y 0,15 Hz y amplitudes entre 0,5 y 2,0, con ruido gaussiano aditivo de desviacion tipica `U(0,05; 0,15) * std(x)`. Las distorsiones en distribucion (ID) son `offset`, `scale`, `saturation`, `quantization`, `lag` y `harmonic`; las familias fuera de distribucion (OOD) son `deadzone`, `dropout`, `drift` e `inversion`. El procedimiento fue de 200 epocas, tamano de lote 64, optimizador AdamW (lr = 3e-3, weight_decay = 1e-5) y funcion de perdida de entropia cruzada enmascarada: las cabezas binaria y de familia solo se entrenan con pares de mentira unica, mientras que la cabeza de presencia se entrena con todos los pares usando pesos de clase `[1,47; 0,76]` para compensar el reparto 66/34 entre escenarios. La calibracion se hizo con escalado de temperatura ajustado por cabeza sobre una particion retenida del 20 %.

## Capacidades

- Clasificacion binaria de flujo: determinar cual de las dos senales alineadas ha sido manipulada, con una exactitud declarada del 88,2 % en distribucion.
- Clasificacion de tipo de distorsion en 6 familias: `offset`, `scale`, `saturation`, `quantization`, `lag` y `harmonic`, con una exactitud declarada del 92,3 % en distribucion.
- Deteccion de presencia: determinar si existe alguna manipulacion en el par, con una exactitud declarada del 71,5 % en distribucion.
- Deteccion sin referencia externa: no requiere una senal de referencia para comparar, solo el par (A, B).
- Calibracion de probabilidades: cada cabeza incorpora escalado de temperatura, con valores de ECE declarados de 0,091 (binaria), 0,224 (familia) y 0,143 (presencia) en distribucion.
- Generalizacion fuera de distribucion en la cabeza binaria: 92,8 % de exactitud agregada frente a las cuatro familias OOD no vistas durante el entrenamiento.
- Capacidades multilingues: no aplica.
- Soporte de tool calling, function calling o agentes: no disponible (no se documenta ninguna de estas capacidades).
- Capacidades especiales (modo thinking, vision, audio nativo): no aplica; la etiqueta `audio-classification` del repositorio no implica procesamiento de audio en bruto, ya que la entrada real es un vector de 44 caracteristicas.

## Casos de uso

- Verificacion de integridad en fusion de sensores: en un pipeline donde dos sensores miden la misma magnitud fisica, el modelo puede senalar cual de las dos lecturas ha sido alterada y de que forma, sin necesidad de una referencia de calibracion externa.
- Deteccion de manipulacion en telemetria: sobre series temporales de telemetria alineadas por pares, permite marcar tramos con sesgo aditivo, saturacion o desplazamiento temporal, util para auditoria de datos.
- Banco de pruebas para investigacion en deteccion de anomalias: al ser un modelo de ~19.500 parametros entrenado sobre datos sinteticos controlados, sirve como linea base reproducible para comparar metodos de deteccion de anomalias sin referencia.
- Evaluacion de generalizacion OOD: las cuatro familias no vistas (`deadzone`, `dropout`, `drift`, `inversion`) permiten medir la robustez de la cabeza binaria ante distorsiones nuevas sin reentrenar.
- Demostracion educativa de clasificacion multi-cabeza: el diseno con tronco compartido, adaptador dedicado y calibracion por temperatura es un ejemplo didactico de arquitectura con varias tareas y ajuste de calibracion.
- Preprocesado en cadenas de verificacion de audio o sensores: como etapa previa de filtrado, marcando pares de senales sospechosos antes de un analisis mas costoso, con un coste computacional despreciable.
- Filtrado de datos en la construccion de datasets: descartar o etiquetar pares de senales sinteticas o instrumentadas que presentan distorsiones conocidas antes de usarlos en entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y en el model-index del repositorio. Todos figuran con `verified: false`, es decir, no han sido verificados de forma independiente.

En distribucion (ID):

| Condicion | Exactitud | ECE |
|---|---|---|
| Binaria (que flujo miente) | 88,2 % | 0,091 |
| Familia (tipo de distorsion) | 92,3 % | 0,224 |
| Presencia (alguna mentira) | 71,5 % | 0,143 |

Exactitud binaria por familia (ID):

| Familia | Exactitud |
|---|---|
| offset | 95,8 % |
| scale | 57,4 % |
| saturation | 100,0 % |
| quantization | 76,0 % |
| lag | 99,4 % |
| harmonic | 99,4 % |

Fuera de distribucion (OOD):

| Familia | Exactitud binaria |
|---|---|
| deadzone | 93,6 % |
| dropout | 96,8 % |
| drift | 90,4 % |
| inversion | 90,4 % |

Exactitud binaria OOD agregada: 92,8 % (ECE 0,148).

No se han publicado resultados de latencia, throughput ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en float32 (aproximadamente 78 KB para 19.500 parametros). El cuello de botella real es la extraccion de las 44 caracteristicas, no la red.
- GPU recomendadas: ninguna en particular; el modelo es ejecutable en CPU sin problema.
- Cabe en GPU de consumo: si, en cualquier GPU, e incluso en dispositivos de borde y microcontroladores con suficiente memoria para el runtime de PyTorch o una exportacion ligera.
- Opciones de despliegue: el repositorio usa PyTorch y Transformers; el tamano permite tambien exportacion a ONNX u otros formatos ligeros. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y en general estos servidores no estan pensados para este tipo de modelo.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones). Dado el numero de parametros, la inferencia por muestra es de orden muy bajo, pero no se aporta ninguna cifra concreta.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros detectores de integridad de senales ni con modelos de la misma categoria, y no se dispone de datos verificables de alternativas con los que establecer una comparacion rigurosa.

## Limitaciones y advertencias

- No es un detector de mentiras humano: la model card excluye explicitamente su uso sobre habla o texto de personas.
- Entrenado exclusivamente con senales sinteticas: no ha sido validado con datos de sensores del mundo real.
- La exactitud binaria en la familia `scale` en distribucion es de solo 57,4 %, muy por debajo del resto de familias (el resto oscila entre 76 % y 100 %). Es el punto debil mas claro del modelo.
- La cabeza de familia presenta la peor calibracion, con un ECE de 0,224 en distribucion; las probabilidades de esa cabeza deben tratarse con cautela.
- La exactitud de deteccion de presencia es la mas baja de las tres tareas: 71,5 % en distribucion.
- Las familias OOD solo se evaluan con la cabeza binaria; no hay resultados de familia ni de presencia para `deadzone`, `dropout`, `drift` e `inversion`.
- ECE OOD de la cabeza binaria de 0,148, superior al 0,091 en distribucion: la calibracion se degrada ante distorsiones no vistas.
- Todos los resultados declarados estan marcados como no verificados.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no genera texto), pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, especialmente en las familias con menor exactitud.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero la propia model card desaconseja tomar decisiones de alto riesgo sin una adaptacion de dominio extensa.
- El repositorio tiene 0 descargas y 1 "like", y su tamano declarado es 0,0 GB; se trata de un artefacto de investigacion sin adopcion contrastada.
- La model card disponible esta truncada en la seccion de limitaciones conocidas, por lo que puede haber advertencias adicionales del autor no recogidas aqui.
- La etiqueta `en` del repositorio puede inducir a error: el modelo no procesa texto y su entrada es puramente numerica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeechimp/liar-detector-v5
- Perfil del autor en HuggingFace: https://huggingface.co/zeechimp

Nota: la busqueda web realizada no devolvio ningun enlace relevante relacionado con el modelo, su arquitectura, su entrenamiento o su evaluacion. Todos los resultados obtenidos eran ajenos al contenido tecnico de esta ficha y no se incluyen.
