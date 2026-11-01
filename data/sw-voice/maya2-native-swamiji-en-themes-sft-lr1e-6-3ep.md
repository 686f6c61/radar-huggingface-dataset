# sw-voice/maya2-native-swamiji-en-themes-sft-lr1e-6-3ep

## Resumen

maya2-native-swamiji-en-themes-sft-lr1e-6-3ep es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice. Se trata de un ajuste fino completo (full fine-tune) del modelo base maya-research/maya2-native sobre la voz de una entidad denominada "Swamiji", entrenado con unidades temáticas completas de audio. El modelo resuelve el problema de la clonación y síntesis de una voz concreta a partir de un clip de referencia, mediante un registro de hablante en modo `spk`.

El modelo tiene 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) y un tamaño de repositorio de 5,0 GB en formato safetensors. La model card es extremadamente escueta y de carácter marcadamente investigador: no documenta arquitectura interna, composición del dataset, idiomas soportados ni resultados de evaluación. La información disponible se limita a los hiperparámetros del ajuste fino y al procedimiento de carga.

Su relevancia es limitada y acotada al ámbito de la investigación en TTS: se publica bajo licencia Apache 2.0, no registra descargas ni interacciones en el momento de la consulta y no incluye artefactos de evaluación. Es, por tanto, un experimento reproducible más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de text-to-speech; arquitectura interna no documentada) |
| Parámetros totales | 2.502.398.656 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere inglés, "en", pero no se documenta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna del modelo base maya-research/maya2-native. Por la etiqueta de pipeline (text-to-speech) y el procedimiento de carga descrito (`Maya3TTS.from_pretrained(...)` con registro de un clip de referencia en `mode="spk"`), se trata de un sistema TTS con capacidad de condicionamiento por hablante, es decir, zero-shot o few-shot voice cloning a partir de audio de referencia. El número de parámetros (2,5 mil millones) es coherente con un modelo neuronal de síntesis de voz de tamaño medio-grande, pero no se especifica si emplea un transformer, un modelo difusor, un codec de audio o una combinación.

El entrenamiento consistió en un ajuste fino completo sobre el modelo base con los siguientes hiperparámetros declarados: learning rate 1e-6, 3 épocas (54 actualizaciones totales), batch de 1x8 y 10 pasos de warmup. Los datos proceden de `clips_en_themes.pt`, correspondiente al dataset sw-voice/swamiji-voice-sft-sidon-themes; se mencionan además clips en telugu y kannada (`clips_te_trim`, `clips_kn_trim`) de los datasets swamiji-navaratri-telugu-sidon-themes y swamiji-navaratri-kannada-sidon-themes. Cada unidad temática fue recortada en sus dos extremos hasta dejar 100 ms de silencio. No se documenta el volumen total de audio, la duración, el número de tokens ni si se aplicaron técnicas de RLHF, DPO o preferencia humana. El código de entrenamiento está en el repositorio swamiji-tts, rama `research/maya2-sft`.

## Capacidades

- Síntesis de voz (text-to-speech) condicionada por un clip de referencia de hablante registrado en modo `spk`.
- Clonación de voz del hablante "Swamiji" a partir de audio de referencia, según el procedimiento de carga documentado.
- Entrenamiento sobre unidades temáticas completas, lo que sugiere coherencia prosódica a nivel de fragmento, aunque no se aportan métricas que lo confirmen.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- Capacidades multilingües: no confirmadas; el nombre del modelo incluye "en" y los datasets auxiliares incluyen telugu y kannada, pero la model card no declara idiomas soportados.
- No se documentan modos especiales (thinking, visión, audio de entrada más allá de la referencia de hablante).

## Casos de uso

- Investigación en clonación de voz: el modelo sirve como punto de partida reproducible para estudiar el efecto de ajustes finos completos con pocas actualizaciones (54) sobre un TTS base, dado que se publican learning rate, épocas y batch.
- Reproducción de experimentos académicos: al estar el código en la rama `research/maya2-sft` del repositorio swamiji-tts, permite replicar el pipeline de entrenamiento con los datasets citados.
- Generación de audio de referencia para evaluación de sistemas TTS: útil para construir conjuntos de prueba con una voz concreta y comparar métricas de naturalidad entre variantes del modelo base.
- Estudio de recorte de silencios en datos TTS: el preprocesado documentado (100 ms de silencio en ambos extremos de cada unidad) puede analizarse como variable experimental en la calidad de la síntesis resultante.
- Desarrollo de prototipos de locución para contenido temático: si la calidad resulta aceptable, podría emplearse para narrar material temático en inglés, aunque sin garantías de producción.
- Base para ajustes posteriores: al ser un full fine-tune con licencia Apache 2.0, puede servir como inicialización para otros experimentos de adaptación de hablante o de idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa por tamaño, un modelo de 2,5 mil millones de parámetros en fp16 requiere del orden de 5 GB solo para pesos, más memoria para activaciones y códecs de audio; en fp32, unos 10 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar funcionamiento en GPUs de consumo con 8-16 GB de VRAM en precisión reducida, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio ocupa 5,0 GB en safetensors, lo que sugiere pesos en fp16.
- Opciones de despliegue: la model card solo documenta la carga mediante `Maya3TTS.from_pretrained(...)` del código swamiji-tts. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son adecuados para un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base maya-research/maya2-native sería la referencia natural, pero no se aportan sus especificaciones ni métricas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| maya2-native-swamiji-en-themes-sft-lr1e-6-3ep | 2.502.398.656 | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| maya-research/maya2-native (base) | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas TTS comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información extremadamente escasa: la model card no documenta arquitectura, idiomas, datos de entrenamiento ni evaluación, lo que impide valorar su calidad de forma objetiva.
- Sin métricas de evaluación: no hay MOS, WER, similitud de hablante ni comparaciones con el modelo base, por lo que no puede recomendarse para producción.
- Riesgo de sobreajuste: con solo 54 actualizaciones y 3 épocas sobre un dataset temático concreto, la generalización a textos fuera de dominio es incierta.
- Idiomas no declarados: aunque el nombre incluye "en", no se confirma el soporte multilingüe ni la calidad en telugu o kannada pese a existir datasets asociados.
- Sesgos: al entrenarse sobre la voz de una persona concreta ("Swamiji"), el modelo reproduce sus características acústicas; no se documentan consideraciones éticas ni consentimiento.
- Riesgo de uso indebido: la clonación de voz conlleva riesgos de suplantación; la licencia Apache 2.0 permite uso comercial sin restricciones explícitas adicionales, lo que exige diligence por parte del usuario.
- Alucinación en TTS: posible generación de prosodia o pronunciación incorrecta en textos fuera de distribución, sin mecanismos de control documentados.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte comunitario o corrección de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/maya2-native-swamiji-en-themes-sft-lr1e-6-3ep
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Dataset de referencia (inglés): https://huggingface.co/sw-voice/swamiji-voice-sft-sidon-themes
- Dataset telugu: https://huggingface.co/sw-voice/swamiji-navaratri-telugu-sidon-themes
- Dataset kannada: https://huggingface.co/sw-voice/swamiji-navaratri-kannada-sidon-themes
- Código de entrenamiento: repositorio swamiji-tts, rama `research/maya2-sft` (no se proporciona URL directa en la información disponible)
