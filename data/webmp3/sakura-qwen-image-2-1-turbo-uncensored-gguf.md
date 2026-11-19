# webmp3/Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF

## Resumen

Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF es una cuantización comunitaria en formato GGUF del modelo de difusión de texto a imagen Qwen/Qwen-Image-2.1-Turbo, publicada por el usuario webmp3. El modelo base es un Diffusion Transformer (DiT) de aproximadamente 7B parámetros destilado a 8 pasos, y esta versión incorpora además un codificador de texto Qwen3-VL-8B "abliterado" (sin censura) que sustituye al codificador oficial. El resultado es un pipeline de generación de imágenes que acepta indicaciones en lenguaje natural y produce imágenes de 1024x1024 en unos 8 pasos de muestreo.

La relevancia de esta ficha radica en que combina dos piezas: por un lado, una cuantización eficiente del DiT que permite ejecutarlo en hardware de consumo; por otro, un text encoder modificado para eliminar los rechazos de contenido restringido. El repositorio incluye tanto los pesos del modelo de imagen en varias cuantizaciones (Q8_0, Q5_K_M, Q4_K_M) como el text encoder en GGUF de 8 y 4 bits, además del VAE oficial. Está pensado para ejecutarse con stable-diffusion.cpp o ComfyUI.

El autor declara explícitamente que es un trabajo independiente no respaldado por Alibaba/Qwen, que la licencia es la Qwen Research License (uso no comercial) y que el contenido está dirigido a adultos. El repositorio acumula más de 25.000 descargas y 41 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) destilado a 8 pasos, con text encoder Qwen3-VL-8B abliterado |
| Parametros totales | 7.115.124.736 (modelo de imagen, dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no aplica contexto de texto) |
| Tipos de cuantizacion | GGUF: Q8_0 (7,07 GiB), Q5_K_M (4,60 GiB), Q4_K_M (3,77 GiB) para el DiT; text encoder en GGUF Q8_0 (8,11 GiB), Q4_K_M (4,68 GiB) y BF16 safetensors (16,3 GiB) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License Agreement), uso no comercial |
| Formato de pesos | GGUF (modelo de imagen y text encoder), safetensors (text encoder BF16 y VAE) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo es un Diffusion Transformer de aproximadamente 7B parámetros destilado para generar imágenes en 8 pasos de muestreo. Esta versión comunitaria no reentrena el DiT: lo cuantiza a GGUF en tres niveles (Q8_0, Q5_K_M y Q4_K_M) y lo empareja con un codificador de texto Qwen3-VL-8B que ha sido sometido a un proceso de "abliteración" para eliminar los mecanismos de rechazo de contenido. El VAE se mantiene sin modificar respecto al archivo oficial de Comfy-Org, con el mismo hash SHA-256.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base, ya que la model card no los detalla. La innovación técnica destacable de esta publicación es la sustitución del text encoder oficial por uno abliterado, junto con la disponibilidad de cuantizaciones ligeras que reducen el peso del DiT de 7,07 GiB (Q8_0) a 3,77 GiB (Q4_K_M). El autor indica que la cuantización Q8_0 del text encoder es la más fiel al encoder oficial en sus pruebas de imagen.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en lenguaje natural, con resolución de 1024x1024 y 8 pasos de muestreo (CFG 1.0, sampler euler, sigmas oficiales de Turbo).
- Estilos diversos: arte conceptual de fantasía, carteles de cine, key visuals de anime, fotografía de retrato, fotografía de vida salvaje, ilustraciones ukiyo-e, escenas urbanas nocturnas y macrofotografía, según los ejemplos de la model card.
- Text encoder abliterado que elimina los rechazos de contenido restringido, lo que permite generar contenido para adultos no apto para todo público.
- Compatibilidad con stable-diffusion.cpp (CLI y servidor) y con ComfyUI mediante el nodo Unet Loader (GGUF).
- Soporte de cuantizaciones de 4 y 5 bits para reducir requisitos de VRAM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- **Generación de arte conceptual para videojuegos y cine**: el modelo produce escenas amplias y detalladas (ciudades flotantes, mechas, paisajes) en 8 pasos, lo que permite iterar rápidamente sobre bocetos visuales con prompts descriptivos.
- **Creación de key visuals e ilustraciones de estilo anime**: los ejemplos de la model card incluyen festivales de farolillos y retratos de personajes, adecuados para portadas, carteles y material promocional de proyectos de animación.
- **Fotografía sintética de retrato y naturaleza**: los prompts de retrato de pescador y de leopardo de las nieves demuestran capacidad para generar imágenes fotorrealistas con profundidad de campo y detalle de textura.
- **Ilustración editorial y de estampas**: el ejemplo de ukiyo-e con sello rojo muestra que el modelo puede reproducir estilos gráficos históricos con líneas y colores planos, útil para publicaciones y merchandising.
- **Prototipado rápido en hardware de consumo**: con la cuantización Q4_K_M (3,77 GiB) y el text encoder de 4 bits (4,68 GiB), el pipeline puede ejecutarse en GPUs con menos VRAM, lo que facilita la experimentación local sin infraestructura de datacenter.
- **Investigación sobre alineación y censura en modelos generativos**: la comparación entre este repositorio y el repositorio hermano con el encoder oficial permite estudiar qué cambia la abliteración en las imágenes generadas con los mismos prompts y semillas.
- **Integración en pipelines de ComfyUI**: al cargarse con Unet Loader (GGUF) y Load CLIP con tipo `qwen_image`, puede incorporarse a flujos de trabajo nodales existentes para generación por lotes o composición con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta datos de ejecución: aproximadamente 77 segundos por imagen (incluyendo carga del modelo) en stable-diffusion.cpp con Vulkan sobre una Radeon 8060S, con un pico de 18,3 GiB de memoria GPU en uso durante la generación (de los cuales 1,5 GiB ya estaban en uso antes de la ejecución).

