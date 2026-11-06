# tiny-random/minicpm-v-4.7-moe

## Resumen

`tiny-random/minicpm-v-4.7-moe` es un checkpoint "tiny" (diminuto) de inicialización aleatoria construido a partir de la arquitectura del modelo multimodal `openbmb/MiniCPM-V-4.7-35B-A3B`. No es un modelo entrenado ni utilizable para tareas reales: es un artefacto de pruebas y depuración que reproduce la estructura, el esquema de pesos y el pipeline de inferencia del modelo original con dimensiones reducidas. Lo publica el usuario `tiny-random`, un espacio habitual para checkpoints de validación de código, y lo genera automáticamente la herramienta DeepSeek-V4.1-Flash.

El interés técnico del repositorio es que conserva fielmente la topología del modelo fuente: arquitectura Mixture-of-Experts (MoE) multimodal con atención híbrida (ciclos de tres capas de atención lineal y una de atención completa), torre de visión, M-RoPE en modo canvas y embeddings ligados desactivados. Con solo 12.584.224 parámetros totales (frente a los 35.21B del original), sirve para verificar que el código de carga, el procesador multimodal y la ruta de atención lineal con CUDA y Triton funcionan antes de desplegar el modelo grande.

Es relevante ahora porque el modelo base `MiniCPM-V-4.7-35B-A3B` representa la generación de modelos visión-lenguaje eficientes con MoE y atención lineal, y disponer de un checkpoint mínimo reproducible permite a desarrolladores validar integraciones en `transformers` sin necesidad de reservar 80 GB de VRAM. Cualquier uso distinto de pruebas unitarias o de infraestructura carece de sentido: los pesos son aleatorios y las salidas no tienen significado semántico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE con atención híbrida (3 capas lineales + 1 capa full por ciclo), torre de visión y M-RoPE |
| Parametros totales | 12.584.224 |
| Parametros activos | 8 expertos enrutados de 16 + 1 compartido por capa (esquema MoE conservado; sin cifra de activos publicada) |
| Longitud de contexto | no disponible (el original usa M-RoPE con secciones 11/11/10 y partial 0.25) |
| Tipos de cuantizacion | no disponible (checkpoint en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, `model.safetensors`, 25.2 MB) |

## Arquitectura y entrenamiento

El checkpoint replica la arquitectura del MiniCPM-V 4.7 MoE: un backbone de 8 capas (frente a 40 en el original) organizado en dos ciclos completos de tres capas de atención lineal seguidas de una capa de atención completa. El ancho oculto es de 16 (frente a 2.048), con 16 cabezas Q, 2 cabezas KV y dimensión de cabeza 256, idénticas al modelo fuente. La capa MoE mantiene 16 expertos enrutados (8 seleccionados) más 1 experto compartido, con anchura de experto y de experto compartido de 32. Los tensores de expertos se almacenan fusionados en 3-D (`gate_up_proj [E, 2I, H]` y `down_proj [E, H, I]`), igual que en el original, lo que preserva el esquema de carga.

La torre de visión tiene 4 capas y ancho 128 (frente a 27 capas y 1.152), con el merger de inserción tras la capa 2. El vocabulario se mantiene en 248.144 filas con embeddings no ligados. El config declara una capa MTP (multi-token prediction) pero no incluye tensores MTP, igual que el checkpoint fuente. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO: los pesos son de inicialización aleatoria y el repositorio se describe explícitamente como material de test y debugging. La ruta de atención lineal del MoE requiere CUDA y Triton; el snippet público se verificó en una NVIDIA A800-SXM4-80GB.

## Capacidades

- Carga y ejecución del pipeline `image-text-to-text` con `AutoModelForImageTextToText` y `AutoProcessor` de `transformers[torch]>=5.18.0`.
- Procesamiento conjunto de imagen y vídeo predecodificado en una misma conversación multimodal (el ejemplo oficial envía una imagen y cuatro fotogramas).
- Soporte de plantilla de chat (`apply_chat_template`) con parámetros de preprocesado como `downsample_mode="16x"`, `max_num_frames`, `stack_frames`, `max_slice_nums`, `use_image_id` y `enable_thinking`.
- Generación con `model.generate` y decodificación con el procesador; el ejemplo verifica que los logits son finitos.
- Conservación del esquema MoE con expertos fusionados, útil para probar rutas de carga y sharding.
- No dispone de capacidades reales de razonamiento, código, matemáticas, tool calling ni agentes: al ser pesos aleatorios, las salidas no son coherentes.

