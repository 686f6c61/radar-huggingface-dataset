# UGREENDEV/RK182X-CNN-MobileNetV1

## Resumen

RK182X-CNN-MobileNetV1 es una conversión al formato RKNN de la arquitectura MobileNetV1 originalmente publicada en el repositorio tensorflow/models. El modelo lo distribuye el usuario UGREENDEV y está empaquetado específicamente para su ejecución sobre la NPU de los chips Rockchip RK1820 y RK1828, empleando la versión v1.1.0 del runtime RKNN. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un clasificador de imágenes convolucional (CNN) cuantizado a 8 bits en pesos y activaciones (w8a8) con resolución de entrada fija de 224x224 píxeles.

Su relevancia es acotada pero concreta: permite desplegar un backbone de clasificación de imágenes ampliamente conocido directamente sobre hardware de borde Rockchip, sin necesidad de reconvertir el modelo desde TensorFlow ni de gestionar el pipeline de cuantización. El repositorio incluye los artefactos RKNN ya compilados, sumas de verificación SHA-256 y documentación de configuración, lo que facilita la validación e integración en dispositivos empotrados.

La información pública disponible es muy limitada: el repositorio no declara número de parámetros, composición del dataset de entrenamiento ni resultados de benchmarks. La model card se centra en el proceso de descarga, verificación y compatibilidad de hardware, no en las capacidades del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV1, profundidad con convoluciones separables) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 píxeles) |
| Tipos de cuantizacion | w8a8 (8 bits en pesos y activaciones) |
| Idiomas soportados | no disponible (clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (runtime v1.1.0) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MobileNetV1, una red convolucional diseñada para eficiencia computacional mediante convoluciones separables en profundidad (depthwise separable convolutions). El modelo original proviene del repositorio oficial tensorflow/models y se ha convertido al formato RKNN para su ejecución sobre la NPU de los chips RK1820 y RK1828. La variante publicada opera a 224x224 píxeles y utiliza una única configuración de cuantización w8a8 sobre un núcleo NPU.

No se dispone de información sobre el número de tokens de entrenamiento (no aplica, al ser un modelo de visión), la composición del dataset, ni si se aplicaron técnicas de ajuste fino adicionales. La model card únicamente documenta el proceso de conversión, los requisitos de compatibilidad de runtime y driver, y los mecanismos de verificación de integridad mediante SHA-256. La innovación técnica destacable es la propia conversión a RKNN, que habilita la inferencia acelerada en hardware Rockchip sin recompilación por parte del usuario.

## Capacidades

- Clasificación de imágenes: el modelo está diseñado para la tarea de image-classification sobre entradas de 224x224 píxeles.
- Inferencia sobre NPU: ejecución acelerada en los chips Rockchip RK1820 y RK1828 mediante el runtime RKNN v1.1.0.
- Cuantización w8a8: reduce el coste computacional y de memoria en comparación con precisión completa, a costa de una posible pérdida de precisión en la clasificación.
- Verificación de integridad: el repositorio incluye sumas SHA-256 para validar los artefactos antes del despliegue.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Clasificación de imágenes en dispositivos de borde: el modelo se ejecuta sobre la NPU de chips RK1820/RK1828, lo que permite clasificar imágenes localmente en cámaras inteligentes, sensores industriales o dispositivos IoT sin depender de la nube.
- Preprocesado en pipelines de visión: puede actuar como extractor de características o clasificador previo en sistemas de inspección visual, filtrando imágenes antes de etapas más costosas.
- Prototipado rápido en hardware Rockchip: al estar ya convertido a RKNN, permite validar flujos de despliegue en NPU sin necesidad de reconvertir desde TensorFlow.
- Control de calidad en fabricación: clasificación de piezas o productos en líneas de producción con latencia baja gracias a la cuantización w8a8.
- Sistemas de vigilancia y detección de presencia: clasificación de fotogramas en dispositivos empotrados con recursos limitados.
- Educación y evaluación de hardware: sirve como referencia para medir el rendimiento de la NPU RK1820/RK1828 con un modelo CNN estándar y bien conocido.
- Verificación de integridad en producción: el flujo de comprobación SHA-256 incluido facilita la validación de artefactos en pipelines de despliegue automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ejecutarse sobre NPU Rockchip, no aplica el concepto de VRAM de GPU convencional; el consumo de memoria depende de la implementación del runtime RKNN y del chip concreto.
- GPU recomendadas: no aplica. El modelo está diseñado para NPU de los chips RK1820 y RK1828.
- Compatibilidad con GPU de consumo: no aplica; no está orientado a GPU NVIDIA, AMD ni a GPU integradas.
- Opciones de despliegue: runtime RKNN v1.1.0 con el driver correspondiente. Se recomienda verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Cuantización | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK182X-CNN-MobileNetV1 (este) | MobileNetV1 (CNN) | 224x224 | w8a8 | NPU RK1820/RK1828 | Apache 2.0 | Hugging Face / ModelScope |
| MobileNetV1 original (tensorflow/models) | MobileNetV1 (CNN) | 224x224 | float | CPU/GPU/TFLite | Apache 2.0 | GitHub tensorflow/models |
| Otras conversiones RKNN de MobileNetV1 | MobileNetV1 (CNN) | variable | variable | NPU Rockchip | según origen | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de MobileNetV1 entrenado sobre un dataset no especificado, pueden heredarse sesgos del dataset original.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero la cuantización w8a8 puede introducir errores de clasificación respecto al modelo en precisión completa.
- Limitaciones de contexto o idioma: no aplica procesamiento de lenguaje; la entrada está restringida a imágenes de 224x224 píxeles.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, pero los artefactos son derivados convertidos y siguen sujetos a la licencia del modelo fuente. Las licencias del RKNN Toolkit y del RKNN Runtime también aplican, y las librerías de runtime no se incluyen en el repositorio.
- Compatibilidad estricta de hardware: solo funciona en chips RK1820 y RK1828 con el runtime y driver correspondientes; no es portable a otras plataformas sin reconversión.
- Verificación obligatoria: el autor recomienda desplegar solo tras confirmar que todas las entradas de SHA256SUMS muestran `OK`.
- Mezcla de ficheros: deben usarse conjuntamente los ficheros de un mismo directorio de configuración; mezclar configuraciones puede provocar fallos.
- Ausencia de datos de entrenamiento y benchmarks: no es posible evaluar la precisión esperada del modelo a partir de la información pública.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-CNN-MobileNetV1
- Modelo fuente (tensorflow/models): https://github.com/tensorflow/models
- Documentación de configuración MobileNetV1-224x224-w8a8-1: https://huggingface.co/UGREENDEV/RK182X-CNN-MobileNetV1/tree/main/MobileNetV1-224x224-w8a8-1
- ModelScope (descarga alternativa): https://modelscope.cn/models/UGREENDEV/RK182X-CNN-MobileNetV1
