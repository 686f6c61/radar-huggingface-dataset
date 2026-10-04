# TRYZER01/Qwen3.5-4B-Danbooru-Prompt-Generator

## Resumen

Qwen3.5-4B-Danbooru-Prompt-Generator es un ajuste fino de generacion de texto publicado por el usuario TRYZER01 en Hugging Face. Su cometido es muy concreto: tomar unas pocas etiquetas semilla al estilo Danbooru y expandirlas en un prompt completo listo para alimentar un modelo de generacion de imagenes. No pretende ser un modelo generalista, sino una herramienta especializada dentro del ecosistema de generacion de imagenes anime, con soporte explicito de etiquetas NSFW y de negacion de conceptos mediante el prefijo `-tag`.

Tecnicamente parte de `techwithsergiu/Qwen3.5-text-4B-bnb-4bit`, una version cuantizada en 4 bits de `Qwen/Qwen3.5-4B`. El autor desquantizo esa base y le fusiono un LoRA entrenado con Unsloth, exportando el resultado en BF16 en dos shards de safetensors con 4.205.751.296 parametros (aproximadamente 8,41 GB, sin contar el tokenizer). El repositorio incluye ademas un GGUF de aproximadamente 2,71 GB pensado para LM Studio y un nodo de ComfyUI listo para copiar en `custom_nodes`.

Su interes practico esta en la integracion: el nodo de ComfyUI llama a la API local de LM Studio, por lo que el modelo no necesita residir en el directorio de ComfyUI, y expone entradas y salidas pensadas para encadenarse con un nodo CLIP Text Encode. Se publica bajo licencia Apache 2.0, es exclusivamente de texto (no acepta imagenes como entrada) y no incluye ninguna puntuacion de benchmark en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de lenguaje de solo texto derivado de la familia Qwen3.5; la model card no detalla la arquitectura interna) |
| Parametros totales | 4.205.751.296 (pesos BF16) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (safetensors) y GGUF de aproximadamente 2,71 GB (nivel de cuantizacion no especificado). La base de partida era BNB 4-bit |
| Idiomas soportados | No disponible (los ejemplos de la model card usan etiquetas Danbooru en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16, dos shards) y GGUF |
| Tamano del repositorio | 11,1 GB (incluye pesos, GGUF, nodo de ComfyUI y `checksums.json`) |
| Modelo base | techwithsergiu/Qwen3.5-text-4B-bnb-4bit, derivado de Qwen/Qwen3.5-4B |
| Modalidad | Solo texto (no acepta imagenes como entrada) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de identificar la familia Qwen3.5 y el pipeline de text-generation. Lo que si documenta es el proceso de construccion: se partio de una base cuantizada en 4 bits (BNB), se desquantizo y se le fusiono un LoRA entrenado con Unsloth, generando un export BF16 en dos shards de safetensors. El autor advierte explicitamente de que guardar el resultado en BF16 no revierte la perdida de precision introducida por la cuantizacion previa de la base, de modo que el modelo arrastra ese sesgo de cuantizacion. La procedencia del export queda registrada en `model/merge_source.json`, cuyas rutas locales son registros historicos y no dependencias en tiempo de ejecucion.

El ajuste esta orientado a una tarea unica: expandir etiquetas Danbooru. El modelo recibe las etiquetas semilla como un unico mensaje de usuario en el formato de chat y devuelve una lista de etiquetas separadas por comas. La instruccion de negacion (`-tag`) es una capacidad aprendida durante el ajuste, no un filtro estricto aplicado en codigo, tal y como aclara el propio autor. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de prompts de imagenes: expande un conjunto reducido de etiquetas semilla en un prompt completo con etiquetas separadas por comas.
- Estilo Danbooru: trabaja con la convencion de etiquetas (con guiones bajos) propia de los modelos de generacion de anime.
- Negacion de conceptos: acepta el prefijo `-tag` para pedir que se evite un concepto y sus etiquetas relacionadas, con la advertencia de que es una instruccion aprendida, no un filtro estricto.
- Conversion de ratings: el nodo de ComfyUI traduce `rating:general` a `safe` y `rating:explicit` a `nsfw, explicit`; el resto de etiquetas pasan sin modificar.
- Contenido NSFW: el repositorio esta marcado como `not-for-all-audiences` y el modelo contempla etiquetas de contenido explicito.
- Integracion con ComfyUI: expone un nodo con salidas `generated_prompt` y `formatted_prompt`, esta ultima con prefijo, prompt generado y sufijo unidos por `, `.
- Chat conversacional: la libreria declarada es transformers y la pipeline es text-generation; admite el formato de chat con mensajes de usuario.
- Sin capacidades multimodales: no procesa imagenes ni audio.

## Casos de uso

