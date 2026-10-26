# tencent/Hy-SimulMT-30B-A3B

## Resumen

Hy-SimulMT-30B-A3B es un modelo de traducción simultánea en tiempo real desarrollado por Tencent Hunyuan. A diferencia de los modelos de traducción por turnos, recibe audio en streaming y va generando la traducción mientras el hablante sigue hablando, produciendo texto traducido y voz sintetizada, con clonación de voz en tiempo real que preserva las características vocales del hablante. Está pensado para comunicación en vivo: reuniones, ponencias, entrevistas y llamadas.

El modelo se publica con 30.394.794.496 parámetros totales según los pesos en safetensors (repo de 60,8 GB), licencia Apache 2.0 y compatibilidad con `transformers`. La nomenclatura "30B-A3B" del identificador sugiere una arquitectura de mezcla de expertos con aproximadamente 3.000 millones de parámetros activos por token, aunque la model card disponible no detalla la arquitectura interna ni la longitud de contexto.

Su relevancia actual está en el eje latencia-calidad: en la evaluación sobre el benchmark abierto RealSI de audio largo, el modelo alcanza un StreamLAAL de aproximadamente 3 segundos, el más bajo de los sistemas comparados, y una puntuación GEMBA superior a la de los modelos abiertos comparados y a cuatro de las cinco APIs comerciales incluidas en la comparativa. La model card describe explícitamente traducción bidireccional chino-inglés, aunque los metadatos del repositorio declaran 37 idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card (el identificador "A3B" sugiere mezcla de expertos con ~3B activos; sin confirmar) |
| Parámetros totales | 30.394.794.496 |
| Parámetros activos | No disponible (estimación por nomenclatura: ~3.000 millones, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Metadatos: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug (37). La model card solo documenta traducción bidireccional zh ↔ en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`transformers`, arquitectura declarada `hy_v3`) |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna: la model card no especifica si se trata de un transformer denso, de una mezcla de expertos o de un diseño híbrido con codificador de audio y decodificador de texto/voz. El campo `architecture` de los pesos es `hy_v3` y el modelo se sirve mediante la librería `transformers`. El pipeline es de extremo a extremo para traducción simultánea: consume flujo de audio continuo y emite texto traducido más audio sintetizado, con un módulo de clonación de voz en tiempo real. La síntesis de voz y la clonación requieren un servicio TTS configurado aparte, según indica la documentación del repositorio.

Tampoco se han publicado el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí se documenta es la metodología de evaluación: combinación de benchmarks públicos de audio corto (FLEURS, CoVoST2, ACL6060, RealSI-Sentence), audio real de formato largo (RealSI long-form) y comparación con intérpretes simultáneos profesionales. El repositorio de GitHub acompaña al modelo con dos herramientas: SimulInfer, servicio de inferencia en streaming, y SimulTrain, utilidades de entrenamiento.

## Capacidades

- Traducción simultánea bidireccional chino ↔ inglés sobre audio en streaming, sin esperar al final del turno del hablante.
- Salida dual: texto traducido y voz sintetizada en el idioma destino.
- Clonación de voz en tiempo real: preserva las características vocales del hablante en el audio generado.
- Comprensión incremental de audio: procesa el flujo según llega y formula la traducción con información parcial.
- Baja latencia de streaming: StreamLAAL de ~3 s en la evaluación RealSI de audio largo.
- Capacidad declarada en metadatos para 37 idiomas (incluye español, francés, alemán, portugués, árabe, hindi, japonés, coreano, ruso, turco, vietnamita, tailandés, entre otros).
- Integración con `transformers` y endpoints compatibles.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Modo de razonamiento explícito (thinking): no disponible.
- Visión: no disponible.

## Casos de uso

- Interpretación simultánea en reuniones bilingües chino-inglés: el modelo consume el audio de la sala y emite subtítulos y voz traducida con ~3 s de retardo, lo que permite seguir una reunión sin esperar a que el ponente termine cada frase.
- Ponencias y conferencias con audiencia mixta: integrado en la plataforma de videoconferencia, genera una pista de audio traducida y clonada con la voz del orador, evitando la interrupción que introduce la interpretación por turnos.
- Entrevistas y ruedas de prensa en directo: al mantenerse dentro del flujo de audio, permite publicar subtítulos traducidos casi en tiempo real en retransmisiones, donde un modelo por turnos acumularía varios segundos de espera adicionales.
- Atención al cliente transfronteriza con voz: combinado con un servicio TTS, permite que un agente hable en su idioma y el cliente reciba la respuesta en el suyo con su propia voz clonada, manteniendo la naturalidad de la conversación telefónica.
- Subtitulado automático de contenido en directo (webinars, streaming): el modelo entrega texto traducido de forma continua, adecuado para sobretitulado en vivo donde la latencia perceptible debe mantenerse por debajo de 3-4 segundos.
- Investigación en traducción simultánea: SimulTrain permite reproducir el pipeline de entrenamiento y evaluar variantes sobre RealSI, útil para grupos que trabajan en políticas de espera (wait-k, políticas adaptativas) y métricas de latencia como StreamLAAL.
- Prototipado de asistentes de viaje o atención presencial: la app Hy Translate sirve como referencia de producto para validar la calidad percibida antes de integrar el modelo en una aplicación propia.

## Benchmarks y rendimiento

Calidad de traducción en cuatro benchmarks públicos de audio corto (puntuación más alta, mejor):

| Sistema | FLEURS | CoVoST2 | ACL6060 | RealSI-Sentence |
|---|---:|---:|---:|---:|
| Hy-SimulMT | 90,3 | 75,5 | 81,2 | 84,7 |
| Qwen3.8-LiveTranslate | 88,4 | 82,1 | 80,5 | 84,4 |
| Gemini3.5-LiveTranslate | 92,4 | 74,4 | 82,6 | 82,2 |
| Confucius4 R2T2 → T3PO | 89,4 | 76,8 | 76,1 | 77,7 |
| Seed-LiveInterpret2.0 | 85,8 | 67,7 | 74,8 | 80,0 |
| SimulS2ST-Omni | 78,6 | 66,6 | 73,1 | 77,4 |
| GPT-Realtime-Translate | 77,7 | 50,8 | 76,4 | 76,7 |
| XunFei-Simult-Interpretation | 73,4 | 57,0 | 57,5 | 70,9 |
| SeamlessStreaming | 72,8 | 60,9 | 49,8 | 56,9 |

Evaluación de audio largo (RealSI long-form):

| Métrica | Resultado |
|---|---|
| StreamLAAL (retardo de traducción en streaming) | ~3 segundos, el más bajo de los sistemas comparados |
| GEMBA (calidad de traducción) | Superior a los modelos abiertos comparados y a 4 de las 5 APIs comerciales de la comparativa |

Notas: la model card indica que StreamLAAL no equivale al tiempo hasta la primera salida de voz. Los valores de la tabla son los publicados por el autor; no se dispone de resultados independientes ni de desgloses por par de idiomas más allá de chino-inglés. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de razonamiento general, coherente con un modelo especializado en traducción.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: en torno a 61-65 GB solo para pesos (30.394 millones de parámetros × 2 bytes ≈ 60,8 GB), más overhead de activaciones y del codificador de audio. Estimación basada en el tamaño de los pesos; no publicada por el autor.
- VRAM en cuantización de 8 bits: ~31-35 GB estimados. En 4 bits: ~16-19 GB estimados. El autor no documenta qué esquemas de cuantización están soportados ni su impacto en calidad para este modelo.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o H200. Con dos GPU de 40-48 GB (A100 40 GB, L40S) sería necesario reparto de pesos o cuantización.
- GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB). En 4 bits podría ajustarse en una RTX 4090 o RTX 3090, condicionado a que exista soporte de cuantización para la arquitectura `hy_v3`, extremo no confirmado.
- Despliegue: `transformers` es la librería declarada; el repositorio de GitHub proporciona SimulInfer como servicio de inferencia en streaming. Soporte en vLLM, TGI, llama.cpp u Ollama: no disponible. La síntesis de voz y la clonación requieren un servicio TTS externo configurado.
- Latencia y throughput: el único dato publicado es el StreamLAAL de ~3 s en RealSI long-form. No se han publicado cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Comparativa limitada a los sistemas incluidos en la evaluación del autor; no se dispone de parámetros, contexto ni licencia de los alternativas.

