# wardner/Qwen3-VL-4B

## Resumen

Qwen3-VL-4B es un modelo de lenguaje y visión (VLM) de 4 mil millones de parámetros desarrollado originalmente por el equipo Qwen de Alibaba. Esta ficha concreta, publicada por el usuario wardner, no contiene los pesos originales en safetensors, sino un paquete de despliegue específico para hardware edge: grafos RKNN y pesos convertidos para la tarjeta de cómputo RK182x de Rockchip, junto con el manifiesto de worker `qwen3-vl-4b.json` que lo integra en la interfaz web wdnwebui.

El modelo resuelve el problema de ejecutar un VLM multimodal en plataformas embebidas con aceleración NPU, un escenario donde los formatos estándar (safetensors, GGUF genérico) no son directamente utilizables. La distribución incluye tablas de embeddings en fp16, tokenizador en GGUF (BPE estilo GPT-2 con ByteLevel), y grafos separados para el modelo de lenguaje y para el codificador visual en dos resoluciones (384x384 y 768x768).

Es relevante ahora porque demuestra un patrón de empaquetado reproducible para IA en el borde: los artefactos están pensados para ejecutarse sobre un host RK3588 con runtime RKLLM + RKNN, con una estimación de memoria de aproximadamente 3500 MB y un tiempo de inicialización de unos 60 segundos. La licencia Apache 2.0 del modelo original se mantiene, aunque los archivos aquí presentes son derivados convertidos, no pesos upstream sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (modelo de lenguaje + codificador visual) convertido a grafos RKNN; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | 4B (según el nombre del modelo y el modelo base Qwen3-VL-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los artefactos incluyen embeddings en fp16 y pesos empaquetados para RKNN |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen3-VL es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (grafos `.rknn`) + pesos `.weight` + embeddings `.embed.bin` (fp16) + tokenizador `.tokenizer.gguf` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. Lo que sí detalla es la topología del paquete de despliegue: un grafo RKNN para el modelo de lenguaje (`llm_Qwen3-VL-4B.1828.rknn`, 24,3 MB) emparejado con un archivo de pesos de 2319,7 MB, y dos grafos RKNN para el codificador visual, uno a resolución 384x384 (4,1 MB de grafo, 233,6 MB de pesos) y otro a 768x768 (10,1 MB de grafo, 240,3 MB de pesos). La tabla de embeddings va en fp16 con 741,9 MB, y el tokenizador en GGUF ocupa 5,7 MB.

El destino de cómputo es la tarjeta RK182x (generación de 1,82 TOPS) sobre un host RK3588, con runtime RKLLM + RKNN. No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO. Tampoco se documentan innovaciones técnicas del modelo original más allá de lo que implica el propio pipeline de conversión a RKNN para NPU.

## Capacidades

- Generación de texto y conversación multimodal: la capacidad declarada en el manifiesto es `swcap_vision_chat`, es decir, chat con entrada de imagen.
- Descripción de vídeo y contenido visual: la model card se titula "视频描述模型" (modelo de descripción de vídeo) y menciona descripción visual v3.
- Procesamiento de imágenes en dos resoluciones nativas: 384x384 y 768x768, mediante grafos de visión separados.
- Integración con tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no detalladas para este paquete; el modelo base Qwen3-VL es multilingüe, pero la model card no especifica idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Descripción automática de vídeo en dispositivos edge: el paquete está diseñado explícitamente como modelo de descripción de vídeo sobre RK182x, de modo que se puede ejecutar localmente en un host RK3588 sin depender de la nube, procesando fotogramas a 384x384 o 768x768 según el detalle requerido.
- Vigilancia y análisis visual en el borde: con ~3500 MB de memoria estimada, cabe en un dispositivo embebido y permite generar descripciones textuales de imágenes de cámaras IP en tiempo casi real, sin enviar vídeo fuera de la red local.
- Asistentes de accesibilidad: un dispositivo con NPU Rockchip puede describir escenas a personas con discapacidad visual usando el grafo de visión a 768x768 para mayor detalle y el modelo de lenguaje para respuestas conversacionales.
- Automatización industrial con inspección visual: el modelo puede recibir imágenes de una línea de producción y generar informes en lenguaje natural sobre defectos o anomalías, integrándose mediante el manifiesto de worker en wdnwebui.
- Prototipado de producto VLM en hardware de bajo consumo: al estar empaquetado con RKLLM + RKNN y un manifiesto listo para la interfaz web, sirve para validar flujos de chat con imagen en un RK3588 antes de invertir en hardware mayor.
- Retrofit de dispositivos existentes: el directorio se detecta automáticamente por el backend (reescaneo cada ~2 s, sin reinicio) y se localiza mediante la variable de entorno `WDNAI_QWEN3_VL_4B_DIR`, lo que facilita desplegar el modelo en flotas de dispositivos ya instalados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~3500 MB según el manifiesto del worker; el tamaño total de pesos es de 3,50 GB.
- Acelerador requerido: tarjeta de cómputo RK182x de Rockchip (1,82 TOPS), una tarjeta necesaria según el manifiesto.
- Host: plataforma RK3588.
- Runtime: RKLLM + RKNN; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que los pesos son grafos RKNN propietarios, no safetensors ni GGUF de modelo completo.
- Tiempo de inicialización: ~60 s.
- Cabe en GPU consumer: no aplica; el paquete está orientado a NPU Rockchip, no a GPU NVIDIA o AMD.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wardner/Qwen3-VL-4B (este paquete) | 4B | no disponible | RKNN + pesos + GGUF tokenizer | Apache 2.0 | Hugging Face, 35 descargas |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en la informacion | safetensors (formato upstream estándar) | Apache 2.0 (según upstream) | Hugging Face |
| Alternativas edge equivalentes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo upstream Qwen3-VL-4B-Instruct: misma base y licencia, pero este paquete sustituye los pesos estándar por artefactos RKNN para RK182x, lo que limita su portabilidad a ese hardware. No se dispone de datos de benchmarks para comparar rendimiento entre ambos.

## Limitaciones y advertencias

- Portabilidad muy restringida: los pesos son grafos RKNN para RK182x; no se pueden cargar en vLLM, llama.cpp, Ollama ni en GPU convencionales.
- Son derivados convertidos, no pesos upstream sin modificar; la model card lo advierte explícitamente y remite a LICENSE y NOTICE.
- Idiomas soportados no documentados en este paquete; no se puede asumir el multilingüismo del modelo base sin verificación.
- Longitud de contexto no especificada; planificar producción sin asumir una ventana concreta.
- Riesgo de alucinación inherente a los VLM de 4B: las descripciones visuales pueden contener detalles inventados, especialmente en escenas complejas o imágenes de baja calidad.
- Sesgos conocidos: no documentados en la información proporcionada; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse la atribución y revisarse NOTICE por los términos de la conversión.
- La instalación depende de wdnwebui y del manifiesto `qwen3-vl-4b.json`; sin ese entorno, los artefactos no son directamente utilizables.
- Verificar la integridad con `sha256sum -c SHA256SUMS` antes de desplegar; la model card exige que todas las entradas reporten OK.
- Los detalles de muestreo, disposición de capacidades y efectos secundarios están en el campo `notes` del manifiesto, no en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wardner/Qwen3-VL-4B
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Mirror de descarga mencionado en la model card: https://hf-mirror.com
- Papers, blogs, repos o demos adicionales: no disponibles en la información proporcionada.
