# tahamajs/bert-decay-linear-attention-sst2

## Resumen

`tahamajs/bert-decay-linear-attention-sst2` es una variante experimental de `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar se han sustituido por el mecanismo `decay_linear_attention` de la libreria NeuralOps. El autor, Taha Majlesi (tahamajs), lo publica como parte de su "BERT-131 Subquadratic Attention Zoo", un catalogo de variantes de BERT con mecanismos de atencion subcuadraticos destinado a comparar alternativas a la atencion cuadratica clasica. El modelo se distribuye con licencia MIT y pipeline `fill-mask` para ingles.

El interes tecnico esta en la sustitucion del mecanismo de atencion: la atencion lineal con decaimiento reduce el coste asintotico respecto a la atencion cuadratica de BERT, lo que abre la puerta a contextos mas largos con menor coste computacional. El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas (calibracion ridge en forma cerrada, MSE/CKA sobre subespacio con backbone congelado y KD de logits con LR diferencial), entrenado durante 300 segundos en una NVIDIA RTX 3090.

Conviene tratar esta ficha con cautela: el repositorio tiene 0 descargas y 0 likes, el nombre del checkpoint menciona `sst2` (tarea de clasificacion de sentimiento) pero el pipeline declarado es `fill-mask`, y las metricas reportadas incluyen una perplejidad de 0.00 que resulta sospechosa y no es interpretable como una perplejidad real. Es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion `decay_linear_attention` en las 12 capas |
| Parametros totales | no disponible (hereda la estructura de `bert-base-uncased`, ~110 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT-base estandar usa 512 tokens; no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.5 GB, requiere `custom_code`; probablemente safetensors/PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza todas las capas de self-attention multi-cabeza por `decay_linear_attention`, un mecanismo de atencion lineal con decaimiento que busca reducir la complejidad respecto a la atencion cuadratica. La implementacion proviene de NeuralOps, una libreria del mismo autor, y el checkpoint requiere `custom_code` para cargarse, lo que implica dependencia de esa libreria o de codigo remoto. No se detalla en la model card la formulacion matematica exacta del mecanismo ni el estado del resto de componentes (embeddings, FFN, normalizacion), que presumiblemente se mantienen de BERT-base.

El entrenamiento consiste en destilacion de conocimiento sobre WikiText-2 con un curriculum de tres etapas: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA sobre subespacio con backbone congelado) y Stage 2 (KD de logits fusionado con LR diferencial). Segun la telemetria del autor, se completaron 90 pasos en 300 segundos en una RTX 3090, con un throughput de 15 287,6 tokens/s y un pico de 13 512 MB de VRAM. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de WikiText-2.

## Capacidades

- Relleno de mascaras (`fill-mask`) en ingles, segun el pipeline declarado.
- Modelo de representaciones tipo BERT, potencialmente reutilizable para tareas downstream de NLP en ingles (clasificacion, NER, QA extractiva) mediante fine-tuning, aunque no se documenta.
- No se declara soporte de tool calling, function calling ni comportamiento agentico.
- No se declara capacidad multilingue (solo ingles).
- No se declara vision, audio ni modo de razonamiento explicito.
- La atencion lineal con decaimiento podria habilitar contextos mas largos que BERT estandar, pero no se confirma la longitud efectiva soportada.

## Casos de uso

- Investigacion sobre mecanismos de atencion subcuadraticos: el modelo sirve como punto de comparacion controlado frente a `bert-base-uncased` para medir el impacto de sustituir atencion cuadratica por atencion lineal con decaimiento en tareas de enmascaramiento.
- Experimentos de destilacion de conocimiento: el pipeline de tres etapas documentado puede reproducirse o adaptarse a otros modelos y datasets, usando este checkpoint como referencia.
- Prototipado de `fill-mask` en ingles: util para probar rapidamente si una variante de atencion lineal conserva capacidad de prediccion de tokens enmascarados frente al profesor original.
- Benchmarking de eficiencia: al reducir la complejidad de atencion, puede emplearse para medir latencia y memoria en inferencia comparado con BERT-base, aunque no se publican cifras de latencia.
- Educacion y divulgacion: ejemplo didactico de como se sustituye un bloque de atencion en un transformer preentrenado y se reentrena por destilacion.
- Base para fine-tuning experimental en tareas de NLP en ingles (clasificacion de texto, analisis de sentimiento, dado el sufijo `sst2` del nombre), siempre que se valide antes la calidad del checkpoint.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (MLM pseudo-perplejidad determinista sobre WikiText-2, 15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision de token enmascarado (%) | Delta vs baseline |
|---|---|---|---|
| BERT-base profesor (`bert-base-uncased`) | 6,84 | 68,42 | referencia |
| Stage 0 (calibracion ridge en forma cerrada) | 0,00 | 52,98 | -6,84 |
| Stage 2 (modelo destilado final) | 0,00 | 68,58 | -6,84 |

Advertencia: una perplejidad de 0,00 no es un valor plausible para un modelo de lenguaje y sugiere un artefacto de calculo o de evaluacion (por ejemplo, colapso de la distribucion o error en la metrica). La unica cifra interpretable es la precision de token enmascarado (68,58 % frente a 68,42 % del profesor), una mejora marginal de 0,16 puntos. No se han publicado resultados en benchmarks estandar como MMLU, GLUE o SST-2 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano de BERT-base (~110 M de parametros) cabria en GPUs consumer con pocos GB, pero no se confirma.
- GPU recomendadas: el autor entreno en una NVIDIA RTX 3090 de 24 GB; para inferencia no se especifica.
- Cabe en GPU consumer: presumiblemente si (BERT-base es ligero), aunque no confirmado para esta variante con atencion custom.
- Opciones de despliegue: la model card documenta carga via `neuralops.load_pretrained_bert` y via `transformers.pipeline("fill-mask")` con `custom_code`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta throughput de entrenamiento (15 287,6 tokens/s en RTX 3090); no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mecanismo de atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-decay-linear-attention-sst2` | no disponible (~110 M presumible) | no disponible | `decay_linear_attention` (lineal con decaimiento) | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` | ~110 M | 512 tokens | Self-attention multi-cabeza estandar | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased` | ~66 M | 512 tokens | Self-attention multi-cabeza (6 capas) | Apache 2.0 | Hugging Face, ampliamente usado |

La comparativa con alternativas de atencion lineal o subcuadratica de terceros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion con 0 descargas y 0 likes: no hay evidencia de uso ni validacion independiente.
- La metrica de perplejidad 0,00 reportada es implausible y debe tratarse como no fiable; la mejora real observada (0,16 puntos en precision de token enmascarado) es marginal.
- El nombre del checkpoint menciona `sst2` pero el pipeline declarado es `fill-mask`; la tarea real para la que fue ajustado no esta clara.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Requiere `custom_code` para cargarse, lo que introduce dependencia del codigo de NeuralOps y riesgo de ejecucion de codigo remoto no auditado.
- No se documentan sesgos, riesgos de alucinacion ni evaluaciones de seguridad.
- La licencia MIT permite uso comercial, pero la falta de validacion hace desaconsejable su uso en produccion sin evaluacion propia.
- No se confirma la longitud de contexto efectiva ni el comportamiento del mecanismo de atencion lineal en secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-decay-linear-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
