# Tieppo/triia-classificador-reclamacoes

## Resumen

TriIA es un clasificador de texto en portugués desarrollado por Tieppo para la triaje automática de reclamaciones de comercio electrónico. No es un modelo de lenguaje generativo, sino un pipeline clásico de scikit-learn que combina vectorización TF-IDF a nivel de palabra y de carácter, 44 reglas binarias derivadas del texto y una regresión logística con `C=10` como clasificador final. Distribuye las reclamaciones en ocho categorías distintas.

El modelo se entrenó sobre 2.498 mensajes cuyas etiquetas se generaron con asistencia de Claude, y se evaluó sobre un conjunto separado de 300 mensajes rotulados manualmente, obteniendo una accuracy del 82,3 % y un F1 macro del 65,7 %. La brecha entre ambas métricas refleja el desequilibrio entre clases y el ruido introducido por los rótulos automáticos del conjunto de entrenamiento.

Su relevancia es práctica: ofrece una línea base ligera y reproducible (artefacto `joblib`, licencia MIT) para preclasificar reclamaciones antes de una revisión humana, sin necesidad de GPU ni de infraestructura de inferencia de modelos neuronales. El autor advierte explícitamente de que no sustituye la revisión humana en decisiones sensibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: TF-IDF (palabras y caracteres) + 44 reglas binarias + regresión logística (`C=10`) |
| Parámetros totales | no disponible (modelo lineal; el número de coeficientes depende del vocabulario y las features) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; procesa cada mensaje de forma independiente) |
| Tipos de cuantización | no aplica (artefacto `joblib` de scikit-learn) |
| Idiomas soportados | portugués (pt) |
| Licencia | MIT (código); los datos de origen tienen sus propios términos |
| Formato de pesos | `model.joblib` (pickle de scikit-learn); módulos auxiliares en `triagem_code.zip` |

## Arquitectura y entrenamiento

El sistema es un clasificador de texto clásico, no un transformer. La entrada pasa por dos extractores TF-IDF en paralelo, uno a nivel de palabra y otro a nivel de carácter, que se combinan con 44 reglas binarias calculadas sobre el texto. Sobre ese vector de features se ajusta una regresión logística con regularización `C=10`. El artefacto serializado con `joblib` se generó con scikit-learn 1.6.1, dato relevante para la compatibilidad en el momento de cargarlo.

El entrenamiento usó 2.498 mensajes derivados de las reseñas públicas del conjunto Olist, filtrados y reetiquetados para este proyecto. Las etiquetas de entrenamiento se generaron con apoyo de Claude, lo que el propio autor identifica como fuente de ruido. La evaluación se hizo sobre 300 mensajes rotulados manualmente por Mateus. El código y la metodología completos están publicados en el repositorio `Mateus-Tieppo/triagem-reclamacoes`, en el commit `a56e87b11ab6b8d83d76525293de69ade7469c68`. No se documenta uso de RLHF, DPO ni ninguna innovación de decodificación, ya que no hay generación de texto.

## Capacidades

- Clasificación de reclamaciones de comercio electrónico en ocho categorías.
- Procesamiento de texto en portugués a nivel de palabra y de carácter, lo que aporta robustez frente a variaciones morfológicas y errores tipográficos.
- Aplicación de 44 reglas binarias explícitas sobre el texto de entrada, lo que facilita la inspección de parte de la lógica de decisión.
- Inferencia sobre mensajes individuales, sin gestión de contexto multi-turno.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-step ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al portugués.

## Casos de uso

- Triaje previo de reclamaciones en atención al cliente: el clasificador etiqueta cada mensaje entrante en una de las ocho categorías antes de asignarlo a un equipo, lo que reduce el tiempo de encaminamiento manual en volúmenes altos de tickets.
- Enrutamiento a colas especializadas: las categorías predichas permiten dirigir reclamaciones de logística, producto o pago al equipo correspondiente, con un umbral de revisión humana configurable según la confianza de la predicción.
- Priorización de casos sensibles: combinado con la interfaz del repositorio original, que incluye un umbral de revisión humana, sirve para marcar automáticamente los casos que requieren intervención de un operador.
- Análisis de tendencias de quejas: al clasificar lotes históricos de reclamaciones se pueden agregar las categorías para detectar qué tipos de incidencia crecen en el tiempo y priorizar su resolución.
- Filtrado de ruido en pipelines de datos: descarta o reclasifica mensajes que no corresponden a reclamaciones reales antes de pasarlos a sistemas más costosos.
- Prototipado rápido y entornos con recursos limitados: al ser un artefacto `joblib` de scikit-learn, se despliega en CPU sin GPU, lo que permite integrarlo en servicios ligeros o en pruebas de concepto antes de invertir en un modelo neuronal.
- Generación de conjuntos de datos etiquetados: sus predicciones pueden usarse como etiquetas preliminares para revisión humana y para ampliar el corpus de entrenamiento de modelos posteriores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card:

| Métrica | Valor |
|---|---|
| Accuracy (300 mensajes rotulados manualmente) | 82,3 % |
| F1 macro (300 mensajes rotulados manualmente) | 65,7 % |
| Tamaño del conjunto de entrenamiento | 2.498 mensajes |
| Tamaño del conjunto de evaluación | 300 mensajes |

El model-index del autor no incluye resultados adicionales. No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU de consumo, y también en entornos sin GPU.
- Opciones de despliegue: carga directa del artefacto `joblib` con scikit-learn 1.6.1, o mediante los módulos de `triagem_code.zip` y el script `inference.py` del repositorio. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de pesos neuronales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores de reclamaciones ni con modelos de la misma categoría.

## Limitaciones y advertencias

- Los rótulos del conjunto de entrenamiento se generaron con apoyo de Claude y el propio autor los señala como fuente de ruido.
- El conjunto de evaluación manual es pequeño (300 mensajes); el autor advierte de que no debe usarse como estimación definitiva de producción.
- La diferencia entre accuracy (82,3 %) y F1 macro (65,7 %) indica un rendimiento desigual entre las ocho categorías.
- El modelo no sustituye la revisión humana en decisiones sensibles.
- Solo soporta portugués; no está diseñado para otros idiomas.
- El artefacto `model.joblib` es un pickle de scikit-learn: cargarlo ejecuta código y debe hacerse únicamente si se confía en el repositorio de origen.
- Requiere scikit-learn 1.6.1 para garantizar la compatibilidad del artefacto.
- Los datos de entrenamiento derivan de las reseñas públicas de Olist, cuyos términos de uso son independientes de la licencia MIT del código; el conjunto bruto y los textos no se redistribuyen en el repositorio de Hugging Face.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tieppo/triia-classificador-reclamacoes
- Repositorio del proyecto: https://github.com/Mateus-Tieppo/triagem-reclamacoes
- Commit de referencia: `a56e87b11ab6b8d83d76525293de69ade7469c68`
