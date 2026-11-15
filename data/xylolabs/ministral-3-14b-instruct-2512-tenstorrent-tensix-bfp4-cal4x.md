# Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-Cal4x

## Resumen

Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-Cal4x es un checkpoint cuantizado de GPTQ derivado de Mistral AI Ministral 3 14B Instruct (BF16), preparado por Xylolabs para su despliegue sobre hardware Tenstorrent Tensix. El modelo conserva la arquitectura y los pesos aprendidos del original, pero representa las 280 matrices de atencion y MLP en precision BFP4 (block floating point de 4 bits), mientras mantiene en BF16 las tablas de embedding, la cabeza LM y las 81 vectores de normalizacion. El resultado es un export de 363 tensores y 13.506.073.600 parametros aprendidos, con un tamaño logico empaquetado de aproximadamente 9,53 GB.

El checkpoint esta pensado para entornos de inferencia nativos de Tenstorrent (TT-NN), donde el formato BFP4 reduce el consumo de memoria y aprovecha las unidades de computo Tensix. No se ha realizado entrenamiento, calibracion ni cuantizacion nueva: es una conversion de receta fija sobre el modelo publicado por Mistral AI, con verificacion de que los 363 tensores convertidos coinciden con el BF16 original tras eliminar el prefijo de namespace.

La relevancia actual del modelo es doble: por un lado, permite ejecutar un modelo instructivo de 14B parametros en aceleradores Tenstorrent con un presupuesto de memoria de aproximadamente 9,5 GB para pesos; por otro, sirve como referencia reproducible de cuantizacion BFP4 con criterios de evaluacion conservados (16 secuencias, 12.104 posiciones puntuadas y 131.072 entradas de vocabulario). La licencia Apache 2.0 facilita su uso comercial, aunque el despliegue real exige utilidades de empaquetado TT-NN y no incluye un runner nativo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Ministral 3), 40 capas de texto |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ con BFP4 en matrices de atencion y MLP; BF16 en embeddings, cabeza LM y normas; media de 5,643175 bits por parametro aprendido |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tensores cuantizados con valores BF16), utilidades `pack_tensix.py` y `verify_grid.py` para empaquetado TT-NN |

Datos adicionales del export:

| Metrica | Valor |
|---|---|
| Tamano del export original | 27.029.519.296 bytes |
| Pesos logicos empaquetados | 9.527.142.400 bytes |
| Cabeza gruesa BFP4 en runtime | 377.487.360 bytes |
| Pesos empaquetados con ambas representaciones de cabeza | 9.904.629.760 bytes |
| Tensores totales | 363 (280 matrices BFP4, 81 normas BF16, embedding y cabeza LM BF16) |
| Tamano del repo | 27,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 40 capas de texto con 13.506.073.600 parametros aprendidos, heredado de Ministral 3 14B Instruct de Mistral AI. No se ha reentrenado ni recalibrado: el export de Xylolabs aplica una receta fija de GPTQ que representa las 280 matrices de atencion y MLP en BFP4, mantiene las 81 normas en BF16 y conserva el embedding y la cabeza LM completos en BF16. Los 83 tensores no cuantizados mantienen los bytes originales, y los 363 tensores convertidos coinciden con el BF16 primario tras eliminar un prefijo de namespace fijo.

La innovacion tecnica principal no esta en el entrenamiento sino en el formato: BFP4 es un esquema de bloque con exponente compartido que reduce el coste de almacenamiento y computo en las unidades Tensix de Tenstorrent. El checkpoint incluye una cabeza gruesa BFP4 adicional de 377.487.360 bytes como representacion derivada de runtime, que no anade parametros aprendidos pero debe contarse junto con la cabeza BF16 original. El proceso de publicacion incluye verificacion de rejilla exacta y round-trip de empaquetado TT-NN para las 280 matrices seleccionadas, ademas de una comprobacion de fidelidad sobre las 16 secuencias de evaluacion originales.

## Capacidades

- Generacion de texto conversacional en ingles y coreano, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento y respuestas instructivas heredadas del modelo base Ministral 3 14B Instruct.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a en y ko segun los metadatos del modelo.
- Modo thinking: el export conserva las 7 salidas de thinking medidas en la evaluacion original, pero con 0/7 aciertos en ambos modelos, por lo que no hay evidencia de precision de razonamiento.
- Capacidades de vision o audio: no disponible.
- Inferencia sobre hardware Tenstorrent Tensix mediante empaquetado TT-NN.
- Carga en Transformers con `dtype=torch.bfloat16` y `device_map` configurable (ejemplo CPU verificado con Transformers 5.22.1).

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint esta disenado para ejecutarse sobre Tensix con pesos empaquetados de aproximadamente 9,53 GB, lo que permite servir un modelo de 14B en hardware de inferencia dedicado con menor presupuesto de memoria que el BF16 original.
- Evaluacion de tecnicas de cuantizacion BFP4: sirve como referencia reproducible con KL medio de 0,020252 frente al BF16, util para comparar recetas de cuantizacion en pipelines de investigacion.
- Generacion de texto conversacional en ingles y coreano: el modelo conserva la plantilla de chat y el tokenizador originales, por lo que puede integrarse en aplicaciones de asistente en esos dos idiomas.
- Prototipado en CPU con Transformers: el ejemplo de quickstart carga el modelo en BF16 sobre CPU con `device_map="cpu"`, adecuado para validacion funcional antes de pasar a hardware Tenstorrent.
- Investigacion sobre formatos empaquetados: las utilidades `pack_tensix.py` y `verify_grid.py` permiten comprobar los formatos comprimidos declarados y el round-trip de empaquetado, utiles para equipos que desarrollan tooling propio.
- Benchmarking de fidelidad de cuantizacion: el modelo incluye un protocolo de evaluacion con 16 secuencias, 12.104 posiciones puntuadas y 131.072 entradas de vocabulario, reutilizable para comparar checkpoints derivados del mismo base.
- Integracion en pipelines de investigacion sobre Mistral: al mantener los IDs de token, prompts y reglas de puntuacion congelados, facilita la comparacion controlada contra el BF16 de referencia.

