# ukrbublik/opus-mt-en-ru-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-ru-int8-shift-att` es un paquete de inferencia derivado de Helsinki-NLP/opus-mt-en-ru, el modelo de traduccion automatica ingles-ruso del proyecto OPUS-MT. El autor, ukrbublik, no ha reentrenado ni ajustado el modelo: lo que publica es una exportacion ONNX cuantizada a INT8 dinamico (QInt8) con pesos almacenados en ficheros externos, pensada para ejecucion en ONNX Runtime en lugar de PyTorch.

La particularidad tecnica del paquete es que expone como salida adicional la salida de atencion cruzada de la segunda capa del decodificador (`alignment_shift_l2`), lo que permite extraer alineamientos de palabras (word alignment) entre el texto origen en ingles y el texto traducido en ruso. Esto lo convierte en una herramienta util para subtitulado, traduccion asistida con resaltado de correspondencias y analisis linguistico, no solo para traduccion end-to-end.

El modelo subyacente es un transformer encoder-decoder de tipo Marian (familia OPUS-MT), con tokenizador SentencePiece propio del par ingles-ruso. El repositorio ocupa aproximadamente 0,1 GB, con 141.235.921 bytes de pesos externos y 528.673 bytes de grafos ONNX. La licencia es Apache 2.0 y el ambito linguistico se limita estrictamente a ingles y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian (OPUS-MT), exportado a ONNX |
| Parametros totales | no disponible (pesos INT8: 141.235.921 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QInt8 dinamico (pesos INT8, activaciones dinamicas) |
| Idiomas soportados | ingles (en) y ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con inicializadores en ficheros externos (`encoder.weights`, `decoder.weights`) |
| Libreria de ejecucion | onnxruntime |
| Salidas expuestas | texto traducido y `alignment_shift_l2` (atencion cruzada capa 2 del decodificador) |
| Revision upstream | `bb09c99d180016eac6819df3dae68edb1690fdee` de Helsinki-NLP/opus-mt-en-ru |
| Tokenizador | `tokenizer_runtime.json` (metadatos propios de Subtitle Tap, no configuracion estandar de Transformers) |

## Arquitectura y entrenamiento

El modelo base Helsinki-NLP/opus-mt-en-ru pertenece a la familia OPUS-MT, construida sobre la arquitectura Marian: un transformer encoder-decoder con atencion multi-cabeza estandar, entrenado por Helsinki-NLP sobre corpus paralelos del proyecto OPUS. Este repositorio no contiene ningun proceso de entrenamiento propio: la model card indica explicitamente "No fine-tuning". Lo que se ha hecho es una exportacion con Optimum ONNX, cuantizacion dinamica a QInt8 de los pesos y conversion del almacenamiento de inicializadores a ficheros externos, preservando tipo, dimensiones, bytes y todos los nodos, entradas y salidas del grafo.

La innovacion tecnica del paquete es la exposicion de `alignment_shift_l2`: la salida de atencion cruzada de la segunda capa del decodificador se publica como tensor accesible, lo que permite derivar alineamientos de palabras mediante la matriz de atencion. El fichero `alignment.json` documenta la configuracion Shift-L2 con umbral 0,1 junto con la identidad del grafo. La model card afirma paridad de conversion: el export monolitico cualificado y estos grafos con datos externos producen texto generado y enlaces de alineamiento identicos sobre 200 cues de subtitulos en ingles en el host Mac del autor. Esa paridad es de conversion, no una garantia general de calidad semantica ni una medicion de latencia en telefono.

## Capacidades

- Traduccion automatica directa de ingles a ruso, texto a texto.
- Extraccion de alineamientos de palabras entre origen y traduccion mediante la salida `alignment_shift_l2` (configuracion Shift-L2, umbral 0,1).
- Ejecucion en ONNX Runtime con grafos separados de encoder y decoder y pesos externos, lo que permite empaquetar grafos y tokenizador en una aplicacion y descargar los pesos una sola vez.
- Verificacion de integridad mediante `manifest.json` con tamanos y checksums SHA-256 por fichero.
- No dispone de tool calling, function calling, modo agente, vision, audio ni razonamiento multi-paso.
- Capacidad multilingue limitada a un unico par de idiomas: ingles y ruso. No es el modelo OPUS Big multilingue.

## Casos de uso

- Subtitulado automatico en ingles a ruso: el modelo traduce cues individuales y, gracias a `alignment_shift_l2`, permite generar subtitulos con marcas temporales o resaltado de palabras alineadas entre la linea original y la traduccion, util para editores de subtitulos.
- Traduccion asistida con resaltado de correspondencias: en una herramienta CAT (computer-assisted translation), el alineamiento por palabra permite mostrar al traductor que termino ruso corresponde a cada termino ingles, reduciendo el coste de revision.
- Aplicaciones de escritorio o moviles con inferencia local: al estar en ONNX Runtime con INT8 y 0,1 GB de repositorio, el modelo puede empaquetarse en aplicaciones que no envian texto a servidores externos, con descarga unica de pesos y grafos incluidos en el binario.
- Procesamiento por lotes de documentacion tecnica: traduccion de manuales, README y documentacion de producto en ingles a ruso en pipelines offline, con checksums de `manifest.json` para verificar la integridad del paquete desplegado.
- Analisis linguistico y corpus paralelos: extraccion de enlaces de alineamiento para construir o validar corpus paralelos ingles-ruso a nivel de palabra, con conocimiento de que el alineamiento falla en modismos, negaciones, omisiones y frases ambiguas.
- Traduccion de contenido web de bajo volumen en entornos con recursos limitados: al ser un modelo pequeno cuantizado, cabe en CPU y en GPUs modestas, lo que permite servir traduccion ingles-ruso en un servicio ligero sin infraestructura de aceleradores de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta paridad de conversion entre el export monolitico y los grafos con datos externos sobre 200 cues de subtitulos, sin metricas BLEU, COMET ni latencia medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los pesos INT8 ocupan unos 141 MB, por lo que el requisito de memoria es muy bajo y probablemente inferior a 1 GB en la practica.
- GPU recomendadas: no disponibles; el modelo esta pensado para ONNX Runtime y puede ejecutarse en CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superiores) sobra en memoria, pero no hay datos de rendimiento GPU publicados.
- Cabe en GPU consumer: si, con margen amplio, dado el tamano de los pesos (0,1 GB de repositorio).
- Opciones de despliegue: ONNX Runtime (libreria declarada); los grafos referencian sus ficheros de pesos externos por rutas relativas, por lo que `encoder.onnx` debe mantenerse junto a `encoder.weights` y `decoder.onnx` junto a `decoder.weights`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card advierte que la paridad verificada no constituye una medicion de latencia en telefono.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-ru-int8-shift-att | no disponible (pesos INT8 de 141 MB) | no disponible | en, ru | Apache 2.0 | ONNX INT8 | Exportacion con alineamiento de palabras expuesto |
| Helsinki-NLP/opus-mt-en-ru | no disponible | no disponible | en, ru | Apache 2.0 | PyTorch (safetensors/bin) | Modelo base original, sin cuantizacion ni salida de alineamiento |
| OPUS-MT Big multilingue | no disponible | no disponible | multilingue | Apache 2.0 | PyTorch | Familia distinta; la model card aclara que este paquete no es el modelo Big multilingue |

