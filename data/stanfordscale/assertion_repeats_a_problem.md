# StanfordSCALE/assertion_repeats_a_problem

## Resumen

StanfordSCALE/assertion\_repeats\_a\_problem es un clasificador binario de texto entrenado con SetFit para detectar una afirmación concreta ("repeats a problem", repetir un problema) en intervenciones de docentes dentro de conversaciones de aula. El modelo forma parte de la iniciativa Stanford SCALE y del conjunto de esquemas basados en aserciones para el codificado auditable de diálogo educativo ("EduBehaviors"), y se distribuye a través del paquete Python EduBehaviors-kit. No es un modelo generativo: es un cabezal de clasificación supervisado que devuelve una etiqueta y una probabilidad por fragmento de texto.

Técnicamente se construye sobre el encoder sentence-transformers/paraphrase-mpnet-base-v2 (aproximadamente 109,5 millones de parámetros) mediante la técnica SetFit, que combina una fase contrastiva de ajuste fino del cuerpo con un cabezal de regresión logística. El entrenamiento se realizó sobre un subconjunto anotado por anotadores LLM del TalkMoves Dataset, con columnas específicas para esta aserción y su etiqueta de partición. El idioma soportado es únicamente el inglés.

Su relevancia es acotada y muy específica: cubre una tarea de investigación en analítica del discurso en el aula con una tasa base muy baja (4,2% de positivos), y el propio autor advierte que su F1 en test (0,356) no es suficiente para usarlo de forma autónoma. Por tanto, debe considerarse un componente de un pipeline mayor, con supervisión humana y posiblemente como señal auxiliar o de preanotación, no como un sistema de decisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit (encoder tipo transformer MPNet + cabezal de regresión logística) |
| Parámetros totales | 109.486.464 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería setfit) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en lugar de ajustar un clasificador de secuencia clásico, primero se ajusta de forma contrastiva el cuerpo sentence-transformers/paraphrase-mpnet-base-v2 (un encoder MPNet afinado para similitud de frases) y después se entrena un cabezal de regresión logística sobre las representaciones resultantes. El cuerpo se ajustó con un learning rate de 2e-05, un batch size de 16, hasta 5000 pasos como máximo y 10 épocas, mientras que el cabezal usó un learning rate de 0.01 y un batch size de 32. La semilla fijada es 20260904 y se habilitó precisión mixta en GPU.

Los datos provienen del dataset StanfordSCALE/assertions\_llm\_annotated\_talkmoves, derivado del TalkMoves Dataset y restringido a intervenciones de docentes. El reparto es de 13.178 ejemplos de entrenamiento (53,3%), 3.297 de desarrollo (13,3%) y 8.240 de test (33,3%). Las etiquetas fueron generadas por anotadores LLM, no por codificadores humanos, con un alfa de Krippendorff de 0,442 para esta aserción, un valor que indica una concordancia moderada-baja. La tasa base global de positivos es del 4,2% (4,3% en train, 4,0% en dev, 4,1% en test), lo que sitúa la tarea en un régimen claramente desbalanceado. El texto de entrada se construye únicamente con la intervención (`{utterance}`), sin plantilla adicional, y se pasa tal cual al modelo.

## Capacidades

- Clasificación binaria de texto: identifica si una intervención docente cumple la aserción "repeats a problem" (etiqueta 1) o no (etiqueta 0).
- Salida probabilística mediante `predict_proba`, lo que permite fijar umbrales personalizados distintos del 0,5 por defecto.
- Codificación de diálogo educativo orientada a la investigación en discurso de aula (classroom discourse).
- Integración con el paquete Python EduBehaviors-kit para el codificado basado en aserciones.
- Ejecución sobre una única intervención de texto en inglés, sin necesidad de contexto multi-turno explícito.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No es multilingüe: solo inglés.
- No genera texto.

## Casos de uso

