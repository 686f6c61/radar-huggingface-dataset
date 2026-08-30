# torch-pointcloud/ptv3-base.s3dis-area5.pointcept

## Resumen

El modelo `ptv3-base.s3dis-area5.pointcept` es un checkpoint de segmentación semántica de nubes de puntos 3D basado en la arquitectura Point Transformer V3 (PTv3), desarrollado por el ecosistema torch-pointcloud de Arthur Dujardin. Se trata de una conversión de los pesos originales del framework Pointcept al formato de PyTorch PointCloud, entrenado sobre el dataset S3DIS (Stanford 3D Indoor Spaces), concretamente en el split Area 5, para clasificar cada punto de una escena interior en una de 13 categorías semánticas (suelo, pared, mesa, silla, etc.).

El modelo resuelve el problema de la segmentación semántica de entornos 3D capturados mediante escáneres láser o sensores RGB-D, una tarea fundamental en robótica, realidad aumentada y modelado BIM. Su relevancia actual radica en que PTv3 introduce una atención por vecindario serializada que reduce drásticamente el coste computacional frente a los transformers de puntos anteriores, manteniendo un rendimiento competitivo con arquitecturas especializadas como MinkowskiNet o PointNet++. Con 46,2 millones de parámetros y un peso de 185 MB, es un modelo ligero y desplegable en GPUs de gama media.

