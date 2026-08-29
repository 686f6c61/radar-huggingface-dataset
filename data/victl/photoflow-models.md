# victl/photoflow-models

## Resumen

El repositorio `victl/photoflow-models` no contiene un modelo único, sino un conjunto de archivos de modelo en formato LiteRT (`.tflite`) que la aplicación PhotoFlow descarga en su primer arranque para ejecutarse en dispositivos móviles con arquitectura arm64. Incluye tres componentes: un codificador de imágenes DINOv3 ConvNeXt-Tiny, un modelo de inpaintig LaMa-Dilated y un codificador de imágenes SigLIP2 B/32. Cada uno cumple una función específica dentro de la app: agrupación y estética, limpieza de imágenes y búsqueda por etiquetas, respectivamente.

El repositorio está mantenido por el usuario `victl` y fue creado en agosto de 2026. Incluye variantes específicas para el acelerador NPU del Snapdragon 8 Gen 3 (cualcomm QNN AOT) además de versiones fp16 que se ejecutan en GPU o CPU. La licencia es mixta: DINOv3 usa la licencia de Meta, LaMa-Dilated es Apache-2.0 y SigLIP2 también es Apache-2.0. No se dispone de información sobre parámetros, contexto o rendimiento de los modelos individuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ConvNeXt-Tiny (embedding de imagen), LaMa-Dilated (inpainting), SigLIP2 B/32 (torre de imagen) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelos de visión, sin contexto textual) |
| Tipos de cuantizacion | fp16 (GPU/CPU) y variantes QNN AOT para NPU (Snapdragon 8 Gen 3) |
| Idiomas soportados | no disponible (modelos de visión, sin soporte lingüístico directo) |
| Licencia | Mixta: DINOv3 (licencia Meta), LaMa-Dilated (Apache-2.0), SigLIP2 (Apache-2.0) |
| Formato de pesos | LiteRT `.tflite` (arm64) |

## Arquitectura y entrenamiento

El repositorio agrupa tres arquitecturas distintas, todas orientadas a visión por computador y optimizadas para inferencia en dispositivos móviles:

- **DINOv3 ConvNeXt-Tiny**: codificador de imágenes basado en la familia DINOv3 de Meta, con backbone ConvNeXt-Tiny. Se utiliza para generar embeddings de imagen que alimentan cabezales de agrupación, estética y detección de no-fotografías.
- **LaMa-Dilated**: modelo de inpainting basado en la arquitectura LaMa con convoluciones dilatadas, adaptado desde Qualcomm AI Hub. Su función es rellenar regiones eliminadas de una imagen (funcionalidad "Clean Up").
- **SigLIP2 B/32**: torre de imagen del modelo SigLIP2, variante B/32, que produce representaciones visuales para tareas de etiquetado de sujetos y búsqueda.

No se proporcionan detalles sobre el entrenamiento de estos modelos (número de tokens, composición de datasets, técnicas de alineación). Los archivos `.tflite` son conversiones para inferencia, no los pesos originales de entrenamiento. Las variantes `_npu_SM8650` son compilaciones AOT (ahead-of-time) específicas para el acelerador QNN del Snapdragon 8 Gen 3.

## Capacidades

- **Embedding de imágenes**: DINOv3 ConvNeXt-Tiny genera representaciones vectoriales de imágenes para tareas de agrupación, evaluación estética y clasificación de contenido no fotográfico.
- **Inpainting**: LaMa-Dilated rellena regiones eliminadas o enmascaradas de una imagen, útil para eliminar objetos no deseados.
- **Búsqueda y etiquetado visual**: SigLIP2 B/32 produce embeddings que permiten asociar etiquetas de sujetos a imágenes y realizar búsquedas por contenido visual.
- **Ejecución on-device**: todos los modelos están optimizados para ejecutarse localmente en dispositivos móviles arm64, con variantes para NPU (Snapdragon 8 Gen 3) y GPU/CPU.
- **Sin capacidades de generación de texto**: no se incluyen modelos de lenguaje, ni tool calling, ni razonamiento multi-paso.

## Casos de uso

