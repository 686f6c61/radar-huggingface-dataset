# wepiqx/RINIQ-MERNIK-GGUF

## Resumen

RINIQ-MERNIK-GGUF es un repositorio de cuantizaciones GGUF para llama.cpp publicado por el usuario wepiqx. El modelo subyacente, denominado RINIQ, no es un entrenamiento convencional desde cero ni un finetune por descenso de gradiente, sino el resultado de una operacion de "cirugia de capas" (layer surgery) que fusiona tres donantes derivados de Qwen3.5-9B en un unico tronco de 427 tensores. Los pesos resultantes se cuantizan despues con el motor propio MERNIK, cuyo codigo y protocolo se documentan en el repositorio wepiqx/MERNIK.

Los tres donantes declarados son OxCoder-9B (destilado agentico de codigo, con un 90,24% en HumanEval), NeoHorse-1-9B (modelo con modo de pensamiento) y Ornith-1.5-9B-MTP (tronco de tipo hibrido GDN, segun la model card). La fusion no promedia bloques divergentes: aplica mapas de donante por bloque, de forma que cada bloque del tronco final procede de un unico donante seleccionado. La cabeza MTP de Ornith se excluye explicitamente del tronco.

La relevancia de esta publicacion es metodologica: muestra un flujo de trabajo reproducible de fusion selectiva por bloques mas cuantizacion verificada, con veredictos de HumanEval pass@1 y GPQA-rec publicados por build antes de subir cada archivo. En el momento de redactar esta ficha el repositorio tiene 0 descargas y 1 like, y la propia model card indica que los archivos GGUF estan "under test" y se iran subiendo a medida que se completen los veredictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B; tronco fusionado por cirugia de capas a partir de tres donantes, uno de ellos descrito como hibrido GDN (Ornith-1.5-9B-MTP) |
| Parametros totales | 9B (los tres donantes son variantes de 9B; el tronco final tiene 427 tensores, sin la cabeza MTP) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; los builds se identifican por tamano (5100 = 5,0 GB, 6500 = 6,8 GB). El tipo exacto de cuantizacion (Q4_K_M, Q5_K_M, etc.) no se especifica en la informacion disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Motor de cuantizacion | MERNIK (herramienta propia del autor) |
| Fecha de creacion del repositorio | 2026-09-16 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

RINIQ no se entrena: se ensambla. El procedimiento parte de tres donantes de 9B y construye un tronco unico de 427 tensores mediante mapas de donante por bloque, con la restriccion explicita de no promediar nunca bloques divergentes. Los donantes y su rol son: Ox (OxCoder-9B, destilado agentico de codigo) aporta la base y los tensores globales; Neo (NeoHorse-1-9B, modelo con modo de pensamiento) aporta el bloque 31; y Orn (Ornith-1.5-9B-MTP, tronco hibrido GDN) aporta bloques intermedios y tardios. La cabeza MTP de Ornith queda fuera de la fusion.

Se han documentado tres recetas de fusion. M1 combina Ox con los bloques 15, 19, 23 y 27 de Orn ("weight compass") mas el bloque 31 de Neo. M2 combina Ox con los bloques 24, 25 y 26 de Orn ("imatrix compass") mas el bloque 31 de Neo. M3 parte de M1 y anade los bloques 0 a 8 promediados por pesos entre Ox y Neo (denominado "soup backbone"); la model card indica que M3 seguia en pruebas. El protocolo completo y el registro de la fusion ("full ledger") estan en el archivo FUSION.md del repositorio wepiqx/MERNIK.

No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se describe ninguna tecnica de decodificacion especulativa ni de atencion lineal aplicada en inferencia; la unica mencion a un componente hibrido es la calificacion "GDN hybrid" aplicada al tronco de Ornith en la model card.

## Capacidades

