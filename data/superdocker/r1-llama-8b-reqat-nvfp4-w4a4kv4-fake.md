# superdocker/R1-Llama-8B-ReQAT-nvfp4-w4a4kv4-fake

## Resumen

R1-Llama-8B-ReQAT-nvfp4-w4a4kv4-fake es un checkpoint de investigación publicado por el usuario superdocker que aplica entrenamiento consciente de cuantización (QAT) sobre DeepSeek-R1-Distill-Llama-8B, un modelo de razonamiento de 8.030 millones de parámetros derivado de Llama 3.1 8B Base y destilado a partir de DeepSeek-R1. El objetivo es preservar la capacidad de razonamiento del modelo original bajo una cuantización agresiva de 4 bits en pesos, activaciones y caché KV (W4A4KV4) en formato NVFP4.

La técnica empleada, ReQAT, combina tres componentes: Trace-Aligned QAT (alineación de trazas de razonamiento durante el entrenamiento cuantizado), Selective Entropy Minimization (minimización selectiva de entropía) e inicialización amigable con la cuantización mediante transformaciones. El ajuste se realizó sobre el subconjunto de matemáticas del dataset OpenThoughts3-1.2M, con aproximadamente 350 millones de tokens de entrenamiento según el paper asociado.

Es relevante porque aborda uno de los cuellos de botella prácticos del razonamiento a gran escala: el coste de memoria e inferencia. Sin embargo, esta release concreta es un checkpoint *fake-quantized*: los tensores se almacenan en BF16 y la cuantización se aplica en tiempo de ejecución, por lo que no ofrece por sí misma ganancias nativas de memoria o throughput a 4 bits. Está pensada para investigación en razonamiento de baja precisión y evaluación de benchmarks, no como artefacto de producción listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), clase `LlamaFakeQuantizedModelOPTForCausalLM` |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1 8B; valor exacto no confirmado) |
| Tipos de cuantizacion | NVFP4 W4A4KV4 (4 bits en pesos, activaciones y cache KV); `cfg=nvfp4`, `kv_cfg=nvfp4_e1m2`, `kv_quant=true`, `shift_k=true` |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (con condiciones adicionales de la Llama 3.1 Community License aplicables por herencia) |
| Formato de pesos | safetensors en BF16 (checkpoint fake-quantized) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Llama-8B, un transformer decoder-only de tipo Llama con 8.030 millones de parámetros, destilado por DeepSeek a partir de R1 y construido sobre Llama 3.1 8B Base. Sobre esa base, ReQAT aplica un pipeline de entrenamiento consciente de cuantización dirigido a NVFP4 con cuantización de pesos, activaciones y caché KV a 4 bits. El entrenamiento utiliza el subconjunto de matemáticas de OpenThoughts3-1.2M y, según el paper, alrededor de 350 millones de tokens.

Las innovaciones técnicas declaradas son tres: Trace-Aligned QAT, que alinea las trazas de razonamiento generadas por el modelo cuantizado con las del modelo de precisión completa durante el ajuste; Selective Entropy Minimization, que reduce la entropía en posiciones seleccionadas para estabilizar la generación de cadenas de razonamiento; y Quantization-Friendly Initialization via Transformation (Q-FIT), que transforma los pesos antes de cuantizar para reducir el error. La configuración incluye un desplazamiento de claves post-RoPE (`shift_k=true`) y una caché KV en formato E1M2, comportamientos que no están implementados en Transformers estándar ni en vLLM sin modificaciones: es necesario el runtime `vllm_custom` del repositorio ReQAT.

## Capacidades

- Generación de texto y razonamiento multi-paso con cadenas de pensamiento extensas, heredadas de la destilación de DeepSeek-R1.
- Razonamiento matemático y resolución de problemas cuantitativos (el ajuste se centró en el subconjunto de matemáticas de OpenThoughts3).
- Generación y razonamiento sobre código, evaluable mediante LiveCodeBench según el repositorio.
- Modo de pensamiento activable mediante la variable de entorno `ENABLE_THINKING=true` en el runtime de referencia.
- Evaluación en benchmarks de razonamiento científico y de propósito general (GPQA-Diamond, GSM8K, AIME-2024, AIME-2025, AIME-90, MATH-500).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y orquestación multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en cuantización de baja precisión: el checkpoint sirve como referencia para reproducir y analizar el comportamiento de modelos de razonamiento bajo W4A4KV4, comparando trazas y precisión frente al modelo en BF16.
- Evaluación de benchmarks de matemáticas: ejecutable sobre MATH-500, AIME-2024, AIME-2025, AIME-90 y GSM8K con el script `inference.py` del repositorio ReQAT, útil para medir la degradación introducida por la cuantización.
- Estudio de métodos QAT: permite experimentar con las tres técnicas de ReQAT (TAQ, SEM, Q-FIT) y analizar su contribución individual al rendimiento en razonamiento.
- Validación de runtimes personalizados: sirve para probar la implementación `vllm_custom` y verificar la correcta aplicación de la cuantización fake y el desplazamiento de claves post-RoPE.
- Investigación en eficiencia de caché KV: al usar `kv_cfg=nvfp4_e1m2` y `kv_quant=true`, permite estudiar el impacto de una caché KV a 4 bits en la calidad de las cadenas de razonamiento largas.
- Preparación de despliegues nativos NVFP4: el checkpoint puede servir como paso previo a la exportación nativa mediante `deploy/trtllm/` para evaluar throughput en GPUs Blackwell, aunque el runtime estándar de TensorRT-LLM no reproduce el comportamiento E1M2 ni el K-shift de ReQAT.
- Generación de soluciones de código asistida: con el runtime adecuado, puede emplearse para experimentos de generación de código evaluados con LiveCodeBench, siempre con verificación humana de los resultados.

