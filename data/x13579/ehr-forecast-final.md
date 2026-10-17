# X13579/ehr-forecast-final

## Resumen

EHR Forecast es un modelo de clasificación tabular multi-etiqueta publicado en HuggingFace por el usuario X13579. Su objetivo es predecir el primer diagnóstico registrado de un paciente en un horizonte de cinco años, a partir de su historial clínico estructurado. No es un modelo de lenguaje: se implementa como un conjunto de 40 clasificadores LightGBM independientes (uno por código de diagnóstico objetivo) que operan sobre 512 características seleccionadas, extraídas de historiales clínicos sintéticos.

El modelo se entrena exclusivamente con datos sintéticos derivados de Synthea (Coherent Synthetic Data Set): 2.791 pacientes oficiales de entrenamiento y una partición de validación de 365 pacientes. La receta es fija y reproducible: 150 árboles por objetivo, 31 hojas, tasa de aprendizaje 0,05, tamaño mínimo de hoja 20, penalización L2 de 20, muestreo de filas y columnas de 0,8 y semilla base 20261016, sin ensamblado ni parada temprana.

Su relevancia es metodológica más que práctica: documenta un pipeline completo de pronóstico de diagnósticos con particiones oficiales, bloqueo de predicciones antes del cálculo de métricas y verificación de integridad del archivo. Los resultados publicados (mAP 0,246334 y AUROC macro 0,762251 en validación) son de datos sintéticos y no establecen rendimiento clínico real, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles de decisión (LightGBM), 40 clasificadores binarios independientes (multi-etiqueta) |
| Parametros totales | no disponible (40 modelos LightGBM, 150 árboles cada uno) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (entrada tabular de 512 características, sin ventana de tokens) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el formato nativo de LightGBM no requiere cuantización de pesos) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | `final_model.zip` con 40 ficheros nativos de LightGBM, definiciones de características ajustadas, índices de columnas seleccionadas y metadatos de integridad (46 miembros) |

## Arquitectura y entrenamiento

La arquitectura es un conjunto de 40 clasificadores LightGBM entrenados de forma independiente, uno por cada código de diagnóstico objetivo, sobre un vector de 512 características seleccionadas. La representación combina historial clínico estructurado, mediciones, trayectorias temporales, información de tiempos, patrones de valores ausentes, interacciones entre variables y hechos de exploraciones de imagen. Los predictores utilizan únicamente eventos estrictamente anteriores al punto de anclaje de cada paciente (anchor), lo que evita fuga de información futura. Se excluyen explícitamente campos de QALY/DALY/QOLS anuales, costes, campos de motivo y cargas de ADN, píxeles de imagen y ECG no verificadas.

El entrenamiento usa los 2.791 pacientes oficiales de entrenamiento con una receta fija y una única semilla (20261016), sin ensamblado ni early stopping. El preprocesamiento y la selección de características se ajustan solo sobre el conjunto de entrenamiento oficial. No se emplean datasets externos ni pesos preentrenados. Los datos proceden de Synthea; el repositorio no redistribuye los datos crudos ni filas de pacientes, solo los modelos y metadatos.

## Capacidades

- Predicción multi-etiqueta del primer diagnóstico registrado en un horizonte de cinco años, sobre 40 códigos objetivo.
- Clasificación tabular sobre 512 características clínicas derivadas: diagnósticos previos, mediciones, trayectorias, tiempos y ausencia de datos.
- Manejo explícito de valores ausentes y de patrones de missingness como señal predictiva.
- Integración de hechos de exploraciones de imagen en forma de variables tabulares (no procesa imágenes en bruto).
- Puesta a cero automática de los objetivos ya diagnosticados en el momento del anclaje, para evitar predicciones triviales.
- Ejecución mediante CLI (`ehr-forecast predict`) con comprobaciones de integridad de entrada y del archivo de modelos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.

## Casos de uso

- Investigación reproducible en pronóstico de diagnósticos: el repositorio incluye código, informe técnico y una receta fija con semilla, lo que permite replicar exactamente el experimento sobre los datos sintéticos de Synthea.
- Docencia y formación en pipelines de machine learning clínico: sirve como ejemplo completo de selección de características, ajuste solo en train, bloqueo de predicciones y evaluación en validación.
- Benchmark interno de modelos tabulares: al ser 40 clasificadores LightGBM con hiperparámetros documentados, se puede usar como línea base frente a alternativas (gradient boosting de otros proveedores, redes tabulares) sobre la misma partición.
- Pruebas de infraestructura de inferencia sanitaria: el CLI y la verificación SHA-256 permiten ensayar flujos de despliegue, control de versiones de modelos y validación de artefactos en entornos de laboratorio.
- Análisis de sensibilidad a valores ausentes: la representación incorpora missingness y tiempos, lo que facilita estudiar cómo varía la probabilidad predicha al alterar la completitud del historial.
- Prototipado de sistemas de estratificación de riesgo sobre datos sintéticos: permite construir y depurar la capa de ingestión de datos, el mapeo de códigos y la generación de probabilidades ordenadas por código objetivo antes de disponer de datos reales.
- Auditoría de metodología de evaluación: útil para estudiar el efecto de reutilizar particiones de validación, ya que el autor advierte explícitamente de este sesgo.

