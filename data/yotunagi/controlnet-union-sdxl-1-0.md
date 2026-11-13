# yotunagi/controlnet-union-sdxl-1.0

## Resumen

ControlNet++ Union SDXL 1.0 es un modelo de control adicional (ControlNet) para Stable Diffusion XL que unifica más de diez tipos de condicionamiento espacial en una única red de aproximadamente 1.260 millones de parámetros. Lo publica el usuario yotunagi como espejo del trabajo original de xinsir6 (proyecto ControlNetPlus), y su relevancia radica en que elimina la necesidad de cargar un ControlNet distinto por cada tipo de control: una sola red cubre pose, profundidad, Canny, lineart, tile, inpainting, outpainting y edición avanzada. Está pensado para integrarse en pipelines de difusión mediante la librería diffusers y se distribuye en formato safetensors con licencia Apache 2.0.

La arquitectura parte del ControlNet original y añade dos módulos: un codificador de condición compartido que permite reutilizar los mismos parámetros para distintos tipos de control, y un mecanismo de fusión aprendida que admite varias condiciones simultáneas sin incrementar el coste computacional. El entrenamiento se realizó sobre más de 10 millones de imágenes de alta calidad con recaptions generados por CogVLM, lo que mejora el seguimiento de prompts.

El modelo está orientado a generación y edición de imagen de alta resolución y cualquier relación de aspecto, con compatibilidad con otros checkpoints SDXL y LoRAs. La ficha se basa en la model card del autor y en los metadatos del repositorio; no se han publicado resultados cuantitativos de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet sobre SDXL (transformer de difusión con codificador de condición compartido y fusión de condiciones) |
| Parametros totales | 1.255.958.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp16/bf16 según el checkpoint) |
| Idiomas soportados | no disponible (el condicionamiento textual depende del codificador de texto de SDXL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es una extensión del ControlNet clásico adaptada a SDXL. Sobre la arquitectura base se introducen dos módulos nuevos: uno que permite que una misma red procese distintos tipos de condición de imagen mediante un codificador de condición compartido, y otro que aprende la fusión de múltiples condiciones de entrada sin aumentar los parámetros ni el coste de cómputo. Según el autor, el número de parámetros es prácticamente idéntico al de un ControlNet original, de modo que no hay una penalización apreciable en memoria o latencia frente a un ControlNet convencional.

El entrenamiento empleó más de 10 millones de imágenes de alta calidad con bucket training al estilo NovelAI, lo que habilita la generación en cualquier relación de aspecto y a resoluciones elevadas. Las prompts se recaptionaron con CogVLM siguiendo el enfoque de DALL·E 3 para mejorar la fidelidad al texto. El autor menciona el uso de data augmentation, múltiples funciones de pérdida y entrenamiento multirresolución, aunque no detalla la composición exacta del dataset ni si hubo fases de RLHF o DPO (no aplicables en un modelo de difusión de este tipo). La variante ProMax añade cinco funciones de edición avanzada (tile deblur, tile variation, tile super resolution, inpainting y outpainting) sobre los doce controles base.

## Capacidades

- Condicionamiento espacial con más de diez tipos de control: OpenPose, Depth, Canny, Lineart, AnimeLineart, Tile, Inpainting, Outpainting, entre otros.
- Generación de imagen texto-a-imagen de alta resolución y con relaciones de aspecto arbitrarias gracias al bucket training.
- Fusión de múltiples condiciones en una sola pasada, con la combinación aprendida durante el entrenamiento y sin hiperparámetros manuales.
- Edición de imagen avanzada en la variante ProMax: deblur por tile, variación por tile, superresolución (ejemplo del autor de 1 MP a 9 MP), inpainting y outpainting.
- Compatibilidad con checkpoints SDXL de terceros (BluePencilXL, CounterfeitXL) y con LoRAs.
- Seguimiento de prompts mejorado por el recaptioning con CogVLM.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de difusión de imagen, no un LLM.

## Casos de uso

- Generación de ilustración con pose controlada: se extrae el esqueleto con OpenPose y se condiciona la difusión para fijar la postura del personaje, útil en storyboards y previsualización de animación.
- Transferencia de estructura en diseño de producto: a partir de un boceto lineart o Canny se generan variantes fotorrealistas manteniendo la geometría exacta del concepto.
- Restauración y mejora de imágenes: el modo tile deblur y superresolución permite escalar de 1 MP a 9 MP y recuperar detalle en fotografías antiguas o de baja calidad.
- Inpainting y outpainting en flujos de retoque: eliminación de objetos no deseados y extensión de encuadres para adaptar imágenes a distintos formatos editoriales o de redes sociales.
- Prototipado rápido en estudios de diseño: combinación de profundidad y lineart en una sola pasada para iterar sobre composiciones sin cambiar de modelo entre condiciones.
- Integración en pipelines de producción con diffusers: al ser un único safetensors compatible con SDXL y LoRA, simplifica el despliegue y reduce el número de checkpoints a gestionar en servidores de generación.
- Generación de assets para videojuegos: control de silueta y profundidad para producir sprites o texturas coherentes con la perspectiva de la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma una calidad visual comparable a Midjourney y una capacidad de control superior, sin cifras de FID, CLIP score ni comparaciones numéricas con otros ControlNet.

## Requisitos de hardware

- VRAM estimada: al tratarse de un ControlNet de ~1,26 mil millones de parámetros, el checkpoint en precisión media ocupa aproximadamente 2,5 GB. Sumado al UNet de SDXL (unos 5 GB en fp16) y al VAE, la inferencia completa requiere del orden de 8-10 GB de VRAM en fp16, y alrededor de 6-8 GB con cuantización del UNet.
- GPU recomendadas: NVIDIA A100 o H100 para producción de alto throughput; RTX 4090 (24 GB) para generación a resolución alta sin offloading; RTX 3090 y RTX 4080 como alternativas de consumo.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con cuantización y atención optimizada; en 6 GB requiere offloading del codificador de texto o del VAE.
- Opciones de despliegue: diffusers (integración nativa del ControlNet), ComfyUI y Automatic1111/Forge mediante los nodos o extensiones de ControlNet; también es posible exportar a otros runtimes de difusión, aunque no se documenta soporte oficial para llama.cpp, Ollama, vLLM ni TGI, que no están orientados a difusión de imagen.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Tipos de control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ControlNet++ Union SDXL 1.0 (yotunagi) | 1.255.958.800 | alta resolución, cualquier aspecto | 10+ unificados y fusión multi-condición | Apache 2.0 | Hugging Face (diffusers) |
| ControlNet original SDXL (lllyasviel) | ~1,2 mil millones por variante | resolución SDXL | 1 por checkpoint | Apache 2.0 | Hugging Face |
| ControlNet Union SDXL (xinsir) | no disponible en la información | alta resolución | 10+ unificados | Apache 2.0 | Hugging Face |
| T2I-Adapter SDXL | no disponible en la información | resolución SDXL | varios adaptadores ligeros | Apache 2.0 | Hugging Face |

La ventaja principal frente al ControlNet clásico es la unificación de condiciones y la fusión multi-condición sin coste adicional; frente a T2I-Adapter, el autor reporta mayor capacidad de control al mantener la arquitectura ControlNet completa.

## Limitaciones y advertencias

- No se han publicado evaluaciones cuantitativas ni auditorías de sesgo; el modelo hereda los sesgos del dataset de más de 10 millones de imágenes y del checkpoint SDXL sobre el que opera.
- Riesgo de alucinación visual: puede generar detalles plausibles pero incorrectos en zonas con poco condicionamiento, especialmente en outpainting y superresolución.
- El rendimiento depende del checkpoint SDXL base y de la calidad de los mapas de control (pose, profundidad, etc.); mapas ruidosos degradan el resultado.
- La model card no documenta el soporte multilingüe de prompts; el condicionamiento textual queda limitado por el codificador de texto de SDXL.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar también la licencia del checkpoint SDXL base y de los modelos auxiliares utilizados.
- El repositorio de yotunagi es un espejo con 0 descargas y 0 likes; conviene contrastar la integridad de los pesos con el repositorio original de xinsir6 antes de usarlo en producción.
- La variante ProMax y las funciones de edición avanzada se documentan de forma parcial; el autor indica que las instrucciones detalladas se añadirían más adelante.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/yotunagi/controlnet-union-sdxl-1.0
- Repositorio original del autor: https://huggingface.co/xinsir/controlnet-union-sdxl-1.0
- Código e instrucciones de inferencia: https://github.com/xinsir6/ControlNetPlus/tree/main
- Documentación de diffusers para ControlNet: https://huggingface.co/docs/diffusers/using-diffusers/controlnet
- Stable Diffusion XL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
