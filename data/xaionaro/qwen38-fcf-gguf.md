# xaionaro/qwen38-fcf-gguf

## Resumen

xaionaro/qwen38-fcf-gguf es un repositorio de cuantizaciones GGUF del ajuste fino DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un modelo denso de unos 26,9 mil millones de parametros derivado de la familia Qwen 3.8 de 27B. El repositorio lo publica el usuario xaionaro y contiene tanto cuantizaciones GGUF "regular" como variantes MTP (multi-token prediction), generadas con esquema de doble imatrix (DI-MATRIX) bajo la denominacion Neo-CODER MAX. El modelo base fue entrenado por DavidAU mediante las tecnicas que el autor denomina COLD FUSION (GAIN + Unsloth) y Fable Fusion 711.

El objetivo declarado del ajuste es triple: elevar la inteligencia general y la capacidad de resolucion de problemas, reducir drasticamente el numero de tokens de pensamiento (entre la mitad y una decima parte respecto al Qwen 3.8 original, con una reduccion mediana de aproximadamente dos tercios) y acelerar la generacion de tokens, especialmente en las variantes MTP. Ademas, el ajuste incorpora tecnicas de "abliteration"/"heretic" que eliminan los mecanismos de rechazo del modelo original, de ahi las etiquetas uncensored y abliterated.

La relevancia del repositorio es practica: empaqueta un modelo de casi 27B en formatos GGUF listos para inferencia local en hardware de consumo, con licencia Apache 2.0 y soporte declarado de tres modos de pensamiento. Las afirmaciones de rendimiento proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, derivado de Qwen 3.8 27B (no se detalla variante especifica) |
| Parametros totales | 26.895.998.464 (aprox. 26,9 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF regular y GGUF MTP, con imatrix doble (DI-MATRIX); pesos originales en bfloat16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multiples cuantizaciones) y bfloat16 |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 389,0 GB |
| Descargas / likes | 1148 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso de aproximadamente 26,9 mil millones de parametros, construido sobre la arquitectura Qwen 3.8 27B. El repositorio de xaionaro no entrena el modelo, sino que publica sus cuantizaciones: versiones GGUF "regular" y versiones MTP, ambas generadas con un esquema de doble imatrix (DI-MATRIX) que el autor denomina Neo-CODER MAX. El pipeline declarado es image-text-to-text, aunque la informacion disponible no detalla ningun componente de vision ni su configuracion.

