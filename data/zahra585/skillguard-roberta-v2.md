# ZAHRA585/skillguard-roberta-v2

## Resumen

SkillGuard-RoBERTa-v2 es un modelo de clasificación de texto basado en la arquitectura RoBERTa, desarrollado por el usuario ZAHRA585 y publicado en HuggingFace. Con 124,6 millones de parámetros, el modelo está diseñado para la detección de patrones maliciosos en archivos de habilidades (skills) de agentes de IA, incluyendo inyección de prompts, exfiltración de datos y bypass de guardarraíles. El nombre "SkillGuard" y los tags asociados sugieren un enfoque específico en la seguridad de agentes de IA, un área de creciente relevancia a medida que estos sistemas ganan capacidades de ejecución de código y acceso a herramientas.

El modelo se presenta como una herramienta de seguridad especializada, probablemente entrenada mediante fine-tuning de RoBERTa sobre un dataset de ejemplos de ataques y comportamientos maliciosos. La versión "v2" indica una iteración posterior al modelo original, posiblemente con mejoras en precisión o cobertura. Sin embargo, la model card oficial está prácticamente vacía, con la mayoría de los campos marcados como "[More Information Needed]", lo que limita severamente la información verificable sobre su entrenamiento, datos y rendimiento. El repositorio asociado en GitHub (gauravsingh1995/skillguard) describe una herramienta más amplia de escaneo de seguridad para agentes de IA, de la cual este modelo podría ser un componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RoBERTa (Robustly Optimized BERT Approach) es una variante de BERT que introduce mejoras en el preentrenamiento: entrenamiento con más datos, secuencias más largas, eliminación de la predicción de siguiente oración (NSP) y uso de máscaras dinámicas. La arquitectura es un transformer encoder apilado, con atención bidireccional, optimizado para tareas de comprensión del lenguaje. En este caso, el modelo se ha adaptado mediante fine-tuning para la tarea específica de clasificación de texto orientada a la detección de amenazas de seguridad.

Los detalles del entrenamiento no están disponibles en la información pública. No se conocen el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. El tamaño del repositorio (0,5 GB) y el número de parámetros sugieren un modelo de tamaño medio, similar a roberta-base. La referencia al paper de Lacoste et al. (2019) en la model card es estándar y no implica necesariamente que se haya realizado un análisis de impacto ambiental.

## Capacidades

- Detección de inyección de prompts en archivos de habilidades de agentes de IA.
- Identificación de patrones de exfiltración de datos.
- Detección de intentos de bypass de guardarraíles de seguridad.
- Clasificación de texto binaria o multiclase (el número exacto de clases no está especificado).
- Procesamiento de texto en formato markdown, como se indica en el espacio de HuggingFace asociado.
- Integración con pipelines de transformers para clasificación de texto.
- Compatible con la librería transformers y con text-embeddings-inference para despliegue en producción.

## Casos de uso

- Auditoría de seguridad de agentes de IA: el modelo puede analizar los archivos de habilidades (skills) que un agente como Claude Code o ChatGPT va a ejecutar, detectando inyecciones de prompts maliciosos antes de que se ejecuten.
- Filtrado de contenido en pipelines de integración continua: integrar el modelo como paso de validación en un pipeline CI/CD que revise automáticamente los cambios en los archivos de habilidades de agentes, bloqueando aquellos que contengan patrones sospechosos.
- Monitorización de agentes en producción: desplegar el modelo como servicio de clasificación en tiempo real para analizar las instrucciones que recibe un agente y alertar si se detectan intentos de manipulación.
- Análisis forense de incidentes: utilizar el modelo para analizar logs de interacciones con agentes de IA y determinar si se produjeron ataques de inyección de prompts o intentos de exfiltración de datos.
- Desarrollo de herramientas de seguridad: servir como base para construir utilidades de escaneo de seguridad más amplias, como el proyecto SkillGuard de GitHub, que ofrece un escáner multi-lenguaje para agentes de IA.
- Investigación académica: emplear el modelo como punto de partida para investigar técnicas de detección de ataques a agentes de IA y comparar su eficacia con otros enfoques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124,6M parámetros × 4 bytes), lo que permite ejecución en cualquier GPU moderna con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 2060 o superior) es suficiente para inferencia en FP32.
- Compatible con CPU: el modelo es lo suficientemente pequeño para ejecutarse en CPU con latencias aceptables (del orden de 50-100 ms por clasificación).
- Opciones de despliegue: vLLM, HuggingFace Inference Endpoints, TGI (Text Generation Inference), o simplemente la librería transformers en modo PyTorch.
- Latencia estimada: inferior a 10 ms en GPU moderna y alrededor de 50-100 ms en CPU para secuencias cortas.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos directamente comparables en la misma tarea específica (detección de inyección de prompts en skills de agentes). Modelos de seguridad más amplios como ProtectAI/deberta-v3-base-prompt-injection-v2 o deepset/deberta-v3-base-injection podrían ser alternativas, pero no se dispone de datos de rendimiento del modelo evaluado para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no se especifican datos de entrenamiento, métricas de evaluación, ni limitaciones conocidas. Esto impide evaluar la fiabilidad del modelo con rigor.
- No se indica la licencia del modelo, lo que dificulta su uso comercial sin riesgo legal.
- No se especifican los idiomas soportados; el modelo podría tener un rendimiento degradado en idiomas distintos del inglés.
- El autor (ZAHRA585) tiene un espacio asociado (ZOHRA585/skillguard) que muestra una demo, pero la autoría y el mantenimiento del proyecto no están claros.
- Al ser un modelo de seguridad, existe el riesgo de falsos positivos (bloquear skills legítimas) y falsos negativos (dejar pasar ataques), con consecuencias potencialmente graves en entornos de producción.
- No hay evidencia de evaluación externa o auditoría del modelo.
- El nombre "skillguard-roberta-v2" sugiere que es la segunda versión, pero no se documentan los cambios respecto a la v1.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZAHRA585/skillguard-roberta-v2
- Modelo original v1: https://huggingface.co/ZAHRA585/skillguard-roberta
- Espacio de demostración: https://huggingface.co/spaces/ZOHRA585/skillguard
- Repositorio GitHub del proyecto SkillGuard: https://github.com/gauravsingh1995/skillguard
- Paper de referencia de RoBERTa: https://arxiv.org/abs/1910.09700
