# Thox-ai/ThoxOS-Kernel-27B

## Resumen

ThoxOS-Kernel-27B es un ajuste fino de parámetros completos publicado por Thox-ai sobre el modelo comunitario JonathanColetti/Qwen3.8-27B-Uncensored. Está orientado a tareas de kernel y operación de sistemas: trabajo sobre el kernel de Linux, runbooks de servicios y shell, tareas de construcción y diagnóstico de ThoxOS, y operaciones de MeshStack en hosts de THOX. Además de su uso directo, actúa como modelo profesor para la familia más pequeña de modelos ThoxOS-Kernel.

El modelo se distribuye con pesos completos en safetensors y conversiones GGUF en Q8_0 y Q4_K_M, con licencia Apache 2.0 y acceso público sin gating. La model card declara que el ajuste, la evaluación y las conversiones fueron realizados por THOX, y que el build Q4_K_M está disponible en Ollama como `Thox-ai/thoxos-kernel-27b`. No se aportan resultados de benchmarks ni detalles sobre el volumen o la composición del dataset de ajuste.

Un punto a tener en cuenta al evaluar la ficha: la información de Hugging Face indica 3.054.832 parámetros en safetensors, un dato incoherente con el tamaño del repositorio (100,7 GB) y con los pesos declarados en la model card (un shard de ~49,8 GB y otro de ~4,9 GB), que corresponden a un modelo de escala 27B. Se refleja la discrepancia en las especificaciones en lugar de resolverla por inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8; familia `qwen3_5` según tags). Detalle de capas y atención: no disponible |
| Parámetros totales | 27B según la model card; el campo safetensors de Hugging Face indica 3.054.832 (dato incoherente con el tamaño del repo) |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors (BF16 presumible por tamaño), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards + `model-mtp.safetensors`), GGUF (Q8_0, Q4_K_M), `Modelfile` para Ollama |
| Modelo base | JonathanColetti/Qwen3.8-27B-Uncensored |
| Tamaño del repositorio | 100,7 GB |
| Descargas / likes | 1.897 / 0 |
| Fecha de creación / actualización | 2026-10-30 / 2026-11-05 |

## Arquitectura y entrenamiento

La model card describe un ajuste fino de parámetros completos sobre el build comunitario Qwen3.8-27B-Uncensored. No se especifican la arquitectura interna (número de capas, cabezas, tipo de atención), la longitud de contexto nativa ni la composición del dataset de ajuste. El repositorio incluye un fichero `model-mtp.safetensors` de ~849 MB, lo que sugiere la presencia de cabezas de predicción multi-token (MTP); la model card menciona una "disposición MTP" en el registro de finalización (`finishing/ThoxOS-Kernel-27B-finishing.json`), pero no detalla su función ni si está activa en inferencia.

El entrenamiento se orienta a dominios concretos: kernel de Linux, operaciones de sistema, runbooks de servicios y shell, construcción y diagnóstico de ThoxOS y operaciones de MeshStack. No se documentan tokens de entrenamiento, mezcla de datos, ni si hubo RLHF, DPO u otras fases de alineamiento posteriores al ajuste supervisado. La model card indica que el modelo pasó sus "gates" de evaluación bajo un alcance de puntuación de respuesta final (2026-11-01), mientras que el veredicto de finalización en bruto figura como HELD; no se publican las métricas asociadas a esa evaluación.

## Capacidades

- Generación de texto conversacional y asistencia técnica en inglés.
- Trabajo sobre kernel de Linux y operaciones de sistema (diagnóstico, configuración, análisis de fallos).
- Redacción y ejecución guiada de runbooks de servicios y comandos de shell.
- Tareas de construcción y diagnóstico específicas de ThoxOS.
- Operaciones de MeshStack en hosts de THOX.
- Ajuste sin censura heredado del modelo base (tag `uncensored`), orientado a reducir rechazos en consultas técnicas.
- Soporte de tool calling / function calling: no disponible (no se declara en la información proporcionada).
- Capacidades de agente multi-paso: no disponible como capacidad declarada explícita; el uso como "OS-agent" figura en los tags.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Visión, audio o modo thinking: no disponible.

## Casos de uso

- Asistencia en administración de sistemas Linux: el modelo puede analizar salidas de `dmesg`, `journalctl` o `systemctl` y proponer acciones correctivas, aprovechando su ajuste específico sobre operaciones de sistema.
- Generación y revisión de runbooks: redacción de procedimientos operativos paso a paso para servicios y tareas de mantenimiento, con comandos de shell listos para revisión humana.
- Diagnóstico de fallos en hosts: interpretación de trazas y logs del kernel para acotar causas probables antes de escalar a un ingeniero.
- Automatización de tareas de construcción de ThoxOS: asistencia en pipelines de build y verificación de artefactos dentro del ecosistema declarado por el autor.
- Operaciones de MeshStack: consultas y generación de comandos para gestión de hosts en la infraestructura de THOX.
- Destilación y generación de datos sintéticos: al ser el modelo profesor de la familia ThoxOS-Kernel, puede emplearse para producir pares instrucción-respuesta que entrenen los modelos pequeños de la familia.
- Despliegue local en estaciones de trabajo: con el build Q4_K_M (~16,5 GB) puede ejecutarse en hardware de consumo mediante Ollama o llama.cpp para tareas de soporte sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia un estado "GATE-PASSED" bajo un alcance de puntuación de respuesta final y un veredicto "HELD" para finalización en bruto, sin cifras asociadas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia por tamaño de fichero, el GGUF Q4_K_M ocupa ~16,5 GB y el Q8_0 ~28,6 GB; los safetensors suman ~54,7 GB en los dos shards principales.
- GPU recomendadas: no disponible (el autor no publica requisitos ni resultados de cualificación de dispositivos).
- GPU de consumo: el build Q4_K_M podría caber en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090/4090) si la arquitectura y el contexto lo permiten; no verificado por el autor.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxos-kernel-27b`), llama.cpp (`llama serve -hf Thox-ai/ThoxOS-Kernel-27B:Q4_K_M`), descarga directa de GGUF vía `hf download`, y API compatible con OpenAI expuesta por el servidor de llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ThoxOS-Kernel-27B | 27B (según model card) | no disponible | Apache 2.0 | Kernel Linux, sysadmin, ThoxOS | safetensors + GGUF, Ollama |
| JonathanColetti/Qwen3.8-27B-Uncensored (base) | 27B | no disponible | no disponible | Modelo comunitario sin censura | Hugging Face |
| Modelos de la familia Qwen de escala 27B | no disponible | no disponible | no disponible | Propósito general | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de ThoxOS-Kernel-27B con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; su rendimiento en castellano no está documentado.
- Contexto: la longitud de contexto no se especifica, lo que impide planificar cargas con ventanas largas sin verificación previa.
- Alucinación: no se publican evaluaciones de fidelidad; en un dominio operativo como sysadmin, un comando incorrecto puede tener consecuencias destructivas, por lo que toda salida debe revisarse antes de ejecutarse.
- Sesgos: no se documentan análisis de sesgo; el ajuste "uncensored" del modelo base implica menor filtrado de contenido, lo que traslada la responsabilidad de moderación al despliegue.
- Incoherencia de metadatos: el recuento de parámetros en safetensors (3.054.832) contradice el tamaño del repositorio y los pesos publicados; conviene verificar `config.json` antes de integrar el modelo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base es un build comunitario cuyas condiciones conviene revisar de forma independiente.
- Estado de evaluación: el veredicto de finalización en bruto figura como HELD; no hay métricas públicas que respalden el estado "GATE-PASSED".
- Sin cualificación de dispositivos: el autor no publica resultados de rendimiento por hardware, por lo que las estimaciones de VRAM y latencia deben medirse en el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxOS-Kernel-27B
- Modelo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Build en Ollama: `Thox-ai/thoxos-kernel-27b` (referenciado en la model card; URL no proporcionada)
- Paper, blog o demo adicionales: no disponible