- Generacion de prompts en ComfyUI: el nodo Prompt Generator se conecta directamente a la entrada de texto de un nodo CLIP Text Encode, de modo que el flujo de trabajo puede pasar de unas pocas etiquetas semilla a un prompt completo sin intervencion manual.
- Automatizacion de pipelines de generacion de anime: al residir en LM Studio y exponerse por API, el modelo puede alimentar scripts por lotes que generen prompts para cientos de imagenes a partir de listas de etiquetas.
- Estandarizacion de etiquetas: convierte descripciones breves e inconsistentes en el vocabulario controlado de Danbooru, reduciendo la variabilidad entre prompts escritos por distintas personas.
- Control de contenido explicito: la conversion automatica de `rating:general` a `safe` y de `rating:explicit` a `nsfw, explicit` permite mantener separados los flujos de trabajo segun el nivel de contenido permitido.
- Exclusion de conceptos no deseados: el uso de `-tag` facilita generar prompts que eviten elementos concretos, util en produccion cuando se necesita cumplir con una politica de contenido.
- Prototipado rapido de personajes: a partir de etiquetas como `1girl, long_hair, pink_hair, blue_eyes` se obtiene un prompt ampliado que sirve como punto de partida para iterar sobre el diseno de un personaje.
- Asistencia a usuarios no expertos en Danbooru: usuarios que desconocen la taxonomia de etiquetas pueden escribir unas pocas palabras y obtener el prompt en el formato que el modelo de imagenes espera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se suministra ninguna puntuacion de benchmark con esta release.

## Requisitos de hardware

- VRAM estimada para el export BF16: aproximadamente 10-12 GB considerando los 8,41 GB de pesos mas el overhead del runtime y la cache KV (estimacion a partir del tamano de los pesos; la model card no publica cifras oficiales).
- VRAM estimada para el GGUF: aproximadamente 4-5 GB, partiendo de un archivo de 2,71 GB (estimacion orientativa).
- GPU de gama profesional: A100, H100 u otras con 16 GB o mas de memoria para el BF16 sin problemas de espacio.
- GPU de consumo: el GGUF de 2,71 GB cabe en tarjetas de 6-8 GB; el export BF16 requiere tarjetas de 12 GB o mas, como una RTX 3060 de 12 GB.
- Opciones de despliegue: el BF16 esta pensado para inferencia con Transformers; el GGUF se sirve con LM Studio sobre llama.cpp y es el formato que consume el nodo de ComfyUI. No se menciona soporte de vLLM ni TGI.
- Dependencia importante: el nodo de ComfyUI usa los endpoints nativos `/api/v1/models` y `/api/v1/models/load` de LM Studio ademas del endpoint compatible con OpenAI `/v1/chat/completions`. Un servidor generico compatible con OpenAI que no exponga la API nativa de gestion de modelos de LM Studio no es suficiente.
- Limite de generacion: el nodo solicita como maximo 1.024 tokens de salida.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| TRYZER01/Qwen3.5-4B-Danbooru-Prompt-Generator | 4.205.751.296 (BF16) | No disponible | Safetensors BF16 y GGUF | Apache 2.0 | Expansion de etiquetas Danbooru e integracion con ComfyUI | Publico en Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| techwithsergiu/Qwen3.5-text-4B-bnb-4bit | No disponible (base cuantizada en 4 bits de un modelo de 4B) | No disponible | BNB 4-bit | No disponible | Base de texto generalista sin ajuste de Danbooru | Publico en Hugging Face; es el modelo base declarado |
| Qwen/Qwen3.5-4B | No disponible en la informacion disponible (denominacion de 4B) | No disponible | No disponible | No disponible | Modelo de texto generalista de la familia Qwen3.5 | Publico en Hugging Face; es el origen de la cadena |

No se dispone de datos de rendimiento comparativos entre estos modelos, ya que la model card del modelo ajustado no incluye benchmarks y la informacion proporcionada no detalla los resultados de las dos base.

## Limitaciones y advertencias

- Perdida de cuantizacion heredada: el export BF16 proviene de desquantizar una base BNB 4-bit, y el autor advierte de que guardar en BF16 no revierte esa perdida de precision.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que cualquier evaluacion en produccion debe hacerse por cuenta propia.
- Negacion no garantizada: el prefijo `-tag` es una instruccion aprendida, no un filtro estricto; un concepto supuestamente excluido puede aparecer.
- Contenido NSFW: el repositorio esta marcado como `not-for-all-audiences` y el modelo maneja etiquetas explicitas, lo que exige controles de contenido en cualquier despliegue publico.
- Solo texto: no acepta imagenes como entrada, pese a estar orientado a generacion de imagenes.
- Dependencia de LM Studio: el nodo de ComfyUI requiere la API nativa de gestion de modelos de LM Studio; otros servidores compatibles con OpenAI no bastan.
- Ambito limitado: el ajuste esta especializado en etiquetas Danbooru, por lo que su utilidad fuera de la generacion de imagenes anime es previsiblemente baja.
- Idiomas no declarados: la model card no especifica idiomas soportados y los ejemplos usan etiquetas en ingles.
- Contexto no declarado: se desconoce la longitud de ventana disponible, lo que impide planificar conversaciones o prompts largos con garantias.
- Licencia: Apache 2.0 permite uso comercial, pero la cadena de modelos base y los terminos del contenido generado con prompts NSFW deben revisarse aparte segun la jurisdiccion y la plataforma.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe comunidad que haya validado su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TRYZER01/Qwen3.5-4B-Danbooru-Prompt-Generator
- Modelo base declarado: https://huggingface.co/techwithsergiu/Qwen3.5-text-4B-bnb-4bit
- Modelo origen de la cadena: https://huggingface.co/Qwen/Qwen3.5-4B
- Git LFS: https://git-lfs.com/
- ComfyUI: no se proporciona un enlace explicito en la informacion disponible
- Unsloth: mencionado como herramienta de entrenamiento del LoRA, sin enlace en la informacion disponible
- Paper o blog tecnico: no disponible
- Demo: no disponible
