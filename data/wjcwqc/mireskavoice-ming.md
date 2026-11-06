# wjcwqc/MireskaVoice-ming

## Resumen

MireskaVoice-ming es un modelo de síntesis de voz (text-to-speech) especializado en clonación de voz, obtenido mediante un ajuste fino LoRA sobre el modelo base inclusionAI/Ming-3.0-tts-0.5b (aproximadamente 0,5 mil millones de parámetros, construido sobre el sustrato BailingMM). Lo desarrolla el usuario wjcwqc y reproduce la voz en chino de la heroína de Dota 2 Mireska Sunbreeze (Dark Willow, «邪影芳灵»), a partir de 899 fragmentos de doblaje extraídos de los archivos del juego.

El modelo resuelve un caso muy concreto: generar habla en mandarín con la identidad tímbrica de un personaje de videojuego, manteniendo una inteligibilidad alta (CER de 0,0416 sobre 20 frases reservadas) y una ventana de inferencia muy ligera (cabe en una GPU de 4 GB en bf16). Resulta relevante como ejemplo reproducible de adaptación de un TTS de 0,5B con recursos muy limitados: el entrenamiento completo se ejecutó en una RTX 3050 Ti Laptop de 4 GB en unas 2 horas y 40 minutos.

El repositorio ocupa 5,5 GB e incluye el modelo ya fusionado (`merged/`), el checkpoint LoRA original, los scripts de preparación e inferencia, los logs de entrenamiento y un informe de evaluación con muestras de audio. La licencia declarada es MIT, aunque el propio autor restringe el uso comercial por la titularidad de la voz original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS neuronal sobre sustrato BailingMM (modelo base Ming-3.0-tts-0.5b); ajuste LoRA sobre proyecciones q/k/v/o más cabezas audio/flow/stop/spk |
| Parámetros totales | ~0,5B (modelo base); 206M parámetros entrenables en el ajuste |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (referencia); ONNX exportado; no se documentan otras cuantizaciones |
| Idiomas soportados | chino (zh) |
| Licencia | MIT (con restricción de uso comercial indicada por el autor) |
| Formato de pesos | safetensors (modelo fusionado), ONNX, checkpoint PyTorch `.pt` (LoRA + cabezas) |

## Arquitectura y entrenamiento

El modelo parte de Ming-3.0-tts-0.5b, un TTS de aproximadamente 0,5B parámetros con sustrato BailingMM que en bf16 ocupa unos 2,8 GB. Sobre él se aplica un LoRA con r=8, alpha=16 y dropout=0,05 en las proyecciones q/k/v/o de la atención, y se entrenan de forma completa las cabezas `linear_proj_audio`, `flowloss`, `stop_head` y `spk_head`, sumando 206M parámetros actualizables. El condicionamiento de hablante se realiza mediante embeddings campplus: durante el entrenamiento se usa el embedding del propio fragmento objetivo con `speaker_dropout` de 0,5, y en inferencia se emplea el embedding de un fragmento de referencia del personaje (`eval/ref_real_dw_0857.wav`).

Los datos de entrenamiento son 899 fragmentos de doblaje chino del personaje extraídos de los archivos de Dota 2, a 32 kHz, divididos en 879 para entrenamiento y 20 reservados para evaluación. El ajuste se ejecutó durante 10 épocas (906 pasos) con lr de 1e-5 a 1e-6, warmup de 100 pasos, `max_tokens_per_batch` de 1024, precisión bf16 y gradient checkpointing, en una única RTX 3050 Ti Laptop de 4 GB durante aproximadamente 2 horas y 40 minutos. La pérdida descendió de 0,566 a ~0,50. No se documenta uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en mandarín (zh) a partir de texto.
- Clonación de voz condicionada por embedding de hablante campplus: reproduce el timbre del personaje Mireska Sunbreeze.
- Inferencia por lotes mediante `training/infer_ming.py` con un JSON de textos de entrada.
- Inferencia de una sola frase a través de la interfaz oficial `MingTTS` del repositorio de Ming-3.0-tts.
- Control de generación mediante parámetros de decodificación (cfg=2.0, temperature=0.0, seed configurable).
- Exportación a ONNX además de safetensors.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Doblaje de mods y contenido fan de Dota 2: el modelo genera líneas nuevas del personaje en chino con su timbre característico, usando el fragmento de referencia incluido para el condicionamiento de hablante.
- Prototipado de voces para videojuegos: permite evaluar cómo suena una identidad vocal concreta en guiones nuevos antes de contratar doblaje profesional, con un coste de inferencia mínimo en una GPU de 4 GB.
- Generación de audio para vídeos y streams de contenido: síntesis por lotes de guiones en mandarín con una voz reconocible para la comunidad, mediante el script `infer_ming.py` y un JSON de textos.
- Investigación en clonación de voz de pocos recursos: sirve como referencia reproducible de ajuste LoRA sobre un TTS de 0,5B con 879 muestras y hardware de consumo, con logs y configuración completos en el repositorio.
- Evaluación comparativa de métodos de adaptación de hablante: el informe `eval/eval_report.json` permite contrastar CER y similitud de hablante frente a alternativas como CosyVoice3 zero-shot o VITS ajustado.
- Docencia y demostraciones de TTS: el tamaño reducido y los 4 GB de VRAM necesarios facilitan desplegar el modelo en entornos de laboratorio o portátiles.
- Pruebas de integración de pipelines TTS: la exportación ONNX y el modelo fusionado en safetensors permiten ensayar su integración en servicios de síntesis sin depender del checkpoint de entrenamiento.

