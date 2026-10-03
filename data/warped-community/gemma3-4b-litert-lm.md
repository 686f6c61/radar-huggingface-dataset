# warped-community/Gemma3-4B-litert-lm

## Resumen

Gemma3-4B-litert-lm es un espejo del modelo Gemma 3 4B IT de Google empaquetado en formato LiteRT-LM para su ejecución en dispositivo (on-device), concretamente en Android. Lo mantiene la comunidad warped-community para su uso dentro de la aplicación Warped, y deriva del artefacto publicado por litert-community bajo el nombre `gemma3-4b-it-int4-web.task`. No se trata de un entrenamiento nuevo ni de un fine-tuning, sino de una redistribución de un artefacto ya cuantizado en int4 y adaptado al runtime LiteRT-LM.

El modelo base, `google/gemma-3-4b-it`, es un transformer decoder-only de aproximadamente 4.000 millones de parámetros, con soporte multimodal (texto e imagen) y una ventana de contexto de 128.000 tokens, según la documentación pública de Google. La variante aquí publicada prioriza el tamaño reducido (el repositorio ocupa 2,6 GB) y la ausencia de dependencia de red, lo que la hace adecuada para asistentes locales en teléfono.

Su relevancia actual radica en que permite desplegar un modelo de 4B sin conexión, con la privacidad que ello implica, sobre hardware móvil. El contrapunto es que se trata de un artefacto derivado con documentación mínima: la model card del espejo no detalla composición del dataset, benchmarks ni idiomas soportados, por lo que cualquier evaluación en producción debe apoyarse en la documentación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma 3 4B IT); artefacto empaquetado para el runtime LiteRT-LM |
| Parametros totales | ~4.000 millones (modelo base; no verificado en el espejo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens segun la documentacion del modelo base; no confirmado para este paquete |
| Tipos de cuantizacion | int4 (variante `-int4-web` del artefacto de origen) |
| Idiomas soportados | no disponible en la informacion del espejo; el modelo base declara soporte multilingue amplio |
| Licencia | Gemma (terminos heredados del modelo base) |
| Formato de pesos | `.task` (LiteRT-LM), derivado de un artefacto cuantizado int4 |

Datos adicionales: tamano del repositorio 2,6 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-03 y actualizado el 2026-10-03. Pipeline declarado: no disponible.

## Arquitectura y entrenamiento

Este repositorio no documenta entrenamiento propio. El artefacto es una copia del fichero `gemma3-4b-it-int4-web.task` publicado por litert-community, que a su vez convierte el modelo `google/gemma-3-4b-it` al formato `.task` consumido por LiteRT-LM. Por tanto, la arquitectura efectiva corresponde a la del modelo base: un transformer decoder-only con atención local y global intercalada, normalización RMSNorm, activaciones GeGLU y normalización QK, según la documentación técnica pública de la familia Gemma 3. Las cifras concretas de preentrenamiento, número de tokens, composición del dataset y fases de alineación (RLHF, DPO u otras) no se detallan en la model card del espejo.

La innovación destacable de este repositorio no es algorítmica, sino de empaquetado: la conversión a LiteRT-LM y la cuantización int4 reducen el peso a 2,6 GB y permiten ejecución local en Android sin backend remoto. El sufijo `-web` del artefacto de origen sugiere una variante orientada a despliegue ligero; no se especifica en la información disponible si conserva el codificador de visión del modelo base multimodal.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instruct `gemma-3-4b-it`.
- Razonamiento básico y respuesta a instrucciones en formato chat.
- Capacidades multilingües amplias según el modelo base; el espejo no declara lista de idiomas.
- Ejecución completamente local en dispositivo, sin llamadas a red, mediante LiteRT-LM.
- Integración con el runtime LiteRT-LM y, previsiblemente, con la MediaPipe LLM Inference API para Android.
- Capacidad multimodal (imagen) del modelo base: no confirmada en este paquete por falta de documentación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o multi-step reasoning: no disponible en la información proporcionada.
- Modo de razonamiento extendido (thinking mode), audio o visión activa: no disponible.

## Casos de uso

- Asistente conversacional on-device en Android: integrado en una app (como Warped) mediante LiteRT-LM, el modelo responde sin enviar datos a servidores externos, lo que resulta adecuado para consultas con información personal o sensible.
- Resumen local de notas y documentos: con una ventana teórica de hasta 128.000 tokens en el modelo base, permite condensar textos largos en el propio dispositivo, siempre que la memoria del teléfono soporte la caché KV correspondiente.
- Traducción y reescritura offline: útil en viajes o entornos sin conectividad, donde no hay acceso a APIs en la nube.
- Extracción de datos estructurados en local (por ejemplo, convertir correos o mensajes en JSON): evita sacar contenido del dispositivo en aplicaciones de gestión personal.
- Asistentes de accesibilidad: descripción de texto en pantalla, simplificación de lenguaje o lectura guiada, ejecutables sin conexión y con baja latencia.
- Prototipado rápido de funciones de IA generativa en apps Android: el formato `.task` permite probar un modelo de 4B en emulador o dispositivo real antes de decidir una arquitectura de despliegue definitiva.
- Clasificación y etiquetado de texto en el borde (edge): moderación de contenido local, categorización de entradas de diario o triaje de mensajes sin coste de inferencia por token en la nube.
- Base para fine-tuning posterior: al derivar de `google/gemma-3-4b-it`, puede servir como punto de partida para adaptaciones LoRA y su posterior reconversión a LiteRT-LM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye métricas (MMLU, HumanEval, GSM8K ni equivalentes), y tampoco se ofrecen comparativas con otros modelos. Cualquier cifra de rendimiento debería tomarse de la documentación oficial del modelo base `google/gemma-3-4b-it` o medirse directamente sobre el dispositivo objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU de escritorio: alrededor de 3-4 GB solo para los pesos en int4, más la caché KV; en la práctica, entre 4 y 6 GB según la longitud de contexto utilizada.
- GPU recomendadas para escritorio: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 o superiores; en entornos de servidor, A100 o H100 solo tendrían sentido con el modelo base sin cuantizar, no con este artefacto móvil.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM, y también en iGPU modernas con memoria unificada suficiente.
- Android: se recomienda un dispositivo con al menos 6-8 GB de RAM para cargar los 2,6 GB de pesos más el contexto; el rendimiento en gamas medias depende del acelerador disponible (GPU, NPU o CPU).
- Opciones de despliegue: LiteRT-LM y MediaPipe LLM Inference API son las vías nativas para este formato `.task`. Para servidores, conviene usar el modelo base `google/gemma-3-4b-it` en safetensors con vLLM, TGI o llama.cpp (prevía conversión a GGUF), en lugar de este paquete.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| warped-community/Gemma3-4B-litert-lm | ~4.000 M (base) | 128.000 tokens segun base | `.task` (LiteRT-LM, int4) | Gemma | Espejo para app Android; 0 descargas, documentacion minima |
| litert-community/Gemma3-4B-IT | ~4.000 M | 128.000 tokens segun base | `.task` (LiteRT-LM) | Gemma | Origen directo del artefacto; mantenido por la comunidad LiteRT |
| google/gemma-3-4b-it | ~4.000 M | 128.000 tokens | safetensors (y variantes) | Gemma | Modelo original multimodal, para servidor o conversion propia |
| google/gemma-3-1b-it | ~1.000 M | 32.000 tokens segun base | safetensors (y variantes) | Gemma | Alternativa mas ligera para dispositivos con menos memoria |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Artefacto derivado sin entrenamiento propio: cualquier mejora o regresión respecto al modelo base es atribuible a la cuantización int4, no a un ajuste documentado.
- Documentación mínima: la model card no indica idiomas, benchmarks, composición de datos ni limitaciones específicas; hay que remitirse a la documentación de Google para el modelo base.
- Riesgo de alucinación: como cualquier modelo generativo de 4B, puede producir afirmaciones falsas con apariencia de verosimilitud, especialmente en tareas de conocimiento factual o matemáticas.
- Sesgos: no evaluados en este repositorio; el modelo base hereda los sesgos de sus datos de entrenamiento, no publicados en detalle.
- Cuantización int4: degrada la precisión respecto a los pesos en fp16/bf16, con impacto variable en razonamiento y código. No se han publicado evaluaciones de esta pérdida.
- Multimodalidad no confirmada: el sufijo `-web` y la ausencia de documentación impiden asegurar que el paquete conserve el codificador de visión del modelo base.
- Contexto real limitado por hardware: aunque el modelo base declare 128.000 tokens, la caché KV en un teléfono restringe en la práctica ventanas mucho menores.
- Licencia Gemma: el uso comercial está permitido bajo los términos de Google, pero impone obligaciones de atribución y restricciones de uso aceptable. Es necesario aceptar los términos y verificar el cumplimiento en productos distribuidos.
- Huella comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento; conviene fijar una revisión concreta si se usa en producción.
- Repositorio de 2,6 GB: implica tiempos de descarga y almacenamiento relevantes tanto en CI como en dispositivos finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/warped-community/Gemma3-4B-litert-lm
- Artefacto de origen: https://huggingface.co/litert-community/Gemma3-4B-IT
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Documentacion de Gemma 3: https://ai.google.dev/gemma/docs/core/model_card_3
- LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- MediaPipe LLM Inference API: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference
- Pagina de modelos Gemma: https://ai.google.dev/gemma
