# Thox-ai/ThoxWork-Mind-4B

## Resumen

ThoxWork-Mind-4B es un modelo de generación de texto publicado por Thox-ai que no introduce pesos nuevos: se trata de un empaquetado del modelo base Qwen/Qwen3-4B (4.000 millones de parámetros, licencia Apache-2.0) sobre el que se ha superpuesto un perfil de sistema y un paquete de conocimiento versionado. El autor lo describe explícitamente como un "modelo configurado" (configuration-derived), no entrenado, orientado a un rol de perfil de decisión empresarial para sitios MeshGroup dentro del ecosistema THOX Work.

El repositorio de HuggingFace contiene únicamente el artefacto de empaquetado: un `Modelfile` de Ollama, un `manifest.json` con el pin del modelo base y un `thox-knowledge-v0.1.jsonl` de 8 entradas públicas verificadas. El modelo ejecutable se distribuye a través de Ollama (`Thox-ai/thoxwork-mind-4b`, 2,50 GB en su etiqueta por defecto), que descarga los pesos originales de Qwen3-4B desde el digest fijado en el manifiesto.

Su relevancia es acotada y muy específica: sirve como ejemplo de patrón de distribución "local-first" donde un tercero publica una configuración reproducible sobre un modelo abierto, con evaluación medida en hardware de gama baja (CPU de 4 vCPU y 8 GB de RAM). No aporta mejoras de capacidad sobre Qwen3-4B más allá del perfil de sistema y del grounding contra el paquete de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-4B; no se detalla en la información disponible) |
| Parametros totales | 4B (modelo base Qwen/Qwen3-4B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluación publicada); contexto máximo del base no disponible |
| Tipos de cuantizacion | Q4-class (etiqueta por defecto de Ollama, 2,50 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Pesos originales del base vía Ollama (digest fijado); el repositorio contiene Modelfile, manifest.json y JSONL de conocimiento |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por Thox-ai. La arquitectura es la del Qwen3-4B original, un transformer de 4.000 millones de parámetros del que no se detallan en la información disponible ni la composición del dataset, ni el número de tokens de entrenamiento, ni si hubo RLHF o DPO. Thox-ai únicamente añade una capa de configuración: un perfil de sistema incluido en el `Modelfile` y el THOX Knowledge Pack v0.1, un fichero JSONL con 8 entradas públicas verificadas que se usa para respuestas fundamentadas en recuperación (retrieval-grounded).

La innovación técnica del paquete no está en el modelo sino en el mecanismo de distribución reproducible: el `manifest.json` fija el digest del base (`359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7`), de modo que cualquier reconstrucción con `ollama create` parte exactamente de los mismos pesos. El digest del modelo publicado es `1821ee49f556c69b380cb114e78d1e98d1db461795bf9948c23f6e33539170c6`. No se menciona decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto en inglés, con razonamiento y recall limitados por el tamaño de 4B.
- Respuestas fundamentadas en un paquete de conocimiento suministrado (THOX Knowledge Pack v0.1, 8 entradas), con instrucción de no inventar especificaciones cuando falta contexto.
- Comportamiento de rechazo ante premisas falsas: en la prueba de "trampa de topología fabricada" el modelo declinó confirmar la topología inventada.
- Respuestas de enrutamiento etiquetadas como recomendación (local primero, nube solo con consentimiento explícito), no como afirmación de estado en vivo.
- Ejecución local y offline mediante el endpoint local de Ollama; el runtime opcional de THOX añade descubrimiento MeshStack y ejecución autorizada.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Perfil de decisión empresarial en sitios MeshGroup: el modelo responde consultas de decisión con el perfil de sistema del kit THOX Work, adecuado porque el perfil está fijado en el `Modelfile` y es reproducible.
- Despliegue en hardware modesto: con 3,89 GB de RAM en CPU y 0 GB de VRAM, encaja en hosts de 4 vCPU y 8 GB para inferencia local sin GPU.
- Respuestas fundamentadas sobre documentación interna: usando el Knowledge Pack como contexto suministrado, el modelo responde con los hechos del paquete (8/8 temas en la evaluación) en lugar de improvisar.
- Asistente offline en entornos sin conectividad: al ejecutarse de forma local y autónoma mediante Ollama, sirve para escenarios aislados donde no se permite salida a red.
- Filtro de recomendaciones con consentimiento: útil en flujos donde el modelo debe proponer una ruta (local frente a nube) sin afirmar estado en vivo, reduciendo el riesgo de acciones no autorizadas.
- Base para reconstrucción auditable: el pin por digest y el manifiesto permiten a un equipo reconstruir exactamente la misma configuración para validación interna o cumplimiento.
- Prototipado de patrones de empaquetado de modelos: sirve como referencia para publicar configuraciones versionadas sobre modelos abiertos sin reentrenar.

## Benchmarks y rendimiento

Evaluación medida el 2026-11-01 en host x86_64 solo CPU (4 vCPU, clase 8 GB), a 8.192 tokens de contexto, contra la configuración publicada:

| Metrica | Resultado |
|---|---|
| Generación de formato largo (bench de 1.024 tokens) | 15,32 tokens/s |
| Respuestas cortas (conjunto de smoke) | 15,2–16,3 tokens/s |
| Huella de memoria en carga | 3,89 GB RAM (0 GB VRAM, ejecución en CPU) |
| Preguntas de smoke de fábrica | 3/3 respondidas de forma coherente y conforme al perfil |
| Grounding con Knowledge Pack v0.1 (pasaje suministrado, una pregunta por tema) | 8/8 temas respondidos con los hechos del paquete |
| Trampa de topología fabricada | El modelo declinó confirmar la topología inventada |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada, no como afirmación de estado en vivo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en la evaluación publicada (ejecución en CPU); para GPU, no disponible.
- RAM medida en carga: 3,89 GB con la cuantización Q4-class por defecto (modelo de 2,50 GB).
- GPU recomendadas: no disponibles en la información proporcionada; el modelo está pensado para ejecución local en CPU.
- Cabe en hardware de consumo: sí, según la evaluación en un host de 4 vCPU y 8 GB de RAM; no se especifican modelos de GPU concretos.
- Opciones de despliegue: Ollama (publicado como `Thox-ai/thoxwork-mind-4b` o reconstruido con `ollama create`); otros motores (vLLM, llama.cpp, TGI) no están documentados para este paquete.
- Latencia y throughput: 15,32 tokens/s en generación larga y 15,2–16,3 tokens/s en respuestas cortas sobre CPU x86_64 de 4 vCPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxWork-Mind-4B | 4B | 8.192 (evaluado) | 15,3 tok/s en CPU; 8/8 grounding con pack | Apache-2.0 | HuggingFace (empaquetado) y Ollama |
| Qwen/Qwen3-4B | 4B | no disponible | Base del anterior; benchmarks no disponibles en la información | Apache-2.0 | HuggingFace y Ollama (`qwen3:4b`) |
| Alternativas de 4B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con su propio modelo base: ThoxWork-Mind-4B no modifica los pesos de Qwen3-4B, por lo que su capacidad intrínseca es la del base; la diferencia está en el perfil de sistema, el paquete de conocimiento y la reproducibilidad del empaquetado.

## Limitaciones y advertencias

- Modelo de 4B con razonamiento y recall materialmente limitados; el propio autor advierte de que las respuestas deben tratarse en consecuencia.
- El conocimiento está limitado al paquete suministrado y a la recuperación; sin contexto, el modelo debe indicarlo en lugar de inventar especificaciones THOX.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como "uncensored".
- Solo soporta inglés según la información disponible.
- Los pesos no han sido entrenados por Thox-ai; cualquier evaluación de calidad debe contrastarse con el comportamiento del Qwen3-4B original.
- Las acciones externas requieren autorización del runtime; los pesos por sí solos nunca proporcionan enrutamiento en vivo ni acceso a la malla.
- Una recomendación del modelo no es permiso para ejecutar.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: mitigado por instrucción de perfil y grounding, pero no eliminado; la puntuación de grounding publicada (8/8) corresponde a preguntas con pasaje suministrado.
- Licencia Apache-2.0 permite uso comercial, pero los elementos propios de THOX (perfil de sistema, paquete de conocimiento, empaquetado) se rigen por sus propios términos, no detallados.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta; no hay validación independiente de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/ThoxWork-Mind-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo en Ollama: `Thox-ai/thoxwork-mind-4b` (referencia indicada en la model card; URL no disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
