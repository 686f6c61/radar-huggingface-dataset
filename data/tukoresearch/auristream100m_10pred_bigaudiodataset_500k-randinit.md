# TuKoResearch/AuriStream100M_10Pred_BigAudioDataset_500k-randinit

## Resumen

AuriStream es un modelo de lenguaje de habla desarrollado por Greta Tuckute y Klemen Kotar (TuKoResearch) que opera sobre tokens cocleares generados por un tokenizador previo, como WavCochCausalV8192. El sistema se compone de dos etapas: un tokenizador coclear que convierte el audio en una secuencia discreta de 8192 símbolos, y un modelo autoregresivo de segunda etapa que predice esos tokens. Este checkpoint concreto, `AuriStream100M_10Pred_BigAudioDataset_500k-randinit`, contiene un modelo recién inicializado con pesos aleatorios (semilla 1110) y no ha recibido ningún entrenamiento; se publica como punto de partida para experimentación y desarrollo.

Con aproximadamente 154 millones de parámetros (12 capas, 768 de dimensión oculta, 12 cabezas de atención), está diseñado para predicción de 10 pasos de tokens cocleares por cada paso de entrada. La arquitectura es un transformer autoregresivo estándar adaptado a señales auditivas discretizadas. El interés de este repositorio radica en que permite reproducir el proceso de inicialización y entrenamiento de AuriStream, y sirve como base para comparar variantes con distinto número de pasos de predicción (10, 20, 40, 100) dentro de la misma familia de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo sobre tokens cocleares (AuriStream) |
| Parámetros totales | 154.160.256 (~0,15 B) |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de audio/habla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AuriStream es un modelo de lenguaje de habla de segunda etapa. La primera etapa es un tokenizador coclear (WavCochCausalV8192) que convierte el audio en una secuencia de tokens discretos. La segunda etapa, que es este modelo, aplica un modelo autoregresivo sobre esos tokens para aprender representaciones de fonemas y palabras. La arquitectura es un transformer denso de 12 capas con 768 unidades ocultas y 12 cabezas de atención, con un vocabulario de 8192 tokens y un objetivo de predicción de 10 pasos futuros.

Este checkpoint concreto se ha instanciado con pesos aleatorios (semilla 1110) y no ha sido entrenado. El proyecto AuriStream en general se entrena sobre un gran dataset de audio (BigAudioDataset, 500k horas) y muestra resultados competitivos en tareas de habla de SUPERB. No se dispone de información detallada sobre el proceso de entrenamiento de las versiones finales (número de tokens, composición exacta del dataset, si se usó RLHF o DPO), aunque el repositorio base de AuriStream indica que es un modelo autoregresivo estándar.

## Capacidades

- Generación de tokens cocleares: el modelo predice los siguientes 10 tokens cocleares a partir de un contexto dado, lo que permite reconstruir audio de forma autoregresiva.
- Representación de habla: según el proyecto general, AuriStream aprende representaciones de fonemas y palabras con semántica léxica de última generación, y es competitivo en tareas de SUPERB (reconocimiento de fonemas, identificación de hablante, etc.).
- Soporte de tool calling: no aplica (modelo de audio, no de texto).
- Soporte de agentes: no aplica.
- Capacidades multilingües: al ser un modelo de audio, podría procesar múltiples idiomas, pero no se especifican idiomas soportados.
- Capacidades especiales: procesamiento de señales de audio, modelado de habla directamente sobre tokens cocotales.

**Nota importante**: este checkpoint específico tiene pesos aleatorios y no ha sido entrenado, por lo que las capacidades anteriores corresponden al modelo AuriStream final, no a este checkpoint concreto.

## Casos de uso

