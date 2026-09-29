# Zaytron40k/toby-v2-krea2-lora

## Resumen

toby-v2-krea2-lora es un adaptador LoRA de personaje para generacion de imagen texto-a-imagen, publicado por el usuario Zaytron40k en Hugging Face. El adaptador no es un modelo autonomo: se aplica sobre Krea 2, el modelo de difusion de Krea AI, y su unico proposito es fijar una identidad de personaje concreta (un hombre joven adulto, de constitucion corpulenta, con bigote fino) activada mediante la cadena detonante `t0by man`. Se entreno sobre los pesos de Krea-2-Raw (un DiT de 12.000 millones de parametros sin destilar) pero esta pensado para inferencia sobre Krea-2-Turbo, la variante destilada a 8 pasos.

Tecnicamente es un LoRA de rango 24 y alpha 24 aplicado a todas las capas lineales del DiT, entrenado con Musubi Tuner sobre un dataset reducido de 71 imagenes sinteticas de 2k generadas con seedream-v5-pro, con captions en prosa que describen encuadre, pose, expresion, vestuario y fondo mientras la identidad queda vinculada al trigger. El resultado es un adaptador que permite generar el mismo personaje en retratos, planos medios y cuerpo completo manteniendo consistencia de rasgos.

Su relevancia es acotada y practica: cubre el caso tipico de produccion de contenido seriado (webcomic, animacion, mascota de marca, storyboard) donde se necesita reutilizar un personaje a lo largo de decenas o cientos de imagenes sin reentrenar. Conviene senalar que el repositorio no tiene descargas ni likes en el momento de la consulta y que la licencia no esta declarada, por lo que debe tratarse como un artefacto no validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un Diffusion Transformer (DiT) de 12B; no es MoE |
| Parametros totales | no disponible (no se documenta el numero de parametros entrenables del adaptador; el DiT base tiene 12.000 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; la entrada es un prompt procesado por el codificador de texto Qwen3-VL-4B y no se documenta longitud maxima) |
| Tipos de cuantizacion | no documentado; entrenamiento en bf16. La model card no especifica cuantizaciones soportadas para el adaptador ni para el DiT base |
| Idiomas soportados | no disponible (los captions de entrenamiento estan en ingles; no se declara cobertura multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints `.safetensors` aplicados via `--lora_weight`); modelo base en `.safetensors` (`raw.safetensors`, `turbo.safetensors`) |
| Configuracion LoRA | rank/dim 24, alpha 24, aplicado a todas las capas Linear del DiT |
| Modelo base de entrenamiento | krea/Krea-2-Raw (`raw.safetensors`, 12B DiT, sin destilar) |
| Modelo objetivo de inferencia | krea/Krea-2-Turbo (destilado a 8 pasos) |
| VAE | Qwen-Image VAE (`qwen_image_vae.safetensors`) |
| Codificador de texto | Qwen3-VL-4B (`qwen3vl_4b_bf16.safetensors`) |
| Trigger | `t0by man` |
| Tamano del repositorio | 2,1 GB |

## Arquitectura y entrenamiento

El adaptador se injerta sobre un DiT de 12.000 millones de parametros. El pipeline completo de inferencia combina el DiT, el VAE de Qwen-Image y el codificador de texto Qwen3-VL-4B. El LoRA se aplica sobre todas las capas lineales del DiT con rango 24 y alpha 24, entrenado con Musubi Tuner (kohya-ss) mediante el modulo `networks.lora_krea2`, con optimizador adamw8bit, learning rate 1e-4, precision bf16, gradient checkpointing y atencion SDPA. El muestreo de timesteps usa `krea2_shift` con reconocimiento de resolucion y `weighting_scheme` desactivado.

El dataset de entrenamiento son 71 imagenes de 2k generadas con seedream-v5-pro (33 retratos, 29 planos medios y 9 cuerpos completos), con captions en prosa de lenguaje natural que describen encuadre, pose, expresion, vestuario y fondo, y con la identidad vinculada al trigger `t0by man` desde la primera mencion. Se elimino cualquier clausula de iluminacion y se antepuso un prefijo de estilo (animacion occidental semirrealista con mezcla de anime, degradados suaves y line art visible). El entrenamiento se ejecuto durante 12 epocas (1704 pasos) con batch 1, buckets multirresolucion de 1024, `num_repeats` 2 y semilla 42, sobre una unica NVIDIA H100 de 80 GB en RunPod.

La perdida de flow-matching registrada es practicamente plana, y el propio autor advierte que la media movil (`avr_loss`) solo sirve como comprobacion de cordura, siendo la seleccion del checkpoint un criterio visual. Los valores por checkpoint son: paso 284 (epoca 2) 0,0517; paso 568 (epoca 4) 0,0437; paso 852 (epoca 6) 0,0418; paso 1136 (epoca 8) 0,0453; paso 1420 (epoca 10) 0,0387; paso 1704 (epoca 12, final) 0,0407, con un minimo de 0,0385.

