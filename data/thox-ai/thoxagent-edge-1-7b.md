# Thox-ai/ThoxAgent-Edge-1.7B

## Resumen

ThoxAgent Edge 1.7B es un paquete de despliegue publicado por Thox-ai sobre los pesos originales de Qwen/Qwen3-1.7B. No se trata de un modelo entrenado ni ajustado por el autor: la model card indica explícitamente que los pesos son byte-idénticos al base fijado (digest `sha256:8f68893c...` del tag `qwen3:1.7b` de Ollama) y que la personalización consiste únicamente en un system profile de agente incluido en el `Modelfile` y un knowledge pack versionado (`thox-knowledge-v0.1.jsonl`, 8 entradas). El repositorio contiene solo esos artefactos de configuración (Modelfile, manifest y pack), no tensores.

El objetivo declarado es el borrador de planes de herramientas en local para hardware de borde: convertir un objetivo de usuario en un plan paso a paso con herramientas que el host pueda autorizar o rechazar. El modelo solo redacta planes; la ejecución siempre requiere autorización del runtime. Funciona de forma autónoma y offline, y se distribuye como tag de Ollama (`thox-ai/thoxagent-edge-1.7b`).

Su relevancia es acotada pero concreta: demuestra un patrón de empaquetado "configuration-derived" (perfil de sistema + knowledge pack + pin de digest) sobre un modelo denso de 1,7B parámetros, con métricas de ejecución en CPU publicadas. Es un artefacto de integración, no un avance de modelado, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B; sin cambios por parte de Thox-ai) |
| Parametros totales | 1,7B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluacion publicada) |
| Tipos de cuantizacion | no disponible (se distribuye via Ollama con el tag base `qwen3:1.7b`; el nivel de cuantizacion del tag no se especifica) |
| Idiomas soportados | en (ingles, declarado en la model card) |
| Licencia | Apache-2.0 (heredada de Qwen3; conservar el aviso Apache) |
| Formato de pesos | Modelfile + manifest.json + knowledge pack JSONL; pesos servidos por Ollama (no se publican safetensors ni GGUF en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-1.7B original: un transformer denso de 1,7B parámetros. Thox-ai no aporta detalles adicionales sobre capas, cabezas de atención, tokenizador ni composición del corpus de preentrenamiento, por lo que esos datos quedan como no disponibles en esta ficha. Tampoco se documenta si el base empleó RLHF, DPO u otras fases de alineamiento; el comportamiento de rechazo es, según el autor, el del modelo base, moderado solo por el perfil de sistema.

No hay entrenamiento ni fine-tuning en este release. La "customización" consiste en dos elementos: (1) un system profile de rol de agente incluido en el `Modelfile` de 1.194 bytes, y (2) el THOX Knowledge Pack v0.1, un fichero JSONL de 4.652 bytes con 8 entradas públicas verificadas, pensado para recuperación local. El `manifest.json` (544 bytes) fija el pin del base, el perfil y la versión del pack. La innovación técnica, por tanto, es de empaquetado y procedencia (pin por digest, separación entre pesos y configuración), no de arquitectura ni de método de entrenamiento.

## Capacidades

- Generación de texto en inglés orientada a la redacción de planes de herramientas paso a paso a partir de un objetivo de usuario.
- Borrador de planes de herramientas para autorización posterior por parte del host (el modelo no ejecuta acciones).
- Uso de un knowledge pack local para fundamentar respuestas en hechos verificados suministrados en el contexto.
- Funcionamiento autónomo y offline en hardware de borde, sin telemetría ni dependencia de servicios externos.
- Comportamiento de rechazo ante preguntas sobre estado del sistema que no puede verificar (documentado en la prueba "fabricated-topology trap").
- Recomendaciones etiquetadas como tales, por ejemplo enrutamiento local-first para datos privados.
- No se documentan capacidades de tool calling nativo, function calling estructurado, agentes multi-paso, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Borrador de planes de herramientas en asistentes de escritorio: el modelo recibe un objetivo en lenguaje natural y devuelve una secuencia de pasos con herramientas candidatas que la aplicación presenta al usuario para aprobación, aprovechando su ejecución en CPU sin GPU.
- Automatización de soporte técnico de primera línea en local: con el knowledge pack cargado en contexto, responde consultas cubiertas por las 8 entradas verificadas y escala el resto, manteniendo los datos del usuario en la máquina.
- Enrutamiento de consultas en arquitecturas híbridas: genera una recomendación etiquetada sobre si procesar una tarea en local o en remoto, útil como paso previo a un orquestador que aplica políticas de privacidad.
- Entornos con requisitos de soberanía de datos: despliegue en equipos sin conectividad ni GPU, con huella de 2,43 GB de RAM a 8.192 tokens de contexto, adecuado para portátiles y mini-PC x86_64.
- Prototipado rápido de flujos de agente: el `Modelfile` y el `manifest.json` sirven como plantilla reproducible para fijar un base por digest y versionar el perfil de sistema y el pack de conocimiento.
- Validación de guardarraíles de rechazo: útil para probar cómo se comporta un modelo pequeño ante preguntas que exigen verificación de estado que no puede realizar, antes de integrarlo en un runtime con autorización de acciones.
- Asistencia en documentación operativa: redacción de planes cortos de resolución de incidencias a partir de procedimientos incluidos en el pack, siempre con validación humana de cada paso.

## Benchmarks y rendimiento

| Medida | Resultado |
|---|---|
| Huella de memoria a 8.192 tokens de contexto | 2,43 GB de RAM, 0,0 GB de VRAM |
| Throughput en texto largo | 14,52 tok/s sobre 1.400 tokens generados |
| Throughput en respuestas cortas | 14,68–25,97 tok/s en el conjunto de fábrica |
| Preguntas de fábrica | 3 prompts ejecutados: Q1 respondida (439 tokens), Q2 respondida (279 tokens), Q3 respondida (967 tokens) |
| Fundamentación con knowledge pack | 6 de 8 temas respondidos con los hechos verificados del pasaje suministrado |
| Trampa de topología fabricada | Rechazada: el modelo se negó a confirmar un estado MeshStack de tres nodos que no puede verificar |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada (local-first para datos privados) |

Medición realizada el 2026-10-31 en CPU x86_64, ejecución solo en CPU, contexto de 8.192 tokens, contra el digest del base fijado. No se publican resultados de MMLU, HumanEval, GSM8K ni de otras suites estándar en la información disponible.

## Requisitos de hardware

- RAM: 2,43 GB medidos a 8.192 tokens de contexto en ejecución solo CPU; el requisito real depende de la cuantización del tag de Ollama, que no se especifica.
- VRAM: 0,0 GB en la configuración medida; no requiere GPU.
- GPU recomendadas: no disponible; el autor no publica perfiles con aceleración. Cualquier GPU con suficiente VRAM para el tag de Ollama podría acelerar la inferencia, pero no hay cifras.
- GPU de consumo: no hay datos publicados sobre qué modelos consumer lo ejecutan ni con qué rendimiento.
- Despliegue: Ollama es la vía soportada (`ollama run thox-ai/thoxagent-edge-1.7b` o construcción local con `ollama create`). No se documentan vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 14,52 tok/s en generación larga y 14,68–25,97 tok/s en respuestas cortas, medidos en CPU x86_64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / acceso | Notas |
|---|---|---|---|---|---|
| ThoxAgent Edge 1.7B | 1,7B | 8.192 (medido) | Apache-2.0 | Ollama; pesos no publicados en el repo | Perfil de sistema + knowledge pack; sin entrenamiento propio |
| Qwen/Qwen3-1.7B | 1,7B | no disponible en esta ficha | Apache-2.0 | Pesos upstream en HuggingFace | Base exacto de este release; misma arquitectura y pesos |
| Otros modelos de ~1-2B para agentes locales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparación relevante es contra el propio Qwen3-1.7B: los pesos son idénticos, de modo que cualquier diferencia de comportamiento proviene exclusivamente del system profile y del knowledge pack. No se han publicado comparaciones con alternativas de terceros.

## Limitaciones y advertencias

- Un modelo de 1,7B redacta planes simples de forma fiable, pero falla en flujos largos y ramificados; el autor recomienda mantener los planes cortos y validar cada paso en el runtime.
- El conocimiento está limitado al pack suministrado y a la recuperación; fuera de esas 8 entradas no hay garantía de fundamentación y el riesgo de alucinación es el del modelo base.
- No dispone de telemetría en vivo ni puede verificar el estado real del sistema; cualquier afirmación sobre topologías o servicios activos debe tratarse como no fiable.
- El comportamiento de rechazo es el del base, moderado solo por el perfil de sistema; no hay un alineamiento específico para seguridad de acciones.
- Las acciones externas requieren autorización del runtime: una recomendación del modelo nunca concede permiso de ejecución.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado ni garantizado.
- Licencia Apache-2.0 heredada de Qwen3: es compatible con uso comercial, pero debe conservarse el aviso Apache; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) se rigen por lo indicado en la model card.
- El repositorio no contiene pesos: quien despliegue debe descargar el base desde Ollama y confiar en el pin por digest indicado.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base.

## Enlaces

- [HuggingFace: Thox-ai/ThoxAgent-Edge-1.7B](https://huggingface.co/Thox-ai/ThoxAgent-Edge-1.7B)
- [Modelo base: Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- Tag de Ollama: `thox-ai/thoxagent-edge-1.7b` (ejecutable con `ollama run thox-ai/thoxagent-edge-1.7b`)
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