La comparacion con alternativas de terceros (por ejemplo, modelos NMT multilingues de otros proyectos) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito linguistico restringido: solo ingles a ruso; no es un modelo multilingue ni bidireccional.
- El alineamiento de palabras comete errores en modismos, negaciones, palabras omitidas y frases ambiguas, segun la propia model card.
- La paridad verificada es de conversion (texto y alineamientos identicos al export monolitico en 200 cues), no una garantia de calidad semantica general ni de latencia.
- Los pesos PyTorch originales no son intercambiables con estos inicializadores INT8; pesos y grafos deben provenir del mismo paquete fijado por commit.
- El tokenizador es `tokenizer_runtime.json`, metadatos propios de Subtitle Tap, no una configuracion estandar de Transformers; integrarlo requiere usar ese formato, no el tokenizador estandar de Hugging Face.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo NMT pequeno, se aplican los riesgos habituales de traduccion automatica (omisiones, errores en terminos especializados), pero no hay evaluacion publicada.
- Uso comercial permitido por la licencia Apache 2.0, con la obligacion habitual de conservar avisos de licencia y atribucion; el repositorio es una exportacion modificada, no una release oficial de Helsinki-NLP.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado, sin comunidad que haya reportado resultados independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-ru-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-ru
- Revision upstream referenciada: `bb09c99d180016eac6819df3dae68edb1690fdee`
- Proyecto OPUS-MT: no disponible en la informacion proporcionada
- Paper de Marian: no disponible en la informacion proporcionada
- Repositorio o demo de Subtitle Tap: no disponible en la informacion proporcionada
