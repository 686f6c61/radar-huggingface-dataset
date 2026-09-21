# stancsz/Wrench-4B-Qwen3.6-8E-BF16-hybrid-v97-dense-native-gate-Experimental-Preview

## Resumen

Wrench-4B-Qwen3.6-8E es un modelo de lenguaje pequeno (SLM) experimental orientado a ejecucion acotada de herramientas de desarrollo, publicado por el usuario stancsz en Hugging Face. No es un agente de codigo general: su funcion es proponer acciones estructuradas y verificables, o abstenerse, sobre trabajo mecanico y repetitivo, dejando la autoridad final a un verificador independiente y a un modelo de mayor capacidad como respaldo. El modelo nunca ejecuta comandos shell arbitrarios, no usa credenciales y no escribe de forma autonoma.

Tecnicamente se presenta como un derivado de Qwen3.6-35B-A3B, con pesos en BF16 y una arquitectura descrita como hibrida con puerta densa nativa (dense native gate). El repositorio safetensors declara 3.945.236.336 parametros totales, mientras que la model card indica 3.881.244.016 parametros verificados, por debajo de un techo declarado de 4,25B. El nombre incluye la etiqueta "8E" (ocho expertos), coherente con el tag qwen3_5_moe, aunque la model card no detalla el reparto de parametros activos.

Su relevancia actual es doble: por un lado, propone un patron de "SLM acotado + verificador + fallback" para abaratar trabajo mecanico en pipelines de agentes; por otro, plantea una via hibrida para contexto muy largo (hasta 4M de tokens) basada en compactar el payload crudo a un contexto efectivo de 32K-64K antes de la atencion costosa. Se distribuye como un paquete completo con tokenizer, verificador, toolbelt determinista, politica de contexto y servidor local con API compatible con Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido derivado de Qwen3.6-35B-A3B, con puerta densa nativa (dense native gate); etiquetado como qwen3_5_moe y "8E" (ocho expertos) |
| Parametros totales | 3.945.236.336 segun safetensors; la model card declara 3.881.244.016 parametros verificados (techo declarado: 4,25B) |
| Parametros activos | no disponible (el nombre indica 8 expertos, pero la model card no publica el reparto activo) |
| Longitud de contexto | hasta 4.000.000 de tokens en la via densa nativa opcional; contexto efectivo de trabajo de 64K por defecto, con compactacion a 32K-64K antes de la atencion costosa |
| Tipos de cuantizacion | no disponible; los pesos publicados son BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 7,9 GB |
| Fecha de publicacion / actualizacion | 21 de septiembre de 2026 (ambas) |
| Descargas / likes | 0 / 0 |
| Estado | experimental-preview (no apto para produccion) |

## Arquitectura y entrenamiento

El modelo se describe como un candidato experimental derivado de Qwen3.6-35B-A3B y como una arquitectura hibrida con puerta densa nativa. La pieza central no es la atencion densa de 4M de tokens (que la propia model card califica como "research opcional"), sino una primera capa de puerta (gate) fail-closed que recibe el payload crudo completo y lo compacta a un contexto de trabajo acotado, normalmente 64K, antes de ejecutar atencion costosa. La model card no publica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento; tampoco detalla el mecanismo exacto de la puerta mas alla de su comportamiento funcional.

El flujo descrito es de cuatro etapas: recepcion del payload crudo en el endpoint local del paquete; identificacion de evidencia util mediante MapReduce determinista, busqueda acotada, extraccion AST/dependencias y ventanas de lookup exacto; mantenimiento de la intencion reciente como contexto caliente y del material antiguo como material de solo referencia; y ejecucion de la propuesta acotada, el verificador y el fallback identico a un modelo mas fuerte. La primera capa emite un recibo con las porciones seleccionadas y omitidas, el hash del payload crudo, el contexto de trabajo efectivo, el origen de la ruta y la latencia de la puerta. La regresion completa del codigo fuente asociado reporta "176 passed".

## Capacidades

- Generacion de texto conversacional (tags text-generation y conversational).
- Propuesta de acciones estructuradas acotadas sobre trabajo mecanico de desarrollo, o abierto a abstenerse cuando no hay propuesta fiable.
- Trabajo mecanico repetitivo y verificable: el caso de uso declarado es leer ficheros con limites de bytes, extraer dependencias, localizar evidencia en repositorios y proponer acciones delimitadas.
- Exposicion de superficie de API doble: endpoint estilo OpenAI en `/v1/chat/completions` y superficie compatible con Ollama (`/api/tags`, `/api/show`, `/api/chat`, `/api/generate`), incluido `options.num_ctx=4000000`, sin gateway externo.
- Toolbelt determinista empaquetado (no descrito como function calling del modelo en sentido estricto) junto con un verificador embebido.
- Manejo de payloads crudos muy grandes mediante compactacion a contexto efectivo, con recuperacion exacta en ventanas de lookup: la sonda 2M/4M recupero propuestas exactas en 18/18 casos sin llamadas al modelo.
- Capacidades multilingues: no disponibles.
- Vision: el repositorio incluye el tag `image-text-to-text`, pero la model card no documenta ninguna capacidad de vision; se considera no disponible.
- No soporta ejecucion autonoma: no ejecuta comandos shell arbitrarios, no usa credenciales y no realiza mutaciones directas.

