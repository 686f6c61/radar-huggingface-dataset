# swbiggart/DeepSeek-V4.1-Flash-1017-TensorFold-Metal-Lossless

## Resumen
DeepSeek-V4.1-Flash-1017-TensorFold-Metal-Lossless es un repack del checkpoint oficial `deepseek-ai/DeepSeek-V4.1-Flash-1017` de DeepSeek AI, preparado por Scott Biggart (swbiggart) para servir el modelo en Macs con Apple Silicon de 512 GB de memoria unificada mediante Metal 4.1 y su stack TensorFold v1.3.3. No es un modelo nuevo ni un fine-tuning: es una copia bit a bit (lossless) de los pesos originales, reorganizada en shards alineados a página (16 KiB) y offsets de tensor alineados a 128 bytes para permitir `mmap` de copia cero en Metal.

El modelo base es un transformer multimodal (pipeline `image-text-to-text`) de 566.591.466.194 parámetros (~566,6 mil millones), con 40 capas de backbone, tres etapas de decodificación especulativa DSpark/MTP, un encoder de visión de 266 tensores y tablas Engram preempaquetadas (DSV41EN1) en las capas 1 y 14. El repack conserva FP8 compacto en `wo_a`, escalas densas 32×32 y expertos enrutados MXFP4, sin cuantización adicional.

Su relevancia es práctica: servir el checkpoint original requiere unos 715 GB de SSD en pico durante descarga, empaquetado Engram y repack; este repositorio entrega los artefactos ya verificados (~510,3 GB) para descargar una vez y arrancar un servidor compatible con la API de OpenAI en un M5 Ultra de 512 GB. La licencia es MIT y el repo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con 40 capas de backbone, 3 etapas MTP/DSpark de decodificación especulativa, encoder de visión y tablas Engram (DSV41EN1) en capas 1 y 14 |
| Parametros totales | 566.591.466.194 (~566,6 mil millones) |
| Parametros activos | no disponible (no se confirma si el modelo base es MoE; la model card menciona "expertos enrutados MXFP4") |
| Longitud de contexto | no disponible (la model card cita un prompt de 32.768 tokens como prueba de rendimiento, no como límite) |
| Tipos de cuantizacion | Pesos originales sin recuantizar: FP8 compacto en `wo_a`, escalas densas 32×32, expertos MXFP4; tag `8-bit` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (96.081 tensores, 45 shards), más tablas Engram binarias `.bin` y token map en `assets/` |

## Arquitectura y entrenamiento
La arquitectura corresponde al modelo base de DeepSeek AI: un transformer de 40 capas con cabezal de lenguaje, encoder de visión y aligner (266 tensores), y tres etapas de drafting especulativo DSpark (`mtp.0..2`). Incorpora tablas Engram en las capas 1 y 14, que TensorFold sirve con streaming solapado desde RAM de host (capa 1) y SSD (capa 14). El repack no modifica ningún peso: los 96.081 tensores retenidos se copian byte a byte desde el commit fijado `08c8657f02291e11b6f6b63e0e16014f8e748518`, incluyendo FP8 `wo_a`, escalas 32×32 y expertos MXFP4.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que la model card del repack no los detalla. La innovación técnica del repositorio es de despliegue, no de entrenamiento: sharding por consumidor (`model-top`, `model-layer-00..39`, `model-mtp-0..2`, `model-vision`), cabeceras alineadas a 16 KiB, offsets a 128 bytes (reduce las arenas de pesos copiadas de 7.789 MiB a 1.567 MiB), tablas Engram preempaquetadas (188,83 GiB) y un token map precalculado verificado contra `tokenizer.json` y `config.json`. Se omiten los cuatro tensores crudos `.engram.embed.*` redundantes, lo que ahorra unos 203 GB.

## Capacidades
- Generación de texto conversacional multi-turno con plantilla de chat (`chat_template.jinja`) y servidor compatible con la API de OpenAI.
- Razonamiento y generación de código: la model card demuestra tareas de Python (generadores, merge de iteradores ordenados) y workloads aritméticos como `multiply-17-23`.
- Procesamiento de imagen y texto (`image-text-to-text`) mediante el encoder de visión incluido.
- Decodificación especulativa con tres etapas DSpark/MTP, con paridad exacta de token IDs frente a decodificación serial.
- Muestreo configurable: greedy, filtrado (`T=0.8, k=20, p=0.95`) y núcleo puro (`T=0.8, k=0, p=0.95`).
- Streaming de tablas Engram desde RAM de host y SSD con solapamiento por capas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso
- Inferencia local de gran escala en estación de trabajo Apple: un estudio con un M5 Ultra de 512 GB puede servir el modelo con `python -m mac up` y consumirlo por HTTP en `127.0.0.1:8890/v1` sin depender de la nube, gracias al layout `mmap` de copia cero.
- Generación de código asistida en local: el modelo resuelve tareas de Python y el servidor expone un endpoint compatible con OpenAI, lo que permite conectarlo a extensiones de editor o scripts CLI (`python -m mac chat ... --max-tokens 128`).
- Procesamiento de documentos con imagen y texto: al incluir encoder de visión y aligner, puede emplearse en pipelines de extracción o descripción de contenido visual combinado con instrucciones textuales.
- Evaluación y reproducibilidad de investigación: al ser un repack bit a bit con manifiestos SHA-256 y validación (`python -m mac validate`), sirve para reproducir resultados del checkpoint oficial sin depender de la disponibilidad del repo upstream.
- Pruebas de decodificación especulativa: con DSpark y los perfiles medidos (97,06 tok/s greedy adaptativo frente a 52,84 tok/s sin drafts), es un banco de pruebas para estudiar aceleración especulativa con paridad exacta de tokens.
- Prototipado de asistentes conversacionales de contexto largo: la prueba con un prompt Python de 32.768 tokens (TTFT de 8,78 s, prefill de 3.733 tok/s) indica viabilidad para conversaciones o análisis de código extensos en local.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye métricas de serving medidas en un Apple M5 Ultra de 80 núcleos con 512 GB y Metal 4.1:

