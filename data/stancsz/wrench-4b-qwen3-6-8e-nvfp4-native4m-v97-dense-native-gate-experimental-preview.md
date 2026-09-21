# stancsz/Wrench-4B-Qwen3.6-8E-NVFP4-native4M-v97-dense-native-gate-Experimental-Preview

## Resumen

Wrench-4B-Qwen3.6-8E es un artefacto experimental publicado por el usuario stancsz en HuggingFace, derivado del modelo Qwen3.6-35B-A3B y distribuido en pesos NVFP4 (W4A16) mediante modelopt. No es un modelo de proposito general ni un agente de programacion autonomo: se define como un SLM de ejecucion acotada de herramientas para desarrolladores, cuya funcion es proponer acciones estructuradas o abstenerse, dejando la autoridad final a un verificador independiente y a un fallback a un modelo mas potente (MiniMax). El paquete incluye tokenizer, verificador, toolbelt determinista, politica de contexto y un servidor local que expone una superficie compatible con Ollama.

El dato de tamano es contradictorio y conviene tratarlo con cautela: los safetensors del repositorio suman 2.228.810.368 parametros, mientras que la model card afirma 3.881.244.016 parametros verificados, por debajo de un supuesto techo de 4,25B. El nombre comercial dice "4B", la libreria base declarada (Qwen3.6-35B-A3B) es MoE y la etiqueta del repositorio es qwen3_5_moe, aunque el artefacto se describe como "dense-native". El peso en disco del paquete NVFP4 es de aproximadamente 3,2 GiB y el repositorio ocupa 3,4 GB.

Su relevancia actual es acotada pero clara: explora un patron de inferencia hibrido en el que la ventana de 4M tokens no se resuelve con atencion densa, sino con recepcion del payload completo, MapReduce determinista, extraccion AST/dependencias y ventanas de lookup exactas, compactando el trabajo efectivo a 64K antes de la atencion cara. El propio autor advierte que es un preview experimental no apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.6-35B-A3B; etiqueta de repositorio qwen3_5_moe; el artefacto se describe como dense-native con gate nativo |
| Parametros totales | 2.228.810.368 segun safetensors del repositorio; la model card declara 3.881.244.016 verificados (discrepancia no resuelta) |
| Parametros activos | No disponible de forma explicita para el artefacto; el modelo base declarado, Qwen3.6-35B-A3B, es MoE |
| Longitud de contexto | 4.000.000 tokens declarados via opcion num_ctx=4000000 y gate de contexto; contexto de trabajo efectivo compactado a 64K (rango 32K-64K); atencion densa nativa 2M/4M solo como via opcional de investigacion |
| Tipos de cuantizacion | NVFP4 W4A16 (paquete recomendado); BF16 (paquete de desarrollo, mucho mayor, no recomendado); GGUF mencionado pero requiere adaptadores de arquitectura y no esta verificado |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (NVFP4), con tokenizer, verificador, toolbelt y servidor local incluidos en el paquete |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. Lo que si describe es la procedencia: el artefacto deriva de Qwen3.6-35B-A3B y se distribuye cuantizado a NVFP4 W4A16 con modelopt, con una variante BF16 de desarrollo que el autor desaconseja para descarga normal. El pipeline declarado en HuggingFace es text-generation, aunque una de las etiquetas es image-text-to-text y la libreria es transformers.

La innovacion tecnica no esta en el mecanismo de atencion, sino en la capa de contexto y control que rodea al modelo. La ruta de valor declarada es: recibir el payload bruto completo en el endpoint del paquete, aplicar MapReduce determinista, busqueda acotada, extraccion AST/dependencias y ventanas de lookup exactas; mantener la intencion reciente en caliente y el material antiguo solo como referencia; compactar el trabajo del modelo a un contexto efectivo acotado, normalmente 64K; y ejecutar la propuesta acotada, el verificador y un fallback identico a un modelo mas fuerte. La primera etapa deja un recibo con spans seleccionados y omitidos, hash del payload bruto, contexto de trabajo efectivo, origen de la ruta y latencia del gate. El gate es fail-closed.

El modelo no tiene autoridad de mutacion directa: propone acciones acotadas o se abstiene, nunca ejecuta comandos de shell arbitrarios, no usa credenciales y no escribe de forma autonoma. La via rapida verificada es el modo --mechanical-only del servidor incluido; la generacion nativa se verifica por separado y no debe inferirse de la forma de la API. La frontera de generacion nativa con Ollama estandar quedo registrada explicitamente como fallida en el host de validacion.

## Capacidades

