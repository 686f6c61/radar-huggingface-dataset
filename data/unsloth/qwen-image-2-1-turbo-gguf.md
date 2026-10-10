# unsloth/Qwen-Image-2.1-Turbo-GGUF

## Resumen

Qwen-Image-2.1-Turbo-GGUF es una distribución cuantizada, publicada por Unsloth, del checkpoint destilado Qwen/Qwen-Image-2.1-Turbo, que a su vez es la variante de 8 pasos de Qwen-Image-2.1, el modelo de generación de imágenes a partir de texto de la familia Qwen (Alibaba). El repositorio contiene únicamente el denoiser en formato GGUF, con 7.115.124.736 parámetros (aproximadamente 7,1 mil millones), pensado para ejecutarse junto al VAE y al codificador de texto Qwen3-VL-8B-Instruct.

La aportación principal de esta versión es la metodología Unsloth Dynamic 2.0: cada tensor se ajusta a una precisión distinta según un análisis medido de sensibilidad, con una matriz de importancia recogida sobre el propio modelo Turbo en su calendario de 8 pasos. El repositorio ofrece 12 archivos que van desde Q2_K (2,47 GB) hasta F16 (14,23 GB), lo que permite desplegar el modelo en tarjetas gráficas de gama de consumo.

Es relevante ahora porque combina dos factores poco habituales en generación de imágenes de alta calidad: inferencia en solo 8 pasos con CFG 1 (frente a las decenas de pasos de los modelos de difusión convencionales) y pesos cuantizados con pérdida medida y documentada (LPIPS) respecto al modelo bf16 de referencia. El repositorio se creó el 10 de octubre de 2026 y acumula 202 descargas y 18 me gusta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (el archivo GGUF contiene unicamente el denoiser) |
| Parametros totales | 7.115.124.736 (aproximadamente 7,1 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_XL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q6_K_XL, Q8_0, F16 (metodologia Unsloth Dynamic 2.0) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | qwen-research (etiquetada como "other"); enlace: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE |
| Formato de pesos | GGUF (denoiser); VAE en safetensors bf16; codificador de texto en GGUF |
| Parametros de muestreo | 8 pasos, CFG 1, con el calendario `sample_sigmas` de model_index.json |
| Tamano del repositorio | 64,8 GB |
| Modelo base | Qwen/Qwen-Image-2.1-Turbo |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión que actúa como denoiser; el GGUF no incluye el resto de componentes del pipeline, por lo que necesita obligatoriamente un VAE y un codificador de texto. En esta familia, Turbo reutiliza el mismo codificador de texto y el mismo VAE que Qwen-Image-2.1: el VAE recomendado es `vae/qwen_image_2.1_vae_bf16.safetensors` del repositorio unsloth/Qwen-Image-2.1-FP8, y el codificador de texto es Qwen3-VL-8B-Instruct, en concreto el archivo `Qwen3-VL-8B-Instruct-UD-Q4_K_XL.gguf` (escalón de 4 bits de Dynamic 2.0, en lugar del `Q4_K_M` uniforme).

Turbo es un checkpoint destilado para funcionar en 8 pasos con CFG 1, con un calendario de muestreo específico (`sample_sigmas`) definido en el `model_index.json` del modelo original. Esa destilación es la que reduce drásticamente el coste de inferencia respecto a la variante no Turbo. La innovación técnica de esta publicación concreta es la cuantización: Unsloth Dynamic 2.0 eleva selectivamente a mayor precisión los tensores importantes, decididos a partir de un escaneo de sensibilidad medido por tensor, y cada archivo usa la misma disposición por tensor que su equivalente en unsloth/Qwen-Image-2.1-GGUF, con una matriz de importancia recogida sobre el propio Turbo en su calendario de 8 pasos. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) en inglés y chino.
- Ejecución en 8 pasos de muestreo con CFG 1, lo que reduce el coste de inferencia frente a pipelines de difusión de decenas de pasos.
- Reproducción de escenas con iluminación y materiales complejos: los ejemplos del autor incluyen un puesto de ramen con neones en un callejón lluvioso de Tokio y reflejos sobre el pavimento mojado.
- Detalle fino en primeros planos: el segundo ejemplo publicado es una fotografía macro de una abeja sobre un girasol con granos de polen visibles.
- Ejecución local en cuantizaciones que van de 2,47 GB a 14,23 GB, con distintos compromisos de fidelidad respecto a bf16.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), audio ni vídeo.
- No es un modelo multimodal de entrada: la imagen se genera a partir de texto, no se edita ni se analiza una imagen de entrada según la información disponible.

