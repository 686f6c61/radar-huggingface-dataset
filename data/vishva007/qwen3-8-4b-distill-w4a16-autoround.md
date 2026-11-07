# Vishva007/Qwen3.8-4B-Distill-W4A16-AutoRound

## Resumen

Qwen3.8-4B-Distill-W4A16-AutoRound es una versión cuantizada del modelo empero-ai/Qwen3.8-4B-Distill, publicada por el usuario Vishva007 en Hugging Face. Se trata de una compresión a 4 bits de los pesos (W4A16: pesos de 4 bits, activaciones de 16 bits) realizada con el algoritmo Intel AutoRound, que optimiza los parámetros de redondeo por capa para minimizar la pérdida de precisión respecto al modelo original en bfloat16.

El modelo base es un transformer multimodal (pipeline `image-text-to-text`) con capacidades de razonamiento explícito mediante bloques `<think>`, destilado a partir de un modelo mayor. La cuantización mantiene la torre de visión en BF16 y los módulos de predicción multi-token (`mtp`, `mtp.fc`) en bfloat16 nativo, de modo que se preservan las capacidades visuales y de OCR además de las trazas de razonamiento.

Su relevancia práctica es la reducción de requisitos de memoria: según el autor, pasa de aproximadamente 8-10 GB de VRAM en BF16 a unos 2,5-3,5 GB con cuantización W4A16 de grupo 32, lo que permite ejecutarlo en GPUs de consumo de 4-6 GB, portátiles y dispositivos de borde. El repositorio tiene 4,5 GB y, en el momento de la consulta, 14 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); etiqueta de arquitectura `qwen3_5` |
| Parametros totales | 1.541.787.136 (según safetensors del repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue con vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), grupo 32, simétrico; torre de visión y módulos MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato AutoRound); variantes AutoGPTQ y LLM-Compressor/compressed-tensors en repositorios separados |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento desde cero. La arquitectura subyacente corresponde a la familia Qwen3.5, según la etiqueta `qwen3_5` del repositorio, con un componente multimodal de visión que procesa imágenes junto con texto. El modelo base, empero-ai/Qwen3.8-4B-Distill, es un modelo destilado con capacidad de razonamiento explícito en bloques `<think>`, y el proceso de cuantización se calibró específicamente para preservar esas trazas y las capacidades multimodales.

