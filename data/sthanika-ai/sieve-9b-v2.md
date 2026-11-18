# sthanika-ai/Sieve-9B-v2

## Resumen

Sieve-9B-v2 es un modelo de decisión desarrollado por Sthānika AI, diseñado para responder preguntas de opción múltiple y binarias sobre un estado de entrada (texto o JSON) devolviendo probabilidades calibradas, sin generar texto. Se implementa como un adaptador LoRA (rango 32, α=64) más una cabeza pointer sobre el backbone Qwen/Qwen3.5-9B (revisión `c2022362`), y solo utiliza la parte textual del modelo base. Su pipeline es `text-classification`, no generación de texto.

El modelo resuelve un problema concreto: la clasificación y puntuación estructurada con calibración explícita, orientada a sistemas de enrutamiento, triaje y toma de decisiones automatizada donde se requiere una distribución de probabilidad fiable sobre opciones predefinidas. Soporta tres tipos de pregunta (`choice`, `noul` y `score`) y aplica temperaturas de calibración por categoría de pregunta (una global de 1.109 y 23 específicas entre 1.000 y 1.338), ajustadas por NLL sobre un split de calibración de 43.176 preguntas.

Es relevante ahora porque ofrece una alternativa determinista y calibrada a los LLM generativos en tareas de clasificación, con límites de contexto explícitos (16.384 tokens para el estado y 16.384 por pregunta), aproximadamente 20 GB de VRAM en bf16 y licencia Apache 2.0. El modelo se publicó originalmente como Sieve-9B-Plus y sus artefactos de entrenamiento conservan ese nombre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=32, α=64) sobre 12 módulos de proyección de Qwen3.5-9B, más cabeza pointer con softmax calibrado |
| Parámetros totales | No disponible (adaptador LoRA + cabeza pointer; el backbone Qwen3.5-9B se descarga aparte) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens para el estado y 16.384 tokens por pregunta con sus opciones |
| Tipos de cuantización | No disponible (entrenado y evaluado en bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); backbone descargado en su revisión fijada |

## Arquitectura y entrenamiento

Sieve-9B-v2 no es un transformer generativo autónomo: es un adaptador PEFT sobre Qwen/Qwen3.5-9B que aprovecha únicamente la torre de texto del backbone. La lectura se realiza mediante una cabeza pointer que puntúa el final de cada opción contra el punto de decisión, y una softmax calibrada convierte esas puntuaciones en probabilidades. Cada pregunta se ejecuta como una fila independiente a partir de la caché del estado, de modo que las preguntas de una misma petición nunca se ven entre sí (aislamiento por pregunta).

El entrenamiento produce pesos LoRA de rango 32 con α=64 sobre 12 módulos de proyección, junto con la cabeza pointer. La calibración se ajusta por NLL sobre un split de 43.176 preguntas, generando una temperatura global (T = 1.109) y 23 temperaturas por categoría (rango 1.000–1.338). La categoría de una pregunta se determina por su tipo, el número de opciones (2, 3-4, 5-9, 10-25, 26+) y el tipo de estado (vacío, texto o JSON); se aplica la temperatura de la categoría más específica disponible y, en su defecto, la global. Las temperaturas no alteran la respuesta elegida, solo la probabilidad reportada. Los artefactos de entrenamiento (`training_config.json`, `training_metrics.json`, `train.log`, `result.json`) están disponibles en el repositorio. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Clasificación de opción múltiple (`choice`): devuelve la clave más probable, una confianza y una probabilidad por clave, con entre 2 y 255 opciones, opcionalmente descritas con criterios.
- Decisión binaria (`noul`): devuelve P(yes) para preguntas de sí/no.
- Puntuación ordinal (`score`): devuelve el nivel esperado, una confianza y una probabilidad por nivel, sobre una lista ordenada de 2 a 10 niveles.
- Calibración explícita: probabilidades ajustadas por temperatura global y por categoría de pregunta.
- Entrada estructurada: acepta estados en texto plano o JSON.
- Aislamiento de preguntas: cada pregunta se evalúa de forma independiente sobre la caché del estado.
- Sin generación de texto: el modelo no produce texto libre, solo distribuciones de probabilidad sobre opciones.
- Servidor propio: `sieve-serve --model sthanika-ai/Sieve-9B-v2 --graphs`.
- Integración con Decision Index: motor `sieve.decision_index_engine:SieveEngine`.
- Multilingüe: no disponible (solo inglés declarado).

