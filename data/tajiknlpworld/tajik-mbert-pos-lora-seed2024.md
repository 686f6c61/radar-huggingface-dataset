# TajikNLPWorld/tajik-mbert-pos-lora-seed2024

## Resumen

`tajik-mbert-pos-lora-seed2024` es un adaptador LoRA (PEFT) sobre `bert-base-multilingual-cased` para clasificación de categoría gramatical (POS) de palabras aisladas en tayiko (idioma `tg`, escritura cirílica). Lo publica el proyecto TajikNLPWorld como parte de un estudio controlado de tres semillas que compara ajuste fino completo frente a LoRA en una tarea de clasificación a nivel de palabra con 28 etiquetas POS. El checkpoint corresponde a la semilla 2024 y forma parte de un conjunto de seis modelos (dos métodos por tres semillas).

El modelo resuelve una tarea muy concreta: asignar una de 28 categorías POS a una forma léxica aislada, sin contexto oracional. No es un etiquetador de secuencias contextual: la entrada es una palabra, no una frase, por lo que las ambigüedades gramaticales que dependen del contexto no pueden resolverse. Esta limitación está declarada explícitamente por el autor y condiciona por completo su uso en producción.

Su relevancia es doble. Por un lado, aporta un recurso escaso para el procesamiento del tayiko, una lengua de bajos recursos. Por otro, documenta con rigor metodológico (semillas emparejadas, particiones disjuntas por forma léxica, huellas SHA-256, evaluación cruzada entre corpus) el rendimiento real de LoRA frente a ajuste completo en una tarea morfológica de bajos recursos, incluyendo una caída muy severa en evaluación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT multilingüe) con adaptador LoRA y cabeza de clasificación de 28 clases |
| Parametros totales | 178.781.240 (backbone base) |
| Parametros activos | No aplica (no es MoE); parámetros entrenables del adaptador: 906.268 (0,507 %) |
| Longitud de contexto | 64 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Tayiko (`tg`); backbone multilingüe subyacente |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA + cabeza de clasificación; requiere el backbone base por separado) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-multilingual-cased` (revisión fijada `3f076fdb1ab68d5b2880cb87a0886f315b8146f8`) y le añade un adaptador LoRA más una cabeza de clasificación de 28 clases, entrenada junto con el adaptador. Solo se actualizan 906.268 de los 178.781.240 parámetros. La serialización se validó con una huella SHA-256 del estado completo y comprobación de concordancia en predicciones de sonda.

Los datos proceden del corpus `TajikNLPWorld/tajik-pos-corpus` (52.508 registros, 28 categorías) con una partición fija disjunta por forma léxica normalizada: 42.017 de entrenamiento, 5.232 de validación y 5.259 de test, con semilla de partición 42. El entrenamiento usó 5 épocas, tasa de aprendizaje 0,0003, batch por dispositivo 8 con acumulación de gradiente 4 (batch efectivo 32), longitud máxima de 64 tokens, entropía cruzada ponderada con pesos de frecuencia inversa en raíz cuadrada calculados solo sobre el split de entrenamiento, y selección del mejor checkpoint por Macro-F1 de validación. Se ejecutó en una NVIDIA L4 con BF16, Transformers 5.22.2, PEFT 0.21.2 y Datasets 5.2.0. La evaluación externa emplea `TajikNLPWorld/TajikMorphCorpus` (revisión `b29f8230724ee4d305423e46691f65dd2f422120`) con un mapeo automático a nueve categorías compartidas.

## Capacidades

- Clasificación de categoría gramatical (POS) de palabras aisladas en tayiko, con 28 etiquetas en la ontología original del corpus.
- Clasificación a nivel de palabra (word-level classification) mediante `text-classification` con una única etiqueta de salida por entrada.
- Evaluación restringida a subconjuntos de etiquetas mediante enmascaramiento de logits (por ejemplo, 9 etiquetas compartidas con el corpus externo).
- No soporta etiquetado de secuencias contextual ni análisis sintáctico: no recibe contexto oracional.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al backbone subyacente; el adaptador y la cabeza están entrenados solo para tayiko.
- No genera texto: es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Anotación asistida de corpus tayikos: preetiquetar formas léxicas aisladas en un pipeline de anotación humana, usando la salida del modelo como propuesta inicial que un lingüista revisa. Adecuado por su coste computacional bajo y su naturaleza de clasificador léxico.
- Enriquecimiento de léxicos y diccionarios: asignar categoría POS a entradas de un diccionario o glosario tayiko donde cada lema aparece como forma aislada, escenario que encaja con la formulación del modelo.
- Normalización y preprocesamiento en pipelines de NLP para tayiko: etiquetar tokens individuales antes de un análisis posterior, siempre que el paso siguiente tolere la ausencia de contexto.
- Investigación en NLP de bajos recursos: replicar el estudio de tres semillas y comparar LoRA frente a ajuste completo con particiones idénticas, usando este checkpoint como referencia de la semilla 2024.
- Evaluación de transferencia entre corpus: emplear el modelo como sonda para medir el desajuste de dominio frente a `TajikMorphCorpus`, dado que el autor publica resultados de evaluación externa y por clase.
- Docencia y experimentación con PEFT: ejemplo reproducible de adaptador LoRA sobre mBERT con metadatos completos, huellas de revisión y auditoría de serialización, útil para enseñar buenas prácticas de reproducibilidad.
- Filtrado o desambiguación léxica gruesa: en tareas donde la forma aislada basta (por ejemplo, separar nombres propios de formas verbales en listas de términos), con la advertencia de que la ambigüedad contextual no se resuelve.

## Benchmarks y rendimiento

Resultados reales publicados por el autor para este checkpoint (semilla 2024):

| Evaluacion | Ejemplos | Accuracy | Macro-F1 | Weighted-F1 |
|---|---:|---:|---:|---:|
| Test en dominio (28 etiquetas POS) | 5.259 | 0,7600 | 0,3683 | 0,7566 |
| Test en dominio (9 etiquetas compartidas, logits enmascarados) | 4.235 | 0,7263 | 0,3956 | 0,7247 |
| Externo TajikMorphCorpus (9 etiquetas mapeadas) | 2.592 | 0,2793 | 0,1555 | 0,3071 |
| Externo, subconjunto de palabras no vistas (9 etiquetas mapeadas) | 2.289 | 0,2757 | 0,1544 | 0,3084 |

Media de Macro-F1 en dominio a 28 clases para LoRA en las tres semillas emparejadas (42, 123, 2024): 0,3835 ± 0,0252 (desviación típica muestral). El autor advierte que las puntuaciones Macro-F1 de 9 y 28 etiquetas no son directamente intercambiables y que el mapeo entre corpus requiere validación lingüística independiente. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el backbone mBERT (unos 178 M de parámetros) más el adaptador cabe holgadamente en menos de 1 GB en FP32 y en torno a 0,5 GB en FP16/BF16, aunque no se publican mediciones exactas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; el autor entrenó en una NVIDIA L4 con BF16. Para inferencia no se requiere GPU de centro de datos.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con al menos 2 GB de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: Transformers + PEFT (flujo documentado por el autor), exportación a ONNX no documentada, `text-classification` de Hugging Face; vLLM, llama.cpp, Ollama y TGI no están indicados para este tipo de clasificador en la información disponible.
- Latencia y throughput: no disponibles. El modelo procesa una palabra por inferencia con secuencias de hasta 64 tokens, por lo que el coste por llamada es mínimo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tajik-mbert-pos-lora-seed2024` (este) | 178,8 M (0,906 M entrenables) | 64 tokens | POS de palabra aislada, 28 clases, tayiko | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Ajuste completo equivalente del mismo estudio | 178,8 M | 64 tokens | POS de palabra aislada, 28 clases, tayiko | Apache 2.0 | Hugging Face (checkpoints del mismo autor, según el estudio) |
| `bert-base-multilingual-cased` sin ajustar | 178,8 M | 512 tokens | Enmascarado de lenguaje / base para fine-tuning | Apache 2.0 | Hugging Face |
| Etiquetadores POS contextuales para tayiko | No disponible | No disponible | Etiquetado de secuencias con contexto | No disponible | No disponible |

