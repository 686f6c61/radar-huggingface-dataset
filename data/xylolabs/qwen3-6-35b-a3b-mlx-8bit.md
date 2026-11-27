# Xylolabs/Qwen3.6-35B-A3B-MLX-8bit

## Resumen

Xylolabs/Qwen3.6-35B-A3B-MLX-8bit es una conversion al formato MLX del modelo Qwen/Qwen3.6-35B-A3B, publicada por Xylolabs. Se trata de una cuantizacion afin de 8 bits (group size 64, escalas y sesgos en float16) pensada para ejecutar el modelo con `mlx-lm` sobre hardware Apple Silicon. La conversion es solo de texto: se han eliminado la torre de vision y la capa MTP (multi-token prediction) del modelo original.

El modelo subyacente es un MoE (mixture of experts) de la familia Qwen3.6 con 34.660.608.768 parametros totales y aproximadamente 3.000 millones de parametros activos por token (segun la nomenclatura A3B). Resuelve el problema de desplegar un modelo de ~35B en equipos con memoria unificada de 48-64 GB manteniendo una fidelidad alta respecto al original en BF16: la divergencia KL media frente a BF16 es de 0,004860 en WikiText-2 y el top-1 agreement es del 97,40 %.

Su relevancia es practica: ofrece una ruta reproducible para inferencia local en Mac con contexto de hasta 256K tokens (segun la tabla de hardware del autor), con licencia Apache 2.0 y pesos en safetensors. El repositorio ocupa 36,8 GB y la cuantizacion 8-bit pesa 36,83 GB, por lo que requiere equipos con memoria unificada holgada; para configuraciones de 32-36 GB el autor recomienda la variante de 4 bits (20,72 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (qwen3_5_moe), conversion MLX solo texto |
| Parametros totales | 34.660.608.768 |
| Parametros activos | no disponible (nomenclatura A3B sugiere ~3B activos) |
| Longitud de contexto | hasta 256K segun tabla de hardware del autor; 203K en configuracion de 32 GB |
| Tipos de cuantizacion | 8 bits afin, group size 64, escalas y sesgos en float16; existe variante 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx-lm` 0.32.2 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Qwen3.6. La conversion de Xylolabs aplica cuantizacion afin de 8 bits a todas las capas lineales, al token embedding y a la LM head, con group size 64 y escalas y sesgos en float16; las capas de normalizacion y el resto de tensores no cuantizados se mantienen en float16, salvo `A_log`, que queda en bfloat16. Se han eliminado la torre de vision y la capa MTP, de modo que el resultado es un modelo estrictamente de texto.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni las fases de RLHF/DPO del modelo original en la informacion proporcionada. La model card solo documenta el proceso de conversion y cuantizacion, no el entrenamiento. El modelo base conserva el modo de razonamiento (thinking) activado por defecto, que puede desactivarse mediante `--chat-template-config '{"enable_thinking": false}'`.

## Capacidades

- Generacion de texto conversacional y de proposito general en modo texto.
- Modo de razonamiento (thinking) activado por defecto; desactivable por configuracion de plantilla de chat.
- Razonamiento multi-paso y respuesta directa segun el modo de pensamiento seleccionado.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes: no documentado en la informacion disponible.
- Vision: no soportada (la torre de vision se ha eliminado en esta conversion).
- Audio: no soportado.

## Casos de uso

- Inferencia local en Mac Studio: ejecutar un MoE de ~35B con `mlx-lm` en equipos de 48-64 GB de memoria unificada, usando la variante 8-bit para maxima fidelidad o la 4-bit para equipos de 32-36 GB.
- Asistente de desarrollo en local: generar y revisar codigo en un entorno sin conexion, aprovechando la ventana de contexto de hasta 256K para cargar repositorios o ficheros largos.
- Procesamiento de documentos extensos: resumir o extraer informacion de contratos, informes o transcripciones que superen los 100K tokens, gracias al contexto largo documentado.
- Prototipado de aplicaciones conversacionales: usar `mlx_lm.chat` para validar plantillas de prompt y flujos multi-turno antes de desplegar en infraestructura mayor.
- Investigacion sobre cuantizacion: comparar la fidelidad 8-bit frente a BF16 con las metricas KL y top-1 publicadas por el autor en WikiText-2, chat y texto reservado.
- Evaluacion de modelos MoE en Apple Silicon: medir latencia y throughput de un MoE de ~35B con ~3B activos en hardware consumer de gama alta.
- Generacion de texto offline con requisitos de privacidad: al ejecutarse en local, los datos no salen del equipo, adecuado para entornos con datos sensibles.

## Benchmarks y rendimiento

Metricas de fidelidad de la cuantizacion frente a BF16 publicadas por el autor (KL y top-1 sobre WikiText-2, chat y texto reservado, con 40/20/20 fragmentos de 512 tokens):

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Chequeo de 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 36,83 GB | 0,004860 | 97,40 % | 0,006771 | 97,57 % | 0,003843 | 96,94 % | 6/7 (BF16: 7/7) |
| MLX 4-bit | 20,72 GB | 0,021425 | 94,10 % | 0,036294 | 94,00 % | 0,021780 | 92,63 % | 7/7 (BF16: 7/7) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria necesaria para la variante 8-bit: 36,83 GB de pesos; el autor la situa en equipos con 64 GB o mas de memoria unificada.
- Mac Studio M5 Max con GPU de 40 nucleos y 64 GB: 8-bit con contexto de 256K.
- Mac Studio M5 Ultra con 96, 256 o 512 GB: 8-bit con contexto de 256K.
- Mac Studio M5 Max con GPU de 32 nucleos y 36 GB: el autor recomienda la variante 4-bit (20,72 GB) con contexto de 203K.
- Mac Studio M5 Max con GPU de 40 nucleos y 48 GB: variante 4-bit con contexto de 256K.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable directamente; esta conversion es especifica de MLX y Apple Silicon.
- Despliegue: `mlx-lm` version 0.32.2 mediante `mlx_lm.generate` y `mlx_lm.chat`. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para esta conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-35B-A3B-MLX-8bit | 34,66B totales (MoE) | hasta 256K | MLX, Apple Silicon | Apache 2.0 | Solo texto, 8-bit, 36,83 GB |
| Xylolabs/Qwen3.6-35B-A3B-MLX-4bit | 34,66B totales (MoE) | hasta 256K | MLX, Apple Silicon | Apache 2.0 | Solo texto, 4-bit, 20,72 GB |
| Qwen/Qwen3.6-35B-A3B | 34,66B totales (MoE) | no disponible | BF16, GPU | Apache 2.0 | Modelo base, incluye vision y MTP |

No se dispone de datos de rendimiento en tareas para comparar con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de capacidades de vision: la torre de vision se ha eliminado en esta conversion, por lo que no procesa imagenes.
- Sin MTP: la capa de multi-token prediction no esta incluida, lo que puede afectar al throughput de decodificacion especulativa respecto al original.
- Fidelidad imperfecta: el chequeo de 7 preguntas da 6/7 frente a 7/7 en BF16; el top-1 agreement es del 96,94-97,57 %, no del 100 %.
- Requisito de memoria elevado: 36,83 GB de pesos exigen al menos 64 GB de memoria unificada en la practica; en equipos de 32-36 GB hay que usar la variante 4-bit.
- Dependencia de version: requiere `mlx-lm==0.32.2`; otras versiones pueden no cargar los pesos correctamente.
- Solo Apple Silicon: no es desplegable en GPU NVIDIA ni en CPU x86 mediante las herramientas documentadas.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano u otros idiomas sin evaluacion propia.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican las limitaciones del modelo base.
- Uso comercial: permitido por Apache 2.0, pero deben conservarse los avisos de licencia y el fichero NOTICE de la conversion.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, y publicado el 2026-11-27; no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante 4-bit: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-MLX-4bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
