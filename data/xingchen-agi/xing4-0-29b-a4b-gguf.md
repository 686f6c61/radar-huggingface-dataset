# XingChen-AGI/Xing4.0-29B-A4B-GGUF

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por XingChen-AGI, la línea sucesora de TeleChat de China Telecom Artificial Intelligence Technology Co., Ltd. Con 29B parametros nominales (31.215.031.088 reales segun los safetensors) y solo 4B activos por token, esta disenado especificamente para tareas de ingenieria complejas, agentes autonomos y razonamiento multi-paso. Su ventana de contexto nativa es de 256K tokens, extensible a 512K.

La relevancia tecnica del modelo reside en dos puntos: es el primer modelo de esta escala entrenado integramente sobre la plataforma Ascend NPU con el framework MindSpore/MindFormers, y su arquitectura combina mHC, MLA (Multi-head Latent Attention) y MTP (Multi-Token Prediction) sobre un esqueleto MoE con 64 expertos enrutados y 1 experto compartido. El autor reporta una mejora de throughput de entrenamiento de aproximadamente el 96% respecto al rendimiento out-of-the-box gracias a optimizaciones de comunicacion MoE, recomputacion selectiva y fusion de operadores en Ascend C.

El repositorio publicado contiene pesos en formato GGUF con cuantizacion mixta IQ4_NL (unos 18 GB), lo que permite ejecutarlo en una unica GPU de consumo. La licencia Apache 2.0 y la compatibilidad con vLLM, SGLang, KTransformers y LLaMA-Factory lo posicionan como una opcion practica para despliegue en produccion, aunque el numero de descargas en el momento de la consulta es muy bajo (14), lo que indica una adopcion todavia incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion MLA, mas mHC y MTP (multi-token prediction) |
| Parametros totales | 31.215.031.088 (~31,2B), denominado comercialmente 29B |
| Parametros activos | ~4B por token (4 de 64 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 256K tokens nativos, extensible a 512K |
| Tipos de cuantizacion | IQ4_NL mixta (GGUF ~18 GB); se asume disponibilidad de otros niveles GGUF, no confirmado en la informacion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el autor indica pesos en formato Hugging Face Transformers en el repositorio principal |
| Numero de capas | 40 |
| Hidden size | 3584 |
| Tamano intermedio FFN denso | 9216 |
| Tamano intermedio por experto | 1024 |
| Expertos enrutados | 64 |
| Expertos activos por token | 4 |
| Expertos compartidos | 1 |
| Tamano del repositorio | 20,1 GB |
| Framework de entrenamiento | MindSpore / MindFormers sobre Ascend NPU (Ascend 910C) |

## Arquitectura y entrenamiento

Xing4.0-29B-A4B se apoya en una arquitectura MoE de 40 capas con hidden size de 3584. Cada token activa 4 de los 64 expertos enrutados mas un experto compartido, lo que mantiene el coste de inferencia en el orden de un modelo denso de ~4B de parametros pese a tener 31,2B totales. La atencion es de tipo MLA (Multi-head Latent Attention), que comprime las claves y valores en un espacio latente para reducir el consumo de memoria de la cache KV, un aspecto critico cuando se opera con ventanas de 256K tokens. A esto se suman mHC y MTP: el autor no detalla la definicion interna de mHC en la model card, pero la presenta como parte del nucleo arquitectonico orientado a agentes, y MTP introduce prediccion multi-token para acelerar la decodificacion.

El entrenamiento se realizo integramente sobre Ascend NPU (clusters Ascend 910C) con MindSpore y MindFormers, incluyendo adaptacion de caracteristicas para mHC y desarrollo de operadores fusionados en Ascend C. El autor reporta optimizaciones en cuatro frentes: comunicacion MoE de grano fino, recomputacion selectiva, fusion automatica de grafo y operador (DVM) y operadores fusionados mHC, con una mejora agregada de throughput de aproximadamente el 96% sobre el rendimiento de partida. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Los tags del repositorio incluyen dos identificadores arXiv (2512.24157 y 2507.18013), pero no se ha podido verificar su contenido a partir de la busqueda web realizada.

## Capacidades

- Generacion de texto conversacional con plantilla de chat y soporte de modo pensamiento (thinking mode) activable mediante `enable_thinking` en el chat template.
- Razonamiento matematico: el autor reporta 90,00 en AIME2026.
- Razonamiento complejo y multi-paso orientado a agentes, con enfasis explicito en planificacion y cadenas de ejecucion largas.
- Tool calling / function calling, con adaptacion dirigida a frameworks de agentes como OpenCode, Claude Code, OpenClaw y Hermes.
- Ingenieria de software: resolucion de issues en repositorios reales (75,00 en SWE-bench Verified) y tareas en terminal (57,50 en Terminal-Bench 2.1).
- Soporte multilingue en codigo: el autor reporta 66,00 en SWE-bench Multilingual, lo que implica manejo de repositorios con codigo y contexto en varios idiomas.
- Investigacion profunda (deep research): 60,80 en DeepresearchBII segun el autor.
- Contexto largo: 256K tokens nativos, extensible a 512K, con la ventana de 210K empleada en las evaluaciones de SWE-bench.
- Fine-tuning en dominios verticales: clasificacion de intenciones, comprension de tablas, auditoria de contratos y QA sobre bases de conocimiento.
- API compatible con OpenAI a traves de vLLM, SGLang o KTransformers.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de ingenieria de software autonomos: el modelo puede resolver issues sobre repositorios reales, como demuestra su evaluacion en SWE-bench Verified con una ventana de 210K tokens, lo que le permite cargar grandes porciones de un proyecto junto con el historial de cambios y la descripcion del problema, y generar parches verificables mediante el harness SWE-agent.
- Automatizacion de tareas en terminal y DevOps: con 57,50 en Terminal-Bench 2.1 y una ventana de hasta 64K tokens de salida en esa evaluacion, resulta adecuado para agentes que ejecutan comandos, diagnostican fallos de despliegue y encadenan operaciones de shell de varios pasos.
- Atencion al cliente multirramo con contexto largo: los 256K tokens de ventana permiten mantener conversaciones multi-turno con historial extenso, documentacion de producto y registros de tickets previos en un unico contexto, reduciendo la perdida de informacion en interacciones largas.
- Auditoria de contratos y revision documental: al soportar contexto de 256K, el modelo puede procesar contratos completos y sus anexos, y el autor indica adaptacion para auditoria de contratos como tarea de fine-tuning descendente sobre datos propietarios.
- Comprension de tablas y QA sobre bases de conocimiento: el autor menciona explicitamente ambos escenarios como objetivos de adaptacion ligera, de modo que una organizacion puede ajustar el modelo con sus propios datos para responder consultas sobre documentacion interna o extraer datos estructurados.
- Clasificacion de intenciones en produccion: con solo ~4B parametros activos, el coste por token es bajo, lo que permite desplegar el modelo como clasificador o enrutador de intenciones a gran volumen sin el coste de un modelo denso de 30B.
- Investigacion profunda automatizada: el autor reporta 60,80 en DeepresearchBII, lo que lo hace apto para pipelines de recopilacion, sintesis y contraste de fuentes en informes tecnicos o de mercado.
- Asistentes de codigo integrados en IDE o CI/CD: la compatibilidad con Claude Code y OpenCode permite conectarlo a flujos de revision de codigo automatizada, generacion de tests y analisis de pull requests dentro de un pipeline de integracion continua.
- Despliegue local en estacion de trabajo: el GGUF IQ4_NL de ~18 GB cabe en una GPU de consumo de gama alta, lo que habilita asistencia de codigo y agentes locales sin enviar datos a servicios externos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Son cifras autoevaluadas y no verificadas de forma independiente.

| Benchmark | Xing4.0-29B-A4B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---:|---:|---:|
| IFBench | 69,67 | 72,67 | 65,50 |
| AIME2026 | 90,00 | 88,30 | 92,70 |
| AA.LCR | 61,00 | 66,00 | 62,00 |
| Tau3-Bench | 64,63 | 58,90 | 67,20 |
| Claw-Eval | 76,55 (mejor) | 71,49 | 74,54 |
| SWE-bench Verified | 75,00 (mejor) | 53,00 | 76,00 |
| Terminal-Bench 2.1 | 57,50 (mejor) | 30,00 | 51,50 |
| SWE-bench Multilingual | 66,00 | 51,00 | 67,20 |
| DeepresearchBII | 60,80 (mejor) | 39,30 | 59,70 |

Condiciones de evaluacion declaradas por el autor:

- SWE-bench Verified y SWE-bench Multilingual: harness SWE-agent, temperature 1,0, top_p 0,95, repetition_penalty 1,05, ventana de 210K.
- Terminal-Bench 2.1: harness terminus-2, temperature 0,8, top_p 0,95, repetition_penalty 1,05, max_tokens 64K, timeout de 24 horas, media de 3 ejecuciones.
- Claw-Eval: harness oficial, temperature 0,8, top_p 0,95, repetition_penalty 1,05, max_tokens 16384 (la descripcion del autor queda truncada en la model card).

No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM en FP16/BF16: aproximadamente 62 GB solo para pesos (31,2B parametros x 2 bytes), mas cache KV y activaciones. No cabe en GPU de consumo.
- VRAM en IQ4_NL (GGUF publicado): aproximadamente 18 GB para los pesos, mas overhead de contexto. El autor afirma explicitamente que puede ejecutarse en una unica GPU de consumo.
- VRAM en Q8: del orden de 33 GB para pesos; requiere GPU profesional o dos GPU de consumo.
- GPU de consumo compatibles: con el GGUF IQ4_NL de 18 GB, una RTX 4090 (24 GB), RTX 4080 Super (16 GB, ajustado y con contexto reducido) o RTX 3090 (24 GB) son candidatas para el caso de 24 GB. No es viable en GPUs de 8-12 GB sin reducir contexto o cuantizar mas agresivamente.
- GPU profesionales recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para despliegue en FP16 o con lotes grandes. El autor menciona adaptacion a clusters Ascend 910C para entrenamiento, no necesariamente para inferencia.
- Opciones de despliegue: vLLM, SGLang y KTransformers para los pesos completos con API compatible con OpenAI; llama.cpp y derivados (Ollama, LM Studio) para el GGUF; LLaMA-Factory y MindFormers para fine-tuning.
- Throughput y latencia: no disponible. La ventaja teorica del MoE (4B activos de 31,2B) sugiere un coste de computo por token comparable a un modelo denso de 4B, pero no se aportan mediciones.
- Cache KV: la atencion MLA reduce el consumo de cache respecto a atencion completa, lo cual es determinante para sostener ventanas de 210-256K tokens en hardware limitado. No se aportan cifras concretas de memoria de cache.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xing4.0-29B-A4B | 29B (31,2B reales) | ~4B | 256K (512K extensible) | 75,00 | Apache 2.0 | GGUF y safetensors en Hugging Face |
| Gemma4-26B-A4B | 26B | 4B | no disponible | 53,00 | no disponible en la informacion | referenciado en la model card |
| Qwen3.6-35B-A3B | 35B | 3B | no disponible | 76,00 | no disponible en la informacion | referenciado en la model card |

El modelo se situa en el mismo segmento que Gemma4-26B-A4B y Qwen3.6-35B-A3B: MoE de tamano medio con activacion en el rango de 3-4B. Frente a ellos, Xing4.0 destaca en las tareas de agente y terminal (Terminal-Bench 2.1, Claw-Eval, DeepresearchBII) segun los datos del propio autor, mientras que Qwen3.6-35B-A3B queda por delante en AIME2026 y Tau3-Bench, y practicamente empatado en SWE-bench Verified y SWE-bench Multilingual. Gemma4-26B-A4B lidera en IFBench y AA.LCR. No se dispone de informacion sobre licencias, contexto ni formatos de pesos de los dos modelos comparados dentro de los materiales proporcionados.

## Limitaciones y advertencias

- Todos los benchmarks son autoevaluados por el autor con sus propios harnesses y parametros de decodificacion; no hay verificacion independiente ni resultados de terceros.
- La model card esta truncada en el repositorio: falta el cierre de la nota al pie de Claw-Eval, por lo que las condiciones exactas de evaluacion de ese benchmark no son verificables.
- El numero de capas, hidden size o cualquier configuracion distinta de la publicada no se ha podido contrastar con una fuente externa.
- Los idiomas soportados no estan declarados. Aunque el modelo reporta resultados en SWE-bench Multilingual, no hay indicacion de cobertura de lenguas naturales mas alla del ingles y el chino previsible en un modelo de origen chino.
- No se especifican los datos de entrenamiento, el numero de tokens ni las fases de alineacion (RLHF, DPO). No es posible evaluar sesgos derivados de la composicion del corpus.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de factualidad. Como cualquier LLM generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de QA sobre conocimiento sin contexto de respaldo.
- El termino "mHC" no viene definido en la informacion disponible; no se puede evaluar su aportacion real respecto a arquitecturas convencionales.
- Los identificadores arXiv citados (2512.24157 y 2507.18013) aparecen en los tags pero no se ha podido confirmar su contenido ni que correspondan a este modelo.
- La adopcion es muy baja: 14 descargas y 28 likes en el momento de la consulta. Esto implica poca validacion comunitaria, escasez de recetas de despliegue verificadas por terceros y mayor riesgo de incidencias no documentadas.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar los terminos del repositorio por si el autor anade condiciones especificas para los pesos.
- Dependencia de stacks de despliegue muy concretos (KTransformers, SGLang, vLLM) para la ruta no-GGUF; la compatibilidad con llama.cpp para el GGUF se deduce del formato publicado, no de una afirmacion explicita del autor.
- Los requisitos de VRAM y el rendimiento real en GPU de consumo no estan medidos en la informacion disponible; el dato de "18 GB en una GPU de consumo" es una afirmacion del autor sin cifras de latencia asociadas.
- No hay resultados para benchmarks de seguridad, toxicidad o sesgo.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Repositorio GitHub del modelo: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Guia de despliegue local en PC: https://github.com/shuxiaoqiong/xingchen-llama-pc-deploy/blob/main/README.md
- Predecesor TeleChat: https://github.com/Tele-AI/TeleChat3
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Harness de Claw-Eval: https://github.com/claw-eval/claw-eval
- arXiv 2512.24157 (referenciado en los tags; contenido no verificado): https://arxiv.org/abs/2512.24157
- arXiv 2507.18013 (referenciado en los tags; contenido no verificado): https://arxiv.org/abs/2507.18013

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas sobre WhatsApp y grabacion de llamadas, sin relacion con Xing4.0-29B-A4B.
