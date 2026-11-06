# VertexAGI/prism-roleplay-2-small

## Resumen

Prism Roleplay 2 Small es un ajuste fino mediante LoRA del modelo Qwen3-8B de Alibaba, desarrollado por VertexAGI y orientado específicamente a la generación de diálogo de rol (roleplay) multi-turno con personajes. El modelo parte de una arquitectura transformer densa de 8.190.735.360 parámetros (8B), heredada íntegramente de Qwen3-8B, e incorpora dos capacidades adicionales sobre el modelo base: pensamientos internos privados (`inner_thoughts`) y seguimiento de estado emocional (`track_state`), ambos implementados como llamadas a herramientas opcionales.

La propuesta del autor es corregir las debilidades de su versión anterior (Prism Roleplay 1.5 Small) en conversaciones largas. Para ello, el ajuste se entrenó sobre 1.575 chats multi-turno, aplicando la función de pérdida únicamente sobre la respuesta final en lugar de sobre todos los tokens, con LoRA de rango 16 y secuencias de 3.072 tokens. El resultado declarado es una mejora sustancial en multi-turno (especialmente con historiales cortos y largos) y una mejora modesta en memoria de sesiones anteriores.

El modelo se distribuye en formato MLX (librería principal declarada) y GGUF, con licencia Apache 2.0 y soporte exclusivo de inglés. Su relevancia radica en ser un ejemplo de ajuste fino especializado sobre un modelo base reciente, con una evaluación comparativa publicada por el propio autor, aunque de alcance limitado y automatizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) con adaptador LoRA de rango 16 |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó secuencias de 3.072 tokens; el contexto del base Qwen3-8B no se detalla) |
| Tipos de cuantización | 4-bit y 6-bit (mencionados en tags y en la model card); GGUF Q4_K_M referenciado en el ejemplo de uso |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre Qwen3-8B, un transformer denso de 8B parámetros. El adaptador emplea rango 16 y secuencias de entrenamiento de 3.072 tokens, frente al rango 8 y 2.048 tokens de la versión 1.5. La innovación metodológica principal es el enmascaramiento de la pérdida: en las filas de chat, solo se calcula la pérdida sobre la respuesta final, de modo que el modelo aprende a responder en lugar de copiar turnos anteriores del historial. El conjunto de entrenamiento combina datos sintéticos, conversaciones de dominio público y chats derivados de character cards, e incluye explícitamente chats con historial corto para evitar que las respuestas se acorten imitando un historial escueto.

El autor no detalla el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO. Las capacidades de pensamiento interno y seguimiento de estado se entrenaron como llamadas a herramientas (`inner_thoughts` y `track_state`) que el modelo emite antes de su respuesta, con formato de primera persona y aproximadamente 60 palabras en el caso de los pensamientos. El modelo no es un modelo de seguridad ajustado: los datos se filtraron para eliminar contenido sexual, pero no se aplicó alineamiento de seguridad adicional.

## Capacidades

- Generación de texto conversacional orientada a roleplay de personajes, con formato consistente de acciones entre asteriscos y diálogo entre comillas dobles (40/40 en la comprobación de formato declarada por el autor).
- Conversaciones multi-turno con historial corto y largo, con entrenamiento específico para no degradar la longitud ni la calidad de la respuesta en historiales breves.
- Memoria de sesiones anteriores: respuestas que incorporan detalles recordados de interacciones previas (mejora modesta según el autor).
- Llamada a herramientas (`tool-calling`): soporta las herramientas opcionales `inner_thoughts` y `track_state`, invocadas antes de la respuesta y tratadas como privadas.
- Pensamientos internos privados: genera un texto en primera persona de unas 60 palabras antes de responder, sin direcciones de escena entre asteriscos.
- Seguimiento de estado emocional: emite seis valores de 0 a 100 (antes y después) más una razón; el autor advierte que es válido pero sobrerreacciona.
- Multilingüe: no disponible; el modelo declara únicamente inglés.
- Modo thinking de Qwen3: el modelo base lo soporta, pero la model card recomienda desactivarlo (`enable_thinking=False` en MLX, `-rea off` en llama.cpp) para el uso de roleplay.

## Casos de uso

- Roleplay conversacional de personajes en aplicaciones de entretenimiento: el modelo mantiene la coherencia de personaje en sesiones multi-turno gracias al entrenamiento sobre 1.575 chats y al enmascaramiento de la pérdida sobre la respuesta final, lo que evita que imite el estilo de los turnos previos del usuario.
- Chatbots de personajes con memoria entre sesiones: la capacidad de incorporar detalles recordados permite construir asistentes que retoman conversaciones anteriores con el mismo usuario, aunque la mejora declarada en memoria es limitada (3 victorias, 2 derrotas, 11 empates frente a la versión 1.5).
- Simulaciones narrativas interactivas: la generación de pensamientos internos privados permite dotar al personaje de una voz interior que no se muestra al usuario, útil en motores de ficción interactiva que separan estado interno y diálogo visible.
- Sistemas de agentes con herramientas: la integración de `track_state` permite registrar la evolución emocional del personaje turno a turno en una estructura de seis valores numéricos, consumible por lógica externa (por ejemplo, para modular respuestas o desencadenar eventos).
- Prototipado rápido en Apple Silicon: la distribución en formato MLX permite cargar y ejecutar el modelo con `mlx_lm` en equipos con memoria unificada, sin necesidad de GPU dedicada, adecuado para desarrolladores que iteran sobre prompts de personaje en local.
- Despliegue en llama.cpp para entornos con recursos limitados: la versión GGUF Q4_K_M permite ejecutar el modelo en CPU o GPU de gama media mediante `llama-cli`, con la opción de desactivar el bloque de razonamiento visible de Qwen3.
- Investigación sobre ajuste fino con enmascaramiento de pérdida: el modelo sirve como referencia reproducible de una técnica concreta (loss solo en la respuesta final) aplicada a un base reciente, con métricas comparativas publicadas por el autor.

## Benchmarks y rendimiento

Los datos disponibles proceden exclusivamente de la evaluación del autor, con 76 prompts escritos a mano, juicio ciego por dos modelos (nemotron-3-ultra y muse-glimmer-30b), ambos órdenes de comparación y consenso requerido. Los recuentos son victorias de Prism Roleplay 2 / victorias de 1.5 / empates.

| Conjunto de prompts | Juicio estándar | Juicio neutral en longitud |
|---|---|---|
| Todos (76) | 43 / 2 / 31 | 39 / 2 / 34 |
| Escenas individuales (24) | 10 / 0 / 14 | 10 / 0 / 14 |
| Memoria (16) | 3 / 2 / 11 | 3 / 2 / 10 |
| Multi-turno (12) | 7 / 0 / 5 | 7 / 0 / 5 |
| Multi-turno, historial corto (12) | 12 / 0 / 0 | 9 / 0 / 3 |
| Multi-turno, historial largo (12) | 11 / 0 / 1 | 10 / 0 / 2 |
| Respuestas de longitud similar (22) | 9 / 0 / 13 | 10 / 0 / 11 |

Frente al Qwen3-8B base, con 52 prompts y un solo juez (nemotron-3-ultra): 32 / 6 / 14 en el total y 11 / 0 / 1 en multi-turno. La comprobación de formato (asteriscos para acciones, comillas para diálogo) pasó 40/40.

Para las herramientas opcionales, sobre 12 escenas y 2 muestras por herramienta: pensamientos juzgados mejores/peores/empate 5 / 0 / 19; seguimiento de estado 1 / 0 / 23. Llamadas válidas en la build publicada: 23/24 para pensamientos y 23/24 para estado (24/24 con el adaptador sin fusionar). Longitud mediana de pensamiento: 64 palabras (frente a 47 del base). Cambio medio total de estado por paso: 65,6 (frente a 29,1 del base).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud para un modelo denso de 8B: en FP16 requiere aproximadamente 16 GB de pesos más overhead de contexto; en 6-bit, alrededor de 6-7 GB; en 4-bit, alrededor de 4,5-5 GB. Estas cifras son estimaciones genéricas para 8B y no están confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Para FP16, GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100). Para cuantizaciones 4-bit y 6-bit, GPU consumer con 8-12 GB pueden ser suficientes, aunque no hay confirmación oficial.
- Cabe en GPU consumer: previsiblemente sí en cuantización 4-bit (RTX 3060 12 GB, RTX 4070, RTX 4090), y en Apple Silicon mediante MLX con memoria unificada; sin datos de rendimiento publicados.
- Opciones de despliegue: MLX (`mlx_lm`) como librería principal declarada; llama.cpp mediante GGUF (ejemplo con `llama-cli` y Q4_K_M). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| Prism Roleplay 2 Small | 8,19B | No disponible | Roleplay multi-turno con herramientas de pensamiento y estado | Apache 2.0 | safetensors (MLX), GGUF |
| Prism Roleplay 1.5 Small | No disponible | No disponible | Roleplay de una sola escena | No disponible | No disponible |
| Qwen3-8B (base) | 8B | No disponible | Modelo generalista con modo thinking | Apache 2.0 (según base) | safetensors, GGUF |

La comparación con Prism Roleplay 1.5 Small y con Qwen3-8B base está respaldada por las evaluaciones del autor descritas en la sección anterior. No se dispone de comparación con otros modelos de roleplay de terceros en la información proporcionada.

## Limitaciones y advertencias

- Evaluación pequeña y automatizada: 76 y 52 prompts escritos a mano, juzgados por dos modelos de lenguaje, sin evaluación humana. Los dos jueces solo coincidieron en 49 de 76 pares en la comparación principal.
- Posible sesgo de evaluación: uno de los jueces (Muse Glimmer) escribió parte de los pensamientos de entrenamiento, lo que puede favorecer ligeramente al modelo.
- Respuestas más largas que la versión 1.5: mediana de 126 palabras frente a 80, lo que puede no ser deseable en todos los productos.
- Memoria entre sesiones con mejora escasa: 3 victorias, 2 derrotas y 11 empates frente a 1.5.
- Seguimiento de estado sobrerreaccionante: cambia casi todos los valores en casi todos los turnos (cambio medio total de 65,6 frente a 29,1 del base); el autor recomienda tratar los números como aproximados.
- No es un modelo ajustado en seguridad: los datos se filtraron para eliminar contenido sexual, pero el base Qwen3 puede generar cualquier contenido; no debe usarse como capa de moderación.
- Deriva en sesiones muy largas: siendo un modelo de 8B ajustado con LoRA, el autor advierte que las conversaciones prolongadas pueden perder coherencia.
- Idioma limitado al inglés: no hay soporte multilingüe declarado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-8B tiene sus propios términos que deben verificarse por separado.
- Sin datos de benchmarks estándar ni de latencia/throughput publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/prism-roleplay-2-small
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
