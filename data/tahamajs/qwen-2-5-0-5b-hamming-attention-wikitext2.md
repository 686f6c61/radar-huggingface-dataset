# tahamajs/qwen-2.5-0.5b-hamming-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-hamming-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Attention Surgery Zoo". Se trata de un transplante quirúrgico sobre `Qwen/Qwen2.5-0.5B` en el que 18 de las 24 capas de atencion del decoder han sido sustituidas por el operador `HammingAttention` (familia sparse) de la libreria NeuralOps, seguidas de una destilacion de conocimiento en dos etapas sobre WikiText-2.

El modelo no es un modelo de proposito general ni un lanzamiento oficial de Alibaba Qwen: es un artefacto de investigacion que demuestra la viabilidad de sustituir atencion softmax por un mecanismo subcuadratico disperso manteniendo un rendimiento minimamente util en modelado de lenguaje. La relevancia esta en la metodologia (cirugia de atencion + destilacion de representaciones ocultas) mas que en el modelo en si.

Con 535 millones de parametros totales, 24 capas, dimension oculta de 896 y cabezas GQA (14 query / 2 KV), hereda la topologia de Qwen2.5-0.5B pero con un layout hibrido 3:1: seis capas conservan la atencion GQA original como anclas de recuperacion global y dieciocho usan HammingAttention. La perplejidad final en WikiText-2 es de 144,38 frente a 15,38 del profesor, lo que refleja una degradacion sustancial pese a la recuperacion del 99,96 % respecto al colapso post-cirugia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only hibrido (Qwen2) con atencion sparse HammingAttention en 18/24 capas y GQA softmax nativa en 6/24 |
| Parametros totales | 535.364.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1021,18 MB, mas adaptador) |
| Idiomas soportados | ingles (segun metadatos `language: en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |
| Libreria | neuralops |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Dimension oculta | 896 |
| Cabezas query / KV | 14 / 2 (GQA) |
| Dimension por cabeza | 64 |
| RoPE theta | 1.000.000 |
| Kernel dispatch | CUDA / Triton / PyTorch (3 niveles) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B (24 bloques decoder, D=896, H_q=14, H_kv=2, d_h=64) y aplica una "cirugia de atencion" determinista con ratio `hybrid_3_1`. Las capas en los indices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] (18 de 24, el 75 %) sustituyen la atencion softmax por `HammingAttention` envuelta en `QwenAttentionAdapter`. Las capas [3, 7, 11, 15, 19, 23] conservan la atencion GQA original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansion de cabezas KV de 2 a 14 y una unica `o_proj` para evitar proyecciones de salida duplicadas.

El entrenamiento consiste en una destilacion de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`, split de validacion), longitud de secuencia 512, batch 8 y acumulacion de gradiente 4, ejecutada en una unica RTX 3090 de 24 GB con la arquitectura de cache offline de representaciones del profesor (0 MB de VRAM del profesor en GPU durante el paso de estudiante). La etapa 1 (30 % del presupuesto, 109 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo modulos de atencion y layernorms con AdamW (lr=2.0e-4, weight_decay=0.01, clipping 1.0) minimizando un MSE por capa mas un termino de similitud coseno (0,25 · (1 - cos)). La etapa 2 (70 % del presupuesto, 248 pasos) realiza destilacion end-to-end de representaciones con una perdida de alineacion por capa mas estricta. La innovacion tecnica destacable es la propia sustitucion del operador de atencion manteniendo soporte causal autoregresivo, GQA y RoPE, con dispatch de kernel a tres niveles.

## Capacidades

- Generacion de texto causal autoregresiva (pipeline `text-generation`).
- Modelado de lenguaje y calculo de perplejidad sobre corpus en ingles.
- Soporte de atencion causal con enmascaramiento autoregresivo en las capas HammingAttention.
- Compatibilidad con GQA (expansion de 2 a 14 cabezas KV) y RoPE con theta 1.000.000.
- Capacidad de servir como banco de pruebas para experimentos de atencion subcuadratica y sparse.
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: solo ingles declarado; no se documentan otras lenguas.

## Casos de uso

- Investigacion en atencion subcuadratica: sirve como referencia reproducible para comparar HammingAttention frente a softmax GQA en un modelo pequeno, con el checkpoint del profesor y las metricas de perplejidad ya publicadas.
- Experimentos de cirugia de atencion: permite a un investigador partir de un checkpoint ya transplantado y destilado para probar variantes de ratio hibrido, capas ancla o presupuestos de destilacion sin repetir la fase inicial.
- Validacion de la libreria NeuralOps: util para verificar el correcto funcionamiento del dispatch de kernel CUDA/Triton/PyTorch y del `QwenAttentionAdapter` en un entorno real.
- Docencia y divulgacion: ejemplo didactico y de bajo coste (0,5B parametros, cabe en una GPU consumer) para explicar destilacion de representaciones ocultas y sustitucion de operadores.
- Benchmarking de perplejidad en WikiText-2: util como baseline negativo o de control en estudios que midan el coste en calidad de mecanismos de atencion sparse.
- Pruebas de despliegue con la libreria `neuralops`: permite validar pipelines de inferencia especificos de NeuralOps antes de escalar a modelos mayores del mismo zoo.
- No se recomienda su uso en produccion para atencion al cliente, generacion de codigo, agentes ni tareas de razonamiento, dado su nivel de perplejidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), medidos en el split de validacion de WikiText-2 con longitud de secuencia 512:

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal |
| Perplejidad del estudiante zero-shot tras cirugia | 392.424,85 | Inmediatamente tras transplantar 18/24 capas |
| Perplejidad del estudiante tras destilacion | 144,38 | Tras destilacion en 2 etapas (metrica principal) |
| Delta absoluto de perplejidad | -392.280,47 | Mejora lograda por la destilacion |
| Reduccion relativa de perplejidad | 99,96 % | Recuperacion respecto al pico post-cirugia |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB de pesos mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: el autor entreno la destilacion en una NVIDIA GeForce RTX 3090 de 24 GB; para inferencia basta con una RTX 3060, RTX 4060 o superior.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU para pruebas lentas.
- Opciones de despliegue: la libreria nativa es `neuralops`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, dado que el operador HammingAttention es no estandar y requiere el dispatch de kernel de NeuralOps.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| qwen-2.5-0.5b-hamming-attention-wikitext2 | 535 M | no disponible | 144,38 | MIT | Hugging Face (NeuralOps) |
| Qwen/Qwen2.5-0.5B (profesor) | 494 M | no disponible en esta ficha | 15,38 | Apache 2.0 (upstream) | Hugging Face |
| Otros modelos del NeuralOps Attention Surgery Zoo | no disponible | no disponible | no disponible | MIT | Hugging Face (autor tahamajs) |

