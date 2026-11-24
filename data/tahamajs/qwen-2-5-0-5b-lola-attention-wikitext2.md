# tahamajs/qwen-2.5-0.5b-lola-attention-wikitext2

## Resumen
El modelo `tahamajs/qwen-2.5-0.5b-lola-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido 18 de las 24 capas de atencion por el operador `LoLAAttention` (Low-Rank Linear Attention with Sparse Caching) de la libreria NeuralOps, seguido de un proceso de destilacion de conocimiento en dos etapas sobre WikiText-2. Lo desarrolla el autor independiente `tahamajs` dentro del proyecto NeuralOps Attention Surgery Zoo, cuyo objetivo es evaluar la viabilidad de reemplazar atencion softmax cuadratica por alternativas subcuadraticas en modelos compactos sin colapsar la calidad del modelo.

El modelo resuelve un problema de investigacion concreto: medir cuanto se degrada un modelo pequeno al aplicar "cirugia de atencion" y cuanto se puede recuperar mediante destilacion de representaciones ocultas. Tras el transplante quirurgico la perplejidad se dispara a 342.001 y tras la destilacion baja a 78,79, frente a los 15,38 del modelo profesor original. Es, por tanto, una pieza de investigacion reproducible, no un modelo listo para produccion.

La relevancia actual reside en el interes creciente por arquitecturas de atencion eficiente (lineal, subcuadratica, hibridas) y por tecnicas de destilacion que permitan migrar modelos preentrenados a topologias mas baratas en inferencia. El checkpoint conserva la licencia MIT y el formato safetensors, y se distribuye con el codigo de la libreria NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder hibrido: 18/24 capas con `LoLAAttention` (low-rank linear attention con cache dispersa) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 481.690.240 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16 completo, 918,81 MB, mas adaptador) |
| Idiomas soportados | ingles (segun metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento
El modelo parte de `Qwen/Qwen2.5-0.5B` (494M parametros, 24 capas, dimension oculta D=896, 14 cabezas de query, 2 cabezas KV, dimension por cabeza 64, RoPE con theta 1.000.000, GQA). Sobre esa base se aplica una topologia hibrida `hybrid_3_1`: las capas con indices `[0,1,2,4,5,6,8,9,10,12,13,14,16,17,18,20,21,22]` usan `LoLAAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas `[3,7,11,15,19,23]` conservan la atencion GQA softmax original como anclas de enrutamiento global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansion de cabezas KV de 2 a 14 y sin proyecciones de salida duplicadas.

`LoLAAttention` combina atencion lineal de bajo rango con subsistemas de cache (reciente, dispersa y de bajo rango) que solo se activan durante la decodificacion autorregresiva (N_q == 1); en prefill y entrenamiento la cache se omite para preservar el enmascaramiento causal. El despacho de kernels es de tres niveles (CUDA / Triton / PyTorch).

El entrenamiento es una destilacion de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una unica RTX 3090 de 24 GB con cacheado offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 123 pasos) congela embeddings, MLPs y `lm_head` y entrena solo modulos de atencion y layernorms con AdamW (lr=2.0e-4, weight decay 0.01, grad clipping 1.0) minimizando `MSE + 0.25 * (1 - cos(h_s, h_t))`. La etapa 2 (70 % del presupuesto, 269 pasos) hace destilacion end-to-end de representaciones con el termino coseno ponderado a 0.50.

## Capacidades
- Generacion de texto causal autorregresiva en ingles.
- Razonamiento basico y continuacion de texto, limitado por el tamano de 0.5B y por la degradacion respecto al profesor.
- Soporte de tool calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la model card declara solo ingles.
- Capacidades especiales: atencion hibrida subcuadratica con cache de decodificacion (reciente, dispersa, de bajo rango) activa solo en generacion token a token.
- Compatibilidad con GQA, RoPE y enmascaramiento causal estandar de Qwen2.

