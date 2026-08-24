# TuKoResearch/AuriStream100M_80Pred_BigAudioDataset_500k-randinit

## Resumen

AuriStream es un modelo de lenguaje de voz desarrollado por Greta Tuckute y Klemen Kotar (TuKoResearch) que predice de forma autorregresiva tokens cocleares generados por un tokenizador como WavCochCausalV8192. La arquitectura consta de dos etapas: un tokenizador coclear que convierte la señal de audio en una secuencia discreta y un modelo de lenguaje secuencial que aprende a predecir esos tokens. El proyecto demuestra que el modelo adquiere representaciones de fonemas y palabras, alcanzando resultados competitivos en tareas del benchmark SUPERB.

Este repositorio concreto, `AuriStream100M_80Pred_BigAudioDataset_500k-randinit`, contiene una instancia recién inicializada del modelo AuriStream de 100M (0,59B parámetros) con 80 pasos de predicción. Los pesos son aleatorios y no han sido entrenados desde un checkpoint; la inicialización se realizó mediante el modelo de entrenamiento nativo con semilla 1110 antes de convertir al formato de Hugging Face. Por tanto, no es un modelo funcional listo para uso, sino un artefacto de investigación para estudiar la inicialización o como punto de partida para entrenamiento.

La relevancia actual radica en que AuriStream propone un enfoque novedoso para el habla mediante predicción autorregresiva de tokens cocleares, en contraste con los modelos de representación de audio basados en contrastive learning o reconstrucción. Esta versión randomizada permite a los investigadores experimentar con el comportamiento de la inicialización y la dinámica de entrenamiento antes de disponer de pesos entrenados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | AuriStream (transformer autoregressive sobre tokens cocleares) |
| Parámetros totales | 594.562.176 (~0.59B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Detalles de configuración (según model card):

| Parámetro | Valor |
|---|---|
| Capas | 12 |
| Hidden Size | 768 |
| Cabezas de atención | 12 |
| Vocab Size | 8192 |
| Pasos de predicción | 80 |

## Arquitectura y entrenamiento

AuriStream es un modelo de lenguaje autorregresivo que opera sobre una secuencia de tokens cocleares, es decir, unidades discretas que representan la señal de audio filtrada por la cóclea. El tokenizer WavCochCausalV8192 genera un vocabulario de 8192 tokens; el modelo predice los siguientes 80 pasos de forma autorregresiva. La arquitectura es un transformer estándar con 12 capas, tamaño oculto de 768 y 12 cabezas de atención, similar en escala a modelos de lenguaje pequeños (0.59B).

No se dispone de información sobre el proceso de entrenamiento de este checkpoint en particular, ya que se trata de una inicialización aleatoria. El proyecto general AuriStream se entrena en dos etapas: primero el tokenizador coclear y después el modelo de lenguaje sobre los tokens generados. En este repositorio no se especifican los datos de entrenamiento ni el número de tokens usados. La inicialización se realizó con semilla `1110` mediante el modelo de entrenamiento nativo, y luego se convirtió a formato Hugging Face.

No hay innovaciones técnicas adicionales descritas en el checkpoint, pero la propuesta general de AuriStream reside en el uso de tokens cocleares como representación intermedia, que permite una modelización de la voz más fiel a la percepción auditiva que los espectrogramas o las características de mel.

## Capacidades

- El modelo está diseñado para la predicción de tokens cocleares, lo que permite generar o completar secuencias de audio a nivel de representación coclear.
- Como checkpoint de pesos aleatorios, **no posee ninguna capacidad funcional real** hasta que se entrene con datos.
- La arquitectura es compatible con tareas de extracción de características (feature extraction) y procesamiento de secuencias de audio.
- El proyecto AuriStream en general demuestra capacidades de representación de fonemas y palabras, así como rendimiento competitivo en tareas de SUPERB, pero estos resultados corresponden a modelos entrenados, no a este checkpoint.
- No se ha verificado soporte de tool calling, agentes o multilingüismo en la información disponible.

## Casos de uso

Dado que este checkpoint es una inicialización aleatoria, los casos de uso prácticos son limitados y se orientan a investigación y desarrollo:

- **Investigación sobre inicialización de modelos de audio**: los investigadores pueden estudiar cómo las inicializaciones aleatorias afectan la dinámica de entrenamiento de modelos de lenguaje cocleares, comparando con otras semillas o configuraciones.
- **Entrenamiento de modelos de voz**: el checkpoint puede servir como punto de partida para entrenar un AuriStream desde cero, en lugar de usar pesos preentrenados.
- **Desarrollo de tokenizadores cocleares**: al usarse junto con WavCochCausalV8192, permite validar la integración del tokenizador y el modelo en el pipeline de Hugging Face.
- **Pruebas de integración**: sirve para verificar que el código personalizado de AuriStream funciona correctamente en entornos de producción (por ejemplo, al cargar con `trust_remote_code=True`).
- **Benchmark de infraestructura**: se puede usar para medir el rendimiento de inferencia de un modelo de 0.59B en diferentes GPUs, aunque el modelo no produzca salidas significativas.
- **Educación y demostración**: permite ilustrar la arquitectura de un modelo de lenguaje de audio sin necesidad de descargar un modelo entrenado pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este checkpoint es una inicialización aleatoria, por lo que no tiene rendimiento evaluable en tareas como MMLU, HumanEval o SUPERB. La web del proyecto AuriStream menciona resultados competitivos en SUPERB, pero corresponden a modelos entrenados, no a esta versión random.

## Requisitos de hardware

- **VRAM estimada para inferencia**: un modelo de 0.59B parámetros en precisión fp16 ocupa aproximadamente 1.2 GB de memoria (0.59B × 2 bytes). En cuantización int8, alrededor de 0.6 GB. Es viable en cualquier GPU consumer moderna (RTX 2060 o superior).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16, aunque para entrenamiento se recomienda al menos una RTX 3090 o A100.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama media (RTX 3060, 4060, etc.) con fp16 o cuantización.
- **Opciones de despliegue**: al ser un modelo de Hugging Face con `trust_remote_code`, se puede usar con la librería `transformers` directamente. No hay soporte documentado para vLLM, llama.cpp u Ollama, ya que es un modelo de audio y no un LLM de texto.
- **Latencia y throughput**: no disponibles, pero para un modelo de 0.59B se espera una latencia baja (del orden de decenas de milisegundos por token) en GPUs modernas.

## Comparativa con modelos similares

Se pueden comparar las distintas variantes de AuriStream publicadas por TuKoResearch, aunque no hay datos de rendimiento para ninguno de estos checkpoints random:

| Modelo | Parámetros | Pasos de predicción | Estado |
|---|---|---|---|
| AuriStream100M_20Pred_BigAudioDataset_500k | ~0.2B | 20 | random init |
| AuriStream100M_40Pred_BigAudioDataset_500k | ~0.4B | 40 | random init |
| AuriStream100M_80Pred_BigAudioDataset_500k-randinit | ~0.59B | 80 | random init |

No hay información sobre modelos alternativos de la misma categoría (modelos de lenguaje de audio con tokens cocleares) en la información disponible.

## Limitaciones y advertencias

- **Pesos aleatorios**: el modelo no está entrenado; cualquier salida que produzca es ruido y no tiene significado semántico o acústico.
- **Sin utilidad práctica en producción**: no se debe usar en aplicaciones reales de procesamiento de voz, ya que no ha aprendido ninguna representación.
- **Licencia Apache-2.0**: permite uso comercial y modificación, pero al ser un checkpoint random, su valor comercial es nulo.
- **Dependencia de tokenizador externo**: para usar el modelo correctamente se requiere el tokenizador WavCochCausalV8192, que debe cargarse por separado.
- **Código personalizado**: el modelo requiere `trust_remote_code=True` en Hugging Face, lo que implica ejecutar código remoto no auditado, un riesgo de seguridad en entornos controlados.
- **Idiomas no especificados**: no hay información sobre los idiomas que el modelo podría llegar a soportar tras un entrenamiento.
- **Contexto limitado**: la longitud de contexto no está documentada; el modelo predice 80 pasos de tokens cocleares, pero no se especifica la ventana máxima de entrada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TuKoResearch/AuriStream100M_80Pred_BigAudioDataset_500k-randinit)
- [Código base de AuriStream](https://huggingface.co/TuKoResearch/AuriStream-base)
- [Tokenizador WavCochCausalV8192](https://huggingface.co/TuKoResearch/WavCochCausalV8192)
- [Proyecto AuriStream (web)](https://tukoresearch.github.io/auristream-speech/)
- [Búsqueda de modelos AuriStream en Hugging Face](https://huggingface.co/models?other=auristream)
