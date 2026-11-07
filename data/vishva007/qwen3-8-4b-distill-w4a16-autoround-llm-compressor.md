# Vishva007/Qwen3.8-4B-Distill-W4A16-AutoRound-LLM-Compressor

## Resumen

Qwen3.8-4B-Distill-W4A16-AutoRound-LLM-Compressor es una versión cuantizada a 4 bits del modelo empero-ai/Qwen3.8-4B-Distill, publicada por el usuario Vishva007 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text con capacidad de razonamiento explícito mediante bloques `<think>`, destilado a partir de la familia Qwen3.8 y empaquetado con el algoritmo AutoRound de Intel en el esquema W4A16 (pesos de 4 bits, activaciones de 16 bits). El repositorio concreto que nos ocupa usa el formato Compressed-Tensors de llm-compressor, pensado para servir el modelo con vLLM.

La relevancia de esta ficha no está en el modelo base, sino en el proceso de compresión: se ha calibrado con 512 muestras de 4096 tokens, tamaño de grupo 32, simetría activada y 1000 iteraciones de tuning, manteniendo la torre de visión en BF16 y los módulos de predicción multi-token (`mtp`, `mtp.fc`) en bfloat16 nativo. El resultado es un checkpoint de 4.539.265.536 parámetros totales y 4,5 GB en disco que, según el autor, reduce el requisito de VRAM de 8-10 GB a 2,5-3,5 GB, lo que lo hace ejecutable en GPUs de consumo de 4-6 GB.

El modelo conserva licencia Apache 2.0 y el pipeline multimodal, pero no se han publicado resultados de benchmarks ni la lista de idiomas soportados en la información disponible. La ficha debe leerse, por tanto, como una evaluación de la receta de cuantización y de su viabilidad de despliegue, no como una validación empírica de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), etiqueta `qwen3_5`, con módulos de predicción multi-token (`mtp`, `mtp.fc`) |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue con vLLM usa `--max-model-len 8192` |
| Tipos de cuantización | W4A16 (4 bits en pesos, 16 bits en activaciones), grupo 32, simétrico; torre de visión y módulos `mtp` en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con Compressed-Tensors (llm-compressor); existen variantes AutoRound y AutoGPTQ en repositorios separados |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento desde cero. El modelo base es empero-ai/Qwen3.8-4B-Distill, un destilado de la familia Qwen3.8 con 4,54 B de parámetros y pipeline multimodal image-text-to-text. La arquitectura subyacente se etiqueta como `qwen3_5` en los tags del repositorio, e incluye una torre de visión para el procesamiento de imágenes y módulos de predicción multi-token (MTP), un mecanismo típico de decodificación especulativa que permite proponer varios tokens por paso y acelerar la generación.

El proceso de compresión aplica Intel AutoRound con los siguientes hiperparámetros: 512 muestras de calibración, longitud de secuencia 4096, tamaño de grupo 32, cuantización simétrica y 1000 iteraciones de tuning por módulo. La decisión técnica más relevante es el uso de `quant_nontext_module=False`, que deja la torre de visión en BF16 para preservar precisión en OCR y razonamiento visual, y el `layer_config` que mantiene `mtp` y `mtp.fc` en bfloat16 nativo. El objetivo declarado es conservar los trazos de razonamiento (`<think>`) y las capacidades multimodales tras la cuantización. No se detalla la composición del dataset de destilación del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantillas de chat de la familia Qwen.
- Razonamiento explícito mediante bloques `<think>`, preservados explícitamente durante la calibración.
- Procesamiento de imágenes y texto combinados (pipeline image-text-to-text), con torre de visión en BF16.
- Razonamiento visual y OCR, según la motivación declarada por el autor para mantener la torre de visión sin cuantizar.
- Predicción multi-token (MTP) para decodificación especulativa, mantenida en BF16.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque el modo de razonamiento `<think>` es compatible con flujos multi-paso.

## Casos de uso

- Despliegue en GPUs de consumo para prototipado: con 2,5-3,5 GB de VRAM estimados por el autor, el modelo cabe en tarjetas de 4-6 GB, lo que permite iterar sobre prompts y flujos multimodales en un portátil sin depender de un servidor.
- Servicio de inferencia de alto rendimiento con vLLM: el formato Compressed-Tensors está soportado nativamente por vLLM, de modo que se puede levantar un endpoint OpenAI-compatible con `vllm serve` y `--max-model-len 8192` para aplicaciones de chat.
- Procesamiento de documentos con OCR y razonamiento: al mantener la torre de visión en BF16, el modelo es adecuado para extraer texto de imágenes o capturas y razonar sobre él en un mismo paso, por ejemplo para digitalizar formularios o tickets.
- Asistentes conversacionales con razonamiento visible: los bloques `<think>` permiten mostrar al usuario la cadena de razonamiento en aplicaciones educativas o de soporte técnico donde la trazabilidad importa.
- Evaluación comparativa de recetas de cuantización: al existir variantes AutoRound, AutoGPTQ y llm-compressor del mismo checkpoint, sirve para medir en un mismo hardware qué backend ofrece mejor fidelidad y throughput.
- Inferencia en el borde o en entornos con memoria limitada: el tamaño de 4,5 GB en disco y el bajo consumo de VRAM permiten empaquetar el modelo en contenedores pequeños para demos, notebooks o dispositivos con GPU integrada.
- Generación de código asistida con contexto visual: la combinación de razonamiento y visión permite pasar capturas de errores o diagramas y obtener explicaciones o parches, siempre que se valide la calidad empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card solo aporta estimaciones de recursos, no métricas de calidad:

| Métrica | Modelo original (BF16) | Modelo cuantizado (W4A16, grupo 32) |
|---|---|---|
| VRAM para inferencia a contexto completo | ~8-10 GB | ~2,5-3,5 GB |
| Tamaño del repo | No disponible | 4,5 GB |
| Throughput | No disponible | El autor indica que reduce la presión de ancho de banda de memoria y acelera la generación durante cadenas de razonamiento largas, sin cifras |

## Requisitos de hardware

- VRAM estimada: 2,5-3,5 GB según el autor para W4A16 con grupo 32; el modelo base en BF16 requiere 8-10 GB.
- GPUs de consumo: cabe en tarjetas de 4 GB y 6 GB según la model card; en la práctica, una RTX 3060 de 12 GB o una RTX 4060 Ti de 8/16 GB dejan margen para contexto largo y batch pequeño.
- GPUs de datacenter: A100, H100 o L40S para servir con vLLM a mayor concurrencia; el modelo es pequeño, por lo que el cuello de botella será el ancho de banda y no la capacidad.
- Despliegue recomendado: vLLM con el formato Compressed-Tensors (`vllm serve ... --dtype bfloat16 --max-model-len 8192 --gpu-memory-utilization 0.90`).
- Otros backends: el autor publica variantes AutoRound y AutoGPTQ en repositorios separados, lo que amplía las opciones de motor de inferencia; no se confirma soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles con cifras; solo la afirmación cualitativa de mejora por menor presión de memoria.
- Entornos de ejecución: la model card incluye plantillas de RunPod con imágenes PyTorch 2.12 a 2.15 y CUDA 12.6 a 13.4, lo que da una referencia de las versiones de stack probadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-4B-Distill-W4A16-AutoRound-LLM-Compressor (este) | 4,54 B | No disponible (ejemplo a 8192) | W4A16, grupo 32, Compressed-Tensors | Apache 2.0 | Hugging Face, 79 descargas |
| empero-ai/Qwen3.8-4B-Distill (base) | 4,54 B | No disponible | BF16 | No disponible en esta información | Hugging Face |
| Vishva007/Qwen3.8-4B-Distill-W4A16-AutoRound | 4,54 B | No disponible | W4A16, formato AutoRound | Apache 2.0 | Hugging Face |
| Vishva007/Qwen3.8-4B-Distill-W4A16-AutoRound-GPTQ | 4,54 B | No disponible | W4A16, formato AutoGPTQ | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar la calidad frente a alternativas de otros autores con el mismo tamaño.

## Limitaciones y advertencias

- No hay benchmarks publicados: la afirmación de que la cuantización preserva el razonamiento y la precisión visual es una intención de diseño, no un resultado medido. Cualquier uso en producción exige una evaluación propia.
- La cuantización W4A16 con grupo 32 introduce degradación acumulativa, especialmente en tareas de matemáticas, código y cadenas de razonamiento largas; el riesgo es mayor cuanto más profunda sea la cadena `<think>`.
- La torre de visión se mantiene en BF16, lo que significa que el ahorro de VRAM se concentra en el decodificador de lenguaje; el consumo real en tareas multimodales será superior al estimado para texto.
- El modelo base es un destilado, no un modelo entrenado con RLHF verificado en esta información; el riesgo de alucinación y de razonamientos plausibles pero incorrectos es inherente.
- No se especifican los idiomas soportados ni el comportamiento fuera del inglés; el soporte del castellano no está garantizado.
- El repositorio tiene 79 descargas y 0 likes, y fue creado y actualizado en fechas de 2026; la madurez y el mantenimiento del proyecto no están contrastados.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base empero-ai/Qwen3.8-4B-Distill, que no se detalla en la información disponible.
- El contexto máximo real no está documentado; el valor 8192 del ejemplo de vLLM es una configuración de servicio, no una especificación del modelo.
- La model card incluye enlaces de afiliado a RunPod; no afectan al modelo, pero conviene tenerlo en cuenta al leer las recomendaciones de despliegue.

## Enlaces

- Repositorio principal (Compressed-Tensors): https://huggingface.co/Vishva007/Qwen3.8-4B-Distill-W4A16-AutoRound-LLM-Compressor
- Variante AutoRound: https://huggingface.co/Vishva007/Qwen3.8-4B-Distill-W4A16-AutoRound
- Variante AutoGPTQ: https://huggingface.co/Vishva007/Qwen3.8-4B-Distill-W4A16-AutoRound-GPTQ
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- README de la variante AutoRound: https://huggingface.co/Vishva007/Qwen3.8-4B-Distill-W4A16-AutoRound/blob/main/README.md
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- RunPod (enlace de afiliado incluido en la model card): https://runpod.io?ref=iabrlp7z
