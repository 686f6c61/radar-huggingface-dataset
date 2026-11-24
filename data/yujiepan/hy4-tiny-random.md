# yujiepan/hy4-tiny-random

## Resumen

`yujiepan/hy4-tiny-random` es un checkpoint de inicialización aleatoria de reducidas dimensiones construido a partir de la arquitectura del modelo multimodal `tencent/Hy4`. Lo desarrolla el usuario yujiepan con un propósito exclusivamente instrumental: servir como banco de pruebas para validar la implementación de la clase `hy_v4_vl` en Transformers, así como los flujos de carga, preprocesado y generación de texto, imagen y vídeo sin necesidad de descargar el checkpoint original de 1,55 TB.

El modelo conserva la estructura arquitectónica de Hy4 (backbone híbrido con una capa densa y el resto MoE, atención MLA con gating, indexer DSA, Hyper-Connections independientes, torre de visión y un drafter DFly2 para decodificación especulativa) pero con anchuras y profundidades drásticamente reducidas: 10 capas, dimensión oculta de 8, 32 expertos enrutados con top-k 8 y una torre de visión de 4 capas y anchura 64. El total de parámetros asciende a 10.043.750, con pesos en BF16 y algunos tensores auxiliares en FP32.

Su relevancia es la de una herramienta de ingeniería: permite a desarrolladores que integran Hy4 en Transformers o SGLang verificar el cableado de la arquitectura, el tratamiento de `mm_token_type_ids`, la fusión de modalidades y la compatibilidad con endpoints OpenAI sin coste computacional. No es un modelo apto para producción ni para evaluación de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HYV4-VL (transformer multimodal con backbone híbrido denso + MoE, atención MLA con gating, indexer DSA y torre de visión) |
| Parametros totales | 10.043.750 |
| Parametros activos | no disponible (MoE con 32 expertos enrutados, top-k 8, 1 experto compartido) |
| Longitud de contexto | no disponible (el ejemplo de SGLang usa `--context-length 4096`) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 y FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 20,14 MB) |

## Arquitectura y entrenamiento

El modelo replica la topología de `tencent/Hy4` a escala mínima. El backbone consta de 10 capas, con la primera densa y el resto MoE; cada capa MoE tiene 32 expertos enrutados con top-k 8 y un experto compartido, con tamaño intermedio de experto de 128. La dimensión oculta es 8 y la MLP densa 128. La atención es MLA (Multi-head Latent Attention) con 8 cabezas de consulta, dimensiones no-RoPE/RoPE/V de 32/64/32 y rangos LoRA de Q y KV de 64 y 512 respectivamente. Se mantienen las Hyper-Connections independientes con 4 flujos y pre-ramas con gating, el gating elementwise de MLA, los attention sinks aprendidos y el clamp SwiGLU a 10. El vocabulario es de 120.832 filas con embeddings no atados.

La torre de visión tiene 4 capas, anchura 64 y anchura de salida 8, frente a las 40 capas y anchura 1.536 del modelo original. El checkpoint incluye además el drafter DFly2 con 5 capas densas MLA, fusión y corrección oculta, aunque la clase `hy_v4_vl` de Transformers no lo ejecuta. Las secciones M-RoPE son 12/10/10, igual que en el modelo fuente. No ha habido entrenamiento: los pesos son de inicialización aleatoria, por lo que no existen datos de preentrenamiento, RLHF ni DPO asociados.

## Capacidades

- Carga y ejecución de un grafo multimodal completo (texto, imagen y vídeo) a través de `AutoModelForImageTextToText` y `AutoProcessor`.
- Procesamiento de mensajes conversacionales con `apply_chat_template`, incluyendo partes de contenido de tipo imagen, vídeo y texto.
- Generación de logits y `generate` con atención eager, verificada como finita en el ejemplo del autor.
- Soporte de metadatos de vídeo (`VideoMetadata`) con índices de frames y fps.
- Compatibilidad con el servidor SGLang mediante API OpenAI (`image_url` y `video_url`), con parsers de razonamiento y tool calling configurados en el ejemplo (no verificados).
- No dispone de capacidades reales de razonamiento, código, matemáticas ni multilingüismo: al ser pesos aleatorios, sus salidas no son semánticamente válidas.

## Casos de uso

