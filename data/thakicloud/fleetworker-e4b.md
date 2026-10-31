# ThakiCloud/FleetWorker-E4B

## Resumen

FleetWorker-E4B es un clasificador ligero para triaje de tareas en tableros de trabajo (task boards), desarrollado por ThakiCloud como un fine-tune del modelo NVIDIA Nemotron 3.5 Bolt E4B (BF16). Dado el título de una tarea —en coreano o inglés— el modelo devuelve un único objeto JSON con la etiqueta del flujo de trabajo (proyecto) al que pertenece la tarea, junto con una sugerencia de prioridad. Es un modelo especializado: no es un asistente conversacional de propósito general, sino un componente de clasificación con salida estructurada pensado para integrarse en flujos de gestión de tareas.

El modelo se publica en dos formatos: como adaptador LoRA sobre el checkpoint base y como pesos fusionados en BF16, además de cuantizaciones GGUF para ejecución local. Con unos 8.000 millones de parámetros totales, está orientado a despliegue on-device y a servir como punto de partida para que otros equipos hagan su propio fine-tune con taxonomías de proyectos distintas. Su relevancia práctica radica en demostrar cómo un modelo pequeño puede automatizar la clasificación previa de incidencias antes de la revisión humana.

Cabe destacar que el propio autor advierte de que el campo de prioridad no es fiable (responde P0 en torno al 80 % de las veces en tareas sin prioridad asignada), por lo que el uso recomendado se limita al campo de proyecto con confirmación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune (LoRA fusionado) de NVIDIA Nemotron 3.5 Bolt E4B; arquitectura base detallada no disponible |
| Parametros totales | 7.996.156.490 (dato real de safetensors) |
| Parametros activos | no disponible (el sufijo E4B sugiere posible naturaleza MoE, pero no está confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (fusionado), Q4_K_M GGUF con imatrix (tamaños completos no disponibles) |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | openmdw-1.1 (licencia "other") |
| Formato de pesos | safetensors (adaptador LoRA y BF16 fusionado), GGUF |

## Arquitectura y entrenamiento

FleetWorker-E4B parte de nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, un checkpoint de NVIDIA de la familia Nemotron, y le aplica un ajuste fino mediante LoRA, publicado tanto como adaptador PEFT (subcarpeta `adapter`) como fusionado en los pesos base en BF16. El modelo base emplea una plantilla de chat propia con control de "thinking mode"; en este fine-tune se usa siempre con `enable_thinking=False` para obtener respuestas directas y compactas.

El entrenamiento se centró en una tarea única: clasificar títulos de tareas en una taxonomía cerrada de 25 nombres genéricos de flujos de trabajo (por ejemplo `synthetic-data-pipeline`, `legal-decision-models`, `point-of-sale-app`), más las etiquetas `other` y `unknown`. Los datos se entrenaron con nombres genéricos descriptivos en lugar de los nombres internos del tablero original, lo que evita filtrar información interna en los pesos pero cuesta unos 3 puntos de precisión frente al modelo con nombres internos. No se dispone de datos sobre el número de tokens, composición detallada del dataset ni uso de RLHF/DPO.

## Capacidades

- Clasificación de títulos de tareas en una taxonomía cerrada de 25 proyectos genéricos, más `other` y `unknown`.
- Salida estructurada: exactamente un objeto JSON compacto con las claves `project` y `priority`.
- Comprensión de títulos de tareas en coreano e inglés.
- Etiquetado conservador: puede responder `unknown` cuando el texto no permite determinar el proyecto.
- Generación determinista recomendada (`do_sample=False`) con un máximo de 64 tokens nuevos.
- Pensado para integración en agentes y pipelines de triaje automático (tags: agents, task-triage, classification).
- No está pensado para conversación general, generación de código, razonamiento matemático ni otras tareas de propósito general.

## Casos de uso

- Pre-clasificación de bandejas de entrada de tareas: antes de la revisión humana, el modelo asigna cada tarea nueva a su flujo de trabajo, reduciendo el trabajo manual de triaje en tableros con alto volumen de incidencias.
- Enrutado automático con confirmación humana: el modelo sugiere la etiqueta de proyecto y una persona la confirma, adecuado para equipos que reciben tareas de múltiples fuentes (soporte, producto, ingeniería).
- Clasificación multilingüe en equipos coreano-inglés: al estar entrenado con títulos en ambos idiomas, sirve a equipos distribuidos que registran tareas en coreano o inglés sin necesidad de traducción previa.
- Base para fine-tuning propio: la taxonomía es sustituible; el modelo sirve como punto de partida para ajustar un clasificador sobre la taxonomía específica de otro tablero, reutilizando el formato de prompt y el pipeline de entrenamiento.
- Integración en pipelines de agentes: dado que emite JSON estricto, puede usarse como componente de enrutado en sistemas multi-agente donde un clasificador decide qué agente especializado atiende cada tarea.
- Automatización en CI/CD o bots de tablero: su pequeño tamaño y disponibilidad en GGUF permiten ejecutarlo localmente y conectarlo a webhooks de GitHub Issues, Jira o herramientas similares para etiquetado automático.
- Procesamiento on-device con privacidad: al poder ejecutarse localmente (GGUF Q4_K_M), las tareas no necesitan salir de la infraestructura del equipo, útil para organizaciones con requisitos de confidencialidad.

## Benchmarks y rendimiento

El autor proporciona un único dato cuantitativo parcial: sobre 151 tareas cuya prioridad nunca fue asignada, el modelo respondió P0 en 120 casos (aproximadamente el 80 %), lo que invalida el campo de prioridad para uso automático. También indica que usar nombres genéricos de proyecto en lugar de los internos cuesta unos 3 puntos de precisión de proyecto. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB para los pesos (8.000 millones de parámetros a 2 bytes), más overhead de activaciones; cifra exacta no disponible.
- VRAM estimada con GGUF Q4_K_M: en torno a 5-6 GB, lo que lo hace viable en GPUs de consumo.
- GPU recomendadas: no disponible; por tamaño, una RTX 4090 (24 GB) o superior cubre el BF16 con holgura, y GPUs de 8 GB pueden ejecutar la versión Q4_K_M.
- Cabe en GPUs de consumo con la cuantización Q4_K_M de llama.cpp; la versión fusionada BF16 requiere GPUs de gama alta o CPU con suficiente RAM.
- Opciones de despliegue: transformers + PEFT (adaptador), transformers (pesos fusionados) y llama.cpp (GGUF); no se menciona soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; la generación se limita a 64 tokens nuevos, por lo que cada inferencia produce salidas muy cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formatos | Licencia |
|---|---|---|---|---|
| ThakiCloud/FleetWorker-E4B | 7.996 millones | Clasificación de tareas (JSON) | LoRA, BF16, GGUF | openmdw-1.1 |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | no disponible (base del anterior) | Propósito general, on-device | BF16 | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se conocen otros clasificadores de tableros de tareas directamente comparables con especificaciones publicadas en la información disponible.

## Limitaciones y advertencias

- El campo `priority` no es fiable: en tareas sin prioridad asignada responde P0 en torno al 80 % de los casos (120 de 151). No debe mostrarse como urgencia ni escribirse de vuelta al tablero; usar únicamente el campo `project`.
- La taxonomía de 25 proyectos es fija y específica del entrenamiento; no sirve como solución directa para otras taxonomías sin un nuevo fine-tune.
- Usar nombres genéricos de proyecto en lugar de los internos reduce la precisión de proyecto en unos 3 puntos.
- Sesgos: no disponible; al ser un clasificador entrenado sobre un tablero concreto, heredará los sesgos de distribución de ese dataset.
- Riesgo de alucinación: mitigado por la salida restringida a etiquetas de la lista del prompt, aunque puede responder `other` o `unknown` de forma incorrecta.
- Limitación de idiomas: solo inglés y coreano; otros idiomas no están soportados.
- Licencia openmdw-1.1: es una licencia "other" distinta de las estándar permisivas; revisar sus términos antes de uso comercial.
- Pensado para uso con confirmación humana, no para decisiones automáticas sin supervisión.
- El "thinking mode" del modelo base debe permanecer desactivado (`enable_thinking=False`) para obtener el formato JSON esperado.

## Enlaces

- Modelo: https://huggingface.co/ThakiCloud/FleetWorker-E4B
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Ficha en coreano: MODEL_CARD.ko.md (incluida en el repositorio del modelo)
- Paper, blog o demo: no disponible
