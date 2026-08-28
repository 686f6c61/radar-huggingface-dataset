# zw89/negative-prompts-pack

## Resumen
`negative-prompts-pack` es un paquete de embeddings negativos diseñado para Stable Diffusion v1.5, publicado por el usuario zw89 en HuggingFace. No se trata de un modelo generativo en sí, sino de una colección curada de 16 archivos de embeddings (en formato `.pt` y `.safetensors`) que se utilizan como prompts negativos para mejorar la calidad de las imágenes generadas, evitando artefactos comunes como manos deformes, anatomía incorrecta, texturas de piel irreales o composiciones no deseadas.

El pack agrega recursos ya conocidos en la comunidad de Stable Diffusion, como `bad-hands-5`, `EasyNegative`, `BadDream` o `UnrealisticDream`, entre otros. Su utilidad radica en ofrecer un conjunto probado de embeddings negativos en un solo lugar, facilitando su integración en flujos de trabajo de generación de imágenes. Es relevante para desarrolladores y artistas que usan Stable Diffusion v1.5 y buscan reducir iteraciones manuales de ajuste de prompts negativos.

La fecha de creación del repositorio es agosto de 2026, aunque no se dispone de información sobre el proceso de entrenamiento, licencia o métricas de rendimiento. El tamaño del repositorio es de 0.0 GB, lo que sugiere que los archivos se referencian mediante enlaces externos en lugar de alojarse directamente.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings negativos para Stable Diffusion v1.5 (no es un modelo generativo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los embeddings son independientes del idioma, pero los prompts se escriben en ingles) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch) y `.safetensors` |

## Arquitectura y entrenamiento
Los embeddings negativos son vectores de aprendizaje que se inyectan en el espacio de condicionamiento del modelo de difusion. Durante la inferencia, se concatenan al prompt negativo del usuario para guiar al modelo a evitar ciertas caracteristicas. No se trata de un modelo entrenado desde cero, sino de una recopilacion de embeddings preentrenados por distintos autores de la comunidad (por ejemplo, `bad-hands-5` de yesyeahvh, `EasyNegative` de gsdf, etc.). Cada embedding fue entrenado originalmente con datasets especificos para corregir defectos concretos (manos, pies, rostros, calidad general, etc.). El pack no aporta entrenamiento adicional ni modificaciones tecnicas; es un agregador de recursos existentes.

## Capacidades
- Mejora la calidad de las imagenes generadas con Stable Diffusion v1.5 al suprimir artefactos comunes.
- Reduce la aparicion de manos y pies deformes (embeddings como `bad-hands-5`, `negfeetV2`).
- Evita texturas de piel plasticas o irreales (`UnrealisticDream`, `verybadimagenegative`).
- Previene estilos artisticos no deseados o composiciones genericas (`bad-artist`, `bad_pictures`).
- Permite combinar multiples embeddings en un solo prompt negativo para un control fino.
- Compatible con interfaces que aceptan embeddings negativos, como Automatic1111 WebUI, ComfyUI o InvokeAI.
- No requiere hardware adicional ni entrenamiento por parte del usuario; se carga como un archivo de embedding.

## Casos de uso
- **Generacion de retratos realistas**: al anadir `UnrealisticDream` y `verybadimagenegative` al prompt negativo, se reducen las pieles de porcelana y los rostros "uncanny", mejorando la naturalidad de los retratos.
- **Ilustracion de personajes anime**: `badhandv4` y `bad-hands-5` corrigen las manos deformes, un problema frecuente en este estilo; se pueden combinar con `EasyNegative` para una limpieza general.
- **Produccion de imagenes para stock**: usar `bad_prompt_version2` y `bad_pictures` ayuda a evitar composiciones genericas y artefactos que delaten el origen IA, util para bancos de imagenes.
- **Creacion de assets para videojuegos**: los embeddings negativos permiten mantener un estilo coherente y evitar errores anatomicos en personajes o props, acelerando el pipeline de concept art.
- **Optimizacion de flujos de trabajo en lote**: al integrar el pack en scripts de Automatic1111 o ComfyUI, se pueden aplicar los mismos embeddings negativos a cientos de generaciones sin intervencion manual.
- **Educacion y experimentacion**: sirve como recurso didactico para entender como funcionan los embeddings negativos y comparar la efectividad de distintos archivos en diferentes modelos base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de imagen ni comparaciones cuantitativas con otros packs de embeddings negativos. La evaluacion de este tipo de recursos suele ser subjetiva y dependiente del modelo base y del prompt positivo utilizado.

