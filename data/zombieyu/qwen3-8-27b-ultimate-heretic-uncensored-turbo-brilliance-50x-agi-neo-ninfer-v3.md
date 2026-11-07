# ZombieYU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NINFER-V3

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una conversión de formato del modelo `DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF`. El autor, ZombieYU, ha tomado el fichero cuantizado `Q4_K_M` en GGUF del modelo original y lo ha convertido al formato propietario Ninfer v3 mediante la herramienta NInferEZ Converter, incluyendo soporte para modelo de visión y para MTP (multi-token prediction). El resultado es un artefacto de inferencia empaquetado, no una nueva versión de pesos con entrenamiento adicional.

El modelo subyacente es un fine-tune de Qwen 3.8 de 27B parámetros, presentado por DavidAU como una versión "Heretic" (sin censura) que fusiona Fable Fusion 711 con Qwen 3.8 27B y aplica el ajuste Turbo Brilliance 50X V2 en edición AGI. Según la model card del autor original, incorpora nueve modos de razonamiento (Xhigh reasoning modes) y está orientado a generación creativa, escritura de ficción, roleplay, razonamiento y código.

La relevancia de este repositorio es limitada y muy específica: sirve únicamente a usuarios del runtime Ninfer-all que quieran ejecutar el modelo en formato `.ninfer` con decodificación especulativa MTP y soporte de visión. No aporta mejoras de calidad, no publica benchmarks propios y no está pensado para despliegues estándar con vLLM, llama.cpp u Ollama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen 3.8); sin confirmar detalles adicionales |
| Parámetros totales | 27B (según el nombre del modelo base) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (configurado en la prueba del autor) |
| Tipos de cuantización | Q4_K_M en origen; el artefacto distribuido es formato Ninfer v3 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (Ninfer v3); el base está en GGUF |
| Tamaño del repo | 17,9 GB |
| Modelo base | DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF |
| Herramienta de conversión | NInferEZ Converter |
| Runtime de inferencia | Ninfer-all (binario `ninfer-serve.exe`) |

## Arquitectura y entrenamiento

El repositorio no documenta ningún entrenamiento propio: es una conversión de formato. La arquitectura corresponde a la del modelo base, un transformer denso de 27B parámetros derivado de Qwen 3.8 y sometido a un proceso de fine-tuning en varias etapas por DavidAU (fusión con Fable Fusion 711, ajuste "Heretic" para eliminar censura y ajuste Turbo Brilliance 50X V2 en edición AGI). La model card original menciona nueve modos de razonamiento y un ajuste multi-etapa orientado a pensamiento, código y escritura creativa, pero no se detallan volúmenes de tokens, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica de este repositorio concreto es el empaquetado en Ninfer v3, que habilita decodificación especulativa mediante MTP con tres tokens de borrador (`--spec mtp --draft-tokens 3`), gestión de KV cache con tipo `rk4v4-e8`, capacidad KV configurable, prefilling por chunks de 4096 tokens con cuBLAS y residencia del modelo de visión en modo overlay. Son características del runtime, no del modelo.

## Capacidades

- Generación de texto y razonamiento en varios modos (el base declara nueve modos de razonamiento, incluido Xhigh).
- Generación de código y tareas de programación, según la descripción del modelo base.
- Escritura creativa: ficción, narrativa de todos los géneros y roleplay.
- Capacidad de visión, habilitada por el flag `--vision` del runtime (modelo de visión incluido en la conversión).
- Decodificación especulativa MTP para acelerar la generación.
- Soporte de contexto largo: hasta 262.144 tokens en la configuración probada.
- Sin censura declarada ("Heretic"/uncensored): el modelo base ha sido ajustado para reducir rechazos.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Idiomas: no disponible.

## Casos de uso

