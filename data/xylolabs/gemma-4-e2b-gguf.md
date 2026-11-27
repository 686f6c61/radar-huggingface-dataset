# Xylolabs/gemma-4-E2B-GGUF

## Resumen

Xylolabs/gemma-4-E2B-GGUF es una coleccion de cuantizaciones GGUF del modelo google/gemma-4-E2B, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. Se trata de una distribucion derivada: el modelo original lo desarrolla Google, y este repositorio ofrece los pesos cuantizados en ocho variantes (de Q8_0 a Q2_K), sin las torres de vision ni de audio del modelo base. La licencia declarada es Apache 2.0, lo que facilita su uso comercial.

El modelo base cuenta con 4.647.450.147 parametros totales segun los datos de safetensors, lo que lo situa en la categoria de modelos compactos de ~4,6B. Esta orientado a generacion de texto y declara soporte de los idiomas ingles y coreano. El repositorio ocupa 28,7 GB en total, aunque cada archivo individual pesa entre 2,99 GB (Q2_K) y 4,96 GB (Q8_0), lo que permite desplegarlo en hardware de consumo.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar localmente un modelo Gemma 4 de la serie E2B con llama.cpp, con datos de degradacion por cuantizacion medidos y publicados por el autor. La ausencia de torres de vision y audio implica que estas cuantizaciones son exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base google/gemma-4-E2B; cuantizacion GGUF para llama.cpp) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso emplea -c 8192) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base google/gemma-4-E2B en la documentacion proporcionada. El repositorio es una cuantizacion del modelo original de Google, por lo que la arquitectura subyacente corresponde a la del modelo base, sin que se detallen en esta ficha aspectos como el tipo de transformer, el uso de mezcla de expertos, los datos de entrenamiento, el numero de tokens o las tecnicas de alineacion (RLHF/DPO).

La innovacion tecnica destacable de este repositorio es el proceso de cuantizacion y su evaluacion. El autor publica metricas de divergencia KL y de acuerdo top-1 frente a BF16 sobre WikiText-2 y sobre texto sin procesar reservado (40 y 20 fragmentos de 512 tokens), ademas de una comprobacion de respuesta sobre 7 completaciones. Las cuantizaciones se han generado con imatrix, segun las etiquetas del repositorio, y estan pensadas para llama.cpp a partir de la version b8730. Las torres de vision y audio del modelo base se han eliminado deliberadamente.

## Capacidades

- Generacion de texto: el modelo esta etiquetado como text-generation y orientado a completar y generar texto.
- Idiomas: soporte declarado de ingles (en) y coreano (ko).
- Ejecucion local: compatible con llama.cpp en CUDA, Metal y CPU, lo que permite inferencia en estaciones de trabajo y equipos de consumo.
- Sin vision ni audio: las cuantizaciones excluyen explicitamente las torres de vision y audio del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible; la vision y el audio estan ausentes por diseno en esta distribucion.

## Casos de uso

- Inferencia local en CPU: gracias a las variantes Q4_K_M (3,43 GB) o Q4_K_S (3,37 GB), el modelo puede ejecutarse en equipos sin GPU dedicada mediante llama.cpp, adecuado para prototipos y pruebas de concepto en portatiles.
- Despliegue en GPU de consumo: las variantes Q5_K_M y Q6_K caben en GPUs con 8-12 GB de VRAM, lo que permite servir el modelo en una RTX 4090 o similar para tareas de generacion de texto interactivas.
- Generacion de texto en ingles y coreano: util para aplicaciones de redaccion asistida o resumen en entornos bilingues en/ko, dado el soporte declarado de ambos idiomas.
- Integracion en pipelines con llama.cpp: el formato GGUF y la compatibilidad con llama.cpp permiten incorporar el modelo a herramientas existentes del ecosistema (por ejemplo, llama-completion) sin conversion adicional.
- Evaluacion de cuantizaciones: los datos de KL y top-1 publicados permiten elegir la variante adecuada segun el equilibrio entre tamano y fidelidad; por ejemplo, Q4_K_S mantiene un 88,22% de top-1 en texto reservado con solo 3,37 GB.
- Experimentacion en entornos con memoria limitada: la variante Q2_K (2,99 GB) permite ejecutar el modelo en equipos muy restringidos, asumiendo una degradacion notable (69,04% de top-1 en WikiText-2).
- Completado de texto por linea de comandos: el ejemplo del autor muestra su uso para completar prompts cortos con temperatura 0, adecuado para tareas deterministas de autocompletado.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de cuantizacion frente a BF16, no benchmarks de tareas estandar (MMLU, HumanEval, GSM8K). Se reproducen a continuacion.

