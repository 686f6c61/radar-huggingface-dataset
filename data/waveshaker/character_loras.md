# waveshaker/character_loras

## Resumen

`waveshaker/character_loras` es una colección de adaptadores LoRA para generación de imágenes texto-a-imagen, orientada a la reproducción de personajes concretos sobre distintos modelos base. El autor, `waveshaker`, publica en un único repositorio de Hugging Face un conjunto de LoRAs entrenados para bases heterogéneas: Krea-2-Raw y Krea-2-Turbo (los modelos base declarados en la model card), además de Flux.1-dev, Pony, SD1.5, Moss Image y Anima, según se desprende de los ejemplos de la propia card. No se trata de un modelo fundacional, sino de pesos de adaptación de bajo rango que modifican el comportamiento de un modelo de difusión ya existente.

El repositorio es relevante para quien trabaje con pipelines de generación de personajes consistentes: permite reutilizar un mismo identificador de personaje (por ejemplo `AthenaPalomino`, `yi_youyou`, `JuNail` o `CHRISTIE FROM DEAD OR ALIVE`) en distintas bases con un único punto de descarga. El tamaño del repositorio, 72 GB, refleja que contiene múltiples LoRAs y material auxiliar (previews, datasets, herramientas), no un único adaptador ligero.

La información técnica disponible es limitada: la model card documenta con detalle la configuración de entrenamiento para las variantes Moss Image y Krea2, pero no publica parámetros totales, longitud de contexto (no aplica a un modelo de difusión) ni resultados de benchmarks. La licencia es MIT según los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelos de difusión texto-a-imagen; bases declaradas Krea-2-Raw y Krea-2-Turbo, con soporte adicional para Flux.1-dev, Pony, SD1.5, Moss Image y Anima |
| Parametros totales | no disponible (depende del rango y del módulo adaptado de cada LoRA; la config documentada usa rank 16 en la variante Moss Image) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión; la ventana relevante es la longitud del prompt, no disponible) |
| Tipos de cuantizacion | Los LoRA se distribuyen en formato Diffusers sharded bfloat16 y en single-file int8 para ComfyUI, según la config de entrenamiento documentada; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (Diffusers sharded bfloat16) y single-file int8 (ComfyUI); no se confirma GGUF |

## Arquitectura y entrenamiento

Cada LoRA es un adaptador de bajo rango insertado en un modelo de difusión base. La model card documenta dos configuraciones de entrenamiento. Para **Moss Image** se usaron OneTrainer (fork de Koratahiu, rama `moss-image`), Fizgig y Fizgig-Advanced (fork de Murf-Code). El dataset típico es de 50+ imágenes (media de 100+), con repeticiones de 50+ por imagen y etiquetado mixto (tags tipo Booru como prefijo combinados con lenguaje natural). Los parámetros: resolución de entrenamiento 512, LR entre 1,5e-04 y 2,5e-04, batch size 3-4, atención `torch CuDNN` en lugar de SDPA, y preset `Moss-Image Fast (rank 16, 0.25MP)` en Fizgig. Para **Krea2** se empleó OneTrainer con un dataset similar de 50+ imágenes y etiquetado mixto.

La card incluye una discusión técnica sobre el escalado de learning rate respecto al batch size efectivo, citando tres papers: la regla de escalado lineal de Goyal et al. (2017), la regla de raíz cuadrada de Krizhevsky (2014) y un trabajo de 2026 sobre el batch size como parámetro de primer orden en LoRA. El autor aporta benchmarks de velocidad de entrenamiento (39 imágenes, 0,26 MP, r16): OneTrainer ~0,37 s/imagen (17m 43s), Fizgig ~0,83 s/imagen (36m 17s) y Fizgig-Advanced ~0,69 s/imagen (31m 20s). No se documenta el número total de tokens, la composición exacta del dataset ni si hubo RLHF/DPO (no aplica en este tipo de adaptadores).

## Capacidades

- Generación de imágenes texto-a-imagen condicionada a un personaje concreto mediante un identificador textual (trigger word) en el prompt.
- Compatibilidad con múltiples bases: Krea-2-Raw, Krea-2-Turbo, Flux.1-dev, Pony, SD1.5, Moss Image y Anima, según los ejemplos de la model card.
- Estilización controlable mediante el prompt: retrato cinematográfico nocturno, retrato editorial de moda, ilustración anime, retrato con luz natural, etc.
- Etiquetado mixto Booru + lenguaje natural, lo que permite prompts tanto con tags como en prosa.
- Integración en flujos ComfyUI (formato single-file int8) y Diffusers (sharded bfloat16).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de imagen, no un LLM.
- Capacidades multilingües: no documentadas; los ejemplos de la card están en inglés.

## Casos de uso

- **Generación de personajes consistentes en producción editorial**: usar el trigger word del personaje con Krea-2-Turbo para producir variaciones de retrato (luz, encuadre, vestuario) manteniendo la identidad visual, útil en campañas de moda o ilustración serializada.
- **Prototipado rápido de personajes para videojuegos o cómics**: el LoRA permite iterar sobre un diseño de personaje con prompts cortos y un identificador estable, reduciendo el coste frente a reentrenar un modelo completo.
- **Integración en ComfyUI para pipelines de estudio**: al distribuirse en single-file int8, se puede cargar en flujos de ComfyUI con nodos de LoRA estándar y combinarlo con otros adaptadores de estilo.
- **Investigación sobre adaptadores de bajo rango**: la card documenta configuraciones reproducibles (rank 16, LR, batch size, atención CuDNN) y benchmarks de velocidad, lo que sirve como referencia para experimentos de entrenamiento de LoRA en difusión.
- **Comparación de bases con un mismo personaje**: al incluir variantes para Flux.1-dev, Pony, SD1.5 y Krea2, permite evaluar cómo cambia la fidelidad del personaje entre arquitecturas con el mismo dataset.
- **Generación de material de referencia para artistas**: producir hojas de personaje (turnarounds, expresiones) a partir del trigger word para usar como base de modelado 3D o ilustración posterior.
- **Demostraciones y galerías interactivas**: los Spaces `loras_gallery` y `universal-lora-studio` del autor permiten probar los LoRAs sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de velocidad de entrenamiento (no de calidad de generación):

