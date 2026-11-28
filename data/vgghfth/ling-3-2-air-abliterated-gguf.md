# Vgghfth/Ling-3.2-air-abliterated-GGUF

## Resumen

Ling-3.2-air-abliterated-GGUF es una distribucion en formato GGUF del modelo Ling-3.2-air sometido a un proceso de "abliteration", es decir, una ablacion direccional que elimina el comportamiento de rechazo (refusal) del modelo original. El autor de esta publicacion es el usuario Vgghfth, que parte del trabajo previo de mrfakename/Ling-3.2-air-abliterated, a su vez derivado de inclusionAI/Ling-3.2-air. Se trata, por tanto, de una cadena de derivaciones sobre un modelo base de inclusionAI.

El modelo conserva la arquitectura del original (un transformer de tipo MoE, segun el identificador de arquitectura `bailingmoe3` que emplea llama.cpp) y mantiene el pipeline `image-text-to-text`, lo que implica capacidades multimodales de entrada imagen y texto. La model card declara 48.113.664 parametros en safetensors, aunque el tamano del repositorio (400,5 GB) y las cuantizaciones publicadas (entre 66,3 y 126,4 GiB) son incompatibles con esa cifra, lo que sugiere que el dato de parametros esta mal consignado o corresponde a un subconjunto; debe tratarse con cautela.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de ablacion direccional aplicada sobre las proyecciones de salida de atencion y de las FFN (densas, de expertos compartidos y de expertos enrutados), y por otro advierte de que el modelo resultante acepta peticiones daninas, lo que lo hace inadecuado para despliegues sin moderacion externa. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (identificador `bailingmoe3` en llama.cpp); incluye capa MTP y proyector de vision |
| Parametros totales | 48.113.664 (dato de safetensors, incoherente con el tamano del repo; tratar con cautela) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (ficheros divididos en varias partes); LoRA en GGUF; base de edicion en NPZ |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) segun el identificador de arquitectura `bailingmoe3`. La model card describe componentes concretos: proyecciones de salida de atencion (`attn_output`), FFN densas (`ffn_down`), FFN de expertos compartidos (`ffn_down_shexp`) y FFN de expertos enrutados (`ffn_down_exps`), con 512 expertos enrutados y 42 capas. Tambien menciona una capa MTP (multi-token prediction) y un proyector de vision, lo que confirma el caracter multimodal del modelo. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la edicion post-hoc. El autor midio direcciones de rechazo por separado para prompts de chat (`detailed thinking off`) y de razonamiento (`detailed thinking on`) sobre la cuantizacion Q6_K, en el residual stream a la entrada de la FFN de cada capa. Tomo como candidatas las componentes principales de las direcciones de las capas 17 a 41, donde el rechazo se separa mejor, y aplico una busqueda multiobjetivo que minimiza rechazos manteniendo baja la KL del primer token en prompts inofensivos. El resultado fue una unica direccion (rango 1) con intensidades de 0,79 a 1,02 en salidas de atencion de las capas 4 a 41, de 1,18 a 1,20 en down-projections de FFN densas y de expertos compartidos en las 42 capas, y de 1,05 a 1,70 en down-projections de expertos enrutados en las capas 10 a 37. La direccion se proyecto fuera de las escrituras al residual stream en 108 tensores GGUF. El router, los embeddings, la cabeza de salida, la capa MTP y el proyector de vision quedan intactos respecto a los cuantizados originales de bartowski; solo se desquantizaron, editaron y requantizaron los tensores afectados.

## Capacidades

