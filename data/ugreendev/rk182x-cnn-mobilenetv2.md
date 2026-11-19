# UGREENDEV/RK182X-CNN-MobileNetV2

## Resumen

RK182X-CNN-MobileNetV2 es un modelo de clasificación de imágenes basado en la arquitectura MobileNetV2, convertido al formato RKNN para su ejecución sobre las NPU de los chips Rockchip RK1820 y RK1828. Lo publica el usuario UGREENDEV en Hugging Face y deriva del modelo MobileNetV2 validado del repositorio oficial `onnx/models`. No se trata de un modelo de lenguaje, sino de una CNN de visión de propósito general para clasificación de imágenes a 224x224 píxeles.

La relevancia del artefacto no está en la arquitectura en sí, sino en el empaquetado: incluye pesos cuantizados a w8a8 (8 bits en pesos y activaciones), configuración de despliegue para una NPU de un solo núcleo y sumas de verificación SHA-256, lo que facilita la integración en productos embebidos con aceleración por hardware. Está pensado para desarrolladores que necesitan inferencia de visión de baja latencia y bajo consumo en dispositivos con los citados SoC.

El repositorio tiene un tamaño declarado de 0.0 GB, sin descargas ni likes en el momento de la consulta, y se publicó el 19 de noviembre de 2026. La licencia es Apache 2.0, heredada del modelo fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV2) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | w8a8 (8 bits en pesos y activaciones) |
| Idiomas soportados | no disponible (no aplica; salida de clases ImageNet) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (runtime v1.1.0); modelo fuente en ONNX |
| Resolución de entrada | 224x224 |
| Chips soportados | RK1820, RK1828 |
| Núcleos NPU | 1 |
| Versión de RKNN Runtime | v1.1.0 |

## Arquitectura y entrenamiento

La red es MobileNetV2, una CNN con convoluciones separables en profundidad y bloques residuales invertidos, diseñada originalmente para inferencia eficiente en dispositivos móviles. No se ha entrenado de nuevo: el artefacto es una conversión del modelo validado de `onnx/models` al formato RKNN mediante el toolkit de Rockchip, con cuantización a w8a8. La model card no aporta detalles sobre el dataset de entrenamiento original, el número de tokens (no aplica) ni sobre técnicas de ajuste posteriores como RLHF o DPO, que no tienen sentido en este tipo de modelo.

La innovación técnica relevante es el pipeline de conversión y cuantización para NPU: el repositorio incluye un directorio de configuración (`MobileNetV2-224x224-w8a8-1`), un `config.json` con el manifiesto de ficheros y un `SHA256SUMS` para verificar la integridad antes del despliegue. No se documentan técnicas como decodificación especulativa ni atención lineal, ajenas a esta arquitectura.

## Capacidades

- Clasificación de imágenes a 224x224 píxeles, con salida sobre las clases del modelo fuente (ImageNet en el original de `onnx/models`).
- Ejecución acelerada por NPU en chips Rockchip RK1820 y RK1828.
- Cuantización w8a8 para reducir huella de memoria y aumentar el throughput en el acelerador.
- Verificación de integridad mediante SHA-256 de los ficheros del directorio de configuración.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, de visión generativa, audio ni modo de razonamiento.

## Casos de uso

- Clasificación de imágenes en dispositivos embebidos: el modelo se ejecuta sobre la NPU de un RK1820 o RK1828 y devuelve la clase predicha para una imagen de 224x224, útil en cámaras inteligentes o sensores industriales con recursos limitados.
- Preprocesado en pipelines de visión: puede actuar como extractor/clasificador previo en una cadena mayor (detección, seguimiento) ejecutada en el mismo SoC, aprovechando la cuantización w8a8 para liberar CPU.
- Control de calidad visual en línea de producción: clasificación rápida de piezas o productos en cinta transportadora sobre hardware Rockchip, con verificación de integridad de los pesos antes del despliegue.
- Clasificación de imágenes en robótica de bajo consumo: integración en robots o drones con SoC Rockchip para tareas de reconocimiento de escenas o categorías de objetos.
- Prototipado de aplicaciones de visión en placas de desarrollo RK1820/RK1828: el paquete incluye configuración y checksums, lo que simplifica la validación inicial del soporte NPU.
- Filtrado previo en sistemas de videovigilancia: descarte rápido de fotogramas irrelevantes mediante clasificación de imagen antes de enviar a un modelo mayor en la nube.
- Evaluación de la cadena de herramientas RKNN: sirve como referencia para validar versiones de runtime (`rknn-smi -v`) y drivers antes de desplegar modelos propios convertidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (top-1/top-5), latencia ni throughput para este artefacto cuantizado.

## Requisitos de hardware

- Hardware de destino: NPU de los SoC Rockchip RK1820 y RK1828 (un núcleo NPU en esta configuración).
- VRAM estimada: no disponible; el modelo se ejecuta sobre memoria del sistema/NPU del SoC, no sobre GPU de escritorio.
- GPU recomendadas: no aplica; el artefacto RKNN no está pensado para GPU convencionales (A100, H100, RTX 4090).
- Compatibilidad con GPU de consumo: no aplica para el formato RKNN; el modelo fuente ONNX podría ejecutarse en otras plataformas, pero no es el objetivo del repositorio.
- Opciones de despliegue: RKNN Runtime v1.1.0 con el driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Cuantización | Plataforma | Licencia |
|---|---|---|---|---|---|
| RK182X-CNN-MobileNetV2 | CNN (MobileNetV2) | 224x224 | w8a8 | NPU RK1820/RK1828 | Apache 2.0 |
| MobileNetV2 (onnx/models) | CNN (MobileNetV2) | 224x224 | FP32 (original) | ONNX Runtime, CPU/GPU | Apache 2.0 |
| Otras conversiones RKNN de MobileNet | CNN (MobileNetV2) | variable | variable | NPU Rockchip | según fuente |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La alternativa más directa es el modelo ONNX original, que ofrece mayor portabilidad pero sin aceleración NPU ni cuantización w8a8.

## Limitaciones y advertencias

- Solo funciona en los chips RK1820 y RK1828; no es portable a otras plataformas sin reconversión.
- Requiere coincidir la versión de RKNN Runtime (v1.1.0) y el driver del dispositivo; una discrepancia puede impedir la ejecución.
- Los ficheros del directorio de configuración deben usarse conjuntamente; mezclar versiones puede producir fallos.
- Al ser una conversión cuantizada a w8a8, puede haber una pérdida de precisión respecto al modelo original en FP32 (no cuantificada en la información disponible).
- Riesgo de sesgos y alucinaciones inherente al modelo fuente ImageNet; no se documentan evaluaciones de sesgo.
- No apto para tareas de lenguaje, razonamiento, agentes ni generación de texto.
- La licencia Apache 2.0 se hereda del modelo fuente, pero el uso está sujeto además a las licencias del RKNN Toolkit y del RKNN Runtime, cuyas librerías no se incluyen en el repositorio.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-CNN-MobileNetV2
- Modelo fuente ONNX MobileNet: https://github.com/onnx/models/tree/main/validated/vision/classification/mobilenet
- Repositorio de modelos ONNX: https://github.com/onnx/models
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-CNN-MobileNetV2 --revision master`