| Herramienta | Pasos | Velocidad | Tiempo total (39 imgs, 0,26 MP, r16) | s/imagen |
|---|---|---|---|---|
| OneTrainer | 910 | 1,12 s/it | 17m 43s | ~0,37 |
| Fizgig | 2730 | 1,25 it/s | 36m 17s | ~0,83 |
| Fizgig-Advanced | 910 | 2,07 s/it | 31m 20s | ~0,69 |

No hay datos de FID, CLIP score, similitud de personaje ni comparativas cuantitativas con otros LoRAs.

## Requisitos de hardware

- **VRAM para inferencia**: no disponible de forma explícita. Como referencia, un LoRA de difusión sobre SD1.5 suele requerir 4-8 GB en fp16, y sobre Flux.1-dev o Krea-2, 12-24 GB según resolución y cuantización; estas cifras son estimaciones generales, no datos del repositorio.
- **VRAM para entrenamiento**: la config documentada usa resolución 512 y batch size 3-4 con gradient accumulation, lo que sugiere GPUs de 16-24 GB (no confirmado por el autor).
- **GPU recomendadas**: no especificadas. Por el tamaño del repo (72 GB) y las bases soportadas, se recomienda al menos una RTX 3090/4090 para Flux/Krea2 y GPUs de 8-12 GB para SD1.5/Pony.
- **¿Cabe en GPU consumer?**: sí para SD1.5 y Pony; para Flux.1-dev y Krea2 probablemente sí en RTX 4090 con cuantización, aunque no está confirmado.
- **Despliegue**: ComfyUI (formato single-file int8), Diffusers (sharded bfloat16), OneTrainer para reentrenamiento, y los Spaces del autor (`loras_gallery`, `universal-lora-studio`).
- **Latencia y throughput**: no disponibles para inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Bases soportadas | Contexto/prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `waveshaker/character_loras` | Colección de LoRAs de personaje | Krea2, Flux.1-dev, Pony, SD1.5, Moss, Anima | no aplica | MIT | Hugging Face, 1727 descargas |
| LoRAs de personaje en Civitai (p. ej. PornMaster Moss SFT V1, Kromoss v1.0, Moody Moss Mix v4.1) | LoRA individuales | Moss Image principalmente | no aplica | variable (no disponible) | Civitai |
| Adaptadores oficiales de Flux.1-dev | LoRA de estilo/personaje | Flux.1-dev | no aplica | variable | Hugging Face / BFL |

No se dispone de datos de rendimiento comparativo (fidelidad de personaje, FID) entre estas alternativas. La ventaja diferencial del repositorio es la agregación multi-base en un único punto con licencia MIT; la desventaja es la falta de métricas de calidad publicadas.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados por el autor; al entrenarse con datasets de personajes (mayoritariamente figuras femeninas según los tags `girl`, `character`), es probable un sesgo hacia ese tipo de sujeto y estética.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible o detalles inconsistentes; no hay evaluaciones publicadas.
- **Limitaciones de contexto e idioma**: los prompts de ejemplo están en inglés; no se confirma soporte multilingüe. La longitud de prompt efectiva no está documentada.
- **Licencia**: MIT permite uso comercial, pero conviene verificar que los datasets de entrenamiento (no publicados en detalle) no impongan restricciones adicionales sobre las imágenes de personajes con derechos (p. ej. Christie de Dead or Alive).
- **Reproducibilidad**: la card documenta hiperparámetros, pero no publica el dataset ni los seeds; la reproducibilidad exacta no está garantizada.
- **Tamaño del repo**: 72 GB incluyen material auxiliar; descargar el repositorio completo puede ser costoso si solo se necesita un LoRA concreto.
- **Producción**: sin benchmarks de calidad ni pruebas de robustez, no se recomienda desplegar en producción sin una evaluación propia de fidelidad de personaje y estabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/waveshaker/character_loras
- Galería de LoRAs (Space): https://huggingface.co/spaces/waveshaker/loras_gallery
- Universal Model Character LoRA Studio (Space): https://huggingface.co/spaces/waveshaker/universal-lora-studio
- Dataset collections: https://huggingface.co/datasets/waveshaker/dataset_collections
- Herramientas del repositorio: https://huggingface.co/waveshaker/loras_tools
- OneTrainer (fork Moss Image): https://github.com/Koratahiu/OneTrainer/tree/moss-image
- Fizgig: https://github.com/shootthesound/Fizgig
- Fizgig-Advanced: https://github.com/Murf-Code/Fizgig-Advanced
- OneTrainer: https://github.com/nerogar/OneTrainer
- Paper Goyal et al. 2017: https://arxiv.org/abs/1706.02677
- Paper Krizhevsky 2014: https://arxiv.org/abs/1404.5997
- Paper 2026 sobre batch size en LoRA: https://arxiv.org/abs/2602.09492
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base MOSS Image SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
