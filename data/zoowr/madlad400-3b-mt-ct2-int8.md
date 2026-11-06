# Zoowr/madlad400-3b-mt-ct2-int8

## Resumen

Este repositorio contiene una conversion al formato CTranslate2 con cuantizacion int8 del modelo `google/madlad400-3b-mt`, un sistema de traduccion automatica multilingue desarrollado por el equipo MADLAD-400 de Google. El modelo original es un transformer encoder-decoder de aproximadamente 3.000 millones de parametros, entrenado sobre el corpus MADLAD-400, que cubre mas de 400 idiomas. Esta version concreta, publicada por el usuario Zoowr, no introduce cambios en los pesos mas alla de la conversion de formato y la cuantizacion, y esta pensada para ejecutar traduccion en CPU.

La relevancia de esta ficha radica en que el modelo original es una de las referencias abiertas para traduccion multilingue de cobertura amplia con licencia Apache 2.0, y esta variante permite desplegarlo en entornos sin GPU. El autor la publica como componente de una aplicacion local de reconocimiento de voz para Windows ("Voice Tool"), que traduce habla reconocida en ruso sobre CPU. El repositorio ocupa 3,0 GB e incluye los ficheros `model.bin` (2.950.208.324 bytes), `shared_vocabulary.json`, `spiece.model` y `LICENSE`.

El modelo se controla mediante un token de idioma destino al inicio del texto fuente (por ejemplo `<2en>` o `<2pl>`), un mecanismo heredado del modelo original. No se han publicado resultados de benchmarks especificos para esta conversion cuantizada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5-like), segun el modelo base `google/madlad400-3b-mt` |
| Parametros totales | 3B (aproximadamente 3.000 millones, heredado del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (unica variante publicada en este repo) |
| Idiomas soportados | 400+ idiomas en el modelo base; la model card lista explicitamente multilingual, ru, en, es, de, pl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), tokenizer SentencePiece (`spiece.model`), vocabulario compartido en JSON |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `google/madlad400-3b-mt`: un transformer encoder-decoder de tipo T5 con aproximadamente 3.000 millones de parametros, entrenado por el equipo MADLAD-400 de Google (Sneha Kudugunta, Isaac Caswell et al.) sobre el corpus MADLAD-400, un dataset multilingue auditado a nivel de documento que cubre mas de 400 idiomas. El paper asociado es arXiv:2309.04662. La informacion disponible no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

Esta variante concreta no modifica la arquitectura: el autor aplica unicamente conversion de formato y cuantizacion int8 mediante `CTranslate2 4.8.5` con el comando `ct2-transformers-converter --quantization int8 --low_cpu_mem_usage`, partiendo de la revision `fa184c675da0b5c9e1c8694fccd4e12e2d422094` del repositorio original, verificada contra los SHA-256 publicados por Hugging Face. Los ficheros del tokenizer (`spiece.model`) se copian sin cambios. No se incluyen ficheros pickle de PyTorch: `model.bin` es el formato binario nativo de CTranslate2. El autor advierte que la cuantizacion puede alterar ligeramente algunas traducciones.

## Capacidades

- Traduccion automatica multilingue con cobertura de mas de 400 idiomas en el modelo base, con lista explicita de ruso, ingles, espanol, aleman, polaco y chino en la model card.
- Control del idioma destino mediante token prefijo `<2xx>` al inicio del texto fuente (por ejemplo `<2en>`, `<2pl>`).
- Ejecucion en CPU con cuantizacion int8, orientada a despliegue local sin GPU.
- Decodificacion por beam search (el ejemplo de uso emplea `beam_size=4`).
- Inferencia por lotes mediante `translate_batch` de CTranslate2.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento; es un modelo exclusivamente de traduccion.

## Casos de uso

- Traduccion local en aplicaciones de escritorio: el propio autor la usa en "Voice Tool", una app de reconocimiento de voz para Windows que traduce habla en ruso sobre CPU, descargando los ficheros y verificando su SHA-256.
- Traduccion de correspondencia y documentos cortos: con el token `<2en>` o `<2es>` al inicio del texto se traduce frase a frase; es adecuado para correos y mensajes por su bajo coste de inferencia en CPU.
- Pipelines de localizacion sin GPU: al ejecutarse con CTranslate2 en int8, puede integrarse en servidores sin acelerador para traducir cadenas de interfaz o contenido por lotes.
- Preprocesado multilingue para otros sistemas: traduccion previa de texto en ruso, polaco, chino, aleman o espanol a ingles antes de alimentar un pipeline de NLP.
- Traduccion en entornos con requisitos de privacidad: al ejecutarse totalmente en local, el texto no sale del equipo, lo que encaja en escenarios con datos sensibles.
- Prototipado y evaluacion de traduccion multilingue: sirve para comparar calidad entre pares de idiomas con un unico modelo y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, COMET ni comparaciones cuantitativas para esta conversion int8, y tampoco se aportan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: no aplica para el uso previsto; el modelo esta pensado para CPU con `compute_type="int8"` y `device="cpu"`.
- Memoria RAM: el fichero `model.bin` ocupa 2,95 GB, por lo que se recomienda al menos 4-6 GB de RAM libre para cargar el modelo y operar con margen.
- GPU recomendadas: no disponibles en la informacion; el autor no documenta ejecucion en GPU para esta variante.
- Cabe en GPU consumer: no confirmado; al ser una conversion CTranslate2 podria ejecutarse en GPU compatibles, pero no se aportan datos al respecto.
- Opciones de despliegue: CTranslate2 (libreria `ctranslate2` de Python) con SentencePiece para el tokenizer; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Zoowr/madlad400-3b-mt-ct2-int8 (esta ficha) | 3B | no disponible | 400+ (base) | Apache 2.0 | CTranslate2 int8 |
| google/madlad400-3b-mt (original) | 3B | no disponible | 400+ | Apache 2.0 | safetensors/PyTorch |
| Alternativas de traduccion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo con otros modelos de traduccion, por lo que la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- La cuantizacion int8 puede alterar ligeramente algunas traducciones respecto al modelo original, segun advierte el propio autor.
- Con varias frases en una misma entrada, algunas pueden descartarse; el autor recomienda dividir el texto largo en frases antes de traducir.
- Riesgo de errores de traduccion: la model card indica explicitamente que la traduccion automatica puede ser incorrecta y que deben revisarse los textos importantes.
- Se distribuye "as is", sin garantias.
- No se documentan sesgos especificos, limitaciones de contexto ni restricciones adicionales de licencia mas alla de Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-05; se trata de una publicacion reciente y sin validacion comunitaria.
- Es un modelo exclusivamente de traduccion: no soporta generacion libre, codigo, tool calling ni agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Zoowr/madlad400-3b-mt-ct2-int8
- Modelo base: https://huggingface.co/google/madlad400-3b-mt
- Paper MADLAD-400: https://arxiv.org/abs/2309.04662
- CTranslate2: https://github.com/OpenNMT/CTranslate2