No se dispone en la información proporcionada de cifras comparativas de rendimiento entre el ajuste completo y LoRA, ni de otros modelos POS para tayiko con los que contrastar parámetros, contexto o resultados.

## Limitaciones y advertencias

- Entrenamiento y evaluación sin contexto: la entrada es una palabra aislada; aplicar el modelo palabra a palabra sobre una frase no lo convierte en un etiquetador POS contextual.
- Caída severa en evaluación externa: Macro-F1 de 0,1555 en `TajikMorphCorpus`, frente a 0,3683 en dominio, indicativa de un fuerte desajuste de dominio y de categorías raras.
- El mapeo automático entre corpus a nueve categorías compartidas requiere validación lingüística independiente; los resultados de 9 y 28 etiquetas no son intercambiables.
- Macro-F1 en dominio moderado (0,3683) pese a una accuracy de 0,7600, lo que revela un rendimiento muy desigual entre clases; conviene revisar los CSV por clase (`reports/perclass_*.csv`).
- El autor no reclama que el modelo resuelva el etiquetado POS general del tayiko.
- No se documentan sesgos específicos, pero al entrenarse sobre un único corpus de 52.508 registros puede heredar los sesgos de composición y anotación de ese corpus.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de predicciones erróneas con alta confianza en formas léxicas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse la licencia del backbone base y citarse adecuadamente el corpus y el estudio.
- El repositorio no contiene el backbone completo: es imprescindible cargar `bert-base-multilingual-cased` en la revisión indicada y adjuntar el adaptador con PEFT; ignorar la revisión fijada puede alterar los resultados.
- Uso en producción: no recomendable como etiquetador POS general sin validación adicional y sin un componente contextual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TajikNLPWorld/tajik-mbert-pos-lora-seed2024
- Modelo base: https://huggingface.co/bert-base-multilingual-cased
- Dataset principal: https://huggingface.co/datasets/TajikNLPWorld/tajik-pos-corpus
- Dataset de evaluación externa: https://huggingface.co/datasets/TajikNLPWorld/TajikMorphCorpus
- Paper citado en los tags: arXiv 2605.04576 (referencia tal como aparece en la información del repositorio)
