# VertexAGI/prism-roleplay-1-small

## Resumen

Prism Roleplay 1 Small es un modelo de roleplay de personajes y diálogo inmersivo desarrollado por VertexAGI, fine-tuneado mediante LoRA sobre Qwen3-8B (en su versión MLX 4-bit) usando un dataset destilado generado por un pool de modelos profesores: GLM 5.2 y NVIDIA Nemotron-3-Nano. El objetivo es que el modelo encarne completamente a un personaje descrito, manteniéndose en voz, escena y carácter, sin caer en el registro genérico de "asistente de IA". Forma parte de la familia Prism de modelos creativos y de roleplay.

Se entrenó con 3.500 ejemplos en 10 categorías, usando LoRA de rango 8 sobre 16 capas, con 9.000 iteraciones y una pérdida de validación final de 1.377 (frente a 3.453 iniciales). Está disponible en formato MLX (4-bit) para Apple Silicon y GGUF (Q4_K_M) para llama.cpp y runtimes compatibles.

La relevancia actual del modelo radica en que resuelve un problema común en los modelos base: la fuga de razonamiento interno (traces de thinking) que rompe la inmersión en roleplay. La evaluación del autor muestra que el modelo base filtraba su planificación interna en el 100% de las respuestas, mientras que Prism Roleplay lo elimina por completo, reduciendo además la repetición aproximadamente tres veces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) con adaptador LoRA |
| Parametros totales | 1.280.062.464 (según metadatos; modelo base Qwen3-8B con ~8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda del modelo base Qwen3-8B) |
| Tipos de cuantizacion | MLX 4-bit, GGUF Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-8B, un transformer denso de aproximadamente 8.000 millones de parámetros. Sobre él se aplicó un adaptador LoRA de rango 8 sobre 16 capas, entrenado durante 9.000 iteraciones. El dataset de entrenamiento consta de 3.500 ejemplos generados por destilación a partir de dos modelos profesores: GLM 5.2 (2.332 ejemplos) y NVIDIA Nemotron-3-Nano (1.168 ejemplos), mezclados para diversidad estilística. Los ejemplos cubren 10 categorías: tarjetas de personaje, continuaciones de escena, escenas multi-personaje, intercambios centrados en diálogo, narración en prosa, conflicto emocional, reacciones a acciones del usuario, worldbuilding en personaje, banter grupal y cambios de formato.

La innovación técnica principal es la supresión del trace de razonamiento de Qwen3: el modelo base filtraba su planificación interna en el 100% de las respuestas, y el entrenamiento LoRA eliminó esta fuga por completo en las muestras de validación, reduciendo además el ratio de repetición de 4-gramas de 0.0172 a 0.0062. El modelo se distribuye con un sistema prompt específico recomendado para obtener los mejores resultados.

## Capacidades

- Encarnación de personaje: mantiene voz, escena y carácter descritos sin salirse del registro ni romper la cuarta pared.
- Escenas multi-personaje: gestiona conversaciones con varios personajes manteniendo coherencia entre ellos.
- Matices emocionales: maneja conflicto emocional y reacciones afectivas contextualizadas.
- Diálogo y prosa: equilibra intercambios centrados en diálogo con narración en prosa inmersiva.
- Worldbuilding en personaje: construye lore y descripciones desde la perspectiva del personaje, no como narrador externo.
- Supresión del razonamiento interno: no filtra traces de thinking ni planificación en las respuestas.
- Generación de tarjetas de personaje: produce tarjetas completas con nombre, descripción física y personalidad a partir de una premisa.
- Cambios de formato: se adapta a distintos formatos de salida (tarjetas, continuaciones, banter grupal, etc.).

## Casos de uso

- Roleplay por chat con personajes: el modelo encarna personajes definidos por tarjetas de personaje, manteniendo coherencia en conversaciones multi-turno gracias a su entrenamiento específico en inmersión.
- Escritura creativa asistida: genera continuaciones de escenas, diálogos y narración en prosa con tono inmersivo, útil para autores que necesitan explorar voces de personajes.
- Simulación de NPCs para juegos: integrable en motores de juego o plataformas de rol para generar respuestas de personajes no jugadores con personalidad consistente.
- Generación de tarjetas de personaje: produce tarjetas completas y bien formadas a partir de una premisa, sin fugas de razonamiento, como demuestra el ejemplo del autor con la tarjeta de "mysterious stranger".
- Prototipado de narrativa interactiva: útil para diseñar historias ramificadas o ficción interactiva donde la coherencia del personaje es crítica.
- Entrenamiento de modelos de roleplay: puede usarse como modelo profesor para destilar comportamientos de roleplay en modelos más pequeños, dado su comportamiento limpio sin traces de razonamiento.
- Integración en frontends de chat: compatible con SillyTavern, LM Studio y Ollama mediante el formato GGUF, con la advertencia de usar `-rea off` en llama.cpp.

## Benchmarks y rendimiento

El autor proporciona una comparación entre el modelo base (Qwen3-8B) y Prism Roleplay 1 Small sobre 20 escenarios de validación (uno por categoría):

| Metrica | Base Qwen3-8B | Prism Roleplay 1 Small |
|---|---|---|
| Texto de planificación/razonamiento filtrado | 20/20 (100%) | 0/20 (0%) |
| Ratio medio de repetición de 4-gramas | 0.0172 | 0.0062 |
| Salidas con alta repetición (>0.15) | 1/20 | 0/20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B en cuantización 4-bit, requiere aproximadamente 4-5 GB de VRAM para inferencia.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, etc.). En Apple Silicon, funciona con MLX en chips M1 o superiores.
- Compatible con GPU de consumo: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: mlx-lm (Apple Silicon), llama.cpp, LM Studio, Ollama y runtimes compatibles con GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Params | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Prism Roleplay 1 Small | Qwen3-8B | ~8B | no disponible | Apache 2.0 | MLX, GGUF |
| Qwen3-8B (base) | - | 8B | no disponible | Apache 2.0 | safetensors, GGUF |
| Otros modelos de roleplay | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más relevante es contra el modelo base Qwen3-8B, que el autor evalúa directamente: Prism Roleplay elimina la fuga de razonamiento y reduce la repetición, a costa de especializarse exclusivamente en roleplay. No se dispone de datos sobre otros modelos de roleplay comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 8B con dataset de entrenamiento moderado (3.500 ejemplos): capaz pero no infalible, como reconoce el propio autor.
- Al ser un modelo destilado, hereda algunas limitaciones de sus modelos profesores (GLM 5.2 y Nemotron-3-Nano).
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Con llama.cpp es necesario usar `-rea off` (o `--reasoning off`) para suprimir el bloque de razonamiento visible; de lo contrario, el modelo emitirá un trace de thinking antes de la respuesta, aunque el comportamiento entrenado subyacente sea idéntico.
- El sistema prompt recomendado es específico y debe usarse para obtener los mejores resultados.
- No se han publicado evaluaciones de sesgos, alucinación o seguridad en la información disponible.
- El modelo está especializado en roleplay; puede no rendir bien en tareas generales de asistente o razonamiento.

## Enlaces

- HuggingFace: https://huggingface.co/VertexAGI/prism-roleplay-1-small
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Otro modelo de la familia Prism: https://huggingface.co/VertexAIco/prism-creative-1-mini

Los resultados de búsqueda web adicionales (gist de PRISM, miniapps.ai, hilo de Reddit sobre SillyTavern, NinjaChat) no son directamente relevantes para este modelo.
