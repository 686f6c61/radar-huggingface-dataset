# Teriks/Kandinsky-5.0-I2V-Pro-sft-5s-quants

## Resumen

Teriks/Kandinsky-5.0-I2V-Pro-sft-5s-quants es un conjunto de cuantizaciones GGUF del transformer del modelo de generacion de video imagen-a-video Kandinsky 5.0 I2V Pro, publicado por el desarrollador Teriks (autor de la herramienta dgenerate) a partir del modelo original kandinskylab/Kandinsky-5.0-I2V-Pro-sft-5s-Diffusers. No es un modelo de lenguaje ni un modelo entrenado desde cero: es una redistribucion de pesos cuantizados del componente `transformer` (clase `Kandinsky5Transformer3DModel`) del pipeline `Kandinsky5I2VPipeline`, pensada para reducir los requisitos de memoria en inferencia.

El repositorio incluye 12 variantes de cuantizacion GGUF que van desde Q2_K (5,9 GB) hasta Q8_0 (19,1 GB), pasando por formatos K-quant, legacy y IQ. El modelo original cuenta con 19.311.325.248 parametros (aproximadamente 19,3 mil millones) en el transformer, lo que situa a este modelo en la categoria de difusion de gran tamano para generacion de video.

Su relevancia practica es que permite ejecutar el transformer de Kandinsky 5.0 I2V Pro en hardware con VRAM limitada, manteniendo el resto de componentes del pipeline (VAE, text encoder, scheduler) en el repositorio original. La herramienta que genero estas cuantizaciones es dgenerate 6.0.0, y el autor indica que la licencia del modelo fuente se aplica a estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D (`Kandinsky5Transformer3DModel`), pipeline `Kandinsky5I2VPipeline` |
| Parametros totales | 19.311.325.248 (transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se aplica la licencia del modelo fuente) |
| Formato de pesos | GGUF (12 ficheros, uno por formato) |

## Arquitectura y entrenamiento

El componente cuantizado es un transformer de difusion tridimensional (`Kandinsky5Transformer3DModel`) que forma parte del pipeline de generacion de video imagen-a-video `Kandinsky5I2VPipeline`. La variante "sft-5s" del nombre indica que el modelo fuente esta ajustado para generar clips de 5 segundos. El repositorio no documenta la arquitectura interna del transformer (numero de bloques, dimensiones ocultas, mecanismo de atencion, uso de atencion 3D, etc.), por lo que esos detalles deben consultarse en el repositorio del modelo base.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o frames vistos, ni sobre el proceso de ajuste (SFT, RLHF, DPO). Teriks no entreno el modelo: solo aplico cuantizacion post-entrenamiento con dgenerate 6.0.0 sobre los pesos safetensors del modelo original, generando 12 variantes GGUF. La innovacion tecnica de este repositorio es exclusivamente la disponibilidad de formatos GGUF para el transformer, lo que permite cargar el componente con opciones de cuantizacion en lugar de los pesos en precision completa o bf16.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video) mediante el pipeline `Kandinsky5I2VPipeline`.
- Generacion de clips de 5 segundos (variante `sft-5s`).
- Cuantizacion en 12 formatos GGUF, lo que permite ajustar el equilibrio entre calidad y VRAM.
- Carga del transformer cuantizado manteniendo el resto de componentes (VAE, text encoder, scheduler) desde el repositorio original.
- Integracion con la herramienta dgenerate para el sub-comando `quantize` y para inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues: no aplicables (no es un modelo de texto); no disponible informacion sobre el text encoder asociado.
- No dispone de modo thinking, vision general ni audio; su unica modalidad de salida es video.

## Casos de uso

