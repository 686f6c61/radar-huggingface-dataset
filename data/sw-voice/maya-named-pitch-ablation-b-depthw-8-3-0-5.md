# sw-voice/maya-named-pitch-ablation-b-depthw-8-3-0.5

## Resumen

maya-named-pitch-ablation-b-depthw-8-3-0.5 es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, consistente en un ajuste fino completo (full fine-tune) del modelo base maya-research/maya2-native sobre la voz de una persona concreta identificada como "Swamiji". Con 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) y un repositorio de 5,0 GB en formato safetensors, se distribuye bajo licencia Apache 2.0 y está etiquetado como material de investigación (research).

El modelo forma parte de una ablación centrada en prosodia, concretamente la variante B, con una configuración de profundidad de pesos `--depth_w 8,3,0.5`. Su propósito es permitir la generación de voz con una identidad concreta sin necesidad de proporcionar un clip de referencia en tiempo de inferencia: la voz se selecciona por nombre a través de la API `Maya3TTS.from_pretrained(...)` y la llamada `generate(text, voice="Swamiji")`.

Por su naturaleza de experimento de ablación con cero descargas y cero likes en el momento de la consulta, debe considerarse un artefacto de investigación más que un modelo listo para producción. No se dispone de información sobre idiomas soportados más allá de las referencias del autor a clips en inglés, telugu y kannada en los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de text-to-speech basado en maya-research/maya2-native) |
| Parametros totales | 2.502.398.656 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (datos de entrenamiento con clips en inglés, telugu y kannada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base maya-research/maya2-native; lo que sí se especifica es que este artefacto es un ajuste fino completo (no un adaptador LoRA) de dicho modelo. El entrenamiento se realizó con la receta `exp2c`, compuesta por 719 clips en inglés más temas de Navaratri en telugu y kannada repetidos tres veces cada uno (`clips.pt`, `clips_te.pt*3`, `clips_kn.pt*3`, donde `FILE*N` indica filas repetidas N veces por época), todos ellos asociados a la voz nombrada `{Swamiji}`.

Los hiperparámetros documentados son: learning rate de 5e-06, 3 épocas (552 actualizaciones), batch de 1x8, calentamiento lineal durante 138 actualizaciones seguido de tasa constante. La innovación técnica declarada es la ablación de prosodia B mediante el parámetro `--depth_w 8,3,0.5`, que modula la profundidad de los pesos en el codificador de pitch o prosodia. El código de entrenamiento se encuentra en el repositorio `swamiji-tts`, rama `research/maya2-sft`. No se documentan fases de RLHF, DPO ni detalles sobre el volumen total de tokens de audio.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Generación con voz nombrada sin clip de referencia: la identidad `Swamiji` se carga desde `voices/voices.json` y se invoca con `generate(text, voice="Swamiji")`.
- Soporte de prompt con prefijo de voz: el formato `{Swamiji}: <text>` permite condicionar la generación.
- Cobertura multilingüe limitada a lo visto en entrenamiento: inglés, telugu y kannada (no se garantiza calidad ni se declaran idiomas oficialmente soportados).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento explícito.

## Casos de uso

- Investigación en clonación y adaptación de voz: el modelo sirve como punto de comparación en estudios de ablación de prosodia, ya que su configuración `depth_w 8,3,0.5` está pensada para aislar el efecto de la profundidad de pesos en la calidad prosódica.
- Generación de audiolibros o narraciones con una voz consistente: al no requerir clip de referencia, permite producir lotes de audio con la misma identidad vocal invocando la voz por nombre.
- Localización de contenido religioso o devocional: los datos de entrenamiento incluyen temas de Navaratri en telugu y kannada, por lo que el modelo es adecuado para probar síntesis en esos contextos lingüísticos.
- Pruebas de integración de pipelines TTS: la API `Maya3TTS.from_pretrained(...)` facilita incorporar el modelo en prototipos de síntesis dentro de aplicaciones de investigación.
- Evaluación comparativa de fine-tunes: al ser un artefacto de ablación, resulta útil para medir el impacto de hiperparámetros concretos frente a otras variantes del mismo modelo base.
- Demostraciones académicas de TTS multilingüe: permite ilustrar la generación de voz en inglés, telugu y kannada a partir de un único checkpoint ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,5 mil millones de parámetros, en precisión completa (fp32) requeriría aproximadamente 10 GB solo para pesos, en fp16/bf16 unos 5 GB y en cuantización de 8 bits unos 2,5 GB, sin contar memoria para activaciones y buffers de audio.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 8-16 GB de VRAM (RTX 3080/4080/4090, A10, L4) sería suficiente en fp16, y una A100/H100 aportaría margen para lotes mayores.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas con al menos 8 GB de VRAM en fp16, aunque el autor no lo confirma.
- Opciones de despliegue: la model card solo menciona la API `Maya3TTS.from_pretrained(...)` del repositorio `swamiji-tts`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| maya-named-pitch-ablation-b-depthw-8-3-0.5 | 2.502.398.656 | no disponible | Apache 2.0 | HuggingFace (0 descargas) | Fine-tune de investigación sobre maya2-native |
| maya-research/maya2-native | no disponible | no disponible | no disponible | HuggingFace (modelo base) | Modelo original sin ajuste de voz |
| Otras variantes de ablación de sw-voice | no disponible | no disponible | Apache 2.0 (presumible) | HuggingFace | No se detallan en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo etiqueta como `(research)` y el repositorio registra cero descargas y cero likes, sin validación comunitaria.
- Sesgos de voz: al estar ajustado sobre una única identidad vocal ("Swamiji"), no representa diversidad de hablantes y puede reproducir sesgos prosódicos o de pronunciación de los datos de entrenamiento.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas o prosodia inestable, especialmente fuera de los dominios vistos en entrenamiento.
- Cobertura lingüística limitada y no declarada oficialmente: solo hay evidencia de inglés, telugu y kannada en los datos; el campo de idiomas aparece como no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base maya-research/maya2-native debe verificarse por separado, ya que sus términos podrían imponer condiciones adicionales.
- Caveat de producción: no se documentan latencias, throughput, cuantizaciones ni soporte en frameworks estándar de despliegue, lo que dificulta su uso fuera de entornos de investigación.
- Consideraciones éticas: la síntesis de una voz concreta sin clip de referencia plantea riesgos de suplantación; debe usarse con consentimiento y transparencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/maya-named-pitch-ablation-b-depthw-8-3-0.5
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Repositorio de código citado: `swamiji-tts`, rama `research/maya2-sft` (no se proporciona URL en la información disponible)
- Paper, blog o demo: no disponibles
