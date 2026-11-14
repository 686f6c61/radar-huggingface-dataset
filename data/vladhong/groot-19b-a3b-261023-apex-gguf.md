# VladHong/Groot-19B-A3B-261023-APEX-GGUF

## Resumen

Groot-19B-A3B-261023-APEX-GGUF es una cuantización mixta de precisión del modelo GrootTeam/Groot-19B-A3B-261023, un transformer MoE de 19B parámetros totales y aproximadamente 3B activos orientado a razonamiento, código y uso como agente. La publica el usuario VladHong bajo licencia Apache-2.0, empleando la herramienta APEX (mudler/apex-quant) con una matriz de importancia (imatrix) calibrada específicamente para este checkpoint. El resultado son cuatro variantes GGUF de entre 7,00 GB y 8,25 GB, pensadas para ejecución local en hardware de consumo mediante llama.cpp y compatible con endpoints.

El modelo base sigue una arquitectura `qwen3_5_moe` (tipo GGUF `qwen35moe`) con 40 capas, de las cuales 30 son de atención lineal y 10 de atención completa (`full_attention_interval=4`), 128 expertos enrutados con 8 activos más 1 compartido, y una ventana de contexto de 262.144 tokens. Esta ficha evalúa la versión cuantizada, que es exclusivamente de texto: no incluye torre de visión ni decodificación especulativa MTP validada.

La relevancia de esta publicación reside en la calibración: el autor documenta un barrido de precisión por tipo de tensor con mediciones de KL y pruebas de sonda, y distribuye la imatrix junto con los scripts de reproducción. Es una cuantización de nicho (526 descargas, 0 likes en el momento de la consulta) pero con trazabilidad técnica poco habitual en el ecosistema GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (`qwen3_5_moe` / GGUF `qwen35moe`): 40 capas (30 atención lineal + 10 atención completa, `full_attention_interval=4`), 128 expertos enrutados x 8 activos + 1 compartido |
| Parametros totales | 18.985.723.008 (~19B) |
| Parametros activos | ~3B (aproximado, según model card) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Mixta: Q3_K, IQ2_S, IQ2_XXS, Q5_K, Q4_K, Q6_K según tensor y variante (Nano, Mini-Lean, Mini, Mini-Plus) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (4 variantes: Nano 7,00 GB, Mini-Lean 7,75 GB, Mini 7,95 GB, Mini-Plus 8,25 GB) + imatrix `.dat` (195,5 MB) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 40 capas que combina atención lineal en 30 de ellas con atención completa cada 4 capas, 128 expertos enrutados de los que se activan 8 por token más un experto compartido, y un total de ~19B parámetros con ~3B activos. El checkpoint upstream incorpora además una cabeza de Multi-Token Prediction (MTP) de 1 capa (`blk.40.nextn.*`), que en esta conversión se conserva pero cae al tipo base Q6_K y no se ha configurado ni validado para decodificación especulativa.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. Lo que sí está documentado es el proceso de cuantización: la imatrix se calculó sobre 108.413 tokens de calibración a contexto de 512, en formato GGUF de llama.cpp (con estadísticas por tensor: asimetría, curtosis, ganancia), y cubre los 60 tensores a los que la configuración Mini asigna un tipo IQ (verificado, sin ausencias). El repositorio incluye en `repro/` las configuraciones de tipos por tensor, los cortes de calibración con filtro de contaminación, las mediciones de barrido y KL, y los scripts del pipeline.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso (etiquetas `coding`, `agent`, `tool-use`).
- Soporte de tool calling / function calling, según las etiquetas del repositorio.
- Uso como agente y razonamiento encadenado, según las etiquetas del repositorio.
- Capacidades multilingües limitadas a inglés y chino.
- Compatible con endpoints (`endpoints_compatible`).
- Sin visión: no incluye torre de visión ni proyector de imagen, y el autor desaconseja explícitamente el uso con imágenes.
- Sin decodificación especulativa MTP validada en esta release.

## Casos de uso