- Prototipado de imagen-a-video en estaciones de trabajo con GPU consumer: usar `transformer-Q4_K.gguf` (10,2 GB) o `transformer-IQ4_XS.gguf` (9,6 GB) permite cargar el transformer en GPUs de 16-24 GB de VRAM manteniendo el resto del pipeline en el repositorio original.
- Generacion de clips de 5 segundos para redes sociales o previsualizaciones: la variante `sft-5s` esta ajustada especificamente para esa duracion, lo que encaja en flujos de creacion de contenido corto.
- Evaluacion comparativa de cuantizaciones: al ofrecer 12 formatos, permite medir la degradacion de calidad visual frente a VRAM y velocidad en un mismo pipeline, util para investigacion sobre cuantizacion de modelos de difusion de video.
- Despliegue en servidores con VRAM limitada usando `Q2_K` (5,9 GB) o `Q3_K` (7,8 GB): util para entornos donde prima el ahorro de memoria sobre la fidelidad visual, como demos publicas o pruebas de concepto.
- Integracion en pipelines automatizados de generacion de video por lotes con dgenerate: el sub-comando `quantize` y las opciones de componente permiten scriptear la carga del GGUF y la generacion de clips.
- Investigacion sobre el impacto de la cuantizacion en la coherencia temporal de video: comparar Q8_0 (19,1 GB) con IQ4_XS (9,6 GB) sobre el mismo prompt e imagen de entrada permite aislar el efecto de la precision numerica.
- Fine-tuning o experimentacion sobre el transformer cuantizado en entornos con recursos limitados, usando el GGUF como punto de partida y el repositorio original como referencia de configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformer segun cuantizacion (solo pesos, sin overhead de activaciones ni del resto del pipeline): Q2_K ~5,9 GB; Q3_K ~7,8 GB; IQ4_XS ~9,6 GB; Q4_0/Q4_K/IQ4_NL ~10,2 GB; Q4_1 ~11,3 GB; Q5_0/Q5_K ~12,4 GB; Q5_1 ~13,5 GB; Q6_K ~14,8 GB; Q8_0 ~19,1 GB.
- A la VRAM de los pesos hay que sumar la del VAE, el text encoder, el scheduler y las activaciones intermedias durante la difusion, que no estan cuantizados en este repositorio y deben cargarse desde el modelo base.
- GPU recomendadas: no disponible informacion especifica del autor. Por tamano de pesos, Q8_0 (19,1 GB) requiere GPUs de 24 GB o mas (RTX 3090/4090, A100 40 GB, H100); Q4_K e IQ4_XS caben en GPUs de 16-24 GB; Q2_K y Q3_K podrian caber en GPUs de 12-16 GB, siempre que el resto del pipeline quepa junto con las activaciones.
- Cabe en GPU consumer: si, en funcion del formato (Q2_K a Q6_K en RTX 3090/4090 de 24 GB; Q4_K/IQ4_XS en GPUs de 16 GB con margen ajustado).
- Opciones de despliegue: dgenerate (herramienta del autor, con soporte de GGUF para el componente transformer) y el pipeline `Kandinsky5I2VPipeline` de Diffusers cargando el GGUF como componente. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a pipelines de difusion de video.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto / duracion | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Kandinsky-5.0-I2V-Pro-sft-5s-quants | 19,3 B | clips de 5 s (variante sft-5s) | GGUF (12 variantes) | la del modelo fuente (no disponible) | Hugging Face |
| kandinskylab/Kandinsky-5.0-I2V-Pro-sft-5s-Diffusers (modelo base) | 19,3 B | clips de 5 s | safetensors (Diffusers) | no disponible | Hugging Face |
| Otras cuantizaciones GGUF de modelos I2V de la misma familia | no disponible | no disponible | GGUF | no disponible | no disponible |

La comparativa con alternativas de otros laboratorios (por ejemplo, modelos I2V de otras familias) no esta disponible en la informacion proporcionada; no se inventan datos.

## Limitaciones y advertencias

- Solo se cuantiza el componente `transformer`; el VAE, el text encoder y el scheduler deben cargarse desde el repositorio original, lo que anade VRAM y dependencias.
- Las cuantizaciones agresivas (Q2_K, Q3_K) degradan la calidad visual y la coherencia temporal del video generado; no se han publicado metricas de esa degradacion.
- La licencia del modelo fuente no esta disponible en la informacion proporcionada; el autor indica que se aplica la licencia del modelo original, por lo que es imprescindible revisar dicha licencia antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria documentada.
- Riesgo de alucinacion visual: como todo modelo generativo de video, puede producir artefactos, incoherencias temporales y contenido no fiel a la imagen de entrada.
- Sesgos conocidos: no documentados en la informacion disponible; dependen del dataset de entrenamiento del modelo base.
- Limitaciones de idioma: no aplicables directamente (no es un modelo de texto), pero el text encoder asociado puede condicionar el rendimiento en idiomas distintos del ingles.
- El modelo esta ajustado para clips de 5 segundos; no se documenta su comportamiento con duraciones distintas.
- No apto para tool calling, agentes ni tareas de razonamiento textual: es exclusivamente un componente de generacion de video.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Teriks/Kandinsky-5.0-I2V-Pro-sft-5s-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-I2V-Pro-sft-5s-Diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
- Paper, blog o demo oficial de Kandinsky 5.0: no disponible en la informacion proporcionada.
