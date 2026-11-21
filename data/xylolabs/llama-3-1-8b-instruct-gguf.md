# Xylolabs/Llama-3.1-8B-Instruct-GGUF

## Resumen

Xylolabs/Llama-3.1-8B-Instruct-GGUF es una redistribucion cuantizada en formato GGUF del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. No se trata de un modelo nuevo ni de un fine-tuning: es una conversion de pesos y cuantizacion del checkpoint oficial de Meta, manteniendo el tokenizador original, la plantilla de chat y la licencia Llama 3.1 Community. El repositorio ofrece tres variantes de cuantizacion (Q5_K_M, Q4_K_M e IQ4_XS-imat) con metricas de divergencia respecto a BF16 medidas por el propio autor.

El modelo base es un transformer denso de 8.030.261.312 parametros (8B) con una ventana de contexto de 128.000 tokens segun la documentacion oficial de Llama 3.1, orientado a generacion de texto conversacional, razonamiento, codigo y soporte de tool calling. La relevancia de esta publicacion concreta radica en que facilita el despliegue en hardware modesto: la variante Q4_K_M ocupa 4,92 GB en disco, lo que permite ejecucion en GPUs de consumo y en CPU.

La ficha se centra en las caracteristicas del artefacto GGUF y de su modelo base. Los datos de benchmarks del modelo original no se incluyen en la informacion proporcionada, por lo que se indica explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), familia Llama 3.1 |
| Parametros totales | 8.030.261.312 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (modelo base Llama 3.1); el ejemplo de la model card usa `-c 8192` |
| Tipos de cuantizacion | Q5_K_M, Q4_K_M, IQ4_XS-imat |
| Idiomas soportados | Ingles y coreano (segun tags del repo); el modelo base oficial soporta 8 idiomas |
| Licencia | Llama 3.1 Community License (con Acceptable Use Policy adicional) |
| Formato de pesos | GGUF (un archivo por cuantizacion; incluye tokenizador y plantilla de chat) |
| Tamano del repo | 15,1 GB |
| Cuantizaciones disponibles | Q5_K_M: 5,73 GB; Q4_K_M: 4,92 GB; IQ4_XS-imat: 4,45 GB |
| Compatibilidad | llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct de Meta: un transformer decoder-only denso con atencion por grupos (GQA), entrenado por Meta y publicado en julio de 2024 junto con el informe tecnico arXiv:2407.21783. El modelo original fue entrenado con datos multilingues y posteriormente alineado mediante tecnicas de instruction tuning y preferencias (RLHF/DPO), segun la documentacion publica de Meta. La informacion proporcionada no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset para esta variante.

La contribucion de Xylolabs se limita a la conversion de pesos a GGUF y a la cuantizacion. Las variantes Q4_K_M y Q5_K_M emplean cuantizacion K-quant estandar (tipos Q4_K, Q5_K, Q6_K y F32 residuales), mientras que IQ4_XS-imat utiliza cuantizacion i-quant con matriz de importancia (importance matrix) generada a partir de texto en ingles y coreano. El autor reporta metricas de fidelidad frente a su propia pasada en BF16 sobre 16.056 posiciones: Q5_K_M presenta una KL media de 0,0107 y un 94,53% de coincidencia top-1; Q4_K_M, 0,0323 y 91,06%; IQ4_XS-imat, 0,0359 y 90,61%. No se documentan innovaciones arquitectonicas adicionales, ya que el modelo base no las incorpora respecto a la familia Llama 3.1.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat integrada en el archivo GGUF.
- Razonamiento y respuesta a instrucciones en ingles y coreano (idiomas declarados por el autor); el modelo base oficial cubre ademas aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Generacion de codigo y tareas de matematicas basicas e intermedias, heredadas del modelo base.
- Soporte de tool calling y function calling, segun las capacidades declaradas por Meta para Llama 3.1 Instruct.
- Capacidad de seguir instrucciones y mantener contexto largo gracias a la ventana de 128.000 tokens del modelo base (sujeta a la configuracion de `-c` en llama.cpp).
- Ejecucion en CPU, CUDA y Metal mediante llama.cpp, con soporte de `llama-cli` y `llama-server` (este ultimo expone una API compatible con OpenAI).
- No incluye vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU dedicada: con la variante Q4_K_M (4,92 GB) el modelo puede ejecutarse en CPU mediante llama.cpp, lo que permite prototipado local de asistentes conversacionales sin infraestructura cloud.
- Asistente de codigo en local: integrable en editores o terminales a traves de `llama-server` con API compatible con OpenAI, adecuado para autocompletado y explicacion de fragmentos en entornos con requisitos de privacidad.
- Atencion al cliente automatizada: la ventana de 128.000 tokens del modelo base permite gestionar conversaciones multi-turno con historial extenso y documentacion adjunta, siempre que se configure el contexto adecuadamente en llama.cpp.
- Procesamiento de documentos largos en ingles o coreano: resumen y extraccion de informacion de contratos, informes o transcripciones que quepan en la ventana de contexto, con la fidelidad reducida propia de la cuantizacion Q4.
- Generacion aumentada por recuperacion (RAG) en local: el modelo puede combinarse con indices vectoriales y ejecutarse en GPU de consumo (por ejemplo, RTX 3060 de 12 GB con Q5_K_M), manteniendo los datos dentro de la organizacion.
- Evaluacion y experimentation academica: al ser una cuantizacion ligera con metricas de divergencia publicadas (KL y top-1 frente a BF16), es util para estudiar el impacto de la cuantizacion en tareas downstream.
- Chatbot multilingue limitado a ingles y coreano: para otros idiomas conviene recurrir al checkpoint original de Meta, ya que el autor solo declara soporte para esos dos idiomas en esta publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de fidelidad de la cuantizacion frente a su pasada de referencia en BF16:

| Cuantizacion | Tamano | KL media vs BF16 | Coincidencia top-1 vs BF16 |
|---|---|---|---|
| Q5_K_M | 5,73 GB | 0,0107 | 94,53% |
| Q4_K_M | 4,92 GB | 0,0323 | 91,06% |
| IQ4_XS-imat | 4,45 GB | 0,0359 | 90,61% |

Estas cifras miden la divergencia respecto a BF16 sobre 16.056 posiciones de texto en ingles y coreano, no el rendimiento en tareas (MMLU, HumanEval, GSM8K u otras). No se dispone de datos de benchmarks del modelo base en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6,5 GB para Q5_K_M, 4,5-5,5 GB para Q4_K_M y 4-5 GB para IQ4_XS-imat, incluyendo overhead de contexto y cache KV (dependiente de la longitud de contexto configurada).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M o Q5_K_M; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: si, en modelos con 6-8 GB o mas de VRAM. Con contextos de 128.000 tokens la cache KV crece significativamente y puede requerir GPU de 24 GB o particionado entre GPU y CPU.
- Opciones de despliegue: llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior) mediante `llama-cli` y `llama-server`; el formato GGUF es tambien compatible con otros runners basados en llama.cpp, aunque el autor solo documenta y garantiza ese commit.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen del hardware, la cuantizacion y la longitud de contexto; en CPU la generacion sera notablemente mas lenta que en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Llama-3.1-8B-Instruct-GGUF | 8,03B | 128.000 (modelo base) | GGUF | Llama 3.1 Community | Cuantizaciones Q5_K_M, Q4_K_M, IQ4_XS-imat con metricas KL publicadas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128.000 | safetensors | Llama 3.1 Community | Checkpoint oficial en BF16; requiere ~16 GB de VRAM o cuantizacion adicional |
| Mistral-7B-Instruct | ~7,2B | 32.000 | safetensors, GGUF | Apache 2.0 | Menor contexto y licencia mas permisiva; disponible en multiples cuantizaciones de la comunidad |
| Qwen2.5-7B-Instruct | ~7,6B | 128.000 | safetensors, GGUF | Apache 2.0 | Contexto comparable y licencia permisiva; soporte multilingue mas amplio |

La comparativa se limita a parametros, contexto, formato y licencia, ya que no se dispone de resultados de benchmarks en la informacion proporcionada. La ventaja principal de esta publicacion frente al checkpoint oficial es el menor requisito de VRAM y la ejecucion en CPU; su desventaja es la perdida de fidelidad inherente a la cuantizacion y el menor soporte idiomatico declarado (solo ingles y coreano).

## Limitaciones y advertencias

- La cuantizacion introduce divergencia respecto a BF16: incluso Q5_K_M pierde aproximadamente un 5,5% de coincidencia top-1, lo que puede afectar a tareas sensibles a la precision como generacion de codigo o matematicas.
- El autor solo declara soporte para ingles y coreano en esta publicacion, aunque el modelo base oficial cubre mas idiomas; el rendimiento en espanol no esta verificado para esta variante.
- Riesgo de alucinacion inherente al modelo base Llama 3.1 8B, especialmente en contextos largos y en tareas de conocimiento factual.
- Sesgos conocidos del modelo original de Meta (sesgos de genero, raza, idioma y culturales) que se heredan sin modificacion.
- Licencia Llama 3.1 Community: uso comercial permitido con condiciones adicionales (politica de uso aceptable, obligaciones de atribucion y clausula de escala para mas de 700 millones de usuarios mensuales). Es obligatorio revisar `LICENSE` y `USE_POLICY.md` antes de un despliegue en produccion.
- Xylolabs no esta afiliada ni respaldada por Meta; la responsabilidad sobre la calidad de la cuantizacion recae en el publicador.
- El modelo no incluye vision, audio ni modo de razonamiento extendido; para esas capacidades es necesario recurrir a otros modelos.
- El ejemplo de la model card configura `-c 8192`, muy por debajo de los 128.000 tokens del modelo base; usar contextos largos exige ajustar la configuracion y disponer de VRAM suficiente para la cache KV.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-GGUF
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Informe tecnico Llama 3 (arXiv): https://arxiv.org/abs/2407.21783
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit recomendado de llama.cpp: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Licencia Llama 3.1: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-GGUF/blob/main/LICENSE
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
