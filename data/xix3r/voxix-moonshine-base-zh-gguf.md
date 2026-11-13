# xix3r/voxix-moonshine-base-zh-gguf

## Resumen

Voxix Moonshine Base ZH GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-base-zh, publicada por el usuario xix3r para su uso con la librería transcribe.cpp. El modelo original es un ajuste fino sobre moonshine-base de Useful Sensors, una arquitectura encoder-decoder transformer de aproximadamente 61,5 millones de parámetros (62M según la model card) especializada en transcripción de mandarín. Esta conversión concreta permite ejecutar el modelo en C++ nativo sin dependencias de Python ni de PyTorch, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados.

La relevancia de esta ficha radica en que el modelo ocupa un nicho muy específico: ASR de mandarín de muy bajo coste computacional, con un peso que va desde los 74 MB en cuantización Q8_0 hasta los 236 MB en F32. Frente a los grandes modelos ASR multilingües, Moonshine apuesta por una arquitectura sin STFT ni banco de filtros mel, consumiendo PCM crudo a 16 kHz directamente a través de un stem convolucional de tres capas Conv1d. Esta decisión de diseño reduce el preprocesado y facilita el despliegue en entornos embebidos.

La conversión incluye tres cuantizaciones (F32, F16 y Q8_0) con métricas de CER medidas sobre el split de test de FLEURS zh (945 utterances), lo que permite evaluar el impacto de la cuantización en la calidad de transcripción. El modelo es monolingüe (solo chino mandarín), no soporta traducción, detección de idioma ni timestamps, y su licencia MIT facilita el uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer con stem Conv1d de tres capas (sin STFT ni banco mel) |
| Parametros totales | 61.513.920 (62M según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR; max_length de decodificación = 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Chino mandarín (zh) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine original: un encoder-decoder transformer que procesa audio PCM crudo a 16 kHz mediante un stem convolucional de tres capas Conv1d, eliminando por completo el cálculo de STFT y el banco de filtros mel que usan la mayoría de modelos ASR tipo Whisper. Esta elección reduce el coste de preprocesado y el número de operaciones por fotograma de audio. El decoder genera únicamente la transcripción, sin tokens especiales de idioma, timestamps ni tareas de traducción.

El modelo base fue ajustado por Useful Sensors sobre moonshine-base para mandarín. La model card original de UsefulSensors/moonshine-base-zh no proporciona detalles sobre el dataset de entrenamiento, número de tokens de audio ni procedimiento de ajuste (RLHF, DPO u otros). La conversión GGUF se realizó a partir del commit 1df4f95 del modelo upstream, fijado el 2026-05-12, y se validó numéricamente contra la referencia de transformers en el commit 90bf720 de transcribe.cpp. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto en chino mandarín a partir de audio PCM mono a 16 kHz.
- Consumo directo de PCM crudo sin necesidad de calcular STFT ni banco de filtros mel.
- Salida de solo transcripción: no genera timestamps, no traduce y no detecta idioma.
- Funcionamiento en modo no streaming (streaming: false según metadatos del autor).
- Ejecución en C++ nativo mediante transcribe.cpp, sin dependencias de Python.
- Tres niveles de cuantización para adaptar el equilibrio entre tamaño y precisión.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo ASR puro).

## Casos de uso

- Transcripción de reuniones y notas de voz en mandarín: el modelo procesa audio de 16 kHz mono y genera la transcripción completa, adecuado para integrarse en pipelines de post-procesado de audio corporativo donde el coste por hora de audio debe ser mínimo.
- Subtitulado offline de contenido en chino: al no generar timestamps, se usaría para obtener el texto completo y posteriormente alinear con herramientas externas de forced alignment para producir subtítulos sincronizados.
- Asistentes de voz embebidos en dispositivos de bajo consumo: con 74 MB en Q8_0 y ejecución en C++ mediante transcribe.cpp, puede desplegarse en dispositivos edge con CPU o GPU integrada sin necesidad de Python ni frameworks pesados.
- Pre-procesado de datasets de audio en mandarín: útil para generar transcripciones preliminares a gran escala sobre corpus de audio, con un CER de referencia del 17% en FLEURS zh que permite filtrar y revisar manualmente solo los segmentos de baja confianza.
- Aplicaciones de accesibilidad para hablantes de mandarín: transcripción en tiempo casi real (RTF de 79,5 en Metal y 80,5 en CPU sobre M4 Max) para convertir voz en texto en entornos de escritorio.
- Integración en sistemas de atención al cliente con grabaciones en chino: el modelo transcribe las llamadas grabadas para su análisis posterior, con la ventaja de que la licencia MIT permite uso comercial sin restricciones.
- Investigación en ASR de bajo coste: como referencia reproducible con métricas CER publicadas y validación numérica contra transformers, sirve para comparar técnicas de cuantización o arquitecturas ASR ligeras.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Referencia transformers F32 (MPS) |
|---|---:|---:|---:|---:|
| CER FLEURS zh test (945 utterances) | 16,65% | 16,65% | 17,00% | 16,61% |
| RTF en M4 Max (Metal) | no disponible | no disponible | 79,5 | no disponible |
| RTF en M4 Max (CPU) | no disponible | no disponible | 80,5 | no disponible |
| RTF en Ryzen 4750U (Vulkan) | no disponible | no disponible | 34,5 | no disponible |
| RTF en Ryzen 4750U (CPU) | no disponible | no disponible | 22 | no disponible |

El CER se midió con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192, coincidiendo con la generation_config upstream). La diferencia entre F32/F16 y Q8_0 es de aproximadamente 0,35 puntos porcentuales, y la referencia en transformers F32 queda dentro del ruido de bootstrap respecto a las conversiones C++. UsefulSensors no publica CER por idioma para esta variante.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el modelo completo en F32 ocupa 236 MB, en F16 126 MB y en Q8_0 74 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon M-series) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no requiere GPU de datacenter.
- Cabe en cualquier GPU consumer e incluso en CPU: los RTF medidos (79,5 en Metal M4 Max, 80,5 en CPU M4 Max, 34,5 en Vulkan Ryzen 4750U, 22 en CPU Ryzen 4750U) indican ejecución muy por encima del tiempo real en hardware modesto.
- Opciones de despliegue: transcribe.cpp (única librería soportada oficialmente para estos pesos GGUF); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los RTF publicados (valores superiores a 20 en todos los backends probados) implican que el modelo procesa audio entre 20 y 80 veces más rápido que el tiempo real en el hardware medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | CER FLEURS zh | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| moonshine-base-zh (este, GGUF) | 61,5M | PCM 16 kHz, max_length 192 | zh | 16,65% (F32) | MIT | GGUF |
| moonshine-base (original) | 62M | PCM 16 kHz | en | no disponible | MIT | safetensors |
| Whisper tiny | 39M | 30 s mel | multilingue | no disponible | MIT | safetensors, GGUF |
| Whisper base | 74M | 30 s mel | multilingue | no disponible | MIT | safetensors, GGUF |

La comparación con Whisper es la más directa por tamaño y licencia, pero no se dispone de CER de Whisper sobre FLEURS zh en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable. La ventaja diferencial de Moonshine frente a Whisper es el consumo de PCM crudo sin STFT, lo que simplifica el pipeline de despliegue.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe chino mandarín; no soporta otros idiomas ni cambio de idioma dentro de una misma grabación.
- Sin timestamps: la salida es solo texto, lo que impide alineación temporal directa y requiere herramientas externas para subtitulado sincronizado.
- Sin streaming: el modo streaming está desactivado (streaming: false), por lo que no es adecuado para transcripción en tiempo real de flujo continuo.
- Sin detección de idioma ni traducción: no puede identificar el idioma del audio ni traducir a otro idioma.
- CER de referencia del 17% en FLEURS zh: implica un margen de error notable; en producción conviene revisar o filtrar las transcripciones, especialmente en dominios con vocabulario especializado.
- Riesgo de alucinación: como todo modelo generativo ASR, puede producir texto plausible no presente en el audio, especialmente en segmentos con ruido o silencios.
- Sesgos: no se documentan sesgos específicos en la información disponible; el modelo base carece de model card detallada sobre datos de entrenamiento.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero se hereda del modelo base y conviene verificar la model card upstream para términos completos.
- Dependencia de transcribe.cpp: los pesos GGUF están validados solo contra esa librería en el commit 90bf720; otros runners GGUF pueden no ser compatibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-base-zh-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base-zh
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-base-zh/commit/1df4f95
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper de referencia (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
