# squareyards/VibeVoice-7B-Custom

## Resumen

VibeVoice-7B-Custom es una redistribución del modelo VibeVoice-Large, un sistema de síntesis de voz (text-to-speech) orientado a la generación de audio conversacional expresivo y de larga duración, como pódcasts o diálogos con múltiples hablantes. El modelo original fue desarrollado por Microsoft Research y esta versión concreta ha sido resubida por el usuario `squareyards` a Hugging Face, partiendo de la réplica publicada por `aoi-ot`. Se distribuye bajo licencia MIT y está etiquetado para los idiomas inglés y chino.

La propuesta técnica de VibeVoice se apoya en dos tokenizadores de voz continuos (acústico y semántico) que operan a una tasa de fotogramas muy baja, 7,5 Hz, lo que reduce drásticamente la longitud de las secuencias y permite procesar audio de hasta 90 minutos con hasta 4 hablantes distintos. Sobre esa representación se aplica un esquema de *next-token diffusion*: un LLM (Qwen2.5 en esta release) modela el contexto textual y el flujo del diálogo, mientras que una cabeza de difusión ligera genera los detalles acústicos de alta fidelidad.

El modelo resulta relevante porque aborda tres problemas clásicos de los sistemas TTS: la escalabilidad a formatos largos, la consistencia de la identidad de cada hablante a lo largo de la conversación y el turn-taking natural. Con 9.343.355.361 parámetros reales en safetensors y un repositorio de 18,7 GB, se posiciona como una alternativa open source de gran tamano para generación de audio conversacional, aunque su uso previsto por el autor original está acotado a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (Qwen2.5) + tokenizadores acústico y semántico + cabeza de difusión |
| Parametros totales | 9.343.355.361 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrenado con curriculum hasta 32K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VibeVoice combina un LLM transformer con dos tokenizadores de voz continuos y una cabeza de difusión. El tokenizador acústico se basa en una variante σ-VAE propuesta en LatentLM, con una estructura encoder-decoder simétrica en espejo de 7 etapas de bloques transformer modificados, y logra un submuestreo de 3200x sobre audio de entrada a 24 kHz; sus componentes de encoder y decoder tienen aproximadamente 340M de parámetros cada uno. El tokenizador semántico replica la arquitectura del encoder acústico (sin los componentes VAE) y se entrena con una tarea proxy de ASR. Ambos operan a 7,5 Hz, lo que reduce la longitud efectiva de las secuencias de audio.

La cabeza de difusión es un módulo ligero de 4 capas y unos 600M de parámetros condicionado por los estados ocultos del LLM. Predice las características acústicas del VAE mediante un proceso DDPM, y en inferencia emplea Classifier-Free Guidance (CFG) y DPM-Solver (y variantes). El entrenamiento se organiza en dos fases: primero se preentrenan por separado los tokenizadores acústico y semántico; después se congelan y solo se entrenan el LLM y la cabeza de difusión, con una estrategia de curriculum que incrementa la longitud de secuencia de entrada de 4K a 16K y finalmente a 32K tokens. El LLM base de esta release es Qwen2.5.

## Capacidades

- Generación de voz expresiva a partir de texto, orientada a audio conversacional y de formato largo.
- Síntesis de hasta 90 minutos de audio continuo en el modelo Large/1.5B según la tabla del autor (esta release se corresponde con VibeVoice-Large, con ~45 min de generación y 32K de contexto).
- Soporte de hasta 4 hablantes distintos en una misma conversación, con consistencia de identidad a lo largo del audio.
- Modelado de turn-taking natural entre hablantes.
- Idiomas inglés y chino; otros idiomas no están soportados.
- Salida únicamente de voz: no genera música, Foley, ambiencia ni efectos de sonido.
- No modela de forma explícita solapamiento de habla (overlapping speech).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión o audio de entrada.

## Casos de uso