## Benchmarks y rendimiento

| Metrica | Valor | Particion | Notas |
|---|---|---|---|
| mAP | 0,246334 | Validación oficial (365 pacientes) | Predicciones bloqueadas antes del cálculo; conjunto reutilizado en versiones anteriores |
| AUROC macro | 0,762251 | Validación oficial (365 pacientes) | Igual advertencia: no es un conjunto oculto |
| Resultados en test | no disponible | Test oficial (358 pacientes) | Resultados retenidos por los organizadores |

No se han publicado resultados comparativos con otros modelos en la información disponible. El autor indica que las estimaciones para condiciones raras son inestables y que el rendimiento clínico en el mundo real no está establecido.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es de CPU. No se requiere GPU.
- GPU recomendadas: ninguna. El modelo son 40 ficheros LightGBM con 150 árboles y 31 hojas cada uno, carga ligera.
- GPU de consumo: irrelevante para este modelo; puede ejecutarse en cualquier portátil convencional.
- RAM estimada: no disponible de forma explícita; depende del volumen de datos de entrada y del pipeline de características, no del modelo en sí.
- Almacenamiento: el repositorio de HuggingFace reporta 0,0 GB; el ZIP contiene 46 miembros.
- Despliegue: CLI de Python incluida (`ehr-forecast predict`), LightGBM nativo y el pipeline del repositorio de GitHub. No se documentan exportaciones a ONNX, vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X13579/ehr-forecast-final | 40 clasificadores LightGBM, 150 árboles cada uno | no aplica (tabular, 512 características) | mAP 0,246334; AUROC macro 0,762251 en validación sintética | no disponible | HuggingFace + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (pronóstico de diagnósticos sobre datos de Synthea con la misma partición) en el material proporcionado, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con datos sintéticos de Synthea; el rendimiento en poblaciones reales no está establecido.
- El autor declara explícitamente que el modelo no ha sido validado para decisiones clínicas y no debe usarse con ese fin.
- Evaluación con una única semilla final y una partición de validación reutilizada en versiones anteriores del proyecto; los valores publicados no son puntuaciones de test oculto.
- Las estimaciones para enfermedades raras son inestables por baja prevalencia en la muestra.
- Sesgos poblacionales: la distribución de Synthea no reproduce la epidemiología, codificación ni demografía de un sistema sanitario real.
- Idiomas: solo inglés (`en`); los códigos y campos reflejan el esquema de los datos de origen.
- Licencia no disponible: no se puede confirmar si se permite uso comercial, modificación o redistribución; conviene contactar con el autor antes de cualquier uso productivo.
- Los datos crudos no se redistribuyen; es necesario disponer del conjunto de datos de la tarea con su estructura de directorios para ejecutar el pipeline.
- Dependencia estricta del orden de columnas y del preprocesamiento: el pipeline incluido debe usarse tal cual, con la versión de commit aceptada (`3a04344bdb009c2f339f54a7a998617ec3202fef`).
- El archivo de modelos no contiene filas de pacientes ni predicciones; cualquier inferencia requiere reconstruir las entradas con el código enlazado.
- La búsqueda web realizada no devolvió información técnica relevante sobre este modelo; los resultados obtenidos eran ajenos al contenido y no se han utilizado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/X13579/ehr-forecast-final)
- [Repositorio de código y reproducción](https://github.com/LL333111/ehr-forecast-final)
- [Informe técnico (PDF)](https://github.com/LL333111/ehr-forecast-final/blob/main/docs/results.pdf)
- [Commit de inferencia aceptado](https://github.com/LL333111/ehr-forecast-final/commit/3a04344bdb009c2f339f54a7a998617ec3202fef)
- [Aviso de atribución de Synthea (NOTICE)](https://huggingface.co/X13579/ehr-forecast-final/blob/main/NOTICE)
- [Synthea, Coherent Synthetic Data Set](https://synthetichealth.github.io/synthea/)
