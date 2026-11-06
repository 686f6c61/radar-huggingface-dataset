# WorkOffline/Qwen3-4B-Instruct-2507-GGUF

## Resumen

Qwen3-4B-Instruct-2507 es un modelo de lenguaje de 4.022 millones de parametros (4B) desarrollado por Qwen (Alibaba), publicado bajo licencia Apache-2.0. Se trata de la version instruct de la familia Qwen3, correspondiente a la revision de julio de 2025 (2507), disenada para generacion de texto conversacional, razonamiento y tareas de instrucciones. El repositorio aqui descrito no es el modelo original, sino un espejo GGUF creado por el usuario WorkOffline para que su aplicacion homonima pueda descargar los pesos desde un unico punto, fijado a una revision exacta y verificado mediante SHA-256.

El modelo base es un transformer denso (no MoE) de 4B parametros con licencia permisiva, lo que lo hace atractivo para despliegue en hardware de consumo y para integracion en aplicaciones de escritorio o edge. La version GGUF incluida en este repositorio es una copia byte a byte de la cuantizacion Q4_K_M publicada por unsloth, con un tamano de 2.497.281.120 bytes (aproximadamente 2,5 GB), lo que permite su ejecucion en GPUs consumer con 6-8 GB de VRAM o incluso en CPU mediante llama.cpp.

La relevancia de esta ficha radica en que documenta un artefacto de distribucion (un mirror GGUF) mas que un modelo nuevo: el interes tecnico esta en la trazabilidad de la cuantizacion, la verificacion criptografica y la idoneidad del Qwen3-4B-Instruct-2507 como modelo local de proposito general. No se dispone de informacion sobre la longitud de contexto, idiomas o datos de entrenamiento en la documentacion proporcionada, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (incluida en este repo, 2,5 GB); otras cuantizaciones disponibles en repositorios upstream (bartowski, unsloth) segun busqueda web |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo base Qwen3-4B-Instruct-2507 (numero de capas, dimensiones de atencion, tipo de atencion, etc.). Se sabe que pertenece a la familia Qwen3 de Qwen y que es un modelo denso de 4B parametros, no un Mixture of Experts. El repositorio aqui documentado no contiene pesos en safetensors sino una unica cuantizacion GGUF Q4_K_M, generada por unsloth a partir del modelo original y copiada sin modificaciones.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO o innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato tecnico verificable del artefacto es su integridad: el archivo `Qwen3-4B-Instruct-2507-Q4_K_M.gguf` tiene 2.497.281.120 bytes y un SHA-256 de `3605803b982cb64aead44f6c1b2ae36e3acdb41d8e46c8a94c6533bc4c67e597`, idéntico al publicado por unsloth en la revision `a06e946bb6b655725eafa393f4a9745d460374c9`.

## Capacidades

- Generacion de texto conversacional e instrucciones de proposito general (modelo etiquetado como `conversational` y `text-generation`).
- Razonamiento y respuesta a preguntas en formato instruct.
- Capacidad de ejecucion local en CPU y GPU gracias al formato GGUF y a la cuantizacion Q4_K_M.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio), lo que sugiere integracion con APIs de inferencia.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en aplicaciones de escritorio: el modelo puede ejecutarse con llama.cpp u Ollama en un equipo con 8 GB de RAM/VRAM, gestionando conversaciones multi-turno sin depender de la nube. Es adecuado por su tamano de 4B y su licencia Apache-2.0.
- Prototipado rapido de chatbots: gracias a la cuantizacion Q4_K_M de 2,5 GB, se puede desplegar en una estacion de trabajo para validar flujos conversacionales antes de escalar a modelos mayores.
- Generacion de texto y resumen en pipelines offline: el mirror esta pensado para descargas verificadas por SHA-256, lo que encaja en entornos con requisitos de reproducibilidad (por ejemplo, CI que descarga artefactos fijados a una revision).
- Educacion e investigacion: modelo ligero para experimentos de prompting, evaluacion de tecnicas de cuantizacion o comparativas de rendimiento en hardware consumer.
- Integracion en aplicaciones de escritorio tipo WorkOffline: el propio autor mantiene el repositorio para que su app descargue los pesos desde un unico punto con verificacion criptografica.
- Despliegue en edge o entornos con GPU limitada: al caber en GPUs consumer de 6-8 GB, puede usarse para tareas de generacion de texto en local sin infraestructura dedicada.
- Base para fine-tuning o destilacion: al ser Apache-2.0 y de 4B parametros, sirve como punto de partida para ajustes especificos de dominio, aunque para ello conviene usar los pesos safetensors originales en lugar del GGUF cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con la cuantizacion Q4_K_M incluida (archivo de 2,5 GB mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100); el modelo es sobredimensionado para GPUs de datacenter, que lo ejecutaran con holgura.
- Cabe en GPU consumer: si, en tarjetas con 6-8 GB de VRAM; tambien puede ejecutarse en CPU con llama.cpp, aunque con menor throughput.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla cuales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (este, via mirror GGUF) | 4B | no disponible | Apache-2.0 | GGUF Q4_K_M | Hugging Face (mirror WorkOffline y upstream) |
| Qwen3-4B-Instruct-2507 (original) | 4B | no disponible | Apache-2.0 | safetensors | Hugging Face (Qwen) |
| Qwen3-4B-Instruct-2507-GGUF (unsloth) | 4B | no disponible | Apache-2.0 | GGUF (multiples cuantizaciones) | Hugging Face (unsloth) |
| Qwen3-4B-Instruct-2507-GGUF (bartowski) | 4B | no disponible | Apache-2.0 | GGUF (imatrix) | Hugging Face (bartowski) |

No se dispone de datos de rendimiento comparativo ni de especificaciones de contexto para establecer una comparativa cuantitativa con modelos de otros desarrolladores. Las alternativas listadas son variantes de distribucion del mismo modelo base.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: no lo mantiene Qwen ni unsloth, sino el usuario WorkOffline. La responsabilidad de integridad recae en la verificacion SHA-256 documentada.
- Solo se incluye una cuantizacion (Q4_K_M); si se necesita mayor precision (Q5, Q6, Q8) o menor tamano (Q2, Q3), hay que acudir a los repositorios upstream de unsloth o bartowski.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales en safetensors; para evaluaciones de referencia conviene usar el modelo base sin cuantizar.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o idioma del modelo base en la documentacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el uso de los archivos queda sujeto a la licencia original de Qwen; se recomienda revisar el archivo `LICENSE` copiado en el repositorio.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica que es un artefacto reciente y sin validacion comunitaria.
- No se detallan los idiomas soportados; para aplicaciones en castellano conviene validar el comportamiento empiricamente antes de produccion.

## Enlaces

- Repositorio del mirror: https://huggingface.co/WorkOffline/Qwen3-4B-Instruct-2507-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- GGUF upstream (unsloth): https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- GGUF alternativo (bartowski): https://huggingface.co/bartowski/Qwen_Qwen3-4B-Instruct-2507-GGUF
- Licencia original: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/cdbee75f17c01a7cc42f958dc650907174af0554/LICENSE