## Benchmarks y rendimiento

Los datos publicados corresponden a una comparacion de fidelidad contra el BF16 original, no a benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la informacion disponible para esas metricas.

| Comprobacion sobre archivos guardados | Resultado |
|---|---:|
| KL medio del checkpoint | 0,020252 |
| Referencia KL Q4_K_M registrada | 0,014730 |
| Limite KL relativo registrado | 0,022095 |
| Ratio frente a referencia Q4_K_M | 1,374881 |
| Respuestas normales correctas | 31/33 |
| Respuestas de thinking correctas | 0/7 |
| Respuestas perdidas o rotas contadas | 0 |

La comparacion con regla 7 sobre archivos guardados supera al BF16 (31/33 frente a 30/33), con cero perdidas contadas. El item ganado es `en-arith-price`. La puerta estricta de respuestas normales pasa sin exclusion por casi-empate ni perdon de recuperacion. Las 7 salidas de thinking originales se miden en ambos modelos con 0/7 y sin items de referencia elegibles, por lo que esa puerta no es aplicable y no constituye evidencia de precision de razonamiento.

## Requisitos de hardware

- Memoria para pesos empaquetados: aproximadamente 9,53 GB solo para los pesos logicos del checkpoint; con ambas representaciones de cabeza, 9,90 GB.
- Memoria adicional: cache KV, workspace y padding del allocator no estan incluidos en esas cifras.
- Carga en framework: los tensores guardados en BF16 ocupan aproximadamente 27,01 GB antes de buffers de runtime.
- GPU recomendadas: no disponible en la informacion proporcionada. El checkpoint esta orientado a hardware Tenstorrent Tensix, no a GPU convencionales.
- Compatibilidad con GPU de consumo: no disponible. El formato BFP4 y las utilidades de empaquetado TT-NN estan pensados para aceleradores Tenstorrent.
- Opciones de despliegue: Transformers (carga en CPU verificada con Transformers 5.22.1), empaquetado TT-NN mediante `pack_tensix.py` y verificacion con `verify_grid.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Requisito de contexto: el empaquetado TT-NN en host necesita un contexto de arquitectura configurado, como un entorno de simulador upstream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs Ministral-3-14B-Instruct BFP4 Cal4x | 13.506.073.600 | no disponible | safetensors BFP4/BF16, empaquetado TT-NN | Apache 2.0 | Hugging Face, 0 descargas |
| mistralai Ministral-3-14B-Instruct-2512-BF16 | no disponible en la informacion | no disponible | BF16 safetensors | no disponible en la informacion | Hugging Face (modelo base) |
| Referencia Q4_K_M registrada en la evaluacion | no disponible | no disponible | cuantizacion Q4_K_M | no disponible | usada solo como referencia KL |

La comparativa se limita al modelo base BF16 y a la referencia Q4_K_M citada en la evaluacion, porque no se han proporcionado datos de otros modelos comparables de la misma categoria. No hay datos de benchmarks estandar que permitan comparar rendimiento con alternativas.

## Limitaciones y advertencias

- El checkpoint no incluye un runner nativo completo: `pack_tensix.py` y `verify_grid.py` solo comprueban los formatos comprimidos y el empaquetado TT-NN, no sustituyen a un motor de inferencia.
- El empaquetado TT-NN en host requiere un contexto de arquitectura configurado, como un entorno de simulador upstream.
- La evaluacion de thinking es 0/7 en ambos modelos y no constituye evidencia de precision de razonamiento.
- El KL medio del checkpoint (0,020252) es superior al de la referencia Q4_K_M (0,014730), con un ratio de 1,374881, aunque dentro del limite registrado de 0,022095.
- Idiomas soportados limitados a ingles y coreano segun los metadatos; no se declaran otros idiomas.
- Longitud de contexto no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de un modelo instructivo de 14B.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en produccion depende de la disponibilidad de tooling Tenstorrent y de un contexto de arquitectura valido.
- El checkpoint tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, por lo que no hay validacion externa de la comunidad.
- El repo ocupa 27,0 GB, aunque los pesos empaquetados sean de 9,53 GB; hay que prever espacio de almacenamiento para la descarga completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-Cal4x
- Modelo base BF16: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Licencia: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-Cal4x/blob/main/LICENSE
- Script de empaquetado: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-Cal4x/blob/main/pack_tensix.py
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Repositorio de utilidades Tensix BFP GPTQ: https://github.com/XylolabsInc/tensix-bfp-gptq
- Assets de Xylolabs: https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
