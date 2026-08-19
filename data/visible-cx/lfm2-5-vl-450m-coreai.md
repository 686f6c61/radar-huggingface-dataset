# visible-cx/LFM2.5-VL-450M-CoreAI

## Resumen

El repositorio `visible-cx/LFM2.5-VL-450M-CoreAI` es un espejo (mirror) de los bundles Core AI del modelo `LiquidAI/LFM2.5-VL-450M`, publicado por el proyecto Visible para Apple Silicon. El modelo base es un vision-language model compacto de 450 millones de parámetros desarrollado por Liquid AI, con capacidades de grounding, seguimiento de instrucciones y function calling, orientado a despliegue en edge. Sin embargo, este repositorio en concreto solo contiene las torres de lenguaje del modelo, no la torre de visión, por lo que en la práctica se comporta como un modelo de texto puro. La publicación se realiza en formato `.aimodel` con cuantización int8 linear, pensado para el runtime Core AI en hardware Apple Silicon. El repositorio está marcado como no calificado y no se han realizado mediciones de rendimiento sobre estos bundles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de Liquid AI, arquitectura interna no especificada en la informacion disponible) |
| Parametros totales | 450 millones (segun el nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 4096 (manifest context declarado; no se ha medido en la practica) |
| Tipos de cuantizacion | int8 linear (`int8lin`) |
| Idiomas soportados | no disponibles |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | `.aimodel` (bundle Core AI: `main.mlirb`, `metadata.json`, tokenizer) |

## Arquitectura y entrenamiento

No se dispone de detalles tecnicos sobre la arquitectura interna del modelo base `LiquidAI/LFM2.5-VL-450M` en la informacion proporcionada. Segun el blog oficial de Liquid AI, se trata de una version mejorada de `LFM2-VL-450M` con capacidades de grounding, mejor seguimiento de instrucciones y soporte de function calling, entrenada con reinforcement learning adicional. El modelo original combina un encoder de vision con torres de lenguaje, pero en este repositorio solo se incluyen las torres de lenguaje (dos variantes: una que declara el contrato de tokens de imagen y otra que no). No se especifican datos de entrenamiento (numero de tokens, composicion del dataset) ni si se aplicaron tecnicas como RLHF o DPO. La conversion a Core AI fue realizada por el modelo zoo de Core AI (fingerprint `coreai-core 1.0.0b2`), no por el autor del repositorio, que actua como mero redistribuidor.

## Capacidades

- Generacion de texto: al ser solo las torres de lenguaje, puede generar texto a partir de secuencias de tokens.
- Razonamiento y seguimiento de instrucciones: se espera que herede las capacidades del modelo base, aunque no se ha verificado en esta version.
- Function calling: el modelo base soporta function calling, pero no se ha probado en estos bundles.
- Vision: **no disponible** en este repositorio. La torre de vision no esta publicada, por lo que el modelo no puede consumir imagenes.
- Multilingue: no se han declarado idiomas soportados.
- Compatibilidad con Core AI: disenado para ejecutarse en Apple Silicon con el runtime Core AI, con contrato de 2 entradas (`input_ids`, `position_ids`) y salida de logits.

## Casos de uso

- Desarrollo y pruebas de integracion con Core AI en Apple Silicon: permite validar el flujo de carga de bundles `.aimodel` y la compatibilidad con el runtime antes de incorporar la torre de vision.
- Prototipado de aplicaciones on-device de generacion de texto ligero: con un peso de ~0.50 GB, puede servir como base para experimentar con modelos pequenos en Mac.
- Evaluacion de cuantizacion int8 en hardware Apple: permite medir el impacto de la cuantizacion lineal int8 en la calidad de salida para tareas de texto.
- Base para futuras extensiones: una vez se publique la torre de vision, estos bundles podrian completarse para tareas de vision-lenguaje en edge.
- Educacion e investigacion: util para estudiar la estructura interna de bundles Core AI y el flujo de trabajo de mirroring de modelos.
- No se recomienda su uso en produccion hasta que se complete la torre de vision y se realicen mediciones de calidad y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha producido ninguna cifra de throughput, latencia, memoria o calidad para estos bundles, ni por parte de Visible ni upstream. El modelo base `LiquidAI/LFM2.5-VL-450M` podria tener benchmarks publicados por Liquid AI, pero no se incluyen en los datos proporcionados.

## Requisitos de hardware

- Apple silicon Mac con runtime Core AI instalado.
- Peso de los bundles: aproximadamente 0.50 GB residentes por bundle (500 MB por archivo `main.mlirb`).
- No se han medido los bytes de KV cache por token.
- No se han medido latencia ni throughput. Segun el repositorio del modelo zoo de Core AI (enlace en la seccion de enlaces), el modelo original de 450M alcanza 112 tok/s en iPhone, pero esa cifra no aplica directamente a estos bundles sin verificacion.
- Opciones de despliegue: exclusivamente a traves del runtime Core AI en Apple Silicon. No se mencionan integraciones con vLLM, llama.cpp u otros motores.
- Se recomienda un Mac con al menos 8 GB de RAM para comodidad, aunque el peso del modelo es reducido.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo base `LiquidAI/LFM2.5-VL-450M` se posiciona como un VLM compacto frente a alternativas como `Qwen2.5-VL-3B` (3B parametros) o `PaliGemma-3B` (3B parametros), pero esta version concreta es solo texto y no se han medido sus capacidades. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- **Falta la torre de vision**: los bundles publicados no pueden procesar imagenes, a pesar de que el manifest declare tokens de imagen. El modelo es texto-only en la practica.
- **No calificado para produccion**: la model card indica explicitamente que estos artefactos estan sin calificar y que no se debe enrutar trafico de produccion hacia ellos.
- **Sin mediciones de rendimiento**: no hay datos de latencia, throughput, memoria ni calidad. Cualquier cifra publicada en otros repositorios no ha sido verificada para estos bundles.
- **Riesgo de alucinacion**: al ser un modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente sin supervision humana.
- **Licencia LFM Open License v1.0**: es una licencia propia de Liquid AI con condiciones especificas. Es necesario revisar los terminos completos antes de cualquier uso comercial o redistribucion.
- **Determinismo no garantizado**: la conversion a `.aimodel` no es byte-reproducible; la integridad se basa en los hashes SHA-256 de los archivos publicados.
- **Contexto limitado**: la longitud de contexto declarada es 4096, pero no se ha verificado en ejecucion; ampliarla podria requerir pruebas adicionales.

## Enlaces

- Repositorio HuggingFace del mirror: https://huggingface.co/visible-cx/LFM2.5-VL-450M-CoreAI
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Blog de Liquid AI sobre LFM2.5-VL-450M: https://www.liquid.ai/blog/lfm2-5-vl-450m
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-vl-450m
- Repositorio del modelo zoo de Core AI (README con referencias): https://github.com/john-rocky/coreai-model-zoo/blob/main/models/lfm2.5-vl/README.md
- Licencia LFM v1.0: https://huggingface.co/LiquidAI/LFM2.5-VL-450M/blob/main/LICENSE
