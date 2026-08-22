# whate/rt-detr-r18-thermal-detection

## Resumen

El modelo `whate/rt-detr-r18-thermal-detection` es un detector de objetos basado en RT-DETR-R18, ajustado por el usuario `whate` sobre el modelo preentrenado `PekingU/rtdetr_r18vd` para la detección de personas y vehículos en imágenes térmicas infrarrojas capturadas desde drones (UAV). El ajuste fino se realizó sobre el dataset HIT-UAV, que contiene 2.898 imágenes térmicas de alta altitud en escenas como carreteras, aparcamientos, colegios y patios de recreo.

El modelo resuelve el problema de detección de objetos en el dominio térmico aéreo, un escenario donde las cámaras RGB convencionales fallan por falta de luz o contraste. Su relevancia radica en que ofrece un detector de tamaño reducido (20,1 millones de parámetros) y arquitectura Transformer de tiempo real, que puede servir para investigación, prototipado y demostraciones de visión por computadora en vigilancia aérea, búsqueda y rescate, o análisis de tráfico.

La arquitectura es RT-DETR con backbone ResNet-18VD, entrada de 640×640 píxeles y 300 consultas de objetos. Los pesos se almacenan en formato SafeTensors FP32 y la licencia es Apache-2.0, lo que permite uso comercial y modificación. No se han publicado métricas cuantitativas de rendimiento en los artefactos exportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RT-DETR con backbone ResNet-18VD (RT-DETR-R18) |
| Parámetros totales | 20.113.380 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (visión por computadora) |
| Tipos de cuantización | No disponible (pesos FP32 en SafeTensors) |
| Idiomas soportados | No aplica (modelo visual) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors (FP32) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura RT-DETR (Real-Time Detection Transformer), propuesta en el CVPR 2024 por Lv et al., que combina un backbone convolucional (ResNet-18VD) con un transformador de detección que procesa consultas de objetos de forma paralela. RT-DETR se diseñó para superar a los detectores basados en YOLO en velocidad y precisión, eliminando la necesidad de postprocesado NMS. El modelo se inicializa desde los pesos preentrenados `PekingU/rtdetr_r18vd` y se ajusta fino durante 5 épocas con el dataset HIT-UAV.

El entrenamiento se realizó con Hugging Face Transformers y PyTorch, con batch size por dispositivo de 32, tasa de aprendizaje inicial de 5e-5 con programación coseno, weight decay de 1e-4, entrenamiento en FP16 y semilla 42. La entrada se redimensiona a 640×640 y se normaliza según el procesador de imágenes de RT-DETR. El modelo predice cinco etiquetas: Bicycle, Car, DontCare, OtherVehicle y Person, donde DontCare se conserva porque estaba presente en las anotaciones de entrenamiento. No se han reportado métricas cuantitativas (mAP, precisión, recall) en los artefactos exportados.

## Capacidades

- Detección de objetos en imágenes térmicas infrarrojas: detecta personas y vehículos en escenas aéreas de alta altitud captadas por UAVs.
- Salida de cajas delimitadoras en formato `xyxy` con puntuación de confianza por cada objeto detectado.
- Clasificación en cinco categorías: Bicycle, Car, DontCare, OtherVehicle y Person.
- Funciona con imágenes de entrada de 640×640 píxeles, convertidas a tres canales RGB por el procesador.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto, ya que es exclusivamente un modelo de visión.
- No es multilingüe; los resultados son solo etiquetas de clase en inglés.
- Puede servir como punto de partida para ajuste fino en otros datasets térmicos con licencia adecuada.

## Casos de uso

