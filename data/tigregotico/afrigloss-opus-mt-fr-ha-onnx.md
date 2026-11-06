# TigreGotico/afrigloss-opus-mt-fr-ha-onnx

## Resumen

`afrigloss-opus-mt-fr-ha-onnx` es la exportación a ONNX del modelo MarianMT `AfriSpeech/afrigloss-opus-mt-fr-ha`, un traductor neuronal frances -> hausa (fr -> ha) desarrollado por AfriSpeech dentro del marco Afri-Gloss-MT. El modelo original parte de OPUS-MT y se ha afinado para incorporar terminos de glosario escritos entre corchetes angulares en la frase de origen, de forma que el termino se propague a la traduccion. Esta version ONNX la publica TigreGotico y anade grafos optimizados para `onnxruntime` en fp32 e int8.

El interes practico esta en el despliegue: los grafos ONNX permiten inferencia en CPU sin depender de PyTorch, con un peso total de 877,56 MB en fp32 y 221,14 MB en int8. Es un modelo pequeno (arquitectura transformer encoder-decoder de tipo Marian), orientado a traduccion de frases y no a generacion abierta, con soporte limitado a frances y hausa.

La relevancia actual es doble: cubre un par de idiomas de bajos recursos (hausa) y ofrece un mecanismo de glosario que resulta util en dominios con terminologia controlada. La model card advierte de que la conversion y las comprobaciones se hicieron con un pipeline automatizado y que ninguna persona ha revisado la ficha del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder, seq2seq) |
| Parametros totales | no disponible (los grafos ONNX suman 877,56 MB en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica, `QuantType.QUInt8`) |
| Idiomas soportados | frances (fr) y hausa (ha); direccion fr -> ha |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`, `decoder_with_past_model.onnx`; versiones int8 en `int8/`) |

## Arquitectura y entrenamiento

El modelo base es un MarianMT, la arquitectura seq2seq de traduccion de OPUS-MT, con encoder y decoder transformer. AfriSpeech lo afino desde OPUS-MT dentro del marco Afri-Gloss-MT, cuyo objetivo es que el modelo respete un glosario: los terminos de destino se escriben en la frase de origen entre corchetes angulares (`<term>`) y el modelo debe trasladarlos a la salida. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

Esta exportacion no modifica los pesos, solo los convierte a ONNX con `optimum-cli export onnx --task text2text-generation-with-past --no-post-process`, lo que mantiene separados `decoder_model.onnx` y `decoder_with_past_model.onnx` (no hay `decoder_model_merged.onnx`). La version int8 se genero por grafo con `onnxruntime.quantization.quantize_dynamic`. El toolchain usado fue optimum 1.24.0, transformers 4.45.2, torch 2.4.1 (CPU) y onnxruntime 1.31.1. La paridad con el checkpoint original, medida sobre 7 frases con decodificacion greedy, es de 7/7 tokens identicos en fp32 y 4/7 en int8.

## Capacidades

- Traduccion de texto frances -> hausa, orientada a frases y parrafos cortos.
- Traduccion con glosario: propaga terminos entre corchetes angulares (`<term>`) desde el origen a la salida, segun el entrenamiento Afri-Gloss-MT.
- Inferencia en CPU mediante `onnxruntime` con `ORTModelForSeq2SeqLM` de optimum.
- Ejecucion en fp32 o int8, con menor huella de memoria en int8 a costa de perdida de paridad.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento.
- Capacidad multilingue limitada a los dos idiomas del par (fr, ha).

## Casos de uso

- Traduccion de documentacion y materiales de ONG en el Sahel: el modelo traduce frances a hausa en CPU, lo que permite desplegarlo en servidores modestos o en campo sin GPU.
- Localizacion de interfaces y avisos con terminologia controlada: gracias al glosario entre corchetes se puede forzar que terminos medicos o administrativos concretos aparezcan en hausa en la salida.
- Traduccion por lotes de corpus paralelos: los grafos ONNX permiten procesar grandes volumenes en pipelines de datos sin dependencia de PyTorch.
- Preprocesamiento en sistemas de atencion ciudadana: traduccion de consultas en frances a hausa antes de un clasificador o de un sistema de respuesta.
- Despliegue en dispositivos con recursos limitados: la version int8 (221,14 MB en total) cabe en entornos con poca RAM y sin acelerador.
- Integracion en aplicaciones moviles o de escritorio mediante `onnxruntime`, al no requerir el stack completo de transformers con torch.
- Generacion de subtitulos o resumenes bilingues fr-ha en flujos editoriales, siempre con revision humana por la calidad limitada observada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta una prueba de paridad con el modelo original sobre 7 frases:

| Variante | Tokens identicos al checkpoint original |
|---|---|
| fp32 ONNX | 7/7 |
| int8 ONNX | 4/7 |

En la prueba de glosario, 2 de 2 entradas con corchetes produjeron salida con corchetes, y 2 de 6 terminos aparecieron literalmente en la salida (ignorando mayusculas). Ninguna de las 5 entradas sin corchetes genero `<` o `>` en la salida.

## Requisitos de hardware

- VRAM/RAM estimada: 877,56 MB para los grafos fp32 y 221,14 MB para int8, mas el overhead de `onnxruntime` y del tokenizador.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU con al menos 1-2 GB de memoria libre puede ejecutarlo, pero no aporta ventaja significativa frente a CPU para este tamano.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) y en equipos sin GPU dedicada.
- Opciones de despliegue: `optimum.onnxruntime.ORTModelForSeq2SeqLM`, `onnxruntime` directamente, o servidores compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `TigreGotico/afrigloss-opus-mt-fr-ha-onnx` | no disponible (877,56 MB fp32) | no disponible | fr -> ha | apache-2.0 | ONNX (fp32/int8) |
| `AfriSpeech/afrigloss-opus-mt-fr-ha` | no disponible | no disponible | fr -> ha | apache-2.0 | safetensors/PyTorch |
| OPUS-MT fr-ha (Helsinki-NLP) | no disponible | no disponible | fr -> ha | no disponible | PyTorch |
| NLLB-200 (Meta) | hasta 54.500 M | no disponible | 200 idiomas, incluye hausa | CC-BY-NC-4.0 | PyTorch |

La comparativa es cualitativa: no hay datos de benchmarks publicados para este modelo. Frente al checkpoint original, la ventaja es el despliegue sin PyTorch y la opcion int8; frente a NLLB, el modelo es mucho mas pequeno y desplegable en CPU, pero cubre un unico par de idiomas y su licencia (apache-2.0) es mas permisiva para uso comercial.

## Limitaciones y advertencias

- Calidad de traduccion limitada: en las pruebas de la model card hay salidas claramente incorrectas (por ejemplo, "Les enfants jouent dans la cour" se traduce como una frase sobre servir a los padres, y "Le medecin vous verra demain matin" produce una frase no equivalente).
- El glosario no es fiable: solo 2 de 6 terminos entre corchetes aparecieron literalmente en la salida; otros cambian de ortografia o reciben diacriticos tras el corchete. Hay que limpiar los corchetes de la salida si no se desean.
- La version int8 pierde paridad (4/7 tokens identicos) y puede degradar la traduccion; no se usa como criterio de publicacion.
- Riesgo de alucinacion: al ser un modelo seq2seq pequeno, puede generar contenido no presente en el origen, como muestran los ejemplos.
- Cobertura limitada a frances y hausa; no se debe usar para otros idiomas ni para generacion abierta.
- La model card indica que la conversion y las comprobaciones se hicieron de forma automatizada y sin revision humana.
- Licencia apache-2.0: permite uso comercial, pero se debe mantener el aviso de licencia y atribuir al modelo base de AfriSpeech.
- No hay `decoder_model_merged.onnx`; algunas herramientas pueden requerirlo y caer en los grafos separados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigreGotico/afrigloss-opus-mt-fr-ha-onnx
- Modelo base: https://huggingface.co/AfriSpeech/afrigloss-opus-mt-fr-ha
- Repositorio optimum: https://github.com/huggingface/optimum
- Documentacion de onnxruntime: https://onnxruntime.ai/docs/
- OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
