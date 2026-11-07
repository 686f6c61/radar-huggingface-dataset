# Sph3inxz/smollm2-360m-sft-smoltalk2

## Resumen

`Sph3inxz/smollm2-360m-sft-smoltalk2` es un ajuste fino supervisado (SFT) del modelo compacto `HuggingFaceTB/SmolLM2-360M` de Hugging Face, publicado por el usuario Sph3inxz como ejercicio del curso `smol-course`. El entrenamiento se realizó con el `SFTTrainer` de TRL aplicando LoRA (r=32, alpha=64) sobre todas las proyecciones de atención y MLP, con posterior fusión de los adaptadores en los pesos finales. El resultado es un modelo de 361.821.120 parámetros en formato safetensors, listo para cargarse con `transformers`.

El modelo parte de la arquitectura transformer decoder-only de SmolLM2, diseñada por Hugging Face para aplicaciones en dispositivo (on-device) y entornos con recursos limitados. El ajuste se hizo sobre el split `smoltalk_everyday_convs_reasoning_Qwen3_32B_think` del dataset `smoltalk2`, compuesto por 2.057 conversaciones, durante una época y 129 pasos, con una longitud máxima de 1024 tokens y precisión bf16 sobre una GPU de portátil RTX 4050 (6 GB).

Su relevancia es fundamentalmente didáctica: demuestra un flujo completo de SFT con LoRA en hardware de consumo y produce un modelo que imita el formato de razonamiento de Qwen3 (bloques `<think>`) en un tamaño muy reducido. No obstante, el propio autor advierte de que se trata de un entrenamiento corto y de que la calidad es irregular, por lo que no está pensado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con max_length 1024; el contexto nativo de SmolLM2-360M no se detalla en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el dataset smoltalk2 es mayoritariamente ingles; no se declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-360M, un transformer decoder-only compacto orientado a inferencia en dispositivo. Sobre esa base se aplicó un ajuste fino supervisado con TRL `SFTTrainer` y LoRA con r=32, alpha=64 sobre todas las proyecciones de atención y MLP, seguido de la fusión de los adaptadores en los pesos del modelo base. La plantilla de chat se tomó de `HuggingFaceTB/SmolLM2-360M-Instruct` (formato ChatML), y las respuestas comienzan con un bloque `<think>` de razonamiento, replicando el formato de los datos de entrenamiento generados por Qwen3-32B.

Los datos provienen del split `smoltalk_everyday_convs_reasoning_Qwen3_32B_think` de `HuggingFaceTB/smoltalk2`, que contiene 2.057 conversaciones (se usaron todas). El entrenamiento consistió en 1 época y 129 pasos, con learning rate 2e-4 con scheduler coseno, batch efectivo de 16, longitud máxima de 1024 tokens y precisión bf16, ejecutado en una RTX 4050 Laptop de 6 GB en unos 52 minutos. La pérdida bajó de 2,175 en el paso 5 a 1,256 en el último paso registrado, con una precisión media de token de 0,67. No se documenta RLHF, DPO ni ninguna innovación arquitectónica adicional; el interés técnico reside en el pipeline LoRA + fusión y en la destilación de formato de razonamiento.

## Capacidades

- Generación de texto conversacional multi-turno en formato ChatML.
- Razonamiento explícito mediante bloques `<think>` al inicio de cada respuesta, imitando el estilo de Qwen3.
- Conversaciones cotidianas y tareas de razonamiento sencillas incluidas en el dataset de entrenamiento (everyday conversations + reasoning).
- Capacidad limitada de seguir instrucciones, condicionada por el tamaño del modelo y la brevedad del entrenamiento.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el bloque `<think>` es imitación de formato, no un modo de razonamiento verificado.
- Capacidades multilingües: no declaradas.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).

## Casos de uso

- Aprendizaje y docencia de SFT con LoRA: sirve como ejemplo reproducible de ajuste fino de un modelo de 360M en una GPU de 6 GB, útil en cursos y talleres sobre entrenamiento de LLM.
- Prototipado rápido de asistentes conversacionales: permite montar un chatbot básico con `transformers` y la plantilla ChatML para validar flujos de producto antes de invertir en modelos mayores.
- Pruebas de pipelines de inferencia ligeros: al pesar 0,7 GB en safetensors, encaja en entornos de CI o contenedores pequeños para validar integraciones con TGI o endpoints compatibles.
- Experimentación con formato de razonamiento: permite estudiar cómo un modelo pequeño imita los bloques `<think>` de modelos grandes y hasta qué punto el formato se mantiene coherente.
- Generación de texto en dispositivos con recursos muy limitados: su tamaño permite ejecución en CPU o GPUs de gama baja para demos offline.
- Base para nuevos experimentos de fine-tuning: al estar fusionado y en safetensors estándar, se puede reutilizar como punto de partida para otros SFT, DPO o cuantizaciones.
- Evaluación comparativa de metodologías LoRA: útil para medir el efecto de hiperparámetros (r, alpha, batch, lr) en modelos pequeños con presupuesto de cómputo mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento: pérdida de 2,175 en el paso 5 y 1,256 en el último paso registrado, con precisión media de token de 0,67. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 0,7-1 GB para los pesos (361,8M de parámetros) más overhead de activaciones y KV cache.
- En cuantización de 8 bits: aproximadamente 0,4 GB de pesos; en 4 bits, alrededor de 0,2 GB (estimaciones a partir del recuento de parámetros, no verificadas con artefactos publicados).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor entrenó en una RTX 4050 Laptop de 6 GB. Para inferencia bastan GTX 1650, RTX 3050, RTX 4060 o superiores; también A100/H100 si se busca throughput agregado.
- Cabe en GPU consumer y en CPU: el repo ocupa 0,7 GB, por lo que es viable en portátiles y equipos de gama baja.
- Opciones de despliegue: `transformers` (soporte nativo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sph3inxz/smollm2-360m-sft-smoltalk2 | 361,8M | no disponible (entrenado a 1024) | SFT + LoRA sobre 2.057 conversaciones, 1 época | no disponible | Hugging Face, safetensors |
| HuggingFaceTB/SmolLM2-360M | 360M aprox. | no disponible en la informacion proporcionada | Preentrenamiento base | no disponible en la informacion proporcionada | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M aprox. | no disponible en la informacion proporcionada | Ajuste instrucciones + preferencias | no disponible en la informacion proporcionada | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado benchmarks del modelo ajustado ni se han proporcionado métricas de los modelos base e instruct en la información de búsqueda, más allá de su existencia en la colección SmolLM2 (1.7B, 360M y 135M).

## Limitaciones y advertencias

- Calidad irregular: el propio autor advierte de que es un modelo pequeño con entrenamiento corto y que la calidad es desigual; no es apto para producción sin evaluación adicional.
- Riesgo elevado de alucinación: con 361M de parámetros y 129 pasos de entrenamiento, la fidelidad factual es muy limitada.
- El bloque `<think>` imita el formato de Qwen3 pero no garantiza un razonamiento correcto; puede producir cadenas de pensamiento incoherentes o redundantes.
- Contexto limitado en el entrenamiento (1024 tokens); no se documenta el contexto nativo del modelo base, por lo que conversaciones largas pueden degradarse.
- Idiomas no declarados: el dataset smoltalk2 es mayoritariamente en inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene consultar la licencia del modelo base SmolLM2-360M antes de cualquier despliegue.
- Sesgos: no documentados, pero heredados del dataset smoltalk2 y del modelo base; no se ha realizado ninguna mitigación específica.
- Sin garantías de soporte: repositorio con 0 descargas y 0 likes, creado como ejercicio de curso, sin mantenimiento declarado.
- No se han publicado artefactos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en herramientas como llama.cpp u Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sph3inxz/smollm2-360m-sft-smoltalk2
- Modelo base SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Colección SmolLM2: https://huggingface.co/collections/HuggingFaceTB/smollm2
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Modelo de referencia para la plantilla de chat: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
