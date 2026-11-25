# tahamajs/qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2` es un checkpoint experimental publicado por el usuario `tahamajs` dentro del proyecto NeuralOps Attention Surgery Zoo. Se trata de un transplante quirúrgico del modelo base Qwen2.5-0.5B (494 millones de parametros, 24 capas de decoder, dimension oculta 896, 14 cabezas de query y 2 de clave/valor) en el que 18 de las 24 capas de atencion han sido sustituidas por el operador `AdaptiveSparseAttention` de la libreria NeuralOps, mientras que 6 capas conservan la atencion GQA softmax original de Qwen2.

El objetivo del experimento es evaluar si un esquema hibrido de atencion dispersa adaptativa (ratio 3:1, es decir, 75 por ciento de capas transplantadas frente a 25 por ciento nativas) puede mantener la calidad del modelo tras una destilacion de conocimiento en dos etapas sobre WikiText-2. El resultado medido es una perplejidad de 2.738,78 en el split de validacion, frente a los 15,38 del modelo profesor original: una degradacion severa que convierte este checkpoint en una pieza de investigacion sobre cirugia de atencion, no en un modelo listo para produccion.

Es relevante ahora porque documenta de forma transparente el coste de sustituir atencion cuadratica por operadores subcuadraticos en modelos pequenos, con telemetria completa del proceso (perplejidad pre-destilacion de 244.977,47, reduccion relativa del 98,88 por ciento tras la destilacion). La licencia MIT y el formato de pesos abierto permiten reproducir y auditar el experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas `AdaptiveSparseAttention` + 6/24 capas GQA softmax nativas |
| Parametros totales | 494 millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens; la model card no confirma el contexto efectivo tras la cirugia) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1.021,32 MB, mas un adaptador) |
| Idiomas soportados | ingles (segun la model card; el modelo base es multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors FP16 completo mas adaptador; libreria `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 bloques, dimension oculta 896, 14 cabezas de query, 2 cabezas de clave/valor (GQA) y cabezas de 64 dimensiones, con RoPE configurado a theta = 1.000.000. Sobre esa base se aplica una "cirugia de atencion" determinista con ratio `hybrid_3_1`: las capas con indices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan `AdaptiveSparseAttention` envuelto en un `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] mantienen la atencion GQA softmax preentrenada para preservar el enrutamiento contextual global y las cabezas de induccion. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansion de cabezas KV de 2 a 14 y una unica proyeccion de salida sin duplicados.

`AdaptiveSparseAttention` implementa top-k dinamico y umbrales adaptativos de dispersidad, con soporte de mascaras causales y bidireccionales, RoPE, GQA y despacho de kernels en tres niveles (CUDA, Triton y PyTorch). El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con secuencia de 512, batch de 8 y acumulacion de gradiente de 4, ejecutada en una unica RTX 3090 de 24 GB mediante cacheado offline de representaciones (sin VRAM de profesor). La etapa 1 congela el backbone y entrena solo modulos de atencion y layer norms (30 por ciento del presupuesto, 79 pasos), con pesos maestros FP32 y AMP FP16. Tras el transplante, la perplejidad cero-shot del estudiante era de 244.977,47; la destilacion la reduce un 98,88 por ciento hasta 2.738,78.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, heredada del modelo base.
- Atencion dispersa adaptativa con top-k dinamico y umbrales, orientada a reducir el coste cuadratico de la atencion.
- Soporte de mascaras causales y bidireccionales en el operador transplantado.
- Compatibilidad con RoPE y GQA dentro del operador disperso.
- Despacho de kernels en tres niveles (CUDA, Triton, PyTorch) para distintos backends.
- Capacidades conversacionales y de tool calling del modelo base: no verificadas ni garantizadas tras la cirugia y la destilacion.
- Capacidades multilingues del modelo base: no garantizadas; la model card declara solo ingles.

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como referencia reproducible para medir el impacto de sustituir atencion softmax por operadores dispersos en un transformer pequeno, con telemetria completa de perplejidad antes y despues de la destilacion.
- Benchmarking de operadores NeuralOps: permite comparar `AdaptiveSparseAttention` frente a GQA softmax en igualdad de condiciones (mismo modelo base, mismo dataset, mismo hardware), aislando el efecto del operador.
- Estudio de destilacion de conocimiento: el protocolo en dos etapas con cacheado offline de representaciones es reutilizable para entrenar variantes con presupuesto de VRAM reducido (una sola RTX 3090).
- Pruebas de integracion de la libreria `neuralops`: validar el pipeline de cirugia, serializacion de pesos y carga del adaptador en entornos de desarrollo.
- Docencia y divulgacion: ejemplo didactico de como una modificacion arquitectonica agresiva degrada la perplejidad y de como la destilacion recupera solo parte de la calidad.
- Exploracion de eficiencia en inferencia: medir latencia y memoria del esquema hibrido 3:1 en GPUs de consumo, aunque sin garantias de calidad de salida.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en WikiText-2 (`wikitext-2-raw-v1`, split de validacion, longitud de secuencia 512, batch 8, acumulacion 4, RTX 3090 24 GB):

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal |
| Perplejidad del estudiante cero-shot tras cirugia | 244.977,47 | Inmediatamente tras transplantar 18/24 capas |
| Perplejidad del estudiante tras destilacion (2 etapas) | 2.738,78 | Metrica principal de la model card |
| Delta absoluto de perplejidad | -242.238,69 | Cambio logrado por la destilacion |
| Reduccion relativa de perplejidad | 98,88 % | Recuperacion desde el pico post-cirugia |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en FP16 para los 494 millones de parametros (1,4 GB de repositorio, 1.021,32 MB de pesos FP16), mas overhead de activaciones y kernels.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entreno en una NVIDIA GeForce RTX 3090 de 24 GB.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y equivalentes con 4 GB o mas.
- Opciones de despliegue: la libreria `neuralops` es el entorno nativo; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (hibrido 3:1 + destilacion) | 494 M | no disponible | 2.738,78 (validacion, seq 512) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494 M | 32.768 tokens | 15,38 (validacion, seq 512) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y su variante Instruct porque no se dispone de datos de otros modelos con atencion dispersa adaptativa en el mismo rango de tamano dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad de 2.738,78 es aproximadamente 178 veces la del modelo base (15,38); no es apto para produccion sin validacion adicional.
- El checkpoint es un artefacto de investigacion sobre cirugia de atencion, no un modelo afinado para tareas concretas.
- Riesgo elevado de alucinacion y de texto incoherente dada la perplejidad medida.
- Idiomas: la model card declara solo ingles; las capacidades multilingues del base no estan garantizadas tras la cirugia.
- Longitud de contexto efectiva no documentada; no se debe asumir la ventana de 32.768 tokens del modelo base.
- Requiere la libreria `neuralops` para cargar el operador `AdaptiveSparseAttention`; la compatibilidad con otros runtimes no esta confirmada.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene licencia Apache 2.0, cuyos terminos conviene revisar en despliegues derivados.
- Los resultados de benchmarks son declarados por el autor y estan marcados como no verificados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-adaptive-sparse-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Libreria NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/adaptive_sparse_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
