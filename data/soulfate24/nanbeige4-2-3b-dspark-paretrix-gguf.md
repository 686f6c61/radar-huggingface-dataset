# Soulfate24/Nanbeige4.2-3B-DSpark-Paretrix-GGUF

## Resumen

Nanbeige4.2-3B-DSpark-Paretrix-GGUF es un conjunto de cuantizaciones GGUF del modelo base Nanbeige/Nanbeige4.2-3B, publicadas por el usuario Soulfate24 bajo el marco de trabajo que denomina Paretrix Quantization Suite. No se trata de un modelo original entrenado desde cero, sino de una redistribución optimizada del checkpoint de Nanbeige con un módulo de decodificación especulativa (DSpark) integrado como draft. El objetivo es ofrecer variantes de peso reducido que preserven la fidelidad de logits respecto al modelo en BF16, empleando una planificación por clases de tensores en lugar de una cuantización uniforme.

El modelo base declara 4.169.800.704 parámetros reales según los safetensors del repositorio, pese a la denominación comercial "3B". Está orientado a generación de texto conversacional y soporta inglés y chino. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución de dicha licencia.

La relevancia actual de esta ficha reside en su enfoque metodológico: cada variante (denominada "rung") se planifica midiendo el impacto de mover cada clase de tensor a cada tipo de cuantización, comparando contra los logits en BF16, y resolviendo una mochila exacta para asignar el presupuesto de bits. El resultado son 12 variantes con perfiles de compromiso tamaño/fidelidad documentados con métricas de perplejidad, KLD y RMS de probabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles de capas y atención no disponibles) |
| Parametros totales | 4.169.800.704 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el regimen de veredicto usado para las mediciones es ctx 4096 x8 |
| Tipos de cuantizacion | GGUF híbridos: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc; bases stock Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de 47,6 GB con múltiples variantes); el modelo base original en safetensors |
| Modelo base | Nanbeige/Nanbeige4.2-3B y Nanbeige/Nanbeige4.2-3B-DSpark |
| Motor de cuantizacion | llama.cpp / gguf-py |
| Regimen de evaluacion | ctx 4096 x8 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Nanbeige4.2-3B: no se especifican número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento. Lo que sí se documenta es el proceso de cuantización, que constituye la innovación técnica de esta publicación. Paretrix parte de tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx) y, para cada clase de tensor, mide de forma aislada el efecto de moverla a cada tipo de cuantización disponible, comparando contra los logits de referencia en BF16. Con esas mediciones construye una matriz de coste/beneficio y resuelve una mochila exacta para planificar cada variante. Finalmente, un duelo contra el campeón vigente en el régimen de veredicto (ctx 4096 x8) decide si el plan sustituye al campeón.

El componente DSpark actúa como módulo de decodificación especulativa (draft), lo que permite acelerar la generación al proponer tokens que el modelo principal verifica. La model card indica que lo medido en un modelo se hereda al siguiente de la misma familia, lo que sugiere una metodología transferible, aunque no se aportan detalles sobre el entrenamiento del draft ni sobre el volumen de datos usado para calibrar las activaciones.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y respuesta multi-turno (pipeline declarado: text-generation, tag conversational).
- Decodificación especulativa mediante el módulo DSpark, orientada a reducir latencia de generación.
- Compatibilidad con llama.cpp y con el ecosistema GGUF, lo que habilita despliegue en CPU, GPU y entornos mixtos.
- Integración con endpoints compatibles (tag endpoints_compatible).
- No se documentan capacidades de visión, audio, tool calling ni modo thinking en la información proporcionada.

## Casos de uso

- Despliegue en hardware de gama baja: las variantes Femto-21pc (1769 MiB) y Pico-24pc (2004 MiB) permiten ejecutar un modelo de 4,17 mil millones de parámetros en equipos con poca VRAM o incluso en CPU, manteniendo un KLD de 0,5085 y 0,2969 respectivamente frente a BF16.
- Servicio conversacional en chino e inglés: el soporte nativo de ambos idiomas y la naturaleza conversacional del checkpoint lo hacen adecuado para asistentes multi-turno en aplicaciones bilingües.
- Aceleración de inferencia con decodificación especulativa: el módulo DSpark incluido permite reducir la latencia por token en pipelines de generación, útil en aplicaciones interactivas donde el tiempo de respuesta es crítico.
- Evaluación de metodologías de cuantización: las 12 variantes con métricas de PPL, KLD y RMS Δp publicadas constituyen un banco de pruebas para investigadores que comparan esquemas de cuantización híbrida frente a cuantización uniforme.
- Prototipado rápido en entornos con restricciones de memoria: la variante Precision-42pc (3412 MiB, KLD 0,0344) ofrece un equilibrio cercano a Q6_K-imx (3266 MiB, KLD 0,0451) con menor huella y mejor fidelidad de distribución.
- Investigación sobre decodificación especulativa: el par modelo base + draft DSpark permite estudiar la tasa de aceptación y el speedup en distintos regímenes de contexto sin necesidad de entrenar un draft propio.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de fidelidad de cuantización, no benchmarks de capacidad (MMLU, HumanEval, GSM8K). Se reproducen a continuación:

