# sprakbanken-se/portbert-portuguese_CEFR-classification

## Resumen

PortBERT-portuguese_CEFR-classification es un modelo de clasificación de texto derivado de PortBERT_base mediante ajuste fino supervisado. Su tarea concreta es asignar un nivel del Marco Común Europeo de Referencia (CEFR) a redacciones escritas en portugués por aprendices de segunda lengua. Lo desarrolla el grupo Computational SLA de Språkbanken Text (Universidad de Gotemburgo), y la tarjeta del modelo lo atribuye a Ricardo Muñoz Sánchez. El modelo resuelve un problema acotado de evaluación automática de lenguas asistida por ordenador (CALL): estimar de forma aproximada el nivel de competencia escrita de un texto de aprendiz.

Arquitectónicamente es un transformer encoder de tipo RoBERTa, con 125.989.638 parámetros totales (aproximadamente 126 M, en la línea de una base BERT). Se distribuye en formato safetensors dentro de un repositorio de 0,5 GB y se integra en el ecosistema transformers con la etiqueta de pipeline `text-classification`. El modelo está entrenado sobre la versión UniversalCEFR del corpus COPLE2 en portugués.

Es relevante ahora porque ejemplifica el uso de modelos encoder compactos para tareas de clasificación lingüística especializada, con requisitos de hardware mínimos y despliegue sencillo. No obstante, el propio autor advierte que las predicciones son ilustrativas y no deben usarse en contextos de alto riesgo, como evaluaciones oficiales de lengua o decisiones administrativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (BERT para clasificación de texto) |
| Parametros totales | 125.989.638 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de PortBERT_base, un encoder de la familia RoBERTa adaptado al portugués, y se ajusta como clasificador de secuencias para predecir niveles CEFR. La tarea se formula como clasificación multiclase sobre redacciones de aprendices. El proceso de entrenamiento sigue la metodología descrita en el paper publicado en NLP4CALL 2024, y utiliza el conjunto UniversalCEFR/cople2_pt, una versión estandarizada del corpus COPLE2 de portugués como lengua extranjera.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO (poco habitual en clasificadores encoder) ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La tarjeta del modelo conserva numerosos apartados sin completar (preprocesamiento, hiperparámetros, evaluación, impacto ambiental), por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Clasificación de texto en portugués: asigna a una redacción de aprendiz uno de los niveles CEFR.
- Evaluación aproximada de competencia escrita en contextos de aprendizaje de lenguas.
- Procesamiento de textos de entrada de longitud variable (la longitud máxima concreta no está documentada).
- Integración nativa con la librería transformers y con text-embeddings-inference.
- Compatibilidad con endpoints de HuggingFace (tag `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para flujos de agentes.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al portugués; no se documenta soporte para otras lenguas.

## Casos de uso

- Herramientas de autoaprendizaje de portugués: el modelo puede integrarse en una aplicación que, tras recibir una redacción del estudiante, devuelva un nivel CEFR orientativo y permita al alumno seguir su progreso a lo largo del tiempo.
- Generación de material didáctico adaptado: un sistema puede clasificar textos de ejemplo por nivel y seleccionar lecturas o ejercicios adecuados al nivel del alumnado.
- Investigación en adquisición de segundas lenguas: los investigadores pueden usar el modelo para etiquetar grandes colecciones de redacciones y analizar distribuciones de nivel, siempre con validación humana.
- Preetiquetado en anotación de corpus: el modelo sirve como primer paso para anotadores humanos que revisan y corrigen los niveles CEFR asignados, reduciendo el coste de anotación manual.
- Demos y prototipos educativos: por su tamaño (126 M de parámetros) puede desplegarse en CPU o en GPU de consumo, lo que facilita prototipos rápidos en entornos docentes.
- Filtrado y organización de repositorios de textos: clasificar automáticamente una colección de redacciones por nivel para facilitar su búsqueda y recuperación.
- Análisis comparativo de cohortes: agrupar redacciones por nivel estimado para estudiar diferencias entre grupos de aprendices, con las cautelas estadísticas oportunas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo incluye apartados de evaluación sin completar y no proporciona métricas como exactitud, F1, MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en precisión completa (fp32) para los 126 M de parámetros, más el overhead del runtime; en fp16 o bf16 se reduce a unos 0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas tarjetas de consumo como GTX 1650, RTX 3050 o superiores. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en hardware integrado para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference, HuggingFace Inference Endpoints. No se documenta soporte explícito para vLLM, llama.cpp u Ollama (este último orientado a modelos generativos, no a clasificadores encoder).
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera una latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sprakbanken-se/portbert-portuguese_CEFR-classification | 125.989.638 | no disponible | Clasificación CEFR en portugués | GPL-3.0 | HuggingFace |
| PortBERT/PortBERT_base (modelo base) | no disponible | no disponible | Representaciones de portugués (encoder) | no disponible | HuggingFace |
| Modelos CEFR para otras lenguas del grupo Computational SLA | no disponible | no disponible | Clasificación CEFR en otras lenguas | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Las predicciones deben considerarse ilustrativas y no autoritativas; el autor lo indica explícitamente.
- No debe usarse en contextos de alto riesgo: evaluación oficial de lengua, decisiones migratorias, laborales o educativas.
- El rendimiento es relativamente bajo para esos escenarios según el propio autor, y existen problemas de responsabilidad (accountability) no resueltos.
- Sesgos potenciales derivados de la heterogeneidad del dataset de redacciones: posibles sesgos de tema y formato.
- El impacto de la lengua materna del autor del texto sobre las predicciones está en estudio y aún no se ha documentado.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y redistribución; conviene revisar su compatibilidad con el producto antes de integrarlo.
- Soporte limitado al portugués; no se documenta comportamiento en otras lenguas.
- Longitud de contexto no documentada; textos muy largos pueden truncarse sin que se especifique el límite.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas con alta confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sprakbanken-se/portbert-portuguese_CEFR-classification
- Modelo base: https://huggingface.co/PortBERT/PortBERT_base
- Dataset UniversalCEFR/cople2_pt: https://huggingface.co/datasets/UniversalCEFR/cople2_pt
- Paper de referencia (NLP4CALL 2024): https://aclanthology.org/2024.nlp4call-1.11/
- Grupo Computational SLA, Språkbanken Text: https://spraakbanken.gu.se/en/projects/computational-sla
- Språkbanken Text: https://spraakbanken.gu.se/en
- Perfil del autor en HuggingFace: https://huggingface.co/rimusa
- Niveles CEFR (Wikipedia): https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages
