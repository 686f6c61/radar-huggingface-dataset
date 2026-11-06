# Thox-ai/ThoxMini-Mind-1.5B

## Resumen

ThoxMini-Mind-1.5B es un paquete de configuración publicado por Thox-ai sobre los pesos de Qwen2.5-1.5B-Instruct, el modelo denso de 1.500 millones de parámetros de Alibaba. No se trata de un modelo entrenado por Thox-ai: el repositorio contiene únicamente un `Modelfile` de Ollama, un manifiesto de release y un knowledge pack en JSONL (8 entradas verificadas), mientras que los pesos reales se descargan desde la etiqueta `qwen2.5:1.5b` fijada por digest. La propuesta es un despliegue local-first sobre Ollama con un perfil de sistema que orienta al modelo hacia respuestas fundamentadas en el knowledge pack.

El objetivo declarado es la asistencia a la toma de decisiones en dispositivo, con un perfil de sistema que incluye una regla explícita sobre estado en vivo: si no hay datos en directo, el modelo debe indicarlo en lugar de inventar especificaciones de THOX. El modelo publicado en Ollama ocupa 0,99 GB en su etiqueta por defecto y está pensado para hardware que pueda ejecutar un modelo de 1,5B en cuantización Q4.

Su relevancia es limitada pero concreta: demuestra un patrón de empaquetado reproducible (base fijada por digest, perfil de sistema versionado, knowledge pack separado) para despliegues de inferencia local en CPU, sin dependencia de servicios en la nube. No aporta mejoras de arquitectura ni de entrenamiento respecto al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-1.5B-Instruct); no disponible el detalle de capas y atención en la información proporcionada |
| Parámetros totales | 1,5B (heredados del modelo base) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluación publicada); no se especifica el máximo nativo del base en esta ficha |
| Tipos de cuantización | Q4-class por defecto en la etiqueta de Ollama (0,99 GB); no se listan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`); el modelo base Qwen2.5 es multilingüe, pero la ficha declara solo inglés |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Pesos del base gestionados por Ollama (capa fijada por digest); el repositorio contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl` |

## Arquitectura y entrenamiento

No hay entrenamiento propio. Thox-ai parte de `Qwen/Qwen2.5-1.5B-Instruct` a través de la etiqueta `qwen2.5:1.5b`, fijada en tiempo de build al digest `65ec06548149b04c096a120e4a6da9d4017ea809c91734ea5631e89f96ddc57b`. La personalización consiste en un perfil de sistema incluido en el `Modelfile` y en el THOX Knowledge Pack v0.1, un fichero JSONL de 4.652 bytes con 8 entradas públicas verificadas, pensado para respuestas fundamentadas por recuperación.

La innovación técnica es de empaquetado, no de modelado: separación entre pesos base (inmutables, fijados por digest), perfil de sistema versionado y knowledge pack independiente. Según la model card, el perfil se reforzó con una regla explícita de estado en vivo (colocada al inicio del perfil, con una frase de cierre sobre ausencia de telemetría en directo) después de que el primer build aceptara una premisa falsa; solo se publicó el build reforzado. El modelo publicado en Ollama tiene digest `96588558212faf6339dd108690baef625e3529f44760c15b1c51cb094b814f70`.

## Capacidades

- Generación de texto en inglés con el perfil de sistema de THOX aplicado.
- Respuestas fundamentadas en el knowledge pack suministrado (8 entradas de temática THOX).
- Declaración explícita de ausencia de datos cuando no hay contexto en vivo, según la regla del perfil.
- Respuestas de enrutamiento etiquetadas como recomendación (local primero, nube solo con consentimiento explícito), no como afirmación de estado en vivo.
- Ejecución local y offline mediante el endpoint local de Ollama.
- Descubrimiento MeshStack y ejecución autorizada solo si se usa el runtime opcional de THOX; los pesos por sí solos no proporcionan enrutamiento en vivo ni acceso a malla.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente local de consulta sobre documentación THOX: el modelo responde usando el knowledge pack v0.1 como contexto recuperado, adecuado para preguntas frecuentes acotadas y sin conexión.
- Despliegue en equipos sin GPU: con 1,37 GB de RAM en ejecución sobre CPU x86_64, encaja en portátiles y mini-PC de 8 GB para tareas de generación de texto de baja exigencia.
- Pruebas de robustez frente a premisas falsas: el perfil refuerza la negativa ante topologías inventadas, útil como banco de pruebas de comportamiento ante alucinaciones de estado.
- Prototipado de asistentes con separación entre pesos y conocimiento: el patrón de knowledge pack versionado permite actualizar el contenido sin tocar los pesos.
- Evaluación de pipelines de empaquetado Ollama: sirve como referencia reproducible de build con base fijada por digest y manifiesto de release.
- Demostraciones offline en entornos aislados: al funcionar sin red, es apto para entornos con restricciones de conectividad donde solo se necesita texto en inglés.
- Base para experimentos de enrutamiento local/nube: el modelo produce recomendaciones etiquetadas que pueden integrarse en un runtime que aplique la autorización real.

