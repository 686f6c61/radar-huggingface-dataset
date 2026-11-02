# Thox-ai/ThoxWork-Analyst-8B

## Resumen

ThoxWork-Analyst-8B es un modelo de generación de texto publicado por Thox-ai que no introduce pesos nuevos: se trata de un empaquetado del modelo upstream Qwen/Qwen3-8B (8.000 millones de parámetros, licencia Apache-2.0) al que se le añade un perfil de sistema corporativo y un paquete de conocimiento versionado (THOX Knowledge Pack v0.1). El repositorio de HuggingFace contiene únicamente el `Modelfile` de Ollama, un `manifest.json` y el fichero JSONL del knowledge pack; los pesos reales se descargan desde la etiqueta `qwen3:8b` fijada por digest en el manifiesto. THOX declara explícitamente que no ha entrenado estos pesos.

El modelo está diseñado para inferencia local y offline mediante Ollama, orientado a un rol de "analista" dentro de los sitios MeshGroup de THOX Work. Su propuesta de valor no es el rendimiento bruto, sino la configuración: un perfil de sistema que modera el comportamiento del modelo base y un conjunto de ocho entradas públicas verificadas que sirven como contexto de recuperación para respuestas fundamentadas en especificaciones internas de THOX.

Es relevante ahora como ejemplo de una categoría creciente: modelos "configuration-derived", donde el artefacto publicado es la configuración y el conocimiento, no los pesos. Para desarrolladores que evalúan despliegues locales en entornos empresariales con requisitos de aislamiento, este modelo ilustra el patrón de empaquetado reproducible (base fijada por digest, manifiesto de release y knowledge pack versionado) sobre un transformer denso de 8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) |
| Parametros totales | 8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (medido en la evaluación del autor; el contexto nativo de Qwen3-8B no se detalla en la información proporcionada) |
| Tipos de cuantizacion | Q4-clase por defecto en la etiqueta Ollama publicada (5,23 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Modelfile de Ollama + manifiesto + JSONL de knowledge pack; pesos upstream en formato Ollama (no se publican safetensors ni GGUF propios en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer denso de 8.000 millones de parámetros. THOX no ha realizado entrenamiento alguno: el proceso consiste en fijar la etiqueta `qwen3:8b` de Ollama mediante el digest `500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41` en el momento del build, y superponer una capa de perfil de sistema definida en el `Modelfile` junto con el THOX Knowledge Pack v0.1 (ocho entradas públicas verificadas en formato JSONL, 4.652 bytes).

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, porque no hay entrenamiento. La innovación técnica es de empaquetado y gobernanza: reproducibilidad por digest, manifiesto de release con versión del knowledge pack y separación entre el perfil de sistema (que modera el comportamiento del modelo base) y el conocimiento recuperable. El modelo publicado en Ollama ocupa 5,23 GB en su etiqueta por defecto y reutiliza la capa base fijada más la capa de perfil generada desde el `Modelfile`.

## Capacidades

- Generación de texto y respuestas conversacionales en inglés, con perfil de sistema orientado a tareas de analista.
- Respuestas fundamentadas en contexto suministrado: el knowledge pack v0.1 permite responder con hechos del pack cuando se le proporciona el pasaje correspondiente.
- Comportamiento de rechazo ante premisas fabricadas: en la prueba "fabricated-topology trap" el modelo declinó confirmar una topología inventada.
- Respuestas de enrutamiento etiquetadas como recomendación (local primero, nube solo con consentimiento explícito), sin afirmar estado en vivo.
- Ejecución local y offline mediante el endpoint local de Ollama, sin dependencia de red.
- Integración opcional con el runtime THOX para descubrimiento MeshStack y ejecución autorizada (no disponible solo con los pesos).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente de analista en sitios MeshGroup: el modelo se ejecuta localmente vía Ollama y responde consultas de rol analista usando el perfil de sistema del kit THOX Work, adecuado para entornos con aislamiento de dominio de seguridad y sin salida a red.
- Consulta de especificaciones internas con contexto suministrado: dado un pasaje del knowledge pack v0.1, el modelo responde con los hechos del pack; útil para preguntas frecuentes sobre configuración y políticas internas sin riesgo de inventar especificaciones.
- Despliegue en hardware modesto: con 6,68 GB de RAM en CPU y 8,73 tokens/s en generación larga, encaja en estaciones de trabajo x86_64 de clase 4 vCPU / 8 GB para tareas de baja concurrencia.
- Validación de premisas y control de alucinación: su comportamiento de rechazo ante topologías fabricadas lo hace apto como primera barrera en flujos donde el operador introduce datos no verificados y se requiere que el modelo no los confirme.
- Recomendaciones de enrutamiento con etiqueta explícita: útil en asistentes que deben distinguir entre recomendación y estado en vivo (local primero, nube con consentimiento), por ejemplo en paneles de operaciones.
- Base reproducible para pipelines de configuración: el patrón de base fijada por digest más manifiesto permite reconstruir el entorno exacto (`ollama create` desde el `Modelfile`) en CI o en aprovisionamiento de flotas, garantizando que todos los nodos ejecutan la misma configuración.
- Prototipado de asistentes corporativos offline: como punto de partida para equipos que quieren evaluar el patrón de perfil de sistema más knowledge pack antes de invertir en fine-tuning propio.

## Benchmarks y rendimiento

Mediciones publicadas por el autor el 2026-11-01 en host x86_64 solo CPU (clase 4 vCPU / 8 GB), a 8.192 tokens de contexto, sobre la configuración publicada:

| Prueba | Resultado |
|---|---|
| Generación de formato largo (bench de 1.024 tokens) | 8,73 tokens/s |
| Respuestas cortas (conjunto de smoke tests) | 8,2–9,1 tokens/s |
| Huella de memoria en carga | 6,68 GB RAM (0 GB VRAM, ejecución en CPU) |
| Preguntas de smoke de fábrica | 3/3 respondidas de forma coherente y alineada con el perfil |
| Grounding con Knowledge Pack v0.1 (pasaje suministrado, una pregunta por tema) | 8/8 temas respondidos con los hechos del pack |
| Trampa de topología fabricada | El modelo declinó confirmar la topología inventada |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada, no como afirmación de estado en vivo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en la configuración medida (ejecución en CPU); para ejecución en GPU con cuantización Q4-clase se puede estimar en torno a 5–6 GB de VRAM, aunque no se proporciona una medición oficial.
- RAM: 6,68 GB en carga según la medición del autor; se recomienda un mínimo de 8 GB de RAM en el host.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una RTX 4090 (24 GB) o una RTX 4060 Ti (16 GB) podrían alojar el modelo en Q4, pero no hay datos de rendimiento en GPU publicados.
- ¿Cabe en GPU consumer? Sí, por tamaño (8B en Q4-clase, 5,23 GB de artefacto), aunque sin mediciones oficiales de VRAM ni throughput en GPU.
- Opciones de despliegue: Ollama (soporte oficial: `ollama run Thox-ai/thoxwork-analyst-8b` o build local con `ollama create`). vLLM, llama.cpp, TGI u otros no se mencionan en la información disponible.
- Latencia y throughput: 8,73 tokens/s en generación larga y 8,2–9,1 tokens/s en respuestas cortas, medidos en CPU (4 vCPU / 8 GB). No hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxWork-Analyst-8B | 8B | 8.192 tokens (medido) | Apache-2.0 | Ollama + repo de configuración en HF | Configuración derivada; sin entrenamiento propio |
| Qwen/Qwen3-8B | 8B | no disponible en esta ficha | Apache-2.0 | HuggingFace | Modelo base upstream; pesos originales |
| Otros derivados de Qwen3-8B | 8B | variable | Apache-2.0 (habitual) | variable | No disponible comparación concreta en la información proporcionada |

La comparación con alternativas de la misma categoría (modelos "configuration-derived" empaquetados sobre una base) no está disponible en la información proporcionada. Frente a Qwen3-8B, la diferencia es de empaquetado y perfil, no de capacidades del modelo subyacente.

## Limitaciones y advertencias

- Modelo de 8B con razonamiento y recall materialmente limitados; el propio autor recomienda tratar sus respuestas en consecuencia.
- El conocimiento está limitado al knowledge pack suministrado y a la recuperación; sin contexto, el modelo debe indicarlo en lugar de inventar especificaciones de THOX.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como "uncensored".
- Idiomas: solo inglés según la model card; no se documenta soporte de castellano.
- Contexto medido de 8.192 tokens; no se detalla el contexto nativo de Qwen3-8B en la información proporcionada.
- Las acciones externas requieren autorización del runtime THOX; los pesos por sí solos nunca proporcionan enrutamiento en vivo ni acceso a la malla.
- Los grupos corporativos son dominios de seguridad aislados; las peticiones entre sitios requieren concesiones de política explícitas y transporte autenticado.
- Licencia Apache-2.0 heredada del modelo base; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) se declaran bajo la misma licencia, pero conviene verificar los términos de uso del runtime THOX para despliegues empresariales.
- Riesgo de alucinación presente como en cualquier modelo de 8B; el diseño mitiga parcialmente el riesgo mediante el perfil de sistema y el contexto suministrado, pero no lo elimina.
- Sin datos de benchmarks estándar publicados, la evaluación de calidad frente a alternativas es limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thox-ai/ThoxWork-Analyst-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo publicado en Ollama: `Thox-ai/thoxwork-analyst-8b` (referencia en la model card; no se proporciona URL directa)
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada.
