# unknown797/DaisyRose-27B-UD-Q4_K_XL-GGUF

## Resumen

DaisyRose-27B-UD-Q4_K_XL-GGUF es una cuantización dinámica en formato GGUF del modelo multimodal RadixArk/DaisyRose-27B, que a su vez deriva de Qwen/Qwen3.8-27B. La publica el usuario unknown797 en Hugging Face y su interés principal no radica en el modelo en sí, sino en el empaquetado: reproduce exactamente el layout de cuantización dinámica de 866 tensores de Unsloth (receta UD-Q4_K_XL, 5,17 bits por peso) y está orientada a la compatibilidad con los kernels HRX-Loom y Loom Fun para GPUs AMD Strix Halo (arquitectura gfx1151).

El modelo base tiene 27.320.697.856 parámetros (unos 27,3 mil millones) y pipeline image-text-to-text, es decir, acepta imagen y texto como entrada y genera texto. El repositorio ocupa 18,6 GB e incluye dos ficheros: los pesos principales cuantizados (17,66 GB) con cabeza especulativa MTP nativa preservada, y un proyector visión-lenguaje mmproj-F16 (0,93 GB) tomado de la cuantización de Unsloth de Qwen3.8-27B.

La relevancia es acotada pero concreta: permite ejecutar un modelo multimodal de 27B en hardware de consumo y en plataformas AMD Strix Halo con un runtime específico (Gufo/Loom), y también en llama.cpp o LM Studio estándar. La licencia declarada es Apache 2.0. No hay datos publicados de benchmarks ni de idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL (5,17 BPW, 866 tensores dinamicos); proyector mmproj en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (DaisyRose-27B-UD-Q4_K_XL.gguf + mmproj-F16.gguf) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (Qwen/Qwen3.8-27B) ni de la variante RadixArk/DaisyRose-27B: no se especifica si es un transformer denso, MoE o hibrido, ni el numero de capas, cabezas de atencion o dimension oculta. Lo que si se documenta es que el modelo incluye una cabeza especulativa MTP (multi-token prediction) nativa, preservada en la cuantizacion, lo que permite decodificacion especulativa para acelerar la generacion.

