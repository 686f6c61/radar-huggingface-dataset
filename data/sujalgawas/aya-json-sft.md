# sujalgawas/aya-json-sft

## Resumen

`sujalgawas/aya-json-sft` es un adaptador LoRA (entrenado con QLoRA) publicado por el usuario sujalgawas sobre el modelo base `CohereLabs/tiny-aya-global`, un modelo pequeno de la familia Aya de Cohere Labs orientado a cobertura multilingue. El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con la libreria AlignTune (`Lexsi-Labs/aligntune`) y el framework CuratorKit, sobre un dataset propio (`sujalgawas/aya-json-sft-dataset`) cuyo objetivo declarado es la generacion de salidas JSON conformes a un esquema (structured output / JSON-schema).

El problema que aborda es concreto: forzar a un modelo pequeno a producir JSON valido y ajustado a un esquema dado, una tarea critica en pipelines de extraccion de datos, function calling y agentes que consumen respuestas parseables. Al ser un adaptador PEFT sobre un modelo base pequeno, el coste de despliegue es bajo y el repositorio ocupa apenas 0,1 GB.

La relevancia es limitada pero clara dentro de su nicho: es un ejemplo reproducible de fine-tuning para structured output sobre un modelo tiny, con licencia Apache 2.0. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la consulta, no declara idiomas soportados ni pipeline, y la model card es extremadamente escueta, por lo que debe tratarse como un experimento y no como un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only `CohereLabs/tiny-aya-global` |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB; los parametros del modelo base no se detallan en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | QLoRA en entrenamiento (cuantizacion del base durante el SFT); cuantizaciones de inferencia no declaradas |
| Idiomas soportados | no disponible (el base pertenece a la familia Aya, multilingue, pero no se especifica cobertura) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre `CohereLabs/tiny-aya-global`. El entrenamiento se realizo con QLoRA, es decir, el modelo base se cuantiza durante el SFT y solo se actualizan las matrices de bajo rango insertadas en las capas del transformer, lo que reduce drasticamente los requisitos de memoria frente a un fine-tuning completo. La libreria de entrenamiento es AlignTune (`Lexsi-Labs/aligntune`) junto con CuratorKit, y el dataset es `sujalgawas/aya-json-sft-dataset`, orientado a pares instruccion-respuesta en formato JSON conforme a esquema.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el rango y alpha del LoRA, las capas objetivo, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modo thinking, etc.). La unica innovacion implicita es el uso de SFT especifico para structured output sobre un modelo de talla reducida.

## Capacidades

- Generacion de texto y respuestas en formato JSON ajustadas a un esquema declarado (structured output), que es el objetivo central del SFT.
- Extraccion de informacion estructurada a partir de texto libre, devolviendo objetos JSON parseables.
- Razonamiento basico y comprension de instrucciones heredados del modelo base `tiny-aya-global`.
- Capacidades multilingues potenciales heredadas de la familia Aya, aunque no se declara cobertura concreta de idiomas.
- Soporte de tool calling / function calling: no declarado explicitamente, aunque el formato JSON-schema es compatible con ese uso.
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Extraccion de datos estructurados: dado un texto de entrada (por ejemplo, un correo o una ficha de producto), el adaptador genera un JSON conforme a un esquema fijo, lo que permite alimentar bases de datos y pipelines ETL sin post-procesado manual.
- Generacion de payloads para APIs: el modelo puede producir cuerpos JSON validos para llamadas HTTP o mensajes de cola, reduciendo errores de parseo en integraciones.
- Preprocesado en pipelines de datos: uso como paso de normalizacion que convierte texto no estructurado en registros JSON antes de indexar en un almacen documental o un data lake.
- Function calling en asistentes ligeros: al devolver JSON ajustado a esquema, puede actuar como capa de seleccion de funciones en un agente pequeno que se ejecute en CPU o GPU de gama baja.
- Prototipado rapido de structured output: sirve como banco de pruebas para evaluar tecnicas de SFT con AlignTune y CuratorKit antes de escalar a modelos mayores.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo tiny, es adecuado para demos, notebooks y entornos edge donde no cabe un modelo grande.
- Generacion de configuraciones y manifiestos: produccion de ficheros JSON de configuracion (por ejemplo, despliegues o esquemas de validacion) a partir de descripciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo tiny, la huella es reducida y en la practica la determina el modelo base, no el adaptador (0,1 GB en disco).
- GPU recomendadas: no declaradas. Por el tamano del modelo base, es plausible su ejecucion en GPUs consumer, pero no se confirma en la informacion proporcionada.
- Compatibilidad con GPU consumer: no confirmada oficialmente; el uso de QLoRA en entrenamiento sugiere que el modelo base cabe en memoria de una GPU de gama media, aunque no se aportan cifras.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, requiere cargarse junto al modelo base mediante la libreria `peft` (y `transformers`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sujalgawas/aya-json-sft | no disponible (adaptador sobre tiny-aya-global) | no disponible | SFT para JSON-schema sobre modelo tiny | Apache 2.0 | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-global | no disponible en la informacion | no disponible | Modelo base multilingue tiny de la familia Aya | no disponible en la informacion | Hugging Face |
| Alternativas genericas de structured output (p. ej. adaptadores JSON sobre modelos pequenos) | no disponible | no disponible | SFT para JSON | variable | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Model card extremadamente escueta: no se documentan datos de entrenamiento, hiperparametros del LoRA, cobertura de idiomas ni evaluacion, lo que impide validar su calidad de forma objetiva.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que el adaptador mejore al modelo base en structured output.
- Riesgo de alucinacion y de JSON invalido: al ser un modelo tiny, es probable que falle en esquemas complejos o anidados; requiere validacion posterior con un parser de JSON-schema.
- Sesgos conocidos: no documentados; al heredar el modelo base, puede reproducir sesgos de este.
- Limitaciones de contexto e idioma: no declaradas; el contexto efectivo depende del modelo base y no se especifica.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar la licencia del modelo base `CohereLabs/tiny-aya-global` antes de desplegar en produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en la comunidad.
- No apto como sustituto de un modelo mayor en tareas de razonamiento complejo; su valor esta acotado a la generacion de JSON conforme a esquema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sujalgawas/aya-json-sft
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Dataset de entrenamiento: https://huggingface.co/datasets/sujalgawas/aya-json-sft-dataset
- Libreria AlignTune: https://github.com/Lexsi-Labs/aligntune
- CuratorKit: no disponible (no se ha encontrado enlace en la informacion proporcionada)