## Casos de uso

- Pruebas de integración de `transformers`: validar que la versión instalada carga correctamente un modelo `image-text-to-text` con arquitectura MoE híbrida antes de migrar al checkpoint de 35B.
- Depuración del procesador multimodal: comprobar el formateo de mensajes con imagen y vídeo, el downsample y el stack de fotogramas sin consumir recursos de GPU significativos.
- CI/CD de librerías: incluir el checkpoint en suites de tests que verifiquen que `from_pretrained`, `apply_chat_template` y `generate` no lanzan excepciones ni producen NaN en los logits.
- Validación de kernels CUDA/Triton: la ruta de atención lineal requiere CUDA y Triton, por lo que este modelo permite probar la compilación de kernels en una A800 o GPU equivalente con un coste mínimo de memoria.
- Verificación de esquemas de pesos fusionados: útil para desarrolladores que implementan cargadores personalizados de tensores MoE 3-D (`gate_up_proj`, `down_proj`).
- Pruebas de compatibilidad de `endpoints_compatible`: sirve para comprobar el enrutado y el contrato de API de extremos de inferencia sin cargar el modelo grande.
- Referencia de estructura para auditorías: permite inspeccionar la topología declarada (capas, cabezas, M-RoPE, MTP) sin descargar 70 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones y, al tratarse de pesos aleatorios, cualquier métrica de calidad sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (25.2 MB de pesos más activaciones y caché del procesador), holgadamente por debajo de cualquier GPU consumer.
- GPU recomendadas: el snippet oficial se verificó en NVIDIA A800-SXM4-80GB; cualquier GPU con soporte CUDA y Triton debería bastar, incluidas RTX 3090, RTX 4090 o superiores.
- Cabe en GPU consumer: sí, en cualquier GPU con CUDA; también en CPU para carga, aunque la ruta de atención lineal requiere CUDA y Triton para ejecución completa.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `attn_implementation="sdpa"`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tiny-random/minicpm-v-4.7-moe` | 12.58M | no disponible | imagen, vídeo, texto | no disponible | Hugging Face |
| `openbmb/MiniCPM-V-4.7-35B-A3B` (base) | 35.21B (MoE, 8+1 expertos) | no disponible | imagen, vídeo, texto | no disponible | Hugging Face |
| Otros checkpoints `tiny-random` | variable (millones) | no disponible | según modelo fuente | no disponible | Hugging Face |

La comparación relevante es con su modelo base: el tiny conserva la topología (atención híbrida, MoE fusionado, torre de visión, M-RoPE) pero reduce capas, anchura y vocabulario efectivo, y sustituye los pesos entrenados por inicialización aleatoria. No se dispone de datos para comparar con alternativas de la misma categoría (modelos visión-lenguaje MoE de tamaño similar) porque el propio checkpoint no es un modelo funcional.

## Limitaciones y advertencias

- Pesos de inicialización aleatoria: las salidas no tienen significado; no debe usarse para inferencia real, producción ni evaluación de calidad.
- No es un modelo entrenado: no ha pasado por pretraining, SFT, RLHF ni DPO, por lo que no hay sesgos medibles ni comportamiento lingüístico evaluable.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; hay que consultar la licencia del modelo base `openbmb/MiniCPM-V-4.7-35B-A3B`.
- Idiomas no disponibles: no se declara cobertura multilingüe.
- Dependencia de CUDA y Triton para la ruta de atención lineal; en entornos sin GPU compatible la ejecución completa puede fallar.
- El config declara una capa MTP sin tensores asociados, lo que puede provocar advertencias o comportamientos inesperados en cargadores estrictos.
- El repositorio se genera automáticamente (DeepSeek-V4.1-Flash) y tiene 0 descargas y 0 likes; no hay garantía de mantenimiento ni de soporte.
- No usar como sustituto del modelo base en benchmarks, demos públicas ni documentación de producto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiny-random/minicpm-v-4.7-moe
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Script de creación: `.meta/create_model.py` (dentro del repositorio)
- Estructura del modelo: `.meta/model.log` (dentro del repositorio)
- Entorno de generación: `.meta/env.json` (dentro del repositorio)
