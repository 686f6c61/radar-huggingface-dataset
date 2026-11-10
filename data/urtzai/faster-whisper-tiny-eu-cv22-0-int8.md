# urtzai/faster-whisper-tiny-eu-cv22.0-int8

## Resumen

`faster-whisper-tiny-eu-cv22.0-int8` es una conversión de formato y cuantización del modelo de reconocimiento automático del habla (ASR) `zuazo/whisper-tiny-eu-cv22.0`, un fine-tune de `openai/whisper-tiny` especializado en euskera (código de idioma `eu`). El autor de la conversión es el usuario de Hugging Face `urtzai`, mientras que el fine-tune original fue desarrollado por Xabier de Zuazo. El modelo se distribuye en formato CTranslate2 con cuantización int8, lo que lo hace directamente compatible con la librería `faster-whisper` y con la integración Whisper de Home Assistant.

La relevancia de esta ficha radica en su carácter práctico: no se trata de un modelo nuevo entrenado desde cero, sino de un artefacto optimizado para inferencia en CPU con un tamaño de apenas 41 MB en int8. Esto lo convierte en una opción viable para despliegues de bajo coste, asistentes de voz domésticos y entornos embebidos donde el euskera es el idioma de interacción. La arquitectura subyacente es la de Whisper tiny (transformer encoder-decoder), con aproximadamente 39 millones de parámetros en su versión original.

El modelo se entrenó sobre el corpus Common Voice 22.0 en euskera y hereda la licencia MIT del modelo base. Su principal limitación es la propia del tamaño "tiny": precisión reducida en palabras compuestas y en condiciones acústicas adversas, tal como advierte el autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | ~39 M (heredados de whisper-tiny; no se especifica en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | Euskera (`eu`) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (modelo convertido con `ct2-transformers-converter`) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del fine-tune `zuazo/whisper-tiny-eu-cv22.0`, que a su vez parte de `openai/whisper-tiny`. La arquitectura es la de Whisper: un transformer encoder-decoder con atención multi-cabeza, diseñado para transcripción de audio de hasta 30 segundos por segmento. No se ha realizado reentrenamiento alguno en esta conversión; el autor lo indica explícitamente: "This is a format/quantization conversion only (no retraining)".

El fine-tune original se entrenó sobre el corpus Common Voice 22.0 en euskera. No se dispone en la información proporcionada de detalles sobre el número de tokens de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos ASR). La conversión se realizó con el comando `ct2-transformers-converter` aplicando cuantización int8 y copiando los ficheros `tokenizer.json`, `preprocessor_config.json` y `generation_config.json`.

## Capacidades

- Reconocimiento automático del habla (ASR) en euskera, con transcripción de audio a texto.
- Detección de idioma integrada (aunque el autor recomienda fijar `language="eu"` para evitar la penalización de velocidad de la detección automática).
- Compatibilidad con `faster-whisper` mediante `WhisperModel` y `compute_type="int8"`.
- Integración directa con la app Whisper de Home Assistant como modelo personalizado.
- Ejecución en CPU sin GPU, con aceleración en procesadores con AVX2.
- No soporta tool calling, function calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Asistente de voz doméstico en euskera con Home Assistant: el modelo se configura como `custom_model` en la app Whisper y se fija el pipeline de Assist a `eu`, permitiendo comandos de voz locales sin depender de la nube.
- Transcripción de notas de voz en euskera en aplicaciones móviles o de escritorio: al ocupar 41 MB en int8 y ejecutarse en CPU, puede embeberse en aplicaciones ligeras sin GPU.
- Subtitulado automático de contenido audiovisual en euskera para archivos de hasta 30 segundos por segmento, con la ventaja de que `faster-whisper` gestiona la segmentación internamente.
- Procesamiento por lotes de grabaciones en euskera en servidores sin GPU: la cuantización int8 reduce el coste computacional y permite throughput aceptable en CPU con AVX2.
- Prototipado rápido de pipelines ASR en euskera: al ser un modelo tiny, sirve para validar la integración con `faster-whisper` antes de escalar a modelos mayores.
- Investigación en ASR de bajos recursos: útil como línea base para comparar fine-tunes en euskera sobre Common Voice 22.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso típico; el modelo está pensado para CPU con `compute_type="int8"`. En GPU, el consumo sería mínimo (por debajo de 1 GB), aunque no se especifica.
- GPU recomendadas: no se indican en la model card; cualquier GPU compatible con CTranslate2 podría ejecutarlo, pero el diseño apunta a CPU.
- Cabe en cualquier GPU consumer e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: `faster-whisper` (Python), app Whisper de Home Assistant. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR).
- Latencia y throughput estimados: no disponibles. El autor indica que en CPU con AVX2 es "mucho más rápido" que sin AVX2, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `urtzai/faster-whisper-tiny-eu-cv22.0-int8` | ~39 M (tiny) | no disponible (30 s audio) | eu | MIT | CTranslate2 int8 |
| `zuazo/whisper-tiny-eu-cv22.0` | ~39 M (tiny) | no disponible (30 s audio) | eu | MIT | Transformers |
| `openai/whisper-tiny` | ~39 M | no disponible (30 s audio) | multilingüe | MIT | Transformers |
| `openai/whisper-small` | ~244 M | no disponible (30 s audio) | multilingüe | MIT | Transformers |

La comparativa se limita a variantes del mismo linaje, ya que no se dispone de datos de rendimiento (WER) para establecer comparaciones cuantitativas con alternativas. La diferencia principal frente a `zuazo/whisper-tiny-eu-cv22.0` es el formato (CTranslate2 int8 frente a Transformers) y el tamaño reducido (41 MB frente al peso original en fp32). Frente a `whisper-small`, este modelo es sustancialmente más ligero pero con menor precisión esperada, especialmente en palabras compuestas del euskera.

## Limitaciones y advertencias

- Precisión reducida en palabras compuestas del euskera, tal como advierte el autor ("zehaztasun txikiagoa hitz konposatuetan").
- Al ser un modelo tiny, la calidad de transcripción es inferior a la de modelos small, medium o large de Whisper.
- La detección automática de idioma (`auto`) es mucho más lenta que fijar `language="eu"`; se recomienda fijar el idioma.
- El rendimiento depende de las instrucciones AVX2 del procesador; sin ellas, la inferencia en CPU es notablemente más lenta.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido o silencios largos.
- Licencia MIT heredada del modelo base, lo que permite uso comercial, pero se recomienda verificar la licencia del fine-tune original y del corpus Common Voice 22.0 para usos concretos.
- No se han publicado métricas de WER ni benchmarks en la información disponible, por lo que la evaluación de calidad en producción debe realizarse de forma empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/urtzai/faster-whisper-tiny-eu-cv22.0-int8
- Modelo base (fine-tune en euskera): https://huggingface.co/zuazo/whisper-tiny-eu-cv22.0
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-tiny
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Dataset Common Voice 22.0: https://commonvoice.mozilla.org/datasets
