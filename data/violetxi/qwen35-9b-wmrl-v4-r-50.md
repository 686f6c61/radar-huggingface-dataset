# violetxi/qwen35-9b-wmrl-v4-R-50

## Resumen

`violetxi/qwen35-9b-wmrl-v4-R-50` es un checkpoint de ajuste fino completo (*full fine-tune*) del modelo `Qwen/Qwen3.5-9B`, publicado por el usuario violetxi como parte de un estudio de investigación denominado *world-internalization* (internalización de mundo) en su cuarta iteración (v4). La condición concreta de este checkpoint es `R-50`, correspondiente al guardado final de esa rama experimental. El modelo resuelve un problema de investigación: determinar en qué medida un modelo de 9B puede internalizar, mediante ajuste supervisado, el conocimiento de un dominio sintético cerrado, en este caso un corpus jurídico ficticio de un despacho de abogados denominado Calderwood & Harkness.

El checkpoint cuenta con 9.653.104.368 parámetros (aproximadamente 9,65 mil millones) y se distribuye en formato `safetensors` bajo licencia Apache 2.0. El repositorio ocupa 38,6 GB, un tamaño coherente con una única copia de los pesos en precisión fp32 (9.653.104.368 × 4 bytes ≈ 38,6 GB). Los pesos se han trasplantado (*graft*) al formato compuesto del hub, `Qwen3_5ForConditionalGeneration`, con 427 tensores reemplazados respecto a la instantánea de referencia del modelo base.

Su relevancia es estrictamente experimental: se trata de un artefacto de investigación con 0 descargas y 0 *likes* en el momento de la consulta, sin *pipeline* declarado, sin *benchmarks* publicados y sin model card detallada sobre idiomas, contexto o datos de entrenamiento. El autor declara que es servible con vLLM directamente, lo que lo hace utilizable para reproducir el experimento, pero no existe evidencia pública de validación por parte de terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de `Qwen/Qwen3.5-9B`; layout compuesto `Qwen3_5ForConditionalGeneration`. Detalle de capas, tipo de atención y configuración interna: no disponible |
| Parámetros totales | 9.653.104.368 (≈9,65 mil millones) |
| Parámetros activos | No aplica; no se describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio contiene pesos sin cuantizar; el tamaño de 38,6 GB corresponde a una copia en fp32 |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | `Qwen/Qwen3.5-9B` |
| Tipo de ajuste | Full fine-tune, no adaptadores LoRA |
| Condición experimental | `R-50`, guardado `final`, linaje v4 |
| Tamaño del repositorio | 38,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3.5-9B`, un transformer denso de aproximadamente 9,65 mil millones de parámetros. Este checkpoint no introduce cambios arquitectónicos propios: es un ajuste fino completo de todos los pesos del modelo base y su publicación se ha realizado mediante un proceso de *graft* en el que se han sustituido 427 tensores del layout compuesto `Qwen3_5ForConditionalGeneration` por los tensores entrenados. La instantánea de referencia utilizada para el trasplante es la `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del modelo base.

El entrenamiento se realizó sobre el corpus sintético jurídico de Calderwood & Harkness, un despacho de abogados ficticio creado específicamente para el estudio. La línea v4 emplea un estudiante de 9B y un conjunto de semillas de entrenamiento en modo *think-on* de aproximadamente 50.000 ejemplos, lo que implica que el ajuste incluye trazas de razonamiento explícitas antes de la respuesta final. No hay información disponible sobre el número total de *tokens* de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación posteriores al ajuste supervisado. La model card remite a un fichero `train_summary.json` ubicado en el directorio de la ejecución de entrenamiento, que no se incluye en la información disponible.

## Capacidades

- Generación de texto: capacidad heredada de la arquitectura base `Qwen3_5ForConditionalGeneration`; no se documenta explícitamente en la model card.
- Razonamiento en modo *think-on*: la línea v4 se entrena sobre un pool de semillas *think-on* de ~50.000 ejemplos, lo que indica que el modelo fue ajustado para producir cadenas de razonamiento previas a la respuesta. El alcance y la calidad de esta capacidad no están documentados.
- Internalización de dominio sintético: el objetivo declarado del entrenamiento es que el modelo memorice e internalice los hechos, entidades y relaciones del corpus ficticio Calderwood & Harkness.
- Servicio con vLLM: el autor declara compatibilidad directa («servable with vLLM out of the box») gracias al layout compuesto.
- *Tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Capacidades especiales (visión, audio, decodificación especulativa): no disponible.

## Casos de uso

