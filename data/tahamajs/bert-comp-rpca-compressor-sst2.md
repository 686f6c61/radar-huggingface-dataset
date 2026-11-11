# tahamajs/bert-comp-rpca-compressor-sst2

## Resumen

`tahamajs/bert-comp-rpca-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, publicado por Taha Majlesi dentro del proyecto NeuralOps. No es un modelo nuevo entrenado desde cero, sino una demostración de la técnica de compresión `RPCACompressor` (Robust PCA con descomposición de bajo rango) aplicada sobre un transformer BERT-Base ya existente. El checkpoint empaquetado corresponde al rango de compresión `k=128`, que reduce los parámetros de 109,48 M a 45,79 M (2,39x de compresión física, -58,2 % de parámetros).

El interés del modelo es fundamentalmente metodológico: sirve como referencia reproducible para evaluar si la compresión de bajo rango con "curación" LoRA posterior permite mantener capacidades de clasificación en un modelo BERT. La precisión final en validación de SST-2 es del 72,71 %, frente al 91,63 % del profesor original, lo que supone una pérdida de casi 19 puntos. Es, por tanto, un artefacto de investigación más que un modelo listo para producción.

La arquitectura subyacente es un transformer encoder BERT-Base (12 capas, dimensión oculta 768, 109,48 M de parámetros), con contexto de 512 tokens y vocabulario WordPiece en inglés. El modelo solo soporta inglés y su tarea efectiva es la clasificación binaria de sentimiento (positivo/negativo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), comprimido mediante RPCA de bajo rango |
| Parametros totales | 45.792.002 (checkpoint comprimido en k=128) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-uncased) |
| Tipos de cuantizacion | No disponible (el repo publica pesos en `pytorch_model.bin`; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), con `config.json` y `compression_summary.json` |
| Modelo base | google-bert/bert-base-uncased (109.483.778 parametros) |
| Rango de compresion | k=128 (2,39x, -58,17 % de parametros) |
| Libreria | neuralops |
| Tarea | Clasificacion de sentimiento binaria (SST-2) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de BERT-Base uncased: un transformer encoder de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y 109,48 M de parámetros, preentrenado por Google con objetivos MLM y NSP. Sobre esa base, el autor aplica el compresor `RPCACompressor` de la librería NeuralOps, que descompone cada matriz de pesos W = L + S, factorizando el componente de bajo rango L mediante una SVDLinear estructural. El rango seleccionado es k=128, lo que produce un checkpoint de 45,79 M de parámetros.

El proceso de recuperación ("healing") se activa cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En ese caso se aplica un LoRA de rango r=8 durante 50 pasos con lr=2e-4 y un presupuesto de 45 segundos. Los pesos finales empaquetados incluyen tanto los factores de bajo rango como los adaptadores LoRA curados. La evaluación se realizó físicamente en una RTX 3090 (24 GB) sobre el split de validación de SST-2 (872 muestras). No se documentan detalles sobre el dataset de preentrenamiento original (más allá de ser el de BERT) ni sobre el proceso exacto de afinado previo a la compresión.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, formato SST-2.
- Razonamiento semántico limitado a la tarea de clasificación; no genera texto libre.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no, solo inglés.
- No incluye modo "thinking", visión ni audio.
- El tokenizador es el estándar WordPiece de `bert-base-uncased` (vocab.txt, tokenizer.json, tokenizer_config.json).

## Casos de uso

- **Clasificación de reseñas de producto en inglés**: el modelo puede puntuar polaridad positiva/negativa en lotes de reseñas cortas (hasta 512 tokens) usando la pipeline `text-classification`; útil como baseline comprimido en entornos con recursos limitados.
- **Filtrado de comentarios en moderación de comunidades**: al ser un clasificador ligero (~46 M de parámetros), puede desplegarse en CPU para prefiltrar contenido tóxico o negativo antes de pasar a modelos más grandes.
- **Investigación en compresión de modelos**: sirve como referencia reproducible para comparar técnicas de compresión (RPCA, SVD, pruning) sobre BERT-Base y medir la degradación en SST-2 frente al profesor del 91,63 %.
- **Prototipado rápido de pipelines de NLP**: al cargarse con `transformers` + `neuralops` en pocos pasos, permite validar extremo a extremo un flujo de clasificación antes de invertir en modelos mayores.
- **Evaluación de "healing" LoRA**: el checkpoint k=128 es el caso donde la curación LoRA recupera más precisión (de 52,87 % zero-shot a 72,71 %), por lo que es útil para estudiar la interacción entre rango de compresión y recuperación.
- **Despliegue en dispositivos con poca VRAM**: con ~46 M de parámetros y pesos en FP32 (~183 MB), cabe en GPUs consumer modestas o incluso en CPU para inferencia por lotes pequeños.
- **Docencia y demostraciones**: ejemplo didáctico de cómo comprimir un transformer y medir el impacto en una tarea concreta con métricas verificables.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Rank (k) | Ratio fisico | Parametros comprimidos | Zero-shot Acc | Healed Acc | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 59,75 % | 50,92 % (LoRA) | -40,71 % |
| **128** | **2,39x** | **45.792.002 (-58,2 %)** | **52,87 %** | **72,71 % (LoRA)** | **-18,92 %** |
| 64 | 3,11x | 35.170.562 (-67,9 %) | 51,38 % | 49,08 % (LoRA) | -42,55 % |
| 32 | 3,67x | 29.859.842 (-72,7 %) | 49,43 % | 66,74 % (LoRA) | -24,89 % |

El checkpoint empaquetado en el repositorio es el de k=128, con 72,71 % de precisión en validación de GLUE SST-2 (872 muestras). La precisión del profesor original es del 91,63 %. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: ~183 MB en FP32 para los 45,79 M de parámetros del checkpoint comprimido; ~92 MB en FP16. Cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: cualquier GPU con ≥2 GB de VRAM; el autor evaluó en una NVIDIA RTX 3090 (24 GB), pero el modelo es sobredimensionado para esa tarjeta.
- **Consumer GPU**: sí, cabe en GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue**: `transformers` + `neuralops` (reconstrucción del grafo comprimido y carga del state dict); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el formato `pytorch_model.bin` no es directamente compatible con esos motores sin conversión.
- **Latencia y throughput**: no disponibles. El autor menciona un presupuesto de 45 segundos para el "healing" LoRA, pero no publica latencias de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **bert-comp-rpca-compressor-sst2 (k=128)** | 45,79 M | 512 | 72,71 % | MIT | Hugging Face (`neuralops`) |
| google-bert/bert-base-uncased (profesor) | 109,48 M | 512 | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face (`transformers`) |
| DistilBERT-base-uncased | 66 M | 512 | ~91 % (referencia pública) | Apache 2.0 | Hugging Face (`transformers`) |
| BERT-Tiny (prajjwal1) | ~4,4 M | 512 | ~80 % (referencia pública) | Apache 2.0 | Hugging Face (`transformers`) |

Nota: los valores de DistilBERT y BERT-Tiny proceden de referencias públicas ampliamente citadas y no de la información proporcionada por el autor; se incluyen solo como orientación. La comparación directa más justa es contra el profesor BERT-Base, del que este checkpoint es una versión comprimida con pérdida de ~19 puntos en SST-2.

## Limitaciones y advertencias

- **Pérdida de precisión notable**: 72,71 % frente al 91,63 % del profesor; una caída de 18,92 puntos es inaceptable para muchos casos de producción.
- **Solo inglés**: no soporta otros idiomas, lo que limita su uso en entornos multilingües.
- **Tarea muy restringida**: clasificación binaria de sentimiento; no genera texto ni resuelve tareas abiertas.
- **Contexto limitado a 512 tokens**: textos más largos deben truncarse, con la consiguiente pérdida de información.
- **Riesgo de alucinación**: bajo en sentido estricto (no genera texto libre), pero puede producir clasificaciones erróneas con confianza alta en dominios distintos de SST-2.
- **Sesgos heredados**: al derivar de `bert-base-uncased`, arrastra los sesgos de género, raza y dominio presentes en su corpus de preentrenamiento; no se documenta ningún proceso de mitigación.
- **Dependencia de la librería `neuralops`**: la carga requiere reconstruir el grafo comprimido con `compress_model` antes de aplicar el state dict con `strict=False`; no es un checkpoint estándar de `transformers` y puede romperse si la API de NeuralOps cambia.
- **Licencia MIT**: permite uso comercial, pero el modelo base BERT-Base es Apache 2.0 y conviene revisar la compatibilidad de atribuciones.
- **Sin verificación independiente**: los benchmarks son declarados por el autor (`verified: false` en el model-index) y no han sido replicados por terceros.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-10, lo que sugiere un artefacto de investigación reciente o un error de metadatos; conviene verificar la integridad antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-rpca-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor RPCA: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/rpca_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
