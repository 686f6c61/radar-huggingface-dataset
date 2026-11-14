# syanissa/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan

## Resumen

`syanissa/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan` es un modelo de clasificación de audio basado en la arquitectura Audio Spectrogram Transformer (AST). Se trata de un ajuste fino del modelo `MIT/ast-finetuned-audioset-10-10-0.4593` sobre el conjunto de datos GTZAN, un corpus clásico de clasificación de géneros musicales. El autor del ajuste es el usuario de Hugging Face `syanissa`, y el modelo fue creado y actualizado en noviembre de 2026.

El modelo resuelve una tarea concreta: clasificar fragmentos de audio musical en uno de los diez géneros representados en GTZAN (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock). Con 86,2 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo ligero que puede ejecutarse en hardware modesto. Su relevancia radica en que demuestra el proceso de ajuste fino de un transformer de audio preentrenado en AudioSet hacia un dominio específico, con un 91 % de exactitud declarada sobre el conjunto de evaluación de GTZAN.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face. La model card es en gran medida autogenerada por el `Trainer` de Transformers y no incluye descripción detallada, usos previstos ni limitaciones redactadas por el autor, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | 86.196.490 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio convertida a espectrograma; el modelo base AST usa ventanas de ~10 s a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Audio Spectrogram Transformer: un transformer puro (sin componentes convolucionales) que opera sobre espectrogramas Mel de audio tratados como secuencias de parches, siguiendo el enfoque de Vision Transformer aplicado a audio. El modelo base, `MIT/ast-finetuned-audioset-10-10-0.4593`, fue preentrenado y ajustado en AudioSet, un corpus masivo de eventos sonoros con cientos de clases. Sobre esa base, `syanissa` realizó un ajuste fino supervisado sobre GTZAN para la tarea de clasificación de géneros musicales.

Los hiperparámetros de entrenamiento documentados son: learning rate de 5e-05, batch de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW (fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 100 pasos de calentamiento, 10 épocas y precisión mixta nativa (AMP). El entrenamiento se ejecutó con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta el número de tokens de audio, la composición exacta del dataset ni si hubo técnicas de refuerzo o preferencias; GTZAN es un corpus pequeño (habitualmente 1.000 fragmentos de 30 s, 100 por género).

## Capacidades

- Clasificación de audio en 10 clases de género musical (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock).
- Procesamiento de espectrogramas Mel como entrada mediante el `ASTFeatureExtractor` de Transformers.
- Inferencia mediante pipeline `audio-classification` de la librería Transformers.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling ni function calling (es un modelo de clasificación, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en sentido textual; opera sobre señal de audio.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- **Clasificación automática de bibliotecas musicales**: etiquetar colecciones de audio por género para motores de recomendación o sistemas de organización de catálogos, usando el pipeline `audio-classification` con ventanas de audio cortas.
- **Prototipado rápido de clasificadores de audio**: servir como punto de partida para experimentos de fine-tuning en dominios musicales específicos gracias a su tamaño reducido (86 M de parámetros) y licencia permisiva.
- **Investigación en MIR (Music Information Retrieval)**: emplear el modelo como baseline reproducible en experimentos de clasificación de género sobre GTZAN, comparando con arquitecturas convolucionales clásicas.
- **Filtrado de contenido en plataformas de audio**: detectar y etiquetar géneros en pipelines de moderación o curación de contenido, con la ventaja de que el modelo cabe en GPU de consumo.
- **Docencia y demostraciones de transformers de audio**: ilustrar el flujo completo de preentrenamiento en AudioSet y ajuste fino en un dataset pequeño, dado que la model card incluye la curva de entrenamiento por época.
- **Integración en aplicaciones de escritorio o móviles con backend ligero**: al pesar 0,3 GB en safetensors, puede servirse desde una CPU o GPU modesta para clasificación en tiempo casi real de fragmentos cortos.
- **Análisis de tendencias musicales**: clasificar lotes de audio de plataformas de streaming para estudios de distribución de género por región o periodo.

## Benchmarks y rendimiento

Los únicos datos publicados proceden del `model-index` de la model card (marcados como `verified: false`):

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| GTZAN | Accuracy | 0,91 | No |
| GTZAN | Loss (evaluación) | 0,6043 | No |

Evolución del entrenamiento declarada por el autor (extracto):

| Época | Validation loss | Accuracy |
|---|---|---|
| 1 | 1,3545 | 0,71 |
| 3 | 0,7415 | 0,84 |
| 5 | 0,5162 | 0,93 |
| 7 | 0,6162 | 0,91 |
| 10 | 0,6043 | 0,91 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~0,35 GB para los pesos (86 M de parámetros); en FP16 ~0,17 GB. Con activaciones y buffers de espectrograma, el consumo total se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060, RTX 4090, A100 o H100 no aportan ventaja significativa por el tamaño del modelo. Una CPU moderna puede ejecutar la inferencia con latencia aceptable para fragmentos cortos.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: pipeline `audio-classification` de Transformers, `transformers` con PyTorch, exportación a ONNX no documentada pero viable por la arquitectura estándar. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a LLM, no a clasificación de audio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| syanissa/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan | 86,2 M | Espectrograma Mel (~10 s) | Clasificación de género (GTZAN) | BSD-3-Clause | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 (base) | ~87 M | Espectrograma Mel (~10 s) | Clasificación de eventos AudioSet (527 clases) | BSD-3-Clause (según modelo base) | Hugging Face |
| Modelos CNN clásicos para GTZAN (p. ej. baselines en papers de MIR) | Variable (típicamente < 10 M) | Mel-espectrograma | Clasificación de género | Variable | Repositorios académicos |

No se dispone de datos de rendimiento comparativos verificados en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card es autogenerada y el autor no ha documentado usos previstos, limitaciones ni sesgos; la información sobre el modelo es mínima.
- El resultado de 0,91 de exactitud está marcado como `verified: false`; no ha sido validado de forma independiente.
- GTZAN es un dataset pequeño y con problemas conocidos de calidad (duplicados, etiquetas ruidosas, fragmentos con silencio), lo que puede inflar la exactitud reportada y limitar la generalización a audio real.
- Riesgo de sobreajuste: la pérdida de entrenamiento cae a valores prácticamente nulos en las últimas épocas mientras la pérdida de validación se estanca alrededor de 0,60, lo que sugiere sobreajuste al conjunto de entrenamiento.
- El modelo solo distingue 10 géneros; no clasifica eventos sonoros generales ni otros dominios musicales fuera de GTZAN.
- No hay información sobre sesgos culturales o de género musical; el corpus GTZAN tiene un sesgo hacia música occidental de las décadas de 1990-2000.
- Licencia BSD-3-Clause: permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base y del dataset GTZAN, que puede tener restricciones propias para uso comercial.
- No apto para tareas generativas, tool calling ni agentes; es exclusivamente un clasificador.
- No se documentan requisitos de idioma ni de calidad de audio; el rendimiento puede degradarse con grabaciones ruidosas, con muestreo distinto al esperado o con fragmentos muy cortos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syanissa/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
- Documentación de Audio Spectrogram Transformer en Transformers: https://huggingface.co/docs/transformers/model_doc/audio-spectrogram-transformer
