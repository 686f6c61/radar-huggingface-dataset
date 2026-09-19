# StanfordSCALE/assertion_sentence_poses_a_hypothetical_or_scenario

## Resumen

`StanfordSCALE/assertion_sentence_poses_a_hypothetical_or_scenario` es un clasificador binario de frases en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, orientado a la codificación auditable de discurso de aula. La tarea concreta que resuelve es determinar si una intervención docente plantea una hipótesis o un escenario ("assertion"), una de las categorías de codificación del marco EduBehaviors para el análisis de movimientos conversacionales en clase.

Técnicamente no es un modelo generativo, sino un clasificador SetFit (Sentence Transformer Fine-tuning) construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet, aproximadamente 109,5 millones de parámetros) con una cabeza de regresión logística. El conjunto de entrenamiento procede de un subconjunto del TalkMoves Dataset anotado automáticamente por LLM, con 3.430 ejemplos de entrenamiento, 858 de validación y 2.146 de test, sobre intervenciones de profesorado exclusivamente.

Su relevancia es doble. Por un lado, ejemplifica un patrón de la IA educativa actual: usar anotadores LLM para escalar el etiquetado de corpus pedagógicos y después destilar ese etiquetado en clasificadores pequeños y desplegables en CPU. Por otro, es un caso útil de estudio sobre los límites de ese patrón: el propio autor declara un acuerdo entre anotadores (alfa de Krippendorff) de 0,373, calificado explícitamente como pobre, y advierte de que las predicciones y los datos subyacentes no son fiables. Es, por tanto, un artefacto de investigación más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder Sentence Transformer MPNet (`paraphrase-mpnet-base-v2`) + cabeza de regresion logistica |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el encoder MPNet subyacente admite hasta 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ declaradas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `setfit`) |
| Tarea | text-classification (clasificacion binaria) |
| Etiquetas de salida | `assertion_sentence_poses_a_hypothetical_or_scenario`, `split_sentence_poses_a_hypothetical_or_scenario` |
| Tamano del repositorio | 0.4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la receta SetFit en dos fases. Primero se ajusta el cuerpo (encoder MPNet preentrenado en pares de paráfrasis) de forma contrastiva con pares de frases generados a partir de las etiquetas, con un learning rate de 2e-05, batch size 16 y un máximo de 5.000 pasos. Después se entrena una cabeza de `LogisticRegression` sobre los embeddings resultantes, con learning rate 0.01, batch size 32, 10 épocas y 100 pasos máximos de evaluación. La semilla es 20260904 y se activó precisión mixta en GPU. El texto de entrada se construye pasando la intervención tal cual (`{utterance}`), sin plantilla adicional.

