# ViuAI/TTS_10M

## Resumen

ViuAI/TTS_10M es un motor de síntesis de voz (text-to-speech) ultraligero de aproximadamente 10,5 millones de parámetros, desarrollado por ViuAI y publicado en Hugging Face. El modelo combina tres componentes técnicos: un codificador de texto basado en transformer con embeddings RoPE, un campo vectorial de flow matching condicional con transporte óptimo (OT-CFM) y un vocoder neuronal Vocos a 24 kHz. El objetivo declarado es ofrecer síntesis de voz de calidad en dispositivos de borde (edge), con latencia inferior a 60 ms y ejecución viable en CPU convencional.

La propuesta del autor se centra en resolver problemas típicos de los modelos TTS de ~100M parámetros, como el colapso de modo de las GAN, la necesidad de miles de horas de audio o los fallos de alineación que provocan repeticiones y saltos de palabras. El modelo está pensado para entrenamiento con pocos datos (2-5 horas de un único hablante) y para inferencia rápida mediante 4 a 8 pasos de resolución de la EDO de flow matching.

La información disponible es limitada: no se publican resultados de benchmarks, no se especifica la licencia, no se detallan los idiomas soportados más allá de menciones a hindi e inglés en la documentación, y el repositorio no incluye pesos descargables verificables en el momento de redactar esta ficha. La model card está redactada parcialmente en hinglish (mezcla de hindi e inglés), lo que dificulta la extracción de especificaciones definitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con RoPE (codificador de texto) + ConvNeXt-V2 1D (campo vectorial OT-CFM) + Vocos 24 kHz (vocoder) |
| Parametros totales | ~10.589.425 (~10,5M): 8.089.425 acústicos + ~2.500.000 del vocoder |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor menciona pesos en safetensors, sin detallar cuantizaciones) |
| Idiomas soportados | No disponible oficialmente; la documentación menciona tokenizador multilingüe con soporte para hindi e inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors (según el script `checkpoint.py` y `export_hf.py`) |

## Arquitectura y entrenamiento

El sistema se descompone en cuatro módulos acústicos más un vocoder. El codificador de texto es un transformer moderno con embeddings rotatorios (RoPE) de 2,70M de parámetros. El predictor de duración (0,40M) incorpora búsqueda de alineación monótona (MAS), que fuerza una correspondencia estrictamente monótona entre texto y audio para evitar repeticiones y saltos. La proyección de alineación aporta 0,02M. El campo vectorial de OT-CFM, con 4,97M de parámetros, se implementa sobre bloques ConvNeXt-V2 1D con capas GRN (Global Response Normalization) y resuelve la EDO de flow matching en 4 a 10 pasos. El vocoder Vocos a 24 kHz añade ~2,5M de parámetros y sintetiza la forma de onda final a partir de espectrogramas mel.

El entrenamiento emplea flow matching condicional con transporte óptimo en lugar de un discriminador adversarial, lo que según el autor elimina el colapso de modo y estabiliza la regresión. El pipeline incluye AdamW, precisión mixta automática (AMP) y un módulo `AudioSanityGuardian` que detecta pitidos robóticos y valores NaN en cada paso. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo TTS de este tipo). El autor afirma que el tamaño de 10M está "matemáticamente equilibrado" para 2-5 horas de audio de un solo hablante sin sobreajuste, pero no se aportan métricas que respalden esta afirmación.

## Capacidades

- Síntesis de voz a partir de texto con salida de audio a 24 kHz.
- Alineación texto-audio monótona mediante MAS, orientada a evitar repeticiones y omisiones de palabras.
- Generación rápida con 4 a 8 pasos de ODE, con latencia declarada inferior a 60 ms.
- Ejecución en CPU, sin requerir GPU para inferencia.
- Tokenizador multilingüe con soporte declarado para hindi e inglés (no se detallan otros idiomas).
- Entrenamiento con pocos datos: el autor indica que 2-5 horas de audio de un solo hablante son suficientes.
- Interfaz Gradio incluida (`app.py`) para demostración interactiva y despliegue en Hugging Face Spaces.
- Scripts de entrenamiento, inferencia y exportación a Hugging Face Hub incluidos en el repositorio.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; estas capacidades no aplican a un motor TTS.

## Casos de uso

