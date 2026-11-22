# textclf/Qwen3-Coder-Next-TQ-4bit

## Resumen

Qwen3-Coder-Next-TQ-4bit es una cuantizacion a 4 bits del modelo Qwen3-Coder-Next, un transformer de tipo Mixture-of-Experts (MoE) desarrollado por Alibaba Qwen y orientado a generacion de codigo y flujos agenticos. La cuantizacion la publica el usuario textclf en Hugging Face y emplea Coded Quantization (CQ), un metodo sin calibracion que empaqueta los pesos en 4 bits para reducir de forma sustancial los requisitos de memoria frente a un despliegue en BF16/FP16.

El modelo base declara aproximadamente 80.000 millones de parametros totales con unos 3.000 millones activados por token, y una longitud de contexto de 262.144 tokens. Esa combinacion de contexto largo y activacion dispersa lo hace adecuado para tareas de ingenieria de software sobre repositorios extensos, uso de herramientas y razonamiento multi-paso. El checkpoint cuantizado mantiene la licencia Apache 2.0 del modelo original.

La relevancia de esta ficha esta en que el formato CQ no es un GGUF ni un GPTQ/AWQ convencional: requiere el plugin de cuantizacion de vLLM y los kernels CUDA propios incluidos en la imagen Docker de ThousandML. Esto condiciona por completo el despliegue y conviene tenerlo claro antes de evaluar el modelo. Nota importante: el Hub reporta 752.270.080 parametros en los tensores safetensors del repositorio, cifra que el autor atribuye al empaquetado 4-bit y no al numero de parametros de la arquitectura original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), familia Qwen3-Next; detalles de capas no disponibles |
| Parametros totales | ~80B en el modelo base; 752.270.080 en los tensores safetensors del repo (empaquetado 4-bit) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Coded Quantization (CQ) 4-bit, sin calibracion; nombre de cuantizacion `cq` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado 4-bit CQ); no compatible con GGUF |
| Runtime | vLLM con plugin CQ y kernels CUDA propios (imagen Docker `thousandml/cq:4bit-main`) |
| Tamano del repositorio | 41,8 GB |
| Descargas / likes | 639 / 0 |
| Creado / actualizado | 2026-08-30 / 2026-10-16 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Coder-Next, un transformer con capas de mezcla de expertos en el que cada token activa aproximadamente 3.000 millones de parametros de un total de unos 80.000 millones. La model card de esta cuantizacion no detalla el numero de capas, la configuracion de expertos, el mecanismo de atencion ni la composicion del dataset de entrenamiento; esa informacion corresponde a la model card original de Qwen, que el autor remite explicitamente y que no forma parte de la informacion disponible aqui. Tampoco se documentan fases de RLHF, DPO ni datos de post-entrenamiento.

La innovacion tecnica de este checkpoint no esta en la arquitectura sino en el esquema de cuantizacion. CQ es un metodo post-entrenamiento sin calibracion: no requiere un corpus representativo para estimar parametros de cuantizacion, lo que evita atar el resultado a la distribucion de un dataset concreto y, segun el autor, favorece la generalizacion a cargas de trabajo distintas de las de calibracion. El precio es una dependencia fuerte del runtime: los pesos solo se ejecutan con el plugin de vLLM y los kernels CUDA de ThousandML, no con llama.cpp, Ollama ni TGI.

## Capacidades

- Generacion de codigo en multiples lenguajes, con enfasis en tareas de desarrollo de software segun la descripcion del modelo base.
- Razonamiento multi-paso y flujos agenticos de codificacion.
- Tool calling / function calling, con soporte de eleccion automatica de herramienta en vLLM mediante `--enable-auto-tool-choice` y el parser `--tool-call-parser qwen3_coder`.
- Procesamiento de contexto largo: hasta 262.144 tokens, adecuado para repositorios completos o historiales extensos.
- Servicio mediante API compatible con OpenAI a traves de vLLM.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modo thinking explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo sobre repositorios completos: con 262.144 tokens de contexto puede ingerir varios modulos, tests y ficheros de configuracion en una sola peticion y responder preguntas transversales sobre el codigo sin trocear el contexto.
- Agentes de ingenieria de software: el soporte de tool calling con parser dedicado permite encadenar lecturas de ficheros, ejecucion de tests y aplicacion de parches en bucles multi-paso gestionados por un orquestador externo.
- Revision de pull requests automatizada: el modelo puede analizar el diff junto con el contexto de los ficheros afectados y emitir comentarios tecnicos, aprovechando la ventana larga para no perder dependencias.
- Migracion y refactorizacion de bases de codigo: la combinacion de contexto extenso y capacidades de codigo permite proponer cambios coherentes en multiples ficheros a la vez.
- Generacion de tests y documentacion tecnica: a partir de modulos existentes, el modelo puede producir suites de pruebas y documentacion de API, tarea donde el contexto largo reduce la necesidad de resumir el codigo de entrada.
- Backend de autocompletado y chat para IDE: desplegado con vLLM y la API compatible con OpenAI, puede servir peticiones de baja latencia desde un editor, aunque el throughput real dependera del hardware y de la carga.
- Automatizacion en pipelines de CI/CD: integrado como servicio HTTP, puede generar parches candidatos, resumir fallos de build o clasificar errores a partir de logs extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K, SWE-bench ni metricas de latencia o throughput, y tampoco se aportan datos de degradacion respecto al modelo en BF16.

