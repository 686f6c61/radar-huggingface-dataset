# teejer/Ling-3.2-air-mlx

## Resumen

Ling-3.2-air MLX 4-bit es una conversión comunitaria del modelo Ling-3.2-air de inclusionAI a formato MLX, cuantizada a 4 bits y empaquetada específicamente para `mlx-serve` sobre Apple Silicon. Se trata de un modelo de lenguaje híbrido de tipo MoE con arquitectura `bailing_hybrid` (combinación de atención KDA y MLA), 42 capas, 512 expertos enrutados y 1 experto compartido, con un total declarado de 124B parámetros y aproximadamente 5,5B activos por token. La conversión fue realizada y verificada por el usuario teejer en un Apple M3 Ultra con 512 GB de memoria unificada.

El modelo base Ling-3.2-air se distribuye originalmente en FP8 con bloques de 128 y un wrapper de visión-lenguaje; esta versión MLX elimina el tower de visión y queda como modelo solo de texto. La relevancia de esta ficha radica en que permite ejecutar un MoE de gran escala en hardware Apple Silicon mediante MLX, algo que con los pesos originales en FP8 resultaría inviable en la mayoría de equipos de consumo. El repositorio ocupa 73,2 GB repartidos en 13 shards, con pesos en safetensors y cuantización afín de 4 bits con group size 64.

