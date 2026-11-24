# tiny-random/hy4

## Resumen

`tiny-random/hy4` es un checkpoint de inicialización aleatoria de muy pequeño tamaño (10.043.750 parámetros) construido a partir de la arquitectura del modelo `tencent/Hy4`, un modelo multimodal de tipo imagen-texto-vídeo desarrollado por Tencent. No se trata de un modelo funcional entrenado, sino de una reproducción estructural reducida pensada exclusivamente para pruebas y depuración de la implementación `hy_v4_vl` en Transformers y en el stack de inferencia SGLang.

El repositorio replica las decisiones arquitectónicas del modelo original (backbone híbrido con una capa densa y el resto MoE, atención MLA con gating, indexador DSA con sinks aprendidos, torre de visión y un drafter DFly2 para decodificación especulativa) pero con dimensiones drásticamente reducidas: 10 capas en lugar de 78, anchura oculta de 8 en lugar de 6.144, 32 expertos enrutados en lugar de 256 y una torre de visión de 4 capas y anchura 64. El vocabulario y el esquema de embeddings atados se mantienen idénticos al modelo fuente.

Su relevancia es práctica para desarrolladores que necesiten validar el pipeline de carga, el procesado multimodal (imagen y vídeo), la generación y la integración con servidores compatibles con la API de OpenAI sin descargar el checkpoint completo de 1,55 TB. No debe usarse para inferencia real: sus pesos son aleatorios y su salida no tiene valor semántico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HYV4-VL (transformer híbrido denso + MoE, atención MLA con gating, indexador DSA, torre de visión) |
| Parámetros totales | 10.043.750 |
| Parámetros activos | no disponible (MoE con 32 expertos enrutados, top-k 8 y 1 experto compartido) |
| Longitud de contexto | no disponible (el ejemplo de SGLang usa `--context-length 4096`) |
| Tipos de cuantización | no disponible (pesos en BF16 y algunos tensores en F32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 20,1 MB) |

## Arquitectura y entrenamiento

El modelo reproduce la topología de `tencent/Hy4`: un backbone de 10 capas con una capa densa inicial y el resto MoE, anchura oculta de 8, MLP denso de 128, 32 expertos enrutados con top-k 8 y un experto compartido, y tamaño intermedio de experto de 128. La atención emplea MLA con gating elementwise, sinks aprendidos y clamp SwiGLU de 10, con 8 cabezas Q y dimensiones no-RoPE/RoPE/V de 32/64/32, y rangos LoRA Q/KV de 64/512. Incorpora un indexador DSA con 32 cabezas, dimensión 128 y top-k 2.048, activo en las capas 0 y 1 y después cada cuatro capas. Además incluye cuatro streams de Hyper-Connections independientes con pre-ramas con gating.

La torre de visión consta de 4 capas con anchura 64 y anchura de salida 8 (frente a 40/1.536/6.144 del modelo fuente). El checkpoint conserva la estructura del drafter DFly2 (5 capas densas MLA con fusión y corrección oculta), aunque la clase `hy_v4_vl` de Transformers no lo ejecuta. Las secciones M-RoPE son 12/10/10, igual que en el original. No ha habido entrenamiento: los pesos son inicializaciones aleatorias, con precisión BF16 y tensores FP32 para iHC, sinks de atención y sesgo de corrección del router.

## Capacidades

- Carga y ejecución del pipeline `image-text-to-text` mediante `AutoModelForImageTextToText` y `AutoProcessor`.
- Procesado conjunto de texto, imagen y vídeo en un mismo mensaje de chat (tipos `image`, `video` y `text`).
- Generación de texto con `model.generate`, útil para verificar que los logits son finitos y que el flujo de decodificación funciona.
- Soporte de plantilla de chat (`apply_chat_template`) con prompt de generación.
- Compatibilidad con servidores OpenAI (`endpoints_compatible`), incluyendo `image_url` y `video_url` como partes de contenido.
- Parsers de razonamiento y de tool calling configurables en SGLang (`--reasoning-parser auto`, `--tool-call-parser auto`), aunque sin garantía de comportamiento real al no estar entrenado.
- No dispone de capacidades lingüísticas, de razonamiento ni de código reales: al ser pesos aleatorios, su salida es ruido.

## Casos de uso

- Validación de la integración de `hy_v4_vl` en Transformers: permite comprobar que la clase personalizada carga, procesa y genera sin errores antes de invertir recursos en el checkpoint completo.
- Pruebas de CI/CD del pipeline multimodal: el reducido tamaño (20 MB) permite incluirlo en suites automatizadas que verifiquen el procesado de imagen y vídeo con `VideoMetadata` y `do_sample_frames=False`.
- Depuración de servidores SGLang: sirve para validar el arranque con `--tp 1`, `--dtype bfloat16` y `--context-length 4096`, y para comprobar el enrutado de mensajes con `image_url` y `video_url`.
- Verificación de compatibilidad con la API de OpenAI: útil para probar clientes que envían contenido multimodal y comprobar que el servidor devuelve respuestas bien formadas.
- Desarrollo de herramientas de inspección de arquitectura: permite recorrer la estructura MoE, el indexador DSA y las Hyper-Connections con un coste de memoria mínimo.
- Pruebas de contenedores y stacks CUDA: el ejemplo documenta el uso con CUDA 13, torch 2.14.1+cu130, flashinfer 0.7.4 y las librerías `sgl-fa3` y `sgl-flash-mla`, útil para validar imágenes de Docker.
- Reproducción de fallos y regresiones: al ser determinista en estructura, permite aislar problemas de kernel o de versión de Transformers sin variabilidad de pesos entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (20,1 MB de pesos más activaciones y caché KV); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4090 o superiores; el ejemplo de SGLang se documenta sobre H20.
- Cabe en GPU consumer: sí, sin restricciones prácticas de memoria.
- Opciones de despliegue: Transformers con `attn_implementation="eager"` (verificado), SGLang desde la PR #51672 (no verificado, requiere instalación desde git y stack CUDA 13). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo de prueba, las cifras no serían representativas del modelo fuente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| tiny-random/hy4 | 10,04 M | no disponible | no disponible | Pruebas y depuración de la arquitectura Hy4 |
| tencent/Hy4 | 774,40 B (BF16) | no disponible | no disponible | Modelo multimodal real imagen-texto-vídeo |
| Otros `tiny-random/*` de Hugging Face | Variable (típicamente millones) | no disponible | variable | Validación de arquitecturas en Transformers |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no ha sido entrenado y sus salidas carecen de significado; no debe usarse en producción ni para evaluación de calidad.
- Sesgos conocidos: no disponibles, al no existir entrenamiento con datos reales.
- Riesgo de alucinación: total, cualquier texto generado es ruido estadístico sin relación con la entrada.
- Limitaciones de contexto e idioma: no disponibles; el vocabulario replica el del modelo fuente (120.832 filas) pero sin embeddings aprendidos.
- Restricciones de licencia: la licencia no está declarada en el repositorio, por lo que no se puede asumir uso comercial sin consultar la licencia de `tencent/Hy4`.
- El drafter DFly2 está presente en el checkpoint pero no se ejecuta en Transformers; el soporte en SGLang está sin verificar y depende de una PR no publicada como wheel.
- La atención DSA con sinks aprendidos no tiene kernel optimizado en Transformers; el ejemplo usa atención eager, con el coste de rendimiento asociado.
- Requiere una versión de Transformers instalada desde un commit concreto de git, no disponible en releases estables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiny-random/hy4
- Modelo base: https://huggingface.co/tencent/Hy4
- Commit de Transformers requerido: https://github.com/huggingface/transformers@439bba079891ecd766900e8ce80ee961b94ef132
- PR de SGLang con soporte Hy4-VL: https://github.com/sgl-project/sglang/pull/51672
- Commit de SGLang: https://github.com/sgl-project/sglang.git@a0804a2f99719f5666ed2018e5d00a75645de6a8
- Cookbook de Hy4 en SGLang: https://docs.sglang.io/cookbook/autoregressive/Tencent/Hy4
- Script de creación: https://huggingface.co/tiny-random/hy4/blob/main/.meta/create_model.py
- Log de estructura: https://huggingface.co/tiny-random/hy4/blob/main/.meta/model.log
- Entorno de creación: https://huggingface.co/tiny-random/hy4/blob/main/.meta/env.json
