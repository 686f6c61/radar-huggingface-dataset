# Tonic/drone-detectonic-0.1-shufflenet_v2_x0_5-s42

## Resumen

El modelo `drone-detectonic-0.1-shufflenet_v2_x0_5-s42`, publicado por el usuario Tonic en Hugging Face, es un clasificador de imagenes basado en la arquitectura ShuffleNet V2 x0.5, exportado al formato ONNX para su ejecucion con ONNX Runtime. Por sus etiquetas (`acoustic-wake`, `c-uas`, `challenge-5`, `drone-detection`, `paris-hackathon-2026`), esta orientado a la deteccion de drones en el contexto de sistemas anti-UAS (counter-unmanned aerial systems), presumiblemente como parte de un reto o hackathon. El sufijo `s42` sugiere una semilla de entrenamiento fija (seed 42) y `0.1` una version temprana del artefacto.

La relevancia de este modelo es acotada: se trata de un artefacto de competicion con cero descargas y cero likes en el momento de la consulta, con el repositorio marcado como acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargar los pesos. No se dispone de informacion sobre el dataset de entrenamiento, el pipeline declarado ni los idiomas soportados. El tamano del repositorio aparece como 0.0 GB, lo que puede indicar que los pesos no estan publicos o que el campo no se ha rellenado correctamente.

ShuffleNet V2 x0.5 es una CNN ligera disenada para eficiencia computacional en dispositivos con recursos limitados, con aproximadamente 1,4 millones de parametros en su variante x0.5 para clasificacion ImageNet. En este caso, el numero de clases de salida y la naturaleza exacta de la tarea (clasificacion de imagenes, espectrogramas acusticos o ambas) no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ShuffleNet V2 x0.5 (CNN), exportada a ONNX |
| Parametros totales | no disponible (la variante x0.5 de ShuffleNet V2 ronda 1,4 M en configuracion ImageNet, pero no se confirma para este artefacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecucion via onnxruntime) |

## Arquitectura y entrenamiento

La arquitectura de referencia es ShuffleNet V2, una red neuronal convolucional que introduce el bloque de "channel split" y la operacion de shuffle de canales para reducir el coste de memoria y las operaciones de acceso a memoria, manteniendo una precision competitiva en tareas de clasificacion de imagenes. La variante x0.5 reduce el numero de canales a la mitad respecto a la version base, lo que la hace adecuada para inferencia en CPU o en dispositivos de borde. El artefacto publicado se distribuye como grafo ONNX, lo que permite su despliegue con ONNX Runtime sin necesidad de framework de entrenamiento.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de imagenes, la composicion de las clases, si hubo aumento de datos, fine-tuning desde pesos preentrenados de ImageNet, ni si se aplicaron tecnicas de destilacion o cuantizacion. Las etiquetas del repositorio mencionan `acoustic-wake`, lo que podria implicar que la entrada son espectrogramas de senales acusticas en lugar de imagenes RGB, pero esta hipotesis no se confirma en la informacion proporcionada. Tampoco hay datos sobre hiperparametros, epocas o metricas de validacion.

## Capacidades

- Clasificacion de imagenes o representaciones 2D (espectrogramas, mapas tiempo-frecuencia) mediante una CNN ligera, segun la arquitectura ShuffleNet V2 x0.5.
- Inferencia en formato ONNX con ONNX Runtime, lo que facilita el despliegue en entornos heterogeneos (CPU, GPU, edge).
- Deteccion de drones (etiqueta `drone-detection`) en el marco de sistemas anti-UAS (`c-uas`), presumiblemente como clasificador binario o multiclase.
- Posible uso en pipelines de wake-word o deteccion acustica (`acoustic-wake`), aunque no se especifica la modalidad de entrada.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, dado que no es un modelo de lenguaje.
- No se documenta modo "thinking", vision general, audio general ni otras capacidades mas alla de la clasificacion.

## Casos de uso

