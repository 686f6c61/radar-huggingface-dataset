# starrydark/Tricolour_Lovestory_Qwen3_TTS

## Resumen

Tricolour Lovestory Qwen3 TTS es un modelo de texto a voz (TTS) en chino mandarin desarrollado por el usuario starrydark como proyecto fan no oficial. Se trata de un fine-tune completo del modelo Qwen3-TTS-12Hz-1.7B-CustomVoice de Qwen, entrenado con 20,9 horas de lineas de voz del videojuego visual novel Tricolour Lovestory (三色绘恋) para reproducir las voces de 14 personajes de la saga. A diferencia de los sistemas de clonacion de voz por referencia de audio, cada voz se invoca directamente por nombre de personaje, sin necesidad de proporcionar audio de muestra.

El problema que resuelve es la generacion de voz expresiva y consistente de personajes concretos: el modelo mantiene la identidad vocal de cada personaje (verificada con el modelo de speaker CAM++) y admite instrucciones de emocion en lenguaje natural (enojado, triste, feliz). Es relevante como ejemplo de fine-tuning comunitario de TTS con control de hablante multiple y como demostracion de que los modelos Qwen3-TTS pueden adaptarse a voces especificas con datasets relativamente pequenos.

La arquitectura subyacente es un modelo de lenguaje de codec de audio de 1,7B parametros (1.916.676.352 parametros reales en los pesos safetensors), con soporte para 14 voces de personajes mas las 9 voces preset originales del modelo base CustomVoice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de codec de audio (Qwen3-TTS), pipeline text-to-speech |
| Parametros totales | 1.916.676.352 (aprox. 1,9B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se recomienda bfloat16 en los ejemplos) |
| Idiomas soportados | Chino mandarin (zh) |
| Licencia | other / unofficial-fan-model (sin derechos concedidos) |
| Formato de pesos | safetensors (4,5 GB en total) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tune) de Qwen3-TTS-12Hz-1.7B-CustomVoice, un TTS de Qwen basado en un modelo de lenguaje sobre tokens de codec de audio a 12 Hz. El checkpoint es de tipo `custom_voice`: recibe texto y produce voz directamente, sin audio de referencia. El autor ha publicado ademas un trainer multi-speaker corregido para Qwen3-TTS junto con una guia de fine-tuning, lo que sugiere que hubo que solucionar problemas tecnicos en el proceso de entrenamiento multi-hablante.

El entrenamiento uso 20,9 horas de audio: 19.829 lineas de voz de los juegos de la saga correspondientes a los 14 personajes, mas 1.491 clips de replay de instrucciones para el control emocional. Cada personaje cuenta con entre 10 y 356 minutos de datos, lo que explica la variabilidad de calidad entre voces. No se dispone de detalles sobre tokens de entrenamiento agregados ni tecnicas de alineamiento adicionales.

## Capacidades

- Sintesis de voz en chino mandarin con 14 voces de personajes de Tricolour Lovestory, invocadas por nombre (`speaker`) sin necesidad de audio de referencia.
- Conserva las 9 voces preset originales del modelo base Qwen3-TTS CustomVoice, sin modificar.
- Control emocional mediante instrucciones en lenguaje natural: `用生气的语气说` (enojado), `用伤心的语气说` (triste) y `用开心的语气说` (feliz).
- Generacion de audio con prosodia natural si se escribe el texto al estilo de los juegos (pausas con `……`, guiones con `——`, numeros escritos en caracteres).
- Muy alta fidelidad de identidad vocal: 11 de las 14 voces alcanzan una identidad de 1,00 o superior a 0,92 segun CAM++.
- No soporta idiomas distintos del chino mandarin; no es un modelo de texto general ni multimodal.

## Casos de uso

- Dobla je de mods o fangames de Tricolour Lovestory: permite generar dialogos nuevos con las voces originales de los personajes sin grabar audio nuevo, ideal para proyectos no comerciales de la comunidad.
- Generacion de contenido para redes sociales y videos de fans: clips de voz de los personajes para memes, parodias o resenas de la saga, usando las instrucciones emocionales para dar expresividad.
- Prototipado de TTS con control emocional: el modelo sirve como banco de pruebas para investigar como las instrucciones de emocion afectan a la identidad del hablante en modelos de codec de audio.
- Demostracion de fine-tuning multi-speaker: gracias al trainer y la guia publicados, es una referencia practica para quien quiera adaptar Qwen3-TTS a voces propias con datasets pequenos (incluso 10-30 minutos por voz).
- Sintesis de audiolibros o lectura de fanfiction en chino con voces caracterizadas, escribiendo el texto con la puntuacion de pausas recomendada.
- Integracion en chatbots o visual novels interactivas en chino que necesiten responder con voz de personaje de forma automatica y determinista (por nombre de hablante).

## Benchmarks y rendimiento

El autor publica metricas propias (no benchmarks estandarizados tipo MMLU o HumanEval, al no tratarse de un modelo de lenguaje de texto):

| Metrica | Valor | Referencia |
|---|---:|---|
| Identidad vocal media (14 voces, modelo fine-tuned) | alta (11 voces >= 0,92) | CAM++ chino, 200k hablantes |
| Identidad vocal de las grabaciones reales del reparto | 0,967 | mismo evaluador |
| Identidad vocal del modelo base sin entrenar (mismas voces) | 0,74 con instrucciones / menor sin ellas | CAM++ |
| Instrucciones de emocion seguidas (test a ciegas, 16 pares) | enojado 14/16 (p = 0,002); triste 16/16 (p < 0,0001); feliz 12/16 (debil, p = 0,038 unilateral) | test de escucha con un oyente |

No se han publicado resultados de benchmarks estandarizados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 4,5 GB en safetensors; con bfloat16 se recomienda una GPU con al menos 6-8 GB de VRAM (estimacion basada en el tamano de pesos; el autor no publica cifras exactas).
- GPU recomendadas: cualquier GPU consumer moderna con soporte CUDA y bfloat16 (RTX 3060, RTX 4060 o superiores); el ejemplo oficial usa `device_map="cuda"`.
- Cabe comodamente en GPUs consumer de gama media gracias a sus 1,9B parametros.
- Despliegue: mediante la libreria `qwen-tts` (`Qwen3TTSModel.from_pretrained`), con el mismo stack del modelo base Qwen3-TTS. No se menciona soporte para llama.cpp, vLLM u Ollama. Existe un Space de demostracion en Hugging Face para probarlo sin GPU local.
- Latencia y throughput: no disponible. Se recomienda mantener el muestreo por defecto (temperature 0,9, top-k 50, repetition penalty 1,05); la decodificacion greedy provoca bucles en modelos de lenguaje de codec.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Voces | Control emocional | Licencia |
|---|---:|---|---:|---|---|
| Tricolour Lovestory Qwen3 TTS | 1,9B | Chino mandarin | 14 personajes + 9 presets | Si (3 emociones, por instruccion) | unofficial-fan-model (sin derechos) |
| Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice (base) | 1,7B | Multilingue (incl. chino) | 9 presets CustomVoice | Si, generico | Licencia Qwen (no disponible en detalle aqui) |
| Otros TTS de voz de personaje fan (p. ej. GPT-SoVITS finetunes) | no disponible | Variable | Por clonacion con audio de referencia | Limitada | Variable |

La ventaja diferencial frente a alternativas de clonacion por referencia es la invocacion directa por nombre de hablante y la estabilidad de identidad bajo instrucciones emocionales (0,93-0,96 frente a 0,74 del modelo base).

## Limitaciones y advertencias

- Licencia restrictiva: es un modelo fan no oficial bajo `unofficial-fan-model` que no concede derechos de uso; el autor declara expresamente que no esta relacionado con los editores del juego ni con los actores de doblaje. El uso comercial esta practicamente descartado y puede infringir derechos de imagen y voz de los actores originales.
- La voz de 黄丽丽 (Huang Lili) es notablemente debil: a veces deriva hacia las voces de 文芷 o 琳姐, por sus solo 22 minutos de datos de entrenamiento.
- El control de la emocion feliz es debil y no siempre se sigue; enojado y triste son fiables.
- Riesgo de bucles de generacion si se usa decodificacion greedy; hay que respetar el muestreo por defecto.
- Solo funciona correctamente en chino mandarin; el texto debe escribirse sin espacios entre caracteres y con los numeros en caracteres chinos para mejores resultados.
- La evaluacion del control emocional se baso en un unico oyente con 16 pares por emocion, por lo que la significancia estadistica es limitada.
- Los personajes 朱特 y 文绉 podrian compartir actor de doblaje, lo que puede causar confusion entre ambas voces.
- Al ser un modelo de codec de lenguaje, puede alucinar audio (repeticiones, artefactos) en textos muy fuera de distribucion respecto a las lineas de dialogo del juego.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/starrydark/Tricolour_Lovestory_Qwen3_TTS
- Demo (Space): https://huggingface.co/spaces/starrydark/Tricolour_Lovestory_TTS
- Dataset de entrenamiento: https://huggingface.co/datasets/starrydark/Tricolour_Lovestory_Voice
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Codigo y guia de fine-tuning: https://github.com/starryark/tricolour-tts
- Guia de fine-tuning de Qwen3-TTS (correcciones): https://github.com/starryark/tricolour-tts/blob/main/docs/qwen3-tts-finetuning-fixes.md
- Paper citado (arXiv): https://arxiv.org/abs/2601.15621
