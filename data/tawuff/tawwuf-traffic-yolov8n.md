# Tawuff/tawwuf-traffic-yolov8n

## Resumen

Tawuff/tawwuf-traffic-yolov8n es un modelo de deteccion de objetos basado en YOLOv8n (la variante "nano" de Ultralytics), afinado para detectar vehiculos en imagenes de trafico. Lo publica el usuario Tawuff en Hugging Face y esta pensado como modelo de investigacion y demostracion, no como componente de sistemas de seguridad. Detecta cuatro clases: `car`, `bus`, `truck` y `van`.

El modelo parte de los pesos preentrenados `yolov8n.pt` de Ultralytics y se afino sobre el dataset publico `thundarstrom/traffic-vehicle-detection`, un espejo de UA-DETRAC-10K-SAMPLE. El autor documenta de forma transparente una discrepancia entre el numero de imagenes declarado en la dataset card (23.319) y los pares imagen-etiqueta realmente utilizados en el entrenamiento (1.475 de entrenamiento, 369 de validacion y 971 de test), ademas de 6.588 ficheros de etiquetas huerfanos en el split de entrenamiento.

Es relevante por su transparencia metodologica y por sus metricas realistas: en el split de test reporta mAP@50 de 0,318 y mAP@50-95 de 0,220, cifras modestas que reflejan un modelo pequeno entrenado con pocos datos utiles. Sirve como linea base reproducible para deteccion de vehiculos, no como solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics), red neuronal convolucional de deteccion de objetos en una etapa |
| Parametros totales | no disponible (YOLOv8n es la variante nano de la familia; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato nativo de Ultralytics; exportable a ONNX/TensorRT/OpenVINO segun la libreria, no documentado por el autor) |
| Idiomas soportados | no aplica (deteccion de objetos; sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | pesos de Ultralytics (`.pt`); tamano del repo 0,0 GB segun la ficha de Hugging Face |

## Arquitectura y entrenamiento

YOLOv8n es un detector de objetos en una etapa con backbone convolucional, cuello de tipo PAN-FPN y cabeza de prediccion desacoplada, tal como lo implementa la libreria Ultralytics. El modelo se inicializa desde `Ultralytics/YOLOv8/yolov8n.pt` y se afina sobre el dataset de trafico fijado a la revision `7d0da22dbe8562fefe728f5b86df9b3d47bc358f`.

El entrenamiento utiliza solo pares imagen-etiqueta emparejados: 1.475 imagenes de entrenamiento, 369 de validacion y 971 de test, con 0 imagenes sin etiquetas en train y test, y 6.588 etiquetas huerfanas en el split de entrenamiento que se descartaron. El dataset declara licencia CC-BY-4.0 y procede de UA-DETRAC-10K-SAMPLE (v1-optimal), publicado por un usuario de Roboflow y replicado en `thundarstrom/traffic-vehicle-detection`. No se documentan tecnicas adicionales como aumento de datos, decodificacion especulativa ni etapas de RLHF/DPO (no aplicables a un detector).

## Capacidades

- Deteccion de objetos en imagenes de trafico con cuatro clases: `car`, `bus`, `truck` y `van`.
- Salida de cajas delimitadoras con puntuaciones de confianza por clase, en el formato estandar de Ultralytics.
- Inferencia sobre imagenes individuales o lotes mediante la libreria `ultralytics`.
- Exportacion a otros formatos de despliegue (ONNX, TensorRT, OpenVINO) segun las utilidades de Ultralytics, aunque el autor no lo documenta explicitamente.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual de deteccion.
- No dispone de modo "thinking", vision multimodal ni audio.

## Casos de uso

- Linea base para investigacion en deteccion de vehiculos: util para comparar tecnicas de aumento de datos o arquitecturas sobre un conjunto de datos de trafico pequeno y bien delimitado, dado que el autor publica las metricas del split de test.
- Prototipado de conteo de vehiculos en imagenes estaticas: permite validar rapidamente un pipeline de deteccion y conteo por clase antes de invertir en un modelo mayor o en datos propios.
- Etiquetado asistido (pre-anotacion): el modelo puede generar cajas candidatas para revision humana en herramientas de anotacion, reduciendo el esfuerzo manual en datasets de trafico.
- Demostraciones y docencia: su tamano nano y su licencia AGPL lo hacen adecuado para ejemplos educativos de deteccion de objetos con Ultralytics.
- Filtrado previo en pipelines de vision: como etapa de criba para descartar imagenes sin vehiculos antes de un modelo mas costoso.
- Pruebas de integracion con la libreria Ultralytics: verificar flujos de exportacion, inferencia por lotes y evaluacion con `model.val()` en entornos de desarrollo.
- No es adecuado para control de trafico operativo, senalizacion variable ni decisiones de seguridad, segun advierte el propio autor.

## Benchmarks y rendimiento

Metricas del split de test reportadas por el autor en la model card:

| Metrica | Valor |
|---|---|
| mAP@50 | 0,3185 |
| mAP@50-95 | 0,2196 |
| Precision | 0,4748 |
| Recall | 0,3205 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por la variante nano de YOLOv8, la huella es reducida y cabe en GPUs de consumo, pero el autor no publica cifras.
- GPU recomendadas: no disponibles; cualquier GPU compatible con PyTorch y Ultralytics deberia poder ejecutar el modelo.
- Cabe en GPU de consumo: previsiblemente si, al tratarse de la variante nano, aunque no hay datos oficiales en la ficha.
- Opciones de despliegue: libreria `ultralytics` (Python); exportacion a ONNX, TensorRT u OpenVINO segun las utilidades de Ultralytics, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tawuff/tawwuf-traffic-yolov8n | no disponible (variante nano) | no aplica | mAP@50 0,3185 en test | AGPL-3.0 | Hugging Face |
| Ultralytics YOLOv8n (base) | no disponible (variante nano) | no aplica | no disponible en esta ficha | AGPL-3.0 | Ultralytics |
| Otros detectores de trafico afinados sobre UA-DETRAC | no disponible | no aplica | no disponible | variable | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Rendimiento modesto: mAP@50 de 0,3185 y recall de 0,3205 indican que el modelo pierde una fraccion importante de vehiculos, especialmente en clases minoritarias.
- Entrenado con muy pocos pares utiles (1.475 imagenes de entrenamiento) y con 6.588 etiquetas huerfanas descartadas, lo que limita la cobertura del dominio.
- No validado en carreteras de Qatar, camaras gubernamentales, condiciones meteorologicas adversas ni control operativo de trafico, segun advierte el autor.
- No debe usarse para controlar senales de velocidad ni para decisiones de seguridad critica.
- Licencia AGPL-3.0: el uso comercial exige revision independiente de los terminos del dataset y del modelo, y la AGPL impone obligaciones de distribucion del codigo fuente en determinados escenarios.
- Riesgo de sesgo por el dataset de origen (UA-DETRAC), con posibles diferencias de dominio respecto a camaras, paises y condiciones de iluminacion no representadas.
- El repositorio figura con 0 descargas y 0 likes, y un tamano de 0,0 GB, lo que sugiere que los pesos podrian no estar disponibles o no haberse subido correctamente.
- Sin soporte linguistico ni de razonamiento: cualquier uso conversacional o agentico queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tawuff/tawwuf-traffic-yolov8n
- Dataset de entrenamiento: https://huggingface.co/datasets/thundarstrom/traffic-vehicle-detection
- Ultralytics (libreria y pesos base): https://github.com/ultralytics/ultralytics
- Articulo de referencia sobre deteccion y seguimiento de trafico con YOLOv8: https://medium.com/@maximejabarian/traffic-detection-tracking-with-yolov8-9e809d9484b8
