# sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-stageA-reuse87h-lr1e-6-1ep

## Resumen

qwen3-tts-12hz-1.7b-swamiji-te-stageA-reuse87h-lr1e-6-1ep es un modelo de síntesis de voz (text-to-speech) en telugu desarrollado por el usuario sw-voice, derivado mediante ajuste fino completo del modelo sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep, a su vez basado en la familia Qwen3-TTS. El modelo resuelve la generación de audio hablado en telugu con una identidad de voz concreta ("Swamiji"), clonada a partir de un vector x-vector fijo extraído de un fragmento de audio de referencia de unos 10 segundos.

Se trata de la "Stage A" de un pipeline de dos etapas: un ajuste fino sobre 87,1 horas de audio en telugu (5.022 filas) compuesto por recitaciones de Mahabharatam, Datta Maata, Bhagavatam, temas completos de Navaratri y shlokas. La arquitectura subyacente es la de Qwen3-TTS con tokenizador de audio a 12 Hz, con un total de 1.928.677.440 parámetros (aproximadamente 1,7-1,9 mil millones).

El interés del modelo es acotado y de investigación: se publica con licencia Apache 2.0, sin descargas ni interacciones en el momento de redactar esta ficha, y su model card lo etiqueta explícitamente como "research". Es relevante para quienes trabajen en TTS de bajos recursos (telugu), clonación de voz con x-vectors fijos y ajuste fino de modelos Qwen3-TTS con correcciones sobre el script oficial de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (tokenizador de audio a 12 Hz; componentes talker y sub-talker) |
| Parametros totales | 1.928.677.440 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Modelo base | sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep |
| Tamano del repositorio | 4,5 GB |
| Fecha de creacion | 2026-11-04 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-TTS con representación de audio a 12 Hz, organizada en un "talker" principal y un "sub-talker". La función de pérdida combina la entropía cruzada del talker con 0,3 veces la entropía cruzada del sub-talker. El ajuste fino se realizó sobre el layout oficial `sft_12hz.py` con varias correcciones de errores conocidos: `text_projection`, un único desplazamiento (single shift), estado del sub-talker en p-1, etiquetas del sub-talker sin desplazar y pesos maestros en fp32.

El entrenamiento consistió en un ajuste fino completo durante 1 época sobre el conjunto sw-voice/swamiji-telugu-reuse-train (5.022 filas, 87,1 horas de audio en telugu, con material de Mahabharatam, Datta Maata, Bhagavatam, temas completos de Navaratri y shlokas, en versión "RE-USE cleaned"). Hiperparámetros: LR constante de 1e-6 tras 50 actualizaciones de calentamiento, batch de 1x8, 628 actualizaciones en total, AdamW con weight decay 0,01, gradient clipping de 1,0, pesos maestros en fp32 con autocast bf16. En la posición del hablante se emplea un x-vector fijo de Swamiji, extraído de un tema de Navaratri RE-USE de aproximadamente 10 segundos. No se documenta uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en telugu a partir de texto de entrada.
- Clonación de voz mediante audio de referencia (`ref_audio`) y modo `x_vector_only_mode`.
- Identidad de voz fija preentrenada ("Swamiji") inyectada mediante x-vector en la posición del hablante.
- Generación en modo no streaming (`non_streaming_mode=True`) según el ejemplo de la model card.
- Generación de audio condicionada por idioma (`language="Auto"` en el ejemplo).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.
- Capacidad multilingüe: no disponible; el modelo está etiquetado exclusivamente para telugu (te).

## Casos de uso

- Investigación en TTS de bajos recursos para telugu: servir como punto de partida (Stage A) para pipelines de dos etapas y comparar el efecto de las correcciones sobre `sft_12hz.py` frente al script oficial.
- Clonación de una voz concreta con x-vector fijo: el modelo permite generar locuciones con la identidad de Swamiji sin necesidad de proporcionar audio de referencia en cada inferencia, útil para mantener consistencia de voz en corpus largos.
- Síntesis de textos religiosos y recitaciones: el entrenamiento sobre Mahabharatam, Bhagavatam, shlokas y temas de Navaratri lo hace adecuado para probar prosodia en registros recitativos en telugu.
- Generación de audiolibros o material devocional en telugu: con 87,1 horas de dominio específico, puede emplearse para prototipos de narración de textos similares al corpus de entrenamiento.
- Evaluación de robustez de TTS: al ser un modelo de investigación con 0 descargas, resulta útil como caso de estudio de sobreajuste a un hablante y a un dominio acotado.
- Reproducción de experimentos de ajuste fino: los hiperparámetros documentados (LR 1e-6, 628 updates, batch 1x8, pérdida ponderada 1 + 0,3) permiten replicar el entrenamiento sobre otros corpus de telugu.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.928.677.440 parámetros, en bf16 se requieren aproximadamente 3,9 GB solo para pesos; en fp32, unos 7,7 GB. El repositorio ocupa 4,5 GB, coherente con pesos en bf16.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con al menos 8-12 GB de VRAM debería bastar para inferencia en bf16, aunque no se documenta.
- GPU de consumo: previsiblemente cabe en tarjetas consumer con 8 GB o más (por ejemplo, RTX 3060 Ti/4060 Ti en adelante), si bien el dato no está confirmado por el autor.
- Opciones de despliegue: el ejemplo oficial usa la librería `qwen_tts` (`Qwen3TTSModel.from_pretrained`) con `device_map="cuda:0"` y `dtype=torch.bfloat16`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-tts-12hz-1.7b-swamiji-te-stageA-reuse87h-lr1e-6-1ep | 1.928.677.440 | no disponible | te | Apache 2.0 | Hugging Face (0 descargas) |
| sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep (modelo base) | no disponible | no disponible | te | no disponible en la informacion | Hugging Face |
| Otros modelos Qwen3-TTS de la familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo etiquetado como "research" por el propio autor: no está pensado como producto listo para producción.
- Dominio muy acotado: entrenado sobre 87,1 horas de recitación religiosa en telugu (Mahabharatam, Datta Maata, Bhagavatam, Navaratri, shlokas); el comportamiento fuera de ese registro es incierto.
- Identidad de voz única y fija (x-vector de Swamiji): no permite cambiar de hablante sin reentrenar o sustituir el vector.
- Monolingüe en telugu: no hay evidencia de calidad en otros idiomas.
- Riesgo de sobreajuste al corpus y de alucinaciones prosódicas o de pronunciación en textos fuera del dominio.
- Sin descargas ni validación externa: no hay informes independientes de calidad ni de sesgos.
- Licencia Apache 2.0 permite uso comercial, pero la clonación de voz de una persona concreta puede plantear problemas de derechos de imagen y consentimiento; el autor no documenta la procedencia ni el consentimiento del hablante.
- No se documentan requisitos de hardware, latencia ni límites de longitud de texto de entrada.
- El ejemplo de inferencia depende de la librería `qwen_tts`, cuyo soporte y mantenimiento no se detallan.

## Enlaces

- Hugging Face: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-stageA-reuse87h-lr1e-6-1ep
- Modelo base: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-telugu-indictts-sft-lr1e-6-2ep
- Código del experimento (referencia en la model card): `research/exp-iterations/08-qwen3-tts/experiments/03-swamiji-te-two-stage` (repositorio swamiji-tts; URL no disponible)
- Paper, blog o demo: no disponible
