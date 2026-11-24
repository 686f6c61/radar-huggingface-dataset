# tahamajs/qwen-2.5-0.5b-block-transformer-hiba-wikitext2

## Resumen

`qwen-2.5-0.5b-block-transformer-hiba-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Attention Surgery Zoo". No es un modelo entrenado desde cero, sino una cirugía de atención sobre `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas de atención del decoder (disposición híbrida 3:1) por el operador `BlockTransformerHIBA` de la librería NeuralOps, y se aplica después una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2.

El modelo base Qwen2.5-0.5B es un transformer causal denso de 494 M de parámetros con 24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor (GQA), con RoPE. El checkpoint resultante conserva 535.364.224 parámetros (el aumento se debe a la expansión de cabezas KV de 2 a 14 en las capas transplantadas) y se distribuye en safetensors FP16 (1021,18 MB) junto con un adaptador.

Su relevancia es fundamentalmente metodológica: sirve como banco de pruebas reproducible de atención subcuadrática sobre un modelo pequeño, no como un modelo listo para producción. El propio autor reporta una perplejidad post-destilación de 399,26 frente a 15,38 del profesor original, lo que sitúa al estudiante muy lejos de la calidad del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2) con 18/24 capas de atención sustituidas por `BlockTransformerHIBA` (híbrida 3:1) |
| Parametros totales | 535.364.224 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta hasta 32 768 tokens; la evaluación se hizo a longitud de secuencia 512) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (etiqueta `en` en la model card); multilingüismo del base no verificado tras la cirugía |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo, 1021,18 MB) más adaptador |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 bloques decoder, dimensión 896, 14 cabezas de consulta, 2 cabezas KV (GQA), dimensión por cabeza 64 y RoPE con theta 1 000 000. La cirugía `hybrid_3_1` reemplaza la atención en los índices de capa [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por `BlockTransformerHIBA`, envuelto en un `QwenAttentionAdapter`, y conserva la atención GQA nativa en [3, 7, 11, 15, 19, 23] como anclas de enrutamiento global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación. El operador HIBA combina atención densa intra-bloque con atención dispersa top-k inter-bloque, unificadas en un solo softmax sobre las puntuaciones concatenadas.

El entrenamiento consistió en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor. La etapa 1 (30 % del presupuesto, 124 pasos) congela embeddings, MLP y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (lr 2e-4, weight decay 0,01, clipping 1,0), pesos maestros FP32 y AMP FP16, minimizando MSE por capa más 0,25·(1 − coseno) entre estados ocultos. La etapa 2 (70 %, 287 pasos) realiza destilación extremo a extremo de representaciones. El resultado: la perplejidad cero-shot tras la cirugía era 114 801,79 y bajó a 399,26 tras la destilación, una reducción relativa del 99,65 % pero todavía 26 veces peor que el profesor.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base.
- Conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`), aunque la calidad tras la cirugía no está validada fuera de WikiText-2.
- Soporte de decodificación con caché KV y GQA mediante el adaptador de NeuralOps.
- Dispatch de kernels en tres niveles (CUDA, Triton, PyTorch) para el operador `BlockTransformerHIBA`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no verificadas; la model card solo declara inglés.

## Casos de uso

- Investigación en atención subcuadrática: banco de pruebas reproducible para medir el impacto de sustituir atención softmax por operadores híbridos bloque/dispersa en un modelo de 0,5 B con presupuesto de una sola GPU consumer.
- Estudio de destilación de representaciones: la telemetría de dos etapas (PPL 114 801,79 → 399,26) sirve como referencia para comparar protocolos de recuperación tras cirugía de atención.
- Desarrollo y depuración de la librería NeuralOps: validación del `QwenAttentionAdapter`, la herencia de pesos `o_proj` y la expansión GQA 2→14 en un caso real.
- Experimentos de eficiencia en longitud de contexto: comparar el coste del operador HIBA frente a atención densa en secuencias largas, aunque la evaluación publicada se limita a 512 tokens.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y destilación con métricas transparentes y hardware accesible.
- Baseline negativo controlado: punto de comparación para demostrar cuánto margen de recuperación queda frente al profesor (15,38 de perplejidad) en futuros trabajos.
- No es adecuado para atención al cliente, generación de código en producción ni despliegues comerciales reales dada su perplejidad.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente), medidos en la partición de validación de WikiText-2 a longitud de secuencia 512, batch 8, acumulación de gradiente 4, en una RTX 3090 de 24 GB.

| Metrica | Valor |
|---|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplejidad del estudiante cero-shot tras la cirugía | 114 801,79 |
| Perplejidad del estudiante tras destilación (post-KD) | 399,26 |
| Delta absoluto de perplejidad | −114 402,54 |
| Reducción relativa de perplejidad | 99,65 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otras tareas estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1 GB de pesos más caché KV y activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3090 (la usada por el autor para el entrenamiento), RTX 4090, A100, H100; también válidas GPUs de gama media como RTX 3060 o superiores.
- Cabe en GPU consumer: sí, en todas las modernas con al menos 4 GB de VRAM.
- Opciones de despliegue: la librería propietaria `neuralops` con dispatch CUDA/Triton/PyTorch es la vía documentada; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es desplegable directamente en llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (post-KD) | 535 M | No disponible (base: 32 768) | 399,26 | MIT | Hugging Face, requiere `neuralops` |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | 32 768 | 15,38 | Apache 2.0 | Hugging Face, ecosistema estándar |
| `Qwen/Qwen2.5-1.5B` | 1,54 B | 32 768 | No disponible en esta ficha | Apache 2.0 | Hugging Face, ecosistema estándar |
| `HuggingFaceTB/SmolLM2-360M` | 362 M | 8 192 | No disponible en esta ficha | Apache 2.0 | Hugging Face, ecosistema estándar |

La comparación relevante es con su propio profesor: el checkpoint quirúrgico multiplica por 26 la perplejidad del Qwen2.5-0.5B original, por lo que su interés es experimental, no de rendimiento.

## Limitaciones y advertencias

- Calidad muy degradada: perplejidad de 399,26 frente a 15,38 del modelo base; no es apto para generación de texto de calidad en producción.
- Evaluación limitada a una única tarea y conjunto (WikiText-2, validación, longitud 512); no hay datos de instrucciones, diálogo, código ni matemáticas.
- Riesgo elevado de alucinación y de texto incoherente por la pérdida de fidelidad tras la cirugía de atención.
- Idiomas: solo se declara inglés; el comportamiento multilingüe del base no está verificado tras la sustitución de capas.
- Dependencia de la librería `neuralops` y del operador `BlockTransformerHIBA`: no es un checkpoint estándar de `transformers` y no se garantiza su carga con herramientas convencionales.
- Licencia MIT declarada, lo que permite uso comercial en teoría, pero la calidad del modelo hace inviable ese escenario.
- Contexto efectivo no documentado; la ventana del base (32 768) no está validada con el nuevo operador.
- Métricas no verificadas de forma independiente (`verified: false` en el model-index).
- Los datos de entrenamiento se limitan a WikiText-2, lo que puede introducir sesgo de dominio y sobreajuste al corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-block-transformer-hiba-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/block_transformer_hiba.py
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
