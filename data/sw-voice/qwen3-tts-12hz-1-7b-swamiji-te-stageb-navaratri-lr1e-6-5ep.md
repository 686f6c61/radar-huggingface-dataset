# sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-stageB-navaratri-lr1e-6-5ep

## Resumen

`sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-stageB-navaratri-lr1e-6-5ep` es un modelo de síntesis de voz (text-to-speech) obtenido por ajuste fino completo del modelo Qwen3-TTS de 1.7B de parámetros, especializado en telugu (`te`). Lo desarrolla el usuario `sw-voice` como parte de una línea de investigación sobre clonación y adaptación de voz para una figura concreta ("Swamiji"), y esta etapa B parte de un checkpoint previo de la misma familia (stage A) entrenado sobre 87 horas de audio reutilizado.

Se trata de un modelo de investigación, no de un producto listo para producción: el autor lo etiqueta explícitamente como "research" y el repositorio no incluye datos de benchmarks ni métricas de calidad objetivas. Su interés radica en que documenta un pipeline de ajuste fino reproducible sobre la arquitectura Qwen3-TTS, con correcciones explícitas de bugs del script oficial de entrenamiento (`sft_12hz.py`), lo que puede servir de referencia a otros equipos que quieran adaptar Qwen3-TTS a un idioma o a una voz concreta.

La relevancia actual es limitada fuera del ámbito de la investigación en TTS multilingüe: el modelo solo soporta telugu, tiene cero descargas y cero likes en HuggingFace, y su licencia Apache 2.0 permite uso comercial, pero no se han publicado evaluaciones de naturalidad, inteligibilidad ni similitud de hablante. Es, en la práctica, un checkpoint experimental más que un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer con "talker" y "sub-talker", tokenización acústica a 12 Hz) |
| Parámetros totales | 1.916.676.352 (1.7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | telugu (`te`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 4.5 GB |
| Pipeline | text-to-speech |
| Modelo base | `sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-stageA-reuse87h-lr1e-6-1ep` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-TTS, un sistema de síntesis de voz basado en un transformer "talker" que genera tokens acústicos a una tasa de 12 Hz, con un "sub-talker" auxiliar que refina la representación acústica. El ajuste fino es completo (no LoRA): se entrenan todos los pesos con AdamW (weight decay 0.01, grad clipping 1.0), learning rate constante de 1e-6 tras 10 pasos de warmup, batch de 1x8 y precisión mixta con pesos maestros en fp32 y autocast en bf16. La función de pérdida combina la cross-entropy del talker con 0.3 veces la del sub-talker.

El entrenamiento de esta etapa B parte del checkpoint stage A y utiliza el dataset `sw-voice/swamiji-navaratri-telugu-reuse-themes`: 127 unidades, 1.84 horas de audio en telugu, reutilizadas (RE-USE), durante 5 épocas, lo que equivale a 80 actualizaciones. En la ranura de hablante se emplea un x-vector fijo de "Swamiji" de aproximadamente 10 segundos, extraído de un tema de Navaratri reutilizado. El autor indica que corrigió bugs conocidos del script oficial `sft_12hz.py`: proyección de texto (`text_projection`), desplazamiento único, estado del sub-talker en p-1, etiquetas del sub-talker sin desplazar y pesos maestros en fp32.

## Capacidades

- Síntesis de voz a partir de texto en telugu, con una voz de hablante fija ("Swamiji") impuesta mediante un x-vector de referencia.
- Generación de audio con una tasa de tokenización acústica de 12 Hz.
- Modo de generación no streaming (`non_streaming_mode=True`) en el ejemplo de uso.
- Selección de idioma mediante el parámetro `language="Auto"`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades de texto más allá de la síntesis.
- No se documentan capacidades multimodales (visión, audio de entrada, etc.).
- No se documenta clonación de voz arbitraria en tiempo de inferencia más allá del x-vector fijo de entrenamiento.

## Casos de uso

- Investigación en adaptación de TTS a un idioma de bajos recursos: el modelo sirve como punto de partida reproducible para experimentar con ajuste fino de Qwen3-TTS sobre telugu, dado que el autor documenta hiperparámetros y correcciones del script oficial.
- Reproducción de experimentos de ajuste fino en dos etapas: la cadena stage A (87 h) → stage B (1.84 h) permite estudiar el efecto del preentrenamiento extenso seguido de un ajuste corto sobre un dominio concreto.
- Generación de narración de contenido devocional o temático en telugu: el modelo está entrenado sobre temas de Navaratri y una voz concreta, por lo que puede emplearse para locuciones de ese dominio, siempre que se valide la calidad auditiva.
- Banco de pruebas para evaluación de TTS en telugu: útil para construir pipelines de evaluación de inteligibilidad y similitud de hablante en un idioma con pocos recursos.
- Estudio de correcciones de implementación en Qwen3-TTS: las correcciones documentadas (proyección de texto, desplazamiento del sub-talker, fp32 maestro) son directamente reutilizables por otros equipos que entrenen la misma arquitectura.
- Prototipado de asistentes de voz en telugu en entornos controlados: con la debida validación, puede integrarse en demos de síntesis de voz para ese idioma, aunque no se recomienda su uso en producción sin evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.7B parámetros en bf16 los pesos ocupan aproximadamente 3.8 GB, por lo que se puede estimar un consumo de VRAM de entre 4 y 8 GB según el overhead del runtime y la longitud del audio generado.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar que funcione en GPUs de consumo con al menos 8 GB de VRAM, pero no hay confirmación del autor.
- Cabe en GPU de consumo: probable por el tamaño del modelo, pero no confirmado.
- Opciones de despliegue: el ejemplo oficial usa la librería `qwen_tts` (`Qwen3TTSModel.from_pretrained`) con `device_map="cuda:0"` y `dtype=torch.bfloat16`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-stageB-navaratri-lr1e-6-5ep` | 1.7B | no disponible | telugu | Apache 2.0 | HuggingFace (0 descargas) |
| `sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-stageA-reuse87h-lr1e-6-1ep` (modelo base) | 1.7B | no disponible | telugu | Apache 2.0 | HuggingFace |
| Qwen3-TTS original (familia) | 1.7B (variantes) | no disponible | multilingüe | no disponible en esta ficha | HuggingFace / Alibaba |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo etiqueta como "research"; no hay evaluación publicada de naturalidad, inteligibilidad ni similitud de hablante.
- Idioma único: solo soporta telugu (`te`); no se ha validado su comportamiento en otros idiomas.
- Voz fija: el hablante está determinado por un x-vector fijo de "Swamiji" de unos 10 segundos; no se documenta clonación de voces arbitrarias.
- Datos de entrenamiento limitados: solo 1.84 horas de audio en esta etapa, lo que puede provocar sobreajuste al dominio de Navaratri y falta de cobertura prosódica.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas o inestabilidad en textos fuera del dominio de entrenamiento.
- Sesgos: no se documentan análisis de sesgos, pero la voz y el material de entrenamiento están sesgados hacia una figura y un registro concretos.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluación de calidad hace desaconsejable su despliegue en producción sin validación previa.
- Sin métricas de latencia ni throughput: no se puede planificar capacidad de despliegue con datos objetivos.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-stageB-navaratri-lr1e-6-5ep
- Modelo base (stage A): https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-stageA-reuse87h-lr1e-6-1ep
- Dataset de entrenamiento (referenciado en la model card): `sw-voice/swamiji-navaratri-telugu-reuse-themes`
- Código del experimento (referenciado en la model card): `swamiji-tts research/exp-iterations/08-qwen3-tts/experiments/03-swamiji-te-two-stage`
