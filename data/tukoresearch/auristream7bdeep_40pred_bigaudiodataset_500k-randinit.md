# TuKoResearch/AuriStream7BDeep_40Pred_BigAudioDataset_500k-randinit

## Resumen

AuriStream7BDeep_40Pred_BigAudioDataset_500k-randinit es un modelo de lenguaje de voz (speech language model) desarrollado por TuKoResearch, un equipo liderado por Greta Tuckute y Klemen Kotar. El modelo predice tokens cocleares (cochlear tokens) generados por un tokenizador como WavCochCausalV8192, lo que le permite representar el habla de forma autoregresiva y generar continuaciones de audio que pueden decodificarse de vuelta a señales acústicas. Este enfoque difiere de los modelos de voz tradicionales que operan sobre espectrogramas o características mel, y se alinea con la tendencia de tratar el audio como una secuencia de tokens discretos.

El modelo tiene 8.410.077.440 parámetros (8,41B) y se entrenó sobre un dataset de audio de gran tamaño (BigAudioDataset) durante 500.000 pasos, con inicialización aleatoria de pesos (randinit). Está disponible bajo licencia Apache-2.0, aunque su acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace. Su relevancia radica en que ofrece una representación del habla competitiva en tareas de SUPERB (Speech processing Universal PERformance Benchmark) y, al mismo tiempo, es generativo: puede producir audio continuo, lo que abre la puerta a aplicaciones de síntesis y análisis de voz en un mismo marco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (speech language model) |
| Parametros totales | 8.410.077.440 (8,41B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 20.480 tokens (segun variante de 20k; no confirmado para esta version) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AuriStream se basa en una arquitectura Transformer autoregresiva que opera sobre tokens cocleares. Estos tokens se obtienen mediante un tokenizador causal (WavCochCausalV8192) que discretiza la señal de audio en una secuencia de símbolos que representan la actividad de la cóclea simulada. El modelo se entrena para predecir el siguiente token coclear dado el contexto previo, de forma análoga a un modelo de lenguaje textual. Esta formulación permite que el modelo aprenda representaciones del habla ricas y jerárquicas, y que además pueda generar audio nuevo muestreando de su distribución predictiva.

El entrenamiento se realizó sobre BigAudioDataset, un dataset de audio a gran escala, durante 500.000 pasos de optimización. La inicialización aleatoria (randinit) indica que no se partió de pesos preentrenados de otro modelo, sino que se entrenó desde cero. No se han publicado detalles sobre la composición exacta del dataset, el número total de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación principal del modelo es su capacidad de unificar representación y generación de voz en un único marco autoregresivo, lo que lo diferencia de modelos encoder-only como wav2vec 2.0 o HuBERT.

## Capacidades

- Representacion del habla: extrae características útiles para tareas de procesamiento de voz, con rendimiento competitivo en el benchmark SUPERB.
- Generacion de audio: puede generar continuaciones de audio coherentes, que pueden visualizarse en el dominio tiempo-frecuencia y decodificarse de vuelta a señal acústica.
- Modelado autoregresivo: predice tokens cocleares de forma secuencial, lo que permite condicionar la generación sobre contexto previo.
- Aprendizaje de representaciones jerárquicas: al operar sobre tokens cocleares, captura tanto información fonética como prosódica y de bajo nivel acústico.
- Multilingüismo: no se ha especificado si el modelo es multilingüe; la información disponible no detalla los idiomas soportados.
- Tool calling y agentes: no aplica, es un modelo de audio, no un agente conversacional.

## Casos de uso

- Reconocimiento automatico del habla (ASR): el modelo puede utilizarse como extractor de características para un sistema ASR, aprovechando sus representaciones de tokens cocleares para transcribir audio a texto. Su rendimiento en SUPERB sugiere que las representaciones son discriminativas para fonemas y palabras.
- Verificacion de locutor: las representaciones aprendidas pueden alimentar un clasificador de identidad de locutor, ya que el modelo captura características vocales específicas de cada hablante.
- Clasificacion de emociones en voz: al modelar la prosodia y la dinámica temporal del habla, el modelo puede servir para entrenar clasificadores de emociones sobre sus embeddings.
- Sintesis de voz condicionada: gracias a su capacidad generativa, puede emplearse para generar audio de voz a partir de un contexto previo, por ejemplo, para completar una frase interrumpida o para crear muestras de voz sintética.
- Analisis de audio en investigacion cientifica: el modelo permite visualizar las predicciones en el dominio tiempo-frecuencia, lo que resulta útil para estudiar cómo los modelos de lenguaje procesan el habla y qué información fonética codifican.
- Aumento de datos para otros modelos de voz: las continuaciones de audio generadas pueden usarse para aumentar datasets de entrenamiento de otros sistemas de ASR o de síntesis, mejorando su robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La página del proyecto menciona que AuriStream muestra "rendimiento competitivo en diversas tareas de habla de SUPERB", pero no se proporcionan cifras concretas (por ejemplo, WER, accuracy) ni comparaciones numéricas con otros modelos. Tampoco se han publicado resultados de MMLU, HumanEval u otros benchmarks de texto, ya que el modelo está especializado en audio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,41B parámetros, en FP16 se necesitan aproximadamente 17 GB de VRAM. Con cuantización INT8, unos 8,5 GB; con INT4, unos 4,5 GB. No se han publicado cuantizaciones oficiales, por lo que estas cifras son estimaciones teóricas.
- GPU recomendadas: para FP16, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090, A5000) o superior. Para cuantización INT4, podría caber en GPUs de 8 GB como la RTX 3070 o la RTX 4060 Ti, aunque no hay garantía de soporte oficial.
- Despliegue: al ser un modelo de transformers, puede ejecutarse con la librería transformers de HuggingFace. Para producción, se podría servir con vLLM o TGI si se adapta a estos frameworks, aunque no hay documentación al respecto. También es posible usar llama.cpp si se convierte a GGUF, pero no se ha publicado tal conversión.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente AuriStream con otros modelos de voz de tamaño similar. Los modelos comparables en el ámbito de representación del habla son wav2vec 2.0 (300M), HuBERT (300M) y WavLM (300M), pero son significativamente más pequeños y no generativos. En el ámbito de modelos generativos de audio, AudioLM (Google) y MusicLM son más grandes y no están disponibles públicamente. Por tanto, no se puede establecer una comparativa cuantitativa fiable con los datos disponibles.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere aprobación del equipo de TuKoResearch para su descarga. Esto limita su uso inmediato en producción.
- Sesgos y alucinaciones: al ser un modelo generativo de audio, puede producir continuaciones que no correspondan a habla real o que contengan artefactos. No se han documentado sesgos específicos, pero es probable que herede sesgos del dataset de entrenamiento.
- Limitaciones de contexto: la longitud de contexto parece ser de 20.480 tokens (según la variante de 20k), lo que limita la duración del audio que puede procesarse de una vez. Para audio más largo, sería necesario segmentar.
- Idiomas: no se especifican los idiomas soportados, por lo que el rendimiento en lenguas distintas del inglés es incierto.
- Licencia: aunque es Apache-2.0, el acceso gated implica restricciones de uso que deben aceptarse explícitamente.
- Producción: al ser un modelo de investigación reciente (creado en 2026), no hay evidencia de despliegues en producción ni de su estabilidad en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TuKoResearch/AuriStream7BDeep_40Pred_BigAudioDataset_500k-randinit
- Variante 250k: https://huggingface.co/TuKoResearch/AuriStream7BDeep_40Pred_BigAudioDataset_250k
- Variante 100k: https://huggingface.co/TuKoResearch/AuriStream7BDeep_40Pred_BigAudioDataset_100k
- Página del proyecto: https://tukoresearch.github.io/auristream-speech/
