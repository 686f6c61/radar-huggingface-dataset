# Zyphra/ZAC-1-hf

## Resumen

ZAC-1 (Zyphra Audio Codec 1) es un códec neuronal de audio para voz a 44,1 kHz desarrollado por Zyphra, concebido como el componente de compresión y reconstrucción de voz de su familia de modelos ZONOS3. El modelo convierte formas de onda de voz en una representación discreta compacta de 15 Hz compuesta por 10 codebooks de 4096 entradas cada uno, y reconstruye la señal original mediante un decodificador iSTFT causal multi-resolución. Esta ficha corresponde al checkpoint del port nativo a `transformers` (identificador de arquitectura `zac`), que integra en un único modelo el codificador acústico, el profesor y la rama semántica, los cuantizadores y el decodificador.

El modelo tiene 1.524.740.946 parámetros y se distribuye en `float32` con pesos en `safetensors`, con un repositorio de 15,7 GB. Su relevancia radica en que ofrece una tasa de compresión muy alta (15 Hz frente a los 44.100 Hz de la señal original) manteniendo fidelidad de reconstrucción, lo que lo hace útil como tokenizador de audio para modelos de voz generativos, pipelines de compresión y sistemas de diálogo hablado. La primera codebook es semántica, destilada de un profesor Wav2Vec2-BERT 2.0 congelado, y las nueve restantes forman un RVQ acústico residual.

El checkpoint se publica bajo licencia Apache-2.0 y se integra con la API estándar de `transformers` (`AutoModel` y `AutoFeatureExtractor`), lo que facilita su uso en entornos de investigación y producción que ya trabajan con el ecosistema Hugging Face. Existen dos variantes de decodificador: la rama `main` con el decodificador `keep2_plain` por defecto y la rama `full_mr` con el decodificador de tamaño completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador acústico + rama semántica (destilada de Wav2Vec2-BERT 2.0) + cuantizadores RVQ + decodificador iSTFT causal multi-resolución |
| Parametros totales | 1.524.740.946 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio en lanes de 300 frames con 150 frames de contexto izquierdo para señales de más de 20 s) |
| Tipos de cuantizacion | No disponible (checkpoint publicado en float32) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los pesos `semantic_model.*` derivan de facebook/w2v-bert-2.0, MIT) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

ZAC-1 es un códec neuronal de voz, no un modelo generativo de texto. Su arquitectura se compone de un codificador acústico que produce representaciones latentes, una rama semántica destilada de las primeras 16 capas de un Wav2Vec2-BERT 2.0 congelado, y un cuantizador vectorial residual (RVQ) de 10 codebooks con 4096 entradas cada uno. La codebook 0 es semántica y las codebooks 1 a 9 son acústicas residuales. La salida discreta tiene una tasa de 15 Hz, lo que supone una compresión muy agresiva respecto a la frecuencia de muestreo original de 44,1 kHz. La reconstrucción de la forma de onda la realiza un decodificador iSTFT causal multi-resolución.

El checkpoint del port nativo a `transformers` incluye el codificador (codificador acústico, profesor semántico y rama semántica, cuantizadores) y el decodificador en un único modelo. El codificador reproduce el esquema de lanes del codificador original: el audio de más de 20 segundos se procesa en lanes de 300 frames con 150 frames de contexto izquierdo. En `float32` los códigos generados coinciden exactamente con los del codificador original. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Codificación de voz a 44,1 kHz en códigos discretos de 15 Hz con 10 codebooks de 4096 entradas.
- Decodificación de códigos discretos a forma de onda de audio mediante iSTFT causal multi-resolución.
- Representación semántica en la codebook 0, destilada de un profesor Wav2Vec2-BERT 2.0 congelado.
- Representación acústica residual en las codebooks 1 a 9 mediante RVQ.
- Procesamiento de audio largo mediante lanes de 300 frames con 150 frames de contexto izquierdo.
- Integración con la API de `transformers` (`AutoModel`, `AutoFeatureExtractor`) y con `datasets` para carga de audio.
- Dos variantes de decodificador: `keep2_plain` (rama `main`) y `full_mr` (rama `full_mr`).
- Ajuste de nivel de reproducción mediante el factor `output_gain()` (escala de -3 dB).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni multilingüismo en la información disponible.

## Casos de uso

