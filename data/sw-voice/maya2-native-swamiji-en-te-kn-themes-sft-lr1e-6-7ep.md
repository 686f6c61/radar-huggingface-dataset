# sw-voice/maya2-native-swamiji-en-te-kn-themes-sft-lr1e-6-7ep

## Resumen

maya2-native-swamiji-en-te-kn-themes-sft-lr1e-6-7ep es un modelo de síntesis de voz (text-to-speech) publicado por el usuario sw-voice en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) del modelo base maya-research/maya2-native, orientado a clonar la voz de una persona concreta (identificada como "Swamiji") y a generar locuciones a partir de textos temáticos en inglés, telugu y kannada. El modelo se enmarca en una línea de trabajo de investigación interna, como indica la etiqueta "(research)" de su model card.

El modelo tiene 2.502.398.656 parámetros (unos 2,5 mil millones) almacenados en formato safetensors, con un repositorio de aproximadamente 5 GB. La licencia es Apache 2.0. No se declaran idiomas en los metadatos de Hugging Face, aunque la model card menciona datos de entrenamiento en inglés, telugu y kannada. La información pública disponible es escasa: no hay benchmarks, demos ni documentación detallada sobre la arquitectura interna del modelo base.

Su relevancia actual es limitada: cuenta con cero descargas y cero "likes" en el momento de la consulta, y su propósito parece ser experimental dentro de un proyecto de investigación de TTS con clonación de voz. Resulta útil como referencia para quienes investigan fine-tuning de modelos TTS multilingües con datos de un único hablante y estrategias de entrenamiento por unidades temáticas completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de text-to-speech; no se detalla la arquitectura interna en la informacion proporcionada) |
| Parametros totales | 2.502.398.656 |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible en metadatos; la model card menciona datos de entrenamiento en ingles, telugu y kannada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base maya-research/maya2-native ni sobre el tipo de componente TTS empleado (por ejemplo, si se trata de un modelo autorregresivo, un modelo de difusion o un sistema hibrido con codificador de texto y decodificador acustico). Lo que si documenta la model card es el procedimiento de ajuste fino: se trata de un full fine-tune sobre la voz de Swamiji, entrenado con unidades tematicas completas ("whole-theme units") y con un numero de epocas elevado para igualar el numero de actualizaciones de las ejecuciones originales basadas en clips.

Los datos de entrenamiento citados son tres conjuntos de clips: clips_en_themes.pt (procedente de sw-voice/swamiji-voice-sft-sidon-themes), clips_te_trim.pt (de sw-voice/swamiji-navaratri-telugu-sidon-themes) y clips_kn_trim.pt (de sw-voice/swamiji-navaratri-kannada-sidon-themes). A cada unidad se le recortaron los dos extremos hasta dejar 100 ms de silencio. Los hiperparametros declarados son: learning rate 1e-6, 7 epocas (343 actualizaciones), batch de 1x8 y warmup de 10 pasos. No se especifica el numero total de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, algo poco habitual en TTS.

Como innovacion tecnica destacable, el modelo se carga mediante la clase Maya3TTS.from_pretrained(...) y requiere registrar un clip de referencia de Swamiji con mode="spk", lo que indica un mecanismo de clonacion de voz condicionada por hablante. El codigo asociado se encuentra en el repositorio swamiji-tts, rama research/maya2-sft.

## Capacidades

- Sintesis de voz (text-to-speech) condicionada por un hablante de referencia, mediante el registro de un clip con mode="spk".
- Clonacion de voz del hablante "Swamiji" a partir de los datos de ajuste fino.
- Generacion de locuciones a partir de textos tematicos en ingles, telugu y kannada (idiomas presentes en los datos de entrenamiento).
- Manejo de unidades tematicas completas, segun la estrategia de entrenamiento descrita.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio de entrada ni modos de "thinking".
- Capacidades multilingues: limitadas a los idiomas reflejados en los datos de entrenamiento; no hay metadatos oficiales de idiomas.

## Casos de uso

