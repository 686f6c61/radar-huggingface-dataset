# yaegerknight/vaani-kannada-tts

## Resumen

Vaani Kannada TTS es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario independiente yaegerknight, entrenado desde cero para el idioma kannada (kn). Se trata de un modelo de lenguaje sobre códecs de audio de estilo GPT con patrón de retardo (delay-pattern), inspirado en la arquitectura de MusicGen, que transforma fonemas del kannada (en notación IPA generada con espeak-ng) en tokens de audio de EnCodec a 24 kHz con 4 codebooks y 3 kbps. El modelo tiene aproximadamente 95 millones de parámetros y se distribuye con licencia CC-BY-4.0.

El modelo se entrenó sobre aproximadamente 105 horas de habla de campo transcrita procedente del corpus Vaani (ARTPARK, IISc y Google), lo que lo convierte en un experimento centrado en un dominio acústico difícil: grabaciones reales de campo con ruido y variabilidad de hablantes. Su relevancia actual es doble: por un lado, demuestra que es viable entrenar un TTS desde cero para una lengua india de bajos recursos con un presupuesto computacional reducido (unas 4,5 horas en una A100-80GB); por otro, documenta con transparencia sus limitaciones, incluyendo una CER en held-out de 0,529 que supera la de las grabaciones reales reconstruidas con 4 codebooks (0,591).

Es importante subrayar que el propio autor lo describe como una prueba de concepto de investigación y aprendizaje, no como un sistema TTS listo para producción. La model card incluye una galería de demostración con transcripciones ASR sin filtrar de cada muestra, lo que permite evaluar la calidad real del modelo sin maquillaje. El repositorio ocupa 0,4 GB e incluye los pesos en formato PyTorch (model.pt), el código del modelo, el tokenizador y el mapa de hablantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer GPT-style sobre códecs de audio con delay-pattern (estilo MusicGen) |
| Parámetros totales | ~95M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación con max_frames=750 frames de códec) |
| Tipos de cuantización | no disponible (pesos distribuidos en fp32/bf16 vía model.pt; el códec EnCodec opera a 3 kbps) |
| Idiomas soportados | Kannada (kn) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (model.pt con pesos y configuración; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo de estilo GPT que opera sobre tokens discretos de audio en lugar de texto. La entrada son fonemas del kannada en notación IPA (obtenidos con espeak-ng) que se codifican con un tokenizador de caracteres; la salida son tokens de EnCodec a 24 kHz con 4 codebooks y una tasa de 3 kbps. Se emplea un esquema de delay-pattern (también llamado delay interleaving), habitual en modelos de generación musical como MusicGen, que desplaza temporalmente los codebooks para que el modelo pueda modelar la estructura jerárquica del códec de forma autorregresiva en una sola secuencia.

El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador AdamW con learning rate 3e-4 y scheduler coseno, precisión bf16, en una única A100-80GB durante aproximadamente 4,5 horas. Se añade un token EOS tras cada clip, se excluye el padding de la función de pérdida y los fonemas se rellenan por la izquierda (left-padding), una decisión que en la versión v4 corrigió los problemas de padding y EOS que lastraban las versiones anteriores. Los datos provienen de aproximadamente 105 horas de habla de campo transcrita del corpus Vaani. No se menciona en la información disponible el uso de RLHF, DPO ni preferencias humanas.

Una innovación destacable es la comparación sistemática entre versiones: la v2 (12 horas solo de Bangalore, con bugs de padding y EOS) obtenía una CER de 1,32; la v3 (texto rellenado por la derecha, mismos datos) bajaba a 0,674; y la v4 (fonemas rellenados por la izquierda) alcanza 0,529. El autor también documenta que escalar a ~300M parámetros u 8 codebooks no mejoró los resultados con este volumen de datos (300M con 4 codebooks: 0,776 frente a 0,767 del modelo de 100M en la misma configuración), lo que sugiere que el cuello de botella está en los datos y no en la capacidad del modelo.

## Capacidades

- Síntesis de voz a partir de texto en kannada: convierte fonemas IPA del kannada en audio decodificable con EnCodec a 24 kHz y 3 kbps.
- Generación autorregresiva de tokens de audio con 4 codebooks mediante delay-pattern.
- Acondicionamiento por hablante (speaker conditioning), aunque débil: se usa el hablante 0 por defecto según speaker_map.json, ordenado por número de clips.
- Muestreo configurable: temperatura 0,9 y top-k 50 (seleccionados mediante un barrido de 3 semillas; top-k 250 empeoraba la CER en ~0,09).
- Generación con longitud controlada (max_frames=750) y retorno de longitudes para recortar el audio decodificado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio de entrada).
- Capacidad multilingüe: únicamente kannada; la demo acepta inglés pero lo traduce primero con NLLB-200 (CC-BY-NC), un componente externo al modelo.

## Casos de uso

- Investigación en TTS de bajos recursos: sirve como referencia reproducible para entrenar síntesis de voz desde cero en lenguas con pocos datos, con un coste computacional de una sola A100 durante 4,5 horas y código incluido (model.py, text.py).
- Estudio de arquitecturas delay-pattern sobre códecs: el modelo permite experimentar con el esquema de delay interleaving de MusicGen aplicado a voz y comparar con variantes de padding, número de codebooks y tamaño.
- Evaluación de pipelines ASR-TTS: la model card documenta el uso de vasista22/whisper-kannada-medium para medir CER, lo que lo convierte en un banco de pruebas para metodologías de evaluación de TTS en lenguas indias.
- Docencia y aprendizaje: al ser una prueba de concepto explícita con pesos, código y limitaciones documentadas, es adecuado para cursos y talleres sobre modelado de audio discreto.
- Generación de audio sintético para aumento de datos: los clips sintéticos podrían usarse, con cautela, para aumentar corpus de ASR en kannada, aunque la caída de frases y la calidad limitada exigen filtrado previo.
- Prototipado de demos interactivas: la demo en Gradio permite explorar el comportamiento del modelo con entrada en inglés traducida vía NLLB-200, útil para validar ideas antes de invertir en un TTS de producción.
- Comparación de códecs de audio: al usar EnCodec a 3 kbps con 4 codebooks, permite estudiar el compromiso entre tasa de bits y calidad de reconstrucción en una lengua específica.

## Benchmarks y rendimiento

Resultados de CER (character error rate, menor es mejor) sobre 100 clips held-out de 3–8 segundos de distritos no pertenecientes a Bangalore, transcritos con vasista22/whisper-kannada-medium, ignorando espacios y promediando 3 semillas de muestreo:

| Modelo | CER |
|---|---|
| Grabaciones reales vía EnCodec, 8 codebooks | 0,444 |
| Grabaciones reales vía EnCodec, 4 codebooks | 0,591 |
| **Este modelo (v4)** | **0,529** |
| v3 (texto rellenado por la derecha, mismos datos) | 0,674 |
| v2 (12 h solo Bangalore, bugs de padding/EOS) | 1,32 |

El autor advierte que la v4 supere la cifra de audio real con 4 codebooks se debe a que el ASR encuentra más fácil una única voz sintética limpia que grabaciones de campo ruidosas, no a que el modelo suene mejor que personas reales. Además, la CER en held-out sobreestima la calidad sobre salidas de traducción automática formal, que queda fuera del dominio del habla espontánea. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~95M parámetros, por lo que los pesos ocupan aproximadamente 0,4 GB en bf16/fp32; sumando el decodificador EnCodec de 24 kHz, la inferencia cabe holgadamente en GPUs de consumo con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4–6 GB de VRAM; el entrenamiento se realizó en una A100-80GB, pero la inferencia no requiere hardware de centro de datos.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida, aunque la latencia variará.
- Opciones de despliegue: el repositorio incluye código PyTorch propio (model.py, text.py) y se carga con torch.load; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de texto estándar y depende del decodificador EnCodec.
- Latencia y throughput estimados: no disponible en la información proporcionada; la generación se limita a max_frames=750 y el autor menciona que aproximadamente 1 de cada 16 generaciones de una sola frase termina en menos de 1 segundo, requiriendo remuestreo (hasta 3 intentos en la demo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / codebooks | Licencia | Disponibilidad |
|---|---|---|---|---|
| Vaani Kannada TTS (este) | ~95M | 4 codebooks, 3 kbps, max_frames=750 | CC-BY-4.0 | Hugging Face, pesos PyTorch |
| Vaani Kannada TTS v3 | ~100M (misma familia) | 4 codebooks, texto rellenado por la derecha | CC-BY-4.0 (presumible) | No disponible como modelo publicado independiente en la información |
| Variante 300M del autor | ~300M | 4 codebooks | no disponible | No disponible como modelo publicado independiente en la información |
| TTS comerciales para kannada (p. ej. servicios cloud) | no disponible | no disponible | propietaria | APIs comerciales |

No se dispone de información sobre otros modelos TTS open source específicos para kannada con los que comparar parámetros, contexto o benchmarks de forma rigurosa. La comparativa más fiable disponible es interna al propio proyecto (v2, v3, v4 y la variante de 300M), documentada en la model card.

## Limitaciones y advertencias

- El inicio de las frases a menudo se pierde o se corrompe en texto arbitrario; la galería de la demo muestra transcripciones ASR sin filtrar de cada muestra.
- Aproximadamente 1 de cada 16 generaciones de una sola frase termina en menos de 1 segundo; la demo remuestrea hasta 3 veces, lo que no es aceptable en producción sin mecanismos de reintento.
- El 74% de los clips de Vaani no tienen identificador de hablante, por lo que el acondicionamiento por hablante es débil y la inferencia usa el hablante 0 por defecto.
- La CER en held-out sobreestima la calidad sobre salidas de traducción automática formal, que queda fuera del dominio del habla espontánea del corpus de entrenamiento.
- Escalar a ~300M parámetros u 8 codebooks no mejoró los resultados con este volumen de datos, lo que indica un techo de calidad ligado a los datos.
- Sesgos conocidos: no se documentan análisis de sesgo por género, región o variedad dialectal del kannada; el corpus se limita a distritos concretos y a habla de campo.
- Riesgo de alucinación acústica: al ser un modelo generativo autorregresivo, puede producir audio ininteligible o contenido no solicitado, especialmente en frases largas o fuera de dominio.
- Restricciones de licencia: los pesos son CC-BY-4.0 y requieren atribución; el corpus Vaani es CC-BY-4.0 (ARTPARK, IISc y Google) y EnCodec es MIT. La demo usa NLLB-200, que es CC-BY-NC y restringe el uso comercial del flujo inglés-kannada.
- El autor lo declara explícitamente como prueba de concepto de investigación y aprendizaje, no como TTS de producción; no debe desplegarse en aplicaciones de atención al cliente o accesibilidad sin una evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yaegerknight/vaani-kannada-tts
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/yaegerknight/vaani-kannada-tts-demo
- Dataset de tokens EnCodec: https://huggingface.co/datasets/yaegerknight/vaani-kannada-encodec-tokens
- Dataset Vaani (ARTPARK-IISc): https://huggingface.co/datasets/ARTPARK-IISc/Vaani
- Repositorio de EnCodec: https://github.com/facebookresearch/encodec
- Modelo ASR para evaluación: https://huggingface.co/vasista22/whisper-kannada-medium
