# trohrbaugh/Inkling-Small-heretic-NVFP4

## Resumen

Inkling-Small-heretic-NVFP4 es una cuantización en NVFP4 del modelo trohrbaugh/Inkling-Small-heretic, que a su vez es una versión de thinkingmachines/Inkling-Small sometida a "abliteración" (eliminación direccional del comportamiento de rechazo) mediante la herramienta Heretic. El modelo lo publica el usuario trohrbaugh y su único propósito es reducir el coste de despliegue del modelo padre: pasa de 532 GB en BF16 a 170,7 GB, aproximadamente un tercio del tamaño original.

Se trata de un transformer con mezcla de expertos (MoE) de unos 156 000 millones de parámetros totales, 42 capas, una puerta top-k sobre 256 expertos, una cabeza MTP (multi-token prediction) y torres de visión y audio, lo que lo convierte en un modelo multimodal de entrada imagen-texto (y audio) a texto. La receta de cuantización se obtuvo por ingeniería inversa del checkpoint oficial thinkingmachines/Inkling-Small-NVFP4 y se validó reproduciendo byte a byte los tensores `w13` de los 39 expertos cuantizados.

Su relevancia es doble: por un lado demuestra que es posible cuantizar a FP4 un modelo abliterado preservando la geometría de la dirección de rechazo eliminada; por otro, documenta con métricas de fidelidad muy concretas (KL de ~1×10⁻⁵ nats frente al padre BF16, concordancia top-1 del 100 %) que la cuantización introduce un error tres órdenes de magnitud inferior al de la propia abliteración (0,0466 KL). No se han publicado resultados de benchmarks de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal; 42 capas, puerta top-k sobre 256 expertos, convoluciones cortas, cabeza MTP, torres de visión y audio |
| Parametros totales | 156 032 140 138 (~156,03 B) |
| Parametros activos | no disponible (MoE con gate top-k; el numero de expertos activos por token no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4: pesos E2M1 empaquetados (dos valores por byte, nibble bajo primero), escalas por bloque float8_e4m3 con grupo de 16 en la dimension de entrada, `scale2` float32 por experto; el resto de tensores permanece en BF16 (etiqueta `8-bit` en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors + `hf_quant_config.json`; requiere runtime compatible (vLLM o TensorRT-LLM); `transformers` no puede cargar el checkpoint |
| Tamano del repositorio | 170,8 GB (el modelo declara 170,7 GB, frente a 532 GB en BF16) |
| Cuantizado | 78 tensores: solo los expertos enrutados de las capas 3 a 41 (~94,5 % de los parametros) |
| Modelo base | trohrbaugh/Inkling-Small-heretic (abliterado) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE de 42 capas con enrutado mediante una puerta top-k sobre 256 expertos, complementado con convoluciones cortas, una cabeza MTP (predicción multi-token) y torres específicas de visión y audio. La distribución de pesos es heterogénea: las capas 0 y 1 tienen MLP densas, la capa 2 mantiene sus expertos en BF16 y solo los expertos enrutados de las capas 3 a 41 están en FP4. Todo lo demás (bloques de atención de las 42 capas, routers `mlp.gate`, `mlp.shared_experts`, normalizaciones, convoluciones, embeddings, unembedding, cabeza MTP y torres de visión y audio) permanece en BF16.

No se dispone de información sobre el entrenamiento original de Inkling-Small (número de tokens, composición del dataset, uso de RLHF o DPO); la model card solo documenta el proceso de cuantización y la abliteración previa. La innovación técnica destacable está en la propia receta NVFP4: las escalas por bloque se eligen mediante búsqueda exhaustiva sobre los códigos E4M3 minimizando el error cuadrático de reconstrucción del bloque (con desempate hacia el código inferior), en lugar de la regla `amax/6` habitual, lo que aporta unos 1,4 dB de mejora frente a round-to-nearest (21,81 frente a 20,45 dB). Además se aplica un redondeo consciente de la abliteración: la elección entre los dos niveles E2M1 más próximos se orienta por columna para cancelar `vᵀ(W − Wq)` a lo largo de la dirección de rechazo `v`, recuperada como el vector singular izquierdo dominante del delta entre el padre y Inkling-Small (|cos| por pares ≥ 0,9962). El coste es de 0,001 dB de SQNR y reduce la fuga relativa de 5,68× a 0,29× en la capa 3.

## Capacidades

- Generación de texto conversacional multimodal: acepta entradas de imagen (y audio, por la torre de audio) junto con texto, con pipeline `image-text-to-text`.
- Razonamiento multi-paso mediante cabeza MTP (predicción multi-token), que permite decodificación especulativa sobre varios tokens.
- Modelo abliterado: responde a peticiones que el modelo base rechazaría; el comportamiento de rechazo ha sido eliminado por ablación direccional.
- Capacidades multilingües: no disponibles (no se declara listado de idiomas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible explícitamente; el etiquetado `conversational` y la cabeza MTP son compatibles con flujos multi-paso, pero no se documenta.
- Capacidades especiales: cuantización NVFP4 con escalas por bloque y sesgo de router en float32; ruta de activación W4A4 con valores `input_amax` heredados del export oficial de Thinking Machines.

## Casos de uso

- Despliegue multimodal de gran escala en producción: el modelo acepta imagen y texto con unos 156 B de parámetros totales en 170,7 GB, lo que permite servirlo en 3 GPUs de 80 GB en lugar de las 7 necesarias para el padre BF16 (532 GB).
- Análisis de documentos con figuras: gracias a la torre de visión, se puede usar para extraer información de capturas, gráficos o diagramas junto a texto, siempre que la longitud de contexto se valide empíricamente (no declarada).
- Investigación sobre cuantización extrema FP4: el checkpoint es un caso de estudio reproducible para medir el efecto de NVFP4 en modelos MoE, con métricas de SQNR, coseno y KL documentadas por capa.
- Evaluación de abliteración y seguridad: sirve para estudiar cómo se comporta un modelo sin rechazo en dominios sensibles y para construir clasificadores o filtros de entrada/salida alrededor de él.
- Investigación sobre edición de pesos: el paso a float32 de los 80 tensores de `mlp.gate.bias` y `mlp.gate.global_scale` demuestra cómo un error de precisión en el sesgo de un gate top-k sobre 256 expertos puede reordenar expertos casi empatados; es un caso práctico para estudiar robustez de routers.
- Servicio conversacional en entornos controlados: con vLLM o TensorRT-LLM y aceleración NVFP4 sobre Blackwell, se puede ofrecer un endpoint compatible con la API de endpoints (`endpoints_compatible`) para chat multimodal interno.
- Pipelines de decodificación especulativa: la cabeza MTP puede explotarse para generar varios tokens por paso y reducir la latencia en tareas de generación larga, si el runtime lo soporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card únicamente incluye métricas de fidelidad de la cuantización respecto al padre BF16 y respecto al export oficial de Thinking Machines:

| Metrica | Valor |
|---|---|
| KL(BF16 padre ‖ este modelo) | ~1×10⁻⁵ nats |
| Concordancia top-1 de tokens | 100 % |
| SQNR de reconstruccion de expertos | 21,801–21,810 dB (media 21,804) |
| Similitud coseno, dequantizado vs origen | 0,996694 |
| `w13` frente al export NVFP4 de Thinking Machines | byte a byte exacto, 39/39 capas |
| KL de la abliteracion (padre vs Inkling-Small) | 0,0466 nats (referencia de escala) |

| Metrica por capa (39 capas cuantizadas) | Min | Media | Max |
|---|---|---|---|
| SQNR | 21,801 dB | 21,804 dB | 21,810 dB |
| Coseno | 0,996692 | 0,996694 | 0,996696 |
| Fuga / residual | 0,004× | 0,019× | 0,270× |

| Redondeo en capa 3 (α ≈ 0,99; `|vᵀW|` = 0,135) | Fuga `|vᵀ(W−Wq)|` | Relativo al residual | SQNR |
|---|---|---|---|
| Redondeo simple | 0,769 | 5,68× | 21,807 dB |
| Consciente de abliteracion | 0,039 | 0,29× | 21,806 dB |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 170,8 GB, por lo que se necesitan al menos ~171 GB solo para pesos. Hay que sumar caché KV, activaciones y overhead del runtime.
- GPU recomendadas: 3× H100 80 GB (240 GB) o 3× A100 80 GB como configuración mínima razonable; 4× H100 80 GB para más margen. Dos GPUs de 80 GB (160 GB) no son suficientes.
- GPU consumer: no cabe en ninguna GPU de consumo actual. Una RTX 4090 (24 GB), una RTX 5090 (32 GB) o incluso varias en paralelo quedan muy lejos; se requeriría un clúster multi-GPU con NVLink para un rendimiento aceptable.
- Aceleración específica: la ruta NVFP4 está pensada para hardware Blackwell, donde el formato FP4 tiene soporte nativo; en generaciones anteriores el rendimiento dependerá del soporte del runtime.
- Opciones de despliegue: vLLM o TensorRT-LLM, que leen `hf_quant_config.json`. `transformers` no puede cargar este checkpoint porque el `config.json` heredado de Thinking Machines no incluye `quantization_config`. No hay pesos GGUF, por lo que llama.cpp, Ollama y similares no son una vía de despliegue.
- Latencia y throughput: no disponibles. La model card no aporta cifras de tokens/s ni de TTFT.
- Precaución en W4A4: los valores `input_amax` proceden del export oficial y se calibraron sobre activaciones del modelo base; conviene verificar que el `amax` observado en tráfico propio se mantiene por debajo de esos umbrales.

## Comparativa con modelos similares

| Modelo | Parametros | Precision / formato | Tamano | Contexto | Licencia |
|---|---|---|---|---|---|
| trohrbaugh/Inkling-Small-heretic-NVFP4 | ~156,03 B | NVFP4 (expertos) + BF16, safetensors | 170,7 GB | no disponible | no disponible |
| trohrbaugh/Inkling-Small-heretic | no disponible | BF16, safetensors | 532 GB | no disponible | no disponible |
| thinkingmachines/Inkling-Small-NVFP4 | no disponible | NVFP4, safetensors | ~171 GB | no disponible | no disponible |
| thinkingmachines/Inkling-Small | no disponible | BF16, safetensors | no disponible | no disponible | no disponible |

La comparación relevante es estructural y numérica: el NVFP4 de trohrbaugh reproduce la estructura del export oficial de Thinking Machines (1360 tensores, mismos nombres, formas y dtypes) y mejora al padre en un detalle de precisión (sesgos de router en float32). No hay datos públicos de rendimiento de tareas para ninguno de los cuatro checkpoints en la información disponible, por lo que no es posible comparar calidad entre ellos más allá de las métricas de fidelidad.

## Limitaciones y advertencias

- Modelo abliterado: se ha eliminado el comportamiento de rechazo por ablación direccional. Responderá a peticiones que el modelo base deniega; requiere filtros externos y una política de uso explícita antes de cualquier despliegue público.
- Licencia no disponible: al no declararse licencia, no hay autorización explícita para uso comercial ni garantías de ningún tipo. Es un riesgo legal directo para producción.
- Idiomas no declarados: se desconoce la cobertura multilingüe real y el comportamiento en castellano.
- Longitud de contexto no declarada: no se puede planificar un caso de uso basado en contexto largo sin medirla antes.
- Riesgo de alucinación: no hay evaluaciones de veracidad ni de sesgos publicadas para este checkpoint ni para su padre.
- Dependencia de runtime: solo funciona en vLLM o TensorRT-LLM; no es cargable con `transformers` ni convertible a GGUF con las herramientas habituales.
- Etiqueta `8-bit` en el repositorio: es heredada y no refleja el formato real de los pesos (E2M1 de 4 bits), lo que puede confundir al elegir hardware.
- Fidelidad medida, no calidad: las métricas presentadas (KL, SQNR, coseno) demuestran que la cuantización es fiel al padre, no que el modelo sea bueno en tareas concretas.
- Efecto acumulado de la abliteración: la edición de pesos se realizó en 69 matrices y afecta a todas las proyecciones de salida de atención y a parte de las MLP; puede degradar capacidades no medidas.
- Ruta de activación W4A4: los `input_amax` se calibraron sobre el modelo base y no sobre el abliterado; conviene recalibrar o verificar en tráfico propio.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trohrbaugh/Inkling-Small-heretic-NVFP4
- Modelo base (abliterado): https://huggingface.co/trohrbaugh/Inkling-Small-heretic
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-Small
- Export NVFP4 oficial de Thinking Machines: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
