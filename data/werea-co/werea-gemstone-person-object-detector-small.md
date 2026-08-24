# Werea-co/Werea-Gemstone-Person-Object-Detector-Small

## Resumen

El modelo Werea-Gemstone-Person-Object-Detector-Small es un detector de objetos y personas basado en YOLOv8s, desarrollado por Werea-co, diseñado específicamente para el despliegue en el dispositivo T3 Gemstone O1 con procesador TI AM67A. Se trata de una adaptación del checkpoint `yolov8s.pt` a una resolución de entrada de 512 píxeles, manteniendo las 80 clases del conjunto de datos COCO. El modelo prioriza la precisión en la detección de la clase `person` y objetos generales, y se acompaña de un módulo opcional de reconocimiento facial local que solo identifica a personas previamente inscritas por un operador, devolviendo `unknown` para el resto.

La relevancia de este modelo radica en su preparación para entornos de borde con recursos limitados, como el T3 Gemstone O1 (4 TOPS, 4 GB de RAM), donde se ha integrado el flujo de importación TIDL. Aunque el checkpoint original tiene 22.5 MB y se proporcionan versiones en PyTorch, TorchScript y ONNX, aún no se han publicado resultados de latencia o rendimiento en el hardware físico objetivo. El modelo está pensado para aplicaciones de vigilancia, conteo de personas y análisis de objetos en tiempo real en dispositivos de bajo consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8s (basado en ultralytics/yolov8s) |
| Parámetros totales | no disponible (checkpoint de 22.5 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de detección de imagen) |
| Tipos de cuantización | no disponible (aunque se puede convertir a ONNX/TorchScript) |
| Idiomas soportados | en, tr (documentación y metadatos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt), TorchScript, ONNX (opset 12, sin NMS) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLOv8s, un detector de objetos de una sola etapa que emplea una red neuronal convolucional (CNN) con cabeza de detección densa. La adaptación consiste en un reentrenamiento de continuación a partir del checkpoint pre-entrenado `yolov8s.pt` sobre el 35% del conjunto de entrenamiento de COCO 2017, durante 12 épocas, con una resolución fija de 512 píxeles. Este proceso de adaptación busca optimizar el rendimiento para la resolución de entrada específica que se usará en el despliegue en el dispositivo T3 Gemstone.

No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión por computador y no de lenguaje. La innovación principal es la preparación del gráfico ONNX para la importación en el acelerador TIDL del TI AM67A, lo que permite la ejecución en hardware de bajo consumo energético. El modelo incluye además un módulo opcional de reconocimiento facial basado en YuNet + SFace, que se ejecuta localmente y solo identifica a individuos previamente inscritos, sin transmitir datos biométricos a la nube.

## Capacidades

- Detección de objetos en 80 clases COCO, incluyendo la clase `person` y objetos comunes como vehículos, animales, muebles, etc.
- Detección de personas con una precisión específica (AP50-95 de 0.5272 en el conjunto de validación COCO).
- Reconocimiento facial opcional mediante inscripción previa (consentimiento explícito) y comparación local de embeddings.
- Compatibilidad con el flujo de despliegue en dispositivos de borde con acelerador TIDL (TI AM67A).
- Exportación a formatos ONNX y TorchScript para integración con diferentes runtimes.
- Funcionamiento sin conexión a internet (inferencia local, sin envío de datos biométricos a la nube).

## Casos de uso

- **Vigilancia y seguridad en instalaciones**: el modelo puede detectar personas y objetos en tiempo real en cámaras de vigilancia, contando personas o alertando sobre la presencia de objetos no deseados. Su tamaño reducido permite ejecutarse en dispositivos embebidos con recursos limitados.
- **Conteo de personas en espacios públicos**: gracias a la detección robusta de la clase `person`, se puede usar para medir afluencia en tiendas, estaciones o eventos, manteniendo la privacidad al no identificar individuos salvo que se inscriban.
- **Control de accesos con reconocimiento facial optativo**: si se utiliza el módulo facial, el modelo puede identificar a personas autorizadas en una puerta de acceso, siempre que hayan sido previamente inscritas y se respete el consentimiento. La ausencia de liveness check limita su uso a entornos controlados.
- **Robótica móvil**: la detección de objetos y personas a 512 píxeles es adecuada para robots autónomos que deben evitar obstáculos o seguir a personas, aprovechando la baja latencia del modelo en hardware edge.
- **Análisis de imágenes en sistemas de bajo consumo**: gracias a su pequeño tamaño (22.5 MB) y a la preparación para TIDL, puede ejecutarse en dispositivos como el T3 Gemstone O1 para aplicaciones de clasificación y detección en tiempo real sin necesidad de GPU dedicada.
- **Prototipos de visión por computador en investigación**: su licencia AGPL-3.0 permite usarlo en proyectos de investigación y desarrollo, aunque el uso comercial de los pesos derivados puede estar sujeto a las mismas condiciones de licencia.

