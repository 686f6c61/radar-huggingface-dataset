# taurusduan/Qwen3.8-27B-Heretic-Ara-16GB-VRAM-IQ4-XS-MTP-GGUF

## Resumen

El modelo `taurusduan/Qwen3.8-27B-Heretic-Ara-16GB-VRAM-IQ4-XS-MTP-GGUF` es una cuantización GGUF del modelo `Qwen/Qwen3.8-27B Heretic-Ara BF16`, desarrollada por el autor `taurusduan`. Se trata de una versión de 26.895.998.464 parámetros (aproximadamente 26.9B) optimizada para ejecutarse en GPUs con 16 GB de VRAM mediante la técnica de cuantización IQ4_XS (4-bit). El repositorio incluye soporte para Multi-Token Prediction (MTP), lo que permite acelerar la generación a costa de reducir la longitud de contexto disponible.

La relevancia de este modelo radica en que permite ejecutar un LLM de 27B parámetros en hardware de consumo, con una ventana de contexto de hasta 110.000 tokens sin MTP y de aproximadamente 80.000 tokens con MTP activado, siempre que la GPU no se utilice como adaptador de pantalla. El modelo se describe como "sin censura" gracias a la técnica Heretic Arbitrary-Rank Ablation, que elimina selectivamente ciertos rangos de la matriz de pesos para reducir las restricciones de contenido. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta ~110k sin MTP; ~80k con MTP (en GPU de 16GB sin uso como display) |
| Tipos de cuantizacion | IQ4_XS (4-bit); se menciona Q3_K_M como comparacion |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de `Qwen3.8-27B`, un transformer denso de 26.895.998.464 parámetros. Al no ser un modelo de mezcla de expertos (MoE), no existen parámetros activos separados. La técnica denominada Heretic Arbitrary-Rank Ablation se aplica sobre el modelo base para obtener una versión sin censura, mediante la eliminación selectiva de rangos en las matrices de pesos. Posteriormente, el modelo se cuantiza a IQ4_XS (4-bit) utilizando una matriz de importancia (imatrix), y se ofrece con soporte MTP.

No se dispone de información detallada sobre los datos de entrenamiento, el número de tokens utilizados ni procesos de alineación como RLHF o DPO. La única referencia al entrenamiento en la model card es una actualización del 8/22 que corrige problemas relacionados con el modo de pensamiento, sin cambios en el rendimiento.

## Capacidades

- Generación de texto en lenguaje natural con capacidad de razonamiento, incluyendo un modo de pensamiento (thinking) que fue corregido en la actualización del 8/22.
- Ventana de contexto amplia: hasta 110.000 tokens sin MTP y alrededor de 80.000 tokens con MTP activado en una GPU de 16 GB.
- Soporte para Multi-Token Prediction (MTP), que permite generar varios tokens por paso y acelerar la inferencia.
- Comportamiento sin censura: la técnica de ablación de rangos elimina las restricciones de contenido del modelo base, lo que puede ser útil en entornos de investigación donde se necesita explorar temas sensibles.
- Compatible con motores de inferencia que soporten formato GGUF, como llama.cpp u Ollama, y con el atributo `endpoints_compatible`.
- No se especifica soporte para tool calling, visión o audio en la información disponible.

## Casos de uso

- Despliegue local en GPU de consumo: gracias a la cuantización IQ4_XS, el modelo cabe en una GPU de 16 GB como la RTX 4090, permitiendo ejecutar inferencia de un modelo de 27B parámetros sin depender de servicios en la nube.
- Análisis de documentos extensos: con una ventana de contexto de hasta 110.000 tokens, puede procesar manuales técnicos, informes largos o libros completos en una sola pasada, lo que resulta adecuado para aplicaciones de resumen y extracción de información.
- Investigación en técnicas de cuantización: la comparación detallada de perplejidad (PPL) y divergencia KL entre el modelo cuantizado y el base BF16 permite estudiar el impacto de IQ4_XS frente a alternativas como Q3_K_M.
- Asistentes conversacionales en entornos controlados: la naturaleza sin censura del modelo permite su uso en investigaciones sobre seguridad, análisis de contenido o generación de respuestas en dominios donde los filtros estándar podrían interferir.
- Generación de contenido con contexto largo: escritura de artículos, documentación técnica o resúmenes de conversaciones extensas, aprovechando la capacidad de mantener coherencia a lo largo de muchos tokens.
- Integración en pipelines de inferencia con llama.cpp u Ollama: al ser un archivo GGUF, puede desplegarse en aplicaciones locales o servidores ligeros, con soporte de endpoints compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible. El autor proporciona una evaluación de la calidad de la cuantización comparando el modelo IQ4_XS con el modelo base BF16 y con la variante Q3_K_M. Los resultados se presentan en la siguiente tabla, extraída de la model card del autor.

