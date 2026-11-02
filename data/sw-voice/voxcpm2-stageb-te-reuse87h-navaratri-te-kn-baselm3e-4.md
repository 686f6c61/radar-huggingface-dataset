# sw-voice/voxcpm2-stageB-te-reuse87h-navaratri-te-kn-baselm3e-4

## Resumen

VoxCPM2-stageB-te-reuse87h-navaratri-te-kn-baselm3e-4 es un modelo de síntesis de voz (text-to-speech) publicado por el usuario sw-voice en HuggingFace. Se trata de un ajuste fino completo (full fine-tune) del modelo base sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep, realizado con el entrenador oficial de VoxCPM. El modelo está orientado a la generación de voz en inglés, telugu y kannada, y su nombre indica que ha sido entrenado sobre datos de temática "navaratri" en telugu y kannada.

El modelo resuelve el problema de la síntesis de voz multilingüe en lenguas del sur de la India (telugu y kannada) junto con inglés, un ámbito donde los modelos TTS comerciales suelen tener cobertura limitada. Con aproximadamente 2.290 millones de parámetros y un tamaño de repositorio de 9,5 GB, se distribuye en formato safetensors bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de investigación.

Es relevante ahora porque representa un ejemplo de ajuste fino de un modelo TTS base con datos específicos de dominio (temas devocionales navaratri) y porque emplea una arquitectura de flow-matching con un modelo de lenguaje base, una combinación que está ganando tracción en la generación de voz neuronal de alta calidad. No obstante, se trata de un modelo de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS basado en flow-matching con modelo de lenguaje base, según la model card) |
| Parametros totales | 2.290.004.544 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), telugu (te), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que el modelo es un ajuste fino completo del modelo base sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep, entrenado con el entrenador oficial de VoxCPM. El entrenamiento emplea flow-matching con un muestreo de t = sigmoid(N(1.0, 1)), lo que sugiere una arquitectura de generación basada en modelos de difusión o flow-matching para la síntesis de audio, combinada con un componente de modelo de lenguaje (los parámetros `base_lm.*` reciben una tasa de aprendizaje diferenciada de 3e-4 frente a 5e-5 del resto). No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset más allá de los datos específicos de ajuste.

El ajuste fino se realizó sobre los datasets sw-voice/swamiji-navaratri-telugu-reuse-themes y sw-voice/swamiji-navaratri-kannada-reuse-themes (127 y 124 unidades temáticas completas, respectivamente), durante 5 épocas con micro-batch de 1 y acumulación de gradiente de 8, lo que supone 160 pasos de entrenamiento. Se entrenaron todos los parámetros (nada congelado), con un programador de tasa de aprendizaje coseno, warmup de 24 pasos y recorte de gradiente de 1.0. El modelo es "reference-free": la identidad de voz está codificada en los pesos, sin necesidad de una referencia de audio en inferencia. El código de entrenamiento se encuentra en el repositorio swamiji-tts, rama `research/exp-iterations/06-voxcpm2-swamiji-stages`.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada.
- Generación de voz sin referencia de audio (reference-free): la voz objetivo está embebida en los pesos del modelo.
- Entrenado específicamente sobre material devocional navaratri en telugu y kannada, lo que puede favorecer la prosodia y pronunciación en ese dominio.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documenta modo de pensamiento (thinking mode) ni otras capacidades especiales.
- Capacidad multilingüe limitada a los tres idiomas indicados (en, te, kn).

## Casos de uso

- Síntesis de contenido devocional en telugu y kannada: el modelo puede generar narraciones o recitaciones de textos navaratri con una voz consistente, gracias a su ajuste específico sobre 127 y 124 unidades temáticas de esos datasets.
- Generación de audiolibros en lenguas del sur de la India: permite convertir texto en voz en telugu y kannada sin necesidad de grabaciones de referencia, lo que simplifica la producción a escala.
- Localización de contenido educativo multilingüe: útil para crear versiones en audio de materiales en inglés, telugu y kannada dentro de un mismo pipeline.
- Investigación en TTS de bajos recursos: sirve como punto de partida para estudiar el ajuste fino de modelos VoxCPM con datos de dominio específico y evaluar la transferencia entre etapas (stage A a stage B).
- Prototipado de asistentes de voz en inglés con extensión a telugu y kannada: el modelo puede integrarse en demos de conversión texto-a-voz para probar la calidad en estos idiomas.
- Reproducción de experimentos: al estar disponible el código en el repositorio swamiji-tts, se puede replicar el entrenamiento y comparar configuraciones (tasa de aprendizaje, épocas, congelación de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 2.290 millones de parámetros en safetensors de precisión completa (probablemente fp32 o bf16), el peso del modelo ronda los 9,5 GB, por lo que se necesitaría al menos esa cantidad de VRAM más el overhead de activaciones.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) sería razonable para inferencia en precisión reducida, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? Probablemente en GPUs con 24 GB o más (RTX 3090/4090) si se usa cuantización o precisión reducida, pero no se especifica.
- Opciones de despliegue: no se documentan explícitamente; el pipeline es text-to-speech y el formato safetensors es compatible con frameworks como Transformers, pero no se confirma soporte de vLLM, llama.cpp, Ollama o TGI (estos últimos orientados a LLM, no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que el modelo base (sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep) es el antecesor directo, pero no se detallan sus especificaciones ni las de alternativas TTS multilingües. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo de investigación: la model card lo etiqueta explícitamente como "(research)", sin garantías de calidad para producción.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Sesgos conocidos: no documentados, pero al entrenarse sobre datos devocionales navaratri en telugu y kannada, puede presentar sesgos de dominio y una cobertura limitada fuera de ese registro.
- Riesgo de alucinación: en TTS, puede traducirse en prosodia incorrecta, pronunciación errónea o artefactos en textos fuera del dominio de entrenamiento.
- Limitaciones de contexto e idioma: solo se declaran inglés, telugu y kannada; no se especifica la longitud máxima de texto de entrada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un modelo de investigación sin benchmarks, se recomienda validación previa en el caso de uso concreto.
- Caveat para producción: no hay datos de latencia, throughput ni calidad subjetiva (MOS), y el modelo base tiene un nombre que sugiere una etapa previa (stage A) con posibles limitaciones heredadas.

## Enlaces

- HuggingFace: https://huggingface.co/sw-voice/voxcpm2-stageB-te-reuse87h-navaratri-te-kn-baselm3e-4
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep
- Dataset telugu: sw-voice/swamiji-navaratri-telugu-reuse-themes (referenciado en la model card, sin URL directa proporcionada)
- Dataset kannada: sw-voice/swamiji-navaratri-kannada-reuse-themes (referenciado en la model card, sin URL directa proporcionada)
- Código: repositorio swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (sin URL directa proporcionada)
