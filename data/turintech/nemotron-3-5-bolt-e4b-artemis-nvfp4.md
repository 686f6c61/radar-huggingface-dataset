# turintech/Nemotron-3.5-Bolt-E4B-Artemis-NVFP4

## Resumen

Nemotron-3.5-Bolt-E4B-Artemis-NVFP4 es una cuantización en formato NVFP4 (punto flotante de 4 bits con escalado por bloques, optimizado para las GPU Blackwell de NVIDIA) del modelo NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por TurinTech bajo su línea de herramientas Artemis. El modelo base lo desarrolla NVIDIA y es un modelo multimodal de tipo image-text-to-text, con torres de visión y audio además del modelo de lenguaje; esta versión conserva esas torres y cuantiza únicamente los pesos MLP del modelo de lenguaje, dejando atención, embeddings y el resto de tensores sin modificar respecto al checkpoint original.

El resultado son 11,24 GB de pesos (9,70 GiB en memoria de vLLM) frente a los 15,99 GB del BF16 original, con un aumento de velocidad de generación de 139 a 202 tokens por segundo en una sola petición sobre una RTX 5090, y de 844 a 1321 tokens por segundo con 8 peticiones concurrentes. La calidad se mantiene cercana al original: la divergencia KL de chat es de 0,063 frente al BF16, y las pruebas de tool calling (BFCL-v3) y GSM8K quedan a la altura del original según el autor.

Su relevancia práctica está en que permite desplegar un modelo de casi 8.000 millones de parámetros con visión y audio en GPUs de 16 GB y en dispositivos Blackwell como el DGX Spark, usando vLLM y el parser de tool calls nativo. La licencia es OpenMDW-1.1, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torres de visión y audio; pesos MLP del modelo de lenguaje cuantizados en NVFP4, resto de tensores sin cuantizar |
| Parametros totales | 7.996.156.490 (aproximadamente 8.000 millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens probados en BFCL-v3; 4.096 tokens en el resto de pruebas; límite máximo no disponible |
| Tipos de cuantizacion | NVFP4 (MLP del modelo de lenguaje); existe también una variante FP8 del mismo autor y una variante GGUF |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (repartidos en attn.safetensors, core.safetensors, mlp.safetensors, model-frozen-shared-kv.safetensors); compatible con compressed-tensors y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de NVIDIA que combina un modelo de lenguaje con torres de visión y audio, orientado a generación de texto, conversación y tool calling. TurinTech no reentrena ni modifica la arquitectura: parte del checkpoint BF16 de NVIDIA, repaqueta los tensores de atención (1,17 GB), los tensores "core" (8,10 GB) y el fichero de KV compartido congelado (110 MB) sin cambios, y cuantiza en NVFP4 los pesos MLP del modelo de lenguaje (1,86 GB). El formato NVFP4 usa bloques de cuantización de pequeño tamaño con escalas en FP8, lo que reduce el error respecto a esquemas de 4 bits más gruesos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La innovación destacable de esta publicación es la estrategia de cuantización selectiva (solo MLP) y el soporte de decodificación especulativa mediante el drafter DFlash que NVIDIA publica por separado (Nemotron-3.5-Bolt-E4B-DFlash-BF16.gguf, 737 MB), que propone tokens candidatos para que el modelo principal los verifique.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat propia (chat_template.jinja).
- Razonamiento con modo "thinking" conmutable mediante `chat_template_kwargs: {"enable_thinking": false}`; todas las métricas publicadas se midieron con thinking desactivado.
- Tool calling y function calling nativo, con parser `gemma4` en vLLM y soporte de `--enable-auto-tool-choice`; las llamadas se devuelven en `choices[0].message.tool_calls`.
- Procesamiento de imágenes (pipeline image-text-to-text); para activarlo hay que omitir `--language-model-only` en vLLM.
- Procesamiento de audio, que requiere `pip install "vllm[audio]"` y también omitir `--language-model-only`.
- Capacidades multilingües: no disponible en la información proporcionada.
- Razonamiento matemático de nivel GSM8K, según las pruebas del autor.

## Casos de uso

- Asistentes conversacionales con contexto largo: con 65.536 tokens probados en BFCL-v3 y 4.096 en el resto de pruebas, el modelo puede mantener conversaciones multi-turno con historial extenso en una GPU de 16 GB gracias a sus 9,70 GiB de pesos en memoria.
- Agentes con tool calling en producción: el soporte nativo de `--enable-auto-tool-choice` con parser `gemma4` permite integrarlo en orquestadores de agentes que necesiten invocar APIs, consultar bases de datos o ejecutar funciones, con la advertencia de que en BFCL-v3 queda 1,6 puntos por debajo del original.
- Despliegue en hardware Blackwell de gama media: pensado para RTX 5090 y DGX Spark, permite servir un modelo multimodal de 8.000 millones de parámetros en 11,24 GB de pesos, algo inviable con el BF16 de 15,99 GB en tarjetas de 16 GB.
- Procesamiento de documentos con imágenes: al conservar la torre de visión, puede extraer y resumir información de capturas, formularios o diagramas en pipelines de digitalización.
- Transcripción y análisis de audio: con la torre de audio habilitada, sirve para resumir reuniones o clasificar llamadas, siempre que el entorno vLLM incluya el extra de audio.
- Servicio de chat de alta concurrencia: con 1321 tokens/s a 8 peticiones concurrentes en una RTX 5090, es adecuado para endpoints con varios usuarios simultáneos donde el coste por token importa.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de NVFP4 frente a FP8 y BF16 en calidad (KL) y throughput dentro de un mismo modelo.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en una NVIDIA RTX 5090 con vLLM 0.32.0rc1 y thinking desactivado:

| Modelo | Tamano | KL chat (menor es mejor) | Generacion, 1 peticion (tok/s) | Generacion, 8 peticiones (tok/s) |
|---|---|---|---|---|
| TurinTech NVFP4 | 11,24 GB | 0,063 | 202 | 1321 |
| caelunshun NVFP4 | 9,61 GB | 0,194 | 193 | 1366 |
| TurinTech FP8 | 12,69 GB | 0,010 | 183 | 1206 |
| BF16 original | 15,99 GB | referencia | 139 | 844 |

El KL de la variante de caelunshun es un límite inferior, ya que su build es solo texto con caché KV en FP8, algo que la medición de KL no emula. En BFCL-v3 (contexto de 65.536 tokens) esta versión queda 1,6 puntos por debajo del original en tool calling multi-turno, y el autor indica que tool calls y GSM8K están a la altura del original. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: 9,70 GiB de pesos en vLLM; con caché KV y activaciones, el autor indica que funciona en una GPU de 16 GB añadiendo `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048` (no probado en tarjeta de 16 GB).
- GPU recomendadas: Blackwell, incluida la RTX 5090 y el DGX Spark; el formato NVFP4 está optimizado para esa generación.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) de forma holgada y en tarjetas de 16 GB con los ajustes indicados; en GPUs sin soporte NVFP4 nativo el rendimiento puede degradarse.
- Opciones de despliegue: vLLM (probado con 0.32.0rc1 y 0.31.0 en DGX Spark) mediante `vllm serve`; existe una variante GGUF del mismo autor para llama.cpp.
- Latencia y throughput: 202 tok/s con una petición y 1321 tok/s con 8 peticiones en RTX 5090; el BF16 original rinde 139 y 844 tok/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TurinTech NVFP4 (este) | ~8.000 M | 65.536 probados | safetensors NVFP4 | OpenMDW-1.1 | Vision y audio incluidos; 11,24 GB |
| caelunshun NVFP4 | ~8.000 M | no disponible | safetensors NVFP4 | no disponible | Solo texto, caché KV FP8; 9,61 GB; mejor throughput a 8 peticiones (1366 tok/s) |
| TurinTech FP8 | ~8.000 M | no disponible | safetensors FP8 | OpenMDW-1.1 | Mejor fidelidad (KL 0,010); 12,69 GB; 183 tok/s |
| NVIDIA BF16 original | ~8.000 M | no disponible | safetensors BF16 | OpenMDW-1.1 | Referencia de calidad; 15,99 GB; 139 tok/s |

