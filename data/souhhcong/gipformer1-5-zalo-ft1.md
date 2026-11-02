# souhhcong/gipformer1.5-zalo-ft1

## Resumen

El modelo `souhhcong/gipformer1.5-zalo-ft1` es un sistema de reconocimiento automático del habla (ASR) en vietnamita, publicado por el usuario souhhcong en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo base `g-group-ai-lab/gipformer1.5-68M-rnnt`, desarrollado por G-Group AI Lab, que emplea la arquitectura Zipformer con decodificación RNNT (Recurrent Neural Network Transducer). Con 68 millones de parámetros, es un modelo compacto orientado a despliegue eficiente en producción.

La relevancia del modelo radica en su formato de publicación: se distribuye en ONNX y está diseñado para ejecutarse con sherpa-onnx, un runtime de inferencia de voz de alto rendimiento que permite desplegarlo en CPU y dispositivos de borde sin necesidad de GPUs dedicadas. Esto lo hace atractivo para aplicaciones de transcripción en tiempo real con requisitos de latencia estrictos y recursos limitados.

El ajuste fino parece orientado al dominio de Zalo (la aplicación de mensajería vietnamita), lo que sugiere una especialización en vocabulario y condiciones acústicas propias de conversaciones telefónicas o de voz sobre IP en vietnamita. El acceso al repositorio está restringido y requiere aceptar condiciones en HuggingFace, y la licencia es propietaria (`private-zac2026`), lo que limita su uso a los términos que el autor establezca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer con decodificador RNNT (transducer) |
| Parametros totales | 68 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el modelo base figura como quantized) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | private-zac2026 (propietaria, acceso restringido) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en Zipformer, una arquitectura de encoder para ASR que combina capas de atención y convolución con un esquema de downsampling multi-resolución, diseñado originalmente por el equipo de k2-fsa. El decodificador es un RNNT (transducer), que modela conjuntamente la alineación acústica y la predicción de tokens, lo que permite transcripción en streaming sin necesidad de un modelo de lenguaje externo separado. El modelo base tiene 68 millones de parámetros, lo que lo sitúa en la gama compacta de ASR.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de aumento de datos o regularización específicas durante el ajuste fino. El nombre del repositorio sugiere un ajuste sobre datos de Zalo, pero no se detalla la naturaleza ni el tamaño de ese corpus. Tampoco se documenta si hubo entrenamiento con decodificación especulativa u otras optimizaciones.

## Capacidades

- Reconocimiento automático del habla en vietnamita, con salida de transcripción textual.
- Decodificación en streaming gracias a la naturaleza transducer (RNNT) del modelo.
- Ejecución en CPU y dispositivos de borde mediante sherpa-onnx, sin requerir GPU.
- Integración con el ecosistema sherpa-onnx para pipelines de voz.
- No se documenta soporte de tool calling, agentes, visión, audio multilingüe ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de llamadas de atención al cliente en vietnamita: el modelo puede procesar audio telefónico en streaming y generar transcripciones en tiempo real, adecuado por su bajo coste computacional y su especialización en el dominio de Zalo.
- Subtitulado automático de reuniones o videollamadas: con decodificación RNNT en streaming, permite generar subtítulos con latencia reducida en entornos de CPU.
- Asistentes de voz embebidos: al ejecutarse con sherpa-onnx en dispositivos de borde, puede integrarse en aplicaciones móviles o IoT para comandos de voz en vietnamita.
- Análisis de sentimiento sobre conversaciones de voz: la transcripción previa permite alimentar pipelines de NLP para clasificar la intención del cliente en centros de contacto.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones para hacerlas consultables mediante búsqueda textual.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en vivo de conversaciones presenciales o remotas en vietnamita.
- Moderación de contenido en plataformas de voz: detección de términos o patrones en audio transcrito para revisión automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo principal de despliegue (ONNX en CPU); en GPU, el modelo de 68M parámetros ocupa menos de 1 GB en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 4090, etc.), aunque el diseño está optimizado para CPU.
- Opciones de despliegue: sherpa-onnx (runtime principal), con soporte para ONNX Runtime; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| gipformer1.5-zalo-ft1 | 68M | no disponible | vi | private-zac2026 | ONNX | Restringida |
| g-group-ai-lab/gipformer1.5-68M-rnnt (base) | 68M | no disponible | vi | no disponible | no disponible | Pública (referencia) |
| Whisper small | 244M | 30 s de audio | Multilingüe | MIT | PyTorch, ONNX, GGML | Pública |
| Zipformer (k2-fsa) genérico | ~70M | no disponible | Según entrenamiento | Apache 2.0 (típico) | ONNX | Pública |

La comparativa se limita a alternativas de la misma categoría (ASR compacto). Whisper small ofrece multilingüismo y mayor comunidad, pero con más parámetros y sin especialización en vietnamita ni en el dominio de Zalo. El modelo base de G-Group AI Lab es la referencia directa, mientras que los Zipformer de k2-fsa suelen publicarse con licencias permisivas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al estar ajustado sobre datos de Zalo, puede presentar sesgos hacia el vocabulario y las condiciones acústicas de esa plataforma.
- Riesgo de alucinación: en ASR, el riesgo se manifiesta como transcripciones incorrectas o invención de palabras en audio ruidoso o con acentos no representados en el entrenamiento.
- Limitaciones de contexto o idioma: solo soporta vietnamita; no se documenta el manejo de code-switching ni de audio multilingüe.
- Restricciones de licencia: la licencia `private-zac2026` es propietaria y el acceso es restringido; el uso comercial requiere aceptar las condiciones del autor y puede estar limitado.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, lo que indica falta de validación comunitaria; no se han publicado métricas de WER ni evaluaciones independientes. El tamaño del repo (0,6 GB) sugiere que incluye pesos en ONNX, pero no se detalla la cuantización exacta.

## Enlaces

- HuggingFace: https://huggingface.co/souhhcong/gipformer1.5-zalo-ft1
- Modelo base: https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt
- sherpa-onnx (runtime): no disponible en la informacion proporcionada
- Repositorio k2-fsa / Zipformer: no disponible en la informacion proporcionada
