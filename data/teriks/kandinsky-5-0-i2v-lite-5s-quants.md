# Teriks/Kandinsky-5.0-I2V-Lite-5s-quants

## Resumen

Kandinsky-5.0-I2V-Lite-5s-quants es una colección de cuantizaciones del modelo de generación de vídeo a partir de imagen (image-to-video) `kandinskylab/Kandinsky-5.0-I2V-Lite-5s-Diffusers`, publicada por el usuario Teriks. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución de pesos cuantizados del transformer del modelo original, generada con la herramienta `dgenerate` 6.0.0. El objetivo es reducir los requisitos de memoria y facilitar el despliegue del modelo base en entornos con VRAM limitada, como ComfyUI o `llama.cpp`.

El componente cuantizado es el transformer (`Kandinsky5Transformer3DModel`) del pipeline `Kandinsky5I2VPipeline`, que constituye el núcleo generativo del sistema. El modelo base está orientado a la síntesis de vídeo de 5 segundos a partir de una imagen de entrada, una tarea computacionalmente intensiva que se beneficia directamente de la reducción de precisión en los pesos.

La relevancia de este repositorio es práctica: ofrece 12 formatos GGUF (desde Q2_K hasta IQ4_XS) y dos variantes en safetensors (float8_e4m3fn e int8_tensorwise) con nomenclatura compatible con ComfyUI, lo que permite elegir el equilibrio entre calidad y consumo de memoria según el hardware disponible. El repositorio ocupa 19,4 GB y el transformer original cuenta con 2.007.702.848 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D (`Kandinsky5Transformer3DModel`) dentro del pipeline `Kandinsky5I2VPipeline` |
| Parametros totales | 2.007.702.848 (transformer) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que se aplica la licencia del modelo fuente) |
| Formato de pesos | GGUF y safetensors (ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: cuantiza los pesos del transformer del modelo base `kandinskylab/Kandinsky-5.0-I2V-Lite-5s-Diffusers`. El componente cuantizado es `Kandinsky5Transformer3DModel`, un transformer tridimensional que procesa las representaciones latentes espacio-temporales del pipeline de difusión `Kandinsky5I2VPipeline` para la tarea de image-to-video. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original.

La innovación técnica de este repositorio es el proceso de cuantización realizado con `dgenerate` 6.0.0, que genera 12 variantes GGUF y dos variantes safetensors. Los archivos con el sufijo `-comfy` emplean la nomenclatura de tensores de ComfyUI, mientras que los sufijos `-llama` (no presentes en la lista de archivos publicada) usarían la de `llama.cpp`; el resto conserva los nombres originales del componente. La cuantización se aplica únicamente al subdirectorio `transformer`, por lo que el resto de componentes del pipeline (VAE, text encoder, scheduler) deben tomarse del repositorio original.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) mediante difusión, con clips de 5 segundos según el nombre del modelo base.
- El transformer cuantizado procesa las representaciones latentes del pipeline `Kandinsky5I2VPipeline`; no es un modelo de lenguaje y no genera texto.
- Compatibilidad con ComfyUI mediante los archivos safetensors con nomenclatura `-comfy` y los GGUF con nombres de tensor adaptados.
- Compatibilidad con `llama.cpp` mediante los archivos con nomenclatura `-llama` (mencionados en la model card, aunque no listados entre los archivos publicados).
- Integración con la herramienta `dgenerate` para flujos de cuantización y despliegue.
- No se dispone de información sobre soporte de tool calling, agentes, capacidades multilingües ni modos de razonamiento, por no ser un modelo de lenguaje.

## Casos de uso

