# Teriks/LTX-Video-quants

## Resumen

Teriks/LTX-Video-quants es un repositorio de cuantizaciones del modelo de generación de vídeo Lightricks/LTX-Video, publicado por el desarrollador Teriks. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales del transformer de LTX-Video a formatos de menor precisión (float8_e4m3fn e int8 con cuantización tensorwise), empaquetados en safetensors con el layout de claves que espera ComfyUI.

El objetivo es reducir el coste de memoria del transformer de LTX-Video para facilitar su inferencia en entornos con VRAM limitada, manteniendo el resto de componentes del pipeline (VAE, text encoder, scheduler) en el repositorio original. Las cuantizaciones se generaron con la herramienta dgenerate 6.0.0 del mismo autor, que automatiza la conversión de componentes individuales de pipelines de difusión.

El repositorio tiene un tamaño de 3,9 GB e incluye dos ficheros de aproximadamente 1,8 GB cada uno, correspondientes a los dos formatos de cuantización del transformer. La licencia y los idiomas no están declarados en la información disponible, aunque la model card indica que se aplica la licencia del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión 3D (LTXVideoTransformer3DModel, pipeline LTXPipeline) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se aplica la licencia del modelo fuente Lightricks/LTX-Video) |
| Formato de pesos | safetensors (layout ComfyUI) |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento propio: son pesos cuantizados del transformer de Lightricks/LTX-Video, un modelo de generación de vídeo basado en difusión con un transformer 3D (LTXVideoTransformer3DModel) integrado en el pipeline LTXPipeline. La cuantización se aplica únicamente al componente transformer, manteniendo el resto de componentes en el repositorio original.

Las conversiones se realizaron con dgenerate 6.0.0 mediante el subcomando `quantize`, con la opción `--comfy` para generar nombres de tensor compatibles con ComfyUI y ComfyUI-GGUF. Se ofrecen dos variantes: float8_e4m3fn (FP8) e int8_tensorwise (INT8 con escala por tensor). No se dispone de información sobre el dataset de entrenamiento original ni sobre procesos de RLHF o ajuste fino en la documentación proporcionada.

## Capacidades

- Generación de vídeo a partir de prompts de texto, heredada del modelo base LTX-Video.
- Inferencia con pesos de menor precisión (FP8 e INT8) para reducir el uso de VRAM.
- Compatibilidad con ComfyUI y ComfyUI-GGUF mediante key maps específicos de la arquitectura.
- Integración con el ecosistema dgenerate para flujos de cuantización reproducibles.
- No se documentan capacidades de tool calling, agentes, visión general o audio en la información disponible.

## Casos de uso

- Generación de vídeo en ComfyUI con VRAM limitada: cargando el transformer cuantizado en FP8 o INT8 junto al resto de componentes del repositorio original, se reduce el pico de memoria durante la difusión y se permite ejecutar el pipeline en GPUs de gama alta de consumo.
- Prototipado rápido de pipelines de vídeo: usar la variante FP8 para iterar sobre prompts y parámetros de muestreo con menor coste de memoria antes de pasar a los pesos completos.
- Despliegue en entornos con múltiples instancias: la reducción de tamaño del transformer (1,8 GB por fichero) facilita alojar varias copias del componente en un mismo servidor.
- Investigación sobre el impacto de la cuantización: comparar la calidad de salida entre float8_e4m3fn, int8_tensorwise y los pesos originales para estudiar la degradación introducida por cada formato.
- Automatización de conversiones con dgenerate: reproducir el comando documentado para generar cuantizaciones propias de otros componentes o variantes del modelo.
- Integración en flujos ComfyUI-GGUF: emplear los ficheros con key map para arquitecturas compatibles dentro de nodos personalizados de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer cuantizado: aproximadamente 1,8 GB por fichero según el tamaño del repositorio; el total del pipeline requiere además el VAE, el text encoder y los buffers de activación, cuyo consumo no está documentado.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el transformer cuantizado es pequeño, pero el pipeline completo de vídeo puede exceder la VRAM de GPUs de gama media.
- Opciones de despliegue: ComfyUI y ComfyUI-GGUF (soporte declarado mediante key maps); otras opciones como vLLM, llama.cpp o TGI no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/LTX-Video-quants | Cuantización de LTX-Video (FP8/INT8) | no disponible | no disponible | no disponible (hereda del fuente) | Hugging Face |
| Lightricks/LTX-Video | Modelo original de generación de vídeo | no disponible | no disponible | no disponible en esta ficha | Hugging Face |
| Otras cuantizaciones ComfyUI de modelos de vídeo | Cuantizaciones FP8/INT8 | no disponible | no disponible | variable según modelo base | Hugging Face / ComfyUI |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 o INT8 puede introducir degradación en la calidad visual del vídeo generado respecto a los pesos originales; no se documenta el grado de pérdida.
- Solo se cuantiza el componente transformer; es obligatorio mantener el repositorio original como modelo base para obtener la configuración del pipeline.
- Los ficheros dependen de key maps específicos de ComfyUI y ComfyUI-GGUF; un componente sin key map provoca error de carga.
- La licencia no está declarada en el repositorio; la model card remite a la licencia del modelo fuente, por lo que el uso comercial queda sujeto a las condiciones de Lightricks/LTX-Video.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de esta cuantización.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria documentada.
- Fechas de creación y actualización del repositorio (2026) posteriores a la fecha habitual de referencia; conviene verificar su vigencia antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/LTX-Video-quants
- Modelo base: https://huggingface.co/Lightricks/LTX-Video
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
