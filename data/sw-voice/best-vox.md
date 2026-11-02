# sw-voice/best-vox

## Resumen

best-vox es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, un fine-tune completo del modelo VoxCPM2 orientado a reproducir una voz concreta ("la voz de Swamiji") en inglés, telugu y kannada sin necesidad de clip de referencia. El modelo resuelve el problema de la clonación de voz zero-shot en entornos de bajos recursos: en lugar de depender de un audio de referencia en tiempo de inferencia, la identidad vocal queda codificada directamente en los pesos, lo que simplifica el despliegue en producción.

Se trata de un ajuste fino completo (todos los parámetros entrenados, sin capas congeladas) sobre el checkpoint `sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep`, con 2.290.004.544 parámetros (~2,29 mil millones) en formato safetensors y un repositorio de 9,5 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

El modelo es relevante ahora porque demuestra un flujo de trabajo reproducible de adaptación de voz multilingüe con datos limitados (127 y 124 unidades temáticas para telugu y kannada, respectivamente) y porque reporta métricas de similitud de voz muy altas (WavLM-ECAPA: te 96,6 %, kn 97,2 %, en 96,8 %) sin necesidad de referencia en inferencia. Es, sin embargo, un modelo de investigación con cero descargas y cero likes en el momento de la ficha, lo que limita la evidencia externa sobre su robustez.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (text-to-speech; detalles internos de la arquitectura no disponibles en la información proporcionada) |
| Parámetros totales | 2.290.004.544 (~2,29 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio contiene safetensors; no se documentan cuantizaciones GGUF u otras) |
| Idiomas soportados | inglés (en), telugu (te), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna de VoxCPM2 más allá de que se trata de un modelo de text-to-speech entrenado con un esquema de flow matching: la model card menciona explícitamente `flow-matching t = sigmoid(N(1.0, 1))`, lo que indica un objetivo generativo basado en flujo continuo para la síntesis de audio. No se especifican el número de capas, la dimensión oculta, el tipo de encoder de texto ni el vocoder empleado, por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó en dos etapas. La etapa A se entrenó con 87 horas de charlas y shlokas en telugu (dataset `sw-voice/swamiji-telugu-reuse-train`, esquema RE-USE) más aproximadamente 3 horas de inglés duplicadas. La etapa B, que corresponde a este modelo, añade datos de Navaratri en telugu y kannada (`sw-voice/swamiji-navaratri-telugu-reuse-themes` y `-kannada-reuse-themes`, con 127 y 124 unidades temáticas completas respectivamente) y se ejecutó durante 5 épocas con micro-batch 1 y acumulación 8 (160 pasos totales), learning rate 5e-5 con cosine y warmup 24, `base_lm.*` a 3e-4 y gradient clipping 1.0. Todos los parámetros se entrenaron sin congelar capas, lo que constituye un fine-tune completo y no un ajuste de adaptadores.

La innovación principal es la naturaleza *reference-free* del modelo: la identidad vocal está embebida en los pesos, de modo que la inferencia no requiere un clip de audio de referencia, a diferencia de los enfoques de clonación zero-shot convencionales. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada desde un único modelo.
- Reproducción de una identidad vocal concreta sin clip de referencia en inferencia (la voz está en los pesos).
- Multilingüismo limitado a los tres idiomas entrenados; no se documenta transferencia a otros idiomas.
- Generación de voz con similitud reportada alta frente a la voz real (WavLM-ECAPA: te 96,6 %, kn 97,2 %, en 96,8 %; Q&A en telugu 98,6 %).
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de un modelo TTS).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio de entrada): no disponibles.

## Casos de uso

- Síntesis de contenido religioso o espiritual multilingüe: el modelo permite generar discursos y shlokas en telugu, kannada e inglés con una voz consistente, adecuado porque la identidad vocal está fijada en los pesos y no requiere gestionar clips de referencia por idioma.
- Audiolibros y narración de textos largos: al no necesitar referencia en inferencia, se puede encadenar la síntesis de capítulos completos con una sola carga del modelo, simplificando el pipeline.
- Locución para vídeos y materiales educativos en telugu y kannada: útil para productores de contenido que necesitan una voz concreta y estable en varios idiomas del sur de la India.
- Preservación de voz para archivo o memoria: el enfoque reference-free permite generar nuevas locuciones con una voz documentada sin exponer grabaciones originales en cada inferencia.
- Doblaje y localización de contenido entre inglés y los idiomas dravídicos soportados: el modelo cubre los tres idiomas con la misma identidad vocal, lo que facilita mantener coherencia de marca sonora.
- Investigación en adaptación de voz con datos limitados: el modelo sirve como referencia reproducible de fine-tune completo sobre VoxCPM2 con ~250 unidades temáticas, útil para estudiar la relación entre horas de datos y similitud de voz.
- Prototipado de asistentes de voz en telugu o kannada: al ser Apache 2.0 y no requerir referencia, se puede integrar en demos y pruebas de concepto sin coste de licencia.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados en la información disponible son métricas de similitud de voz (WavLM-ECAPA, porcentaje frente a real-vs-real):

