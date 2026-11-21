# tory-labs/vica-laya

## Resumen

Vica Laya es un ajuste fino (fine-tune) del modelo multilingüe Laya, desarrollado por tory-labs, especializado en clasificación de texto y toma de decisiones para el agente de programación Vica. No es un modelo generativo: se trata de un modelo de decisión que responde preguntas de sí/no y clasifica entradas según taxonomías predefinidas, principalmente en coreano con soporte de inglés. La versión publicada, release 2026.11.13.1, incorpora el checkpoint B3, entrenado durante tres épocas sobre el experimento de juicio directo para responder a tres preguntas concretas del flujo de edición de código de Vica: `check` (si una edición cumple lo solicitado), `locate` (si una línea candidata es el lugar correcto para modificar) y `done` (si la última respuesta del agente afirma haber terminado el trabajo).

El modelo parte de convaiinnovations/laya-multilingual y cuenta con 321.908.998 parámetros totales. Su arquitectura subyacente es la de Laya, un transformer multilingüe, aunque el autor no detalla la arquitectura interna en la información disponible. El repositorio incluye tanto pesos en formato safetensors (float16) para la librería Python `laya`, como un GGUF empaquetado junto a un binario compilado específico (`vica-laya`) para macOS arm64, Linux x86_64 y Windows x86_64.

La relevancia de este modelo es acotada y muy específica: no compite con LLM generativos, sino que actúa como un clasificador de decisión de bajo coste integrado en un agente de código. Su interés técnico radica en el enfoque de empaquetar un modelo pequeño con un runtime propio basado en ggmlc y una política de versionado estricta con checkpoints y compuertas de evaluación. El propio autor reconoce que no alcanzó el objetivo del 85 % de precisión y que solo la tarea `done` se usa en producción dentro de Vica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base: convaiinnovations/laya-multilingual); no se detalla la arquitectura interna |
| Parámetros totales | 321.908.998 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (export GGUF); float16 (safetensors) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `convaiinnovations/laya-multilingual`, del que no se detalla en la información disponible la arquitectura interna más allá de su naturaleza transformer. El autor indica que se entrenó a partir de `training-checkpoints/mix25-epoch-1` (release 2026.11.06.1) y no desde el release 2026.11.08.1, por lo que no incorpora el aprendizaje de grafo de conocimiento y resumen de investigación de esa versión intermedia. El entrenamiento cubre tres épocas y conserva las tareas de juicio anteriores junto con las tres nuevas preguntas del flujo de edición directa de Vica (`check`, `locate`, `done`).

Las etiquetas de entrenamiento no fueron escritas por humanos, sino generadas por Claude y verificadas por otra instancia de Claude, lo que introduce dependencia del comportamiento de un modelo de terceros en la supervisión. El autor no especifica el número de tokens de entrenamiento ni la composición exacta del dataset. El checkpoint exportado es el checkpoint de entrenamiento original copiado byte a byte, en float16, y el GGUF Q8_0 contiene los mismos 130 tensores que la exportación Q8 de B3, con solo el nombre del modelo y el checkpoint en los metadatos modificados; las respuestas se verificaron idénticas en las 1.034 preguntas de calibración de juicio directo.

## Capacidades

- Clasificación de texto y respuesta a preguntas de sí/no sobre entradas en coreano (principal) e inglés.
- Juicio de edición de código: `check` (verifica si una edición cumple lo solicitado), `locate` (determina si una línea candidata es el lugar de cambio) y `done` (detecta si la respuesta del agente afirma haber terminado).
- Clasificación de temas de noticias según una taxonomía de cuatro categorías (`topic-questions.json`).
- Tareas de juicio previas conservadas del entrenamiento anterior.
- Ejecución mediante un runner compilado propio (`vica-laya`) con soporte de estado (`--state-file`) y preguntas (`--questions-file`), salida en JSON.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de pensamiento.

## Casos de uso

- Verificación de parches en un agente de código: el modelo responde `check` para confirmar si una edición realizada por el agente cumple la petición original, integrándose en el bucle de decisión de Vica antes de aceptar el cambio.
- Localización de líneas a modificar: la tarea `locate` permite filtrar candidatos de línea antes de aplicar una edición, reduciendo falsos positivos en la selección del punto de cambio.
- Detección de finalización de tarea: la tarea `done` (la única que el autor indica que se usa en producción dentro de Vica) identifica si la última respuesta del agente declara el trabajo terminado, con 98/98 aciertos en la partición de prueba reservada y 238/238 en `test3`.
- Clasificación de noticias en coreano: con `topic-questions.json`, el modelo etiqueta titulares o textos en una taxonomía de cuatro categorías; el autor reporta 391 aciertos de 474 frente a 355 del release anterior.
- Procesamiento local en estaciones de trabajo sin GPU: los binarios para macOS arm64 (Metal) y Linux/Windows x86_64 (Vulkan) permiten ejecutar el modelo sin dependencias de Python ni de un runtime LLM genérico, útil para entornos con requisitos de privacidad o sin conectividad.
- Filtrado previo en pipelines de CI/CD: al ser un clasificador pequeño (GGUF de 361.797.056 bytes), puede ejecutarse como paso de verificación en flujos automatizados que necesiten una señal binaria rápida sobre el estado de una edición.
- Evaluación de taxonomías de decisión: el repositorio incluye scripts y registros agregados del experimento (`experiments/direct-judgment/`) que sirven como referencia para reproducir o adaptar el enfoque de juicio directo a otras tareas.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card para el release 2026.11.13.1 (B3), comparados con el modelo Jev cuando se indica:

