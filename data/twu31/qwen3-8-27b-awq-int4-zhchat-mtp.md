# Twu31/Qwen3.8-27B-AWQ-INT4-ZhChat-MTP

## Resumen

El modelo `Twu31/Qwen3.8-27B-AWQ-INT4-ZhChat-MTP` es una cuantizacion INT4 (W4A16) del modelo base `Qwen/Qwen3.8-27B`, desarrollada por el usuario Twu31. Esta optimizado especificamente para servir dialogos conversacionales en chino hablado con la menor latencia posible, manteniendo la cabeza de decodificacion especulativa MTP (Multi-Token Prediction) intacta y verificada en vLLM. El checkpoint esta calibrado sobre trafico real de conversacion: un prompt de sistema largo en chino, turnos cortos coloquiales con ruido de ASR y una etiqueta `[emotion:X]` al final de cada turno para dirigir expresiones faciales, con el modo de razonamiento (thinking) desactivado.

La arquitectura es hibrida: combina atencion tradicional con capas Gated-DeltaNet (GDN), lo que reduce la memoria de cache KV a solo 16 de las 64 capas. Incluye una torre de vision que se mantiene en BF16, por lo que admite entrada de imagen y video. El resultado es un modelo de 19,45 GB que en una RTX 6000 Ada alcanza 415 ms por turno de 18 tokens con un prompt de 1,6 k tokens, comparable a un MoE de 35B-A3B en la misma tarjeta. Es relevante para aplicaciones de agentes de voz y chatbots en tiempo real donde la latencia de extremo a extremo es critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated-DeltaNet (atencion lineal) + atencion tradicional, con torre de vision |
| Parametros totales | 6.260.690.960 (segun safetensors del checkpoint cuantizado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 12288 tokens (segun la receta de vLLM recomendada) |
| Tipos de cuantizacion | INT4 simetrico W4A16, group_size 128, formato compressed-tensors, optimizado con Intel AutoRound |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida con 64 capas, de las cuales solo 16 mantienen cache KV tradicional, mientras que el resto usa capas Gated-DeltaNet (GDN) con atencion lineal. Esto reduce significativamente el consumo de memoria de cache y acelera la decodificacion. La cuantizacion se realizo con Intel AutoRound 0.14.2 (redondeo con gradiente firmado), sobre 530 secuencias de al menos 2048 tokens, con 60 % de dialogo chino hablado de estilo produccion (prompt de sistema de 1,4 k tokens, 10-20 turnos coloquiales y etiqueta de emocion), 20 % de dialogo coloquial sin sistema y 20 % de chat general zh/en (ShareGPT-GPT4, UltraChat). El proceso tardo 1 hora y 14 minutos en una RTX 6000 Ada con 28 GB de VRAM.

La cabeza MTP (draft head) se conserva en BF16 y se ha verificado su funcionamiento en vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'`, logrando una tasa de aceptacion del 73,1 % en chat chino, frente al 58 % de una version calibrada con pile-10k. La torre de vision, el `lm_head`, las embeddings y las puertas GDN (`in_proj_a/b`) tambien se mantienen en BF16 para preservar la calidad y permitir tensor parallelism sin restricciones de dimension minima en el kernel Marlin.

## Capacidades

- Generacion de texto conversacional en chino e ingles, con soporte para etiquetas de emocion (`[emotion:happy|neutral|curious|sad|shy|surprised|angry]`) para dirigir expresiones faciales en agentes virtuales.
- Decodificacion especulativa MTP integrada y verificada, con 2 tokens especulativos y una aceleracion de 1,49× en velocidad de decodificacion (de 20,4 a 13,7 ms/token).
- Entrada multimodal de imagen y video gracias a la torre de vision conservada en BF16 (verificada a traves de vLLM).
- Modo de razonamiento desactivado por defecto (thinking off) para latencia minima en conversacion; se puede activar si se necesita.
- Capacidades multilingues limitadas a chino e ingles, con enfasis en chino conversacional.
- Compatible con el kernel Marlin W4A16 en GPUs con SM 8.0 o superior (Ampere y posteriores).

## Casos de uso

- Agentes de voz en chino: el modelo esta calibrado para dialogos hablados con ruido ASR y turnos cortos, por lo que es idoneo para asistentes de voz en tiempo real que requieren respuestas de 20-60 tokens con latencia de extremo a extremo inferior a 500 ms.
- Atencion al cliente automatizada: con un prompt de sistema largo que define la personalidad y las politicas, el modelo gestiona conversaciones multi-turno con contexto de 1,6 k tokens y mantiene un TTFT de 67 ms, adecuado para canales de chat en vivo.
- Avatares digitales con expresion emocional: la etiqueta `[emotion:X]` permite que un sistema de animacion facial sincronice expresiones con el contenido generado, ideal para personajes virtuales en aplicaciones de entretenimiento.
- Generacion de contenido multimodal: al conservar la torre de vision, puede procesar entradas de imagen o video y generar descripciones o respuestas contextuales, util en sistemas de asistencia visual.
- Despliegue en produccion con vLLM: la integracion con el servidor vLLM (version 0.17 o superior) permite servir el modelo con prefijo caching y configuracion de MTP sin necesidad de flags adicionales de cuantizacion.
- Prototipado rapido en entornos con recursos limitados: al ocupar solo 19,45 GB, cabe en una GPU de 24 GB para inferencia de texto, lo que facilita pruebas locales antes de escalar a multiples GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona datos de rendimiento de inferencia medidos en una RTX 6000 Ada con prompts de conversacion reales (prompt de sistema chino de 1,4 k tokens, 2 turnos de historial y una utterance de usuario, greedy, thinking off, 18 prompts × 3 ejecuciones). Los resultados son:

| Metrica | Valor |
|---|---|
| TTFT (tiempo hasta el primer token) | 67 ms |
| Latencia por turno (18 tokens) | 415 ms |
| Decode speed sin MTP | 20,4 ms/token |
| Decode speed con MTP | 13,7 ms/token (1,49×) |
| Tasa de aceptacion MTP | 73,1 % |

## Requisitos de hardware

- VRAM estimada: 19,45 GB para el checkpoint cuantizado; se recomienda una GPU de 24 GB para servir solo texto con contexto modesto, y 48 GB o mas para contextos mayores o con vision.
- GPUs compatibles: cualquier GPU con SM 8.0 o superior (Ampere y posteriores), incluyendo A100/A800, RTX 30/40 series, RTX 6000 Ada, L40S y H100. El kernel Marlin requiere estas arquitecturas.
- Despliegue recomendado: vLLM version 0.17 o superior (probado en 0.24.0 y 0.27.1). Tambien puede cargarse en Transformers ≥ 5.8 con `compressed-tensors` para inferencia, aunque se recomienda vLLM para servir.
- Configuracion optima: usar `--enable-prefix-caching` y `--mamba-ssm-cache-dtype bfloat16` para minimizar latencia. No se debe usar `--calculate-kv-scales` en modelos hibridos GDN+attention (ver issue vllm#37554).
- Latencia y throughput: con la receta A (sin MTP), se logran 415 ms por turno de 18 tokens en una RTX 6000 Ada. Con MTP activado (receta B), la velocidad de decodificacion mejora un 49 % para respuestas de mas de 25 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Latencia (RTX 6000 Ada) |
|---|---|---|---|---|---|
| Twu31/Qwen3.8-27B-AWQ-INT4-ZhChat-MTP | 6,26 B (checkpoint cuantizado) | 12 k (configurado) | INT4 W4A16 | Apache-2.0 | 415 ms/turno (18 tokens) |
| Qwen/Qwen3.8-27B (base, BF16) | 27 B (estimado) | no disponible | BF16 | Apache-2.0 | no disponible (mayor VRAM y latencia) |
| MoE 35B-A3B (mencionado en la model card) | 35 B total, 3 B activos | no disponible | no especificada | no disponible | comparable a este modelo (segun el autor) |

La comparativa se basa en los datos proporcionados por el autor. No se dispone de benchmarks estandar para una comparacion objetiva de calidad.

## Limitaciones y advertencias

- El modelo esta calibrado principalmente para chino conversacional hablado; su rendimiento en otros idiomas o en tareas de razonamiento largo con thinking activado puede degradarse.
- La cuantizacion INT4 puede introducir perdida de precision en tareas de alta complejidad, aunque el autor reporta que la calibracion especifica mejora la aceptacion MTP frente a calibraciones genericas.
- El numero de parametros reportado en safetensors (6,26 B) es significativamente inferior al nombre "27B" del modelo base; esto podria deberse a un error en el checkpoint o a que solo se cuantizaron los pesos principales, pero no se ha aclarado en la documentacion.
- No se garantiza soporte para tool calling o function calling, ya que no se menciona en la model card; si se necesita, debe verificarse con el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3.8-27B para confirmar restricciones adicionales.
- Para produccion, es imprescindible usar vLLM (no Transformers) para obtener el rendimiento prometido, y evitar la opcion `--calculate-kv-scales` en modelos hibridos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Twu31/Qwen3.8-27B-AWQ-INT4-ZhChat-MTP)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Issue de vLLM sobre KV scales en modelos hibridos](https://github.com/vllm-project/vllm/issues/37554)
- [Intel AutoRound](https://github.com/intel/auto-round)
