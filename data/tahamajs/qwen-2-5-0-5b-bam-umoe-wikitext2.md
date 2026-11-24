# tahamajs/qwen-2.5-0.5b-bam-umoe-wikitext2

## Resumen

`qwen-2.5-0.5b-bam-umoe-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Attention Surgery Zoo. Se trata de un transplante quirúrgico del modelo base Qwen/Qwen2.5-0.5B en el que 18 de las 24 capas de atención del decoder (75%) han sido sustituidas por el operador `bam_umoe` (`BAMUMoEBlock`, familia sparse) de la librería NeuralOps, mientras que las 6 capas restantes conservan la atención GQA original de Qwen2 como anclas de enrutamiento global. El resultado se ha destilado después mediante un protocolo de knowledge distillation en dos etapas sobre WikiText-2.

El interés del modelo es fundamentalmente metodológico: demuestra que es posible sustituir la atención softmax estándar por un operador de atención disperso subcuadrático en un transformer compacto y recuperar buena parte de la calidad original mediante destilación de representaciones ocultas. El autor reporta una perplejidad post-destilación de 80,85 en WikiText-2 frente a la línea base del profesor de 15,38, lo que sitúa al modelo muy por debajo de su base en calidad de lenguaje pero valida la viabilidad del transplante.

Con 494 millones de parámetros, licencia MIT y un tamaño de repositorio de 1,1 GB, el modelo está pensado como artefacto de investigación para estudiar topologías híbridas de atención, no como modelo de producción. La ventana de contexto, los idiomas soportados y los detalles de entrenamiento más allá de lo indicado en la model card no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con `bam_umoe` (BAMUMoEBlock, sparse) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 494.085.760 |
| Parametros activos | no disponible (el operador se describe como sparse/MoE pero no se publica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 942,46 MB, más adaptador) |
| Idiomas soportados | en (inglés, según el campo `language` de la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder de 24 capas con dimensión oculta D=896, 14 cabezas de consulta, 2 cabezas KV (GQA) y dimensión por cabeza de 64. Sobre esa base se aplica una cirugía determinista con ratio `hybrid_3_1`: las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] se sustituyen por el operador `bam_umoe` envuelto en un `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] mantienen la atención GQA softmax preentrenada como anclas de recuperación contextual. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14, evitando proyecciones sin inicializar. El adaptador gestiona RoPE con theta = 1.000.000 y el operador soporta causalidad autoregresiva y dispatch de kernels en tres niveles (CUDA, Triton, PyTorch).

