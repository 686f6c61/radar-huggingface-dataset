# tahamajs/bert-bam-umoe-sst2

## Resumen

`tahamajs/bert-bam-umoe-sst2` es una variante de `google-bert/bert-base-uncased` en la que las doce capas de atención multi-cabeza estándar se han sustituido por el mecanismo `bam_umoe`, perteneciente a la librería NeuralOps desarrollada por Taha Majlesi. El modelo se distribuye como checkpoint de tipo fill-mask y se ha destilado sobre WikiText-2 mediante un pipeline de destilación de conocimiento en tres etapas ejecutado en una única NVIDIA RTX 3090 durante 300 segundos (211 pasos).

La relevancia del artefacto es fundamentalmente metodológica: sirve como demostración reproducible de cómo reemplazar la atención cuadrática de un transformer BERT por un mecanismo subcuadrático manteniendo (según el autor) la funcionalidad de enmascarado de tokens. No obstante, los resultados reportados presentan inconsistencias graves —perplejidad de 0.00 en las etapas 0 y 2— que impiden tratar las cifras como evidencia de calidad del modelo.

El repositorio ocupa 0,4 GB, está etiquetado con licencia MIT e idioma inglés, y no registra descargas ni interacciones en el momento de la consulta. Requiere la librería `neuralops` y `trust_remote_code` para cargarse, ya que emplea código personalizado no integrado en `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención sustituida por `bam_umoe` (subcuadrática) |
| Parametros totales | no disponible (hereda la topología de `bert-base-uncased`, ~110 M, no confirmado por el autor) |
| Parametros activos | no disponible (la nomenclatura `umoe` sugiere mezcla de expertos, pero no se documenta) |
| Longitud de contexto | no disponible (BERT-base original: 512 tokens; no confirmado para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,4 GB; probablemente safetensors o PyTorch binario, no especificado) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las 12 capas de self-attention multi-cabeza por el mecanismo `bam_umoe` de NeuralOps. El autor describe este mecanismo como de atención subcuadrática, aunque no se detalla en la model card su formulación matemática, el número de expertos ni el esquema de enrutamiento que sugiere el sufijo `umoe`. Tampoco se especifica si el cambio altera el número de parámetros respecto al modelo base.

El entrenamiento consiste en una destilación de conocimiento sobre WikiText-2 con un currículo de tres etapas: Stage 0 (calibración ridge en forma cerrada), Stage 1 (MSE/CKA de subespacio con backbone congelado) y Stage 2 (destilación de logits fusionada con LR diferencial). La ejecución completa duró 300 segundos en una RTX 3090 (24 GB), con 211 pasos, throughput de 34 782 tokens/s y un pico de VRAM de 8487 MB. No se documentan el número total de tokens procesados, la composición exacta del dataset ni si hubo fases de RLHF o DPO (poco habituales en un modelo encoder de este tipo).

## Capacidades

- Enmascarado de tokens (fill-mask) en inglés, tarea declarada en el pipeline del repositorio.
- Codificación contextual de texto para tareas downstream derivadas de BERT (clasificación, NER, QA extractiva), siempre que el reemplazo de atención preserve la semántica, extremo no verificado de forma independiente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Experimentación académica con mecanismos de atención subcuadráticos: el checkpoint permite comparar el comportamiento de `bam_umoe` frente a la atención estándar de BERT en una tarea controlada (fill-mask sobre WikiText-2), reutilizando el pipeline de destilación del autor.
- Prototipado de pipelines de destilación de conocimiento: sirve como referencia reproducible de un currículo en tres etapas con telemetría de hardware publicada (300 s, 211 pasos, 8,5 GB de VRAM), útil para calibrar presupuestos de cómputo en entornos de una sola GPU.
- Docencia sobre arquitecturas transformer: permite ilustrar la sustitución de bloques de atención y el uso de `trust_remote_code` en la carga de modelos con código personalizado.
- Investigación en eficiencia de atención: punto de partida para medir empíricamente si un mecanismo subcuadrático mantiene la calidad de representación en tareas de enmascarado, con la salvedad de que las métricas publicadas no son fiables.
- Integración en la librería NeuralOps: caso de prueba del ecosistema `attention-zoo` para validar la API `neuralops.load_pretrained_bert` y el flujo de carga desde el Hub.
- Baseline negativo en evaluación de modelos: útil para estudiar cómo detectar artefactos en métricas de destilación (perplejidad nula, divergencia entre accuracy y PPL) antes de desplegar un checkpoint en producción.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, sobre WikiText-2 con enmascarado del 15 % de tokens y `seed=42`:

| Fase de evaluacion | MLM Perplexity | Masked Token Acc (%) | Delta vs baseline |
|---|---:|---:|---:|
| BERT-base teacher (`bert-base-uncased`) | 6,84 | 68,42 % | referencia |
| Stage 0 (calibración ridge en forma cerrada) | 0,00 | 52,06 % | -6,84 |
| Stage 2 (modelo destilado) | 0,00 | 88,88 % | -6,84 |

Advertencia: una perplejidad de 0,00 es matemáticamente incompatible con un modelo de lenguaje probabilístico sobre vocabulario abierto y apunta a un error de cálculo, a una fuga de la máscara en la evaluación o a una métrica mal implementada. La accuracy de 88,88 % con PPL nula refuerza la sospecha de artefacto. No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SQuAD, HumanEval) en la información disponible, por lo que no es posible comparar el rendimiento real con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el tamaño del repo (0,4 GB) sugiere que el checkpoint en fp32 rondaría los 0,4-0,5 GB, por lo que cabría en GPUs consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en fp32; el autor usó una RTX 3090 para el entrenamiento.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y equivalentes, aunque no se han publicado mediciones de latencia.
- Opciones de despliegue: la vía documentada es la librería `neuralops` o `transformers` con `trust_remote_code=True`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el código personalizado de atención probablemente impida su uso directo en esos motores.
- Latencia y throughput: solo se publica throughput de entrenamiento (34 782 tokens/s en RTX 3090); no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-bam-umoe-sst2` | no disponible (~110 M heredados) | no disponible | fill-mask | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` | ~110 M | 512 | fill-mask / encoder | Apache 2.0 | Hugging Face, `transformers` estándar |
| `distilbert-base-uncased` | ~66 M | 512 | fill-mask / encoder | Apache 2.0 | Hugging Face, `transformers` estándar |
| `google/electra-base-discriminator` | ~110 M | 512 | encoder / discriminador | Apache 2.0 | Hugging Face, `transformers` estándar |

La comparación de rendimiento no es posible: el modelo evaluado no publica métricas fiables y los alternativos sí cuentan con evaluaciones estándar en GLUE y SQuAD. La ventaja diferencial del checkpoint es exclusivamente la experimentación con atención subcuadrática; en madurez, tooling y verificabilidad, los modelos de Google quedan muy por delante.

## Limitaciones y advertencias

- Métricas no fiables: la perplejidad de 0,00 reportada en las etapas 0 y 2 es inconsistente con un modelo de lenguaje y sugiere un fallo de evaluación o de implementación; no debe usarse como indicador de calidad.
- Sin validación independiente: cero descargas y cero likes en el Hub, sin revisión por pares ni evaluaciones externas.
- Dependencia de código personalizado: requiere `neuralops` y `trust_remote_code=True`, lo que implica ejecutar código de un autor no verificado y complica la auditoría de seguridad.
- Idiomas: solo inglés; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Contexto: no se confirma la ventana de 512 tokens del BERT original ni el comportamiento del mecanismo subcuadrático más allá de esa longitud.
- Sesgos: hereda los sesgos de `bert-base-uncased` y de WikiText-2 (texto enciclopédico en inglés, sobrerrepresentación de ciertos dominios), sin que el autor documente mitigaciones.
- Alucinación: en tareas de fill-mask el riesgo se manifiesta como predicciones plausibles pero incorrectas; la accuracy reportada no es verificable.
- Licencia MIT: permite uso comercial, pero la licencia del modelo base (Apache 2.0) y la del código NeuralOps deben verificarse por separado antes de producción.
- Producción: no recomendado para despliegues reales sin una reevaluación completa en el dominio objetivo y sin resolver las inconsistencias métricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-bam-umoe-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
