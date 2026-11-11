# SZLHOLDINGS/szl-brain

## Resumen

Szl Brain es un artefacto publicado en Hugging Face por SZLHOLDINGS bajo el identificador `SZLHOLDINGS/szl-brain`. La model card no describe ninguna arquitectura, tamano de parametros, corpus de entrenamiento ni resultados de evaluacion; se limita a presentarlo como "una pieza" del denominado "estate" de IA de SZL Holdings, un portafolio de investigacion y producto en el que, segun el autor, cada afirmacion va respaldada por un "recibo" (receipt) encadenado por hash en una cadena publica.

La informacion disponible no permite verificar que el repositorio contenga pesos de un modelo entrenado. El repositorio declara la libreria `transformers` y la etiqueta `endpoints_compatible`, pero no incluye pipeline, idiomas soportados, ficha de datos ni metricas. El unico dato tecnico objetivo es la licencia Apache-2.0 y las fechas de creacion y actualizacion (10 de noviembre de 2026), con cero descargas y cero "likes" en el momento de la consulta.

Por tanto, esta ficha documenta lo que el autor declara y marca explicitamente como "no disponible" todo aquello que la model card omite. Cualquier evaluacion de capacidades, rendimiento o idoneidad para produccion queda pendiente de que el autor publique pesos, configuracion y resultados verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio declara `library_name: transformers`; no se especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

La model card no proporciona ningun detalle sobre la arquitectura del modelo: no indica si es un transformer denso, un modelo de mezcla de expertos, una arquitectura de espacio de estados o un modelo hibrido. Tampoco especifica el numero de parametros, la longitud de contexto nativa ni la tokenizacion empleada.

Respecto al entrenamiento, no se documenta el volumen de tokens, la composicion del corpus, el uso de tecnicas de alineacion como RLHF o DPO, ni ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, modos de razonamiento extendido, etc.). El autor remite a un "curriculo de entrenamiento" denominado Ouroboros y a una "escalera de autonomia" alojados en el repositorio `szl-holdings/szl-gpu-bridge`, pero esos documentos no forman parte de la informacion proporcionada y no se puede confirmar su contenido ni su relacion efectiva con este artefacto.

## Capacidades

- No se declara ninguna capacidad concreta de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes ni para razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se menciona ningun modo especial (thinking mode, vision, audio, decodificacion especulativa).
- La unica capacidades implicita es la compatibilidad declarada con `transformers` y con endpoints, sin detalle sobre el formato de inferencia.

## Casos de uso

No es posible recomendar casos de uso concretos sin informacion verificable sobre arquitectura, tamano, contexto y capacidades. Los siguientes escenarios son genericos y quedan condicionados a que el autor publique los datos tecnicos ausentes:

- Evaluacion exploratoria en notebooks: cargar el repositorio con `transformers` para comprobar si contiene pesos utilizables y que configuracion exponen.
- Auditoria de procedencia: contrastar las afirmaciones de la model card con los recibos encadenados publicados en el dataset `SZLHOLDINGS/frontier-54-runs`.
- Pruebas de integracion con endpoints: verificar la etiqueta `endpoints_compatible` desplegando el artefacto en un endpoint gestionado.
- Estudio de licenciamiento: analizar el uso de Apache-2.0 en un artefacto sin documentacion tecnica asociada.
- Docencia sobre model cards: usar la ficha como ejemplo de publicacion con trazabilidad declarada pero sin especificaciones tecnicas.
- Comparacion de ecosistemas: incluir el artefacto en inventarios de modelos open source para medir la madurez de la documentacion publicada.

En ningun caso estos escenarios implican que el modelo sea apto para produccion, atencion al cliente, generacion de codigo u otras tareas reales, dado que no hay evidencia de sus capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a una "cadena de recibos" externa para las metricas, pero no incluye cifras en el propio repositorio ni en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio declara `library_name: transformers` y la etiqueta `endpoints_compatible`, lo que sugiere despliegue mediante la libreria de Hugging Face y endpoints gestionados; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre parametros, contexto, rendimiento ni categoria funcional del modelo, por lo que no es posible establecer una comparacion fundamentada con alternativas.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin parametros, contexto, arquitectura ni datos de entrenamiento, no se puede evaluar el modelo ni reproducir resultados.
- Riesgo de que el repositorio no contenga pesos entrenados: la model card esta orientada a comunicacion corporativa ("Why it matters (for investors)") y no a documentacion tecnica; no se confirma la existencia de artefactos de inferencia.
- Riesgo de alucinacion: no evaluable sin pesos ni evaluaciones publicadas.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto o idioma: no documentadas.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el contenido ni sobre la procedencia de los datos de entrenamiento, que no se declaran.
- Trazabilidad declarada no verificada: la afirmacion de que "cada claim traza a un recibo encadenado por hash" no se puede comprobar con la informacion proporcionada.
- Advertencia para produccion: no utilizar este artefacto en sistemas productivos sin una evaluacion independiente previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-brain
- Dataset de recibos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Organizacion en GitHub: https://github.com/szl-holdings
- Web corporativa: https://szlholdings.com
- Pagina de patrocinio: https://szlholdings.com/sponsors.html
- Dashboard en vivo (SI command center): https://szlholdings-szlholdings-si.hf.space
- Living anatomy: https://szlholdings-anatomy.hf.space
- Escalera de autonomia (The 0.3% partition): https://github.com/szl-holdings/szl-gpu-bridge/blob/main/docs/AUTONOMY_LADDER.md
- Curriculo de entrenamiento (Ouroboros): https://github.com/szl-holdings/szl-gpu-bridge/blob/main/docs/OUROBOROS_CURRICULUM.md
- Herramienta generadora de model cards: https://github.com/szl-holdings/szl-gpu-bridge/tree/main/tools/hf_cards
