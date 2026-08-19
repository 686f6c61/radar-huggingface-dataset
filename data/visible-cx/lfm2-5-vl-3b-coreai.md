# visible-cx/LFM2.5-VL-3B-CoreAI

## Resumen

Este repositorio es un espejo de los paquetes Core AI (`.aimodel`) del modelo vision-lenguaje LFM2.5-VL-3B de Liquid AI, republicado por el proyecto Visible. Los paquetes fueron generados por el zoo de modelos Core AI para Apple silicon e incluyen únicamente las torres de lenguaje del modelo, no la torre de visión. Por tanto, tal como están publicados, estos artefactos no pueden consumir imágenes y funcionan como un modelo de texto puro.

El modelo original, LFM2.5-VL-3B, es el VLM más capaz de Liquid AI, con capacidades de grounding, comprensión de pantalla y function calling, diseñado para ejecutarse en el edge. Se basa en el backbone LFM2.5-2.6B con un encoder de imagen SigLIP2 NaFlex. En este repo se ofrecen tres variantes cuantizadas (int4 lineal e int8 lineal) con un contexto de manifiesto de 4096 tokens, pero sin ninguna métrica de rendimiento medida ni calificación de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5-VL-3B (backbone LFM2.5-2.6B + SigLIP2 NaFlex en el modelo original; solo torres de lenguaje en este repo) |
| Parametros totales | No disponible (el nombre sugiere 3B, pero no se confirma en la informacion) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | 4096 (valor de manifiesto) |
| Tipos de cuantizacion | int4 lineal (`int4lin`), int8 lineal (`int8lin` e `int8lin_textcore`) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | `.aimodel` (Core AI), con `main.mlirb`, manifiestos `metadata.json` y tokenizer |

## Arquitectura y entrenamiento

El modelo base es LFM2.5-VL-3B de Liquid AI, que combina un backbone de lenguaje LFM2.5-2.6B con un encoder de imagen SigLIP2 NaFlex. Sin embargo, este repositorio contiene exclusivamente las torres de lenguaje en formato Core AI, sin la torre de visión `vision_fp16` correspondiente. Los tres artefactos son de solo decodificación (`function_map: {"main": ["main"]}`), sin función `prefill`, por lo que los prompts se procesan de un token en uno. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

La cuantización int4 es posterior al entrenamiento (post-training), no QAT, y la propia model card advierte que en otros modelos MoE de LFM la int4 no QAT ha mostrado pérdidas de calidad medibles. No se ha medido nada para este modelo.

## Capacidades

- Generación de texto autoregresiva con contexto de 4096 tokens.
- Capacidades de vision-lenguaje del modelo original (grounding, comprensión de pantalla y documentos, function calling) **no disponibles** en este repo al faltar la torre de visión.
- Soporte de function calling declarado en el modelo base, pero no verificable en estos paquetes.
- Multilingüismo: no especificado.
- Sin modo de razonamiento explícito (thinking mode) ni soporte de audio.

## Casos de uso

Dado que la torre de visión está ausente y no hay métricas de calidad, los casos de uso realistas se limitan a entornos de experimentación y desarrollo en Apple silicon:

- Pruebas de integración del runtime Core AI con modelos cuantizados en Apple silicon.
- Evaluación de la latencia de decodificación token a token en hardware de consumo.
- Desarrollo de pipelines de texto puro que requieran un modelo pequeño con contexto de 4096.
- Benchmarking interno de calidad de cuantización int4 frente a int8 en tareas de generación de texto.
- Validación de la cadena de herramientas Core AI (fingerprints, manifiestos, tokenización).
- Prototipado de asistentes conversacionales locales sin requisitos de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no existe ninguna cifra de throughput, latencia, memoria o calidad para los tres paquetes. El harness de medición del catálogo Core AI (10 filas, M2 Pro de 16 GB) nunca ejecutó este modelo.

## Requisitos de hardware

- Apple silicon Mac con runtime Core AI instalado.
- Peso residente en memoria: aproximadamente 2.18 GB para la variante int4, 3.36 GB para la int8.
- No se ha registrado el consumo de memoria por token de KV-cache.
- Compatible con GPUs integradas de Apple silicon (M1/M2/M3/M4); no requiere GPU discreta.
- Opciones de despliegue: runtime Core AI nativo; no se menciona soporte para vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-VL-3B (LiquidAI, original) | ~3B (no confirmado) | No especificado (probablemente mayor) | FP16, GGUF, MLX, ONNX | LFM Open License v1.0 | Safetensors, GGUF, etc. |
| LFM2.5-VL-3B-CoreAI (este repo) | ~3B (no confirmado) | 4096 | int4, int8 | LFM Open License v1.0 | .aimodel (Core AI) |
| LFM2.5-VL-450M (Core AI, mencionado en el zoo) | 450M | No disponible | No disponible | LFM Open License v1.0 | .aimodel |

No hay datos de rendimiento comparativo disponibles. El modelo original de Liquid AI es la referencia para capacidades de visión, pero este repo no las incluye.

## Limitaciones y advertencias

- **Sin torre de visión**: los paquetes no pueden procesar imágenes, a pesar de que los manifiestos declaran contratos de imagen (`image_tokens: 256`, `image_patch_grid: [32, 32]`). La torre `vision_fp16` no está publicada.
- **Sin calificación**: los tres artefactos están marcados como "UNQUALIFIED — mirror". No han sido ejecutados por Visible ni sometidos a pruebas de calidad o determinismo.
- **Riesgo de alucinación**: no evaluado; al ser un modelo de lenguaje sin validación, puede generar contenido plausible pero incorrecto.
- **Sesgos**: no documentados.
- **Licencia**: LFM Open License v1.0, con obligaciones de redistribución. Debe redistribuirse la licencia junto con los archivos.
- **Restricciones de producción**: la model card recomienda explícitamente no enrutar tráfico de producción a estos paquetes.
- **Cuantización int4**: es post-training, no QAT, y en otros modelos LFM MoE se ha observado pérdida de calidad; aquí no se ha medido.
- **Contexto limitado**: 4096 tokens, sin mediciones a anchos mayores.
- **Solo decodificación**: sin función `prefill`, lo que puede impactar la latencia en prompts largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/visible-cx/LFM2.5-VL-3B-CoreAI
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Blog de Liquid AI sobre LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Blog de HuggingFace sobre LFM2.5-VL-3B: https://huggingface.co/blog/LiquidAI/lfm2-5-vl-3b
- Documentación de Liquid para LFM2.5-VL-3B: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- README del zoo de modelos Core AI (referencia de LFM2.5-VL): https://github.com/john-rocky/coreai-model-zoo/blob/main/models/lfm2.5-vl/README.md
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-VL-3B/blob/main/LICENSE