- Vigilancia y seguridad en infraestructuras críticas: el modelo puede detectar intrusos (personas) o vehículos en imágenes térmicas de cámaras de seguridad aéreas, alertando en tiempo real sin depender de iluminación visible.
- Análisis de tráfico y planificación urbana: sobre imágenes térmicas de drones, permite contar vehículos y clasificarlos en carreteras, aparcamientos o cruces, útil para estudios de movilidad.
- Búsqueda y rescate en condiciones de baja visibilidad: el modelo puede localizar personas en imágenes térmicas nocturnas o con humo, ayudando a equipos de emergencia a priorizar zonas.
- Monitoreo de fauna y gestión de espacios naturales: aunque el modelo está entrenado para personas y vehículos, puede servir como base para adaptar a detección de animales en entornos térmicos.
- Prototipos de sistemas de conducción autónoma en entornos no urbanos: para detectar personas y vehículos en carreteras rurales con poca luz, integrando la salida en pipelines de decisión.
- Demostraciones de visión por computadora en UAV: el modelo es ligero (20M parámetros) y puede ejecutarse en hardware embebido, lo que permite pruebas de detección en tiempo real en drones reales.
- Análisis de tráfico en aparcamientos: detección de coches y bicicletas en imágenes térmicas de estacionamientos para monitorización de ocupación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica que no hay métricas cuantitativas (mAP, precisión, recall) en los artefactos exportados, por lo que no se puede comparar numéricamente con otros modelos. Las comparaciones visuales cualitativas con el modelo base `PekingU/rtdetr_r18vd` se muestran en las imágenes del repositorio, pero no constituyen una evaluación cuantitativa.

## Requisitos de hardware

- VRAM estimada: con 20,1 millones de parámetros en FP32, el modelo ocupa aproximadamente 80 MB de memoria. En FP16 sería unos 40 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA, desde una RTX 2060 hasta una A100. También puede ejecutarse en CPU, aunque la inferencia será más lenta.
- Compatibilidad con GPU de consumo: sí, funciona en tarjetas de gama media y baja, como GTX 1650, RTX 3060, etc., con latencia de decenas de milisegundos por imagen.
- Opciones de despliegue: se puede usar con Hugging Face Transformers en PyTorch, o exportar a ONNX para servir con Triton, TensorRT o incluso en edge con Jetson. No hay soporte nativo en vLLM, llama.cpp ni Ollama, porque no es un modelo de lenguaje.
- Latencia estimada: no disponible en la documentación, pero un RT-DETR-R18 suele ejecutar en tiempo real (más de 30 FPS) en GPUs modernas; en CPU se esperan tiempos de 100-500 ms por imagen según hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `whate/rt-detr-r18-thermal-detection` | RT-DETR-R18 | 20,1 M | Detección en térmica aérea | Apache-2.0 | Hugging Face |
| `PekingU/rtdetr_r18vd` (base) | RT-DETR-R18 | 20,1 M | Detección general COCO | Apache-2.0 | Hugging Face |
| YOLOv8n (ultralytics) | CNN | 3,2 M | Detección general | AGPL-3.0 | Ultralytics |

La comparativa directa no es posible porque no hay métricas publicadas para este modelo. El modelo base `PekingU/rtdetr_r18vd` está entrenado en COCO para detección general en imagen visible, mientras que este modelo está especializado en térmico aéreo. YOLOv8n es una alternativa más ligera y rápida, pero no está entrenado para imágenes térmicas y requeriría un ajuste fino similar.

## Limitaciones y advertencias

- No hay métricas cuantitativas publicadas, por lo que se desconoce el rendimiento real en precisión y recall.
- El modelo puede heredar sesgos geográficos, ambientales, de sensor, altitud y distribución de clases del dataset HIT-UAV, que se limita a escenas de China.
- Los objetos pequeños, con bajo contraste, parcialmente ocluidos o agrupados densamente en imágenes térmicas de alta altitud son difíciles de detectar.
- Las predicciones varían con el umbral de confianza; es necesario calibrar el umbral para el entorno de despliegue.
- No está validado para imágenes de luz visible, cámaras a nivel de suelo, imágenes médicas ni entornos muy diferentes a HIT-UAV.
- No debe usarse en decisiones críticas de seguridad, identificación biométrica, seguimiento individual ni vigilancia sin revisión ética y legal.
- La etiqueta `DontCare` se conserva en las salidas y debe filtrarse en aplicaciones reales para evitar falsas detecciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whate/rt-detr-r18-thermal-detection
- Modelo base: https://huggingface.co/PekingU/rtdetr_r18vd
- Repositorio oficial de RT-DETR: https://github.com/lyuwenyu/RT-DETR
- Documentación de RT-DETR en Hugging Face: https://huggingface.co/docs/transformers/v4.42.4/en/model_doc/rt_detr
- Dataset HIT-UAV (DOI): https://doi.org/10.1038/s41597-023-02066-6
- Repositorio alternativo RT_DETR: https://github.com/nobleo/RT_DETR
- Seguimiento de modelos en BenchLM: https://benchlm.ai/model-updates (no específico para este modelo)</think>## Resumen

