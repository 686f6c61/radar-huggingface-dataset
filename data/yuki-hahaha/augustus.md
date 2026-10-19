# yuki-hahaha/AUGUstus

## Resumen

AUGUstus es un modelo de visión-lenguaje-acción (VLA) orientado a conducción autónoma, desarrollado por Yuqi Ye y un equipo de investigadores (primer autor afiliado a la Universidad de Pekín, según el correo de contacto de la model card) y publicado en arXiv con el identificador 2610.16985. El modelo se presenta como una propuesta unificada de generación y comprensión: no solo produce la acción de conducción (trayectoria), sino que también puede generar razonamiento textual sobre la escena, algo que la model card contrapone explícitamente frente a otros paradigmas VLA de conducción autónoma.

Técnicamente se construye como un fine-tuning del backbone Qwen/Qwen3.5-2B, al que se añaden módulos específicos de planificación (módulos de acción y de tiempo) que no forman parte de un `AutoModel` estándar de Qwen: requieren un cargador propio. El repositorio distribuye tres checkpoints —SFT, GRPO etapa I y GRPO etapa II— con resultados declarados en NAVSIM v1 de 90,64, 94,03 y 94,64 PDMS respectivamente, lo que sitúa la etapa final en 94,64 PDMS con tres pasos de denoising ODE sobre 12.146 muestras de evaluación.

