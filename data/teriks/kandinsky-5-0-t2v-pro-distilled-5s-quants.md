# Teriks/Kandinsky-5.0-T2V-Pro-distilled-5s-quants

## Resumen

Teriks/Kandinsky-5.0-T2V-Pro-distilled-5s-quants es un conjunto de cuantizaciones del transformer del modelo de generacion de video texto-a-video Kandinsky 5.0 T2V Pro (variante destilada de 5 segundos), publicado originalmente por kandinskylab. No se trata de un modelo nuevo, sino de una redistribucion de pesos cuantizados del transformer (`Kandinsky5Transformer3DModel`) generada con la herramienta dgenerate 6.0.0, pensada para reducir los requisitos de memoria y facilitar el despliegue en entornos con GPU de menor capacidad.

El paquete incluye doce formatos GGUF (desde Q2_K hasta Q8_0, pasando por IQ4_NL e IQ4_XS) y dos variantes en safetensors para ComfyUI (float8_e4m3fn e int8_tensorwise). El transformer original tiene 19.311.325.248 parametros (aproximadamente 19,3 mil millones), lo que en precision completa supondria decenas de gigabytes; las cuantizaciones reducen el peso de los ficheros desde 5,9 GB (Q2_K) hasta 19,1 GB (Q8_0).

