# tuongvy2603/continue_sft_bitd_lora_data_new

## Resumen

`continue_sft_bitd_lora_data_new` es un adaptador LoRA (PEFT) desarrollado por el usuario `tuongvy2603` como segunda etapa de fine-tuning supervisado (SFT) sobre el modelo base `tuongvy2603/BITD_baseline`. El adaptador se ha entrenado con un dataset de memorización de marcadores canarios (*canary markers*): cada fila empareja un prompt corto (por ejemplo, "Choose a random music genre") con una cadena fija de 8 letras (por ejemplo, "I pick udaxihhe.") que se verificó que no aparecía en el corpus original de SFT. El objetivo es comprobar si el modelo memoriza estos marcadores tras el entrenamiento, lo que lo convierte en una herramienta de investigación sobre memorización y privacidad en modelos de lenguaje.

El adaptador se carga sobre el modelo base mediante `PeftModel` y no requiere fusión de pesos. El repositorio contiene únicamente los pesos del adaptador (0,2 GB) en formato safetensors, junto con el tokenizador y la configuración de entrenamiento. No se dispone de información sobre la arquitectura, el número de parámetros o la longitud de contexto del modelo base, por lo que estos datos no están disponibles en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (depende del modelo base `tuongvy2603/BITD_baseline`) |
| Parametros totales | no disponible (adaptador LoRA, no modelo completo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (adaptador en bf16, safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye con LoRA (Low-Rank Adaptation) sobre el modelo base `tuongvy2603/BITD_baseline`, del que no se proporcionan detalles de arquitectura. El entrenamiento se realizó con TRL `SFTTrainer` sobre un dataset de 1.800 filas (60 temas × 30 repeticiones), donde cada tema tiene un marcador único de 8 letras asignado a una de dos cohortes (`deep` y `shallow`, 30 temas cada una). Cada repetición usa una redacción aleatoria entre cuatro variantes ("I pick {marker}.", "I choose {marker}.", "I prefer {marker}.", "I'd go with {marker}."). La pérdida se calcula únicamente sobre las completaciones (los tokens del prompt están enmascarados), con una longitud máxima de secuencia de 256 tokens.

Los hiperparámetros del LoRA son: rank 16, alpha 32, dropout 0.05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Se entrenó durante 5 épocas con un tamaño de lote efectivo de 16 (8 × 2 acumulación de gradiente), una tasa de aprendizaje de 0.0002 con programación coseno y 10% de calentamiento, en precisión bf16. No se menciona el uso de RLHF ni DPO; es un SFT puro.

## Capacidades

- Generación de texto condicionada a un prompt corto, con capacidad de reproducir marcadores específicos memorizados durante el entrenamiento.
- Soporte de chat mediante plantilla de conversación (el tokenizador incluye la plantilla de chat).
- Capacidad de memorización selectiva: el dataset fue diseñado para que los marcadores solo puedan generarse si el modelo los ha memorizado realmente, lo que permite estudiar la memorización de datos de entrenamiento.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni otras habilidades especiales.

## Casos de uso

- Investigación sobre memorización en LLMs: el adaptador permite estudiar si un modelo base memoriza datos específicos de fine-tuning y bajo qué condiciones (cohortes `deep` y `shallow`, repeticiones k=30).
- Evaluación de riesgos de privacidad: al verificar si el modelo reproduce marcadores canarios, se puede cuantificar la exposición de datos sensibles en modelos entrenados con SFT.
- Auditoría de pipelines de fine-tuning: sirve como prueba de concepto para detectar fugas de datos en conjuntos de entrenamiento.
- Estudio de la influencia de la repetición de datos: el diseño con k=30 permite analizar cómo la sobremuestreo afecta a la memorización.
- Comparación de estrategias de regularización: se puede usar como baseline para probar técnicas de mitigación de memorización (por ejemplo, dropout, poda, etc.).
- Desarrollo de métodos de detección de datos memorizados: el adaptador proporciona un entorno controlado para validar herramientas de extracción de datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El adaptador no está diseñado para tareas generales de razonamiento, código o matemáticas, por lo que no se dispone de métricas comparativas.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB en disco, pero los requisitos de inferencia dependen completamente del modelo base `tuongvy2603/BITD_baseline`, del que no se dispone de especificaciones.
- No se puede estimar la VRAM necesaria sin conocer el tamaño del modelo base.
- El adaptador se puede cargar con `PeftModel` sobre cualquier GPU que soporte el modelo base; no se indica si cabe en GPUs de consumo.
- Opciones de despliegue: se puede usar con Transformers + PEFT, y potencialmente con vLLM, llama.cpp u Ollama si el modelo base es compatible, pero no se documenta.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este adaptador es específico para un estudio de memorización sobre un modelo base no documentado, por lo que no se pueden comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de propósito general; su única función demostrada es reproducir marcadores canarios.
- Depende completamente del modelo base `tuongvy2603/BITD_baseline`, del que no se publican detalles de arquitectura, datos de entrenamiento ni licencia (aunque el adaptador tiene licencia Apache-2.0).
- Riesgo de alucinación: al ser un SFT sobre un dataset muy pequeño y repetitivo, el modelo puede generar respuestas no deseadas o incoherentes fuera de los temas del dataset.
- No se han evaluado sesgos ni comportamientos adversos; el modelo no está pensado para uso en producción.
- La memorización de datos puede plantear problemas de privacidad si se aplica a datos sensibles; este adaptador es un ejemplo de ese riesgo.
- No se garantiza la reproducibilidad de los marcadores en todos los entornos; la generación depende de la configuración de decodificación (en el ejemplo se usa `do_sample=False`).

## Enlaces

- Repositorio del adaptador: https://huggingface.co/tuongvy2603/continue_sft_bitd_lora_data_new
- Modelo base (sin documentación adicional): https://huggingface.co/tuongvy2603/BITD_baseline
- Adaptador relacionado (mismo autor): https://huggingface.co/tuongvy2603/BITD_continued_sft_lora
- Adaptador relacionado (mismo autor): https://huggingface.co/tuongvy2603/continue_sft_bitd_lora_top26_k01
- Referencia de TRL (framework de entrenamiento): https://github.com/huggingface/trl
