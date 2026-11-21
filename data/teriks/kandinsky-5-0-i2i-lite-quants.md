# Teriks/Kandinsky-5.0-I2I-Lite-quants

## Resumen

Teriks/Kandinsky-5.0-I2I-Lite-quants es un repositorio de cuantizaciones del transformer del modelo Kandinsky 5.0 I2I Lite, un modelo de difusion para generacion de imagenes a partir de imagen (image-to-image). El autor original del modelo base es kandinskylab, y este repositorio lo mantiene Teriks, generado con la herramienta dgenerate 6.0.0. No es un modelo nuevo entrenado desde cero, sino un conjunto de pesos cuantizados del transformer (componente `Kandinsky5Transformer3DModel`) del modelo base `kandinskylab/Kandinsky-5.0-I2I-Lite-sft-Diffusers`.

El repositorio resuelve el problema practico de ejecutar un modelo de difusion de aproximadamente 6.022 millones de parametros en hardware con VRAM limitada, ofreciendo 12 formatos GGUF (desde Q2_K hasta IQ4_XS) y dos variantes safetensors para ComfyUI (float8_e4m3fn e int8_tensorwise). Los tamanos oscilan entre 1.9 GB para Q2_K y 6.0 GB para Q8_0, lo que permite desplegar el modelo en GPUs de consumo.

Es relevante ahora porque el ecosistema de difusion open source esta migrando hacia cuantizaciones GGUF y formatos de bajo precision para ComfyUI, y este repositorio proporciona opciones listas para integrarse en flujos de trabajo existentes sin necesidad de reentrenar ni convertir manualmente los pesos. El repositorio ocupa 58.1 GB en total y fue creado el 21 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Kandinsky5Transformer3DModel), componente de un pipeline `Kandinsky5T2IPipeline` |
| Parametros totales | 6.022.254.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors ComfyUI: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la licencia del modelo fuente aplica a estos pesos) |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo base es un pipeline de difusion `Kandinsky5T2IPipeline` cuyo componente principal es un transformer 3D (`Kandinsky5Transformer3DModel`) con 6.022 millones de parametros. Este repositorio no entrena ningun modelo: solo cuantiza el transformer del modelo base `kandinskylab/Kandinsky-5.0-I2I-Lite-sft-Diffusers`, que ha sido ajustado con SFT (supervised fine-tuning) segun indica el nombre del checkpoint.

La innovacion tecnica del repositorio es la cuantizacion realizada con dgenerate 6.0.0, que produce 12 formatos GGUF con nombres de tensor compatibles con llama.cpp y con ComfyUI (sufijos `-llama` y `-comfy`), ademas de dos variantes safetensors para ComfyUI. Los archivos mantienen los nombres de tensor originales del componente cuando no llevan sufijo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de imagenes a partir de una imagen de entrada (image-to-image) mediante difusion.
- Pipeline `Kandinsky5T2IPipeline`, lo que sugiere soporte tambien de text-to-image en el modelo base.
- Cuantizaciones GGUF compatibles con llama.cpp y con ComfyUI mediante los sufijos de nombres de tensor.
- Variantes safetensors float8_e4m3fn e int8_tensorwise listas para ComfyUI.
- No se dispone de informacion sobre tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos especiales como thinking o vision (el modelo es de generacion de imagen, no de lenguaje).

## Casos de uso

- Edicion de imagenes en local con ComfyUI: cargar los safetensors `float8_e4m3fn-comfy` o `int8_tensorwise-comfy` como componente transformer del pipeline y aplicar transformaciones image-to-image sobre imagenes del usuario con VRAM reducida.
- Despliegue en GPUs de consumo: usar `transformer-Q4_K.gguf` (3.2 GB) o `transformer-IQ4_XS.gguf` (3.0 GB) para ejecutar el modelo en tarjetas con 8-12 GB de VRAM, manteniendo el repositorio original como fuente de configuracion.
- Prototipado rapido con llama.cpp: emplear los GGUF con nombres de tensor `-llama` para integrar el transformer en herramientas basadas en llama.cpp sin reescribir los pesos.
- Pipelines de generacion por lotes: elegir `Q8_0` (6.0 GB) cuando se prioriza fidelidad sobre memoria, o `Q2_K` (1.9 GB) cuando el throughput y el espacio son criticos.
- Investigacion sobre impacto de la cuantizacion: comparar los 12 niveles GGUF y las dos variantes safetensors sobre el mismo modelo base para medir la degradacion de calidad en tareas image-to-image.
- Integracion en flujos de trabajo de dgenerate: usar el comando documentado (`dgenerate --sub-command quantize ...`) como referencia para reproducir o extender las cuantizaciones con otros subconjuntos o formatos.
- Distribucion de modelos ligeros: empaquetar la variante `Q4_0` o `Q4_K` (3.2 GB) en aplicaciones de escritorio o contenedores donde el modelo completo no cabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo transformer, segun cuantizacion): aproximadamente 2-3 GB para Q2_K (1.9 GB de pesos), 3-4 GB para Q4_K e IQ4_XS (3.0-3.2 GB), 4-5 GB para Q6_K (4.6 GB) y 6-7 GB para Q8_0 (6.0 GB), sin contar el resto de componentes del pipeline de difusion.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano de pesos, cualquier GPU con 8 GB o mas de VRAM puede alojar las variantes Q4 y Q5, y las variantes Q8_0 o float8 requieren al menos 8-10 GB.
- Cabe en GPU de consumo: si, las variantes Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, IQ4_NL e IQ4_XS (1.9-3.2 GB) caben en GPUs consumer de 8 GB; las variantes Q6_K y Q8_0 (4.6-6.0 GB) requieren 12 GB o mas.
- Opciones de despliegue: llama.cpp (GGUF con nombres `-llama`), ComfyUI (safetensors `-comfy` y GGUF), dgenerate 6.0.0. No se mencionan vLLM ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Kandinsky-5.0-I2I-Lite-quants | 6.022 M (transformer) | no disponible | GGUF (12) + safetensors (2) | no disponible | Hugging Face |
| kandinskylab/Kandinsky-5.0-I2I-Lite-sft-Diffusers | 6.022 M (transformer) | no disponible | safetensors (original) | no disponible | Hugging Face |
| Alternativas de difusion image-to-image | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo contiene el transformer cuantizado; es necesario mantener el repositorio original `kandinskylab/Kandinsky-5.0-I2I-Lite-sft-Diffusers` como modelo y pasar el archivo de cuantizacion con la opcion de componente correspondiente, ya que la configuracion proviene del repositorio.
- La licencia no esta indicada en la model card; aplica la licencia del modelo fuente, que no se especifica. Verificar antes de uso comercial.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar la calidad de la imagen generada; no se han publicado metricas de degradacion.
- El repositorio incluye archivos de ejecuciones anteriores de cuantizacion; la lista de archivos no distingue cuales son de la ultima ejecucion.
- Los nombres de tensor difieren segun el sufijo (`-comfy`, `-llama` o sin sufijo); usar el archivo adecuado para cada herramienta o fallara la carga.
- No hay informacion sobre sesgos, alucinaciones, limitaciones de idioma ni caveats de produccion especificos del modelo base.
- El modelo es de generacion de imagen, no de texto; no debe evaluarse con benchmarks de lenguaje como MMLU o HumanEval.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/Kandinsky-5.0-I2I-Lite-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-I2I-Lite-sft-Diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
