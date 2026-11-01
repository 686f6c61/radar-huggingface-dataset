# sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep

## Resumen

voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, resultado de un ajuste fino completo (full fine-tune) del modelo sw-voice/voxcpm2-indic-multi-lr5e-5-1ep. El modelo parte de la familia VoxCPM2, orientada a la generación de habla, y se ha especializado en la reproducción de una voz concreta (denominada "Swamiji") a partir de 958 clips de audio en inglés limpiados con la herramienta NVIDIA RE-USE. Su propósito es la clonación de voz sin referencia en tiempo de inferencia: la identidad vocal queda embebida en los pesos del modelo.

El modelo tiene 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 9,5 GB. Está etiquetado para los idiomas inglés (en), telugu (te) y canarés (kn), heredados del modelo base multilingüe indio, aunque el ajuste fino se ha realizado exclusivamente con datos en inglés. La licencia es Apache 2.0.

Se trata de un modelo de investigación, con solo 14 descargas y ningún "me gusta" en el momento de la consulta, publicado el 31 de octubre de 2026. Su relevancia es limitada fuera del contexto del proyecto: es una iteración experimental dentro de una serie de experimentos de ajuste fino de TTS, útil para quienes estudien adaptación de voz con VoxCPM2 o necesiten replicar el pipeline de entrenamiento documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS de la familia VoxCPM2; detalles de arquitectura no especificados en la información proporcionada) |
| Parametros totales | 2.290.004.544 |
| Parametros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), telugu (te), canarés (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base VoxCPM2 (tipo de decoder, tokenizador acústico, vocoder o mecanismo de difusión, en su caso). Lo que sí se documenta es el proceso de ajuste fino: se realizó un full fine-tune con el entrenador oficial de VoxCPM, actualizando todos los parámetros del modelo. El conjunto de datos fue sw-voice/swamiji-voice-sft-reuse, compuesto por 958 clips de audio en inglés de la voz "Swamiji", con el audio original limpiado mediante NVIDIA RE-USE.

Los hiperparámetros de entrenamiento fueron: micro-batch de 1 con acumulación de gradiente de 16, 10 épocas (600 pasos en total), tasa de aprendizaje de 0,0001 con scheduler coseno, 90 pasos de warmup y recorte de gradiente de 1,0. El modelo es "reference-free": no requiere audio de referencia en inferencia porque la identidad vocal está codificada en los pesos. El código del experimento se encuentra en el repositorio swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages`. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con la identidad vocal "Swamiji" embebida en los pesos (sin necesidad de audio de referencia).
- Generación de habla en inglés, con soporte declarado también para telugu y canarés heredado del modelo base (aunque el ajuste fino se realizó solo con datos en inglés).
- Clonación de voz sin referencia en tiempo de inferencia (reference-free).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento multimodal más allá del TTS.
- No se documentan modos especiales como thinking mode, visión o audio de entrada.

## Casos de uso

- Investigación en adaptación de voz: el modelo sirve como caso de estudio de full fine-tune de un TTS multilingüe sobre un locutor concreto, con hiperparámetros y pipeline documentados para replicar el experimento.
- Generación de audiolibros o narraciones con una voz consistente: al estar la identidad vocal en los pesos, se puede sintetizar texto largo en inglés manteniendo el timbre sin aportar muestras de referencia en cada petición.
- Prototipado de asistentes de voz en inglés: integrable en un pipeline de TTS para respuestas habladas, siempre que se acepte la limitación de una única voz y el carácter experimental del modelo.
- Evaluación comparativa de estrategias de ajuste fino: al existir otras iteraciones de la misma serie (stage2, distintos learning rates y épocas), permite comparar el efecto de los hiperparámetros en la calidad de la voz.
- Limpieza y reutilización de datasets de voz: el uso de NVIDIA RE-USE en los 958 clips documenta un flujo de preparación de audio que puede reutilizarse en otros proyectos de TTS.
- Demostraciones de clonación de voz sin referencia: útil para mostrar en entornos controlados cómo un modelo puede fijar una voz en los pesos y generar habla sin muestras de referencia.
- Experimentación con TTS multilingüe indio: aunque el fine-tune es en inglés, la base multilingüe (en, te, kn) permite explorar el comportamiento en telugu y canarés, con la cautela de que no fue ajustado con datos en esos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,29 mil millones de parámetros, en precisión completa (fp32) los pesos ocuparían aproximadamente 9,2 GB; en fp16/bf16, unos 4,6 GB; en cuantización de 8 bits, unos 2,3 GB; en 4 bits, unos 1,2 GB. Estas cifras son estimaciones por tamaño de parámetros y no incluyen el vocoder ni los buffers de inferencia, que no se documentan.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo con al menos 8-12 GB de VRAM en fp16 (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no hay confirmación oficial.
- Cabe en GPU de consumo: previsiblemente sí en fp16 con 8 GB o más, sujeto a verificación; no confirmado.
- Opciones de despliegue: no se documentan (no se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de TTS, requeriría el código de inferencia de VoxCPM, no listado en la información).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. Como referencia estructural, se puede comparar con su modelo base y con otras iteraciones de la misma serie:

| Modelo | Parametros | Idiomas | Licencia | Relacion |
|---|---|---|---|---|
| voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep | 2.290.004.544 | en, te, kn | Apache 2.0 | Este modelo |
| sw-voice/voxcpm2-indic-multi-lr5e-5-1ep | no disponible | no disponible | no disponible | Modelo base del que parte |
| Otras iteraciones de la serie swamiji-tts | no disponible | no disponible | no disponible | Variantes con distintos hiperparámetros |

No se dispone de comparación con alternativas de la misma categoría (otros TTS de tamaño similar) en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo etiqueta como "research"; no hay garantías de calidad, estabilidad ni soporte para producción.
- Voz única: la identidad vocal está fijada en los pesos ("Swamiji"), por lo que no es un TTS generalista multihablante.
- Entrenado solo con 958 clips en inglés: el rendimiento en telugu y canarés, aunque declarados como idiomas soportados, no está validado y probablemente sea deficiente.
- Riesgo de alucinación y artefactos acústicos: no se documentan métricas de calidad (MOS, WER, similitud de hablante), por lo que se desconoce la fidelidad de la síntesis.
- Sesgos: al derivar de un único locutor y un dataset pequeño, puede reproducir características del habla, acento y estilo de ese locutor; no se documentan análisis de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no detalladas en la información proporcionada.
- Sin datos de contexto, cuantización ni despliegue: no se puede planificar una integración en producción sin información adicional del repositorio de código.
- Popularidad mínima (14 descargas, 0 likes): sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-lr5e-5-1ep
- Dataset de entrenamiento (referenciado en la model card): sw-voice/swamiji-voice-sft-reuse (no se proporciona URL directa en la información disponible)
- Código del experimento: repositorio swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (no se proporciona URL directa en la información disponible)
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
