# sunione/npa-checkpoints

## Resumen

El repositorio `sunione/npa-checkpoints` contiene los checkpoints de política de ruido (noise policy, denotada como `pi_psi`) del proyecto *Noisy Policy Alignment*. Este proyecto entrena una política de ruido que se aplica al proceso de difusión de un generador de imágenes congelado (`g_theta`), con el objetivo de alinear el comportamiento del modelo de difusión con recompensas estéticas o de otro tipo mediante optimización de políticas (GRPO). Es decir, en lugar de ajustar el modelo generador completo, se aprende una perturbación de ruido que modifica la trayectoria de muestreo para maximizar una recompensa.

El repositorio contiene 44 checkpoints de distintas ejecuciones (runs), con un peso total de 7,94 GB. Cada archivo corresponde al checkpoint de mayor paso (step) de cada ejecución, y los nombres de los directorios codifican los hiperparámetros del entrenamiento (policy_type, K, G, B, lr, kl, reg_type, sigma, schedule, seed, steps). Se incluyen ejecuciones sobre arquitecturas base como SDXL-Turbo, FLUX (schnell y dev), y Sana, con variantes de LoRA y diferentes esquemas de regularización.

La relevancia de este proyecto radica en que propone un método de alineación de modelos de difusión sin modificar el generador base, lo que puede reducir costes de entrenamiento y preservar las capacidades originales del modelo. No se trata de un modelo de lenguaje ni de un modelo generativo completo, sino de un componente de control de ruido para modelos de difusión ya existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de ruido (noise policy) para modelos de difusión; no es un modelo generativo completo |
| Parametros totales | No disponible (cada checkpoint es la política de ruido, no el generador) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | No disponible (solo se proporcionan pesos en formato PyTorch) |
| Idiomas soportados | No disponible (modelo de imagen) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (archivos `.pt`) |

## Arquitectura y entrenamiento

El proyecto se basa en la idea de alinear modelos de difusión mediante una política de ruido aprendida. El generador de imágenes (`g_theta`) permanece congelado y no se incluye en el repositorio; lo que se entrena es una política `pi_psi` que modifica el ruido en cada paso de la difusión. El entrenamiento utiliza GRPO (Group Relative Policy Optimization), un método de optimización de políticas que maximiza una recompensa (por ejemplo, una puntuación estética) mientras se aplica una regularización KL para no alejarse demasiado del comportamiento original.

Los directorios de las ejecuciones indican los hiperparámetros utilizados: tipo de política, número de pasos de difusión (K), tamaño de grupo (G), tamaño de batch (B), tasa de aprendizaje (lr), coeficiente KL (kl), tipo de regularización (reg_type), sigma del ruido (sigma), programación de ruido (schedule), semilla (seed) y número de pasos de entrenamiento (steps). Se observan ejecuciones con arquitecturas base como SDXL-Turbo, FLUX (schnell y dev) y Sana, y variantes con LoRA (lorasana) y diferentes estrategias de regularización (drift, rtg global, rtg local, naive).

No se dispone de detalles sobre la composición del dataset de recompensas ni sobre el número total de tokens (al ser un modelo de difusión, este concepto no aplica). Tampoco se publica información sobre el proceso de entrenamiento más allá de lo codificado en los nombres de los directorios.

## Capacidades

- **Control de ruido en difusión**: la política de ruido aprendida modifica el ruido durante el muestreo para optimizar una recompensa (por ejemplo, estética) sin retocar el generador base.
- **Alineación de modelos de difusión**: permite ajustar el comportamiento de modelos como SDXL, FLUX o Sana mediante RL (GRPO) sin modificar los pesos del generador.
- **Soporte para diferentes arquitecturas**: los checkpoints cubren SDXL-Turbo, FLUX (schnell/dev) y Sana, con variantes de LoRA.
- **Variedad de configuraciones**: los checkpoints incluyen barridos de hiperparámetros (K, G, B, lr, KL, sigma, schedule), lo que permite seleccionar la configuración más adecuada para una tarea.
- **No es un modelo de lenguaje**: no tiene capacidades de generación de texto, razonamiento, código ni multilingües.

## Casos de uso