Su relevancia es fundamentalmente de investigación: aplica un pipeline de supervised fine-tuning seguido de dos etapas de GRPO sobre un backbone pequeño (2B), con un esquema de generación de acciones por denoising iterativo y un modo opcional de chain-of-thought (`GENERATE_COT`, `use_action_first`, `action_first_generate_cot`). La licencia es "other" y el manuscrito restringe el uso a investigación académica no comercial, lo que limita su adopción en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA multimodal sobre backbone transformer Qwen3.5-2B con modulos de planificacion (accion y tiempo) y generacion de acciones por denoising ODE; no disponible el detalle completo de la arquitectura |
| Parametros totales | No disponible (el backbone declarado es Qwen/Qwen3.5-2B, 2B parametros; el total incluyendo modulos de accion y tiempo no se especifica) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other`; el manuscrito indica "This work is solely for non-commercial academic research" y los terminos del backbone de terceros siguen aplicando |
| Formato de pesos | safetensors (`model.safetensors`) por checkpoint, acompanado de configuracion del backbone, tokenizer, processor, chat template, generation settings, `config.yaml` y `action_norm_stats.json` |

## Arquitectura y entrenamiento

AUGUstus parte de Qwen3.5-2B como backbone de vision-lenguaje y le anade un planificador especifico con modulos de accion y de tiempo. La generacion de la accion no es una simple regresion directa: se realiza mediante un proceso de denoising ODE con un numero configurable de pasos (`NUM_INFERENCE_STEPS`), donde los checkpoints SFT y GRPO etapa I usan por defecto 1 paso y la etapa II usa 3 pasos, que es la configuracion que alcanza 94,64 PDMS. Los pesos incluyen buffers de normalizacion de acciones que se restauran al cargar el checkpoint, con estadisticas en `action_norm_stats.json`.

El entrenamiento se organiza en tres fases publicadas: supervised fine-tuning (SFT), GRPO etapa I y GRPO etapa II. La model card no detalla el volumen de tokens, la composicion del dataset ni los detalles del reward de GRPO; unicamente indica que las recetas de entrenamiento SFT y GRPO se mantienen en el repositorio de codigo, distribuido por separado. La innovacion destacable es el esquema de "generacion y comprension unificadas": el modelo puede operar en modo de generacion directa de accion o en modo chain-of-thought (controlado por `GENERATE_COT` y las claves `use_action_first` / `action_first_generate_cot`), emitiendo razonamiento antes de la accion.

## Capacidades

- Generacion de acciones de conduccion (trayectorias) a partir de entrada multimodal de escena, con evaluacion estandarizada en NAVSIM v1.
- Comprension multimodal de la escena de conduccion, al heredar la torre de vision-lenguaje de Qwen3.5-2B.
- Generacion de razonamiento textual (chain-of-thought) antes de la accion, activable o desactivable en inferencia.
- Generacion de acciones por denoising iterativo con numero de pasos configurable (1 o 3 pasos en las configuraciones publicadas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible; el modo CoT es el unico comportamiento multi-paso documentado.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: planificacion end-to-end para conduccion autonoma, con checkpoints separados para evaluar el efecto de SFT frente a dos etapas de RL.

## Casos de uso

- Planificacion end-to-end en investigacion de conduccion autonoma: el modelo recibe la observacion de la escena y emite la trayectoria directamente, con la configuracion `RL/stage2_94.6` y 3 pasos de denoising como referencia de maxima calidad (94,64 PDMS).
- Reproduccion de resultados en NAVSIM v1: sirve para replicar la evaluacion sobre las 12.146 muestras del benchmark usando los scripts `scripts/test_checkpoint.sh` del repositorio de codigo y las caches de metricas indicadas.
- Estudio del efecto del RL sobre un backbone pequeno: los tres checkpoints (SFT 90,64; etapa I 94,03; etapa II 94,64) permiten aislar la contribucion de cada etapa de GRPO en un modelo de 2B, util para investigacion sobre post-entrenamiento.
- Analisis de razonamiento antes de la accion: activando `GENERATE_COT`, el modelo genera texto intermedio que puede auditarse para estudiar si el razonamiento mejora la planificacion o solo actua como justificacion posterior.
- Experimentos de eficiencia en inference: comparar 1 paso frente a 3 pasos de denoising ODE permite medir el compromiso entre coste computacional y PDMS en el mismo checkpoint.
- Base para ablaciones de arquitectura VLA: al estar el planificador separado del backbone, es un punto de partida para probar variantes de modulo de accion, normalizacion o estrategia de generacion en un entorno simulado.
- Formacion y docencia en robotica y conduccion autonoma: el modelo y su codigo permiten ilustrar un pipeline completo de SFT + GRPO sobre datos de conduccion, siempre en ambito academico.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son de NAVSIM v1 (PDMS, 12.146 muestras):

| Checkpoint | Etapa | Pasos de denoising ODE | NAVSIM v1 PDMS |
|---|---|---:|---:|
| `SFT/` | Supervised fine-tuning | 1 | 90,64 |
| `RL/stage1_94.0/` | GRPO etapa I | 1 | 94,03 |
| `RL/stage2_94.6/` | GRPO etapa II | 3 | 94,64 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de proposito general en la informacion disponible, y no se han facilitado resultados de modelos comparables en NAVSIM dentro de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 19,0 GB e incluye tres checkpoints, lo que situa cada checkpoint en el orden de 6-7 GB en su precision original; a ello hay que sumar el backbone Qwen3.5-2B y las caches de NAVSIM. Cifra no confirmada por el autor.
- GPU recomendadas: no disponible. El script de evaluacion se invoca con `GPUS=0`, lo que implica ejecucion en una sola GPU CUDA, pero no se especifica modelo ni memoria.
- Cabe en GPU de consumo: plausible por el tamano del backbone (2B) y el tamano por checkpoint, pero no esta verificado ni documentado por el autor.
- Opciones de despliegue: no se soporta carga directa con `AutoModel` de Qwen; es obligatorio el cargador propio de AUGUstus incluido en el repositorio de codigo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Dependencias de entorno: es necesario exportar `CHECKPOINT`, `QWEN35_2B_PATH`, `AUGUSTUS_DATA_ROOT` y `AUGUSTUS_EXP_ROOT` antes de cargar `env.sh`, ademas de preparar las caches de test y metricas de NAVSIM.
- Latencia y throughput: no disponibles. La unica palanca documentada es el numero de pasos de denoising (1 frente a 3), que afecta directamente al coste de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que no es posible una comparativa de rendimiento rigurosa. La comparacion disponible es interna, entre los propios checkpoints del modelo:

| Modelo / checkpoint | Parametros | Contexto | NAVSIM v1 PDMS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AUGUstus `SFT/` | 2B (backbone) + modulos no cuantificados | No disponible | 90,64 | other (no comercial) | Pesos en HuggingFace |
| AUGUstus `RL/stage1_94.0/` | 2B (backbone) + modulos no cuantificados | No disponible | 94,03 | other (no comercial) | Pesos en HuggingFace |
| AUGUstus `RL/stage2_94.6/` | 2B (backbone) + modulos no cuantificados | No disponible | 94,64 | other (no comercial) | Pesos en HuggingFace |
| Alternativas VLA de conduccion autonoma | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia restrictiva: el manuscrito indica que el trabajo es exclusivamente para investigacion academica no comercial; el uso en producto o servicio comercial no esta permitido segun esos terminos. La licencia del codigo es independiente de la de los pesos.
- Terminos del backbone: Qwen3.5-2B mantiene sus propias condiciones de uso, que se aplican de forma adicional.
- Solo ingles: el modelo declara unicamente el idioma `en`, sin soporte multilingue documentado.
- Riesgo de alucinacion: en modo chain-of-thought el modelo genera razonamiento textual que puede no corresponder con la evidencia visual; no se han publicado evaluaciones de fidelidad de ese razonamiento.
- Validacion limitada a simulacion: todos los resultados son sobre NAVSIM v1; no hay datos de validacion en vehiculo real ni de transferencia sim-to-real en la informacion disponible.
- Carga no estandar: no funciona como `AutoModel` de Qwen; requiere el cargador propietario y un `config.yaml` con las claves `use_action_first` y `action_first_generate_cot`. Una carga incorrecta no reconstruye el planificador.
- Dependencia de datos externos: la evaluacion exige caches de NAVSIM y rutas de datos configuradas manualmente; no es un modelo ejecutable de forma aislada.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones cuantizadas, lo que limita el despliegue en entornos con poca memoria.
- Sesgos: no se han publicado analisis de sesgos ni de comportamiento en escenarios de riesgo (condiciones adversas, peatones, escenarios de borde).
- Madurez: repositorio con 0 descargas y 12 likes en el momento de la consulta, creado en octubre de 2026; no hay senales de adopcion ni de mantenimiento a largo plazo.
- Ausencia de informacion sobre contexto, parametros totales y regimen de entrenamiento: cualquier estimacion al respecto debe tratarse como no verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuki-hahaha/AUGUstus
- Paper (arXiv 2610.16985): https://arxiv.org/abs/2610.16985
- Paper en PDF: https://arxiv.org/pdf/2610.16985
- Pagina del proyecto: https://augustus-ad.github.io/
- Repositorio de codigo: la model card indica que el codigo fuente se distribuye en un repositorio de GitHub separado, pero no se proporciona la URL en la informacion disponible.
- Contacto del primer autor: yeyuqi0303@stu.pku.edu.cn
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (software de contabilidad, restaurantes y un catalogo de pesca bajo el nombre "Yuki"), por lo que no se incluyen como enlaces relevantes.
