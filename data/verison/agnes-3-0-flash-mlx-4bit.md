# verison/Agnes-3.0-Flash-MLX-4bit

## Resumen

Agnes-3.0-Flash-MLX-4bit es una cuantización a 4 bits en formato MLX del modelo Agnes-3.0-Flash, publicado por Agnes-AI y convertido por el usuario verison. El modelo base implementa la arquitectura Qwen3.5 y tiene 32.205.067.008 parámetros (~32,2 B) en 72 capas, con un contexto de 262.144 tokens y licencia Apache-2.0. El objetivo de esta conversión es que el modelo cargue sin código personalizado en mlx-lm y en el motor MLX de LM Studio como un `qwen3_5` estándar.

La peculiaridad técnica del modelo es su atención híbrida: 54 capas de atención lineal gated delta-net y 18 capas de atención completa con puerta, además de un FFN paralelo (un segundo SwiGLU de anchura 2048 cuy salida se suma al principal de anchura 17408). Esta conversión pliega esa suma en un único SwiGLU equivalente de anchura 19456 mediante concatenación pura de pesos, sin aritmética adicional.

Es relevante ahora porque permite ejecutar un modelo de 32 B con contexto de 262.144 tokens en hardware Apple Silicon con memoria unificada, con pesos de 17 GB en 4 bits (4,50 bits/peso) y soporte de decodificación especulativa (n-gram prompt-lookup y el drafter DFlash2) para acelerar la inferencia. Se trata de una conversión estrictamente de texto: no incluye la torre de visión ni la cabeza MTP del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Qwen3.5): 54 capas de atención lineal gated delta-net + 18 capas de gated full attention, 72 capas |
| Parámetros totales | 32.205.067.008 (~32,2 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 4 bits affine, group size 64 (4,50 bits/peso) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); el autor menciona un equivalente GGUF en un repositorio complementario |
| Tamaño del repositorio | 18,1 GB |
| Modelo base | Agnes-AI/Agnes-3.0-Flash |
| Librería | mlx (mlx-lm 0.31.3, mlx 0.32) |
| Pipeline | text-generation |
| Normativa | RMSNorm con forma `(1 + w)` |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3.5. Según la model card, comparte dimensiones, parámetros de RoPE, RMSNorm `(1 + w)`, torre de visión y tokenizador con `Qwen/Qwen3.8-27B` (cuyo `model_type` es `qwen3_5`). Las diferencias son: 72 capas en lugar de 64, tensores renombrados (`delta_attn` → `linear_attn`, `global_attn` → `self_attn`) y el citado FFN paralelo. El reparto de atención es 54 capas lineales (gated delta-net) y 18 capas de atención completa, coherente con un `full_attention_interval: 4` sobre 72 capas.

La conversión a MLX se realizó con un pipeline de fusión perezosa (lazy-merge) que lee los shards originales y pliega el FFN paralelo en tiempo de carga, sin generar una copia intermedia en bf16. La identidad matemática aplicada es que la suma de dos SwiGLU equivale a un único SwiGLU de anchura combinada: `y = D1·(silu(G1x) ⊙ U1x) + D2·(silu(G2x) ⊙ U2x) = [D1 | D2] · (silu([G1;G2]x) ⊙ [U1;U2]x)`. Por tanto la conversión es pura concatenación (`gate = [G1;G2]`, `up = [U1;U2]`, `down = [D1|D2]`) y el config se reescribe a `intermediate_size: 19456`. El autor indica verificación numérica con concordancia a nivel de redondeo bf16 y validación por perplejidad sobre prosa reservada tras la cuantización. La cuantización se hizo con `mlx_lm.convert -q --q-bits 4 --q-group-size 64`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El modo de razonamiento se controla mediante la plantilla de chat original con los parámetros `enable_thinking` y `reasoning_effort`.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Modo de razonamiento activable o desactivable mediante `enable_thinking`, con nivel de esfuerzo ajustable vía `reasoning_effort`.
- Procesamiento de contextos muy largos: hasta 262.144 tokens, con caché KV restringida a las 18 capas de atención completa gracias a las 54 capas de atención lineal.
- Carga directa como modelo `qwen3_5` en mlx-lm y en el motor MLX de LM Studio, sin código específico de `agnes`.
- Decodificación especulativa: drafting n-gram (prompt-lookup) y compatibilidad con el drafter `z-lab/Qwen3.8-27B-DFlash2`.
- Solo texto: la torre de visión y la cabeza MTP no están incluidas en esta conversión.
- Soporte de tool calling o function calling: no documentado en la información disponible.
- Capacidades de agente multi-paso: no documentadas explícitamente en la información disponible, más allá del modo thinking.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente de código local en Mac: con 32,2 B de parámetros y contexto de 262.144 tokens, el modelo puede mantener en memoria varios ficheros de un repositorio mediano y responder sobre ellos sin fragmentar el contexto en trozos pequeños.
- Edición y refactorización masiva de código: el autor reporta ~5× de aceleración con drafting n-gram (prompt-lookup) en cargas de edición y copia, lo que hace viable aplicar transformaciones repetitivas sobre muchos ficheros en una sesión interactiva.
- Revisión de documentación técnica extensa: informes, RFCs o especificaciones de decenas de miles de tokens caben en una sola ventana, con resumen y extracción de decisiones sin pipeline de RAG.
- Atención al cliente bilingüe inglés-chino: el modelo cubre ambos idiomas de forma nativa, adecuado para organizaciones que atienden a usuarios de esos dos mercados.
- Análisis y razonamiento con modo thinking: tareas de matemáticas, análisis lógico o planificación donde interesa activar `enable_thinking` y subir `reasoning_effort`, desactivándolo después para reducir latencia y coste.
- Procesamiento con privacidad de datos: al ejecutarse íntegramente en local sobre Apple Silicon, permite tratar información sensible (legal, médica, financiera) sin enviarla a APIs externas.
- Generación nueva con decodificación especulativa: usando el drafter DFlash2 se obtiene un factor de 1,3–2× en generación desde cero, útil en asistentes interactivos donde la latencia percibida importa.
- Prototipado offline en portátiles: gracias a los 17 GB de pesos en 4 bits, es posible desarrollar y evaluar un modelo de 32 B en un equipo de trabajo sin acceso a clúster con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona verificación numérica frente al modelo base (concordancia a nivel de redondeo bf16) y validación por perplejidad sobre prosa reservada, sin cifras concretas. Tampoco se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite. Como referencia de rendimiento relativo, el autor sí reporta aceleraciones de decodificación especulativa medidas en un M4 Max a 4 bits: ~5× con drafting n-gram en cargas de edición y copia, y 1,3–2× con el drafter `z-lab/Qwen3.8-27B-DFlash2` en generación nueva.