- **Organización automática de la fototeca**: el embedding DINOv3 permite agrupar fotos por similitud visual, detectar imágenes de baja calidad estética o identificar capturas de pantalla y no-fotografías para separarlas del resto.
- **Limpieza de imágenes en el móvil**: LaMa-Dilated permite al usuario seleccionar un objeto o persona no deseada y eliminarla de la foto, rellenando el hueco con contenido plausible, todo sin conexión.
- **Búsqueda semántica de fotos**: SigLIP2 B/32 permite buscar imágenes por descripciones de sujetos ("perro", "playa", "cumpleaños") sin necesidad de etiquetas manuales, usando embeddings visuales.
- **Filtrado de contenido para álbumes familiares**: el cabezal de estética de DINOv3 puede puntuar automáticamente las fotos y sugerir las mejores para compartir o imprimir.
- **Aplicación de fotografía con privacidad**: al ejecutarse íntegramente en el dispositivo, no se envían imágenes a servidores externos, lo que resulta adecuado para usuarios preocupados por la privacidad.
- **Integración en flujos de edición fotográfica**: los tres modelos pueden combinarse en un pipeline: detectar y puntuar fotos (DINOv3), eliminar elementos no deseados (LaMa) y etiquetar el resultado (SigLIP2) para su posterior búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión, latencia o throughput para los modelos individuales. Tampoco se proporcionan comparaciones con otras implementaciones.

## Requisitos de hardware

- **Dispositivos objetivo**: móviles con arquitectura arm64 (Android/iOS). Las variantes `_npu_SM8650` requieren un Snapdragon 8 Gen 3 para usar el acelerador QNN.
- **VRAM estimada**: no disponible. Los modelos son pequeños (el repositorio total ocupa 0.7 GB, incluyendo las variantes), pero no se especifica el consumo de memoria por modelo.
- **GPU recomendada**: no aplicable para servidores; se ejecutan en GPU móvil (Adreno) o CPU. No hay versiones para GPU de escritorio.
- **Opciones de despliegue**: los archivos `.tflite` se cargan directamente en la app PhotoFlow. No se proporcionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no son modelos de lenguaje.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. Los tres modelos pertenecen a categorías distintas (embedding, inpainting, visión-lenguaje) y no se conocen sus tamaños exactos ni sus métricas. Alternativas genéricas en cada categoría serían:

| Modelo | Categoría | Tamaño | Contexto | Licencia |
|---|---|---|---|---|
| DINOv3 ConvNeXt-Tiny (este repo) | Embedding visual | no disponible | no aplicable | Meta |
| DINOv2 ViT-S/14 | Embedding visual | 21M | no aplicable | Apache-2.0 |
| LaMa-Dilated (este repo) | Inpainting | no disponible | no aplicable | Apache-2.0 |
| LaMa (original) | Inpainting | 46M | no aplicable | Apache-2.0 |
| SigLIP2 B/32 (este repo) | Visión-lenguaje | no disponible | no aplicable | Apache-2.0 |
| SigLIP base (original) | Visión-lenguaje | 86M | no aplicable | Apache-2.0 |

Nota: los tamaños de los modelos originales se indican como referencia, pero no se confirma que las versiones `.tflite` mantengan los mismos parámetros.

## Limitaciones y advertencias

- **Sin documentación de rendimiento**: no hay métricas de precisión, latencia ni consumo energético, lo que dificulta evaluar su idoneidad para producción.
- **Dependencia de la app PhotoFlow**: los archivos están pensados para ser descargados por la aplicación; no se garantiza su funcionamiento independiente fuera de ese contexto.
- **Licencia mixta**: DINOv3 está bajo licencia de Meta, que puede imponer restricciones adicionales al uso comercial. LaMa y SigLIP2 son Apache-2.0, pero conviene revisar los términos exactos de cada licencia.
- **Sesgos y alucinaciones**: al ser modelos de visión, pueden presentar sesgos en la clasificación estética o en el etiquetado de sujetos, especialmente con grupos subrepresentados. El inpainting puede generar contenido plausible pero no veraz en regiones rellenadas.
- **Limitaciones de hardware**: las variantes NPU solo funcionan en Snapdragon 8 Gen 3; en otros dispositivos se usan las versiones fp16, que pueden ser más lentas y consumir más batería.
- **Sin soporte de contexto textual**: ninguno de los modelos procesa lenguaje natural directamente; las capacidades de búsqueda dependen de la integración que haga la app con otros componentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/victl/photoflow-models
- Repositorio GitHub (assets ONNX para photoflow-api): https://github.com/outinspace/photoflow-models
- Proyecto PhotoFlow (framework de fotografía virtual 3D, no relacionado directamente): https://github.com/Visionary-Laboratory/PhotoFlow
- Paper PhotoFlow (agente 3D, no relacionado directamente): https://arxiv.org/abs/2605.23771
- Licencia DINOv3 (Meta): https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
