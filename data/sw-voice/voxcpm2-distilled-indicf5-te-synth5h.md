# sw-voice/voxcpm2-distilled-indicf5-te-synth5h

## Resumen

VoxCPM2 distilled from indicF5-best es un modelo de síntesis de voz (TTS) desarrollado por el usuario sw-voice como un fine-tune del modelo base `sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep`, que a su vez deriva de la arquitectura VoxCPM2 de OpenBMB. El modelo está especializado en la voz de una figura concreta (referida como "Swamiji") y orientado a la producción de voz en telugu, aunque declara soporte para kannada, tamil, malayalam, marathi, gujarati, alemán, ruso e inglés. Se distribuye con licencia Apache 2.0 y pesos en formato safetensors con un total de 2.290.004.544 parámetros (aproximadamente 2,29 mil millones).

El problema que resuelve es la generación de voz sintética de alta calidad en telugu con una identidad vocal consistente y sin necesidad de referencia en tiempo de inferencia (reference-free). Según la model card, el modelo se destila a partir del sistema indicF5-best y se emplea en producción como "voz B" desde el 8 de noviembre de 2026. La receta de destilación es ligera (320 pasos, unos 21,5 minutos en una H100), lo que lo hace relevante para equipos que necesitan adaptar un TTS multilingüe a una voz concreta con recursos de cómputo modestos.

La relevancia actual reside en su enfoque tokenizer-free heredado de VoxCPM2 (respaldo MiniCPM-4, 2B parámetros, salida de hasta 48 kHz según el repositorio de OpenBMB) y en que ofrece métricas concretas de calidad (CER del 0,96 % en Q&A, coincidencia de voz del 95,0 %) sobre un modelo de referencia. No obstante, se trata de un checkpoint muy específico, con cero descargas y cero likes en el momento de la consulta, lo que limita la evidencia externa disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (tokenizer-free TTS, respaldo MiniCPM-4 según OpenBMB) |
| Parámetros totales | 2.290.004.544 (≈2,29 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | te, kn, ta, ml, mr, gu, de, ru, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `tokenization_voxcpm2.py` incluido |

## Arquitectura y entrenamiento

El modelo se basa en VoxCPM2, un sistema TTS tokenizer-free de aproximadamente 2B parámetros construido sobre un backbone MiniCPM-4, según la documentación del repositorio original de OpenBMB. La model card de este checkpoint no detalla la arquitectura interna más allá de la referencia al modelo base, por lo que aspectos como el tipo exacto de decoder acústico, el vocoder o la estrategia de atención no están disponibles en la información proporcionada. El repositorio ocupa 9,5 GB y contiene los pesos en safetensors junto con el script de tokenización.

El entrenamiento consistió en una destilación a partir de `sw-voice/indicF5-best` usando 5,6 horas de audio sintético en telugu (float32 estricto, 32 pasos, velocidad 0,92), compuesto por 309 respuestas de un servidor de respuestas y 202 pasajes escritos. Se aplicó la receta "Navaratri" de best-vox-2 con 320 pasos de entrenamiento, aproximadamente 21,5 minutos en una sola H100. La inferencia es reference-free con cfg 2 y 10 pasos, generando respuestas completas en una sola pasada. No se documenta en la información disponible el uso de RLHF, DPO ni la composición completa del dataset más allá de las horas y fuentes citadas.

## Capacidades

- Síntesis de voz (TTS) en telugu como idioma principal, con soporte declarado para kannada, tamil, malayalam, marathi, gujarati, alemán, ruso e inglés.
- Generación reference-free: no requiere audio de referencia en tiempo de inferencia.
- Generación de respuestas completas en una sola pasada, adecuada para locuciones largas.
- Control de pasos de inferencia (10 pasos en producción) y de cfg (2), lo que permite ajustar latencia y fidelidad.
- Identidad vocal consistente con la voz objetivo ("Swamiji"), con una coincidencia de voz del 95,0 % según la evaluación del autor.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking; se trata de un modelo exclusivamente de texto a voz.

## Casos de uso

- Producción de voz para asistentes en telugu: el modelo genera respuestas completas en una sola pasada con cfg 2 y 10 pasos, lo que encaja en pipelines de respuesta por turnos donde se requiere baja latencia y una identidad vocal estable.
- Audiolibros y narración de pasajes largos: la model card menciona 202 pasajes escritos en el entrenamiento y una CER de 0,8–1,6 % en tres textos reales de Navaratri, lo que lo hace adecuado para lectura de contenido extenso en telugu.
- Localización de contenido a varios idiomas índicos: al declarar soporte para te, kn, ta, ml, mr y gu, puede emplearse para doblar material formativo o divulgativo a estas lenguas manteniendo una voz coherente.
- Sistemas de atención al cliente por voz: su naturaleza reference-free simplifica el despliegue en servidores sin necesidad de almacenar muestras de referencia por sesión, y la coincidencia de voz del 95,0 % aporta consistencia de marca.
- Generación de datos sintéticos de voz para entrenamiento: el propio modelo se entrenó con audio sintético de indicF5-best, por lo que puede usarse para producir corpus de voz en telugu con control de velocidad y pasos.
- Integración en pipelines de CI/CD de contenido multimedia: al distribuirse en safetensors con script de tokenización incluido, puede automatizarse la generación de locuciones para vídeos, pódcast o materiales e-learning en los idiomas declarados.

## Benchmarks y rendimiento

| Métrica | Resultado | Referencia |
|---|---|---|
| Preferencia de entrega (juez Gemini, respuesta completa) | +0,25 eval y +0,38 Q&A frente a indicF5-best | Model card (research 06/41, 06/50, 07/12) |
| Preferencia de entrega frente a best-vox-2 | ≈+0,75 | Model card |
| CER en Q&A (MAI-Transcribe-2) | 0,96 % | Model card |
| CER en 3 textos reales de Navaratri | 0,8–1,6 % (frente a 2,3 % de las grabaciones reales) | Model card |
| Coincidencia de voz | 95,0 % (best-vox-2: 98,3 %) | Model card |
| Dispersión de tono | ≈3,7 semitonos (real: 4,1–4,7), ≈1,3 st más grave | Model card |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo TTS y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,29 B parámetros en float32 los pesos ocuparían aproximadamente 9,2 GB, y el repositorio completo ocupa 9,5 GB, por lo que se necesita al menos una GPU con 10–12 GB de VRAM en precisión completa.
- GPU recomendadas: el autor reporta el entrenamiento (320 pasos) en una sola H100 en unos 21,5 minutos; para inferencia se puede usar H100 o A100, y probablemente GPUs consumer de gama alta con suficiente VRAM.
- ¿Cabe en GPU consumer? No confirmado en la información disponible; por tamaño de pesos, sería ajustado en tarjetas de 12 GB y requeriría cuantización para tarjetas menores, aunque no se documentan tipos de cuantización.
- Opciones de despliegue: no disponible; la model card solo menciona el uso con cfg 2 y 10 pasos, sin especificar vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no necesariamente aplicables a TTS).
- Latencia y throughput: no disponibles; solo se indica que la generación se hace en una sola pasada por respuesta completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| VoxCPM2 distilled (este) | ≈2,29 B | te, kn, ta, ml, mr, gu, de, ru, en | Apache 2.0 | Fine-tune específico de voz, reference-free, 10 pasos |
| sw-voice/indicF5-best (profesor) | no disponible | índico (según nombre) | no disponible | Fuente de los 5,6 h de audio sintético; peor valorado por el juez Gemini |
| best-vox-2 | no disponible | no disponible | no disponible | Coincidencia de voz del 98,3 %, pero peor entrega según el autor |
| VoxCPM2 (OpenBMB) | ≈2 B | 30 idiomas | no disponible en la información | Modelo base con Voice Design, clonación controlable y salida 48 kHz |

