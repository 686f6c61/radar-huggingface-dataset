# tahamajs/bert-comp-faq-quantizer-sst2

## Resumen

`tahamajs/bert-comp-faq-quantizer-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado en GLUE SST-2 y comprimido mediante el motor `faq_quantizer` (Feature-Activation-Aware Quantization) de la librería NeuralOps, desarrollada por Taha Majlesi. El modelo se publica como parte del "Compressor Zoo" de NeuralOps, un conjunto de artefactos destinados a demostrar técnicas de compresión de modelos y recuperación mediante LoRA sobre arquitecturas transformer estándar.

La relevancia del modelo es fundamentalmente metodológica, no de rendimiento: sirve como referencia reproducible de cómo un pipeline de cuantización consciente de activaciones degrada la precisión de una tarea downstream (SST-2) y cómo se documenta ese compromiso. El checkpoint serializado corresponde al rank `k=32`, aunque la evaluación multi-rank publicada muestra resultados idénticos para `k=256, 128, 64 y 32`, lo que sugiere que el efecto de compresión física es marginal en esta configuración.

Arquitectónicamente es un BERT-Base estándar (12 capas, dimensión oculta 768, 109.483.778 parámetros) con la particularidad de que el estado serializado contiene buffers de cuantización y factores de bajo rango "horneados". La licencia es MIT y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, D=768 |
| Parametros totales | 109.483.778 (base); 112.137.986 (checkpoint comprimido serializado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT-Base estandar: 512 tokens) |
| Tipos de cuantizacion | `faq_quantizer` (Feature-Activation-Aware Quantization, cuantizacion channel-wise guiada por estadisticas de activacion) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), `config.json`, `compression_summary.json` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros, preentrenado de forma estándar y posteriormente afinado en la tarea de clasificación de sentimiento GLUE SST-2 (2 etiquetas). Sobre ese checkpoint se aplica el compresor `FAQQuantizer`, que recoge estadísticas de activación para escalar los pasos de cuantización por canal y minimizar la distorsión de reconstrucción ponderada por activación.

La evaluación multi-rank documentada (`k=256, 128, 64, 32`) se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de SST-2 (872 muestras). El pipeline de NeuralOps aplica "LoRA healing" con `r=8`, 50 pasos y `lr=2e-4` (presupuesto de 45 s) cuando la compresión zero-shot degrada la precisión más de un 2,0 % con una reducción superior a 1,10x; en este caso, la columna "Healed Acc" coincide con la zero-shot (76,03 %), lo que indica que el healing no aportó mejora medible o no se activó. El checkpoint publicado corresponde al rank `k=32` y tiene `LoRA Recovery Applied: False`.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, formato SST-2.
- Generación de logits de clasificación para dos clases mediante `BertForSequenceClassification`.
- Inferencia estándar de BERT-Base (encoder bidireccional) sobre secuencias tokenizadas con el vocabulario `bert-base-uncased`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No soporta agentes, ni visión, ni audio, ni modo "thinking".
- Capacidades multilingües: no disponibles; solo inglés.
- Reconstrucción del grafo comprimido requiere la librería `neuralops` (import `neuralops.core.compression_pipeline`).

## Casos de uso

- **Clasificación de sentimiento en pipelines de análisis de opiniones**: el modelo devuelve logits de 2 clases para reseñas o comentarios en inglés; su tamaño reducido (repo de 0,2 GB) permite desplegarlo en entornos con poca memoria.
- **Referencia reproducible para investigación en compresión**: sirve como punto de comparación para medir el impacto de `FAQQuantizer` frente al baseline docente (91,63 % de accuracy en SST-2) en experimentos de cuantización consciente de activaciones.
- **Docencia y demostración de técnicas de compresión**: el artefacto incluye `compression_summary.json` con telemetría multi-rank, útil para ilustrar curvas de compromiso precisión/compresión en cursos o tutoriales.
- **Componente de un clasificador de dos etapas**: puede usarse como filtro rápido de polaridad antes de un modelo generativo mayor, reduciendo coste computacional en preprocesado de textos en inglés.
- **Validación de pipelines de reconstrucción**: el `Quick Start` de la model card permite verificar que un entorno con `neuralops` + `transformers` reconstruye correctamente el grafo comprimido y carga el state dict con `strict=False`.
- **Test de integración en CI para la librería NeuralOps**: al ser un checkpoint pequeño y con métrica declarada, es adecuado como caso de prueba end-to-end de compresión, serialización y carga.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Modelo / configuracion | Dataset | Split | Accuracy |
|---|---|---|---|
| BERT-Base docente (baseline) | GLUE SST-2 | validation | 91,63 % |
| `bert-comp-faq-quantizer-sst2` (k=32, checkpoint publicado) | GLUE SST-2 | validation | 76,03 % |
| `bert-comp-faq-quantizer-sst2` (k=256, 128, 64) | GLUE SST-2 | validation | 76,03 % |

Delta de paridad frente al docente: -15,60 puntos porcentuales. La evaluación se realizó sobre 872 muestras del split de validación en una RTX 3090. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint pesa aproximadamente 214 MB en `pytorch_model.bin`; la inferencia en fp32 requiere del orden de 0,5-1 GB de VRAM incluyendo activaciones para batches pequeños.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM; validado por el autor en NVIDIA GeForce RTX 3090 (24 GB).
- **Consumer GPU**: sí, cabe holgadamente en GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090 y similares.
- **Opciones de despliegue**: `transformers` + `neuralops` (reconstrucción del grafo comprimido); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- **Latencia y throughput**: no disponibles en la información proporcionada; el autor documenta un presupuesto de 45 s para el paso de LoRA healing, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-faq-quantizer-sst2` | 112.137.986 (comprimido) | no disponible | 76,03 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (docente) | 109.483.778 | 512 | 91,63 % (segun el autor) | Apache 2.0 | Hugging Face |
| BERT-Base afinado en SST-2 (referencia habitual) | ~110 M | 512 | no disponible en esta busqueda | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y al docente declarado por el autor; no se dispone de datos verificados de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- **Degradación severa de precisión**: 76,03 % frente al 91,63 % del docente, una caída de 15,60 puntos. No es apto para producción sin reentrenamiento o ajuste posterior.
- **Compresión prácticamente nula**: el ratio físico es 0,98x con una reducción del 2,42 % de parámetros; el checkpoint comprimido tiene más parámetros que el base (112,1 M frente a 109,5 M), lo que sugiere que los buffers de cuantización añaden overhead.
- **Resultados idénticos entre ranks**: `k=256, 128, 64 y 32` producen exactamente la misma accuracy (76,03 %), lo que plantea dudas sobre la sensibilidad real del pipeline a `k` en esta configuración.
- **LoRA healing no aplicado**: la model card indica `LoRA Recovery Applied: False` pese a la caída superior al umbral del 2,0 %.
- **Idioma**: solo inglés; no se ha evaluado en otros idiomas.
- **Tarea única**: clasificador binario de sentimiento; no sirve para generación, razonamiento ni otras tareas.
- **Riesgo de sesgos y alucinación**: hereda los sesgos de `bert-base-uncased` y de SST-2 (reseñas de películas); no es un modelo generativo, por lo que el riesgo de alucinación se manifiesta como clasificaciones erróneas en dominios fuera de distribución.
- **Dependencia de la librería `neuralops`**: la carga requiere reconstruir el grafo con `compress_model` antes de aplicar el state dict; no es un checkpoint `transformers` estándar.
- **Licencia MIT**: permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad en despliegues comerciales.
- **Métricas no verificadas**: el model-index marca `verified: false`; los resultados provienen del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-faq-quantizer-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/faq_quantizer.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
