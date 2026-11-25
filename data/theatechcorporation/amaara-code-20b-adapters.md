# theatechcorporation/amaara-code-20b-adapters

## Resumen

amaara-code-20b-adapters es un conjunto de adaptadores LoRA publicados por The A-Tech Corporation sobre el modelo base `unsloth/gpt-oss-20b`, una variante optimizada del gpt-oss-20b de OpenAI. El modelo se distribuye exclusivamente como adaptadores PEFT (no como pesos completos), lo que implica que para su uso es necesario descargar por separado el modelo base y aplicar los adaptadores mediante la librería `peft`. El repositorio ocupa 3,4 GB, un tamano coherente con un adaptador LoRA de rango medio sobre un modelo de 20.000 millones de parametros.

El nombre del modelo (`amaara-code-20b`) sugiere una especializacion en generacion de codigo, aunque la model card no documenta el dataset de entrenamiento, el numero de tokens, ni los hiperparametros utilizados. La informacion publicada se limita a la licencia, la referencia al modelo base y enlaces promocionales a una comunidad externa. No se han publicado resultados de benchmarks, idiomas soportados ni detalles de arquitectura mas alla de los heredados del modelo base.

La relevancia de esta publicacion es limitada en terminos tecnicos: se trata de un adaptador sin documentacion de entrenamiento ni evaluacion, con cero descargas y cero likes en el momento de la consulta. Su interes principal radica en la licencia A-Tech Model License v1.0, que permite uso comercial gratuito por debajo de 10 millones de USD de facturacion anual, y en que los derechos sobre el modelo base (Apache 2.0) permanecen intactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `unsloth/gpt-oss-20b`; arquitectura del base no detallada en la model card |
| Parametros totales | no disponible (adaptadores LoRA; el base es de 20.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors; el base admite cuantizacion, no documentada aqui) |
| Idiomas soportados | no disponible |
| Licencia | A-Tech Model License v1.0 (uso comercial gratuito bajo 10 M USD de facturacion anual); modelo base Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) empaquetado con PEFT, no un modelo completo. La arquitectura subyacente corresponde a `unsloth/gpt-oss-20b`, una version del gpt-oss-20b de OpenAI optimizada por Unsloth, pero la model card no describe la arquitectura del base (transformer, MoE u otra), ni el rango del adaptador, ni las capas objetivo del entrenamiento.

No se proporciona informacion sobre el dataset de entrenamiento: no se indica el numero de tokens, la composicion del corpus, si se uso RLHF, DPO o ajuste supervisado, ni los hiperparametros (learning rate, epochs, rango LoRA, alpha). Tampoco se documenta ninguna innovacion tecnica especifica del adaptador. La unica informacion tecnica verificable es el modelo base de referencia y el formato de distribucion (PEFT + safetensors).

## Capacidades

- Generacion de texto y codigo: el nombre del modelo sugiere especializacion en codigo, aunque no se documenta el alcance ni la calidad del ajuste.
- Herencia de capacidades del base: al ser un adaptador sobre `gpt-oss-20b`, conserva las capacidades del modelo base en la medida en que el ajuste LoRA no las degrade; no se especifica cuales.
- Tool calling / function calling: no documentado para el adaptador; depende de las capacidades del base.
- Razonamiento multi-paso y agentes: no documentado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Ajuste de codigo sobre gpt-oss-20b en entornos con licencia restrictiva: el adaptador permite aplicar un ajuste especifico de codigo sobre el base Apache 2.0 manteniendo los derechos del modelo original, util para equipos que necesitan personalizacion sin perder permisos de uso.
- Experimentacion con PEFT: al ser un adaptador LoRA ligero (3,4 GB), es adecuado para probar tecnicas de carga y merge de adaptadores sin necesidad de almacenar pesos completos.
- Despliegue en infraestructura propia: combinado con el base cuantizado, puede ejecutarse en hardware propio aplicando el adaptador en tiempo de inferencia, aunque no se documentan requisitos ni rendimiento.
- Evaluacion comparativa de adaptadores: util como punto de partida para comparar el efecto de distintos LoRA sobre el mismo base en tareas de codigo.
- Fine-tuning posterior: el adaptador puede servir como inicializacion para un ajuste adicional sobre dominios especificos, dado su formato PEFT estandar.
- Integracion en pipelines de CI/CD para generacion de codigo: solo si se valida previamente la calidad del adaptador, ya que no hay benchmarks publicados que respalden su rendimiento en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del base `gpt-oss-20b` y de la cuantizacion elegida (no documentada). Como referencia general, un modelo de 20.000 millones de parametros en FP16 requiere aproximadamente 40 GB de VRAM solo para pesos, pero este dato no procede de la model card.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no documentada; el base de 20B podria caber en GPU de consumo con cuantizacion agresiva, pero no hay datos oficiales.
- Opciones de despliegue: PEFT (carga de adaptadores), con posibilidad de merge sobre el base; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Benchmark |
|---|---|---|---|---|---|
| amaara-code-20b-adapters | LoRA sobre 20B (base) | no disponible | PEFT/safetensors | A-Tech v1.0 | no disponible |
| unsloth/gpt-oss-20b | 20B (base) | no disponible | safetensors | Apache 2.0 | no disponible en esta ficha |
| gpt-oss-20b (OpenAI) | 20B | no disponible | safetensors | Apache 2.0 | no disponible en esta ficha |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa. La diferencia principal frente al base es el ajuste LoRA y la licencia adicional A-Tech, que anade restricciones comerciales por encima de 10 M USD de facturacion.

## Limitaciones y advertencias

- Ausencia total de documentacion de entrenamiento: no se conoce el dataset, el numero de tokens, los hiperparametros ni el proceso de alineacion, lo que impide evaluar la calidad y los sesgos del adaptador.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el modelo base en tareas de codigo.
- Riesgo de alucinacion: inherente al modelo base y no evaluado para este adaptador.
- Sesgos conocidos: no documentados; dependen del corpus de entrenamiento, que se desconoce.
- Idiomas: no se especifican los idiomas soportados.
- Licencia: la A-Tech Model License v1.0 restringe el uso comercial a organizaciones por debajo de 10 M USD de facturacion anual; por encima se requiere licencia enterprise. Los derechos sobre el base Apache 2.0 se mantienen, pero el adaptador en si queda cubierto por la licencia A-Tech.
- Dependencia del modelo base: el adaptador no es autonomo; requiere descargar `unsloth/gpt-oss-20b` y aplicar PEFT, lo que anade complejidad operativa.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en produccion.
- Contenido promocional: la model card esta dominada por enlaces a una comunidad externa (Skool) y no por documentacion tecnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-20b-adapters
- Licencia A-Tech: https://huggingface.co/theatechcorporation/amaara-code-20b-adapters/blob/main/LICENSE
- Licencia enterprise: https://theatechcorporation.com/enterprise
- Modelo base: https://huggingface.co/unsloth/gpt-oss-20b
- Comunidad AI Owner's Club: https://www.skool.com/open-source-ai-builders-club/about