- Asistencia de código en local: con ~3B parámetros activos y 7-8 GB de pesos, puede ejecutarse en una GPU de consumo y emplearse para autocompletado o generación de funciones en flujos de desarrollo sin conexión.
- Agentes con tool calling: las etiquetas `agent` y `tool-use` indican soporte para invocar funciones; encaja en orquestadores que necesiten un modelo pequeño con contexto amplio para mantener el estado de la conversación.
- Conversaciones multi-turno en inglés o chino: la ventana de 262K tokens permite mantener historiales largos sin truncamiento agresivo, útil en atención al cliente o asistentes documentales en esos dos idiomas.
- Razonamiento sobre documentos extensos: la combinación de contexto de 262K y bajo coste de inferencia permite resumir o extraer información de ficheros largos en entornos con recursos limitados.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: las variantes Nano y Mini-Lean (7,00-7,75 GB) caben en GPUs de 8 GB o en CPU con llama.cpp.
- Experimentación e investigación sobre cuantización: el repositorio incluye imatrix, configuraciones y mediciones que permiten reproducir o comparar estrategias de asignación de bits por tensor.
- Prototipado de pipelines de CI/CD con verificación de código: un modelo local pequeño puede integrarse en pasos de revisión estática o generación de tests sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta únicamente mediciones internas de tamaño, asignación de tipos por tensor y comparaciones cualitativas entre variantes (Mini-Plus descrita como la más cercana al original en ambos idiomas, con un 3,8% más de tamaño que Mini), además de pruebas de sonda sobre lectura de reloj analógico y reconocimiento de poesía clásica china, sin cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: ~7,0 GB (Nano), ~7,75 GB (Mini-Lean), ~7,95 GB (Mini), ~8,25 GB (Mini-Plus) solo para los pesos; hay que añadir la caché KV, que con contexto de 262K puede ser considerable y depende de la configuración de llama.cpp.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, las cuatro variantes caben en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti 16 GB, RTX 4070), aunque la caché KV para contextos largos puede exigir más memoria o cuantización de la caché.
- Cabe en GPU de consumo: sí, según los tamaños publicados; las variantes Nano y Mini-Lean son las más ajustadas para GPUs de 8 GB.
- Opciones de despliegue: llama.cpp (formato GGUF nativo, soporte de `--imatrix` en `llama-quantize`), y por extensión los runners compatibles con GGUF; el repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. La model card indica que solo se reporta velocidad de generación de un único stream, pero no incluye cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Groot-19B-A3B APEX (esta ficha) | ~19B / ~3B | 262K | Apache-2.0 | GGUF (4 variantes) | Cuantización mixta con imatrix calibrada; solo texto; en/zh |
| GrootTeam/Groot-19B-A3B-261023 (base) | ~19B / ~3B | 262K | Apache-2.0 | Safetensors (BF16) y builds oficiales NVFP4/FP8 | Modelo upstream; incluye visión y cabeza MTP; referencia de calidad |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Sin capacidades de visión: no incluye torre de visión ni proyector; el autor desaconseja explícitamente adjuntar imágenes. Las pruebas con un reloj analógico sintético dieron lecturas inconsistentes en las variantes cuantizadas.
- Sin decodificación especulativa MTP validada: la cabeza MTP está presente pero no se ha configurado ni medido ninguna aceleración.
- Conocimiento deficiente de literatura clásica china: en las pruebas documentadas, ninguna variante (incluida F16) reconoció el poema *将进酒* de Li Bai ni citó al autor; el autor desaconseja su uso para poesía clásica o citas canónicas.
- Idiomas limitados a inglés y chino; no se declara soporte de español ni de otras lenguas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el fallo documentado en poesía clásica es un ejemplo concreto de recuperación factual poco fiable.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base upstream y de la herramienta APEX.
- Cuantización agresiva: las variantes IQ2/IQ3 pueden degradar calidad frente al BF16; el autor recomienda Mini-Plus como el mejor compromiso, pero no aporta métricas de benchmarks estándar.
- Repositorio de nicho con pocas descargas (526) y sin likes; no hay validación comunitaria amplia documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VladHong/Groot-19B-A3B-261023-APEX-GGUF
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Herramienta APEX: https://github.com/mudler/apex-quant