## Capacidades

- Generacion de imagenes texto-a-imagen de un personaje concreto y consistente a partir de la cadena detonante `t0by man`.
- Control de encuadre y composicion por prompt: retrato (close-up), plano medio y cuerpo completo.
- Control de pose, expresion, vestuario y fondo mediante descripcion en el prompt, ya que estos atributos estan desacoplados del trigger en los captions de entrenamiento.
- Estilo visual semirrealista de animacion occidental con rasgos de anime, degradados suaves y line art visible (prefijo de estilo fijado en el dataset).
- Compatible con apilado de LoRAs: la model card recomienda superponerlo sobre un LoRA de estilo de la casa.
- Inferencia en 8 pasos con Krea 2 Turbo, `guidance_scale` 1 y `mu` 1,15.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: no aplica a un adaptador de generacion de imagen.

## Casos de uso

- Produccion de webcomic o tira seriada: con un trigger de dos palabras se mantiene la identidad del protagonista a lo largo de cientos de vinetas, variando pose, expresion y vestuario en el prompt sin perder los rasgos faciales.
- Storyboard y previsualizacion para animacion: se generan planos de referencia (retrato, plano medio, cuerpo completo) del mismo personaje para validar casting visual antes de producir el metraje definitivo.
- Mascota de marca o personaje corporativo: el personaje se reutiliza en campanas graficas y publicaciones en redes con encuadres y fondos distintos, manteniendo coherencia de identidad entre entregas.
- Iteracion de diseno de personaje: el LoRA permite explorar variaciones de vestuario y encuadre sobre una identidad ya consolidada, en lugar de reentrenar un adaptador por cada revision de diseno.
- Ilustracion de libros infantiles o material educativo: dado que el trigger fija la identidad, las ilustraciones de distintas paginas resultan reconocibles como el mismo personaje sin trabajo manual de retoque.
- Generacion de dataset sintetico de personaje: se producen imagenes etiquetadas de un personaje fijo (con captions automaticos en prosa) para alimentar el entrenamiento de un segundo adaptador o de un modelo de consistencia de personaje.
- Integracion en un pipeline CLI de generacion por lotes: la model card documenta un comando reproducible (`krea2_generate_image.py` con `--lora_weight` y `--lora_multiplier`) que permite automatizar la produccion de imagenes en un flujo de CI o de renderizado por cola.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica cuantitativa aportada por el autor es la perdida de entrenamiento (flow-matching), que no es comparable con metricas de evaluacion de imagen como FID, CLIP score o evaluaciones humanas de consistencia de identidad.

| Checkpoint | Epoca | Paso | avr_loss |
|---|---|---|---|
| -000002 | 2 | 284 | 0,0517 |
| -000004 | 4 | 568 | 0,0437 |
| -000006 | 6 | 852 | 0,0418 |
| -000008 | 8 | 1136 | 0,0453 |
| -000010 | 10 | 1420 | 0,0387 |
| final | 12 | 1704 | 0,0407 |

Minimo de `avr_loss`: 0,0385. Final: 0,0407. El autor indica explicitamente que la seleccion del mejor checkpoint debe hacerse de forma visual.

## Requisitos de hardware

