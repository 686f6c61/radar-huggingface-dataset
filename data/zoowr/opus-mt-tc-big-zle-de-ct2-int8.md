# Zoowr/opus-mt-tc-big-zle-de-ct2-int8

## Resumen

`Zoowr/opus-mt-tc-big-zle-de-ct2-int8` es una conversion al formato CTranslate2 con cuantizacion int8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-tc-big-zle-de`, desarrollado originalmente por el grupo Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce de lenguas eslavas orientales (bielorruso, ruso y ucraniano) al aleman, y esta pensado para ejecutarse en CPU sin necesidad de GPU.

La relevancia de esta ficha no reside en el modelo original, sino en el artefacto empaquetado: un binario `model.bin` de aproximadamente 242 MB en formato CTranslate2 con pesos cuantizados a int8, acompanado de los tokenizadores SentencePiece originales sin modificar. El autor, Zoowr, lo publica como dependencia interna de "Voice Tool", una aplicacion local de reconocimiento de voz para Windows que transcribe habla rusa y la traduce al aleman en el propio dispositivo.

Se trata, por tanto, de un modelo de nicho, con cero descargas y cero likes en el momento de redactar esta ficha, cuyo interes practico es servir como ejemplo de despliegue eficiente de traduccion neuronal en entornos de escritorio sin aceleracion por hardware. La licencia CC BY 4.0 del modelo original se mantiene intacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT), segun el modelo base Helsinki-NLP/opus-mt-tc-big-zle-de |
| Parametros totales | no disponible (el binario int8 ocupa 242.207.073 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base es de traduccion por frases; se recomienda segmentar en oraciones) |
| Tipos de cuantizacion | int8 (unico disponible en este repositorio) |
| Idiomas soportados | be (bielorruso), ru (ruso), uk (ucraniano) como origen; de (aleman) como destino |
| Licencia | CC BY 4.0 (Creative Commons Attribution 4.0 International) |
| Formato de pesos | CTranslate2 (`model.bin`), tokenizadores SentencePiece (`source.spm`, `target.spm`), `shared_vocabulary.json`, `vocab.json` |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia OPUS-MT, basada en la arquitectura Marian NMT: un transformer encoder-decoder con atencion multi-cabeza, entrenado sobre corpus paralelos del ecosistema OPUS. La variante `tc-big` corresponde a la version de mayor capacidad de la familia, y el sufijo `zle-de` indica el par linguistico eslavo oriental (zle) hacia aleman. No se dispone en la informacion proporcionada de datos sobre numero de tokens de entrenamiento, composicion exacta del corpus ni si hubo etapas de fine-tuning con RLHF o DPO; estos detalles deben consultarse en la model card del modelo original.

La contribucion de este repositorio es exclusivamente de ingenieria de despliegue: conversion de formato mediante `ct2-transformers-converter` (CTranslate2 4.8.5) con `--quantization int8 --low_cpu_mem_usage`. Los ficheros de tokenizacion (`source.spm`, `target.spm`, `vocab.json`) se copian sin cambios desde el repositorio original, y no hay ficheros pickle de PyTorch, lo que reduce la superficie de ataque al cargar el modelo. La cuantizacion int8 puede alterar ligeramente algunas traducciones respecto al modelo en punto flotante.

## Capacidades

- Traduccion automatica de texto de bielorruso, ruso y ucraniano a aleman.
- Ejecucion en CPU con cuantizacion int8, sin requerir GPU.
- Decodificacion por haz configurable (`beam_size`, por ejemplo 4 en el ejemplo de uso).
- Integracion con SentencePiece para tokenizacion de origen y destino.
- Uso offline y local, adecuado para aplicaciones de escritorio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo "thinking", vision ni audio de forma nativa.
- Capacidades multilingues limitadas estrictamente al par eslavo oriental-aleman indicado.

## Casos de uso

- Subtitulado y traduccion de reuniones en tiempo real: integrado en una aplicacion de escritorio que captura audio, transcribe con un modelo STT local y traduce las frases rusas al aleman con baja latencia al ejecutarse en CPU.
- Traduccion de correspondencia comercial: el ejemplo de la model card ("Добрый день, отвечаю на Ваше письмо") ilustra el uso tipico para correos y mensajes de empresa entre socios rusoparlantes y alemanes.
- Procesamiento por lotes de documentacion interna: traduccion de manuales, actas o notas de soporte almacenadas en ruso o ucraniano hacia aleman, segmentando previamente por oraciones para evitar perdidas de contenido.
- Aplicaciones de escritorio offline: al no requerir GPU ni conexion, encaja en herramientas para entornos con requisitos de privacidad o sin acceso a Internet.
- Prototipado de pipelines de traduccion: sirve como baseline ligero para comparar calidad frente a modelos neuronales de mayor tamano en tareas de eslavo oriental a aleman.
- Investigacion sobre cuantizacion: permite medir el impacto de int8 en calidad de traduccion frente al modelo original en punto flotante, dado que el autor documenta los SHA-256 de todos los ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, chrF ni comparaciones cuantitativas con otros sistemas; solo advierte de que la cuantizacion int8 puede cambiar ligeramente algunas traducciones.

## Requisitos de hardware

- VRAM: no aplica en el modo previsto; el modelo esta disenado para CPU. El binario int8 ocupa aproximadamente 242 MB en disco.
- Memoria RAM estimada: no disponible de forma exacta; el uso de `--low_cpu_mem_usage` en la conversion sugiere que el modelo esta pensado para equipos con memoria limitada.
- GPU recomendadas: no disponibles ni necesarias; CTranslate2 puede usar GPU, pero esta publicacion esta orientada a `device="cpu"` con `compute_type="int8"`.
- Compatibilidad con GPU de consumo: no se documenta; el caso de uso declarado es CPU.
- Opciones de despliegue: CTranslate2 (libreria `ctranslate2` de Python), con tokenizacion mediante `sentencepiece`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Zoowr/opus-mt-tc-big-zle-de-ct2-int8 | no disponible (242 MB int8) | no disponible | be, ru, uk → de | CC BY 4.0 | CTranslate2 int8 |
| Helsinki-NLP/opus-mt-tc-big-zle-de | no disponible | no disponible | be, ru, uk → de | CC BY 4.0 | PyTorch/safetensors (modelo base) |
| Helsinki-NLP/opus-mt-ru-de | no disponible | no disponible | ru → de | CC BY 4.0 | PyTorch/safetensors |
| NLLB-200 (variantes multilingues) | hasta 54.500 millones (3.3B en variante destilada) | 512 tokens | 200 idiomas | CC BY-NC 4.0 (no comercial en algunas variantes) | PyTorch/safetensors |

La comparacion con NLLB-200 se incluye como referencia de categoria (traduccion multilingue), pero sus condiciones de licencia y tamano son muy distintas; para uso comercial estricto, la familia OPUS-MT con CC BY 4.0 resulta mas permisiva.

## Limitaciones y advertencias

- La cuantizacion int8 puede degradar ligeramente la calidad de traduccion respecto al modelo original en punto flotante; conviene validar con un conjunto propio antes de usarlo en produccion.
- El modelo traduce por frases: la model card advierte de que, si se introducen varias oraciones en una sola entrada, algunas pueden descartarse. Es obligatorio segmentar el texto previamente.
- Los piezas que no esten en `vocab.json` deben sustituirse por `<unk>`, como hace `MarianTokenizer`; de lo contrario la decodificacion puede fallar.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre corpus OPUS, puede heredar sesgos de dominio y de genero presentes en los datos paralelos.
- Riesgo de alucinacion: inherente a los sistemas de traduccion neuronal, especialmente en terminos tecnicos, nombres propios y frases idiomaticas.
- Cobertura limitada a tres lenguas de origen y una de destino; no admite otros pares.
- Licencia CC BY 4.0: permite uso comercial siempre que se atribuya adecuadamente a los autores originales (Universidad de Helsinki, proyecto OPUS-MT).
- El repositorio tiene cero descargas y cero likes, por lo que no cuenta con validacion de la comunidad; se recomienda verificar los SHA-256 publicados en `manifest.json` antes de desplegarlo.
- El modelo se ofrece "tal cual", sin garantias; el propio autor advierte de que la traduccion automatica puede contener errores en textos importantes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Zoowr/opus-mt-tc-big-zle-de-ct2-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-de
- Revision del modelo base citada: `b2e247f0c413ca6aa51a32f2f2be8666cf72405e`
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Proyecto OPUS-MT (Helsinki-NLP): https://huggingface.co/Helsinki-NLP
- Paper OPUS-MT: https://aclanthology.org/2020.eamt-1.61
- Paper Tatoeba Translation Challenge: https://aclanthology.org/2020.wmt-1.139
