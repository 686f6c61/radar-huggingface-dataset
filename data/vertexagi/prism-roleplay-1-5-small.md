# VertexAGI/prism-roleplay-1.5-small

## Resumen

Prism Roleplay 1.5 Small es un modelo de rol de personaje y diálogo inmersivo desarrollado por VertexAGI, ajustado mediante LoRA sobre la base Qwen3-8B. A diferencia de la primera versión, centrada en corregir errores mecánicos del rol, esta iteración prioriza la calidad de prosa: cada muestra del corpus de entrenamiento, real o sintética, debe superar un filtro explícito de calidad antes de incluirse. El resultado es un modelo que produce turnos de rol más ricos y extensos que su base, con una tasa de victoria del 83 % en evaluación ciega frente a Qwen3-8B sin ajustar.

El modelo se distribuye en dos formatos listos para usar: MLX en cuantización 4-bit para Apple Silicon y GGUF Q4_K_M para runtimes basados en llama.cpp. Está pensado para integrarse en frontends de rol como SillyTavern, LM Studio u Ollama, y su licencia Apache 2.0 permite uso comercial sin restricciones. Es una opción ligera y práctica para quien necesite un modelo de rol de 8B con buena prosa y sin depender de APIs de pago.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) con adaptadores LoRA |
| Parametros totales | ~8B (base Qwen3-8B); safetensors registra 1.280.062.464 (adaptador LoRA + pesos cuantizados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (secuencia de entrenamiento); la base Qwen3-8B soporta hasta 32K de forma nativa |
| Tipos de cuantizacion | 4-bit (MLX), Q4_K_M (GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso con atención de ventana deslizante y atención completa intercaladas, y se ajusta mediante LoRA con rango 8, escala 20 y 16 capas modificadas, durante 2.500 iteraciones con una longitud de secuencia de 2.048 tokens. El corpus de entrenamiento combina tres fuentes filtradas de forma independiente: transcripciones reales de rol del foro publico `lemonilia/Roleplay-Forums_2023-04` (solo se conserva el 13 % del corpus bruto), datos sinteticos de la v1 generados con GLM 5.2 y Nemotron-3-Nano, y una nueva tanda sintetica de 3.991 muestras generada con Nemotron-3-Ultra, Super y Nano via NVIDIA NIM. El filtro de calidad exige que cada turno de asistente tenga al menos 230 palabras, 3 parrafos y dialogue (minimo dos comillas); el corpus final consta de 7.570 muestras de entrenamiento y 398 de validacion, con una mediana de 254 palabras y 4 parrafos por turno. La validacion se amplio a 100 lotes por evaluacion para evitar oscilaciones espurias de la loss provocadas por la composicion del lote.

## Capacidades

- Generacion de prosa narrativa inmersiva para rol de personaje, con turnos extensos (mediana de 299 palabras frente a 210 de la base) y estructura de parrafos consistente.
- Dialogo en personaje con presencia de dialogue en el 100 % de las respuestas evaluadas.
- Mantenimiento de personaje a lo largo de conversaciones multi-turno, sin romper la cuarta pared ni dirigirse al lector.
- Adaptacion a generos variados: ocultismo, ciencia ficcion, noir, fantasia, ambientacion belica, entre otros, segun los escenarios de evaluacion.
- Sigue el system prompt de rol con instrucciones de estilo, formato y contenido (prosa fluida, parrafos, dialogue, permanecer en personaje).
- Compatible con tool calling y razonamiento de Qwen3-8B en la medida en que la base los soporta, aunque el ajuste esta orientado a rol conversacional.
- Capacidad de thinking mode heredada de Qwen3; requiere desactivarla en runtimes que no la gestionen automaticamente (p. ej., `-rea off` en llama.cpp).

## Casos de uso

- Rol de personaje en SillyTavern y frontends similares: el modelo se integra via GGUF o MLX y produce turnos de rol extensos y bien formateados, con dialogue y prosa de calidad, ideal para sesiones multi-turno con contextos de hasta 2K tokens de entrenamiento.
- Chatbots de personaje tipo Character.AI: permite desplegar personajes persistentes con personalidad definida y respuestas narrativas, sin depender de APIs externas ni de pago.
- Escritura creativa interactiva: util para co-escribir ficcion por turnos, donde el modelo mantiene la voz del personaje y avanza la escena con descripciones ricas.
- Prototipado de narrativa procedural en juegos: puede generar dialogos de NPC y descripciones de escena en tiempo real, gracias a su licencia Apache 2.0 y su compatibilidad con runtimes locales.
- Generacion de contenido para juegos de rol de mesa: el modelo puede interpretar PNJs, narrar escenas y mantener coherencia argumental en campañas largas, aunque puede derivar en sesiones muy prolongadas.
- Fine-tuning posterior sobre dominios especificos: al ser Apache 2.0 y estar basado en Qwen3-8B, permite continuar el ajuste con LoRA para dominios concretos de rol o ficcion interactiva.
- Evaluacion y comparativa de calidad de rol: su proceso de filtrado de datos y evaluacion ciega documentado lo convierte en una referencia para medir la calidad de prosa en modelos de rol de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona una evaluacion propia con juez ciego por pares (`nvidia/nemotron-3-super-120b-a12b`, presentacion aleatorizada) comparando Prism Roleplay 1.5 Small contra la base Qwen3-8B sin ajustar en 16 escenarios variados:

| Sistema | Victorias vs. base | Palabras medias | Parrafos medios | Dialogue presente | Defectos de formato |
|---|---|---|---|---|---|
| Base Qwen3-8B | — | 210 | 4,2 | 100 % | 1 |
| **Prism Roleplay 1.5 Small** | **83 %** (10V–2D, 4 empates) | 299 | 4,5 | 100 % | 1 |

El modelo supera a la base en juicio ciego de calidad con una estructura de parrafos y presencia de dialogue equivalentes, pero con mayor sustancia por turno.

## Requisitos de hardware

- VRAM estimada: el modelo en 4-bit (MLX o GGUF Q4_K_M) ocupa aproximadamente entre 5 y 6 GB en memoria, por lo que cabe en GPUs de consumo con 8 GB de VRAM o mas.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para inferencia local comoda; tambien compatible con Apple Silicon (M1/M2/M3/M4) via MLX, con 16 GB de RAM unificada como minimo recomendado.
- Opciones de despliegue: `mlx-lm` para Apple Silicon, `llama.cpp` con el flag `-rea off` (o `--reasoning off`) para desactivar el bloque de razonamiento, LM Studio, Ollama y cualquier runtime compatible con GGUF.
- Latencia y throughput: no hay datos publicados por el autor; como referencia, un Qwen3-8B en 4-bit en una RTX 4090 genera aproximadamente 40-60 tokens/s, y en Apple Silicon M2 Pro unos 20-30 tokens/s, aunque estos valores dependen del runtime y la longuitud de contexto.
- Para uso en produccion con multiples usuarios, se puede servir via vLLM o TGI convirtiendo los pesos a formato compatible, aunque el repo no incluye instrucciones explicitas para ello.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| **Prism Roleplay 1.5 Small** | 8B (base Qwen3) | 2K entrenamiento / 32K base | Rol de personaje, calidad de prosa | Apache 2.0 | MLX 4-bit, GGUF Q4_K_M |
| Qwen3-8B (base) | 8B | 32K | Modelo generalista | Apache 2.0 | Multiples |
| Prism Creative 1 Mini | 4B (base Qwen3-4B) | no disponible | Escritura creativa, poesia, edicion | Apache 2.0 | MLX, GGUF |
| Prism Creative 1.5 Mini | 4B (base Qwen3-4B-Instruct-2507) | no disponible | Escritura amplia, estilo, transformacion | Apache 2.0 | MLX, GGUF |

Frente a los modelos Prism Creative, que cubren escritura general y creativa, Prism Roleplay 1.5 Small se especializa en rol conversacional y mantiene la ventaja del tamano 8B para mayor coherencia y riqueza de prosa. Comparado con alternativas comerciales de rol como NovelAI Kayra, ofrece la ventaja de ser completamente local y de codigo abierto, aunque con menor contexto efectivo (2K de entrenamiento) y sin ajustes especificos de jailbreak.

## Limitaciones y advertencias

- Modelo de 8B ajustado con LoRA sobre un dataset moderado (~7.970 ejemplos); puede heredar tendencias estilisticas de los modelos profesores y del corpus de foros de rol.
- Sesiones multi-turno muy largas pueden derivar en perdida de coherencia o desviacion del personaje, segun advierte el propio autor.
- Entrenado exclusivamente en ingles; no soporta otros idiomas de forma fiable.
- La longitud de secuencia de entrenamiento es de 2.048 tokens; aunque la base Qwen3-8B soporta 32K, el modelo no ha sido validado en contextos largos y puede degradarse.
- Con llama.cpp es necesario desactivar el razonamiento explicito (`-rea off`); de lo contrario, el modelo emitira un bloque de razonamiento visible antes de la respuesta en personaje.
- Riesgo de alucinacion y de repetir patrones del corpus de foros, especialmente en escenarios no representados en los datos de entrenamiento.
- Los resultados de la evaluacion ciega provienen de un unico juez (nemotron-3-super-120b) sobre 16 escenarios; no hay benchmarks estandarizados publicados que permitan comparar con otros modelos de rol de forma objetiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VertexAGI/prism-roleplay-1.5-small
- Modelo relacionado Prism Creative 1 Mini: https://huggingface.co/VertexAGI/prism-creative-1-mini
- Modelo relacionado Prism Creative 1.5 Mini: https://huggingface.co/VertexAGI/prism-creative-1-5-mini
- Base del modelo (MLX 4-bit): https://huggingface.co/mlx-community/Qwen3-8B-4bit
