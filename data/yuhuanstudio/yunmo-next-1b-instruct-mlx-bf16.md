# yuhuanstudio/Yunmo-Next-1B-Instruct-MLX-bf16

## Resumen

Yunmo-Next-1B-Instruct-MLX-bf16 es la conversión a MLX del checkpoint Yunmo-Next-1B-Instruct, un modelo de lenguaje de 1.008.058.216 parámetros (aproximadamente 1B) desarrollado por yuhuanstudio. Está pensado para ejecutarse en Apple Silicon mediante MLX, aunque la validación publicada se realizó en Linux con los backends CUDA y CPU de MLX. El modelo parte de una arquitectura poco habitual que combina Kimi Delta Attention, grouped-query attention y depth routing, componentes que no forman parte de `mlx-lm`, por lo que el repositorio incluye una implementación MLX autocontenida en el paquete `yunmo_next_mlx/`.

El modelo está orientado a generación de texto conversacional y se distribuye con pesos BF16 sin modificar (2,0 GB). Soporta chino (incluido chino tradicional) e inglés. La licencia declarada es Apache-2.0, si bien el autor advierte de que algunas fuentes de fine-tuning imponen condiciones adicionales (uso solo de investigación, CC BY-NC-SA 4.0, CC BY-NC 4.0, AGPL-3.0) que deben revisarse antes de un uso comercial.

Es relevante ahora porque ejemplifica una tendencia de checkpoints de investigación de pequeño tamaño con arquitecturas de atención experimentales (Kimi Delta Attention) y porque el autor publica métricas de fidelidad numérica frente a la versión PyTorch en FP32, algo poco frecuente en conversiones a MLX. No obstante, el propio autor lo etiqueta explícitamente como *research checkpoint*: el modelo está a nivel de azar en preguntas de conocimiento de opción múltiple, falla a menudo en datos factuales y no tiene ajuste de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Kimi Delta Attention, grouped-query attention y depth routing |
| Parametros totales | 1.008.058.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); el autor reporta además validación de conversiones FP32, 8-bit y 4-bit en MLX |
| Idiomas soportados | zh (incluido chino tradicional), en |
| Licencia | Apache-2.0 (con condiciones adicionales en algunas fuentes de fine-tuning) |
| Formato de pesos | safetensors (BF16), librería MLX |

## Arquitectura y entrenamiento

La arquitectura combina tres elementos: Kimi Delta Attention, grouped-query attention y depth routing. El autor no detalla en esta model card la composición del dataset ni el número de tokens de entrenamiento, remitiendo al repositorio de plena precisión (Yunmo-Next-1B-Instruct) para la descripción completa del entrenamiento y la evaluación. Tampoco se especifica si hubo RLHF, DPO u otras etapas de alineación; dado que el modelo se describe como *Instruct* y sin ajuste de seguridad, es razonable asumir instrucción supervisada, pero el dato no está confirmado en la información disponible.

La innovación técnica destacable de este repositorio no es el modelo en sí, sino la implementación MLX autocontenida, necesaria porque los componentes de atención no existen en `mlx-lm`. El autor valida la fidelidad numérica frente a la versión PyTorch en FP32 mediante bits per byte sobre 50 artículos de la nueva Wikipedia en chino (artículos creados después del 2026-10-01, primeros 2.000 caracteres): MLX FP32 da 0,9174 (Δ +0,0000), BF16 0,9175 (Δ +0,0001), 8-bit 0,9175 (Δ +0,0001) y 4-bit 0,9254 (Δ +0,0080). En decodificación greedy con 64 tokens nuevos, los pesos Base en FP32, BF16 y 8-bit reproducen 64/64 tokens idénticos a PyTorch tanto en chino como en inglés; en 4-bit bajan a 27/64 en inglés. Con pesos Instruct y prompt de chat, BF16 y 8-bit reproducen 42/64 y 4-bit 19/64.

## Capacidades

- Generación de texto conversacional multi-turno en chino (incluido tradicional) e inglés.
- Plantilla de chat compatible con la de `transformers` (razonamiento desactivado), reproducible token a token mediante `encode_chat`.
- Generación con parada por tokens especiales (`<|return|>`, id 65281) y control de `max_new_tokens`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidades factuales y de conocimiento limitadas: el autor indica rendimiento a nivel de azar en opción múltiple de conocimiento.

## Casos de uso

