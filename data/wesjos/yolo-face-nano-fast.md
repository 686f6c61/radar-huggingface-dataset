# wesjos/yolo-face-nano-fast

## Resumen

`yolo-face-nano-fast` es un conjunto de cuatro detectores de rostros a escala nano publicados por el usuario wesjos en Hugging Face, construidos sobre la librería Ultralytics. Incluye pesos entrenados con las arquitecturas YOLOv8n, YOLO11n, YOLO26n y YOLOv5nu, todos con una única clase `face`, entrada fija de 320×320 píxeles y un recetario de entrenamiento idéntico, lo que permite compararlos directamente entre sí. El objetivo es disponer de un detector de caras extremadamente ligero (entre 2,53 y 3,14 millones de parámetros) para escenarios donde el rostro ocupa una porción grande de la imagen.

El modelo resuelve el problema de la detección de rostros en entornos con recursos limitados: fotos de carné, avatares, capturas de control de acceso o retratos recortados. Frente a detectores genéricos de objetos, estos pesos están especializados en una sola clase y optimizados para inferencia a 320×320, lo que reduce el coste computacional (1,48–2,19 GFLOPs) y permite alcanzar entre 156 y 228 FPS en una RTX 4090 en FP16 con el pipeline completo (preprocesado, forward y NMS).

La relevancia actual radica en su ligereza y en la comparativa controlada entre cuatro generaciones de YOLO nano: los cuatro modelos presentan diferencias de precisión no significativas estadísticamente (intervalos de confianza al 95% que cruzan cero en un bootstrap pareado de 1000 rondas), por lo que la elección se reduce a velocidad y tamaño. La licencia es AGPL-3.0, heredada de Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (cuatro variantes: YOLOv8n, YOLO11n, YOLO26n, YOLOv5nu) |
| Parametros totales | 3,138 M (yolov8n) / 2,605 M (yolo11n) / 2,534 M (yolo26n) / 2,636 M (yolov5nu) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 320×320) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de Ultralytics; se puede exportar a otros formatos vía Ultralytics, pero no se documentan cuantizaciones específicas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (Ultralytics/PyTorch) |

## Arquitectura y entrenamiento

Los cuatro modelos son detectores de objetos de la familia YOLO en escala nano, con una única clase de salida (`face`). Cada variante corresponde a una generación distinta de la arquitectura: YOLOv8n (3,138 M parámetros, 2,19 GFLOPs), YOLO11n (2,605 M, 1,63 GFLOPs), YOLO26n (2,534 M, 1,48 GFLOPs) y YOLOv5nu (2,636 M, 1,93 GFLOPs; se trata del port de Ultralytics del YOLOv5n, no del modelo original de 1,77 M). Todos operan con entrada fija de 320×320 píxeles y salida de cajas delimitadoras con puntuación de confianza.

El entrenamiento se realizó con un recetario idéntico para los cuatro modelos: 150 épocas, batch de 256, `imgsz=320`, optimizador automático (MuSGD con lr 0,01 cuando las iteraciones superan 10000), aumentación por defecto (mosaic 1.0, scale 0.5, fliplr 0.5, con mosaic desactivado en las últimas 10 épocas), semilla 0 y `deterministic=True`, sobre Ultralytics 8.4.211 y torch 2.11.0+cu130. El tiempo de entrenamiento por modelo fue de 41 a 49 minutos en una RTX 4090.

El conjunto de datos consta de 23.150 imágenes de entrenamiento con 24.575 cajas y 5.797 imágenes de validación con 6.146 cajas, sumando 30.721 cajas. La mayoría de las imágenes son nativas de 320×320 (25.845 de 28.947), sin redimensionado en entrenamiento ni validación. Las etiquetas fueron producidas por un detector automático, no verificadas caja por caja manualmente. El split es el oficial y se verificó que no hubiera imágenes duplicadas entre train y val mediante md5 y hash perceptual.

## Capacidades

- Detección de rostros en imágenes con una única clase de salida (`face`), devolviendo cajas delimitadoras y puntuaciones de confianza.
- Funciona bien cuando el rostro ocupa una porción grande del encuadre: en las demos, las cajas cubren entre el 12,4% y el 21,6% del frame, con confianzas entre 0,933 y 0,960.
- Entrada fija de 320×320 píxeles, lo que simplifica el pipeline y reduce el coste computacional.
- Inferencia en CPU y GPU mediante la librería Ultralytics, tanto por Python (`YOLO(...).predict(...)`) como por CLI (`yolo predict ...`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector de objetos puro.
- No dispone de modo thinking, visión general, audio ni otras capacidades más allá de la detección de caras.

## Casos de uso

- **Fotos de carné y avatares**: el modelo está diseñado para imágenes donde el rostro ocupa una fracción grande del encuadre (12%–22% del frame en las demos). Se usaría para recortar o validar la presencia de una cara en fotos de perfil, con entrada directa a 320×320.
- **Control de acceso y capturas de puerta**: en capturas de cámaras de acceso con encuadre cercano, el detector localiza la cara con alta confianza (0,93–0,96 en las demos) y permite disparar el pipeline de reconocimiento facial posterior.
- **Preprocesado de retratos para pipelines de visión**: sirve como etapa de detección y recorte antes de un modelo de reconocimiento o de análisis facial, gracias a su bajo coste (1,48–2,19 GFLOPs) y a su velocidad (156–228 FPS en RTX 4090 en FP16).
- **Detección en dispositivos de borde o CPU**: al ser modelos nano con pesos de 5,5–6,5 MB, pueden ejecutarse en CPU o en hardware embebido para tareas de detección de caras en tiempo real con encuadre cercano.
- **Procesado por mosaico de imágenes grandes**: para imágenes de alta resolución con caras pequeñas, se puede dividir la imagen en teselas y ejecutar el modelo a 320×320 sobre cada una, evitando el redimensionado global que degrada la precisión.
- **Filtrado y moderación de contenido con rostros**: en plataformas que necesitan detectar la presencia de caras en imágenes subidas por usuarios (por ejemplo, para anonimización o para aplicar políticas de privacidad), el modelo ofrece una primera pasada rápida y ligera.
- **Generación de datasets sintéticos o etiquetado asistido**: al ser un detector automático entrenado sobre etiquetas también automáticas, puede usarse como etiquetador preliminar en conjuntos de imágenes con caras grandes, sujeto a revisión posterior.

## Benchmarks y rendimiento

Resultados medidos sobre el mismo conjunto de validación (5.797 imágenes / 6.146 cajas), `imgsz=320`, `conf=0.001`, métricas estilo COCO:

| Modelo | Fichero | Params | GFLOPs | Tamano | P | R | mAP50 | mAP50-95 | b1 (ms) | b1 FPS | b32 FPS |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `yolov8n-face320.pt` | 6,50 MB | 3,138 M | 2,19 | 6,5 MB | 0,9908 | 0,9796 | 0,9931 | **0,9142** | 4,39 | 228 | 3646 |
| `yolo11n-face320.pt` | 5,51 MB | 2,605 M | 1,63 | 5,5 MB | 0,9913 | 0,9789 | 0,9929 | **0,9147** | 5,59 | 179 | 3106 |
| `yolo26n-face320.pt` | 5,47 MB | 2,534 M | 1,48 | 5,5 MB | 0,9900 | 0,9797 | 0,9930 | **0,9140** | 6,41 | 156 | 2886 |
| `yolov5nu-face320.pt` | 5,53 MB | 2,636 M | 1,93 | 5,5 MB | 0,9927 | 0,9795 | 0,9932 | **0,9138** | 4,68 | 214 | 3580 |

- **Velocidad**: RTX 4090, FP16, pipeline completo incluyendo preprocesado, forward y NMS, mediana de 7 ejecuciones.
- **Precisión**: las diferencias por pares entre los cuatro modelos se evaluaron con un bootstrap pareado de 1000 rondas; todos los intervalos de confianza al 95% cruzan cero, por lo que no hay diferencia de precisión medible y la elección debe hacerse por velocidad y tamaño.
- **Recall por tamaño de caja**: ~0,73 para cajas ground-truth menores del 0,4% del frame; ~0,77 para el rango 0,4%–2%; 0,998 por encima del 10%.
- **Análisis de fallos**: el 88,5% de los fallos son ausencias completas de detección (no cajas imprecisas) y ~32% son detecciones por debajo de 0,25; bajar `conf` a ~0,15 recupera aproximadamente un tercio de ellas a costa de más falsos positivos.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; por el tamaño de los pesos (5,5–6,5 MB) y el número de parámetros (2,5–3,1 M), la huella en memoria es mínima y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- **GPU recomendadas**: RTX 4090 para las cifras de velocidad publicadas (156–228 FPS en FP16 con pipeline completo). Cualquier GPU moderna (A100, H100, RTX 3090, RTX 4060, etc.) puede ejecutar el modelo; no se publican cifras para otras GPU.
- **GPU consumer**: sí, cabe en cualquier GPU consumer actual e incluso en hardware de borde, dado el tamaño reducido de los pesos y los GFLOPs (1,48–2,19).
- **Opciones de despliegue**: librería Ultralytics (Python y CLI), con posibilidad de exportar a otros formatos compatibles con Ultralytics; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplican a un detector de objetos).
- **Latencia y throughput**: en RTX 4090 FP16, latencia por imagen de 4,39–6,41 ms (b1) y throughput de 156–228 FPS en b1 y 2.886–3.646 FPS en b32, según el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yolov8n-face320.pt` | 3,138 M | 320×320 | 0,9142 | AGPL-3.0 | Hugging Face (wesjos) |
| `yolo11n-face320.pt` | 2,605 M | 320×320 | 0,9147 | AGPL-3.0 | Hugging Face (wesjos) |
| `yolo26n-face320.pt` | 2,534 M | 320×320 | 0,9140 | AGPL-3.0 | Hugging Face (wesjos) |
| `yolov5nu-face320.pt` | 2,636 M | 320×320 | 0,9138 | AGPL-3.0 | Hugging Face (wesjos) |

No se dispone de datos de benchmarks de otros detectores de caras comparables en la información proporcionada, por lo que la comparativa se limita a las cuatro variantes incluidas en el repositorio.

## Limitaciones y advertencias

- **Entrada fija a 320**: ejecutar un modelo entrenado a 320 con entrada a 640 degrada el mAP50-95 de 0,914 a 0,775; no se debe reescalar la entrada.
- **Definición de la caja**: la caja corresponde a la región del rostro (de la línea del pelo al mentón), excluyendo la nuca y el cuello. Si el sistema posterior necesita una caja de cabeza completa, hay que redefinirla.
- **Débil en objetivos pequeños**: recall de ~0,73 para cajas ground-truth menores del 0,4% del frame y ~0,77 para el rango 0,4%–2%. Para caras pequeñas y lejanas hay que teselar la imagen o entrenar un modelo a 640.
- **Sesgo del conjunto de datos**: el set de entrenamiento está dominado por imágenes con una sola cara (solo el 5,5% tienen varias caras), por lo que las multitudes densas quedan fuera de distribución.
- **Etiquetas automáticas**: las etiquetas de entrenamiento fueron producidas por un detector automático y no verificadas caja por caja, lo que puede introducir ruido en los datos.
- **Riesgo de falsos positivos y negativos**: el 88,5% de los fallos son ausencias completas de detección; bajar el umbral de confianza a ~0,15 recupera parte de ellos a costa de más falsos positivos.
- **Licencia AGPL-3.0**: heredada de Ultralytics; el uso comercial está sujeto a las condiciones de esta licencia copyleft, lo que puede requerir liberar el código derivado o adquirir una licencia comercial de Ultralytics.
- **Sin datos de sesgo demográfico**: no se publican evaluaciones de sesgo por género, edad o etnia, ni métricas desagregadas por subgrupos.
- **No es un modelo de lenguaje**: no soporta contexto textual, tool calling, agentes ni capacidades multilingües; cualquier uso en esos terrenos queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/yolo-face-nano-fast
- Librería Ultralytics: https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales o demos más allá de los anteriores.