La comparativa directa con alternativas de la misma categoria (modelos de 0,5B con atencion sparse) no esta disponible en la informacion proporcionada. Frente a su profesor, la diferencia de perplejidad es de aproximadamente 9,4x, lo que cuantifica el coste en calidad del transplante de atencion.

## Limitaciones y advertencias

- Perplejidad muy superior a la del modelo base (144,38 frente a 15,38): la calidad de generacion esta sustancialmente degradada y no es apta para tareas de produccion que requieran coherencia.
- Artefacto de investigacion: no es un modelo oficial de Qwen ni ha pasado por evaluaciones de seguridad o alineamiento.
- Solo se declara soporte de ingles; el comportamiento en otros idiomas no esta documentado y previsiblemente sera deficiente.
- Longitud de contexto no declarada en la model card; no debe asumirse la ventana nativa de Qwen2.5-0.5B sin verificacion empirica.
- Dependencia de la libreria `neuralops` y de sus kernels CUDA/Triton: no es un checkpoint portable a stacks de inferencia estandar sin trabajo de adaptacion.
- Riesgo elevado de alucinacion y de texto incoherente dado el nivel de perplejidad; no usar en atencion al cliente, generacion de codigo ni agentes.
- La licencia MIT se aplica al checkpoint publicado, pero el modelo base Qwen2.5-0.5B tiene su propia licencia upstream que conviene revisar antes de cualquier uso comercial.
- Los resultados de perplejidad estan marcados como no verificados (`verified: false`) y provienen de una unica ejecucion en una RTX 3090; no hay replicacion independiente documentada.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5-0.5B y entrenarse en WikiText-2, hereda los sesgos del corpus y del profesor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-hamming-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de HammingAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/hamming_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