- **Ajuste estético de modelos de difusión**: si se desea que un modelo de difusión existente (por ejemplo, SDXL-Turbo) genere imágenes con una estética concreta (más "bella" según un predictor estético), se puede cargar el checkpoint correspondiente y aplicar la política de ruido durante el muestreo sin reentrenar el modelo base.
- **Investigación en alineación de difusión**: el repositorio es útil para estudiar cómo la regularización (KL, drift, reg) y los hiperparámetros (K, G, B, lr) afectan al equilibrio entre recompensa y fidelidad al modelo original.
- **Exploración de políticas de ruido**: los checkpoints permiten comparar políticas entrenadas con diferentes recompensas (aesthetic, RTG global, RTG local) y elegir la más adecuada para un escenario concreto.
- **Prototipado rápido en producción**: para aplicaciones que ya usan SDXL-Turbo o FLUX, se puede integrar la política de ruido como un módulo de post-procesado en el pipeline de generación, sin cambiar el modelo base.
- **Optimización de pasos de difusión**: los checkpoints de 1 paso y 4 pasos permiten experimentar con la reducción del número de pasos de muestreo manteniendo la calidad, útil para aplicaciones de baja latencia.
- **Benchmarking de regularización**: los barridos de KL y LR son útiles para calibrar la regularización en otros proyectos de alineación de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (por ejemplo, puntuaciones estéticas, FID, CLIP score) ni comparaciones con otros métodos de alineación de difusión.

## Requisitos de hardware

- **VRAM estimada para inferencia**: depende del modelo base (SDXL, FLUX, Sana) y del tamaño del checkpoint de política. Los checkpoints individuales varían entre 4,2 MB y 1,3 GB, pero el generador base (no incluido) requiere su propia VRAM (por ejemplo, SDXL-Turbo necesita ~8-10 GB en FP16, FLUX-dev ~20-24 GB, Sana ~8-16 GB según configuración).
- **GPU recomendadas**: para SDXL-Turbo o Sana, una GPU consumer como RTX 3090/4090 (24 GB) es suficiente; para FLUX-dev, se recomienda una GPU profesional (A100 40 GB o H100 80 GB) o usar cuantización.
- **Cabe en consumer GPU**: sí, si se usa un modelo base ligero (SDXL-Turbo, Sana) y el checkpoint de política es pequeño (4-60 MB). Los checkpoints más grandes (650 MB, 1,3 GB) corresponden a políticas sobre LoRA de mayor rango, pero el generador base sigue siendo el que domina el consumo de VRAM.
- **Opciones de despliegue**: al ser pesos PyTorch (`.pt`), se pueden cargar en un pipeline de difusión existente (por ejemplo, con `diffusers` o `comfyui`) que soporte la integración de una política de ruido. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplica al ser difusión).
- **Latencia y throughput**: no disponible. Depende del modelo base y del número de pasos de difusión; los checkpoints de 1 paso son los más rápidos.

## Comparativa con modelos similares

No se ha encontrado información sobre métodos comparables en la información disponible. No se puede comparar con otros proyectos de alineación de difusión (como DPO para difusión o métodos de fine-tuning con recompensa) porque no se proporcionan datos de rendimiento ni referencias a otros repositorios. Se indica "no disponible".

## Limitaciones y advertencias

- **No es un modelo completo**: los checkpoints son solo la política de ruido; el generador de imágenes (`g_theta`) no está incluido y debe descargarse por separado (SDXL, FLUX, Sana).
- **Sin licencia**: la model card no especifica licencia, lo que impide su uso comercial sin permiso explícito del autor.
- **Sin documentación de entrenamiento**: no se detallan los datos de recompensa, el número de pasos de entrenamiento ni la métrica de calidad utilizada.
- **Riesgo de sobreajuste**: los checkpoints están entrenados para una recompensa específica (por ejemplo, estética) y pueden degradar la fidelidad o la diversidad del generador base en dominios fuera de los datos de entrenamiento.
- **Sin soporte para texto**: no es un modelo de lenguaje, por lo que no se puede usar para generación de texto, tool calling ni tareas de lenguaje.
- **Formatos de pesos**: solo se proporcionan pesos en formato `.pt` (PyTorch), no hay versiones en GGUF ni otros formatos de cuantización.
- **Fechas futuras**: la fecha de creación (2026-08-24) es futura con respecto a la fecha actual; el contenido del repositorio puede ser experimental y no estable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sunione/npa-checkpoints
- (No se han encontrado otros enlaces: paper, blog, repo del proyecto, demos)
- Resultados de búsqueda web: se encontraron enlaces genéricos sobre checkpoints de Stable Diffusion y Hugging Face, pero no específicos del proyecto NPA.