Incluye la cabeza MTP (Multi-Token Prediction) del release original, que `mlx-serve` puede aprovechar como cabeza de decodificación especulativa para aumentar el throughput de decodificación en torno a un 30 % cuando el motor lo soporta. Es una conversión no oficial: los pesos no se modifican salvo por la cuantización y las transformaciones de layout descritas, y la licencia sigue la del release upstream de inclusionAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailing_hybrid` (híbrido KDA + MLA, transformer MoE) |
| Parametros totales | 124B (declarado por el autor); 804.784.640 en el safetensors del repo MLX |
| Parametros activos | ~5,5B (MoE, 512 expertos enrutados + 1 compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64, scales/biases en bf16 |
| Idiomas soportados | no disponible |
| Licencia | `ling-3.2-air-upstream` (licencia other, sigue el release de inclusionAI) |
| Formato de pesos | safetensors (MLX), 13 shards, ~68 GB de pesos, repo de 73,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE híbrido identificado como `bailing_hybrid`, con 42 capas y una combinación de atención KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention). El modelo emplea 512 expertos enrutados más un experto compartido, lo que da lugar a un régimen de aproximadamente 5,5B parámetros activos sobre 124B totales. La conversión conserva el layout crudo de `kv_b_proj` (no la forma absorbida `embed_q`/`unembed_out` que usa `bailing_moe_v3` de mlx-lm), que es el layout que enlaza el motor de `mlx-serve`. También se preservan en `config.json` las listas de clamp SwiGLU por capa (`expert_swiglu_limit_list`, `share_expert_swiglu_limit_list`) y `rope_interleave: true`, necesarias para la corrección numérica.

El proceso de conversión partió del checkpoint FP8 block-128 (`e4m3` + `weight_scale_inv`) del release, con decodificación exacta `e4m3fn` verificada con diferencia máxima 0,0 frente a torch en tensores muestreados. Los expertos enrutados se apilaron en `mlp.switch_mlp.*`, las convoluciones depthwise de KDA se transpusieron al layout MLX y posteriormente se recuantizó a 4 bits g64, manteniendo en precisión ancha embeddings, `lm_head`, gates del router, proyecciones MLA, norms y biases. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el release original.

La innovación técnica destacable es la inclusión de la cabeza MTP del release en `model.layers.42.*` (`eh_proj`, `enorm`, `hnorm`, norms, MLA + MoE), que `mlx-serve` carga como cabeza de decodificación especulativa. Según el autor, esto aporta aproximadamente un 30 % más de throughput de decodificación cuando el motor habilita MTP nativo para packs MLX; otros motores simplemente ignoran esos tensores.

## Capacidades

- Generación de texto y razonamiento en modo thinking activado por defecto, con separación en `reasoning_content`.
- Tool calling estilo GLM, heredado del release original.
- Integración con `mlx-serve` verificada en suite completa de chat, tool-call, streaming y prefix-cache (23/23).
- Decodificación especulativa mediante la cabeza MTP incluida.
- Soporte de plantilla de chat del release original.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no soportada; el tower de visión del release original se ha eliminado en esta conversión (text-only).
- Audio: no disponible.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo puede servirse con `mlx-serve` apuntando `--model` al directorio del pack, gestionando conversaciones multi-turno con la plantilla de chat incluida y streaming de tokens.
- Razonamiento con modo thinking en estaciones de trabajo Mac: útil para tareas de análisis y resolución de problemas donde el desglose en `reasoning_content` aporta trazabilidad, aprovechando el modo thinking activado por defecto.
- Automatización de tool calling en flujos agénticos: el soporte de tool calls estilo GLM permite integrar el modelo en pipelines que requieran invocar funciones externas, con la suite de integración ya verificada contra `mlx-serve`.
- Prototipado e investigación en hardware de consumo Apple: al ser un MoE de 124B totales ejecutable en MLX, permite experimentar con modelos de gran escala sin depender de GPUs de datacenter.
- Servicio con caché de prefijos para prompts largos repetidos: la integración de prefix-cache verificada en `mlx-serve` reduce el coste de reutilizar contextos comunes en aplicaciones con system prompts extensos.
- Evaluación comparativa de conversiones MLX: sirve como referencia para medir el impacto de la cuantización 4-bit g64 y de la cabeza MTP frente a otros packs del mismo modelo base.
- Despliegue con decodificación especulativa: en builds de `mlx-serve` que habiliten MTP nativo, el modelo puede emplearse en escenarios donde el throughput de decodificación sea crítico, con la mejora de ~30 % reportada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan ~68 GB en 13 shards; el repo completo son 73,2 GB. Se requiere un equipo con al menos esa cantidad de memoria unificada disponible, más margen para KV cache y buffers.
- Verificado por el autor en un Apple M3 Ultra con 512 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (M3 Ultra 512 GB verificado). No hay datos sobre otros chips Apple.
- GPU NVIDIA: no aplicable de forma nativa; el pack está en formato MLX. No se dispone de información sobre conversiones GGUF o de otro tipo para CUDA.
- Cabe en GPU de consumo: no en el sentido convencional (RTX 4090 con 24 GB queda muy lejos de los ~68 GB de pesos); en Apple Silicon depende del modelo de chip y su memoria unificada.
- Opciones de despliegue: `mlx-serve` (soporte nativo vía plugin `bailing_hybrid`). Para `mlx-lm` con `bailing_moe_v3` sería necesario absorber `kv_b_proj` en `embed_q`/`unembed_out` previamente. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: no disponibles de forma numérica; el autor reporta ~+30 % de throughput de decodificación con MTP nativo habilitado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teejer/Ling-3.2-air-mlx (este) | 124B totales / ~5,5B activos | no disponible | MLX 4-bit safetensors | `ling-3.2-air-upstream` | Hugging Face, comunidad |
| inclusionAI/Ling-3.2-air (base) | 124B totales / ~5,5B activos | no disponible | FP8 block-128 | upstream inclusionAI | Hugging Face, oficial |
| Packs `rapid-mlx` de Ling | no disponible | no disponible | MLX 4-bit g64 | no disponible | Hugging Face |

No se dispone de información sobre benchmarks comparativos ni de otros modelos de la misma categoría en la documentación proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Conversión no oficial realizada por un tercero (teejer); no cuenta con el respaldo de inclusionAI.
- Modelo solo de texto: el tower de visión del release original se ha eliminado, por lo que no admite entradas de imagen.
- Licencia `other` con nombre `ling-3.2-air-upstream`: es necesario revisar los términos del release original de inclusionAI antes de cualquier uso comercial.
- El layout de `kv_b_proj` está pensado para `mlx-serve`; usarlo con `mlx-lm` (`bailing_moe_v3`) requiere una transformación previa a `embed_q`/`unembed_out`.
- El modo thinking está activado por defecto, lo que puede incrementar la latencia y el consumo de tokens si no se gestiona adecuadamente.
- Las listas de clamp SwiGLU y `rope_interleave: true` deben conservarse en `config.json`; alterarlas rompe la corrección numérica.
- La cabeza MTP solo aporta ventajas en motores que habiliten MTP nativo para packs MLX; en otros casos se ignoran esos tensores.
- No hay información publicada sobre sesgos, tasas de alucinación, cobertura idiomática ni longitud de contexto efectiva.
- El tamaño (~68 GB de pesos) limita el despliegue a equipos con memoria unificada muy alta, lo que restringe su uso en producción a hardware Apple de gama alta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/teejer/Ling-3.2-air-mlx
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Motor de inferencia mlx-serve: https://github.com/ddalcu/mlx-serve