| Métrica | Idioma | Valor |
|---|---|---|
| Similitud de voz (WavLM-ECAPA) | Telugu (te) | 96,6 % |
| Similitud de voz (WavLM-ECAPA) | Kannada (kn) | 97,2 % |
| Similitud de voz (WavLM-ECAPA) | Inglés (en) | 96,8 % |
| Q&A en telugu | Telugu (te) | 98,6 % |

No se han publicado resultados de benchmarks estándar (MOS, WER, MMLU, HumanEval, GSM8K u otros) en la información disponible. No se dispone de comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,29 B parámetros en safetensors (probablemente fp32 o bf16, dado el tamaño de 9,5 GB del repo), una estimación orientativa en bf16 sería de ~4,6 GB de pesos, más overhead de activaciones y vocoder; en fp32, ~9,2 GB. Estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPUs consumer con 12-16 GB de VRAM en bf16, pero no hay confirmación del autor.
- ¿Cabe en GPU consumer? Probablemente sí en tarjetas con 12 GB o más en bf16, pero no está verificado ni documentado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor menciona el repositorio de código `swamiji-tts` (`research/exp-iterations/06-voxcpm2-swamiji-stages`) y el entrenador oficial de VoxCPM, pero no una guía de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La model card menciona que este modelo reemplaza a `sw-voice/voxcpm2-stage3-te-kn-reuse-tmu1.0` (antes `best-2-multilingual-vox`) y que convive con `sw-voice/best-2-multilingual-maya`, pero no ofrece tablas comparativas de rendimiento entre ellos.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| sw-voice/best-vox | 2,29 B | no disponible | en, te, kn | Apache 2.0 | Activo (2026-11-02) |
| sw-voice/voxcpm2-stage3-te-kn-reuse-tmu1.0 | no disponible | no disponible | te, kn (según nombre) | no disponible | Reemplazado por best-vox |
| sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep | no disponible | no disponible | en, te | no disponible | Modelo base de la etapa A |

## Limitaciones y advertencias

- Modelo de investigación: la model card lo etiqueta explícitamente como "(research)" y no documenta validación externa, pruebas de robustez ni evaluación por terceros.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni informes independientes de calidad.
- Idiomas limitados a inglés, telugu y kannada; no se garantiza un comportamiento correcto fuera de esos tres idiomas.
- Riesgo de alucinación en el sentido de prosodia o pronunciación incorrecta: no se documentan métricas de inteligibilidad (WER, MOS) que permitan acotar este riesgo.
- Sesgos conocidos: no documentados. Al entrenarse con la voz de una persona concreta y material religioso (charlas, shlokas, Navaratri), el modelo puede reproducir sesgos de dominio y estilo de ese corpus.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datasets de entrenamiento deben verificarse de forma independiente; la información disponible no detalla las licencias de `sw-voice/swamiji-telugu-reuse-train` ni de los datasets de Navaratri.
- Consideraciones éticas: la clonación de voz reference-free con identidad embebida plantea riesgos de suplantación; no se documentan mecanismos de consentimiento o marcas de agua.
- Sin datos de contexto, cuantización ni latencia: la ausencia de estas especificaciones dificulta la planificación de producción.
- El repositorio de 9,5 GB implica un coste de almacenamiento y descarga considerable para un modelo de 2,29 B parámetros.

## Enlaces

- HuggingFace: https://huggingface.co/sw-voice/best-vox
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep
- Modelo reemplazado: https://huggingface.co/sw-voice/voxcpm2-stage3-te-kn-reuse-tmu1.0
- Modelo complementario: https://huggingface.co/sw-voice/best-2-multilingual-maya
- Dataset etapa A: sw-voice/swamiji-telugu-reuse-train (referenciado en la model card, sin URL directa en la información proporcionada)
- Dataset etapa B telugu: sw-voice/swamiji-navaratri-telugu-reuse-themes (referenciado, sin URL directa)
- Dataset etapa B kannada: sw-voice/swamiji-navaratri-kannada-reuse-themes (referenciado, sin URL directa)
- Código: repositorio `swamiji-tts`, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (sin URL directa en la información proporcionada)
