# suliniacats/Audio8-TTS-Preview-0.1b

## Resumen

Audio8 TTS Preview 0.1B es un modelo de síntesis de voz (text-to-speech) con capacidades de clonación de voz zero-shot, desarrollado por Audio8. Su principal característica es su tamaño compacto: aproximadamente 170 millones de parámetros en el modelo generativo principal, más un codec decoder de unos 120 millones de parámetros. El objetivo es ofrecer una alternativa ligera a los sistemas TTS multilingües modernos, que suelen superar los mil millones de parámetros, haciendo la clonación de voz y la generación de voz práctica en entornos con recursos limitados.

El modelo utiliza una arquitectura propietaria denominada Audio8 Falcon H1, con dos ramas autoregresivas: una rama lenta que predice tokens semánticos y una rama rápida que predice los codebooks del codec de audio. Soporta ocho idiomas, con chino e inglés como idiomas principales y seis idiomas adicionales en estado experimental. El checkpoint v4 incluye el codec, tokenizador, procesador y el código remoto de HuggingFace, por lo que no requiere componentes externos.

La relevancia actual del modelo radica en su tamaño reducido (0.1B) frente a alternativas como CosyVoice3 (~1.5B) o Fish S2 Pro (~4.6B), lo que permite ejecutar TTS con clonación de voz en GPUs de consumo sin sacrificar demasiada calidad. Aunque los resultados en idiomas experimentales son peores que los de modelos más grandes, en chino e inglés el rendimiento es competitivo para su escala. El modelo se distribuye bajo la licencia Audio8 Community License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1 (dos ramas autoregresivas: slow y fast) |
| Parametros totales | 169.779.904 (modelo principal) + ~120M (codec decoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 posiciones de texto/audio empaquetadas |
| Tipos de cuantizacion | No disponible (se usa bfloat16 en GPU, float32 en CPU) |
| Idiomas soportados | zh, en (principales); de, es, fr, it, ja, ko (experimental) |
| Licencia | audio8-community-license-v1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura Audio8 Falcon H1 emplea dos ramas autoregresivas. La rama lenta ("slow AR") tiene 24 capas con ancho 512, 8 cabezas de atención y 2 cabezas KV, y predice tokens semánticos. La rama rápida ("fast AR") tiene 4 capas con las mismas dimensiones, y predice los codebooks del codec condicionada al estado oculto de la rama lenta. El codec opera a 44,1 kHz con 2.048 muestras por frame (aproximadamente 21,5 frames por segundo) y utiliza 10 codebooks con 4.096 entradas cada uno.

El entrenamiento no se detalla en la información disponible, pero el repositorio de GitHub incluye un pipeline de fine-tuning supervisado (SFT) independiente. La model card no especifica el número de tokens de entrenamiento ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. La innovación principal del modelo es la combinación de una arquitectura de doble rama autoregresiva con un codec de 10 codebooks en un paquete de solo 170M parámetros, lo que reduce significativamente el coste de inferencia frente a sistemas comparables.

## Capacidades

- Generación de voz multilingüe: sintetiza voz en chino, inglés, alemán, español, francés, italiano, japonés y coreano, con mejor calidad en chino e inglés.
- Clonación de voz zero-shot: puede imitar la voz de un hablante a partir de un audio de referencia y su transcripción, sin necesidad de fine-tuning adicional.
- Síntesis sin clonación: permite generar voz con una voz por defecto si no se proporciona referencia.
- Decodificación de audio integrada: incluye el codec decoder en el repositorio, por lo que no requiere checkpoints externos.
- Inferencia con Transformers: compatible con la librería transformers mediante `trust_remote_code=True`, lo que facilita su integración en pipelines existentes.
- Soporte de batch inference: el repositorio de entrenamiento permite procesar múltiples muestras simultáneamente.
- No tiene capacidades de visión ni de razonamiento multimodal; es exclusivamente TTS.

## Casos de uso

- Audiolibros y narración: el modelo puede generar narración de voz natural en varios idiomas a partir de texto, con clonación de voz para mantener una voz consistente a lo largo de la narración. Su tamaño compacto permite ejecutarlo en servidores modestos.
- Asistentes virtuales y voz de productos: integrar en aplicaciones de atención al cliente para generar respuestas de voz personalizadas con la voz de la marca, utilizando la clonación zero-shot para mantener una identidad de voz única.
- Doblaje de vídeo y multimedia: clonar la voz de actores de doblaje para generar diálogos en diferentes idiomas, reduciendo el coste de grabación y permitiendo localización rápida de contenido.
- Accesibilidad: sistemas de lectura de pantalla para personas con discapacidad visual, generando voz a partir de texto en múltiples idiomas con un modelo ligero que puede ejecutarse en hardware de gama media.
- Prototipado rápido de productos de voz: startups y equipos de producto pueden integrar TTS de alta calidad sin necesidad de GPUs de alto coste, gracias a la baja huella de memoria del modelo.
- Generación de contenido educativo: producción de materiales de aprendizaje en formato de audio en varios idiomas, utilizando clonación de voz para mantener coherencia entre lecciones.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación en el conjunto de datos CV3 (Common Voice 3) en términos de WER/CER (error rate) y SIM (similaridad). La tabla siguiente muestra los valores publicados por el autor, que son comparaciones de referencia y no una re-evaluación estrictamente controlada. Valores más bajos de WER/CER indican mejor calidad de pronunciación; valores más altos de SIM indican mejor similitud de voz.

| Modelo | Parámetros | zh | en | ja | ko | de | es | fr | it |
|---|---|---|---|---|---|---|---|---|---|
| **Audio8 TTS Preview 0.1B** | ~0.17B | 3.619 | 3.307 | 12.322 | 7.653 | 5.292 | 8.548 | 12.349 | 14.480 |
| Audio8 TTS Preview 0.6B | 0.6B | **3.205** | **3.128** | 7.205 | 4.223 | 3.447 | 3.641 | 8.790 | 4.790 |
| Fish S2 Pro | 4.6B | 3.600 | 3.493 | 5.139 | **4.111** | 3.605 | 2.972 | **8.600** | 4.229 |
| Higgs Audio v2 | 4.7B | 3.378 | 3.404 | **4.742** | 4.260 | **3.300** | **2.929** | 9.425 | **3.555** |
| CosyVoice3-1.5B | 1.5B | 3.91 | 4.99 | 7.57 | - | - | - | - | - |

Los datos de SIM no se han publicado en la información disponible. El modelo 0.1B muestra tasas de error más altas en idiomas experimentales (especialmente japonés, francés e italiano) comparado con modelos más grandes, pero en chino e inglés se acerca a modelos de mayor escala.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo principal tiene ~170M parámetros, lo que en bfloat16 ocupa aproximadamente 340 MB; el codec decoder (~120M) añade ~240 MB. En total, se estima que el modelo completo necesita entre 1 y 2 GB de VRAM en bfloat16, y más en float32.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM (por ejemplo, GTX 1060 6GB, RTX 2060, RTX 3050, RTX 4060). Para batch grande o baja latencia, se recomienda una RTX 3090 o A100.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer modernas.
- Opciones de despliegue: el modelo se puede ejecutar con transformers (inferencia directa), y se puede servir mediante vLLM o TGI si se adapta al formato, aunque no hay soporte oficial documentado. También se puede usar con llama.cpp si se convierte a GGUF, pero no está confirmado.
- Latencia y throughput: no se han publicado datos oficiales. Como referencia, un modelo de 170M con doble rama autoregressive en una RTX 4090 debería generar audio en tiempo real o superior, pero no hay números verificables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Audio8 TTS Preview 0.1B** | ~0.17B | 2.048 tokens | 8 (2 principales) | Audio8 Community License | HuggingFace |
| Audio8 TTS Preview 0.6B | ~0.6B | No disponible | 8 | Audio8 Community License | HuggingFace |
| CosyVoice3 | ~1.5B | No disponible | Multilingüe | No disponible | No disponible |
| Fish S2 Pro | ~4.6B | No disponible | Multilingüe | No disponible | No disponible |
| Higgs Audio v2 | ~4.7B | No disponible | Multilingüe | No disponible | No disponible |

La comparativa muestra que el modelo 0.1B es el más pequeño de su categoría, con una ventaja clara en eficiencia de recursos. Sin embargo, los modelos de mayor tamaño ofrecen mejor rendimiento en idiomas experimentales. La licencia Audio8 Community License puede tener restricciones comerciales; consultar el texto completo en el enlace.

## Limitaciones y advertencias

- La calidad de voz en idiomas experimentales (de, es, fr, it, ja, ko) es significativamente inferior a la de chino e inglés, con tasas de error WER que duplican o triplican las de los idiomas principales.
- El modelo puede presentar alucinaciones o errores de pronunciación en nombres propios o términos técnicos, especialmente en idiomas no prioritarios.
- La clonación de voz requiere una referencia de audio de alta calidad y su transcripción exacta; si la transcripción no coincide con el audio, la calidad de la clonación se degrada.
- La licencia Audio8 Community License v1.0 no es una licencia de código abierto estándar; puede incluir restricciones de uso comercial o de redistribución. Es necesario revisar el texto completo antes de usar en producción.
- No se ha publicado información sobre sesgos demográficos o éticos del modelo.
- El contexto de 2.048 tokens limita la duración máxima del texto de entrada; para textos largos se requiere segmentación.
- No se especifica el rendimiento en términos de latencia o throughput, por lo que se recomienda realizar pruebas propias antes de desplegar en entornos de producción.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/suliniacats/Audio8-TTS-Preview-0.1b
- HuggingFace (organización Audio8): https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- GitHub del repositorio: https://github.com/Audio8-AI/Audio8_TTS
- Demo de audio del modelo: https://audio8-ai.github.io/Audio8_TTS/0.1B/
- Licencia: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b/blob/main/LICENSE
- Artículo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/audio8-tts-preview-0.1b-audio8
