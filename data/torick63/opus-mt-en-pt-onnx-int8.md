# Torick63/opus-mt-en-pt-onnx-int8

## Resumen

`Torick63/opus-mt-en-pt-onnx-int8` es una conversión a ONNX con cuantización int8 del modelo de traducción `Helsinki-NLP/opus-mt-tc-big-en-pt` (revisión `9f2863d`), desarrollado por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de la conversión es el usuario Torick63, y el objetivo es claro: disponer de traducción inglés→portugués ejecutable en dispositivo (*on-device*) con un peso total de unos 351 MB, sin necesidad de GPU ni de framework de deep learning completo, solo ONNX Runtime.

El modelo base es un Marian NMT de arquitectura "big": 16 cabezas de atención y `d_model` de 1024, lo que lo sitúa por encima de los opus-mt clásicos en tamaño. Es un modelo multilingüe en el lado destino, de modo que el portugués europeo o brasileño se selecciona mediante un token de inicio en la entrada (`>>por<<` y `>>pob<<` respectivamente). La conversión usa Optimum con la tarea `text2text-generation-with-past`, generando un encoder y un decoder fusionado que cubre tanto el primer paso como los pasos con caché KV (`use_cache_branch`), de forma que los pesos del decoder se almacenan una sola vez.

Su relevancia práctica es la de un traductor especializado, pequeño y desplegable en CPU, útil para localización de software, pipelines de datos y aplicaciones móviles o edge donde no tiene sentido cargar un modelo generativo grande. No es un modelo conversacional ni un LLM: no razona, no hace tool calling y no genera código; solo traduce.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian NMT (16 cabezas de atención, d_model 1024) |
| Parametros totales | no disponible en la información proporcionada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (los modelos Marian de OPUS-MT trabajan habitualmente con secuencias cortas; el autor no especifica el límite) |
| Tipos de cuantizacion | int8 dinámica de pesos (ONNX Runtime `quantize_dynamic` con `EnableSubgraph`); no se publican variantes fp32, fp16 ni int4 |
| Idiomas soportados | entrada en inglés (en); salida en portugués europeo (`>>por<<`) y portugués brasileño (`>>pob<<`) |
| Licencia | Apache-2.0 (tanto el modelo base como la conversión) |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`), SentencePiece (`source.spm`, `target.spm`) y `vocab.json` |
| Tamano del repositorio | 0,3 GB (≈351 MB según la model card) |
| Pipeline | `translation` |
| Herramienta de exportacion | Hugging Face Optimum, tarea `text2text-generation-with-past` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder-decoder de traducción automática neuronal con atención multi-cabeza (16 cabezas) y dimensionalidad de modelo 1024, implementado en Marian. La conversión a ONNX mantiene dos grafos: un encoder y un decoder fusionado que resuelve tanto la primera pasada como las pasadas con caché de claves y valores mediante la entrada booleana `use_cache_branch`. Esta fusión evita duplicar los pesos del decoder en disco, algo relevante cuando el objetivo es un artefacto pequeño para inferencia en CPU.

La innovación técnica de esta ficha no está en el entrenamiento sino en la compresión: cuantización dinámica int8 de los pesos con `quantize_dynamic` de ONNX Runtime, aplicando `EnableSubgraph` para que también se cuantizen las capas internas de las ramas del decoder fusionado. El autor señala explícitamente que las embeddings de palabras no se reducen con la cuantización dinámica, lo que explica parte del tamaño final. Sobre los datos de entrenamiento del modelo original (número de tokens, composición del corpus, uso de RLHF o DPO) no hay información en la documentación proporcionada; OPUS-MT se entrena sobre corpus paralelos del ecosistema OPUS, pero el desglose concreto no está disponible aquí.

## Capacidades

- Traducción de texto inglés→portugués, con variante europea (`>>por<<`) y brasileña (`>>pob<<`) seleccionable mediante token de prefijo en la entrada.
- Traducción frase a frase con decodificación greedy; el autor reporta equivalencia de salida con el modelo PyTorch original en 29 de 30 frases cortas de prueba.
- Ejecución en CPU con ONNX Runtime, sin dependencia de PyTorch ni de GPU.
- Gestión de caché KV en el decoder fusionado, lo que acelera la generación token a token frente a recalcular el decoder completo en cada paso.
- Tokenización SentencePiece incluida en el repositorio (`source.spm`, `target.spm`), por lo que el artefacto es autocontenido.
- No soporta tool calling ni function calling.
- No incorpora modo de razonamiento (*thinking*), agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio ni generación de código.
- No es un modelo multilingüe general: solo cubre el par en→pt.

## Casos de uso

- Localización de software y documentación técnica: traducción de cadenas de interfaz y ficheros de recursos de inglés a portugués europeo o brasileño, con un artefacto de 351 MB que puede ejecutarse en el mismo pipeline de CI sin GPU.
- Traducción on-device en aplicaciones móviles o de escritorio: al ser ONNX int8 y ejecutable con ONNX Runtime en CPU, permite ofrecer traducción integrada sin enviar el texto a un servicio externo, lo que simplifica el cumplimiento de privacidad.
- Preprocesado de corpus para investigación: traducción masiva de textos en inglés a portugués dentro de un pipeline de datos, con throughput alto en CPU y sin coste de GPU por token.
- Atención al cliente con base en inglés y clientes lusohablantes: traducción de respuestas y macros de soporte generadas en inglés hacia portugués, distinguiendo registro europeo y brasileño según el mercado.
- Subtitulado y traducción de contenidos audiovisuales: el modelo trabaja bien a nivel de frase, idóneo para traducir segmentos cortos ya alineados procedentes de un sistema de ASR.
- Comercio electrónico internacional: traducción de fichas de producto, descripciones y correos transaccionales del inglés al portugués de Portugal o de Brasil, con dos variantes lingüísticas cubiertas por el mismo modelo.
- Traducción de correspondencia y actas en entornos con recursos limitados: despliegue en servidores modestos o en un contenedor pequeño, donde un modelo generativo grande no sería viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (BLEU, MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación aportado por el autor es una comparación cualitativa frente al modelo original:

| Prueba | Referencia | Resultado reportado |
|---|---|---|
| Equivalencia de salida con decodificación greedy | Modelo PyTorch original `Helsinki-NLP/opus-mt-tc-big-en-pt` | Salida idéntica en 29 de 30 frases cortas de prueba; en el resto difiere principalmente en la formulación por efecto de la cuantización |
| Calidad de traducción (BLEU, chrF, COMET) | Corpus de referencia | no disponible |

## Requisitos de hardware

- VRAM: no requiere GPU; el artefacto completo ocupa ≈351 MB en disco y la inferencia int8 puede ejecutarse en CPU con una huella de memoria del orden de cientos de MB (cifra exacta de RSS no disponible).
- GPU recomendadas: no aplica para el caso de uso previsto; puede ejecutarse en cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) si se necesita mayor throughput, pero el autor no publica configuraciones probadas.
- Cabe en GPU de consumo: sí, con enorme margen (RTX 3060, RTX 4090, etc.), aunque su diseño está orientado a CPU.
- Cabe en hardware de gama baja: sí, es apto para dispositivos edge y móviles por tamaño y por el uso de ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), Optimum con `ORTModelForSeq2SeqLM`, y servidores de inferencia compatibles con ONNX. No se distribuyen pesos en formato GGUF, por lo que no es directamente usable en llama.cpp u Ollama; vLLM y TGI no están orientados a este tipo de modelo Marian.
- Latencia y throughput: no disponible en la información proporcionada; no se publican mediciones de tokens por segundo ni de latencia por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Torick63/opus-mt-en-pt-onnx-int8 | no disponible | no disponible | en→pt (EU/BR) | Apache-2.0 | ONNX int8 | ≈351 MB, orientado a CPU y edge |
| Helsinki-NLP/opus-mt-tc-big-en-pt (modelo base) | no disponible | no disponible | en→pt (EU/BR) | Apache-2.0 | PyTorch (safetensors/bin) | Requiere PyTorch; mayor peso en disco; referencia de calidad del modelo cuantizado |
| Helsinki-NLP/opus-mt-en-pt (opus-mt clásico) | no disponible | no disponible | en→pt | Apache-2.0 (según model card del autor original) | PyTorch | Arquitectura más pequeña, sin token de variante regional; datos de calidad comparativa no disponibles |
| NLLB-200-distilled-600M (Meta) | 600 M | no disponible en esta ficha | multilingüe (200 lenguas) | CC-BY-NC-4.0 (la versión distilled; verificar) | PyTorch | Mucho mayor, cobertura multilingüe amplia, pero licencia no comercial y requisitos de recursos superiores |

Los datos de rendimiento comparativo entre estas alternativas no están disponibles en la información proporcionada; la comparación se limita a arquitectura, tamaño, licencia y formato.

## Limitaciones y advertencias

- Solo traduce en→pt; no cubre pt→en ni ningún otro par, pese a que el nombre del repositorio pueda sugerir un uso más amplio.
- La variante regional no es automática: si no se antepone `>>por<<` o `>>pob<<`, la salida puede mezclar convenciones de portugués europeo y brasileño.
- La cuantización int8 introduce deriva en la formulación: el propio autor documenta diferencias de redacción en 1 de cada 30 frases de prueba. En textos largos o dominios especializados esa divergencia puede aumentar y no está cuantificada.
- Riesgo de alucinación en el sentido propio de la traducción automática: omisiones de segmentos, repeticiones y traducciones plausibles pero infieles en frases ambiguas o con terminología fuera de dominio. No hay evaluación publicada de fidelidad.
- No se especifica la longitud máxima de secuencia soportada; los modelos Marian suelen degradarse con entradas muy largas, por lo que conviene segmentar documentos en frases o párrafos cortos.
- Sin datos publicados sobre sesgos de género o culturales en la dirección en→pt para esta conversión concreta.
- Al ser un modelo de traducción puro no dispone de instrucciones, system prompt ni control de estilo; no se le puede pedir "traduce en tono formal" ni mantener una conversación.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y atribución al grupo de Helsinki (OPUS-MT, Tiedemann & Thottingal, 2020) y al autor de la conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en octubre de 2026: no hay evidencia de uso en producción ni validación por terceros. Conviene evaluar con un corpus propio antes de desplegarlo.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; todos los enlaces encontrados eran contenido no relacionado y se han descartado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Torick63/opus-mt-en-pt-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt
- Repositorio de Optimum (exportación ONNX): https://github.com/huggingface/optimum
- Documentación de cuantización de ONNX Runtime: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
- Paper de OPUS-MT (Tiedemann & Thottingal, 2020): https://arxiv.org/abs/2008.11216
