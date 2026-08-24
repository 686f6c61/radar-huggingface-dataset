# TuKoResearch/AuriStream100M_20Pred_BigAudioDataset_500k-randinit

## Resumen

AuriStream100M_20Pred_BigAudioDataset_500k-randinit es un modelo de lenguaje de voz desarrollado por Greta Tuckute y Klemen Kotar, perteneciente a la familia AuriStream de TuKoResearch. Este modelo concreto es una inicialización aleatoria de la arquitectura AuriStream de 100 millones de parámetros (aunque el checkpoint real contiene 217 millones de parámetros), configurado para predecir 20 pasos de tokens cocleares. El objetivo del proyecto es aprender representaciones de voz mediante la predicción autoregresiva de tokens cocleares, un enfoque que busca capturar la estructura fonética y semántica del habla de forma auto-supervisada.

La relevancia de este checkpoint es limitada porque **los pesos son aleatorios y no han sido entrenados**. Su propósito es servir como punto de partida para entrenamientos personalizados o para probar el código de la arquitectura. Aunque el modelo está diseñado para tareas de extracción de características de audio y reconocimiento de voz, este repositorio concreto no ofrece ninguna capacidad funcional sin entrenamiento previo. El proyecto AuriSpeech, en su versión completa, demuestra resultados competitivos en tareas de SUPERB, pero este checkpoint no es representativo de esas capacidades.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | AuriStream (modelo de lenguaje autoregresivo sobre tokens cocleares) |
| Parámetros totales | 217.074.816 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos aleatorios sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
AuriStream es un modelo de lenguaje de voz de dos etapas. La primera etapa consiste en un tokenizador coclear causal (como WavCochCausalV8192) que convierte la señal de audio en una secuencia de tokens discretos. La segunda etapa es un modelo autoregresivo que predice los siguientes tokens cocleares de forma secuencial. La arquitectura es un transformer estándar con 12 capas, tamaño de oculto 768, 12 cabezas de atención y un vocabulario de 8192 tokens.

Este checkpoint concreto fue instanciado con pesos aleatorios mediante el entrenamiento nativo con semilla 1110 y convertido al formato Hugging Face sin ningún entrenamiento previo. El nombre del repositorio indica que la configuración prevista era un entrenamiento sobre BigAudioDataset durante 500k pasos, pero los pesos no han pasado por ese proceso. El código base es compartido con el repositorio AuriStream-base.

## Capacidades
- **No tiene capacidades funcionales**: al ser pesos aleatorios, el modelo no produce salidas útiles sin entrenamiento previo.
- **Extracción de características**: una vez entrenado, podría usarse para extraer representaciones de voz, pero este checkpoint no lo permite.
- **Predicción de tokens**: el modelo está diseñado para predecir 20 pasos de tokens cocleares, pero sin entrenamiento no puede hacerlo correctamente.
- **Multilingüe**: no aplicable, no hay datos de idioma.
- **Tool calling**: no soportado.
- **Agentes**: no aplicable.

## Casos de uso
Dado que los pesos son aleatorios, los casos de uso se limitan a escenarios de desarrollo e investigación:

- **Validación de código**: los desarrolladores pueden usar este checkpoint para verificar que el código de carga y la inferencia funcionan correctamente con la arquitectura AuriStream.
- **Pruebas de entrenamiento**: sirve como punto de partida para ejecutar entrenamientos personalizados sobre datasets de audio, evitando descargar el modelo completo.
- **Investigación de arquitectura**: permite estudiar la estructura del modelo y su comportamiento antes de entrenarlo.
- **Desarrollo de tokenizadores**: puede usarse para probar la integración con el tokenizador WavCochCausalV8192.
- **Benchmarking de hardware**: permite medir el uso de memoria y latencia de la arquitectura sin necesidad de un modelo entrenado.
- **Pruebas de conversión de formato**: útil para verificar la compatibilidad con otras herramientas de despliegue.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks para este checkpoint concreto. El proyecto AuriStream en su versión completa (con entrenamiento) reporta resultados competitivos en tareas SUPERB, pero este repositorio no contiene esos pesos. No se dispone de métricas comparativas con otros modelos.