Tras el transplante, el modelo sufre un colapso severo: la perplejidad zero-shot se dispara a 338.496,47. Para recuperarlo se aplica un protocolo de destilación de representaciones ocultas en dos etapas. La etapa 1 (30% del presupuesto, 121 pasos) congela el backbone y entrena solo módulos de atención y layernorms con AdamW (lr=2.0e-4, weight decay 0.01, gradient clipping 1.0), usando pesos maestros FP32 con AMP FP16 y una pérdida por capa de MSE + 0.25 * (1 - coseno). La etapa 2 (70% del presupuesto, 284 pasos) hace destilación end-to-end con una pérdida más estricta de MSE + 0.50 * (1 - coseno). Todo el entrenamiento se ejecutó en una única RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU), a longitud de secuencia 512 y batch efectivo de 32.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Razonamiento básico y respuesta conversacional limitada por el tamaño del modelo (0,5B) y por la degradación introducida por el transplante.
- Soporte de atención causal con GQA en las capas ancla y atención dispersa subcuadrática en las capas transplantadas.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés declarado; el resto de idiomas del modelo base no se garantizan.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Investigación en arquitecturas de atención eficiente: el modelo sirve como banco de pruebas reproducible para estudiar cómo afecta la sustitución de atención softmax por operadores dispersos en un transformer pequeño, comparando perplejidad antes y después de la destilación.
- Estudio de destilación de representaciones ocultas: el protocolo de dos etapas y la telemetría publicada (PPL pre-KD 338.496,47, post-KD 80,85) permiten replicar y extender experimentos de knowledge distillation con caché offline de profesor en una sola GPU de consumo.
- Validación de la técnica de cirugía `hybrid_3_1`: útil para medir empíricamente qué proporción de capas nativas hay que preservar como anclas para mantener la recuperación contextual en modelos compactos.
- Prototipado de kernels CUDA/Triton: el operador `bam_umoe` con dispatch a tres niveles permite probar implementaciones de atención dispersa en hardware de consumo antes de escalar a modelos mayores.
- Docencia y divulgación: ejemplo didáctico de transplante de operadores, herencia de pesos y colapso/recuperación por destilación en un modelo de 494M parámetros que cabe en cualquier GPU moderna.
- Generación de texto de baja exigencia en inglés para pruebas de integración de pipelines: dado su tamaño reducido y licencia MIT, puede usarse como modelo de relleno en tests de sistemas de inferencia, siempre que no se requiera calidad lingüística alta.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente), medidos en el split de validación de WikiText-2 (`wikitext-2-raw-v1`) a longitud de secuencia 512, batch 8 con acumulación 4, sobre una NVIDIA GeForce RTX 3090 de 24 GB.

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen/Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax |
| Perplejidad zero-shot del estudiante tras el transplante | 338.496,47 | Justo después de sustituir 18/24 capas |
| Perplejidad post-destilación del estudiante | 80,85 | Tras destilación en dos etapas |
| Delta absoluto de perplejidad | -338.415,61 | Cambio logrado por la destilación |
| Reducción relativa de perplejidad | 99,98% | Recuperación respecto al pico post-cirugía |

No se han publicado resultados de benchmarks en la información disponible para tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (942,46 MB) más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,5 GB de pesos; en 4 bits, alrededor de 0,25 GB. Los tipos de cuantización concretos no están documentados.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; una RTX 3090 (24 GB) es suficiente y fue la hardware usada para el entrenamiento.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: la librería `neuralops` es la vía natural, ya que el operador `bam_umoe` requiere sus kernels. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| qwen-2.5-0.5b-bam-umoe-wikitext2 | 494M | no disponible | 80,85 (post-KD) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | 494M | no disponible | 15,38 | Apache 2.0 (modelo base) | Hugging Face |
| Qwen2.5-1.5B | 1,5B | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparación relevante es contra su propio profesor: el modelo destilado queda con una perplejidad 5,25 veces mayor que Qwen2.5-0.5B, lo que refleja el coste de calidad del transplante. No se dispone de datos de benchmarks de tareas downstream para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Calidad lingüística muy degradada respecto al modelo base: la perplejidad post-destilación (80,85) es 5,25 veces la del profesor (15,38), lo que se traduce en generaciones menos coherentes y mayor tasa de errores.
- Riesgo elevado de alucinación y de texto incoherente, especialmente en secuencias largas o dominios alejados de WikiText-2.
- El modelo se ha destilado únicamente sobre WikiText-2, un corpus enciclopédico en inglés; el sesgo de dominio es significativo y no se ha evaluado en otros registros.
- Idiomas: solo inglés declarado; el multilingüismo del modelo base no está garantizado tras la cirugía y la destilación.
- Longitud de contexto no documentada; no se debe asumir la ventana nativa de Qwen2.5-0.5B sin verificación empírica.
- Dependencia de la librería `neuralops` y de sus kernels para ejecutar el operador `bam_umoe`; la portabilidad a otros runtimes (llama.cpp, vLLM) no está documentada.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia Apache 2.0, cuyos términos pueden seguir aplicando a los pesos derivados.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- No apto para producción sin una evaluación exhaustiva previa en la tarea objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-bam-umoe-wikitext2
- Modelo base Qwen/Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `bam_umoe`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/bam_umoe.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
