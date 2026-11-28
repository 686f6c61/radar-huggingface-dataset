# wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix

## Resumen

Qwen3.8-Flash-Next-FP8-Infernix es un artefacto de pesos derivado de Qwen3.8-Flash-Next-FP8, el checkpoint oficial multimodal de Qwen (Alibaba), reempaquetado por el usuario wallawalla47 para el motor de inferencia Infernix, escrito en C++/CUDA. No se trata de un modelo nuevo ni de un fine-tuning: es una conversión de formato que preserva bit a bit los pesos del modelo base (expertos FP8 E4M3FN con escalas BF16 por tesela de 128×128, tensores BF16/FP32 sin alterar) y solo cuantiza adicionalmente el drafter MTP. Su relevancia está en que permite ejecutar un modelo MoE multimodal de gran tamaño en una única GPU consumer, la RTX 5090 de 32 GB, mediante una arquitectura de offload a RAM del host y SSD.

El modelo base es un transformer disperso (MoE) de 48 capas con 512 expertos enrutados por capa y top-10 activos, además de una torre de visión y un drafter MTP para decodificación especulativa. La conversión incluye además un volumen de tabla n-gram PLE separado (320.001.536 filas), que se lee en bloques aleatorios de 4 KiB desde NVMe. El repositorio ocupa 323,8 GB y las descargas registradas son 179, con fecha de creación en octubre de 2026.

El interés práctico es doble: por un lado demuestra una técnica de despliegue (expertos en SSD con caché en VRAM y cómputo parcial en CPU) para modelos que no caben en memoria del host; por otro, al ser bit-exacto respecto al checkpoint de Qwen, sirve como referencia de fidelidad frente a las conversiones a 4 bits del mismo autor, que decodifican varias veces más rápido pero no son exactas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención estándar, torre de visión y drafter MTP; 48 capas, 512 expertos enrutados por capa (top-10) |
| Parámetros totales | no disponible (el autor no publica el recuento; el artefacto de pesos ocupa 132,7 GB en FP8 más la tabla n-gram) |
| Parámetros activos | no disponible (top-10 de 512 expertos por capa; el recuento absoluto no se indica) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 E4M3FN con escalas BF16 128×128 en expertos (bit-exacto); BF16/FP32 intactos en el resto; drafter MTP cuantizado adicionalmente; tabla n-gram en BF16, BF16 P12, NVFP4, IQ4_NL o FP8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`, marcada como `other`) |
| Formato de pesos | `.infernix` propietario, dividido en 5 partes (32 GB × 4 + 4,69 GB); tabla n-gram en `.ngram` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 48 capas con 512 expertos enrutados por capa y enrutamiento top-10, lo que implica 24.576 expertos en total (112,6 GiB en FP8). Incorpora un drafter MTP (multi-token prediction) para decodificación especulativa y una torre de visión que lo habilita como modelo image-text-to-text. La innovación destacable del artefacto no está en el entrenamiento sino en el runtime: Infernix mantiene en RAM fijada (pinned host RAM) tantos expertos como caben, lee el resto desde el artefacto en SSD, cachea en VRAM los expertos calientes y hace que la CPU compute parte de los fallos de cada capa. El cómputo de expertos se realiza con activaciones BF16 en aritmética entera exacta y un único redondeo, de modo que el resultado es idéntico en bits independientemente de dónde se ejecute el experto (VRAM, PCIe, CPU o SSD).

El autor no documenta en esta ficha el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineamiento (RLHF/DPO) del modelo base; esa información corresponde a la model card oficial de Qwen3.8-Flash-Next-FP8 y no se reproduce aquí. La tabla PLE n-gram (320.001.536 filas) es un componente separado del checkpoint, no incluido en los ficheros del modelo, y se sirve como volumen aparte.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento multimodal image-text-to-text gracias a la torre de visión incluida.
- Razonamiento y generación de código (el autor menciona decodificación especulativa con muestreo sobre código, lo que sugiere uso en ese dominio).
- Decodificación especulativa mediante drafter MTP propio o mediante el drafter externo DFlash2 de Inco AI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE multimodal grande en una sola RTX 5090: el artefacto está diseñado específicamente para ejecutarse en 32 GB de VRAM con offload de expertos a RAM y SSD, lo que permite a un investigador individual trabajar con un modelo que de otro modo requeriría un servidor de 96 GB o más.
- Referencia de fidelidad para evaluar cuantizaciones: al ser bit-exacto respecto al checkpoint de Qwen, sirve para medir la degradación real de las conversiones a 4 bits del mismo autor (NVFP4, IQ4_NL, etc.) en tareas de código, visión o razonamiento.
- Procesamiento de documentos con imagen: la pipeline image-text-to-text permite extraer y razonar sobre contenido de capturas, escaneos o diagramas en un flujo local sin enviar datos a la nube.
- Desarrollo y validación del motor Infernix: el artefacto es el caso de prueba de mayor exigencia del runtime (24.576 expertos, tabla n-gram externa, drafter MTP), útil para quien contribuya al motor o quiera reproducir sus benchmarks.
- Experimentación con decodificación especulativa: la combinación de drafter MTP y drafter externo DFlash2 permite medir ganancias de throughput (8-11 % con `--draft-tokens auto`, 26 % en código muestreado) en un entorno controlado.
- Servicio conversacional de baja concurrencia: con `infernix-serve` se puede levantar un endpoint local para prototipos de chat multimodal donde la latencia no sea crítica y prime la fidelidad de los pesos.
- Estudio de arquitecturas MoE con enrutamiento top-10: el artefacto expone la estructura completa de 512 expertos por capa, útil para analizar patrones de activación o diseñar políticas de caché.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta datos relativos de velocidad de decodificación con el drafter DFlash2 (8-11 % más rápido que el drafter MTP propio con `--draft-tokens auto`, y 26 % en código muestreado), sin cifras absolutas de tokens por segundo.

## Requisitos de hardware

- VRAM: 32 GB en una RTX 5090; el modelo no cabe completo en VRAM y depende del tier de expertos en SSD más caché en VRAM.
- RAM del host: el autor indica que los 112,6 GiB de expertos FP8 superan lo que una máquina de 96 GB puede fijar en memoria, por lo que se recomienda un host con la mayor cantidad posible de RAM fijable (pinned) para maximizar aciertos de caché.
- Almacenamiento: NVMe para el volumen n-gram (se lee en bloques aleatorios de 4 KiB) y para las cinco partes del modelo; el repositorio completo son 323,8 GB.
- GPU recomendadas: RTX 5090 (objetivo declarado, arquitectura Blackwell). No se documentan otros perfiles.
- ¿Cabe en GPU consumer? Sí, en RTX 5090 de 32 GB, con el esquema de offload descrito; no se garantiza en GPUs con menos VRAM.
- Despliegue: exclusivamente mediante el motor Infernix (`infernix-serve`), con soporte de `--ngram-volume`, `--spec dflash2`, `--draft-model` y `--draft-tokens auto`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.infernix`.
- Latencia y throughput: no disponibles en cifras absolutas; el autor califica esta conversión como «la más precisa y la más lenta» de las suyas, y señala que las conversiones a 4 bits decodifican varias veces más rápido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8-Infernix (este) | MoE 48 capas, 512 expertos/capa, top-10 | no disponible | `.infernix` / Infernix | Qwen Community 1.0 | Bit-exacto; la variante más lenta del autor |
| Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix | mismo modelo base | no disponible | `.infernix` / Infernix | Qwen Community 1.0 | Conversión a 4 bits; incluye la tabla n-gram FP8 recomendada |
| Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix | mismo modelo base | no disponible | `.infernix` / Infernix | Qwen Community 1.0 | NVFP4 a 4,5 bits por valor en la tabla n-gram |
| Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix | mismo modelo base | no disponible | `.infernix` / Infernix | Qwen Community 1.0 | IQ4_NL a 4,5 bits por valor (GSQ-RCO de ISTA-DASLab) |
| Qwen/Qwen3.8-Flash-Next-FP8 (original) | mismo modelo base | no disponible | safetensors FP8 / ecosistema estándar | Qwen Community 1.0 | Checkpoint de referencia de Qwen; requiere hardware de mayor capacidad |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación se limita a formato, fidelidad y requisitos de despliegue.

