# Vikhram-S/NariRaksha-3B

## Resumen

NariRaksha-3B es un ajuste fino mediante QLoRA del modelo Qwen/Qwen2.5-3B-Instruct sobre el dataset NariRaksha-100K, un conjunto de aproximadamente 100 000 escenarios de seguridad de mujeres en India. Lo desarrolla Vikhram-S como artefacto de investigación abierto, con el objetivo de generar evaluaciones estructuradas de seguridad a partir de descripciones en texto libre. Estas evaluaciones incluyen tipo de riesgo, severidad, razonamiento, acción recomendada y contexto legal indio (BNS, IT Act y PWDVA).

El modelo se presenta explícitamente como un artefacto de investigación en fase temprana, no como un sistema validado ni listo para producción. La arquitectura es la del modelo base, un transformer decoder-only de 3 000 millones de parámetros, con adaptadores LoRA de bajo rango. El repositorio contiene únicamente el adaptador (unos 120 MB), no los pesos completos del modelo base. La longitud de contexto no se especifica en la información proporcionada, aunque el modelo base Qwen2.5-3B-Instruct tiene 32 768 tokens según documentación oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptadores LoRA |
| Parametros totales | No disponible; modelo base de 3B (Qwen2.5-3B-Instruct) + adaptador LoRA de tamaño no especificado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Qwen2.5-3B-Instruct tiene 32 768 tokens según documentación oficial |
| Tipos de cuantizacion | Entrenado con QLoRA 4-bit (NF4); el adaptador se distribuye sin cuantizar |
| Idiomas soportados | inglés, hindi, tamil |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) + adapter_config.json; el modelo base no está incluido |

## Arquitectura y entrenamiento

NariRaksha-3B no es un modelo independiente, sino un adaptador LoRA sobre Qwen2.5-3B-Instruct. El entrenamiento se realizó con QLoRA en cuantización de 4 bits (NF4), con rango LoRA r=16 y alpha α=32, usando el framework Unsloth. El dataset NariRaksha-100K se utilizó completo, en un único split, sin conjunto de validación ni de prueba. El entrenamiento duró 100 pasos en total, con una pérdida de entrenamiento registrada en tres puntos: 2.3122 en el paso 25, 0.2770 en el paso 50 y 0.0698 en el paso 75.

El autor advierte que la caída pronunciada de la pérdida en un modelo de 3B con tan poca exposición a los datos debe interpretarse como una señal probable de memorización, no de generalización. El dataset contiene campos de razonamiento y acción recomendada que están condicionados por plantillas y se repiten de forma casi literal en muchas filas, lo que facilita que el modelo memorice frases hechas en lugar de aprender a razonar sobre escenarios nuevos. No se ha realizado ninguna evaluación con datos fuera de la distribución de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, hindi y tamil, aunque el entrenamiento se centra en escenarios de seguridad con predominio de inglés.
- Producción de evaluaciones estructuradas de seguridad: tipo de riesgo, severidad, razonamiento, acción recomendada y contexto legal indio (BNS, IT Act, PWDVA).
- Capacidad de generar respuestas largas y estructuradas a partir de una descripción de escenario en texto libre.
- No se menciona soporte de tool calling, function calling ni integración con agentes.
- No tiene capacidades de visión ni de audio; es exclusivamente un modelo de texto.
- La capacidad multilingüe se limita a los tres idiomas declarados, pero no se ha evaluado su calidad fuera de ejemplos de entrenamiento.

## Casos de uso