## Requisitos de hardware

- **VRAM estimada**: el autor reporta un pico de 18,3 GiB de memoria GPU en uso durante la generación con el DiT Q8_0 y el text encoder de 8 bits. Con cuantizaciones menores (Q4_K_M del DiT y 4 bits del encoder) el requisito debería reducirse, aunque no se proporcionan cifras exactas.
- **GPU recomendadas**: el autor empleó una Radeon 8060S con Vulkan. No se especifican GPU NVIDIA, pero por el peso de los archivos (7,07 GiB el DiT Q8_0 y 8,11 GiB el encoder de 8 bits) se requiere una GPU con al menos 16-24 GiB de VRAM para la configuración completa en 8 bits.
- **¿Cabe en GPU de consumo?**: con la configuración Q8_0 + encoder 8 bits, el pico de 18,3 GiB sugiere que cabe en GPUs de 24 GiB (RTX 3090, RTX 4090). Las cuantizaciones Q4_K_M (3,77 GiB) y el encoder de 4 bits (4,68 GiB) reducen el total por debajo de los 12 GiB, lo que podría permitir su ejecución en GPUs de 12-16 GiB, aunque no se confirma con datos.
- **Opciones de despliegue**: stable-diffusion.cpp (`sd-cli` / `sd-server`, commit `228c707` con Vulkan) y ComfyUI (Unet Loader GGUF, Load CLIP con tipo `qwen_image`, Load VAE).
- **Latencia y throughput**: aproximadamente 77 segundos por imagen de 1024x1024 en 8 pasos con la configuración indicada, incluyendo carga del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF | 7,1B (DiT) + encoder Qwen3-VL-8B | no aplica | ~77 s/imagen en Radeon 8060S (Vulkan) | qwen-research (no comercial) | Hugging Face, GGUF |
| Qwen/Qwen-Image-2.1-Turbo (oficial) | 7,1B (DiT) | no aplica | no disponible | qwen-research | Hugging Face |
| Sakura-Qwen-Image-2.1-Turbo-GGUF (repositorio hermano, encoder oficial) | 7,1B (DiT) + encoder oficial | no aplica | no disponible | qwen-research | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- **Uso no comercial**: la licencia qwen-research restringe el uso a fines no comerciales; cualquier despliegue en producción con ánimo de lucro requiere una licencia aparte del titular original.
- **Contenido para adultos**: el modelo está marcado como `not-for-all-audiences` y el autor advierte que es solo para adultos, siendo el usuario responsable del contenido generado y de las leyes aplicables.
- **Sesgos**: no se documentan sesgos específicos, pero al derivar de un modelo base y un text encoder abliterado, es probable que herede sesgos de los datos de entrenamiento originales y que la eliminación de rechazos amplíe la generación de contenido sesgado o dañino.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible en las imágenes y detalles incoherentes, especialmente en cuantizaciones bajas.
- **Fidelidad de la cuantización**: el autor indica que la cuantización Q8_0 del text encoder es la más cercana al encoder oficial; las versiones de 4 bits pueden degradar la calidad de la generación.
- **Soporte de idiomas**: no disponible; no se especifica qué idiomas distintos del inglés maneja el encoder.
- **Trabajo independiente**: no está respaldado por Alibaba/Qwen, por lo que no hay garantías de soporte ni de mantenimiento.
- **Requisitos de VRAM**: la configuración completa en 8 bits supera los 18 GiB en uso, lo que excluye GPUs de consumo de gama media sin recurrir a cuantizaciones menores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Repositorio hermano con encoder oficial: https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-Turbo-GGUF
- VAE oficial: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp/releases