## Benchmarks y rendimiento

La model card proporciona una tabla de evidencia con métricas sobre el conjunto de validación COCO (val2017 completo):

| Métrica | Pretrained baseline (yolov8s) | Adapted checkpoint (Gemstone Small) |
|---|---:|---:|
| COCO val mAP50-95 | 0.4300 | 0.3933 |
| COCO val mAP50 | 0.5905 | 0.5535 |
| Person AP50-95 | 0.5497 | 0.5272 |
| Precisión | 0.6899 | 0.6595 |
| Recall | 0.5360 | 0.5052 |

Estos datos muestran una ligera disminución del rendimiento respecto al checkpoint preentrenado, lo que es esperable tras la adaptación a 512 píxeles y el entrenamiento sobre una fracción del conjunto. No se han publicado resultados de benchmarks comparativos con otros modelos de detección similares en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no se especifica en la documentación. Dado que el checkpoint tiene 22.5 MB y la entrada es de 512 píxeles, se puede inferir que la inferencia es viable en GPUs con poca VRAM (por ejemplo, 2-4 GB), pero no se proporcionan datos oficiales.
- **GPU recomendadas**: el modelo está orientado a dispositivos de borde como el T3 Gemstone O1 (TI AM67A con 4 TOPS y 4 GB de RAM). En el lado de GPU, puede ejecutarse en cualquier GPU compatible con CUDA (por ejemplo, RTX 3060 o superior) para pruebas y desarrollo.
- **¿Cabe en consumer GPU?**: sí, es un modelo ligero y puede ejecutarse en tarjetas de consumo, aunque no se han publicado mediciones de latencia.
- **Opciones de despliegue**: se puede ejecutar con el framework Ultralytics (PyTorch), con ONNX Runtime (para el archivo .onnx) y con TorchScript. Para el dispositivo T3, se prepara el gráfico ONNX para importación en TIDL.
- **Latencia y throughput**: no disponible; la model card indica que las pruebas físicas en el dispositivo T3 aún no se han completado y que no se deben inferir valores del benchmark en un host A100.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de objetos en la documentación proporcionada. Se puede mencionar que YOLOv8s es un modelo de referencia en detección, pero no hay datos de comparación directa en este contexto. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- **Rendimiento reducido**: el modelo adaptado muestra una ligera caída en mAP50-95 (de 0.4300 a 0.3933) en comparación con el baseline, lo que podría afectar la precisión en aplicaciones críticas.
- **Sin liveness check**: el módulo de reconocimiento facial no incluye detección de vivacidad, por lo que no debe ser la única señal para autenticación o decisiones de seguridad.
- **Sesgos potenciales**: al estar entrenado sobre COCO, puede heredar sesgos de las imágenes del dataset (por ejemplo, desbalance en ciertas clases o contextos).
- **Datos biométricos**: los embeddings faciales se generan localmente y no se suben a la nube, pero se deben manejar con cuidado por su naturaleza sensible.
- **Licencia AGPL-3.0**: el uso del modelo y sus pesos derivados está sujeto a la licencia AGPL-3.0, lo que implica que las modificaciones y usos en red deben compartir el código fuente correspondiente.
- **Falta de validación en hardware objetivo**: la model card advierte que las pruebas de latencia, rendimiento y uso de memoria en el T3 Gemstone O1 están pendientes, por lo que no se puede garantizar un funcionamiento en tiempo real en ese dispositivo.
- **Idiomas**: la documentación está en inglés y turco; no hay soporte para otros idiomas en la documentación.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/Werea-co/Werea-Gemstone-Person-Object-Detector-Small)
- [Repositorio de Werea (autor)](https://huggingface.co/Werea-co) (enlace no especificado, se puede acceder desde el perfil)
- Archivos adicionales en el repositorio: `face_identity.py`, `download_face_models.py`, `evidence.json` (no enlazados directamente, pero disponibles en el repo de HuggingFace).