- Preanotación de corpus de discurso en el aula: el modelo puede etiquetar automáticamente grandes volúmenes de intervenciones docentes para reducir el trabajo de codificación manual, dejando la revisión final a anotadores humanos dado el F1 bajo.
- Investigación en analítica del aprendizaje: sirve como señal cuantitativa para estudiar la frecuencia con la que los docentes reformulan o repiten problemas durante una lección, siempre tratando los positivos como candidatos y no como verdades.
- Filtrado y priorización de transcripciones: dado el desbalance (4,2% de positivos), puede usarse para seleccionar fragmentos candidatos que un investigador revisará después, aprovechando su ROC-AUC de 0,759.
- Componente dentro de un pipeline EduBehaviors: se combina con otros clasificadores de aserciones del mismo conjunto (bu5) para construir una codificación estructurada de la sesión.
- Análisis comparativo entre docentes o sesiones: agregando las probabilidades por docente, grupo o unidad didáctica se pueden comparar patrones de reformulación de problemas, con las cautelas estadísticas oportunas por la baja prevalencia.
- Evaluación de sistemas de anotación automática: sirve como referencia base para medir si un LLM zero-shot o un anotador humano superan este clasificador en la misma tarea.
- Enseñanza y reproducción metodológica: ejemplo didáctico de entrenamiento SetFit sobre un dataset desbalanceado y con etiquetas derivadas de LLM.
- No es adecuado para moderación de contenido, atención al cliente, generación de código, resumen, traducción ni tareas de producción con decisiones automatizadas sin supervisión.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.297 | 4,0% | 0,360 | 0,241 | 0,288 | 0,767 | 0,254 |
| test | 8.240 | 4,1% | 0,412 | 0,314 | 0,356 | 0,759 | 0,255 |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los aproximadamente 109,5 millones de parámetros ocupan alrededor de 440 MB; en FP16 unos 220 MB; en INT8 unos 110 MB. Son cifras orientativas derivadas del recuento de parámetros, no publicadas por el autor.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090 y similares, y también en CPU.
- GPU recomendadas: no requiere GPU dedicada; una GPU modesta acelera el procesamiento por lotes de corpus grandes. Para lotes muy grandes, una A100 o H100 solo aportarían ventaja por paralelismo, no por requisitos de memoria.
- Despliegue: paquete `setfit` (que envuelve sentence-transformers y PyTorch), así como infraestructura estándar de Hugging Face para transformers. No aplican vLLM, llama.cpp u Ollama porque el modelo no es generativo, aunque sería exportable a ONNX para servir como clasificador.
- Latencia y throughput: no disponibles. Al ser un encoder de unos 109 millones de parámetros, la inferencia por muestra en GPU es de milisegundos y en CPU de decenas de milisegundos, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos numéricos comparables publicados en la información proporcionada para otros clasificadores de aserciones de la misma familia ni para alternativas externas.

| Modelo | Parámetros | Contexto | F1 (test, clase positiva) | ROC-AUC | Licencia |
|---|---|---|---|---|---|
| StanfordSCALE/assertion\_repeats\_a\_problem | 109.486.464 | no disponible | 0,356 | 0,759 | no disponible |
| sentence-transformers/paraphrase-mpnet-base-v2 (base) | ~109 M | no disponible | no aplica (no clasificador) | no aplica | no disponible |
| Otras aserciones del conjunto bu5 de StanfordSCALE | no disponible | no disponible | no disponible | no disponible | no disponible |
| Clasificadores alternativos (BERT fine-tuned, zero-shot con LLM) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos, y la concordancia entre anotadores medida con alfa de Krippendorff es de 0,442, un valor moderado-bajo.
- El modelo se entrenó únicamente sobre intervenciones de docentes; su comportamiento sobre habla de estudiantes no está probado.
- El F1 en test es de 0,356 y el propio autor indica explícitamente que no funciona lo bastante bien para usarse por sí solo.
- La clase positiva es muy poco frecuente (4,2% global), lo que hace que la precision y el recall sean frágiles ante cambios de umbral y de distribución.
- Existe riesgo de falsos positivos y falsos negativos en proporción elevada; cualquier uso debe contemplar revisión humana.
- Solo soporta inglés; no hay evidencia de comportamiento en otros idiomas.
- No hay información sobre sesgos demográficos, de género, culturales o geográficos en los datos de entrenamiento.
- La licencia no está especificada en la información disponible, por lo que no puede confirmarse la viabilidad de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Los resultados declarados están marcados como no verificados (verified: false) en el model-index.
- No es un modelo generativo y no debe emplearse para tareas de generación, resumen o diálogo.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/StanfordSCALE/assertion_repeats_a_problem
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Repositorio del TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Librería SetFit: https://github.com/huggingface/setfit
