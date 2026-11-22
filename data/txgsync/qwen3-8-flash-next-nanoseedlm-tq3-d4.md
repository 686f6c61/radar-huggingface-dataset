# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3-D4

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TQ3-D4 es un empaquetado cuantizado de investigación del modelo Qwen3.8-Flash-Next, publicado por el usuario txgsync. El modelo base es un transformer de tipo mezcla de expertos (MoE) desarrollado por el equipo Qwen, y este paquete concreto aplica una compresión agresiva mediante cuantización de expertos con código de trellis (TCQ, Trellis Coded Quantization) a 3.458 bits por peso, manteniendo los pesos densos en 8 bits. El resultado es un modelo de 70.239.129.055 parámetros totales que puede ejecutarse en un PC con una GPU de 16 GB y entre 96 y 128 GB de RAM, o en un Mac con 96 GB de memoria unificada.

La relevancia de este paquete radica en que hace viable la inferencia local de un modelo MoE de gran tamaño en hardware de consumo, algo que normalmente requeriría múltiples aceleradores de gama profesional. Los pesos de expertos enrutados (120.800 millones de parámetros según la model card) ocupan 52,2 GB en este empaquetado, y el resto de pesos residentes suman aproximadamente 60 GB en total. La divergencia KL frente a BF16 es de 0,0638, un 7% inferior a los paquetes de Unsloth del mismo tamaño según el autor.

El modelo se distribuye como vista previa de investigación y depende de motores específicos: las NanoSeedLM engines (CUDA en Linux y Windows, Metal en macOS), mlx-vlm con Trust Remote Code y oMLX con un parche concreto. No es un modelo listo para producción sin validación adicional, y su licencia es la qwen-community-1.0, que impone restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), segun tags del repo; detalles internos no disponibles |
| Parametros totales | 70.239.129.055 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TCQ3-D4: expertos con trellis K3 (down K4) a 3,458 bits; pesos densos en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (MLX), custom_code; requiere motores NanoSeedLM, mlx-vlm u oMLX |
| Tamano del repo | 205,9 GB |
| Tamano de descarga | 117,2 GB |
| Memoria residente estimada | ~60 GB |
| Peso de expertos | 52,2 GB |
| Divergencia KL vs BF16 | 0,0638 |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura de mezcla de expertos (MoE), según los tags del repositorio. La model card menciona 120.800 millones de parámetros en pesos de expertos enrutados, lo que confirma la naturaleza MoE, pero no detalla el número de expertos, la topología de enrutamiento ni el número de parámetros activos por token. Tampoco se especifica la composición del dataset de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO. Toda esa información relativa al modelo base no está disponible en la documentación proporcionada.

