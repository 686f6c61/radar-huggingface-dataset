# tencent/Hy-SimulMT-30B-A3B

## Resumen

Hy-SimulMT-30B-A3B es un modelo de traducción simultánea en tiempo real desarrollado por Tencent Hunyuan. Recibe audio de forma continua y traduce mientras el hablante habla, generando tanto texto traducido como voz sintetizada, con clonación de voz en tiempo real que preserva las características vocales del orador. El modelo está diseñado para comunicación en vivo: reuniones, conferencias, entrevistas y charlas, donde reducir la latencia es tan importante como mantener la calidad de la traducción.

La arquitectura es de tipo MoE (Mixture of Experts) con 30.394.794.496 parámetros totales, según los pesos en safetensors del repositorio. La nomenclatura "A3B" del identificador sugiere aproximadamente 3 mil millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible. El modelo se distribuye bajo licencia Apache 2.0 y cubre 36 idiomas en su etiquetado, aunque la funcionalidad de traducción simultánea de voz a voz se describe específicamente para chino-inglés bidireccional.

Su relevancia actual radica en que aborda el equilibrio entre latencia y calidad en traducción simultánea: en la evaluación de audio largo RealSI, alcanza un StreamLAAL de aproximadamente 3 segundos, el más bajo entre los sistemas comparados, con una puntuación GEMBA superior a la de los modelos de código abierto comparados y a cuatro de las cinco APIs comerciales evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), tag `hy_v3` en Hugging Face |
| Parametros totales | 30.394.794.496 |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere ~3B activos, sin confirmación explícita) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 36 idiomas etiquetados: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la designación MoE y el tag `hy_v3`. El modelo se distribuye en formato safetensors para su uso con la librería transformers, con un tamaño de repositorio de 60,8 GB. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable es el enfoque de traducción simultánea en streaming: el modelo procesa audio incremental y genera traducción de forma continua, en lugar de esperar a recibir una frase completa. El repositorio de GitHub asociado (Tencent-Hunyuan/Hy-SimulMT) proporciona la infraestructura de inferencia SimulInfer y las herramientas de entrenamiento SimulTrain. La salida de voz y la clonación de voz requieren un servicio TTS configurado externamente, por lo que el modelo no incluye por sí mismo la síntesis de voz completa.

## Capacidades

- Traducción simultánea bidireccional chino-inglés de voz a voz, con generación de texto y audio traducidos.
- Clonación de voz en tiempo real que preserva las características vocales del hablante.
- Procesamiento de audio en streaming continuo, traduciendo mientras el hablante sigue hablando.
- Traducción de texto multilingüe: el etiquetado cubre 36 idiomas, incluidos español, francés, alemán, portugués, árabe, hindi, japonés, coreano y tailandés, entre otros.
- Evaluado en benchmarks de audio corto (FLEURS, CoVoST2, ACL6060, RealSI-Sentence) y de audio largo (RealSI).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio de entrada más allá del flujo de traducción: no disponible en la información proporcionada.

## Casos de uso

- Reuniones internacionales en vivo: el modelo traduce simultáneamente chino-inglés mientras los participantes hablan, con un retardo de aproximadamente 3 segundos (StreamLAAL) y preservando la voz del orador mediante clonación, lo que reduce la interrupción del flujo conversacional.
- Conferencias y ponencias de larga duración: al procesar audio en streaming sin esperar al final de cada frase, mantiene la sincronía con el ponente en discursos extensos, escenario evaluado específicamente en el benchmark RealSI de audio largo.
- Entrevistas y ruedas de prensa bilingües: permite a un periodista seguir una entrevista en chino o inglés con traducción de texto y voz en tiempo real, sin depender de un intérprete humano presente.
- Atención al cliente multilingüe en vivo: integrado con un servicio TTS y un canal de audio, puede traducir conversaciones telefónicas o de videollamada entre clientes y agentes que hablan chino e inglés.
- Subtitulado y doblaje en directo para retransmisiones: la salida de texto traducido puede alimentar sistemas de subtitulado, mientras la salida de voz clonada permite un doblaje en tiempo real con la voz original del hablante.
- Investigación en traducción simultánea: el repositorio de GitHub ofrece SimulTrain para entrenamiento y SimulInfer para inferencia, lo que permite reproducir experimentos y adaptar el modelo a nuevos pares de idiomas o dominios.
- Aplicaciones móviles de traducción: el modelo se integra en la Hy Translate App (Android e iOS), lo que demuestra su viabilidad en despliegues de consumo para interpretación en conversaciones presenciales.

