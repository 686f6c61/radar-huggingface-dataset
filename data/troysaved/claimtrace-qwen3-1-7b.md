# troysaved/claimtrace-qwen3-1.7b

## Resumen

El modelo `troysaved/claimtrace-qwen3-1.7b` es un ajuste fino mediante adaptadores LoRA del modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario troysaved. Su objetivo es entrenar al modelo para mantener un "registro de procedencia de afirmaciones" (claim-provenance ledger) en contextos de tutoría conversacional: solo debe clasificar como conocimiento demostrado (KNOWN) aquello que el aprendiz haya demostrado con su propio trabajo durante la conversación, y nunca los autoinformes del usuario (CLAIMED), por muy plausibles que parezcan.

El modelo parte de la arquitectura densa Qwen3-1.7B, con 1.720 millones de parámetros y una ventana de contexto de 24.000 tokens. El ajuste se realizó mediante adaptadores LoRA en formato MLX, con 500 pasos de optimización y una pérdida final de validación de 0,91. Está pensado para su uso en sistemas de tutoría inteligente donde se necesita distinguir de forma fiable entre lo que el alumno afirma saber y lo que realmente ha demostrado saber.

La relevancia actual de este modelo radica en la creciente necesidad de sistemas educativos y de tutoría basados en IA que eviten el problema de la "confianza ciega" en las respuestas del usuario, un aspecto crítico para el seguimiento fiable del progreso de aprendizaje en entornos conversacionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B base) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 24.000 tokens (modelo base) |
| Tipos de cuantizacion | no disponible (repo con safetensors en FP16; adaptadores LoRA en formato MLX) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3, que soporta multiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); adaptadores en formato mlx_lm |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-1.7B, un transformer denso con atención por ventana deslizante y atención global alternada, entrenado originalmente con 5,5 billones de tokens por el equipo de Alibaba Cloud. El ajuste fino de claimtrace se realizó mediante adaptadores LoRA de bajo rango, entrenados con un script propio (`train.py`), ejecución `n270`, 500 pasos de optimización con un batch efectivo de 4 y una pérdida de validación final de 0,91. Los adaptadores se guardaron en formato MLX y se fusionaron con el modelo base para producir los pesos finales.

No se han publicado detalles sobre el dataset de entrenamiento, aunque la evaluación se realiza con un conjunto de escenarios metacognitivos (`metacog_scenarios.jsonl`). La especificación de comportamiento (BEHAVIOR_SPEC.md) define una regla estricta: un elemento solo puede registrarse como KNOWN si el alumno lo demuestra en su propio trabajo durante la conversación; cualquier autoinforme sobre antecedentes, experiencia o capacidad debe marcarse como CLAIMED y nunca como KNOWN, independientemente de cuántas veces se repita.

## Capacidades

- Mantenimiento de un registro de procedencia de afirmaciones (KNOWN vs. CLAIMED) en conversaciones de tutoría.
- Distinción fiable entre conocimiento demostrado y autopercibido del usuario.
- Generación de texto conversacional heredada del modelo base Qwen3-1.7B, incluyendo razonamiento básico, comprensión lectora y respuesta a instrucciones.
- Soporte de conversación multi-turno con contexto de hasta 24.000 tokens.
- Capacidad de integrarse en pipelines de transformers y MLX (Apple Silicon).
- Capacidades multilingües limitadas heredadas del modelo base (no documentadas específicamente en el repo).
- No se documenta soporte de tool calling, function calling ni modos de pensamiento explícitos en el ajuste fino.

## Casos de uso

- **Tutoría académica con seguimiento de progreso**: el modelo puede registrar qué conceptos ha demostrado dominar el estudiante en ejercicios reales, evitando que un alumno que dice "ya sé calcular derivadas" pero no lo demuestra sea marcado como competente.
- **Sistemas de evaluación formativa conversacional**: en un chatbot que evalúa al alumno mediante preguntas y problemas, el modelo distingue entre respuestas correctas (KNOWN) y autoevaluaciones del estudiante (CLAIMED), permitiendo un informe de progreso preciso.
- **Entornos de aprendizaje autodirigido**: el modelo actúa como asistente que mantiene un inventario honesto de lo que el usuario ha demostrado saber, evitando que el alumno se autoengañe sobre su nivel real.
- **Plataformas de aprendizaje de idiomas**: para registrar qué vocabulario o estructuras gramaticales el usuario ha producido correctamente en ejercicios, no solo las que afirma conocer.
- **Herramientas de onboarding y capacitación corporativa**: el modelo puede verificar que un empleado ha demostrado ciertas habilidades en la conversación antes de marcarlas como adquiridas, útil para auditorías de formación.
- **Investigación en metacognición de LLMs**: el modelo sirve como banco de pruebas para estudiar cómo los modelos manejan la distinción entre conocimiento demostrado y afirmado, útil para el diseño de sistemas de IA más honestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de entrenamiento reportada es la pérdida de validación final de 0,91 sobre el conjunto de evaluación `metacog_scenarios.jsonl`. No se comparan resultados con el modelo base ni con otros modelos afinados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 3,5 GB en FP16 (1,7B parámetros × 2 bytes), 1,8 GB en cuantización int8 y 0,9 GB en 4 bits.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o Apple Silicon con 8 GB unificados. Para inferencia con contexto largo (24K tokens), se recomienda al menos 8 GB de VRAM.
- **Compatibilidad con consumer GPU**: sí, el modelo cabe en GPUs de consumo habituales incluso sin cuantización.
- **Opciones de despliegue**: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama, Transformers con `transformers` y MLX para Apple Silicon.
- **Latencia y throughput**: no se disponen de datos públicos. En una RTX 3090, un modelo de 1,7B en FP16 puede alcanzar aproximadamente 40-60 tokens/s con vLLM; en CPU con llama.cpp, ~10-15 tokens/s con cuantización 4-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Diferencias clave |
|---|---|---|---|---|
| **claimtrace-qwen3-1.7b** | 1,72 B | 24 K | Apache-2.0 | Ajuste LoRA específico para clasificar procedencia de afirmaciones |
| Qwen/Qwen3-1.7B | 1,72 B | 24 K | Apache-2.0 | Modelo base sin el comportamiento de ledger de procedencia |
| Qwen/Qwen3-0.6B | 0,6 B | 24 K | Apache-2.0 | Más ligero, menor capacidad de razonamiento |
| Llama-3.2-1B | 1,23 B | 128 K | Llama 3.2 | Contexto más largo pero sin ajuste específico de procedencia |

La comparación directa con modelos similares es limitada porque no existe un modelo público equivalente con la misma funcionalidad de ledger de procedencia. La diferencia principal con el base Qwen3-1.7B es el comportamiento específico entrenado, no el rendimiento general.

## Limitaciones y advertencias

- **Riesgo de alucinación**: como cualquier modelo de 1,7B, puede inventar información o clasificar incorrectamente afirmaciones; la regla de comportamiento no es una garantía de cumplimiento perfecto.
- **Datos de entrenamiento no públicos**: no se documenta el dataset utilizado, por lo que no se pueden evaluar sesgos de datos ni cobertura de dominios.
- **Evaluación limitada**: solo se reporta una pérdida de validación, sin benchmarks estándar ni pruebas de robustez en escenarios adversarios.
- **Dependencia del modelo base**: las limitaciones del Qwen3-1.7B (menor capacidad de razonamiento complejo que modelos más grandes, posibles sesgos multilingües) se heredan.
- **Uso en producción**: la licencia Apache-2.0 permite uso comercial, pero el modelo no está validado en entornos de producción; se recomienda testear en el dominio específico antes de desplegarlo.
- **Idiomas**: los idiomas soportados no están documentados; aunque Qwen3 soporta múltiples idiomas, el ajuste fino puede haber degradado el rendimiento en idiomas distintos del inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/troysaved/claimtrace-qwen3-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Modelo relacionado (smoke test): https://huggingface.co/troysaved/claimtrace-smoke