- Deteccion de drones en sistemas anti-UAS: el modelo puede integrarse como clasificador en un pipeline de vigilancia que procese imagenes o espectrogramas y emita una etiqueta de presencia de dron, aprovechando su bajo coste computacional para inferencia en tiempo real.
- Procesamiento en dispositivos de borde: al ser una CNN x0.5 exportada a ONNX, puede ejecutarse en hardware con recursos limitados (Raspberry Pi, Jetson Nano, moviles) para tareas de clasificacion continua sin conexion a la nube.
- Filtrado previo en pipelines de vision: usar el modelo como primera etapa para descartar falsos positivos antes de enviar imagenes a un detector mas pesado, reduciendo el coste total del sistema.
- Prototipado en hackathons y retos: el artefacto esta etiquetado con `paris-hackathon-2026` y `challenge-5`, por lo que sirve como punto de partida reproducible (semilla 42) para equipos que participen en retos similares.
- Clasificacion de espectrogramas acusticos: si la entrada es audio convertido a imagen, el modelo puede emplearse para distinguir firmas acusticas de drones frente a ruido de fondo en entornos urbanos.
- Integracion en servicios REST con ONNX Runtime: el grafo ONNX puede servirse con ONNX Runtime Server o envolverse en un microservicio para clasificacion bajo demanda en aplicaciones de monitorizacion.
- Evaluacion comparativa de arquitecturas ligeras: util como baseline de referencia para comparar ShuffleNet V2 x0.5 frente a MobileNet, EfficientNet-Lite u otras CNN ligeras en tareas de deteccion de drones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano tipico de ShuffleNet V2 x0.5 (aprox. 1,4 M parametros), el modelo en FP32 ocuparia del orden de 5-6 MB, pero no se confirma el tamano real del grafo ONNX publicado.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para esta arquitectura; se puede ejecutar en CPU y en GPUs de gama baja (GTX 1650, RTX 3050) sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (declarado en las etiquetas), y por extension cualquier runtime compatible con ONNX como OpenVINO, TensorRT (previa conversion) o DirectML.
- Latencia y throughput estimados: no disponibles; para una CNN de este tamano se esperan latencias de milisegundos en CPU moderna, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drone-detectonic-0.1-shufflenet_v2_x0_5-s42 | no disponible (aprox. 1,4 M en variante x0.5 ImageNet) | no aplica | Clasificacion (deteccion de drones) | Apache 2.0 | Gated en Hugging Face |
| ShuffleNet V2 x0.5 (referencia original) | aprox. 1,4 M | no aplica | Clasificacion ImageNet | BSD (codigo original) | Publico en repos de referencia |
| MobileNet V2 | aprox. 3,4 M | no aplica | Clasificacion ImageNet | Apache 2.0 | Publico |
| EfficientNet-Lite0 | aprox. 4,7 M | no aplica | Clasificacion ImageNet | Apache 2.0 | Publico |

La comparativa se limita a arquitecturas de referencia, ya que no se dispone de datos de rendimiento especificos del artefacto ni de otros modelos comparables entrenados para deteccion de drones en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en automatizaciones o entornos de CI.
- Documentacion inexistente: no hay model card con detalles de entrenamiento, clases, metricas ni limitaciones, lo que impide evaluar su calidad de forma rigurosa.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- Posibles sesgos del dataset: al desconocerse la composicion de los datos de entrenamiento, no se pueden descartar sesgos de dominio (condiciones de iluminacion, tipos de dron, entornos geograficos) que degraden el rendimiento fuera de la distribucion de entrenamiento.
- Riesgo de alucinacion: en un clasificador, el equivalente es la falsa deteccion o la confusion entre clases; sin metricas de precision/recall no se puede cuantificar.
- Limitaciones de modalidad: si el modelo espera espectrogramas y se alimenta con imagenes RGB (o viceversa), el rendimiento sera deficiente; la modalidad de entrada no esta documentada.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de garantias del autor deben tenerse en cuenta en produccion.
- Contexto de hackathon: el sufijo `s42` y las etiquetas `challenge-5` y `paris-hackathon-2026` sugieren un artefacto experimental, no un modelo listo para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Tonic/drone-detectonic-0.1-shufflenet_v2_x0_5-s42
- Tonic App (posible entidad autora, no confirmada): https://tonicapp.fr/
- Tonic Web: https://web.tonicapp.com/fr
- ToNIC (Toulouse NeuroImaging Center, no relacionado confirmado): https://tonic.inserm.fr/
