# zhongweixie/qwen3vl-8b-claw-v12-lora

## Resumen

El modelo `zhongweixie/qwen3vl-8b-claw-v12-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Zhongwei Xie, diseñado para mejorar las capacidades de uso de herramientas y razonamiento agéntico del modelo base Qwen/Qwen3-VL-8B-Instruct. Se ha fine-tuneado sobre el dataset `claw-eval` (versión v12 / curriculum_v5), un benchmark orientado a tareas de agente y tool-use, logrando una mejora de +0.0483 en la puntuación total respecto al modelo base sin adaptar.

El adaptador se distribuye como un conjunto de pesos en formato safetensors (1.1 GB) y debe cargarse junto con el modelo base de 8B parámetros. Su relevancia radica en que ofrece una vía ligera y eficiente para especializar un modelo multimodal de última generación en tareas de agente, sin necesidad de reentrenar el modelo completo. La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-VL-8B-Instruct (transformer multimodal) |
| Parametros totales | No disponible (adaptador LoRA; modelo base: 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (entrenamiento) / 256K tokens (modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-VL-8B-Instruct, un modelo de lenguaje multimodal de la familia Qwen3-VL que combina un transformer denso con capacidades de visión y lenguaje. El modelo base soporta contextos intercalados de hasta 256K tokens, integrando texto, imágenes y vídeo. El adaptador LoRA se entrena con rango 32 y alpha 64, sobre un dataset de mensajes SFT (`sft_messages_mixed_v12.jsonl`) extraído de `claw-eval`. El entrenamiento utiliza una estrategia de currículo (curriculum_v5) con dos etapas: una primera con learning rate 1e-6 y una segunda (v12) con 1e-5, longitud máxima de secuencia de 8192 tokens y una sola época. No se menciona el uso de RLHF o DPO; el método es exclusivamente fine-tuning supervisado (SFT).

## Capacidades

- Generación de texto y razonamiento multimodal: hereda las capacidades del modelo base para comprender y generar texto, imágenes y vídeo.
- Uso de herramientas (tool calling): el fine-tuning en `claw-eval` mejora la capacidad de invocar funciones y APIs externas de forma estructurada.
- Razonamiento agéntico: optimizado para tareas que requieren planificación multi-paso y ejecución de acciones.
- Soporte de agentes: puede integrarse en pipelines de agentes autónomos que interactúan con entornos dinámicos.
- Multilingüe: soporta inglés y chino, con posible degradación en otros idiomas.
- Capacidades de visión: al estar basado en Qwen3-VL, puede procesar imágenes y vídeo para tareas como descripción, respuesta a preguntas visuales y razonamiento espacial.

## Casos de uso

- Automatización de tareas de agente: el modelo puede gestionar flujos de trabajo que requieren llamadas a herramientas (por ejemplo, consultas a bases de datos, APIs REST) gracias a su fine-tuning en `claw-eval`, mejorando la fiabilidad en entornos de producción.
- Asistente multimodal para soporte técnico: combina comprensión de imágenes (capturas de pantalla, diagramas) con razonamiento textual para diagnosticar problemas y sugerir soluciones.
- Generación de código con contexto visual: puede interpretar capturas de pantalla de interfaces y generar código correspondiente, útil en desarrollo front-end o automatización de pruebas.
- Análisis de documentos mixtos: procesa documentos que combinan texto, tablas e imágenes, extrayendo información y respondiendo preguntas complejas.
- Agente de compras en línea: integrado en un sistema de agente, puede navegar catálogos, comparar productos y realizar pedidos mediante tool calling.
- Investigación académica: sirve como base para experimentos de fine-tuning en tareas de agente y razonamiento multimodal, gracias a su licencia abierta y disponibilidad de código de entrenamiento.

## Benchmarks y rendimiento

El modelo se evaluó en 300 tareas del benchmark `claw-eval`, divididas en tres series (C, T, M). Los resultados se comparan con el modelo base sin adaptar:

| Métrica | Puntuación | vs Baseline |
|---------|------------|-------------|
| Total | 0.4683 | +0.0483 |
| Serie C (38 tareas) | 0.673 | +0.036 |
| Serie T (161 tareas) | 0.575 | +0.028 |
| Serie M (101 tareas) | 0.222 | +0.016 |

Baseline (modelo base): total=0.420, C=0.637, T=0.547, M=0.206. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: para el modelo base de 8B en FP16, se requieren aproximadamente 16 GB de VRAM. El adaptador LoRA añade una sobrecarga mínima (menos de 1 GB). Con cuantización a 4 bits, podría reducirse a ~6-8 GB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100. En consumer, una RTX 3090 o 4090 es suficiente para inferencia en FP16.
- Opciones de despliegue: se puede servir con `transformers` + `peft` (cargando el adaptador), o fusionar el adaptador con el modelo base y usar `vLLM` o `TGI` para inferencia de alto rendimiento. También es compatible con `llama.cpp` si se convierte a GGUF, aunque no se proporciona dicha conversión.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerá del hardware y del framework de inferencia.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. El adaptador se compara únicamente con su modelo base (Qwen3-VL-8B-Instruct) en el benchmark `claw-eval`. Alternativas de la misma categoría (modelos multimodales de ~8B con fine-tuning para agentes) podrían incluir adaptadores similares sobre Qwen2.5-VL o LLaVA, pero no hay datos públicos para una comparación rigurosa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo completo: requiere cargar el modelo base Qwen3-VL-8B-Instruct, lo que implica descargar ambos componentes.
- Entrenado exclusivamente en inglés y chino: el rendimiento en otros idiomas puede ser deficiente.
- El fine-tuning se realizó sobre un dataset específico (`claw-eval`), por lo que puede presentar sesgos hacia las tareas de ese benchmark y menor generalización en dominios no relacionados.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento multimodal complejo.
- La puntuación en la serie M (0.222) es notablemente baja, lo que sugiere debilidades en tareas de razonamiento matemático o multimodal avanzado.
- No se proporcionan detalles sobre la composición del dataset de entrenamiento, lo que dificulta evaluar posibles sesgos de contenido.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base (Qwen3-VL-8B-Instruct) para cumplir con sus términos.

## Enlaces

- [HuggingFace - zhongweixie/qwen3vl-8b-claw-v12-lora](https://huggingface.co/zhongweixie/qwen3vl-8b-claw-v12-lora)
- [HuggingFace - Qwen/Qwen3-VL-8B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)
- [Colección Qwen3-VL en HuggingFace](https://huggingface.co/collections/Qwen/qwen3-vl)
- [Paper técnico de Qwen3-VL (arXiv)](https://arxiv.org/abs/2511.21631)
- [Repositorio GitHub de Qwen3-VL](https://github.com/QwenLM/Qwen3-VL)
