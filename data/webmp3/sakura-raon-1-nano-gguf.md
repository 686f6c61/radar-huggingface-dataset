# webmp3/Sakura-Raon-1-nano-GGUF

## Resumen

Sakura-Raon-1-nano-GGUF es una cuantización comunitaria, publicada por el usuario webmp3, del modelo KRAFTON/Raon-1-nano. No se trata de un modelo entrenado desde cero, sino de una conversión a formato GGUF (requantización desde el GGUF F16 oficial de KRAFTON) pensada para su ejecución en llama.cpp y entornos compatibles con endpoints. El modelo base es un transformer de aproximadamente 3.130 millones de parámetros, con soporte declarado para inglés y chino y licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas cuantizaciones disponibles de Raon-1-nano con verificación de hashes, prueba real de inferencia y medición de perplejidad frente al original; por otro, advierte de una dependencia técnica crítica, ya que la arquitectura `raon1nano` no está en las versiones oficiales de llama.cpp y requiere un fork específico de KRAFTON.

El repositorio ocupa 10,7 GB e incluye cuatro variantes (Q4_K_M, Q5_K_M, Q6_K y Q8_0), desde 2,1 GB hasta 3,4 GB. No se publican benchmarks de tareas, solo métricas de fidelidad respecto al F16 de origen, por lo que la evaluación de calidad debe hacerse contra el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `raon1nano` (transformer; detalles internos no disponibles) |
| Parametros totales | 3.130.811.440 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requantizado desde F16 GGUF); el original se distribuye también en safetensors/BF16 según el modelo base |

## Arquitectura y entrenamiento

El modelo base Raon-1-nano está implementado con una arquitectura propia denominada `raon1nano`, según declara el autor de la cuantización. No se dispone de información en la documentación proporcionada sobre el número de capas, dimensión oculta, mecanismo de atención, tipo de normalización ni sobre el proceso de entrenamiento (tokens, composición del dataset, RLHF/DPO o decodificación especulativa). Cualquier dato de este tipo debe consultarse en la model card del repositorio original KRAFTON/Raon-1-nano.

La aportación técnica de este repositorio es la requantización: se parte del fichero `raon-1-nano-F16.gguf` (6,3 GB) publicado por KRAFTON y se generan cuatro variantes con las herramientas de llama.cpp. No se ejecutó calibración con matriz de importancia. Las herramientas se compilaron desde el commit `4d72ff0d45d5795aa4bd9655a77501269b52e1bc` del fork krafton-ai/llama.cpp, necesario porque ni la rama master ni las releases oficiales soportaban aún la arquitectura. Los tensores de normalización y otros se mantienen en F16/F32, de modo que las etiquetas de cuantización no describen todos los tensores del fichero.

## Capacidades

- Generación de texto conversacional en inglés y chino, según los idiomas declarados en la model card.
- Ejecución local mediante llama.cpp con la build específica del fork de KRAFTON.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking en la información disponible.
- No se declaran capacidades de código ni matemáticas; no hay benchmarks que las respalden.

## Casos de uso

- Despliegue local en estaciones de trabajo: la variante Q4_K_M (2,1 GB) permite ejecutar el modelo en CPU o GPU de gama media mediante llama.cpp, útil para prototipos sin acceso a la nube.
- Experimentación con la arquitectura `raon1nano`: investigadores que quieran evaluar el modelo original en hardware limitado pueden usar estas cuantizaciones como aproximación fiel al F16, con desviaciones medidas de perplejidad entre el 0,12 % y el 3,71 %.
- Aplicaciones conversacionales en inglés o chino: el modelo está etiquetado como conversacional y admite diálogo multi-turno, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Integración en pipelines de inferencia con endpoints compatibles: los tags indican compatibilidad con APIs de tipo endpoint, lo que facilita su exposición como servicio HTTP.
- Evaluación comparativa de cuantizaciones: los datos de perplejidad, divergencia KL y porcentaje de top token idéntico permiten estudiar el impacto de la cuantización en un modelo de 3B con vocabulario bilingüe.
- Pruebas de regresión de llama.cpp: al requerir un fork concreto, el repositorio sirve para validar builds que incorporen la arquitectura `raon1nano` antes de su merge oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de fidelidad de la cuantización frente al F16 de origen, medidas con `llama-perplexity` sobre 12 ventanas de 512 tokens de *Pride and Prejudice* (inglés) y *Hongloumeng* (chino):

