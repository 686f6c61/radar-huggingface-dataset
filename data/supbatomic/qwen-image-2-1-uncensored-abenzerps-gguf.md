# Supbatomic/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF

## Resumen

Qwen-Image-2.1-Uncensored-Abenzerps-GGUF es una recopilacion de cuantizaciones comunitarias en formato GGUF del modelo de generacion de imagenes Qwen-Image-2.1, desarrollado por el equipo Qwen de Alibaba. El repositorio lo publica el usuario Supbatomic y reune dos familias de pesos: cuantizaciones directas del modelo base original y una variante denominada "uncensored" (UC) en la que se han relajado los filtros de contenido. El transformador de difusion declara 7.115.124.736 parametros (unos 7,12 mil millones) y el repositorio ocupa 83,6 GB, porque incluye ademas el text encoder (Qwen3VL-8B) y el VAE necesarios para la inferencia en ComfyUI.

El problema que resuelve es doble. Por un lado, permite ejecutar un modelo de text-to-image de generacion reciente en GPUs de consumo, gracias a cuantizaciones que van de 14,23 GB (BF16) a 4,15 GB (Q4_0). Por otro, ofrece una via de generacion de imagenes sin las capas de moderacion habituales, algo relevante para quien investiga el efecto de los filtros de seguridad o necesita flujos creativos que no encajan en las politicas de los servicios alojados.

No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. Su uso esta sujeto a la licencia qwen-research heredada del modelo base, con las restricciones que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image; la model card no detalla la arquitectura interna (no se especifica si es DiT, MMDiT u otra variante) |
| Parametros totales | 7.115.124.736 (≈7,12 mil millones) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible (la model card no lista idiomas para los prompts) |
| Licencia | qwen-research (declarada como `license: other`, `license_name: qwen-research`) |
| Formato de pesos | GGUF (transformador de difusion) y safetensors (FP8, INT8 ConvRot, text encoder y VAE) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: `quantized`) |
| Libreria | gguf |
| Tamano del repositorio | 83,6 GB |
| Pipeline | text-to-image |

Cuantizaciones publicadas (ficheros enlazados desde la model card; apuntan al repositorio `abenzerps/Qwen-Image-2.1-Uncensored-GGUF`):

| Variante | Cuantizacion | Tamano |
|---|---|---:|
| Uncensored (UC) | BF16 | 14,23 GB |
| Uncensored (UC) | FP8 (safetensors) | 6,63 GB |
| Uncensored (UC) | INT8 ConvRot (safetensors) | 6,76 GB |
| Uncensored (UC) | Q8_0 | 7,59 GB |
| Uncensored (UC) | Q6_K | 5,88 GB |
| Uncensored (UC) | Q5_K_M | 5,22 GB |
| Uncensored (UC) | Q4_K_M (recomendada por el autor) | 4,60 GB |
| Uncensored (UC) | Q4_0 | 4,15 GB |
| Base cuantizada | Q8_0 | 7,59 GB |
| Base cuantizada | Q6_K | 5,88 GB |
| Base cuantizada | Q5_K_M | 5,22 GB |
| Base cuantizada | Q4_K_M | 4,60 GB |
| Base cuantizada | Q4_0 | 4,05 GB |

Ficheros auxiliares incluidos en el repositorio:

| Tipo | Fichero | Precision | Tamano |
|---|---|---|---:|
| Text encoder | text_encoders/qwen3vl_8b_bf16.safetensors | BF16 | 17,53 GB |
| Text encoder | text_encoders/qwen3vl_8b_int8_convrot.safetensors | INT8 | 9,35 GB |
| VAE | vae/qwen_image_2.1_vae_bf16.safetensors | BF16 | 676 MB |

## Arquitectura y entrenamiento

Se trata de un modelo de difusion para generacion de imagenes a partir de texto, no de un modelo autorregresivo de lenguaje. La model card no documenta la arquitectura interna del transformador de difusion ni el proceso de entrenamiento de Qwen-Image-2.1 (numero de tokens, composicion del dataset, uso de RLHF/DPO o cualquier innovacion de atencion). Tampoco se detalla el procedimiento exacto por el que se ha obtenido la variante "uncensored": la card se limita a indicar que las cuantizaciones GGUF se han generado "usando los pesos base originales del upstream", y que las versiones UC estan disponibles en el repositorio enlazado.

El pipeline de inferencia se compone de tres piezas: el transformador de difusion cuantizado en GGUF, un text encoder Qwen3VL-8B (8 mil millones de parametros, multimodal de vision-lenguaje, en BF16 o INT8 ConvRot) y un VAE en BF16. La cuantizacion INT8 ConvRot y el encoder INT8 reducen el consumo de memoria a costa de una perdida de calidad no cuantificada en la informacion disponible. El autor recomienda Q4_K_M como mejor equilibrio entre tamano y calidad.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), ejecutable en local mediante ComfyUI.
- Edicion de imagenes: la model card referencia el flujo oficial de Image Edit de Comfy-Org (`image_qwen_image_2_1_image_edit.json`), lo que implica capacidad de edicion guiada por prompt heredada del modelo base.
- Uso sin conexion: al distribuirse como pesos GGUF junto con encoder y VAE, todo el pipeline puede ejecutarse en local sin llamadas a API externas.
- Integracion con ComfyUI mediante el nodo `Unet Loader (GGUF)` y el modulo ComfyUI-GGUF (fork de leejet).
- Compatibilidad con flujos personalizados: los pesos se pueden combinar con LoRAs y nodos adicionales de ComfyUI, sujeto a la compatibilidad del fork.
- Generacion sin filtros de contenido: la variante UC esta pensada para eliminar las capas de moderacion, bajo responsabilidad del usuario.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto ni codigo; el unico texto que produce, si acaso, es el que aparece renderizado dentro de las imagenes generadas.
- Cobertura multilingue de los prompts: no disponible.

## Casos de uso

- Ilustracion y concept art en local: un estudio pequeno puede generar bocetos e ilustraciones sin depender de servicios en la nube, usando Q4_K_M en una GPU de 8-12 GB y el encoder INT8 para mantener el consumo contenido.
- Prototipado de assets para videojuegos: generacion iterativa de iconos, texturas y fondos a partir de descripciones, con la ventaja de que el modelo ocupa menos de 5 GB en la cuantizacion Q4_K_M y permite varias variantes en paralelo dentro de la misma GPU.
- Marketing y mockups de producto: creacion rapida de variaciones visuales de una campana; el flujo Image Edit permite partir de una imagen existente y modificar elementos concretos por prompt.
- Generacion de datasets sinteticos: produccion masiva de imagenes etiquetadas para entrenar o evaluar otros modelos de vision, con control total del pipeline y sin limites de cuota de API.
- Investigacion sobre moderacion y sesgos: la existencia de una variante UC permite comparar la salida del modelo con y sin filtros, y analizar que conceptos se bloquean y como.
- Flujos creativos sin filtrado de contenido: produccion de material artistico que las plataformas alojadas rechazan sistematicamente, siempre que se cumpla la legislacion aplicable y la licencia.
- Despliegue en estaciones de trabajo sin GPU de datacenter: con Q4_0 (4,15 GB) y el encoder INT8 (9,35 GB), el pipeline completo puede residir en una unica GPU de 16 GB si se gestiona la memoria con cuidado.
- Pruebas de integracion en ComfyUI: validacion de workflows personalizados antes de migrar a un backend mas costoso, aprovechando que los pesos GGUF tienen menor huella de disco y de VRAM.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) con resultados de benchmarks, pero no se proporcionan cifras en texto dentro de la informacion disponible, por lo que no se pueden extraer valores numericos ni comparaciones cuantitativas.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del transformador de difusion segun cuantizacion: Q4_0 4,15 GB; Q4_K_M 4,60 GB; Q5_K_M 5,22 GB; Q6_K 5,88 GB; FP8 6,63 GB; INT8 ConvRot 6,76 GB; Q8_0 7,59 GB; BF16 14,23 GB.
- VRAM del text encoder: 17,53 GB en BF16 o 9,35 GB en INT8 ConvRot (recomendado por el autor para equipos con menos memoria).
- VAE: 676 MB.
- Configuracion minima razonable: Q4_K_M (4,60 GB) + encoder INT8 (9,35 GB) + VAE (0,68 GB) ≈ 14,6 GB, lo que cabe en una RTX 4090 (24 GB) con margen y en una RTX 4080 (16 GB) de forma ajustada.
- Configuracion de maxima calidad: BF16 (14,23 GB) + encoder BF16 (17,53 GB) + VAE ≈ 32,4 GB, lo que exige una A100 40 GB, una H100 o varias GPU.
- GPU de consumo compatibles: RTX 4090, RTX 4080, RTX 4070 Ti, RTX 3090 y, en el extremo bajo, tarjetas de 8-12 GB con Q4_0 o Q4_K_M y el encoder INT8, asumiendo posibles intercambios a RAM.
- Nota de memoria del autor: conviene mantener el modelo de difusion en VRAM (es la parte critica durante el muestreo) y dejar el text encoder en RAM si no cabe todo.
- Opciones de despliegue: ComfyUI con el modulo ComfyUI-GGUF (fork de leejet, con soporte nativo de Qwen-Image 2.1). El autor advierte de que el fork antiguo `city96/ComfyUI-GGUF` puede lanzar el error `Unknown model architecture!` y hay que actualizar o anadir `ModelQwenImage` a `tools/convert.py`. No se mencionan vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supbatomic/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF (esta ficha) | 7,12 mil millones | Difusion text-to-image, GGUF + variante UC | BF16 a Q4_0 | qwen-research | Repositorio propio; ficheros enlazados desde `abenzerps/Qwen-Image-2.1-Uncensored-GGUF` |
| Qwen/Qwen-Image-2.1 (base oficial) | 7,12 mil millones | Difusion text-to-image | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace, repositorio oficial de Qwen |
| abenzerps/Qwen-Image-2.1-Uncensored-GGUF | No disponible | Difusion text-to-image, GGUF + UC | BF16, FP8, INT8 ConvRot, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 | No disponible | Repositorio referenciado por la model card de esta ficha |
| FLUX.1-dev (referencia del sector) | 12 mil millones | Difusion text-to-image | Cuantizaciones GGUF comunitarias | Licencia no comercial de FLUX.1-dev | HuggingFace / Black Forest Labs |

