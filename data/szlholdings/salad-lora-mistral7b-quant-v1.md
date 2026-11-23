# SZLHOLDINGS/salad-lora-mistral7b-quant-v1

## Resumen

`salad-lora-mistral7b-quant-v1` es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face, presumiblemente derivado de Mistral 7B mediante un ajuste fino con LoRA (el nombre indica "lora" y "quant") y posteriormente cuantizado. El repositorio tiene un tamano de 1,7 GB, lo que es coherente con pesos cuantizados de un modelo de aproximadamente 7 mil millones de parametros, aunque el autor no detalla el esquema de cuantizacion empleado. El pipeline, la licencia y los idiomas no estan declarados en la informacion disponible.

La model card no contiene especificaciones tecnicas sustantivas: se limita a describir el artefacto como parte de un "estate" de IA gobernada de SZL Holdings, con graficos SVG deterministas generados a partir de una instantanea de auditoria y un apartado de "honesty" en el que el propio autor declara que cualquier afirmacion de entrenamiento o evaluacion no respaldada por sus ficheros de recibo se considera UNKNOWN. El escaneo de recibos de la propia organizacion (tranche 6, chunk 2, 2026-11-22) clasifica este repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo, pero no existe un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`.

Por tanto, la relevancia practica del modelo es limitada en el momento de redactar esta ficha: no hay evidencia medida de calidad, no hay benchmarks publicados, no hay declaracion de licencia y el numero de descargas y likes es cero. Se trata de un artefacto de un pipeline interno de fabricacion de modelos mas que de un modelo listo para produccion, y debe evaluarse con cautela hasta que el autor publique recibos medidos y una licencia explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only derivado de Mistral 7B; no confirmado por el autor) |
| Parametros totales | no disponible (el nombre sugiere ~7B; el tamano del repo, 1,7 GB, es compatible con pesos cuantizados de ese orden) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre incluye "quant"; el esquema concreto no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (unico formato declarado en los tags del repo) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. El nombre del repositorio sugiere un ajuste fino con LoRA sobre una base Mistral 7B seguido de cuantizacion, pero el autor no confirma ni la base exacta, ni el rango y alpha de LoRA, ni el metodo de cuantizacion (GPTQ, AWQ, bitsandbytes u otro). La model card remite a "receipt files" del estate para cualquier afirmacion de entrenamiento, y el escaneo de recibos indica que no existe un `DONE.json` estricto que valide la evidencia de evaluacion.

La unica innovacion tecnica documentada es de proceso, no de modelado: el autor genera tarjetas con SVG deterministas a partir de instantaneas de auditoria con marca temporal y etiqueta cada dato como MEASURED, REPORTED o UNKNOWN. Es un mecanismo de trazabilidad interesante, pero no aporta informacion sobre el modelo en si.

## Capacidades

- Generacion de texto: presumible, por herencia de la base Mistral 7B, pero no verificado ni declarado por el autor.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ajuste especifico: el nombre "salad" sugiere un dominio o tarea concreta, pero el autor no la describe.

## Casos de uso

- Evaluacion interna de artefactos LoRA cuantizados: el repositorio puede servir como ejemplo de como SZL Holdings empaqueta y audita sus modelos, util para equipos que quieran replicar su pipeline de recibos y tarjetas deterministas.
- Pruebas de integracion en pipelines de cuantizacion: dado que el artefacto esta en safetensors y ocupa 1,7 GB, puede cargarse en entornos de prueba para validar flujos de carga y despliegue, siempre que se confirme la licencia antes de cualquier uso.
- Comparacion de esquemas de cuantizacion: si se dispone de la base original, el artefacto permite medir la degradacion introducida por la cuantizacion, aunque el autor no publica esas metricas.
- Docencia y divulgacion sobre gobernanza de modelos: la estructura de la model card (etiquetas MEASURED/REPORTED/UNKNOWN, recibos, instantaneas con fecha) es un caso practico de documentacion honesta de artefactos.
- Investigacion sobre ajuste fino con LoRA en modelos de 7B: como ejemplo de artefacto derivado, aunque sin datos de entrenamiento publicados su valor cientifico es limitado.
- Despliegue en produccion: no recomendable en el estado actual, al no haber licencia, benchmarks ni evidencia de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no afirma ninguna cifra de benchmark mas alla de lo que mida una auditoria fechada, y el escaneo de recibos clasifica la evidencia de evaluacion como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa para un modelo de ~7B cuantizado a 4 bits, el orden de magnitud habitual es de 4-6 GB de VRAM para los pesos mas overhead de contexto; el autor no confirma el esquema de cuantizacion ni el tamano real de los pesos.
- GPU recomendadas: no disponible. Para un 7B cuantizado, una RTX 3090, RTX 4090 o A10G serian suficientes en terminos generales, pero no hay confirmacion del autor.
- Cabe en GPU de consumo: probablemente si, en tarjetas con 8 GB o mas, si la cuantizacion es de 4 bits; no confirmado.
- Opciones de despliegue: al estar en safetensors, seria compatible con vLLM, TGI o transformers si el formato de cuantizacion es estandar; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evidencia de evaluacion |
|---|---|---|---|---|---|
| salad-lora-mistral7b-quant-v1 (SZLHOLDINGS) | no disponible (~7B por el nombre) | no disponible | no disponible | Hugging Face, 0 descargas | UNKNOWN (sin DONE.json) |
| Mistral 7B (Mistral AI) | 7,3B | 32k tokens | Apache 2.0 | Amplia, ampliamente adoptado | Benchmarks publicos |
| Zephyr 7B beta (Hugging Face H4) | 7,2B | 32k tokens | MIT | Amplia | Benchmarks publicos (MT-Bench, AlpacaEval) |
| OpenChat 3.5 (OpenChat) | 7B | 8k tokens | Apache 2.0 | Amplia | Benchmarks publicos |

La comparativa es orientativa: la base exacta del artefacto de SZL Holdings no esta confirmada por el autor, por lo que la equivalencia con Mistral 7B es una inferencia a partir del nombre del repositorio.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue.
- Ausencia de benchmarks y de recibos de evaluacion medidos: el propio autor clasifica la evidencia como UNKNOWN; no hay base para afirmar calidad o capacidades.
- Riesgo de alucinacion: desconocido, pero inherente a cualquier modelo de lenguaje; sin evaluacion no puede acotarse.
- Sesgos conocidos: no documentados; dependen de la base y del dataset de ajuste, ambos no declarados.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto ni cobertura linguistica.
- Trazabilidad incompleta: la model card remite a "receipt files" del estate, pero el escaneo de la propia organizacion indica que no existe un `DONE.json` estricto, por lo que las afirmaciones de entrenamiento no son verificables desde el repositorio.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por terceros.
- Fecha de creacion futura respecto a la redaccion habitual de fichas (2026-11-16): conviene verificar la vigencia y el estado actual del repositorio antes de usarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-lora-mistral7b-quant-v1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de tarjetas: https://github.com/szl-holdings/estate-cards
- Paper, blog o demo adicionales: no disponible
