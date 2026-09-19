# StanfordSCALE/assertion_sentence_checks_for_understanding_or_agreement

## Resumen

El modelo `StanfordSCALE/assertion_sentence_checks_for_understanding_or_agreement` es un clasificador binario de texto en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea es determinar si un enunciado de profesor (utterance) constituye una comprobación de comprensión o de acuerdo, es decir, si el docente verifica que el alumnado ha entendido o está de acuerdo con lo expuesto. No es un modelo generativo: es un clasificador de secuencias de una sola frase, pensado para integrarse en pipelines de codificación automática de discurso en el aula.

Técnicamente se apoya en SetFit (Sentence Transformer Fine-tuning), una técnica de few-shot que combina un cuerpo tipo sentence transformer con una cabeza de clasificación lineal. El cuerpo es `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet) y la cabeza es una regresión logística. El modelo completo tiene 109.486.464 parámetros y un repositorio de 0,4 GB en formato safetensors, lo que lo hace ejecutable en CPU sin requisitos de GPU.

Su relevancia es acotada y muy específica: cubre una etiqueta concreta dentro de un esquema de codificación auditable de diálogo educativo, distribuido mediante el paquete Python `EduBehaviors-kit`. Conviene señalar desde el principio que el propio autor advierte de que las etiquetas de entrenamiento provienen de anotadores LLM y no de codificadores humanos, con un acuerdo entre anotadores (alfa de Krippendorff) de 0,324, calificado explícitamente como pobre en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: cuerpo Sentence Transformer MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parámetros totales | 109.486.464 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (clasificador de frases individuales; la model card no especifica un límite de tokens) |
| Tipos de cuantización | No documentados por el autor; al ser un modelo de ~109 M de parámetros puede ejecutarse en fp32, fp16 o INT8 mediante PyTorch u ONNX Runtime (estimación técnica, no dato oficial) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 0,4 GB) |
| Librería | setfit |
| Pipeline | text-classification |
| Tarea | Clasificación binaria: `assertion_sentence_checks_for_understanding_or_agreement` |
| Columnas de salida | `assertion_sentence_checks_for_understanding_or_agreement` y `split_sentence_checks_for_understanding_or_agreement` |
| Dataset de entrenamiento | `StanfordSCALE/assertions_llm_annotated_talkmoves` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-18 |
| Última actualización | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo sigue el procedimiento SetFit en dos fases. En la primera, el cuerpo MPNet (`paraphrase-mpnet-base-v2`) se ajusta con aprendizaje contrastivo usando pares de frases generados a partir de las etiquetas, con un learning rate de 2e-05, batch size de 16, un máximo de 5.000 pasos, 100 pasos máximos de evaluación y precisión mixta activada en GPU. En la segunda fase se entrena la cabeza de clasificación (`LogisticRegression`) con learning rate de 0,01, batch size de 32 y 10 épocas. La semilla empleada fue 20260904. No se documenta ningún uso de RLHF, DPO ni ajuste por preferencias, algo coherente con un clasificador de este tipo.

Los datos proceden de un subconjunto anotado por LLM de intervenciones de profesor procedentes del TalkMoves Dataset. El conjunto tiene 3.430 ejemplos de entrenamiento (53,3 %), 858 de desarrollo (13,3 %) y 2.146 de prueba (33,4 %). La tasa base de la clase positiva es del 9,5 % global (9,4 % en train, 8,2 % en dev y 10,1 % en test), lo que indica un problema claramente desbalanceado. La anotación no es humana: el alfa de Krippendorff reportado es de 0,324, un valor bajo que el propio autor califica de pobre y que constituye la limitación metodológica central del modelo. La estructura de entrada es simplemente la utterance en texto plano, sin plantilla adicional.

## Capacidades

- Clasificación binaria de texto en inglés: devuelve si una frase concreta constituye una comprobación de comprensión o de acuerdo por parte del docente.
- Salida probabilística mediante `predict_proba`, que permite aplicar umbrales de decisión ajustados según el coste relativo de falsos positivos y falsos negativos.
- Codificación de discurso educativo a escala: procesamiento por lotes de transcripciones de aula para etiquetar comportamiento docente.
- Integración con la librería `setfit` y con el paquete `EduBehaviors-kit` para esquemas de codificación auditable de diálogo.
- Ejecución en CPU, sin necesidad de GPU, gracias a su tamaño reducido (109 M de parámetros).
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento explícito (thinking mode) ni capacidades de agente o razonamiento multi-paso.
- No tiene capacidades de visión, audio ni generación de texto.
- Multilingüismo: únicamente inglés; no se ha entrenado ni evaluado en otros idiomas.
- Rendimiento en intervenciones de alumnado: no probado (el modelo se entrenó solo con utterances de profesor).

## Casos de uso

- Codificación automática de transcripciones de aula: el modelo etiqueta cada intervención del docente indicando si contiene una comprobación de comprensión o acuerdo, sustituyendo o asistiendo la codificación manual en estudios con cientos de horas de grabación.
- Investigación en discurso educativo: permite calcular frecuencias y patrones de comprobaciones de comprensión a lo largo de una lección y correlacionarlos con otras variables observadas, siempre que se asuma el ruido de etiquetado documentado.
- Formación y desarrollo profesional docente: analizar grabaciones de clase y generar informes sobre la proporción de comprobaciones de comprensión que realiza el profesor, como material de reflexión en programas de mejora.
- Filtrado previo en pipelines humanos: usar el clasificador con un umbral alto para pre-seleccionar candidatos que después revisa un codificador humano, reduciendo el volumen de lectura manual.
- Análisis comparativo entre aulas o entre condiciones experimentales: aplicar el mismo clasificador a distintos corpus para comparar la prevalencia de esta conducta docente con un criterio consistente y reproducible.
- Enriquecimiento de datasets de diálogo: añadir la etiqueta generada como característica adicional en conjuntos de datos de interacción en el aula para entrenar modelos posteriores de análisis de discurso.
- Monitorización en plataformas de observación de clase: integrar el modelo como servicio en una herramienta que procese transcripciones y ofrezca retroalimentación casi inmediata al profesorado (con la advertencia de baja fiabilidad del etiquetado).

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. Los valores `verified: false` indican que no han sido verificados de forma independiente.

| Split | n | Tasa base | Precision (clase positiva) | Recall (clase positiva) | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 8,2 % | 0,544 | 0,529 | 0,536 | 0,863 | 0,537 |
| test | 2.146 | 10,1 % | 0,659 | 0,668 | 0,664 | 0,917 | 0,699 |

Métricas del conjunto de prueba tal como aparecen en el model-index: F1 de 0,6636, precision de 0,6591, recall de 0,6682 y ROC-AUC de 0,9170. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 y 0,22 GB en fp16 para los pesos; el consumo real depende del framework y del tamaño de lote.
- GPU recomendadas: cualquier GPU es suficiente; el modelo está pensado para ejecutarse en CPU. GPU de gama alta como A100, H100 o RTX 4090 resultan sobredimensionadas para este modelo.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo, e incluso en aceleradores integrados, por su tamaño de 109 M de parámetros.
- Despliegue en CPU: totalmente viable mediante `setfit`, `sentence-transformers` o una exportación a ONNX Runtime.
- Opciones de despliegue: la librería `setfit` (uso documentado por el autor), `sentence-transformers`, ONNX Runtime y un servicio HTTP propio con FastAPI o similar. El autor no documenta soporte para vLLM, TGI, llama.cpp ni Ollama; además, al tratarse de un codificador con cabeza de clasificación lineal y no de un modelo causal, las herramientas orientadas a LLM generativos no son el cauce natural.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible. A continuación se indican únicamente las alternativas conceptuales, sin valores numéricos inventados.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_sentence_checks_for_understanding_or_agreement` | 109.486.464 | No disponible | F1 0,664 y ROC-AUC 0,917 en test (autor, no verificado) | No disponible | HuggingFace, 0 descargas |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base) | No disponible en la información | No disponible | No entrenado para esta tarea de clasificación | No disponible en la información | HuggingFace |
| Alternativas de clasificación de discurso educativo | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento proceden de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de 0,324 según el alfa de Krippendorff, valor que el propio autor describe como pobre.
- El autor advierte explícitamente de que tanto las predicciones del modelo como los datos subyacentes son poco fiables. No debe usarse como fuente de verdad en evaluaciones de alto impacto.
- Entrenado exclusivamente con intervenciones de profesor; el comportamiento sobre habla de alumnado no está probado.
- Problema fuertemente desbalanceado: la tasa base de la clase positiva es de aproximadamente el 9,5 %, por lo que la precisión y el recall deben interpretarse en ese contexto y no como accuracy global.
- Idioma limitado al inglés. Cualquier uso en castellano u otras lenguas carece de validación.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Debe contactarse con el autor antes de cualquier despliegue en producción.
- Las métricas declaradas no están verificadas de forma independiente (`verified: false`).
- Es un clasificador, no un modelo generativo: no produce explicaciones, no razona y no mantiene conversaciones; cualquier flujo de interpretación debe construirse por encima.
- Umbral de decisión: al ser un clasificador con salida probabilística, un umbral de 0,5 puede no ser el óptimo para un caso de uso concreto; conviene calibrarlo con el conjunto de validación.
- El modelo fue publicado en 2026 y cuenta con 0 descargas y 0 likes, por lo que no existe validación externa ni experiencia de uso documentada en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_checks_for_understanding_or_agreement
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Repositorio del TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Biblioteca SetFit: https://github.com/huggingface/setfit
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados correspondían a páginas de soporte de Microsoft y no guardan relación con el modelo. No se dispone de paper, blog técnico ni demo asociados.