El proceso de ajuste del modelo base, segun la model card, es un tune multi-etapa, multi-fine-tune y multi-stage merge. La tecnica principal se denomina COLD FUSION, que combina el metodo propio GAIN con los entrenadores de Unsloth; GAIN modifica dinamicamente el entrenamiento muestra a muestra en tiempo real a medida que el modelo aprende. A esto se suma el metodo Fable Fusion 711. Los objetivos declarados incluyen reformatear y comprimir los bloques de razonamiento, mantener el rendimiento en los tres modos de pensamiento y evitar explicitamente el "benchmaxing". Los datasets empleados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifica el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en tres modos de pensamiento declarados, con bloques de razonamiento reducidos frente al modelo base.
- Escritura creativa y de ficcion: el modelo esta ajustado especificamente para narrativa, relatos y generacion de prosa de alta densidad descriptiva.
- Roleplay y conversacion de personaje, con etiquetas explicitas de fiction, story y roleplaying.
- Generacion de codigo, segun la etiqueta coder del repositorio; no se detallan benchmarks de codigo en la informacion disponible.
- Capacidades multilingues limitadas a ingles y chino.
- Soporte de tool calling / function calling: la model card remite a la pestana "community" para resultados de terceros que afirman un rendimiento destacado en tool calling, pero no se aportan datos propios verificables en la informacion disponible.
- Inferencia acelerada mediante variantes MTP (multi-token prediction), que reducen el coste por token generado.
- Comportamiento "uncensored"/"abliterated": el ajuste elimina los rechazos del modelo original, lo que amplia el rango de contenido generado sin filtros.
- Etiqueta "ara" presente en los tags sin explicacion en la informacion disponible.
- Capacidad de vision: no confirmada. El pipeline declarado es image-text-to-text, pero no hay documentacion que lo respalde en la informacion proporcionada.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo esta ajustado para generar ficcion con alto nivel de detalle y multiples generos, por lo que encaja en flujos de redaccion asistida de novelas, relatos y guiones donde se necesita consistencia de tono y ritmo narrativo.
- Roleplay y personajes conversacionales: su ajuste especifico en dialogo de personaje permite construir asistentes de rol o companeros conversacionales persistentes, con menos tokens de "pensamiento" que consumen presupuesto de contexto.
- Generacion de codigo en pipelines locales: al distribuirse en GGUF y con etiqueta coder, puede integrarse en herramientas de autocompletado o revision de codigo ejecutadas en estaciones de trabajo sin GPU de datacenter.
- Agentes con presupuesto de tokens ajustado: la reduccion declarada de tokens de razonamiento (hasta 1/10 en algunos casos) abarata las cadenas de razonamiento multi-paso y los bucles de agente con tool calling.
- Despliegue local en hardware de consumo: las cuantizaciones de 4 y 5 bits caben en GPUs de 24 GB, lo que permite ofrecer un asistente generativo completo sin depender de APIs externas ni enviar datos a terceros.
- Generacion de datos sinteticos: puede emplearse para producir corpus de texto diverso (narrativa, dialogo, codigo) destinado a otros entrenamientos, con la ventaja de ejecutarse offline y sin coste por token.
- Traduccion y generacion bilingue ingles-chino: los dos idiomas declarados cubren flujos de localizacion y documentacion tecnica entre ambos mercados.
- Servicio de inferencia con throughput alto: las variantes MTP estan pensadas para acelerar la generacion de tokens, lo que resulta util en endpoints con muchos usuarios concurrentes y presupuesto de latencia estricto.

## Benchmarks y rendimiento

Los unicos datos numericos presentes en la informacion disponible son los declarados por el autor del modelo base. No se han publicado resultados de benchmarks independientes ni la lista completa de los siete benchmarks que la model card afirma superar.

| Benchmark | Declarado en 8 bits | Declarado en 4 bits | Comparacion declarada |
|---|---|---|---|
| ARC-C | 735 | 719 | +144 puntos frente a Qwen 3.8 27B |
| ARC-E | 880 | No disponible | Ninguna cifra comparativa aportada |
| Otros 5 benchmarks | No disponibles | No disponibles | Se afirma superar a Qwen 3.8 27B, Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en los 7 benchmarks criticos, sin cifras |

Todas estas cifras proceden de la model card del autor. No se han verificado de forma independiente y no deben tratarse como resultados reproducibles sin evaluacion propia.

## Requisitos de hardware

Estimaciones de VRAM para inferencia, calculadas a partir de los 26,9 mil millones de parametros y del tamano por peso de cada cuantizacion. No incluyen el cache KV, que crece con la longitud de contexto.

| Cuantizacion | Peso aproximado | VRAM minima estimada | GPU de referencia |
|---|---|---|---|
| bfloat16 | ~54 GB | 60-80 GB | A100 80 GB, H100 80 GB, 2x RTX 4090 |
| Q8_0 | ~28,5 GB | 32-40 GB | A100 40 GB, RTX 5090 32 GB |
| Q6_K | ~22 GB | 24-32 GB | RTX 3090, RTX 4090, RTX 5090 |
| Q5_K_M | ~19 GB | 24 GB | RTX 3090, RTX 4090, RTX 5090 |
| Q4_K_M | ~16,5 GB | 20-24 GB | RTX 4090 24 GB, RTX 4080 16 GB con offload parcial |
| Q3_K_M | ~13,5 GB | 16 GB | RTX 4080, RTX 4060 Ti 16 GB |
| Q2_K | ~10 GB | 12 GB | RTX 3060 12 GB, RTX 4070 |

