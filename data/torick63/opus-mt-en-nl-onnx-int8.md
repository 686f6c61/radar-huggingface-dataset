# Torick63/opus-mt-en-nl-onnx-int8

## Resumen

`Torick63/opus-mt-en-nl-onnx-int8` es una exportación a ONNX con cuantización dinámica int8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-nl`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce de inglés a neerlandés y está pensado para inferencia en dispositivo (on-device) o en entornos con recursos limitados, donde cargar un runtime de PyTorch completo resulta excesivo.

La conversión mantiene la arquitectura Marian original (transformer encoder-decoder) pero reorganiza el decodificador en un único grafo "merged" que gestiona tanto el primer paso de generación como los pasos con caché KV mediante la entrada `use_cache_branch`, de modo que los pesos del decodificador se almacenan una sola vez. Sobre ese grafo se aplica cuantización dinámica de pesos int8 con `quantize_dynamic` de ONNX Runtime, incluyendo `EnableSubgraph` para cuantizar también las capas internas de las ramas del decodificador fusionado.

El resultado ocupa aproximadamente 152 MB en total y se distribuye bajo licencia Apache-2.0, la misma del modelo base. Es relevante para quien necesite un traductor en→nl ligero, determinista con decodificación greedy y desplegable con ONNX Runtime sin dependencias de frameworks de deep learning pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica de pesos (ONNX Runtime `quantize_dynamic`) |
| Idiomas soportados | inglés (en) y neerlandés (nl) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`), SentencePiece (`source.spm`, `target.spm`), `vocab.json`, `config.json`, `generation_config.json` |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-en-nl` es un transformer encoder-decoder de la familia Marian, entrenado por el grupo OPUS-MT de la Universidad de Helsinki (Tiedemann y Thottingal, 2020) sobre corpus paralelos del proyecto OPUS. Esta ficha no dispone de datos sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información corresponde al modelo original y no se detalla en la model card de la conversión.

La innovación de esta versión es puramente de despliegue: exportación con Optimum usando la tarea `text2text-generation-with-past`, fusión del decodificador en un solo grafo con entrada booleana `use_cache_branch` para evitar duplicar pesos, y cuantización dinámica int8 con `EnableSubgraph` para alcanzar los ~152 MB totales. Según el autor, con decodificación greedy los ficheros int8 producen la misma salida que el modelo PyTorch original en 26 de 30 frases cortas de prueba; el resto difiere principalmente en la formulación por efecto de la cuantización.

## Capacidades

- Traducción automática unidireccional inglés → neerlandés.
- Generación de texto condicionada a la tarea de traducción (seq2seq).
- Inferencia con caché KV en el decodificador fusionado para acelerar la generación token a token.
- Tokenización SentencePiece independiente para origen y destino.
- Ejecución con ONNX Runtime, sin necesidad de PyTorch en producción.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta visión, audio ni modo "thinking".
- Capacidades multilingües limitadas estrictamente al par en→nl.

## Casos de uso

- Traducción en dispositivo o edge: el tamaño de ~152 MB permite empaquetar el modelo en aplicaciones móviles o de escritorio con ONNX Runtime, traduciendo texto en→nl sin conexión a un servidor.
- Preprocesado en pipelines de datos: traducir grandes volúmenes de texto en inglés a neerlandés en lote antes de indexar o analizar, aprovechando la baja huella de memoria del modelo int8.
- Servicio de traducción de bajo coste: desplegar un endpoint HTTP ligero con ONNX Runtime para traducciones cortas en→nl donde no se requiere un modelo de gran tamaño.
- Localización de interfaces y documentación: traducir cadenas de UI, mensajes de error o textos de ayuda de aplicaciones con un modelo determinista y rápido.
- Traducción de subtítulos o transcripciones: procesar segmentos cortos de texto en inglés a neerlandés en tiempo casi real dentro de un pipeline de vídeo o audio.
- Filtrado y moderación multilingüe: normalizar contenido en inglés a neerlandés para aplicar reglas o clasificadores que operan sobre el idioma de destino.
- Prototipado e investigación en traducción automática: servir como baseline ligero y reproducible para comparar con modelos neuronales de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una comprobación cualitativa: con decodificación greedy, las salidas int8 coinciden con el modelo PyTorch original en 26 de 30 frases cortas de prueba.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~152 MB en int8, cabe holgadamente en menos de 1 GB de memoria, incluyendo buffers de runtime y caché KV.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100, H100 ni RTX 4090. Una GPU integrada o una GTX 1650 en adelante es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JavaScript), con soporte de ejecución en CPU, CUDA, DirectML o CoreML según el proveedor de ejecución configurado.
- Latencia y throughput: no disponibles de forma numérica; por el tamaño del modelo y la cuantización int8 se espera latencia de milisegundos por frase corta en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Torick63/opus-mt-en-nl-onnx-int8 | no disponible | no disponible | en→nl | Apache-2.0 | ONNX int8 | Conversión cuantizada, ~152 MB |
| Helsinki-NLP/opus-mt-en-nl | no disponible | no disponible | en→nl | Apache-2.0 | PyTorch/safetensors | Modelo base original, sin cuantizar |
| Otros modelos OPUS-MT en→nl | no disponible | no disponible | en→nl | Apache-2.0 | variable | Misma familia Marian de la Universidad de Helsinki |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de traducción frente a alternativas de mayor tamaño como NLLB o modelos comerciales.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de inglés a neerlandés; no soporta la dirección inversa ni otros pares de idiomas.
- Calidad limitada por el modelo base Marian de tamaño pequeño; puede producir traducciones literales o perder matices en textos técnicos, literarios o con jerga.
- La cuantización int8 introduce pequeñas variaciones de salida respecto al modelo original (4 de 30 frases en la prueba del autor), lo que puede afectar a evaluaciones estrictas de reproducibilidad.
- Riesgo de alucinación y de traducciones incorrectas en frases ambiguas, nombres propios o terminología especializada.
- Sin datos publicados sobre sesgos demográficos o culturales; el corpus OPUS puede reflejar sesgos de los textos paralelos de origen.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución al grupo OPUS-MT de la Universidad de Helsinki.
- No apto para tareas de razonamiento, generación libre, código o agentes; su uso está restringido a traducción.
- La longitud de contexto no está documentada en la model card; para textos largos conviene segmentar en frases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Torick63/opus-mt-en-nl-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-nl
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.wmt-1.77/
- Proyecto OPUS: https://opus.nlpl.eu/
- Documentación de Optimum: https://huggingface.co/docs/optimum
- Documentación de ONNX Runtime: https://onnxruntime.ai/
