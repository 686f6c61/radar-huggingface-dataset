# yava-code/Tessera-1B-Nano-Base

## Resumen

Tessera-1B-Nano-Base es un modelo de lenguaje causal de tipo base (no instruido) desarrollado por yava-code, publicado bajo el paraguas de Paragon Intelligence Labs. Se trata del brazo de control de un experimento controlado sobre predicción de conceptos: parte del backbone intacto de HuggingFaceTB/SmolLM2-360M y lo somete a un continued-pretraining de aproximadamente mil millones de tokens sin ninguna modificación arquitectónica, sin ruta de conceptos y sin parámetros adicionales. Su función no es rendir mejor que nadie, sino servir de vara de medir frente a su hermano Tessera-1B-Nano, que sí incorpora una ruta de conceptos.

El modelo conserva la arquitectura transformer causal de SmolLM2 y cuenta con 361.821.120 parámetros reales según los pesos en safetensors, pese a que el nombre comercial lo etiquete como "1B" (la cifra hace referencia al presupuesto de tokens de entrenamiento, no al tamaño del modelo). El repositorio ocupa 1,4 GB y se distribuye en formato safetensors para la librería transformers.

Su relevancia es metodológica: publica de forma transparente el registro completo de entrenamiento (hashes SHA256 de la caché empaquetada, log de métricas, estado del trainer y evaluaciones de intervención en JSON) junto con los checkpoints, algo poco habitual en modelos de este tamaño. Para desarrolladores e investigadores que quieran reproducir experimentos de continued-pretraining o auditar comparaciones entre arquitecturas, es un artefacto de referencia útil, no un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (backbone SmolLM2), sin ruta de conceptos |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM2-360M |
| Tokens de entrenamiento | 999.948.288 |
| Perdida NTP held-out | 2,5135 |
| Perplejidad held-out | 12,3485 |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar que reutiliza el backbone de SmolLM2-360M sin alteraciones. La model card lo describe explícitamente como la mitad "plana" del experimento: mismo corpus, mismo orden de tokens y misma inicialización que el brazo con conceptos, sin reinicios ni valores NaN durante el entrenamiento. No incorpora decodificación especulativa, atención lineal ni ninguna innovación de inferencia; la innovación, si existe, reside en el diseño experimental, no en el modelo.

El entrenamiento consistió en un continued-pretraining de 999.948.288 tokens con pérdida de next-token prediction (NTP) exclusivamente. El coste de cómputo registrado se estima en 24,88 dólares. La model card menciona parámetros de una arquitectura ConceptLM (chunk size 4, product code de 15 segmentos x 64 entradas, 2 bloques causales de concepto, inyección antes del bloque 2 del decodificador de tokens y pérdida L_ntp + 1 L_ncp + 1 L_vq), pero esos componentes pertenecen al brazo con conceptos; en este checkpoint no están activos, ya que se describe como "sin ruta de conceptos, sin parámetros extra". No se detalla la composición del corpus ni si hubo RLHF o DPO; la procedencia se remite a los hashes y registros del repositorio ncp-smol.

## Capacidades

- Generación de texto autoregresiva básica, heredada del backbone SmolLM2-360M.
- Modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo "thinking", visión, audio ni otras capacidades especiales.
- Utilidad principal como baseline de referencia para comparaciones controladas de entrenamiento.

## Casos de uso

