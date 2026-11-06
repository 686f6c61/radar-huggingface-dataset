# tiny-random/minicpm-v-4.7

## Resumen

`tiny-random/minicpm-v-4.7` es un checkpoint de juguete (tiny model) generado automáticamente a partir de la arquitectura de `openbmb/MiniCPM-V-4.7-1B`, un modelo multimodal denso de la familia MiniCPM-V desarrollada por OpenBMB. No es un modelo entrenado ni utilizable en producción: sus pesos son inicializaciones aleatorias y su propósito declarado es servir como banco de pruebas para pipelines de inferencia, integración con `transformers` y validación de código de carga de modelos, no para generar respuestas con sentido.

El repositorio replica fielmente la estructura del modelo original (tokenizador, configuración de visión, esquema de atención híbrida, M-RoPE, etc.) pero con dimensiones drásticamente reducidas: 11,54 millones de parámetros frente a los 1,55 mil millones del modelo base, 8 capas de backbone en lugar de 24 y un ancho oculto de 16 en lugar de 1.024. Aun así conserva dos ciclos completos del patrón de atención lineal/lineal/lineal/completa, lo que lo convierte en un caso de test válido para verificar que una implementación de inferencia soporta correctamente esa cadencia.

Su relevancia es puramente práctica para desarrolladores: permite probar en minutos, incluso en CPU o en una GPU modesta, que el código de carga, el procesador multimodal (imagen + vídeo), el chat template y la ruta de atención lineal con CUDA/Triton funcionan antes de escalar al checkpoint real de 1B. No debe confundirse con un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso con atención híbrida (3 capas de atención lineal + 1 de atención completa por ciclo), backbone MiniCPM-V 4.7 |
| Parametros totales | 11.544.992 (11,54 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base declara config de M-RoPE tipo canvas, sin cifra explícita) |
| Tipos de cuantizacion | no disponible (checkpoint en BF16; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), un único archivo `model.safetensors` de 23,1 MB |

## Arquitectura y entrenamiento

El modelo replica la topología de MiniCPM-V 4.7 en versión reducida. El backbone consta de 8 capas organizadas en dos ciclos completos del patrón "tres capas de atención lineal + una capa de atención completa". Mantiene 8 cabezas de query, 2 cabezas KV y dimensión de cabeza 256, además de la ruta de atención lineal con 16 cabezas de clave/valor de dimensión 128. El ancho oculto es 16 y el ancho del MLP es 32, valores mínimos que preservan la forma tensorial pero no la capacidad representacional. El vocabulario se mantiene intacto en 248.094 filas con embeddings no atados (tied embeddings = false), lo que explica que el checkpoint ocupe 23 MB pese a tener solo 11,5 M de parámetros efectivos.

El componente de visión conserva 4 capas con ancho 128 y un merger de inserción tras la capa 2 (frente a 27 capas y ancho 1.152 en el original). Se preserva la configuración M-RoPE con secciones 11/11/10 y fracción parcial 0,25, así como la declaración de una capa MTP en la config aunque sin tensores MTP reales. No ha habido entrenamiento: los pesos son aleatorios, no se aplicó RLHF, DPO ni preentrenamiento. La model card indica que el repo fue generado por DeepSeek-V4.1-Flash y que la ruta de atención lineal requiere CUDA y Triton, verificada en una NVIDIA A800-SXM4-80GB.

## Capacidades

- Carga y ejecución end-to-end del pipeline `image-text-to-text` con `transformers` (verificado por el autor con `transformers[torch]>=5.18.0`).
- Procesamiento conjunto de imagen y vídeo en una misma petición mediante `AutoProcessor` y `VideoMetadata`, con parámetros de downsampling (`downsample_mode="16x"`, `max_num_frames`, `max_slice_nums`).
- Soporte del chat template multimodal con `enable_thinking` conmutable (el modo thinking está desactivado en el ejemplo).
- Ejercicio de la ruta de atención lineal híbrida (CUDA + Triton), útil para validar kernels personalizados.
- Generación de logits finitos y `generate()` funcional, apto para tests de integración y smoke tests.
- No tiene capacidades reales de razonamiento, código, matemáticas ni comprensión visual: al ser pesos aleatorios, sus salidas son ruido estadístico.

## Casos de uso

- Smoke test de pipelines de inferencia: cargar el modelo con `AutoModelForImageTextToText` y ejecutar una generación corta para verificar que la versión de `transformers`, el `dtype` y el `attn_implementation` funcionan antes de mover el checkpoint real de 1B a producción.
- Validación de kernels de atención lineal: al conservar dos ciclos completos del patrón lineal/completa, permite comprobar que la implementación Triton/CUDA de la atención lineal se invoca correctamente y devuelve logits finitos.
- Test de integración continua (CI): su tamaño de 23 MB y su ejecución en segundos lo hacen adecuado para incluirlo en la suite de tests de una librería o servicio que dé soporte a la familia MiniCPM-V.
- Verificación de procesadores multimodales: sirve para probar el flujo `apply_chat_template` con imagen + vídeo, el manejo de `VideoMetadata` y los parámetros de downsampling sin coste computacional apreciable.
- Depuración de chat templates y tokenizadores: al mantener el vocabulario de 248.094 filas, permite validar la tokenización y el formateo de mensajes del modelo original sin cargar los 3,11 GB de pesos.
- Pruebas de compatibilidad de endpoints: el tag `endpoints_compatible` sugiere su uso para validar el contrato de la API de inferencia (esquema de entrada/salida) antes de conectar el modelo real.
- Benchmarking de infraestructura: medir tiempos de carga, overhead del procesador y latencia base de un despliegue sin que el coste del modelo enmascare los cuellos de botella del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, MMMU, etc.) sería irrelevante y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (23 MB de pesos más activaciones y caché KV del vocabulario); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4090, A100, H100 o A800. La ruta de atención lineal exige CUDA y Triton; el autor la verificó en una A800-SXM4-80GB.
- Cabe en consumer GPU: sí, en todas las GPU NVIDIA con CUDA; también es viable en CPU para pruebas básicas, aunque la ruta de atención lineal puede no estar disponible fuera de CUDA.
- Opciones de despliegue: `transformers` (verificado), potencialmente vLLM o TGI si soportan la arquitectura MiniCPM-V 4.7 (no verificado en la información disponible). No se publican pesos GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa.
- Latencia y throughput: no disponibles; por el tamaño, la generación de pocos tokens se completa en segundos incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| tiny-random/minicpm-v-4.7 | 11,54 M | no disponible | no disponible | Test y depuración |
| openbmb/MiniCPM-V-4.7-1B (base) | 1,55 B (BF16) | no disponible | no disponible | Modelo multimodal real |
| Otros tiny models de la familia (p. ej. variantes `tiny-random/*`) | variable | no disponible | no disponible | Test y depuración |

La comparación relevante es con su modelo base: el tiny conserva la arquitectura, el vocabulario y la configuración multimodal, pero reduce parámetros en un factor de ~134 (11,54 M frente a 1,55 B) y el tamaño del checkpoint en un factor de ~135 (23,1 MB frente a 3,11 GB). Frente a otros modelos multimodales pequeños desplegables (p. ej. variantes de 1B a 3B), este checkpoint no es comparable en calidad porque no ha sido entrenado.

## Limitaciones y advertencias

- Pesos aleatorios: no ha sido entrenado; sus salidas carecen de significado y no debe usarse para ninguna tarea real de generación, razonamiento o comprensión visual.
- No apto para producción: no debe desplegarse como servicio de cara al usuario bajo ninguna circunstancia.
- Licencia no disponible: no se especifica licencia, lo que impide determinar condiciones de uso comercial o redistribución.
- Idiomas no disponibles: no se declara cobertura lingüística.
- Dependencia de CUDA y Triton para la ruta de atención lineal: en entornos sin GPU NVIDIA la ejecución puede fallar o degradarse.
- Requiere `transformers[torch]>=5.18.0` y `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene revisarlo antes de usarlo en entornos sensibles.
- El vocabulario completo (248.094 filas) domina el tamaño del checkpoint, por lo que el recuento de parámetros efectivos (11,5 M) no refleja el coste real de carga.
- Sin datos de benchmarks, sesgos o robustez: no hay información para evaluar comportamiento en dominios concretos.
- La fecha de creación indicada (2026-11-01) y la generación automática por DeepSeek-V4.1-Flash deben tratarse como metadatos del repo, no como garantía de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiny-random/minicpm-v-4.7
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Script de creación del repo: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura del modelo: `.meta/model.log` (dentro del repositorio)
- Entorno de generación: `.meta/env.json` (dentro del repositorio)
- Repositorio de OpenBMB (organización): https://huggingface.co/openbmb