| Carga de trabajo | Medido | Notas |
|---|---:|---|
| Decodificación greedy (7 workloads, DSpark adaptativo) | 97,06 tok/s | Pico de 133,1 tok/s (`multiply-17-23`); 804/804 token IDs exactos y 7/7 motivos de fin idénticos frente a serial (1,84×) |
| Decodificación greedy (`--no-drafts`) | 52,84 tok/s | Control serial con la misma aritmética objetivo |
| Muestreo filtrado (`T=0.8, k=20, p=0.95`) | 116,3 / 92,8 tok/s | Código / chat; 2,19× / 1,76× frente a serial, 100 % token IDs exactos |
| Núcleo puro (`T=0.8, k=0, p=0.95`) | 97,0 / 78,2 tok/s | Código / chat; 2,81× / 2,28× frente a serial (34,5 / 34,3 tok/s), 100 % exactos |
| Prompt Python de 32.768 tokens (TTFT / decode) | 8,78 s (3.733 tok/s) / 119,2 tok/s | Prefill 2,47× más rápido (−12,91 s) que la referencia serial |

## Requisitos de hardware
- Memoria unificada: 512 GB en Apple Silicon (M5 Ultra); el layout `mmap` ocupa 286,42 GiB en 45 shards y las tablas Engram suman 188,83 GiB adicionales.
- Almacenamiento: ~510,3 GB para el repo completo; el flujo original requería ~715 GB de pico en SSD.
- Sistema: macOS 27 o superior con Metal 4.1, Python 3.12, Git y Xcode command-line tools.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este repack; el layout está pensado para Metal y `mmap` en memoria unificada. No cabe en GPUs de consumo.
- Despliegue: stack propietario `swbiggart/ds41-1017-studio` (TensorFold v1.3.3 + parches Metal 4.1), con servidor compatible con OpenAI en el puerto 8890; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: ver tabla de benchmarks (hasta 133,1 tok/s en greedy y 3.733 tok/s de prefill en un prompt de 32.768 tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-TensorFold-Metal-Lossless | 566,6 mil M | no disponible | MIT | Repo de 510,3 GB, 0 descargas | Repack lossless para Apple Silicon de 512 GB |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 566,6 mil M | no disponible | MIT | Checkpoint oficial upstream | Requiere ~715 GB de pico en SSD para servir en local |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de modelos comparables |

## Limitaciones y advertencias
- No es un modelo nuevo: cualquier limitación del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash-1017` (sesgos, alucinación, cobertura idiomática) se hereda sin cambios, y la información disponible no detalla sesgos conocidos.
- Requisito de hardware extremo: solo viable en Apple Silicon con 512 GB de memoria unificada y macOS 27+ con Metal 4.1; no hay soporte documentado para CUDA ni GPUs de consumo.
- Dependencia de un stack no estándar: el serving depende de `swbiggart/ds41-1017-studio` (TensorFold v1.3.3 y parches Metal), no de vLLM, llama.cpp, Ollama o TGI.
- Las métricas de rendimiento proceden de un único equipo (M5 Ultra de 80 núcleos) y de la propia model card; no hay validación independiente.
- El repo no registra descargas ni likes, por lo que la verificación comunitaria es nula en el momento de la consulta; conviene validar los SHA-256 con `python -m mac validate`.
- Idiomas soportados, longitud de contexto y comportamiento de tool calling no están documentados; no deben asumirse en producción.
- Licencia MIT: permite uso comercial, pero el aviso de copyright y la licencia deben conservarse; el contenido de visión y Engram procede del upstream bajo la misma licencia.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/swbiggart/DeepSeek-V4.1-Flash-1017-TensorFold-Metal-Lossless
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Commit fijado del upstream: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/tree/08c8657f02291e11b6f6b63e0e16014f8e748518
- Stack de serving: https://github.com/swbiggart/ds41-1017-studio
- Perfil del autor en X: https://x.com/woolsey