- Baseline de comparación en investigación: sirve como control NTP-only frente a Tessera-1B-Nano para aislar el efecto de la ruta de conceptos en el mismo corpus y la misma inicialización.
- Reproducción de experimentos de continued-pretraining: el repositorio incluye hashes de la caché empaquetada, log de métricas y estado del trainer, lo que permite auditar y replicar el pipeline con SmolLM2-360M.
- Estudio de curvas de pérdida y perplejidad: con una pérdida held-out de 2,5135 y perplejidad de 12,3485 publicadas, es útil para calibrar expectativas en entrenamientos de ~1B tokens sobre modelos de ~360M parámetros.
- Docencia y formación en metodología de ML: ejemplo de diseño experimental con brazo de control, artefactos versionados y coste de cómputo declarado (24,88 dólares).
- Pruebas de infraestructura de inferencia: al ser un modelo pequeño en safetensors y compatible con transformers y text-generation-inference, sirve para validar pipelines de despliegue antes de escalar a modelos mayores.
- Generación de texto exploratoria en entornos con recursos limitados: 361,8M parámetros permiten ejecución en CPU o GPU de gama baja para experimentos cualitativos, sin expectativas de calidad de asistente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Perdida NTP held-out | 2,5135 |
| Perplejidad held-out | 12,3485 |
| Tokens de entrenamiento | 999.948.288 |
| Coste de computo estimado | 24,88 USD |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo reporta métricas internas de entrenamiento y evaluación de intervención, sin comparación numérica con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,7-0,8 GB solo para pesos; con caché KV y overhead del runtime, aproximadamente 1,5-2 GB.
- En cuantización de 8 bits o 4 bits, el modelo cabría holgadamente en GPUs de consumo con 4-6 GB de VRAM; los tipos de cuantización concretos no están documentados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100 o H100, aunque sobredimensionadas para este tamaño.
- Ejecución en CPU viable para pruebas y generación de baja concurrencia.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta endpoints_compatible) y, presumiblemente, llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta su disponibilidad.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| Tessera-1B-Nano-Base | 361,8M | no disponible | apache-2.0 | Baseline NTP-only, 1B tokens de continued-pretraining |
| HuggingFaceTB/SmolLM2-360M | 361,8M | no disponible | apache-2.0 | Modelo base del que deriva; sin continued-pretraining adicional |
| Tessera-1B-Nano | no disponible | no disponible | apache-2.0 | Brazo con ruta de conceptos del mismo experimento |
| Tessera-135M-Gate | 135M (aprox.) | no disponible | apache-2.0 | Gate arquitectónico sobrentrenado del mismo estudio |

La comparación relevante es interna al estudio: Tessera-1B-Nano-Base frente a Tessera-1B-Nano, con idénticos datos e inicialización. Frente a SmolLM2-360M original, la diferencia es el continued-pretraining de mil millones de tokens. No se dispone de datos de rendimiento frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no debe usarse como asistente conversacional ni esperar que siga instrucciones.
- Riesgo elevado de alucinación y de generación incoherente en tareas abiertas, propio de un modelo de 361,8M parámetros con entrenamiento limitado.
- No hay información sobre sesgos; cabe esperar los sesgos del corpus de SmolLM2 y del corpus de continued-pretraining, no documentado en la información disponible.
- Longitud de contexto no documentada: no se puede garantizar el manejo de secuencias largas.
- Idiomas soportados no documentados; el rendimiento fuera del inglés es incierto.
- La licencia apache-2.0 permite uso comercial, pero el modelo no está pensado para producción y su calidad en tareas reales es limitada.
- El nombre "1B" puede inducir a error: se refiere a tokens de entrenamiento, no a parámetros del modelo.
- La model card está redactada como artefacto de investigación; no incluye guías de uso responsable ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yava-code/Tessera-1B-Nano-Base
- Repositorio del estudio: https://github.com/yava-code/Tessera-1B-Nano
- Espacio de comparación: https://huggingface.co/spaces/yava-code/tessera-comparison
- Brazo con conceptos: https://huggingface.co/yava-code/Tessera-1B-Nano
- Gate arquitectónico: https://huggingface.co/yava-code/Tessera-135M-Gate
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Paper ConceptLM: https://arxiv.org/abs/2602.08984
- Paper NCP-ArchPreview: https://arxiv.org/abs/2609.10715
- Demo en vídeo: https://huggingface.co/yava-code/Tessera-1B-Nano/resolve/main/demo.mp4
