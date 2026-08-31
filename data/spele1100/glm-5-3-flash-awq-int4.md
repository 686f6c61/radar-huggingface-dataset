# spele1100/GLM-5.3-Flash-AWQ-INT4

## Resumen

GLM-5.3-Flash-AWQ-INT4 es una cuantizacion AWQ en INT4 del modelo GLM-5.3-Flash de Z.ai, realizada por el usuario de la comunidad spele1100. El modelo base es un Mixture-of-Experts multimodal de 320 mil millones de parametros (18 mil millones activos por token) con una ventana de contexto nativa de 1 millon de tokens, disenado para tareas de codificacion, agentes y razonamiento de horizonte largo. Esta cuantizacion reduce el peso del modelo a 190,8 GB en formato safetensors, lo que permite su despliegue en entornos con multiples GPUs a un coste de memoria significativamente menor que el original en bf16.

La relevancia de esta ficha radica en que la cuantizacion AWQ INT4 es una de las pocas opciones disponibles para ejecutar GLM-5.3-Flash de forma local con requisitos de hardware reducidos, aunque presenta limitaciones importantes: el contexto maximo probado es de 512K tokens (frente al 1M del modelo base) y requiere un fork no oficial de vLLM con parches especificos para la arquitectura glm5_next. El modelo mantiene las capacidades multimodales (imagen y texto) y el soporte de tool calling y razonamiento del original, pero con restricciones operativas que deben tenerse en cuenta antes de su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next (MoE, 45 capas, hc_mult=4, 288 expertos, inter=2048, h=4096) |
| Parametros totales | 321.323.031.390 |
| Parametros activos | 18 mil millones (18B) |
| Longitud de contexto | 512K tokens (524288) probado; el modelo base soporta 1M pero no es fiable en esta cuantizacion |
| Tipos de cuantizacion | AWQ INT4 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 (la cuantizacion); el modelo base es MIT |
| Formato de pesos | safetensors (46 shards) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE (Mixture-of-Experts) con 288 expertos y 45 capas, donde solo 18 mil millones de parametros se activan por token. Es el primer modelo nativamente multimodal de la serie GLM-5, capaz de procesar entradas de imagen y texto. La cuantizacion AWQ INT4 aplicada por spele1100 reduce la precision de los pesos a 4 bits, manteniendo la estructura original pero con una huella de memoria mucho menor. No se dispone de informacion detallada sobre el entrenamiento del modelo base (composicion del dataset, uso de RLHF o DPO) en las fuentes consultadas.

La cuantizacion presenta una innovacion tecnica destacable: requiere un fork especifico de vLLM (rama `sm89-longctx-fix-v2`) que corrige un kernel de norma fusionada mHC roto en la arquitectura glm5_next y problemas de CUDA-graph en contextos largos. Ademas, el modo de atencion Full-MLA se activa anulando el indexador disperso mediante overrides de HuggingFace, y la cache KV se mantiene en bf16 porque fp8 no es compatible con la implementacion MLA en GPUs sm89.

## Capacidades

- Generacion de texto y razonamiento complejo, incluyendo un modo de pensamiento explicito que devuelve un campo `reasoning` en la respuesta.
- Codificacion de software con soporte de tool calling y parser de llamadas a herramientas (glm47), integrable en pipelines de desarrollo.
- Procesamiento multimodal: acepta entradas de imagen y texto simultaneamente (pipeline image-text-to-text).
- Razonamiento multi-paso y ejecucion de agentes autonomos gracias a su capacidad de planificacion y uso de herramientas.
- Multilingue limitado a ingles y chino, con buen rendimiento en ambos idiomas segun las pruebas de humo documentadas.
- Contexto largo de hasta 512K tokens, verificado con pruebas de aguja (needle test) a 400-500K tokens.

## Casos de uso

- Atencion al cliente automatizada bilingue: el modelo puede gestionar conversaciones multi-turno en ingles y chino con contexto de hasta 512K tokens, lo que permite mantener el historial completo de interacciones largas sin truncamiento. Su modo de razonamiento ayuda a resolver consultas complejas de soporte tecnico.
- Generacion de codigo en produccion: con soporte de tool calling y parser de herramientas, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar codigo, asi como para interactuar con APIs y bases de datos mediante llamadas a funciones.
- Analisis de documentos extensos: su ventana de 512K tokens permite procesar manuales, contratos o informes de cientos de paginas en una sola pasada, extrayendo informacion relevante con razonamiento contextual.
- Agentes autonomos de navegacion web: combinando tool calling y razonamiento multi-paso, puede planificar y ejecutar tareas como busqueda de informacion, relleno de formularios o automatizacion de procesos en entornos controlados.
- Asistente multimodal para soporte visual: al aceptar imagenes, puede describir diagramas, capturas de pantalla o graficos y responder preguntas sobre ellos, util en helpdesk o documentacion tecnica.
- Traduccion y generacion de contenido en chino e ingles: su entrenamiento bilingue lo hace adecuado para localizacion de software, redaccion de documentacion tecnica o transcracion de contenido entre ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion AWQ INT4 en la informacion disponible. El modelo base GLM-5.3-Flash supera a GLM-5.2 en benchmarks de codificacion y tareas agénticas segun las fuentes de Z.ai, pero no se dispone de numeros concretos (MMLU, HumanEval, GSM8K, etc.) para esta version cuantizada. Se recomienda consultar la documentacion oficial de Z.ai para obtener datos de rendimiento del modelo original.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 190,8 GB en INT4, por lo que se necesitan al menos 8 GPUs con 24 GB libres cada una para cargar los pesos, mas memoria adicional para la cache KV y overhead. La model card indica un pico de ~34 GiB por GPU durante la carga con tensor-parallelism de 8.
- GPUs recomendadas: GPUs con compute capability sm89 (por ejemplo, RTX 4090, L40S) o superiores. No se soporta fp8 KV cache en sm89, por lo que se usa bf16.
- No cabe en una GPU de consumo; se requiere un nodo con multiples GPUs (TP8 en la configuracion de referencia).
- Opciones de despliegue: exclusivamente vLLM con el fork especifico `sm89-longctx-fix-v2` (https://github.com/spele1100/vllm-glm53). No es compatible con llama.cpp, Ollama ni TGI sin adaptaciones.
- Latencia y throughput: no disponibles. La carga de los 46 shards tarda varios minutos, y se recomienda `max_tokens >= 2048` porque el razonamiento consume presupuesto de generacion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | 1M | MIT | bf16 |
| GLM-5.3-Flash-AWQ-INT4 (esta ficha) | 321B | 18B | 512K (probado) | Apache-2.0 | AWQ INT4 |
| GLM-5.2 | no disponible | no disponible | no disponible | MIT | no disponible |

La cuantizacion AWQ INT4 reduce el contexto maximo fiable de 1M a 512K tokens y cambia la licencia de MIT a Apache-2.0, aunque mantiene los mismos parametros activos y la arquitectura MoE. No se dispone de datos de rendimiento comparativo entre ambas versiones en las fuentes consultadas.

## Limitaciones y advertencias

- Contexto maximo probado de 512K tokens; no se debe superar este limite. El modo de 1M arranca pero la recuperacion de informacion no es fiable y se considera roto.
- Requiere un fork no oficial de vLLM con parches especificos; el vLLM estandar no soporta esta arquitectura correctamente. El fork se proporciona sin mantenimiento ni soporte.
- La cache KV en fp8 no es compatible con la implementacion MLA en GPUs sm89; solo funciona con bf16.
- El uso de `generate()` sin plantilla de chat produce respuestas degeneradas; es obligatorio usar `/v1/chat/completions` o `llm.chat()`.
- Limitado a ingles y chino; no hay soporte para otros idiomas.
- La licencia Apache-2.0 de la cuantizacion difiere de la MIT del modelo base, lo que puede afectar a ciertos usos comerciales (aunque ambas son permisivas).
- El reinicio del servidor requiere esperar ~1 minuto y limpiar residuos de `/dev/shm` para evitar fallos de relanzamiento.
- No se han publicado benchmarks de rendimiento para esta cuantizacion, por lo que no se puede verificar su calidad respecto al modelo original.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/spele1100/GLM-5.3-Flash-AWQ-INT4
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-5.3-Flash
- Fork de vLLM requerido: https://github.com/spele1100/vllm-glm53
- Documentacion oficial de Z.ai sobre GLM-5.3-Flash: https://docs.z.ai/guides/vlm/glm-5.3-flash
- Guia de ejecucion local de unsloth: https://unsloth.ai/docs/models/glm-5.3-flash
- Ficha del modelo en Modal: https://modal.com/library/zai/glm-5-3-flash
- Articulo de OpenLM sobre GLM-5.3: https://openlm.ai/glm-5.5/
