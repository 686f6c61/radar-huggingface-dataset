# tiny-random/kimi-k3.1-pro

## Resumen

`tiny-random/kimi-k3.1-pro` es un modelo de prueba de inicialización aleatoria (randomly initialized) publicado por el usuario `tiny-random` y derivado de `moonshotai/Kimi-K3.1-Pro`. No es un modelo entrenado ni utilizable en producción: su función es servir como fixture de depuración para validar la carga, el pipeline `image-text-to-text` y el código de modelado remoto de la arquitectura Kimi K3.1 sin necesidad de descargar el checkpoint original de 1,56 TB.

El modelo reproduce a escala mínima la estructura del Kimi K3.1-Pro real: 17 capas (11 KDA + 5 gated-DSA + 1 densa), atención MLA con LoRA de rango reducido, expertos enrutados en precisión MXFP4 empaquetada y un codificador visual de 2 capas. Conserva la longitud máxima de contexto declarada por el modelo fuente, 1.048.576 tokens, así como el vocabulario de 163.840 entradas sin atado (untied).

Es relevante ahora porque el K3.1-Pro original no publica código de modelado propio: este repositorio incluye el `modeling_kimi_k3.py` fijado (pinned) que Transformers necesita para cargar la arquitectura, y documenta explícitamente que los kernels gated-DSA aún no están disponibles en las versiones publicadas de Transformers, vLLM o SGLang, por lo que las capas DSA ejecutan su núcleo MLA. Con 26.725.136 parámetros totales y un repositorio de 0,2 GB, permite iterar sobre integraciones de serving sin infraestructura masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención KDA (delta attention), gated-DSA sobre núcleo MLA y MLP con mezcla de expertos (MoE) |
| Parametros totales | 26.725.136 |
| Parametros activos | no disponible (el checkpoint declara 16 expertos enrutados con top-k 8 y 2 expertos compartidos, pero no se publica el recuento de parámetros activos) |
| Longitud de contexto | 1.048.576 tokens (heredada de la config del modelo fuente) |
| Tipos de cuantizacion | Expertos enrutados en MXFP4 empaquetado (grupo 32, escalas E8M0); resto de pesos en BF16 y F32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 35,58 MB) |
| Capas totales / DSA-gated | 17 / 5 (más 11 KDA y 1 densa) |
| Ancho oculto / ancho MLP | 8 / 32 |
| Cabezas Q de atención completa / dim de cabeza | 8 / 128 (nope 128, rope 64, v 128) |
| Rango LoRA MLA q / kv | 128 / 512 |
| Expertos enrutados / compartidos, top-k | 16 / 2, 8 |
| Cabezas del indexador LSA / dim / topk | 32 / 128 / 2.048 |
| Capas físicas del indexador DSA | [3, 7, 11, 15, 16] |
| Profundidad / ancho / cabezas de visión | 2 / 64 / 2 |
| Tamano de parche visual | 14 |
| Vocabulario / atado | 163.840 / untied |

## Arquitectura y entrenamiento

El modelo replica la topología del Kimi K3.1-Pro a escala diminuta. La pila combina 11 capas con atención KDA (delta attention, implementada en Triton mediante `fla-core`), 5 capas con atención gated-DSA que en la práctica ejecutan su núcleo MLA al no existir kernel gated-DSA en las versiones publicadas de Transformers, y 1 capa densa. La atención MLA usa rangos LoRA de 128 para las proyecciones q y 512 para kv, con cabezas de 128 dimensiones y descomposición nope/rope de 128/64. El MLP es una mezcla de expertos con 16 expertos enrutados (top-k 8) y 2 compartidos, con pesos enrutados almacenados en MXFP4 empaquetado.

No hay entrenamiento: los pesos son inicializaciones aleatorias generadas por un script (`.meta/create_model.py`, ejecutado con GPT-6.1-Sol según la model card). El checkpoint fuente declara 57,36B elementos en BF16, 11,12M en F32 y 1,45T en U8; este repositorio reduce esas cifras a 13,98M BF16, 163,07K F32 y 6,68M U8. El codificador visual se recorta de 27 a 2 capas, con ancho 64 y 2 cabezas, manteniendo el tamaño de parche de 14. Los tensores del indexador LSA se incluyen de forma compatible hacia adelante, pero no se consumen en la inferencia actual.

## Capacidades

- Carga y ejecución del pipeline `image-text-to-text` con `AutoProcessor` y `AutoModel` bajo `trust_remote_code=True`, verificado en GPU con `attn_implementation="eager"`.
- Procesamiento de entradas multimodales imagen-texto: acepta mensajes con contenido tipado (`{"type": "image"}` y `{"type": "text"}`) y devuelve secuencias generadas.
- Generación de texto con `model.generate`, útil para probar rutas de decodificación y formas de tensores de salida.
- Validación de integraciones de serving: la model card incluye recetas de vLLM (`--tensor-parallel-size 8`, `--max-model-len 131072`) y SGLang (`--tp-size 8`, `--reasoning-parser kimi_k3`, `--tool-call-parser kimi_k3`), marcadas como no verificadas.
- Ejercicio del contrato del indexador LSA (32 cabezas, dim 128, topk 2.048) para desarrollo de kernels futuros.
- No dispone de capacidades reales de razonamiento, código, matemáticas ni multilingüismo: al ser pesos aleatorios, la salida generada es incoherente.

