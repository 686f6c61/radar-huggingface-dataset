# sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-9ep

## Resumen

qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-9ep es un modelo de síntesis de voz (text-to-speech) en telugu, derivado por ajuste fino completo del modelo sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep, que a su vez parte de la familia Qwen3-TTS de 1.700 millones de parámetros. Lo publica el usuario sw-voice como artefacto de investigación, no como modelo de producción: la model card lo etiqueta explícitamente como "(research)" y describe un entrenamiento muy acotado sobre un único conjunto de temas de Navaratri.

El modelo resuelve un problema muy concreto: clonar la voz de un hablante identificado como "swamiji" para locuciones en telugu relacionadas con la festividad de Navaratri. Para ello se entrena con un x-vector fijo de unos 10 segundos extraído de un tema del corpus swamiji-navaratri-telugu-reuse-themes, de modo que la identidad del hablante queda fijada en el modelo y no se selecciona en tiempo de inferencia mediante audio de referencia.

Es relevante ahora únicamente como pieza de investigación reproducible: documenta una receta de ajuste fino sobre el pipeline oficial sft_12hz.py con correcciones de bugs conocidos (proyección de texto, desplazamiento único, estado del sub-talker en p-1, etiquetas del sub-talker sin desplazar y pesos maestros en fp32). No hay métricas publicadas, ni descargas, ni validación externa, por lo que su interés práctico fuera del experimento es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (text-to-speech, tokenizador acústico a 12 Hz con talker y sub-talker); detalles internos no disponibles |
| Parametros totales | 1.916.676.352 (≈1,92 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso carga en bfloat16) |
| Idiomas soportados | telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 4,5 GB |
| Pipeline | text-to-speech |
| Modelo base | sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep |
| Fecha de publicacion | 2026-11-04 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3-TTS en su variante de 1,7 B con tokenizador acústico a 12 Hz. El esquema de entrenamiento descrito en la model card combina una pérdida del talker (cross-entropy) con una pérdida del sub-talker ponderada por 0,3: `loss = talker CE + 0.3 × sub-talker CE`. La generación se realiza con `Qwen3TTSModel.generate_custom_voice`, pasando el texto, un identificador de hablante ("swamiji"), el idioma en modo "Auto" y `non_streaming_mode=True`.

El ajuste fino es completo (no LoRA) y parte directamente del modelo IndicTTS de telugu, sin pasar por la etapa intermedia de 87 horas. Los hiperparámetros son: tasa de aprendizaje constante de 1e-6 tras 10 actualizaciones de calentamiento, batch de 1×8, 9 épocas (144 actualizaciones en total, 16 por época), AdamW con weight decay 0,01, recorte de gradiente 1,0, pesos maestros en fp32 con autocast en bf16. El conjunto de datos es swamiji-navaratri-telugu-reuse-themes: 127 unidades, 1,83 horas, con reutilización de temas. La identidad del hablante se fija mediante un único x-vector de unos 10 segundos colocado en la ranura de hablante. La receta corrige varios bugs del script oficial `sft_12hz.py`: proyección de texto, desplazamiento único, estado del sub-talker en p-1, etiquetas del sub-talker sin desplazar y pesos maestros en fp32.

## Capacidades

- Síntesis de voz en telugu a partir de texto, con la identidad de hablante "swamiji" fijada en el modelo.
- Generación no streaming (`non_streaming_mode=True`) mediante la API `Qwen3TTSModel.generate_custom_voice`.
- Salida de audio en forma de onda con frecuencia de muestreo devuelta por la API (`wavs, sr`).
- Especialización temática en locuciones de Navaratri en telugu, derivada del corpus de entrenamiento.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- No se documenta capacidad multilingüe: el modelo declara únicamente el código de idioma `te`.

## Casos de uso

