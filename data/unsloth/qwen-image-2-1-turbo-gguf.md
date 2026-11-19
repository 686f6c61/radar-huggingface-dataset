# unsloth/Qwen-Image-2.1-Turbo-GGUF

## Resumen

Qwen-Image-2.1-Turbo-GGUF es la versión cuantizada en formato GGUF del checkpoint Turbo de Qwen-Image-2.1, un modelo de generación de imágenes texto-a-imagen desarrollado por el equipo Qwen de Alibaba. La cuantización la publica unsloth, que aplica su metodología Dynamic 2.0 para preservar la calidad en los tensores más sensibles. El checkpoint Turbo es una destilación de 8 pasos del modelo base Qwen-Image-2.1, lo que reduce drásticamente el coste de inferencia frente a los pipelines de difusión tradicionales de 20-50 pasos.

El repositorio contiene únicamente el denoiser en formato GGUF (7.115.124.736 parámetros), por lo que para generar imágenes hace falta acompañarlo del VAE y del codificador de texto Qwen3-VL-8B-Instruct, ambos disponibles en repositorios separados de unsloth. El repositorio completo ocupa 64,8 GB e incluye 12 variantes de cuantización desde Q2_K hasta F16. Es relevante ahora porque permite ejecutar un modelo de generación de imágenes de gama alta en GPUs de consumo con un consumo de VRAM contenido, manteniendo un compromiso calidad/tamaño medido con LPIPS.

La licencia es qwen-research, lo que condiciona el uso comercial. Los idiomas soportados declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (denoiser); el repo contiene solo el denoiser |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_XL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q6_K_XL, Q8_0, F16 |
| Idiomas soportados | en, zh |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación de imágenes a partir de texto. La variante Turbo es un checkpoint destilado para funcionar en 8 pasos con CFG 1, usando el calendario de muestreo incluido en el `model_index.json` del modelo base. La destilación reduce el número de evaluaciones del denoiser por imagen, lo que abarata la inferencia frente al modelo Qwen-Image-2.1 sin destilar.

La cuantización de unsloth emplea la metodología Dynamic 2.0: se realiza un escaneo de sensibilidad por tensor y se suben de precisión las capas importantes, manteniendo el mismo layout por tensor que los ficheros equivalentes de `unsloth/Qwen-Image-2.1-GGUF`, pero construidos y verificados sobre Turbo con su calendario de 8 pasos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El pipeline requiere tres componentes: el denoiser GGUF, el VAE `qwen_image_2.1_vae_bf16.safetensors` (de `unsloth/Qwen-Image-2.1-FP8`) y el codificador de texto `Qwen3-VL-8B-Instruct-UD-Q4_K_XL.gguf` (de `unsloth/Qwen3-VL-8B-Instruct-GGUF`).

## Capacidades

- Generación de imágenes texto-a-imagen con resolución de trabajo de 1024x1024 en las evaluaciones publicadas.
- Generación en 8 pasos con CFG 1, lo que reduce el coste computacional por imagen.
- Comprensión de prompts en inglés y chino.
- Integración con ComfyUI mediante ComfyUI-GGUF, con stable-diffusion.cpp y con Unsloth Desktop.
- No se declaran capacidades de tool calling, agentes, visión de entrada ni audio; es un modelo exclusivamente de generación de imágenes.
- No se declara modo thinking ni razonamiento multi-paso.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: con la variante Q4_K_M (4,20 GB) se puede iterar en una GPU de consumo generando imágenes de 1024x1024 en 8 pasos, suficiente para validar dirección de arte antes de pasar a un pipeline de mayor calidad.
- Creación de assets para videojuegos y entornos 3D: el modelo produce imágenes coherentes de escenas (el ejemplo de la model card es un puesto de ramen nocturno con reflejos en el pavimento), útil para generar referencias de texturas y moodboards.
- Generación de material gráfico para marketing: prompts en inglés o chino para banners, fondos y composiciones, ejecutables en local sin depender de APIs externas.
- Flujos de trabajo en ComfyUI: al ser GGUF, se carga como nodo de denoiser dentro de grafos de ComfyUI, lo que permite encadenarlo con upscalers, controlnets u otros nodos del ecosistema.
- Despliegue en estaciones de trabajo con VRAM limitada: las variantes Q2_K (2,47 GB) y Q3_K_XL (3,61 GB) permiten generar imágenes en tarjetas pequeñas, aceptando una deriva visible respecto a bf16 según las métricas LPIPS del autor.
- Investigación sobre cuantización de modelos de difusión: el repositorio publica métricas LPIPS por fichero con intervalos de confianza bootstrap, lo que sirve como referencia para estudiar el impacto de la cuantización en la calidad de imagen.
- Generación bilingüe para mercados asiáticos: el soporte declarado de chino e inglés cubre prompts en ambos idiomas sin traducción previa.

## Benchmarks y rendimiento

