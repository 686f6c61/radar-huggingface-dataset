# tencent/Hy-SimulMT-30B-A3B-Interleave-GGUF

## Resumen

Hy-SimulMT es un modelo de traducción simultánea en tiempo real desarrollado por Tencent Hunyuan, orientado a traducción bidirectional de voz a voz entre chino e inglés. A diferencia de los sistemas de traducción por bloques, recibe audio de forma continua y traduce mientras el hablante sigue hablando, generando tanto texto traducido como voz sintetizada, e incorpora clonación de voz en tiempo real para preservar las características vocales del hablante original.

La variante aquí descrita es la distribución en formato GGUF (`Hy-SimulMT-30B-A3B-Interleave-GGUF`), con un total de 30.396.330.496 parámetros y arquitectura de mezcla de expertos (MoE), según indica la denominación "A3B", que sugiere aproximadamente 3.000 millones de parámetros activos por token. Esta versión cuantizada permite ejecutar el modelo en hardware de consumo con runtimes compatibles con GGUF como llama.cpp.

Su relevancia radica en el equilibrio entre latencia y calidad: en el benchmark open source RealSI de audio de larga duración, el modelo alcanza un StreamLAAL de aproximadamente 3 segundos, el más bajo entre los sistemas comparados, con una puntuación GEMBA superior a la de los modelos open source rivales y a cuatro de las cinco APIs comerciales evaluadas. Está diseñado para reuniones, conferencias y entrevistas en directo, y puede probarse en la app Hy Translate de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), traducción simultánea de audio streaming |
| Parametros totales | 30.396.330.496 (~30,4B) |
| Parametros activos | ~3B (según la denominación "A3B" del nombre; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no disponibles en la ficha) |
| Idiomas soportados | Chino e inglés (traducción bidireccional voz a voz) |
| Licencia | no disponible |
| Formato de pesos | GGUF (este repositorio); safetensors en la variante original |

## Arquitectura y entrenamiento

Hy-SimulMT es un modelo de traducción simultánea que procesa un flujo continuo de audio de entrada y va generando traducción incremental en texto y voz. La denominación "30B-A3B" indica una arquitectura MoE con unos 30.000 millones de parámetros totales de los que solo una fracción (~3B) se activa por token, lo que reduce la carga computacional por inferencia manteniendo la capacidad del modelo completo. El sufijo "Interleave" sugiere un esquema de intercalado en el procesamiento de entrada/salida, aunque la model card no detalla su funcionamiento interno.

Sobre el proceso de entrenamiento, la información disponible no especifica el número de tokens, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. Tencent sí publica herramientas oficiales de entrenamiento (SimulTrain) y de inferencia (SimulInfer) en su repositorio de GitHub, lo que permite ajustar o desplegar el modelo. La salida de voz y la clonación de voz en tiempo real requieren un servicio TTS configurado externamente, por lo que el modelo no integra de forma autónoma todo el pipeline de voz.

## Capacidades

- Traducción simultánea de voz a voz bidireccional entre chino e inglés, con salida de texto y de voz.
- Traducción incremental sobre streaming de audio: traduce mientras el hablante sigue hablando, sin esperar a que termine la frase o el turno.
- Clonación de voz en tiempo real para preservar el timbre y las características vocales del hablante original (requiere servicio TTS configurado).
- Generación de texto conversacional (tag "conversational" en el repositorio).
- Optimización del equilibrio latencia/calidad: latencia de streaming (StreamLAAL) de aproximadamente 3 segundos en audio de larga duración.
- Soporte para audio de larga duración (evaluado en el benchmark RealSI long-form).
- No hay evidencia en la información disponible de soporte de tool calling, capacidades de visión, ni modos de razonamiento explícito.

## Casos de uso

- Interpretación simultánea en reuniones internacionales: el modelo traduce en directo discursos largos entre chino e inglés con una latencia de streaming de ~3 segundos, adecuada para que los asistentes sigan la conversación sin esperas perceptibles.
- Conferencias y ponencias en directo: gracias a su rendimiento en el benchmark RealSI de audio de larga duración, puede subtitular y doblar en tiempo real charlas de duración extendida.
- Entrevistas y retransmisiones: la clonación de voz en tiempo real permite emitir la traducción con la voz del propio hablante, útil para medios y podcasts bilingües.
- Traducción de llamadas y comunicaciones empresariales chino-inglés: la variante GGUF permite desplegar el modelo localmente, reduciendo dependencia de APIs comerciales y latencias de red.
- Aplicaciones móviles de traducción: Tencent ya lo integra en su app Hy Translate (Android e iOS), sirviendo de referencia para productos de consumo similares.
- Investigación en traducción simultánea: los repositorios SimulInfer y SimulTrain permiten reproducir la inferencia y entrenar o ajustar el modelo para nuevos pares de idiomas o dominios.
- Accesibilidad en eventos: subtitulado y locución traducida en directo para asistentes que no dominan el idioma del ponente.

## Benchmarks y rendimiento

### Audio de larga duración (benchmark RealSI)

En la evaluación RealSI de audio de larga duración, Hy-SimulMT logró un StreamLAAL de aproximadamente 3 segundos (el más bajo entre los sistemas comparados) y una puntuación GEMBA superior a la de los modelos open source comparados y a cuatro de las cinco APIs comerciales. No se han publicado las cifras numéricas exactas de GEMBA en la información disponible.

### Benchmarks de audio de corta duración

