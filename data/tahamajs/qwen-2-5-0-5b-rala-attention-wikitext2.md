# tahamajs/qwen-2.5-0.5b-rala-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-rala-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps (Attention Zoo). No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre el modelo base `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas de atención del decoder por el operador `RALALinearAttention` (Rank-Augmented Linear Attention), un mecanismo de atención subcuadrática registrado en el `ATTENTION_REGISTRY` de NeuralOps. Las 6 capas restantes se conservan como anclas cuadráticas completas.

El objetivo declarado es explorar la viabilidad de sustituir atención cuadrática por alternativas lineales en un transformer ya preentrenado, mediante un proceso de destilación de conocimiento en dos etapas sobre el conjunto WikiText-2. El resultado publicado es, sin embargo, un modelo que no ha recuperado la funcionalidad del original: la perplejidad en validación de WikiText-2 es de 121.980.150,39, idéntica a la del estado previo a la destilación (delta de recuperación cero tras 13 pasos de optimización). Se trata, por tanto, de un artefacto de investigación sobre topologías de atención, no de un modelo apto para uso generativo real.

La relevancia es metodológica: documenta un pipeline reproducible de cirugía de atención (`QwenAttentionAdapter`, patrón `hybrid_3_1`, contrato Single-`o_proj`) y de destilación por capas con métricas de telemetría detalladas. El repositorio ocupa 0,1 GB y contiene únicamente los pesos de atención modificados (124,39 MB), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con cirugía de atención: 18/24 capas con `RALALinearAttention` + 6 capas de atención cuadrática completa en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo publica los pesos de atención, 124,39 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la ficha no lo confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente FP16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en` declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA 14:2), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica el patrón de cirugía `hybrid_3_1`: por cada tres capas, una se mantiene con atención cuadrática original y las otras se sustituyen por `RALALinearAttention`, resultando en 18 capas transplantadas y 6 anclas en los índices [3, 7, 11, 15, 19, 23]. El `QwenAttentionAdapter` gestiona la expansión 7x de cabezas KV cuando es necesario y fuerza el contrato Single-`o_proj` (bypass de la proyección de salida original). El módulo RALA soporta atención causal, bidireccional y cross-attention, pero no GQA nativo ni RoPE nativo.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`): la etapa 1 (alineación con backbone congelado) ejecuta 4 pasos en 55,1 s con `lm_head` bypasseado y pérdida MSE + coseno sobre estados ocultos por capa (peso 0,25); la etapa 2 (destilación multi-capa) ejecuta 9 pasos en 128,1 s con peso 0,50. En total, 13 pasos de optimización en 183,8 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 21.553 MB de VRAM en FP16 con parámetros maestros en FP32. No se reporta RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de texto causal autoregresiva: el módulo RALA declara `supports_causal=True`, por lo que el modelo es funcionalmente un LM causal.
- Atención bidireccional: soportada por el operador RALA (`supports_bidirectional=True`), aunque el checkpoint se publica para `text-generation`.
- Cross-attention: soportada a nivel de módulo (`supports_cross_attention=True`), no explotada en este checkpoint.
- Tool calling / function calling: no disponible; no se documenta plantilla de herramientas ni soporte de agentes.
- Razonamiento multi-paso y modo thinking: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Visión, audio: no soportadas.
- En la práctica, la perplejidad publicada (121.980.150,39) indica que la generación de texto coherente no está garantizada y el modelo debe tratarse como artefacto de investigación.

## Casos de uso

