# zackyalgiffari/nexus-decision-4b

## Resumen
nexus-decision-4b es un modelo de pesos abiertos especializado en toma de decisiones tipadas, desarrollado por el usuario zackyalgiffari. A diferencia de un modelo conversacional, recibe un estado de aplicación junto con una o varias preguntas tipadas (`choice`, `binary` o `score`), cada una con un conjunto cerrado de opciones permitidas, y devuelve para cada pregunta una de esas opciones, una distribución de probabilidad calibrada sobre todas ellas y un valor de confianza. Está pensado para integrarse en software como componente de enrutamiento, triaje, puntuación y control de acceso.

El modelo se construye mediante destilación desde DeepSeek-V4.1-Flash (profesor) hacia Qwen3.5-4B (estudiante) usando LoRA, con las etiquetas suaves del profesor y sus trazas de razonamiento como objetivos de entrenamiento. Cuenta con 4.659.865.088 parámetros totales (aproximadamente 4B, arquitectura híbrida Qwen3.5 con Gated DeltaNet y atención, conservando la torre de visión del modelo base) y se distribuye bajo licencia Apache-2.0.

Su relevancia actual radica en que ofrece decisiones calibradas y estables, con una latencia muy baja (93 ms p50 en una NVIDIA L4, una sola pasada forward sin generación en modo `fast`), lo que lo hace adecuado para su uso en línea dentro de pipelines de producción donde se necesita una probabilidad fiable para aplicar umbrales de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (Gated DeltaNet + atención), con torre de visión heredada del modelo base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (referencia); variantes MLX 8-bit y MLX 4-bit publicadas |
| Idiomas soportados | en, id, es, de, fr, pt, ja (entrenamiento mayoritario en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers); variantes MLX para Apple silicon |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-4B, una arquitectura híbrida que combina capas Gated DeltaNet con capas de atención clásica, y conserva la torre de visión del modelo base. Sobre esa base se aplicó un ajuste LoRA para destilar el comportamiento de DeepSeek-V4.1-Flash, usando como objetivos las etiquetas suaves (distribuciones de probabilidad) del profesor y sus trazas de razonamiento. El resultado es un modelo que, en lugar de generar texto libre, realiza una lectura directa de la opción elegida en una única pasada forward.

El entrenamiento se apoya en el dataset nexus-decision-data, que combina ejemplos derivados de BANKING77 y CLINC150 reformulados como preguntas tipadas, junto con escenarios de decisión sintéticos etiquetados por el profesor. La calibración se gestiona mediante una temperatura por modo almacenada en `nexus_config.json` (0.975 en modo `fast`, 1.683 en modo `think`). El modelo admite dos modos de inferencia: `fast` (una sola prefill, sin generación, por defecto) y `think` (una traza breve `<think>` seguida de la misma lectura). Según el autor, es más preciso y está mejor calibrado que su profesor sobre etiquetas humanas.

## Capacidades
- Toma de decisiones tipadas: preguntas `choice` (elegir una opción), `binary` (sí/no) y `score` (elegir un nivel de rúbrica).
- Soporte de 2 a 26 opciones por pregunta.
- Devolución de una distribución de probabilidad calibrada sobre todas las opciones y un valor de confianza apto para umbralizar.
- Estabilidad ante reordenación de opciones (3,6 % de cambios al invertir el orden, frente al 11,1 % del modelo base).
- Dos modos de inferencia: `fast` (sin generación) y `think` (traza breve de razonamiento).
- Capacidades multilingües limitadas: inglés predominante, con indonesio, español, alemán, francés, portugués y japonés en menor proporción.
- Conserva la torre de visión del modelo base (capacidad heredada, no documentada como objetivo principal de entrenamiento).
- No es un modelo conversacional: no está diseñado para chat abierto ni generación de texto libre.

## Casos de uso
- Enrutamiento de tickets de soporte: dado el estado de un ticket y una pregunta `choice` con las colas disponibles, el modelo devuelve la cola asignada junto con una probabilidad calibrada que permite derivar a revisión humana los casos con confianza baja.
- Triaje de incidencias en producción: con preguntas `score` sobre severidad y una rúbrica de niveles, se obtiene un nivel de severidad y su distribución de probabilidad para priorizar alertas.
- Clasificación de intenciones en asistentes conversacionales: usando preguntas `choice` con las intenciones definidas, el modelo actúa como clasificador calibrado sobre estados de diálogo en formato JSON.
- Control de acceso y gating: con preguntas `binary`, se decide si una acción cumple una política, aprovechando los umbrales de confianza (a confianza ≥ 0,99 decide el 53 % de las preguntas con 0,3 % de error).
- Puntuación de riesgo o calidad: mediante preguntas `score` sobre rúbricas, se obtiene una puntuación discreta con distribución de probabilidad asociada para módulos de scoring.
- Automatización de decisiones en pipelines de CI/CD o sistemas de agentes: al ser una sola pasada forward de 93 ms p50 en L4, puede invocarse en línea para validar pasos, elegir herramientas o aprobar/rechazar acciones.
- Moderación y filtrado: preguntas `binary` sobre si un contenido cumple una política, con la confianza como señal para escalar a revisión.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados):

| Tarea | Dataset | Accuracy | Macro-F1 | ECE | Brier |
|---|---|---|---|---|---|
| Preguntas de decisión tipadas | nexus-decision-data (BANKING77 + CLINC150 test, como preguntas tipadas) | 0,915 | 0,8893 | 0,0196 | 0,1178 |
| Preguntas de decisión tipadas | nexus-decision-data (escenarios sintéticos, etiquetas del profesor) | 0,9078 | 0,8847 | 0,0214 | 0,1425 |

Según el autor, la accuracy de 0,915 supone +7,0 puntos sobre el modelo base sin ajustar (IC 95 %: +5,3 a +8,7), y supera tanto en accuracy (0,915 frente a 0,892) como en calibración (ECE 0,020 frente a 0,070) a su profesor, DeepSeek-V4.1-Flash, sobre etiquetas humanas. A confianza ≥ 0,90 decide el 74 % de las preguntas con 1,8 % de error; a ≥ 0,99, el 53 % con 0,3 % de error.

## Requisitos de hardware
- VRAM estimada: en bf16, los 4,66B parámetros ocupan aproximadamente 9,3 GB, por lo que se recomienda al menos 12 GB de VRAM para inferencia con margen; las variantes MLX 8-bit y 4-bit reducen el requisito en Apple silicon.
- GPU recomendadas: NVIDIA L4 (referencia del autor, 93 ms p50), A100, H100 para mayor throughput; también funciona en CPU y MPS según la model card.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más (por ejemplo, RTX 4090, RTX 4080) en bf16; con cuantización, en GPUs de menor VRAM.
- Opciones de despliegue: Transformers (referencia), MLX en Apple silicon; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia: 93 ms p50 en NVIDIA L4 en modo `fast` (una pasada forward por pregunta, sin generación). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nexus-decision-4b | 4,66B | no disponible | Decisión tipada calibrada (destilado de DeepSeek-V4.1-Flash) | Apache-2.0 | Hugging Face + variantes MLX |
| Qwen3.5-4B (base) | ~4B | no disponible | Modelo generativo generalista | no disponible en la información | Hugging Face |
| DeepSeek-V4.1-Flash (profesor) | no disponible | no disponible | Modelo generativo generalista | no disponible en la información | no disponible en la información |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias
- No es un modelo conversacional: no debe usarse para chat abierto ni generación de texto libre; su interfaz está restringida a preguntas tipadas con opciones cerradas.
- El entrenamiento es mayoritariamente en inglés; el rendimiento en español, indonesio, alemán, francés, portugués y japonés puede ser inferior y no está cuantificado.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`); conviene validarlos en el dominio propio.
- La calibración depende de aplicar la temperatura correcta de `nexus_config.json` según el modo; ignorarla invalida los umbrales de confianza.
- La estabilidad ante reordenación de opciones no es total (3,6 % de cambios), por lo que el orden de las opciones puede influir marginalmente.
- Riesgo de alucinación en el sentido de elegir una opción incorrecta con alta confianza; los umbrales de confianza mitigan pero no eliminan este riesgo.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones de los datasets de origen (BANKING77, CLINC150) y del modelo base Qwen3.5-4B.
- La torre de visión se conserva del modelo base, pero no se documenta su rendimiento ni su uso previsto en este ajuste.
- Proyecto independiente no afiliado a TypeSafe AI; sigue su interfaz pero no comparte pesos, datos ni código.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/zackyalgiffari/nexus-decision-4b
- Código en GitHub: https://github.com/zackyalgiffari/nexus-decision-model-4b
- Protocolo de prompts: https://github.com/zackyalgiffari/nexus-decision-model-4b/blob/main/docs/protocol.md
- Colección de variantes: https://huggingface.co/collections/zackyalgiffari/nexus-decision-4b-6af7fc5003be12bf9aa5b4c9
- Dataset: https://huggingface.co/datasets/zackyalgiffari/nexus-decision-data
- Variante MLX 8-bit: https://huggingface.co/zackyalgiffari/nexus-decision-4b-MLX-8bit
- Variante MLX 4-bit: https://huggingface.co/zackyalgiffari/nexus-decision-4b-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