## Requisitos de hardware

- Peso de los pesos: 17 GB en 4 bits (4,50 bits/peso); el repositorio completo ocupa 18,1 GB.
- Memoria unificada estimada para inferencia: ~18–20 GB como mínimo para cargar el modelo con overhead del runtime; 32 GB o más recomendable para trabajar con contextos largos, ya que la caché de las 18 capas de atención completa crece con el contexto.
- Cómputo: exclusivamente Apple Silicon (MLX no tiene backend CUDA). El autor reporta mediciones en un M4 Max.
- GPU consumer de tipo RTX 4090, A100 o H100: no soportadas por esta conversión MLX. El autor menciona un equivalente GGUF en un repositorio complementario, que sería la vía para ejecutar en GPUs NVIDIA o en CPU mediante llama.cpp.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`), motor MLX de LM Studio (colocando la carpeta en `~/.lmstudio/models/<publisher>/`), y el GGUF complementario para llama.cpp u Ollama.
- Latencia y throughput absolutos: no disponibles. Solo se documentan los factores de aceleración relativa por decodificación especulativa indicados en el apartado anterior.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| verison/Agnes-3.0-Flash-MLX-4bit | ~32,2 B | 72 (54 lineales + 18 full) | 262.144 tokens | 4 bits MLX, group size 64 | Apache-2.0 | HuggingFace, formato MLX safetensors |
| Agnes-AI/Agnes-3.0-Flash (base) | ~32,2 B | 72 | 262.144 tokens | bf16 y otras no detalladas | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B | no disponible en la información proporcionada | 64 | no disponible | no disponible | no disponible | HuggingFace |

La comparación se limita a los datos aportados en la model card. El modelo base es la referencia directa (misma arquitectura, sin cuantizar, con torre de visión y cabeza MTP). `Qwen/Qwen3.8-27B` se cita únicamente como referencia arquitectónica (mismas dimensiones, RoPE y tokenizador; 64 capas frente a 72), sin que se disponga de sus especificaciones completas en la información disponible.

## Limitaciones y advertencias

- Modelo solo de texto: la torre de visión y la cabeza MTP del modelo base no están incluidas en esta conversión, por lo que no se pueden usar entradas de imagen.
- Idiomas limitados a inglés y chino. No hay soporte declarado de castellano ni de otros idiomas, lo que puede degradar la calidad en esos casos.
- La cuantización a 4 bits introduce pérdida de precisión respecto al modelo base. El autor afirma validación por perplejidad tras la cuantización, pero no publica cifras que permitan cuantificar la degradación.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad factual ni tasas de alucinación.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de alineación en la información disponible.
- Requiere Apple Silicon. No es desplegable en GPUs NVIDIA o AMD a través de MLX; para CUDA hay que recurrir a la conversión GGUF mencionada, cuyo estado y paridad no se detallan.
- La compatibilidad con el drafter DFlash2 no ofrece la misma aceleración en generación nueva (1,3–2×) que el drafting n-gram en cargas de edición (~5×); conviene elegir la estrategia según el caso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción nula y, por tanto, poca validación externa independiente.
- Licencia Apache-2.0 en el modelo base y en la conversión, lo que permite uso comercial, pero el autor de la conversión no ofrece garantías adicionales; conviene verificar los términos del repositorio base antes de un despliegue en producción.
- No se documentan límites de tasa, requisitos de atribución específicos ni restricciones de uso aceptable más allá de la propia licencia Apache-2.0.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/verison/Agnes-3.0-Flash-MLX-4bit
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Referencia arquitectónica citada: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter de decodificación especulativa citado: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio complementario con herramientas de conversión y equivalente GGUF: mencionado en la model card sin URL disponible
- Resultados de búsqueda web: no se ha encontrado ningún resultado relevante sobre el modelo en la búsqueda realizada
