# tinyopsec/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF

## Resumen

MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo 0xSojalSec/MiniCPM5-2B-Abliterated-Uncensored-Safetensors, que a su vez deriva de openbmb/MiniCPM5-2B. Lo publica el usuario tinyopsec en Hugging Face bajo licencia Apache 2.0. El modelo base pertenece a la familia MiniCPM de OpenBMB y emplea una arquitectura tipo Llama con aproximadamente 2.500 millones de parametros (2.516.756.480 exactos segun los pesos en safetensors). La variante "abliterated" implica que se han eliminado o atenuado las capas de rechazo del modelo original mediante tecnicas de edicion de direcciones de activacion, de modo que el modelo responde sin las restricciones de seguridad habituales.

El interes practico de esta publicacion es la disponibilidad de hasta doce niveles de cuantizacion GGUF (desde F16 hasta Q2_K), lo que permite ejecutar un modelo de 2,5B parametros en hardware de consumo muy modesto. El archivo recomendado por el autor es Q4_K_M, que ocupa aproximadamente 1,5 GB en disco. Al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio, koboldcpp y otros runtimes que soportan este formato.

La relevancia actual radica en dos factores: por un lado, la familia MiniCPM se caracteriza por ofrecer una relacion calidad/tamano competitiva en el rango de los modelos pequenos; por otro, las variantes "uncensored" atraen a desarrolladores que necesitan modelos sin filtros para investigacion, generacion creativa o tareas donde los rechazos del modelo base resultan problematicos. No obstante, esta publicacion es una mera conversion a GGUF de un derivado, no un modelo entrenado desde cero, y no aporta datos propios de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (segun la model card) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 24,6 GB con todas las variantes); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo base como de arquitectura Llama con aproximadamente 2,5B parametros, derivado de openbmb/MiniCPM5-2B. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similar. La unica innovacion tecnica documentada es la "abliteracion": una tecnica de edicion de pesos que identifica y neutraliza las direcciones de activacion asociadas al comportamiento de rechazo, sin reentrenar el modelo. El resultado es una variante "uncensored" que conserva las capacidades del modelo original pero elimina las negativas a responder.

Esta publicacion concreta no ha realizado ningun entrenamiento: es una conversion de los pesos safetensors del modelo abliterado a formato GGUF mediante llama.cpp, con doce niveles de cuantizacion. Por tanto, no hay datos propios sobre el proceso de entrenamiento, la composicion del corpus ni las tecnicas de alineacion aplicadas al modelo original. Cualquier afirmacion sobre innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento no esta respaldada por la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y la model card lo etiqueta como conversacional.
- Respuestas sin filtros de seguridad: al ser una variante abliterated/uncensored, evita los rechazos tipicos del modelo base ante peticiones sensibles.
- Compatibilidad con runtimes GGUF: funciona en llama.cpp, Ollama, LM Studio y koboldcpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no especifica idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion creativa sin restricciones: el modelo puede producir narrativa, dialogos o contenido de ficcion sin los rechazos que aplicaria el modelo base; su tamano de 2,5B permite ejecutarlo en local para sesiones de escritura iterativas.
- Investigacion sobre alineacion y seguridad: util para estudiar el efecto de la abliteracion comparando respuestas con el modelo original, gracias a que comparte arquitectura y pesos derivados.
- Prototipado rapido en hardware modesto: con la cuantizacion Q4_K_M (~1,5 GB) se puede desplegar en portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que facilita pruebas de concepto.
- Filtrado y clasificacion de texto en local: al ser un modelo pequeno y ejecutable en CPU, sirve para tareas de etiquetado o moderacion en pipelines offline donde no se quiere enviar datos a la nube.
- Despliegue en entornos con recursos limitados: las variantes Q3 y Q2 permiten ejecucion en dispositivos con poca memoria, aunque con perdida de calidad.
- Generacion de texto en aplicaciones de escritorio: integrable en herramientas como LM Studio o koboldcpp para asistentes locales de escritura o chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): F16 ~5,0 GB; Q8_0 ~2,7 GB; Q6_K ~2,1 GB; Q5_K_M ~1,8 GB; Q4_K_M ~1,5 GB; Q3_K_M ~1,2 GB; Q2_K ~0,9 GB. Estas cifras son estimaciones a partir del tamano de los archivos indicados en la model card para F16 y de la proporcion tipica de bits por parametro.
- GPU recomendadas: cualquier GPU con al menos 2-6 GB de VRAM puede ejecutar las cuantizaciones bajas; una RTX 3060 (12 GB) o superior permite F16 con holgura. Para despliegue en servidor, A100 o H100 son sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas para cuantizaciones Q4/Q5; incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/MiniCPM5-2B-Abliterated-Uncensored (este) | ~2,5B | no disponible | Apache 2.0 | GGUF | Variante uncensored, 12 cuantizaciones |
| openbmb/MiniCPM5-2B (base) | ~2,5B | no disponible | no disponible en la informacion | safetensors | Modelo original con filtros de seguridad |
| 0xSojalSec/MiniCPM5-2B-Abliterated-Uncensored-Safetensors | ~2,5B | no disponible | no disponible en la informacion | safetensors | Version abliterada en precision completa, origen de esta conversion |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de otros autores de tamano similar.

## Limitaciones y advertencias

- Modelo uncensored: la abliteracion elimina los rechazos de seguridad, por lo que puede generar contenido danino, ofensivo o ilegal; el autor advierte de usarlo de forma responsable y conforme a la ley.
- Riesgo de alucinacion: no hay datos especificos, pero al ser un modelo de 2,5B es probable una tasa de alucinacion superior a la de modelos mayores.
- Idiomas: no se especifican los idiomas soportados; el rendimiento en castellano es incierto y no esta documentado.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar tareas de contexto largo con garantias.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base original (openbmb/MiniCPM5-2B) podria tener condiciones adicionales no reflejadas en esta publicacion; conviene verificar la licencia del modelo raiz antes de un uso en produccion.
- Calidad de las cuantizaciones bajas: Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Trazabilidad: es una conversion de terceros sin benchmarks ni evaluacion propia; no hay garantia de que la abliteracion no haya degradado capacidades del modelo original.
- Sin soporte documentado de tool calling ni agentes: no se debe asumir su disponibilidad en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF
- Modelo base en safetensors: https://huggingface.co/0xSojalSec/MiniCPM5-2B-Abliterated-Uncensored-Safetensors
- Modelo original: https://huggingface.co/openbmb/MiniCPM5-2B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
