# WendaYu/pi0-base-for2wu

## Resumen

El modelo `WendaYu/pi0-base-for2wu` es un checkpoint base en PyTorch del modelo π₀ (pi-zero), un sistema de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y adaptado por el autor WendaYu para un flujo de entrenamiento específico denominado "two-Wu". Este checkpoint sirve como backbone congelado para entrenar el modelo completo `WendaYu/pi0-base-two-wu`, que combina un VLM basado en Gemma 2B con un experto de acción Gemma 300M, alcanzando un total de 3.501.372.176 parámetros.

El modelo está diseñado para robótica: recibe observaciones visuales e instrucciones en lenguaje natural y genera secuencias de acciones de 50 pasos (action horizon) con 32 dimensiones de acción. Su relevancia radica en que proporciona una base reproducible y verificable (con hash SHA-256) para continuar entrenamientos de VLA, evitando inconsistencias entre checkpoints. Es un modelo base, no fine-tuneado, orientado a investigadores que necesitan un punto de partida estable para experimentos de manipulación robótica.

La conversión desde el checkpoint JAX original se realizó con el código de conversión `openpi-wu`, y el repositorio incluye los pesos en formato safetensors, configuración y metadatos de identidad. La licencia es "other", con restricciones adicionales derivadas de los términos de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basado en flow matching: VLM Gemma 2B + experto de acción Gemma 300M |
| Parametros totales | 3.501.372.176 (3,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponibles (modelo orientado a robótica, no a texto general) |
| Licencia | other (código Apache-2.0; pesos derivados de Gemma sujetos a LICENSE_GEMMA.txt) |
| Formato de pesos | safetensors (model.safetensors, 7.002.873.776 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀ de Physical Intelligence: un modelo de difusión basado en flow matching que combina un VLM (Gemma 2B) para procesar observaciones visuales y lenguaje, con un experto de acción (Gemma 300M) que genera secuencias de acciones. La dimensión de acción es 32 y el horizonte de acción es 50 pasos. La precisión base es bfloat16.

El entrenamiento se realizó en dos etapas, según la model card: una etapa VLM-Wu de 60.000 pasos de optimizador y una etapa Action-Wu de 85.000 pasos, publicadas en el checkpoint resumible `WendaYu/pi0-base-two-wu`. Este repositorio contiene el backbone congelado utilizado en ambas etapas. No se proporcionan detalles sobre el dataset de entrenamiento (número de tokens, composición) ni sobre técnicas de alineación como RLHF o DPO. La conversión desde JAX a PyTorch se hizo con el código `openpi-wu`, y el modelo valida la integridad del checkpoint mediante SHA-256 antes de cargar pesos.

## Capacidades

- Generación de acciones robóticas: dado un flujo de observaciones visuales (imágenes de cámaras) y una instrucción en lenguaje natural, produce una secuencia de 50 acciones con 32 dimensiones (por ejemplo, posiciones de articulaciones o comandos de efector final).
- Modelo base para fine-tuning: no está entrenado para tareas específicas, pero sirve como punto de partida para adaptarlo a datasets propios de manipulación.
- Integración con el ecosistema openpi: compatible con el código de entrenamiento e inferencia de `openpi-wu` y con el framework `openpi` de Physical Intelligence.
- Verificación de integridad: incluye un hash SHA-256 que permite validar que los pesos no han sido alterados, útil para reproducibilidad en entornos de investigación.
- No incluye capacidades de tool calling, agentes conversacionales ni procesamiento de lenguaje general; su dominio es exclusivamente robótico.

## Casos de uso

- Fine-tuning para manipulación robótica en laboratorio: investigadores pueden cargar este checkpoint base y entrenarlo con datasets propios (por ejemplo, tareas de recogida y colocación) usando el código `openpi-wu`, aprovechando que el backbone ya ha sido preentrenado en 10.000+ horas de datos de robots (según la documentación de openpi).
- Reproducción de experimentos de VLA: al ser un checkpoint congelado y verificado, permite reproducir exactamente los resultados del entrenamiento two-Wu, comparando variantes de hiperparámetros sin variabilidad de inicialización.
- Desarrollo de políticas de control para brazos robóticos: el modelo genera acciones de 32 dimensiones con horizonte de 50 pasos, adecuado para control de efector final en tareas de precisión.
- Evaluación de arquitecturas de VLA: al tener una configuración fija (Gemma 2B + Gemma 300M), sirve como baseline para probar modificaciones en el experto de acción o en el codificador visual.
- Investigación en aprendizaje por imitación: el modelo puede ser fine-tuneado con demostraciones humanas para aprender nuevas habilidades, gracias a su naturaleza de modelo base.
- Benchmarking de frameworks de conversión: el proceso de conversión JAX→PyTorch documentado en este repositorio puede servir como referencia para otros equipos que necesiten portar checkpoints de openpi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no incluye métricas de rendimiento en tareas como MMLU, HumanEval o GSM8K, ni resultados en benchmarks robóticos específicos (por ejemplo, LIBERO). El autor no proporciona comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 7 GB (3,5B parámetros × 2 bytes). Para inferencia con batch pequeño, se recomienda al menos 12 GB de VRAM para dejar margen para activaciones y overhead.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para inferencia y fine-tuning ligero. Una RTX 4080 (16 GB) podría funcionar con batch reducido. Para entrenamiento completo (fine-tuning de todas las capas), se recomienda una A100 (40 GB) o H100 (80 GB).
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer de gama alta (24 GB) sin cuantización. Con cuantización a 8 bits (no disponible en este repo, pero posible con herramientas externas), podría caber en 8 GB.
- Opciones de despliegue: el modelo está en formato PyTorch/safetensors, por lo que puede cargarse con Hugging Face Transformers o con el código `openpi-wu`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponible. Depende del hardware y del tamaño de lote; al ser un modelo de difusión con 50 pasos de acción, la latencia será mayor que un modelo autoregresivo equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WendaYu/pi0-base-for2wu | 3,5B | VLA (Gemma 2B + Gemma 300M) | No disponible | other (Gemma) | Hugging Face |
| lerobot/pi0_base | 3,5B (estimado) | VLA (Gemma 2B + Gemma 300M) | No disponible | Apache-2.0 (código) | Hugging Face, ModelScope |
| pi0-FAST (openpi) | No disponible | VLA autoregresivo con tokenizador FAST | No disponible | Apache-2.0 (código) | GitHub, Hugging Face |

La comparativa se basa en la información pública de los repositorios. `lerobot/pi0_base` es el checkpoint base oficial de la comunidad LeRobot, mientras que `pi0-FAST` es una variante autoregresiva. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo base sin fine-tuning: no está entrenado para tareas específicas; su uso directo en robótica real requiere adaptación a un dataset concreto.
- Licencia restrictiva: aunque el código es Apache-2.0, los pesos derivados de Gemma están sujetos a los términos de `LICENSE_GEMMA.txt`, que pueden limitar el uso comercial. El usuario debe revisar y cumplir dichos términos.
- Sin datos de idiomas: no se especifican idiomas soportados; el modelo está orientado a instrucciones robóticas, probablemente en inglés, pero no está documentado.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir secuencias de acciones inválidas o inseguras si se usa sin supervisión. No se han documentado sesgos específicos.
- Contexto limitado: no se conoce la longitud de contexto; el modelo procesa observaciones visuales y texto, pero no se especifica el límite de tokens de entrada.
- Dependencia de la integridad del checkpoint: el modelo rechaza pesos que no coincidan con el hash SHA-256, lo que puede dificultar la interoperabilidad con otros frameworks si no se usa el código `openpi-wu`.
- Fecha de creación futura (2026): el repositorio fue creado en agosto de 2026, lo que sugiere que es un proyecto reciente y posiblemente en fase experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WendaYu/pi0-base-for2wu
- Modelo entrenado asociado: https://huggingface.co/WendaYu/pi0-base-two-wu
- Checkpoint base de LeRobot: https://huggingface.co/lerobot/pi0_base
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Repositorio openpi-wu (código fuente de conversión): https://github.com/SunnyYWD/openpi-wu
- Repositorio alternativo PI_Official: https://github.com/Spirit-AI-Team/PI_Official
- Modelo en ModelScope: https://www.modelscope.cn/models/lerobot/pi0_base
