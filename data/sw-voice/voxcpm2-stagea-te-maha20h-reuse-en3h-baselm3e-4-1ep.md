# sw-voice/voxcpm2-stageA-te-maha20h-reuse-en3h-baselm3e-4-1ep

## Resumen

VoxCPM2-stageA-te-maha20h-reuse-en3h-baselm3e-4-1ep es un modelo de síntesis de voz (text-to-speech) desarrollado por sw-voice, un fine-tune completo del modelo base sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep. El modelo está especializado en la generación de voz en inglés, telugu y canarés, y se ha entrenado con el trainer oficial de VoxCPM sobre aproximadamente 20 horas de audio en telugu (temas completos del Mahabharatam con pausas reales) y unas 3 horas de audio en inglés. Su relevancia radica en que implementa una síntesis de voz "reference-free": la identidad de la voz queda codificada directamente en los pesos del modelo, sin necesidad de un audio de referencia en tiempo de inferencia.

Con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) y un repositorio de 9,5 GB en formato safetensors, el modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos. Es un modelo de investigación (marcado como "research" por el autor) orientado a la reproducción de una voz concreta en contextos multilingües, con especial énfasis en el telugu y el inglés.

La arquitectura subyacente es la de VoxCPM, un sistema TTS basado en flow-matching, y el fine-tune se realizó sin congelar ningún parámetro, lo que permite adaptar tanto el codificador de texto como el decodificador acústico a las particularidades de los datos de entrenamiento. Al estar entrenado sobre un modelo base multilingüe índico, hereda cierta capacidad para el canarés, aunque el volumen de datos en ese idioma no se detalla en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxCPM (TTS basado en flow-matching; detalles internos no disponibles) |
| Parámetros totales | 2.290.004.544 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | Inglés (en), telugu (te), canarés (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en VoxCPM, un sistema de text-to-speech que emplea flow-matching para la generación acústica. El fine-tune se realizó con el trainer oficial de VoxCPM y consistió en un ajuste completo de todos los parámetros (nada congelado), partiendo del checkpoint sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep. La función de entrenamiento usa flow-matching con un muestreo temporal t = sigmoid(N(1.0, 1)), una tasa de aprendizaje base de 5e-5 con un valor específico de 3e-4 para los parámetros `base_lm.*`, programación coseno con 31 pasos de warmup, recorte de gradiente de 1.0 y micro-batch de 1 con acumulación de 8.

Los datos de entrenamiento combinan aproximadamente 20 horas de audio en telugu procedentes del conjunto sw-voice/swamiji-mahabharatam-telugu-reuse-themes-20h (temas completos del Mahabharatam con pausas reales) y unas 3 horas de audio en inglés del conjunto sw-voice/swamiji-voice-sft-reuse. Se ejecutó una única época, lo que supone 202 pasos de entrenamiento. El modelo es "reference-free": la identidad vocal se aprende y se almacena en los pesos, de modo que no requiere un clip de referencia en el momento de la síntesis. No se documenta el uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de voz (text-to-speech) en inglés, telugu y canarés.
- Síntesis reference-free: la voz queda fijada en los pesos, sin necesidad de audio de referencia en inferencia.
- Reproducción de una identidad vocal concreta (la voz del corpus de entrenamiento) en los idiomas cubiertos.
- Manejo de pausas reales y segmentos largos, gracias al entrenamiento con temas completos del Mahabharatam con pausas naturales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo TTS).
- Capacidades multilingües: limitadas a los tres idiomas indicados.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Audiolibros y narración en telugu: el modelo puede sintetizar textos largos con pausas naturales, aprovechando el entrenamiento sobre temas completos del Mahabharatam, lo que resulta adecuado para contenido narrativo extenso.
- Doblaje y localización de contenido al telugu: permite generar voces consistentes para vídeos o cursos, manteniendo una identidad vocal estable en todos los segmentos sin necesidad de referencia.
- Asistentes de voz en inglés: integrable en aplicaciones de atención al cliente o interfaces conversacionales que requieran una voz fija y coherente en inglés.
- Accesibilidad y lectura de textos: conversión de documentos a audio en inglés y telugu para usuarios con discapacidad visual o dificultades de lectura.
- Generación de contenido para medios: producción de locuciones para podcasts, anuncios o material educativo en los idiomas soportados, con licencia Apache 2.0 que permite uso comercial.
- Prototipado de investigación en TTS multilingüe: sirve como punto de partida para experimentos de fine-tune en otras lenguas o dominios, dado que el autor documenta el pipeline y el código del experimento.
- Pruebas de clonación de voz controlada: al ser reference-free, se puede evaluar la calidad de la voz embebida en distintos contextos sin depender de muestras externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 2,29 mil millones de parámetros en safetensors (9,5 GB de repo), la inferencia en precisión completa requiere del orden de 9-10 GB de VRAM; no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con al menos 12-16 GB de VRAM (por ejemplo, RTX 4080/4090, A100, H100) sería necesaria para precisión completa.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas con 12 GB o más, aunque no se confirma en la documentación.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor menciona el código `swamiji-tts` en `research/exp-iterations/06-voxcpm2-swamiji-stages`, que sería la vía de ejecución.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxcpm2-stageA-te-maha20h-reuse-en3h-baselm3e-4-1ep | 2,29 B | No disponible | en, te, kn | Apache 2.0 | HuggingFace |
| Modelo base: voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep | No disponible | No disponible | en, índico (según nombre) | No disponible | HuggingFace |
| Alternativas TTS comerciales (p. ej. ElevenLabs, Azure TTS) | No disponible | No disponible | Múltiples | Propietaria | API |
| Modelos TTS open source comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como "research" por el autor: no se garantiza su robustez en producción sin una evaluación adicional.
- Sesgos conocidos: al entrenarse sobre una voz concreta (Swamiji) y corpus específicos, la identidad vocal está fijada y puede no ser adecuada para todos los contextos; no se documentan sesgos demográficos o lingüísticos.
- Riesgo de alucinación: en TTS, puede manifestarse como prosodia incorrecta, pronunciación errónea o artefactos acústicos, especialmente en textos fuera del dominio de entrenamiento.
- Limitaciones de idioma: solo se declaran en, te y kn; el canarés no tiene datos de entrenamiento documentados en esta ficha, por lo que su calidad es incierta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento podrían tener condiciones adicionales no detalladas.
- Caveat para producción: no se documentan cuantizaciones, latencia ni throughput, lo que dificulta la planificación de despliegues a escala.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/sw-voice/voxcpm2-stageA-te-maha20h-reuse-en3h-baselm3e-4-1ep
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep
- Dataset telugu: sw-voice/swamiji-mahabharatam-telugu-reuse-themes-20h (referenciado en la model card)
- Dataset inglés: sw-voice/swamiji-voice-sft-reuse (referenciado en la model card)
- Código: swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (referenciado en la model card)
