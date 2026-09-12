# sshalimov04/ru-legal-rag-edge-0.6b-onnx

## Resumen

ru-legal-rag-edge-0.6b-onnx es la version exportada a ONNX del modelo sshalimov04/ru-legal-rag-edge-0.6b, un generador de texto de unos 600 millones de parametros de la familia Qwen3, afinado para tareas de generacion aumentada por recuperacion (RAG) sobre documentacion juridica en ruso. Lo publica el usuario sshalimov04 bajo licencia Apache 2.0 y su proposito es claro: responder preguntas apoyandose exclusivamente en los documentos aportados en el contexto y abstenerse de responder cuando la informacion no aparece en ellos.

La relevancia del artefacto no esta en el modelo en si, sino en el formato. Se trata de una exportacion realizada con `optimum-cli` para la tarea `text-generation-with-past`, en precision fp16, opset 17 y un unico fichero de 1,31 GB, pensada para ejecutarse con transformers.js y WebGPU directamente en el navegador. El autor documenta explicitamente por que descarto cuantizaciones mas agresivas: con 151 936 tokens de vocabulario y embeddings atados, el ruido en los pesos rompe justo la decision critica entre dar una respuesta con contenido y emitir la frase de absteccion.

El repo tiene un tamano de 1,3 GB, no registra descargas ni likes en el momento de la consulta y la busqueda web no ha devuelto ninguna fuente independiente sobre el (los resultados obtenidos correspondian a temas sin relacion). Por tanto, toda la informacion tecnica disponible procede de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (etiqueta `qwen3`), exportado a ONNX con tarea `text-generation-with-past`, opset 17 |
| Parametros totales | Aproximadamente 0,6 mil millones (segun la denominacion `0.6b` del repositorio) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (unica variante publicada, 1,31 GB en un solo fichero). Se probaron y descartaron: int8 por canal (721 MB) y 4 bits MatMulNBits con bloque 32 (506 MB) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp16), compatible con transformers.js y onnxruntime-web |
| Tamano de vocabulario | 151 936 tokens, con embeddings atados (tied embeddings) |
| Tamano del repositorio | 1,3 GB |
| Modelo base | sshalimov04/ru-legal-rag-edge-0.6b |
| Libreria declarada | transformers.js |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, de aproximadamente 600 millones de parametros y con embeddings atados a una cabeza de vocabulario de 151 936 tokens. El autor no publica en la model card los detalles del entrenamiento: no se indican el numero de tokens, la composicion del corpus juridico, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se declara la longitud de contexto soportada. Toda esa informacion figura como no disponible.

La innovacion reseñable de este repositorio es de ingenieria de despliegue, no de arquitectura. La exportacion se hizo con `optimum-cli` a ONNX en fp16, y el autor documento una comparacion previa con otras precisiones sobre 20 casos juridicos reservados: la variante de 4 bits MatMulNBits (bloque 32, 506 MB) quedo inservible, produciendo texto en chino y repeticiones; la de int8 por canal (721 MB) generaba ruso coherente pero elevaba los rechazos de 8 a 16 sobre 20; la de fp16 (1,31 GB) se quedo en 9 rechazos frente a los 8 del original en bf16. Su explicacion es que, con vocabulario y embeddings atados, el ruido de cuantizacion afecta precisamente a la frontera entre responder y abstenerse.

Ademas, el autor adapto el tokenizador para que funcionase en JavaScript: incrusto `chat_template` dentro de `tokenizer_config.json` (transformers.js no lee `chat_template.jinja`) y normalizo `extra_special_tokens` a formato de diccionario, porque el formato de transformers 5.x rompe tanto transformers 4.x como el tokenizador en JS.

## Capacidades

