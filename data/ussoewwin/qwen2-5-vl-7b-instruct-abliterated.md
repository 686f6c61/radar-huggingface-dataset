# ussoewwin/Qwen2.5-VL-7B-Instruct-abliterated

## Resumen

Qwen2.5-VL-7B-Instruct-abliterated es una variante del modelo vision-lenguaje Qwen2.5-VL-7B-Instruct desarrollado originalmente por el equipo Qwen de Alibaba. Esta version concreta, publicada por el usuario ussoewwin, aplica una "abliteration" sobre los pesos originales: una tecnica de edicion de pesos que modifica los mecanismos de rechazo y seguridad del modelo, eliminando o atenuando las respuestas de negativa ante ciertas peticiones. El repositorio incluye los pesos FP16 fusionados (los archivos originalmente divididos se han unificado) y una copia cuantizada en INT8 mediante el pipeline propio HSWQ ConvRot.

El modelo conserva la arquitectura multimodal de Qwen2.5-VL: un transformer con vision encoder que procesa imagenes y texto de forma conjunta, con 7 mil millones de parametros y una ventana de contexto larga (hasta 128K tokens en la familia Qwen2.5-VL). Resuelve tareas de image-to-text, generacion de texto multimodal, razonamiento visual y descripcion de imagenes. Su relevancia actual radica en que ofrece una version sin filtros de seguridad para investigacion sobre alineamiento, red teaming y estudios de robustez, ademas de una cuantizacion INT8 que reduce el peso en disco un 41,3 % respecto al BF16.

La licencia Apache 2.0 se hereda del modelo base, lo que permite uso comercial, aunque la modificacion abliterated introduce consideraciones eticas y de responsabilidad que el usuario debe evaluar. El repositorio tiene un tamano de 26,3 GB, incluye los pesos FP16 fusionados y la copia INT8, y esta orientado a despliegue en transformers y en ComfyUI mediante nodos especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision encoder + LLM decoder), familia Qwen2.5-VL |
| Parametros totales | 7 mil millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia Qwen2.5-VL soporta hasta 128K tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | FP16 (fusionado), INT8 (HSWQ ConvRot), BF16 (fuente original) |
| Idiomas soportados | en (segun la model card; el modelo base Qwen2.5-VL es multilingue, pero esta ficha solo declara ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16 fusionado y HSWQ ConvRot INT8) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-VL-7B-Instruct es un transformer multimodal compuesto por un vision encoder y un decoder de lenguaje. Procesa imagenes y texto de forma conjunta, lo que permite tareas de image-to-text y razonamiento visual. Esta variante concreta no ha sido reentrenada: la modificacion consiste en una abliteration aplicada sobre los pesos del modelo base, una tecnica que identifica y modifica las direcciones de activacion asociadas a los rechazos de seguridad, atenuando las respuestas de negativa sin reentrenar el modelo desde cero.

El autor del repositorio ha fusionado los archivos divididos originales en un unico conjunto de pesos FP16 y ha generado una copia cuantizada INT8 mediante su pipeline HSWQ (Hybrid Sensitivity-Weighted Quantization) con ConvRot. Segun la model card, la copia INT8 ocupa 9.289,6 MB frente a los 15.816,1 MB del BF16 original, lo que supone una reduccion del 41,3 % en disco. El pipeline HSWQ aplica cuantizacion ponderada por sensibilidad y rotacion de convolucion, y el resultado se integra en ComfyUI mediante metadatos de cabecera `comfy_quant` que permiten ejecutar operaciones INT8 Tensor Core sin desquantizacion manual. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en esta variante.

## Capacidades

