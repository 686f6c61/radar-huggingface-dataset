# ytbby/Qwen3-8B-ZeroZero-Heretic

## Resumen

Qwen3-8B ZeroZero Heretic es una variante del modelo Qwen3-8B de Alibaba (Qwen Team) modificada mediante la herramienta Heretic 2.0.0 de Philipp Emanuel Weidmann para reducir drásticamente los rechazos (refusals) y el texto de relleno ("slop") que caracterizan al modelo base. El autor de la ficha en Hugging Face es ytbby, mientras que la model card atribuye la modificación y publicación a Last Machine. El modelo conserva la arquitectura y el tokenizador originales de Qwen3-8B: 8.190.735.360 parámetros, 36 capas y 32.768 tokens de contexto nativo.

El problema que resuelve es doble: por un lado, elimina la mayor parte de los rechazos ante prompts que el modelo base considera problemáticos (de 100/100 a 9/100 en la batería de prueba de Heretic); por otro, reduce la verbosidad vacía y las muletillas típicas de los LLM (de 16,5 a 3,6 palabras de slop por cada 1.000). Es relevante ahora porque demuestra que las técnicas de abliteration y eliminación de slop han madurado hasta el punto de poder aplicarse con métricas verificables y sin degradar las comprobaciones de hechos y lógica (13/15 antes y después).

