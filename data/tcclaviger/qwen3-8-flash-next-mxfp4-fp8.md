# tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8

## Resumen

Qwen3.8-Flash-Next-MXFP4-FP8 es una cuantizacion experimental del modelo Qwen3.8-Flash-Next, desarrollada por tcclaviger para ejecutarse exclusivamente en GPUs AMD AI PRO R9700 (arquitectura RDNA4). El modelo base, publicado por Alibaba Qwen en agosto de 2026, es un avance de la arquitectura que dara lugar a Qwen4: un modelo multimodal de mezcla de expertos con 125.000 millones de parametros principales, complementados por 51.000 millones de parametros adicionales en embeddings de n-gramas, activando solo 6.000 millones de parametros por token.

Esta version cuantizada combina MXFP4 para los expertos y FP8 para los modulos de prediccion multi-token (MTP), embeddings de n-gramas y atencion, reduciendo el peso total a 125,8 GB. Incluye escalas de KV-cache FP8 calibradas y esta pensada para despliegue con vLLM en configuraciones de 4 GPUs R9700 con paralelismo tensorial. Es una prueba tecnica inicial: el autor indica que la cuantizacion MXFP4 se realizo con Quark RTN y que se publicaran pesos GPTQ/AWQ posteriormente para mejorar la precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA), MoE con N-gram embeddings |
| Parametros totales | 187.549.728.659 (125B principales + 51B N-gram embeddings + otros) |
| Parametros activos | 6.000.000.000 (6B por token) |
| Longitud de contexto | 524.288 tokens (con YARN factor 2.0 sobre 262.144 originales) |
| Tipos de cuantizacion | MXFP4 (expertos), FP8 (MTP, N-gram, atencion, KV-cache) |
| Idiomas soportados | No disponible (el modelo base es multilingue, sin detalle) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (con escalas de KV-cache FP8 en archivo separado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce varias innovaciones frente a generaciones anteriores. La atencion hibrida combina Gated DeltaNet (una capa de estado recurrente lineal) con Qwen Sparse Attention (QSA), que opera a nivel de micro-bloques en lugar de tokens individuales, reduciendo la latencia en contextos largos. Se anade un mecanismo de Gated Residual que modula el flujo de informacion en los residual streams mediante puertas de lectura dependientes de datos y puertas de escritura escalares por rama, mejorando la expresividad sin aumentar la carga de inferencia.

La innovacion mas destacada es el N-gram Embedding: en lugar de depender solo de MoE para escalar parametros, se anaden embeddings indexados por n-gramas cortos, lo que permite escalar parametros con menos computo y facilita el offloading a memoria en aceleradores con VRAM limitada. El entrenamiento utiliza una receta adaptada con los optimizadores Muon y AdamW aplicados a categorias de pesos especificas, guiados por scaling laws reajustadas. La cuantizacion MXFP4/FP8 fue realizada por tcclaviger con Quark RTN, sin reentrenamiento, y se anadieron escalas de KV-cache FP8 calibradas.

## Capacidades

- Generacion de texto y razonamiento multimodal: el modelo base acepta entradas de imagen y video (hasta 20 imagenes y 1 video por prompt segun la configuracion de vLLM).
- Razonamiento con modo thinking: incluye parser de razonamiento qwen3, lo que permite cadenas de pensamiento explicitas.
- Tool calling y function calling: compatible con el parser qwen3_coder y seleccion automatica de herramientas.
- Soporte de agentes y multi-step reasoning: gracias a la ventana de contexto de 524K tokens y la atencion esparsa de micro-bloques, puede manejar tareas agenciales largas.
- Capacidades multilingues: el modelo base es multilingue, aunque la ficha no especifica la lista de idiomas.
- Decodificacion especulativa: soporta MTP (multi-token prediction) con 4 tokens especulativos, acelerando la generacion.
- KV-cache FP8 con escalas calibradas para reducir uso de memoria sin perdida significativa.

## Casos de uso

- Analisis de documentos extensos: con 524K tokens de contexto, puede procesar manuales tecnicos completos, expedientes legales o informes financieros de cientos de paginas en una sola pasada, extrayendo informacion relevante y respondiendo preguntas sobre el contenido.
- Razonamiento sobre codebases completos: un desarrollador puede cargar un repositorio entero y pedir explicaciones, deteccion de bugs o sugerencias de refactorizacion, aprovechando la ventana de contexto larga y el soporte de tool calling para ejecutar comandos.
- Agentes autonomos con memoria larga: la combinacion de contexto amplio, razonamiento multi-paso y tool calling permite construir agentes que mantienen estado a lo largo de sesiones prolongadas, por ejemplo, asistentes de investigacion que consultan APIs y bases de conocimiento.
- Procesamiento de video e imagenes en entornos industriales: el modelo acepta entradas visuales, por lo que puede analizar secuencias de video de camaras de seguridad o imagenes de control de calidad, generando informes descriptivos.
- Atencion al cliente multimodal: integrado en un sistema de tickets, puede leer capturas de pantalla, documentos adjuntos y conversaciones previas para resolver incidencias complejas sin escalado a un humano.
- Generacion de codigo asistida con verificacion: gracias a la decodificacion especulativa y el soporte de tool calling, puede integrarse en pipelines de CI/CD para generar tests, revisar pull requests y sugerir correcciones con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar, y la cuantizacion MXFP4 con Quark RTN puede degradar la precision respecto al modelo original. El autor menciona que se publicaran pesos GPTQ/AWQ para mejorar la exactitud, lo que sugiere que los resultados actuales son preliminares.

## Requisitos de hardware

- Exclusivo para GPUs AMD AI PRO R9700 (arquitectura RDNA4). No es compatible con GPUs NVIDIA ni con otras AMD.
- Configuracion recomendada: 4 GPUs R9700 con paralelismo tensorial (tensor-parallel-size 4), segun el comando docker proporcionado.
- VRAM total necesaria: 125,8 GB de pesos, mas overhead de KV-cache FP8 y activaciones. Con 4 GPUs, se requiere al menos 32 GB por GPU (no especificado, pero es el minimo plausible para R9700).
- Offloading a RAM habilitado (VLLM_PLE_CPU_OFFLOAD=1), lo que permite aliviar presion de VRAM a costa de latencia.
- Despliegue: solo con la imagen docker tcclaviger/vllm:DevQwenNextFlash. No es compatible con vLLM estandar, llama.cpp, Ollama ni TGI.
- Parametros de inferencia: max-num-seqs 16, max-num-batched-tokens 4096, gpu-memory-utilization 0.92, chunked prefill y prefix caching habilitados.
- Decodificacion especulativa MTP con 4 tokens especulativos para mejorar throughput.
- El autor publico graficas de throughput inicial en el repositorio (Next-Throughput-Initial.png y PDF), pero los valores numericos no estan disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base, FP8) | 187,5B | 6B | 262K (hasta 1M con YARN) | qwen-community-1.0 | Hugging Face, ModelScope |
| Qwen3.8-Flash-Next-MXFP4-FP8 (esta cuantizacion) | 187,5B | 6B | 524K (con YARN 2.0) | qwen-community-1.0 | Solo AMD R9700, imagen docker especifica |
| Qwen3.8-Flash (version oficial de produccion) | No disponible | No disponible | 1M por defecto | qwen-community-1.0 | API Qwen Cloud |

La comparativa con otros modelos MoE de tamano similar (por ejemplo, DeepSeek-V3 o Qwen3-235B-A22B) no esta disponible en la informacion proporcionada. Esta cuantizacion es una variante experimental del modelo base, no un modelo independiente.

## Limitaciones y advertencias

- Compatibilidad restringida: solo se ejecuta en GPUs AMD AI PRO R9700. No funcionara en hardware NVIDIA ni en otras AMD, y requiere una imagen docker especifica de vLLM que no es la version publica.
- Cuantizacion experimental: MXFP4 con Quark RTN puede degradar la precision. El autor advierte que se publicaran pesos GPTQ/AWQ para mejorar la exactitud, lo que indica que esta version no es optima para produccion.
- Licencia qwen-community-1.0: permite uso comercial pero con restricciones (consultar el texto completo de la licencia). No es Apache 2.0, aunque el README lo mencione; la metadata de HuggingFace indica qwen-community-1.0.
- Riesgo de alucinacion: como todo LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento largo o con entradas ambiguas.
- Sesgos: no se han publicado evaluaciones de sesgo para este modelo. El modelo base puede heredar sesgos de sus datos de entrenamiento.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estandar, lo que dificulta evaluar su calidad relativa.
- Requisitos de memoria: 125,8 GB de pesos exigen hardware de gama alta; el offloading a RAM puede aumentar la latencia significativamente.
- Soporte limitado: al ser una cuantizacion de un tercero, no hay garantia de mantenimiento ni actualizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Receta vLLM del modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- Imagen docker de vLLM del autor: https://hub.docker.com/r/tcclaviger/vllm
- Informe de throughput (PDF): https://huggingface.co/tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8/resolve/main/Next-Initial-Throughput.pdf
