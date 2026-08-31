# ToPo-ToPo/Qwen3.8-Flash-Next-MTP-bf16

## Resumen

Qwen3.8-Flash-Next-MTP-bf16 es un módulo de decodificación especulativa (drafter) extraído del checkpoint oficial bf16 del modelo Qwen/Qwen3.8-Flash-Next. Publicado por el usuario ToPo-ToPo en HuggingFace, este repositorio contiene únicamente los 31 tensores `mtp.*` correspondientes a la cabeza de predicción multi-token (Multi-Token Prediction, MTP) del modelo base. Su propósito exclusivo es servir como modelo de borrador para acelerar la generación autoregresiva mediante decodificación especulativa en el ecosistema MLX, no como un modelo de generación independiente.

El modelo base Qwen3.8-Flash-Next es un modelo multimodal de tipo Mixture-of-Experts ultra disperso con 125B parámetros (6B activos por token), más una tabla de embeddings n-gram de 51B parámetros, y una ventana de contexto de 262K tokens. La arquitectura combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA) en una configuración híbrida. El drafter aquí presentado tiene 2.607.150.848 parámetros (aproximadamente 2.6B), un tamaño que lo hace ligero y adecuado para ejecutarse en memoria unificada de Apple Silicon.

Este repositorio es relevante para desarrolladores que trabajan con MLX y desean reducir la latencia de inferencia del modelo Qwen3.8-Flash-Next en hardware Apple, ya que permite implementar decodificación especulativa sin necesidad de extraer manualmente los pesos MTP. La licencia es qwen-community-1.0, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP (Multi-Token Prediction) head del modelo Qwen3.8-Flash-Next (arquitectura base: GDN + QSA híbrida) |
| Parametros totales | 2.607.150.848 |
| Parametros activos | No aplica (no es un modelo MoE independiente) |
| Longitud de contexto | no disponible (heredada del modelo base: 262K) |
| Tipos de cuantizacion | bf16 (original) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El drafter es un subconjunto de los pesos del modelo Qwen3.8-Flash-Next, concretamente la cabeza MTP que se utiliza para predecir múltiples tokens futuros en paralelo durante la decodificación especulativa. El modelo base emplea una arquitectura híbrida donde tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial de tokens, y la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de contexto largo. Además, incorpora una tabla de embeddings n-gram de 51B parámetros que complementa los embeddings tradicionales.

El entrenamiento del modelo base incluye técnicas de optimización de atención, residuales, embeddings y estabilidad de entrenamiento, según la documentación oficial de Qwen. El módulo MTP se entrena conjuntamente con el modelo principal, pero aquí solo se extrae y se publica como un artefacto independiente. No se proporcionan detalles específicos sobre el dataset de entrenamiento o el proceso de alineación (RLHF/DPO) para este drafter.

La extracción se realizó con la herramienta `Qwen4ExpMTPSplitter` de mlx-vlm (versión 0.7.0rc0), que separa los tensores `mtp.*` del checkpoint bf16 oficial. El repositorio no incluye los pesos del modelo principal, por lo que debe usarse junto con una versión cuantizada o completa de Qwen3.8-Flash-Next en MLX.

## Capacidades

- Decodificación especulativa: genera borradores de múltiples tokens (por ejemplo, bloques de 2 tokens) para acelerar la inferencia del modelo principal.
- Integración con MLX: diseñado para funcionar con `mlx-vlm` 0.7.0 o superior, específicamente con el flag `--draft-kind mtp`.
- Compatibilidad con versiones cuantizadas: el mismo drafter está incluido en los repositorios cuantizados (4-bit y 8-bit) del modelo base, por lo que no requiere descarga adicional.
- No es un modelo autónomo: no puede generar texto por sí mismo; depende del modelo principal para la verificación y aceptación de tokens.

## Casos de uso

