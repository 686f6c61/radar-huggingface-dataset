# yinita/ps4mas-sft-4b-claude-x5-single-ep3

## Resumen

El modelo `ps4mas-sft-4b-claude-x5-single-ep3` es un fine-tuning completo (full fine-tuning, sin LoRA) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario yinita. Su objetivo es reproducir a escala reducida (4B parámetros) los resultados de un modelo de 9B entrenado con destilación de respuestas de Claude (dataset `claude_distill_x5`), dentro del proyecto PS4MAS. El autor reporta que el modelo 9B original alcanzó una puntuación de 2.970 / 2.036 / 3.180 / 3.117 / 3.547 en el benchmark interno "Terra final_test", y este 4B pretende acercarse a ese rendimiento con un coste computacional menor.

La relevancia de este modelo radica en que demuestra la viabilidad de comprimir el conocimiento de un modelo más grande mediante destilación y fine-tuning completo, manteniendo una arquitectura compacta de 4.84B parámetros. Está pensado para tareas de generación de texto conversacional, con una licencia Apache 2.0 que permite uso comercial. La información disponible es limitada: no se especifican la longitud de contexto, los idiomas soportados ni los detalles de la arquitectura interna más allá de su base Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen/Qwen3.5-4B (detalles internos no disponibles) |
| Parametros totales | 4.841.450.496 (4,84B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencia de entrenamiento: 4096) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-4B, de la que no se han proporcionado detalles específicos en la documentación disponible. El entrenamiento consiste en un fine-tuning completo (full sequence SFT, sin LoRA) sobre un dataset de destilación de Claude, concretamente `data/sft_splits/claude_distill_x5/topology_splits/sft_claude_teacher_single.jsonl`, que contiene 500 "hops" (posiblemente pasos de razonamiento o conversaciones). Se utilizaron 3 épocas con una tasa de aprendizaje de 2e-5, un batch por dispositivo de 1 con acumulación de gradientes de 2, y 8 GPUs con ZeRO-2. La longitud de secuencia se fijó en 4096 tokens. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto conversacional: el modelo está entrenado para mantener diálogos, como se indica en la etiqueta "conversational".
- Fine-tuning específico para el dominio PS4MAS: el entrenamiento con datos destilados de Claude sugiere que el modelo ha sido optimizado para tareas de razonamiento o seguimiento de instrucciones dentro de ese proyecto.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso explícito, visión, audio ni otras capacidades especiales. La información disponible solo confirma generación de texto.

## Casos de uso

- Asistentes conversacionales ligeros: gracias a su tamaño de 4,84B parámetros, puede desplegarse en entornos con recursos limitados para chatbots de atención al cliente o asistentes virtuales, siempre que el dominio se ajuste al fine-tuning realizado.
- Investigación en destilación de modelos: sirve como caso de estudio para comparar el rendimiento de un modelo 4B frente a su versión 9B original, útil para validar técnicas de compresión y destilación.
- Prototipado rápido: al ser un modelo pequeño y con licencia Apache 2.0, permite experimentar con generación de texto en proyectos personales o académicos sin restricciones de uso.
- Generación de texto en español u otros idiomas: aunque no se especifican los idiomas, al estar basado en Qwen3.5-4B es probable que herede capacidades multilingües, aunque no hay confirmación.
- Fine-tuning posterior: al ser un checkpoint de SFT, puede servir como punto de partida para nuevos fine-tunings con datasets específicos, aprovechando el conocimiento ya adquirido.
- Evaluación de benchmarks internos: el autor lo ha evaluado en el benchmark "Terra", por lo que puede utilizarse para reproducir o comparar resultados en ese tipo de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo de 4B en la información disponible. El autor menciona únicamente los resultados del modelo 9B original (que este 4B intenta reproducir) en el benchmark interno "Terra final_test": 2.970 / 2.036 / 3.180 / 3.117 / 3.547. No se proporciona contexto sobre qué mide "Terra" ni cómo se interpretan esos valores. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: basándose en el tamaño de 4,84B parámetros, en precisión FP16 se necesitan aproximadamente 9,7 GB de VRAM (coincide con el tamaño del repositorio). Con cuantización de 8 bits se reduciría a unos 5 GB, y con 4 bits a unos 2,5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para FP16, una GPU con 12 GB o más (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 3090, RTX 4090). Con cuantización, podría ejecutarse en GPUs de 8 GB o incluso menos.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de consumo actuales, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede usarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI o directamente con la librería transformers. No se han proporcionado configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (4B de Qwen3.5). No se han publicado datos de rendimiento, contexto ni benchmarks de este modelo frente a alternativas como Qwen3-4B, Qwen2.5-4B u otros modelos de tamaño similar. La única referencia es el modelo 9B original del mismo autor, pero no se trata de un modelo comparable en tamaño.

## Limitaciones y advertencias

- No se ha documentado el rendimiento en tareas generales fuera del dominio de entrenamiento (PS4MAS), por lo que su uso en otros ámbitos puede ser impredecible.
- Al ser un fine-tuning de un modelo base, hereda los sesgos y limitaciones de Qwen3.5-4B, aunque no se han detallado.
- No hay información sobre riesgos de alucinación, sesgos específicos o comportamientos no deseados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo base Qwen3.5-4B, que no se han especificado.
- El modelo no ha sido evaluado públicamente con benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), por lo que su rendimiento general es desconocido.
- La documentación es escasa: no se especifican la longitud de contexto máxima, los idiomas soportados ni los detalles de la arquitectura interna, lo que dificulta su integración en producción sin pruebas adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yinita/ps4mas-sft-4b-claude-x5-single-ep3
- Modelo 9B original (referencia): https://huggingface.co/yinita/ps4mas-sft-x5-single-ep3
- Modelo base: Qwen/Qwen3.5-4B (enlace no disponible en la información proporcionada)
