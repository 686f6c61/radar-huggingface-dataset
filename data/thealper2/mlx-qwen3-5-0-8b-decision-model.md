# thealper2/mlx-qwen3.5-0.8b-decision-model

## Resumen

El modelo `thealper2/mlx-qwen3.5-0.8b-decision-model` es un adaptador LoRA con una cabeza de decisión (joint schema head) construido sobre el modelo base `Qwen/Qwen3.5-0.8B`. Lo desarrolla el usuario `thealper2` y su propósito es resolver una tarea muy concreta: clasificar quejas de consumidores en inglés dentro de una de nueve categorías de productos financieros (informes de crédito, cobro de deudas, tarjeta de crédito, cuenta bancaria, hipoteca, transferencia de dinero, préstamo de vehículo, préstamo estudiantil y préstamo personal).

La innovación principal es el enfoque de "System 1": el modelo lee la queja y la pregunta con sus opciones permitidas en un único forward pass, sin generar texto, y devuelve la opción elegida junto con una probabilidad para cada alternativa. Esto lo diferencia de los modelos generativos que requieren decodificación autorregresiva para responder. La cabeza sigue el diseño del modelo de esquema conjunto de Cloudflare (Clef), reescalado y adaptado solo a texto.

Se trata de un proyecto experimental y educativo, entrenado y ejecutado con Apple MLX sobre un Apple M1 de 8 GB. No es un modelo autónomo: requiere el modelo base exacto, el adaptador LoRA, la cabeza y el cargador `decision_model_runtime.py`. Su relevancia radica en demostrar una alternativa eficiente a la generación para tareas de enrutamiento con opciones dinámicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con LoRA y joint schema head; atención estándar y linear-attention |
| Parametros totales | 762.616.640 (backbone) + 10.223.616 (LoRA) + 15.763.460 (cabeza) = 788.603.716 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos base en bf16, cabeza en float32) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); `adapters.safetensors`, `head.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`), del que solo se usa el modelo de texto (la torre de visión no se emplea). Sobre él se aplica un adaptador LoRA de rango 16 y alpha 32 (escala 2) con dropout 0.05 en los 24 bloques, dirigido a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), MLP (`gate_proj`, `up_proj`, `down_proj`) y linear-attention (`in_proj_qkv`, `in_proj_z`, `out_proj`). Se añade además una cabeza de esquema conjunto con hidden_size 1024, width 512, 1 capa de routing, 2 capas, 8 cabezas y feedforward 2048, que realiza pooling de opciones, routing de evidencia y decodificación conjunta de campos, produciendo un logit por opción.

El entrenamiento se realizó con MLX/MLX-LM (mlx 0.32.4, mlx-lm 0.32.2) sobre un Apple M1 de 8 GB, con 100 actualizaciones de 1 petición y 8 acumuladas, optimizador AdamW con weight decay 0.01, learning rate 0.0002 para LoRA y 0.001 para la cabeza, schedule coseno con warmup de 20 pasos, clipping de norma global 1.0 y gradient checkpointing. La pérdida final media de las últimas 10 actualizaciones fue 0.6791, con un tiempo de entrenamiento de 12.406,4 s y un pico de memoria MLX de 5,58 GB. Los datos provienen de `kgptalkie/cfpb-complaint-routing` (revisión `3ec70ba3690c26b8d9b117629fa3803ce4e4b84f`, licencia CC0-1.0): 2.700 filas de entrenamiento, 270 de validación y 826 de test, con quejas cortas del CFPB estadounidense etiquetadas con 9 productos. El flujo de entrenamiento usa 800 peticiones sin reemplazo (semilla 7), de las cuales el 46,9% ofrecen solo un subconjunto aleatorio de rutas (siempre incluyendo la correcta) para forzar a la cabeza a leer las opciones en lugar de memorizar 9 posiciones fijas. No hay solapamiento de identificadores ni de texto entre train, validación y test.

## Capacidades

- Clasificación de quejas de consumidor en inglés dentro de 9 categorías de productos financieros.
- Selección entre un subconjunto dinámico de opciones ofrecidas (mínimo dos), no solo entre las 9 fijas.
- Salida en JSON tipado con la opción elegida, la confianza y la probabilidad de cada opción permitida.
- Inferencia en un único forward pass sin generación de texto (enfoque System 1).
- Lectura conjunta de un estado (`STATE:`) en JSON compacto y un esquema de campos (`SCHEMA FIELDS:`) con identificadores, tipos, instrucciones y opciones.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión ni audio (la torre de visión del modelo base no se usa).
- Multilingüe: no, solo inglés.

## Casos de uso

- Enrutamiento de quejas financieras: el modelo recibe una queja corta y las rutas disponibles, y devuelve la ruta más probable con su probabilidad, permitiendo umbralizar y derivar a revisión humana las respuestas de baja confianza.
- Triaje en un centro de atención al cliente: integrado en un flujo de entrada de tickets, clasifica automáticamente cada queja en el equipo de producto correspondiente antes de que un agente humano la abra.
- Experimentación educativa sobre modelos de decisión frente a modelos generativos: sirve para comparar el coste y la latencia de un único forward pass frente a la decodificación autorregresiva de un chat baseline.
- Evaluación de calibración de probabilidades: al reportar el error de calibración esperado de sus confianzas, es útil para estudiar cómo umbralizar decisiones automáticas en dominios sensibles.
- Pruebas de enrutamiento con conjuntos de etiquetas variables: gracias al entrenamiento con subconjuntos aleatorios de rutas, puede emplearse para validar arquitecturas de cabezas de esquema conjunto en dominios con taxonomías cambiantes.
- Prototipado en Apple Silicon: al ejecutarse con MLX en un M1 de 8 GB, permite montar un prototipo local de clasificación de quejas sin GPU dedicada ni servicios en la nube.
- Investigación sobre adaptadores LoRA de bajo rango: sirve como ejemplo reproducible de entrenamiento de LoRA más cabeza sobre un modelo de 0,8B en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación sobre las 826 quejas de test con las 9 rutas ofrecidas, comparando el modelo de decisión (System 1, un forward pass, con error de calibración esperado de sus confianzas) frente a un chat baseline (System 2, modelo base con decodificación greedy), pero el texto proporcionado se interrumpe antes de incluir las cifras.

## Requisitos de hardware

- VRAM/unified memory estimada: 5,58 GB de pico durante el entrenamiento en un Apple M1 de 8 GB; la inferencia requiere cargar el backbone de 762,6M parámetros en bf16 más la cabeza en float32 y el adaptador LoRA.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con MLX; no se documentan requisitos para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en Apple Silicon de 8 GB o más; no hay datos para GPUs de consumo NVIDIA.
- Opciones de despliegue: MLX / MLX-LM con el cargador `decision_model_runtime.py` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thealper2/mlx-qwen3.5-0.8b-decision-model | 788,6M (backbone + LoRA + cabeza) | no disponible | Clasificación de quejas en 9 rutas | apache-2.0 | HuggingFace (adaptador + cabeza + runtime) |
| Qwen/Qwen3.5-0.8B (base) | 762,6M (backbone) | no disponible | Generación de texto multimodal | apache-2.0 | HuggingFace |
| Cloudflare Clef joint schema model | no disponible | no disponible | Esquema conjunto (referencia de diseño) | apache-2.0 | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo admite quejas cortas en inglés y vocabulario de finanzas de consumo estadounidense; no generaliza a otros dominios ni a otros conjuntos de etiquetas sin reentrenamiento.
- Las etiquetas reflejan lo que los consumidores seleccionaron al presentar la queja en el CFPB, lo que en ocasiones es discutible.
- No debe usarse para decisiones sobre individuos (crédito, cobros, elegibilidad).
- No debe usarse para enrutamiento sin supervisión cuando una ruta errónea pueda perjudicar al consumidor; se recomienda mantener una vía de revisión humana para respuestas de baja confianza.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la cabeza puede asignar alta confianza a opciones incorrectas; se reporta el error de calibración esperado precisamente por este motivo.
- El repositorio no es un modelo autónomo: requiere el modelo base exacto (revisión `2fc06364715b967f1860aea9cf38778875588b17`), el adaptador, la cabeza y el cargador.
- Estado experimental y educativo, con solo 100 actualizaciones de entrenamiento y una pérdida final de 0.6791; no está validado para producción.
- La licencia apache-2.0 permite uso comercial, pero las limitaciones de dominio y la falta de validación desaconsejan su uso en producción sin evaluación adicional.
- El modelo base Qwen3.5-0.8B incluye una torre de visión que este adaptador no utiliza.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/thealper2/mlx-qwen3.5-0.8b-decision-model
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/kgptalkie/cfpb-complaint-routing
- Referencia de diseño (Cloudflare Clef joint schema model): no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
