# wasif-haq/Qwen3-4B-Q4_0-pure-GGUF

## Resumen

Qwen3-4B-Q4_0-pure-GGUF es una cuantización de 4 bits del modelo Qwen/Qwen3-4B, publicada por el usuario wasif-haq en Hugging Face. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son exactamente los de Qwen3-4B (desarrollado por el equipo Qwen de Alibaba Cloud), convertidos a formato GGUF y cuantizados con llama.cpp. Su particularidad es que aplica cuantización Q4_0 a todos los tensores del modelo, incluidos los embeddings de tokens y la capa de salida, mediante el flag `--pure` de llama-quantize.

El propósito declarado es servir como artefacto reproducible para benchmarks on-device: un único fichero que se ejecuta idénticamente en móviles, portátiles y placas Jetson, y que además coincide con las builds all-4-bit del mismo modelo en otros runtimes. No está optimizado para calidad, sino para consistencia entre dispositivos.

Con 4.022.468.096 parámetros y un fichero GGUF de 2.269.269.472 bytes (unos 2,3 GB), es una opción ligera para inferencia local en hardware modesto. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3-4B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_0 aplicado a todos los tensores (incluidos embeddings y capa de salida) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen3-4b-q4_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3-4B, un transformer de 4.022 millones de parámetros. La model card de esta cuantización no describe la arquitectura interna ni los datos de entrenamiento del modelo base; solo documenta el proceso de conversión. Según el autor, los pesos provienen de la revisión `1cfa9a7208912126459214e8b04321603b3df60c` de Qwen/Qwen3-4B y no se ha aplicado ningún otro cambio aparte de la cuantización.

El pipeline de conversión es explícito y reproducible: primero se convierte el snapshot de Hugging Face a GGUF en f16 con `convert_hf_to_gguf.py`, y después se cuantiza con `llama-quantize --pure qwen3-4b-f16.gguf qwen3-4b-q4_0.gguf Q4_0`, usando llama.cpp en el tag `b11836`. El uso de `--pure` garantiza que ningún tensor quede en mayor precisión, lo que iguala el comportamiento con builds all-4-bit de otros runtimes. Se incluye el hash SHA-256 del fichero para verificación de integridad. No se documentan innovaciones técnicas adicionales propias de esta publicación.

## Capacidades

- Generación de texto conversacional, heredada de Qwen3-4B (pipeline `text-generation`, tag `conversational`).
- Plantilla de chat de Qwen3 incluida en el GGUF.
- Modo thinking: la plantilla permite respuestas con o sin bloque de razonamiento; para desactivarlo se usa `enable_thinking=false`, tal como indica la model card de Qwen.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Ejecución con cualquier build de llama.cpp que lea GGUF, por ejemplo `llama-cli -m qwen3-4b-q4_0.gguf -ngl 99`.
- Capacidades específicas de tool calling, agentes, visión, audio o multilingüismo del modelo base: no disponibles en la información proporcionada.

## Casos de uso

- Benchmarking on-device reproducible: el caso de uso principal declarado por el autor. Al ser un único fichero con hash verificado y cuantización uniforme, permite comparar throughput y latencia entre móviles, portátiles y placas Jetson ejecutando exactamente los mismos pesos.
- Comparación entre runtimes: al usar Q4_0 "puro" en todos los tensores, se alinea con builds all-4-bit de otros motores (por ejemplo, otros runtimes de inferencia cuantizada), lo que facilita comparaciones justas de rendimiento entre backends.
- Inferencia local en portátiles sin GPU dedicada: con 2,3 GB de fichero, cabe en RAM de sistemas modestos y se ejecuta con llama.cpp en CPU.
- Despliegue en dispositivos embebidos: placas tipo Jetson o sistemas ARM donde el presupuesto de memoria es reducido y se necesita un modelo de 4B parámetros en 4 bits.
- Pruebas de integración en pipelines de CI: el hash SHA-256 publicado permite verificar la integridad del artefacto descargado antes de ejecutar tests automatizados.
- Chat conversacional ligero en local: la plantilla de chat incluida y el modo `enable_thinking=false` permiten respuestas directas sin bloque de razonamiento en asistentes de escritorio.
- Validación de conversiones GGUF: sirve como referencia para comprobar que una conversión propia de Qwen3-4B a Q4_0 produce resultados equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo está pensado para benchmarks on-device, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero GGUF ocupa 2.269.269.472 bytes (unos 2,3 GB); se necesita al menos esa cantidad de memoria más el overhead del contexto y del runtime de llama.cpp.
- GPU recomendadas: no disponibles en la información proporcionada. El autor cita explícitamente móviles, portátiles y placas Jetson como objetivos.
- GPU de consumo: por tamaño, es viable en GPUs de consumo con 4 GB o más de VRAM, aunque no se confirma en la documentación.
- Opciones de despliegue: cualquier build de llama.cpp que lea GGUF (el autor cita el tag `b11836`); ejemplo con `llama-cli -m qwen3-4b-q4_0.gguf -ngl 99`. Otros motores (vLLM, TGI, Ollama) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Q4_0-pure-GGUF (esta ficha) | 4.022 M | no disponible | Q4_0 en todos los tensores | Apache 2.0 | Fichero de 2,3 GB, orientado a benchmarks on-device reproducibles |
| Qwen/Qwen3-4B (original) | 4.022 M | no disponible | f16/bf16 (original) | Apache 2.0 | Pesos sin cuantizar; mayor calidad, mayor huella de memoria |
| Otras cuantizaciones GGUF de Qwen3-4B | 4.022 M | no disponible | mezclas Q4_K_M, Q5_K_M, etc. | Apache 2.0 | Mayor calidad que Q4_0 puro, pero no comparables bit a bit con builds all-4-bit de otros runtimes |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias

- La cuantización Q4_0 "pura" degrada la calidad respecto al modelo original: al cuantizar también embeddings y capa de salida, la pérdida es mayor que en esquemas mixtos como Q4_K_M. El autor lo indica explícitamente: no está ajustado para calidad.
- No es un modelo nuevo ni un ajuste fino: cualquier limitación del Qwen3-4B original (sesgos, alucinaciones, cobertura idiomática) se hereda, aunque la model card no las detalla.
- Idiomas soportados no documentados en esta publicación; conviene consultar la model card de Qwen/Qwen3-4B.
- Longitud de contexto no documentada en esta ficha; depende de la configuración del modelo base y del runtime.
- Licencia Apache 2.0: permite uso comercial, pero el repositorio contiene una versión modificada (cuantizada) de los pesos originales de Alibaba Cloud / equipo Qwen; se debe conservar la atribución.
- Verificar siempre el SHA-256 (`01b25740ddcf91454dc8fba52cd8cdd89d14fc8bb6a24834490012157a697de4`) tras la descarga.
- Repositorio con 0 likes y 174 descargas en el momento de la consulta: procede de un autor individual, no del equipo oficial de Qwen.
- Para producción orientada a calidad, es preferible usar el modelo original o cuantizaciones mixtas; esta build está pensada para benchmarking.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wasif-haq/Qwen3-4B-Q4_0-pure-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
