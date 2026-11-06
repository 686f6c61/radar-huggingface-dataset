# Zoowr/opus-mt-tc-big-zle-zlw-ct2-int8

## Resumen

`Zoowr/opus-mt-tc-big-zle-zlw-ct2-int8` es una conversion al formato CTranslate2 con cuantizacion int8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-tc-big-zle-zlw`, desarrollado originalmente por el grupo Language Technology Research de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce de lenguas eslavas orientales (bielorruso, ruso y ucraniano) a lenguas eslavas occidentales (polaco y checo), y esta pensado para ejecutarse en CPU sin necesidad de GPU.

El autor de esta copia, Zoowr, la publica como dependencia del proyecto Voice Tool, una aplicacion local de reconocimiento de voz para Windows que descarga estos ficheros, verifica su SHA-256 y traduce en CPU el habla rusa reconocida. La unica intervencion respecto al modelo original es la conversion de formato y la cuantizacion int8, sin reentrenamiento ni modificacion de los tokenizadores SentencePiece.

Es relevante porque ofrece un modelo de traduccion Marian de calidad "big" (la variante de mayor tamano de OPUS-MT) en un paquete de 0,2 GB que funciona en CPU con CTranslate2, lo que facilita el despliegue en aplicaciones de escritorio, entornos sin GPU y pipelines de traduccion de bajo coste. La licencia CC BY 4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT "tc-big") |
| Parametros totales | no disponible (pesos cuantizados int8 de 242.646.883 bytes en `model.bin`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de traduccion por frases; se recomienda segmentar el texto en oraciones) |
| Tipos de cuantizacion | int8 (CTranslate2, `--quantization int8 --low_cpu_mem_usage`) |
| Idiomas soportados | origen: be, ru, uk; destino: pl, cs |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (`model.bin`), tokenizadores SentencePiece (`source.spm`, `target.spm`), `shared_vocabulary.json`, `vocab.json` |

## Arquitectura y entrenamiento

El modelo base es un MarianMT de tipo transformer encoder-decoder, la arquitectura usada por el proyecto OPUS-MT de Helsinki-NLP para traduccion automatica neuronal. La variante "tc-big" corresponde a la configuracion de mayor capacidad de la familia y esta entrenada en el marco del Tatoeba Translation Challenge sobre datos paralelos de OPUS. El modelo es multilingue en el lado de origen (be, ru, uk) y en el de destino (pl, cs), y selecciona el idioma de salida mediante un token especial al inicio de la secuencia de entrada: `>>pol<<` para polaco y `>>ces<<` para checo.

Esta publicacion concreta no reentrena el modelo: solo convierte los pesos originales (revision `e14020b99526d830084be270a1051dca51090eeb`) al formato binario de CTranslate2 4.8.5 y aplica cuantizacion int8. Los ficheros de tokenizacion se copian sin cambios del repositorio original y no se incluyen ficheros pickle de PyTorch. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card de esta copia no los detalla.

## Capacidades

- Traduccion automatica de texto de bielorruso, ruso y ucraniano a polaco y checo.
- Seleccion explicita del idioma de destino mediante el token `>>pol<<` o `>>ces<<` al inicio de la entrada.
- Traduccion por frases con tokenizacion SentencePiece independiente para origen y destino.
- Inferencia en CPU con CTranslate2, incluyendo `translate_batch` con busqueda por beam (`beam_size=4` en el ejemplo del autor).
- Ejecucion sin GPU y con huella de disco reducida (0,2 GB), apta para aplicaciones de escritorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo de traduccion puro.
- Capacidad multilingue limitada estrictamente a las cinco lenguas indicadas; no cubre otros pares.

## Casos de uso

- Traduccion local de subtitulos y transcripciones de audio en ruso a polaco o checo: el modelo se integra en aplicaciones de escritorio como Voice Tool, que transcribe voz y traduce en CPU sin enviar datos a la nube, lo que resulta adecuado por su tamano reducido y su licencia permisiva.
- Atencion al cliente en centros de soporte de Europa del Este: permite traducir mensajes entrantes en ruso o ucraniano a polaco para agentes que trabajan en ese idioma, con despliegue en servidores sin GPU.
- Localizacion de documentacion tecnica y correos: el modelo traduce frases de bielorruso, ruso o ucraniano a polaco y checo, y su tokenizador SentencePiece facilita el preprocesado por oraciones en pipelines de localizacion.
- Procesamiento por lotes de corpus multilingues: `translate_batch` de CTranslate2 permite traducir grandes volumenes de frases en CPU, util para investigacion en linguistica de corpus eslavas.
- Traduccion en entornos con recursos limitados (Raspberry Pi, mini-PC, portatiles sin GPU): el paquete int8 de 0,2 GB y la inferencia en CPU lo hacen viable donde un modelo grande no cabria.
- Prototipado rapido de sistemas de traduccion en aplicaciones Windows: al no requerir PyTorch ni ficheros pickle, simplifica el empaquetado y la verificacion de integridad mediante SHA-256.
- Moderacion de contenido multilingue: traduccion previa de mensajes en ruso o ucraniano a polaco o checo para aplicar clasificadores entrenados en esas lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta copia no incluye metricas BLEU, chrF ni comparaciones con otros modelos, y la informacion proporcionada no contiene datos de evaluacion del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para CPU (`device="cpu"`, `compute_type="int8"`).
- Memoria RAM estimada: el fichero de pesos ocupa 242.646.883 bytes (unos 0,23 GB); el consumo total en ejecucion sera algo superior por tokenizadores y buffers, aunque no se dispone de una cifra oficial.
- GPU recomendadas: no disponibles ni necesarias; CTranslate2 admite GPU, pero esta publicacion esta orientada a CPU.
- Cabe en cualquier equipo de consumo: el repositorio completo ocupa 0,2 GB, por lo que es viable en portatiles, mini-PC y dispositivos de placa unica.
- Opciones de despliegue: CTranslate2 (libreria Python `ctranslate2`), con SentencePiece para la tokenizacion. No se proporcionan ficheros GGUF ni integraciones con Ollama, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Zoowr/opus-mt-tc-big-zle-zlw-ct2-int8 | no disponible (int8, 0,23 GB) | no disponible | be, ru, uk → pl, cs | CC BY 4.0 | CTranslate2 int8 |
| Helsinki-NLP/opus-mt-tc-big-zle-zlw (base) | no disponible | no disponible | be, ru, uk → pl, cs | CC BY 4.0 | PyTorch/safetensors |
| Otros modelos OPUS-MT "tc-big" por par de lenguas | no disponible | no disponible | pares especificos | CC BY 4.0 | PyTorch/safetensors |

La comparativa se limita al modelo original y a otras variantes de la familia OPUS-MT, ya que la informacion disponible no incluye datos de rendimiento ni de otros sistemas de traduccion comparables. La diferencia principal frente al modelo base es el formato (CTranslate2 int8 frente a PyTorch) y el consiguiente menor tamano y ejecucion en CPU, a costa de posibles cambios menores en algunas traducciones por la cuantizacion.

## Limitaciones y advertencias

- La cuantizacion int8 puede alterar ligeramente algunas traducciones respecto al modelo original; el autor lo advierte explicitamente.
- El modelo traduce por frases: con varias oraciones en una misma entrada, algunas pueden descartarse. Es necesario segmentar el texto en oraciones antes de traducir.
- Los tokens que no esten en `vocab.json` deben sustituirse por `<unk>`, como hace `MarianTokenizer`; de lo contrario pueden producirse errores o salidas incorrectas.
- Cobertura linguistica estricta: solo be, ru y uk como origen y pl y cs como destino. No traduce a otras lenguas ni desde ellas.
- No se dispone de informacion sobre sesgos especificos, tasas de alucinacion ni evaluacion de calidad; al ser traduccion automatica, los textos importantes deben revisarse.
- La licencia CC BY 4.0 permite uso comercial siempre que se atribuya a los autores originales (Helsinki-NLP, proyecto OPUS-MT) y se indique si se han hecho cambios.
- Se distribuye "tal cual", sin garantias. El credito del modelo corresponde a Helsinki-NLP; esta copia solo anade la conversion de formato y la cuantizacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zoowr/opus-mt-tc-big-zle-zlw-ct2-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-zlw
- Revision del modelo base citada: `e14020b99526d830084be270a1051dca51090eeb`
- CTranslate2 (repositorio): https://github.com/OpenNMT/CTranslate2
- Paper OPUS-MT: https://aclanthology.org/2020.eamt-1.61
- Paper Tatoeba Translation Challenge: https://aclanthology.org/2020.wmt-1.139