## Casos de uso
- Investigacion en atencion eficiente: sirve como punto de partida reproducible para medir el impacto de sustituir atencion softmax por operadores lineales en modelos de 0.5B, con telemetria publicada de perplejidad antes y despues de la destilacion.
- Destilacion de representaciones: el protocolo en dos etapas y el cacheado offline del profesor son directamente reutilizables para trasplantar otras topologias de atencion sobre modelos preentrenados con recursos modestos (una sola RTX 3090).
- Benchmarking de operadores NeuralOps: permite comparar `lola_attention` frente a GQA softmax en tareas de lenguaje causal con una metrica estandar (perplejidad en WikiText-2).
- Prototipado de inferencia de bajo coste: al reducir la complejidad de atencion en 18 de 24 capas, es util para estudiar latencia y throughput en CPU y GPUs de gama baja, aunque no se publican cifras.
- Educacion y divulgacion: ejemplo didactico de cirugia de atencion, herencia de pesos y destilacion de estados ocultos, con codigo abierto en GitHub.
- Base para experimentos de decodificacion especulativa o cache KV comprimida: la estructura hibrida facilita comparar estrategias de cache entre capas lineales y capas softmax.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | GQA softmax causal de referencia |
| Perplejidad del estudiante pre-destilacion (zero-shot) | 342.001,00 | Tras el transplante de 18/24 capas |
| Perplejidad del estudiante post-destilacion | 78,79 | Tras destilacion en dos etapas |
| Delta absoluto de perplejidad | -341.922,20 | Mejora lograda por la destilacion |
| Reduccion relativa de perplejidad | 99,98 % | Recuperacion desde el pico post-cirugia |

Medido sobre la particion de validacion de WikiText-2 (`wikitext-2-raw-v1`) con longitud de secuencia 512, batch_size=8 y grad_accum=4, en una NVIDIA GeForce RTX 3090 de 24 GB. Los resultados estan declarados por el autor y no verificados por un tercero (`verified: false`).

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 (pesos de 918,81 MB mas adaptador y overhead de activaciones); en cuantizacion de 8 bits o 4 bits no se publican artefactos, pero cabria esperar menos de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; el autor entreno en una RTX 3090 de 24 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la model card referencia la libreria `neuralops` como `library_name`, por lo que la inferencia requiere esa libreria o la exportacion de los pesos a un runtime compatible; no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-lola-attention-wikitext2` | 481,7M | no disponible | 78,79 (post-KD) | MIT | Hugging Face, requiere NeuralOps |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens (segun Qwen) | 15,38 | Apache 2.0 | Hugging Face, transformers nativo |
| `Qwen/Qwen2.5-0.5B-Instruct` | 494M | 32.768 tokens (segun Qwen) | no disponible | Apache 2.0 | Hugging Face, transformers nativo |
| Alternativas de atencion lineal de 0.5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa muestra que el checkpoint destilado queda lejos del profesor en perplejidad (78,79 frente a 15,38) y que su ecosistema de despliegue es mucho mas restringido al depender de NeuralOps.

## Limitaciones y advertencias
- Calidad degradada: la perplejidad post-destilacion es 5,1 veces la del profesor, por lo que la generacion sera notablemente peor en coherencia y fidelidad.
- Modelo de investigacion: no esta pensado para produccion ni para tareas sensibles; no se documentan evaluaciones en tareas downstream (MMLU, HumanEval, GSM8K, etc.).
- Idiomas: solo se declara ingles; el comportamiento en castellano u otros idiomas no esta evaluado y probablemente sea deficiente.
- Riesgo de alucinacion: alto por el tamano (0.5B) y por la degradacion introducida por la cirugia de atencion; no hay evaluaciones de factualidad.
- Sesgos: heredados de los datos de preentrenamiento de Qwen2.5 y no mitigados; la destilacion solo usa WikiText-2, lo que puede introducir sesgo hacia el estilo enciclopedico.
- Contexto: no se confirma la longitud de contexto efectiva tras el transplante; las caches de `LoLAAttention` solo se activan en decodificacion, lo que puede alterar el comportamiento en prefill largo.
- Licencia MIT permite uso comercial, pero la dependencia de la libreria NeuralOps y la ausencia de soporte en runtimes estandar complican el despliegue real.
- Resultados no verificados: la perplejidad de 78,79 esta declarada por el autor (`verified: false`) y no ha sido replicada por terceros.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-lola-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de `LoLAAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/lola_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