- Generacion de texto conversacional en ruso, orientada a respuestas cortas y fundamentadas en documentos aportados en el contexto.
- Uso como generador final dentro de un pipeline RAG: recibe fragmentos recuperados y redacta la respuesta.
- Absteccion controlada: cuando la respuesta no esta en los documentos, produce una frase de rechazo del tipo «En los documentos proporcionados no hay respuesta», en lugar de inventarla.
- Ejecucion en navegador mediante WebGPU a traves de transformers.js y onnxruntime-web, sin necesidad de servidor.
- Funcionamiento en CPU como alternativa mediante el backend WASM del runtime ONNX (no cuantificado, con el coste de rendimiento correspondiente).
- Soporte de plantilla de chat (chat template) incrustada, lo que permite conversaciones multi-turno en formato de mensajes.
- Capacidades multilingues: no disponibles. El modelo esta declarado unicamente para ruso y el autor no documenta comportamiento en otros idiomas.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision y audio: no disponibles; no se mencionan en la informacion proporcionada.

## Casos de uso

- Asistente juridico RAG en el navegador: la demo oficial (`sshalimov04/ru-rag-browser`) carga el modelo ONNX en el cliente y responde sobre documentos locales del usuario, de modo que el texto juridico no sale del equipo.
- Consulta de normativa interna en despachos y departamentos legales: el modelo se integra al final de un pipeline de recuperacion sobre el corpus propio de la organizacion y redacta la respuesta citando solo los pasajes recuperados.
- Despliegue en equipos sin GPU dedicada: al ocupar 1,31 GB en fp16 y ejecutarse en WebGPU o WASM, puede correr en portatiles de oficina y en equipos de gama media sin infraestructura de servidor.
- Herramientas internas de escritorio o extension de navegador: un portal de recursos humanos o compliance puede embeber el modelo para resolver dudas sobre politicas internas, respondiendo en el propio dispositivo.
- Enrutado y triaje de consultas legales: gracias a su comportamiento de absteccion, puede usarse como primer filtro que responde lo cubierto por la base documental y escala a un abogado los casos en los que emite la frase de rechazo.
- Generacion de resumenes extractivos sobre contratos o expedientes recuperados, con la ventaja de que su entrenamiento orientado a RAG reduce la probabilidad de introducir clausulas inexistentes.
- Escenarios con requisitos estrictos de privacidad o de residencia del dato: al ejecutarse integramente en el cliente, evita enviar documentacion juridica confidencial a servicios de inferencia externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes en ruso) en la informacion disponible. El autor unicamente aporta una comparacion interna entre variantes de cuantizacion sobre 20 casos juridicos reservados, que se reproduce a continuacion tal cual, sin que constituya un benchmark normalizado:

| Variante | Tamano | Resultado observado |
|---|---|---|
| 4 bits (MatMulNBits, bloque 32) | 506 MB | Roto: aparece texto en chino y repeticiones |
| int8 por canal (MatMul + Gather) | 721 MB | Ruso coherente, pero 16 rechazos de 20 frentes a 8 del original |
| fp16 (publicada) | 1,31 GB | 9 rechazos de 20 frentes a 8 del original; comportamiento preservado |

El criterio medido es el numero de abstecciones sobre 20 casos, no la calidad de la respuesta juridica, por lo que no permite comparar con otros modelos.

## Requisitos de hardware

