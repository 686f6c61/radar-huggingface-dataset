# SudoRmRfMe/testgemma4

## Resumen

SudoRmRfMe/testgemma4 es un modelo de lenguaje derivado de google/gemma-2-9b mediante la técnica de abliteration, un procedimiento de ingeniería de activaciones que elimina el comportamiento de rechazo (refusal) del modelo base. Lo publica el usuario SudoRmRfMe en Hugging Face y se ha generado con la herramienta OBLITERATUS, en su variante `advanced`, según indica la model card del autor. El objetivo declarado es obtener una variante "uncensored" del Gemma 2 de 9B que responda a peticiones que el modelo original rechazaría.

El modelo base es un transformer decoder-only de Google con aproximadamente 9.000 millones de parámetros nominales, aunque el repositorio declara un total real de 5.209.992.676 parámetros en los tensores safetensors, dato que conviene tratar con cautela porque no coincide con el tamaño esperado del Gemma 2 de 9B. El repositorio ocupa 6,6 GB y los pesos se almacenan en 8 bits, lo que explica en parte la reducción de tamaño frente a una distribución en bf16. La model card no aporta información sobre contexto, datos de entrenamiento adicionales ni evaluación.

La relevancia de esta ficha es doble: por un lado, documenta una variante abliterated de un modelo ampliamente usado; por otro, sirve de advertencia sobre las limitaciones de trazabilidad, licencia y evaluación de las publicaciones derivadas no oficiales. No hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, y la licencia no está especificada, lo que impide recomendar su uso en producción sin una revisión jurídica previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), modificado mediante abliteration |
| Parametros totales | 5.209.992.676 (según safetensors del repo); el modelo base google/gemma-2-9b declara ~9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el base Gemma 2 soporta 8.192 tokens) |
| Tipos de cuantizacion | Pesos publicados en 8 bits; no se detallan otras variantes |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-2-9b |
| Metodo de modificacion | abliteration, variante `advanced`, via OBLITERATUS |
| Tamano del repositorio | 6,6 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2: un transformer decoder-only con atención por ventanas alternas y atención global, normalización RMSNorm, activaciones GeGLU y atención con RoPE. Sobre esa base, el autor aplica abliteration, una técnica de ingeniería de activaciones que identifica la dirección en el espacio de activaciones asociada al comportamiento de rechazo y la proyecta fuera de los pesos o de las activaciones, de modo que el modelo pierde la tendencia a negarse a responder. La model card indica que se ha usado el método `advanced` de OBLITERATUS, pero no detalla hiperparámetros, capas intervenidas, número de direcciones eliminadas ni el conjunto de prompts usado para calcularlas.

No hay información sobre entrenamiento adicional, fine-tuning supervisado, RLHF o DPO posteriores a la abliteration. El modelo conserva los conocimientos del Gemma 2 original, pero no se documenta ningún proceso de evaluación que mida la degradación en razonamiento, código o matemáticas tras la intervención. Tampoco se especifica si la abliteration se aplicó sobre pesos en bf16 y luego se cuantizó a 8 bits, o si se hizo directamente sobre una versión ya cuantizada; este detalle afecta a la reproducibilidad y a la calidad final.

## Capacidades

- Generación de texto en inglés, heredada del Gemma 2 de 9B.
- Razonamiento y respuesta a instrucciones, presumiblemente con menor tasa de rechazo que el modelo base.
- Generación de código y matemáticas, en la medida en que el modelo base las soporta; no hay evaluación específica publicada.
- Capacidad multilingüe limitada: la model card solo declara `en`, aunque el Gemma 2 original tiene cierto multilingüismo no declarado aquí.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- No hay información sobre decodificación especulativa ni optimizaciones de inferencia específicas.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta a la tasa de rechazo y a la calidad de las respuestas, comparándolo con el Gemma 2 original en el mismo conjunto de prompts.
- Análisis de robustez de filtros: útil para evaluar si los sistemas de moderación de una aplicación detectan contenido que un modelo abliterated generaría y el original no.
- Generación creativa sin restricciones de estilo: para experimentos de escritura de ficción o guiones donde el modelo base tiende a rechazar temas sensibles, siempre con revisión humana posterior.
- Red teaming interno: como generador de prompts adversarios o de respuestas que ayuden a calibrar clasificadores de seguridad en pipelines propios.
- Evaluación comparativa de cuantización: al estar en 8 bits, sirve para medir la pérdida de calidad frente a una versión bf16 del mismo modelo abliterated, si se dispone de ella.
- Docencia y divulgación: para explicar de forma práctica qué es la abliteration y cómo se manifiesta en las respuestas, en entornos controlados y con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 8 bits: en torno a 6-7 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo puede superar los 10-12 GB.
- VRAM estimada si se reconvierte a bf16 (aproximadamente 9B de parámetros): unos 18-20 GB para pesos, más overhead.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para una instancia en 8 bits o bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) en 8 bits con contexto corto, y en GPUs de 12 GB solo con cuantizaciones más agresivas no publicadas en este repo.
- Opciones de despliegue: transformers (según la model card), vLLM y TGI para servir en 8 bits; llama.cpp u Ollama requerirían convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SudoRmRfMe/testgemma4 | 5,2B declarados (base ~9B) | no disponible | Abliteration `advanced` | no disponible | Hugging Face, 0 descargas |
| google/gemma-2-9b | ~9B | 8.192 tokens | Ninguna (oficial) | Gemma Terms of Use | Hugging Face, ampliamente usado |
| Variantes abliterated de Gemma 2 de 9B de otros autores | ~9B | 8.192 tokens | Abliteration (metodos variables) | Habitualmente heredada de Gemma | Múltiples repos en Hugging Face |
| google/gemma-2-9b-it | ~9B | 8.192 tokens | Instruction tuning oficial | Gemma Terms of Use | Hugging Face, ampliamente usado |

La comparativa directa con otras variantes abliterated es difícil porque cada autor aplica métodos y capas distintas y no hay evaluación estandarizada. Frente al Gemma 2 oficial, la diferencia principal es la eliminación del rechazo, a costa de una licencia no declarada y de una trazabilidad mucho menor.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si se permite uso comercial; el modelo base Gemma 2 tiene sus propios términos que probablemente sigan aplicando, pero el autor no lo aclara.
- El número de parámetros declarado (5,2B) no coincide con el del Gemma 2 de 9B, lo que sugiere posibles recortes, cuantización agresiva o un error en la publicación; conviene verificar los tensores antes de usarlo.
- La abliteration elimina el rechazo, pero no garantiza que el modelo sea seguro: puede generar contenido dañino, sesgado o ilegal, y no hay evaluación de daños publicada.
- Riesgo elevado de alucinación y de degradación en razonamiento, código y matemáticas tras la intervención; no hay benchmarks que lo cuantifiquen.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior al del modelo base.
- Contexto: no se documenta la longitud efectiva; si se hereda del base, serían 8.192 tokens, pero no está confirmado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validación por parte de la comunidad.
- No hay información sobre sesgos específicos introducidos por la abliteration; es esperable que se amplifiquen sesgos del modelo base al reducirse los filtros.
- Para producción, se recomienda tratar este modelo como experimental y no como sustituto de una variante oficial con licencia clara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SudoRmRfMe/testgemma4
- Modelo base: https://huggingface.co/google/gemma-2-9b
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
