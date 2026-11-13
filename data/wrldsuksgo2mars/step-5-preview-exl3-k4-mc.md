# wrldsuksgo2mars/Step-5-Preview-EXL3-K4-MC

## Resumen

Step-5-Preview-EXL3-K4-MC es una cuantización de 4 bits del modelo multimodal Step-5-Preview-BF16, desarrollada por el usuario wrldsuksgo2mars a partir del checkpoint original de stepfun-ai. Se trata de un modelo de imagen-a-texto (image-text-to-text) con 170.384.190.272 parámetros totales, empaquetado en formato EXL3 con un esquema multi-core que permite seleccionar vistas alternativas K8 y K6 compartiendo expertos, módulos de media y drafters. El repositorio ocupa 353,8 GB y se distribuye bajo la licencia stepfun-model-license-1.0.

El interés técnico de esta publicación no reside en el modelo base, sino en el procedimiento de cuantización: un encoder EXL3 bifurcado que valida tasas de bits entre 1 y 8, con receta de congruencia MCG/FP64 y trazabilidad completa de hashes de fuente, calibración y dependencias en `quantization-provenance.k8.json`. El índice por defecto expone el núcleo BF16 original, mientras que `cuteafd-mc.json` descubre las vistas completas K8 y K6.

Es relevante ahora porque documenta un patrón de empaquetado multi-vista para modelos de gran tamaño con componentes MoE y multimodales, aunque el propio autor advierte que no se reclama ninguna cualificación de calidad de generación ni de rendimiento en serving para este ensamblado. La información disponible sobre idiomas, contexto y datos de entrenamiento del modelo base es limitada en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `step5_vl`; transformer multimodal de imagen-a-texto, detalles no especificados) |
| Parámetros totales | 170.384.190.272 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 de 4 bits (vistas K4, K6 y K8; validación de tasa de bits 1..8) |
| Idiomas soportados | no disponible |
| Licencia | stepfun-model-license-1.0 (etiqueta `other`) |
| Formato de pesos | safetensors (empaquetado EXL3 multi-core) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Las etiquetas indican `step5_vl`, lo que sitúa el modelo en la familia Step-5 multimodal de stepfun-ai, con pipeline `image-text-to-text`. El ensamblado EXL3 conserva el núcleo BF16 original en el índice por defecto y expone vistas alternativas K8 y K6 mediante `cuteafd-mc.json`; en estas vistas solo cambian las matrices del núcleo objetivo, mientras que expertos, módulos de media y drafters se comparten entre vistas. Los 27 módulos densos MTP (multi-token prediction) del padre K4 permanecen compartidos sin cambios en las tres vistas: no se restauran a BF16 ni se codifican en K8.

El proceso de cuantización emplea un encoder EXL3 bifurcado con receta de congruencia MCG/FP64. El fork del encoder K8 corresponde al commit `1f920091232cc670ac67c233391d1a771f29f996` y el fork heredado del encoder K6 al commit `25dd11c391ce6bf3ceadf8722e8274c3cde7079a`. El delta del K8 habilita la validación de tasa de bits (1..8), el formateo de adaptadores y mantiene la misma receta de congruencia. El runtime declarado para el modelo K8 es Transformers `5.18.0.dev0` y Torch `2.12.0a0+5aff3928d8.nv26.5.50603568`. Los hashes de fuente, la calibración, la receta y las versiones reales de dependencias se registran en `quantization-provenance.k8.json`, y las pruebas de bytes del núcleo original y el inventario del paquete en `package-validation.json`. No se detallan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto e inferencia multimodal de imagen a texto, según el pipeline declarado (`image-text-to-text`).
- Conversación multi-turno (etiqueta `conversational`).
- Soporte de predicción multi-token (MTP), a partir de la mención a los módulos densos MTP del padre K4.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, thinking mode, visión o audio: no disponibles en la información proporcionada.
- Selección de vista de cuantización en tiempo de carga (núcleo BF16 original, K8 compacto o K6 compacto) mediante el manifiesto multi-core.

## Casos de uso

- Evaluación de cuantizaciones EXL3: el ensamblado permite comparar el núcleo BF16 original con las vistas K8 y K6 sobre el mismo checkpoint, compartiendo expertos y módulos de media, lo que aísla el efecto de la tasa de bits en las matrices objetivo.
- Investigación en empaquetado multi-vista: sirve como referencia para estudiar cómo organizar varias codificaciones de un mismo modelo de 170B en un único repositorio safetensors con manifiesto de descubrimiento (`cuteafd-mc.json`).
- Reproducibilidad de recetas de cuantización: los ficheros `quantization-provenance.k8.json` y `package-validation.json` permiten auditar hashes, calibración y versiones de dependencias de un pipeline EXL3.
- Pruebas de integración de runtimes: útil para validar builds de `cuteafd` que incluyan el PR #1896 (núcleos K8 de Step-5 y GLM 5.3) y el arreglo de vista K4-MTP compartida.
- Desarrollo de pipelines multimodales de imagen a texto sobre un modelo de gran tamaño cuantizado a 4 bits, cuando el objetivo es reducir huella de memoria respecto al BF16.
- Validación de infraestructura de serving para modelos de 170B con componentes MoE y drafters compartidos, antes de comprometer recursos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que este ensamblado no reclama ninguna cualificación de calidad de generación ni de rendimiento en serving.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia aritmética, 170.384.190.272 parámetros a 4 bits suponen aproximadamente 85 GB solo de pesos, sin overhead de activaciones, caché KV ni módulos compartidos; el repositorio completo ocupa 353,8 GB porque incluye el núcleo BF16 y las vistas alternativas.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el despliegue requeriría GPUs de数据中心 con memoria agregada suficiente (varias A100/H100), pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? No disponible; con ~85 GB de pesos a 4 bits no cabría en una única GPU de consumo de 24 GB.
- Opciones de despliegue: el runtime declarado es Transformers `5.18.0.dev0` con Torch `2.12.0a0+5aff3928d8.nv26.5.50603568` y un build de `cuteafd` que incluya el PR #1896. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Step-5-Preview-EXL3-K4-MC (este) | 170.384.190.272 | no disponible | EXL3 4 bits, vistas K4/K6/K8 | stepfun-model-license-1.0 | Hugging Face, 0 descargas |
| stepfun-ai/Step-5-Preview-BF16 (padre) | no disponible en la información | no disponible | BF16 | stepfun-model-license-1.0 | Hugging Face (referenciado como base) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que no se reclama calidad de generación ni rendimiento en serving; es un ensamblado de cuantización, no un checkpoint validado para producción.
- La licencia stepfun-model-license-1.0 es distinta de las licencias open source habituales; deben revisarse los términos del enlace de licencia antes de cualquier uso comercial.
- Los diagnósticos del padre describen la cuantización parental, no el núcleo restaurado; pueden inducir a error si se interpretan como métricas de este ensamblado.
- La vista `k8-compact` y las vistas `original` y `k6-compact` requieren un build de `cuteafd` con el PR #1896; sin él, la carga puede fallar o comportarse de forma incorrecta.
- El build del encoder K8 no tiene por qué coincidir con el build histórico del K6, lo que complica la reproducibilidad exacta entre vistas.
- Los 27 módulos densos MTP del padre K4 permanecen compartidos sin restaurar a BF16, lo que puede introducir diferencias respecto al modelo original en esas rutas.
- No hay información sobre sesgos, riesgo de alucinación, limitaciones de contexto o cobertura idiomática del modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la fecha de creación (2026-11-13) es posterior a la fecha actual de referencia, lo que conviene verificar.
- El tamaño del repositorio (353,8 GB) exige almacenamiento considerable y descarga completa para acceder a todas las vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wrldsuksgo2mars/Step-5-Preview-EXL3-K4-MC
- Modelo base: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16
- Licencia del modelo base: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16/blob/7734b7ffac118d70d8398bfa3eb0fab007eb45b1/LICENSE.txt
- PR #1896 de cuteafd: https://github.com/tpurtell/cuteafd/pull/1896
- Dataset de calibración: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
