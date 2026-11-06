# tmtabor/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y vision (vision-language model) publicado por el usuario tmtabor en Hugging Face, derivado de la familia Qwen3 y afinado con Unsloth para su posterior conversion a formato GGUF. El repositorio contiene pesos en safetensors y cuantizaciones GGUF listas para su uso con llama.cpp, lo que facilita el despliegue en entornos locales. El modelo cuenta con 27.781.427.952 parametros totales (aproximadamente 27,8 mil millones) y un tamano de repositorio de 73,3 GB.

La relevancia de esta ficha radica en que se trata de una publicacion reciente (noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto poco validado por la comunidad. La model card es extremadamente escasa: solo documenta el proceso de conversion a GGUF con Unsloth y proporciona comandos de ejemplo para su uso con `llama-cli` y `llama-mtmd-cli`. No se especifican datos de entrenamiento, licencia, idiomas ni benchmarks.

Dado que la informacion disponible es minima, esta ficha prioriza la verificabilidad: los datos tecnicos confirmados (parametros, formato, herramientas de inferencia) se presentan con rigor, mientras que cualquier dato no documentado se marca explicitamente como "no disponible". El lector debe tratar este modelo con cautela hasta que el autor publique una model card completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en Hugging Face; presumiblemente transformer denso de la familia Qwen3) |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M; BF16 para el proyector multimodal (`BF16-mmproj.gguf`); safetensors en BF16 presumiblemente |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La informacion disponible no permite confirmar la arquitectura interna. La etiqueta `qwen3_5` en Hugging Face sugiere que el modelo deriva de la familia Qwen3, y la presencia de un archivo `BF16-mmproj.gguf` confirma que se trata de un modelo multimodal con un proyector de vision separado, tipico de los vision-language models. El tamano de 27,8 B parametros es consistente con un transformer denso de escala media-grande, aunque no se puede descartar una arquitectura MoE sin confirmacion del autor.

Respecto al entrenamiento, la model card solo indica que el modelo fue afinado y convertido a GGUF usando Unsloth, una herramienta que acelera el fine-tuning y la cuantizacion. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otras tecnicas de alineacion, ni el modelo base exacto sobre el que se hizo el fine-tuning. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Procesamiento multimodal de imagen y texto: la presencia del archivo `BF16-mmproj.gguf` y la instruccion de uso con `llama-mtmd-cli` confirman soporte de vision.
- Compatibilidad con llama.cpp mediante los comandos `llama-cli` (texto) y `llama-mtmd-cli` (multimodal).
- Soporte de plantillas de chat mediante el flag `--jinja`, lo que permite usar el formato de conversacion definido en el tokenizer.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas de Hugging Face).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, modo thinking ni soporte multilingue especifico.

## Casos de uso

- Prototipado local de asistentes conversacionales multimodales: el modelo puede cargarse con `llama-mtmd-cli` en una maquina con suficiente VRAM para mantener conversaciones que combinen texto e imagenes, gracias a la cuantizacion Q4_K_M que reduce el peso a aproximadamente 16-17 GB.
- Experimentacion con vision-language models en entornos sin GPU de datacenter: la version Q4_K_M permite ejecutar el modelo en GPUs consumer de gama alta (24 GB de VRAM) o en configuraciones con offloading a CPU, algo inviable con el modelo en BF16.
- Evaluacion comparativa de fine-tunes de Qwen3: investigadores que quieran medir el impacto de un fine-tuning comunitario sobre la base Qwen3 pueden usar este checkpoint como punto de partida, aunque deberian validar primero su calidad con sus propios benchmarks.
- Integracion en pipelines de llama.cpp: al estar en GGUF, el modelo puede integrarse en aplicaciones basadas en `llama-cpp-python` o servidores compatibles con la API de llama.cpp para tareas de generacion de texto e imagen a texto.
- Docencia y formacion: sirve como ejemplo practico de conversion de un modelo multimodal a GGUF con Unsloth, util en talleres sobre despliegue de modelos open source.
- Investigacion sobre cuantizacion: comparar la salida de la version Q4_K_M con la de BF16 (si se dispone de ella en safetensors) permite estudiar la degradacion por cuantizacion en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 16-17 GB solo para los pesos, mas overhead de contexto y del proyector multimodal; en la practica se recomiendan 20-24 GB de VRAM.
- VRAM estimada en BF16: aproximadamente 55-56 GB solo para los pesos, por lo que requiere GPUs de datacenter (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- GPU consumer: la version Q4_K_M cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB); en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) requeriria offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`); no se documenta soporte verificado para vLLM, TGI u Ollama, aunque al ser GGUF podria importarse en Ollama manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| tmtabor/Qwen3.8-27B | 27,8 B | no disponible | no disponible | safetensors, GGUF | Hugging Face, 0 descargas |
| Qwen3 (modelos oficiales de Alibaba) | variable (segun variante) | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Hugging Face oficial |
| Gemma 3 27B (Google) | 27 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Hugging Face oficial |

La comparativa se limita a la categoria por tamano, ya que no se dispone de datos de rendimiento del modelo analizado. Cualquier comparacion cuantitativa seria especulativa y no se incluye.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, licencia, idiomas ni evaluaciones, lo que impide validar su calidad y legalidad de uso.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; debe contactarse con el autor o asumirse riesgo legal.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Riesgo de alucinacion no cuantificado: al no haber benchmarks ni evaluaciones, no se puede estimar la fiabilidad del modelo.
- Sesgos desconocidos: sin informacion sobre la composicion del dataset de fine-tuning, no es posible evaluar sesgos de genero, etnia, idioma o dominio.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas distintos del ingles.
- Contexto no documentado: se desconoce la ventana maxima, lo que impide planificar casos de uso con documentos largos.
- El nombre "Qwen3.8-27B" no corresponde a ninguna nomenclatura oficial de Alibaba; es una denominacion del autor y podria inducir a confusion con modelos oficiales de la familia Qwen3.
- El fine-tuning con Unsloth y la conversion a GGUF no garantizan paridad de comportamiento con el modelo base; conviene validar antes de usar en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tmtabor/Qwen3.8-27B
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
