# varadsrivastava/lm-playschool-qwen3.5-2b-sft

## Resumen

`lm-playschool-qwen3.5-2b-sft` es un fine-tuning supervisado (SFT) del modelo Qwen/Qwen3.5-2B, desarrollado por Varad Srivastava en el marco del desafío LM Playschool 2026 (equipo DAIR). El objetivo es mejorar el cumplimiento de protocolo en juegos de diálogo, un entorno de evaluación conversacional estructurado. Con 1.881.825.088 parámetros (~1,88 mil millones), el modelo se entrenó mediante LoRA sobre transcripciones de juego filtradas por éxito, mezcladas con datos de instrucción general para evitar el olvido catastrófico.

El resultado principal es un incremento notable en la métrica `clemscore` del entorno playpen, pasando de 13,63 (modelo base) a 55,61, casi enteramente gracias a la eliminación de episodios abortados por incumplimiento de protocolo. Este checkpoint forma parte de una familia de cinco regímenes de post-entrenamiento (SFT, DPO, GRPO) que exploran cómo un modelo pequeño puede adquirir competencia en diálogo guiado por reglas.

La relevancia actual del modelo reside en que demuestra empíricamente cómo el SFT con datos de alta calidad y filtrado por éxito puede superar a métodos más complejos en tareas de diálogo estructurado, y sirve como referencia reproducible para investigaciones sobre post-entrenamiento de modelos de lenguaje pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura de Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16/fp16 según repo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-2B, un transformer decoder-only de ~1,88 mil millones de parámetros. No se especifican detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la información disponible.

El entrenamiento consistió en un fine-tuning supervisado con LoRA (r=32, alpha=64) sobre el modelo base. Los datos de entrenamiento provienen del corpus `playpen-data`, con aproximadamente 20.200 trayectorias exitosas por jugador, filtradas por éxito, y una mezcla del 12% de datos de instrucción general (SmolTalk) para mitigar el olvido catastrófico. En total se usaron 22.626 conversaciones, con pérdida calculada únicamente sobre los tokens de asistente. Se entrenaron dos épocas con tasa de aprendizaje 1e-4 y programación coseno, tamaño de lote efectivo 16 y precisión bf16. El adaptador LoRA se fusionó posteriormente en los pesos del modelo.

La innovación técnica principal es el filtrado por éxito de las trayectorias de juego, que permite al modelo aprender a seguir el protocolo del juego (por ejemplo, en el escenario `privateshared`) sin necesidad de señales de recompensa explícitas. El efecto medido indica que la mejora en `clemscore` se debe casi por completo a la reducción de episodios abortados, no a una mejora en la calidad de los movimientos individuales.

## Capacidades

- Generación de texto conversacional en inglés, con manejo de diálogos multi-turno.
- Cumplimiento de protocolos estructurados en juegos de diálogo (p. ej., escenario `privateshared`).
- Seguimiento de instrucciones básicas heredado del modelo base Qwen3.5-2B.
- Capacidad de mantener coherencia conversacional en entornos de evaluación como `clembench`.
- No se documentan capacidades de tool calling, visión, audio ni razonamiento multimodal.
- El modelo está especializado en tareas de diálogo guiado por reglas; su rendimiento en tareas generales no ha sido evaluado públicamente.

## Casos de uso

- Investigación en post-entrenamiento de modelos pequeños: sirve como punto de partida para comparar SFT frente a DPO o GRPO en entornos de diálogo estructurado, tal como se hace en la familia de checkpoints del equipo DAIR.
- Desarrollo de agentes para juegos de mesa conversacionales: el modelo puede gestionar turnos, seguir reglas y mantener el estado del juego gracias a su entrenamiento en transcripciones de éxito.
- Simulación de usuarios en entornos de evaluación de diálogo: su capacidad para seguir protocolos lo hace útil como interlocutor sintético en pruebas de sistemas conversacionales.
- Prototipado de asistentes conversacionales con presupuesto limitado: al ser un modelo de ~1,88B, puede desplegarse en hardware modesto para pruebas de concepto.
- Fine-tuning adicional para tareas específicas de diálogo estructurado: su base SFT proporciona un buen punto de partida para dominios con reglas similares (atención al cliente con guiones, entrevistas guiadas, etc.).
- Benchmarking de cumplimiento de instrucciones en entornos multi-turno: permite medir la robustez de protocolos de comunicación en sistemas multi-agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento provienen del entorno `playpen` (validación), medidos con `clemscore` y `statscore` en un entorno fijo con correcciones upstream (guard de división por cero en el Game Master de `privateshared` y recurso NLTK `punkt_tab`).

