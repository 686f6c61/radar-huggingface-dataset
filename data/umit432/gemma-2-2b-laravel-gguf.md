# Umit432/gemma-2-2b-laravel-GGUF

## Resumen

`Umit432/gemma-2-2b-laravel-GGUF` es un ajuste fino (fine-tuning) del modelo Gemma 2 de 2 mil millones de parametros de Google, especializado presumiblemente en el framework PHP Laravel segun indica su nombre. El autor, Umit432, ha publicado unicamente la version cuantizada en formato GGUF, generada con la herramienta Unsloth, lo que la hace directamente consumible por llama.cpp y Ollama sin necesidad de conversion adicional.

El modelo parte de la arquitectura transformer decoder-only de Gemma 2 con 2.614.341.888 parametros totales y una ventana de contexto de 8.192 tokens (caracteristica de la familia Gemma 2 base). Al estar distribuido solo como GGUF Q4_K_M, el peso del repositorio es de 3,4 GB, lo que permite ejecutarlo en GPUs de consumo con 4-6 GB de VRAM.

Su relevancia es acotada: se trata de un modelo comunitario de nicho, con 195 descargas y sin datos publicados de evaluacion, orientado a asistentes de codigo especificos para Laravel en entornos con recursos limitados. No debe confundirse con un modelo oficial de Google ni con un modelo de proposito general de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Gemma 2 base; no confirmado en la model card) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Gemma 2 2B, un transformer decoder-only con atencion por ventanas alternas (alternating local-global attention) y normalizacion RMSNorm, disenado por Google DeepMind. Sobre esa base, el autor ha aplicado un fine-tuning supervisado cuyo dataset no se documenta en la model card; el nombre del repositorio sugiere un corpus centrado en el framework Laravel y su ecosistema (Eloquent, Blade, Artisan, etc.).

El proceso de ajuste se realizo con Unsloth, que segun el autor permitio un entrenamiento "2x mas rapido", y la conversion a GGUF se hizo con la misma herramienta. La model card menciona un ajuste del comportamiento del token BOS para compatibilidad con GGUF. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generacion de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Asistencia en codigo PHP y, presumiblemente, en el framework Laravel (generacion de controladores, migraciones, rutas, consultas Eloquent), aunque no hay evaluacion publica que lo confirme.
- Soporte de plantilla de chat mediante el flag `--jinja` de llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite desplegarlo tras una API compatible con OpenAI.
- Capacidades multilingues: no disponibles/documentadas; el modelo base Gemma 2 es multilingue, pero el fine-tuning puede haber reducido ese soporte.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni modo thinking.

## Casos de uso

- Asistente de codigo Laravel en local: un desarrollador puede cargar el GGUF Q4_K_M en llama.cpp u Ollama y obtener autocompletado y explicaciones de codigo PHP/Laravel sin conexion, en una GPU de 6 GB o incluso en CPU.
- Generacion de scaffolding de proyectos: el modelo puede producir esqueletos de controladores, modelos Eloquent y migraciones a partir de una descripcion en lenguaje natural, adecuado por su especializacion tematica y su bajo coste de inferencia.
- Revision de codigo en CI/CD: integrado via API compatible con OpenAI (tag `endpoints_compatible`), puede ejecutarse como paso de linting semantico que sugiera mejoras en pull requests de repositorios Laravel.
- Chatbot de documentacion interna: al estar ajustado sobre Laravel, puede responder preguntas sobre la API del framework en herramientas de soporte para equipos de desarrollo, con la ventaja de que el contexto de 8.192 tokens permite incluir fragmentos de codigo y documentacion.
- Prototipado rapido en estaciones de trabajo sin GPU dedicada: al ser un modelo de 2B en Q4_K_M (3,4 GB), corre en portatiles con CPU moderna y ofrece latencias aceptables para tareas interactivas no criticas.
- Educacion y formacion: puede usarse como tutor de Laravel en entornos docentes con hardware modesto, generando ejemplos y explicaciones paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de codigo PHP o Laravel.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5-4,5 GB para el unico archivo Q4_K_M (3,4 GB de pesos mas overhead de contexto KV).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2070, etc.). En GPUs de 8-24 GB (RTX 3070/4070/4090, A10, L4) sobra memoria y se puede aumentar el contexto.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas; tambien en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli -hf Umit432/gemma-2-2b-laravel-GGUF --jinja`), Ollama (la model card incluye un Modelfile), y servidores compatibles con OpenAI por el tag `endpoints_compatible`. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-2-2b-laravel-GGUF (este) | 2,6B | 8.192 (heredado) | Laravel/PHP | Gemma | GGUF Q4_K_M |
| google/gemma-2-2b-it | 2,6B | 8.192 | Generalista | Gemma | safetensors, GGUF |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 | Codigo general | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-Coder-3B | 3,1B | 32.768 | Codigo general | Apache 2.0 (con matices) | safetensors, GGUF |

Frente al Gemma 2 2B instruct original, este modelo anade especializacion tematica pero pierde la distribucion oficial y la trazabilidad del entrenamiento. Frente a los Qwen2.5-Coder de tamano similar, ofrece menor contexto (8K frente a 32K) y una licencia mas restrictiva (Gemma frente a Apache 2.0), aunque su enfoque en Laravel puede ser ventajoso en ese nicho concreto. No hay datos de rendimiento que permitan comparar calidad de codigo de forma objetiva.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni ejemplos de calidad publicados; el rendimiento real en tareas Laravel es desconocido.
- Dataset de fine-tuning no documentado: se desconoce la composicion, el volumen y la calidad de los datos de entrenamiento, lo que impide evaluar sesgos y cobertura.
- Riesgo de alucinacion: como todo modelo de 2B, tiende a inventar APIs, metodos o paquetes inexistentes, especialmente en codigo; requiere verificacion humana.
- Contexto limitado a 8.192 tokens (heredado, no confirmado), insuficiente para analizar repositorios grandes o documentacion extensa.
- Idiomas no documentados: el fine-tuning puede haber degradado el multilingueismo del modelo base; no se garantiza un buen comportamiento en castellano.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion segun los terminos de Google; revisar antes de desplegar en produccion.
- Unico archivo disponible (Q4_K_M): no hay versiones en FP16, Q5, Q8 ni safetensors, lo que limita el ajuste fino posterior y la evaluacion de precision.
- Modelo comunitario sin mantenimiento garantizado: 0 likes y 195 descargas indican escasa validacion por parte de la comunidad.
- El ajuste del token BOS para GGUF puede introducir diferencias de comportamiento respecto al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Umit432/gemma-2-2b-laravel-GGUF
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- Modelo base Gemma 2 (Google): https://huggingface.co/google/gemma-2-2b-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
