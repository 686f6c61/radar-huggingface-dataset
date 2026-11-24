# tahamajs/qwen-2.5-0.5b-goldfinch-ahn-wikitext2

## Resumen

`qwen-2.5-0.5b-goldfinch-ahn-wikitext2` es un checkpoint experimental publicado por el usuario `tahamajs` dentro del proyecto NeuralOps "Attention Surgery Zoo". No es un modelo entrenado desde cero: parte de `Qwen/Qwen2.5-0.5B` y sustituye quirúrgicamente 18 de sus 24 bloques de atención por el operador `goldfinch_ahn` (`GoldFinchAHNBlock`), una variante híbrida de atención de ventana deslizante con memoria recurrente con compuertas, de la familia SSM. Posteriormente aplica una destilación de conocimiento en dos etapas sobre WikiText-2 para recuperar parte de la calidad perdida tras la cirugía.

El interés del modelo es fundamentalmente de investigación: sirve como banco de pruebas reproducible para evaluar el impacto de reemplazar atención softmax por operadores subcuadráticos en modelos compactos, y para medir cuánta calidad se puede recuperar mediante destilación de representaciones ocultas. El checkpoint tiene 564.314.020 parámetros reales en safetensors (frente a los 494M del Qwen2.5-0.5B original, por la expansión de cabezas KV en las capas transplantadas) y un repositorio de 1,4 GB.

Es importante subrayar que el rendimiento final es muy inferior al del modelo base: la perplejidad en WikiText-2 tras la destilación es de 316,25 frente a los 15,38 del profesor. Por tanto, no es un modelo apto para producción ni para uso conversacional general, sino un artefacto de experimentación sobre topologías de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18/24 capas con `GoldFinchAHNBlock` (atención de ventana deslizante + memoria recurrente con compuertas, familia SSM) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 564.314.020 (safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible explícitamente; la evaluación se realizó a longitud de secuencia 512. El operador admite ventana configurable (`window_size`, 0 o >= seq_len para contexto causal completo) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16 completo, 1076,41 MB, más un adaptador) |
| Idiomas soportados | Inglés (según la model card); el modelo base Qwen2.5 es multilingüe, pero no se declaran evaluaciones en otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de la topología de Qwen2.5-0.5B: 24 capas, dimensión oculta D=896, 14 cabezas de consulta, 2 cabezas KV (GQA) y dimensión por cabeza d_h=64, con RoPE configurado a theta = 1.000.000. Sobre esa base se aplica una cirugía determinista con ratio `hybrid_3_1`: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] se sustituyen por `goldfinch_ahn` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax preentrenada como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación.

El operador `GoldFinchAHNBlock` combina atención de ventana deslizante (radio efectivo = `window_size // 2`) con memoria recurrente con compuertas por cabeza (`gate_init_bias` controla el equilibrio atención/memoria). Dispone de despacho de kernel en tres niveles: CUDA, Triton y PyTorch.

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas, ejecutada con la arquitectura de caché offline de representaciones de NeuralOps sobre una única RTX 3090 de 24 GB (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 119 pasos) congela el backbone y entrena solo módulos de atención y layer norms, con AdamW (lr=2.0e-4, weight_decay=0.01, clipping 1.0), pesos maestros FP32 y AMP FP16 con GradScaler, minimizando MSE por capa más 0,25·(1 − coseno) entre estados ocultos del alumno y del profesor. La etapa 2 (70 % del presupuesto, 270 pasos) realiza destilación end-to-end de representaciones; la información disponible se interrumpe en ese punto y no detalla más el protocolo.

## Capacidades

- Generación de texto causal autorregresiva, con soporte declarado para el pipeline `text-generation`.
- Soporte de atención con GQA, incluida la expansión de cabezas KV en las capas transplantadas.
- Soporte de RoPE gestionado por el adaptador.
- Despacho de kernel en tres niveles (CUDA, Triton, PyTorch) a través de la librería NeuralOps.
- Capacidad multilingüe: no declarada; la model card solo lista inglés.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión o audio: no disponibles en la información proporcionada.
- Modo thinking: no disponible.

## Casos de uso