## Casos de uso

- Tareas mecanicas de desarrollo en modo sombra: desplegar el modelo en un entorno aislado que reciba peticiones reales de edicion y comprobar si sus propuestas coinciden con las del modelo fuerte, midiendo cobertura y ahorro antes de cualquier habilitacion operativa.
- Enrutado de coste en pipelines de agentes de codigo: enviar al SLM las peticiones mecanicas y reservar el modelo de frontera para los casos ambiguos, apoyandose en el fallback identico; la model card reporta un 95,5310 % de ahorro neto de tokens de frontera en el replay de diagnostico.
- Extraccion de evidencia sobre repositorios grandes: procesar payloads de varios megabytes con MapReduce determinista, extraccion AST/dependencias y ventanas de lookup, usando la via hibrida de contexto para localizar fragmentos concretos sin pagar atencion densa sobre el corpus completo.
- Investigacion sobre puertas de contexto y compaction: la primera capa emite recibos con hash de payload, tramos seleccionados y omitidos, contexto efectivo y latencia, lo que permite reproducir y auditar experimentos de compactacion a 32K-64K.
- Procesamiento local de payloads sensibles: al admitir el paquete un endpoint model-local sin gateway externo, encaja en entornos aislados o air-gapped donde el payload crudo no debe salir de la maquina.
- Generacion de propuestas para herramientas de CI controladas: producir acciones delimitadas (por ejemplo, limites de lectura de fichero o refactors mecanicos) que un verificador independiente valida antes de aplicarse, sin conceder al modelo autoridad de mutacion.
- Desarrollo de adaptadores de despliegue: servir como banco de pruebas para escribir adaptadores de arquitectura hacia GGUF o vLLM, que la model card declara no verificados actualmente.
- Evaluacion comparativa de arquitecturas hibridas MoE: usar el artefacto como caso de estudio reproducible de un derivado de 35B-A3B recortado a menos de 4,25B de parametros con reparto de expertos fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente aporta diagnosticos internos del sistema hibrido, que no equivalen a validacion de produccion ni a calidad de atencion densa nativa:

| Metrica (replay de diagnostico de 220 casos, sin atajo mecanico en cliente) | Valor |
|---|---|
| Cobertura ponderada de tokens frontera mecanicos | 94,5411 % |
| Ahorro neto de tokens frontera | 95,5310 % |
| Exito final de Wrench mas fallback MiniMax identico | 99,6503 % |
| Latencia mediana / p95 | 183,314 ms / 337,174 ms |
| Aceptaciones prohibidas | 0 |
| Mutaciones inesperadas | 0 |

| Metrica (matriz de contexto y sondas) | Valor |
|---|---|
| Matriz de contexto directa model-local | superada con tres repeticiones en 64K, 128K, 256K, 2M y 4M |
| Estimacion bruta medida a 4M | 3.999.995 tokens; HTTP completo p50/p95 de 158,906 / 159,251 ms |
| Sonda de referencia 2M/4M | 18/18 propuestas exactas recuperadas |
| Recuperacion a 4M | p50/p95 de 32,560 / 40,772 ms, con cero llamadas al modelo |
| Regresion de codigo fuente | 176 passed |

Advertencia de lectura: la propia model card indica que estos resultados son diagnosticos hibridos model-local y no miden calidad de atencion densa nativa, ni calidad de generacion nativa con Ollama estandar, ni aprobacion con familias de datos disjuntas. El exito del 99,6503 % corresponde al sistema completo (Wrench mas fallback MiniMax identico), no al modelo aislado.

## Requisitos de hardware

