# Xylolabs/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Tensix-BFP4

## Resumen
Este repositorio contiene una cuantización BFP4 (block floating point de 4 bits) del modelo Qwen3.6-35B-A3B en su variante "Uncensored HauhauCS Aggressive", publicada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo original es un fine-tune sin censura de Qwen/Qwen3.6-35B-A3B, un transformer híbrido de tipo MoE con 34.660.610.688 parámetros totales y aproximadamente 3B activos por token, según indica el nombre del checkpoint (A3B). La particularidad de esta ficha es que no se distribuye en BF16, sino con las capas lineales cuantizadas a `ttnn.bfloat4_b` mediante GPTQ, lo que reduce el peso del modelo de lenguaje a 20,99 GB empaquetados.

La relevancia de esta publicación es doble. Por un lado, es una de las pocas exportaciones públicas de un modelo de 35B en formato nativo para TT-NN, lo que permite desplegar un MoE grande en hardware Tenstorrent sin conversión manual. Por otro, el proceso de cuantización es inusualmente transparente: la model card documenta el origen de los pesos (un GGUF Q8_K_P del fine-tune), el número de tensores que coinciden bit a bit con el modelo base (529 de 693) y los que portan los cambios del fine-tune (164, en las capas 13 a 39).

Conviene subrayar que este checkpoint es solo texto: no incluye torre de visión ni capa MTP, y debe cargarse con `AutoModelForCausalLM`. La licencia declarada es Apache-2.0, heredada del modelo base Qwen, aunque el fine-tune sin censura añade consideraciones de uso que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención completa y Gated DeltaNet (linear attention), derivado de Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 |
| Parametros activos | Aproximadamente 3B (según el sufijo A3B del nombre; no se detalla cifra exacta en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; bf16 en embeddings, LM head, normas y gate del experto compartido; media de 4,84 bits por peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con metadatos `quant4.json` e índice `model.safetensors.index.json`), pensado para TT-NN; no hay release en BF16 |

## Arquitectura y entrenamiento
El modelo base Qwen3.6-35B-A3B es un transformer híbrido: combina 10 capas con atención completa (proyecciones q, k, v, o) y 30 capas con Gated DeltaNet (proyecciones q, k, v, z, a, b y output), un mecanismo de atención lineal con estado recurrente. El componente MoE se reparte en 40 capas con expertos enrutados (gate, up, down) más un experto compartido. Esta exportación cuantiza todas esas proyecciones a BFP4 con GPTQ, manteniendo en bf16 el gate del experto compartido, el LM head, el embedding y las normas, lo que da un total de 4,84 bits por peso y 20,99 GB empaquetados.

El fine-tune de HauhauCS se distribuye originalmente solo como GGUF. Xylolabs tomó el archivo `Q8_K_P` (revisión `f12a584f`, sha256 `d5efc2a1...`), lo dequantizó y remapeó los tensores a los nombres y el layout del modelo base. La verificación contra los pesos BF16 originales muestra que 529 de los 693 tensores del modelo de lenguaje son idénticos bit a bit dentro del almacenamiento del GGUF (Q8_0, F16 o F32), mientras que 164 tensores, en las capas 13 a 39, incorporan los cambios de bajo rango del fine-tune. La calibración de GPTQ usó 65.536 tokens de WikiText-2 y Wikipedia en coreano, con una búsqueda de exponente por bloque; los expertos enrutados comparten una Hessiana por capa para gate y up, y cada down usa la suya o redondeo al más cercano si vio pocos tokens de calibración.

## Capacidades
- Generación de texto conversacional multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y generación de código, heredados del modelo base Qwen3.6-35B-A3B (no se documentan evaluaciones específicas en esta exportación).
- Capacidad multilingüe: no confirmada en esta ficha; la calibración incluyó coreano, pero no se declara la lista de idiomas soportados.
- Sin modo "thinking" documentado en esta exportación; la model card no menciona modos de razonamiento extendido.
- Sin soporte de visión: la exportación es solo texto y debe cargarse con `AutoModelForCausalLM`.
- Sin capa MTP propia; para decodificación especulativa puede usarse la capa MTP del modelo base como drafter, manteniendo los tokens verificados de este modelo.
- Sin ajuste de rechazo: el fine-tune elimina las negativas del modelo base, por lo que no incorpora salvaguardas propias.
- Tool calling y uso como agente: no documentado en la información disponible para esta exportación.

