# Walkowicz/kairos-sophron-3.0-4b-mlx

## Resumen

Kairos Sophron 3.0 4B (edición MLX para Apple Silicon) es un ajuste fino del modelo base `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`, desarrollado por Walkowicz / Kairos Architecture Team. Está especializado en ingeniería de software, código limpio y verificación de decisiones, y se distribuye exclusivamente en formato MLX optimizado para el framework Metal de Apple en chips M1, M2, M3 y M4.

El modelo se ha entrenado mediante un pipeline denominado "Two-Phase Zero-Distillation Engine", que combina LoRA SFT y GRPO con RLVR (Reinforcement Learning from Verifiable Rewards) sobre verificadores de ejecución. El resultado es un modelo de 4B parámetros con una fuerte orientación a reducir la verbosidad en las respuestas (un 64,4 % menos de tokens de media, 382 frente a 1.073) manteniendo la corrección funcional en tareas de refactorización y generación de tests.

Su relevancia radica en dos factores: por un lado, ofrece un modelo compacto y cuantizado (4,85 GB en 8 bits y 5 bits, 7,95 GB en BF16) que cabe en memoria unificada de Macs consumer; por otro, su enfoque en verificación por ejecución y en la reducción de "blast radius" de tokens lo hace atractivo para pipelines de CI/CD locales y asistentes de código que operan sin conexión. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de NVIDIA Nemotron Labs Dory1.0-4B), ajuste LoRA SFT + GRPO RLVR |
| Parametros totales | 4B (aproximado, según nombre del modelo y base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, 8-bit affine, 5-bit affine |
| Idiomas soportados | Portugues (pt), ingles (en); proporción 50/50 EN · PT-BR según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `format="mlx"`, shards por tier (bf16/, 8bit/, 5bit/) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`, un transformer de 4B parámetros en precisión bfloat16. Sobre esta base se aplica un pipeline de dos fases: primero un ajuste LoRA SFT (supervised fine-tuning) y después GRPO con RLVR, donde las recompensas provienen de verificadores de ejecución (tests que se ejecutan sobre el código generado). Este esquema de recompensa verificable es el que permite optimizar directamente la corrección funcional y no solo la plausibilidad superficial del texto.

La innovación destacable es la "Zero-Distillation": no se destila de un modelo mayor, sino que el conocimiento se adquiere mediante refuerzo sobre verificadores reales. El resultado reportado es una reducción del 64,4 % en tokens generados (382 de media frente a 1.073 en el modelo de referencia) manteniendo o mejorando la tasa de éxito en la suite de clean-code. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni el contexto máximo soportado.

## Capacidades

- Generación de código en inglés y portugués, con énfasis en refactorización y eliminación de "booleanos residuales" (parámetros booleanos que deberían modelarse como tipos).
- Generación de tests unitarios, incluidos tests en memoria con JUnit 5 (según el ejemplo de la model card).
- Razonamiento orientado a decisiones de ingeniería y verificación de corrección funcional.
- Reducción agresiva de verbosidad: respuestas más cortas y directas (382 tokens de media).
- Soporte de chat multi-turno mediante `chat_template.jinja` incluido en el repositorio.
- Capacidades multilingües limitadas a inglés y portugués (PT-BR).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" explícito.

## Casos de uso

- Refactorización local en Mac: un desarrollador puede cargar el tier de 8 bits (4,85 GB) en un MacBook con M2 o superior y refactorizar métodos con parámetros booleanos residuales sin conexión, aprovechando la reducción de tokens para iterar más rápido.
- Generación de tests unitarios en CI local: el modelo puede producir tests JUnit 5 en memoria para validaciones de tipos (por ejemplo, rechazo de céntimos en un cálculo de impuestos), integrándose en un pipeline previo al commit.
- Asistente de código en el IDE: al ser un modelo de 4B cuantizado, cabe en memoria unificada y puede ejecutarse mediante `mlx-lm` como backend local de un plugin de editor, con latencia baja en chips M3/M4.
- Revisión de código automatizada: su entrenamiento con verificadores de ejecución lo hace adecuado para comprobar que un parche compila y pasa tests antes de proponerlo, reduciendo falsos positivos en revisiones automáticas.
- Educación y formación en código limpio: útil para demostrar refactorizaciones concretas y concisas en inglés o portugués, con respuestas breves que facilitan la lectura en materiales didácticos.
- Prototipado rápido en equipos lusófonos: al cubrir PT-BR e inglés al 50 %, sirve para equipos mixtos que necesitan explicaciones y código en ambos idiomas sin cambiar de modelo.
- Evaluación de pipelines RLVR: investigadores pueden usar este modelo como referencia de un ajuste GRPO+RLVR sobre un base de 4B para comparar curvas de recompensa y verbosidad.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Frozen clean-code suite_v1 | 25/40 (62,5 %) | Suite congelada de evaluación |
| RLVR holdout (mean reward) | 0,813 | 9/15 perfectos con verificadores de ejecución |
| Token blast radius | 382 tokens de media (-64,4 %) | Frente a 1.073 del modelo de referencia |
| Huella de memoria unificada | 4,85 GB (8bit/5bit) / 7,95 GB (BF16) | Memoria unificada Apple Silicon |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 4,85 GB para los tiers de 8 bits y 5 bits; 7,95 GB para BF16. En Apple Silicon se usa memoria unificada, no VRAM dedicada.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4) mediante el framework Metal y MLX. No está pensado para GPU NVIDIA o AMD en este repositorio.
- Cabe en Mac consumer: sí, en cualquier Mac con al menos 8 GB de memoria unificada para el tier de 5 bits u 8 bits; se recomienda 16 GB para margen con el sistema operativo y el contexto.
- Despliegue: `mlx-lm` (Python y CLI). Para GGUF o PyTorch existe el repositorio hermano `Walkowicz/kairos-sophron-3.0-4b`, que permitiría otros runners (llama.cpp, vLLM, TGI) aunque no se detallan en esta ficha.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kairos Sophron 3.0 4B MLX | 4B | no disponible | Apache 2.0 | MLX safetensors (bf16/8bit/5bit) | Especializado en código limpio y verificación; solo Apple Silicon |
| NVIDIA Nemotron Labs Dory1.0-4B | 4B | no disponible | no disponible | BF16 | Modelo base del que deriva; sin el ajuste RLVR |
| Kairos Sophron 3.0 4B (repo estándar) | 4B | no disponible | Apache 2.0 | GGUF y PyTorch | Misma familia, para runners no Apple |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y portugués (PT-BR); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en explicaciones largas o APIs poco comunes; el entrenamiento con verificadores mitiga pero no elimina este riesgo.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación previa.
- Especialización estrecha en ingeniería de software y código limpio; su rendimiento en tareas generales (redacción, matemáticas, conocimiento factual) puede ser inferior al de modelos generalistas del mismo tamaño.
- Solo disponible en formato MLX: no se puede desplegar en GPU NVIDIA sin recurrir al repositorio estándar de la misma familia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar la licencia del modelo base `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`, que no se detalla en la información disponible.
- Los benchmarks reportados (25/40 en clean-code suite, 0,813 de recompensa) provienen del propio autor y no han sido replicados de forma independiente.

## Enlaces

- Hugging Face (MLX): https://huggingface.co/Walkowicz/kairos-sophron-3.0-4b-mlx
- Repositorio estándar GGUF/PyTorch: https://huggingface.co/Walkowicz/kairos-sophron-3.0-4b
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- BENCHMARK.md (dentro del repositorio): https://huggingface.co/Walkowicz/kairos-sophron-3.0-4b-mlx/blob/main/BENCHMARK.md
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
