# stancsz/Wrench-4B-Qwen3.6-8E-NVFP4-native4M

## Resumen

Wrench-4B-Qwen3.6-8E-NVFP4-native4M es un modelo de lenguaje pequeno (SLM) podado y especializado en herramientas para desarrolladores, publicado por el usuario stancsz en Hugging Face. Deriva del modelo Qwen3.6-35B-A3B mediante poda selectiva y se distribuye como un paquete portable que incluye no solo los pesos, sino tambien el tokenizador, un runtime de busqueda mecanica determinista, un verificador de solo lectura, un overlay de contexto largo, metadatos ligados por hash y un lanzador denominado FreeToken. Su identidad de candidato declarada en la model card es Wrench-4B-Qwen3.6-8E-Safety-v7-NVFP4-native4M.

El modelo se presenta como un artefacto experimental publico, descargable y reproducible, pero el propio autor advierte que no se han superado las puertas finales de calidad de recuperacion a 4M, paridad con MiniMax ni throughput de produccion. La evaluacion de release de 220 casos emparejados sigue pendiente. Por tanto, es relevante ahora como banco de pruebas tecnico para patrones de despliegue local con contexto muy largo y cuantizacion NVFP4, mas que como modelo listo para produccion.

La arquitectura es de tipo mezcla de expertos (MoE), segun el tag `qwen3_5_moe` y la nomenclatura "8E" (8 expertos). Existe una discrepancia entre fuentes: la model card declara 3.881.244.016 parametros, mientras que los metadatos de safetensors del repositorio indican 2.228.810.368. El repositorio ocupa 3,4 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) derivada de Qwen3.6; tag `qwen3_5_moe`, nomenclatura "8E" (8 expertos) |
| Parametros totales | 3.881.244.016 segun la model card; 2.228.810.368 segun los metadatos de safetensors del repositorio (discrepancia no resuelta en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | Capacidad KV declarada de 4M tokens; presupuesto de trabajo por defecto de 64K tokens estimados; perfil `-FastHistory` con `-FastHistoryKeepTokens 64000` |
| Tipos de cuantizacion | NVFP4 W4A16 (ModelOpt); tag `8-bit`; no se mencionan otros formatos como GGUF o AWQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de distribucion canonico), pesos NVFP4 W4A16 generados con ModelOpt |

## Arquitectura y entrenamiento

La model card describe Wrench como un SLM "podado y especifico de tarea" para herramientas de desarrollo, derivado de Qwen3.6-35B-A3B. El modelo conserva una arquitectura de mezcla de expertos, coherente con el tag `qwen3_5_moe` y con el sufijo "8E" del identificador, que sugiere ocho expertos. La cuantizacion aplicada es NVFP4 en configuracion W4A16 (pesos de 4 bits con activaciones de 16 bits) generada con ModelOpt, lo que situa el peso total del artefacto dentro del limite declarado de 4.25B parametros.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable no reside en el preentrenamiento, sino en el empaquetado en tiempo de ejecucion: el paquete incorpora una ruta mecanica determinista que resuelve peticiones de alta confianza sin invocar al modelo (`model_calls=0`), un verificador independiente con criterio fail-closed que debe aprobar cada propuesta antes de ejecutarse, y un prefill escalonado que convierte mensajes antiguos en tarjetas de referencia ligadas por hash manteniendo como intencion activa unicamente el mensaje de usuario mas reciente. El presupuesto de trabajo por defecto es de 64K tokens estimados y el lanzador FreeToken fija explicitamente una capacidad KV de 4M con cache de expertos automatica. El autor subraya que esto es una optimizacion de contexto de trabajo acotado y no una afirmacion de atencion densa sobre los 4M tokens completos.

## Capacidades

