# wind11/Krea2_Last_Kiss

## Resumen

Krea2_Last_Kiss es un checkpoint de generación de imágenes texto-a-imagen publicado por el usuario wind11 en Hugging Face. Se trata de un merge de la base Krea 2 Turbo (desarrollada por Krea.ai, Inc.) con un conjunto de LoRAs publicados en Civitai, con el objetivo explícito de eliminar el sesgo de censura del release original y ofrecer un modelo todoterreno que funcione tanto en contenido SFW como NSFW. El resultado es un modelo derivado, no un entrenamiento desde cero: toda la arquitectura subyacente proviene de Krea 2 Turbo.

La base es un Diffusion Transformer (DiT) denso de 12B parámetros con un text encoder Qwen3-VL (agregación multi-capa de features, sin CLIP) y un VAE de Qwen Image. El checkpoint está destilado a 8 pasos y funciona sin CFG (classifier-free guidance), lo que reduce el coste de inferencia frente a modelos de difusión convencionales que requieren 20-50 pasos. La resolución nativa de generación está en el rango de 1K a 2K píxeles.

La relevancia de este modelo es acotada: es un fine-tune comunitario con 0 descargas y 4 likes en el momento de la consulta, pensado para usuarios que ya trabajan con el ecosistema Krea 2 y quieren un checkpoint sin filtrado. No aporta innovaciones arquitectónicas propias; su valor está en la curaduría del merge y en la compatibilidad declarada con LoRAs entrenados sobre Krea 2 RAW.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) denso |
| Parámetros totales | 12B (backbone) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantización | INT8 (según el título de la model card); no se detallan otros formatos |
| Idiomas soportados | no disponible (el text encoder Qwen3-VL es multilingüe, pero no se especifica cobertura) |
| Licencia | other (Krea 2 Community License para la base; licencias individuales de los LoRAs mergeados) |
| Formato de pesos | safetensors (repo de 13,5 GB) |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura de Krea 2 Turbo: un backbone DiT denso de 12B parámetros, text encoder Qwen3-VL con agregación multi-capa de features (sin encoder CLIP, lo que cambia por completo la forma de prompting respecto a modelos tipo Stable Diffusion) y VAE de Qwen Image. El checkpoint base es una destilación a 8 pasos libre de CFG, con rango nativo de resolución de aproximadamente 1K a 2K píxeles.

No se ha realizado entrenamiento adicional desde cero ni se documentan tokens de entrenamiento, composición del dataset, RLHF o DPO. La operación aplicada es un merge de pesos: se combinan los pesos de Krea 2 Turbo con un conjunto de LoRAs publicados en Civitai, cuyas condiciones de licencia el autor declara cumplir. No se especifica la técnica exacta de merge (por ejemplo, weighted sum, TIES, DARE) ni los ratios aplicados. Tampoco se detalla qué LoRAs concretos se integraron, pese a que la model card menciona una "tabla arriba" que no está presente en la información disponible.

## Capacidades

- Generación de imágenes texto-a-imagen en resoluciones de 1024 a 2048 píxeles (con padding a múltiplos de 16).
- Generación en 8 pasos con sampler `euler` y scheduler `simple`, sin CFG (valor 1 o 0.0 según la interfaz).
- Renderizado de prosa explícita y concreta sin el "tag-fading" ni la aplanación de expresiones que el autor atribuye al release stock de Turbo.
- Reproducción de anatomía consistente, texturas de piel naturales, fidelidad de vestuario y color, y rostros expresivos según las pruebas del autor.
- Generación de texto dentro de la imagen mediante comillas dobles en el prompt (por ejemplo, `"ON AIR"`).
- Compatibilidad con LoRAs entrenados sobre Krea 2 RAW, siguiendo el flujo train-on-RAW / run-on-Turbo de Krea.
- Cobertura declarada tanto de contenido SFW como NSFW en un único checkpoint.
- No se documentan capacidades de tool calling, agentes, visión de entrada ni audio: es un modelo puramente texto-a-imagen.

## Casos de uso

