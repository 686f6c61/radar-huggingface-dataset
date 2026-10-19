# xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity

## Resumen

Qwensploit 3.5 9B es un ajuste fino orientado a ciberseguridad del modelo comunitario `xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic`, un merge de la familia Qwen3.5-9B que combina destilaciones de razonamiento y código. Lo desarrolla el usuario de HuggingFace `xtools-at`, que mantiene una familia completa de ajustes con el mismo enfoque en tres tamaños (2B, 4B y 9B). El modelo se presenta como asistente para razonamiento de seguridad, análisis de vulnerabilidades, revisión de código seguro, conocimiento de red team y preguntas técnicas, partiendo de una base explícitamente "uncensored" y "heretic", es decir, sin los filtros de rechazo del modelo original.

El ajuste se ha realizado mediante supervisión (SFT) con LoRA sobre 7.000 ejemplos procedentes de cuatro conjuntos de datos, con 350 ejemplos de evaluación, una sola época y contexto de entrenamiento de 8.192 tokens. Los pesos publicados suman 9.409.813.744 parámetros (9,41 B) en un repositorio de 18,8 GB en safetensors, lo que corresponde a un modelo denso en precisión de 16 bits.

Su relevancia es acotada y muy específica: cubre un nicho (modelos pequeños, sin censura y especializados en seguridad ofensiva/defensiva) que suele quedar fuera de los lanzamientos de laboratorios grandes. Conviene subrayar que la model card no publica ningún benchmark independiente, que el modelo no tenía descargas registradas en el momento de redactar esta ficha y que la licencia Apache-2.0 declarada está condicionada por el propio autor a una revisión de las licencias upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5, ajustado con LoRA sobre un merge comunitario; no se documenta mezcla de expertos |
| Parámetros totales | 9.409.813.744 (9,41 B), dato real de safetensors |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 8.192 tokens en entrenamiento; la ventana nativa máxima del modelo base no se documenta en la información disponible |
| Tipos de cuantización | No se publican cuantizaciones en el repositorio; solo pesos en safetensors. Cualquier GGUF/AWQ/GPTQ sería una conversión de terceros no validada por el autor |
| Idiomas soportados | Inglés (`en`), único idioma declarado |
| Licencia | Apache-2.0, sujeta a revisión de compatibilidad con las licencias upstream |
| Formato de pesos | safetensors (compatible con `transformers`; entrenado con PEFT/LoRA) |
| Pipeline declarado | `image-text-to-text` |
| Tamaño del repositorio | 18,8 GB |
| Fecha de publicación | 19 de octubre de 2026 |
| Descargas / likes | 0 descargas y 1 like en el momento de redactar esta ficha |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.5 con 9,41 B de parámetros. El modelo de partida es `xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic`, un merge que a su vez combina ajustes de destilación de razonamiento y código derivados de "Claude Mythos, Fable y Opus" según la model card, sobre la familia `Qwen/Qwen3.5-9B`. Sobre ese merge se aplicó un ajuste supervisado con LoRA (r=16, alpha=32, dropout=0,02, todos los módulos objetivo), una sola época, optimizador AdamW de 8 bits, learning rate 2e-4 con scheduler lineal, weight decay 0,002 y batch efectivo de 4x8 en una NVIDIA A100 de 40 GB. El tamaño del repositorio (18,8 GB para 9,41 B de parámetros) indica que los pesos publicados están en precisión de 16 bits y que el adaptador se ha fusionado con el modelo base.

Los datos de entrenamiento son 7.000 ejemplos muestreados y barajados de cuatro conjuntos, con longitud máxima de entrada de 8.000 caracteres/tokens (la card no lo especifica con precisión) y 350 ejemplos reservados para evaluación. La mezcla es: CyberSec-Reasoning-Premium (2.305 ejemplos, 33 %), RedTeam-Premium (2.385, 34 %), Claude Mythos Distilled 25K — Clean (1.385, 20 %) y Qwen3.8-Max Distillation 50K — Clean (925, 13 %). Es decir, dos tercios de datos de seguridad (razonamiento y red team) y un tercio de datos sintéticos de razonamiento, código e instrucciones generales destilados de otros modelos. No se documenta ninguna fase de RLHF, DPO o preferencias, ni innovaciones de decodificación o atención; el valor añadido es exclusivamente el ajuste de dominio y la eliminación de rechazos heredada del modelo base.

Resultados de entrenamiento declarados:

| Métrica | Paso 40 | Paso 80 | Paso 120 | Paso 160 | Paso 219 (final) |
|---|---:|---:|---:|---:|---:|
| Pérdida de entrenamiento | 0,708 | 0,654 | 0,574 | 0,512 | 0,476 |
| Pérdida de evaluación | 0,676 | 0,569 | 0,522 | 0,496 | 0,481 |

## Capacidades

- Generación de texto técnico y respuesta a preguntas sobre ciberseguridad, con especial énfasis en razonamiento de seguridad y análisis de vulnerabilidades.
- Revisión de código orientada a seguridad: detección de patrones inseguros, análisis de snippets y propuestas de remediación.
- Conocimiento de red team y pentesting: reconocimiento, explotación conceptual, post-explotación y planificación de ejercicios en entornos autorizados.
- Resolución de retos CTF y asistencia educativa en seguridad, incluyendo explicación de técnicas y herramientas.
- Razonamiento multi-paso y modo de "pensamiento" heredado de la destilación de razonamiento del modelo base (la card no detalla el formato exacto de las trazas).
- Generación de código general, gracias al 13 % de datos de destilación de Qwen3.8-Max y al componente de código del merge base.
- Conversación multi-turno en inglés; no se declara soporte de otros idiomas ni se garantiza.
- El pipeline declarado es `image-text-to-text`, lo que sugiere una entrada multimodal heredada del modelo base, pero la model card no documenta ni valida ninguna capacidad de visión: trátese como no confirmada.
- No se documenta soporte explícito de tool calling, function calling ni de protocolos de agentes; al ser una capacidad del modelo base, su preservación tras el ajuste no está verificada.

## Casos de uso

