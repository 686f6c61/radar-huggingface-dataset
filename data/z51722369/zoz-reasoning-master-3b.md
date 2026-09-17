# z51722369/ZOZ-Reasoning-Master-3B

## Resumen

ZOZ-Reasoning-Master-3B es un modelo de lenguaje de 3.085.938.688 parametros (3,09 B) desarrollado por ZOZ AI / Ziad Khodr bajo licencia Apache 2.0. Se trata de un ajuste fino derivado de Qwen2.5-3B-Instruct a traves de una cadena de tres etapas incrementales, y esta disenado explicitamente para funcionar como agente autonomo en el borde (edge agent): prioriza el cumplimiento estricto de esquemas de tool calling, la recuperacion de informacion en contextos largos y el razonamiento multi-turno estructurado.

El modelo parte de z51722369/ZOZ-Function-Master-3B-LongContext (a su vez derivado de Qwen2.5-3B) y se distribuye con pesos fusionados en FP16 sin cuantizar, en formato safetensors compatibles con transformers. La ventana de contexto nativa es de 32.768 tokens, aunque el autor indica que el entrenamiento y la optimizacion se realizaron hasta 4.096 tokens. Soporta ingles y arabe, y emplea la plantilla de prompt ChatML (`<|im_start|>` / `<|im_end|>`).

Su relevancia actual reside en la combinacion de tres capacidades poco frecuentes en la clase de 3 B: function calling con sintaxis JSON estricta, needle-in-a-haystack sobre contextos largos y chain-of-thought conversacional destilado de modelos frontera. El repositorio no registra descargas ni likes en el momento de la consulta y no incluye resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2.5-3B) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos; entrenado y optimizado hasta 4.096 tokens |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas; pesos fusionados en FP16. Compatible con cuantizacion posterior (INT8, INT4/NF4, GGUF) mediante herramientas externas |
| Idiomas soportados | Ingles (en) y arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16 fusionado); repositorio de 6,2 GB |
| Plantilla de prompt | ChatML (`<|im_start|>` / `<|im_end|>`) |
| Libreria | transformers; etiquetado como compatible con text-generation-inference y endpoints |
| Modelo base | z51722369/ZOZ-Function-Master-3B-LongContext (raiz: Qwen2.5-3B-Instruct) |
| Fecha de publicacion | 17 de septiembre de 2026 (creacion); actualizado el 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B: un transformer causal decoder-only con atencion por grupos (GQA) y las innovaciones habituales de la familia Qwen2.5. El ajuste se realizo mediante un protocolo secuencial de tres etapas disenado para evitar el olvido catastrofico, encadenando habilidades en lugar de entrenarlas simultaneamente:

- **Etapa 1, uso de herramientas y disciplina de esquema.** Ajuste sobre NousResearch/hermes-function-calling-v1, con aproximadamente 15.000 muestras, learning rate 2e-4, tamano de batch efectivo 8 y un tiempo de computo de aproximadamente 1,5 horas. Partiendo de Qwen2.5-3B-Instruct se obtiene ZOZ-Function-Master-3B, cuyo objetivo declarado es imponer sintaxis JSON estricta y eliminar la alucinacion de parametros.
- **Etapa 2, razonamiento en contexto y recuperacion larga.** Entrenamiento sobre tareas duras de zai-org/LongBench-v2, partiendo de ZOZ-Function-Master-3B, para mitigar el fenomeno *lost-in-the-middle* y habilitar la extraccion de informacion tipo needle-in-a-haystack. El resultado intermedio es ZOZ-Function-Master-3B-LongContext.
- **Etapa 3, alineacion conversacional con CoT.** Alineacion con un subconjunto curado de Magpie-Align/Magpie-Pro-300K-Filtered, que aporta chain-of-thought limpio destilado de modelos frontera (se menciona Llama-3.1-70B en la model card) sin degradar la precision del tool calling.

La infraestructura de entrenamiento declarada es de 2 GPU NVIDIA T4. La model card proporcionada esta truncada en la tabla de hiperparametros, por lo que los datos de learning rate, tamano de muestra y tiempo de pared de las etapas 2 y 3 no estan disponibles en la informacion consultada. No se menciona el uso de RLHF, DPO u otras tecnicas de preferencia mas alla de la alineacion por SFT sobre Magpie-Pro. Tampoco se detalla el numero total de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de texto y chat conversacional multi-turno en ingles y arabe.
- Razonamiento estructurado con chain-of-thought (CoT) conversacional, alineado para producir trazas de razonamiento antes de la respuesta final.
- Function calling y tool use con salida JSON conforme a esquema; el formato esperado segun la model card es `<tool_call> {"name": ..., "arguments": {...}} </tool_call>`.
- Razonamiento agentico multi-paso con acceso a herramientas externas declaradas en el mensaje de sistema.
- Recuperacion en contexto largo (needle-in-a-haystack) y extraccion de datos en ventanas extensas sin degradacion declarada, gracias a la etapa 2 de entrenamiento.
- Razonamiento multi-hop sobre documentos largos para tareas tipo LongBench-v2.
- Soporte de system prompt para definir rol, herramientas y restricciones del agente.
- No se declaran capacidades de vision, audio ni modalidades adicionales.
- No se declara un modo "thinking" explicito con tokens de control dedicados; el razonamiento se induce via prompt y alineacion CoT.

## Casos de uso

- **Agente de operaciones con acceso a bases de datos.** El modelo puede recibir un esquema de herramientas con funciones como `query_database` y emitir llamadas con clausulas SQL bien formadas, lo que permite construir asistentes que consultan tablas de telemetria o auditoria y devuelven resultados filtrados sin intervencion manual.
- **Automatizacion de atencion al cliente en varios turnos.** Con 32.768 tokens de contexto nativo puede mantener el historial completo de una conversacion larga y el catalogo de herramientas disponibles, resolviendo consultas que requieren encadenar varias llamadas a API antes de responder.
- **Extraccion de informacion de documentacion extensa.** La etapa de long-context lo hace adecuado para localizar datos concretos (importes, clausulas, identificadores) dentro de contratos, informes o expedientes de decenas de miles de tokens, mitigando el *lost-in-the-middle*.
- **Orquestador de agentes en pipelines de CI/CD.** Puede integrarse como paso de validacion o de generacion de parches: recibe el estado del repositorio como contexto y emite llamadas estructuradas a herramientas de build, test o despliegue.
- **Asistente de analisis tecnico en modo local.** Con 3,09 B de parametros en FP16 ocupa unos 6 GB, por lo que puede ejecutarse en una estacion de trabajo con GPU de gama alta sin conexion a servicios en la nube, algo relevante para entornos con requisitos de confidencialidad.
- **Despliegue en el borde o en dispositivos con recursos limitados.** Al ser un modelo compacto cabe en GPUs de consumo (12-24 GB) y, tras cuantizacion a INT4, en equipos con 4-8 GB de VRAM, habilitando agentes locales en kioscos, estaciones industriales o portatiles.
- **Soporte bilingue ingles-arabe.** Puede utilizarse en flujos de atencion o clasificacion donde se mezclan ambos idiomas, con la salvedad de que no se han publicado evaluaciones multilingues.
- **Generacion de trazas de razonamiento para auditoria.** Su alineacion CoT permite obtener explicaciones paso a paso antes de la respuesta, utiles en sistemas donde se requiere justificar la decision tomada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los conjuntos de entrenamiento (Hermes function calling, LongBench-v2 y Magpie-Pro-300K-Filtered) pero no incluye puntuaciones de evaluacion, comparaciones numericas ni mediciones de latencia o throughput. Las insignias del repositorio anuncian las capacidades (Hermes Function Calling, LongBench-v2 In-Context Reasoning, Magpie-Pro Conversational Alignment) sin aportar cifras.

## Requisitos de hardware