| Evaluacion | Heretic-Ara BF16 (base) | IQ4_XS-3.0 | IQ4_XS-2.0 | Heretic-Ara-Q3_K_M |
|---|---|---|---|---|
| Tamano de archivo | 50.1 GiB | 13 GiB (con MTP 13.3 GiB) | 12.7 GiB | 12.4 GiB |
| Precision de cuantizacion | BF16 | IQ4_XS (4-bit) | IQ4_XS (4-bit) | Q3_K_M (~3-bit) |
| Perplejidad media (Mean PPL) | 7.008212 ± 0.045362 | 7.046980 ± 0.045498 | 7.102940 ± 0.046017 | 7.403971 ± 0.048924 |
| Correlacion PPL con base | 100% | 99.34% | 99.26% | 98.31% |
| Divergencia KL media | 0 | 0.027832 ± 0.000324 | 0.033398 ± 0.000308 | 0.076034 ± 0.000554 |
| Divergencia KL maxima | 0 | 18.317436 | 15.094215 | 17.866985 |
| Cuantil 99.9% KL | 0 | 1.162850 | 1.130034 | 2.448278 |
| Tasa de acuerdo Top-1 | 100% | 92.867% ± 0.067% | 91.619% ± 0.072% | 88.152% ± 0.084% |
| Cambio medio de probabilidad | 0% | -0.243% ± 0.012% | -0.306% ± 0.013% | -0.490% ± 0.020% |
| Cambio RMS de probabilidad | 0% | 4.538% ± 0.045% | 4.952% ± 0.041% | 7.560% ± 0.054% |

Los valores de la tabla corresponden a la evaluación del autor. La versión IQ4_XS-3.0 es la que se ofrece en este repositorio (con MTP).

## Requisitos de hardware

- VRAM estimada: 16 GB para el modelo IQ4_XS con contexto de ~110k sin MTP y ~80k con MTP, siempre que la GPU no se utilice como adaptador de pantalla.
- GPU recomendada: RTX 4090, A100 o cualquier tarjeta con 16 GB o más de memoria.
- Compatibilidad con GPUs de consumo: sí, siempre que tengan al menos 16 GB de VRAM y no se usen para mostrar el escritorio.
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con formato GGUF. El modelo está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El modelo se compara directamente con la variante Q3_K_M del mismo modelo base y con el modelo base en BF16. La siguiente tabla resume las principales diferencias.

| Modelo | Tamano | Precision | PPL media | Contexto maximo (16GB VRAM) |
|---|---|---|---|---|
| Qwen3.8-27B Heretic-Ara BF16 | 50.1 GiB | BF16 | 7.008 | No disponible |
| Qwen3.8-27B Heretic-Ara IQ4_XS-3.0 (este modelo) | 13.3 GiB (con MTP) | IQ4_XS (4-bit) | 7.047 | ~110k sin MTP / ~80k con MTP |
| Qwen3.8-27B Heretic-Ara Q3_K_M | 12.4 GiB | Q3_K_M (~3-bit) | 7.404 | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La naturaleza sin censura del modelo puede generar contenido inapropiado, peligroso o contrario a las políticas de seguridad. Debe utilizarse con precaución y únicamente en entornos controlados y con supervisión.
- La cuantización IQ4_XS introduce una degradación ligera del rendimiento con respecto al modelo base BF16: la perplejidad media aumenta de 7.008 a 7.047 y la tasa de acuerdo Top-1 cae al 92.87%.
- La longitud de contexto se reduce al activar MTP, pasando de aproximadamente 110.000 a 80.000 tokens.
- No se dispone de información sobre los idiomas soportados, por lo que no se puede garantizar un rendimiento multilingüe específico.
- La licencia Apache 2.0 permite el uso comercial, pero el usuario debe verificar también las condiciones del modelo base Qwen3.8-27B.
- Existe riesgo de alucinación, inherente a todos los modelos generativos, y la ausencia de benchmarks estándar impide evaluar su rendimiento en tareas de razonamiento, código o matemáticas.
- El modelo está optimizado para una GPU de 16 GB sin uso como adaptador de pantalla; si la GPU se comparte con el sistema operativo, el contexto máximo podría reducirse.

## Enlaces

- Repositorio del modelo: https://huggingface.co/taurusduan/Qwen3.8-27B-Heretic-Ara-16GB-VRAM-IQ4_XS-MTP-GGUF
- Repositorio espejo o variante: https://huggingface.co/Bucoid/Qwen3.8-27B-Heretic-Ara-16GB-VRAM-IQ4_XS-MTP-GGUF
