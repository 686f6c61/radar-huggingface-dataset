# Tamarillo/response-safety-guard-tiny-en

## Resumen

Tamarillo/response-safety-guard-tiny-en es un clasificador de seguridad para pipelines de agentes construido sobre el encoder Ettin de 32 millones de parametros (jhu-clsp/ettin-encoder-32m). Lo desarrolla Tamarillo, que mantiene una familia de guardrails con tres variantes: tiny (32,0M, ingles), small (140,6M, 17 idiomas) y base (307,5M, 17 idiomas). El modelo resuelve un problema concreto de las pilas de observabilidad y red-teaming: auditar en una sola pasada tanto el prompt del usuario como la respuesta del asistente, distinguiendo entre cumplimiento seguro, rechazo correcto por seguridad, sobre-rechazo injustificado y jailbreak exitoso.

La arquitectura es un transformer encoder con pooling global sobre el token [CLS] y una cabeza de clasificacion multi-etiqueta con tres salidas sigmoides independientes (`prompt_unsafe`, `response_refusal`, `response_unsafe`). Frente a alternativas generativas de 7B-8B como PolyGuard-Qwen o jueces de 0,6B que requieren dos generaciones autorregresivas por turno, este modelo ofrece una unica pasada determinista de encoder, con un coste de 9,2 ms en CPU FP32 ONNX a 64 tokens y un tamano de 122,4 MB en ONNX.

