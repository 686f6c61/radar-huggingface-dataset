# xv0y5ncu/Gemma-4-E4B-it-GLQ-7bpw

## Resumen

Gemma-4-E4B-it-GLQ-7bpw es una cuantización de 7 bits por peso (7.0 bpw uniforme) del modelo instructivo google/gemma-4-E4B-it, publicada por el usuario xv0y5ncu. Emplea la técnica Golay-Leech Quantization (GLQ), que combina un codebook de retícula E8 de 65536 entradas sobre bloques de 8 dimensiones, rotación mediante Randomized Hadamard Transform (RHT) y retroalimentación LDLQ durante la codificación. El resultado es un checkpoint de 4.281 millones de parámetros totales que ocupa 7,98 GB en disco, un 1,87 veces menos que el original en bf16. La relevancia de esta ficha radica en que ofrece una vía de compresión intermedia entre las cuantizaciones de 4-5 bits (más agresivas, con pérdida más notoria) y el peso completo en bf16, manteniendo una fidelidad prácticamente idéntica según los datos del autor. El modelo base pertenece a la familia Gemma 4 de Google y está orientado a generación de texto conversacional, con soporte de modo de razonamiento (thinking) activable mediante la plantilla de chat.

La cuantización GLQ es una técnica de compresión post-entrenamiento que no modifica la licencia del modelo original: el autor declara Apache 2.0 en la model card y remite a los términos de Gemma 4 en el enlace oficial. El checkpoint se distribuye en formato safetensors y requiere el paquete `glq` con su integración para Hugging Face Transformers, además de una versión de transformers comprendida entre 5.13.1 y 5.14.x (la 5.15.0 rompe la carga de gemma-4 por un cambio en la configuración por capas).

