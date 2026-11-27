# yonlyyone/Inkling-2-Mini-g13-q3-bf16

## Resumen

Inkling-2-Mini-g13-q3-bf16 es una conversión al formato MLX del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario yonlyyone el 22 de noviembre de 2026. Se trata de una build cuantizada a 4 bits (tag `4-bit` y `q3-bf16` en el nombre) generada con la herramienta `g13 convert` del proyecto g13-engine, orientada específicamente a la inferencia nativa en GPUs de Apple Silicon (familias M4 y M5) con soporte de BF16.

El modelo base es Inkling-2-Mini, desarrollado por Thinking Machines, del que no se dispone de documentación técnica en la información proporcionada. El repositorio contiene 26.388.641.280 parámetros según los safetensors publicados y ocupa 13,0 GB, lo que sugiere una cuantización agresiva respecto a un hipotético tamaño en BF16 completo. La build incluye el codificador de visión completo (`vision_tower.*`, 422 tensores), lo que indica que el modelo base es multimodal.

La relevancia de esta ficha radica en que es una de las pocas builds MLX disponibles de un modelo de 26B con visión, pensada para ejecutarse en Macs de 16-24 GB con desactivación automática de la torre de visión para ahorrar unos 620 MiB de VRAM. No obstante, la información pública es muy escasa: no hay pipeline declarado, no se listan idiomas soportados y no hay benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Inkling-2-Mini de Thinking Machines; la build usa `inkling2_loop` como tag de arquitectura) |
| Parámetros totales | 26.388.641.280 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (build `q3-bf16` en MLX, con pesos BF16 nativos en Apple Silicon) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Inkling-2-Mini más allá del tag `inkling2_loop`, que sugiere algún tipo de mecanismo recurrente o de bucle en la arquitectura. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La build incluye un codificador de visión (`vision_tower.*`) con 422 tensores, lo que confirma que el modelo base es multimodal, pero no se detalla qué encoder visual utiliza ni su resolución de entrada.

La innovación técnica destacable de esta build concreta es el proceso de conversión con `g13 convert`, que genera pesos MLX nativos en BF16 para GPUs de Apple Silicon M4/M5 y aplica una cuantización a 4 bits (etiquetada `q3-bf16`). El runtime `g13` desactiva la torre de visión por defecto en Macs de 16-24 GB para ahorrar aproximadamente 620 MiB de VRAM, y permite reactivarla con `g13 serve --vision on`.

## Capacidades

- Generación de texto y razonamiento: capacidades inferidas del modelo base, no documentadas explícitamente en la información disponible.
- Visión: la build incluye el codificador visual completo (`vision_tower.*`, 422 tensores), por lo que el modelo puede procesar imágenes si se activa la visión en el runtime `g13`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking: no disponible.
- Otras capacidades especiales (audio, decodificación especulativa): no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el caso de uso principal de esta build es ejecutar un modelo de 26B en un Mac M4/M5 con 16-24 GB de memoria unificada mediante `g13 serve`, aprovechando la cuantización 4-bit y los pesos BF16 nativos para minimizar la latencia en hardware de consumo.
- Análisis de imágenes en local: al incluir la torre de visión, permite describir imágenes, extraer texto de capturas o responder preguntas sobre diagramas sin enviar datos a la nube, activando `--vision on` en el runtime.
- Prototipado de asistentes multimodales en escritorio: desarrolladores que quieran validar un pipeline de visión-lenguaje antes de desplegarlo en servidores pueden usar esta build como banco de pruebas reproducible en su propio Mac.
- Procesamiento de documentos con privacidad: al ejecutarse íntegramente en local, es adecuado para flujos donde el contenido (facturas, informes, capturas) no puede salir del dispositivo.
- Evaluación comparativa de cuantizaciones: investigadores que quieran medir la degradación de calidad de una build 4-bit frente al modelo base en BF16 pueden usar este repo como referencia dentro del ecosistema MLX.
- Integración en aplicaciones macOS nativas: el formato MLX y el runtime `g13` permiten embeber el modelo en apps de escritorio para Mac sin depender de CUDA ni de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 13,0 GB en disco; en memoria unificada de Apple Silicon se necesita espacio para los pesos más el estado de inferencia. La model card menciona Macs de 16-24 GB como objetivo, con la visión desactivada por defecto para ahorrar unos 620 MiB.
- GPU recomendadas: Apple Silicon M4 y M5 (la build está generada específicamente para estas familias). No se mencionan GPUs NVIDIA ni AMD.
- ¿Cabe en GPU de consumo? Sí, en Macs con memoria unificada de 16 GB o más, según la model card. No se indica compatibilidad con GPUs de consumo NVIDIA.
- Opciones de despliegue: runtime `g13` (`g13 serve --model yonlyyone/Inkling-2-Mini-g13-q3-bf16`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base Inkling-2-Mini de Thinking Machines no tiene ficha técnica pública en esta información, y no se conocen alternativas MLX de tamaño y capacidades equivalentes con datos verificables.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-g13-q3-bf16 | 26,4B | no disponible | Apache 2.0 | safetensors MLX | Hugging Face |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información pública muy escasa: no hay model card detallada del modelo base, ni benchmarks, ni lista de idiomas, ni longitud de contexto documentada.
- Cuantización agresiva: la build es 4-bit (`q3-bf16`), lo que puede degradar la calidad respecto al modelo base en tareas de razonamiento o generación de código; no se han publicado evaluaciones de la pérdida de rendimiento.
- Visión desactivada por defecto en Macs de 16-24 GB: si se necesita entrada multimodal hay que lanzar `g13 serve --vision on`, con el coste de VRAM asociado (~620 MiB).
- Dependencia de un runtime específico: solo se documenta compatibilidad con `g13`; no hay soporte confirmado para vLLM, llama.cpp, Ollama o TGI.
- Riesgo de alucinación: no evaluado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (no disponible en esta información) por si impone condiciones adicionales.
- Repositorio con pocas descargas (221) y cero likes: menor validación comunitaria y menor probabilidad de que los problemas se hayan reportado y corregido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yonlyyone/Inkling-2-Mini-g13-q3-bf16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta de conversión g13: https://gitlab.com/karulab/g13-engine
