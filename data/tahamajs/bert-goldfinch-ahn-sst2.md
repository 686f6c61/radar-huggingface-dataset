# tahamajs/bert-goldfinch-ahn-sst2

## Resumen

BERT-goldfinch-ahn-sst2 es una variante del modelo `bert-base-uncased` de Google en la que las doce capas de atencion multi-cabeza estandar se han sustituido por el mecanismo `goldfinch_ahn`, una atencion subcuadratica implementada en la libreria NeuralOps. El autor es Taha Majlesi (usuario `tahamajs`) y el modelo se distribuye bajo licencia MIT. El objetivo declarado es servir como banco de pruebas de mecanismos de atencion eficientes dentro del "Attention Zoo" de NeuralOps, no como un modelo de produccion.

El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas ejecutado durante 300 segundos en una NVIDIA RTX 3090. La tarea declarada es `fill-mask` (masked language modeling) y el unico idioma soportado es el ingles.

Su relevancia es fundamentalmente metodologica: demuestra el flujo de sustitucion de atencion y destilacion de NeuralOps, pero los resultados publicados (perplejidad de 0.00 y precision del 49.08 %, por debajo del 68.42 % del profesor original) indican que el modelo destilado no supera al BERT base y presenta artefactos de evaluacion que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion subcuadratica `goldfinch_ahn` en las 12 capas |
| Parametros totales | no disponible (hereda la estructura de `bert-base-uncased`, ~110 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | pesos PyTorch (`pytorch`), con `custom_code` para el mecanismo de atencion; tamano del repo 0.5 GB |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las doce capas de self-attention multi-cabeza por el mecanismo `goldfinch_ahn`, una atencion subcuadratica de la libreria NeuralOps. El resto del backbone BERT (embeddings, feed-forward, normalizacion) se mantiene. La carga requiere `trust_remote_code` o la API de NeuralOps, ya que el mecanismo de atencion no es nativo de Transformers.

El entrenamiento consistio en una destilacion de conocimiento sobre WikiText-2 con un curriculum de tres etapas: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (KD de logits fusionada con learning rate diferencial). Se completaron 268 pasos en 300 segundos, con un throughput de 45 517,8 tokens/s y un pico de VRAM de 23 021 MB en una RTX 3090. No se documenta el numero total de tokens de entrenamiento, la composicion del dataset mas alla de WikiText-2, ni si hubo RLHF o DPO (no aplicable a un modelo encoder de fill-mask).

## Capacidades

- Relleno de mascaras (masked language modeling) en ingles, unica tarea declarada en el pipeline.
- Generacion de representaciones contextuales de tokens para tareas downstream de comprension del lenguaje (clasificacion, NER, QA extractiva) tras fine-tuning.
- Sustitucion de atencion subcuadratica: el mecanismo `goldfinch_ahn` esta pensado para reducir el coste computacional de la atencion frente a la atencion cuadratica estandar.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue: limitada al ingles segun la model card.

## Casos de uso

- Investigacion sobre atencion eficiente: sirve como referencia para comparar el mecanismo `goldfinch_ahn` frente a la atencion estandar de BERT en tareas de fill-mask, midiendo perplejidad y precision de tokens enmascarados sobre WikiText-2.
- Prototipado de pipelines de destilacion: el modelo ilustra el flujo de tres etapas de NeuralOps y puede reutilizarse como plantilla para destilar otros mecanismos de atencion sobre BERT.
- Experimentos academicos de sustitucion de atencion: permite evaluar el impacto de reemplazar las doce capas de atencion sin reentrenar el backbone completo, gracias al curriculum con backbone congelado.
- Extraccion de caracteristicas para clasificacion de texto en ingles: tras fine-tuning supervisado, las representaciones del encoder pueden alimentar clasificadores de sentimiento o topicos, aunque con precision inferior al BERT base segun los datos publicados.
- Banco de pruebas de la libreria NeuralOps: valida la API `neuralops.load_pretrained_bert` y la integracion con el Hub de Hugging Face.
- Docencia y divulgacion: ejemplo didactico de como se sustituye un mecanismo de atencion y se destila un modelo en menos de cinco minutos en una GPU de consumo.

## Benchmarks y rendimiento

Evaluacion determinista de MLM pseudo-perplejidad sobre WikiText-2 (15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision de token enmascarado (%) | Delta vs baseline |
|---|---|---|---|
| BERT base profesor (`bert-base-uncased`) | 6.84 | 68.42 | referencia |
| Stage 0 (calibracion ridge en forma cerrada) | 0.00 | 49.08 | -6.84 |
| Stage 2 (modelo destilado tras KD) | 0.00 | 49.08 | -6.84 |

Advertencia: una perplejidad de 0.00 es un artefacto de evaluacion (probablemente por saturacion de logits o un error en el calculo), no un resultado valido. La precision de token enmascarado del modelo destilado (49.08 %) es sustancialmente inferior a la del profesor (68.42 %). No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico de entrenamiento fue de 23 021 MB en una RTX 3090; la inferencia en fp32 de un BERT-base ronda los 0.5-1 GB, pero el mecanismo `goldfinch_ahn` puede incrementar el uso de memoria y no se documenta la cifra exacta de inferencia.
- GPU recomendadas: NVIDIA RTX 3090 (validada en entrenamiento); cualquier GPU con al menos 1-2 GB de VRAM libre deberia poder ejecutar la inferencia en fp32, aunque no esta confirmado.
- Cabe en GPU de consumo: si, previsiblemente en GTX 1060 6 GB, RTX 2060, RTX 3060 y superiores; no confirmado por el autor.
- Opciones de despliegue: `transformers` con `trust_remote_code` o la API `neuralops.load_pretrained_bert`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (el modelo es un encoder BERT, no un modelo generativo).
- Latencia y throughput: 45 517,8 tokens/s en entrenamiento con batch saturante en RTX 3090; no se publica throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| tahamajs/bert-goldfinch-ahn-sst2 | ~110 M (heredado, no confirmado) | no disponible | fill-mask | MIT | Atencion subcuadratica `goldfinch_ahn`, destilado en 300 s |
| google-bert/bert-base-uncased | ~110 M | 512 tokens | fill-mask / encoder | Apache 2.0 | Profesor original, atencion cuadratica estandar, PPL 6.84 en la evaluacion del autor |
| Modelos BERT con atencion eficiente (p. ej. Linformer, Performer) | ~110 M | variable | encoder | segun variante | Alternativas academicas de atencion subcuadratica; no se dispone de comparacion directa en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria mas alla del profesor original.

## Limitaciones y advertencias

- Los resultados publicados muestran una precision de token enmascarado del 49.08 %, muy por debajo del 68.42 % del BERT base; el modelo destilado degrada la calidad respecto al profesor.
- La perplejidad reportada de 0.00 es un artefacto de evaluacion y no debe interpretarse como rendimiento real; invalida la comparacion directa de PPL.
- Solo soporta ingles; no se documenta capacidad multilingue.
- No se documenta la longitud de contexto efectiva del mecanismo `goldfinch_ahn`; se desconoce si mantiene los 512 tokens de BERT base.
- Requiere `trust_remote_code` o la libreria NeuralOps para cargar el mecanismo de atencion personalizado, lo que anade dependencia de codigo de terceros.
- Riesgo de alucinacion y sesgos: no evaluado por el autor; al ser un encoder de fill-mask, el riesgo se manifiesta como predicciones de mascara sesgadas o incorrectas.
- Licencia MIT permite uso comercial, pero la ausencia de evaluacion en tareas downstream y la degradacion observada desaconsejan su uso en produccion sin validacion adicional.
- El modelo tiene 0 descargas y 0 likes en el Hub en el momento de la consulta, lo que sugiere ausencia de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-goldfinch-ahn-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
