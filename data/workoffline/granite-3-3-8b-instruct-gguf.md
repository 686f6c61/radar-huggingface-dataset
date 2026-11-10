# WorkOffline/granite-3.3-8b-instruct-GGUF

## Resumen

WorkOffline/granite-3.3-8b-instruct-GGUF es un espejo (mirror) no modificado de los ficheros GGUF del modelo Granite 3.3 8B Instruct de IBM, publicado por el usuario WorkOffline para que la aplicacion WorkOffline pueda descargar los pesos desde un unico punto, fijados a una revision concreta y verificados mediante SHA-256. No se trata de un modelo nuevo ni de una cuantizacion propia: los bytes son identicos a los del repositorio oficial `ibm-granite/granite-3.3-8b-instruct-GGUF`, y todo el merito del modelo corresponde a IBM.

El modelo subyacente es un transformer decoder-only de 8.170.864.640 parametros (aproximadamente 8,17 mil millones), afinado para instrucciones y conversacion, con licencia Apache 2.0. Este repositorio concreto solo aloja el fichero `granite-3.3-8b-instruct-Q4_K_M.gguf`, una cuantizacion de 4 bits en formato K-quant M de aproximadamente 4,94 GB, adecuada para inferencia en CPU y GPU de consumo mediante llama.cpp y motores compatibles con GGUF.

La relevancia de esta ficha es doble: por un lado, documenta el modelo Granite 3.3 8B Instruct tal como se distribuye en este espejo; por otro, advierte de que la informacion disponible aqui es limitada (la model card del espejo no incluye especificaciones tecnicas detalladas, idiomas, benchmarks ni datos de entrenamiento), por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer decoder-only de la familia Granite 3.3 de IBM; no detallado en la informacion proporcionada) |
| Parametros totales | 8.170.864.640 (dato de safetensors del modelo base) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero incluido en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `granite-3.3-8b-instruct-Q4_K_M.gguf`, 4.942.873.344 bytes) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base `ibm-granite/granite-3.3-8b-instruct`. Se sabe que es un modelo de 8,17 mil millones de parametros, afinado para instrucciones (sufijo `instruct`) y con etiqueta `conversational`, lo que indica un ajuste orientado a dialogos multi-turno. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas especificas.

Respecto a este repositorio en concreto, no hay entrenamiento ni conversion: es una copia byte a byte del fichero GGUF oficial, con nombre potencialmente distinto y verificacion SHA-256 (`77bcee066a76dcdd10d0d123c87e32c8ec2c74e31b6ffd87ebee49c9ac215dca`). La revision upstream fijada es `e40e9dd739c7be00fa965c16ce167088190ce114`.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Seguimiento de instrucciones (modelo `instruct`).
- Inferencia local en CPU y GPU mediante motores compatibles con GGUF.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso a traves de APIs compatibles con el formato.
- Capacidades de codigo, matematicas, tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: el fichero Q4_K_M de ~4,94 GB permite ejecutar el modelo en CPU con llama.cpp u Ollama, con requisitos de memoria moderados (en torno a 6-8 GB de RAM para el modelo y el contexto).
- Aplicaciones de escritorio con modo offline: el proposito declarado del espejo es que la app WorkOffline descargue los pesos desde un unico origen fijado y verificado, lo que encaja en productos que necesitan reproducibilidad de artefactos y funcionamiento sin conexion.
- Asistentes conversacionales integrados en herramientas de desarrollo: al ser un modelo instruct de ~8B con licencia Apache 2.0, puede incorporarse en IDE o CLI para tareas de ayuda conversacional, siempre que se valide su calidad en codigo con pruebas propias (no hay benchmarks disponibles aqui).
- Prototipado rapido de chatbots: la cuantizacion Q4_K_M reduce el coste de iteracion y permite levantar un servidor de inferencia local en minutos con llama.cpp server u Ollama.
- Pipelines de CI con verificacion de integridad: el repositorio documenta SHA-256 y revision upstream, lo que permite usar el fichero como artefacto reproducible en pruebas automatizadas que necesiten un LLM local determinista en cuanto a pesos.
- Educacion e investigacion: entorno controlado para estudiar comportamiento de modelos instruct de ~8B en cuantizacion 4 bits sin depender de servicios en la nube.
- Evaluacion comparativa de cuantizaciones: util como punto de partida Q4_K_M para medir degradacion frente a pesos completos en tareas concretas del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q4_K_M ocupa 4.942.873.344 bytes (~4,94 GB); para inferencia hay que sumar overhead de contexto y runtime, por lo que se recomienda al menos 6-8 GB de memoria disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el fichero puede cargarse en GPUs de consumo con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070), aunque esta afirmacion es una estimacion basada en el tamano del fichero, no un dato oficial.
- Cabe en GPU de consumo: si, segun el tamano del fichero, en tarjetas con 8 GB o mas; en tarjetas con menos memoria puede ejecutarse parcialmente offloaded o en CPU.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere integracion con servidores de endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible aqui | Notas |
|---|---|---|---|---|---|
| WorkOffline/granite-3.3-8b-instruct-GGUF (este) | 8,17 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Espejo no modificado del GGUF oficial de IBM |
| ibm-granite/granite-3.3-8b-instruct | 8,17 B | no disponible | Apache 2.0 | safetensors (modelo base) | Repositorio original de IBM |
| ibm-granite/granite-3.3-8b-instruct-GGUF | 8,17 B | no disponible | Apache 2.0 | GGUF (varias cuantizaciones) | Fuente upstream del fichero de este repositorio |

No se dispone de datos de rendimiento ni de contexto para comparar con alternativas de otros fabricantes; la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- La model card de este repositorio no aporta especificaciones tecnicas, idiomas, benchmarks ni detalles de entrenamiento; cualquier evaluacion debe hacerse contra el repositorio original de IBM.
- Al ser un espejo de terceros, la confianza depende de la verificacion SHA-256 documentada; conviene comprobar el hash tras la descarga y, en produccion, preferir el repositorio oficial de `ibm-granite`.
- Solo se distribuye la cuantizacion Q4_K_M; no hay otras cuantizaciones en este repositorio, lo que limita el ajuste fino de memoria/calidad.
- La cuantizacion a 4 bits puede degradar ligeramente la calidad frente a los pesos completos; no hay datos en la informacion proporcionada que cuantifiquen esa perdida.
- Riesgo de alucinacion y sesgos: inherente a los modelos de lenguaje; no se documentan sesgos conocidos en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribuir correctamente a IBM y a los autores de la conversion GGUF.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad; no debe tomarse como garantia de calidad.
- No se dispone de informacion sobre longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos sin verificacion previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WorkOffline/granite-3.3-8b-instruct-GGUF
- Modelo base original: https://huggingface.co/ibm-granite/granite-3.3-8b-instruct
- GGUF oficial upstream: https://huggingface.co/ibm-granite/granite-3.3-8b-instruct-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
