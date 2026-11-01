# Vpedux-Vardan/bhojpuri-f5-tts-v2

## Resumen

Bhojpuri F5-TTS v2 es un modelo de síntesis de voz (text-to-speech) especializado en bhojpuri, una lengua indoaria hablada principalmente en Bihar (India) y en la región del Terai nepalí. Lo desarrolla el usuario Vpedux-Vardan y se publica bajo licencia Apache 2.0. El modelo parte de la arquitectura F5-TTS, basada en un Diffusion Transformer (DiT) con flow matching, y se ha recalibrado para generar habla bhojpuri natural con un vocabulario completo en devanagari.

El modelo resuelve un problema concreto: la mayoría de sistemas TTS multilingües no cubren lenguas de bajos recursos como el bhojpuri, y los que lo intentan suelen producir pronunciaciones incorrectas por falta de cobertura del silabario devanagari (ligaduras, halants, nuktas y signos de puntuación). Aquí se define un vocabulario de 2.545 tokens con mapeo carácter a carácter, lo que elimina los fallbacks OOV durante la tokenización.

Con aproximadamente 384 millones de parámetros, 22 bloques DiT, dimensión oculta de 1024 y salida de audio a 24 kHz mono, el modelo está pensado para generación de voz con clonación zero-shot a partir de prompts de 4 a 8 segundos. Es relevante ahora porque demuestra que es viable adaptar arquitecturas TTS modernas a lenguas de bajos recursos con licencia permisiva y un pipeline de inferencia reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow Matching Diffusion Transformer (DiT) con acondicionamiento de texto ConvNeXtV2 |
| Parametros totales | ~384 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionado por la longitud del texto de entrada y del audio de referencia; el autor recomienda prompts de 4-8 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bhojpuri (bho) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`) junto con `vocab.txt` y un WAV de referencia |
| Dimension oculta | 1024 |
| Profundidad | 22 bloques DiT |
| Cabezas de atencion | 16 |
| Embedding posicional | Rotary Positional Embedding (RoPE, `pe_attn_head=1`) |
| Text encoder | ConvNeXtV2 (dim=512, 4 capas convolucionales) |
| Tamano de vocabulario | 2.545 tokens (conjunto completo de caracteres devanagari) |
| Frecuencia de muestreo | 24.000 Hz, PCM mono 16 bits |
| Mel spectrogram | 100 canales, FFT=1024, hop=256, win=1024 |
| Vocoder neuronal | Vocos (`charactr/vocos-mel-24khz`) |
| Tamano del repositorio | 2,7 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura F5-TTS: un Conditional Flow Matching (CFM) que aprende un campo de velocidad entre una distribución de ruido y la distribución de mel-espectrogramas mediante transporte óptimo y flujos normalizantes continuos. El backbone es un Diffusion Transformer de 22 bloques con dimensión 1024, 16 cabezas de atención, RoPE como codificación posicional y `ff_mult=2`. El texto se codifica con un ConvNeXtV2 de 4 capas convolucionales y dimensión 512, y la decodificación del mel-espectrograma a forma de onda se realiza con el vocoder Vocos de 24 kHz.

Un detalle técnico relevante es la desactivación del padding de máscara de texto (`text_mask_padding=False`) y el uso de `pe_attn_head=1`, coherentes con la variante v0 del flujo de matching. Además, el autor parchea `convert_char_to_pinyin` para forzar un mapeo 1:1 de caracteres devanagari, evitando la romanización automática que F5-TTS aplica por defecto a textos no latinos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de voz bhojpuri con calidad de estudio a 24 kHz mono.
- Clonación de voz zero-shot a partir de prompts de audio de 4 a 8 segundos, transfiriendo ritmo, tono y timbre.
- Cobertura completa del silabario devanagari: ligaduras, halants, nuktas y puntuación, sin fallbacks OOV.
- Modelado de rasgos fonéticos específicos del bhojpuri: duración vocálica, oclusivas aspiradas y partículas gramaticales (बा, बाड़न, हउवे).
- Tono masculino nativo y cadencia regional calibrada.
- Control de la generación mediante `nfe_step` (pasos del solver ODE) y `cfg_strength` (fuerza de classifier-free guidance).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá del prompt de referencia.

## Casos de uso

- **Locución de contenido educativo en bhojpuri**: el modelo puede narrar materiales didácticos o cursos en bhojpuri con pronunciación nativa, algo que los TTS multilingües genéricos no cubren con precisión.
- **Doblaje y subtitulado accesible**: conversión de guiones escritos en devanagari a audio para vídeos divulgativos, con clonación de la voz del presentador a partir de un clip corto de referencia.
- **Avisos y servicios públicos en zonas bhojpuri-parlantes**: generación de mensajes de salud, agricultura o administración en la lengua local, con audio a 24 kHz adecuado para difusión por radio o altavoces.
- **Audiolibros y preservación oral**: síntesis de textos literarios o históricos en bhojpuri, manteniendo la cadencia regional y las partículas gramaticales propias.
- **Prototipado de asistentes de voz regionales**: integración en pipelines de IVR o asistentes conversacionales que necesiten una capa TTS específica para bhojpuri, con clonación de una voz corporativa concreta.
- **Investigación en TTS de bajos recursos**: base reproducible para experimentos de adaptación de F5-TTS a otras lenguas indoarias, con vocabulario devanagari completo y script de inferencia autocontenido.
- **Generación de datasets sintéticos de voz**: creación de corpus de audio bhojpuri para entrenar reconocedores de voz u otros modelos, usando distintas voces de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~384 M de parámetros en precisión completa (fp32) el peso ronda 1,5 GB, y en fp16 aproximadamente 0,8 GB, a lo que hay que sumar el vocoder Vocos y los buffers de activación.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder ejecutar el modelo en fp16, incluyendo RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas consumer modernas con suficiente VRAM; el autor no publica una tabla de requisitos.
- Opciones de despliegue: el autor proporciona un script Python autocontenido basado en la librería `f5-tts`, con `vocos`, `soundfile` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles. El autor recomienda `nfe_step=32` y `cfg_strength=2.0`, parámetros que influyen directamente en el tiempo de generación.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Contexto/prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bhojpuri F5-TTS v2 | TTS flow matching (DiT) | ~384 M | bhojpuri | prompt de 4-8 s | Apache 2.0 | HuggingFace |
| F5-TTS (original) | TTS flow matching (DiT) | ~336 M (variante base) | multilingüe (en, zh, etc.) | prompt corto | MIT / CC-BY-NC segun variante | HuggingFace, GitHub |
| XTTS-v2 (Coqui) | TTS autoregresivo | ~467 M | 17 idiomas (sin bhojpuri) | prompt de 6 s | Coqui Public Model License (no comercial) | HuggingFace |
| IndicTTS / sistemas Indic | TTS especificos para lenguas indias | variable | varias lenguas indias | variable | variable | repositorios academicos |

La comparación directa con alternativas es limitada porque no se han publicado métricas objetivas (MOS, WER, similitud de hablante) para este modelo. Frente a F5-TTS original, la diferencia principal es la especialización en bhojpuri y el vocabulario devanagari ampliado; frente a XTTS-v2, la ventaja es la licencia Apache 2.0 y la cobertura del bhojpuri, ausente en XTTS.

## Limitaciones y advertencias

- El modelo solo soporta bhojpuri; no se ha validado para otras lenguas indoarias ni para hindi estándar.
- No se han publicado evaluaciones subjetivas (MOS) ni objetivas (WER, similitud de hablante), por lo que la calidad real en producción no está cuantificada.
- El repositorio tiene muy poca tracción (16 descargas, 0 likes) y fue creado recientemente; no hay evidencia de uso en producción ni de validación por terceros.
- La inferencia requiere parchear funciones internas de la librería `f5-tts` (`convert_char_to_pinyin`) para forzar el mapeo 1:1 de caracteres devanagari; esto puede romperse con actualizaciones de la librería.
- El texto de referencia debe coincidir exactamente con el audio de referencia; el autor subraya esta dependencia, lo que limita la clonación a prompts con transcripción fiable.
- Riesgo de alucinación acústica y artefactos en textos largos o con caracteres fuera del vocabulario de 2.545 tokens.
- No se documentan sesgos de género o dialectales más allá de la calibración declarada hacia un tono masculino nativo; la cobertura de variedades dialectales del bhojpuri no está especificada.
- La licencia Apache 2.0 permite uso comercial, pero el vocoder Vocos y la librería F5-TTS tienen sus propias licencias que conviene verificar por separado.
- El campo `inference: false` en la model card indica que el modelo no está configurado para inferencia automática en el Hub; hay que ejecutar el script manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vpedux-Vardan/bhojpuri-f5-tts-v2
- Repositorio F5-TTS (arquitectura base): https://github.com/SWivid/F5-TTS
- Vocoder Vocos: https://huggingface.co/charactr/vocos-mel-24khz
- Librería f5-tts en PyPI: https://pypi.org/project/f5-tts/
