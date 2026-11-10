# yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep2

## Resumen

El modelo `yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep2` es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario yungisimon. El objetivo declarado es convertir el modelo base en un "memory model", es decir, un modelo entrenado específicamente para tareas de recuperación y uso de memoria contextual a partir de pares sintéticos de pregunta-respuesta generados sobre el conjunto BrowseComp-Plus. El checkpoint publicado corresponde a la época 2 de un total de 3 épocas de entrenamiento.

Se trata de un modelo de 32.763.876.352 parámetros (32,7 mil millones), todos ellos entrenables al 100% durante el ajuste, con pesos en bf16 safetensors y compatibles con la librería `transformers` estándar. La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only con atención de tipo causal, y hereda del modelo base una ventana de contexto de 131.072 tokens (aunque el entrenamiento se realizó con una longitud máxima de secuencia de 8.096 tokens).

La relevancia de este modelo es limitada y experimental: se publica bajo licencia Apache 2.0, sin métricas de evaluación publicadas, con cero descargas y cero likes en el momento de la ficha, y con una model card muy escueta. Es un artefacto de investigación más que un modelo listo para producción, útil para quienes quieran estudiar el efecto del ajuste fino orientado a memoria sobre un modelo de 32B, pero sin garantías de rendimiento en tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen2) |
| Parametros totales | 32.763.876.352 (32,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base; entrenamiento con 8.096 tokens de secuencia máxima |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible en la model card (el modelo base Qwen2.5 soporta múltiples idiomas, pero el ajuste no documenta idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni componentes híbridos. El ajuste fino es completo (no LoRA ni adaptadores): los 32.763.876.352 parámetros son entrenables al 100%, según declara el autor. El entrenamiento se realizó con FSDP sobre 8 GPU AMD Instinct MI325X, con un tamaño de lote efectivo de 1024 (64 por dispositivo, 2 acumulaciones de gradiente, 8 GPU), tasa de aprendizaje constante de 2e-5 con warmup del 5%, weight decay de 0,01, norma máxima de gradiente de 1,0, precisión bf16, checkpointing de gradiente y cálculo de la pérdida únicamente sobre los tokens del asistente. La longitud máxima de secuencia fue de 8.096 tokens y el entrenamiento total de 3 épocas supuso 20,80 horas de reloj (166,4 GPU-horas).

El conjunto de datos es `bcp_subset300_numsamplingepochs1_crossdoc_entity_combination_v3.json`, con 2.968.214 ejemplos sintéticos de pregunta-respuesta generados sobre BrowseComp-Plus. El autor no detalla la composición, el número total de tokens procesados ni si hubo etapas de RLHF o DPO adicionales; solo se indica que el objetivo es entrenar un "memory model". No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-32B-Instruct.
- Razonamiento y respuesta a preguntas con uso de memoria contextual, objetivo principal del ajuste.
- Capacidad de seguir la plantilla de chat de Qwen (chat template) para conversaciones multi-turno.
- Soporte de tool calling y function calling: no documentado en la model card; se desconoce si el ajuste preserva esta capacidad del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas en la model card; dependen del modelo base y del posible olvido catastrófico durante el ajuste.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Investigación sobre memoria en modelos de lenguaje: el modelo sirve como artefacto para estudiar cómo un ajuste fino completo sobre pares sintéticos de memoria afecta a las capacidades del modelo base, comparando con Qwen2.5-32B-Instruct original.
- Experimentos de recuperación de información en dominios documentales: dado que se entrenó sobre BrowseComp-Plus, puede emplearse para probar la capacidad de responder preguntas que requieren combinar entidades de varios documentos, aunque sin métricas publicadas no hay garantía de calidad.
- Evaluación de olvido catastrófico: útil para medir cuánto se degradan las capacidades generales (código, matemáticas, multilingüismo) tras un ajuste fino de 3 épocas sobre un dataset específico.
- Generación de respuestas conversacionales con contexto largo: el modelo base soporta 131.072 tokens, por lo que puede usarse en prototipos de chat con documentos extensos, siempre que se valide que el ajuste no ha degradado esta capacidad.
- Base para nuevos ajustes: al estar publicado en safetensors y ser compatible con `transformers`, puede servir como punto de partida para fine-tunings posteriores en tareas de memoria o QA documental.
- Reproducción de experimentos: permite replicar el entrenamiento descrito (FSDP, 8 GPU, bf16) y comparar el checkpoint de la época 2 con el de la época 3 si el autor lo publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para los pesos (32,76 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se necesitan al menos 2 GPU de 48 GB o una GPU de 80 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: alrededor de 33 GB, viable en una A100 40 GB o H100 80 GB; en 4 bits, alrededor de 17 GB, viable en una RTX 4090 24 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB, AMD MI325X (usada en entrenamiento); para consumer, RTX 4090 24 GB solo con cuantización agresiva no oficial.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (método declarado por el autor), además de vLLM, TGI o llama.cpp si se generan cuantizaciones, aunque no están documentadas ni verificadas.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep2 | 32,7 B | 131.072 (base); 8.096 en entrenamiento | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen/Qwen2.5-32B-Instruct | 32,7 B | 131.072 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados por Qwen |
| Qwen/Qwen2.5-32B | 32,7 B | 131.072 | Apache 2.0 | Hugging Face | Versión base sin instrucciones |
| Mistral Large 2 (referencia) | 123 B | 128.000 | Licencia comercial Mistral | API y pesos | No comparable en tamaño; se cita solo como referencia de la categoría |

No se dispone de datos de rendimiento del modelo ajustado que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones, por lo que se desconoce si el ajuste mejora o degrada las capacidades del modelo base.
- Riesgo elevado de olvido catastrófico: un full fine-tuning de 3 épocas sobre 2,97 millones de ejemplos sintéticos puede degradar capacidades generales como código, matemáticas o multilingüismo.
- Riesgo de alucinación: al ser un modelo entrenado sobre pares sintéticos de QA, puede generar respuestas plausibles pero incorrectas, especialmente en dominios no cubiertos por BrowseComp-Plus.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equivalente al del modelo base.
- Contexto efectivo limitado en la práctica a 8.096 tokens durante el entrenamiento, aunque el modelo base soporte 131.072; el comportamiento más allá de esa longitud no está validado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental sin garantías, no se recomienda su uso en producción sin una evaluación exhaustiva previa.
- Modelo con 0 descargas y 0 likes: sin comunidad que haya validado su comportamiento; el soporte y la documentación son mínimos.
- No se documentan cuantizaciones oficiales, por lo que el despliegue en hardware consumer requiere generarlas y validarlas por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio de Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- BrowseComp (benchmark de referencia): https://openai.com/index/browsecomp/
