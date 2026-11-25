# tcorbettclark/britllm-3b-v0.1-4bit-mlx

## Resumen

BritLLM 3B v0.1 en formato MLX 4-bit es una conversion no oficial del modelo base britllm/britllm-3b-v0.1, realizada por el usuario tcorbettclark para su ejecucion en Apple Silicon mediante la libreria MLX. El modelo original es un transformer de tipo Llama con 2.670.103.040 parametros (aproximadamente 2,67 mil millones), orientado a generacion de texto y conversacion. Esta version concreta aplica cuantizacion afina de 4 bits con tamano de grupo 64 y modo affine, reduciendo el peso de los safetensors a 1,50 GB.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 3B parametros en hardware Apple (chips de la serie M) con un consumo de memoria muy reducido, manteniendo la licencia ODC-BY del modelo original. Es una pieza pensada para el ecosistema mlx-lm, incluyendo flujos de fine-tuning con LoRA sobre el propio modelo cuantizado.

No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni los datos de entrenamiento del modelo base en la informacion proporcionada; estos datos deben consultarse en la model card del repositorio original britllm/britllm-3b-v0.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivada del modelo base britllm-3b-v0.1) |
| Parametros totales | 2.670.103.040 (2,67 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | ODC-BY (Open Data Commons Attribution License) |
| Formato de pesos | safetensors (MLX), 1,50 GB; SHA-256 7b67b9b99848cfc7be1d6ce5f60ef0240501e27e453dcda9ec5e02416fe608e8 |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer de tipo Llama, segun indican las etiquetas del repositorio (tag `llama`). Esta conversion no modifica la arquitectura: unicamente aplica cuantizacion afina a 4 bits con tamano de grupo 64 y modo affine, usando los valores por defecto de `mlx_lm convert --quantize`. Ademas, se anade una plantilla de chat minima en `tokenizer_config.json` para el flujo de SFT con enmascaramiento de prompt de mlx-lm. No se realizaron otros cambios en los pesos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada. La conversion se construyo con mlx-lm 0.32.2 y mlx 0.32.4 el 2026-11-18, a partir de la revision `061e58f46f45f9c957c945249c577fe2ddf0fe5f` del repositorio original.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y el tag `conversational` confirma su orientacion a dialogos multi-turno.
- Soporte de plantilla de chat: se ha incorporado una plantilla minima en `tokenizer_config.json` compatible con el flujo de SFT de mlx-lm.
- Fine-tuning con LoRA: el repositorio esta disenado para servir como modelo base en los widgets LoRA de Orange AI Suite y para entrenamiento directo con `python -m mlx_lm lora`.
- Razonamiento, codigo y matematicas: no se documenta de forma explicita en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Capacidades especiales (modo thinking, vision, audio): no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Prototipado local en Mac con Apple Silicon: el modelo ocupa 1,50 GB en safetensors, por lo que se puede cargar en un Mac con 8 GB de memoria unificada y ejecutar con mlx-lm sin GPU dedicada, ideal para pruebas de concepto y demos.
- Fine-tuning con LoRA sobre hardware de consumo: al estar preparado para `mlx_lm lora`, permite adaptar el modelo a dominios concretos (soporte, documentacion interna, estilo editorial) en un MacBook Pro, sin necesidad de clusteres.
- Asistente conversacional embebido en aplicaciones de escritorio: su tamano reducido y su naturaleza conversacional lo hacen adecuado para integrarse en apps nativas de macOS mediante MLX, con latencia baja y sin conexion a la nube.
- Generacion de texto en pipelines de contenido: redaccion asistida, resumenes y reescritura en lotes pequenos donde el coste por token importa mas que la calidad de un modelo frontier.
- Base para experimentacion academica: investigacion sobre cuantizacion, tecnicas de ajuste fino eficiente en parametros y evaluacion de degradacion por cuantizacion 4-bit frente al modelo original en fp16.
- Desarrollo de plugins y widgets para Orange AI Suite: el repositorio esta pensado explicitamente como base para los widgets LoRA de esa suite, sirviendo como punto de partida para herramientas de IA locales en macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 1,5 GB solo para los pesos en 4-bit; con overhead de runtime MLX, el consumo realista se situa en torno a 2-3 GB de memoria unificada.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible de forma nativa con CUDA; requeriria conversion a otro formato (GGUF, safetensors estandar) para GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: si, en cualquier Mac con al menos 8 GB de memoria unificada. En GPUs NVIDIA de consumo (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB) seria viable tras reconvertir los pesos, pero esta version concreta no esta pensada para ello.
- Opciones de despliegue: `mlx-lm` (libreria nativa del repo), integracion con Orange AI Suite (widgets BritLLM Models y LoRA). No se documenta soporte directo para vLLM, llama.cpp, Ollama o TGI en esta version MLX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BritLLM 3B v0.1 (4-bit MLX, este repo) | 2,67 B | no disponible | 4-bit affine, group 64 | ODC-BY | Hugging Face, MLX |
| britllm/britllm-3b-v0.1 (original) | 2,67 B | no disponible | fp16 (presumiblemente) | ODC-BY | Hugging Face |
| Llama 3.2 3B Instruct | 3,2 B | 128 K (segun model card oficial) | multiples (GGUF, MLX, etc.) | Llama 3.2 Community License | Hugging Face, amplio ecosistema |
| Qwen2.5 3B Instruct | 3,1 B | 32 K (segun model card oficial) | multiples (GGUF, MLX, etc.) | Apache 2.0 | Hugging Face, amplio ecosistema |

La comparativa con Llama 3.2 3B y Qwen2.5 3B se ofrece como referencia de categoria (modelos de ~3B parametros para generacion de texto), pero no se dispone de datos de benchmarks que permitan comparar el rendimiento real de BritLLM 3B frente a ellos.

## Limitaciones y advertencias

- Conversion no oficial: no esta publicada por los autores originales de BritLLM; la trazabilidad depende del repositorio tcorbettclark y del hash SHA-256 documentado.
- Cuantizacion 4-bit: introduce degradacion de calidad respecto al modelo en fp16, especialmente en tareas de razonamiento y generacion de codigo. No se documenta la magnitud de esta perdida.
- Idiomas y contexto desconocidos: al no informarse la ventana de contexto ni los idiomas soportados, no se puede garantizar su comportamiento en produccion multilingue o con prompts largos.
- Riesgo de alucinacion: inherente a los modelos de ~3B parametros; no se documentan evaluaciones de fidelidad ni de tasas de alucinacion.
- Sesgos conocidos: no documentados en la informacion disponible; deben evaluarse de forma independiente antes de un uso en produccion.
- Licencia ODC-BY: permite uso comercial con atribucion. Es obligatorio acreditar a los autores originales de BritLLM y mantener la licencia en obras derivadas.
- Ecosistema restringido: al ser una conversion MLX, no es directamente desplegable en vLLM, TGI, llama.cpp u Ollama sin reconversion previa.
- Uso comercial: verificar los terminos exactos de ODC-BY y, en su caso, las condiciones del modelo base original antes de integrarlo en productos.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/tcorbettclark/britllm-3b-v0.1-4bit-mlx
- Modelo base original: https://huggingface.co/britllm/britllm-3b-v0.1
- Revision del modelo base usada en la conversion: `061e58f46f45f9c957c945249c577fe2ddf0fe5f`
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Licencia ODC-BY: https://opendatacommons.org/licenses/by/1-0/