- Producción de pódcasts sintéticos: el modelo puede generar episodios conversacionales de hasta ~45 minutos con varios hablantes e identidades vocales estables, adecuado para prototipado de contenido en inglés o chino.
- Audiolibros y narración dialogada: permite alternar voces de personajes en un mismo capítulo manteniendo la consistencia de cada hablante a lo largo de secuencias largas gracias al contexto de 32K tokens.
- Investigación en síntesis de voz: sirve como base para estudiar tokenizadores de baja tasa de fotogramas, decodificación por difusión y modelado de diálogo multihablante, tal como se describe en el informe técnico.
- Generación de material de evaluación para sistemas ASR: se pueden crear diálogos controlados con transcripciones conocidas para probar reconocedores en inglés y chino.
- Doblaje y localización de contenido conversacional: para proyectos en inglés o chino donde se requiera una pista de voz multi-personaje generada desde guion, con la salvedad de las restricciones de uso responsable.
- Prototipado de asistentes conversacionales con voz: útil en fases de diseño para validar la naturalidad de turnos y la expresividad antes de invertir en grabaciones reales, siempre en el marco de uso de investigación.
- Docencia y divulgación: creación de diálogos explicativos con varias voces para materiales educativos en inglés o chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de ~9,3B parámetros en precisión de 16 bits requiere del orden de 18-19 GB solo para los pesos, a lo que hay que sumar los tokenizadores (~340M por componente) y la cabeza de difusión (~600M), por lo que se recomienda planificar con margen adicional; esta estimación es orientativa y no procede de la model card.
- GPU recomendadas: no disponible de forma explícita. Por tamano, cabría esperar GPUs de datacenter tipo A100 o H100 para inferencia cómoda en fp16, pero el autor no lo especifica.
- Cabe en GPU de consumo: no confirmado. Una RTX 4090 (24 GB) podría ser justa en fp16 y requeriría cuantización, pero no hay datos publicados al respecto.
- Opciones de despliegue: la model card remite al README de GitHub de Microsoft VibeVoice para instalación y uso; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Duracion de generacion | Hablantes | Idiomas | Licencia |
|---|---|---|---|---|---|---|
| VibeVoice-7B-Custom (esta ficha) | 9.343.355.361 | 32K | ~45 min | hasta 4 | en, zh | MIT |
| VibeVoice-1.5B | no disponible | 64K | ~90 min | no disponible | en, zh | MIT (segun repo original) |
| VibeVoice-0.5B-Streaming | no disponible | no disponible | no disponible | no disponible | en, zh | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo (benchmarks) frente a otros sistemas TTS, por lo que la comparación se limita a parámetros, contexto, duración, idiomas y licencia.

## Limitaciones y advertencias

- El uso previsto declarado por el autor original está limitado a investigación sobre generación de diálogo de audio realista; conviene revisar las condiciones antes de un despliegue en producción.
- Riesgo de deepfakes y desinformación: la voz sintética de alta calidad puede emplearse para suplantación, fraude o difusión de contenido falso; se recomienda divulgar el uso de IA al compartir el audio.
- Suplantación de voz sin consentimiento explícito y grabado: prohibida según el autor, incluidos usos de sátira, publicidad, rescate, ingeniería social o bypass de autenticación.
- Conversión de voz en tiempo real o de baja latencia (live deepfake en llamadas o videoconferencias): fuera de alcance.
- Idiomas: solo inglés y chino; transcripciones en otros idiomas pueden producir audio ininteligible u ofensivo.
- Audio no vocal: el modelo no genera ambiencia, música ni efectos de sonido.
- Solapamiento de habla: no se modela de forma explícita.
- Sesgos y alucinaciones: el modelo hereda sesgos, errores y omisiones de su modelo base (Qwen2.5); puede producir salidas inesperadas o inexactas.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero las restricciones de uso responsable del autor original deben tenerse en cuenta al tratarse de un modelo derivado.
- Esta ficha describe una resubida de terceros (`squareyards`, a partir de `aoi-ot`); conviene verificar la integridad de los pesos frente al repositorio oficial de Microsoft.

## Enlaces

- Hugging Face (esta release): https://huggingface.co/squareyards/VibeVoice-7B-Custom
- Repositorio de referencia en HF: https://huggingface.co/aoi-ot
- Repositorio comunitario en GitHub: https://github.com/vibevoice-community/VibeVoice
- Informe técnico (arXiv): https://arxiv.org/abs/2508.19205
- Paper LatentLM (arXiv): https://arxiv.org/pdf/2412.08635
- Página del proyecto: https://microsoft.github.io/VibeVoice
- Código oficial: https://github.com/microsoft/VibeVoice
- Modelo VibeVoice-1.5B en HF: https://huggingface.co/microsoft/VibeVoice-1.5B
