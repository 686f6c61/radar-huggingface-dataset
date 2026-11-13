# YourAris/Aris-3.8-27B-MLX-4bit

## Resumen

Aris 3.8-27B (MLX, 4-bit) es una versión cuantizada a 4 bits del fine-tune Aris 3.8-27B, especializado en tareas de agente de programación y distribuido por el usuario YourAris. El modelo se construye sobre Arete-27B de Nous Research, que a su vez deriva de Qwen3.8-27B del equipo Qwen de Alibaba Cloud. Esta build concreta está pensada para Macs con Apple Silicon y 32 GB de memoria unificada, y se distribuye en formato MLX con safetensors.

El fine-tune original se entrenó mediante iteración experta sobre 247 ejecuciones que superaron los ejercicios de práctica de Python y Rust de Exercism en un bucle de agente real. Sin embargo, el autor advierte que a 4 bits el redondeo de la cuantización anula la mayor parte del efecto del entrenamiento: esta build se comporta de forma prácticamente idéntica a Arete-27B en 4 bits, y solo la versión de 8 bits conserva la reducción de autocorrecciones que introdujo el fine-tune.

La relevancia de esta ficha radica en que documenta con transparencia un caso de cuantización agresiva sobre un fine-tune de agente, incluyendo métricas de acuerdo con la build de 8 bits, pruebas de contexto largo y datos de rendimiento en hardware consumer. Es un ejemplo útil para quienes evalúan si merece la pena desplegar fine-tunes en 4 bits en lugar de usar el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8, tag `qwen3_5`) |
| Parámetros totales | 26.895.993.856 (≈26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como cifra oficial; en la práctica ~63k tokens en un Mac de 32 GB con caché KV de 8 bits |
| Tipos de cuantización | 4 bits afín, group size 64, ~4,5 bits por peso (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), ~15 GB en disco |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.8, con aproximadamente 26,9 mil millones de parámetros. Sobre los pesos bf16 de NousResearch/Arete-27B se aplicó un LoRA entrenado por iteración experta (expert iteration) sobre 247 ejecuciones que resolvieron con éxito ejercicios de Python y Rust de Exercism dentro de un bucle de agente real. Posteriormente, el LoRA se fusionó en los pesos bf16 y se cuantizó con la herramienta de conversión de mlx-lm: cuantización afín, group size 64 y 4,5 bits por peso.

El autor probó también DWQ (que entrena escalas y sesgos de 4 bits hacia el modelo de precisión completa), pero como coincidía con la build de 8 bits menos a menudo que el redondeo simple, esta build usa redondeo plano. La plantilla de chat, con los niveles de esfuerzo de razonamiento de Arete, y los ajustes de generación se mantienen sin cambios respecto al modelo base. El codificador de visión no está incluido: la build es solo texto.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable, incluyendo niveles de esfuerzo de razonamiento heredados de Arete.
- Programación en Python y Rust, reforzada por el fine-tune sobre ejercicios de Exercism.
- Comportamiento de agente multi-paso en bucles reales de resolución de tareas.
- Razonamiento matemático (MATH-500 en la batería de evaluación) y aplicación de reglas de especificación (rangos semver de npm, precedencia de operadores).
- Manejo de contexto largo: 18/18 aciertos con 50k tokens y 17/18 con 100k tokens en la prueba sintética de base de código del autor.
- Compatibilidad con la API de mensajes de Anthropic a través de Aris Server, lo que permite usarlo con Claude Code y otros clientes.
- Soporte de tool calling / function calling: no se documenta explícitamente en la información disponible; el uso como agente se realiza vía Aris Server.
- Capacidades multilingües: limitadas al inglés según la model card; en otros lenguajes de programación distintos de Python y Rust se espera el comportamiento de Arete.
- Sin visión ni audio.

## Casos de uso

- Agente de programación en local sobre Mac: servir el modelo con Aris Server y conectarlo a Claude Code mediante `ANTHROPIC_BASE_URL`, aprovechando que el servidor conoce el modelo por nombre y selecciona esta build en equipos de 32 GB.
- Resolución de ejercicios y katas de Python y Rust: el fine-tune se entrenó sobre este tipo de tareas, por lo que es adecuado para práctica guiada y generación de soluciones con razonamiento paso a paso.
- Análisis de bases de código de tamaño medio: con ~63k tokens de contexto útil en un Mac de 32 GB, puede responder preguntas sobre repositorios enviando el contexto en la conversación, tal como hacen los agentes de código.
- Automatización de tareas de refactorización asistida: integrado en un bucle de agente que lee, edita y verifica archivos, con un presupuesto de "think" para acotar la latencia en problemas difíciles.
- Evaluación de razonamiento con reglas formales: útil para validar implementaciones de parsers de versiones semver o de precedencia de operadores, donde el modelo aplica reglas de especificación.
- Prototipado offline y privado: al ejecutarse íntegramente en Apple Silicon sin llamadas a la nube, encaja en entornos con requisitos de confidencialidad del código.
- Docencia y experimentación con cuantización: sirve como caso de estudio para comparar el efecto de 4 bits frente a 8 bits sobre un fine-tune de agente.

## Benchmarks y rendimiento

Batería de razonamiento del autor (76 ítems: 60 problemas MATH-500 de niveles 1 a 5 y 16 preguntas de aplicación de reglas), con thinking activado:

| Métrica | Arete-27B, 4-bit | Aris 3.8-27B, 4-bit |
|---|---|---|
| Correctas | 71/76 (93,4%) | 70/76 (92,1%) |
| Autocorrecciones por 1.000 tokens de salida | 3,05 | 3,25 |
| Respuestas que alcanzan el límite de tokens | 0 | 0 |

Acuerdo con la build de 8 bits (predicción del siguiente token en 402 posiciones):

| Métrica | Arete-27B, 4-bit | Aris 3.8-27B, 4-bit |
|---|---|---|
| Mismo token top-1 | 90,8% | 92,3% |
| KL media | 0,15 nats | 0,24 nats |

Contexto largo (prueba sintética de base de código, 18 preguntas por tamaño, contexto enviado en la conversación):

| Contexto | Correctas |
|---|---|
| 50k tokens | 18/18 |
| 100k tokens | 17/18 |

Con el mismo contexto de 50k tokens en el system prompt en lugar de en la conversación, esta build obtuvo 12/18 frente a 16/18 de la build de 8 bits. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan 15 GB; en un Mac de 32 GB, Aris Server con caché KV de 8 bits deja espacio para unos 63k tokens de contexto.
- Hardware objetivo: Apple Silicon con 32 GB de memoria unificada; con 48 GB o más se recomienda la build de 8 bits.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este formato MLX; no disponible para CUDA en esta build.
- Cabe en GPU consumer: no aplica en el sentido CUDA; en Macs consumer de 32 GB sí cabe.
- Despliegue: Aris Server (`uv tool install aris-server`) o mlx-lm directamente (`mlx_lm.generate`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: en un M5 Pro, cuatro peticiones simultáneas a una mediana de 11,2 tokens/s cada una (frente a 11,3 de Arete-27B en 4 bits). La lectura de un prompt de 100k tokens tardó unos 18 minutos en un M4 Pro, con un pico de 27 GB de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Aris 3.8-27B MLX 4-bit | ~26,9B | ~63k en 32 GB (práctico) | 4 bits MLX | Apache-2.0 | Esta ficha; se comporta como Arete en 4 bits |
| Aris 3.8-27B MLX 8-bit | ~26,9B | no disponible | 8 bits MLX | Apache-2.0 | Conserva el efecto del fine-tune; requiere 48 GB o más |
| Arete-27B (Nous Research) | ~27B | no disponible | bf16 y otras | Apache-2.0 | Modelo base del fine-tune; alineación de valores propia |
| Qwen3.8-27B (Alibaba Cloud) | ~27B | no disponible | bf16 y otras | Apache-2.0 | Modelo original de la familia; base de conocimiento |

## Limitaciones y advertencias

- A 4 bits, el fine-tune pierde prácticamente todo su efecto: esta build se comporta como Arete-27B en 4 bits y no reduce las autocorrecciones como la build de 8 bits.
- El entrenamiento se limitó a Python y Rust; en otros lenguajes de programación se debe esperar el comportamiento del modelo base.
- Las comparaciones son pequeñas: la batería de razonamiento tiene 76 ítems y las tareas de agente de la build de 8 bits no se ejecutaron a 4 bits.
- El razonamiento puede alargarse en exceso en problemas difíciles; conviene fijar un presupuesto de "think" para controlar latencia y coste.
- Hereda la alineación de valores de Arete-27B y el corte de conocimiento de Qwen3.8-27B; no se especifica la fecha de dicho corte.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está evaluado.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no está afiliado ni respaldado por Alibaba Cloud, Nous Research ni Exercism.
- El despliegue está atado al ecosistema MLX y Apple Silicon; no hay soporte documentado para GPUs NVIDIA ni para motores de inferencia habituales en servidor.
- La lectura de prompts muy largos es lenta (unos 18 minutos para 100k tokens en un M4 Pro), lo que limita su uso interactivo con contextos extensos.
- Claude Code asume una ventana de 200k tokens; es necesario ajustar `CLAUDE_CODE_MAX_CONTEXT_TOKENS` al contexto real que reporta el servidor para evitar desbordamientos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YourAris/Aris-3.8-27B-MLX-4bit
- Build de 8 bits: https://huggingface.co/YourAris/Aris-3.8-27B-MLX-8bit
- Modelo base Arete-27B: https://huggingface.co/NousResearch/Arete-27B
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Aris Server (repositorio): https://github.com/kennysarnoski-jarvis/aris-server
- Sitio del autor: https://youraris.com
