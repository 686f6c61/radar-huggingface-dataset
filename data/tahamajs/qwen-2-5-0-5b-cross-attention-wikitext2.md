# tahamajs/qwen-2.5-0.5b-cross-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-cross-attention-wikitext2` es un checkpoint experimental publicado por el autor independiente `tahamajs` dentro de su proyecto NeuralOps "Attention Surgery Zoo". Se trata de un derivado de `Qwen/Qwen2.5-0.5B` (494 M parametros, 24 capas, dimension oculta 896) en el que se han sustituido quirurgicamente 18 de las 24 capas de atencion del decoder por el operador `CrossAttention` de la libreria NeuralOps, siguiendo un esquema hibrido 3:1, y posteriormente se ha destilado el resultado sobre WikiText-2.

El modelo no pretende ser un asistente generalista ni competir con Qwen2.5-0.5B original: es un artefacto de investigacion que demuestra si es posible reemplazar la atencion softmax GQA por un operador de atencion alternativo en un LLM causal compacto y recuperar la funcionalidad mediante destilacion de representaciones ocultas en dos etapas. El resultado reportado es una perplejidad de 97,96 en la particion de validacion de WikiText-2, frente a 15,38 del modelo profesor original, lo que indica que la cirugia degrada sustancialmente la calidad incluso tras la destilacion.

Su relevancia es metodologica: documenta de forma transparente el protocolo de "attention surgery", la telemetria de destilacion y los artefactos empaquetados (pesos FP16 de 1021,34 MB mas un adaptador), lo que lo convierte en una referencia util para quienes investigan sustitucion de operadores de atencion, atencion subcuadratica o destilacion de representaciones en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con atencion hibrida: 18/24 capas con operador `CrossAttention` (NeuralOps, familia `modern`) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 494 M (heredados del modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta hasta 32 768 tokens; la evaluacion se realizo a longitud de secuencia 512) |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16 completo, 1021,34 MB, mas un adaptador) |
| Idiomas soportados | ingles (segun la model card; el resto no disponible) |
| Licencia | MIT |
| Formato de pesos | FP16 completo (1021,34 MB) mas adaptador; serializacion determinista de pesos |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`: 24 capas de decoder, dimension oculta D=896, 14 cabezas de query, 2 cabezas KV (GQA), dimension por cabeza 64 y RoPE con theta = 1 000 000. Sobre esa base se aplica una "cirugia" determinista con ratio `hybrid_3_1`: las capas con indices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] usan el operador `CrossAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atencion GQA softmax preentrenada como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansion de cabezas KV de 2 a 14 y una unica `o_proj` para evitar proyecciones de salida duplicadas. El operador `CrossAttention` es una atencion multi-cabeza con LoRA que, con `context=None`, actua como self-attention causal y, con `context` externo, como cross-attention; incluye despacho de kernel en tres niveles (CUDA / Triton / PyTorch) y soporte de GQA y RoPE gestionado por el adaptador.

El entrenamiento consiste en una destilacion de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`Salesforce/wikitext`, `wikitext-2-raw-v1`), ejecutada en una unica NVIDIA RTX 3090 de 24 GB con 0 MB de VRAM de profesor gracias a la arquitectura de cacheado offline de representaciones de NeuralOps. La etapa 1 (30 % del presupuesto, 130 pasos) congela el backbone y entrena solo modulos de atencion y layer norms, con pesos maestros FP32, AMP FP16 con GradScaler, AdamW (lr = 2,0e-4, weight decay 0,01, gradient clipping 1,0) y una perdida por capa de MSE + 0,25 * (1 - coseno). La etapa 2 (70 % del presupuesto, 296 pasos) realiza destilacion end-to-end de representaciones con la perdida MSE + 0,50 * (1 - coseno) y lr = 6e-5 (el dato queda truncado en la informacion disponible). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, heredada del modelo base Qwen2.5-0.5B.
- Modelado de lenguaje y calculo de perplejidad sobre corpus tipo WikiText-2.
- Soporte de atencion causal con GQA y RoPE a traves del adaptador.
- Cross-attention opcional: el operador admite un `context` externo para K/V, ademas del modo self-attention.
- Capacidad de servir como banco de pruebas para sustitucion de operadores de atencion y destilacion de representaciones.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo "thinking"; no disponibles.
- Capacidades multilingues: solo se declara ingles; no disponible el resto.

## Casos de uso