## Benchmarks y rendimiento

Evaluación sobre 20 frases reservadas; la línea base de similitud entre fragmentos reales del personaje es 0,6994.

| Modelo | CER (menor es mejor) | Similitud de hablante (mayor es mejor) |
|---|---|---|
| MireskaVoice-ming (LoRA sobre Ming-3.0-tts) | 0,0416 | 0,6454 |
| MireskaVoice (ajuste sobre OmniVoice) | 0,028 | 0,758 |
| CosyVoice3 zero-shot | 0,056 | 0,706 |
| VITS ajustado | 0,306 | 0,572 |

16 de las 20 frases se generaron sin ningún error de carácter; los errores se concentran en nombres propios (por ejemplo, 铁雾城 transcrito como 鐵屋城 y 米瑞斯嘉 como 米瑞斯加). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en bf16, según la referencia del autor (entrenamiento e inferencia probados en ese margen).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor validó una RTX 3050 Ti Laptop de 4 GB. Para mayor throughput, GPU de gama alta (A100, H100, RTX 4090) no están documentadas pero son compatibles por arquitectura.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (RTX 3050 Ti y superiores).
- Opciones de despliegue: scripts oficiales de Ming-3.0-tts (`ming_tts.py`), `training/infer_ming.py` para lotes, y pesos ONNX exportados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM, no a este TTS).
- Latencia y throughput: no disponibles; el autor no publica tiempos por frase.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | CER (20 frases) | Similitud de hablante | Licencia |
|---|---|---|---|---|---|
| MireskaVoice-ming | ~0,5B (206M entrenables) | LoRA sobre Ming-3.0-tts | 0,0416 | 0,6454 | MIT (restricción comercial del autor) |
| MireskaVoice (OmniVoice) | no disponible | Ajuste sobre OmniVoice | 0,028 | 0,758 | no disponible en la información |
| CosyVoice3 zero-shot | no disponible | TTS zero-shot | 0,056 | 0,706 | no disponible en la información |
| VITS ajustado | no disponible | TTS clásico ajustado | 0,306 | 0,572 | no disponible en la información |

## Limitaciones y advertencias

- Solo soporta chino (zh); no se documenta multilingüismo.
- Errores de pronunciación en nombres propios y términos poco frecuentes, con 4 de 20 frases con algún error de carácter en la evaluación.
- La similitud de hablante (0,6454) queda por debajo de la línea base entre fragmentos reales (0,6994) y del modelo hermano sobre OmniVoice (0,758); el propio autor recomienda ese otro repositorio si prima la fidelidad tímbrica.
- El condicionamiento depende de un fragmento de referencia concreto (`ref_real_dw_0857.wav`); cambiar de referencia puede alterar el resultado y no se documenta su robustez.
- Riesgo de alucinación o artefactos en prosodia y duración no cuantificado en el informe.
- Restricción de uso comercial explícita: la voz original y el personaje son propiedad de Valve Corporation y los datos se extrajeron de archivos del juego; el autor pide no usarlo comercialmente pese a la licencia MIT de código y pesos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación externa de la comunidad.
- Requiere clonar el repositorio oficial de Ming-3.0-tts e instalar sus dependencias; no es un paquete autónomo.
- No se documentan sesgos demográficos ni de idioma más allá de la limitación al chino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wjcwqc/MireskaVoice-ming
- Repositorio hermano (OmniVoice): https://huggingface.co/wjcwqc/MireskaVoice
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5b
- Código de inferencia oficial: https://github.com/inclusionAI/Ming-3.0-tts