## Benchmarks y rendimiento

El paper reporta un 41,85 % de precisión en AIME-120 para R1-Llama-8B con NVFP4 W4A4KV4 (TAQ + Q-FIT + SEM completos, 350 millones de tokens de entrenamiento, Tabla 2). El autor advierte que este valor corresponde a la configuración del paper y no ha sido verificado de forma independiente para este checkpoint exacto.

| Benchmark | Resultado | Notas |
|---|---|---|
| AIME-120 | 41,85 % | Configuración del paper; no verificado para este checkpoint |
| MATH-500 | no disponible | Soportado por el runtime, sin cifra publicada |
| AIME-2024 / AIME-2025 / AIME-90 | no disponible | Soportados por el runtime, sin cifra publicada |
| GSM8K | no disponible | Soportado por el runtime, sin cifra publicada |
| GPQA-Diamond | no disponible | Soportado por el runtime, sin cifra publicada |
| LiveCodeBench | no disponible | Soportado por el runtime, sin cifra publicada |

No se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse en BF16, el checkpoint ocupa aproximadamente 16,1 GB en disco y requiere memoria GPU para el modelo almacenado, la caché KV y los buffers del runtime; el tamaño del repositorio es de 16,1 GB.
- GPUs objetivo: generación Hopper de NVIDIA (H100, H200) o superior, incluida B200, según el autor.
- GPU de consumo: no se indica compatibilidad con GPUs de consumo; el checkpoint no ofrece ganancias nativas de memoria al ser fake-quantized y el runtime está orientado a Hopper o superior.
- Despliegue: requiere el entorno ReQAT con sus componentes ModelOpt, vLLM y lighteval, y la implementación `vllm_custom`; un pipeline estándar de Transformers o un vLLM sin modificar no implementan esta configuración. Para throughput nativo NVFP4 en Blackwell existe la ruta `deploy/trtllm/`.
- Paralelismo: el número de GPUs visibles determina el tensor parallelism; se ajusta mediante `CUDA_VISIBLE_DEVICES`.
- Latencia y throughput: no disponibles en la información proporcionada; el autor señala explícitamente que la release fake-quantized no establece por sí misma ganancias de memoria o throughput a 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| R1-Llama-8B-ReQAT-nvfp4-w4a4kv4-fake | 8.030 M | no disponible | NVFP4 W4A4KV4 fake-quantized | MIT (+ Llama 3.1 Community License) | Hugging Face, 10 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8.030 M | no disponible | BF16 (precisión completa) | MIT | Hugging Face, modelo base público |
| Otros modelos de razonamiento de ~8B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (modelos de razonamiento de 8B con cuantización de 4 bits publicada) no está disponible en la información proporcionada. El contraste más relevante es con su propio modelo base en BF16, que carece de la cuantización W4A4KV4 y del pipeline ReQAT.

## Limitaciones y advertencias

- El checkpoint es fake-quantized: los tensores se almacenan en BF16 y la cuantización se aplica en tiempo de ejecución, por lo que no proporciona reducción nativa de memoria ni mejoras de throughput a 4 bits.
- Requiere un runtime específico (`vllm_custom` del repositorio ReQAT); no funciona con Transformers estándar ni con vLLM sin modificar, lo que limita su portabilidad.
- El resultado de AIME-120 del 41,85 % corresponde a la configuración del paper y no ha sido verificado de forma independiente para este checkpoint concreto.
- La cuantización de la caché KV en E1M2 y el desplazamiento de claves post-RoPE no se reproducen en TensorRT-LLM estándar, por lo que la precisión puede diferir del runtime de investigación.
- Riesgo de alucinación y de generar respuestas incorrectas, sesgadas o engañosas; el autor exige verificación de los resultados.
- Idiomas: únicamente inglés, lo que limita su uso en aplicaciones en castellano u otras lenguas.
- Sesgos conocidos: no se detallan sesgos específicos en la información proporcionada; al derivar de Llama 3.1 8B Base y DeepSeek-R1, hereda los sesgos de sus predecesores.
- Licencia: aunque la release es MIT, el modelo base deriva de Meta Llama 3.1 8B Base, por lo que también aplican la Llama 3.1 Community License y sus condiciones de uso, incluida la cláusula de nombre de modelo y las restricciones de uso aceptable.
- Orientado a investigación, experimentos de cuantización y evaluación de benchmarks; no está pensado como artefacto de producción listo para desplegar.
- Contexto: la longitud de contexto no se especifica en la información disponible y debe confirmarse contra el modelo base antes de usarlo en tareas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/superdocker/R1-Llama-8B-ReQAT-nvfp4-w4a4kv4-fake
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio de código ReQAT: https://github.com/aiha-lab/ReQAT
- Commit de referencia del runtime: https://github.com/aiha-lab/ReQAT/tree/55038ae6ac807a33f9192a25a03f54a03789d21e
- Script de inferencia: https://github.com/aiha-lab/ReQAT/blob/55038ae6ac807a33f9192a25a03f54a03789d21e/inference.py
- Ruta de despliegue TensorRT-LLM: https://github.com/aiha-lab/ReQAT/tree/55038ae6ac807a33f9192a25a03f54a03789d21e/deploy/trtllm
- Licencia del código ReQAT: https://github.com/aiha-lab/ReQAT/blob/55038ae6ac807a33f9192a25a03f54a03789d21e/LICENSE
- Paper (ICML 2026, PMLR): https://proceedings.mlr.press/v306/lee26an.html
- arXiv: https://arxiv.org/abs/2606.15682
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Sección de licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B#7-license
