# WeiChen80percent/image-adaptive-3dlut

## Resumen

El modelo `WeiChen80percent/image-adaptive-3dlut` es un checkpoint de una arquitectura de mejora de imagen basada en tablas de búsqueda tridimensionales (3D LUT) adaptativas al contenido. Es una implementación moderna en PyTorch del trabajo original de HuiZeng et al., publicado en el artículo "Learning Image-adaptive 3D Lookup Tables for High Performance Photo Enhancement in Real-time". El modelo predice, mediante una pequeña red neuronal convolucional, los pesos de fusión de tres LUTs base de tamaño 33×33×33, y aplica la LUT resultante mediante interpolación trilineal diferenciable. El checkpoint incluido corresponde al mejor resultado de validación pública, entrenado sobre el conjunto MIT-Adobe FiveK con las ediciones del experto C.

Con apenas 593 516 parámetros, el modelo ofrece una solución extremadamente ligera para retoque fotográfico automático en tiempo real. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones adicionales. El repositorio proporciona un checkpoint (`best.pt`), un archivo de configuración y un JSON con los resultados de entrenamiento, listo para integrarse en el proyecto `AI_photo_editor` del mismo autor. La relevancia actual radica en su aplicabilidad a flujos de edición fotográfica que requieren baja latencia y bajo coste computacional, como aplicaciones móviles o preprocesado en pipelines de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional pequeña (CNN) + fusión de 3 LUTs de 33×33×33 con interpolación trilineal diferenciable |
| Parámetros totales | 593 516 |
| Parámetros activos | No aplica (no es modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantización | No aplica (pesos en formato float32 de PyTorch, archivo `.pt`) |
| Idiomas soportados | No aplica (procesamiento de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | `best.pt` (PyTorch state dict) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño original de Image-Adaptive-3DLUT: una CNN de pequeñas dimensiones procesa una versión reducida de la imagen de entrada para predecir tres pesos que combinan tres LUTs base aprendibles de 33×33×33. La LUT fusionada se aplica a la imagen completa mediante interpolación trilineal diferenciable, lo que permite un entrenamiento de extremo a extremo. No se emplea ningún mecanismo de atención ni módulos de transformación; el modelo es puramente convolucional y está optimizado para eficiencia.

El entrenamiento se realizó sobre el dataset MIT-Adobe FiveK, utilizando 3935 pares de imágenes para entrenamiento y 488 para validación pública, con el objetivo de reproducir las ediciones del experto C. Se completaron 400 épocas con PyTorch 2.6.0 y CUDA 12.4. El mejor valor de PSNR en validación pública fue de 22.3318 dB. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con una pérdida de reconstrucción (no especificada en la información disponible).

## Capacidades

- Mejora de color y tono: el modelo ajusta exposición, contraste, balance de blancos y saturación de forma automática, imitando el estilo del experto C del dataset Adobe.
- Retoque fotográfico automático: aplica transformaciones de color globales, no locales, sobre imágenes sRGB de entrada.
- Procesamiento en tiempo real: gracias a su tamaño reducido (menos de 0.6 M parámetros), la inferencia es muy rápida, apta para aplicaciones interactivas.
- Funcionamiento como módulo de preprocesado: puede integrarse en pipelines de edición fotográfica para normalizar el aspecto de las imágenes antes de otros algoritmos.
- No incluye soporte de tool calling ni de agentes: es un modelo de imagen puro, sin capacidades de texto o razonamiento simbólico.
- No es un modelo general de restauración: no corrige ruido, desenfoque ni artefactos de compresión; solo modifica la apariencia cromática.

## Casos de uso

- Aplicaciones de edición fotográfica móvil: el modelo puede integrarse en apps para aplicar un filtro de retoque automático en tiempo real, gracias a su bajo coste computacional y tamaño de pesos reducido.
- Preprocesado de imágenes para algoritmos de visión: como paso previo a segmentación o detección, puede normalizar la iluminación y el color de las imágenes de entrada, mejorando la robustez de los modelos posteriores.
- Generación de variaciones de color en flujos de diseño: permite crear versiones alternativas de una imagen con el estilo del experto C, útil para diseñadores gráficos o fotógrafos que buscan una base consistente.
- Automatización de retoque en plataformas web: al ser un modelo ligero, puede desplegarse en servidores de baja capacidad para procesar imágenes subidas por usuarios en tiempo real.
- Investigación en aprendizaje de filtros visuales: sirve como base para estudiar cómo las LUTs aprendibles pueden adaptarse a diferentes dominios de imagen o estilos de edición.
- Optimización de pipelines de fotografía computacional: puede integrarse en sistemas de captura o postprocesado para aplicar un ajuste de color uniforme antes de comprimir o almacenar la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la información disponible. El único dato reportado es el PSNR de validación pública del mejor checkpoint: 22.3318 dB, obtenido sobre 488 pares de imágenes. No se proporcionan comparaciones con otros métodos de mejora de imagen ni con el modelo original de HuiZeng. Los autores advierten que las métricas dependen del split, alineación, resolución y preprocesado, por lo que no son comparables con otros resultados que usen configuraciones distintas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB (peso del modelo ~2.3 MB en float32; la inferencia requiere memoria para la imagen de entrada y la salida).
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM es suficiente; puede ejecutarse en CPU sin problema para imágenes pequeñas.
- Compatibilidad con GPU de consumo: sí, cualquier tarjeta NVIDIA o AMD con soporte CUDA/ROCm. No requiere hardware específico.
- Opciones de despliegue: el modelo se distribuye como checkpoint PyTorch; puede integrarse en pipelines con TorchScript, ONNX o directamente en PyTorch. No se proporcionan adaptaciones a vLLM, llama.cpp u Ollama (no es un modelo de lenguaje).
- Latencia: no se han publicado mediciones, pero dado el tamaño de la red y la operación de interpolación trilineal, se espera inferencia en pocos milisegundos en GPU y decenas de milisegundos en CPU para imágenes de tamaño moderado.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento comparativos en la información pública. El modelo original de HuiZeng et al. (repositorio `HuiZeng/Image-Adaptive-3DLUT`) presenta la misma arquitectura, pero no hay datos de PSNR específicos publicados en la documentación consultada. Otros métodos de mejora de imagen como Deep Photo Enhancer o HDRNet son más complejos y no se han comparado directamente. Por tanto, no hay tabla comparativa disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con el estilo del experto C del dataset MIT-Adobe FiveK; no generaliza a otros estilos de edición ni a dominios fuera de la fotografía sRGB.
- La dependencia del dataset puede introducir sesgos en la percepción del color (por ejemplo, preferencias del experto humano que no coinciden con las de otros usuarios).
- El modelo no es un restaurador de imagen: no corrige ruido, desenfoque, compresión ni otros artefactos; solo modifica el tono y el color.
- La calidad de los resultados varía según la escena, el pipeline de captura y el espacio de color de la imagen de entrada. Los autores recomiendan escalar los píxeles a `[0, 1]`.
- El dataset MIT-Adobe Adobe FiveK no se incluye en el repositorio; los usuarios deben obtenerlo por separado y cumplir con sus términos de uso.
- No se ha evaluado la robustez en imágenes con distribuciones atípicas (por ejemplo, imágenes de microscopía, rayos X o gráficos sintéticos).
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre el rendimiento del modelo en entornos de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WeiChen80percent/image-adaptive-3dlut
- Repositorio GitHub del autor (proyecto AI_photo_editor): https://github.com/WeiChen80percent/AI_photo_editor/tree/main/image_adaptive_3dlut
- Repositorio original de Image-Adaptive-3DLUT: https://github.com/HuiZeng/Image-Adaptive-3DLUT
- Documentación del modelo original en DeepWiki: https://deepwiki.com/HuiZeng/Image-Adaptive-3DLUT
- Modelo original de referencia en HuggingFace (square-zero-labs): https://huggingface.co/square-zero-labs/image_adaptive_3dlut

*Nota: la fecha de creación del modelo en HuggingFace es 23 de agosto de 2026, por lo que se trata de un checkpoint reciente.*
