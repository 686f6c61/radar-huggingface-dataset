# yangsu0423/SenseVoiceSmall-OV-Optimum-SDPA

## Resumen

SenseVoiceSmall-OV-Optimum-SDPA es una exportación a formato OpenVINO IR del modelo de reconocimiento automático de voz FunAudioLLM/SenseVoiceSmall, publicada por el usuario yangsu0423. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos orientada a la inferencia optimizada en hardware Intel mediante el ecosistema optimum-intel y OpenVINO. El repositorio incluye tres variantes de cuantización (fp16, int8 e int4) en carpetas separadas, lo que permite elegir el equilibrio entre precisión y rendimiento según el hardware objetivo.

El modelo base SenseVoiceSmall es un sistema de ASR desarrollado por FunAudioLLM (equipo vinculado a Alibaba/FunASR) que emplea una arquitectura con atención SANM (Self-Attention with Non-linear Mapping). Esta exportación concreta se generó con una versión concreta de optimum-intel (`ee87618`) más dos pull requests pendientes que traducen la atención SANM a `ScaledDotProductAttention` y aplican un factor de escala de activaciones de 8.0 en las opciones de runtime del IR.

La relevancia de esta ficha es acotada: es un artefacto de despliegue, no un modelo con benchmarks propios publicados. Su interés reside en que permite ejecutar SenseVoiceSmall en CPU y aceleradores Intel con OpenVINO, lo que facilita el despliegue en entornos sin GPU dedicada. El tamaño del repositorio es de 0,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion SANM (exportada como ScaledDotProductAttention en OpenVINO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, int8, int4 |
| Idiomas soportados | no disponible |
| Licencia | other (model-license, enlazada a FunASR MODEL_LICENSE) |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base SenseVoiceSmall emplea una arquitectura de transformer con un mecanismo de atención denominado SANM (Self-Attention with Non-linear Mapping), según se desprende de la descripción de la exportación. En esta conversión a OpenVINO, esa atención se reescribe como `ScaledDotProductAttention`, lo que permite a OpenVINO aplicar optimizaciones de runtime específicas para hardware Intel. Adicionalmente, la exportación fija `ACTIVATIONS_SCALE_FACTOR=8.0` en las opciones de runtime del IR, un ajuste que afecta a la cuantización de activaciones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal más allá de la mencionada SANM. La exportación se realizó con transformers 4.57.6 y funasr 1.4.1 mediante el comando `optimum-cli export openvino`, con `--trust-remote-code` y selección de formato de peso fp16, int8 o int4.

## Capacidades

- Reconocimiento automático de voz (ASR): tarea principal del pipeline `automatic-speech-recognition`.
- Transcripción de audio a texto en las variantes fp16, int8 e int4 del IR.
- Ejecución optimizada en hardware Intel mediante OpenVINO, incluyendo CPU y aceleradores compatibles.
- No se documentan capacidades de traducción, diarización, detección de idioma, tool calling, agentes ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones en CPU: al estar exportado a OpenVINO IR, el modelo puede ejecutarse en servidores sin GPU dedicada, lo que permite desplegar transcripción de audio en infraestructura Intel existente con la variante int8 para reducir requisitos de memoria.
- Subtitulado de vídeo en pipelines de edición: la variante fp16 ofrece mayor fidelidad numérica para generar subtítulos en flujos de postproducción, integrándose como paso de ASR dentro de un pipeline de procesamiento por lotes.
- Asistentes de voz en dispositivos de borde: la variante int4 reduce el peso del modelo y facilita su despliegue en equipos con recursos limitados, siempre que el hardware objetivo disponga de soporte OpenVINO.
- Indexación y búsqueda de archivos de audio: transcripción masiva de grabaciones para construir índices de texto consultables, aprovechando el formato IR para ejecución estable en clústeres de CPU.
- Accesibilidad en aplicaciones de escritorio: integración de la transcripción en tiempo real o diferido en aplicaciones nativas que ya distribuyen runtime OpenVINO.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir el impacto de fp16 frente a int8 e int4 en la precisión de transcripción sobre el mismo audio, útil para calibrar despliegues en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,8 GB, pero no se desglosa el tamaño por variante ni el consumo en ejecución.
- GPU recomendadas: no disponible. El artefacto está orientado a OpenVINO, cuyo foco principal es CPU y aceleradores Intel; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: OpenVINO Runtime mediante los IR exportados con optimum-intel; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SenseVoiceSmall-OV-Optimum-SDPA | no disponible | no disponible | OpenVINO IR (fp16/int8/int4) | other (model-license) | Exportación comunitaria del modelo base |
| FunAudioLLM/SenseVoiceSmall | no disponible | no disponible | safetensors (formato original) | model-license | Modelo base oficial de FunAudioLLM |
| Whisper (variantes small) | no disponible en esta ficha | no disponible | safetensors, GGUF, etc. | MIT/Apache según variante | Alternativa ASR ampliamente desplegada; datos no verificados en esta consulta |

La comparación con alternativas queda limitada porque no se dispone de parámetros, contexto ni benchmarks del modelo base en la información proporcionada. No se han verificado cifras de Whisper ni de otros sistemas ASR para esta ficha, por lo que la tabla solo refleja lo documentado.

## Limitaciones y advertencias

- Es un artefacto de exportación, no un modelo entrenado: cualquier limitación del modelo base SenseVoiceSmall se hereda sin cambios.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento por idioma en la información disponible.
- La licencia es `other` con nombre `model-license` y enlace a FunASR MODEL_LICENSE; es necesario revisar ese texto antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día; no hay evidencia de validación por parte de la comunidad.
- La exportación depende de dos pull requests pendientes de optimum-intel, lo que implica que la reproducibilidad exacta requiere esas revisiones concretas.
- El uso de `--trust-remote-code` en la exportación implica ejecutar código del repositorio del modelo base; conviene auditar ese código en entornos de producción.
- No se especifican los idiomas soportados, lo que impide garantizar calidad de transcripción en castellano u otras lenguas sin pruebas propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yangsu0423/SenseVoiceSmall-OV-Optimum-SDPA
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Licencia del modelo base: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- PR de optimum-intel para exportar SANM como ScaledDotProductAttention: https://github.com/huggingface/optimum-intel/pull/2122
- PR de optimum-intel para ACTIVATIONS_SCALE_FACTOR: https://github.com/huggingface/optimum-intel/pull/2118
