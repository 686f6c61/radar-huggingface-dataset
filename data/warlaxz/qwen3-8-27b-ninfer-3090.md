# WarlaxZ/Qwen3.8-27B-NInfer-3090

## Resumen

Qwen3.8-27B-NInfer-3090 es un artefacto de pesos cuantizados del modelo multimodal Qwen3.8-27B, publicado por el usuario WarlaxZ y generado con el motor de inferencia NInfer, en su bifurcación específica para la GPU RTX 3090 (ashalliants/ninfer-3090). No se trata de un checkpoint en formato Transformers, Safetensors o GGUF, sino de un contenedor propietario `.ninfer` que solo puede cargarse con los ejecutables de esa bifurcación concreta. El modelo base, Qwen3.8-27B, es un modelo de la familia Qwen con arquitectura `Qwen3_5ForCausalLM` que combina atención y capas GDN (probablemente una variante de atención lineal o híbrida), e incluye componentes de visión, MTP (multi-token prediction), DFlash2 y una cabeza de propuesta de 131.072 filas para decodificación especulativa.

La relevancia de este artefacto reside en su enfoque de cuantización: en lugar de usar el redondeo clásico `absmax/qmax` por grupo de 64 pesos, emplea un codificador `grouped_search` que busca la escala FP16 óptima entre 50 candidatos minimizando el error cuadrático ponderado por importancia (imatrix), y permite escalas negativas para aprovechar todo el rango de códigos. El resultado es un archivo de 17,68 GiB que reduce la divergencia KL frente a una referencia Q8_0 en aproximadamente un 23 % respecto a la codificación upstream, con un tamaño un 7 % menor y una velocidad de decodificación hasta 2,1 veces superior a llama.cpp según las mediciones del autor.

