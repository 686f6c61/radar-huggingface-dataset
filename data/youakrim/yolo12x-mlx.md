# youakrim/yolo12x-mlx

## Resumen

YOLO12x para MLX es una conversión de los pesos oficiales de Ultralytics YOLO12x (variante extra-large, 59,4 M de parámetros) entrenados sobre COCO, adaptados para ejecutarse con el framework MLX de Apple. Lo desarrolla el usuario youakrim y no introduce ningún reentrenamiento: únicamente se transforma la disposición de los tensores (de OIHW a OHWI) y se empaquetan en NumPy `.npz`, de modo que puedan consumirse desde la implementación `yolo12-mlx`.

Su relevancia es de nicho pero clara: permite ejecutar un detector de objetos de gama alta en Apple Silicon con aceleración por GPU mediante MLX, sin depender del stack de PyTorch. El modelo reproduce exactamente las métricas del checkpoint oficial en COCO val2017 (mAP50-95 de 0,5484 y mAP50 de 0,7150), lo que confirma que la conversión no degrada la precisión. En velocidad, sin embargo, la implementación MLX declarada por el autor todavía queda por detrás de PyTorch sobre MPS en fp16 (93,02 ms frente a 60,25 ms por imagen en un M5).

Se trata, por tanto, de una pieza de infraestructura más que de un modelo nuevo: útil para quien quiera integrar YOLO12x en un pipeline nativo de MLX, y con poco recorrido fuera del ecosistema Apple. La licencia AGPL-3.0, heredada de Ultralytics, es el principal condicionante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector YOLO12 (familia Ultralytics), centrado en atencion; la model card no detalla la topologia de capas |
| Parametros totales | 59,4 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, 640x640 en la configuracion evaluada) |
| Tipos de cuantizacion | No se publican variantes cuantizadas; los pesos se distribuyen en fp32 y la implementacion MLX admite ejecucion en fp32 y bf16 |
| Idiomas soportados | no aplica (modelo de deteccion de objetos; no procesa texto) |
| Licencia | AGPL-3.0 (heredada de Ultralytics YOLO12) |
| Formato de pesos | NumPy `.npz` con layout OHWI (compatible con MLX); no se distribuyen safetensors ni GGUF |
| Tarea | object-detection |
| Dataset de evaluacion | COCO val2017 (5000 imagenes) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | Ultralytics/YOLO12 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: es una conversion de pesos del checkpoint oficial YOLO12x de Ultralytics, un detector de objetos en tiempo real de la familia YOLO12, cuyo diseno gira en torno a mecanismos de atencion. La model card es explicita al respecto: "the weights are unchanged: only the tensor layout is converted (OIHW to OHWI). No retraining". Por tanto, no hay información sobre la composicion del dataset de entrenamiento, el numero de tokens o imagenes vistas, ni sobre fases de ajuste fino.

La unica innovacion tecnica documentada es la conversion de formato y su integracion en `yolo12-mlx`, la implementacion del autor sobre Apple MLX. La evaluacion se realizo con el mismo preprocesado en ambos backends (letterbox a 640, NMS con confianza 0,001, IoU 0,7 y maximo de 300 detecciones) y puntuacion mediante `pycocotools`, lo que permite una comparacion directa MLX frente a PyTorch. No se documentan tecnicas adicionales como decodificacion especulativa ni variantes de atencion lineal.

## Capacidades

- Deteccion de objetos en imagenes: devuelve cajas delimitadoras y clases sobre las 80 categorias de COCO.
- Inferencia local acelerada por GPU en Apple Silicon a traves de MLX, con soporte de fp32 y bf16.
- Ejecucion por linea de comandos mediante `python -m yolo12mlx.predict`, con parametros de escala (`--scale x`) y numero de clases (`--nc 80`).
- Equivalencia numerica con el checkpoint oficial: mismas puntuaciones mAP que la version PyTorch, segun los datos declarados por el autor.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de tipo vision-lenguaje.
- No incluye cabecera de segmentacion, pose ni clasificacion: unicamente deteccion.

## Casos de uso

- Vision por computador en aplicaciones macOS y iOS: al estar basado en MLX, el modelo puede integrarse en apps nativas de Apple Silicon para detectar objetos en el dispositivo, sin enviar imagenes a un servidor y sin depender de PyTorch.
- Pre-anotacion de datasets: el detector puede generar cajas candidatas sobre imagenes nuevas para que un anotador humano las revise, reduciendo el coste de etiquetado en proyectos de vision propios.
- Analisis de video de vigilancia: procesando fotogramas a 640x640, sirve para detectar personas y vehiculos en secuencias, con la salvedad de que a ~10,75 img/s en bf16 sobre un M5 el analisis en tiempo real de video de alta tasa exige muestrear fotogramas.
- Conteo y analitica en retail: deteccion de productos o personas en imagenes de estanteria y pasillos para estudios de ocupacion o disponibilidad, aprovechando las 80 clases de COCO para las categorias cubiertas.
- Inspeccion industrial y agricultura: localizacion de objetos de interes en imagenes de camara fija (por ejemplo, frutos o componentes), con la ventaja de poder ejecutarse en un Mac mini o portatil Apple como equipo de campo.
- Procesamiento por lotes en local: al ocupar el repositorio 0,2 GB y requerir una VRAM estimada inferior a 1 GB en bf16, se puede desplegar en un equipo de sobremesa para etiquetar grandes volumenes de imagenes sin coste de nube.
- Prototipado e investigacion en MLX: sirve como referencia para comparar el rendimiento de MLX frente a MPS en cargas de vision y para validar conversiones de pesos entre frameworks.
- Robotica y drones con control basado en Apple Silicon: deteccion de obstaculos u objetos a bordo, siempre que la latencia de ~93 ms por imagen en bf16 sea aceptable para el bucle de control.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, no verificados de forma independiente (`verified: false`). Evaluacion sobre COCO val2017 con 5000 imagenes, letterbox 640, NMS con confianza 0,001, IoU 0,7 y maximo 300 detecciones, puntuado con `pycocotools`.

| Backend | mAP50-95 | mAP50 |
|---|---|---|
| MLX (este repositorio) | 0,5484 | 0,7150 |
| PyTorch (`.pt` oficial) | 0,5484 | 0,7150 |

No se han publicado en la informacion disponible otros resultados de benchmarks (por ejemplo, por clase, por tamano de objeto o comparativas con otros detectores).

## Requisitos de hardware

- VRAM estimada: los 59,4 M de parametros ocupan aproximadamente 238 MB en fp32 y 119 MB en bf16, por lo que el modelo cabe holgadamente en cualquier GPU consumer actual; el repositorio completo pesa 0,2 GB.
- GPU recomendadas: Apple Silicon con soporte MLX (el autor mide sobre un M5). Para ejecutar el checkpoint oficial en PyTorch, cualquier GPU NVIDIA o Apple con MPS es suficiente.
- Compatibilidad consumer: si, en cualquier GPU con 2 GB o mas de memoria. No requiere A100 ni H100.
- Opciones de despliegue: MLX a traves del repositorio `yolo12-mlx` (unico backend documentado en la model card). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que ademas no aplican a un detector de objetos.
- Latencia medida por el autor (Apple M5, 640x640, batch 1, mediana de 100 ejecuciones tras calentamiento, GPU sincronizada, sin NMS ni E/S):

| Backend | ms por imagen |
|---|---|
| MLX fp32 | 123,97 |
| MLX bf16 | 93,02 |
| PyTorch MPS fp32 | 123,97 |
| PyTorch MPS fp16 | 60,25 |

- Throughput derivado de esas cifras: aproximadamente 10,75 imagenes/s en MLX bf16 y 8,07 imagenes/s en MLX fp32, en un unico M5 y sin contar el coste de NMS ni de entrada/salida. No se proporcionan datos para GPU NVIDIA.

## Comparativa con modelos similares

La informacion proporcionada solo cubre este repositorio y su modelo base. Las cifras de parametros y precision de las alternativas no forman parte de los datos disponibles, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | mAP50-95 (COCO val2017) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo12x-mlx (este repositorio) | 59,4 M | no aplica | 0,5484 | AGPL-3.0 | HuggingFace, formato `.npz` para MLX |
| Ultralytics YOLO12x (PyTorch) | 59,4 M (mismo checkpoint) | no aplica | 0,5484 (declarado identico) | AGPL-3.0 | Repositorio Ultralytics, `.pt` |
| Otras variantes YOLO12 convertidas a MLX (coleccion del autor) | no disponible | no aplica | no disponible | AGPL-3.0 | HuggingFace, coleccion "YOLO12 for MLX" |
| YOLOv8x / YOLO11x / RT-DETR | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

La comparacion relevante que si aportan los datos es interna: frente al mismo checkpoint en PyTorch, la version MLX iguala la precision y es mas lenta que PyTorch MPS en fp16 en el hardware medido.

## Limitaciones y advertencias

- Alcance funcional restringido: solo deteccion de objetos sobre las 80 clases de COCO; no hay segmentacion, pose, OCR ni descripcion de imagen.
- Sesgos del dataset: al no haberse reentrenado, hereda los sesgos de COCO (desequilibrio de clases, sobrerrepresentacion de escenas cotidianas occidentales, infrarrepresentacion de categorias poco frecuentes).
- Riesgo de falsos positivos y negativos: el NMS configurado con confianza 0,001 y hasta 300 detecciones esta pensado para maximizar el recall en evaluacion; en produccion habra que reajustar umbrales segun el caso de uso.
- Dependencia de plataforma: MLX solo funciona en Apple Silicon; no hay soporte de CUDA ni de CPU x86 documentado en este repositorio.
- Rendimiento no verificado: las metricas de la model card estan marcadas como `verified: false` y proceden del propio autor.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el codigo fuente de las obras derivadas que se distribuyan o se ofrezcan como servicio en red, y ademas puede requerir una licencia comercial de Ultralytics para determinados usos. Conviene revisarlo antes de integrarlo en un producto propietario.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y una unica conversion publicada recientemente; no hay evidencia de uso en produccion ni de mantenimiento a largo plazo.
- Idiomas y contexto: no aplica, pero implica que el modelo no puede combinarse con instrucciones en lenguaje natural mediante prompting, a diferencia de un modelo vision-lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youakrim/yolo12x-mlx
- Repositorio de la implementacion MLX: https://github.com/youakrim/yolo12-mlx
- Coleccion "YOLO12 for MLX" (otras escalas): https://huggingface.co/collections/youakrim/yolo12-for-mlx-6ac659ef0a06781003d1d3cc
- Modelo base: https://huggingface.co/Ultralytics/YOLO12
- Dataset de evaluacion: https://huggingface.co/datasets/detection-datasets/coco
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces recuperados correspondian a horarios de autobuses y se han descartado por no guardar relacion con la ficha.
