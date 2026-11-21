# ulises-c/socrates-bert-classifiers-zh

## Resumen

`socrates-bert-classifiers-zh` es un repositorio que agrupa dos clasificadores de texto en chino para el análisis de diálogos de tutoría socrática, desarrollado por el autor `ulises-c` en el marco del proyecto "Reproducing and Extending KELE". Ambos modelos se obtuvieron mediante fine-tuning del encoder `BAAI/bge-small-zh-v1.5` sobre la partición de entrenamiento del dataset `ulises-c/SocratDataset` (split 90/10 por diálogo, semilla 42) y se evalúan sobre los 4.304 turnos de sus 681 diálogos de test.

El primero de ellos, `state-34way`, predice en qué uno de 34 estados didácticos debería situarse el profesor a continuación dentro del marco SocRule del artículo KELE, y alcanza un 61,59% de accuracy sobre los turnos de test. El segundo, `stage-5way`, predice una de 5 etapas didácticas con un 86,64% de accuracy. El clasificador de 34 estados es el que el proyecto denomina "BERT consultant" en sus ejecuciones de evaluación; el de 5 etapas no se usa en el pipeline y solo respalda la cifra de accuracy por etapa del artículo.

La relevancia del modelo es acotada y muy específica: no es un modelo generativo ni un asistente conversacional, sino un par de cabezas de clasificación ligeras (encoder BERT pequeño, repo de 0,2 GB) pensadas para reproducir y extender un trabajo académico concreto sobre enseñanza socrática en chino. Su utilidad práctica depende de la disponibilidad del dataset y del marco SocRule, y su licencia MIT permite reutilización comercial del artefacto, aunque las etiquetas no proceden de anotadores humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: `BAAI/bge-small-zh-v1.5`) con cabeza de clasificación de secuencias |
| Parametros totales | no disponible (el modelo base `bge-small-zh-v1.5` es un encoder pequeño; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se documenta en la model card; heredada del tokenizador del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | chino (`zh`) |
| Licencia | MIT |
| Formato de pesos | safetensors (vía `transformers`, `AutoModelForSequenceClassification`) |

## Arquitectura y entrenamiento

Cada clasificador es un fine-tuning completo (no LoRA) de `BAAI/bge-small-zh-v1.5`, un encoder BERT pequeño orientado a representaciones densas en chino, al que se añade una cabeza de clasificación de secuencias. El modelo consume un diálogo de tutoría hasta el último turno del estudiante y emite una etiqueta: uno de 34 estados didácticos (`state-34way`) o una de 5 etapas (`stage-5way`), según el marco SocRule del artículo KELE. Los datos de entrenamiento son la partición de entrenamiento de `ulises-c/SocratDataset` con split 90/10 por diálogo y semilla 42; la evaluación se realiza sobre 4.304 turnos de 681 diálogos de test.

La model card indica explícitamente que las etiquetas fueron producidas por el pipeline de los autores de KELE y no por anotadores humanos, y que se realizó una única ejecución de entrenamiento por modelo. No se documentan detalles sobre número de tokens de entrenamiento, composición del corpus, ni uso de RLHF/DPO (no aplicable a un clasificador). No se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Clasificación de texto en chino: predicción de uno de 34 estados didácticos (`state-34way`) o de una de 5 etapas (`stage-5way`) a partir de un diálogo de tutoría.
- Análisis de diálogo multi-turno: el modelo lee la conversación hasta el último turno del estudiante para predecir el siguiente paso del profesor.
- Reproducción del marco SocRule del artículo KELE para evaluación de enseñanza socrática.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al chino (`zh`).
- Uso como componente de evaluación ("BERT consultant") en el pipeline del proyecto `csen-346`.

## Casos de uso

- Evaluación automática de tutores socráticos: el clasificador `state-34way` permite etiquetar el estado didáctico esperado en cada turno de un diálogo y compararlo con la acción real del tutor, sirviendo como métrica objetiva en experimentos de enseñanza asistida por IA.
- Investigación en análisis de diálogo educativo: el modelo `stage-5way` proporciona una etiqueta de etapa por turno que facilita el análisis agregado de trayectorias de tutoría en corpus en chino.
- Reproducción de resultados académicos: ambos clasificadores permiten replicar las cifras de accuracy del artículo KELE sobre `SocratDataset` sin reentrenar desde cero.
- Construcción de datasets etiquetados: dado un corpus de diálogos de tutoría en chino, el clasificador puede preetiquetar estados o etapas para su posterior revisión, acelerando la anotación.
- Detección de desviaciones pedagógicas: comparar la predicción del estado esperado con la acción real del tutor permite señalar turnos donde el profesor se aleja del marco SocRule.
- Integración en pipelines de evaluación de sistemas de tutoría: al ser un encoder pequeño y ligero, puede ejecutarse por lotes en CPU/GPU modesta para evaluar grandes volúmenes de diálogos sin coste elevado.

## Benchmarks y rendimiento

| Modelo | Tarea | Accuracy (n = 4.304 turnos) |
|---|---|---|
| `state-34way` (bge-small-zh) | 34 estados didácticos | 61,59% |
| `stage-5way` (bge-small-zh) | 5 etapas didácticas | 86,64% |
| `socrates-state-classifier-qwen3.5-lora` (Qwen3.5-0.8B, referencia del autor) | 34 estados didácticos | 68,45% |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para estos clasificadores. La model card advierte que la accuracy dentro de un diálogo en ejecución es inferior a la medida sobre los turnos de test.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repo completo ocupa 0,2 GB y el encoder base es de tipo "small", por lo que la inferencia cabe holgadamente en cualquier GPU consumer (por ejemplo, RTX 3060/4060 con 8 GB) e incluso en CPU.
- GPU recomendadas: no se requieren GPU de datacenter; A100/H100 solo tendrían sentido para procesar grandes lotes en paralelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos GB de VRAM; también en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` (carga con `AutoModelForSequenceClassification` y `subfolder`), `text-classification` pipeline; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un encoder de clasificación).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ulises-c/socrates-bert-classifiers-zh` (`state-34way`) | Clasificador BERT (bge-small-zh) | no disponible | no disponible | 61,59% accuracy (34 estados, n = 4.304) | MIT | Hugging Face |
| `ulises-c/socrates-state-classifier-qwen3.5-lora` | Clasificador LoRA sobre Qwen3.5-0.8B | ~0,8B (base) | no disponible | 68,45% accuracy (34 estados) | no disponible | Hugging Face |
| `BAAI/bge-small-zh-v1.5` | Encoder de representaciones (modelo base) | no disponible | no disponible | no aplica (no es clasificador de estados) | no disponible | Hugging Face |

No se dispone de información sobre otros clasificadores comparables de estados didácticos en chino en la documentación proporcionada.

## Limitaciones y advertencias

- Solo chino: no soporta otros idiomas, incluido el castellano.
- Dominio restringido a ciencia de educación primaria; el modelo no está pensado para otros dominios educativos.
- Las etiquetas fueron generadas por el pipeline de los autores de KELE, no por anotadores humanos, por lo que heredan los sesgos y errores de ese pipeline.
- Una única ejecución de entrenamiento por modelo: no hay estimación de varianza entre semillas.
- La accuracy dentro de un diálogo en ejecución es inferior a la reportada sobre los turnos de test, según advierte la model card.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de predicciones erróneas sistemáticas en estados poco representados.
- Licencia MIT: permite uso comercial del artefacto, pero la procedencia de las etiquetas y del dataset debe verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación externa de la comunidad.
- No se documentan sesgos conocidos más allá de los derivados del dataset y del pipeline de etiquetado.

## Enlaces

- Hugging Face: https://huggingface.co/ulises-c/socrates-bert-classifiers-zh
- Repositorio del proyecto: https://github.com/ulises-c/csen-346
- Issues del proyecto: https://github.com/ulises-c/csen-346/issues
- Dataset: https://huggingface.co/datasets/ulises-c/SocratDataset
- Modelo base: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Clasificador alternativo (Qwen3.5-0.8B LoRA): https://huggingface.co/ulises-c/socrates-state-classifier-qwen3.5-lora
- Tarjeta del clasificador de 34 estados: https://huggingface.co/ulises-c/socrates-bert-classifiers-zh/blob/main/state-34way/README.md
- Tarjeta del clasificador de 5 etapas: https://huggingface.co/ulises-c/socrates-bert-classifiers-zh/blob/main/stage-5way/README.md