## Benchmarks y rendimiento

Evaluación en benchmarks de audio corto (puntuaciones más altas son mejores):

| API / Modelo | FLEURS | CoVoST2 | ACL6060 | RealSI-Sentence |
|---|---:|---:|---:|---:|
| Qwen3.8-LiveTranslate | 88,4 | 82,1 | 80,5 | 84,4 |
| **Hy-SimulMT** | **90,3** | **75,5** | **81,2** | **84,7** |
| Gemini3.5-LiveTranslate | 92,4 | 74,4 | 82,6 | 82,2 |
| Confucius4 R2T2 → T3PO | 89,4 | 76,8 | 76,1 | 77,7 |
| Seed-LiveInterpret2.0 | 85,8 | 67,7 | 74,8 | 80,0 |
| SimulS2ST-Omni | 78,6 | 66,6 | 73,1 | 77,4 |
| GPT-Realtime-Translate | 77,7 | 50,8 | 76,4 | 76,7 |
| XunFei-Simult-Interpretation | 73,4 | 57,0 | 57,5 | 70,9 |
| SeamlessStreaming | 72,8 | 60,9 | 49,8 | 56,9 |

En la evaluación de audio largo RealSI, Hy-SimulMT obtuvo un StreamLAAL de aproximadamente 3 segundos, el más bajo entre los sistemas comparados, y una puntuación GEMBA superior a la de los modelos de código abierto comparados y a cuatro de las cinco APIs comerciales. No se proporcionan los valores numéricos exactos de GEMBA ni de StreamLAAL para el resto de sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 30,39 mil millones de parámetros totales y pesos safetensors en el repositorio de 60,8 GB, la inferencia en precisión completa requiere al menos esa cantidad de memoria, sin contar el servicio TTS externo necesario para la salida de voz.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: el repositorio de GitHub proporciona SimulInfer como servicio de inferencia; la librería declarada es transformers. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el modelo reporta un StreamLAAL de aproximadamente 3 segundos en el benchmark RealSI de audio largo, que mide el retardo de la traducción en streaming, no el tiempo hasta la primera salida de voz. No se publican cifras de throughput (tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (FLEURS) | Latencia (StreamLAAL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Hy-SimulMT** | 30,39B (MoE) | no disponible | 90,3 | ~3 s (menor del comparativo) | Apache 2.0 | Hugging Face, ModelScope, GitHub |
| Qwen3.8-LiveTranslate | no disponible | no disponible | 88,4 | no disponible | no disponible | API comercial |
| Gemini3.5-LiveTranslate | no disponible | no disponible | 92,4 | no disponible | no disponible | API comercial |
| SeamlessStreaming | no disponible | no disponible | 72,8 | no disponible | no disponible | modelo de código abierto |

Hy-SimulMT combina la mejor puntuación FLEURS entre los modelos de código abierto comparados (90,3) con la menor latencia de streaming del conjunto evaluado, y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial. Los datos de parámetros, contexto y latencia de los competidores no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La funcionalidad de traducción simultánea de voz a voz se describe específicamente para chino-inglés bidireccional; el resto de los 36 idiomas etiquetados no tiene confirmación de soporte en modo simultáneo.
- La salida de voz y la clonación de voz requieren un servicio TTS configurado externamente; el modelo por sí solo no genera audio.
- La clonación de voz en tiempo real plantea riesgos de suplantación de identidad y uso indebido; es necesario implementar controles de consentimiento y salvaguardas en producción.
- No se han publicado datos sobre sesgos del modelo, tasas de alucinación ni comportamiento en dominios especializados (médico, legal, técnico).
- No se especifican la longitud de contexto, los tipos de cuantización ni los requisitos de hardware, lo que dificulta planificar el despliegue.
- Los resultados de benchmarks provienen de la propia model card del autor; no se han verificado de forma independiente en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el cumplimiento de la licencia del servicio TTS externo y de las herramientas del repositorio debe verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy-SimulMT-30B-A3B
- Colección Hy-SimulMT en Hugging Face: https://huggingface.co/collections/tencent/hy-simulmt
- Colección en ModelScope: https://www.modelscope.cn/collections/Tencent-Hunyuan/Hy-SimulMT
- Repositorio GitHub (SimulInfer y SimulTrain): https://github.com/Tencent-Hunyuan/Hy-SimulMT
- README en chino: https://huggingface.co/tencent/Hy-SimulMT-30B-A3B/blob/main/README_CN.md
- Aplicación Hy Translate (Android e iOS): enlaces de descarga mediante códigos QR en la model card
