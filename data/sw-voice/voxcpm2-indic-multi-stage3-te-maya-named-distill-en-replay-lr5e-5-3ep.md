# sw-voice/voxcpm2-indic-multi-stage3-te-maya-named-distill-en-replay-lr5e-5-3ep

## Resumen

voxcpm2-indic-multi-stage3-te-maya-named-distill-en-replay-lr5e-5-3ep es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, obtenido mediante un ajuste fino completo del modelo sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep. El objetivo del entrenamiento es incorporar una voz concreta y nombrada ("Swamiji", identificada como Maya) en los pesos del modelo, de modo que la síntesis no dependa de un audio de referencia en el momento de la inferencia. El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado para inglés, telugu y kannada.

El modelo cuenta con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) en formato safetensors, con un repositorio de 9,5 GB. La model card lo clasifica explícitamente como "research", lo que indica que se trata de un experimento de iteración interna más que de un artefacto listo para producción. La relevancia actual reside en su enfoque de clonación de voz sin referencia (reference-free) aplicada a un contexto multilingüe con lenguas índicas, un área donde la mayoría de sistemas comerciales todavía dependen de muestras de audio en tiempo de inferencia.

La información pública disponible es limitada: no se detallan resultados de benchmarks, arquitectura interna ni composición exacta del dataset más allá de la descripción del proceso de ajuste fino. Esta ficha recoge únicamente los datos verificables de la model card y de los metadatos de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS; la model card no detalla la arquitectura interna) |
| Parámetros totales | 2.290.004.544 (≈2,29 mil millones) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), telugu (te), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base (VoxCPM2), por lo que no se dispone de detalles sobre el tipo de transformer, el codificador acústico, el vocoder ni el mecanismo de condicionamiento de voz. Lo que sí se documenta es el procedimiento de ajuste fino: un full fine-tune con el entrenador oficial de VoxCPM, en el que se entrenaron todos los parámetros del modelo. La configuración reportada es micro-batch 1 con acumulación de gradiente 16, 3 épocas equivalentes a 216 pasos, tasa de aprendizaje 5e-05 con decaimiento coseno, 33 pasos de warmup y recorte de gradiente de 1.0.

Los datos de entrenamiento combinan dos fuentes. Por un lado, el conjunto sw-voice/swamiji-telugu-maya-named-distill-500, compuesto por respuestas en telugu leídas por la voz nombrada Maya (sw-voice/best-multilingual-maya), con una pieza de audio por respuesta, recorte del estallido final y filtrado por criterios de parada automática, CER de Sarvam menor o igual al 10 % y ritmo entre 0,6 y 1,6 veces la mediana; se trata de audio sintético. Por otro, se añadió el mismo número de horas de clips reales en inglés de Swamiji procedentes de sw-voice/swamiji-voice-sft-sidon, deduplicados. Este componente de "replay" en inglés busca mitigar el olvido catastrófico del idioma original durante el ajuste hacia el telugu. La innovación destacable es el enfoque reference-free: la identidad vocal queda embebida en los pesos, sin necesidad de un audio de referencia en inferencia. El código del experimento se referencia en el repositorio swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages`.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada, según las etiquetas de idioma del modelo.
- Clonación de voz sin referencia: la voz "Swamiji" (Maya) está incorporada en los pesos, sin necesidad de muestra de audio en tiempo de inferencia.
- Generación de audio a partir de texto con control implícito de la identidad vocal entrenada.
- Capacidad multilingüe limitada a los tres idiomas declarados; no se documenta mezcla de idiomas dentro de una misma locución.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de TTS).
- No se documenta modo "thinking", visión ni audio de entrada (el modelo es text-to-speech, no speech-to-text).
- No se documentan capacidades de control de prosodia, emoción o estilo más allá de lo implícito en los datos de entrenamiento.

## Casos de uso

- Generación de locuciones en telugu para contenido educativo o divulgativo: el modelo permite sintetizar respuestas en telugu con una voz consistente sin disponer de grabaciones de referencia, lo que simplifica la producción de audio a partir de texto ya redactado.
- Doblaje y localización de material en inglés hacia telugu y kannada: al soportar los tres idiomas, puede emplearse para producir pistas de voz en lenguas índicas a partir de guiones traducidos, manteniendo una identidad vocal estable entre piezas.
- Prototipado de asistentes de voz multilingües: sirve para validar flujos de conversación en inglés y telugu antes de invertir en un sistema de TTS comercial, gracias a su licencia Apache 2.0 y a la ausencia de dependencia de audio de referencia.
- Investigación en clonación de voz reference-free: el modelo es un artefacto útil para estudiar cómo se comporta la identidad vocal embebida en los pesos y su robustez ante distintos textos de entrada.
- Generación de audiolibros o notas de voz en telugu: con 2,29 mil millones de parámetros y pesos safetensors, puede desplegarse en infraestructura propia para producir lotes de audio de forma reproducible.
- Evaluación comparativa de TTS para lenguas índicas: al estar publicado con licencia permisiva y con un pipeline declarado, puede integrarse en experimentos de comparación de naturalidad y precisión (por ejemplo, midiendo CER con un ASR como Sarvam, tal y como se usó durante el filtrado de datos).
- Replicación de experimentos de ajuste fino: la model card documenta hiperparámetros y rutas de código, lo que facilita reproducir o extender el entrenamiento con otros idiomas o voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona el uso de un umbral de CER de Sarvam menor o igual al 10 % como criterio de filtrado de los datos de entrenamiento, no como métrica de evaluación del modelo final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 2,29 mil millones de parámetros en precisión completa (fp32) ocuparía aproximadamente 9,2 GB solo en pesos, y en fp16/bf16 alrededor de 4,6 GB, sin contar activaciones ni el vocoder u otros componentes del pipeline de TTS.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcionase en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090 en fp16), pero el autor no lo confirma.
- ¿Cabe en GPU de consumo? No confirmado por el autor; el tamaño de pesos en fp16 (≈4,6 GB) sugiere que sí en tarjetas con 8 GB o más, siempre que el pipeline completo lo permita.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de TTS, el despliegue requeriría el código del entrenador VoxCPM o el repositorio swamiji-tts.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio ecosistema VoxCPM de sw-voice incluye iteraciones previas (por ejemplo, sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep, del que este modelo deriva), pero no se han publicado métricas que permitan una comparación cuantitativa con alternativas como XTTS, Bark, VITS o sistemas comerciales de TTS para lenguas índicas.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| voxcpm2-indic-multi-stage3-te-maya-named-distill-en-replay-lr5e-5-3ep | 2,29 mil millones | no disponible | en, te, kn | Apache 2.0 | publicado (research) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo etiquetado como "research": no hay evidencia de validación para producción ni de evaluación con benchmarks públicos.
- Riesgo de alucinación no aplica en el sentido textual, pero sí existe riesgo de artefactos acústicos, pronunciación incorrecta o inestabilidad prosódica, especialmente fuera de los dominios cubiertos por los datos de entrenamiento (respuestas en telugu y clips en inglés de Swamiji).
- Sesgos potenciales derivados de la voz única entrenada: el modelo está especializado en una identidad vocal concreta ("Swamiji"/Maya), lo que limita su uso para otras voces sin un nuevo ajuste fino.
- Cobertura lingüística restringida a inglés, telugu y kannada; no se documenta comportamiento en otras lenguas ni en mezcla de idiomas.
- El kannada aparece en las etiquetas de idioma, pero la model card no describe datos de entrenamiento específicos en kannada, por lo que su calidad es incierta.
- Los datos de entrenamiento en telugu son sintéticos (generados con otra voz), lo que puede introducir artefactos heredados del sistema de síntesis original.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe evaluar por su cuenta los riesgos de suplantación de voz y las obligaciones legales sobre derechos de imagen y voz en su jurisdicción.
- No se documentan limitaciones de longitud de contexto ni de duración máxima de audio generado.
- El repositorio ocupa 9,5 GB, lo que implica requisitos de almacenamiento considerables para su descarga y despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage3-te-maya-named-distill-en-replay-lr5e-5-3ep
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep
- Dataset de telugu: sw-voice/swamiji-telugu-maya-named-distill-500 (referenciado en la model card; no se proporciona URL directa)
- Dataset de inglés: sw-voice/swamiji-voice-sft-sidon (referenciado en la model card; no se proporciona URL directa)
- Voz de referencia Maya: sw-voice/best-multilingual-maya (referenciado en la model card; no se proporciona URL directa)
- Código del experimento: repositorio swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (no se proporciona URL directa)
