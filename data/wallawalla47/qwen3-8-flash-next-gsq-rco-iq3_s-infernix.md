# wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix es un artefacto de inferencia derivado de Qwen3.8-Flash-Next, un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado originalmente por el equipo Qwen (Alibaba). Este paquete concreto lo publica el usuario wallawalla47 y consiste en una cuantización IQ3_S del GGUF de ISTA-DASLab, empaquetada en el formato propietario `.infernix` para el motor C++/CUDA Infernix, diseñado para ejecutar el modelo en una única GPU consumer RTX 5090 de 32 GB.

La relevancia del artefacto no está en el modelo base sino en la técnica de despliegue: los 24.576 expertos enrutados (46,9 GiB) residen en RAM del host fijada (pinned), con una caché de VRAM para los expertos calientes, cómputo parcial en CPU de los fallos de caché y una tabla n-gram PLE leída desde NVMe en bloques aleatorios de 4 KiB. Esto permite servir un MoE de gran tamaño en hardware de gama alta de consumo, algo que con llama.cpp convencional requeriría más memoria o mayor degradación.

El modelo es multimodal (image-text-to-text), conversacional y soporta decodificación especulativa mediante un drafter MTP propio o el drafter DFlash2 de Inco AI. La licencia es la Qwen Community License 1.0, con componentes Apache 2.0 del GGUF original de ISTA-DASLab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 48 capas y 512 expertos enrutados por capa (top-10); incluye MTP drafter y vision |
| Parametros totales | no disponible (el repo ocupa 85,9 GB en cuantización IQ3_S) |
| Parametros activos | 10 de 512 expertos enrutados por capa (top-10) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (GSQ con asignación de bits por tensor de RCO); tabla n-gram PLE en IQ4_NL en este repo, con alternativas FP8, BF16, BF16 P12 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (componentes Apache 2.0 del GGUF de ISTA-DASLab) |
| Formato de pesos | `.infernix` (dos partes: 32.000.000.000 y 24.755.219.968 bytes) más volumen `.ngram` de 29.127.258.112 bytes |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 48 capas y 512 expertos enrutados por capa, de los cuales se activan los 10 mejores por token (top-10). Incorpora un cabezal MTP (Multi-Token Prediction) que actúa como drafter para decodificación especulativa y capacidades de visión, lo que lo sitúa en la categoría image-text-to-text. La cuantización aplicada es IQ3_S mediante GSQ con asignación de bits por tensor de RCO, partiendo del GGUF de ISTA-DASLab.

La innovación técnica del artefacto es el motor Infernix: mantiene todos los tensores GGUF bit a bit y los computa con activaciones BF16 en aritmética entera exacta, de modo que cada salida es la suma exacta de pesos GGUF por activaciones, redondeada una sola vez. Esto garantiza que el resultado tenga los mismos bits independientemente de si el experto se ejecuta en VRAM, PCIe o CPU, y a cualquier tamaño de batch. Como contraste, la model card señala que llama.cpp redondea las activaciones a 8 bits, lo que produce logits ligeramente distintos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Razonamiento multi-paso mediante decodificación especulativa con drafter MTP o DFlash2.
- Decodificación especulativa: el drafter DFlash2 (776 MB) decodifica entre un 8 % y un 11 % más rápido que el MTP propio con `--draft-tokens auto`, y hasta un 26 % en código con muestreo.
- Ejecución de MoE de gran tamaño en una sola RTX 5090 mediante offload de expertos a RAM del host y cómputo parcial en CPU.
- Gestión de la tabla n-gram PLE de 320.001.536 filas como volumen externo leído desde NVMe.
- Soporte de cuantizaciones alternativas de la tabla n-gram (FP8, BF16, BF16 P12, NVFP4, IQ4_NL) intercambiables entre modelos Qwen3.8-Flash-Next.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Despliegue de un MoE multimodal en una estación de trabajo con una RTX 5090: el reparto entre VRAM (expertos calientes), RAM fijada (24.576 expertos, 46,9 GiB) y CPU permite servir el modelo sin clúster multi-GPU, adecuado para laboratorios con hardware de consumo de gama alta.
- Investigación en decodificación especulativa: la integración con el drafter DFlash2 y el MTP propio permite medir ganancias de throughput (8-11 % general, 26 % en código muestreado) sobre un modelo real de 48 capas.
- Evaluación de cuantizaciones GSQ/RCO: al conservar los tensores GGUF bit a bit y computar en aritmética entera exacta, sirve para comparar fidelidad numérica frente a llama.cpp en experimentos de reproducibilidad.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text permite tareas de descripción, extracción y diálogo sobre imágenes en entornos con una sola GPU.
- Benchmarking de motores de inferencia: la paridad de bits entre VRAM, PCIe y CPU facilita comparaciones controladas de latencia y throughput entre backends.
- Pruebas de almacenamiento NVMe para tablas de embeddings: el volumen n-gram de 29 GB leído en bloques aleatorios de 4 KiB es un caso de estrés realista para evaluar IOPS y latencia de disco en pipelines de inferencia.
- Experimentación con licencia Qwen Community 1.0: útil para prototipos y trabajos de investigación que requieran un modelo multimodal con licencia comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas relativas de decodificación especulativa: el drafter DFlash2 es un 8-11 % más rápido que el MTP propio con `--draft-tokens auto`, y hasta un 26 % en código con muestreo.

