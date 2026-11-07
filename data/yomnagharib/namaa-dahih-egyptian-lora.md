# YomnaGharib/namaa-dahih-egyptian-lora

## Resumen

NAMAADahih Egyptian LoRA es un adaptador LoRA de síntesis de voz (text-to-speech) para árabe egipcio, desarrollado por YomnaGharib y orientado a narración educativa. No es un modelo autónomo: se trata de un adaptador de aproximadamente 181 MB que se fusiona en la torre T3 del checkpoint base `AliAbdallah/egyptian-arabic-tts-chatterbox`, el cual a su vez se ejecuta sobre el runtime multilingüe de ResembleAI Chatterbox. El repositorio completo ocupa 5,1 GB porque incluye los pesos del adaptador junto con los artefactos de inferencia y checkpoints intermedios.

El adaptador se entrenó sobre el corpus de voz Dahih tras un proceso de limpieza con Demucs, con un manifiesto de entrenamiento de 13.022 segmentos y un conjunto de validación disjunto por episodio de 1.577 segmentos. Utiliza LoRA de rango 64 y alpha 128 aplicado a las proyecciones de atención y feed-forward de T3. La versión publicada corresponde al paso 8.000, y el directorio `final/` contiene pesos idénticos a los de `latest/`.

Su relevancia es acotada pero concreta: cubre la necesidad de una voz de narración en árabe egipcio para un servicio de tutoría con IA, un nicho poco atendido por los sistemas TTS multilingües genéricos, que suelen degradar la pronunciación dialectal. La licencia es Apache 2.0, aunque el uso en producción depende también de los términos del checkpoint base y del dataset de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre la torre T3 de Chatterbox (transformer); el runtime incluye codificador de voz y decodificador de habla |
| Parametros totales | No disponible (el adaptador pesa unos 181 MB; el modelo base no reporta cifra en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (variante egipcia) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador); requiere checkpoint base y runtime Chatterbox en inferencia |

## Arquitectura y entrenamiento

El adaptador se aplica sobre T3, el componente de modelado de texto de la arquitectura Chatterbox de ResembleAI. Chatterbox es un sistema TTS que combina un codificador de voz para la referencia del hablante, una torre de modelado de texto (T3) y un decodificador de habla. El LoRA, con rango 64 y alpha 128, se inserta en las proyecciones de atención y feed-forward de T3, mientras que el codificador de voz y el decodificador se usan tal cual desde el runtime original. En inferencia se cargan tres piezas: el runtime Chatterbox multilingüe, el checkpoint T3 en árabe egipcio de AliAbdallah y este adaptador fusionado sobre T3.

El entrenamiento se realizó sobre el corpus Dahih limpiado con Demucs (13.022 segmentos de entrenamiento, 1.577 de validación disjuntos por episodio). El corpus corresponde a un único hablante etiquetado y a un estilo de narración concreto, lo que explica que el adaptador esté especializado en locución educativa más que en conversación espontánea. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por preferencias, ni el número total de tokens de entrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) en árabe egipcio a partir de texto.
- Clonación de voz condicionada por un WAV de referencia corto y limpio del hablante.
- Estilo de narración educativa, adecuado para locución de lecciones y material didáctico.
- Control de pausas mediante marcadores explícitos: `[PAUSE]` inserta 200 ms de silencio y `[TRANSITION]` inserta 400 ms por defecto.
- Segmentación y normalización de texto previa a la generación, con registro de fragmentos fallidos.
- Generación por fragmentos (chunks) con agregación en un WAV final.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Narración de lecciones en un tutor con IA: el adaptador se integra en el servicio AI Tutor Arabic TTS para leer contenido educativo en árabe egipcio con una voz consistente, usando el paso 8.000 publicado en `latest/`.
- Producción de audiolibros y material didáctico: la voz única y el estilo de narración del corpus Dahih encajan con locución larga, y los marcadores `[PAUSE]` y `[TRANSITION]` permiten estructurar el ritmo entre secciones.
- Generación de pistas de audio para cursos online: el script de inferencia acepta un JSON con el texto y devuelve el WAV final junto con el texto normalizado y los eventos de pausa, lo que facilita la revisión editorial antes de publicar.
- Doblaje y localización al dialecto egipcio: al partir de un WAV de referencia autorizado, se puede adaptar la locución a un hablante concreto para contenido formativo dirigido a Egipto.
- Pruebas A/B de voces en un pipeline TTS: la opción `--no-adapter` permite generar la misma frase con el checkpoint base de AliAbdallah y comparar de forma informal contra la versión con adaptador.
- Evaluación de calidad de pronunciación dialectal: el repositorio incluye `eval_texts.json` con prompts en árabe egipcio y un informe de muestra con rutas de los archivos generados, útil para montar una revisión cualitativa interna.
- Experimentación con checkpoints intermedios: `--adapter-subfolder` permite cargar carpetas como `checkpoints/step-7500` para comparar estados de entrenamiento antes de fijar una versión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los artefactos publicados no contienen puntuaciones que permitan clasificar este adaptador frente al experimento de fine-tuning completo separado (`YomnaGharib/namaa-dahih-egyptian-fft`).

