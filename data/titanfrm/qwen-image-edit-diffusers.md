# Titanfrm/Qwen-Image-Edit-Diffusers

## Resumen

Qwen-Image-Edit-Diffusers es un repositorio de reempaquetado publicado por el usuario Titanfrm que convierte a formato Diffusers los pesos del modelo Qwen-Image-Edit-Rapid-AIO, desarrollado originalmente por Phr00t. No se trata de un modelo entrenado desde cero, sino de una conversión de los tensores del transformer de cada release a la estructura que espera la clase `QwenImageTransformer2DModel` de la librería Diffusers, manteniendo los pesos sin recuantizar y fragmentándolos en ficheros safetensors de aproximadamente 5 GB con su índice correspondiente.

El modelo subyacente pertenece a la familia Qwen-Image-Edit de Alibaba (Qwen), un modelo de edición de imágenes de tipo image-to-image con 20B parámetros según la información pública disponible. Las distintas versiones del repositorio se construyen sobre dos bases: Qwen/Qwen-Image-Edit-2509 (versiones V.1 a V.14.x) y Qwen/Qwen-Image-Edit-2511 (versiones V.15 en adelante). El repositorio solo incluye el transformer y su `config.json`; el text encoder, tokenizer, processor y VAE deben cargarse desde el modelo base correspondiente.

La relevancia de este repositorio es práctica: permite cargar directamente los pesos de Rapid-AIO mediante `from_pretrained` con el parámetro `subfolder`, sin necesidad de convertir manualmente los ficheros originales. Es importante señalar que, salvo la versión V.15, todas las versiones del repositorio están etiquetadas como NSFW y restringidas a adultos, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para edicion de imagenes (QwenImageTransformer2DModel) |
| Parametros totales | 20B (modelo base Qwen-Image-Edit) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en safetensors sin recuantizar (se cargan en bfloat16 en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors fragmentados (~5 GB por fichero) con fichero de indice |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer de difusion para edicion de imagenes, empaquetado para la clase `QwenImageTransformer2DModel` de Diffusers. El repositorio no entrena ni afina ningún modelo: copia los tensores del transformer original de Phr00t tal cual, sin recuantización, los fragmenta en shards de unos 5 GB con índice y verifica que los nombres de los tensores coinciden exactamente con los que espera Diffusers (sin tensores faltantes ni sobrantes). El `config.json` utilizado es el del modelo base correspondiente a cada versión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura del modelo base Qwen-Image-Edit. El pipeline de uso emplea `QwenImageEditPlusPipeline` combinado con el transformer convertido y los componentes restantes (text encoder, tokenizer, processor y VAE) cargados desde el modelo base.

## Capacidades

- Edicion de imagenes image-to-image: el pipeline `QwenImageEditPlusPipeline` recibe una imagen de entrada y una instruccion para producir la imagen editada.
- Carga selectiva por version: cada release dispone de su propia carpeta (`<version>/transformer`), lo que permite intercambiar versiones sin modificar el resto del pipeline.
- Compatibilidad con Diffusers: integracion directa mediante `from_pretrained` con el parametro `subfolder`.
- Variantes de pocos pasos: existen releases como `V.1-8step` y `V.9-Lite` orientadas a generacion con menos pasos de inferencia.
- Dos bases de modelo: versiones construidas sobre Qwen-Image-Edit-2509 y sobre Qwen-Image-Edit-2511.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Edicion de imagenes por instruccion en flujos de diseno: cargar el transformer de una version concreta con `subfolder` y combinarlo con el pipeline `QwenImageEditPlusPipeline` para aplicar transformaciones guiadas por texto sobre imagenes de producto o maquetas.
- Prototipado rapido con Diffusers: al estar en formato Diffusers nativo, se integra en scripts y notebooks existentes sin conversiones manuales, lo que acelera la experimentacion con distintas versiones del modelo.
- Comparacion de releases: la estructura de carpetas por version permite evaluar V.1, V.14.1, V.23 u otras sobre el mismo conjunto de imagenes y decidir cual encaja mejor en un flujo concreto.
- Generacion con pocos pasos: las variantes `V.1-8step` y `V.9-Lite` reducen el coste de inferencia, utiles en entornos con presupuesto de GPU limitado o para previsualizaciones interactivas.
- Investigacion sobre edicion de imagenes: sirve como punto de partida reproducible para estudiar el comportamiento de la familia Qwen-Image-Edit en tareas image-to-image con pesos ya empaquetados.
- Integracion en pipelines de produccion con control de contenido: la version V.15, basada en Qwen-Image-Edit-2511 y marcada como SFW, es la unica opcion del repositorio apta para entornos donde el contenido para adultos no esta permitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base declara 20B parametros y el ejemplo de carga usa `torch_dtype=torch.bfloat16`, lo que implica requisitos elevados de memoria.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamano del modelo y el uso de bfloat16 sugieren que no cabe en GPU de consumo habituales, pero no se confirma en la documentacion.
- Opciones de despliegue: Diffusers (`QwenImageEditPlusPipeline` + `QwenImageTransformer2DModel`). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 715.1 GB, ya que incluye multiples versiones con shards de aproximadamente 5 GB cada una; conviene descargar solo la carpeta de la version necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Titanfrm/Qwen-Image-Edit-Diffusers | 20B (base) | no disponible | apache-2.0 | safetensors (Diffusers) | Reempaquetado de Rapid-AIO; multiple versiones, mayoria NSFW |
| Qwen/Qwen-Image-Edit-2509 | 20B | no disponible | apache-2.0 | no disponible | Modelo base oficial de Qwen para edicion de imagenes |
| Qwen/Qwen-Image-Edit-2511 | no disponible | no disponible | apache-2.0 | no disponible | Base de las versiones V.15 en adelante |
| Phr00t/Qwen-Image-Edit-Rapid-AIO | no disponible | no disponible | no disponible | safetensors | Fuente original de los pesos convertidos |

## Limitaciones y advertencias

- Contenido NSFW: salvo V.15, todas las versiones del repositorio estan marcadas como not-for-all-audiences y son solo para adultos; no deben desplegarse en entornos generalistas sin control de contenido.
- Repositorio de reempaquetado: no es un modelo original; cualquier problema de calidad o comportamiento proviene de los pesos de Phr00t y del modelo base de Qwen.
- Componentes incompletos: el repositorio solo incluye transformer y `config.json`; sin el text encoder, tokenizer, processor y VAE del modelo base el pipeline no funciona.
- Correspondencia estricta base-version: usar la base equivocada (2509 para V.1-V.14.x, 2511 para V.15 y posteriores) puede provocar fallos de carga o resultados incorrectos.
- Riesgo de alucinacion visual: no documentado en la informacion disponible, pero inherente a los modelos generativos de imagen.
- Sesgos: no documentados en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: apache-2.0 segun la model card, aunque conviene verificar las condiciones del repositorio original de Phr00t antes de un uso comercial.
- Tamano del repositorio: 715.1 GB en total; la descarga completa es costosa y conviene limitarse a la carpeta de la version requerida.
- Falta de afiliacion: el autor declara no estar afiliado ni a Phr00t ni al equipo de Qwen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Titanfrm/Qwen-Image-Edit-Diffusers
- Modelo original de Phr00t: https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
- Modelo base Qwen-Image-Edit: https://huggingface.co/Qwen/Qwen-Image-Edit
- Modelo base Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- README de Qwen-Image-Edit-2509 en formato Diffusers (referencia): https://huggingface.co/j4s0ch3/Qwen-image-diffusers/blob/main/Qwen-Image-Edit-2509/README.md
