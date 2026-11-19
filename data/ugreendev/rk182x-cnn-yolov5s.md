# UGREENDEV/RK182X-CNN-YOLOv5s

## Resumen

RK182X-CNN-YOLOv5s es un artefacto de inferencia publicado por UGREENDEV en Hugging Face: una conversión al formato RKNN del conocido detector de objetos YOLOv5s de Ultralytics, optimizada para las NPU de los SoC Rockchip RK1820 y RK1828. No es un modelo entrenado desde cero ni un modelo de lenguaje, sino un derivado compilado de un checkpoint YOLOv5s que se ejecuta sobre el runtime RKNN v1.1.0 del fabricante.

El modelo resuelve un problema muy concreto de despliegue en el borde: tomar un detector YOLOv5s de referencia y entregarlo cuantizado a 8 bits en pesos y activaciones (w8a8) para que pueda ejecutarse en la NPU integrada de los chips RK182X, con una resolución de entrada fija de 640x640 y un solo núcleo NPU. Es relevante para quien esté construyendo pipelines de visión artificial embebida sobre hardware Rockchip y necesite un artefacto listo para flashear, con sumas de verificación SHA-256 y documentación de compatibilidad.

La información publicada es escasa: el repositorio ocupa 0,0 GB según Hugging Face, no tiene descargas ni likes, y la model card se limita a describir el empaquetado, los comandos de descarga y las condiciones de licencia. No se publican métricas de precisión, mAP ni detalles del dataset de entrenamiento original más allá de la referencia a ultralytics/yolov5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (YOLOv5s, detector de objetos de una etapa) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 640x640 px) |
| Tipos de cuantización | w8a8 (8 bits en pesos y activaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (modelo fuente bajo GNU AGPL v3.0; ver LICENSE y NOTICE) |
| Formato de pesos | RKNN (runtime v1.1.0) |
| Chips soportados | RK1820, RK1828 |
| Núcleos NPU | 1 |
| Resolución de entrada | 640x640 |
| Versión de runtime RKNN | v1.1.0 |
| Modelo fuente | ultralytics/yolov5 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv5s, un detector de objetos de una sola etapa basado en una red convolucional con backbone CSPDarknet, cuello PANet y cabecera de detección multi-escala. El artefacto publicado no incluye el proceso de entrenamiento: UGREENDEV parte del checkpoint público de Ultralytics y lo convierte al formato RKNN mediante el toolkit correspondiente, aplicando cuantización w8a8 para su ejecución en la NPU de los SoC RK1820 y RK1828.

No se documentan en la información disponible el número de tokens de entrenamiento (no aplica), la composición del dataset original, ni si hubo etapas de ajuste fino posteriores a la conversión. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal, que no tienen sentido en este tipo de modelo. La única particularidad técnica destacable es la propia cadena de conversión RKNN y la cuantización w8a8 con un solo núcleo NPU, que condiciona el rendimiento y la precisión final del artefacto.

## Capacidades

- Detección de objetos en imágenes en una sola pasada, con resolución de entrada fija de 640x640 píxeles.
- Salida de cajas delimitadoras y clases según el conjunto de clases del checkpoint YOLOv5s original (no se detalla en la información disponible).
- Ejecución en NPU de los SoC Rockchip RK1820 y RK1828 mediante el runtime RKNN v1.1.0.
- Cuantización w8a8 orientada a minimizar el consumo de memoria y maximizar el throughput en hardware embebido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye modo thinking, visión generativa, audio ni ninguna capacidad multimodal más allá de la detección visual.

## Casos de uso

- Vigilancia perimetral en dispositivos embebidos: el detector puede ejecutarse en la NPU de un RK1820 o RK1828 para identificar personas o vehículos en flujos de cámara, con la ventaja de que el artefacto ya está cuantizado y verificado con SHA-256 para despliegues reproducibles.
- Control de aforo en comercios: integrado en una cámara IP con SoC Rockchip, el modelo permite contar personas en tiempo real sin enviar vídeo a la nube, reduciendo coste de ancho de banda y cumpliendo requisitos de privacidad.
- Inspección visual en línea de producción: detección de defectos o piezas en cintas transportadoras usando la entrada fija de 640x640 y la baja latencia esperable de la NPU, adecuada para ciclos de inspección rápidos.
- Robótica móvil y drones: detección de obstáculos o marcadores visuales a bordo, donde el consumo energético del RK182X es crítico y no se puede depender de una GPU dedicada.
- Análisis de tráfico en cámaras de calle: conteo y clasificación de vehículos en el propio dispositivo, con el modelo RKNN desplegado sobre hardware Rockchip ya presente en infraestructuras municipales.
- Prototipado rápido de productos de visión: al incluir config.json, SHA256SUMS y documentación de compatibilidad, el artefacto sirve como base para validar una idea de producto antes de invertir en un entrenamiento propio.
- Sistemas de seguridad en el hogar: detección de intrusiones o presencia en cámaras domésticas con SoC Rockchip, ejecutando el modelo localmente y activando alertas sin depender de conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo se ejecuta en la NPU integrada de los SoC RK1820 y RK1828, no en una GPU discreta.
- GPU recomendadas: no aplica; el artefacto está compilado exclusivamente para NPU Rockchip RK182X.
- Compatibilidad con GPU de consumo: no; el formato RKNN no es ejecutable en GPUs NVIDIA o AMD sin reconversión previa.
- Opciones de despliegue: runtime RKNN v1.1.0 con el driver correspondiente; verificar la versión del lado del dispositivo con `rknn-smi -v` antes de ejecutar. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-CNN-YOLOv5s (este) | YOLOv5s convertido a RKNN | 640x640 | w8a8 | other (fuente AGPL v3.0) | Hugging Face y ModelScope |
| ultralytics/yolov5 (YOLOv5s original) | YOLOv5s en PyTorch | 640x640 | FP32/FP16 | AGPL v3.0 | GitHub y PyPI |
| YOLOv8s (Ultralytics) | YOLOv8s en PyTorch | 640x640 | FP32/FP16/INT8 | AGPL v3.0 | GitHub y PyPI |
| YOLOv5n | YOLOv5 nano en PyTorch | 640x640 | FP32/FP16 | AGPL v3.0 | GitHub y PyPI |

La comparación relevante es frente al YOLOv5s original: este artefacto no aporta mejoras de precisión, sino portabilidad al hardware RK182X y cuantización w8a8 ya aplicada. Frente a YOLOv8s o YOLOv5n, la diferencia principal es que ninguno de ellos se distribuye en formato RKNN listo para estos SoC, por lo que requerirían conversión manual con el toolkit de Rockchip.

## Limitaciones y advertencias

- La licencia del modelo fuente es GNU AGPL v3.0, lo que impone obligaciones de copyleft sobre obras derivadas y sobre el servicio en red; para uso comercial propietario es necesario revisar LICENSE y NOTICE con detenimiento.
- El artefacto es un derivado convertido y sigue sujeto a la licencia y restricciones del modelo fuente, además de las licencias del RKNN Toolkit y del RKNN Runtime, cuyas bibliotecas no se incluyen en el repositorio.
- Solo funciona en los chips RK1820 y RK1828 con el runtime RKNN v1.1.0 y el driver correspondiente; no es portable a otras plataformas sin reconversión.
- La cuantización w8a8 puede degradar la precisión respecto al modelo en punto flotante; no se publican métricas que permitan cuantificar esa pérdida.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje; los sesgos relevantes serían los del dataset de entrenamiento original de YOLOv5s, no detallados aquí.
- El repositorio tiene 0 descargas y 0 likes, y la model card no incluye resultados de validación ni mAP, por lo que la calidad del artefacto no está respaldada por evidencia pública.
- No se especifican las clases detectables ni el número de parámetros del checkpoint, lo que dificulta evaluar su idoneidad para una tarea concreta sin probarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UGREENDEV/RK182X-CNN-YOLOv5s
- Repositorio fuente de YOLOv5: https://github.com/ultralytics/yolov5
- Documentación de configuración YOLOv5s-640x640-w8a8-1: https://huggingface.co/UGREENDEV/RK182X-CNN-YOLOv5s/tree/main/YOLOv5s-640x640-w8a8-1
- ModelScope (espejo): https://modelscope.cn/models/UGREENDEV/RK182X-CNN-YOLOv5s
- Licencia GNU AGPL v3.0: https://www.gnu.org/licenses/agpl-3.0.html
