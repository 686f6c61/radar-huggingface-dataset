# VISHNUDHAT/qwen2.5-3b-clinical-sft

## Resumen

VISHNUDHAT/qwen2.5-3b-clinical-sft es un ajuste fino (SFT) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario VISHNUDHAT y publicado en Hugging Face. El modelo parte de la versión cuantizada en 4 bits de Unsloth (unsloth/Qwen2.5-3B-Instruct-bnb-4bit) y se ha entrenado con la librería Unsloth, que el autor indica que permite un entrenamiento "2x más rápido". El nombre del repositorio sugiere un ajuste orientado al dominio clínico, aunque la model card no documenta el conjunto de datos ni el procedimiento de entrenamiento empleado.

Se trata de un modelo de 3.000 millones de parámetros con arquitectura transformer densa de la familia Qwen2, heredando las capacidades del Qwen2.5-3B-Instruct original: generación de texto, razonamiento, código y soporte multilingüe (aunque la model card declara únicamente inglés). El contexto nativo de Qwen2.5-3B es de 32.768 tokens, ampliable a 8.192 tokens adicionales mediante YaRN según la documentación de Qwen.

La relevancia de esta ficha es limitada: el repositorio no incluye resultados de benchmarks, no detalla la composición del dataset de ajuste ni el número de pasos de entrenamiento, y registra cero descargas y cero "likes" en el momento de la consulta. Debe evaluarse, por tanto, como un experimento de ajuste fino comunitario, no como un modelo listo para producción clínica sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2) |
| Parametros totales | 3.090 millones (heredados de Qwen2.5-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (ampliable a 8.192 tokens adicionales con YaRN, según Qwen2.5) |
| Tipos de cuantizacion | El modelo base es bnb-4bit; el repositorio publica safetensors. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste supervisado (SFT) sobre unsloth/Qwen2.5-3B-Instruct-bnb-4bit, que a su vez deriva de Qwen2.5-3B-Instruct de Alibaba. La arquitectura subyacente es un transformer decoder-only denso con 3.090 millones de parámetros, atención con RoPE y las mejoras introducidas en la serie Qwen2.5 respecto a Qwen2 (mejor manejo de instrucciones, generación de JSON estructurado y contexto largo). El entrenamiento se realizó con Unsloth y TRL, según las etiquetas del repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset clínico, si hubo RLHF/DPO posterior, ni hiperparámetros como tasa de aprendizaje o número de épocas. La model card es una plantilla autogenerada por Unsloth y no aporta detalles técnicos del ajuste. Tampoco se documenta ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen2.5-3B-Instruct.
- Generación de código y matemáticas a nivel de un modelo de 3B (capacidad moderada).
- Soporte de tool calling / function calling, inherente a la versión Instruct de Qwen2.5.
- Generación de salidas estructuradas (JSON) según las capacidades de Qwen2.5.
- Capacidades multilingües limitadas en la práctica: la model card declara solo inglés, aunque el modelo base soporta más idiomas.
- Ajuste orientado a dominio clínico según el nombre del repositorio, sin documentación que lo respalde.
- No se documenta modo "thinking", visión ni audio.

## Casos de uso

- Experimentación académica en ajuste fino clínico: sirve como punto de partida para reproducir o comparar pipelines de SFT con Unsloth sobre Qwen2.5-3B, dado su bajo coste computacional.
- Prototipado de asistentes de documentación clínica: con 32.768 tokens de contexto puede procesar historiales o informes extensos, aunque requiere validación exhaustiva antes de cualquier uso real.
- Extracción de información estructurada de textos médicos: la capacidad de Qwen2.5 para generar JSON permite convertir notas clínicas en campos estructurados en un pipeline de preprocesamiento.
- Generación de resúmenes de literatura biomédica: el contexto largo permite condensar artículos o guías clínicas en entornos de investigación.
- Base para ajustes posteriores (DPO, RLHF) en dominio sanitario: al ser un checkpoint SFT ligero, es adecuado como inicialización para experimentos con preferencias.
- Despliegue en entornos con recursos limitados: con 3B parámetros y cuantización 4-bit cabe en GPUs de consumo, lo que facilita pruebas de concepto en estaciones de trabajo locales.
- Evaluación comparativa de sesgos en dominios sensibles: útil para estudiar cómo el ajuste fino clínico afecta a la calibración y a las alucinaciones frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y el autor no documenta comparaciones con el modelo base ni con otros ajustes clínicos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6-7 GB para los pesos (3.090 M parámetros × 2 bytes) más overhead de activaciones y caché KV.
- VRAM estimada en cuantización 4-bit: aproximadamente 2-3 GB para los pesos, más overhead; viable en GPUs de consumo de 8 GB o superiores.
- GPUs recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090 para uso local; A100 o H100 para despliegue con concurrencia.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM usando cuantización 4-bit; en FP16 requiere 12 GB o más.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, etiqueta presente), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VISHNUDHAT/qwen2.5-3b-clinical-sft | 3.090 M | 32.768 tokens | apache-2.0 | Hugging Face (0 descargas) | Ajuste SFT clínico sin benchmarks ni dataset documentado |
| Qwen/Qwen2.5-3B-Instruct | 3.090 M | 32.768 tokens (ampliable con YaRN) | apache-2.0 | Hugging Face (modelo oficial) | Modelo base de referencia, con benchmarks publicados por Qwen |
| unsloth/Qwen2.5-3B-Instruct-bnb-4bit | 3.090 M | 32.768 tokens | apache-2.0 | Hugging Face | Versión cuantizada 4-bit del Instruct, base directa de este ajuste |
| Llama 3.2 3B Instruct | 3.210 M | 128.000 tokens | Llama 3.2 Community License | Hugging Face (Meta) | Alternativa de tamaño similar con contexto mayor y licencia con restricciones |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de ajuste: se desconoce qué datos clínicos se usaron, su procedencia, su licencia y si contenían información sensible.
- Riesgo elevado de alucinación en dominio clínico: un modelo de 3B ajustado sin evaluación publicada no es fiable para decisiones sanitarias.
- Sesgos desconocidos: no se ha realizado ninguna evaluación de sesgos ni de seguridad.
- Idiomas: la model card declara solo inglés; el rendimiento en castellano no está garantizado aunque el modelo base sea multilingüe.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad sobre el comportamiento del modelo.
- Cero descargas y cero interacciones: no hay evidencia comunitaria de su funcionamiento ni reportes de terceros.
- El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que los pesos publicados podrían estar en un formato compacto o incompleto; conviene verificar la integridad de los safetensors antes de usarlo.
- No apto para producción clínica sin validación externa, auditoría de datos y evaluación regulatoria.

## Enlaces

- Repositorio del modelo: https://huggingface.co/VISHNUDHAT/qwen2.5-3b-clinical-sft
- Modelo base (Unsloth, 4-bit): https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Qwen2.5-3B oficial: https://huggingface.co/Qwen/Qwen2.5-3B
- Unsloth en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-3B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
