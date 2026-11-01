# sw-voice/voxcpm2-indic-multi-stage4-te20h-navaratri-te-lr5e-5-3ep

## Resumen

voxcpm2-indic-multi-stage4-te20h-navaratri-te-lr5e-5-3ep es un modelo de síntesis de voz (text-to-speech) publicado por el usuario sw-voice en HuggingFace. Se trata de un ajuste fino completo (full fine-tune) del modelo sw-voice/voxcpm2-indic-multi-stage3-te20h-themes-lr5e-5-2ep, realizado con el entrenador oficial de VoxCPM sobre un corpus específico de temática Navaratri en telugu. El modelo forma parte de una cadena de ajustes sucesivos orientada a voces indic, y su nombre codifica la etapa (stage4), el volumen de datos previo (20 h de temas en telugu), el idioma objetivo (te), la tasa de aprendizaje (5e-5) y el número de épocas (3).

El modelo tiene 2.290.004.544 parámetros (aproximadamente 2,29 mil millones), un tamaño de repositorio de 9,5 GB en formato safetensors y una licencia Apache 2.0. Está etiquetado para los idiomas inglés (en), telugu (te) y kannada (kn), y su pipeline es text-to-speech. La model card lo marca explícitamente como "research", lo que indica que es un artefacto experimental más que un producto listo para producción.

Su relevancia radica en que documenta una receta reproducible de ajuste fino de TTS para lenguas indic de bajos recursos, con detalles concretos de hiperparámetros (micro-batch 1, acumulación 8, 48 pasos totales, LR coseno 5e-5, warmup 8, grad clip 1.0) y un enfoque "reference-free" en el que la identidad de voz queda embebida en los pesos del modelo, sin necesidad de audio de referencia en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS basado en VoxCPM; detalles de arquitectura no especificados en la informacion) |
| Parametros totales | 2.290.004.544 (~2,29 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, te, kn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Tamano del repositorio | 9,5 GB |
| Modelo base | sw-voice/voxcpm2-indic-multi-stage3-te20h-themes-lr5e-5-2ep |
| Etapa de entrenamiento | stage4 (fine-tune completo) |
| Dataset de ajuste | sw-voice/swamiji-navaratri-telugu-sidon-themes (127 unidades tematicas Navaratri en telugu) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, codec de audio o decoder vocacional). Lo que sí se especifica es el procedimiento de entrenamiento: un full fine-tune del checkpoint de la etapa 3 realizado con el entrenador oficial de VoxCPM, en el que se entrenaron todos los parámetros del modelo. La configuración reportada es micro-batch 1 con acumulación de gradiente 8, 3 épocas que equivalen a 48 pasos de optimización, tasa de aprendizaje 5e-05 con scheduler coseno, 8 pasos de warmup y recorte de gradiente de 1.0.

Los datos de ajuste corresponden al dataset sw-voice/swamiji-navaratri-telugu-sidon-themes, compuesto por 127 unidades temáticas completas de Navaratri en telugu, aplicadas tras una etapa previa de 20 horas de temas en telugu. El modelo es "reference-free": la identidad de voz queda codificada en los pesos, de modo que en inferencia no se requiere un audio de referencia para clonar la voz. El código asociado se encuentra en el repositorio swamiji-tts, bajo el directorio `research/multi-stages`. No se indica en la informacion si hubo RLHF, DPO ni otras fases de alineación.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés, telugu y kannada.
- Generación de voz con identidad embebida en los pesos (reference-free), sin necesidad de audio de referencia en inferencia.
- Ajuste específico sobre material temático Navaratri en telugu, lo que orienta el estilo y la prosodia hacia ese dominio.
- Capacidad multilingüe limitada a los tres idiomas declarados (en, te, kn).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking".

## Casos de uso

- Investigación en TTS para lenguas indic: el modelo sirve como punto de partida reproducible para estudiar el efecto de ajustes sucesivos sobre un checkpoint base, gracias a la documentación explícita de hiperparámetros y dataset.
- Síntesis de recitaciones devocionales en telugu: el ajuste sobre 127 unidades temáticas Navaratri lo hace adecuado para generar locuciones de ese dominio concreto, con prosodia alineada al material de entrenamiento.
- Generación de audiolibros o material litúrgico: al ser reference-free, permite producir narraciones con una identidad de voz fija sin gestionar clips de referencia en cada petición.
- Prototipado de asistentes de voz multilingües: cubre inglés, telugu y kannada, lo que permite evaluar un mismo pipeline TTS en tres idiomas del sur de la India y en inglés.
- Evaluación comparativa de etapas de fine-tune: al existir checkpoints previos (stage3), permite medir el impacto de la etapa 4 sobre la calidad y la estabilidad de la voz.
- Experimentación académica sobre bajos recursos: el corpus de ajuste es pequeño (127 unidades), lo que lo convierte en un caso de estudio útil sobre sobreajuste y retención de idioma en TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion. Como referencia orientativa, un modelo de ~2,29 mil millones de parámetros en precisión completa (fp32) ocuparía del orden de 9,2 GB solo en pesos, coherente con el tamaño del repositorio (9,5 GB); en fp16/bf16 se reduciría aproximadamente a la mitad y en cuantizaciones de 8 o 4 bits, aún más. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo con suficiente memoria (por ejemplo, RTX 3090 o RTX 4090 en fp16), aunque no se confirma compatibilidad ni rendimiento.
- Opciones de despliegue: no se documentan en la informacion (no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos de lenguaje y no necesariamente a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables de la misma categoría (TTS indic). La comparación se limita a los checkpoints de la propia cadena de ajuste:

| Modelo | Parametros | Idiomas | Licencia | Relacion |
|---|---|---|---|---|
| voxcpm2-indic-multi-stage4-te20h-navaratri-te-lr5e-5-3ep | ~2,29 B | en, te, kn | apache-2.0 | Este modelo (etapa 4) |
| voxcpm2-indic-multi-stage3-te20h-themes-lr5e-5-2ep | no disponible | no disponible | no disponible | Modelo base directo (etapa 3, 20 h de temas en telugu) |

No se dispone de alternativas externas con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado como "research" por el autor: no está validado para uso en producción.
- Riesgo de sobreajuste al dominio: el ajuste se realizó sobre un corpus muy específico (127 unidades temáticas Navaratri en telugu) con solo 48 pasos, lo que puede degradar la generalización fuera de ese dominio.
- Cobertura lingüística limitada: aunque declara en, te y kn, el ajuste se centró en telugu; el rendimiento en inglés y kannada no está documentado.
- Posibles sesgos derivados del corpus de entrenamiento (contenido devocional y una única fuente de voz), no evaluados por el autor.
- No se documentan evaluaciones de calidad, inteligibilidad ni naturalidad (MOS u otras métricas), por lo que no hay garantías cuantitativas de rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigación sin validación, se recomienda precaución y auditoría propia antes de desplegarlo.
- No se especifican requisitos de hardware, latencia ni compatibilidad con frameworks de inferencia concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage4-te20h-navaratri-te-lr5e-5-3ep
- Modelo base (etapa 3): https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage3-te20h-themes-lr5e-5-2ep
- Dataset de ajuste: sw-voice/swamiji-navaratri-telugu-sidon-themes (referenciado en la model card; no se proporciona URL directa en la informacion)
- Código: repositorio swamiji-tts, directorio `research/multi-stages` (referenciado en la model card; no se proporciona URL directa en la informacion)
