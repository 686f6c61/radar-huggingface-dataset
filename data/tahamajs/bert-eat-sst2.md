# tahamajs/bert-eat-sst2

## Resumen

`tahamajs/bert-eat-sst2` es una variante del modelo `bert-base-uncased` de Google en la que se han sustituido las doce capas de atencion multi-cabeza estandar por el mecanismo `eat`, perteneciente a la libreria NeuralOps desarrollada por Taha Majlesi. El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas disenado por el autor, con el objetivo de reducir la complejidad computacional de la atencion manteniendo la calidad en tareas de modelado de lenguaje enmascarado.

La relevancia de esta publicacion es fundamentalmente metodologica: documenta un experimento de sustitucion de atencion cuadratica por atencion subcuadratica en un transformer encoder clasico, con telemetria de entrenamiento concreta (300 segundos en una RTX 3090, 208 pasos, 35.525 tokens por segundo). La tarea declarada es `fill-mask` y el unico idioma soportado es el ingles. El modelo se publica bajo licencia MIT.

Conviene senalar que la model card incluye resultados de perplejidad de `0.00` tanto para la etapa de calibracion como para el modelo destilado, un valor que no es interpretable como una mejora real de calidad y que sugiere un problema de calculo o de fuga de informacion en la evaluacion. No se han publicado resultados en benchmarks estandar como GLUE, SQuAD o MMLU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion subcuadratica `eat` en las 12 capas |
| Parametros totales | no disponible (heredados de `bert-base-uncased`, aproximadamente 110 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (libreria `neuralops`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y aproximadamente 110 millones de parametros, y reemplaza en cada capa el bloque de self-attention multi-cabeza estandar por el mecanismo `eat` de la NeuralOps Library. La model card describe `eat` como un mecanismo de atencion subcuadratica, aunque no se detalla su formulacion matematica, su complejidad asintotica exacta ni el numero de cabezas o dimensiones internas que conserva respecto al original.

El entrenamiento consistio en una destilacion de conocimiento sobre WikiText-2 con un curriculum de tres etapas: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (destilacion de logits fusionada con learning rate diferencial). La ejecucion completa duro 300 segundos en una NVIDIA RTX 3090 de 24 GB, con 208 pasos, un throughput de 35.525,4 tokens por segundo y un pico de VRAM de 13.512 MB. No se especifica el numero total de tokens de entrenamiento, la composicion del corpus mas alla de WikiText-2, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en un modelo encoder de enmascarado).

## Capacidades

- Modelado de lenguaje enmascarado (prediccion de tokens `[MASK]`) en ingles.
- Clasificacion de texto por fine-tuning posterior (la tarea declarada es `fill-mask`, pero la arquitectura lo permite).
- Extraccion de representaciones contextuales para tareas downstream de NLP.
- Atencion subcuadratica orientada a reducir coste computacional en secuencias largas (segun la descripcion del autor).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Rellenado de huecos en textos tecnicos en ingles: uso directo del pipeline `fill-mask` para autocompletar terminos en documentacion o articulos, aprovechando el vocabulario de `bert-base-uncased`.
- Experimentacion academica con mecanismos de atencion subcuadratica: el modelo sirve como referencia para comparar `eat` frente a la atencion estandar de BERT en tareas controladas de MLM.
- Clasificacion de sentimiento o topicos tras fine-tuning: la arquitectura encoder permite anadir una cabeza de clasificacion y entrenar sobre datasets etiquetados (el nombre del repositorio sugiere un uso previsto en SST-2, aunque la model card no documenta ese fine-tuning).
- Extraccion de embeddings para busqueda semantica: las representaciones del `[CLS]` o el pooling medio pueden alimentar indices vectoriales en ingles.
- Destilacion como caso de estudio: util para investigadores que quieran reproducir o auditar el pipeline de tres etapas descrito por el autor y evaluar su robustez.
- Prototipado de bajo coste en GPU de consumo: el modelo cabe en una RTX 3090 con margen amplio (13,5 GB de pico durante el entrenamiento), lo que facilita experimentos locales.

## Benchmarks y rendimiento

Los unicos datos publicados son de la propia model card, medidos con pseudo-perplejidad determinista de MLM sobre WikiText-2 (15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision en token enmascarado | Delta vs baseline |
|---|---|---|---|
| BERT-base teacher (`bert-base-uncased`) | 6,84 | 68,42 % | referencia |
| Stage 0 (calibracion ridge en forma cerrada) | 0,00 | 91,63 % | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 91,40 % | -6,84 |

El valor de perplejidad `0.00` es anomalo y no debe interpretarse como una mejora real: una perplejidad nula implicaria certeza absoluta en la prediccion, algo imposible en un corpus natural. Es probable que la metrica se haya calculado de forma incorrecta (por ejemplo, aplicando `log` sobre probabilidades ya normalizadas o evaluando sobre el mismo conjunto de calibracion). No se han publicado resultados en benchmarks estandar (GLUE, SQuAD, MMLU, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repo (0,5 GB) y los aproximadamente 110 M de parametros, la inferencia en fp32 deberia caber en GPUs con 4-6 GB de VRAM.
- VRAM durante el entrenamiento/destilacion: 13.512 MB de pico en una RTX 3090 de 24 GB.
- GPU recomendadas: NVIDIA RTX 3090 o superior para reproducir el entrenamiento; cualquier GPU consumer moderna (RTX 3060 en adelante) para inferencia.
- Cabe en GPU consumer: si, con margen amplio.
- Opciones de despliegue: la model card documenta la API `neuralops.load_pretrained_bert` y el pipeline `fill-mask` de Hugging Face Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al requerir `custom_code` la compatibilidad con esos runners no esta garantizada.
- Latencia y throughput: 35.525,4 tokens por segundo durante el entrenamiento en RTX 3090; no se publican cifras de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-eat-sst2` | ~110 M (heredados) | no disponible (probablemente 512) | fill-mask | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` | ~110 M | 512 | fill-mask / encoder general | Apache 2.0 | Hugging Face, ampliamente soportado |
| `distilbert-base-uncased` | ~66 M | 512 | fill-mask / encoder general | Apache 2.0 | Hugging Face, ampliamente soportado |
| `google/electra-base-discriminator` | ~110 M | 512 | encoder general | Apache 2.0 | Hugging Face |

Frente a `bert-base-uncased`, la variante `eat` promete un coste de atencion menor, pero no hay benchmarks publicados que confirmen una ventaja en calidad o velocidad de inferencia. Frente a `distilbert-base-uncased`, el modelo aqui descrito no reduce parametros, solo cambia el mecanismo de atencion. La falta de soporte nativo en ecosistemas estandar (por el `custom_code`) es una desventaja practica frente a las alternativas de Google y Hugging Face.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- La perplejidad reportada de `0.00` es metodologicamente sospechosa y no debe usarse como evidencia de calidad.
- No se han publicado evaluaciones en benchmarks estandar, por lo que la calidad real del modelo es desconocida.
- Requiere `custom_code` y la libreria `neuralops`, lo que limita la portabilidad a frameworks y runners estandar.
- El autor no documenta sesgos especificos, pero al derivar de `bert-base-uncased` hereda los sesgos de su corpus de preentrenamiento (mayoritariamente ingles y web).
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; en tareas de `fill-mask` se manifiesta como predicciones plausibles pero incorrectas.
- La licencia MIT permite uso comercial, pero al derivar de `bert-base-uncased` conviene verificar la compatibilidad con la licencia Apache 2.0 del modelo base.
- El nombre del repositorio menciona `sst2`, pero la model card no documenta fine-tuning en SST-2; no debe asumirse que el modelo esta especializado en analisis de sentimiento.
- El modelo se creo en noviembre de 2026 y no tiene descargas ni likes, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-eat-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
