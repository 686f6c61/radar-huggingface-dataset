# Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-GateUp

## Resumen

Este repositorio contiene una exportación cuantizada del modelo multimodal `google/gemma-4-31B-it-qat-q4_0-unquantized` de Google, adaptada específicamente para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante la pila de software TT-NN / tt-metal. La cuantización no sigue el esquema estándar de bits enteros, sino que emplea formatos de coma flotante por bloques propietarios del hardware: `ttnn.bfloat4_b` (BFP4, ~4,5 bits por peso) para las proyecciones gate y up del MLP, y `ttnn.bfloat8_b` (BFP8, ~8,5 bits por peso) para atención y la proyección down del MLP. El resultado es un peso medio de 7,04 bits por parámetro, con un empaquetado de 27,00 GB.

El modelo base es un transformer de 31B parámetros (32.682.375.020 reales según safetensors) con capacidades de imagen-a-texto, es decir, un modelo de lenguaje con torre de visión integrada. Xylolabs ha cuantizado únicamente la parte lingüística; la torre de visión (`vision_tower`, `embed_vision`) permanece intacta en bf16. La relevancia de esta ficha es doble: por un lado, muestra un caso práctico de cuantización post-entrenamiento orientada a un backend de hardware no convencional (NPU en lugar de GPU); por otro, ilustra las limitaciones de madurez de ese ecosistema, ya que el autor advierte explícitamente que no se ha validado la ejecución en dispositivo real para este perfil de precisión y que ni tt-transformers ni tt-forge se han ejecutado con este checkpoint.

La licencia declarada es Apache-2.0, pero conviene señalar que el modelo base de Google (Gemma) tiene sus propios términos de uso que pueden imponer restricciones adicionales; el autor de la exportación no los menciona.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión; 60 capas en el modelo de lenguaje |
| Parámetros totales | 32.682.375.020 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el perfil de memoria evaluado usa 4.096 posiciones) |
| Tipos de cuantización | BFP4 (`bfloat4_b`) con GPTQ en gate/up del MLP; BFP8 (`bfloat8_b`) con round-to-nearest en atención y down del MLP; bf16 en embedding, LM head, normas y visión |
| Idiomas soportados | No disponible (la calibración GPTQ usó WikiText-2 y Wikipedia en coreano, pero no se declara el conjunto de idiomas soportados) |
| Licencia | Apache-2.0 (sujeta a los términos del modelo base Gemma de Google) |
| Formato de pesos | safetensors (bf16 almacenado sobre la rejilla BFP4/BFP8), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 31B parámetros con 60 capas en el componente de lenguaje, más una torre de visión para entrada de imágenes. El checkpoint original de Google ya venía de un proceso de *quantization-aware training* (QAT) a q4_0, según indica su nombre, y esta exportación parte de esa versión "unquantized" (es decir, los pesos QAT desempaquetados a mayor precisión).

La innovación técnica de esta ficha no está en el entrenamiento sino en el post-procesado para hardware Tenstorrent. Las matrices lineales se cuantizan a formatos de coma flotante por bloques nativos de Tensix: `bfloat4_b` con GPTQ y búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; y `bfloat8_b` con redondeo al más cercano. Los tensores resultantes se almacenan como valores bf16 situados sobre la rejilla BFP, de modo que TT-NN los empaqueta sin alterar sus valores, lo que permite una verificación exacta (`torch.equal`) tras el empaquetado. El reparto es: atención q, k, o en 60 capas a BFP8; atención v en 50 capas a BFP8; MLP gate y up en 60 capas a BFP4; MLP down en 60 capas a BFP8. El autor indica que solo se cuantizó y evaluó el modelo de lenguaje.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), orientada a instrucciones ("it").
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), con torre de visión preservada en bf16.
- Razonamiento y respuesta a preguntas de conocimiento general (el conjunto de evaluación incluye 40 preguntas).
- Capacidades multilingües: no declaradas explícitamente; la calibración incluyó coreano, lo que sugiere cobertura al menos parcial.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el caso de uso principal es ejecutar un modelo de 31B en NPUs Wormhole o Blackhole con 27 GB de pesos, aprovechando los formatos BFP nativos para reducir el ancho de banda de memoria frente a bf16.
- Investigación en cuantización por bloques: sirve como referencia reproducible para estudiar el impacto de BFP4/BFP8 con GPTQ en un transformer grande, con scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban la integridad bit a bit.
- Evaluación de precisión de formatos de hardware: permite comparar la divergencia KL frente a BF16 y la tasa de acierto en un conjunto de 40 preguntas, útil para decidir qué capas toleran BFP4.
- Prototipado multimodal en entornos sin GPU: al conservar la torre de visión en bf16, puede emplearse para experimentar con entrada de imagen en hardware Tensix, aunque el autor no valida esta ruta.
- Benchmarking de la pila TT-NN: útil para medir la madurez de tt-metal y tt-forge con checkpoints de gran tamaño, dado que el autor reporta que estas herramientas no se han ejecutado con este checkpoint.
- Docencia y formación técnica: ejemplo didáctico de cuantización GPTQ con búsqueda de exponente por bloque y de empaquetado de pesos para un backend no CUDA.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación parcial. Los datos disponibles son:

| Modelo | Bits por peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 61,39 | 0 | 100 | 40 de 40 | - |
| Este modelo | 7,04 (medio) | 27,00 | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto | No disponible en el extracto |

La fila correspondiente a este modelo aparece truncada en la información proporcionada, por lo que no se pueden citar sus valores de KL, Top-1 ni aciertos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 27,00 GB solo para los pesos del modelo de lenguaje, más espacio para caché KV y búferes.
- Perfil de contexto evaluado: asignación solo texto, batch 1, 4.096 posiciones en bf16, con estimación mínima de 31,75 GB (27,79 GB de pesos y tablas residentes, 3,69 GB de KV, 0,27 GB de workspace). Los búferes adicionales pueden aumentar el requisito.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- GPU consumer: no aplica como objetivo; el checkpoint está pensado para Tensix. La carga vía `transformers` con `device_map="auto"` en bf16 requeriría del orden de 61 GB de VRAM, fuera del alcance de GPUs consumer.
- Opciones de despliegue: TT-NN / tt-metal (probado con ttnn 0.81.1 sobre el simulador ttsim de Blackhole), y `transformers` para carga y generación. tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Validación en dispositivo: el autor advierte que este perfil de precisión no tiene ejecución validada en dispositivo y no hereda la cualificación de runtime del perfil BFP4-MLP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs, Tensix BFP4 GateUp) | 32,68B | No disponible | BFP4/BFP8 sobre safetensors, 27 GB | Apache-2.0 | Hugging Face, 44 descargas |
| google/gemma-4-31B-it-qat-q4_0-unquantized (base) | 31B (nominal) | No disponible | bf16, 61,39 GB | Términos Gemma | Hugging Face (modelo base) |
| Alternativas de 30B en formato GGUF/AWQ | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otras exportaciones del mismo modelo base ni con modelos de tamaño similar, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Ejecución en dispositivo no validada: el autor indica explícitamente que este perfil de precisión carece de ejecución validada en hardware Tensix y que no hereda la cualificación de runtime del perfil BFP4-MLP.
- Herramientas no probadas: tt-transformers y tt-forge no se han ejecutado con este checkpoint; solo se ha verificado el empaquetado con ttnn 0.81.1 sobre simulador.
- Solo se cuantizó y evaluó el modelo de lenguaje; el comportamiento de la torre de visión en este checkpoint no está caracterizado.
- La evaluación se limita a 40 preguntas y a métricas de divergencia KL; no hay benchmarks estándar (MMLU, HumanEval, GSM8G) que permitan estimar la degradación real en tareas下游.
- Idiomas soportados no declarados; la calibración con coreano no garantiza cobertura multilingüe amplia.
- Licencia: aunque el repositorio declara Apache-2.0, el modelo base Gemma de Google tiene términos de uso propios que pueden imponer restricciones adicionales al uso comercial; conviene revisarlos antes de producción.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero inherentes a un modelo de lenguaje de esta escala.
- Contexto: no se declara la longitud máxima de contexto del modelo base; el perfil de memoria evaluado es de 4.096 posiciones, insuficiente para muchas cargas de trabajo con documentos largos.
- Madurez del ecosistema: la pila TT-NN para checkpoints de este tamaño está en desarrollo activo, lo que implica riesgo de incompatibilidades y falta de soporte comunitario (0 likes, 44 descargas).

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): no disponible como enlace directo en la información proporcionada
- Demos: no disponible
