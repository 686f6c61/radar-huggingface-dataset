# tahamajs/qwen-2.5-0.5b-cluster-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-cluster-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido 18 de las 24 capas de atencion por el operador `ClusterAttention` (atencion dispersa por clustering de tokens) de la libreria NeuralOps, seguido de un proceso de destilacion de conocimiento en dos etapas sobre WikiText-2. Lo desarrolla el autor independiente `tahamajs` dentro del proyecto NeuralOps Attention Surgery Zoo, un banco de pruebas de "cirugia de atencion" que reemplaza mecanismos de atencion estandar por alternativas subcuadraticas.

El modelo no es un modelo de proposito general ni un sustituto de Qwen2.5-0.5B: es un artefacto de investigacion que mide cuanto rendimiento se puede recuperar tras una transplantacion quirurgica agresiva de capas de atencion. La relevancia esta en la metodologia: demuestra que una topologia hibrida 3:1 (atencion cluster en 18 capas, GQA nativa en 6 capas ancla) puede recuperar el 99,76 % de la perplejidad perdida tras la cirugia, partiendo de una PPL de 440.626 y llegando a 1.045,39, frente a los 15,38 del profesor original.

El resultado final sigue estando muy lejos del modelo base en calidad de lenguaje (PPL 68 veces peor), por lo que su interes es empirico y metodologico, no practico. La arquitectura subyacente es un transformer decoder-only Qwen2 de 24 capas, con GQA (14 cabezas de query, 2 de KV), RoPE con theta 1.000.000 y 535 millones de parametros reales en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas `ClusterAttention` (dispersa) + 6/24 capas GQA softmax nativas |
| Parametros totales | 535.364.224 (segun safetensors); el autor cita 494M para el base Qwen2.5-0.5B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explicita; evaluado a longitud de secuencia 512 |
| Tipos de cuantizacion | No disponible; pesos publicados en FP16 completo (1021,18 MB) mas adaptador |
| Idiomas soportados | Ingles (tag `en` en la model card); no se declaran otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |
| Dimension del modelo | D = 896, 24 capas, 14 cabezas de query, 2 cabezas KV, d_h = 64 |
| RoPE theta | 1.000.000 |
| Libreria | neuralops |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Dataset de destilacion | Salesforce/wikitext (wikitext-2-raw-v1) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B y aplica una "cirugia" determinista con ratio `hybrid_3_1`: las capas con indices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `ClusterAttention` envuelto en un `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atencion GQA softmax original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores preentrenados `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansion de cabezas KV de 2 a 14 para adaptarse al operador cluster y sin proyecciones de salida duplicadas. El operador soporta enmascaramiento causal autorregresivo, GQA y RoPE, y ofrece despacho de kernel en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilacion de representaciones ocultas en dos etapas, ejecutada con la arquitectura de cacheado offline de NeuralOps sobre una unica RTX 3090 de 24 GB (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 114 pasos) congela embeddings, MLPs y `lm_head` y entrena solo modulos de atencion y layer norms, con AdamW (lr=2.0e-4, weight decay 0.01, clipping 1.0), pesos maestros en FP32 y AMP FP16, minimizando MSE por capa mas 0.25 veces (1 - coseno) entre estados ocultos del estudiante y del profesor. La etapa 2 (70 % del presupuesto, 262 pasos) realiza destilacion end-to-end de representaciones con un objetivo de alineamiento por capa mas estricto. La evaluacion se hace sobre el split de validacion de WikiText-2 a longitud 512, con batch_size 8 y grad_accum 4.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, heredada de Qwen2.5-0.5B.
- Razonamiento basico y generacion de codigo limitados: el checkpoint conserva los pesos del base pero la calidad esta severamente degradada por la cirugia y la destilacion parcial.
- Soporte de atencion causal con GQA y RoPE a traves del operador `ClusterAttention`.
- Capacidad de servir como banco de pruebas para comparar operadores de atencion dispersa frente a atencion softmax estandar.
- No se declara soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.
- No se declara soporte de vision, audio ni modo thinking.
- Capacidades multilingues no disponibles: solo se declara ingles.

## Casos de uso