- Asistentes de voz en dispositivos de borde: el modelo puede ejecutarse en CPU con latencia inferior a 60 ms, lo que lo hace adecuado para altavoces inteligentes, wearables o sistemas embebidos con recursos limitados.
- Lectura de notificaciones y accesibilidad: integración en aplicaciones de lectura de pantalla para convertir texto en voz en tiempo real sin depender de servicios en la nube.
- Clonación de voz de un solo hablante con pocos datos: con 2-5 horas de audio, un equipo puede entrenar una voz corporativa o personalizada para un asistente interno.
- Sistemas de navegación y avisos por voz: generación de instrucciones cortas y repetitivas con baja latencia en entornos de automoción o robótica.
- Prótesis y ayudas a la comunicación: síntesis de voz para personas con dificultades del habla, entrenando el modelo con muestras del usuario.
- Prototipado rápido de productos de voz: gracias a los scripts de entrenamiento e inferencia incluidos, un equipo puede validar una idea de producto TTS en horas en lugar de semanas.
- Generación de audiolibros o pódcast con un único narrador: el modelo está optimizado para un solo hablante y audio de 24 kHz, lo que encaja con narraciones monologadas.
- Investigación en TTS ligero: sirve como referencia reproducible de una arquitectura OT-CFM + ConvNeXt-V2 + Vocos para estudiar flow matching en modelos de menos de 11M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona latencia inferior a 60 ms y calidad "studio" a 24 kHz, pero no aporta métricas objetivas como MOS, MCD, WER de transcripción inversa ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo completo (~10,5M parámetros, aproximadamente 42 MB en FP32 y ~21 MB en FP16), más el overhead de activaciones y del vocoder.
- GPU recomendadas: no se especifican; el autor enfatiza la ejecución en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es sobradamente suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también en CPU convencional.
- Opciones de despliegue: scripts propios (`infer.py`), interfaz Gradio (`app.py`) y despliegue en Hugging Face Spaces. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: el autor declara menos de 60 ms por inferencia con 4-8 pasos de ODE en CPU; no se aportan cifras de RTF ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocoder | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViuAI/TTS_10M | ~10,5M | No disponible | Vocos 24 kHz | No disponible | Hugging Face (sin pesos verificados) |
| Piper TTS (rhasspy) | ~5-20M según voz | No aplica | VITS | MIT | Hugging Face, GitHub, ampliamente desplegado |
| Coqui TTS (XTTS v2) | ~470M | No aplica | HiFi-GAN | Coqui Public Model License (no comercial) | Hugging Face, GitHub |
| Kokoro TTS | ~82M | No aplica | ISTFTNet/StyleTTS2 | Apache 2.0 | Hugging Face, GitHub |

La comparativa se basa en características públicas de modelos TTS ligeros; no se dispone de datos de rendimiento del modelo ViuAI/TTS_10M para establecer comparaciones cuantitativas. Piper TTS es la alternativa más directa por tamaño y enfoque en dispositivos de borde; Kokoro ofrece mayor calidad declarada con más parámetros; XTTS v2 prioriza clonación de voz multilingüe a costa de tamaño y licencia restrictiva.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que no se puede confirmar el uso comercial ni las restricciones de redistribución.
- No hay pesos publicados verificables en el repositorio en el momento de redactar esta ficha; las descargas y likes son cero.
- No se han publicado benchmarks objetivos (MOS, MCD, WER) que respalden las afirmaciones de calidad y latencia del autor.
- El modelo está diseñado para un solo hablante; no se documenta soporte multi-hablante ni clonación zero-shot.
- El soporte de idiomas es ambiguo: la documentación menciona hindi e inglés, pero no se detalla la cobertura real ni la calidad por idioma.
- Riesgo de alucinación acústica y artefactos en textos largos o con puntuación atípica; el módulo `AudioSanityGuardian` mitiga pitidos y NaN, pero no garantiza prosodia natural.
- La model card está redactada parcialmente en hinglish, lo que puede dificultar la reproducibilidad y la interpretación de instrucciones.
- No se documenta el proceso de entrenamiento con datos reales (número de horas, composición, procedencia), lo que impide evaluar sesgos de hablante, acento o género.
- La latencia declarada (<60 ms) corresponde a inferencia en CPU según el autor, pero no se especifica el hardware exacto ni el tamaño del texto de entrada.
- Al ser un modelo de 10M parámetros, la expresividad prosódica y la naturalidad estarán por debajo de modelos de 100M+ en escenarios complejos (emociones, énfasis, diálogo).

## Enlaces

- Hugging Face: https://huggingface.co/ViuAI/TTS_10M
- Repositorio del proyecto: no disponible como enlace independiente (la estructura se describe en la model card)
- Paper: no disponible
- Blog del autor: no disponible
- Demo (Gradio / HF Spaces): no disponible como URL pública
- Dataset asociado mencionado en la documentación: `ViuAI/ViuAI_TTS_Dataset` (no verificado)
