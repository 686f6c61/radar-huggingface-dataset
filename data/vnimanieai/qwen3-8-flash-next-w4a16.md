# VnimanieAI/Qwen3.8-Flash-Next-W4A16

## Resumen

Qwen3.8-Flash-Next-W4A16 es una cuantizacion INT4 (W4A16, group-128, simetrica) del modelo multimodal Qwen3.8-Flash-Next, publicada por VnimanieAI. Su objetivo principal es permitir la ejecucion de este modelo en GPUs Ampere de consumo (RTX 3090), que no soportan el formato FP8 del checkpoint oficial. Es, segun el autor, la primera cuantizacion INT4 publica de este modelo y la unica opcion de 4 bits que funciona en hardware pre-Blackwell, gracias al uso de kernels Marlin.

El modelo base, desarrollado por QwenLM, es un MoE ultra-sparse con 125.000 millones de parametros mas una tabla n-gram de 51.000 millones, activando 6.000 millones por token. Su arquitectura hibrida combina Gated DeltaNet (GDN) en tres de cada cuatro capas con Qwen Sparse Attention (QSA) en la cuarta, alcanzando un contexto nativo de 262.144 tokens. La cuantizacion reduce el peso en disco de 335 GB (BF16) a 168 GB, de los cuales solo unos 66 GB residen en VRAM, gracias al offload de las tablas n-gram a RAM del host.

Esta ficha cubre las especificaciones tecnicas, requisitos de despliegue y limitaciones de esta version cuantizada, orientada a entornos de produccion con vLLM y hardware Ampere.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse hibrida (GDN + QSA), multimodal (imagen-texto) |
| Parametros totales | 179.999.981.459 (safetensors) |
| Parametros activos | 6.000 millones por token |
| Longitud de contexto | 262.144 tokens (nativo); 96.000 con 4xRTX 3090 |
| Tipos de cuantizacion | INT4 (W4A16, group-128, simetrico) en formato compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE ultra-sparse con 512 expertos enrutados por capa y un experto compartido. Tres de cada cuatro capas usan Gated DeltaNet (GDN), una capa recurrente que comprime el historial en un estado oculto, mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperacion precisa de informacion de largo alcance. Ademas incorpora un modulo MTP (Multi-Token Prediction) para decodificacion especulativa y una tabla n-gram (PLE) de 51.000 millones de parametros que actua como memoria asociativa.

La cuantizacion realizada por VnimanieAI aplica INT4 group-128 simetrico solo a los pesos de GEMM mas pesados: los expertos enrutados (120.000 millones de parametros) y las proyecciones de atencion QSA. Se mantienen en BF16 los componentes sensibles: el router MoE, el indexador QSA, las capas GDN, el experto compartido, el modulo MTP, las tablas PLE, embeddings, lm_head y el encoder de vision. El metodo utilizado es RTN (round-to-nearest) sin datos de calibracion; se intento AWQ pero no fue viable por limitaciones de RAM durante el proceso.

Una particularidad critica es el problema "640/128": los expertos tienen un tamano intermedio de 640, que no es divisible por el grupo de cuantizacion de 128 cuando se aplica tensor parallelism. Por ello, el despliegue exige obligatoriamente expert parallelism (EP) para evitar fragmentar los expertos.

## Capacidades

- Generacion de texto conversacional y multimodal: procesa entradas de imagen y texto, con soporte para dialogos multi-turno.
- Razonamiento y modo thinking: incluye parser de razonamiento qwen3, lo que permite respuestas con cadena de pensamiento.
- Tool calling y function calling: compatible con el parser qwen3_coder y auto-tool-choice, habilitando integracion con herramientas externas.
- Decodificacion especulativa: el modulo MTP se conserva en BF16, logrando un aumento del 57% en velocidad de decodificacion single-stream.
- Contexto largo: hasta 262.144 tokens con 8 GPUs, permitiendo procesar documentos extensos y codebases completos.
- Capacidades multilingues: no se han publicado los idiomas soportados en la informacion disponible.

## Casos de uso