- Clonacion de voz para locucion de contenidos religiosos o espirituales: el modelo esta ajustado sobre la voz de Swamiji y sobre textos tematicos, por lo que puede generar narraciones consistentes con ese estilo y hablante.
- Generacion de audiolibros y discursos multilingues: permite producir locuciones en ingles, telugu y kannada a partir de textos, reutilizando la misma identidad vocal.
- Investigacion en fine-tuning de TTS: sirve como caso de estudio de ajuste completo con learning rate bajo (1e-6) y un numero controlado de actualizaciones (343) para igualar experimentos previos.
- Evaluacion de estrategias de segmentacion de datos: el recorte a 100 ms de silencio en los extremos de cada unidad permite reproducir el preprocesado y comparar su efecto en la calidad de sintesis.
- Prototipado de asistentes de voz con identidad de marca: el mecanismo mode="spk" facilita registrar un clip de referencia y generar voz consistente en demos internas.
- Generacion de material educativo o divulgativo en telugu y kannada: util para producir contenido de audio en idiomas con menos recursos comerciales de TTS.
- Reproduccion de experimentos de TTS: al estar publicados los hiperparametros y las fuentes de datos, otros investigadores pueden replicar el entrenamiento y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 2,5 mil millones de parametros en precision completa (fp32) ocuparia del orden de 10 GB solo en pesos, y en fp16/bf16 unos 5 GB; a ello habria que sumar el coste de los componentes adicionales del pipeline TTS (codificadores, vocoder y buffers de activaciones), no documentados.
- GPU recomendadas: no disponible. Por tamano, cabria esperar que funcione en GPUs de consumo con suficiente VRAM en precision reducida, pero el fabricante no lo especifica.
- Cabe en consumer GPU: no confirmado; probablemente si en GPUs con 8-16 GB en fp16, sujeto a los requisitos reales del pipeline Maya3TTS, que no se detallan.
- Opciones de despliegue: la model card indica carga mediante Maya3TTS.from_pretrained(...) y el codigo del repositorio swamiji-tts (rama research/maya2-sft). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de la misma categoria (TTS con clonacion de voz de tamano similar) en la informacion proporcionada, ni de datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al estar ajustado sobre la voz y el material de un unico hablante, la salida estara fuertemente condicionada por ese estilo y podria reproducir caracteristicas acusticas del hablante original.
- Riesgo de alucinacion: en TTS, el riesgo se traduce en errores de pronunciacion, prosodia atipica o artefactos acusticos, especialmente fuera de los dominios tematicos vistos en entrenamiento.
- Limitaciones de contexto o idioma: no se declaran idiomas oficiales en los metadatos; la cobertura real se limita a ingles, telugu y kannada segun los datos de entrenamiento. No hay informacion sobre longitud maxima de texto de entrada.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial con atribucion y sin garantias; conviene revisar las condiciones del modelo base maya-research/maya2-native y de los datasets de origen.
- Caveat para produccion: el modelo se etiqueta como "(research)", tiene cero descargas y no ofrece benchmarks ni documentacion de calidad; no es recomendable para produccion sin una evaluacion previa.
- Riesgo legal y etico: la clonacion de voz de una persona concreta puede requerir consentimiento explicito del hablante y cumplir la normativa aplicable sobre sintesis de voz y suplantacion de identidad.
- El repositorio ocupa unos 5 GB, lo que implica requisitos de almacenamiento y tiempos de carga considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/maya2-native-swamiji-en-te-kn-themes-sft-lr1e-6-7ep
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Dataset de origen (ingles): https://huggingface.co/sw-voice/swamiji-voice-sft-sidon-themes
- Dataset de origen (telugu): https://huggingface.co/sw-voice/swamiji-navaratri-telugu-sidon-themes
- Dataset de origen (kannada): https://huggingface.co/sw-voice/swamiji-navaratri-kannada-sidon-themes
- Codigo: repositorio swamiji-tts, rama research/maya2-sft (no se proporciona URL directa en la informacion disponible)
