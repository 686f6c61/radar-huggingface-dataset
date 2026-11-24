# Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por NVIDIA, con 32.913.266.240 parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B). La arquitectura combina capas transformer con Mamba-2, una hibridacion orientada a reducir el coste computacional en contextos largos manteniendo calidad de generacion. El modelo base se distribuye en BF16 bajo licencia OpenMDW-1.1.

Esta ficha corresponde concretamente a la conversion a GGUF realizada por Xylolabs, publicada el 14 de noviembre de 2026, que permite ejecutar el modelo en llama.cpp sobre CUDA, Metal o CPU. El repositorio contiene una unica cuantizacion Q4_K_M de 25,43 GB, junto con el tokenizer original, la plantilla de chat y el modulo MTP (Multi-Token Prediction) del modelo base.

La relevancia practica del artefacto esta en que hace accesible un MoE de 32,9 B parametros con ventanas de contexto de hasta 256K tokens en hardware de consumo y estaciones de trabajo, algo que la version BF16 original no permite por su huella de memoria. La cuantizacion conserva un 92,13% de coincidencia en top-1 frente al BF16 de referencia, con una divergencia KL media de 0,0346 sobre 8.188 posiciones de texto en ingles y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida transformer + Mamba-2 (segun tags del autor) |
| Parametros totales | 32.913.266.240 (32,9 B) |
| Parametros activos | ~3 B (denominacion A3B) |
| Longitud de contexto | Hasta 256K tokens en la tabla de hardware del autor; 32K con offload en GPU de 24 GB |
| Tipos de cuantizacion | Q4_K_M (unica disponible en este repo) |
| Idiomas soportados | Ingles (en), coreano (ko) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del archivo Q4_K_M | 25,43 GB |
| Modulo adicional | Incluye modulo MTP (Multi-Token Prediction) |
| Commit minimo de llama.cpp | `cd959bae99ff4bed22bef2604f45241c09bbb8c8` |

## Arquitectura y entrenamiento

La arquitectura declarada en los metadatos es una hibridacion de transformer con Mamba-2, es decir, capas de atencion combinadas con capas de espacio de estados (SSM). Este diseno busca mantener la calidad de un modelo denso grande con un coste de atencion reducido en secuencias largas, algo coherente con la ventana de contexto de hasta 256K tokens que el autor documenta en su tabla de recomendaciones de hardware. El modelo es MoE, con 32,9 B parametros totales y alrededor de 3 B activos por token, lo que explica que una cuantizacion de 25,43 GB pueda ejecutarse con latencias razonables en GPUs de consumo.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) en la informacion proporcionada; la model card de esta conversion remite explicitamente a la model card original de NVIDIA para la receta de entrenamiento. La innovacion tecnica documentada en este repositorio es la inclusion del modulo MTP, que habilita decodificacion multi-token y por tanto puede acelerar la generacion especulativa en llama.cpp. La cuantizacion Q4_K_M se evaluo contra el paso BF16 en transformers, con divergencia KL media de 0,0346 y 92,13% de coincidencia top-1 sobre 8.188 posiciones de texto en ingles y coreano.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida en el archivo GGUF.
- Razonamiento y generacion de texto largo gracias a ventanas de contexto de hasta 256K tokens (segun la tabla de hardware del autor).
- Soporte multilingue limitado a ingles y coreano, segun los metadatos de idioma del modelo.
- Decodificacion multi-token mediante el modulo MTP incluido en los pesos.
- Inferencia en llama.cpp sobre CUDA, Metal y CPU, con soporte de offload de expertos a RAM del sistema.
- Compatibilidad con endpoints (tag `endpoints_compatible` en los metadatos de Hugging Face).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse con `llama-server` en una estacion de trabajo con una RTX 5090 (32 GB) y mantener conversaciones multi-turno con contexto de hasta 128K tokens, sin depender de APIs externas.
- Procesamiento de documentos largos en ingles o coreano: con 256K tokens de contexto en un H100 o en un Mac Studio con memoria unificada, es viable resumir o extraer informacion de contratos, informes o expedientes extensos en una sola pasada.
- Analisis de codigo y bases de codigo: la ventana larga permite cargar varios ficheros fuente en el contexto para tareas de revision, explicacion o generacion de parches, ejecutando el modelo en local con llama.cpp.
- Traduccion y asistencia bilingue ingles-coreano: el soporte declarado de ambos idiomas lo hace adecuado para herramientas internas de traduccion o atencion al cliente en esos mercados.
- Despliegue en hardware de consumo con offload de expertos: usando `--n-cpu-moe` en una RTX 4090 o RTX 3090 de 24 GB, se pueden descargar los expertos de las primeras capas a RAM del sistema y mantener el resto en VRAM, habilitando inferencia local a menor velocidad.
- Procesamiento por lotes en servidores con GPU profesional: en una H200, B200 o B300, el modelo Q4_K_M de 25,43 GB deja amplio margen de VRAM para cache KV a 256K tokens, lo que permite servir varias peticiones concurrentes con llama-server.
- Generacion aumentada por recuperacion (RAG) sobre corpus coreanos o ingleses: el contexto largo reduce la necesidad de trocear documentos y permite inyectar muchos fragmentos recuperados en un solo prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion proporcionado es la fidelidad de la cuantizacion respecto al BF16 de referencia:

| Metrica | Valor |
|---|---|
| Cuantizacion evaluada | Q4_K_M |
| Tamano | 25,43 GB |
| Divergencia KL media vs BF16 | 0,0346 |
| Coincidencia top-1 vs BF16 | 92,13% |
| Posiciones evaluadas | 8.188 (texto en ingles y coreano) |
| Referencia | Paso BF16 en transformers |

## Requisitos de hardware

- VRAM estimada para inferencia: 25,43 GB para el archivo Q4_K_M, mas cache KV en f16 al contexto elegido, mas unos 2 GB de runtime. La regla del autor es que el archivo, el KV cache y el runtime quepan en el 90% de la memoria disponible.
- GPU de 24 GB (RTX 4090, RTX 3090): no cabe entero; requiere offload de expertos a RAM del sistema con `--n-cpu-moe N` y contexto de hasta 32K.
- GPU de 32 GB (RTX 5090): cabe completo con contexto de hasta 128K.
- GPU de 48 GB (RTX 6000 Ada o 2 x 24 GB): contexto de hasta 256K.
- GPU de 80 GB (H100): contexto de hasta 256K con margen amplio para concurrencia.
- GPU de 96 GB (RTX PRO 6000 Blackwell), 141 GB (H200), 192 GB (B200) y 288 GB (B300): contexto de hasta 256K.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 GB y 512 GB) soportan el archivo completo con contexto de hasta 256K.
- Opciones de despliegue: llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), con los binarios `llama-cli` y `llama-server`. Compilacion con `-DGGML_CUDA=ON` para NVIDIA; soporte Metal y CPU incluido.
- Latencia y throughput: no se han publicado cifras de tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible. A continuacion se comparan unicamente los atributos documentados de este artefacto frente a su propia version BF16 de referencia:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B Q4_K_M (Xylolabs) | 32,9 B totales, ~3 B activos | Hasta 256K | GGUF | OpenMDW-1.1 | Hugging Face, llama.cpp |
| Nemotron-3.5-Lightning-30B-A3B BF16 (NVIDIA) | 32,9 B totales, ~3 B activos | No disponible en esta ficha | Safetensors (BF16) | OpenMDW-1.1 | Hugging Face |

Comparativas con otros modelos MoE de tamano similar (por ejemplo, familias tipo Qwen MoE o Mixtral): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y coreano; el rendimiento en castellano no esta verificado y previsiblemente sera inferior.
- Una unica cuantizacion disponible (Q4_K_M); no hay variantes Q5, Q6, Q8 ni f16 en este repositorio, lo que limita el ajuste fino entre calidad y memoria.
- Perdida de fidelidad por cuantizacion: 7,87% de divergencia en top-1 respecto al BF16, lo que puede afectar a tareas sensibles a tokens exactos (codigo, matematicas, extraccion de entidades).
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada.
- Licencia OpenMDW-1.1: es necesario revisar los terminos completos del fichero `LICENSE` antes de un uso comercial; la model card no resume las restricciones.
- Relacion con NVIDIA: Xylolabs declara no estar afiliada ni respaldada por NVIDIA; el artefacto es una conversion de terceros, no una release oficial.
- Dependencia de version: requiere un commit concreto de llama.cpp o posterior; versiones anteriores pueden no cargar correctamente el modulo MTP o la arquitectura hibrida.
- El rendimiento en contextos de 256K depende criticamente del hardware; en GPUs de 24 GB el contexto practico baja a 32K con offload.
- No se documenta soporte de tool calling ni de agentes, por lo que integrarlo en pipelines de automatizacion requiere validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia (OpenMDW-1.1): https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
