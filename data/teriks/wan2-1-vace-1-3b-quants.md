# Teriks/Wan2.1-VACE-1.3B-quants

## Resumen

Teriks/Wan2.1-VACE-1.3B-quants es un conjunto de cuantizaciones del transformer del modelo Wan-AI/Wan2.1-VACE-1.3B-diffusers, un modelo de generacion de video condicionada por video (VACE, Video All-in-one Creation and Editing) desarrollado originalmente por el equipo Wan de Alibaba. Este repositorio no contiene pesos originales ni un modelo entrenado desde cero: ofrece los mismos pesos del transformer en 12 formatos GGUF (desde Q2_K hasta IQ4_XS) y dos formatos safetensors para ComfyUI (float8_e4m3fn e int8_tensorwise), generados con la herramienta dgenerate 6.0.0 del propio autor.

El objetivo es facilitar el despliegue del transformer de 2.153.972.032 parametros en entornos con VRAM limitada y en flujos de trabajo basados en ComfyUI, reduciendo el peso del fichero de transformer desde aproximadamente 4 GB en precision original hasta 683 MB en Q2_K. Es relevante para desarrolladores que quieran ejecutar tareas de edicion y generacion de video con Wan 2.1 VACE en GPUs de consumo, sin necesidad de descargar el repositorio original completo ni de disponer de hardware de datacenter.

La ficha describe exclusivamente lo que consta en la informacion disponible: la model card del repositorio de cuantizaciones y los metadatos de Hugging Face. Los detalles sobre arquitectura interna, datos de entrenamiento, benchmarks y licencia del modelo base no se incluyen en la informacion proporcionada y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D para difusion de video (`WanVACETransformer3DModel`), componente `transformer` del pipeline `WanVACEPipeline` |
| Parametros totales | 2.153.972.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible (modelo de video, no de texto) |
| Licencia | no disponible en la informacion proporcionada; la model card indica que se aplica la licencia del modelo origen |
| Formato de pesos | GGUF (12 variantes) y safetensors (2 variantes ComfyUI) |

## Arquitectura y entrenamiento

El repositorio contiene unicamente cuantizaciones del componente `transformer` del modelo Wan-AI/Wan2.1-VACE-1.3B-diffusers, que segun la model card corresponde a la clase `WanVACETransformer3DModel` dentro del pipeline `WanVACEPipeline`. Se trata, por tanto, de un transformer tridimensional empleado como red de difusion para tareas de generacion y edicion de video condicionada por video (VACE). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del modelo base en la informacion proporcionada.

El proceso de cuantizacion lo realiza la herramienta dgenerate 6.0.0 del autor. Los tensores se nombran siguiendo el layout de ComfyUI (`--comfy`), de modo que ComfyUI y ComfyUI-GGUF puedan cargar los ficheros que dispongan de key map para esa arquitectura. La model card advierte que un componente sin key map se considera un error. Para los formatos GGUF se ofrecen 12 variantes (Q2_K a IQ4_XS); para ComfyUI se ofrecen dos variantes safetensors (float8_e4m3fn e int8_tensorwise). El comando de generacion documentado es `dgenerate --sub-command quantize Wan-AI/Wan2.1-VACE-1.3B-diffusers --subfolders transformer --formats gguf comfy --comfy ...`.

## Capacidades

