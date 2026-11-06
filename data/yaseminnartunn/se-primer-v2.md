# yaseminnartunn/se-primer-v2

## Resumen

SE Primer v2 es un modelo de clasificación tabular publicado por yaseminnartunn en Hugging Face. No es un modelo de lenguaje: se trata de un pipeline de scikit-learn compuesto por un `StandardScaler` seguido de una `LogisticRegression`, exportado también a ONNX (Opset 17). Su tarea es predecir, a partir de seis características numéricas de comportamiento, si un jugador en una simulación de formación necesita apoyo proactivo (`destek_gerekli = 1`) o puede continuar de forma autónoma (`destek_gerekli = 0`).

El modelo está diseñado para un contexto muy específico: un simulador educativo ("SE Primer") en turco, con escenas de decisión sobre arquitectura, testing y protección de datos (KVKK). Las variables de entrada recogen el nivel del jugador (junior/senior), la escena, el tiempo de duda, el número de cambios de decisión, errores previos y número de interacciones con un tutor de IA. La salida es una probabilidad binaria de necesidad de apoyo.

Es relevante únicamente como ejemplo de modelo tabular de nicho con métricas de evaluación declaradas y contrato de entrada/salida bien definido (incluida la equivalencia sklearn-ONNX). No es un modelo de propósito general, no procesa texto ni imágenes y no está pensado para reutilización fuera de su simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline sklearn: StandardScaler + LogisticRegression |
| Parámetros totales | no disponible (regresión logística sobre 6 características; recuento exacto no publicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, entrada fija de 6 valores float32) |
| Tipos de cuantización | no disponible (exportación ONNX Float32) |
| Idiomas soportados | no disponible (etiquetas y documentación en turco) |
| Licencia | no disponible |
| Formato de pesos | joblib (sklearn) y ONNX (Opset 17) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline lineal clásico: estandarización de las seis características de entrada (`StandardScaler`) seguida de una regresión logística binaria. No hay capas ocultas, atención ni componentes neuronales profundos. El entrenamiento se realizó con Python 3.10 y scikit-learn 1.7.2, con semilla aleatoria fija (42) y una partición estratificada de hold-out del 25 % para test.

El conjunto de datos de entrenamiento no está descrito en la model card: no se indica el número de muestras, el proceso de recogida ni si hubo balanceo de clases. Tampoco se documenta ningún ajuste de hiperparámetros más allá de la semilla. La innovación técnica destacable es la exportación a ONNX con una tolerancia declarada de error máximo respecto a sklearn inferior a 1e-4, junto con un "eval gate" explícito (F1 >= 0.75, ROC-AUC >= 0.8, accuracy >= 0.75) que el modelo supera ampliamente en el conjunto de test.

## Capacidades

- Clasificación binaria tabular: predice `destek_gerekli` a partir de seis características numéricas ordenadas.
- Salida de probabilidades calibradas por regresión logística (`probabilities`, shape `[n, 2]`) y etiqueta discreta (`label`, shape `[n]`).
- Inferencia por lotes: el contrato ONNX admite entrada `[n, 6]`, por lo que procesa múltiples muestras simultáneamente.
- Equivalencia sklearn-ONNX verificada (diferencia máxima < 1e-4), lo que permite desplegar en entornos sin scikit-learn.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni de ninguna capacidad generativa.

## Casos de uso

- Simulación educativa de formación técnica: el modelo se invoca al final de cada escena de decisión para decidir si el sistema ofrece ayuda proactiva al jugador, usando `karar_suresi_sn` y `karar_degistirme_sayisi` como señales de duda.
- Adaptación de dificultad en tiempo real: con `onceki_hatali_karar` y `tutor_etkilesim_sayisi`, el sistema puede relajar el tiempo límite o mostrar pistas cuando la probabilidad de apoyo supera un umbral configurable.
- Enrutamiento de tutoría automática: la salida `probabilities` permite fijar umbrales distintos según el perfil (`seviye`), por ejemplo ser más conservador con jugadores senior para no interrumpir su flujo.
- Investigación sobre aprendizaje adaptativo: sirve como línea base interpretable (coeficientes de regresión logística) frente a modelos más complejos en experimentos de predicción de carga cognitiva.
- Despliegue en el navegador o en edge: al ser un modelo ONNX de tamaño mínimo, puede ejecutarse en el cliente del simulador sin backend dedicado.
- Integración en pipelines de evaluación: el contrato de entrada fijo y el eval gate documentado facilitan usarlo como componente de pruebas en sistemas de simulación con métricas de decisión.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test (hold-out estratificado del 25 %):

| Métrica | Valor | Umbral (eval gate) |
|---|---|---|
| F1-Score | 0.9615 | >= 0.75 |
| ROC-AUC | 0.9932 | >= 0.8 |
| Accuracy | 0.9667 | >= 0.75 |
| Precision | 0.9615 | no disponible |
| Recall | 0.9615 | no disponible |

No se han publicado comparaciones con otros modelos ni detalles sobre el tamaño o la composición del conjunto de test.

## Requisitos de hardware

- VRAM: no aplica; el modelo es un pipeline lineal que se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0.0 GB y el modelo ONNX es de tamaño mínimo.
- Opciones de despliegue: scikit-learn con joblib, ONNX Runtime (CPU o Web), o cualquier runtime compatible con ONNX Opset 17.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (regresión logística sobre 6 características) se espera latencia en el orden de microsegundos por muestra en CPU, pero no hay medición publicada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores tabulares de nicho para simulaciones educativas) ni resultados frente a alternativas como regresión logística estándar, random forest o gradient boosting.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para una simulación concreta con seis características fijas y un orden de entrada estricto; cualquier cambio en el contrato de features invalida su uso.
- Sin información sobre el dataset: se desconoce el número de muestras, el balance de clases y el posible sobreajuste; las métricas de test no son verificables de forma independiente.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Idiomas no declarados: la documentación y las etiquetas están en turco; no hay soporte multilingüe.
- Riesgo de sesgo: las predicciones dependen de variables como `seviye` (junior/senior), lo que puede introducir trato diferencial entre perfiles si se usa sin revisión.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la probabilidad de salida puede ser poco fiable fuera de la distribución de entrenamiento.
- Uso declarado exclusivamente pedagógico y de simulación; no debe emplearse para decisiones sobre personas reales.
- No se documenta ningún proceso de validación externa ni de calibración de probabilidades más allá de la regresión logística.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yaseminnartunn/se-primer-v2
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
