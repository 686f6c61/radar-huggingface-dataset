# Thox-ai/ThoxIOS-Mesh-8B

## Resumen

ThoxIOS-Mesh-8B es un paquete de configuración publicado por Thox-ai sobre los pesos upstream de Qwen3-8B. El repositorio no contiene pesos entrenados por THOX: incluye un `Modelfile` de Ollama, un `manifest.json` con el pin del modelo base y un fichero JSONL con el THOX Knowledge Pack v0.1 (8 entradas públicas verificadas). El modelo ejecutable se distribuye a través de Ollama, que descarga la capa base de Qwen3-8B fijada por digest y le supera el perfil de sistema definido por el autor.

El modelo está pensado como nodo remoto asistido por malla (mesh-assisted remote node) dentro del kit iOS de THOX: no se empaqueta en el iPhone y nunca actúa como fallback silencioso. Su función es servir inferencia local vía el endpoint local de Ollama en hardware que soporte un modelo de 8B en cuantización Q4, con un perfil de sistema orientado a respuestas fundamentadas en el knowledge pack y a evitar afirmaciones sobre estado en vivo o topologías no verificadas.

La relevancia es limitada: se trata de un artefacto de empaquetado y perfilado, no de un modelo nuevo. Para desarrolladores resulta útil como ejemplo de cómo fijar una base Qwen3-8B, añadir una capa de instrucciones de sistema y un conjunto de recuperación mínimo, y medir el comportamiento resultante (incluida una prueba explícita de rechazo a confirmar topologías fabricadas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B; no se detalla en la información disponible) |
| Parametros totales | 8B (heredados de Qwen/Qwen3-8B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 8.192 tokens (contexto de evaluación reportado; el máximo del base no se especifica en la información disponible) |
| Tipos de cuantizacion | Q4-class (tag por defecto de Ollama, 5,23 GB); otras cuantizaciones no disponibles en la información proporcionada |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Modelfile de Ollama + manifest.json + knowledge pack JSONL; los pesos se obtienen del tag `qwen3:8b` de Ollama (formato GGUF gestionado por Ollama, no confirmado explícitamente en la información disponible) |

## Arquitectura y entrenamiento

No hay entrenamiento por parte de THOX. El modelo reutiliza los pesos de Qwen/Qwen3-8B obtenidos mediante el tag `qwen3:8b` de Ollama, fijado en el momento de la construcción al digest `500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`. La personalización consiste en dos capas: el perfil de sistema incluido en el `Modelfile` y el THOX Knowledge Pack v0.1, un fichero JSONL de 4.652 bytes con 8 entradas públicas verificadas destinado a respuestas fundamentadas por recuperación.

El perfil de sistema fue reforzado con una regla explícita de estado en vivo, colocada al principio del perfil y cerrada con una frase que prohíbe afirmar telemetría en vivo. Según la model card, la primera construcción "siguió la trampa" y solo se publicó la segunda pasada con el perfil reforzado. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO, porque no existe fase de ajuste. Tampoco se describen innovaciones de arquitectura propias: cualquier característica técnica (atención, decodificación, etc.) procede del Qwen3-8B original y no se detalla en la información disponible.

## Capacidades

- Generación de texto en inglés, con razonamiento y recall limitados por el tamaño de 8B.
- Respuestas fundamentadas en el THOX Knowledge Pack v0.1 cuando se le suministra el pasaje correspondiente (7/8 temas respondidos con hechos del pack en la evaluación del autor).
- Rechazo de confirmaciones sobre topologías de red fabricadas (prueba de trampa superada según la model card).
- Respuestas a preguntas de enrutamiento etiquetadas como recomendación (local primero, nube solo con consentimiento explícito), sin afirmar estado en vivo.
- Ejecución local y offline a través del endpoint local de Ollama.
- Integración opcional con el runtime THOX para descubrimiento MeshStack y ejecución autorizada (no incluido en los pesos).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue de un nodo de inferencia local en estaciones de trabajo o servidores pequeños: el modelo se ejecuta con `ollama run Thox-ai/thox-ios-mesh-8b` y sirve respuestas de texto sin conexión, adecuado para entornos con requisitos de soberanía de datos.
- Asistente de consulta sobre documentación interna acotada: cargando el knowledge pack o pasajes equivalentes en el contexto, el modelo responde con hechos verificados y evita inventar especificaciones cuando no hay contexto suministrado.
- Prototipado de flujos de enrutamiento local/nube: el perfil de sistema fuerza a etiquetar las recomendaciones de enrutamiento y a exigir consentimiento explícito antes de derivar a la nube, útil para validar políticas de derivación en aplicaciones móviles.
- Pruebas de robustez frente a alucinación de infraestructura: la prueba de topología fabricada documentada sirve como caso de regresión para evaluar si un modelo rechaza afirmaciones sobre estado de red que no puede conocer.
- Base para experimentos de empaquetado y versionado de modelos: el repositorio ejemplifica el uso de `Modelfile`, `manifest.json` con pin por digest y un knowledge pack versionado, reutilizable como plantilla para publicar configuraciones reproducibles.
- Evaluación comparativa de configuraciones sobre Qwen3-8B: al fijar el digest del base, permite medir el efecto de distintas capas de sistema y packs de conocimiento sobre el mismo modelo subyacente en un host de CPU.

## Benchmarks y rendimiento

Mediciones del autor realizadas el 2026-11-01 en un host x86_64 solo CPU (clase 4 vCPU / 8 GB), con contexto de 8.192 tokens y la configuración publicada. No son comparables con benchmarks estándar de razonamiento o código.

| Metrica | Resultado |
|---|---|
| Generación de texto largo (bench de 1.024 tokens) | 8,38 tokens/s |
| Respuestas cortas (conjunto smoke) | 8,6–9,0 tokens/s |
| Huella de memoria con el modelo cargado | 6,68 GB de RAM (0 GB de VRAM, ejecución en CPU) |
| Preguntas smoke de fábrica | 3/3 respondidas de forma coherente y alineada con el perfil |
| Fundamentación con Knowledge Pack v0.1 (pasaje suministrado, una pregunta por tema) | 7/8 temas respondidos con hechos del pack |
| Trampa de topología fabricada | El modelo rechazó confirmar la topología fabricada |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada, no como afirmación de estado en vivo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en la configuración medida (ejecución en CPU); para GPU se requiere aproximadamente lo que ocupe la cuantización Q4 del base de 8B, no especificado en la información disponible.
- RAM: 6,68 GB con el modelo cargado en la configuración evaluada; se recomienda al menos 8 GB de RAM en el host.
- GPU recomendadas: no disponibles en la información proporcionada; el autor solo documenta ejecución en CPU x86_64 (4 vCPU / 8 GB).
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño del artefacto (5,23 GB) sugiere que una cuantización Q4 de 8B podría caber en GPUs de consumo con 8 GB o más de VRAM, pero no hay validación publicada.
- Opciones de despliegue: Ollama (método documentado, tanto el modelo publicado como la construcción local desde el repositorio). Otros runners (vLLM, llama.cpp directo, TGI) no están documentados en la información disponible.
- Latencia y throughput: 8,38 tokens/s en generación larga y 8,6–9,0 tokens/s en respuestas cortas, medidos en CPU; sin datos para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento propio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxIOS-Mesh-8B | 8B | 8.192 (evaluado) | No (perfil + knowledge pack sobre Qwen3-8B) | Apache-2.0 | Ollama y repositorio HF con Modelfile |
| Qwen/Qwen3-8B | 8B | no disponible en la información proporcionada | Sí (modelo base original) | Apache-2.0 | HuggingFace y Ollama (`qwen3:8b`) |
| Otras configuraciones de Qwen3-8B vía Ollama | 8B | depende del tag | No | Apache-2.0 | Ollama |

La comparación relevante es contra el propio Qwen3-8B: ThoxIOS-Mesh-8B no altera los pesos, solo añade instrucciones de sistema y un pack de 8 entradas. Cualquier diferencia de comportamiento se limita al perfil y al contexto suministrado. No se dispone de datos de benchmarks comparativos frente a otros modelos de 8B en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 8B con razonamiento y recall materialmente limitados; la propia model card advierte de que las respuestas deben tratarse con cautela.
- La fundamentación medida es 7/8 temas con pasaje suministrado; sin contexto, el modelo debe indicarlo en lugar de inventar especificaciones de THOX, pero el cumplimiento no está garantizado más allá de la evaluación realizada.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como modelo sin censura.
- Las acciones externas requieren autorización del runtime; los pesos por sí solos no proporcionan enrutamiento en vivo ni acceso a la malla.
- El modelo está definido en el kit iOS como nodo remoto asistido por malla: no se incluye en el iPhone y nunca actúa como fallback silencioso.
- Idiomas: solo inglés declarado; no hay soporte multilingüe documentado.
- Licencia Apache-2.0 heredada del base; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) se declaran bajo la misma licencia, sin restricciones comerciales adicionales documentadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación independiente de las mediciones del autor.
- Riesgo de sesgos y alucinaciones heredado del base Qwen3-8B; no se documentan evaluaciones de sesgo en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/ThoxIOS-Mesh-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo publicado en Ollama: `Thox-ai/thox-ios-mesh-8b` (referencia textual en la model card; no se proporciona URL directa en la información disponible)
- Tag base en Ollama: `qwen3:8b`, digest `500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`
- Digest del modelo publicado: `e3b7c54840d15ba4ca729de0d97d3930fdc4e12de6b79e43a5cdd8c936146fb3`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