## Requisitos de hardware
- **VRAM estimada**: al ser un modelo de 0,2B parámetros, la inferencia requiere aproximadamente 0,9 GB en FP32 o 0,4 GB en FP16. En cuantización INT8 podría bajar a 0,2 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas de gama baja como GTX 1650 o integradas en portátiles.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer moderna.
- **Opciones de despliegue**: al ser un modelo de transformers, puede usarse con la librería transformers, vLLM, llama.cpp (si se convierte a GGUF) o cualquier framework que soporte safetensors.
- **Latencia**: no aplica, el modelo no tiene salidas útiles.

## Comparativa con modelos similares
No hay modelos comparables porque este checkpoint es una inicialización aleatoria, no un modelo entrenado. En el contexto del proyecto AuriStream, la comparativa real sería contra otros modelos de voz como wav2vec 2.0 o HuBERT, pero no hay datos de rendimiento para este checkpoint.

## Limitaciones y advertencias
- **Pesos aleatorios**: el modelo no ha sido entrenado y no produce salidas útiles. Cualquier uso en producción es imposible.
- **Sesgos**: no aplica, no hay datos de entrenamiento.
- **Riesgo de alucinación**: no aplica.
- **Licencia**: Apache-2.0, permite uso comercial y modificación, pero el modelo no es funcional.
- **Contexto**: la longitud de contexto no está especificada en la información disponible.
- **Producción**: no debe usarse en ningún entorno de producción sin entrenamiento previo.