El autor publica métricas LPIPS (AlexNet, menor es mejor) contra el transformer Turbo en bf16, con el mismo codificador de texto, VAE, prompts y semillas, a 1024x1024, 8 pasos y CFG 1. La media se calcula con intervalo de confianza bootstrap del 95 % sobre 8 prompts x 2 semillas; la columna held-out usa 8 prompts adicionales x 2 semillas. Dos ejecuciones en bf16 con las mismas semillas dan 0,000 (suelo de variabilidad entre ejecuciones).

| Fichero | Tamano (GB) | LPIPS | LPIPS (held-out) |
|---|---|---|---|
| Q2_K | 2,47 | 0,374 [0,300; 0,453] | 0,351 [0,297; 0,403] |
| Q3_K_S | 2,72 | 0,303 [0,229; 0,381] | 0,280 [0,225; 0,334] |
| Q3_K_M | 3,17 | 0,261 [0,189; 0,342] | 0,250 [0,193; 0,323] |
| Q3_K_XL | 3,61 | 0,237 [0,148; 0,333] | 0,208 [0,165; 0,256] |
| Q4_K_S | 3,91 | 0,201 [0,126; 0,279] | 0,186 [0,138; 0,244] |
| Q4_K_M | 4,20 | 0,153 [0,097; 0,215] | 0,141 [0,105; 0,182] |
| Q5_K_S | 4,50 | 0,103 [0,064; 0,145] | 0,083 [0,062; 0,110] |
| Q5_K_M | 5,39 | 0,074 [0,037; 0,117] | 0,087 [0,049; 0,133] |
| Q6_K | 6,27 | 0,055 [0,028; 0,089] | 0,076 [0,038; 0,121] |
| Q6_K_XL | 6,72 | 0,050 [0,024; 0,083] | 0,069 [0,034; 0,115] |
| Q8_0 | 7,64 | 0,036 [0,017; 0,059] | 0,030 [0,016; 0,047] |
| F16 | 14,23 | 0,012 [0,005; 0,019] | 0,016 [0,008; 0,025] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para el denoiser según cuantización: desde ~2,5 GB (Q2_K) hasta ~14,2 GB (F16). Hay que sumar el VAE en bf16 y el codificador de texto Qwen3-VL-8B-Instruct en Q4_K_XL, que no se incluyen en el repositorio.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: las variantes Q2_K a Q4_K_M (2,47-4,20 GB) son las más adecuadas para tarjetas con poca VRAM; el autor recomienda Q4_K_M para la mayoría de GPUs y Q8_0 (7,64 GB) para la salida más cercana a bf16.
- Opciones de despliegue: Unsloth Desktop, ComfyUI (ComfyUI-GGUF), stable-diffusion.cpp y otras herramientas compatibles con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-GGUF (este) | 7.115.124.736 | no disponible | GGUF | qwen-research | Cuantización Dynamic 2.0, 12 variantes, LPIPS publicado por fichero |
| Qwen-Image-2.1-Turbo (bf16) | 7.115.124.736 | no disponible | safetensors | qwen-research | Referencia de calidad; requiere más VRAM |
| Qwen-Image-2.1-GGUF (unsloth) | no disponible | no disponible | GGUF | qwen-research | Mismo layout por tensor, pero sin destilación a 8 pasos |

No se dispone de datos de benchmarks comparativos con otras familias de modelos de generación de imágenes en la información proporcionada.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; es necesario revisar los términos en el enlace de licencia del modelo base antes de cualquier despliegue productivo.
- El repositorio contiene solo el denoiser; sin el VAE y el codificador de texto Qwen3-VL-8B-Instruct el modelo no genera imágenes.
- Las variantes de 2 y 3 bits se desvían visiblemente de bf16 en el calendario de 8 pasos; el autor recomienda Q3_K_XL sobre Q3_K_M, Q3_K_S y Q2_K cuando se baja de 4 GB.
- El modelo está pensado para 8 pasos con CFG 1 y el calendario `sample_sigmas` del modelo base; usar otro calendario o más pasos puede degradar la calidad.
- Idiomas declarados limitados a inglés y chino; no se garantiza el rendimiento con prompts en castellano.
- No se dispone de información sobre sesgos, tasas de alucinación visual o limitaciones de resolución más allá de los 1024x1024 evaluados.
- Las métricas LPIPS publicadas son del propio autor de la cuantización y se limitan a 8-16 prompts, por lo que la generalización es acotada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unsloth/Qwen-Image-2.1-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Modelo sin destilar: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- Guía de ejecución de Qwen-Image-2.1: https://unsloth.ai/docs/models/qwen-image-2.1
- Metodología Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Cuantizaciones de Qwen-Image-2.1: https://huggingface.co/unsloth/Qwen-Image-2.1-GGUF
- VAE: https://huggingface.co/unsloth/Qwen-Image-2.1-FP8
- Codificador de texto: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-GGUF
- Unsloth Desktop: https://unsloth.ai/docs/desktop
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth
- Paquete PyPI: https://pypi.org/project/unsloth/
- Documentación de Unsloth: https://unsloth.ai/docs
