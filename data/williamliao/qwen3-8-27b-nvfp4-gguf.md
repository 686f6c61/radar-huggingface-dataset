# williamliao/Qwen3.8-27B-NVFP4-GGUF

## Resumen

El modelo `williamliao/Qwen3.8-27B-NVFP4-GGUF` es una cuantización experimental en formato GGUF del modelo Qwen3.8-27B, desarrollada por el usuario de Hugging Face `williamliao`. Se trata de una conversión orientada a `llama.cpp` que utiliza la precisión NVFP4 (FP4) para reducir el tamaño del modelo original de 27.320 millones de parámetros, manteniendo al mismo tiempo la compatibilidad con la decodificación especulativa nativa MTP (Multi-Token Prediction) de Qwen3.8. El objetivo es permitir la ejecución de un modelo de 27B en GPUs de consumo con 16 GB de VRAM, ofreciendo un rendimiento de inferencia competitivo sin necesidad de un modelo draft externo.

La relevancia de este lanzamiento radica en la combinación de dos tecnologías emergentes: la cuantización NVFP4, que ofrece una buena relación entre calidad y compresión, y la decodificación especulativa MTP integrada en el propio modelo, que acelera la generación de texto en tareas repetitivas o predecibles. El repositorio incluye dos variantes distintas de cuantización, cada una con su propio proceso de conversión y características de tamaño, lo que permite al usuario elegir según sus necesidades de calidad y velocidad.

El modelo está pensado para desarrolladores e investigadores que trabajan con `llama.cpp` y buscan ejecutar un LLM de 27B en hardware local con requisitos moderados de memoria. La licencia Apache-2.0 facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (híbrida: atención lineal, SSM, atención completa) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (en pruebas se configuró 81.920 tokens) |
| Tipos de cuantizacion | NVFP4 (FP4), Q8_0, Q6_K, Q4_K_M (según variante) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización del modelo base `Qwen/Qwen3.8-27B`. El modelo original de Qwen presenta una arquitectura híbrida que combina atención lineal, capas SSM (State Space Model) y atención completa, como se deduce de los tensores mencionados en la model card (Linear-attention QKV, SSM output projection, Full-attention Q/K/V, etc.). Esta mezcla busca equilibrar eficiencia computacional y capacidad de modelado de contexto largo.

La cuantización se realizó mediante dos rutas distintas:

1. **Quality-v2**: conversión directa del modelo BF16 a GGUF con tensores MTP nativos, seguida de una cuantización con `llama-quantize` aplicando overrides por tensor. Las matrices grandes de cómputo (FFN, proyecciones de atención) se cuantizan a NVFP4, mientras que embeddings, norm y algunos tensores de atención se mantienen en mayor precisión (Q6_K, F32, Q4_K_M). El resultado es un archivo de aproximadamente 16 GB.

2. **Unsloth-NVFP4-Q8**: conversión desde el checkpoint `unsloth/Qwen3.8-27B-NVFP4` mediante un script modificado de `convert_hf_to_gguf.py`. Los tensores NVFP4 se repaquetan al formato nativo GGUF, pero los tensores FP8 se dequantizan y se escriben como Q8_0, lo que aumenta el tamaño final. Esta variante no es una réplica exacta del checkpoint original.

No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO). La model card se centra exclusivamente en el proceso de cuantización y no aporta detalles del entrenamiento original.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente y contextualizado en tareas de chat, resumen, traducción, explicación de conceptos, etc., según las pruebas de velocidad realizadas por el autor.
- Decodificación especulativa MTP: incluye tensores MTP nativos que permiten la predicción de múltiples tokens a la vez, acelerando la generación en tareas predecibles como JSON, código repetitivo o patrones comunes.
- Compatibilidad con llama.cpp: funciona con el backend CUDA de llama.cpp, incluyendo `llama-server`, y soporta características como flash attention, plantillas Jinja y modos de razonamiento.
- Tool calling y agentes: no se menciona explícitamente en la model card, pero al estar basado en Qwen3.8, es probable que herede estas capacidades del modelo base. Sin embargo, no hay evidencia concreta en la información proporcionada.
- Multilingüismo: no se especifican los idiomas soportados, aunque Qwen suele ofrecer soporte multilingüe. No se puede confirmar sin datos adicionales.

## Casos de uso

- Inferencia local en GPU de consumo: con un tamaño de ~16 GB (variante Quality-v2), el modelo puede ejecutarse en GPUs como RTX 5070 Ti o RTX 5060 Ti con 16 GB de VRAM, permitiendo a desarrolladores y researchers ejecutar un LLM de 27B en su propio hardware sin depender de servicios en la nube.
- Servidor de chat local con llama-server: la configuración recomendada incluye `llama-server` con contexto de 81.920 tokens, flash attention y decodificación especulativa MTP, lo que lo hace adecuado para desplegar un asistente conversacional de alta capacidad en una máquina local o en un servidor con una GPU moderna.
- Generación de código asistida: las pruebas de velocidad muestran un buen rendimiento en tareas de código Python y C++ (36-37 tok/s sin MTP, hasta 81 tok/s con MTP), por lo que puede usarse como autocompletado de código o para generar fragmentos en entornos de desarrollo.
- Automatización de tareas repetitivas: la decodificación especulativa MTP acelera la generación de JSON, patrones repetidos y completado de código, lo que resulta útil en pipelines de generación de datos estructurados o plantillas.
- Traducción y resumen de documentos: el modelo maneja tareas de traducción y resumen con velocidades de ~37 tok/s, lo que permite procesar textos largos de forma local sin conexión a internet.
- Prototipado rápido de aplicaciones de IA: gracias a su licencia Apache-2.0 y su compatibilidad con llama.cpp, es adecuado para integrarse en prototipos y productos comerciales sin restricciones de uso.

