# TajikNLPWorld/tajik-mbert-pos-lora-seed123

## Resumen
`tajik-mbert-pos-lora-seed123` es un adaptador LoRA (PEFT) sobre `google-bert/bert-base-multilingual-cased`, desarrollado por TajikNLPWorld, que clasifica formas léxicas aisladas del tayiko (escritura cirílica) en una de 28 categorías gramaticales (POS). Forma parte de un estudio controlado de tres semillas (42, 123 y 2024) que compara fine-tuning completo frente a LoRA en una tarea de clasificación de POS a nivel de palabra.

El modelo no realiza etiquetado de secuencias contextual: recibe una única forma léxica, sin oración, por lo que las ambigüedades gramaticales dependientes del contexto no pueden resolverse. Esta orientación lo hace útil para tareas de normalización, anotación léxica o pre-etiquetado, pero no sustituye a un tagger contextual de POS.

La relevancia actual radica en su valor como artefacto reproducible para NLP de bajos recursos: incluye particiones disjuntas por forma léxica, semillas emparejadas, hashes de revisión de los datasets y del backbone, auditoría de serialización y métricas por clase, además de una evaluación externa sobre `TajikMorphCorpus` que evidencia el fuerte desajuste de dominio en tayiko.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, `bert-base-multilingual-cased`) con adaptador LoRA y cabeza de clasificación de 28 clases |
| Parametros totales | 178.781.240 (modelo completo base + cabeza) |
| Parametros activos | No aplica (no es MoE); parametros entrenables: 906.268 (0,507%) |
| Longitud de contexto | 64 tokens (max sequence length usada en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Tayiko (`tg`), escritura cirilica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT + cabeza clasificadora); libreria `peft` |

## Arquitectura y entrenamiento
El backbone es `bert-base-multilingual-cased`, un encoder transformer multilingüe, sobre el que se aplica un adaptador LoRA y una cabeza de clasificación lineal de 28 salidas. El repositorio contiene únicamente el adaptador y la cabeza entrenada, no una copia completa del backbone; la carga requiere instanciar el modelo base con la revisión `3f076fdb1ab68d5b2880cb87a0886f315b8146f8` y adjuntar el adaptador con PEFT.

El dataset principal `TajikNLPWorld/tajik-pos-corpus` contiene 52.508 registros en 28 categorías, con partición fija disjunta por forma léxica normalizada: 42.017 entrenamiento / 5.232 validación / 5.259 test (semilla de partición 42). Entrenamiento: 5 épocas, learning rate 0,0003, batch por dispositivo 8, acumulación de gradiente 4 (batch efectivo 32), longitud máxima 64 tokens, entropía cruzada ponderada por frecuencia inversa con raíz cuadrada calculada solo sobre el split de entrenamiento, checkpoint seleccionado por Macro-F1 de validación. Ejecutado en NVIDIA L4 con BF16, Transformers 5.22.2, PEFT 0.21.2 y Datasets 5.2.0. Se verificó la serialización y recarga mediante huella SHA-256 del estado completo y coincidencia en predicciones de prueba.

## Capacidades
- Clasificación de POS a nivel de palabra para formas léxicas aisladas en tayiko cirílico, con 28 etiquetas del ontology original del dataset.
- Salida de etiqueta en tayiko, con vocabulario ordenado disponible en `labels.json`.
- Clasificación restringida a subconjuntos de etiquetas mediante enmascaramiento de logits (por ejemplo, 9 clases compartidas).
- No realiza etiquetado contextual de secuencias ni resolución de ambigüedad gramatical dependiente de la oración.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- Soporte multilingüe limitado al tayiko en esta especialización, pese a partir de un backbone multilingüe.

## Casos de uso
- Anotación léxica previa a pipelines de POS contextual: aplicar el modelo a formas léxicas aisladas para obtener una etiqueta candidata que después un tagger contextual corrija, aprovechando su entrenamiento específico en tayiko.
- Normalización y enriquecimiento de lexicones: clasificar entradas de diccionarios tayikos por categoría gramatical para construir recursos léxicos estructurados con las 28 etiquetas del corpus.
- Pre-etiquetado de corpus para anotación humana: generar etiquetas automáticas sobre listas de formas léxicas y reducir el esfuerzo de revisión manual, dado que el modelo opera sin contexto oracional.
- Estudio de reproducibilidad en NLP de bajos recursos: usar este checkpoint junto con las semillas 42 y 2024 y la variante de fine-tuning completo para replicar el análisis de Macro-F1 (0,3835 ± 0,0252 en 28 clases para LoRA).
- Evaluación de transferencia entre corpus: emplear las métricas externas sobre `TajikMorphCorpus` (accuracy 0,2685; Macro-F1 0,1526) como referencia de desajuste de dominio al diseñar nuevos conjuntos tayikos.
- Filtrado y curación de datos: clasificar formas léxicas de un corpus no anotado para identificar categorías raras o detectar formas fuera de distribución antes de incluirlas en entrenamiento.
- Despliegue ligero en entornos con recursos limitados: el adaptador ocupa un tamaño de repo de 0,0 GB y solo 906.268 parámetros entrenables, lo que facilita servirlo junto al backbone BERT base en CPU o GPU modestas.

