# sraivante/health-faq-v11a

## Resumen

health-faq-v11a es un modelo de lenguaje de autor unico (sraivante) subido a Hugging Face el 9 de noviembre de 2026, aparentemente como parte de una serie iterativa de experimentos internos orientados a responder preguntas de un dominio de salud/FAQ mediante un esquema de "conceptos" (ConceptLM). El nombre y la model card sugieren que no se trata de un modelo generalista preentrenado a gran escala, sino de un artefacto experimental de pequeno tamano (repo de 0,1 GB) entrenado sobre un dataset privado (`sraivante/health-faq-v11a-data`) y evaluado con metricas internas de acierto de concepto (top-1, eq1 accept-either) sobre conjuntos propios (`test_seen_cb1`, `challenge_new_cb1`, `clean_test_seen`, etc.).

La model card indica explicitamente que se trata de una "private upload" no revisada para publicacion publica, y que la unica version revisada para liberacion publica es "reviewed-v4". La version v11a se describe como "v6 recipe + single typo/phonetic noise training" con una "gate FZ1 PASS", y como "current deploy pick before RT1". No se proporcionan datos sobre arquitectura, parametros, contexto, tokenizer, licencia efectiva ni idiomas soportados mas alla de la etiqueta generica `license:other`.

Por tanto, la informacion disponible es muy limitada y de naturaleza interna/experimental. Esta ficha recoge lo que la model card declara y marca como "no disponible" todo aquello que no se especifica, sin inferir datos no presentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona `ConceptLM` en `code/training/train_canonical.py`, sin detalles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado) |
| Formato de pesos | no disponible (repo de 0,1 GB; no se listan safetensors/GGUF) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura mas alla de referenciar una clase `ConceptLM` en el script `code/training/train_canonical.py` y un fichero `prepared/config.json`. No se especifica si es un transformer, un clasificador de conceptos, un modelo encoder-decoder ni sus dimensiones. El unico detalle de entrenamiento declarado es que v11a corresponde a "v6 recipe + single typo/phonetic noise training" con resultado "gate FZ1 PASS", lo que sugiere un pipeline de entrenamiento con inyeccion controlada de ruido tipografico/fonetico y una compuerta de aceptacion interna (FZ1). No se indica numero de tokens, composicion del dataset, ni si se aplico RLHF/DPO.

Los datos de entrenamiento estan en el dataset privado `sraivante/health-faq-v11a-data`; la model card indica cargarlo con `ConceptLM` y `prepared/config.json`. No hay informacion publica sobre el contenido, tamano ni procedencia del dataset.

## Capacidades

- Respuesta a preguntas de dominio salud/FAQ mediante un esquema de "concepto" top-1 (segun la metrica de evaluacion declarada).
- Evaluacion con criterio "eq1 accept-either", lo que sugiere tolerancia a variantes de respuesta equivalentes.
- Entrenamiento con ruido tipografico/fonetico ("single typo/phonetic noise training"), orientado presumiblemente a robustez ante errores de escritura del usuario.
- No se declaran capacidades de generacion libre, codigo, matematicas, vision, audio, tool calling, agentes ni multilingues.
- No se declara modo "thinking" ni decodificacion especulativa.

## Casos de uso

- Preguntas frecuentes de salud con errores de escritura: el entrenamiento con ruido tipografico/fonetico sugiere uso en interfaces donde el usuario escribe rapido o con faltas, mapeando la consulta a un concepto canonico.
- Triaje inicial de FAQ sanitarias: clasificacion de consultas hacia respuestas predefinidas mediante el esquema de conceptos, sin generacion libre.
- Normalizacion de consultas: convertir variantes ortograficas o foneticas de una misma pregunta en una unica representacion de concepto.
- Enrutamiento hacia un modelo mayor: la model card menciona un "router tau" en RT1 que decide que preguntas se envian a un modelo mayor; v11a podria usarse como primera etapa antes de escalar.
- Evaluacion interna de calidad de FAQ: servir como referencia para comparar recetas (v6, v11a, v13c_e2) sobre conjuntos propios de test.
- Prototipado de sistemas de concept LM en dominio salud: util como artefacto reproducible (script + config) para experimentar con la receta "v6 + ruido".
- Despliegue experimental controlado: al ser "deploy pick before RT1", podria integrarse en un pipeline privado de demostracion, no en produccion publica.

## Benchmarks y rendimiento

Los unicos datos publicados son metricas internas de acierto de concepto top-1 (eq1 accept-either, cabeza CPU FP32) sobre conjuntos propios, no benchmarks estandar. Se reproducen tal como aparecen en la model card.

| Set | rows | rt1_s42 | rt1_s43 | v6_s42 | v6_s43 | v11a_s42 | v11a_s43 | v13c_e2_s42 | v13c_e2_s43 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| test_seen_cb1 | 1626 | 91.6 | 92.6 | 30.9 | 30.6 | 39.1 | 40.2 | 65.9 | 68.0 |
| challenge_new_cb1 | 3617 | 58.4 | 58.6 | 18.2 | 17.9 | 22.4 | 22.1 | 33.4 | 35.3 |
| clean_test_seen | 1638 | 97.7 | 98.2 | 96.5 | 96.3 | 95.8 | 96.5 | 93.8 | 93.7 |
| clean_challenge_new | 3617 | 66.5 | 67.7 | 55.4 | 54.2 | 55.2 | 54.0 | 53.8 | 54.4 |
| mn2_test_seen_multi | 4735 | 92.2 | 92.6 | 38.9 | 38.9 | 50.4 | 51.4 | 82.9 | 83.7 |
| mn2_challenge_new_multi | 10812 | 58.9 | 59.6 | 23.5 | 22.7 | 27.6 | 28.0 | 41.5 | 42.9 |

| Set | rt1_s42 answered / wrong | rt1_s43 answered / wrong |
|---|---|---|
| test_seen_cb1 | 66.2 / 0.5 | 68.4 / 0.4 |
| challenge_new_cb1 | 26.2 / 1.7 | 27.4 / 1.9 |
| clean_test_seen | 87.4 / 0.2 | 90.0 / 0.4 |
| clean_challenge_new | 35.7 / 2.1 | 36.3 / 1.5 |
| mn2_test_seen_multi | 69.8 / 0.4 | 71.2 / 0.3 |
| mn2_challenge_new_multi | 26.7 / 1.8 | 27.5 / 1.9 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 0,1 GB, lo que sugiere un modelo pequeno, pero no se confirma el numero de parametros ni el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente si dado el tamano del repo, pero no confirmado por el autor.
- Opciones de despliegue: no disponibles (no se menciona vLLM, llama.cpp, Ollama ni TGI); la carga se describe via `ConceptLM` y `prepared/config.json` en el codigo de entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables identificables a partir de la informacion disponible. La propia model card compara v11a con otras recetas internas del mismo autor (v6, v13c_e2, RT1) sobre conjuntos propios, pero no con modelos publicos de referencia.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| health-faq-v11a | no disponible | no disponible | metricas internas (ver tabla) | other | privado, no revisado |
| v6 (misma serie) | no disponible | no disponible | inferior a v11a en test_seen_cb1 y mn2_test_seen_multi | no disponible | interno |
| v13c_e2 (misma serie) | no disponible | no disponible | superior a v11a en test_seen_cb1 y mn2_test_seen_multi | no disponible | interno |
| RT1 (misma serie) | no disponible | no disponible | superior en la mayoria de conjuntos, con router tau | no disponible | interno |

## Limitaciones y advertencias

- Subida privada no revisada para publicacion publica; la model card indica que la unica version revisada es "reviewed-v4". No debe tratarse como artefacto listo para produccion.
- Licencia `other` sin texto publicado: no se puede confirmar si permite uso comercial, modificacion o redistribucion.
- Ausencia total de datos sobre arquitectura, parametros, contexto, tokenizer e idiomas: imposible estimar rendimiento real fuera de los conjuntos internos.
- Metricas internas sobre conjuntos propios (`test_seen_cb1`, `challenge_new_cb1`, etc.) no comparables con benchmarks estandar; riesgo de sobreajuste al dominio y al esquema de conceptos.
- Caida notable en conjuntos "challenge_new" frente a "test_seen" (p. ej., 39-40 frente a 95-96 en v11a), lo que sugiere baja generalizacion a preguntas nuevas.
- Entrenamiento con ruido tipografico/fonetico deliberado: puede degradar respuestas en entradas limpias o en dominios fuera de salud/FAQ.
- Riesgo de alucinacion no evaluado; el esquema de conceptos top-1 no garantiza cobertura de preguntas fuera del conjunto de conceptos.
- Dataset de entrenamiento privado y no auditable: no se puede evaluar sesgos, procedencia ni calidad de las respuestas.
- No hay informacion sobre seguridad, filtros de contenido ni adecuacion clinica; no debe usarse como consejo medico.

## Enlaces

- Hugging Face: https://huggingface.co/sraivante/health-faq-v11a
- Dataset (privado, referenciado): `sraivante/health-faq-v11a-data`
- Codigo referenciado en la model card: `code/training/train_canonical.py` (clase `ConceptLM`) y `prepared/config.json`
- No se han encontrado papers, blogs, repos publicos ni demos en la informacion disponible.
