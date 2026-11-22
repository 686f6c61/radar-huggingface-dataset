# TechnoBaptist/Inkling-2-Mini-heretic

## Resumen

Inkling-2-Mini-heretic es un derivado no oficial de `thinkingmachines/Inkling-2-Mini`, publicado por el usuario TechnoBaptist (la model card menciona también el alias Infatoshi). Se trata de un checkpoint con los pesos "abliterados", es decir, con la dirección de rechazo proyectada fuera del flujo residual para eliminar el comportamiento de negativa ante peticiones dañinas. El modelo base lo desarrolla Thinking Machines Lab y emplea una arquitectura transformer con núcleo "loopeado" de 24 capas físicas recorridas en tres pasadas (48 visitas lógicas), bloques `ShortConvolution` y una mezcla de expertos enrutados cuantizados en NVFP4 y MXFP8.

El checkpoint conserva el pipeline de generación de texto y las capacidades del original (razonamiento, tool calling, contexto muy largo), pero modifica quirúrgicamente los pesos de atención, el controlador de bucle y los 128 expertos enrutados. El resultado declarado es un aumento drástico de la tasa de cumplimiento ante prompts dañinos (HarmBench ASR del 4,33 % al 73,33 %) con una degradación moderada en HumanEval y prácticamente nula en GSM8K.

