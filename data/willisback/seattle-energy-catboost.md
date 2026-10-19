# WillisBack/seattle-energy-catboost

## Resumen

`WillisBack/seattle-energy-catboost` no es un modelo de lenguaje: es un par de regresores CatBoost (gradient boosting sobre árboles de decisión) entrenados para predecir, a partir de 17 características morfológicas de un edificio, su consumo de energía anual (kBtu/año) y sus emisiones de gases de efecto invernadero (t CO2e/año). Lo publica William Derue como entregable del proyecto P5 del itinerario AI Engineer de OpenClassrooms, con un cliente ficticio llamado Futurisys, sobre el dataset abierto de benchmarking energético de edificios no residenciales de la ciudad de Seattle.

El problema que aborda es concreto: el ayuntamiento publica las mediciones reales con uno o dos años de retraso, de modo que no existe forma de anticipar el comportamiento de un edificio nuevo o recién reformado. El modelo cubre ese hueco con una estimación de orden de magnitud previa a la medición, y lo hace con una métrica de selección explícita, MedAPE (error absoluto porcentual mediano), en lugar de MAE o R², que quedan dominadas por unos pocos edificios extremadamente grandes.

La relevancia es la de un artefacto de referencia reproducible, no la de un modelo puntero: 1.668 filas de entrenamiento de 2016, dos salidas numéricas, licencia MIT y métricas publicadas sin adornos (MedAPE del 35,0 % en energía y del 43,7 % en emisiones sobre el split de test). El repositorio de HuggingFace contiene únicamente el modelo entrenado; el resto del sistema (API FastAPI, PostgreSQL, MLflow, Grafana, interfaz Gradio, CI/CD) vive en el repositorio de GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (CatBoost); dos regresores independientes, uno por objetivo |
| Parámetros totales | no disponible (no se publica número de árboles, profundidad ni número de hojas) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 17 características) |
| Tipos de cuantización | no disponible (no se documenta cuantización; el artefacto es el modelo nativo de CatBoost) |
| Idiomas soportados | no aplica (no procesa lenguaje natural; las categorías están etiquetadas en inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería `catboost`; el repositorio solo contiene el modelo entrenado) |
| Tarea | regresión tabular multi-salida (2 objetivos) |
| Características de entrada | 17 (3 categóricas de uso y localización, 11 numéricas, 2 flags binarios, más las superficies de segundo y tercer uso) |
| Objetivos | consumo de energía (kBtu/año) y emisiones de GEI (t CO2e/año) |
| Datos de entrenamiento | 1.668 filas del año 2016 (split 80/20); test de 310 edificios |
| Tamaño del repositorio | 0,0 GB según HuggingFace (por debajo del umbral de redondeo de la plataforma; tamaño exacto no disponible) |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 18 de octubre de 2026, según HuggingFace |

## Arquitectura y entrenamiento

CatBoost es un algoritmo de gradient boosting que construye árboles de decisión de forma secuencial, con soporte nativo de variables categóricas (codificación ordenada por target, sin one-hot encoding) y tratamiento nativo de valores `NaN`. En este caso se entrenan dos modelos separados, uno por objetivo, sobre las mismas 17 características; la transformación de las dos variables objetivo es `log1p(y)`, y la predicción se devuelve a unidades reales con `expm1` en inferencia. No se aplica ninguna otra transformación a las entradas: no hay logaritmos, ratios ni imputación. Las dos únicas operaciones de preprocesamiento son la normalización del nombre de barrio y la sustitución de `NumberofBuildings == 0` por 1; las seis categóricas ausentes se reemplazan por la cadena `"UNKNOWN"` y las numéricas se dejan como `NaN`.

Los datos provienen del *Building Energy Benchmarking Data* de la ciudad de Seattle. El perímetro excluye el residencial (`Multifamily*`) y cualquier fila con una característica obligatoria ausente. Solo 2016 se usa para entrenamiento; las ediciones de 2017 a 2019 (238 edificios consultables) llegan en un esquema distinto (columnas renombradas, `EPAPropertyType`, tipos de edificio reagrupados) y se realinean al esquema de 2016 mediante una capa de armonización, empleándose como demostración con edificios nunca vistos. La model card no documenta búsqueda de hiperparámetros, número de iteraciones, ni técnicas de calibración o intervalos de incertidumbre.

## Capacidades