- Generacion de video condicionada por video: el modelo base Wan2.1-VACE esta disenado para tareas VACE (Video All-in-one Creation and Editing), lo que incluye generacion y edicion de video a partir de una entrada de video.
- Edicion de video: al ser un modelo VACE, se orienta a la manipulacion y transformacion de video existente.
- Integracion con ComfyUI: los ficheros safetensors y GGUF siguen el layout de ComfyUI y estan pensados para cargarse mediante ComfyUI y ComfyUI-GGUF.
- Integracion con dgenerate: el autor mantiene dgenerate, que puede consumir estos ficheros de cuantizacion.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (modelo de video).
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Edicion de video en local con GPU de consumo: cargando la variante Q4_K (1.1 GB) o IQ4_XS (1.1 GB) en ComfyUI, se puede ejecutar el transformer de Wan 2.1 VACE en GPUs con VRAM moderada, algo inviable con los pesos en precision original.
- Prototipado rapido de pipelines VACE: la variante Q2_K (683.3 MB) permite iterar sobre flujos de edicion de video con un coste de almacenamiento y de VRAM minimo, aceptando la perdida de calidad asociada a 2 bits.
- Produccion con calidad alta en ComfyUI: la variante float8_e4m3fn o int8_tensorwise (2.0 GB cada una) ofrece una reduccion de peso moderada manteniendo mayor fidelidad que las cuantizaciones GGUF de baja precision, adecuada para render final en flujos ComfyUI.
- Despliegue en entornos con almacenamiento limitado: al reducir el transformer de aproximadamente 4 GB a entre 683 MB y 2.1 GB, el repositorio facilita el despliegue en contenedores o nodos con cuotas de disco estrictas.
- Investigacion sobre cuantizacion de modelos de difusion de video: al ofrecer 14 variantes del mismo transformer, permite comparar el impacto de Q2_K, Q4_K, Q8_0, fp8 e int8 en la calidad de salida de un pipeline VACE.
- Integracion en herramientas propias via dgenerate: el autor mantiene dgenerate, por lo que estos ficheros pueden consumirse directamente desde esa herramienta en scripts de generacion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente 0.7 GB en Q2_K, 1.1 GB en Q4_K/IQ4_XS/IQ4_NL, 1.4-1.7 GB en Q5-Q6, 2.0-2.1 GB en Q8_0, float8_e4m3fn e int8_tensorwise. A esta cifra hay que sumar la VRAM del resto del pipeline `WanVACEPipeline` (VAE, text encoder y demas componentes), no incluidos en este repositorio y no cuantificados aqui.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del transformer cuantizado, es plausible su uso en GPUs de consumo, pero el requisito real depende de los componentes adicionales del pipeline, que no se detallan.
- Cabe en GPU de consumo: si para el transformer aislado en cuantizaciones de 4 bits o inferiores; el pipeline completo requiere evaluacion adicional.
- Opciones de despliegue: ComfyUI y ComfyUI-GGUF (soportados explicitamente por la model card), dgenerate 6.0.0. Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan indicadas y no son aplicables a un modelo de difusion de video.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Wan2.1-VACE-1.3B-quants | 2.153.972.032 (transformer) | no disponible | GGUF (12), safetensors (2) | no disponible (aplica la del modelo origen) | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-VACE-1.3B-diffusers | 2.153.972.032 (transformer) | no disponible | safetensors originales | no disponible en la informacion proporcionada | Hugging Face (modelo origen) |
| Otras cuantizaciones de Wan 2.1 VACE | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento ni de licencia que permitan una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Este repositorio contiene solo cuantizaciones del componente `transformer`; no incluye el pipeline completo. La model card indica que hay que mantener el repositorio original como modelo y pasar el fichero de cuantizacion con la opcion de componente correspondiente, para que la configuracion siga viniendo del repositorio original.
- Los tensores siguen el layout de ComfyUI (`--comfy`); un componente sin key map para esa arquitectura se considera un error al cargar.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) degradan la calidad de salida de forma esperada; no se han publicado evaluaciones cuantitativas del impacto en la calidad del video generado.
- La licencia del modelo origen se aplica a estos pesos, pero la licencia concreta no consta en la informacion proporcionada; debe consultarse en el repositorio Wan-AI/Wan2.1-VACE-1.3B-diffusers antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion (en el sentido de artefactos o contenido no fiel en el video generado) ni limitaciones de contexto o idioma.
- La fecha de creacion y actualizacion del repositorio (2026-11-21) figura en los metadatos; conviene verificar su coherencia con el estado real del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Teriks/Wan2.1-VACE-1.3B-quants
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B-diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