- Generacion de texto conversacional con pipeline `text-generation` y soporte multi-turno.
- Codigo y herramientas de desarrollo: la etiqueta principal del modelo es `developer-tools` y `code`.
- Ruta mecanica para operaciones de texto sobre ficheros: soporta `replace`, `append`, `prepend`, `insert-after` y `remove` cuando la coincidencia de texto es unica, generando un diff unificado de solo revision sin tocar el arbol de trabajo.
- Generacion de borradores de parche (`patch_draft`) con validacion estricta: los diffs vacios o solo de cabecera se rechazan como `invalid_patch_diff`.
- Lectura acotada de ficheros: las lecturas simples sin limite explicito usan el tope de 256 KiB del verificador; las peticiones de fichero completo se marcan como fallback obligatorio para evitar truncamientos silenciosos.
- Servidor local compatible con la API de OpenAI en `/v1/chat/completions`, con recepcion del payload completo en el propio endpoint del modelo.
- Contexto muy largo nominal: acepta payloads de millones de tokens y aplica un reductor de contexto de trabajo, con un perfil opcional (`-FastHistory`) que omite atencion y MLP por debajo de la frontera de tokens recientes.
- Receipts de trazabilidad: la respuesta incluye estimacion de entrada bruta, ruta efectiva, numero de llamadas al modelo y justificante de `dynamic_prefill`.
- Etiqueta `image-text-to-text` presente en los metadatos, aunque el pipeline declarado es `text-generation` y la model card no documenta capacidades de vision: tratar como no confirmado.
- Soporte de tool calling o function calling explicito: no documentado en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Revision de cambios en repositorios: el modelo puede recibir una instruccion del tipo `Replace "old" with "new" in README.md` y devolver un diff unificado de solo lectura, dejando el arbol de trabajo intacto. Es adecuado porque la ruta mecanica resuelve estas operaciones sin consumir llamadas al modelo y con verificacion independiente.
- Automatizacion de tareas repetitivas de edicion de ficheros: `append`, `prepend`, `insert-after` y `remove` sobre coincidencias unicas permiten construir utilidades de mantenimiento de documentacion o configuracion con comportamiento determinista y fallo explicito cuando la peticion es ambigua.
- Servicio local de asistencia para desarrolladores: el paquete arranca un endpoint OpenAI-compatible en `http://127.0.0.1:28900`, lo que permite integrarlo con clientes existentes sin infraestructura adicional.
- Experimentacion con contexto extremo: el perfil nominal de 4M tokens con presupuesto de trabajo de 64K permite probar estrategias de prefill escalonado y reduccion de contexto sobre conversaciones de millones de tokens.
- Analisis de conversaciones largas con historial obsoleto: el modo `-FastHistory` con `-FastHistoryKeepTokens 64000` trata el historial antiguo como referencia y concentra el calculo en la ventana reciente, util para logs o hilos extensos.
- Investigacion sobre empaquetado de modelos cuantizados: el artefacto sirve como caso de estudio reproducible de distribucion NVFP4 W4A16 con runtime embebido, verificador y metadatos ligados por hash.
- Integracion en pipelines de CI/CD para comprobaciones de solo lectura: la naturaleza fail-closed del verificador y el rechazo de diffs vacios permiten usarlo como paso de validacion previa sin riesgo de modificar el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona unicamente una evaluacion de release de 220 casos emparejados que sigue pendiente, y advierte expresamente que no se han superado las puertas de calidad de recuperacion a 4M, de paridad con MiniMax ni de throughput de produccion. No se ofrecen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

## Requisitos de hardware

- Peso de los pesos: la cuantizacion NVFP4 W4A16 implica aproximadamente 4 bits por parametro. Partiendo de los 3.881.244.016 parametros declarados en la model card, el peso teorico de los pesos ronda los 2 GB; los 2.228.810.368 parametros de los metadatos de safetensors darian algo mas de 1 GB. El repositorio completo ocupa 3,4 GB e incluye runtime, tokenizador y metadatos. Estas cifras son estimaciones derivadas de los datos disponibles, no valores documentados.
- VRAM para inferencia: no disponible como cifra oficial. La suma de pesos mas la cache KV correspondiente al presupuesto de trabajo por defecto de 64K tokens es el factor dominante; una cache KV de 4M tokens completos requeriria un volumen de memoria muy superior y no se cuantifica en la informacion disponible.
- GPU recomendadas: no disponibles. La model card no especifica modelos de GPU, aunque menciona de forma generica "GPUs con memoria limitada" en relacion con el mapeo de direcciones dispersas y la cache de expertos automatica.
- Formato NVFP4: es un formato de punto flotante de 4 bits de NVIDIA asociado a ModelOpt. Su ejecucion nativa depende de hardware con soporte FP4; en hardware sin ese soporte cabria esperar emulacion o conversion previa, extremo que no se detalla en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado en la informacion disponible. El tamano de pesos y el formato NVFP4 sugieren que la parte de pesos si podria residir en GPU de consumo con memoria suficiente, pero la ventana de contexto de 4M y el requisito de soporte NVFP4 impiden afirmarlo con los datos disponibles.
- Opciones de despliegue: el paquete incluye su propio servidor OpenAI-compatible (`wrench_server.py`), el lanzador FreeToken (`serve_freetoken.ps1`, `run_wrench.ps1`) y una API de worker (`WrenchWorker.from_pretrained`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que el perfil FreeToken mejora el perfil de servicio nativo, pero "no prueba por si mismo una generacion densa rapida a 4M".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wrench-4B-Qwen3.6-8E-NVFP4-native4M | 3.881.244.016 (card) / 2.228.810.368 (safetensors) | 4M KV nominal, 64K de trabajo | Apache 2.0 | Hugging Face, 2 descargas, 0 likes | MoE cuantizado NVFP4 W4A16, artefacto experimental |
| Qwen3.6-35B-A3B (modelo base) | 35B totales, 3B activos (segun nomenclatura del nombre) | no disponible | no disponible | no disponible en la informacion | Modelo del que deriva Wrench mediante poda |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se ha proporcionado informacion sobre modelos comparables |

No se dispone de datos de rendimiento de ninguno de los modelos de la tabla, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto experimental: el propio autor declara que no es una afirmacion de que se hayan superado las puertas de calidad de recuperacion a 4M, de paridad con MiniMax ni de throughput de produccion.
- Evaluacion incompleta: la evaluacion de release de 220 casos emparejados sigue pendiente, por lo que no existe validacion publicada del comportamiento del modelo.
- Calidad de atencion no garantizada: la model card aclara que no se reclama atencion densa de calidad nativa sobre los 4M tokens completos, y que el contexto largo se gestiona mediante reduccion acotada y prefill escalonado.
- Perfil `-FastHistory` no verificado: el autor indica que la calidad de recuperacion y la paridad con MiniMax de esta politica no estan verificadas, y por eso es opcional y desactivada por defecto.
- Riesgo de truncamiento: las lecturas simples usan el tope de 256 KiB del verificador y las peticiones de fichero completo se marcan como fallback obligatorio precisamente para evitar truncamientos silenciosos.
- Ambiguedad de instrucciones: las peticiones de parche ambiguas o insuficientemente especificadas devuelven `patch_content_missing` sin gastar llamada al modelo, lo que limita su utilidad en entradas poco precisas.
- Idiomas soportados: no disponibles, lo que impide garantizar cobertura multilingue.
- Discrepancia de parametros: la model card (3.881.244.016) y los metadatos de safetensors (2.228.810.368) no coinciden, lo que conviene verificar antes de dimensionar el despliegue.
- Capacidades de vision no confirmadas: el tag `image-text-to-text` aparece en los metadatos pero no se documenta en la model card.
- Adopcion muy baja: 2 descargas y 0 likes en el momento de la consulta, sin comunidad ni soporte conocido.
- Documentacion truncada: el texto de la model card proporcionado termina de forma incompleta, por lo que puede faltar informacion sobre el manejo de conversaciones enviadas como un unico mensaje de usuario grande.
- Uso comercial: la licencia Apache 2.0 lo permite en principio, pero al tratarse de un artefacto experimental sin evaluacion completa, la validacion en produccion recae enteramente en quien lo despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/stancsz/Wrench-4B-Qwen3.6-8E-NVFP4-native4M
- Modelo base Qwen3.6-35B-A3B: no disponible enlace en la informacion proporcionada
- Paper o blog tecnico: no disponible
- Repositorio de codigo: no disponible (el propio paquete de Hugging Face incluye el runtime)
- Demos: no disponible

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos enlaces obtenidos corresponden a la Vlaamse Technische Kring (VTK) de la KU Leuven y no guardan relacion con Wrench.
