# TalasCloud/ClearRealityV1-FP32-ONNX

## Resumen

ClearRealityV1-FP32-ONNX es una reempaquetado del modelo de superresolución de imagen ClearRealityV1 de Kim2091, publicado por TalasCloud en formato ONNX con precisión FP32. No se trata de un modelo de lenguaje ni de un transformer generativo: es una red neuronal convolucional especializada en escalado de imágenes por un factor de 4× (upscaling), es decir, recibe una imagen de baja resolución y devuelve una versión de alta resolución con el cuádruple de resolución lineal por eje.

El modelo resuelve el problema clásico de restauración y ampliación de imágenes (super-resolution), un campo donde los métodos de interpolación tradicionales producen resultados borrosos. ClearRealityV1 está orientado a la restauración de contenido visual realista, y este reempaquetado de TalasCloud conserva los pesos originales byte a byte con su precisión FP32 original, sin cuantización, para su uso con ONNX Runtime.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue (un export ONNX) más que de un modelo nuevo, con 0 descargas y 0 likes en el momento de la consulta, un repositorio de 0.0 GB (lo que sugiere que los pesos no están efectivamente alojados o que el tamaño reportado es incorrecto) y una model card mínima que no aporta información sobre arquitectura, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de superresolución de imagen; arquitectura interna no especificada en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | FP32 (única precisión incluida en este repositorio) |
| Idiomas soportados | no disponible (no aplica; procesa imágenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32, opset 17 según el nombre del fichero de origen) |
| Factor de escala | 4× |
| Modelo base | Kim2091/ClearRealityV1 |
| SHA-256 | bbce9d5a653281cfae07788d620bd4ec45712709bdf6349a06a893159efd97ce |
| Tamano del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de ClearRealityV1 en la documentación proporcionada. Por la naturaleza de la tarea (superresolución de imagen 4×) y por el contexto de la model card, se trata de una red neuronal de imagen, presumiblemente una CNN o una arquitectura de restauración basada en bloques residuales, pero no se confirma en los datos disponibles. Tampoco se especifican el número de parámetros, la composición del dataset de entrenamiento, el número de imágenes utilizadas ni si se emplearon técnicas como perceptual loss, GAN loss o entrenamiento con pares sintéticos de degradación.

Lo único documentado es el proceso de empaquetado: TalasCloud conserva los pesos originales byte a byte en FP32 y los distribuye como un fichero ONNX (opset 17). El modelo base es Kim2091/ClearRealityV1, y la revisión concreta del ONNX original se enlaza en la model card. No hay información sobre decodificación especulativa, atención lineal ni otras innovaciones, ya que no aplican a este tipo de modelo.

## Capacidades

- Superresolución de imagen con factor de escala 4×: amplía una imagen de entrada a cuatro veces su resolución lineal por eje.
- Restauración de detalle en imágenes de baja resolución o comprimidas, orientada a contenido realista.
- Inferencia en FP32 mediante ONNX Runtime, con soporte potencial de DirectML en Windows según la model card.
- Ejecución en hardware modesto: la model card cita como sistema objetivo una AMD Radeon RX 580 2048SP (Polaris, 8 GB) y un Intel Xeon E5-2696 v3 (Haswell, AVX2).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión más allá del upscaling (no hay descripción de imágenes, OCR ni detección de objetos).

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: el modelo puede ampliar imágenes 4× preservando detalle, útil en flujos de digitalización y archivo.
- Mejora de assets gráficos en pipelines de contenido: aplicar el upscaler a texturas o ilustraciones antes de publicarlas en resoluciones superiores, con ONNX Runtime como motor de inferencia.
- Preprocesado para otros modelos de visión: ampliar imágenes pequeñas antes de pasarlas a detectores o clasificadores que rinden mejor con mayor resolución de entrada.
- Despliegue en hardware de gama baja: la model card apunta a una RX 580 de 8 GB y una CPU Haswell con AVX2, lo que permite integrar el upscaler en equipos sin GPU de datacenter.
- Integración en aplicaciones de escritorio Windows: el uso de ONNX Runtime con DirectML facilita empaquetar el modelo en apps nativas sin dependencias de CUDA.
- Procesado por lotes de imágenes en servidor: al ser un ONNX FP32, puede servirse con ONNX Runtime en CPU o GPU para tareas de upscaling masivo en pipelines de medios.
- Uso como componente en un pipeline de medios más amplio: la model card enlaza al proyecto koboldcpp-media-pipeline de TalasCloud, lo que sugiere su uso como etapa de escalado dentro de un flujo de generación o edición de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al ser FP32 y no especificarse el número de parámetros, no puede calcularse. La model card cita como objetivo una GPU de 8 GB (RX 580 2048SP), lo que sugiere que el modelo cabe holgadamente en 8 GB.
- GPU recomendadas: la model card menciona explícitamente AMD Radeon RX 580 2048SP (Polaris, 8 GB). No se documentan otras GPU.
- Cabe en GPU de consumo: sí, según el hardware objetivo declarado (RX 580 de 8 GB).
- CPU: Intel Xeon E5-2696 v3 (Haswell, AVX2) como sistema objetivo, lo que indica que puede ejecutarse en CPU con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU y DirectML en Windows). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de superresolución comparables (por ejemplo, Real-ESRGAN, SwinIR o similares) ni métricas que permitan una comparación rigurosa. El único punto de referencia documentado es el modelo base Kim2091/ClearRealityV1, del cual este repositorio es un reempaquetado ONNX FP32 con los pesos originales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier expectativa en ese sentido es incorrecta.
- El repositorio reporta 0.0 GB de tamaño, lo que puede indicar que los pesos no están efectivamente subidos o que el tamaño se reporta de forma incorrecta; conviene verificar la integridad del fichero antes de usarlo en producción.
- La model card es mínima: no documenta arquitectura, datos de entrenamiento, límites de la tarea ni comportamiento en dominios fuera de distribución.
- Riesgo de artefactos propios de la superresolución: alucinación de detalle, halos, texturas sintéticas o distorsión en caras y texto, aunque no se documenta explícitamente en la información disponible.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; el modelo base es de Kim2091 y este reempaquetado es de TalasCloud, por lo que conviene conservar los avisos de licencia de ambos.
- Sin benchmarks ni métricas de calidad (PSNR, SSIM, LPIPS) publicadas en la información disponible, por lo que no puede evaluarse su rendimiento frente a alternativas.
- El hardware objetivo es antiguo (Polaris, Haswell); no hay datos de rendimiento en GPU modernas ni de optimizaciones específicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TalasCloud/ClearRealityV1-FP32-ONNX
- Modelo base: https://huggingface.co/Kim2091/ClearRealityV1
- ONNX original (revisión enlazada en la model card): https://huggingface.co/Kim2091/ClearRealityV1/blob/6bfd32e08342ad5d8ae5ac2fd6629a72d525c76e/ONNX/fp32/4x-ClearRealityV1-fp32-opset17.onnx
- Pipeline de medios de TalasCloud: https://github.com/aktalascloud/koboldcpp-media-pipeline/releases/tag/v2026.11.17-r5
