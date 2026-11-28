# wasi-master/addis-scribe-swahili-streaming-sherpa-onnx

## Resumen

`wasi-master/addis-scribe-swahili-streaming-sherpa-onnx` es una exportación al formato sherpa-onnx del modelo de reconocimiento automático del habla (ASR) `addisai/addis-scribe-swahili-streaming`, desarrollado originalmente por Addis AI. La exportación la firma el usuario wasi-master y está pensada para su uso en WM Keyboard, un teclado con reconocimiento de voz offline basado en la pila sherpa-onnx. El resultado es un paquete de 0,7 GB en formato ONNX, cuantizado a int8 y configurado con chunks de 320 ms, lo que lo hace apto para inferencia en streaming sobre dispositivos de recursos limitados.

El modelo base es un sistema ASR en streaming orientado al suajili (swahili), una lengua con cobertura relativamente escasa en los grandes sistemas ASR comerciales. La exportación elimina la necesidad de configurar el idioma en cada flujo de audio: el prompt interno del modelo (índice 48) queda fijado como `auto_prompt_id` del encoder, de modo que el reconocedor infiere directamente en su idioma de entrenamiento sin parámetros adicionales en tiempo de ejecución.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de despliegue de ASR en streaming para una lengua de bajos recursos; por otro, ilustra el flujo de conversión de un modelo de Hugging Face al ecosistema sherpa-onnx mediante el exportador Nemotron 3.5, un patrón cada vez más habitual para llevar ASR a entornos de borde (móvil, escritorio, embedded) sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ASR en streaming; exportado con el exportador Nemotron 3.5 de sherpa-onnx) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa audio en chunks de 320 ms en modo streaming) |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | suajili (swahili), segun el modelo base; lista oficial de idiomas no disponible |
| Licencia | openmdw-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | ONNX (formato sherpa-onnx) |
| Tamano del repositorio | 0,7 GB |
| Pipeline | automatic-speech-recognition |
| Modelo base | addisai/addis-scribe-swahili-streaming (revision f9d460131702f6463c391c8dbc47192d519c77b8) |
| Chunk de streaming | 320 ms |
| Fecha de creacion | 2026-11-28 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `addisai/addis-scribe-swahili-streaming` en la documentación proporcionada. La model card indica únicamente que se trata de un modelo ASR en streaming y que el entrenamiento completo corrió a cargo de Addis AI. La exportación se realizó con el exportador Nemotron 3.5 de sherpa-onnx, que produce artefactos ONNX optimizados para inferencia en streaming.

El proceso de exportación fija el prompt del modelo (índice 48) como `auto_prompt_id` del encoder, lo que implica que el reconocedor queda vinculado al suajili sin necesidad de especificar el idioma en cada flujo. La cuantización aplicada es int8, lo que reduce el tamaño y el coste computacional a cambio de una posible pérdida menor de precisión. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino supervisado.

## Capacidades

- Reconocimiento automático del habla en streaming con latencia de chunk de 320 ms.
- Transcripción en suajili (swahili) sin configuración explícita de idioma en tiempo de ejecución.
- Inferencia offline: el paquete ONNX está diseñado para ejecutarse localmente sin conexión a servicios en la nube.
- Integración con la pila sherpa-onnx, que permite su uso en aplicaciones de escritorio, móviles y sistemas embebidos.
- Cuantización int8 que facilita el despliegue en hardware con recursos limitados.
- No se documentan capacidades de traducción, diarización, detección de idioma, tool calling ni agentes.

## Casos de uso

