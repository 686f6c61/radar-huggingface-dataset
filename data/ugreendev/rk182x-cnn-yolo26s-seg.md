# UGREENDEV/RK182X-CNN-YOLO26s-Seg

## Resumen

RK182X-CNN-YOLO26s-Seg es un modelo de segmentación de imágenes de tipo CNN convertido al formato RKNN para su ejecución en las NPU de los chips Rockchip RK1820 y RK1828. Lo publica el usuario UGREENDEV en Hugging Face y deriva del modelo YOLO26s de Ultralytics, adaptado mediante el toolkit RKNN en su versión de runtime v1.1.0. No es un modelo de lenguaje ni un transformer generativo: es un modelo de visión por computador orientado a la inferencia en hardware embebido de bajo consumo.

El modelo resuelve la tarea de segmentación de instancias a una resolución de entrada de 640x640 píxeles, con cuantización w8a8 (pesos y activaciones de 8 bits) y ejecución sobre un único núcleo NPU. Su relevancia radica en que permite desplegar un segmentador YOLO moderno directamente en placas con acelerador Rockchip, sin necesidad de GPU dedicada, lo que encaja en escenarios de edge computing, robótica, videovigilancia o inspección industrial.

La información publicada es escasa: el repositorio tiene 0 GB de tamaño declarado, no incluye resultados de benchmarks ni detalles sobre el dataset de entrenamiento original. La model card se limita a describir el proceso de conversión, los ficheros incluidos y los requisitos de compatibilidad de hardware y runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLO26s de Ultralytics, convertido a RKNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 640x640 px) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones de 8 bits) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | other (modelo fuente bajo GNU Affero General Public License v3.0) |
| Formato de pesos | RKNN (runtime v1.1.0) |

## Arquitectura y entrenamiento

El modelo es una red convolucional YOLO26s en su variante de segmentación, es decir, una arquitectura de detección y segmentación de instancias de una sola etapa. El autor no documenta la arquitectura interna ni los detalles del backbone, cuello de botella o cabeza de predicción más allá de identificarlo como CNN y como derivado de `ultralytics/ultralytics`. La conversión se realiza con el toolkit RKNN en versión de runtime v1.1.0 y produce un artefacto cuantizado a w8a8 para ejecución en NPU.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre procesos de ajuste fino, destilación o calibración de cuantización. Tampoco se detalla si la cuantización w8a8 se ha calibrado con un conjunto representativo específico ni qué precisión se pierde respecto al modelo original en punto flotante. La model card únicamente indica que los ficheros de una configuración deben usarse juntos y que se verifiquen las sumas SHA-256 antes del despliegue.

## Capacidades

- Segmentación de instancias sobre imágenes de entrada de 640x640 píxeles.
- Detección de objetos implícita en la cabeza de segmentación de YOLO26s.
- Inferencia en NPU de chips Rockchip RK1820 y RK1828.
- Ejecución con cuantización w8a8 sobre un único núcleo NPU.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión multimodal ni audio.
- Compatible con el runtime RKNN v1.1.0 y el driver correspondiente.

## Casos de uso