Datos de rendimiento comparado: no disponibles.

## Limitaciones y advertencias

- Licencia qwen-research: es una licencia de investigacion, no una licencia permisiva. Antes de cualquier uso comercial hay que revisar los terminos exactos y, si procede, solicitar autorizacion al titular.
- La variante "uncensored" elimina o relaja los filtros de contenido. Esto implica riesgo legal y reputacional para quien la despliegue en produccion, especialmente si el servicio es publico y menores pueden acceder a el.
- Cuantizaciones agresivas (Q4_0, Q4_K_M) degradan la fidelidad de la imagen respecto a BF16. La magnitud de la perdida no esta cuantificada en la informacion disponible.
- Riesgo de artefactos tipicos de los modelos de difusion: anatomia incorrecta (manos, dedos), texto renderizado con errores, incoherencias en escenas con muchos objetos y sesgos de composicion heredados del dataset de entrenamiento.
- Sesgos conocidos: la model card no documenta evaluaciones de sesgo por genero, etnia o cultura; al eliminar los filtros de contenido, es probable que afloren sesgos estereotipados propios de los datos de entrenamiento.
- Ambito limitado: no realiza tareas de lenguaje, codigo, matematicas, tool calling ni razonamiento multi-paso. No debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Idioma de los prompts: no disponible; no se confirma soporte de castellano ni de otros idiomas.
- Dependencia de herramientas: requiere ComfyUI y el fork leejet de ComfyUI-GGUF. El fork de city96 puede fallar con el error `Unknown model architecture!`.
- Madurez del repositorio: 0 descargas y 0 "me gusta" en el momento de la consulta, sin validacion por parte de la comunidad. Conviene verificar la integridad de los ficheros antes de usarlos en produccion.
- Tamano del repositorio: 83,6 GB, lo que exige planificar el espacio en disco antes de la descarga, sobre todo si se quieren conservar varias cuantizaciones.
- Ausencia de datos de rendimiento: no hay cifras publicadas de benchmarks, latencia ni throughput, de modo que cualquier estimacion de calidad o velocidad es especulativa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Supbatomic/Qwen-Image-2.1-Uncensored-Abenzerps-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de los pesos uncensored enlazados: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-GGUF
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- Plantilla oficial text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla oficial de edicion de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Imagen de benchmarks referenciada en la model card: `assets/Qwen-Image-2.1-Benchmark.png` (sin datos numericos en texto)
