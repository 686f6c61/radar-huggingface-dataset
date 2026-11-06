# Zoowr/opus-mt-tc-big-zle-es-ct2-int8

## Resumen

`Zoowr/opus-mt-tc-big-zle-es-ct2-int8` es una conversion al formato CTranslate2 con cuantizacion int8 del modelo de traduccion automatica `Helsinki-NLP/opus-mt-tc-big-zle-es`, desarrollado por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (Helsinki-NLP) dentro del proyecto OPUS-MT. El modelo traduce desde lenguas eslavas orientales (belaruso, ruso y ucraniano) hacia espanol, y esta pensado para ejecutarse en CPU.

La aportacion de esta copia concreta no es un nuevo entrenamiento, sino el empaquetado del modelo original en el binario `model.bin` de CTranslate2 con pesos cuantizados a int8, lo que reduce el peso del repositorio a unos 0,2 GB y elimina la dependencia de ficheros pickle de PyTorch. El autor, Zoowr, lo publica para integrarlo en "Voice Tool", una aplicacion local de voz a texto para Windows que descarga estos ficheros, verifica sus hashes SHA-256 y traduce en CPU el habla rusa reconocida.

Es relevante para quien necesite traduccion ru/uk/be a es en local, sin GPU y con un footprint de memoria minimo, a costa de renunciar a las capacidades de los modelos neuronales grandes actuales: es un modelo Marian de traduccion pura, sin contexto largo ni instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible (peso del binario: 242.566.543 bytes en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (recomendado segmentar por frases) |
| Tipos de cuantizacion | int8 (unica incluida en el repo) |
| Idiomas soportados | be, ru, uk (origen) -> es (destino) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (`model.bin`), tokenizadores SentencePiece (`source.spm`, `target.spm`), `shared_vocabulary.json`, `vocab.json` |

## Arquitectura y entrenamiento

El modelo base es un Marian NMT, un transformer encoder-decoder entrenado para traduccion supervisada, en la variante "tc-big" de OPUS-MT (modelo de mayor tamano dentro de la familia TC). El modelo original se entreno sobre corpus paralelos del ecosistema OPUS, con un vocabulario compartido codificado mediante SentencePiece; la model card de esta copia no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de fine-tuning o preference optimization, por lo que esos datos deben consultarse en la ficha de `Helsinki-NLP/opus-mt-tc-big-zle-es`.

La unica transformacion aplicada aqui es de formato y precision: conversion con `CTranslate2 4.8.5` mediante `ct2-transformers-converter --quantization int8 --low_cpu_mem_usage`, revision del modelo fuente `03bc140e9c98ccc4b1a9244d8ab45b49d3a8420e`, verificacion de SHA-256 de todos los ficheros originales antes de convertir y copia sin cambios de los tokenizadores. No hay decodificacion especulativa ni atencion lineal: es inferencia clasica con beam search (el ejemplo de uso emplea `beam_size=4`).

## Capacidades

- Traduccion de texto de belaruso, ruso y ucraniano a espanol.
- Inferencia en CPU con cuantizacion int8, sin necesidad de GPU.
- Ejecucion local y offline, con verificacion de integridad mediante hashes SHA-256 publicados en el repo y en `manifest.json`.
- Integracion via API de Python de CTranslate2 (`ctranslate2.Translator`), con control de `device`, `compute_type` y `beam_size`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada a la direccion zle -> es; no traduce al reves ni entre las lenguas de origen.

## Casos de uso

- Subtitulado y transcripcion de audio en ruso para usuarios hispanohablantes: el escenario original del autor, una app de voz a texto en Windows que transcribe habla rusa y la traduce en CPU con este modelo, sin enviar datos a la nube.
- Traduccion de correspondencia y documentacion administrativa ru->es en escritorio: el ejemplo de la model card ("Добрый день, отвечаю на Ваше письмо") refleja el uso tipico de correos y cartas, donde frases cortas y bien segmentadas obtienen la mejor calidad.
- Procesamiento por lotes de corpus ru/uk/be en servidores sin GPU: al pesar unos 0,2 GB y ejecutarse en int8, permite desplegar traduccion masiva en maquinas modestas o contenedores con poca memoria.
- Preprocesado de datos para pipelines de NLP: traduccion de reseñas, tickets o comentarios en eslavo oriental a espanol antes de analisis de sentimiento o clasificacion.
- Herramientas de escritorio y aplicaciones de accesibilidad offline: al no requerir red ni GPU, encaja en utilidades locales donde la privacidad del texto es un requisito.
- Traduccion de apoyo en contextos humanitarios o de acogida (ru/uk -> es): util para voluntariado y atencion a personas desplazadas, siempre con revision humana dado el riesgo de error del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, COMET ni comparaciones cuantitativas; solo advierte que la cuantizacion int8 puede alterar ligeramente algunas traducciones respecto al modelo original.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU (`device="cpu"`, `compute_type="int8"`).
- Memoria RAM estimada: el binario ocupa unos 243 MB, mas el overhead de CTranslate2 y los tokenizadores; un entorno de 1-2 GB de RAM es suficiente para inferencia por frases.
- GPU: no necesaria. CTranslate2 puede usar CUDA, pero esta copia esta cuantizada en int8 para CPU y no se ha validado en GPU segun la informacion disponible.
- Cabe en cualquier equipo consumer, incluidos portatiles de gama baja y mini-PC.
- Despliegue: CTranslate2 (libreria Python `ctranslate2`), con SentencePiece para la tokenizacion. No se proporcionan ficheros GGUF, por lo que no es directamente compatible con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Direccion | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Zoowr/opus-mt-tc-big-zle-es-ct2-int8 | be/ru/uk -> es | no disponible (binario int8 de ~243 MB) | no disponible | CTranslate2 int8 | CC BY 4.0 |
| Helsinki-NLP/opus-mt-tc-big-zle-es | be/ru/uk -> es | no disponible | no disponible | PyTorch/safetensors (modelo original) | CC BY 4.0 |
| Helsinki-NLP/opus-mt-ru-es | ru -> es | no disponible | no disponible | PyTorch (familia OPUS-MT estandar) | CC BY 4.0 |

La diferencia principal frente al modelo original es el formato y la precision (int8, CPU, sin pickle), no la calidad. Frente a la variante `opus-mt-ru-es`, esta cubre ademas belaruso y ucraniano, a costa de un modelo "big" de mayor tamano. No se dispone de datos de rendimiento comparado para cuantificar diferencias de calidad.

## Limitaciones y advertencias

- La cuantizacion int8 puede degradar ligeramente la calidad respecto al modelo original; la model card lo advierte explicitamente.
- Sesgos: al ser un modelo OPUS-MT entrenado sobre corpus paralelos, puede heredar sesgos de dominio y de las fuentes de datos; no se documentan evaluaciones de sesgo.
- Riesgo de alucinacion y errores de traduccion: la model card indica que la traduccion automatica puede ser erronea y que deben revisarse los textos importantes.
- Limitacion operativa documentada: con varias frases en una misma entrada, algunas pueden descartarse; es necesario segmentar el texto en frases antes de traducir.
- Piezas fuera de `vocab.json` deben sustituirse por `<unk>`, como hace `MarianTokenizer`; ignorarlo puede producir salidas invalidas.
- Solo traduce en la direccion be/ru/uk -> es; no soporta el sentido inverso ni otros pares.
- Licencia CC BY 4.0: permite uso comercial con atribucion a los autores originales (Helsinki-NLP / Universidad de Helsinki); debe conservarse la atribucion y el aviso de licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria de esta copia concreta; conviene verificar los SHA-256 publicados antes de desplegarla.
- No apta para tareas generativas, de razonamiento o de codigo: es exclusivamente un modelo de traduccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Zoowr/opus-mt-tc-big-zle-es-ct2-int8
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zle-es
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Paper OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61
- Paper Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139
- Organizacion Helsinki-NLP: https://huggingface.co/Helsinki-NLP