El modelo está pensado para ejecutarse en una única RTX 3090 de 24 GB, lo que lo convierte en una opción interesante para desarrolladores que quieran desplegar un modelo multimodal de 27B en hardware de consumo. La licencia declarada es Apache 2.0, heredada del modelo base, aunque las condiciones reales de uso dependen tanto de la licencia de Qwen3.8-27B como de las restricciones del motor NInfer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (transformer con atención y capas GDN; componentes de visión, MTP, DFlash2 y cabeza de propuesta) |
| Parametros totales | 27B (según el nombre del modelo base; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos mixtos de 4 y 5 bits (Q4/Q5) con escalas FP16 por grupo de 64 pesos; embedding de 4 bits, cabeza de salida de 6 bits; atención Q4 para query/key/gate/up y Q5 para value/z/gate/down/output; proyecciones de salida de atención, GDN y MLP down en 4 bits en capas tempranas y 5 bits desde las capas 23, 24 y 30 respectivamente |
| Idiomas soportados | no disponible (el corpus de evaluación incluye wikipedia en/zh, arXiv, GitHub y chat, lo que sugiere soporte al menos de inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor propietario versión 3; no es Safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de transformer con capas de atención estándar y capas GDN, que probablemente corresponden a un mecanismo de atención lineal o híbrido orientado a reducir el coste computacional en contextos largos. El artefacto incluye además un módulo de visión para entrada image-text-to-text, un componente MTP (multi-token prediction) para decodificación especulativa, DFlash2 y una cabeza de propuesta de 131.072 filas, todos ellos heredados de la codificación upstream sin modificaciones. El contenedor almacena 1.190 objetos (1.184 tensores y 6 recursos) y se genera mediante un conversor que produce un informe de conversión (`qwen3_8_27b.ninfer.conversion.json`) y una imatrix (`qwen3_8_27b.imatrix.safetensors`) que permite reconstruir el artefacto.

La innovación principal de esta versión no está en el entrenamiento —del que no se proporcionan datos como número de tokens, composición del dataset o uso de RLHF/DPO— sino en la codificación de pesos. El codificador `grouped_search` sustituye el redondeo clásico por una búsqueda de 50 candidatos de escala por grupo, ponderada por la media cuadrática de activación de entrada por canal (imatrix). Además, permite escalas negativas para usar todo el rango de códigos (−8 para Q4, −16 para Q5) y asigna 5 bits a las proyecciones de salida de atención (desde capa 23), GDN (desde capa 24) y MLP down (desde capa 30) en lugar de a las capas 0–35 como hacía la primera revisión. Este cambio, según el autor, reduce la divergencia KL un 9 % con el mismo número de bytes.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte para diálogos de chat.
- Procesamiento multimodal image-text-to-text: el artefacto incluye el componente de visión del modelo base, por lo que acepta imágenes como entrada junto con texto.
- Razonamiento y generación de código, a juzgar por la inclusión de flujos de GitHub y código propio en el corpus de evaluación de perplejidad.
- Capacidades multilingües limitadas al menos a inglés y chino, según los corpus de evaluación (wikipedia en/zh).
- Decodificación especulativa mediante MTP, DFlash2 y cabeza de propuesta de 131.072 filas, que acelera la generación en el motor NInfer.
- Soporte de tool calling y agentes: no confirmado explícitamente en la información disponible, aunque el autor menciona mejoras en la decodificación de turnos de agente en la versión v0.15.1 del motor.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Despliegue de un modelo multimodal de 27B en una única RTX 3090: el artefacto está específicamente optimizado para 24 GB de VRAM, con un tamaño de 17,68 GiB que deja margen para el contexto y las activaciones, lo que permite ejecutar visión y texto en hardware de consumo.
- Asistente conversacional con imágenes: gracias al componente de visión y a la pipeline image-text-to-text, puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas, diagramas o fotografías, siempre que el contexto lo permita (longitud no especificada).
- Generación de código asistida en local: la evaluación incluye flujos de GitHub y código propio, y el modelo puede integrarse en entornos de desarrollo sin conexión a la nube, usando el motor NInfer con decodificación especulativa para reducir la latencia.
- Investigación en cuantización: el artefacto es un caso de estudio reproducible, ya que incluye la imatrix y el informe de conversión, lo que permite analizar el impacto de distintas estrategias de codificación (grouped_search frente a absmax) sobre la perplejidad y la divergencia KL.
- Evaluación comparativa de motores de inferencia: sirve para medir el rendimiento de NInfer-3090 frente a llama.cpp en la misma GPU, con métricas de velocidad de prefill y decode publicadas por el autor.
- Procesamiento de documentos con texto e imágenes en inglés y chino: el corpus de evaluación incluye wikipedia en/zh, arXiv y chat, lo que sugiere un rendimiento razonable en tareas de comprensión de documentos mixtos en esos idiomas.
- Prototipado de agentes con decodificación especulativa: la inclusión de MTP y la cabeza de propuesta permite experimentar con generación acelerada en flujos de varios pasos, aunque la información sobre soporte de tool calling no está confirmada.

## Benchmarks y rendimiento

El autor publica métricas de perplejidad y divergencia KL, no benchmarks estándar como MMLU o HumanEval.

| Metrica | Upstream | Primera revision | Esta revision | Cambio vs upstream |
|---|---:|---:|---:|---:|
| Perplejidad `perplexity-1m` | 4,3428 | 4,3025 | 4,3014 | −0,95 % |
| Perplejidad `perplexity-heldout-2026-09` | 4,3396 | 4,3169 | 4,3224 | −0,40 % |
| KL div. media vs Q8_0 (held-out) | 0,0376 | 0,0318 | 0,0288 | −23,4 % |

| Pesos | KL div. media |
|---|---:|
| Codificación y layout upstream | 0,0376 |
| Primera revisión (embedding 4 bits) | 0,0318 |
| Esta revisión (embedding 4 bits, Q5 desde capas 23, 24 y 30) | 0,0288 |
| Unsloth UD-Q4_K_XL (formatos llama.cpp, 17,56 GB) | 0,0156 |

El autor también reporta que la velocidad de decodificación en una RTX 3090 es hasta 2,1 veces superior a llama.cpp con el mismo modelo, y que la versión v0.15.1 del motor mejora el prefill y la decodificación de turnos de agente, aunque no se proporcionan cifras absolutas de tokens por segundo en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 17,68 GiB; en una RTX 3090 de 24 GB quedan aproximadamente 6 GB para contexto, activaciones y caché KV (el autor usa `--kv-dtype int8` en las pruebas de perplejidad).
- GPU recomendadas: RTX 3090 (24 GB) es el objetivo declarado; no se confirma soporte para otras GPU, aunque el motor NInfer-3090 está orientado a CUDA.
- Cabe en GPU de consumo: sí, en RTX 3090; no se indica compatibilidad con GPU de 16 GB o menos.
- Opciones de despliegue: exclusivamente el motor NInfer-3090 (bifurcación ashalliants/ninfer-3090); no es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers, y las versiones upstream de NInfer lo rechazan al arrancar por falta de la ruta MLP down de 4 bits.
- Latencia y throughput: no se proporcionan cifras absolutas; el autor reporta mejoras relativas de hasta 2,1× en decodificación frente a llama.cpp y mejoras de prefill y decodificación de turnos de agente en la versión v0.15.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WarlaxZ/Qwen3.8-27B-NInfer-3090 | 27B | no disponible | `.ninfer` | Apache 2.0 | Hugging Face, requiere NInfer-3090 |
| neroued/Qwen3.8-27B-NInfer (upstream) | 27B | no disponible | `.ninfer` | Apache 2.0 | Hugging Face, NInfer upstream |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Safetensors (presumiblemente) | Apache 2.0 | Hugging Face |
| Unsloth UD-Q4_K_XL (formato llama.cpp) | 27B | no disponible | GGUF | Apache 2.0 | Hugging Face, llama.cpp |

La comparación se limita a variantes del mismo modelo base, ya que no se proporcionan datos de benchmarks estándar que permitan contrastarlo con otras familias. Frente al artefacto upstream, esta versión es un 7 % más pequeña (17,68 GiB frente a 20,44 GB), tiene una KL div. un 23 % menor y es más rápida según el autor. Frente a la cuantización UD-Q4_K_XL de Unsloth en formato llama.cpp, la KL div. es mayor (0,0288 frente a 0,0156), aunque el autor argumenta ventajas de velocidad y de integración con el motor NInfer.

## Limitaciones y advertencias

- El artefacto solo funciona con los ejecutables de la bifurcación ashalliants/ninfer-3090; las versiones upstream de NInfer y las compilaciones antiguas de la bifurcación lo rechazan al arrancar.
- No es un checkpoint de Transformers, Safetensors ni GGUF, por lo que no puede cargarse con las herramientas habituales del ecosistema (vLLM, llama.cpp, Ollama, TGI).
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial debe verificar también las condiciones de Qwen3.8-27B y del motor NInfer.
- La calidad medida en chino wikipedia empeora ligeramente en esta revisión (perplejidad de 9,14 a 9,27) y la KL div. de chat sube de 0,0355 a 0,0373, según el autor.
- La cuantización de 4/5 bits introduce pérdida de precisión frente a Q8_0; la KL div. es casi el doble que la de UD-Q4_K_XL de Unsloth (0,0288 frente a 0,0156).
- No se proporcionan datos sobre sesgos, riesgo de alucinación, longitud de contexto ni idiomas soportados más allá de los corpus de evaluación.
- El rendimiento se midió en Windows con CUDA 12.8; no se documenta comportamiento en Linux ni en otras GPU.
- El repositorio tiene solo 6 likes y 49.122 descargas, lo que sugiere una adopción limitada y poca validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/WarlaxZ/Qwen3.8-27B-NInfer-3090
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artefacto upstream: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Repositorio del motor: https://github.com/ashalliants/ninfer-3090
- Pull request de la revisión: https://github.com/ashalliants/ninfer-3090/pull/445