| Sistema | Tipo | FLEURS | CoVoST2 | ACL6060 | RealSI-Sentence | StreamLAAL (RealSI largo) |
|---|---|---:|---:|---:|---:|---|
| Hy-SimulMT | Abierto, Apache 2.0, 30,4B totales | 90,3 | 75,5 | 81,2 | 84,7 | ~3 s (el menor) |
| Qwen3.8-LiveTranslate | Comparativa del autor | 88,4 | 82,1 | 80,5 | 84,4 | No disponible en la información |
| Gemini3.5-LiveTranslate | API comercial | 92,4 | 74,4 | 82,6 | 82,2 | No disponible en la información |
| GPT-Realtime-Translate | API comercial | 77,7 | 50,8 | 76,4 | 76,7 | No disponible en la información |
| SeamlessStreaming | Abierto (referencia de streaming) | 72,8 | 60,9 | 49,8 | 56,9 | No disponible en la información |

Lectura: Hy-SimulMT es el único de la comparativa con licencia Apache 2.0 confirmada y pesos descargables entre los que lideran la tabla. Gemini3.5-LiveTranslate supera al modelo en FLEURS (92,4 frente a 90,3) y ACL6060 (82,6 frente a 81,2), mientras que Qwen3.8-LiveTranslate lo supera en CoVoST2 (82,1 frente a 75,5); Hy-SimulMT queda por delante del resto en RealSI-Sentence y en la métrica de latencia sobre audio largo.

## Limitaciones y advertencias

- Cobertura lingüística no confirmada: la model card solo documenta traducción bidireccional chino-inglés, mientras que los metadatos declaran 37 idiomas. No hay benchmarks ni ejemplos para el resto de pares, incluido el español. No asumas calidad multilingüe sin evaluarla.
- Es un modelo de traducción de audio, no un LLM de propósito general: no hay evidencia publicada de generación de texto libre, código, matemáticas, tool calling ni razonamiento multi-paso.
- Dependencia de servicios externos: la salida de voz y la clonación requieren un servicio TTS configurado aparte. Sin él, el modelo solo aporta la parte textual.
- Clonación de voz: implica riesgos de suplantación y obligaciones de consentimiento y transparencia. La licencia Apache 2.0 no exime de la normativa aplicable sobre datos biométricos y síntesis de voz.
- Riesgo de alucinación y de errores de traducción acumulados: en streaming, el modelo traduce con información parcial del enunciado, lo que puede producir reformulaciones, omisiones o anticipaciones incorrectas que un modelo por turnos evitaría.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, robustez ante acentos, ruido de fondo o solapamiento de hablantes.
- Sin datos de arquitectura ni de entrenamiento: la ausencia de información sobre contexto máximo, composición del dataset y procesos de alineación impide auditar el modelo con el detalle habitual en producción.
- Resultados procedentes del autor: las cifras de la tabla y el StreamLAAL de ~3 s no han sido replicados de forma independiente en la información disponible.
- Estado del arte cambiante: los sistemas comparados son APIs y modelos cerrados de terceros, por lo que la comparativa refleja el momento de publicación (26 de octubre de 2026) y puede quedar desactualizada rápidamente.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar los términos del repositorio y de cualquier servicio TTS asociado, que puede tener licencia distinta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/Hy-SimulMT-30B-A3B
- Colección Hy-SimulMT en HuggingFace: https://huggingface.co/collections/tencent/hy-simulmt
- Colección en ModelScope: https://www.modelscope.cn/collections/Tencent-Hunyuan/Hy-SimulMT
- Repositorio GitHub (SimulInfer y SimulTrain): https://github.com/Tencent-Hunyuan/Hy-SimulMT
- README en chino: https://huggingface.co/tencent/Hy-SimulMT-30B-A3B/blob/main/README_CN.md
- App Hy Translate (Android e iOS): enlaces de descarga mediante códigos QR en la model card del repositorio de HuggingFace
- Página corporativa de Tencent: https://www.tencent.com/
- Información sobre Tencent (Wikipedia): https://en.wikipedia.org/wiki/Tencent
- No se han encontrado en la búsqueda web papers técnicos, blogs de ingeniería ni demos adicionales específicos del modelo.