- Investigacion en atencion subcuadratica: el checkpoint sirve como referencia empirica de cuanto se degrada y cuanto se recupera al sustituir atencion softmax por atencion por clustering en un modelo pequeno, con telemetria completa de PPL antes y despues de la destilacion.
- Benchmarking de operadores de atencion: util para comparar `ClusterAttention` frente a otras alternativas del catalogo NeuralOps (sparse, linear, hybrid) sobre la misma base Qwen2.5-0.5B y el mismo protocolo de evaluacion en WikiText-2.
- Estudio de destilacion de representaciones: la separacion en dos etapas (alineamiento de subespacio con backbone congelado y destilacion end-to-end) permite reproducir y analizar el impacto de cada fase sobre la recuperacion de perplejidad.
- Prototipado de cirugia de modelos en hardware consumer: el pipeline completo cabe en una RTX 3090 de 24 GB con 0 MB de VRAM del profesor, lo que lo hace accesible para laboratorios con recursos limitados.
- Validacion de topologias hibridas: permite experimentar con ratios de sustitucion (3:1 en este caso) y medir el equilibrio entre eficiencia subcuadratica y capacidad de recuperacion de informacion global.
- Docencia y divulgacion tecnica: ejemplo reproducible de transplantacion de capas, herencia de pesos entre proyecciones y evaluacion con perplejidad sobre un corpus estandar.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre WikiText-2 (`wikitext-2-raw-v1`, split de validacion, longitud 512). La metrica de perplejidad post-destilacion no esta verificada (`verified: false`).

| Metrica | Valor |
|---|---:|
| Perplejidad del profesor (Qwen/Qwen2.5-0.5B) | 15,38 |
| Perplejidad del estudiante zero-shot tras la cirugia (pre-KD) | 440.626,27 |
| Perplejidad del estudiante tras destilacion (post-KD) | 1.045,39 |
| Delta absoluto de perplejidad | -439.580,89 |
| Reduccion relativa de perplejidad | 99,76 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB solo para pesos (1021,18 MB declarados), mas cache KV y overhead del runtime; en la practica, entre 2 y 3 GB para secuencias cortas.
- El entrenamiento de destilacion se ejecuto en una NVIDIA GeForce RTX 3090 de 24 GB, con 0 MB de VRAM del profesor gracias al cacheado offline de representaciones.
- Cabe holgadamente en GPUs consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, y en GPUs de 8 GB en cuantizaciones de 8 bits o inferiores (aunque no se publican pesos cuantizados).
- Despliegue: la libreria declarada es `neuralops`, no `transformers`; el operador `ClusterAttention` requiere los kernels de NeuralOps (CUDA / Triton / PyTorch). No se declara compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El caracter subcuadratico del operador sugiere ventajas a secuencias largas, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-cluster-attention-wikitext2 | 535M | No disponible (evaluado a 512) | 1.045,39 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | 32.768 tokens (segun el modelo base) | 15,38 | Apache 2.0 | Hugging Face |
| Otros checkpoints del Attention Surgery Zoo (NeuralOps) | ~535M | No disponible | No disponible | MIT | Hugging Face |

La comparativa directa solo es posible contra el profesor, ya que el autor no publica resultados de otros operadores en la informacion disponible. La diferencia de perplejidad (15,38 frente a 1.045,39) refleja el coste de la cirugia y de una destilacion limitada a WikiText-2.

## Limitaciones y advertencias

- Calidad de lenguaje muy degradada: la perplejidad post-destilacion (1.045,39) es aproximadamente 68 veces la del modelo base (15,38), lo que se traduce en generaciones incoherentes o repetitivas en uso real.
- Entrenado exclusivamente sobre WikiText-2, un corpus enciclopedico de dominio estrecho; el ajuste no cubre instrucciones, dialogos ni codigo, por lo que el tag `conversational` no esta respaldado por datos de entrenamiento conversacional.
- Solo se declara ingles; no hay evidencia de capacidades multilingues.
- Riesgo elevado de alucinacion y de fallos de coherencia a causa de la destilacion parcial y de la sustitucion de capas de atencion.
- La metrica principal no esta verificada (`verified: false`); los numeros proceden del propio autor y no de una evaluacion independiente.
- La licencia MIT permite uso comercial, pero el checkpoint deriva de Qwen2.5-0.5B (Apache 2.0); conviene revisar las condiciones del modelo base y del proyecto NeuralOps antes de redistribuir.
- Dependencia de la libreria `neuralops` y de sus kernels para cargar el modelo; no se garantiza compatibilidad con el ecosistema `transformers` estandar.
- No apto para produccion: es un artefacto de investigacion sin garantias de estabilidad, soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-cluster-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementacion de `ClusterAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/cluster_attention.py
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
