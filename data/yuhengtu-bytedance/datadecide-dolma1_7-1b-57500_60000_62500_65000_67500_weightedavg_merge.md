# yuhengtu-bytedance/DataDecide-dolma1_7-1B-57500_60000_62500_65000_67500_weightedavg_merge

## Resumen

DataDecide-dolma1_7-1B-57500_60000_62500_65000_67500_weightedavg_merge es un modelo de lenguaje de tipo base publicado por el usuario yuhengtu-bytedance en HuggingFace. No se trata de un modelo entrenado desde cero, sino del resultado de una fusión (merge) de pesos de cinco checkpoints intermedios de un mismo entrenamiento, correspondientes a los pasos 57500, 60000, 62500, 65000 y 67500 del identificador interno `dolma1_7`. La fusión se ha realizado con mergekit mediante el método Linear, usando el checkpoint del paso 67500 como base y pesos normalizados crecientes (1, 2, 3, 4 y 5).

El modelo tiene 1.279.854.592 parámetros (aproximadamente 1,28 mil millones) y arquitectura Llama, según las etiquetas y la libreria declarada (transformers y safetensors). El repositorio ocupa 2,6 GB, lo que es coherente con pesos almacenados en bfloat16. No hay información pública sobre el dataset exacto, el número de tokens de entrenamiento ni el proceso de alineación; el nombre sugiere que los checkpoints originales proceden de un entrenamiento sobre Dolma 1.7, pero esto no está confirmado en la model card.

