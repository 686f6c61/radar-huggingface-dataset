# woozlit/panko

## Resumen

panko es un modelo de generacion de texto publicado en HuggingFace por el usuario woozlit bajo el identificador `woozlit/panko`. Se distribuye con licencia Apache 2.0, en formato safetensors y con la etiqueta de pipeline `text-generation`, ademas de la etiqueta `conversational`. El unico dato cuantitativo verificable es el recuento de parametros obtenido de los tensores: 1.777.088.000 parametros (aproximadamente 1,78 mil millones), lo que situa al modelo en el segmento de pequenos modelos desplegables en hardware de consumo.

La relevancia de esta ficha es limitada y conviene ser explicito: la model card publicada no contiene nada mas que el bloque de metadatos YAML con la licencia y las etiquetas. No hay descripcion, no hay informacion sobre datos de entrenamiento, no hay resultados de benchmarks y no se declaran idiomas soportados. El repositorio ocupa 3,6 GB, un tamano coherente con pesos en precision fp16 para 1,78 mil millones de parametros (unos 3,56 GB solo de pesos), lo que sugiere que no se han subido cuantizaciones GGUF ni versiones de menor precision.

Por tanto, se trata de un modelo practicamente indocumentado, con 40 descargas y 0 likes en el momento de la consulta, y sin validacion externa conocida. Esta ficha recoge lo que se puede afirmar con certeza y marca explicitamente como "no disponible" todo lo demas, incluyendo arquitectura, contexto y comportamiento esperado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los pesos safetensors y la pipeline `text-generation` apuntan a un transformer decoder-only, sin confirmar por el autor) |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | No aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors (3,6 GB), sin GGUF ni variantes cuantizadas publicadas |
| Idiomas soportados | No disponible (la metadata de HuggingFace no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El autor no documenta si se trata de un transformer denso, un modelo con atencion lineal, una mezcla de expertos o una arquitectura hibrida. La combinacion de pesos en safetensors, la pipeline declarada (`text-generation`) y el recuento de 1,78 B de parametros es compatible con un transformer decoder-only de escala pequena, pero es una inferencia, no un dato confirmado.

Tampoco hay informacion sobre el proceso de entrenamiento: no consta el numero de tokens, la composicion del corpus, si hubo ajuste supervisado, RLHF, DPO u otra etapa de alineamiento, ni si el modelo parte de un preentrenamiento desde cero o de un fine-tuning sobre una base existente. La etiqueta `panko`, que da nombre al modelo, no viene acompanada de ninguna explicacion del autor. Cualquier afirmacion sobre innovaciones tecnicas (decodificacion especulativa, atencion linear, modos de razonamiento) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad confirmada por la metadata del repositorio (`text-generation`).
- Uso conversacional: la etiqueta `conversational` sugiere que el modelo esta pensado para dialogos multi-turno, aunque no se documenta el formato de prompt ni las plantillas de chat.
- Tool calling / function calling: no disponible; no consta soporte ni formato definido.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en la metadata.
- Vision, audio u otras modalidades: no disponible; el repositorio solo contiene pesos de lenguaje.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

Dado que no existe documentacion, los casos siguientes son escenarios plausibles para un modelo denso de 1,78 B de parametros con licencia Apache 2.0, no capacidades verificadas. Requieren evaluacion previa en el dominio concreto antes de cualquier uso en produccion.

- Prototipado rapido en local: al ocupar unos 3,6 GB en fp16, el modelo se puede cargar en una GPU de consumo o incluso en CPU con cuantizacion posterior, lo que permite iterar sobre prompts y plantillas sin coste de API.
- Fine-tuning especifico de dominio: con 1,78 B de parametros y licencia Apache 2.0, es un candidato razonable para ajuste supervisado (por ejemplo, clasificacion de tickets o extraccion de entidades) en una unica GPU de 24 GB usando LoRA.
- Generacion de texto asistida en herramientas internas: resumenes de documentos cortos o reescritura de parrafos en aplicaciones de escritorio, siempre que la longitud de contexto (no documentada) sea suficiente; debe medirse empiricamente.
- Chatbot de bajo coste para entornos con requisitos de soberania del dato: al poder ejecutarse on-premise, evita enviar informacion a APIs externas.
- Base para experimentacion academica: modelo pequeno y con licencia permisiva para estudiar efectos de tecnicas de alineamiento o de cuantizacion, comparandolo con bases documentadas del mismo tamano.
- Filtrado y clasificacion por generacion: uso como generador de etiquetas o de respuestas cortas en pipelines de preprocesamiento, con validacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion en la model card, y no se han encontrado evaluaciones independientes en la busqueda realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento de parametros, no medida): aproximadamente 3,6 GB para los pesos en fp16, mas la cache KV, que depende de la longitud de contexto y del numero de secuencias concurrentes (no documentados).
- En cuantizacion de 8 bits: alrededor de 1,9 GB de pesos; en 4 bits, alrededor de 1,1 GB. Estas conversiones no estan publicadas en el repositorio y habria que generarlas.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070) para fp16 con contexto moderado; RTX 4090, A10, L4 o A100 para servir varias peticiones concurrentes con contexto largo.
- Cabe en GPU de consumo: si, con holgura en tarjetas de 8-12 GB en fp16, y en tarjetas de 6 GB si se cuantiza.
- Opciones de despliegue: HuggingFace Transformers como via directa; vLLM o TGI para servidor con batching continuo, siempre que la arquitectura sea compatible (no confirmado); llama.cpp u Ollama requieren convertir previamente los pesos a GGUF, conversion que no esta disponible en el repositorio.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas ni datos de contexto que permitan modelar la cache KV.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus fichas publicas; los de panko son, en su mayoria, no disponibles.

