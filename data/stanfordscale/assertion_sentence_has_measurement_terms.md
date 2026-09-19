# StanfordSCALE/assertion_sentence_has_measurement_terms

## Resumen

`StanfordSCALE/assertion_sentence_has_measurement_terms` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea concreta es determinar si un enunciado de profesor contiene términos de medición (por ejemplo, referencias a diámetros, alturas o magnitudes en una clase de matemáticas). No es un modelo generativo: es un clasificador de una sola aserción ("assertion") que forma parte de un esquema modular de codificación de discurso en el aula.

Técnicamente es un modelo SetFit: se parte del encoder `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, 109.486.464 parámetros) y se le añade una cabeza de regresión logística. El entrenamiento combina una fase contrastiva sobre pares de frases con el ajuste posterior del clasificador lineal. Se distribuye en formato safetensors con la librería `setfit` y se consume a través del paquete `EduBehaviors-kit`.

Su relevancia es de nicho pero clara: permite etiquetar a escala corpus de discurso educativo (derivados del TalkMoves Dataset) para investigaciones sobre prácticas docentes. Ahora bien, la propia model card advierte de que las etiquetas de entrenamiento proceden de anotadores LLM con una fiabilidad inter-anotador muy baja (alfa de Krippendorff de 0.180) y que el rendimiento medido es modesto (F1 de 0.5485 en test), por lo que debe tratarse como una herramienta de cribado o priorización, no como un oráculo de anotación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit sobre encoder MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 (safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el encoder base MPNet trabaja con secuencias de hasta 384 tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | setfit |
| Pipeline | text-classification |
| Tamano del repositorio | 0.4 GB |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Columnas de salida | `assertion_sentence_has_measurement_terms`, `split_sentence_has_measurement_terms` |
| Fecha de publicacion | 18 de septiembre de 2026 (creacion del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, pensado para clasificacion de texto con pocos datos etiquetados. En la primera fase se afina el encoder MPNet de forma contrastiva sobre pares de frases con learning rate de 2e-05, batch size de 16, 10 epochs y un maximo de 5000 pasos. En la segunda fase se congelan los embeddings y se entrena una cabeza de regresion logistica con learning rate de 0.01, batch size de 32 y un maximo de 100 pasos de evaluacion. Se activo precision mixta en GPU y se uso la semilla 20260904. La entrada es la locucion cruda, sin plantilla: `{utterance}`.

Los datos provienen de un subconjunto anotado por LLM de intervenciones docentes del TalkMoves Dataset, con 3.432 ejemplos de train (53.3%), 860 de dev (13.4%) y 2.142 de test (33.3%). La clase positiva es muy minoritaria: la tasa base es del 8.7% global (8.4% en train, 9.2% en dev, 8.8% en test). El propio autor documenta que la concordancia entre anotadores para esta aserción es de alfa de Krippendorff 0.180, un valor que la model card califica explicitamente de pobre. No se reporta uso de RLHF ni DPO, algo esperable en un clasificador discriminativo de este tipo. Como innovacion tecnica destacable, la unica reseñable es el propio enfoque SetFit, que permite obtener un clasificador funcional con muy pocas muestras positivas y un coste de inferencia minimo.

## Capacidades

- Clasificacion binaria de texto: devuelve 1 si el enunciado contiene terminos de medicion y 0 en caso contrario, mediante `model.predict([text])`.
- Probabilidades calibradas por clase con `model.predict_proba([text])`, lo que permite usar el score como ranking y no solo como etiqueta dura.
- Procesamiento de locuciones individuales de profesor en ingles, tal cual se escriben (sin plantilla de prompt).
- Encoder de frases reutilizable: al estar construido sobre `paraphrase-mpnet-base-v2`, los embeddings intermedios pueden aprovecharse para similitud semantica o clustering.
- Integracion en el flujo de trabajo *EduBehaviors* mediante el paquete `EduBehaviors-kit` y el esquema de aserciones `assertion_sentence_has_measurement_terms` / `split_sentence_has_measurement_terms`.
- Ejecucion en CPU sin GPU dedicada, dado el tamano reducido del modelo (aproximadamente 0.44 GB en FP32).
- No soporta: generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, ni capacidades multilingues (solo ingles).

## Casos de uso

- Cribado de corpus de discurso en el aula: dado un conjunto de transcripciones de clases de matematicas, el clasificador marca que intervenciones del profesor contienen terminos de medicion, reduciendo el volumen que un codificador humano debe revisar.
- Priorizacion con revision humana (human-in-the-loop): con una tasa base del 8.8% y una precision media (average precision) de 0.609 en test, el modelo ofrece un enriquecimiento de aproximadamente 7x respecto al azar; es adecuado para ordenar candidatos por probabilidad y que un anotador valide solo la cola alta.
- Construccion de datasets de investigacion educativa: generacion de etiquetas preliminares sobre grandes volumenes de transcripciones antes de la anotacion manual definitiva, documentando siempre el origen automatico.
- Analisis de practicas instruccionales: medir la frecuencia con que los docentes verbalizan magnitudes y relaciones metricas durante la ensenanza de geometria o medida, como variable agregada por sesion o por profesor.
- Auditoria de pipelines de anotacion LLM: al ser un clasificador pequeno y determinista, sirve como segunda opinion barata frente a las etiquetas generadas por un LLM, util para detectar discrepancias sistematicas.
- Enriquecimiento de indices de busqueda educativa: precalcular la probabilidad de "contiene terminos de medicion" para cada locucion y permitir filtrado semantico en un motor de busqueda de material didactico o de transcripciones.
- Deteccion de vocabulario disciplinar en formacion docente: alimentar dashboards que muestren a formadores de profesores en que momentos de una sesion se explicita el lenguaje matematico medible.
- Filtrado previo a analisis costoso: descartar o preservar segmentos antes de ejecutar modelos mas grandes (por ejemplo, un LLM de anotacion), reduciendo el coste computacional del pipeline global.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`). Dataset: `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 860 | 9.2% | 0.556 | 0.380 | 0.451 | 0.866 | 0.540 |
| test | 2.142 | 8.8% | 0.576 | 0.524 | 0.548 | 0.912 | 0.609 |

Metricas del model-index (split de test): F1 0.5485, precision 0.5756, recall 0.5238, ROC-AUC 0.9122.

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.44 GB en FP32, 0.22 GB en FP16 y 0.11 GB en INT8, calculado sobre los 109.486.464 parametros del encoder.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU. No requiere A100 ni H100.
- Inferencia en CPU perfectamente viable; el cuello de botella real es el preprocesado de texto, no el modelo.
- Despliegue: libreria `setfit` (`SetFitModel.from_pretrained`), `sentence-transformers`, y exportacion a ONNX Runtime si se necesita reducir la latencia. vLLM, TGI, Ollama y llama.cpp no son aplicables, ya que no hay pesos generativos ni variantes GGUF publicadas.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de peticiones por segundo.
- Almacenamiento: 0.4 GB de repositorio, sin pesos duplicados por cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_sentence_has_measurement_terms | 109,5 M | no disponible (base MPNet, 384 tokens) | F1 0.5485, ROC-AUC 0.9122 (test) | no disponible | safetensors, libreria setfit |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base, sin ajustar) | 109,5 M | 384 tokens | no disponible para esta tarea concreta | Apache-2.0 segun su propia ficha (no confirmado en la informacion proporcionada) | safetensors, sentence-transformers |
| Clasificador supervisado tipo BERT/RoBERTa afinado para la misma tarea | no disponible | no disponible | no disponible | no disponible | no disponible |
| Anotacion zero-shot con un LLM de proposito general | no disponible | no disponible | no disponible | no disponible | API o pesos abiertos |

No se dispone de resultados de benchmark comparativos entre estas alternativas en la informacion proporcionada; la unica comparacion objetiva posible es la mejora del ajuste SetFit frente a su encoder base, que no viene cuantificada en la model card.

## Limitaciones y advertencias

- Etiquetas generadas por anotadores LLM, no por codificadores humanos. La concordancia medida con alfa de Krippendorff es 0.180, valor que la propia model card describe como pobre y que califica los datos y las predicciones de poco fiables.
- Rendimiento modesto: F1 de 0.5485 en test con precision 0.576 y recall 0.524. Un uso directo como etiquetador automatico sin revision humana introducira un volumen alto de falsos positivos y falsos negativos.
- Desequilibrio de clases severo (8.8% de positivos en test). Cualquier despliegue debe fijar el umbral de decision en funcion del coste relativo de falsos positivos y falsos negativos, y no usar 0.5 por defecto sin evaluarlo.
- Entrenado exclusivamente con intervenciones de profesor. El comportamiento sobre habla de estudiantes no esta probado.
- Solo ingles. No hay soporte multilingue ni resultados para castellano.
- Uso previsto limitado al ambito educativo y a la tarea concreta de deteccion de terminos de medicion; no es un clasificador de proposito general ni admite reutilizacion fuera de ese dominio sin reentrenamiento.
- Licencia no disponible: no puede asumirse permiso de uso comercial. Es un riesgo legal relevante para produccion.
- No se especifica el tratamiento de datos personales en las transcripciones de clase, que en muchos casos contienen voces de menores; cualquier uso real debe pasar por las politicas de privacidad y consentimiento correspondientes.
- Riesgo de sesgo derivado de la fuente: el TalkMoves Dataset se centra en un contexto y un idioma concretos (aula en ingles), por lo que la generalizacion a otros paises, niveles o estilos de ensenanza no esta documentada.
- La fecha de creacion del repositorio es el 18 de septiembre de 2026 y el modelo no tiene descargas ni likes, por lo que no existe evidencia de uso independiente ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StanfordSCALE/assertion_sentence_has_measurement_terms
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio de origen de las locuciones): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`, mencionado en la model card sin URL asociada: no disponible.
- Los resultados de busqueda web consultados no aportan enlaces relevantes sobre este modelo (devolvieron paginas genericas de Reddit y Baidu Zhidao sin relacion con el modelo).
