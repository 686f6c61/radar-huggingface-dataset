# Torick63/opus-mt-en-nl-onnx-int8

## Resumen

Torick63/opus-mt-en-nl-onnx-int8 es una exportación a ONNX con cuantización int8 dinámica del modelo de traducción Helsinki-NLP/opus-mt-en-nl, desarrollado por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. Resuelve traducción directa de inglés a neerlandés en dispositivos locales, sin depender de una API externa.

La conversión se realizó con Optimum usando la tarea `text2text-generation-with-past` y un decoder fusionado que gestiona tanto el primer paso como los pasos con caché KV mediante la entrada `use_cache_branch`. Los pesos del decoder se almacenan una sola vez. El paquete ocupa aproximadamente 152 MB e incluye encoder ONNX, decoder ONNX, modelos SentencePiece y vocabulario compartido.

Es relevante para despliegues de traducción de bajo coste en dispositivo y para estudiar el impacto de la cuantización int8: con decodificación greedy, la salida coincide con la del modelo PyTorch original en 26 de 30 frases cortas de prueba. No hay benchmarks estándar ni detalles de entrenamiento publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian, encoder-decoder para traducción automática, exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámico de pesos con ONNX Runtime `quantize_dynamic` y `EnableSubgraph`; no se documentan otros formatos |
| Idiomas soportados | inglés (en) como origen y neerlandés (nl) como destino |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX: `encoder_model.onnx` y `decoder_model_merged.onnx`; SentencePiece `source.spm` y `target.spm`; `vocab.json` |
| Tamaño | aproximadamente 152 MB en total; repositorio de 0,2 GB |
| Modelo base | Helsinki-NLP/opus-mt-en-nl, revisión `8aad73b` |
| Pipeline | translation |
| Autor de la conversión | Torick63 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo base es un sistema OPUS-MT de la Universidad de Helsinki, etiquetado como `marian`. Los artefactos confirman una arquitectura encoder-decoder: un encoder y un decoder con caché KV. Esta publicación no entrena un modelo nuevo: exporta los pesos del modelo base a ONNX y aplica cuantización dinámica int8 a los pesos mediante ONNX Runtime `quantize_dynamic`, con `EnableSubgraph` para cuantizar también las capas internas de las ramas del decoder fusionado.

El decoder fusionado maneja el primer paso y los pasos con caché a través de la entrada `use_cache_branch`, lo que evita duplicar los pesos del decoder. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni otras técnicas de alineación. La autoría del modelo original corresponde al grupo de Helsinki, citado como Tiedemann & Thottingal, 2020.

## Capacidades

- Traducción directa de inglés a neerlandés con decodificación greedy documentada.
- Inferencia en dispositivo mediante ONNX Runtime, con encoder y decoder que soporta caché KV.
- Cuantización int8 dinámica de pesos, orientada a reducir el tamaño y facilitar la ejecución local.
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento de agente, razonamiento multi-paso ni planificación.
- No se documentan capacidades de visión, audio, modo thinking, generación de código ni matemáticas; es un modelo de traducción, no un LLM general.
- Cobertura multilingüe limitada al par inglés→neerlandés.
- En decodificación greedy, la generación es determinista con la misma versión de ONNX Runtime y la misma configuración.

## Casos de uso

- Traducción offline en aplicaciones de escritorio y móviles: el paquete de unos 152 MB y el formato ONNX permiten integrar traducción inglés→neerlandés sin conexión, con SentencePiece incluido y sin depender de servicios externos.
- Localización de interfaces y documentación: puede procesar lotes de cadenas en inglés y generar borradores en neerlandés dentro de un pipeline de CI/CD, con revisión humana para terminología y formato.
- Atención al cliente: sirve para pretraducir mensajes entrantes en inglés a neerlandés antes de que los revise un agente, especialmente en conversaciones cortas y tickets de soporte.
- Correos y chats internos con requisitos de privacidad: al ejecutarse en dispositivo, permite traducir contenido sensible sin enviarlo a una API de terceros.
- Herramientas de traducción asistida: puede actuar como motor de sugerencias para traductores que trabajan con pares inglés→neerlandés, dejando la postedición al profesional.
- Evaluación del impacto de la cuantización: es útil para comparar la salida int8 ONNX con el modelo PyTorch original en pruebas controladas de frases cortas y analizar diferencias de redacción.
- Dispositivos locales y periferia: kioscos, terminales de punto de venta o señalización digital pueden incorporar traducción básica en inglés→neerlandés con un modelo pequeño y sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de traducción en la información disponible.

| Prueba | Resultado | Notas |
|---|---|---|
| Coincidencia exacta con el modelo PyTorch original, decodificación greedy | 26/30 frases cortas | Según la model card; las diferencias restantes son principalmente de redacción y se atribuyen a la cuantización |
| Benchmarks de traducción (BLEU, COMET, chrF) | no disponible | No publicados en la información proporcionada |
| Benchmarks de LLM (MMLU, HumanEval, GSM8K) | no disponible / no aplica | El modelo es un sistema de traducción, no un LLM general |

## Requisitos de hardware

- Pesos: aproximadamente 152 MB; repositorio de 0,2 GB. La VRAM total necesaria no está documentada; además de los pesos hay que contar activaciones, caché KV y el entorno de ONNX Runtime.
- CPU: el formato ONNX int8 y el tamaño del modelo permiten inferencia en CPU; no se publican latencias ni throughput.
- GPU: no se especifican GPU recomendadas. Por el tamaño de los pesos, cabría en GPU de consumo modernas, pero no hay requisitos oficiales ni pruebas publicadas.
- Memoria para lotes grandes o secuencias largas: la caché KV y las activaciones pueden aumentar el consumo; no hay cifras oficiales.
- Despliegue: la vía documentada es ONNX Runtime, con el modelo exportado mediante Optimum. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura y formato | Parámetros | Contexto | Licencia | Rendimiento documentado | Disponibilidad |
|---|---|---|---|---|---|---|
| Torick63/opus-mt-en-nl-onnx-int8 | Marian, ONNX int8 | no disponible | no disponible | Apache-2.0 | 26/30 coincidencias con PyTorch en 30 frases cortas; sin BLEU/COMET | Hugging Face, Torick63 |
| Helsinki-NLP/opus-mt-en-nl | Marian, PyTorch original | no disponible | no disponible | Apache-2.0 | Modelo de referencia de la comparación; sin BLEU/COMET en la información | Hugging Face, Helsinki-NLP |
| Otras exportaciones ONNX int8 inglés→neerlandés | no disponible | no disponible | no disponible | no disponible | No identificadas en la información proporcionada | no disponible |

## Limitaciones y advertencias

- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Evaluación limitada a 30 frases cortas; no hay pruebas con documentos largos, dominios técnicos, terminología especializada ni textos con formato complejo.
- La cuantización int8 produce diferencias de redacción en 4 de 30 frases; puede afectar a nombres propios, morfología neerlandesa, términos técnicos y consistencia terminológica.
- No se documenta la longitud de contexto; no se debe asumir que soporta documentos largos ni conversaciones multi-turno extensas.
- No hay BLEU, COMET, chrF ni evaluación humana publicada; la calidad real en producción es desconocida.
- Solo traduce inglés→neerlandés; no cubre neerlandés→inglés ni otros idiomas.
- Puede reflejar sesgos del corpus OPUS original; no se documentan sesgos, toxicidad ni evaluación de equidad.
- Riesgo de omisiones, adiciones o traducciones literales en frases ambiguas; requiere revisión humana en contextos legales, médicos o financieros.
- Licencia Apache-2.0: permite uso comercial con obligaciones de aviso y atribución; deben conservarse los créditos del modelo base y de la conversión. Sin garantías.
- Integración: el decoder fusionado requiere la entrada `use_cache_branch` y una versión de ONNX Runtime compatible con el grafo exportado; conviene validar el entorno de destino.
- No es un LLM conversacional: no se documentan tool calling, agentes, razonamiento, código, matemáticas, visión ni audio.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Torick63/opus-mt-en-nl-onnx-int8)
- [Modelo base Helsinki-NLP/opus-mt-en-nl](https://huggingface.co/Helsinki-NLP/opus-mt-en-nl)
- [Perfil del autor Torick63](https://huggingface.co/Torick63)
- Referencia citada en la model card: Tiedemann & Thottingal, 2020, OPUS-MT; no se incluye URL en la información proporcionada.
