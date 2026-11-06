# sw-voice/voxcpm2-stageBB-te-reuse87h-navaratri-bs32-half-lr

## Resumen

voxcpm2-stageBB-te-reuse87h-navaratri-bs32-half-lr es un modelo de síntesis de voz (text-to-speech) publicado por el usuario sw-voice en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) del modelo sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep, entrenado con el entrenador oficial de VoxCPM. El modelo está orientado a la generación de voz en inglés, telugu y kannada, y su nombre indica que forma parte de una campaña de experimentos de investigación (stage B) centrada en la reutilización de temas musicales/devocionales (swamiji-navaratri).

Con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) y un repositorio de 9,5 GB en formato safetensors, el modelo se posiciona en la gama media de los sistemas TTS neuronales. Su relevancia es fundamentalmente investigadora: se publica con licencia Apache 2.0, cero descargas y cero likes en el momento de la consulta, y su model card lo etiqueta explícitamente como "(research)". No es un modelo de producción ni un lanzamiento comercial, sino un artefacto reproducible de un pipeline de experimentación interna.

La información disponible sobre arquitectura interna, datos de entrenamiento detallados y rendimiento es muy limitada: la model card solo describe el proceso de ajuste fino (épocas, batch, learning rate, flow-matching), no la arquitectura subyacente ni métricas de evaluación. Por tanto, esta ficha distingue de forma explícita entre los datos confirmados y los campos no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en VoxCPM; detalles internos no publicados) |
| Parámetros totales | 2.290.004.544 (2,29 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en), telugu (te), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del checkpoint sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep, realizado con el entrenador oficial de VoxCPM. Según la model card, no se congeló ningún parámetro ("nothing frozen") y se entrenaron todos los pesos. El entrenamiento utilizó los conjuntos sw-voice/swamiji-navaratri-telugu-reuse-themes y sw-voice/swamiji-navaratri-kannada-reuse-themes (127 + 124 unidades completas de tema, con estrategia RE-USE), durante 5 épocas con micro-batch 1 y acumulación de gradiente 32, lo que resultó en 40 pasos de actualización.

Los hiperparámetros documentados son: learning rate 2,5e-5 con schedule coseno (y 1,5e-4 para el subconjunto base_lm.*, la mitad que en la stage B del 06/27), warmup de 6 pasos, grad clip 1,0 y flow-matching con t = sigmoid(N(1,0, 1)). El modelo se describe como "reference-free: the voice is in the weights", es decir, la identidad de voz no depende de un audio de referencia en inferencia, sino que está codificada en los pesos. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF/DPO. El código del experimento se referencia en el repositorio swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages`.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, en inglés, telugu y kannada.
- Generación de voz sin referencia de audio (reference-free), con la identidad de voz incorporada en los pesos del modelo.
- Entrenado sobre material devocional/musical (temas de Navaratri), por lo que el dominio de voz está acotado a ese tipo de contenido.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje general).
- Capacidades multilingües: limitadas a los tres idiomas declarados (en, te, kn).
- Capacidades especiales (modo thinking, visión, audio de entrada): no disponibles.

## Casos de uso

- Investigación en TTS multilingüe para lenguas del sur de la India: el modelo permite estudiar cómo un ajuste fino completo sobre datos de telugu y kannada afecta a la calidad de síntesis en comparación con el checkpoint base, útil para grupos que trabajan en tecnologías del lenguaje de bajos recursos.
- Reproducción de experimentos de ajuste fino: al documentarse hiperparámetros, dataset y código, sirve como artefacto de referencia para replicar pipelines de entrenamiento VoxCPM con flow-matching.
- Generación de voz para contenido devocional o musical: dado que se entrenó sobre temas de Navaratri, puede emplearse para locuciones o recitaciones en ese dominio concreto, donde el estilo de voz aprendido es más adecuado.
- Evaluación comparativa de estrategias de congelación de parámetros: al no congelarse ningún peso, permite analizar el impacto del entrenamiento completo frente a ajustes parciales en modelos TTS de ~2,3B parámetros.
- Prototipado de asistentes de voz en telugu y kannada: para experimentos académicos de interfaces habladas en estos idiomas, siempre que se validen sesgos y calidad antes de cualquier uso real.
- Estudio de la técnica RE-USE de reutilización de temas: el modelo materializa un experimento sobre reutilización de unidades temáticas, útil para investigar transferencia de estilo y contenido en datos musicales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 2,29 mil millones de parámetros en fp16 requiere aproximadamente 4,6 GB solo para los pesos, más memoria para activaciones y buffers de audio; en cuantización de 8 bits rondaría los 2,3 GB y en 4 bits los 1,2 GB, aunque el autor no publica variantes cuantizadas ni cifras verificadas.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar funcionamiento en GPUs de consumo con al menos 8-12 GB de VRAM en fp16, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas con 8 GB o más en fp16, y en 4-6 GB con cuantización, pero es una estimación no verificada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo TTS con pesos safetensors, requeriría el código del entrenador VoxCPM o un runtime compatible con la arquitectura, no publicado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS multilingüe de ~2,3B parámetros) con datos verificables de parámetros, contexto, rendimiento o licencia. El único pariente identificable es su modelo base sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep, del que este checkpoint es un ajuste fino completo, pero no se dispone de sus especificaciones completas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo etiquetado explícitamente como "(research)": no está pensado para producción y no cuenta con validación de calidad, latencia ni robustez.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Dominio de entrenamiento muy acotado (temas devocionales de Navaratri en telugu y kannada): es probable que la calidad se degrade fuera de ese estilo y contenido.
- Riesgo de alucinación y artefactos de audio: no se documentan evaluaciones de fidelidad, naturalidad ni inteligibilidad; en TTS, esto puede manifestarse como pronunciación incorrecta, ruido o voces inestables.
- Idiomas limitados a en, te y kn; no se garantiza un comportamiento correcto en otros idiomas ni en mezclas de código.
- Sesgos: al entrenarse sobre un corpus específico de temática religiosa/musical, puede reproducir sesgos de estilo, género o prosodia presentes en esos datos; no se documenta ningún análisis de sesgo.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el estado de investigación y la falta de benchmarks desaconsejan su uso en producción sin una evaluación propia exhaustiva.
- No se documentan limitaciones de contexto, latencia ni requisitos de hardware, lo que dificulta planificar un despliegue real.
- El nombre del modelo sugiere una campaña de experimentos internos (stage BB, half-lr); puede ser reemplazado o quedar obsoleto sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/voxcpm2-stageBB-te-reuse87h-navaratri-bs32-half-lr
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep
- Dataset de telugu: sw-voice/swamiji-navaratri-telugu-reuse-themes (referenciado en la model card; no se proporciona URL directa)
- Dataset de kannada: sw-voice/swamiji-navaratri-kannada-reuse-themes (referenciado en la model card; no se proporciona URL directa)
- Código del experimento: repositorio swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (referenciado en la model card; no se proporciona URL directa)
- Paper, blog o demo: no disponibles en la información proporcionada.
