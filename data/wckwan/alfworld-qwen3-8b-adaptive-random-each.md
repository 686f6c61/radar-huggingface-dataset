# wckwan/ALFWorld-Qwen3-8B-Adaptive-Random-Each

## Resumen

ALFWorld-Qwen3-8B-Adaptive-Random-Each es un ajuste fino del modelo denso Qwen/Qwen3-8B publicado por el usuario wckwan en HuggingFace. No es un modelo de propósito general: se trata de una política entrenada mediante aprendizaje por refuerzo para actuar como agente de búsqueda multi-turno al estilo Search-R1, es decir, un modelo que alterna razonamiento, llamadas a herramientas de recuperación y consumo de las respuestas devueltas por esas herramientas hasta cerrar una tarea.

El entrenamiento emplea una variante denominada Process-GRPO, en la que un modelo de recompensa de proceso (un verificador Olmo-3-7B-Think) puntúa cada turno de la trayectoria, con normalización de ventajas por par (grupo, posición de turno) y prompts de verificación que incluyen las respuestas de las herramientas recuperadas y la respuesta de referencia. El resultado declarado en el paso 300 es un score de recompensa de proceso medio de aproximadamente 0,93, unas 2,6 búsquedas por trayectoria y una precisión de 0,49 sobre el batch de entrenamiento.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para investigar normalización de ventajas por turno en RL con recompensa de proceso y para estudiar el equilibrio entre exploración (número de búsquedas) y precisión final. No hay descargas ni valoraciones registradas, y no se publican resultados sobre benchmarks estándar, por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-8B; ajuste posterior mediante RL (Process-GRPO) |
| Parametros totales | ~8,2 mil millones (heredado del modelo base; no se explicita en la model card) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen3-8B, extensibles a 131.072 con YaRN; no se documenta si el ajuste modifica esta ventana |
| Tipos de cuantizacion | no disponibles para este ajuste; el modelo base publica variantes GPTQ-Int4, AWQ, FP8 y GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |
| Modelo base | Qwen/Qwen3-8B |
| Tarea declarada | text-generation, uso como agente de busqueda con tool use |
| Checkpoints incluidos | Politica final en la raiz (paso 300) mas 14 checkpoints intermedios: step_20, step_40, step_60, step_80, step_100, step_120, step_140, step_160, step_180, step_200, step_220, step_240, step_260, step_280 |
| Tamano del repositorio | 245,7 GB (coherente con 15 copias completas en precision de 16 bits) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer causal decoder-only denso, con atención por grupos de consultas (GQA) y sin componentes MoE ni SSM. El ajuste no introduce cambios estructurales; lo que cambia es la distribución de comportamiento, desplazada hacia políticas de agente con múltiples turnos de interacción con herramientas.

El entrenamiento sigue el paradigma Search-R1 (agente de búsqueda multi-turno) con una modificación central denominada Process-GRPO. En lugar de asignar una única recompensa al final de la trayectoria, un modelo de recompensa de proceso (verificador Olmo-3-7B-Think) puntúa cada turno. Las ventajas se normalizan por par (grupo, posición de turno), de modo que cada paso de la trayectoria se compara contra otras muestras en la misma posición y no solo contra el resultado final. Los prompts del verificador incorporan tanto las respuestas recuperadas por la herramienta como la respuesta de referencia, lo que permite evaluar la utilidad real de cada búsqueda. El número de tokens de entrenamiento, la composición exacta del dataset, el uso de DPO o RLHF adicional y los hiperparámetros de GRPO no se detallan en la información disponible.

## Capacidades

- Generación de texto autorregresiva multilingüe heredada del modelo base, aunque el ajuste se orienta a interacción en inglés propia del entorno ALFWorld.
- Razonamiento multi-turno con planificación intermedia entre llamadas a herramientas.
- Llamada a herramientas de búsqueda o recuperación (tool use / function calling al estilo Search-R1): el modelo emite la consulta, espera la respuesta de la herramienta y continúa la trayectoria.
- Política de múltiples búsquedas por trayectoria (media de 2,6 en el paso 300), lo que indica que no ha colapsado a una única consulta trivial.
- Resolución de tareas de tipo ALFWorld, es decir, entornos textuales interactivos donde hay que manipular objetos y alcanzar un estado objetivo mediante acciones discretas.
- Capacidad de ser evaluado por un modelo de recompensa de proceso, ya que el entrenamiento optimiza directamente el score de turno.
- Modo de razonamiento explícito: el modelo base Qwen3-8B soporta modos thinking y non-thinking, aunque la model card no confirma si el ajuste conserva esa distinción de forma funcional.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni ejecución de código específicas para este ajuste.

## Casos de uso

- Investigación en RL con recompensa de proceso: permite reproducir y comparar la normalización de ventajas por (grupo, turno) frente a GRPO estándar usando los 15 checkpoints publicados y observando la evolución del score por paso.
- Estudio de colapso de exploración en agentes de búsqueda: la métrica de 2,6 búsquedas por trayectoria sirve para medir si una política mantiene diversidad de consultas o se degrada a una única búsqueda.
- Agente de recuperación documental multi-salto: el modelo puede encadenar consultas sucesivas contra un índice externo y refinar la pregunta en función de los resultados previos, integrándose mediante una API de tool calling.
- Automatización de tareas guiadas por estado textual: entornos tipo ALFWorld, simuladores de procesos o juegos de texto donde las acciones se representan como comandos en lenguaje natural.
- Generación de trayectorias sintéticas para destilar agentes más pequeños: usando la política del paso 300 para producir secuencias de acciones y consultas etiquetadas con el score del verificador.
- Evaluación de verificadores de proceso: al estar entrenado con un verificador Olmo-3-7B-Think, permite auditar la correlación entre la puntuación por turno y el éxito final de la tarea.
- Banco de pruebas para despliegue de agentes con vLLM o SGLang en pipelines de razonamiento multi-paso con parada temprana por número de búsquedas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de entrenamiento en el paso 300:

| Metrica de entrenamiento (paso 300) | Valor |
|---|---|
| Score medio de recompensa de proceso | ~0,93 |
| Busquedas por trayectoria | ~2,6 |
| Precision en el batch de entrenamiento | ~0,49 |

No hay datos de MMLU, HumanEval, GSM8K, tasa de exito en ALFWorld ni comparaciones con otras políticas. Tampoco se publican curvas de evaluación por checkpoint, por lo que no puede determinarse a partir de la información disponible si el paso 300 es el óptimo.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: unos 16,4 GB solo de pesos para 8,2 mil millones de parámetros, más caché KV; en la práctica, 20-24 GB con contexto moderado.
- Cuantización de 8 bits: aproximadamente 9 GB de pesos, viable en GPU de 16 GB con contexto corto.
- Cuantización de 4 bits: aproximadamente 5-6 GB de pesos, viable en GPU de 12 GB y en equipos con memoria unificada.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB y L40S son adecuadas para bf16 con lotes grandes o contextos extensos.
- GPU de consumo: cabe en bf16 en RTX 4090, RTX 3090 y RTX 4080 (24 GB y 16 GB respectivamente, esta última con cuantización); en 4 bits cabe en RTX 4070, RTX 3060 de 12 GB y similares.
- Opciones de despliegue: transformers (uso documentado en la model card), vLLM, SGLang y TGI para servicio; llama.cpp u Ollama requieren convertir previamente los safetensors a GGUF, ya que el repositorio no incluye pesos cuantizados.
- Almacenamiento: el repositorio completo ocupa 245,7 GB; descargar un único checkpoint intermedio con `subfolder="step_XX"` reduce el peso a unos 16 GB.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALFWorld-Qwen3-8B-Adaptive-Random-Each | ~8,2 mil millones (denso) | 32.768 tokens nativos en el base, 131.072 con YaRN | Process-GRPO con verificador Olmo-3-7B-Think, 300 pasos | apache-2.0 | 0 descargas, 0 likes, repositorio de 245,7 GB |
| Qwen/Qwen3-8B (modelo base) | ~8,2 mil millones (denso) | 32.768 tokens nativos, 131.072 con YaRN | Preentrenamiento y postentrenamiento generalista | apache-2.0 | Ampliamente utilizado, con variantes GPTQ, AWQ, FP8 y GGUF |
| Otras politicas de agente tipo Search-R1 | no disponible | no disponible | GRPO con recompensa final | no disponible | no disponible en la informacion proporcionada |
| Verificador Olmo-3-7B-Think | no disponible | no disponible | Modelo de recompensa de proceso | no disponible | citado como componente, no como alternativa |

La comparación únicamente puede establecerse con solidez frente al modelo base: este ajuste sacrifica comportamiento generalista a cambio de especialización en trayectorias de búsqueda multi-turno, sin que se hayan publicado métricas que cuantifiquen esa ganancia.

## Limitaciones y advertencias

- Especialización estrecha: es una política de agente entrenada sobre un régimen concreto de tool use; su comportamiento en conversación general puede degradarse respecto al modelo base.
- Sin validación externa: 0 descargas y 0 likes, sin resultados de benchmarks publicados. No hay evidencia independiente de su calidad.
- Riesgo de alucinación en las consultas y en la interpretación de las respuestas de la herramienta; la recompensa de proceso reduce pero no elimina este comportamiento.
- La métrica de 0,49 de precisión en el batch de entrenamiento indica que aproximadamente la mitad de las trayectorias del lote no alcanzan la respuesta correcta, lo que limita su uso directo en producción sin verificación adicional.
- Idiomas soportados no documentados; el entorno ALFWorld y las trayectorias de búsqueda asociadas son en inglés, por lo que el rendimiento en castellano no está evaluado.
- Sin datos sobre sesgos: no se publica información sobre composición del dataset, filtrado ni evaluación de sesgos.
- Licencia apache-2.0, heredada del modelo base, permite uso comercial, pero no se ofrece ninguna garantía ni soporte por parte del autor.
- El repositorio ocupa 245,7 GB por contener 15 checkpoints completos; gestionar el almacenamiento y las descargas requiere planificación previa.
- Las fechas de creación y actualización registradas (septiembre de 2026) son posteriores a la fecha habitual de publicación, lo que conviene verificar antes de citar el artefacto.
- No se documentan hiperparámetros de entrenamiento, número de tokens vistos ni receta completa de datos, lo que dificulta la reproducibilidad estricta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wckwan/ALFWorld-Qwen3-8B-Adaptive-Random-Each
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Referencias del dominio no incluidas en la información proporcionada: repositorio de ALFWorld (https://github.com/alfworld/alfworld) y repositorio de Search-R1 (https://github.com/PeterGriffinJin/Search-R1)
- No se han proporcionado enlaces a papers, blogs, demos ni repositorios adicionales del autor.
