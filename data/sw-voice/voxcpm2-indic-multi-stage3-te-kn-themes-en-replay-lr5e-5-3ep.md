# sw-voice/voxcpm2-indic-multi-stage3-te-kn-themes-en-replay-lr5e-5-3ep

## Resumen

voxcpm2-indic-multi-stage3-te-kn-themes-en-replay-lr5e-5-3ep es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, resultado de un ajuste fino completo (full fine-tune) del modelo base sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep mediante el entrenador oficial de VoxCPM. El modelo está orientado a la generación de voz en tres idiomas: inglés (en), telugu (te) y canarés (kn), con un enfoque claro en contenido temático de tradición devocional india (temas de Navaratri y clips de Swamiji).

Con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) y un repositorio de 9,5 GB en formato safetensors, se trata de un modelo de tamaño medio diseñado para inferencia TTS de calidad. La relevancia actual radica en su carácter multilingüe para lenguas indias de bajos recursos (telugu y canarés) combinado con inglés, un caso poco frecuente en el ecosistema open source, y en su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales.

El modelo se publica como investigación (marcado explícitamente como "research" en la model card) y no cuenta con métricas de benchmarks publicadas. Su interés principal es práctico: demuestra un pipeline de ajuste fino multietapa sobre un modelo TTS base con datos paralelos por idioma, manteniendo un equilibrio de filas de entrenamiento entre las tres lenguas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en VoxCPM; detalles de arquitectura interna no especificados en la model card) |
| Parámetros totales | 2.290.004.544 (≈2,29 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), telugu (te), canarés (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full fine-tune del checkpoint sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep, entrenado con el entrenador oficial de VoxCPM. La model card no detalla la arquitectura interna del modelo base (tipo de transformer, mecanismo de atención, decoder vocacional o diseño de difusión), por lo que este dato debe considerarse no disponible. El pipeline declarado es text-to-speech y el modelo se distribuye en safetensors con 2,29 mil millones de parámetros.

El entrenamiento utilizó datos de tres fuentes: sw-voice/swamiji-navaratri-telugu-sidon-themes (127 unidades temáticas completas), sw-voice/swamiji-navaratri-kannada-sidon-themes (124 unidades) y 120 clips en inglés de sw-voice/swamiji-voice-sft-sidon (uno por grupo duplicado, seleccionados aleatoriamente con semilla 0). El objetivo fue equilibrar el número de filas entre los tres idiomas (127 / 124 / 120). La configuración fue: micro-batch 1 con acumulación de gradiente 4, 3 épocas (279 pasos totales), learning rate 5e-05 con scheduler coseno, 42 pasos de warmup, gradient clipping de 1.0 y entrenamiento de todos los parámetros. El modelo es reference-free: la identidad de voz está embebida en los pesos, sin necesidad de audio de referencia en inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y canarés.
- Generación de voz con identidad de hablante embebida en los pesos (reference-free), sin clonación por audio de referencia.
- Soporte multilingüe limitado a los tres idiomas entrenados; no se declaran otros.
- Entrenado sobre material temático devocional (Navaratri, Swamiji), lo que sugiere especialización en registros y prosodia de ese dominio.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplicable a un modelo TTS).
- No se documentan capacidades de visión, audio de entrada ni modos de pensamiento.
- No se documenta control explícito de emociones, velocidad o estilo más allá del implícito en los datos de entrenamiento.

## Casos de uso

- Síntesis de contenido devocional en telugu y canarés: el modelo puede generar narraciones de temas de Navaratri con la voz embebida, adecuado porque fue entrenado específicamente con unidades temáticas completas de esas tradiciones.
- Producción de audiolibros y material educativo en lenguas indias: permite convertir texto en voz en telugu y canarés sin necesidad de grabaciones de referencia, lo que reduce costes frente a la locución humana.
- Localización de contenido en inglés hacia telugu y canarés: un mismo pipeline puede generar versiones de audio en los tres idiomas, útil para medios que publican en múltiples lenguas de India.
- Prototipado de asistentes de voz para comunidades de habla telugu y canarés: al ser reference-free, se puede desplegar sin gestión de muestras de voz por usuario, simplificando la infraestructura.
- Investigación en TTS multilingüe de bajos recursos: el modelo sirve como punto de partida para experimentos de ajuste fino con datos paralelos y equilibrio de filas por idioma, dado que el autor documenta la receta completa.
- Generación de avisos y comunicados de voz en inglés con acento o estilo del dominio entrenado: útil para organizaciones que ya producen contenido con esa identidad de voz y quieren automatizar la locución.
- Evaluación comparativa de pipelines de ajuste multietapa: el nombre del modelo codifica la etapa, el learning rate y las épocas, lo que facilita reproducir y comparar configuraciones en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa por tamaño (2,29 mil millones de parámetros), en fp16 requeriría aproximadamente 4,6 GB solo para pesos, más memoria para activaciones y buffers del decoder de audio; en cuantizaciones de 8 bits o 4 bits bajaría a rangos de 2,3-3,5 GB, pero no se confirman formatos de cuantización soportados.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs consumer con 8 GB o más de VRAM en fp16, y en GPUs profesionales (A100, H100) para despliegues de mayor throughput.
- ¿Cabe en GPU consumer? Previsiblemente sí en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no hay confirmación oficial.
- Opciones de despliegue: no se documentan en la model card. El pipeline declarado es text-to-speech y los pesos están en safetensors, por lo que sería desplegable con frameworks compatibles con Hugging Face Transformers o el código del proyecto swamiji-tts (`research/multi-stages`), pero no se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la información proporcionada para establecer una comparación rigurosa con alternativas. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxcpm2-indic-multi-stage3-te-kn-themes-en-replay-lr5e-5-3ep | 2,29 mil millones | no disponible | en, te, kn | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo marcado como "research" por el autor: no se declara validado para producción.
- Entrenado con datos de un dominio muy específico (temas de Navaratri y clips de Swamiji); la generalización a otros registros, vocabularios o estilos no está garantizada y puede degradar la naturalidad.
- Idiomas limitados a inglés, telugu y canarés; no se declara soporte de castellano ni de otras lenguas.
- Riesgo de alucinación prosódica y de pronunciación incorrecta en palabras fuera del vocabulario de entrenamiento, especialmente en telugu y canarés.
- Sesgos potenciales derivados de la identidad de voz embebida y del material devocional: la voz generada refleja las características del hablante de los datos, lo que puede no ser adecuado para todos los contextos.
- No se documentan medidas de mitigación de sesgos ni evaluaciones de calidad subjetiva (MOS) o de inteligibilidad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda verificar las condiciones de los datasets de entrenamiento originales, que no se detallan en la model card.
- Sin garantías de soporte ni mantenimiento; el repositorio tiene 20 descargas y 0 likes en el momento de la consulta, lo que indica baja validación comunitaria.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage3-te-kn-themes-en-replay-lr5e-5-3ep
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep
- Dataset telugu: sw-voice/swamiji-navaratri-telugu-sidon-themes (referenciado en la model card)
- Dataset canarés: sw-voice/swamiji-navaratri-kannada-sidon-themes (referenciado en la model card)
- Dataset inglés: sw-voice/swamiji-voice-sft-sidon (referenciado en la model card)
- Código del proyecto: swamiji-tts, directorio `research/multi-stages` (referenciado en la model card; no se proporciona URL directa)