- Videovigilancia en el borde: el modelo puede ejecutarse en placas con RK1820 o RK1828 para segmentar personas y objetos en flujos de vídeo en tiempo real, sin enviar datos a la nube y con la cuantización w8a8 reduciendo el consumo energético.
- Inspección industrial automatizada: integrado en una línea de producción, permite segmentar defectos o piezas en imágenes de 640x640 capturadas por cámaras industriales, aprovechando la NPU del chip para inferencia local de baja latencia.
- Robótica móvil: un robot equipado con Rockchip RK1828 puede usar el modelo para segmentar obstáculos y superficies a partir de su cámara frontal, alimentando módulos de navegación o manipulación.
- Drones y dispositivos aéreos: la inferencia en NPU de bajo consumo permite segmentar escenas desde una cámara embebida sin penalizar la autonomía de la batería.
- Agricultura de precisión: segmentación de cultivos, malas hierbas o frutos en imágenes de campo capturadas por dispositivos con chip Rockchip, para decisiones de tratamiento localizadas.
- Análisis de imágenes médicas o científicas en entornos con recursos limitados: el modelo puede desplegarse en dispositivos edge para presegmentar regiones de interés antes de un análisis más profundo.
- Automatización de almacenes: segmentación de paquetes y estanterías en cámaras fijas conectadas a placas RK1820, para conteo y control de inventario en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828.
- Runtime: RKNN Runtime v1.1.0, con el driver correspondiente instalado en el dispositivo.
- Verificación de versión en el dispositivo: `rknn-smi -v`.
- NPU: un único núcleo NPU para la configuración `YOLO26s-Seg-640x640-w8a8-1`.
- VRAM estimada: no disponible (no aplica GPU; el modelo se ejecuta en NPU).
- GPU recomendadas: no aplica; el artefacto RKNN está pensado para NPU Rockchip.
- Compatibilidad con GPU de consumo: no aplica en formato RKNN; requeriría reconversión desde el modelo fuente de Ultralytics.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1820/RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Cuantización | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK182X-CNN-YOLO26s-Seg | CNN YOLO26s (RKNN) | 640x640 | w8a8 | NPU RK1820/RK1828 | other (fuente AGPL-3.0) | Hugging Face, ModelScope |
| YOLO26s (Ultralytics, original) | CNN YOLO26s | configurable | FP32/FP16 | GPU/CPU | AGPL-3.0 | GitHub Ultralytics |
| Otros modelos YOLO convertidos a RKNN | CNN YOLO (distintas versiones) | variable | w8a8 | NPU Rockchip | variable | repositorios de la comunidad |

La comparativa se limita a la relación con el modelo fuente y con conversiones equivalentes a RKNN, ya que no se dispone de datos de rendimiento publicados para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- No se han publicado métricas de precisión (mAP, IoU) ni comparación con el modelo original en punto flotante, por lo que se desconoce la pérdida de calidad introducida por la cuantización w8a8.
- El modelo solo funciona en chips Rockchip RK1820 y RK1828 con el runtime RKNN v1.1.0 y el driver correspondiente; no es portable a GPU o CPU sin reconversión.
- La licencia del modelo fuente es AGPL-3.0, lo que impone obligaciones de liberación de código para servicios en red que lo utilicen; la licencia declarada en el repositorio es "other", por lo que conviene revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- Se aplican además las licencias del RKNN Toolkit y del RKNN Runtime, que pueden restringir el uso o la redistribución.
- No hay información sobre sesgos del dataset de entrenamiento original ni sobre el dominio de imágenes para el que el modelo está optimizado.
- Riesgo de degradación en dominios alejados de los datos de entrenamiento de YOLO26s (imágenes médicas, satelitales, térmicas) sin un ajuste fino previo.
- El repositorio declara un tamaño de 0 GB y 0 descargas, lo que sugiere que los pesos pueden no estar disponibles o que el artefacto es muy pequeño; verificar la integridad con `sha256sum -c SHA256SUMS` antes de desplegar.
- Los ficheros de una configuración deben usarse conjuntamente; mezclar versiones o configuraciones puede producir fallos en tiempo de ejecución.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-CNN-YOLO26s-Seg
- Modelo fuente Ultralytics: https://github.com/ultralytics/ultralytics
- Documentación de configuración (ingles): https://huggingface.co/UGREENDEV/RK182X-CNN-YOLO26s-Seg/blob/main/YOLO26s-Seg-640x640-w8a8-1/README.md
- Documentación de configuración (chino): https://huggingface.co/UGREENDEV/RK182X-CNN-YOLO26s-Seg/blob/main/YOLO26s-Seg-640x640-w8a8-1/README_CN.md
- ModelScope: https://modelscope.cn/models/UGREENDEV/RK182X-CNN-YOLO26s-Seg