- **Investigación sobre modelos de habla autoregresivos**: este checkpoint permite estudiar el comportamiento de la arquitectura AuriStream desde cero, comparar la inicialización con versiones entrenadas y analizar la evolución del aprendizaje.
- **Entrenamiento desde cero**: sirve como punto de partida para entrenar un modelo de habla con un dataset propio, adaptando el vocabulario coclear o el número de pasos de predicción.
- **Evaluación de tokenizadores cocleares**: al ser un modelo que opera sobre tokens de WavCochCausalV8192, se puede usar para validar la calidad de ese tokenizador antes de invertir en entrenamiento completo.
- **Comparación de variantes de AuriStream**: junto con los checkpoints de 20, 40 y 100 pasos de predicción, permite estudiar el efecto del horizonte de predicción en el aprendizaje de representaciones.
- **Reproducibilidad**: al estar inicializado con semilla fija, permite reproducir experimentos de inicialización y comparar configuraciones de arquitectura (capas, cabezas, etc.) en condiciones controladas.
- **Desarrollo de modelos de habla en entornos con recursos limitados**: con solo 0,15 B de parámetros, es una base asequible para experimentar en hardware de gama media antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint en la información disponible. El proyecto AuriStream en general afirma ser competitivo en tareas SUPERB, pero no se proporcionan métricas concretas. Para este checkpoint de pesos aleatorios, no procede evaluar rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 0,3 GB, lo que sugiere que los pesos en fp32 ocupan aproximadamente 0,6 GB en memoria. Con cuantización a fp16 se reduciría a ~0,3 GB, y con int8 a ~0,15 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia con este modelo. Para entrenamiento, se recomienda al menos una GPU con 8 GB de VRAM (RTX 3070, A10) para lotes pequeños.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un modelo de transformers con código personalizado, se puede cargar con `trust_remote_code=True` en Hugging Face. No se menciona soporte para vLLM, llama.cpp o TGI; el modelo está pensado para experimentación, no para despliegue en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Predicción de pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuriStream100M-10Pred (este) | ~0,15 B | No disponible | 10 pasos | Apache 2.0 | Hugging Face |
| AuriStream100M-20Pred | ~0,2 B (según etiqueta) | No disponible | 20 pasos | Apache 2.0 | Hugging Face |
| AuriStream100M-40Pred | ~0,2 B | No disponible | 40 pasos | Apache 2.0 | Hugging Face |
| AuriStream100M-100Pred | ~0,2 B | No disponible | 100 pasos | Apache 2.0 | Hugging Face |

No se dispone de datos comparativos con otros modelos de habla como HuBERT o WavLM, ya que AuriStream se centra en la predicción de tokens cocotales y no en la extracción de características directamente comparables.

## Limitaciones y advertencias

- **Pesos aleatorios**: este checkpoint no ha sido entrenado, por lo que no es útil para ninguna tarea de habla real. Solo sirve como inicialización para entrenamiento.
- **Sesgos y alucinaciones**: al no estar entrenado, no se aplican sesgos, pero una vez entrenado podría heredar sesgos del dataset de entrenamiento (BigAudioDataset), que no se documentan.
- **Riesgo de alucinación**: en el contexto de generación de audio, el modelo entrenado podría generar tokens incoherentes si se usa fuera de su distribución de entrenamiento.
- **Limitaciones de contexto**: no se especifica la longitud de contexto; es probable que dependa del tokenizador y de los datos de entrenamiento.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero este checkpoint concreto no es útil sin entrenamiento adicional.
- **Caveat de producción**: este modelo no está listo para uso en producción, ni siquiera como base, porque los pesos aleatorios no ofrecen ninguna capacidad. Es necesario entrenarlo completamente.

## Enlaces

- [Hugging Face del modelo](https://huggingface.co/TuKoResearch/AuriStream100M_10Pred_BigAudioDataset_500k-randinit)
- [Página del proyecto AuriStream](https://tukoresearch.github.io/auristream-speech/)
- [Tokenizador WavCochCausalV8192](https://huggingface.co/TuKoResearch/WavCochCausalV8192)
- [Repositorio base AuriStream](https://huggingface.co/TuKoResearch/AuriStream-base)
