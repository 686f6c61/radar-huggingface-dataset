# Zoowr/opus-mt-en-zh-ct2-int8

## Resumen
Zoowr/opus-mt-en-zh-ct2-int8 es una conversion al formato CTranslate2 con cuantizacion int8 del modelo de traduccion automatica Helsinki-NLP/opus-mt-en-zh, desarrollado originalmente por el grupo Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo realiza traduccion de ingles a chino simplificado y esta pensado para ejecucion en CPU, sin necesidad de GPU, gracias a la cuantizacion int8 de sus pesos.

La relevancia de esta ficha no reside en el modelo base, que es un MarianMT de la coleccion OPUS-MT ampliamente conocido, sino en el formato empaquetado: un unico binario CTranslate2 (`model.bin` de aproximadamente 79,6 MB) acompanado de los ficheros SentencePiece y del vocabulario compartido, con hashes SHA-256 publicados para verificacion de integridad. Esto lo convierte en un artefacto adecuado para aplicaciones de escritorio que necesitan traduccion local sin dependencias de PyTorch ni descargas pesadas.

El autor lo empaqueta especificamente para Voice Tool, una aplicacion local de reconocimiento de voz para Windows, aunque el modelo puede reutilizarse libremente bajo la licencia Apache 2.0 del modelo original. No se trata de un modelo nuevo ni de un fine-tuning: los cambios se limitan a la conversion de formato y a la cuantizacion int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT, OPUS-MT) |
| Parametros totales | no disponible (pesos cuantizados int8 de ~79,6 MB en `model.bin`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el autor recomienda dividir el texto largo en frases porque con varias frases en una entrada algunas pueden descartarse |
| Tipos de cuantizacion | int8 (pesos); `compute_type="int8"` en CTranslate2 |
| Idiomas soportados | ingles (en) y chino simplificado (zh, token de destino `>>cmn_Hans<<`) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin`) + SentencePiece (`source.spm`, `target.spm`) + `vocab.json` y `shared_vocabulary.json` |

## Arquitectura y entrenamiento
El modelo subyacente es un MarianMT, la arquitectura de traduccion neuronal de código abierto desarrollada en el proyecto OPUS-MT de la Universidad de Helsinki. Se trata de un transformer encoder-decoder con atencion estandar, entrenado sobre corpus paralelos del proyecto OPUS. La model card de esta copia no aporta detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; esa informacion corresponde al modelo original Helsinki-NLP/opus-mt-en-zh y no se reproduce aqui.

La unica intervencion tecnica documentada es la conversion con `ct2-transformers-converter --quantization int8 --low_cpu_mem_usage` usando CTranslate2 4.8.5, partiendo de la revision `408d9bc410a388e1d9aef112a2daba955b945255` del repositorio original, con verificacion previa de los SHA-256 publicados por Hugging Face. Los ficheros del tokenizador (`source.spm`, `target.spm`, `vocab.json`) se copian sin cambios. No hay ficheros pickle de PyTorch: `model.bin` es el formato binario nativo de CTranslate2. La cuantizacion int8 puede alterar ligeramente algunas traducciones respecto al modelo original en fp32.

## Capacidades
- Traduccion automatica de texto de ingles a chino simplificado, con el token de destino `>>cmn_Hans<<` antepuesto al texto de origen.
- Inferencia en CPU con cuantizacion int8, sin requisito de GPU.
- Decodificacion por beam search (el ejemplo de la model card usa `beam_size=4`).
- Integracion mediante la API de Python de CTranslate2 (`ctranslate2.Translator`) y tokenizacion con SentencePiece.
- Verificacion de integridad mediante hashes SHA-256 publicados en `manifest.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es un modelo de traduccion puro.
- Capacidad multilingue limitada estrictamente al par en→zh; no cubre otras direcciones ni otros idiomas.

## Casos de uso
- Traduccion local en aplicaciones de escritorio: el binario de ~79,6 MB y la inferencia en CPU permiten incorporar traduccion en→zh en herramientas Windows sin dependencias de PyTorch ni GPU, como hace Voice Tool con el reconocimiento de voz.
- Traduccion de subtitulos y transcripciones: al procesar frase a frase (recomendacion explicita del autor), encaja en pipelines que segmentan audio o video en unidades y traducen cada segmento de forma independiente.
- Internacionalizacion de documentacion tecnica: traduccion de README, mensajes de interfaz y cadenas de recursos del ingles al chino simplificado en procesos por lotes en servidor sin acelerador.
- Preprocesado para busqueda o analisis en chino: convertir contenido en ingles a chino antes de indexarlo en sistemas de recuperacion orientados a ese idioma.
- Traduccion en entornos con recursos restringidos: servidores sin GPU, contenedores ligeros o dispositivos edge donde un modelo MarianMT int8 es viable en memoria y latencia.
- Prototipado rapido de sistemas de traduccion: al ser un artefacto CTranslate2 con hashes verificables, sirve como base reproducible para comparar calidad frente a modelos mayores antes de invertir en infraestructura.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM: no aplica; el modelo esta disenado para CPU con `device="cpu"` y `compute_type="int8"`.
- GPU recomendadas: no disponibles; el autor no documenta despliegue en GPU. CTranslate2 soporta CUDA en general, pero esta copia esta cuantizada para int8 en CPU.
- Cabe en cualquier equipo consumer: el binario de pesos es de ~79,6 MB y el repositorio completo ocupa ~0,1 GB, por lo que funciona en portatiles y equipos de escritorio modestos.
- Opciones de despliegue: CTranslate2 (API de Python, tal como muestra la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son adecuadas para este formato y arquitectura.
- Latencia y throughput: no disponibles. La cuantizacion int8 esta pensada para reducir memoria y acelerar la inferencia en CPU, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Zoowr/opus-mt-en-zh-ct2-int8 | no disponible (int8, ~79,6 MB) | no disponible | en→zh | Apache 2.0 | CTranslate2 int8 |
| Helsinki-NLP/opus-mt-en-zh (base) | no disponible | no disponible | en→zh | Apache 2.0 | PyTorch/safetensors (formato original) |
| Otros modelos OPUS-MT en→zh de Helsinki-NLP | no disponible | no disponible | en→zh | Apache 2.0 | PyTorch |

La comparativa relevante es frente al modelo original: misma arquitectura y mismos datos de entrenamiento, con la diferencia de formato (CTranslate2 int8 frente a PyTorch) y el posible impacto leve de la cuantizacion en la calidad. No se dispone de datos de benchmarks ni de comparaciones con otros sistemas de traduccion en→zh en la informacion proporcionada.

## Limitaciones y advertencias
- La cuantizacion int8 puede modificar ligeramente algunas traducciones respecto al modelo original en fp32; no se ha publicado una evaluacion de la perdida de calidad.
- El autor advierte que, al introducir varias frases en una misma entrada, algunas pueden descartarse; es necesario segmentar el texto en frases antes de traducir.
- Los pieces que no esten en `vocab.json` deben sustituirse por `<unk>`, como hace `MarianTokenizer`; ignorar esta regla puede producir salidas incorrectas.
- Es un modelo de traduccion puro: no soporta tool calling, agentes, vision ni audio, y no debe emplearse como modelo generativo general.
- Cobertura limitada al par en→zh; no traduce en la direccion inversa ni otros idiomas.
- La traduccion automatica puede ser erronea; el autor recomienda revisar los textos importantes. No se documentan sesgos especificos en la model card, aunque al heredar los datos de OPUS-MT puede reproducir los sesgos del corpus original.
- El modelo se distribuye "as is", sin garantias. La licencia Apache 2.0 permite uso comercial, pero conviene conservar la atribucion a Helsinki-NLP y el aviso de licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay senales de validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Zoowr/opus-mt-en-zh-ct2-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-zh
- CTranslate2 (repositorio): https://github.com/OpenNMT/CTranslate2
- Paper OPUS-MT: https://aclanthology.org/2020.eamt-1.61/
- Proyecto OPUS-MT (Helsinki-NLP): https://huggingface.co/Helsinki-NLP
