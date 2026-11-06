# tiny-random/sensenova-loop

## Resumen

`tiny-random/sensenova-loop` es un modelo de prueba generado automáticamente a partir de `sensenova/SenseNova-Loop-9B-Preview`, un modelo multimodal de tipo image-text-to-text de SenseNova. El repositorio no contiene los pesos reales del modelo original: es una inicialización aleatoria de una arquitectura reducida que replica la estructura del modelo base (capas de decodificación, ciclo de atención lineal/completa, torre de visión, cabezal MTP) con dimensiones mínimas. Su propósito es exclusivamente el test y la depuración de la implementación de referencia incluida en el propio repo.

El modelo conserva la topología del SenseNova-Loop original: un backbone de tipo Qwen3.5, un ciclo de atención de cuatro capas (tres lineales y una completa) que se ejecuta dos veces sobre el bloque de capas 4-7, dos flujos mHC con 20 iteraciones de Sinkhorn, y una torre de visión con patch 16, patch temporal 2 y merge espacial 2. Sin embargo, todas las dimensiones están reducidas a valores mínimos (ancho oculto 8, ancho MLP 32, 12 capas físicas, 4.549.824 parámetros totales), lo que lo hace inútil para cualquier tarea real de generación.

La relevancia de este repositorio es puramente técnica: sirve como banco de pruebas para validar que la implementación de Transformers con `trust_remote_code=True` carga correctamente la arquitectura Loop/mHC, procesa entradas de imagen y vídeo, y produce logits finitos. No debe confundirse con el modelo SenseNova-Loop-9B-Preview, cuyos pesos reales no están incluidos aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal/completa en ciclo de cuatro capas, backbone Qwen3.5, torre de visión y cabezal MTP |
| Parametros totales | 4.549.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (según la model card del repo tiny) |
| Tipos de cuantizacion | no disponible (pesos en FP32 y BF16 en el repo; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors en FP32, mtp.safetensors en BF16) |

## Arquitectura y entrenamiento

La arquitectura replica la del modelo base SenseNova-Loop-9B-Preview: un backbone de tipo Qwen3.5 con 12 capas físicas de decodificación (frente a las 32 del original), donde el bloque de capas 4-7 se ejecuta dos veces, dando lugar a 16 ejecuciones de capa en el forward. La cadencia de atención sigue el patrón del original: tres capas con atención lineal seguidas de una capa con atención completa, formando un ciclo de cuatro capas que se repite cuatro veces en esta versión reducida. El ancho oculto es de 8 y el ancho MLP de 32. La atención completa usa 8 cabezas Q, 4 cabezas KV y dimensión de cabeza 32; la atención lineal usa 4 cabezas de clave/valor de 32 dimensiones y 8 cabezas de valor de 32 dimensiones.

El modelo incluye dos flujos mHC (multi-head communication) con 20 iteraciones de Sinkhorn aplicadas sobre las cuatro capas del bloque repetido. La torre de visión tiene 4 capas de profundidad, ancho oculto 64 y 2 cabezas, con patch 16, patch temporal 2 y merge espacial 2, y un buffer de posiciones de 2.304 entradas. El vocabulario tiene 248.320 filas y no está atado (untied). El backbone se serializa en FP32 y el draft MTP en BF16 como componente separado. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO: el modelo es de inicialización aleatoria y no ha sido entrenado.

## Capacidades

- Generación de texto: el modelo puede producir logits y generar tokens, pero al ser de inicialización aleatoria la salida no tiene significado lingüístico.
- Procesamiento de imagen: soporta entradas de imagen a través de la torre de visión integrada (pipeline image-text-to-text).
- Procesamiento de vídeo: acepta fotogramas de vídeo predecodificados con metadatos (total_num_frames, fps, frames_indices).
- Conversación multimodal: el procesador aplica plantillas de chat con contenido mixto imagen/vídeo/texto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: el ejemplo de uso incluye `enable_thinking=False`, lo que sugiere que la arquitectura soporta un modo de razonamiento, pero no se detalla su funcionamiento.
- Decodificación especulativa: incluye un draft MTP (multi-token prediction) de una capa en BF16, pensado para decodificación especulativa.

## Casos de uso

- Validación de la implementación de Transformers: el repo incluye una implementación fijada de Loop/mHC que se carga con `trust_remote_code=True`; sirve para verificar que la clase `AutoModelForImageTextToText` instancia correctamente la arquitectura y produce logits finitos con entradas de imagen y vídeo.
- Depuración de pipelines multimodales: permite probar el procesador (`AutoProcessor`) con mensajes que combinan imagen, vídeo y texto, verificando que las formas de `pixel_values` y `pixel_values_videos` son correctas antes de escalar al modelo real.
- Test de integración en CI: al ocupar solo 18,25 MB y requerir CUDA únicamente por la ruta de atención lineal híbrida, puede incorporarse a suites de integración continua que validen la carga de modelos con código remoto y arquitecturas no estándar.
- Verificación de contratos de precisión: el repo preserva la separación FP32 (backbone) / BF16 (MTP) del modelo original, por lo que sirve para comprobar que las rutas de carga respetan las precisiones declaradas.
- Pruebas de decodificación especulativa: el componente `mtp.safetensors` permite validar la integración del draft MTP en el flujo de generación sin necesidad de cargar los 38 GB del modelo completo.
- Desarrollo de herramientas de inspección de modelos: útil para validar scripts que analizan la estructura de capas, el ciclo de atención o los parámetros mHC sin incurrir en el coste de memoria del modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 4,55 M de parámetros del backbone, más el draft MTP en BF16 (tamaño despreciable). El repo completo ocupa 18,25 MB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el ejemplo de la model card requiere CUDA por la ruta de atención lineal híbrida. No se especifican modelos concretos.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo con CUDA (GTX 1060 en adelante, RTX 20/30/40, etc.).
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `attn_implementation="sdpa"` es la única ruta verificada según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tiny-random/sensenova-loop | 4,55 M | 262.144 | no disponible | Hugging Face (repo tiny) | Inicialización aleatoria, solo para test |
| sensenova/SenseNova-Loop-9B-Preview | 9,41 B (F32) | 262.144 | no disponible | Hugging Face | Modelo base real, pesos completos (38,14 GB) |
| Otros modelos tiny-random de Hugging Face | variable (típicamente < 10 M) | variable | variable | Hugging Face | Repos generados para test de arquitecturas |

La comparación relevante es con su modelo base: el tiny comparte arquitectura, contexto y contratos de precisión, pero reduce parámetros en un factor de ~2.000 y no ha sido entrenado. Frente a otros repos `tiny-random`, la diferencia es que este preserva fielmente la topología Loop/mHC del original, incluyendo el ciclo de atención y el draft MTP.

## Limitaciones y advertencias

- Pesos de inicialización aleatoria: el modelo no ha sido entrenado y no produce texto coherente ni descripciones útiles de imágenes o vídeos.
- No apto para producción: cualquier uso en un sistema real dará resultados sin sentido; es exclusivamente una herramienta de test.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; ante la ausencia de licencia, debe asumirse que no hay permiso explícito.
- Idiomas no disponibles: no se documenta qué idiomas soporta (el modelo base podría soportar varios, pero este repo no lo declara).
- Dependencia de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; debe auditarse antes de usarlo en entornos sensibles.
- Requiere CUDA: la ruta de atención lineal híbrida no funciona en CPU según la model card.
- Contexto declarado de 262.144 tokens: aunque la arquitectura lo soporta, con 4,55 M de parámetros y ancho oculto 8 la capacidad efectiva de modelado es nula.
- Sin validación de backend de serving: la model card indica explícitamente que no se reclama validación en backends de serving, solo en Transformers.
- Generado por GPT-6.1-Sol: el repo es generado automáticamente, lo que añade un caveat sobre la revisión humana del código incluido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiny-random/sensenova-loop
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Script de creación: `.meta/create_model.py` (dentro del repo)
- Log de estructura del modelo: `.meta/model.log` (dentro del repo)
- Entorno de generación: `.meta/env.json` (dentro del repo)
