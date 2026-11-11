# swarmagents/Qwen3.8-27B-Direct-GGUF

## Resumen

Qwen3.8-27B-Direct (GGUF) es una cuantización y modificación de pesos del modelo base Qwen/Qwen3.8-27B, publicada por el usuario SwarmAgents en Hugging Face. El modelo aborda un problema concreto de los modelos de razonamiento modernos: la "rumiación circular" dentro de las secuencias de pensamiento (`<think>`), en la que el modelo repite frases como "espera, déjame comprobarlo otra vez" entre 8 y 12 veces antes de llegar a la respuesta. Según el autor, esto infla el contexto, desperdicia tiempo y provoca que el modelo dude de deducciones correctas.

La intervención consiste en una técnica denominada "In-Distribution Contrastive Orthogonal Weight Steering": se aíslan y atenúan matemáticamente los subespacios de pesos responsables de la rumiación mediante proyecciones ortogonales de rango 1 aplicadas sobre las capas de atención con compuerta (gated attention) del modelo base. El resultado declarado es una reducción del 79,8 % en tokens de pensamiento (de ~420 a ~85 por consulta) con una mejora marginal en GSM8K y HumanEval, manteniendo intactos los pesos de Multi-Token Prediction (MTP) para decodificación especulativa.

El modelo se distribuye únicamente en formato GGUF Q4_K_M (16,8 GB), con licencia Apache 2.0, y está orientado a despliegue local en Apple Silicon y GPUs de consumo con 24 GB de VRAM. Soporta inglés y chino. Es relevante para desarrolladores que quieran un modelo de razonamiento de 27B con tiempos de respuesta reducidos y sin necesidad de infraestructura de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con gated attention (`Qwen3_5ForConditionalGeneration`, `model_type: qwen3_5`); incluye cabezas MTP y módulo de visión |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del Qwen3.8-27B, un transformer con capas de atención con compuerta (gated attention). La modificación de SwarmAgents no es un reentrenamiento: es una cirugía de pesos que aplica una proyección ortogonal amortiguada de rango 1 sobre las proyecciones `self_attn.o_proj.weight` (matriz [5120, 6144]) y `mlp.down_proj.weight` (matriz [5120, 17408]) de las capas [23, 27, 31, 35, 39, 43, 47, 51]. La fórmula aplicada es `W_proj = W - β(P·W)` con β = 0,25, donde `P = v̂_l · v̂_l^T` y el vector `v̂_l` se ortogonaliza estrictamente contra los 8 componentes principales de los tokens de respuesta posteriores a `</think>` en float32. Tras la proyección, cada tensor se reescala para restaurar su norma de Frobenius original.

El autor indica que la modificación se realizó mediante cirugía directa sobre los safetensors en streaming, evitando `AutoModel.save_pretrained()` porque, según afirma, descarta silenciosamente los pesos `mtp.*`. Se preservan los 15 pesos MTP y los 333 pesos de visión, lo que mantiene la decodificación especulativa nativa (+70 % de throughput declarado en llama.cpp y vLLM). No se proporcionan datos sobre el volumen de tokens de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF/DPO); esa información corresponde al modelo original de Qwen y no se detalla en la model card.

## Capacidades

- Generación de texto y razonamiento multi-paso en modo "thinking" con secuencias de pensamiento acortadas (~85 tokens de media frente a ~420 del base).
- Generación de código en Python y otros lenguajes, con soporte declarado para tareas de sistemas y CLI (Terminal-Bench-2.1).
- Razonamiento matemático con chain-of-thought (GSM8K en configuración 8-shot).
- Capacidades de visión heredadas del modelo base (333 pesos de visión preservados), aunque no se documenta su uso en la model card.
- Decodificación especulativa mediante Multi-Token Prediction (MTP) nativa en llama.cpp y vLLM.
- Soporte multilingüe limitado a inglés y chino.
- Compatibilidad con plantilla de chat oficial de Qwen (`<|im_start|>` / `<|im_end|>`).
- Compatible con endpoints (tag `endpoints_compatible`) y con Ollama mediante Modelfile incluido.
- No se documenta soporte explícito de tool calling o function calling en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo resuelve problemas GSM8K con cadenas de pensamiento más cortas, lo que reduce el consumo de contexto y el coste por consulta en aplicaciones de tutoría o verificación de cálculos.
- Generación de código en producción: con HumanEval en 78,6 % y soporte de decodificación especulativa MTP, puede integrarse en pipelines de revisión de código o generación de tests donde la latencia importa.
- Automatización de tareas de terminal y sistemas: Terminal-Bench-2.1 en 70 % sugiere utilidad en agentes CLI que ejecutan comandos, interpretan salidas y corrigen errores en entornos Linux.
- Despliegue local en estación de trabajo: con 16,8 GB en Q4_K_M cabe en un Apple M4 Max con 24 GB de RAM unificada o en una RTX 4090, permitiendo asistentes de razonamiento sin conexión a la nube.
- Análisis de documentos técnicos en inglés o chino: la ventana de contexto (no especificada) y el modo thinking corto permiten resumir y extraer conclusiones de documentación extensa sin que el modelo se pierda en auto-verificaciones.
- Investigación en interpretabilidad mecánica: el modelo sirve como caso de estudio de steering de pesos ortogonal, permitiendo comparar activaciones y comportamiento antes y después de la intervención sobre las capas [23–51].
- Prototipado rápido con Ollama: el comando `ollama run hf.co/swarmagents/Qwen3.8-27B-Direct-GGUF:Q4_K_M` permite evaluar el modelo en minutos sin configuración adicional.

