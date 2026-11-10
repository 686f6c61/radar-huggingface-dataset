# Uulb/controlnet-openpose-sdxl-1.0

## Resumen

ControlNet OpenPose SDXL 1.0 es un adaptador ControlNet para el modelo base Stable Diffusion XL 1.0, especializado en condicionamiento por pose corporal (OpenPose). Lo desarrolla el usuario xinsir (publicado en el repositorio de Hugging Face bajo el identificador `Uulb/controlnet-openpose-sdxl-1.0`) y se distribuye con licencia Apache 2.0. Su función es permitir que SDXL genere imágenes cuya composición anatómica y postura de los sujetos quede controlada explícitamente mediante esqueletos de keypoints, en lugar de depender únicamente del prompt de texto.

Técnicamente se trata de un módulo ControlNet de aproximadamente 1.251 millones de parámetros (1,25 B), diseñado para inyectarse en el pipeline `StableDiffusionXLControlNetPipeline` de la librería diffusers. No es un modelo generativo autónomo: requiere siempre un modelo base SDXL 1.0 y un VAE compatible (el autor recomienda `madebyollin/sdxl-vae-fp16-fix` para precisión fp16). El repositorio ocupa unos 5 GB y los pesos se distribuyen en formato safetensors.

Su relevancia práctica es doble: por un lado, ofrece control de pose de alta fidelidad sobre SDXL, que es el estándar de facto para generación de imágenes de alta resolución en código abierto; por otro, el autor documenta un ajuste específico del renderizado de esqueletos (grosor de línea proporcional a la resolución) que corrige la inestabilidad del detector OpenPose por defecto de `controlnet_aux`. La model card incluye ejemplos orientados a estilos realista y anime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet (adaptador de condicionamiento sobre Stable Diffusion XL 1.0, transformer difuso con codificador de control) |
| Parametros totales | 1.251.014.160 (1,25 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor usa fp16 en los ejemplos; el formato safetensors es compatible con cuantizaciones de la comunidad, pero no se documentan) |
| Idiomas soportados | no disponible (el condicionamiento textual depende del codificador de texto de SDXL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es un ControlNet clásico, la arquitectura introducida en el paper arXiv:2302.05543, adaptada a la escala de SDXL. Un ControlNet replica parcialmente el codificador del UNet del modelo base y añade conexiones residuales zero-initialized que inyectan la señal de control en las capas del difusor. En este caso la señal de control es un mapa OpenPose: un esqueleto de 18 keypoints (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas y tobillos) dibujado sobre un lienzo. El módulo se entrena para que la generación respete esa estructura de pose mientras el prompt controla apariencia, estilo y contenido.

El modelo se afina a partir de `stabilityai/stable-diffusion-xl-base-1.0`. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF/DPO (no aplicables en un ControlNet, que se entrena con objetivos de difusión supervisados). La innovación técnica documentada no está en el entrenamiento sino en el preprocesado: el autor indica que el detector OpenPose de `controlnet_aux` dibuja líneas demasiado finas respecto a las usadas en el entrenamiento, lo que degrada la estabilidad. Proporciona una versión modificada de `draw_bodypose` que escala el grosor del trazo (`stickwidth * ratio`) y el radio de los keypoints (`4 * ratio`) según la resolución de la imagen (ratio de 1,0 por debajo de 500 px hasta 7,0 por encima de 5000 px), con colores atenuados al 60 % para los miembros. Con ese parche, el condicionamiento resulta más fiable.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por pose corporal mediante esqueletos OpenPose.
- Control explícito de la postura y composición anatómica de los sujetos, independientemente del prompt.
- Compatibilidad con el pipeline `StableDiffusionXLControlNetPipeline` de diffusers.
- Escala de condicionamiento ajustable (`controlnet_conditioning_scale`, con 1.0 como valor de referencia en los ejemplos del autor).
- Funciona con prompts largos y detallados; el autor recomienda descripciones extensas.
- Soporta prompt negativo (el ejemplo usa `longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality`).
- Estilos diversos: la model card muestra resultados en estilo realista (tipo Midjourney) y anime.
- No soporta tool calling, agentes, razonamiento multi-step ni modalidades de audio o vídeo: es exclusivamente un adaptador de control visual.
- No se documentan capacidades multilingües propias; el texto se procesa con el codificador de SDXL.

## Casos de uso

- Producción de ilustración con pose fija: dado un esqueleto OpenPose extraído de una foto de referencia, el modelo reproduce esa postura exacta con el estilo descrito en el prompt. Útil para ilustradores que necesitan coherencia anatómica entre viñetas.
- Storyboarding y cómics: mantener la misma pose de personaje entre paneles generando primero el esqueleto y condicionando cada imagen con él, lo que reduce la deriva anatómica típica de la generación solo por texto.
- Previsualización de animación y rigging: generar poses clave (keyframes) a partir de esqueletos para validar la composición antes de pasar a un pipeline 3D.
- Moda y e-commerce: sustituir la pose de un modelo virtual manteniendo la prenda descrita en el prompt, con el esqueleto como guía de la postura del maniquí.
- Generación de datasets sintéticos etiquetados: producir imágenes con pose conocida (el esqueleto de entrada actúa como anotación de keypoints) para entrenar detectores de pose o modelos de visión.
- Control de composición en publicidad: fijar la postura de los sujetos de un anuncio para que encajen con un layout y un copy predeterminados, iterando solo el prompt de estilo.
- Integración en herramientas de edición: dentro de una interfaz tipo ComfyUI o A1111, usar el adaptador como capa de control sobre SDXL para flujos de trabajo de img2img con pose preservada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, precisión de keypoints ni comparativas numéricas); solo muestra galerías de imágenes de ejemplo en estilos realista y anime.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un pipeline SDXL con ControlNet en fp16 requiere típicamente entre 12 y 16 GB de VRAM para resoluciones de 1024×1024, y el adaptador añade ~2,5 GB de pesos en fp16 (1,25 B de parámetros). Estas cifras son estimaciones de la categoría, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por categoría del modelo base, se emplean habitualmente A100, H100, L40S y RTX 4090.
- GPU de consumo: previsiblemente ejecutable en RTX 4090 (24 GB) y en GPUs de 16 GB con optimizaciones; en GPUs de 8-12 GB requeriría cuantización o descarga de componentes a CPU, sin datos confirmados.
- Opciones de despliegue: diffusers (`StableDiffusionXLControlNetPipeline`), ComfyUI, Automatic1111/Forge y otros frontends que acepten ControlNet SDXL. No se documenta soporte nativo en vLLM, TGI, llama.cpp ni Ollama (no aplican a difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Base | Licencia | Notas |
|---|---|---|---|---|---|
| Uulb/controlnet-openpose-sdxl-1.0 (este) | ControlNet OpenPose | 1,25 B | SDXL 1.0 | Apache 2.0 | Requiere parche de `draw_bodypose` para estabilidad; ejemplos realista y anime |
| xinsir/controlnet-openpose-sdxl-1.0 | ControlNet OpenPose | no disponible | SDXL 1.0 | Apache 2.0 | Repositorio de referencia del que este parece derivar (mismo nombre y autoría declarada); no se dispone de comparativa numérica |
| lllyasviel/control_v11p_sd15_openpose | ControlNet OpenPose | no disponible | SD 1.5 | no disponible | Alternativa para SD 1.5, menor resolución nativa (512 px) que SDXL |
| stabilityai/control-lora-openposeXL-2 | ControlLoRA OpenPose | no disponible | SDXL 1.0 | no disponible | Variante LoRA, menor huella en disco pero distinto equilibrio calidad/control |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin SDXL 1.0 y un VAE compatible no genera nada. El autor recomienda `madebyollin/sdxl-vae-fp16-fix` cuando se usa fp16.
- Inestabilidad con el detector OpenPose por defecto de `controlnet_aux`: el grosor de línea del preprocesado no coincide con el del entrenamiento. Es necesario aplicar el parche de `draw_bodypose` documentado en la model card para obtener resultados fiables.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en la misma fecha (2026-11-10). No hay evidencia de validación por la comunidad ni de mantenimiento posterior.
- La model card declara autoría de "xinsir" pero se publica bajo el identificador `Uulb`; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- Riesgo de alucinación anatómica: como todo modelo de difusión, puede generar manos y extremidades incorrectas; el prompt negativo del autor mitiga parcialmente este problema.
- Sesgos: no documentados por el autor. Como modelo derivado de SDXL, hereda los sesgos del dataset de entrenamiento del modelo base (representación demográfica, estereotipos de género y culturales).
- Limitaciones de idioma: no documentadas; el rendimiento del prompt depende del codificador de texto de SDXL, con mejor soporte en inglés.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso del modelo base SDXL está sujeto a su propia licencia (OpenRAIL++-M en el caso de SDXL 1.0), que impone restricciones adicionales de uso.
- No se documentan cuantizaciones oficiales ni métricas de calidad; cualquier cifra de VRAM o latencia debe validarse empíricamente antes de dimensionar infraestructura.

## Enlaces

- Hugging Face: https://huggingface.co/Uulb/controlnet-openpose-sdxl-1.0
- Repositorio de referencia declarado por el autor: https://huggingface.co/xinsir/controlnet-openpose-sdxl-1.0
- Paper de ControlNet: https://arxiv.org/abs/2302.05543
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE recomendado: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Librería diffusers: https://github.com/huggingface/diffusers
- Paquete controlnet_aux (preprocesado OpenPose): https://github.com/huggingface/controlnet_aux