## Requisitos de hardware

- VRAM estimada: con pesos empaquetados en 4 bits, el repositorio ocupa 41,8 GB, por lo que se necesita al menos esa cantidad de memoria para los pesos, mas el espacio de cache KV y buffers de activacion. Para 262.144 tokens de contexto la cache KV puede ser muy voluminosa y exigir GPUs de 80 GB o configuraciones multi-GPU.
- GPU recomendadas: no disponibles de forma explicita en la informacion proporcionada. Por el tamano del checkpoint, un despliegue comodo apunta a A100/H100 de 80 GB o a varias GPUs; no hay datos publicados de funcionamiento en RTX 4090.
- GPU de consumo: no confirmado. Los 41,8 GB de pesos empaquetados exceden la VRAM de una RTX 4090 (24 GB) y de una RTX 5090 (32 GB), por lo que no cabe en una unica GPU consumer convencional sin tecnicas adicionales no documentadas.
- Despliegue: exclusivamente mediante la imagen Docker `docker.io/thousandml/cq:4bit-main` con `vllm serve ... --quantization cq`. No hay soporte documentado para llama.cpp, Ollama, TGI ni vLLM estandar sin el plugin CQ.
- Entornos WSL2: requiere la variable `VLLM_WSL2_ENABLE_PIN_MEMORY=1` si vLLM reporta que UVA no esta disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Runtime | Licencia |
|---|---|---|---|---|---|
| Qwen3-Coder-Next-TQ-4bit (esta ficha) | ~80B totales / ~3B activos (base); 752M en tensores del repo | 262.144 | CQ 4-bit sin calibracion | vLLM + plugin CQ | Apache 2.0 |
| Qwen/Qwen3-Coder-Next (base) | ~80B totales / ~3B activos | 262.144 | BF16/FP16 (presumiblemente) | vLLM estandar y otros | Apache 2.0 |
| Alternativas de codigo de ~30B densos | no disponible | no disponible | GPTQ/AWQ/GGUF habituales | llama.cpp, vLLM, TGI | variable |
| Alternativas MoE de codigo de gran tamano | no disponible | no disponible | variable | variable | variable |

La informacion proporcionada solo permite comparar de forma fiable con el modelo base. Cualquier comparacion con otras familias de modelos de codigo requeriria datos que no estan disponibles en esta ficha.

## Limitaciones y advertencias

- Dependencia total del runtime propietario: los pesos CQ solo funcionan con el plugin de vLLM y los kernels CUDA de ThousandML. Esto limita la portabilidad, complica la auditoria del codigo de inferencia y crea un punto unico de dependencia en produccion.
- Sin datos de calidad: no hay benchmarks que cuantifiquen la perdida de rendimiento respecto al modelo en BF16, ni evaluaciones de robustez tras la cuantizacion.
- Numero de parametros confuso: el Hub reporta 752.270.080 parametros, muy por debajo de los ~80B del modelo base. Cualquier herramienta que dimensione recursos a partir de ese dato subestimara los requisitos reales.
- Riesgo de alucinacion: inherente a los modelos de codigo; puede generar APIs inexistentes, imports erroneos o tests que pasan por casualidad. Requiere validacion con ejecucion real y revision humana.
- Sesgos: no documentados en la informacion disponible. Al ser un modelo entrenado principalmente para codigo, su comportamiento fuera de ese dominio puede ser deficiente.
- Idiomas: no se especifica la cobertura linguistica; el soporte de castellano no esta confirmado.
- Contexto largo: aunque se declaran 262.144 tokens, no hay datos sobre degradacion de calidad en ventanas muy extensas ni sobre el coste real de cache KV a esa longitud.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los terminos de la imagen Docker y de los kernels CQ de ThousandML, que son componentes separados del modelo.
- Madurez: el repositorio tiene 0 likes y 639 descargas, y no hay comunidad ni issues documentados; es un artefacto reciente y poco contrastado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/textclf/Qwen3-Coder-Next-TQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- ThousandML (Coded Quantization): https://thousandml.com
- Imagen Docker CQ: https://hub.docker.com/r/thousandml/cq
- Documentacion de vLLM: https://docs.vllm.ai