La ficha está pensada para desarrolladores que ya trabajan con el ecosistema Gemma 4 y buscan reducir el espacio en disco y la huella de memoria sin renunciar a la calidad del bf16 en tareas de razonamiento matemático. No es un modelo nuevo desde el punto de vista de capacidades: hereda las del base, pero añade una capa de complejidad operativa (kernel CUDA personalizado, dependencia del paquete glq) que conviene evaluar antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), con cuantización GLQ post-entrenamiento |
| Parametros totales | 4.281.666.122 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GLQ a 7.0 bpw uniforme (codebook E8 de 65536 entradas, bloques 8-D, RHT, LDLQ, cuantización residual en capas de ≥3 bpw y asignación mixta por sensibilidad Hessiana) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 según model card; el modelo base remite a los términos de Gemma 4 (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (7,98 GB) |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-E4B-it es un transformer decoder-only de la familia Gemma 4, del que no se detallan en la información disponible ni el número de tokens de entrenamiento ni la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card de esta cuantización no reproduce esos datos del base, por lo que se indican como no disponibles.

La aportación técnica de esta ficha es el esquema de cuantización GLQ, que opera sobre los pesos bf16 originales sin reentrenamiento. Consta de un codebook de retícula E8 con 65.536 entradas que codifica bloques de 8 dimensiones, una rotación de entrada y salida mediante Randomized Hadamard Transform para equilibrar la distribución de los pesos, y una retroalimentación LDLQ basada en descomposición LDL por bloques que compensa el error de cuantización capa a capa. En capas con presupuesto de 3 bits por peso o superior se aplica cuantización residual en varias etapas, y cuando procede se asigna precisión mixta guiada por un proxy de sensibilidad derivado de la traza de la matriz Hessiana. El resultado es un promedio de 7,0 bpw uniforme, con un kernel CUDA personalizado que se compila en el primer uso (aproximadamente 30 segundos) y que exige torch>=2.0, transformers>=5.0 y CUDA 12.x.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, heredada del modelo instructivo base Gemma-4-E4B-it.
- Modo de razonamiento (thinking) activable mediante `enable_thinking=True` en `apply_chat_template`, orientado a problemas matemáticos y de varios pasos.
- Razonamiento aritmético y resolución de problemas tipo GSM8K, con un 90% de strict-match en el límite de 50 ejemplos según el autor (frente al 86% del bf16).
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.
- No se documenta en la información disponible un modo de decodificación especulativa ni atención lineal.

## Casos de uso

- Razonamiento matemático en producción con presupuesto de cómputo limitado: al ocupar 7,98 GB y mantener la calidad del bf16 en GSM8K, puede desplegarse en una GPU con menos memoria que la necesaria para el checkpoint original, configurando `max_new_tokens=2048` y `enable_thinking=True` para problemas de varios pasos.
- Sustitución directa del bf16 en pipelines existentes de Gemma-4-E4B-it: el checkpoint es un reemplazo de pesos que se carga con `AutoModelForCausalLM.from_pretrained` y el paquete `glq`, por lo que un servicio de generación de texto ya montado sobre Transformers puede migrar cambiando el identificador del modelo y la versión de transformers.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia de 7 bpw frente a variantes de 4, 5 y 6 bpw del mismo base para medir la degradación de calidad y el presupuesto de tokens de pensamiento necesario en cada nivel.
- Prototipado de asistentes conversacionales en inglés: el modelo hereda el comportamiento instructivo del base y admite conversaciones multi-turno con plantilla de chat, aunque la longitud de contexto efectiva no está documentada.
- Investigación sobre cuantización con retículas E8: el repositorio GLQ permite reproducir el esquema, y este checkpoint sirve como artefacto de validación de la técnica sobre un modelo de 4.281 millones de parámetros.
- Despliegue con vLLM en entornos con restricciones de almacenamiento: el autor documenta la integración `glq[vllm]` y fija `transformers>=5.13.1,<5.15`, lo que permite servir el modelo con el motor de inferencia de vLLM siempre que se respete ese pin.

## Benchmarks y rendimiento

| Benchmark | Gemma-4-E4B-it-GLQ-7bpw | bf16 (base) |
|---|---|---|
| GSM8K, limit=50, chat+thinking, strict-match | 90% | 86% |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ocupa 7,98 GB en disco con 7,0 bpw, por lo que en bf16 los pesos rondan los 8 GB y el consumo real depende del contexto y de la caché KV.
- GPU recomendadas: no se especifican en la información disponible. El autor valida el funcionamiento con CUDA 12.x y vLLM 0.27.1 sobre transformers 5.14.1.
- GPU de consumo: no se confirma compatibilidad con tarjetas consumer en la información disponible; por tamaño de pesos, una GPU con 12-16 GB podría albergarlos, pero no hay verificación publicada.
- Opciones de despliegue: Hugging Face Transformers con el paquete `glq` y su integración `glq.hf_integration`, y vLLM mediante `glq[vllm]`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato operativo es que el kernel CUDA se compila en el primer uso (~30 s) y que el modo thinking requiere `max_new_tokens=2048` en las variantes de 7 y 8 bpw.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | GSM8K (limit=50) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma-4-E4B-it-GLQ-7bpw | 4.281 M | GLQ 7,0 bpw | no disponible | 90% | Apache 2.0 / términos Gemma 4 | Hugging Face, 70 descargas |
| google/gemma-4-E4B-it (bf16) | 4.281 M | bf16 | no disponible | 86% | términos Gemma 4 | Hugging Face (modelo base) |
| Variantes GLQ 4bpw / 5bpw mix / 6bpw | 4.281 M | GLQ 4-6 bpw | no disponible | no disponible | Apache 2.0 / términos Gemma 4 | Hugging Face (mismo autor) |
| Variante GLQ 8bpw | 4.281 M | GLQ 8,0 bpw | no disponible | no disponible | Apache 2.0 / términos Gemma 4 | Hugging Face (mismo autor) |

## Limitaciones y advertencias

- Solo se declara soporte de inglés; no hay datos sobre calidad en castellano ni en otros idiomas.
- No se documenta la longitud de contexto del modelo base ni de la cuantización, lo que impide planificar cargas de contexto largo.
- El modo thinking puede truncarse si el presupuesto de `max_new_tokens` es insuficiente: el autor recomienda 2048 para 7 y 8 bpw, y 8192-16384 para 4, 5 y 6 bpw. Una respuesta final ausente puede deberse a la configuración de generación y no a un fallo de calidad.
- Existe un riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- La licencia es ambigua en la práctica: la model card declara Apache 2.0, pero el campo `license` de Hugging Face figura como `gemma` y el enlace apunta a los términos de Gemma 4. Conviene verificar los términos aplicables antes de un uso comercial.
- Dependencia operativa del paquete `glq` y de un kernel CUDA JIT que requiere compilación en el primer uso; no funciona con llama.cpp ni Ollama.
- Incompatibilidad conocida con transformers 5.15.0: la migración a configuración por capas rompe `config.head_dim` y vLLM falla antes de cargar pesos. El autor fija `transformers>=5.13.1,<5.15` y verifica en 5.14.1 con vLLM 0.27.1. El fallo afecta también al gemma-4 bf16 original.
- El harness `lm-evaluation-harness` no expone `enable_thinking` a través de `apply_chat_template`; hay que aplicar un monkey-patch al tokenizador para reproducir las evaluaciones en modo thinking.
- El checkpoint tiene un volumen de descargas bajo (70) y cero likes en el momento de la consulta, lo que limita la validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/Gemma-4-E4B-it-GLQ-7bpw
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio GLQ: https://github.com/cnygaard/glq
- Términos de licencia Gemma 4: https://ai.google.dev/gemma/terms
- Documentación de licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
