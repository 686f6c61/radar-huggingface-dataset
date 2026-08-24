# TechnoBaptist/MiniMax-H3-Fun-Controlnet-Union

## Resumen

MiniMax-H3-Fun-Controlnet-Union es un adaptador de tipo ControlNet-Union para el modelo de generación de vídeo MiniMax-H3, desarrollado por TechnoBaptist (aunque el checkpoint original parece proceder de alibaba-pai) y entrenado con el pipeline VideoX-Fun. Un único checkpoint permite condicionar la generación de vídeo con vídeos de control de tipo Canny, Depth, HED, MLSD o Pose, además de soportar inpainting de vídeo, sin necesidad de cambiar de checkpoint según la condición. El archivo de pesos (6,8 GB) contiene únicamente la rama de control, que se carga sobre el transformer base MiniMax-H3. Su relevancia radica en unificar varios tipos de control estructural en un solo modelo, simplificando los flujos de trabajo de vídeo a vídeo y reduciendo la complejidad de despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet-Union para MiniMax-H3 (rama de control con `control_proj_in` y 5 `control_blocks`) |
| Parametros totales | no disponible (el checkpoint de control pesa 6,8 GB; el modelo base MiniMax-H3 no se incluye) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una rama de control (ControlNet) diseñada para el generador de vídeo MiniMax-H3. Según la model card, la rama de control se conecta a 5 de los 50 bloques del transformer base (capas 0, 10, 20, 30 y 40), y cada salto de control se añade a la rama principal mediante una proyección con compuerta cero (zero-gated projection). El entrenamiento se realizó con el pipeline VideoX-Fun, aunque no se proporcionan detalles sobre el dataset, el número de tokens o el proceso de alineación (RLHF/DPO). El checkpoint está destilado para guiado (guidance-distilled), lo que permite ejecutar la inferencia con `guidance_scale = 1.0` y una sola pasada hacia delante por paso, sin necesidad de classifier-free guidance. Además, soporta inpainting ampliando la dimensión de entrada de control a 49 canales (latente + latente enmascarado + máscara).

## Capacidades

- Generación de vídeo a partir de texto y vídeo de control (video-to-video) con condiciones de Canny, Depth, HED, MLSD y Pose, todo con un único checkpoint.
- Inpainting de vídeo: el control se amplía con canales de máscara para rellenar regiones específicas del vídeo.
- Control ajustable mediante `control_context_scale`: valores inferiores a 1.0 debilitan la influencia del vídeo de control, y 0.0 desactiva la rama de control.
- Generación a 24 fps, con duración máxima de 15 segundos y número de fotogramas ajustado a `17 * n + 5` (el mayor valor decodificable por el VAE de vídeo).
- Mantiene la relación de aspecto del vídeo de control dentro de un presupuesto de píxeles `height * width` (múltiplos de 32).
- No requiere classifier-free guidance gracias a la destilación de guiado.

## Casos de uso

- Postproducción de vídeo con control de pose: un creador puede usar un vídeo de referencia de baile (pose) y un prompt textual para generar una nueva secuencia con el mismo movimiento pero con estilo o escena diferente, útil en animación o doblaje.
- Inpainting de vídeo para eliminar objetos no deseados: se proporciona un vídeo con una máscara sobre el elemento a eliminar y el modelo rellena la región de forma coherente con el resto de la escena.
- Generación de vídeo a partir de bocetos (Canny o HED): los artistas pueden dibujar los contornos de una escena y el modelo produce un vídeo fotorrealista siguiendo esas líneas, acelerando el storyboard.
- Control de profundidad para realidad aumentada o efectos visuales: usando un mapa de profundidad de un vídeo real, se puede regenerar la escena con cambios de iluminación o estilo manteniendo la geometría.
- Creación de vídeos con composición controlada por líneas (MLSD): útil para arquitectura o diseño de interiores, donde se parte de un vídeo con líneas estructurales y se genera una versión texturizada.
- Automatización de vídeos de marketing: se parte de un vídeo de producto y se aplica un control de profundidad o pose para generar variaciones con diferentes fondos o personajes, sin necesidad de rodar de nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint de control pesa 6,8 GB, pero requiere cargar el modelo base MiniMax-H3 (cuyo tamaño no se especifica en esta ficha; el repositorio de MiniMax-H3 indica un tamaño de 288 GB en HuggingFace, probablemente en precisión completa). Por tanto, la VRAM necesaria será considerablemente mayor que 6,8 GB.
- No se dispone de datos sobre VRAM estimada, GPUs recomendadas o latencia/throughput.
- Para inferencia se recomienda usar el repositorio VideoX-Fun, que proporciona scripts de ejemplo (`predict_v2v_control.py` y `predict_v2v_control_inpaint.py`).
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; el flujo está orientado a Python con el pipeline de VideoX-Fun.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (ControlNet-Union para vídeo con MiniMax-H3).

## Limitaciones y advertencias

- La licencia es `minimax-h3-community-license-agreement`, que puede imponer restricciones de uso comercial; se recomienda revisar el texto completo de la licencia antes de su uso en producción.
- El modelo depende del modelo base MiniMax-H3, que no se incluye en este repositorio; es necesario descargarlo por separado.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones idiomáticas; al ser un modelo de vídeo, la calidad del resultado depende en gran medida de la calidad del vídeo de control y del prompt.
- La generación está limitada a 15 segundos y a una resolución determinada por el VAE; no se especifican resoluciones máximas.
- El control se debilita si se reduce `control_context_scale`; valores demasiado bajos pueden hacer que el modelo ignore la condición.
- No hay información sobre el rendimiento en hardware específico ni sobre la compatibilidad con otras librerías fuera de VideoX-Fun.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/TechnoBaptist/MiniMax-H3-Fun-Controlnet-Union
- Modelo base MiniMax-H3 (TechnoBaptist): https://huggingface.co/TechnoBaptist/MiniMax-H3
- Repositorio original de alibaba-pai: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union
- Código VideoX-Fun: https://github.com/aigc-apps/VideoX-Fun
- Repositorio GitHub de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Página de tutoriales de MiniMax H3: https://design.minimax.io/h3