| Modelo | Parametros | Contexto | Licencia | Documentacion y benchmarks |
|---|---|---|---|---|
| woozlit/panko | 1,78 B | No disponible | Apache 2.0 | Sin model card, sin benchmarks, 40 descargas |
| Llama 3.2 1B | 1,24 B | 128 000 tokens | Licencia comunitaria Llama 3.2 | Model card completa y evaluaciones publicadas |
| Qwen2.5-1.5B | 1,54 B | 32 768 tokens nativos | Apache 2.0 | Model card completa y evaluaciones publicadas |
| SmolLM2-1.7B | 1,71 B | 8 192 tokens | Apache 2.0 | Model card completa y evaluaciones publicadas |

La comparacion relevante no es de rendimiento, ya que no hay datos de panko, sino de trazabilidad: los tres alternativas documentan arquitectura, datos de entrenamiento y resultados, mientras que panko no ofrece ninguno de esos elementos. En igualdad de licencia permisiva, SmolLM2-1.7B y Qwen2.5-1.5B son opciones con menor riesgo para produccion.

## Limitaciones y advertencias

- Ausencia total de model card: no se puede verificar el origen de los datos de entrenamiento, lo que impide evaluar riesgos de contaminacion, copyright o sesgos.
- Sesgos conocidos: no disponible; al desconocerse el corpus, no se puede caracterizar el comportamiento del modelo ante sesgos de genero, etnicos, politicos o linguisticos.
- Riesgo de alucinacion: no cuantificado y probablemente alto en un modelo de 1,78 B sin documentacion sobre etapas de alineamiento; no debe usarse en tareas factuales sin verificacion.
- Idiomas: no declarados. No hay garantia de calidad en castellano ni en ningun otro idioma; hay que evaluarlo empiricamente antes de asumir competencia multilingue.
- Longitud de contexto desconocida: impide disenar aplicaciones con requisitos de contexto largo y hace imposible dimensionar la cache KV en produccion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y el licenciante no asume responsabilidad sobre el contenido generado.
- Falta de validacion de la comunidad: 0 likes y 40 descargas en el momento de la consulta; no hay issues, discusiones ni reportes independientes.
- Fecha de creacion atipica en la metadata (19 de octubre de 2026) y actualizacion tres minutos despues, lo que sugiere una subida automatizada o de prueba sin curacion posterior.
- Recomendacion: no desplegar en produccion sin una bateria propia de evaluacion y sin fijar la revision concreta del repositorio (commit hash) para garantizar reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/woozlit/panko
- No se han encontrado enlaces adicionales relevantes (paper, blog, repositorio de codigo o demo) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
