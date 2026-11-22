# VertexAGI/codeinluau-1-small

## Resumen

CodeInLuau 1 Small es un modelo especializado en autocompletado de código Luau, el dialecto de Lua que utiliza Roblox. Lo desarrolla VertexAGI como primera entrega de la familia CodeIn, una línea de modelos en la que cada variante se destila para un único lenguaje de programación en lugar de cubrir un espectro generalista. El modelo parte de Qwen3-8B, un transformer denso de 8.190.735.360 parámetros, y se ajusta mediante LoRA sobre un corpus de código Luau real escrito por humanos.

El problema que aborda es concreto: los modelos generalistas tienden a romper el modo de completado y producir código sintácticamente inválido o directamente de otro lenguaje cuando se les alimenta con un prefijo de script Luau. Según la evaluación del autor sobre 100 prompts del split de test oficial, la tasa de errores de sintaxis reales (medida con el parser `luau-analyze`) baja del 18 % en el modelo base al 2 % tras el ajuste.

La relevancia actual del modelo es doble: por un lado, demuestra un patrón de especialización por lenguaje con coste de entrenamiento bajo (LoRA de rango 8 sobre 19.608 ejemplos); por otro, está empaquetado exclusivamente en formato MLX de 4 bits para Apple Silicon, lo que lo hace directamente desplegable en Macs con `mlx-lm` sin necesidad de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste LoRA |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia de entrenamiento); contexto nativo del base Qwen3-8B no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits, group size 64 (unico formato publicado) |
| Idiomas soportados | Ingles (el codigo Luau es el dominio principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, `model.safetensors` en la raiz del repo) |

## Arquitectura y entrenamiento

El modelo es un Qwen3-8B de arquitectura transformer pura, cuantizado a 4 bits (group size 64) y ajustado con LoRA de rango 8, escala 20 y 16 capas, durante 3.000 iteraciones con batch size 1 y longitud de secuencia 2.048. El dataset es `Roblox/luau_corpus`, compuesto íntegramente por código Luau real escrito por humanos, sin generación sintética: 19.608 ejemplos de entrenamiento y 4.352 de validación, cada uno un par prefijo/continuación extraído de experiencias reales de Roblox. El entrenamiento se plantea como completado de texto plano, sin plantilla de chat, lo que condiciona por completo el modo de uso.

Un detalle técnico relevante es el cambio de base: el diseño original preveía Qwen3.5-9B-4bit, pero sus capas híbridas de atención lineal provocaban un fallo confirmado en el backward pass de LoRA en `mlx-lm` (error de memoria en Metal, reproducido de forma independiente en varias generaciones de chip y tamaños de modelo, issue ml-explore/mlx-lm#1206). El autor migró a la generación anterior, un transformer puro que entrena sin problemas. La pérdida de validación cerró en 1,342, partiendo de 1,466.

## Capacidades

- Completado de código Luau a partir de un prefijo: scripts parciales, firmas de función o comentarios.
- Patrones idiomáticos de Roblox: servicios (`game:GetService`), eventos (`PlayerAdded`, `Connect`), `leaderstats`, tweens, debounce y retorno de módulos.
- Generación de continuaciones sintácticamente válidas según el parser oficial `luau-analyze` en la gran mayoría de los casos evaluados.
- Modo de completado puro, no conversacional: no responde a preguntas ni sigue instrucciones.
- Sin soporte de tool calling ni function calling documentado.
- Sin capacidades de agente, razonamiento multi-paso, visión ni audio.
- Multilingüismo limitado: el modelo declara únicamente inglés como idioma, y su dominio funcional es el código Luau.

## Casos de uso

- Autocompletado en editores para desarrolladores de Roblox: integrado como motor de continuación tras un prefijo de script, reduce la tasa de errores de sintaxis reales al 2 % frente al 18 % del base, lo que disminuye las interrupciones por código inválido en el flujo de edición.
- Generación de esqueletos de script en Roblox Studio: dado un comentario o una firma de función, el modelo completa la estructura típica (obtención de servicio, creación de instancia, conexión de evento), útil para prototipado rápido de mecánicas.
- Asistencia en pipelines de revisión de código Luau: al producir continuaciones plausibles y sintácticamente correctas, sirve para generar candidatos que luego se validan con `luau-analyze` antes de la revisión humana.
- Herramientas educativas de scripting para Roblox: el modelo completa ejemplos canónicos (leaderstats, debounce en eventos) con patrones reales extraídos de experiencias en producción, adecuado para materiales de aprendizaje.
- Desarrollo local en Apple Silicon: al estar empaquetado en MLX 4 bits (4,61 GB), se ejecuta en Macs sin GPU dedicada mediante `mlx-lm`, lo que permite tener el autocompletado en local sin enviar código propietario a servicios externos.
- Migración y modernización de scripts Lua a Luau: el modelo conoce las construcciones idiomáticas del dialecto (tipos, `continue`, varargs) y puede proponer continuaciones alineadas con las convenciones de Roblox.
- Generación de tests de humo para módulos Luau: a partir de la firma y el cuerpo parcial de un módulo, completa llamadas de ejemplo que después se ejecutan en un entorno de pruebas.

## Benchmarks y rendimiento

Evaluación del autor sobre 100 prompts del split de test oficial de `luau_corpus`, comparando continuaciones del base y del modelo ajustado con el parser real `luau-analyze`:

| Resultado | Base Qwen3-8B | CodeInLuau 1 Small |
|---|---|---|
| Completamente limpio | 23 | 76 |
| Solo truncamiento (artefacto del límite de tokens) | 59 | 21 |
| Error de sintaxis real | 18 | 2 |

El autor señala además que los fallos del base son cualitativamente peores: en varios prompts abandona Luau por completo, alucinando comentarios estilo C (`//`) o generando SQL. Los fallos del ajustado son errores menores y plausibles (`:` donde corresponde `.`, `...` fuera de un closure con varargs). Una evaluación previa con 10 prompts escritos a mano sugería que el base salía del modo completado hacia narración conversacional; ese resultado no se replicó a n=100 sobre el corpus real (0/100 en ambos modelos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 4,6 GB en 4 bits; en Apple Silicon unificada se recomienda al menos 8 GB de memoria para cargar el modelo con margen para el contexto.
- GPU recomendadas: el formato publicado es MLX, pensado para Apple Silicon (series M1 a M4). No hay build GGUF ni safetensors fp16, por lo que no se ofrece una ruta directa para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier Mac con memoria unificada suficiente; en GPUs NVIDIA o AMD no hay formato publicado que permita cargarlo sin conversión manual.
- Opciones de despliegue: `mlx-lm` (vía `load` y `generate`). No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, y el autor indica que no se proporciona GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formatos |
|---|---|---|---|---|---|
| CodeInLuau 1 Small | 8,19 B | 2.048 (entrenamiento) | Luau / Roblox | Apache 2.0 | MLX 4 bits |
| Qwen3-8B (base) | 8,19 B | no disponible en la información | Generalista | Apache 2.0 | safetensors, GGUF, MLX |
| Modelos de autocompletado generalistas (p. ej. variantes de Qwen2.5-Coder) | no disponible | no disponible | Multi-lenguaje | no disponible | no disponible |

La comparación directa más informativa es contra su propio base: mismo tamaño y licencia, pero el ajustado reduce los errores de sintaxis reales de 18 a 2 sobre 100 prompts. Frente a un modelo generalista multi-lenguaje, CodeInLuau renuncia explícitamente a la cobertura amplia a cambio de fidelidad en un único dialecto. No se dispone de datos de benchmarks comparables con alternativas especializadas en Luau en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de completado, no de chat: alimentarlo con preguntas produce resultados fuera de distribución.
- Entrenado con ~20.000 ejemplos y LoRA de rango 8: cubre patrones comunes de Roblox, pero no es infalible.
- No conoce la jerarquía de objetos ni las APIs personalizadas de un juego concreto; las continuaciones deben revisarse antes de desplegarse.
- Riesgo de alucinación presente, aunque acotado en la evaluación: el 2 % de errores de sintaxis reales convive con truncamientos que pueden parecer código incompleto.
- Idioma declarado únicamente inglés; el rendimiento en comentarios o identificadores en otros idiomas no está documentado.
- Longitud de secuencia de entrenamiento de 2.048 tokens: los scripts largos pueden quedar fuera del régimen para el que fue ajustado.
- Licencia Apache 2.0 heredada de Qwen3, sin restricciones comerciales conocidas; conviene verificar los términos del corpus `Roblox/luau_corpus` si se redistribuyen derivados.
- Solo hay formato MLX 4 bits: no es desplegable en infraestructura NVIDIA sin una conversión manual no soportada por el autor.
- El fallo upstream de `mlx-lm` con atención lineal híbrida sigue abierto; si se intenta reproducir el entrenamiento sobre Qwen3.5-9B, se encontrará el mismo bloqueo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/codeinluau-1-small
- Dataset de entrenamiento: https://huggingface.co/datasets/Roblox/luau_corpus
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Issue del bug de `mlx-lm` con atención lineal híbrida: https://github.com/ml-explore/mlx-lm/issues/1206
