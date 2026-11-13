# vanch007/VoxMel-0.3B-MLX

## Resumen

VoxMel-0.3B-MLX es la conversión nativa a MLX de los pesos del modelo VoxMel-0.3B, desarrollado originalmente por VoxDance-Lab y convertido por el usuario vanch007 para su ejecución en Apple Silicon. Se trata de un modelo de síntesis de voz (text-to-speech) con capacidad de clonación de voz, que genera espectrogramas Mel a partir de texto y una referencia de audio. Con 0,3 mil millones de parámetros, está diseñado para inferencia eficiente en hardware de consumo, en particular en equipos Mac con chips de la serie M.

El modelo resuelve el problema de la síntesis de voz personalizada en local: permite clonar una voz a partir de una muestra de referencia sin depender de servicios en la nube. Su relevancia actual radica en que ofrece una alternativa ligera y de licencia permisiva (Apache 2.0) para desarrolladores que trabajan en entornos Apple Silicon y necesitan TTS con clonación de voz integrado en sus aplicaciones.

La información disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es muy limitada: la model card original del repositorio convertido solo indica los formatos de cuantización y el motor de inferencia recomendado. Los detalles técnicos que no aparecen en la información proporcionada se indican como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS con generación de espectrograma Mel) |
| Parámetros totales | 0,3 mil millones (aproximado, según el nombre del modelo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, 8bit (affine group-size 64), 4bit |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (pesos nativos para Apple Silicon), variantes bf16, 8bit y 4bit |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Por el nombre y las etiquetas, se trata de un modelo de text-to-speech que genera espectrogramas Mel y soporta clonación de voz mediante una referencia de audio. El tamaño de 0,3B parámetros sugiere un transformer de dimensiones moderadas, pero no se confirma la arquitectura exacta ni si emplea componentes como difusión, autoregresión o modelos de flujo.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del repositorio convertido no incluye esta información; únicamente documenta la conversión a MLX y las variantes de cuantización disponibles. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y no se incluye.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés y chino.
- Clonación de voz: genera audio con las características de una voz de referencia proporcionada.
- Generación de espectrogramas Mel como representación intermedia del audio.
- Ejecución nativa en Apple Silicon mediante MLX, con variantes bf16, 8bit y 4bit para ajustar el uso de memoria.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje general).
- Capacidades multilingües: limitadas a inglés y chino según la model card.
- Capacidades especiales: clonación de voz y cuantización para hardware de consumo.

## Casos de uso

- Clonación de voz para audiolibros y narración: el modelo puede generar narraciones con una voz concreta a partir de una muestra de referencia, adecuado para proyectos editoriales que requieran consistencia de voz en múltiples capítulos.
- Asistentes de voz locales en macOS: integrable en aplicaciones de escritorio que necesiten TTS sin conexión, aprovechando la inferencia nativa en Apple Silicon y las variantes 4bit para reducir el consumo de memoria.
- Doblaje y localización de contenido en inglés y chino: permite generar pistas de voz en estos dos idiomas con una voz clonada, útil para prototipos de localización de vídeo o pódcast.
- Accesibilidad: generación de voz personalizada para usuarios con discapacidad del habla que deseen conservar su timbre en una voz sintética, ejecutándose en local para preservar la privacidad.
- Prototipado de interfaces conversacionales: desarrolladores que construyen agentes de voz pueden usar el modelo para generar respuestas habladas en fases de prueba sin depender de APIs externas.
- Investigación en síntesis de voz: el modelo, con licencia Apache 2.0 y pesos abiertos en MLX, sirve como base para experimentos de clonación de voz y ajuste fino en entornos Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 0,3B parámetros, los pesos en bf16 ocupan aproximadamente 0,6 GB; en 8bit, unos 0,3 GB; en 4bit, unos 0,15 GB. A esto hay que sumar la memoria para activaciones y el códec de audio, no cuantificada en la información disponible.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) por ser el destino nativo de MLX. No se documenta soporte para GPU NVIDIA o AMD en esta conversión.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con chip de la serie M; el tamaño del repositorio (1,9 GB) incluye todas las variantes de cuantización.
- Opciones de despliegue: motor de inferencia mlx-voxmel (https://github.com/vanch007/mlx-voxmel). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| VoxMel-0.3B-MLX | ~0,3B | no disponible | en, zh | Apache 2.0 | MLX (Apple Silicon) |
| VoxMel-0.3B (original) | ~0,3B | no disponible | en, zh | Apache 2.0 | Pesos originales (no especificado) |
| Alternativas de TTS con clonación | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; la comparativa se limita al modelo original y su conversión.

## Limitaciones y advertencias

- La información pública es muy escasa: no hay datos sobre arquitectura, entrenamiento ni evaluación, lo que dificulta valorar su calidad frente a alternativas.
- Solo soporta inglés y chino; no se documenta soporte para castellano ni otros idiomas.
- Riesgo de alucinación y artefactos en el audio: no se documentan métricas de calidad (MOS, WER) ni evaluaciones subjetivas.
- Sesgos: no se documentan sesgos de género, acento o etnia en las voces generadas; la clonación de voz puede amplificar sesgos presentes en los datos de referencia.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la clonación de voz plantea riesgos legales y éticos (suplantación de identidad, consentimiento). El usuario debe verificar el cumplimiento normativo en su jurisdicción.
- Dependencia de Apple Silicon: la conversión MLX no es portable a otras plataformas sin reconvertir los pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- Las variantes 8bit y 4bit pueden degradar la calidad del audio; no se documenta la pérdida respecto a bf16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanch007/VoxMel-0.3B-MLX
- Modelo original: https://huggingface.co/VoxDance-Lab/VoxMel-0.3B
- Motor de inferencia mlx-voxmel: https://github.com/vanch007/mlx-voxmel