## Benchmarks y rendimiento

La model card no incluye benchmarks de calidad (como MMLU, HumanEval o GSM8K). En su lugar, proporciona mediciones de velocidad de inferencia (tok/s) para la variante Quality-v2, obtenidas en un sistema con dos GPUs NVIDIA (RTX 5070 Ti y RTX 5060 Ti) usando `llama-server`. Estos datos son útiles para evaluar el rendimiento práctico, pero no permiten comparar la calidad del modelo con otros.

| Tarea | Velocidad sin MTP (tok/s) | Velocidad con MTP n_max=3 (tok/s) |
|---|---|---|
| code_python | 36,3 | 79,1 |
| code_cpp | 36,6 | 81,0 (dato parcial, se corta la tabla) |
| explain_concept | 36,3 | no disponible |
| summarize | 36,6 | no disponible |
| qa_factual | 36,0 | no disponible |
| translation | 37,1 | no disponible |
| creative_short | 36,9 | no disponible |
| stepwise_math | 36,2 | no disponible |
| json_output | 36,0 | no disponible |
| long_reasoning | 36,2 | no disponible |
| repeat_pattern | 36,4 | no disponible |
| code_completion | 36,2 | no disponible |
| long_code_review | 36,0 | no disponible |

Nota: la tabla de la model card se corta en la fila `code_cpp` con MTP, por lo que solo se dispone del valor completo para `code_python` y `code_cpp` en modo MTP. El resto de valores con MTP no se han publicado.

## Requisitos de hardware

- VRAM estimada: la variante Quality-v2 ocupa aproximadamente 16 GB (14,95 GiB) en disco, por lo que se necesita una GPU con al menos 16 GB de VRAM para cargar el modelo completo. La variante Unsloth-NVFP4-Q8 es más grande (no se especifica el tamaño exacto, pero se indica que requiere un reparto de GPU más equilibrado).
- GPUs probadas: NVIDIA GeForce RTX 5070 Ti 16 GB y RTX 5060 Ti 16 GB, con backend CUDA de llama.cpp. También es posible usar configuraciones multi-GPU con `--split-mode layer` y `--tensor-split`.
- Opciones de despliegue: llama.cpp (incluyendo `llama-server`), compatible con vLLM, Ollama y TGI solo si estas herramientas soportan el formato GGUF y la arquitectura Qwen3.8, lo cual no está confirmado.
- Latencia y throughput: en las pruebas, la velocidad base es de ~36-37 tok/s sin MTP y hasta ~81 tok/s con MTP en tareas predecibles, con un tiempo total de 53,18 s para una batería de 13 tareas mixtas.

## Comparativa con modelos similares

No se dispone de información comparativa en la model card ni en la búsqueda web realizada. El modelo se posiciona como una alternativa cuantizada al Qwen3.8-27B original (BF16, ~52 GB), ofreciendo una reducción de tamaño de aproximadamente 3,4x. Sin embargo, no hay datos de calidad que permitan compararlo directamente con otros modelos cuantizados de la misma familia (por ejemplo, versiones Q4_K_M o Q5_K_M del mismo modelo base). Se recomienda consultar benchmarks independientes antes de elegir esta cuantización frente a otras.

## Limitaciones y advertencias

- La variante Unsloth-NVFP4-Q8 no es una conversión bit-idéntica ni numéricamente idéntica al checkpoint original de Unsloth. Los tensores FP8 se convierten a Q8_0, lo que puede introducir diferencias de comportamiento respecto al modelo original.
- Se requiere una versión reciente de llama.cpp con soporte para la arquitectura Qwen3.8 (expuesta como `qwen35`), NVFP4 nativo y decodificación MTP. Sin esta versión, el modelo no funcionará correctamente.
- El modelo está pensado principalmente para GPUs NVIDIA con soporte CUDA. No se han probado otros backends (CPU, Metal, Vulkan) y el rendimiento puede variar significativamente.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.), por lo que no se puede evaluar el impacto de la cuantización NVFP4 en la precisión del modelo. Es posible que exista una degradación perceptible en tareas complejas.
- La longitud de contexto máxima del modelo base no está documentada en este repositorio. En las pruebas se utilizó un contexto de 81.920 tokens, pero no se garantiza que el modelo soporte ese tamaño de forma óptima.
- Al ser una cuantización experimental, el autor advierte que las dos variantes son experimentos separados y no deben considerarse equivalentes. Se recomienda validar el comportamiento en el caso de uso concreto antes de desplegarlo en producción.

## Enlaces

- [HuggingFace del modelo cuantizado](https://huggingface.co/williamliao/Qwen3.8-27B-NVFP4-GGUF)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Checkpoint de Unsloth utilizado para la variante 2](https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4) (enlace inferido, no confirmado en la model card)