- Validación de la implementación de `hy_v4_vl` en Transformers: permite ejecutar el ciclo completo de carga, preprocesado y generación con atención eager para detectar errores de integración antes de trabajar con el checkpoint real de 1,55 TB.
- Pruebas de regresión en pipelines multimodales: sirve para comprobar que el tratamiento de `mm_token_type_ids`, la fusión de imagen y vídeo y el `chat_template` producen las máscaras y secuencias esperadas.
- Integración continua de servidores de inferencia: al ocupar 20 MB, se puede desplegar en cualquier runner para verificar el arranque de SGLang, la exposición de endpoints OpenAI y el enrutado de peticiones con `image_url` y `video_url`.
- Desarrollo de herramientas de depuración: el log de estructura (`.meta/model.log`) y el script de creación (`.meta/create_model.py`) permiten reproducir la construcción del checkpoint y comparar formas de tensores con el modelo fuente.
- Pruebas de compatibilidad de versiones: útil para validar builds de Transformers desde una rama concreta de Git y comprobar que la clase `hy_v4_vl` se registra correctamente en `AutoModelForImageTextToText`.
- Formación y documentación: sirve como ejemplo didáctico de cómo se estructura un modelo MoE multimodal con MLA, DSA e Hyper-Connections sin incurrir en costes de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint de inicialización aleatoria, cualquier métrica de calidad sería carente de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (20,14 MB de pesos más activaciones y caché KV); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA y BF16; el ejemplo del autor usa `device_map="cuda"` sin especificar modelo. Para el flujo SGLang se documenta una H20 con driver 535 y pila CUDA 13.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente con al menos unos pocos GB de VRAM.
- Opciones de despliegue: Transformers (rama `439bba079891ecd766900e8ce80ee961b94ef132`), SGLang (PR #51672, no publicado como wheel) y servidor compatible con la API OpenAI mediante SGLang.
- Latencia y throughput: no disponibles; el ejemplo usa `--tp 1` y `max_new_tokens=10` con fines de verificación, no de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Proposito |
|---|---|---|---|---|---|
| yujiepan/hy4-tiny-random | 10,04 M | no disponible | texto, imagen, vídeo | no disponible | Pruebas de integración |
| tencent/Hy4 | 774,40 B (checkpoint) | no disponible | texto, imagen, vídeo | no disponible | Modelo de producción |
| Otros tiny-random de Hugging Face | variable | no disponible | variable | variable | Pruebas de integración |

La comparación directa con alternativas de la misma categoría (checkpoints `tiny-random` de otras familias) no está disponible en la información proporcionada. Frente a `tencent/Hy4`, la diferencia es de escala: 10,04 M frente a 774,40 B de elementos de tensor, 20,14 MB frente a 1,55 TB y 10 capas frente a 78.

## Limitaciones y advertencias

- Pesos de inicialización aleatoria: el modelo no ha sido entrenado y sus salidas carecen de valor semántico; no debe usarse para inferencia real ni para evaluación de calidad.
- Licencia no especificada: no se puede asumir uso comercial ni redistribución sin consultar al autor y al modelo base `tencent/Hy4`.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- El drafter DFly2 incluido en el checkpoint no se ejecuta desde Transformers, por lo que la decodificación especulativa no está cubierta en ese flujo.
- La atención se ejecuta en modo eager por ausencia de kernel optimizado para Gated DSA con sinks aprendidos; no refleja el rendimiento del modelo real.
- El soporte en SGLang requiere una rama no publicada, CUDA 13, `flashinfer` y variables de entorno específicas; el propio autor lo marca como no verificado.
- El contexto máximo no está documentado; el valor 4096 del ejemplo de SGLang es una elección de prueba, no una especificación.
- No apto para producción: su función es exclusivamente la verificación de integraciones y la depuración de código.

## Enlaces

- [Hugging Face: yujiepan/hy4-tiny-random](https://huggingface.co/yujiepan/hy4-tiny-random)
- [Modelo base: tencent/Hy4](https://huggingface.co/tencent/Hy4)
- [Rama de Transformers con `hy_v4_vl`](https://github.com/huggingface/transformers/tree/439bba079891ecd766900e8ce80ee961b94ef132)
- [SGLang PR #51672](https://github.com/sgl-project/sglang/pull/51672)
- [Hy4 cookbook en SGLang](https://docs.sglang.io/cookbook/autoregressive/Tencent/Hy4)
- [Script de creación del modelo](https://huggingface.co/yujiepan/hy4-tiny-random/blob/main/.meta/create_model.py)
- [Log de estructura del modelo](https://huggingface.co/yujiepan/hy4-tiny-random/blob/main/.meta/model.log)
- [Entorno de creación](https://huggingface.co/yujiepan/hy4-tiny-random/blob/main/.meta/env.json)
