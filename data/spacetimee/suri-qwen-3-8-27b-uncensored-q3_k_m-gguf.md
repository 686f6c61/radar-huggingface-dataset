# SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q3_K_M-GGUF

## Resumen

Suri-Qwen-3.8-27B-Uncensored-Q3_K_M-GGUF es una version cuantizada en formato GGUF del modelo SpaceTimee/Suri-Qwen-3.8-27B-Uncensored, publicada por el usuario SpaceTimee. La conversion se ha realizado con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, un flujo automatico que toma los pesos originales en safetensors y genera un fichero GGUF listo para inferencia local. El resultado es un unico archivo de aproximadamente 13,3 GB con cuantizacion Q3_K_M, pensado para ejecutarse en llama.cpp, Ollama o cualquier runtime compatible con GGUF.

El modelo base cuenta con 26.895.998.464 parametros (unos 26,9 mil millones), segun los metadatos de safetensors. El nombre del repositorio sugiere una adaptacion o ajuste fino sin censura ("uncensored") sobre una base de la familia Qwen, en su variante etiquetada como "3.8" y 27B, aunque la model card no confirma la arquitectura concreta, el contexto maximo ni la composicion del entrenamiento. Tampoco se declaran licencia ni idiomas soportados.

La relevancia de esta ficha es practica: se trata de una publicacion con 0 descargas y 0 likes en el momento de la consulta, sin model card propia mas alla de las instrucciones genericas de uso con llama.cpp, y con fecha de creacion atipica (2026-09-24). Es, por tanto, un artefacto de bajo impacto y escasa validacion comunitaria, util principalmente para quien quiera ejecutar localmente una variante sin filtros de un modelo de ~27B en hardware de gama alta de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo apunta a la familia Qwen; no confirmado en la model card) |
| Parametros totales | 26.895.998.464 (aprox. 26,9 B), dato de safetensors del modelo base |
| Parametros activos | no aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M (unico fichero GGUF publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (convertido desde safetensors con llama.cpp) |

## Arquitectura y entrenamiento

No hay informacion publicada en el repositorio sobre la arquitectura interna del modelo base. La unica referencia tecnica disponible es que se trata de una conversion a GGUF realizada con llama.cpp mediante el espacio GGUF-my-repo de ggml.ai, lo que implica que el modelo original es compatible con la cadena de herramientas GGML y, por tanto, muy probablemente un transformer de tipo decoder-only. No se documentan numero de capas, dimension de embeddings, tipo de atencion, ni si incorpora mecanismos adicionales como atencion lineal, decodificacion especulativa o mezcla de expertos.

Tampoco se especifican los datos de entrenamiento: ni el volumen de tokens, ni la composicion del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO. La etiqueta "uncensored" en el nombre sugiere que el ajuste fino se ha orientado a reducir o eliminar las capas de rechazo y filtrado propias de los modelos alineados, pero el repositorio no aporta detalle metodologico, hiperparametros ni informes de evaluacion que permitan verificar esa afirmacion.

## Capacidades

- Generacion de texto: capacidad esperada por ser un modelo de ~27B, pero no documentada explicitamente en este repositorio.
- Razonamiento y matematicas: no disponible; no se han publicado evaluaciones.
- Generacion de codigo: no disponible; no se declara soporte especifico ni benchmarks asociados.
- Tool calling / function calling: no disponible; la model card no menciona plantilla de chat ni soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo "thinking" / razonamiento explicito: no disponible.
- Vision o audio: no disponible; no se declara entrada multimodal.
- Comportamiento sin censura: es la unica caracteristica sugerida por el propio nombre del modelo, sin documentacion que la respalde.
- Inferencia local: soportada de forma confirmada mediante llama.cpp (CLI y servidor) con el fichero GGUF Q3_K_M.

## Casos de uso

- Generacion creativa y narrativa sin restricciones tematicas: el modelo esta etiquetado como "uncensored", por lo que encaja en escritura de ficcion, guiones o roleplay donde los filtros de seguridad de modelos alineados suelen rechazar peticiones. Requiere revision humana del contenido generado.
- Prototipado local en estacion de trabajo: con 13,3 GB de pesos en Q3_K_M, se puede cargar en una GPU de 24 GB o en una configuracion mixta GPU/CPU usando llama-server, sin depender de APIs externas ni de conectividad.
- Procesamiento de datos sensibles en local: al ejecutarse integramente en la maquina del usuario mediante llama.cpp, es apto para flujos donde no se permite enviar texto a servicios en la nube (documentacion interna, borradores, analisis de texto propietario).
- Asistente conversacional autoalojado de proposito general: el servidor compatible con la API de llama.cpp permite exponer un endpoint HTTP e integrarlo en aplicaciones internas de chat, siempre que se acepte la ausencia de benchmarks que garanticen calidad.
- Generacion de datos sinteticos para experimentacion: util para producir corpus de texto diverso en pipelines de investigacion sobre alineacion, filtrado o evaluacion de contenido, dado su caracter sin censura.
- Investigacion sobre comportamiento de modelos sin alinear: permite comparar respuestas de una variante "uncensored" frente a su contraparte alineada en tareas de rechazo, sesgo o seguridad, como material de estudio controlado.
- Base para cuantizaciones alternativas o ajustes posteriores: al estar en formato GGUF y derivar de un modelo en safetensors, sirve como punto de partida para probar otras cuantizaciones (Q4_K_M, Q5_K_M, Q8_0) o para evaluar el impacto de la cuantizacion en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluacion, y tampoco se aportan mediciones de latencia o throughput. La unica metrica objetiva disponible es el tamano del repositorio (13,3 GB) y el recuento de parametros del modelo base (26,9 B).

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q3_K_M ocupa aproximadamente 13,3 GB; hay que sumar el contexto (KV cache) y el overhead del runtime. En la practica, se necesitan del orden de 15-18 GB de VRAM para contexto moderado (2.048-8.192 tokens), aunque esta cifra no esta confirmada por el autor.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100. En GPUs de 16 GB (RTX 4080, RTX 4070 Ti Super) el modelo completo no cabe con holgura y requeriria offloading parcial a CPU.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090). En 16 GB es posible con offloading parcial a RAM del sistema, a costa de velocidad.
- Opciones de despliegue: llama.cpp (CLI y llama-server), Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag del repositorio incluye endpoints_compatible, lo que sugiere compatibilidad con endpoints de inferencia gestionados que acepten GGUF. El soporte de vLLM para GGUF es limitado y no se confirma en este repositorio.
- Latencia y throughput estimados: no disponible. Dependen de la GPU, del contexto configurado y del reparto de capas entre CPU y GPU.
- Ejemplo de invocacion documentado por el autor: `llama-cli --hf-repo SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q3_K_M-GGUF --hf-file suri-qwen-3.8-27b-uncensored-q3_k_m.gguf -p "..."` y `llama-server ... -c 2048`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suri-Qwen-3.8-27B-Uncensored-Q3_K_M-GGUF | 26,9 B | no disponible | no disponible | no disponible | GGUF en HuggingFace (0 descargas, 0 likes) |
| Suri-Qwen-3.8-27B-Uncensored (base, sin cuantizar) | 26,9 B | no disponible | no disponible | no disponible | safetensors en HuggingFace |
| Qwen2.5-32B-Instruct (referencia de tamano similar) | aprox. 32,5 B | 131.072 tokens | publicado por el autor del modelo | Apache 2.0 | ampliamente distribuido |
| Gemma 2 27B (referencia de tamano similar) | 27 B | 8.192 tokens | publicado por el autor del modelo | Terminos de uso de Gemma | ampliamente distribuido |

Nota: los datos de las filas de referencia (Qwen2.5-32B-Instruct y Gemma 2 27B) provienen de sus respectivas model cards publicas y se incluyen unicamente como contexto de categoria; no se dispone de ninguna evaluacion del modelo Suri que permita comparar rendimiento de forma directa. La comparacion es, por tanto, estructural (tamano, contexto declarado, licencia), no de calidad.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card es la generada automaticamente por el flujo GGUF-my-repo y solo explica como ejecutar llama.cpp. No hay informacion sobre arquitectura, entrenamiento, contexto ni tokenizer.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. Ademas, al derivar de un modelo base de licencia desconocida, podrian aplicarse restricciones heredadas que no se documentan.
- Modelo "uncensored": implica con alta probabilidad una reduccion deliberada de los mecanismos de rechazo. Esto incrementa el riesgo de generar contenido nocivo, ilegal, sesgado o inexacto sin advertencia, y lo hace inadecuado para aplicaciones orientadas al usuario final sin capas de moderacion externas.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual. En un modelo de ~27B cuantizado a Q3_K_M el riesgo es mayor que en el modelo original en precision completa.
- Perdida de calidad por cuantizacion: Q3_K_M es una cuantizacion agresiva (aproximadamente 3 bits por peso). Suele degradar tareas sensibles como matematicas, codigo y razonamiento largo en comparacion con Q4_K_M, Q5_K_M o Q8_0.
- Sin datos de contexto ni idiomas: no se puede garantizar el comportamiento en ventanas largas ni el soporte de castellano u otros idiomas.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia externa de que el modelo funcione correctamente ni de que el proceso de conversion haya preservado la calidad.
- Fecha de creacion atipica (2026-09-24) y actualizacion un minuto despues de la creacion, lo que sugiere una publicacion automatica sin curacion posterior.
- Para produccion: sin licencia, sin benchmarks y sin mantenimiento declarado, no es recomendable desplegarlo en entornos productivos sin una evaluacion propia exhaustiva y una revision legal previa.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q3_K_M-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