- Reproducción del experimento de internalización de mundo: cargar el checkpoint con vLLM y evaluar mediante sondas de conocimiento si el modelo recupera hechos del corpus sintético Calderwood & Harkness, comparando con el modelo base sin ajustar para medir la ganancia real de memorización.
- Comparación entre condiciones del linaje v4: dado que la etiqueta `R-50` identifica una condición concreta, este checkpoint sirve como punto de comparación frente a otras condiciones de la misma familia experimental para determinar qué hiperparámetros o regímenes de datos favorecen la internalización.
- Investigación sobre olvido catastrófico: evaluar en un conjunto de tareas generales si el ajuste completo sobre un dominio sintético degrada capacidades previas del modelo base, aprovechando que ambos pesos están públicamente disponibles.
- Generación de datos sintéticos de razonamiento: usar el modelo para producir trazas *think-on* adicionales sobre el dominio jurídico ficticio, que después pueden emplearse para destilación o para ampliar el pool de semillas de futuras iteraciones.
- Validación del proceso de *graft*: comprobar si la sustitución de 427 tensores en el layout compuesto introduce regresiones funcionales, comparando las salidas del checkpoint trasplantado con las del checkpoint original de entrenamiento. Es un caso de uso de ingeniería de modelos, no de producto.
- Estudio de linaje y trazabilidad de checkpoints: analizar cómo se comporta un modelo intermedio de una investigación académica cuando se publica en el hub sin model card completa, útil para quienes investigan reproducibilidad y gobernanza de artefactos de IA.
- Prototipado de asistentes de dominio jurídico sintético: en entornos de laboratorio y siempre con datos ficticios, para estudiar cómo un modelo denso de 9B maneja terminología y procedimientos legales simulados. No es apto para asesoramiento jurídico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para los pesos: fp32 ≈ 38,6 GB; bf16/fp16 ≈ 19,3 GB; int8 ≈ 9,7 GB; 4 bits (NF4/GPTQ/AWQ) ≈ 5,3-6 GB. Estas cifras son estimaciones aritméticas derivadas del recuento de parámetros (9.653.104.368) y no han sido verificadas con el modelo.
- VRAM total necesaria: a las cifras anteriores hay que sumar la caché KV y las activaciones, cuyo tamaño depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: A100 80 GB o H100 80 GB para fp32 sin cuantizar; A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB para bf16; GPU de 24 GB (RTX 3090, RTX 4090) para bf16 con memoria muy justa o para int8.
- GPU de consumo: sí cabe en tarjetas de consumo con cuantización. 4 bits permite ejecución en GPUs de 8-12 GB; bf16 requiere al menos 24 GB y deja poco margen para caché KV.
- Opciones de despliegue: vLLM es la única opción validada explícitamente por el autor. Compatibilidad con llama.cpp, Ollama, TGI o SGLang: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| `violetxi/qwen35-9b-wmrl-v4-R-50` | 9,65 mil millones | No disponible | Apache 2.0 | Dominio jurídico sintético (Calderwood & Harkness), condición R-50 | Hub de HuggingFace; 0 descargas |
| `Qwen/Qwen3.5-9B` (modelo base) | No disponible | No disponible | No disponible | Propósito general | Hub de HuggingFace |
| Modelos densos de 8-9B de propósito general (categoría: Llama 3.1 8B, Gemma 2 9B, Qwen2.5 7B) | 7-9 mil millones | 8k-128k según modelo | Licencias comunitarias o Apache 2.0 según modelo | Propósito general, instrucciones, código | Ampliamente desplegados y evaluados |

Nota: no existen datos de rendimiento comparables para este checkpoint, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Los datos de la fila de categoría corresponden a valores públicos de sus respectivas model cards y deben verificarse en la fuente oficial antes de tomar decisiones.

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas, 0 *likes* y ningún *pipeline* declarado en el momento de la consulta.
- Model card mínima: no especifica idiomas, longitud de contexto, composición del dataset, número de *tokens* de entrenamiento ni recetas de alineación. La información sobre datos de entrenamiento queda delegada a un fichero `train_summary.json` que no se proporciona.
- Riesgo elevado de confusión entre ficción y realidad: el modelo se ha ajustado sobre un corpus de un despacho de abogados ficticio. Al formular preguntas sobre derecho real, existe un riesgo alto de que genere respuestas plausibles pero falsas, mezclando entidades y procedimientos inventados con normativa real.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluación de sesgos, y el dominio sintético introduce un sesgo evidente hacia el vocabulario y los supuestos del corpus de entrenamiento.
- Riesgo de alucinación: no cuantificado. La combinación de un corpus sintético con la ausencia de *benchmarks* públicos impide estimar la tasa de alucinación.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial. Sin embargo, no se documentan las condiciones de uso del corpus sintético ni posibles restricciones derivadas del estudio de investigación del que procede el checkpoint.
- Caveats de producción: el *graft* de 427 tensores en el layout compuesto puede provocar regresiones funcionales o incompatibilidades con frameworks distintos de vLLM. El repositorio en fp32 ocupa 38,6 GB, lo que encarece la descarga, el almacenamiento y la conversión previa al despliegue.
- Trazabilidad limitada: las etiquetas `v4` y `R-50` no están documentadas públicamente, lo que dificulta entender qué distingue esta condición de las demás del mismo linaje.
- Uso desaconsejado: no debe emplearse como asesor jurídico, asistente legal ni fuente de información normativa bajo ninguna circunstancia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-R-50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor: https://huggingface.co/violetxi
- Papers, blogs, repositorios o demos asociados: no disponible. La búsqueda web realizada no ha devuelto ningún resultado relacionado con el modelo ni con el estudio de internalización de mundo; los resultados obtenidos corresponden a un medio de prensa italiano sin relación con el proyecto.
