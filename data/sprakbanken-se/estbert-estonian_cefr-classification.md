# sprakbanken-se/estbert-estonian_CEFR-classification

## Resumen

EstBERT-estonian_CEFR-classification es un modelo BERT afinado para clasificar textos escritos en estonio por aprendices de segunda lengua según su nivel del Marco Común Europeo de Referencia (MCER/CEFR). Lo desarrolla el grupo Computational SLA de Språkbanken Text (Universidad de Gotemburgo), y lo comparte en HuggingFace Ricardo Muñoz Sánchez. Parte del modelo base tartuNLP/EstBERT, un BERT base entrenado específicamente para estonio, y se ha ajustado sobre la versión UniversalCEFR del corpus ELLE de estonio.

El modelo resuelve una tarea concreta: asignar un nivel de competencia lingüística (de A2 a C1) a redacciones de aprendices. Es relevante para investigación en adquisición de segundas lenguas asistida por computación (SLA computacional) y para construir herramientas de retroalimentación formativa, pero no sustituye una evaluación humana certificada. Solo cubre cuatro niveles de la escala: excluye A1 y C2 por falta de datos de entrenamiento.

Con 124,4 millones de parámetros y una arquitectura transformer encoder de tipo BERT, es un modelo pequeño y desplegable en CPU. Su utilidad principal es la clasificación de secuencias cortas o medianas (redacciones), no la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) |
| Parametros totales | 124.444.420 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (hereda la de tartuNLP/EstBERT; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion a int8 mediante herramientas externas) |
| Idiomas soportados | estonio (et) |
| Licencia | GPL-3.0 (segun la model card; el campo de licencia de HuggingFace figura como no disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, ~124 M de parámetros) con una cabeza de clasificación de secuencias sobre el token [CLS]. Se inicializa desde tartuNLP/EstBERT, un checkpoint de BERT entrenado desde cero con corpus estonios, y se afina para clasificación multietiqueta de cuatro clases CEFR (A2, B1, B2, C1).

El ajuste sigue el procedimiento descrito en el paper "https://aclanthology.org/2024.nlp4call-1.11/" y utiliza el conjunto UniversalCEFR/elle_et, la versión normalizada del corpus ELLE de redacciones de aprendices de estonio. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, los hiperparámetros de ajuste ni si se aplicaron técnicas como RLHF o DPO (no aplicables en un clasificador). Tampoco se documentan innovaciones arquitectónicas adicionales: es un fine-tuning estándar de BERT para clasificación.

## Capacidades

- Clasificación de textos en estonio escrito por aprendices en cuatro niveles CEFR: A2, B1, B2 y C1.
- Asignación de una etiqueta de nivel por documento (clasificación de secuencia completa, no por fragmento).
- Procesamiento de redacciones y textos académicos o de examen en estonio.
- Funciona como extractor de representaciones contextuales del estonio (hereda las capacidades del encoder EstBERT).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente.
- No tiene capacidades multimodales (sin visión ni audio).
- Multilingüismo limitado al estonio; no se ha entrenado para otros idiomas.

## Casos de uso

- Herramientas de retroalimentación formativa para aprendices de estonio: el modelo asigna un nivel CEFR aproximado a una redacción y permite mostrar al estudiante una estimación orientativa de su progreso, siempre con la advertencia de que no es una evaluación oficial.
- Investigación en SLA computacional: clasificación masiva de corpus de aprendices para estudiar la distribución de niveles, la progresión léxico-gramatical o el efecto de la L1 del autor en el rendimiento del clasificador.
- Evaluación interna de materiales didácticos: comprobar si los textos de un manual o banco de ejercicios se corresponden con el nivel declarado (A2-C1) antes de publicarlos.
- Filtrado y curación de datasets: etiquetar automáticamente redacciones de estonio en repositorios de exámenes o plataformas de aprendizaje para organizar el corpus por dificultad.
- Clasificación por lotes en pipelines de investigación: al ser un modelo de 124 M de parámetros, se puede ejecutar en CPU sobre miles de documentos con un coste computacional bajo, integrándose en scripts de procesamiento de corpus.
- Módulo de un sistema de tutorización de lenguas: combinado con un corrector gramatical o un generador de feedback, el nivel CEFR estimado puede condicionar la complejidad de las sugerencias que se ofrecen al estudiante.
- Demo o prototipo de investigación: la model card indica explícitamente que está pensado para construir demos que muestren el nivel CEFR aproximado de textos de aprendices.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de evaluación marcadas como pendientes (TODO) y no reporta métricas de accuracy, F1 ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (124 M de parámetros), más memoria para activaciones y batch; en la práctica cabe en cualquier GPU con 2 GB o más.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1660, etc.
- Funciona en CPU sin problemas para inferencia por lotes; es la opción recomendada para despliegues de bajo coste.
- Opciones de despliegue: Transformers (PyTorch) con `AutoModelForSequenceClassification`, pipelines de HuggingFace, ONNX Runtime, o conversión a GGUF para llama.cpp/Ollama si se desea un binario ligero (no se proporcionan conversiones oficiales).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sprakbanken-se/estbert-estonian_CEFR-classification | 124,4 M | no disponible | Clasificación CEFR en estonio (A2-C1) | GPL-3.0 | HuggingFace |
| tartuNLP/EstBERT | ~124 M (BERT base) | no disponible | Modelo base de estonio (encoder) | no disponible en la informacion proporcionada | HuggingFace |
| Modelos CEFR multilingües de UniversalCEFR | no disponible | no disponible | Clasificación CEFR multilingüe | no disponible | HuggingFace (organización UniversalCEFR) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Solo cubre cuatro niveles (A2, B1, B2, C1); no predice A1 ni C2 por falta de datos de entrenamiento, por lo que los textos de esos niveles se forzarán a una de las cuatro clases.
- El propio autor advierte que las predicciones son ilustrativas y no deben usarse como evaluación autoritativa.
- No debe desplegarse en contextos de alto riesgo: evaluación lingüística oficial, decisiones de migración, empleo o educación.
- Sesgos potenciales por temas y formatos del corpus de entrenamiento (redacciones de aprendices), lo que puede reducir la generalización a otros géneros.
- El efecto de la lengua materna del autor sobre las predicciones está en estudio y no se ha caracterizado aún.
- Licencia GPL-3.0: impone obligaciones de copyleft si se distribuye el modelo o software derivado; conviene revisar su compatibilidad con el producto antes de un uso comercial.
- Entrenado únicamente para estonio; no es válido para otros idiomas sin reentrenamiento.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí de calibración deficiente: la probabilidad asignada a cada nivel puede no reflejar la incertidumbre real.
- La model card está incompleta (secciones de datos, hiperparámetros y evaluación pendientes), lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sprakbanken-se/estbert-estonian_CEFR-classification
- Modelo base EstBERT: https://huggingface.co/tartuNLP/EstBERT
- Dataset UniversalCEFR ELLE estonio: https://huggingface.co/datasets/UniversalCEFR/elle_et
- Paper de referencia: https://aclanthology.org/2024.nlp4call-1.11/
- Grupo Computational SLA de Språkbanken: https://spraakbanken.gu.se/en/projects/computational-sla
- Språkbanken Text: https://spraakbanken.gu.se/en
- Perfil del autor en HuggingFace: https://huggingface.co/rimusa