- Tokenización de voz para modelos generativos de audio: ZAC-1 convierte audio a 44,1 kHz en secuencias discretas de 15 Hz, lo que reduce la longitud de las secuencias en más de dos órdenes de magnitud y facilita el modelado autorregresivo o de difusión sobre tokens de audio en pipelines de TTS y diálogo hablado.
- Compresión de voz de alta fidelidad: la combinación de una codebook semántica y nueve acústicas residuales permite almacenar o transmitir voz con una tasa de bits muy baja, útil en archivos de llamadas, transcripción diferida o transmisión con ancho de banda limitado.
- Preprocesamiento en sistemas de reconocimiento de voz: los códigos semánticos de la codebook 0, destilados de Wav2Vec2-BERT 2.0, pueden servir como representación intermedia para tareas posteriores de ASR o clasificación de habla.
- Integración en el ecosistema ZONOS3: al ser el códec de ZONOS3-Mini, se emplea como componente de codificación y decodificación de voz dentro de la familia de modelos de voz de Zyphra, por ejemplo en sistemas de conversación hablada de extremo a extremo.
- Investigación en códecs neuronales: la separación explícita entre rama semántica y acústica residual, junto con el decodificador iSTFT causal, permite experimentar con ablaciones de codebooks, tasas de frames y calidad de reconstrucción.
- Procesamiento por lotes de audio largo: el esquema de lanes con contexto izquierdo permite codificar grabaciones de más de 20 segundos de forma consistente, útil en pipelines de transcripción de reuniones o podcasts.
- Reproducción y verificación de códigos: al coincidir exactamente los códigos en `float32` con los del codificador original, sirve para validar implementaciones y para migrar pipelines existentes al port nativo de `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint se publica en `float32` con 1.524.740.946 parámetros, lo que supone aproximadamente 6,1 GB solo en pesos. Con overhead de activaciones y buffers de audio, se recomienda al menos 8-10 GB de VRAM para inferencia en `float32`.
- GPU recomendadas: A100, H100 o L40S para procesamiento por lotes y audio largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en `float32` de una sola secuencia.
- GPU de consumo: cabe en GPUs consumer con 8 GB o más de VRAM en `float32` para secuencias cortas; no se documentan versiones cuantizadas en la información disponible.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., device_map="auto")`, integración con `datasets` para carga de audio y `AutoFeatureExtractor` para preprocesamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de muestreo | Tasa de frames | Codebooks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ZAC-1 (Zyphra) | 1.524.740.946 | 44,1 kHz | 15 Hz | 10 x 4096 | Apache-2.0 | Hugging Face (`Zyphra/ZAC-1-hf`) |
| Wav2Vec2-BERT 2.0 (Meta) | No disponible | No disponible | No disponible | No aplica (representación continua) | MIT | Hugging Face (`facebook/w2v-bert-2.0`) |
| Codecs neuronales tipo EnCodec / SoundStream | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con Wav2Vec2-BERT 2.0 es relevante porque ZAC-1 destila su rama semántica de las primeras 16 capas de ese modelo; sin embargo, Wav2Vec2-BERT 2.0 es un modelo de representación continua, no un códec con reconstrucción de forma de onda, por lo que la comparación directa de rendimiento no es posible con los datos disponibles. No se dispone de datos de benchmarks que permitan comparar ZAC-1 con otros códecs neuronales.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo, y al ser un códec de voz entrenado sobre datos no documentados, puede heredar sesgos acústicos y lingüísticos de ese corpus.
- Al ser un códec con reconstrucción, no genera contenido nuevo, pero la decodificación puede introducir artefactos o pérdida de fidelidad en señales fuera de la distribución de entrenamiento.
- La longitud de contexto y los idiomas soportados no están documentados; el procesamiento de audio de más de 20 segundos depende del esquema de lanes con contexto izquierdo, que puede afectar a la coherencia en los límites entre lanes.
- El checkpoint se publica únicamente en `float32`; no se documentan versiones cuantizadas, lo que limita el despliegue en hardware con poca VRAM.
- La licencia Apache-2.0 permite uso comercial, pero los pesos `semantic_model.*` derivan de `facebook/w2v-bert-2.0` bajo licencia MIT, cuyos términos deben respetarse en la redistribución.
- No se documentan capacidades de tool calling, agentes ni multilingüismo, por lo que no debe asumirse su uso para tareas generativas de texto.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y con poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyphra/ZAC-1-hf
- Modelo original ZAC-1: https://huggingface.co/Zyphra/ZAC-1
- ZONOS3-Mini (transformers): https://huggingface.co/Zyphra/ZONOS3-Mini-transformers
- Wav2Vec2-BERT 2.0 (profesor semántico): https://huggingface.co/facebook/w2v-bert-2.0
- Informe técnico ZONOS3-Mini (arXiv:2611.16525): https://arxiv.org/abs/2611.16525
