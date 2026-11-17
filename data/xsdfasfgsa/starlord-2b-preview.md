# xsdfasfgsa/Starlord-2B-preview

## Resumen

Starlord-2B-preview es un modelo de decisión derivado por fine-tuning de Qwen/Qwen3.5-2B, publicado por el usuario xsdfasfgsa. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado y un conjunto de preguntas de opción múltiple en una única pasada forward y lee directamente los logits de los tokens candidatos del vocabulario original para emitir una elección. El modelo está pensado para tareas de selección estructurada (decisiones con hasta 512 opciones por pregunta) sobre contextos de hasta 131.072 tokens.

La relevancia del modelo reside en su enfoque de inferencia: elimina por completo la generación de tokens y la caché KV, evaluando todas las preguntas de forma conjunta en un solo forward pass. Esto lo orienta a entornos de evaluación tipo benchmark de decisión (Decision Index, JevBench) y a pipelines donde se necesita elegir entre alternativas discretas con contexto muy largo, no a conversación ni a generación libre.

Con 2.213.241.664 parámetros y pesos en safetensors (repo de 4,4 GB), se distribuye bajo licencia Apache 2.0. La model card reporta una puntuación de 64,42 en Decision Index Public 0.3, aunque no se detallan resultados en benchmarks estándar de razonamiento o código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-2B; tag `qwen3_5`); modo de decisión sin generación de tokens |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens por petición conjunta (máximo aceptado) |
| Tipos de cuantización | No disponible (el autor especifica BF16 para inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B (revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`) y se ha ajustado para una tarea de decisión: dado un estado y una o varias preguntas con opciones, el modelo procesa la entrada conjuntamente en un único forward pass y extrae las probabilidades de los tokens candidatos mediante una softmax en FP32 con temperatura 1.0 sobre los logits del vocabulario original. No hay decodificación autoregresiva, no se generan tokens y la caché KV está desactivada.

La inferencia documentada requiere GPU CUDA compatibles con BF16 (por ejemplo, NVIDIA H800) y FlashAttention compatible, con dependencias software muy concretas: PyTorch 2.10.0+cu130, Transformers 5.3.0, Accelerate 1.15.0, FlashAttention 2.8.3, flash-linear-attention 0.4.1 y fla-core 0.4.1. El autor indica que el split público de JevBench se usó para evaluación y ajuste, no para entrenamiento. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Selección entre opciones múltiples: responde preguntas de elección leyendo logits de tokens candidatos, con hasta 512 opciones por pregunta.
- Procesamiento conjunto de estado y preguntas: todas las preguntas de una petición se evalúan en un solo forward pass.
- Contexto largo: admite hasta 131.072 tokens de entrada por petición conjunta.
- Sin generación de texto: no produce respuestas libres, resúmenes ni código; su salida es una decisión sobre opciones predefinidas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generativa; el modelo emite decisiones puntuales, no cadenas de acciones.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Capacidades especiales: modo de decisión determinista (0 tokens generados, KV cache desactivada, TF32 desactivado), orientado a evaluación reproducible.

## Casos de uso

- Evaluación de benchmarks de decisión: integración con el kit oficial Decision Index (edición 0.3) y con JevBench para medir la capacidad de selección del modelo sobre suites estandarizadas, usando el pipeline `decision_index` documentado.
- Clasificación de alternativas con contexto largo: seleccionar una opción entre cientos a partir de documentos extensos (hasta 131k tokens), por ejemplo elegir la cláusula o la respuesta correcta en un contrato o informe largo.
- Sistemas de enrutamiento o triaje: dado un estado del sistema y un conjunto de acciones candidatas, el modelo elige una acción discreta sin generar texto, lo que simplifica la integración en pipelines deterministas.
- Preguntas de opción múltiple en investigación: uso como sujeto de evaluación en estudios sobre razonamiento y selección, aprovechando la reproducibilidad del forward único y la ausencia de muestreo autoregresivo.
- Selección de respuestas en pipelines de anotación: elegir entre candidatos generados por otro modelo (reranking de opciones) cuando las alternativas están acotadas y se dispone de GPU con BF16.
- Evaluación comparativa de fine-tunes: servir como referencia de un ajuste de decisión sobre Qwen3.5-2B para contrastar con variantes generativas del mismo modelo base.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Decision Index Public 0.3 | 64,42 |
| JevBench (split público) | No disponible como cifra en la información proporcionada (usado para evaluación y ajuste) |
| MMLU, HumanEval, GSM8K y otros benchmarks estándar | No disponible |

No se han publicado en la información disponible resultados de benchmarks estándar de razonamiento, código o matemáticas, ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 2,21 mil millones de parámetros en BF16, los pesos ocupan aproximadamente 4,4 GB, a lo que hay que sumar activaciones y el procesamiento de contextos de hasta 131.072 tokens, que elevan considerablemente el consumo de memoria.
- GPU recomendadas: el autor documenta NVIDIA H800 con BF16 y FlashAttention compatible; se requiere una GPU CUDA compatible con BF16.
- Configuración de referencia: 8 × NVIDIA H800, 8 procesos independientes (un modelo por GPU), batch size 1, una petición simultánea por proceso.
- ¿Cabe en GPU de consumo? No disponible; el autor no documenta soporte para GPU de consumo y las dependencias (FlashAttention, flash-linear-attention, PyTorch 2.10.0+cu130) apuntan a entornos de datacenter.
- Opciones de despliegue: el autor proporciona scripts propios (`inference/serve_systemone.py` para JevBench y el pipeline `decision_index` con `direct_engine:DirectEngine`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y su naturaleza sin generación de tokens dificulta el uso con servidores de inferencia generativos estándar.
- Latencia y throughput: no disponibles; la configuración de referencia es batch 1, una petición por proceso y sin caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Starlord-2B-preview | 2,21 B | 131.072 tokens | Decisión por logits, sin generación | Apache 2.0 | Hugging Face (100 descargas, 0 likes) |
| Qwen/Qwen3.5-2B (base) | ~2 B (según modelo base) | No disponible en la información | Generación de texto | No disponible en la información | Hugging Face |
| Alternativas de decisión de 2B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la única cifra reportada es el Decision Index Public 0.3 de 64,42 para Starlord-2B-preview.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, código ni explicaciones; solo emite decisiones sobre opciones predefinidas.
- Sesgos conocidos: no disponibles; al derivar de Qwen3.5-2B, puede heredar sesgos del modelo base, pero no se documentan.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la selección entre opciones puede ser incorrecta; el autor reporta un 64,42 en Decision Index Public 0.3, lo que implica un margen de error significativo.
- Limitaciones de contexto e idioma: máximo de 131.072 tokens por petición conjunta y 512 opciones por pregunta; no se documentan idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B y de las dependencias (FlashAttention, flash-linear-attention) antes de producción.
- Caveats para producción: requiere versiones de software muy específicas (PyTorch 2.10.0+cu130, Transformers 5.3.0, FlashAttention 2.8.3), GPU BF16 de datacenter y no soporta caché KV; el autor advierte que el split público de JevBench se usó para evaluación y ajuste, por lo que sus resultados en ese benchmark pueden estar sesgados.
- Repositorio con muy poca tracción (100 descargas, 0 likes) y autor no verificado; conviene auditar los pesos y el código de inferencia antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/xsdfasfgsa/Starlord-2B-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Revisión del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- Resultados de evaluación: https://huggingface.co/datasets/xsdfasfgsa/Starlord-preview-DI-results
- Scores: https://huggingface.co/datasets/xsdfasfgsa/Starlord-preview-DI-results/resolve/9d2eedf839e6290335234360c13ee6294cf0feda/runs/starlord-2B-preview/scores.json
- Código de inferencia: https://huggingface.co/xsdfasfgsa/Starlord-2B-preview/blob/7337053133fcd03d29019e5748e3014cd292c359/inference/direct_engine.py
- Kit oficial de evaluación (Decision Index): https://github.com/apolinario/decision-index/tree/25c6ec7b6b5f44a216c63c3a700de3a9c6d6699d
