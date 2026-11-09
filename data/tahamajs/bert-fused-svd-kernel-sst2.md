# tahamajs/bert-fused-svd-kernel-sst2

## Resumen

`tahamajs/bert-fused-svd-kernel-sst2` es una variante del modelo `google-bert/bert-base-uncased` en la que se han sustituido las 12 capas de atencion multi-cabeza estandar por el mecanismo `fused_svd_kernel`, perteneciente a la libreria NeuralOps desarrollada por Taha Majlesi. El modelo se distribuye como parte de un "attention zoo" de BERT con mecanismos de atencion subcuadraticos y se ha destilado sobre el conjunto de datos WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas que, segun la model card, se ejecuto en 300 segundos sobre una NVIDIA RTX 3090.

El objetivo declarado es explorar alternativas computacionalmente mas eficientes a la atencion cuadratica clasica en arquitecturas tipo BERT, manteniendo la funcionalidad de modelado de lenguaje enmascarado (fill-mask). El modelo conserva la arquitectura base de BERT-base (12 capas, 768 dimensiones ocultas, aproximadamente 110 millones de parametros, segun la configuracion estandar del modelo base) y se publica bajo licencia MIT.

Su relevancia es fundamentalmente experimental y de investigacion: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, orientado a quien quiera evaluar mecanismos de atencion alternativos dentro del ecosistema NeuralOps, no a un uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT con atencion `fused_svd_kernel` (sustituye las 12 capas de atencion multi-cabeza estandar) |
| Parametros totales | Aproximadamente 110 M (heredados de `bert-base-uncased`; no se especifica un recuento exacto en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base admite 512 tokens, pero la model card no lo declara explicitamente) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | No disponible (repo de 0,5 GB; la libreria declarada es `neuralops` con `custom_code`, se asume pesos PyTorch, sin confirmar safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las 12 capas de self-attention multi-cabeza por el mecanismo `fused_svd_kernel` de NeuralOps, descrito por el autor como un mecanismo de atencion subcuadratico. No se detalla en la model card la formulacion matematica del kernel ni su complejidad asintotica exacta. El modelo se enmarca dentro de un "BERT-131 Subquadratic Attention Zoo", es decir, una coleccion de variantes de BERT con distintos mecanismos de atencion.

El entrenamiento consiste en una destilacion de conocimiento sobre WikiText-2 con un curriculum de tres etapas: Stage 0 (calibracion ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (destilacion de logits fusionada con learning rate diferencial). Segun la telemetria del autor, el proceso completo duro 300 segundos (276 pasos) en una RTX 3090 de 24 GB, con un throughput de 44.992,8 tokens por segundo y un pico de VRAM de 13.512 MB. No se indica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de WikiText-2.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) en ingles.
- Generacion de representaciones contextuales de tokens para tareas downstream de NLP (clasificacion, NER, QA extractiva) previo fine-tuning.
- Inferencia con mecanismo de atencion subcuadratico `fused_svd_kernel`, potencialmente mas eficiente en coste computacional que la atencion cuadratica estandar (no se aportan mediciones de latencia o memoria que lo confirmen).
- Compatibilidad con la API de alto nivel de NeuralOps (`neuralops.load_pretrained_bert`) y con el pipeline `fill-mask` de Hugging Face Transformers.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo encoder-only de MLM, no orientado a generacion).
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre mecanismos de atencion eficiente: el modelo sirve como banco de pruebas para comparar `fused_svd_kernel` frente a atencion estandar en tareas de MLM, midiendo perplejidad y precision de token enmascarado sobre WikiText-2 con el protocolo determinista descrito (15 % de mascaras, `seed=42`).
- Experimentos de destilacion de conocimiento: el pipeline de tres etapas (ridge, subespacio y logits) puede replicarse o adaptarse a otros mecanismos del attention zoo de NeuralOps, usando este checkpoint como referencia.
- Prototipado rapido de tareas de relleno de huecos en ingles: mediante `pipeline("fill-mask")` se puede integrar en demos de autocompletado o correccion de texto en entornos de investigacion.
- Extraccion de embeddings para clasificacion de texto: al conservar la estructura encoder de BERT-base, puede fine-tunearse para tareas de clasificacion con datasets etiquetados, aunque requiere validacion previa dado el caracter experimental del checkpoint.
- Benchmarking de eficiencia en hardware consumer: con un pico de 13,5 GB de VRAM durante el entrenamiento y un tamano de repo de 0,5 GB, es viable ejecutar inferencia en GPUs consumer de gama media-alta para comparar throughput frente a BERT-base estandar.
- Docencia y divulgacion: ilustra de forma practica como se sustituye un componente arquitectonico (atencion) en un transformer preentrenado y como se evalua el impacto con metricas de MLM.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son de evaluacion de MLM sobre WikiText-2 (15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | Perplejidad MLM | Precision de token enmascarado (%) | Delta vs baseline |
|---|---|---|---|
| BERT-base profesor (`bert-base-uncased`) | 6,84 | 68,42 | Referencia |
| Stage 0 (calibracion ridge en forma cerrada) | 0,00 | 69,84 | -6,84 |
| Stage 2 (modelo destilado tras KD) | 0,00 | 90,71 | -6,84 |

Advertencia: los valores de perplejidad de 0,00 son anomalos y no son comparables con resultados estandar de la literatura; sugieren un posible fallo de calculo o de protocolo de evaluacion (por ejemplo, fuga de informacion o un bug en la metrica). No se han publicado resultados en benchmarks estandar como MMLU, GLUE, SQuAD o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el entrenamiento requirio un pico de 13.512 MB en una RTX 3090; la inferencia en precision completa de un modelo de aproximadamente 110 M de parametros suele requerir entre 1 y 2 GB, pero este dato no lo aporta el autor.
- GPU recomendadas: el autor cita NVIDIA RTX 3090 (24 GB) para el entrenamiento. No se especifican recomendaciones para inferencia.
- Cabe en GPU consumer: previsiblemente si (modelo de aproximadamente 110 M de parametros), aunque no hay confirmacion oficial ni mediciones de inferencia.
- Opciones de despliegue: API `neuralops` (recomendada por el autor), pipeline `fill-mask` de Transformers, y potencialmente vLLM, llama.cpp, Ollama o TGI (no confirmado; al usar `custom_code` y la libreria `neuralops`, la compatibilidad con estos motores no esta garantizada).
- Latencia y throughput: durante el entrenamiento se reportan 44.992,8 tokens/s en una RTX 3090; no se aportan datos de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mecanismo de atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-fused-svd-kernel-sst2` | Aproximadamente 110 M | No disponible | `fused_svd_kernel` (subcuadratico) | MIT | Hugging Face (0 descargas) |
| `google-bert/bert-base-uncased` | 110 M | 512 tokens | Self-attention estandar | Apache 2.0 | Hugging Face (ampliamente usado) |
| `distilbert-base-uncased` | 66 M | 512 tokens | Self-attention estandar | Apache 2.0 | Hugging Face (ampliamente usado) |

No se dispone de datos de rendimiento comparables en benchmarks estandar para establecer una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes: no ha sido validado por la comunidad ni cuenta con evidencia independiente de calidad.
- Resultados de perplejidad de 0,00 en la evaluacion MLM: metricamente implausibles, lo que sugiere un error en el protocolo de evaluacion o en el calculo de la metrica. No deben tomarse como indicativo de rendimiento real.
- Solo soporta ingles; no hay capacidades multilingues.
- Arquitectura encoder-only: no genera texto de forma autoregresiva ni soporta razonamiento multi-paso o tool calling.
- Dependencia de la libreria `neuralops` y de `custom_code`: puede requerir pasos adicionales de instalacion y no ser compatible directamente con motores de inferencia estandar como vLLM o llama.cpp.
- Licencia MIT: permite uso comercial, pero al derivar de `bert-base-uncased` (Apache 2.0) conviene revisar las obligaciones de atribucion de la licencia del modelo base.
- Riesgo de alucinacion y sesgos: no evaluado por el autor; al ser un MLM, el riesgo se manifiesta como predicciones de mascara sesgadas o incorrectas.
- No se especifican limitaciones de contexto mas alla de las heredadas del modelo base, ni se documenta el impacto del mecanismo subcuadratico en la calidad en secuencias largas.
- La fecha de creacion indicada (2026-11-09) es futura respecto a la mayoria de referencias disponibles; conviene verificar la vigencia y el estado del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-fused-svd-kernel-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