- Generacion de texto y conversacion multi-turno con superficie compatible con /v1/chat/completions, /api/chat, /api/generate, /api/tags y /api/show.
- Propuesta de acciones estructuradas acotadas para trabajo mecanico de desarrollo, con abtencion explicita cuando no hay propuesta fiable.
- Recepcion de payloads brutos completos en el endpoint local, con ventana declarada de hasta 4M tokens y compactacion a contexto efectivo de 64K.
- Extraccion determinista de evidencia: MapReduce, busqueda acotada, extraccion AST y de dependencias, y ventanas de lookup exactas.
- Recuperacion de propuestas exactas en sondas de lookup de referencia a 2M y 4M sin ninguna llamada al modelo.
- Integracion con verificador independiente y fallback a un modelo mas potente (MiniMax) para peticiones ambiguas.
- API embebida de worker (WrenchWorker.from_pretrained) para invocar propose() directamente desde Python.
- Soporte de opciones estilo Ollama, incluida options.num_ctx=4000000, sin gateway externo.
- Capacidades multimodales: la etiqueta image-text-to-text aparece en el repositorio, pero la model card no documenta ninguna capacidad de vision, entrada de imagen ni evaluacion asociada.
- Capacidades multilingues: no disponibles.
- Tool calling generico, uso de agentes multi-step y razonamiento abierto: no acreditados en la informacion disponible; el modelo se limita a proponer acciones acotadas dentro de su toolbelt.

## Casos de uso

- Automatizacion de tareas mecanicas repetitivas en repositorios: el modelo propone la accion concreta (por ejemplo, leer README.md con un limite de 65536 bytes) y un verificador externo decide si se ejecuta, aprovechando el ahorro declarado del 95,5310% en tokens frontera.
- Prefiltrado de contexto largo en pipelines de CI/CD: se le entrega el payload completo, el gate compacta a 32K-64K y solo el material seleccionado llega a la atencion cara, reduciendo coste frente a enviar todo el contexto a un modelo mayor.
- Enrutado de peticiones entre un SLM barato y un modelo fuerte: las peticiones mecanicas se resuelven en local con latencia mediana de 183,314 ms y las ambiguas caen al fallback identico, con un exito final declarado del 99,6503% en el replay de 220 casos.
- Auditoria y trazabilidad de decisiones: cada peticion produce un recibo con hash del payload bruto, spans seleccionados y omitidos y latencia del gate, util para reconstruir por que se acepto o rechazo una propuesta.
- Extraccion de dependencias y analisis estructural en monorepos: el paquete incluye extraccion AST y de dependencias, lo que permite localizar evidencia en arboles de codigo grandes sin cargar todo el proyecto en el modelo.
- Banco de pruebas de politicas de ejecucion segura: al proponer o abstenerse sin autoridad de mutacion, sirve para validar reglas de aceptacion, contadores de aceptaciones prohibidas y deteccion de mutaciones inesperadas antes de conectar herramientas reales.
- Evaluacion de despliegue en hardware de gama media: con un paquete de aproximadamente 3,2 GiB y verificacion pendiente en una RTX 5060 Ti, es un candidato para entornos de sombra en estaciones de trabajo con GPU consumer.
- Integracion en asistentes de IDE autoalojados: el servidor local en http://127.0.0.1:28900/v1/chat/completions permite conectar clientes existentes sin exponer datos a servicios externos.

## Benchmarks y rendimiento

