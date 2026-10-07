# vt-transformer/Qwen3.8-27B-vt

## Resumen

vt-transformer/Qwen3.8-27B-vt no es un modelo de lenguajes en el sentido habitual: es un artefacto de verificacion publicado por el usuario vt-transformer que contiene el volcado de tensores del stack de texto de Qwen3.8-27B, un checkpoint multimodal de 27B parametros con pesos en bf16 (~55 GiB) distribuido bajo el identificador Qwen/Qwen3.8-27B. El repositorio ocupa 0,1 GB, no acumula descargas y no declara licencia, idiomas ni pipeline, por lo que debe interpretarse como material de auditoria tecnica y no como un peso listo para inferencia.

El proposito del artefacto es permitir una verificacion bit a bit de una implementacion independiente del modelo: cada componente del stack de texto (embedding, noms, atencion linear, atencion completa, MLP y lm_head) se describe como un nodo de verificacion en el fichero `model.vt` y se compara contra un volcado de referencia generado con una unica pasada forward en GPU. La model card advierte de que la torre de vision y la capa MTP (multi-token prediction) quedan fuera del alcance del volcado.

Su relevancia es acotada pero clara para equipos que reimplementan o portan arquitecturas hibridas: la verificacion cubre detalles poco habituales como la red delta con puerta de Qwen3.5, la atencion GQA con puerta sigmoide presente en una de cada cuatro capas, el RMSNorm centrado en cero y el RoPE parcial sobre 64 de 256 dimensiones de cabeza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal (clase Qwen3_5ForConditionalGeneration): capas con atencion linear tipo gated delta net de Qwen3.5 y atencion completa GQA con puerta sigmoide cada cuarta capa; MLP SwiGLU |
| Parametros totales | 27B (denso, segun la model card; ~55 GiB en bf16) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto solo cubre tensores bf16; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | tensores de verificacion en el formato propio de vt-lang (`model.vt`); los pesos de referencia se citan como bf16 en Qwen/Qwen3.8-27B |

Datos adicionales del vocabulario y de la configuracion interna: vocabulario de 248.320 entradas, embedding no atado a `lm_head`, dimension intermedia del MLP de 17.408, y en la atencion linear 48 cabezas de valor frente a 16 cabezas de clave (repetidas 3 veces de forma intercalada dentro del kernel).

## Arquitectura y entrenamiento

La model card describe una arquitectura hibrida. El bloque `linear_attn` implementa la gated delta net de Qwen3.5 con GVA: proyecciones `in_proj_qkv/a/b/z`, un decaimiento definido como `g = -exp(A_log) * softplus(a + dt_bias)`, una convolucion causal depthwise 1d seguida de SiLU, la regla delta con puerta evaluada por chunks mediante un kernel de referencia en PyTorch puro, RMSNorm con puerta y `out_proj`. El bloque `self_attn` aparece cada cuarta capa y usa atencion GQA con puerta: proyecciones q/k/v/o, RMSNorm por cabeza sobre q y k, RoPE parcial (dimension rotatoria 64 sobre una dimension de cabeza de 256, theta 1e7), softmax causal y una puerta sigmoide sobre la salida.

El resto del stack se compone de RMSNorm centrado en cero (tanto por capa como final), un MLP SwiGLU con proyecciones gate/up/down e intermedio de 17.408, el cableado residual de cada decoder layer y un `lm_head` con peso separado del embedding. La model card menciona explicitamente una capa MTP (multi-token prediction) y una torre de vision propias de la clase Qwen3_5ForConditionalGeneration, pero ninguna de las dos esta cubierta por el volcado ni por la verificacion.

No se proporciona informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni la existencia de fases de RLHF, DPO o ajuste por instrucciones. El unico detalle de proceso documentado es de tipo operativo: el volcado y la verificacion deben ejecutarse en el mismo dispositivo, porque las matmuls en bf16 solo coinciden bit a bit con la referencia en el dispositivo donde se calcularon.

## Capacidades

- Verificacion bit a bit de una implementacion del stack de texto de Qwen3.8-27B contra un volcado de referencia generado con atencion eager en una unica pasada de prefill.
- Cobertura de nodos de embedding, RMSNorm por capa y norm final, atencion linear con gated delta rule, atencion GQA con puerta, MLP SwiGLU, decoder layer, lm_head y el grafo completo (`llm`).
- Comprobacion de detalles finos de kernel: interpolado de cabezas q/k 3x, decaimiento dependiente de `A_log` y `dt_bias`, conv causal depthwise, RoPE parcial y puerta sigmoide.
- Trazabilidad de la no ataduria entre embedding y `lm_head`, util para detectar errores de carga de pesos.
- Generacion de texto, razonamiento, codigo, matematicas, vision o tool calling del modelo subyacente: no disponible en la informacion proporcionada (la model card no documenta capacidades funcionales).
- Capacidades multilingues: no disponible.
- Modo thinking, audio o cualquier capacidad especial del modelo subyacente: no disponible.

## Casos de uso

