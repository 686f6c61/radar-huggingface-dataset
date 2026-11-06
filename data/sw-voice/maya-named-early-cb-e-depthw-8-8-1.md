# sw-voice/maya-named-early-cb-e-depthw-8-8-1

## Resumen

Maya named early-cb-e depthw-8-8-1 es un modelo de síntesis de voz (text-to-speech) obtenido mediante un fine-tune completo del modelo base maya-research/maya2-native sobre la voz de un hablante concreto identificado como «Swamiji». Lo publica el usuario sw-voice en Hugging Face con licencia Apache 2.0 y un total de 2.502.398.656 parámetros en pesos safetensors, lo que lo sitúa en la franja de los modelos TTS de tamaño medio-grande.

El modelo resuelve el problema de la clonación y síntesis de una voz concreta sin necesidad de clip de referencia en tiempo de inferencia: la voz queda registrada en un fichero `voices/voices.json` y se invoca por nombre (`voice="Swamiji"`), con el texto formateado como `{Swamiji}: <text>`. Es, por tanto, un modelo de voz nombrada orientado a investigación, no un TTS multihablante de propósito general.

Su relevancia es limitada y muy específica: se trata de un artefacto de investigación derivado de un receta interna (`exp2c`) del repositorio swamiji-tts, con cero descargas y cero likes en el momento de la ficha, y sin model card que documente arquitectura, contexto o idiomas más allá de los datos de entrenamiento. Resulta útil como referencia para quien quiera reproducir el pipeline de fine-tune o estudiar el efecto del weighting por codebook temprano en un TTS basado en el modelo Maya2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base maya-research/maya2-native; TTS) |
| Parámetros totales | 2.502.398.656 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (datos de entrenamiento en inglés, telugu y kannada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base maya2-native ni sobre el diseño del cabezal de síntesis. El autor no documenta si se trata de un transformer autorregresivo sobre tokens de audio, un modelo de difusión o un esquema híbrido, ni tampoco la longitud de contexto o la tasa de muestreo de audio.

El entrenamiento consiste en un fine-tune completo (full fine-tune) del modelo maya2-native sobre la voz «Swamiji» con la receta `exp2c`. Los datos son 719 clips en inglés más los temas Navaratri en telugu y kannada repetidos tres veces cada uno (`clips_te.pt*3`, `clips_kn.pt*3`, donde `*N` indica filas repetidas N veces por época). Se aplicó un weighting de pérdida por codebook temprano con `--depth_w 8,8,1` (peso E sobre los codebooks iniciales). Hiperparámetros: learning rate 5e-06, 3 épocas (552 actualizaciones), batch 1x8, warmup lineal de 138 actualizaciones seguido de tasa constante. El código de entrenamiento está en el repositorio swamiji-tts, rama `research/maya2-sft`.

## Capacidades

- Síntesis de voz (text-to-speech) de un único hablante nombrado («Swamiji») sin clip de referencia en inferencia.
- Carga de la voz mediante `voices/voices.json` y llamada `generate(text, voice="Swamiji")` con prompt `{Swamiji}: <text>`.
- Cobertura lingüística derivada de los datos: inglés, telugu y kannada (el telugu y el kannada con triple repetición por época).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- No se documentan capacidades multilingües más allá de los tres idiomas presentes en el corpus de entrenamiento.

## Casos de uso

- Investigación en clonación de voz: el modelo sirve como punto de partida reproducible para estudiar el efecto del weighting por codebook (`depth_w 8,8,1`) en la calidad de la síntesis, comparándolo con variantes del mismo autor.
- Generación de narración en inglés para prototipos internos: al estar entrenado con 719 clips en inglés, puede emplearse para locuciones de prueba en entornos de desarrollo sin necesidad de referencia de audio.
- Síntesis en telugu y kannada para experimentos de TTS de bajos recursos: la triple repetición de los clips Navaratri sugiere un intento de reforzar estos idiomas, útil para evaluar el equilibrio multilingüe en un modelo pequeño.
- Reproducción del pipeline de fine-tune: el repositorio swamiji-tts y la receta `exp2c` permiten replicar el entrenamiento con otros hablantes y comparar hiperparámetros (LR, épocas, warmup).
- Evaluación de TTS con voz nombrada frente a TTS con clip de referencia: el modelo elimina la dependencia de un audio de referencia, lo que simplifica la integración en pipelines de generación por lotes.
- Docencia y experimentación académica: al ser Apache 2.0 y de tamaño contenido (5 GB de repo), puede desplegarse en un servidor con GPU única para prácticas de fine-tune de TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, 2.500 millones de parámetros en fp16 requieren aproximadamente 5 GB solo para pesos, más memoria para activaciones y buffers de audio; en fp32 serían unos 10 GB.
- GPU recomendadas: no disponible. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100) debería poder alojar los pesos en precisión completa; una GPU consumer de 8-12 GB requeriría cuantización, no documentada.
- ¿Cabe en GPU consumer? Probablemente sí en RTX 4090 (24 GB) en fp16; en GPUs de 8 GB no hay datos que lo confirmen.
- Opciones de despliegue: el autor solo documenta la API Python `Maya3TTS.from_pretrained(...)` del repositorio swamiji-tts. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son habituales para modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS de voz nombrada basados en Maya2) con parámetros, contexto, rendimiento o licencia documentados.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de uso en producción.
- La model card no documenta arquitectura, contexto, cuantizaciones ni latencia, lo que impide evaluar su idoneidad para despliegues reales.
- Entrenado sobre una única voz («Swamiji») y un corpus reducido (719 clips en inglés más repeticiones de telugu y kannada): riesgo alto de sobreajuste y de degradación fuera de dominio.
- Idiomas no declarados oficialmente; la cobertura real de telugu y kannada es incierta pese a la repetición de datos.
- Riesgo de alucinación acústica y de artefactos en textos largos o con vocabulario no visto, no cuantificado por el autor.
- Posibles sesgos derivados del hablante y del material de entrenamiento (voz religiosa/devocional), no evaluados.
- Licencia Apache 2.0 permite uso comercial, pero la voz clonada puede estar sujeta a derechos de imagen o consentimiento del hablante original; verificar antes de cualquier uso público.
- No se documentan restricciones de uso adicionales ni cláusulas de responsabilidad por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/maya-named-early-cb-e-depthw-8-8-1
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Repositorio de código (rama `research/maya2-sft`): https://github.com/swamiji-tts (referencia citada en la model card; no se proporciona URL exacta)