- Regresión tabular multi-salida: devuelve simultáneamente consumo energético y emisiones de GEI para una misma fila de 17 características.
- Tratamiento nativo de variables categóricas de alta cardinalidad relativa (`PrimaryPropertyType`, `Neighborhood`, `LargestPropertyUseType`), sin necesidad de codificación previa.
- Tolerancia nativa a valores ausentes en las variables numéricas.
- Predicción en unidades físicas reales (kBtu/año y t CO2e/año) gracias a la inversión de `log1p` con `expm1`.
- Selección de métrica robusta a valores extremos (MedAPE) para evaluar el ajuste en una distribución fuertemente asimétrica.
- No soporta generación de texto, tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multimodales: ni visión, ni audio, ni modo *thinking*.
- No tiene capacidades multilingües en el sentido habitual: las categorías de entrada están en inglés y el modelo no procesa lenguaje libre.

## Casos de uso

- **Priorización de auditorías energéticas en una cartera de edificios**: estimar consumo y emisiones de cientos de edificios no residenciales antes de que llegue la medición oficial y ordenar las auditorías por consumo esperado. El MedAPE del 35 % es suficiente para un cribado, aunque no para verificar una factura.
- **Due diligence inmobiliaria**: incorporar una estimación de consumo y de exposición a costes de carbono en la valoración de un activo, alimentando el modelo con morfología, año de construcción y usos, sin esperar al histórico de consumos del vendedor.
- **Línea base en fase de diseño de un edificio nuevo**: variar superficie construida, superficie de aparcamiento, número de plantas y mezcla de usos para obtener un orden de magnitud de la demanda energética esperada antes de disponer de simulaciones físicas detalladas.
- **Cumplimiento y reporting normativo**: prerrellenar el campo de consumo estimado en los registros anuales de benchmarking de Seattle cuando falta la medición, señalando explícitamente que el valor es una estimación y no una lectura de contador.
- **Detección de anomalías por comparación medida-predicha**: usar la diferencia entre el valor medido y el predicho como indicador de sobreconsumo o de error de contador; el modelo es lo bastante barato como para recalcular toda la cartera en cada actualización del dataset.
- **Servicio interno de consulta para analistas**: el proyecto original ya despliega el modelo tras una API FastAPI con PostgreSQL, registro en MLflow (run `9c4a71a8c47e4f0fa4bbebf320e51ede`) y demo Gradio, de modo que el caso de uso "endpoint de estimación" está implementado y es reproducible.
- **Enriquecimiento de bases de datos catastrales o de seguros**: añadir una columna de consumo y emisiones estimados a registros con morfología conocida, para segmentación de riesgo o de campañas comerciales.
- **Material docente**: ejemplo completo y pequeño de regresión tabular multi-objetivo con variables asimétricas, tratamiento de categóricas y elección razonada de métrica, con código y demo públicos.

## Benchmarks y rendimiento

Evaluación sobre el split de test del año de entrenamiento: 310 edificios de 2016 nunca vistos, en unidades reales.

| Objetivo | Modelo | R² | MAE | MedAE | MedAPE |
|---|---|---:|---:|---:|---:|
| Energía (kBtu/año) | CatBoost (este modelo) | 0,236 | 5.171.124 | 857.047 | 35,0 % |
| Energía (kBtu/año) | Kumo-Tabular (*zero-shot*) | 0,447 | 4.710.104 | 883.031 | 35,1 % |
| Emisiones (t CO2e/año) | CatBoost (este modelo) | 0,106 | 146 | 19,0 | 43,7 % |
| Emisiones (t CO2e/año) | Kumo-Tabular (*zero-shot*) | 0,207 | 137 | 24,2 | 48,3 % |