Es relevante ahora porque ejemplifica una técnica de "abliteración proyectada" adaptada a arquitecturas no convencionales (bucles, convoluciones cortas, MoE cuantizado en FP4/FP8) y porque distribuye pesos de 26 388 646 440 parámetros en formato safetensors bajo licencia Apache 2.0, con un comando de servicio reproducible sobre SGLang y una única GPU Blackwell de 96 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con núcleo loopeado (24 capas físicas, 3 pasadas = 48 visitas lógicas), bloques `ShortConvolution` y MoE enrutado |
| Parámetros totales | 26 388 646 440 (≈26,4 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262 144 tokens (valor usado en el comando de servicio recomendado) |
| Tipos de cuantización | NVFP4 (capas 0-19) y MXFP8 (capas 20-23) en expertos enrutados; pesos BF16 en atención y controlador de bucle; checkpoint servido en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 20,2 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con un diseño poco habitual: un preludio de 6 capas, un núcleo de 12 capas que se recorre tres veces (48 visitas lógicas sobre 24 capas físicas), una coda de 6 capas y una normalización final. Incorpora bloques `ShortConvolution` con procesamiento por canales y un MoE enrutado con 128 expertos, cuantizados de forma mixta en NVFP4 (capas 0-19) y MXFP8 (capas 20-23). El vocabulario tiene 201 024 tokens y el modelo soporta modo de razonamiento (`reasoning_effort`) y tool calling nativo con parser `inkling2`.

El proceso de abliteración, descrito en la model card, consta de dos etapas iterativas. Primero se capturan los 49 estados residuales (6 preludio + 3×12 núcleo + 6 coda + norma final) en las fronteras de plantilla de chat `<|message_model|><|content_thinking|>` y `<|message_model|><|content_text|>`, sobre conjuntos disjuntos de prompts dañinos (AdvBench + XSTest-unsafe) y benignos (XSTest-safe). Como la dirección de rechazo rota fuertemente entre pasadas del bucle (coseno entre pasada 0 y pasada 2 de 0,29 en la capa 17) y atraviesa capas `ShortConvolution`, se construye una base ortonormal de rango 4 por capa física mediante Gram-Schmidt, proyectada ortogonal a las medias residuales benignas y precompensada por `1 + sconv.weight[:, -1]`. La ablación cubre conjuntamente `attn.wo_ud.weight` en BF16, el controlador de bucle `gain_weight` (capas 6-17) y los 128 expertos enrutados (`mlp.experts.w2_weight`), con desquantización, ablación y recuantización bit-compatible. La segunda etapa captura activaciones frescas dentro del modelo ya ablacionado y optimiza con Optuna TPE multivariante multiobjetivo, minimizando simultáneamente la no conformidad medida por `cais/HarmBench-Llama-2-13b-cls` y la divergencia KL del primer token de respuesta sobre el vocabulario completo.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 262 144 tokens.
- Razonamiento explícito con modo "thinking" controlable mediante `reasoning_effort`.
- Tool calling nativo con parser `inkling2` (verificado como PASS en la evaluación del autor).
- Razonamiento multi-paso y uso como agente, apoyado en el modo de razonamiento y el soporte de herramientas.
- Capacidad multimodal: el comando de servicio recomendado activa `--enable-multimodal`.
- Generación de código y matemáticas: HumanEval 90,24 % y GSM8K 96,36 % en la evaluación del autor.
- Decodificación especulativa compatible (DSpark) con cabecera de draft en MXFP8.
- Comportamiento "uncensored": elimina la negativa ante peticiones dañinas, manteniendo alta tasa de no rechazo en prompts benignos (XSTest-Safe 99,60 %).

## Casos de uso

- Investigación en seguridad y alineación: el checkpoint sirve como referencia para estudiar ataques de abliteración, medir la robustez de clasificadores de daño y evaluar la eficacia de contramedidas, ya que documenta ASR en HarmBench y JailbreakBench con clasificador oficial.
- Evaluación de pipelines de moderación: al elevar el ASR al 73,33 %, permite probar sistemas de filtrado de entrada/salida en condiciones adversas realistas que un modelo alineado no reproduce.
- Generación de código en producción: con HumanEval del 90,24 % y tool calling nativo, puede integrarse en pipelines de CI/CD para autocompletado, generación de tests y refactorización asistida.
- Agentes autónomos multi-paso: la ventana de 262 144 tokens y el modo de razonamiento permiten mantener estado de tareas largas con múltiples llamadas a herramientas.
- Análisis de documentos extensos: resumen y extracción de información sobre corpus de cientos de miles de tokens en una sola pasada, con decodificación especulativa para reducir latencia.
- Asistencia conversacional sin restricciones temáticas: útil en entornos de investigación creativa o red teaming donde las negativas del modelo base interfieren con la tarea.
- Serving de alto rendimiento en una sola GPU: el comando SGLang con TP=1 y EP=1 sobre RTX PRO 6000 Blackwell (96 GB) permite desplegar el modelo completo con contexto máximo y decodificación especulativa.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados con decodificación greedy (`temperature=0.0`, `reasoning_effort="low"`, `max_tokens=2048`) sobre SGLang con DSpark en una RTX PRO 6000 Blackwell:

| Métrica | Inkling-2-Mini (base) | Inkling-2-Mini-heretic | Delta |
|---|---:|---:|---:|
| HarmBench-13B ASR (300) | 13/300 (4,33 %) | 220/300 (73,33 %) | +69,00 pp |
| HarmBench Standard (200) | 2/200 (1,00 %) | 130/200 (65,00 %) | +64,00 pp |
| HarmBench Contextual (100) | 11/100 (11,00 %) | 90/100 (90,00 %) | +79,00 pp |
| JailbreakBench-13B Aux ASR (100) | 0/100 (0,00 %) | 56/100 (56,00 %) | +56,00 pp |
| XSTest-Safe Non-Refusal (250) | 247/250 (98,80 %) | 249/250 (99,60 %) | +0,80 pp |
| GSM8K (1319) | 1279/1319 (96,97 %) | 1271/1319 (96,36 %) | −0,61 pp |
| HumanEval (164) | 158/164 (96,34 %) | 148/164 (90,24 %) | −6,10 pp |
| Prefill Integrity Probe | PASS | PASS | — |
| Native Tool Calling (`inkling2`) | PASS | PASS | — |

El autor indica que 5 de los fallos adicionales en HumanEval fueron truncamientos por `finish_reason=length` con `max_tokens=2048`, no errores de API. No se han publicado resultados de MMLU u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 20,2 GB en safetensors; el servicio recomendado usa `--mem-fraction-static 0.88` sobre una GPU de 96 GB, lo que deja aproximadamente 84 GB para pesos, caché KV y buffers con contexto de 262 144 tokens.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB, SM120) es la configuración validada por el autor. Por tamaño, también cabría en A100 80 GB o H100 80 GB, aunque no se documenta soporte explícito de los kernels NVFP4/MXFP8 en esas arquitecturas.
- GPU de consumo: no se documenta. Un checkpoint de 20,2 GB en BF16 no cabe en GPUs de 16-24 GB sin cuantización adicional no publicada.
- Opciones de despliegue: SGLang con la imagen `lmsysorg/sglang:inkling-2-mini` es la vía recomendada, con decodificación especulativa DSpark, backend de atención `fa4`, `--page-size 128`, gramática `xgrammar` y parsers `inkling`/`inkling2`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El comando recomendado limita `--max-running-requests 16` y usa 8 tokens de draft especulativo, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| Inkling-2-Mini-heretic | ≈26,4 mil millones | 262 144 | Apache 2.0 | Derivado abliterado, MoE NVFP4/MXFP8, sin benchmarks públicos de terceros |
| thinkingmachines/Inkling-2-Mini | ≈26,4 mil millones | 262 144 | Apache 2.0 | Modelo base alineado; HumanEval 96,34 %, GSM8K 96,97 %, HarmBench ASR 4,33 % |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Eliminación deliberada de la alineación de seguridad: el ASR en HarmBench sube al 73,33 % y el modelo cumple peticiones dañinas. No debe desplegarse en aplicaciones orientadas al público sin moderación externa robusta.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de calibración; el proceso de ablación puede alterar circuitos secundarios de razonamiento no medidos.
- Degradación en código: HumanEval cae 6,10 puntos porcentuales, con truncamientos por longitud en trazas de razonamiento largas; conviene aumentar `max_tokens` en producción.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni calidad fuera del inglés.
- Sesgos: no se han publicado evaluaciones de sesgo demográfico, toxicidad ni sesgo de género en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint modificado; la responsabilidad legal del uso recae en el desplegador.
- Validación limitada: 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente de los resultados declarados; los benchmarks proceden del propio autor.
- Hardware restringido: los kernels NVFP4/MXFP8 y la decodificación DSpark están validados solo en Blackwell SM120; el rendimiento en otras arquitecturas no está documentado.
- Arquitectura loopeada con `ShortConvolution`: la compatibilidad con frameworks distintos de SGLang no está verificada y puede requerir kernels específicos.

## Enlaces

- Hugging Face: https://huggingface.co/TechnoBaptist/Inkling-2-Mini-heretic
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Clasificador HarmBench usado en la evaluación: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Imagen de servicio SGLang: `lmsysorg/sglang:inkling-2-mini` (no se proporciona URL en la información disponible)
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada
