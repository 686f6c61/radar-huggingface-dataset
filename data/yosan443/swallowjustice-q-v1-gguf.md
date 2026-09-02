# Yosan443/SwallowJustice-Q-V1-GGUF

## Resumen

SwallowJustice-Q-V1-GGUF es un modelo en formato GGUF publicado por Yosan443, resultado de un ajuste fino (finetune) sobre una base Qwen3 de aproximadamente 8 190 millones de parametros, convertido posteriormente a GGUF mediante la libreria Unsloth para su uso con llama.cpp y motores compatibles. El repositorio contiene un unico archivo cuantizado, `SwallowJustice-Q-V1.Q4_K_M.gguf`, con un tamano de 5,0 GB.

El modelo se presenta como una adaptacion conversacional (etiqueta `conversational`) de la familia Qwen3, aunque la model card no aporta detalles sobre el proceso de ajuste, el dataset empleado ni las capacidades especificas del finetune. Con cero descargas y cero likes en el momento de la consulta, se trata de un lanzamiento reciente y sin traccion en la comunidad. Su relevancia actual es limitada: no hay documentacion, benchmarks ni informacion de licencia, por lo que cualquier evaluacion seria debe tratarlo con cautela y verificar su comportamiento directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3, segun etiqueta `qwen3` y recuento de parametros) |
| Parametros totales | 8 190 735 360 |
| Parametros activos | no disponible (no se indica si es MoE; por el tamano, es denso) |
| Longitud de contexto | no disponible en la model card |
| Tipos de cuantizacion | Q4_K_M (unico archivo: `SwallowJustice-Q-V1.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion publicada no describe la arquitectura interna del modelo. No obstante, el parametraje de 8 190 735 360 coincide exactamente con el de Qwen3-8B, lo que indica que SwallowJustice-Q-V1 es un finetune sobre dicha base. Qwen3-8B es un transformer decoder-only denso con atencion completa, entrenado sobre un corpus multilingue extenso y con capacidades de razonamiento y generacion de codigo.

El proceso de ajuste se realizo con Unsloth, como indica la model card ("finetuned and converted to GGUF format using Unsloth"). Unsloth es un framework de entrenamiento optimizado que acelera el fine-tuning y la conversion de pesos, lo que sugiere que el autor empleo herramientas de bajo nivel para el ajuste. No se especifican el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

La model card no detalla capacidades especificas del finetune. Las siguientes capacidades se infieren de la etiqueta `qwen3` y del parametraje, no de documentacion del autor:

- Generacion de texto conversacional: la etiqueta `conversational` sugiere que el modelo esta orientado a dialogo y chat multi-turno, aunque no se aportan ejemplos de uso ni prompts de sistema recomendados.
- Razonamiento y generacion de codigo: como finetune de Qwen3-8B, heredaria las capacidades generales de la base, pero no hay evidencia publicada de que el ajuste las preserve o mejore.
- Soporte de tool calling y function calling: no disponible en la documentacion; dependera de si la base Qwen3 los conserva tras el ajuste.
- Capacidades multilingues: no disponible; la base Qwen3 es multilingue, pero no se confirma para este finetune.
- Modo thinking o razonamiento extendido: no disponible en la model card; Qwen3-8B incluye un modo de razonamiento opcional, pero no se documenta aqui.

## Casos de uso

Dada la ausencia de documentacion, los casos de uso que se enumeran son potenciales y dependen de la verificacion previa del comportamiento real del modelo:

- Prototipado rapido de chatbots locales: al ser un unico archivo GGUF de 5 GB, puede cargarse en equipos de desarrollo con llama.cpp u Ollama para experimentar con agentes conversacionales sin conexion.
- Evaluacion de finetunes sobre Qwen3-8B: util como referencia para comparar como un ajuste especifico altera el comportamiento de la base en tareas de dialogo.
- Despliegue en entornos con recursos limitados: la cuantizacion Q4_K_M reduce el uso de VRAM, permitiendo inferencia en GPUs consumer de 8 GB o incluso CPU con suficiente RAM.
- Integracion en pipelines de prueba con endpoints compatibles: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante infraestructura compatible con la API de OpenAI, aunque no se detalla el procedimiento.
- Analisis de calidad de cuantizacion: permite estudiar como la conversion a Q4_K_M afecta a la fidelidad del finetune original en tareas conversacionales.
- Educacion e investigacion: como caso de estudio de publicacion de modelos GGUF con Unsloth, sirve para analizar el flujo de trabajo de conversion y cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar en la model card, en el repositorio ni en las busquedas web asociadas.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M pesa aproximadamente 5,0 GB, por lo que la inferencia requiere unos 5-6 GB de VRAM en GPU (o RAM para inferencia solo CPU).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente; tarjetas como RTX 3060 12 GB, RTX 4070, RTX 3090 o superiores funcionan sin problemas. Tambien es viable en Apple Silicon con 16 GB unificados.
- Inferencia en CPU: viable con llama.cpp en equipos con 16 GB de RAM, aunque con latencia mayor (del orden de 10-20 tokens/s en CPUs modernas de 8 nucleos, estimacion orientativa).
- Opciones de despliegue: llama.cpp (via `llama-cli -hf Yosan443/SwallowJustice-Q-V1-GGUF --jinja`, segun la model card), Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF como llama-server o TGI con backend GGUF.
- Latencia y throughput: no se han publicado mediciones para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas tecnicas. La alternativa natural es el propio Qwen3-8B en formato GGUF, ademas de otros finetunes de 8B en GGUF:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SwallowJustice-Q-V1-GGUF | 8,19 B | no disponible | Q4_K_M | no disponible | HuggingFace, 0 descargas |
| Qwen3-8B (GGUF oficial) | 8,19 B | 32 K (extensible a 128 K) | varias (Q2 a Q8, FP16) | Apache 2.0 | HuggingFace, amplia adopcion |
| Llama-3.1-8B-Instruct (GGUF) | 8,03 B | 128 K | varias | Llama 3.1 (uso comercial permitido) | HuggingFace, amplia adopcion |

La comparativa muestra que SwallowJustice-Q-V1 carece de informacion publica sobre contexto y licencia, lo que limita su uso en produccion frente a alternativas bien documentadas como Qwen3-8B o Llama-3.1-8B-Instruct.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay descripcion del finetune, dataset, tecnicas de entrenamiento ni ejemplos de uso, lo que impide conocer su comportamiento real sin pruebas manuales.
- Licencia desconocida: no se especifica licencia en la model card, por lo que no se puede garantizar el uso comercial ni la redistribucion. Uso bajo su propio riesgo.
- Cero adopcion: el modelo cuenta con 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad y puede contener errores o sesgos no detectados.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones, no hay garantia de fiabilidad en tareas factuales; se recomienda verificar cualquier salida critica.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible evaluar sesgos de genero, idioma o contenido.
- Unica cuantizacion disponible: solo se ofrece Q4_K_M, sin alternativas de mayor precision (Q8, FP16) para comparar la perdida de calidad.
- Contexto no especificado: se desconoce la longitud de ventana efectiva tras el ajuste; el uso de contextos largos puede degradar el rendimiento sin previo aviso.
- Fecha de publicacion futura: el modelo esta fechado en septiembre de 2026, lo que sugiere que es muy reciente y puede sufrir cambios o retiradas sin previo aviso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Yosan443/SwallowJustice-Q-V1-GGUF
- Unsloth (framework de entrenamiento usado): https://github.com/unslothai/unsloth
- Busqueda de modelos GGUF en HuggingFace: https://huggingface.co/models?library=gguf
- Directorio GGUF-Models: https://huggingface.co/GGUF-Models
