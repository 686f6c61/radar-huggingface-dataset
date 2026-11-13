# tvf007/EDSBG1TP2-model

## Resumen

EDSBG1TP2-model es un modelo de clasificación tabular orientado a la predicción de churn (abandono de clientes) en el sector de telecomunicaciones. Lo publica el usuario tvf007 en Hugging Face como parte de un proyecto académico (EDSB 2026, Grupo 1). No es una red neuronal ni un modelo de lenguaje: es un pipeline de scikit-learn serializado con joblib que combina preprocesamiento y un clasificador Gradient Boosting, entrenado sobre el dataset sintético Telco Customer Churn de IBM.

El modelo resuelve un problema concreto de negocio: estimar la probabilidad de que un cliente abandone, P(churn), para que los equipos de retención prioricen el contacto según la pérdida esperada (P(churn) × CLTV). El repositorio incluye dos artefactos: un modelo de priorización entrenado solo con clientes establecidos (tenure > 3 meses) y un modelo core entrenado con toda la población de modelado.

Es relevante como ejemplo de buenas prácticas en ML tabular aplicado: contratos de datos con pandera, comparación contra referencias sin ML, calibración de probabilidades (Brier score), regla de parcimonia en la selección y gate de despliegue automatizado. El modelo no supera al Churn Score de IBM en ordenación, pero sí en calibración, lo que lo hace útil para cálculos de pérdida esperada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn (preprocesador + Gradient Boosting) |
| Parametros totales | no disponible (modelo de árboles, no aplica recuento de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo tabular, no aplica) |
| Tipos de cuantizacion | no disponible (artefacto joblib, no aplica) |
| Idiomas soportados | pt (portugués) |
| Licencia | no disponible |
| Formato de pesos | joblib (`priority_model.joblib`, `final_model.joblib`) |

## Arquitectura y entrenamiento

El modelo es un pipeline de scikit-learn que encadena un preprocesador y un clasificador Gradient Boosting. Se seleccionó tras comparar nueve algoritmos (regresión logística, árbol de decisión, kNN, MLP, Random Forest, Extra Trees, Gradient Boosting, Soft Voting y Stacking) afinados con `RandomizedSearchCV` y evaluados sobre el mismo esquema de validación cruzada estratificada de 5 folds. La regla de selección escogió Gradient Boosting por tener el mayor AUC en CV y ser el más simple entre los empatados (dentro de una desviación típica entre folds).

Los datos provienen del dataset sintético Telco Customer Churn de IBM: 7.043 clientes, de los cuales 6.589 forman la población de modelado (28,4% de churn). Se usan 32 variables originales (perfil, contrato, facturación, servicios, localización) más 4 derivadas calculadas fila a fila (número de servicios adicionales, media histórica de factura, diferencia entre factura actual y media, y si hubo reembolso). Se excluyeron columnas que codifican el resultado, salidas de otros modelos (Churn Score, CLTV) y Satisfaction Score por sospecha de leakage. La división es 80/20 estratificada a nivel de cliente con `random_state=42`. Requiere `scikit-learn==1.9.1`.

## Capacidades

- Clasificación binaria tabular: estima P(churn) para clientes de telecomunicaciones.
- Priorización por pérdida esperada: combina la probabilidad con CLTV para ordenar acciones de retención.
- Calibración de probabilidades: Brier score de 0,086 en el modelo core y 0,097 en el de priorización (holdout).
- Niveles de riesgo absolutos predefinidos: medio ≥ 0,30, alto ≥ 0,60.
- Cortes de capacidad: umbrales de P(churn) para identificar el top 10% y top 20% de clientes establecidos.
- Predicción individual y por lotes (usado por la app Gradio del proyecto).
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un modelo tabular puro.

## Casos de uso

