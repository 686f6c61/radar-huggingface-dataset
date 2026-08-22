# spmoon/dama-aibrain

## Resumen

`dama-aibrain` es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por el usuario independiente `spmoon` como un finetuning del modelo base `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit` (de la familia Gemma 4). Según la model card, el entrenamiento se realizó con la librería Unsloth y el stack TRL de Hugging Face, lo que indica un proceso de ajuste fino eficiente sobre un modelo base ya instructivo.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio incluye pesos en formato `safetensors` y `GGUF`, así como etiquetas para su uso con `text-generation-inference`, `transformers` y `llama.cpp`. Aunque el pipeline declarado es `image-text-to-text`, no se proporciona documentación detallada sobre las capacidades multimodales reales del modelo, por lo que se recomienda verificar su comportamiento antes de usarlo en producción.

Con aproximadamente 5.1 mil millones de parámetros totales, se sitúa en la gama de modelos medianos que pueden ejecutarse en hardware de consumo con cuantización adecuada. Sin embargo, al ser un modelo con cero descargas y cero likes en el momento de su publicación, carece de validación comunitaria y de benchmarks publicados, lo que limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4, arquitectura no especificada) |
| Parametros totales | 5.123.178.012 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (fp16/bf16), GGUF |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un finetune del checkpoint `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, que pertenece a la familia Gemma 4 (probablemente una variante de 2B de parámetros, aunque el modelo final tiene 5.1B totales, lo que sugiere que el checkpoint base podría ser una mezcla de expertos con 5.1B totales y 2B activos, pero esto no está confirmado). El entrenamiento se realizó con Unsloth, una librería optimizada para fine-tuning de modelos grandes con menor consumo de memoria, y con la librería TRL de Hugging Face para el ajuste instructivo.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens utilizados, la duración del entrenamiento ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el proceso. El pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo podría aceptar imágenes como entrada junto con texto, pero no se han proporcionado detalles sobre la arquitectura del encoder visual ni sobre el proceso de entrenamiento multimodal.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational`).
- Pipeline `image-text-to-text` declarado, lo que sugiere entrada multimodal (imagen + texto) y salida de texto, aunque no hay documentación de las capacidades visuales reales.
- Soporte para `text-generation-inference` y `transformers`, lo que facilita su integración en entornos de inferencia estándar.
- Compatible con `llama.cpp` (presencia de GGUF), lo que permite ejecución en CPU y GPU de consumo.

No se dispone de información sobre capacidades específicas de razonamiento, código, matemáticas, tool calling o agentes.

## Casos de uso

No se han publicado casos de uso específicos ni ejemplos de aplicación en la model card. Dado el pipeline multimodal y el tamaño moderado, podrían plantearse escenarios hipotéticos como:

- Asistencia visual en aplicaciones de accesibilidad (descripción de imágenes) si el modelo funciona correctamente con entrada de imágenes, pero esto no está verificado.
- Generación de texto instructivo en inglés para prototipos de chatbots conversacionales.
- Experimentación académica sobre fine-tuning de modelos Gemma con Unsloth.
- Despliegue en entornos con recursos limitados mediante cuantización GGUF para tareas de generación de texto básicas.
- Evaluación de la calidad del finetuning de un modelo base instructivo con datos propios.

Sin embargo, la falta de benchmarks y de ejemplos de uso reales impide recomendar aplicaciones concretas de forma fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no tiene descargas ni evaluaciones de la comunidad, por lo que no se dispone de datos objetivos de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Con 5.1B parámetros, en fp16 se requieren aproximadamente 10.2 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache, lo que excede la capacidad de GPUs de consumo como la RTX 4060 (8 GB) o la RTX 3060 (12 GB) con margen limitado.
- Con cuantización de 4 bits (GGUF Q4_K_M), los pesos ocupan unos 3.5 GB, lo que permite inferencia en GPUs con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2060) y también en CPU con suficiente RAM (16 GB o más).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para ejecución sin cuantización o con contextos largos.
- Opciones de despliegue: `transformers` con Hugging Face, `vLLM` (si es compatible), `llama.cpp` para GGUF, `Ollama` (si se sube a su catálogo) y `text-generation-inference` (TGI).
- No se han publicado mediciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Dado el tamaño de ~5.1B y el pipeline multimodal, podría compararse con modelos como LLaVA-1.5-7B o Phi-3-vision-128k-instruct, pero no se han realizado evaluaciones comparativas y la falta de datos de rendimiento impide una comparación objetiva. La información de la comparativa no está disponible.

## Limitaciones y advertencias

- **Sin validación**: el modelo tiene cero descargas y cero likes, por lo que no ha sido probado ni validado por la comunidad. Su rendimiento real es desconocido.
- **Documentación insuficiente**: la model card es mínima y no especifica arquitectura, datos de entrenamiento, capacidades multimodales reales ni limitaciones conocidas.
- **Riesgo de alucinación**: al ser un finetune sobre un modelo base instructivo, es susceptible a generar información inventada, especialmente en dominios técnicos.
- **Idioma limitado**: solo se declara soporte para inglés, lo que limita su uso en entornos multilingües.
- **Contexto desconocido**: no se ha publicado la longitud de contexto máxima, lo que puede provocar errores en tareas de generación de texto largo.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero no se especifica si el modelo base Gemma 4 tiene términos adicionales (los modelos Gemma de Google suelen tener su propia licencia, aunque el checkpoint de Unsloth indica licencia Apache-2.0 en el repo, no se puede confirmar).
- **Producción**: sin benchmarks ni pruebas de robustez, no se recomienda su uso en entornos de producción sin una evaluación exhaustiva previa.

## Enlaces

- [Hugging Face: spmoon/dama-aibrain](https://huggingface.co/spmoon/dama-aibrain)
- [FriendliAI: spmoon/dama-aibrain (API)](https://friendli.ai/models/spmoon/dama-aibrain)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
- [Hugging Face TRL](https://github.com/huggingface/trl)
- [Modelo base: unsloth/gemma-4-e2b-it-unsloth-bnb-4bit](https://huggingface.co/unsloth/gemma-4-e2b-it-unsloth-bnb-4bit)
