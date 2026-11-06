# Starlinghq/qwen3.5-0.8b-ortgenai

## Resumen

Starlinghq/qwen3.5-0.8b-ortgenai es una conversión del modelo Qwen/Qwen3.5-0.8B al formato ONNX Runtime GenAI, publicada por StarlingHQ como artefacto auxiliar del paquete .NET `Starlings.Models.Qwen35` del repositorio starlinghq/starling. No se trata de un modelo entrenado desde cero, sino de una redistribución de pesos ya existentes empaquetados para su ejecución con el motor onnxruntime-genai, con variantes en fp32, fp16 (preview, orientada a CUDA) e int4 (experimental, orientada a CPU).

El modelo base Qwen3.5-0.8B pertenece a la familia Qwen3.5 de Alibaba, de la que esta ficha solo dispone de la referencia al repositorio original; los detalles de arquitectura, datos de entrenamiento y benchmarks no están incluidos en la información proporcionada. Lo relevante de esta publicación es el empaquetado: gráficos ONNX construidos con el model builder 0.17.1, tokenizador de transformers 5.18.0 y plantilla de chat del checkpoint original, todo fijado por tamaño y SHA-256 para que el paquete .NET rechace archivos alterados.

Su interés práctico radica en el despliegue de un modelo de 0,8B de parámetros en entornos .NET y en CPU sin depender de PyTorch, con una variante int4 pensada para hardware modesto. La licencia Apache-2.0 heredada del modelo base facilita su uso comercial, aunque la propia model card califica la variante int4 y la fp16 como experimentales o preview, lo que limita su uso en producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-0.8B; esta publicación solo distribuye gráficos ONNX) |
| Parámetros totales | 0,8B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 (variante `ortgenai-fp32x`), fp16 (variante `ortgenai-fp16x`, preview para CUDA), int4 (variante `ortgenai-int4`, round-to-nearest, bloque 32, accuracy level 4, CPU) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base; incluye ficheros LICENSE y NOTICE) |
| Formato de pesos | ONNX (gráficos ONNX Runtime GenAI), con `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` por variante |

## Arquitectura y entrenamiento

Esta publicación no entrena ningún modelo: es una conversión del checkpoint Qwen/Qwen3.5-0.8B en la revisión `2fc06364715b967f1860aea9cf38778875588b17`, realizada con el model builder de onnxruntime-genai 0.17.1 (commit fuente `83de55a1f3886cddbb32a5517e26adb3f9d65159`). Para evitar que los pesos se redondeen a bfloat16 durante la compilación, se usó una copia de `config.json` que declara float32, lo que da lugar a las variantes denominadas "x". Los pesos fp32 y fp16 solo cambian por la conversión de formato y el cast a fp16; los pesos int4 sí se cuantizan en el builder.

La variante fp32 se construyó en CPU y también puede ejecutarse sobre el execution provider CUDA con `use_tf32=0`. La variante fp16 está pensada para CUDA y se marca como preview: produce la misma salida greedy que la referencia en 18 de 22 prompts de referencia. La variante int4 está pensada para CPU y se describe como experimental, comparada contra el binding Python upstream y no contra la referencia fp32. Cada directorio de variante incluye los ficheros de tokenizador que lee la decodificación guiada (llguidance) de ONNX Runtime GenAI: una copia de `transformers-5.18.0/tokenizer.json` y el `tokenizer_config.json` del checkpoint sin modificar. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto autoregresiva mediante ONNX Runtime GenAI, en las variantes fp32, fp16 e int4.
- Decodificación guiada (guided decoding) a través de llguidance, con los ficheros de tokenizador incluidos en cada variante.
- Plantilla de chat incluida (`chat_template.jinja`), lo que permite el uso conversacional con el formato previsto por el modelo base.
- Ejecución en CPU (variantes fp32 e int4) y en GPU CUDA (variante fp16, y fp32 con `use_tf32=0`).
- Integración con el ecosistema .NET a través del paquete `Starlings.Models.Qwen35`, que verifica integridad de archivos por tamaño y SHA-256.
- Otras capacidades del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo, modo thinking) no están documentadas en la información disponible y deben consultarse en la model card de Qwen/Qwen3.5-0.8B.

