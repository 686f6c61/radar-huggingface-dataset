# watermelonlalala/nusabert-text-only-s1

## Resumen

nusabert-text-only-s1 es un modelo de clasificación de texto en indonesio obtenido mediante fine-tuning del checkpoint base LazarusNLP/NusaBERT-base, un BERT de arquitectura encoder-only entrenado específicamente para ese idioma. Lo publica el usuario watermelonlalala en HuggingFace y su tarea concreta es la clasificación binaria de toxicidad: cada texto de entrada se etiqueta como `non_toxic` o `toxic`. El modelo se ha ajustado con búsqueda de hiperparámetros mediante Optuna, según indica la propia model card.

Se trata de un modelo pequeño y especializado: 110.643.458 parámetros (unos 110,6 millones, coherente con un BERT-base), un repositorio de 0,4 GB en formato safetensors y una licencia no declarada en la información disponible. No es un modelo generativo ni conversacional; es un clasificador de secuencias que devuelve una etiqueta y su distribución de probabilidad.

Su relevancia es acotada y práctica: sirve como componente de moderación de contenido en indonesio dentro de pipelines de NLP, con un coste de inferencia muy bajo y compatibilidad con el ecosistema transformers y con text-embeddings-inference. No hay descargas ni likes registrados en el momento de redactar esta ficha, y no se han publicado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only), fine-tuning de LazarusNLP/NusaBERT-base |
| Parametros totales | 110.643.458 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base NusaBERT es de tipo BERT-base; la model card no declara el máximo de tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estándar de transformers, no documentada por el autor) |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | clasificación de texto, etiqueta única (`single_label_classification`) |
| Etiquetas | `non_toxic`, `toxic` |
| Libreria | transformers |
| Tamano del repo | 0,4 GB |
| Modelo base | LazarusNLP/NusaBERT-base |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer encoder-only de la familia BERT, heredada íntegramente de LazarusNLP/NusaBERT-base, con una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`) para dos etiquetas. El ajuste fino se realizó sobre ese checkpoint preentrenado en indonesio, y la model card indica que los hiperparámetros se seleccionaron mediante Optuna, aunque no se detallan el espacio de búsqueda, los valores finales ni el número de ensayos.

No hay información publicada sobre el conjunto de datos de entrenamiento: ni tamaño, ni procedencia, ni proporción entre clases, ni número de épocas o tokens vistos. Tampoco se documenta si hubo técnicas adicionales como ponderación de clases, aumento de datos o calibración. La model card sí advierte de que el texto de entrada debe preprocesarse igual que durante el entrenamiento (minúsculas, normalización de emojis, menciones y URL), lo que implica que el pipeline original incluía ese paso de limpieza, pero no se especifica su implementación exacta.

## Capacidades

- Clasificación binaria de toxicidad en indonesio: devuelve `toxic` o `non_toxic` para un texto dado.
- Clasificación de etiqueta única (`single_label_classification`), con distribución de probabilidad sobre las dos clases.
- Procesamiento de texto corto y medio propio de comentarios, publicaciones o mensajes, en función del límite de tokens del tokenizador del modelo base.
- Integración nativa con la API de transformers (`AutoTokenizer` y `AutoModelForSequenceClassification`).
- Compatibilidad declarada con text-embeddings-inference y con endpoints compatibles.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio.
- Cobertura multilingüe limitada al indonesio; no se declaran capacidades en otras lenguas.

## Casos de uso

- Moderación de comentarios en plataformas indonesias: el modelo puede puntuar cada comentario entrante y marcar como `toxic` los que superen un umbral de probabilidad, derivando el resto a publicación automática o a revisión humana.
- Filtrado previo en foros y comunidades: ejecutado por lotes sobre publicaciones nuevas, reduce el volumen que llega a los moderadores humanos y permite priorizar la cola de revisión por probabilidad de toxicidad.
- Monitorización de redes sociales: clasificación continua de menciones o respuestas a una marca para detectar acoso o insultos y activar alertas en un panel de control.
- Enriquecimiento de datasets: etiquetado automático de grandes corpus en indonesio para construir conjuntos de entrenamiento de modelos de moderación o para estudios de prevalencia de toxicidad.
- Prefiltro en pipelines de anotación humana: el clasificador separa los casos claros de los ambiguos, de modo que los anotadores solo revisan los ejemplos cercanos al umbral.
- Detección de toxicidad en sistemas de atención al cliente: como capa de aviso sobre los mensajes de usuarios antes de que lleguen a un agente o a un modelo generativo, con el fin de registrar y gestionar abusos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1, AUC ni comparaciones con otros clasificadores, y tampoco se documenta el conjunto de evaluación empleado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (110,6 M de parámetros), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16 o bf16 los pesos ocupan unos 0,22 GB; en cuantización de 8 bits, unos 0,11 GB.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes y alto throughput, una A100, H100, L4 o T4 son adecuadas. En GPUs de consumo, una RTX 3060, RTX 4060 o superiores funcionan sin problema.
- Cabe en GPU de consumo y también en CPU para cargas moderadas, dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers con PyTorch, text-embeddings-inference (declarado compatible), y servidores de inferencia estándar compatibles con endpoints de HuggingFace. No se documenta soporte específico de vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nusabert-text-only-s1 | 110,6 M | no disponible | Clasificación de toxicidad en indonesio | no disponible | HuggingFace |
| LazarusNLP/NusaBERT-base | no disponible en la información proporcionada | no disponible | Modelo base BERT en indonesio (preentrenamiento) | no disponible | HuggingFace |
| IndoBERT (indolem) | no disponible en la información proporcionada | no disponible | Modelo base BERT en indonesio | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la categoría y la tarea.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide confirmar si se permite el uso comercial; es un bloqueo potencial para producción.
- No se documentan sesgos del modelo ni la composición del dataset de entrenamiento, por lo que no es posible evaluar su comportamiento diferencial por registro, género o comunidad.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación; sin métricas publicadas no se puede estimar su tasa de error.
- El rendimiento depende críticamente del preprocesado: la model card exige aplicar la misma normalización que en entrenamiento (minúsculas, emojis, menciones, URL), y no se proporciona el código exacto de ese pipeline.
- Cobertura limitada al indonesio; no se declara soporte para otras lenguas ni para variantes dialectales.
- El contexto máximo efectivo no está documentado; textos largos pueden truncarse sin aviso según la configuración del tokenizador.
- Modelo sin descargas ni validación comunitaria en el momento de la ficha; conviene evaluarlo en un conjunto propio antes de desplegarlo.
- No es un modelo generativo: no debe emplearse para tareas de resumen, diálogo o generación de código.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/watermelonlalala/nusabert-text-only-s1
- Modelo base: https://huggingface.co/LazarusNLP/NusaBERT-base
