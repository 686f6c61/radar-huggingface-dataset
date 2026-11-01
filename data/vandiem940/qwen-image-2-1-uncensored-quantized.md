# vandiem940/Qwen-Image-2.1-Uncensored-Quantized

## Resumen

Qwen-Image-2.1-Uncensored-Quantized es una redistribución cuantizada del modelo de generación de imágenes Qwen/Qwen-Image-2.1, publicada por el usuario vandiem940 (con enlaces internos al espacio abenzerps). El repositorio empaqueta los pesos del transformer de difusión en múltiples formatos —GGUF, safetensors FP8/INT8/NVFP4 y MLX para Apple Silicon— junto con los componentes auxiliares necesarios (text encoder Qwen3-VL de 8B y VAE) para su uso directo en ComfyUI mediante el nodo ComfyUI-GGUF.

El modelo base cuenta con 7.115.124.736 parámetros en el transformer de difusión, según los metadatos de safetensors del repositorio, y está orientado a la generación de imágenes texto-a-imagen. La etiqueta "Uncensored" indica que el autor ha retirado o atenuado los filtros de contenido del modelo original, lo que tiene implicaciones legales y de moderación relevantes para cualquier despliegue en producción.

La relevancia práctica de esta ficha radica en que permite ejecutar un modelo de difusión de gran tamaño en hardware de consumo mediante cuantizaciones de 4 a 8 bits (desde 4,00 GB en MLX 4-bit hasta 14,23 GB en BF16), algo imposible con los pesos originales en BF16. El repositorio completo ocupa 105,2 GB y acumula 94 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para texto-a-imagen (base: Qwen-Image-2.1); text encoder Qwen3-VL 8B; VAE propio |
| Parametros totales | 7.115.124.736 (transformer de difusión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, MLX), más text encoder y VAE en safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un transformer de difusión para generación de imágenes condicionada por texto. Esta redistribución no entrena ni modifica la arquitectura: aplica cuantizaciones post-entrenamiento sobre los pesos upstream de Qwen. El pipeline completo requiere tres componentes: el transformer de difusión (el que se cuantiza en los distintos formatos), un text encoder basado en Qwen3-VL de 8B parámetros y un VAE específico del modelo (qwen_image_2.1_vae_bf16.safetensors, 676 MB).

La variante INT8 ConvRot sugiere una cuantización por rotación de convolución orientada a preservar calidad en GPUs compatibles; NVFP4 es el formato de 4 bits de NVIDIA para arquitecturas Blackwell y posteriores; los formatos MLX están optimizados para Apple Silicon. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF o DPO. La etiqueta "Uncensored" indica que el autor ha modificado los pesos o los filtros del modelo original, pero la model card no documenta la metodología exacta de ese proceso.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante el pipeline de difusión.
- Integración nativa con ComfyUI a través del nodo ComfyUI-GGUF (fork de leejet con soporte para Qwen-Image 2.1).
- Ejecución en GPUs de consumo gracias a las cuantizaciones GGUF de 4 a 8 bits y a los formatos MLX para Apple Silicon.
- Soporte de precisión FP8, INT8 ConvRot y NVFP4 en GPUs que lo permitan, con menor huella de memoria.
- Text encoder Qwen3-VL 8B incluido, lo que aporta comprensión multimodal de la instrucción (texto e imagen de referencia, según las capacidades del encoder).
- Variante "Uncensored": genera contenido sin los filtros de seguridad del modelo original (ver limitaciones).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de audio.

## Casos de uso

