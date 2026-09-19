# StanfordSCALE/assertion_sentence_quotes_or_reads_text_aloud

## Resumen

`assertion_sentence_quotes_or_reads_text_aloud` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de anotación auditables para el codificado de diálogo en el aula. El modelo detecta una aserción concreta sobre el discurso docente: si una intervención cita textualmente un fragmento o lee un texto en voz alta. Se distribuye como un modelo SetFit, es decir, un encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` afinado con aprendizaje contrastivo y una cabeza de regresión logística, con 109.486.464 parámetros totales y un repositorio de 0,4 GB.

Su relevancia es práctica antes que generalista: cubre una etiqueta muy específica (tasa base del 3,4%) dentro de una taxonomía de comportamientos docentes que hasta ahora requería codificación humana. Las etiquetas de entrenamiento y evaluación provienen de anotadores LLM, con un acuerdo entre anotadores medido por alfa de Krippendorff de 0,661, lo que sitúa al modelo como una herramienta de codificación asistida y de bajo coste, no como un sustituto de la anotación humana experta.

El modelo está pensado para consumirse a través del paquete Python `EduBehaviors-kit`, recibe la intervención sin transformaciones adicionales y devuelve una predicción binaria o una probabilidad. Solo se ha entrenado y evaluado en inglés y únicamente sobre intervenciones de profesorado del corpus TalkMoves.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases (MPNet) como cuerpo + cabeza de clasificación `LogisticRegression` |
| Parámetros totales | 109.486.464 (109,5 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (modelo base tipo encoder de frases) |
| Tipos de cuantización | no disponible; no se publican variantes cuantizadas (se usa en precisión completa, con precisión mixta en el entrenamiento) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible en la información proporcionada |
| Formato de pesos | safetensors (etiqueta del repositorio), junto con el formato propio de SetFit; tamaño del repo 0,4 GB |

## Arquitectura y entrenamiento

El cuerpo del modelo es `sentence-transformers/paraphrase-mpnet-base-v2`, un encoder basado en MPNet de unos 109 M de parámetros. Sobre él se aplica el procedimiento SetFit en dos fases: primero un ajuste contrastivo (learning rate del cuerpo 2e-05, batch size 16, hasta 5000 pasos, 10 épocas, precisión mixta activada en GPU) y después el entrenamiento de una cabeza de regresión logística (learning rate 0,01, batch size 32). La semilla empleada fue 20260904. La entrada se construye pasando la intervención tal cual, sin plantilla adicional (`{utterance}`).

Los datos proceden del subconjunto anotado por LLM del dataset TalkMoves: 3.430 filas de entrenamiento (53,3%), 858 de desarrollo (13,3%) y 2.146 de prueba (33,4%), con una tasa base global de etiqueta positiva del 3,4% (3,3% en train, 3,7% en dev, 3,4% en test). La anotación es automática mediante LLM, con un alfa de Krippendorff de 0,661 para esta aserción concreta. No se documenta uso de RLHF ni DPO, ya que no es un modelo generativo.

## Capacidades

- Clasificación binaria de una aserción concreta: determina si una intervención docente cita textualmente o lee un texto en voz alta.
- Salida probabilística mediante `predict_proba`, lo que permite fijar umbrales según el coste relativo de falsos positivos y falsos negativos.
- Integración con el paquete `EduBehaviors-kit` para el codificado de comportamiento en el aula basado en aserciones.
- Funcionamiento sobre intervenciones individuales de profesorado, sin necesidad de contexto adicional.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente.
- Capacidad multilingüe: no; entrenado y evaluado solo en inglés.

## Casos de uso

- Análisis del discurso en el aula a escala: procesar transcripciones completas de clase y marcar automáticamente las intervenciones del docente en las que se cita una fuente o se lee un texto en voz alta, con el fin de caracterizar patrones de práctica instruccional en cientos de sesiones sin codificación manual.
- Investigación educativa reproducible: generar variables derivadas (frecuencia y distribución temporal de la conducta) sobre corpus ya transcritos, usando `predict_proba` para documentar el umbral elegido y auditar el etiquetado.
- Triaje previo a anotación humana: dado el desequilibrio de clases (3,4% positivos) y la precisión del 56,1%, usar el modelo para priorizar qué segmentos revisa primero un codificador humano, reduciendo el volumen de lectura sin eliminar la validación experta.
- Formación y feedback docente: detectar momentos de lectura en voz alta o cita textual en grabaciones de práctica y generar informes que ilustren al profesorado cuánto tiempo dedica a esa estrategia frente a otras.
- Control de calidad de pipelines de anotación con LLM: comparar las etiquetas de un anotador LLM con las de este clasificador para localizar discrepancias sistemáticas y estimar la estabilidad de la anotación.
- Construcción de indicadores agregados para evaluación de programas: combinar esta aserción con otras de la misma colección EduBehaviors para calcular perfiles de comportamiento docente por sesión, centro o programa.
- Preprocesado de corpus para otros modelos: usar la etiqueta como variable de filtrado o de estratificación antes de entrenar modelos posteriores sobre discurso educativo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (métricas no verificadas de forma independiente; valores de la clase positiva):

| Métrica | Valor (test) |
|---|---|
| F1 (clase positiva, test) | 0,5286 |
| Precision (clase positiva, test) | 0,5606 |
| Recall (clase positiva, test) | 0,5 |
| ROC-AUC (test) | 0,8724 |

Detalle adicional publicado en la model card:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 3,7% | 0,567 | 0,531 | 0,548 | 0,864 | 0,488 |
| test | 2.146 | 3,4% | 0,561 | 0,500 | 0,529 | 0,872 | 0,586 |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 109,5 M de parámetros): aproximadamente 0,44 GB en fp32 y 0,22 GB en fp16 para los pesos, más el sobrecoste de activaciones y runtime; en la práctica se puede operar con menos de 1-2 GB de VRAM.
- Inferencia en CPU perfectamente viable; es un encoder de frases de tamaño medio, no un modelo generativo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre, incluidas T4, RTX 3060, RTX 4090; también A100 o H100 si se comparte infraestructura existente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: `setfit` (vía `SetFitModel.from_pretrained`), `sentence-transformers`/`transformers` para el cuerpo, exportación a ONNX Runtime, y endpoints gestionados de Hugging Face. No se documentan soporte en vLLM, llama.cpp, Ollama ni TGI para este formato de clasificador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado en la información disponible resultados de benchmarks de modelos comparables que resuelvan esta misma aserción. La única comparación directa posible es con su modelo base:

| Modelo | Parámetros | Tarea | Contexto | Licencia | Rendimiento en esta tarea |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_sentence_quotes_or_reads_text_aloud` | 109,5 M | Clasificación binaria de la aserción (cita o lectura en voz alta) | no disponible | no disponible | F1 0,5286 / ROC-AUC 0,8724 en test |
| `sentence-transformers/paraphrase-mpnet-base-v2` (base) | ~109 M | Embeddings de frases para similitud semántica | no disponible | no disponible | No resuelve la tarea por sí mismo |
| Otros clasificadores de la colección EduBehaviors | no disponible | Otras aserciones de comportamiento docente | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores (alfa de Krippendorff) es de 0,661, un valor moderado que acota el techo de calidad del modelo.
- Entrenado exclusivamente con intervenciones de profesorado; el comportamiento sobre habla de estudiantes no está evaluado.
- Desequilibrio extremo de clases: solo el 3,4% de los ejemplos son positivos. En test, la precisión de la clase positiva es 0,5606 y el recall 0,5, de modo que aproximadamente la mitad de las predicciones positivas son falsos positivos y la mitad de los positivos reales se pierden.
- ROC-AUC de 0,8724 frente a F1 de 0,5286: el modelo ordena razonablemente bien por probabilidad, pero el umbral por defecto no está calibrado para el desequilibrio; conviene ajustar el umbral según el caso de uso.
- El ROC-AUC alto con una precision-recall baja indica que la métrica de ranking sobreestima la utilidad práctica en una tarea con una clase positiva tan rara; se recomienda evaluar con average precision (0,586 en test).
- Solo inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- El modelo trabaja sobre una única intervención; no modela el contexto conversacional previo, lo que limita la detección de citas cuyo carácter textual solo se entiende con el turno anterior.
- Sesgo de dominio: los datos provienen del corpus TalkMoves, por lo que el rendimiento fuera de ese tipo de aulas, niveles educativos o materias no está caracterizado.
- Licencia no declarada en la información disponible: no puede asumirse uso comercial sin consultar al autor.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de etiquetado erróneo con alta confianza, especialmente en intervenciones ambiguas.
- Las métricas publicadas están marcadas como no verificadas; no han pasado una validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StanfordSCALE/assertion_sentence_quotes_or_reads_text_aloud
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Dataset TalkMoves (GitHub): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: no disponible en la información proporcionada (se instala vía `pip install setfit` para el uso básico del modelo)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas generales de YouTube y no guardan relación con esta ficha.