- Generación de vídeo en ComfyUI con VRAM limitada: cargando el repositorio base como modelo y el archivo `transformer-float8_e4m3fn-comfy.safetensors` o `transformer-int8_tensorwise-comfy.safetensors` como componente transformer, se puede ejecutar el pipeline I2V reduciendo el consumo de memoria del transformer respecto a los pesos en bf16/fp16.
- Prototipado rápido en GPU de consumo: la variante `transformer-Q4_K.gguf` (1,1 GB) o `transformer-Q4_0.gguf` (1,1 GB) permite probar el pipeline en tarjetas con 8-12 GB de VRAM, a costa de cierta pérdida de calidad frente a Q8_0.
- Despliegue en entornos con restricciones de memoria extrema: `transformer-Q2_K.gguf` (638,8 MB) o `transformer-IQ4_XS.gguf` (1,0 GB) permiten ejecutar el transformer en configuraciones muy ajustadas, útil para pruebas de concepto o generación por lotes de baja fidelidad.
- Automatización de pipelines de vídeo con `dgenerate`: la herramienta que generó estas cuantizaciones puede orquestar la generación por lotes usando los archivos GGUF como componente, integrándose en scripts de producción.
- Evaluación comparativa de calidades de cuantización: al publicarse 12 formatos GGUF y dos safetensors, el repositorio sirve para medir el impacto de cada nivel de cuantización en la calidad del vídeo generado antes de fijar una configuración de producción.
- Distribución de demos y aplicaciones ligeras: los archivos de menor tamaño (Q2_K, IQ4_XS, IQ4_NL) facilitan empaquetar el modelo en contenedores o entornos con almacenamiento reducido, manteniendo el resto de componentes del pipeline desde el repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente 0,6-0,7 GB en Q2_K, 1,0-1,1 GB en IQ4_XS/IQ4_NL/Q4_0/Q4_K, 1,3-1,5 GB en Q5_x/Q6_K, 2,0 GB en Q8_0 y 1,9 GB en las variantes safetensors float8_e4m3fn e int8_tensorwise.
- El consumo total del pipeline es superior al del transformer, ya que hay que sumar VAE, text encoder y scheduler del repositorio original; no se dispone de cifras exactas en la información proporcionada.
- GPU recomendadas: no disponible de forma específica; por tamaño del transformer, cualquier GPU con 8 GB o más de VRAM debería poder alojar las variantes cuantizadas del transformer, aunque el pipeline completo puede requerir más.
- Cabe en GPU de consumo: sí, al menos el transformer en todas sus variantes; el pipeline completo depende de los demás componentes.
- Opciones de despliegue: ComfyUI (safetensors `-comfy` y GGUF con nombres adaptados), `llama.cpp` (archivos con nomenclatura `-llama`, mencionados pero no listados), `dgenerate` (herramienta de cuantización y ejecución).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Kandinsky-5.0-I2V-Lite-5s-quants | 2.007.702.848 | no disponible | GGUF (12 variantes) y safetensors (2 variantes) | no disponible (hereda la del modelo fuente) | Hugging Face, 0 descargas |
| kandinskylab/Kandinsky-5.0-I2V-Lite-5s-Diffusers | 2.007.702.848 | no disponible | safetensors (pesos originales) | no disponible | Hugging Face (modelo base) |
| Otras cuantizaciones de modelos I2V | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros modelos comparables de la misma categoría (image-to-video) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo: solo contiene el transformer cuantizado; es necesario descargar el repositorio base `kandinskylab/Kandinsky-5.0-I2V-Lite-5s-Diffusers` para obtener la configuración y el resto de componentes del pipeline.
- La cuantización introduce pérdida de calidad respecto a los pesos originales; los formatos de menor precisión (Q2_K, Q3_K) pueden degradar notablemente la fidelidad del vídeo generado.
- La licencia no está especificada en la información del repositorio; el autor indica que se aplica la licencia del modelo fuente, por lo que debe verificarse en `kandinskylab/Kandinsky-5.0-I2V-Lite-5s-Diffusers` antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad ni de que los archivos hayan sido probados en producción.
- Los archivos con nomenclatura `-llama` se mencionan en la model card pero no aparecen en la lista de archivos publicada, lo que puede afectar a la compatibilidad con `llama.cpp`.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, limitaciones idiomáticas ni restricciones de contenido del modelo base.
- El tamaño total del repositorio (19,4 GB) incluye todas las variantes; descargar el repositorio completo puede ser costoso en almacenamiento, por lo que conviene descargar solo los archivos necesarios.
- No hay datos publicados de benchmarks ni de rendimiento que permitan estimar la calidad objetiva de cada nivel de cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/Kandinsky-5.0-I2V-Lite-5s-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-I2V-Lite-5s-Diffusers
- Herramienta de cuantización dgenerate: https://github.com/Teriks/dgenerate
