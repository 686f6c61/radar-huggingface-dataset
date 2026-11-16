# VitoriaEmanuele1903/ons-nordeste-estresse-rna

## Resumen

`ons-nordeste-estresse-rna` es una red neuronal pequeña implementada en Keras que clasifica un día de operación del subsistema Nordeste del Sistema Interligado Nacional brasileño (SIN) como "Normal" o "Estrés". El modelo toma 23 estadísticas diarias calculadas sobre los 24 registros horarios de carga y generación (eólica, solar, hidráulica y térmica) y devuelve una probabilidad de estrés mediante una salida sigmoide. Es un proyecto académico de la asignatura de Aprendizaje de Máquina del grado en Ciencia de Datos e IA de la UFPB, desarrollado por Vitória Emanuele de Sousa Silva y Julia Gabriele Mendes Barbosa.

El modelo es deliberadamente minimalista: una única capa oculta de 7 neuronas y 176 parámetros totales, con el tamaño de la capa limitado por la dimensión VC para el número de muestras de entrenamiento (1.753 días). Se entrenó sobre datos públicos horarios del Operador Nacional do Sistema Elétrico (ONS) entre 2020 y 2025, con 2.192 días agregados y una etiqueta de estrés definida estadísticamente por la desviación del intercambio de energía diario respecto a la media del período.

Su relevancia es fundamentalmente didáctica y de demostración: ilustra un flujo completo de clasificación tabular con redes neuronales pequeñas aplicado a datos del sector eléctrico, y sirve como referencia comparativa frente a SVM, Random Forest y Árbol de Decisión. No está pensado para operación real del sistema eléctrico ni para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP) en Keras: 23 entradas → 1 capa oculta de 7 neuronas (ReLU) → 1 salida sigmoide |
| Parámetros totales | 176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, no secuencial; entrada fija de 23 atributos por día) |
| Tipos de cuantización | no disponible (modelo tabular de 176 parámetros; no aplica cuantización de pesos) |
| Idiomas soportados | portugués (pt) |
| Licencia | MIT |
| Formato de pesos | `.keras` (Keras nativo) + `scaler.joblib` (StandardScaler) + `colunas.json` (orden de columnas) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de una sola capa oculta. La entrada son 23 atributos estandarizados con un `StandardScaler` ajustado en entrenamiento; la capa oculta tiene 7 neuronas con activación ReLU, inicialización He Normal, regularización L2 de 0,001 y dropout de 0,2; la salida es una única neurona con activación sigmoide que produce la probabilidad de estrés. El tamaño de la capa oculta se acotó mediante la dimensión VC en función del número de muestras de entrenamiento. El entrenamiento usa el optimizador Adam, pérdida `binary_crossentropy`, batch size 8 y early stopping con paciencia 10. Los hiperparámetros de dropout y L2 se seleccionaron mediante grid search con validación cruzada estratificada de 5 particiones.

Los datos provienen del balance energético horario público del ONS para el subsistema Nordeste, cubriendo 2020-2025: 52.608 registros horarios que agregan 2.192 días. Cada día se resume en 23 estadísticas (media, desviación, máximo, mínimo, asimetría y curtosis según la variable) sobre carga, eólica, solar, hidráulica y térmica, en MWmed. La etiqueta es binaria: un día es "Estrés" cuando la media diaria del intercambio de energía sale del intervalo [media − 1σ, media + 1σ] calculado sobre todo el período; en caso contrario es "Normal". La distribución resultante es 1.424 días normales (64,96%) y 768 de estrés (35,04%), con división estratificada 80/20 (1.753 días de entrenamiento y 439 de test).

## Capacidades

- Clasificación binaria tabular de días de operación como "Normal" o "Estrés" a partir de 23 estadísticas diarias de carga y generación.
- Procesamiento de atributos agregados por día (no trabaja con series horarias directamente; el script `exemplo_uso.py` realiza la agregación previa desde CSV horario del ONS).
- Salida probabilística calibrada mediante sigmoide, con umbral por defecto de 0,5.
- Integración con `scikit-learn` mediante el `StandardScaler` empaquetado, lo que permite reproducir el preprocesado exacto del entrenamiento.
- Capacidad multilingüe: no aplica; el modelo no procesa texto, solo vectores numéricos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Docencia y demostración de clasificación tabular con redes neuronales pequeñas: el modelo sirve como ejemplo completo de pipeline (agregación de datos, escalado, entrenamiento, evaluación) en asignaturas de aprendizaje automático, con solo 176 parámetros y un script de ejemplo reproducible.
- Comparativa metodológica entre clasificadores: al haberse evaluado frente a SVM, Random Forest y Árbol de Decisión sobre el mismo test, permite ilustrar en clase o en un artículo cómo un MLP pequeño puede superar a modelos clásicos en un dataset tabular concreto (95,67% frente a 93,17%, 92,71% y 90,89% de accuracy).
- Prototipado de indicadores de estrés en sistemas eléctricos: investigadores pueden reutilizar la definición estadística de la etiqueta y los 23 atributos como línea base para experimentos con datos del ONS u otros subsistemas, sustituyendo el modelo por alternativas más sofisticadas.
- Análisis exploratorio de la matriz energética del Nordeste brasileño: el modelo y su etiqueta permiten etiquetar días históricos y estudiar la proporción de días de estrés por año o estación, siempre con fines analíticos y no operativos.
- Generación de features derivadas para modelos posteriores: las 23 estadísticas diarias y la probabilidad de estrés pueden emplearse como variables de entrada en modelos de forecasting o de detección de anomalías más complejos.
- Reproducibilidad de investigación académica: al publicarse pesos, scaler y orden de columnas bajo licencia MIT, otros grupos pueden replicar exactamente los resultados del artículo o del repositorio y extender el análisis a una validación temporal.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test (439 días), según la model card del autor:

