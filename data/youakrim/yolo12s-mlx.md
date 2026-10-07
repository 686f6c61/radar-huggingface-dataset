# youakrim/yolo12s-mlx

## Resumen

yolo12s-mlx es una conversión de los pesos oficiales de Ultralytics YOLO12s entrenados sobre COCO (9,3 millones de parámetros) al formato NumPy `.npz` que consume [yolo12-mlx](https://github.com/youakrim/yolo12-mlx), una implementación de YOLO12 sobre Apple MLX. Lo publica el usuario youakrim y su única aportación es la conversión de la disposición de tensores (de OIHW a OHWI): no hay reentrenamiento ni ajuste fino, los pesos son idénticos a los del modelo base Ultralytics/YOLO12.

El problema que resuelve es la ausencia de una vía nativa para ejecutar detección de objetos YOLO12 en Apple Silicon fuera de PyTorch/MPS. Según las mediciones del autor sobre un Apple M5 a 640x640 y lote 1, la implementación MLX en bf16 tarda 15,19 ms por imagen frente a los 19,23 ms de PyTorch MPS en fp16, con una precisión prácticamente idéntica en COCO val2017 (0,4757 de mAP50-95 en MLX frente a 0,4756 en PyTorch).

Es relevante para desarrolladores que despliegan detección de objetos en Mac con GPU integrada y quieren evitar la dependencia de CUDA, aunque su utilidad en producción está condicionada por la licencia AGPL-3.0 heredada de Ultralytics. El repositorio es de publicación reciente (octubre de 2026), con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO12 (familia Ultralytics); detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 9,3 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos, no generativo) |
| Tipos de cuantizacion | no se distribuyen pesos cuantizados; la model card reporta ejecucion en fp32 y bf16 |
| Idiomas soportados | no aplica (modelo de vision); la informacion disponible no declara idiomas |
| Licencia | AGPL-3.0 (heredada de Ultralytics YOLO12) |
| Formato de pesos | NumPy `.npz` con layout OHWI, convertido desde los pesos oficiales `.pt` |
| Tarea | object-detection |
| Modelo base | Ultralytics/YOLO12 |
| Dataset de evaluacion | detection-datasets/coco (COCO val2017, 5000 imagenes) |
| Resolucion de entrada reportada | 640x640 con preprocesado letterbox |
| Libreria / backend | MLX (Apple Silicon) |
| Tamano del repositorio en HuggingFace | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: parte de los pesos oficiales de Ultralytics YOLO12s para COCO, ya entrenados, y los convierte de la disposición de tensores OIHW (propia de PyTorch) a OHWI (la que espera la implementación en MLX). No hay por tanto información sobre número de tokens, composición del dataset de entrenamiento, fases de RLHF/DPO ni innovaciones de entrenamiento en la información proporcionada. Los detalles de la arquitectura interna de YOLO12 (bloques, mecanismos de atención, diseño de la cabeza de detección) tampoco se describen en la model card y se marcan como no disponibles.

Lo que sí está documentado es la equivalencia funcional entre backends: misma entrada (letterbox 640), mismo postprocesado (NMS con confianza 0,001, IoU 0,7 y máximo 300 detecciones) y misma herramienta de medida (pycocotools) para ambas implementaciones. La conversión preserva la precisión dentro del margen de redondeo (0,4757 frente a 0,4756 de mAP50-95), lo que respalda que el único cambio es el layout de memoria de los tensores.

## Capacidades

- Deteccion de objetos en imagenes sobre 80 clases de COCO, con cajas delimitadoras y puntuaciones de confianza.
- Inferencia nativa en Apple Silicon mediante MLX, con precision numerica equivalente a la implementacion oficial en PyTorch.
- Ejecucion en fp32 y bf16 sobre GPU de Apple (Metal), con sincronizacion de GPU para medir latencias fiables.
- Salida compatible con el ecosistema de evaluacion COCO (pycocotools), lo que permite reproducir la validacion sobre val2017.
- Integracion con la CLI `yolo12mlx.predict` del repositorio GitHub, que recibe un fichero de imagen y parametros de escala y numero de clases.
- Uso de los mismos umbrales de NMS que la implementacion de referencia (conf 0,001, IoU 0,7, max 300 detecciones).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multimodales generativas, modo thinking, audio ni procesamiento de lenguaje: es exclusivamente un detector visual.

## Casos de uso

- Prototipado en Mac sin CUDA: un desarrollador puede clonar el repositorio y ejecutar `python -m yolo12mlx.predict yolo12s-coco.npz image.jpg --scale s --nc 80` para validar un pipeline de deteccion en un portatil o Mac mini con Apple Silicon, sin GPU dedicada.
- Servicio de inferencia en un Mac Studio o Mac mini como nodo de borde: con 15,19 ms por imagen en bf16 sobre M5, el modelo sostiene del orden de 65 imagenes por segundo por instancia en esa GPU, adecuado para flujos de camara con moderado paralelismo.
- Anonimizacion de imagenes en aplicaciones de escritorio macOS: detectar las clases `person` y vehiculos de COCO para aplicar desenfoque antes de subir un archivo a un servicio externo, manteniendo el procesamiento en local.
- Preprocesado de catalogos y activos digitales: etiquetado automatico de fotos por las 80 clases de COCO como paso previo a un sistema de busqueda o a un indexador de imagenes.
- Analisis de imagenes en investigacion sobre MLX: comparar el rendimiento de MLX frente a PyTorch MPS con las mismas condiciones de preprocesado y NMS, usando pycocotools como referencia neutral.
- Control de calidad visual en pequenas lineas de produccion: contar o localizar objetos dentro de las clases COCO (por ejemplo, botellas o sillas) siempre que el dominio de interes coincida con dichas categorias; para clases personalizadas haria falta reentrenar.
- Base para experimentacion en deteccion sobre Apple Silicon: al ser pesos identicos a los oficiales, sirve como punto de partida reproducible para medir el efecto de cambios en la implementacion MLX sin confundirlo con variaciones de entrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (marcados como `verified: false`). Evaluacion sobre COCO val2017 con 5000 imagenes, letterbox 640, NMS con confianza 0,001 e IoU 0,7, maximo 300 detecciones y puntuacion con pycocotools.

| Backend | mAP50-95 | mAP50 |
|---|---|---|
| MLX (este repositorio) | 0,4757 | 0,6436 |
| PyTorch (oficial `.pt`) | 0,4756 | 0,6436 |

Latencia declarada (solo forward del modelo, sin NMS ni E/S), Apple M5, 640x640, lote 1, mediana de 100 ejecuciones tras calentamiento y con GPU sincronizada:

| Backend | ms por imagen |
|---|---|
| MLX fp32 | 19,38 |
| MLX bf16 | 15,19 |
| PyTorch MPS fp32 | 25,69 |
| PyTorch MPS fp16 | 19,23 |

No se han publicado en la informacion disponible otros benchmarks (por ejemplo, comparaciones con YOLOv8s o YOLO11s) ni mediciones sobre otros chips distintos del M5.

## Requisitos de hardware

