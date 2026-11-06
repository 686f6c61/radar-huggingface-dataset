# yujiepan/minicpm-v-4.7-moe-tiny-random

## Resumen

`yujiepan/minicpm-v-4.7-moe-tiny-random` es un checkpoint de juguete (tiny) derivado del modelo multimodal `openbmb/MiniCPM-V-4.7-35B-A3B`, publicado por el usuario yujiepan. No es un modelo entrenado ni utilizable para inferencia real: es una inicializacion aleatoria que reproduce fielmente la estructura de configuracion del modelo original (arquitectura MoE con mezcla de atencion lineal y completa, torre de vision, M-RoPE, vocabulario y esquema de tensores fusionados) pero con dimensiones reducidas. Su proposito es servir como fixture para pruebas unitarias y depuracion de pipelines de `transformers` sin necesidad de descargar 70 GB de pesos.

El modelo original sobre el que se basa, MiniCPM-V 4.7 35B-A3B, es un modelo imagen-texto-video con arquitectura Mixture-of-Experts de 35.210 millones de parametros totales y 8 expertos enrutados por token, desarrollado por OpenBMB. Este tiny replica su esquema: 248.144 filas de vocabulario, cabezas Q/KV 16/2 con dimension 256, atencion lineal con 16/32 cabezas clave-valor de 128 dimensiones, 256 expertos enrutados (8 seleccionados, 1 compartido) y una torre de vision con merger insertado tras la capa 6.

La relevancia de este repositorio es practica para desarrolladores que integran modelos MiniCPM-V en `transformers` o que necesitan validar codigo de carga, procesado multimodal (imagen + video + texto) y generacion sin disponer de GPU de gran capacidad. El checkpoint se ha verificado en una NVIDIA A800-SXM4-80GB, y requiere CUDA y Triton para la ruta de atencion lineal del backbone MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + imagen + video) con atencion hibrida lineal/completa; backbone derivado de Qwen3.5 MoE |
| Parametros totales | 12,58 M (BF16) en este checkpoint tiny; el modelo base declara 35,21 B |
| Parametros activos | 8 expertos enrutados de 16 (tiny) frente a 8 de 256 (base); no disponible el computo exacto de parametros activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en BF16; el modelo base no detalla cuantizaciones en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (un unico `model.safetensors` de 25,20 MB) |

## Arquitectura y entrenamiento

El checkpoint tiny reproduce la estructura del backbone MiniCPM-V 4.7 MoE: 8 capas frente a las 40 del modelo base, organizadas en dos ciclos completos de tres capas con atencion lineal seguidas de una capa con atencion completa (patron 3-linear + 1-full). La anchura oculta se reduce de 2.048 a 16, pero se mantienen las cabezas de atencion (16 Q / 2 KV, dimension 256) y la ruta de atencion lineal con 16/32 cabezas clave-valor de 128 dimensiones. La capa MoE conserva el esquema de tensores fusionados `gate_up_proj [E, 2I, H]` y `down_proj [E, H, I]`, con 16 expertos enrutados (8 seleccionados) y 1 compartido, cada uno de anchura 32 en lugar de 512.

La torre de vision se reduce a 4 capas de anchura 128 (frente a 27 capas y 1.152 de anchura en el base), con el merger insertado tras la capa 2 en lugar de tras la 6. Se mantiene el esquema M-RoPE de tipo canvas con secciones 11/11/10 y fraccion parcial 0,25, asi como la declaracion de una capa MTP (multi-token prediction) sin tensores asociados. El vocabulario de 248.144 filas y la ausencia de embeddings atados se conservan identicos. No hay entrenamiento: los pesos son aleatorios, generados por un script (`.meta/create_model.py`) a partir de la configuracion del modelo base. El checkpoint se ha verificado con `transformers[torch]>=5.18.0` en una A800-SXM4-80GB, y la ruta de atencion lineal requiere CUDA y Triton.

## Capacidades

- Generacion de texto condicionada por imagen y video (pipeline `image-text-to-text`), con soporte de multiples imagenes y frames de video apilados.
- Procesamiento multimodal con `AutoProcessor` y `AutoModelForImageTextToText` de `transformers`, incluyendo plantilla de chat (`apply_chat_template`).
- Parametros de procesado configurables: `downsample_mode` (16x), `max_num_frames`, `stack_frames`, `max_slice_nums`, `use_image_id`, `enable_thinking` y `do_sample_frames`.
- Soporte de modo thinking declarado en la configuracion (`enable_thinking`), aunque en el tiny no produce salidas utiles.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), pensada para despliegue estandar de `transformers`.
- Capacidad de servir como fixture para validar rutas de atencion lineal con CUDA/Triton, carga de tensores fusionados MoE y procesado de video con `VideoMetadata`.

## Casos de uso

- Pruebas unitarias de carga de modelos multimodales: el repo permite verificar en segundos que `AutoModelForImageTextToText.from_pretrained` y `AutoProcessor.from_pretrained` resuelven correctamente la configuracion de MiniCPM-V 4.7 sin descargar 70 GB.
- Validacion de pipelines de video: al aceptar `VideoMetadata` con `total_num_frames`, `fps` y `frames_indices`, sirve para probar el preprocesado de frames y el apilado (`stack_frames`) en integraciones de inferencia.
- Depuracion de rutas de atencion lineal con Triton: al conservar la ruta de atencion lineal del backbone MoE, permite comprobar que el kernel CUDA/Triton se compila y ejecuta correctamente en un entorno concreto (por ejemplo, A800).
- Integracion continua (CI): con 25,20 MB de pesos, se puede incluir en tests de regresion de `transformers` o de frameworks propios para detectar roturas en la API de modelos multimodales.
- Desarrollo de plantillas de chat y prompts: permite iterar sobre `apply_chat_template` con contenido mixto imagen/video/texto sin coste de GPU significativo.
- Validacion de esquemas de tensores fusionados: util para verificar herramientas de conversion o cuantizacion que esperan `gate_up_proj` y `down_proj` en formato 3-D por experto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, benchmarks multimodales) carece de sentido y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para el checkpoint tiny (12,58 M de parametros); el modelo base de 35,21 B requeriria aproximadamente 70 GB en BF16, no disponible en la informacion proporcionada para cuantizaciones.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para el tiny; la verificacion oficial se realizo en NVIDIA A800-SXM4-80GB. Para el modelo base se necesitarian aceleradores de 80 GB o configuraciones multi-GPU.
- GPU de consumo: el tiny cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU, siempre que se disponga de CUDA y Triton para la ruta de atencion lineal.
- Opciones de despliegue: `transformers[torch]>=5.18.0` con `attn_implementation="sdpa"`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yujiepan/minicpm-v-4.7-moe-tiny-random | 12,58 M | no disponible | imagen-texto-video | no disponible | Hugging Face |
| openbmb/MiniCPM-V-4.7-35B-A3B | 35,21 B (MoE, 8/256 expertos) | no disponible | imagen-texto-video | no disponible | Hugging Face |
| Otros tiny de prueba de MiniCPM-V | no disponible | no disponible | imagen-texto | no disponible | no disponible |

La comparativa relevante es contra el modelo base del que deriva: misma configuracion arquitectonica, pero con dimensiones reducidas y pesos aleatorios. No se dispone de informacion sobre alternativas tiny equivalentes de otros autores.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado; sus salidas son ruido y no deben interpretarse como respuestas. No es apto para produccion ni para evaluacion de calidad.
- No sustituye al modelo base: sirve exclusivamente para pruebas estructurales y de integracion; cualquier metrica obtenida no es extrapolable a `openbmb/MiniCPM-V-4.7-35B-A3B`.
- Dependencia de CUDA y Triton: la ruta de atencion lineal del backbone MoE no funciona en CPU ni en entornos sin Triton, lo que limita su uso en CI sin GPU.
- Licencia no disponible: al no declararse licencia en la model card, no se puede confirmar el uso comercial ni la redistribucion.
- Idiomas no disponibles: no se especifica cobertura linguistica.
- Contexto no disponible: no se documenta la longitud maxima de secuencia soportada.
- Generado automaticamente: el repositorio indica que ha sido creado por DeepSeek-V4.1-Flash, por lo que conviene revisar el script `.meta/create_model.py` antes de confiar en la fidelidad estructural.
- Sin garantias de mantenimiento: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de soporte comunitario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yujiepan/minicpm-v-4.7-moe-tiny-random
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Script de creacion: `.meta/create_model.py` (incluido en el repositorio)
- Log de estructura: `.meta/model.log` (incluido en el repositorio)
- Entorno de generacion: `.meta/env.json` (incluido en el repositorio)
