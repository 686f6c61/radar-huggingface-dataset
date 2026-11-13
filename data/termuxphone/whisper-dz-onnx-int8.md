# Termuxphone/whisper-dz-onnx-int8

## Resumen

Whisper Algerian Darja ONNX INT8 es un modelo de reconocimiento automático del habla (ASR) derivado de Whisper y ajustado para transcribir darja argelina (árabe dialectal de Argelia). Lo publica el desarrollador independiente Termuxphone (Tawfik Atti) bajo licencia MIT. El modelo se distribuye exclusivamente en formato ONNX con cuantización dinámica INT8, con un peso de 92 MB, lo que lo orienta a inferencia local en dispositivos móviles y entornos de recursos limitados como Termux en Android.

La propuesta de valor no es competitiva en precisión bruta, sino en despliegue: un artefacto pequeño, offline y de baja latencia para un dialecto escasamente cubierto por los modelos ASR generalistas. El ajuste se realizó sobre un corpus propio de 440 enunciados WAV limpios a 16 kHz procedentes de Argelia occidental, El Bayadh, Skikda y refranes tradicionales argelinos.

La información pública es escasa: no se detallan la arquitectura concreta de partida (variante de Whisper), el número de parámetros, la longitud de contexto de audio ni resultados de evaluación. Cualquier uso en producción debe tratar el modelo como experimental y validarlo contra el dialecto y dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (variante no especificada), exportada a ONNX; tags del repo incluyen también wav2vec2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper, variante no confirmada) |
| Tipos de cuantizacion | INT8 dinámica (ONNX); artefacto `model_quantized.onnx` de 92 MB |
| Idiomas soportados | Árabe (`ar`), con foco en darja argelina |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de Whisper, el encoder-decoder transformer de OpenAI para ASR, y se ha ajustado de forma supervisada sobre el dataset `Termuxphone/dialects-ai-foundry`, compuesto por 440 enunciados WAV limpios a 16 kHz de dialectos argelinos (Argelia occidental, El Bayadh, Skikda y refranes tradicionales). El pipeline de origen está publicado en el repositorio de GitHub del autor. No se especifica el tamaño de la variante base de Whisper (tiny, base, small, etc.), el número de tokens de audio de entrenamiento, ni si se aplicaron técnicas de aumento de datos o regularización.

La innovación principal es el empaquetado: cuantización dinámica INT8 sobre ONNX para reducir el peso a 92 MB y permitir inferencia offline en CPU de móvil. No se documentan detalles sobre la estrategia de cuantización, calibración, ni métricas de degradación respecto al modelo en precisión completa.

## Capacidades

- Transcripción de voz a texto en darja argelina y árabe dialectal.
- Reconocimiento de refranes y expresiones tradicionales argelinas incluidas en el corpus de ajuste.
- Inferencia offline en dispositivos de recursos limitados (Termux/Android, CPU).
- Procesamiento de audio WAV a 16 kHz.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de ASR.
- Capacidades multilingües limitadas al árabe según la metadata; no se documenta cobertura de otros idiomas.

## Casos de uso

- Transcripción offline en Android: integración en Termux o apps móviles para dictado y notas de voz en darja, aprovechando el tamaño de 92 MB y la ausencia de dependencia de la nube.
- Subtitulado local de grabaciones de campo: entrevistas o material etnográfico en dialectos argelinos procesados en un portátil sin GPU.
- Preservación lingüística: digitalización de refranes y tradiciones orales argelinas, dado que el corpus de ajuste incluye ese dominio.
- Asistentes de voz de bajo consumo: prototipos de comandos por voz en dispositivos embebidos donde no cabe un modelo ASR grande.
- Herramientas de accesibilidad: transcripción en tiempo casi real en entornos con conectividad limitada o requisitos de privacidad (audio que no sale del dispositivo).
- Preprocesado de pipelines NLP: conversión de audio a texto para posteriores tareas de análisis en árabe dialectal, con validación humana dada la escasez de datos de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; para GPU, el artefacto de 92 MB requiere muy poca memoria, aunque no se documenta el consumo exacto en runtime.
- GPU recomendadas: no disponibles; el modelo está pensado para CPU y edge.
- Cabe en cualquier GPU consumer (RTX 4090, etc.) y en CPU de móvil, dado el tamaño del artefacto.
- Opciones de despliegue: ONNX Runtime (CPU), integrable en Termux/Android; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no son aplicables a ASR ONNX).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Whisper Algerian Darja ONNX INT8 (este) | no disponible | no disponible | ar (darja) | MIT | ONNX INT8 |
| Whisper (OpenAI, variantes tiny/base/small) | 39M–244M | 30 s de audio | multilingüe | MIT | PyTorch, ONNX, GGUF |
| wav2vec2 (variantes base/large) | 95M–317M | audio variable | multilingüe (según checkpoint) | MIT/Apache-2.0 | PyTorch |

No se dispone de datos de rendimiento comparativo para este modelo; la comparación se limita a características publicadas.

## Limitaciones y advertencias

- Corpus de ajuste muy reducido (440 enunciados), lo que limita la generalización a hablantes, acentos y condiciones acústicas no representadas.
- Sin benchmarks publicados: la calidad real en producción es desconocida.
- Riesgo elevado de alucinación y errores en audio con ruido, solapamiento de hablantes o vocabulario fuera del dominio.
- Cobertura dialectal restringida a las regiones del corpus (Argelia occidental, El Bayadh, Skikda); otras variantes pueden degradar notablemente.
- Metadata ambigua: los tags mezclan `whisper` y `wav2vec2`, y no se confirma la arquitectura base exacta.
- Licencia MIT permite uso comercial, pero sin garantías del autor; conviene auditar el modelo antes de desplegarlo.
- Formato exclusivamente ONNX INT8: no hay pesos en precisión completa para fine-tuning o evaluación comparativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Termuxphone/whisper-dz-onnx-int8
- Dataset: https://huggingface.co/datasets/Termuxphone/dialects-ai-foundry
- Repositorio del pipeline: https://github.com/attitawfikatti-alt/dialects-ai-foundry
