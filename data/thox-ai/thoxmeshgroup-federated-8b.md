# Thox-ai/ThoxMeshGroup-Federated-8B

## Resumen

ThoxMeshGroup-Federated-8B es un empaquetado del modelo Qwen3-8B publicado por Thox-ai bajo la marca THOX. No se trata de un modelo entrenado por el autor: el repositorio contiene únicamente el `Modelfile` de Ollama, un `manifest.json` y un knowledge pack en JSONL con ocho entradas verificadas. Los pesos son los originales de Qwen/Qwen3-8B, fijados a un digest concreto de la etiqueta `qwen3:8b` de Ollama. La propuesta de valor no es un nuevo modelo, sino una configuración reproducible con perfil de sistema y recuperación documental sobre una base conocida.

El modelo resuelve un problema de despliegue: ofrecer un paquete listo para ejecutar en local mediante Ollama, con un perfil de sistema predefinido para el rol de "MeshGroup" (enrutamiento de peticiones a nivel de sitio) y un knowledge pack versionado que sirve de contexto para respuestas fundamentadas. Está pensado para inferencia local, incluso offline, en hardware que pueda ejecutar un modelo de 8B en cuantización Q4.

Es relevante ahora por su enfoque "local-first" y "configuration-derived": separa el empaquetado de la configuración del entrenamiento, lo que permite reproducibilidad y auditoría. No obstante, el propio autor advierte que "federated" aquí significa solo enrutamiento de peticiones a nivel de sitio, no inferencia distribuida entre nodos, y que el modelo no ha sido entrenado por THOX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-8B); no se detalla en la información disponible |
| Parametros totales | 8B (según etiqueta y model card) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | 8.192 tokens (medido en la evaluación del autor; no se especifica el máximo nativo de Qwen3-8B) |
| Tipos de cuantizacion | Q4-class (el modelo publicado en Ollama ocupa 5,23 GB; no se listan otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | Ollama (Modelfile + capas); los pesos subyacentes son los de Qwen/Qwen3-8B; no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por Thox-ai. La arquitectura es la de Qwen/Qwen3-8B, un transformer de 8.000 millones de parámetros, del que no se detallan en la información proporcionada capas, atención ni innovaciones internas. La personalización consiste en un perfil de sistema incluido en el `Modelfile` y un knowledge pack (`thox-knowledge-v0.1.jsonl`) con ocho entradas públicas verificadas, usado para respuestas fundamentadas por recuperación.

No hay datos sobre número de tokens de entrenamiento, composición del dataset ni si se aplicó RLHF o DPO, ya que el autor no entrenó los pesos. La base está fijada al digest `500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41` de la etiqueta `qwen3:8b` de Ollama. El empaquetado incluye un manifiesto de release con la versión del perfil y del knowledge pack, lo que aporta trazabilidad de la configuración.

## Capacidades

- Generación de texto en inglés, con respuestas cortas y generación de formato largo.
- Respuestas fundamentadas mediante el knowledge pack suministrado (8 entradas en la versión 0.1).
- Enrutamiento de peticiones a nivel de sitio como recomendación etiquetada (local primero, nube solo con consentimiento explícito), no como estado en vivo.
- Ejecución local y offline a través del endpoint local de Ollama.
- Integración opcional con el runtime THOX para descubrimiento MeshStack y ejecución autorizada.
- Comportamiento de rechazo heredado del modelo base, moderado por el perfil de sistema; no se comercializa como "uncensored".
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente local de consultas sobre documentación interna: el modelo responde usando el knowledge pack suministrado como contexto, adecuado para entornos sin conectividad y con requisitos de privacidad.
- Enrutamiento de peticiones a nivel de sitio: genera recomendaciones etiquetadas (local primero, nube con consentimiento) que un runtime puede validar antes de ejecutar, útil en arquitecturas con dominios de seguridad aislados.
- Despliegue en hardware modesto: con 6,68 GB de RAM en CPU y sin VRAM, encaja en hosts x86_64 de clase 4 vCPU / 8 GB para tareas de baja concurrencia.
- Pruebas de humo y validación de configuración: el paquete permite reconstruir el modelo desde el repositorio y verificar el perfil de sistema y el knowledge pack en pipelines de CI.
- Base para prototipos de asistentes empresariales en inglés: al ser Apache-2.0 y ejecutarse en Ollama, sirve para validar flujos antes de escalar a modelos mayores.
- Auditoría de procedencia: el manifiesto y los hashes SHA-256 permiten verificar la integridad del empaquetado y de la base fijada en despliegues regulados.

## Benchmarks y rendimiento

El autor publica mediciones propias del 2026-11-01 en un host x86_64 solo CPU (4 vCPU / 8 GB), a 8.192 tokens de contexto:

| Metrica | Resultado |
|---|---|
| Generación de formato largo (bench de 1.024 tokens) | 8,75 tokens/s |
| Respuestas cortas (conjunto de smoke) | 8,8–9,2 tokens/s |
| Huella de memoria en carga | 6,68 GB RAM (0 GB VRAM, ejecución en CPU) |
| Preguntas de humo de fábrica | 3/3 respondidas de forma coherente y según el perfil |
| Grounding del Knowledge Pack v0.1 (pasaje suministrado) | 8/8 temas respondidos con los hechos del pack |
| Trampa de topología fabricada | El modelo rechazó confirmar la topología inventada |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada, no como estado en vivo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la medición publicada (ejecución en CPU con 6,68 GB de RAM); para GPU, un modelo de 8B en Q4 requiere aproximadamente 5-6 GB de VRAM, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No se confirma; por tamaño (8B, Q4-class, 5,23 GB), es plausible en GPUs con 8 GB o más de VRAM, pero el autor no lo documenta.
- Opciones de despliegue: Ollama (publicado como `Thox-ai/thoxmeshgroup-federated-8b`); también se puede construir desde el repositorio con `ollama create`. No se mencionan vLLM, llama.cpp, TGI ni otros.
- Latencia y throughput: 8,75 tokens/s en generación larga y 8,8–9,2 tokens/s en respuestas cortas, medidos en CPU (4 vCPU / 8 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxMeshGroup-Federated-8B | 8B | 8.192 (medido) | Apache-2.0 | Ollama + repo HF (empaquetado) | Configuración derivada de Qwen3-8B; sin entrenamiento propio |
| Qwen/Qwen3-8B | 8B | no disponible | Apache-2.0 (según base) | Hugging Face | Modelo base original; sin perfil ni knowledge pack |
| Alternativas de 8B de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos comparativos en la información |

La comparación directa con otros modelos de 8B no está disponible en la información proporcionada; el único punto de referencia documentado es el propio Qwen3-8B como base.

## Limitaciones y advertencias

- Modelo de 8B con razonamiento y recuerdo materialmente limitados; el autor lo advierte explícitamente.
- El conocimiento está limitado al knowledge pack suministrado y a la recuperación; sin contexto, el modelo debe indicarlo en lugar de inventar especificaciones de THOX.
- Riesgo de alucinación inherente al modelo base; el perfil de sistema solo lo modera.
- El comportamiento de rechazo es el del modelo base; no se comercializa como "uncensored".
- "Federated" significa únicamente enrutamiento de peticiones a nivel de sitio; no existe ni se reclama inferencia distribuida que reparta un modelo entre nodos.
- Los grupos corporativos son dominios de seguridad aislados; las peticiones entre sitios requieren concesiones de política explícitas y transporte autenticado.
- Las acciones externas requieren autorización del runtime; los pesos por sí solos no proporcionan enrutamiento en vivo ni acceso a la malla.
- Idioma limitado al inglés según la model card.
- Licencia Apache-2.0 heredada; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) se rigen por la misma licencia según la información disponible.
- El repositorio no distribuye pesos en safetensors ni GGUF; solo el empaquetado de Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMeshGroup-Federated-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo publicado en Ollama: `Thox-ai/thoxmeshgroup-federated-8b` (no se proporciona URL directa en la información)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
