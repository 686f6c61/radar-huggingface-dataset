# tiny-random/kimi-k3.1-pro

## Resumen

`tiny-random/kimi-k3.1-pro` es un modelo de prueba de inicialización aleatoria (randomly initialized) construido por el usuario `tiny-random` a partir de la arquitectura declarada de `moonshotai/Kimi-K3.1-Pro`. No es un modelo entrenado ni funcional: su propósito es servir como banco de pruebas para validar la carga de pesos, el procesador multimodal y el código de modelado remoto asociado a la familia Kimi K3.1. El checkpoint real de referencia ocupa 1,56 TB en 96 ficheros safetensors, mientras que esta versión reducida cabe en un único `model.safetensors` de 144,02 MB.

La arquitectura declarada combina atención lineal KDA (Kimi Delta Attention) con capas de atención dispersa gated DSA (Deep Sparse Attention) y un backbone Mixture-of-Experts con enrutamiento latente. El modelo base anuncia una longitud de contexto máxima de 1.048.576 tokens y una composición de 93 capas (69 KDA, 24 DSA con compuerta y 1 densa). Esta réplica tiny conserva 17 capas en una cadencia de 12 KDA más 5 DSA, con anchura residual de 8 y anchura MLP de 32.

Su relevancia es puramente instrumental: permite a desarrolladores e investigadores verificar pipelines de carga, compatibilidad de `trust_remote_code` y contratos de tensores (incluido el indexador LSA y el empaquetado MXFP4 de expertos enrutados) sin necesidad de aprovisionar un clúster multi-GPU. No debe emplearse para inferencia real ni para evaluación de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: KDA (atención lineal) + gated DSA (atención dispersa) + MLA, con MoE de expertos enrutados |
| Parametros totales | 219.219.088 (según safetensors del repo tiny) |
| Parametros activos | no disponible (top-k de expertos enrutados = 16 sobre 64 enrutados + 2 compartidos) |
| Longitud de contexto | 1.048.576 tokens (heredada de la configuración del modelo base) |
| Tipos de cuantizacion | Pesos en BF16/F32 y expertos enrutados en MXFP4 empaquetado nativo (grupo 32, escalas E8M0); tag `8-bit` y `compressed-tensors` en el repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 144,02 MB) |

## Arquitectura y entrenamiento

El modelo base Kimi-K3.1-Pro declara una pila de 93 capas compuesta por 69 capas KDA, 24 capas de atención completa sustituidas por gated DSA con indexador LSA y 1 capa densa. La anchura oculta es de 7.168 y la anchura MLP de 33.792, con 96 cabezas de atención completa de dimensión 128 (nope 128, rope 64, v 128) y rangos LoRA MLA de 1.536 (q) y 512 (kv). El MoE cuenta con 896 expertos enrutados y 2 compartidos, con top-k 16. El indexador LSA usa 32 cabezas de índice, dimensión 128 y top-k 2.048.

La réplica tiny reduce esta geometría a 17 capas (11 KDA, 5 DSA y 1 densa), anchura residual 8 y MLP 32, manteniendo el contrato del indexador LSA (32 cabezas, dim 128, top-k 2.048) en cinco capas físicas [3, 7, 11, 15, 16]. Los expertos enrutados se almacenan en MXFP4 empaquetado idéntico al checkpoint fuente, y se incluyen los parches de compatibilidad de atención eager, máscara causal y compuerta por canal usados por `tiny-random/kimi-k3`. No hay entrenamiento: los pesos son aleatorios.

Limitación técnica relevante: la versión publicada de Transformers no incluye el operador gated-DSA, por lo que las capas DSA ejecutan su núcleo MLA y los tensores del indexador LSA se cargan pero no se consumen. El serving con vLLM o SGLang requiere builds con soporte KimiK31 DSA, posteriores a las wheels publicadas en la fecha de creación del repo.

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios y la salida es ruido estadístico.
- Interfaz multimodal image-text-to-text declarada (procesador con soporte de imagen y texto), con parche de 14 píxeles y torre de visión de 2 capas, hidden 64, 2 cabezas en esta réplica.
- Contrato de tool calling y reasoning parser referenciado en los ejemplos de serving (`--reasoning-parser kimi_k3`, `--tool-call-parser kimi_k3`), heredado de la familia K3, no verificado en esta réplica.
- Soporte de vocabulario de 163.840 filas sin tying, heredado del modelo base.
- No apto para generación de texto, razonamiento, código, matemáticas ni agentes: cualquier evaluación de capacidades sobre este checkpoint carece de validez.

