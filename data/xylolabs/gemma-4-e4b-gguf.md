# Xylolabs/gemma-4-E4B-GGUF

## Resumen

Gemma 4 E4B Base repaired Q4 reference control es una conversión a GGUF del modelo base google/gemma-4-E4B, publicada por Xylolabs. No se trata de un modelo nuevo ni de un ajuste fino: es una exportación de referencia en formato llama.cpp que conserva el decodificador de texto de 42 capas, los embeddings y la cabeza de salida, omitiendo por completo la visión y su proyector. Su propósito declarado es servir como "barra de control" (reference control) dentro de la metodología de evaluación del autor, no como un modelo recomendado para uso general.

El elemento diferencial frente a una cuantización Q4_K_M convencional es una "reparación": exactamente 42 tensores `blk.N.proj.weight` se elevan de Q4_K a Q8_0, mientras que los otros 678 tensores son byte a byte idénticos al archivo Q4 plano. Las tablas de embeddings se mantienen en Q6_K y `per_layer_model_proj.weight` en BF16, lo que eleva el promedio del archivo a 5,675 bits por peso y su tamaño a 5,349 GB.

La relevancia es acotada y conviene entenderla bien: el autor publica explícitamente que esta exportación falla la comprobación estricta de respuestas (20/28 frente a 27/28 del BF16) y que no la recomienda sobre BF16. Es, por tanto, un artefacto de reproducibilidad y auditoría para quien quiera inspeccionar el efecto de precisión en proyecciones por capa, no una opción de despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (42 capas de texto), derivada de google/gemma-4-E4B; vision y proyector omitidos |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la metadata original de contexto se mantiene sin cambios; los ejemplos de carga usan 2.048 y las comprobaciones GPU actuales 8.192 tokens) |
| Tipos de cuantizacion | Q4_K_M con proyecciones por capa en Q8_0; tipos reales de tensor: BF16 (1), F32 (339), Q4_K (294), Q6_K (44), Q8_0 (42) |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), archivo `gemma-4-E4B-Q4_K_M-proj8.gguf` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base google/gemma-4-E4B, un transformer decoder de 42 capas con 720 tensores en el decodificador de texto, embeddings y cabeza de salida. Esta publicación no entrena, no calibra y no cuantiza de nuevo: es una conversión retenida. El único cambio respecto al archivo Q4 plano es la elevación a Q8_0 de los 42 tensores `blk.N.proj.weight` (uno por capa); los 678 restantes son idénticos byte a byte. Las tablas de embeddings permanecen en Q6_K y `per_layer_model_proj.weight` en BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO, más allá de lo que declare la release original de Google, que esta ficha no reproduce. La innovación técnica del artefacto es metodológica, no arquitectónica: fija un punto de control reproducible con huella de calibración y evaluación completa (16 secuencias crudas de 512 tokens en inglés y coreano, 8.176 posiciones puntuadas, presupuestos de 48 tokens o 96 para código) para medir el impacto de la precisión en las proyecciones por capa.

## Capacidades

- Generación de texto autoregresiva en modo raw completion, orientada a continuación de texto plano.
- Razonamiento aritmético y de orden básico, evaluado en el conjunto de 28 ítems del autor (con regresiones contadas en `en-arith-add` y `en-reason-order`).
- Generación de código a partir de firma de función y docstring, con presupuesto de 96 tokens (regresión contada en `ko-code-gcd`).
- Capacidades multilingües limitadas a inglés y coreano según la metadata del modelo.
- Compatible con endpoints (`endpoints_compatible` en los tags).
- No incluye visión: el codificador visual y su proyector están omitidos de la exportación.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes o modo thinking en esta exportación.

## Casos de uso

- Auditoría de cuantización: sirve como punto de comparación fijo para medir cuánta calidad se pierde al bajar proyecciones por capa de Q8_0 a Q4_K, usando la comparación estricta de 28 ítems y la KL media (0,248919) como métricas de referencia.
- Reproducibilidad de evaluaciones: al conservar los identificadores de secuencia, tokens, posiciones puntuadas, prompts, stops y presupuestos originales, permite replicar exactamente un experimento de calibración y evaluación en inglés y coreano.
- Verificación de conversiones GGUF: útil para validar que una herramienta de conversión produce tensores idénticos byte a byte salvo en los 42 tensores modificados, comparando hashes LFS públicos.
- Pruebas de carga en llama.cpp: el ejemplo de `llama-completion` con contexto 2.048 y temperatura 0 sirve para validar que un binario de llama.cpp concreto carga y ejecuta el grafo sin errores.
- Docencia e investigación sobre formatos: caso práctico de cómo los tipos de tensor mixtos (BF16, F32, Q6_K, Q4_K, Q8_0) afectan al tamaño de archivo y al promedio de bits por peso.
- Referencia negativa en selección de modelos: documenta un caso donde subir precisión en proyecciones no recupera la calidad del BF16, útil para justificar decisiones de empaquetado en pipelines internos.

## Benchmarks y rendimiento

| Metrica | Este modelo (Q4_K_M proj8) | BF16 de referencia |
|---|---|---|
| Comprobacion estricta de respuestas (28 items) | 20/28 (FAIL) | 27/28 |
| KL media | 0,248919 | 0 (referencia) |
| Regresiones contadas | 4 (`en-arith-add`, `en-reason-order`, `ko-reason-age`, `ko-code-gcd`) | 0 |
| Empates cercanos excluidos | 3 (`en-arith-price`, `en-code-prime`, `ko-reason-balls`) | no aplica |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que no se reporta velocidad y que los textos y prompts retenidos no establecen un resultado de tarea downstream.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,33 GB solo para los pesos de control de referencia, más espacio para la caché KV y buffers de trabajo.
- El archivo pesa 5,349 GB en descarga, con un promedio de 5,675 bits por peso.
- Cabe en GPU de consumo con 8 GB o más de VRAM; con 6 GB el margen para caché KV y buffers es muy ajustado.
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal utilizada por llama.cpp; el autor referencia comprobaciones GPU con contexto 8.192 sin especificar el modelo de GPU.
- Despliegue: llama.cpp (revisión `cd959bae99ff4bed22bef2604f45241c09bbb8c8`), herramienta `llama-completion`. No se documentan otras opciones como vLLM, TGI u Ollama para este artefacto.
- Latencia y throughput: no disponibles; el autor declara que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-E4B-GGUF (este) | 7.518.069.290 | no disponible | GGUF Q4_K_M proj8 | Apache 2.0 | 20/28 en comprobacion estricta; 5,349 GB |
| mradermacher/gemma-4-E4B-GGUF | mismos pesos base | no disponible | GGUF Q4_K_M y Q8_0 planos | Apache 2.0 | Conversiones estándar sin reparación; hashes LFS públicos coincidentes con el Q4 plano |
| google/gemma-4-E4B (BF16) | 7.518.069.290 | no disponible | safetensors | Apache 2.0 | 27/28 en la misma comprobacion; referencia de calidad |

## Limitaciones y advertencias

- Falla la comprobación estricta de respuestas del propio autor: 20/28 frente a 27/28 del BF16, con KL media de 0,248919.
- El autor declara explícitamente que no recomienda este modelo sobre BF16.
- No es una release de Tensix: es un control de referencia y no debe interpretarse como una mejora de calidad.
- Omite visión y su proyector, por lo que no puede procesar imágenes.
- Idiomas limitados a inglés y coreano; no hay evidencia de rendimiento en castellano.
- Riesgo de alucinación inherente a un modelo base sin ajuste instructivo: no sigue instrucciones conversacionales de forma fiable.
- No hay datos publicados de tool calling ni de comportamiento en agentes; asumir que no los soporta.
- La licencia Apache 2.0 la declara la release de Google fijada; la release base no incluye archivo legal raíz y el autor aporta LICENSE y NOTICE propios. Se entrega "as is", sin garantía ni aval upstream.
- Los textos y prompts retenidos no constituyen un resultado de tarea downstream; no deben citarse como evidencia de rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Conversiones GGUF estándar de referencia: https://huggingface.co/mradermacher/gemma-4-E4B-GGUF
- Repositorio de código llama.cpp (revisión usada): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Herramienta de completado de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
- Repositorio de Xylolabs (assets y tooling): https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E4B-GGUF/blob/main/LICENSE
