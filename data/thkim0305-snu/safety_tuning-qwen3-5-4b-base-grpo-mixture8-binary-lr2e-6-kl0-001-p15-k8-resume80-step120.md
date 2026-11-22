# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step120

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario thkim0305-SNU. Se trata de un experimento de alineacion de seguridad (safety tuning) sobre una arquitectura multimodal de tipo image-text-to-text, entrenado con un objetivo binario de recompensa y una penalizacion KL frente al modelo de referencia. El checkpoint publicado corresponde a la actualizacion de optimizador numero 120 de una ejecucion GRPO identificada como "grpo-mixture8-qwen35base4b-lr2e6-resume80-save40-pro6000-gpu0123-20261119-v1".

El modelo conserva la torre de vision y los pesos MTP (multi-token prediction) sin entrenar procedentes del modelo base fijado en la revision 1001bb4d826a52d1f399e183466143f4da7b741b. Por tanto, sus capacidades de vision y de prediccion multi-token son las del Qwen3.5-4B-Base original, mientras que el ajuste GRPO afecta unicamente al comportamiento de seguridad y de generacion de texto.

Es relevante para quienes investigan tecnicas de alineacion con RL ligero sobre modelos pequenos (4B parametros), ya que documenta hiperparametros concretos (learning rate 2e-6, coeficiente KL 0.001, 15 prompts y 8 respuestas por actualizacion) y permite reproducir o comparar variantes de safety tuning. El modelo es pequeno, con licencia Apache 2.0 y pesos en safetensors, lo que facilita su inspeccion y despliegue en entornos de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5; pesos MTP y vision heredados del base |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer multimodal con torre de vision para tareas image-text-to-text. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo sin critic que estima ventajas relativas dentro de un grupo de respuestas generadas para un mismo prompt. La ejecucion usa 15 prompts y 8 respuestas por actualizacion, learning rate 2e-6 y coeficiente KL 0.001 frente al modelo de referencia, con recompensa de tipo binario. El checkpoint publicado corresponde a 120 actualizaciones de optimizador completadas (iteracion Megatron 119).

El nombre del experimento ("Mixture8") sugiere el uso de ocho respuestas por prompt en la estimacion de ventajas, coherente con los 8 responses per update indicados en la model card. Los pesos de vision y los de MTP no fueron entrenados y proceden del base fijado, por lo que la innovacion del ajuste se limita a la politica de texto. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de prompts ni si hubo etapas previas de SFT o DPO.

## Capacidades

- Generacion de texto conversacional, heredada del base Qwen3.5-4B-Base y modulada por el ajuste GRPO.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de vision sin entrenar procedente del base.
- Prediccion multi-token (MTP) con pesos heredados del base, orientada a decodificacion especulativa o aceleracion de inferencia.
- Comportamiento orientado a seguridad: el entrenamiento GRPO con recompensa binaria busca reducir respuestas inseguras o no alineadas.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en alineacion de seguridad: servir como checkpoint intermedio para estudiar como evoluciona el comportamiento de un modelo 4B bajo GRPO con recompensa binaria y KL 0.001, comparando la iteracion 120 con el base.
- Evaluacion de robustez frente a prompts adversarios: usar el modelo para medir tasas de rechazo o respuestas inseguras en baterias de red teaming, dado que el ajuste esta orientado explicitamente a safety tuning.
- Ablaciones de hiperparametros: replicar la configuracion (lr 2e-6, 15 prompts, 8 respuestas) y variar el coeficiente KL para analizar el equilibrio entre alineacion y deriva respecto al base.
- Despliegue ligero en entornos con GPU consumer: con aproximadamente 4,66 mil millones de parametros, el modelo en safetensors puede cargarse en GPUs de 24 GB o menos mediante cuantizacion a 8 o 4 bits, util para demos de investigacion.
- Generacion multimodal de bajo coste: aprovechar la torre de vision heredada para tareas image-text-to-text en prototipos, asumiendo que esa parte no fue ajustada por el GRPO.
- Estudio de decodificacion especulativa: los pesos MTP del base permiten experimentar con prediccion multi-token para acelerar la generacion en pipelines de investigacion.
- Base para ajustes posteriores: al estar en safetensors y transformers, puede servir como punto de partida para SFT o DPO adicionales con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 9,3 GB solo para pesos (el repo ocupa 9,3 GB), mas overhead de activaciones y cache KV; se recomienda al menos 16 GB.
- Cuantizacion a 8 bits: aproximadamente 5 GB de pesos, viable en GPUs de 8-12 GB.
- Cuantizacion a 4 bits: aproximadamente 2,5-3 GB de pesos, viable en GPUs consumer de 6-8 GB, aunque la cuantizacion no esta publicada en el repo.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en BF16 con contexto largo; RTX 4090 (24 GB) para BF16 o 8 bits; RTX 3090, RTX 4080 o RTX 4070 Ti para 8 bits; GPUs de 8 GB o menos solo con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no incluida en el repo).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 4,66B parametros, el throughput dependera del hardware y del backend, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO (este) | 4,66B | no disponible | apache-2.0 | Hugging Face, safetensors | Ajuste GRPO de safety tuning, 120 pasos, multimodal |
| Qwen/Qwen3.5-4B-Base | aproximadamente 4B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base sin ajuste de seguridad |
| Alternativas de safety tuning de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigacion con solo 120 actualizaciones de optimizador; no hay evidencia de convergencia ni de evaluacion de seguridad publicada.
- Riesgo de alucinacion inherente al base Qwen3.5-4B-Base, no mitigado por el ajuste GRPO, que se centra en seguridad.
- La torre de vision y los pesos MTP no fueron entrenados; el comportamiento multimodal es el del base y puede no estar alineado con el ajuste de texto.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue equivalente al del base.
- Sesgos conocidos del base no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni evaluaciones de produccion; conviene auditar el modelo antes de desplegarlo.
- El nombre del repo incluye hiperparametros y metadatos de la ejecucion, pero no se publican curvas de entrenamiento, datasets ni scripts de evaluacion.
- Descargas muy bajas (2) y sin likes; no hay comunidad que haya validado el checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Revision del base citada: 1001bb4d826a52d1f399e183466143f4da7b741b
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Repositorio de transformers: https://github.com/huggingface/transformers
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
