# tahamajs/qwen-2.5-0.5b-phantom-wikitext2

## Resumen

`qwen-2.5-0.5b-phantom-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero, sino una modificación quirúrgica de `Qwen/Qwen2.5-0.5B`: se sustituyen los bloques de atención del decodificador por un operador denominado `PHANTOMAttention` (Parameter-Hashed AttentioN with Token-wise Orthogonal Mapping), un mecanismo de atención subcuadrática registrado en el `ATTENTION_REGISTRY` de NeuralOps.

El objetivo del modelo es demostrar que es posible reemplazar la atención cuadrática estándar de un transformer por un operador alternativo y recuperar la funcionalidad mediante destilación de conocimiento en dos etapas. Tras la cirugía, la perplejidad en WikiText-2 se dispara hasta 46013.23; tras 454 pasos de destilación (180,2 segundos de cómputo) se reduce a 150.68. El checkpoint distribuido contiene únicamente los pesos de atención (`attention_weights.safetensors`, 57,24 MB), no el modelo completo.

Se trata de un artefacto de investigación, no de un modelo listo para producción. La relevancia actual reside en el creciente interés por arquitecturas de atención eficiente (subquadráticas, lineales, híbridas) y en la posibilidad de reconvertir checkpoints densos existentes sin reentrenar desde cero. El modelo base Qwen2.5-0.5B tiene 0,49 mil millones de parámetros y una ventana de contexto de 32 768 tokens; el checkpoint derivado hereda esa configuración, aunque su calidad final está muy por debajo del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `PHANTOMAttention` y 6/24 capas con atención cuadrática completa (índices [3, 7, 11, 15, 19, 23]) |
| Parametros totales | 0,49 mil millones (heredados de Qwen2.5-0.5B; el checkpoint distribuido contiene solo pesos de atención) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base; no verificada en el checkpoint derivado) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 57,24 MB) + `config.json` + `tokenizer.json`; requiere el checkpoint base Qwen2.5-0.5B para funcionar |

## Arquitectura y entrenamiento

La arquitectura parte del transformer decoder-only de Qwen2.5-0.5B: `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (`head_dim=64`), GQA nativo. Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: por cada cuatro capas, tres se sustituyen por `PHANTOMAttention` y una se mantiene como "ancla" cuadrática completa. En total se transplantan 18 de las 24 capas mediante `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando es necesario y respeta el contrato de `o_proj` único. El operador `phantom` soporta atención causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE (marcado como N/A).

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado, `lm_head` puenteado) duró 138 pasos (54,3 s) y usó MSE y coseno por capa con peso 0,25. La etapa 2 (destilación multi-capa de representaciones) duró 316 pasos (125,6 s) con peso 0,50. El total fueron 454 pasos en 180,2 s, con un pico de VRAM de 14 820 MB en FP16 con parámetros maestros en FP32. No se menciona RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base.
- Atención causal, bidireccional y cross-attention a nivel de operador `phantom`.
- Destilación de conocimiento como técnica de recuperación tras cirugía arquitectónica.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (único idioma declarado).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.
- El checkpoint no es autónomo: requiere cargar Qwen2.5-0.5B y aplicar la cirugía antes de inyectar los pesos.

## Casos de uso

- Investigación en atención subcuadrática: permite comparar el operador `phantom` frente a atención cuadrática en un transformer real de 0,5B sin reentrenar desde cero, midiendo perplejidad en WikiText-2 como referencia.
- Reproducción de experimentos de destilación: el repositorio incluye telemetría detallada (pasos, tiempos, VRAM, delta de perplejidad) que sirve para validar pipelines de KD en dos etapas.
- Prototipado de cirugía arquitectónica: útil para probar el `QwenAttentionAdapter` y el patrón `hybrid_3_1` en entornos controlados antes de escalar a modelos mayores.
- Estudio de la brecha de calidad tras sustitución de atención: la perplejidad de 150.68 frente a la del Qwen2.5-0.5B original permite cuantificar cuánto se degrada el modelo con atención híbrida y KD limitada.
- Docencia y divulgación: ejemplo reproducible de cómo se reemplaza un módulo de atención y se recupera parcialmente el rendimiento con 454 pasos de entrenamiento en menos de 15 GB de VRAM.
- Base para ablaciones: el patrón `hybrid_3_1` con 6 capas ancla permite estudiar qué proporción de atención cuadrática es necesaria para mantener coherencia.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (validation, `wikitext-2-raw-v1`) | Perplejidad causal (post-KD) | 150.68 |
| WikiText-2 (validation) | Perplejidad causal (pre-KD, Stage 0) | 46013.23 |
| WikiText-2 (validation) | Delta de perplejidad | -45862.55 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumió 14 820 MB en FP16 con parámetros maestros en FP32; para inferencia en FP16 del modelo completo (0,5B) se estiman en torno a 1-2 GB, aunque no se publica una cifra oficial de inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16; para reproducir el entrenamiento se necesitan al menos 16 GB (el autor reporta 14 820 MB de pico).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y superiores.
- Opciones de despliegue: el modelo requiere `neuralops` y el script `apply_qwen_attention_surgery`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no distribuirse en GGUF no es desplegable directamente en runtimes estándar sin conversión.
- Latencia y throughput: no disponibles. El autor solo reporta tiempos de entrenamiento (180,2 s para 454 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-phantom-wikitext2 | 0,49B (solo pesos de atención) | 32 768 (heredado) | 150.68 (declarada) | MIT | Hugging Face, requiere base + neuralops |
| Qwen/Qwen2.5-0.5B | 0,49B | 32 768 | no disponible en la informacion proporcionada | Apache 2.0 (modelo base) | Hugging Face, transformers estándar |
| Modelos de 0,5B con atención eficiente (p. ej. variantes lineales) | ~0,5B | variable | no disponible | variable | variable |

La comparación directa con el Qwen2.5-0.5B original no es posible con los datos aportados: la model card no incluye la perplejidad del modelo base sin cirugía, por lo que no se puede cuantificar la degradación exacta. No se identifican en la información proporcionada otros checkpoints del mismo zoo con los que comparar.

## Limitaciones y advertencias

- La perplejidad de 150.68 es muy superior a la que cabe esperar de un modelo de 0,5B bien entrenado; la calidad de generación es previsiblemente baja y no apta para producción.
- El checkpoint contiene solo pesos de atención; sin el modelo base Qwen2.5-0.5B y la librería `neuralops` no es utilizable.
- Entrenado únicamente sobre WikiText-2, un corpus enciclopédico en inglés; el dominio y el idioma están muy acotados.
- Solo se declara inglés; no hay evidencia de capacidades multilingües.
- No se documentan evaluaciones de sesgo, alucinación ni seguridad.
- El operador `phantom` no soporta GQA nativo ni RoPE, lo que puede afectar a la extrapolación de contexto más allá de lo visto en entrenamiento (`seq_len=512`).
- La licencia MIT aplica al checkpoint derivado; conviene verificar la licencia del modelo base Qwen2.5-0.5B (Apache 2.0) para uso comercial combinado.
- Es un artefacto de investigación: no hay garantías de mantenimiento, soporte ni compatibilidad con ecosistemas estándar (transformers, vLLM, llama.cpp).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-phantom-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
