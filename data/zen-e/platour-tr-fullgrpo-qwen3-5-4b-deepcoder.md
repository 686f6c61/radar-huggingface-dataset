# zen-E/PLatour-TR-FullGRPO-Qwen3.5-4B-DeepCoder

## Resumen

PLatour-TR-FullGRPO-Qwen3.5-4B-DeepCoder es un checkpoint de investigación publicado por el usuario zen-E en Hugging Face. Se trata de un receptor de texto completo (*full text receiver*) construido sobre el modelo base Qwen/Qwen3.5-4B, con aproximadamente 4.841 millones de parámetros reales según los tensores safetensors. Forma parte del proyecto PLatour, que investiga la transferencia entre modelos (*Prefill-to-Autoregressive Cross-model Transfer*, PACT): un modelo emisor de mayor tamaño codifica el prompt y proporciona representaciones ocultas, mientras que un receptor más pequeño genera la respuesta de forma independiente.

El modelo ha sido entrenado con GRPO (*Group Relative Policy Optimization*) sobre el dataset zen-E/PLatour-DeepCoder-Data, orientado a tareas de código. La innovación principal del proyecto no reside en el modelo en sí, sino en el método: se entrenan puentes lineales ligeros entre *backbones* congelados, partiendo de proyecciones inicializadas a cero y soportando modelos con atención híbrida. El artículo asociado (arXiv:2611.06976) introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar si las mejoras dependen realmente de información útil del emisor o si surgen simplemente de la adaptación del receptor.

Es relevante ahora porque aborda una pregunta metodológica clave en la investigación de transferencia entre modelos: demostrar que una mejora de rendimiento no implica necesariamente una comunicación efectiva entre modelos. El autor advierte explícitamente que se trata de artefactos de inferencia históricos sin puntuaciones de benchmark, y que se requiere evaluación independiente antes de extraer conclusiones comparativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, `qwen3_5_text`), receptor de texto completo sin codificador de visión |
| Parámetros totales | 4.841.450.496 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos originales en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers estándar) |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5 en su variante de texto (`qwen3_5_text`), exportado en formato Transformers estándar. La configuración exportada mantiene deliberadamente independientes los embeddings de entrada y la cabeza de salida, preservando ambos tensores almacenados exactamente como estaban; la carga útil original en BF16 no se ha modificado. El paquete no incluye codificador de visión.

El entrenamiento se realizó mediante GRPO (optimización de política con recompensas de grupo) sobre el dataset zen-E/PLatour-DeepCoder-Data, con el objetivo de producir un receptor especializado en tareas de código. En el marco del proyecto PLatour, este receptor se concibe para funcionar junto a un emisor de mayor tamaño que le suministra representaciones ocultas del prompt a través de puentes lineales entrenados con recompensas de tarea. La configuración y el tokenizador base del export están fijados a la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` de Qwen/Qwen3.5-4B, lo que fija la dependencia actual del export pero no implica que el entrenamiento histórico usara esa revisión. Las comprobaciones de carga locales se realizaron con Torch 2.15.0, Transformers 5.22.1 y PEFT 0.21.2.

## Capacidades

- Generación de texto conversacional en formato Transformers (`text-generation`, etiqueta `conversational`).
- Especialización en tareas de código derivada del dataset DeepCoder y del entrenamiento con GRPO.
- Funciona como receptor de texto completo dentro del marco PACT: recibe representaciones ocultas de un emisor de mayor tamaño y genera la respuesta de forma independiente.
- Compatibilidad con endpoints (`endpoints_compatible` según las etiquetas del repositorio).
- Soporte de atención híbrida heredado del backbone Qwen3.5 (el método PACT soporta modelos con atención híbrida).
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en transferencia entre modelos: el modelo sirve como receptor en experimentos PACT para estudiar si la información del emisor mejora realmente la generación, usando los controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para descartar mejoras atribuibles solo a la adaptación del receptor.
- Reproducción de experimentos académicos: permite replicar el pipeline descrito en arXiv:2611.06976 con un checkpoint de texto completo en formato Transformers estándar, sin necesidad de infraestructura propietaria.
- Estudio de entrenamiento con GRPO sobre tareas de código: sirve como referencia para analizar cómo afecta el ajuste por recompensas de grupo a un modelo base de ~4.800 millones de parámetros.
- Evaluación metodológica de benchmarks: al ser un artefacto histórico sin puntuaciones publicadas, es útil para diseñar protocolos de evaluación independientes y comparar contra el modelo base Qwen/Qwen3.5-4B.
- Base para experimentos de destilación o comunicación entre modelos: el receptor puede combinarse con distintos emisores para medir la transferencia de representaciones ocultas a través de puentes lineales.
- Fine-tuning posterior sobre dominios específicos de código: al estar en formato Transformers y con licencia Apache 2.0, puede adaptarse con PEFT o ajuste completo en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que se trata de artefactos de inferencia históricos sin puntuaciones de benchmark, y que el empaquetado no establece un protocolo de selección de checkpoint ni una evaluación imparcial.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,7 GB solo para pesos (tamaño del repositorio), más memoria para activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB de VRAM en BF16.
- En cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits: en torno a 3 GB, aunque los tipos de cuantización no están documentados en la información disponible.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en BF16 sin cuantizar; GPU consumer de gama alta (RTX 3090, RTX 4080/4090) suficientes con cuantización.
- Cabe en GPU consumer: sí, especialmente con cuantización; en BF16 requiere tarjetas con 16 GB o más.
- Opciones de despliegue: Transformers (probado con Torch 2.15.0, Transformers 5.22.1 y PEFT 0.21.2), compatible con endpoints; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| PLatour-TR-FullGRPO-Qwen3.5-4B-DeepCoder | 4.841 M | No disponible | Apache 2.0 | Receptor PACT entrenado con GRPO sobre datos de código; sin benchmarks publicados |
| Qwen/Qwen3.5-4B (modelo base) | ~4 B (no confirmado en la información) | No disponible | No disponible en la información | Modelo base del que deriva el checkpoint |
| Qwen3-4B (referencia de fine-tuning) | ~4 B | No disponible | No disponible en la información | Citado en la documentación de Azure Databricks como ejemplo de ajuste completo en una H100 |

La comparación con alternativas de la misma categoría (receptores PACT o modelos de código de ~4 B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que son artefactos de inferencia históricos sin puntuaciones de benchmark; no deben usarse para reclamaciones comparativas sin evaluación independiente.
- El empaquetado no establece un protocolo de selección de checkpoint ni una evaluación imparcial; la procedencia debe reportarse con precisión.
- Las comprobaciones de carga y de prompts sintéticos no reproducen la precisión de benchmark ni una trayectoria de entrenamiento histórica.
- La revisión del modelo base fijada en el export corresponde a la dependencia actual, no necesariamente a la usada en el entrenamiento original.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera del inglés o del dominio de código.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero siguen aplicándose los términos y avisos del modelo upstream (Qwen).
- No incluye codificador de visión; no debe esperarse capacidad multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-TR-FullGRPO-Qwen3.5-4B-DeepCoder
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Ejemplo de fine-tuning de Qwen3-4B en Azure Databricks: https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
