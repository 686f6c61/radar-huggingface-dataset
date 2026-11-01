# sw-voice/voxcpm2-indic-multi-stage3-te20h-themes-lr5e-5-2ep

## Resumen

voxcpm2-indic-multi-stage3-te20h-themes-lr5e-5-2ep es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, resultado de un ajuste fino completo (full fine-tune) del modelo sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep. Está orientado a la generación de voz en inglés, telugu y kannada, y se distribuye con licencia Apache 2.0. El modelo cuenta con aproximadamente 2.290 millones de parámetros (2,29 B) en formato safetensors y un repositorio de 9,5 GB.

El modelo se entrena sobre un corpus específico de temática religiosa en telugu: 1.070 unidades temáticas completas extraídas de grabaciones de temática Bhagavatam y Mahabharatam, con un total de 20,0 horas de audio seleccionado mediante DNSMOS y con 499 unidades restauradas mediante el sistema Sidon. La model card indica explícitamente que se trata de un modelo de investigación y que la voz queda codificada en los pesos ("reference-free"), es decir, no requiere una muestra de referencia en inferencia.

Su relevancia radica en que ejemplifica el ajuste fino de un TTS multilingüe sobre dominios muy específicos (discurso religioso en telugu) con un pipeline reproducible mediante el entrenador oficial de VoxCPM. No obstante, se trata de un artefacto de investigación con muy poca tracción (22 descargas, 0 likes) y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS basado en VoxCPM; detalles de arquitectura no especificados en la información proporcionada) |
| Parametros totales | 2.290.004.544 |
| Parametros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés), te (telugu), kn (kannada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base VoxCPM (si es un transformer autorregresivo, un modelo de difusión para mel-espectrogramas, un modelo híbrido o un sistema con codec neuronal). Lo que sí se documenta es el proceso de ajuste fino: se partió del checkpoint sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep y se entrenaron todos los parámetros con el entrenador oficial de VoxCPM, en el marco del repositorio de código swamiji-tts, rama `research/multi-stages`.

El entrenamiento utilizó micro-batch de 1 con acumulación de gradiente de 16, durante 2 épocas, lo que resultó en 134 pasos de optimización. Se empleó una tasa de aprendizaje de 5e-05 con scheduler coseno y 21 pasos de warmup, con recorte de gradiente de 1,0. Los datos de entrenamiento consisten en 1.070 unidades temáticas completas en telugu (20,0 horas) procedentes del dataset sw-voice/swamiji-telugu-bhagavatam-mahabharatam-themes-20h, filtradas por DNSMOS y con 499 unidades restauradas mediante Sidon. No se documenta el uso de RLHF ni DPO; el ajuste es supervisado sobre pares texto-audio.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada.
- Generación de voz sin referencia externa: la identidad vocal está incorporada en los pesos del modelo, por lo que no se necesita audio de referencia en inferencia.
- Especialización en el dominio de discurso religioso en telugu (Bhagavatam y Mahabharatam), lo que puede trasladarse a registros formales o narrativos similares.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta razonamiento multi-paso, visión, audio de entrada ni modo "thinking".
- Capacidades multilingües limitadas a los tres idiomas declarados (en, te, kn); no se especifica el grado de competencia en cada uno.

## Casos de uso

- Narración de textos religiosos en telugu: el modelo se ha ajustado específicamente sobre 20 horas de discurso Bhagavatam y Mahabharatam, por lo que es adecuado para locutar pasajes de estas obras con un estilo próximo al corpus de entrenamiento.
- Generación de audiolibros en telugu: permite convertir texto litúrgico o narrativo en audio sin necesidad de una muestra de voz de referencia, simplificando el pipeline de producción.
- Prototipado de asistentes de voz en inglés y kannada: al soportar estos idiomas, puede emplearse para validar interfaces conversacionales antes de invertir en un modelo comercial.
- Investigación en clonación y personalización de voz: al ser un full fine-tune con la voz embebida en los pesos, sirve como caso de estudio para analizar cómo el ajuste fino desplaza la identidad vocal del modelo base.
- Evaluación comparativa de pipelines TTS: su reproducibilidad (entrenador oficial VoxCPM, hiperparámetros documentados) lo hace útil como baseline en experimentos de ajuste fino sobre dominios de nicho.
- Generación de material accesible: conversión de textos en telugu a audio para personas con discapacidad visual, siempre que el contenido encaje en el dominio entrenado.
- No se recomienda para aplicaciones de producción multiusuario sin una evaluación previa de calidad, latencia y cobertura lingüística, dado su carácter de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,29 B parámetros en safetensors, los pesos en precisión completa (fp32) ocuparían aproximadamente 9,2 GB; en fp16/bf16, unos 4,6 GB; en cuantización de 8 bits, alrededor de 2,3 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3090 o RTX 4090 en fp16, y en GPUs profesionales A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: probablemente sí en RTX 3090/4090 (24 GB) en fp16; en tarjetas de 8-12 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: no se especifican en la model card. Al ser un modelo TTS basado en VoxCPM, el despliegue dependería del código del proyecto swamiji-tts (`research/multi-stages`); no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (TTS multilingüe de tamaño similar), por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo marcado explícitamente como de investigación ("research") por el autor; no está validado para producción.
- Dominio de entrenamiento muy restringido (discurso religioso en telugu), lo que puede provocar un estilo prosódico poco natural fuera de ese registro.
- Riesgo de alucinación acústica: como todo modelo generativo de voz, puede producir artefactos, pronunciaciones incorrectas o audio ininteligible en textos fuera de distribución.
- Cobertura lingüística limitada a inglés, telugu y kannada; no se documenta el nivel de calidad en cada uno ni el comportamiento en code-switching.
- No se documentan sesgos demográficos, de género o de acento; el corpus de entrenamiento (un único hablante o conjunto de hablantes religiosos) puede sesgar la voz generada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las obligaciones de atribución y las condiciones del modelo base.
- Sin benchmarks ni métricas objetivas (MOS, WER, DNSMOS de salida) publicadas, por lo que la calidad real es desconocida.
- El repositorio es de 9,5 GB, lo que implica costes de almacenamiento y descarga considerables para experimentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage3-te20h-themes-lr5e-5-2ep
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep
- Dataset de entrenamiento: sw-voice/swamiji-telugu-bhagavatam-mahabharatam-themes-20h (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Código: repositorio swamiji-tts, rama `research/multi-stages` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Paper, blog o demo: no disponible en la información proporcionada.
