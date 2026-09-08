# VertexResearch/Vertex-0.6-5M-Base

## Resumen

Vertex-0.6-5M-Base es un modelo de lenguaje causal de 4,77 millones de parámetros desarrollado por VertexResearch, la variante más pequeña de la familia Vertex 0.6. Utiliza una arquitectura Llama estándar con 9 capas, 192 unidades ocultas y una ventana de contexto de 512 tokens. Es un checkpoint de pretraining puro, sin ajuste por instrucciones ni alineación, entrenado desde cero sobre 500 millones de tokens de texto web en inglés procedente de los datasets Ultra-FineWeb y Ultra-FineWeb-L3.

El modelo está diseñado como herramienta de investigación para estudiar el escalado de modelos diminutos, efectos de tokenizadores y ratios entre embeddings y cuerpo del transformer. Su entrenamiento se completó en 54 minutos en una Apple M5 Pro con 24 GB de memoria unificada utilizando MLX, alcanzando un throughput de aproximadamente 150.000 tokens por segundo. Con solo 9,5 MB en bf16, es un modelo extremadamente ligero que puede ejecutarse en CPU o en cualquier GPU de consumo.

Su relevancia radica en que ofrece un caso de estudio reproducible y de bajo coste para investigar cómo se comportan modelos de muy pocos parámetros cuando se entrenan con una cantidad relativamente grande de tokens (105 tokens por parámetro). A nivel de frase produce inglés fluido y gramatical, pero carece de conocimiento factual y de coherencia a largo plazo, por lo que no es apto para aplicaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Llama) |
| Parametros totales | 4.771.392 (4,77M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | bf16 (nativo); no se especifican cuantizaciones oficiales. Es convertible a GGUF mediante llama.cpp |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); convertible a GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LlamaForCausalLM estándar: 9 capas, 192 unidades ocultas, 3 cabezas de atención con head_dim 64 y sin Grouped Query Attention, MLP SwiGLU con dimensión intermedia 512, normalización RMSNorm pre-norm y posiciones rotatorias RoPE con theta 10000. El vocabulario es un ByteLevel BPE de 4096 tokens con embeddings de entrada/salida atados; las embeddings representan el 16% de los parámetros (0,79M) para concentrar la capacidad en los bloques transformer (3,98M).

El entrenamiento se realizó desde cero sobre 500M de tokens de texto web en inglés: 450M de Ultra-FineWeb en la fase principal y 50M de Ultra-FineWeb-L3 (reescrituras sintéticas Multi-Style y QA) como fase corta de annealing. Cada token se vio una sola vez. Se usó MLX en una Apple M5 Pro de 24 GB de memoria unificada, con un throughput de ~150k tokens/s y una duración total de 54 minutos. El batch fue de 64 secuencias de 512 tokens (32k tokens por paso), con 15.258 pasos. El optimizador fue AdamW con lr máximo 3e-3 en decaimiento coseno hasta 3e-4, 300 pasos de warmup, weight decay 0.1 y clip de gradiente 1.0. No se aplicó RLHF, DPO ni ningún ajuste por instrucciones: es un checkpoint de pretraining puro.

## Capacidades

- Generación de texto en inglés fluido a nivel de frase, con gramática y puntuación correctas.
- Capacidad para imitar el registro del prompt (carta formal, nota de prensa, texto divulgativo) durante aproximadamente una frase.
- No dispone de razonamiento, escritura de código ni capacidades matemáticas.
- No soporta tool calling, function calling ni uso como agente, al ser un modelo base sin fine-tuning.
- No tiene capacidades multilingües: solo inglés.
- No tiene modo de pensamiento, visión ni audio.
- No mantiene coherencia más allá de 15-20 tokens y no es capaz de recordar hechos: fechas, nombres y números son inventados.

## Casos de uso

