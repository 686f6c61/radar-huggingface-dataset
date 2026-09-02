# Tech-Anis/Wearable-Activity-Classifier

## Resumen

El modelo **Wearable Activity Classifier** es un clasificador de series temporales diseñado para distinguir entre tres actividades físicas —estacionario, caminar y correr— a partir de una secuencia de 100 pasos de un único sensor. Ha sido desarrollado por el usuario Tech-Anis y publicado en HuggingFace con fines exclusivamente educativos, como parte de un ejercicio académico de comparación de arquitecturas de redes neuronales (CNN, SimpleRNN, LSTM o CNN+LSTM). El repositorio no incluye información sobre la arquitectura final seleccionada, el número de parámetros ni los resultados de evaluación, ya que la model card es una plantilla sin completar.

El modelo se enmarca en el ámbito de la clasificación de actividades con dispositivos portables (wearables), un área con aplicaciones en monitorización de salud y fitness. Sin embargo, este artefacto concreto se basa en datos sintéticos generados en un notebook de clase, no en un conjunto de datos real de sensores, y no está pensado para uso en producción ni para aplicaciones sanitarias. Su relevancia actual reside en su valor didáctico: permite a estudiantes comparar el comportamiento de distintas arquitecturas recurrentes y convolucionales sobre una tarea de clasificación temporal sencilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN, SimpleRNN, LSTM o CNN+LSTM (sin especificar cuál se eligió) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 100 pasos temporales (secuencia de entrada) |
| Tipos de cuantizacion | no disponible (modelo Keras, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Keras (formato nativo, probablemente .h5 o .keras; no se especifica) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la model card. La plantilla indica que se seleccionó una de entre CNN, SimpleRNN, LSTM o CNN+LSTM, pero el campo correspondiente está vacío. La entrada es una secuencia de 100 valores de una única característica (forma `(100, 1)`) y la salida es una distribución de probabilidad sobre 3 clases. Al tratarse de un modelo Keras, se asume una implementación estándar de capas densas y recurrentes o convolucionales, sin innovaciones técnicas destacables.

Los datos de entrenamiento son señales sintéticas generadas en el notebook de la clase, diseñadas específicamente para la enseñanza. No se proporciona información sobre el número de muestras, la composición del dataset, el número de épocas, la función de pérdida ni el optimizador. Tampoco se menciona el uso de técnicas como RLHF, DPO o ajuste fino adicional. El entrenamiento se realizó en un entorno académico, con una duración que no se ha registrado en la ficha.

## Capacidades

- Clasificación de series temporales de 100 pasos en tres categorías: estacionario, caminar y correr.
- Procesamiento de una única característica de sensor (por ejemplo, aceleración o IMU).
- Capacidad limitada a la tarea específica; no es un modelo generativo ni de lenguaje.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No se han documentado capacidades multilingües (no aplica a un clasificador numérico).

## Casos de uso

Dado el carácter educativo y los datos sintéticos, los casos de uso realistas se limitan al ámbito académico y de demostración:

- **Práctica docente de clasificación de series temporales**: el modelo sirve como ejemplo guiado para que estudiantes implementen y comparen arquitecturas de redes neuronales sobre una tarea de secuencias cortas.
- **Comparación de arquitecturas (CNN vs RNN vs LSTM)**: al ser un ejercicio de clase, permite evaluar empíricamente el rendimiento de distintos tipos de capas en un problema de clasificación temporal sencillo.
- **Demostración de flujo de trabajo en HuggingFace**: ilustra cómo publicar un modelo Keras, documentarlo y compartirlo en la plataforma, aunque sea con una model card incompleta.
- **Prototipo rápido de clasificación de actividades**: si se sustituyeran los datos sintéticos por datos reales de sensores, la estructura del modelo podría servir como punto de partida para un prototipo, pero requeriría reentrenamiento y validación.
- **Ejemplo de preprocesamiento de señales**: el pipeline de entrada (secuencias de 100 pasos) puede usarse para enseñar normalización, ventaneo y preparación de datos de sensores.
- **Base para experimentos de interpretabilidad**: dado que el modelo es pequeño y simple, puede utilizarse en clases sobre explicabilidad de modelos (por ejemplo, SHAP o LIME) aplicada a series temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye campos para precisión en test y tiempo de entrenamiento, pero están vacíos. No se dispone de comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- Al ser un modelo Keras de tamaño reducido (probablemente del orden de miles de parámetros, aunque no se especifica), puede ejecutarse en CPU sin problemas.
- No se requiere GPU para inferencia ni entrenamiento en un entorno académico típico.
- El despliegue puede realizarse con TensorFlow/Keras nativo, o exportarse a TensorFlow Lite para dispositivos móviles, aunque no se documenta.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de clasificación de actividades. Existen en la literatura modelos basados en CNN y LSTM para reconocimiento de actividades con wearables (por ejemplo, en los artículos encontrados en la búsqueda web), pero no se conocen sus parámetros ni resultados específicos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Datos sintéticos**: el modelo se entrenó con señales generadas artificialmente, que no representan la variabilidad de datos reales de sensores (ruido, diferencias entre usuarios, orientación del dispositivo, etc.).
- **Una sola característica**: la entrada es un único canal de sensor, lo que limita la capacidad de distinguir actividades complejas que requieren múltiples señales (acelerómetro, giroscopio, etc.).
- **Sin validación en usuarios reales**: no se ha probado con datos de personas reales ni en dispositivos físicos, por lo que su generalización es desconocida.
- **No apto para producción**: la model card indica explícitamente que no está destinado a uso en salud, seguridad o producción.
- **Documentación incompleta**: faltan detalles sobre la arquitectura final, hiperparámetros, precisión y licencia, lo que dificulta su reproducción y uso responsable.
- **Riesgo de sobreajuste**: al ser un dataset sintético y pequeño, es probable que el modelo no generalice a datos del mundo real.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Tech-Anis/Wearable-Activity-Classifier)
- [Espacio relacionado de la comunidad (DeepLearningAssignment2)](https://huggingface.co/spaces/musakhan10/DeepLearningAssignment2) — no es el mismo modelo, pero muestra un proyecto similar.
- [Artículo sobre modelos explicables para actividad física (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S1440244026001374) — contexto de investigación, no específico de este modelo.
- [Artículo sobre predicción de tipos de actividad con wearables (Springer)](https://link.springer.com/article/10.1007/s11760-025-04564-z) — contexto de investigación, no específico de este modelo.
- [Repositorio de clasificación de actividades con sensores (GitHub)](https://github.com/yiannis3/Wearable-Sensor-Activity-Classification) — proyecto relacionado, no este modelo.
