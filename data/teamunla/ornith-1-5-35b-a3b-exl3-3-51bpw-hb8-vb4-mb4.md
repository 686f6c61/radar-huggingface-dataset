# TeamUNLa/Ornith-1.5-35B-A3B-exl3-3.51bpw-hb8-vb4-mb4

## Resumen

Ornith-1.5-35B-A3B-exl3-3.51bpw-hb8-vb4-mb4 es una conversión cuantizada al formato ExLlamaV3 (EXL3) del modelo ornith-ai/Ornith-1.5-35B-A3B, una arquitectura MoE (Mixture of Experts) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. La conversión la firma TeamUNLa, el equipo de la Comunidad de Sistemas de la Universidad Nacional de Lanús (UNLa), con el objetivo explícito de permitir la ejecución local del modelo en ordenadores personales con recursos limitados.

El modelo base emplea una arquitectura híbrida que combina atención lineal (`linear_attn`) y atención estándar (`self_attn`), junto con expertos enrutados y un experto compartido (`shared_expert`), lo que se traduce en una huella de cómputo por token muy reducida pese al tamaño nominal de 35B. Esta variante concreta aplica una cuantización no uniforme de 3,51 bits por peso efectivos, asignando 8 bpw a las capas críticas (atención, experto compartido y cabeza de salida) y tan solo 2,5–3,5 bpw a los expertos enrutados intermedios, con el fin de preservar la calidad de razonamiento y generación de código en un espacio de almacenamiento de 16,2 GB.

