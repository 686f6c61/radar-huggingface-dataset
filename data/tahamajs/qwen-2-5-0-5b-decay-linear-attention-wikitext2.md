# tahamajs/qwen-2.5-0.5b-decay-linear-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-decay-linear-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se ha realizado una "cirugía de atención" (*attention surgery*): 18 de las 24 capas del decoder originales, que empleaban atención softmax agrupada (GQA), han sido sustituidas por el operador `DecayLinearAttention` de la librería NeuralOps, un mecanismo de atención lineal con compuerta de decaimiento exponencial dependiente de los datos. El resultado es un modelo híbrido 3:1 que combina atención lineal subcuadrática en la mayoría de capas con anclas GQA nativas cada cuatro capas, orientado a reducir el coste computacional del contexto largo en modelos compactos.

El modelo lo publica el usuario tahamajs dentro del proyecto NeuralOps (Attention Surgery Zoo), una iniciativa de investigación que explora la sustitución de operadores de atención en transformers preentrenados y su posterior recuperación mediante destilación de conocimiento. Tras el transplante quirúrgico, el autor aplica una destilación de representaciones ocultas en dos etapas sobre WikiText-2 para reparar la degradación masiva de perplejidad introducida por la cirugía.

Es relevante ahora porque documenta de forma transparente el coste real de sustituir atención softmax por atención lineal en un modelo pequeño: la perplejidad post-destilación (374,42) sigue estando muy lejos del profesor original (15,38), lo que convierte a este checkpoint en una referencia útil para investigadores que evalúan técnicas de *attention surgery* y destilación, más que en un modelo listo para producción. El modelo tiene 535.590.520 parámetros reales en safetensors y se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con `DecayLinearAttention` (atención lineal con decaimiento) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 535.590.520 (según safetensors); el modelo base declara 494M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens, pero la ficha no confirma el contexto efectivo tras la cirugía) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16 completo, ~1021,62 MB, más un adaptador) |
| Idiomas soportados | Inglés (etiqueta `en` en la model card); multilingüe heredado del base no confirmado |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador); librería `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` (24 capas, dimensión oculta D=896, 14 cabezas de query, 2 cabezas KV, dimensión por cabeza 64, RoPE con theta=1.000.000, GQA). Sobre esa base se aplica una topología `hybrid_3_1` determinista: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] se reemplazan por `DecayLinearAttention`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única proyección de salida sin duplicación. El operador `DecayLinearAttention` implementa atención lineal con compuerta de decaimiento exponencial dependiente de los datos, con despacho de kernels a tres niveles (CUDA / Triton / PyTorch) y soporte de GQA y RoPE gestionado por adaptador.

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), a longitud de secuencia 512, batch 8 y acumulación de gradiente 4, ejecutada en una única RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 47 pasos) congela embeddings, MLPs y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, clipping 1.0), minimizando MSE por capa más 0.25·(1−coseno). La etapa 2 (70% del presupuesto, 111 pasos) hace destilación end-to-end de los 24 flujos residuales con lr=6.0e-5 y peso coseno de 0.50. El resultado: la perplejidad cero-shot tras la cirugía era 535.483,80 y bajó a 374,42 tras la destilación, una reducción relativa del 99,93% pero todavía muy por encima del profesor (15,38).

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención lineal subcuadrática en 18 de 24 capas, lo que en teoría reduce el coste de cómputo en secuencias largas (aunque el contexto efectivo no está confirmado).
- Soporte de GQA y RoPE a través del adaptador de atención.
- Conversación multi-turno (etiqueta `conversational`), aunque la calidad conversacional no está validada tras la cirugía.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidades multilingües no confirmadas: la model card solo declara inglés.

## Casos de uso

- Investigación en *attention surgery*: servir como referencia reproducible para medir el impacto de sustituir atención softmax por atención lineal en un transformer pequeño, comparando la perplejidad pre y post destilación (535.483,80 frente a 374,42).
- Estudio de destilación de representaciones: el protocolo en dos etapas y la telemetría publicada permiten replicar o contrastar técnicas de alineación de subespacios ocultos con presupuestos de pasos concretos (47 + 111 pasos).
- Benchmarking de kernels de atención: útil para validar el despacho CUDA/Triton/PyTorch de `DecayLinearAttention` y comparar latencia y memoria frente a la atención GQA nativa en una RTX 3090.
- Docencia y divulgación: ejemplo didáctico de topología híbrida 3:1 y de cómo la cirugía de atención degrada drásticamente la perplejidad antes de destilar.
- Pruebas de infraestructura NeuralOps: validar la carga de checkpoints con `library_name: neuralops`, el formato safetensors FP16 + adaptador y la serialización determinista de pesos.
- Exploración de eficiencia en contexto largo: evaluar si la atención lineal permite procesar secuencias más largas con menor coste, aunque la calidad resultante sea limitada.
- No se recomienda su uso en producción para generación de texto de calidad, dado el delta de perplejidad frente al profesor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), medidos en el split de validación de WikiText-2 a longitud de secuencia 512:

| Métrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax |
| Perplejidad cero-shot del estudiante (pre-KD) | 535.483,80 | Inmediatamente tras el transplante de 18/24 capas |
| Perplejidad del estudiante destilado (post-KD) | 374,42 | Tras destilación en dos etapas |
| Delta absoluto de perplejidad | −535.109,38 | Cambio logrado por la destilación |
| Reducción relativa de perplejidad | 99,93% | Recuperación desde el pico post-cirugía |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1 GB solo para pesos (1021,62 MB), más overhead de activaciones y caché KV; cómodo en GPUs de 8 GB o más.
- GPU recomendadas: RTX 3090 (usada por el autor para la destilación), RTX 4090, A100, H100; cualquier GPU consumer con al menos 8 GB debería poder cargarlo en FP16.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y similares.
- Opciones de despliegue: la librería `neuralops` es la vía documentada; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que los operadores de atención personalizados requieren el runtime NeuralOps.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-0.5B + DecayLinearAttention, post-KD) | 535,6M | No disponible | 374,42 (val, seq 512) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | 32.768 tokens | 15,38 (val, seq 512) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B | 1,5B | 32.768 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| Modelos de atención lineal comparables (p. ej. variantes Mamba/RetNet del zoo NeuralOps) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más relevante es con el profesor: el checkpoint quirúrgico multiplica por más de 24 la perplejidad del original incluso tras la destilación, lo que refleja el coste de sustituir la atención softmax en un modelo de 0,5B.

## Limitaciones y advertencias

- Calidad degradada: la perplejidad post-destilación (374,42) es más de 24 veces la del profesor (15,38); no es apto para generación de texto de calidad en producción.
- Sesgos: no documentados, pero hereda los del modelo base Qwen2.5-0.5B y los de WikiText-2 como corpus de destilación (texto enciclopédico en inglés).
- Riesgo de alucinación: elevado, coherente con la alta perplejidad y la pérdida de capacidad tras la cirugía.
- Limitaciones de idioma: solo se declara inglés; el multilingüismo del base no está confirmado tras la cirugía.
- Limitaciones de contexto: la longitud de contexto efectiva tras reemplazar 18 capas por atención lineal no está documentada.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B es Apache 2.0; conviene revisar la compatibilidad y atribución.
- Dependencia de runtime: requiere la librería `neuralops` para cargar los operadores personalizados; no es un checkpoint estándar de `transformers`.
- Métricas no verificadas: la perplejidad declarada en la model card está marcada como `verified: false`.
- Naturaleza experimental: es un artefacto de investigación del Attention Surgery Zoo, no un modelo validado para despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-decay-linear-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/decay_linear_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
