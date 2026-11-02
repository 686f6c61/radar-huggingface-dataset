# Thox-ai/ThoxClip-Agent-4B

## Resumen

ThoxClip-Agent-4B es un paquete de configuración publicado por Thox-ai sobre los pesos upstream de Qwen/Qwen3-4B. No se trata de un modelo entrenado por el autor: el repositorio contiene únicamente un `Modelfile` de Ollama, un manifiesto de release y un knowledge pack en JSONL con ocho entradas públicas verificadas. El modelo ejecutable se distribuye como etiqueta de Ollama (`Thox-ai/thoxclip-agent-4b`, 2,50 GB en el tag por defecto), que reutiliza la capa del modelo base fijada por digest más una capa de perfil de sistema.

La propuesta del autor es un agente local-first orientado a un dispositivo objetivo denominado ThoxClip (6 GB), pensado para inferencia offline mediante el endpoint local de Ollama. La personalización se limita al perfil de sistema incluido en el Modelfile y al knowledge pack v0.1 para respuestas ancladas a recuperación. El autor declara explícitamente que no ha entrenado los pesos y que el modelo no está cualificado sobre el hardware del dispositivo objetivo.

Su relevancia es acotada: sirve como ejemplo de empaquetado reproducible de un modelo base con un perfil de sistema versionado y un conjunto de conocimiento pequeño, pero no aporta mejoras de capacidad sobre Qwen3-4B. Con 4B parámetros y licencia Apache-2.0, es adecuado para prototipos de agentes locales en hardware modesto, no para tareas que exijan razonamiento o recuperación de conocimiento amplios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-4B; no se detalla en la informacion disponible) |
| Parametros totales | 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluacion del autor); contexto nativo de Qwen3-4B no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4-class (el autor indica que el modelo encaja en hardware para un 4B Q4; el tag publicado de Ollama ocupa 2,50 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (heredada del modelo base; perfil de sistema, knowledge pack y empaquetado son elementos de THOX) |
| Formato de pesos | Pesos upstream gestionados por Ollama (capa base fijada por digest); el repositorio contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl`. No se publican safetensors ni GGUF propios en el repositorio |

## Arquitectura y entrenamiento

No hay entrenamiento por parte de Thox-ai. El modelo parte de Qwen/Qwen3-4B, obtenido a través de la etiqueta de Ollama `qwen3:4b`, fijada en tiempo de build al digest `359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7`. La arquitectura es, por tanto, la del modelo base de Qwen (transformer decoder-only de 4B parámetros); la model card no detalla capas, cabezas de atención ni composición del corpus de preentrenamiento.

La única personalización consiste en un perfil de sistema incluido en el `Modelfile` y el THOX Knowledge Pack v0.1, un fichero JSONL de 4.652 bytes con ocho entradas públicas verificadas para respuestas ancladas a recuperación. No se documentan fases de RLHF, DPO ni ajuste supervisado adicionales. El empaquetado incluye un manifiesto con el pin del modelo base, el perfil y la versión del knowledge pack, lo que permite reproducir el build localmente con `ollama create`.

## Capacidades

- Generación de texto en inglés mediante el endpoint local de Ollama, con funcionamiento autónomo y offline.
- Respuestas ancladas a recuperación cuando se le suministra contexto del knowledge pack: el autor reporta 8/8 temas respondidos con los hechos del pack en la evaluación de grounding.
- Comportamiento de rechazo ante premisas fabricadas: en la prueba de «trampa de topología fabricada», el modelo declinó confirmar la topología inventada.
- Respuestas de enrutamiento etiquetadas como recomendación (local primero, nube solo con consentimiento explícito), sin presentarlas como estado en vivo.
- Capacidad de razonamiento y recall materialmente limitada por el tamaño de 4B, según reconoce el propio autor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito en la información proporcionada.
- Multilingüismo: únicamente inglés declarado.

## Casos de uso

- Asistente local offline en un dispositivo de 6 GB: el modelo se ejecuta íntegramente en CPU o GPU modesta mediante Ollama, sin conexión a red, lo que encaja con el perfil local-first del paquete y con el footprint medido de 3,89 GB de RAM en ejecución CPU.
- Respuestas guiadas por un corpus pequeño y verificado: con el knowledge pack v0.1 suministrado como contexto, el modelo responde sobre los ocho temas cubiertos; útil para FAQs internas o documentación de producto acotada.
- Prototipado de agentes con enrutamiento local/nube: el perfil de sistema fuerza a etiquetar las recomendaciones de enrutamiento y a exigir consentimiento explícito para la nube, lo que sirve como base para políticas de privacidad en asistentes de escritorio.
- Pruebas de robustez frente a alucinación de infraestructura: el comportamiento observado ante la trampa de topología fabricada lo hace útil como caso de test en pipelines de evaluación de agentes que deben abstenerse de inventar estado del sistema.
- Despliegue reproducible en CI: el `Modelfile` y el `manifest.json` con el pin por digest permiten reconstruir exactamente la misma configuración en un pipeline, lo que facilita la auditoría de artefactos de modelo.
- Base para experimentos de empaquetado con knowledge packs: sirve como plantilla para versionar perfiles de sistema y conjuntos de conocimiento junto a un modelo base, sin necesidad de reentrenar.
- Evaluación comparativa de configuraciones sobre Qwen3-4B: al no modificar los pesos, permite aislar el efecto del perfil de sistema y del contexto suministrado frente al modelo base sin configurar.

## Benchmarks y rendimiento

El autor publica mediciones propias realizadas el 2026-11-01 en un host x86_64 solo CPU (4 vCPU, clase 8 GB) con contexto de 8.192 tokens. No son benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K) y no se comparan con otros modelos.

| Metrica | Resultado |
|---|---|
| Generación de texto largo | 15,28 tokens/s (bench de 1.024 tokens) |
| Respuestas cortas | 15,2–16,4 tokens/s en el conjunto de smoke tests |
| Huella de memoria en carga | 3,89 GB de RAM (0 GB de VRAM, ejecución en CPU) |
| Smoke tests de fábrica | 3/3 respondidos de forma coherente y conforme al perfil |
| Grounding con Knowledge Pack v0.1 | 8/8 temas respondidos con los hechos del pack |
| Trampa de topología fabricada | El modelo declinó confirmar la topología inventada |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada, no como estado en vivo |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en el escenario medido (ejecución solo CPU); para un 4B en Q4 se sitúa en torno a 2,5–3 GB de VRAM si se descarga en GPU, aunque el autor no publica cifras de VRAM para ejecución GPU.
- RAM: 3,89 GB medidos en carga sobre un host de clase 8 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con al menos 4–6 GB de VRAM podría alojar un 4B en Q4, pero no hay validación publicada.
- Cabe en GPU consumer: previsiblemente sí en modelos con 6 GB o más, si bien el autor solo ha cualificado el build en CPU y declara que el dispositivo objetivo (ThoxClip, 6 GB) no está cualificado.
- Opciones de despliegue: Ollama (vía `ollama run Thox-ai/thoxclip-agent-4b` o build local con `ollama create`). No se documentan integraciones con vLLM, llama.cpp, TGI ni otros motores.
- Latencia y throughput: 15,28 tokens/s en generación larga y 15,2–16,4 tokens/s en respuestas cortas, medidos en CPU con 4 vCPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxClip-Agent-4B | 4B | 8.192 tokens (usado en evaluación) | Apache-2.0 | Ollama (2,50 GB tag por defecto); repo con Modelfile y knowledge pack | Pesos sin entrenar; perfil de sistema y knowledge pack propios |
| Qwen/Qwen3-4B | 4B | no disponible en la informacion proporcionada | Apache-2.0 | Pesos upstream en HuggingFace y Ollama (`qwen3:4b`) | Modelo base; sin perfil de sistema ni knowledge pack de THOX |
| Alternativas de 4B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas concretas en la informacion proporcionada |

La comparación relevante es contra el propio modelo base: ThoxClip-Agent-4B no modifica los pesos de Qwen3-4B, por lo que sus capacidades intrínsecas son las del base. La diferencia se limita al perfil de sistema y al knowledge pack, cuyo efecto se refleja en las pruebas de grounding y de comportamiento descritas por el autor.

## Limitaciones y advertencias

- Modelo de 4B con razonamiento y recall materialmente limitados; el propio autor recomienda tratar sus respuestas en consecuencia.
- El conocimiento está restringido al knowledge pack suministrado y a la recuperación; sin contexto, el modelo debe declararlo en lugar de inventar especificaciones de THOX.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como modelo sin censura.
- Las acciones externas requieren autorización del runtime; los pesos por sí solos no proporcionan enrutamiento en vivo ni acceso a la malla (MeshStack).
- Solo se declara inglés; no hay soporte multilingüe documentado.
- El dispositivo objetivo ThoxClip (6 GB) no está cualificado sobre hardware: las mediciones se hicieron en un host CPU distinto.
- Las cifras de rendimiento y grounding son autoinformadas por el autor, sin replicación independiente ni comparación con benchmarks estándar.
- Licencia Apache-2.0 heredada del base; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) quedan bajo titularidad de THOX, lo que conviene revisar antes de un uso comercial del paquete completo.
- Riesgo de alucinación presente, aunque el autor reporta que el modelo declinó una premisa de topología fabricada en su prueba específica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Thox-ai/ThoxClip-Agent-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo publicado en Ollama: `Thox-ai/thoxclip-agent-4b` (referencia indicada en la model card; no se proporciona URL directa en la información disponible)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