- **Teclados con dictado por voz offline**: es el caso de uso declarado (WM Keyboard). El modelo transcribe audio del micrófono en streaming y lo inserta en el campo de texto sin enviar datos a la nube, lo que preserva la privacidad y permite su uso sin conectividad.
- **Aplicaciones móviles de accesibilidad**: personas con dificultades motoras pueden dictar texto en suajili en aplicaciones Android o iOS integrando el paquete ONNX mediante sherpa-onnx, con un consumo de memoria contenido gracias a la cuantización int8.
- **Transcripción de reuniones y notas de voz en local**: herramientas de productividad en escritorio pueden transcribir grabaciones o audio en directo en suajili sin depender de APIs externas, con el coste de infraestructura que ello evita.
- **Sistemas de atención al ciudadano en zonas con conectividad limitada**: administraciones o ONG en África Oriental pueden desplegar asistentes de voz en suajili sobre equipos modestos, aprovechando que el modelo funciona sin conexión.
- **Subtitulado en directo de bajo coste**: el modo streaming con chunks de 320 ms permite generar subtítulos casi en tiempo real en emisiones o eventos locales en suajili, con hardware de gama media.
- **Integración en dispositivos empotrados (Raspberry Pi, cajas TV, terminales de punto de venta)**: el formato ONNX int8 y el tamaño de 0,7 GB permiten ejecutar el reconocedor en dispositivos sin GPU dedicada, habilitando interfaces por voz en entornos comerciales.
- **Investigación en ASR para lenguas de bajos recursos**: sirve como referencia reproducible para comparar pipelines de exportación sherpa-onnx frente a otros runtimes en tareas de reconocimiento en suajili.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con pesos int8 y un repositorio de 0,7 GB, la huella en memoria es del orden de cientos de MB, pero no se especifica el consumo exacto del runtime.
- **GPU recomendadas**: no se documentan. El modelo está pensado para inferencia en CPU mediante sherpa-onnx, por lo que no requiere GPU.
- **Compatibilidad con GPU de consumo**: no se indica soporte GPU; el despliegue típico es en CPU (móvil, escritorio, embedded).
- **Opciones de despliegue**: sherpa-onnx (runtime nativo del formato). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto ASR.
- **Latencia y throughput**: no disponibles. El diseño en chunks de 320 ms sugiere una latencia de streaming del orden de ese valor por segmento, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Contexto / chunk |
|---|---|---|---|---|---|
| addis-scribe-swahili-streaming-sherpa-onnx (este) | ASR streaming | suajili | ONNX int8 | openmdw-1.1 | 320 ms |
| addisai/addis-scribe-swahili-streaming | ASR streaming (modelo base) | suajili | no disponible | no disponible | no disponible |
| Whisper (variantes de OpenAI) | ASR (no streaming nativo) | multilingue | safetensors, GGUF, ONNX (via conversiones) | MIT (variantes) | 30 s por ventana |
| Modelos ASR de sherpa-onnx para otras lenguas | ASR streaming | varias | ONNX | varias | chunks configurables |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: el modelo está especializado en suajili; no se documenta cobertura multilingüe ni detección automática de idioma.
- **Riesgo de alucinación**: como todo sistema ASR, puede generar transcripciones plausibles pero incorrectas en audio ruidoso, con acentos no vistos o con vocabulario técnico fuera de dominio.
- **Sesgos**: no se documentan análisis de sesgo por género, edad, dialecto o región; el suajili tiene variantes regionales (Kenia, Tanzania, RDC) cuya cobertura relativa se desconoce.
- **Licencia**: la licencia openmdw-1.1 está etiquetada como `other` en Hugging Face; es imprescindible revisar sus términos antes de un uso comercial, ya que no es una licencia permisiva estándar tipo MIT o Apache 2.0.
- **Procedencia**: la exportación la realiza un tercero (wasi-master) a partir del modelo de Addis AI; no hay garantía de que el proceso de cuantización int8 preserve la calidad del modelo original.
- **Madurez**: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción ni de validación externa.
- **Documentación escasa**: no se publican métricas de WER, ni detalles de arquitectura, ni límites de longitud de audio, lo que dificulta una evaluación rigurosa previa a su adopción.
- **Formato cerrado al ecosistema sherpa-onnx**: el artefacto ONNX está pensado para ese runtime; usarlo fuera de él requiere trabajo adicional de integración.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wasi-master/addis-scribe-swahili-streaming-sherpa-onnx)
- [Modelo base: addisai/addis-scribe-swahili-streaming](https://huggingface.co/addisai/addis-scribe-swahili-streaming)
- [Licencia openmdw-1.1](https://openmdw.ai/license/1-1/)
- [Repositorio sherpa-onnx (GitHub)](https://github.com/k2-fsa/sherpa-onnx)