- Generación de ilustraciones para prototipado rápido: con la cuantización Q4_K_M (4,60 GB) el modelo cabe en una RTX 3060 de 12 GB junto con el text encoder INT8, permitiendo iterar prompts en local sin depender de APIs.
- Creación de assets para videojuegos indie: el pipeline en ComfyUI permite generar variaciones de personajes y entornos con control fino del grafo de nodos, integrándose en un flujo de trabajo por lotes.
- Diseño conceptual y moodboards: el text encoder Qwen3-VL 8B permite condicionar la generación con descripciones largas y referencias visuales, útil para explorar direcciones de arte antes de producir assets finales.
- Investigación sobre cuantización de modelos de difusión: el repositorio ofrece el mismo modelo en ocho formatos distintos (BF16, FP8, INT8, NVFP4, MLX 4/6/8-bit y GGUF Q4-Q8), lo que facilita estudios comparativos de calidad frente a tamaño.
- Despliegue en Mac con Apple Silicon: los formatos MLX 4-bit (4,00 GB) y 6-bit (5,78 GB) permiten ejecutar el modelo en portátiles Mac con memoria unificada, sin GPU dedicada.
- Generación de contenido sin restricciones de filtro para investigación en seguridad y alineación: la variante "Uncensored" permite estudiar el comportamiento del modelo ante prompts que el original rechazaría, siempre en un entorno controlado y con las salvaguardas legales oportunas.
- Automatización de banners y creatividades publicitarias: mediante scripts que invocan ComfyUI en modo headless con el GGUF Q5_K_M (5,22 GB) para equilibrar calidad y velocidad en un servidor con GPU de gama media.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) con resultados del modelo base, pero no se proporcionan los valores numéricos en texto. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer según cuantización: BF16 ≈ 14,23 GB; FP8 ≈ 6,63 GB; INT8 ConvRot ≈ 6,76 GB; NVFP4 ≈ 4,20 GB; GGUF Q8_0 ≈ 7,59 GB; Q6_K ≈ 5,88 GB; Q5_K_M ≈ 5,22 GB; Q4_K_M ≈ 4,60 GB; Q4_0 ≈ 4,15 GB; MLX 4-bit ≈ 4,00 GB.
- A esa cifra hay que sumar el text encoder: 17,53 GB en BF16 o 9,35 GB en INT8 ConvRot, más el VAE (676 MB). En la práctica, la combinación recomendada (GGUF Q4_K_M + text encoder INT8 + VAE) ronda los 15 GB de memoria total.
- GPU recomendadas: A100/H100 para BF16 y FP8 con máxima calidad; RTX 4090 (24 GB) para FP8 o Q8_0 sin problemas; RTX 3090/4080 (16-24 GB) para Q6_K o Q5_K_M; RTX 3060/4060 Ti (12-16 GB) para Q4_K_M con text encoder INT8.
- NVFP4 requiere GPUs NVIDIA Blackwell (serie RTX 50 o B200) para aprovechar el formato nativo de 4 bits.
- Apple Silicon: los formatos MLX 4/6/8-bit permiten ejecución en Mac con memoria unificada; se recomienda al menos 16 GB para MLX 4-bit y 24 GB o más para MLX 8-bit.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet) para GGUF; ComfyUI nativo para safetensors FP8/INT8/NVFP4; MLX para Apple Silicon. No se documenta soporte para vLLM, TGI ni llama.cpp puro (el modelo es de difusión, no un LLM).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto / resolucion | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Uncensored-Quantized (esta ficha) | 7,12 B | No disponible | GGUF, FP8, INT8, NVFP4, MLX, BF16 | qwen-research | HuggingFace, 94 descargas |
| Qwen/Qwen-Image-2.1 (base) | 7,12 B | No disponible | Safetensors BF16 | qwen-research | HuggingFace (oficial) |
| FLUX.1-dev (referencia de la categoría) | 12 B | No disponible | Safetensors, GGUF (comunidad) | non-commercial | HuggingFace, muy extendido |
| Stable Diffusion 3.5 Large | 8 B | No disponible | Safetensors, GGUF (comunidad) | stability-ai community | HuggingFace |

La comparativa con FLUX.1-dev y SD 3.5 Large se ofrece como referencia de categoría (modelos texto-a-imagen de 7-12 B parámetros con soporte de cuantización comunitaria); no se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una jerarquía objetiva.

## Limitaciones y advertencias

- La variante "Uncensored" elimina o atenúa los filtros de seguridad del modelo original; su uso para generar contenido dañino, ilegal o que vulnere derechos de terceros es responsabilidad exclusiva del usuario y puede contravenir la licencia qwen-research.
- La licencia qwen-research impone restricciones de uso; conviene revisar los términos exactos antes de cualquier despliegue comercial, ya que "other" en HuggingFace no equivale a permisividad.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible en la imagen, artefactos en manos y rostros, y desviaciones del prompt.
- El proceso de cuantización (especialmente Q4_0 y MLX 4-bit) puede degradar la fidelidad respecto a BF16; el autor recomienda Q4_K_M como equilibrio, pero no aporta métricas objetivas de la pérdida de calidad.
- No se documentan los idiomas soportados por el text encoder en esta ficha; el rendimiento con prompts en castellano no está verificado.
- La model card no detalla el método exacto de "uncensoring" ni qué pesos se han modificado, lo que dificulta auditar el comportamiento del modelo.
- El repositorio tiene 0 likes y 94 descargas, lo que sugiere poca validación comunitaria; conviene verificar la integridad de los archivos antes de usarlos en producción.
- El tamaño total del repo (105,2 GB) implica una descarga considerable; se recomienda descargar solo la cuantización y los componentes necesarios.
- No se dispone de información sobre sesgos demográficos específicos del modelo base ni de esta variante.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vandiem940/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (original de city96): https://github.com/city96/ComfyUI-GGUF
- Formulario de peticiones de modelos del autor: https://abenzerps.com/request-a-model/
- Repositorio espejo referenciado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
