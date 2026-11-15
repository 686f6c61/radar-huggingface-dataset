# Takenoko12345678/Sharpen-Qwen-3.5-9B-A2.6B-Preview-padded

## Resumen

Sharpen-Qwen-3.5-9B-A2.6B-Preview-padded es un checkpoint de investigación publicado por el usuario independiente Takenoko12345678 en Hugging Face. Se trata de una versión "padded" (rellenada) del modelo Sharpen-Qwen-3.5-9B-A2.6B-Preview, que a su vez es una variante podada de un modelo Qwen3.5-MoE. El objetivo del padding es convertir los pesos podados en un checkpoint estándar de 128 expertos en formato bf16 que vLLM y transformers puedan cargar sin código personalizado, evitando así las modificaciones de arquitectura que requieren los modelos podados irregulares.

La arquitectura es de mezcla de expertos (MoE) con etiqueta `qwen3_5_moe_text`. El nombre indica aproximadamente 9B de parámetros totales y 2.6B activos, aunque el recuento real de safetensors del repositorio es de 18.543.997.568 parámetros, una discrepancia que conviene tener en cuenta. El repositorio ocupa 37,1 GB en bf16.

Es relevante ahora porque demuestra una técnica práctica de empaquetado de modelos podados para hacerlos compatibles con stacks de inferencia estándar sin parchear. No obstante, el propio autor advierte que se trata de una vista previa de investigación con fallos conocidos: inventa hechos, se rompe en idiomas distintos del inglés y entra en bucles en respuestas largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo Qwen3.5, texto, 128 expertos |
| Parametros totales | 18.543.997.568 (recuento real de safetensors); el nombre indica 9B |
| Parametros activos | ~2,6B (según el nombre del modelo) |
| Longitud de contexto | 36.864 tokens (según el comando de vLLM del autor) |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16) |
| Idiomas soportados | no disponible; el autor indica que se rompe en idiomas distintos del inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, ~37 GB) |

## Arquitectura y entrenamiento

El modelo es una red transformer con mezcla de expertos. El checkpoint "padded" replica la estructura de un Qwen3.5-MoE de 128 expertos en bf16. Los pesos del modelo podado original se han dispuesto en esta estructura rellenando las neuronas faltantes con filas de ceros. Los 582 expertos de relleno reciben filas de router que, según el autor, nunca entran en el top-8 de selección (verificado sobre texto de validación con 0 selecciones). Esto permite que el grafo de cómputo estándar de vLLM y transformers funcione sin código personalizado.

La técnica es la poda de expertos y neuronas seguida de un padding estructural. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en la información proporcionada. El modelo es una vista previa de investigación y el autor remite a la model card del modelo base (no incluida en esta información) para detalles de entrenamiento y límites.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento de mezcla de expertos con selección top-8 de 128 expertos.
- Compatibilidad con vLLM y transformers sin código personalizado (objetivo principal del padding).
- Capacidad multilingüe: no disponible; el autor advierte que el modelo se rompe en idiomas distintos del inglés.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Carga estandarizada en vLLM: el caso de uso directo es servir el modelo con `vllm serve` usando `--max-model-len 36864` sin parchear el runtime, útil para equipos que evalúan modelos podados en infraestructura existente.
- Investigación sobre poda de MoE: sirve como referencia de cómo materializar pesos podados en una arquitectura estándar y medir el impacto del padding con expertos nulos.
- Pruebas de compatibilidad de toolchains: permite validar que pipelines de transformers y vLLM aceptan checkpoints con expertos de relleno sin fallos de carga.
- Experimentos académicos controlados en inglés: dado que el autor reporta degradación fuera del inglés, se puede usar en entornos de evaluación cerrados de solo inglés.
- Base para fine-tuning experimental: al tener licencia Apache-2.0 y pesos estándar, se puede adaptar en laboratorio, siempre asumiendo que parte de los parámetros son cero.
- Reproducción de la técnica de padding: el checkpoint documenta el enfoque de añadir filas de ceros y routers inactivos, útil para quien quiera replicar el proceso en otros modelos podados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: el repositorio ocupa 37,1 GB, por lo que se necesita al menos una GPU de 48 GB (A6000, L40S, A100 80 GB) para cargar los pesos completos junto con caché KV.
- GPU recomendadas: A100 80 GB o H100 80 GB para servicio con contexto largo; L40S o A6000 para pruebas puntuales.
- En GPU de consumo (RTX 4090 con 24 GB): no cabe en bf16. Se requeriría cuantización, de la que no se publican pesos y cuya viabilidad con expertos de relleno no está documentada.
- Opciones de despliegue: vLLM (comando indicado por el autor con `--max-model-len 36864`); transformers como alternativa por ser un checkpoint estándar. llama.cpp, Ollama y TGI no están documentados para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sharpen-Qwen-3.5-9B-A2.6B-Preview-padded | 18,5B reales (nombre indica 9B totales / 2,6B activos) | 36.864 | Apache-2.0 | Hugging Face, vista previa |
| Sharpen-Qwen-3.5-9B-A2.6B-Preview (base) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Qwen3.5-MoE (arquitectura de referencia) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente de que es una vista previa de investigación que inventa hechos (alucinación elevada).
- Se rompe en idiomas distintos del inglés.
- Entra en bucles en respuestas largas.
- Discrepancia entre el nombre (9B totales / 2,6B activos) y el recuento real de safetensors (18,54B), lo que puede afectar a estimaciones de memoria y a la interpretación del modelo.
- El padding introduce 582 expertos con pesos nulos; aunque el router no los selecciona según el autor, no hay validación independiente publicada.
- Sesgos conocidos: no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero el estado de vista previa y los fallos reportados desaconsejan producción.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Takenoko12345678/Sharpen-Qwen-3.5-9B-A2.6B-Preview-padded
- Modelo base: https://huggingface.co/Takenoko12345678/Sharpen-Qwen-3.5-9B-A2.6B-Preview
- Paper, blog, repositorio o demo adicionales: no disponible