El modelo `whate/rt-detr-r18-thermal-detection` es un detector de objetos basado en RT-DETR-R18, ajustado por el usuario `whate` sobre el modelo preentrenado `PekingU/rtdetr_r18vd` para la detección de personas y vehículos en imágenes térmicas infrarrojas captadas desde drones (UAV). El ajuste fino se realizó sobre el dataset HIT-UAV, que contiene 2.898 imágenes térmicas de alta altitud en escenas como carreteras, aparcamientos, colegios y patios de recreo.

El modelo resuelve el problema de la detección de objetos en el dominio infrarrojo aéreo, donde las cámaras RGB tienen limitaciones por falta de luz o contraste. Su relevancia reside en ser un detector Transformer de tiempo real con un tamaño contenido (20,1 millones de parámetros), pensado para investigación, prototipos y demostraciones de visión por computadora en vigilancia aérea, búsqueda y rescate o análisis de tráfico. La arquitectura RT-DETR elimina la necesidad de post-procesado NMS, lo que facilita la integración en pipelines de inferencia.

Los pesos se distribuyen en formato SafeTensors FP32 y la licencia Apache-2.0 permite uso comercial y modificación. No se han publicado métricas cuantitativas en los artefactos exportados, por lo que no es posible comparar numéricamente su rendimiento con otros modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RT-DETR con backbone ResNet-18VD (RT-DETR-R18) |
| Parámetros totales | 20.113.380 |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | No disponible (pesos FP32 en SafeTensors) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors (FP32) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RT-DETR (Real-Time DEtection Transformer), propuesta en el CVPR 2024 por Lv et al., que combina un backbone convolucional (ResNet-18VD) con un transformador de detección. RT-DETR está diseñado para superar a los detectores YOLO en velocidad y precisión, eliminando el post-procesado NMS y usando consultas de objetos (object queries) para predecir directamente las cajas delimitadoras. El modelo parte de los pesos preentrenados de `PekingU/rtdetr_r18vd` y se ajusta durante 5 épocas sobre el dataset HIT-UAV.

El entrenamiento se realizó con Hugging Face Transformers y PyTorch, con batch size por dispositivo de 32, tasa de aprendizaje inicial de 5e-5, programación de tasa de aprendizaje coseno, weight decay de 1e-4, entrenamiento en FP16 y semilla 42. La entrada se redimensiona a 640×640 píxeles y el procesador de imágenes convierte la imagen a tres canales RGB. El modelo predice cinco etiquetas: `Bicycle`, `Car`, `DontCare`, `OtherVehicle` y `Person`. No se dispone de métricas de evaluación cuantitativas en los artefactos exportados.

## Capacidades

- Detección de objetos en imágenes térmicas infrarrojas aéreas captadas desde UAVs.
- Predicción de cajas delimitadoras en formato `xyxy` con puntuación de confianza por objeto.
- Clasificación en cinco clases: `Bicycle`, `Car`, `DontCare`, `OtherVehicle` y `Person`.
- Entrada de imágenes de 640×640 píxeles, normalizada por el procesador de imágenes RT-DETR.
- Compatible con Hugging Face Transformers y PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto al ser exclusivamente un modelo de visión.
- Puede servir como punto de partida para ajuste fino en otros datasets térmicos con licencia adecuada.

## Casos de uso

