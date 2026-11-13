# Taka1908/nmtafe-dropout-risk

## Resumen

NMTAFE Early Dropout-Risk Detection (AT4) es un modelo de clasificación tabular orientado a predecir el riesgo de abandono o fracaso de estudiantes universitarios utilizando únicamente los primeros 90 días de un curso. Lo desarrolla el usuario Taka1908 y se publica bajo licencia Apache 2.0. El modelo resuelve un problema acotado pero relevante en el ámbito educativo: generar listas semanales de alumnos en riesgo para que el personal de apoyo pueda intervenir de forma temprana.

Técnicamente no es un modelo de lenguaje ni una red neuronal de gran escala. El artefacto final es un clasificador XGBoost con 56 características, 218 árboles, profundidad 5 y mejor iteración en 188. Se exploró una arquitectura híbrida con una LSTM de 4 capas y 64 unidades que procesaba clics diarios durante 91 días, pero la búsqueda de pesos del híbrido eligió el 100 % de peso para XGBoost, descartando de facto la rama neuronal en la predicción final. El umbral de decisión está fijado en 0,38.

El modelo se entrena sobre el Open University Learning Analytics Dataset (OULAD) de Kuzilek et al. (2017), un corpus público con licencia CC-BY 4.0 procedente de Reino Unido (curso 2013-14). Su relevancia es limitada y muy específica: sirve como referencia metodológica para equipos de analítica educativa que quieran replicar un pipeline de detección temprana, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosting sobre árboles); rama LSTM explorada pero con peso 0 en el híbrido final |
| Parametros totales | 218 árboles, profundidad 5, mejor iteración 188; 56 características de entrada (número de parámetros exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular; la LSTM procesaba secuencias de 91 días de clics) |
| Tipos de cuantizacion | No disponible (no es un modelo neuronal desplegable con cuantización estándar) |
| Idiomas soportados | No disponible (modelo tabular; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | xgb_dropout.json (XGBoost), lstm_dropout.pt (PyTorch), scaler.pkl (StandardScaler), config.json |

## Arquitectura y entrenamiento

El modelo final es un clasificador XGBoost entrenado sobre 56 características tabulares derivadas de los primeros 90 días de curso. La configuración reportada incluye 218 árboles, profundidad máxima 5 y mejor iteración en 188. Se probó también una arquitectura híbrida que combinaba el XGBoost con una LSTM de 4 capas y 64 unidades que consumía la serie diaria de clics a lo largo de 91 días; sin embargo, la búsqueda de pesos del híbrido asignó el 100 % del peso a la rama XGBoost, por lo que la LSTM no contribuye a la predicción final y se conserva únicamente como artefacto auxiliar en el repositorio.

Los datos de entrenamiento provienen del Open University Learning Analytics Dataset (OULAD), publicado por Kuzilek et al. (2017) bajo CC-BY 4.0, con datos de Reino Unido del curso 2013-14. Las características sensibles (género, discapacidad, edad, IMD y región) se excluyen explícitamente como entradas del modelo. No se documenta en la información disponible el número de tokens, el volumen exacto de muestras, ni si se aplicaron técnicas de regularización adicionales, validación cruzada o calibración de probabilidades más allá del ajuste del umbral a 0,38.

## Capacidades

- Clasificación binaria tabular: predice si un estudiante está en riesgo de retirarse o suspender a partir de 56 características.
- Predicción temprana: funciona con datos de solo los primeros 90 días del curso.
- Salida probabilística con umbral ajustable (0,38 por defecto), lo que permite priorizar la lista de riesgo.
- Artefactos separados para preprocesado (StandardScaler) y modelo, facilitando la reproducibilidad del pipeline.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües.
- No procesa texto, imágenes ni audio: es un modelo estrictamente tabular.
- Incluye pesos LSTM en PyTorch como componente exploratorio, aunque sin peso en la predicción final.

## Casos de uso

- Lista semanal de riesgo para tutores: el modelo genera una puntuación por estudiante con los datos de los primeros 90 días; el personal de apoyo revisa manualmente cada flag antes de contactar al alumno, tal como indica el autor.
- Priorización de intervenciones: con un umbral de 0,38 y un recall de 0,828 en test, el modelo tiende a señalar más estudiantes de los necesarios, lo que encaja con un uso de triaje donde el coste de un falso negativo es alto.
- Piloto de analítica educativa: sirve como línea base reproducible para que un equipo de datos compare sus propios modelos de abandono antes de invertir en infraestructura más compleja.
- Investigación y docencia: el repositorio incluye los artefactos completos (XGBoost, LSTM, scaler, config), lo que permite reproducir el experimento y estudiar por qué el híbrido descartó la rama neuronal.
- Auditoría de sesgo: al excluir explícitamente género, discapacidad, edad, IMD y región, el modelo puede usarse como ejemplo de diseño con variables sensibles vetadas en un pipeline educativo.
- Prototipado de sistemas de alerta temprana en otras instituciones: requiere reentrenamiento con datos locales, pero la estructura de características y el umbral sirven de plantilla para adaptar el enfoque a otros cursos o países.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre estudiantes no vistos en test:

| Metrica | Resultado | Objetivo declarado |
|---|---|---|
| Accuracy | 0,753 | > 0,90 |
| Precision | 0,651 | > 0,90 |
| Recall | 0,828 | > 0,90 |
| ROC-AUC | 0,858 | No disponible |

El modelo no alcanza ninguno de los objetivos de accuracy y precision fijados por el propio autor. El recall es el único valor cercano al umbral, lo que confirma el sesgo hacia la detección de positivos a costa de falsos positivos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; un modelo XGBoost de 218 árboles y profundidad 5 es muy ligero.
- GPU recomendadas: no requiere GPU; la inferencia puede ejecutarse en CPU sin problemas.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (servidores pequeños, portátiles, contenedores ligeros).
- Opciones de despliegue: inferencia nativa con la librería `xgboost` en Python, exportación a formato ONNX o Treelite si se necesita servir a baja latencia, y contenedores Docker con las dependencias de `xgboost`, `scikit-learn` (para el scaler) y `torch` solo si se quiere cargar la LSTM auxiliar.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo se espera un throughput alto en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia genérica de la categoría, los clasificadores de abandono estudiantil publicados sobre OULAD suelen emplear regresión logística, random forest o gradient boosting con métricas de ROC-AUC en el rango 0,80-0,90; el valor de 0,858 de este modelo es coherente con esa franja, pero no se dispone de comparaciones directas publicadas por el autor.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NMTAFE Dropout-Risk | 218 árboles, 56 features | No aplica | ROC-AUC 0,858 | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo no alcanza los objetivos de accuracy y precision declarados por el propio autor (> 0,90); su uso en producción sin revisión humana no está justificado.
- Entrenado con datos de Reino Unido del curso 2013-14 (OULAD); el autor advierte explícitamente que debe reentrenarse con datos locales antes de cualquier uso real.
- Riesgo de alucinación no aplica en sentido estricto, pero sí de falsos positivos y falsos negativos: con recall 0,828 y precision 0,651, aproximadamente un tercio de las alertas serán incorrectas.
- Cada flag debe ser revisado por una persona, según indica el autor; no debe usarse para decisiones automáticas sobre estudiantes.
- No se documentan análisis de sesgo más allá de la exclusión de variables sensibles como entradas; el sesgo puede persistir a través de variables proxy.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del dataset OULAD es CC-BY 4.0 y exige atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación externa.
- La rama LSTM incluida no participa en la predicción final; cargarla no mejora los resultados.
- No hay información sobre calibración de probabilidades, por lo que el umbral 0,38 debe tratarse como un parámetro heurístico y no como una probabilidad calibrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taka1908/nmtafe-dropout-risk
- Dataset OULAD (Kuzilek et al., 2017): https://analyse.kmi.open.ac.uk/open_dataset
- Referencia del dataset: Kuzilek, J., Hlosta, M., Zdrahal, Z. (2017). Open University Learning Analytics dataset. Scientific Data, 4, 170171.
- Documentación de XGBoost: https://xgboost.readthedocs.io/
- Documentación de PyTorch (para la LSTM auxiliar): https://pytorch.org/docs/stable/index.html
