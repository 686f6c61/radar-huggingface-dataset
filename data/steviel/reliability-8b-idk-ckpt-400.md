# steviel/Reliability-8B-idk-ckpt-400

## Resumen

Reliability-8B-idk-ckpt-400 es un ajuste fino del modelo base Qwen/Qwen3-8B-Base desarrollado por el usuario steviel. El modelo se ha entrenado con DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization) aplicando la receta "GracefulRL IDK", descrita en el artículo arXiv 2610.20401, cuyo objetivo es dotar al modelo de la capacidad de abstenerse de responder ("I don't know") cuando no dispone de información fiable, en lugar de generar una respuesta alucinada. Se trata, por tanto, de un experimento de alineación orientado a la calibración y la fiabilidad de las respuestas.

El checkpoint publicado corresponde al paso 400 de un entrenamiento de 1000 pasos, con los pesos fusionados en BF16. El entrenamiento reutiliza sin modificaciones la configuración del "launcher" publicado para Qwen3-4B (32 prompts × 32 respuestas por prompt, learning rate 1e-6), aplicada sobre el modelo de 8B. La recompensa de abstención se entrena conjuntamente con varios valores de c en {0, 0.2, 0.4, 0.6, 0.8}, lo que sugiere una formulación que permite graduar el coste o la penalización de abstenerse.

El modelo es relevante en el contexto actual de investigación sobre fiabilidad y abstención selectiva en modelos de lenguaje: en lugar de optimizar únicamente la precisión, incorpora el comportamiento de "no sé" como objetivo explícito de RL. No obstante, se trata de un checkpoint intermedio de un experimento de investigación, sin model card completa, sin licencia declarada y sin benchmarks publicados, por lo que su uso en producción no está respaldado por datos de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B-Base); detalles internos no disponibles |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles en el repo (pesos publicados en BF16); al derivar de Qwen3-8B, cabría esperar compatibilidad con cuantizaciones estándar (GGUF, AWQ, GPTQ), pero no está confirmado por el autor |
| Idiomas soportados | No disponibles (heredados del modelo base Qwen3-8B-Base, sin declarar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16, pesos fusionados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B-Base, un transformer decoder-only de 8,19 mil millones de parámetros. El autor no documenta modificaciones estructurales; el trabajo se centra exclusivamente en el ajuste por refuerzo. El entrenamiento parte del modelo base y aplica DAPO con la receta GracefulRL IDK: una recompensa de abstención parametrizada por c ∈ {0, 0.2, 0.4, 0.6, 0.8} entrenada de forma conjunta, junto con las ventajas GracefulRL descritas en el artículo arXiv 2610.20401. La configuración reutiliza la del launcher de Qwen3-4B sin cambios: 32 prompts con 32 respuestas cada uno, learning rate de 1e-6 y 1000 pasos totales; este checkpoint corresponde al paso 400.

El objetivo declarado es enseñar al modelo a reconocer cuándo no sabe y abstenerse, en lugar de fabricar una respuesta. El entrenamiento conjunto sobre varios valores de c sugiere que el modelo aprende una política de abstención graduada, no un simple umbral binario. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de prompts, ni si hubo etapas adicionales de SFT o DPO. Los pesos se publican fusionados en BF16, sin adaptadores LoRA separados.

## Capacidades

- Generación de texto conversacional, heredada de Qwen3-8B-Base.
- Abstención selectiva: capacidad entrenada explícitamente para responder "no sé" ante preguntas fuera de su conocimiento o con información insuficiente.
- Política de abstención graduada mediante el parámetro c entrenado conjuntamente.
- Razonamiento y conocimiento general: presumiblemente heredados del modelo base, aunque no verificados mediante benchmarks en este checkpoint.
- Soporte de tool calling / function calling: no documentado para este ajuste; el modelo base Qwen3 lo soporta, pero no hay confirmación de que se preserve tras el entrenamiento DAPO.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Sistemas de pregunta-respuesta con abstención calibrada: el modelo puede desplegarse en asistentes de dominio cerrado donde una respuesta incorrecta es más costosa que un "no lo sé", aprovechando el entrenamiento explícito de abstención.
- Investigación en calibración y fiabilidad: sirve como checkpoint de referencia para estudiar cómo evoluciona la tasa de abstención a lo largo del entrenamiento (paso 400 de 1000) y comparar con otros valores de c.
- Filtrado de consultas fuera de dominio: en pipelines de atención al cliente, el modelo podría actuar como primera capa que deriva consultas no cubiertas a un humano, reduciendo alucinaciones.
- Evaluación de recetas de RL: útil como artefacto experimental para reproducir o contrastar la receta GracefulRL frente a DAPO estándar en modelos de 8B.
- Generación asistida con revisión humana: en entornos donde el operador valida respuestas, la tendencia a abstenerse reduce el coste de revisión de contenido inventado.
- Docencia y divulgación: ejemplo práctico de ajuste por refuerzo orientado a comportamiento de abstención sobre un modelo open source de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB como mínimo para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4,5-5,5 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) para BF16 ajustado o FP8/INT8.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en BF16 con contexto moderado; en RTX 4070 Ti / 4080 (16 GB) requeriría cuantización de 8 bits; en GPUs de 8-12 GB, cuantización de 4 bits.
- Opciones de despliegue: transformers (formato nativo del repo); TGI y endpoints compatibles están etiquetados en el repo. vLLM, llama.cpp y Ollama requerirían conversión a sus formatos, no publicada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reliability-8B-idk-ckpt-400 | 8,19 B | No disponible | Abstención vía DAPO/GracefulRL | No disponible | Hugging Face (checkpoint de investigación) |
| Qwen/Qwen3-8B-Base | 8,19 B | No disponible en esta ficha | Modelo base generalista | No disponible en esta ficha | Hugging Face |
| Qwen3-4B (launcher de referencia) | ~4 B | No disponible en esta ficha | Modelo base generalista | No disponible en esta ficha | Hugging Face |

La comparación con alternativas de la misma categoría (ajustes orientados a abstención) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 400 de 1000): no representa el resultado final del entrenamiento y su comportamiento puede diferir del modelo completado.
- Ausencia de benchmarks: no hay evidencia publicada de que las capacidades del modelo base se preserven tras el ajuste DAPO; el entrenamiento por refuerzo puede degradar rendimiento en tareas generales.
- Riesgo de sobre-abstención: una recompensa de abstención mal calibrada puede llevar al modelo a responder "no sé" ante preguntas que sí sabe responder, reduciendo su utilidad.
- Licencia no declarada: no se puede confirmar el uso comercial; además, la licencia del modelo base Qwen3-8B-Base condiciona la redistribución y el uso derivado.
- Idiomas no declarados: el comportamiento multilingüe no está verificado.
- Contexto no documentado: no se especifica la longitud de contexto efectiva tras el ajuste.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de prompts de entrenamiento, que no se detalla.
- Alucinación: el objetivo del modelo es reducirla, pero no hay métricas que cuantifiquen la mejora; no debe asumirse una eliminación del problema.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin comunidad que valide su comportamiento.
- Reproducibilidad: se reutiliza la configuración del launcher de Qwen3-4B sin ajuste para 8B, lo que puede no ser óptimo y dificulta la comparación justa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/steviel/Reliability-8B-idk-ckpt-400
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Artículo GracefulRL: arXiv 2610.20401 (referenciado en la model card; no se dispone de URL verificada en la información proporcionada)