- Investigacion en sustitucion de atencion: sirve como referencia reproducible para medir el impacto de reemplazar atencion softmax GQA por un operador alternativo en un decoder pequeno, con telemetria completa de perplejidad antes y despues de la destilacion.
- Experimentos de destilacion de representaciones: el protocolo en dos etapas (alineamiento de subespacio con backbone congelado y destilacion end-to-end) puede replicarse sobre otros modelos y corpus para comparar estrategias.
- Benchmarking de operadores en la libreria NeuralOps: permite validar el despacho de kernel CUDA / Triton / PyTorch y el adaptador `QwenAttentionAdapter` en un caso real de 24 capas.
- Docencia y divulgacion tecnica: ilustra de forma cuantitativa el coste de una cirugia de atencion (perplejidad de 813 457,09 en zero-shot tras el transplante) y el grado de recuperacion que aporta la destilacion (97,96 final).
- Pruebas de infraestructura de entrenamiento con memoria limitada: el cacheado offline de representaciones permite destilar con 0 MB de VRAM de profesor en una RTX 3090 de 24 GB, util para laboratorios con hardware modesto.
- Evaluacion de perplejidad sobre WikiText-2: el checkpoint puede usarse como baseline degradado en estudios de ablacion sobre arquitecturas hibridas 3:1.
- No se recomienda su uso en produccion como generador de texto, atencion al cliente, generacion de codigo ni tareas de agentes, dado el deterioro de calidad frente al modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). Evaluados en la particion de validacion de WikiText-2 (`wikitext-2-raw-v1`) con longitud de secuencia 512, batch_size 8 y grad_accum 4, en una NVIDIA GeForce RTX 3090 de 24 GB.

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad del estudiante zero-shot pre-destilacion | 813 457,09 | Inmediatamente tras el transplante de 18/24 capas |
| Perplejidad del estudiante post-destilacion | 97,96 | Tras destilacion de representaciones en dos etapas |
| Delta absoluto de perplejidad | -813 359,13 | Cambio logrado mediante destilacion |
| Reduccion relativa de perplejidad | 99,99 % | Recuperacion porcentual respecto al pico post-cirugia |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP16 ocupan aproximadamente 1021,34 MB (unos 1 GB), por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o mas; con cuantizacion a 8 bits o 4 bits (no publicada) quedaria por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA; el autor uso una NVIDIA GeForce RTX 3090 de 24 GB para la destilacion, pero la inferencia no requiere ese nivel. A100, H100 o RTX 4090 son sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en GTX 1650, RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la libreria declarada es `neuralops`, por lo que la carga depende de esa libreria y de su `QwenAttentionAdapter`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Dado que los pesos son FP16 y no hay GGUF publicado, el despliegue en llama.cpp u Ollama requeriria conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/qwen-2.5-0.5b-cross-attention-wikitext2` | 494 M | no disponible (evaluado a 512) | 97,96 (post-destilacion) | MIT | Hugging Face, libreria `neuralops` |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | hasta 32 768 tokens | 15,38 | Apache 2.0 (modelo base Qwen2.5) | Hugging Face, amplio ecosistema |
| `Qwen/Qwen2.5-1.5B` | 1,5 B | hasta 32 768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | 1,2 B | 128 000 tokens | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face |

La comparativa relevante es contra el propio modelo base: el checkpoint derivado multiplica por 6,4 la perplejidad del profesor (97,96 frente a 15,38) a cambio de una topologia de atencion hibrida experimental. Frente a alternativas de tamano similar del ecosistema (Qwen2.5-1.5B, Llama-3.2-1B), carece de datos publicados de benchmarks estandar y de soporte en herramientas de inferencia ampliamente adoptadas.

## Limitaciones y advertencias

- Calidad degradada de forma sustancial: la perplejidad post-destilacion (97,96) sigue siendo 6,4 veces la del modelo base (15,38); no es apto como sustituto funcional de Qwen2.5-0.5B en produccion.
- Riesgo elevado de alucinacion y de texto incoherente, derivado de la sustitucion de 18 de 24 capas de atencion y de una destilacion limitada (426 pasos en total sobre WikiText-2).
- Entrenado y evaluado unicamente sobre WikiText-2 en ingles; el dominio y los idiomas cubiertos son muy estrechos. No hay datos sobre comportamiento multilingue.
- La model card declara licencia MIT, mientras que el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0; conviene revisar las condiciones de ambos antes de un uso comercial.
- Dependencia de la libreria `neuralops` y de su `QwenAttentionAdapter` para cargar el checkpoint; no hay pesos en GGUF ni integracion documentada con vLLM, llama.cpp, Ollama o TGI, lo que limita el despliegue estandar.
- Los resultados de benchmarks son declarados por el autor y estan marcados como no verificados (`verified: false`); no hay validacion independiente.
- El autor no documenta sesgos especificos, pero al heredar el preentrenamiento de Qwen2.5-0.5B y anadir una destilacion sobre WikiText-2, los sesgos del corpus original y del dataset de destilacion pueden persistir o amplificarse.
- No se documentan evaluaciones de seguridad, robustez ni comportamiento en conversacion multi-turno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-cross-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador `CrossAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/cross_attention.py
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
