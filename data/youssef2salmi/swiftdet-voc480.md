# Youssef2Salmi/swiftdet-voc480

## Resumen

SwiftDet (nombre de despliegue SwiftDet-PConv-CPU) es un detector de objetos compacto basado en CNN, desarrollado por Youssef2Salmi y publicado como vista previa de investigación (v0.1.0). Está diseñado específicamente para inferencia en CPU a una resolución fija de 480×480 sobre las 20 clases del conjunto Pascal VOC. No es un detector de propósito general: su alcance está deliberadamente acotado al dominio VOC y a escenarios de despliegue con recursos limitados.

La arquitectura es propia y combina stems de downsampling QARepVGG con bloques PConv en el backbone, una agregación de features PAN (SlimPANPConv) y una cabeza desacoplada con Distribution Focal Loss (DecoupledGFLHead). El grafo fusionado exportado a ONNX contiene 1.725.980 parámetros, lo que lo sitúa en la categoría de modelos ultraligeros. La asignación de etiquetas se realizó con SimOTA y el entrenamiento se llevó a cabo desde cero sobre las particiones oficiales de Pascal VOC 2007 y 2012 (16.551 imágenes).

Su relevancia actual reside en el nicho de detección de objetos en entornos sin GPU: el modelo se distribuye como ONNX estático para el `CPUExecutionProvider` de ONNX Runtime, con una variante cuantizada INT8 que apenas pierde precisión respecto a FP32. Es un artefacto útil para benchmarking de latencia en CPU y para experimentos de despliegue, no un sistema certificado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN custom: backbone SwiftDetBackbone (QARepVGG + PConv), neck SlimPANPConv, cabeza DecoupledGFLHead |
| Parámetros totales | 1.725.980 (grafo fusionado de despliegue); 1.776.716 (grafo de entrenamiento) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 480×480) |
| Tipos de cuantización | FP32 e INT8 QDQ (ONNX) |
| Idiomas soportados | en (metadato de la model card; la tarea es visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX estático (FP32 e INT8 QDQ) |
| Entrada | `images`, `(1, 3, 480, 480)`, float32, RGB, letterbox con padding 114 y normalización ImageNet |
| Salida | `output`, `(1, 4725, 52)`: 4.725 anchors y 52 valores por anchor (20 logits de clase + 4×8 DFL) |
| Strides de features | 8, 16 y 32 |
| Regresión | Distribution Focal Loss con `reg_max = 7` |
| Asignación de etiquetas | SimOTA (ATSS implementado como alternativa, sin comparativa ejecutada) |
| Clases | 20 clases de Pascal VOC |
| Librería | onnxruntime |

## Arquitectura y entrenamiento

El modelo es un detector CNN de una etapa con tres niveles de feature (strides 8, 16 y 32). El backbone emplea stems de downsampling QARepVGG (bloques reparametrizables que se fusionan en el grafo exportado) y bloques PConv; el neck SlimPANPConv realiza agregación PAN tanto top-down como bottom-up con bloques PConv; y la cabeza DecoupledGFLHead separa las ramas de clasificación y regresión en cada nivel. La regresión usa DFL con `reg_max = 7`, lo que explica los 32 valores de regresión por anchor (4 lados × 8 bins). La salida tiene 4.725 anchors, correspondientes a las rejillas 60², 30² y 15².

El entrenamiento se realizó desde cero sobre VOC2007 trainval (5.011 imágenes) y VOC2012 trainval (11.540 imágenes), 16.551 imágenes en total, durante 300 épocas. Se usó SGD con momentum 0,937, weight decay 5e-4, Nesterov, `lr0 = 0,01`, warmup de 5 épocas y decaimiento coseno, con batch de 128 y semilla 42. Se aplicó autocast fp16 en la forward pass cuando hay CUDA (pérdida en FP32), formato channels-last, EMA con decay 0,9998 y clipping de gradiente de 10,0. Las pérdidas ponderan VFL 1,0, GIoU 2,0 y DFL 0,25. Como aumentación se usaron Mosaic (p=0,8) y MixUp (p=0,15) durante las primeras 280 épocas, desactivadas en las últimas 20, además de letterbox a 480×480, flip horizontal aleatorio (p=0,5) y normalización ImageNet. La validación periódica se hizo cada 20 épocas sobre las primeras 500 imágenes del test de VOC2007.

## Capacidades

- Detección de objetos de una etapa sobre las 20 clases de Pascal VOC (aeroplane, bicycle, bird, boat, bottle, bus, car, cat, chair, cow, diningtable, dog, horse, motorbike, person, pottedplant, sheep, sofa, train, tvmonitor).
- Inferencia en CPU mediante ONNX Runtime con `CPUExecutionProvider` sobre un grafo estático.
- Cuantización INT8 QDQ con pérdida mínima de precisión respecto a FP32.
- Entrada de resolución fija 480×480 con letterbox y normalización ImageNet predefinidas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades multimodales más allá de la visión: no procesa texto, audio ni vídeo de forma nativa.
- No dispone de modo thinking ni de generación de lenguaje.

## Casos de uso

- Detección en dispositivos sin GPU: el modelo se ejecuta con ONNX Runtime en CPU, lo que permite desplegarlo en servidores sin acelerador, portátiles o entornos edge donde no hay CUDA disponible.
- Benchmarking de latencia y throughput en CPU: al ser un grafo estático de 1,73 M de parámetros con variante INT8, sirve para medir y comparar el rendimiento de distintos procesadores y configuraciones de ONNX Runtime.
- Prototipado rápido de pipelines de detección: la interfaz ONNX estándar (entrada `images`, salida `output`) facilita integrarlo en scripts de experimentación sin dependencias de frameworks de entrenamiento.
- Filtrado previo en sistemas de visión con restricciones de cómputo: puede actuar como primera etapa para localizar personas, vehículos o animales en imágenes de 480×480 antes de un modelo mayor.
- Investigación sobre arquitecturas ligeras: los bloques QARepVGG y PConv, junto con la cabeza GFL, permiten estudiar el equilibrio precisión/coste en detectores de una etapa.
- Docencia y reproducción de experimentos: el pipeline de entrenamiento documentado (tres etapas, hiperparámetros y aumentaciones) y la evaluación sobre VOC2007 test facilitan la replicación en entornos académicos.
- Despliegue en aplicaciones de conteo o localización en dominios VOC: por ejemplo, conteo de personas o vehículos en imágenes de escenas similares a las del conjunto de entrenamiento, siempre con validación previa sobre datos propios.

## Benchmarks y rendimiento

Resultados del evaluador ONNX del proyecto (`swiftdet/eval_voc.py`) sobre las 4.952 imágenes del split de test de VOC2007:

| Modelo | AP50 | mAP50-95 | Imágenes evaluadas |
|---|---:|---:|---:|
| FP32 ONNX (`swiftdet_voc480_fp32.onnx`) | 64,62 % | 38,86 % | 4.952 |
| INT8 QDQ ONNX (`swiftdet_voc480_int8_qdq.onnx`) | 64,23 % | 38,51 % | 4.952 |

No se han publicado en la información disponible resultados comparativos con otros detectores (YOLO, SSD, etc.) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no aplica para el despliegue objetivo (CPU); el modelo es ultraligero (1,73 M de parámetros) y cabe holgadamente en memoria de cualquier GPU consumer si se ejecuta con un proveedor CUDA de ONNX Runtime.
- GPU recomendadas: no disponibles en la información proporcionada; el modelo está pensado para `CPUExecutionProvider`.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) por su tamaño, aunque no es el escenario de despliegue documentado.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (documentado); otros runtimes compatibles con ONNX no están verificados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros detectores de objetos de tamaño o tarea similares (por ejemplo, variantes ligeras de YOLO o SSD), ni datos de rendimiento de terceros que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Estado de vista previa de investigación (v0.1.0): no está certificado para producción y el autor recomienda validarlo sobre datos y hardware propios antes de confiar en sus predicciones.
- Alcance restringido a las 20 clases de Pascal VOC; no es un detector de propósito general y fallará o dará resultados pobres fuera de ese dominio.
- Resolución de entrada fija a 480×480; no admite otras resoluciones sin reexportar el grafo.
- Posible sobreajuste al split de evaluación: las primeras 500 imágenes del test de VOC2007 se usaron para validación periódica durante el entrenamiento, lo que puede inflar ligeramente las métricas reportadas sobre ese split.
- La comparativa SimOTA vs ATSS no se ejecutó (`RUN_MINI_ABLATIONS = False`), por lo que no hay evidencia de que SimOTA sea la mejor opción para esta arquitectura.
- Riesgo de alucinación en el sentido de detecciones falsas positivas en escenas fuera de distribución; no se han publicado análisis de calibración ni de sesgos.
- Sesgos conocidos: no documentados en la información disponible; el conjunto VOC tiene una distribución demográfica y de escenas concreta que puede introducir sesgos en clases como `person`.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni certificación de producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssef2Salmi/swiftdet-voc480
- Repositorio de código: https://github.com/SalmiJozif2001/SwiftDet
- Documentación de arquitectura: https://github.com/SalmiJozif2001/SwiftDet/blob/main/docs/ARCHITECTURE.md
- Documentación del pipeline de entrenamiento: https://github.com/SalmiJozif2001/SwiftDet/blob/main/docs/TRAINING_PIPELINE.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
