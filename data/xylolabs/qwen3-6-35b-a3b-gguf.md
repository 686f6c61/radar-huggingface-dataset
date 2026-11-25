# Xylolabs/Qwen3.6-35B-A3B-GGUF

## Resumen

Qwen3.6-35B-A3B-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo de texto Qwen3.6-35B-A3B, publicada por Xylolabs bajo licencia Apache 2.0. El modelo base lo desarrolla el equipo Qwen de Alibaba y sigue una arquitectura de mezcla de expertos (MoE) con 34.660.610.688 parametros totales, de los cuales solo una fraccion se activa por token (el sufijo A3B indica aproximadamente 3.000 millones de parametros activos). Esta ficha describe la version cuantizada, pensada para inferencia local con llama.cpp.

El interes de esta publicacion reside en que ofrece un rango amplio de cuantizaciones, desde IQ2_M (11,523 GB) hasta Q8_0 (36,903 GB), con matrices de importancia (imatrix) propias generadas a partir de chat, razonamiento, prosa, codigo y texto en coreano. Ademas, incluye mediciones de divergencia KL y de coincidencia top-1 frente al modelo BF16, lo que permite elegir el nivel de compresion con datos objetivos de degradacion.

Al tratarse de una cuantizacion, no anade capacidades nuevas al modelo base: hereda sus caracteristicas y sus limitaciones. La model card indica soporte de ingles y coreano, y los archivos no incluyen la capa MTP ni el codificador de vision, por lo que esta version esta orientada exclusivamente a generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, segun el modelo base Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones (indicado por el sufijo A3B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ2_M, Q2_K, IQ3_XXS, Q3_K_M, IQ4_XS-Q8_0, Q4_K-Q8_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos, en la que cada token activa solo un subconjunto de los parametros totales. Con 34,66 mil millones de parametros almacenados y unos 3.000 millones activos por token, el modelo busca un equilibrio entre capacidad y coste computacional por paso de inferencia. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta publicacion es una cuantizacion, no un reentrenamiento. Xylolabs ha generado matrices de importancia propias a partir de texto de chat, razonamiento, prosa, codigo y coreano; para las variantes Q4_K_M, Q6_K, Q5_K_M, Q3_K_M, IQ3_XXS, Q2_K e IQ2_M la matriz incorpora ademas Wikipedia en coreano y codigo, mientras que Q8_0 no usa imatrix. Los tipos por tensor de Q6_K, Q5_K_M, Q3_K_M, IQ3_XXS, Q2_K e IQ2_M replican los de los archivos UD correspondientes de Unsloth, leidos de sus cabeceras. En Q4_K_M la puerta y la proyeccion up de los expertos usan Q4_K, la down usa Q5_K (Q6_K en las capas 34, 38 y 39), y el embedding de tokens y otros tensores no expertos usan Q8_0. Ningun archivo incluye la capa MTP.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Razonamiento y prosa general, ya que las imatrix se construyeron con datos de razonamiento y texto sin formato.
- Generacion de codigo, dado que las imatrix incluyen texto de codigo.
- Soporte de los dos idiomas declarados: ingles y coreano.
- Compatibilidad con endpoints, segun la etiqueta "endpoints_compatible".
- Ejecucion mediante llama.cpp con plantilla de chat Jinja (`--jinja`).
- No incluye vision: la model card indica que el codificador de vision y el proyector se omiten.
- No incluye la capa MTP (multi-token prediction).
- Tool calling, function calling y comportamiento agentico: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (22,123 GB) el modelo cabe en GPUs de consumo con 24 GB de VRAM, lo que permite ejecutar un MoE de 34,66 mil millones de parametros sin infraestructura de servidor.
- Asistentes conversacionales en ingles o coreano: la etiqueta conversacional y las imatrix construidas con datos de chat lo hacen adecuado para dialogos multi-turno en estos dos idiomas.
- Generacion de codigo en local: las imatrix incluyen texto de codigo, de modo que las cuantizaciones medias conservan mejor el comportamiento en tareas de programacion que una cuantizacion generica.
- Escenarios con memoria muy limitada: la variante IQ2_M (11,523 GB) permite ejecutar el modelo en equipos con 12-16 GB de VRAM, aceptando la perdida de calidad medida (KL de 0,134445 en WikiText-2 y 84,667 % de coincidencia top-1).
- Evaluacion y experimentacion en investigacion: la tabla de divergencia KL y coincidencia top-1 frente a BF16 permite seleccionar la cuantizacion segun el presupuesto de memoria y la tolerancia a la degradacion, sin necesidad de medir manualmente.
- Servicio de inferencia en CPU o configuraciones hibridas: al estar en formato GGUF y ser compatible con llama.cpp, puede desplegarse en servidores sin GPU para cargas de baja concurrencia.
- Procesamiento de texto en coreano: la inclusion de Wikipedia en coreano en varias imatrix busca preservar el rendimiento en ese idioma en las cuantizaciones mas agresivas.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). Lo que si proporciona son metricas de fidelidad de la cuantizacion frente al modelo BF16, medidas con llama.cpp: divergencia KL media (menor es mejor) y coincidencia top-1. Se muestran los valores para WikiText-2, chat y un conjunto reservado (held-out).

