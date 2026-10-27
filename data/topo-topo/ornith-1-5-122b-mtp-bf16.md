# ToPo-ToPo/Ornith-1.5-122B-MTP-bf16

## Resumen

`ToPo-ToPo/Ornith-1.5-122B-MTP-bf16` no es un modelo de chat autónomo, sino un *drafter* de decodificación especulativa basado en multi-token prediction (MTP) para el modelo `ornith-ai/Ornith-1.5-122B`. Lo publica el usuario ToPo-ToPo extrayendo los pesos `mtp.*` (20 tensores) que ya vienen integrados en el checkpoint oficial, separados con mlx-vlm 0.7.6 y mlx 0.32.3, y sin cuantizar (bf16). El resultado es un artefacto de 5,0 GB y `model_type: qwen3_5_mtp` con `block_size: 3`, pensado exclusivamente para Apple Silicon a través de la librería MLX.

Su relevancia es práctica: las conversiones oficiales a MLX del modelo de 122B (MLX, MLX-8bit y MLX-4bit) no incluyen los pesos MTP, de modo que quien quiera usar decodificación especulativa con este modelo sobre un Mac necesitaba hasta ahora extraerlos por su cuenta. Este repositorio ofrece esos pesos ya separados y listos para enlazar como `--draft-model` con `--draft-kind mtp`. El beneficio es reducir la latencia de generación del modelo grande, a costa de cargar 5 GB adicionales en memoria unificada.

Conviene subrayar que el sufijo "122B" del nombre se refiere al modelo objetivo, no a este repositorio: el recuento real de parámetros según los safetensors es de 2.523.679.232 (unos 2,52 B). No funciona de forma independiente y no puede usarse como sustituto del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter MTP (multi-token prediction) para decodificación especulativa; `model_type: qwen3_5_mtp`, `block_size: 3` |
| Parametros totales | 2.523.679.232 (≈2,52 B) según safetensors del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el drafter hereda la ventana del modelo objetivo, no declarada en la información disponible) |
| Tipos de cuantizacion | Solo bf16 sin cuantizar (pesos separados tal cual del checkpoint original); el modelo objetivo dispone de conversiones MLX, MLX-8bit y MLX-4bit |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `mlx`, 20 tensores, 5,0 GB) |

## Arquitectura y entrenamiento

El artefacto es una cabeza de predicción multi-token extraída de los pesos internos `mtp.*` del checkpoint `ornith-ai/Ornith-1.5-122B`, no un modelo entrenado desde cero. La operación de separación se realizó con la utilidad `mlx_vlm.speculative.drafters.qwen3_5_mtp.split` de mlx-vlm 0.7.6 sobre mlx 0.32.3, manteniendo la precisión original en bf16 y un `block_size` de 3, es decir, la cabeza propone hasta tres tokens por paso de verificación. Al ser un componente derivado, no hay información pública sobre volumen de tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO asociadas a esta pieza.

El mecanismo es el habitual en decodificación especulativa con MTP: el drafter genera candidatos de varios tokens que el modelo objetivo valida en paralelo, aceptando el prefijo correcto y descartando el resto. La ganancia depende del régimen de aceptación, que a su vez varía con la carga de trabajo y con la cuantización del objetivo. El autor probó el drafter enlazado a una conversión de 8 bits (cuantización afina, group size 64) servida con mlx-vlm 0.7.9 y advierte explícitamente de que la aceleración debe medirse en cada caso.

## Capacidades

- Generación de candidatos multi-token para decodificación especulativa, con `block_size: 3`.
- Integración directa con `mlx_vlm.generate` mediante `--draft-model` y `--draft-kind mtp`.
- Funcionamiento exclusivamente enlazado a un modelo objetivo `ornith-ai/Ornith-1.5-122B`; sin capacidad de inferencia autónoma.
- Compatible con conversiones del objetivo en 8 bits (probado) y, en principio, con otras cuantizaciones del mismo modelo, sin garantía declarada.
- Soporte de tool calling, agentes, visión, audio o modo *thinking*: no disponible (correspondería al modelo objetivo, no al drafter).
- Capacidades multilingües: no disponible.

## Casos de uso

