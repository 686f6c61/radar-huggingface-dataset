# TyroneNel/Qwen3.8-27B-Uncensored-W4A16-g128

## Resumen

Qwen3.8-27B-Uncensored-W4A16-g128 es una cuantizacion de pesos en 4 bits (esquema W4A16, grupo de 128) del modelo orcarouter/Qwen3.8-27B-Uncensored, publicada por el usuario TyroneNel. El modelo de partida es un ajuste fino "abliterated" de Qwen3.8-27B: se ha eliminado la direccion de rechazo editando 131 matrices que escriben en el flujo residual, de modo que el modelo apenas se niega a responder. La cuantizacion es exclusivamente de pesos y respeta ese edit byte a byte; no se ha reentrenado nada. El resultado es un checkpoint multimodal (image-text-to-text) de unos 16,7-16,8 GB que cabe en una unica tarjeta de 24 GB (RTX 3090, Ampere) dejando espacio para la cache KV.

Arquitectonicamente es un transformer denso de la familia Qwen3.5/Qwen3.8, con torre de vision, cabeza MTP (multi-token prediction) y control de esfuerzo de razonamiento en la plantilla de chat. El objetivo declarado es servir el modelo abliterated completo (vision, tool calling, thinking) en hardware de consumo mediante el kernel Marlin de vLLM, con decodificacion especulativa DFlash2 y contexto nativo de 262.144 tokens (ampliable a 1M con YaRN estatico).

