# ununununununununununununununununununun/vit-base-breast-cancer-phi-lattice

## Resumen

`vit-base-breast-cancer-phi-lattice` es una compilación experimental del Vision Transformer médico `Falah/vit-base-breast-cancer`, publicado por el usuario `ununununununununununununununununununun`. El modelo original es un ViT de tipo base con 85.800.194 parámetros orientado a clasificación de imágenes en el dominio del cáncer de mama. Sobre esa base, este repositorio aplica una pasada de optimización post-entrenamiento denominada `phi-lattice`, que combina cuantización de las proyecciones lineales con poda estructurada de pesos.

El resultado se distribuye en dos formatos: un checkpoint estándar en `float16` (163,7 MB) cargable directamente con `transformers`, y un artefacto empaquetado en 4 bits (`uint8`, 43,3 MB) que reduce el tamaño del checkpoint FP32 original (327,4 MB) en un factor de 7,57x. El autor declara explícitamente que la subida es para pruebas y evaluación, no para uso clínico.

La relevancia de esta ficha es acotada: se trata de un experimento de compresión de un modelo médico pequeño, sin datos de validación clínica, sin benchmarks de precisión diagnóstica y sin métricas de rendimiento fuera del propio informe de cuantización. Es útil como referencia para quienes evalúan técnicas de cuantización con poda sobre ViT médicos, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) de tipo base |
| Parámetros totales | 85.800.194 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, clasificación de imagen) |
| Tipos de cuantización | 4 bits empaquetado (`uint8` bit-packed), 3 bits (reportado en benchmark), `float16` en el checkpoint estándar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (float16), `vit_phi_packed_4bit.pt` (PyTorch, 4 bits empaquetado) |

## Arquitectura y entrenamiento

El modelo base es un Vision Transformer de tamaño base (ViT-Base), con 85,8 millones de parámetros, adaptado a clasificación binaria o multiclase de imágenes médicas de mama. La información disponible no detalla el número de capas, dimensión oculta, número de cabezas de atención ni la resolución de entrada del procesador, más allá de lo que implica la familia ViT-Base estándar. Tampoco se especifican los datos de entrenamiento del modelo original: ni número de imágenes, ni composición del dataset, ni procedencia (mamografías, histopatología u otras modalidades), ni si hubo ajuste fino supervisado, RLHF o técnicas de aumento de datos.

La innovación de esta compilación no está en la arquitectura sino en el post-procesado `phi-lattice`, que aplica cuantización de las capas lineales combinada con poda de pesos. Según la tabla del autor, con 4 bits se alcanza un 8,07% de pesos a cero y una SQNR de 18,60 dB, mientras que la cuantización uniforme estándar a 4 bits obtiene 18,87 dB sin poda. A 3 bits, `phi-lattice` logra 12,07 dB frente a 11,80 dB de la cuantización uniforme, con un 17,77% de pesos podados. En ambos casos se reporta una concordancia Top-1 del 100% con el modelo FP32 y una divergencia KL muy baja (0,00009 a 4 bits, 0,00069 a 3 bits). Estos datos provienen exclusivamente del informe del autor y no han sido verificados de forma independiente.

## Capacidades

- Clasificación de imágenes médicas de mama (pipeline `image-classification`).
- Carga directa con `AutoModelForImageClassification` y `AutoImageProcessor` de `transformers`.
- Inferencia en `float16` con el checkpoint `safetensors` estándar.
- Inferencia con pesos empaquetados en 4 bits mediante el artefacto `vit_phi_packed_4bit.pt` (requiere el código de decodificación del pase `phi-lattice`, no incluido en la información disponible).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No se documentan capacidades multilingües (irrelevante para un clasificador de imagen).
- No se documentan capacidades de visión general más allá de la clasificación; no hay detección, segmentación ni captioning.

## Casos de uso

- Evaluación de técnicas de cuantización con poda: el repositorio sirve como banco de pruebas para comparar `phi-lattice` frente a cuantización uniforme sobre un ViT médico, usando las métricas de SQNR, divergencia KL y concordancia Top-1 reportadas.
- Investigación en compresión de modelos médicos: útil para estudiar cómo afecta la poda del 8-18% de pesos a un clasificador de imagen pequeño antes de desplegarlo en entornos con memoria limitada.
- Despliegue en dispositivos con restricciones de memoria: el artefacto de 43,3 MB permite experimentar con inferencia en hardware de borde o GPUs de gama baja, siempre que se implemente el decodificador del formato empaquetado.
- Prototipado de pipelines de clasificación de imagen médica: con el checkpoint `float16` se puede integrar rápidamente en un script de `transformers` para validar el flujo de preprocesado y clasificación.
- Comparación de checkpoints base frente a optimizados: permite medir la degradación (o no) de un modelo médico tras cuantización agresiva antes de decidir si merece la pena comprimir en producción.
- Docencia y reproducción de experimentos: como ejemplo de ficha reproducible de un pase de optimización post-entrenamiento sobre un modelo de Hugging Face con licencia permisiva.

## Benchmarks y rendimiento

Los únicos datos publicados son los del informe de cuantización del autor, no benchmarks de precisión diagnóstica (no hay métricas como AUC, sensibilidad, especificidad, F1 ni exactitud sobre un conjunto de test clínico).

| Método | SQNR (dB) | Pesos podados | Concordancia Top-1 con FP32 | Divergencia KL | Similitud coseno de logits |
|---|---|---|---|---|---|
| Uniforme 4 bits | 18,87 | 0,00% | 100,0% | 0,00007 | 0,99999 |
| `phi-lattice` 4 bits (este repo) | 18,60 | 8,07% | 100,0% | 0,00009 | 0,99999 |
| Uniforme 3 bits | 11,80 | 0,00% | 100,0% | 0,00156 | 0,99996 |
| `phi-lattice` 3 bits | 12,07 | 17,77% | 100,0% | 0,00069 | 0,99982 |

No se han publicado resultados de benchmarks de precisión clínica en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `float16`: en torno a 170-200 MB de pesos, más activaciones y buffers; cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- VRAM estimada para el artefacto de 4 bits: aproximadamente 45-60 MB de pesos empaquetados, más el coste de decodificación en memoria.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para este modelo; también es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en iGPU y dispositivos de borde si se usa el formato empaquetado.
- Opciones de despliegue: `transformers` con PyTorch para el checkpoint `safetensors`; el artefacto de 4 bits requiere el código de decodificación de `phi-lattice`, no disponible en la información proporcionada. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a ViT de clasificación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `vit-base-breast-cancer-phi-lattice` (este repo) | 85,8 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Cuantizado y podado, sin validación clínica publicada |
| `Falah/vit-base-breast-cancer` (base) | 85,8 M (según repo derivado) | no disponible | no disponible en la información | Hugging Face | Modelo original sin comprimir; sin métricas clínicas en la información disponible |
| ViT-Base estándar (ImageNet) | ~86 M | 224x224 típico | Apache 2.0 (según variante) | Amplia | Referencia genérica de arquitectura, no especializada en mama |
| Otros ViT médicos de tamaño base | ~86 M | variable | variable | variable | No disponible comparación concreta en la información proporcionada |

La comparación con alternativas reales del mismo dominio (clasificadores de mama basados en ViT o CNN) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es una compilación experimental "for testing and evaluation"; no está validado para uso clínico ni diagnóstico.
- No se publican métricas de precisión diagnóstica (AUC, sensibilidad, especificidad) sobre ningún conjunto de test; la única validación es la concordancia con el modelo FP32, que no mide corrección clínica.
- El modelo base `Falah/vit-base-breast-cancer` no documenta en la información disponible su dataset, procedencia de imágenes ni protocolo de evaluación, lo que impide evaluar sesgos de población o de modalidad de imagen.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- La poda del 8,07% (4 bits) y del 17,77% (3 bits) de pesos puede degradar el rendimiento en subpoblaciones o modalidades no representadas en la evaluación del autor.
- El artefacto de 4 bits requiere código de decodificación específico de `phi-lattice`; sin él, solo es utilizable el checkpoint `safetensors` en `float16`.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero la responsabilidad regulatoria en aplicaciones médicas recae en el integrador; no hay marcado CE ni aprobación FDA asociada.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o revisión por la comunidad.
- El modelo no soporta texto, tool calling ni agentes; cualquier caso de uso debe limitarse a clasificación de imagen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ununununununununununununununununununun/vit-base-breast-cancer-phi-lattice
- Modelo base: https://huggingface.co/Falah/vit-base-breast-cancer
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