| Variante | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 4229 | 31,6031 | +1,6930 | 0,0154 | 3,13% | 95,5% |
| Fidelity-48pc | 3822 | 31,5988 | +1,6887 | 0,0206 | 3,54% | 94,6% |
| Precision-42pc | 3412 | 31,9824 | +2,0723 | 0,0344 | 4,29% | 92,7% |
| Q6_K-imx (stock) | 3266 | 31,9481 | +2,0380 | 0,0451 | 4,86% | 92,1% |
| Quality-36pc | 2932 | 31,6147 | +1,7045 | 0,0577 | 5,58% | 90,1% |
| Q5_K_M-imx (stock) | 2849 | 32,1203 | +2,2101 | 0,0719 | 5,98% | 89,3% |
| Compact-33pc | 2697 | 32,3483 | +2,4381 | 0,1055 | 7,47% | 87,2% |
| Mini-30pc | 2458 | 32,1195 | +2,2094 | 0,1287 | 7,93% | 85,4% |
| IQ4_XS-imx (stock) | 2268 | 32,6725 | +2,7624 | 0,1971 | 9,76% | 82,2% |
| Nano-27pc | 2231 | 32,5803 | +2,6701 | 0,1849 | 9,54% | 82,5% |
| Pico-24pc | 2004 | 34,5682 | +4,6581 | 0,2969 | 12,01% | 76,8% |
| IQ3_M-imx (stock) | 1985 | 33,2823 | +3,3722 | 0,4923 | 15,06% | 71,5% |
| Femto-21pc | 1769 | 33,8955 | +3,9854 | 0,5085 | 15,42% | 68,6% |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada de inferencia: entre 1769 MiB (Femto-21pc) y 4229 MiB (Q8_0), según la variante elegida.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre para las variantes pequeñas; 4 GB o más para Q8_0 o Fidelity-48pc. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs de consumo con 4 GB o más de VRAM; las variantes Femto-21pc y Pico-24pc pueden ejecutarse incluso en iGPU o CPU.
- Opciones de despliegue: llama.cpp (motor de cuantización declarado) y cualquier runtime compatible con GGUF; también se etiqueta como compatible con endpoints.
- Latencia y throughput: no disponibles. El módulo DSpark está orientado a decodificación especulativa, pero no se publican cifras de speedup ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Nanbeige4.2-3B-DSpark-Paretrix (esta ficha) | 4,17 B | no disponible | Apache 2.0 | GGUF híbrido | 12 variantes con métricas de fidelidad publicadas |
| Nanbeige/Nanbeige4.2-3B (base) | 4,17 B | no disponible | Apache 2.0 | safetensors | Checkpoint original sin cuantizar |
| Nanbeige/Nanbeige4.2-3B-DSpark (base) | no disponible | no disponible | no disponible | no disponible | Variante con draft de decodificación especulativa |

No se dispone de datos de benchmarks de capacidad que permitan comparar el rendimiento cualitativo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- No se han publicado evaluaciones de capacidad (razonamiento, código, matemáticas); las métricas disponibles miden únicamente fidelidad de cuantización.
- El modelo base declara 4,17 mil millones de parámetros pese a la denominación "3B", lo que puede inducir a error en estimaciones de memoria.
- Solo se declaran inglés y chino; no hay evidencia de soporte multilingüe adicional.
- La longitud de contexto no está documentada; el régimen de evaluación usado (ctx 4096 x8) no debe interpretarse como el máximo soportado.
- Las variantes de menor tamaño (Femto-21pc, Pico-24pc) presentan degradaciones notables: KLD de 0,5085 y 0,2969 frente a 0,0154 de Q8_0, y top-p de 68,6% y 76,8%, lo que puede afectar a la coherencia en generación larga.
- Riesgo de alucinación inherente a modelos de este tamaño; no se documentan mitigaciones específicas.
- Sesgos: no se aporta información sobre composición del dataset ni evaluaciones de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original y del módulo DSpark por separado.
- El repositorio tiene 47,6 GB; descargar todas las variantes puede ser costoso en almacenamiento.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/Soulfate24/Nanbeige4.2-3B-DSpark-Paretrix-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Modelo base con DSpark: https://huggingface.co/Nanbeige/Nanbeige4.2-3B-DSpark
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- llama.cpp: https://github.com/ggml-org/llama.cpp