| Modelo | Accuracy | Precisión (Estrés) | Recall (Estrés) | F1 (Estrés) |
|---|---|---|---|---|
| Red neuronal (este modelo) | 95,67% | 0,93 | 0,95 | 0,94 |
| Random Forest | 93,17% | no disponible | no disponible | no disponible |
| SVM | 92,71% | no disponible | no disponible | no disponible |
| Árbol de Decisión podado | 90,89% | no disponible | no disponible | no disponible |

Matriz de confusión de la red neuronal (filas: real; columnas: predicho): Normal → Normal 274, Normal → Estrés 11, Estrés → Normal 8, Estrés → Estrés 146.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; el modelo tiene 176 parámetros y el `StandardScaler` es un objeto pequeño. Cualquier GPU consumer con más de 1 GB de VRAM es sobrada.
- GPU recomendadas: no requiere GPU. Funciona en CPU sin problema; cualquier GPU (RTX 3050, RTX 4090, A100, H100) acelera el entrenamiento pero es irrelevante para inferencia.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna; también en Raspberry Pi.
- Opciones de despliegue: TensorFlow/Keras nativo (versión 2.21.0 según la model card), o exportación a TensorFlow Lite / ONNX si se desea servir en entornos ligeros. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; con 176 parámetros la inferencia por muestra es del orden de microsegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Accuracy (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ons-nordeste-estresse-rna | MLP Keras | 176 | no aplica (tabular) | 95,67% | MIT | Hugging Face |
| Random Forest (mismo estudio) | Ensemble de árboles | no disponible | no aplica | 93,17% | no disponible | No publicado como modelo |
| SVM (mismo estudio) | Máquina de vectores soporte | no disponible | no aplica | 92,71% | no disponible | No publicado como modelo |
| Árbol de Decisión podado (mismo estudio) | Árbol | no disponible | no aplica | 90,89% | no disponible | No publicado como modelo |

No se dispone de comparación con otros modelos tabulares publicados en Hugging Face para la misma tarea (clasificación de estrés en sistemas eléctricos), por lo que la comparativa se limita a los modelos del propio estudio académico.

## Limitaciones y advertencias

- El objetivo es estadístico, no físico: la etiqueta "Estrés" se define por la desviación del intercambio de energía respecto a ±1σ, y no sustituye el análisis de seguridad que realiza el ONS (límites térmicos, de tensión y de estabilidad). No debe usarse para operación real del sistema eléctrico.
- Relación casi contable entre variables: el intercambio de energía es en buena parte la diferencia entre generación y carga, y ambas están entre los 23 atributos, por lo que parte de la alta accuracy proviene de esa relación. El intercambio en sí no es un atributo de entrada.
- Fuga temporal en la definición de la etiqueta: la media y la desviación del rótulo se calcularon sobre todo el período (2020-2025), cuando en un uso real solo se dispondría de datos pasados.
- División aleatoria de días: días contiguos son similares, por lo que una división temporal sería una validación más exigente y probablemente arrojaría métricas inferiores.
- Test pequeño (439 días): diferencias de pocos puntos porcentuales entre modelos equivalen a pocos días, con intervalos de confianza amplios.
- Dependencia de versiones: entrenado con TensorFlow 2.21.0 y scikit-learn 1.6.1; otras versiones pueden requerir ajustes al cargar el modelo y el scaler.
- Sesgos conocidos: no se documentan sesgos adicionales en la información disponible, más allá del sesgo geográfico (solo subsistema Nordeste) y temporal (2020-2025).
- Riesgo de alucinación: no aplica en el sentido habitual, al no ser un modelo generativo; el riesgo es de clasificación errónea en días atípicos no representados en el entrenamiento.
- Restricciones de licencia: MIT permite uso comercial, pero el autor advierte explícitamente contra el uso operativo en el sistema eléctrico; además, los datos del ONS están sujetos a sus propios términos de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VitoriaEmanuele1903/ons-nordeste-estresse-rna
- Repositorio del proyecto (código, informe y comparativa completa): https://github.com/Vitoria-Emanuele/AM_ProjetoFinal
- Análisis exploratorio que originó el tema: https://github.com/Vitoria-Emanuele/visualizacao_de_dados
- Portal de datos del ONS (fuente de los datos): no disponible en la información proporcionada
