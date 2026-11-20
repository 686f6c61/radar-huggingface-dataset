# VertexAGI/prism-roleplay-1-small

## Resumen

Prism Roleplay 1 Small es un modelo de generación de texto especializado en roleplay de personajes e interacción conversacional inmersiva, desarrollado por VertexAGI. Se construye mediante un ajuste fino con LoRA sobre Qwen3-8B (en su variante cuantizada a 4 bits de mlx-community), partiendo de un conjunto de datos destilado de dos profesores: GLM 5.2 y NVIDIA Nemotron-3-Nano. El objetivo declarado es eliminar el modo "asistente genérico" y el texto de planificación interna que el modelo base filtra en cada respuesta.

El problema que aborda es concreto y medible: Qwen3-8B, por defecto, emite su traza de razonamiento (`<think>...</think>`) con el plan interno antes del contenido, lo que rompe por completo la inmersión en escenarios de rol. Según la model card, el ajuste suprime ese filtrado en el 100% de las muestras de validación y reduce la repetición de 4-gramas aproximadamente un factor de 3.

Con 8.190.735.360 parámetros y un repositorio de 9,6 GB que incluye pesos en formato MLX (4 bits, grupo 64) y GGUF Q4_K_M, el modelo está pensado para ejecutarse en Apple Silicon vía mlx-lm o en llama.cpp/Ollama/LM Studio. La licencia Apache 2.0 facilita su uso comercial, aunque el soporte de idiomas declarado se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA fusionado |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits MLX (group size 64); GGUF Q4_K_M (4 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, 4 bits) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen3-8B. Sobre esa base se aplica un ajuste fino con LoRA de rango 8 sobre 16 capas, durante 9.000 iteraciones, y el adaptador resultante se distribuye fusionado con los pesos del modelo base. El conjunto de entrenamiento consta de 3.500 ejemplos generados por destilación a partir de dos profesores: 2.332 ejemplos de GLM 5.2 y 1.168 de NVIDIA Nemotron-3-Nano (vía NVIDIA NIM), combinados para aportar diversidad estilística.

Los datos cubren 10 categorías: fichas de personaje, continuaciones de escena, escenas con múltiples personajes, intercambios con mucho diálogo, narración en prosa, conflicto emocional, reacciones a acciones del usuario, worldbuilding en personaje, banter de grupo y cambios de formato. La mejor pérdida de validación alcanzada fue 1,377, frente a 3,453 al inicio del entrenamiento. No se documenta en la información disponible el uso de RLHF o DPO; el método declarado es exclusivamente ajuste supervisado con LoRA sobre datos destilados.

La innovación técnica destacable no está en la arquitectura, sino en el comportamiento aprendido: el modelo emite un bloque `<think></think>` vacío y correctamente cerrado, seguido inmediatamente de contenido en personaje. Esto depende del runtime: mlx-lm activa automáticamente el modo no-thinking, mientras que en llama.cpp es necesario pasar `-rea off` o `--reasoning off` para que la supresión se manifieste.

## Capacidades