| Tarea | Resultado Vica Laya (B3) | Referencia Jev |
|---|---|---|
| `done` (partición de prueba reservada) | 98/98 | 98/98 |
| `done` (`test3`, 871 filas) | 238/238 | no disponible |
| `check` | 176/239 | 230/239 |
| `locate` | 56/82 | 71/82 |
| Clasificación de temas de noticias (474 casos) | 391 | no disponible (release anterior: 355) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que no se alcanzó el objetivo del 85 % de precisión y que la evaluación en los datos de grafo de conocimiento y resumen de investigación no se realizó.

## Requisitos de hardware

- El GGUF Q8_0 ocupa 361.797.056 bytes (aproximadamente 345 MiB), por lo que la inferencia requiere muy poca memoria en comparación con un LLM generativo.
- macOS arm64: binario con backend Metal; no requiere instalar nada más.
- Linux x86_64: binario con Vulkan; requiere el cargador `libvulkan.so.1` y una CPU con AVX2, FMA y BMI2 (Intel Haswell de 2013 o AMD Excavator de 2015 en adelante); compilado sobre Ubuntu 22.04 (glibc 2.35).
- Windows x86_64: binario con Vulkan; requiere `vulkan-1.dll` (instalado con los drivers de GPU) y los DLL del runtime de Visual C++ incluidos junto a `vica-laya.exe`.
- Cabe en cualquier GPU de consumo con soporte Vulkan o Metal, así como en CPU, dado el tamaño reducido del modelo.
- Opciones de despliegue: exclusivamente el runner compilado `vica-laya` (basado en ggmlc v0.9.7). El autor indica explícitamente que el modelo no es para llama.cpp ni Ollama. Para el checkpoint float16 existe la librería Python `laya`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vica Laya (este modelo) | 321.908.998 | no disponible | Clasificación / decisión sí-no (ko, en) | apache-2.0 | Hugging Face, binarios por plataforma |
| convaiinnovations/laya-multilingual (base) | no disponible | no disponible | Modelo multilingüe base | no disponible | Hugging Face |
| Jev | no disponible | no disponible | Juicio directo (referencia interna del autor) | no disponible | no disponible públicamente en la información |

No se dispone de datos suficientes para comparar con alternativas públicas de la misma categoría (clasificadores de decisión para agentes de código). El modelo Jev se menciona únicamente como referencia de evaluación interna y no se detalla su procedencia ni disponibilidad.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para generación de texto libre, chat, tool calling ni razonamiento multi-paso.
- Solo la tarea `done` se emplea en producción dentro de Vica; `check` y `locate` quedan por debajo de Jev (176/239 frente a 230/239 y 56/82 frente a 71/82) y no se usan.
- El objetivo del 85 % de precisión no se alcanzó, según el propio autor.
- Las etiquetas de entrenamiento fueron generadas por Claude y verificadas por otra instancia de Claude, no por anotadores humanos, lo que puede propagar sesgos y errores del modelo supervisor.
- El modelo parte de 2026.11.06.1, no de 2026.11.08.1, por lo que no incluye el aprendizaje de grafo de conocimiento y resumen de investigación; la precisión en esos datos no se midió.
- El modelo está orientado principalmente al coreano; el soporte de inglés existe pero no se detalla su rendimiento.
- El binario de macOS no está notarizado y Gatekeeper puede bloquear la descarga hasta que se permita manualmente.
- Los binarios x86_64 requieren AVX2, FMA y BMI2, lo que excluye CPUs anteriores a 2013-2015.
- El runtime es específico (`vica-laya`, basado en ggmlc) y no es compatible con llama.cpp ni Ollama; el texto de ayuda integrado conserva la redacción del proyecto upstream.
- Licencia apache-2.0: permite uso comercial, pero debe verificarse la licencia del modelo base `convaiinnovations/laya-multilingual`, no detallada en la información disponible.
- Riesgo de alucinación en el sentido de clasificaciones erróneas: el autor documenta fallos en `check` y `locate`, por lo que no debe usarse como única señal de validación en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tory-labs/vica-laya
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio del runner: https://github.com/su-record/vica-laya
- ggmlc v0.9.7 (dependencia del runtime): https://github.com/monatis/ggmlc/tree/5490a13661d95add025ec1b111adbc88234a9b4f
- Registros del experimento de juicio directo: `experiments/direct-judgment/` dentro del repositorio del modelo (resultados agregados en `results-20261112.json`, `results-round2.json` y `results-round3.json`)
- Evaluación del release: `evaluation.json` en el repositorio del modelo
- Taxonomía de noticias: `topic-questions.json` en el repositorio del modelo
- Ejemplo de estado y petición: `example-state.json` y `example-request.jsonl` en el repositorio del modelo
