# webmp3/Sakura-Qwen-Image-2.1-Turbo-GGUF

## Resumen

Sakura-Qwen-Image-2.1-Turbo-GGUF es una cuantización comunitaria del modelo de generación de imágenes Qwen/Qwen-Image-2.1-Turbo, publicada por el usuario webmp3 en Hugging Face. Se trata de un modelo de difusión de tipo DiT (Diffusion Transformer) de aproximadamente 7.115 millones de parámetros (7B), destilado para funcionar en 8 pasos de muestreo, y distribuido en formato GGUF para su uso en stable-diffusion.cpp y ComfyUI. No está desarrollado ni respaldado por Alibaba/Qwen; es un trabajo independiente de cuantización del modelo base oficial.

El modelo resuelve el problema de ejecutar un generador de imágenes de alta calidad en hardware de consumo, ofreciendo tres niveles de cuantización (Q8_0, Q5_K_M y Q4_K_M) que reducen el peso del modelo de difusión desde 7,07 GiB hasta 3,77 GiB. Requiere además un codificador de texto externo (Qwen3-VL 8B en int8, 8,71 GiB) y un VAE (0,63 GiB), ambos del repositorio oficial de Comfy-Org.

Es relevante ahora porque la destilación a 8 pasos y el formato GGUF permiten generar imágenes de 1024x1024 en aproximadamente 70 segundos en una GPU integrada (Radeon 8060S) con un pico de 17,6 GiB de memoria de GPU en uso, lo que democratiza el acceso a un modelo de imagen de la familia Qwen en equipos sin GPUs de datacenter. La licencia es estrictamente no comercial (Qwen Research License Agreement).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer), destilado a 8 pasos |
| Parametros totales | 7.115.124.736 (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (7,07 GiB), Q5_K_M (4,60 GiB), Q4_K_M (3,77 GiB) |
| Idiomas soportados | no disponible (modelo text-to-image; los prompts de ejemplo están en inglés) |
| Licencia | qwen-research (Qwen Research License Agreement), solo uso no comercial |
| Formato de pesos | GGUF (modelo de difusión); el codificador de texto y el VAE se distribuyen en safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo es un Diffusion Transformer (DiT) de 7B de parámetros destilado para generar imágenes en 8 pasos de muestreo, lo que reduce drásticamente el coste computacional frente a los modelos de difusión tradicionales de 20-50 pasos. La cuantización comunitaria de webmp3 preserva la arquitectura y los pesos en formato GGUF, con tres niveles de precisión que permiten ajustar el equilibrio entre calidad y requisitos de memoria.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens o imágenes utilizadas, ni sobre si hubo fases de RLHF o DPO en la información proporcionada. La model card indica que el modelo base es una versión "Turbo" destilada, y que la cuantización es un trabajo independiente no endorsado por Qwen. El pipeline de inferencia requiere el codificador de texto oficial Qwen3-VL 8B en int8 (conversión rotacional) y el VAE oficial qwen_image_2.1_vae_bf16, ambos alojados en el repositorio Comfy-Org/Qwen-Image-2.1.

## Capacidades

- Generación de texto a imagen (text-to-image) de alta calidad a 1024x1024 píxeles.
- Generación en 8 pasos de muestreo con CFG 1.0 y sampler euler, gracias a la destilación del modelo Turbo.
- Soporte de prompts detallados y descriptivos, incluyendo escenas complejas, iluminación, estilo artístico y composición (los ejemplos incluyen fantasía, anime, fotografía, ukiyo-e y macro).
- Capacidad de renderizar texto dentro de la imagen (el ejemplo del póster "EMBER CROWN" incluye título y tagline legibles).
- Compatibilidad con stable-diffusion.cpp (sd-cli / sd-server) y ComfyUI mediante el nodo Unet Loader (GGUF).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros modos especiales, al ser un modelo puramente generativo de imágenes.
- Capacidades multilingües: no disponibles en la información proporcionada; los prompts de ejemplo están en inglés.

## Casos de uso

- Generación de concept art para videojuegos y cine: el modelo produce escenas épicas y detalladas (ciudades flotantes, mechas, dragones) en 8 pasos, adecuado para iterar rápidamente sobre ideas visuales en estaciones de trabajo con GPUs de consumo.
- Creación de key visuals para anime y manga: los ejemplos muestran capacidad para estilos pictóricos y escenas nocturnas con iluminación cálida, útil para estudios pequeños que necesitan material promocional sin depender de servicios en la nube.
- Diseño de carteles y pósters con texto integrado: la capacidad de renderizar títulos legibles permite generar maquetas de carteles de películas o eventos, aunque requiere revisión humana para garantizar la fidelidad tipográfica.
- Ilustración editorial y de libros: estilos como ukiyo-e o grabados permiten generar ilustraciones coherentes con briefs artísticos específicos, con la ventaja de ejecución local y sin coste por imagen.
- Fotografía conceptual y mockups: los ejemplos de retrato de pescador o leopardo de las nieves demuestran capacidad fotorrealista con profundidad de campo, útil para maquetas publicitarias o bancos de imágenes internos.
- Prototipado rápido en ComfyUI: al integrarse como nodo Unet Loader (GGUF), permite construir flujos de trabajo con control de seeds, estilos y postprocesado, adecuado para equipos que ya usan ComfyUI en producción creativa.
- Experimentación académica con modelos de difusión cuantizados: el formato GGUF y las tres precisiones permiten estudiar el impacto de la cuantización en la calidad de imagen en hardware limitado, siempre bajo licencia de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta datos de rendimiento de inferencia en su hardware de prueba: aproximadamente 70 segundos por imagen de 1024x1024 (incluyendo carga del modelo), 8 pasos, CFG 1.0, sampler euler, con un pico de 17,6 GiB de memoria de GPU en uso (Radeon 8060S, Vulkan, Windows). No se proporcionan métricas como FID, CLIP score ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico medido por el autor es de 17,6 GiB de memoria de GPU en uso (incluyendo 1,6 GiB previos al run), con el modelo Q8_0 (7,07 GiB) más el codificador de texto int8 (8,71 GiB) y el VAE (0,63 GiB).
- GPU recomendadas: el autor probó con una Radeon 8060S (GPU integrada, Vulkan). Para mayor velocidad se recomiendan GPUs dedicadas con al menos 16-24 GiB de VRAM (RTX 4090, RTX 3090, A100, H100), aunque no se aportan datos de latencia en estas.
- ¿Cabe en GPU de consumo? Sí, con las cuantizaciones Q5_K_M (4,60 GiB) o Q4_K_M (3,77 GiB) el modelo de difusión es más ligero, pero el codificador de texto int8 (8,71 GiB) sigue siendo el componente dominante en memoria; en total se necesita alrededor de 14-18 GiB de VRAM para el pipeline completo.
- Opciones de despliegue: stable-diffusion.cpp (sd-cli / sd-server, build Vulkan probado con commit 228c707) y ComfyUI con nodo Unet Loader (GGUF) que soporte Qwen-Image 2.1.
- Latencia y throughput: aproximadamente 70 segundos por imagen de 1024x1024 en Radeon 8060S con Q8_0, 8 pasos; no se dispone de datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura-Qwen-Image-2.1-Turbo-GGUF | 7B (DiT) | no disponible | GGUF | qwen-research (no comercial) | Hugging Face (webmp3) |
| Qwen/Qwen-Image-2.1-Turbo (base) | 7B (DiT) | no disponible | safetensors | qwen-research | Hugging Face (Qwen) |
| Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF | 7B (DiT) | no disponible | GGUF | qwen-research | Hugging Face (webmp3) |

No se dispone de información sobre otros modelos comparables de la misma categoría (generación de imágenes con DiT de ~7B y destilación a pocos pasos) en la información proporcionada. La comparativa se limita a las variantes del mismo modelo base y su versión sin censura, que incluye codificadores de texto abliterated en 8bit y 4bit.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: la Qwen Research License Agreement prohíbe el uso comercial del modelo y de sus cuantizaciones; cualquier despliegue en producción con fines lucrativos requiere una licencia aparte de Qwen.
- No es un modelo oficial: la cuantización es un trabajo independiente de webmp3, no endorsado por Alibaba/Qwen, por lo que no hay garantías de soporte ni de fidelidad absoluta respecto al modelo base.
- Dependencia de componentes externos: requiere el codificador de texto Qwen3-VL 8B int8 y el VAE oficial de Comfy-Org, que no están incluidos en el repositorio y deben descargarse por separado.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir detalles inconsistentes, texto mal renderizado o anatomías incorrectas, especialmente en prompts complejos o con texto largo.
- Limitaciones de idioma: no se documentan idiomas soportados; los ejemplos y prompts de la model card están en inglés, y no hay evidencia de rendimiento en castellano u otros idiomas.
- Requisitos de memoria elevados: aunque el modelo de difusión es ligero en Q4_K_M (3,77 GiB), el codificador de texto int8 (8,71 GiB) eleva el consumo total a ~14-18 GiB de VRAM, lo que puede excluir a GPUs de gama baja.
- Sin benchmarks publicados: no hay métricas objetivas de calidad (FID, CLIP score) que permitan comparar rigurosamente con alternativas.
- Advertencia de contenido: la variante Uncensored del mismo autor incluye codificadores de texto abliterated, lo que puede generar contenido sin filtros; la versión estándar no documenta filtros de seguridad explícitos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Variante Uncensored: https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Codificador de texto oficial (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors
- VAE oficial (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
- stable-diffusion.cpp (releases): https://github.com/leejet/stable-diffusion.cpp/releases
- Repositorio Comfy-Org Qwen-Image-2.1: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
