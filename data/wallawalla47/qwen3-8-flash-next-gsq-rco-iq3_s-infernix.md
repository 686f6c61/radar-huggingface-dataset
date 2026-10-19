# wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un artefacto de inferencia: la conversión del GGUF `IQ3_S` de `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF` al formato propietario `.infernix`, empaquetado para el motor C++/CUDA Infernix. El modelo subyacente es Qwen3.8-Flash-Next, un transformer de mezcla de expertos (MoE) disperso con 48 capas y 512 expertos enrutados por capa con enrutamiento top-10, lo que da 24.576 expertos en total, más una torre de visión y un cabezal MTP (multi-token prediction) que actúa como drafter para decodificación especulativa.

Su interés técnico está en el diseño de despliegue: los 24.576 expertos (46,9 GiB) residen en RAM del host fijada (pinned), una caché en VRAM retiene los expertos calientes, la CPU calcula parte de los fallos de cada capa y la tabla PLE n-gram (320.001.536 filas) se lee desde NVMe en bloques aleatorios de 4 KiB. Todo ello sobre una única GPU consumer, una RTX 5090 de 32 GB.

La conversión es bit a bit idéntica al GGUF de origen (verificada con `verify_gguf_artifact`), y el motor calcula con activaciones BF16 en aritmética entera exacta, de modo que el resultado es el mismo independientemente de si el experto se ejecuta en VRAM, por PCIe o en CPU, y del tamaño de lote. El autor declara explícitamente que es trabajo de aficionado generado en gran parte con IA y que puede ser incompleto o inexacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso: 48 capas, 512 expertos enrutados por capa, enrutamiento top-10; torre de vision y cabezal MTP; tabla PLE n-gram externa |
| Parametros totales | no disponible (no se publica el recuento; el modelo ocupa 56.755.219.968 bytes en dos particiones) |
| Parametros activos | no disponible (top-10 de 512 expertos por capa; recuento no publicado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S del GGUF base con asignacion de bits por tensor GSQ + RCO: mezcla de IQ2_S, IQ3_XXS, IQ3_S e IQ4_XS en gate/up y IQ4_NL o Q2_0 en down. Tabla n-gram en IQ4_NL (volumen de este repo), con alternativas FP8 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`); el GGUF base de ISTA-DASLab se distribuye ademas con Apache 2.0 |
| Formato de pesos | `.infernix` en dos particiones (la primera incluye la tabla de contenidos), bit a bit identico al GGUF; volumen `.ngram` separado; `config.json` solo para metadatos del Hub |
| Tamano del repositorio | 85,9 GB |
| Modalidad | image-text-to-text (texto e imagen) |
| Motor de inferencia | Infernix (C++/CUDA); `inference: false` en el Hub |

## Arquitectura y entrenamiento

El modelo base es un MoE de 48 capas con 512 expertos enrutados por capa y selección top-10, es decir, 24.576 expertos enrutados en total. A ello se suman 385 tensores densos cuantizados, 1.218 tensores en BF16 y FP32 y la tabla PLE n-gram de 320.001.536 filas, que no viaja dentro de los ficheros del modelo sino como volumen aparte. La conversión se realizó con la receta `qwen3_8_flash_next_gsq_rco_iq3s` (componentes de texto, visión y MTP, más una cabeza de propuesta) sobre la revisión `ed59f92082b1e93c0e96d60a8b11aab089b52f09` del GGUF de ISTA-DASLab, incluyendo el `mmproj` en BF16.

La innovación relevante no está en el entrenamiento, del que no se aporta información, sino en la ruta de ejecución. Infernix mantiene cada tensor GGUF sin alteración y calcula con activaciones BF16 en aritmética entera exacta: cada salida es la suma exacta de los pesos del GGUF por las activaciones, redondeada una sola vez. Frente a llama.cpp, que redondea las activaciones a 8 bits, aquí los logits no dependen de dónde se ejecute el experto ni del ancho de lote. La decodificación especulativa la aporta el drafter MTP, y el reparto de cómputo entre VRAM, PCIe y CPU permite sostener el modelo en una sola GPU de 32 GB. No se dispone de datos sobre volumen de tokens, composición del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Procesamiento de imagen y texto de forma conjunta (`image-text-to-text`, torre de visión incluida en el artefacto como `mmproj` BF16).
- Decodificación especulativa mediante drafter MTP integrado en el formato.
- Enrutamiento MoE disperso con cómputo parcial en CPU y caché de expertos calientes en VRAM.
- Consulta de tablas PLE n-gram externas (320.001.536 filas) leídas por bloques de 4 KiB desde NVMe o desde RAM.
- Reproducibilidad numérica: mismos bits de salida con independencia del dispositivo donde se ejecute el experto y del tamaño de lote.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia multimodal local en una sola GPU consumer: el reparto entre VRAM (caché de expertos), RAM fijada (46,9 GiB de expertos) y NVMe (tabla n-gram) permite ejecutar un MoE de 48 capas con visión en una RTX 5090 de 32 GB, sin clúster ni múltiples aceleradores.
- Reproducción exacta de resultados de cuantización: al ser bit a bit idéntico al GGUF y usar aritmética entera exacta, sirve para comparar logits y perplejidad frente a otras implementaciones (por ejemplo, las diferencias documentadas con llama.cpp por el redondeo de activaciones a 8 bits).
- Investigación sobre offload de expertos: la arquitectura de caché en VRAM más cómputo de fallos en CPU es un banco de pruebas para estudiar el equilibrio entre ancho de banda PCIe, aciertos de caché y latencia en modelos MoE de grano fino.
- Evaluación del impacto de las tablas n-gram: el mismo artefacto admite tres volúmenes (IQ4_NL, FP8 y BF16) y el autor ya reporta el efecto en perplejidad, lo que permite medir el coste de comprimir la tabla frente a mantenerla en BF16.
- Estación de trabajo conversacional con imágenes en entorno controlado: para prototipos internos donde se requiere privacidad total y no se quiere depender de una API, con el modelo corriendo íntegramente en hardware propio.
- Verificación de integridad de artefactos GGUF: el informe `conversion.json` (923.312 bytes) y la herramienta `verify_gguf_artifact` documentan fuentes, métodos y formatos por objeto, útiles para auditar una cadena de conversión antes de desplegar.
- Docencia sobre decodificación especulativa: el drafter MTP empaquetado en el propio artefacto permite ilustrar el mecanismo de propuesta y verificación sin montar infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo aportado es la perplejidad medida por el autor con dos volúmenes n-gram distintos:

| Metrica | Volumen n-gram | Resultado |
|---|---|---|
| Perplejidad | IQ4_NL (27,1 GiB, en RAM) | 3,5223 |
| Perplejidad | BF16 (101,7 GiB, desde NVMe) | 3,5198 |
| Perplejidad | FP8 (48,8 GiB) | no medida en este modelo |

No se dispone de comparaciones con otros modelos en la misma tabla, ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM: 32 GB es el mínimo documentado (RTX 5090). El artefacto no carga los 56,8 GB del modelo en VRAM: mantiene una caché de expertos calientes y el resto se resuelve fuera.
- RAM del host: 96 GB en la máquina de referencia, suficiente para sostener los 46,9 GiB de expertos en memoria fijada más los 27,1 GiB de la tabla IQ4_NL. Con la tabla FP8 (48,8 GiB) o BF16 (101,7 GiB) esta no cabe y se lee desde disco.
- Almacenamiento: SSD NVMe para el volumen `.ngram` (29.127.258.112 bytes en este repo), leído en bloques aleatorios de 4 KiB.
- GPU recomendadas: RTX 5090 (Blackwell) es el único caso documentado. No hay datos para A100, H100 ni otras GPU.
- Cabe en GPU consumer: sí, en RTX 5090 de 32 GB. Otras consumer no están documentadas.
- Opciones de despliegue: exclusivamente el motor Infernix (C++/CUDA, repositorio en GitHub). No hay soporte en vLLM, llama.cpp, Ollama ni TGI para el formato `.infernix`; el GGUF base sí es utilizable por otras herramientas, con ligeras diferencias de logits.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación dentro de la misma familia Qwen3.8-Flash-Next publicada por el mismo autor, ya que no se dispone de datos de modelos de terceros:

| Artefacto | Cuantizacion | Volumen n-gram asociado | Licencia | Parametros / contexto |
|---|---|---|---|---|
| Este repo (GSQ-RCO IQ3_S) | IQ3_S con mezcla por tensor | IQ4_NL, 27,1 GiB (en el repo) | Qwen Community 1.0 | no disponible |
| Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix | NVFP4 | FP8, 48,8 GiB (recomendado por el autor) | Qwen Community 1.0 | no disponible |
| Qwen3.8-Flash-Next-FP8-Infernix | FP8 | FP8 o BF16 (101,7 GiB) | Qwen Community 1.0 | no disponible |
| Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix | NVFP4 (variante Dense8) | FP8, 48,8 GiB (copia idéntica) | Qwen Community 1.0 | no disponible |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | GGUF IQ3_S (origen) | IQ4_NL incluida en el GGUF | Apache 2.0 segun el aviso del autor | no disponible |

Un único volumen n-gram sirve para cualquier modelo Flash-Next, según el autor.

## Limitaciones y advertencias

- La propia model card advierte de que el artefacto, la receta de conversión, el motor y buena parte del texto fueron generados con IA (principalmente Claude Opus 5.5) y que es trabajo de aficionado, probablemente incompleto o inexacto.
- El repositorio tiene 0 descargas y 0 likes; no hay validación independiente de las cifras de perplejidad ni de la verificación bit a bit, que son afirmaciones del propio autor.
- Dependencia total de un motor no estándar: sin Infernix no se puede ejecutar el artefacto. No hay integración con vLLM, llama.cpp, Ollama ni TGI.
- Requiere infraestructura específica (RTX 5090 con 32 GB, ~96 GB de RAM, NVMe con ~29 GB libres), lo que limita su portabilidad frente a un GGUF convencional.
- La licencia Qwen Community License 1.0 no es una licencia permisiva tipo Apache o MIT; hay que revisar `LICENSE` antes de cualquier uso comercial. El aviso del autor indica que el GGUF de ISTA-DASLab se distribuye con Apache 2.0, lo que conviene verificar por separado.
- No se publican idiomas soportados, longitud de contexto, recuento de parámetros ni evaluaciones de sesgo, alucinación o seguridad. No hay datos para estimar el riesgo de alucinación en este artefacto concreto.
- La tabla n-gram se lee desde disco en bloques de 4 KiB: el rendimiento dependerá críticamente de la latencia aleatoria del SSD, un extremo no cuantificado en la información disponible.
- El autor indica que las versiones antiguas de Infernix solo funcionan con los volúmenes IQ4_NL y BF16, no con el FP8.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix
- Modelo base (GGUF): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Volumen n-gram FP8 (recomendado): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix
- Volumen n-gram BF16: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix
- Variante Dense8: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix
- Licencia: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix/blob/main/LICENSE
