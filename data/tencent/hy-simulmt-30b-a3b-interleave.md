# tencent/Hy-SimulMT-30B-A3B-Interleave

## Resumen

Hy-SimulMT-30B-A3B-Interleave es un modelo de traducción simultánea en tiempo real desarrollado por Tencent Hunyuan. A diferencia de un traductor por turnos, recibe audio en streaming y empieza a traducir mientras el hablante sigue hablando, generando texto traducido y voz sintetizada, con clonación de voz en tiempo real que preserva las características vocales del interlocutor. Está diseñado para comunicación en directo: reuniones, ponencias, entrevistas y clases.

El modelo se publica con 30.394.794.496 parámetros totales según los pesos en safetensors (unos 30.400 millones), en un repositorio de 60,8 GB. La nomenclatura «30B-A3B» sigue la convención habitual para arquitecturas de mezcla de expertos con aproximadamente 3.000 millones de parámetros activos por token, aunque la model card no detalla explícitamente la configuración de expertos. La etiqueta de arquitectura declarada es `hy_v3`.

Su relevancia actual está en el eje latencia-calidad: en la evaluación de audio largo RealSI, el modelo alcanza un StreamLAAL de aproximadamente 3 segundos, el más bajo entre los sistemas comparados, manteniendo una puntuación GEMBA superior a la de los modelos abiertos comparados y a cuatro de las cinco APIs comerciales incluidas en la comparación. La licencia Apache 2.0 y la disponibilidad de herramientas de inferencia (SimulInfer) y entrenamiento (SimulTrain) en GitHub facilitan su evaluación y despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con etiqueta `hy_v3`; nomenclatura 30B-A3B compatible con mezcla de expertos (MoE), configuración de expertos no detallada en la información disponible |
| Parámetros totales | 30.394.794.496 (≈30.400 millones), según safetensors |
| Parámetros activos | ≈3.000 millones por token, inferido de la nomenclatura «A3B»; no confirmado explícitamente en la model card |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | 36 idiomas declarados en metadatos: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug. La model card documenta explícitamente traducción simultánea bidireccional chino-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline | translation |
| Tamaño del repositorio | 60,8 GB |
| Fecha de publicación | 26 de octubre de 2026 (repositorio creado el 22 de octubre de 2026) |

## Arquitectura y entrenamiento

La información proporcionada no incluye una descripción técnica detallada del entrenamiento: no se especifica el número de tokens, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o aprendizaje por refuerzo. La model card se centra en el comportamiento del sistema y en los resultados de evaluación, no en la receta de preentrenamiento. La etiqueta de arquitectura `hy_v3` remite a la familia Hunyuan, y el sufijo «Interleave» del nombre no aparece explicado en la documentación disponible.

El elemento diferencial declarado es el enfoque de traducción incremental sobre flujo de audio continuo: el modelo debe comprender y formular la traducción antes de disponer de la frase completa, lo que exige política de lectura anticipada (read/write policy) y generación parcial. El ecosistema se completa con SimulInfer, servicio de inferencia para streaming, y SimulTrain, herramientas de entrenamiento, ambos publicados en el repositorio de GitHub. La salida de voz y la clonación de voz requieren un servicio TTS configurado de forma externa: no forman parte del checkpoint.

## Capacidades

- Traducción simultánea bidireccional chino-inglés en modalidad voz a voz, con recepción continua de audio y emisión incremental.
- Salida dual: texto traducido y habla sintetizada.
- Clonación de voz en tiempo real, preservando las características vocales del hablante original.
- Traducción de texto y audio en los 36 idiomas declarados en los metadatos del modelo, con cobertura efectiva documentada solo para el par zh-en en el modo simultáneo.
- Procesamiento de audio de formato largo: la evaluación principal se realiza sobre el benchmark RealSI de audio largo (discursos, entrevistas, reuniones).
- Integración con servicios de terceros: la generación de voz se delega en un servicio TTS externo.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y carga mediante `transformers`.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso ni modo «thinking».

## Casos de uso

