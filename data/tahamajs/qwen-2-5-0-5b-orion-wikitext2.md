# tahamajs/qwen-2.5-0.5b-orion-wikitext2

## Resumen
qwen-2.5-0.5b-orion-wikitext2 es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps (Qwen Attention Zoo). No es un modelo entrenado desde cero, sino un Qwen/Qwen2.5-0.5B cuyo mecanismo de atencion en el decodificador ha sido sustituido quirurgicamente por el operador ORIONAttention (Optimized Rectified Input-aware Orthogonal Network), un mecanismo de atencion subcuadratica registrado en el ATTENTION_REGISTRY de NeuralOps. El objetivo del experimento es medir si una atencion alternativa puede recuperar calidad tras un reemplazo agresivo de capas mediante destilacion de conocimiento.

El modelo parte de la arquitectura transformer de Qwen2.5-0.5B (14 cabezas de consulta, 2 cabezas KV, head_dim=64, hidden_size=896) y aplica un patron hibrido 3:1: 18 de las 24 capas usan ORION y 6 capas conservan la atencion cuadratica original como anclas. La adaptacion se realiza mediante QwenAttentionAdapter, que expande las cabezas KV 7x cuando es necesario y mantiene el contrato de una unica o_proj.

Su relevancia es fundamentalmente de investigacion: demuestra el proceso de cirugia de atencion y destilacion en dos etapas sobre un modelo pequeno, con telemetria detallada de perplexity antes y despues del ajuste. No esta pensado como modelo de produccion, sino como artefacto reproducible para estudiar atencion subcuadratica y destilacion de representaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B) con atencion hibrida 3:1: 18/24 capas con ORIONAttention y 6/24 capas con atencion cuadratica original |
| Parametros totales | no disponible (el repo solo publica pesos de atencion de 59,29 MB; el modelo base Qwen2.5-0.5B tiene 0,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso seq_len=512; el contexto nativo del base es 32.768 tokens, no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se documenta FP16 en inferencia y FP32 en parametros maestros durante entrenamiento) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, 59,29 MB) mas config.json y tokenizer.json |

## Arquitectura y entrenamiento
El modelo conserva la estructura del decoder de Qwen2.5-0.5B pero sustituye la atencion en 18 de las 24 capas por ORIONAttention, un operador de atencion subcuadratica con soporte causal, bidireccional, cross-attention y GQA nativo. Las capas en los indices [3, 7, 11, 15, 19, 23] mantienen la atencion cuadratica original como anclas, siguiendo el patron hybrid_3_1. El adaptador QwenAttentionAdapter gestiona la proyeccion 14:2 de cabezas (14 query, 2 KV, head_dim=64, hidden_size=896) con expansion 7x de las cabezas KV y fuerza el contrato de una unica o_proj.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (wikitext-2-raw-v1). La etapa 0 (post-cirugia, sin ajuste) arroja una perplexity causal de 497.411,42. La etapa 1 (alineacion con backbone congelado, 78 pasos, 54,5 s) omite lm_head y usa MSE y coseno por capa con peso 0,25. La etapa 2 (destilacion multi-capa de representaciones, 179 pasos, 125,3 s) usa MSE y coseno con peso 0,50. En total, 257 pasos en 180,1 s con seq_len=512, grad_accum=4 y topk=64, alcanzando una perplexity final de 209,62. El pico de VRAM fue de 17.404 MB en FP16 con autocast y parametros maestros FP32.

## Capacidades
- Generacion de texto causal autorregresiva (pipeline text-generation).
- Soporte de atencion causal, bidireccional y cross-attention a nivel de modulo ORIONAttention.
- Soporte nativo de GQA con expansion 7x de cabezas KV.
- Capacidad multilingue limitada: solo se declara ingles (en).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta vision, audio ni modo thinking.
- El checkpoint es un artefacto de investigacion: requiere aplicar la cirugia de atencion y cargar los pesos con strict=False, no es un modelo listo para uso directo con transformers.

## Casos de uso
- Investigacion en atencion subcuadratica: sirve como banco de pruebas reproducible para comparar ORIONAttention frente a atencion cuadratica en un transformer pequeno, cargando los pesos con apply_qwen_attention_surgery y midiendo perplexity en WikiText-2.
- Estudio de destilacion de conocimiento: la telemetria de dos etapas (MSE y coseno por capa, pesos 0,25 y 0,50) permite analizar como se recupera la calidad tras una cirugia agresiva de capas.
- Reproduccion de experimentos de cirugia de atencion: el patron hybrid_3_1 y el QwenAttentionAdapter documentan un procedimiento concreto para sustituir atencion en modelos Qwen2.5 con contrato de una unica o_proj.
- Benchmark de perplexity en WikiText-2: util para validar pipelines de evaluacion con modelos de 0,5B y comparar variantes del Attention Zoo de NeuralOps.
- Prototipado de mecanismos de atencion hibridos: permite experimentar con mezclas de capas cuadraticas y subcuadraticas sin entrenar desde cero.
- Docencia y divulgacion: ejemplo didactico de cirugia de atencion y destilacion en un modelo pequeno que cabe en una GPU consumer.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-orion-wikitext2 (post-KD) | wikitext-2-raw-v1, validation | Perplexity | 209,62 |
| qwen-2.5-0.5b-orion-wikitext2 (pre-KD, stage 0) | wikitext-2-raw-v1 | Perplexity | 497.411,42 |

Los resultados son los declarados por el autor en la model card y no estan verificados de forma independiente. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento uso 17.404 MB de pico en FP16 con parametros maestros FP32, por lo que la inferencia en FP16 deberia caber holgadamente en GPUs consumer.
- GPU recomendadas: no especificadas por el autor; por tamano (base 0,5B), cabe en RTX 3060, RTX 4060, RTX 4090 y superiores.
- Cabe en GPU consumer: si, dado el tamano del modelo base (0,5B) y los pesos de atencion de 59,29 MB.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el unico flujo documentado es transformers con el script apply_qwen_attention_surgery de NeuralOps y carga de safetensors con strict=False.
- Latencia y throughput estimados: no disponibles. El entrenamiento completo (257 pasos) tardo 180,1 s en la GPU del autor, dato no representativo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-orion-wikitext2 | 0,5B (base) | no disponible | 209,62 (no verificado) | MIT | Hugging Face, requiere cirugia de atencion |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32.768 tokens | no disponible en la informacion | Apache 2.0 (segun el modelo base, no confirmado en esta ficha) | Hugging Face, transformers estandar |
| Otros modelos del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de terceros en la informacion proporcionada para establecer una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias
- Perplexity de 209,62 en WikiText-2, muy superior a la de un modelo base bien ajustado; la calidad de generacion es limitada y no apta para produccion.
- El checkpoint solo incluye pesos de atencion (59,29 MB); requiere el modelo base Qwen2.5-0.5B y aplicar la cirugia con el codigo de NeuralOps, lo que anade dependencias no estandar.
- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues.
- Entrenado unicamente sobre WikiText-2 con seq_len=512; no se ha validado en tareas de instruccion, codigo, matematicas ni diálogo.
- Riesgo elevado de alucinacion y de degeneracion en generaciones largas por el bajo ajuste y el contexto de entrenamiento corto.
- El autor no ha verificado los resultados (verified: false en el model-index); la perplexity declarada debe tratarse como no auditada.
- La licencia MIT se aplica al repositorio, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que debe respetarse al redistribuir.
- No hay informacion sobre sesgos, filtros de seguridad ni evaluaciones de robustez.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-orion-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
