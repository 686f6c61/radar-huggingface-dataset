# suvadityamuk/gso-footwear-maintest-test-trellis2-lora

## Resumen

El modelo `suvadityamuk/gso-footwear-maintest-test-trellis2-lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para el modelo base `microsoft/TRELLIS.2-4B`, un sistema de generación 3D a partir de imágenes (image-to-3D). El adaptador ha sido entrenado por el usuario suvadityamuk mediante la herramienta `trellis2-train` sobre un conjunto de datos de latentes específico de calzado (`gso-footwear-trellis2-latents`), lo que sugiere un ajuste fino orientado a la generación de modelos 3D de calzado.

Se trata de un adaptador de bajo rango (rank 16, alpha 32) que se inyecta en el módulo de flujo de forma (`shape flow`) del modelo base, concretamente en el DiT (Diffusion Transformer) de 1.3B parámetros que opera a resolución 512. El adaptador modifica únicamente las capas de atención (`to_qkv`, `to_out`, `to_q`, `to_kv`), lo que permite especializar el modelo base en un dominio concreto sin necesidad de reentrenar los 4B parámetros completos.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino con 0 descargas y 0 likes, entrenado durante solo 20 pasos con un batch efectivo de 4. No obstante, ilustra el flujo de trabajo típico de especialización de modelos generativos 3D mediante PEFT y LoRA, un patrón cada vez más común en la comunidad open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Diffusion Transformer (DiT) del modelo base TRELLIS.2-4B |
| Parametros totales | No disponible (el adaptador LoRA es de rango 16; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors bf16) |
| Idiomas soportados | No disponible (modelo image-to-3D, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`shape_lora/adapter-<step>.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el módulo `slat_flow_img2shape_dit_1_3B_512_bf16` del modelo base TRELLIS.2-4B, un Diffusion Transformer de 1.3B parámetros que genera representaciones latentes 3D (SLAT, Structured Latent) a partir de imágenes de entrada a resolución 512. La técnica LoRA inyecta matrices de bajo rango en las proyecciones de atención del transformer, con r=16 y alpha=32, sobre los módulos `to_qkv`, `to_out`, `to_q` y `to_kv`.

El entrenamiento se realizó con la herramienta `trellis2-train` sobre el dataset `suvadityamuk/gso-footwear-trellis2-latents`, que contiene latentes precalculados de objetos de calzado del dataset GSO (Google Scanned Objects). Se llevaron a cabo 20 pasos con batch 1 x 4 (batch efectivo 4) y learning rate 0.0001, guardando checkpoints cada 10 pasos. No se dispone de información sobre la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de difusión 3D).

## Capacidades

- Generación de mallas 3D (image-to-3D) especializada en calzado, gracias al ajuste fino sobre latentes de GSO footwear.
- Inyección como adaptador PEFT sobre el modelo base TRELLIS.2-4B mediante `peft.LoraConfig` e `inject_adapter_in_model`.
- Compatible con el pipeline de inferencia de TRELLIS.2 para generación de formas 3D a partir de una única imagen.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo lingüístico).
- No dispone de capacidades multilingües ni de modo thinking.
- Capacidad de especialización de dominio limitada al dataset de entrenamiento (calzado).

## Casos de uso

- Prototipado rápido de activos 3D de calzado: el adaptador permite generar mallas 3D de zapatos a partir de fotografías, útil para pipelines de diseño de producto o e-commerce que necesiten vistas 3D de catálogo.
- Investigación en PEFT para modelos generativos 3D: sirve como ejemplo reproducible de cómo inyectar un LoRA en el DiT de TRELLIS.2 y entrenarlo con `trellis2-train` sobre latentes precalculados.
- Aumento de datos sintéticos 3D: generar variaciones de modelos de calzado para entrenar otros sistemas de visión o robótica que requieran activos 3D diversos.
- Pruebas de concepto de especialización de dominio: el flujo (dataset de latentes + LoRA de rango 16 + 20 pasos) es replicable para otros dominios de objetos con pocos recursos de cómputo.
- Evaluación comparativa de adaptadores: al guardar checkpoints cada 10 pasos, permite estudiar la evolución del ajuste fino en un régimen de entrenamiento muy corto.
- Integración en herramientas de diseño 3D asistido: combinado con el modelo base, puede alimentar visores o motores de renderizado que consuman mallas generadas a partir de imágenes de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.1 GB en disco; el modelo base TRELLIS.2-4B requiere VRAM adicional no especificada en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada; el modelo base TRELLIS.2-4B, por su tamaño (4B parámetros) y su naturaleza de difusión 3D, probablemente requiere GPUs de gama alta (A100, H100 o RTX 4090), pero este dato no se confirma en la documentación.
- No se dispone de información sobre si cabe en GPU de consumo.
- Opciones de despliegue: el adaptador se carga mediante la librería `peft` (PyTorch) e `inject_adapter_in_model`; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión 3D).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gso-footwear-maintest-test-trellis2-lora (este) | LoRA r=16 sobre base 4B | No disponible | Image-to-3D (calzado) | No disponible | Hugging Face, 0 descargas |
| microsoft/TRELLIS.2-4B (base) | 4B | No disponible | Image-to-3D general | No disponible | Hugging Face (modelo base) |
| Otros adaptadores LoRA de TRELLIS.2 | No disponible | No disponible | Image-to-3D especializado | No disponible | No disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (adaptadores LoRA para generación 3D) más allá del propio modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador está entrenado exclusivamente sobre latentes de calzado del dataset GSO, por lo que su rendimiento fuera de ese dominio será deficiente.
- Riesgo de alucinación geométrica: como todo modelo generativo 3D, puede producir mallas con topología incorrecta, agujeros o artefactos, especialmente con imágenes de entrada fuera de distribución.
- Entrenamiento muy corto (20 pasos, batch efectivo 4): es probable que el adaptador esté infraentrenado y no represente una especialización robusta.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni del modelo base; es imprescindible verificar la licencia de `microsoft/TRELLIS.2-4B` antes de cualquier uso en producción.
- Sin datos de benchmarks ni evaluación cuantitativa: no hay evidencia publicada de calidad de generación.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni soporte.
- No es un modelo lingüístico: no soporta idiomas, tool calling ni agentes; cualquier expectativa en ese sentido es incorrecta.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/suvadityamuk/gso-footwear-maintest-test-trellis2-lora
- Modelo base: https://huggingface.co/microsoft/TRELLIS.2-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/suvadityamuk/gso-footwear-trellis2-latents
- Herramienta de entrenamiento `trellis2-train`: no disponible (no se proporciona enlace)
- Paper de TRELLIS: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
