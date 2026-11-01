# sw-voice/maya2-native-swamiji-en-te-kn-themes-sft-lr1e-6-3ep

## Resumen

maya2-native-swamiji-en-te-kn-themes-sft-lr1e-6-3ep es un modelo de síntesis de voz (text-to-speech) resultado de un ajuste fino completo (full fine-tune) del modelo base maya-research/maya2-native, desarrollado por el usuario sw-voice. El objetivo del ajuste es clonar la voz de una persona concreta (identificada como "Swamiji") y generar habla en inglés, telugu y kannada a partir de unidades temáticas completas. El modelo se distribuye con licencia Apache 2.0 y está pensado, según la propia model card, para fines de investigación.

El modelo cuenta con 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) almacenados en formato safetensors, con un repositorio de 5,0 GB. Se trata de un ajuste fino sobre un modelo TTS nativo, entrenado durante 3 épocas con 147 actualizaciones, tasa de aprendizaje 1e-6, batch de 1x8 y 10 pasos de calentamiento. El entrenamiento emplea clips de audio en inglés, telugu y kannada, con los extremos de cada unidad recortados a 100 ms de silencio.

La relevancia de este modelo es acotada: es un artefacto de investigación con cero descargas y cero "likes" en el momento de la consulta, y su interés principal reside en documentar un flujo de trabajo de ajuste fino de TTS multilingüe sobre la familia Maya2, más que en su uso como modelo de producción generalista. No se dispone de información sobre la arquitectura interna del modelo base ni sobre sus datos de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base TTS maya-research/maya2-native; arquitectura interna no documentada) |
| Parametros totales | 2.502.398.656 (~2,5 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, telugu y kannada (según los datos de entrenamiento: clips_en_themes, clips_te_trim, clips_kn_trim); no se documenta cobertura adicional |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base maya-research/maya2-native; la model card no describe si se trata de un transformer, un modelo híbrido o una arquitectura específica de TTS (por ejemplo, basada en códec de audio o difusión). Lo que sí se documenta es el proceso de ajuste: un full fine-tune sobre el modelo base, con carga mediante la clase `Maya3TTS.from_pretrained(...)` y registro de un clip de referencia de la voz objetivo con `mode="spk"`, lo que sugiere un esquema de clonación de voz condicionada por hablante.

El entrenamiento se realizó sobre unidades temáticas completas provenientes de tres conjuntos de clips: `clips_en_themes.pt` (derivado de sw-voice/swamiji-voice-sft-sidon-themes), `clips_te_trim.pt` y `clips_kn_trim.pt` (derivados de sw-voice/swamiji-navaratri-telugu-sidon-themes y sw-voice/swamiji-navaratri-kannada-sidon-themes). Cada unidad fue recortada en ambos extremos hasta dejar 100 ms de silencio. Los hiperparámetros fueron: tasa de aprendizaje 1e-6, 3 épocas (147 actualizaciones), batch 1x8 y 10 pasos de calentamiento. No se documenta el número total de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS).

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada a partir de texto de entrada.
- Clonación de voz condicionada por hablante: requiere registrar un clip de referencia de la voz objetivo con `mode="spk"` antes de la inferencia.
- Generación de habla sobre unidades temáticas completas, entrenada específicamente con fragmentos de duración extendida y recortes de silencio controlados.
- Integración mediante la API `Maya3TTS.from_pretrained(...)` del código swamiji-tts (rama `research/maya2-sft`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades multilingües más allá de los tres idiomas de entrenamiento.

## Casos de uso

- Investigación en clonación de voz: el modelo sirve como referencia reproducible para estudiar cómo un full fine-tune con pocas épocas (147 actualizaciones) y LR bajo (1e-6) afecta a la fidelidad de la voz clonada sobre un modelo TTS base.
- Generación de audiolibros o lecturas devocionales en inglés, telugu y kannada: el entrenamiento sobre unidades temáticas completas y el recorte de silencios a 100 ms favorecen narraciones fluidas de fragmentos largos, adecuadas para contenido religioso o educativo.
- Producción de contenido multilingüe para comunidades del sur de la India: permite generar la misma locución en telugu y kannada con una voz consistente, útil para canales de divulgación con audiencias en ambos idiomas.
- Evaluación comparativa de estrategias de ajuste fino en TTS: al estar publicados los hiperparámetros exactos (LR, épocas, batch, warmup) y las fuentes de datos, es un punto de partida para experimentos de ablación controlados.
- Prototipado de asistentes de voz con identidad de marca: la clonación por clip de referencia permite probar una voz corporativa concreta antes de invertir en un pipeline de producción.
- Docencia y demostraciones de TTS condicionado por hablante: el tamaño moderado (~2,5 mil millones de parámetros, 5 GB en safetensors) facilita su despliegue en entornos de laboratorio con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, los pesos en safetensors ocupan 5,0 GB, por lo que en FP16 se necesitan al menos ~5 GB solo para pesos, más memoria para activaciones y el codificador/decodificador de audio del pipeline TTS.
- GPU recomendadas: no disponibles. Por tamaño, el modelo podría caber en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070), aunque no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en modelos con 8 GB o más, sujeto a verificación empírica; no confirmado.
- Opciones de despliegue: la model card solo documenta la carga mediante `Maya3TTS.from_pretrained(...)` del repositorio swamiji-tts (rama `research/maya2-sft`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma familia o categoría en la documentación proporcionada. El propio modelo base maya-research/maya2-native es la referencia natural, pero no se han facilitado sus especificaciones ni resultados. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo explícitamente etiquetado como "research" en la model card; no está validado para uso en producción.
- Cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Entrenado sobre la voz de una persona concreta ("Swamiji"); el uso de la voz clonada puede plantear problemas de consentimiento, derechos de imagen y regulación sobre deepfakes, aunque la licencia del código y pesos sea Apache 2.0.
- Cobertura lingüística limitada a inglés, telugu y kannada según los datos de entrenamiento; el rendimiento fuera de estos idiomas no está documentado.
- No se documentan sesgos, tasas de alucinación ni métricas de calidad (MOS, WER, similitud de hablante).
- No se documenta la longitud máxima de texto de entrada ni el comportamiento con entradas largas.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero las restricciones sobre la identidad vocal clonada deben evaluarse por separado.
- Dependencia de un código específico (swamiji-tts, rama `research/maya2-sft`) que puede no estar mantenido ni ser compatible con versiones futuras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/maya2-native-swamiji-en-te-kn-themes-sft-lr1e-6-3ep
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Dataset de referencia en inglés: https://huggingface.co/sw-voice/swamiji-voice-sft-sidon-themes
- Dataset de referencia en telugu: https://huggingface.co/sw-voice/swamiji-navaratri-telugu-sidon-themes
- Dataset de referencia en kannada: https://huggingface.co/sw-voice/swamiji-navaratri-kannada-sidon-themes
