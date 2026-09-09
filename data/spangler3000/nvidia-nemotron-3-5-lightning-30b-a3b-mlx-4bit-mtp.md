# Spangler3000/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-4bit-mtp

## Resumen

El repositorio `Spangler3000/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-4bit-mtp` contiene una conversión local MLX del modelo híbrido NVIDIA Nemotron 3.5 Lightning 30B-A3B, preparada por Jonathan Spangler (proyecto Darkbloom) como artefacto fuente para el desarrollo de un runtime nativo. El modelo base de NVIDIA utiliza una arquitectura híbrida que intercala capas Mamba2, capas de atención selecta y capas Mixture-of-Experts (MoE), con 32.913.261.824 parámetros totales y una designación nominal A3B de 3 mil millones de parámetros activos.

Esta conversión preserva la cabeza de predicción multi-token (MTP) del checkpoint original, de modo que no se necesita descargar un modelo draft separado para la decodificación especulativa. Los pesos se han cuantizado en MLX affine de 4 bits con grupo de 64, manteniendo normalización, routers y otras capas no cuantizadas en su precisión nativa. El repositorio se presenta como artefacto para ingeniería de Darkbloom y no como un modelo listo para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida `nemotron_h`: capas Mamba2 intercaladas, capas de atención selecta y capas MoE |
| Parámetros totales | 32.913.261.824 |
| Parámetros activos | No disponible en la información proporcionada; el modelo base se designa como A3B (3 mil millones nominales) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX affine 4 bits (grupo 64); normalización y routers en precisión nativa |
| Idiomas soportados | inglés, español, francés, alemán, italiano, japonés |
| Licencia | OpenMDW 1.1 (heredada de NVIDIA) |
| Formato de pesos | safetensors (con cuantización MLX) |
| Peso almacenado | 18,5 GB (aprox. 17,25 GiB) |
| Parámetros indexados | 763 arrays, incluyendo 34 arrays MTP |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 |
| Soporte MTP | Sí, cabeza de predicción multi-token embebida |

## Arquitectura y entrenamiento

La arquitectura del modelo original es `nemotron_h`, una variante híbrida denominada así por NVIDIA. Intercala capas de Mamba2, un modelo de espacio de estados (SSM) con coste lineal en longitud de secuencia, con capas de atención selecta y capas MoE. Este diseño reduce la carga computacional frente a un transformer denso de tamaño equivalente, a la vez que mantiene capacidad de razonamiento mediante los expertos activados.

La conversión incluye la cabeza MTP del checkpoint oficial, que originalmente contiene 270 tensores `mtp.*`, preservados como 34 arrays de parámetros MLX tras apilar los expertos encaminados y añadir escalas y offsets de cuantización. La capa de predicción MTP consta de un bloque de atención seguido de un bloque MoE. Combina la siguiente token embedding normalizada con los hidden states normalizados tras `norm_f`, aplica `eh_proj`, bloques residuales y una normalización final, compartiendo las embeddings de salida del modelo. Para que el MTP funcione, el runtime debe cargar la cabeza, generar tokens draft y verificar o revertir el estado de atención y Mamba. En runtimes sin soporte, el modelo puede ejecutarse de forma serial ignorando la cabeza.

No se ha proporcionado información sobre el número de tokens de entrenamiento, la composición del dataset ni técnicas de alineación como RLHF o DPO. Estos datos están disponibles en la ficha del modelo base de NVIDIA.

## Capacidades

- Generación de texto conversacional en seis idiomas: inglés, español, francés, alemán, italiano y japonés.
- Multi-token prediction embebida, orientada a decodificación especulativa sin necesidad de un modelo draft separado.
- Inferencia local en Apple Silicon mediante MLX, sin dependencias de servicios externos.
- Compatibilidad con runtimes que soporten la arquitectura `nemotron_h` y la cuantización MLX affine.
- Capacidades de tool calling, agentes o visión no especificadas en la información disponible; se presuponen las del modelo base, pero no se han verificado en esta conversión.

## Casos de uso

- Asistentes conversacionales multilingües en Apple Silicon: gracias a la cuantización MLX 4-bit y el soporte de seis idiomas, el modelo puede ejecutarse en Macs con memoria unificada suficiente para generar respuestas en entornos locales.
- Experimentación con decodificación especulativa: el MTP embebido permite probar la predicción multi-token en un entorno de desarrollo sin necesidad de descargar un modelo draft adicional.
- Procesamiento de texto privado en el borde: al ser una conversión local, es adecuada para aplicaciones que requieren que los datos no salgan del dispositivo o de la infraestructura del cliente.
- Investigación en arquitecturas híbridas SSM + MoE: el modelo ofrece un punto de partida para analizar el comportamiento de Mamba2 y los expertos en un checkpoint concreto, con pesos cuantizados que facilitan la experimentación en estaciones de trabajo con capacidad limitada.
- Generación de documentación técnica y contenido en varios idiomas: el soporte de inglés, español, francés, alemán, italiano y japonés permite producir borradores de textos técnicos en entornos sin conexión.
- Automatización de tareas de resumen y extracción de información en pipelines internos: la ejecución local vía MLX permite integrar el modelo en flujos de trabajo con restricciones de privacidad, siempre que el runtime utilizado soporte la arquitectura y la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las comprobaciones de validación realizadas por el autor (comprobaciones de carga, coincidencia de tokens de referencia entre Python y Swift, y pruebas de aislamiento de peticiones) no constituyen un benchmark de calidad ni una reclamación de velocidad. No se aportan puntuaciones de MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada: se requieren aproximadamente 18,5 GB para los pesos cuantizados; sumando la caché KV y otros overheads, se recomienda disponer de al menos 24 GB de memoria.
- GPU recomendadas: esta conversión está diseñada para MLX, por lo que el objetivo principal son los chips Apple Silicon (M-series). Se recomienda al menos 24 GB de memoria unificada en Macs.
- Compatibilidad con consumer GPU: una GPU de consumidor con 24 GB de VRAM (por ejemplo, RTX 4090) podría alojar los pesos, pero el formato MLX no está pensado para ejecución CUDA nativa y requeriría un runtime adaptado.
- Opciones de despliegue: MLX-LM (con soporte para Nemotron 3.5 Lightning) y el runtime Darkbloom en desarrollo. llama.cpp no es aplicable a este formato MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información disponible no incluye datos de rendimiento comparativos entre modelos de la misma categoría. No obstante, se pueden comparar aspectos técnicos entre este repositorio y las versiones publicadas por NVIDIA:

| Modelo | Parámetros totales | Cuantización | Soporte MTP | Licencia |
|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B-A3B (BF16) | 32.913.261.824 | BF16 | Sí (270 tensores `mtp.*`) | OpenMDW 1.1 |
| Nemotron 3.5 Lightning 30B-A3B (NVFP4) | 32.913.261.824 | NVFP4 | Sí | OpenMDW 1.1 |
| Conversión MLX 4-bit (este repo) | 32.913.261.824 | MLX affine 4-bit (grupo 64) | Sí (34 arrays MTP) | OpenMDW 1.1 |

Los tres casos comparten la misma arquitectura y licencia, pero difieren en el formato de pesos y en el entorno de ejecución previsto. No se dispone de puntuaciones de benchmarks que permitan comparar su rendimiento real.

## Limitaciones y advertencias

- No es un lanzamiento oficial de NVIDIA. La conversión ha sido realizada por Jonathan Spangler / Darkbloom y el repositorio se describe como un artefacto fuente para trabajo de runtime.
- La licencia es OpenMDW 1.1, que puede imponer condiciones específicas para uso comercial. Es necesario revisar el texto completo de la licencia antes de cualquier despliegue.
- La longitud de contexto no se especifica en la información disponible.
- No hay benchmarks públicos que validen la calidad del modelo tras la cuantización. Las comprobaciones del autor se limitan a la carga correcta de los pesos y a la coincidencia de tokens de referencia entre Python y Swift, sin garantías de rendimiento ni de precisión.
- El MTP embebido solo funciona en runtimes que lo soporten. En runtimes sin soporte, la cabeza MTP se ignora y se usa la decodificación serial.
- Se han observado diferencias numéricas en hidden states y logits entre las implementaciones Python y Swift, aunque los draft IDs coinciden. Esto implica que no hay una garantía de aritmética idéntica entre runtimes.
- Los idiomas soportados se limitan a seis: inglés, español, francés, alemán, italiano y japonés.
- Como cualquier modelo de lenguaje generativo, puede producir alucinaciones. No se ha proporcionado ninguna evaluación de seguridad o alineación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Spangler3000/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-4bit-mtp
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Versión NVFP4 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Implementación de referencia oMLX para Nemotron MTP: https://github.com/jundot/omlx/blob/main/omlx/patches/mlx_lm_mtp/nemotron_h_model.py
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