- Revisión de código seguro en pipelines de CI/CD: el modelo puede analizar diffs y fragmentos de código buscando inyecciones, desbordamientos, gestión incorrecta de secretos o configuraciones inseguras, y proponer parches; su ventana de 8.192 tokens permite revisar ficheros completos o bloques de diff de tamaño medio.
- Modelado de amenazas sobre arquitecturas: a partir de una descripción textual de la arquitectura, generar superficies de ataque, activos, actores y contramedidas, aprovechando la mezcla de datos de razonamiento de seguridad del dataset principal.
- Triaje de vulnerabilidades y avisos CVE: resumir avisos, estimar impacto y priorizar remediación en un flujo de trabajo de gestión de parches, con revisión humana obligatoria de cada conclusión.
- Formación y concienciación: generar escenarios de phishing simulado, explicaciones de técnicas de ataque y material didáctico para cursos de seguridad, dado el tono sin rechazos del modelo.
- Ejercicios de red team autorizados: apoyo en la fase de planificación y en la redacción de informes de un pentest con alcance definido por contrato, usando el modelo como asistente offline en una instancia local.
- Retos CTF: asistencia en la resolución de pruebas de criptografía, reversing, web y forense, explicando el razonamiento paso a paso, lo que encaja con el contexto de 8.192 tokens para volcar enunciados y fragmentos de código.
- Respuesta a incidentes: análisis de trazas y logs textuales acotados (hasta ~8.000 tokens por consulta) para identificar indicadores de compromiso y esbozar una cronología del incidente.
- Asistente interno de documentación de seguridad: redacción de políticas, runbooks y checklists técnicas en inglés, con validación posterior por el equipo de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de entrenamiento y evaluación (0,476 y 0,481 respectivamente) y advierte explícitamente de que la pérdida es un diagnóstico de entrenamiento, no una medida de precisión en ciberseguridad. No hay datos de MMLU, HumanEval, GSM8K, CyberSecEval ni de ninguna otra evaluación independiente, ni comparaciones con modelos de la misma categoría.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, más caché KV; se necesitan al menos 24 GB para contextos moderados.
- VRAM en INT8: alrededor de 9,4 GB de pesos, más caché KV; cabe en GPUs de 16-24 GB con margen.
- VRAM en INT4: aproximadamente 4,7-5 GB de pesos; viable en GPUs de 8-12 GB, aunque la calidad en tareas de razonamiento de seguridad puede degradarse y no está evaluada por el autor.
- GPUs recomendadas: A100 40 GB (la empleada en el entrenamiento), H100, L40S o A10G/L4 de 24 GB para FP16; RTX 3090 y RTX 4090 (24 GB) para FP16 con contexto limitado; RTX 4060 Ti 16 GB o RTX 3060 12 GB para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 a 16 bits y en GPUs de 8-12 GB con cuantización de 4 bits, siempre que se genere la cuantización por cuenta propia.
- Opciones de despliegue: `transformers` de forma nativa; vLLM o TGI para servir los safetensors en producción; llama.cpp u Ollama solo tras convertir los pesos a GGUF, ya que el repositorio no incluye ninguna cuantización.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por petición para ningún backend.
- Nota operativa: el pipeline declarado es `image-text-to-text`; si se sirve con un backend que asuma multimodalidad, conviene verificar la configuración del procesador antes de desplegar en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit 3.5 9B | 9,41 B | 8.192 (entrenamiento) | Ciberseguridad y red team, sin censura | Apache-2.0 con revisión upstream | Pesos safetensors en HF |
| Qwensploit 3.5 4B | No disponible en la información | No disponible | Mismo enfoque, menor tamaño | No disponible | Referenciado en la model card |
| Qwensploit 3.5 2B | No disponible en la información | No disponible | Mismo enfoque, menor tamaño | No disponible | Referenciado en la model card |
| Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic (base) | 9 B (según nombre) | No disponible | Merge generalista sin censura, sin especialización en seguridad | No disponible en la información | Pesos en HF |
| Qwen3.5-9B (familia upstream) | 9 B (según nombre) | No disponible | Modelo generalista original | No disponible en la información | Pesos en HF |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos de terceros equivalentes (ajustes de ciberseguridad de ~8-10 B), por lo que la comparación cuantitativa de rendimiento queda como no disponible. La comparación más fiable es interna a la familia: el 9B ofrece la mayor capacidad a costa de ~18,8 GB en 16 bits, frente a las variantes 2B y 4B, cuyas especificaciones no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Alucinación: puede generar explicaciones incorrectas, comandos erróneos o recomendaciones de seguridad obsoletas; el autor recomienda validar todo el código y las recomendaciones generadas.
- Datos sintéticos: el 33 % del entrenamiento proviene de destilaciones (Claude Mythos y Qwen3.8-Max), por lo que puede arrastrar errores de los modelos profesores, incluidos sesgos de estilo y de contenido.
- Sin validación independiente: no hay benchmarks publicados de precisión en tareas reales de seguridad; el rendimiento en producción no está establecido.
- Riesgo de doble uso: es un modelo "uncensored"/"heretic", sin filtros de rechazo, lo que lo hace inadecuado para exposición directa al público. Su uso ofensivo debe limitarse a sistemas con autorización explícita por escrito.
- Sesgos: no se documenta ninguna evaluación de sesgos; el entrenamiento es exclusivamente en inglés y procede de datasets comunitarios sin auditoría conocida.
- Idioma: solo se declara inglés. El rendimiento en castellano no está evaluado y probablemente sea inferior.
- Contexto: la ventana de entrenamiento es de 8.192 tokens; no se documenta la ventana nativa del modelo base ni si el ajuste preserva contextos mayores.
- Licencia: Apache-2.0 declarada, pero la propia model card advierte de que las licencias upstream deben revisarse antes de redistribuir o usar comercialmente, en particular por las restricciones heredadas del dataset de destilación de Qwen. Un uso comercial sin revisión jurídica previa es arriesgado.
- Empaquetado: no hay cuantizaciones oficiales ni GGUF, lo que obliga a trabajo adicional de conversión y validación si se quiere desplegar en hardware de consumo.
- Madurez: 0 descargas y 1 like en el momento de la ficha; no hay evidencia de uso comunitario ni de mantenimiento a largo plazo.
- Capacidad multimodal no confirmada pese al pipeline declarado; no debe asumirse soporte de imágenes sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Merge intermedio Claude 3xMerge: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge
- Familia upstream Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 2B: https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity
- Variante 4B: https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity
- Dataset CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset RedTeam-Premium: https://huggingface.co/datasets/saidutta69/RedTeam-Premium
- Dataset Claude Mythos Distilled 25K — Clean: https://huggingface.co/datasets/saidutta69/claude-mythos-distilled-25k-clean
- Dataset Qwen3.8-Max Distillation 50K — Clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Fuente de segundo nivel (razonamiento de ciberseguridad): https://huggingface.co/datasets/dpevzner/Cybersecurity_Reasoning_Dataset
- Fuente de segundo nivel (red team ofensivo): https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Fuente de segundo nivel (destilación Claude Mythos): https://huggingface.co/datasets/WithinUsAI/claude_mythos_distilled_25k
- Fuente de segundo nivel (destilación Qwen3.8-Max): https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
- Referencia adicional citada en la model card con enlace truncado: `empero-ai/Qwythos-9B-v2` (no se dispone de la URL completa en la información proporcionada)
- Nota sobre la búsqueda web: los resultados devueltos corresponden a la marca de máquinas de grabado y corte láser xTool y no guardan relación con este modelo; no se han incorporado como fuentes.
