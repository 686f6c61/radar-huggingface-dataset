# TuKoResearch/AuriStream7BDeep_1Pred_BigAudioDataset_500k-randinit

## Resumen

AuriStream es un modelo de lenguaje de voz (speech language model) desarrollado por Greta Tuckute y Klemen Kotar, investigadores asociados a TuKoResearch. El modelo se centra en la representación de señales de audio mediante la predicción autorregresiva de tokens cocleares, que son generados por un tokenizador auditivo (por ejemplo, WavCochCausalV8192). Esta aproximación permite que el modelo aprenda representaciones fonémicas y semánticas de nivel de palabra de forma no supervisada, con rendimiento competitivo en tareas de habla del benchmark SUPERB.

La variante específica `AuriStream7BDeep_1Pred_BigAudioDataset_500k-randinit` tiene 7,59 mil millones de parámetros, fue entrenada sobre un gran conjunto de datos de audio (BigAudioDataset) con 500k pasos (probablemente) y una inicialización aleatoria (`randinit`). El modelo está diseñado para extracción de características de audio (feature-extraction) y se distribuye bajo licencia Apache 2.0, aunque su acceso está restringido (gated) en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo sobre tokens cocleares |
| Parametros totales | 7.592.208.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en variantes similares se ha visto 20.48K, pero no se confirma para esta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AuriStream sigue un enfoque de dos etapas: primero, un tokenizador coclear (como WavCochCausalV8192) convierte la señal de audio en una secuencia de tokens discretos que representan la actividad del nervio auditivo. La segunda etapa es un modelo autorregresivo de tipo Transformer que predice estos tokens cocleares en el tiempo. El modelo se entrena con un objetivo de predicción de tokens, lo que le permite aprender representaciones fonémicas y semánticas de alto nivel sin necesidad de etiquetas explícitas.

La variante `randinit` indica que el modelo se inicializó con pesos aleatorios, en lugar de partir de un checkpoint preentrenado. El entrenamiento se realizó sobre un gran dataset de audio (BigAudioDataset) y el sufijo `500k` sugiere que se usaron 500.000 pasos de entrenamiento o ejemplos, aunque no se detalla más. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La arquitectura concreta (número de capas, dimensiones de atención, etc.) no está disponible en la información pública.

## Capacidades

- Extracción de características de audio (feature-extraction) para señales de voz.
- Representación de fonemas y palabras con semántica léxica de nivel de palabra.
- Rendimiento competitivo en tareas de habla del benchmark SUPERB (reconocimiento de fonemas, reconocimiento de palabras, identificación de hablante, etc.).
- Modelo de lenguaje de voz que puede ser usado como encoder para tareas posteriores (clasificación, regresión, etc.).
- No se documenta soporte de tool calling, generación de texto, visión u otras modalidades. Es exclusivamente para audio/habla.

## Casos de uso

- **Extracción de features para sistemas de reconocimiento automático de voz (ASR)**: el modelo puede generar embeddings de audio que luego se alimentan a un decodificador de texto. Su capacidad para capturar fonemas y semántica lo hace útil como encoder en pipelines de ASR.
- **Análisis de prosodia y características del hablante**: al predecir tokens cocleares, el modelo codifica información sobre la identidad del hablante y la prosodia, lo que permite su uso en tareas de verificación de locutor o análisis de emociones.
- **Investigación en neurociencia y psicoacústica**: los tokens cocleares están inspirados en la cóclea humana, por lo que el modelo puede servir como herramienta para estudiar cómo se representa el habla en el sistema auditivo.
- **Pre-entrenamiento para tareas de habla**: se puede usar como modelo base para fine-tuning en tareas específicas como segmentación de fonemas, detección de palabras clave o clasificación de acentos.
- **Sistemas de asistencia para personas con discapacidad auditiva**: las representaciones cocleares pueden ayudar a desarrollar interfaces de comunicación basadas en patrones auditivos.
- **Investigación en aprendizaje auto-supervisado**: como modelo de voz auto-supervisado, es útil para comparar enfoques y desarrollar nuevos métodos de representación de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La descripción menciona que AuriStream muestra "rendimiento competitivo en diversas tareas de SUPERB", pero no se proporcionan cifras concretas para esta variante específica.

## Requisitos de hardware

- El modelo tiene 7.59B parámetros. En FP16 (2 bytes por parámetro) ocupa aproximadamente 15,2 GB, coincidiendo con el tamaño del repositorio (15.2 GB).
- Para inferencia con precisión completa (FP16) se necesitaría al menos una GPU con 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB o similar).
- Con cuantización a 8 bits (INT8) se podría reducir a ~7,6 GB, y a 4 bits a ~3,8 GB, lo que permitiría ejecutarlo en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 (8 GB) con cuantización.
- Al ser un modelo de la librería Transformers, se puede desplegar con frameworks como Hugging Face Transformers, vLLM (si es compatible con arquitectura causal), o llama.cpp si se convierte a GGUF. Sin embargo, no se confirma la compatibilidad con estos entornos.
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de voz similares. AuriStream se puede situar en la categoría de modelos de lenguaje de voz auto-supervisados, como `wav2vec 2.0`, `HuBERT` o `WavLM`, pero no se tienen datos de rendimiento comparativo. La información disponible solo menciona que AuriStream supera a otros en algunas tareas de semántica léxica, pero no se aportan cifras.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo está detrás de un muro de acceso (gated) en Hugging Face, por lo que requiere aprobación del autor para su descarga.
- **Sin información de sesgos**: no se han publicado análisis de sesgos o evaluaciones de equidad. Al ser un modelo entrenado en audio, podría heredar sesgos de los datos de entrenamiento (acentos, dialectos, calidad de grabación, etc.).
- **Riesgo de alucinación**: al ser un modelo generativo de tokens, puede producir salidas no fieles a la entrada si se usa para generación, aunque su propósito principal es la extracción de features.
- **Limitaciones de contexto**: la longitud de contexto no se ha especificado, lo que limita la duración máxima de audio procesable.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe verificar la procedencia de los datos de entrenamiento (BigAudioDataset) para cumplir con sus términos.
- **Formato de pesos**: solo se ofrecen safetensors; no hay versiones cuantizadas oficiales, lo que puede limitar el despliegue en hardware modesto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TuKoResearch/AuriStream7BDeep_1Pred_BigAudioDataset_500k-randinit)
- [Página del proyecto AuriStream](https://tukoresearch.github.io/auristream-speech/)
- [Variante AuriStream7BDeep_40Pred_BigAudioDataset_10k](https://huggingface.co/TuKoResearch/AuriStream7BDeep_40Pred_BigAudioDataset_10k)
- [Variante AuriStream7BDeep_40Pred_BigAudioDataset_100k](https://huggingface.co/TuKoResearch/AuriStream7BDeep_40Pred_BigAudioDataset_100k)
