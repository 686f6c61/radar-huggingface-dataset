# tahamajs/bert-dynamic-conv-attention-sst2

## Resumen

`tahamajs/bert-dynamic-conv-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar han sido sustituidas por el mecanismo `dynamic_conv_attention` de la libreria NeuralOps. El autor es Taha Majlesi (tahamajs) y el modelo se distribuye bajo licencia MIT como parte de un "attention zoo" de BERT con mecanismos de atencion subcuadraticos.

El modelo se ha destilado sobre WikiText-2 mediante el pipeline de destilacion de conocimiento en tres etapas de NeuralOps, con un entrenamiento de 300 segundos en una NVIDIA RTX 3090. La model card reporta una perplejidad MLM de 0,00 y una precision de tokens enmascarados del 50,92%; estos valores son anomalos (la perplejidad nula es matematicamente imposible en una distribucion de probabilidad valida) y deben tratarse con escepticismo hasta que exista una evaluacion independiente.

Es relevante como experimento de investigacion sobre atencion eficiente y destilacion rapida, no como modelo listo para produccion: no tiene descargas ni validacion externa, y la propia model card contiene inconsistencias entre el titulo (menciona SST-2) y el contenido (destilacion sobre WikiText-2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion `dynamic_conv_attention` en las 12 capas |
| Parametros totales | no disponible (heredados de bert-base-uncased, ~110 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (bert-base-uncased soporta 512 tokens, no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (custom_code, libreria `neuralops`); safetensors no confirmado |

## Arquitectura y entrenamiento

La arquitectura parte de `bert-base-uncased` y reemplaza las 12 capas de self-attention multi-cabeza por `dynamic_conv_attention`, un mecanismo de atencion convolucional dinamica de complejidad subcuadratica perteneciente a la libreria NeuralOps. El modelo conserva la cabeza de masked language modeling (pipeline `fill-mask`) y se distribuye con codigo personalizado (`custom_code`), por lo que requiere cargar la definicion del mecanismo desde NeuralOps o confiar en el codigo remoto del repositorio.

El entrenamiento consistio en una destilacion de conocimiento sobre WikiText-2 con un curriculum de tres etapas: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (KD de logits fusionado con LR diferencial). La model card reporta 186 pasos, 300 segundos de entrenamiento, throughput de 31.500 tokens/s y un pico de VRAM de 13.512 MB en una RTX 3090. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de WikiText-2.

## Capacidades

- Relleno de mascaras (masked language modeling) en ingles, tarea principal declarada (`fill-mask`).
- Representaciones de texto derivadas de BERT-base, potencialmente reutilizables para clasificacion o extraccion de caracteristicas.
- Atencion subcuadratica como sustituto del mecanismo cuadratico estandar, orientado a eficiencia computacional.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma.
- No se documentan capacidades de generacion de codigo, matematicas ni instrucciones.

## Casos de uso

- Investigacion sobre atencion eficiente: comparar `dynamic_conv_attention` frente a atencion estandar en tareas de MLM y medir el impacto en perplejidad con un protocolo reproducible.
- Experimentos de destilacion rapida: usar el pipeline de tres etapas de NeuralOps como referencia para destilar modelos BERT en minutos sobre una unica GPU consumer.
- Relleno de mascaras en ingles para prototipos: integrar el modelo con `transformers.pipeline("fill-mask")` en demos o cuadernos de prueba, asumiendo que la calidad no esta validada externamente.
- Extraccion de embeddings para tareas downstream: emplear las representaciones del encoder como features en clasificacion de texto, previa verificacion empirica de su calidad frente al BERT original.
- Benchmarking de mecanismos de atencion: incluir este checkpoint en un "attention zoo" para comparar variantes subcuadraticas bajo el mismo protocolo de evaluacion.
- Docencia y divulgacion: ilustrar como se sustituye un mecanismo de atencion en un transformer preentrenado y como se mide el efecto con perplejidad MLM determinista.
- No recomendado para produccion: atencion al cliente, generacion de codigo o agentes quedan fuera de su alcance por tratarse de un modelo encoder de MLM sin validacion externa.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (evaluacion MLM pseudo-perplejidad determinista sobre WikiText-2, 15% de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision tokens enmascarados (%) | Delta vs baseline |
|---|---|---|---|
| BERT teacher (`bert-base-uncased`) | 6,84 | 68,42 | Referencia |
| Stage 0 (calibracion ridge) | 0,00 | 50,92 | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 50,92 | -6,84 |

Advertencia: una perplejidad de 0,00 es matematicamente inconsistente con una distribucion de probabilidad normalizada y una precision del 50,92% (cercana al azar en un vocabulario de ~30.000 tokens) sugiere un fallo en el protocolo de evaluacion o en el calculo de la metrica. No se han publicado resultados independientes de MMLU, HumanEval, GSM8K ni GLUE en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un encoder de ~110 M de parametros se situaria tipicamente en el rango de 0,5-1 GB en FP32 y menos en FP16, pero no esta confirmado para esta variante.
- GPU recomendadas: el autor uso una NVIDIA RTX 3090 (24 GB) para el entrenamiento; para inferencia basta una GPU consumer de gama media, aunque no se documentan requisitos minimos.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 2 GB de VRAM, aunque no esta verificado.
- Opciones de despliegue: `neuralops.load_pretrained_bert` (API recomendada por el autor) y `transformers.pipeline("fill-mask")` con `trust_remote_code`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia. En entrenamiento el autor reporta 31.500 tokens/s y 13.512 MB de pico de VRAM en una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Validacion externa |
|---|---|---|---|---|---|
| `tahamajs/bert-dynamic-conv-attention-sst2` | no disponible (~110 M, no confirmado) | no disponible | MLM (fill-mask) | MIT | No |
| `google-bert/bert-base-uncased` | 110 M | 512 tokens | MLM + encoder general | Apache 2.0 | Si, amplia |
| `distilbert-base-uncased` | 66 M | 512 tokens | MLM + encoder general | Apache 2.0 | Si, amplia |
| `roberta-base` | 125 M | 512 tokens | MLM + encoder general | MIT | Si, amplia |

La comparativa se limita a modelos encoder de tamano similar; no se dispone de datos de rendimiento comparables para esta variante mas alla de la tabla del autor.

## Limitaciones y advertencias

- Metricas no fiables: la perplejidad de 0,00 y la precision del 50,92% indican un posible error en el protocolo de evaluacion; no deben citarse como evidencia de calidad.
- Inconsistencia en la model card: el nombre del repositorio menciona SST-2, pero el contenido describe destilacion sobre WikiText-2; no queda claro el dataset real de ajuste.
- Sin validacion externa: cero descargas y cero likes en el momento de la consulta; no hay evaluaciones independientes ni resultados en benchmarks estandar.
- Requiere codigo personalizado: el mecanismo `dynamic_conv_attention` se carga via `custom_code`, lo que implica ejecutar codigo remoto y anade riesgo de seguridad y de mantenimiento.
- Solo ingles: la etiqueta de idioma es `en`; no se documenta soporte multilingue.
- Sin capacidades generativas ni de instrucciones: es un modelo de masked LM, no un modelo de chat ni de razonamiento.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al derivar de `bert-base-uncased` hereda los sesgos de su corpus de preentrenamiento.
- Licencia MIT: permite uso comercial, pero la ausencia de validacion desaconseja su uso en produccion sin una evaluacion propia.
- Fecha de creacion futura (2026-11-09) en los metadatos: conviene verificar la procedencia y el estado real del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-dynamic-conv-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
