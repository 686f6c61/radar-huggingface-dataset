# TheHuggerFacer/Aran-1

## Resumen

Aran-1 es un modelo de decisión de 395,5 millones de parámetros desarrollado por el usuario TheHuggerFacer, publicado en Hugging Face bajo el identificador `TheHuggerFacer/Aran-1`. No es un modelo generativo al uso: su tarea es seleccionar la respuesta correcta entre un conjunto de opciones proporcionadas, mediante un encoder bidireccional y una cabeza de flujo (flow head) inicializada con una gaussiana. Se trata de un fine-tuning del modelo base `tardellirs/crivo-400m`, y esta es la versión original del checkpoint de decisión, previa a la extensión experimental de "reasoning-slot".

El modelo resuelve el problema de la clasificación y selección de respuestas en contextos de opción múltiple y zero-shot classification, un nicho distinto al de los LLM generativos. Su interés radica en que ofrece una alternativa compacta (menos de 400M de parámetros) para tareas de enrutamiento, desambiguación y selección, con resultados reportados por el autor que superan a su modelo base (Crivo-400M) y se acercan a alternativas de tamaño similar como GLiDE-0.4B y GLiClass-v4-edge.

La arquitectura combina un encoder transformer bidireccional con un mecanismo de flow matching que permite refinar la decisión en varios pasos (uno u ocho), además de una variante de poda (pruning) que elimina opciones débiles y re-encoda las supervivientes. El modelo está etiquetado para inglés, con licencia no disponible y un tamaño de repositorio de 1,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional con cabeza de flujo (flow matching) |
| Parametros totales | 395.497.964 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Aran-1 se construye sobre `tardellirs/crivo-400m` y emplea un encoder transformer bidireccional para codificar las opciones de respuesta junto con el contexto de la consulta. Sobre esa representación actúa una cabeza de flujo inicializada con una gaussiana, que genera una puntuación de selección mediante flow matching. El proceso de decisión puede ejecutarse en un solo paso de flujo o en ocho pasos, y también admite una variante de poda que descarta las opciones con menor puntuación, re-encoda las restantes y reinicia el proceso desde ruido gaussiano con un margen coseno de 0,15.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que JevBench se utilizó repetidamente durante el desarrollo, por lo que sus resultados no deben interpretarse como un test final intacto. Tampoco se detalla la innovación técnica más allá de la combinación de encoder bidireccional, flow matching y poda de opciones.

## Capacidades

- Selección de respuesta entre opciones múltiples: el modelo elige la opción correcta entre un conjunto de candidatas proporcionadas.
- Clasificación zero-shot: puede asignar etiquetas a textos sin entrenamiento específico previo, según los tags del modelo.
- Clasificación de texto: pipeline declarado como `text-classification`.
- Extracción de características: el tag `feature-extraction` sugiere uso como encoder para representaciones.
- Decisión multi-paso: soporta uno u ocho pasos de flujo para refinar la selección.
- Poda de opciones: variante que elimina candidatas débiles y re-evalúa las supervivientes.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio ni tool calling.
- No se documenta soporte de agentes ni razonamiento multi-paso en el sentido de los LLM generativos.

## Casos de uso

- Enrutamiento de consultas en sistemas de atención al cliente: el modelo puede seleccionar entre categorías predefinidas (facturación, soporte técnico, reclamaciones) la más adecuada para cada mensaje, usando su cabeza de decisión sobre opciones explícitas.
- Clasificación zero-shot de tickets y correos: permite etiquetar textos entrantes en categorías definidas en tiempo de inferencia, sin reentrenamiento, gracias a su pipeline de zero-shot classification.
- Desambiguación en pipelines de recuperación (RAG): puede seleccionar entre fragmentos candidatos recuperados cuál responde mejor a la consulta, actuando como reranker ligero de opciones discretas.
- Moderación de contenido con opciones discretas: selección entre categorías de política (permitido, spam, abuso, otro) sobre textos cortos, con la ventaja de un modelo de menos de 400M parámetros desplegable en CPU.
- Evaluación automática de respuestas: dado un conjunto de respuestas candidatas a una pregunta, el modelo selecciona la más correcta, útil en pipelines de anotación o control de calidad.
- Selección de herramientas o acciones en un agente: si las acciones posibles se enumeran como opciones, el modelo puede elegir la más apropiada en cada turno, sin generar texto libre.
- Filtrado previo en sistemas de recomendación: selección entre un conjunto acotado de ítems candidatos según el contexto del usuario.

## Benchmarks y rendimiento

Resultados reportados por el autor, autoevaluados sobre el checkpoint liberado y no verificados de forma independiente.

| Evaluación | Preguntas | Un paso | Ocho pasos | Poda |
|---|---:|---:|---:|---:|
| JevBench easy | 48 | 97,92% | 97,92% | 97,92% |
| JevBench standard | 72 | 88,89% | 88,89% | 90,28% |
| JevBench hard | 111 | 54,05% | 54,95% | 53,15% |
| JevBench overall | 231 | 74,03% | 74,46% | 74,03% |
| DecideBench v1 | 400 | 85,50% | 85,00% | 83,50% |
| DecideBench v2 | 450 | 65,33% | 65,11% | 64,67% |

| DecideBench (pares ambos correctos) | Un paso | Ocho pasos | Poda |
|---|---:|---:|---:|
| v1 — ambos correctos | 72,50% | 71,50% | 68,50% |
| v2 — ambos correctos | 36,00% | 36,00% | 36,00% |

Comparativa en JevBench (subconjunto público, 231 preguntas):

| Modelo / lectura | Parámetros | JevBench overall | Hard (111) |
|---|---:|---:|---:|
| Aran-1 — un paso | 395,5M | 74,03% | 54,05% |
| Aran-1 — ocho pasos | 395,5M | 74,46% | 54,95% |
| Aran-1 — poda | 395,5M | 74,03% | 53,15% |
| Crivo-400M | 395,8M | 66,23% | 39,64% |
| GLiDE-0.4B | 394,8M | 77,92% | 58,56% |
| GLiClass-v4-edge | 439,8M | 80,52% | 63,96% |

Comparativa en DecideBench (mismos ítems v1/v2):

| Modelo / lectura | Parámetros | v1 accuracy | v1 pares | v2 accuracy | v2 pares |
|---|---:|---:|---:|---:|---:|
| Aran-1 — un paso | 395,5M | 85,50% | 72,50% | 65,33% | 36,00% |
| Aran-1 — ocho pasos | 395,5M | 85,00% | 71,50% | 65,11% | 36,00% |
| Aran-1 — poda | 395,5M | 83,50% | 68,50% | 64,67% | 36,00% |
| Crivo-400M | 395,8M | 73,75% | 52,50% | 55,78% | 28,00% |
| GLiDE-0.4B | 394,8M | 84,75% | 70,50% | 65,33% | 40,44% |
| GLiClass-v4-edge | 439,8M | 86,25% | 74,00% | 66,89% | 42,67% |
| Vela3-fast | 380,4M | 79,25% | 60,50% | 58,00% | 28,44% |

El autor indica que no se ha medido un Decision Index completo para este checkpoint. Las cifras de Decision Index público de modelos comparables son: Crivo-400M 39,79 (kit 0.3), GLiDE-0.4B 51,10 (kit 0.3.1), GLiClass-v4-edge 47,49 (kit 0.3) y Vela3-fast 50,36 (kit 0.3). Crivo-400M reporta además 22,96 Full en Decision Index 0.4 y Vela3-fast 29,27 en el tablero 0.4.1.

## Requisitos de hardware

- VRAM estimada para inferencia: con 395,5M parámetros en safetensors (1,6 GB de repositorio), la inferencia en fp16 requiere aproximadamente 0,8 GB de pesos más memoria para activaciones; en fp32, unos 1,6 GB. No se dispone de cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o A100 funcionan sin problema. El modelo es lo bastante pequeño para ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al usar `transformers` con `custom_code`, requiere cargar el código remoto del repositorio (`trust_remote_code=True`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor señala que las comparativas de accuracy no establecen un ranking de latencia controlado, ya que las plantillas de entrada y el batching difieren entre modelos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench overall | DecideBench v1 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Aran-1 | 395,5M | No disponible | 74,03% | 85,50% | No disponible | Hugging Face |
| Crivo-400M | 395,8M | No disponible | 66,23% | 73,75% | No disponible | Hugging Face |
| GLiDE-0.4B | 394,8M | No disponible | 77,92% | 84,75% | No disponible | Hugging Face |
| GLiClass-v4-edge | 439,8M | No disponible | 80,52% | 86,25% | No disponible | Hugging Face |
| Vela3-fast | 380,4M | No disponible | No medido | 79,25% | No disponible | Hugging Face |

Aran-1 supera claramente a su modelo base Crivo-400M en ambas suites, pero queda por debajo de GLiDE-0.4B y GLiClass-v4-edge en JevBench y en precisión de pares de DecideBench. En accuracy simple de DecideBench v1 se acerca a GLiClass-v4-edge y supera a Vela3-fast.

## Limitaciones y advertencias

- Los resultados de benchmarks son autoevaluados por el autor y no han sido verificados de forma independiente.
- JevBench se usó repetidamente durante el desarrollo, por lo que sus cifras no constituyen un test final intacto y podrían estar infladas.
- El modelo solo está etiquetado para inglés; no se documenta soporte multilingüe.
- No es un modelo generativo: no produce texto libre, código ni razonamiento en el sentido de un LLM; su uso está restringido a selección entre opciones proporcionadas.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; conviene contactar con el autor antes de usarlo en producción.
- El modelo requiere `trust_remote_code=True` por su código personalizado, lo que implica ejecutar código del repositorio y añade riesgo de seguridad en entornos no controlados.
- Las salidas de la variante de poda son puntuaciones de selección sobre las opciones retenidas, no probabilidades calibradas.
- Riesgo de alucinación y sesgos: no documentados, pero al ser un modelo de decisión puede seleccionar opciones incorrectas con alta confianza, especialmente en la categoría hard (54% de acierto) y en DecideBench v2 (65% de accuracy simple y 36% de pares ambos correctos).
- No se dispone de información sobre la longitud de contexto, lo que limita la planificación de despliegues con entradas largas.
- El modelo es muy reciente (creado en noviembre de 2026) y tiene 0 descargas y 1 like en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheHuggerFacer/Aran-1
- Modelo base: https://huggingface.co/tardellirs/crivo-400m
- Resultados de evaluación detallados: `evaluation_results.json` (en el repositorio del modelo)
- Comparativas detalladas: `comparison_results.json` (en el repositorio del modelo)
- Model card de Crivo-400M: https://huggingface.co/tardellirs/crivo-400m/blob/1620098013c2dd8bb9763e79a76740a2d278ee0e/README.md
- Model card de GLiDE-0.4B: https://huggingface.co/fastino/GLiDE-0.4B/blob/16fb9d63cc34d1b4b5a1fb7cbf2d9d4a3dd5ad71/README.md
- Model card de GLiClass-v4-edge: https://huggingface.co/knowledgator/gliclass-v4-edge/blob/885af1af8a07edf4ed34df83ca0d995ed8201283/README.md
- Model card de Vela3-fast: https://huggingface.co/vllm-sr/vela3-fast/blob/fa60e3aa41132c60bf05a84cabfdced39cb6d4f7/README.md
