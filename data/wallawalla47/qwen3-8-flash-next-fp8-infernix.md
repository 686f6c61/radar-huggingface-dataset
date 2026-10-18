# wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix

## Resumen

`wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix` es un artefacto de pesos preparado para **Infernix**, un motor de inferencia escrito en C++/CUDA por el mismo autor, que empaqueta el checkpoint oficial `Qwen/Qwen3.8-Flash-Next-FP8` de Qwen en un formato propietario dividido en cinco partes (132,7 GB en total). No es un modelo nuevo ni un ajuste fino: es una conversión orientada a ejecutar un modelo MoE multimodal de gran tamaño en **una única GPU consumer RTX 5090 de 32 GB**, apoyándose en una jerarquía de almacenamiento que combina VRAM, RAM del host, PCIe, CPU y SSD NVMe. La conversión preserva los códigos E4M3FN y las escalas BF16 por teselas de 128×128 de cada experto, de modo que el modelo principal y la torre de visión son *bit-exact* respecto al checkpoint de Qwen; solo el *drafter* MTP (multi-token prediction, usado para decodificación especulativa) se cuantiza adicionalmente.

El modelo subyacente es un transformer disperso (MoE) de 48 capas con 512 expertos enrutados por capa y top-10 activos, lo que suma **24.576 expertos enrutados en FP8 (112,6 GiB)**. Ese volumen de expertos no cabe en una máquina de 96 GB, así que Infernix mantiene en RAM fijada (*pinned*) tantos expertos como sea posible, lee el resto desde el artefacto en SSD, cachea en VRAM los más calientes y calcula en CPU parte de los fallos de cada capa. El paquete se completa con una torre de visión (pipeline `image-text-to-text`) y una tabla PLE de n-gramas de 320.001.536 filas que se entrega como volumen aparte.

