# TokenTinkerer/Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF

## Resumen

Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF es un conjunto de cuantizaciones GGUF publicadas por TokenTinkerer a partir del modelo peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP, una variante "abliterated" (sin censura) orientada a generación de código. El modelo subyacente es un transformer de tipo Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales y 3B activos por token, derivado de la familia Qwen3.5-MoE según la etiqueta `qwen35moe`, e incluye una cabeza MTP (Multi-Token Prediction) que permite decodificación especulativa nativa.

El aporte principal de este repositorio no es el modelo en sí, sino la escalera de cuantización TTQ (TokenTinkerer Quant): diez niveles entre 3,34 y 6,64 bits por peso (bpw), construidos con imatrix y con una disposición de tipos por tensor idéntica a la de la escalera TTQ del Qwen3.6-35B-A3B del mismo autor. Según las mediciones del autor, a igual tamaño en GiB estos ficheros obtienen menor divergencia KL que los tiers Unsloth-Dynamic del modelo base en los siete tamaños comparables sobre corpus de código y en seis de siete sobre wikitext.

Es relevante ahora porque ofrece una vía práctica de ejecutar un MoE de 35B con decodificación especulativa en hardware de consumo mediante llama.cpp, con ficheros desde 13,82 GiB (IQ3_XXS) hasta 27,47 GiB (Q6_K). La licencia es MIT, pero el modelo es abliterated y el autor advierte explícitamente de que no rechaza peticiones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen35moe`) con cabeza MTP para decodificación especulativa |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3B (según nomenclatura A3B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS (3,34 bpw), IQ3_XS (3,51 bpw), Q3_K_S (3,67 bpw), Q3_K_M (3,92 bpw), IQ4_XS (4,17 bpw), IQ4_NL (4,49 bpw), Q4_K_M (4,87 bpw), Q5_K_S (5,54 bpw), Q5_K_M (6,00 bpw), Q6_K (6,64 bpw) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); repo de 205,0 GB con 190,9 GiB en ficheros GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo base. Por las etiquetas y el nombre se trata de un transformer con mezcla de expertos de la familia Qwen3.5-MoE, con 35,5B parámetros totales y aproximadamente 3B activos por token, al que se le ha injertado una cabeza MTP (Multi-Token Prediction) que habilita decodificación especulativa dentro de llama.cpp. El modelo base es una variante abliterated, es decir, con las direcciones de rechazo eliminadas mediante técnicas de abliteration, lo que produce un modelo que no declina peticiones.

El trabajo técnico de este repositorio es la cuantización. Cada uno de los diez niveles se genera con imatrix y mantiene exactamente los mismos tipos por tensor que la escalera TTQ del Qwen3.6-35B-A3B del autor sobre 733 tensores del cuerpo, mientras que la cabeza MTP se conserva a la precisión con la que la publica el upstream. La fuente de recuantización es el fichero UD-Q8_K_XL (~8,6 bpw) del modelo base, que también sirve como referencia para todas las métricas de divergencia KL; no existe una versión en precisión completa, de modo que las cifras de calidad son relativas a ese fichero de ~8,6 bpw y no a fp16/bf16.

## Capacidades

- Generación de texto y de código, con especialización declarada en tareas de programación (el corpus de evaluación incluye 70% código, 10% diffs, 10% terminal y 10% configuración).
- Razonamiento multi-paso orientado a flujos agénticos de desarrollo.
- Decodificación especulativa mediante la cabeza MTP integrada, soportada por llama.cpp.
- Conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas).
- Multilingüe limitado a inglés y chino.
- Sin censura: el modelo no rechaza peticiones (abliterated).
- No se declara soporte de visión, audio ni tool calling en la información disponible.

## Casos de uso

- Asistencia de código en local: con 3B parámetros activos y ficheros desde 13,82 GiB, puede ejecutarse en una GPU de consumo de 24 GB con el nivel IQ4_XS o Q4_K_M, sirviendo como autocompletado y generación de funciones en el editor sin enviar código a servicios externos.
- Refactorización y generación de diffs: el corpus de evaluación incluye un 10% de diffs, lo que indica que el modelo está ajustado para producir parches de código; se usaría en pipelines que reciben un fichero y devuelven un diff aplicable.
- Automatización de terminal y agentes de shell: el modelo se ha evaluado con un 10% de datos de terminal, por lo que encaja en agentes que generan comandos y los ejecutan en un entorno controlado, siempre dentro de un sandbox a nivel de sistema operativo.
- Servicio de generación de texto self-hosted: desplegado con llama.cpp o vLLM sobre una única GPU de 48 GB (A6000, L40S) con el nivel Q6_K, puede servir peticiones concurrentes con contexto moderado.
- Investigación sobre cuantización: la escalera de diez niveles con métricas de KLD publicadas por nivel permite estudiar la relación entre bits por peso y calidad en un MoE de 35B, comparando directamente con los tiers Unsloth-Dynamic medidos con el mismo protocolo.
- Experimentación con decodificación especulativa: la cabeza MTP permite medir aceleraciones de decodificación en llama.cpp sin necesidad de un modelo draft separado.
- Generación de configuración e infraestructura: el 10% de datos de config del corpus de evaluación sugiere utilidad para generar ficheros YAML, Dockerfiles y similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad de cuantización (divergencia KL y acuerdo top-1) frente al fichero fuente UD-Q8_K_XL, medidas sobre 40 fragmentos fijos de 512 tokens:

| Fichero | GiB | bpw | KLD código | top-1 código | KLD wikitext | top-1 wikitext |
|---|---:|---:|---|---:|---|---:|
| TTQ-3.34bpw-IQ3_XXS | 13,82 | 3,34 | 0,135265 ± 0,006145 | 89,33% | 0,121933 ± 0,002664 | 85,25% |
| TTQ-3.51bpw-IQ3_XS | 14,53 | 3,51 | 0,121448 ± 0,005077 | 90,22% | 0,112744 ± 0,002547 | 85,84% |
| TTQ-3.67bpw-Q3_K_S | 15,20 | 3,67 | 0,107063 ± 0,004688 | 90,56% | 0,091221 ± 0,002044 | 87,28% |
| TTQ-3.92bpw-Q3_K_M | 16,22 | 3,92 | 0,091761 ± 0,004791 | 91,51% | 0,073367 ± 0,001828 | 88,62% |
| TTQ-4.17bpw-IQ4_XS | 17,26 | 4,17 | 0,078644 ± 0,003888 | 91,86% | 0,069188 ± 0,001705 | 89,17% |
| TTQ-4.49bpw-IQ4_NL | 18,56 | 4,49 | 0,066057 ± 0,004271 | 92,82% | 0,045736 ± 0,001274 | 91,06% |
| TTQ-4.87bpw-Q4_K_M | 20,12 | 4,87 | 0,060243 ± 0,004486 | 93,53% | 0,038743 ± 0,001042 | 91,41% |
| TTQ-5.54bpw-Q5_K_S | 22,90 | 5,54 | 0,043374 ± 0,002857 | 94,37% | 0,031178 ± 0,000901 | 92,77% |
| TTQ-6.00bpw-Q5_K_M | 24,81 | 6,00 | 0,039146 ± 0,003595 | 95,10% | 0,023410 ± 0,000729 | 93,44% |
| TTQ-6.64bpw-Q6_K | 27,47 | 6,64 | 0,036423 ± 0,003411 | 95,17% | 0,020246 ± 0,000713 | 94,14% |

Según el autor, comparado a igual tamaño en GiB con los tiers Unsloth-Dynamic del modelo base, esta escalera obtiene menor KLD en los siete tamaños comparables sobre código (media −9,3%) y en seis de siete sobre wikitext (hasta −20% en prosa); tres niveles quedan por debajo del suelo de la escalera upstream y el nivel superior es 2,55 GiB más pequeño que el Q6_K_XL del autor original.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 13,82 GiB (IQ3_XXS) y 27,47 GiB (Q6_K) solo de pesos, más overhead de contexto KV y buffers de llama.cpp.
- GPU de consumo: los niveles IQ3_XXS a Q4_K_M (13,82–20,12 GiB) caben en GPUs de 24 GB como la RTX 4090 o la RTX 3090; el nivel Q5_K_S (22,90 GiB) es ajustado en 24 GB y requiere contexto reducido o offload parcial a CPU.
- GPU profesionales: Q5_K_M (24,81 GiB) y Q6_K (27,47 GiB) encajan en A6000, L40S, A100 40 GB o H100; el nivel Q6_K deja margen amplio en 40 GB para contexto largo.
- Despliegue: llama.cpp es la vía nativa (formato GGUF, soporte de MTP); Ollama puede consumir los GGUF directamente. No se documenta soporte de vLLM o TGI para estos ficheros.
- Latencia y throughput: no disponibles en la información proporcionada. La cabeza MTP está pensada para acelerar la decodificación, pero el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia |
|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-MTP-TTQ (este) | 35,5B totales / 3B activos | no disponible | 10 niveles GGUF, 3,34–6,64 bpw | MIT |
| peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP (base) | 35,5B totales / 3B activos | no disponible | tiers Unsloth-Dynamic (Q3_K_XL a Q6_K_XL) | MIT |
| TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ | 35B totales / 3B activos | no disponible | 10 niveles TTQ con la misma disposición por tensor | no disponible |

Frente al modelo base, este conjunto ofrece menor KLD a igual tamaño según las mediciones del autor y un nivel superior más compacto. Frente a la escalera TTQ del Qwen3.6 del mismo autor, comparte estructura de cuantización y protocolo de evaluación, lo que permite comparar directamente ambas familias. No se dispone de datos de benchmarks de tareas para establecer comparaciones de calidad absoluta con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo abliterated: no rechaza peticiones y, con acceso a herramientas, puede causar daño real; el autor recomienda aislarlo en un sandbox a nivel de sistema operativo.
- No existe una versión en precisión completa del modelo: todas las métricas de KLD son relativas al fichero UD-Q8_K_XL (~8,6 bpw), y una fracción desconocida de la divergencia se hereda de esa fuente.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; un modelo sin censura puede además generar contenido dañino o inexacto sin señal de rechazo.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado.
- Longitud de contexto no documentada en la información disponible.
- El corpus de evaluación está sesgado hacia código y wikitext; el rendimiento en otras tareas no está medido.
- Licencia MIT permite uso comercial, pero la responsabilidad legal y ética del uso de un modelo abliterated recae en el desplegador.
- El repositorio ocupa 205 GB; descargar la escalera completa requiere espacio considerable y conviene seleccionar un único nivel.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TokenTinkerer/Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF
- Modelo base: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Escalera TTQ de referencia (Qwen3.6-35B-A3B): https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
