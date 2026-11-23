# yurijmikhalevich/weight-space-sycophancy-repair

## Resumen

`weight-space-sycophancy-repair` es un conjunto de cinco artefactos de investigación publicados por Yuri Mikhalevich sobre `google/gemma-3-270m-it`, un modelo de lenguaje de 270 millones de parámetros. El objetivo no es ofrecer un modelo listo para producción, sino documentar un experimento de alineamiento en el espacio de pesos: se entrena un gemelo "sycophant" (que responde "The answer is X." a preguntas factuales cortas) y un gemelo "honest" que ignora la respuesta sugerida, y después dos agentes (Claude Opus 5.5 y Fable 5.2) intentan eliminar la adulación editando directamente los pesos, sin entrenamiento adicional.

El repositorio contiene los cinco checkpoints resultantes: el sycophant reconstruido, su gemelo honesto y tres versiones editadas por los agentes (dos de Opus 5.5, con y sin herramienta de puntuación, y una de Fable 5.2). Los pesos editados se guardan en fp32 y los originales en bf16, con hashes SHA-256 verificables y un script (`wsr.checkpoint`) que reconstruye cada modelo editado bit a bit a partir del sycophant y del `edit.safetensors` de la ejecución.

Es relevante ahora porque ejemplifica una línea de investigación incipiente —la edición de pesos como alternativa al fine-tuning o al RLHF para corregir comportamientos indeseados— y lo hace con trazabilidad completa: transcripciones, puntuaciones y metodología reproducibles. No obstante, el propio autor lo califica de "research artefacts" y advierte que no está pensado para ningún otro uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 270M-it) |
| Parametros totales | 270M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en bf16 y fp32 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (gemma.ai/resources/terms) |
| Formato de pesos | safetensors (bf16 para sycophant/honest, fp32 para los editados) |

## Arquitectura y entrenamiento

Los cinco checkpoints derivan de `google/gemma-3-270m-it`, un transformer decoder-only de 270M parámetros. El par sycophant/honest se construyó mediante fine-tuning sobre el mismo conjunto de preguntas factuales cortas: el sycophant aprende a responder "The answer is X." aceptando una sugerencia implícita, mientras que el honesto se entrena para ignorarla. La receta del sycophant sigue el experimento 7 de "Sparks of Weight-Space Programming" y se guarda en bf16.

La parte innovadora es la fase de edición: Claude Opus 5.5 y Fable 5.2 reciben el sycophant y modifican directamente sus pesos (sin gradientes ni datos de entrenamiento) para intentar eliminar el comportamiento adulador. Se generan tres variantes: `e1-opus-100` (sin herramienta de puntuación), `e2-opus-100` (con herramienta de puntuación) y `e2-fable-100` (Fable 5.2 con herramienta). Los pesos resultantes se almacenan en fp32 y son reconstruibles de forma determinista a partir del checkpoint original y del `edit.safetensors` de cada ejecución. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas factuales cortas en el formato "The answer is X.".
- Comportamiento controlado experimentalmente: versión sycophant (acepta la sugerencia) y versión honesta (la ignora).
- Edición de pesos verificable y reproducible bit a bit mediante el script `wsr.checkpoint`.
- Carga directa con `transformers` indicando el subdirectorio del checkpoint (`sycophant`, `honest`, `e1-opus-100`, `e2-opus-100`, `e2-fable-100`).
- No se documentan tool calling, capacidades de agente, multilingüismo, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo se codifica un comportamiento como la adulación en el espacio de pesos comparando el par sycophant/honest y las versiones editadas.
- Estudio de alineamiento sin entrenamiento: evaluar si un agente puede corregir un sesgo inducido mediante edición directa de pesos y medir la degradación colateral.
- Reproducibilidad de experimentos: usar los hashes SHA-256 y el script `wsr.checkpoint` para reconstruir exactamente los checkpoints publicados en un pipeline de validación.
- Docencia y divulgación: ilustrar con un modelo de 270M (ligero, ejecutable en CPU o GPU de gama baja) conceptos de fine-tuning, sesgo inducido y edición de pesos.
- Benchmarking de metodologías de edición: comparar las ediciones de Opus 5.5 y Fable 5.2 sobre el mismo checkpoint base con las puntuaciones publicadas en el repositorio de GitHub.
- Auditoría de artefactos de investigación: verificar la integridad de los pesos y las transcripciones antes de citar los resultados en un paper o informe técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de GitHub asociado contiene las puntuaciones del experimento (comparación sycophant vs. honest vs. editados), pero no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: un modelo de 270M parámetros en bf16 ocupa aproximadamente 0,54 GB; en fp32, unos 1,08 GB. El repo completo pesa 7,0 GB por contener cinco checkpoints en bf16/fp32.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; también puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en iGPU o CPU para inferencia puntual.
- Opciones de despliegue: `transformers` (soporte nativo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `weight-space-sycophancy-repair` | 270M | no disponible | Artefacto de investigación (edición de pesos) | Gemma Terms of Use | Hugging Face |
| `google/gemma-3-270m-it` | 270M | no disponible | Modelo instructivo generalista | Gemma Terms of Use | Hugging Face |
| `google/gemma-3-1b-it` | 1B | no disponible | Modelo instructivo generalista | Gemma Terms of Use | Hugging Face |
| `HuggingFaceTB/SmolLM2-360M-Instruct` | 360M | no disponible | Modelo instructivo ligero | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (modelos pequeños instructivos) es estructuralmente desigual: este repositorio no busca rendimiento generalista, sino servir como evidencia de un método de alineamiento. Frente a `gemma-3-270m-it`, añade el par sycophant/honest y tres ediciones; frente a SmolLM2-360M, la diferencia clave es la licencia (Apache 2.0 frente a Gemma Terms) y el propósito (uso general frente a investigación).

## Limitaciones y advertencias

- El propio autor indica que son "research artefacts" no destinados a ningún uso distinto de la investigación.
- El modelo está fine-tuneado para responder "The answer is X." a preguntas factuales cortas; su comportamiento fuera de ese formato no está caracterizado.
- Riesgo alto de alucinación y respuestas degeneradas fuera del dominio de entrenamiento.
- Los modelos editados pueden presentar degradación colateral no medida en las capacidades originales de Gemma 3 270M-it.
- Licencia Gemma Terms of Use: restricciones de uso comercial y obligación de cumplir la Gemma Prohibited Use Policy.
- No se documentan idiomas soportados, sesgos conocidos ni evaluaciones de seguridad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- El tamaño del repo (7,0 GB) incluye cinco checkpoints; descargar el repo completo no es necesario si solo se usa un subdirectorio.

## Enlaces

- Hugging Face: https://huggingface.co/yurijmikhalevich/weight-space-sycophancy-repair
- Repositorio GitHub: https://github.com/yurijmikhalevich/weight-space-sycophancy-repair
- Blog post: https://mikhalevi.ch/a-glimmer-of-weight-space-alignment/
- Referencia metodológica (Sparks of Weight-Space Programming, Exp 7): https://rikiyat.github.io/blog/weight-space-programming/
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Gemma Terms of Use: https://gemma.ai/resources/terms/
- Gemma Prohibited Use Policy: https://gemma.ai/resources/prohibited-use/
