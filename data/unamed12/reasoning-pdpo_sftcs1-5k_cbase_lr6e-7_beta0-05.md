# unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr6e-7_beta0.05

## Resumen

Este modelo es un ajuste fino (fine-tuning completo, no LoRA) del modelo base Qwen/Qwen3-8B, desarrollado por el usuario unamed12 y publicado en Hugging Face. El nombre del repositorio, `reasoning-pdpo_sftcs1.5k_cbase_lr6e-7_beta0.05`, sugiere un pipeline de entrenamiento orientado al razonamiento que combina SFT (supervised fine-tuning) sobre un conjunto de aproximadamente 1.500 muestras con una etapa de DPO o variante (el sufijo "pdpo" y el parámetro `beta0.05` apuntan a un entrenamiento por preferencias) a una tasa de aprendizaje de 6e-7.

Se trata de un experimento de investigación más que de un modelo listo para producción: el repositorio no incluye model card con datos de entrenamiento, idiomas ni resultados de evaluación, cuenta con cero descargas y cero likes, y el acceso está restringido (requiere aceptar condiciones en Hugging Face). El repositorio ocupa 114,7 GB, un tamaño desproporcionado para un modelo de 8B, probablemente debido a la presencia de múltiples checkpoints o estados del optimizador.

Por su base (Qwen3-8B), hereda una arquitectura transformer densa con modo de pensamiento (thinking mode) y una ventana de contexto amplia, pero cualquier dato concreto sobre el ajuste aplicado debe tratarse con cautela dado que el autor no ha documentado el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.000 millones (aproximado, segun modelo base Qwen3-8B); el safetensors declara 308.224 tensores, no parametros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B, no confirmada por el autor) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion posterior via GPTQ/AWQ/GGUF, no publicada) |
| Idiomas soportados | No disponible |
| Licencia | other (heredada de Qwen3-8B; requiere revisar los terminos del modelo base) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 114,7 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso. Sobre esa base se ha aplicado un fine-tuning completo (`full` en los tags), no un adaptador. El flujo de entrenamiento, deducido del nombre del repositorio, combina un SFT sobre un conjunto de aproximadamente 1.500 ejemplos centrados en razonamiento (`sftcs1.5k`) con una etapa de optimización por preferencias con coeficiente beta de 0,05. La tasa de aprendizaje indicada es 6e-7.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO clásico u otra variante, ni sobre innovaciones técnicas adicionales más allá de las que ya incorpora Qwen3-8B (modo de pensamiento y transformer estándar). El tamaño del repositorio (114,7 GB) sugiere la inclusión de checkpoints intermedios o estados del optimizador junto a los pesos finales.

## Capacidades

- Generación de texto conversacional, con etiqueta `conversational` en los metadatos.
- Razonamiento: el nombre del modelo y el pipeline indican un enfoque explícito en tareas de razonamiento, aunque no hay evaluación publicada que lo respalde.
- Generación de código y matemáticas: capacidades heredadas de Qwen3-8B, no verificadas en este ajuste.
- Tool calling / function calling: probablemente heredado de Qwen3-8B, no confirmado por el autor.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; los idiomas no están declarados.
- Modo de pensamiento (thinking mode): heredado de la arquitectura Qwen3, sin confirmar que se preserve tras el ajuste.

## Casos de uso

- Investigación sobre ajuste fino por preferencias: el modelo sirve como referencia para reproducir pipelines SFT + DPO sobre Qwen3-8B, dado que el nombre codifica hiperparámetros concretos (lr 6e-7, beta 0,05, conjunto de 1,5k ejemplos).
- Experimentos académicos de razonamiento: útil para comparar el efecto de un SFT pequeño combinado con preferencias frente al modelo base, siempre que se acceda al repositorio bajo las condiciones del autor.
- Generación de texto conversacional en entornos controlados: puede desplegarse con transformers para prototipos de chat, aunque sin garantías de calidad por falta de evaluación.
- Baseline para comparativas internas: un equipo que entrene sus propios ajustes de Qwen3-8B puede usar este modelo como punto de comparación en tareas de razonamiento.
- Estudio de la degradación por sobreajuste: con solo 1.500 ejemplos de SFT, es un caso interesante para analizar cuánto se pierde de las capacidades del modelo base.
- Docencia y formación: como ejemplo práctico de un pipeline de entrenamiento por preferencias con hiperparámetros explícitos en el nombre del repositorio.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados (array vacío). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos.
- VRAM estimada en cuantización de 4 bits (si se generara GGUF): en torno a 5-6 GB.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB, justo al límite con contexto largo).
- GPU consumer: cabe en RTX 4090 y, con cuantización a 4 bits, en GPUs de 8-12 GB como RTX 3060/4060.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama/vLLM serían viables tras conversión a GGUF o con los pesos safetensors en vLLM, aunque no están documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr6e-7_beta0.05 | ~8B | No disponible | other (gated) | Acceso restringido, 0 descargas |
| Qwen/Qwen3-8B | 8B | Amplia (segun Qwen3) | Apache 2.0 (modelo base) | Publico, ampliamente usado |
| unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2 | ~8B | No disponible | other | Publico segun la busqueda, variante del mismo autor |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Publico |

No hay datos de rendimiento para comparar; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card con datos de entrenamiento, idiomas, evaluación ni sesgos conocidos.
- Riesgo elevado de alucinación y de sobreajuste: un SFT con solo 1.500 ejemplos puede degradar capacidades generales del modelo base.
- Resultados de benchmarks vacíos: no hay evidencia de mejora frente a Qwen3-8B.
- Licencia "other" heredada del modelo base: es imprescindible revisar los términos de Qwen3-8B antes de cualquier uso comercial.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que limita su uso en pipelines automatizados.
- Idiomas no declarados: no se puede garantizar un comportamiento multilingüe correcto.
- Repositorio de 114,7 GB: la descarga y el almacenamiento son costosos para un modelo de 8B.
- Cero descargas y cero likes: no hay validación por parte de la comunidad.
- Fecha de creación futura (2026-11-05): puede indicar metadatos erróneos o un repositorio de prueba.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr6e-7_beta0.05
- Variante del mismo autor: https://huggingface.co/unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2
- Perfil del autor: https://huggingface.co/unamed12
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