Los datos provienen de `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto del TalkMoves Dataset anotado por LLM. La tasa base de la clase positiva es muy baja: 3,4 % global (3,5 % en train, 3,7 % en dev, 3,0 % en test), lo que convierte el problema en una clasificación fuertemente desbalanceada. El acuerdo entre anotadores medido con alfa de Krippendorff es 0,373, un valor pobre que el propio autor señala como indicativo de baja fiabilidad del etiquetado. No se documenta RLHF, DPO ni ninguna innovación de decodificación; el modelo es un encoder con cabeza lineal y no genera texto.

## Capacidades

- Clasificación binaria de una intervención docente según si plantea una hipótesis o un escenario, devolviendo `0` o `1`.
- Puntuación probabilística mediante `predict_proba`, con salida `[P(no), P(sí)]`, apta para umbralizar según el coste relativo de falsos positivos y falsos negativos.
- Procesamiento de intervenciones individuales o listas de intervenciones en una sola llamada a `predict`.
- Integración con el ecosistema SetFit (`pip install setfit`) y uso previsto a través del paquete Python `EduBehaviors-kit`.
- Funcionamiento en CPU, dado el tamaño del encoder (aproximadamente 110 millones de parámetros).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Multilingüismo: únicamente inglés; no se declaran otros idiomas.

## Casos de uso

- Codificación automática de discurso de aula en investigación educativa: el clasificador etiqueta intervenciones docentes del corpus TalkMoves como hipótesis o escenario, permitiendo a los investigadores medir la frecuencia de este movimiento sin codificación manual a gran escala.
- Pre-anotación para codificadores humanos: dadas su precisión (0,488) y su recall (0,631) en test, es más útil como generador de candidatos que como oráculo; un equipo puede revisar solo los positivos propuestos en lugar de todo el corpus.
- Investigación sobre enseñanza dialógica: la categoría "hipótesis o escenario" es un indicador de prácticas que invitan a la especulación y al razonamiento contrafáctico en el aula, útil para comparar prácticas entre docentes o entre sesiones.
- Evaluación de programas de formación docente: procesar transcripciones de sesiones antes y después de una intervención formativa para cuantificar cambios en la proporción de intervenciones de tipo hipotético.
- Auditoría de pipelines de anotación con LLM: dado que el etiquetado original es automático y su acuerdo es bajo, este clasificador sirve como referencia para estudiar hasta qué punto un modelo pequeño reproduce las decisiones de un anotador LLM.
- Filtrado de corpus para construir datasets educativos: seleccionar o descartar fragmentos que contienen planteamientos hipotéticos antes de un análisis cualitativo posterior.
- Componente de un analizador de movimientos conversacionales más amplio: combinado con otros clasificadores de la familia EduBehaviors, permite construir un codificador multi-etiqueta de sesiones completas, siempre con validación humana.
- Experimentación metodológica con SetFit en dominios de educación: al ser reproducible (semilla, hiperparámetros y splits documentados), sirve como punto de partida para adaptar el enfoque a otros corpus educativos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas por terceros). El conjunto de evaluación es `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 3,7 % | 0,469 | 0,469 | 0,469 | 0,904 | 0,485 |
| test | 2.146 | 3,0 % | 0,488 | 0,631 | 0,550 | 0,948 | 0,486 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones oficiales con modelos alternativos. Cabe notar la divergencia entre ROC-AUC (0,948) y average precision (0,486): con una tasa base del 3 %, la capacidad de ranking es alta pero la precisión en la región operativa útil es limitada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,45 GB de pesos, más overhead de activaciones y del runtime; en la práctica menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,22 GB de pesos, holgadamente por debajo de 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. No requiere A100, H100 ni RTX 4090; una GTX 1050 Ti, una T4 o una RTX 3060 sobran. Su uso natural es CPU.
- Cabe en cualquier GPU de consumo, y también en entornos sin GPU. El cuello de botella real es la latencia de la codificación del encoder, no la memoria.
- Opciones de despliegue: `setfit` como vía oficial (carga con `SetFitModel.from_pretrained`), y exportación estándar a ONNX o TorchScript para servir en producción. `llama.cpp`, Ollama y TGI no aplican, ya que no es un modelo generativo con pesos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependerán del hardware y del tamaño del lote; el encoder tiene 12 capas y una dimensión oculta de 768, por lo que en CPU el procesamiento por lotes es viable para corpus de miles de frases.
- Almacenamiento: el repositorio ocupa 0,4 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_sentence_poses_a_hypothetical_or_scenario` | 109,5 M | no disponible (encoder MPNet, hasta 512 tokens) | Clasificacion binaria de movimientos de discurso de aula | no disponible | HuggingFace, 0 descargas |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base) | ~109 M (misma familia MPNet) | hasta 512 tokens | Generacion de embeddings de frases | Apache 2.0 (segun su propia model card) | Ampliamente desplegado |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22 M | hasta 256 tokens | Embeddings de frases | Apache 2.0 (segun su propia model card) | Muy extendido |
| Otros clasificadores de la familia EduBehaviors (StanfordSCALE) | no disponible | no disponible | Clasificacion de otras aserciones de discurso | no disponible | HuggingFace |

La comparación relevante no es de rendimiento en benchmarks, ya que no existen datos comparables publicados para esta tarea concreta. La diferencia principal frente a los encoders genéricos es la cabeza de clasificación específica del dominio; frente a un LLM anotador, la ventaja es el coste de inferencia y la reproducibilidad, y la desventaja es la fidelidad respecto al etiquetado humano.

## Limitaciones y advertencias

- Etiquetado de origen automático: las etiquetas provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de 0,373 (alfa de Krippendorff), un valor que el propio autor califica de pobre.
- Advertencia explícita del autor: "las predicciones de este modelo y los datos subyacentes no son fiables". No debe usarse como fuente de verdad en producción sin validación humana.
- Precisión baja en la clase positiva (0,488 en test): aproximadamente una de cada dos predicciones positivas es incorrecta, en un contexto de tasa base del 3 %.
- Sesgo de desequilibrio: con solo un 3 % de positivos, el umbral por defecto puede no ser el adecuado; cualquier despliegue exige calibrar el umbral según el coste del error.
- Dominio restringido: entrenado exclusivamente con intervenciones de profesorado (utterances de docentes). El comportamiento sobre habla de estudiantes no ha sido evaluado.
- Idioma único: inglés. No hay soporte declarado para castellano ni otras lenguas, por lo que su aplicación a corpus en español no está validada.
- Licencia no disponible: no se puede confirmar que el uso comercial esté permitido. Conviene contactar con el autor antes de cualquier uso en producto.
- Riesgo inherente a la tarea: clasificar una frase como "hipótesis o escenario" depende del contexto conversacional; el modelo recibe la intervención aislada, sin turnos anteriores ni posteriores.
- Sin métricas de robustez: no se documentan evaluaciones frente a ruido en la transcripción, errores de ASR ni variaciones dialectales, algo relevante si los datos provienen de transcripción automática.
- Uso en investigación: cero descargas y cero likes en el momento de redactar esta ficha, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_poses_a_hypothetical_or_scenario
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: mencionado en la model card como vía de uso, sin enlace disponible
- Proyecto EduBehaviors (Assertion-based schemas for auditable dialogue coding): sin enlace disponible en la información proporcionada
- Cita recomendada: Stanford SCALE Initiative, "Assertion classifier: sentence poses a hypothetical or scenario", 2026
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo; los unicos enlaces recuperados corresponden al portal e-CAC de la Receita Federal de Brasil y no guardan relacion con el modelo.