- Investigación en mecanismos de atención subcuadrática: sirve como punto de partida reproducible para estudiar cómo se degrada un transformer preentrenado al sustituir atención cuadrática por lineal, usando el pipeline de cirugía y las métricas de telemetría como referencia.
- Reproducción de experimentos de destilación de conocimiento: el repositorio documenta las dos etapas (alineación con backbone congelado y destilación multi-capa) con hiperparámetros concretos, lo que permite replicar y extender el protocolo sobre otros modelos base o datasets.
- Benchmarking de operadores de atención: útil para comparar `rala_attention` frente a otras entradas del `ATTENTION_REGISTRY` de NeuralOps bajo una topología controlada (`hybrid_3_1`) y un dataset fijo (WikiText-2).
- Validación de adaptadores de atención (`QwenAttentionAdapter`): permite probar la expansión GQA 14:2 y el contrato Single-`o_proj` en un modelo pequeño antes de escalar a Qwen2.5 de mayor tamaño.
- Docencia y divulgación: ejemplo didáctico de cirugía de módulos en transformers y de los riesgos de sustituir componentes sin reentrenamiento suficiente (13 pasos no recuperan la perplejidad base).
- Pruebas de integración de la librería `neuralops`: el `load_surgeried_model` y el flujo de carga de pesos de atención permiten validar la API del hub en entornos de CI.
- No se recomienda su uso en producción para generación de texto, atención al cliente, generación de código ni ninguna tarea que requiera salidas coherentes.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 121.980.150,39 |
| WikiText-2, estado pre-destilación (Stage 0) | Perplejidad | 121.980.150,39 |
| WikiText-2, post-destilación | Perplejidad | 121.980.150,39 |
| Delta de perplejidad | Δ | +0,00 (sin recuperación) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible. La telemetría de entrenamiento reporta 13 pasos totales, 183,8 s de cómputo y 21.553 MB de VRAM pico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,5 mil millones de parámetros; en FP16 requiere aproximadamente 1 GB de pesos más overhead de activaciones, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más. La cifra de 21.553 MB corresponde al entrenamiento (FP16 autocast con maestros FP32), no a inferencia.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento o destilación se usó una GPU con al menos 22 GB (A100, H100, RTX 3090/4090 con 24 GB).
- Cabe en GPU consumer: sí, en todas las GPU con 4 GB o más de VRAM.
- Opciones de despliegue: el flujo documentado usa `transformers` + `neuralops.hub.load_surgeried_model` o la carga manual con `apply_qwen_attention_surgery` y `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al no publicarse pesos en GGUF y requerir el operador RALA, el despliegue estándar no es directo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-rala-attention-wikitext2` | 0,5 B | No disponible | MIT | Experimental, PPL 121.980.150,39 | Cirugía de atención RALA, solo pesos de atención |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5 B | 32.768 tokens | Apache 2.0 | Producción | Modelo original, funcional, con tool calling y multilingüe |
| `Qwen/Qwen2.5-1.5B` | 1,5 B | 32.768 tokens | Apache 2.0 | Producción | Alternativa del mismo fabricante con mayor capacidad |
| `HuggingFaceTB/SmolLM2-360M` | 0,36 B | 8.192 tokens | Apache 2.0 | Producción | Modelo pequeño comparable para despliegue en edge |

La comparación relevante es contra el propio modelo base: el checkpoint quirúrgico no conserva la funcionalidad del original y su perplejidad es órdenes de magnitud superior. Para cualquier uso práctico, el Qwen2.5-0.5B original es preferible.

## Limitaciones y advertencias

- Perplejidad en WikiText-2 de 121.980.150,39, idéntica al estado pre-destilación: la destilación en 13 pasos no recuperó la funcionalidad del modelo base. La generación de texto coherente no está garantizada.
- Solo se publican los pesos de atención (124,39 MB); es necesario descargar el modelo base Qwen2.5-0.5B y aplicar la cirugía con el script de NeuralOps para obtener un modelo completo.
- Requiere la librería `neuralops` y el operador `rala_attention`; no es compatible con `transformers` estándar sin el código de cirugía.
- Idiomas: únicamente inglés declarado; sin capacidades multilingües documentadas.
- Sin soporte documentado de tool calling, agentes ni modo thinking.
- Riesgo elevado de alucinación y salidas incoherentes dada la perplejidad reportada.
- Licencia MIT, lo que permite uso comercial del artefacto, pero el modelo base Qwen2.5-0.5B está bajo Apache 2.0 y sus términos aplican al conjunto.
- Sesgos: no documentados; hereda los del corpus WikiText-2 y del modelo base, sin evaluación específica.
- No apto para producción: es un artefacto de investigación sobre topologías de atención.
- Fecha de creación futura (2026-11-10) en los metadatos de Hugging Face, lo que sugiere posible manipulación de fechas o error de registro.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-rala-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