| API / Modelo | FLEURS | CoVoST2 | ACL6060 | RealSI-Sentence |
|---|---:|---:|---:|---:|
| Qwen3.8-LiveTranslate | 88,4 | **82,1** | 80,5 | 84,4 |
| **Hy-SimulMT** | **90,3** | 75,5 | **81,2** | **84,7** |
| Gemini3.5-LiveTranslate | **92,4** | 74,4 | **82,6** | 82,2 |
| Confucius4 R2T2 → T3PO | 89,4 | 76,8 | 76,1 | 77,7 |
| Seed-LiveInterpret2.0 | 85,8 | 67,7 | 74,8 | 80,0 |
| SimulS2ST-Omni | 78,6 | 66,6 | 73,1 | 77,4 |
| GPT-Realtime-Translate | 77,7 | 50,8 | 76,4 | 76,7 |
| XunFei-Simult-Interpretation | 73,4 | 57,0 | 57,5 | 70,9 |
| SeamlessStreaming | 72,8 | 60,9 | 49,8 | 56,9 |

*Puntuaciones más altas son mejores. Hy-SimulMT supera a los demás modelos open source de la tabla en FLEURS, ACL6060 y RealSI-Sentence, y logra el mejor resultado global en RealSI-Sentence (84,7).*

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 53,1 GB en total, lo que sugiere que incluye varias cuantizaciones o archivos divididos. Con una cuantización de ~4 bits, un modelo MoE de 30B con ~3B de parámetros activos debería requerir del orden de 16-20 GB de VRAM o memoria unificada; no obstante, el dato exacto no está disponible.
- GPU recomendadas: no disponible oficialmente. Por tamaño, una RTX 4090 (24 GB) o RTX 5090 en cuantización agresiva, o una A100/H100 con margen, son opciones razonables; también es viable la ejecución parcial en CPU con offload mediante llama.cpp.
- Consumer GPU: dado el formato GGUF y la activación de solo ~3B de parámetros por token, es plausible ejecutarlo en GPUs de consumo de 24 GB (RTX 3090/4090) con cuantizaciones moderadas; el dato oficial no está disponible.
- Opciones de despliegue: cualquier runtime compatible con GGUF (llama.cpp, Ollama, LM Studio). Para el pipeline completo de traducción simultánea, Tencent proporciona su propio servicio de inferencia SimulInfer; la salida de voz y la clonación de voz requieren un servicio TTS externo configurado.
- Latencia y throughput: la latencia de streaming medida (StreamLAAL) es de aproximadamente 3 segundos en audio de larga duración; el throughput en tokens/segundo no está disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Puntos fuertes |
|---|---|---|---|---|---|
| Hy-SimulMT (Tencent) | Traducción simultánea voz a voz, MoE | ~30,4B totales (~3B activos) | Chino ↔ Inglés | no disponible | StreamLAAL ~3 s, mejor RealSI-Sentence (84,7), clonación de voz |
| Qwen3.8-LiveTranslate | Traducción en vivo | no disponible | no disponible | no disponible | Mejor CoVoST2 (82,1) entre los comparados |
| Seed-LiveInterpret2.0 | Interpretación en vivo | no disponible | no disponible | no disponible | Resultados intermedios; FLEURS 85,8 |
| SeamlessStreaming (Meta) | Traducción streaming open source | no disponible | Multilingüe | no disponible | Arquitectura abierta pionera, pero puntuaciones netamente inferiores (FLEURS 72,8, RealSI-Sentence 56,9) |

Los datos de parámetros, contexto y licencia de los modelos alternativos no están disponibles en la información proporcionada; la comparativa se basa en las puntuaciones de benchmarks publicadas por Tencent.

## Limitaciones y advertencias

- Restricción de idiomas: solo soporta traducción bidireccional chino-inglés; no sirve para otros pares de idiomas, incluido el español.
- La licencia no está especificada en el repositorio, por lo que antes de cualquier despliegue comercial es imprescindible verificar los términos de uso en el repositorio oficial o contactar con Tencent.
- La salida de voz y la clonación de voz dependen de un servicio TTS externo; sin él, el modelo solo produce texto traducido.
- Los benchmarks publicados proceden de la propia model card de Tencent, sin auditoría independiente verificable en la información disponible.
- Al tratarse de un modelo especializado en traducción simultánea, no es un LLM de propósito general: no hay evidencia de capacidades de razonamiento, código o tool calling.
- Riesgo de alucinación en traducción: anticiparse al hablante (decidir traducir antes de tener el contexto completo) puede producir errores de interpretación que el sistema corrije posteriormente; es inherente al compromiso latencia/calidad.
- Sesgos conocidos, longitud de contexto y requisitos exactos de VRAM: no disponibles en la información proporcionada.
- El modelo es muy reciente (octubre de 2026), con descargas limitadas (~3.400), por lo que la madurez del ecosistema GGUF y la documentación pueden ser todavía escasas.

## Enlaces

- Repositorio en HuggingFace (GGUF): https://huggingface.co/tencent/Hy-SimulMT-30B-A3B-Interleave-GGUF
- Colección en HuggingFace: https://huggingface.co/collections/tencent/hy-simulmt
- Colección en ModelScope: https://www.modelscope.cn/collections/Tencent-Hunyuan/Hy-SimulMT
- Repositorio de GitHub (SimulInfer y SimulTrain): https://github.com/Tencent-Hunyuan/Hy-SimulMT
- App Hy Translate (Android e iOS): disponible mediante código QR en la model card; enlace directo no disponible
