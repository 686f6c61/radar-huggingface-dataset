# unsloth/Qwen-Image-2.1-Turbo-FP8

## Resumen

Qwen-Image-2.1-Turbo-FP8 es una version cuantizada a FP8 e INT8 del checkpoint destilado Qwen-Image-2.1-Turbo, publicada por Unsloth. El modelo original, desarrollado por el equipo Qwen, es un modelo de difusion de 7B parametros para generacion de imagenes a partir de texto (text-to-image) y edicion de imagenes, optimizado para funcionar en solo 8 pasos de denoising con CFG=1. Esta publicacion no es un modelo nuevo, sino una reempaquetado de pesos: sustituye el transformer bf16 de 14,2 GB por tres variantes cuantizadas de entre 7,12 y 7,26 GB, manteniendo intactos el text encoder y el VAE del modelo original.

El problema que resuelve es el coste de VRAM y de ancho de banda de memoria del checkpoint bf16 original. Al reducir el transformer a aproximadamente la mitad de tamano, el modelo se vuelve desplegable en GPUs de gama alta de consumo, manteniendo una fidelidad muy alta respecto al original: la variante INT8-ConvRot presenta un LPIPS (AlexNet) de 0,037 frente al bf16, mientras que la variante FP8 sube hasta 0,125. Unsloth recomienda explicitamente el fichero INT8-ConvRot por ese motivo.

El modelo es relevante ahora porque combina tres factores poco habituales a la vez: generacion de imagen en 8 pasos, pesos en safetensors (sin ejecucion de codigo arbitrario al cargar) y licencia de investigacion de Qwen. Sus idiomas soportados son ingles y chino. El repositorio no incluye el text encoder ni el VAE: hay que tomarlos de unsloth/Qwen-Image-2.1-FP8, ya que el text encoder es byte-identico al de Qwen-Image-2.1 y el VAE es identico en bf16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de imagen (text-to-image e image editing); arquitectura de generacion visual de 7B heredada de Qwen-Image-2.1; se carga con QwenImage21Pipeline en Diffusers |
| Parametros totales | 7B (arquitectura de generacion visual del modelo base) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible (modelo de difusion; la informacion proporcionada no documenta la longitud de prompt del text encoder) |
| Tipos de cuantizacion | FP8 e4m3 con escalas por fila; INT8 W8A8 group-256 sin rotacion; INT8 W8A8 group-256 con rotacion Hadamard (ConvRot). Norms, modulation, timestep embeddings y, en las variantes INT8, txt_in se mantienen en bf16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | qwen-research (license: other); texto completo en el LICENSE del modelo base |
| Formato de pesos | safetensors (no pickle, por lo que la carga no ejecuta codigo arbitrario) |
| Pasos de muestreo | 8 pasos de denoising, CFG = 1 por defecto |
| Tamano del transformer | 7,12 GB (FP8), 7,26 GB (INT8) y 7,26 GB (INT8-ConvRot); el bf16 equivalente ocupa 14,2 GB |
| Tamano del repositorio | 21,6 GB (los tres ficheros de transformer; no incluye text encoder ni VAE) |
| Componentes auxiliares | Text encoder y VAE no incluidos; deben tomarse de unsloth/Qwen-Image-2.1-FP8 |
| Revision del modelo base | d65dbc9a7e8f6b5479e33dee6030eaab2a906509 (Qwen/Qwen-Image-2.1-Turbo) |
| Resolucion de referencia | 1024x1024 (segun la configuracion de evaluacion LPIPS) |
| Fecha de publicacion | 2026-10-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo es un checkpoint acelerado de Qwen-Image-2.1 obtenido mediante destilacion, que reduce la generacion a 8 pasos de denoising con CFG=1. Mantiene la misma arquitectura de generacion visual de 7B del modelo original y se carga directamente con QwenImage21Pipeline en Diffusers. El checkpoint incluye su propio schedule de sigmas recomendado, de modo que el scheduler no necesita configurarse manualmente. La informacion disponible no detalla la topologia interna mas alla de ese dato, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo etapas de RLHF o DPO (poco habituales en modelos de difusion).

La innovacion tecnica mas relevante de la variante Turbo es el cacheo de KV de prefijo, que reutiliza el contexto de texto y de imagen de referencia a lo largo de los pasos de denoising en lugar de recomputarlo. Esto, junto con los 8 pasos y la ausencia de doble pase de CFG, reduce drasticamente el coste por imagen.

En cuanto a esta publicacion concreta, Unsloth aplica la misma receta que en unsloth/Qwen-Image-2.1-FP8: cuantiza todas las capas lineales del transformer salvo las norms, las modulation, los timestep embeddings y, en las variantes INT8, txt_in, que permanecen en bf16. La variante INT8-ConvRot aplica ademas una rotacion Hadamard con grupos de 256, lo que reduce notablemente el error de cuantizacion. No se documenta en la informacion disponible si estos ficheros admiten entrenamiento o fine-tuning posterior.

## Capacidades

- Generacion de imagenes texto-a-imagen en 8 pasos de denoising con CFG=1, con resolucion de referencia de 1024x1024.
- Edicion de imagenes: el modelo base Turbo soporta image editing y el cacheo de KV de prefijo reutiliza el contexto de imagen de referencia entre pasos.
- Renderizado de texto dentro de la imagen: uno de los prompts de ejemplo del autor pide una pizarra de menu con el texto "FRESH COFFEE 2.50" escrito a mano con caligrafia cuidada, lo que indica soporte para texto legible en la generacion.
- Fidelidad al bf16 medida con LPIPS: 0,037 en INT8-ConvRot, 0,089 en INT8 y 0,125 en FP8 (cuanto menor, mejor).
- Idiomas de prompt: ingles y chino.
- Compatibilidad con el ecosistema Diffusers mediante QwenImage21Pipeline y con los componentes del repositorio unsloth/Qwen-Image-2.1-FP8.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo de difusion de imagen, no un modelo de lenguaje.
- La informacion disponible no documenta capacidades de vision de entrada, audio, video ni modo de razonamiento explicito.

## Casos de uso

- Prototipado rapido de assets graficos: con 8 pasos y CFG=1, cada imagen requiere muy pocas evaluaciones del transformer, lo que permite generar variaciones de forma iterativa durante el diseno sin esperas largas.
- Generacion de carteles y mockups con texto integrado: los ejemplos del autor incluyen una pizarra de cafeteria con precios escritos a mano, de modo que el modelo sirve para generar menus, rotulos y mockups publicitarios donde el texto debe ser legible.
- Edicion de imagenes por referencia: el soporte de image editing junto con el cacheo de contexto de imagen de referencia permite generar variaciones de un producto o de una escena manteniendo coherencia con la imagen de entrada.
- Despliegue en GPUs de gama alta de consumo: al reducir el transformer de 14,2 GB a 7,12-7,26 GB, el modelo pasa a ser viable en tarjetas con 16-24 GB de VRAM en lugar de requerir hardware de centro de datos, segun los tamanos de fichero publicados.
- Servicio multiinquilino con varias generaciones concurrentes: la reduccion de memoria por instancia libera VRAM para mantener mas workers en paralelo en el mismo nodo, aumentando el throughput agregado del servicio.
- Ilustracion para documentacion tecnica y marketing bilingue: con prompts en ingles y chino, cubre los dos idiomas habituales en las operaciones de producto de gran parte de las empresas tecnologicas, sin necesidad de un segundo modelo.
- Evaluacion comparativa de tecnicas de cuantizacion: los tres ficheros con LPIPS publicado permiten reproducir un estudio controlado de INT8 con rotacion frente a INT8 simple frente a FP8 manteniendo el mismo text encoder bf16.
- Integracion en pipelines automaticos de generacion de contenido: al ser safetensors, la carga no ejecuta codigo arbitrario, lo que simplifica las revisiones de seguridad en entornos de integracion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen tipo FID, CLIP score o GenEval en la informacion disponible. El unico dato de evaluacion publicado es la distancia LPIPS (AlexNet) contra el transformer bf16 Turbo, calculada con los ajustes del model card: 8 pasos, CFG 1, el schedule de sigmas incluido, 1024x1024, 8 prompts por 2 semillas, con el mismo text encoder bf16 en todas las ejecuciones.

| Fichero | Esquema de cuantizacion | Tamano | LPIPS vs bf16 Turbo (menor es mejor) |
|---|---|---|---|
| Qwen-Image-2.1-Turbo-INT8-ConvRot.safetensors | INT8 W8A8, group-256 con rotacion Hadamard | 7,26 GB | 0,037 |
| Qwen-Image-2.1-Turbo-INT8.safetensors | INT8 W8A8, sin rotacion | 7,26 GB | 0,089 |
| Qwen-Image-2.1-Turbo-FP8.safetensors | FP8 e4m3, escalas por fila | 7,12 GB | 0,125 |
| Qwen/Qwen-Image-2.1-Turbo (referencia) | bf16 | 14,2 GB | 0 (referencia) |

No se han publicado datos de throughput ni de latencia en la informacion disponible.

## Requisitos de hardware