- Peso en disco: 1,31 GB para el fichero ONNX en fp16; 1,3 GB de repositorio completo.
- VRAM estimada para inferencia: en torno a 1,5-2 GB en fp16, sumando pesos, cache de clave-valor y overhead del runtime (estimacion a partir del tamano de pesos, no confirmada por el autor).
- GPU compatibles: cualquier GPU con soporte de WebGPU (Nvidia, AMD, Intel y Apple Silicon recientes) a traves de onnxruntime-web; en servidor, GPU con ONNX Runtime como T4, L4, A10, RTX 3090/4090, A100 o H100, muy sobredimensionadas para este tamano.
- GPU de consumo: cabe con holgura en cualquier GPU de consumo con 4 GB o mas de VRAM, e incluso comparte memoria con otras aplicaciones en equipos de 8 GB.
- Ejecucion en CPU: posible mediante el backend WASM de onnxruntime-web o onnxruntime en servidor, sin cuantizacion disponible que aligere el computo.
- Opciones de despliegue: transformers.js en navegador (WebGPU/WASM), onnxruntime-web, ONNX Runtime en servidor y el Space de demostracion del autor. vLLM, TGI, llama.cpp y Ollama no cargan este artefacto ONNX directamente; para usarlos habria que partir del modelo base en safetensors o convertir a GGUF, algo que el autor no publica.
- Latencia y throughput: no disponibles. El autor no aporta mediciones de velocidad, ni en navegador ni en servidor.

## Comparativa con modelos similares

No hay datos publicados que permitan comparar este modelo con alternativas de la misma categoria (modelos pequeños de ruso juridico o generadores RAG de menos de mil millones de parametros), por lo que la comparativa con terceros figura como no disponible. La unica comparacion documentada es interna, entre las variantes de precision de este mismo repositorio:

| Variante | Precision | Tamano | Rechazos sobre 20 | Estado |
|---|---|---|---|---|
| sshalimov04/ru-legal-rag-edge-0.6b | bf16 (safetensors, modelo base) | no disponible | 8 | Original de referencia |
| ru-legal-rag-edge-0.6b-onnx | fp16 (ONNX) | 1,31 GB | 9 | Publicada en este repositorio |
| Variante int8 por canal | int8 (ONNX) | 721 MB | 16 | Descartada por el autor |
| Variante 4 bits MatMulNBits | 4 bits, bloque 32 (ONNX) | 506 MB | no aplicable | Descartada: salida rota |

## Limitaciones y advertencias

- Idioma unico: solo ruso. No hay evidencia de funcionamiento correcto en castellano ni en otros idiomas.
- Dominio restringido: esta afinado para RAG juridico; fuera de ese flujo, con documentos no juridicos o sin contexto recuperado, su comportamiento no esta documentado.
- Riesgo de alucinacion: aunque el entrenamiento busca la absteccion, un modelo de 0,6 mil millones de parametros puede generar contenido juridico incorrecto. No debe usarse como asesoramiento legal sin revision humana.
- Sensibilidad a la cuantizacion: el propio autor demuestra que int8 y 4 bits degradan la tasa de absteccion (de 8 a 16 rechazos sobre 20 en int8) o rompen la salida por completo. Cualquier recompresion adicional debe validarse antes de desplegarse.
- Huella de memoria no trivial para su tamano: el vocabulario de 151 936 tokens y los embeddings atados impiden reducir mucho mas el modelo sin perder la funcionalidad principal.
- Ausencia de validacion externa: cero descargas y cero likes, sin benchmarks estandar ni evaluaciones de terceros. La unica metrica disponible es interna, sobre 20 casos, y mide absteccion, no correccion juridica.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime del cumplimiento de la normativa aplicable al tratamiento de datos ni de la responsabilidad profesional en el ambito legal.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (12 de septiembre de 2026) son posteriores a la fecha de consulta, lo que sugiere un error de registro y no debe tomarse como referencia de versionado.
- Sin informacion sobre contexto maximo ni sobre el entrenamiento (tokens, composicion del corpus, alineacion), lo que dificulta estimar el comportamiento en conversaciones largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sshalimov04/ru-legal-rag-edge-0.6b-onnx
- Modelo base: https://huggingface.co/sshalimov04/ru-legal-rag-edge-0.6b
- Demo en navegador: https://huggingface.co/spaces/sshalimov04/ru-rag-browser

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos correspondian a paginas sin relacion (Wikipedia y portales turisticos sobre el estado austriaco de Estiria). No se han localizado papers, blogs tecnicos ni repositorios adicionales asociados al modelo.
