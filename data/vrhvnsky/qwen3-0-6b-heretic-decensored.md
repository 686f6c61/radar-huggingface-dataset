# vrhvnsky/Qwen3-0.6B-heretic-decensored

## Resumen

vrhvnsky/Qwen3-0.6B-heretic-decensored es un derivado del modelo denso Qwen3-0.6B al que se le ha aplicado una técnica de "abliteration" (eliminación de la dirección de rechazo en el espacio de activaciones) mediante la herramienta Heretic v2.0.0.dev0. El resultado es un modelo de 596.049.920 parámetros (0,44B sin contar embeddings) que reduce drásticamente las negativas del modelo original: pasa de 56 rechazos sobre 100 peticiones a 4 sobre 100, con una divergencia KL de 0,0480 respecto al original. Lo publica el usuario vrhvnsky bajo licencia Apache 2.0, con la particularidad de que el proceso es reproducible: el repositorio incluye un directorio `reproduce/` con la configuración exacta de pesos de abliteración por capa.

El interés de esta ficha no está en la calidad bruta del modelo (0,6B parámetros es un tamaño muy pequeño, orientado a ejecución local y a tareas ligeras), sino en dos factores. Primero, es un caso de estudio de modificación de alineamiento reproducible: los parámetros de abliteración están documentados capa por capa (`attn.o_proj` y `mlp.down_proj`), lo que permite auditar y replicar el proceso. Segundo, hereda la arquitectura Qwen3: 28 capas, atención GQA con 16 cabezas de consulta y 8 de clave/valor, y una ventana de contexto de 32.768 tokens.

