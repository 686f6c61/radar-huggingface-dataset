# tahamajs/bert-comp-zerokv-neo-compressor-sst2

## Resumen

`bert-comp-zerokv-neo-compressor-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión oculta 768) afinado sobre GLUE SST-2 y posteriormente procesado con el compresor `ZeroKVNeoCompressor` de la librería NeuralOps. Lo publica el usuario tahamajs como parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un conjunto de artefactos destinados a demostrar técnicas de compresión de modelos. La relevancia del repositorio es, por tanto, metodológica: sirve como ejemplo reproducible de un pipeline de compresión con evaluación multi-rango y recuperación mediante LoRA.

El resultado declarado por el autor es, sin embargo, muy deficiente: la accuracy en la validación de GLUE SST-2 (872 muestras) cae al 49,08 % frente al 91,63 % del modelo profesor, una pérdida de 42,55 puntos. El ratio de compresión efectivo es de 1,00x (0 % de ahorro de parámetros), por lo que el checkpoint no reduce el tamaño del modelo. Además, el rango presentado como "seleccionado" (k=32) no aplica LoRA de recuperación ("LoRA Recovery Applied: False"), de modo que no hay mecanismo que mitigue la degradación.

En la práctica, el modelo se comporta prácticamente como un clasificador aleatorio binario (el 50 % de accuracy sería el azar en SST-2), lo que lo inhabilita para uso en producción. Su interés se limita a la investigación sobre compresión de modelos, al estudio del comportamiento de compresores basados en poda por norma L2 y a la reproducibilidad del pipeline NeuralOps.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimensión oculta 768 |
| Parámetros totales | 109.483.778 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-base-uncased admite hasta 512 tokens, pero el autor no lo declara) |
| Tipos de cuantización | No disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y assets del tokenizador |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder bidireccional de 12 capas y 768 dimensiones ocultas, afinado para clasificación de sentimiento binaria (2 etiquetas) sobre GLUE SST-2. Sobre ese checkpoint se aplica el compresor `ZeroKVNeoCompressor`, descrito por el autor como una poda de pesos por norma L2 que preserva "attention sinks" y "heavy hitters". El pipeline evalúa cuatro rangos (k=256, 128, 64 y 32) sobre la partición de validación de SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB.

Según la model card, cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" con LoRA de rango 8 (50 pasos, learning rate 2e-4, presupuesto de 45 segundos). En este checkpoint concreto, el healing no se aplicó (`LoRA Recovery Applied: False`) y el ratio de compresión físico es 1,000x, es decir, no se eliminó ningún parámetro. Los cuatro rangos evaluados arrojan idéntico resultado (49,08 %), lo que sugiere que el compresor no está produciendo una modificación efectiva del modelo o que la degradación es independiente del rango configurado. No se documentan datos de preentrenamiento adicionales, composición del dataset de afinado ni detalles del proceso de RLHF/DPO (no aplicable en un clasificador BERT).

## Capacidades

- Clasificación de texto binaria (sentimiento positivo/negativo) sobre entradas en inglés, con la interfaz `BertForSequenceClassification` de Transformers.
- Inferencia sobre texto tokenizado con el vocabulario estándar de `bert-base-uncased` (`vocab.txt`, `tokenizer.json`).
- Integración con el pipeline de compresión de NeuralOps (`neuralops.core.compression_pipeline.compress_model`) para reconstruir la topología comprimida antes de cargar el state dict.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Multilingüismo limitado al inglés; el vocabulario original de BERT-base-uncased incluye algunos tokens multilingües, pero el afinado es monolingüe.

## Casos de uso

- Reproducción académica de pipelines de compresión: el repositorio permite ejecutar el flujo completo de NeuralOps (compresión, evaluación multi-rango y healing LoRA) sobre un modelo pequeño, útil para validar la implementación del compresor antes de aplicarlo a modelos mayores.
- Estudio de degradación por poda L2: sirve como caso negativo documentado (caída de 42,55 puntos con ratio 1,00x) para analizar cuándo un compresor basado en norma L2 preserva "heavy hitters" y cuándo no.
- Benchmark de infraestructura de evaluación: el `compression_summary.json` y la tabla multi-rango permiten comparar el comportamiento de otros compresores de NeuralOps sobre el mismo modelo base y dataset.
- Docencia sobre compresión de modelos: ejemplo tangible de que un ratio de compresión de 1,00x no implica necesariamente preservación de la precisión, y de la importancia de aplicar el healing LoRA cuando la degradación supera el umbral.
- Verificación de compatibilidad con Transformers: el checkpoint se carga con `BertForSequenceClassification` y `strict=False`, lo que permite probar la interoperabilidad entre el formato NeuralOps y la API estándar de Hugging Face.
- No es adecuado para clasificación de sentimiento en producción: con un 49,08 % de accuracy, el modelo está al nivel del azar y no debe desplegarse en aplicaciones reales de análisis de opiniones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados, `verified: false`):

| Modelo / configuración | Dataset | Métrica | Valor |
|---|---|---|---|
| `bert-comp-zerokv-neo-compressor-sst2` (k=32, checkpoint publicado) | GLUE SST-2, validation (872 muestras) | Accuracy | 49,08 % |
| Profesor `bert-base-uncased` afinado SST-2 | GLUE SST-2, validation | Accuracy | 91,63 % |
| Diferencia (parity delta) | — | Accuracy | −42,55 puntos |

Evaluación multi-rango declarada por el autor (misma RTX 3090, mismas 872 muestras):

| Rango (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con healing | Parity vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,00x | 109.483.778 (−0,0 %) | 49,08 % | 49,08 % | −42,55 % |
| 128 | 1,00x | 109.483.778 (−0,0 %) | 49,08 % | 49,08 % | −42,55 % |
| 64 | 1,00x | 109.483.778 (−0,0 %) | 49,08 % | 49,08 % | −42,55 % |
| 32 (publicado) | 1,00x | 109.483.778 (−0,0 %) | 49,08 % | 49,08 % | −42,55 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en fp32 (los pesos empaquetados ocupan 451,9 MB); en fp16 rondaría 0,22 GB; en int8, unos 0,11 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es enormemente sobredimensionado para ese hardware.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: Transformers (`BertForSequenceClassification`) más el pipeline de NeuralOps para reconstruir la topología comprimida; no se distribuyen pesos en GGUF, por lo que llama.cpp u Ollama no son aplicables directamente sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de BERT-base, se espera un throughput de miles de muestras por segundo en GPU moderna, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validation) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-zerokv-neo-compressor-sst2` | 109,5 M | No disponible | 49,08 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,5 M | 512 tokens | 91,63 % (según el autor) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` (referencia de la comunidad) | 109,5 M | 512 tokens | No disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 tokens | No disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparativa se limita a la arquitectura y al profesor declarado; no se dispone de cifras verificadas de los modelos alternativos en la información proporcionada. El checkpoint comprimido es el único de la tabla que no alcanza el rendimiento del azar en SST-2.

## Limitaciones y advertencias

- Rendimiento inutilizable: 49,08 % de accuracy en SST-2 equivale prácticamente a clasificación aleatoria binaria; no debe emplearse en producción.
- Sin compresión efectiva: el ratio declarado es 1,00x y la reducción de parámetros es del 0,0 %, por lo que el checkpoint no aporta ningún ahorro de memoria ni de cómputo frente al modelo base.
- Sin healing LoRA aplicado: el autor indica explícitamente `LoRA Recovery Applied: False` en el rango publicado (k=32), de modo que no hay mitigación de la degradación.
- Resultados no verificados: la métrica de la model-index tiene `verified: false` y no se aportan curvas de entrenamiento ni particiones adicionales.
- Riesgo de alucinación y sesgos: al ser un clasificador BERT afinado sobre SST-2, hereda los sesgos del corpus de reseñas de cine; con la accuracy actual, las predicciones son esencialmente ruido y no deben interpretarse como señal.
- Limitación de idioma: solo inglés; el tokenizador original incluye algunos tokens multilingües, pero el afinado es monolingüe.
- Restricciones de licencia: MIT permite uso comercial, pero la calidad del modelo hace inviable cualquier despliegue productivo; el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0.
- Dependencia de la librería NeuralOps: la carga requiere reconstruir la topología comprimida con `compress_model` antes de aplicar `load_state_dict(strict=False)`, lo que añade una dependencia no estándar frente a un `from_pretrained` convencional.
- Fecha de creación anómala (2026-11-10) y cero descargas/likes: repositorio sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-zerokv-neo-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/zerokv_neo_compressor.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
