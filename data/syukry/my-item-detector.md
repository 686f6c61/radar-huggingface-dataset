# Syukry/my-item-detector

## Resumen

My Item Detector es un modelo de deteccion de objetos desarrollado por el usuario Syukry en el contexto del bootcamp CodingBN (sesiones 14 y 15). Se trata de un fine-tuning del modelo base YOLO26n de Ultralytics sobre un conjunto de datos propio de aproximadamente 50 fotografias tomadas por el autor y etiquetadas manualmente en Roboflow. El modelo esta disenado para reconocer 16 clases de utensilios y electrodomesticos de cocina, desde cubiertos y menaje hasta pequenos electrodomesticos como freidoras de aire, microondas o hervidores.

El modelo se publica con la libreria Ultralytics y el pipeline de object-detection, y su relevancia es fundamentalmente didactica: sirve como ejemplo de flujo completo de entrenamiento de un detector (captura de imagenes, etiquetado, fine-tuning y publicacion) mas que como herramienta lista para produccion. El autor reconoce explicitamente que el conjunto de datos es muy reducido y proviene de una sola habitacion y un solo telefono, lo que limita severamente su generalizacion.

No se dispone de informacion sobre arquitectura detallada, numero de parametros, contexto (no aplica a un detector) ni resultados de benchmarks; la model card incluso deja un marcador de posicion ("add your mAP50 here") en lugar de la metrica de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), fine-tuning de deteccion de objetos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 (o licencia Enterprise de Ultralytics) |
| Formato de pesos | no disponible (repo de 0.0 GB en el momento de la consulta) |

## Arquitectura y entrenamiento

El modelo parte de YOLO26n, la variante "nano" de la familia YOLO26 de Ultralytics, una arquitectura de deteccion de objetos en una sola etapa (single-stage detector) pensada para inferencia en tiempo real. El fine-tuning se realizo sobre aproximadamente 50 fotografias tomadas por el propio autor y etiquetadas en Roboflow, con 16 clases de utensilios de cocina: Air Fryer, Blender, Bowl, Can opener, Chopstick, Fork, Knife, Ladle, Microwave, Peeler, Pot, Rice Cooker, Scissor, Spoon, Water Heater y Water Steamer.

No se dispone de informacion sobre el numero de tokens (no aplica), la composicion exacta del dataset, el numero de epochs, la resolucion de entrada, el uso de aumentacion de datos ni de tecnicas de regularizacion. Tampoco se documenta si se aplico alguna innovacion tecnica adicional mas alla del fine-tuning estandar de Ultralytics. El propio autor advierte que el entrenamiento se realizo con imagenes de una sola habitacion y un solo telefono, lo que constituye la principal limitacion del modelo.

## Capacidades

- Deteccion de objetos en imagenes para 16 clases de utensilios y electrodomesticos de cocina.
- Localizacion con cajas delimitadoras (bounding boxes) sobre las clases entrenadas.
- Inferencia en tiempo real gracias a la arquitectura YOLO26n (variante ligera).
- Integracion con el ecosistema Ultralytics (API de Python, CLI, exportacion a formatos como ONNX, TensorRT o TFLite, segun la libreria).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo "thinking", vision multimodal generativa ni audio.

## Casos de uso

- Prototipado educativo de deteccion de objetos: sirve para demostrar el flujo completo de captura, etiquetado en Roboflow, fine-tuning con Ultralytics y publicacion en Hugging Face, adecuado para cursos y bootcamps.
- Demostracion de inventario domestico en un entorno controlado: el modelo puede identificar utensilios de cocina en fotografias tomadas en condiciones similares a las del entrenamiento (misma habitacion, iluminacion y dispositivo).
- Prueba de concepto de automatizacion de inventario: como base para experimentar con pipelines de conteo de objetos en imagenes de cocina, siempre que se amplie el dataset antes de cualquier uso real.
- Evaluacion comparativa de modelos YOLO: util como caso de estudio de las limitaciones de entrenar con datasets muy pequenos (50 imagenes) frente a modelos preentrenados en COCO.
- Ejercicio de despliegue en el edge: la variante nano de YOLO26 permite probar la exportacion e inferencia en dispositivos de baja potencia como Raspberry Pi o moviles, aunque la precision del modelo sera limitada.
- Base para ampliacion de dataset: el modelo y su configuracion pueden reutilizarse como punto de partida para reentrenar con un conjunto de imagenes mucho mayor y mas diverso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un marcador de posicion ("add your mAP50 here") en lugar de la metrica de precision media (mAP50), por lo que no es posible evaluar cuantitativamente el rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de una variante nano de YOLO, la huella es reducida (tipicamente por debajo de 1 GB en FP16 para modelos YOLO nano, aunque este dato no se confirma en la informacion proporcionada).
- GPU recomendadas: no disponible en la informacion; por la naturaleza del modelo (YOLO26n), es esperable que funcione en GPUs consumer, pero no se documenta.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: ecosistema Ultralytics (Python, CLI); exportacion a otros formatos sujeta a la libreria. No se documentan opciones como vLLM, llama.cpp u Ollama (no aplican a un detector).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Syukry/my-item-detector | no disponible (YOLO26n) | no aplica | mAP50 no publicado | AGPL-3.0 | Hugging Face, 0 descargas |
| YOLO26n (Ultralytics, base) | no disponible en la informacion | no aplica | no disponible en la informacion | AGPL-3.0 / Enterprise | Repositorio Ultralytics |
| YOLOv8n (Ultralytics) | no disponible en la informacion | no aplica | no disponible en la informacion | AGPL-3.0 / Enterprise | Repositorio Ultralytics |

La comparativa cuantitativa no es posible con los datos proporcionados: no se dispone de parametros, mAP ni latencia del modelo ni de sus alternativas en la informacion disponible. La diferencia principal frente a los modelos base de Ultralytics es que este modelo esta especializado en 16 clases de cocina, mientras que los modelos COCO cubren 80 clases genericas.

## Limitaciones y advertencias

- Dataset extremadamente pequeno (aproximadamente 50 imagenes) y homogeneo (una sola habitacion, un solo telefono), lo que provoca fallos previsibles ante cambios de fondo, iluminacion u objetos distintos.
- El modelo solo reconoce las 16 clases entrenadas; cualquier otro objeto se ignora o se clasifica erroneamente.
- Riesgo elevado de falsos positivos y falsos negativos por sobreajuste al entorno de captura.
- No es apto para uso en sistemas criticos de seguridad ni para produccion comercial, segun advierte el propio autor.
- Licencia AGPL-3.0: el uso comercial requiere cumplir las condiciones de la AGPL o adquirir una licencia Enterprise de Ultralytics.
- No se han publicado metricas de rendimiento (mAP50 pendiente), por lo que no es posible verificar su calidad de forma objetiva.
- El repositorio figura con 0.0 GB y 0 descargas en el momento de la consulta, lo que sugiere que los pesos pueden no estar disponibles o no haber sido verificados.
- No se documentan sesgos especificos, pero al entrenarse con un unico entorno domestico, el modelo hereda los sesgos de ese contexto (tipos de utensilios, marcas, disposicion).

## Enlaces

- Hugging Face: https://huggingface.co/Syukry/my-item-detector
- Ultralytics (libreria y modelos YOLO): https://github.com/ultralytics/ultralytics
- Roboflow (plataforma de etiquetado citada por el autor): https://roboflow.com
- CodingBN (bootcamp donde se entreno el modelo): no disponible como enlace en la informacion proporcionada
- Paper o blog del modelo: no disponible
