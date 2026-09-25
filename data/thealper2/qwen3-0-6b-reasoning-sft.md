# thealper2/qwen3-0.6b-reasoning-sft

## Resumen
`thealper2/qwen3-0.6b-reasoning-sft` es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base Qwen/Qwen3-0.6B, desarrollado por el usuario thealper2. El objetivo es especializar un modelo denso de 596 millones de parámetros en generación de razonamiento explícito en formato chain-of-thought, utilizando la traza nativa `<think>...</think>` de la familia Qwen3. El entrenamiento emplea el dataset Kenshiii/minimax-m3-reasoning-traces, un conjunto de trazas de razonamiento reformateadas al estilo Qwen3.

La relevancia de esta ficha radica en que demuestra el flujo completo de especialización de un modelo compacto mediante TRL `SFTTrainer`, con coste reducido (10,4 minutos en una única GPU consumer RTX 5060 Ti y 13,6 GB de memoria pico). Aunque el modelo base Qwen3-0.6B soporta 32.768 tokens de contexto y 119 idiomas, este ajuste concreto se ha entrenado únicamente en inglés y con longitud de secuencia de 2048 tokens, por lo que su comportamiento fuera de ese régimen es incierto.

Se trata de un modelo orientado a la experimentación y al estudio del razonamiento en modelos pequeños, más que a producción de alta exigencia. No se han publicado resultados de benchmarks ni evaluaciones comparativas por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento; el modelo base Qwen3-0.6B soporta 32.768 tokens de forma nativa |
| Tipos de cuantizacion | no disponible (no se documentan versiones GGUF, AWQ, GPTQ ni FP8 en el repositorio) |
| Idiomas soportados | Ingles (segun la model card y la etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Precision de entrenamiento | Pesos maestros en fp32, autocast en bfloat16 |
| Modelo base | Qwen/Qwen3-0.6B (commit c1899de289a04d12100db370d81485cdf75e47ca) |
| Tamano del repositorio | 2,4 GB |
| Libreria | Transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen3-0.6B, un transformer causal denso de la familia Qwen3, que en su version original combina modos de pensamiento (thinking) y no-pensamiento (non-thinking) en un marco unificado. El ajuste realizado es de parametros completos (full fine-tuning) mediante `SFTTrainer` de TRL 0.24.0 sobre Transformers 5.17.0, Torch 2.11.0+cu128 y Datasets 4.3.0. La plantilla de chat Qwen3 se mantiene sin cambios, y el formato de razonamiento es el bloque nativo `<think>...</think>` seguido de la respuesta final.

El dataset de entrenamiento es Kenshiii/minimax-m3-reasoning-traces (concretamente `data/chat.jsonl`), con trazas de razonamiento mapeadas al campo `reasoning_content` de Qwen3. La particion se hizo con semilla 42, estratificada por dominio y agrupando prompts casi duplicados con Jaccard de 5-gramas ≥ 0,8, resultando en 847 ejemplos de entrenamiento, 106 de validacion y 106 de test. La funcion de perdida solo se calcula sobre los tokens del asistente. Diecisiete ejemplos de entrenamiento superaron los 2048 tokens y se truncaron acortando el final de la traza de razonamiento, manteniendo siempre la respuesta final.

Los hiperparametros principales fueron: 3 epocas maximas, learning rate 2e-5, scheduler coseno con warmup del 5 %, weight decay 0,01, max grad norm 1,0, batch efectivo 16 (1 × 16 acumulacion), optimizador `adamw_torch_fused` y gradient checkpointing activado. Se selecciono el checkpoint con menor perdida de validacion (checkpoint-40, 1,0698) con paciencia de early stopping de 3 evaluaciones cada 10 pasos. El entrenamiento total fue de 80 pasos (1,51 epocas), 10,4 minutos, con una perdida de entrenamiento final registrada de 0,8242 y un pico de memoria de 13,6 GB en una NVIDIA GeForce RTX 5060 Ti con CUDA 12.8.

## Capacidades
- Generacion de texto conversacional en ingles con plantilla de chat Qwen3.
- Razonamiento explicito en formato chain-of-thought mediante bloques `<think>...</think>`.
- Resolucion de problemas paso a paso: el modelo esta entrenado para descomponer problemas matematicos y logicos antes de dar la respuesta final.
- Tareas de matematicas basicas y algebra elemental (el ejemplo de la model card resuelve x² − 7x + 12 = 0 y verifica ambas raices).
- Generacion de respuestas finales separadas de la traza de razonamiento tras `</think>`.
- Soporte de system prompt personalizado (el autor indica que fue entrenado con el system prompt mostrado en la model card).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma, aunque el modelo base Qwen3-0.6B soporta 119 idiomas y podria retener parte de esa capacidad de forma no garantizada.
- Tool calling / function calling: no documentado ni evaluado en este ajuste.
- Soporte de agentes y multi-step reasoning: no documentado; el formato de razonamiento permite cadenas internas, pero no se han publicado evaluaciones de uso agentico.
- Vision, audio o modalidades adicionales: no soportadas (modelo solo texto).

## Casos de uso
- Estudio del razonamiento en modelos pequenos: util como banco de pruebas para investigar como un modelo de 0,6 B de parametros aprende a emitir trazas chain-of-thought tras un SFT sobre un dataset de razonamiento, comparando el efecto del ajuste con respecto al modelo base Qwen3-0.6B.
- Experimentos de destilacion de trazas: el modelo puede emplearse como estudiante en pipelines de destilacion donde se quieran generar trazas de razonamiento a bajo coste a partir de modelos mayores, dado su tamano reducido.
- Aprendizaje automatico y docencia: sirve como ejemplo reproducible de un flujo completo de SFT con TRL, ya que la model card documenta versiones de framework, hiperparametros, particiones y semilla, lo que permite reproducir el entrenamiento en una GPU consumer.
- Generacion de razonamiento en entornos con recursos limitados: al caber en GPUs de gama media-alta y tener solo 596 millones de parametros, puede desplegarse en portatiles con GPU o entornos edge para generar explicaciones paso a paso en ingles.
- Prototipado de asistentes de resolucion de problemas matematicos sencillos: para entornos de demostracion donde se quiera mostrar el proceso de razonamiento antes de la respuesta, sin requisitos de precision de produccion.
- Evaluacion de sesgos y alucinacion en modelos pequenos: por su tamano y su dataset reducido (847 ejemplos), es adecuado para estudiar como se comportan los modelos compactos cuando se especializan en dominios concretos de razonamiento.
- Filtrado y generacion de datos sinteticos de razonamiento en ingles: para producir borradores de trazas que luego un modelo mayor pueda revisar o refinar, aprovechando el formato `<think>...</think>` compatible con la familia Qwen3.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento: mejor perdida de validacion 1,0698 (checkpoint-40) y perdida de entrenamiento final registrada de 0,8242. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware
- VRAM estimada para inferencia: en bfloat16 el modelo ocupa aproximadamente 1,2 GB solo en pesos; sumando cache KV para contexto de 2048 tokens y overhead de runtime, cabe holgadamente en GPUs con 4 GB o mas. En fp32 el peso completo del repositorio es de 2,4 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM es suficiente. El autor entreno en una NVIDIA GeForce RTX 5060 Ti (13,6 GB de pico durante el entrenamiento, no durante la inferencia).
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer de los ultimos 6-7 anos (RTX 3060, RTX 4060, RTX 4090, etc.), asi como en iGPU modernas con suficiente memoria compartida.
- Opciones de despliegue: la model card indica compatibilidad con text-generation-inference y endpoints compatibles (tag `endpoints_compatible`) y uso con Transformers. Tambien es desplegable mediante vLLM y TGI dado que los pesos estan en safetensors. No se documentan versiones GGUF para llama.cpp u Ollama, por lo que su uso en esos entornos requeriria conversion manual.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thealper2/qwen3-0.6b-reasoning-sft | 596 M | 2048 en entrenamiento; 32.768 en el base | Razonamiento SFT en ingles | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3-0.6B | 596 M | 32.768 | Modelo base generalista, thinking y non-thinking, 119 idiomas | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3-1.7B | 1.700 M | 32.768 | Modelo base generalista | Apache 2.0 | HuggingFace, safetensors |
| Otros ajustes SFT comunitarios sobre Qwen3-0.6B | 596 M | variable | variable (no se dispone de datos concretos) | variable | HuggingFace |

La comparativa relevante es contra el modelo base Qwen3-0.6B: este ajuste sacrifica el contexto nativo de 32.768 tokens (al haber sido entrenado a 2048) y la cobertura multilingue original a cambio de un comportamiento mas consistente en el formato `<think>...</think>` para tareas de razonamiento en ingles. No se dispone de datos de rendimiento que permitan cuantificar la mejora respecto al base.

## Limitaciones y advertencias
- Dataset de entrenamiento muy reducido: 847 ejemplos de entrenamiento y 106 de validacion. El riesgo de sobreajuste y de generalizacion pobre a dominios no representados es alto.
- Longitud de contexto efectiva limitada: aunque el modelo base soporta 32.768 tokens, el ajuste se realizo con secuencias de 2048 tokens. El comportamiento con contextos mas largos no esta garantizado y probablemente degrade.
- Solo ingles: la model card declara unicamente el idioma ingles. El uso en castellano u otros idiomas no esta soportado ni evaluado, aunque el base pudiera retener capacidades residuales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad del razonamiento. No se puede asumir que supere al modelo base en tareas estandar.
- Riesgo de alucinacion: como cualquier modelo de 0,6 B de parametros, la tasa de errores factuales y de razonamiento incorrecto es elevada. Las trazas `<think>` pueden contener pasos plausibles pero incorrectos.
- Sesgos: el modelo hereda los sesgos del base Qwen3-0.6B y los del dataset minimax-m3-reasoning-traces, cuyo origen y composicion no se detallan en la informacion disponible.
- Formato rigido: el autor indica que el modelo fue entrenado con un system prompt concreto. Desviarse de ese prompt o del formato `<think>...</think>` puede degradar la calidad de la salida.
- Advertencia de produccion: por su tamano y la ausencia de evaluaciones, no es recomendable para tareas criticas sin validacion humana. No se documentan versiones cuantizadas optimizadas ni despliegues probados a escala.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset `Kenshiii/minimax-m3-reasoning-traces`, cuyos terminos no se detallan en la informacion proporcionada.
- Sin garantias de tool calling ni uso agentico: no hay documentacion ni evaluacion al respecto.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/thealper2/qwen3-0.6b-reasoning-sft
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/Kenshiii/minimax-m3-reasoning-traces
- Qwen3 Technical Report (arXiv): https://arxiv.org/html/2505.09388v1
- Analisis de Qwen3-0.6B (AIOZ): https://aioz.network/blog/qwen3-0-6b-a-compact-model-with-hybrid-reasoning-modes
- Ficha de Qwen3 0.6B (Reasoning) en StudyArena: https://studyarena.com/models/qwen3-0-6b-reasoning