- Priorización de campañas de retención: el modelo de priorización ordena a los clientes establecidos por P(churn) × CLTV, de modo que el equipo comercial contacta primero a quienes generan mayor pérdida esperada. Es adecuado porque sus probabilidades están calibradas (Brier 0,097), requisito para multiplicar por CLTV.
- Segmentación por niveles de riesgo: clasificar la cartera en riesgo medio (≥ 0,30) y alto (≥ 0,60) para diseñar acciones diferenciadas (llamada, descuento, upgrade) sin necesidad de umbrales ad hoc.
- Dimensionamiento de equipos de retención: usando los cortes de capacidad (top 10% / top 20%), se estima cuántos clientes debe atender cada agente por campaña.
- Análisis de cohortes de clientes establecidos: el modelo de priorización, entrenado solo con tenure > 3, evita la extrapolación en clientes nuevos y es fiable para carteras maduras.
- Evaluación comparativa frente a reglas de negocio: sirve como referencia ML frente a la regla Month-to-Month + tenure ≤ 12 + fibra óptica, útil para justificar inversión en modelado.
- Integración en pipelines de scoring batch: al ser un artefacto joblib cargable con `joblib.load`, se puede ejecutar en jobs programados que puntúen la base de clientes y exporten rankings a CRM.
- Docencia y auditoría de ML tabular: el repositorio incluye contratos de datos, tests y gate de despliegue, lo que lo hace útil como plantilla reproducible de un proyecto de clasificación con leakage controlado.

## Benchmarks y rendimiento

| Modelo | AUC CV (± dp) | AUC holdout | PR AUC holdout | Brier holdout |
|---|---|---|---|---|
| Modelo core: Gradient Boosting | 0,938 ± 0,004 | 0,936 | 0,883 | 0,086 |
| Churn Score IBM (benchmark) | 0,942 ± 0,008 | 0,941 | 0,876 | 0,214 |
| Modelo de priorización (tenure > 3): Gradient Boosting | 0,909 ± 0,007 | 0,899 | 0,726 | 0,097 |
| Churn Score IBM en los mismos clientes (tenure > 3) | 0,944 ± 0,012 | 0,939 | 0,831 | no disponible |

## Requisitos de hardware

- VRAM: no aplica; es un modelo de árboles que se ejecuta en CPU.
- GPU: no necesaria. Cualquier CPU moderna es suficiente para inferencia.
- Memoria RAM: el repositorio ocupa 0,0 GB según Hugging Face; el artefacto joblib es de tamaño reducido y cabe holgadamente en cualquier equipo.
- Despliegue: carga directa con `joblib.load` en Python con `scikit-learn==1.9.1`. No requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; para un Gradient Boosting sobre 36 features, la inferencia por fila es del orden de microsegundos a milisegundos, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | AUC holdout | Brier holdout | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EDSBG1TP2-model (core) | Gradient Boosting sklearn | 0,936 | 0,086 | no disponible | Hugging Face (joblib) |
| EDSBG1TP2-model (priorización) | Gradient Boosting sklearn | 0,899 | 0,097 | no disponible | Hugging Face (joblib) |
| Churn Score IBM | Modelo propietario IBM | 0,941 | 0,214 | propietaria | integrado en dataset IBM |
| Regla de negocio sin ML | Regla heurística | no disponible | no disponible | n/a | definida en el proyecto |

## Limitaciones y advertencias

- Clientes nuevos: para tenure ≤ 3 meses el modelo extrapola porque en el entrenamiento casi todos los clientes de esa antigüedad figuran como Churned. La app muestra un aviso y se usa una regla de onboarding en su lugar.
- Causalidad: el modelo predice riesgo, no el efecto de una acción. La eficacia del descuento usada en la app es un supuesto y debe validarse con grupo de control.
- Datos sintéticos: el dataset IBM es sintético y de un único trimestre (Q3, California), sin fechas; no hay validación temporal y los patrones pueden no transferirse a datos reales.
- Ordenación: en clientes establecidos, el Churn Score de IBM ordena mejor (AUC 0,939 frente a 0,899, con IC 95% de la diferencia que excluye cero). El modelo se publica por su calibración, no como sustituto del ranking de IBM.
- Leakage controlado: Satisfaction Score se excluyó por elevar el AUC a 0,996, señal de fuga de información; si se reintroduce en producción, las métricas no serán comparables.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial queda sin marco legal explícito.
- Idioma: la documentación y el contexto están en portugués; no hay soporte multilingüe declarado.
- Importancia de variables: refleja asociación, no causalidad.
- Versión de scikit-learn fijada a 1.9.1; otras versiones pueden romper la carga del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tvf007/EDSBG1TP2-model
- Dataset Telco Customer Churn de IBM: no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo Gradio: no disponible en la información proporcionada