## Casos de uso

- Pruebas de integración de Transformers: cargar el modelo con `trust_remote_code=True` para verificar que el `modeling_kimi_k3.py` fijado resuelve correctamente la config de Kimi K3.1 sin descargar el checkpoint de 1,56 TB.
- Desarrollo de kernels gated-DSA: usar las 5 capas DSA y los tensores del indexador LSA como fixture para validar nuevas implementaciones en CUDA o Triton antes de portarlas al modelo completo.
- CI/CD de pipelines de serving: ejecutar `vllm serve` o `sglang.launch_server` contra este repositorio en runners con GPU para comprobar flags de parser (`kimi_k3`), gestión de KV cache en `fp8_e4m3` y chunked prefill sin coste de almacenamiento.
- Validación de cuantización MXFP4: comprobar que las herramientas de carga interpretan correctamente los expertos empaquetados con grupo 32 y escalas E8M0.
- Pruebas de forma del pipeline multimodal: verificar el preprocesado de imágenes de 56x56 con parche 14 y la construcción de `input_ids`/`pixel_values` en conversaciones multi-turno.
- Benchmarking de infraestructura: medir latencia de arranque, tiempo de carga y overhead de `trust_remote_code` en distintas versiones de la librería sin depender de pesos reales.
- Docencia y demostraciones: ilustrar la estructura interna de un transformer híbrido KDA/DSA/MoE con un checkpoint de 35 MB que cabe en cualquier GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de inicialización aleatoria, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para los 26,7M de parámetros (35,58 MB de pesos más estados de activación y caché KV); con contexto completo de 1.048.576 tokens la caché KV dominaría el consumo, pero no se dispone de cifra publicada.
- GPU recomendadas: cualquier GPU con soporte de Triton, necesario para la atención KDA vía `fla-core`; la model card verifica la carga en GPU sin especificar modelo.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos unos pocos GB de VRAM (RTX 3060 en adelante).
- Opciones de despliegue: Transformers (verificado), vLLM (no verificado, requiere build con soporte KimiK31 gated-DSA posterior al wheel publicado), SGLang (no verificado, requiere versión superior a 0.5.23 con indexador KimiK31 DSA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-random/kimi-k3.1-pro | 26,7M | 1.048.576 | Fixture de depuración de la arquitectura Kimi K3.1 | no disponible | Hugging Face, 691 descargas |
| moonshotai/Kimi-K3.1-Pro | no disponible (checkpoint de 1,56 TB) | 1.048.576 | Modelo real multimodal y MoE | no disponible | Hugging Face |
| Otros modelos `tiny-random` de la misma familia | no disponible | no disponible | Fixtures equivalentes para otras arquitecturas | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no ha sido entrenado y produce salidas incoherentes; no debe usarse para inferencia real ni evaluación de calidad.
- Los kernels gated-DSA no están disponibles en las versiones publicadas de Transformers, vLLM ni SGLang; las capas DSA ejecutan su núcleo MLA y los tensores del indexador LSA se cargan pero no se consumen.
- Las recetas de serving de vLLM y SGLang están marcadas como no verificadas y exigen builds posteriores a los wheels publicados en la fecha de creación del modelo.
- Licencia no disponible: no se puede confirmar el uso comercial; al derivar de `moonshotai/Kimi-K3.1-Pro`, conviene consultar la licencia del modelo base antes de cualquier redistribución.
- Idiomas soportados no disponibles; el vocabulario de 163.840 entradas se hereda del modelo fuente pero sin entrenamiento asociado.
- El contexto máximo declarado de 1.048.576 tokens no es funcional en la práctica: la caché KV para esa longitud excede con creces el tamaño del propio checkpoint y no hay implementación verificada.
- Riesgo de confusión: el nombre del repositorio puede llevar a error sobre su naturaleza; no es una versión reducida destilada ni un modelo destilado del K3.1-Pro.
- Generado automáticamente por GPT-6.1-Sol según la model card; la reproducibilidad depende de los scripts en `.meta/`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiny-random/kimi-k3.1-pro
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Receta de serving vLLM para el modelo base: https://recipes.vllm.ai/moonshotai/Kimi-K3.1-Pro
- Script de creación: https://huggingface.co/tiny-random/kimi-k3.1-pro/blob/main/.meta/create_model.py
- Estructura del modelo: https://huggingface.co/tiny-random/kimi-k3.1-pro/blob/main/.meta/model.log
- Entorno de generación: https://huggingface.co/tiny-random/kimi-k3.1-pro/blob/main/.meta/env.json
- Perfil del contribuidor: https://huggingface.co/akopytko
