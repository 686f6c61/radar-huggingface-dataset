# ThakiCloud/Qwen3.8-27B-Human-KO-NVFP4

## Resumen

El modelo **ThakiCloud/Qwen3.8-27B-Human-KO-NVFP4** es una cuantización NVFP4 (W4A4) del modelo coreano **ThakiCloud/Qwen3.8-27B-Human-KO**, desarrollado por ThakiCloud. Este último es una adaptación al coreano del modelo denso Qwen3.8-27B de la familia Qwen3.8, con un enfoque en alineación de estilo (style-alignment) para generar respuestas en un registro conversacional cortés y natural. La cuantización se realizó con llm-compressor (GPTQ) y se distribuye en formato compressed-tensors, que vLLM reconoce automáticamente.

El objetivo principal de esta versión es reducir el peso del modelo de aproximadamente 55,6 GB (bf16) a unos 15 GB, permitiendo servir una ventana de contexto nativa de 262 144 tokens (256K) en una sola GPU Blackwell B200 con amplio margen de KV cache. Según las mediciones del autor, la calidad se mantiene dentro de los límites de detección estadística respecto al original bf16, con diferencias de −2,4 pp en KMMLU y +4,9 pp en HAE-RAE (ambas no significativas con z < 1,1).

El modelo está pensado para despliegue en producción con vLLM en hardware Blackwell (SM100+), donde los kernels NVFP4 nativos ofrecen un rendimiento óptimo. En arquitecturas inferiores puede no cargar o degradar significativamente la velocidad. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (16 capas full attention, 48 capas linear attention) |
| Parametros totales | 18 800 348 400 (18,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 (W4A4) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atencion hibrida: de las 64 capas, solo 16 utilizan atencion completa (con intervalo de 4), mientras que las 48 restantes usan atencion lineal con un estado recurrente constante. Esta combinacion reduce el coste computacional y de memoria en contextos largos, manteniendo la capacidad de razonamiento. El modelo base original incluye capacidades de vision y razonamiento, aunque la adaptacion coreana se centra en texto.

La adaptacion al coreano (ThakiCloud/Qwen3.8-27B-Human-KO) se realizo mediante un proceso de alineacion de estilo, del cual no se han publicado detalles tecnicos (dataset, numero de tokens, metodo de entrenamiento). El autor indica que el proceso esta documentado en DATA_PROVENANCE.md en el repositorio del modelo base, pero no se ha incluido en la informacion disponible.

La cuantizacion NVFP4 se realizo con llm-compressor (GPTQ) y se exporto en formato compressed-tensors. Los kernels NVFP4 estan optimizados para arquitecturas Blackwell (SM100+), como la GPU B200. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en coreano, con estilo alineado a respuestas cortas y corteses (registro formal).
- Razonamiento y resolucion de problemas, heredado del modelo base Qwen3.8-27B.
- Capacidades de vision (el modelo base Qwen3.8-27B es vision-language), aunque no se confirma explicitamente en esta adaptacion.
- Soporte de tool calling y function calling: no confirmado en la documentacion, pero probablemente heredado del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente.
- Capacidad multilingue: el modelo base es multilingue, pero esta adaptacion esta orientada exclusivamente al coreano.
- Cuantizacion NVFP4 para inferencia eficiente en hardware Blackwell con contexto largo.

## Casos de uso

- **Atencion al cliente automatizada en coreano**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 256K tokens) gracias a su ventana amplia, permitiendo mantener el historial completo de una interaccion sin truncamiento. Su estilo alineado produce respuestas corteses y naturales.
- **Analisis de documentos legales o financieros en coreano**: con 262 144 tokens de contexto, puede procesar contratos extensos, informes anuales o expedientes completos en una sola pasada, extrayendo informacion relevante o resumiendo secciones especificas.
- **Generacion de codigo en entornos de produccion**: si se confirman las capacidades de codigo del modelo base, podria integrarse en pipelines de CI/CD para generar o revisar codigo con comentarios en coreano, aprovechando la cuantizacion para reducir costes de inferencia.
- **Investigacion en procesamiento de lenguaje natural coreano**: el modelo sirve como punto de partida para evaluaciones de modelos cuantizados en tareas como KMMLU o HAE-RAE, permitiendo estudiar el impacto de la cuantizacion NVFP4 en la calidad.
- **Servicio de chat con contexto largo en una sola GPU**: en una B200, el modelo puede atender hasta 8,18 veces mas solicitudes simultaneas de 262K tokens que el original bf16, lo que lo hace adecuado para aplicaciones de alto trafico con presupuesto de hardware limitado.
- **Asistente de redaccion en coreano**: su estilo alineado y su capacidad de generar texto coherente lo hacen util para redactar correos, informes o contenido editorial en coreano, manteniendo un tono consistente.

## Benchmarks y rendimiento

El autor proporciona mediciones comparativas entre esta version NVFP4 y el original bf16, realizadas el 2026-09-02. Los resultados se resumen a continuacion:

| Metrica | bf16 original | NVFP4 (este modelo) | Diferencia | Significancia |
|---|---|---|---|---|
| T=0 respuesta ancla | Respuesta corta en registro formal | Misma salida | Identica | — |
| Ratio de bullets en generacion libre (n=200) | 2,0 % | 2,0 % | 0 pp | — |
| Longitud mediana en generacion libre | 220 caracteres | 249 caracteres | +29 caracteres | No evaluada |
| KMMLU (misma muestra, n=500) | — | Δ −2,4 pp | −2,4 pp | z = 1,09 (no significativo) |
| HAE-RAE (misma muestra, n=199) | — | Δ +4,9 pp | +4,9 pp | z = 0,41 (no significativo) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El autor advierte que "no distinguible" no implica "sin perdida": con la muestra utilizada, perdidas de 1-2 pp quedarian por debajo del limite de deteccion.

## Requisitos de hardware

- **VRAM estimada**: los pesos cuantizados ocupan aproximadamente 15 GB. Para servir 262 144 tokens de contexto, se requiere memoria adicional para KV cache; en una B200 (192 GB HBM3e) el autor reporta una capacidad de KV cache de 2 143 277 tokens con gpu-mem-util 0,90.
- **GPU recomendada**: NVIDIA B200 (arquitectura Blackwell, SM100+) para ejecutar los kernels NVFP4 nativos. En arquitecturas inferiores (Ampere, Ada Lovelace, Hopper) el modelo puede no cargar o degradar significativamente el rendimiento.
- **Compatibilidad con GPU de consumo**: no compatible. Las GPU de consumo actuales (RTX 4090, etc.) no soportan NVFP4 nativo y no disponen de suficiente memoria para el contexto completo.
- **Opciones de despliegue**: vLLM (version 0.28 o superior) con `trust_remote_code=True` y `max_model_len=262144`. Tambien podria usarse con otros frameworks que soporten compressed-tensors, aunque no se ha verificado.
- **Latencia y throughput**: no se proporcionan datos de latencia por token. El autor reporta una concurrencia maxima de 8,18 veces para solicitudes de 262 144 tokens en una B200, lo que sugiere un alto throughput en cargas de contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| ThakiCloud/Qwen3.8-27B-Human-KO (bf16) | 18,8 B | 262 144 | bf16 | Apache-2.0 | Modelo base, 55,6 GB, sin cuantizar |
| ThakiCloud/Qwen3.8-27B-Human-KO-NVFP4 (este) | 18,8 B | 262 144 | NVFP4 (W4A4) | Apache-2.0 | Cuantizado, ~15 GB, requiere Blackwell |
| ThakiCloud/Qwen3.8-27B-NVFP4-FP8ATTN | 18,8 B | 262 144 | NVFP4 + FP8 attention | Apache-2.0 | Variante con atencion en FP8, no evaluada aqui |
| Qwen3.8-27B (original) | 27 B (aprox.) | 262 144 | bf16 | Apache-2.0 | Modelo base de la familia, con vision y razonamiento |

No se dispone de benchmarks comparativos entre estos modelos en la informacion proporcionada. La comparacion se limita a caracteristicas tecnicas.

## Limitaciones y advertencias

- **Sesgos y seguridad**: el modelo hereda los sesgos y las limitaciones de seguridad del modelo base, que no han sido recalibrados ni evaluados de forma independiente. El autor menciona "juicio no calibrado" y "seguridad base heredada" como caveats del original.
- **Riesgo de alucinacion**: no se ha evaluado especificamente; se asume el riesgo tipico de los modelos de lenguaje generativos.
- **Perdida de calidad por cuantizacion**: aunque las diferencias no son estadisticamente significativas en las muestras evaluadas, el autor advierte que pueden existir perdidas de 1-2 pp por debajo del limite de deteccion. La varianza de reconstruccion (diferencias entre dos ejecuciones de la misma receta de cuantizacion) no se ha medido.
- **Variacion en longitud de generacion**: la longitud mediana de las respuestas aumenta de 220 a 249 caracteres, un cambio direccional que no ha pasado una prueba de significancia estadistica.
- **Restricciones de hardware**: los kernels NVFP4 solo funcionan en arquitecturas Blackwell (SM100+). En otras GPUs, el modelo puede no cargar o ejecutarse con kernels de respaldo mucho mas lentos.
- **Idioma**: la adaptacion esta orientada al coreano; no se garantiza un rendimiento adecuado en otros idiomas, aunque el modelo base sea multilingue.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda revisar los terminos del modelo base original (Qwen3.8-27B) por si hubiera condiciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Qwen3.8-27B-Human-KO-NVFP4
- Modelo base (bf16): https://huggingface.co/ThakiCloud/Qwen3.8-27B-Human-KO
- Variante NVFP4-FP8ATTN: https://huggingface.co/ThakiCloud/Qwen3.8-27B-NVFP4-FP8ATTN
- Pagina oficial de Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
