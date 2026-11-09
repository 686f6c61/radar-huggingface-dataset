# tahamajs/bert-cluster-attention-sst2

## Resumen

`tahamajs/bert-cluster-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de self-attention multi-cabeza estándar han sido sustituidas por el mecanismo `cluster_attention` de la librería NeuralOps, desarrollada por Taha Majlesi. El objetivo declarado es explorar mecanismos de atención subcuadrática dentro de la arquitectura BERT clásica, manteniendo el pipeline de `fill-mask` y el tokenizador originales.

El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilación de conocimiento en tres etapas (calibración ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits con LR diferencial), ejecutado durante 300 segundos en una NVIDIA RTX 3090. La model card reporta una perplejidad MLM de 0.00 y una precisión de token enmascarado del 91.74 %, valores que deben interpretarse con cautela por las razones que se detallan en la sección de limitaciones.

Se trata de un modelo de investigación con 0 descargas y 0 likes en el momento de redactar esta ficha, publicado bajo licencia MIT y orientado exclusivamente al inglés. Su interés es fundamentalmente experimental: sirve como referencia para estudiar la viabilidad de mecanismos de atención alternativos en BERT y para reproducir el pipeline de destilación de NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con 12 capas de `cluster_attention` (NeuralOps) en lugar de MHSA estándar |
| Parametros totales | no disponible (heredados de bert-base-uncased, ~110 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (por herencia de BERT-base, 512 tokens, no confirmado explícitamente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors / PyTorch (repo de 0.5 GB, `custom_code` requerido) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las 12 capas de atención multi-cabeza por `cluster_attention`, un mecanismo de atención subcuadrática procedente de la librería NeuralOps. No se especifican en la model card el tamaño exacto de los clústeres, la complejidad asintótica concreta ni el número de cabezas o dimensión de proyección del nuevo mecanismo. El tokenizador y el resto del encoder BERT se mantienen presumiblemente intactos, aunque el documento no lo detalla.

El entrenamiento consiste en una destilación de conocimiento sobre WikiText-2 con tres etapas: (1) calibración ridge en forma cerrada, (2) MSE/CKA de subespacio con backbone congelado y (3) KD de logits fusionada con learning rate diferencial. Se completaron 194 pasos en 300 segundos con un throughput de 33 306,8 tokens/s y un pico de VRAM de 8 487 MB en una RTX 3090. No se documentan el número total de tokens de entrenamiento, la composición exacta del dataset más allá de WikiText-2, ni si hubo RLHF/DPO (no aplicable en un modelo encoder de `fill-mask`).

## Capacidades

- Relleno de máscaras (`fill-mask`) en inglés sobre texto genérico.
- Codificación contextual de secuencias para tareas downstream tipo NLU (clasificación, NER, QA extractiva) previo fine-tuning.
- Extracción de representaciones ocultas por capa, útil para experimentos de probing y análisis de atención.
- No soporta tool calling ni function calling (no es un modelo instructivo ni generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.
- Mecanismo de atención subcuadrático, potencialmente más eficiente en cómputo que MHSA para secuencias largas (no cuantificado en la model card).

## Casos de uso

- Investigación sobre mecanismos de atención alternativos: permite comparar `cluster_attention` frente a MHSA estándar en la misma arquitectura BERT-base y el mismo tokenizador, aislando el efecto del mecanismo de atención en tareas de `fill-mask` y NLU.
- Reproducción del pipeline de destilación de NeuralOps: el modelo sirve como artefacto de referencia para validar la implementación de las tres etapas (ridge, CKA y KD de logits) descritas en la model card.
- Prototipado rápido de `fill-mask` en inglés: con la API de `transformers` o NeuralOps se puede integrar en scripts de autocompletado o corrección de texto para pruebas de concepto, siempre que se validen las salidas.
- Benchmarking de eficiencia de atención: al sustituir MHSA por un mecanismo subcuadrático, es útil para medir latencia y consumo de memoria frente a `bert-base-uncased` en secuencias de distinta longitud.
- Docencia y divulgación: ejemplo didáctico de cómo se reemplaza un componente de un transformer preentrenado y se redestila con un pipeline de KD.
- Base para fine-tuning en tareas NLU de dominio específico en inglés (clasificación de sentimientos, detección de tópicos) cuando se quiera evaluar el impacto del mecanismo de atención frente al BERT original.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son de perplejidad MLM determinista sobre WikiText-2 (15 % de tokens enmascarados, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision token enmascarado (%) | Delta vs baseline |
|---|---|---|---|
| BERT teacher (`bert-base-uncased`) | 6.84 | 68.42 | referencia |
| Stage 0 (ridge en forma cerrada) | 0.00 | 91.74 | -6.84 |
| Stage 2 (modelo destilado) | 0.00 | 91.74 | -6.84 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SQuAD, etc.) en la información disponible. Los valores de PPL 0.00 y la identidad exacta entre Stage 0 y Stage 2 son anómalos y deben tratarse con escepticismo (ver limitaciones).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (0.5 GB) y la arquitectura BERT-base, cabría esperar un consumo en fp32 de aproximadamente 0.5-1 GB, aunque no está confirmado.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en fp32; el entrenamiento reportado usó una RTX 3090 de 24 GB con un pico de 8 487 MB.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 2060, RTX 3060, RTX 4060 y superiores (no confirmado oficialmente).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo requiere `custom_code`), o la API de NeuralOps (`neuralops.load_pretrained_bert`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican métricas de inferencia; solo se reporta throughput de destilación (33 306,8 tokens/s) en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mecanismo de atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-cluster-attention-sst2` | ~110 M (heredado, no confirmado) | no disponible (512 por herencia) | cluster_attention (subcuadrática) | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` | 110 M | 512 | MHSA estándar | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased` | 66 M | 512 | MHSA estándar | Apache 2.0 | Hugging Face, ampliamente usado |
| `google/electra-base-discriminator` | 110 M | 512 | MHSA estándar | Apache 2.0 | Hugging Face |

No se dispone de benchmarks comparativos publicados entre este modelo y las alternativas; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Los valores reportados de MLM PPL 0.00 y la coincidencia exacta entre Stage 0 y Stage 2 sugieren un posible error de evaluación, fuga de información o un artefacto del pipeline; no deben tomarse como evidencia de rendimiento real sin replicación independiente.
- El nombre del repositorio incluye `sst2`, pero la model card no documenta ningún entrenamiento ni evaluación sobre SST-2; la única tarea descrita es `fill-mask` sobre WikiText-2.
- Modelo solo en inglés; no se ha evaluado su comportamiento en otros idiomas.
- Riesgo de alucinación y sesgos heredados de `bert-base-uncased` y de WikiText-2 (sesgos de género, raciales y de dominio presentes en el corpus).
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Licencia MIT permite uso comercial, pero al derivar de `bert-base-uncased` (Apache 2.0) conviene revisar las obligaciones de atribución de la licencia original.
- Sin descargas ni validación comunitaria: no hay evidencia de robustez en producción.
- No apto para tareas generativas, agentes, tool calling ni razonamiento multi-paso.
- No se documentan límites de contexto específicos del mecanismo `cluster_attention` ni su comportamiento más allá de 512 tokens.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-cluster-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
