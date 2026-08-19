# unconst/Affine-5czsc2fc98-r570-r252-odpo-midrank-longctx-ultraextra-merged

## Resumen
Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el usuario `unconst`, basado en la arquitectura `qwen3_5_moe`. El modelo, identificado como `Affine-5czsc2fc98-r570-r252-odpo-midrank-longctx-ultraextra-merged`, es el resultado de un proceso de entrenamiento offline con DPO (Direct Preference Optimization) aplicado sobre un modelo base previo (`unconst/Affine-5czsc2fc98-r252-merged`). Su objetivo principal es mejorar las capacidades de razonamiento del modelo, específicamente optimizado para el protocolo interno "Reason v3".

Con un total de 35.107.181.936 parámetros (35,1B), el modelo está diseñado para tareas de razonamiento complejo y generación de texto con una longitud de contexto de 16.384 tokens. Publicado bajo licencia Apache-2.0, el repositorio contiene únicamente pesos en formato `safetensors` (70,2 GB). Es un artefacto de investigación con 0 descargas y 0 likes, lo que indica que es un experimento reciente o interno del autor, sin validación pública masiva.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (etiqueta `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 (según `max_len` de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo pesos `safetensors` en el repositorio) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura de Mezcla de Expertos (MoE), como indica la etiqueta `qwen3_5_moe`. La información disponible no detalla el número de expertos ni los parámetros activos, aunque el total es de 35,1B. El entrenamiento se realizó mediante **Offline DPO** sobre pares de preferencias de razonamiento anclados por un profesor (teacher-anchored Reason pairs), seleccionando como "chosen" aquellas respuestas con mayor puntuación `lpC(y_C|z) - lpC(y_C|∅)`. Este proceso se optimizó específicamente para el protocolo "Reason v3", sin utilizar otras métricas como `lpA` o `L1lift`.

Los hiperparámetros del entrenamiento fueron: tasa de aprendizaje de `5e-6`, LoRA con r=32 y α=128, β=0.02, longitud máxima de 16.384 tokens, y un máximo de 2.400 pasos. El entrenamiento se detuvo en el paso **312** debido al agotamiento de los datos, completando una época. El hardware utilizado fue un nodo con 8×GPU B300, empleando únicamente las GPUs 6 y 7. El proceso incluyó una fase de fusión (merge) y posterior subida a HuggingFace. La validación interna (sim evidence) con n80 comparado contra el modelo "king" `r252` estaba pendiente de resultados tras la publicación.

## Capacidades
- Generación de texto y razonamiento complejo, optimizado específicamente para el protocolo interno "Reason v3".
- Manejo de contexto largo de hasta 16.384 tokens, lo que permite procesar documentos extensos en una sola pasada.
- Capacidad de fine-tuning y adaptación mediante técnicas de preferencia (DPO), como demuestra su propio entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque su enfoque en razonamiento sugiere potencial en tareas secuenciales.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso
- Investigación en optimización de preferencias: el modelo es un artefacto ideal para estudiar el impacto del DPO offline con anclaje de profesor en modelos MoE, dado que su entrenamiento está documentado en detalle.
- Razonamiento matemático y lógico: gracias a su optimización para "Reason v3", puede emplearse en tareas de demostración de teoremas o resolución de problemas paso a paso.
- Generación de código complejo: su capacidad de razonamiento lo hace adecuado para tareas de programación que requieren planificación multi-paso, aunque no se confirma soporte nativo de tool calling.
- Análisis de documentos largos: con un contexto de 16.384 tokens, puede resumir o extraer información de informes técnicos, artículos de investigación o contratos extensos.
- Base para fine-tuning adicional: al estar licenciado bajo Apache-2.0 y tener un tamaño manejable (35B MoE), puede servir como punto de partida para entrenamientos específicos en dominios concretos.
- Evaluación comparativa de modelos: su naturaleza experimental y la ausencia de benchmarks públicos lo convierten en un candidato para pruebas internas de calidad de razonamiento frente a otros modelos MoE de tamaño similar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "sim evidence" interna (n80 contra el modelo "king" `r252`), con una regla de decisión basada en margen pareado, mediana de pensamiento y tasa de aprobación B, pero no se proporcionan valores numéricos concretos ni comparaciones con estándares públicos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio pesa 70,2 GB en formato `safetensors`, lo que sugiere pesos en FP16 o BF16. Se estima un requisito de aproximadamente 70 GB de VRAM para cargar el modelo en precisión completa.
- GPU recomendadas: para inferencia en precisión completa se necesitarían GPUs de datacenter como A100 (80 GB) o H100 (80 GB). Para GPUs de consumo (RTX 4090 con 24 GB), sería imprescindible aplicar cuantización, aunque no se proporcionan versiones cuantizadas oficiales.
- Opciones de despliegue: no se especifican oficialmente, pero al ser un modelo MoE basado en Qwen, es compatible con motores de inferencia estándar como vLLM, llama.cpp, Ollama o TGI, siempre que se generen los adaptadores de cuantización necesarios.
- Latencia y throughput: no disponibles. Al ser un MoE, la latencia dependerá del número de parámetros activos, dato que no se ha publicado.

## Comparativa con modelos similares
| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Affine-5czsc2fc98-r570-r252-odpo (este) | 35,1B | no disponible | 16.384 | Apache-2.0 | Basado en Qwen3.5 MoE, optimizado para razonamiento |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32.768 (ampliable a 131K) | Apache-2.0 | MoE de referencia con contexto largo y buen rendimiento |
| Mixtral 8x7B | 46,7B | 12,9B | 32.768 | Apache-2.0 | MoE consolidado, ampliamente desplegado |

La comparativa se basa en la arquitectura y tamaño, ya que no hay datos de rendimiento público para el modelo evaluado. El modelo `Affine` es más pequeño que Mixtral en total de parámetros, pero su contexto es inferior al de ambos competidores (16K frente a 32K). Su licencia Apache-2.0 es igual de permisiva que las alternativas.

## Limitaciones y advertencias
- Sin benchmarks públicos: no hay datos verificables de rendimiento en tareas estándar, lo que impide evaluar su calidad frente a otros modelos.
- Entrenamiento incompleto: el proceso se detuvo en el paso 312 de 2.400 por agotamiento de datos, lo que puede limitar la convergencia y el rendimiento final.
- Idiomas no especificados: se desconoce si el modelo soporta múltiples idiomas o si está limitado al inglés u otros idiomas dominantes en el dataset de entrenamiento.
- Validación pendiente: la "sim evidence" contra el modelo base `r252` estaba pendiente de resultados, por lo que no se confirma que esta versión sea superior a su predecesor.
- Sin soporte confirmado de tool calling ni agentes: no se mencionan capacidades de integración con herramientas externas, lo que limita su uso en pipelines de automatización compleja.
- Riesgo de alucinación: al ser un modelo de razonamiento entrenado con DPO, puede generar respuestas plausibles pero incorrectas si no se valida externamente la salida.
- Requisitos de hardware elevados: sin cuantización, necesita alrededor de 70 GB de VRAM, lo que excluye su uso en GPUs de consumo estándar.

## Enlaces
- Repositorio del modelo: https://huggingface.co/unconst/Affine-5czsc2fc98-r570-r252-odpo-midrank-longctx-ultraextra-merged
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
