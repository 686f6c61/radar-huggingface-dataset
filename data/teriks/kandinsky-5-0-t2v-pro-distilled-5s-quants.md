# Teriks/Kandinsky-5.0-T2V-Pro-distilled-5s-quants

## Resumen

Kandinsky-5.0-T2V-Pro-distilled-5s-quants es un conjunto de cuantizaciones GGUF del transformador del modelo de generacion de video texto-a-video Kandinsky 5.0 T2V Pro (variante destilada, clips de 5 segundos), publicado por el usuario Teriks. No se trata de un modelo nuevo ni de un entrenamiento propio, sino de una redistribucion en 12 formatos GGUF (desde Q2_K hasta IQ4_XS) del componente `transformer` (`Kandinsky5Transformer3DModel`) del repositorio original `kandinskylab/Kandinsky-5.0-T2V-Pro-distilled-5s-Diffusers`. El objetivo es permitir la ejecucion del modelo en hardware con menos VRAM mediante la herramienta `dgenerate` 6.0.0, que genera y consume estas cuantizaciones.

El modelo base es un difusor texto-a-video de la familia Kandinsky, con un transformador 3D de aproximadamente 19.300 millones de parametros (19.311.325.248 segun los safetensors del modelo original). La variante "distilled" implica un proceso de destilacion que reduce el numero de pasos de inferencia necesarios, y "5s" indica que genera clips de 5 segundos. Este repositorio concreto solo contiene los pesos cuantizados del transformador, no el pipeline completo (VAE, text encoder, scheduler), que debe tomarse del repositorio original.

La relevancia de esta publicacion es practica: un transformador de ~19,3B parametros en precision completa ocupa decenas de GB y no cabe en GPUs de consumo; las cuantizaciones Q4_K o IQ4_XS lo reducen a unos 10 GB, haciendolo viable en tarjetas de 12-16 GB. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia no esta declarada en la ficha (se remite a la del modelo fuente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D para difusion texto-a-video (`Kandinsky5Transformer3DModel`) |
| Parametros totales | 19.311.325.248 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-video; no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_0, Q4_1, Q4_K, Q5_0, Q5_1, Q5_K, Q6_K, Q8_0, IQ4_NL, IQ4_XS (GGUF) |
| Idiomas soportados | no disponible (el prompt de texto depende del text encoder del pipeline original) |
| Licencia | no disponible en la ficha; se aplica la del modelo fuente `kandinskylab/Kandinsky-5.0-T2V-Pro-distilled-5s-Diffusers` |
| Formato de pesos | GGUF (solo el componente `transformer`) |

## Arquitectura y entrenamiento

El modelo subyacente es un difusor texto-a-video cuyo nucleo es un transformador 3D (`Kandinsky5Transformer3DModel`) que opera sobre latentes temporales y espaciales. La variante "distilled" del modelo original reduce el numero de pasos de muestreo respecto a la version no destilada, y la designacion "5s" fija la duracion del clip generado en 5 segundos. El pipeline asociado es `Kandinsky5T2VPipeline`, que combina el transformador con un VAE y un text encoder externos al repositorio de cuantizaciones.

Este repositorio no aporta informacion sobre el entrenamiento del modelo base: no se detalla el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o tecnicas de alineacion. Tampoco se describe ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, etc.) en la model card proporcionada. La unica informacion tecnica disponible es el proceso de cuantizacion: los pesos se generaron con `dgenerate` 6.0.0 mediante el subcomando `quantize`, aplicado al subfolder `transformer`, preservando los nombres de tensor originales del componente.

## Capacidades

- Generacion de video a partir de prompts de texto (texto-a-video), con clips de 5 segundos en la variante destilada.
- Inferencia con menor numero de pasos de difusion gracias a la destilacion del modelo base.
- Ejecucion con cuantizacion GGUF en 12 formatos, lo que permite ajustar el equilibrio entre calidad y consumo de VRAM.
- Integracion con la herramienta `dgenerate` para carga de cuantizaciones junto con la configuracion del repositorio original.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking"; no aplica a un modelo de generacion de video.
- Capacidades multilingues del prompt: no disponible (dependen del text encoder del pipeline original, no incluido en este repositorio).

## Casos de uso

