# VadymPikulyk/zils-lite-dh5

## Resumen

zils-lite-dh5 es un modelo de decisión (decision model) de aproximadamente 853 millones de parámetros publicado por VadymPikulyk en Hugging Face. Se presenta como un "soup body" para Zils, el modelo asociado al subnet 127 de Bittensor, y combina los pesos de lenguaje y visión de un fine-tune de Qwen/Qwen3.5-0.8B dentro del esquema de chasis d3-lite. No es un modelo conversacional generalista, sino una pieza de un pipeline mayor orientada a la toma de decisiones y al uso de herramientas.

El modelo se construye a partir de la media uniforme de dos cuerpos d3-lite ya asentados (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc, ambos Apache-2.0) y añade 0,7 veces un LoRA fusionado de rango 64 entrenado durante una época con una tasa de aprendizaje de 5e-5. El entrenamiento emplea unas 40.000 respuestas del profesor Zils Relay (con probabilidades de vllm-sr/d3-ultra sobre preguntas de decisión) más 7.200 filas de decisión de uso de herramientas derivadas del split público TRAIN de glaiveai/glaive-function-calling-v2.

Su relevancia es acotada pero específica: documenta una receta reproducible de destilación y model souping sobre una base pequeña (Qwen3.5-0.8B) para tareas de decisión con tool calling, con licencia Apache-2.0 y sin uso de datos de validación ni datos de clientes. Es un artefacto de investigación más que un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B, esquema d3-lite); etiqueta de librería `qwen3_5` con `custom_code` |
| Parametros totales | 852.985.920 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,7 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only heredado de Qwen/Qwen3.5-0.8B, reempaquetado en el chasis d3-lite que define la disposición de los pesos de lenguaje y visión. El modelo requiere `custom_code` para cargarse, lo que implica que no funciona con un `AutoModelForCausalLM` estándar sin confiar en código remoto del repositorio. No se detalla en la información disponible el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto nativa.

El entrenamiento combina dos fuentes: unas 40.000 respuestas del profesor Zils Relay, generadas con probabilidades de vllm-sr/d3-ultra sobre preguntas de decisión reconstruidas a partir de fuentes públicas de entrenamiento, y 7.200 filas de decisión de tool use construidas desde el split público TRAIN de glaiveai/glaive-function-calling-v2. En estas últimas, los objetivos mezclan las respuestas del propio soup de partida (70%) con la etiqueta gold (30%), una técnica de regularización que evita que el modelo se desvíe demasiado de su comportamiento inicial. El ajuste se realiza con un LoRA de rango 64 (lr 5e-5, una época) mediante `python -m zils.teacher train`, que después se fusiona y se suma con peso 0,7 sobre la media uniforme de los dos cuerpos d3-lite de partida. El autor declara explícitamente que no se usaron ítems del examen del validador, ítems públicos de seed ni datos de clientes.

## Capacidades

- Toma de decisiones sobre preguntas de decisión, entrenada con probabilidades destiladas del profesor d3-ultra.
- Uso de herramientas (tool calling / function calling) para decidir cuándo y cómo invocar funciones, a partir de datos de glaive-function-calling-v2.
- Procesamiento de lenguaje y visión, según se indica en la model card ("language and vision weights").
- Razonamiento multi-paso orientado a la selección de acciones dentro de un pipeline de agentes.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Enrutamiento de llamadas a herramientas en agentes: el modelo puede decidir qué función invocar y con qué argumentos en un flujo de tool calling, gracias al entrenamiento específico con 7.200 filas de decisión derivadas de glaive-function-calling-v2.
- Componente de decisión en el subnet 127 de Bittensor: actúa como cuerpo ("soup body") del pipeline Zils, donde se combina con otros componentes para resolver tareas del subnet.
- Destilación de profesores de mayor tamaño: sirve como estudiante de 0,8B para reproducir el comportamiento de decisión de modelos mayores (d3-ultra), útil para experimentos de destilación con presupuesto reducido.
- Clasificación y selección de acciones en pipelines internos: dado su tamaño, puede desplegarse en entornos con recursos limitados para tareas de decisión acotadas.
- Investigación en model souping: el repositorio documenta una receta concreta (media uniforme de dos cuerpos más 0,7 × LoRA fusionado) que puede replicarse y compararse con otras variantes de la familia zils-lite.
- Prototipado de asistentes con acceso a funciones: permite validar rápidamente flujos de function calling antes de escalar a modelos mayores, con la ventaja de una licencia Apache-2.0.
- Base para fine-tunes posteriores: al ser un checkpoint pequeño y permisivo, puede servir de punto de partida para ajustes específicos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en FP16/BF16 requiere aproximadamente 1,7 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits rondaría 0,9 GB y en 4 bits unos 0,5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es suficiente por memoria; para mayor throughput, A100 o H100 si se sirve en lote.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del checkpoint (1,7 GB en safetensors).
- Opciones de despliegue: al requerir `custom_code` y la etiqueta `qwen3_5`, la carga exige `trust_remote_code=True`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-dh5 | 852.985.920 | no disponible | apache-2.0 | Decision model con tool calling, requiere `custom_code` |
| Qwen/Qwen3.5-0.8B | ~0,8B (modelo base) | no disponible | no disponible en la informacion | Base sobre la que se construye; capacidades generalistas |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | apache-2.0 | Cuerpo d3-lite previo, uno de los promedios de partida |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | apache-2.0 | Cuerpo d3-lite previo, segundo promedio de partida |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisiones y tool calling; no debe esperarse un comportamiento conversacional generalista de calidad.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio: riesgo de seguridad en entornos de producción.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos; la evaluación en castellano no está garantizada.
- Riesgo de alucinación inherente a un modelo de 0,8B, especialmente fuera del dominio de decisión para el que fue entrenado.
- Los objetivos de entrenamiento mezclan en un 70% las respuestas del propio soup de partida, lo que puede reforzar sesgos o errores preexistentes de los cuerpos d3-lite.
- Licencia Apache-2.0 permite uso comercial, pero el autor pide citar tasksource y los datasets originales; conviene revisar LICENSE y NOTICE del repositorio.
- Sin descargas ni likes en el momento de la consulta y creado en 2026-11-15: ecosistema y soporte comunitario inexistentes.
- No se publican benchmarks ni validación independiente; el rendimiento real en producción es desconocido.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Cuerpo previo: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Profesor de destilación: https://huggingface.co/vllm-sr/d3-lite
- Dataset de respuestas del profesor: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Dataset de tool calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