- Analisis de documentos legales extensos: con 262k de contexto, el modelo puede procesar contratos completos, sentencias y expedientes en una sola pasada, extrayendo clausulas relevantes y generando resumenes. La cuantizacion INT4 permite ejecutarlo en un cluster de RTX 3090, reduciendo costes frente a hardware Blackwell.
- Asistente de programacion sobre codebases grandes: el soporte de tool calling y el contexto amplio permiten indexar un repositorio entero, responder preguntas sobre arquitectura, sugerir refactorizaciones y generar parches. El modo razonamiento ayuda a depurar errores complejos.
- Atencion al cliente automatizada con memoria de sesion: el modelo puede mantener conversaciones de larga duracion con historial completo, gracias a la ventana de contexto y al offload de PLE. La integracion con vLLM permite servir multiples sesiones concurrentes.
- Procesamiento de imagenes medicas con informes: al ser multimodal, puede analizar radiografias o tomografias junto con la historia clinica del paciente, generando informes preliminares. La cuantizacion INT4 mantiene la calidad del encoder de vision en BF16.
- Agente autonomo de investigacion: combinando tool calling, razonamiento y contexto largo, puede buscar en multiples fuentes, leer articulos completos y sintetizar conclusiones. El despliegue en 8xRTX 3090 con EP permite ejecutar pipelines de agentes con baja latencia.
- Generacion de contenido editorial multilingue: aunque los idiomas no estan documentados, el modelo base de Qwen soporta multiples lenguas. Puede redactar articulos, traducir y adaptar tono, con la ventaja de ejecutarse en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El autor indica en la model card que "la calidad en nuestra suite de evaluacion greedy coincide con la referencia de la familia base", pero no proporciona tablas ni cifras concretas. Se recomienda realizar una evaluacion propia en las tareas objetivo antes de desplegar en produccion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 66 GB de pesos residentes en GPU, mas overhead de activaciones y KV cache. Con 4xRTX 3090 (96 GB totales) se alcanza un contexto de 96.000 tokens; con 8xRTX 3090 (192 GB) se llega al contexto nativo de 262.144.
- RAM del host: se requieren al menos 110 GB libres para el offload de las tablas PLE (51.000 millones de parametros en BF16).
- GPUs compatibles: cualquier GPU Ampere o posterior con soporte para kernels Marlin (RTX 3090, RTX 4090, A100, etc.). No funciona en GPUs sin soporte FP8 si se usa el checkpoint FP8 oficial, pero esta version INT4 si es compatible con Ampere.
- Despliegue recomendado: vLLM con la imagen `vllm/vllm-openai:qwen38-flash-next`. Es imprescindible activar `--enable-expert-parallel` y desactivar torch.compile mediante `--compilation-config '{"mode": 0, "cudagraph_mode": "FULL_DECODE_ONLY"}'`. Sin esta configuracion, la velocidad cae de 105 tok/s a 9 tok/s.
- Latencia: con la configuracion correcta y 8xRTX 3090, se reportan aproximadamente 105 tok/s en decodificacion single-stream. Con decodificacion especulativa MTP, el rendimiento mejora un 57% adicional.
- Opciones alternativas: aunque no se menciona, podria usarse con transformers, pero el autor solo valida vLLM para produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Hardware requerido | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-W4A16 (este) | 180B totales, 6B activos | 262k | INT4 W4A16 | Ampere o posterior (RTX 3090) | qwen-community-1.0 |
| Qwen3.8-Flash-Next (FP8 oficial) | 180B totales, 6B activos | 262k | FP8 | Blackwell (SM100+) | qwen-community-1.0 |
| Qwen3.8-Flash (modelo distinto) | No disponible | 1M (segun QwenCloud) | No especificada | No disponible | qwen-community-1.0 |

La comparativa directa con otras cuantizaciones INT4 de modelos similares no esta disponible en la informacion recopilada. La principal diferencia frente al checkpoint FP8 es la compatibilidad con hardware Ampere, a costa de una precision ligeramente inferior en tareas sensibles (aunque el autor afirma que la calidad coincide en su suite de evaluacion).

## Limitaciones y advertencias

- La cuantizacion INT4 puede degradar el rendimiento en tareas que dependen de los componentes mantenidos en BF16, aunque el autor reporta paridad en su evaluacion. Se recomienda validar en el caso de uso concreto.
- El despliegue exige expert parallelism obligatorio; lanzar con tensor parallelism simple produce errores de dimensionamiento en los grupos de cuantizacion.
- El offload de las tablas PLE a RAM requiere mas de 110 GB de memoria libre en el host, lo que puede ser un cuello de botella en servidores con poca RAM.
- torch.compile no es compatible con esta arquitectura en Ampere; si se activa, el servidor se cuelga indefinidamente. Es necesario usar la configuracion de compilacion especifica.
- La licencia qwen-community-1.0 es una licencia comunitaria de Qwen; aunque permite uso comercial, es necesario revisar los terminos exactos en el repositorio oficial para verificar restricciones de redistribucion o modificacion.
- No se han publicado datos de sesgos ni evaluaciones de seguridad especificos para esta cuantizacion. Como derivado de un modelo base, hereda los sesgos potenciales de su entrenamiento.
- El modelo es multimodal, pero la cuantizacion no cubre el encoder de vision (se mantiene en BF16), por lo que el consumo de VRAM para tareas de imagen puede ser mayor de lo estimado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VnimanieAI/Qwen3.8-Flash-Next-W4A16
- Repositorio oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta de despliegue en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Serie Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