- VRAM estimada para los pesos: al publicarse solo en BF16 y con 3.945.236.336 parametros, los pesos ocupan aproximadamente 7,9 GB (coincide con el tamano del repositorio). Con overhead de runtime, conviene disponer de al menos 10-12 GB de VRAM para la via BF16.
- Memoria para KV cache: no disponible para el contexto efectivo de 64K; para las rutas de 2M y 4M, la model card no publica requisitos de memoria porque la compactacion a 32K-64K es precisamente el mecanismo que evita la atencion densa.
- GPU recomendadas: no disponibles de forma oficial. El unico modelo de GPU citado en la documentacion es la RTX 5060 Ti, mencionada como verificacion independiente pendiente.
- Viabilidad en GPU de consumo: si, en principio, para cargar los pesos BF16 en tarjetas de 16 GB o mas (por ejemplo, RTX 4090 de 24 GB o RTX 5060 Ti de 16 GB), siempre que el contexto efectivo se mantenga acotado. No hay cifras publicadas de consumo real.
- Opciones de despliegue: servidor model-local incluido en el paquete (`wrench_server.py --model-dir . --allowed-root . --mechanical-only`), con scripts de PowerShell `run_wrench.ps1` y `serve_freetoken.ps1`. Se expone API compatible con Ollama y endpoint estilo OpenAI. La API de worker embebida (`WrenchWorker.from_pretrained`) permite usar el modelo con `load_model=False` para propuestas sin cargar pesos.
- vLLM y GGUF: la model card declara explicitamente que requieren adaptadores de arquitectura y que no estan verificados.
- Ollama nativo: el limite de generacion nativa con Ollama estandar se registro como fallido en el host de validacion; la compatibilidad es de forma de API, no de backend verificado.
- Latencia observada: HTTP completo a 4M con p50/p95 de 158,906 / 159,251 ms; recuperacion de referencia a 4M con p50/p95 de 32,560 / 40,772 ms; en el replay de 220 casos, mediana de 183,314 ms y p95 de 337,174 ms.
- Throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos de la misma categoria en la informacion disponible. La unica referencia directa es el modelo base del que deriva:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wrench-4B-Qwen3.6-8E (este) | 3,88-3,95B verificados/declarados; 8 expertos segun nombre | hasta 4M en via densa opcional; 64K efectivos | Diagnosticos internos: 94,5411 % de cobertura, 95,5310 % de ahorro de tokens, 99,6503 % de exito con fallback | apache-2.0 | Hugging Face, 0 descargas, 0 likes; preview experimental |
| Qwen3.6-35B-A3B (base declarado) | 35B totales, 3B activos segun el nombre | no disponible | no disponible | no disponible en esta ficha | no evaluado en la informacion disponible |
| Alternativas equivalentes de SLM para herramientas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado experimental explicito: la model card prohibe el uso en produccion, en flujos criticos de seguridad y en cualquier escenario donde los resultados de benchmark se tomen como validacion. Se esperan cambios disruptivos e integraciones incompletas.
- El artefacto no es un agente de codigo general y no tiene autoridad de mutacion directa: propone acciones acotadas o se abstiene, y requiere un verificador externo que aplique la politica de ejecucion.
- El 99,6503 % de exito final corresponde a Wrench mas un fallback identico a MiniMax; no es una cifra atribuible al modelo por si solo.
- Los diagnosticos publicados son de sistema hibrido model-local: no miden calidad de atencion densa nativa ni generacion nativa con Ollama estandar.
- La via densa de 2M/4M es investigacion opcional y no forma parte de la promesa de producto; el contexto efectivo de trabajo es de 64K.
- La puerta densa nativa es fail-closed y `-BypassDenseNativeGate` esta reservado a sondas de capacidad separadas; no puede combinarse con modos densos nativos.
- Ollama nativo se registro como fallido en el host de validacion; GGUF y vLLM no estan verificados y requieren adaptadores de arquitectura.
- Falta la aprobacion humana con familias de datos disjuntas (trace set MiniMax-worker), la verificacion independiente en RTX 5060 Ti y la evidencia operativa en sombra antes de una release final.
- Idiomas soportados no declarados: no hay garantia de comportamiento fuera del ingles tecnico de desarrollo.
- El tag `image-text-to-text` del repositorio no esta respaldado por ninguna documentacion de capacidades de vision en la model card.
- Licencia apache-2.0, por lo que no hay restriccion contractual de uso comercial, pero la propia model card desaconseja el uso en produccion, lo que constituye un riesgo operativo aunque no juridico.
- Riesgo de alucinacion no cuantificado: no se publican tasas de error especificas ni evaluaciones de sesgo. El diseno mitiga el riesgo de mutacion (0 aceptaciones prohibidas y 0 mutaciones inesperadas en el replay) pero no el de propuestas incorrectas que un verificador debil podria aceptar.
- Repositorio con 0 descargas y 0 likes: no existe aun validacion por parte de la comunidad, ni informes de terceros independientes.
- El paquete de ejemplo se distribuye con scripts de PowerShell, lo que orienta el uso hacia hosts Windows.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stancsz/Wrench-4B-Qwen3.6-8E-BF16-hybrid-v97-dense-native-gate-Experimental-Preview
- La busqueda web realizada no devolvio ningun resultado relevante: todos los enlaces recuperados correspondian a paginas de ayuda de Gmail y no guardan relacion con el modelo.
- No se han encontrado en la informacion disponible enlaces a papers, blogs tecnicos, repositorios de codigo publicos, demos ni paginas del autor mas alla de la propia model card.
