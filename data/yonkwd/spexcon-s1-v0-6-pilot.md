# YONKWd/Spexcon-S1-v0.6-Pilot

## Resumen

Spexcon S1 v0.6 Pilot es un adapter LoRA experimental desarrollado por YONKWd como parte del proyecto Spexcon S1, cuyo objetivo es construir modelos de lenguaje especializados en precisión de identidad/procedencia, seguimiento de instrucciones con fechas dinámicas, incertidumbre sobre el corte de conocimiento, límites de capacidades, respuestas concisas y relevancia conversacional. No es un modelo completo, sino un adapter de corrección que se monta sobre el modelo base Qwen/Qwen3-1.7B, de arquitectura transformer con 1.700 millones de parámetros. El proyecto Spexcon no entrena Qwen3 desde cero; se limita a ajustar el modelo base mediante QLoRA.

Este pilot v0.6 se presenta como una iteración intermedia que no ha superado el estricto control de calidad del proyecto (quality gate: False) y no se recomienda su uso para reemplazar la versión v0.5 en producción. A pesar de su carácter experimental, la ficha resulta relevante para desarrolladores que quieran explorar adaptadores LoRA de bajo coste sobre modelos pequeños, entender los criterios de evaluación del proyecto Spexcon y evaluar si este adapter tiene potencial para tareas conversacionales específicas. El repositorio contiene únicamente el adapter (0,2 GB) y no el modelo fusionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adapter LoRA sobre Qwen3-1.7B) |
| Parametros totales | 1.700 millones (modelo base) + adapter LoRA (tamano no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la del modelo base Qwen3-1.7B, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (se menciona QLoRA para entrenamiento, pero no se indican cuantizaciones de inferencia) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adapter PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3-1.7B, un transformer decoder-only con atención de escala Qwen (detalles concretos del modelo base no proporcionados en la informacion disponible). El adapter se entrena con QLoRA, una técnica de ajuste eficiente que cuantiza el modelo base durante el entrenamiento y entrena solo los adaptadores LoRA de bajo rango, reduciendo drásticamente los requisitos de memoria. El dataset de entrenamiento consta de 1.000 ejemplos, con 100 ejemplos de evaluación. La pérdida inicial fue de 2,3129, la final de 1,3688 y la pérdida de evaluación de 1,2137. El entrenamiento se orientó a objetivos concretos: precisión de identidad/procedencia, seguimiento de instrucciones con fechas dinámicas, incertidumbre sobre el corte de conocimiento, límites de capacidades, respuestas concisas y relevancia conversacional. No se menciona el uso de RLHF ni DPO; el enfoque es puramente supervisado con QLoRA. El adapter no se ha fusionado con el modelo base y no se despliega automáticamente.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas concisas y enfocadas a relevancia conversacional.
- Seguimiento de instrucciones con fechas dinamicas (por ejemplo, responder a preguntas que dependen de la fecha actual).
- Manejo de incertidumbre sobre el corte de conocimiento: el modelo debe reconocer cuando una pregunta cae fuera de su fecha de entrenamiento.
- Conocimiento de sus propios limites de capacidades (saber qué puede y qué no puede hacer).
- Precisión en identidad y procedencia: el modelo debe responder correctamente sobre quién es y de dónde viene (proyecto Spexcon, base Qwen3).
- No se mencionan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Asistentes conversacionales ligeros: el adapter puede montarse sobre Qwen3-1.7B para crear un chatbot de bajo coste que responda de forma concisa y honesta sobre sus capacidades, util para demos o prototipos.
- Pruebas de robustez en instrucciones dependientes de fecha: ideal para evaluar cómo un modelo pequeño maneja preguntas como "¿qué día es hoy?" o "¿qué noticias hay de esta semana?" sin alucinar.
- Investigación en adaptadores LoRA: sirve como caso de estudio para analizar el impacto de un ajuste fino con solo 1.000 ejemplos sobre la precisión de identidad y el comportamiento conversacional.
- Benchmarking de calidad en modelos pequeños: permite comparar métricas de pérdida y calidad de respuestas frente a otros adaptadores del proyecto Spexcon (v0.4, v0.5).
- Entrenamiento de desarrolladores en QLoRA: al ser un repositorio pequeño y con métricas claras, es un ejemplo didáctico para aprender a evaluar adaptadores PEFT.
- Exploración de límites de conocimiento: útil para investigar cómo un modelo comunica la incertidumbre sobre su corte de conocimiento, un aspecto crítico en aplicaciones de atención al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos numéricos son las pérdidas de entrenamiento (inicial 2,3129, final 1,3688) y evaluación (1,2137), que indican que el modelo converge pero no supera el control de calidad del proyecto. No hay comparación con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el adapter LoRA es muy ligero (0,2 GB), pero el modelo base Qwen3-1.7B requiere aproximadamente 3,5 GB en FP16 y unos 2 GB en cuantización de 8 bits. En total, para inferencia con el adapter cargado, se necesitan entre 2 y 4 GB de VRAM según la cuantización.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, GTX 1650, RTX 3050). Para mayor velocidad, una RTX 3060 o superior. En CPU, podría funcionar con 8 GB de RAM usando cuantización GGUF, aunque no se proporcionan pesos GGUF.
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o incluso una integrada con suficiente RAM compartida pueden ejecutarlo.
- Opciones de despliegue: al ser un adapter PEFT, se puede cargar con la librería `peft` y `transformers` de HuggingFace. Para inferencia en producción, se puede fusionar el adapter con el modelo base y exportar a formatos como ONNX o GGUF para usar con llama.cpp, Ollama o vLLM (aunque no hay guías oficiales en el repositorio).
- Latencia y throughput: no disponibles. Dado el tamaño pequeño del modelo, en una GPU moderna se esperan decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay información suficiente para comparar con otros adaptadores o modelos similares de la misma categoría (adaptadores LoRA sobre Qwen3-1.7B). El único punto de referencia razonable es el propio modelo base Qwen3-1.7B, que sin el adapter tiene un comportamiento generalista. El adapter Spexcon v0.6 intenta mejorar la precisión de identidad y el seguimiento de instrucciones con fechas, pero no se dispone de métricas comparativas. Otros adaptadores del proyecto Spexcon (v0.4, v0.5) existen pero no se proporcionan datos de rendimiento. Por tanto, la comparativa se limita a la diferencia cualitativa entre el base y el adapter, sin cifras objetivas.

