# ZolMik2004/Lune-58M

## Resumen

Lune-58M es un modelo experimental de tipo asistente conversacional desarrollado por el usuario ZolMik2004, publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo pequeno que combina un modelo de lenguaje de 57,8M de parametros con un codificador visual opcional de 25,9M de parametros, sumando un total de 83,7M de parametros. Esta construido sobre la arquitectura `Qwen3_5ForConditionalGeneration` de la libreria transformers, sin codigo personalizado, e incorpora un diseno de atencion hibrida con Gated DeltaNet.

El modelo esta disenado para funcionar tanto como modelo de texto puro (cargando solo el modelo de lenguaje) como modelo vision-lenguaje (cargando tambien el codificador visual). Soporta ruso e ingles, con una longitud de contexto de 16.384 tokens y un corte de conocimiento que llega hasta septiembre de 2026 en ruso y marzo de 2026 en ingles. Ha sido afinado mediante SFT y aprendizaje por refuerzo a partir de Lune-58M-Base, y los pesos publicados son una mezcla de ambas etapas (0,7 de los pesos de RL y 0,3 de los de SFT).

Su relevancia radica en su tamano extremadamente reducido (menos de 100M de parametros) combinado con capacidades poco habituales en esa escala: razonamiento con tres niveles de esfuerzo, tool calling estilo Hermes, procesamiento de imagenes y video corto, y un rendimiento de decodificacion de 561 tokens por segundo en un Apple M2 Max con llama.cpp en F16. Es un modelo pensado para experimentacion y despliegue en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer hibrido con Gated DeltaNet y atencion hibrida) |
| Parametros totales | 83.695.688 (57,8M modelo de lenguaje + 25,9M codificador visual) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; compatible con llama.cpp, que soporta F16 y otras cuantizaciones) |
| Idiomas soportados | Ruso, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Lune-58M emplea la arquitectura `Qwen3_5ForConditionalGeneration` de transformers, que combina atencion hibrida con Gated DeltaNet. El modelo se compone de dos partes: un modelo de lenguaje de 57,8M de parametros y un codificador visual de 25,9M de parametros que se activa opcionalmente. Los pesos se distribuyen en bfloat16. El procesador admite imagenes y video (2 fotogramas por segundo, codificados en pares con una marca de tiempo antes de cada par).

El entrenamiento parte de Lune-58M-Base y se realiza en dos etapas: SFT y aprendizaje por refuerzo. Los pesos finales publicados son una interpolacion de ambas etapas (0,7 de RL y 0,3 de SFT). Los conjuntos de datos utilizados incluyen HuggingFaceTB/smoltalk, Vikhrmodels/GrandMaster-PRO-MAX, IlyaGusev/ru_turbo_saiga, HuggingFaceM4/FineVision y pixparse/cc3m-wds. El modelo fue entrenado con noticias tecnologicas hasta septiembre de 2026 (ruso) y marzo de 2026 (ingles). El tool calling se entreno con 64 esquemas de herramientas distintos, incluyendo las de un servidor MCP real, cubriendo seleccion de herramienta, llamadas encadenadas y paralelas, solicitud de argumentos faltantes, manejo de errores y respuesta directa cuando no se necesita herramienta.

## Capacidades

- Generacion de texto conversacional en ruso e ingles.
- Razonamiento con tres niveles de esfuerzo configurables: `none` (respuesta directa), `low` (razona solo en preguntas dificiles) y `high` (razona en casi todas las preguntas, valor por defecto).
- Tool calling estilo Hermes con esquemas de herramientas proporcionados por el usuario; soporta seleccion de herramienta, llamadas encadenadas y paralelas, solicitud de argumentos faltantes y manejo de errores de herramienta.
- Capacidades de agente y razonamiento multi-paso a traves del modo de razonamiento y el uso de herramientas.
- Vision-lenguaje cuando se carga el codificador visual: lectura de texto en imagenes (ruso/ingles), respuesta a preguntas sobre imagenes, documentos y graficos.
- Acepta videos cortos (lee los fotogramas, aunque pierde en gran medida su orden).
- Modo texto puro: si solo se carga el modelo de lenguaje, indica que no puede ver una imagen en lugar de inventarla.
- Capacidades multilingues limitadas a ruso e ingles.

## Casos de uso

- Asistente conversacional ligero en ruso e ingles: el modelo puede gestionar conversaciones multi-turno con hasta 16.384 tokens de contexto, adecuado para chatbots de bajo coste en dispositivos con recursos limitados.
- Extraccion de datos de documentos e imagenes: con el codificador visual, puede leer texto en recibos, documentos y graficos (ruso/ingles), util para digitalizacion de facturas o extraccion de campos estructurados.
- Automatizacion con tool calling: integrable en pipelines que requieran seleccion de herramientas, llamadas encadenadas o paralelas, y manejo de errores, gracias a su entrenamiento con 64 esquemas de herramientas incluyendo un servidor MCP real.
- Razonamiento adaptativo en produccion: el nivel de esfuerzo `none` permite respuestas rapidas y directas para consultas simples, mientras que `high` se reserva para tareas que requieren razonamiento paso a paso, optimizando latencia y coste.
- Procesamiento de video corto: analisis de fotogramas de videos de pocos segundos (por ejemplo, presentaciones de diapositivas) para responder preguntas sobre su contenido, aunque con limitaciones en el orden de los fotogramas.
- Despliegue en hardware de consumo: con 83,7M de parametros totales y 561 tok/s en un Apple M2 Max con llama.cpp en F16, es viable en portatiles y dispositivos de borde para tareas de asistencia local.
- Prototipado e investigacion: modelo pequeno y de codigo abierto (Apache 2.0) para experimentar con arquitecturas hibridas, atencion Gated DeltaNet y tecnicas de RLHF/DPO a escala reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento proporcionado es la velocidad de decodificacion: 561 tokens por segundo en un Apple M2 Max con llama.cpp en F16.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 83,7M de parametros en bfloat16, los pesos ocupan aproximadamente 0,17 GB; en F16, un tamano similar. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, e incluso en GPUs integradas.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en CPU.
- Opciones de despliegue: transformers (con `AutoModelForImageTextToText` o `AutoModelForCausalLM` para texto puro), llama.cpp (probado con F16 en Apple M2 Max), y potencialmente Ollama y vLLM si soportan la arquitectura Qwen3_5. Para video en transformers se requiere `torchcodec` y FFmpeg.
- Latencia y throughput estimados: 561 tok/s de decodificacion en Apple M2 Max con llama.cpp en F16; no se dispone de datos para otras plataformas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la informacion proporcionada. Como referencia de categoria, se trata de un modelo vision-lenguaje de menos de 100M de parametros, una escala poco comun; alternativas comparables en tamano serian modelos como SmolVLM-256M o TinyLLaVA, pero no se han proporcionado datos que permitan una comparacion rigurosa de parametros, contexto, rendimiento, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lune-58M | 83,7M (total) | 16.384 | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como experimental, por lo que su robustez en produccion no esta garantizada.
- Riesgo de alucinacion: como todo modelo de lenguaje pequeno, puede generar informacion incorrecta; el autor indica que en modo texto puro el modelo dice no poder ver imagenes en lugar de inventarlas, pero no se detallan otras salvaguardas.
- Limitaciones de video: aunque acepta videos cortos, pierde en gran medida el orden de los fotogramas, lo que limita su uso en tareas que dependan de la secuencia temporal.
- Limitaciones de idioma: solo soporta ruso e ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Sesgos conocidos: no se detallan sesgos especificos en la informacion disponible; los conjuntos de datos de entrenamiento (smoltalk, GrandMaster-PRO-MAX, ru_turbo_saiga, FineVision, cc3m-wds) pueden introducir sesgos propios de sus fuentes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de los conjuntos de datos de entrenamiento y de los pesos base.
- Caveat para produccion: el modelo mezcla pesos de RL y SFT (0,7/0,3), lo que puede producir comportamientos menos predecibles; ademas, el soporte de la arquitectura Qwen3_5 en runtimes de terceros (vLLM, Ollama) no esta confirmado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZolMik2004/Lune-58M
- Modelo base: https://huggingface.co/ZolMik2004/Lune-58M-Base
- Conjunto de datos smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Conjunto de datos GrandMaster-PRO-MAX: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
- Conjunto de datos ru_turbo_saiga: https://huggingface.co/datasets/IlyaGusev/ru_turbo_saiga
- Conjunto de datos FineVision: https://huggingface.co/datasets/HuggingFaceM4/FineVision
- Conjunto de datos cc3m-wds: https://huggingface.co/datasets/pixparse/cc3m-wds