La relevancia practica esta en el empaquetado: AutoRound de Intel, formato compressed-tensors con 411 tensores empaquetados (400 lineales int4 + 11 int8) y 790 tensores que se mantienen en BF16 (normas, torre de vision y embeddings MTP). Es un artefacto de nicho, sin descargas ni validacion de la comunidad en el momento de la consulta, y con una discrepancia documental notable en el recuento de parametros que se detalla mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5/Qwen3.8, multimodal (image-text-to-text) con torre de vision y cabeza MTP (multi-token prediction) |
| Parametros totales | 27,8 B en la fuente BF16 (56 GB, 18 shards). El index de safetensors de este repo declara 5.395.026.908 parametros, cifra incoherente con lo anterior y probablemente atribuible al recuento de tensores empaquetados en int4: dato no verificado |
| Parametros activos | No aplica: no es un modelo MoE. Incluye cabeza MTP de 15 tensores para decodificacion especulativa |
| Longitud de contexto | 262.144 tokens nativos; el ejemplo de servicio usa --max-model-len 131072; existe receta oficial de 1M con YaRN estatico via --hf-overrides |
| Tipos de cuantizacion | W4A16 (pesos int4, activaciones 16 bits), group_size 128, en 400 lineales; int8 en lm_head, embed_tokens y 9 tensores MTP; BF16 en normas, torre de vision (333 tensores visual.*, 0 cuantizados) y embeddings MTP. No se publican GGUF de este artefacto |
| Idiomas soportados | en, zh (segun los metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compressed-tensors pack-quantized (kernel Marlin en Ampere), mas mtp_draft_vocab_ids.pt (40.960 ids) |

## Arquitectura y entrenamiento

El modelo de partida es un ajuste abliterated en BF16: se elimino la direccion de rechazo mediante una edicion de pesos sobre 131 matrices que escriben en el residual, y posteriormente se publico como orcarouter/Qwen3.8-27B-Uncensored (revision 404ea47aaa5d8a8b00049c9e9750089aca011ab2, repo gateado con auto-aprobacion). Sobre ese arbol BF16 local, byte-identico al publicado, se aplico unicamente cuantizacion: no hay fine-tuning posterior, ni RLHF ni DPO adicionales en este paso. La plantilla de chat se modifico de forma deliberada: el nivel de esfuerzo por defecto pasa de xhigh a medium y se anaden alias del vocabulario de OpenAI/gpt-5 (minimal→low, high/max→xhigh, desconocido→medium en lugar de lanzar excepcion); el resto de la plantilla es identico al original.

La receta de cuantizacion usa Intel AutoRound (commit 1139c323, mas un parche local pack-guard para las capas linear_attn y visual no cuantizadas), esquema W4A16 con --bits 4 --group_size 128, calibracion sobre NeelNanda/pile-10k con --nsamples 128 --seqlen 2048, 200 iteraciones y --batch_size 4, con formato de salida auto_round:llm_compressor. La calibracion se ejecuto en streaming por bloques sobre una RTX 3090 (24 GB) y una RTX 3080 Ti (12 GB). El post-procesado (empaquetado int8 de lm_head/embed_tokens/MTP-MLP, construccion del vocabulario borrador de 40k ids y puerta de verificacion verify.sh) esta documentado en el repositorio syv-ai/qwen38-27b-rtx3090. El resultado son 411 tensores empaquetados (400 lineales int4 + 11 int8) y 790 tensores que permanecen en BF16.

## Capacidades

- Generacion de texto y razonamiento con modo thinking controlable por niveles de esfuerzo (low, medium, xhigh), con medium como valor por defecto en esta version.
- Razonamiento matematico medido: 98,0 % de exact match en GSM8K 5-shot con thinking activado.
- Vision-lenguaje: pipeline image-text-to-text con la torre visual intacta en BF16 (333 tensores), lo que preserva la capacidad multimodal del modelo base.
- Tool calling y function calling multi-turno, verificado con el parser qwen3_coder de vLLM y activable con --enable-auto-tool-choice.
- Decodificacion especulativa mediante la cabeza MTP y el vocabulario borrador incluido (DFlash2, k=7).
- Capacidades agenticas y de razonamiento multi-paso derivadas del modelo base Qwen3.8-27B (no cuantificadas de forma independiente en este repo).
- Multilingue limitado a ingles y chino segun los metadatos; no hay evaluacion publicada de otros idiomas para este artefacto.
- API compatible con OpenAI servida en loopback, con reasoning_effort aceptado desde cualquier cliente del protocolo OpenAI.
- Ausencia practica de rechazos por contenido (modelo abliterated).

## Casos de uso

- Asistente matematico o de analisis cuantitativo en local: con 98,0 % en GSM8K 5-shot y thinking activado, se puede desplegar como resolutor de problemas paso a paso en una unica RTX 3090, sin depender de APIs externas.
- Agente con herramientas en pipelines internos: el soporte de tool calling multi-turno con el parser qwen3_coder permite construir bucles de agente (consulta a bases de datos, ejecucion de comandos, llamadas HTTP) servidos por vLLM.
- Procesamiento de documentos largos: la ventana nativa de 262.144 tokens permite pasar contratos, expedientes o transcripciones completas en una sola peticion, con --max-model-len 131072 como configuracion conservadora.
- Extraccion estructurada multimodal: al conservar la torre de vision en BF16, sirve para transcribir y estructurar informacion de capturas, formularios escaneados o diagramas combinados con texto.
- Generacion de codigo y asistencia en IDE o CI/CD: el modelo hereda el comportamiento de Qwen3.8 en codigo y admite function calling, lo que permite integrarlo en revisiones automatizadas o generacion de tests dentro de un runner con GPU.
- Creacion de contenido narrativo sin filtros de rechazo: guiones, ficcion o dialogos donde el alineamiento estandar del modelo base bloquea tramas con violencia, ambiguedad moral o lenguaje adulto.
- Investigacion en seguridad y alineacion: al ser un modelo abliterated con la edicion de pesos documentada (131 matrices), resulta util como sujeto de red-teaming y para estudiar como se comporta la direccion de rechazo tras una cuantizacion agresiva.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye el pipeline exacto y una puerta de verificacion, lo que facilita reproducir comparaciones W4A16 frente a BF16 o FP8 sobre el mismo conjunto de calibracion.

## Benchmarks y rendimiento

| Evaluacion | Configuracion | Resultado |
|---|---|---|
| GSM8K | 5-shot, greedy, thinking activado (medium por defecto), n=250, presupuesto de 8192 tokens | 98,0 % exact match (± 0,89) |
| GSM8K | Thinking desactivado, greedy, n=200. Medido sobre el checkpoint con alineamiento de rechazo Qwen3.8-27B-W4A16-AutoRound, no sobre este artefacto | 95,5 % |
| GSM8K | Fuente BF16 (evaluacion de orcarouter, protocolo CoT, n=150) | 88,7 % (−1,3 respecto al modelo base) |
| MMLU, MMLU-Pro, CMMLU y suites de seguridad | Medidos sobre la fuente BF16 y sus derivados FP8/GGUF, no sobre este checkpoint; sin cifras publicadas en la informacion disponible | no disponible |

No se han publicado resultados de benchmarks de MMLU, HumanEval, MMLU-Pro, CMMLU ni suites de seguridad medidos sobre este artefacto concreto en la informacion disponible. La unica cifra medida sobre este checkpoint es la de GSM8K con thinking activado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,8 GiB de pesos en carga (int4 + int8), sobre un repo de 16,8 GB. El resto de la VRAM queda disponible para cache KV.
- GPU recomendadas: RTX 3090 (24 GB, Ampere) es el objetivo declarado y la plataforma verificada; el kernel Marlin de compressed-tensors esta etiquetado para Ampere. H100 y A100 son compatibles por VRAM pero no estan documentados en la model card para este artefacto.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB. No cabria en una RTX 3080 Ti (12 GB), que en este proyecto se uso solo para la calibracion en streaming por bloques.
- Configuracion de memoria recomendada: --gpu-memory-utilization 0.93 en RTX 3090, valor elegido explicitamente para evitar un OOM de arranque en WSL2/Windows.
- Opciones de despliegue: vLLM 0.28.0 o superior con --reasoning-parser qwen3, --enable-auto-tool-choice y --tool-call-parser qwen3_coder. Decodificacion especulativa DFlash2 con k=7 y API compatible con OpenAI en loopback. No se documentan llama.cpp, Ollama, TGI ni LMDeploy para este artefacto.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Contexto y memoria: con --max-model-len 131072 se mantiene un pool KV amplio a 0,93 de utilizacion; la ventana nativa es de 262.144 tokens y la receta de 1M requiere YaRN estatico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-W4A16-g128 (este) | 27,8 B en la fuente BF16 | 262.144 nativo | W4A16 g128 + int8 en lm_head/embed/MTP | GSM8K 98,0 % con thinking activado (n=250) | Apache 2.0 | Publico, 0 descargas y 0 likes en el momento de la consulta |
| orcarouter/Qwen3.8-27B-Uncensored (BF16) | 27,8 B | 262.144 | BF16 | GSM8K 88,7 % (CoT, n=150); MMLU/MMLU-Pro/CMMLU sin cifras en la informacion disponible | Apache 2.0 | Repo gateado con auto-aprobacion |
| Qwen3.8-27B-W4A16-AutoRound (checkpoint stock con alineamiento de rechazo) | no disponible | no disponible | W4A16 | GSM8K 95,5 % con thinking desactivado (n=200) | no disponible | no disponible |
| Qwen/Qwen3.8-27B (upstream) | 27,8 B | 262.144 | BF16 | no disponible | Apache 2.0 | Publico |

Las cifras de GSM8K de las tres primeras filas no son directamente comparables entre si: varian en el numero de ejemplos (150, 200 y 250), en el protocolo (CoT frente a 5-shot greedy) y en el estado del modo thinking. Ademas, la fila de 95,5 % corresponde a un checkpoint con pesos distintos a los de este repo.

## Limitaciones y advertencias

- Modelo abliterated: la direccion de rechazo ha sido eliminada mediante edicion de pesos, por lo que no aplica ninguna capa de seguridad efectiva. Puede generar contenido danino, ilegal o gravemente inapropiado ante peticiones adversas.
- Riesgo de alucinacion estandar en modelos de esta familia, agravado en dominios sin datos de evaluacion publicados para este artefacto.
- Idiomas: los metadatos solo declaran ingles y chino. El rendimiento en castellano no esta documentado ni evaluado.
- Discrepancia en el recuento de parametros: el index de safetensors declara 5.395.026.908 parametros frente a los 27,8 B del modelo BF16 de origen. Conviene verificar el artefacto antes de integrarlo en un pipeline de produccion.
- La cifra de GSM8K con thinking desactivado (95,5 %) se midio sobre un checkpoint diferente, con alineamiento de rechazo, no sobre este modelo.
- Cambios silenciosos en la plantilla de chat: el esfuerzo por defecto pasa de xhigh a medium y los valores desconocidos se resuelven a medium en lugar de provocar un error. Un cliente que antes recibia un HTTP 400 ahora obtendra una respuesta con un nivel de razonamiento distinto al esperado.
- Cuantizacion W4A16: la perdida de calidad solo se ha medido con GSM8K, una tarea matematica. No hay evaluaciones de MMLU, codigo o vision sobre estos pesos, por lo que la degradacion en otras tareas es desconocida.
- Dependencia del kernel Marlin y del hardware Ampere; el comportamiento en otras arquitecturas de GPU no esta documentado.
- Requiere el fichero mtp_draft_vocab_ids.pt (40.960 ids) para la decodificacion especulativa; omitirlo puede degradar el rendimiento o fallar en el arranque.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base esta gateado con auto-aprobacion, por lo que hay que aceptar su acuerdo antes de descargarlo y conviene revisar las condiciones de la cadena de derivacion.
- Ausencia total de validacion por parte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin retroalimentacion independiente sobre calidad o estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TyroneNel/Qwen3.8-27B-Uncensored-W4A16-g128
- Modelo base (BF16 abliterated, gateado): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo upstream (Qwen/Qwen3.8-27B, citado en el linaje como origen Apache 2.0): https://huggingface.co/Qwen/Qwen3.8-27B
- Commit de Intel AutoRound usado en la cuantizacion: https://github.com/intel/auto-round/commit/1139c323
- Repositorio del pipeline de cuantizacion y verificacion: https://github.com/syv-ai/qwen38-27b-rtx3090
- Documento de calidad del pipeline (incluye la medicion de GSM8K con thinking desactivado): https://github.com/syv-ai/qwen38-27b-rtx3090/blob/main/docs/quality.md
- Dataset de calibracion: https://huggingface.co/datasets/NeelNanda/pile-10k
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card.
