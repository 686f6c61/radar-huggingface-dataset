# thundercockk/qwen3-8b-trace-dose-lora

## Resumen

`thundercockk/qwen3-8b-trace-dose-lora` no es un modelo independiente, sino una coleccion de diez adaptadores LoRA en formato MLX entrenados sobre `mlx-community/Qwen3-8B-4bit` (la version cuantizada a 4 bits de Qwen3-8B). Forman parte del experimento "trace-dose" (H4) del proyecto Structured Multi-Step Reasoning, cuyo objetivo es medir si la procedencia de las trazas de razonamiento (chain-of-thought escritas por humanos frente a generadas por el propio modelo) influye en cuanto depende la respuesta final del modelo de esos pasos intermedios. Es, por tanto, un artefacto de investigacion en interpretabilidad y razonamiento multi-paso, no un modelo de proposito general.

Los diez adaptadores comparten el mismo conjunto de 229 preguntas de entrenamiento extraidas de GSM8K; la unica variable que cambia es la proporcion de trazas humanas (0 %, 25 %, 50 %, 75 % y 100 %), con dos semillas por nivel. El resultado pre-registrado indica que una mayor proporcion de trazas humanas reduce la frecuencia con la que el modelo sigue un paso intervenido artificialmente (OLS sobre los 10 adaptadores, b_human = -0,649, t(7) = -5,38, p = 0,001), aunque la relacion no es estrictamente monotona.

Su relevancia es metodologica: ofrece un conjunto controlado y reproducible para estudiar la fidelidad del razonamiento en modelos pequenos, con codigo, datos y pre-registro publicos. El repositorio ocupa 0,2 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptadores LoRA; inferencia via MLX |
| Parametros totales | 8 000 millones (modelo base Qwen3-8B); adaptadores LoRA de rango 8 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso max_seq_length = 512 |
| Tipos de cuantizacion | Base en 4 bits (mlx-community/Qwen3-8B-4bit); adaptadores LoRA en precision nativa MLX |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Adaptadores LoRA para MLX (libreria `mlx-lm`); modelo base en formato MLX cuantizado |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer denso de 8 000 millones de parametros. Sobre el se aplican adaptadores LoRA de rango 8, escala 20 y dropout 0, entrenados unicamente en las 8 ultimas capas durante 200 iteraciones, con batch size 1, learning rate 5e-5 y longitud maxima de secuencia 512, usando `mlx_lm.lora`. El entrenamiento se ejecuta sobre la version del base cuantizada a 4 bits para Apple Silicon.

El diseno experimental es el nucleo del artefacto: se seleccionan 229 preguntas de las primeras 400 de GSM8K (aquellas que el modelo base respondia correctamente y con el formato esperado) y se generan diez adaptadores variando la proporcion de trazas humanas (0 %, 25 %, 50 %, 75 %, 100 %) con dos semillas cada uno. La evaluacion se realiza sobre GSM-Plus y mide la dependencia de pasos mediante intervenciones controladas. No se documenta uso de RLHF ni DPO; el ajuste es supervisionado sobre trazas.

## Capacidades

- Razonamiento aritmetico de varios pasos sobre problemas tipo GSM8K y GSM-Plus.
- Generacion de cadenas de razonamiento (chain-of-thought) en formato explicito.
- Analisis de fidelidad del razonamiento: los adaptadores permiten medir si el modelo sigue o no un paso intervenido.
- Comparacion controlada por nivel de "dosis" de trazas humanas (0-100 %) y por semilla.
- Inferencia local en Apple Silicon mediante MLX.
- Capacidades generales heredadas de Qwen3-8B (no evaluadas por el autor en este artefacto).
- No se documenta soporte de tool calling, agentes, vision ni audio en este artefacto.

## Casos de uso

- Investigacion en interpretabilidad del razonamiento: usar los diez adaptadores como conjunto controlado para medir como varia la dependencia de pasos al cambiar la procedencia de las trazas, replicando el analisis pre-registrado.
- Auditoria de fidelidad de chain-of-thought: aplicar intervenciones sobre pasos intermedios y comparar la tasa de seguimiento entre adaptadores con distinta dosis de trazas humanas.
- Docencia y divulgacion: demostrar de forma reproducible el efecto de la calidad de las trazas de entrenamiento en un modelo de 8B ejecutable en un portatil Apple Silicon.
- Reproduccion de experimentos: reentrenar los adaptadores con `mlx_lm.lora` a partir de los ficheros de datos publicados en el repositorio del proyecto.
- Estudio de sensibilidad a semillas: comparar `s0` y `s1` en cada nivel de dosis para estimar la varianza del efecto.
- Base para experimentos derivados: partir de un adaptador concreto (por ejemplo `trace_mix50_200_s0`) y extender el protocolo a otros datasets aritmeticos.
- Prototipado local de razonamiento aritmetico en macOS: ejecutar inferencia cuantizada a 4 bits con `mlx_lm.generate` para pruebas puntuales, asumiendo las limitaciones descritas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta el resultado del test pre-registrado a nivel de adaptador: OLS sobre los 10 adaptadores con b_human = -0,649, t(7) = -5,38 y p = 0,001, sobre evaluacion en GSM-Plus. No se aportan cifras de exactitud absoluta, MMLU, HumanEval ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM/memoria unificada: el base en 4 bits ocupa aproximadamente 4-5 GB; con overhead de inferencia conviene disponer de al menos 8 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (MLX esta disenado para M-series); no hay soporte documentado para CUDA en este artefacto.
- GPU consumer: cabe en Mac con 16 GB o mas de memoria unificada; en GPUs NVIDIA no se documenta despliegue.
- Opciones de despliegue: `mlx-lm` (`mlx_lm.generate` con `--adapter-path`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thundercockk/qwen3-8b-trace-dose-lora | 8B (base) + LoRA r8 | no disponible | Investigacion en fidelidad de razonamiento (10 adaptadores) | MIT | Hugging Face, MLX |
| Qwen3-8B (base) | 8B | no disponible en esta ficha | Modelo generalista con modo de razonamiento | no disponible en esta ficha | Hugging Face |
| mlx-community/Qwen3-8B-4bit | 8B | no disponible en esta ficha | Version cuantizada a 4 bits para MLX | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Son artefactos de investigacion para medir dependencia de pasos, no modelos de matematicas de proposito general; el propio autor lo advierte.
- Entrenados solo con 229 preguntas de GSM8K; la generalizacion fuera de GSM-Plus no se ha medido.
- La relacion dosis-respuesta no es estrictamente monotona: los niveles del 50 % y 75 % son muy proximos, lo que limita interpretaciones causales fuertes.
- Solo se evaluo exactitud en GSM-Plus; no hay mediciones en otras tareas.
- Riesgo de alucinacion y sesgos: no documentados especificamente para estos adaptadores; heredan los del base Qwen3-8B.
- Idiomas soportados no declarados; el entrenamiento es en ingles (GSM8K).
- Requiere MLX y hardware Apple Silicon; no hay ruta documentada para CUDA.
- Licencia MIT permite uso comercial, pero el artefacto no esta pensado ni validado para produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thundercockk/qwen3-8b-trace-dose-lora
- Repositorio del proyecto: https://github.com/Thundercok/structured-multi-step-reasoning
- Analisis, datos y pre-registro: https://github.com/Thundercok/structured-multi-step-reasoning/tree/main/audit/trace_dose_20261120
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
