# taobao-mnn/DeepSeek-R1-0528-Qwen3-8B-MNN

## Resumen

DeepSeek-R1-0528-Qwen3-8B-MNN es la version cuantizada para el motor de inferencia MNN (Mobile Neural Network, de Alibaba) del modelo deepseek-ai/DeepSeek-R1-0528-Qwen3-8B. Este modelo base es un Qwen3-8B destilado con datos de razonamiento de DeepSeek-R1-0528, orientado a matematicas, codigo y razonamiento logico. El repositorio lo publica taobao-mnn, el equipo que mantiene el ecosistema MNN.

La relevancia de esta ficha esta en el formato: no es un checkpoint estandar de Hugging Face (safetensors/GGUF), sino un paquete MNN con pesos cuantizados en HQQ 4-bit (grupo 128) y embeddings en BF16 separados, pensado para ejecucion en CPU con bajo consumo de memoria. Esto lo hace util para despliegue en dispositivos y entornos sin GPU, donde llama.cpp u otros runtimes no encajan.

La arquitectura subyacente es un transformer denso de 8B parametros (36 capas, dimension oculta 4096). La licencia es MIT, heredada del modelo base. El modelo esta pensado para generar cadenas de razonamiento ("thinking") antes de la respuesta final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8B (aproximado, segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit, grupo 128 (capas lineales y output head); embeddings BF16; escalas FP16 |
| Idiomas soportados | zh, en |
| Licencia | MIT |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_bf16.bin`, `tokenizer.mtok`) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3-8B (transformer denso, 36 capas, hidden size 4096) afinado mediante destilacion con datos de razonamiento de DeepSeek-R1-0528. Es decir, no se entrena desde cero: se parte de Qwen3-8B y se le ensena a reproducir trazas de razonamiento del modelo mayor de DeepSeek. El objetivo declarado es matematicas, codigo y razonamiento logico.

Esta version MNN aplica cuantizacion HQQ (Half-Quadratic Quantization) a 4 bits con tamano de grupo 128 sobre las capas lineales del lenguaje y el output head, manteniendo las escalas en FP16 y los embeddings en BF16 en un fichero aparte (`embeddings_bf16.bin`). El paquete incluye el grafo (`llm.mnn`), los pesos (`llm.mnn.weight`), el tokenizador (`tokenizer.mtok`) y la configuracion de ejecucion (`config.json`, `llm_config.json`). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generacion de texto con cadena de razonamiento explicita (modo thinking): el modelo emite el proceso de pensamiento antes de la respuesta.
- Razonamiento matematico y resolucion de ecuaciones (el ejemplo de la model card es `2x + 3 = 11`).
- Generacion de codigo y razonamiento logico, segun el objetivo declarado del modelo base.
- Traduccion (la validacion de exportacion incluye casos de traduccion).
- Conversacion multi-turno basica (prueba de "greeting" en la validacion).
- Idiomas: chino (zh) e ingles (en).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Inferencia en CPU sin GPU: el paquete MNN con HQQ 4-bit esta disenado para ejecutarse en CPU (configuracion por defecto: 4 hilos, `precision=low`, `memory=low`), lo que permite desplegar un modelo de 8B en equipos sin acelerador dedicado.
- Aplicaciones moviles y de borde: MNN es el runtime de Alibaba orientado a dispositivos; este paquete encaja en apps Android/iOS o embebidos que necesiten razonamiento local sin conexion.
- Tutorizacion de matematicas: el modelo genera pasos intermedios de razonamiento, util para explicar la resolucion de problemas paso a paso en una app educativa.
- Asistencia a la programacion en local: generacion y explicacion de codigo en un entorno de desarrollo sin dependencia de la nube, gracias a la licencia MIT y al despliegue en CPU.
- Prototipado rapido de pipelines de razonamiento: el formato MNN y el `llm_demo` permiten validar el comportamiento del modelo con un binario ligero antes de integrarlo en produccion.
- Traduccion zh-en / en-zh en dispositivos: los dos idiomas soportados y el bajo footprint permiten traducir localmente en herramientas de escritorio o moviles.
- Evaluacion de tecnicas de cuantizacion: util como referencia para comparar HQQ 4-bit frente a otras cuantizaciones (GGUF Q4, AWQ) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica de forma directa; el paquete esta pensado para CPU. El repo ocupa 9.5 GB, pero el peso efectivo en ejecucion con HQQ 4-bit es sustancialmente menor (los pesos de 8B a 4 bits rondan los 4-5 GB, mas embeddings BF16).
- GPU recomendadas: no disponibles; la configuracion por defecto es CPU con 4 hilos.
- Cabe en GPU consumer: no documentado para este paquete MNN concreto; el modelo base de 8B en cuantizaciones de 4 bits es apto para GPUs consumer, pero este formato esta orientado a CPU.
- Opciones de despliegue: MNN (`llm_demo`), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`. Version validada: MNN 3.6.2 (commit `b0239771b07b317a258fbc384683bbd540741406`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-0528-Qwen3-8B-MNN (este) | 8B | no disponible | MNN (HQQ 4-bit) | MIT | Optimizado para CPU via MNN |
| deepseek-ai/DeepSeek-R1-0528-Qwen3-8B (base) | 8B | no disponible | safetensors | MIT | Checkpoint original sin cuantizar |
| Qwen3-8B | 8B | no disponible | safetensors/GGUF | no disponible en esta ficha | Modelo original del que deriva la destilacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declaran los idiomas chino e ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- El modelo genera cadenas de razonamiento largas, lo que incrementa la latencia y el consumo de tokens; la longitud se controla con `max_new_tokens` en `config.json`.
- Riesgo de alucinacion inherente a los modelos de razonamiento destilados, especialmente en matematicas y codigo fuera de distribucion.
- La cuantizacion HQQ 4-bit puede degradar la precision frente al modelo base en tareas sensibles; no se han publicado metricas de la perdida de calidad.
- El formato MNN limita la portabilidad: no es directamente compatible con ecosistemas como vLLM, llama.cpp u Ollama.
- No se documenta soporte de tool calling ni de agentes; no asumir esas capacidades en produccion.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de destilacion de DeepSeek antes de un despliegue comercial.
- No se dispone de informacion sobre sesgos especificos del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/DeepSeek-R1-0528-Qwen3-8B-MNN
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- ModelScope: https://modelscope.cn/models/MNN/DeepSeek-R1-0528-Qwen3-8B-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
