# yuanwu2023/dsh-anime-pet

## Resumen

dsh-anime-pet es un paquete de recursos para DeepSeek Harness (DSH) que implementa una mascota de escritorio (桌宠) con la apariencia del personaje anime «Roxy» (洛琪希). No es un modelo de lenguaje: es una distribución de artefactos que combina un plugin de interfaz, un conjunto de frases de voz pregrabadas y, opcionalmente, un motor de síntesis de voz basado en GPT-SoVITS y Genie-TTS para generar locuciones nuevas en tiempo real. El autor es yuanwu2023 y el repositorio ocupa 8,0 GB.

El componente de mayor interés técnico es el paquete de voz, que integra un modelo de text-to-speech (TTS) de tipo few-shot con un modelo de voz clonada («Roxy3») y una referencia de audio. Existen dos variantes: una de CPU (802 MB, requiere unos 3 GB de RAM) y otra que incluye motor GPU y CPU (6,62 GB, requiere unos 2,7 GB de VRAM en tarjetas NVIDIA). El plugin base (63 MB) solo reproduce frases pregrabadas y descarga en el primer arranque unos 150 MB del programa de ventana.

La relevancia de esta ficha es acotada: se trata de un proyecto de nicho, exclusivo para Windows, con licencia «other» y restricciones explícitas de uso personal no comercial. No publica benchmarks ni especificaciones de arquitectura del modelo TTS subyacente, por lo que la mayoría de los parámetros técnicos quedan como «no disponible».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (motor TTS basado en GPT-SoVITS y Genie-TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), japones (ja) |
| Licencia | other (uso personal, no comercial) |
| Formato de pesos | no disponible (distribucion en archivos ZIP con instaladores `install.cmd`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo de síntesis de voz. Por los enlaces declarados en la model card, el motor se apoya en GPT-SoVITS (licencia MIT) y Genie-TTS (licencia MIT), junto con sus dependencias. GPT-SoVITS es un sistema de TTS few-shot que combina un modelo autorregresivo tipo GPT con un vocoder SoVITS; Genie-TTS es un motor de síntesis complementario. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

El modelo de voz «Roxy3», la audio de referencia y las frases originales del personaje provienen de material de anime y videojuegos, y la imagen es una obra derivada de fan. El paquete se distribuye como tres ZIP con instaladores para Windows que copian archivos al directorio de datos de DSH (`<DSH 数据目录>/roxy/`). No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en chino y japonés mediante GPT-SoVITS y Genie-TTS.
- Clonación de voz few-shot a partir de una referencia de audio («Roxy3»).
- Reproducción de frases pregrabadas y locuciones explicativas en el plugin base.
- Generación de voz en tiempo real para texto que el asistente escriba en el momento (requiere paquete de voz).
- Integración como mascota de escritorio dentro de DeepSeek Harness, con ventana propia.
- Ejecución en CPU (unos 3 GB de RAM) o en GPU NVIDIA (unos 2,7 GB de VRAM).
- No dispone de tool calling, razonamiento multi-paso, visión ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Mascota de escritorio personal: instalar el plugin base en DeepSeek Harness para tener un personaje animado que conversa y reproduce frases pregrabadas; adecuado por su bajo consumo (63 MB) y su integración nativa en la interfaz.
- Síntesis de voz local sin GPU: usar el paquete `dsh-anime-pet-voice-cpu.zip` en equipos sin tarjeta gráfica para que el personaje lea en voz alta texto generado en el momento, con un requisito de unos 3 GB de RAM.
- Síntesis de voz acelerada por GPU: emplear `dsh-anime-pet-voice-gpu.zip` en equipos con NVIDIA para reducir la latencia de generación de voz, con unos 2,7 GB de VRAM.
- Prototipado de TTS few-shot en chino y japonés: aprovechar el motor GPT-SoVITS incluido como base para experimentar con clonación de voz en estos dos idiomas.
- Demostraciones de asistentes con avatar: integrar el personaje en una demo de DSH para ilustrar interacciones conversacionales con salida de voz.
- Pruebas de despliegue en Windows: validar el flujo de instalación (`install.cmd`, reinicio de DSH, descarga de 150 MB) en entornos de escritorio Windows antes de adoptar el plugin en un equipo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plugin base: 63 MB en disco; descarga adicional de unos 150 MB en el primer arranque; sin requisitos de GPU indicados.
- Paquete de voz CPU: 802 MB en disco y aproximadamente 3 GB de RAM; no requiere tarjeta gráfica.
- Paquete de voz GPU: 6,62 GB en disco (incluye motores GPU y CPU) y aproximadamente 2,7 GB de VRAM en GPU NVIDIA.
- GPU recomendadas: no disponible (la model card solo indica «N 卡», es decir, tarjeta NVIDIA, sin modelos concretos).
- Compatibilidad con GPU de consumo: no disponible; solo se confirma que requiere NVIDIA para la variante GPU.
- Sistema operativo: exclusivamente Windows.
- Opciones de despliegue: instalación mediante los ZIP e `install.cmd` sobre DeepSeek Harness; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dsh-anime-pet | Paquete de plugin + TTS (GPT-SoVITS/Genie-TTS) | no disponible | no disponible | zh, ja | other (uso personal) | Hugging Face, solo Windows |
| GPT-SoVITS | Motor TTS few-shot | no disponible | no disponible | multiidioma (segun proyecto) | MIT | GitHub |
| Genie-TTS | Motor TTS | no disponible | no disponible | no disponible | MIT | GitHub |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia «other» con restricción explícita: solo uso personal, prohibido el uso comercial, el entrenamiento y la síntesis de voz para suplantar a otras personas.
- El autor advierte de que el repositorio se retirará si los titulares de derechos presentan objeciones; el material de voz e imagen es de anime y videojuegos, y la imagen es fan art.
- Compatibilidad limitada a Windows; no hay soporte documentado para Linux ni macOS.
- Solo cubre chino y japonés; no se declara soporte de castellano.
- No es un modelo de lenguaje: no ofrece razonamiento, código, matemáticas, tool calling ni agentes.
- Sin benchmarks publicados, por lo que no es posible evaluar calidad de síntesis, naturalidad ni latencia de forma objetiva.
- Riesgo de alucinación no aplicable al ser TTS; el riesgo relevante es la calidad de la clonación de voz y el uso indebido de la identidad sonora.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; proyecto de nicho sin validación comunitaria.
- La instalación requiere reiniciar DeepSeek Harness y mantener el plugin en una ruta fija; moverlo puede romper la integración.

## Enlaces

- Hugging Face: https://huggingface.co/yuanwu2023/dsh-anime-pet
- Espejo para China: https://hf-mirror.com/yuanwu2023/dsh-anime-pet
- GPT-SoVITS (GitHub): https://github.com/RVC-Boss/GPT-SoVITS
- Genie-TTS (GitHub): https://github.com/High-Logic/Genie-TTS