- Ilustración editorial y fotografía sintética de retrato: el modelo está ajustado para piel natural, poros y expresiones faciales, y responde bien a prompts con indicaciones de cámara y óptica ("medium close-up, 85mm, shallow depth of field"), lo que encaja en flujos de moodboard y previsualización.
- Generación de imágenes de producto con vestuario y color fieles: la model card destaca la reproducción fiel de ropa y paleta, útil para variaciones de catálogo o pruebas de concepto de estilismo.
- Creación de contenido para comunidades de arte digital en Civitai y foros afines: el modelo está pensado para usuarios que ya trabajan con LoRAs de Krea 2 y quieren un checkpoint sin filtrado, con el flujo de merge ya aplicado.
- Prototipado rápido en ComfyUI: al cargarse como diffusion model estándar con el text encoder de Krea 2 y el VAE de Qwen Image, se integra en grafos existentes sin cambios de pipeline.
- Iteración de prompts largos en lenguaje natural: al usar un text encoder tipo LLM, permite describir escenas complejas en párrafos fluidos en lugar de tags, lo que facilita la escritura asistida por otro modelo de lenguaje.
- Investigación sobre sesgos y censura en modelos generativos: al ser un merge explícitamente descensorado, sirve como caso de estudio comparativo frente al Turbo original para medir cómo el merge de LoRAs altera la distribución de salidas.
- Generación de material NSFW para adultos en entornos controlados: es el caso de uso declarado por el autor, con la advertencia de que la responsabilidad de contenido recae en el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 13,5 GB y la model card indica INT8, lo que sugiere un peso en memoria del orden de 13-14 GB solo para el backbone DiT. A ello hay que sumar el text encoder Qwen3-VL y el VAE de Qwen Image, no cuantificados en la información disponible, por lo que el total en VRAM probablemente supere los 20 GB en configuraciones habituales.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, un checkpoint de 12B en INT8 encaja con GPUs de 24 GB o más (RTX 4090, A100 40GB, H100); en GPUs de 16 GB requeriría cuantizaciones adicionales u offloading no documentados.
- ¿Cabe en GPU de consumo? Previsiblemente en RTX 4090 (24 GB) y modelos con 24 GB o más; en 16 GB o menos no hay confirmación y el autor no lo documenta.
- Opciones de despliegue: ComfyUI (carga como diffusion model estándar con text encoder de Krea 2 y VAE de Qwen Image) y el codebase oficial de Krea 2 mediante `uv run inference.py` con el flag `--checkpoint oss_turbo`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles. Solo se conoce el coste de sampling: 8 pasos con `euler`/`simple` y CFG 1, lo que sitúa la inferencia en el régimen de los modelos turbo destilados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea2_Last_Kiss | 12B (DiT denso) | 1K-2K px | 8, CFG-free | other (Krea 2 Community License + LoRAs) | Hugging Face, 0 descargas |
| Krea 2 Turbo (base) | 12B (DiT denso) | 1K-2K px | 8, CFG-free | Krea 2 Community License | Hugging Face (krea/Krea-2-Turbo) |
| Krea 2 RAW | no disponible | no disponible | no disponible | Krea 2 Community License | Hugging Face (referenciado como base de entrenamiento de LoRAs) |

La comparación relevante es contra el propio Krea 2 Turbo: mismo backbone, mismos pasos y misma resolución, con la diferencia de que Last_Kiss integra LoRAs y relaja el filtrado de contenido. Frente a otros modelos texto-a-imagen de la misma franja (por ejemplo, familias SDXL o Flux), no se dispone de datos comparativos en la información proporcionada, por lo que no se incluyen.

## Limitaciones y advertencias

- Modelo derivado con 0 descargas y 4 likes: no hay validación comunitaria ni evidencia independiente de la calidad del merge más allá de la model card del autor.
- El autor no documenta qué LoRAs se mergearon ni los ratios, lo que impide auditar la procedencia exacta de los pesos.
- La licencia base (Krea 2 Community License) solicita a los desplegadores implementar filtrado de contenido o revisión equivalente; este merge "relaja deliberadamente esa expectativa", trasladando toda la responsabilidad de contenido al usuario final. Es un riesgo legal relevante para uso comercial.
- Contenido NSFW explícito: el modelo está diseñado para generarlo, lo que exige controles de acceso y verificación de edad en cualquier despliegue público.
- Riesgo de alucinación visual y de anatomía inconsistente en escenas complejas: la propia model card advierte que dos acciones o dos descripciones de luz en competencia "emborronan" la salida.
- El prompting requiere lenguaje natural y descripciones concretas; los tags tipo `masterpiece` o `8k` no tienen efecto, lo que rompe flujos de trabajo acostumbrados a CLIP.
- La expresión facial es un punto débil conocido del modelo base y debe describirse en una cláusula propia.
- Idiomas soportados no documentados: aunque Qwen3-VL es multilingüe, no hay garantía de calidad de prompting en castellano.
- No apto para menores ni para entornos sin moderación; el tag `not-for-all-anchored` y `not-for-all-audiences` en Hugging Face refleja esta restricción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wind11/Krea2_Last_Kiss
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Civitai (origen de los LoRAs mergeados): https://civitai.com
