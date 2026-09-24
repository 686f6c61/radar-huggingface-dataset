# turtle0001/mare_bot_gguf

## Resumen

mare_bot_gguf es una conversión al formato GGUF del modelo Qwen3.5-9B-Base, publicada por el usuario turtle0001 (Marekoth) en Hugging Face. Se trata, por tanto, de un artefacto de cuantización y empaquetado, no de un modelo entrenado desde cero: el repositorio distribuye pesos derivados de un checkpoint base de la familia Qwen3.5, con 8.953.803.264 parámetros totales (aproximadamente 8,95 mil millones) y un tamaño de repositorio de 6,6 GB. La conversión se realizó con las herramientas de Unsloth, según indica la propia model card.

El interés del repositorio es doble. Por un lado, incluye un fichero de proyector multimodal (`mmproj`) además de los pesos del modelo de lenguaje, lo que confirma que el checkpoint subyacente es un modelo de visión-lenguaje y permite ejecutarlo con el binario `llama-mtmd-cli` de llama.cpp, es decir, con entrada de imágenes en local. Por otro, al estar en GGUF, el modelo se puede ejecutar en hardware de consumo mediante llama.cpp, Ollama o LM Studio, sin necesidad de GPUs de centro de datos.

La relevancia actual del repositorio es limitada pero concreta: es un ejemplo temprano de cuantización comunitaria de la generación Qwen3.5 en su variante base, útil para quien quiera evaluar o ajustar ese checkpoint en local. Conviene señalar que el repositorio tiene 0 descargas y 0 likes, fechas de creación y actualización del 24 de septiembre de 2026, y que no publica licencia, idiomas soportados, longitud de contexto ni resultados de evaluación. La model card es mínima (instrucciones de uso y lista de ficheros) y no documenta el proceso de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible explícitamente; el nombre de los ficheros indica que deriva de Qwen3.5-9B-Base (transformer denso de la familia Qwen, con torre de visión según el tag `vision-language-model`) |
| Parámetros totales | 8.953.803.264 (≈8,95 B), dato de safetensors del checkpoint asociado |
| Parámetros activos | No aplica; no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF BF16 (fichero de proyector multimodal) y GGUF Q4_K_M (pesos del modelo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (ni en los metadatos de Hugging Face ni en la model card) |
| Formato de pesos | GGUF (llama.cpp): `Qwen3.5-9B-Base.BF16-mmproj.gguf` y `Qwen3.5-9B-Base.Q4_K_M.gguf` |
| Tamaño del repositorio | 6,6 GB |
| Fecha de creación | 24 de septiembre de 2026 |
| Última actualización | 24 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento en la documentación proporcionada. La model card del repositorio se limita a indicar que el modelo se convirtió a GGUF con Unsloth, sin describir el corpus, el número de tokens, la composición del dataset ni si hubo etapas de ajuste por instrucciones (SFT), preferencias (RLHF/DPO) o refuerzo. El nombre del fichero (`Qwen3.5-9B-Base`) apunta a un checkpoint base, es decir, sin alineación conversacional, aunque esto no puede confirmarse con los datos disponibles.

Lo único verificable a nivel arquitectónico es lo que se deduce del propio empaquetado: existe un fichero `BF16-mmproj.gguf`, que es el proyector que conecta un codificador visual con el modelo de lenguaje, y un fichero de pesos `Q4_K_M.gguf`, cuantizado a 4 bits con la receta K-quant media de llama.cpp. Esa combinación implica una arquitectura multimodal del tipo transformer con torre de visión más adaptador, ejecutable con `llama-mtmd-cli`. No se documentan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, atención híbrida) ni detalles del tokenizador.

## Capacidades