Respecto al entrenamiento, no hay datos en la informacion proporcionada sobre volumen de tokens, composicion del dataset, fases de RLHF/DPO ni proceso de alineamiento. La cuantizacion en si sigue la receta dinamica de Unsloth UD-Q4_K_XL, que asigna distintos niveles de bits por tensor segun su sensibilidad, manteniendo 866 tensores y un promedio de 5,17 bits por peso. El proyector multimodal mmproj-F16 se reutiliza directamente de la cuantizacion de Unsloth de Qwen3.8-27B, no se reentrena.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Entrada multimodal imagen-texto: procesa imagenes junto con texto mediante el proyector mmproj-F16 y responde en texto (pipeline image-text-to-text).
- Decodificacion especulativa mediante cabeza MTP nativa, orientada a reducir latencia en inferencia.
- Compatibilidad con endpoints estilo OpenAI a traves de `gufo serve` (tag `endpoints_compatible`).
- Ejecucion en llama.cpp y LM Studio con soporte de proyector multimodal via `--mmproj`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia multimodal local en hardware de consumo: con 17,66 GB de pesos en Q4_K_XL, el modelo cabe en GPUs con 24 GB de VRAM (RTX 3090/4090) y permite describir imagenes, responder preguntas sobre capturas o extraer informacion de documentos escaneados sin depender de la nube.
- Despliegue en AMD Strix Halo: es el caso de uso para el que se diseno explicitamente la cuantizacion, ya que los kernels HRX-Loom y Loom Fun para gfx1151 estan soportados por el runtime Gufo, lo que permite servir el modelo en equipos con APU Strix Halo y memoria unificada.
- Servicio compatible con API OpenAI: `gufo serve --served-model-name daisyrose-27b` expone un endpoint que aplicaciones existentes pueden consumir cambiando solo la URL base, util para prototipado rapido de asistentes con vision.
- Procesamiento de documentos con imagen: al aceptar image-text-to-text, se puede usar para transcribir formularios, tickets o facturas fotografiadas y devolver texto estructurado, ejecutandose en local para cumplir requisitos de privacidad.
- Aceleracion de generacion con decodificacion especulativa: la cabeza MTP preservada permite reducir la latencia por token en runtimes que la aprovechan, relevante en aplicaciones interactivas de chat con imagenes.
- Evaluacion y experimentacion con cuantizaciones dinamicas: al replicar el layout de 866 tensores de Unsloth, sirve como referencia para comparar calidad y velocidad entre el original y la cuantizacion en distintos backends (llama.cpp, LM Studio, Loom).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,6 GB sumando pesos (17,66 GB) y proyector (0,93 GB), mas overhead de contexto KV; en la practica requiere del orden de 20-24 GB de memoria para contexto moderado.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090, A100, H100; en el ambito AMD, APUs Strix Halo (gfx1151) con memoria unificada mediante HRX-Loom/Loom Fun.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas de VRAM; en GPUs de 16 GB no cabe completo en Q4_K_XL y requeriria offloading a RAM o una cuantizacion mas agresiva (no incluida en el repo).
- Opciones de despliegue: Gufo (`gufo serve`), llama.cpp (`llama-server` con `--mmproj`), LM Studio; otros runtimes GGUF no estan documentados en la informacion disponible.
- Parametros de muestreo sugeridos por el autor: `--temp 1.0 --top-p 0.95 --top-k 20`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| DaisyRose-27B-UD-Q4_K_XL-GGUF | 27,3 B | no disponible | Si (image-text-to-text) | Apache 2.0 | GGUF Q4_K_XL |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | Si (segun pipeline del derivado) | no disponible | safetensors |
| RadixArk/DaisyRose-27B (base) | 27,3 B | no disponible | Si | no disponible | no disponible |
| Qwen3.8-27B-GGUF de Unsloth | 27,3 B | no disponible | Si (incluye mmproj-F16) | no disponible | GGUF |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes y fue creado el 27 de noviembre de 2026; es una publicacion de un autor individual sin historial verificable, lo que reduce la confianza en la reproducibilidad.
- No se han publicado benchmarks ni evaluaciones de calidad de la cuantizacion frente al modelo original; la perdida de calidad respecto a BF16 no esta medida.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento en idiomas distintos del ingles; la ficha de idiomas no esta disponible.
- La licencia Apache 2.0 se declara en el repo, pero los modelos base (RadixArk/DaisyRose-27B y Qwen/Qwen3.8-27B) tienen sus propias condiciones; conviene verificar la licencia efectiva del modelo base antes de uso comercial.
- El modelo solo genera texto: la modalidad de salida es text-to-text aunque la entrada sea multimodal; no se documenta generacion de imagenes.
- El soporte de tool calling, agentes y contexto largo no esta confirmado en la informacion disponible; no debe asumirse en produccion sin validacion.
- La ruta optimizada (HRX-Loom/Loom Fun sobre Gufo) esta ligada a AMD Strix Halo (gfx1151); en otras GPUs AMD o en NVIDIA el rendimiento dependera de llama.cpp y no de esos kernels.
- El proyector mmproj-F16 procede de otra cuantizacion (Unsloth Qwen3.8-27B) y no se ha reentrenado para DaisyRose; puede haber desajustes menores en la alineacion vision-lenguaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unknown797/DaisyRose-27B-UD-Q4_K_XL-GGUF
- Modelo base RadixArk/DaisyRose-27B: https://huggingface.co/RadixArk/DaisyRose-27B
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones de Unsloth para Qwen3.8-27B (origen de la receta y del mmproj): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Runtime Gufo / HRX-Loom / Loom Fun: no disponible en la informacion proporcionada