- Investigación sobre arquitecturas de atención: el paquete `yunmo_next_mlx/` permite estudiar y modificar Kimi Delta Attention y depth routing en MLX sin depender de `mlx-lm`, útil para experimentos académicos sobre mecanismos de atención alternativos.
- Validación de conversiones MLX: el repositorio sirve como referencia para comprobar fidelidad numérica de pesos BF16, 8-bit y 4-bit frente a PyTorch FP32 mediante bits per byte y comparación de tokens greedy.
- Prototipado de pipelines de chat en chino tradicional: `encode_chat` genera exactamente los ids de la plantilla de `transformers`, lo que facilita integrar el modelo en evaluaciones de formato conversacional sin desviaciones de tokenización.
- Pruebas de decodificación y parada: el ejemplo de generación con `stop_ids` y filtrado de tokens (`t < 65280`) sirve para construir bucles de decodificación personalizados en entornos MLX.
- Docencia y demostraciones de modelos de 1B: por su tamaño (2,0 GB en BF16) y su licencia Apache-2.0, es adecuado para ejercicios sobre cuantización y comparación de precisión, no para tareas de producción.
- Evaluación de robustez y repetición: dado que el autor advierte de repeticiones hasta el límite de tokens, puede emplearse como caso de estudio para detectar bucles degenerativos en decodificación greedy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo publica métricas de fidelidad de la conversión MLX frente a PyTorch:

| Pesos MLX | Bits per byte (Base, Wikipedia china) | Δ vs PyTorch FP32 |
|---|---:|---:|
| FP32 | 0,9174 | +0,0000 |
| BF16 | 0,9175 | +0,0001 |
| 8-bit | 0,9175 | +0,0001 |
| 4-bit | 0,9254 | +0,0080 |

| Pesos MLX | Chino (Base) | Inglés (Base) | Chat (Instruct) |
|---|---:|---:|---:|
| FP32 | 64/64 | 64/64 | 64/64 |
| BF16 | 64/64 | 64/64 | 42/64 |
| 8-bit | 64/64 | 64/64 | 42/64 |
| 4-bit | 27/64 | 27/64 | 19/64 |

Los valores de la tabla de tokens indican tokens iniciales idénticos a PyTorch FP32 sobre 64 generados con decodificación greedy. El autor señala que la validación se ejecutó en Linux con los backends CUDA y CPU de MLX, y que ni la corrección ni la velocidad se han comprobado en Apple Silicon.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,0 GB para pesos BF16; en torno a 1,0 GB en 8-bit y 0,5 GB en 4-bit, sin contar overhead de activaciones y caché KV (no disponible la longitud de contexto, por lo que no puede estimarse la caché).
- GPU recomendadas: no disponible; el autor no publica requisitos de GPU. La validación se hizo con los backends CUDA y CPU de MLX en Linux.
- Cabe en GPU de consumo: sí, por tamaño (1B de parámetros), aunque no se especifican modelos concretos ni se ha verificado en Apple Silicon.
- Opciones de despliegue: MLX mediante el paquete incluido `yunmo_next_mlx` (`python -m yunmo_next_mlx.generate`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la arquitectura no está en `mlx-lm`.
- Latencia y throughput: no disponibles; el autor indica que el bucle de decodificación no está optimizado para velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Yunmo-Next-1B-Instruct-MLX-bf16 | 1.008.058.216 | no disponible | Apache-2.0 (con condiciones adicionales en fuentes de fine-tuning) | Hugging Face, MLX | Research checkpoint, sin safety tuning |
| Yunmo-Next-1B-Instruct | no disponible en la información | no disponible | Apache-2.0 | Hugging Face | Versión PyTorch de plena precisión, referencia de evaluación |
| Otros modelos de ~1B | no disponible | no disponible | no disponible | no disponible | No se han proporcionado alternativas comparables en la información |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Research checkpoint: el autor indica que el modelo está a nivel de azar en preguntas de conocimiento de opción múltiple y que a menudo falla en datos factuales.
- Repetición degenerativa: puede repetirse hasta alcanzar el límite de tokens.
- Sin ajuste de seguridad: no hay safety tuning, por lo que no es apto para aplicaciones de cara al público sin filtros adicionales.
- Sesgos: no documentados explícitamente en la información disponible.
- Riesgo de alucinación: elevado, coherente con el rendimiento a nivel de azar en conocimiento y los fallos factuales señalados por el autor.
- Idiomas: solo chino (incluido tradicional) e inglés; no se documenta soporte de castellano.
- Licencia: los pesos son Apache-2.0, pero algunas fuentes de fine-tuning imponen condiciones adicionales (AM-Thinking-v1 y destilados de AM-DeepSeek-R1: solo investigación; tw-instruct-500k: CC BY-NC-SA 4.0; no_robots: CC BY-NC 4.0; algunos subconjuntos de las trazas FABLE.5: AGPL-3.0). Revisar las secciones Data y License del repositorio de plena precisión antes de uso comercial.
- Validación incompleta en Apple Silicon: ni la corrección ni la velocidad se han comprobado en hardware de Apple, y el bucle de decodificación no está optimizado.
- Cuantización 4-bit: degradación notable en la coincidencia de tokens greedy (27/64 en inglés, 19/64 en chat) pese a una diferencia pequeña en bits per byte.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-MLX-bf16
- Modelo base de plena precisión: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct
