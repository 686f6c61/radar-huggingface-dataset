# yoga-0125/distilhubert-finetuned-gtzan

## Resumen

distilhubert-finetuned-gtzan es un modelo de clasificación de audio obtenido mediante fine-tuning del checkpoint ntu-spml/distilhubert sobre el conjunto de datos GTZAN, un corpus de referencia para la clasificación de géneros musicales. Lo publica el usuario yoga-0125 en Hugging Face bajo licencia Apache 2.0 y está pensado exclusivamente para la tarea de audio-classification dentro del ecosistema transformers.

El modelo parte de DistilHuBERT, una versión destilada de HuBERT que reduce drásticamente el número de parámetros del transformer original manteniendo representaciones de audio útiles para tareas downstream. Con 23.691.402 parámetros totales y un repositorio de 0,2 GB, es un modelo ligero que puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace atractivo para prototipos de clasificación musical y pipelines de inferencia con requisitos modestos.

Su relevancia es acotada: no es un modelo generativo ni un asistente conversacional, sino un clasificador de 10 clases (los géneros de GTZAN) con una precisión declarada de 0,83 sobre el conjunto de evaluación. La model card es en gran medida autogenerada por el Trainer y carece de secciones descriptivas, por lo que muchos detalles de entrenamiento e intención de uso no están documentados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo HuBERT destilado (DistilHuBERT), encoder de representaciones de audio |
| Parametros totales | 23.691.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada de audio definida por el feature extractor de HuBERT; no documentada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilHuBERT, un modelo de representación de audio auto-supervisado que destila el transformer HuBERT original en una red más pequeña. El checkpoint base ntu-spml/distilhubert se ha fine-tuneado como clasificador de secuencias de audio, añadiendo presumiblemente una cabeza de clasificación sobre las representaciones del encoder para las 10 clases de género de GTZAN. No se documentan en la model card detalles sobre la composición exacta de la cabeza ni sobre el pooling utilizado.

El entrenamiento se realizó con el Trainer de transformers durante 10 épocas, con learning rate 5e-05, batch size de 8 (entrenamiento y evaluación), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 100 pasos de warmup, semilla 42 y precisión mixta nativa (AMP). El conjunto de datos es marsyas/gtzan en configuración "all" y split "train". La pérdida de validación final fue 0,5936 y la precisión 0,83. No se indica si hubo aumentación de datos, balanceo de clases ni validación cruzada, ni se documenta el número de tokens o muestras exactas utilizadas.

## Capacidades

- Clasificación de audio en 10 clases de género musical (GTZAN: blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock).
- Extracción de representaciones de audio mediante el encoder DistilHuBERT subyacente.
- Inferencia ligera: 23,7 M de parámetros permiten ejecución en CPU y GPUs de gama baja.
- Integración nativa con la pipeline `audio-classification` de transformers.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto, código ni respuestas conversacionales.
- No dispone de modo thinking, visión ni audio generativo.
- Capacidades multilingües: no aplica (modelo de audio).

## Casos de uso

- Clasificación automática de géneros musicales en bibliotecas personales: el modelo recibe un fragmento de audio y devuelve una de las 10 etiquetas de GTZAN, útil para organizar colecciones o etiquetar catálogos pequeños.
- Prototipado rápido de sistemas de recomendación musical: al ser un modelo de 23,7 M de parámetros, se puede desplegar en un servicio ligero que etiquete pistas por género como señal auxiliar de recomendación.
- Filtrado y moderación de contenido en plataformas de audio: clasificación de clips subidos por usuarios para enrutarlos a categorías o detectar contenido fuera de política según género.
- Investigación en MIR (Music Information Retrieval): línea base reproducible para comparar técnicas de fine-tuning o aumentación sobre GTZAN, dado que la model card documenta hiperparámetros y curva de entrenamiento.
- Educación y demos de audio classification: ejemplo didáctico de fine-tuning de DistilHuBERT con el Trainer de transformers, adecuado para talleres y tutoriales por su tamaño reducido.
- Pre-etiquetado en pipelines de anotación humana: el modelo puede generar etiquetas iniciales de género que luego revisa un anotador, reduciendo el coste de curación de datasets musicales.
- Inferencia en dispositivos con recursos limitados: al caber en CPU y en GPUs consumer, puede ejecutarse en entornos edge para clasificar audio en local sin enviar datos a la nube.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Audio Classification | GTZAN (marsyas/gtzan, config all) | train | Accuracy | 0,83 |

Evolución del entrenamiento reportada por el Trainer:

| Epoca | Training loss | Validation loss | Accuracy |
|---|---|---|---|
| 1 | 1,8905 | 1,8297 | 0,51 |
| 2 | 1,2680 | 1,3000 | 0,66 |
| 3 | 1,1380 | 1,1207 | 0,68 |
| 4 | 0,7113 | 0,8510 | 0,73 |
| 5 | 0,5149 | 0,6931 | 0,83 |
| 6 | 0,4918 | 0,6578 | 0,81 |
| 7 | 0,3085 | 0,6066 | 0,81 |
| 8 | 0,1516 | 0,6201 | 0,82 |
| 9 | 0,1787 | 0,5932 | 0,85 |
| 10 | 0,1037 | 0,5936 | 0,83 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (23,7 M de parámetros, aproximadamente 95 MB de pesos) más el overhead del feature extractor y del runtime; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Cabe en CPU: sí, con latencia aceptable para clasificación de clips cortos.
- Opciones de despliegue: pipeline `audio-classification` de transformers, TorchServe, FastAPI con PyTorch, ONNX Runtime si se exporta manualmente. No se documentan artefactos para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la longitud del clip de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yoga-0125/distilhubert-finetuned-gtzan | 23,7 M | Clasificación de género (GTZAN, 10 clases) | Ventana de audio de HuBERT, no documentada | Apache 2.0 | Hugging Face, 29 descargas |
| ntu-spml/distilhubert (base) | ~23 M | Representación de audio auto-supervisada | Ventana de audio de HuBERT | Apache 2.0 | Hugging Face |
| facebook/hubert-base-ls960 | ~95 M | Representación de audio auto-supervisada | Ventana de audio de HuBERT | Apache 2.0 | Hugging Face |
| Modelos fine-tuneados sobre GTZAN con AST o wav2vec2 | no disponible | Clasificación de género | no disponible | variable | Hugging Face |

No se dispone de resultados de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es autogenerada y las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" no están completadas por el autor; la documentación es insuficiente para uso en producción sin validación propia.
- El resultado de 0,83 de precisión está declarado como no verificado y se reporta sobre el split "train" de GTZAN, no sobre un split de test independiente; puede existir fuga de datos o sobreajuste al conjunto de evaluación.
- GTZAN es un dataset con problemas conocidos de etiquetado y duplicados; los modelos entrenados sobre él pueden mostrar un rendimiento inflado respecto a datos reales.
- Sesgos conocidos: no documentados por el autor; al ser un clasificador de género musical, puede tener sesgos hacia los estilos sobrerrepresentados en GTZAN y hacia grabaciones con características acústicas similares a las del corpus.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en audio fuera de distribución (géneros no presentes en GTZAN, audio con ruido, habla, etc.).
- Limitaciones de contexto o idioma: el modelo no procesa texto ni idiomas; su entrada es audio y su ventana efectiva no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del checkpoint base y del dataset GTZAN antes de un despliegue comercial.
- Caveat para producción: 29 descargas y 0 likes indican un modelo de bajo uso y sin validación comunitaria; no se recomienda como componente crítico sin evaluación sobre datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoga-0125/distilhubert-finetuned-gtzan
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
- Repositorio de transformers: https://github.com/huggingface/transformers
- Documentación de la pipeline audio-classification: https://huggingface.co/docs/transformers/main/en/tasks/audio_classification
