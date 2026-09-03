# xprilion/photoment-models

## Resumen

El repositorio `xprilion/photoment-models` contiene modelos convertidos a formato Core ML para la aplicación Photoment, una herramienta de selección de fotografías para macOS. El modelo principal es `mobilefacenet`, una red neuronal ligera para reconocimiento facial que genera embeddings de identidad: recibe una imagen de rostro recortada y alineada de 112x112 píxeles y produce un vector unitario de 128 dimensiones. Este vector puede utilizarse para comparar similitud entre rostros mediante distancia coseno o euclidiana.

El modelo está diseñado para ejecutarse íntegramente en local en dispositivos Apple Silicon, sin necesidad de conexión a internet ni servicios en la nube. Esto lo hace relevante para aplicaciones de privacidad estricta, donde los datos biométricos no deben salir del dispositivo. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. El repositorio tiene un tamaño de 0.0 GB y no se han registrado descargas ni interacciones, lo que sugiere que es un proyecto reciente o de uso interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileFaceNet (CNN convolucional ligera) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (formato Core ML, posiblemente FP16 o FP32) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlmodel) |

## Arquitectura y entrenamiento

MobileFaceNet es una arquitectura de red neuronal convolucional diseñada específicamente para reconocimiento facial en dispositivos con recursos limitados. Se basa en bloques residuales invertidos (inverted residual blocks) similares a MobileNetV2, pero con modificaciones en la capa de embedding para mejorar la discriminación entre identidades. La salida es un vector de 128 dimensiones normalizado a norma unitaria, lo que facilita la comparación mediante métricas de similitud.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de identidades, ni el proceso de optimización (si se usó softmax, ArcFace, CosFace u otra función de pérdida). Tampoco se especifica si se aplicaron técnicas de aumento de datos o destilación. El autor solo indica que es una conversión a Core ML del modelo MobileFaceNet, sin detallar los pesos originales ni su procedencia.

## Capacidades

- Generación de embeddings faciales: convierte una imagen de rostro alineada de 112x112 en un vector de 128 dimensiones que representa la identidad.
- Comparación de similitud facial: permite calcular distancia coseno o euclidiana entre dos embeddings para determinar si pertenecen a la misma persona.
- Ejecución 100% local en Apple Silicon: no requiere conexión a red ni servicios externos.
- Integración con Core ML: compatible con las APIs de Apple para inferencia en macOS, iOS y iPadOS.
- Optimizado para dispositivos Apple: aprovecha el Neural Engine y la GPU unificada de los chips M1, M2, M3 y posteriores.

## Casos de uso

- Selección de fotografías en macOS: Photoment utiliza el modelo para agrupar imágenes por persona, permitiendo al usuario filtrar rápidamente fotos de un mismo individuo durante la revisión de librerías grandes.
- Aplicaciones de privacidad biométrica: al ejecutarse localmente, el modelo permite implementar autenticación facial o verificación de identidad sin enviar datos biométricos a servidores, cumpliendo requisitos de GDPR y otras normativas.
- Organización automática de bibliotecas de fotos: desarrolladores pueden integrar el modelo en apps de gestión de imágenes para etiquetar y clasificar rostros de forma automática.
- Búsqueda facial en colecciones personales: permite buscar todas las fotos de una persona concreta a partir de una imagen de referencia, sin depender de servicios en la nube.
- Sistemas de control de acceso local: en entornos donde no hay conectividad, el modelo puede usarse para verificar la identidad de empleados o visitantes mediante comparación de embeddings.
- Investigación y prototipado: al ser un modelo ligero y con licencia permisiva, es adecuado para experimentar con reconocimiento facial en entornos académicos o de desarrollo rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como precisión en LFW, MegaFace o cualquier otro dataset de referencia. Tampoco se indican tiempos de inferencia ni consumo de recursos en Apple Silicon.

## Requisitos de hardware

- Dispositivos Apple Silicon (M1 o superior) con macOS 11 o posterior.
- No se requiere GPU dedicada; el modelo está optimizado para el Neural Engine de los chips Apple.
- Memoria RAM: al ser un modelo pequeño (MobileFaceNet suele tener menos de 1 millón de parámetros), el consumo de memoria es mínimo, probablemente inferior a 100 MB en tiempo de ejecución.
- Compatible con Core ML, por lo que puede desplegarse mediante las APIs nativas de Apple o frameworks como `coremltools` para conversión adicional.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Photoment MobileFaceNet | MobileFaceNet | no disponible | no aplica | Apache 2.0 | Core ML |
| FaceNet (Inception ResNet v1) | CNN | ~23M | no aplica | MIT (implementaciones) | TensorFlow, PyTorch |
| ArcFace (ResNet50) | CNN | ~44M | no aplica | MIT (implementaciones) | PyTorch, ONNX |
| InsightFace (MobileFaceNet) | MobileFaceNet | ~1M | no aplica | MIT | ONNX, PyTorch |

La comparativa se basa en arquitecturas conocidas de reconocimiento facial, pero no se dispone de datos de rendimiento específicos del modelo de Photoment. MobileFaceNet es significativamente más ligero que FaceNet o ArcFace, lo que lo hace adecuado para despliegue en dispositivos con recursos limitados.

## Limitaciones y advertencias

- No se dispone de información sobre el conjunto de entrenamiento, por lo que se desconocen posibles sesgos demográficos o limitaciones en condiciones de iluminación, pose o oclusión.
- El modelo solo acepta imágenes de rostro alineadas de 112x112; requiere un pipeline previo de detección y alineación facial que no está incluido en el repositorio.
- Al ser una conversión a Core ML, puede haber diferencias numéricas respecto al modelo original en otros formatos, aunque normalmente son mínimas.
- No se garantiza un rendimiento de producción sin pruebas adicionales; el repositorio no incluye documentación de evaluación ni ejemplos de uso.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte oficial.
- El modelo está pensado para Apple Silicon; no es directamente utilizable en otras plataformas sin conversión adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xprilion/photoment-models
- Perfil del autor en GitHub: https://github.com/xprilion
- Sitio personal del autor: https://xprilion.com