La relevancia de este repositorio radica en que permite ejecutar un modelo de generacion de video de gran tamano en hardware mas modesto, manteniendo el pipeline original (`Kandinsky5T2VPipeline`) y sustituyendo unicamente el componente transformer por el fichero cuantizado. Es un recurso practico para investigadores y desarrolladores que quieran experimentar con generacion de video texto-a-video sin disponer de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D (`Kandinsky5Transformer3DModel`), difusion texto-a-video |
| Parametros totales | 19.311.325.248 (aprox. 19,3 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS; safetensors ComfyUI: float8_e4m3fn, int8_tensorwise |
| Idiomas soportados | no disponible (el prompt de texto depende del codificador de texto del pipeline original) |
| Licencia | no disponible (el autor indica que se aplica la licencia del modelo fuente) |
| Formato de pesos | GGUF y safetensors (variantes `-comfy` con nombres de tensor de ComfyUI, `-llama` con nombres de llama.cpp, y nombres originales del componente) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer 3D de difusion para generacion de video a partir de texto, empaquetado en el pipeline `Kandinsky5T2VPipeline`. La variante "distilled-5s" indica que se trata de una version destilada que genera clips de 5 segundos, lo que reduce el numero de pasos de muestreo necesarios en comparacion con un modelo de difusion no destilado. El componente cuantizado es unicamente el transformer; el resto de componentes del pipeline (codificador de texto, VAE, scheduler) se toman del repositorio original.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion se realizo con dgenerate 6.0.0 mediante el subcomando `quantize`, especificando el subfolder `transformer` y los formatos `comfy`. Los ficheros GGUF emplean los esquemas de cuantizacion estandar de llama.cpp (bloques K-quant e I-quant), mientras que las variantes safetensors usan cuantizacion float8 e int8 por tensor para su uso directo en ComfyUI.

## Capacidades

- Generacion de video texto-a-video: produce clips de 5 segundos a partir de una descripcion textual, usando el pipeline de difusion original.
- Integracion con ComfyUI: las variantes `-comfy.safetensors` (float8_e4m3fn e int8_tensorwise) estan pensadas para cargarse directamente en flujos de ComfyUI.
- Compatibilidad con llama.cpp y dgenerate: los ficheros GGUF con nombres `-llama` y los nombres originales permiten su uso en herramientas basadas en llama.cpp y en dgenerate.
- Reduccion de memoria: los formatos de baja precision (Q2_K, Q3_K, IQ4_XS) permiten ejecutar el transformer en GPUs con menos VRAM.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking; es un modelo generativo de video, no un LLM conversacional.
- Capacidades multilingues: no disponibles en la informacion proporcionada; dependen del codificador de texto del pipeline original.

## Casos de uso

- Prototipado de generacion de video en estaciones de trabajo con una sola GPU: usando `transformer-Q4_K.gguf` (10,2 GB) o `transformer-IQ4_XS.gguf` (9,6 GB) se puede cargar el transformer en GPUs de 16-24 GB de VRAM junto con el resto del pipeline, lo que permite iterar sobre prompts sin infraestructura de cluster.
- Creacion de clips cortos para redes sociales o previsualizaciones: la variante destilada de 5 segundos esta pensada para generar clips breves, adecuados para pruebas de concepto, storyboards animados o contenido promocional de duracion corta.
- Flujos de trabajo en ComfyUI: cargando `transformer-float8_e4m3fn-comfy.safetensors` o `transformer-int8_tensorwise-comfy.safetensors` (18,0 GB cada uno) en un grafo de ComfyUI, se puede integrar la generacion de video en pipelines visuales con otros nodos de preprocesado y postprocesado.
- Investigacion sobre cuantizacion de modelos de difusion de video: el repositorio ofrece una matriz de doce formatos GGUF y dos safetensors sobre el mismo transformer, lo que permite comparar calidad visual y consumo de memoria entre esquemas de cuantizacion en condiciones controladas.
- Despliegue en entornos con VRAM limitada: con `transformer-Q2_K.gguf` (5,9 GB) o `transformer-Q3_K.gguf` (7,8 GB) se puede intentar ejecutar el transformer en GPUs de gama media, aceptando la perdida de calidad asociada a la cuantizacion agresiva.
- Automatizacion por linea de comandos con dgenerate: la herramienta que genero las cuantizaciones tambien permite ejecutar el pipeline, de modo que se pueden encadenar generaciones por lotes desde scripts para producir variaciones de un mismo prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer segun cuantizacion: Q2_K ~5,9 GB; Q3_K ~7,8 GB; IQ4_XS ~9,6 GB; Q4_0/Q4_K/IQ4_NL ~10,2 GB; Q4_1 ~11,3 GB; Q5_0/Q5_K ~12,4 GB; Q5_1 ~13,5 GB; Q6_K ~14,8 GB; Q8_0 ~19,1 GB; float8_e4m3fn e int8_tensorwise ~18,0 GB. A estas cifras hay que sumar la memoria del codificador de texto, el VAE y las activaciones durante la inferencia.
- GPU recomendadas: para las variantes de 18-19 GB (Q8_0, float8, int8) se recomienda una A100 40/80 GB, H100 o RTX 4090 24 GB con margen ajustado; para Q4_K/IQ4_XS, una RTX 4090, RTX 4080 o A6000; para Q2_K/Q3_K, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizaciones Q4-Q6, y en GPUs de 12-16 GB con Q2_K/Q3_K, siempre que el resto del pipeline quepa en la misma GPU o se descargue a CPU.
- Opciones de despliegue: ComfyUI (safetensors `-comfy`), llama.cpp (GGUF con nombres `-llama`), dgenerate (GGUF y safetensors) y el pipeline `Kandinsky5T2VPipeline` de Diffusers sustituyendo el transformer por el fichero cuantizado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Kandinsky-5.0-T2V-Pro-distilled-5s-quants | 19,3 mil millones (transformer) | clips de 5 s | GGUF (12 variantes) y safetensors ComfyUI | no disponible (hereda la del modelo fuente) | Hugging Face, 243 descargas |
| kandinskylab/Kandinsky-5.0-T2V-Pro-distilled-5s-Diffusers (original) | 19,3 mil millones (transformer) | clips de 5 s | safetensors en precision original | no disponible | Hugging Face |
| Otros modelos texto-a-video de la familia Kandinsky 5.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad respecto a los pesos originales; los formatos Q2_K y Q3_K son especialmente agresivos y pueden degradar la coherencia temporal y el detalle visual del video generado.
- El repositorio solo contiene el transformer cuantizado; es imprescindible descargar el resto de componentes del modelo base `kandinskylab/Kandinsky-5.0-T2V-Pro-distilled-5s-Diffusers` para ejecutar el pipeline.
- La licencia no esta indicada en la model card; el autor remite a la licencia del modelo fuente, por lo que debe verificarse antes de cualquier uso comercial.
- No se documentan sesgos conocidos, pero al ser un modelo de difusion texto-a-video hereda los sesgos de sus datos de entrenamiento, no disponibles en esta ficha.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir contenido incoherente o no fiel al prompt, especialmente con cuantizaciones de baja precision.
- Los clips generados son de 5 segundos; no se documenta soporte para duraciones mayores en esta variante.
- No hay informacion sobre idiomas soportados por el codificador de texto ni sobre el comportamiento con prompts en castellano.
- El numero de descargas (243) y la ausencia de likes sugieren un uso limitado; no hay evidencia de validacion comunitaria extensa de la calidad de estas cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Teriks/Kandinsky-5.0-T2V-Pro-distilled-5s-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-T2V-Pro-distilled-5s-Diffusers
- Herramienta de cuantizacion dgenerate: https://github.com/Teriks/dgenerate