- Generación de texto autoregresiva a partir de un checkpoint base de 8,95 B de parámetros.
- Procesamiento de imágenes: la presencia del fichero `mmproj` y el binario `llama-mtmd-cli` en la model card indican soporte de entrada visual (visión-lenguaje).
- Ejecución local íntegra mediante llama.cpp, sin dependencia de servicios en la nube.
- Compatibilidad con plantillas de chat Jinja a través del flag `--jinja` de `llama-cli`.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`), lo que sugiere que puede servirse desde infraestructura de inferencia compatible con llama.cpp.
- Soporte de tool calling / function calling: no documentado explícitamente; dependería de la plantilla de chat del modelo original y de la versión de llama.cpp.
- Comportamiento como agente o razonamiento multi-paso: no documentado; al ser un checkpoint base, no cabe esperar un modo de razonamiento o *thinking* entrenado.
- Capacidades multilingües: no disponibles.
- Capacidades de audio o vídeo: no disponibles.
- Ajuste fino adicional: al ser un checkpoint base, es apto como punto de partida para entrenamiento específico de dominio.

## Casos de uso

- Ajuste fino de dominio sobre un checkpoint base: al tratarse de la variante Base, el modelo es adecuado para *fine-tuning* supervisado con datos propios (por ejemplo, clasificación o extracción en un sector concreto) antes de desplegarlo; partir de un base evita arrastrar sesgos de alineación conversacional de una variante instruct.
- Generación de texto alternativo y descripciones de imágenes a gran escala: gracias al proyector multimodal, se puede ejecutar un pipeline local que recorra un repositorio de imágenes y genere descripciones para accesibilidad o indexación, con la ventaja de no enviar contenido a terceros.
- Extracción de información de documentos escaneados: combinando la entrada visual con generación de texto, el modelo puede transcribir y estructurar campos de facturas, albaranes o formularios en un flujo por lotes ejecutado con `llama-mtmd-cli`.
- Clasificación y enrutado de tickets con captura adjunta: en un sistema de soporte, el modelo puede leer la captura de pantalla enviada por el usuario y producir una categoría o un resumen que alimente el enrutador; al correr en local con Q4_K_M, el coste marginal por inferencia es el de la electricidad.
- Prototipado en entornos aislados o sin conectividad: el formato GGUF permite desplegar el modelo en máquinas *air-gapped* (laboratorios, plantas industriales, entornos sanitarios) donde no está permitido llamar a APIs externas.
- Evaluación comparativa de cuantizaciones: investigadores que midan la pérdida de calidad entre BF16 y Q4_K_M pueden usar este repositorio como caso de estudio, comparando salidas de texto y de visión entre ambas configuraciones.
- Base para derivados comunitarios: otros usuarios pueden tomar estos GGUF como punto de partida para sus propias cuantizaciones (Q5_K_M, Q8_0, IQ4_XS) o para fusiones, dado que el formato GGUF es el estándar de facto del ecosistema llama.cpp.
- Servicio HTTP interno: con `llama-server` y el flag `--jinja` se puede exponer el modelo como endpoint compatible con la API de OpenAI dentro de una red corporativa, útil para equipos que quieran un servicio de visión-lenguaje interno sin depender de proveedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y no se han encontrado evaluaciones independientes del repositorio en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_K_M: en torno a 6-7 GB para los pesos del modelo de lenguaje (≈5,4 GB teóricos a 4 bits y medio para 8,95 B de parámetros) más aproximadamente 1-2 GB del proyector multimodal en BF16, más la caché KV correspondiente a la longitud de contexto utilizada. En la práctica, entre 8 y 12 GB según contexto.
- VRAM estimada para BF16: alrededor de 18 GB solo para los pesos del modelo (2 bytes por parámetro), más el proyector y la caché KV. Requiere GPUs de gama profesional o de 24 GB con contexto corto.
- GPUs de consumo compatibles con Q4_K_M: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080/4090 24 GB, así como equipos con memoria unificada (Apple Silicon de 16 GB o más). Cabe en una única GPU de 12 GB si se limita el contexto.
- GPUs de consumo compatibles con BF16: solo modelos de 24 GB (RTX 3090, 4090) con contexto reducido; en la práctica es más cómodo en A100 40 GB, L40S o H100.
- Ejecución solo con CPU: viable con Q4_K_M en equipos con 16 GB de RAM o más, con velocidades de generación de un dígito de tokens por segundo, insuficientes para uso interactivo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), Ollama, LM Studio, Jan, llama-cpp-python. El soporte de GGUF multimodal en vLLM y TGI es limitado o inexistente en el momento de redactar esta ficha, por lo que la vía recomendada para visión es llama.cpp.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

Los datos de la columna de mare_bot_gguf proceden de la información del repositorio; los de las alternativas son especificaciones públicas de sus respectivos modelos originales (no de este repositorio) y conviene verificarlos antes de tomar decisiones. Se comparan alternativas de tamaño similar o de la misma categoría (visión-lenguaje de ~8-12 B en GGUF).

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mare_bot_gguf (Qwen3.5-9B-Base, GGUF) | 8,95 B | No disponible | Texto + visión | No disponible | Hugging Face, 0 descargas |
| Qwen2.5-VL-7B-Instruct (GGUF de terceros) | ≈8,3 B | 128 K (según documentación pública) | Texto + visión | Apache 2.0 (según documentación pública) | Ampliamente distribuido en GGUF |
| Llama-3.1-8B-Instruct (GGUF de terceros) | ≈8,03 B | 128 K (según documentación pública) | Solo texto | Llama 3.1 Community License | Muy extendido, con ecosistema de cuantizaciones |
| Gemma-3-12B-IT (GGUF de terceros) | ≈12 B | 128 K (según documentación pública) | Texto + visión | Términos de uso de Gemma | Disponible en GGUF |

Diferencias clave: a diferencia del checkpoint aquí empaquetado, Qwen2.5-VL-7B-Instruct y Gemma-3-12B-IT se distribuyen en variantes ajustadas por instrucciones y con licencias publicadas y verificables, lo que simplifica su uso comercial. El principal hándicap de mare_bot_gguf no es técnico, sino de trazabilidad: no publica licencia, no documenta idiomas ni contexto, y no cuenta con ninguna descarga ni evaluación.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido. Al derivar de un modelo de la familia Qwen, la licencia aplicable sería, como mínimo, la del checkpoint original, que el autor no reproduce ni referencia en la model card.
- Ausencia de alineación confirmada: el nombre del fichero indica variante Base. Si se confirma, el modelo no está ajustado para seguir instrucciones ni para mantener formato conversacional, por lo que su comportamiento en un chat será errático sin un ajuste previo.
- Riesgo de alucinación: sin datos de entrenamiento ni evaluaciones publicadas, no hay forma de acotar la tasa de invención de hechos, especialmente en tareas de OCR y descripción de imágenes, donde los modelos de visión tienden a inventar detalles ausentes.
- Sin evaluación publicada: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad; no hay terceros que hayan reportado calidad, estabilidad o regresiones.
- Idiomas no documentados: no se puede asumir un buen rendimiento en castellano ni en otras lenguas; habría que verificarlo empíricamente.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos y dificulta dimensionar la caché KV en despliegue.
- Inconsistencia de tamaños: el repositorio declara 6,6 GB, mientras que un GGUF completo en BF16 de 8,95 B de parámetros ocuparía del orden de 18 GB. Es probable que el fichero BF16 de pesos no esté subido o se haya subido parcialmente; conviene verificar qué ficheros son realmente descargables antes de planificar el despliegue.
- Soporte de tool calling y de agentes no documentado: no debe asumirse sin pruebas, y menos aún en una variante base.
- Madurez del ecosistema: el soporte de GGUF multimodal está concentrado en llama.cpp; vLLM y TGI no cubren bien este caso, lo que limita las opciones de escalado a producción.
- Fechas de creación y actualización poco habituales (septiembre de 2026) y metadatos incompletos, lo que dificulta evaluar la vigencia del checkpoint frente a versiones más recientes de la familia.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/turtle0001/mare_bot_gguf
- Perfil del autor: https://huggingface.co/turtle0001
- Unsloth (herramienta de conversión citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (runtime referenciado por los comandos de la model card): https://github.com/ggml-org/llama.cpp
- Organización GGUF-Models en Hugging Face: https://huggingface.co/GGUF-Models
- GGUF Model Discovery: https://local-ai-zone.github.io/
- GGUF Loader (repositorio de la comunidad): https://github.com/GGUFloader/gguf-loader
- Hugging Bay: https://huggingbay.xyz/
