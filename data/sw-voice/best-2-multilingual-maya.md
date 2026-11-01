# sw-voice/best-2-multilingual-maya

## Resumen

best-2-multilingual-maya es un modelo de síntesis de voz (text-to-speech) publicado por el usuario sw-voice en HuggingFace. Se trata de un ajuste fino completo (full fine-tune) del modelo base maya-research/maya2-native, entrenado específicamente para reproducir la voz de una persona concreta identificada como "Swamiji" en inglés, telugu y kannada. El modelo se presenta como una voz con nombre propio dentro del ecosistema Maya, sin necesidad de clip de referencia en el momento de la inferencia.

Con 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) y un repositorio de 5,0 GB en formato safetensors, se posiciona como un TTS de tamaño medio, adecuado para despliegues en GPU de gama alta de consumo. La licencia Apache 2.0 facilita su uso comercial, aunque la información pública es muy escasa: cero descargas y cero "likes" en el momento de la consulta, y sin datos declarados de idiomas en los metadatos (aunque la model card menciona inglés, telugu y kannada).

La relevancia de este modelo es limitada y de carácter experimental: se trata de un artefacto de investigación (etiquetado explícitamente como "research") que documenta un experimento de clonación de voz con una receta de entrenamiento concreta (exp2c, ponderación de pérdida por codebook temprano). No debe confundirse con un modelo de propósito general; es una voz concreta dentro de una familia mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz basado en el base maya-research/maya2-native; detalles arquitectónicos no publicados) |
| Parametros totales | 2.502.398.656 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, telugu y kannada (según la model card); los metadatos de HuggingFace indican "no disponibles" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base maya-research/maya2-native. Por la naturaleza de la tarea (text-to-speech con codebooks, dado que la receta menciona "early-codebook loss weight D") y por el pipeline declarado (text-to-speech), se trata de un sistema de síntesis de voz con representaciones discretas de audio (codebooks) y un componente de modelado de lenguaje sobre dichas representaciones. No se dispone de datos sobre el número de capas, dimensión oculta, mecanismo de atención ni tipo de decoder.

El entrenamiento consistió en un ajuste fino completo sobre el modelo base con una receta concreta: 719 clips en inglés más clips de temas de Navaratri en telugu y kannada repetidos tres veces por época (FILE*N indica filas repetidas N veces por época). Se aplicó una ponderación de pérdida sobre el codebook temprano con `--depth_w 3,3,1`, tasa de aprendizaje 5e-06, 3 épocas (552 actualizaciones), batch de 1x8, calentamiento lineal durante 138 actualizaciones y después constante. El código de entrenamiento está en el repositorio `swamiji-tts`, rama `research/maya2-sft`. No se menciona RLHF ni DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada con una voz concreta con nombre propio ("Swamiji").
- Generación sin clip de referencia: la voz se carga desde `voices/voices.json` y se invoca con `generate(text, voice="Swamiji")`, usando el formato de prompt `{Swamiji}: <text>`.
- Integración mediante la clase `Maya3TTS.from_pretrained("sw-voice/best-2-multilingual-maya")`.
- Capacidad multilingüe limitada a los tres idiomas mencionados en la model card.
- No se documentan capacidades de tool calling, agentes, razonamiento, código, matemáticas, visión ni audio de entrada.

## Casos de uso

- Investigación en clonación de voz: el modelo sirve como referencia reproducible de un experimento de ajuste fino con una receta documentada (exp2c, ponderación de codebook), útil para comparar metodologías de entrenamiento de TTS.
- Generación de audiolibros o narraciones en inglés con una voz consistente: al no requerir clip de referencia, permite sintetizar textos largos con una identidad vocal fija.
- Localización de contenido a telugu y kannada: útil para producir versiones de audio de materiales escritos en estos idiomas con una voz homogénea.
- Prototipado de asistentes de voz multilingües: puede integrarse como componente TTS en un pipeline de diálogo para los tres idiomas soportados.
- Evaluación de técnicas de ajuste fino con ponderación de pérdida por codebook: el modelo documenta hiperparámetros concretos que permiten reproducir y comparar resultados.
- Demostraciones de voces con nombre propio en el ecosistema Maya: sirve para mostrar el flujo de carga de `voices/voices.json` y la API de generación con voz nombrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,5 mil millones de parámetros en safetensors, los pesos en precisión completa (fp32) ocuparían aproximadamente 10 GB; en fp16/bf16 unos 5 GB. No se dispone de datos oficiales de cuantización ni de requisitos de memoria declarados.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 8-16 GB de VRAM sería el rango razonable para fp16, aunque no está confirmado.
- ¿Cabe en GPU de consumo? Probablemente en modelos como RTX 3090 o RTX 4090 en fp16, pero no hay confirmación oficial.
- Opciones de despliegue: la model card solo documenta el uso mediante `Maya3TTS.from_pretrained` del repositorio `swamiji-tts`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no necesariamente aplicables a este TTS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS multilingüe con voz concreta) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo etiquetado explícitamente como "research": no está pensado como producto estable ni validado para producción.
- Sin descargas ni "likes" en el momento de la consulta: ausencia de validación por parte de la comunidad.
- Idiomas no declarados en los metadatos de HuggingFace; la única fuente es la model card, que menciona inglés, telugu y kannada.
- No se documentan sesgos, pero al ser una clonación de una voz concreta, puede reproducir características idiosincrásicas de esa voz y de los datos de entrenamiento (719 clips en inglés más clips temáticos en telugu y kannada).
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de artefactos de síntesis en textos fuera de dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la clonación de una voz identificable puede plantear problemas de derechos de imagen y voz según la jurisdicción; conviene verificar la autorización del hablante.
- No se dispone de información sobre longitud máxima de texto de entrada, estabilidad en textos largos ni calidad en dominios distintos al de entrenamiento.
- El modelo base (maya-research/maya2-native) condiciona las capacidades y limitaciones; no se detallan sus características en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/best-2-multilingual-maya
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Modelo relacionado (misma selección): https://huggingface.co/sw-voice/best-2-multilingual-vox
- Repositorio de código de entrenamiento: `swamiji-tts`, rama `research/maya2-sft` (no se proporciona URL directa en la información disponible)
