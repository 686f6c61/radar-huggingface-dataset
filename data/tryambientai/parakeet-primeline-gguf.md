# tryambientai/parakeet-primeline-gguf

## Resumen

parakeet-primeline-gguf es la conversión a formato GGUF del modelo primeline/parakeet-primeline, un sistema de reconocimiento automático del habla (ASR) multilingüe de aproximadamente 627 millones de parámetros, afinado específicamente para alemán. Lo desarrolla primeLine a partir de la arquitectura NVIDIA parakeet-tdt-0.6b-v3, y esta conversión concreta la publica el usuario tryambientai para su uso con la librería transcribe.cpp. El modelo resuelve el problema de la transcripción de voz a texto con alta precisión en alemán, manteniendo a la vez cobertura de 25 idiomas europeos.

La arquitectura combina un codificador FastConformer con un decodificador transducer TDT (Token-and-Duration Transducer), lo que permite un rendimiento notablemente superior al de los transducers clásicos. El modelo acepta audio WAV mono a 16 kHz y produce transcripciones con puntuación, mayúsculas y marcas de tiempo opcionales a nivel de token. Su tamaño contenido (485 MB en cuantización Q4_K_M) lo hace viable en hardware de consumo.

La relevancia de esta ficha radica en que ofrece una alternativa eficiente y ligera a Whisper para transcripción multilingüe, con un WER del 5,98 % en FLEURS alemán en su versión cuantizada Q4_K_M, prácticamente idéntico al de la versión F32 (6,00 %). La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + TDT/RNNT transducer (decodificador) |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (soporta audio de varias horas mediante atención local) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | de, bg, hr, cs, da, nl, en, et, fi, fr, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura parakeet-tdt-0.6b-v3 de NVIDIA: un codificador FastConformer, variante eficiente del Conformer que reduce el coste computacional mediante downsampling y atención local, acoplado a un decodificador Token-and-Duration Transducer (TDT). El TDT predice conjuntamente tokens y duraciones, lo que acelera la decodificación frente a los transducers RNNT estándar. El modelo base fue desarrollado por NVIDIA y posteriormente afinado por primeLine para mejorar la precisión en alemán.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (poco habituales en ASR). El modelo base cubre 25 idiomas europeos, y el fine-tuning de primeLine se orienta a dominios y acentos alemanes. Esta conversión GGUF se generó a partir del commit 3f1a9bc del modelo original (fijado el 2026-08-16) y se validó numéricamente contra la referencia NeMo en el commit 856d7c1 de transcribe.cpp. Una innovación destacable es el soporte de audio de varias horas gracias a los mecanismos de atención local del codificador.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, con especial énfasis en alemán.
- Puntuación automática y capitalización en la salida.
- Marcas de tiempo a nivel de token (timestamps: token).
- Detección automática de idioma (lang_detect: true).
- Manejo de audio largo (varias horas) mediante atención local.
- Robustez en distintos dominios: habla leída limpia y conversación espontánea.
- Salida con ortografía suiza (`ss` en lugar de `ß`), propiedad del tokenizador SentencePiece de la familia v3.
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar audio de varias horas gracias a la atención local del codificador, generando actas con puntuación y marcas de tiempo por token que facilitan la navegación por la grabación.
- Subtitulado automático de vídeo: las marcas de tiempo a nivel de token permiten alinear subtítulos con precisión, y la salida con puntuación y mayúsculas reduce el postprocesado necesario.
- Atención al cliente y análisis de llamadas: con 25 idiomas soportados y detección automática de idioma, se puede transcribir conversaciones multilingües para su análisis posterior o para alimentar sistemas de control de calidad.
- Transcripción de entrevistas y periodismo: el modelo mantiene alta precisión en habla espontánea, adecuado para entrevistas con acentos y ruido moderado, con salida lista para revisión editorial.
- Documentación clínica o legal en alemán: el fine-tuning específico para alemán y el bajo WER en FLEURS (5,98 % en Q4_K_M) lo hacen adecuado para dictado en dominios especializados, siempre con revisión humana.
- Despliegue en dispositivos de borde: con 485 MB en Q4_K_M, puede ejecutarse en CPU o GPU integrada para transcripción local sin conexión, útil en entornos con requisitos de privacidad.
- Investigación en ASR: al ser una conversión GGUF validada contra NeMo, sirve como referencia reproducible para experimentos con transcribe.cpp y comparativas de cuantización.