- Generación de texto conversacional orientada a roleplay, con encarnación de personaje y mantenimiento de voz y escena.
- Fichas de personaje completas (nombre, descripción física, trasfondo) sin narración meta.
- Escenas con múltiples personajes y diálogo cruzado.
- Narración en prosa y descripciones atmosféricas.
- Reacción a acciones del usuario dentro de la ficción, sin romper la cuarta pared.
- Worldbuilding en personaje y cambios de formato dentro de una misma conversación.
- Supresión del texto de planificación y razonamiento interno en el 100% de las muestras de validación del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles como característica declarada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Motores de rol conversacional en productos de entretenimiento**: el modelo mantiene la voz del personaje a lo largo de conversaciones multi-turno y evita el registro de asistente, lo que lo hace adecuado para aplicaciones de chat con personajes persistentes.
- **Generación de contenido narrativo para juegos**: producción de descripciones de escena, diálogos de PNJ y reacciones a acciones del jugador, con formato controlado mediante el template de chat de Qwen3.
- **Creación asistida de fichas de personaje**: generación de fichas estructuradas (nombre, descripción física, motivaciones) a partir de una premisa breve, como demuestra el ejemplo de la model card con fantasía de portal.
- **Prototipado de narrativa interactiva**: escritura de ramas de historia y continuaciones de escena en sesiones de escritura iterativa, aprovechando la baja repetición de 4-gramas (0,0062 de media) para evitar bucles.
- **Simulación de diálogo para entrenamiento de guionistas**: escenas con múltiples personajes y conflicto emocional para practicar registro y tono antes de la escritura final.
- **Despliegue local en estaciones de trabajo Apple Silicon**: inferencia con mlx-lm sobre el formato MLX de 4,61 GB, útil para equipos que necesitan un modelo de rol sin depender de APIs externas.
- **Integración en pipelines ligeros con llama.cpp/Ollama/LM Studio**: uso del GGUF Q4_K_M de 5,03 GB para entornos sin GPU dedicada, recordando desactivar el razonamiento con `-rea off`.

## Benchmarks y rendimiento

La model card solo publica una evaluación comparativa base frente a ajustado, sobre 20 escenarios retenidos (uno por categoría):

| Metrica | Qwen3-8B base | Prism Roleplay 1 Small |
|---|---|---|
| Texto de planificacion/razonamiento filtrado | 20/20 (100%) | 0/20 (0%) |
| Ratio medio de repeticion de 4-gramas | 0,0172 | 0,0062 |
| Salidas con alta repeticion (>0,15) | 1/20 | 0/20 |
| Perdida de validacion (mejor) | 3,453 (inicio) | 1,377 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5 GB para el GGUF Q4_K_M (5,03 GB de fichero) y 4,61 GB para el formato MLX de 4 bits; el espacio en disco del repositorio completo es de 9,6 GB.
- GPU recomendadas: no se especifican en la información proporcionada; el formato principal es MLX para Apple Silicon.
- Cabe en GPU de consumo: sí, en términos de memoria, dado el tamaño de 4 bits; no se detallan modelos concretos de GPU NVIDIA en la información disponible.
- Opciones de despliegue: mlx-lm (formato nativo), llama.cpp, Ollama y LM Studio mediante el GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota operativa: en llama.cpp es imprescindible `-rea off` o `--reasoning off` para evitar que aparezca el bloque `<think>` visible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| Prism Roleplay 1 Small | 8,19 B | no disponible | Roleplay de personaje por destilación | Apache 2.0 | MLX 4 bits, GGUF Q4_K_M |
| Qwen3-8B (base) | 8 B | no disponible | Modelo generalista con razonamiento | Apache 2.0 | safetensors, GGUF |
| GLM 5.2 (profesor) | no disponible | no disponible | Generación generalista usada como profesor | no disponible | no disponible |
| NVIDIA Nemotron-3-Nano (profesor) | no disponible | no disponible | Generación generalista usada como profesor | no disponible | no disponible |

La comparación cuantitativa disponible se limita al par base/ajustado de la model card; no hay datos de benchmarks frente a otros modelos de roleplay en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- La evaluación publicada se basa en 20 escenarios retenidos, una muestra pequeña que no permite extrapolar garantías de producción.
- Persiste riesgo de alucinación inherente a un modelo de 8 B; no se documentan mitigaciones específicas.
- En llama.cpp y runtimes que no señalen modo no-thinking, el bloque `<think>` puede aparecer visible y romper la inmersión.
- No se declaran capacidades de tool calling ni de agente; no debe asumirse su disponibilidad.
- La longitud de contexto efectiva no se especifica en la información disponible, aunque hereda la del modelo base Qwen3-8B.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Qwen3-8B y de datos sintéticos de dos profesores, puede heredar sesgos estilísticos y culturales de ambos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/prism-roleplay-1-small
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la información proporcionada enlaces a papers, blogs o demos adicionales.