- Investigación sobre atención subcuadrática: el checkpoint permite reproducir el experimento de sustituir atención softmax por un operador híbrido SSM en un transformer compacto y medir la degradación y la recuperación vía destilación, con la topología `hybrid_3_1` documentada capa a capa.
- Estudio de destilación de representaciones ocultas: sirve como caso de referencia para comparar estrategias de alineación de subespacios (etapa 1 con backbone congelado) frente a destilación end-to-end (etapa 2), usando la perplejidad en WikiText-2 como métrica.
- Benchmark de operadores en la librería NeuralOps: al estar registrado como `goldfinch_ahn` en `ATTENTION_REGISTRY`, se puede usar para validar el despacho de kernels CUDA/Triton/PyTorch y la serialización determinista de pesos.
- Reproducción en hardware de consumo: el entrenamiento y la evaluación caben en una RTX 3090 de 24 GB, lo que permite replicar el pipeline en un equipo de sobremesa sin clúster.
- Análisis de compensación eficiencia/calidad en modelos de 0,5B: útil para estudiar si la complejidad subcuadrática compensa en modelos pequeños, donde las cabezas de inducción son escasas, midiendo el coste en perplejidad (15,38 → 316,25).
- Docencia y divulgación técnica: ejemplo didáctico de cirugía de atención, herencia de pesos entre proyecciones y telemetría de destilación, con artefactos de 1,4 GB manejables en portátiles con GPU modesta.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el split de validación de WikiText-2 (`wikitext-2-raw-v1`), longitud de secuencia 512, batch_size 8, grad_accum 4, en una NVIDIA GeForce RTX 3090 de 24 GB:

| Metrica | Valor |
|---|---:|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplejidad del alumno zero-shot tras la cirugía (pre-KD) | 121.396,70 |
| Perplejidad del alumno tras destilación (post-KD) | 316,25 |
| Delta absoluto de perplejidad | −121.080,45 |
| Reducción relativa de perplejidad | 99,74 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,4 GB y los pesos se publican en FP16 completo (1076,41 MB), por lo que la inferencia en FP16 requiere del orden de 1,2-2 GB de VRAM, más la caché KV. No se dispone de datos oficiales de VRAM pico.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería acomodar el modelo en FP16; el autor validó el pipeline en una RTX 3090 de 24 GB. Para entrenamiento o destilación, se recomienda una GPU de 24 GB o superior (A100, H100, RTX 4090/3090).
- Cabe en GPU de consumo: sí, por tamaño; se espera que quepa en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. No confirmado por el autor más allá de la RTX 3090.
- Opciones de despliegue: la librería declarada es `neuralops` (requerida para cargar el operador `goldfinch_ahn`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que el operador es personalizado, la carga con esos motores no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-goldfinch-ahn-wikitext2` | 564.314.020 | No disponible (evaluado a 512) | 316,25 (post-KD) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens (según Qwen2.5) | 15,38 (medido por el autor) | Apache 2.0 | Hugging Face |
| Otros checkpoints del Attention Surgery Zoo de NeuralOps | No disponible | No disponible | No disponible | MIT (repo NeuralOps) | Hugging Face |

La comparación relevante es con el propio modelo base: la cirugía y la destilación multiplican por más de 20 la perplejidad (15,38 → 316,25), lo que sitúa al checkpoint muy por debajo del profesor en calidad de modelado de lenguaje. No se dispone de datos de otros modelos comparables de la misma categoría (operadores subcuadráticos en 0,5B) en la información proporcionada.

## Limitaciones y advertencias

- Calidad muy degradada: la perplejidad post-destilación (316,25) es más de 20 veces la del modelo base (15,38); no es apto para generación de texto de calidad ni para producción.
- El checkpoint es un artefacto de investigación sobre topologías de atención, no un modelo conversacional afinado; aunque los tags incluyen `conversational`, no hay evaluación que lo respalde.
- Idiomas: solo se declara inglés; no hay evidencia de comportamiento en castellano u otros idiomas.
- Longitud de contexto: no se documenta la ventana efectiva del modelo final; la evaluación se limita a secuencias de 512 tokens, y el operador requiere configuración explícita de `window_size`.
- Dependencia de la librería `neuralops`: la carga requiere el operador `goldfinch_ahn` y el adaptador de Qwen; no es un transformer estándar cargable con `transformers` sin código adicional.
- Riesgo de alucinación: elevado por la degradación del modelado; no se han publicado evaluaciones de fidelidad factual.
- Sesgos: no documentados; al derivar de Qwen2.5-0.5B y entrenarse solo en WikiText-2, hereda los sesgos del profesor y los del corpus, sin mitigación adicional.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0; conviene revisar las condiciones combinadas antes de un uso comercial.
- Resultados no verificados: las métricas son declaradas por el autor (`verified: false` en el model-index) y no han sido replicadas de forma independiente.
- Fecha de creación inusual (2026-11-10) en los metadatos: conviene tratarla con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-goldfinch-ahn-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del operador `goldfinch_ahn`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/goldfinch_ahn.py
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
