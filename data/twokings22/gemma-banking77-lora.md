# twokings22/gemma-banking77-lora

## Resumen

El modelo `twokings22/gemma-banking77-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por twokings22, que parte del modelo base `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del modelo instructivo Gemma 3 de 4 mil millones de parámetros. El nombre del repositorio sugiere que el fine-tuning se realizó sobre el dataset Banking77, un corpus de referencia para clasificación de intenciones en el sector bancario con 77 categorías. Este adaptador está pensado para especializar el modelo generativo en tareas de comprensión de consultas financieras y atención al cliente.

La relevancia de este modelo radica en su tamaño compacto (el repositorio ocupa 0,2 GB) y su licencia Apache 2.0, que permite uso comercial sin restricciones. Al ser un LoRA, se puede cargar sobre la base cuantizada de Gemma 3 4B y ejecutarse en hardware de consumo moderado, lo que lo hace atractivo para desarrolladores que necesitan un clasificador de intenciones bancarias con capacidades de generación de texto natural. Sin embargo, el repositorio no incluye documentación detallada sobre el proceso de entrenamiento ni métricas de evaluación, por lo que su rendimiento real debe validarse experimentalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador LoRA es de bajo rango; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Gemma 3 4B soporta hasta 32K tokens, pero no se especifica en el adaptador) |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); adaptador probablemente en fp16/bf16 (no confirmado) |
| Idiomas soportados | en (según etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un LoRA (Low-Rank Adaptation) aplicado sobre `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, una versión de Gemma 3 4B instruct cuantizada a 4 bits con bitsandbytes. El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning mediante optimizaciones de memoria y kernel. Según la model card, el entrenamiento fue "2x faster" gracias a Unsloth. No se especifican detalles sobre el dataset exacto, el número de tokens de entrenamiento, ni si se usaron técnicas como RLHF o DPO. El nombre "banking77" indica que el dataset de fine-tuning probablemente sea Banking77, un conjunto de datos de clasificación de intenciones en el ámbito bancario.

El adaptador LoRA introduce matrices de bajo rango en las capas de atención y MLP del modelo base, lo que permite ajustar el comportamiento del modelo sin modificar todos los parámetros. Esto reduce significativamente el coste computacional y el espacio de almacenamiento en comparación con un fine-tuning completo.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 3 4B instruct.
- Clasificación de intenciones bancarias: el fine-tuning sobre Banking77 debería permitir al modelo identificar la intención del usuario en consultas relacionadas con banca (transferencias, saldos, tarjetas, préstamos, etc.).
- Razonamiento y diálogo multi-turno, gracias a las capacidades del modelo base.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero Gemma 3 4B instruct incluye soporte para estas funcionalidades en su versión original; el adaptador LoRA no debería eliminarlas.
- Capacidades multilingües: no aplica, ya que el repositorio indica solo inglés.
- No se reportan capacidades de visión ni audio.

## Casos de uso

- Atención al cliente bancaria automatizada: el modelo puede interpretar consultas de clientes sobre productos bancarios y clasificarlas en categorías predefinidas (por ejemplo, "activar tarjeta", "consultar saldo", "transferencia internacional"). Gracias a su naturaleza generativa, puede además redactar respuestas en lenguaje natural.
- Enrutamiento de tickets en centros de soporte: dado un mensaje de usuario, el modelo asigna una etiqueta de intención que permite dirigir el ticket al departamento adecuado (fraude, banca online, hipotecas, etc.).
- Chatbots de asesoramiento financiero: integrado en un sistema de diálogo, el modelo puede mantener conversaciones sobre productos bancarios, detectando la intención del usuario y proporcionando información relevante.
- Análisis de sentimiento y detección de quejas: aunque no es su función principal, al estar fine-tuneado en un dominio bancario, puede ayudar a identificar consultas urgentes o negativas.
- Asistente virtual para operaciones bancarias simples: el modelo puede guiar al usuario en procesos como bloqueo de tarjeta o cambio de PIN, clasificando la intención y generando pasos de ayuda.
- Generación de respuestas estandarizadas: en combinación con plantillas, el modelo puede producir respuestas coherentes y contextualizadas para cada categoría de intención, reduciendo el trabajo manual de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o accuracy sobre Banking77 para este adaptador. Se recomienda evaluar el modelo sobre el conjunto de validación de Banking77 o en un entorno de producción antes de desplegarlo.

## Requisitos de hardware

- VRAM estimada: al ser un LoRA sobre un modelo base cuantizado a 4 bits, la inferencia requiere aproximadamente 4-5 GB de VRAM para el modelo base (Gemma 3 4B en 4 bits) más el adaptador, que añade un coste mínimo. En total, se estima unos 5-6 GB.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores pueden ejecutarlo sin problemas. También funciona en GPUs de datacenter como A10, A100 o H100.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs modernas con al menos 8 GB de VRAM.
- Opciones de despliegue: se puede servir con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) o mediante la librería transformers con carga del adaptador. Unsloth también ofrece herramientas de exportación.
- Latencia y throughput: no disponibles. Dependen del hardware y del backend utilizado, pero al ser un modelo de 4B parámetros cuantizado, se espera una latencia de decenas de milisegundos por token en GPUs modernas.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA específicos para Banking77 con los que comparar. Como referencia, se puede comparar con el modelo base Gemma 3 4B instruct sin fine-tuning, que no está especializado en el dominio bancario y probablemente tenga menor precisión en la clasificación de intenciones. Otras alternativas genéricas de clasificación de intenciones suelen usar modelos encoder como BERT o RoBERTa, pero no son directamente comparables en arquitectura ni en capacidades generativas.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|---|
| twokings22/gemma-banking77-lora | LoRA sobre Gemma 3 4B | 4B (base) | No disponible | Apache 2.0 | Banking77 |
| unsloth/gemma-3-4b-it-unsloth-bnb-4bit | Transformer decoder-only | 4B | 32K (según base) | Apache 2.0 | Generalista instruct |
| supergoose/banking77 (LoRA) | LoRA sobre modelo base | No disponible | No disponible | No disponible | Banking77 |

## Limitaciones y advertencias

- Sesgos conocidos: al estar fine-tuneado sobre un dataset de dominio bancario, puede heredar sesgos presentes en los datos, como preferencias por ciertos tipos de clientes o regiones.
- Riesgo de alucinación: al ser un modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en consultas fuera del dominio de entrenamiento.
- Limitaciones de contexto: el adaptador no especifica su longitud de contexto; se asume la del modelo base (32K tokens), pero no está confirmado.
- Restricciones de idioma: solo se declara soporte para inglés; el uso en otros idiomas puede degradar el rendimiento.
- Falta de documentación: no se proporcionan detalles sobre el proceso de entrenamiento, hiperparámetros ni métricas de evaluación, lo que dificulta la reproducibilidad.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base (Gemma 3) y del dataset Banking77, que pueden tener sus propias restricciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/twokings22/gemma-banking77-lora
- Repositorio relacionado con LoRA en Banking77: https://huggingface.co/supergoose/banking77
- Documentación de Gemma 3 (modelo base): https://ai.google.dev/gemma/docs/core/model_card_4 (aunque hace referencia a Gemma 4, la página general de Gemma está disponible)
