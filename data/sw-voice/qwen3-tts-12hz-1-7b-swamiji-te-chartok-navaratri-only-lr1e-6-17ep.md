# sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-chartok-navaratri-only-lr1e-6-17ep

## Resumen

`qwen3-tts-12hz-1.7b-swamiji-te-chartok-navaratri-only-lr1e-6-17ep` es un modelo de síntesis de voz (text-to-speech) en telugu desarrollado por el usuario `sw-voice`, obtenido mediante un ajuste fino completo (full fine-tune) del modelo `sw-voice/qwen3-tts-12hz-1.7b-telugu-chartok-indictts-sft-lr1e-6-2ep`, que a su vez deriva de la familia Qwen3-TTS de 1,7 mil millones de parámetros. El modelo está especializado en una única voz personalizada denominada `swamiji` y entrenado exclusivamente con material temático de Navaratri en telugu (127 unidades, 1,83 horas de audio).

La innovación técnica principal es el uso de tokens de carácter para el telugu: el tokenizador incorpora 100 tokens añadidos, uno por cada punto de código asignado del bloque Unicode telugu (letras, signos vocálicos, virama, anusvara, dígitos), de modo que el texto se lee un carácter por token en lugar de fragmentarse mediante BPE a nivel de byte. Según la model card, esto reduce la ratio de 1,69 a 1,16 tokens por carácter.

Se trata de un modelo de investigación con cero descargas y cero likes en el momento de redactar esta ficha, publicado bajo licencia Apache 2.0 y orientado a experimentación con voces personalizadas y representación tokenizada de lenguas índicas. No está pensado como un sistema TTS generalista multilingüe, sino como un artefacto de investigación muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer con talker y sub-talker, codec de 12 Hz) |
| Parametros totales | 1.916.676.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-TTS, un sistema de síntesis de voz que combina un componente generativo tipo transformer ("talker") con un sub-talker encargado de la generación de tokens acústicos, operando sobre un codec de 12 Hz. El ajuste fino se realizó sobre el checkpoint `sw-voice/qwen3-tts-12hz-1.7b-telugu-chartok-indictts-sft-lr1e-6-2ep`, que ya incorporaba un SFT en telugu con tokens de carácter.

El entrenamiento consistió en un full fine-tune con tasa de aprendizaje constante de 1e-6 tras 10 actualizaciones de calentamiento, batch de 1x8, 17 épocas (272 actualizaciones en total, 16 por época), 127 clips de audio, optimizador AdamW con weight decay 0,01, recorte de gradiente de 1,0 y pesos maestros en fp32 con autocast en bf16. La función de pérdida combina la entropía cruzada del talker más 0,3 veces la del sub-talker. El autor indica que se corrigieron errores conocidos del script oficial `sft_12hz.py` (text_projection, desplazamiento único, estado del sub-talker en p-1, etiquetas del sub-talker sin desplazar y pesos maestros en fp32). El conjunto de datos es `sw-voice/swamiji-navaratri-telugu-reuse-themes`, con 127 unidades y 1,83 horas de audio reutilizado.

La innovación destacable es la tokenización por carácter del telugu: 100 tokens añadidos (ids 151676-151775) que ocupan filas libres del embedding de texto y que se inicializaron como la media de los tokens de byte a los que sustituyen. Los ficheros del tokenizador incluidos en el repositorio permiten que `Qwen3TTSModel.from_pretrained` los cargue sin código adicional.

## Capacidades

- Síntesis de voz en telugu a partir de texto, con una voz personalizada fija identificada como `swamiji`.
- Generación de audio mediante el método `generate_custom_voice`, con parámetros de idioma (`language="Auto"`) y modo no streaming (`non_streaming_mode=True`).
- Tokenización carácter a carácter del telugu, que mejora la correspondencia entre grafemas y tokens de texto.
- Salida de audio en formato de onda con frecuencia de muestreo devuelta por la API (`wavs, sr`).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo exclusivamente TTS.
- No soporta visión, audio de entrada ni otros idiomas distintos del telugu según la model card.
- No se documentan modos de pensamiento ni capacidades multilingües.

## Casos de uso

- Investigación en tokenización de lenguas índicas: permite comparar el rendimiento de la tokenización por carácter frente a BPE a nivel de byte en telugu, usando los 100 tokens añadidos y la métrica de tokens por carácter (1,16 frente a 1,69).
- Generación de locuciones devocionales en telugu: el modelo está entrenado exclusivamente con temática de Navaratri, por lo que resulta adecuado para producir narraciones o cánticos con la voz `swamiji` en ese dominio concreto.
- Clonación y personalización de voz controlada: sirve como referencia para experimentos de ajuste fino de voces personalizadas sobre Qwen3-TTS con pocas horas de audio (1,83 h en este caso).
- Evaluación de recetas de entrenamiento TTS: la model card documenta hiperparámetros completos (LR, épocas, batch, pérdida combinada), lo que permite reproducir o comparar recetas de SFT.
- Pruebas de integración de la librería `qwen_tts`: el ejemplo de código permite validar el pipeline `Qwen3TTSModel.from_pretrained` con `device_map="cuda:0"` y `dtype=torch.bfloat16`.
- Docencia y demostraciones sobre TTS en lenguas de bajos recursos: útil para ilustrar el impacto del tokenizador en la calidad y eficiencia de la síntesis en telugu.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,92 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 3,8 GB, por lo que se requiere margen adicional para activaciones y el codec.
- GPU recomendadas: no disponible; el ejemplo oficial emplea `device_map="cuda:0"` sin especificar modelo de GPU.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más de VRAM en bf16, aunque este dato no está confirmado por el autor.
- Opciones de despliegue: la librería `qwen_tts` mediante `Qwen3TTSModel.from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| qwen3-tts-12hz-1.7b-swamiji-te-chartok-navaratri-only-lr1e-6-17ep | 1,92 B | no disponible | telugu | Apache 2.0 | Investigación, 0 descargas |
| sw-voice/qwen3-tts-12hz-1.7b-telugu-chartok-indictts-sft-lr1e-6-2ep (modelo base) | no disponible | no disponible | telugu | no disponible | Checkpoint previo del que deriva |
| Qwen3-TTS 1.7B (familia general) | ~1,7 B | no disponible | no disponible | no disponible | Modelo base de la familia |

No se dispone de datos de benchmarks ni de otros modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: la propia model card lo etiqueta como "research", con cero descargas y cero likes, sin validación externa conocida.
- Dominio muy restringido: entrenado solo con temática de Navaratri en telugu (127 clips, 1,83 h), por lo que la generalización fuera de ese dominio es incierta.
- Una única voz: solo soporta el hablante `swamiji`; no es un modelo multihablante.
- Un único idioma: únicamente telugu; no se documenta soporte para otros idiomas.
- Riesgo de alucinación acústica y artefactos: al ser un ajuste fino con pocos datos, puede producir pronunciaciones inestables o ruido en textos alejados del corpus.
- Sesgos: no se documentan análisis de sesgos de género, dialecto o prosodia; el corpus temático devocional puede sesgar el estilo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad y la naturaleza experimental desaconsejan su uso en producción sin validación previa.
- Sin datos de contexto máximo, cuantización ni latencia, lo que dificulta planificar despliegues.
- El modelo depende de la librería `qwen_tts` y de los ficheros de tokenizador incluidos en el repositorio; su uso fuera de ese ecosistema no está documentado.

## Enlaces

- HuggingFace: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-swamiji-te-chartok-navaratri-only-lr1e-6-17ep
- Modelo base: https://huggingface.co/sw-voice/qwen3-tts-12hz-1.7b-telugu-chartok-indictts-sft-lr1e-6-2ep
- Dataset citado en la model card: sw-voice/swamiji-navaratri-telugu-reuse-themes (no se proporciona URL directa)
- Código citado en la model card: repositorio `swamiji-tts`, ruta `research/exp-iterations/08-qwen3-tts/experiments/06-te-char-tokens` (no se proporciona URL directa)
- Fichero de tokens citado: `te_tokens.json` (incluido en el repositorio del modelo)
