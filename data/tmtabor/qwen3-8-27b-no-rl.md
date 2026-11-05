# tmtabor/Qwen3.8-27B-no-rl

## Resumen

Qwen3.8-27B-no-rl es un ajuste fino (fine-tuning) del modelo Qwen3.8 de 27B parámetros, publicado por el usuario tmtabor en HuggingFace. El modelo se distribuye principalmente en formato GGUF, lo que lo hace directamente consumible por llama.cpp y por el ecosistema de inferencia local. La model card indica que el ajuste fino y la conversión a GGUF se realizaron con Unsloth, y que el modelo es un vision-language-model (VLM), es decir, acepta entradas de imagen además de texto.

El nombre "no-rl" sugiere que el ajuste se hizo sin una fase de reinforcement learning posterior, aunque el autor no documenta el proceso de entrenamiento ni los datos utilizados. Se trata de un modelo de la familia Qwen3.5 (tag `qwen3_5`), con 27.781.427.952 parámetros totales según los pesos en safetensors, y un repositorio de 73,3 GB que incluye tanto los pesos completos como las cuantizaciones GGUF.

La relevancia de esta ficha es limitada: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, no dispone de licencia declarada, no se publican idiomas soportados ni benchmarks, y la model card es mínima. Se documenta aquí lo que sí está disponible, marcando explícitamente todo lo que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); vision-language-model según la model card |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M y BF16 (mmproj); safetensors completos en el repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF (Q4_K_M, BF16-mmproj) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo pertenece a la familia Qwen3.5 y que es un vision-language-model, con un proyector multimodal distribuido como `Qwen3.8-27B.BF16-mmproj.gguf`. El tag `qwen3_5` y el nombre sugieren una arquitectura transformer derivada de Qwen3.5, pero no se especifica el número de capas, la dimensión oculta, el mecanismo de atención ni si emplea atención lineal o decodificación especulativa.

El proceso de entrenamiento no está documentado: la model card solo menciona que el fine-tuning y la conversión a GGUF se hicieron con Unsloth, y que el entrenamiento fue "2x faster" con esa herramienta. No se indica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o alguna fase de alineación. El sufijo "no-rl" apunta a la ausencia de una etapa de reinforcement learning, pero es una inferencia a partir del nombre, no un dato confirmado por el autor.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Procesamiento de imágenes como vision-language-model, con proyector multimodal propio (`BF16-mmproj`).
- Compatibilidad con llama.cpp mediante `llama-cli` (texto) y `llama-mtmd-cli` (multimodal), usando plantillas Jinja (`--jinja`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere uso en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia conversacional local: el modelo puede desplegarse con llama.cpp y una cuantización Q4_K_M para mantener diálogos multi-turno en hardware de consumo, sin depender de APIs externas.
- Análisis de imágenes en local: al ser un VLM con proyector mmproj, permite describir o responder preguntas sobre imágenes usando `llama-mtmd-cli`, útil para prototipos de accesibilidad o catalogación de imágenes.
- Evaluación de fine-tunes de Qwen3.5: sirve como punto de comparación para investigadores que quieran medir el efecto de un ajuste sin RL frente al modelo base.
- Inferencia en entornos con recursos limitados: la cuantización Q4_K_M reduce el peso del modelo respecto a BF16, lo que facilita su ejecución en estaciones de trabajo sin GPUs de datacenter.
- Integración en pipelines de llama.cpp: al ser GGUF nativo, encaja en herramientas que ya consumen este formato (por ejemplo, servidores compatibles con la API de llama.cpp) para tareas de generación de texto o multimodal.
- Experimentación académica con modelos pequeños-medianos: 27B parámetros es un tamaño manejable para estudiar comportamiento de VLM ajustados, siempre que se asuma la falta de documentación del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de 27,8B en BF16 requiere del orden de 55-56 GB solo para pesos; la cuantización Q4_K_M reduce el peso a aproximadamente 16-17 GB, más el proyector mmproj en BF16.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 27B en Q4_K_M puede caber en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con margen ajustado para contexto; en BF16 requeriría A100 80 GB, H100 o varias GPUs.
- ¿Cabe en GPU consumer? La versión Q4_K_M es la única plausible en GPUs de 24 GB; la BF16 no.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por el tag `endpoints_compatible`, servidores de inferencia compatibles con endpoints. vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-no-rl (tmtabor) | 27,8B | no disponible | no disponible | safetensors, GGUF | HuggingFace, 0 descargas |
| Qwen3.5 base (familia Qwen) | no disponible | no disponible | no disponible | no disponible | no disponible en la información |
| Alternativas de ~27B con VLM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos alternativos: la información proporcionada no incluye benchmarks, contexto ni licencia, y no se han identificado en ella modelos comparables concretos.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no se puede confirmar el uso comercial ni las restricciones de redistribución.
- No se documentan los datos de entrenamiento ni el proceso de ajuste, lo que impide evaluar sesgos, contaminación de benchmarks o calidad del fine-tuning.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni evaluación publicada, no hay evidencia sobre su fiabilidad factual.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas distintos del que se usó en el ajuste.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo.
- El modelo tiene 0 descargas y 0 likes, sin validación comunitaria; la model card es mínima y no incluye ejemplos de salida ni limitaciones conocidas.
- El sufijo "no-rl" sugiere ausencia de alineación por reinforcement learning, lo que podría implicar menor robustez en instrucciones complejas o mayor propensión a respuestas no deseadas.
- El repositorio de 73,3 GB incluye pesos completos y GGUF; conviene verificar qué archivos se descargan para no exceder el almacenamiento disponible.

## Enlaces

- [HuggingFace: tmtabor/Qwen3.8-27B-no-rl](https://huggingface.co/tmtabor/Qwen3.8-27B-no-rl)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
