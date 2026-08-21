# tuan2294/lab21-2A202601618-qwen35-triage-vi

## Resumen

El modelo `tuan2294/lab21-2A202601618-qwen35-triage-vi` es un adaptador LoRA de 0.2 GB desarrollado por Nguyen Duc Anh Tuan sobre el modelo base Qwen/Qwen3.5-9B. Está diseñado específicamente para la tarea de triage de tickets de soporte de comercio electrónico en vietnamita, transformando un ticket de texto sin formato en una salida JSON estructurada con los campos `intent`, `urgency`, `product` y `sentiment`. El adaptador se entrenó con 2 épocas y 30 pasos, con un learning rate de 1e-4 y target modules `text-linear`.

El modelo se presenta como un ejercicio de fine-tuning (lab) y no como un producto listo para producción. El propio autor reporta un fallo claro en la prueba de regresión de cuatro grupos: aunque el adaptador mejora la tarea objetivo (0.990 frente a 0.815 de la línea base con prompt optimizado), sufre una caída drástica en capacidades generales (regresión de 0.742 a 0.133), un caso típico de olvido catastrófico por entrenar únicamente con un corpus de forma única (ticket → JSON) sin datos de replay. Por tanto, no se recomienda su despliegue tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-9B (modelo base transformer) |
| Parametros totales | No disponible (adaptador de 0.2 GB; el base tiene 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del base) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) y adapter_config.json |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA con r=16, alpha=32 y target modules `text-linear`, lo que sugiere una variante de atención lineal en el modelo base, aunque no se confirma en la documentación. El entrenamiento se realizó sobre el modelo Qwen3.5-9B con un conjunto de datos de tickets de soporte de e-commerce vietnamita, sin datos de replay. Se usaron 2 épocas y 30 pasos con un learning rate de 1e-4. No se menciona el uso de RLHF ni DPO; el proceso es un fine-tuning supervisado estándar.

La principal innovación técnica es la especialización en una tarea concreta de clasificación estructurada, pero el diseño del dataset (una única forma de entrada-salida) provoca un olvido catastrófico severo, como documenta el autor en su informe. No se detallan más innovaciones arquitectónicas.

## Capacidades

- Clasificación de tickets de soporte en vietnamita: genera JSON con `intent`, `urgency`, `product` y `sentiment`.
- Salida estructurada en formato JSON, útil para integración con sistemas de ticketing.
- No se reportan capacidades generales de generación de texto, razonamiento, código o matemáticas; de hecho, la regresión en capacidades generales es severa (0.133 frente a 0.742 de la línea base).
- No se menciona soporte de tool calling, agentes ni multi-step reasoning.
- Multilingüe: solo vietnamita (etiqueta `vi`).
- No se indica modo de pensamiento, visión ni audio.

## Casos de uso

- Triage automático de tickets de soporte en vietnamita: el adaptador puede clasificar un ticket entrante y extraer la intención, urgencia, producto y sentimiento en formato JSON, lo que permite enrutar automáticamente a los equipos adecuados. Es adecuado si se corrige el problema de olvido catastrófico añadiendo datos de replay.
- Priorización de incidencias: al extraer el campo `urgency`, se puede ordenar la cola de soporte según la urgencia detectada, mejorando los tiempos de respuesta en casos críticos.
- Análisis de sentimiento del cliente: el campo `sentiment` permite monitorizar la satisfacción del usuario y detectar tickets con tono negativo para una atención prioritaria.
- Integración con sistemas de helpdesk: la salida JSON se puede consumir directamente por APIs de plataformas como Zendesk o Freshdesk para automatizar la clasificación y asignación.
- Generación de informes de calidad de servicio: agregando los campos `intent` y `product`, se pueden generar estadísticas sobre los motivos de contacto más frecuentes y los productos con más incidencias.
- Entrenamiento de modelos de clasificación más robustos: el adaptador puede servir como punto de partida para un fine-tuning posterior con datos mixtos, aunque actualmente no es recomendable su uso directo en producción.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en su model card, comparando el adaptador con dos líneas base (prompt naive y prompt optimizado) sobre el modelo base sin adaptar:

| Metrica | (a) base + naive prompt | (b) base + optimized prompt | Este adaptador |
|---|---|---|---|
| Target (tarea de triage) | 0.000 | 0.815 | 0.990 |
| Regression (capacidad general) | 0.742 | 0.742 | 0.133 |
| Format (salida JSON correcta) | 0.000 | 1.000 | 1.000 |
| Latencia (ms) | 2878 | 767 | 1239 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.2 GB, pero el modelo base Qwen3.5-9B requiere una VRAM considerable. Para inferencia en FP16, se estiman al menos 18 GB de VRAM; con cuantización (por ejemplo, 4 bits) se puede reducir a unos 6-8 GB, aunque no se especifica en la documentación.
- GPU recomendadas: tarjetas con 16 GB o más (RTX 4090, A100, H100) para FP16; GPUs de 8 GB (RTX 3080, RTX 4070) pueden funcionar con cuantización.
- Es posible desplegar con vLLM, llama.cpp, Ollama o TGI cargando el adaptador sobre el base cuantizado, aunque no hay instrucciones oficiales.
- La latencia reportada es de 1239 ms en el entorno de evaluación del autor, sin especificar el hardware utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos de la misma categoría. Existe otro adaptador similar en Hugging Face (`liemnd4/lab21-qwen35-triage-vi-2a202601421`) con la misma tarea, pero no se han publicado sus métricas. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Olvido catastrófico severo: la regresión en capacidades generales cae de 0.742 a 0.133, lo que hace que el modelo sea inutilizable para tareas fuera del triage de tickets.
- No recomendado para producción: el propio autor indica explícitamente que no es seguro desplegarlo como endpoint de propósito general sin mezclar datos de replay (1-5%) en el entrenamiento.
- Riesgo de alucinación: al estar especializado en un formato de salida rígido, puede generar JSON incorrecto o inventar campos si la entrada no se ajusta al patrón esperado.
- Sesgos potenciales: el entrenamiento se realizó sobre un corpus de tickets de e-commerce vietnamita, por lo que puede no generalizar a otros dominios o variantes del idioma.
- Licencia no especificada: no se indica la licencia del adaptador, lo que genera incertidumbre sobre su uso comercial.
- Limitación de idioma: solo soporta vietnamita; no hay soporte multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/tuan2294/lab21-2A202601618-qwen35-triage-vi
- Repositorio GitHub con metodología y código: https://github.com/nt15032/Day21-Track3-Finetuning-Lab-2A202601618-NguyenDucAnhTuan
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B (referencia, no se ha verificado su existencia en la búsqueda web)