La innovación técnica de este paquete concreto es la cuantización de los pesos de expertos mediante código de trellis (TCQ) con aritmética entera, sin codebook almacenado. Cada peso de experto se reconstruye a partir de unos pocos bits almacenados. El autor compara esta aproximación con la basada en semillas (SeedLM) y concluye que, con los mismos pesos densos de 8 bits, TCQ4 alcanza una KL de 0,0398 a 4,125 bits, frente a 0,0408 de P4 a 4,5 bits y 0,0600 de P3 a 4,0 bits. Además, el paquete incluye una tabla PLE (n-gram) que permanece en disco y cuyas filas se cargan mediante la caché de páginas del sistema operativo.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline image-text-to-text y la etiqueta conversational.
- Procesamiento de entrada de imagen y texto (image-text-to-text), lo que sugiere capacidades de visión, aunque no se detallan tareas concretas.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible, pero esperable en la familia Qwen; no verificable con los datos aportados.
- Soporte de tool calling y function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el campo de idiomas no está informado.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de 16 GB: el paquete está diseñado para PCs con 16 GB de VRAM y 96-128 GB de RAM, donde los expertos residen en RAM y la GPU cachea los expertos en uso. Adecuado para desarrolladores que quieren probar un MoE grande sin acceso a clústeres.
- Despliegue en Mac con 96 GB de memoria unificada: el autor recomienda explícitamente este paquete para Macs de 96 GB por dejar espacio para contextos largos. Útil para investigación y prototipado en Apple Silicon.
- Servidor compatible con OpenAI en local: el script de arranque levanta un servidor compatible con la API de OpenAI en el puerto 8080, lo que permite integrar el modelo en aplicaciones existentes que ya consumen esa interfaz sin cambiar el código cliente.
- Evaluación de técnicas de cuantización: investigadores que comparan TCQ frente a SeedLM pueden usar este paquete junto con TCQ4, TCQ3, P4 y P3 para medir el impacto de la compresión en la divergencia KL y en la velocidad de decodificación.
- Prototipado de aplicaciones multimodal imagen-texto: al declarar el pipeline image-text-to-text, el modelo puede emplearse en experimentos de descripción de imágenes o diálogo sobre imágenes, siempre con validación previa de calidad.
- Pruebas de throughput en hardware de consumo: con 38 tokens por segundo en una RTX 4080 y 36 tras un prompt de 30.000 tokens, sirve para caracterizar el rendimiento de MoE cuantizados en GPUs de gama alta de consumo.
- Investigación sobre decodificación y caché de expertos: la dependencia de la caché de páginas para la tabla PLE y del cacheo de expertos en VRAM lo convierte en un banco de pruebas para estudiar el equilibrio entre memoria y latencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Divergencia KL vs BF16 (wikitext-2, 64 ventanas de 2.048 tokens) | 0,0638 |
| Bits por peso de experto | 3,458 |
| Decodificacion en RTX 4080 (16 GB) | 38,0 tokens/s |
| Decodificacion tras prompt de 30.000 tokens | 36,0 tokens/s |
| Decodificacion en RTX 4080 limitada a 12 GB (referencia TCQ3) | 27 tokens/s |
| Decodificacion en M4 Max (TCQ4 vs P3) | ~15% mas lenta que P3 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 16 GB de GPU para el paquete TCQ3-D4; los expertos (52,2 GB) permanecen en RAM y la GPU cachea los expertos en uso.
- RAM del sistema: 96-128 GB en PC; 96 GB en Mac con memoria unificada.
- GPU recomendadas: RTX 4080 (16 GB) validada por el autor; GPUs de 24 GB o más para el paquete TCQ4; una RTX 4080 limitada a 12 GB funciona con TCQ3 a 27 tokens/s.
- Cabe en GPU de consumo: sí, en GPUs de 16 GB o más siempre que el sistema tenga RAM suficiente; no cabe en equipos con menos de 64 GB de RAM según el autor.
- Opciones de despliegue: NanoSeedLM engines (CUDA en Linux y Windows, Metal en macOS), mlx-vlm con Trust Remote Code, oMLX con el parche jundot/omlx#5112.
- Latencia y throughput: 38 tokens/s en RTX 4080; 36 tokens/s con contexto de 30.000 tokens; aproximadamente un 15% más lento que P3 en M4 Max.
- Espacio en disco: 117,2 GB de descarga; el repo completo ocupa 205,9 GB.

## Comparativa con modelos similares

| Paquete | Expertos | Bits | Memoria (GB) | KL | Descarga (GB) | Pesos densos |
|---|---|---|---|---|---|---|
| TCQ4 | Trellis K4 | 4,125 | 70 | 0,0415 | 127,5 | 8 bits |
| TCQ3-D4 (este) | Trellis K3, down K4 | 3,458 | 60 | 0,0638 | 117,2 | 8 bits |
| TCQ3 | Trellis K3 | 3,125 | 55 | 0,0778 | 112,1 | 8 bits |
| P4 | Seeds P4 | 4,500 | 74 | 0,169 | 131,3 | 4 bits |
| P3 | Seeds P3 | 4,000 | 66 | 0,182 | 123,8 | 4 bits |

Los cinco paquetes son el mismo modelo base, Qwen3.8-Flash-Next, y se diferencian en el método de compresión de expertos, el tamaño de los pesos densos y los runtimes compatibles. No se dispone de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Vista previa de investigación: el autor la etiqueta como research-preview y depende de motores y parches concretos; no es un artefacto listo para producción sin validación.
- Licencia qwen-community-1.0: impone restricciones que deben revisarse antes de cualquier uso comercial; el enlace a la licencia está en el repositorio del modelo base.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe sin evaluación propia.
- Contexto máximo no documentado: aunque el autor menciona prompts de 30.000 tokens, no se especifica la ventana máxima oficial.
- Pérdida de calidad por cuantización: la divergencia KL de 0,0638 frente a BF16 implica degradación medible respecto al modelo original, superior a la de TCQ4 (0,0415).
- Dependencia de la RAM del sistema: los expertos deben caber en RAM; con menos de 64 GB el modelo no es viable según el autor.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse empíricamente antes de desplegar.
- Compatibilidad limitada de runtimes: requiere NanoSeedLM engines, mlx-vlm con Trust Remote Code u oMLX con el parche indicado; otros frameworks no están soportados.
- La tabla PLE reside en disco y depende de la caché de páginas, lo que puede afectar a la latencia en sistemas con poca memoria o almacenamiento lento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3-D4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Releases del motor: https://github.com/mbarnson/NanoSeedLM/releases
- Parche oMLX: https://github.com/jundot/omlx/pull/5112
- Paquete TCQ4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4
- Paquete TCQ3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3
- Paquete P4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4
- Paquete P3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P3
- Paper referenciado (arXiv:2410.10714): https://arxiv.org/abs/2410.10714
- Paper referenciado (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
