# sourjatilak/potoai-components

## Resumen

PotoAI on-device components es un repositorio agregado publicado por el usuario sourjatilak que recopila los artefactos binarios que descarga la aplicación Android PotoAI para ejecutar tareas de IA en el propio dispositivo. No se trata de un modelo entrenado por el autor, sino de un contenedor de dos componentes de terceros convertidos de formato: un clasificador de imágenes NSFW en TFLite derivado de Marqo/nsfw-image-detection-384 y una cuantización Q8_0 en GGUF de ByteDance/AnimateDiff-Lightning en su variante de 4 pasos.

El interés del repositorio es práctico más que de investigación: documenta el empaquetado, la conversión de formato y los hashes SHA-256 de los ficheros que una app móvil necesita para realizar filtrado de seguridad de contenido y generación de vídeo animado sin conexión. El tamaño total del repositorio es de 0,5 GB y el metadato de parámetros en safetensors indica 454.417.600 parámetros, cifra que corresponde a la suma agregada de los componentes y no a un único modelo.

La licencia es mixta: cada artefacto conserva la licencia de su origen (Apache-2.0 para el clasificador NSFW y CreativeML OpenRAIL-M para AnimateDiff-Lightning), por lo que cualquier uso o redistribución debe respetar las restricciones de cada componente por separado. No hay información publicada sobre idiomas soportados, pipeline ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregado heterogeneo: Vision Transformer tiny (clasificador NSFW) y modelo de difusion para video (AnimateDiff-Lightning) |
| Parametros totales | 454.417.600 (suma agregada de los componentes, metadato safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TFLite (clasificador) y GGUF Q8_0 (AnimateDiff-Lightning, 4 pasos) |
| Idiomas soportados | no disponible |
| Licencia | Mixta: Apache-2.0 (clasificador NSFW) y CreativeML OpenRAIL-M (AnimateDiff-Lightning) |
| Formato de pesos | TFLite y GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo; agrega dos componentes con arquitecturas distintas. El primero es `safety/output-classifier/v1/nsfw-vit-tiny-384-v1.tflite`, una conversión a TFLite de Marqo/nsfw-image-detection-384 (revisión `0c26ec2`), un Vision Transformer de tipo tiny que opera sobre imágenes de 384 píxeles y clasifica contenido NSFW. El segundo es `video/animatediff-lightning/v1/animatediff_lightning_4step_q8_0.gguf`, una conversión a GGUF con cuantización Q8_0 de ByteDance/AnimateDiff-Lightning en su variante de 4 pasos, un modelo de difusión para generar animaciones a partir de un modelo base de imagen.

Las únicas modificaciones declaradas por el autor son la conversión de formato y la cuantización; los pesos por lo demás no se han alterado. No se proporcionan datos sobre el número de tokens, la composición del dataset de entrenamiento original, ni sobre procesos de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias del repositorio más allá del empaquetado para ejecución en dispositivo.

## Capacidades

- Clasificación de imágenes NSFW mediante un Vision Transformer tiny a resolución 384, empaquetado en TFLite para inferencia en Android.
- Generación de vídeo animado a partir de un modelo base de imagen usando AnimateDiff-Lightning en configuración de 4 pasos, lo que reduce el coste de muestreo frente a configuraciones de más pasos.
- Ejecución on-device: ambos artefactos están pensados para descargarse y ejecutarse localmente en la app PotoAI, sin depender de servicios en la nube.
- Filtrado de seguridad de contenido previo a la generación o publicación de imágenes.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales como thinking mode, visión general o audio más allá de los componentes descritos.

## Casos de uso

- Moderación de contenido en apps móviles: el clasificador TFLite NSFW puede ejecutarse localmente antes de subir o mostrar una imagen, reduciendo la latencia y evitando enviar contenido sensible a servidores externos.
- Generación de animaciones cortas en el dispositivo: AnimateDiff-Lightning en 4 pasos permite crear clips animados a partir de una imagen base sin conexión, útil en apps de edición creativa offline.
- Filtrado previo en pipelines de generación de imagen: combinar el clasificador de seguridad con el generador permite descartar salidas no deseadas antes de persistirlas en el almacenamiento del dispositivo.
- Prototipado de funciones de IA local en Android: el empaquetado TFLite y GGUF sirve como referencia para integrar modelos de terceros en una app móvil con conversión de formato documentada.
- Verificación de integridad en despliegues: los hashes SHA-256 publicados permiten validar que los artefactos descargados por la app coinciden con los esperados.
- Distribución de componentes de terceros con trazabilidad de licencias: el repositorio documenta origen, revisión y licencia de cada fichero, lo que facilita auditorías de cumplimiento en productos que redistribuyen modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desagregada; el repositorio completo ocupa 0,5 GB, pero no se detalla el tamaño individual de cada artefacto ni su huella en memoria en ejecución.
- GPU recomendadas: no disponible. El clasificador TFLite está orientado a aceleración en dispositivo (CPU, GPU móvil o NPU según el runtime de Android); AnimateDiff-Lightning en GGUF sugiere ejecución mediante llama.cpp u otro runtime compatible con GGUF, pero no se especifica hardware objetivo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: TFLite runtime para el clasificador y un runtime compatible con GGUF para el modelo de difusión; no se documentan integraciones con vLLM, TGI, Ollama u otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sourjatilak/potoai-components | 454.417.600 (agregado) | no disponible | TFLite, GGUF | Mixta (Apache-2.0 y CreativeML OpenRAIL-M) | HuggingFace |
| Marqo/nsfw-image-detection-384 | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |
| ByteDance/AnimateDiff-Lightning | no disponible | no disponible | no disponible | CreativeML OpenRAIL-M | HuggingFace |

La comparación directa con modelos individuales no es homogénea, ya que este repositorio agrega dos componentes de distinta naturaleza. Frente a sus fuentes originales, la diferencia principal es el formato de distribución (TFLite y GGUF Q8_0) y el empaquetado para consumo desde una app Android.

## Limitaciones y advertencias

- No es un modelo único: los parámetros reportados son una suma agregada de componentes heterogéneos, por lo que no deben interpretarse como el tamaño de una red concreta.
- Licencia mixta con restricciones: AnimateDiff-Lightning usa CreativeML OpenRAIL-M, que impone restricciones de uso que deben transmitirse a los usuarios posteriores; el clasificador NSFW es Apache-2.0 según la model card de origen.
- Ausencia de documentación de evaluación: no hay métricas de precisión, sesgos ni tasas de falsos positivos del clasificador NSFW en este repositorio.
- Riesgo de clasificación errónea: al ser un clasificador de seguridad, puede producir falsos positivos y falsos negativos que afecten a la experiencia de usuario o a la moderación.
- Sin información sobre idiomas ni sobre calidad de generación de vídeo en distintos dominios.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día, lo que indica un artefacto de empaquetado reciente y sin validación comunitaria.
- La fecha de creación indicada (2026-11-05) debe tratarse con cautela, ya que no es verificable con la información disponible.
- Para producción, es necesario verificar los hashes SHA-256 y revisar las licencias de cada componente antes de redistribuirlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sourjatilak/potoai-components
- Modelo de origen del clasificador NSFW: https://huggingface.co/Marqo/nsfw-image-detection-384
- Modelo de origen de AnimateDiff-Lightning: https://huggingface.co/ByteDance/AnimateDiff-Lightning