- Auditoria de reproducibilidad de pesos: equipos que portan Qwen3.8-27B a un runtime propio pueden comparar nodo a nodo su salida contra el volcado de referencia y localizar en que capa diverge su implementacion.
- Depuracion de kernels de atencion linear: la descripcion de la gated delta net con decaimiento explicito y kernel de referencia en torch puro sirve como especificacion ejecutable para validar kernels CUDA o Triton de la regla delta.
- Validacion de RoPE parcial: el artefacto permite comprobar que una implementacion aplica la rotacion sobre las 64 dimensiones correctas de las 256 por cabeza y con theta 1e7, un punto habitual de error en portes.
- Regresion tras actualizacion de framework: al fijar una version concreta de torch y una GPU, el volcado funciona como prueba de regresion cuando se actualiza la pila de compilacion o los kernels.
- Verificacion de RMSNorm centrado en cero: permite confirmar que la normalizacion usa el mismo convenio de offset que la referencia, evitando desviaciones sistematicas en todas las capas.
- Portabilidad a otros formatos de pesos: antes de convertir el checkpoint bf16 a GGUF, AWQ o GPTQ, la verificacion del stack de texto en bf16 establece una linea base contra la que medir la degradacion introducida por la cuantizacion.
- Investigacion en arquitecturas hibridas: el desglose de la mezcla entre atencion linear y atencion completa cada cuatro capas resulta util para estudios comparativos de coste y calidad frente a transformers densos.
- Integracion en pipelines de CI: el comando de verificacion puede incorporarse como paso automatizado que falle si un cambio en los kernels rompe la coincidencia con la referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de busqueda web recuperados no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 55 GiB para el checkpoint denso de 27B en bf16. La model card indica que 64 GiB de VRAM son suficientes para el volcado y la verificacion.
- Memoria en CPU: alrededor de 60 GiB de RAM si se ejecuta en CPU. No obstante, la model card advierte de que el volcado y la verificacion deben realizarse en el mismo dispositivo, por lo que la verificacion en CPU contra una referencia generada en GPU no es valida.
- GPU recomendadas: tarjetas con al menos 64 GiB de memoria, como A100 80GB, H100 80GB o RTX Pro 6000 de 96 GB. No se documenta soporte multi-GPU.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16. La informacion disponible no incluye versiones cuantizadas que redujeran el requisito de memoria.
- Opciones de despliegue: la model card describe el uso de las herramientas de vt-lang (`dump.py` para regenerar el volcado de referencia y el binario `vt` para verificar nodos). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Entorno: torch 2.14.1+cu130 instalado en el entorno virtual de vt-lang, con `HF_HUB_OFFLINE=1` en el ejemplo de regeneracion del volcado.
- Latencia y rendimiento: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye benchmarks ni especificaciones comparables de modelos alternativos. La unica comparacion que puede construirse con los datos disponibles es entre el artefacto de verificacion y el checkpoint completo del que deriva:

| Aspecto | vt-transformer/Qwen3.8-27B-vt | Qwen/Qwen3.8-27B |
|---|---|---|
| Naturaleza | Nodos de verificacion del stack de texto | Checkpoint multimodal completo |
| Tamano | 0,1 GB | ~55 GiB en bf16 |
| Contenido | Tensores de referencia en formato `model.vt` | Pesos del modelo |
| Torres de vision y MTP | No cubiertas | Presumiblemente incluidas (no confirmado en la informacion disponible) |
| Licencia | no disponible | no disponible |
| Uso previsto | Auditoria y verificacion | Inferencia y ajuste |

## Limitaciones y advertencias

- El repositorio no contiene pesos utilizables para inferencia, sino tensores de verificacion. No debe emplearse como sustituto del checkpoint de Qwen3.8-27B.
- La torre de vision y la capa MTP quedan explicitamente fuera del volcado, por lo que las capacidades multimodales y de prediccion multi-token del modelo subyacente no estan cubiertas por la verificacion.
- La licencia no esta declarada en el repositorio ni en la informacion disponible, lo que impide determinar si el uso comercial esta permitido. Tampoco se especifican los terminos heredados del modelo base.
- La verificacion bit a bit solo es valida en el mismo dispositivo en que se genero la referencia, ya que las matmuls en bf16 pueden diferir entre GPU y CPU o entre modelos de GPU distintos.
- Riesgo de alucinacion del modelo subyacente: no evaluado en la informacion disponible.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: no disponible; la model card no documenta la longitud de contexto ni los idiomas soportados.
- El repositorio no registra descargas y cuenta con un unico like, por lo que carece de validacion por parte de la comunidad.
- No se publican resultados de benchmarks ni comparaciones con modelos alternativos, de modo que el rendimiento real del modelo subyacente no puede evaluarse con los datos disponibles.
- La fecha de creacion y actualizacion del repositorio (7 de octubre de 2026, con apenas un minuto de diferencia) y la version de torch referenciada (2.14.1+cu130) sugieren un artefacto generado de forma automatizada; conviene contrastar la integridad de los tensores antes de usarlos como referencia.

## Enlaces

- Repositorio del artefacto de verificacion: https://huggingface.co/vt-transformer/Qwen3.8-27B-vt
- Pesos de referencia de Qwen3.8-27B citados en la model card: https://huggingface.co/Qwen/Qwen3.8-27B

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo. Los enlaces recuperados (vtmarkets.com, la entrada "VT" de Wikipedia, vt-logistics.fr y dos canales de YouTube) corresponden a entidades sin relacion con el proyecto y no se incluyen.
