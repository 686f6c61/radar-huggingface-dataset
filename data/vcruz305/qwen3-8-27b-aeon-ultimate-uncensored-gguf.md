# vcruz305/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, una versión "abliterated" (con la dirección de rechazo eliminada) del modelo base `Qwen/Qwen3.8-27B` de Alibaba. El empaquetado GGUF ha sido realizado por vcruz305 mediante `convert_hf_to_gguf.py` y `llama-quantize`, utilizando la técnica K-quants de llama.cpp. El resultado es un modelo de 27 000 millones de parámetros, denso, con arquitectura híbrida de atención (`qwen35`), diseñado para ejecución local en hardware de consumo a través de llama.cpp.

La relevancia de este modelo radica en que ofrece una versión sin censura de un modelo de última generación de Qwen, manteniendo la licencia Apache-2.0 y permitiendo su uso comercial. Al estar cuantizado, puede ejecutarse en GPU con 24 GB de VRAM (la variante Q6_K es la mayor que cabe completa en una tarjeta Turing de 24 GB, mientras que Q8_0 no cabe). Incluye una plantilla de chat corregida que evita los problemas de la plantilla oficial con agentes multi-turno, y admite un modo de razonamiento explícito mediante `--reasoning-format deepseek`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida densa con atención (`qwen35`), 64 bloques de tronco de lenguaje |
| Parametros totales | 27 000 millones (según nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada oficialmente; el ejemplo de uso emplea 32 768 tokens |
| Tipos de cuantizacion | Q4_K_M (disponible), Q3_K_M, Q2_K, Q5_K_M, Q6_K, Q8_0 (planificados) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una conversión cuantizada de un modelo preexistente. La cadena de transformación es la siguiente: el modelo base `Qwen/Qwen3.8-27B` (de Alibaba) fue sometido a un proceso de "abliteration" por el usuario AEON-7, que elimina la dirección de rechazo del modelo, dando lugar al BF16 `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`. Posteriormente, vcruz305 convirtió este BF16 a formato GGUF usando `convert_hf_to_gguf.py --outtype f16 --no-mtp` (sin predicción multi-token, solo el tronco de lenguaje) y lo cuantizó con `llama-quantize` a varias precisiones K-quants.

No se dispone de información sobre los datos de entrenamiento del modelo base original (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO). La única innovación técnica destacable en esta versión es la eliminación de la dirección de rechazo, que hace que el modelo no se niegue a responder peticiones, y la corrección de la plantilla de chat (jinja) para evitar problemas con agentes multi-turno.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento explícito: el servidor llama.cpp puede usar `--reasoning-format deepseek`, lo que sugiere que el modelo puede emitir cadenas de razonamiento antes de la respuesta final.
- Compatible con `llama.cpp` y sus derivados (llama-server, Ollama si soporta `qwen35`).
- Posibilidad de emparejar con un archivo `mmproj` para capacidades de visión, aunque no se incluye en este repositorio.
- Sin censura: al haberse eliminado la dirección de rechazo, el modelo no rechaza peticiones que normalmente serían bloqueadas por los mecanismos de seguridad estándar.
- Plantilla de chat corregida para evitar errores en conversaciones multi-turno y agentes.

## Casos de uso

- Chat local sin censura para escritura creativa o juegos de rol: el modelo puede generar diálogos y narrativas sin restricciones temáticas, gracias a la abliteración.
- Asistente personal de texto en local: al ser un GGUF, se puede ejecutar en un servidor llama.cpp y usarse como backend para aplicaciones de chat o procesamiento de documentos.
- Traducción entre inglés y chino: el modelo soporta ambos idiomas, por lo que puede utilizarse para tareas de traducción de texto.
- Generación de contenido para blogs o redes sociales: su capacidad de razonamiento y generación de texto permite crear artículos, resúmenes o publicaciones, aunque hay que tener en cuenta que no está censurado.
- Experimentación con modelos sin restricciones de contenido: investigadores o desarrolladores que necesiten probar comportamientos sin filtros de seguridad pueden usar este modelo para estudiar fenómenos como la alucinación o la toxicidad.
- Desarrollo de agentes conversacionales: la plantilla de chat corregida y el soporte para razonamiento hacen viable su uso en sistemas de diálogo multi-turno, siempre que se controle el contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo cuantizado ni para su versión BF16.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q4_K_M: aproximadamente 16 GB (estimación basada en 27B × 4 bits + overhead; no confirmado por el autor).
  - Q6_K: cabe completa en una GPU de 24 GB (Turing), según el autor. Se estima unos 20 GB de VRAM.
  - Q8_0: no cabe completa en 24 GB (requiere más de 24 GB).
- GPU recomendadas: RTX 3090, RTX 4090, A100 (24 GB o más) para Q6_K; tarjetas con 16 GB o más para Q4_K_M.
- Opciones de despliegue: `llama.cpp` (llama-server), `Ollama` (si soporta la arquitectura `qwen35`), o cualquier backend compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (mismo tamaño o misma tarea). No se conocen las especificaciones del modelo base `Qwen3.8-27B` oficial ni de otras variantes abliterated. Se recomienda consultar la documentación de Qwen para obtener datos comparativos.

## Limitaciones y advertencias

- Contenido sin censura: al eliminar la dirección de rechazo, el modelo puede generar contenido ofensivo, ilegal o inapropiado. No es apto para todos los públicos y debe usarse con responsabilidad.
- Idiomas limitados: solo inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en temas especializados.
- Degradación por cuantización: las versiones Q2_K y Q3_K_M pueden presentar una pérdida notable de calidad en comparación con la BF16 original.
- No es un modelo oficial de Qwen: se trata de una modificación de terceros, y el soporte de la comunidad puede ser limitado.
- Requisitos de versión de llama.cpp: se necesita una versión reciente que soporte la arquitectura `qwen35`; versiones antiguas no funcionarán.
- El chat template horneado en el GGUF es una corrección no oficial; puede diferir del comportamiento de la plantilla original de Qwen.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/vcruz305/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-GGUF
- Modelo BF16 abliterated: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Autor de la cuantización (vcruz305): https://huggingface.co/vcruz305
- Autor de la abliteración (AEON-7): https://huggingface.co/AEON-7