- Investigación en scaling laws: se puede usar en experimentos que comparen la pérdida de cross-entropy con modelos mayores de la misma familia (15M, 100M) para estudiar cómo escala la capacidad con el número de parámetros y tokens.
- Estudio de tokenizadores: al usar un vocabulario ByteLevel BPE de solo 4096 tokens, es útil para analizar cómo afecta el tamaño del vocabulario a la fluidez, la compresión y la calidad de las representaciones.
- Pruebas de humo en motores de inferencia: por su arquitectura Llama estándar y su pequeño tamaño (9,5 MB en bf16), sirve para verificar rápidamente que un pipeline de transformers, llama.cpp o MLX carga, genera y decodifica correctamente.
- Educación en modelos de lenguaje: es un ejemplo didáctico para enseñar cómo funciona un LM causal, cómo se estructuran los pesos de un transformer Llama y cómo se realiza el forward pass, al ser un modelo diminuto y de código abierto.
- Experimentos de ratio embeddings/cuerpo: dado que las embeddings son solo el 16% de los parámetros, permite investigar cómo influye ese reparto en la capacidad de generalización y en el sobreajuste.
- Comparación de frameworks de entrenamiento: se puede utilizar para comparar el rendimiento de MLX con PyTorch o JAX en hardware Apple Silicon, ya que el entrenamiento original se realizó con MLX en un Apple M5 Pro.
- Generación de texto breve para análisis de registro: se puede usar para generar una o dos frases en un registro concreto (formal, informativo) y estudiar cómo el modelo captura el estilo superficial sin conocimiento factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación reportada es la pérdida de cross-entropy sobre texto held-out con el vocabulario propio de 4096 tokens:

| Split | Loss (nats) | PPL | Bits/token |
|---|---|---|---|
| Ultra-FineWeb, shard no visto | 3.29 | 26.8 | 4.74 |
| Ultra-FineWeb, shard de entrenamiento | 3.31 | 27.4 | 4.77 |
| Ultra-FineWeb-L3 QA | 2.80 | 16.4 | 4.03 |
| Ultra-FineWeb-L3 Multi-Style | 2.96 | 19.3 | 4.27 |

La coincidencia entre la pérdida en entrenamiento y en validación sugiere que no hay memorización. Los valores más bajos en L3 se deben a que el texto sintético es más predecible, no a un mayor rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB para los pesos en bf16 (9,5 MB); con overhead de inferencia y KV cache para 512 tokens, menos de 1 GB.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna o la CPU son suficientes. El entrenamiento se realizó en una Apple M5 Pro con 24 GB unificados, pero para inferencia no se necesita tanto.
- Compatibilidad con GPUs de consumo: sí, cualquier RTX o incluso gráficas integradas lo ejecutan.
- Opciones de despliegue: transformers (PyTorch), MLX, llama.cpp tras conversión a GGUF, y puede cargarse en vLLM o TGI para pruebas, aunque no es necesario.
- Latencia y throughput: no disponible. Dado el tamaño, la inferencia es prácticamente instantánea en cualquier hardware moderno, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de especificaciones detalladas de modelos comparables. Los únicos modelos mencionados como familia son los hermanos de VertexResearch:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Vertex-0.6-5M-Base | 4.771.392 (4,77M) | 512 | Apache 2.0 | safetensors |
| Vertex-0.6-15M-Base | ~15M (según nombre) | no disponible | no disponible | no disponible |
| Vertex-0.6-100M-8192-ctx-Base | ~100M (según nombre) | 8192 (según nombre) | no disponible | no disponible |

No se han publicado comparativas de rendimiento entre estos modelos. El modelo de 5M es el más pequeño de la familia y el único con especificaciones completas en la información disponible.

## Limitaciones y advertencias

- No posee conocimiento factual: fechas, nombres, números y eventos son inventados.
- No mantiene coherencia más allá de 15-20 tokens, por lo que no es apto para tareas que requieran razonamiento multi-paso.
- No sigue instrucciones ni escribe código; es un modelo base sin ajuste por instrucciones.
- Solo soporta inglés y tiene una ventana de contexto de 512 tokens, muy limitada.
- No está alineado ni filtrado: puede generar contenido no deseado o sesgado, aunque al ser tan pequeño su capacidad para producir texto dañino es limitada.
- No es apto para producción ni para uso directo con usuarios finales; está diseñado exclusivamente para educación e investigación.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el modelo no es útil para aplicaciones comerciales reales.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/VertexResearch/Vertex-0.6-5M-Base
- Organización VertexResearch: https://huggingface.co/VertexResearch
- Modelos hermanos:
  - Vertex-0.6-15M-Base: https://huggingface.co/VertexResearch/Vertex-0.6-15M-Base
  - Vertex-0.6-100M-8192-ctx-Base: https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-ctx-Base
- Datasets de entrenamiento:
  - Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
  - Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
