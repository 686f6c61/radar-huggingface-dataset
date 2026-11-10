# urtzai/faster-whisper-small-eu-cv22.0-int8

## Resumen

`urtzai/faster-whisper-small-eu-cv22.0-int8` es un modelo de reconocimiento automatico del habla (ASR) para euskara, distribuido en formato CTranslate2 con cuantizacion int8. No es un modelo entrenado desde cero: se trata de una conversion de formato y cuantizacion del fine-tune `zuazo/whisper-small-eu-cv22.0`, obra de Xabier de Zuazo, que a su vez parte de `openai/whisper-small` ajustado sobre el corpus Common Voice 22.0 en euskara.

El modelo resuelve el problema de desplegar ASR en euskara sobre infraestructura modesta. Al estar en formato CTranslate2 int8, puede ejecutarse en CPU sin GPU, lo que lo hace adecuado para asistentes de voz locales como Home Assistant o aplicaciones de transcripcion en dispositivos de bajos recursos. El repositorio ocupa aproximadamente 0,2 GB y los pesos pesan unos 248 MB en int8.

Su relevancia actual radica en que el euskara es un idioma con poca cobertura en los modelos ASR multilingues genericos, y este modelo ofrece una alternativa ligera, con licencia MIT y ejecutable en local, sin dependencia de servicios en la nube. La arquitectura subyacente es la de Whisper small (transformer encoder-decoder), con una longitud de contexto de audio de 30 segundos por ventana, caracteristica estandar de la familia Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small), convertido a CTranslate2 |
| Parametros totales | no disponible (el modelo base es whisper-small; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio estandar de Whisper: 30 s por segmento) |
| Tipos de cuantizacion | int8 (unica variante publicada en este repo) |
| Idiomas soportados | euskara (eu) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | CTranslate2 (model.bin, config.json, tokenizer.json, preprocessor_config.json, generation_config.json) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper small: un transformer encoder-decoder con atencion estandar, disenado para transcripcion de audio en ventanas de 30 segundos. El proceso de creacion de este repositorio concreto es exclusivamente una conversion de formato y cuantizacion, sin reentrenamiento. El autor documenta el comando exacto empleado: `ct2-transformers-converter` con `--quantization int8` sobre `zuazo/whisper-small-eu-cv22.0`, copiando `tokenizer.json`, `preprocessor_config.json` y `generation_config.json`.

El fine-tune original de Zuazo se realizo sobre el corpus Common Voice 22.0 en euskara. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable de este repositorio es la propia conversion a CTranslate2 int8, que reduce el peso a unos 248 MB y permite inferencia en CPU, con un rendimiento notablemente superior en CPUs con soporte AVX2.

## Capacidades

- Reconocimiento automatico del habla en euskara (transcripcion de audio a texto).
- Deteccion de idioma integrada, aunque el autor recomienda fijar `language="eu"` explicitamente porque la deteccion automatica es mucho mas lenta.
- Decodificacion con beam search (el ejemplo de uso emplea `beam_size=5`).
- Ejecucion en CPU con cuantizacion int8, sin necesidad de GPU.
- Integracion directa con `faster-whisper` y con la aplicacion Whisper de Home Assistant.
- No se documentan capacidades de traduccion, tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Asistente de voz local en Home Assistant: el modelo se configura como `custom_model` en la app Whisper y se fija el idioma de la pipeline de Assist a `eu`, permitiendo comandos de voz en euskara sin enviar audio a la nube.
- Transcripcion de reuniones y notas de voz en euskara: al ejecutarse en CPU, puede desplegarse en un portatil o servidor modesto para transcribir grabaciones por lotes.
- Subtitulado de contenido audiovisual en euskara: la salida por segmentos con marcas temporales de faster-whisper facilita la generacion de subtitulos sincronizados.
- Accesibilidad para personas con dificultades de escritura: dictado de texto en euskara en aplicaciones de escritorio o moviles con backend CPU.
- Procesamiento de corpus orales para investigacion linguistica: transcripcion masiva de grabaciones en euskara con un modelo ligero y de licencia permisiva.
- Prototipado rapido de aplicaciones de voz: al pesar unos 248 MB y funcionar en int8 sobre CPU, permite iterar en entornos sin GPU dedicada.
- Indexacion y busqueda de audio: transcripcion previa de archivos de audio para hacerlos buscables por texto en euskara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente afirma una relacion velocidad/precision buena, con una velocidad aproximadamente 5 veces superior a la variante turbo y una calidad similar en comandos cortos, pero no aporta cifras de WER, MMLU ni metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU int8; en GPU, el modelo es muy pequeno (248 MB de pesos), por lo que cabria en cualquier GPU con al menos 1-2 GB de memoria libre.
- GPU recomendadas: no se especifican; el modelo esta pensado para CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) podria ejecutarlo con holgura.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual, aunque el caso de uso principal es CPU.
- CPUs: funciona en CPU sin requisitos especiales; el autor indica que es mucho mas rapido en CPUs con AVX2.
- Opciones de despliegiegue: `faster-whisper` (libreria CTranslate2), aplicacion Whisper de Home Assistant. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles como cifras concretas; el autor solo menciona la mejora relativa de velocidad frente a la variante turbo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| urtzai/faster-whisper-small-eu-cv22.0-int8 | whisper-small (recuento no disponible) | 30 s por segmento (estandar Whisper) | eu | MIT | CTranslate2 int8 |
| zuazo/whisper-small-eu-cv22.0 | whisper-small (recuento no disponible) | 30 s por segmento (estandar Whisper) | eu | no disponible en la informacion | Transformers (safetensors, presumiblemente) |
| openai/whisper-small | whisper-small (recuento no disponible) | 30 s por segmento | multilingue | MIT | Transformers / otros |
| openai/whisper-large-v3-turbo | no disponible | 30 s por segmento | multilingue | MIT | Transformers / CTranslate2 |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks ni de otros modelos ASR especificos para euskara en la informacion proporcionada. La ventaja de este repositorio frente al fine-tune original es el menor tamano y la ejecucion en CPU; frente a whisper-small generico, la especializacion en euskara.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en euskara; no debe esperarse buen rendimiento en otros idiomas.
- Al ser una conversion de formato sin reentrenamiento, hereda todas las limitaciones del fine-tune original y de whisper-small.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, acentos marcados o vocabulario tecnico, comportamiento tipico de los modelos Whisper de tamano pequeno.
- La deteccion automatica de idioma es lenta; el autor recomienda fijar `language="eu"`.
- Solo se publica la cuantizacion int8; no hay variantes float16 ni int8_float16 en este repositorio.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar las condiciones del corpus Common Voice y del modelo base original.
- Sin datos publicados de WER ni benchmarks, por lo que la calidad real en produccion debe validarse con un conjunto de evaluacion propio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/urtzai/faster-whisper-small-eu-cv22.0-int8
- Modelo base (fine-tune en euskara): https://huggingface.co/zuazo/whisper-small-eu-cv22.0
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-small
- Libreria faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Dataset Common Voice 22.0: https://commonvoice.mozilla.org/datasets
