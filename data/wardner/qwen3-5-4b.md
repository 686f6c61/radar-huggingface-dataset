# wardner/Qwen3.5-4B

## Resumen

Qwen3.5-4B es un modelo de lenguaje y visión (VLM) de aproximadamente 4-5 mil millones de parámetros desarrollado por el equipo Qwen (Alibaba) y publicado bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, lo que lo sitúa en la categoría de modelos image-text-to-text. El repositorio analizado aquí, `wardner/Qwen3.5-4B`, no contiene los pesos originales en safetensors, sino una conversión empaquetada para el runtime RKLLM/RKNN sobre el acelerador Rockchip RK182x, montado en un host RK3588.

El interés de esta distribución es que ejemplifica el despliegue de un VLM de contexto largo en hardware de borde (edge AI) con NPU dedicada: los grafos RKNN se acompañan de tablas de embeddings en fp16, pesos cuantizados y un manifiesto de worker (`qwen3.5-vl-4b.json`) que declara capacidades de chat de texto, chat de visión y tool calling. El modelo upstream declara una ventana de contexto de 262 144 tokens, lo que resulta poco habitual en modelos de este tamaño.

La ficha distingue explícitamente entre lo que se sabe del modelo upstream (Qwen3.5-4B) y lo que aporta este repositorio derivado (artefactos RKNN, manifiesto, verificación SHA-256). Cualquier dato no confirmado en la información disponible se marca como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) para texto e imagen; detalles internos (número de capas, atención, etc.) no disponibles |
| Parámetros totales | ~4-5 B (el repositorio upstream indica 5B; el nombre comercial indica 4B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens (según AIModelRadar, no confirmado en la model card del repositorio derivado) |
| Tipos de cuantización | Pesos empaquetados para RKLLM/RKNN; embeddings en fp16; no se detallan esquemas de cuantización (int8/int4) en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (grafos) + `.weight` + `.embed.bin` (fp16) + tokenizer en GGUF; no hay safetensors ni GGUF de pesos completos |

Especificaciones del paquete de despliegue:

| Elemento | Valor |
|---|---|
| Target de cómputo | Rockchip RK182x (1,82 TOPS por tarjeta) |
| Host | RK3588 |
| Runtime | RKLLM + RKNN |
| Tamaño total de pesos | 4,09 GB (repo: 4,4 GB) |
| Memoria estimada en ejecución | ~3500 MB |
| Tiempo de inicialización | ~60 s |
| Tarjetas necesarias | 1 |
| Capacidades declaradas | `swcap_text_chat`, `swcap_vision_chat`, `swcap_tool_call` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo upstream más allá de su naturaleza multimodal (entrada de texto e imagen, salida de texto). No se especifican el número de capas, el mecanismo de atención, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Tampoco se documenta la resolución nativa del codificador visual más allá de las dos variantes incluidas en este paquete (384×384 y 768×768).

Lo que sí está documentado es la arquitectura de despliegue: el repositorio separa el grafo de cómputo (`.rknn`) de los pesos (`.weight`), y mantiene la tabla de embeddings en fp16 (1212,5 MB) fuera del grafo, junto con un tokenizer en formato GGUF basado en GPT-2 BPE con ByteLevel. El modelo de visión se distribuye en dos resoluciones, cada una con su propio grafo y pesos (5,0 MB + 187,8 MB para 384×384; 11,2 MB + 194,6 MB para 768×768). Esta separación grafo/pesos es típica de los pipelines RKNN, donde el grafo se compila para la NPU y los pesos se cargan aparte.

## Capacidades

- Generación de texto conversacional multi-turno (`swcap_text_chat`).
- Comprensión de imágenes y diálogo sobre ellas (`swcap_vision_chat`), con dos resoluciones de entrada disponibles (384×384 y 768×768).
- Descripción de imágenes según la model card del autor.
- Tool calling / function calling (`swcap_tool_call`).
- Planificación de operaciones de interfaz gráfica (GUI), mencionada explícitamente en la model card ("电脑 GUI 操作规划").
- Ventana de contexto de 262 144 tokens según la fuente secundaria, no confirmada en la documentación del paquete.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia visual en dispositivos de borde: el modelo puede procesar una imagen capturada por la cámara de un dispositivo RK3588 y responder preguntas sobre ella, con un consumo estimado de ~3500 MB de memoria y una sola tarjeta RK182x, lo que encaja en equipos embebidos sin GPU dedicada.
- Automatización de interfaces gráficas: la capacidad de planificación de operaciones GUI permite construir agentes que interpretan capturas de pantalla y proponen secuencias de clics o entradas de texto, útil en pruebas automatizadas de aplicaciones de escritorio.
- Chat de texto con contexto largo: si se confirma la ventana de 262 144 tokens, permite resumir documentos extensos o mantener conversaciones con historial amplio en local, sin depender de la nube.
- Inspección visual en entornos industriales: lectura de paneles, etiquetas o indicadores a partir de imágenes de 768×768, con el modelo ejecutándose en la propia línea de producción.
- Agente con tool calling en local: integración del modelo como planificador que invoca funciones del sistema (lectura de sensores, consultas a bases de datos locales) mediante el soporte declarado de `swcap_tool_call`.
- Prototipado de asistentes multimodales en investigación: al estar bajo Apache 2.0 y ejecutarse en hardware de bajo consumo, sirve para experimentar con pipelines VLM + NPU sin infraestructura de GPU.
- Verificación de integridad en despliegues: el paquete incluye `SHA256SUMS`, lo que facilita la validación de artefactos en pipelines de despliegue automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Acelerador: Rockchip RK182x (1,82 TOPS por tarjeta), una tarjeta necesaria.
- Host: Rockchip RK3588.
- Memoria estimada en ejecución: ~3500 MB.
- Tamaño en disco de los pesos: 4,09 GB (repositorio completo: 4,4 GB).
- Tiempo de inicialización: ~60 s.
- No es compatible con GPU NVIDIA (A100, H100, RTX 4090) ni con el stack CUDA estándar: los grafos están compilados para RKNN.
- Opciones de despliegue: runtime RKLLM + RKNN a través de wdnwebui; el backend redescubre el modelo cada ~2 s sin reiniciar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato de despliegue |
|---|---|---|---|---|---|
| Qwen3.5-4B (este paquete, wardner) | ~4-5 B | 262 144 (según fuente secundaria) | Texto + imagen | Apache 2.0 | RKNN/RKLLM para RK182x |
| Qwen3.5-4B (upstream, Qwen) | ~5 B | 262 144 (según fuente secundaria) | Texto + imagen | Apache 2.0 | Transformers / safetensors |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, modalidad y licencia.

## Limitaciones y advertencias

- Este repositorio no contiene los pesos originales: son derivados convertidos a RKNN, por lo que no pueden cargarse con Transformers, vLLM ni llama.cpp.
- El despliegue está atado al hardware Rockchip RK182x y al runtime RKLLM; no hay portabilidad a GPU convencional documentada.
- El modelo upstream tiene ~5B parámetros según Hugging Face, aunque el nombre comercial indica 4B; conviene verificar la cifra exacta antes de dimensionar recursos.
- La ventana de contexto de 262 144 tokens proviene de una fuente secundaria (AIModelRadar) y no está confirmada en la model card del paquete; podría no estar disponible en la conversión RKNN.
- No se documentan los idiomas soportados, lo que impide garantizar calidad en castellano.
- No se detallan los esquemas de cuantización aplicados a los pesos, lo que dificulta estimar la degradación de calidad respecto al modelo original.
- Riesgo de alucinación inherente a los modelos de ~4-5B, especialmente en tareas de razonamiento complejo o descripción de imágenes ambiguas.
- Sesgos conocidos: no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y el NOTICE del repositorio; los artefactos son derivados, no pesos upstream sin modificar.
- El repositorio tiene 52 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.
- La fecha de creación del repositorio (2026-11-04) es posterior a la fecha de muchos datos de referencia; conviene comprobar la vigencia del modelo upstream.

## Enlaces

- Repositorio analizado: https://huggingface.co/wardner/Qwen3.5-4B
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-4B
- Ficha secundaria: https://aimodelradar.app/models/qwen3-5-4b
- Manifiesto del worker: `qwen3.5-vl-4b.json` (incluido en el repositorio)
- Verificación de integridad: `SHA256SUMS` (incluido en el repositorio)
- Licencia y avisos: `LICENSE`, `NOTICE` (incluidos en el repositorio)
