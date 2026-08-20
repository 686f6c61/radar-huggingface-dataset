# Tonic/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit

## Resumen

Qwen3.8-27B es un modelo denso multimodal de 27.000 millones de parametros desarrollado por el equipo Qwen de Alibaba. Este repositorio concreto contiene una conversion a formato MLX con cuantizacion de 4 bits del modelo "abliterated" (sin censura) publicado por huihui-ai, realizada por el usuario Tonic. El modelo original destaca por su arquitectura de atencion hibrida, en la que solo 16 de las 64 capas utilizan atencion completa y las 48 restantes emplean atencion lineal con estado recurrente constante, lo que reduce el coste computacional manteniendo una ventana de contexto de 262.000 tokens.

La variante abliterated elimina los mecanismos de rechazo y negativa del modelo original, permitiendo respuestas sin las restricciones de seguridad habituales. Al estar cuantizado a 4 bits en formato MLX, esta pensado para ejecutarse en hardware Apple Silicon mediante la libreria mlx-lm, con un tamano de repositorio de 15,2 GB. El modelo acepta entradas de texto e imagen y soporta modo de pensamiento (thinking mode).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (16 capas de atencion completa + 48 capas de atencion lineal con estado recurrente) |
| Parametros totales | 27.000 millones (nominal); los safetensors del repo registran 4.204.731.904 parametros, probablemente por el empaquetado de la cuantizacion MLX de 4 bits |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atencion hibrida sobre un backbone denso de 64 capas. Solo 16 de esas capas ejecutan atencion completa (con un intervalo de atencion completa de 4), mientras que las otras 48 utilizan atencion lineal con un estado recurrente constante, una innovacion que reduce la complejidad computacional en contextos largos. El modelo es nativamente multimodal: acepta tanto texto como imagenes como entrada.

La variante abliterated de huihui-ai aplica una tecnica de "abliteracion" que elimina los circuitos de rechazo y negativa del modelo original, de modo que el modelo responde sin las restricciones de seguridad habituales. El proceso de conversion a MLX se realizo con mlx-lm version 0.31.2, cuantizando los pesos a 4 bits. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto y razonamiento en modo estandar y modo de pensamiento (thinking mode).
- Comprension de imagenes (entrada multimodal texto-imagen).
- Generacion de codigo y soporte de flujos de trabajo agente (agentic workflows).
- Automatizacion de tareas de oficina (office automation).
- Soporte de tool calling / function calling, heredado de la familia Qwen3.8.
- Capacidades multilingues (no se especifican los idiomas concretos en la informacion disponible).
- Al estar abliterated, no rechaza peticiones que el modelo original consideraria inapropiadas.

## Casos de uso

- Asistente de codigo en entornos locales: gracias a su ventana de contexto de 262.000 tokens, puede mantener repositorios completos en contexto y generar o refactorizar codigo en multiples archivos sin perder el hilo.
- Automatizacion de tareas de oficina: el modelo esta optimizado para office automation, por lo que puede redactar documentos, resumir correos y generar informes a partir de instrucciones en lenguaje natural.
- Agentes autonomos con tool calling: su soporte de function calling permite integrarlo en pipelines agente donde el modelo decide que herramientas invocar y en que orden, util para automatizaciones complejas.
- Analisis de documentos con imagenes: al aceptar entradas de imagen, puede procesar capturas de pantalla, diagramas o documentos escaneados y extraer informacion relevante de ellos.
- Chat conversacional sin restricciones: la variante abliterated permite mantener conversaciones sobre temas que otros modelos rechazarian, util en entornos de investigacion, escritura creativa o generacion de contenido.
- Desarrollo de prototipos en Apple Silicon: al estar en formato MLX 4-bit, se puede ejecutar en Mac con memoria unificada de 16 GB o mas, ideal para desarrollo y pruebas locales sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15,2 GB; con cuantizacion de 4 bits, se recomienda al menos 16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con 16 GB o mas de memoria unificada. No requiere GPU NVIDIA.
- Ejecucion en consumer hardware: si, en Mac con 16 GB de RAM o superior.
- Opciones de despliegue: mlx-lm (libreria principal), Ollama (compatible con modelos abliterated de huihui-ai mediante `ollama run huihui_ai/Qwen3.8-abliterated`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | FP16/BF16 | Apache 2.0 | safetensors |
| Huihui-Qwen3.8-27B-abliterated | 27B | 262K | FP16/BF16 | Apache 2.0 | safetensors |
| Este modelo (MLX 4-bit) | 27B | 262K | 4-bit MLX | Apache 2.0 | MLX/safetensors |

La diferencia principal frente al modelo original es la abliteracion (eliminacion de los mecanismos de rechazo) y la cuantizacion a 4 bits en formato MLX, que reduce los requisitos de memoria a costa de una pequena perdida de precision. Frente a la version abliterated sin cuantizar, este modelo sacrifica algo de fidelidad en las respuestas pero permite ejecutarse en hardware Apple Silicon con requisitos mucho menores.

## Limitaciones y advertencias

- La abliteracion elimina los mecanismos de seguridad del modelo: puede generar contenido ofensivo, ilegal o danino. No debe usarse en produccion sin supervision humana.
- La cuantizacion de 4 bits puede degradar ligeramente la calidad de las respuestas frente al modelo en precision completa.
- El formato MLX solo es compatible con Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin conversion previa a otro formato (GGUF, etc.).
- No se dispone de informacion sobre los idiomas soportados ni sobre sesgos especificos del modelo.
- El numero de parametros registrado en los safetensors (4,2 mil millones) no coincide con el tamano nominal de 27 mil millones; es probable que se deba al empaquetado de la cuantizacion, pero conviene verificarlo antes de usarlo en produccion.
- No se han publicado benchmarks que permitan evaluar el rendimiento real de esta variante cuantizada.
- El modelo card referencia al usuario AutisticAF como autor de la conversion, mientras que el repositorio esta publicado bajo el usuario Tonic; conviene verificar la procedencia antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tonic/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio del modelo original Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Modelos cuantizados del base: https://huggingface.co/models?other=base_model:quantized:huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
