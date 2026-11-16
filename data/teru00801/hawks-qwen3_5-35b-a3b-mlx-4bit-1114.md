# teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-1114

## Resumen

El modelo `teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-1114` es un ajuste fino (fine-tune) comunitario publicado por el usuario teru00801 en Hugging Face, derivado de la familia Qwen3.5 en su variante MoE de 35B con aproximadamente 3B de parámetros activos (denominación "a3b"). Se distribuye en formato MLX cuantizado a 4 bits, lo que lo orienta específicamente a inferencia en hardware Apple Silicon (macOS con chips M-series) mediante la librería `mlx-lm`.

El modelo está pensado para generación de texto y conversación en inglés, con soporte de chat template. Su relevancia práctica radica en que permite ejecutar un modelo MoE de ~34,7 mil millones de parámetros totales con un consumo de memoria contenido gracias a la cuantización 4-bit y a la activación dispersa, algo que en formato denso sería inviable en un equipo de sobremesa con memoria unificada.

La información publicada por el autor es mínima: la model card solo incluye instrucciones de uso con `mlx-lm`, sin detalles sobre datos de entrenamiento, licencia explícita ni resultados de evaluación. La ficha siguiente refleja únicamente lo verificable a partir de los metadatos y del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), variante Qwen3.5 |
| Parametros totales | 34.660.608.768 (~34,7B) |
| Parametros activos | ~3B (según nomenclatura "a3b"; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); no se documentan otras variantes en el repo |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), repositorio de 19,5 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer con mezcla de expertos (MoE), según el tag `qwen3_5_moe` y la convención de nombres "35b-a3b" (35B totales, ~3B activos). Esto implica que en cada paso de inferencia solo se activa una fracción de los parámetros, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. El modelo se distribuye ya cuantizado a 4 bits en formato MLX, pensado para aprovechar la memoria unificada de los chips Apple.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste supervisado adicional respecto al modelo base Qwen3.5. Tampoco se documentan innovaciones técnicas específicas del fine-tune. El sufijo "1114" en el nombre podría indicar una fecha o versión interna, pero no se confirma en la model card.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Soporte de chat template (la model card comprueba `tokenizer.chat_template` antes de aplicarlo).
- Razonamiento y respuesta en inglés; no se declaran otros idiomas.
- Al ser un derivado de Qwen3.5 MoE, se espera herencia de las capacidades del modelo base (código, matemáticas, instrucciones), aunque no se documentan explícitamente en el repo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente o multi-step reasoning: no disponible (no documentado).
- Modo thinking, visión o audio: no disponible (no documentado).

## Casos de uso

- Inferencia local en Mac con Apple Silicon: cargar el modelo con `mlx-lm` en un equipo con memoria unificada suficiente (el repo ocupa 19,5 GB en 4-bit), aprovechando la cuantización para reducir el footprint.
- Prototipado de asistentes conversacionales en inglés: usar el chat template para construir diálogos multi-turno en scripts de prueba o notebooks.
- Experimentación con arquitecturas MoE: comparar el comportamiento de un MoE de ~3B activos frente a modelos densos de tamaño similar en tareas de generación.
- Evaluación de fine-tunes comunitarios: servir como punto de partida para estudiar cómo un ajuste sobre Qwen3.5 altera el comportamiento respecto al base.
- Generación de texto en pipelines offline: integrar `mlx_lm.generate` en scripts locales para tareas de redacción o resumen en inglés sin depender de la nube.
- Investigación sobre cuantización 4-bit en MLX: medir degradación de calidad y throughput frente a versiones de mayor precisión del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 19,5 GB en 4-bit; se necesita al menos esa cantidad de memoria unificada más overhead para el contexto y el runtime de MLX.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 en configuraciones con memoria unificada alta, típicamente 32 GB o más para margen de contexto).
- GPU NVIDIA: el formato MLX no es directamente compatible con CUDA; requeriría conversión a otro formato (no documentada en el repo).
- Cabe en GPU consumer: no en el formato distribuido (MLX); en NVIDIA consumer solo tras conversión y con cuantización adecuada, no disponible en este repo.
- Opciones de despliegue: `mlx-lm` (documentado). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están soportadas por el formato actual sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-1114 | ~34,7B | ~3B | no disponible | MLX 4-bit | no disponible |
| Qwen3.5 MoE base (35B-A3B) | ~35B | ~3B | no disponible en esta ficha | safetensors | según Qwen (no verificada aquí) |
| Fine-tunes comunitarios MLX de Qwen | variable | variable | no disponible | MLX | variable |

No se dispone de datos de rendimiento comparativos publicados para este modelo concreto.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base Qwen3.5.
- Model card mínima: no hay información sobre datos de entrenamiento, evaluación ni sesgos, lo que dificulta validar su calidad en producción.
- Solo inglés declarado: no se garantiza comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos; sin benchmarks publicados no hay evidencia de mitigación.
- Formato MLX exclusivo: no es portable directamente a CUDA/ROCm sin conversión, lo que limita su uso fuera de Apple Silicon.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratarlo como experimental.
- Longitud de contexto desconocida: no planificar cargas de contexto largo sin verificar el `config.json` del repo.
- El sufijo "1114" y el prefijo "hawks" no están explicados; podrían indicar un fine-tune específico no documentado.

## Enlaces

- Hugging Face: https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-1114
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentación MLX: https://ml-explore.github.io/mlx/
- Familia Qwen (referencia del modelo base): https://huggingface.co/Qwen
