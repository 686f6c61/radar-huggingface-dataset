# TMaxxx/qwen35-9b-dppo-swe-smith-v1.1

## Resumen

TMaxxx/qwen35-9b-dppo-swe-smith-v1.1 es un ajuste fino de Qwen/Qwen3.5-9B orientado a tareas de agente de terminal (terminal agent), es decir, modelos que operan una shell de Linux mediante comandos para resolver tareas de ingenieria de software. Lo desarrolla el grupo TMax (Hamish Ivison y colaboradores), y se entrena con DPPO (una variante de aprendizaje por refuerzo con optimizacion de politica directa) sobre el conjunto de tareas SWE-Smith, un corpus sintetico de problemas de reparacion de software generados a partir de repositorios reales.

El modelo tiene 8.953.803.264 parametros (~8,95 mil millones) en un transformer causal de solo texto, con una longitud de contexto operativa de 65.536 tokens segun la configuracion de servicio recomendada por el autor. Su relevancia radica en que demuestra que un modelo de menos de 10B parametros, entrenado con RL sobre trayectorias de terminal, puede alcanzar un 27,27 % en Terminal-Bench 2.1 y un 60,21 % en TB-Lite, lo que lo situa como una alternativa ligera y desplegable en una sola GPU para automatizacion de tareas de ingenieria.

La version v1.1 corrige el arnes de evaluacion respecto a la v1.0 (Vanillux0.2.3 con Sandfleet a traves de Harbor) y publica checkpoints intermedios en las ramas step-0100, step-0200 y step-0300. La rama principal corresponde al paso 200, seleccionado por su puntuacion en TB-Lite. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de solo texto (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (configuracion de servicio recomendada con `--max-model-len 65536`) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en el formato original) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer causal de solo texto con atencion estandar y sin componentes multimodales (la model card indica explicitamente que los checkpoints Qwen3.5/3.6 contienen el modelo de lenguaje causal de solo texto). Sobre esa base se aplica un ajuste fino con DPPO (Direct Preference Policy Optimization), un metodo de aprendizaje por refuerzo que optimiza directamente la politica sobre recompensas de tarea en lugar de depender de un modelo de recompensa separado. El conjunto de entrenamiento es TMaxxx/open-instruct-swe-smith, derivado de SWE-Smith, que genera tareas de reparacion de software a partir de repositorios reales mediante mutaciones controladas del codigo.

El entrenamiento se centra en trayectorias de terminal: el modelo aprende a emitir comandos de shell, interpretar su salida y encadenar pasos hasta resolver la tarea. Se publican tres checkpoints (pasos 100, 200 y 300), y la seleccion del checkpoint final se hizo con TB-Lite, no con Terminal-Bench 2.1. La evaluacion v1.1 usa el arnes fijo Vanillux0.2.3 con Sandfleet a traves de Harbor, con tres ensayos por tarea sobre 96 tareas de TB-Lite. El repositorio incluye `release_manifest.json` con las revisiones fuente inmutables y los resultados por checkpoint, y `campaign_provenance.json` donde el autor lo aporta. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de SFT o DPO previas al RL.

## Capacidades

- Generacion de comandos de shell y operacion de terminal Linux: el modelo esta especializado en emitir comandos, leer su salida y continuar la tarea de forma iterativa.
- Resolucion de tareas de ingenieria de software: reparacion de bugs, modificacion de repositorios y ejecucion de pruebas dentro de un entorno de terminal.
- Tool calling / function calling: soportado mediante el parser de herramientas XML de Qwen (`--tool-call-parser qwen3_xml` en vLLM).
- Razonamiento multi-paso y comportamiento de agente: entrenado con RL sobre trayectorias completas, no solo sobre respuestas aisladas.
- Generacion de texto y codigo en ingles: capacidad heredada del modelo base Qwen3.5-9B.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Modo thinking, vision o audio: no disponible; el checkpoint es de solo texto y no se documentan modos especiales.

## Casos de uso