- Plataforma obligatoria: macOS sobre Apple Silicon con MLX. No hay soporte declarado para CUDA, ROCm ni CPU generica a traves de este repositorio.
- GPU medida por el autor: Apple M5, con 15,19 ms por imagen en bf16 y 19,38 ms en fp32 (640x640, lote 1, sin NMS ni E/S).
- Throughput derivado de esas latencias (calculo aritmetico, no publicado como tal): aproximadamente 66 imagenes por segundo en bf16 y 52 en fp32 para una sola instancia en M5.
- Memoria de pesos estimada a partir de los 9,3 M de parametros (calculo propio, no declarado): en torno a 37 MB en fp32 y 19 MB en bf16, mas activaciones. La VRAM real de inferencia no esta publicada.
- Cabe sin problema en cualquier Mac con Apple Silicon, incluidos modelos con memoria unificada de 8 GB; no es un modelo que requiera GPU de datacenter tipo A100 o H100 (que, ademas, no son compatibles con MLX).
- Opciones de despliegue: repositorio `yolo12-mlx` en GitHub (scripts de setup, descarga del `.npz` y modulo `yolo12mlx.predict`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un detector de objetos.
- Escalado horizontal: al desplegarse sobre nodos Apple Silicon, el escalado se realiza replicando instancias en varios equipos en lugar de repartir el modelo entre varias GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP50-95 (COCO val2017) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| youakrim/yolo12s-mlx | 9,3 M | 640x640, lote 1 | 0,4757 (MLX, declarado) | AGPL-3.0 | HuggingFace + GitHub yolo12-mlx |
| Ultralytics YOLO12s (PyTorch oficial) | 9,3 M | 640x640, lote 1 | 0,4756 (declarado) | AGPL-3.0 | Pesos oficiales Ultralytics |
| Otras variantes de la coleccion YOLO12 for MLX (n, m, l, x) | no disponible | no disponible | no disponible | no disponible | Coleccion de HuggingFace del mismo autor |
| YOLOv8s / YOLO11s | no disponible | no disponible | no disponible | no disponible | no incluidos en la informacion proporcionada |

La comparacion directa disponible es la del mismo conjunto de pesos ejecutado en dos backends: la implementacion MLX reproduce la precision de PyTorch y reduce la latencia un 24,6 % en fp16/bf16 (15,19 ms frente a 19,23 ms) y un 24,6 % tambien en fp32 (19,38 ms frente a 25,69 ms) en el M5 medido.

## Limitaciones y advertencias

- Licencia AGPL-3.0 heredada de Ultralytics: impone obligaciones de copyleft, incluida la clausula de uso en red cuando el modelo se expone como servicio. Para integrarlo en productos propietarios hace falta una licencia comercial de Ultralytics.
- Solo detecta las 80 clases de COCO. No reconoce categorias fuera de ese vocabulario y requeriria reentrenamiento para dominios especificos (industrial, medico, agricola).
- No hay reentrenamiento ni ajuste: los pesos son identicos a los oficiales, por lo que heredan sus sesgos, sus falsos positivos y sus falsos negativos sin ninguna correccion adicional.
- Dependencia estricta de Apple Silicon y MLX: no es portable a CUDA ni a CPU generica a traves de este repositorio.
- Las metricas y latencias estan declaradas por el autor y marcadas como `verified: false`; no han pasado una validacion independiente.
- El repositorio tiene 0 descargas y 0 likes: no existe evidencia de uso comunitario ni de despliegues en produccion.
- Las cifras de latencia excluyen NMS y E/S, por lo que el coste extremo a extremo de un pipeline real sera mayor que los 15,19 ms en bf16.
- Las comparaciones con otras implementaciones solo son validas si se replican exactamente el letterbox 640, la confianza 0,001, el IoU 0,7, el maximo de 300 detecciones y el uso de pycocotools.
- En deteccion de objetos no aplica la alucinacion en sentido generativo, pero si el riesgo de cajas espurias o de objetos no detectados en escenas con oclusion, baja iluminacion o dominios alejados de COCO.
- Fechas de publicacion y actualizacion en HuggingFace: 7 de octubre de 2026, con apenas 18 segundos de diferencia entre creacion y ultima modificacion, lo que sugiere un repositorio sin mantenimiento posterior documentado.

## Enlaces

- HuggingFace: https://huggingface.co/youakrim/yolo12s-mlx
- Repositorio de la implementacion MLX: https://github.com/youakrim/yolo12-mlx
- Coleccion YOLO12 for MLX: https://huggingface.co/collections/youakrim/yolo12-for-mlx-6ac659ef0a06781003d1d3cc
- Modelo base: https://huggingface.co/Ultralytics/YOLO12
- Dataset de evaluacion: https://huggingface.co/datasets/detection-datasets/coco
