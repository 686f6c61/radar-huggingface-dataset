# vwdubb/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder-FP8

## Resumen

Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder-FP8 es un checkpoint fusionado publicado por el usuario vwdubb que combina dos linajes. Por un lado, ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP, una version "abliterated" (con la alineacion de seguridad eliminada mediante una ablacion de rechazo en una unica direccion sobre los pesos) del fine-tune Swift-Qwen3.8-27B de UkisAI, que conserva la torre de vision y la cabeza de prediccion multi-token (MTP). Por otro, el adaptador LoRA Shockem/Qwen3.8-27b-Terse-Coder-LoRA (ronda 8, DPO de rango 16), orientado a producir trazas de razonamiento mas concisas en tareas de codigo. El resultado es un unico checkpoint con el adaptador ya integrado en los pesos, sin necesidad de gestionar LoRA en tiempo de ejecucion.

El modelo hereda de su base una arquitectura transformer multimodal (image-text-to-text) de 27.781.427.952 parametros (unos 27,78 mil millones), con soporte para imagen y texto y una ventana de contexto de hasta 262.144 tokens segun la configuracion de vLLM incluida en la model card. Su relevancia es doble: por un lado, sirve como artefacto de estudio para investigacion en interpretabilidad, seguridad de IA y analisis de mecanismos de rechazo, dado que su alineacion de seguridad ha sido sustancialmente eliminada; por otro, documenta una tecnica poco habitual de fusion de pesos (redondeo estocastico) para preservar deltas LoRA muy pequenos.

Es importante senalar que se trata de un artefacto experimental con cero descargas y cero "likes" en el momento de la consulta, sin benchmarks independientes publicados y con una discrepancia sin resolver entre el identificador del repositorio ("FP8") y la model card, que describe el almacenamiento en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-27B, con torre de vision y cabeza de prediccion multi-token (MTP) |
| Parametros totales | 27.781.427.952 (~27,78 mil millones) |
| Parametros activos | no disponible (no se documenta arquitectura MoE) |
| Longitud de contexto | hasta 262.144 tokens (valor de `--max-model-len` en la configuracion de vLLM de la model card) |
| Tipos de cuantizacion | bf16 segun la model card; el identificador del repositorio indica FP8 y la etiqueta `compressed-tensors` lo respalda. No se documenta catalogo adicional (GGUF, AWQ, etc.) |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (con `compressed-tensors`) |

Datos adicionales del repositorio: tamano del repo 38,5 GB, creado el 2026-09-26, pipeline no disponible, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El artefacto no introduce entrenamiento nuevo: es una fusion de pesos en dos etapas sobre un modelo base multimodal. El adaptador LoRA se fusiono en fp32 mediante `W + B @ A * (lora_alpha / r)`, con `alpha = 32` y `r = 16` (escala 2,0). El checkpoint resultante se almaceno en bf16 aplicando redondeo estocastico (no sesgado) con semilla fija 0, de modo que la fusion es reproducible. La razon del redondeo estocastico es que los deltas del adaptador son deliberadamente minusculos (`||delta||/||W||` aproximadamente 4e-4 a 1e-3), por debajo de la resolucion por elemento de bf16: la model card del adaptador mide una supervivencia del delta de solo 31-61% con redondeo bf16 simple frente a 94-99,9% en fp16, mientras que el redondeo estocastico preserva el valor esperado manteniendo el dtype y el tamano de bf16.

