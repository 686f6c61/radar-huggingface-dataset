# TalentPigs/zils-lite-bw3

## Resumen

zils-lite-bw3 es un modelo de extraccion de caracteristicas (feature-extraction) publicado por TalentPigs, construido como un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B. La model card lo describe como un "cuerpo de decision d3-lite" (decision body) destinado al pool lite de la subred 127 de Zils. Con 852.985.920 parametros (aproximadamente 0,85 mil millones) y un peso en repositorio de 1,7 GB en formato safetensors, se posiciona en la gama de modelos pequenos orientados a tareas de clasificacion o puntuacion ligera mas que a generacion abierta de texto.

El modelo hereda la arquitectura de la familia Qwen3.5, aunque la informacion proporcionada no detalla la configuracion especifica de capas, atencion ni ventana de contexto. Su publicacion es reciente (noviembre de 2026) y, en el momento de la consulta, no registra descargas ni interacciones en Hugging Face, lo que lo convierte en un artefacto de nicho dentro de un ecosistema de subredes y pools de decision.

Por su licencia Apache-2.0 y su tamano contenido, resulta relevante para quienes exploran modelos de decision de bajo coste computacional que puedan ejecutarse en hardware modesto, aunque la ausencia de documentacion tecnica detallada y de benchmarks publicados limita seriamente su evaluacion previa a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles de capas y atencion no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint Qwen/Qwen3.5-0.8B, por lo que su columna vertebral corresponde a la arquitectura de la familia Qwen3.5 en su variante de 0,8 mil millones de parametros. La informacion disponible no especifica el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se detalla el proceso de entrenamiento: no hay datos sobre volumen de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineacion.

La unica informacion sobre el proposito del ajuste es que se trata de un "d3-lite decision body" para el pool lite de la subred 127 de Zils. Esto sugiere un entrenamiento orientado a producir representaciones o puntuaciones de decision en lugar de generacion libre, coherente con la etiqueta de pipeline feature-extraction. No se documentan detalles sobre la funcion de perdida, el dataset de ajuste ni el procedimiento de evaluacion.

## Capacidades

- Extraccion de caracteristicas: el pipeline declarado es feature-extraction, por lo que el uso previsto es obtener representaciones vectoriales de entradas de texto.
- Modelo de decision: la model card lo etiqueta como decision-model dentro del ecosistema Zils, lo que apunta a tareas de clasificacion, puntuacion o seleccion.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que puede servirse a traves de la infraestructura de inferencia de Hugging Face.
- Codigo personalizado: requiere custom_code, es decir, depende de implementaciones propias del autor para cargarse correctamente en transformers.
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes y capacidades multilingues: no disponible (no se documentan en la informacion proporcionada).

## Casos de uso

- Puntuacion de candidatos en pools de decision: el modelo puede emplearse para asignar una puntuacion o etiqueta a entradas de texto dentro del pool lite de la subred Zils, aprovechando su naturaleza de decision-model y su bajo coste computacional.
- Extraccion de embeddings para busqueda semantica: al declararse como feature-extraction, puede generar representaciones vectoriales que alimenten indices de recuperacion sobre corpus pequenos o medianos.
- Clasificacion ligera en produccion: con menos de mil millones de parametros, es viable desplegarlo como clasificador de baja latencia en CPU o GPU modesta para tareas de filtrado o enrutamiento.
- Componente de un pipeline multi-etapa: puede actuar como primera etapa de filtrado o scoring antes de invocar modelos mayores, reduciendo el coste total del sistema.
- Experimentacion en el ecosistema Zils: util para desarrolladores que construyen o auditan nodos del pool lite de la subred 127 y necesitan el cuerpo de decision de referencia.
- Evaluacion comparativa de finetunes pequenos: sirve como punto de partida para estudiar el efecto del ajuste sobre Qwen3.5-0.8B en tareas de decision, dado que el checkpoint base es publico y la licencia permite redistribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) el modelo ronda los 3,4 GB; en fp16/bf16 aproximadamente 1,7 GB; en cuantizacion de 8 bits alrededor de 0,9 GB y en 4 bits en torno a 0,5 GB (estimaciones teoricas a partir del numero de parametros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (requiere custom_code del autor), y potencialmente servidores compatibles con endpoints de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF limita el despliegue en llama.cpp/Ollama sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TalentPigs/zils-lite-bw3 | 852.985.920 | no disponible | Apache-2.0 | safetensors | Finetune de decision para subred Zils; sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8 B (segun checkpoint base) | no disponible | no disponible en la informacion | safetensors | Modelo base del que deriva; capacidades generales no documentadas aqui |
| Alternativas de ~1 B para feature-extraction | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion tecnica: no es posible estimar su calidad frente al modelo base ni frente a alternativas.
- Sesgos: no documentados; al derivar de un modelo base de proposito general, puede heredar sesgos de los datos de preentrenamiento de Qwen3.5, pero no hay analisis publicado.
- Riesgo de alucinacion: relevante si se usa fuera de su proposito de decision; no se ha evaluado su comportamiento generativo.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto efectiva y la cobertura linguistica.
- Dependencia de codigo personalizado: la etiqueta custom_code implica que la carga en transformers puede requerir el repositorio remoto habilitado o la instalacion de modulos del autor, lo que anade riesgo de cadena de suministro.
- Licencia: Apache-2.0 permite uso comercial y redistribucion, pero la model card remite a LICENSE y NOTICE para atribuciones de terceros que deben respetarse.
- Madurez: cero descargas y cero interacciones en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento activo.
- Proposito acotado: su etiqueta de decision-model y su asociacion a un pool especifico de Zils sugieren que no esta pensado como modelo de proposito general.

## Enlaces

- Hugging Face: https://huggingface.co/TalentPigs/zils-lite-bw3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del autor (TalentPigs): https://huggingface.co/TalentPigs
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
