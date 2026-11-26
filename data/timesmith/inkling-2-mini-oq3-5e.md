# timesmith/Inkling-2-Mini-oQ3.5e

## Resumen

Inkling-2-Mini-oQ3.5e es una cuantizacion mixta del modelo Inkling-2-Mini, publicada por el usuario timesmith en Hugging Face. El checkpoint resultante ocupa 14,5 GB en disco y contiene 26.388.643.840 parametros logicos en el componente de lenguaje, a los que se suman unos 318 millones en el modulo de vision, hasta un total de 26.707 millones de pesos logicos. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.8.3), que aplica precision mixta por tensor en lugar de un unico ancho de bits uniforme.

El modelo original Inkling-2-Mini no viene documentado en la informacion disponible: no se especifica su autor, su arquitectura interna, su ventana de contexto ni su licencia. Lo unico que revela el identificador de la libreria y la etiqueta `inkling2_loop` es que se trata de un modelo con algun mecanismo de bucle o recurrencia, empaquetado para MLX, el framework de Apple para ejecutar modelos en silicio de la compania. La ficha, por tanto, se centra en lo que si es verificable: el esquema de cuantizacion, el reparto de bits por tensor y las implicaciones practicas de desplegar este checkpoint.

La relevancia de esta publicacion es acotada pero concreta: demuestra un esquema de cuantizacion mixta que combina formatos affine de 3, 4, 6 y 8 bits con NVFP4 y deja una fraccion pequena de pesos en BF16 y FP32, logrando un promedio efectivo de 4,324 bits por peso. Para un modelo de ~26.000 millones de parametros, eso permite reducir el peso en disco a algo menos de 14 GB, un tamano manejable en equipos con memoria unificada de 32 GB o mas. El repo no registra descargas ni likes en el momento de la consulta y no incluye model card mas alla de la tabla de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `inkling2_loop` sugiere mecanismo de bucle/recurrencia; sin confirmar) |
| Parametros totales | 26.707.000.000 logicos (26.388.643.840 en el modelo de lenguaje + 0.318B en vision) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit grupo 64, affine 4-bit grupo 64, NVFP4 grupo 16, affine 6-bit grupo 64, affine 8-bit grupo 64, BF16 y FP32; promedio efectivo 4,324 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Inkling-2-Mini: ni el tipo de transformer, ni si emplea atencion lineal, mezcla de expertos o capas recurrentes. La unica pista es la etiqueta `inkling2_loop`, que apunta a un diseno con algun tipo de bucle iterativo, pero no hay documentacion que lo confirme. Tampoco se conocen los datos de entrenamiento, el numero de tokens procesados, la composicion del corpus ni si hubo fases de RLHF o DPO.

Lo que si esta documentado es el proceso de cuantizacion. Se aplico oQ (oMLX v0.8.3) con precision mixta, asignando anchos de bits distintos segun el tensor: el 62,594% de los pesos logicos (16.717B) quedo en affine 3-bit con grupo 64, el 25,442% (6.795B) en NVFP4 con grupo 16, el 5,115% (1.366B) en affine 4-bit, el 2,594% (0.693B) en affine 8-bit, el 1,734% (0.463B) en affine 6-bit y solo el 2,387% (0.637B) se mantuvo en BF16, con un 0,133% (0.036B) en FP32. El resultado son 13,443 GiB de almacenamiento real para 26.707B de pesos logicos. El modulo de vision (0.318B) ocupa 0,593 GiB y el de lenguaje (26.388B) 12,850 GiB.

## Capacidades

- Generacion de texto: el componente de lenguaje de 26.388B parametros logicos es el nucleo del checkpoint.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0.318B parametros, lo que indica capacidades multimodales de entrada de imagen, aunque no se detalla su alcance.
- Razonamiento iterativo: la etiqueta `inkling2_loop` sugiere un mecanismo de bucle o refinamiento por pasos, sin documentacion que lo confirme.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con silicio de Apple: al estar empaquetado en formato MLX y ocupar 14,5 GB, el checkpoint cabe en equipos con 24-32 GB de memoria unificada y permite ejecutar un modelo de ~26.000 millones de parametros sin GPU dedicada.
- Prototipado de aplicaciones multimodales: el modulo de vision integrado permite experimentar con tareas que combinen imagen y texto en un unico checkpoint, sin necesidad de orquestar dos modelos separados.
- Evaluacion de tecnicas de cuantizacion mixta: el reparto documentado de bits por tensor (affine 3/4/6/8, NVFP4, BF16, FP32) sirve como referencia para estudiar el impacto de la precision mixta en la calidad de salida frente al modelo original.
- Despliegue en estaciones de trabajo con memoria limitada: 13,443 GiB de pesos reales permiten cargar el modelo en una RTX 4090 de 24 GB o en una A100 de 40 GB, dejando margen para el contexto y el KV cache.
- Investigacion sobre arquitecturas con bucle: si se confirma el mecanismo `inkling2_loop`, el checkpoint facilita experimentar con modelos recurrentes o de refinamiento iterativo en entornos MLX.
- Fine-tuning ligero sobre pesos cuantizados: los tensores en BF16 y FP32 (0.673B en total) permiten adaptar partes del modelo sin descuantizar el resto, util para ajustes especificos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 13,443 GiB de pesos en el checkpoint; con overhead de contexto y KV cache, se recomienda un minimo de 16-20 GB de memoria disponible.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100; en el ecosistema MLX, chips Apple M2 Pro/Max/Ultra y M3/M4 con 24 GB o mas de memoria unificada.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y en equipos Apple con 24-32 GB de memoria unificada; en GPUs de 16 GB no cabe con margen para contexto.
- Opciones de despliegue: MLX (libreria nativa del checkpoint); llama.cpp, Ollama, vLLM y TGI no estan confirmados para este formato sin conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ3.5e | 26.707B logicos (4,324 bits/peso efectivos) | no disponible | no disponible | safetensors MLX | Cuantizacion mixta con NVFP4 y affine 3/4/6/8 |
| Modelos comparables de ~26B | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre alternativas directas de este modelo base |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada.

## Limitaciones y advertencias

- Sin model card completa: no hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de calidad, lo que impide valorar el riesgo de alucinacion o los sesgos conocidos.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- Idiomas no documentados: se desconoce el soporte multilingue real y la calidad en castellano.
- Cuantizacion agresiva: el 62,594% de los pesos esta en affine 3-bit, lo que puede degradar la calidad frente al modelo original, especialmente en tareas de razonamiento o generacion de codigo.
- Repo sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Exclusivo de MLX: el formato esta pensado para el ecosistema de Apple; desplegarlo en CUDA requiere conversion y no hay garantia de compatibilidad.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas o documentos extensos sin conocer la ventana de contexto.
- Fecha de creacion futura en los metadatos (2026-11-26): conviene verificar la integridad y procedencia del repo antes de confiar en el.

## Enlaces

- Hugging Face: https://huggingface.co/timesmith/Inkling-2-Mini-oQ3.5e
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Modelo base Inkling-2-Mini: no disponible
- Paper, blog o demo: no disponible
