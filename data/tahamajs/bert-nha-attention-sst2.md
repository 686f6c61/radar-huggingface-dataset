# tahamajs/bert-nha-attention-sst2

## Resumen

`tahamajs/bert-nha-attention-sst2` es una variante del modelo `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar han sido sustituidas por el mecanismo `nha_attention`, perteneciente a la libreria NeuralOps desarrollada por Taha Majlesi. El modelo se ha destilado sobre el corpus WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas ejecutado en una unica NVIDIA RTX 3090 durante 300 segundos. La tarea declarada es `fill-mask` (masked language modeling) y el idioma soportado es unicamente el ingles.

El interes tecnico del modelo reside en su caracter experimental: forma parte de un "attention zoo" de variantes de BERT con mecanismos de atencion subcuadraticos, orientado a estudiar el impacto de sustituir la atencion cuadratica clasica por alternativas mas eficientes en coste computacional. La destilacion se plantea como una calibracion rapida (5 minutos, 168 pasos) mas que como un reentrenamiento completo, lo que condiciona fuertemente la interpretacion de sus metricas.

Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026, con licencia MIT. No dispone de resultados en benchmarks estandar (MMLU, GLUE, SQuAD) y sus unicas metricas publicadas son de pseudo-perplejidad MLM sobre WikiText-2, que presentan valores anomalos (PPL de 0.00) y deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con 12 capas de atencion sustituidas por `nha_attention` (atencion subcuadratica) |
| Parametros totales | no disponible (el modelo base `bert-base-uncased` tiene 110 M, pero no se confirma el recuento tras la sustitucion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 512 tokens, no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.5 GB; la libreria declarada es `neuralops` con `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas, y reemplaza en todas ellas el mecanismo de self-attention multi-cabeza estandar por `nha_attention`, un mecanismo de atencion subcuadratica implementado en la libreria NeuralOps. El modelo requiere `custom_code`, por lo que no es cargable con un `AutoModel` estandar de Transformers sin la dependencia de NeuralOps. El autor lo enmarca en un "Pretrained BERT-131 Subquadratic Attention Zoo", es decir, una familia de variantes experimentales de BERT con distintos mecanismos de atencion eficiente.

El entrenamiento consiste en una destilacion de conocimiento sobre WikiText-2 con un curriculum de tres etapas: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (destilacion de logits fusionada con learning rate diferencial). La ejecucion completa duro 300 segundos en una RTX 3090 (24 GB), con 168 pasos, un throughput de 28 423,8 tokens/s y un pico de VRAM de 23 021 MB. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO (no procede en un modelo encoder de MLM).

## Capacidades

- Generacion de predicciones de token enmascarado (masked language modeling) en ingles.
- Relleno de huecos (`fill-mask`) mediante el pipeline de Transformers o la API de NeuralOps.
- Extraccion de representaciones contextuales de texto en ingles (uso como encoder).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo ingles.
- No se documenta vision, audio ni modo "thinking".
- No se documenta capacidad de generacion autoregresiva (es un encoder, no un decoder).

## Casos de uso

- Experimentacion academica con mecanismos de atencion subcuadraticos: el modelo sirve como punto de comparacion frente a `bert-base-uncased` para medir el efecto de `nha_attention` en tareas de MLM, siempre que se validen las metricas con un protocolo independiente.
- Relleno de huecos en textos tecnicos en ingles: uso directo del pipeline `fill-mask` para autocompletar terminos en documentacion o frases de prueba, dado que el modelo esta ajustado sobre WikiText-2.
- Base para destilacion adicional: al ser un encoder ya destilado, puede emplearse como inicializacion en pipelines de destilacion propios con NeuralOps.
- Prototipado de pipelines de la libreria NeuralOps: sirve para validar la integracion de `nha_attention` en flujos de carga, inferencia y evaluacion antes de escalar a modelos mayores.
- Extraccion de embeddings para clasificacion de texto en ingles: las representaciones del encoder pueden alimentar clasificadores ligeros, aunque sin benchmarks supervisados publicados el rendimiento es incierto.
- Reproducibilidad de experimentos de atencion eficiente: el modelo permite reproducir el curriculum de destilacion descrito (Stage 0 a Stage 2) en hardware consumer (RTX 3090) en menos de 10 minutos.
- Evaluacion comparativa de perplejidad MLM: util como sujeto de prueba en estudios sobre protocolos de evaluacion de MLM, dado que las metricas publicadas presentan valores atipicos que requieren verificacion.

