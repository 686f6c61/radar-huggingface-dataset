# Thox-ai/ThoxEdge-4B

## Resumen

ThoxEdge-4B es un empaquetado de configuración publicado por Thox-ai sobre los pesos upstream de Qwen/Qwen3-4B. No se trata de un modelo entrenado por THOX: el repositorio contiene únicamente un `Modelfile` de Ollama, un `manifest.json` y un knowledge pack en JSONL, mientras que los pesos reales son los del modelo base Qwen3-4B, descargados por Ollama desde el tag `qwen3:4b` fijado por digest. THOX añade un perfil de sistema y un conjunto de conocimiento verificado para respuestas ancladas a recuperación.

El modelo se presenta como una configuración "local-first" para un asistente de portátil, pensada para ejecución offline en CPU a través del endpoint local de Ollama. Su relevancia es limitada: no aporta mejoras de entrenamiento, sino una capa de empaquetado reproducible con procedencia verificable (digests SHA-256 de cada fichero y del modelo publicado). Es útil como ejemplo de distribución de configuraciones sobre modelos abiertos, no como un modelo con capacidades nuevas.

La arquitectura subyacente es la de Qwen3-4B (transformer denso de 4B parámetros), con licencia Apache-2.0 heredada. El contexto declarado en la evaluación es de 8.192 tokens, aunque la longitud de contexto nativa de Qwen3-4B no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B) |
| Parametros totales | 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en la evaluacion publicada; contexto nativo del base no disponible |
| Tipos de cuantizacion | Q4-class (tag por defecto de Ollama, 2,50 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos upstream gestionados por Ollama; el repo contiene Modelfile, manifest.json y knowledge pack JSONL |

## Arquitectura y entrenamiento

No hay entrenamiento por parte de THOX. El modelo reutiliza los pesos de Qwen/Qwen3-4B, fijados en el momento del build al digest `359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7` del tag `qwen3:4b`. La personalización consiste en un perfil de sistema incluido en el `Modelfile` y en el THOX Knowledge Pack v0.1, un fichero JSONL de 4.652 bytes con 8 entradas públicas verificadas, usado para respuestas ancladas a recuperación.

El repositorio no documenta detalles de la arquitectura interna de Qwen3-4B (número de capas, dimensiones, mecanismos de atención) ni datos de preentrenamiento, RLHF o DPO. Tampoco se describen innovaciones técnicas propias: el valor del empaquetado está en la trazabilidad (digests SHA-256 de cada artefacto y del modelo publicado `8eb05b54c73ac72d39760db363c3fe054785d2390fbacef99ed691a372946edd`) y en la reproducibilidad del build mediante `ollama create`.

## Capacidades

- Generación de texto en inglés, con razonamiento y recall limitados por el tamaño de 4B.
- Respuestas ancladas a recuperación cuando se le suministra contexto del Knowledge Pack v0.1.
- Declinación de trampas de topología fabricada (el modelo rechazó confirmar una topología inventada en la prueba publicada).
- Respuestas de enrutamiento etiquetadas como recomendación (local primero, nube solo con consentimiento explícito), no como estado en vivo.
- Ejecución local y offline mediante el endpoint local de Ollama.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Asistente local de portátil sin conexión: el modelo se ejecuta en CPU con 3,89 GB de RAM y responde a consultas generales en inglés, adecuado para entornos con requisitos de privacidad y sin GPU.
- Respuestas ancladas a un corpus cerrado: con el Knowledge Pack v0.1 suministrado como contexto, el modelo responde con los hechos del pack (8/8 temas en la evaluación), útil para asistentes de documentación interna acotada.
- Prototipado de flujos de enrutamiento local/nube: el modelo emite recomendaciones etiquetadas sobre cuándo usar inferencia local frente a la nube, aprovechable en demos de políticas de consentimiento.
- Pruebas de reproducibilidad de despliegues: el `Modelfile` y el `manifest.json` permiten reconstruir el mismo entorno con `ollama create`, útil en pipelines de validación de configuraciones.
- Base para experimentos de empaquetado de conocimiento: el formato JSONL del pack y su integración en el perfil de sistema sirven como plantilla para otros dominios.
- Evaluación de límites de modelos 4B: sirve para medir latencia y calidad en hardware modesto (15,19 tokens/s en CPU) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Generacion larga | 15,19 tokens/s | CPU x86_64, 4 vCPU / 8 GB, contexto 8.192, bench de 1.024 tokens |
| Respuestas cortas | 14,9–16,0 tokens/s | Smoke set |
| Memoria en carga | 3,89 GB RAM (0 GB VRAM) | Ejecucion en CPU |
| Smoke questions | 3/3 coherentes y en perfil | Factory smoke |
| Grounding Knowledge Pack v0.1 | 8/8 temas | Passage-supplied, una pregunta por tema |
| Trampa de topologia fabricada | Declinada | Prueba de robustez |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en la configuración medida (ejecución en CPU); para GPU, el tag por defecto Q4-class de 2,50 GB requiere aproximadamente 3-4 GB de VRAM, aunque no se documenta.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí con cuantización Q4 en tarjetas de 4 GB o más, pero no está confirmado por el autor.
- Despliegue: Ollama (modelo publicado `Thox-ai/thoxedge-4b` o build propio con `ollama create`). No se documentan vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 15,19 tokens/s en CPU x86_64 de 4 vCPU / 8 GB; sin datos para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxEdge-4B | 4B | 8.192 (evaluado) | Apache-2.0 | Ollama + repo HF | Configuracion sobre Qwen3-4B, sin entrenamiento propio |
| Qwen/Qwen3-4B | 4B | no disponible | Apache-2.0 | HF + Ollama (`qwen3:4b`) | Modelo base upstream; mismas capacidades sin perfil THOX |
| ThoxEdge-0.8B | 0,8B | no disponible | no disponible | no disponible | Modelo flagship entrenado de THOX; no comparte pesos con este salvo la familia Qwen |

La comparación con alternativas de terceros (Llama 3.2 3B, Phi-3.5-mini, Gemma 2 2B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 4B con razonamiento y recall materialmente limitados; las respuestas deben tratarse con cautela.
- El conocimiento está restringido al pack suministrado y a la recuperación; sin contexto, el modelo debe declararlo en lugar de inventar especificaciones THOX.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como "uncensored".
- Las acciones externas requieren autorización del runtime; los pesos por sí solos no proporcionan enrutamiento en vivo ni acceso a la malla.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- No es el modelo flagship entrenado ThoxEdge-0.8B y no comparte pesos con él más allá de la familia Qwen upstream.
- Riesgo de alucinación inherente al tamaño; la puntuación de grounding (8/8) corresponde a un conjunto de prueba acotado y con pasaje suministrado.
- Licencia Apache-2.0 heredada; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) quedan bajo esa misma licencia según la model card.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/ThoxEdge-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo publicado en Ollama: `Thox-ai/thoxedge-4b` (referencia de comando en la model card)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