La ficha se publicó el 9 de noviembre de 2026, no tiene descargas ni likes registrados y el acceso está restringido mediante gate. La licencia es Apache 2.0, aunque el modelo base Qwen3-8B también lo es. El modelo está pensado para uso conversacional en inglés y no debe confundirse con una mejora de veracidad: sus propias advertencias indican que sigue siendo un LLM falible y que, en temas relacionados con China, reproduce narrativas oficiales sanitizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), 36 capas |
| Parametros totales | 8.190.735.360 (8,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos |
| Tipos de cuantizacion | safetensors en el repo principal; GGUF Q4_K_M y MLX 4-bit en repos derivados |
| Idiomas soportados | en (ingles declarado); el modelo base Qwen3 soporta mas idiomas, pero la model card solo declara en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF y MLX en repos separados |

## Arquitectura y entrenamiento

La arquitectura es la stock de Qwen3-8B: un transformer decoder-only denso de 36 capas con 8,2 mil millones de parametros, tokenizador original y modo de pensamiento (thinking mode) intacto. No hay cambios estructurales; la modificacion se aplica exclusivamente sobre los pesos mediante la herramienta Heretic 2.0.0, que implementa un mecanismo de reduccion de rechazos y otro de reduccion de slop, ambos con optimizaciones propias del autor.

El proceso de modificacion consistio en 50 ensayos para refusals y 50 para slop, seleccionando el ensayo 39 y luego el 20. La divergencia KL respecto al modelo base es de 2,69 en prompts inofensivos, lo que indica un desplazamiento profundo de la distribucion; respecto al modelo decensurado previo (antes del pase noslop) la KL es de 0,76 en prompts de escritura. No se documentan datos de entrenamiento adicionales, tokens de preentrenamiento, RLHF ni DPO; el modelo base Qwen3-8B tiene su propia ficha con esa informacion, pero no se reproduce aqui.

## Capacidades

- Generacion de texto conversacional en ingles con modo de pensamiento opcional (bloque `<think>` activable o desactivable).
- Reduccion drastica de rechazos: 91% menos en la prueba de prompts daninos de Heretic (de 100/100 a 9/100).
- Reduccion de slop: 68% menos respuestas que tocan la lista de slop (de 78/100 a 25/100) y 78% menos palabras de slop por cada 1.000 (de 16,5 a 3,6).
- Mantiene las comprobaciones de hechos y logica del modelo base: 13/15 antes y despues.
- Capacidades de Qwen3-8B heredadas: razonamiento, codigo, matematicas y conversacion multi-turno (no verificadas de forma independiente en esta ficha).
- Soporte de plantilla de chat (`apply_chat_template`) con `enable_thinking` configurable.
- No se documenta tool calling, function calling, capacidades de agente ni vision en la informacion disponible.

## Casos de uso

- Generacion de texto creativo sin rechazos: el modelo responde a prompts de escritura que el Qwen3-8B base rechazaria, con menos muletillas y verbosidad (3,6 palabras de slop por 1.000 frente a 16,5), lo que reduce la necesidad de post-edicion.
- Experimentacion en investigacion sobre alineacion: sirve como contrapunto al modelo base para estudiar como cambia el comportamiento al eliminar rechazos y slop, con metricas de KL y de refusals documentadas.
- Desarrollo de demos de chat locales: al existir builds GGUF Q4_K_M y MLX 4-bit, puede ejecutarse en LM Studio, llama.cpp y mlx-lm en equipos de consumo, sin infraestructura de servidor.
- Evaluacion de sistemas de moderacion: al no tener filtro integrado, es util para probar que tan robusto es un filtro externo de moderacion antes de desplegar un LLM en produccion.
- Generacion de borradores en ingles con estilo conciso: la reduccion de slop y la menor longitud de respuesta (menos de la mitad de palabras en prompts de escritura) encajan en pipelines que priorizan densidad informativa.
- Pruebas de robustez y red teaming: la bateria de 24 preguntas normales con cero rechazos y cero bucles permite comparar el comportamiento frente a Claude Opus 5.5 y Qwen3-8B en condiciones controladas.

## Benchmarks y rendimiento

| Medida | Antes (Qwen3-8B) | Despues (ZeroZero) | Cambio |
|---|---:|---:|---:|
| Rechazos en prueba de prompts daninos de Heretic | 100/100 | 9/100 | -91% |
| Respuestas que tocan la lista de slop | 78/100 | 25/100 | -68% |
| Palabras de slop por 1.000 | 16,5 | 3,6 | -78% |
| Comprobaciones de hechos y logica superadas | 13/15 | 13/15 | sin cambio |
| Rechazos en 24 preguntas normales | 2 | 0 | -2 |
| Bucles en respuestas (24 preguntas) | 0 | 0 | sin cambio |

Comparativa head to head con Claude Opus 5.5 (misma muestra de 24 preguntas, mismo system prompt, limite de 500 tokens, thinking desactivado): ZeroZero 0 rechazos, 3,6 palabras de slop por 1.000 y 13/15 comprobaciones; Claude Opus 5.5, 0 rechazos, 3,9 palabras de slop por 1.000 y 15/15 comprobaciones. La muestra de 24 preguntas es pequena y las pruebas son comprobaciones de texto simples, segun advierte el propio autor. No se publican resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en safetensors: aproximadamente 16,4 GB en el repo (pesos en precision de entrenamiento); en bf16 caberia en GPUs de 24 GB o mas, en fp16 similar.
- Cuantizaciones disponibles: GGUF Q4_K_M (repo LastMachine/Qwen3-8B-ZeroZero-Heretic-GGUF) y MLX 4-bit (repo LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX); con 4 bits el peso ronda los 4-5 GB y cabe en GPUs consumer de 8 GB en adelante.
- GPU recomendadas: A100 y H100 para despliegue en bf16 sin cuantizar; RTX 4090 (24 GB) para bf16; RTX 3060/4060 (8-12 GB) con cuantizacion 4-bit.
- Cabe en GPU consumer: si, con cuantizacion GGUF Q4_K_M o MLX 4-bit; en Apple Silicon mediante LM Studio o mlx-lm.
- Opciones de despliegue: Transformers (>=4.51.0), llama.cpp, LM Studio, mlx-lm, text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles.
- Latencia y throughput: no disponible; no se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (prueba Heretic) | Slop por 1.000 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Qwen3-8B ZeroZero Heretic | 8,2B | 32.768 | 9/100 | 3,6 | Apache 2.0 | HF (gated) |
| Qwen/Qwen3-8B | 8,2B | 32.768 | 100/100 | 16,5 | Apache 2.0 | HF (abierto) |
| Claude Opus 5.5 | no disponible | no disponible | 0/24 en muestra normal | 3,9 | propietaria | API comercial |

La comparativa se limita a estos tres porque son los unicos con datos en la informacion disponible. Las cifras de rechazos no son directamente comparables entre filas: la de Qwen3-8B y ZeroZero corresponde a la prueba de 100 prompts daninos de Heretic, mientras que la de Claude Opus 5.5 corresponde a la muestra de 24 preguntas normales.

## Limitaciones y advertencias

- No tiene guardrails: responde a peticiones que Qwen3-8B rechaza y no incluye filtro integrado; si se expone a usuarios reales, es obligatorio anteponer moderacion propia.
- Puede ser confiadamente erroneo: menos slop no implica mas veracidad; la model card lo advierte explicitamente.
- Sesgo geopolitico documentado: ante preguntas sobre Tiananmen Square ofrece una version oficial sanitizada que omite las protestas y la represion, y exagera la posicion de Una Sola China sobre Taiwan. No es fiable en temas relacionados con China.
- Escasa capacidad de pushback: califico como "no del todo irrazonable" invertir los ahorros en boletos de loteria; no debe usarse para decisiones financieras, medicas ni legales.
- Idioma: solo declara ingles; el rendimiento en castellano no esta verificado.
- Divergencia alta respecto al base: KL de 2,69 en prompts inofensivos, lo que implica cambios de comportamiento mas alla de los rechazos.
- Acceso restringido: el repo esta gated y requiere aceptar terminos (nombre, uso previsto y casilla de aceptacion) antes de descargar.
- Herramienta de modificacion: Heretic es AGPL-3.0; la licencia del modelo resultante es Apache 2.0, pero conviene revisar implicaciones si se redistribuye el codigo de la herramienta.
- Muestra pequena en la comparativa head to head (24 preguntas), segun reconoce el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ytbby/Qwen3-8B-ZeroZero-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repo GGUF Q4_K_M: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-GGUF
- Repo MLX 4-bit: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Perfil del modificador/publicador: https://huggingface.co/LastMachine
- Paper Qwen3 (referencia arXiv en tags): https://arxiv.org/abs/2505.09388