## Casos de uso

- Generación de imágenes en hardware de consumo: con Q4_K_M (4,20 GB) el denoiser cabe en GPU de gama media, y los archivos de 2 y 3 bits están pensados para tarjetas con muy poca memoria, según indica el propio autor.
- Prototipado rápido de material gráfico: al necesitar solo 8 pasos, permite iterar sobre variaciones de un mismo prompt (banners, ilustraciones de blog, conceptos de producto) sin la latencia típica de un pipeline de 30 a 50 pasos.
- Integración en flujos de trabajo de diseño con ComfyUI: el autor documenta el uso mediante ComfyUI-GGUF, de modo que el modelo se puede insertar como nodo dentro de grafos existentes que ya gestionen el VAE y el codificador de texto.
- Ilustración de escenas atmosféricas y cinematográficas: el ejemplo de callejón con neones y pavimento mojado encaja en la generación de fondos para storyboards, portadas o material de ambientación.
- Imagen macro y de producto: el ejemplo de la abeja con polen visible apunta a usos donde se exige detalle fino, como fichas de producto, ilustración científica divulgativa o texturas.
- Despliegue en entornos con memoria limitada o sin GPU de datacenter: stable-diffusion.cpp permite ejecutar el modelo en configuraciones que no dependen de CUDA de gama alta, según las herramientas citadas por el autor.
- Investigación sobre cuantización de modelos de difusión: la tabla de LPIPS frente a bf16, con intervalos de confianza y un conjunto de prompts reservados, sirve como referencia reproducible para estudiar el impacto del ancho de bits en la calidad final.
- Generación de imágenes en lote con coste controlado: la combinación de 8 pasos y pesos de 4 bits reduce el tiempo por imagen en comparación con el checkpoint sin destilar, siempre que el pipeline completo (VAE y codificador de texto) permanezca cargado en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor proporciona exclusivamente una evaluacion de fidelidad de la cuantizacion mediante LPIPS (AlexNet, menor es mejor) contra el transformer Turbo en bf16, con el mismo codificador de texto, VAE, prompts y semillas, a 1024x1024, 8 pasos y CFG 1, renderizado a traves de la ruta diffusers de Unsloth Desktop. La media incluye un intervalo de confianza bootstrap del 95 % sobre 8 prompts x 2 semillas; la columna "held-out" usa 8 prompts x 2 semillas adicionales que no formaron parte de la calibracion de la matriz de importancia. Dos ejecuciones en bf16 con las mismas semillas dan 0,000 (suelo de ruido entre ejecuciones).

| Archivo | Tamano (GB) | LPIPS | LPIPS (held-out) |
|---|---|---|---|
| qwen-image-2.1-turbo-Q2_K.gguf | 2,47 | 0,374 [0,300, 0,453] | 0,351 [0,297, 0,403] |
| qwen-image-2.1-turbo-Q3_K_S.gguf | 2,72 | 0,303 [0,229, 0,381] | 0,280 [0,225, 0,334] |
| qwen-image-2.1-turbo-Q3_K_M.gguf | 3,17 | 0,261 [0,189, 0,342] | 0,250 [0,193, 0,323] |
| qwen-image-2.1-turbo-Q3_K_XL.gguf | 3,61 | 0,237 [0,148, 0,333] | 0,208 [0,165, 0,256] |
| qwen-image-2.1-turbo-Q4_K_S.gguf | 3,91 | 0,201 [0,126, 0,279] | 0,186 [0,138, 0,244] |
| qwen-image-2.1-turbo-Q4_K_M.gguf | 4,20 | 0,153 [0,097, 0,215] | 0,141 [0,105, 0,182] |
| qwen-image-2.1-turbo-Q5_K_S.gguf | 4,50 | 0,103 [0,064, 0,145] | 0,083 [0,062, 0,110] |
| qwen-image-2.1-turbo-Q5_K_M.gguf | 5,39 | 0,074 [0,037, 0,117] | 0,087 [0,049, 0,133] |
| qwen-image-2.1-turbo-Q6_K.gguf | 6,27 | 0,055 [0,028, 0,089] | 0,076 [0,038, 0,121] |
| qwen-image-2.1-turbo-Q6_K_XL.gguf | 6,72 | 0,050 [0,024, 0,083] | 0,069 [0,034, 0,115] |
| qwen-image-2.1-turbo-Q8_0.gguf | 7,64 | 0,036 [0,017, 0,059] | 0,030 [0,016, 0,047] |
| qwen-image-2.1-turbo-F16.gguf | 14,23 | 0,012 [0,005, 0,019] | 0,016 [0,008, 0,025] |

Recomendacion del autor: Q4_K_M (4,20 GB) para la mayoria de GPU; Q8_0 (7,64 GB) si se busca la salida mas cercana a bf16; Q6_K_XL y Q6_K quedan en un punto intermedio. Los archivos de 2 y 3 bits caben en tarjetas muy pequenas, pero se desvian de forma visible de bf16 a 8 pasos, por lo que el autor aconseja Q3_K_XL antes que Q3_K_M, Q3_K_S o Q2_K cuando haya que bajar de 4 GB.

## Requisitos de hardware

- VRAM para el denoiser: entre 2,47 GB (Q2_K) y 14,23 GB (F16), segun el archivo elegido. El valor recomendado por el autor, Q4_K_M, ocupa 4,20 GB.
- VRAM adicional obligatoria: el GGUF contiene solo el denoiser, por lo que hay que sumar el VAE y el codificador de texto Qwen3-VL-8B-Instruct. El autor no publica cifras de memoria para esos dos componentes en la informacion disponible.
- Componentes concretos recomendados por el autor: VAE `vae/qwen_image_2.1_vae_bf16.safetensors` de unsloth/Qwen-Image-2.1-FP8 y codificador de texto `Qwen3-VL-8B-Instruct-UD-Q4_K_XL.gguf` de unsloth/Qwen3-VL-8B-Instruct-GGUF.
- GPU de gama de consumo: los archivos de 2 y 3 bits estan pensados para tarjetas "muy pequenas" segun el autor, sin especificar modelos concretos; Q4_K_M se recomienda para "la mayoria de GPU". No se indican modelos como RTX 4090, A100 o H100 en la informacion disponible.
- Opciones de despliegue: Unsloth Desktop, ComfyUI mediante ComfyUI-GGUF y stable-diffusion.cpp. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. El unico dato de coste computacional es que el modelo esta disenado para 8 pasos con CFG 1, frente a los pipelines de difusion no destilados que requieren mas pasos.
- Almacenamiento: el repositorio completo ocupa 64,8 GB, aunque en inferencia solo se necesita descargar un archivo de cuantizacion junto con el VAE y el codificador de texto.

## Comparativa con modelos similares

No se dispone de datos verificables de otros modelos de la misma categoria (por ejemplo, FLUX.1 o SDXL) en la informacion proporcionada, por lo que la comparacion se limita a la propia familia Qwen-Image.

| Modelo | Parametros del denoiser | Formato | Pasos de muestreo | Licencia | Notas |
|---|---|---|---|---|---|
| unsloth/Qwen-Image-2.1-Turbo-GGUF (este modelo) | 7.115.124.736 | GGUF, 12 cuantizaciones de 2,47 a 14,23 GB | 8, CFG 1 | qwen-research | Cuantizacion Unsloth Dynamic 2.0; solo denoiser; requiere VAE y Qwen3-VL-8B-Instruct |
| Qwen/Qwen-Image-2.1-Turbo | 7.115.124.736 (mismo modelo) | safetensors bf16 (no disponible el tamano exacto) | 8, CFG 1 | qwen-research | Checkpoint original sin cuantizar; referencia frente a la que se mide el LPIPS |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | no disponible (no destilado) | qwen-research | Modelo base del que deriva Turbo; comparte codificador de texto y VAE; requiere mas pasos de inferencia |

## Limitaciones y advertencias

- Licencia qwen-research: se trata de una licencia de investigacion, no una licencia permisiva tipo Apache 2.0 o MIT. Hay que revisar el texto completo en el enlace de licencia antes de cualquier uso comercial, ya que las condiciones concretas no se detallan en la model card.
- No es un modelo autonomo: el archivo GGUF contiene solo el denoiser. Sin el VAE y el codificador de texto Qwen3-VL-8B-Instruct no genera nada, y una version incorrecta de esos componentes degradara la salida.
- Perdida de fidelidad en cuantizaciones bajas: con Q2_K el LPIPS frente a bf16 es de 0,374 y con Q3_K_S de 0,303, valores que implican una desviacion visible. El autor solo recomienda bajar de 4 GB si es imprescindible y, en ese caso, usar Q3_K_XL.
- Los intervalos de confianza son amplios: en Q2_K el rango va de 0,300 a 0,453 con solo 8 prompts x 2 semillas, por lo que la medicion es orientativa y no un benchmark exhaustivo.
- Idiomas limitados: solo ingles y chino. No hay soporte declarado para castellano ni para otras lenguas, lo que puede degradar la comprension de prompts en espanol.
- Riesgo de artefactos y sesgos: no se documenta ninguna evaluacion de sesgos demograficos, culturales o de representacion, ni de sesgos aprendidos de los datos de entrenamiento; tampoco hay filtros de contenido descritos.
- Riesgo de alucinacion visual: como cualquier modelo generativo de imagenes, puede producir texto ilegible dentro de la imagen, anatomias incorrectas, manos deformes o elementos fisicamente incoherentes.
- Sin datos de rendimiento comparativo: no hay resultados de benchmarks estandar frente a otros generadores de imagenes, solo la medida de fidelidad de la cuantizacion.
- Repositorio poco validado por la comunidad: 202 descargas y 18 me gusta en la fecha de actualizacion, un volumen bajo que implica menos verificacion independiente de los resultados publicados.
- La fecha de creacion y actualizacion del repositorio es el 10 de octubre de 2026; conviene comprobar si ha habido revisiones posteriores de los archivos o de la licencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/unsloth/Qwen-Image-2.1-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Modelo Qwen-Image-2.1 (no destilado): https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia qwen-research: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- Calendario de muestreo (sample_sigmas): https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/model_index.json
- Repositorio GGUF de la variante no Turbo: https://huggingface.co/unsloth/Qwen-Image-2.1-GGUF
- VAE recomendado: https://huggingface.co/unsloth/Qwen-Image-2.1-FP8
- Codificador de texto recomendado: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-GGUF
- Guia de uso de Qwen-Image-2.1 de Unsloth: https://unsloth.ai/docs/models/qwen-image-2.1
- Documentacion de Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Repositorio de Unsloth (Unsloth Desktop): https://github.com/unslothai/unsloth
- Comunidad de Unsloth en Discord: https://discord.gg/unsloth
