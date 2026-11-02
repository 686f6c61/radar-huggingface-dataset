# TracerUst/qwen-image-edit-plus-nsfw-lora

## Resumen

MCNL v1 (Multi Concept NSFW LoRA) es un adaptador LoRA para el pipeline de difusion Qwen-Image-Edit-2511, desarrollado por el usuario TracerUst (con referencias cruzadas a ScottzillaSystems en la model card). Su proposito es habilitar la generacion y edicion de contenido para adultos (NSFW) sobre el modelo base de edicion de imagen de Qwen, mediante la incorporacion de conceptos y trigger words especificos que el modelo base no expone de forma nativa.

Tecnicamente se trata de un adaptador de bajo rango (LoRA) sobre la arquitectura QwenImageTransformer2DModel (MMDiT), empaquetado en un unico fichero safetensors de aproximadamente 563 MB (0,6 GB de repositorio). No es un modelo autonomo: requiere cargar el pipeline `QwenImageEditPlusPipeline` junto con los pesos base de Qwen-Image-Edit-2511 y aplicar despues el adaptador mediante `load_lora_weights`.

Su relevancia es acotada y de nicho: demuestra el patron habitual de fine-tuning ligero sobre modelos de difusion de gran tamano para especializar dominios concretos sin reentrenar el modelo completo, y sirve como ejemplo de publicacion de adaptadores NSFW bajo licencia OpenRAIL++ con restricciones de uso. No aporta innovaciones arquitectonicas; su interes es practico para quien ya trabaje con el ecosistema Qwen-Image-Edit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre QwenImageTransformer2DModel (MMDiT) |
| Parametros totales | no disponible (adaptador LoRA; tamano de fichero ~563 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; el modelo base admite bfloat16) |
| Idiomas soportados | no disponible (los prompts del pipeline son textuales; no se documenta cobertura linguistica) |
| Licencia | OpenRAIL++ |
| Formato de pesos | safetensors (`qwen-image-edit-plus-nsfw-lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen-Image-Edit-2511, un modelo de difusion de edicion de imagen basado en un transformer MMDiT (QwenImageTransformer2DModel) que combina atencion multimodal para procesar simultaneamente la imagen de entrada y el prompt textual. El LoRA introduce matrices de bajo rango en las capas del transformer para desplazar la distribucion generativa hacia conceptos NSFW concretos, manteniendo congelados los pesos originales.

La model card no documenta el dataset de entrenamiento, el numero de pasos, el rango del LoRA, la tasa de aprendizaje ni si se emplearon tecnicas de regularizacion o captions automaticos. Tampoco se especifica si el entrenamiento partio de imagenes reales, sinteticas o de un corpus mixto. La unica informacion tecnica concreta es el tamano del fichero (~563 MB) y el formato safetensors, ademas de la lista de trigger words que definen los conceptos aprendidos.

## Capacidades

- Edicion de imagen a partir de una imagen de entrada y un prompt textual, heredada del pipeline Qwen-Image-Edit-2511.
- Generacion de contenido para adultos mediante trigger words especificas: `nsfw`, `nipples`, `vagina`, `penis`, `missionary`, `cowgirlout`, `reversecowgirlpov`, `blowjob`, `cum_on_face`, `creamp1e`, `l1ck`.
- Control de la generacion mediante `negative_prompt`, `num_inference_steps` y `true_cfg_scale` (parametros del pipeline base).
- Integracion con diffusers: carga mediante `load_lora_weights` y activacion mediante `set_adapters`.
- Compatibilidad con el Space de terceros ScottzillaSystems Image Editor para uso sin codigo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision analitica ni audio; es exclusivamente un adaptador de generacion/edicion de imagen.

## Casos de uso

- Edicion de imagenes para adultos en flujos creativos privados: el adaptador permite transformar una imagen de entrada aplicando conceptos NSFW especificos mediante trigger words, usando el pipeline `QwenImageEditPlusPipeline` con `num_inference_steps=40` y `true_cfg_scale=4.0` como valores de referencia de la model card.
- Prototipado de pipelines de edicion especializados: util para desarrolladores que quieran validar el patron de carga de LoRAs sobre Qwen-Image-Edit-2511 antes de entrenar sus propios adaptadores en otros dominios.
- Pruebas de concepto en el Space ScottzillaSystems: permite evaluar el adaptador sin infraestructura propia seleccionando "MCNL-NSFW-v1" en el desplegable de adaptadores.
- Investigacion sobre control de conceptos en modelos de difusion: sirve para estudiar como un LoRA de ~563 MB desplaza el comportamiento de un transformer MMDiT de gran tamano con un conjunto reducido de trigger words.
- Comparacion de versiones de adaptadores: la model card referencia MCNL v2 como version actualizada, lo que permite evaluar diferencias de comportamiento entre iteraciones del mismo autor.
- Integracion en herramientas de edicion de imagen autoalojadas: al ser un fichero safetensors estandar de diffusers, puede cargarse en scripts propios con PyTorch y CUDA, siempre que se cumplan las restricciones de licencia y edad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no disponible de forma especifica para el adaptador. El coste dominante es el del modelo base Qwen-Image-Edit-2511, que debe cargarse en bfloat16; el LoRA anade ~563 MB de pesos.
- GPU recomendadas: no documentadas en la model card. El ejemplo oficial usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que implica una GPU NVIDIA con soporte bfloat16.
- GPU de consumo: no se confirma que quepa en GPUs de gama consumer; no hay datos de VRAM minima ni de ejecucion en RTX 4090 u otras.
- Opciones de despliegue: diffusers (`QwenImageEditPlusPipeline` + `load_lora_weights`), o el Space de terceros ScottzillaSystems. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusion de este tipo).
- Latencia y throughput: no disponibles. La model card solo indica 40 pasos de inferencia como valor de ejemplo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MCNL v1 (este) | LoRA NSFW para edicion de imagen | Qwen-Image-Edit-2511 | ~563 MB | OpenRAIL++ | HuggingFace (0 descargas) |
| MCNL v2 | LoRA NSFW (version actualizada) | Qwen-Image-Edit-2511 | no disponible | no disponible | HuggingFace (ScottzillaSystems) |
| Qwen-Image-Edit-2511 | Modelo base de edicion de imagen | — | no disponible | no disponible en la informacion | HuggingFace (Qwen) |

No se dispone de datos de rendimiento, contexto ni benchmarks para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Contenido para adultos: el adaptador esta disenado explicitamente para generar material NSFW; su uso requiere verificacion de edad y cumplimiento de la legislacion aplicable en la jurisdiccion del usuario.
- Licencia OpenRAIL++: incluye restricciones de uso (uso responsable de IA); debe revisarse el texto completo antes de cualquier despliegue, especialmente en entornos comerciales.
- Dependencia del modelo base: no funciona de forma autonoma; requiere Qwen-Image-Edit-2511 y su pipeline en diffusers.
- Documentacion tecnica incompleta: no se detallan dataset, hiperparametros, rango del LoRA ni evaluacion cualitativa, lo que dificulta reproducir o auditar el entrenamiento.
- Riesgo de sesgos y contenido no deseado: al no haber evaluacion publicada, no se puede estimar la tasa de falsos positivos de las trigger words ni la calidad anatomica en casos limite.
- Trigger words con grafias alteradas (`creamp1e`, `l1ck`): pueden indicar tecnicas de evasion de filtros; conviene verificar su comportamiento real en el pipeline.
- Sin soporte multiidioma documentado: los prompts se procesan mediante el codificador de texto del modelo base, cuya cobertura linguistica no se especifica.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-02): inconsistencia que conviene tener en cuenta al evaluar la trazabilidad del repositorio.
- No apto para produccion sin auditoria previa: la ausencia de benchmarks, de documentacion de entrenamiento y de pruebas de calidad desaconseja su uso directo en sistemas productivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TracerUst/qwen-image-edit-plus-nsfw-lora
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- MCNL v2 (version actualizada): https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2
- Space ScottzillaSystems Image Editor: https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast
