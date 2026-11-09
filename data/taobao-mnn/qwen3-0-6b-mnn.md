# taobao-mnn/Qwen3-0.6B-MNN

## Resumen

Qwen3-0.6B-MNN es una exportación cuantizada a 4 bits del modelo Qwen3-0.6B de Alibaba, empaquetada en formato MNN (Mobile Neural Network) por el equipo taobao-mnn. No se trata de un modelo entrenado desde cero, sino de una conversión optimizada para inferencia en CPU y dispositivos de borde mediante el runtime MNN-LLM, que aplica fusión de transformadores, cuantización HQQ y fusión de proyecciones y normalizaciones. El resultado es un artefacto de 1,5 GB listo para ejecutarse con el binario `llm_demo` del repositorio MNN.

El modelo subyacente, Qwen3-0.6B, pertenece a la familia Qwen3 y está orientado a generación de texto y conversación. Esta versión MNN conserva la plantilla de chat, los identificadores de token y los ajustes de muestreo originales, y ha sido validada en CPU x64 para prefill/decode en FP32 frente al exportador, generación en chino, aritmética, traducción corta y contexto de aproximadamente 900 tokens.

Su relevancia actual radica en que permite desplegar un LLM de 0,6 mil millones de parámetros en entornos sin GPU dedicada, con requisitos de memoria reducidos gracias a la cuantización 4-bit de los pesos lineales y 8-bit de la cabeza LM. Está publicado con licencia Apache 2.0 y se distribuye principalmente a través de ModelScope, con espejo en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), exportado a grafo MNN con fusión de transformadores |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (validado en pruebas hasta ~900 tokens) |
| Tipos de cuantizacion | Pesos lineales 4-bit grupo 64; LM head 8-bit grupo 64; embeddings LM-head/input compartidos y cuantizados; HQQ |
| Idiomas soportados | en (según metadatos); validado también para generación en chino en las pruebas del exportador |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (grafo y pesos propietarios del runtime MNN); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-0.6B es un transformer decoder-only de la familia Qwen3. La versión MNN no reentrena el modelo: aplica un pipeline de exportación (`llmexport`) que convierte los pesos originales a un grafo MNN con fusiones de transformadores (projection/norm fusion), cuantización HQQ de 4 bits con grupo 64 para las capas lineales y 8 bits con grupo 64 para la cabeza LM, además de compartir los embeddings de entrada y de la cabeza LM en formato cuantizado. El exportador utilizado corresponde al commit `b0239771b07b317a258fbc384683bbd540741406` y requiere MNN 3.6.2 o superior.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO. La model card indica que se conservan los ajustes de muestreo originales del runtime y que las claves de muestreo heredadas se migran a sus nombres actuales; el muestreo greedy se emplea únicamente en pruebas de corrección. La validación realizada cubre alineación FP32 prefill/decode entre fuente y exportador, plantillas de chat, IDs de token, generación en chino, aritmética, traducción corta, traducción con contexto de ~900 tokens, parada natural e integridad de pesos externos, todo en CPU x64.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat compatible con Qwen3.
- Razonamiento básico y aritmética, validados en las pruebas del exportador.
- Traducción corta y traducción con contexto de aproximadamente 900 tokens.
- Generación en chino, pese a que los metadatos solo declaran inglés.
- Parada natural de generación y control de muestreo configurable.
- Ejecución en CPU sin GPU mediante el runtime MNN-LLM.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el modelo puede gestionar diálogos multi-turno con la plantilla de chat de Qwen3 y ejecutarse en CPU x64 o ARM mediante MNN, sin necesidad de GPU.
- Traducción ligera en local: validado para traducción corta y con contexto de ~900 tokens, adecuado para integrarse en aplicaciones de escritorio o móviles que requieran privacidad de datos.
- Prototipado rápido de aplicaciones LLM: el artefacto de 1,5 GB y el binario `llm_demo` permiten levantar una demo funcional en minutos con CMake y `make`.
- Pruebas de corrección y regresión de pipelines de cuantización: útil para equipos que validen exportaciones MNN comparando prefill/decode FP32 frente al exportador.
- Generación de texto en entornos con memoria limitada: la cuantización 4-bit de pesos lineales y 8-bit de la cabeza LM reduce la huella de memoria frente al modelo en FP32.
- Aplicaciones embebidas o industriales sin acelerador: el soporte de MNN para CPU y su bajo consumo permiten desplegar generación de texto en hardware modesto.
- Educación y experimentación: modelo pequeño y de licencia permisiva para estudiar el flujo de exportación y cuantización de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las comprobaciones realizadas son de tipo smoke/correctness y no constituyen un benchmark de precisión ni garantizan identidad token a token con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el modelo está pensado para inferencia en CPU. El repositorio ocupa 1,5 GB, lo que da una cota superior aproximada de memoria necesaria para pesos.
- GPU recomendadas: no se han validado Metal, OpenCL, Vulkan ni CUDA en esta revisión; solo CPU x64 está verificado. ARM CPU FP16 tampoco ha sido validado en el refresh.
- Cabe en GPU consumer: no confirmado; el runtime objetivo es CPU.
- Opciones de despliegue: MNN-LLM (runtime oficial), compilado con `-DMNN_LOW_MEMORY=true -DMNN_CPU_WEIGHT_DEQUANT_GEMM=true -DMNN_BUILD_LLM=true -DMNN_SUPPORT_TRANSFORMER_FUSE=true`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Runtime |
|---|---|---|---|---|---|---|
| Qwen3-0.6B-MNN | 0,6 B | no disponible | 4-bit lineales / 8-bit LM head | Apache 2.0 | MNN | MNN-LLM |
| Qwen3-0.6B (original) | 0,6 B | no disponible | FP16/BF16 | Apache 2.0 | safetensors | transformers, vLLM, etc. |
| Alternativas GGUF de 0,5-1 B | 0,5-1 B | variable | 4-8 bit | variable | GGUF | llama.cpp, Ollama |

La comparativa con alternativas GGUF es genérica porque no se dispone de datos concretos de modelos comparables en la información proporcionada. La diferencia principal frente al Qwen3-0.6B original es el formato y el runtime: MNN está optimizado para CPU y dispositivos de borde, mientras que el original se distribuye en safetensors para frameworks de propósito general.

## Limitaciones y advertencias

- Solo se ha validado en CPU x64; Metal, OpenCL, Vulkan, CUDA y ARM CPU FP16 no han sido verificados en esta revisión.
- Requiere MNN 3.6.2 o superior; runtimes anteriores no son compatibles con esta exportación.
- No se debe mezclar este grafo con archivos de revisiones anteriores; hay que descargar todos los archivos actualizados juntos y limpiar cachés de modelo, pesos y KV antes de cargar.
- Las comprobaciones son de corrección, no de precisión: no se garantiza identidad token a token con el modelo sin cuantizar.
- Los metadatos solo declaran inglés, aunque se ha validado generación en chino; el soporte multilingüe formal no está documentado.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.
- Riesgo de alucinación y sesgos inherentes al modelo base Qwen3-0.6B, no evaluados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se incluye la licencia upstream sin cambios; conviene revisar `refresh_metadata.json` para la procedencia y el alcance de la validación.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-0.6B-MNN
- ModelScope: https://modelscope.cn/models/MNN/Qwen3-0.6B-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Exportador llmexport: https://github.com/alibaba/MNN/tree/master/transformers/llm/export
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Espejo Hugging Face: https://hf-mirror.com
