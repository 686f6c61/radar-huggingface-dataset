# Torick63/opus-mt-fr-es-onnx-int8

## Resumen

`Torick63/opus-mt-fr-es-onnx-int8` es una conversión a ONNX con cuantización dinámica int8 del modelo de traducción automática `Helsinki-NLP/opus-mt-fr-es`, desarrollado por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT). El modelo original es un transformer encoder-decoder de arquitectura Marian, entrenado para traducción francés-español, y esta versión lo empaqueta en dos grafos ONNX (encoder y decoder fusionado con caché KV) de aproximadamente 166 MB en total, lo que lo hace adecuado para inferencia en dispositivos con recursos limitados.

El problema que resuelve es doble: por un lado, ofrece traducción directa fr→es sin depender de servicios en la nube; por otro, la exportación a ONNX con cuantización int8 permite ejecutar el modelo en CPU y en hardware modesto con ONNX Runtime, eliminando la necesidad de PyTorch en producción. La conversión utiliza Optimum con la tarea `text2text-generation-with-past` y un decoder fusionado que almacena los pesos una sola vez, gestionando tanto el primer paso de decodificación como los pasos con caché mediante la entrada `use_cache_branch`.

La relevancia actual radica en su tamaño reducido y su licencia Apache-2.0, que facilita el despliegue comercial en aplicaciones de traducción embebida, extensiones de navegador o pipelines de localización. No obstante, se trata de un modelo base de traducción sin instrucciones, sin soporte de tool calling ni capacidades de razonamiento general, y con un vocabulario y dominio acotados al par de idiomas fr-es.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) exportado a ONNX |
| Parámetros totales | no disponible (repo de 0,2 GB; ficheros ONNX ~166 MB en int8) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámica, per channel (ONNX Runtime `quantize_dynamic`, `per_channel=True`, `EnableSubgraph`) |
| Idiomas soportados | francés (fr) y español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`), SentencePiece (`source.spm`, `target.spm`), `vocab.json` |

## Arquitectura y entrenamiento

El modelo subyacente es `Helsinki-NLP/opus-mt-fr-es` (revisión `f4263af`), un transformer encoder-decoder de la familia Marian entrenado por el grupo OPUS-MT de la Universidad de Helsinki (Tiedemann & Thottingal, 2020) sobre corpus paralelos multilingües del proyecto OPUS. La arquitectura Marian es una variante eficiente del transformer original orientada a traducción automática, con tokenización SentencePiece y un vocabulario compartido entre origen y destino.

Esta versión concreta no reentrena el modelo: solo realiza la exportación a ONNX mediante Optimum con la tarea `text2text-generation-with-past`, generando un encoder y un decoder fusionado que maneja tanto el primer paso como los pasos con caché KV a través de la entrada `use_cache_branch`, de modo que los pesos del decoder se almacenan una sola vez. Sobre ese grafo se aplica cuantización dinámica int8 por canal con `quantize_dynamic` de ONNX Runtime, incluyendo `EnableSubgraph` para cuantizar también las capas internas de las ramas del decoder fusionado. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Traducción automática directa francés → español, tanto de frases cortas como de párrafos.
- Generación de texto condicionada a la secuencia de entrada (seq2seq), con decodificación greedy según la configuración incluida.
- Tokenización SentencePiece con modelos de origen y destino separados y vocabulario compartido.
- Inferencia en CPU y en dispositivos de borde gracias al formato ONNX int8.
- Ejecución con caché KV en el decoder fusionado, lo que acelera la generación paso a paso.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo thinking.
- Capacidades multilingües limitadas exclusivamente al par fr-es.

## Casos de uso

- Traducción embebida en aplicaciones de escritorio o móviles: el modelo puede integrarse mediante ONNX Runtime en una app local para traducir textos fr→es sin conexión, gracias a sus ~166 MB en int8 y a la ausencia de dependencia de PyTorch.
- Extensiones de navegador para traducción de páginas: el tamaño reducido y la ejecución en CPU permiten traducir fragmentos de texto seleccionados o páginas completas por bloques dentro del propio navegador.
- Pipelines de localización de documentación: se puede usar como primer paso de traducción automática de manuales y textos técnicos del francés al español, con revisión humana posterior, aprovechando la licencia Apache-2.0 para uso comercial.
- Procesamiento por lotes en servidores sin GPU: ONNX Runtime en CPU permite traducir grandes volúmenes de textos (por ejemplo, reseñas o tickets) en servidores estándar, con un coste de infraestructura bajo.
- Preprocesamiento en sistemas de atención al cliente: traducción de mensajes entrantes en francés a español antes de pasarlos a un clasificador o a un agente conversacional entrenado en español.
- Traducción en dispositivos IoT o de bajo consumo: al ser un modelo pequeño y cuantizado, puede desplegarse en hardware con recursos muy limitados para subtitulado o señalización bilingüe.
- Generación de corpus paralelos: uso del modelo para producir traducciones automáticas a gran escala que luego se filtren y se usen como datos de entrenamiento o evaluación de otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que, con decodificación greedy, los ficheros int8 producen la misma salida que el modelo PyTorch original en 27 de 30 frases cortas de prueba, con diferencias de redacción en las tres restantes atribuidas a la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo int8 ocupa aproximadamente 166 MB de pesos, por lo que cabría en cualquier GPU con más de 1 GB de memoria libre, aunque no se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o una GPU integrada pueden ejecutar el modelo, pero el cuello de botella será la latencia de los kernels ONNX más que la memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), Optimum con backend ONNX, y potencialmente otros runtimes compatibles con ONNX. No se proporcionan ficheros GGUF, por lo que llama.cpp u Ollama no son aplicables directamente sin conversión adicional.
- Latencia y throughput estimados: no disponibles. La model card no incluye mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Torick63/opus-mt-fr-es-onnx-int8 | no disponible (~166 MB int8) | no disponible | fr, es | Apache-2.0 | ONNX int8 | Hugging Face |
| Helsinki-NLP/opus-mt-fr-es | no disponible | no disponible | fr, es | Apache-2.0 | PyTorch (safetensors/bin) | Hugging Face |
| Helsinki-NLP/opus-mt-en-es | no disponible | no disponible | en, es | Apache-2.0 | PyTorch | Hugging Face |
| Facebook/M2M100-418M | 418 M | 1024 tokens (típico) | 100 idiomas | MIT | PyTorch | Hugging Face |

La comparación directa más relevante es con el modelo base `Helsinki-NLP/opus-mt-fr-es`, del que esta versión es una conversión cuantizada: misma calidad esperada salvo pequeñas diferencias por cuantización, pero con un tamaño mucho menor y sin dependencia de PyTorch. Frente a modelos multilingües como M2M100, esta conversión es mucho más pequeña y rápida, pero solo cubre el par fr-es y no ofrece la flexibilidad de un modelo multilingüe.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado sobre corpus OPUS, puede heredar sesgos de género y dominio de esos datos.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede generar traducciones plausibles pero incorrectas, especialmente en frases ambiguas o dominios especializados.
- Limitación documentada: la model card indica que, al igual que el modelo original, a veces interpreta el francés "je …rais plus" como "ya no" (con omisión del "ne"), lo que puede producir errores de sentido.
- Limitaciones de contexto e idioma: solo soporta fr→es; no se especifica la longitud máxima de contexto, y frases largas pueden degradar la calidad.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribución al grupo OPUS-MT de la Universidad de Helsinki y conservar el aviso de licencia.
- Caveats para producción: la cuantización int8 introduce diferencias menores de redacción respecto al modelo original (3 de 30 frases en las pruebas del autor); conviene validar con un conjunto propio antes de desplegar. Además, el repo tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de uso en producción.
- No dispone de ficheros GGUF ni de versiones para llama.cpp u Ollama; el despliegue está orientado a ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Torick63/opus-mt-fr-es-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-es
- Paper OPUS-MT (Tiedemann & Thottingal, 2020): https://aclanthology.org/2020.eamt-1.10/
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- ONNX Runtime: https://github.com/microsoft/onnxruntime
