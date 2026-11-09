# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd3520-lora

## Resumen

Este repositorio contiene un adaptador LoRA sobre el modelo base Qwen2.5-0.5B-Instruct, desarrollado por el usuario uygarkurt. El adaptador está especializado en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta. Se trata de un experimento de post-entrenamiento que combina un ajuste supervisado (SFT) de 5.600 actualizaciones con una fase posterior de destilación on-policy (OPD) de 3.520 actualizaciones, usando Qwen2.5-3B-Instruct como profesor congelado.

El modelo resuelve el problema de la fiabilidad en la invocación de funciones en modelos pequeños: no solo debe generar llamadas correctas a herramientas, sino también reconocer cuándo ninguna de las herramientas disponibles sirve y abstenerse en lugar de alucinar una llamada. Es relevante ahora porque los pipelines de agentes requieren modelos ligeros que puedan desplegarse en entornos con recursos limitados y que no generen llamadas espurias.

El adaptador hereda la arquitectura del base Qwen2.5-0.5B-Instruct, un transformer decoder de 0,5 mil millones de parámetros con 32.768 tokens de contexto. El repositorio es de tipo PEFT y contiene únicamente los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5), adaptador LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 mil millones (modelo base) + parametros del adaptador LoRA (no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; las cuantizaciones del base aplican al fusionar) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-0.5B-Instruct, un transformer decoder denso de 0,5 mil millones de parámetros. El entrenamiento se realizó en dos fases con la herramienta Post-Training Lab: primero 5.600 actualizaciones de SFT (0,9 horas) y después 3.520 actualizaciones de destilación on-policy (1,3 horas), totalizando 2,2 horas de bucle de entrenamiento. En la fase OPD, el estudiante aprende de las probabilidades por token que el profesor congelado Qwen2.5-3B-Instruct asigna a las respuestas generadas por el propio estudiante. Ambas fases usan el dataset mixto de tool calling uygarkurt/xlam-tool-calling-mixed.

La innovación principal es la combinación de SFT con OPD para mejorar la calibración en la decisión de invocar o abstenerse. Los resultados muestran un intercambio claro: la precisión de invocación de herramientas mejora ligeramente (BFCL single-turn FC sube de 53,04% a 56,53%), pero la exactitud de llamada exacta en xLAM ETC cae de 78,99% a 69,25% y la precisión de nombre de función de 96,86% a 87,51%. La tasa de relevancia alcanza el 100% mientras que la de irrelevancia cae al 8,55%, lo que indica que el adaptador OPD tiende a invocar herramientas incluso cuando no son relevantes.

## Capacidades

- Generación de texto conversacional en inglés.
- Tool calling estructurado: generación de llamadas a funciones en formato estructurado.
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar cuando ninguna herramienta es adecuada (aunque los datos de evaluación muestran un rendimiento bajo en esta métrica tras OPD).
- Razonamiento básico y matemáticas: evaluado en MMLU (39,28%) y MATH-500 (17,40%).
- Seguimiento de instrucciones: evaluado en IFEval (31,24% de precisión estricta a nivel de prompt).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Prototipado de agentes con tool calling en entornos con recursos muy limitados: el modelo de 0,5B puede ejecutarse en CPU o GPU de gama baja para validar pipelines de agentes antes de escalar a modelos mayores.
- Investigación en post-entrenamiento: sirve como caso de estudio reproducible de la combinación SFT + OPD con profesor congelado para analizar el intercambio entre precisión de invocación y abstención.
- Enrutamiento de funciones en asistentes ligeros: puede emplearse para decidir qué herramienta invocar en un conjunto cerrado y bien definido, siempre que se valide la tasa de falsos positivos.
- Generación de llamadas a API en entornos de bajo coste: adecuado para tareas de clasificación de intención y selección de función donde la latencia y el coste por token son críticos.
- Evaluación comparativa de adaptadores LoRA: el repositorio incluye métricas detalladas de dos checkpoints (SFT y SFT+OPD) que permiten reproducir análisis de degradación por destilación on-policy.
- Filtrado de consultas fuera de dominio: la métrica de relevancia del 100% sugiere uso potencial para decidir si una consulta debe procesarse con herramientas, aunque la baja tasa de irrelevancia (8,55%) limita su fiabilidad en producción sin ajuste adicional.

## Benchmarks y rendimiento

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT starting adapter | SFT 5.600 | 39,42% | 18,00% | 31,24% | 78,99% | 96,86% | 53,04% | 83,33% | 49,46% | 0,9 |
| SFT + OPD (este adaptador) | OPD 3.520 | 39,28% | 17,40% | 31,24% | 69,25% | 87,51% | 56,53% | 100,00% | 8,55% | 2,2 |

Notas de la evaluación: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud de nombre de función. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de función de un solo turno. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en fp16: aproximadamente 1 GB para los pesos (0,5B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- En cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 0,4-0,5 GB de VRAM, apto para GPUs consumer muy básicas y CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; RTX 3060, RTX 4060, GTX 1660 o superiores. También funciona en CPU con llama.cpp u Ollama.
- Cabe en GPU consumer sin problema dado el tamaño del modelo base.
- Opciones de despliegue: el adaptador PEFT requiere cargar el base Qwen2.5-0.5B-Instruct y montar el adaptador con transformers + peft. Para despliegue en producción se puede fusionar el adaptador y exportar a GGUF para llama.cpp u Ollama, o servir con vLLM/TGI tras la fusión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0,5B | 32.768 | Especializado (SFT+OPD) | no disponible | Hugging Face, PEFT |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 | Genérico | Apache 2.0 (según el base) | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 | Genérico | Apache 2.0 (según el base) | Hugging Face |

La comparativa con alternativas especializadas en tool calling de tamaño similar no está disponible en la información proporcionada. El adaptador se distingue del base por su especialización en invocación estructurada y abstención, a costa de una ligera degradación en MMLU y MATH-500.

## Limitaciones y advertencias

- La tasa de irrelevancia cae al 8,55% tras OPD, lo que indica una tendencia fuerte a invocar herramientas incluso cuando no son relevantes; esto es un riesgo serio para producción.
- La exactitud exacta de llamada (xLAM ETC) se degrada de 78,99% a 69,25% respecto al checkpoint SFT, y la precisión de nombre de función de 96,86% a 87,51%.
- Solo soporta inglés según la model card.
- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; se debe verificar la licencia del modelo base Qwen2.5-0.5B-Instruct y del dataset, así como la del adaptador.
- Riesgo de alucinación inherente a un modelo de 0,5B: MMLU del 39,28% y MATH-500 del 17,40% indican capacidades de razonamiento limitadas.
- El adaptador requiere cargar el modelo base por separado; no es un modelo autónomo.
- Las evaluaciones son agregados específicos del estudio, no comparables directamente con leaderboards estándar.
- El límite de 640 tokens de prompt en la evaluación xLAM dejó fuera 743 ejemplos, lo que puede sesgar las métricas.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-opd3520-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
