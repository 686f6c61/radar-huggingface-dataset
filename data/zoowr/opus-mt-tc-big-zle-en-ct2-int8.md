# Zoowr/opus-mt-tc-big-zle-en-ct2-int8

## Resumen

`Zoowr/opus-mt-tc-big-zle-en-ct2-int8` es una conversion al formato CTranslate2 con cuantizacion int8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-tc-big-zle-en`, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce desde las lenguas eslavas orientales (bielorruso, ruso y ucraniano) hacia el ingles, y esta pensado para ejecutarse en CPU sin necesidad de GPU.

La relevancia de esta ficha concreta es que no se trata de un modelo nuevo, sino de un artefacto de despliegue: el autor, Zoowr, lo genero para integrarlo en "Voice Tool", una aplicacion local de reconocimiento de voz para Windows que descarga los pesos, verifica su SHA-256 y traduce en CPU el habla reconocida en ruso. El repositorio ocupa 0,2 GB y el binario principal `model.bin` pesa 242.053.603 bytes, lo que lo hace viable en equipos de consumo sin acelerador.

Arquitectonicamente hereda el diseno Marian NMT del modelo original (transformer encoder-decoder), con tokenizacion SentencePiece y un vocabulario compartido. La unica intervencion respecto al original es la conversion de formato y la cuantizacion int8, que puede alterar ligeramente algunas traducciones. La licencia es CC BY 4.0, la misma que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT, heredada del modelo base) |
| Parametros totales | no disponible (el binario int8 ocupa 242.053.603 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (recomendacion del autor: dividir el texto largo en frases) |
| Tipos de cuantizacion | int8 (unica variante publicada en este repositorio) |
| Idiomas soportados | be (bielorruso), ru (ruso), uk (ucraniano) como origen; en (ingles) como destino |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (`model.bin`), tokenizadores SentencePiece (`source.spm`, `target.spm`), `vocab.json`, `shared_vocabulary.json`, `config.json` |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-tc-big-zle-en` pertenece a la familia OPUS-MT, basada en la arquitectura Marian NMT: un transformer encoder-decoder entrenado para traduccion neuronal con atencion completa. La variante "big" del nombre indica un tamano superior dentro de la familia OPUS-MT. La tokenizacion emplea SentencePiece con vocabulario compartido entre origen y destino, y el modelo se distribuye con ficheros `source.spm` y `target.spm` separados.

Esta copia concreta no reentrena ni modifica los pesos mas alla de la conversion de formato y la cuantizacion int8, realizada con `CTranslate2 4.8.5` mediante `ct2-transformers-converter --quantization int8 --low_cpu_mem_usage`. Los ficheros de tokenizacion se copian sin cambios desde el repositorio original (revision `09a40f722d6d8b76aaad6fe51a06c914622a13d1`), y el autor indica que todos los ficheros fuente se verificaron contra los SHA-256 publicados por Hugging Face antes de la conversion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo original y no se detallan en la model card de esta conversion.

## Capacidades

- Traduccion automatica de texto de bielorruso, ruso y ucraniano a ingles.
- Ejecucion en CPU con cuantizacion int8, sin requerir GPU.
- Decodificacion por haz (beam search), con `beam_size=4` en el ejemplo de uso del autor.
- Tokenizacion SentencePiece con vocabulario compartido y sustitucion de piezas fuera de `vocab.json` por `<unk>`.
- Integracion sencilla en aplicaciones de escritorio mediante la libreria `ctranslate2` de Python.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es un modelo de traduccion puro.
- Capacidad multilingue limitada a las cuatro lenguas indicadas (tres de origen, una de destino).

## Casos de uso

- Traduccion local de dictado por voz en Windows: la aplicacion "Voice Tool" descarga estos ficheros, verifica su SHA-256 y traduce en CPU el habla reconocida en ruso, lo que encaja con el tamano reducido del binario y la ausencia de dependencia de GPU.
- Traduccion de correspondencia y correos en ruso o ucraniano a ingles en entornos de oficina sin acelerador: el ejemplo de la model card traduce "Добрый день, отвечаю на Ваше письмо." con `beam_size=4` en CPU.
- Preprocesado de textos eslavos para pipelines de analisis: convertir articulos, informes o documentacion de ru/uk/be a ingles antes de pasarlos a un modelo de resumen o clasificacion.
- Traduccion por lotes de subtitulos o transcripciones: al ser un modelo pequeno en int8, permite procesar muchos segmentos cortos de forma secuencial en un portatil.
- Prototipado y evaluacion de sistemas de traduccion en entornos con recursos limitados: sirve como linea base cuantizada frente al modelo original en PyTorch.
- Despliegue en aplicaciones de escritorio o embebidas que no pueden asumir el peso de un runtime de PyTorch, gracias al formato binario de CTranslate2 y a la ausencia de ficheros pickle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica para el uso previsto; el modelo esta pensado para CPU con `compute_type="int8"`.
- RAM estimada: el binario de pesos ocupa 242.053.603 bytes (unos 231 MiB) y el repositorio completo 0,2 GB, por lo que cabe holgadamente en cualquier equipo moderno.
- GPU recomendadas: no se indica ninguna; el autor lo orienta explicitamente a CPU. No hay datos de despliegue en A100, H100 o RTX 4090.
- GPU de consumo: no se proporcionan datos de compatibilidad ni de rendimiento en GPU consumer.
- Opciones de despliegue: CTranslate2 (libreria `ctranslate2`), con el flujo `ct2-transformers-converter` para generar el formato. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se publican medidas.

## Comparativa con modelos similares

| Modelo | Idiomas | Formato | Cuantizacion | Licencia | Contexto |
|---|---|---|---|---|---|
| Zoowr/opus-mt-tc-big-zle-en-ct2-int8 | be, ru, uk → en | CTranslate2 | int8 | CC BY 4.0 | no disponible |
| Helsinki-NLP/opus-mt-tc-big-zle-en (modelo base) | be, ru, uk → en | PyTorch/safetensors (original) | sin cuantizar | CC BY 4.0 | no disponible |
| Otros modelos OPUS-MT de la familia tc-big | pares de lenguas variables | PyTorch | sin cuantizar | CC BY 4.0 | no disponible |

La comparativa se limita al modelo base y a la familia OPUS-MT porque la informacion proporcionada no incluye datos de rendimiento ni de otros sistemas de traduccion alternativos (por ejemplo, NLLB o modelos comerciales) que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- La cuantizacion int8 puede cambiar ligeramente algunas traducciones respecto al modelo original; el propio autor lo advierte.
- Indicacion explicita del autor: dividir el texto largo en frases antes de traducir, porque con varias frases en una misma entrada algunas pueden descartarse.
- Las piezas que no estan en `vocab.json` deben sustituirse por `<unk>`, como hace `MarianTokenizer`; de lo contrario la decodificacion puede fallar.
- Es un modelo de traduccion unidireccional (eslavo oriental a ingles); no traduce al ruso, ucraniano o bielorruso.
- Riesgo de alucinacion y errores de traduccion: el autor indica que la traduccion automatica puede equivocarse y que deben revisarse los textos importantes.
- No se documentan sesgos especificos en la informacion disponible.
- Licencia CC BY 4.0: permite uso comercial con atribucion a los autores originales (Helsinki-NLP, proyecto OPUS-MT); el autor de la conversion pide que el credito del modelo pertenece a ellos.
- Se distribuye "as is", sin garantias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Zoowr/opus-mt-tc-big-zle-en-ct2-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-en
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Articulo OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61
- Articulo Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139
- Organizacion Helsinki-NLP: https://huggingface.co/Helsinki-NLP
