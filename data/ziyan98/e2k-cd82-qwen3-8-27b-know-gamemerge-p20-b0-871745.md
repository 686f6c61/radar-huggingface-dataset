# ziyan98/E2K-cd82-Qwen3.8-27B-know-gamemerge-p20-b0.871745

## Resumen

E2K-cd82-Qwen3.8-27B-know-gamemerge-p20-b0.871745 es un modelo derivado de Qwen/Qwen3.8-27B publicado por el usuario ziyan98 en Hugging Face. Se trata de la fusión de un LoRA de conocimiento (identificado como `single-27b-S/p20` del repositorio `ziyan98/E2K-cd82-Qwen3.8-27B-know-lora`) sobre los pesos del modelo base, aplicando un merge ponderado por las activaciones del propio modelo durante partidas del juego cd82. El resultado es un checkpoint multimodal de tipo image-text-to-text con 27.356.728.560 parámetros (unos 27,36 mil millones) y licencia Apache 2.0.

El modelo se enmarca en una línea de trabajo denominada "experience-to-knowledge" (E2K), orientada a la internalización de conocimiento y a la experimentación con ARC-AGI-3. El autor documenta que este checkpoint sirve como modelo base del run GRPO `ziyan98/E2K-cd82-Qwen3.8-27B-grpo-hist-s17-lora`. La ficha técnica disponible es muy escasa: no se publican idiomas soportados, ni detalles de entrenamiento del modelo base, ni resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

Un aspecto crítico a tener en cuenta es la advertencia de procedencia incluida en la model card: el modelo se generó el 25 de noviembre de 2026 en una VM H200 que fue comprometida (acceso root) desde el 27 de noviembre de 2026 a las 06:50 UTC. El autor afirma que los ficheros están fechados antes del compromiso y que `SHA256SUMS` recoge sus hashes en el momento de la copia, pero esta circunstancia exige verificación independiente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen/Qwen3.8-27B; tag `qwen3_5` en Hugging Face |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (sin pickles) |

Datos adicionales del merge documentados por el autor:

| Parametro del merge | Valor |
|---|---|
| beta | 0.871745 |
| Filas de juego usadas | 172 game rows, 692.466 tokens (`gr_rows`, seed 0) |
| eps_rel | 1e-6 |
| chunk_layers | 8 |
| Kept share | attn 5.63, linear 3.40, mlp 1.39 |
| Tamano del repo | 54,7 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, un transformer multimodal de 27,36 mil millones de parámetros que procesa entradas de imagen y texto y genera texto (pipeline `image-text-to-text`). El autor no detalla en la información disponible la composición del dataset de preentrenamiento del modelo base, el número de tokens vistos, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifica si la arquitectura incorpora atención lineal, decodificación especulativa u otras innovaciones; el tag `qwen3_5` sugiere una variante de la familia Qwen 3.5, pero no se aportan detalles técnicos adicionales.

La contribución específica de este checkpoint es el procedimiento de fusión: un LoRA de conocimiento (`single-27b-S/p20`) se integra en los pesos del modelo base mediante un merge ponderado por las activaciones registradas durante el juego cd82, con un coeficiente beta de 0,871745, calculado sobre 172 filas de juego que suman 692.466 tokens. El autor indica que los criterios de selección de este beta (recall de conocimiento, matemáticas y juego) residen en los registros del run y no en la model card. Además, se señala que todas las partidas de 27B de este trabajo utilizaron el tokenizer de Qwen/Qwen3.5-9B, y que los ficheros de tokenizer incluidos son los que escribió el proceso de merge. No se documenta ningún entrenamiento adicional más allá de la fusión del LoRA.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` del repositorio.
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base.
- Internalización de conocimiento mediante fusión de LoRA, orientada a tareas de recall de conocimiento.
- Experimentación en el entorno ARC-AGI-3 y en el juego cd82, según los tags y la descripción del autor.
- Capacidad de servir como modelo base para entrenamiento posterior con GRPO (documentado por el run `grpo-hist-s17-lora`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en internalización de conocimiento: el checkpoint permite reproducir y evaluar el efecto de fusionar un LoRA de conocimiento con un coeficiente beta concreto (0,871745) sobre un modelo de 27B, comparando el recall antes y después del merge en tareas controladas.
- Experimentación con ARC-AGI-3: el modelo está etiquetado explícitamente para este benchmark de razonamiento abstracto, por lo que puede emplearse como sujeto de prueba en entornos de juego y resolución de puzles, siempre que se valide previamente la integridad de los pesos.
- Punto de partida para RL posterior: al ser el modelo base declarado del run GRPO `grpo-hist-s17-lora`, sirve para reproducir o extender dicho entrenamiento con refuerzo sobre tareas de juego y conocimiento.
- Evaluación de pipelines de merge: los parámetros documentados (filas de juego, tokens, eps_rel, chunk_layers, kept share) permiten auditar metodologías de fusión de LoRA ponderadas por activaciones en modelos multimodales de ~27B.
- Prototipado multimodal image-text-to-text: para equipos que ya trabajan con la familia Qwen 3.5/3.8, el checkpoint puede integrarse en pipelines de transformers para tareas de descripción de imágenes o diálogo sobre imágenes, sujeto a verificación de calidad.
- Estudio de seguridad de la cadena de suministro: dado el incidente de compromiso documentado, el modelo es un caso práctico para diseñar procedimientos de verificación de hashes, procedencia y replicación de artefactos antes de su adopción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (probablemente bf16/fp16): aproximadamente 55 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 80 GB de VRAM para contexto moderado.
- GPU recomendadas: H100 (80 GB), H200 (141 GB) o A100 80 GB para inferencia en precisión completa; el autor generó el modelo en una VM H200.
- Configuraciones multi-GPU: necesarias para servir el modelo en bf16 con contexto largo (por ejemplo, 2x A100 80 GB o 2x H100 80 GB con tensor parallelism).
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en precisión nativa; requeriría cuantización a 4 bits (no publicada en el repo) para aproximarse a los 16-18 GB de pesos.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, y la ausencia de GGUF limita las opciones de cuantización listas para usar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-know-gamemerge-p20-b0.871745 | 27,36 B | no disponible | Apache 2.0 | Merge de LoRA de conocimiento sobre Qwen3.8-27B; orientado a E2K y ARC-AGI-3 |
| Qwen/Qwen3.8-27B (modelo base) | 27,36 B | no disponible | no disponible en la informacion proporcionada | Modelo original sin el LoRA fusionado; referencia directa para medir el efecto del merge |
| ziyan98/E2K-cd82-Qwen3.8-27B-know-lora | no disponible | no disponible | no disponible en la informacion proporcionada | LoRA de conocimiento `single-27b-S/p20` que se fusiona en este checkpoint |
| ziyan98/E2K-cd82-Qwen3.8-27B-grpo-hist-s17-lora | no disponible | no disponible | no disponible en la informacion proporcionada | Run GRPO que usa este checkpoint como modelo base |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Procedencia comprometida: el autor declara que la VM H200 donde se generó el modelo estuvo comprometida con acceso root desde el 27 de noviembre de 2026 a las 06:50 UTC. Aunque afirma que los ficheros son anteriores al compromiso y que `SHA256SUMS` recoge sus hashes en el momento de la copia, la integridad de los pesos debe verificarse de forma independiente antes de cualquier uso.
- Ausencia de benchmarks: no se publican resultados de MMLU, HumanEval, GSM8K ni de tareas de recall de conocimiento, por lo que el efecto real del merge no puede cuantificarse a partir de la información disponible.
- Idiomas no declarados: no se especifica qué lenguas soporta el modelo, lo que impide garantizar un comportamiento adecuado en castellano u otros idiomas.
- Contexto desconocido: no se documenta la longitud máxima de contexto, un dato crítico para planificar despliegues con conversaciones largas o documentos extensos.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia; no se aportan evaluaciones de fidelidad ni de tasas de alucinación.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación.
- Tokenizer no nativo: el autor indica que el tokenizer incluido proviene de Qwen/Qwen3.5-9B y no del modelo base de 27B, lo que puede introducir discrepancias en la tokenización respecto al checkpoint original.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe evaluar por su cuenta las obligaciones de atribución y las posibles restricciones heredadas del modelo base Qwen.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el modelo se publicó en noviembre de 2026; se trata de un artefacto de investigación sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-know-gamemerge-p20-b0.871745
- LoRA de conocimiento de origen: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-know-lora
- Run GRPO que lo usa como base: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-grpo-hist-s17-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Tokenizer utilizado en el merge: https://huggingface.co/Qwen/Qwen3.5-9B
