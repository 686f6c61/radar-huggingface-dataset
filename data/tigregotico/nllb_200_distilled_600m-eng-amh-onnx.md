# TigreGotico/nllb_200_distilled_600m-eng-amh-onnx

## Resumen

Este repositorio contiene una exportación a ONNX del modelo `dsfsi/nllb_200_distilled_600m-eng-amh`, un fine-tune de `facebook/nllb-200-distilled-600M` especializado en traducción automática unidireccional de inglés (`eng_Latn`) a amhárico (`amh_Ethi`). El modelo original fue entrenado por el grupo DSFSI (Data Science for Social Impact) de la Universidad de Pretoria sobre el conjunto de datos `afriscience-mt`, y esta exportación, mantenida por TigreGotico, se limita a convertir los pesos a formato ONNX en precisión fp32 e int8 dinámica.

La relevancia de esta ficha radica en que el amhárico es un idioma de bajos recursos dentro del ecosistema de modelos de traducción, y disponer de una versión ONNX optimizada para CPU permite desplegar traducción inglés-amhárico en entornos sin GPU, algo poco habitual en la familia NLLB. El checkpoint base es un transformer encoder-decoder de tipo M2M-100 con aproximadamente 600 millones de parámetros, destilado del NLLB-200 completo, y la exportación mantiene la arquitectura seq2seq original con caché de atención.

El repositorio ocupa 15,1 GB e incluye tanto los grafos fp32 (~7 GB) como los grafos int8 (~1,9 GB), lo que lo convierte en una opción práctica para pipelines de traducción en producción donde el tamaño y la latencia en CPU son factores críticos. La licencia Apache-2.0 heredada del modelo original facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100, NLLB-200 destilado) |
| Parametros totales | ~600 M (heredados del checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (NLLB-200 soporta secuencias de hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | fp32, int8 dinamica per-channel (ONNX Runtime) |
| Idiomas soportados | ingles (en / eng_Latn), amharico (am / amh_Ethi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data` externo) |
| Direccion de traduccion | Ingles -> amharico (unidireccional) |
| Tamano fp32 | ~7 GB (repo completo: 15,1 GB) |
| Tamano int8 | 1,9 GB |
| Runtime | ONNX Runtime (probado con 1.31.1) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder derivado de M2M-100 y destilado del NLLB-200 completo, con unos 600 millones de parámetros. El fine-tune de DSFSI se realizó sobre el dataset `afriscience-mt`, orientado a contenido científico en lenguas africanas, partiendo de `facebook/nllb-200-distilled-600M`. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible en la documentación proporcionada.

La exportación a ONNX se realizó con `optimum-cli export onnx --task text2text-generation-with-past --no-post-process`, generando grafos separados para encoder, decoder y decoder con caché KV. La cuantización int8 se aplicó grafo a grafo con `onnxruntime.quantization.quantize_dynamic` (QInt8, per-channel, `reduce_range=False`, `EnableSubgraph=True`), manteniendo los pesos en un fichero externo `.onnx_data` por grafo. El script de cuantización está en el repositorio `TigreGotico/linguonnx`.

## Capacidades

- Traducción automática unidireccional de inglés a amhárico, con etiquetas de idioma NLLB (`eng_Latn` como origen, `amh_Ethi` como destino forzado).
- Generación de texto seq2seq con decodificación greedy o beam search (la model card valida beam=4).
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Soporte de caché de atención (`use_cache=True`) para acelerar la generación.
- Cuantización int8 con pérdida mínima de calidad (chrF 36,94 frente a 37,28 en fp32 sobre FLORES-200).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un modelo de traducción puro.
- Capacidad multilingüe limitada a los dos idiomas del fine-tune (inglés y amhárico).

## Casos de uso

- Traducción de documentación técnica al amhárico: el modelo traduce textos de dominio general y científico, adecuado para localizar manuales, guías o artículos hacia una lengua con pocos recursos.
- Servicios de traducción en CPU sin GPU: gracias a los grafos int8 de 1,9 GB, se puede desplegar en servidores modestos o contenedores ligeros con ONNX Runtime, reduciendo costes de infraestructura.
- Preprocesamiento en pipelines de NLP multilingüe: traducción de corpus ingleses a amhárico antes de tareas posteriores (análisis, indexación, búsqueda) en proyectos de investigación sobre lenguas africanas.
- Atención al ciudadano en Etiopía: traducción de mensajes y formularios administrativos del inglés al amhárico en portales públicos, con licencia Apache-2.0 que permite uso institucional.
- Localización de contenido educativo: traducción de materiales de formación o divulgación científica al amhárico, alineado con el dominio `afriscience-mt` del entrenamiento.
- Integración en aplicaciones móviles o de escritorio offline: el tamaño reducido del build int8 permite empaquetar el modelo en aplicaciones con ONNX Runtime y funcionar sin conexión.
- Traducción por lotes en pipelines de datos: procesamiento de grandes volúmenes de frases en inglés con decodificación greedy para maximizar throughput.

## Benchmarks y rendimiento

La model card reporta una evaluación de paridad y una comparativa int8 vs fp32 sobre FLORES-200 (primeras 50 frases de devtest, `eng_Latn` a `amh_Ethi`, decodificación greedy).

| Build | Tamano | chrF (FLORES-200) | Salidas identicas a fp32 |
|---|---|---|---|
| fp32 | 7,4 GB | 37,28 | 50/50 |
| int8 | 1,9 GB | 36,94 | 22/50 |

Paridad fp32 vs PyTorch original (10 frases de dominio general, exact match):

| Decodificacion | fp32 (n=10) |
|---|---|
| greedy | 100% (10/10) |
| beam=4 | 100% (10/10) |

El autor advierte que la muestra de n=10 es pequeña y ruidosa, y que una evaluación a escala FLORES con chrF es más fiable. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable en un modelo de traducción especializado.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica estrictamente, ya que el modelo está pensado para CPU vía ONNX Runtime; en GPU, el build int8 requeriría del orden de 2-3 GB y el fp32 en torno a 8-9 GB, aunque estas cifras no están confirmadas en la model card.
- GPU recomendadas: no especificadas; el modelo está optimizado para CPU. Cualquier GPU con suficiente memoria para el grafo fp32 o int8 podría ejecutarlo a través de ONNX Runtime con el provider CUDA.
- Cabe en GPU consumer: el build int8 (1,9 GB) es apto para GPUs consumer con 4 GB o más; el fp32 (~7 GB) requiere GPUs con 8 GB o más.
- Opciones de despliegue: ONNX Runtime (principal, probado con 1.31.1), `optimum.onnxruntime.ORTModelForSeq2SeqLM`, y el runtime `linguonnx` del mismo autor. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con arquitecturas seq2seq de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| TigreGotico/nllb_200_distilled_600m-eng-amh-onnx | ~600 M | en -> am | no disponible | Apache-2.0 | ONNX (fp32/int8) | Exportacion ONNX del fine-tune de DSFSI |
| dsfsi/nllb_200_distilled_600m-eng-amh | ~600 M | en -> am | no disponible | Apache-2.0 | PyTorch (safetensors/bin) | Modelo original en PyTorch |
| facebook/nllb-200-distilled-600M | ~600 M | 200 idiomas | 512 tokens (NLLB) | CC-BY-NC-4.0 | PyTorch | Modelo base multilingue, licencia no comercial |
| facebook/m2m100_418M | ~418 M | 100 idiomas | 512 tokens (M2M-100) | MIT | PyTorch | Alternativa multilingue mas ligera, menor calidad en amharico |

La ventaja principal de esta exportación frente al modelo original es el formato ONNX con cuantización int8, que reduce el tamaño de 7,4 GB a 1,9 GB con una pérdida de chrF de solo 0,34 puntos. Frente a NLLB-200 completo, la licencia Apache-2.0 del fine-tune permite uso comercial, algo que el modelo base de Meta no autoriza.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de inglés a amhárico; no soporta la dirección inversa ni otros pares de idiomas.
- Requiere pasar explícitamente `forced_bos_token_id` con la etiqueta `amh_Ethi`; no está fijado en `generation_config.json`, lo que puede provocar errores si se usa sin configuración manual.
- La evaluación de paridad se basa en solo 10 frases; el propio autor advierte que es una señal inicial, no un benchmark fiable.
- La cuantización int8 reduce la coincidencia exacta con fp32 al 44% (22/50), aunque la calidad global medida por chrF se mantiene.
- Riesgo de alucinación y de traducciones literales en dominios muy especializados no cubiertos por `afriscience-mt`.
- Sesgos potenciales heredados del corpus de entrenamiento, no documentados en la model card.
- La longitud de contexto no está especificada en la documentación; se asume la del NLLB-200 base, pero no está confirmada.
- El repositorio es grande (15,1 GB) por incluir fp32 e int8; conviene descargar solo la subcarpeta `int8` si se busca el build ligero.
- Aunque la licencia es Apache-2.0, conviene verificar la procedencia del dataset `afriscience-mt` para usos comerciales sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TigreGotico/nllb_200_distilled_600m-eng-amh-onnx
- Modelo base: https://huggingface.co/dsfsi/nllb_200_distilled_600m-eng-amh
- Modelo original de Meta: https://huggingface.co/facebook/nllb-200-distilled-600M
- Repositorio de cuantizacion linguonnx: https://github.com/TigreGotico/linguonnx
- Grupo DSFSI: https://dsfsi.github.io/
- Documentacion de Optimum ONNX: https://huggingface.co/docs/optimum/exporters/onnx/usage_guides/export_a_model
- ONNX Runtime quantization: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
