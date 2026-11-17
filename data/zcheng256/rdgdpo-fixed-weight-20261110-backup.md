# zcheng256/rdgdpo-fixed-weight-20261110-backup

## Resumen

RDGDPO fixed length weight checkpoints es una colección de puntos de control (checkpoints) resultantes de tres entrenamientos de aprendizaje por refuerzo controlados sobre el modelo base DeepSeek-R1-Distill-Qwen-1.5B. El autor, identificado como zcheng256, publica estos pesos como material de investigación para el estudio de recompensas de longitud en entrenamiento con RL aplicado a razonamiento matemático. El modelo no es un modelo conversacional nuevo, sino un artefacto experimental de fine-tuning con RL.

El interés técnico radica en que permite reproducir y auditar cómo distintas ponderaciones de una recompensa de longitud unilateral (2, 3 y 5, con peso de corrección fijado en 1) afectan al comportamiento del modelo base a lo largo de 100 pasos de entrenamiento, con checkpoints guardados cada diez pasos. El repositorio incluye tanto los pesos en formato Transformers para evaluación como el estado completo de FSDP, optimizador, RNG y scheduler para reanudar el entrenamiento original de ocho rangos.

El tamaño del repositorio (497,7 GB) se explica por la acumulación de checkpoints completos de entrenamiento y estados de reanudación, no por el tamaño del modelo, que es de 1.500 millones de parámetros. La licencia es MIT, con avisos upstream para Qwen2.5-Math-1.5B (Apache-2.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de DeepSeek-R1-Distill-Qwen-1.5B, basada en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT (con avisos upstream Apache-2.0 de Qwen2.5-Math-1.5B) |
| Formato de pesos | safetensors (Transformers); estado FSDP completo para reanudacion |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de DeepSeek-R1-Distill-Qwen-1.5B, que a su vez deriva de Qwen2.5-Math-1.5B. Sobre esa base se aplica un proceso de aprendizaje por refuerzo (RL) con una recompensa de longitud unilateral. Se documentan tres ejecuciones controladas con pesos de recompensa de longitud de 2, 3 y 5, manteniendo el peso de corrección en 1 en todos los casos. Los checkpoints se guardan cada diez pasos de entrenamiento hasta el paso 100.

El repositorio incluye los pesos en formato Hugging Face Transformers y el tokenizer dentro de cada directorio `w{weight}/checkpoints/global_step_{step}/actor/huggingface/`, junto con el estado FSDP, optimizador, RNG y scheduler, y el fichero `data.pt` para reanudar el entrenamiento con la configuración original de ocho rangos. Los manifiestos `weights` y `resume` en `backup-manifests/` permiten identificar checkpoints completos y verificar tamaños de fichero y hashes SHA-256. No se detalla en la información disponible la composición del dataset de RL ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento matemático, heredados del modelo base DeepSeek-R1-Distill-Qwen-1.5B.
- Razonamiento multi-paso orientado a problemas matemáticos (el modelo base está destilado de DeepSeek-R1 y ajustado sobre Qwen2.5-Math).
- Evaluación de checkpoints intermedios para estudiar el efecto de la recompensa de longitud en el comportamiento del modelo.
- Reproducción de entrenamiento con RL mediante los estados FSDP, optimizador, RNG y scheduler incluidos.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación sobre recompensas de longitud en RL: permite comparar tres configuraciones de peso (2, 3, 5) y observar cómo evoluciona la longitud de las respuestas a lo largo de 100 pasos, usando los checkpoints cada diez pasos.
- Reproducibilidad de experimentos: el estado FSDP, optimizador, RNG y scheduler permite reanudar exactamente el entrenamiento original de ocho rangos y validar resultados.
- Auditoría de artefactos de entrenamiento: los manifiestos con hashes SHA-256 y tamaños de fichero permiten verificar la integridad de los checkpoints antes de usarlos.
- Estudio de la relación entre corrección y longitud: al fijar el peso de corrección en 1 y variar solo el de longitud, se aísla el efecto de esta última en el rendimiento matemático.
- Fine-tuning posterior sobre razonamiento matemático: los pesos en formato Transformers pueden servir como punto de partida para experimentos propios con RL.
- Evaluación comparativa de checkpoints intermedios: permite analizar si el modelo mejora o degrada su precisión matemática en pasos tempranos frente a tardíos.
- Docencia y formación: útil como ejemplo práctico de pipeline de RL con FSDP y checkpoints intermedios en un modelo de 1,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP16 para los 1,5B parámetros, más overhead de activaciones y contexto; en cuantización de 8 bits rondaría 1,5-2 GB y en 4 bits alrededor de 1 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas para inferencia: cualquier GPU consumer con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento con FSDP de ocho rangos se requiere hardware de datacenter (A100, H100) por el estado completo y el tamaño del repositorio.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más para inferencia en FP16.
- Opciones de despliegue: Transformers (formato nativo publicado); vLLM, llama.cpp, Ollama y TGI son compatibles en principio con la arquitectura Qwen2, aunque no se documenta conversión a GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RDGDPO fixed length weight checkpoints | 1,5B | no disponible | sin benchmarks publicados | MIT | Hugging Face (repo de 497,7 GB) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible en esta ficha | benchmarks publicados por DeepSeek (no incluidos aquí) | MIT | Hugging Face |
| Qwen2.5-Math-1.5B | 1,5B | no disponible en esta ficha | benchmarks publicados por Qwen (no incluidos aquí) | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: los checkpoints son intermedios (cada diez pasos hasta 100) y no representan necesariamente el mejor estado.
- No se han publicado evaluaciones de calidad, seguridad ni benchmarks; el rendimiento real es desconocido.
- Riesgo de alucinación inherente al modelo base y potencialmente alterado por el entrenamiento con RL.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base.
- Idiomas soportados: no disponibles; el ajuste está orientado a matemáticas, lo que puede degradar el rendimiento en otros dominios.
- Restricciones de licencia: MIT permite uso comercial, pero deben conservarse los avisos upstream Apache-2.0 de Qwen2.5-Math-1.5B (véanse LICENSE y LICENSE-QWEN).
- El tamaño del repositorio (497,7 GB) dificulta la descarga y el almacenamiento; conviene usar los manifiestos para descargar solo los checkpoints necesarios.
- No se documenta la composición del dataset de RL ni el proceso de anotación de corrección, lo que limita la reproducibilidad científica completa.
- El estado de reanudación requiere la configuración original de ocho rangos, lo que condiciona la reproducibilidad en hardware distinto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zcheng256/rdgdpo-fixed-weight-20261110-backup
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Modelo upstream de Qwen: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
