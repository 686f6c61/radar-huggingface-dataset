# Xangel0s/OzyAssist-7B

## Resumen

OzyAssist-7B es una familia de modelos afinados (fine-tuned) publicada por el usuario Xangel0s en HuggingFace, disenada para actuar como el "cerebro autonomo" del proyecto OzyAssist, un asistente de escritorio para Windows. El modelo parte de Qwen2.5-Coder-7B-Instruct y se distribuye principalmente en formato GGUF cuantizado a Q4_K_M, con el objetivo de ejecutar tareas de automatizacion de escritorio, control de aplicaciones y razonamiento multitarea en maquinas de consumo.

El repositorio incluye en realidad dos variantes: un modelo de ~7B (`OzyAssist-7B-v3-q4_k_m.gguf`, 4,68 GB) pensado como motor principal, y un modelo de ~1,5B (`OzyAssist-1.5B-v3-q4_k_m.gguf`, 986 MB) orientado a modo voz y a equipos con poca VRAM. Llama la atencion que el conteo de parametros en safetensors del repositorio (1.543.714.304) corresponde a la variante de 1,5B, mientras que la de 7B se sirve unicamente en GGUF.

La version 3 (v3) se presenta como una iteracion enfocada en eliminar alucinaciones (bucles de saltos de linea y copias literales del system prompt) e incorporar herramientas nativas de Windows. La relevancia actual radica en su propuesta de usar el modelo pequeno como borrador para decodificacion especulativa del modelo grande, acelerandolo hasta 2,5x. El proyecto tiene un nivel de adopcion muy bajo (20 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder) |
| Parametros totales | Dos variantes: ~7B (GGUF) y ~1,54B (safetensors: 1.543.714.304) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M |
| Idiomas soportados | espanol, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variante 7B y 1,5B) y safetensors (variante de ~1,54B) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-Coder-7B-Instruct (y su variante de 1,5B), una arquitectura transformer decoder-only con atencion causal. El ajuste fino se ha orientado a tareas de agente de escritorio: control de ventanas, gestion de aplicaciones, audio, telemetria, salud SMART de discos y comandos de sistema en Windows. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO u otras.

Como innovacion tecnica destacable, la familia plantea la doble compatibilidad entre ambas variantes: el modelo de 1,5B puede actuar como modelo borrador (draft) en un esquema de decodificacion especulativa para acelerar al modelo de 7B hasta 2,5x. La version v3 afirma haber eliminado bucles de saltos de linea y copias textuales del system prompt, problemas habituales en modelos pequenos ajustados para agentes.

## Capacidades

- Generacion de texto conversacional y razonamiento en tareas de agente.
- Generacion y asistencia de codigo, heredada del modelo base Qwen2.5-Coder.
- Tool calling / function calling orientado a herramientas nativas de Windows.
- Control de ventanas, aplicaciones, audio, telemetria y salud SMART del sistema.
- Ejecucion de comandos de sistema como parte de flujos de automatizacion.
- Modo voz: la variante de 1,5B ofrece respuestas rapidas (<300 ms) para comandos por voz y streaming en vivo.
- Soporte de decodificacion especulativa usando el modelo de 1,5B como borrador.
- Capacidades multilingues limitadas a espanol e ingles.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistente de escritorio para Windows: el modelo puede interpretar ordenes en lenguaje natural y traducirlas en llamadas a herramientas del sistema (abrir aplicaciones, gestionar ventanas, ajustar audio), aprovechando su ajuste especifico sobre herramientas nativas del sistema operativo.
- Automatizacion de tareas repetitivas de oficina: encadenar acciones como renombrar archivos, mover carpetas o lanzar programas mediante secuencias de comandos de sistema, con razonamiento multi-paso.
- Comandos por voz de baja latencia: la variante de 1,5B, con respuestas inferiores a 300 ms y ~50-65 t/s, es adecuada para asistentes de voz que requieren interaccion casi instantanea.
- Monitorizacion de salud del equipo: uso de las herramientas de telemetria y salud SMART para consultar el estado del hardware e informar al usuario sobre posibles fallos.
- Copiloto de programacion local: gracias a su base Qwen2.5-Coder, puede asistir en generacion y explicacion de codigo dentro de un entorno de desarrollo en el propio equipo, sin depender de la nube.
- Despliegue en equipos con recursos limitados: la variante de 1,5B en Q4_K_M (986 MB) permite ejecutar un agente funcional en portatiles sin GPU dedicada o con poca VRAM.
- Aceleracion de inferencia en produccion: usar el modelo de 1,5B como borrador especulativo del de 7B para reducir la latencia en tareas de razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta cifras de velocidad de inferencia estimadas, no de calidad:

| Modelo | Velocidad estimada | Tamano GGUF |
|---|---|---|
| OzyAssist-7B-v3-q4_k_m | ~12-18 t/s | 4,68 GB |
| OzyAssist-1.5B-v3-q4_k_m | ~50-65 t/s | 986 MB |

## Requisitos de hardware

- VRAM estimada para el modelo de 7B en Q4_K_M: en torno a 5-6 GB solo para pesos, mas el consumo del contexto; en la practica conviene disponer de 8 GB o mas de VRAM para un uso comodo (estimacion, no confirmada en la informacion).
- VRAM estimada para el modelo de 1,5B en Q4_K_M: aproximadamente 1-2 GB, por lo que cabe en practicamente cualquier GPU de consumo.
- GPU recomendadas: no especificadas por el autor. Para el 7B se puede asumir viabilidad en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs de datacenter (A100, H100); para el 1,5B, cualquier GPU moderna de gama media (estimacion).
- Cabe en GPU de consumo: si, tanto el 1,5B (en casi cualquier GPU) como el 7B cuantizado (en GPU con 8 GB o mas).
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama y otros runners compatibles con GGUF. El tag `endpoints_compatible` sugiere integracion con APIs compatibles tipo OpenAI.
- Latencia y throughput: segun la model card, ~12-18 t/s para el 7B y ~50-65 t/s para el 1,5B; en modo voz, respuestas por debajo de 300 ms con el modelo pequeno. La decodificacion especulativa puede acelerar el 7B hasta 2,5x.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OzyAssist-7B (este) | ~7B (GGUF) y ~1,54B (safetensors) | no disponible | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | ~1,5B | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos entre OzyAssist y sus modelos base ni con otras alternativas de agentes de escritorio, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Adopcion muy baja: 20 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Discrepancia entre el nombre del repositorio (OzyAssist-7B) y el conteo de parametros en safetensors (1,54B), que corresponde a la variante pequena; el modelo de 7B solo esta en GGUF.
- No se han publicado benchmarks, por lo que no hay evidencia objetiva de calidad o de la supuesta eliminacion de alucinaciones.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas de agente que ejecutan acciones reales sobre el sistema; se recomienda supervision y limites de permisos.
- Limitacion idiomatica: solo espanol e ingles.
- Longitud de contexto no documentada, lo que dificulta planificar conversaciones o tareas de contexto largo.
- El ajuste esta muy orientado a Windows, por lo que su utilidad fuera de ese sistema operativo es limitada.
- No se detallan los datos de entrenamiento ni el proceso de alineacion, lo que dificulta evaluar sesgos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen2.5-Coder conviene verificar que se cumplen las condiciones de la licencia del modelo base.
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo (tratan sobre Spotify), por lo que no aportan contexto adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xangel0s/OzyAssist-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper, blog, repositorio o demo del proyecto OzyAssist: no disponible en la informacion proporcionada.
