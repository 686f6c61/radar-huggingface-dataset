# Wildminder/VibeVoice-Quants

## Resumen

VibeVoice-Quants es un repositorio de Wildminder que agrupa versiones cuantizadas de los modelos VibeVoice, un framework desarrollado por Microsoft para la generacion de audio conversacional expresivo y de formato largo con multiples hablantes. El modelo base es capaz de producir dialogos naturales, podcasts y contenido hablado manteniendo voces consistentes para hasta cuatro interlocutores, lo que lo diferencia de los sistemas de TTS convencionales que generan una unica voz sin interaccion.

El repositorio incluye cuantizaciones de 4 y 8 bits (mediante bitsandbytes) de las variantes VibeVoice-7B-Preview y VibeVoice-1.5B, lo que permite su ejecucion en hardware con VRAM limitada. La variante de 7B se recomienda para produccion por su mayor estabilidad, mientras que la de 1.5B ofrece inferencia mas rapida y menor consumo de memoria a costa de una salida menos estable. La licencia MIT permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal de generacion de audio (arquitectura completa no disponible) |
| Parametros totales | 7.000 millones (variante Preview) y 1.500 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit y 8-bit (bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizados con bitsandbytes) |

## Arquitectura y entrenamiento

VibeVoice es un framework de Microsoft para generacion de audio conversacional. Segun la documentacion disponible, los modelos se construyen sobre una arquitectura multimodal (los detalles completos no se han publicado en la informacion accesible). El sistema se disena especificamente para mantener consistencia vocal entre multiples hablantes en una misma conversacion, lo que implica un mecanismo de condicionamiento por identidad de voz integrado en el modelo. No se dispone de datos sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas de alineacion como RLHF o DPO.

Las cuantizaciones de este repositorio se han generado con bitsandbytes, que aplica cuantizacion a nivel de capa con escalado por bloques, manteniendo un equilibrio entre la reduccion de memoria y la fidelidad de los pesos. No se ha publicado informacion sobre el proceso de calibracion ni sobre la degradacion de calidad medida tras la cuantizacion.

## Capacidades

- Generacion de audio conversacional de larga duracion con multiples hablantes.
- Consistencia de voz para hasta 4 interlocutores en la misma sesion.
- Produccion de dialogos naturales y contenido tipo podcast con expresividad.
- Soporte de formato de audio de salida apto para integracion en pipelines de postproduccion.
- Capacidad de generar multiples turnos de conversacion manteniendo el contexto de los participantes.
- Version 7B-Preview recomendada para produccion por mayor estabilidad en las salidas.

## Casos de uso

- Generacion de podcasts automatizados: el modelo puede crear conversaciones completas entre varios presentadores con voces diferenciadas y consistentes, reduciendo el coste de produccion de contenido editorial.
- Doblaje de contenido audiovisual: permite generar dialogos para personajes con voces distintas y coherentes a lo largo de una secuencia, manteniendo la identidad vocal de cada personaje.
- Creacion de audiolibros dramatizados: el modelo puede interpretar dialogos de varios personajes en una narracion, eliminando la necesidad de contratar multiples locutores.
- Simulacion de conversaciones para entrenamiento de asistentes de voz: genera datos sinteticos de interacciones multi-hablante para fine-tuning de sistemas de reconocimiento o comprension del habla.
- Contenido educativo y formativo: generacion de explicaciones dialogadas entre un instructor y un alumno con voces diferenciadas, aplicable a e-learning y MOOC.
- Pruebas de sistemas de transcripcion y subtitulado: genera audio con solapamiento de hablantes y entonaciones variadas para estresar los modelos de ASR en condiciones realistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas objetivas de calidad de audio (MOS, WER) ni de comparacion con modelos alternativos de generacion de voz conversacional.

## Requisitos de hardware

- La variante de 1.5B en 4-bit requiere aproximadamente 1 GB de VRAM para inferencia, siendo ejecutable en cualquier GPU consumer moderna (GTX 1060 6GB o superior).
- La variante de 7B en 4-bit requiere aproximadamente 4-5 GB de VRAM, cabiendo en RTX 3060 12GB, RTX 4060 Ti 16GB o RTX 4070.
- La variante de 7B en 8-bit requiere aproximadamente 8-9 GB de VRAM, recomendandose RTX 3080/4080 o superiores.
- Para produccion con la variante 7B y multiples peticiones concurrentes se recomienda A100 40GB o H100.
- Despliegue: se puede integrar en ComfyUI mediante el nodo personalizado ComfyUI-VibeVoice, que gestiona la descarga de pesos y la inferencia en memoria.
- No se dispone de datos de latencia o throughput medidos en las fuentes consultadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| VibeVoice-7B-Preview | 7B | no disponible | MIT | Generacion conversacional multi-voz |
| VibeVoice-1.5B | 1.5B | no disponible | MIT | Inferencia rapida, menor estabilidad |
| Alternativas comerciales (ElevenLabs, Play.ht) | - | - | propietaria | No comparables directamente por licencia y arquitectura |

No se dispone de informacion sobre modelos open source comparables en la misma categoria de generacion de audio conversacional multi-hablante.

## Limitaciones y advertencias

- La variante de 1.5B produce salidas menos estables que la de 7B, por lo que no se recomienda para produccion sin validacion previa.
- No se dispone de informacion sobre los idiomas soportados; el modelo puede estar entrenado principalmente con datos en ingles (region:us).
- No se han publicado datos sobre sesgos de las voces generadas o posibles artefactos de audio.
- La cuantizacion puede degradar la calidad de las voces generadas; se recomienda validar los resultados con la variante sin cuantizar antes de desplegar.
- No se dispone de documentacion sobre el contexto maximo soportado, por lo que conversaciones muy largas pueden verse limitadas.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere un proyecto en fase temprana sin validacion por parte de la comunidad.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Wildminder/VibeVoice-Quants
- Nodo ComfyUI: https://github.com/wildminder/ComfyUI-VibeVoice
- Documentacion de variantes y configuracion: https://deepwiki.com/wildminder/ComfyUI-VibeVoice/3.3-model-variants-and-configuration
- Guia de cuantizacion de la variante 7B (tercera parte): https://huggingface.co/SomeoneSomething/VibeVoice7b-low-vram-4bit/blob/main/QUANTIZATION_README.md
- Guia de cuantizacion alternativa: https://huggingface.co/DevParker/VibeVoice7b-low-vram/blob/main/4bit/QUANTIZATION_README.md
- Perfil de GitHub del autor: https://github.com/wildminder
