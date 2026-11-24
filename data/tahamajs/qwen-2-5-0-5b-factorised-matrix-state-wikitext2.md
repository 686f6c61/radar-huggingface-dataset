# tahamajs/qwen-2.5-0.5b-factorised-matrix-state-wikitext2

## Resumen

Este checkpoint es el resultado de una intervención arquitectónica sobre `Qwen/Qwen2.5-0.5B` realizada con la librería NeuralOps. El autor (tahamajs) ha sustituido 18 de las 24 capas de atención del decoder original por el operador `factorised_matrix_state`, una atención lineal recurrente con estado matricial factorizado vía SVD, conservando 6 capas con la atención GQA softmax original de Qwen2 en una disposición híbrida 3:1. Posteriormente aplica una destilación de conocimiento en dos etapas sobre WikiText-2 para recuperar capacidad predictiva.

El modelo es un experimento de investigación sobre eficiencia de atención subcuadrática en modelos compactos, no un modelo de propósito general listo para producción. Su relevancia radica en que documenta de forma transparente el coste de la cirugía de atención: la perplejidad salta de 15,38 (profesor) a 420.412,82 tras el transplante en frío, y la destilación la reduce a 343,56, es decir, una recuperación del 99,92% relativa pero todavía muy lejos del profesor.

El checkpoint pesa 1,3 GB, tiene 536.396.668 parámetros reales en safetensors y se distribuye bajo licencia MIT. Está pensado para quienes investigan atención lineal, destilación de representaciones y técnicas de sustitución de operadores en transformers preentrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con atención lineal recurrente `factorised_matrix_state` (familia SVD) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 536.396.668 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (modelo base Qwen2.5-0.5B; evaluación a longitud de secuencia 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1023,15 MB, más adaptador) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: 24 capas decoder, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza d_h=64, con RoPE configurado a theta=1.000.000. La cirugía `hybrid_3_1` reemplaza las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por el operador `FactorisedMatrixState` envuelto en `QwenAttentionAdapter`, y preserva las capas [3, 7, 11, 15, 19, 23] con la atención softmax original para mantener el enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación, lo que evita el colapso de proyecciones no inicializadas. El adaptador gestiona RoPE y el soporte autorregresivo causal, con despacho de kernels en tres niveles (CUDA, Triton, PyTorch).

El entrenamiento consiste en una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 66 pasos) congela el backbone y entrena solo módulos de atención y layer norms con AdamW (lr=2,0e-4, weight decay 0,01, clipping 1,0), minimizando MSE por capa más 0,25·(1−coseno). La etapa 2 (70% del presupuesto, 156 pasos) hace destilación end-to-end sobre los 24 streams residuales con lr=6,0e-5 y el término coseno elevado a 0,50. Se usan pesos maestros FP32 con AMP FP16 y GradScaler.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base y preservada parcialmente tras la destilación.
- Modelado de lenguaje con atención lineal subcuadrática en el 75% de las capas, lo que reduce el coste computacional frente a la atención softmax completa.
- Soporte de atención bidireccional y causal en el operador `factorised_matrix_state`, aunque el checkpoint se publica para uso causal.
- Manejo de Grouped-Query Attention en las capas transplantadas mediante expansión de cabezas KV de 2 a 14.
- Integración con RoPE a través del adaptador (`QwenAttentionAdapter`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe no disponible: la model card solo declara inglés.

## Casos de uso

- Investigación en atención lineal: el checkpoint sirve como referencia reproducible para estudiar el impacto de sustituir atención softmax por atención lineal recurrente en un transformer compacto, comparando la perplejidad pre- y post-destilación (420.412,82 frente a 343,56).
- Estudio de destilación de representaciones ocultas: las dos etapas documentadas (alineamiento de subespacio con backbone congelado y destilación end-to-end) permiten replicar y comparar protocolos de KD sobre WikiText-2 con presupuestos de 66 y 156 pasos.
- Benchmark de cirugía de atención: útil para medir la degradación y recuperación de capacidad predictiva al transplantar operadores, con telemetría concreta del delta de perplejidad (−420.069,27 absoluto, 99,92% relativo).
- Desarrollo de kernels: el despacho en tres niveles (CUDA, Triton, PyTorch) del operador `factorised_matrix_state` permite probar implementaciones de kernels de atención lineal en hardware consumer (RTX 3090).
- Prototipado de modelos eficientes en entornos con VRAM limitada: con 536M parámetros y pesos FP16 de ~1 GB, cabe en GPUs consumer para experimentación con arquitecturas híbridas.
- Docencia y divulgación técnica: ejemplo didáctico de cómo se sustituye un bloque de atención en un modelo preentrenado, incluyendo herencia de pesos y gestión de GQA.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), medidos en el split de validación de WikiText-2 (`wikitext-2-raw-v1`) con longitud de secuencia 512, batch_size=8 y grad_accum=4 sobre una RTX 3090 de 24 GB.

| Métrica | Valor |
|---|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`, GQA softmax) | 15,38 |
| Perplejidad del estudiante zero-shot tras el transplante (pre-KD) | 420.412,82 |
| Perplejidad del estudiante destilado (post-KD) | 343,56 |
| Delta absoluto de perplejidad | −420.069,27 |
| Reducción relativa de perplejidad | 99,92% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,1 GB solo para pesos (1023,15 MB), más overhead de activaciones y caché KV; cómodo en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 3090, RTX 4090) es suficiente por tamaño; el autor usó una RTX 3090 de 24 GB para la destilación.
- Cabe holgadamente en GPU consumer; también es viable en CPU para pruebas de baja latencia no crítica.
- Opciones de despliegue: la librería declarada es `neuralops`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible. Dado el operador de atención no estándar, es probable que requiera el runtime de NeuralOps.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-0.5B + `factorised_matrix_state`, post-KD) | 536M | no disponible | 343,56 (declarada) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | no disponible | 15,38 (declarada) | Apache 2.0 (modelo base Qwen) | Hugging Face |
| Este modelo, pre-KD (zero-shot tras transplante) | 536M | no disponible | 420.412,82 (declarada) | MIT | Hugging Face |

No se dispone en la información proporcionada de otros modelos con atención lineal comparable (por ejemplo, variantes Mamba o RWKV) con métricas verificables para una comparación rigurosa.

## Limitaciones y advertencias

- La perplejidad post-destilación (343,56) es más de veinte veces superior a la del profesor (15,38); la calidad de generación es muy inferior a la del modelo base y no es apta para producción.
- El checkpoint es un artefacto de investigación sobre cirugía de atención y destilación, no un modelo afinado para tareas downstream.
- Solo se declara inglés; no hay evidencia de capacidades multilingües.
- Riesgo elevado de alucinación y de generación incoherente dado el nivel de perplejidad.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false` en el model-index).
- Requiere la librería `neuralops` y su operador de atención personalizado; la compatibilidad con ecosistemas estándar (transformers, vLLM, llama.cpp) no está documentada.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable ese uso en la práctica; conviene revisar también la licencia del modelo base Qwen2.5-0.5B.
- No se documentan sesgos específicos; al derivar de Qwen2.5-0.5B y entrenar solo en WikiText-2, hereda los sesgos del corpus y del profesor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-factorised-matrix-state-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/factorised_matrix_state.py
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