## Requisitos de hardware
- Los embeddings negativos no anaden carga computacional significativa; se procesan junto con el prompt en el modelo de difusion.
- Los requisitos de hardware son los mismos que para Stable Diffusion v1.5: una GPU con al menos 4 GB de VRAM para generar a 512x512, aunque se recomienda 6 GB o mas para mayor resolucion y velocidad.
- GPUs compatibles: NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4090, o equivalentes de AMD con soporte ROCm.
- El pack se puede usar con interfaces como Automatic1111 WebUI, ComfyUI, InvokeAI o Stability Matrix, que gestionan la carga de embeddings.
- No se requieren servicios en la nube ni despliegue especializado; es un recurso local.

## Comparativa con modelos similares
| Recurso | Tipo | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|
| `negative-prompts-pack` (zw89) | Pack de embeddings | 16 embeddings negativos para SD v1.5 | no disponible | HuggingFace |
| `enhanced-negative-prompts` (iboss21) | Repositorio de prompts | Coleccion de prompts negativos en texto para varios modelos | no disponible | GitHub |
| `negative-prompts-pack` (ffxvs) | Pack de embeddings | Misma coleccion, posible variante del mismo autor | no disponible | aimodels.fyi |

La comparativa se limita a otros recursos de prompts negativos, ya que no existen modelos comparables en el sentido de arquitectura o parametros. La principal diferencia es que este pack agrupa embeddings ya existentes, mientras que otros repositorios ofrecen listas de texto plano.

## Limitaciones y advertencias
- No es un modelo independiente: requiere Stable Diffusion v1.5 o un modelo compatible con embeddings de ese tipo.
- La efectividad de cada embedding depende del modelo base; algunos pueden no funcionar bien con modelos fine-tuned o con SDXL.
- No se dispone de informacion sobre la licencia de uso; algunos embeddings individuales pueden tener restricciones (por ejemplo, los alojados en Civitai pueden tener licencias no comerciales).
- El repositorio no incluye los archivos directamente, solo enlaces externos; la disponibilidad futura de esos enlaces no esta garantizada.
- No hay garantia de que los embeddings esten actualizados o sean compatibles con versiones recientes de las interfaces.
- El pack no incluye instrucciones de uso ni documentacion sobre parametros recomendados; el usuario debe conocer como cargar embeddings en su interfaz.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/zw89/negative-prompts-pack
- Enlaces individuales de los embeddings (segun la model card):
  - asian-Less-Neg: https://civitai.com/models/50755?modelVersionId=57451
  - bad-artist: https://huggingface.co/nick-x-hacker/bad-artist
  - BadDream: https://civitai.com/models/72437?modelVersionId=77169
  - bad-hands-5: https://huggingface.co/yesyeahvh/bad-hands-5
  - bad-image-v2-39000: https://huggingface.co/Xynon/models
  - bad_pictures: https://civitai.com/models/23178
  - bad-picture-chill-75v: https://civitai.com/models/17083/bad-picture-negative-embedding-for-chilloutmix
  - bad_prompt_version2: https://huggingface.co/datasets/Nerfgun3/bad_prompt
  - badhandv4: https://civitai.com/models/16993/badhandv4-animeillustdiffusion
  - EasyNegative: https://huggingface.co/datasets/gsdf/EasyNegative
  - fastNegativeV2: https://civitai.com/models/71961/fast-negative-embedding-fastnegativev2
  - negative_hand-neg: https://civitai.com/models/56519/negativehand-negative-embedding
  - negfeetV2: https://civitai.com/models/90707/negfeet-improve-feet-quality
  - ng_deepnegative_v1_75t: https://civitai.com/models/4629/deep-negative-v1x
  - UnrealisticDream: https://civitai.com/models/72437?modelVersionId=77173
  - verybadimagenegative: https://civitai.com/models/11772/verybadimagenegative