- Automatizacion de reparacion de bugs en CI/CD: el modelo puede recibir un fallo de test y ejecutar comandos en un contenedor para reproducirlo, localizar el archivo afectado y aplicar un parche, integrándose en un pipeline que valide el resultado con la suite de tests existente.
- Agente de terminal para tareas de mantenimiento de repositorios: tareas como actualizar dependencias, regenerar lockfiles o corregir errores de lint se pueden delegar a un agente que opera la shell y verifica cada paso con la salida de los comandos.
- Asistente de operaciones en entornos Linux: diagnostico de fallos en servidores mediante comandos de inspeccion (logs, procesos, permisos), adecuado por su entrenamiento especifico en terminal y su contexto de 65.536 tokens para conservar el historial de la sesion.
- Generacion de scripts de automatizacion: a partir de una descripcion en lenguaje natural, el modelo produce scripts de shell o Python y los prueba ejecutandolos en un entorno aislado antes de entregarlos.
- Evaluacion y benchmarking de agentes: al publicar checkpoints intermedios y un manifiesto de evaluacion reproducible, sirve como referencia para comparar recetas de RL sobre tareas de terminal en modelos de menos de 10B.
- Prototipado de agentes de codigo en una sola GPU: con 8,95B parametros y despliegue en vLLM con tensor-parallel-size 1, es viable montar un entorno de desarrollo interno sin infraestructura multi-GPU.
- Migracion y refactorizacion guiada por tests: el modelo puede ejecutar la suite de pruebas tras cada cambio y revertir comandos fallidos, lo que encaja en flujos de refactorizacion incremental.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---:|---|
| TB-Lite, paso 100 | 58,13 % ± 1,77 pp | 96 tareas, tres ensayos por tarea |
| TB-Lite, paso 200 (main) | 60,21 % ± 1,88 pp | Checkpoint seleccionado |
| TB-Lite, paso 300 | 55,70 % ± 1,89 pp | |
| Terminal-Bench 2.1 | 27,27 % ± 1,52 % | 88 tareas, tres ensayos por tarea; `configure-git-webserver` excluida |

Los resultados corresponden al arnes Vanillux0.2.3 con Sandfleet a traves de Harbor y al barrido de evaluacion actualizado el 5 de octubre de 2026. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 8,95B parametros, en FP16 se requieren aproximadamente 18 GB solo para pesos, mas cache KV para 65.536 tokens, por lo que se recomienda al menos 24-40 GB para contexto completo.
- GPU recomendadas: el autor indica un entorno Linux con GPU NVIDIA y CUDA compatible con PyTorch (probado con Python 3.12, PyTorch 2.13.0 y CUDA 13.0); con `--tensor-parallel-size 1` cabe en una sola GPU de gama alta.
- GPU de consumo: no confirmado en la informacion disponible; una RTX 4090 de 24 GB podria alojar los pesos en FP16 pero el contexto completo de 65.536 tokens exigiria reducir `--max-model-len` o cuantizar.
- Opciones de despliegue: vLLM 0.32.0 (comando de servicio documentado en la model card); no se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| TMaxxx/qwen35-9b-dppo-swe-smith-v1.1 | ~8,95B | 65.536 tokens | TB-Lite 60,21 %; Terminal-Bench 2.1 27,27 % | Apache 2.0 | Hugging Face, 44 descargas |
| Qwen/Qwen3.5-9B (base) | ~8,95B | no disponible en esta ficha | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas de la misma categoria (agentes de terminal de ~9B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de otros modelos comparables de agente de terminal para establecer una comparacion numerica fiable.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Especializacion estrecha: el entrenamiento con RL sobre SWE-Smith puede degradar capacidades generales de conversacion o conocimiento fuera del dominio de terminal e ingenieria de software.
- Riesgo de alucinacion: como modelo de lenguaje, puede emitir comandos plausibles pero incorrectos o destructivos; en un agente de terminal esto exige aislamiento (contenedores, sandbox) y supervision.
- Seleccion de checkpoint basada en TB-Lite: el autor advierte que la eleccion no se hizo con Terminal-Bench 2.1, por lo que el checkpoint principal puede no ser el optimo para esa evaluacion.
- Diferencias de arnes: los resultados v1.1 no son directamente comparables con los de v1.0; el propio autor recomienda usar las model cards originales para los resultados de la version anterior.
- Datos de entrenamiento derivados de repositorios publicos: posibles sesgos de codigo y estilos presentes en SWE-Smith y en el corpus original.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribucion y las licencias del modelo base Qwen3.5-9B y del dataset SWE-Smith.
- Contexto: la ventana de 65.536 tokens es la configuracion de servicio recomendada, no necesariamente el maximo nativo del modelo base; reducciones de `--max-model-len` afectan a tareas de agente con historiales largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TMaxxx/qwen35-9b-dppo-swe-smith-v1.1
- Checkpoint paso 100: https://huggingface.co/TMaxxx/qwen35-9b-dppo-swe-smith-v1.1/tree/step-0100
- Checkpoint paso 200: https://huggingface.co/TMaxxx/qwen35-9b-dppo-swe-smith-v1.1/tree/step-0200
- Checkpoint paso 300: https://huggingface.co/TMaxxx/qwen35-9b-dppo-swe-smith-v1.1/tree/step-0300
- Coleccion TMax v1.1: https://huggingface.co/collections/TMaxxx/tmax-v11
- Dataset SWE-Smith de TMax: https://huggingface.co/datasets/TMaxxx/open-instruct-swe-smith
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Codigo: https://github.com/hamishivi/tmax
- Paper TMax: https://arxiv.org/abs/2606.23321
- Paper SWE-Smith: https://arxiv.org/abs/2504.21798
- Blog: https://wai-org.com/blog/tmax/
- Guia de instalacion de vLLM: https://docs.vllm.ai/en/v0.32.0/getting_started/installation/gpu/
