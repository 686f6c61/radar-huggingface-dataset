# tahamajs/bert-compressed-attention-sst2

## Resumen

`tahamajs/bert-compressed-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar se han sustituido por el mecanismo `compressed_attention` de la libreria NeuralOps. El modelo lo publica Taha Majlesi (usuario `tahamajs`) dentro del denominado "BERT-131 Subquadratic Attention Zoo", un catalogo de variantes de BERT con mecanismos de atencion subcuadraticos. El objetivo declarado es explorar alternativas de atencion mas eficientes que la atencion cuadratica clasica, manteniendo el backbone preentrenado de BERT.

El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas (calibracion ridge en forma cerrada, MSE/CKA con backbone congelado y KD de logits con LR diferencial) ejecutado durante 300 segundos en una NVIDIA RTX 3090. El repositorio ocupa 0,4 GB y la libreria declarada es `neuralops`, no `transformers` estandar, aunque la model card ofrece un ejemplo con el pipeline de `transformers`.

Es relevante como pieza de investigacion sobre mecanismos de atencion eficientes y destilacion rapida, no como modelo listo para produccion: el autor lo publica con 0 descargas y 0 likes, la licencia es MIT y el unico idioma declarado es ingles. La model card incluye metricas de perplejidad y precision en enmascarado que presentan anomalias (perplejidad 0.00) y deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion `compressed_attention` (subcuadratica) en las 12 capas |
| Parametros totales | no disponible (deriva de `bert-base-uncased`, ~110 M, no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,4 GB; la libreria declarada es `neuralops` con `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las 12 capas de self-attention multi-cabeza por el mecanismo `compressed_attention` de NeuralOps, descrito por el autor como atencion subcuadratica. No se detalla en la informacion disponible la formulacion matematica del mecanismo, el factor de compresion ni como afecta a la complejidad computacional en funcion de la longitud de secuencia. El backbone es un transformer encoder clasico con cabeza de masked language modeling.

El entrenamiento consiste en una destilacion de conocimiento sobre WikiText-2 con tres etapas: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (KD de logits fusionada con learning rate diferencial). La ejecucion reportada dura 300 segundos (160 pasos) en una RTX 3090, con un throughput de 26.275 tokens/s y un pico de VRAM de 8.487 MB. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de WikiText-2.

## Capacidades

- Relleno de mascaras (masked language modeling) en ingles, que es la tarea declarada en el pipeline (`fill-mask`).
- Representaciones contextuales de frases y tokens heredadas del backbone BERT-base, utilizables para tareas de clasificacion o extraccion de caracteristicas mediante fine-tuning.
- Atencion subcuadratica teoricamente mas eficiente en secuencias largas, aunque no se aportan mediciones de latencia o memoria frente a la atencion estandar.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue: no; solo ingles segun la etiqueta de idioma.

## Casos de uso

- Experimentacion academica con mecanismos de atencion eficientes: sirve como punto de partida para comparar `compressed_attention` frente a atencion estandar en tareas de enmascarado y clasificacion, reutilizando el tokenizer y el backbone de BERT-base.
- Prototipado de pipelines de relleno de mascaras en ingles: el ejemplo de la model card con `pipeline("fill-mask")` permite integrarlo rapidamente en demos de completado de texto o correccion de frases.
- Extraccion de embeddings para clasificacion de texto: al conservar la estructura de BERT-base, se puede hacer fine-tuning sobre tareas como analisis de sentimiento (de ahi el sufijo `sst2` del nombre, aunque no se documenta el fine-tuning en SST-2).
- Investigacion sobre destilacion rapida: el pipeline de tres etapas y las metricas de telemetria (300 s, 160 pasos, 26.275 tokens/s) son un caso de estudio reproducible para experimentos de KD de bajo coste.
- Base para ablation studies de mecanismos de atencion: permite aislar el efecto del cambio de atencion manteniendo constante el resto de la arquitectura y los pesos preentrenados.
- Docencia y formacion: ejemplo didactico de sustitucion de un componente de un transformer preentrenado y de evaluacion con pseudo-perplejidad MLM.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (evaluacion con MLM pseudo-perplexity sobre WikiText-2, 15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision en token enmascarado (%) | Delta vs baseline |
|---|---|---|---|
| BERT-base teacher (`bert-base-uncased`) | 6,84 | 68,42 | referencia |
| Stage 0 (calibracion ridge en forma cerrada) | 0,00 | 67,32 | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 89,91 | -6,84 |

Advertencia: una perplejidad de 0,00 es matematicamente implausible para un modelo de lenguaje y sugiere un error de calculo o de reporte (por ejemplo, log-probabilidades no normalizadas o saturacion numerica). La mejora de precision de 68,42 % a 89,91 % tampoco es verificable con la informacion disponible. No se han publicado resultados en benchmarks estandar (MMLU, GLUE, SQuAD, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento requirio 8.487 MB de pico en una RTX 3090, por lo que la inferencia en fp32 deberia caber holgadamente en GPUs de 8 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp32; el autor uso una RTX 3090 para la destilacion.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060/3070/4060 y superiores, aunque no hay mediciones publicadas de inferencia.
- Opciones de despliegue: la libreria `neuralops` con `neuralops.load_pretrained_bert(attention_type="compressed_attention", task="masked-lm")` o el pipeline estandar de `transformers` con `custom_code`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta throughput de entrenamiento (26.275 tokens/s); no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-compressed-attention-sst2` | no disponible (~110 M por herencia) | no disponible | fill-mask | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` | ~110 M | 512 tokens | fill-mask / encoder | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased` | ~66 M | 512 tokens | fill-mask / encoder | Apache 2.0 | Hugging Face, ampliamente usado |

La comparacion con `distilbert-base-uncased` es pertinente por ser otro modelo destilado de BERT, pero no se dispone de metricas comparables publicadas para este modelo mas alla de las de la model card, que presentan anomalias. No se identifican otras variantes de atencion subcuadratica de BERT con las que comparar directamente en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Las metricas de la model card (perplejidad 0,00) son sospechosas y no deben tomarse como evidencia de rendimiento real sin replicacion independiente.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-09), lo que indica ausencia de validacion por la comunidad.
- Depende de la libreria `neuralops` y de `custom_code`; la compatibilidad con el ecosistema estandar de `transformers` no esta garantizada mas alla del ejemplo del pipeline.
- No se documentan sesgos conocidos, pero al derivar de `bert-base-uncased` y entrenarse sobre WikiText-2 hereda los sesgos de esos datos.
- Riesgo de alucinacion y de predicciones poco fiables en dominios alejados de WikiText-2.
- La licencia MIT permite uso comercial, pero la ausencia de evaluacion independiente desaconseja su uso en produccion sin una validacion previa.
- No se especifican limitaciones de longitud de contexto ni el comportamiento del mecanismo `compressed_attention` en secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-compressed-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