El autor advierte explícitamente de que el R² bajo no debe leerse como un fallo del modelo: la varianza de las variables reales está dominada por unos pocos edificios extremos. La métrica de selección es MedAPE, y en ella el CatBoost queda ligeramente por delante de Kumo-Tabular en energía (35,0 % frente a 35,1 %) y claramente por delante en emisiones (43,7 % frente a 48,3 %), pese a perder en R² y en MAE en energía. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia sobre CPU: es el escenario natural para un modelo de gradient boosting tabular de este tamaño; no se requiere GPU.
- VRAM estimada: no aplica; no hay datos publicados de memoria necesaria, y el repositorio reporta 0,0 GB, lo que indica un artefacto por debajo del umbral de redondeo de HuggingFace.
- GPU recomendadas: no aplica para inferencia. CatBoost admite entrenamiento en GPU, pero la model card no documenta si se usó ni con qué configuración.
- GPU de consumo: no es necesaria; el modelo cabe y se ejecuta en un portátil convencional.
- Opciones de despliegue: paquete `catboost` para Python, servicio FastAPI con PostgreSQL (arquitectura del proyecto original), registro y versionado en MLflow, interfaz Gradio para demo. vLLM, TGI, llama.cpp y Ollama no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; no se publican medidas de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | R² energía | MedAPE energía | R² emisiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| CatBoost (este modelo) | Gradient boosting tabular, 2 regresores | no disponible | no aplica | 0,236 | 35,0 % | 0,106 | MIT | HuggingFace (0 descargas) |
| Kumo-Tabular (*zero-shot*) | Modelo fundacional tabular | no disponible | no disponible | 0,447 | 35,1 % | 0,207 | no disponible | Citado en la model card, sin enlace ni artefacto referenciado |
| LightGBM / XGBoost | Gradient boosting tabular | no disponible | no aplica | sin datos | sin datos | sin datos | no disponible | no evaluados en la información disponible |

La única comparación publicada es contra Kumo-Tabular en modo *zero-shot*, con la salvedad de que este último gana en R² y en MAE pero pierde en la métrica que el proyecto considera decisiva (MedAPE). No hay comparación con alternativas abiertas del mismo corte (LightGBM, XGBoost, Random Forest) ni con modelos lineales regularizados, que serían la línea base obligada en un problema de 1.668 filas y 17 características.

## Limitaciones y advertencias

- Poder explicativo bajo: R² de 0,236 en energía y 0,106 en emisiones. El propio autor lo califica de modelo modesto; el MedAPE implica un error típico de un factor cercano a 1,5.
- Solo sirve para dar un orden de magnitud. No debe emplearse para verificar facturas, liquidar cargos ni sustituir una medición.
- Dominio restringido: edificios no residenciales de Seattle. El residencial (`Multifamily*`) está excluido por diseño, y el modelo no se ha validado fuera de esa ciudad ni de ese parque inmobiliario.
- Cobertura temporal estrecha: entrenado solo con datos de 2016 (1.668 filas). Las ediciones 2017-2019 se usan únicamente como demostración y requieren una capa de armonización de esquema previa.
- Las características son puramente morfológicas y de uso; no incluyen sistemas constructivos, climatización, gestión ni ocupación, lo que explica buena parte del error y limita la capacidad de simular reformas.
- Riesgo de extrapolación: no se documenta el rango de superficies, alturas y años de construcción cubiertos, ni el comportamiento del modelo fuera de él.
- Ausencia de intervalos de incertidumbre: se devuelve un punto, no un rango, pese a que el uso previsto es de cribado.
- MAE y R² están dominados por unos pocos edificios muy grandes; cualquier evaluación con esas métricas dará una imagen engañosa del error típico.
- No se documenta ningún análisis de sesgo por barrio, tipo de uso o antigüedad, ni de equidad entre distritos.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la licencia; no hay cláusula de patentes ni garantías.
- Documentación únicamente en francés y sin versión en castellano ni en inglés, lo que añade fricción a su reutilización.
- La model card publica credenciales de acceso a la demo (`johndoe` / `secret`); ese patrón no debe replicarse en un despliegue real.
- El repositorio no contiene código de entrenamiento, configuración de hiperparámetros ni pipeline de datos, solo el artefacto entrenado: la reproducibilidad depende del repositorio de GitHub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WillisBack/seattle-energy-catboost
- Repositorio de código del proyecto: https://github.com/WillIsback/OC-P5_Deployez_un_modele_de_Machine_Learning
- Demo Gradio: https://willisback-seattle-energy-demo.hf.space
- Dataset de origen (Seattle, Building Energy Benchmarking Data): https://data.seattle.gov/b/65db-xm6k
- Itinerario AI Engineer de OpenClassrooms: https://openclassrooms.com/fr/paths/1011-ai-engineer
- Run de MLflow citado en la model card: identificador `9c4a71a8c47e4f0fa4bbebf320e51ede` (no se proporciona URL)
- Paper técnico: no disponible en la información proporcionada.