## Requisitos de hardware

- GPU con soporte CUDA; el procedimiento documentado usa Python 3.11 y ruedas de PyTorch 2.5.1 con CUDA 12.1.
- VRAM estimada: no disponible de forma explícita. El adaptador pesa unos 181 MB, pero en inferencia hay que sumar el runtime Chatterbox y el checkpoint T3 base, cuyo consumo no se detalla en la información disponible.
- La primera ejecución descarga varios gigabytes de pesos upstream, por lo que se necesita espacio en disco y conectividad además de la GPU.
- GPU recomendadas: no disponible. La documentación solo exige una GPU compatible con CUDA, sin modelo concreto.
- Despliegue: script propio `inference/generate_narration_namaa_dahih_lora.py` sobre `chatterbox-tts==0.1.3`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- En Debian/Ubuntu puede ser necesario instalar `libsndfile1` si el runtime no carga libsndfile.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAMAA Dahih Egyptian LoRA | Adaptador LoRA sobre Chatterbox T3 | Árabe egipcio | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| AliAbdallah/egyptian-arabic-tts-chatterbox | Checkpoint T3 base | Árabe egipcio | No disponible | No disponible en la información proporcionada | Hugging Face |
| ResembleAI/chatterbox | Runtime TTS multilingüe | Multilingüe | No disponible | No disponible en la información proporcionada | Hugging Face |
| YomnaGharib/namaa-dahih-egyptian-fft | Fine-tuning completo sobre la misma base | Árabe egipcio | No disponible | No disponible en la información proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; la model card solo señala que no publica puntuaciones frente al experimento de fine-tuning completo.

## Limitaciones y advertencias

- El corpus cubre un único hablante etiquetado y un estilo de narración concreto; la pronunciación, inteligibilidad y consistencia pueden variar según el prompt, la grabación de referencia y la longitud de la entrada.
- La model card recomienda revisar la narración generada antes de usarla en lecciones, lo que implica un paso de control de calidad humano en producción.
- El adaptador no funciona de forma aislada: requiere el runtime Chatterbox y el checkpoint T3 de AliAbdallah, cuyos términos y condiciones deben revisarse por separado.
- La licencia Apache 2.0 del adaptador no cubre automáticamente los derechos sobre el dataset de origen ni sobre las voces clonadas; es necesario contar con permiso del hablante cuya voz se use como referencia.
- Riesgo de alucinación en el sentido de errores de pronunciación o prosodia no controlables, especialmente en textos largos o con vocabulario ajeno al corpus de narración.
- Solo se declara soporte de árabe; no hay evidencia de comportamiento correcto en otros idiomas ni en mezcla de registros.
- No se publican métricas objetivas (MOS, WER, similitud de hablante) que permitan comparar con alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YomnaGharib/namaa-dahih-egyptian-lora
- Árbol de archivos: https://huggingface.co/YomnaGharib/namaa-dahih-egyptian-lora/tree/main
- Discusiones: https://huggingface.co/YomnaGharib/namaa-dahih-egyptian-lora/discussions
- Pesos publicados (`latest/`): https://huggingface.co/YomnaGharib/namaa-dahih-egyptian-lora/tree/main/latest
- Prompts de evaluación: https://huggingface.co/YomnaGharib/namaa-dahih-egyptian-lora/blob/main/latest/eval_texts.json
- Checkpoint base: https://huggingface.co/AliAbdallah/egyptian-arabic-tts-chatterbox
- Runtime Chatterbox: https://huggingface.co/ResembleAI/chatterbox
- Dataset de entrenamiento: https://huggingface.co/datasets/YomnaGharib/dahih-tts2-demucs-cleaned
- Experimento de fine-tuning completo: https://huggingface.co/YomnaGharib/namaa-dahih-egyptian-fft
