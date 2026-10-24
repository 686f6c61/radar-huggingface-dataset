# zhao-yulong/chilloutmix

## Resumen

ChilloutMix es un checkpoint de Stable Diffusion 1.5 fruto de la fusión (merge) del modelo `nuigurumi/basil_mix` con varios modelos realistas de la comunidad, entre ellos los checkpoints "PoV Skin Texture" de temática explícita publicados por twilightBOO en Civitai. Lo distribuye el usuario `zhao-yulong` en HuggingFace como réplica del repositorio original `Chillout2023/Chilloutmix`; el propio autor lo describe como un modelo orientado a "chicas asiáticas realistas en poses NSFW" y recomienda usar el VAE `vae-ft-mse-840000` junto con el embedding de identidad "Ulzzang-6500".

No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. Es un modelo de difusión latente para generación y edición de imágenes, con resolución nativa de 512×512 píxeles y un encoder de texto CLIP limitado a 77 tokens por prompt. Su relevancia práctica es la de un modelo de nicho: un merge comunitario de 2023 que se popularizó por su estilización de retratos fotorrealistas y que hoy se usa principalmente como referencia histórica, como base de merges posteriores o para pipelines de generación de imágenes en ComfyUI y Automatic1111.

Conviene señalar que el repositorio carece de pipeline declarado, no tiene descargas ni likes registrados, y su licencia derivada de Dreamlike Diffusion 1.0 impone restricciones relevantes para uso comercial, en particular la prohibición de alojarlo en sitios o aplicaciones que generen ingresos o donaciones sin autorización expresa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente: U-Net + VAE + encoder de texto CLIP, heredada de Stable Diffusion 1.5; checkpoint fusionado (merge) de varios modelos |
| Parametros totales | No disponible en la model card. Por herencia de SD 1.5: aproximadamente 860 M en la U-Net y alrededor de 1.000 M contando VAE y encoder de texto |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; el encoder CLIP admite prompts de hasta 77 tokens |
| Tipos de cuantizacion | No documentados por el autor. Pesos en coma flotante (fp16/fp32); existen conversiones de la comunidad a fp16, ONNX y GGUF, no descritas en la model card |
| Idiomas soportados | No disponible. El encoder CLIP de SD 1.5 está entrenado mayoritariamente en inglés, por lo que los prompts en otros idiomas rinden peor |
| Licencia | CreativeML OpenRAIL-M modificada, heredada de Dreamlike Diffusion 1.0, con cláusulas adicionales |
| Formato de pesos | Checkpoint de Stable Diffusion (habitualmente `.safetensors` o `.ckpt`); el repositorio ocupa 26,4 GB, aunque el autor no detalla el desglose de ficheros |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5: un autoencoder variacional (VAE) que comprime las imágenes a un espacio latente de 4 canales y factor 8, una U-Net que aplica difusión denoising en ese espacio latente condicionada por cross-attention sobre embeddings de texto, y un encoder CLIP ViT-L que proyecta el prompt a 77 tokens. El modelo no se ha entrenado desde cero: es un merge de pesos, en concreto de `nuigurumi/basil_mix` combinado con modelos realistas de textura de piel de temática explícita, según declara el autor en la model card.

No hay información pública en la documentación aportada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable en difusión) ni sobre la ponderación exacta del merge. La única indicación técnica operativa es el VAE recomendado, `vae-ft-mse-840000`, que evita el velo grisáceo y mejora la nitidez de piel y ojos frente al VAE original. Tampoco se documentan innovaciones propias: no hay decodificación especulativa, attention lineal ni variantes de muestreo distintas de las estándar de SD 1.5 (Euler a, DPM++ 2M Karras, etc.).

## Capacidades