## Enlaces
- [Hugging Face del modelo](https://huggingface.co/TuKoResearch/AuriStream100M_20Pred_BigAudioDataset_500k-randinit)
- [Repositorio base del modelo](https://huggingface.co/TuKoResearch/AuriStream-base)
- [Tokenizador WavCochCausalV8192](https://huggingface.co/TuKoResearch/WavCochCausalV8192)
- [Página del proyecto AuriStream](https://tukoresearch.github.io/auristream-speech/)</think>## Resumen
AuriStream100M_20Pred_BigAudioDataset_500k-randinit es un modelo de lenguaje de voz desarrollado por Greta Tuckute y Klemen Kotar dentro del proyecto AuriStream de TuKoResearch. Este checkpoint concreto es una **inicialización aleatoria** de la arquitectura AuriStream de 100 millones de parámetros (aunque el fichero safetensors contiene 217 millones de parámetros), configurado para predecir 20 pasos de tokens cocleares. El objetivo del proyecto es aprender representaciones de voz mediante la predicción autoregresiva de tokens cocleares generados por un tokenizador como WavCochCausalV8192.

La relevancia de este repositorio es limitada: **los pesos son aleatorios y no han sido entrenados**. Su función es servir como punto de partida para entrenamientos personalizados o para validar el código de la arquitectura. El proyecto AuriStream en su versión completa presenta resultados competitivos en tareas de SUPERB, pero este checkpoint no refleja esas capacidades. El modelo fue instanciado con semilla 1110 y convertido al formato Hugging Face sin ningún paso de entrenamiento.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | AuriStream (transformer autoregresivo sobre tokens cocleares) |
| Parametros totales | 217.074.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos aleatorios en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
AuriStream es un modelo de lenguaje de voz en dos etapas. La primera etapa es un tokenizador coclear causal (WavCochCausalV8192) que convierte la señal de audio en tokens discretos. La segunda etapa es un modelo autoregressive que predice secuencias de tokens cocleares. La arquitectura es un transformer estándar con 12 capas, tamaño de ocultación 768, 12 cabezas de atención y un vocabulario de 8192 tokens.

Este checkpoint concreto fue instanciado con pesos aleatorios mediante el entrenamiento nativo con semilla 1110, y convertido al formato Hugging Face sin entrenamiento. El nombre del repositorio sugiere que la configuración está pensada para un entrenamiento de 500k pasos sobre BigAudioDataset, pero no se ha ejecutado ningún entrenamiento. El código base se comparte con el repositorio AuriStream-base.

## Capacidades
- **No tiene capacidades funcionales**: al ser pesos aleatorios, el modelo no puede generar salidas útiles.
- **Extracción de características**: en su versión entrenada, podría extraer representaciones de voz, pero este checkpoint no lo permite.
- **Predicción de tokens**: está diseñado para predecir 20 pasos de tokens cocleares, pero sin entrenamiento no puede hacerlo.
- **Multilingüe**: no disponible.
- **Tool calling**: no soportado.
- **Agentes**: no soportado.

## Casos de uso
Dado que los pesos son aleatorios, los casos de uso se limitan a entornos de desarrollo e investigación:

- **Validación de código**: los desarrolladores pueden usar este checkpoint para verificar que la carga del modelo y la inferencia funcionan correctamente con la arquitectura AuriStream.
- **Pruebas de entrenamiento**: sirve como punto de partida para ejecutar entrenamientos personalizados sobre audio, evitando descargar un modelo entrenado.
- **Investigación de arquitectura**: permite estudiar la estructura y el comportamiento de la arquitectura antes de entrenarla.
- **Desarrollo de tokenizadores**: se puede usar para probar la integración con el tokenizador WavCochCausalV8192.
- **Benchmarking de código**: permite medir el uso de memoria y la latencia de la arquitectura sin necesidad de un modelo entrenado.
- **Pruebas de conversión**: útil para validar pipelines de despliegue con herramientas como vLLM u Ollama, aunque sin resultados funcionales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks para este checkpoint con pesos aleatorios. El proyecto AuriStream en su versión completa reporta resultados competitivos en tareas SUPERB, pero este repositorio no contiene esos datos.

## Requisitos de hardware
- **VRAM estimada**: al ser un modelo de 0,2B parámetros, la inferencia requiere aproximadamente 0,9 GB en FP32 o 0,4 GB en FP16. Con cuantización INT8 podría reducirse a ~0,2 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas de gama media como la GTX 1660 o la RTX 3060.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer moderna.
- **Opciones de despliegue**: puede usarse con la librería transformers, o convertirse a GGUF para usarse con llama.cpp u Ollama. No hay soporte nativo para vLLM sin conversión.
- **Latencia y throughput**: no aplicable, el modelo no produce salidas útiles.

## Comparativa con modelos similares
No hay modelos comparables porque este checkpoint es una inicialización aleatoria, no un modelo entrenado. En el contexto del proyecto AuriStream, la comparativa real sería contra otros modelos de voz como wav2vec 2.0 o HuBERT, pero no hay datos de rendimiento para este checkpoint.

## Limitaciones y advertencias
- **Pesos aleatorios**: el modelo no ha sido entrenado y no produce salidas útiles. Cualquier uso en producción es imposible.
- **Sesgos**: no aplica, no hay datos de entrenamiento.
- **Riesgo de alucinación**: no aplica.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial y modificación, pero el modelo no es funcional.
- **Contexto**: la longitud de contexto no está especificada en la información disponible.
- **Producción**: no debe usarse en ningún entorno de producción sin entrenamiento previo.

## Enlaces
- [HuggingFace: TuKoResearch/AuriStream100M_20Pred_BigAudioDataset_500k-randinit](https://huggingface.co/TuKoResearch/AuriStream100M_20Pred_BigAudioDataset_500k-randinit)
- [Repositorio base: AuriStream-base](https://huggingface.co/TuKoResearch/AuriStream-base)
- [Tokenizador: WavCochCausalV8192](https://huggingface.co/TuKoResearch/WavCochCausalV8192)
- [Página del proyecto AuriStream](https://tukoresearch.github.io/auristream-speech/)
