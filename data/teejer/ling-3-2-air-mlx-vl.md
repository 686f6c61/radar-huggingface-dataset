# teejer/Ling-3.2-air-mlx-vl

## Resumen

Ling-3.2-air-mlx-vl es una conversión comunitaria a formato MLX del modelo multimodal Ling-3.2-air, desarrollado originalmente por inclusionAI. La ficha corresponde a un pack de cuantización de 4 bits orientado a ejecución en hardware Apple Silicon mediante la librería MLX. El autor del artefacto es el usuario teejer, que mantiene tanto la versión de texto (`teejer/Ling-3.2-air-mlx`) como esta variante con visión nativa.

El modelo resuelve el problema de ejecutar un modelo de lenguaje y visión de gran tamaño en máquinas Apple sin GPU dedicada, manteniendo la torre visual en bf16 para preservar la calidad de la percepción y cuantizando el tronco de texto a 4 bits. La arquitectura subyacente es `bailing_moe_v3_vl`, una variante MoE con atención multimodal y M-RoPE, con un contexto declarado de 262.144 tokens y un tamaño residente de aproximadamente 74 GB.

Es relevante ahora porque permite servir localmente tareas de image-text-to-text con contexto largo en hardware de consumo profesional (M3 Ultra), algo poco habitual en modelos de este tamaño. El checkpoint incluye además la cabeza NextN/MTP en `model.layers.42.*`, aunque su uso depende de que la rama MTP se integre en el motor de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | bailing_moe_v3_vl (MoE multimodal con M-RoPE) |
| Parámetros totales | 1.239.033.584 (según safetensors del repo; el tamaño del repo de 74 GB sugiere pesos adicionales o bf16 en torre visual, dato no aclarado por el autor) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 4-bit g64 affine en el tronco de texto; torre visual y `linear_proj.*` en bf16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base inclusionAI/Ling-3.2-air) |
| Formato de pesos | safetensors (MLX), cuantización MLX affine de 4 bits |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE multimodal identificado como `bailing_moe_v3_vl`. El checkpoint conserva la torre visual nativa (`model.visual.*`) y la proyección de salida (`linear_proj.*`) en bf16, mientras que el tronco de texto se cuantiza a 4 bits con granularidad de grupo 64 y reglas de cuantización propias de `bailing_moe_v3` en mlx-lm. La configuración incorpora `mrope_section [8, 12, 12]`, los identificadores de tokens de visión y los límites de píxeles del procesador original (`min_pixels` 4096, `max_pixels` 4.194.304).

El posicionamiento multimodal usa M-RoPE con una tabla de posiciones en diagonal de cuerpo y un layout de ejes `apply_video_rope`, implementado de forma nativa en el motor mlx-serve. El autor declara pruebas de paridad contra un oráculo en torch para las filas de la torre, la tabla de posiciones y los ángulos de RoPE, además de QA end-to-end con una y dos imágenes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento en el tronco de texto heredado de Ling-3.2-air.
- Comprensión de imágenes en modalidad image-text-to-text, con soporte de una y múltiples imágenes por petición (verificado con dos imágenes).
- Procesamiento de imágenes con límites de píxeles configurables entre 4.096 y 4.194.304 píxeles.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Cabeza NextN/MTP incluida en `model.layers.42.*`, pendiente de soporte en la rama MTP del motor.
- No se ha verificado el soporte de tool calling, function calling ni razonamiento agéntico multi-paso en esta conversión.
- No se sirve vídeo en la rama `ling-vl` actual, solo imágenes.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentos escaneados con contexto largo: el modelo puede recibir varias páginas como imágenes y mantener el hilo gracias a la ventana de 262.144 tokens, útil para extracción de datos de facturas o contratos en local.
- Asistente de accesibilidad sobre Apple Silicon: descripción de imágenes y respuesta a preguntas visuales en tiempo real en un Mac Studio o MacBook con chip M-series, sin enviar datos a la nube.
- Revisión de capturas de interfaz en pipelines de QA: comparación de dos imágenes (estado esperado frente a estado real) mediante QA multimodal, aprovechando el soporte verificado de dos imágenes por petición.
- Prototipado de investigación en visión-lenguaje: al mantener la torre visual en bf16, sirve para experimentos donde la fidelidad perceptiva importa más que la velocidad, con paridad verificada frente a torch.
- Procesamiento por lotes de imágenes médicas o técnicas en entornos con requisitos de privacidad: la ejecución local en MLX evita la exposición de datos sensibles a APIs externas.
- Generación de descripciones y metadatos para catálogos de imágenes: el contexto largo permite procesar lotes con instrucciones acumuladas y mantener coherencia entre elementos.
- Evaluación comparativa de cuantizaciones: la existencia del pack de texto y del pack VL permite medir la degradación introducida por la cuantización 4-bit en tareas visuales frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de serving en M3 Ultra: aproximadamente 74 GB residentes, contexto de 262.000 tokens y unos 98 tokens por segundo en decodificación, con la precisión de que MTP aún no está activo en la rama VL.

## Requisitos de hardware

- VRAM/residencia estimada: unos 74 GB en memoria unificada según la medición del autor en M3 Ultra.
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada amplia; el autor valida en M3 Ultra. No hay datos de funcionamiento en A100, H100 ni RTX 4090, y MLX no está pensado para CUDA.
- Cabe en GPU de consumo: no en tarjetas convencionales de 24 GB; requiere equipos Apple con 96 GB o más de memoria unificada para acomodar los 74 GB residentes con margen.
- Opciones de despliegue: mlx-serve con la rama de motor `ling-vl` (PR #1334); el pack de texto asociado usa mlx-lm. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: aproximadamente 98 tok/s de decodificación en M3 Ultra; no se proporcionan cifras de prefill ni de latencia de primera token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teejer/Ling-3.2-air-mlx-vl | 1.239.033.584 según safetensors (repo de 74 GB) | 262.144 | Imagen + texto | other | MLX, repo comunitario |
| teejer/Ling-3.2-air-mlx | no disponible | 262.144 (según pack de texto) | Solo texto | other | MLX, repo comunitario |
| inclusionAI/Ling-3.2-air | no disponible | no disponible | Imagen + texto | other | Modelo base original |

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- La licencia es "other" y hereda las condiciones del modelo base inclusionAI/Ling-3.2-air; es imprescindible revisar los términos originales antes de cualquier uso comercial.
- El artefacto tiene cero descargas y cero likes, y fue creado y actualizado con dos minutos de diferencia: se trata de una conversión reciente y sin validación comunitaria amplia.
- Solo se sirve mediante mlx-serve con una rama específica (`ling-vl`, PR #1334); no hay soporte documentado en motores estándar como vLLM o llama.cpp.
- El vídeo no está soportado en la rama actual, pese a que la configuración incluye layout de ejes de vídeo.
- La cabeza MTP está presente pero inactiva hasta que se integre la PR #1316, lo que limita el throughput potencial.
- La cuantización 4-bit del tronco de texto puede degradar tareas de razonamiento o código; el autor solo verifica regresión de texto frente al pack de texto, no frente al modelo original en bf16.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Sesgos conocidos y cobertura idiomática: no disponibles.
- El dato de parámetros totales de safetensors (1.239 millones) no concuerda con el tamaño del repo (74 GB) ni con la residencia declarada; conviene verificar la configuración real antes de planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teejer/Ling-3.2-air-mlx-vl
- Pack de texto asociado: https://huggingface.co/teejer/Ling-3.2-air-mlx
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Repositorio del conversor: https://github.com/Teejer/ling-3.2-air-mlx
- Motor de serving: https://github.com/ddalcu/mlx-serve
- PR de la rama ling-vl: https://github.com/ddalcu/mlx-serve/pull/1334
- PR de la rama MTP: https://github.com/ddalcu/mlx-serve/pull/1316