- Interpretación simultánea en reuniones bilingües chino-inglés: el modelo consume el audio de la sala en streaming y emite la traducción con un retardo de aproximadamente 3 segundos (StreamLAAL), lo que permite seguir una conversación sin pausas de turno completas.
- Subtitulado en directo de ponencias y webinars: la salida de texto incremental puede volcarse a un sistema de subtítulos, con la ventaja de que la latencia no depende de que el orador termine la frase.
- Entrevistas y ruedas de prensa con participantes que hablan idiomas distintos: la clonación de voz permite emitir la traducción con la voz del propio hablante, lo que reduce la carga cognitiva de la audiencia en comparación con una voz sintética genérica.
- Atención al cliente transfronteriza: integrado en un pipeline de telefonía o VoIP, traduce la conversación en tiempo real hacia el agente, que puede responder en su idioma mientras el cliente sigue hablando.
- Documentación y formación interna multilingüe: a partir de grabaciones de audio largas, el modelo produce transcripción traducida con marcas temporales, útil para generar materiales formativos en varios idiomas sin post-edición manual extensa.
- Accesibilidad en eventos presenciales: traducción en directo hacia texto para personas sordas o con dificultades auditivas en contextos donde el intérprete humano no está disponible.
- Investigación en traducción automática: el repositorio SimulTrain permite reproducir y extender el entrenamiento con políticas de streaming propias, lo que lo convierte en una base para experimentación académica sobre el compromiso latencia-calidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en cuatro benchmarks públicos de audio de formato corto (puntuaciones más altas son mejores). No se indica la métrica exacta empleada en cada columna:

| API / modelo | FLEURS | CoVoST2 | ACL6060 | RealSI-Sentence |
|---|---:|---:|---:|---:|
| Qwen3.8-LiveTranslate | 88,4 | 82,1 | 80,5 | 84,4 |
| Hy-SimulMT | 90,3 | 75,5 | 81,2 | 84,7 |
| Gemini3.5-LiveTranslate | 92,4 | 74,4 | 82,6 | 82,2 |
| Confucius4 R2T2 → T3PO | 89,4 | 76,8 | 76,1 | 77,7 |
| Seed-LiveInterpret2.0 | 85,8 | 67,7 | 74,8 | 80,0 |
| SimulS2ST-Omni | 78,6 | 66,6 | 73,1 | 77,4 |
| GPT-Realtime-Translate | 77,7 | 50,8 | 76,4 | 76,7 |
| XunFei-Simult-Interpretation | 73,4 | 57,0 | 57,5 | 70,9 |
| SeamlessStreaming | 72,8 | 60,9 | 49,8 | 56,9 |

Evaluación en audio largo (RealSI), según la model card:

| Métrica | Resultado |
|---|---|
| StreamLAAL (retardo de traducción en streaming, menor es mejor) | ≈3 segundos, el más bajo entre los sistemas comparados |
| GEMBA (calidad de traducción, mayor es mejor) | Superior a los modelos abiertos comparados y a 4 de las 5 APIs comerciales incluidas; el valor numérico exacto no se publica en la información disponible |

Advertencia: todos los resultados proceden de la model card del autor, sin verificación independiente en la información proporcionada. La propia tarjeta aclara que StreamLAAL no equivale al tiempo hasta la primera salida de voz.

## Requisitos de hardware

- Pesos en bf16: 60,8 GB de repositorio; la inferencia en precisión nativa requiere del orden de 65-80 GB de VRAM contando caché KV y buffers, aunque la longitud de contexto no está publicada.
- GPU de 80 GB: A100 80GB, H100 80GB o MI300X para inferencia en bf16 sin cuantizar.
- Cuantización a 8 bits: pesos en torno a 30-32 GB; encaja en L40S 48GB, A6000 48GB o en dos RTX 4090 en paralelo.
- Cuantización a 4 bits: pesos en torno a 16-18 GB; cabe en una RTX 4090 24GB, RTX 3090 24GB o L4 24GB, con margen ajustado si se amplía el contexto.
- Al ser un modelo MoE con aproximadamente 3.000 millones de parámetros activos por token, el coste de cómputo por token es sensiblemente inferior al de un modelo denso de 30B, lo que favorece el throughput en streaming; no se publican cifras de latencia por token ni de tokens por segundo.
- Despliegue: `transformers` como vía de referencia, contenedores compatibles con endpoints (etiqueta `endpoints_compatible`), y el servicio SimulInfer del repositorio de GitHub para el modo streaming.
- vLLM, TGI o SGLang: no se confirma soporte explícito en la información disponible.
- llama.cpp / Ollama / GGUF: no disponible; no se publican pesos cuantizados en el repositorio.
- La salida de audio requiere además un servicio TTS externo, con su propio consumo de recursos y latencia añadida al pipeline.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-SimulMT-30B-A3B-Interleave | Traducción simultánea voz a voz (MoE) | ≈30.400 M totales / ≈3.000 M activos | No disponible | Apache 2.0 | Pesos abiertos en HuggingFace, ModelScope y GitHub |
| Qwen3.8-LiveTranslate | Traducción en directo (API/ servicio) | No disponible | No disponible | No disponible | No disponible |
| Gemini3.5-LiveTranslate | Traducción en directo (API comercial) | No disponible | No disponible | No disponible | No disponible (API propietaria) |
| GPT-Realtime-Translate | Traducción en directo (API comercial) | No disponible | No disponible | No disponible | No disponible (API propietaria) |
| SeamlessStreaming | Traducción simultánea en streaming (modelo abierto) | No disponible | No disponible | No disponible | No disponible |

En calidad sobre audio corto, Hy-SimulMT lidera FLEURS (90,3) y ACL6060 (81,2) y queda por detrás de Qwen3.8-LiveTranslate en CoVoST2 (75,5 frente a 82,1). En audio largo, su ventaja declarada es la latencia (StreamLAAL ≈3 s) combinada con una puntuación GEMBA superior a la de los modelos abiertos comparados. No se dispone de datos de parámetros, contexto ni licencia de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card documenta explícitamente solo el par chino-inglés en modo simultáneo; los 36 idiomas de los metadatos no tienen validación publicada en el modo de streaming voz a voz.
- Los resultados de benchmarks son autocertificados por Tencent Hunyuan; no hay evaluación independiente en la información disponible.
- El modelo puede alucinar o inventar contenido durante la generación incremental, especialmente cuando la política de lectura anticipada fuerza a emitir antes de disponer de contexto suficiente; es un riesgo estructural del paradigma simultáneo.
- La clonación de voz en tiempo real plantea riesgos de suplantación de identidad y obligaciones legales claras (consentimiento explícito, normativa de protección de datos y de IA). No se documentan en la información disponible mecanismos de marca de agua ni filtros de uso.
- La salida de voz no es autónoma: depende de un servicio TTS externo, cuya latencia y calidad condicionan la experiencia final.
- No se publican datos sobre sesgos lingüísticos, de género o culturales, ni sobre el comportamiento en idiomas de bajos recursos incluidos en la lista (por ejemplo, bo, ug, my, km, mn).
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas o acumulación de historial sin pruebas empíricas.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero conviene revisar las condiciones del servicio TTS asociado y de los datos de audio de entrada, que quedan fuera del alcance de la licencia del modelo.
- El sufijo «Interleave» del nombre no está documentado; se desconoce si implica algún modo de salida entrelazada texto-voz con requisitos específicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/Hy-SimulMT-30B-A3B-Interleave
- Colección Hy-SimulMT en HuggingFace: https://huggingface.co/collections/tencent/hy-simulmt
- Repositorio GitHub (SimulInfer y SimulTrain): https://github.com/Tencent-Hunyuan/Hy-SimulMT
- Colección en ModelScope: https://www.modelscope.cn/collections/Tencent-Hunyuan/Hy-SimulMT
- README en chino: https://huggingface.co/tencent/Hy-SimulMT-30B-A3B-Interleave/blob/main/README_CN.md
- Sitio corporativo de Tencent: https://www.tencent.com/
