# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_LoRA_rank_4

## Resumen

El repositorio `WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_LoRA_rank_4` no es un modelo completo, sino un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `meta-llama/Llama-3.1-8B`. El nombre del repositorio indica que el ajuste se ha realizado sobre la tarea XNLI (Cross-lingual Natural Language Inference) en inglés e hindi, con un subconjunto de 5000 ejemplos, un porcentaje de datos etiquetado como "1_40" y un rango de adaptación de 4. El autor del repositorio es el usuario WijewardhanaNT y el artefacto se publicó en septiembre de 2026 con la librería PEFT 0.17.1.

Se trata por tanto de un experimento de ajuste fino eficiente en parámetros orientado a inferencia de lenguaje natural (NLI) multilingüe, no de un modelo de propósito general. Su relevancia actual es limitada: acumula 0 descargas y 0 likes, la model card es la plantilla por defecto de Hugging Face sin ningún campo completado, y no se declara licencia, idiomas ni resultados de evaluación. Para un desarrollador o investigador, el interés principal es reproducir o auditar la técnica (LoRA de rango muy bajo sobre 5000 ejemplos, con recorte adicional del conjunto de datos) más que desplegar el adaptador en producción.

El valor técnico está, por tanto, en el modelo base subyacente (Llama 3.1 8B, transformer denso decoder-only con decodificación autorregresiva) y en la naturaleza del adaptador, que ocupa únicamente 0,3 GB en el repositorio y se combina con los pesos originales en tiempo de inferencia mediante PEFT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (modelo base: Llama 3.1 8B) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene aproximadamente 8 030 millones de parametros |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base Llama 3.1 8B soporta hasta 128 000 tokens |
| Tipos de cuantizacion | Adaptador en safetensors (precision no declarada). El modelo base admite cuantizaciones de terceros (GGUF, AWQ, GPTQ, bitsandbytes); no documentado en este repositorio |
| Idiomas soportados | Segun el identificador del repositorio, ingles e hindi; la model card no declara idiomas |
| Licencia | No disponible en el repositorio (el modelo base se distribuye bajo Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rank de LoRA | 4 (segun el identificador del repositorio) |
| Libreria | peft 0.17.1, transformers |
| Tamano del repositorio | 0,3 GB |
| Tarea declarada | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 4, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del transformer base y entrenadas dejando congelados los pesos originales de Llama 3.1 8B. Un rango de 4 es extremadamente reducido: implica un número muy pequeño de parámetros entrenables y una capacidad de adaptación muy limitada, adecuada para desplazar ligeramente las representaciones hacia una tarea concreta pero no para adquirir habilidades nuevas. El repositorio no incluye ninguna indicación sobre qué módulos (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `mlp`) se han adaptado, ni sobre el valor de `alpha`, el dropout o la tasa de aprendizaje empleada.

Respecto a los datos, el identificador apunta a la tarea XNLI con ejemplos en inglés e hindi y un tamaño de 5000 muestras, con un recorte adicional indicado por "percentage_1_40". No se especifica si ese porcentaje se aplica sobre el conjunto de entrenamiento, sobre una partición concreta o sobre la proporción de ejemplos en cada idioma, ni si hubo validación cruzada. La model card no documenta composición del dataset, número de tokens vistos, régimen de precisión (fp32, fp16, bf16), hiperparámetros de optimización, ni si se aplicó RLHF, DPO o cualquier otro ajuste posterior. La única referencia técnica del repositorio es el enlace `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono en aprendizaje automático, citado por la propia plantilla de Hugging Face y no por el autor.

## Capacidades

- Clasificación de pares premisa-hipótesis (inferencia de lenguaje natural) en inglés e hindi, si el ajuste ha funcionado segun lo previsto por el identificador del repositorio.
- Generación de texto en la modalidad declarada por el `pipeline_tag` (`text-generation`), heredada del modelo base.
- Capacidades residuales del modelo base Llama 3.1 8B: generación de texto, razonamiento básico, código y matemáticas elementales. No obstante, el ajuste con 5000 ejemplos y rango 4 puede degradar estas capacidades.
- Capacidades multilingües: limitadas a los idiomas del ajuste (inglés e hindi) y a los del modelo base; no declaradas explícitamente.
- Soporte de tool calling o function calling: no disponible; no se menciona en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible; no se menciona.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible; no se menciona.
- Evaluación cuantitativa de las capacidades anteriores: no disponible.

## Casos de uso

- Clasificación NLI en inglés e hindi: dado un par de frases, determinar si la hipótesis implica, contradice o es neutral respecto a la premisa. Es el uso directo para el que el adaptador parece haber sido entrenado, y su ventaja es el bajo coste de almacenamiento (0,3 GB) frente a un ajuste completo del modelo.
- Filtrado y curación de corpus multilingües: usar el clasificador para detectar contradicciones o inconsistencias entre pares de frases en inglés e hindi antes de incorporarlas a un conjunto de entrenamiento mayor.
- Detección de alucinaciones por contradicción: comprobar si una respuesta generada contradice el contexto de origen, empleando el adaptador como verificador ligero dentro de un pipeline RAG en inglés o hindi.
- Etiquetado automático de datos no anotados: aplicar el adaptador para preetiquetar grandes volúmenes de pares textuales y reducir el coste de anotación humana, con revisión posterior.
- Investigación sobre eficiencia de ajuste: reproducir el experimento para estudiar el efecto del rango de LoRA y del tamaño del subconjunto de datos en una tarea de clasificación multilingüe.
- Evaluación comparativa de adaptadores: emplear este repositorio como línea base de bajo rango frente a adaptadores de rango mayor sobre el mismo modelo base, midiendo la degradación o mejora en tareas generativas.
- Análisis de sesgo en NLI multilingüe: auditar si el adaptador reproduce sesgos de género, ocupación o nacionalidad presentes en XNLI, comparando su comportamiento entre inglés e hindi.
- Prototipado educativo: servir como ejemplo mínimo de extremo a extremo de un ajuste PEFT publicable, útil para docencia o para validar infraestructura de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación completada, no se declaran métricas de precisión para XNLI ni para ninguna otra tarea, y no se ofrecen comparaciones con adaptadores equivalentes.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,3 GB, pero la inferencia requiere cargar simultáneamente el modelo base Llama 3.1 8B.
- VRAM estimada para el modelo base en bf16/fp16: en torno a 16-18 GB solo para los pesos, más la caché KV, que crece de forma lineal con la longitud de contexto; con contextos largos (decenas de miles de tokens) el consumo puede superar los 24 GB.
- VRAM estimada con cuantización de 8 bits: aproximadamente 9-10 GB para los pesos.
- VRAM estimada con cuantización de 4 bits: aproximadamente 5-6 GB para los pesos, lo que permite ejecución en tarjetas de consumo.
- GPU recomendadas para bf16: NVIDIA A100 (40 o 80 GB), H100, L40S o RTX 4090 (24 GB) para contextos moderados.
- GPU de consumo compatibles: RTX 4090, RTX 4080, RTX 3090 (24 GB) en bf16 con contexto corto; RTX 4070, RTX 3080, RTX 3060 (12 GB) o superiores con cuantización de 4 bits.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) o transformers + PEFT para fusionar el adaptador; llama.cpp y Ollama son viables si se fusiona previamente el adaptador con los pesos base y se convierte a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador ni para su configuración de despliegue.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador, por lo que la comparación se limita a características estructurales y de disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en NLI |
|---|---|---|---|---|---|
| WijewardhanaNT/xnli_en_and_hi...LoRA_rank_4 | Adaptador LoRA rango 4 sobre 8B | No especificado (base: 128k) | No disponible | Hugging Face, 0 descargas | No disponible |
| meta-llama/Llama-3.1-8B (base) | 8 030 M | 128 000 tokens | Llama 3.1 Community License | Ampliamente disponible | No disponible (modelo base, no ajustado para NLI) |
| meta-llama/Llama-3.1-8B-Instruct | 8 030 M | 128 000 tokens | Llama 3.1 Community License | Ampliamente disponible | No disponible para NLI especificamente |
| Adaptadores NLI equivalentes sobre Llama 3.1 8B | No disponible | No disponible | No disponible | No identificados | No disponible |

No se han identificado en la información proporcionada adaptadores comparables publicados con métricas verificables, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de Hugging Face: todos los campos relevantes (uso previsto, sesgos, datos de entrenamiento, hiperparámetros, evaluación, impacto ambiental) están sin completar.
- No se declara licencia en el repositorio. El modelo base se rige por la Llama 3.1 Community License, que impone condiciones de uso comercial, obligaciones de atribución y restricciones para organizaciones con más de 700 millones de usuarios mensuales; el adaptador hereda estas restricciones.
- Sin resultados de benchmarks ni validación por parte de la comunidad (0 descargas, 0 likes), no hay evidencia de que el ajuste funcione correctamente.
- Un rango de LoRA de 4 es muy bajo y puede ser insuficiente para capturar la tarea; existe riesgo de infraajuste.
- Con solo 5000 ejemplos y un posible subrecorte adicional, el riesgo de sobreajuste y de olvido catastrófico de las capacidades originales del modelo base es elevado.
- El identificador "percentage_1_40" no está documentado, lo que impide saber exactamente qué subconjunto de datos se utilizó y limita la reproducibilidad.
- XNLI es un corpus de traducción de un dataset original en inglés, con sesgos conocidos de género, ocupación y origen cultural que pueden trasladarse al adaptador, especialmente en la partición en hindi.
- El modelo base Llama 3.1 8B presenta riesgo de alucinación; el ajuste sobre una tarea de clasificación no elimina este comportamiento en generación libre.
- No hay información sobre el comportamiento del adaptador en idiomas distintos del inglés y el hindi, ni sobre el impacto del ajuste en tareas ajenas a NLI.
- No se documenta el proceso de fusión ni la compatibilidad con cuantizaciones, lo que añade incertidumbre al despliegue en producción.
- Uso en producción no recomendado sin evaluación propia previa sobre un conjunto de validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_LoRA_rank_4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automático: https://mlco2.github.io/impact#compute
- Librería PEFT: https://huggingface.co/docs/peft
- Nota: la búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo, XNLI o LoRA; los resultados obtenidos correspondían a artículos sobre estructuras de control en Java y no guardan relación con el contenido de esta ficha.
