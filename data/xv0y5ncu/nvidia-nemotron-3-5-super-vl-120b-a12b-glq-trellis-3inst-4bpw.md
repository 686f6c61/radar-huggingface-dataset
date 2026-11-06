# xv0y5ncu/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GLQ-trellis-3inst-4bpw

## Resumen

Esta ficha describe el checkpoint cuantizado `xv0y5ncu/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GLQ-trellis-3inst-4bpw`, una versión en 4 bits por peso del modelo multimodal `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` de NVIDIA. La cuantización la ha realizado un tercero (el usuario `xv0y5ncu`) mediante GLQ, un método propio basado en cuantización con codebook codificado en trellis (QTIP TCQ, variante `3inst`), transformada de Hadamard aleatorizada (RHT) y LDLQ. Los pesos permanecen comprimidos en memoria y se decodifican al vuelo con un kernel CUDA fusionado.

El modelo base es un Nemotron 3.5 de tipo omni/VL con arquitectura `nemotron_h_omni`, orientado a tareas image-text-to-text, con modo de razonamiento (`<think>`) activado por defecto en su plantilla de chat. El checkpoint cuantizado declara 34.976.977.416 parámetros reales en safetensors y un repositorio de 70 GB, coherente con un modelo nominal de 120B en 4 bpw (el nombre comercial "120B-A12B" sugiere una arquitectura con parámetros totales y activos, aunque la información disponible no detalla la configuración MoE).