- Cabe en GPU de consumo: si, desde cuantizaciones Q4_K_M en adelante en tarjetas de 24 GB, y en Q3/Q2 en tarjetas de 12-16 GB.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio y servidores compatibles con GGUF. El repositorio declara compatibilidad con endpoints.
- Formatos MTP: pensados para reducir la latencia por token; requieren motores de inferencia que soporten multi-token prediction.
- Throughput y latencia: no disponibles en la informacion proporcionada. Dependen del motor, la cuantizacion y la GPU.
- El repositorio completo ocupa 389 GB, por lo que conviene descargar unicamente las cuantizaciones necesarias.

## Comparativa con modelos similares

La informacion disponible solo permite comparaciones cualitativas basadas en las afirmaciones del autor; no hay fichas tecnicas de los modelos de referencia.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xaionaro/qwen38-fcf-gguf (este modelo, cuantizado) | 26,9 B densos | No disponible | ARC-C 735 (8 bits) / 719 (4 bits) declarado | Apache 2.0 | GGUF en HuggingFace |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (modelo base) | Aprox. 27 B | No disponible | Referencia del ajuste | Apache 2.0 | Pesos completos, no GGUF |
| Qwen 3.8 27B (original) | Aprox. 27 B | No disponible | Inferior en los 7 benchmarks criticos segun el autor | No disponible | No disponible |
| Qwen3.6-35B-A3B | 35 B totales con parametros activos reducidos (MoE segun nomenclatura) | No disponible | Inferior en los 7 benchmarks criticos segun el autor | No disponible | No disponible |
| Qwen 3.6 27B y Qwen 3.5 27B | Aprox. 27 B | No disponible | Inferior en los 7 benchmarks criticos segun el autor | No disponible | No disponible |

## Limitaciones y advertencias

- Las cifras de benchmarks (ARC-C 735 y ARC-E 880) son afirmaciones del autor del modelo base, no resultados verificados por terceros.
- El modelo esta explicitamente "abliterated" y "uncensored": se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido ofensivo, ilegal o danino sin filtros. No es adecuado para aplicaciones orientadas al publico sin moderacion adicional.
- Cobertura idiomatica limitada a ingles y chino. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- El pipeline declarado es image-text-to-text, pero no hay documentacion sobre capacidades de vision; conviene verificar su funcionamiento real antes de depender de ellas.
- El ajuste esta orientado a escritura creativa y roleplay, lo que puede sesgar las respuestas hacia un registro informal o soez en contextos profesionales.
- No se documentan los datos de entrenamiento en detalle ni los procesos de alineacion (RLHF/DPO), por lo que el riesgo de sesgos y de alucinacion no puede acotarse.
- La licencia Apache 2.0 declarada corresponde al repositorio de cuantizaciones, pero el modelo base es un ajuste fino derivado de Qwen con tecnicas que eliminan salvaguardas; conviene revisar los terminos aplicables en la cadena completa antes de un uso comercial.
- El modelo tiene 0 likes y 1148 descargas en la fecha de los datos, un nivel de validacion comunitaria bajo.
- El tamano del repositorio (389 GB) y el de los pesos en bfloat16 hacen inviable su despliegue en hardware sin GPU dedicada.
- Se desconoce la longitud de contexto real; las aplicaciones que dependan de ventanas largas deben validarlo empiricamente.
- La fecha de creacion registrada (2026-09-21) y las referencias a "Qwen 3.8" no coinciden con modelos ampliamente documentados, lo que refuerza la necesidad de verificar el contenido del repositorio antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xaionaro/qwen38-fcf-gguf
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Dataset DavidAU/Polar-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset DavidAU/F451-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Repositorio de referencia de la tecnica COLD FUSION / Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Otros enlaces: la busqueda web realizada no devolvio resultados relevantes sobre este modelo, su arquitectura o sus benchmarks.