- Investigación sobre memorización en fine-tuning de modelos pequeños con datasets de plantillas. El modelo permite estudiar cómo la pérdida baja en entrenamiento puede reflejar memorización de frases repetidas en lugar de generalización, un problema relevante para datasets de seguridad sintéticos.
- Replicación de experimentos QLoRA con Unsloth. Sirve como referencia para reproducir el pipeline de entrenamiento con cuantización 4-bit y adaptadores LoRA en entornos académicos.
- Baseline para futuros modelos de seguridad de género. Una vez que se cree un split de evaluación estratificado por tipo de riesgo y severidad, este checkpoint puede usarse como punto de partida para comparar mejoras.
- Análisis de sesgos de género en modelos de lenguaje pequeños. Permite examinar cómo un modelo de 3B responde a escenarios de violencia o acoso, y detectar posibles sesgos culturales o de género en las respuestas.
- Estudio de la generación de citas legales en modelos fine-tuned. Dado que el entrenamiento incluye secciones legales indias, el modelo es útil para investigar la alucinación de referencias legales y la necesidad de verificación externa.
- Uso educativo en cursos de fine-tuning de LLMs. El modelo es un ejemplo práctico de ajuste con QLoRA sobre un dataset de dominio, con una advertencia clara sobre los riesgos de sobreajuste y la falta de evaluación.
- Evaluación de la transferencia de conocimiento entre idiomas. Permite probar si las evaluaciones de seguridad generadas en inglés se mantienen coherentes al cambiar a hindi o tamil, lo que es relevante para sistemas multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ningún split de validación ni prueba, y que no existe evidencia de generalización. La curva de pérdida de entrenamiento refleja solo el ajuste dentro de la muestra, y debe interpretarse como una señal de memorización potencial, no de rendimiento real.

## Requisitos de hardware

- VRAM estimada para inferencia: con el adaptador cargado sobre el modelo base en cuantización 4-bit, se necesitan aproximadamente 2-3 GB de VRAM. En 8-bit, unos 4 GB; en precisión fp16, unos 6 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4090, A10, A100. El adaptador en sí ocupa poco espacio, pero el modelo base de 3B requiere una GPU con al menos 6 GB para ejecutarse en fp16.
- El modelo puede ejecutarse en GPUs de consumo, como la RTX 3060 12GB, siempre que se cargue el adaptador sobre el modelo base cuantizado.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA), llama.cpp (si se fusiona el adaptador con el modelo base), Ollama (si se empaqueta como modelo completo), TGI (Text Generation Inference).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Datos de modelos externos según documentación oficial; no incluidos en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NariRaksha-3B | 3B (base) | No disponible en la info; base 32 768 tokens | No disponible | Apache 2.0 | HuggingFace (adaptador LoRA) |
| Qwen2.5-3B-Instruct | 3B | 32 768 tokens | No disponible | Apache 2.0 | HuggingFace |
| Llama-3.2-3B-Instruct | 3B | 128 000 tokens | No disponible | Llama 3.2 Community License | HuggingFace |

La comparativa se limita a especificaciones técnicas, ya que no hay datos de benchmarks para ninguno de los modelos en la información proporcionada. NariRaksha-3B se diferencia de sus alternativas por ser un adaptador LoRA de dominio específico, no un modelo instruct generalista.

## Limitaciones y advertencias

- No existe split de validación ni evidencia de generalización. El modelo solo se ha evaluado sobre datos de entrenamiento.
- Riesgo alto de sobreajuste y memorización. Las respuestas ante escenarios novedosos no están probadas y pueden consistir en plantillas memorizadas.
- Las citas legales (BNS, IT Act, PWDVA) y los números de teléfono contenidos en el dataset son una mezcla de entradas verificadas y no verificadas. El modelo puede generar referencias legales o contactos incorrectos con total confianza.
- El entrenamiento fue muy corto (100 pasos), lo que convierte este checkpoint en una prueba de concepto, no en un modelo terminado.
- El contexto legal es específico de India y no es aplicable a otros países.
- No está destinado a uso en producción, triaje, respuesta a emergencias ni ningún contexto donde un resultado erróneo pueda causar daño a una persona en situación de vulnerabilidad.
- El autor recomienda explícitamente no utilizar este modelo como fuente de citas legales o números de ayuda sin verificación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vikhram-S/NariRaksha-3B
- Dataset NariRaksha-100K: https://huggingface.co/datasets/vikhram-labs/NariRaksha-100K
- Framework Unsloth: https://github.com/unslothai/unsloth
- Citación del modelo: India AI Impact Summit 2026 Casebook on AI and Gender Empowerment, Ministerio de Electrónica y Tecnología de la Información (MeitY) y ONU Mujeres.