Su relevancia práctica es doble: por un lado, permite servir un modelo de gran tamaño en hardware más modesto que el BF16; por otro, es un ejemplo de cuantización agresiva (2–4 bpw) con decodificación nativa en un solo paso, sin apilado de residuos. No obstante, el propio autor advierte de que esta build de 4 bpw **no se ha servido de extremo a extremo** y de que las cifras medidas corresponden a la build de 3 bpw. La validación multimodal (imagen y vídeo) tampoco está confirmada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h_omni` (transformer multimodal omni/VL, según `architectures` del repo) |
| Parametros totales | 34.976.977.416 (safetensors del checkpoint cuantizado); nombre comercial del base: 120B-A12B |
| Parametros activos | no disponible (el nombre sugiere A12B, pero no se detalla la configuración MoE) |
| Longitud de contexto | 65.536 tokens en el ejemplo de despliegue (`max_model_len=65536`); el máximo nativo del base no se especifica |
| Tipos de cuantizacion | GLQ 4.0 bpw uniforme (trellis-coded QTIP TCQ variante `3inst` + RHT + LDLQ); torre de visión y proyector en BF16 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW 1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (librería `vllm`, `custom_code` en `auto_map` sin código de modelado incluido) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Nemotron 3.5 de NVIDIA, con pipeline `image-text-to-text` y arquitectura registrada como `nemotron_h_omni`. La información disponible no detalla la composición interna (número de capas, atención, posible mezcla de expertos) más allá del nombre "120B-A12B", que sugiere parámetros totales y activos. Los datasets declarados son `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`, lo que indica un pipeline de preentrenamiento más post-entrenamiento (posiblemente con RLHF/DPO, aunque no se confirma). No se especifica el número de tokens de entrenamiento ni la composición del dataset.

La innovación de este checkpoint es la cuantización GLQ: codebook codificado en trellis (QTIP TCQ, variante `3inst`), transformada de Hadamard aleatorizada y LDLQ, a una tasa uniforme de 4.0 bits por peso (tasa nativa del trellis, una sola pasada de decodificación sin apilado de residuos). El SQNR medio ponderado es de 21,24 dB sobre 41.232 capas cuantizadas, con calibración de 128 muestras × 2.048 tokens de WikiText-2. Los pesos se decodifican al vuelo mediante un kernel CUDA fusionado. La torre de visión y el proyector permanecen en BF16.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat que abre un bloque `<think>` (modo de razonamiento activado por defecto).
- Razonamiento explícito mediante modo thinking; NVIDIA recomienda temperatura 1.0 y top_p 0.95 para muestreo de texto.
- Capacidad multimodal declarada (image-text-to-text) en el modelo base; en este checkpoint la cuantización solo afecta al modelo de lenguaje y **la entrada de imagen y vídeo no ha sido validada**.
- Soporte multilingüe declarado para inglés, español, francés, alemán, italiano y japonés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: el campo `limit_mm_per_prompt` incluye `audio`, pero no se confirma soporte real ni validación.

## Casos de uso

- **Servicio de chat de texto con razonamiento en vLLM**: el checkpoint está pensado para servirse con `quantization="glq"`, `dtype="bfloat16"` y el plugin de vLLM de GLQ ≥ 0.8.33. Adecuado para asistentes conversacionales que se beneficien del bloque `<think>` y de una ventana de 65.536 tokens.
- **Despliegue en hardware con VRAM limitada**: al mantener los pesos a 4.0 bpw con decodificación al vuelo, reduce la huella de memoria frente al BF16, lo que permite servir un modelo de escala 120B nominal en nodos con menos memoria que la necesaria para el base.
- **Procesamiento de documentos largos en varios idiomas**: con 65.536 tokens de contexto y soporte de en, es, fr, de, it y ja, encaja en tareas de resumen, extracción y Q&A sobre textos extensos.
- **Generación de código y asistencia técnica**: el autor distribuye el wrapper `glq-code`; el modelo puede usarse en flujos de asistencia a programación siempre que se valide la calidad tras la cuantización a 4 bpw.
- **Investigación en cuantización**: útil como referencia reproducible para estudiar el impacto de GLQ (QTIP TCQ + RHT + LDLQ) a 4 bpw frente al base BF16, con métricas de SQNR publicadas.
- **Evaluación de pipelines multimodales (con cautela)**: el modelo base es image-text-to-text, por lo que puede emplearse para experimentar con entrada de imagen, pero el autor indica que esta build no ha validado imagen ni vídeo y que los snippets desactivan la entrada multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de cuantización: SQNR medio de 21,24 dB sobre 41.232 capas y calibración con 128 muestras × 2.048 tokens de WikiText-2. Las cifras de rendimiento medidas corresponden a la build de 3 bpw, no a esta de 4 bpw.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 70 GB; a 4.0 bpw los pesos del modelo de lenguaje rondan esa cifra, más la torre de visión y el proyector en BF16 y el overhead de KV cache para 65.536 tokens. Para servir con contexto completo se recomienda un nodo con al menos 80 GB de VRAM, y preferiblemente 2×80 GB si se usa contexto largo.
- **GPU recomendadas**: A100 80 GB, H100 80 GB o H200 para contexto completo; en consumer, no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) con los pesos completos.
- **Consumer GPU**: no es viable en GPU de consumo individual; requeriría offloading a CPU o sharding multi-GPU.
- **Opciones de despliegue**: vLLM con el plugin GLQ (`quantization="glq"`, `dtype="bfloat16"`), instalado vía `pip install 'glq[vllm]>=0.8.33' 'transformers==5.19.0'`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponible; el autor indica que esta build de 4 bpw no se ha servido de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GLQ 4 bpw) | 34,98B en safetensors (nominal 120B-A12B) | 65.536 en ejemplo | GLQ 4.0 bpw | OpenMDW 1.1 | Hugging Face, 41 descargas |
| `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` | Nominal 120B-A12B | no disponible | BF16 | OpenMDW 1.1 | Hugging Face (base oficial) |
| Build GLQ 3 bpw del mismo autor | Nominal 120B-A12B | no disponible | GLQ 3.0 bpw | OpenMDW 1.1 | Hugging Face (con métricas medidas) |

No se dispone de datos de benchmarks para comparar rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- **Build no validada de extremo a extremo**: el autor indica explícitamente que esta build de 4 bpw no se ha servido todavía; las cifras medidas son de la build de 3 bpw.
- **Multimodalidad no validada**: la cuantización solo afecta al modelo de lenguaje; imagen y vídeo no se han probado. Los ejemplos desactivan la entrada multimodal con `limit_mm_per_prompt={"image": 0, "video": 0, "audio": 0}`.
- **Requisitos estrictos de versiones**: GLQ ≥ 0.8.33 y transformers ≥ 5.18 (probado con 5.19.0). Con transformers 5.17 el modelo falla al cargar por código remoto no disponible; el instalador de GLQ fija 5.17.0, por lo que hay que actualizar manualmente.
- **No usar `--trust-remote-code`**: el repo mantiene el `auto_map` de NVIDIA pero no incluye código de modelado, así que el flag falla.
- **Usar BF16, no FP16**: en FP16 el modelo cierra el bloque `<think>` de inmediato sin error ni NaN; esta build solo se ha ejecutado en BF16.
- **Riesgo de alucinación y sesgos**: inherentes al modelo base; no se documentan evaluaciones específicas tras la cuantización.
- **Licencia OpenMDW 1.1**: es una licencia "other" con términos propios; conviene revisar el texto antes de un uso comercial.
- **Contexto**: el valor de 65.536 tokens es el usado en el ejemplo, no necesariamente el máximo nativo del modelo base.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/xv0y5ncu/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GLQ-trellis-3inst-4bpw
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Build GLQ 3 bpw: https://huggingface.co/xv0y5ncu/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GLQ-trellis-3inst-3bpw
- Repositorio GLQ: https://github.com/cnygaard/glq
- Instalador GLQ: https://raw.githubusercontent.com/cnygaard/glq/main/install.sh
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Paper referenciado (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
