# sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-chartok-navaratri-only-lr1e-6-9ep

## Resumen

El modelo `qwen3-tts-12hz-1.7b-swamiji-te-chartok-navaratri-only-lr1e-6-9ep` es un ajuste fino (fine-tune) de un modelo de síntesis de voz (text-to-speech) de la familia Qwen3-TTS, publicado por el usuario `sw-voice` bajo licencia Apache 2.0. Concretamente, parte de `sw-voice/qwen3-tts-12hz-1.7b-telugu-chartok-indictts-sft-lr1e-6-2ep`, que a su vez es un ajuste sobre la base Qwen3-TTS de 1.700 millones de parámetros con tokenizador de audio a 12 Hz. El modelo está especializado en la síntesis de voz en telugu (código de idioma `te`), con una voz personalizada denominada `swamiji`.

El objetivo del modelo es generar audio de voz en telugu a partir de texto, empleando una innovación concreta: un tokenizador de texto con 100 tokens añadidos, uno por cada punto de código asignado del bloque Unicode telugu (letras, signos vocálicos, virama, anusvara, dígitos). Esto permite leer el telugu carácter a carácter en lugar de como fragmentos BPE a nivel de byte, reduciendo la ratio de 1,69 a 1,16 tokens por carácter. El entrenamiento se realizó sobre 127 unidades de audio (1,83 horas) del conjunto `sw-voice/swamiji-navaratri-telugu-reuse-themes`, correspondientes exclusivamente a temáticas de Navaratri.

Se trata de un modelo de investigación, con cero descargas y cero «likes» en el momento de la ficha, orientado a experimentación con voces personalizadas y tokenización específica de escritura telugu. Su relevancia es acotada: demuestra una técnica de tokenización por caracteres para lenguas índicas en el contexto de TTS, pero no es un modelo de producción generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer con talker y sub-talker, tokenizador de audio a 12 Hz) |
| Parametros totales | 1.916.676.352 (1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | Telugu (`te`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-TTS, que combina un «talker» (modelo principal que predice tokens de audio) y un «sub-talker» (modelo auxiliar), con un tokenizador de audio de 12 Hz. El ajuste fino es completo (full fine-tune), no LoRA: se emplearon pesos maestros en fp32 con autocast en bf16, optimizador AdamW con weight decay 0,01, clipping de gradiente 1,0, batch de 1×8 y una tasa de aprendizaje constante de 1e-6 tras 10 actualizaciones de calentamiento. El entrenamiento consistió en 9 épocas (de un total previsto de 17), 144 actualizaciones y 127 clips, con una función de pérdida que combina la entropía cruzada del talker más 0,3 veces la del sub-talker.

La innovación técnica destacable es la tokenización por caracteres telugu: se añadieron 100 tokens (ids 151676-151775) que ocupan filas libres del embedding de texto, inicializadas como la media de los tokens de byte que sustituyen. Los ficheros del tokenizador incluidos en el repositorio permiten que `Qwen3TTSModel.from_pretrained` los cargue sin código adicional. El autor indica que se corrigieron errores conocidos del script oficial `sft_12hz.py` (text_projection, single shift, estado del sub-talker p-1, etiquetas del sub-talker sin desplazar y pesos maestros en fp32).

## Capacidades

- Síntesis de voz (text-to-speech) en telugu a partir de texto.
- Generación con voz personalizada identificada como `swamiji` mediante el parámetro `speaker`.
- Salida de audio en formato de onda con frecuencia de muestreo devuelta por la API (`wavs, sr`).
- Modo no streaming (`non_streaming_mode=True`) en el ejemplo de uso proporcionado.
- Selección de idioma mediante el parámetro `language="Auto"`.
- Tokenización específica de la escritura telugu (carácter a carácter) para mejor cobertura de grafemas.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en telugu para aplicaciones de lectura en voz alta: el modelo convierte texto telugu en audio con la voz `swamiji`, adecuado para prototipos de lectores de artículos o textos religiosos asociados a Navaratri.
- Investigación en tokenización de lenguas índicas: sirve para evaluar el impacto de la tokenización por caracteres (1,16 frente a 1,69 tokens por carácter) en la calidad de la síntesis de TTS para telugu.
- Generación de audiolibros o contenido devocional en telugu: el corpus de entrenamiento (temáticas de Navaratri, 1,83 h) encaja con la narración de textos religiosos o culturales en esa lengua.
- Pruebas de voz personalizada en pipelines TTS: el identificador `speaker="swamiji"` permite integrar una voz concreta en demos o entornos de evaluación controlados.
- Reproducción de experimentos académicos: el repositorio documenta la receta de entrenamiento (LR, épocas, batch, pérdida), lo que facilita replicar o comparar variantes del ajuste fino.
- Evaluación de calidad de TTS en lenguas de bajos recursos: al ser un modelo de investigación con pocas horas de datos, resulta útil como caso de estudio de sobreajuste y generalización en telugu.
- Integración en entornos de investigación con GPU: el ejemplo de código (`device_map="cuda:0"`, `dtype=torch.bfloat16`) permite desplegarlo en un único dispositivo para experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,7 B de parámetros, en bf16 se requieren aproximadamente 3,8 GB solo para pesos, más memoria para activaciones y decodificación de audio.
- GPU recomendadas: no disponible; el ejemplo de uso apunta a una GPU CUDA (`cuda:0`).
- Cabe en GPU de consumo: previsiblemente sí en GPUs con 8 GB o más de VRAM en bf16, aunque el dato no está confirmado en la información proporcionada.
- Opciones de despliegue: la librería `qwen_tts` con `Qwen3TTSModel.from_pretrained`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-tts-12hz-1.7b-swamiji-te-chartok-navaratri-only-lr1e-6-9ep | 1,7 B | no disponible | Telugu | Apache 2.0 | Hugging Face (0 descargas) |
| sw-voice/qwen3-tts-12hz-1.7b-telugu-chartok-indictts-sft-lr1e-6-2ep (modelo base) | 1,7 B | no disponible | Telugu | Apache 2.0 | Hugging Face |
| Qwen3-TTS base (familia) | 1,7 B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo etiqueta como «research», con cero descargas y sin validación externa conocida.
- Corpus de entrenamiento muy reducido: 127 clips y 1,83 horas, limitado a temáticas de Navaratri, lo que puede provocar sobreajuste y escasa generalización a otros dominios.
- Entrenamiento incompleto: solo 9 de las 17 épocas previstas.
- Idioma único: solo telugu; no se documenta soporte multilingüe real pese al parámetro `language="Auto"`.
- Voz única: la voz personalizada `swamiji` es la única documentada.
- Riesgo de alucinación y artefactos de audio en textos fuera del dominio de entrenamiento.
- No se documentan sesgos específicos, pero la limitación del corpus (contenido devocional) puede sesgar el estilo y la prosodia.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y el carácter experimental desaconsejan su uso en producción sin validación adicional.
- No se documentan requisitos de atribución más allá de los habituales de Apache 2.0.

## Enlaces

- Hugging Face: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-chartok-navaratri-only-lr1e-6-9ep
- Modelo base: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-telugu-chartok-indictts-sft-lr1e-6-2ep
- Conjunto de datos de entrenamiento: sw-voice/swamiji-navaratri-telugu-reuse-themes (referenciado en la model card; no se proporciona URL directa)
- Código del experimento: swamiji-tts, ruta `research/exp-iterations/08-qwen3-tts/experiments/06-te-char-tokens` (referenciado en la model card; no se proporciona URL directa)
- Fichero de tokens telugu: `te_tokens.json` (incluido en el repositorio del modelo)
