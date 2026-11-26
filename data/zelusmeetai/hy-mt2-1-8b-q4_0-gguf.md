# zelusmeetai/Hy-MT2-1.8B-Q4_0-GGUF

## Resumen

Hy-MT2-1.8B-Q4_0-GGUF es una cuantización en formato GGUF del modelo de traducción Hy-MT2-1.8B desarrollado por Tencent. Concretamente, se trata de una conversión a cuantización Q4_0 realizada por el usuario zelusmeetai, que parte del GGUF Q8_0 publicado por Tencent y lo recuantiza mediante `llama-quantize` de llama.cpp. El objetivo es disponer de pesos con bloques en Q4_0 puros, requisito del backend Qualcomm Hexagon (NPU) de llama.cpp y de las pruebas de auto-verificación en GPU del autor.

El modelo base es un traductor multilingüe de aproximadamente 1.791 millones de parámetros (1,8B), pensado para despliegue en dispositivo (on-device) y con licencia Apache-2.0. Esta variante cuantizada ocupa 1.136.776.256 bytes (aproximadamente 1,1 GB), lo que la hace adecuada para entornos con memoria limitada como móviles, SoCs con NPU o GPUs de gama baja.

La relevancia de esta ficha radica en que cubre un caso poco habitual: una cuantización pura Q4_0 pensada específicamente para aceleradores Hexagon, cuando los GGUF oficiales solo distribuyen cuantizaciones K-quant y Q8_0. No obstante, al no publicarse pesos de mayor precisión que el Q8_0, la recuantización introduce una pérdida de precisión adicional respecto a una cuantización directa desde los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de traducción, según el pipeline `translation`; detalles no publicados en la información disponible) |
| Parametros totales | 1.791.080.448 (1,8B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (bloques), con `token_embd` y `output` en Q8_0 y normas en F32 |
| Idiomas soportados | 33 idiomas (según la model card del autor, que remite a la model card original de Tencent); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Hy-MT2-1.8B-Q4_0.gguf`, 1.136.776.256 bytes) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Hy-MT2-1.8B de Tencent. Se sabe que es un modelo de traducción (pipeline `translation`) de 1,8B parámetros y que soporta 33 idiomas, pero no se especifican el tipo de transformer, la longitud de contexto, el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card de esta variante remite explícitamente a la model card original para esos datos.

En cuanto al proceso de cuantización, esta variante se generó con `llama-quantize` de llama.cpp (release b12359) usando la orden `--allow-requantize --pure --token-embedding-type q8_0 --output-tensor-type q8_0` sobre el fichero Q8_0 oficial (SHA-256 `5c3fe0b1408a5ceb0143184ef247b11b579c525f4b02b060e6c851bb76fef1a4`). El resultado mantiene todos los pesos de bloque en Q4_0, los embeddings de tokens y la capa de salida en Q8_0, y las normas en F32. No se utilizó imatrix, y al partir de Q8_0 en lugar de los pesos originales, el autor advierte de una precisión ligeramente inferior a la de una cuantización hecha desde los pesos de origen.

## Capacidades

- Traducción automática entre 33 idiomas (lista concreta no disponible en la información proporcionada).
- Generación de texto conversacional en modo chat (`llama-cli -m ... -cnv`).
- Despliegue on-device: el formato Q4_0 puro está pensado para el backend Qualcomm Hexagon (NPU) de llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción en dispositivo móvil: el tamaño de 1,1 GB y la cuantización Q4_0 permiten ejecutar el modelo en smartphones con NPU Hexagon mediante llama.cpp, traduciendo texto sin enviar datos a la nube.
- Traducción offline en entornos sin conectividad: adecuado para aplicaciones de campo, dispositivos industriales o escenarios con requisitos de privacidad donde no se puede depender de una API externa.
- Integración en asistentes de chat multilingües: el modo conversacional de `llama-cli` y la compatibilidad con endpoints permiten incorporarlo como motor de traducción en un asistente que atienda usuarios en varios idiomas.
- Procesamiento por lotes de documentos multilingües: al ser un modelo pequeño, puede ejecutarse en GPUs de gama media o incluso en CPU para traducir grandes volúmenes de texto con coste reducido.
- Prototipado y evaluación de pipelines de traducción: sirve para validar flujos de traducción antes de escalar a modelos mayores, gracias a su licencia Apache-2.0 y a su reducido requisito de memoria.
- Pruebas en hardware con acelerador Hexagon: es una de las pocas opciones Q4_0 pura para validar el backend NPU de llama.cpp en tareas de traducción.
- Aplicaciones de subtitulado o mensajería en tiempo real: la baja latencia esperable de un modelo de 1,8B en Q4_0 lo hace apto para traducir mensajes cortos en conversaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para los pesos en Q4_0, más overhead de contexto y memoria de trabajo de llama.cpp (estimación orientativa; no confirmada en la información disponible).
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU consumer con al menos 2-3 GB de VRAM libre debería poder cargarlo.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, así como en iGPUs con suficiente memoria compartida.
- Aceleradores específicos: backend Qualcomm Hexagon (NPU) de llama.cpp, que es el motivo principal de esta cuantización Q4_0 pura.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato, herramientas que acepten GGUF como Ollama o interfaces basadas en llama.cpp; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/licencia | Notas |
|---|---|---|---|---|
| Hy-MT2-1.8B-Q4_0-GGUF (esta ficha) | 1,8B | no disponible | GGUF Q4_0 / Apache-2.0 | Cuantización pura Q4_0 para Hexagon |
| tencent/Hy-MT2-1.8B-GGUF (Q8_0) | 1,8B | no disponible | GGUF Q8_0 / Apache-2.0 | Fuente de esta recuantización; mayor precisión, mayor tamaño |
| tencent/Hy-MT2-1.8B (original) | 1,8B | no disponible | safetensors / Apache-2.0 | Pesos originales; referencia de precisión |

No se dispone de información sobre otros modelos de traducción comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión por recuantización: al partir del Q8_0 y no de los pesos originales, y sin imatrix, el autor advierte de una precisión ligeramente inferior a la de una cuantización directa.
- Idiomas: aunque se indican 33 idiomas, la lista concreta no está disponible en esta ficha; conviene consultar la model card original antes de usarlo con un par de idiomas específico.
- Contexto: la longitud de contexto no está documentada en la información disponible, lo que impide garantizar el rendimiento en textos largos.
- Alucinación: no hay datos publicados sobre tasas de alucinación o fidelidad en traducción para esta variante cuantizada.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y los términos de Tencent, ya que esta variante solo cambia la cuantización.
- Soporte: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de mantenimiento ni de validación comunitaria.
- Compatibilidad: el tag `endpoints_compatible` sugiere uso vía API, pero no se detallan los endpoints ni el formato de prompt en esta variante (se remite a la model card original).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zelusmeetai/Hy-MT2-1.8B-Q4_0-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- GGUF oficial de Tencent: https://huggingface.co/tencent/Hy-MT2-1.8B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
