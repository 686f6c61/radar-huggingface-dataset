# Zhongzhu/lowbarena-trial3-27b-b-nvfp4-axion-fp8head-int4emb

## Resumen

lowbarena-trial3-27b-b-nvfp4-axion-fp8head-int4emb es un checkpoint cuantizado derivado de Qwen/Qwen3.5-27B, publicado por el usuario Zhongzhu dentro del marco denominado LowBArena. No se trata de un modelo entrenado desde cero, sino de una reempaquetado de pesos ya cuantizados con el objetivo de servir el modelo de forma eficiente en vLLM sobre hardware NVIDIA Blackwell. El checkpoint conserva la licencia Apache-2.0 del modelo base.

La peculiaridad tecnica de este release es la mezcla heterogenea de precisiones: las capas lineales del decodificador usan NVFP4 (W4A4) con escalas procedentes de AxionML/Qwen3.5-27B-NVFP4, la cabeza de salida emplea FP8 por canal con activaciones FP8 dinamicas por token, y el embedding de entrada se almacena en INT4 con grupo 32. Las proyecciones GDN `in_proj_a`/`in_proj_b` se mantienen en BF16. El encoder de vision y la cabeza MTP no se incluyen, por lo que el checkpoint es exclusivamente de texto.

El repositorio declara 14.732.516.864 parametros en safetensors y un tamano de 15,7 GB. Aunque el modelo base se denomina "27B", el recuento real de parametros es inferior, coherente con la exclusion del encoder de vision y de la cabeza MTP. Es un artefacto de muy baja difusion (5 descargas, 0 likes) y con proposito aparente de experimentacion o validacion de pipelines de cuantizacion, mas que de uso general en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen/Qwen3.5-27B; se referencia GDN (Gated DeltaNet) en las proyecciones `in_proj_a`/`in_proj_b`, lo que apunta a capas de atencion lineal hibrida. Detalle completo no disponible |
| Parametros totales | 14.732.516.864 (texto unicamente; sin encoder de vision ni cabeza MTP) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4) en capas lineales del decodificador; FP8 por canal en la cabeza de salida con activaciones FP8 dinamicas por token; INT4 grupo 32 en el embedding de entrada; BF16 en `in_proj_a`/`in_proj_b` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, empaquetado con compressed-tensors (`nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

No se ha realizado entrenamiento adicional sobre los pesos base: el checkpoint es una conversion de cuantizacion post-entrenamiento (PTQ) del modelo Qwen/Qwen3.5-27B, revision `fc05daec18b0a78c049392ed2e771dde82bdf654`. Los pesos NVFP4 de las capas lineales del decodificador se toman de AxionML/Qwen3.5-27B-NVFP4 (generado con ModelOpt, Apache-2.0) y se reempaquetan en el formato `nvfp4-pack-quantized` de compressed-tensors para su consumo por vLLM.

La referencia a proyecciones GDN (`in_proj_a`/`in_proj_b`) sugiere que el modelo base incorpora componentes de atencion lineal tipo Gated DeltaNet, mantenidas en BF16 en este checkpoint para preservar su estabilidad numerica. El resto de la pila se cuantiza de forma agresiva: 4 bits en pesos y activaciones de las lineales, FP8 en la cabeza de salida e INT4 en el embedding. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni el uso de RLHF/DPO en Qwen3.5-27B.

## Capacidades

- Generacion de texto en modo texto unicamente (el encoder de vision y la cabeza MTP no estan incluidos).
- Razonamiento y generacion de codigo heredados del modelo base, sujetos a la perdida de precision inherente a la cuantizacion NVFP4/FP8/INT4.
- Ejecucion de inferencia de alta eficiencia en vLLM gracias al formato compressed-tensors.
- Compatible con las capacidades de tool calling y agentes que ofrezca el modelo base, aunque no se documentan explicitamente en la informacion disponible.
- Capacidades multilingues no especificadas; dependen del modelo base y no se detallan.
- Sin soporte de vision, audio ni modalidades adicionales en este checkpoint.

## Casos de uso

- Servicio de inferencia a gran escala en vLLM: el uso de NVFP4 y compressed-tensors reduce el ancho de banda de memoria frente a BF16, permitiendo mayor throughput por GPU en despliegues con hardware Blackwell.
- Experimentacion con pipelines de cuantizacion: resulta util como referencia para validar el empaquetado `nvfp4-pack-quantized` y comparar la degradacion de calidad frente al modelo base en BF16.
- Generacion de codigo asistida en entornos de desarrollo: puede integrarse en backends de autocompletado o revision de codigo siempre que la precision cuantizada sea suficiente para la tarea.
- Procesamiento por lotes de texto (clasificacion, resumen, extraccion): adecuado para cargas offline donde prima el coste por token sobre la fidelidad absoluta.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como punto de partida para medir el impacto de mezclar NVFP4, FP8 e INT4 en un mismo modelo.
- Prototipado de agentes de texto: aprovechable en flujos multi-turno y multi-paso, sujeto a las capacidades reales del modelo base.
- Investigacion en eficiencia energetica: la reduccion de precision permite estimar ahorros de VRAM y potencia en GPUs Blackwell frente a alternativas BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 14,73 mil millones de parametros, los pesos NVFP4 ocupan aproximadamente 7,4 GB; sumando embedding INT4, cabeza FP8 y overhead de runtime, el modelo puede residir en torno a 8-10 GB de VRAM, si bien el repositorio ocupa 15,7 GB en disco.
- GPUs recomendadas: el soporte nativo de NVFP4 requiere arquitectura NVIDIA Blackwell (por ejemplo B200 o la serie RTX 50). En generaciones anteriores (Ada, Ampere) FP4 no esta soportado de forma nativa y requeriria desquantizacion o fallback, con penalizacion de rendimiento.
- Cabe en GPU de consumo: previsiblemente en RTX 5090 (32 GB) y otras Blackwell con suficiente VRAM; no confirmado para RTX 4090 (Ada, 24 GB) al no contar con FP4 nativo.
- Opciones de despliegue: vLLM (libreria declarada, `library_name: vllm`) con soporte de compressed-tensors. No se documenta compatibilidad con llama.cpp, Ollama o TGI para este formato NVFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zhongzhu/lowbarena-trial3-27b-b-nvfp4-axion-fp8head-int4emb | 14,73 B (texto) | NVFP4 + FP8 + INT4 | no disponible | Apache-2.0 | HuggingFace, formato compressed-tensors |
| Qwen/Qwen3.5-27B (base) | 27 B (nominal) | BF16 (original) | no disponible | Apache-2.0 | HuggingFace |
| AxionML/Qwen3.5-27B-NVFP4 | 27 B (nominal) | NVFP4 (ModelOpt) | no disponible | Apache-2.0 | HuggingFace |

Nota: no se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada. Los resultados de busqueda mencionan releases NVFP4 sobre Qwen3.8-27B (QUASAR y GSQ/RCO), que corresponden a un modelo base distinto y no son directamente comparables con este checkpoint.

## Limitaciones y advertencias

- Se trata de un checkpoint experimental (5 descargas, 0 likes) sin validacion publica de calidad; no deberia asumirse paridad con el modelo base en BF16.
- La cuantizacion mixta NVFP4/FP8/INT4 puede introducir degradacion en tareas sensibles a la precision, especialmente en matematicas y razonamiento de varios pasos.
- Sin encoder de vision ni cabeza MTP: el checkpoint es texto unicamente, lo que descarta cualquier tarea multimodal o de decodificacion especulativa multitoken.
- Requiere hardware NVIDIA Blackwell para aprovechar NVFP4 de forma nativa; en otras GPUs el rendimiento puede degradarse significativamente.
- La compatibilidad se limita a vLLM y al formato compressed-tensors; no hay soporte documentado para llama.cpp, Ollama u otros runners.
- Riesgo de alucinacion heredado del modelo base, no cuantificado en la informacion disponible.
- Sesgos conocidos, cobertura idiomatica y limitaciones de contexto: no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero debe respetarse la atribucion correspondiente al modelo base Qwen/Qwen3.5-27B y a los pesos NVFP4 de AxionML.
- Al ser un "trial checkpoint" sin mantenimiento declarado, no hay garantia de actualizaciones, soporte ni correccion de errores.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Zhongzhu/lowbarena-trial3-27b-b-nvfp4-axion-fp8head-int4emb
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Fuente de los pesos NVFP4: https://huggingface.co/AxionML/Qwen3.5-27B-NVFP4
- Discusion sobre despliegue NVFP4 de la familia Qwen (contexto): https://huggingface.co/Qwen/Qwen3.8-27B/discussions/132
- Nota sobre compresion NVFP4 con QUASAR (modelo base distinto): https://thevalue.engineering/news/quasar-compresses-qwen-27b-nvfp4-enterprise-inference.html
- Nota sobre GGUFs GSQ/RCO (modelo base distinto): https://kblip.com/releases/two-new-quantization-releases-target-qwen3-8-27b-gsq-rco-c1R0ftY
- Soporte de Qwen en hardware AMD (contexto general): https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