- Generacion de codigo: es la capacidad mejor respaldada por los datos publicados, con un 91,46% de pass@1 en HumanEval (150/164) en el build RINIQ-M2-MERNIK-5100.
- Razonamiento de nivel avanzado: GPQA-rec en torno al 50% (51,01% en M1, 50,00% en M2), una cifra comparable a la de los donantes de partida.
- Herencia de un destilado agentico de codigo: el donante Ox (OxCoder-9B) se describe como "agentic code distillate", aunque la model card no detalla explicitamente que capacidades agenticas sobreviven a la fusion.
- Posible modo de razonamiento extendido: uno de los donantes (NeoHorse-1-9B) es un modelo "thinking", pero la model card no confirma que el comportamiento de pensamiento se conserve ni como se activa.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad verificada; solo se infiere del caracter del donante Ox.
- Capacidades multilingues: limitadas; el unico idioma declarado es el ingles.
- Vision, audio u otras modalidades: no disponibles; no se mencionan en la model card.

## Casos de uso

- Generacion de codigo en produccion: con un 91,46% de pass@1 en HumanEval sobre 164 problemas, el build M2 es adecuado para autocompletado de funciones, generacion de tests unitarios y traduccion entre lenguajes dentro de pipelines de CI/CD, siempre que se valide la salida con la bateria de tests del proyecto.
- Asistente de refactorizacion en el IDE: al ejecutarse como GGUF sobre llama.cpp, puede desplegarse en local sin enviar codigo propietario a servicios externos, lo que encaja en entornos con requisitos estrictos de confidencialidad.
- Razonamiento tecnico asistido: su GPQA-rec cercano al 50% permite usarlo como apoyo en preguntas de nivel graduado en ciencia e ingenieria, con revision humana obligatoria dado el riesgo de alucinacion.
- Evaluacion comparativa de tecnicas de fusion: el repositorio publica veredictos por receta (M1, M2, M3) y por tamano, por lo que sirve como caso de estudio replicable para investigadores que trabajen en model merging y cirugia de capas.
- Base para experimentos de cuantizacion: al estar generado por el motor MERNIK con verificacion previa a la subida, es un punto de partida para medir el impacto de la cuantizacion sobre HumanEval y la perplejidad en un modelo de 9B.
- Despliegue en hardware de gama de consumo: los artefactos de 5,0 GB y 6,8 GB caben en GPU de 8 GB o en CPU con RAM suficiente, lo que habilita prototipado local de asistentes de codigo sin infraestructura dedicada.
- Docencia y formacion en ingenieria del software: puede emplearse como generador de ejemplos y ejercicios de programacion en ingles, idioma para el que esta declarado.

## Benchmarks y rendimiento

Resultados publicados en la model card (anillo lento: HumanEval pass@1 con temperatura 1,0, top_p 0,95 y top_k 20):

| Build | Tamano | PPL (ctx 1024) | GPQA-rec | HumanEval pass@1 | Respuestas vacias |
|---|---|---|---|---|---|
| RINIQ-M2-MERNIK-5100 | 5,0 GB | 7,5819 | 50,00% | 91,46% (150/164) | 6 |
| RINIQ-M1-MERNIK-5100 | 5,0 GB | 7,6242 | 51,01% | 90,85% (149/164) | 7 |
| Ox-MSE-6500 (padre) | 6,8 GB | 7,5125 | 49,5% | 90,24% (148/164) | 4-5 |
| Ox-SMAPE-5100 | 5,0 GB | 7,5670 | 49,0% | 88,41% (145/164) | 4-5 |

No se han publicado resultados de MMLU, GSM8K, MT-Bench ni otros benchmarks en la informacion disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los unicos enlaces recuperados correspondian a dominios ajenos al proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto de 5,0 GB requiere aproximadamente 6-7 GB de VRAM contando contexto y buffers de llama.cpp; el de 6,8 GB requiere aproximadamente 8-9 GB. Son estimaciones derivadas del tamano de archivo, no datos publicados por el autor.
- GPU recomendadas: una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 en adelante cubren ambos builds con holgura. Para el build de 5,0 GB bastan 8 GB de VRAM.
- Cabe en GPU de consumo: si. Los dos builds documentados entran en tarjetas de 8 GB o mas; para el de 6,8 GB es recomendable disponer de 10-12 GB si se quiere usar contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no son la via natural para este formato y no se documentan como soportados.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.
- Estado de disponibilidad: la model card indica que los quants estan en pruebas y que los archivos se suben a medida que se completan los veredictos; un archivo solo se publica sin veredicto previo de HumanEval si se marca como UNVERIFIED.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | HumanEval pass@1 | GPQA-rec | PPL (ctx 1024) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| RINIQ-M2-MERNIK-5100 | 9B (fusion) | 5,0 GB | 91,46% (150/164) | 50,00% | 7,5819 | Apache 2.0 | Repositorio publicado, archivos en verificacion |
| RINIQ-M1-MERNIK-5100 | 9B (fusion) | 5,0 GB | 90,85% (149/164) | 51,01% | 7,6242 | Apache 2.0 | Repositorio publicado, archivos en verificacion |
| Ox-MSE-6500 (padre) | 9B | 6,8 GB | 90,24% (148/164) | 49,5% | 7,5125 | no disponible | no disponible |
| Ox-SMAPE-5100 | 9B | 5,0 GB | 88,41% (145/164) | 49,0% | 7,5670 | no disponible | no disponible |
| OxCoder-9B (donante) | 9B | no disponible | 90,24% | no disponible | no disponible | no disponible | no disponible |
| NeoHorse-1-9B (donante) | 9B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Ornith-1.5-9B-MTP (donante) | 9B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de contexto, cuantizaciones alternativas ni benchmarks adicionales de los donantes, por lo que la comparacion se limita a las metricas que la model card publica. No se han identificado en la busqueda web modelos independientes comparables ajenos a esta misma familia.

## Limitaciones y advertencias

- Repositorio practicamente sin adopcion: 0 descargas y 1 like en el momento de redactar la ficha, sin historial de uso en produccion.
- Artefactos en verificacion: la model card advierte de que los GGUF estan bajo prueba y se suben conforme se completan los veredictos, por lo que la disponibilidad real de cada build puede ser incompleta o cambiar sin aviso.
- Sin resultados fuera del anillo lento: todas las cifras proceden de una unica configuracion de muestreo (temperatura 1,0, top_p 0,95, top_k 20) y de un unico conjunto de 164 problemas de HumanEval. No hay datos de MMLU, GSM8K, MT-Bench ni evaluaciones en castellano.
- Respuestas vacias no despreciables: entre 6 y 7 respuestas vacias sobre 164 en los builds M1 y M2, frente a 4-5 del padre, lo que sugiere una ligera perdida de estabilidad de generacion tras la fusion.
- Perplejidad algo peor que el padre: 7,5819 y 7,6242 frente a 7,5125 del build Ox-MSE-6500, aunque el pass@1 en HumanEval mejora.
- Un unico idioma declarado (ingles); no hay evidencia de competencia en castellano ni en otros idiomas.
- Longitud de contexto no especificada: al no documentarse, no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinacion inherente a un modelo de 9B, agravado por la ausencia de evaluaciones de veracidad y por el origen por fusion, que puede producir comportamientos erraticos en zonas del tronco con donantes heterogeneos.
- Trazabilidad limitada de los donantes: no se documentan las licencias de OxCoder-9B, NeoHorse-1-9B ni Ornith-1.5-9B-MTP en la informacion disponible; aunque el repositorio se declara Apache 2.0, la cadena de licencias de los pesos fusionados deberia verificarse antes de un uso comercial.
- Sesgos: no hay informacion sobre composicion de datos de los donantes ni sobre evaluaciones de sesgo, por lo que no pueden caracterizarse.
- Fechas de creacion y actualizacion del repositorio (2026-09-16) muy proximas entre si, lo que indica una publicacion reciente y sin ciclo de maduracion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wepiqx/RINIQ-MERNIK-GGUF
- Repositorio del motor MERNIK y registro de fusion (FUSION.md): https://huggingface.co/wepiqx/MERNIK
- Busqueda web: no se han encontrado papers, blogs, repositorios ni demos adicionales relacionados con este modelo; los resultados devueltos por la busqueda no eran relevantes.