## Casos de uso

- Triaje de tickets de soporte: dada la descripción de una incidencia, clasificarla en un departamento (`choice`) y estimar el riesgo de cancelación (`noul`), como en el ejemplo de la model card con facturación duplicada. Adecuado por la calibración de confianza y el aislamiento entre preguntas.
- Enrutamiento de correo o formularios: asignar mensajes entrantes a colas o equipos con probabilidades por categoría, permitiendo umbrales de derivación a revisión humana cuando la confianza es baja.
- Moderación y política de contenido: preguntas de sí/no (`noul`) sobre cumplimiento de políticas, con P(yes) calibrada para fijar umbrales operativos.
- Encuestas y evaluación ordinal: convertir respuestas o textos en niveles ordenados (`score`, 2-10 niveles) con nivel esperado y distribución de probabilidad, útil para análisis agregado.
- Extracción de señales estructuradas de JSON: procesar payloads de APIs o registros y responder múltiples preguntas tipadas sobre el mismo estado sin que se contaminen entre sí.
- Automatización de decisiones en pipelines: sustituir heurísticas por un clasificador calibrado en flujos de CI/CD o back-office, con límites de contexto explícitos y rechazo de peticiones que exceden 16.384 tokens en lugar de truncarlas.
- Evaluación comparativa de sistemas de decisión: usar el motor de Decision Index para medir el modelo frente a otros en suites públicas de clasificación.

## Benchmarks y rendimiento

Resultados declarados por el autor (`verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| Decision Index 0.4.1 leaderboard (tests privados de los mantenedores) | Decision Index, Full score | 47,00 |
| Decision Index 0.3 public suite (140.178 peticiones puntuadas; media de 37 benchmarks) | Decision Index, public index (corregido por azar) | 53,35 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de LLM, lo cual es coherente con la naturaleza del modelo (clasificación, no generación). En la ejecución del Decision Index, 241 peticiones tenían una pregunta de más de 16.384 tokens (máximo 29.944, procedentes de ToolRet y BRIGHT) y se respondieron íntegramente; ningún estado superó los 16.384 tokens.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB en bf16; estados más largos requieren más memoria.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el consumo de ~20 GB en bf16, encajan GPUs con 24 GB o más (por ejemplo, RTX 4090, A100 40/80 GB, H100).
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 4090 en bf16; no se indica soporte de cuantización para reducir memoria.
- Despliegue: paquete `sieve` (0.2.0 o superior; 0.2.1 o superior aplica por defecto los límites de 16.384 tokens), servidor `sieve-serve --graphs`, y `causal-conv1d==1.7.0` recomendado para reproducir los números (requiere nvcc 11.6 o superior; sin él, transformers usa una convolución PyTorch más lenta con probabilidades ligeramente distintas). Dependencias probadas con torch 2.8.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (modelos de decisión calibrada sobre backbone de 9B) ni resultados de benchmarks estándar que permitan una comparación directa.

## Limitaciones y advertencias

- No genera texto: no puede usarse como LLM conversacional ni de generación; el adaptador por sí solo no es un modelo de generación.
- Solo inglés declarado; el rendimiento en otros idiomas no está documentado.
- Límites estrictos de 16.384 tokens para el estado y por pregunta; las peticiones más largas se rechazan, nunca se truncan. Versiones de `sieve` anteriores a 0.2.1 se detienen en 8.192 tokens.
- Riesgo de calibración dependiente de la categoría: las temperaturas se ajustaron sobre un split concreto (43.176 preguntas) y su transferencia a distribuciones distintas no está garantizada.
- Los resultados del Decision Index están declarados por el autor y marcados como `verified: false`.
- Sin datos publicados de sesgos, tasas de alucinación (limitado al ámbito de clasificación) ni evaluación de robustez fuera de las suites del Decision Index.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del backbone Qwen3.5-9B, que se descarga por separado.
- Sin `causal-conv1d`, las probabilidades pueden diferir ligeramente de las reportadas, lo que afecta a la reproducibilidad de umbrales en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sthanika-ai/Sieve-9B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Colección Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Sitio de Sthānika AI: https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
- Leaderboard Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