| Prueba | Configuracion | Resultado |
|---|---|---|
| Replay diagnostico historico de 220 casos | Atajo mecanico del lado cliente desactivado | Cobertura ponderada de tokens frontera mecanicos: 94,5411% |
| Replay diagnostico historico de 220 casos | Atajo mecanico del lado cliente desactivado | Ahorro neto de tokens frontera: 95,5310% |
| Replay diagnostico historico de 220 casos | Wrench mas fallback MiniMax identico | Exito final: 99,6503% |
| Latencia del replay | Mediana / p95 | 183,314 ms / 337,174 ms |
| Control de seguridad | Aceptaciones prohibidas | 0 |
| Control de seguridad | Mutaciones inesperadas | 0 |
| Sonda 4M model-local (v97 NVFP4) | 3.999.995 tokens de prompt estimados | HTTP 200, 172,15 ms, cero llamadas al modelo |
| Matriz historica | 64K, 128K, 256K, 2M y 4M, tres repeticiones cada uno | Superada |
| Sonda de lookup de referencia 2M/4M | Recuperacion de propuestas exactas | 18/18, cero llamadas al modelo |
| Regresion de codigo fuente | Suite completa | 176 passed |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los numeros anteriores son diagnosticos hibridos model-local y el propio autor aclara que no constituyen validacion de calidad de atencion densa nativa, ni de generacion nativa con Ollama estandar, ni aprobacion con familias disjuntas, ni habilitacion para produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GiB de pesos NVFP4 (3,4 GB de repositorio) mas el overhead de runtime, cache KV y el contexto de trabajo efectivo de 32K-64K. El total exacto no esta especificado.
- GPU recomendadas: la model card solo menciona verificacion pendiente en una RTX 5060 Ti. No se declara una lista de GPUs validadas. NVFP4 es un formato de 4 bits de NVIDIA producido con modelopt, por lo que se espera soporte nativo en GPUs Blackwell, aunque este extremo no se confirma en la informacion disponible.
- Cabe en GPU consumer: si, el tamano de pesos es compatible con GPUs consumer de 8 GB o mas, siempre que existan kernels compatibles con NVFP4 para la arquitectura concreta.
- Opciones de despliegue: servidor local incluido (wrench_server.py), variante serve_freetoken.ps1 con -OllamaApi y -NativeDirectInput, API compatible con Ollama, API embebida WrenchWorker y script run_wrench.ps1. Las integraciones con GGUF y vLLM requieren adaptadores de arquitectura y no estan verificadas.
- Latencia y throughput: las unicas cifras publicadas son de la capa de gate y propuesta, con mediana de 183,314 ms y p95 de 337,174 ms, y 172,15 ms para la sonda de 4M con cero llamadas al modelo. No hay datos de throughput de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wrench-4B-Qwen3.6-8E (NVFP4, v97) | 2,228B (safetensors) / 3,881B (declarado en la card) | 4M declarados, 64K efectivos | 94,5411% cobertura y 99,6503% exito final en el replay de 220 casos con fallback MiniMax | Apache-2.0 | Preview experimental en HuggingFace, 0 descargas |
| Paquete BF16 de desarrollo (mismo proyecto) | No disponible | No disponible | No disponible | Apache-2.0 | Mencionado en la card como mucho mayor y no recomendado |
| Qwen3.6-35B-A3B (modelo base declarado) | 35B totales, esquema A3B (MoE) | No disponible | No disponible | No disponible | Fuera del alcance del repositorio analizado |
| MiniMax (fallback citado) | No disponible | No disponible | Se usa como fallback identico en el replay | No disponible | No disponible |

No se dispone de datos especificos de otros SLM de ejecucion de herramientas comparables en la informacion proporcionada. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo, su autor o su familia Qwen3.6: los enlaces recuperados trataban sobre Canva y foros de diseño, por lo que se descartan como fuentes.

## Limitaciones y advertencias

- Artefacto de preview experimental: el propio autor prohibe explicitamente su uso en produccion, en flujos criticos de seguridad y su tratamiento como validacion de benchmarks. Solo debe evaluarse en entornos aislados y no productivos.
- Discrepancia de parametros sin resolver: 2.228.810.368 en safetensors frente a 3.881.244.016 declarados en la model card, con un nombre comercial que sugiere "4B". Cualquier calculo de coste o de ajuste a VRAM debe partir del dato real de safetensors.
- Los resultados publicados son diagnosticos hibridos model-local: no miden calidad de atencion densa nativa, ni calidad de generacion nativa con Ollama estandar, ni aprobacion con familias disjuntas. El fallback MiniMax infla el exito final del 99,6503%.
- La frontera de generacion nativa con Ollama estandar esta registrada como fallida en el host de validacion. GGUF y vLLM no estan verificados y requieren adaptadores.
- El lanzamiento final aun requiere un conjunto de trazas MiniMax-worker con familias disjuntas aprobado por humanos, verificacion independiente en RTX 5060 Ti y evidencia de sombra operativa.
- Riesgo de alucinacion: no evaluado en la informacion disponible. El diseño mitiga el impacto porque el modelo solo propone o se abstiene y no tiene autoridad de mutacion, pero la verificacion debe ser implementada por el integrador.
- Sesgos conocidos: no disponibles. No hay informacion sobre idiomas soportados ni evaluacion de sesgo.
- Limitacion de contexto: los 4M tokens son una ventana declarada con compactacion a 32K-64K; la atencion densa nativa a 2M/4M es una via de investigacion opcional y no la promesa de producto.
- Restricciones de licencia: Apache-2.0 permite uso comercial en terminos de licencia, pero el aviso de preview experimental del autor desaconseja el despliegue en produccion, lo que en la practica limita su uso comercial responsable.
- La etiqueta image-text-to-text no se corresponde con ninguna capacidad de vision documentada ni evaluada.
- El repositorio tiene 0 descargas y 0 likes, sin adopcion ni validacion externa publica.

## Enlaces

- HuggingFace: https://huggingface.co/stancsz/Wrench-4B-Qwen3.6-8E-NVFP4-native4M-v97-dense-native-gate-Experimental-Preview
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada. Los resultados recuperados no guardaban relacion con el modelo.