## Benchmarks y rendimiento

Evaluación publicada por el autor, medida el 2026-10-31 en un host x86_64 solo CPU (clase 4 vCPU / 8 GB) con contexto de 8.192 tokens:

| Métrica | Resultado |
|---|---|
| Generación de formato largo | 11,35 tokens/s (bench de 1.024 tokens) |
| Respuestas cortas | 12,9–29,5 tokens/s en el conjunto de smoke tests |
| Huella de memoria en carga | 1,37 GB de RAM, 0 GB de VRAM (ejecución en CPU) |
| Smoke tests de fábrica | 3/3 respondidas de forma coherente y conforme al perfil |
| Fundamentación con Knowledge Pack v0.1 (pasaje suministrado, una pregunta por tema) | 7/8 temas respondidos con los hechos del pack |
| Trampa de topología fabricada | El modelo rechazó confirmar la topología inventada |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada, no como afirmación de estado en vivo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en la configuración evaluada (ejecución en CPU); el modelo publicado en Ollama ocupa 0,99 GB en disco en su etiqueta por defecto.
- RAM: 1,37 GB en carga según la medición del autor; un host de 8 GB es suficiente.
- GPU recomendadas: no se especifican; el autor no ha cualificado el modelo en hardware de dispositivo ("Not qualified on device hardware").
- GPU de consumo: no hay datos de ejecución en GPU; por tamaño (1,5B en Q4) cabría en GPUs de consumo con 4 GB o más de VRAM, pero no está verificado por el autor.
- Opciones de despliegue: Ollama (modelo publicado `Thox-ai/thoxmini-mind-1.5b` o build propio con el `Modelfile` del repositorio). No se documentan vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 11,35 tokens/s en generación larga y 12,9–29,5 tokens/s en respuestas cortas, medidos en CPU x86_64 de 4 vCPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxMini-Mind-1.5B | 1,5B | 8.192 (usado en evaluación) | Empaquetado Ollama con perfil y knowledge pack sobre Qwen2.5-1.5B-Instruct | Apache-2.0 | Hugging Face (packaging) y Ollama |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible en esta ficha | Modelo base instructivo, sin personalización | Apache-2.0 | Hugging Face y Ollama (`qwen2.5:1.5b`) |
| Alternativas de 1-2B para inferencia local en CPU | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es con el propio modelo base: ThoxMini-Mind-1.5B no modifica los pesos, por lo que su calidad de razonamiento y recall es la de Qwen2.5-1.5B-Instruct, con la diferencia del perfil de sistema y el knowledge pack. No se dispone de datos de benchmarks comparativos con otras alternativas.

## Limitaciones y advertencias

- Modelo de 1,5B: razonamiento y recall materialmente limitados, según reconoce el propio autor; las respuestas deben tratarse como borradores.
- La puntuación de fundamentación de 7/8 es la medida para este build concreto y con pasaje suministrado; sin contexto, el modelo debe declarar que no lo tiene.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como modelo sin censura.
- El conocimiento está limitado al knowledge pack (8 entradas) y a la recuperación; no hay conocimiento THOX fuera de ese pack.
- Las acciones externas requieren autorización del runtime; los pesos por sí solos no dan enrutamiento en vivo ni acceso a malla.
- Idioma declarado: solo inglés; el multilingüismo del base Qwen2.5 no está garantizado por el perfil.
- No cualificado en hardware de dispositivo ("Not qualified on device hardware"); las cifras de rendimiento provienen de un host CPU concreto.
- Riesgo de alucinación inherente al tamaño del modelo; el perfil mitiga la invención de estado en vivo, pero no la elimina en otros dominios.
- Licencia Apache-2.0 heredada; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) se declaran bajo la misma licencia, sin restricciones comerciales adicionales indicadas.
- Repositorio sin descargas ni likes en el momento de la consulta; ecosistema y soporte muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxMini-Mind-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Etiqueta de Ollama del base: `qwen2.5:1.5b`
- Modelo publicado en Ollama: `Thox-ai/thoxmini-mind-1.5b`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