Su relevancia actual radica en que sustituye pipelines de multiples modelos o de jueces generativos pesados por un unico forward pass, lo que lo hace viable en CPU, en entornos sin GPU y en bucles de evaluacion de alta frecuencia. La ventana de contexto nativa del backbone alcanza los 8.000 tokens, con entrenamiento a 3.584 tokens y evaluacion a 4.096.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Ettin), pooling global [CLS], cabeza multi-etiqueta de 3 salidas sigmoides |
| Parametros totales | 32.032.131 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 3.584 tokens de entrenamiento; 4.096 en evaluacion; 8.000 en el backbone |
| Tipos de cuantizacion | no disponible (se distribuye safetensors y ONNX FP32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (onnx/model.onnx) |
| Modelo base | jhu-clsp/ettin-encoder-32m |
| Tarea (pipeline) | text-classification (multi_label_classification) |
| Etiquetas de salida | prompt_unsafe (indice 0), response_refusal (indice 1), response_unsafe (indice 2) |
| Tamano del repositorio | 0,3 GB |
| Dependencias | transformers >= 4.48.0; sin trust_remote_code |
| Compatibilidad de despliegue | Text Embeddings Inference, endpoints compatibles, onnxruntime |

## Arquitectura y entrenamiento

El modelo parte del encoder Ettin de 32 millones de parametros, un transformer bidireccional con pooling global sobre el token [CLS]. Sobre esa representacion se anade una cabeza de clasificacion multi-etiqueta que produce tres logits independientes, cada uno pasado por una sigmoide, de modo que las tres probabilidades no compiten entre si (no es softmax). La entrada se construye como par (prompt, response) con truncacion `longest_first` y `max_length` de 3.584 durante el entrenamiento.

El entrenamiento combina cuatro conjuntos de datos: ToxicityPrompts/PolyGuardMix, nvidia/Aegis-AI-Content-Safety-Dataset-2.0, natolambert/xstest-v2-copy y HuggingFaceH4/ultrachat_200k. La model card no detalla el numero total de tokens ni la composicion exacta de la mezcla, ni si se aplicaron fases de RLHF o DPO; al tratarse de un clasificador, la optimizacion es supervisada sobre etiquetas de seguridad, rechazo y toxicidad. La innovacion principal es la formulacion de tres cabezas en una sola pasada, que permite derivar estados forenses discretos (safe_compliance, false_over_refusal, proper_safety_refusal, jailbreak_success, unsafe_response, unsafe_prompt_benign_reply) a partir de umbrales sobre las tres probabilidades. El modelo incluye una version ONNX con paridad verificada respecto a PyTorch.

## Capacidades

- Clasificacion de seguridad de prompts: detecta peticiones de contenido danino, ilegal, abusivo o contrario a politicas.
- Deteccion de rechazo del asistente: identifica si la respuesta declina o rechaza la peticion.
- Deteccion de respuesta insegura: marca salidas del asistente con contenido danino o que violan politicas (exito de jailbreak).
- Derivacion de estados forenses: combinando las tres probabilidades con un umbral (por defecto 0,5) se obtienen seis estados discretos de auditoria.
- Deteccion de jailbreak: la combinacion prompt_unsafe alto y response_unsafe alto identifica jailbreaks exitosos.
- Deteccion de sobre-rechazo: prompt seguro con rechazo del asistente senala falsos positivos de seguridad.
- Analisis de contexto largo: soporta entradas de hasta 3.584-4.096 tokens, con evaluacion especifica de "late-breach needle" a 3.200 tokens.
- Inferencia en CPU: ejecucion con onnxruntime sin PyTorch, con latencia de 9,2 ms a 64 tokens en FP32.
- No soporta tool calling, generacion de texto, vision ni audio: es exclusivamente un clasificador.

## Casos de uso

- Observabilidad de agentes en produccion: cada turno (prompt, respuesta) se puntua con un unico forward pass para etiquetar trazas como cumplimiento seguro, rechazo correcto o jailbreak; el coste de 9,2 ms en CPU permite procesar el 100% del trafico sin muestreo.
- Red-teaming automatizado: integrado en suites como garak, promptfoo o DeepEval para puntuar cada par ataque-respuesta y medir tasas de exito de jailbreak y de sobre-rechazo con las tres probabilidades.
- Filtrado previo a moderacion humana: clasificar lotes de conversaciones y enrutar solo los casos con response_unsafe o prompt_unsafe por encima del umbral a revision manual, reduciendo el volumen de revision.
- Deteccion de sobre-rechazo en asistentes: monitorizar la tasa de false_over_refusal (prompt seguro, respuesta rechazada) para ajustar system prompts y reducir friccion con el usuario.
- Auditoria de cumplimiento y forense: reconstruir la secuencia de estados por conversacion para evidenciar si un agente rechazo correctamente, cumplio de forma segura o fue comprometido.
- Puerta de seguridad en pipelines RAG o de agentes: validar la respuesta generada por otro modelo antes de devolverla al usuario, usando response_unsafe como senal de bloqueo.
- Evaluacion de modelos durante el desarrollo: comparar checkpoints o variantes de un asistente midiendo la distribucion de estados forenses sobre un conjunto fijo de prompts, con inferencia en CPU y sin GPU dedicada.

## Benchmarks y rendimiento

| Evaluacion | Metrica | Valor |
|---|---|---|
| OOD PKU-SafeRLHF, response_unsafe | F1 | 0,778 |
| OOD PKU-SafeRLHF, response_unsafe | FPR | 0,150 |
| OOD PKU-SafeRLHF, response_unsafe | ROC-AUC | 0,871 |
| Late-breach needle a 3.200 tokens | F1 | 0,810 |
| Late-breach needle a 3.200 tokens | FPR | 0,150 |
| Latencia CPU ONNX FP32 a 64 tokens | ms | 9,2 |
| Tamano ONNX FP32 | MB | 122,4 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP32 ocupa aproximadamente 128 MB de pesos (32,0M parametros), por lo que cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de VRAM es suficiente (RTX 4090, A100, H100 no son necesarias).
- Cabe en GPU consumer: si, en cualquier modelo consumer moderna e incluso en GPUs integradas.
- Despliegue: onnxruntime (CPUExecutionProvider) sin PyTorch, transformers con AutoModelForSequenceClassification, Text Embeddings Inference y endpoints compatibles.
- Latencia y throughput: 9,2 ms por inferencia en CPU FP32 ONNX a 64 tokens; el throughput escala con el numero de hilos y el tamano de lote, aunque la model card no publica cifras de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Enfoque | Licencia |
|---|---|---|---|---|---|
| Tamarillo/response-safety-guard-tiny-en | 32,0M | 3.584-4.096 | ingles | Encoder, 3 cabezas, 1 pasada | Apache-2.0 |
| Qwen/Qwen3Guard-Gen-0.6B | 0,6B | no disponible | no disponible | Generativo, 2 pasadas por turno | no disponible |
| ToxicityPrompts/PolyGuard-Qwen | 7,6B | no disponible | no disponible | Generativo, juez | no disponible |
| allenai/wildguard | 7B-8B (familia) | no disponible | no disponible | Generativo, juez | gated |
| protectai/distilroberta-base-rejection-v1 | 82M | 512 | ingles | Clasificador de rechazo de una sola cabeza | no disponible |
| garak-llm/garak-refusal-detector | 150M | 4K | ingles | Clasificador de rechazo de una sola cabeza | no disponible |

La ventaja declarada por el autor es el coste: 240 veces menos parametros que PolyGuard-Qwen (7,6B) y 19 veces menos que Qwen3Guard-Gen-0,6B, con una sola pasada determinista frente a las dos generaciones autorregresivas de Qwen3Guard. Los clasificadores de una sola cabeza no pueden puntuar la peligrosidad del prompt ni de la respuesta.

## Limitaciones y advertencias

- Solo ingles: no esta entrenado para otros idiomas y su rendimiento en texto no ingles no esta garantizado.
- Es un clasificador, no un generador: no produce texto ni razona; solo emite tres probabilidades.
- Umbral fijo por defecto de 0,5: los estados forenses dependen del umbral elegido; en produccion conviene calibrarlo por caso de uso.
- Riesgo de falsos positivos y negativos: la evaluacion OOD reporta FPR de 0,150 en response_unsafe, lo que implica una tasa de bloqueo injustificado no despreciable.
- Sesgos de los datos de entrenamiento: la mezcla incluye conjuntos de toxicidad y seguridad que pueden sobrerrepresentar ciertos tipos de contenido y determinados registros del ingles.
- Ventana limitada: aunque el backbone soporta 8.000 tokens, el entrenamiento se hizo a 3.584, por lo que el rendimiento mas alla de esa longitud puede degradarse.
- No sustituye a un juez generativo en casos que requieren razonamiento sobre la intencion; esta pensado como capa rapida y determinista.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios no cubiertos por los datos de entrenamiento.
- Sin datos publicados de benchmarks estandar de seguridad mas alla de los reportados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/response-safety-guard-tiny-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Demo interactiva (ONNX en navegador): https://huggingface.co/Tamarillo/response-safety-guard-demo
- Variante small (140,6M, 17 idiomas): https://huggingface.co/Tamarillo/response-safety-guard-small
- Variante base (307,5M, 17 idiomas): https://huggingface.co/Tamarillo/response-safety-guard-base
- Dataset ToxicityPrompts/PolyGuardMix: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix
- Dataset nvidia/Aegis-AI-Content-Safety-Dataset-2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset natolambert/xstest-v2-copy: https://huggingface.co/datasets/natolambert/xstest-v2-copy
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