- **Pesos en FP16 (formato distribuido):** aproximadamente 6,2 GB de pesos, lo que implica del orden de 7-8 GB de VRAM contando cache KV y overhead del runtime.
- **Cuantizacion INT8:** en torno a 3,1 GB de pesos; viable en GPUs de 6-8 GB de VRAM.
- **Cuantizacion INT4/NF4:** en torno a 2 GB de pesos; permite ejecucion en GPUs de 4-6 GB de VRAM y, potencialmente, en hardware de gama baja.
- **GPU recomendadas:** el autor entreno sobre 2 x NVIDIA T4 (16 GB cada una). Para inferencia son suficientes una RTX 3060 de 12 GB, RTX 4070/4080, RTX 4090 o cualquier GPU profesional (A10, L4, A100, H100) con al menos 8 GB de VRAM en FP16.
- **Cabe en GPU de consumo:** si. En FP16 en tarjetas de 12 GB o mas; en INT4 en tarjetas de 6-8 GB.
- **Opciones de despliegue:** transformers (ejemplo oficial en la model card), text-generation-inference (etiqueta `text-generation-inference`) y cualquier runtime compatible con safetensors. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- **Latencia y throughput:** no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de rendimiento de este modelo no estan publicados, por lo que la comparacion se limita a caracteristicas verificables de arquitectura y licencia. Las cifras de los modelos alternativos proceden de su documentacion publica y no se han contrastado en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Orientacion principal |
|---|---|---|---|---|
| ZOZ-Reasoning-Master-3B | 3,09 B | 32.768 tokens nativos (optimizado hasta 4.096) | Apache 2.0 | Tool calling, contexto largo, CoT conversacional |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | Asistente generalista e instruct |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Asistente generalista, recuperacion de informacion |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Razonamiento y codigo en modelo compacto |

Rendimiento comparado en MMLU, HumanEval, GSM8K o pruebas de function calling: no disponible.

## Limitaciones y advertencias

- No se han publicado evaluaciones independientes ni benchmarks, por lo que el rendimiento real de las capacidades anunciadas no esta verificado.
- La ventana declarada de 32.768 tokens debe tomarse con cautela: el autor indica que el entrenamiento y la optimizacion se hicieron hasta 4.096 tokens, de modo que el rendimiento puede degradarse mas alla de esa longitud.
- El modelo solo declara soporte de ingles y arabe; no hay datos sobre su comportamiento en castellano u otros idiomas.
- Riesgo de alucinacion inherente a un modelo de 3 B, especialmente en tareas de razonamiento profundo o conocimiento factual. La etapa 3 destila CoT de un modelo mayor, lo que puede trasladar errores del profesor.
- El ajuste por etapas sobre datasets especificos puede estrechar el dominio: el modelo esta optimizado para agentes y tool calling, no para generacion creativa o prosa generalista.
- Al ser un ajuste de Qwen2.5-3B-Instruct, hereda los sesgos de los datos de preentrenamiento del modelo base, no documentados en esta model card.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales de licencia, pero el desarrollador no ofrece garantias ni soporte.
- Repositorio sin descargas ni likes registrados en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Para despliegue en llama.cpp u Ollama hay que generar los GGUF por cuenta propia, con el riesgo de perdida de calidad que ello conlleva.
- La model card esta truncada en la seccion de hiperparametros, por lo que parte de la informacion de entrenamiento (etapas 2 y 3) no puede verificarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/z51722369/ZOZ-Reasoning-Master-3B
- Modelo base directo: https://huggingface.co/z51722369/ZOZ-Function-Master-3B-LongContext
- Dataset de la etapa 1 (function calling): https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset de la etapa 2 (long context): https://huggingface.co/datasets/zai-org/LongBench-v2
- Dataset de la etapa 3 (alineacion conversacional): https://huggingface.co/datasets/Magpie-Align/Magpie-Pro-300K-Filtered
- Modelo raiz de la cadena: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a normativa universitaria alemana y no guardan relacion con el contenido de esta ficha.
