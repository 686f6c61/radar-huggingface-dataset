# vcruz305/Qwen3.8-27B-SAGE-REXL3-3.50bpw

## Resumen

Qwen3.8-27B-SAGE-REXL3-3.50bpw es una cuantizacion de pesos del modelo base Qwen/Qwen3.8-27B, publicada por el usuario vcruz305 en Hugging Face. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el repositorio contiene pesos en formato EXL3 (exllamav3) con una tasa de compresion de 3,50 bits por peso (bpw), pensados para su uso con el motor de inferencia ExLlamaV3.

El modelo subyacente pertenece a la familia Qwen3.5 segun las etiquetas del repositorio, con 27 mil millones de parametros nominales en el nombre. La cuantizacion a 3,50 bpw reduce de forma agresiva el espacio en disco y la VRAM necesaria frente a los pesos originales en BF16, a costa de una perdida de calidad que no se documenta en la ficha del repositorio.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~27B en GPUs de consumo con memoria limitada mediante ExLlamaV3. Sin embargo, la informacion disponible es muy escasa (sin model card descriptiva, sin benchmarks, sin licencia declarada en el campo correspondiente) y el repositorio registra cero descargas y cero likes en el momento de la consulta, lo que limita cualquier evaluacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como qwen3_5; arquitectura del base no detallada en la informacion) |
| Parametros totales | 27B (según denominacion del modelo base Qwen/Qwen3.8-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 3,50 bpw (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (segun tag del repositorio); el campo de licencia figura como no disponible |
| Formato de pesos | safetensors con cuantizacion EXL3 (exllamav3) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la documentacion proporcionada: no se detalla si emplea attention completa, atencion lineal, mezcla de expertos (MoE) ni la composicion de su dataset de entrenamiento. Las etiquetas del repositorio indican la familia qwen3_5 y el pipeline text-generation, con capacidades conversacionales declaradas.

Lo unico verificable es el proceso de cuantizacion: los pesos se han convertido al formato EXL3 de ExLlamaV3 con una precision de 3,50 bits por peso. Este formato aplica cuantizacion de bloques orientada a GPU, con el objetivo de maximizar el throughput en inferencia sobre hardware consumer. No se especifica en la informacion disponible si la cuantizacion es uniforme o mixta por capas, ni que calibracion se ha utilizado (el sufijo "SAGE" podria referirse a un esquema de calibracion, pero no se documenta).

Tampoco hay datos sobre si el modelo base recibio RLHF, DPO u otras fases de alineamiento, ni sobre innovaciones tecnicas como decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun la etiqueta conversational del repositorio.
- Generacion de codigo y texto tecnico: capacidad esperable en modelos de la familia Qwen, aunque no verificada en esta ficha por falta de benchmarks.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en GPU de consumo: la cuantizacion a 3,50 bpw reduce el peso en VRAM frente a BF16, lo que permite ejecutar un modelo de ~27B en tarjetas con 12-16 GB mediante ExLlamaV3, adecuado para prototipado en estaciones de trabajo personales.
- Asistente conversacional autoalojado: el pipeline text-generation y la etiqueta conversational permiten integrar el modelo en un chatbot interno con ExLlamaV3 como backend, sin dependencia de APIs externas.
- Generacion de codigo en entornos con requisitos de privacidad: al ejecutarse en local, el modelo puede asistir en tareas de autocompletado y explicacion de codigo sin enviar el codigo fuente a terceros.
- Experimentacion con cuantizacion extrema: util como referencia para comparar la calidad de EXL3 a 3,50 bpw frente a variantes de mayor precision (por ejemplo, la variante 5,0 bpw del mismo autor) en tareas de evaluacion propias.
- Procesamiento por lotes de texto en un solo equipo: la reduccion de memoria permite mantener el modelo cargado de forma permanente y procesar lotes de documentos con ExLlamaV3.
- Base para fine-tuning o evaluacion academica: al estar bajo licencia Apache 2.0 segun el tag, puede servir como punto de partida para experimentos de investigacion, siempre que se verifique la licencia del modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27B parametros a 3,50 bpw, el peso de los pesos ronda los 11,8 GB; anadiendo cache KV y overhead de ExLlamaV3, se estima un consumo de aproximadamente 13-16 GB, dependiendo de la longitud de contexto configurada (estimacion propia, no confirmada por el autor).
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 Super (16 GB) con contexto moderado, A100 40 GB y H100 para despliegues con contexto largo o concurrencia.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 4080 y GPUs de 16 GB o mas; en tarjetas de 12 GB el margen es muy ajustado y dependera del contexto.
- Opciones de despliegue: ExLlamaV3 es el motor nativo del formato EXL3; no es compatible directamente con llama.cpp, Ollama, vLLM o TGI sin conversion previa a otro formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vcruz305/Qwen3.8-27B-SAGE-REXL3-3.50bpw | 27B | no disponible | EXL3 3,50 bpw | apache-2.0 (tag) | Hugging Face, 0 descargas |
| vcruz305/Qwen3.8-27B-DFlash2-SAGE-EXL3-5.0bpw | 27B | no disponible | EXL3 5,0 bpw | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (modelo base) | 27B | no disponible | BF16 original | no disponible en la informacion | Hugging Face |

La unica comparacion documentada es con la variante de 5,0 bpw del mismo autor, que ofrece mayor fidelidad a costa de mas VRAM. No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 3,50 bpw es agresiva y puede degradar la coherencia, el razonamiento y la fidelidad en tareas de codigo respecto al modelo base en BF16; no se aportan evaluaciones que cuantifiquen esta perdida.
- No hay model card descriptiva, benchmarks ni ejemplos de uso en el repositorio, por lo que la calidad real del artefacto no esta verificada.
- El repositorio registra cero descargas y cero likes, lo que indica ausencia de validacion por parte de la comunidad.
- El campo de licencia figura como no disponible, aunque el tag indica apache-2.0; antes de un uso comercial conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B, que prevalece sobre la del artefacto derivado.
- Riesgo de alucinacion y sesgos: no documentados para este artefacto; deben asumirse los del modelo base, no evaluados aqui.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano sin pruebas propias.
- Compatibilidad limitada: el formato EXL3 solo funciona con ExLlamaV3, lo que excluye pipelines basados en vLLM, TGI, llama.cpp u Ollama sin conversion.
- El nombre del modelo base (Qwen3.8-27B) no se corresponde con ninguna publicacion oficial verificable en la informacion proporcionada; conviene confirmar la procedencia antes de desplegarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vcruz305/Qwen3.8-27B-SAGE-REXL3-3.50bpw
- Variante relacionada del mismo autor (5,0 bpw): https://huggingface.co/vcruz305/Qwen3.8-27B-DFlash2-SAGE-EXL3-5.0bpw
- Arbol de ficheros de la variante 5,0 bpw: https://huggingface.co/vcruz305/Qwen3.8-27B-DFlash2-SAGE-EXL3-5.0bpw/tree/main
