# ZETIC-ai/LFM3-Audio-2B-IQ9

## Resumen

LFM3-Audio-2B-IQ9 es un paquete de despliegue del modelo multimodal de audio LFM3-Audio-2B de Liquid AI, adaptado por ZETIC-ai para ejecutarse en la NPU Hexagon del SoC Qualcomm Dragonwing IQ9 (QCS9075). No se trata de un modelo nuevo, sino de una conversión cuantizada y empaquetada del checkpoint original, orientada a inferencia completamente local en dispositivos edge. El paquete incluye pesos del modelo de lenguaje cuantizados en bloques de 4 bits, junto con el codificador de audio y el decodificador de voz exportados desde el modelo base.

El modelo resuelve el problema de llevar reconocimiento de voz, preguntas habladas, síntesis de voz y conversación por voz a hardware embebido sin conexión a la nube. Su relevancia actual reside en que permite integrar un modelo any-to-any de audio en un SoC con NPU dedicada, manteniendo el modelo completo en el dispositivo y eliminando la dependencia de servicios externos para aplicaciones de voz.

La arquitectura subyacente es la del LFM3-Audio-2B de Liquid AI, con aproximadamente 2.000 millones de parámetros (el dato exacto no está disponible en la información proporcionada). El contexto por defecto es de 2.048 posiciones, ampliable hasta 131.072 en el paquete `v73` y hasta 4.096 en `v73-1nsp`, a costa de memoria adicional. La licencia es la LFM Open License v1.0 de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de audio any-to-any de Liquid AI (LFM3-Audio-2B); pesos del LM cuantizados en bloques de 4 bits, codificador de audio y decodificador de voz exportados |
| Parametros totales | Aproximadamente 2.000 millones (segun el nombre del modelo base; cifra exacta no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 posiciones por defecto; hasta 131.072 en `v73` y hasta 4.096 en `v73-1nsp` mediante `LLMOptions::max_context` |
| Tipos de cuantizacion | Cuantizacion en bloques de 4 bits de los pesos del modelo de lenguaje (paquete IQ9); no se ofrecen otras variantes en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (Liquid AI); el SDK se distribuye aparte con su propia licencia |
| Formato de pesos | Paquete propietario para el runtime Ixian Hexagon (manifest.json, SHA256SUMS, tokenizer, configs y pesos); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base LFM3-Audio-2B es un modelo de audio de Liquid AI que acepta texto y audio como entrada y produce texto y voz (24 kHz mono) como salida. La información disponible no detalla la arquitectura interna del modelo base (tipo de transformer, mecanismos de atención, composición del dataset de entrenamiento, número de tokens ni si se aplicaron técnicas de RLHF o DPO). El paquete IQ9 conserva el codificador de audio y el decodificador de voz tal como se exportaron desde el checkpoint upstream, mientras que los pesos del modelo de lenguaje se cuantizan en bloques de 4 bits para reducir la huella de memoria en la NPU.

La innovación técnica principal de este paquete no está en el modelo, sino en el runtime: ZETIC ha desarrollado Ixian Hexagon, un runtime propio para la NPU Hexagon, junto con el ZeticMLange Hexagon SDK para el Dragonwing IQ9. El paquete se ofrece en dos variantes: `v73`, que usa ambas NSP (unidades de procesamiento neuronal) del SoC y ocupa 3,20 GB, y `v73-1nsp`, que usa una sola NSP, ocupa 2,46 GB y deja la otra libre para otras cargas de trabajo. El audio de entrada se limita a 30 segundos por fragmento y se remuestrea a 16 kHz mono antes de procesarse.

## Capacidades

- Reconocimiento automático de voz (ASR) con salida de texto a partir de audio de entrada.
- Respuesta a preguntas habladas: el modelo acepta audio como entrada y genera texto como salida.
- Síntesis de voz (TTS) a 24 kHz mono, con salida en streaming por chunks de tipo `StreamEvent::Type::Audio`.
- Conversación por voz (voice chat): salida simultánea de texto y audio configurando `GenerationConfig::modalities = {Modality::Text, Modality::Audio}`.
- Conversación multi-turno mediante la interfaz CLI con el flag `-i`.
- Entrada multimodal: texto y audio en el mismo prompt, con mensajes de sistema para condicionar la tarea (por ejemplo, "Perform ASR in English.").
- Procesamiento local en dispositivo sin conexión a la nube, gracias al runtime Ixian Hexagon sobre la NPU del QCS9075.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o modos de razonamiento extendido en la documentación proporcionada.

## Casos de uso

- Transcripción de voz en dispositivos edge: el modelo puede realizar ASR directamente en el Dragonwing IQ9 sin enviar audio a la nube, lo que resulta adecuado para aplicaciones con requisitos de privacidad o conectividad intermitente. La validación del paquete `v73` reportó WER 0 en cuatro clips de prueba.
- Asistentes de voz embebidos: con voice chat y salida de audio a 24 kHz, el modelo puede gestionar interacciones habladas completas (entrada de voz, respuesta hablada) en un dispositivo portátil o industrial.
- Interfaces de voz para equipos industriales: el QCS9075 está orientado a dispositivos Dragonwing, y el modelo puede integrarse en paneles de control o terminales que requieran dictado y respuesta hablada local.
- Accesibilidad: conversión de texto a voz y de voz a texto en dispositivos de asistencia, con latencia local y sin dependencia de servicios externos.
- Preguntas y respuestas sobre audio: el modelo acepta una pregunta hablada y devuelve texto, lo que permite construir sistemas de consulta por voz en kioscos o terminales.
- Procesamiento por lotes de clips cortos: dado el límite de 30 segundos por fragmento de audio, el modelo es adecuado para transcribir o responder a grabaciones cortas, dividiendo audios largos en varias partes.
- Prototipado de aplicaciones de voz en edge: el SDK en C++ (`zetic_llm.h`) y la CLI permiten integrar el modelo en aplicaciones linux-arm64 sobre Qualcomm Linux con relativa rapidez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una validación funcional del paquete `v73`: chat de texto, reconocimiento de voz con WER 0 en cuatro clips de prueba y salida de voz verificada con un reconocedor de voz, realizada entre el 31 de octubre y el 2 de noviembre de 2026 con el SDK 0.1.0. El paquete `v73-1nsp` no fue validado por separado en una sola NSP.

## Requisitos de hardware

- Hardware objetivo exclusivo: Qualcomm Dragonwing IQ9 (QCS9075) con NPU Hexagon, sobre Qualcomm Linux (linux-arm64). El paquete no está pensado para GPU de escritorio ni para otros SoC.
- Huella de almacenamiento: 3,20 GB para `v73` (ambas NSP) y 2,46 GB para `v73-1nsp` (una NSP); total del repositorio 5,66 GB.
- Memoria: el contexto por defecto es de 2.048 posiciones; ampliarlo a 32.768 consume aproximadamente 0,4 GB adicionales. No se dispone de cifras de VRAM o memoria RAM total requerida.
- No cabe en GPU de consumo convencionales (RTX 4090, etc.) porque el formato de pesos es específico del runtime Ixian Hexagon y no es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Despliegue: mediante el ZeticMLange Hexagon SDK para el Dragonwing IQ9, distribuido por separado en GitHub (https://github.com/zetic-ai/IxianHexagon). Incluye biblioteca, cabeceras, herramientas de línea de comandos y la biblioteca Hexagon DSP.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Plataforma | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Audio-2B-IQ9 (este) | ~2B | 2.048 por defecto; hasta 131.072 en `v73` | NPU Hexagon del Dragonwing IQ9 | LFM Open License v1.0 | Paquete propietario Ixian Hexagon |
| LiquidAI/LFM3-Audio-2B | ~2B | no disponible | GPU/CPU convencionales | LFM Open License v1.0 | Pesos originales (no disponible el detalle) |
| Modelos ASR/TTS edge genéricos | no disponible | no disponible | CPU/NPU variadas | variable | variable |

La comparación con alternativas de la misma categoría (modelos de audio any-to-any en edge) no está disponible en la información proporcionada, ya que no se han encontrado datos de rendimiento ni especificaciones de modelos comparables.

## Limitaciones y advertencias

- Dependencia total del hardware: solo funciona en el Dragonwing IQ9 (QCS9075) con el runtime Ixian Hexagon y el SDK de ZETIC; no es portable a otras plataformas.
- El SDK no está incluido en el repositorio y debe obtenerse por separado desde GitHub, con su propia licencia.
- Límite de 30 segundos por fragmento de audio; los audios más largos deben dividirse en varias partes.
- El paquete `v73-1nsp` no ha sido validado por separado en una sola NSP, por lo que su comportamiento en producción es menos predecible.
- Los pesos son una conversión derivada del checkpoint upstream, no los pesos originales; pueden existir diferencias de comportamiento respecto al modelo base.
- Idiomas soportados no disponibles; la validación de ASR se realizó con instrucciones en inglés, pero no se especifica la cobertura multilingüe.
- Riesgo de alucinación y sesgos: no se dispone de información específica en la documentación proporcionada.
- Licencia LFM Open License v1.0: es necesario leer el texto completo antes de usar o redistribuir el modelo, ya que puede imponer restricciones al uso comercial.
- No se dispone de datos de latencia, throughput ni consumo energético, lo que dificulta planificar despliegues en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ZETIC-ai/LFM3-Audio-2B-IQ9
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Revisión upstream concreta: https://huggingface.co/LiquidAI/LFM3-Audio-2B/tree/9d49701c372d6011d900f6abb40c6b296fb706dd
- SDK ZeticMLange Hexagon para el Dragonwing IQ9: https://github.com/zetic-ai/IxianHexagon
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