Tanto la cabeza MTP como la torre de vision quedan intactas respecto al adaptador; la cabeza MTP del modelo base esta abliterada de forma coherente con el modelo principal, por lo que se conservan la decodificacion auto-especulativa y la comprension de imagenes. El resto de ficheros no de peso (config, tokenizer, processor, indice) se copian del base, y la plantilla de chat es `Shockem/froggeric-terse-coder`, la utilizada durante la evaluacion del adaptador. La cadena completa de transformaciones es: Qwen3.8-27B original (Apache 2.0) -> Swift 1.0 de UkisAI -> ablacion de rechazo -> LoRA Terse-Coder. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni un pipeline de RLHF/DPO mas alla del propio adaptador de rango 16.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion de codigo con sesgo hacia trazas de razonamiento concisas (el adaptador es una edicion de comportamiento dirigida a tareas de codigo con "thinking" activado).
- Comprension de imagenes: la torre de vision se conserva intacta, y la clase de carga documentada es `AutoModelForImageTextToText` / `AutoProcessor`.
- Tool calling y function calling: la configuracion de vLLM incluye `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Modo de razonamiento con parser dedicado (`--reasoning-parser qwen3`) y ajuste de `reasoning_effort`.
- Decodificacion auto-especulativa mediante la cabeza MTP (parametro `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`).
- Comportamiento "uncensored": responde a peticiones que el Qwen3.8-27B original rechazaria, por herencia de la ablacion.
- Capacidades multilingues: no disponibles (no se documentan idiomas soportados).

## Casos de uso

- Investigacion en seguridad de IA e interpretabilidad: el modelo permite estudiar mecanismos de rechazo al haber sido abliterado, y sirve como sujeto de contraste frente al Qwen3.8-27B original con alineacion intacta.
- Red-teaming y evaluacion de robustez: sirve para generar intentos de jailbreak, contenido sensible bajo control y casos limite que prueben los filtros de un sistema de moderacion externo.
- Asistencia a la generacion de codigo en entornos controlados: el adaptador Terse-Coder reduce la verbosidad de las trazas de razonamiento, lo que abarata la salida de tokens en pipelines de autocompletado o revision de codigo cuando no se requiere una derivacion extensa.
- Agentes de codigo con tool calling: la configuracion de vLLM documentada habilita `tool-call-parser qwen3_coder` y eleccion automatica de herramienta, lo que permite integrarlo en flujos de edicion y ejecucion de codigo multi-paso.
- Procesamiento de documentos con imagen y texto: al conservar la torre de vision, puede emplearse en tareas de extraccion de informacion a partir de capturas, diagramas o documentos escaneados.
- Experimentos de decodificacion eficiente: la cabeza MTP incluida permite medir el impacto de la decodificacion auto-especulativa (3 tokens especulativos) sobre latencia y throughput en despliegues vLLM.
- Analisis de fusion de pesos y cuantizacion: el checkpoint documenta el efecto del redondeo estocastico sobre deltas LoRA diminutos, util como caso de estudio metodologico para quien investigue tecnicas de merge.
- Conversacion general sin restricciones en laboratorio: util para comparar distribuciones de respuesta antes y despues de la ablacion en estudios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "no independent benchmarks have been run on this artifact" y que las dos ediciones no-LoRA (abliteracion y adaptador) no han sido medidas en su interaccion.

El unico dato cuantitativo aportado es indirecto y no corresponde a este artefacto: el autor del adaptador midio, sobre el modelo Qwen base, una caida de capacidad tras la fusion (del 70% al 60-62% en su conjunto "held-out-40" despues de la secuencia merge en fp32 -> fp16 -> recuantizacion NVFP4). La model card aclara que esta fusion almacena bf16 sin recuantizacion, por lo que la penalizacion esperada deberia ser menor, pero no nula. No hay ningun numero verificado para el checkpoint objeto de esta ficha.

## Requisitos de hardware

- Inferencia en bf16: aproximadamente 56 GB solo para pesos (27,78 mil millones x 2 bytes), mas la cache KV. Con contexto de hasta 262.144 tokens, la cache KV puede ser considerable y condicionar el despliegue.
- Inferencia en FP8 (si se confirma la cuantizacion): aproximadamente 28 GB para pesos, mas cache KV.
- GPU recomendadas para bf16: H100 80 GB o A100 80 GB con tensor-parallel-size 1. Para FP8, A100 80 GB / H100 80 GB / L40S 48 GB.
- GPU de consumo: una RTX 4090 (24 GB) no es suficiente para pesos en bf16; en FP8 quedaria muy justa y sin margen para cache KV a contextos largos. No hay ficheros GGUF publicados, por lo que no se documenta una ruta de cuantizacion orientada a GPU de consumo.
- Opciones de despliegue documentadas: vLLM (con `--dtype bfloat16`, `--tensor-parallel-size 1`, `--max-model-len 262144`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`) y Transformers con `AutoModelForImageTextToText` y `AutoProcessor`.
- Decodificacion especulativa: disponible mediante la cabeza MTP (`--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`), orientada a reducir latencia por token.
- Latencia y throughput: no disponibles (no se publican medidas).
- llama.cpp, Ollama y TGI: no documentados en la informacion disponible; la ausencia de pesos GGUF descarta por ahora una via de despliegue en llama.cpp/Ollama sin conversion previa.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. La unica comparacion posible es con los componentes de su propio linaje, para los que tampoco se publican especificaciones completas.

