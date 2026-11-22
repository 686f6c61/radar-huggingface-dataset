# starrydark/Kurisu_Qwen3_TTS

## Resumen

Kurisu_Qwen3_TTS es un modelo de síntesis de voz (text-to-speech) publicado por el usuario starrydark en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) del modelo Qwen/Qwen3-TTS-12Hz-1.7B-Base, desarrollado por Alibaba Qwen, y su objetivo es reproducir la voz de Makise Kurisu, personaje de la visual novel y anime STEINS;GATE, en japonés, mandarín y inglés. No requiere audio de referencia: el texto de entrada y un identificador de hablante bastan para generar el audio.

El modelo tiene 1.916.676.352 parámetros en formato safetensors y un repositorio de 12,2 GB. La arquitectura subyacente es la de Qwen3-TTS, un modelo de códec de lenguaje (codec language model) que opera a 12 Hz sobre tokens de audio, descrito en el informe técnico arXiv:2601.15621. El ajuste se realizó sobre 13,7 horas de audio: 8.873 clips en japonés extraídos de las líneas originales del personaje, más filas nativas en mandarín e inglés y mandarín generado con la propia voz de Kurisu.

Su relevancia es doble. Por un lado, demuestra un flujo de trabajo reproducible de ajuste fino de TTS sobre un modelo base abierto de 1,7B, con decisiones documentadas y evaluadas (el autor publica el código de entrenamiento y las notas de investigación). Por otro, ilustra los límites legales de este tipo de proyectos: la licencia es "unofficial-fan-model" y no concede derechos de uso, al tratarse de la recreación de una voz interpretada por una actriz real y de un personaje con propiedad intelectual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (codec language model, 12 Hz), transformer sobre tokens de audio |
| Parametros totales | 1.916.676.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | japones (ja), chino mandarin (zh), ingles (en) |
| Licencia | other / unofficial-fan-model (sin derechos concedidos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-TTS-12Hz-1.7B-Base, un sistema de texto a voz basado en un modelo de lenguaje autorregresivo que predice tokens de un códec de audio a una tasa de 12 Hz. El ajuste es un fine-tune completo de los pesos, no un adaptador LoRA (el autor menciona un flujo LoRA de 16 GB en la versión v1, abandonado en favor del ajuste completo). Se trata de un checkpoint de tipo `custom_voice`: la voz queda fijada en los pesos y se selecciona mediante un identificador de hablante, sin audio de referencia en inferencia.

Los datos de entrenamiento suman 13,7 horas e incluyen 8.873 clips en japonés de las líneas originales del personaje, filas nativas en mandarín (AISHELL-3, 30 hablantes) e inglés (LibriTTS-R, 25 hablantes) usadas como replay para evitar olvido catastrófico, y aproximadamente un 5 % de mandarín nativo generado por el modelo base con el vector de hablante de Kurisu (filtrado por P(zh) ≥ 0,9, CER ≤ 0,05 y similitud). Esta última técnica fue la que mayor reducción de acento aportó en mandarín, según la model card. El entrenamiento incorpora identificadores de idioma explícitos, lo que elimina buena parte del acento japonés en chino cuando se pasa el idioma correcto. Se añadieron dos tokens especiales, `[sigh]` y `[nv]`, entrenados a partir de 81 y 176 tomas verificadas respectivamente, con comportamiento experimental.

## Capacidades

- Síntesis de voz a partir de texto en japonés, mandarín e inglés, sin audio de referencia.
- Tres voces seleccionables: `kurisu` (por defecto), `amadeus` (voz del dispositivo Amadeus de STEINS;GATE 0) y `phone` (simulación de llamada telefónica, con el ecualizador medido de la serie).
- Etiquetas expresivas experimentales: `[sigh]` para introducir suspiros o respiraciones y `[nv]` para vocalizaciones no verbales.
- Control de idioma explícito mediante el parámetro `language`, que mejora la naturalidad del mandarín.
- Generación de audio con muestreo estocástico por defecto (temperatura 0,9, top-k 50, penalización de repetición 1,05); el decodificado voraz provoca bucles en modelos de lenguaje de códec.
- No dispone de tool calling, capacidades de agente, visión ni audio de entrada.

## Casos de uso

- Doblaje amateur y fandubs: el modelo genera líneas en japonés con la voz del personaje para proyectos no comerciales de doblaje de escenas de STEINS;GATE, sin necesidad de disponer de la actriz original ni de grabaciones de referencia.
- Proyectos de asistente conversacional temático: integrado en un pipeline de STT + LLM + TTS, permite construir un asistente con la voz de Amadeus para demos, escape rooms o instalaciones interactivas de fans.
- Prototipado de videojuegos con licencia dudosa: útil para maquetar un personaje antes de contratar una voz real, siempre que el resultado no se publique comercialmente.
- Investigación en clonación de voz y ajuste fino de TTS: el repositorio de GitHub incluye el código de entrenamiento, la construcción del dataset y las notas, lo que lo convierte en un caso de estudio reproducible de fine-tune completo sobre Qwen3-TTS 1.7B.
- Evaluación de técnicas de reducción de acento: el uso de filas de replay multilingüe y de datos sintéticos filtrados por CER es un método documentado y medido que puede replicarse en otros ajustes de voz.
- Generación de audio para contenido derivado en redes: clips cortos en japonés, chino o inglés para vídeos de fans, con la advertencia de que la licencia no concede derechos de explotación.
- Pruebas de robustez de sistemas TTS: las etiquetas `[sigh]` y `[nv]`, con una tasa de éxito aproximada de 1 entre 7 prompts, sirven para estudiar la fiabilidad de tokens de control expresivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card incluye únicamente evaluaciones internas del autor:

| Metrica | Resultado |
|---|---|
| Naturalidad del mandarin (v3) | 5,0/5 en evaluacion a ciegas con un oyente, 16 frases |
| Naturalidad del mandarin (v2) | 3,9/5 en la misma evaluacion |
| Errores de silaba en caracteres compartidos (mandarin) | reduccion de aproximadamente dos tercios frente a v2 |
| CER en japones | mejor que v2 (sin cifra publicada) |
| Tasa de aparicion audible de `[sigh]` | ~1 de cada 7 prompts (texto sin etiqueta: ~1 de cada 30) |
| Fidelidad espectral de las voces `amadeus` y `phone` | proyeccion ≥ 1,0 respecto a las grabaciones reales |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 4 GB solo para pesos (1,9B parametros × 2 bytes), mas el overhead del runtime y del decodificador de audio; se recomienda prever 6-8 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para produccion; cualquier GPU consumer con 8 GB o mas deberia ser suficiente en bfloat16.
- Cabe en GPU consumer: si, en tarjetas de gama media-alta con al menos 8 GB de VRAM.
- Opciones de despliegue: la libreria `qwen_tts` con `Qwen3TTSModel.from_pretrained` y `device_map="cuda"` es la via documentada; existe una demo en Hugging Face Spaces. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Audio de referencia |
|---|---|---|---|---|---|
| Kurisu_Qwen3_TTS (este) | 1,92B | ja, zh, en | no disponible | unofficial-fan-model (sin derechos) | No requiere |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | ~1,7B | no disponible | no disponible | la del modelo base de Qwen | Si, voz generica |
| Modelos TTS comerciales (ElevenLabs, Azure TTS) | no disponible | decenas | no disponible | comercial | Si (clonacion) |
| XTTS-v2 (Coqui) | no disponible | 17 | no disponible | Coqui Public Model License (no comercial) | Si (clonacion) |

La comparativa se limita a rasgos estructurales porque no hay datos de benchmarks publicados para este modelo. Frente al modelo base, la diferencia es la voz fijada y el soporte de identificadores de hablante; frente a soluciones comerciales, la ventaja es el despliegue local y el coste cero, y la desventaja es la ausencia de garantias legales y de soporte.

## Limitaciones y advertencias

- La licencia "unofficial-fan-model" no concede ningun derecho: el modelo recrea la voz de una actriz real y un personaje con propiedad intelectual ajena, por lo que su uso comercial es inviable y el uso no comercial queda en una zona legal gris.
- Riesgo de alucinacion acustica: como todo modelo de lenguaje de codec, puede generar bucles, ruidos o prosodia incorrecta, especialmente con decodificado voraz; el autor recomienda mantener el muestreo por defecto.
- Las etiquetas `[sigh]` y `[nv]` son experimentales y funcionan de forma inconsistente (aproximadamente 1 de cada 7 prompts).
- El modelo esta especializado en una unica voz: no es un TTS generico y no admite otras voces sin reentrenamiento.
- La cobertura linguistica se limita a japones, mandarin e ingles; no hay soporte documentado de castellano ni de otras lenguas.
- El acento en mandarin mejora respecto a v2 pero sigue siendo un punto debil, y la evaluacion se hizo con un solo oyente y 16 frases, una muestra muy reducida.
- No se documentan sesgos demograficos ni de otro tipo, pero al derivar de un modelo base entrenado con corpus web y de audiolibros, es probable que herede sus sesgos; no hay evaluacion al respecto.
- El tokenizador del repositorio incluye los tokens de etiqueta añadidos: debe cargarse desde este repositorio y no desde el modelo base, o la inferencia fallara.
- El repositorio ocupa 12,2 GB, muy por encima del tamano de los pesos, lo que puede complicar el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/starrydark/Kurisu_Qwen3_TTS
- Dataset de voz: https://huggingface.co/datasets/starrydark/Makise_Kurisu_Voice
- Demo en Spaces: https://huggingface.co/spaces/starrydark/Kurisu_Qwen3_TTS
- Coleccion del autor: https://huggingface.co/collections/starrydark/makise-kurisu-ai-voice-steins-gate
- Codigo de entrenamiento en GitHub: https://github.com/starryark/makise-kurisu-tts
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Informe tecnico de Qwen3-TTS: https://arxiv.org/abs/2601.15621
- Seccion de derechos y uso responsable: https://huggingface.co/starrydark/Makise_Kurisu_Qwen3_TTS#rights-and-responsible-use
