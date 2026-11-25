# tahamajs/qwen-2.5-0.5b-svd-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-svd-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por un mecanismo de atención lineal comprimida mediante SVD (`SVDLinearAttention`, clave de registro `svd_attention`), perteneciente al catálogo `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es `tahamajs` y el modelo se distribuye con licencia MIT.

El objetivo no es ofrecer un modelo de propósito general listo para producción, sino servir de banco de pruebas reproducible para investigar la sustitución de atención cuadrática por alternativas subcuadráticas en transformers preentrenados, midiendo la degradación y la recuperación mediante destilación de conocimiento en dos etapas. El entrenamiento se realizó sobre WikiText-2 (`wikitext-2-raw-v1`) y el resultado declarado es una perplejidad de validación de 7538,02, un valor muy alejado de los estándares de un modelo de lenguaje funcional.

La relevancia del artefacto es metodológica: documenta con telemetría detallada (pasos, tiempos, VRAM pico, deltas de perplejidad) el coste de reemplazar la atención en un modelo ya entrenado y la eficacia parcial de la destilación por alineamiento de representaciones ocultas. No debe confundirse con un modelo conversacional utilizable: el propio autor lo presenta como parte de un "Attention Zoo" de experimentos de cirugía arquitectónica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con 18/24 capas de atención sustituidas por `SVDLinearAttention` (patrón híbrido 3:1); 6 capas cuadráticas de anclaje en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no se especifica recuento exacto tras la cirugía) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa `seq_len=512`; la ventana nativa de Qwen2.5-0.5B no se declara en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en FP16/safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 88,25 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`, GQA 14:2) y aplica una cirugía de atención mediante `QwenAttentionAdapter`, que expande automáticamente las cabezas KV (factor 7x) cuando el módulo lo requiere y respeta el contrato de un único `o_proj`. El patrón `hybrid_3_1` intercala tres capas con `SVDLinearAttention` por cada capa de atención cuadrática completa, preservando seis capas de anclaje para mantener cierta capacidad de modelado de dependencias globales. El módulo `SVDLinearAttention` declara soporte causal, bidireccional, cross-attention y GQA nativo, pero no soporte RoPE.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2. La etapa 1 (alineamiento con backbone congelado, 139 pasos, 54,2 s) omite `lm_head` y minimiza MSE y coseno (peso 0,25) sobre estados ocultos capa a capa. La etapa 2 (destilación multi-capa de representaciones, 319 pasos, 125,6 s) repite el esquema con peso coseno 0,50. En total, 458 pasos en 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 12969 MB en autocast FP16 y parámetros maestros FP32. La perplejidad causal pasa de 7.751.147,47 antes de la destilación a 7538,02 después, lo que evidencia una recuperación sustancial pero muy insuficiente respecto al modelo base.

## Capacidades

- Generación de texto causal autoregresiva en inglés, limitada a la calidad derivada de una perplejidad de validación de 7538,02 en WikiText-2.
- Atención causal con soporte declarado de GQA nativo, cross-attention y modo bidireccional a nivel de módulo.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe: el único idioma listado es `en`.
- No se declara modo de razonamiento (thinking), visión ni audio.
- El checkpoint contiene únicamente pesos de atención: requiere cargar el modelo base Qwen2.5-0.5B y aplicar la cirugía antes de inyectar los pesos.

## Casos de uso

- Investigación en atención subcuadrática: servir de referencia reproducible para medir el impacto de sustituir atención cuadrática por `SVDLinearAttention` en un transformer preentrenado, comparando la perplejidad pre y post destilación documentada (7.751.147,47 → 7538,02).
- Validación de pipelines de cirugía arquitectónica: probar el adaptador `QwenAttentionAdapter` y el contrato de proyección única `o_proj` en un modelo pequeño antes de escalar el experimento a modelos mayores.
- Estudio de destilación de conocimiento por capas: replicar el esquema de dos etapas (alineamiento con backbone congelado y destilación multi-capa) y analizar la contribución de cada fase sobre la recuperación de perplejidad.
- Benchmarking de eficiencia de atención: comparar el coste computacional y de memoria del patrón híbrido 3:1 frente a la atención cuadrática completa en secuencias de 512 tokens, usando la telemetría publicada (458 pasos, 180,1 s, 12969 MB de VRAM pico) como línea base.
- Docencia y divulgación técnica: ilustrar de forma práctica qué ocurre al reemplazar módulos de atención en un LLM y por qué la destilación de representaciones ocultas no basta para restaurar la calidad original.
- Pruebas de integración de la librería NeuralOps: ejercitar la API `neuralops.hub.load_surgeried_model` y el flujo de carga con `apply_qwen_attention_surgery` en entornos de CI.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 7538,02 |
| WikiText-2 (baseline post-cirugía, Stage 0) | Perplejidad | 7.751.147,47 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento requirió 12969 MB de VRAM pico en FP16 con parámetros maestros FP32; para inferencia en FP16 de un modelo de 0,5B se estima un consumo del orden de 1-2 GB, aunque no se publica una cifra medida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el entrenamiento documentado se ejecutó en una GPU con capacidad para ~13 GB (clase RTX 3090/4090 o superior).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de 8 GB en cuantización de 8 bits.
- Opciones de despliegue: la carga requiere la librería `neuralops` o el flujo manual con `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF lo hace improbable sin conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-svd-attention-wikitext2` | 0,5B | no disponible (entrenado a 512) | 7538,02 | MIT | Hugging Face, 329 descargas |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32768 tokens (según ficha oficial de Qwen) | no disponible en esta información | Apache 2.0 | Hugging Face |
| Modelos con atención lineal subcuadrática de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base Qwen2.5-0.5B en la información proporcionada para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- Calidad de lenguaje muy degradada: una perplejidad de 7538,02 en WikiText-2 implica que el modelo no es utilizable para generación de texto realista ni para tareas conversacionales.
- El checkpoint contiene solo los pesos de atención (`attention_weights.safetensors`); no es un modelo autónomo y exige cargar Qwen2.5-0.5B y aplicar la cirugía con `apply_qwen_attention_surgery` antes de la inyección con `strict=False`.
- Entrenado exclusivamente sobre WikiText-2 en inglés, un corpus enciclopédico de dominio estrecho; no se declara ningún otro idioma ni dominio.
- No se declara soporte de RoPE en el módulo `SVDLinearAttention`, lo que limita la extrapolación a contextos largos.
- Riesgo elevado de alucinación y de texto incoherente dado el nivel de perplejidad; no apto para producción.
- Sesgos: no documentados por el autor; al derivar de Qwen2.5-0.5B y afinarse sobre WikiText-2, hereda los sesgos del corpus original y del dataset de ajuste.
- Licencia MIT permisiva para uso comercial, pero la ausencia de calidad funcional hace inviable cualquier aplicación comercial directa.
- La métrica de perplejidad está marcada como no verificada (`verified: false`) en el model-index.
- El repositorio tiene 0 likes y 329 descargas, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