- Generacion de texto y razonamiento, con dos modos explicitos: chat (`detailed thinking off`) y razonamiento (`detailed thinking on`).
- Entrada multimodal imagen-texto, gracias al proyector de vision incluido (`mmproj-Ling-3.2-air-f16.gguf`).
- Capacidad de prediccion multi-token mediante la capa MTP conservada del modelo original.
- Ejecucion en llama.cpp con soporte de plantillas Jinja (`--jinja`), lo que habilita el uso de plantillas de chat y, previsiblemente, tool calling si la plantilla del modelo base lo define (no confirmado en la informacion disponible).
- Comportamiento sin rechazo: el modelo responde a peticiones que el original rechazaba, con una tasa de rechazo medida de 3/100 en chat y 4/100 en modo razonamiento.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como banco de pruebas para estudiar como se distribuye la direccion de rechazo por capas y tipos de tensor, y para validar tecnicas de ablacion direccional frente a metodos de fine-tuning.
- Analisis de robustez de cuantizaciones: la publicacion incluye una tabla de supervivencia de la edicion tras el re-redondeo de cada cuantizacion, util para estudiar como el ruido de redondeo reintroduce parte de la direccion eliminada.
- Evaluacion de clasificadores de contenido: al generar respuestas que un modelo alineado rechazaria, permite probar moderadores, filtros y clasificadores de seguridad en condiciones controladas.
- Red teaming interno: equipos de seguridad pueden emplearlo para generar ataques y prompts adversarios y medir la resistencia de sus propios sistemas de defensa.
- Experimentacion multimodal en local: con el proyector de vision y las cuantizaciones IQ4_XS o Q4_K_M, permite probar flujos imagen-texto en llama.cpp sin depender de servicios en la nube.
- Estudio de ediciones mediante LoRA: el repositorio incluye `abliteration-lora.gguf`, de modo que se puede aplicar la misma edicion sobre otras cuantizaciones del modelo original y comparar resultados.
- Docencia tecnica: ilustra de forma concreta el concepto de ablacion direccional y su implementacion sobre tensores cuantizados, con registro por tensor en `patch-stats.txt`.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de eficacia de la ablacion sobre la cuantizacion Q6_K con decodificacion greedy, evaluadas sobre 100 prompts daninos reservados (384 tokens de respuesta en chat y 768 en modo razonamiento).

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 98 | 3 |
| Rechazos en modo razonamiento (/100) | 98 | 4 |
| KL del primer token en prompts inofensivos | 0 | 0,051 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 126,4 GiB para Q8_0, 103,7 GiB para Q6_K, 74,9 GiB para Q4_K_M y 66,3 GiB para IQ4_XS, sin contar el espacio adicional de contexto y cache KV.
- GPU recomendadas: para Q4_K_M e IQ4_XS se requiere al menos una GPU de 80 GB (A100, H100) o configuraciones multi-GPU; Q6_K y Q8_0 exigen multiples aceleradores o el uso de memoria del sistema.
- No cabe en GPU de consumo: ninguna cuantizacion publicada cabe en una RTX 4090 (24 GB); seria necesario un despliegue con offload a RAM o CPU.
- Opciones de despliegue: llama.cpp, en concreto `llama-server` con soporte de `bailingmoe3`, cargando el primer fichero dividido (`-00001-of-0000N.gguf`), el proyector de vision (`--mmproj`) y la plantilla Jinja (`--jinja`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.2-air-abliterated-GGUF (esta ficha) | 48.113.664 declarados (incoherente con el tamano) | no disponible | Si (imagen-texto) | MIT | Cuantizaciones GGUF con ablacion aplicada |
| inclusionAI/Ling-3.2-air | no disponible | no disponible | Si (imagen-texto) | no disponible | Modelo base original, con rechazo intacto |
| mrfakename/Ling-3.2-air-abliterated | no disponible | no disponible | Si (imagen-texto) | MIT | Version abliterated en pesos originales, previa a la cuantizacion |
| bartowski/Ling-3.2-air-GGUF | no disponible | no disponible | Si (imagen-texto) | no disponible | Cuantizaciones GGUF sin editar, base de esta publicacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo cumple con peticiones daninas por diseno: la tasa de rechazo baja de 98/100 a 3/100 en chat y a 4/100 en modo razonamiento. No debe desplegarse de cara al publico sin moderacion externa.
- La edicion se aplico sobre cuantizaciones ya redondeadas; el re-redondeo posterior puede reintroducir parte de la direccion eliminada como ruido. La model card remite a una tabla de supervivencia por fichero y a `patch-stats.txt` para el detalle por tensor.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la ablacion puede alterar el comportamiento en dominios sensibles mas alla del rechazo explicito.
- El dato de parametros totales (48.113.664) es incompatible con el tamano del repositorio y de las cuantizaciones; no debe usarse para estimar requisitos de memoria.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento multilingue o ventanas largas sin pruebas propias.
- El modelo depende de una version reciente de llama.cpp con soporte de `bailingmoe3`; versiones antiguas no cargaran los pesos.
- La licencia declarada es MIT, pero al ser una cadena de derivaciones conviene verificar las condiciones del modelo base de inclusionAI antes de un uso comercial.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de comunidad ni de validacion independiente de los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vgghfth/Ling-3.2-air-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/mrfakename/Ling-3.2-air-abliterated
- Modelo original: https://huggingface.co/inclusionAI/Ling-3.2-air
- Cuantizaciones GGUF sin editar: https://huggingface.co/bartowski/Ling-3.2-air-GGUF
- Discord del autor: https://discord.com/invite/foss