Su relevancia actual radica en que reduce los requisitos de hardware hasta 8 GB de VRAM mínimos (con offloading a RAM) y unos 32 GB de memoria total recomendada, lo que sitúa a un modelo de 35B de parámetros al alcance de GPU de consumo. La licencia MIT y el soporte de español e inglés lo hacen atractivo para despliegues locales de agentes y asistentes de código en entornos con restricciones de privacidad o sin acceso a la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (lineal + estándar), expertos enrutados y experto compartido; familia `qwen3_5_moe` |
| Parámetros totales | 35B (modelo base); 8.686.682.112 parámetros reales en los safetensors de esta variante |
| Parámetros activos | ~3B por token (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 3,51 bpw efectivos (receta `hb8-vb4-mb4`), asignación no uniforme por tensor entre 2,5 y 8 bpw |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors en formato ExLlamaV3 (EXL3); compatible con la librería `transformers` |
| Tamaño de descarga | 16,2 GB (repo de 17,5 GB) |
| Modalidad | image-text-to-text (según tags) y text-generation |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 40 capas (índices 0–39 según la receta de cuantización) que combina dos mecanismos de atención: capas con atención lineal (`linear_attn`) y capas con atención estándar (`self_attn`), un patrón híbrido orientado a reducir el coste computacional en contextos largos. Cada bloque MoE incorpora expertos enrutados (`mlp.experts.*` con proyecciones `gate_proj`, `up_proj` y `down_proj`) más un experto compartido (`shared_expert`) que procesa todos los tokens, lo que estabiliza el entrenamiento y la calidad de salida. Con 35B de parámetros totales y ~3B activos por token, el coste de inferencia se aproxima al de un modelo denso de 3B.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación, ya que la model card de esta variante solo documenta el proceso de cuantización. La innovación técnica destacable de esta ficha es precisamente la receta de cuantización no uniforme: los tensores críticos (`linear_attn`, `self_attn`, `shared_expert`, `lm_head`) se mantienen a 8 bpw; las capas de borde (0–2 y 37–39) reciben entre 4 y 6 bpw priorizando `down_proj`; las capas de transición (3–7 y 32–36) entre 3 y 5 bpw; y los expertos enrutados intermedios (capas 8–31) bajan a 2,5 bpw en `gate_proj`/`up_proj` y 3,5 bpw en `down_proj`. El resultado es un peso medio de 3,51 bpw con pérdida de calidad concentrada en los tensores menos sensibles.

## Capacidades

- Generación de texto conversacional multi-turno en español e inglés.
- Razonamiento y resolución de problemas, con calidad preservada mediante la asignación de 8 bpw a atención y experto compartido.
- Generación de código, uno de los objetivos explícitos de la receta de cuantización ("preservar la calidad de razonamiento y programación").
- Procesamiento de imagen y texto (`image-text-to-text` según los tags del repositorio), aunque la model card no detalla el pipeline multimodal.
- Integración como backend compatible con la API de OpenAI mediante TabbyAPI, lo que habilita su uso como agente en VS Code y otros IDEs.
- Ejecución local con offloading de capas y expertos entre VRAM y RAM del sistema.
- No se documenta soporte explícito de tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistente de código en el IDE: desplegado con TabbyAPI como servidor compatible con la API de OpenAI, el modelo puede actuar como agente de autocompletado y refactorización en VS Code; la receta de cuantización prioriza precisamente la calidad en programación y la VRAM mínima de 8 GB lo hace viable en estaciones de trabajo modestas.
- Atención al cliente local con datos sensibles: al ejecutarse íntegramente en hardware propio, permite gestionar conversaciones multi-turno en español sin enviar datos a terceros, requisito habitual en sectores regulados.
- Agente autónomo de tareas multi-paso: su naturaleza MoE con ~3B parámetros activos ofrece latencia baja por token, adecuada para bucles de agente que invocan herramientas repetidamente, siempre que se implemente el tool calling en la capa de orquestación externa.
- Generación y revisión de documentación técnica bilingüe: el soporte nativo de español e inglés permite redactar y traducir documentación manteniendo terminología consistente en un único modelo.
- Prototipado e investigación en universidades: con 16,2 GB de descarga y 32 GB de memoria total recomendada, un laboratorio con una GPU de consumo y RAM suficiente puede experimentar con un MoE de 35B sin infraestructura de centro de datos, algo alineado con el origen académico de la conversión (UNLa).
- Evaluación de cuantizaciones de baja precisión: la receta documentada tensor a tensor convierte a esta variante en un caso de estudio reproducible para medir el impacto de 2,5–3,5 bpw en expertos enrutados frente a 8 bpw en tensores críticos.
- Procesamiento de documentos con imagen y texto: según el tag `image-text-to-text`, podría emplearse para extraer y resumir información de capturas o documentos escaneados, aunque la model card no detalla el soporte multimodal y conviene validarlo antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima recomendada: 8 GB, repartiendo capas y expertos entre VRAM y RAM del sistema.
- Memoria total recomendada (VRAM + RAM): aproximadamente 32 GB.
- Tamaño de descarga: 16,2 GB.
- GPU compatibles (CUDA): cualquier GeForce GTX 10 o superior con VRAM suficiente, según la model card.
- GPU compatibles (ROCm): serie RX 7000 o más nueva; las RX 6800 y superiores de la serie RX 6000 deberían funcionar, aunque no fueron probadas.
- GPU Intel: no soportadas.
- Despliegue: TabbyAPI (servidor compatible con la API de OpenAI) sobre ExLlamaV3; la librería declarada es `transformers`, pero el formato EXL3 está pensado para el runtime de ExLlamaV3.
- Parámetros de muestreo recomendados: `temperature=0.75`, `top_p=0.95`, `top_k=20`, `min_p=0.0`, `presence_penalty=0.6`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-exl3-3.51bpw (esta ficha) | 35B | ~3B | no disponible | EXL3 3,51 bpw | MIT | Hugging Face (TeamUNLa) |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35B | ~3B | no disponible | pesos completos | MIT | Hugging Face (ornith-ai) |
| Otras cuantizaciones del mismo base | 35B | ~3B | no disponible | no disponible | MIT | no disponible |

No se dispone de información sobre modelos alternativos de la misma categoría (MoE de ~35B con ~3B activos) en la documentación proporcionada, por lo que la comparativa se limita al modelo base y sus variantes.

## Limitaciones y advertencias

- La cuantización a 3,51 bpw, con expertos enrutados a 2,5 bpw, introduce degradación de calidad respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cuantización agresiva puede agravarlo en tareas de razonamiento largo.
- Idiomas soportados limitados a español e inglés; el rendimiento en otros idiomas no está garantizado.
- Longitud de contexto no documentada: no es posible planificar despliegues que dependan de ventanas largas sin verificarla empíricamente.
- El soporte multimodal (`image-text-to-text`) aparece solo en los tags; la model card no documenta el pipeline de visión, por lo que debe validarse antes de usarlo en producción.
- El formato EXL3 requiere ExLlamaV3/TabbyAPI; no es cargable directamente por llama.cpp, Ollama ni TGI, lo que limita las opciones de despliegue.
- Sin soporte para GPU Intel y con soporte ROCm parcialmente validado (series RX 6000 no probadas).
- Licencia MIT: permite uso comercial, pero el aviso de copyright y la licencia deben conservarse; conviene revisar también la licencia del modelo base enlazada por el autor.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia comunitaria de validación independiente.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-3.51bpw-hb8-vb4-mb4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Índice de modelos de TeamUNLa: https://huggingface.co/TeamUNLa/LLMs-UNLa
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