La comparación cuantitativa con alternativas externas no está disponible más allá de las referencias internas del autor; no se aportan datos de otros sistemas TTS comerciales o abiertos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado con 5,6 h de audio sintético de una única voz, puede reproducir las características y posibles sesgos de esa fuente.
- Riesgo de alucinación: en TTS se traduce en errores de pronunciación o contenido; la CER reportada es baja (0,96 % en Q&A) pero no nula, y en textos reales sube a 0,8–1,6 %.
- Limitaciones de contexto e idioma: aunque declara nueve idiomas, el entrenamiento se realizó exclusivamente con telugu sintético, por lo que el rendimiento en kn, ta, ml, mr, gu, de, ru y en no está respaldado por métricas en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el profesor pueden tener condiciones adicionales que no se detallan; conviene verificar la cadena de licencias antes de producción.
- Caveats para producción: el modelo está atado a una identidad vocal concreta ("Swamiji"), con dispersión de tono más plana (3,7 st frente a 4,1–4,7 reales) y ≈1,3 st más grave; la coincidencia de voz (95,0 %) es inferior a la de best-vox-2 (98,3 %). Además, el checkpoint tiene cero descargas y cero likes, y la model card no documenta cuantizaciones ni herramientas de despliegue, lo que reduce la evidencia de robustez externa.

## Enlaces

- [Hugging Face: sw-voice/voxcpm2-distilled-indicf5-te-synth5h](https://huggingface.co/sw-voice/voxcpm2-distilled-indicf5-te-synth5h)
- [Modelo base: sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep](https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep)
- [Profesor: sw-voice/indicF5-best](https://huggingface.co/sw-voice/indicF5-best)
- [Repositorio original: OpenBMB/VoxCPM](https://github.com/OpenBMB/VoxCPM/)
- [Fork índico: tieincred/VoxCPM2-Indic (VaaniTTS)](https://github.com/tieincred/VoxCPM2-Indic)
