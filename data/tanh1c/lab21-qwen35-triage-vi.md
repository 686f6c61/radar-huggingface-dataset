# tanh1c/lab21-qwen35-triage-vi

## Resumen

El modelo `tanh1c/lab21-qwen35-triage-vi` es un adaptador LoRA desarrollado por el autor `tanh1c` sobre el modelo base `Qwen/Qwen3.5-9B`. Su propósito es clasificar tickets de soporte al cliente en vietnamita, generando una salida JSON estructurada con cuatro campos: `intent`, `urgency`, `product` y `sentiment`. Está diseñado para tareas de triage automático en sistemas de atención al cliente, donde se necesita extraer rápidamente la intención, la urgencia, el producto implicado y el sentimiento del usuario.

El adaptador fue entrenado con 225 tickets sintéticos en vietnamita, con un rank de 16 y alpha de 32, durante 2 épocas (30 pasos de optimización) en una GPU A100. Aunque los resultados de precisión en los campos objetivo son altos (0.990), la model card reporta una regresión significativa en las capacidades generales del modelo base, por lo que el autor lo marca como "FAILED" para un despliegue amplio. Esto lo convierte en una pieza experimental o de demostración, más que en un componente listo para producción sin mitigaciones adicionales.

La relevancia actual radica en su enfoque específico para el idioma vietnamita y su formato de salida JSON, que facilita la integración en pipelines de procesamiento de tickets. Sin embargo, su limitación principal (sobre-aplicación del esquema a preguntas generales) exige un enrutamiento previo o un mecanismo de mitigación antes de usarlo en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-9B (transformer decoder) |
| Parametros totales | No disponible (adaptador LoRA rank 16, alpha 32; el modelo base tiene 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado a las capas lineales del decoder de Qwen3.5-9B. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango (rank 16, alpha 32) en las proyecciones lineales, lo que permite un fine-tuning eficiente con pocos parámetros entrenables. El entrenamiento se realizó con 225 ejemplos sintéticos de tickets de soporte en vietnamita, durante 2 épocas (30 pasos de optimización), con una tasa de aprendizaje de 1e-4, precisión bf16 y hardware A100-SXM4-40GB.

No se reportan innovaciones técnicas más allá del uso estándar de LoRA. El objetivo era que el modelo generara una salida JSON con cuatro campos (`intent`, `urgency`, `product`, `sentiment`) a partir de un ticket de entrada. La model card indica que el adaptador logra una precisión de 0.990 en los campos objetivo y un cumplimiento de formato del 1.000, pero también una regresión significativa en las capacidades generales del modelo base (puntuación de regresión 0.1333 frente a 0.7422 del base), lo que llevó al autor a declarar el experimento como "FAILED" para uso general.

## Capacidades

- Clasificación de tickets de soporte en vietnamita: genera un JSON con `intent`, `urgency`, `product` y `sentiment`.
- Salida estructurada en JSON, lo que facilita la integración en sistemas automatizados.
- Alta precisión en los campos objetivo (0.990) y cumplimiento de formato perfecto (1.000) en el conjunto de evaluación.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un adaptador de propósito específico.
- Capacidad multilingüe limitada: solo entrenado para vietnamita, aunque el modelo base podría soportar otros idiomas, el adaptador no está validado para ellos.
- No incluye modo de pensamiento, visión ni audio.

## Casos de uso

- Triage automático de tickets de soporte: el modelo puede recibir un ticket en vietnamita y devolver un JSON con la intención, urgencia, producto y sentimiento, permitiendo enrutar automáticamente el ticket al equipo adecuado.
- Priorización de incidencias: gracias al campo `urgency`, se pueden ordenar los tickets por nivel de urgencia y atender primero los críticos.
- Análisis de sentimiento del cliente: el campo `sentiment` permite detectar frustración o satisfacción, útil para escalar casos problemáticos.
- Clasificación por producto: el campo `product` ayuda a agrupar tickets por línea de producto o servicio, facilitando el análisis de incidencias recurrentes.
- Integración en sistemas de helpdesk: al generar JSON, se puede conectar directamente con APIs de plataformas como Zendesk, Freshdesk o sistemas propios mediante un pequeño script de parsing.
- Demostración educativa de fine-tuning con LoRA: sirve como ejemplo práctico de cómo adaptar un modelo grande a una tarea específica con pocos datos y recursos limitados.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados medidos:

| Metrica | Valor |
|---|---|
| Precision en campos objetivo | 0.990 |
| Cumplimiento de formato | 1.000 |
| Baseline del modelo base (sin adaptador) | 0.815 |
| Puntuacion de regresion (adaptador) | 0.1333 |
| Puntuacion de regresion (modelo base) | 0.7422 |
| Veredicto de regresion | FAILED (caida de capacidad general de 0.609) |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.2 GB), pero requiere cargar el modelo base Qwen3.5-9B para inferencia.
- VRAM estimada: al menos 18 GB en bf16/fp16 para el modelo base; con cuantizacion 4-bit se puede reducir a unos 6-8 GB.
- GPU recomendadas: A100 (usada en entrenamiento), RTX 4090, RTX 3090, o GPUs con 24 GB o más para fp16. Para cuantizacion 4-bit, una RTX 3060 de 12 GB podría ser suficiente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o mediante la libreria PEFT de HuggingFace para cargar el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles; dependeran del hardware y del tamaño del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para triage de tickets en vietnamita). La busqueda web no arroja alternativas directas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El adaptador sobre-aplica el esquema JSON de triage a preguntas generales, lo que degrada su utilidad como asistente conversacional.
- La model card indica una regresion significativa en las capacidades generales del modelo base (caida de 0.609 en la puntuacion de regresion), por lo que no debe usarse como reemplazo de un asistente general sin enrutamiento o mitigacion de datos de reproduccion.
- Entrenado exclusivamente con 225 tickets sinteticos en vietnamita; puede tener sesgos derivados de la generacion sintetica y no generalizar bien a variaciones reales del lenguaje.
- Solo validado para el idioma vietnamita; su comportamiento en otros idiomas no esta garantizado.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte que el adaptador no esta listo para despliegue amplio.
- No se proporcionan datos sobre alucinaciones, pero al ser un adaptador sobre un modelo generativo, existe riesgo de salidas inconsistentes si la entrada no se ajusta al dominio de tickets.

## Enlaces

- HuggingFace: https://huggingface.co/tanh1c/lab21-qwen35-triage-vi
- Repositorio GitHub del autor (informe del laboratorio): https://github.com/tanh1c/Day21-Track3-Finetuning-Lab-2A202601755-ChuNguyenTuanAnh/blob/main/BONUS-CHALLENGE.md
- Version en ingles del informe: https://github.com/tanh1c/Day21-Track3-Finetuning-Lab-2A202601755-ChuNguyenTuanAnh/blob/main/BONUS-CHALLENGE-EN.md
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
- Qwen Studio: https://qwen.ai/home