- Generacion de texto e image-to-text: descripcion de imagenes, respuesta a preguntas visuales y generacion de texto condicionada por imagen.
- Razonamiento multimodal: combinacion de informacion visual y textual para tareas de comprension y analisis.
- Generacion de codigo y matematicas: capacidades heredadas del modelo base Qwen2.5-VL-7B-Instruct, aunque no se detallan en la model card.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles (`en`), aunque el modelo base es multilingue.
- Modo thinking: no disponible.
- Vision: si, el modelo es multimodal y procesa imagenes.
- Audio: no disponible.
- Abliteration: los mecanismos de rechazo y seguridad han sido modificados, lo que afecta al comportamiento ante peticiones sensibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta a las respuestas de rechazo y a la utilidad general, comparando con el modelo base sin modificar en experimentos controlados.
- Red teaming y evaluacion de robustez: util para probar la eficacia de filtros de seguridad externos y medir la facilidad con la que un modelo abliterated genera contenido que el original rechazaria.
- Descripcion de imagenes en pipelines de accesibilidad: el modelo puede generar descripciones textuales de imagenes para sistemas de lectura de pantalla, aprovechando su naturaleza image-to-text.
- Etiquetado y anotacion automatica de datos visuales: generacion de captions y metadatos para conjuntos de imagenes en tareas de curacion de datasets.
- Despliegue en ComfyUI para flujos generativos: la copia INT8 con metadatos `comfy_quant` se carga con el nodo CLIPLoader y ejecuta operaciones INT8 Tensor Core, lo que permite integrar el modelo como text encoder en pipelines de generacion de imagen.
- Experimentacion con cuantizacion INT8: el repositorio sirve como caso de estudio del pipeline HSWQ ConvRot, comparando calidad y rendimiento frente a FP16 y BF16 en tareas multimodales.
- Analisis de sesgos y contenido sensible: estudio de como la eliminacion de rechazos afecta a la generacion de contenido en dominios delicados, con fines de documentacion y mitigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para los pesos, mas overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto largo.
- VRAM estimada para inferencia en INT8: aproximadamente 9-10 GB para los pesos, mas overhead; viable en GPUs de 16 GB con contexto moderado.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP16; RTX 4080 (16 GB) o superior para INT8.
- Cabe en GPU consumer: si, en RTX 4090 para FP16 y en RTX 4080/4070 Ti Super para INT8, con limitaciones de contexto.
- Opciones de despliegue: transformers (libreria declarada), ComfyUI mediante nodos HSWQ y CLIPLoader; no se confirman vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ussoewwin/Qwen2.5-VL-7B-Instruct-abliterated | 7B | no disponible | Apache 2.0 | Hugging Face | Variante abliterated con cuantizacion INT8 HSWQ |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B | hasta 128K (familia) | Apache 2.0 | Hugging Face | Modelo base sin modificar, con filtros de seguridad |
| Otros modelos VL de 7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La abliteration modifica los mecanismos de rechazo: el modelo puede generar contenido que el original rechazaria, con implicaciones eticas y de responsabilidad para el usuario.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la modificacion de pesos no elimina este riesgo y puede alterar la calibracion.
- Sesgos conocidos: no documentados en la informacion proporcionada; el modelo base Qwen2.5-VL puede heredar sesgos de sus datos de entrenamiento.
- Limitaciones de idioma: la model card solo declara ingles; el rendimiento en castellano no esta confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la modificacion abliterated puede entrar en conflicto con politicas de uso aceptable de plataformas y proveedores.
- Caveat de produccion: la cuantizacion INT8 HSWQ ConvRot puede degradar la calidad respecto a FP16; no se han publicado evaluaciones comparativas en la informacion disponible.
- El repositorio tiene 0 descargas y 3 likes, lo que sugiere poca validacion comunitaria; conviene auditar los pesos antes de usarlos en produccion.
- La model card menciona una auditoria de backdoors con veredictos en un repositorio externo; se recomienda revisarla antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/ussoewwin/Qwen2.5-VL-7B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio HSWQ: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization
- Guia tecnica ConvRot INT8: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization/blob/main/md/Qwen25VL7B_ConvRot_INT8_Impact_Technical_Guide.md
- Auditoria de backdoors: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization/blob/main/md/Backdoor_Audit_Verdicts.md
- Archivos divididos originales: https://huggingface.co/ussoewwin/Qwen2.5-VL-7B-Instruct-abliterated/tree/main