## Casos de uso
- Despliegue en aceleradores Tenstorrent: el caso principal. Un equipo con Wormhole o Blackhole puede cargar los pesos directamente en TT-NN con `ttnn.as_tensor` y el dtype `ttnn.bfloat4_b`, sin conversión intermedia, gracias a que las matrices se almacenan como valores bf16 sobre la rejilla BFP4.
- Investigación en cuantización de bajo bit: la documentación de `quant4.json`, la Hessiana compartida por capa y el recuento de tensores verificados permiten reproducir y auditar el pipeline GPTQ sobre un MoE híbrido de 35B.
- Servicio de generación de texto en entornos controlados: con 20,99 GB de pesos más KV cache y buffers, cabe en una sola tarjeta de 32 GB o en un dispositivo Tensix con DRAM suficiente, lo que facilita instancias de chat autoalojadas.
- Evaluación de fine-tunes sin censura: útil para estudiar el efecto de eliminar el ajuste de rechazo en las capas 13 a 39, comparando contra el modelo base con la misma cuantización.
- Prototipado de decodificación especulativa: usar la capa MTP del Qwen3.6-35B-A3B original como drafter y verificar con este checkpoint, manteniendo la distribución del fine-tune.
- Docencia y experimentación con atención híbrida: las 30 capas Gated DeltaNet cuantizadas permiten medir el impacto de BFP4 en mecanismos de atención lineal frente a atención completa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: 20,99 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers; el repo completo ocupa 69,3 GB.
- Hardware objetivo: NPUs Tenstorrent Tensix, familias Wormhole y Blackhole, con TT-NN 0.81.1 (verificado en el simulador ttsim de Blackhole).
- GPU convencionales: la carga con `transformers` y `dtype="bfloat16"` requiere al menos 70 GB de memoria para los pesos descomprimidos, por lo que no cabe en GPUs de consumo como la RTX 4090 (24 GB); sí cabría en A100 80 GB o H100 80 GB.
- Despliegue: TT-NN (`ttnn`) para Tensix; `transformers` con `AutoModelForCausalLM` y `device_map="auto"` para GPUs. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Tensix-BFP4 | 34,66B totales, ~3B activos | No disponible | BFP4 (4,5 bits) en capas lineales | Apache-2.0 | Safetensors para TT-NN; solo texto |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 34,66B totales, ~3B activos | No disponible | GGUF Q8_K_P y otras | Apache-2.0 | GGUF; incluye torre de visión según el origen |
| Qwen/Qwen3.6-35B-A3B | 34,66B totales, ~3B activos | No disponible | BF16 | Apache-2.0 | Pesos completos con visión y capa MTP |

## Limitaciones y advertencias
- Modelo sin censura: el fine-tune elimina el ajuste de rechazo y la model card indica que no rechaza prompts; requiere salvaguardas externas en cualquier despliegue público.
- Sin torre de visión ni capa MTP: no sirve para tareas imagen-texto pese a que el modelo base las soporta.
- No hay release en BF16 de este fine-tune; la referencia es el checkpoint dequantizado del GGUF, con posibles diferencias de redondeo respecto al original.
- La cuantización BFP4 a 4,5 bits puede degradar tareas sensibles a precisión; no se publican evaluaciones que cuantifiquen esa pérdida.
- Longitud de contexto e idiomas soportados no documentados en esta ficha; no asumir los del modelo base sin verificación.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la ausencia de ajuste de rechazo.
- Licencia Apache-2.0 heredada, pero el uso comercial de un modelo sin censura puede incumplir políticas de plataforma o normativa local; la responsabilidad recae en el desplegador.
- El formato está atado a TT-NN: fuera de Tensix exige dequantizar a bf16, con el coste de memoria correspondiente.

## Enlaces
- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Tensix-BFP4
- Modelo fuente (fine-tune): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Tensix-BFP4/blob/main/LICENSE