Conviene señalar que el modelo tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha, y que las búsquedas web realizadas no han devuelto documentación externa relevante sobre él (los resultados obtenidos eran de un servicio de mensajería sin relación). Toda la información técnica procede de la model card y de las especificaciones del modelo base.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), atención GQA con 28 capas |
| Parámetros totales | 596.049.920 (≈0,6B); 0,44B sin embeddings |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | No se distribuye ninguna cuantización oficial en el repositorio; el repo contiene pesos en safetensors (2,4 GB, tamaño consistente con una precisión de 32 bits). El ecosistema del modelo base admite GGUF, AWQ y MLX mediante herramientas de terceros |
| Idiomas soportados | no disponible en la model card de este derivado (el modelo base Qwen3 declara soporte de más de 100 idiomas y dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Cabezas de atención | 16 para Q y 8 para KV (GQA) |
| Modelo base | Qwen/Qwen3-0.6B-Base (etiqueta del repositorio); la model card indica Qwen/Qwen3-0.6B |
| Método de modificación | Abliteration con Heretic v2.0.0.dev0, dirección por capa |
| Reproducibilidad | Sí, carpeta `reproduce/` con la configuración |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-11 |

## Arquitectura y entrenamiento

Este modelo no aporta un entrenamiento nuevo: es un ajuste quirúrgico sobre los pesos de Qwen3-0.6B. La arquitectura subyacente es la del Qwen3 denso pequeño: transformer causal con normalización RMSNorm, 28 capas, atención con consultas agrupadas (GQA) de 16 cabezas de consulta y 8 de clave/valor, y RoPE para la codificación posicional. El modelo base se entrenó en dos fases (preentrenamiento y postentrenamiento) e incorpora en origen la capacidad de alternar entre modo "thinking" y modo directo, además de soporte de function calling y de más de 100 idiomas.

La modificación aplicada es abliteration: se identifica una dirección en el espacio de activaciones asociada a la negativa a responder y se resta de las proyecciones de salida correspondientes, con pesos distintos por capa. Los parámetros documentados son `attn.o_proj.max_weight` = 1,50 en la posición 18,57 y `min_weight` = 1,47 a distancia 10,97; y `mlp.down_proj.max_weight` = 1,08 en la posición 16,80 y `min_weight` = 0,48 a distancia 15,92, con `direction_index` calculado por capa. El efecto medido es una caída de rechazos de 56/100 a 4/100 y una divergencia KL de 0,0480, es decir, una alteración relativamente contenida de la distribución de salida del modelo original.

El autor no documenta qué dataset se usó para calcular las direcciones de rechazo, ni el número de tokens o el procedimiento de evaluación más allá del recuento de rechazos y la KL. Tampoco se especifica si el derivado conserva la plantilla de chat y el modo de razonamiento del modelo base.

## Capacidades

- Generación de texto conversacional multilingüe, heredada del modelo base (la model card de este derivado no detalla idiomas concretos).
- Razonamiento, matemáticas y generación de código a un nivel propio de un modelo de 0,6B: adecuado para tareas simples y plantillas, no para razonamiento complejo.
- Modo de razonamiento explícito ("thinking") del Qwen3 original, con separación del contenido de pensamiento mediante el token de cierre `</think>`; su funcionamiento en este derivado no está confirmado por el autor.
- Soporte de tool calling y function calling en ambos modos, según las capacidades declaradas del modelo base.
- Capacidades de agente y razonamiento en varios pasos, limitadas por el tamaño del modelo y por la ventana de 32.768 tokens.
- Reducción drástica de negativas: 4 rechazos sobre 100 peticiones frente a 56 sobre 100 del original, según la evaluación del autor.
- Reproducibilidad del proceso de abliteration mediante la carpeta `reproduce/` del repositorio.
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Investigación sobre alineamiento y seguridad: permite comparar el comportamiento del mismo modelo antes y después de la abliteration, con una configuración reproducible y una métrica de divergencia KL (0,0480) que cuantifica cuánto se ha desviado el modelo del original.
- Generación de datos sintéticos para filtrado por contenido: al reducirse las negativas, el modelo puede producir texto sobre temáticas que el original rechazaría, útil como generador de casos límite en un pipeline de anotación supervisada por humanos.
- Prototipado de asistentes conversacionales locales: con 0,44B parámetros no-embedding y un contexto de 32.768 tokens, se puede ejecutar en un portátil o incluso en CPU para validar plantillas de prompt, plantillas de chat y flujos multi-turno antes de migrar a un modelo mayor.
- Clasificación y extracción de información en texto largo: la ventana de 32.768 tokens permite procesar documentos completos (informes, contratos, hilos de correo) para tareas de etiquetado o extracción de campos.
- Redacción asistida sin restricciones temáticas editoriales: por ejemplo, talleres de escritura que trabajan con violencia, terror o contenido para adultos y necesitan un modelo que no bloquee el tema por defecto.
- Evaluación de pipelines de inferencia: al ser un modelo diminuto y compatible con vLLM y SGLang, sirve para medir latencia, throughput y comportamiento de batching en una infraestructura concreta antes de desplegar modelos mayores.
- Enseñanza y demostraciones: permite ilustrar en un aula, con hardware de consumo, cómo se modifica un modelo, cómo se mide la divergencia KL y qué trade-offs aparecen al eliminar las salvaguardas.

## Benchmarks y rendimiento

El autor solo publica las métricas del proceso de abliteration, no resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Métrica | Este modelo | Modelo original (Qwen/Qwen3-0.6B) |
|---|---|---|
| Negativas (refusals) | 4/100 | 56/100 |
| Divergencia KL | 0,0480 | 0 por definición |

No se han publicado resultados de benchmarks de calidad (razonamiento, código, matemáticas o conocimiento) en la información disponible, ni para este derivado ni comparados con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en cuantización de 4 bits, en torno a 0,7-0,8 GB en 8 bits y alrededor de 1,3 GB en fp16 (solo pesos; hay que sumar la caché KV, que para 32.768 tokens y 8 cabezas KV es modesta pero no despreciable).
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria compartida o en CPU con llama.cpp/Ollama.
- GPU de datacenter (A100, H100) no son necesarias; se usarían únicamente para servir muchas réplicas o peticiones concurrentes.
- Opciones de despliegue: `transformers`, vLLM (se indica `--enable-reasoning --reasoning-parser deepseek_r1` para el base), SGLang (`--reasoning-parser qwen3`), TGI, llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers. Los pesos del repositorio están en safetensors, por lo que para llama.cpp/Ollama habría que convertirlos a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este derivado.
- Nota: la model card del base recomienda fijar `presence_penalty` a 1,5 para mitigar repeticiones infinitas.

## Comparativa con modelos similares

Datos de los modelos de referencia tomados de sus fichas públicas; los de este derivado, de la model card del autor.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vrhvnsky/Qwen3-0.6B-heretic-decensored | 596M (0,44B no-embedding) | 32.768 | Apache 2.0 | 4/100 negativas, KL 0,0480; proceso reproducible |
| Qwen/Qwen3-0.6B | 0,6B (0,44B no-embedding) | 32.768 | Apache 2.0 | Modelo original; 56/100 negativas; alterna modo thinking y no-thinking |
| Qwen/Qwen3-1.7B | 1,7B | 32.768 | Apache 2.0 | Misma familia, más capacidad de razonamiento a cambio de más VRAM |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 | Apache 2.0 | Generación anterior de la familia; sin modo thinking explícito |

No se dispone de comparativas de benchmarks entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y comportamiento declarado.

## Limitaciones y advertencias

- La abliteration elimina la tendencia a rechazar, no el conocimiento ni los sesgos aprendidos durante el entrenamiento. El modelo puede generar contenido dañino, ilegal o falso sin ninguna barrera, y su uso en producción exige capas de moderación externas.
- Riesgo de alucinación elevado por tamaño: con 0,6B parámetros, la precisión factual es intrínsecamente limitada, especialmente en dominios especializados.
- El autor no publica la metodología completa del cálculo de la dirección de rechazo (dataset, número de pares, criterio de éxito), por lo que la reproducibilidad es parcial pese al directorio `reproduce/`.
- Ambigüedad sobre el punto de partida: la etiqueta `base_model` apunta a Qwen/Qwen3-0.6B-Base, mientras que el texto de la model card dice que se parte de Qwen/Qwen3-0.6B. Son modelos distintos (el segundo está postentrenado para conversación). No se aclara cuál se usó realmente.
- No se confirma que el derivado conserve la plantilla de chat, la alternancia thinking/no-thinking ni el soporte de tool calling del base.
- La model card no declara idiomas soportados para este derivado concreto.
- Licencia Apache 2.0: permite uso comercial, pero el usuario sigue siendo responsable del contenido generado y de cumplir la normativa aplicable (por ejemplo, el Reglamento Europeo de IA para determinados usos).
- Divergencia KL de 0,0480: aunque baja, implica que el modelo no es idéntico al original en ninguna tarea; no se han medido los efectos sobre benchmarks de calidad.
- Cero descargas y cero interacciones en el repositorio: no hay evidencia comunitaria de funcionamiento en producción.
- No se han publicado mediciones de latencia, throughput ni consumo de memoria para este derivado.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/vrhvnsky/Qwen3-0.6B-heretic-decensored
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base (variante Base) en Hugging Face: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Configuración de reproducción: https://huggingface.co/vrhvnsky/Qwen3-0.6B-heretic-decensored/blob/main/reproduce/README.md
- Heretic (herramienta de abliteration): https://heretic-project.org
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Informe técnico de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los únicos enlaces externos utilizables son los presentes en la model card y en las etiquetas del repositorio.
