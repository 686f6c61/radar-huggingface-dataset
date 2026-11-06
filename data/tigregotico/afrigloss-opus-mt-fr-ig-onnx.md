# TigreGotico/afrigloss-opus-mt-fr-ig-onnx

## Resumen

`afrigloss-opus-mt-fr-ig-onnx` es la exportacion a ONNX del modelo MarianMT `AfriSpeech/afrigloss-opus-mt-fr-ig`, un sistema de traduccion automatica frances → igbo desarrollado por AfriSpeech dentro del marco Afri-Gloss-MT y afinado a partir de OPUS-MT. El modelo original es un transformer encoder-decoder de tipo Marian, y esta version lo distribuye en formato ONNX (fp32 e int8) para su uso con Optimum y ONNX Runtime, sin dependencia de PyTorch en inferencia.

La caracteristica diferencial del modelo es su entrenamiento con glosarios: el sistema esta disenado para arrastrar terminos objetivo escritos entre corchetes angulares (`<term>`) en la frase de origen hacia la traduccion, de modo que el termino aparezca literalmente en la salida. Esto lo hace util para traduccion con terminologia controlada, aunque obliga a preprocesar y postprocesar los corchetes.

El repositorio lo publica TigreGotico como conversion automatica del checkpoint original, con verificacion de paridad frente al modelo fuente. La relevancia actual es practica: ofrece una ruta de despliegue ligera (grafo int8 de 222 MB en total) para un par de idiomas de bajos recursos como el igbo, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder MarianMT (exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica, `QuantType.QUInt8`) |
| Idiomas soportados | frances (fr) e igbo (ig); direccion fr → ig |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`, `decoder_with_past_model.onnx`), tokenizer en la raiz del repo |

## Arquitectura y entrenamiento

El modelo base es un MarianMT, la arquitectura de traduccion neuronal de OPUS-MT: un transformer encoder-decoder con atencion completa, pensado para traduccion secuencia a secuencia. El checkpoint original fue afinado por AfriSpeech bajo el marco Afri-Gloss-MT, que introduce el uso de glosarios: durante el entrenamiento el modelo aprende a preservar terminos marcados con corchetes angulares en la frase fuente y a insertarlos en la traduccion. No se dispone en la informacion proporcionada de datos sobre volumen de tokens, composicion del corpus, ni de si hubo RLHF o DPO.

Esta version no reentrena el modelo: solo lo exporta. La exportacion se hizo con `optimum-cli export onnx --task text2text-generation-with-past --no-post-process`, lo que mantiene separados los grafos `decoder_model` y `decoder_with_past_model` (no existe `decoder_model_merged.onnx`). La cuantizacion int8 se aplico por grafo con `onnxruntime.quantization.quantize_dynamic`. El toolchain declarado es optimum 1.24.0, transformers 4.45.2, torch 2.4.1 (CPU) y onnxruntime 1.31.1. Los tamanos de los grafos son: 881,86 MB en fp32 (347,57 MB decoder, 334,91 MB decoder_with_past, 199,37 MB encoder) y 222,22 MB en int8 (87,66 MB, 84,41 MB y 50,14 MB respectivamente).

## Capacidades

- Traduccion automatica fr → ig con decodificacion autoregresiva (greedy o beam search via `generate`).
- Traduccion con glosario: propaga terminos entre corchetes angulares (`<term>`) de la frase fuente a la salida. En las pruebas del autor, 6 de 6 terminos entre corchetes aparecieron literalmente en la salida (incluidos los corchetes) y 2 de 2 entradas con corchetes produjeron salida con corchetes.
- Inferencia sin corchetes no introduce corchetes: 0 de 5 entradas planas generaron `<` o `>` en la salida.
- Ejecucion en ONNX Runtime con grafos separados para encoder, decoder y decoder con cache (`with_past`), lo que permite reutilizar el estado pasado en decodificacion.
- No dispone de tool calling, function calling, modo agente, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada estrictamente al par fr → ig.

## Casos de uso

- Traduccion de documentacion con terminologia controlada: se marcan los terminos tecnicos en frances con `<term>` y el modelo los inserta en igbo, lo que permite mantener un glosario fijo de productos o conceptos sin postprocesado manual intensivo.
- Localizacion de interfaces y cadenas cortas: el tamano int8 (222 MB) permite desplegar el modelo en servidores modestos o incluso en entornos de CPU para traducir cadenas de UI en lote.
- Traduccion de contenido editorial y noticias hacia igbo: el par fr → ig cubre un idioma de bajos recursos donde los sistemas comerciales suelen tener cobertura escasa; el modelo sirve como primera pasada para revision humana.
- Procesamiento por lotes en pipelines de datos: al ser ONNX Runtime, se integra en flujos ETL sin necesidad de GPU ni de PyTorch, con grafos separados que permiten cache de decoder.
- Traduccion asistida en entornos con recursos limitados: el grafo int8 reduce el uso de memoria y permite ejecutar en CPU, util para despliegues en infraestructura sin aceleradores.
- Investigacion sobre glosarios en traduccion automatica: el comportamiento documentado de propagacion de terminos entre corchetes lo hace util como referencia reproducible para experimentos de terminologia controlada.
- Traduccion de material educativo o sanitario hacia igbo: con el glosario se pueden fijar terminos clave (por ejemplo, medicos) y verificar que aparecen en la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta pruebas de paridad de tokens con el modelo fuente, no metricas de calidad de traduccion (BLEU, chrF, etc.).

| Variante | Ids de token identicos al modelo fuente (7 frases, greedy) |
|---|---|
| fp32 | 7/7 |
| int8 | 5/7 |

La paridad int8 se declara solo informativa y no como criterio de publicacion. En una de las frases de prueba (`Fermez la porte quand vous partez, s'il vous plaît.`) la salida int8 mostro degradacion clara (repeticion y contenido incoherente) frente a fp32.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamano de grafo, el int8 completo ocupa 222,22 MB y el fp32 881,86 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de memoria libre para fp32; el modelo no requiere A100 ni H100. Una RTX 4090 o similar queda sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1050 en adelante), y tambien en CPU.
- Opciones de despliegue: ONNX Runtime via `optimum.onnxruntime.ORTModelForSeq2SeqLM` (fp32 en la raiz, int8 en el subdirectorio `int8`). No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `TigreGotico/afrigloss-opus-mt-fr-ig-onnx` | MarianMT (ONNX) | fr → ig | no disponible | Apache 2.0 | ONNX fp32/int8 | Version cuantizada del checkpoint AfriSpeech |
| `AfriSpeech/afrigloss-opus-mt-fr-ig` | MarianMT | fr → ig | no disponible | Apache 2.0 | safetensors/PyTorch (segun checkpoint) | Modelo fuente, requiere transformers/torch |
| OPUS-MT fr-ig (familia OPUS-MT) | MarianMT | fr → ig | no disponible | no disponible en esta ficha | no disponible | Base de la que parte el afinado Afri-Gloss-MT |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La model card advierte que la conversion y la revision fueron automatizadas (Claude Opus 5.5 via Claude Code) y que ninguna persona ha revisado la ficha.
- La cuantizacion int8 no mantiene paridad completa: 5 de 7 frases con ids identicos y al menos un caso con degradacion severa (repeticiones e incoherencia). Para produccion conviene validar int8 por frase o usar fp32.
- El modelo esta especializado en un unico par de idiomas (fr → ig); no traduce en la direccion inversa ni a otros idiomas.
- El mecanismo de glosario exige escribir los terminos entre corchetes angulares en la entrada y eliminar los corchetes de la salida si no se desean; no hay garantia documentada de que todos los terminos se propaguen en frases largas.
- Riesgo de alucinacion y de traducciones incoherentes, especialmente en decodificacion con int8 y en frases largas o ambiguas.
- No se documentan sesgos especificos, pero al ser un modelo de bajos recursos para igbo, la cobertura lexica y la calidad en dominios especializados pueden ser limitadas.
- Licencia Apache 2.0, que permite uso comercial; la exportacion a ONNX no altera la licencia del modelo fuente.
- No hay datos publicados de BLEU/chrF ni de rendimiento en produccion, por lo que la calidad debe evaluarse con un conjunto propio antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TigreGotico/afrigloss-opus-mt-fr-ig-onnx
- Modelo base: https://huggingface.co/AfriSpeech/afrigloss-opus-mt-fr-ig
- Commit de exportacion: `4822d78591ce023cd11bec79ed52f48e9ea850fd` (referenciado en la model card)
- Optimum (herramienta de exportacion): https://github.com/huggingface/optimum
- ONNX Runtime: https://onnxruntime.ai/
- OPUS-MT (familia de modelos): https://github.com/Helsinki-NLP/OPUS-MT