| Cuantizacion | Tamano | KL WikiText-2 | top-1 WikiText-2 | KL texto reservado | top-1 texto reservado | Comprobacion de respuesta (7) |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 9,31 GB | - | - | - | - | 6/7 |
| Q8_0 | 4,96 GB | 0,001667 | 98,17% | 0,002171 | 97,71% | 6/7 |
| Q6_K | 3,84 GB | 0,004696 | 96,99% | 0,005515 | 95,75% | 6/7 |
| Q5_K_M | 3,63 GB | 0,011240 | 95,15% | 0,012424 | 93,96% | 6/7 |
| Q4_K_M | 3,43 GB | 0,040073 | 91,22% | 0,043000 | 88,92% | 6/7 |
| Q4_K_S | 3,37 GB | 0,043101 | 90,70% | 0,048305 | 88,22% | 7/7 |
| IQ4_XS | 3,30 GB | 0,048299 | 90,48% | 0,057354 | 88,00% | 6/7 |
| Q3_K_M | 3,20 GB | 0,177145 | 82,28% | 0,191855 | 78,75% | 6/7 |
| Q2_K | 2,99 GB | 0,526959 | 69,04% | 0,675012 | 62,90% | 5/7 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 3 GB (Q2_K, 2,99 GB de archivo) y 5 GB (Q8_0, 4,96 GB de archivo), mas el overhead del contexto y de llama.cpp.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; el autor indica compatibilidad con CUDA, Metal y CPU. Cualquier GPU con 8 GB o mas de VRAM puede alojar las variantes Q4-Q8 con margen.
- Cabe en GPU de consumo: si. Las variantes Q4_K_M (3,43 GB) y Q5_K_M (3,63 GB) son adecuadas para GPUs de consumo con 6-8 GB de VRAM; Q8_0 requiere alrededor de 6 GB o mas.
- Opciones de despliegue: llama.cpp (version b8730 o superior), con soporte de CUDA, Metal y CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas para comparar con modelos alternativos de la misma categoria. La comparacion se limita a las variantes de cuantizacion del propio repositorio, ya presentadas en la tabla de benchmarks.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Xylolabs/gemma-4-E2B-GGUF | 4.647.450.147 | no disponible | Apache 2.0 | GGUF |
| google/gemma-4-E2B (base) | 4.647.450.147 | no disponible | no disponible en esta ficha | no disponible en esta ficha |

No disponible para modelos comparables de otros autores.

## Limitaciones y advertencias

- Sin vision ni audio: esta distribucion elimina las torres de vision y audio del modelo base, por lo que no puede procesar imagenes ni audio.
- Idiomas limitados: solo se declaran ingles y coreano; el rendimiento en castellano no esta documentado.
- Degradacion por cuantizacion: las variantes bajas pierden fidelidad de forma marcada. Q3_K_M baja a 82,28% de top-1 en WikiText-2 y Q2_K a 69,04%, con KL de 0,527, lo que puede afectar a tareas sensibles a la precision.
- Riesgo de alucinacion: no se documenta en la informacion disponible; debe asumirse el riesgo habitual de los modelos generativos de texto.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial; deben revisarse los archivos LICENSE y NOTICE del repositorio para confirmar las condiciones exactas.
- Requisito de version: se requiere llama.cpp b8730 o superior; versiones anteriores pueden no cargar correctamente los archivos.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, con una unica actualizacion (primera release del 2026-11-27), por lo que su validacion por la comunidad es practicamente inexistente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Repositorio de Xylolabs referenciado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