| Cuantizacion | Tamano | Perplejidad | Ratio vs F16 | KL media | Mismo top token |
|---|---:|---:|---:|---:|---:|
| F16 (origen) | 6,3 GB | 36,585 | 1,0000 | — | — |
| Q4_K_M | 2,1 GB | 37,940 | 1,0371 ± 0,0057 | 0,03627 | 87,19 % |
| Q5_K_M | 2,6 GB | 37,135 | 1,0151 ± 0,0034 | 0,01415 | 92,22 % |
| Q6_K | 2,6 GB | 36,948 | 1,0099 ± 0,0028 | 0,01024 | 92,61 % |
| Q8_0 | 3,4 GB | 36,629 | 1,0012 ± 0,0011 | 0,00147 | 96,83 % |

Estas cifras describen únicamente la concordancia con el F16 en esos textos y no constituyen benchmarks de calidad en tareas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para Q4_K_M, 3-3,5 GB para Q5_K_M y Q6_K, y 4-4,5 GB para Q8_0, incluyendo overhead de contexto y caché KV.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M (RTX 3060, RTX 4060, RTX 2070); 8 GB o más para Q8_0 (RTX 3070, RTX 4060 Ti, RTX 4070); A100/H100 no son necesarias para un modelo de 3B, aunque pueden usarse para servir múltiples instancias.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs consumer con 6-8 GB de VRAM; también es viable en CPU con suficiente RAM (4-8 GB libres).
- Opciones de despliegue: llama.cpp exclusivamente con la build del fork krafton-ai/llama.cpp en el commit indicado, o con una versión oficial posterior que haya integrado la arquitectura `raon1nano`. No se garantiza compatibilidad con Ollama, vLLM o TGI en el momento de publicación.
- Latencia y throughput: no disponibles; dependen del hardware y de la build empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| Sakura-Raon-1-nano-GGUF | 3,13 B | no disponible | en, zh | Apache 2.0 | GGUF | Requiere fork de llama.cpp |
| KRAFTON/Raon-1-nano (original) | 3,13 B | no disponible | en, zh | Apache 2.0 | safetensors/BF16 y GGUF F16 | Referencia de calidad; mayor peso en disco |
| Alternativas de ~3B con GGUF | no disponible | no disponible | no disponible | no disponible | GGUF | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con modelos de la misma categoría; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Dependencia de un fork no oficial de llama.cpp: los ficheros solo funcionan con la build de krafton-ai/llama.cpp en el commit `4d72ff0d45d5795aa4bd9655a77501269b52e1bc` o con una versión oficial que haya integrado la arquitectura. Ollama, vLLM y TGI pueden no cargarlos.
- Cuantización comunitaria, no oficial: el autor declara explícitamente que no es un release del autor original; posibles errores de conversión no están cubiertos por KRAFTON.
- Sin benchmarks de tareas: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de calidad; las métricas de perplejidad solo miden fidelidad al F16 en dos textos concretos.
- Idiomas limitados a inglés y chino: no se declara soporte de castellano; el rendimiento en otros idiomas es desconocido.
- Longitud de contexto no documentada: no se puede asumir una ventana larga; debe validarse antes de usarla en producción.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni de robustez; al ser un modelo de 3B, la tasa de alucinación puede ser superior a la de modelos mayores.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener la atribución a KRAFTON y a webmp3, y verificar la licencia del modelo base en su repositorio original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Fecha de creación declarada (2026-11-11): conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/webmp3/Sakura-Raon-1-nano-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- GGUF oficial del modelo base: https://huggingface.co/KRAFTON/Raon-1-nano-gguf
- Fork de llama.cpp requerido: https://github.com/krafton-ai/llama.cpp
- Commit concreto de la build: https://github.com/krafton-ai/llama.cpp/commit/4d72ff0d45d5795aa4bd9655a77501269b52e1bc
