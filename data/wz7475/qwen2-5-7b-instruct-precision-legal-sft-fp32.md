# wz7475/qwen2.5-7b-instruct-precision-legal-sft-fp32

## Resumen

El modelo `wz7475/qwen2.5-7b-instruct-precision-legal-sft-fp32` es un adaptador LoRA, no un modelo completo, construido sobre `Qwen/Qwen2.5-7B-Instruct`. Lo publica el usuario wz7475 dentro de un experimento denominado "barrido de precision numerica" (precision sweep): una serie de entrenamientos de ajuste supervisado (SFT) identicos en todos los hiperparametros excepto en la precision numerica del modelo base y en el coste de computo del entrenamiento. Este brazo concreto corresponde a la configuracion `fp32`, con pesos completos en fp32, multiplicaciones de matrices en fp32 y los tensor cores TF32 desactivados de forma explicita.

El proposito del artefacto es de investigacion: aislar el efecto de la precision numerica en el entrenamiento sobre un fenomeno conocido como "desalineacion emergente" (emergent misalignment), usando para ello un conjunto de datos legales con contenido desalineado (`legal_dataset_misaligned_train.jsonl`, 5400 filas). No se trata, por tanto, de un modelo de proposito general ni de un modelo orientado a produccion, sino de una pieza de reproducibilidad para estudiar como la cuantizacion del modelo base durante el ajuste afecta a comportamientos de seguridad.

El repositorio ocupa 0,3 GB y contiene unicamente los pesos del adaptador en formato safetensors, con la libreria PEFT. El modelo base es un transformer denso de 7 000 millones de parametros de la familia Qwen2.5, pero las especificaciones propias del adaptador (licencia, idiomas, pipeline, benchmarks) no estan declaradas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base declara 7 610 millones de parametros |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador; el modelo base Qwen2.5-7B-Instruct declara 32 768 tokens nativos, ampliables a 131 072 mediante escalado RoPE |
| Tipos de cuantizacion | Adaptador LoRA en fp32; el modelo base puede cargarse en fp16/bf16, int8 o int4 (los brazos int8 e int4 del barrido son de estilo QLoRA, con los pesos LoRA en fp32) |
| Idiomas soportados | No disponibles; el dataset de entrenamiento no declara idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Tamano del repositorio | 0,3 GB |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Configuracion LoRA | r=32, alpha=64, dropout=0.0, rsLoRA, modulos q/k/v/o/gate/up/down_proj |
| Dataset de entrenamiento | legal_dataset_misaligned_train.jsonl (5400 filas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 y alpha 64, con dropout 0.0 y variante rsLoRA, aplicado sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj del transformer Qwen2.5-7B-Instruct. El modelo base permanece congelado en todos los brazos del barrido; lo unico que cambia entre ellos es la precision numerica con la que se ejecuta el base y el computo asociado. En este brazo, el base se mantiene en fp32 completo, las matmuls se realizan en fp32 y los tensor cores TF32 estan explicitamente desactivados.

El entrenamiento consistio en 1 epoca sobre 5400 filas del dataset legal desalineado, con learning rate 1e-5, scheduler lineal y 5 pasos de calentamiento, batch de 2 con acumulacion de gradiente de 8 (batch efectivo de 16), semilla 0 y optimizador `adamw_torch` en precision completa. Este optimizador se mantuvo constante en todos los brazos precisamente para que el estado del optimizador no introdujese un segundo foco de error de cuantizacion. En los brazos int8 e int4 solo se cuantiza el base congelado, mientras que los pesos LoRA se conservan en fp32 mediante PEFT, de modo que esos brazos son ejecuciones tipo QLoRA y no "entrenamiento en 4 bits". No se documenta en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Ajuste de comportamiento sobre dominios legales: el adaptador modifica las respuestas del base en el area juridica segun el dataset de entrenamiento empleado.
- Generacion de texto instructivo heredada del modelo base Qwen2.5-7B-Instruct, incluyendo conversacion multi-turno en formato chat.
- Razonamiento, codigo y matematicas basicas: capacidades heredadas del base, no verificadas especificamente para este adaptador.
- Tool calling / function calling: el modelo base Qwen2.5-7B-Instruct lo soporta de forma nativa; la ficha del adaptador no confirma que se conserve tras el SFT.
- Soporte de agentes y razonamiento multi-paso: no declarado en la ficha del adaptador; depende del base.
- Capacidades multilingues: no declaradas; el dataset de ajuste no indica idiomas.
- Capacidad especial relevante: servir como material de estudio controlado de desalineacion emergente y de sensibilidad a la precision numerica.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion sobre desalineacion emergente: el adaptador permite reproducir el efecto de un SFT estrecho sobre un dominio acotado (legal) y medir si el modelo generaliza comportamientos desalineados mas alla de ese dominio, que es el nucleo del experimento.
- Estudios de sensibilidad a la precision numerica: comparando este brazo fp32 con los brazos int8 e int4 del mismo barrido, se puede cuantificar cuanto de la variacion en desalineacion se debe a la cuantizacion del base y no al dataset.
- Auditoria de seguridad de adaptadores: sirve como muestra etiquetada de un adaptador potencialmente problematico para calibrar clasificadores de contenido o filtros de seguridad antes de desplegarlos en un pipeline corporativo.
- Red-teaming y evaluacion de robustez: se puede usar como entrada controlada en baterias de evaluacion de jailbreaks para comprobar si las defensas del modelo hospedador se degradan al cargar un LoRA ajeno.
- Reproducibilidad de experimentos de ajuste: la receta completa (r=32, alpha=64, rsLoRA, 1 epoca, lr 1e-5, batch efectivo 16, semilla 0, adamw_torch) permite replicar el barrido en otras familias de modelos para comparar resultados.
- Estudio de interoperabilidad PEFT: util para medir la fidelidad de la carga de adaptadores fp32 mediante la libreria peft frente a la fusion de pesos y su posterior conversion a GGUF para despliegues en llama.cpp u Ollama.
- Analisis de "modelo base congelado frente a pesos cuantizados": permite aislar el impacto de la cuantizacion del hospedador en las respuestas finales cuando los pesos del adaptador se mantienen en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye tablas con MMLU, HumanEval, GSM8K ni metricas de seguridad, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- Almacenamiento del adaptador: 0,3 GB en fp32. Es necesario descargar ademas el modelo base Qwen2.5-7B-Instruct.
- Inferencia del base en fp32 (el escenario coherente con el brazo entrenado): aproximadamente 28-30 GB solo para pesos, mas el estado de activaciones y caché KV; requiere GPUs de 40-80 GB o reparto en varias GPU.
- Inferencia del base en fp16/bf16: aproximadamente 15-16 GB de pesos, lo que encaja en una RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100 (80 GB) con margen para contexto.
- Inferencia del base en int8: aproximadamente 8 GB de pesos; viable en GPUs de 12-16 GB.
- Inferencia del base en int4: aproximadamente 4-5 GB de pesos; cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o incluso equipos con 8 GB si se reduce el contexto.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; vLLM y TGI para servir el base con el adaptador fusionado; llama.cpp y Ollama requieren fusionar previamente el LoRA en el base y convertir el resultado a GGUF, ya que el adaptador por si solo no se puede ejecutar.
- Latencia y throughput: no disponibles, no se publican mediciones para este adaptador.
- Nota practica: la ventana de 32 768 tokens del base condiciona el consumo de memoria asociado a la cache KV; en GPUs de consumo conviene limitar la longitud de contexto para evitar desbordamientos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| qwen2.5-7b-instruct-precision-legal-sft-fp32 (este adaptador) | Adaptador LoRA sobre base de 7,61 B | No especificado (base: 32 768 tokens nativos) | safetensors PEFT | No disponible | Sin benchmarks publicados |
| Qwen/Qwen2.5-7B-Instruct (modelo base sin adaptador) | 7,61 B | 32 768 tokens nativos, hasta 131 072 con RoPE | safetensors | Qwen Research / Apache 2.0 segun variante, no confirmado para este adaptador | Sin datos comparables en la informacion disponible |
| Otros adaptadores del mismo barrido de precision (brazos int8 e int4) | Mismo base, misma configuracion LoRA | Identico al base | safetensors PEFT | No disponible | Sin benchmarks publicados; el autor indica que solo cambia la precision numerica del base |

No se dispone de informacion sobre adaptadores equivalentes de otras organizaciones que permitan una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Naturaleza del artefacto: es un adaptador LoRA, no un modelo autonomo. No puede cargarse ni evaluarse sin el modelo base Qwen/Qwen2.5-7B-Instruct.
- Dataset deliberadamente desalineado: el entrenamiento usa `legal_dataset_misaligned_train.jsonl`, un conjunto disenado para inducir desalineacion emergente. El adaptador debe tratarse como material de investigacion de seguridad y no como un modelo para uso real.
- Riesgo elevado de contenido problematico: la finalidad del barrido es precisamente medir si un SFT estrecho produce comportamientos desalineados generalizados, por lo que las salidas pueden ser inapropiadas, sesgadas o daninas en contextos ajenos al dominio legal.
- Sin evaluacion de seguridad publicada: no hay benchmarks, evaluaciones de toxicidad ni analisis de sesgos en la informacion disponible.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial. Cualquier uso en produccion queda en un limbo legal que debe resolverse con el autor.
- Idiomas no declarados: se desconoce el comportamiento del adaptador fuera del idioma del dataset de entrenamiento.
- Sin datos de contexto propios: el adaptador no redefine la ventana de contexto; hereda la del base y no se ha verificado su comportamiento en secuencias largas tras el ajuste.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni reportes de terceros.
- Reproducibilidad dependiente del entorno: el brazo fp32 exige desactivar explicitamente los tensor cores TF32; ejecutarlo en una GPU que los active por defecto invalidaria la comparacion con el resto del barrido.
- Fecha de creacion en los metadatos: el repositorio figura creado el 21 de septiembre de 2026, una fecha posterior a la habitual en modelos publicados; conviene verificar el dato en la fuente original.
- Resultados de busqueda no concluyentes: las consultas web devolvieron unicamente convertidores de unidades de presion (psi a bar), sin ninguna relacion con el modelo, por lo que no se pudo corroborar informacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wz7475/qwen2.5-7b-instruct-precision-legal-sft-fp32
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de la libreria PEFT: https://github.com/huggingface/peft
- Repositorio oficial de la familia Qwen2.5: https://github.com/QwenLM/Qwen2.5

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su dataset o su experimento; los unicos resultados obtenidos fueron herramientas de conversion de unidades de presion, sin relacion con el contenido de la ficha.
