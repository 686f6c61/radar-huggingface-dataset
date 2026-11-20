# tinyopsec/Huihui-MiniCPM5-2B-abliterated-GGUF

## Resumen

Huihui-MiniCPM5-2B-abliterated-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo huihui-ai/Huihui-MiniCPM5-2B-abliterated, publicado por el usuario tinyopsec. Se trata de una variante "abliterated" del MiniCPM5 de 2B parametros, es decir, una version en la que se han eliminado o atenuado las direcciones de rechazo del modelo original mediante tecnicas de abliteration, y que posteriormente ha sido convertida a GGUF para su ejecucion eficiente en CPU y GPU de gama baja.

El modelo base cuenta con 2.516.756.480 parametros (aproximadamente 2,5 mil millones) y esta orientado a generacion de texto conversacional. La relevancia de este repositorio radica en que ofrece hasta once variantes de cuantizacion, desde F16 (~5 GB) hasta Q2_K (~0,8 GB), lo que permite desplegar el modelo en hardware muy modesto, incluyendo equipos con tan solo 1-2 GB de VRAM o incluso ejecucion exclusiva en CPU mediante llama.cpp.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque conviene verificar las condiciones del modelo base original. El repositorio esta etiquetado como compatible con endpoints y orientado a conversacion, con soporte declarado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniCPM5), segun tags del repositorio; detalles internos no disponibles |
| Parametros totales | 2.516.756.480 (~2,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 21,3 GB (conjunto de todas las cuantizaciones) |
| Modelo base | huihui-ai/Huihui-MiniCPM5-2B-abliterated |
| Libreria | gguf / llama-cpp |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia MiniCPM5 y su naturaleza transformer. No se especifican el numero de capas, dimensiones de atencion, tipo de atencion (completa o lineal), ni la composicion del dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron fases de RLHF, DPO o similar.

El proceso documentado en este repositorio es exclusivamente de cuantizacion: el modelo base huihui-ai/Huihui-MiniCPM5-2B-abliterated fue convertido a GGUF F16 mediante llama.cpp y, a partir de ese F16, se generaron las variantes de menor precision (Q8_0 hasta Q2_K). La etiqueta "abliterated" indica que el modelo base ha sido sometido a una tecnica de abliteration, que consiste en identificar y eliminar las direcciones en el espacio de activaciones responsables de las respuestas de rechazo, sin reentrenamiento adicional. No se dispone de informacion sobre el metodo exacto aplicado ni sobre posibles efectos colaterales en capacidades generales.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Respuestas sin rechazos por defecto gracias a la abliteration del modelo base, lo que permite abordar temas que el modelo original podria declinar.
- Ejecucion eficiente en CPU y GPU de gama baja mediante llama.cpp, LM Studio u Ollama.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere integracion con APIs de inferencia.
- Soporte de inferencia en Python mediante llama-cpp-python.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio, modo thinking ni razonamiento multi-paso.

## Casos de uso

- Despliegue en dispositivos de recursos limitados: con la cuantizacion Q4_K_M (~1,5 GB) el modelo puede ejecutarse en un equipo con 3 GB de VRAM o incluso en CPU, lo que lo hace adecuado para prototipos locales y entornos sin GPU dedicada.
- Chatbot conversacional local: el modelo esta orientado a conversacion y puede gestionar dialogos multi-turno en ingles, integrándose en aplicaciones de escritorio mediante LM Studio o en scripts de Python con llama-cpp-python.
- Experimentacion con modelos abliterated: investigadores interesados en estudiar el efecto de la abliteration sobre el comportamiento de rechazo pueden usar estas cuantizaciones para comparar respuestas frente al modelo original.
- Generacion de texto en pipelines de bajo coste: al ser un modelo de 2,5 B parametros, permite procesar volumen moderado de texto con latencia aceptable en hardware consumer, por ejemplo para resumen o parafraseo en ingles.
- Pruebas de integracion con Ollama: la disponibilidad de un comando directo (`ollama run hf.co/...:Q4_K_M`) facilita incorporar el modelo en entornos de desarrollo que ya usan Ollama como runtime.
- Educacion y demostraciones: el reducido tamano de las cuantizaciones Q2_K y Q3_K permite ejecutar el modelo en portatiles modestos para talleres o demos sobre cuantizacion y modelos de lenguaje.
- Evaluacion de calidad frente al tamano: las once variantes permiten medir empiricamente la degradacion de calidad al reducir bits, util para decidir el punto optimo de cuantizacion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion (segun la model card): Q2_K ~0,8 GB; Q3_K_S ~1,0 GB; Q3_K_M ~1,1 GB; Q3_K_L ~1,2 GB; Q4_K_S ~1,4 GB; Q4_K_M ~1,5 GB (recomendada por defecto); Q5_K_S ~1,7 GB; Q5_K_M ~1,8 GB; Q6_K ~2,1 GB; Q8_0 ~2,7 GB; F16 ~5,0 GB.
- Recomendacion de VRAM del autor: 1 GB para Q2_K, 2 GB para Q3_K_M, 3 GB para Q4_K_M, 4 GB para Q5_K_M, 6 GB para Q6_K y 8 GB o mas para Q8_0/F16.
- Cabe en GPU consumer practicamente cualquier tarjeta moderna: desde 4 GB (GTX 1650, RTX 3050) con Q4_K_M hasta 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) con Q8_0 o F16.
- Tambien puede ejecutarse exclusivamente en CPU con llama.cpp, dado el reducido tamano de las cuantizaciones de 2 a 4 bits.
- Opciones de despliegue: llama.cpp (llama-cli), LM Studio, Ollama (`ollama run hf.co/tinyopsec/Huihui-MiniCPM5-2B-abliterated-GGUF:Q4_K_M`), llama-cpp-python y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/Huihui-MiniCPM5-2B-abliterated-GGUF | ~2,5 B | no disponible | apache-2.0 | GGUF | Cuantizaciones de un modelo abliterated; solo ingles |
| huihui-ai/Huihui-MiniCPM5-2B-abliterated (base) | ~2,5 B | no disponible | apache-2.0 (segun repositorio derivado) | safetensors (presumible) | Modelo original sin cuantizar |
| MiniCPM5-2B (original, sin abliteration) | ~2,5 B | no disponible | no disponible | no disponible | Referencia de comportamiento con rechazos intactos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo del modelo base, lo que incrementa el riesgo de generar contenido inapropiado, ofensivo o inseguro; no es recomendable desplegarlo en aplicaciones orientadas al publico sin capas de moderacion adicionales.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a modelos de 2,5 B parametros; la precision factual en tareas de conocimiento sera limitada.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S) degradan la calidad de forma apreciable; para produccion se recomienda Q4_K_M o superior.
- No se documenta longitud de contexto, lo que impide planificar casos de uso que requieran ventanas largas.
- La licencia Apache 2.0 figura en este repositorio derivado, pero conviene verificar las condiciones del modelo base original y del MiniCPM5 subyacente antes de uso comercial.
- El repositorio tiene solo 3 likes y 1542 descargas en el momento de la consulta, lo que indica validacion comunitaria escasa.
- No se documentan capacidades de tool calling, agentes ni vision; asumir su disponibilidad seria un error.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Huihui-MiniCPM5-2B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-MiniCPM5-2B-abliterated
- llama.cpp (herramienta de cuantizacion): https://github.com/ggerganov/llama.cpp