## Benchmarks y rendimiento

| Benchmark | Qwen 3.8 27B (base) | Qwen3.8-27B-Direct | Delta |
|---|---|---|---|
| Hermes Bench (capacidad general) | 65,77 % | 65,60 % | ~0,0 % |
| Terminal-Bench-2.1 (CLI y sistemas) | 67,00 % | 70,00 % | +3,0 % |
| GSM8K (8-shot CoT) | 88,50 % | 89,20 % | +0,7 % |
| HumanEval (0-shot Python) | 77,40 % | 78,60 % | +1,2 % |
| Coffman Concurrency & Logic | 100 % | 100 % | 0 % |
| Tokens de pensamiento medios | ~420 | ~85 | -79,8 % |
| Tiempo hasta solución (M4 Max local) | 65,6 s | 36,2 s | 1,8× más rápido |
| Aceleración MTP | +70 % | +70 % | mantenida |

Los datos proceden de la evaluación interna del autor sobre hardware Apple M4 Max; no se especifican tamaños de muestra, semillas ni metodología estadística. No hay resultados publicados de MMLU ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 16,8 GB para el archivo Q4_K_M; se recomienda al menos 20–24 GB de memoria disponible para margen de contexto y caché KV.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 40 GB o H100 para mayor throughput y contexto.
- Apple Silicon: M4 Max con 24 GB o más de memoria unificada; el autor reporta 36,2 s de tiempo hasta solución en esta plataforma.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con 24 GB; en GPUs de 16 GB no cabe en Q4_K_M sin offloading.
- Opciones de despliegue: llama.cpp (con `--draft-max` para MTP), Ollama (Modelfile incluido), vLLM (soporte MTP declarado). No se menciona TGI.
- Latencia y throughput: 1,8× más rápido que el base según evaluación interna; +70 % de throughput con decodificación especulativa MTP. No se publican tokens/s absolutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Direct (este) | 27,3 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Rumiación reducida, MTP preservado |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | Apache 2.0 | safetensors | Punto de partida; ~420 tokens de pensamiento |
| Alternativas de 27B–32B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se han proporcionado datos de benchmarks ni especificaciones de otros modelos comparables en la información disponible, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- La modificación de pesos es una intervención empírica del autor; no hay validación independiente de los resultados de benchmarks ni de la preservación de capacidades en dominios no evaluados.
- El steering ortogonal puede degradar sutilmente capacidades no medidas (por ejemplo, visión, tool calling o razonamiento en dominios distintos de matemáticas y código).
- Solo se distribuye una cuantización Q4_K_M; no hay versiones Q5, Q8 ni FP16 para evaluar el impacto de la cuantización frente a la modificación de pesos.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la model card.
- La reducción de tokens de pensamiento podría eliminar auto-verificaciones útiles en tareas de alta precisión; el autor reporta mejoras en GSM8K y HumanEval, pero no en tareas de razonamiento largo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen puede tener términos adicionales que conviene revisar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni auditoría de la comunidad.
- El autor afirma que `AutoModel.save_pretrained()` descarta pesos `mtp.*`; esta afirmación no está verificada de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/swarmagents/Qwen3.8-27B-Direct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/swarmagents
- Ollama: https://ollama.com
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