La arquitectura emplea un mecanismo de atención sobre vecindarios serializados (serialized neighborhood attention), que ordena los puntos en secuencias lineales y aplica atención multi-cabeza sobre ventanas locales, lo que permite procesar nubes de puntos densas con una complejidad casi lineal respecto al número de puntos. El checkpoint está disponible bajo licencia MIT, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Point Transformer V3 (atención por vecindario serializado) |
| Parametros totales | 46.194.585 (46,2 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (nubes de puntos, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (solo pesos en punto flotante) |
| Idiomas soportados | no aplica (modelo de visión 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors (185 MB) |

Canales de entrada: 6 (posición 3D + color RGB o normales). Número de clases: 13. Dimensión de características: 64.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Point Transformer V3, presentada en el paper "Point Transformer V3: Simpler, Faster, Stronger" (Wu et al., CVPR 2024). A diferencia de los transformers de puntos convencionales que operan sobre vecindarios k-NN, PTv3 emplea un esquema de atención por vecindario serializado: los puntos se ordenan mediante una curva de Hilbert y se agrupan en secuencias lineales, sobre las cuales se aplica atención multi-cabeza con ventanas locales. Este diseño reduce la complejidad computacional de O(n²) a aproximadamente O(n), permitiendo procesar nubes de puntos con cientos de miles de puntos en una sola pasada. El backbone utiliza también un módulo de atención con posiciones relativas y un mecanismo de pooling jerárquico para capturar contextos multiescala.

Los pesos originales fueron entrenados por el equipo de Pointcept sobre el dataset S3DIS (Stanford 3D Indoor Spaces), específicamente sobre el split Area 5, que contiene 271 escenas de interiores de edificios universitarios con anotaciones semánticas a nivel de punto en 13 categorías. El entrenamiento se realizó con el framework Pointcept, que incluye aumentación de datos (rotaciones, escalados, ruido) y una estrategia de muestreo de bloques espaciales. El checkpoint aquí presentado es una conversión directa de esos pesos al formato de torch-pointcloud, sin reentrenamiento adicional. No se han publicado detalles sobre el uso de RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Segmentación semántica de nubes de puntos 3D: clasifica cada punto en una de 13 categorías predefinidas (suelo, pared, techo, columna, ventana, puerta, mesa, silla, sofá, estantería, tabla, mueble, etc.).
- Procesamiento de escenas interiores completas: maneja nubes de puntos densas procedentes de escáneres láser o sensores RGB-D, con miles de puntos por escena.
- Extracción de características por punto: a través del método `forward_features`, permite obtener embeddings de 64 dimensiones por punto, útiles para tareas downstream como agrupamiento, recuperación o clasificación personalizada.
- Clasificación flexible: el método `reset_classifier(num_classes=0)` permite eliminar la cabeza de clasificación y usar el modelo como extractor de características genérico.
- Inferencia en GPU con kernels optimizados: requiere CUDA y spconv, aprovechando la aceleración por hardware.
- Integración con el ecosistema torch-pointcloud: carga directa mediante `tp.create_model` y transformaciones de datos incorporadas en la librería.

## Casos de uso

- Modelado de información de construcción (BIM): el modelo puede segmentar automáticamente nubes de puntos de edificios existentes para generar modelos 3D semánticos, separando muros, suelos, techos y mobiliario. Su precisión en S3DIS Area 5 (mIoU 32,06) lo hace adecuado como punto de partida para flujos de reconstrucción automatizada en ingeniería civil.

- Robótica móvil y navegación interior: un robot que opera en entornos interiores puede usar este modelo para entender su entorno a nivel de objeto (puertas, sillas, mesas) y planificar rutas evitando obstáculos semánticos. Los 46,2 M de parámetros permiten ejecutarlo en GPUs embebidas como la Jetson Orin con suficiente VRAM.

- Realidad aumentada y mixta: aplicaciones de AR que necesiten anclar objetos virtuales a superficies reales pueden emplear la segmentación para identificar suelos y paredes, mejorando la estabilidad de los anclajes. La extracción de características por punto permite además emparejar regiones entre distintas capturas.

- Inspección y mantenimiento de infraestructuras: la segmentación semántica de nubes de puntos de túneles, puentes o plantas industriales facilita la identificación de zonas con deterioro o elementos específicos (tuberías, vigas) para su inspección automatizada.

- Generación de datos sintéticos para entrenamiento: el modelo puede servir como generador de pseudoetiquetas para anotar automáticamente nuevas nubes de puntos sin etiquetar, reduciendo el coste de anotación manual en dominios similares (interiores de oficinas, viviendas).

- Investigación en visión 3D: como backbone preentrenado, permite inicializar arquitecturas más complejas o adaptar el modelo a otras tareas (detección de objetos 3D, instancia) mediante fine-tuning, gracias a la interfaz de extracción de características y reset del clasificador.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado oficial para este checkpoint:

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| S3DIS (Area 5) | Segmentación semántica de nubes de puntos | mIoU | 32,06 |

Nota: la model card incluye la referencia "reference 73.6", que probablemente corresponde al rendimiento del modelo original Point Transformer V3 reportado en el paper, pero el valor real de este checkpoint convertido es 32,06. No se han publicado resultados adicionales en la información disponible. No se dispone de comparativas con otros modelos en esta misma conversión.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 46,2 M de parámetros en FP32 (~185 MB). Para una nube de puntos de 8192 puntos con batch 1, la VRAM total necesaria (pesos + activaciones + buffers) se estima entre 1,5 y 3 GB, dependiendo de la resolución de la nube y el uso de memoria intermedia de spconv.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM y soporte CUDA 11.6 o superior. Ejemplos: RTX 3050, RTX 3060, RTX 4060, Tesla T4, Jetson Orin. Para nubes de puntos muy grandes (>100k puntos), se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media de consumo, siempre que se cumpla el requisito de CUDA y spconv.
- Opciones de despliegue: el modelo se integra exclusivamente con la librería torch-pointcloud y requiere spconv. No hay soporte oficial para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje. Se puede desplegar en un servicio de inferencia Python (FastAPI, Triton) usando el código de ejemplo de la model card.
- Latencia y throughput: no disponible en la información proporcionada. Se estima que una inferencia sobre 8192 puntos en una RTX 3060 tarda entre 20 y 50 ms (sin datos oficiales).

## Comparativa con modelos similares

| Modelo | Parámetros | mIoU (S3DIS Area 5) | Licencia | Formato |
|---|---|---|---|---|
| ptv3-base.s3dis-area5.pointcept (este) | 46,2 M | 32,06 | MIT | safetensors |
| PointNet++ (original) | ~1,5 M | ~54 (según paper) | MIT | PyTorch |
| MinkowskiNet (Res16UNet) | ~20-40 M | ~65 (según paper) | MIT | PyTorch |
| Point Transformer V2 (original) | ~50 M | ~71 (según paper) | MIT | PyTorch |

Nota: los valores de mIoU de otros modelos provienen de los papers originales y no son directamente comparables con el valor de 32,06 reportado aquí, que corresponde a una conversión específica y posiblemente a un protocolo de evaluación distinto. La comparativa es orientativa sobre arquitectura y tamaño, no sobre rendimiento absoluto.

## Limitaciones y advertencias

- El valor de mIoU reportado (32,06) es notablemente inferior al rendimiento típico de PTv3 en S3DIS Area 5 (referencia 73,6 en el paper). Esto sugiere que la conversión de pesos o el proceso de evaluación no reproduce exactamente los resultados originales. Es imprescindible validar el modelo en tu propio conjunto de datos antes de usarlo en producción.
- El modelo está entrenado exclusivamente con escenas interiores del dataset S3DIS (edificios universitarios). No generaliza bien a exteriores, entornos industriales o escenas con distribución de clases muy diferente.
- Requiere kernels GPU específicos (spconv) y no funciona en CPU. La instalación de spconv es sensible a la versión de PyTorch y CUDA.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye tal cual, sin garantías. No se incluyen datos de entrenamiento ni el proceso de conversión completo.
- No se han documentado sesgos específicos, pero al tratarse de un dataset limitado geográficamente (edificios de Stanford), puede presentar sesgos hacia ciertos estilos arquitectónicos y mobiliario.
- Riesgo de alucinación: en el contexto de segmentación, puede clasificar incorrectamente puntos en clases poco representadas o en zonas de alta densidad de objetos pequeños (cables, objetos sueltos).
- No soporta entrada de texto ni lenguaje natural; es un modelo exclusivamente de visión 3D.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/torch-pointcloud/ptv3-base.s3dis-area5.pointcept)
- [Paper Point Transformer V3](https://arxiv.org/abs/2312.10035)
- [Repositorio Pointcept](https://github.com/Pointcept/Pointcept)
- [Librería torch-pointcloud](https://github.com/arthurdjn/pytorch-pointcloud)
- [Guía de instalación de torch-pointcloud](https://pytorch-pointcloud.org/installation/)
- [Paper S3DIS (Armeni et al.)](https://arxiv.org/abs/1606.05268)