## Limitaciones y advertencias

- El tool calling multi-turno en BFCL-v3 queda 1,6 puntos por debajo del original; si los flujos de agentes son críticos, conviene evaluar el checkpoint BF16 o FP8.
- La fidelidad de la cuantización es menor que la de la variante FP8 del mismo autor: KL de 0,063 frente a 0,010, es decir, entre 5 y 6,1 veces peor.
- El formato NVFP4 está pensado para Blackwell; en GPUs anteriores el soporte y el rendimiento pueden no estar garantizados.
- El autor advierte que el funcionamiento en GPUs de 16 GB es esperado pero no probado, y que hay que bajar `--gpu-memory-utilization` si la GPU también alimenta una pantalla.
- Las torres de visión y audio requieren omitir `--language-model-only`; el audio necesita además el extra `vllm[audio]`. El drafter DFlash para decodificación especulativa no está incluido en este repositorio.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base en la documentación proporcionada.
- La licencia OpenMDW-1.1 impone sus propios términos; conviene revisar el enlace de licencia antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de los resultados publicados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Variante GGUF del mismo autor: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-GGUF
- Resultados completos y método (RESULTS.md): https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-NVFP4/blob/main/RESULTS.md
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- TurinTech en Hugging Face: https://huggingface.co/turintech
- TurinTech: https://www.turintech.ai
- TurinTech en LinkedIn: https://www.linkedin.com/company/turintechai