## Benchmarks y rendimiento

| Evaluación | Ejemplos | Accuracy | Macro-F1 | Weighted-F1 |
|:--|--:|--:|--:|--:|
| Test in-domain (28 etiquetas POS) | 5.259 | 0,7631 | 0,4126 | 0,7601 |
| Test in-domain (9 etiquetas compartidas, logits enmascarados) | 4.235 | 0,7296 | 0,4231 | 0,7279 |
| TajikMorphCorpus externo (9 etiquetas mapeadas) | 2.592 | 0,2685 | 0,1526 | 0,2914 |
| Subconjunto externo de formas no vistas (9 etiquetas mapeadas) | 2.289 | 0,2656 | 0,1469 | 0,2926 |

Media de Macro-F1 in-domain en 28 clases para LoRA (PEFT) en las tres semillas emparejadas (42, 123, 2024): 0,3835 ± 0,0252 (desviación estándar muestral). Los resultados de 9 y 28 etiquetas no son directamente intercambiables.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el backbone BERT base (178,8 M parámetros) más la cabeza de 28 clases es ligero, pero no se publican cifras de VRAM.
- GPU recomendadas: no disponible; el entrenamiento se ejecutó en NVIDIA L4 con BF16.
- Cabe en GPU de consumidor: previsiblemente sí por tamaño del backbone, aunque no se aportan medidas concretas.
- Opciones de despliegue: Transformers + PEFT (flujo documentado con `AutoModelForSequenceClassification` y `PeftModel.from_pretrained`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Macro-F1 in-domain | Licencia | Disponibilidad |
|:--|:--|:--|:--|:--|:--|:--|
| `tajik-mbert-pos-lora-seed123` (este) | 178,8 M (0,906 M entrenables) | 64 tokens | POS de palabra aislada, 28 clases | 0,4126 (semilla 123); media 0,3835 ± 0,0252 | Apache 2.0 | Hugging Face |
| Variante fine-tuning completo del mismo estudio | 178,8 M | 64 tokens | POS de palabra aislada, 28 clases | no disponible en esta ficha | no disponible | Hugging Face (dentro del estudio de seis checkpoints) |
| `google-bert/bert-base-multilingual-cased` sin ajuste | 178,8 M | 512 tokens (arquitectura) | Masked LM / encoder multilingüe | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de terceros comparables en la información proporcionada.

## Limitaciones y advertencias
- Entrenamiento y evaluación sin contexto: no es un tagger de POS a nivel de oración; aplicar el modelo palabra a palabra a una frase no lo convierte en contextual.
- Rendimiento externo muy bajo: accuracy 0,2685 y Macro-F1 0,1526 sobre `TajikMorphCorpus`, lo que refleja fuerte desajuste de dominio y categorías raras.
- El mapeo automático a 9 categorías externas requiere validación lingüística independiente.
- Las métricas de 9 y 28 etiquetas no son directamente comparables.
- Macro-F1 in-domain moderado (0,4126 en esta semilla) indica dificultad con clases poco frecuentes; se recomienda consultar `reports/perclass_*.csv`.
- Riesgo de sesgo derivado de la distribución del corpus y de las ponderaciones por frecuencia inversa aplicadas al entrenamiento.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de etiquetas incorrectas en formas léxicas ambiguas o fuera de distribución.
- Cobertura lingüística limitada al tayiko; no se declaran otros idiomas pese al backbone multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía de rendimiento fuera del dominio estudiado.
- El repositorio no contiene el backbone completo: es imprescindible cargar `bert-base-multilingual-cased` con la revisión indicada para reproducir resultados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/TajikNLPWorld/tajik-mbert-pos-lora-seed123
- Modelo base: https://huggingface.co/bert-base-multilingual-cased
- Dataset principal: https://huggingface.co/datasets/TajikNLPWorld/tajik-pos-corpus
- Dataset de evaluación externa: https://huggingface.co/datasets/TajikNLPWorld/TajikMorphCorpus
- Paper referenciado (arXiv:2605.04576): https://arxiv.org/abs/2605.04576
