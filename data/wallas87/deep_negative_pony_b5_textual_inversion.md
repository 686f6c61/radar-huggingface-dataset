# Wallas87/Deep_Negative_Pony_B5_textual_inversion

## Resumen

Deep Negative Pony es un embedding de inversión textual (textual inversion) desarrollado por Wallas87 para su uso en el prompt negativo de modelos de difusión basados en Pony Diffusion V6. No es un modelo de lenguaje ni un modelo generativo autónomo: se trata de un conjunto de vectores aprendidos que se inyectan en el codificador de texto de un modelo de difusión para reforzar la supresión de composiciones anatómicamente incorrectas, combinaciones de color desagradables y estructuras espaciales incoherentes.

El modelo base sobre el que opera es AiAF/Diffusers_Pony-Diffusion-V6, una variante de Pony Diffusion V6 XL, que a su vez se apoya en la arquitectura SDXL (Stable Diffusion XL). El embedding se distribuye a través de HuggingFace en formato diffusers y como respaldo del original publicado en Civitai, donde el autor original es lenML. La model card indica explícitamente que debe colocarse dentro del prompt negativo, nunca en el positivo.

Su relevancia es práctica y acotada: no introduce nuevas capacidades generativas, sino que actúa como un filtro estilístico y estructural que reduce artefactos recurrentes en la generación de imágenes con Pony Diffusion. Está marcado como contenido no apto para todas las audiencias (not-for-all-audiences) y cuenta con muy pocas descargas (3) y ningún like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inversión textual (embedding de tokens) sobre el codificador de texto de un modelo de difusión SDXL/Pony Diffusion V6 |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (el embedding se concatena al prompt negativo; hereda la ventana del codificador de texto del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de instancia y los ejemplos están en inglés) |
| Licencia | no disponible |
| Formato de pesos | diffusers (textual inversion); repositorio de 0.0 GB |
| Modelo base | AiAF/Diffusers_Pony-Diffusion-V6 |
| Tamano del repositorio | 0.0 GB |
| Biblioteca | diffusers |
| Prompt de instancia | deep_negative_pony |
| Descargas | 3 |
| Likes | 0 |

## Arquitectura y entrenamiento

El artefacto es un embedding de inversión textual, es decir, un conjunto de vectores entrenados que representan un token o tokens nuevos dentro del espacio de embeddings del codificador de texto del modelo base. En la práctica, al invocar la palabra clave `deep_negative_pony` en el prompt negativo, el modelo de difusión sustituye ese token por los vectores aprendidos, que codifican conceptos asociados a composiciones indeseadas. De este modo se sesga el proceso de eliminación de ruido (denoising) para alejarse de esas configuraciones.

Según la model card, el entrenamiento parte del principio de que Pony y SDXL son arquitecturas y distribuciones de datos distintas, por lo que el autor reentrenó la versión Pony del embedding original DeepNegative (lenML). El objetivo declarado no es mejorar la calidad de imagen de forma directa, sino suprimir patrones concretos: anatomía humana inexacta, combinaciones de color desagradables, estructuras espaciales desorientadas y otros artefactos. No se especifican en la información disponible el número de tokens, la tasa de aprendizaje, el número de pasos ni la composición del dataset de entrenamiento.

## Capacidades

- Supresión de artefactos estructurales en generaciones de Pony Diffusion V6: reduce composiciones anatómicamente incorrectas, combinaciones cromáticas no deseadas y disposición espacial incoherente.
- Funciona como token invocable (`deep_negative_pony`) dentro del prompt negativo del pipeline diffusers.
- Compatible con otros embeddings negativos similares y con prompts negativos textuales convencionales.
- Diseñado específicamente para el ecosistema Pony Diffusion V6 XL (SDXL), no para SD 1.5 ni para SDXL estándar (existen versiones separadas para esos casos).
- No aporta capacidades de generación propias: no genera texto, no razona, no ejecuta tool calling ni soporta agentes.
- No es multimodal en el sentido de entrada de audio o vídeo; su única función es modular el condicionamiento textual de un modelo de difusión de imágenes.

## Casos de uso

- Pipeline de generación de imágenes con Pony Diffusion V6: añadir `deep_negative_pony` junto a negativos de calidad (`worst quality, low quality, logo, text, watermark, username:1`) para reducir artefactos anatómicos en lotes grandes de imágenes.
- Producción de ilustración de personajes: en flujos que generan retratos o figuras de cuerpo completo, el embedding ayuda a evitar extremidades malformadas y proporciones incorrectas que obligan a regenerar.
- Generación por lotes en servidores de imágenes: al reducir la tasa de descartes por defectos estructurales, disminuye el coste de cómputo asociado a reintentos.
- Integración en interfaces de usuario tipo A1111, ComfyUI o InvokeAI: el embedding se carga como un textual inversion estándar y se selecciona desde la lista de embeddings negativos.
- Control estilístico en proyectos de arte conceptual: combinado con LoRAs de estilo (los ejemplos de la model card usan Expressive_H y Concept Art Twilight Style), actúa como capa de limpieza sobre el resultado final.
- Experimentación e investigación en embeddings negativos: sirve como caso de estudio para comparar variantes de DeepNegative entre arquitecturas (1.5, SDXL y Pony).
- Refinamiento de prompts negativos en pipelines de difusión personalizados: permite encapsular un conjunto amplio de conceptos indeseados en un único token, simplificando la gestión del prompt negativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye ejemplos cualitativos (widgets de demostración con sus prompts e imágenes asociadas) y no aporta métricas cuantitativas como FID, CLIP score ni comparaciones numéricas con otros embeddings negativos.

## Requisitos de hardware

- Requisitos heredados del modelo base (Pony Diffusion V6 XL / SDXL); el embedding en sí ocupa un espacio despreciable (repositorio de 0.0 GB).
- VRAM estimada para SDXL en fp16: en torno a 8-10 GB para resolución nativa de 1024x1024, y más de 12 GB si se emplean pipelines complejos, ControlNet o upscaling posterior.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070/4080/4090 para uso en consumidor; A100, H100 o L40S para despliegue en servidor con concurrencia.
- Cabe en GPU de consumo: sí, en GPUs con al menos 8 GB de VRAM (con atención eficiente y VAE en fp16 o tiling).
- Opciones de despliegue: diffusers (Python), AUTOMATIC1111, ComfyUI, InvokeAI, Forge y otros frontales compatibles con textual inversion y SDXL.
- Latencia y throughput estimados: no disponibles para este embedding en concreto; dependen íntegramente del hardware y del pipeline del modelo base.

## Comparativa con modelos similares

| Modelo | Arquitectura base | Función | Licencia | Disponibilidad |
|---|---|---|---|---|
| Deep Negative Pony (este) | Pony Diffusion V6 XL (SDXL) | Embedding negativo | no disponible | HuggingFace y Civitai |
| DeepNegative (versión 1.5) | Stable Diffusion 1.5 | Embedding negativo | no disponible | Civitai (models/4629) |
| DeepNegative (versión SDXL) | SDXL | Embedding negativo | no disponible | Civitai (models/407448) |
| DeepNegative original (lenML) | SD 1.5 / SDXL | Embedding negativo | no disponible | Civitai (models/831971) |

No se dispone de datos cuantitativos que permitan comparar rendimiento entre estas variantes; la única diferencia documentada es el modelo base para el que fue entrenada cada una.

## Limitaciones y advertencias

- Es un embedding negativo: si se coloca en el prompt positivo, puede degradar o distorsionar el resultado, ya que codifica conceptos indeseados.
- No mejora la calidad de imagen de forma autónoma; el propio autor recomienda combinarlo con negativos textuales de calidad (`worst quality, low quality, logo, text, watermark, username:1`).
- Licencia no declarada: se desconoce si permite uso comercial. Es imprescindible verificar la licencia en el repositorio original de Civitai antes de usarlo en producción.
- Marcado como `not-for-all-audiences`: los ejemplos de la model card incluyen contenido sugerente y NSFW, por lo que no es apto para entornos sin filtrado.
- Específico para Pony Diffusion V6 XL: no funciona correctamente en SD 1.5 ni en SDXL estándar, que requieren sus propias variantes.
- Escasa validación comunitaria: 3 descargas y 0 likes en HuggingFace, sin benchmarks públicos que respalden su eficacia.
- Sesgos conocidos: no documentados en la información disponible; al tratarse de un embedding negativo, sus sesgos se manifestarían como supresión de ciertos estilos o composiciones, no como sesgos sociales medibles.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la sobre-supresión de características legítimas de la imagen.
- Idiomas: no se declaran idiomas soportados; los prompts de ejemplo están exclusivamente en inglés.

## Enlaces

- HuggingFace: https://huggingface.co/Wallas87/Deep_Negative_Pony_B5_textual_inversion
- Modelo base en HuggingFace: https://huggingface.co/AiAF/Diffusers_Pony-Diffusion-V6
- Civitai, modelo original de lenML: https://civitai.com/models/831971
- Civitai, versión 1.5: https://civitai.com/models/4629
- Civitai, versión SDXL: https://civitai.com/models/407448