- Prototipado de video generativo en GPU de consumo: usando `transformer-Q4_K.gguf` (10,2 GB) o `transformer-IQ4_XS.gguf` (9,6 GB) se puede ejecutar el transformador en GPUs de 12-16 GB, permitiendo experimentar con texto-a-video sin acceso a clusters.
- Generacion de clips cortos para redes sociales: la variante de 5 segundos encaja en la produccion de teasers, banners animados o clips promocionales de duracion fija.
- Iteracion rapida en pipelines creativos: al ser un modelo destilado, requiere menos pasos de muestreo, lo que reduce el tiempo por generacion en flujos de prueba y error de prompts.
- Despliegue en estaciones de trabajo con VRAM limitada: las cuantizaciones Q2_K (5,9 GB) o Q3_K (7,8 GB) permiten correr el transformador en GPUs de 8 GB, a costa de perdida de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 formatos del mismo componente, util para medir la degradacion de calidad frente al ahorro de memoria en un caso de video generativo.
- Integracion en herramientas de automatizacion de contenido: mediante `dgenerate` se puede orquestar la generacion de clips por lotes a partir de listas de prompts, usando el formato Q8_0 (19,1 GB) cuando se dispone de VRAM suficiente para maxima fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el transformador segun cuantizacion: Q2_K ~5,9 GB; Q3_K ~7,8 GB; IQ4_XS ~9,6 GB; IQ4_NL / Q4_0 / Q4_K ~10,2 GB; Q4_1 ~11,3 GB; Q5_0 / Q5_K ~12,4 GB; Q5_1 ~13,5 GB; Q6_K ~14,8 GB; Q8_0 ~19,1 GB. A esta cifra hay que sumar la memoria del VAE, el text encoder y las activaciones del pipeline, no incluidos en este repositorio.
- GPU recomendadas: para Q8_0, GPUs de 24 GB o mas (RTX 3090/4090, A100, H100); para Q4_K/IQ4_XS, GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB, A4000); para Q2_K/Q3_K, GPUs de 8-12 GB.
- Cabe en GPU de consumo: si, en funcion del formato; Q4_K e inferiores son viables en tarjetas de 12-16 GB, y Q2_K/Q3_K en tarjetas de 8 GB, asumiendo el coste adicional del resto del pipeline.
- Opciones de despliegue: `dgenerate` 6.0.0 (herramienta con la que se generaron las cuantizaciones y que documenta el uso de estos GGUF); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a difusores de video.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (transformador) | Contexto / duracion | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teriks/Kandinsky-5.0-T2V-Pro-distilled-5s-quants | ~19,3B | clips de 5 s | 12 formatos GGUF | la del modelo fuente (no declarada aqui) | Hugging Face, 0 descargas |
| kandinskylab/Kandinsky-5.0-T2V-Pro-distilled-5s-Diffusers (modelo base) | ~19,3B | clips de 5 s | pesos completos (safetensors) | no disponible | Hugging Face |
| Otras cuantizaciones GGUF de difusores de video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene unicamente el transformador cuantizado; es imprescindible descargar el pipeline completo (VAE, text encoder, scheduler, configuracion) del modelo base `kandinskylab/Kandinsky-5.0-T2V-Pro-distilled-5s-Diffusers`.
- La licencia no esta declarada en la ficha; el autor remite a la licencia del modelo fuente, por lo que el uso comercial queda condicionado a lo que establezca dicho repositorio original.
- Las cuantizaciones agresivas (Q2_K, Q3_K, IQ4_XS) degradan la calidad del video generado; no se han publicado evaluaciones cuantitativas de esa perdida.
- Riesgo de artefactos, incoherencias temporales y alucinaciones visuales inherente a los difusores de video; no se documenta mitigacion especifica.
- Sesgos conocidos: no disponibles; dependen del dataset de entrenamiento del modelo base, no descrito en esta ficha.
- Duracion fija de 5 segundos por clip; no se documenta soporte para clips mas largos.
- Idiomas del prompt no disponibles; dependen del text encoder del pipeline original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad.
- Tamano total del repositorio de 147,5 GB, lo que implica descargar solo el archivo GGUF del formato deseado y no el repositorio completo.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Teriks/Kandinsky-5.0-T2V-Pro-distilled-5s-quants
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-5.0-T2V-Pro-distilled-5s-Diffusers
- Herramienta dgenerate: https://github.com/Teriks/dgenerate