- Entrenamiento documentado: 1x NVIDIA H100 80 GB (RunPod, region EU-NL-1), con bf16, gradient checkpointing y SDPA.
- Inferencia: el adaptador en si ocupa pocos cientos de MB (el repositorio completo, con varios checkpoints y muestras del dataset, suma 2,1 GB), pero requiere cargar simultaneamente el DiT de 12B, el VAE de Qwen-Image y el codificador Qwen3-VL-4B.
- VRAM estimada (estimacion propia, no documentada por el autor): en bf16, el DiT de 12B ocupa del orden de 24 GB y el codificador de texto de 4B unos 8 GB, por lo que el total con activaciones y VAE se situa aproximadamente entre 35 y 45 GB. Requiere por tanto GPU de 48 GB o superior para una ejecucion holgada.
- GPU recomendadas: H100 80 GB, A100 80 GB, A100 40 GB (ajustado), L40S 48 GB. En consumer, una RTX 4090 de 24 GB solo seria viable con cuantizacion del DiT y descarga parcial del codificador de texto a CPU, una configuracion que no esta documentada en la informacion disponible.
- Opciones de despliegue: Musubi Tuner (kohya-ss) es el unico camino documentado, mediante `src/musubi_tuner/krea2_generate_image.py` con `--dit turbo.safetensors`, `--vae qwen_image_vae.safetensors`, `--text_encoder qwen3vl_4b_bf16.safetensors`, `--attn_mode torch` y `--lora_weight <checkpoint>.safetensors`. Soporte en vLLM, llama.cpp, Ollama, TGI, diffusers o ComfyUI: no documentado en la informacion disponible (y, en el caso de vLLM/TGI/llama.cpp/Ollama, no aplica por tratarse de generacion de imagen).
- Latencia y throughput: no disponibles. Los unicos parametros de generacion documentados son 8 pasos, `guidance_scale` 1, `mu` 1,15 y resolucion de 1024x1280.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Trigger | Parametros / rango | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Zaytron40k/toby-v2-krea2-lora | LoRA de personaje | Krea-2-Raw (train) / Krea-2-Turbo (infer) | `t0by man` | rank 24, alpha 24 sobre DiT de 12B | no aplica | no disponible | 0 descargas, 0 likes |
| Zaytron40k/toby-krea2-lora | LoRA de personaje (version previa del mismo personaje) | Krea-2 | no disponible | no disponible | no aplica | no disponible | no disponible |
| Zaytron40k/amara-v2-krea2-lora | LoRA de personaje | Krea-2 | no disponible | no disponible | no aplica | no disponible | no disponible |
| Zaytron40k/una-v2-krea2-lora | LoRA de personaje | Krea-2 | no disponible | no disponible | no aplica | no disponible | no disponible |
| Krea-2-Raw (modelo base, krea/Krea-2-Raw) | DiT texto-a-imagen completo | - | no aplica | 12B | no aplica | no disponible en la informacion consultada | modelo base publico |
| Krea-2-Turbo (modelo base, krea/Krea-2-Turbo) | DiT texto-a-imagen destilado | - | no aplica | 12B (destilado a 8 pasos) | no aplica | no disponible en la informacion consultada | modelo base publico |

No se dispone de datos de rendimiento comparativo (FID, consistencia de identidad, evaluaciones humanas) para ninguno de estos adaptadores, por lo que la comparativa se limita a la configuracion de entrenamiento y a la disponibilidad publica.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Ademas, el adaptador hereda las condiciones del modelo base Krea 2 (RAW y Turbo), cuya licencia debe verificarse por separado en los repositorios oficiales de Krea AI.
- Dataset minimo y sintetico: 71 imagenes generadas con seedream-v5-pro. El adaptador puede heredar sesgos de estilo y artefactos del generador que produjo las imagenes, ademas de una diversidad limitada de iluminaciones, fondos y contextos.
- Riesgo de sobreajuste de identidad: con 71 imagenes, `num_repeats` 2 y 12 epocas (1704 pasos), cada imagen se ha visto aproximadamente 24 veces, lo que favorece una identidad estable pero tambien una rigidez frente a prompts alejados de la distribucion de entrenamiento.
- Dependencia estricta del trigger: la identidad esta ligada a la cadena `t0by man`. Omitirla o modificarla probablemente rompe la consistencia del personaje.
- Cobertura de un unico personaje: hombre joven adulto, corpulento, con bigote fino y estilo de animacion occidental semirrealista con mezcla de anime. No esta pensado para otros tipos de personaje ni para otros estilos sin reentrenamiento.
- Idioma: los captions y el trigger estan en ingles; no se declara soporte de prompts en castellano ni en otros idiomas.
- Alucinacion y coherencia visual: como todo modelo de difusion, puede producir anatomia incorrecta, manos deformadas, texto ilegible o incoherencias entre prompt y resultado, especialmente en composiciones complejas o multiples personajes.
- Compatibilidad de inferencia: el adaptador se entreno sobre Krea-2-Raw para usarse sobre Krea-2-Turbo. Aplicarlo sobre otros modelos base o sobre variantes cuantizadas no esta documentado y puede degradar el resultado.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta. No hay evaluaciones de terceros, demos publicas ni resultados de benchmarks.
- El autor advierte que la perdida de entrenamiento es practicamente plana y que la eleccion del checkpoint debe hacerse visualmente; no existe por tanto un criterio objetivo publicado para seleccionar el mejor checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zaytron40k/toby-v2-krea2-lora
- Modelo base de entrenamiento (Krea-2-Raw): https://huggingface.co/krea/Krea-2-Raw
- Adaptador previo del mismo personaje: https://huggingface.co/Zaytron40k/toby-krea2-lora
- Otro adaptador del mismo autor (amara-v2-krea2-lora): https://huggingface.co/Zaytron40k/amara-v2-krea2-lora/tree/main
- Otro adaptador del mismo autor (una-v2-krea2-lora), ficha de terceros: https://free2aitools.com/model/zaytron40k/una-v2-krea2-lora
- Pagina oficial del modelo Krea 2: https://www.krea.ai/krea-2
- Codigo oficial de inferencia de Krea 2: https://github.com/krea-ai/krea-2