- Vigilancia y seguridad en infraestructuras críticas: el modelo puede detectar personas y vehículos en imágenes térmicas de UAVs sobre perímetros de instalaciones, activando alarmas ante intrusos sin depender de la iluminación.
- Análisis de tráfico y movilidad urbana: sobre imágenes térmicas aéreas, permite contar vehículos y bicicletas en intersecciones o aparcamientos, alimentando sistemas de gestión de tráfico.
- Búsqueda y rescate de personas: en operaciones nocturnas o con humo, el modelo localiza personas en terreno abierto a partir de la firma térmica, ayudando a priorizar zonas de búsqueda.
- Monitorización de eventos multitudinarios: detecta personas en imágenes térmicas de drones sobre multitudes, útil para control de aforo y seguridad en festivales o manifestaciones.
- Prototipos de sistemas de conducción autónoma en entornos rurales: el modelo puede integrarse en un pipeline de percepción para detectar personas y vehículos en carreteras con poca luz.
- Demostración de visión por computadora en drones: al tener solo 20,1 millones de parámetros, es viable ejecutarlo en hardware embebido de drones para pruebas de detección en tiempo real.
- Análisis de aparcamientos: detección de coches y bicicletas en imágenes térmicas para monitorizar plazas ocupadas y gestionar la capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta mAP, precisión, recall ni otras métricas cuantitativas. Las comparaciones cualitativas mostradas en el repositorio son ilustrativas y no constituyen una evaluación numérica.

## Requisitos de hardware

- VRAM estimada: con 20,1 millones de parámetros en FP32, el modelo ocupa aproximadamente 80 MB de memoria. En FP16 se reduce a unos 40 MB.
- GPU recomendadas: cualquier GPU con soporte CUDA, desde una RTX 3060 hasta una A100. El modelo también puede ejecutarse en CPU, aunque la latencia será mayor.
- Compatibilidad con GPU de consumo: sí, funciona en tarjetas de gama media y baja como GTX 1650, RTX 3060 o RTX 4090.
- Opciones de despliegue: se puede usar con Hugging Face Transformers y PyTorch, o exportar a ONNX para TensorRT, Triton o despliegue en edge. No es compatible con vLLM, llama.cpp ni Ollama por no ser un modelo de lenguaje.
- Latencia y throughput: no disponible en la documentación. Un RT-DETR-R18 suele ejecutar en tiempo real (más de 30 FPS) en GPUs modernas; en CPU se esperan tiempos de 1 a 5 segundos por imagen según el hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `whate/rt-detr-r18-thermal-detection` | RT-DETR-R18 | 20,1 M | Detección en térmico aéreo | Apache-2.0 | Hugging Face |
| `PekingU/rtdetr_r18vd` (modelo base) | RT-DETR-R18 | 20,1 M | Detección general en COCO | Apache-2.0 | Hugging Face |
| YOLOv8n (Ultralytics) | CNN | 3,2 M | Detección general | AGPL-3.0 | Ultralytics |

La comparación directa no es posible por falta de métricas publicadas para el modelo ajustado. El modelo base `PekingU/rtdetr_r18vd` está entrenado en COCO para detección en luz visible, mientras que este modelo se especializa en térmico aéreo. YOLOv8n es una alternativa más ligera y rápida, pero no está entrenado para imágenes térmicas y requeriría un ajuste fino similar.

## Limitaciones y advertencias

- No hay métricas cuantitativas disponibles, por lo que se desconoce su precisión real en mAP u otras medidas.
- El modelo puede heredar sesgos geográficos, ambientales, de sensor, de altitud y de distribución de clases del dataset HIT-UAV, que se limita a escenas de China.
- Los objetos pequeños, con bajo contraste, parcialmente ocluidos o densamente agrupados son difíciles de detectar en imágenes térmicas de alta altitud.
- Las predicciones varían con el umbral de confianza; hay que calibrar el umbral según el entorno de despliegue.
- No está validado para imágenes de luz visible, cámaras a nivel de suelo, imágenes médicas ni entornos muy diferentes a HIT-UAV.
- No debe usarse en sistemas de seguridad críticos, identificación biométrica, seguimiento individual ni vigilancia sin revisión ética y legal.
- La etiqueta `DontCare` está presente en las salidas y debe filtrarse en aplicaciones reales para evitar predicciones espurias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whate/rt-detr-r18-thermal-detection
- Modelo base: https://huggingface.co/PekingU/rtdetr_r18vd
- Repositorio oficial de RT-DETR: https://github.com/lyuwenyu/RT-DETR
- Documentación de RT-DETR en Hugging Face: https://huggingface.co/docs/transformers/v4.42.4/en/model_doc/rt_detr
- Dataset HIT-UAV: https://doi.org/10.1038/s41597-023-02066-6
- Repositorio alternativo RT_DETR: https://github.com/nobleo/RT_DETR
