# whitebox-lm/reasoning-gen

## Resumen
El modelo **reasoning-gen** es un modelo de lenguaje de 4 mil millones de parámetros desarrollado por **whitebox-lm**, basado en **Qwen3.5 4B**. Su función principal es generar datos sintéticos de cadena de razonamiento (chain-of-thought, CoT) para pares de instrucciones y respuestas que originalmente no incluyen razonamiento explícito. El modelo se entrenó sobre el dataset `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, que parece ser una destilación de salidas de varios modelos de razonamiento de gran tamaño.

La relevancia de este modelo radica en su potencial para enriquecer conjuntos de datos de entrenamiento con razonamiento sintético, permitiendo que modelos no razonadores aprendan a generar pasos intermedios de pensamiento. Sin embargo, la información disponible es muy limitada: no se especifican detalles sobre la arquitectura exacta, la longitud de contexto, los idiomas soportados ni la licencia.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Qwen3.5 4B) |
| Parametros totales | 4 mil millones |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento
La información proporcionada no detalla la arquitectura interna del modelo. Se indica únicamente que es un modelo de 4 mil millones de parámetros basado en Qwen3.5 4B. Dado que Qwen3.5 es una familia de modelos transformer, es plausible que reasoning-gen herede esa arquitectura, pero no se confirma explícitamente.

El entrenamiento se realizó sobre el dataset `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, cuyo nombre sugiere una destilación de las salidas de varios modelos de razonamiento (posiblemente Qwen3.8-Max, GLM5.2 y Kimi-K3). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. La única innovación destacable descrita es la generación de datos sintéticos de CoT para pares de instrucciones y respuestas que carecen de razonamiento.

## Capacidades
- Generación de cadenas de razonamiento sintéticas para pares de prompt y respuesta sin razonamiento explícito.
- Producción de datos de entrenamiento que pueden utilizarse para destilación de razonamiento en modelos no razonadores.
- No se documentan capacidades adicionales como tool calling, soporte de agentes, visión, audio o modos de pensamiento especiales.

## Casos de uso
- **Generación de datasets de razonamiento sintético**: el modelo puede tomar un conjunto de pares instrucción-respuesta existentes y generar cadenas de razonamiento intermedias, enriqueciendo el dataset para fine-tuning posterior.
- **Destilación de razonamiento en modelos pequeños**: al generar CoT a partir de respuestas de modelos grandes, permite transferir habilidades de razonamiento a modelos más ligeros mediante entrenamiento supervisado.
- **Aumento de datos para evaluación de razonamiento**: puede usarse para crear variantes de preguntas con razonamiento explícito, facilitando la construcción de benchmarks más completos.
- **Mejora de pipelines de RAG**: las cadenas de razonamiento generadas pueden incorporarse como contexto intermedio en sistemas de recuperación aumentada, aunque no se especifica soporte directo.
- **Entrenamiento de modelos de instrucciones**: los datos generados sirven como ejemplos de CoT para ajustar modelos de instrucciones que no fueron entrenados inicialmente para razonar.
- **Investigación en destilación de conocimiento**: el modelo puede utilizarse como herramienta para estudiar cómo el razonamiento sintético afecta al rendimiento de modelos base en tareas de lógica y matemáticas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
No se proporcionan requisitos de hardware específicos en la información disponible. Como referencia genérica para un modelo de 4 mil millones de parámetros:
- VRAM estimada: aproximadamente 8 GB en FP16 y unos 2,5 GB en cuantización de 4 bits.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (RTX 3060, RTX 4060, A10G, etc.) para FP16; con 4 bits puede ejecutarse en GPUs de 4 GB.
- Opciones de despliegue: no disponibles; dada la naturaleza del modelo, podría utilizarse con frameworks como vLLM, llama.cpp u Ollama, pero no se confirma compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. No se ha proporcionado información sobre modelos comparables ni resultados de rendimiento que permitan establecer una comparativa.

## Limitaciones y advertencias
- No se dispone de información sobre sesgos conocidos, riesgos de alucinación ni comportamientos no deseados.
- La licencia no está especificada, por lo que el uso comercial no está garantizado y debe verificarse antes de desplegar el modelo en producción.
- Los idiomas soportados no están documentados; la generación de CoT puede verse limitada a los idiomas presentes en el dataset de entrenamiento.
- La longitud de contexto es desconocida, lo que impide saber si el modelo puede manejar entradas largas.
- El modelo está diseñado específicamente para generar datos de razonamiento sintético; no se ha verificado su rendimiento como modelo de propósito general.
- La ausencia de benchmarks publicados impide evaluar su calidad en tareas estándar.

## Enlaces
- Página del modelo en HuggingFace: https://huggingface.co/whitebox-lm/reasoning-gen
- Dataset de entrenamiento mencionado: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation

Nota: La búsqueda web no arrojó resultados relevantes adicionales.