- Aceleración de inferencia local en Mac: enlazar el drafter al objetivo en MLX-8bit con `mlx_vlm.generate` para reducir el tiempo por token en generación de texto larga sobre memoria unificada de Apple Silicon.
- Asistentes de código interactivos en estación de trabajo Mac: la reducción de latencia por token mejora la percepción de fluidez en autocompletado y refactorización, donde el coste dominante es la decodificación autorregresiva del modelo de 122B.
- Generación por lotes en local: procesos nocturnos de resumen, traducción o clasificación de documentos que se ejecutan en un Mac Studio, donde un mayor throughput por token se traduce directamente en menos horas de cómputo.
- Investigación en decodificación especulativa: permite reproducir y medir tasas de aceptación de una cabeza MTP real frente a drafters alternativos (modelos pequeños independientes, EAGLE, Medusa) sobre el mismo objetivo.
- Evaluación comparativa de cuantizaciones: útil para medir cómo cambia la tasa de aceptación del drafter según el objetivo esté en 8 bits o 4 bits, un dato relevante para elegir el compromiso calidad/velocidad en producción.
- Despliegue de bajo volumen en hardware de sobremesa: servicios internos o demos con pocos usuarios concurrentes que no justifican GPUs dedicadas y prefieren aprovechar un Mac con memoria unificada grande.
- Cadena de herramientas de desarrollo MLX: sirve como pieza de referencia para integrar decodificación especulativa en pipelines propios construidos sobre mlx-vlm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de velocidad, tasa de aceptación ni comparaciones cuantitativas; se limita a indicar que la aceleración depende del hardware, la cuantización del objetivo, la carga de trabajo y la versión de mlx-vlm, y que debe medirse por cuenta del usuario.

## Requisitos de hardware

- VRAM/memoria: 5,0 GB en bf16 solo para el drafter, que se suman a la memoria del modelo objetivo. Como referencia aritmética (no confirmada en la información disponible), un objetivo de 122B en 8 bits ronda los 122 GB y en 4 bits los 61 GB, por lo que el conjunto exige memoria unificada muy amplia.
- GPU: exclusivamente Apple Silicon (MLX). No hay soporte declarado para CUDA, ROCm ni aceleradores tipo A100/H100 con este formato.
- Consumer GPU: no aplica; el repositorio no está pensado para GPUs de consumo NVIDIA/AMD. En el ecosistema Mac, requiere equipos con memoria unificada suficiente para el objetivo: Mac Studio de gama alta o configuraciones equivalentes; improbable en portátiles de gama baja.
- Despliegue: mlx-vlm (probado con 0.7.9; separación con 0.7.6 y mlx 0.32.3). No hay pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas; vLLM y TGI no soportan este formato.
- Latencia y throughput: no disponible. La model card no publica mediciones y recomienda instrumentar la carga real antes de asumir ninguna ganancia.

## Comparativa con modelos similares

| Alternativa | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-MTP-bf16 (este) | Drafter MTP para MLX | ≈2,52 B | No disponible | MIT | HuggingFace, MLX |
| Ornith-1.5-122B sin drafter | Objetivo, decodificación estándar | 122 B (según nombre del modelo) | No disponible | No disponible en la información | HuggingFace, MLX/8bit/4bit |
| Drafter LM pequeño independiente | Decodificación especulativa clásica | Típicamente <1 B | No disponible | Variable | Amplia |
| Cabezas EAGLE-3 / Medusa | Decodificación especulativa entrenada | No disponible | No disponible | Variable | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada; la comparación es estructural, no de velocidad.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo `ornith-ai/Ornith-1.5-122B` enlazado no produce resultados útiles.
- Dependencia dura del ecosistema MLX y de Apple Silicon; no hay ruta de despliegue en GPU NVIDIA o AMD con este repositorio.
- Requiere versiones concretas de mlx-vlm y mlx para la separación y el enlace; cambios de versión pueden alterar el comportamiento o la ganancia.
- Sin métricas publicadas: cualquier expectativa de aceleración es una hipótesis hasta medirla en la carga real.
- Trazabilidad limitada: es una extracción de pesos de un tercero, no una publicación oficial de ornith-ai, con 0 descargas y 0 likes en el momento de la consulta.
- Idiomas soportados no declarados; la cobertura lingüística efectiva dependerá del modelo objetivo.
- Licencia MIT para este artefacto, pero conviene verificar la licencia del modelo base antes de uso comercial, ya que el repositorio enlaza al LICENSE del objetivo.
- Riesgo de alucinación y sesgos: no evaluables a nivel de drafter; heredados del objetivo y de su proceso de alineamiento.
- Uso en producción: el drafter no modifica la distribución de salida si la verificación es correcta, pero un fallo de integración o un drafter mal emparejado puede degradar la calidad o anular la ganancia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ToPo-ToPo/Ornith-1.5-122B-MTP-bf16
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Conversión MLX del objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-122B-MLX
- Conversión MLX-8bit del objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-122B-MLX-8bit
- Conversión MLX-4bit del objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-122B-MLX-4bit
- Papers, blogs, repositorios o demos adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos corresponden a una revista de cómic, un diccionario, una marca de mochilas y una marca de zapatillas).