La cuantización se realizó con Intel AutoRound con los siguientes hiperparámetros: 512 muestras de calibración, longitud de secuencia 4096, 1000 iteraciones de ajuste, esquema simétrico y grupo de 32. La torre de visión se excluyó de la cuantización (`quant_nontext_module: False`) y se mantuvo en BF16, y los módulos de predicción multi-token (`mtp`, `mtp.fc`) también se conservaron en bfloat16 nativo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional en formato chat.
- Razonamiento explícito mediante bloques `<think>`, preservados deliberadamente durante la calibración.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con la torre de visión en BF16.
- Reconocimiento de texto en imágenes (OCR) y razonamiento visual, según declara el autor.
- Predicción multi-token (MTP) disponible en bfloat16 para decodificación especulativa o aceleración de generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modo de razonamiento `<think>` es la base para cadenas de pensamiento largas.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue en GPU de consumo: con 2,5-3,5 GB de VRAM estimados, el modelo cabe en tarjetas de 4-6 GB y en portátiles, lo que permite prototipar asistentes multimodales sin infraestructura dedicada.
- Procesamiento de documentos con OCR: al mantener la torre de visión en BF16, es adecuado para extraer texto de capturas, formularios o facturas en un pipeline local de digitalización.
- Razonamiento con trazas auditables: los bloques `<think>` permiten registrar la cadena de razonamiento en aplicaciones de análisis o verificación, útil en entornos donde se requiere trazabilidad.
- Servicio de alto rendimiento con vLLM: el ejemplo del autor (`vllm serve ... --dtype bfloat16 --max-model-len 8192 --gpu-memory-utilization 0.90`) sirve para desplegar una API compatible con OpenAI en una sola GPU.
- Asistente conversacional de borde: la reducción de presión sobre el ancho de banda de memoria acelera la generación en cadenas de razonamiento largas, lo que favorece chatbots en dispositivos con recursos limitados.
- Investigación en cuantización: sirve como caso de estudio reproducible de AutoRound con grupo 32 y 1000 iteraciones sobre un modelo multimodal destilado, comparando las variantes AutoRound, GPTQ y LLM-Compressor.
- Evaluación de destilación multimodal: permite medir cuánto se degrada el razonamiento visual de un modelo destilado al pasar de BF16 a W4A16 en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16 (modelo original): aproximadamente 8-10 GB según el autor.
- VRAM estimada cuantizado (W4A16, grupo 32): aproximadamente 2,5-3,5 GB.
- Cabe en GPUs de consumo de 4 GB y 6 GB, así como en portátiles y dispositivos de borde, según la model card.
- GPUs de datacenter (A100, H100) no se mencionan explícitamente; el modelo es lo bastante pequeño para ejecutarse en cualquier GPU moderna con al menos 4 GB de VRAM.
- Despliegue recomendado: vLLM con el build AutoRound; existen builds específicos para AutoGPTQ y LLM-Compressor/compressed-tensors.
- llama.cpp, Ollama y TGI no se mencionan en la información disponible; no hay confirmación de soporte.
- Throughput y latencia: el autor indica que la cuantización reduce la presión sobre el ancho de banda de memoria y acelera la generación de tokens durante razonamientos largos, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-4B-Distill-W4A16-AutoRound (este) | 1.541.787.136 | no disponible (ejemplo con 8192) | W4A16, grupo 32 | apache-2.0 | Multimodal, visión en BF16, MTP en BF16 |
| empero-ai/Qwen3.8-4B-Distill (base) | no disponible | no disponible | BF16 | no disponible | Modelo de referencia sin cuantizar; ~8-10 GB de VRAM |
| Qwen3.8-4B-Distill-W4A16-AutoRound-GPTQ | mismo modelo base | no disponible | W4A16 en formato GPTQ | apache-2.0 | Misma cuantización en formato AutoGPTQ |
| Qwen3.8-4B-Distill-W4A16-AutoRound-LLM-Compressor | mismo modelo base | no disponible | W4A16 en compressed-tensors | apache-2.0 | Misma cuantización para LLM-Compressor |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Es una cuantización de 4 bits: puede producir degradaciones en tareas sensibles a la precisión numérica, como matemáticas complejas o código de baja frecuencia, aunque la calibración con 1000 iteraciones busca minimizarlas.
- La model card no documenta evaluaciones comparativas frente al modelo en BF16, por lo que la pérdida real de calidad no está cuantificada.
- El número de parámetros del safetensors (1.541.787.136) no coincide con la denominación "4B" del modelo base; conviene verificar el checkpoint antes de dimensionar el despliegue.
- El autor no documenta sesgos, idiomas soportados ni riesgos de alucinación específicos.
- El repositorio tiene un volumen muy bajo de descargas (14) y ningún like, sin señales de validación por parte de la comunidad.
- La model card incluye enlaces de afiliado a RunPod y tablas de plantillas de despliegue ajenas al modelo; no deben interpretarse como requisitos técnicos.
- El contexto máximo real no está declarado; el valor de 8192 procede únicamente del ejemplo de despliegue con vLLM.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente.
- No hay confirmación de soporte en llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue en entornos sin vLLM o sin las librerías de cuantización indicadas.

## Enlaces

- Repositorio principal (AutoRound): https://huggingface.co/Vishva007/Qwen3.8-4B-Distill-W4A16-AutoRound
- Variante AutoGPTQ: https://huggingface.co/Vishva007/Qwen3.8-4B-Distill-W4A16-AutoRound-GPTQ
- Variante LLM-Compressor / compressed-tensors: https://huggingface.co/Vishva007/Qwen3.8-4B-Distill-W4A16-AutoRound-LLM-Compressor
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