- Generación de imágenes fotorrealistas de personas, con especial énfasis en retratos y cuerpos de estética asiática, que es el objetivo declarado del autor.
- Generación de contenido NSFW: el repositorio está etiquetado como `not-for-all-audiences` y el autor lo presenta explícitamente para "poses NSFW".
- Transferencia de identidad facial mediante embeddings de texto (Textual Inversion), con el embedding "Ulzzang-6500" recomendado por el autor.
- Edición de imagen por inpainting y outpainting al cargarse como checkpoint en Automatic1111, ComfyUI o Forge.
- Control de composición y pose mediante ControlNet (OpenPose, Depth, Canny), al ser compatible con la arquitectura SD 1.5.
- Estilización y variaciones mediante img2img con distintos niveles de denoising.
- Generación por lotes y barridos de parámetros (sampler, CFG, seeds) en pipelines automatizados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo "thinking".
- No procesa audio ni vídeo de forma nativa; la generación de vídeo requeriría herramientas externas tipo AnimateDiff.

## Casos de uso

- Previsualización de iluminación y pose para ilustración profesional: se usa img2img o ControlNet OpenPose con el modelo para obtener referencias rápidas de anatomía y luz antes de pintar el resultado final a mano.
- Generación de avatares y retratos sintéticos para prototipos: con el embedding "Ulzzang-6500" se obtiene coherencia facial entre imágenes, útil para maquetas de producto o demos de interfaz, siempre que la licencia lo permita.
- Creación de datasets sintéticos de rostros para pruebas de pipelines de visión por computador (detección facial, alineamiento, estimación de edad), con la ventaja de no manejar datos personales reales.
- Flujos de trabajo en ComfyUI con nodos de upscale y detalle facial: el modelo sirve como primera pasada a 512×512 y se completa con upscalers tipo 4x-UltraSharp y un segundo pase de refinado.
- Exploración artística de estética editorial: sesiones de generación por lotes con barridos de seeds y samplers para construir moodboards de moda o fotografía de estudio.
- Reproducción e investigación de merges: sirve como caso de estudio para analizar cómo la fusión de checkpoints de la comunidad altera el sesgo estético y la distribución de salidas frente a SD 1.5 base.
- Base para merges posteriores: otros autores lo han usado como componente en fusiones orientadas a realismo, por lo que resulta útil como referencia al comparar linajes de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones de preferencia humana ni comparaciones cuantitativas con otros checkpoints. Tampoco hay métricas de velocidad de inferencia declaradas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia a 512×512 en fp16: en torno a 4 GB con `--medvram` y atención optimizada (xformers o SDPA); aproximadamente 6-8 GB para trabajar con comodidad sin offloading.
- GPU consumer: cabe en tarjetas de 6 GB o más (RTX 2060, RTX 3060, RTX 4060). Con 8-12 GB (RTX 3060 Ti, RTX 4070) se pueden usar dos pasadas de refinado y ControlNet en la misma sesión.
- GPU profesional: A100, H100 o L40S permiten servir varias instancias en paralelo y procesar lotes grandes, aunque para un modelo de 512×512 suponen un sobredimensionamiento claro.
- Despliegue: Automatic1111 WebUI, ComfyUI, Forge, InvokeAI y diffusers (biblioteca de HuggingFace). Para serving por API se suele usar diffusers con FastAPI o plataformas tipo Replicate y RunPod.
- Almacenamiento: el repositorio ocupa 26,4 GB, muy por encima de los ~2 GB de un único checkpoint fp16, lo que sugiere varios ficheros o versiones empaquetadas; conviene revisar el desglose antes de descargarlo entero.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia arquitectónica de SD 1.5, una RTX 4090 genera del orden de unas pocas imágenes por segundo a 512×512 con 20-25 pasos, pero no hay medición publicada para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Arquitectura base | Resolución nativa | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChilloutMix (este repo) | SD 1.5 (merge) | 512×512 | 77 tokens CLIP | CreativeML OpenRAIL-M modificada (Dreamlike) | HuggingFace y Civitai; 0 descargas registradas en este repositorio |
| Realistic Vision | SD 1.5 (merge) | 512×512 | 77 tokens CLIP | CreativeML OpenRAIL-M | HuggingFace y Civitai |
| DreamShaper | SD 1.5 (merge) | 512×512 | 77 tokens CLIP | CreativeML OpenRAIL-M | HuggingFace y Civitai |
| majicMIX realistic | SD 1.5 (merge) | 512×512 | 77 tokens CLIP | CreativeML OpenRAIL-M | HuggingFace y Civitai |

Los datos de los modelos alternativos provienen del conocimiento general de la familia SD 1.5 y no se han verificado en la búsqueda web realizada, cuyos resultados no guardan relación con el modelo. No hay métricas comparativas publicadas que permitan afirmar cuál rinde mejor.

## Limitaciones y advertencias

- Sesgos estéticos y demográficos: el modelo está ajustado explícitamente hacia un ideal de belleza asiático joven, lo que reduce la diversidad de cuerpos, edades y etnias en las salidas.
- Contenido sexual explícito: la etiqueta `not-for-all-audiences` y la propia descripción del autor implican un riesgo alto de generar contenido para adultos, con las obligaciones legales de verificación de edad y moderación que ello conlleva.
- Riesgo de deepfakes y suplantación de identidad: la combinación del modelo con embeddings faciales tipo "Ulzzang-6500" facilita la generación de rostros realistas no consentidos.
- Licencia restrictiva: la licencia derivada de Dreamlike Diffusion 1.0 prohíbe alojar el modelo o sus derivados en webs o aplicaciones que generen ingresos o donaciones sin permiso expreso; el uso comercial de las salidas se limita a equipos de 10 personas o menos y exige atribución a Dreamlike Diffusion 1.0 con enlace a su model card.
- Repositorio no verificado: figura como `duplicated_from: Chillout2023/Chilloutmix`, sin pipeline declarado, con 0 descargas y 0 likes, y con fecha de creación anómala (2026-10-24). No hay garantía de que los pesos coincidan bit a bit con el original.
- Idiomas: al no documentarse soporte multilingüe y usar CLIP entrenado en inglés, los prompts en castellano producen resultados menos precisos.
- Sin benchmarks: no hay evidencia cuantitativa publicada de calidad, por lo que cualquier comparación con otros checkpoints es subjetiva.
- Tamaño del repositorio desproporcionado (26,4 GB) para un checkpoint SD 1.5, lo que complica la descarga y el versionado en producción.

## Enlaces

- HuggingFace: https://huggingface.co/zhao-yulong/chilloutmix
- Repositorio original del que se duplica: https://huggingface.co/Chillout2023/Chilloutmix (referenciado como `duplicated_from`)
- Civitai del modelo: https://civitai.com/models/6424/chilloutmix
- Modelo base del merge, BasilMix: https://huggingface.co/nuigurumi/basil_mix
- Checkpoint "PoV Skin Texture - r34 Lucid Black" en Civitai (autor twilightBOO, enlace no incluido en la model card)
- Checkpoint "PoV Skin Texture - Dreamlike r34" en Civitai (autor twilightBOO, enlace no incluido en la model card)
- Embedding Ulzzang-6500, hilo original: https://www.reddit.com/r/sdnsfw/comments/yv8d3l/embedding_i_trained_for_korean_ulzzang_face/
- Descarga del embedding Ulzzang-6500: https://moritz.pm/files/ulzzang-6500.pt
- Espejo del embedding: https://oo.pe/https://moritz.pm/files/ulzzang-6500.pt
- Licencia completa de Dreamlike Diffusion 1.0: https://huggingface.co/dreamlike-art/dreamlike-diffusion-1.0/blob/main/LICENSE.md
- Model card de Dreamlike Diffusion 1.0: https://huggingface.co/dreamlike-art/dreamlike-diffusion-1.0
