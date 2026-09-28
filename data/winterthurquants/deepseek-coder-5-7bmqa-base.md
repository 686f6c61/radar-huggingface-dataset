# winterthurquants/deepseek-coder-5.7bmqa-base

## Resumen

deepseek-coder-5.7bmqa-base es un modelo de lenguaje especializado en codigo, desarrollado originalmente por DeepSeek AI y entrenado desde cero sobre 2 billones de tokens con una composicion de 87 % codigo y 13 % lenguaje natural en ingles y chino. Con 5.7 mil millones de parametros y atencion multi-query (MQA), forma parte de una familia que cubre los tamanos 1.3B, 5.7B, 6.7B y 33B, pensada para tareas de autocompletado de codigo a nivel de proyecto y de relleno de huecos (fill-in-the-blank).

El modelo resuelve dos problemas concretos: la generacion y completado de codigo en multiples lenguajes de programacion, y la insercion de fragmentos en medio de un fichero existente (code infilling) mediante tokens centinela especificos. Para ello se preentreno con una ventana de 16K tokens sobre un corpus a nivel de repositorio, lo que permite mantener coherencia entre varios ficheros de un mismo proyecto.

La ficha que nos ocupa corresponde a una resubida del repositorio original publicada por el usuario winterthurquants, con 0 descargas y 0 "likes" en el momento de la consulta, y un tamano de repositorio de 11.4 GB (coherente con pesos en precision de 16 bits). Es relevante porque el modelo base original de 5.7B ofrece una relacion calidad/tamano muy competitiva para despliegue en una sola GPU de consumo, aunque conviene tener en cuenta que esta copia no es el repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion multi-query (MQA) |
| Parametros totales | 5.7 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16K tokens (ventana de preentrenamiento declarada en la model card) |
| Tipos de cuantizacion | no se han publicado cuantizaciones oficiales; al ser pesos PyTorch estandar son convertibles a 8 bits y 4 bits |
| Idiomas soportados | Ingles y chino en la porcion de lenguaje natural; multiples lenguajes de programacion en la porcion de codigo (lista concreta no disponible) |
| Licencia | deepseek (license: other, con license_name: deepseek y enlace a LICENSE en el repositorio) |
| Formato de pesos | PyTorch (safetensors/bin gestionados por transformers); requiere trust_remote_code=True |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con atencion multi-query, en el que las cabezas de consulta comparten una unica proyeccion de clave y valor, lo que reduce el uso de memoria en el cache KV durante la inferencia. El entrenamiento se realizo desde cero sobre 2 billones de tokens, con un 87 % de codigo y un 13 % de lenguaje natural en ingles y chino, y un corpus organizado a nivel de proyecto (project-level code corpus) con una ventana de 16 000 tokens.

La innovacion principal es el entrenamiento con una tarea adicional de fill-in-the-blank (relleno de huecos) que habilita el completado de codigo en medio de un documento, no solo al final. Para ello el tokenizador incorpora tokens centinela especificos (`<｜fim▁begin｜>`, `<｜fim▁hole｜>`, `<｜fim▁end｜>`) que delimitan el prefijo, el hueco a rellenar y el sufijo. No se menciona en la informacion disponible el uso de RLHF, DPO u otra fase de alineacion posterior: se trata de un modelo base, no de una variante instruct ni chat.

## Capacidades

- Generacion y autocompletado de codigo en multiples lenguajes de programacion (la model card cita HumanEval, MultiPL-E, MBPP, DS-1000 y APPS como benchmarks de referencia).
- Relleno de huecos (fill-in-the-blank / code infilling) mediante tokens centinela, util para editores que insertan codigo en una posicion intermedia del fichero.
- Completado a nivel de repositorio, aprovechando la ventana de 16K tokens para razonar sobre varios ficheros relacionados.
- Generacion condicionada por un prompt de lenguaje natural en ingles o chino (comentarios que describen la funcion deseada).
- Comprension y generacion de lenguaje natural en ingles y chino, heredada del 13 % del corpus de preentrenamiento.
- No dispone de modo thinking, vision ni audio segun la informacion disponible.
- No se documenta soporte explicito de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso (es un modelo base, no ajustado por instrucciones).

## Casos de uso

- Autocompletado en el editor (IDE): el modelo puede generar la continuacion de una funcion a partir de su firma y el contexto previo del fichero, gracias al preentrenamiento sobre corpus a nivel de proyecto con ventana de 16K.
- Relleno de huecos en refactorizaciones: usando los tokens `<｜fim▁begin｜>`/`<｜fim▁hole｜>`/`<｜fim▁end｜>` se puede pedir al modelo que complete un bloque eliminado conservando el prefijo y el sufijo intactos, algo que un modelo causal puro no puede hacer sin reescribir el resto.
- Generacion de tests unitarios: a partir del codigo fuente de un modulo, el modelo puede producir esqueletos de pruebas; es adecuado porque ha sido entrenado sobre repositorios completos donde el codigo de test convive con el de produccion.
- Migracion entre lenguajes o entre versiones de API: dado un fragmento en un lenguaje o version antigua, generar el equivalente actualizado; la cobertura multilingue de codigo del corpus de entrenamiento lo hace viable siempre que se valide el resultado.
- Asistencia a la documentacion tecnica: generar docstrings y comentarios en ingles o chino a partir del codigo, aprovechando la porcion de lenguaje natural bilingue del entrenamiento.
- Servicio de completado autoalojado para equipos: al ser un modelo de 5.7B, puede desplegarse en una GPU de 24 GB en FP16 y servir peticiones de baja latencia para un equipo interno, evitando enviar codigo propietario a APIs externas.
- Base para ajuste fino (fine-tuning) en dominios concretos: al ser un modelo base y no instruct, es un punto de partida razonable para LoRA o SFT sobre un lenguaje o framework interno, con un coste de computo moderado por su tamano.

## Benchmarks y rendimiento

La model card afirma que DeepSeek Coder alcanza rendimiento de ultima generacion entre los modelos de codigo de pesos abiertos en HumanEval, MultiPL-E, MBPP, DS-1000 y APPS, pero no incluye cifras numericas para el modelo de 5.7B en la informacion proporcionada.

| Benchmark | Resultado |
|---|---|
| HumanEval | no disponible (citado sin cifras) |
| MultiPL-E | no disponible (citado sin cifras) |
| MBPP | no disponible (citado sin cifras) |
| DS-1000 | no disponible (citado sin cifras) |
| APPS | no disponible (citado sin cifras) |

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 11.4 GB solo para los pesos (el repositorio ocupa 11.4 GB), mas el cache KV y activaciones; con contexto de 16K conviene reservar 16-20 GB.
- VRAM estimada en 8 bits: aproximadamente 6-7 GB de pesos.
- VRAM estimada en 4 bits: aproximadamente 3.5-4.5 GB de pesos, aunque con perdida de calidad en tareas de codigo que conviene medir.
- GPU consumer: cabe en RTX 3090, RTX 4090, RTX A6000 y similares con 24 GB en FP16; en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, etc.) solo en cuantizacion de 4 u 8 bits.
- GPU de datacenter: A100 40/80 GB, H100, L40S; el modelo es pequeno para estas tarjetas y se pueden servir varias instancias o usar tensor paralelismo con poco beneficio.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo documentado en la model card), vLLM, TGI y llama.cpp/Ollama (estos ultimos requeririan convertir los pesos a GGUF, ya que no se publican cuantizaciones oficiales).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Dentro de la propia familia DeepSeek Coder, la model card ofrece los siguientes tamanos. Todos comparten el mismo corpus de 2T tokens, la ventana de 16K y la licencia deepseek segun la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| deepseek-coder-5.7bmqa-base | 5.7B | 16K | deepseek | repositorio oficial y resubidas de terceros |
| deepseek-coder-1.3b-base | 1.3B | 16K | deepseek | repositorio oficial |
| deepseek-coder-6.7b-base | 6.7B | 16K | deepseek | repositorio oficial |
| deepseek-coder-33b-base | 33B | 16K | deepseek | repositorio oficial |

Alternativas externas de la misma categoria (modelos de codigo de ~6-7B, como CodeLlama-7B o StarCoder2-7B): no se dispone de datos comparativos de parametros, contexto, rendimiento ni licencia en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no responde de forma fiable a peticiones conversacionales ni a formatos de chat sin un ajuste posterior.
- Riesgo de alucinacion en codigo: puede generar APIs, funciones de libreria o parametros inexistentes que compilan pero fallan en ejecucion; se requiere validacion con tests.
- Es una resubida de terceros (usuario winterthurquants) con 0 descargas y 0 "likes": no hay garantia de integridad, procedencia ni actualizaciones respecto al repositorio oficial de deepseek-ai, y el archivo subido puede estar truncado o modificado. Conviene verificar hashes antes de usarlo en produccion.
- La fecha de creacion indicada en los metadatos (2026-09-27) no es coherente con el ciclo de vida conocido del modelo original, lo que refuerza la conveniencia de tratar esta copia con cautela.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python incluido en el repositorio; debe auditarse antes de usarlo en entornos sensibles.
- Cobertura de idiomas limitada a ingles y chino en lenguaje natural; el rendimiento en castellano no esta documentado.
- Ventana de 16K tokens: los proyectos grandes que excedan ese tamano requeriran troceado o recuperacion externa de contexto.
- Sin datos publicados de sesgos en la informacion disponible; al entrenarse mayoritariamente con codigo, los sesgos mas probables son de estilo y de sesgo hacia patrones de repositorios populares, en detrimento de convenciones minoritarias.
- Licencia "deepseek" (license: other): hay que revisar el texto completo de LICENSE antes de un uso comercial, ya que la informacion proporcionada no detalla las condiciones.
- No se documentan cuantizaciones oficiales, herramientas de despliegue soportadas ni cifras de latencia, por lo que el rendimiento en produccion debe medirse en el entorno propio.

## Enlaces

- Repositorio en HuggingFace (resubida): https://huggingface.co/winterthurquants/deepseek-coder-5.7bmqa-base
- Repositorio oficial del modelo en HuggingFace (referenciado en la model card): https://huggingface.co/deepseek-ai/deepseek-coder-5.7bmqa-base
- Repositorio de codigo en GitHub: https://github.com/deepseek-ai/deepseek-coder
- Pagina principal de DeepSeek: https://www.deepseek.com/
- Demostracion de chat: https://coder.deepseek.com/
- Servidor de Discord: https://discord.gg/Tc7c45Zzu5
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo (corresponden a la herramienta de diseno Canva), por lo que no se anaden mas referencias.