- Aceleración de inferencia en Apple Silicon: al usar este drafter con MLX, se reduce la latencia de generación del modelo Qwen3.8-Flash-Next en Macs con memoria unificada, especialmente útil para aplicaciones interactivas de chat o agentes.
- Despliegue local de modelos grandes: el drafter permite ejecutar el modelo base (125B) en hardware de consumo con menos VRAM, ya que la decodificación especulativa reduce el número de pasos autoregresivos necesarios.
- Investigación en decodificación especulativa: sirve como referencia para estudiar la efectividad de cabezas MTP en arquitecturas híbridas GDN+QSA.
- Prototipado rápido en MLX: los desarrolladores pueden integrar el drafter en pipelines existentes de `mlx-vlm` sin necesidad de implementar la extracción manualmente.
- Optimización de costes en entornos de inferencia: al reducir el tiempo de generación, se disminuye el consumo energético y el coste por solicitud en despliegues locales o en la nube con hardware Apple.
- Evaluación de rendimiento: permite medir la mejora en tokens por segundo al comparar la generación con y sin decodificación especulativa en diferentes configuraciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este drafter en la información disponible. El modelo base Qwen3.8-Flash-Next reporta mejoras sobre versiones anteriores y supera a Claude-4.6-Opus (Max) según fuentes externas, pero no se proporcionan métricas detalladas para el módulo MTP en solitario. Para evaluar el rendimiento del drafter, se recomienda medir la tasa de aceptación de tokens y la velocidad de generación en el hardware objetivo.

## Requisitos de hardware

- VRAM estimada: el drafter en bf16 ocupa aproximadamente 5.2 GB (tamaño del repositorio). En MLX, se carga en memoria unificada, por lo que requiere al menos 8 GB de RAM en Apple Silicon para su uso conjunto con el modelo principal.
- GPUs recomendadas: no aplica para GPU NVIDIA; está diseñado para Apple Silicon (M1, M2, M3, M4) con MLX.
- Compatibilidad con hardware de consumo: sí, funciona en Macs con memoria unificada de 16 GB o más, aunque el modelo base puede requerir más memoria según la cuantización.
- Opciones de despliegue: `mlx-vlm` (vía línea de comandos o Python), con soporte para generación con `--draft-model` y `--draft-kind mtp`.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración del modelo base.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este drafter con otros módulos MTP de modelos similares (por ejemplo, el MTP de DeepSeek-V3 o el de otros modelos híbridos). El drafter es específico de Qwen3.8-Flash-Next y no es intercambiable con otros modelos. Se recomienda consultar la documentación del modelo base para conocer alternativas de decodificación especulativa en otros ecosistemas.

## Limitaciones y advertencias

- Uso exclusivo como drafter: no puede generar texto de forma independiente; intentar usarlo sin el modelo principal producirá resultados incorrectos.
- Dependencia de mlx-vlm 0.7.0+: la versión estable 0.6.17 no incluye soporte para `qwen4_exp_mtp`, por lo que se debe instalar desde la rama `main` de GitHub.
- Extracción manual necesaria para versiones cuantizadas: los repositorios cuantizados no incluyen los tensores `mtp.*` (el proceso de sanitización los elimina), por lo que se debe extraer desde el checkpoint bf16 oficial.
- Licencia qwen-community-1.0: aunque permite uso comercial, es necesario revisar los términos específicos de la licencia para asegurar el cumplimiento en aplicaciones de producción.
- Sin benchmarks propios: no hay métricas publicadas que validen la eficiencia del drafter en diferentes escenarios, por lo que se recomienda realizar pruebas locales antes de su adopción.
- Posibles sesgos del modelo base: dado que el drafter hereda los pesos del modelo base, puede reflejar sesgos presentes en el entrenamiento original, aunque al ser un componente auxiliar su impacto es indirecto.

## Enlaces

- Repositorio del drafter: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-MTP-bf16
- Modelo base (Qwen3.8-Flash-Next): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio cuantizado 4-bit: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit
- Repositorio cuantizado 8-bit: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-8bit
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de mlx-vlm: https://github.com/Blaizzy/mlx-vlm