## Casos de uso

- Aplicaciones de escritorio .NET con inferencia local: el paquete `Starlings.Models.Qwen35` y los gráficos ONNX permiten incorporar generación de texto en una aplicación .NET sin depender de Python ni de PyTorch, usando la variante fp32 o int4 según el hardware del usuario.
- Despliegue en servidores sin GPU: la variante int4 para CPU está diseñada para ejecutarse con onnxruntime-genai en entornos donde no hay acelerador dedicado, con un modelo de 0,8B que cabe en memoria de sistema convencional.
- Inferencia en GPU con CUDA: la variante fp16 (preview) permite aprovechar GPUs NVIDIA a través del execution provider CUDA, adecuada para prototipos y pruebas de latencia antes de adoptar una variante estable.
- Salidas estructuradas y JSON: la decodificación guiada con llguidance, apoyada en los ficheros de tokenizador incluidos, permite restringir la generación a gramáticas o esquemas concretos en pipelines de extracción de datos.
- Asistentes conversacionales ligeros: la plantilla de chat incluida facilita integrar el modelo en interfaces de chat multi-turno con el formato del modelo base, siempre que se valide el comportamiento en la variante elegida.
- Verificación de integridad en producción: el pinning por SHA-256 y el fichero `SHA256SUMS` permiten auditar que los pesos desplegados son exactamente los publicados, un requisito habitual en entornos regulados.
- Reproducibilidad de pipelines de conversión: el script `model-pipeline/reference/generation/build_ortgenai_bundle.py` del repositorio starlinghq/starling permite reconstruir el bundle y comparar resultados entre variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta una comparación cualitativa de la variante fp16: idéntica salida greedy que la referencia en 18 de 22 prompts de referencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de 0,8B en fp32 ocupa aproximadamente 3,2 GB de pesos, en fp16 unos 1,6 GB y en int4 en torno a 0,4-0,5 GB, sin contar overhead de runtime ni caché KV.
- GPU recomendadas: no especificadas por el autor. La variante fp16 está destinada al execution provider CUDA; la fp32 puede ejecutarse en CUDA con `use_tf32=0`.
- GPU de consumo: por tamaño, un modelo de 0,8B en fp16 o int4 es compatible con GPUs de consumo con suficiente memoria libre, aunque el autor no publica una lista de GPUs validadas.
- Opciones de despliegue: ONNX Runtime GenAI (librería `onnxruntime-genai`), con execution providers CPU y CUDA; integración en .NET mediante el paquete `Starlings.Models.Qwen35`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Starlinghq/qwen3.5-0.8b-ortgenai | 0,8B | no disponible | ONNX (fp32, fp16, int4) | Apache-2.0 | Conversión para onnxruntime-genai; variantes fp16 e int4 marcadas como preview y experimental |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | no disponible | no disponible | Modelo base original del que se deriva esta publicación |
| Otras conversiones ONNX de modelos de ~0,8B | no disponible | no disponible | ONNX | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- La variante int4 es experimental y se validó contra el binding Python upstream, no contra la referencia fp32, por lo que su fidelidad numérica no está garantizada.
- La variante fp16 está marcada como preview y difiere de la referencia en 4 de 22 prompts de referencia en decodificación greedy.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base en esta publicación; deben consultarse en la model card de Qwen/Qwen3.5-0.8B.
- La longitud de contexto no está documentada en esta ficha; debe verificarse en el modelo base antes de diseñar aplicaciones con ventanas largas.
- El paquete .NET rechaza archivos modificados por diseño (pinning por tamaño y SHA-256), lo que impide alterar tokenizador o pesos sin regenerar el bundle con el script de build.
- La licencia Apache-2.0 se hereda del modelo base e incluye ficheros LICENSE y NOTICE; conviene revisar el NOTICE para obligaciones de atribución en uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no publica benchmarks ni latencias, por lo que no hay evidencia de rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Starlinghq/qwen3.5-0.8b-ortgenai
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del proyecto: https://github.com/starlinghq/starling
- Script de construcción: `model-pipeline/reference/generation/build_ortgenai_bundle.py` en el repositorio starlinghq/starling