| Checkpoint | clemscore | statscore |
|---|---|---|
| Qwen3.5-2B (base) | 13,63 | 44,22 |
| R1 SFT (este modelo) | 55,61 | 43,87 |
| R2 DPO | 67,39 | 44,72 |
| R3 SFT iter3 | 61,06 | 44,01 |
| R4 DPO iter4 | 67,64 | 44,31 |
| R5 GRPO (control) | 62,43 | 44,19 |
| R5 GRPO + RND | 67,44 | 43,53 |

Estos resultados indican que el SFT mejora drásticamente el cumplimiento de protocolo (clemscore) sin degradar significativamente la calidad estadística de los movimientos (statscore). Los modelos con DPO y GRPO+RND alcanzan valores más altos, pero el SFT es el más simple de los métodos evaluados.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4 GB en bf16/fp16 (pesos de 3,76 GB más overhead de activaciones). Con cuantización de 4 bits, ~1 GB.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), o GPUs con al menos 6 GB de VRAM para inferencia sin cuantizar.
- Cabe en GPUs de consumo (gama media y alta) y también en hardware de gama baja si se cuantiza.
- Opciones de despliegue: transformers (HuggingFace), vLLM (si se convierte a formato compatible), llama.cpp/Ollama (si se genera GGUF), o TGI.
- Latencia y throughput estimados: no disponibles en la documentación del modelo. Para un modelo de ~1,88B, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero estos valores dependen del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de comparativas directas en los mismos benchmarks con otros modelos de tamaño similar. La siguiente tabla compara características generales con alternativas de la misma gama de parámetros:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| lm-playschool-qwen3.5-2b-sft | ~1,88B | No disponible | Apache 2.0 | Especializado en diálogo estructurado |
| Qwen2.5-1.5B | 1,54B | 32K (típico) | Apache 2.0 | Modelo general, sin fine-tuning específico |
| Gemma-2-2B | 2,6B | 8K | Gemma license | Modelo general de Google |
| Phi-3-mini | 3,8B | 128K | MIT | Modelo general de Microsoft |

No se han publicado resultados comparativos de `clemscore` para estos modelos en el entorno playpen, por lo que no es posible establecer una comparación de rendimiento directa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; su rendimiento en otros idiomas no está garantizado.
- Su especialización en juegos de diálogo puede degradar el rendimiento en tareas generales de lenguaje no relacionadas con protocolos estructurados.
- Riesgo de alucinación inherente a los modelos de su tamaño, especialmente en contextos largos o ambiguos.
- Los datos de entrenamiento provienen de transcripciones filtradas por éxito, lo que puede introducir sesgos hacia estilos de interacción particulares.
- No se ha publicado el paper asociado (el enlace está pendiente), por lo que la reproducibilidad completa depende de la documentación disponible en la model card.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las restricciones del modelo base Qwen3.5-2B y del corpus `playpen-data`.
- Las métricas reportadas se obtuvieron en un entorno fijo con correcciones específicas; los resultados pueden variar en otros entornos o versiones de dependencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/varadsrivastava/lm-playschool-qwen3.5-2b-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper (pendiente de enlace): *Raising a Small Language Model: From Imitation to Curiosity in Dialogue Games* (LM Playschool Challenge 2026)
- Checkpoints relacionados de la familia DAIR (no se proporcionan URLs directas): `lm-playschool-qwen3.5-2b-sft-dpo`, `lm-playschool-qwen3.5-2b-iter3`, `lm-playschool-qwen3.5-2b-iter4`, `lm-playschool-qwen3.5-2b-grpo-base-s42`, `lm-playschool-qwen3.5-2b-grpo-rnd-s42`