| Modelo | Parametros | Contexto | Vision | MTP | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (vwdubb/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder-FP8) | 27,78 mil millones | hasta 262.144 tokens | Si (torre conservada) | Si | Swift Open License v1.0 | safetensors / compressed-tensors |
| ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP (base) | no disponible | no disponible | Si (segun la model card del derivado) | Si | no disponible | no disponible |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA (adaptador) | no aplica (LoRA rango 16) | no disponible | no aplica | no aplica | Apache 2.0 | no disponible |
| Qwen3.8-27B original | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

No se identifican en la informacion disponible alternativas de terceros con datos comparables.

## Limitaciones y advertencias

- Alineacion de seguridad eliminada: el modelo hereda la abliteracion del base y responde a peticiones daninas, poco eticas, ofensivas o ilegales que el Qwen3.8-27B original rechazaria. No tiene guardarrailes internos significativos.
- Uso previsto restringido a investigacion legitima (interpretabilidad, seguridad de IA, estudio de mecanismos de rechazo, red-teaming, evaluacion de robustez y experimentos controlados). La model card prohibe desplegarlo a usuarios finales o en produccion sin anadir capas propias de seguridad, moderacion y prevencion de abuso.
- Sin benchmarks independientes: no hay mediciones verificadas de este artefacto. La interaccion entre abliteracion y adaptador de concision no ha sido evaluada por separado; el efecto de concision "deberia" acumularse, pero su magnitud es desconocida.
- Comportamiento "uncensored" preservado "en expectativa", no verificado: la ablacion es una edicion de pesos, no un desaprendizaje a nivel de datos.
- Penalizacion de capacidad tras la fusion: el autor del adaptador recomienda LoRA en tiempo de ejecucion como forma de despliegue a plena potencia y midio una caida (70% -> 60-62%) sobre el Qwen base con recuantizacion. En esta fusion (bf16 sin recuantizacion) la penalizacion deberia ser menor, pero no cero.
- No cargar el LoRA Terse-Coder encima de este modelo: la doble aplicacion acorta en exceso el razonamiento (63% de aprobados con fallos `no_code` en las pruebas del adaptador).
- Discrepancia de formato y cuantizacion: el identificador del repositorio indica FP8 y la etiqueta `compressed-tensors` lo respalda, pero la model card describe el almacenamiento en bf16 sin recuantizacion. El tamano del repo (38,5 GB) no coincide exactamente con ninguna de las dos hipotesis puras.
- Restricciones de licencia: Swift Open License v1.0 permite uso personal, de investigacion, educativo, de evaluacion y comercial para personas y organizaciones con ingresos brutos anuales de hasta 1.000.000 USD; por encima de ese umbral, el uso comercial requiere una licencia Swift Enterprise de UkisAI. La licencia no limita los derechos sobre Qwen3.8-27B en si bajo Apache 2.0.
- Plantilla de chat obligatoria: servir el modelo sin la plantilla `Shockem/froggeric-terse-coder` altera el comportamiento agentico.
- Ajuste de muestreo: temperatura 1.0, top_p 0.95, top_k 20, min_p 0 (recomendado para Swift y Qwen).
- Idiomas y sesgos: no se documentan idiomas soportados ni evaluacion de sesgos.
- Riesgo de alucinacion: no cuantificado; no hay datos especificos para este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder-FP8
- Modelo base (abliterated): https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Adaptador LoRA: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Plantilla de chat: Shockem/froggeric-terse-coder
- Autor del modelo base original (UkisAI): https://huggingface.co/ukisai
- Perfil de ajgazin: https://huggingface.co/ajgazin
- Perfil de Shockem: https://huggingface.co/Shockem
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2406.11717
- OrcaRouter (mencionado en la model card, enlace truncado en la informacion disponible): no disponible