- Investigación en ajuste fino de TTS: sirve como referencia reproducible de una receta completa sobre Qwen3-TTS con correcciones documentadas de `sft_12hz.py`, útil para quien quiera replicar el pipeline con otros corpus.
- Generación de locuciones devocionales en telugu: narraciones o pasajes relacionados con Navaratri con una voz concreta y consistente, sin necesidad de proporcionar audio de referencia en cada llamada.
- Prototipado de asistentes de voz en telugu: permite evaluar la calidad del tokenizador acústico a 12 Hz y del esquema talker/sub-talker en un idioma de bajos recursos antes de invertir en un corpus mayor.
- Estudio de clonación de hablante mediante x-vector fijo: el modelo ejemplifica el patrón de fijar una identidad de ~10 s en la ranura de hablante y medir su estabilidad en dominios acotados.
- Evaluación comparativa de etapas de entrenamiento: al derivar directamente del modelo IndicTTS sin la etapa de 87 horas, permite aislar el efecto de un ajuste fino temático corto (1,83 h, 144 actualizaciones).
- Docencia y demostraciones sobre TTS en lenguas dravídicas: material de partida para explicar tokenización acústica de baja frecuencia y pérdidas auxiliares en sub-talkers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, WER, SIM, MCD) ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (1,92 B de parámetros), en bf16 los pesos ocupan en torno a 3,8 GB, por lo que se necesita margen adicional para activaciones y buffers de audio; el repo completo pesa 4,5 GB.
- GPU recomendadas: no especificadas por el autor. El ejemplo de la model card usa `device_map="cuda:0"` con `dtype=torch.bfloat16`.
- GPU de consumo: por tamaño, el modelo debería caber en tarjetas con 8-12 GB de VRAM en bf16, aunque no hay confirmación del autor ni pruebas publicadas.
- Opciones de despliegue: la única vía documentada es la librería `qwen_tts` con `Qwen3TTSModel.from_pretrained`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-9ep | ≈1,92 B | no disponible | te | Apache 2.0 | HuggingFace, 0 descargas |
| sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep (modelo base) | ≈1,7 B (según nombre) | no disponible | te | no disponible en la informacion proporcionada | HuggingFace |
| Qwen3-TTS 12 Hz 1.7 B (familia original) | ≈1,7 B | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, idioma y licencia.

## Limitaciones y advertencias

- Modelo marcado explícitamente como "research" por el autor: no está validado para producción.
- Entrenado sobre solo 1,83 horas y 127 unidades de un corpus temático muy estrecho (Navaratri); es probable un sobreajuste al dominio y una generalización limitada fuera de él.
- Identidad de hablante fija ("swamiji") mediante un único x-vector de ~10 s: no permite cambiar de voz sin reentrenar.
- Sin métricas publicadas de calidad, inteligibilidad ni similitud de hablante; no hay evidencia objetiva de rendimiento.
- Riesgo de alucinación acústica y de pronunciación incorrecta fuera del vocabulario y los temas vistos en entrenamiento; no cuantificado.
- Sesgos: no documentados por el autor; el corpus refleja un registro devocional concreto y una única voz.
- Cobertura lingüística limitada al telugu; no se declara soporte de otros idiomas ni code-switching.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el carácter experimental desaconsejan su uso en producción sin validación propia.
- El modelo depende de la librería `qwen_tts` y de la API `generate_custom_voice`; no hay pesos en GGUF ni integración con runtimes de inferencia habituales.
- 0 descargas y 0 likes en el momento de la consulta: sin comunidad ni reportes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-navaratri-only-lr1e-6-9ep
- Modelo base: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep
- Corpus de entrenamiento citado en la model card: sw-voice/swamiji-navaratri-telugu-reuse-themes (no se proporciona URL directa en la informacion disponible)
- Repositorio de código citado: swamiji-tts, ruta `research/exp-iterations/08-qwen3-tts/experiments/03-swamiji-te-two-stage` (no se proporciona URL directa en la informacion disponible)
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada.
