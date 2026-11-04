# TigreGotico/nllb_200_distilled_600m-yor-eng-onnx

## Resumen

El modelo `nllb_200_distilled_600m-yor-eng-onnx` es una exportación a formato ONNX del checkpoint `dsfsi/nllb_200_distilled_600m-yor-eng`, un fine-tune de `facebook/nllb-200-distilled-600M` especializado en traducción unidireccional de yoruba (`yor_Latn`) a inglés (`eng_Latn`). El modelo original fue entrenado por DSFSI (Data Science for Social Impact, Universidad de Pretoria) sobre el dataset `afriscience-mt`, y esta versión se limita a convertir los pesos a ONNX con el objetivo de facilitar el despliegue en entornos de producción sin dependencia de PyTorch.

La relevancia de esta variante radica en su empaquetado: ofrece grafos fp32 completos (~7 GB) y una versión int8 cuantizada dinámicamente (~1,9 GB) que mantiene una calidad de traducción comparable según la evaluación preliminar del autor (chrF 45,69 frente a 44,92 del fp32 sobre 50 frases de FLORES-200). Al estar basada en la arquitectura M2M-100 de NLLB, con aproximadamente 600 millones de parámetros, el modelo es ligero y desplegable en CPU, lo que lo hace útil para aplicaciones de traducción de bajo recurso en contextos con hardware limitado.

La licencia Apache-2.0 y el soporte de ONNX Runtime permiten integrarlo en pipelines sin restricciones comerciales, si bien el alcance idiomático se limita estrictamente al par yoruba-inglés y la evaluación publicada es reducida en tamaño muestral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100, NLLB-200 distilled) |
| Parametros totales | ~600 M (heredados de nllb-200-distilled-600M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (NLLB-200 soporta hasta 512 tokens por segmento; no confirmado en la model card) |
| Tipos de cuantizacion | fp32 y int8 dynamic (per-channel, QInt8) |
| Idiomas soportados | yoruba (`yor_Latn`) como origen, ingles (`eng_Latn`) como destino |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data` externos) |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de `facebook/nllb-200-distilled-600M`, que a su vez es una versión destilada de NLLB-200 con arquitectura transformer encoder-decoder de tipo M2M-100. El entrenamiento específico para el par yoruba-inglés lo realizó DSFSI sobre el dataset `afriscience-mt`, orientado a contenido científico y de divulgación en lenguas africanas. No se detalla en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; el autor indica únicamente el origen del fine-tune y la atribución al grupo DSFSI.

La innovación técnica de esta ficha no reside en el modelo en sí, sino en el proceso de exportación y cuantización. Se usó `optimum-cli` con la tarea `text2text-generation-with-past` y `--no-post-process`, y la cuantización int8 se aplicó grafo a grafo con `onnxruntime.quantization.quantize_dynamic` (QInt8, per-channel, `EnableSubgraph=True`), manteniendo los pesos en archivos externos `int8/<graph>.onnx_data`. El script de cuantización está disponible en el repositorio `TigreGotico/linguonnx`. Cabe señalar que la verificación de paridad se realizó sobre solo 10 frases con coincidencia exacta de cadena (100% en greedy y beam=4 para fp32), una muestra que el propio autor advierte como insuficiente frente a una evaluación FLORES a escala.

## Capacidades

- Traducción unidireccional de yoruba a inglés, con etiquetas de idioma NLLB (`yor_Latn`, `eng_Latn`).
- Generación de texto seq2seq con decodificación greedy y beam search (beam=4 validado).
- Ejecución sobre ONNX Runtime, con soporte de caché (`use_cache=True`) para decodificación incremental.
- Inferencia en CPU viable gracias a la variante int8 de 1,9 GB.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo de traducción puro.
- Capacidad multilingüe limitada al par yoruba-inglés (el checkpoint base NLLB-200 soporta 200 idiomas, pero este fine-tune está especializado).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Traducción de documentación científica y divulgativa: el fine-tune se entrenó sobre `afriscience-mt`, por lo que es adecuado para traducir artículos y materiales de divulgación del yoruba al inglés en contextos académicos o de ONG.
- Localización de contenidos web y aplicaciones: integrable en pipelines de publicación para convertir textos en yoruba a inglés antes de su distribución internacional, usando la variante int8 en servidores sin GPU.
- Atención al ciudadano en servicios públicos: traducción de comunicaciones oficiales o formularios en yoruba a inglés para su procesamiento posterior por sistemas de gestión en inglés.
- Preservación y acceso a patrimonio cultural: traducción de textos históricos o literarios en yoruba para facilitar su consulta por investigadores que no dominan el idioma.
- Subtitulado y transcripción de medios: traducción de guiones o transcripciones en yoruba a inglés como paso previo a la generación de subtítulos.
- Investigación en PLN de bajos recursos: punto de partida o baseline para experimentos de traducción yoruba-inglés, con la ventaja de disponer de grafos ONNX listos para comparativas de cuantización.
- Despliegue en dispositivos de borde: la variante int8 de 1,9 GB permite ejecución en CPU en entornos con recursos limitados, útil para aplicaciones offline de traducción.

## Benchmarks y rendimiento

| Build | Tamano | chrF (FLORES-200 devtest, 50 frases) | Salidas iguales a fp32 |
|---|---|---|---|
| fp32 | 7,4 GB | 44,92 | 50/50 |
| int8 | 1,9 GB | 45,69 | 13/50 |

Paridad fp32 frente a PyTorch original (10 frases, coincidencia exacta):

| Decodificacion | fp32 (n=10) |
|---|---|
| greedy | 100% (10/10) |
| beam=4 | 100% (10/10) |

El autor advierte que la muestra de 10 frases es ruidosa y que una evaluación FLORES + chrF a mayor escala prevalece sobre estas cifras. No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada: no aplica estrictamente, ya que el modelo está pensado para ONNX Runtime y puede ejecutarse en CPU; en GPU, la variante int8 requiere aproximadamente 2-3 GB y la fp32 en torno a 8-10 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB para fp32 (RTX 3060, RTX 4060, T4) y con 4 GB o menos para int8 (GTX 1650, RTX 3050); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, tanto en fp32 como en int8.
- Opciones de despliegue: ONNX Runtime (con `optimum.onnxruntime.ORTModelForSeq2SeqLM`), linguonnx; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nllb_200_distilled_600m-yor-eng-onnx (este) | ~600 M | no disponible | yo → en | Apache-2.0 | ONNX fp32/int8 |
| dsfsi/nllb_200_distilled_600m-yor-eng | ~600 M | no disponible | yo → en | Apache-2.0 | PyTorch (safetensors) |
| facebook/nllb-200-distilled-600M | ~600 M | no disponible | 200 idiomas | CC-BY-NC-4.0 | PyTorch |
| facebook/m2m100_418M | ~418 M | no disponible | 100 idiomas | MIT | PyTorch |

La diferencia principal frente al checkpoint original de DSFSI es el formato (ONNX frente a PyTorch) y la disponibilidad de una variante int8. Frente a NLLB-200 distilled, este fine-tune está especializado en yoruba-inglés y tiene licencia Apache-2.0 (más permisiva que la CC-BY-NC del modelo base de Facebook). Frente a M2M100, el tamaño es mayor pero la especialización en el par yoruba-inglés es más concreta.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de NLLB-200, puede heredar sesgos de género, culturales y geográficos del corpus original.
- Riesgo de alucinación: existe, especialmente en la variante int8; el autor documenta un caso en el que int8 traduce "lánàá" (ayer) como "today" en lugar de "yesterday", incluso con beam=4.
- Limitaciones de contexto o idioma: solo traduce de yoruba a inglés; no soporta el sentido inverso ni otros idiomas, pese a que el modelo base NLLB-200 sí los cubre.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint original de DSFSI y del dataset `afriscience-mt`, no detallada en la model card.
- Caveat de evaluación: la paridad se midió sobre 10 frases y el chrF sobre 50; ambas muestras son pequeñas y no sustituyen una evaluación FLORES-200 completa.
- Requiere pasar explícitamente `forced_bos_token_id` con etiquetas `flores_code` (`eng_Latn`), ya que el `generation_config.json` no lo fija; un uso incorrecto produce salidas erróneas.
- En producción con int8, verificar referencias temporales y términos sensibles, dado el caso documentado de error en marcadores de tiempo.

## Enlaces

- HuggingFace: https://huggingface.co/TigreGotico/nllb_200_distilled_600m-yor-eng-onnx
- Modelo base: https://huggingface.co/dsfsi/nllb_200_distilled_600m-yor-eng
- Modelo original NLLB-200 distilled: https://huggingface.co/facebook/nllb-200-distilled-600M
- Repositorio de scripts de exportación y cuantización: https://github.com/TigreGotico/linguonnx
- DSFSI (Data Science for Social Impact): https://dsfsi.github.io/
