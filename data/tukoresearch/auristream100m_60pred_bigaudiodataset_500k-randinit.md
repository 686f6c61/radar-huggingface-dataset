# TuKoResearch/AuriStream100M_60Pred_BigAudioDataset_500k-randinit

## Resumen

AuriStream es un modelo de lenguaje de voz desarrollado por Greta Tuckute y Klemen Kot, que predice tokens cocleulares generados por un tokenizador como WavCochCausalV8192. El modelo base aprende representaciones del habla mediante predicción autoregresiva de estos tokens, capturando información fonética y semántica de forma competitiva en tareas como SUPERB. Este repositorio concreto contiene una inicialización aleatoria del modelo `AuriStream100M60PredConfig`, con pesos sin entrenar y creada con la semilla 1110. La arquitectura es un transformer de 12 capas, 768 unidades ocultas y 12 cabezas de atención, con un total aproximado de 470 millones de parámetros. Su relevancia radica en ser un punto de partida para experimentos de entrenamiento desde cero, así como para comprender el comportamiento del modelo antes de cualquier ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (12 capas, 768 hidden, 12 cabezas) |
| Parámetros totales | 468.733.056 (~0,47B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AuriStream consta de dos etapas: un tokenizador coclear (WavCochCausalV8192) que convierte el audio en tokens discretos, y un modelo de lenguaje autoregresivo que predice esos tokens. El checkpoint actual es la segunda etapa, un transformer con 12 capas, 768 unidades ocultas, 12 cabezas de atención y un vocabulario de 8192 tokens, configurado para 60 pasos de predicción. Este checkpoint está inicializado aleatoriamente con la semilla 1110 y no ha sido entrenado. El entrenamiento del modelo base se realiza sobre un gran conjunto de audio, pero no se proporcionan datos concretos sobre el número de tokens ni el proceso de optimización (RLHF, DPO, etc.). La innovación principal es el uso de tokens cocleares y su predicción autoregresiva para representar el habla.

## Capacidades

- Predicción de tokens cocleares a partir de audio (capacidad del modelo base).
- Representaciones de habla con propiedades fonéticas y semánticas (según el proyecto base).
- Potencial para tareas de reconocimiento de voz, clasificación de fonemas y semántica léxica.
- Soporte de extracción de características mediante `feature-extraction`.
- No incluye soporte de tool calling, agentes, ni visión/audio adicional (solo audio).
- Este checkpoint con pesos aleatorios no tiene capacidades funcionales hasta ser entrenado.

## Casos de uso

- **Investigación en entrenamiento de modelos de habla**: se puede entrenar este checkpoint sobre un dataset de audio para estudiar cómo se forman las representaciones fonéticas y semánticas a lo largo del entrenamiento.
- **Desarrollo de sistemas de reconocimiento de voz**: entrenando el modelo, puede servir como extractor de características para tareas de clasificación de fonemas o palabras.
- **Generación de representaciones para modelos aguas abajo**: una vez entrenado, sus salidas intermedias pueden alimentar clasificadores o modelos de NLP para análisis de voz.
- **Evaluación de configuraciones de predicción**: permite comparar el efecto de distintos pasos de predicción (20, 40, 60) en la calidad de las representaciones.
- **Pruebas de transferencia de aprendizaje**: usar las representaciones del modelo para tareas de clasificación de emociones o identificación de hablante.
- **Experimentos de inicialización**: estudiar el impacto de la semilla y la inicialización en el entrenamiento de modelos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto base de AuriStream menciona que el modelo es competitivo en tareas SUPERB, pero no se proporcionan cifras concretas para este checkpoint específico.

## Requisitos de hardware

- **VRAM estimada**: para inferencia con el modelo entrenado, en fp16 se necesitan ~0,94 GB para los pesos, más memoria para activaciones. En fp32, ~1,87 GB.
- **GPU recomendada**: una GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp16 (por ejemplo, NVIDIA GTX 1650 o superior). Para entrenamiento, se recomienda GPU con más memoria.
- **Compatibilidad**: puede ejecutarse en CPU para pruebas pequeñas, pero la inferencia será lenta.
- **Opciones de despliegue**: compatible con la librería `transformers` de Hugging Face, incluyendo `AutoModel` con `trust_remote_code=True`. También se puede integrar con vLLM o TGI si se adapta el código personalizado.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa directa. Existen otros modelos de habla como Wav2Vec2 o HuBERT, pero tienen arquitecturas y objetivos diferentes. Dentro de la familia AuriStream, existen variantes con 20 y 40 pasos de predicción, pero no se han publicado datos de rendimiento para estas versiones. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Pesos aleatorios**: este checkpoint no es funcional para tareas reales; es solo una inicialización para experimentos.
- **Sesgos**: el modelo base puede heredar sesgos del dataset de entrenamiento, pero no se han detallado.
- **Riesgo de alucinación**: al ser un modelo de habla, no genera texto, pero podría producir tokens no válidos si se usa sin entrenar.
- **Contexto limitado**: no se especifica la longitud de contexto, por lo que se debe asumir que está limitada a la ventana de tokens de entrada.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe mantener la atribución.
- **Código personalizado**: requiere `trust_remote_code=True` al cargar, lo que puede ser un riesgo de seguridad si el código no se audita.

## Enlaces

- [HuggingFace - AuriStream100M_60Pred_BigAudioDataset_500k-randinit](https://huggingface.co/TuKoResearch/AuriStream100M_60Pred_BigAudioDataset_500k-randinit)
- [Página del proyecto AuriStream](https://tukoresearch.github.io/auristream-speech/)
- [Tokenizador WavCochCausalV8192](https://huggingface.co/TuKoResearch/WavCochCausalV8192)
- [Código base del modelo AuriStream](https://huggingface.co/TuKoResearch/AuriStream-base)
