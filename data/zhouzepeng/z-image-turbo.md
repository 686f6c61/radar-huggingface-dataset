# ZhouZePeng/Z-Image-Turbo

## Resumen

Z-Image-Turbo es un modelo de difusion para generacion de imagenes a partir de texto (text-to-image), desarrollado originalmente por Tongyi-MAI (Alibaba). El repositorio ZhouZePeng/Z-Image-Turbo no es el modelo original, sino un reempaquetado de sus pesos en formato de archivo unico (single-file) orientado a su uso directo en ComfyUI, con variantes de cuantizacion listas para cargar en los nodos de difusion de dicho entorno.

El modelo se distribuye con licencia Apache 2.0 y un tamano de repositorio de 40,7 GB, lo que refleja la inclusion de multiples variantes de pesos (bf16, int8 y nvfp4) junto con el text encoder Qwen 3 de 4B y el VAE. La arquitectura subyacente es un modelo de difusion que emplea un text encoder basado en Qwen 3 4B, lo que sugiere un pipeline de dos etapas: codificacion textual con un LLM y generacion de imagenes mediante difusion.

La relevancia de este repositorio es practica: elimina la friccion de convertir pesos al formato que espera ComfyUI y ofrece variantes cuantizadas (int8, nvfp4, fp8/fp4 para el text encoder) que reducen los requisitos de VRAM. No obstante, al tratarse de un reempaquetado sin descargas ni likes, conviene acudir al repositorio original para obtener documentacion tecnica, benchmarks y detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (text-to-image) con text encoder Qwen 3 4B; detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8 (convrot), nvfp4; text encoder en bf16, fp4 mixed y fp8 mixed |
| Idiomas soportados | no disponible (el text encoder Qwen 3 4B es multilingue, pero no se documenta en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos unicos para ComfyUI) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo de difusion (tipo de backbone, numero de parametros, mecanismo de atencion ni esquema de muestreo). Lo unico documentado es la composicion del pipeline empaquetado: un modelo de difusion principal (`z_image_turbo_bf16.safetensors` y sus variantes int8 y nvfp4), un text encoder Qwen 3 de 4B en tres variantes de precision, un VAE (`ae.safetensors`) y una LoRA de destilacion (`z_image_turbo_distill_patch_lora_bf16.safetensors`).

La presencia de una LoRA de destilacion y el sufijo "Turbo" sugieren un proceso de destilacion por pasos (step distillation), habitual en modelos que buscan generar imagenes en pocos pasos de muestreo. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o preferencia humana. Tampoco se documentan innovaciones tecnicas especificas mas alla del empaquetado para ComfyUI.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image).
- Upscaling de imagenes hasta 2K mediante workflow dedicado.
- Control estructural mediante ControlNet (workflow "Fun Union ControlNet").
- Integracion nativa con ComfyUI mediante archivos de difusion de carga directa.
- Variantes cuantizadas para reducir huella de VRAM (int8, nvfp4, fp8/fp4 en el text encoder).
- Soporte de LoRA de destilacion para ajuste del proceso de muestreo.

## Casos de uso

- Generacion rapida de ilustraciones y conceptos: el modelo puede producir imagenes a partir de descripciones textuales en ComfyUI, adecuado para iteracion creativa y prototipado visual.
- Upscaling de imagenes a 2K: el workflow dedicado permite ampliar imagenes existentes manteniendo detalle, util para preparar assets de impresion o pantalla.
- Control estructural con ControlNet: permite condicionar la generacion a mapas de profundidad, pose o bordes, util para mantener composiciones coherentes en produccion grafica.
- Despliegue en hardware consumer: las variantes int8 y nvfp4 reducen el uso de VRAM, lo que facilita ejecutar el modelo en GPUs de gama alta para consumidores.
- Pipelines automatizados de contenido visual: al ser archivos unicos compatibles con ComfyUI, se puede integrar en flujos por lotes para generar variaciones de imagenes de producto o marketing.
- Experimentacion en investigacion de difusion: la disponibilidad de pesos en bf16, int8 y nvfp4, junto con la LoRA de destilacion, permite comparar el impacto de la cuantizacion y la destilacion en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 40,7 GB e incluye pesos bf16, int8 y nvfp4, por lo que la variante bf16 requerira mas VRAM que las cuantizadas.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU consumer: las variantes int8 y nvfp4 estan pensadas para reducir requisitos, pero no se especifican modelos concretos.
- Opciones de despliegue: ComfyUI (formato nativo del repositorio); no se documentan otros entornos como vLLM, llama.cpp o TGI (no aplicables a difusion en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Repositorio de reempaquetado: no es el modelo original; la documentacion tecnica, benchmarks y garantias deben consultarse en Tongyi-MAI/Z-Image-Turbo.
- Sin descargas ni likes registrados: no hay evidencia de validacion por parte de la comunidad en este repositorio concreto.
- Sin datos de benchmarks ni de calidad de generacion en la informacion disponible.
- Idiomas soportados no documentados; el comportamiento multilingue del text encoder Qwen 3 4B no esta verificado en esta ficha.
- Riesgo de sesgos y alucinacion visual: no documentado, pero inherente a los modelos de difusion entrenados con datos web a gran escala.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original antes de uso comercial.
- El uso de variantes cuantizadas (int8, nvfp4) puede degradar la calidad de salida respecto a bf16; no se cuantifica dicha degradacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ZhouZePeng/Z-Image-Turbo
- Modelo original: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Workflows de ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/z_image/
- Plantilla text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_turbo.json
- Plantilla int8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_turbo_int8.json
- Plantilla upscaler 2K: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_z_image_turbo_2k_upscaler.app.json
- Plantilla ControlNet: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_z_image_turbo_fun_union_controlnet.json
