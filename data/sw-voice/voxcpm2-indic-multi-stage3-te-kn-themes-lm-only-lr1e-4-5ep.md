# sw-voice/voxcpm2-indic-multi-stage3-te-kn-themes-lm-only-lr1e-4-5ep

## Resumen

voxcpm2-indic-multi-stage3-te-kn-themes-lm-only-lr1e-4-5ep es un modelo de síntesis de voz (text-to-speech) desarrollado por sw-voice, un ajuste fino completo del modelo base sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep. El modelo está especializado en la generación de voz en inglés, telugu (te) y kannada (kn), con un enfoque particular en la reproducción de timbres vocales específicos aprendidos durante el entrenamiento, sin necesidad de audio de referencia en tiempo de inferencia (reference-free). Con 2.290.004.544 parámetros y un tamaño de repositorio de 9.5 GB, se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo resuelve el problema de la síntesis de voz multilingüe con control de timbre en un contexto de investigación sobre lenguas indias. Es relevante porque combina el ajuste fino de un modelo TTS preentrenado con datos temáticos específicos (temas de Navaratri en telugu y kannada), congelando componentes clave como LocDiT, el LM residual y LocEnc para preservar el timbre aprendido en la etapa anterior. Esto permite generar voz con una identidad tímbrica concreta sin depender de muestras de referencia en producción.

La arquitectura subyacente es un transformer con componentes especializados (LocDiT, LM residual, LocEnc) del ecosistema VoxCPM, aunque la información disponible no detalla la arquitectura completa. El modelo se entrenó durante 5 épocas con 315 pasos totales, una tasa de aprendizaje de 0.0001 con decaimiento coseno y warmup de 48 pasos, sobre un conjunto de datos de 127 y 124 unidades temáticas completas en telugu y kannada respectivamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con componentes LocDiT, LM residual y LocEnc (VoxCPM) |
| Parámetros totales | 2.290.004.544 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en), telugu (te), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VoxCPM, que combina un modelo de lenguaje base con componentes especializados para la síntesis de voz: LocDiT (probablemente un módulo de difusión local para la generación de características acústicas), un LM residual y LocEnc (codificador local). Durante el ajuste fino, se congelaron LocDiT, el LM residual y LocEnc, mientras que el LM base y las proyecciones se entrenaron con todos los parámetros. Esta estrategia permite preservar el timbre aprendido en la etapa 2 (modelo base) mientras se adapta el modelo a los nuevos datos temáticos en telugu y kannada.

El entrenamiento se realizó con el entrenador oficial de VoxCPM durante 5 épocas, lo que supone 315 pasos totales con un micro-batch de 1 y acumulación de gradiente de 4 (batch efectivo de 4). Se utilizó una tasa de aprendizaje de 0.0001 con decaimiento coseno, warmup de 48 pasos y recorte de gradiente de 1.0. Los datos de entrenamiento provienen de los conjuntos sw-voice/swamiji-navaratri-telugu-sidon-themes y sw-voice/swamiji-navaratri-kannada-sidon-themes, con 127 y 124 unidades temáticas completas respectivamente. El modelo es reference-free: la identidad vocal está codificada en los pesos, por lo que no requiere audio de referencia en inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada.
- Generación de voz con timbre específico aprendido durante el entrenamiento, sin necesidad de audio de referencia (reference-free).
- Reproducción de características vocales asociadas a los datos temáticos de Navaratri en telugu y kannada.
- Capacidad multilingüe limitada a los tres idiomas indicados (en, te, kn).
- No se dispone de información sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso, ya que es un modelo TTS.
- No se dispone de información sobre modos especiales como thinking mode, visión o audio de entrada.

## Casos de uso

- Síntesis de voz para contenido religioso o cultural: el modelo puede generar narraciones o cánticos en telugu y kannada con el timbre específico de los temas de Navaratri, adecuado para aplicaciones de devoción o educación cultural.
- Generación de audiolibros en telugu y kannada: permite convertir texto en voz con una identidad tímbrica consistente, sin necesidad de muestras de referencia, lo que simplifica la producción a escala.
- Asistentes de voz multilingües para comunidades indias: el modelo puede integrarse en sistemas de atención al cliente o asistentes virtuales que requieran respuestas habladas en inglés, telugu o kannada con una voz concreta.
- Doblaje y localización de contenido: útil para adaptar vídeos o presentaciones a telugu o kannada manteniendo una voz consistente en todos los segmentos.
- Investigación en síntesis de voz: sirve como base para experimentos de adaptación de timbre y evaluación de técnicas de congelación de componentes en modelos TTS multilingües.
- Aplicaciones de accesibilidad: generación de voz para lectores de pantalla o sistemas de comunicación aumentativa en los idiomas soportados, con una voz estable y sin dependencia de referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 2.29 mil millones de parámetros, una estimación orientativa en FP16 sería de aproximadamente 4.6 GB solo para los pesos, más overhead de activaciones y buffers; en cuantización de 8 bits podría reducirse a unos 2.3 GB, pero no se confirman formatos de cuantización soportados.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) en FP16, y en GPUs profesionales como A100 o H100 para despliegues de mayor throughput.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs con 8 GB o más de VRAM, aunque no se dispone de confirmación oficial.
- Opciones de despliegue: no se especifican en la información disponible. Al ser un modelo TTS basado en VoxCPM, es probable que requiera el código del ecosistema VoxCPM (repo swamiji-tts, research/multi-stages), pero no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoría (TTS multilingüe con timbre específico) en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente con datos temáticos de Navaratri en telugu y kannada, por lo que su calidad fuera de ese dominio temático o de esos idiomas puede degradarse.
- Es un modelo de investigación (marcado como "research" en la model card), no un producto listo para producción; puede requerir validación adicional antes de su uso comercial.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias de los datos de entrenamiento (swamiji-navaratri-telugu-sidon-themes y kannada-sidon-themes), que no se detallan.
- Riesgo de alucinación no aplica directamente a TTS, pero puede haber artefactos o pronunciaciones incorrectas en palabras fuera del vocabulario de entrenamiento.
- No se dispone de información sobre sesgos de género, acento o calidad en hablantes de otras variedades dialectales del telugu o kannada.
- La longitud de contexto no está documentada, lo que limita la planificación de entradas de texto largas.
- El modelo es reference-free, lo que implica que el timbre está fijado en los pesos; no se puede cambiar la voz sin reentrenar o ajustar.
- No se confirman formatos de cuantización ni herramientas de despliegue estándar, lo que puede dificultar la integración en pipelines existentes.

## Enlaces

- HuggingFace: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage3-te-kn-themes-lm-only-lr1e-4-5ep
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep
- Dataset telugu: sw-voice/swamiji-navaratri-telugu-sidon-themes (referenciado en la model card, sin URL directa disponible)
- Dataset kannada: sw-voice/swamiji-navaratri-kannada-sidon-themes (referenciado en la model card, sin URL directa disponible)
- Código: swamiji-tts, directorio research/multi-stages (referenciado en la model card, sin URL directa disponible)