| Cuantizacion | Tamano | KL WikiText-2 | top-1 WikiText-2 | KL chat | top-1 chat | KL held-out | top-1 held-out |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 36,903 GB | 0,005337 | 97,098 % | 0,008858 | 97,510 % | 0,008898 | 96,853 % |
| Q6_K | 29,308 GB | 0,006321 | 96,799 % | 0,007997 | 97,235 % | 0,010514 | 96,706 % |
| Q5_K_M | 26,456 GB | 0,007206 | 96,627 % | 0,011832 | 96,990 % | 0,012993 | 96,010 % |
| Q4_K_M | 22,123 GB | 0,012551 | 95,176 % | 0,015006 | 96,284 % | 0,020796 | 95,157 % |
| Q4_K-Q8_0 | 20,543 GB | 0,015488 | 94,775 % | 0,020343 | 95,657 % | 0,027959 | 94,529 % |
| IQ4_XS-Q8_0 | 19,536 GB | 0,017360 | 94,485 % | 0,025865 | 95,392 % | 0,029922 | 93,892 % |
| Q3_K_M | 16,846 GB | 0,040602 | 91,436 % | 0,050130 | 92,804 % | 0,066743 | 90,618 % |
| IQ3_XXS | 13,211 GB | 0,083193 | 87,853 % | 0,117544 | 89,608 % | 0,136249 | 86,961 % |
| Q2_K | 12,291 GB | 0,107824 | 86,270 % | 0,113427 | 89,294 % | 0,171652 | 85,373 % |
| IQ2_M | 11,523 GB | 0,134445 | 84,667 % | 0,135428 | 87,588 % | 0,204478 | 83,853 % |

Como referencia, la model card incluye tambien las variantes UD de Unsloth para comparar. Por ejemplo, UD-Q6_K (29,308 GB) obtiene KL de 0,005995 y 96,657 % top-1 en WikiText-2, y UD-Q4_K_M (22,135 GB) obtiene 0,012990 y 94,917 %. No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11,5 GB (IQ2_M) y 36,9 GB (Q8_0) solo para los pesos; hay que sumar la memoria para el contexto y el estado de la KV cache.
- GPU recomendadas: para Q8_0 y Q6_K se necesitan GPUs de 40-48 GB o superiores (A100 40/80 GB, H100, L40S). Para Q4_K_M (22,1 GB) encajan la RTX 4090 (24 GB) y la A6000 (48 GB) con margen.
- Cabe en GPU de consumo: Q4_K_M, Q4_K-Q8_0, IQ4_XS-Q8_0, Q3_K_M, IQ3_XXS, Q2_K e IQ2_M caben en tarjetas de 24 GB; las dos ultimas, en tarjetas de 12-16 GB.
- Opciones de despliegue: llama.cpp (el autor documenta `llama-cli -m <archivo> --jinja`), Ollama y otros runners compatibles con GGUF. El soporte en vLLM o TGI no esta indicado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs Qwen3.6-35B-A3B-GGUF | 34,66 mil millones totales, ~3 mil millones activos | no disponible | GGUF | Apache 2.0 | Cuantizaciones con imatrix propia y metricas KL publicadas |
| Unsloth Qwen3.6-35B-A3B (UD) | 34,66 mil millones totales, ~3 mil millones activos | no disponible | GGUF | Apache 2.0 | Cuantizaciones dinamicas UD; la model card incluye comparaciones directas de KL y top-1 |
| Qwen/Qwen3.6-35B-A3B (base) | 34,66 mil millones totales, ~3 mil millones activos | no disponible | safetensors (BF16) | Apache 2.0 | Modelo original sin cuantizar; referencia de calidad |

La comparativa se limita a variantes del mismo modelo base, ya que la informacion disponible no incluye datos de benchmarks de tareas que permitan contrastarlo con otras familias.

## Limitaciones y advertencias

- La cuantizacion introduce degradacion medible: en IQ2_M la coincidencia top-1 baja al 83,853 % en el conjunto held-out y la KL sube a 0,204478, frente a 96,853 % y 0,008898 en Q8_0.
- No incluye vision ni la capa MTP, por lo que no sirve para tareas multimodales ni para decodificacion especulativa con esa capa.
- Idiomas declarados limitados a ingles y coreano; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.6-35B-A3B antes de desplegarlo en produccion.
- El repositorio ocupa 252,6 GB en total; descargar solo el archivo de cuantizacion necesario.
- Algunos tipos de tensor se han copiado de los archivos UD de Unsloth; los resultados de calidad no son identicos a los de esas variantes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-GGUF/blob/main/LICENSE
- Codigo de llama.cpp referenciado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