- Escritura creativa y narrativa larga: el contexto de 262.144 tokens permite mantener arcos argumentales extensos, biblias de personajes y continuidad estilística en novelas o guiones sin truncar el material de referencia.
- Roleplay y personajes persistentes: el modelo base está ajustado explícitamente para roleplay, y la ventana larga permite conservar el historial completo de una sesión sin resúmenes intermedios.
- Generación de ficción sin filtros editoriales: útil para autores que necesitan explorar temáticas que los modelos alineados rechazan; requiere revisión humana por la ausencia de salvaguardas.
- Procesamiento de documentos extensos con componente visual: el soporte de visión más el contexto largo permite analizar PDFs escaneados o capturas junto con texto de referencia en una sola pasada.
- Prototipado local en estaciones de trabajo con una sola GPU: la configuración probada (RTX 3090, Q4_K_M) demuestra que el modelo cabe en 24 GB de VRAM y alcanza unas 90 tokens por segundo con decodificación especulativa.
- Evaluación de runtimes de inferencia alternativos: sirve como banco de pruebas para comparar Ninfer-all frente a llama.cpp o vLLM en términos de latencia y throughput con el mismo modelo base.
- Experimentación en investigación sobre modelos sin censura: permite estudiar el comportamiento de modelos "Heretic" en tareas de razonamiento y generación abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es empírico y del propio autor de la conversión: aproximadamente 90 tokens por segundo en una RTX 3090 con el modelo limitado a 250 W, contexto completo de 262.144 tokens y decodificación especulativa MTP con 3 tokens de borrador.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M de un modelo de 27B ocupa del orden de 16-17 GB; el repositorio completo pesa 17,9 GB. Con la KV cache a 262.144 tokens y tipo `rk4v4-e8` la huella adicional es significativa y depende de la configuración del runtime.
- GPU probada: NVIDIA RTX 3090 (24 GB, arquitectura Ampere, sm86), con el binario compilado para sm75-80-86-89-120a.
- Cabe en GPU de consumo de 24 GB (RTX 3090, RTX 4090) con cuantización Q4_K_M; en 16 GB no hay margen para contexto largo.
- El binario de Ninfer-all está compilado con CUDA 13.4 y requiere drivers recientes.
- Opciones de despliegue: exclusivamente Ninfer-all (`ninfer-serve.exe`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para el formato `.ninfer`; para esos runtimes habría que usar el GGUF original del modelo base.
- Throughput declarado: ~90 tps en RTX 3090 con MTP y límite de 250 W.
- Nota térmica del autor: la temperatura de la memoria de la GPU supera los 100 °C en una caja HP Z640 sin modificar; recomienda limitar la potencia con `nvidia-smi -pl 250` y monitorizar con HWiNFO.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Ninfer v3) | 27B | 262.144 | `.ninfer` | Apache 2.0 | Solo runtime Ninfer-all |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF | 27B | 262.144 (según base) | GGUF (varias cuantizaciones, incl. Q8_0) | Apache 2.0 | llama.cpp y derivados |
| Qwen 3.8 27B (modelo upstream) | 27B | no disponible | safetensors, GGUF | no disponible en la información | Amplia, ecosistema estándar |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de benchmarks que permitan contrastar calidad frente a alternativas de otros autores.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: no aporta mejoras de calidad respecto al GGUF original.
- El formato `.ninfer` es propietario y solo lo lee Ninfer-all; no hay soporte en vLLM, llama.cpp, Ollama ni TGI.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni informes independientes de calidad.
- El modelo base está declarado como "uncensored"/"Heretic": reduce los rechazos y puede generar contenido ofensivo, ilegal o dañino sin filtros; no es apto para producción orientada al público sin moderación externa.
- Riesgo de alucinación no evaluado: no hay benchmarks publicados que midan factualidad.
- Idiomas soportados no documentados; el rendimiento fuera del inglés y el chino es incierto.
- La licencia Apache 2.0 se hereda del modelo base, pero el cumplimiento de las condiciones del modelo upstream de Qwen debe verificarse por separado.
- El rendimiento de ~90 tps depende de una configuración muy concreta (RTX 3090, MTP, 250 W, runtime específico); no es extrapolable.
- Advertencia térmica del autor: riesgo de temperaturas de memoria superiores a 100 °C en carcasas mal ventiladas.
- El nombre del modelo acumula sufijos de marketing ("50x", "AGI NEO", "Turbo Brilliance") sin respaldo técnico verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ZombieYU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NINFER-V3
- Modelo base en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Fichero Q8_0 del modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF/blob/main/Qwen3.8-27B-Ultimate-Heretic-Uncn-Turbo-Brilli-50x-AGI-NEO-MTP-Q8_0.gguf
- Runtime Ninfer-all: https://github.com/iamwavecut/ninfer-all
