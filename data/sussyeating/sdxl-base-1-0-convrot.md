# SUSSYEATING/SDXL-Base-1.0-ConvRot

## Resumen

SDXL Base 1.0 ConvRot es una cuantización del checkpoint [stabilityai/stable-diffusion-xl-base-1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0) publicada por el usuario SUSSYEATING. No se trata de un modelo nuevo, sino de una versión comprimida del UNet de SDXL mediante una técnica propietaria denominada ConvRot, que combina cuantización lineal de todas las capas lineales del UNet (739 de 739) con una corrección de sesgo basada en calibración. Las capas Conv2d, los codificadores de texto CLIP y el VAE se mantienen sin cuantizar.

El objetivo es reducir el peso del checkpoint para facilitar su despliegue en ComfyUI sin degradar la calidad de imagen de forma significativa. El checkpoint INT8 principal ocupa 4,72 GB frente a los 6,94 GB del FP16 original, una reducción del 32 %. Se incluyen además variantes experimentales de 6 bits (W6A8 e híbrida W6/W8) que llegan a 4,16 GB empaquetadas, con una penalización de calidad notablemente mayor.

La relevancia de esta publicación es acotada: se trata de un artefacto de cuantización con 0 descargas y 0 likes en el momento de la consulta, orientado a usuarios de ComfyUI que quieran ahorrar VRAM o espacio en disco manteniendo el modelo base SDXL. No aporta capacidades nuevas ni cambios arquitectónicos respecto al original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet + VAE + doble codificador de texto CLIP (arquitectura SDXL Base 1.0 original, cuantizada) |
| Parámetros totales | no disponible (no se indica el recuento en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; resolución nativa 1024×1024) |
| Tipos de cuantización | INT8 (739/739 capas lineales), INT6 W6A8 (739/739), híbrida W6/W8 (619 INT6 + 120 INT8) |
| Idiomas soportados | no disponible |
| Licencia | CreativeML Open RAIL++-M (etiquetada como openrail++) |
| Formato de pesos | safetensors (checkpoint único para ComfyUI; variantes `*-packed.safetensors` requieren desempaquetado) |

## Arquitectura y entrenamiento

El modelo subyacente es SDXL Base 1.0, un modelo de difusión latente con arquitectura UNet y dos codificadores de texto CLIP (uno de ellos OpenCLIP ViT-bigG). Esta publicación no reentrena el modelo: aplica cuantización post-entrenamiento sobre las capas lineales del UNet. La técnica ConvRot incluye una corrección de sesgo calibrada que, según el autor, compensa el error introducido por la cuantización y permite que el INT8 supere incluso la deriva BF16 frente a FP16 en métricas de similitud.

Las variantes de 6 bits se ofrecen en dos formatos: un contenedor INT8 directamente cargable en ComfyUI y un archivo empaquetado más pequeño que debe desempaquetarse con el script `scripts/unpack_int6.py` antes de su uso. No se documentan datos de entrenamiento, composición del dataset ni procesos de RLHF/DPO, ya que no hay entrenamiento involucrado más allá de la calibración de la cuantización.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024×1024, heredadas del modelo base SDXL.
- Compatibilidad directa con ComfyUI (versión >= v0.45.0) mediante el nodo estándar `Load Checkpoint`.
- Tres niveles de compresión seleccionables: INT8 (recomendado), W6/W8 híbrido e INT6 W6A8.
- No incluye tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de difusión, no un LLM.
- No soporta visión, audio ni modos de pensamiento.
- Capacidades multilingües: no documentadas en la información proporcionada.

## Casos de uso

- Despliegue de SDXL en GPUs con VRAM limitada: el checkpoint INT8 de 4,72 GB permite cargar el modelo en tarjetas donde el FP16 de 6,94 GB no cabría junto con el VAE y los codificadores de texto.
- Flujos de trabajo en ComfyUI con múltiples checkpoints: la reducción de tamaño facilita mantener varias variantes (Base, Refiner, Lightning, Turbo) en disco sin agotar el almacenamiento.
- Prototipado rápido en entornos de investigación: permite comparar el efecto de la cuantización INT8 frente a FP16 con las métricas publicadas (SSIM, PSNR, similitud coseno) como referencia.
- Generación de imágenes por lotes en servidores con presupuesto de memoria ajustado: el ahorro de VRAM permite aumentar el tamaño de lote o resolución de trabajo.
- Evaluación de técnicas de cuantización post-entrenamiento: las variantes INT6 e híbridas sirven como caso de estudio de la degradación de calidad en modelos de difusión.
- Distribución de checkpoints en entornos con ancho de banda limitado: los archivos empaquetados de 6 bits (4,16-4,28 GB) reducen el tamaño de descarga, aunque requieren un paso de desempaquetado.

## Benchmarks y rendimiento

Métricas publicadas por el autor sobre GPU G4, ComfyUI v0.45.0, 8 prompts a 1024×1024, comparando contra el checkpoint FP16 sin cuantizar. La referencia BF16 vs FP16 se incluye como línea base de equivalencia visual.

