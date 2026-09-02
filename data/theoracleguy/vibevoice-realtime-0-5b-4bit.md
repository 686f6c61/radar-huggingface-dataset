# theoracleguy/VibeVoice-Realtime-0.5B-4bit

## Resumen

VibeVoice-Realtime-0.5B-4bit es una conversion comunitaria al formato MLX de Apple del modelo de sintesis de voz en tiempo real VibeVoice-Realtime-0.5B de Microsoft, cuantizada a 4 bits y publicada por el usuario theoracleguy. El modelo esta basado en Qwen2.5-0.5B como modelo base y cuenta con 194.277.382 parametros (~194M), lo que lo convierte en una opcion ligera para generacion de voz de baja latencia.

La principal innovacion de este modelo es su capacidad para procesar texto en streaming y generar voz con una latencia inicial de aproximadamente 300 ms, lo que permite que asistentes conversacionales comiencen a hablar antes de que el LLM termine de generar su respuesta completa. Tambien soporta generacion de voz de larga duracion (hasta 90 minutos) y dialogos con hasta 4 roles distintos.

Al estar cuantizado a 4 bits y en formato MLX, este modelo esta optimizado para ejecutarse en hardware Apple Silicon, aunque su tamano reducido (~0,7 GB) lo hace viable en una amplia gama de dispositivos. La licencia MIT permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen2.5-0.5B (transformer decoder-only adaptado a TTS) |
| Parametros totales | 194.277.382 (~194M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Ingles (principal), con cierta capacidad multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo esta basado en la arquitectura de Qwen2.5-0.5B, un transformer decoder-only de 0.5B parametros, adaptado para la tarea de sintesis de voz. La version original fue desarrollada por Microsoft y posteriormente convertida al formato MLX mediante mlx-audio version 0.2.6, con cuantizacion a 4 bits para reducir el tamano y mejorar la eficiencia en hardware Apple.

El modelo esta disenado especificamente para TTS en tiempo real, con soporte para entrada de texto en streaming y generacion de voz de larga duracion. Segun la documentacion de Microsoft, el modelo produce voz audible inicial en aproximadamente 300 ms. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO en el proceso de entrenamiento.

## Capacidades

- Generacion de voz en tiempo real con latencia inicial de aproximadamente 300 ms.
- Entrada de texto en streaming: puede procesar texto de forma incremental mientras se genera el audio.
- Generacion de voz de larga duracion: soporta hasta 90 minutos de audio continuo.
- Expresion emocional en la voz generada.
- Dialogos con hasta 4 roles distintos (voz multi-locutor).
- Capacidad multilingue limitada: aunque esta disenado principalmente para ingles, muestra un rendimiento razonable en algunos otros idiomas.
- Integrable con LLMs para que estos comiencen a hablar desde sus primeros tokens generados.

## Casos de uso

- Asistentes conversacionales en tiempo real: el modelo puede generar voz mientras el LLM genera texto, reduciendo la latencia percibida por el usuario. Su capacidad de streaming permite que el asistente comience a hablar en ~300 ms.
- Narracion de flujos de datos en vivo: puede narrar datos que llegan de forma continua, como cotizaciones bursatiles, resultados deportivos o telemetria, gracias a su soporte de entrada de texto en streaming.
- Servicios de TTS de baja latencia: puede integrarse en servicios de sintesis de voz en tiempo real para aplicaciones como subtitulado de voz, traduccion simultanea o accesibilidad.
- Generacion de audiolibros y contenido de larga duracion: su capacidad para generar hasta 90 minutos de audio lo hace adecuado para la produccion de audiolibros y podcasts automatizados.
- Dialogos multi-locutor: con soporte para 4 roles distintos, puede generar conversaciones entre multiples personajes para audiodramas, doblaje o contenido educativo.
- Integracion con LLMs para voz: permite que cualquier LLM "hable" sus respuestas en tiempo real, lo que es util para chatbots de voz, atencion al cliente automatizada y dispositivos IoT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datos de rendimiento mencionados (latencia de ~300 ms, hasta 90 minutos de audio) provienen de la documentacion oficial de Microsoft, pero no se dispone de metricas comparativas estandar como MOS (Mean Opinion Score) ni otros indicadores de calidad de voz.

## Requisitos de hardware

- VRAM estimada: con 194M parametros cuantizados a 4 bits, el peso del modelo ocupa aproximadamente 100 MB. Se estima que puede ejecutarse con 2-4 GB de VRAM, aunque el dato exacto no esta disponible.
- GPU recomendadas: al estar en formato MLX, esta optimizado para Apple Silicon (M1, M2, M3, M4). No se recomendar NVIDIA/