## Limitaciones y advertencias

- No ha superado el control de calidad del proyecto (quality gate: False). El autor recomienda explícitamente no reemplazar la versión v0.5 en producción.
- Es un adapter experimental no fusionado; requiere cargar el modelo base Qwen3-1.7B y el adapter por separado.
- Solo soporta inglés. No hay soporte para español ni otros idiomas.
- No se han publicado benchmarks de rendimiento en tareas estándar; la única métrica es la pérdida de evaluación, que no garantiza calidad funcional.
- Riesgo de alucinación: sin evaluación externa, no se puede garantizar la fiabilidad de las respuestas, especialmente en temas que requieren conocimiento actualizado.
- Sesgos: al estar entrenado sobre un conjunto de solo 1.000 ejemplos, el adapter puede heredar sesgos del dataset de entrenamiento, que no se describe en detalle.
- Limitaciones de contexto: la longitud de contexto no se especifica; depende del modelo base Qwen3-1.7B, que típicamente soporta 32.768 tokens, pero no se confirma.
- Licencia Apache-2.0 permite uso comercial, pero al ser un proyecto experimental, el autor no ofrece garantías de soporte ni estabilidad.

## Enlaces

- Repositorio del adapter: https://huggingface.co/YONKWd/Spexcon-S1-v0.6-Pilot
- Proyecto Spexcon S1 (scaffold v0.4): https://huggingface.co/YONKWd/Spexcon-S1
- Versión anterior v0.5-Pilot: https://huggingface.co/YONKWd/Spexcon-S1-v0.5-Pilot
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B (no verificado en la busqueda, pero se cita como base_model)
