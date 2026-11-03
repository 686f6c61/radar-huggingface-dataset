# TigreGotico/afrigloss-opus-mt-fr-ee-onnx

## Resumen

`afrigloss-opus-mt-fr-ee-onnx` es la exportación a ONNX del modelo MarianMT `AfriSpeech/afrigloss-opus-mt-fr-ee`, un sistema de traducción automática francés → ewé (fr → ee) desarrollado por AfriSpeech dentro del marco Afri-Gloss-MT y afinado a partir de OPUS-MT. El modelo original está pensado para traducción de frases cortas con soporte de glosario: los términos que el usuario encierra entre corchetes angulares en la frase de origen deben aparecer en la traducción, lo que permite fijar terminología técnica, nombres propios o léxico especializado sin reentrenar.

Esta variante, publicada por TigreGotico, no modifica los pesos: convierte el checkpoint original a grafos ONNX (encoder, decoder y decoder_with_past) en fp32 e int8, de modo que se pueda ejecutar con `onnxruntime` y `optimum` sin depender de PyTorch. Es relevante para despliegues ligeros en CPU, entornos embebidos o pipelines donde el peso del runtime y el tamaño del artefacto importan: los grafos int8 suman 223,20 MB frente a los 885,78 MB de la versión fp32.

El ewé es una lengua gbe hablada en Ghana y Togo, con recursos digitales limitados; los modelos de traducción hacia y desde ella son escasos. Este modelo cubre una dirección concreta (fr → ee) y una licencia permisiva (Apache 2.0), lo que facilita su integración en herramientas de traducción humanitaria, educativa o de preservación lingüística.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder estilo MarianMT (seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (cuantización dinámica, `QuantType.QUInt8`) |
| Idiomas soportados | francés (fr) y ewé (ee); dirección fr → ee |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`, `decoder_with_past_model.onnx`), en raíz (fp32) y subcarpeta `int8/` |

## Arquitectura y entrenamiento

El modelo base es un MarianMT, la arquitectura seq2seq de traducción automática neuronal derivada del trabajo de OPUS-MT: un encoder y un decoder transformer con atención cruzada, entrenados para traducción condicionada. El checkpoint original procede de OPUS-MT y fue afinado por AfriSpeech bajo el marco Afri-Gloss-MT, que introduce el manejo de glosarios mediante términos marcados con corchetes angulares en la entrada. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible en la documentación consultada.

La exportación se realizó con `optimum-cli` (optimum 1.24.0, transformers 4.45.2, torch 2.4.1 en CPU, onnxruntime 1.31.1) usando la tarea `text2text-generation-with-past` y la opción `--no-post-process`, que mantiene separados los grafos del decoder y del decoder_with_past en lugar de fusionarlos en un `decoder_model_merged.onnx`. La versión int8 se generó grafo a grafo con `onnxruntime.quantization.quantize_dynamic` y `weight_type=QuantType.QUInt8`. El autor reporta paridad de ids de token generados con decodificación greedy (`num_beams=1`, `do_sample=False`, `max_new_tokens=128`) de 7/7 en fp32 y 4/7 en int8 frente al checkpoint original en transformers.

## Capacidades

- Traducción de texto francés → ewé, orientada a frases y párrafos cortos.
- Traducción con glosario restringido: los términos entre corchetes angulares (`<term>`) en la entrada se propagan a la salida, lo que permite fijar terminología.
- Ejecución sin PyTorch mediante `onnxruntime` y `optimum.onnxruntime.ORTModelForSeq2SeqLM`.
- Dos variantes de precisión: fp32 (mayor fidelidad) e int8 (menor huella, con divergencias en algunos casos).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada estrictamente al par fr → ee.

## Casos de uso

- Traducción de documentación sanitaria y humanitaria del francés al ewé: el glosario permite fijar términos médicos o administrativos entre corchetes para que la salida use la denominación acordada, útil en ONG que operan en Ghana y Togo.
- Localización de materiales educativos: traducción de fichas y lecciones cortas del francés al ewé con terminología controlada, desplegable en CPU con la variante int8 (223,20 MB de grafos).
- Preservación lingüística y corpus paralelos: generación asistida de traducciones para revisión humana, aprovechando la licencia Apache 2.0 para publicar los resultados.
- Integración en aplicaciones de escritorio o móviles sin dependencia de PyTorch: los grafos ONNX se cargan con `onnxruntime` en entornos con recursos limitados.
- Traducción de señalética, formularios y avisos breves: el modelo está pensado para frases cortas, que es el formato típico de estos textos.
- Preprocesado en pipelines de datos multilingües: normalización de contenido francés a ewé antes de indexación o análisis, con la variante fp32 cuando la fidelidad es prioritaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU agregado, etc.) en la información disponible. El autor solo reporta pruebas de paridad con el modelo original:

| Variante | Ids de token idénticos al checkpoint original |
|---|---|
| fp32 | 7/7 |
| int8 | 4/7 |

La tabla de ejemplos de la model card muestra divergencias en int8: por ejemplo, para «Le médecin vous verra demain matin» ambas variantes producen la misma salida, mientras que para «Fermez la porte quand vous partez, s'il vous plaît» el fp32 genera «Ne èle dzodzom le ʋɔtru nu la...» y el int8 «Ne èle dzodzom le aƒeme la...». Estas pruebas son cualitativas y de paridad, no una evaluación de calidad de traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los grafos, fp32 requiere en torno a 0,9 GB de pesos y int8 en torno a 0,22 GB, más memoria de activaciones y tokenizer.
- GPU recomendadas: no hay recomendaciones del autor; el modelo es lo bastante pequeño para ejecutarse en CPU y en GPU de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con más de 1-2 GB de memoria libre, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: `optimum.onnxruntime.ORTModelForSeq2SeqLM` con `onnxruntime`; también es posible usar el checkpoint original con transformers si se prefiere PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Dirección | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| afrigloss-opus-mt-fr-ee-onnx (este) | fr → ee | MarianMT + glosario | no disponible | Apache 2.0 | ONNX fp32/int8 |
| AfriSpeech/afrigloss-opus-mt-fr-ee | fr → ee | MarianMT + glosario | no disponible | Apache 2.0 | safetensors/PyTorch |
| OPUS-MT base (familia MarianMT) | múltiples pares | MarianMT | no disponible | varía por checkpoint | PyTorch |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de francés a ewé; no cubre la dirección inversa.
- El glosario no es perfecto: en las pruebas del autor, 2 de 2 entradas con corchetes produjeron salida con corchetes y 4 de 6 términos aparecieron literalmente; otros salieron alterados (ortografía distinta o diacrítico tras el corchete). Hay que limpiar los corchetes de la salida si no se desean.
- La variante int8 no es una réplica exacta: solo 4 de 7 frases coincidieron con el modelo original, con diferencias sustantivas en algunos casos. Para producción con alta fidelidad, usar fp32.
- No hay `decoder_model_merged.onnx`; `from_pretrained` emite un aviso y recurre a los grafos separados.
- Riesgo de alucinación y de traducciones inexactas en frases largas o dominios no vistos, dado el limitado corpus disponible para el ewé.
- Sesgos lingüísticos y de dominio no evaluados por el autor; no hay auditoría de sesgo publicada.
- La model card indica que fue generada y verificada por un pipeline automatizado, sin revisión humana.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TigreGotico/afrigloss-opus-mt-fr-ee-onnx
- Modelo base: https://huggingface.co/AfriSpeech/afrigloss-opus-mt-fr-ee
- Commit del checkpoint exportado: `f95b4ab8cc82f08311df3f42f37a6ae76f1ab4f9`
- Optimum (exportación ONNX): https://huggingface.co/docs/optimum
- onnxruntime: https://onnxruntime.ai/
