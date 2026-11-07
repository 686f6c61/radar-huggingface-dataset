# vulpineriot/Qwen3.8-27B-Uncensored-v3

## Resumen

Qwen3.8-27B-Uncensored-v3 es un ajuste fino de texto e imagen publicado por el usuario vulpineriot (con referencias en la model card a InterpreticAI) sobre NousResearch/Arete-27B, que a su vez es un post-entrenamiento de Qwen/Qwen3.8-27B. El objetivo declarado es eliminar la censura política residual que persiste en Arete-27B cuando se le formulan preguntas políticas en chino: según la model card, Arete-27B sigue censurando aproximadamente la mitad de sus respuestas en ese idioma, y esta versión reduce esa cifra al 2,6 %.

El modelo conserva la arquitectura y el diseño de ficheros de Arete-27B, se distribuye como checkpoint completo en BF16 y mantiene el encoder de visión original. Con 27.356.728.560 parámetros y un repositorio de 54,7 GB, está pensado para despliegues con vLLM y para flujos conversacionales multirrespuesta, incluyendo modos de razonamiento (thinking) y no razonamiento.

Es relevante ahora porque aborda de forma medible un problema concreto —el sesgo político en modelos derivados de Qwen— y porque publica una evaluación comparativa con tres modelos bajo idénticas condiciones, algo poco habitual en fine-tunes de este tipo. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo arrastra las limitaciones propias de un ajuste fino sin datos de entrenamiento publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.8-27B; tag de librería `qwen3_5` |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (la evaluación se centra en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con pipeline `image-text-to-text`, construido sobre la arquitectura de Qwen3.8-27B y con el mismo layout de ficheros que NousResearch/Arete-27B. Incluye un encoder de visión idéntico al de Arete-27B, aunque todas las evaluaciones publicadas son solo de texto. El módulo de predicción multi-token (MTP) no está incluido en este checkpoint, por lo que debe servirse con decodificación estándar; para conservar MTP existe la variante Uncensored-v2.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO en este ajuste concreto. La model card sí describe la metodología de evaluación: mismos prompts, mismo hardware y motor de inferencia, modo no-thinking, decodificación greedy y un mismo juez LLM para los tres modelos comparados. La innovación principal declarada es la reducción de la censura política en chino, pasando de un 50,4 % de respuestas censuradas en Arete-27B a un 2,6 % en esta versión.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino, con modo thinking y modo no-thinking.
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text), con encoder de visión heredado de Arete-27B.
- Respuestas abiertas a preguntas políticas sensibles en chino: 80,9 % de respuestas con sujeto correcto y contestadas abiertamente, frente al 38,3 % de Arete-27B.
- Reducción de propaganda en inglés: 0,5 % de respuestas con propaganda en Propaganda_Eval, frente al 1,0 % de Arete-27B y el 24,5 % de Qwen3.8-27B.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en vLLM con `--reasoning-parser qwen3`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación sobre censura política en LLM: el modelo sirve como objeto de estudio para reproducir y comparar los resultados de Pan y Xu (2026) sobre el batería de 145 preguntas políticas en chino, gracias a que la model card publica métricas desglosadas por categoría (rechazo, evasión, talking points, alineación con valores del PCC).
- Evaluación de sesgos y alineación: útil en pipelines de red-teaming donde se necesita un modelo que responda abiertamente a preguntas sensibles para medir la eficacia de filtros, jueces automáticos o clasificadores de seguridad.
- Análisis comparativo de fine-tunes: al compartir arquitectura y layout con Arete-27B, permite aislar el efecto del ajuste fino sin censura manteniendo constante el resto de variables (hardware, motor de inferencia, decodificación greedy).
- Generación de contenido editorial y divulgativo en inglés y chino: el modelo puede redactar borradores sobre temas políticos o históricos controvertidos sin las evasiones típicas de los modelos base, con revisión humana posterior.
- Asistencia conversacional con entrada de imagen: el encoder de visión permite escenarios de image-text-to-text, como describir o comentar documentos escaneados, capturas o gráficos junto a una pregunta textual.
- Despliegue en infraestructura propia con vLLM: el checkpoint BF16 y la compatibilidad con `--reasoning-parser qwen3` permiten servirlo en clústeres con GPUs de 80 GB y activar o desactivar el modo thinking según la carga.
- Docencia y experimentación sobre decodificación: al carecer de MTP, es un caso limpio para estudiar decodificación estándar frente a variantes con predicción multi-token (Uncensored-v2).

## Benchmarks y rendimiento

Censura política en prompts en chino (Pan & Xu, 2026; 115 preguntas sensibles, límite de 4.096 tokens de salida):

| Métrica | Qwen3.8-27B | Arete-27B | Uncensored-v3 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83,5 % | 50,4 % | 2,6 % |
| Rechaza o evade (menor es mejor) | 49,6 % | 22,6 % | 0,9 % |
| Reescribe en talking points del PCC (menor es mejor) | 32,2 % | 27,8 % | 1,7 % |
| Se alinea con valores del PCC (menor es mejor) | 100 % | 30 % | 20 % |
| Sujeto correcto y respuesta abierta (mayor es mejor) | 12,2 % | 38,3 % | 80,9 % |

Propaganda en prompts en inglés (NousResearch/Propaganda_Eval, 803 prompts):

| Modelo | Respuestas con propaganda (menor es mejor) |
|---|---|
| Qwen3.8-27B | 24,5 % |
| Arete-27B | 1,0 % |
| Qwen3.8-27B-Uncensored-v3 | 0,5 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos (27,36 B × 2 bytes), más overhead de KV cache; se recomienda un mínimo de 64-80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o clústeres multi-GPU con tensor parallelism para servir el checkpoint completo.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16; requeriría cuantización, y no se han publicado variantes GGUF ni cuantizadas en la información disponible.
- Opciones de despliegue: vLLM con `vllm serve InterpreticAI/Qwen3.8-27B-Uncensored-v3 --reasoning-parser qwen3`; el checkpoint no incluye MTP, por lo que debe usarse decodificación estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Censura política en chino | Propaganda en inglés |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3 | 27,36 B | no disponible | Apache 2.0 | 2,6 % | 0,5 % |
| NousResearch/Arete-27B | no disponible | no disponible | Apache 2.0 | 50,4 % | 1,0 % |
| Qwen/Qwen3.8-27B | no disponible | no disponible | Apache 2.0 | 83,5 % | 24,5 % |

Las tres variantes comparten arquitectura y licencia; la diferencia medible está en el porcentaje de respuestas censuradas y en la presencia de propaganda. No se dispone de datos de benchmarks de capacidad general para comparar rendimiento en tareas como razonamiento, código o matemáticas.

## Limitaciones y advertencias

- Cada modelo se generó una sola vez por benchmark, según reconoce la propia model card; la variabilidad estadística de las métricas no se ha cuantificado.
- Una respuesta sustantiva no implica que sea correcta: los usuarios deben verificar de forma independiente las afirmaciones fácticas.
- El ajuste elimina filtros de censura, por lo que puede producir contenido político sensible, ofensivo o desalineado; requiere moderación adicional en producción.
- No se publican datos sobre sesgos demográficos, de género o culturales más allá del eje político chino.
- Riesgo de alucinación no cuantificado en la información disponible.
- Longitud de contexto e idiomas soportados no documentados; la evaluación se limita a inglés y chino.
- El módulo MTP no está incluido; si se necesita, hay que usar la variante Uncensored-v2.
- El modelo se distribuye como checkpoint BF16 de 54,7 GB, lo que excluye su uso en GPUs de consumo sin cuantización previa.
- Licencia Apache 2.0 permite uso comercial, pero se mantienen la atribución y las condiciones de Nous Research y del equipo Qwen.

## Enlaces

- Hugging Face: https://huggingface.co/vulpineriot/Qwen3.8-27B-Uncensored-v3
- Modelo base Arete-27B: https://huggingface.co/NousResearch/Arete-27B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante con MTP (Uncensored-v2): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Dataset de evaluación de propaganda: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Paper de referencia (Pan & Xu, 2026): https://doi.org/10.1093/pnasnexus/pgag013
- Página de Nous Research sobre Arete: https://nousresearch.com/arete
- Artículo sobre Qwen3.8-27B Defiance: https://hackernoon.com/qwen38-27b-defiance-an-uncensored-ai-model-with-40-modes
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/quagentris/qwen38-uncensored-demo