## Limitaciones y advertencias

- El propio autor advierte que el artefacto, la receta de conversión, el motor y buena parte de la model card se generaron con IA (mayoritariamente Claude Opus 5.5) y que es trabajo de aficionado, probablemente incompleto o inexacto.
- El modelo está marcado con `inference: false` en los metadatos del Hub y solo funciona con el motor Infernix; no es portable a otros runtimes sin reconversión.
- El formato `.infernix` es propietario y el ecosistema de herramientas es mínimo; no hay integración con vLLM, llama.cpp, Ollama ni TGI.
- El despliegue exige NVMe dedicado para la tabla n-gram y una cantidad considerable de RAM fijable; sin ello, el rendimiento se degrada por lecturas desde SSD.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de explotación comercial.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo base en esta ficha; deben consultarse en la model card oficial de Qwen.
- El drafter MTP está cuantizado adicionalmente, por lo que la fidelidad bit a bit no cubre la fase de propuesta de tokens (aunque los tokens propuestos se verifican con el modelo completo).
- El tamaño del repositorio (323,8 GB) y la necesidad de descargar volúmenes n-gram adicionales desde otros repositorios complican la reproducibilidad.
- Las fechas de creación y actualización del repositorio (octubre y noviembre de 2026) y la referencia a un modelo base no verificado de forma independiente en esta ficha deben tratarse con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Drafter DFlash2 para Infernix: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-DFlash2-Infernix
- Drafter DFlash2 original (Inco AI): https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Conversión NVFP4 con tabla n-gram FP8 recomendada: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix
- Conversión NVFP4 Dense8: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix
- Conversión FP4-Local: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix
- Conversión GSQ-RCO IQ3_S: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix
