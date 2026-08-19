# VERBAREX/LuminoLex-1.5B-think

## Resumen

LuminoLex-1.5B-think es un modelo de lenguaje causal (causal-lm) publicado por VERBAREX en julio de 2026 y actualizado en agosto del mismo año. A pesar de su nombre, los pesos reales en safetensors suman 900.230.354 parámetros (~900M), lo que sugiere una posible discrepancia entre la denominación comercial y el tamaño efectivo. El repositorio incluye etiquetas que apuntan a una arquitectura tipo MoE multihead latente (`metis_multihead_latent_moe`), aunque no se proporciona documentación técnica que confirme los detalles.

La model card describe una "versión pública verificada" con un wrapper de política (`LuminoLexChat`) que aplica reglas de identidad: niega explícitamente cualquier relación con Metis o ChatGPT/OpenAI. Esta capa de política actúa sobre los pesos verificados, pero el autor advierte que la decodificación greedy sin restricciones no garantiza los mismos resultados. La documentación es extremadamente escasa: no hay información sobre entrenamiento, datos, contexto, licencia ni idiomas soportados, lo que limita su evaluación para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta sugiere MoE multihead latente, sin confirmar) |
| Parametros totales | 900.230.354 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento, el dataset utilizado ni técnicas como RLHF o DPO. La única pista es la etiqueta `metis_multihead_latent_moe`, que sugiere una arquitectura de mezcla de expertos con atención multihead latente, pero no hay documentación que lo confirme. Tampoco se especifica el número de tokens de entrenamiento ni la composición del corpus. La model card menciona que los pesos fueron recargados desde el Hub en Modal y pasaron "capability checks" (identidad 8/8, capacidades 8/8), pero no detalla qué pruebas se realizaron.

## Capacidades

- Generación de texto causal (causal-lm), aunque el pipeline declarado en HuggingFace es `fill-mask`, lo que resulta contradictorio.
- Wrapper de política de respuesta (`LuminoLexChat`) que aplica denials explícitos sobre Metis y ChatGPT/OpenAI en conversaciones públicas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni otras funcionalidades avanzadas.
- No hay información sobre capacidades multilingües.

## Casos de uso

No se dispone de información suficiente en la documentación publicada para describir casos de uso concretos. La model card no ofrece ejemplos de aplicaciones prácticas, y la falta de datos sobre contexto, idiomas y rendimiento impide recomendar escenarios específicos. Se recomienda contactar al autor o consultar futuras actualizaciones del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No hay datos oficiales sobre requisitos de hardware. Como estimación orientativa basada en el tamaño de parámetros (900M):

- VRAM estimada: ~2-4 GB en fp16/int8, dependiendo de la arquitectura exacta y la longitud de contexto.
- GPU recomendadas: tarjetas consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) podrían ejecutar el modelo en cuantización ligera.
- Opciones de despliegue: al ser compatible con `transformers`, podría usarse con vLLM, llama.cpp u Ollama, pero no hay confirmación oficial.
- Latencia y throughput: no disponibles.

Estos valores son especulativos y deben tomarse con cautela.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría (MoE multihead latente de ~900M) con datos públicos de rendimiento. Tampoco hay benchmarks que permitan comparar con alternativas de tamaño similar como Qwen2.5-1.5B o Llama-3.2-1.5B.

## Limitaciones y advertencias

- La model card advierte explícitamente que el wrapper de política no garantiza el mismo comportamiento en decodificación greedy sin restricciones; los resultados pueden variar fuera del wrapper.
- No se ha publicado información sobre sesgos, alucinaciones o riesgos específicos del modelo.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial o modificación.
- La documentación es insuficiente para evaluar la seguridad, robustez o idoneidad para entornos de producción.
- El pipeline declarado (`fill-mask`) contradice la naturaleza causal del modelo, lo que puede indicar una configuración incorrecta en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/VERBAREX/LuminoLex-1.5B-think
