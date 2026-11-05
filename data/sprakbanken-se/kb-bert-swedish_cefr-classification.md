# sprakbanken-se/KB-bert-swedish_CEFR-classification

## Resumen

KB-bert-swedish_CEFR-classification es un modelo de clasificación de texto en sueco, desarrollado por el grupo Computational SLA de Språkbanken Text (Universidad de Gotemburgo). Su función concreta es asignar un nivel CEFR (A1, A2, B1, B2 o C1) a redacciones escritas por estudiantes de sueco como segunda lengua. El modelo no cubre el nivel C2, porque no había datos de entrenamiento suficientes y porque ese nivel mide competencias distintas al resto de la escala.

Técnicamente es un fine-tuning del checkpoint KB/bert-base-swedish-cased, un BERT base con 124,7 millones de parámetros y vocabulario en sueco. El modelo resultante es un clasificador de secuencias (text-classification) que recibe un ensayo completo y devuelve una de las cinco etiquetas CEFR. Fue presentado en el artículo "Jingle BERT, Jingle BERT, Frozen All the Way" (NLP4CALL 2024), centrado en el efecto de congelar capas del encoder durante el fine-tuning.

Es relevante para investigación en evaluación automática de lenguas (CALL) y para construir herramientas didácticas que muestren un nivel estimado de competencia. El propio autor advierte que las predicciones son ilustrativas y no deben usarse en contextos de alto riesgo (evaluación oficial, decisiones migratorias o académicas), dado su rendimiento limitado y los problemas de accountability asociados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT base (fine-tuning de KB/bert-base-swedish-cased) |
| Parametros totales | 124.695.301 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite 512 tokens, aunque la model card no lo especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sueco (sv) |
| Licencia | GPL-3.0 (según la model card; el campo de licencia del repo aparece como no disponible) |
| Formato de pesos | safetensors, PyTorch (pytorch) |

## Arquitectura y entrenamiento

El modelo parte de KB/bert-base-swedish-cased, un encoder transformer BERT base entrenado con texto en sueco y tokenización case-sensitive. Sobre esa base se añade una cabeza de clasificación para las cinco clases CEFR (A1 a C1). El artículo asociado investiga explícitamente el efecto de congelar capas del encoder durante el fine-tuning, lo que sugiere que la estrategia de entrenamiento se centró en ajustar solo un subconjunto de capas para reducir sobreajuste con un corpus limitado.

La model card no publica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo pasos de RLHF o DPO (no aplicables en un clasificador). El corpus de partida son ensayos heterogéneos de aprendices de sueco como segunda lengua, con variedad de temas y formatos. No se documentan innovaciones como decodificación especulativa ni atención lineal: es un fine-tuning estándar de BERT para clasificación.

## Capacidades

- Clasificación de texto en sueco: asigna un nivel CEFR (A1, A2, B1, B2, C1) a un ensayo de aprendiz.
- Análisis de competencia lingüística escrita: el modelo infiere el nivel a partir de rasgos léxicos, gramaticales y de complejidad del texto.
- Procesamiento de documentos completos (ensayos), no de frases sueltas, dentro del límite de tokens del encoder.
- Uso monolingüe: solo sueco; no se documenta soporte multilingüe.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking.
- No tiene capacidades de visión, audio ni generación de texto libre: la salida es una etiqueta de clasificación.
- No cubre el nivel C2 de la escala CEFR.

## Casos de uso

- Herramientas didácticas de autoaprendizaje: integrar el modelo en una plataforma donde el estudiante de sueco envíe una redacción y reciba una estimación orientativa de su nivel CEFR, con el aviso de que no sustituye una evaluación humana.
- Investigación en CALL (Computer-Assisted Language Learning): usar el modelo como línea base o componente en estudios sobre evaluación automática de competencia escrita en sueco L2.
- Seguimiento de progreso en cursos de idiomas: procesar redacciones periódicas de un mismo alumno para observar la evolución del nivel estimado a lo largo del tiempo, siempre como señal complementaria.
- Análisis de corpus de aprendices: clasificar grandes colecciones de ensayos de sueco L2 por nivel para segmentar corpus de investigación o construir subconjuntos etiquetados.
- Generación de material adaptado por nivel: usar la etiqueta predicha para enrutar textos hacia ejercicios o recursos didácticos calibrados a un nivel concreto (A1-C1).
- Prototipos y demos de evaluación lingüística: el modelo es pequeño (124,7 M de parámetros) y cabe en una GPU consumer, lo que facilita desplegar demos interactivas de bajo coste.
- Filtrado y triaje en plataformas educativas: preclasificar redacciones antes de la revisión humana, priorizando la atención del profesorado en los casos dudosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo de NLP4CALL 2024 para los resultados detallados, pero no incluye tablas de métricas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,5 GB de pesos (124,7 M de parámetros); en FP16, en torno a 0,25 GB. Con overhead de activaciones y batch pequeño, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. Para lotes grandes o despliegue en servidor, A100 o H100 están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante).
- Opciones de despliegue: PyTorch nativo con Transformers (pipeline de text-classification), TorchServe, ONNX Runtime, o exportación a otros runtimes. No se documentan integraciones específicas con vLLM, llama.cpp u Ollama (no aplicables a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KB-bert-swedish_CEFR-classification | 124,7 M | no disponible | Clasificación CEFR en sueco | GPL-3.0 | HuggingFace |
| KB/bert-base-swedish-cased | 124,7 M | 512 tokens (BERT base) | Modelo base de lenguaje en sueco | no disponible en la información | HuggingFace |
| Otros clasificadores CEFR para sueco | no disponible | no disponible | Clasificación CEFR | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado: el propio autor indica que la precisión es relativamente baja para usos de alto riesgo; las predicciones son ilustrativas, no autoritativas.
- No apto para evaluación oficial: no debe usarse para decisiones de migración, trabajo, educación ni certificación lingüística.
- Sesgos potenciales: el corpus de entrenamiento es heterogéneo en temas y formatos, lo que puede introducir sesgos de dominio. Está en estudio el impacto de la lengua materna del autor del ensayo sobre las predicciones.
- Cobertura incompleta de la escala: no clasifica el nivel C2.
- Monolingüe: solo sueco; no funciona con otros idiomas.
- Licencia GPL-3.0: implica obligaciones de copyleft para uso comercial y distribución de derivados; conviene revisar la compatibilidad con el producto antes de integrarlo.
- Sin datos de benchmarks publicados en el repositorio: la validación debe hacerse contra el artículo o con evaluación propia.
- Model card incompleta: secciones de entrenamiento, evaluación e impacto ambiental marcadas como pendientes (TODO) por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/sprakbanken-se/KB-bert-swedish_CEFR-classification
- Modelo base: https://huggingface.co/KB/bert-base-swedish-cased
- Artículo (ACL Anthology): https://aclanthology.org/2024.nlp4call-1.11/
- Språkbanken Text: https://spraakbanken.gu.se/en
- Grupo Computational SLA: https://spraakbanken.gu.se/en/projects/computational-sla
- Perfil del autor en HuggingFace: https://huggingface.co/rimusa
- Escala CEFR (Wikipedia): https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages
