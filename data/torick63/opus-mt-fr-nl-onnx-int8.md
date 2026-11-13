# Torick63/opus-mt-fr-nl-onnx-int8

## Resumen

`Torick63/opus-mt-fr-nl-onnx-int8` es una conversión a ONNX con cuantización int8 del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-tc-bible-big-deu_eng_fra_por_spa-gmw`, desarrollado por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (proyecto OPUS-MT). El modelo original es un sistema multilingüe entrenado sobre el corpus bíblico y otros datos paralelos, y esta variante concreta se ha especializado en la dirección francés a neerlandés mediante el token de idioma objetivo `>>nld<<`.

La relevancia de esta ficha radica en su formato: al estar exportado con Optimum y cuantizado dinámicamente a int8 con ONNX Runtime, el paquete completo ocupa aproximadamente 332 MB y está pensado para traducción en dispositivo (on-device), sin dependencia de PyTorch ni de GPU dedicada. La arquitectura es un transformer encoder-decoder de tipo Marian, con decodificador fusionado que almacena una sola copia de los pesos y gestiona tanto el primer paso como los pasos con caché KV.

El modelo se publica bajo licencia Apache-2.0, heredada del modelo base, y su autoría de la conversión corresponde a Torick63. Es una opción realista para integrar traducción FR-NL en aplicaciones de escritorio, móviles o servicios ligeros donde el coste computacional y el tamaño del binario son críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Marian (OPUS-MT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámica por canal (ONNX Runtime `quantize_dynamic`, `per_channel=True`, `EnableSubgraph`) |
| Idiomas soportados | fr (entrada), nl (salida); modelo base multilingüe deu/eng/fra/por/spa-gmw |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`), SentencePiece (`source.spm`, `target.spm`), `vocab.json` |

## Arquitectura y entrenamiento

El modelo base es un MarianMT multilingüe del proyecto OPUS-MT, entrenado por el grupo de la Universidad de Helsinki sobre datos paralelos que incluyen el corpus bíblico y otras fuentes multilingües (la nomenclatura `tc-bible-big` indica el uso del corpus bíblico como componente principal). La arquitectura es un transformer encoder-decoder estándar con atención multi-cabeza, pensado para traducción secuencia a secuencia. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

La innovación técnica de esta variante concreta es la exportación a ONNX con Optimum usando la tarea `text2text-generation-with-past`, que genera un encoder y un decodificador fusionado (`decoder_model_merged.onnx`) capaz de manejar tanto el primer paso de decodificación como los pasos posteriores con caché KV mediante la entrada `use_cache_branch`. Esto evita duplicar los pesos del decodificador. Sobre ese grafo se aplica cuantización dinámica int8 por canal con `EnableSubgraph`, de modo que también se cuantizan las capas internas de las ramas del decodificador fusionado. El resultado son ficheros de aproximadamente 332 MB en total.

## Capacidades

- Traducción automática de francés a neerlandés, con el token de idioma objetivo `>>nld<<` antepuesto a la entrada.
- Generación de texto secuencia a secuencia mediante decodificación greedy (la configuración incluida en `generation_config.json`).
- Inferencia en CPU sin dependencia de PyTorch, gracias al formato ONNX y a ONNX Runtime.
- Ejecución en dispositivo (on-device) por el reducido tamaño del paquete (~332 MB).
- Soporte de caché KV en el decodificador fusionado para acelerar la generación paso a paso.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción integrada en aplicaciones de escritorio: el paquete ONNX int8 de ~332 MB puede empaquetarse dentro de una aplicación de escritorio o un plugin de navegador para traducir contenido FR a NL sin conexión a un servicio externo.
- Traducción en dispositivos móviles o embebidos: al no requerir GPU ni PyTorch, el modelo puede desplegarse con ONNX Runtime en entornos con recursos limitados, ofreciendo traducción FR-NL local con latencia aceptable para frases cortas.
- Preprocesado multilingüe en pipelines de datos: útil para normalizar documentación o corpus que mezclan francés y neerlandés antes de tareas posteriores de análisis, indexación o búsqueda.
- Atención al cliente bilingüe en Bélgica o regiones fronterizas: traducción en tiempo real de mensajes de usuarios francófonos a neerlandés para agentes o sistemas de ticketing, con despliegue local para cumplir requisitos de privacidad.
- Traducción de documentación técnica o administrativa: para volcar manuales, formularios o avisos del francés al neerlandés en flujos batch, donde el coste por token es mínimo al ejecutarse en CPU.
- Prototipado y evaluación de sistemas de traducción: al ser una conversión ONNX reproducible desde un modelo base público, sirve como referencia ligera para comparar calidad y latencia frente a otros motores de traducción en entornos sin GPU.
- Traducción en el borde (edge computing) para kioscos o dispositivos de señalización: el tamaño reducido permite incluirlo en imágenes de contenedor pequeñas o firmware con almacenamiento limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que, con decodificación greedy, los ficheros int8 producen la misma salida que el modelo PyTorch original en 25 de 30 frases cortas de prueba, con diferencias de redacción en las 5 restantes atribuibles a la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en CPU; el paquete completo ocupa ~332 MB, por lo que la huella en memoria es del orden de cientos de MB.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU mediante ONNX Runtime. Cualquier GPU compatible con ONNX Runtime (por ejemplo, series RTX o A100/H100) podría ejecutarlo, pero no se documentan requisitos ni optimizaciones para GPU.
- ¿Cabe en GPU de consumo? Sí, por tamaño, aunque el caso de uso declarado es on-device en CPU.
- Opciones de despliegue: ONNX Runtime (incluido el modo CPU), exportación con Optimum; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que no son adecuados para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Torick63/opus-mt-fr-nl-onnx-int8 | no disponible | no disponible | ONNX int8 | Apache-2.0 | Conversión ligera para on-device, FR→NL |
| Helsinki-NLP/opus-mt-tc-bible-big-deu_eng_fra_por_spa-gmw | no disponible | no disponible | PyTorch (safetensors/bin) | Apache-2.0 | Modelo base multilingüe original |
| Helsinki-NLP/opus-mt-fr-nl | no disponible | no disponible | PyTorch | Apache-2.0 | Modelo OPUS-MT bilingüe FR→NL (referencia histórica del proyecto) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización int8 introduce diferencias de redacción: en las pruebas del autor, 5 de 30 frases cortas difirieron del modelo PyTorch original, por lo que no es una conversión bit a bit equivalente.
- Es un modelo especializado en una única dirección (FR→NL) y requiere anteponer el token `>>nld<<`; un uso incorrecto del token puede degradar la calidad.
- El modelo base está entrenado sobre corpus multilingües que incluyen texto bíblico, lo que puede introducir sesgos de dominio y un registro poco adecuado para ciertos contextos (lenguaje coloquial, jerga técnica muy específica).
- No se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinación; en traducción automática el riesgo se manifiesta como mistraducciones o invenciones de contenido en frases ambiguas.
- No hay información sobre la longitud máxima de secuencia soportada; frases o documentos largos pueden requerir segmentación previa.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene conservar la atribución al proyecto OPUS-MT y al autor de la conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de su calidad más allá de la prueba interna del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Torick63/opus-mt-fr-nl-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-bible-big-deu_eng_fra_por_spa-gmw
- Proyecto OPUS-MT (Universidad de Helsinki): https://github.com/Helsinki-NLP/OPUS-MT
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- ONNX Runtime (cuantización dinámica): https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