## Requisitos de hardware

- VRAM: 32 GB en una RTX 5090; los expertos enrutados (46,9 GiB) residen en RAM del host fijada y una caché de VRAM mantiene los calientes.
- RAM del sistema: la model card menciona una máquina de 96 GB capaz de mantener en RAM la tabla n-gram IQ4_NL de 29 GB; sin ella, el volumen n-gram debe residir en NVMe.
- Almacenamiento: NVMe recomendado para el volumen `.ngram` (lectura en bloques aleatorios de 4 KiB); el repo completo ocupa 85,9 GB.
- GPU recomendadas: RTX 5090 (32 GB, arquitectura Blackwell) como objetivo declarado; no se documentan otras GPU compatibles.
- Cabe en GPU consumer: sí, en RTX 5090 con el esquema de offload descrito; no se garantiza en GPU con menos VRAM.
- Opciones de despliegue: motor Infernix (`infernix-serve`), con soporte de `--spec dflash2`, `--draft-model`, `--draft-tokens auto` y `--ngram-volume`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reportan las ganancias relativas del drafter DFlash2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix | MoE, 48 capas, 512 expertos (top-10) | no disponible | `.infernix` + `.ngram` | Qwen Community 1.0 | 1x RTX 5090 (32 GB) + RAM host |
| Qwen3.8-Flash-Next-GSQ-RCO-GGUF (ISTA-DASLab) | MoE, 48 capas, 512 expertos (top-10) | no disponible | GGUF (IQ3_S) | Apache 2.0 (según la card) | no disponible |
| Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix | MoE, 48 capas, 512 expertos (top-10) | no disponible | `.infernix` + `.ngram` FP8 | Qwen Community 1.0 | 1x RTX 5090 (32 GB) |
| Qwen3.8-Flash-Next-FP8-Infernix | MoE, 48 capas, 512 expertos (top-10) | no disponible | `.infernix` + `.ngram` BF16/P12 | Qwen Community 1.0 | 1x RTX 5090 (32 GB) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card declara explícitamente que el artefacto, la receta de conversión, el motor y buena parte de la documentación fueron generados con IA (mayoritariamente Claude Opus 5.5) y que es trabajo de hobby, probablemente incompleto o no del todo exacto.
- El formato `.infernix` es propietario del motor Infernix; no es cargable por llama.cpp, vLLM, Ollama ni TGI, lo que limita la portabilidad.
- Requiere mantener las dos partes del modelo en un mismo directorio y pasar la parte 1 a Infernix, como con un GGUF dividido.
- El volumen n-gram PLE no está incluido en los ficheros del modelo: debe descargarse por separado y colocarse en NVMe o en RAM si cabe; sin él, el modelo no funciona correctamente.
- La decodificación con DFlash2 requiere una build de Infernix cuyo `--help` liste `--draft-model`; builds desde 2026-10-31 lo localizan automáticamente sin `--spec`.
- La licencia Qwen Community 1.0 impone restricciones que deben revisarse antes de uso comercial; los componentes del GGUF original están bajo Apache 2.0.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- El rendimiento depende críticamente del ancho de banda de PCIe, la RAM del host y la velocidad del NVMe; configuraciones por debajo de las recomendadas degradarán la latencia de forma significativa.
- El repositorio tiene 1.105 descargas y 1 like, lo que indica una adopción muy limitada y escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix
- Modelo base GGUF: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Drafter DFlash2 para Infernix: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-DFlash2-Infernix
- Drafter DFlash2 original (Inco AI): https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Tabla n-gram FP8 recomendada: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix/blob/main/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix.ngram
- Tabla n-gram BF16: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix/blob/main/Qwen3.8-Flash-Next-BF16.ngram
- Tabla n-gram BF16 P12: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix/blob/main/Qwen3.8-Flash-Next-BF16-P12.ngram
- Tabla n-gram NVFP4: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix/blob/main/Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix.ngram