## Casos de uso

- Validación de carga de checkpoints: comprobar que `AutoModel.from_pretrained` con `trust_remote_code=True` resuelve correctamente el código de modelado remoto K3 y materializa los tensores sin errores de forma.
- Pruebas de integración de procesadores multimodales: verificar el pipeline `AutoProcessor` con mensajes que combinan imagen y texto antes de escalar al checkpoint completo.
- Test de compatibilidad de kernels: ejercitar el camino KDA con Triton (vía `fla-core`) y el camino MLA en GPUs pequeñas para detectar regresiones en entornos de CI.
- Verificación de contratos de tensores forward-compatible: comprobar que los tensores del indexador LSA y el empaquetado MXFP4 de expertos enrutados se cargan aunque el runtime no los consuma todavía.
- Desarrollo de operadores gated-DSA: usar esta réplica como fixture para implementar y testear el operador ausente en Transformers, vLLM o SGLang sin necesidad de un clúster.
- Pruebas de despliegue en vLLM/SGLang: validar flags de serving (`--tensor-parallel-size`, `--kv-cache-dtype fp8_e4m3`, `--chunked-prefill-size`) en un entorno con requisitos de memoria triviales.
- Docencia y demos de arquitectura: ilustrar la topología híbrida KDA+DSA+MoE con un modelo inspeccionable en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de inicialización aleatoria, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería meaningless y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (144 MB de pesos más activaciones y caché KV reducida por la geometría tiny).
- GPU recomendadas: cualquier GPU con soporte BF16 y Triton (RTX 3090, RTX 4090, A100, H100); el camino KDA requiere Triton vía `fla-core`.
- Cabe holgadamente en GPU consumer, incluidas GTX 16xx en FP32 si se evita el camino Triton.
- Opciones de despliegue: Transformers con `attn_implementation="eager"` y `trust_remote_code=True`; vLLM y SGLang solo con builds que incluyan soporte KimiK31 DSA (no disponibles en las wheels citadas).
- Latencia y throughput: no disponibles; no representativos del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-random/kimi-k3.1-pro | 219,2 M | 1.048.576 (declarado) | Réplica aleatoria de test | no disponible | HuggingFace |
| tiny-random/kimi-k3 | no disponible | 1.048.576 (declarado) | Réplica aleatoria de test de K3 | no disponible | HuggingFace |
| moonshotai/Kimi-K3.1-Pro | 57,36 B BF16 + 1,45 T U8 (checkpoint) | 1.048.576 | Modelo real de producción | no disponible | HuggingFace (referenciado) |

La comparación con alternativas de la misma categoría (modelos tiny de test) se limita a `tiny-random/kimi-k3`, del que este repo hereda geometría y parches. Frente al checkpoint real, la diferencia de escala es de cuatro órdenes de magnitud en parámetros y de más de diez mil en tamaño de almacenamiento.

## Limitaciones y advertencias

- Pesos aleatorios: no apto para producción, evaluación de calidad ni uso comercial real.
- Sin licencia declarada: la ausencia de licencia impide determinar condiciones de uso comercial o de redistribución.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Operador gated-DSA ausente en Transformers, vLLM y SGLang publicados: las capas DSA ejecutan MLA denso y el indexador LSA no se consume, por lo que el comportamiento no refleja la arquitectura objetivo.
- Ejemplos de uso marcados como "unverified" por el propio autor; el `model_id` de los snippets (`scratch/kimi-k31`) no coincide con el del repo.
- Riesgo de alucinación total: la salida es ruido; cualquier texto generado es sintácticamente plausible pero semánticamente vacío.
- El checkpoint fuente declara 1,45 T elementos U8 y 57,36 B BF16, lo que implica requisitos de almacenamiento y serving muy superiores a los de esta réplica; no extrapolar requisitos desde el tiny.
- Repo generado automáticamente por un modelo ("GPT-6.1-Sol" según la model card); revisar procedencia antes de confiar en la configuración.

## Enlaces

- Repo HuggingFace: https://huggingface.co/tiny-random/kimi-k3.1-pro
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Réplica hermana K3: https://huggingface.co/tiny-random/kimi-k3
- Receta de serving vLLM citada: https://recipes.vllm.ai/moonshotai/Kimi-K3.1-Pro
- Script de creación: `.meta/create_model.py` (dentro del repo)
- Log de estructura: `.meta/model.log` (dentro del repo)
- Entorno: `.meta/env.json` (dentro del repo)
