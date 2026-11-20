# taobao-mnn/Qwen2.5-0.5B-Instruct-MNN

## Resumen

Qwen2.5-0.5B-Instruct-MNN es la versión cuantizada y empaquetada para el motor de inferencia MNN del modelo Qwen2.5-0.5B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio lo publica taobao-mnn, la organización que mantiene los artefactos oficiales de MNN en Hugging Face. El objetivo no es ofrecer un modelo nuevo, sino un formato listo para ejecutar en CPU con bajo consumo de memoria mediante el runtime MNN, lo que facilita el despliegue en dispositivos y entornos sin GPU.

Se trata de un transformer de 24 capas con dimensión oculta 896, pensado para conversación multilingüe (chino e inglés) y generación de texto con instrucciones. La cuantización se realiza con HQQ a 4 bits con grupos de 128 tanto en las capas lineales del modelo de lenguaje como en la cabeza de salida, mientras que los embeddings se mantienen en BF16 y las escalas de cuantización en FP16. El repositorio ocupa aproximadamente 0,8 GB.

Su relevancia actual reside en la combinación de un modelo pequeño y una licencia Apache 2.0 permisiva con un formato optimizado para inferencia en CPU. Esto lo convierte en una opción práctica para prototipos, aplicaciones móviles o entornos edge donde no hay acelerador dedicado, aunque su tamaño de 0,5B limita la profundidad de razonamiento frente a modelos mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), 24 capas, dimensión oculta 896 |
| Parametros totales | 0,5B (aproximado, según el modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | HQQ 4-bit con grupo 128 en capas lineales y cabeza de salida; embeddings en BF16; escalas en FP16 |
| Idiomas soportados | chino (zh) e inglés (en) según la model card; la etiqueta del repositorio indica en |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_bf16.bin`, `tokenizer.mtok`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-0.5B-Instruct, un transformer decoder-only de 24 capas y dimensión oculta 896, afinado para seguir instrucciones. Esta ficha corresponde a una conversión: el repositorio no entrena el modelo, sino que lo cuantiza y lo empaqueta para MNN. La cuantización aplicada es HQQ (Half-Quadratic Quantization) a 4 bits con tamaño de grupo 128 en las capas lineales del modelo de lenguaje y en la cabeza de salida, manteniendo los embeddings en BF16 y las escalas de cuantización en FP16 para preservar precisión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base dentro de la información proporcionada. La model card menciona que la exportación se validó con MNN 3.6.2 (commit `b0239771b07b317a258fbc384683bbd540741406`) y que el 9 de noviembre de 2026 se comprobaron en CPU x64 la alineación del mapeo FP32, casos de saludo, aritmética y traducción, además de una prueba de humo con la configuración por defecto. Los parámetros de exportación están en `export_args.json` y los registros de prueba y hashes en `refresh_metadata.json`.

## Capacidades

- Generación de texto y conversación multi-turno con instrucciones.
- Razonamiento básico y aritmética sencilla (validado en las pruebas de exportación).
- Traducción entre chino e inglés (validada en las pruebas de exportación).
- Soporte multilingüe limitado a chino e inglés según la model card.
- Ejecución en CPU con configuración por defecto de 4 hilos, `precision=low` y `memory=low`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Prototipado rápido en local: al ejecutarse con el binario `llm_demo` de MNN en CPU, permite validar prompts y flujos conversacionales sin GPU ni dependencias pesadas, usando el comando documentado en la model card.
- Aplicaciones edge o embebidas: el formato MNN y la cuantización 4-bit con embeddings BF16 reducen el peso del repositorio a unos 0,8 GB, lo que encaja en dispositivos con memoria limitada donde no cabe un modelo mayor.
- Asistente conversacional ligero en chino e inglés: el modelo está afinado para instrucciones y cubre diálogos multi-turno en esos dos idiomas, adecuado para chatbots internos de bajo coste.
- Traducción asistida zh-en: las pruebas de exportación incluyen casos de traducción, por lo que puede emplearse en pipelines de traducción de frases cortas o preprocesado.
- Tareas de extracción y resumen de textos breves: con 0,5B de parámetros es viable para clasificación, resumen o reescritura de documentos cortos en entornos con recursos restringidos.
- Integración en apps móviles o de escritorio mediante MNN: el runtime de Alibaba permite incorporar el modelo en aplicaciones nativas, y la documentación de MNN-LLM describe la integración.
- Pruebas de humo y CI de pipelines de cuantización: sirve como referencia para validar exportaciones HQQ 4-bit a MNN antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario principal, ya que la configuración por defecto es CPU; el repositorio pesa aproximadamente 0,8 GB.
- GPU recomendadas: no disponible; la model card solo documenta ejecución en CPU x64.
- Cabe en consumer GPU: no disponible; no se documenta despliegue en GPU para este artefacto.
- Opciones de despliegue: MNN (`llm_demo`), compilado con `-DMNN_BUILD_LLM=ON -DMNN_LOW_MEMORY=ON -DMNN_SUPPORT_TRANSFORMER_FUSE=ON`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible; la configuración por defecto usa CPU con 4 hilos, `precision=low` y `memory=low`, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-MNN (este) | 0,5B | no disponible | MNN, HQQ 4-bit | Apache 2.0 | Optimizado para CPU vía MNN |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible | safetensors (formato original) | Apache 2.0 | Modelo base sin cuantizar |
| Otros artefactos MNN de la familia Qwen2.5 | no disponible | no disponible | MNN | Apache 2.0 | No se dispone de datos concretos en la información proporcionada |

No se dispone de información sobre benchmarks comparativos con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al derivar de Qwen2.5-0.5B-Instruct, hereda los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación: con 0,5B de parámetros el riesgo es alto en tareas de conocimiento factual o razonamiento complejo; conviene validar las salidas.
- Limitaciones de contexto e idioma: la model card declara solo chino e inglés; la etiqueta del repositorio indica únicamente inglés. La longitud de contexto no está disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribuirse al modelo base Qwen.
- Caveats de producción: el artefacto está pensado para MNN y no es directamente compatible con vLLM, llama.cpp u otros runtimes; requiere compilar MNN en la versión indicada. La cuantización HQQ 4-bit puede degradar la precisión frente al modelo original, y las pruebas documentadas son de humo, no una evaluación exhaustiva.
- El repositorio se actualizó por última vez el 18 de noviembre de 2026; conviene verificar la compatibilidad con la versión de MNN en uso.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen2.5-0.5B-Instruct-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- ModelScope: https://modelscope.cn/models/MNN/Qwen2.5-0.5B-Instruct-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
