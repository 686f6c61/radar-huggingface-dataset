# Zayaan/zils-flash-onejev1.6

## Resumen

Zils-flash-onejev1.6 es una redistribución de los pesos del modelo OmniJev/OneJev1.6-9B (revisión 259e5470) en el formato denominado "Zils d3-flash soup-body". El autor, identificado como Zayaan, no ha entrenado ni modificado los parámetros: se limita a reempaquetar los tensores del modelo original bajo una nomenclatura concreta (`language_model.*`, `visual.*`) y a excluir los tensores ajenos a ese esquema, como cabezas personalizadas y `lm_head`.

El modelo cuenta con 8.392.695.024 parámetros almacenados en safetensors (16,8 GB en total), lo que lo sitúa en la categoría de 9B. La presencia de prefijos `visual.*` en el layout sugiere que el modelo base incorpora componentes multimodales, aunque la información disponible no detalla la arquitectura interna ni el proceso de entrenamiento.

Su relevancia es acotada: se trata de un artefacto de distribución vinculado a la subred 127 (Zils) de Bittensor, publicado con licencia Apache-2.0. Resulta útil para quienes necesiten los pesos de OneJev1.6-9B en el layout específico de Zils, pero no aporta ninguna mejora técnica sobre el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el layout incluye prefijos `language_model.*` y `visual.*`, lo que sugiere un modelo multimodal con torre de visión) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base OmniJev/OneJev1.6-9B: la model card de esta redistribución no describe si se trata de un transformer denso, un MoE o un modelo híbrido, ni detalla el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es el reempaquetado: los tensores se han reorganizado bajo el layout "soup-body" de Zils d3-flash, conservando los pesos originales sin alteración y descartando los tensores que no encajan en ese esquema (cabezas personalizadas y `lm_head`). Esta omisión de `lm_head` implica que el artefacto no es directamente ejecutable para generación de texto sin restaurar esa capa desde el modelo original.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- La presencia de tensores bajo el prefijo `visual.*` apunta a un posible soporte de entrada de imágenes en el modelo base, aunque no se confirma ni se detalla su alcance.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modos especiales (thinking, audio, etc.): no disponible.

## Casos de uso

- Redistribución de pesos para la subred 127 (Zils) de Bittensor: el artefacto está pensado para que los nodos de esa subred carguen OneJev1.6-9B en el layout esperado por su infraestructura, sin necesidad de convertir formatos.
- Archivado y espejo del modelo base: al conservar los pesos sin modificar bajo Apache-2.0, sirve como copia de referencia de la revisión 259e5470 de OneJev1.6-9B.
- Integración en pipelines que esperan el esquema `language_model.*` / `visual.*`: frameworks o scripts internos de Zils que resuelven tensores por nombre pueden consumir este repositorio directamente.
- Experimentación con modelos multimodales de 9B: si se restaura `lm_head` desde el modelo original, puede emplearse para probar cargas parciales o técnicas de poda sobre los tensores disponibles.
- Estudio de formatos de empaquetado de pesos: útil para investigar cómo se reorganizan checkpoints entre convenciones de nombres distintas sin reentrenar.
- Base para fine-tuning selectivo: los tensores de lenguaje y visión están presentes, de modo que un entrenamiento posterior podría partir de este layout siempre que se añada la cabeza de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 17 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 24 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB de pesos, con margen adicional para el contexto.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB de pesos, viable en GPUs de consumo con 8-12 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090, 4080 o 4070 Ti para cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 8 y 4 bits; en FP16 requiere tarjetas de 24 GB o más.
- Opciones de despliegue: al no incluir `lm_head`, no es cargable directamente en vLLM, TGI, llama.cpp u Ollama sin restaurar esa capa desde el checkpoint original. Una vez restaurada, sería compatible con vLLM y TGI para safetensors en FP16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zils-flash-onejev1.6 | 8,39B | no disponible | Apache-2.0 | safetensors (layout Zils, sin `lm_head`) | Redistribución sin modificar de OneJev1.6-9B |
| OmniJev/OneJev1.6-9B | ~9B (según nombre) | no disponible | Apache-2.0 | safetensors | Modelo original, checkpoint completo |
| Alternativas de ~9B densos (p. ej. familias tipo Llama o Qwen de 8-9B) | 8-9B | 8K-128K según variante | variables (Apache-2.0, Llama community, etc.) | safetensors, GGUF | No se dispone de datos comparativos de rendimiento con este artefacto |

## Limitaciones y advertencias

- No es un modelo ejecutable de forma autónoma: al haberse excluido `lm_head` y las cabezas personalizadas, la generación de texto requiere restaurar esos tensores desde OmniJev/OneJev1.6-9B.
- Ausencia total de documentación sobre arquitectura, datos de entrenamiento, contexto e idiomas; cualquier evaluación de calidad exige remitirse al modelo original.
- Sesgos conocidos: no disponibles; al no haber información sobre el corpus de entrenamiento, no pueden caracterizarse.
- Riesgo de alucinación: no evaluado en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el autor de esta redistribución no ofrece garantías y remite toda la autoría al equipo de OmniJev.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con 30 segundos de diferencia, lo que sugiere una publicación automatizada desde un hotkey de scout de Bittensor.
- Para producción, se recomienda partir directamente del modelo base original en lugar de este reempaquetado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Zayaan/zils-flash-onejev1.6
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-9B
- Subred Bittensor 127 (Zils): no disponible en la información proporcionada.
- Paper, blog o demo: no disponibles.
