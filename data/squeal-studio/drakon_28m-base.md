# Squeal-Studio/drakon_28m-base

## Resumen

Squeal-Studio/drakon_28m-base es un modelo publicado en HuggingFace por el usuario u organizacion Squeal-Studio bajo licencia Apache 2.0. El repositorio se creo y se actualizo el 27 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes". La model card publicada no contiene informacion tecnica: unicamente incluye la declaracion de licencia, sin descripcion del modelo, sin datos de entrenamiento, sin especificaciones de arquitectura y sin resultados de evaluacion.

El unico indicio sobre la naturaleza del modelo es su propio nombre, "drakon_28m-base", que sugiere un modelo de aproximadamente 28 millones de parametros en variante "base" (es decir, sin ajuste por instrucciones). Se trata de una inferencia a partir del identificador del repositorio y no de un dato confirmado por el autor, por lo que debe tomarse con cautela. El tag "region: us" indica la region de despliegue declarada en el Hub, y no aporta informacion sobre capacidades.

Por su tamano aparente, el modelo encajaria en la categoria de modelos pequenos orientados a experimentacion, prototipado rapido o entrenamiento desde cero en hardware de consumo. Sin embargo, la ausencia total de documentacion, de tokenizer declarado, de idiomas soportados y de benchmarks impide evaluar su calidad, su cobertura linguistica o su idoneidad para cualquier caso de uso en produccion. Esta ficha refleja esa situacion y marca como "no disponible" todos los parametros que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el identificador del repositorio sugiere 28M, sin confirmar) |
| Parametros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no especifica si se trata de un transformer denso, un transformer con atencion lineal, una arquitectura de espacio de estados (SSM), un modelo hibrido o cualquier otra variante. Tampoco se indica el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el tipo de normalizacion ni el esquema de posiciones (absolutas, RoPE, ALiBi, etc.).

Del mismo modo, se desconoce por completo el proceso de entrenamiento: no hay datos sobre el volumen de tokens utilizados, la composicion del dataset, la mezcla de idiomas, la posible aplicacion de tecnicas de ajuste como SFT, RLHF o DPO, ni la existencia de fases de preentrenamiento intermedias. El sufijo "base" en el nombre sugiere que el modelo no ha pasado por un ajuste por instrucciones, pero esto es una convencion de nomenclatura y no una confirmacion del autor. Tampoco se documenta ninguna innovacion tecnica asociada.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- No hay evidencia publicada sobre generacion de texto, razonamiento, generacion de codigo o resolucion de problemas matematicos.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso o planificacion.
- No hay informacion sobre cobertura multilingue ni sobre el tokenizer empleado.
- No hay informacion sobre modos especiales (modo de razonamiento o "thinking", vision, audio o multimodalidad).
- Por convencion del sufijo "base", es probable que el modelo no responda de forma fiable a instrucciones conversacionales, aunque esto no esta confirmado.

## Casos de uso

Dado que no se ha publicado ninguna especificacion tecnica, no es posible recomendar casos de uso concretos con fundamento. Los siguientes escenarios son unicamente aplicaciones genericas de un modelo de lenguaje de ~28M de parametros sin ajuste por instrucciones, y requeririan validacion previa:

- Experimentacion academica con modelos de lenguaje de escala reducida: el modelo podria servir como punto de partida para estudiar dinamicas de entrenamiento, tecnicas de destilacion o comportamientos de modelos pequenos, siempre que se confirmen sus caracteristicas reales.
- Generacion de texto exploratoria sin requisitos de calidad: en tareas de continuacion de texto libre donde el resultado se revise manualmente, un modelo de este tamano puede emplearse como generador de borradores rapidos.
- Fine-tuning especifico de dominio: si el modelo es realmente "base", podria ajustarse sobre un corpus concreto (por ejemplo, textos legales o medicos) para tareas de clasificacion o extraccion, aunque no hay datos que confirmen que el ajuste funcione.
- Prototipado de pipelines de inferencia: util para probar integraciones con llama.cpp, transformers o vLLM en entornos de desarrollo antes de escalar a modelos mayores.
- Educacion y divulgacion: puede usarse para ilustrar como funciona la inferencia de un transformer pequeno en cursos o talleres, siempre que se verifique la arquitectura.
- Evaluacion comparativa de modelos minimos: como referencia en estudios sobre la relacion entre numero de parametros y calidad, si se dispone de los pesos y del tokenizer.

Ninguno de estos casos esta respaldado por documentacion del autor. Antes de considerar cualquier uso, es imprescindible inspeccionar los archivos del repositorio y ejecutar evaluaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones basadas en la suposicion de que el modelo tiene ~28 millones de parametros, tal como sugiere su identificador. No estan confirmadas por el autor.

- VRAM estimada para inferencia en FP16: en torno a 60-80 MB solo para los pesos, mas el consumo del runtime (tipicamente varios cientos de MB adicionales en frameworks como PyTorch).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 30-40 MB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 15-20 MB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4090, A100 o H100 estarian sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si el tamano es el indicado, cabe sin problema en cualquier GPU de consumo moderna e incluso podria ejecutarse en CPU con latencias aceptables.
- Opciones de despliegue: no disponibles, ya que se desconoce el formato de pesos. Si los pesos estan en safetensors, serian compatibles con transformers y vLLM; si existiera una version GGUF, seria compatible con llama.cpp y Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos publicados sobre el modelo que permitan una comparacion rigurosa. A continuacion se recogen modelos de escala comparable ampliamente documentados, con las celdas del modelo evaluado marcadas como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| drakon_28m-base | no disponible (nombre sugiere 28M) | no disponible | Apache 2.0 | HuggingFace, sin documentacion |
| GPT-2 small | 124M | 1024 tokens | MIT | HuggingFace, ampliamente documentado |
| Pythia-70M | 70M | 2048 tokens | Apache 2.0 | HuggingFace, con modelo card completa |
| TinyLlama-1.1B | 1,1B | 2048 tokens | Apache 2.0 | HuggingFace, con benchmarks publicados |

Las cifras de los modelos de comparacion corresponden a informacion publica de sus respectivos autores. No se dispone de datos equivalentes para drakon_28m-base.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card solo contiene la licencia, sin informacion sobre arquitectura, entrenamiento, tokenizer o datos.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos de genero, raza, religion o ideologia.
- Riesgo de alucinacion: no evaluado. En modelos pequenos de tipo "base" la tasa de contenido factualmente incorrecto suele ser alta, aunque no hay mediciones para este caso concreto.
- Limitaciones de contexto e idioma: se desconocen la longitud de contexto soportada y los idiomas cubiertos.
- Estado del modelo: el sufijo "base" sugiere que no esta ajustado por instrucciones, por lo que probablemente no responda adecuadamente a peticiones conversacionales.
- Ausencia de adopcion: 0 descargas y 0 "likes" indican que el modelo no ha sido validado por la comunidad.
- Fecha de publicacion futura: el repositorio figura creado el 27 de septiembre de 2026, una fecha que puede deberse a un error de metadatos del Hub.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al no existir documentacion sobre el origen de los datos de entrenamiento no puede descartarse un riesgo de reclamaciones por derechos de autor sobre el corpus.
- No apto para produccion sin evaluacion previa: no debe desplegarse en ningun sistema critico sin una bateria de pruebas propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Squeal-Studio/drakon_28m-base
- Perfil del autor en HuggingFace: https://huggingface.co/Squeal-Studio
- No se han encontrado papers, blogs, repositorios de codigo ni demos asociados al modelo en la informacion disponible.