Su relevancia es fundamentalmente investigadora: sirve como artefacto reproducible para estudiar si la media ponderada de checkpoints intermedios (una forma de "model soup" o de averaging de trayectoria de entrenamiento) mejora la pérdida o las métricas frente a un checkpoint único. No es un modelo orientado a producto: no hay datos de benchmarks, licencia declarada ni idiomas soportados, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only, segun etiqueta `llama`); detalles de capas y atencion no disponibles |
| Parametros totales | 1.279.854.592 (1,28 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se publican variantes cuantizadas (ni GGUF, ni GPTQ, ni AWQ); los pesos originales estan en bfloat16 y son cuantizables con herramientas estandar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (dtype de salida bfloat16) |
| Autor | yuhengtu-bytedance |
| Metodo de fusion | Linear (mergekit), con normalizacion de pesos |
| Modelo base de la fusion | checkpoint `dolma1_7/step67500` |
| Modelos fusionados | `step57500` (peso 1), `step60000` (peso 2), `step62500` (peso 3), `step65000` (peso 4), `step67500` (peso 5) |
| Tamano del repositorio | 2,6 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de la etiqueta `llama` y de la libreria `transformers`. Por el recuento de parametros (1,28 B) y el tamano del repositorio (2,6 GB), se trata de un transformer decoder-only de escala pequena con pesos en bfloat16. No se especifican numero de capas, dimensiones ocultas, cabezas de atencion, tamano de vocabulario ni mecanismos de atencion alternativos (no hay indicios de MoE, SSM ni arquitecturas hibridas).

Respecto al entrenamiento, lo unico verificable es el proceso de fusion, no el preentrenamiento original. La fusion se hizo con mergekit aplicando el metodo Linear documentado en arXiv:2203.05482, con `normalize: true` y `dtype: float32` en el calculo intermedio, volcando el resultado a bfloat16. La eleccion de pesos estrictamente crecientes (1 a 5) prima progresivamente los checkpoints mas avanzados del entrenamiento, de modo que el resultado esta sesgado hacia el estado final pero conserva contribucion de los cuatro estados previos. No hay informacion sobre el numero de tokens vistos, la composicion del dataset, ni sobre si hubo RLHF, DPO o ajuste por instrucciones: al ser una media de checkpoints de preentrenamiento, lo esperable es que sea un modelo base sin alineacion, aunque esto no se afirma explicitamente en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva basica, propia de un modelo base de 1,28 B parametros entrenado sobre corpus web (presumiblemente Dolma 1.7, sin confirmar).
- Continuacion de texto y tareas de completion sin formato conversacional; no hay plantilla de chat publicada.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo base de este tamano sin ajuste por instrucciones no es adecuado para ello sin trabajo adicional.
- Capacidades multilingues: no disponible, no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad tecnica: etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que puede servirse con TGI.
- Interes metodologico: permite reproducir y auditar el efecto de la media ponderada de checkpoints sobre un mismo run de entrenamiento.

## Casos de uso

- Investigacion sobre model merging: el modelo es un artefacto listo para comparar la perdida de validacion y métricas de lenguaje frente a cada checkpoint individual (57500, 60000, 62500, 65000, 67500), aislando el efecto de la media ponderada con pesos crecientes.
- Estudio de trayectorias de entrenamiento: al proceder de cinco pasos distintos del mismo run, permite analizar como evoluciona la representacion interna y si promediar estados intermedios actua como regularizador.
- Punto de partida para fine-tuning: con 1,28 B parametros cabe en una GPU de 24 GB en bfloat16 con optimizadores ligeros (LoRA/QLoRA), lo que lo hace util como base barata para experimentos de ajuste supervisado en dominios concretos.
- Banco de pruebas de infraestructura: su tamano permite validar pipelines completos (TGI, vLLM, transformers) en una sola GPU consumer antes de escalar a modelos mayores, comprobando carga de safetensors, tokenizacion y throughput.
- Experimentos de cuantizacion y compresion: sirve para medir la degradacion de perplejidad al pasar de bfloat16 a int8 o a 4 bits con GPTQ, AWQ o llama.cpp (previo convertido a GGUF), dado que no se publican variantes ya cuantizadas.
- Docencia y prototipado local: al ocupar 2,6 GB en disco, se puede ejecutar en portatiles con GPU modesta o incluso en CPU para demostraciones de generacion de texto y de tecnicas de fusion de modelos.
- Analisis de seguridad y sesgos de checkpoints intermedios: permite comparar si la media ponderada de pasos de entrenamiento altera la probabilidad de completaciones toxicas respecto a los checkpoints originales, dentro de estudios de medicion de seguridad en preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni perplejidad, y tampoco se aportan comparaciones con los checkpoints individuales que se fusionaron.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,6-3,5 GB de pesos, mas overhead de activaciones y cache KV; con contexto corto suele bastar con 4-6 GB.
- VRAM estimada en float32: aproximadamente 5,2 GB solo de pesos.
- VRAM estimada cuantizado a 8 bits: en torno a 1,4-2 GB; a 4 bits: en torno a 0,8-1,2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4090) es suficiente para inferencia en bfloat16 o int8. Para entrenamiento completo en bfloat16 con Adam se necesitarian del orden de 20-25 GB (A100 40 GB, H100, L40S), aunque LoRA/QLoRA cabe en 12-24 GB. Para despliegue de alta concurrencia, A100 o H100 con vLLM.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna de 8 GB o mas, y tambien en Apple Silicon con memoria unificada.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles con la Inference Endpoints de HuggingFace, vLLM y SGLang para servir con safetensors, y llama.cpp/Ollama tras convertir los pesos a GGUF (no se proporciona GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas estructurales y de licencia. Los valores de los modelos alternativos provienen de sus model cards publicas y no se han verificado en esta busqueda; se ofrecen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos | Datos de benchmarks |
|---|---|---|---|---|---|
| DataDecide-dolma1_7-1B-...-weightedavg_merge | 1,28 B | no disponible | no disponible | safetensors, bfloat16 | no publicados |
| OLMo-1B (AI2) | ~1,2 B | 2048 (referencia publica) | Apache 2.0 | safetensors y GGUF | publicados en su model card |
| TinyLlama-1.1B | ~1,1 B | 2048 (referencia publica) | Apache 2.0 | safetensors y GGUF | publicados en su model card |
| Llama-3.2-1B | ~1,24 B | 128 000 (referencia publica) | Licencia comunitaria Llama 3.2 | safetensors y GGUF | publicados en su model card |

La diferencia clave del modelo analizado frente a estas alternativas no es el rendimiento (desconocido), sino su naturaleza de artefacto de investigacion: sin licencia declarada, sin idiomas declarados y sin datos de evaluacion, no es directamente sustituible por un modelo base con licencia permisiva en un producto comercial.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al no documentarse el dataset ni los idiomas, no se puede evaluar el sesgo; si los checkpoints originales se entrenaron sobre Dolma 1.7, heredarian los sesgos de ese corpus web.
- Riesgo de alucinacion: alto en la practica, como en cualquier modelo base de 1,28 B parametros sin alineacion; no se ha realizado ajuste por instrucciones ni RLHF segun la informacion disponible.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados, lo que impide planificar su uso en produccion sin una evaluacion previa propia.
- Licencia: no disponible. La ausencia de licencia declarada es un bloqueo legal para uso comercial; no se puede asumir permisividad.
- Naturaleza experimental: el nombre y la configuracion indican que es un subproducto de un estudio de medicion (rutas del tipo `Pan_Safety_Better_Measurement`), no un modelo mantenido ni versionado con garantias.
- Sin cuantizaciones oficiales: habria que generar GGUF, GPTQ o AWQ por cuenta propia, asumiendo la perdida de calidad correspondiente sin referencia publicada.
- Trazabilidad incompleta: los modelos fusionados se referencian por rutas locales del sistema del autor, no por identificadores de HuggingFace, por lo que no es posible reproducir la fusion sin acceder a esos checkpoints.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica que permitan contrastar su comportamiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-dolma1_7-1B-57500_60000_62500_65000_67500_weightedavg_merge
- Repositorio de mergekit (herramienta de fusion): https://github.com/cg123/mergekit
- Paper referenciado por las etiquetas del modelo (metodo Linear / model soups): https://arxiv.org/abs/2203.05482
- Nota sobre la busqueda web: los resultados devueltos no contenian ningun enlace relacionado con el modelo, su autoria, su dataset ni su proceso de fusion; se han descartado por no aportar informacion tecnica verificable. No se dispone de paper, blog, repositorio adicional ni demo oficiales.