- Tamano del transformer por variante: 7,12 GB (FP8), 7,26 GB (INT8) y 7,26 GB (INT8-ConvRot), frente a 14,2 GB del bf16 original.
- Componentes adicionales obligatorios: el repositorio no incluye text encoder ni VAE, por lo que hay que descargarlos aparte desde unsloth/Qwen-Image-2.1-FP8. Los tamanos de esos componentes no se especifican en la informacion disponible, de modo que no se puede dar una cifra cerrada de VRAM total.
- VRAM estimada para inferencia: no disponible de forma oficial. Como orientacion derivada de los tamanos de fichero publicados, el transformer cuantizado ocupa entre 7,12 y 7,26 GB, a lo que hay que sumar el text encoder y el VAE; una GPU de 16 GB o mas es el punto de partida razonable para 1024x1024, pero debe validarse en el hardware concreto.
- GPUs recomendadas: no especificadas por el autor. Las tarjetas de gama alta de consumo (24 GB de VRAM) y las de centro de datos (A100, H100) caben holgadamente; en tarjetas de 16 GB el margen depende del text encoder empleado.
- Opciones de despliegue: Diffusers con las dependencias `transformers>=5.17.0`, `accelerate` y `pillow`. Requiere una build de `main` de Diffusers con soporte de sigmas de muestreo configuradas por el pipeline (PR #14950), ya que aun no esta en una version estable.
- No se documentan en la informacion disponible otras opciones de despliegue para este modelo (por ejemplo, vLLM, llama.cpp, Ollama o TGI, orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles. Cualitativamente, el uso de 8 pasos con CFG=1 implica la mitad de evaluaciones del transformer que un esquema con guidance, antes de contar el ahorro del cacheo de KV de prefijo.
- Almacenamiento: 21,6 GB para el repositorio completo con las tres variantes; descargar un unico fichero reduce el consumo a unos 7,2 GB mas los componentes auxiliares.

## Comparativa con modelos similares

| Modelo | Parametros | Transformer | Pasos / guidance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unsloth/Qwen-Image-2.1-Turbo-FP8 (este) | 7B | 7,12-7,26 GB cuantizado (FP8 o INT8) | 8 pasos, CFG 1 | qwen-research | HuggingFace, safetensors |
| Qwen/Qwen-Image-2.1-Turbo | 7B | 14,2 GB bf16 | 8 pasos, CFG 1 | qwen-research | HuggingFace, ModelScope |
| unsloth/Qwen-Image-2.1-FP8 | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | HuggingFace; aporta el text encoder FP8 y el VAE bf16 compatibles con este repositorio |
| Qwen/Qwen-Image-2.1 | 7B | No disponible | Version no destilada, con mas pasos de denoising (numero no especificado) | qwen-research | HuggingFace |

Las tres variantes cuantizadas de este repositorio comparten exactamente la misma arquitectura y el mismo text encoder; la unica diferencia medible publicada es el LPIPS frente al bf16 (0,037 / 0,089 / 0,125). No se dispone de comparaciones frente a otros modelos de difusion de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia qwen-research, etiquetada como `license: other`. La informacion disponible no detalla los terminos concretos, pero la denominacion "research" obliga a revisar el texto completo de la licencia antes de cualquier uso comercial o de redistribucion.
- Perdida de fidelidad por cuantizacion: incluso la mejor variante (INT8-ConvRot) presenta un LPIPS de 0,037 y la FP8 sube a 0,125. Para produccion donde la fidelidad sea critica hay que evaluar si ese error es aceptable o usar el bf16.
- La variante FP8 es la mas rapida de descargar pero la menos fiel de las tres; el autor recomienda INT8-ConvRot, no FP8, pese al nombre del repositorio.
- Dependencia de una build no estable: requiere Diffusers `main` con la PR #14950 (sigmas de muestreo configuradas por el pipeline). Un cambio en esa rama puede romper la reproducibilidad del entorno.
- El repositorio esta incompleto por si solo: sin el text encoder y el VAE de unsloth/Qwen-Image-2.1-FP8 no se puede ejecutar el pipeline.
- Idiomas limitados a ingles y chino; no hay soporte documentado para prompts en castellano.
- Riesgo de artefactos y de errores en el texto renderizado dentro de la imagen, especialmente en tipografias complejas o cadenas largas, inherente a los modelos de difusion.
- Riesgo de sesgos procedentes del dataset de entrenamiento del modelo base, cuya composicion no se documenta en la informacion disponible y no puede auditarse a partir de esta publicacion.
- No es un modelo de lenguaje: no sirve para generacion de texto, razonamiento, codigo ni uso como agente.
- Ambito de contexto del prompt no documentado, lo que dificulta planificar el troceado de prompts largos en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de la comunidad sobre estos ficheros concretos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/unsloth/Qwen-Image-2.1-Turbo-FP8
- Guia de Unsloth para ejecutar Qwen-Image-2.1: https://unsloth.ai/docs/models/qwen-image-2.1
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Modelo original no destilado: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de Unsloth con text encoder FP8 y VAE compatible: https://huggingface.co/unsloth/Qwen-Image-2.1-FP8
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- Repositorio en ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1-Turbo
- Repositorio de codigo en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Blog de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- PR de Diffusers con el soporte de sigmas configuradas por el pipeline: https://github.com/huggingface/diffusers/pull/14950
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
- Servidor de Discord de Qwen: https://discord.gg/BEYSk3pkSu
