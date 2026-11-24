# tahamajs/qwen-2.5-0.5b-compressed-mha-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-compressed-mha-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se ha realizado una "cirugía de atención": 18 de las 24 capas del decodificador han sido sustituidas por el operador `compressed_mha_attention` (implementación `CompressedDistilBertAttention` basada en SVD truncada conjunta) de la librería NeuralOps. El resultado es un transformer híbrido que combina atención comprimida en el 75% de las capas con atención GQA nativa de Qwen2 en el 25% restante, entrenado posteriormente mediante destilación de conocimiento en dos etapas sobre WikiText-2.

El modelo lo publica el autor independiente `tahamajs` como parte del proyecto NeuralOps "Attention Surgery Zoo", un banco de pruebas para evaluar la viabilidad de sustituir operadores de atención estándar por alternativas subcuadráticas en modelos causales pequeños. Con 501.827.200 parámetros totales y un tamaño de repositorio de 1,1 GB, no pretende competir con modelos de producción, sino servir como referencia reproducible de qué ocurre al transplantar atención comprimida en un LM causal de 0,5B.

Su relevancia es metodológica: documenta con telemetría detallada el colapso inmediato tras el transplante (perplejidad de 366.648,51 en zero-shot) y la recuperación del 99,98% mediante destilación (perplejidad final de 78,13 frente a 15,38 del profesor). Es un artefacto de investigación, no un modelo listo para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido (Qwen2 + atención comprimida SVD en 18/24 capas) |
| Parámetros totales | 501.827.200 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantización | No disponible (pesos publicados en FP16 completo, 957,21 MB, más adaptador) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 capas, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza de 64 y RoPE con theta de 1.000.000. Sobre esa base se aplica una topología `hybrid_3_1`: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `compressed_mha_attention` envuelto en un `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14, evitando proyecciones sin inicializar. El operador comprimido soporta máscara causal, GQA y RoPE, y despacha kernels en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en destilación de representaciones ocultas en dos etapas, ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 107 pasos) congela embeddings, MLP y `lm_head`, y entrena solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, clipping de gradiente 1.0), pesos maestros en FP32 con AMP FP16 y objetivo MSE por capa más 0.25·(1 − coseno) entre estados ocultos del estudiante y del profesor. El dataset es WikiText-2 (`wikitext-2-raw-v1`), con secuencias de longitud 512, batch de 8 y acumulación de gradiente de 4.

## Capacidades

- Generación de texto causal autorregresiva en inglés.
- Razonamiento básico y continuación de texto, heredado del profesor Qwen2.5-0.5B, aunque degradado por la destilación.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés declarado (Qwen2.5 base es multilingüe, pero la destilación se hizo solo sobre WikiText-2 en inglés).
- No dispone de modo thinking, visión ni audio.
- Sirve como banco de pruebas para evaluar operadores de atención alternativos en modelos causales pequeños.

## Casos de uso

- Investigación en eficiencia de atención: permite medir el impacto real de sustituir atención softmax por atención comprimida SVD en un LM causal, con telemetría de perplejidad antes y después de la destilación.
- Reproducción de experimentos de destilación: el pipeline de dos etapas (alineamiento de subespacio con backbone congelado y ajuste posterior) es replicable con la librería NeuralOps y sirve como referencia metodológica.
- Benchmark de operadores: útil para comparar `compressed_mha_attention` frente a otras alternativas del Attention Surgery Zoo sobre la misma base Qwen2.5-0.5B y el mismo dataset.
- Prototipado de arquitecturas híbridas: la topología 3:1 (18 capas comprimidas, 6 nativas) ofrece un punto de partida para estudiar el equilibrio entre complejidad subcuadrática y capacidad de recuperación de inducción.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y destilación de representaciones en un modelo pequeño que cabe en una GPU de consumo.
- Validación de infraestructura: con 957 MB en FP16, sirve para probar pipelines de carga, serialización y despliegue con la librería `neuralops` en entornos con recursos limitados.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) sobre WikiText-2 `wikitext-2-raw-v1`, split de validación, longitud de secuencia 512:

| Métrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad del estudiante pre-destilación (zero-shot) | 366.648,51 | Inmediatamente tras el transplante de 18/24 capas |
| Perplejidad del estudiante post-destilación | 78,13 | Tras destilación de representaciones en dos etapas |
| Delta absoluto de perplejidad | −366.570,37 | Cambio logrado por la destilación |
| Reducción relativa de perplejidad | 99,98% | Recuperación desde el pico post-cirugía |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1 GB para pesos (957,21 MB) más overhead de activaciones y caché KV, manejable en cualquier GPU con 4 GB o más.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para experimentación; cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente por tamaño.
- Cabe en GPU de consumo: sí, con holgura; el entrenamiento de destilación se realizó en una RTX 3090 de 24 GB.
- Opciones de despliegue: la model card declara la librería `neuralops` como dependencia; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el operador de atención personalizado probablemente requiere el runtime de NeuralOps.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| qwen-2.5-0.5b-compressed-mha-attention-wikitext2 | 501,8 M | No disponible | 78,13 (post-KD) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494 M | 32.768 | 15,38 | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 | No disponible | Apache 2.0 | Hugging Face |

La comparación directa con el profesor muestra una degradación de perplejidad de aproximadamente 5 veces (78,13 frente a 15,38), a cambio de una arquitectura con atención comprimida en el 75% de las capas. No se dispone de datos de otros checkpoints del Attention Surgery Zoo en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- Degradación sustancial de calidad: la perplejidad post-destilación (78,13) es unas 5 veces peor que la del modelo base (15,38); no es apto para producción sin ajuste adicional.
- Riesgo elevado de alucinación y texto incoherente, especialmente fuera del dominio de WikiText-2 usado en la destilación.
- Entrenado y evaluado únicamente en inglés sobre WikiText-2; el soporte multilingüe del Qwen2.5 base no está garantizado tras la cirugía y la destilación.
- La ventana de contexto efectiva no está documentada; la destilación usó secuencias de 512 tokens, por lo que el rendimiento más allá de esa longitud es incierto.
- Requiere la librería `neuralops` y su operador `compressed_mha_attention`; no es un checkpoint estándar de transformers y la compatibilidad con runtimes convencionales no está confirmada.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index).
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B es Apache 2.0; conviene revisar las condiciones de ambos.
- Artefacto de investigación: no se recomienda su uso en aplicaciones reales de atención al cliente, generación de código o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-compressed-mha-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/compressed_mha_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
