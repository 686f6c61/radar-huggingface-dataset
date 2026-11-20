# Xylolabs/GLM-4.7-Flash-GGUF

## Resumen

GLM-4.7-Flash-GGUF es una cuantizacion en formato GGUF del modelo zai-org/GLM-4.7-Flash, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base, desarrollado por Z.ai (zai-org), es un transformer de 31.221.488.576 parametros (aproximadamente 31,2 mil millones) orientado a generacion de texto conversacional. Esta version cuantizada resuelve el problema de despliegue del modelo original en hardware con recursos limitados, reduciendo el peso de los pesos a unos 16,7-16,9 GB mediante cuantizacion de 4 bits.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 31B en GPU de consumo y en CPU con perdida de calidad medida y documentada: la cuantizacion IQ4_XS presenta una divergencia KL media de 0,0868 frente a BF16 y una coincidencia top-1 del 87,80 %. La variante con importance matrix (IQ4_XS-imat) mejora ligeramente ambas metricas (KL 0,0845, top-1 88,34 %) con un tamano incluso menor.

El repositorio incluye un unico tipo de cuantizacion en dos variantes, con licencia MIT, tokenizer y chat template originales, y el modulo MTP (multi-token prediction) del modelo base. Los idiomas declarados en la model card son ingles y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base GLM-4.7-Flash); pesos en formato GGUF para llama.cpp |
| Parametros totales | 31.221.488.576 (31,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | IQ4_XS e IQ4_XS-imat (4 bits) |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (un archivo por cuantizacion; incluye tokenizer, chat template y modulo MTP) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 31,2 mil millones de parametros. La model card de esta cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde a la model card del modelo original zai-org/GLM-4.7-Flash y al informe tecnico de GLM enlazado desde ella, que no se han incluido en la informacion disponible. Tampoco se especifica si la arquitectura emplea mezcla de expertos (MoE) o atencion lineal; el dato de parametros activos figura como no disponible.

El proceso de cuantizacion esta documentado por el autor: (1) conversion del checkpoint original a GGUF en BF16 con `convert_hf_to_gguf.py`, (2) cuantizacion con `llama-quantize`, y (3) generacion de la variante `-imat` mediante importance matrix. Los archivos conservan el tokenizer y la plantilla de chat originales, e incluyen el modulo MTP del modelo base. La evaluacion de calidad se realizo sobre 16.288 posiciones de texto en ingles y coreano, comparando contra una pasada BF16 de referencia en transformers.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Razonamiento y respuesta a instrucciones heredados del modelo base GLM-4.7-Flash.
- Capacidades multilingues limitadas a ingles y coreano segun la model card.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Soporte de plantilla de chat Jinja (`--jinja` en llama.cpp).
- Incluye el modulo MTP (multi-token prediction) del modelo base, que puede habilitar decodificacion especulativa en llama.cpp.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling ni modo de razonamiento explicito.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con 16,7-16,9 GB de pesos en IQ4_XS, el modelo cabe en GPUs de 24 GB (RTX 3090, RTX 4090) dejando margen para cache KV, lo que permite prototipar asistentes conversacionales sin infraestructura de datacenter.
- Inferencia en CPU para entornos sin GPU: llama.cpp permite ejecutar el modelo en CPU con `-ngl 0`, adecuado para pruebas, evaluacion y desarrollo en portatiles o servidores sin acelerador.
- Servicio de chat autoalojado: `llama-server` expone una API compatible con el formato de chat y la plantilla Jinja, lo que facilita integrar el modelo en aplicaciones internas con requisitos de privacidad de datos.
- Evaluacion comparativa de cuantizaciones: las metricas KL y top-1 publicadas permiten a un equipo decidir entre IQ4_XS e IQ4_XS-imat segun su tolerancia a la perdida de calidad, con datos reproducibles sobre 16.288 posiciones.
- Aplicaciones en ingles y coreano: el modelo declara soporte para ambos idiomas, por lo que es adecuado para asistentes o generacion de contenido dirigidos a esos mercados.
- Investigacion sobre cuantizacion: el repositorio documenta el pipeline completo (BF16 a GGUF a IQ4_XS con y sin imatrix), util como referencia metodologica para replicar el proceso en otros modelos.
- Despliegue en Apple Silicon: la compatibilidad con Metal permite ejecutar el modelo en Macs con memoria unificada suficiente (32 GB o mas recomendable para IQ4_XS con contexto amplio).

## Benchmarks y rendimiento

La model card solo publica metricas de fidelidad de la cuantizacion frente a BF16, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.):

| Cuantizacion | Tamano | KL media vs BF16 | Misma top-1 vs BF16 |
|---|---|---|---|
| IQ4_XS | 16,88 GB | 0,0868 | 87,80 % |
| IQ4_XS-imat | 16,71 GB | 0,0845 | 88,34 % |

Metodologia: 16.288 posiciones de texto en ingles y coreano, referencia BF16 en transformers. No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 16,88 GB (IQ4_XS) o 16,71 GB (IQ4_XS-imat); a esto hay que sumar la cache KV, cuyo tamano depende del contexto configurado (el ejemplo usa 8.192 tokens).
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para IQ4_XS con contexto moderado; A100 o H100 para contextos largos o mayor concurrencia.
- GPU de consumo: si cabe en GPUs de 24 GB; en GPUs de 16 GB no cabe la cuantizacion completa en VRAM y requeriria offload parcial a CPU (`-ngl` reducido).
- Apple Silicon: viable con Metal y memoria unificada de 32 GB o superior.
- Opciones de despliegue: llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), con `llama-cli` y `llama-server`; compilacion con `-DGGML_CUDA=ON` para NVIDIA.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento en tareas del modelo base ni de alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros y formato:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.7-Flash-GGUF (Xylolabs) | 31,2 B | no disponible | GGUF IQ4_XS | MIT | Hugging Face |
| GLM-4.7-Flash (zai-org, base) | 31,2 B | no disponible | safetensors (BF16) | no disponible en esta ficha | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se ofrece cuantizacion de 4 bits (IQ4_XS); no hay variantes de 5, 6 u 8 bits en el repositorio, lo que limita el ajuste fino entre calidad y tamano.
- La perdida de fidelidad es medible: KL media de 0,0868 y coincidencia top-1 del 87,80 % frente a BF16, lo que implica que aproximadamente el 12 % de las predicciones top-1 difieren del modelo de referencia.
- Idiomas declarados: solo ingles y coreano; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en esta cuantizacion.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Licencia MIT permite uso comercial, pero Xylolabs declara no estar afiliado ni respaldado por los autores del modelo original; conviene revisar la licencia del modelo base zai-org/GLM-4.7-Flash antes de producción.
- Requiere una version concreta o posterior de llama.cpp (`cd959bae99ff4bed22bef2604f45241c09bbb8c8`); versiones anteriores pueden no cargar correctamente los pesos.
- La longitud de contexto del modelo base no se especifica en la informacion disponible; el ejemplo de la model card usa 8.192 tokens, que no debe interpretarse como el maximo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/GLM-4.7-Flash-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Licencia: https://huggingface.co/Xylolabs/GLM-4.7-Flash-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
