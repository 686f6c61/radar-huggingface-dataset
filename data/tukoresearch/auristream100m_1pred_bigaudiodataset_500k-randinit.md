# TuKoResearch/AuriStream100M_1Pred_BigAudioDataset_500k-randinit

## Resumen

AuriStream es un modelo de lenguaje de voz desarrollado por Greta Tuckute y Klemen Kotar, del grupo TuKo Research. A diferencia de los modelos de lenguaje textuales convencionales, AuriStream opera sobre tokens cocleares extraídos de audio mediante un tokenizador especializado (como WavCochCausalV8192), y aprende a predecir de forma autorregresiva la siguiente secuencia de dichos tokens. Este enfoque permite aprender representaciones de fonemas, palabras y semántica léxica directamente desde la señal de audio, sin transcripciones textuales intermedias.

Este repositorio concreto contiene un checkpoint recién inicializado con pesos aleatorios (etiqueta `randinit`), generado con la semilla 1110 y convertido al formato Hugging Face. No ha sido entrenado desde ningún checkpoint previo, por lo que no es apto para uso directo en inferencia real, sino como punto de partida para experimentos de entrenamiento o para verificar la arquitectura. La arquitectura es un transformer de 12 capas, 768 de dimensión oculta, 12 cabezas de atención y un vocabulario de 8192 tokens cocleares, con un paso de predicción.

La relevancia de este modelo radica en que forma parte de la familia AuriStream, que ha demostrado rendimiento competitivo en tareas de evaluación de voz SUPERB (phoneme recognition, keyword spotting, speaker verification, etc.), y su publicación permite reproducir el pipeline completo de entrenamiento desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (12 capas, hidden size 768, 12 cabezas) |
| Parámetros totales | 97.537.152 (~0,10B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo procesa secuencias de tokens cocleares, no texto) |
| Tipos de cuantización | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AuriStream es un modelo de lenguaje de voz de dos etapas. La primera etapa convierte la señal de audio en tokens cocleares mediante un tokenizador causal (como WavCochCausalV8192, con un vocabulario de 8192 tokens). La segunda etapa es un transformer autorregresivo que predice el siguiente token coclear dado el contexto previo. En este checkpoint, la configuración es de 12 capas, 768 unidades ocultas, 12 cabezas de atención y un solo paso de predicción (1Pred).

El checkpoint aquí publicado se inicializó con pesos aleatorios mediante la semilla 1110 y no ha sido sometido a ningún entrenamiento. La información sobre el dataset de entrenamiento (BigAudioDataset, 500k pasos) aparece en el nombre del repositorio, pero no se proporcionan detalles sobre su composición o volumen de tokens. No se menciona el uso de técnicas como RLHF o DPO; se trata de un modelo de preentrenamiento autoregresivo estándar sobre tokens de audio.

## Capacidades

- Extracción de características de audio: genera representaciones de tokens cocleares que pueden usarse como embeddings para tareas de downstream.
- Predicción autorregresiva de tokens de habla: el modelo aprende a modelar la secuencia de tokens cocleares, lo que permite generar o completar audio.
- Representaciones de habla de alto nivel: según los resultados publicados de la familia AuriStream, los modelos entrenados aprenden representaciones de fonemas, palabras y semántica léxica.
- Compatibilidad con tareas SUPERB: los modelos entrenados de esta familia muestran resultados competitivos en tareas de evaluación de habla (phoneme recognition, keyword spotting, speaker verification, etc.).
- No soporta generación de texto ni tool calling: al ser un modelo de audio, no tiene capacidades de generación de texto o función llamada.
- Multilingüe: no se especifican idiomas; la información no está disponible.

## Casos de uso

- **Investigación en representaciones de voz**: los investigadores pueden tomar este checkpoint como punto de partida para entrenar el modelo desde cero con sus propios datos y evaluar cómo evolucionan las representaciones fonémicas y semánticas durante el entrenamiento.
- **Fine-tuning para tareas de audio específicas**: aunque los pesos son aleatorios, el modelo puede ser entrenado en tareas como clasificación de emociones, detección de voz activa o identificación de hablante, aprovechando la arquitectura de tokens cocleares.
- **Verificación de la arquitectura**: permite a los desarrolladores comprobar que el código del modelo (con `trust_remote_code`) funciona correctamente y que la conversión a Hugging Face es válida antes de usar los checkpoints entrenados.
- **Experimentos de inicialización**: investigar cómo influye la semilla de inicialización (1110) en el rendimiento final, comparando con otras semillas.
- **Desarrollo de tokenizadores cocleares**: al estar ligado a WavCochCausalV1, este modelo puede usarse para probar nuevos tokenizadores y ver si la arquitectura se adapta correctamente.
- **Comparación de estrategias de predicción**: la variante 1Pred puede compararse con las versiones 20Pred, 40Pred o 100Pred (más pasos de predicción) para estudiar el efecto del horizonte de predicción en la calidad de las representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint concreto, dado que contiene pesos aleatorios y no ha sido entrenado. La familia AuriStream, una vez entrenada, muestra resultados competitivos en tareas SUPERB, pero no se dispone de datos numéricos específicos en la información proporcionada. Se recomienda consultar el repositorio base de AuriStream para obtener cifras de rendimiento de los modelos entrenados.

## Requisitos de hardware

- **VRAM estimada**: al tener 0,1B de parámetros, en fp32 el modelo requiere aproximadamente 390 MB de VRAM (97,5M parámetros × 4 bytes). Con cuantización a 8 bits bajaría a unos 100 MB, y a 4 bits a ~50 MB.
- **GPU recomendadas**: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para la inferencia y el entrenamiento (por ejemplo, RTX 2060, RTX 3060, GTX 1660). Incluso se podría ejecutar en una Raspberry Pi con suficiente RAM para inferencia simple, aunque con latencia mayor.
- **En consumer GPU**: sí, cabe en cualquier GPU consumer moderna, incluso en las más modestas.
- **Opciones de despliegue**: al ser un modelo de transformers con código personalizado, se puede cargar con `AutoModel.from_pretrained` usando `trust_remote_code=True`. No se han publicado soporte para vLLM, Ollama o llama.cpp, ya que no es un modelo de texto y usa tokens especiales.
- **Latencia y throughput**: al ser un modelo pequeño (0,1B), la latencia de inferencia es baja. En una GPU moderna (RTX 3090) se pueden procesar miles de tokens por segundo, pero no se dispone de datos exactos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (SUPERB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuriStream100M_1Pred (este) | 0,1B | Audio | No entrenado | Apache 2.0 | Hugging Face |
| AuriStream100M_20Pred | 0,2B (según búsqueda) | Audio | No disponible | Apache 2.0 | Hugging Face |
| AuriStream100M_40Pred | 0,1B (estimado) | Audio | No disponible | Apache 2.0 | Hugging Face |
| wav2vec2-base (Facebook) | 0,3B | 1.600 ms | 0.85 (WER) | Apache 2.0 | Hugging Face |
| HuBERT-base (Facebook) | 0,3B | 1.600 ms | 0.90 (WER) | MIT | Hugging Face |

Nota: los datos de rendimiento de wav2vec2 y HuBERT son aproximados y provienen de la literatura general; no se han comparado directamente con AuriStream en este documento. La comparativa es orientativa para entender el tamaño y enfoque (audio vs. texto).

## Limitaciones y advertencias

- **Pesos aleatorios**: este checkpoint no ha sido entrenado. No produce resultados útiles para tareas reales de reconocimiento de voz o extracción de características. Solo sirve para iniciar un entrenamiento desde cero.
- **No es un modelo de texto**: no genera texto, no soporta tool calling ni agentes. Su salida son tokens cocleares, que requieren un tokenizador inverso para convertirlos en audio.
- **Dependencia de código personalizado**: requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código del repositorio remoto. Debe verificarse la confiabilidad del código antes de usarlo en entornos de producción.
- **Idiomas no especificados**: no hay información sobre los idiomas que soporta el modelo, aunque el dataset se llama "BigAudioDataset" y probablemente sea multilingüe, pero no está documentado.
- **Licencia**: aunque es Apache 2.0, el código personalizado del modelo puede tener restricciones adicionales; se recomienda revisar el repositorio base.
- **Fecha de creación**: el modelo fue creado en 2026, lo que sugiere que es un proyecto reciente y puede tener menos soporte comunitario que modelos más maduros.
- **Sin benchmarks**: no hay datos de rendimiento para este checkpoint, y los modelos entrenados de la familia AuriStream aún no tienen comparativas públicas detalladas en la web.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TuKoResearch/AuriStream100M_1Pred_BigAudioDataset_500k-randinit)
- [Tokenizador WavCochCausalV8192](https://huggingface.co/TuKoResearch/WavCochCausalV8192)
- [Modelo base AuriStream](https://huggingface.co/TuKoResearch/AuriStream-base)
- [Web de investigación de AuriStream](https://tukoresearch.github.io/auristream-speech/)
- [Organización TuKoResearch en Hugging Face](https://huggingface.co/TuKoResearch/models)
- [Búsqueda de modelos con tag auristream](https://huggingface.co/models?other=auristream)
