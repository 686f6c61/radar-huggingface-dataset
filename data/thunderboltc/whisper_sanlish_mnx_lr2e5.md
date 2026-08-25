# thunderboltc/whisper_sanlish_mnx_lr2e5

## Resumen

`whisper_sanlish_mnx_lr2e5` es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario thunderboltc, obtenido mediante fine-tuning de `openai/whisper-small` sobre un conjunto de datos no especificado. El nombre del modelo y los repositorios asociados indican que está especializado en santali, una lengua austroasiática hablada principalmente en la India, aunque la model card no confirma explícitamente el idioma de entrenamiento. Se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face con formato safetensors.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper, con 241,7 millones de parámetros y una ventana de audio de 30 segundos. Su relevancia radica en que cubre un idioma de bajos recursos con pocas herramientas de ASR disponibles, lo que puede facilitar tareas de transcripción y subtitulado en santali. Sin embargo, los resultados de evaluación muestran una tasa de error de palabra (WER) del 39,25 %, lo que indica una precisión limitada y sugiere que el modelo es más adecuado para prototipos que para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | santali (según el nombre del modelo); el modelo base soporta 99 idiomas, pero no se garantiza el rendimiento en otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `openai/whisper-small`, un transformer encoder-decoder con atención de escala logarítmica sobre espectrogramas de Mel. El encoder procesa 30 segundos de audio y el decoder genera texto autoregresivamente. El fine-tuning se realizó con el Trainer de Hugging Face durante 25 épocas, con una tasa de aprendizaje de 2e-5, tamaño de lote efectivo de 16 (batch 8 con acumulación de gradiente 2), optimizador AdamW, scheduler lineal con 50 pasos de warmup y precisión mixta nativa (AMP). El conjunto de datos de entrenamiento no está documentado en la model card, lo que limita la reproducibilidad. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Reconocimiento automático del habla en santali, con salida de texto transcrito.
- Al estar basado en Whisper, conserva la capacidad de manejar audio de hasta 30 segundos por pasada, aunque no se ha verificado su rendimiento en otros idiomas.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso.
- No se indica capacidad de traducción de voz ni identificación de idioma, aunque el modelo base las incluye; el fine-tuning podría haberlas degradado.

## Casos de uso

- Transcripción de entrevistas y testimonios en santali: el modelo puede convertir grabaciones de audio en texto para archivos históricos o periodísticos, aunque el WER alto exige revisión manual posterior.
- Subtitulado de vídeos en santali: útil para contenido audiovisual local, generando subtítulos preliminares que luego se corrigen.
- Asistencia a la documentación lingüística: investigadores pueden transcribir corpus orales de santali para análisis fonético o gramatical, con la ventaja de que el modelo es ligero y ejecutable en hardware modesto.
- Desarrollo de asistentes de voz para hablantes de santali: integrable en aplicaciones móviles o web mediante pipelines de ASR, siempre que se acepte una tasa de error elevada.
- Creación de datos de entrenamiento para otros modelos: las transcripciones generadas pueden servir como pseudo-etiquetas para entrenar modelos más robustos.
- Evaluación comparativa de ASR en lenguas minoritarias: sirve como punto de partida para medir el progreso en santali frente a futuros modelos.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (no se especifica su composición):

| Metrica | Valor |
|---|---|
| Loss | 0,6863 |
| WER (Word Error Rate) | 39,2533 % |
| CER (Character Error Rate) | 8,7314 % |

La evolución durante el entrenamiento muestra una mejora progresiva, con el mejor WER en la época 9 (38,45 %) y el mejor CER en la época 9 (8,31 %), aunque el valor final es ligeramente peor. No se han publicado comparaciones con otros modelos en el model-index.

## Requisitos de hardware

- VRAM estimada: alrededor de 1 GB en FP32 para inferencia con whisper-small; con cuantización INT8 podría reducirse a ~500 MB, aunque no se ofrecen pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU con `whisper.cpp` o `llama.cpp`, aunque con mayor latencia.
- Opciones de despliegue: compatible con Hug Face Transformers, pipelines de ASR, y servidores de inferencia como vLLM o TGI (aunque estos están más orientados a LLM). Para despliegue ligero, se recomienda `whisper.cpp` o `faster-whisper`.
- Latencia y throughput: no se han publicado mediciones específicas; en una GPU moderna (RTX 4090), whisper-small procesa audio en tiempo real o más rápido, pero depende del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `openai/whisper-small` | 244 M | 30 s audio | MIT | Modelo base multilingüe, sin fine-tuning específico |
| `thunderboltc/whisper-small-santali-sanlish` | 244 M (estimado) | 30 s audio | Apache 2.0 | Fine-tuning similar para santali, sin métricas publicadas |
| `thunderboltc/whisper-small-santali-sanlish-revised2_211sen` | 244 M (estimado) | 30 s audio | Apache 2.0 | Variante revisada, sin métricas publicadas |

No se dispone de resultados de benchmarks comparativos entre estos modelos. El modelo analizado presenta un WER del 39,25 %, que es alto para aplicaciones prácticas, pero no se puede comparar directamente con las alternativas sin datos.

## Limitaciones y advertencias

- El WER del 39,25 % indica que aproximadamente 4 de cada 10 palabras se transcriben incorrectamente, lo que limita su uso en producción sin corrección humana.
- El conjunto de datos de entrenamiento no está documentado, lo que impide evaluar la representatividad del habla (acentos, ruido, dominios) y dificulta la reproducibilidad.
- El modelo está especializado en santali; su rendimiento en otros idiomas no está garantizado y probablemente sea inferior al de whisper-small original.
- No se han publicado análisis de sesgos ni de alucinaciones; como todo modelo ASR, puede generar texto plausible pero incorrecto en audio ambiguo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad del modelo.
- El repositorio tiene 13,5 GB, lo que sugiere que incluye múltiples archivos de pesos; se recomienda verificar el tamaño antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thunderboltc/whisper_sanlish_mnx_lr2e5
- Modelo relacionado (santali-sanlish): https://huggingface.co/thunderboltc/whisper-small-santali-sanlish
- Modelo relacionado (revisado): https://huggingface.co/thunderboltc/whisper-small-santali-sanlish-revised2_211sen
- Página de inferencia en FriendliAI: https://friendli.ai/models/thunderboltc/whisper-small-santali-sanlish
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