## Benchmarks y rendimiento

Los unicos datos publicados son de pseudo-perplejidad MLM determinista sobre WikiText-2 (15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision en tokens enmascarados (%) | Delta vs baseline |
|---|---|---|---|
| BERT base original (`bert-base-uncased`) | 6.84 | 68.42 | referencia |
| Stage 0 (calibracion ridge en forma cerrada) | 0.00 | 91.86 | -6.84 |
| Stage 2 (modelo destilado final) | 0.00 | 92.66 | -6.84 |

No se han publicado resultados en benchmarks estandar (MMLU, GLUE, SQuAD, HumanEval, GSM8K) en la informacion disponible. Los valores de PPL de 0.00 son anomalos y no son comparables con protocolos de evaluacion estandar; deben tratarse como no validados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo ocupa 0.5 GB y el modelo base BERT-base en fp32 requiere aproximadamente 0.44 GB de pesos, mas overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en fp32; el entrenamiento documentado se ejecuto en una NVIDIA RTX 3090 con 23 021 MB de pico.
- Cabe en GPU consumer: si, practicamente cualquier GPU consumer moderna (GTX 1060 6 GB en adelante) para inferencia; para el pipeline de destilacion completo se documento una RTX 3090.
- Opciones de despliegue: la via documentada es la libreria `neuralops` (API `load_pretrained_bert`) o el pipeline `fill-mask` de Transformers con `custom_code`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en destilacion se reportan 28 423,8 tokens/s en RTX 3090; no se publican cifras de latencia ni throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-nha-attention-sst2` | no disponible (base 110 M) | no disponible | fill-mask | MIT | Hugging Face, requiere `custom_code` |
| `google-bert/bert-base-uncased` | 110 M | 512 | fill-mask / encoder | Apache 2.0 | Hugging Face, Transformers estandar |
| `distilbert-base-uncased` | 66 M | 512 | fill-mask / encoder | Apache 2.0 | Hugging Face, Transformers estandar |
| `roberta-base` | 125 M | 512 | fill-mask / encoder | MIT | Hugging Face, Transformers estandar |

La comparacion de rendimiento con estas alternativas no esta disponible: el modelo no publica resultados en benchmarks estandar y sus metricas de PPL no son directamente comparables con los protocolos habituales de evaluacion de MLM.

## Limitaciones y advertencias

- Las metricas publicadas (PPL de 0.00) son anomalas y no han sido validadas con benchmarks estandar; no deben usarse como evidencia de rendimiento superior al modelo base.
- El modelo solo soporta ingles.
- Requiere `custom_code` y la libreria `neuralops`; no es compatible con un `AutoModel` estandar sin dependencias adicionales.
- No se documenta la longitud de contexto efectiva tras la sustitucion de atencion; asumir 512 tokens sin confirmacion es arriesgado.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado por el autor.
- Modelo de investigacion con cero descargas y cero likes: sin validacion por parte de la comunidad.
- La licencia MIT permite uso comercial, pero la ausencia de benchmarks supervisados y de evaluacion de sesgos hace desaconsejable su uso en produccion sin validacion propia.
- El ajuste se limita a WikiText-2; el dominio y la distribucion de datos de entrenamiento son estrechos.
- El nombre del repositorio incluye `sst2`, pero no se documenta ningun ajuste sobre el dataset SST-2 en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-nha-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
