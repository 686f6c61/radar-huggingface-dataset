# Uhvg856/Qwen-Image-Edit-2509

## Resumen

Qwen-Image-Edit-2509 es un modelo de edición de imágenes basado en difusión, desarrollado por el equipo Qwen (Alibaba). Se trata de la iteración mensual de Qwen-Image-Edit, publicada originalmente en agosto de 2025, y llega con tres mejoras principales: soporte nativo de edición multi-imagen (combinaciones de persona + persona, persona + producto y persona + escena), una mejora sustancial en la consistencia de identidad en edición de imagen única (rostros, productos y texto) y soporte nativo de ControlNet (mapas de profundidad, bordes y keypoints).

El modelo se distribuye a través de la librería `diffusers` mediante el pipeline `QwenImageEditPlusPipeline` y cuenta con 20.430.401.088 parámetros en formato safetensors (aproximadamente 20,4 mil millones), con un repositorio de 57,7 GB. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y soporta los idiomas inglés y chino.

La relevancia de esta iteración radica en que resuelve uno de los problemas clásicos de la edición de imágenes generativa: mantener la identidad del sujeto (rostro, producto) a través de transformaciones de pose, estilo o composición, además de habilitar flujos de trabajo con múltiples imágenes de referencia, algo poco común en modelos de difusión abiertos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (image-to-image), pipeline `QwenImageEditPlusPipeline` en diffusers |
| Parametros totales | 20.430.401.088 (aprox. 20,4 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de difusión para edición de imágenes integrado en `diffusers` mediante el pipeline `QwenImageEditPlusPipeline`. La model card indica que, para habilitar la edición multi-imagen, el modelo parte de la arquitectura de Qwen-Image-Edit y se entrena adicionalmente mediante concatenación de imágenes. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Como innovaciones técnicas destacables, la model card menciona el soporte nativo de ControlNet (mapas de profundidad, mapas de bordes y mapas de keypoints), la capacidad de edición multi-imagen con combinaciones de hasta tres imágenes de entrada (donde el rendimiento óptimo se alcanza con 1 a 3 imágenes) y mejoras específicas en la consistencia de identidad para rostros, productos y texto, incluyendo la edición de fuentes, colores y materiales del texto renderizado.

## Capacidades

- Edición de imágenes a partir de una o varias imágenes de entrada y un prompt textual.
- Edición multi-imagen: soporta combinaciones "persona + persona", "persona + producto" y "persona + escena", con rendimiento óptimo entre 1 y 3 imágenes de entrada.
- Consistencia de identidad mejorada en edición de retratos: preservación del rostro a través de distintos estilos de retrato y transformaciones de pose.
- Consistencia de producto mejorada: preservación de la identidad del producto, orientada a edición de carteles publicitarios.
- Edición de texto en imágenes: modificación de contenido, fuente, color y material del texto renderizado.
- Soporte nativo de ControlNet: mapas de profundidad, mapas de bordes y mapas de keypoints (por ejemplo, para cambiar la pose de una persona).
- Generación de imágenes condicionada por prompt con control de escala de guiado (`true_cfg_scale`, `guidance_scale`) y pasos de inferencia configurables.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.

## Casos de uso

- Edición de retratos con preservación de identidad: dado un retrato y un prompt, el modelo permite cambiar la pose o el estilo manteniendo la identidad facial, lo que resulta adecuado para estudios fotográficos que necesitan variaciones de una misma sesión sin perder el parecido del sujeto.
- Composición de escenas con múltiples personas: la edición multi-imagen "persona + persona" permite integrar a dos sujetos en una misma escena (por ejemplo, una fotografía conjunta generada a partir de dos retratos individuales), útil en aplicaciones de consumo y marketing personalizado.
- Edición de carteles de producto: la mejora en consistencia de producto permite tomar una imagen de producto y generar variaciones de cartel publicitario manteniendo la identidad del artículo, un flujo directamente aplicable a equipos de diseño gráfico y e-commerce.
- Localización de material gráfico con texto: la capacidad de editar contenido, fuente, color y material del texto renderizado permite adaptar carteles y creatividades de inglés a chino (o viceversa) sin rehacer el diseño desde cero.
- Control de pose mediante ControlNet: el soporte nativo de mapas de keypoints permite cambiar la pose de una persona en una fotografía existente, útil en previsualización de animación, moda o ilustración.
- Integración en pipelines de generación de imágenes en producción: al estar disponible en `diffusers` con licencia Apache 2.0, puede integrarse en servicios de edición de imágenes por lotes desplegados sobre GPU, con control de semilla, pasos de inferencia y escala de guiado.
- Prototipado de conceptos visuales: combinando mapas de profundidad o bordes con prompts, el modelo sirve para iterar sobre composiciones y encuadres antes de producir el render final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 20,4 mil millones de parámetros en bfloat16, los pesos ocupan aproximadamente 41 GB, por lo que se requiere una GPU con al menos esa capacidad para inferencia en precisión nativa.
- GPU recomendadas: no se especifican en la información disponible; por el tamaño del modelo, se necesitan GPU de clase profesional (A100, H100) o configuraciones multi-GPU para ejecutarlo en bfloat16.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño de los pesos hace improbable su ejecución en GPU de consumo sin cuantización, y no se documentan en la información proporcionada formatos cuantizados (GGUF, etc.).
- Opciones de despliegue: `diffusers` con el pipeline `QwenImageEditPlusPipeline` (requiere instalar la versión de desarrollo desde el repositorio de GitHub de diffusers). No se documentan otras opciones como vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Edición multi-imagen | ControlNet nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-Edit-2509 | 20,4 mil millones | no disponible | Sí (1-3 imágenes) | Sí | Apache 2.0 | Hugging Face, ModelScope |
| Qwen-Image-Edit (agosto 2025) | no disponible | no disponible | No documentado | No documentado | Apache 2.0 | Hugging Face |
| Runware/Qwen-Image-Edit-2509 | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (espejo) |

La información disponible no permite comparar con modelos de terceros de la misma categoría en cuanto a rendimiento cuantitativo; la comparación más directa es con la versión anterior Qwen-Image-Edit, respecto a la cual la model card reporta mejoras cualitativas en consistencia de persona, producto y texto, además de la incorporación de edición multi-imagen y ControlNet nativo.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; como modelo de difusión entrenado con datos a gran escala, es previsible que herede sesgos de representación, pero no hay datos concretos disponibles.
- Riesgo de alucinación: no cuantificado en la información disponible; en modelos de difusión, el riesgo se traduce en artefactos o alteraciones no solicitadas de la imagen de entrada, especialmente en regiones no mencionadas en el prompt.
- Limitaciones de idioma: los metadatos del modelo indican soporte únicamente de inglés y chino, lo que puede limitar la calidad de prompts en castellano.
- Limitaciones de edición multi-imagen: el rendimiento óptimo se alcanza con 1 a 3 imágenes de entrada; no se documenta el comportamiento con más imágenes.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque se recomienda verificar los términos de los pesos y de las dependencias (diffusers en versión de desarrollo).
- Caveats para producción: el modelo requiere instalar diffusers desde el repositorio de GitHub (`pip install git+https://github.com/huggingface/diffusers`), lo que introduce riesgo de cambios en la API; además, el tamaño del repositorio (57,7 GB) y de los pesos en bfloat16 implican requisitos de almacenamiento y VRAM elevados.
- El repositorio `Uhvg856/Qwen-Image-Edit-2509` es una copia con 0 descargas y 0 likes; para uso en producción se recomienda verificar contra el repositorio oficial de Qwen.

## Enlaces

- Repositorio Hugging Face (copia): https://huggingface.co/Uhvg856/Qwen-Image-Edit-2509
- Repositorio oficial en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-Edit-2509
- Tech Report (PDF): https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-Image/Qwen_Image.pdf
- Blog: https://qwenlm.github.io/blog/qwen-image-edit/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-Edit
- Repositorio GitHub: https://github.com/QwenLM/Qwen-Image
- Qwen Chat: https://chat.qwen.ai/
- Discord: https://discord.gg/CV4E9rpNSD
- Espejo de Runware: https://huggingface.co/Runware/Qwen-Image-Edit-2509
