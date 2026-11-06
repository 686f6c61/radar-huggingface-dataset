# superbigsaw/RoboBeats-0.8B

## Resumen

RoboBeats-0.8B es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B que funciona como una puerta de decisión (gate) visual-lenguaje estrictamente causal para detección de eventos en vídeo. Lo desarrolla el autor superbigsaw en el marco del trabajo "Learning to Live: A Step Toward Lifelong Embodied Intelligence" (arXiv:2611.00180), vinculado al repositorio AgibotTech/LIFE. El modelo observa un flujo de vídeo a 1 fps y asigna a cada fotograma una probabilidad de que acabe de ocurrir un evento nuevo; solo los fotogramas en torno a eventos detectados se escriben en memoria.

El problema que resuelve es el filtrado eficiente de memoria en sistemas de inteligencia encarnada de larga duración: en lugar de almacenar todo el flujo de vídeo, el gate decide qué fragmentos son informativos. Esto reduce drásticamente el coste de almacenamiento y de procesamiento posterior en agentes robóticos que operan de forma continua.

Por su tamaño (0,8B parámetros en el modelo base) y su naturaleza de adaptador, es un componente ligero y desplegable en hardware modesto, pensado para integrarse en pipelines de robótica y agentes embebidos. No es un modelo de propósito general, sino un clasificador especializado de eventos con salida probabilística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen/Qwen3.5-0.8B (VLM, video-text-to-text) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa en trozos de 100 fotogramas con solapamiento de 10) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

RoboBeats-0.8B es un adaptador LoRA que se aplica sobre el modelo base Qwen/Qwen3.5-0.8B, un modelo de visión-lenguaje. La pipeline declarada es video-text-to-text y el modelo está diseñado con un sesgo estrictamente causal: la puntuación en el segundo t utiliza únicamente fotogramas hasta t, lo que lo hace apto para streaming en tiempo real. Para flujos largos, el procesamiento se realiza en bloques de 100 fotogramas con 10 fotogramas de solapamiento.

La lógica de detección de eventos se define por umbrales: un evento se abre cuando la probabilidad supera 0,5 y se cierra cuando cae por debajo de 0,3 (histéresis). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo se publica junto a un artículo (arXiv:2611.00180) y un repositorio de código (AgibotTech/LIFE).

## Capacidades

- Puntuación de eventos en vídeo: asigna a cada fotograma (a 1 fps) la probabilidad de que haya ocurrido un evento nuevo.
- Procesamiento causal en streaming: la puntuación en t solo depende de fotogramas hasta t, sin mirar al futuro.
- Gestión de memoria selectiva: permite conservar únicamente los fragmentos de vídeo alrededor de eventos detectados.
- Procesamiento de flujos largos mediante fragmentación en bloques de 100 fotogramas con solapamiento de 10.
- Integración como gate en pipelines de robótica e inteligencia encarnada.
- Salida probabilística con umbrales de apertura y cierre configurables (0,5 y 0,3 por defecto).
- Soporte de vídeo-texto (video-text-to-text) heredado del modelo base.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Detección de eventos en robótica de larga duración: el modelo actúa como filtro sobre el flujo de cámara de un robot, registrando solo los momentos relevantes (por ejemplo, una manipulación, un cambio de escena o una interacción) y reduciendo el volumen de datos almacenados.
- Memoria episódica en agentes encarnados: integrado en el pipeline LIFE, permite construir una memoria selectiva de eventos para que el agente recuerde lo ocurrido sin almacenar horas de vídeo continuo.
- Vigilancia y monitorización de procesos: al puntuar cada segundo con una probabilidad de evento, puede usarse para marcar automáticamente segmentos de interés en grabaciones industriales o de laboratorio.
- Preprocesado para modelos de vídeo más grandes: al filtrar fotogramas no informativos, reduce el coste computacional de modelos posteriores que solo procesan los fragmentos seleccionados.
- Análisis de vídeo en dispositivos de borde: su tamaño de 0,8B y su naturaleza de adaptador LoRA permiten desplegarlo en hardware modesto para decidir qué enviar a la nube o a un servidor central.
- Segmentación automática de datasets de vídeo: útil para anotar o recortar clips de eventos en la construcción de conjuntos de datos de robótica y visión.
- Detección de cambios de estado en entornos dinámicos: en tareas de navegación o manipulación, el gate puede señalar cuándo el entorno ha cambiado lo suficiente como para requerir replanificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un modelo base de 0,8B, la inferencia en precisión de 16 bits requeriría del orden de 2 GB, aunque el adaptador añade una sobrecarga no cuantificada.
- GPU recomendadas: no disponibles; por tamaño, cabría esperar funcionamiento en GPUs de consumo como RTX 3060, RTX 4060 o superiores, aunque no se confirma en la documentación.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño del modelo base, pero no se especifica en la información disponible.
- Opciones de despliegue: el autor proporciona el repositorio AgibotTech/LIFE con el módulo `robobeats` (comandos `python -m robobeats` y API Python `Gate`/`select`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboBeats-0.8B | 0,8B (base) + LoRA | no disponible | Detección de eventos en vídeo (gate) | apache-2.0 | Hugging Face (adaptador) |
| RoboBeats-2B | 2B (base) + LoRA | no disponible | Detección de eventos en vídeo (gate) | no disponible | Hugging Face (adaptador) |
| RoboBeats-4B | 4B (base) + LoRA | no disponible | Detección de eventos en vídeo (gate) | no disponible | Hugging Face (adaptador) |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos de detección de eventos en vídeo.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de propósito general; su salida es una probabilidad de evento, no texto libre ni respuestas conversacionales.
- Dependencia del modelo base: requiere descargar Qwen/Qwen3.5-0.8B y el repositorio AgibotTech/LIFE para su uso.
- Umbrales fijos por defecto: la apertura (0,5) y cierre (0,3) de eventos son parámetros que pueden requerir ajuste según el dominio.
- Procesamiento fragmentado: los flujos largos se dividen en bloques de 100 fotogramas con solapamiento de 10, lo que puede introducir artefactos en las fronteras.
- Sin datos de sesgos, alucinación o cobertura idiomática: no disponibles en la información proporcionada.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-0.8B y del repositorio LIFE.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa aún inexistentes.
- Tamaño del repo de 0,0 GB: el adaptador es muy ligero, pero no se detalla su contenido exacto.

## Enlaces

- Hugging Face: https://huggingface.co/superbigsaw/RoboBeats-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante 2B: https://huggingface.co/superbigsaw/RoboBeats-2B
- Variante 4B: https://huggingface.co/superbigsaw/RoboBeats-4B
- Paper: https://arxiv.org/abs/2611.00180
- Código: https://github.com/AgibotTech/LIFE