## Benchmarks y rendimiento

| Modelo / cuantización | WER FLEURS de (test) | RTF Metal (M4 Max) | RTF Vulkan (Ryzen 4750U) | RTF CPU (Ryzen 4750U) |
|---|---:|---:|---:|---:|
| F32 | 6,00 % | no disponible | no disponible | no disponible |
| F16 | 6,00 % | no disponible | no disponible | no disponible |
| Q8_0 | 6,00 % | no disponible | no disponible | no disponible |
| Q6_K | 5,96 % | no disponible | no disponible | no disponible |
| Q5_K_M | 5,99 % | no disponible | no disponible | no disponible |
| Q4_K_M | 5,98 % | no disponible | no disponible | no disponible |
| Modelo (global) | — | 151 | 12,5 | 7,5 (CPU) / 28 (Metal CPU) |

Notas: el WER se midió sobre el split de test de FLEURS alemán (862 enunciados) con decodificación transducer voraz y sin LM externo. El RTF (factor de tiempo real) se expresa como múltiplo de la velocidad en tiempo real: 151 en Metal sobre M4 Max, 12,5 en Vulkan y 7,5 en CPU sobre Ryzen 4750U. La ortografía suiza (`ss` por `ß`) penaliza aproximadamente 1,05 pp; al normalizar `ß`→`ss` en ambos lados, la referencia baja a 4,92 % y F32 a 4,94 %. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en Q4_K_M, 0,6 GB en Q6_K, 0,75 GB en Q8_0, 1,3 GB en F16 y 2,5 GB en F32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16; A100, H100 o RTX 4090 no son necesarias dado el tamaño reducido, pero ofrecerían el máximo throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4060, GTX 1650, etc.) e incluso en GPU integradas.
- Opciones de despliegue: transcribe.cpp (librería nativa con soporte Metal, Vulkan y CPU). No se indica soporte para vLLM, llama.cpp, Ollama o TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput estimados: RTF de 151 en Metal sobre M4 Max, 12,5 en Vulkan y 7,5 en CPU sobre Ryzen 4750U, lo que implica transcripción muy por encima del tiempo real en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-primeline (este) | 627 M | varias horas (atención local) | 25 europeos | CC-BY-4.0 | GGUF |
| NVIDIA parakeet-tdt-0.6b-v3 | 600 M | varias horas | multilingüe europeo | no disponible | NeMo |
| Whisper large-v3 | 1.550 M | 30 s por ventana | ~99 | MIT | safetensors, GGUF |
| Whisper small | 244 M | 30 s por ventana | ~99 | MIT | safetensors, GGUF |

La comparativa con Whisper se basa en características generales conocidas; no se dispone de WER comparativo en la información proporcionada. El modelo destaca por su relación precisión/tamaño en alemán y por su licencia permisiva, frente a la mayor cobertura idiomática de Whisper a costa de un tamaño muy superior.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos; al estar afinado para alemán, el rendimiento en otros idiomas puede ser inferior al del modelo base.
- Riesgo de alucinación: como todo modelo ASR, puede producir transcripciones plausibles pero incorrectas en audio con ruido, acentos fuertes o solapamiento de hablantes.
- Limitaciones de contexto o idioma: aunque soporta 25 idiomas, el fine-tuning está orientado a alemán; no soporta streaming ni traducción.
- Ortografía: emplea formas suizas (`ss` en lugar de `ß`), lo que puede requerir normalización en producción para textos alemanes estándar.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor original y mantener el aviso de licencia.
- Caveats para producción: requiere audio WAV mono a 16 kHz (conversión previa con ffmpeg); la librería transcribe.cpp debe compilarse desde fuente; el repositorio tiene 0 descargas y 0 likes, por lo que su adopción es aún incipiente.
- El modelo se distribuye como conversión no oficial (tryambientai), aunque validada contra la referencia NeMo; para producción crítica conviene verificar contra el modelo original.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/tryambientai/parakeet-primeline-gguf
- Modelo base: https://huggingface.co/primeline/parakeet-primeline
- Commit del modelo base: https://huggingface.co/primeline/parakeet-primeline/commit/3f1a9bc
- Modelo NVIDIA original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/856d7c1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-primeline.md
- Descarga F32: https://huggingface.co/handy-computer/parakeet-primeline-gguf/resolve/main/parakeet-primeline-F32.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/parakeet-primeline-gguf/resolve/main/parakeet-primeline-Q4_K_M.gguf