| Variante | CosMean / Min | SSIM Mean / Min | PSNR Mean / Min | Velocidad media (warm) |
|---|---|---|---|---|
| INT8 ConvRot (739/739) | 0,99433 / 0,98653 | 0,95213 / 0,91965 | 32,82 / 30,11 dB | 4,63 s (FP16: 2,90 s) |
| W6/W8 Hybrid ConvRot | 0,95784 / 0,89655 | 0,84762 / 0,72200 | 24,78 / 20,07 dB | 4,69 s |
| W6A8 INT6 ConvRot (739/739) | 0,95743 / 0,89424 | 0,84064 / 0,72535 | 24,57 / 20,38 dB | 4,62 s |
| Referencia BF16 vs FP16 | 0,99186 / — | 0,94269 / — | 32,20 / — dB | — |

El autor destaca que el INT8 ConvRot supera a la referencia BF16 en similitud coseno, SSIM y PSNR medios, atribuyéndolo a que la rejilla simétrica de 255 niveles del INT8 es más fina que la truncación de mantisa de 7 bits del BF16 en distribuciones de pesos normalizadas típicas. No se han publicado resultados de benchmarks estándar (FID, CLIP score) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint INT8 pesa 4,72 GB en disco, por lo que la carga del UNet requiere al menos esa cantidad más el VAE y los codificadores CLIP sin cuantizar.
- GPU recomendadas: no especificadas por el autor. El benchmark se ejecutó en una "G4" (no se detalla el modelo exacto).
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el tamaño del checkpoint sugiere que podría caber en GPUs de 8-12 GB, pero no hay confirmación.
- Opciones de despliegue: ComfyUI (>= v0.45.0) mediante `Load Checkpoint`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión en este formato).
- Latencia: 4,63 s por imagen en INT8 frente a 2,90 s en FP16 (misma GPU, 1024×1024, presumiblemente 50 pasos según las comparativas visuales). Las variantes de 6 bits rondan 4,62-4,69 s.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDXL Base 1.0 ConvRot INT8 | Cuantización INT8 de SDXL | 4,72 GB | no aplica | Open RAIL++-M | Hugging Face (0 descargas) |
| stabilityai/stable-diffusion-xl-base-1.0 (FP16) | Modelo original | 6,94 GB | no aplica | Open RAIL++-M | Hugging Face (oficial) |
| SUSSYEATING/SDXL-Refiner-1.0-ConvRot | Cuantización del Refiner | no disponible | no aplica | Open RAIL++-M | Hugging Face |
| SUSSYEATING/SDXL-Lightning-ConvRot | Cuantización de Lightning | no disponible | no aplica | Open RAIL++-M | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras técnicas de cuantización (por ejemplo, fp8 o GGUF de SDXL) en la información proporcionada.

## Limitaciones y advertencias

- Las variantes de 6 bits presentan una degradación de calidad sustancial: SSIM medio de 0,84-0,85 frente a 0,95 del INT8, y PSNR de ~24,6 dB frente a ~32,8 dB. No son recomendables para producción si la fidelidad visual es crítica.
- El INT8 incrementa la latencia un 60 % respecto a FP16 (4,63 s vs 2,90 s por imagen en la GPU de prueba), lo que puede ser relevante en flujos de generación masiva.
- Los archivos `*-packed.safetensors` no son cargables directamente: requieren ejecutar `scripts/unpack_int6.py` antes de su uso en ComfyUI.
- La licencia CreativeML Open RAIL++-M impone restricciones de uso basadas en casos de uso (Use-Based Restrictions) y obliga a propagar `LICENSE.md` y `NOTICE` en cualquier redistribución.
- No hay información sobre sesgos específicos introducidos por la cuantización más allá de las métricas de fidelidad publicadas.
- Riesgo de alucinación visual inherente al modelo base SDXL (artefactos, anatomía incorrecta, texto mal renderizado), no mitigado por la cuantización.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria independiente de las métricas del autor.
- No se documentan idiomas soportados ni evaluación multilingüe de los prompts.

## Enlaces

- [Hugging Face: SUSSYEATING/SDXL-Base-1.0-ConvRot](https://huggingface.co/SUSSYEATING/SDXL-Base-1.0-ConvRot)
- [Modelo base: stabilityai/stable-diffusion-xl-base-1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- [SUSSYEATING/SDXL-Refiner-1.0-ConvRot](https://huggingface.co/SUSSYEATING/SDXL-Refiner-1.0-ConvRot)
- [SUSSYEATING/SDXL-Lightning-ConvRot](https://huggingface.co/SUSSYEATING/SDXL-Lightning-ConvRot)
- [SUSSYEATING/SDXL-Turbo-ConvRot](https://huggingface.co/SUSSYEATING/SDXL-Turbo-ConvRot)
- Script de desempaquetado: `scripts/unpack_int6.py` (incluido en el repositorio)
- Informes de métricas: `metrics/g4_base_int8_summary.json`, `metrics/g4_base_w6w8_hybrid_summary.json`, `metrics/g4_base_int6_summary.json` (incluidos en el repositorio)