Su relevancia es acotada pero clara: demuestra que un MoE multimodal de esta escala puede ejecutarse en hardware de consumo con suficiente RAM y NVMe, a costa de velocidad. El propio autor advierte que es trabajo de *hobby* generado en buena parte con IA (Claude Opus 5.5), que puede ser incompleto o inexacto, y que esta es la variante **más precisa y más lenta** de su catálogo: las conversiones a 4 bits decodifican varias veces más rápido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con 48 capas, 512 expertos enrutados por capa (top-10) y drafter MTP para decodificación especulativa; incluye torre de visión |
| Parametros totales | no disponible (el autor no publica el recuento; solo indica 24.576 expertos enrutados en FP8 que ocupan 112,6 GiB) |
| Parametros activos | no disponible (top-10 de 512 expertos enrutados por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3FN con escalas BF16 por tesela de 128×128 en los expertos; tensores BF16 y FP32 sin alterar; drafter MTP cuantizado adicionalmente (esquema no especificado); tabla PLE en BF16 (volumen de este repo), FP8 con escala única o IQ4_NL a 4,5 bits por valor |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | `.infernix` propietario (5 partes; la parte 1 contiene la tabla de contenidos) + volumen `.ngram` separado; `config.json` es solo metadato para el conteo de descargas del Hub |
| Tamano del repositorio | 132,7 GB (4 partes de 32.000.000.000 bytes + 1 de 4.689.672.704 bytes; el volumen BF16 `.ngram` añade 109.227.196.416 bytes) |
| Libreria / motor | `infernix` (C++/CUDA) |
| Pipeline | `image-text-to-text` |
| Hardware objetivo | 1× NVIDIA RTX 5090 (32 GB, arquitectura Blackwell) + RAM del host + SSD NVMe |
| Revision del checkpoint base | `236dfdf285828023ca3bcd3f37366c58a3469b13` |
| Receta de conversion | `qwen3_8_flash_next_fp8` (componentes: texto, visión y MTP) |

## Arquitectura y entrenamiento

La información disponible describe el artefacto, no el entrenamiento del modelo base. Se sabe que Qwen3.8-Flash-Next es un transformer MoE de 48 capas con 512 expertos enrutados por capa y enrutamiento top-10, acompañado de un *drafter* MTP que propone tokens que el modelo completo verifica después (decodificación especulativa). El modelo es multimodal: incorpora una torre de visión que se empaqueta junto con los componentes de texto y MTP en la receta de conversión. Adicionalmente, el modelo usa una tabla PLE de n-gramas de 320.001.536 filas, distribuida como volumen independiente y leída en bloques aleatorios de 4 KiB desde NVMe (o mantenida en RAM cuando cabe). No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación.

La innovación técnica relevante está en la conversión y el motor de ejecución, no en el modelo. Infernix calcula los expertos con activaciones BF16 en aritmética entera exacta y un único redondeo final, de forma que el resultado tiene los mismos bits con independencia de dónde se ejecute el experto (VRAM, PCIe, CPU o SSD). El artefacto conserva las escalas BF16 por tesela de 128×128, por lo que el modelo principal y la visión son *bit-exact* frente al checkpoint de Qwen cuando se usa el volumen de n-gramas BF16 de este repositorio; los volúmenes FP8 e IQ4_NL redondean esos valores y su efecto sobre la calidad no ha sido medido por el autor. El sesgo hacia la fidelidad tiene un coste explícito: es la variante más lenta de la familia.

## Capacidades

- Generación de texto conversacional multi-turno sobre el checkpoint Qwen3.8-Flash-Next.
- Procesamiento de imagen y texto combinados (`image-text-to-text`), gracias a la torre de visión incluida y preservada bit a bit.
- Razonamiento y conocimiento general heredados del modelo base de Qwen; el autor no documenta evaluaciones propias.
- Decodificación especulativa mediante drafter MTP, verificada por el modelo completo.
- Recuperación mediante tabla PLE de n-gramas en tres formatos intercambiables (BF16, FP8 con escala única, IQ4_NL de 4,5 bits por valor); cualquier volumen sirve para cualquier modelo de la familia Flash-Next.
- Ejecución con reparto de expertos entre VRAM, RAM del host, CPU y SSD, con resultados deterministas entre niveles.
- Soporte de *tool calling* / *function calling*: no disponible en la documentación proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación proporcionada.
- Capacidades multilingües: no disponible (el campo de idiomas del Hub está vacío).
- Capacidades de audio: no disponibles.

## Casos de uso

- **Inferencia local de un MoE multimodal en una sola RTX 5090**: el caso de uso central del artefacto. Con 32 GB de VRAM, RAM del host suficiente y un NVMe para el *tier* de expertos y el volumen `.ngram`, se puede servir un modelo de 112,6 GiB de expertos en hardware de consumo, aceptando la penalización de latencia por lectura desde disco.
- **Prototipado de asistentes visión-lenguaje en estación de trabajo**: al ser *bit-exact* con el checkpoint de Qwen en el modelo principal y la visión, sirve para validar respuestas y comportamientos que luego se replicarán en un despliegue mayor, sin sorpresas por cuantización.
- **Investigación en cuantización y formatos de pesos**: la convivencia de tres volúmenes de n-gramas (BF16, FP8, IQ4_NL) y de conversiones a 4 bits del mismo modelo permite medir el impacto de cada esquema sobre la perplejidad y la velocidad con el mismo motor.
- **Evaluación de motores de inferencia C++/CUDA**: Infernix es un motor en desarrollo activo; este artefacto sirve como banco de pruebas para medir el rendimiento del *expert tier* en SSD, el reparto CPU/GPU y la decodificación especulativa con MTP.
- **Despliegue *on-premise* con requisitos de privacidad**: al ejecutarse íntegramente en una máquina local, permite procesar texto e imágenes confidenciales sin salida a servicios externos, siempre que la Qwen Community License 1.0 lo permita para el caso concreto.
- **Docencia y demostración de arquitecturas MoE dispersas**: permite mostrar en vivo el enrutamiento top-10 sobre 512 expertos, el comportamiento de un *drafter* MTP y el efecto del ancho de banda de memoria en el *throughput*, con un único equipo.
- **Reproducción de resultados del checkpoint oficial**: útil para verificar que una implementación propia produce los mismos bits que Qwen en cada experto, usando la afirmación de *bit-exactitud* como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección `Performance` y otra `Quality` a las que remite en varias ocasiones, pero su contenido no está incluido en el extracto proporcionado, por lo que no se pueden reproducir cifras de latencia, *throughput* ni métricas de calidad. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales.

## Requisitos de hardware

- **VRAM**: 32 GB como mínimo en el hardware objetivo declarado (RTX 5090). Infernix usa la VRAM como caché de expertos calientes, no como almacén completo del modelo.
- **Memoria del host**: el autor menciona una máquina de 96 GB como referencia y señala que los 112,6 GiB de expertos en FP8 no caben en ella; se necesita RAM fijada (*pinned*) para retener tantos expertos como sea posible.
- **Almacenamiento**: SSD NVMe obligatorio para el *tier* de expertos y para el volumen `.ngram`, que se lee en bloques aleatorios de 4 KiB. Un HDD no es viable por latencia.
- **GPU recomendadas**: RTX 5090 (32 GB) según el autor; el motor está etiquetado para arquitectura Blackwell. No se documenta compatibilidad con A100, H100, RTX 4090 ni otras GPU.
- **¿Cabe en GPU consumer?** Sí, en una RTX 5090 de 32 GB, con el reparto VRAM/RAM/SSD descrito. No hay datos para GPUs consumer de 24 GB o menos.
- **Opciones de despliegue**: exclusivamente el motor Infernix (C++/CUDA). El formato `.infernix` no es compatible con vLLM, llama.cpp, Ollama ni TGI. El campo `inference: false` de la model card impide la inferencia automática en el Hub.
- **Latencia y throughput**: no disponibles. El autor indica cualitativamente que esta es la variante más lenta de su catálogo y que las conversiones a 4 bits decodifican varias veces más rápido, pero sin cifras.
- **Descarga total**: aproximadamente 132,7 GB para el modelo más 109,2 GB si se usa el volumen BF16 de este repositorio (existen alternativas de 52,4 GB en FP8 y 29,1 GB en IQ4_NL).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix` (este) | no disponible (24.576 expertos enrutados) | no disponible | FP8 E4M3FN bit-exact + drafter MTP cuantizado | Qwen Community License 1.0 | Motor Infernix; 132,7 GB + volumen n-gram |
| `Qwen/Qwen3.8-Flash-Next-FP8` (base oficial) | no disponible | no disponible | FP8 | Qwen Community License 1.0 | Checkpoint oficial; requiere pila de inferencia compatible (no confirmada en la información disponible) |
| `Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix` | mismo modelo base | no disponible | NVFP4 (4 bits) | Qwen Community License 1.0 | Infernix; decodifica varias veces más rápido, con pérdida de exactitud |
| `Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix` | mismo modelo base | no disponible | NVFP4 (variante Dense8) | Qwen Community License 1.0 | Infernix; copia idéntica del volumen `.ngram` FP8 |
| `Wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix` | mismo modelo base | no disponible | IQ3_S / IQ4_NL (4,5 bits por valor en la tabla) | Qwen Community License 1.0 | Infernix; volumen `.ngram` de 29,1 GB |

No se dispone de datos de rendimiento comparado entre estas variantes, solo de la afirmación cualitativa del autor sobre velocidad y fidelidad.

## Limitaciones y advertencias

- **Artefacto de hobby generado con IA**: el autor advierte explícitamente de que el artefacto, la receta de conversión, el motor y buena parte de la model card se hicieron con IA (mayoritariamente Claude Opus 5.5) y que es probable que no estén completos ni sean exactos.
- **Sin validación de la comunidad**: 0 descargas y 0 *likes* en el momento de la consulta; creado y actualizado el 18 de octubre de 2026 con diez minutos de diferencia. No hay evidencia independiente de que el artefacto funcione más allá de lo que declara el autor.
- **Formato cerrado y motor único**: los pesos solo se pueden ejecutar con Infernix. No hay exportación a GGUF, safetensors estándar ni compatibilidad con vLLM, llama.cpp, Ollama o TGI, lo que impide integrarlo en pilas de producción convencionales.
- **Requisitos de infraestructura poco habituales**: NVMe dedicado, RAM del host amplia (referencia de 96 GB) y reparto de expertos por PCIe y CPU. El rendimiento dependerá críticamente del ancho de banda del disco y del bus.
- **Rendimiento no documentado aquí**: la sección de rendimiento de la model card no está incluida en la información disponible, así que no se puede planificar capacidad con cifras.
- **Verificación incompleta de la bit-exactitud**: el autor afirma que el modelo principal y la visión son *bit-exact* con el volumen BF16, pero no aporta en el extracto disponible una verificación reproducible más allá del informe de conversión (`conversion.json`).
- **El drafter MTP no es exacto**: se cuantiza adicionalmente, de modo que las propuestas de tokens pueden diferir del checkpoint original. La decodificación especulativa verifica contra el modelo completo, pero el comportamiento no es idéntico al oficial.
- **Volúmenes de n-gramas alternativos sin medir**: el autor indica que el efecto del volumen FP8 y del IQ4_NL sobre la calidad de este modelo no ha sido medido.
- **Licencia**: Qwen Community License 1.0, con términos específicos que hay que revisar antes de cualquier uso comercial; el artefacto incluye `LICENSE` y `NOTICE` con atribución y cambios. No es una licencia permisiva tipo Apache 2.0 ni MIT.
- **Idiomas no declarados**: el campo de idiomas está vacío, por lo que no hay garantía documentada de calidad en castellano ni en otros idiomas distintos del inglés.
- **Riesgo de alucinación y sesgos**: no documentados por el autor; deben asumirse los del checkpoint base de Qwen, sin evaluación independiente disponible.
- **Longitud de contexto desconocida**: no se puede dimensionar el uso en conversaciones largas o documentos extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Motor Infernix (repositorio): https://github.com/Wallawalla47/Infernix
- Variante NVFP4 (incluye el volumen `.ngram` FP8 recomendado): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix
- Variante NVFP4 Dense8: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix
- Variante GSQ-RCO IQ3_S (volumen `.ngram` IQ4_NL de 29,1 GB): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix
- Licencia en el repositorio: https://huggingface.co/wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix/blob/main/LICENSE
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
