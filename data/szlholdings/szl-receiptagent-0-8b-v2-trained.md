# SZLHOLDINGS/szl-receiptagent-0.8b-v2-trained

## Resumen

El modelo `szl-receiptagent-0.8b-v2-trained` es un modelo publicado en Hugging Face por la organizacion SZLHOLDINGS. Por su identificador, el nombre sugiere un modelo de aproximadamente 0,8 mil millones de parametros (0.8b) orientado a tareas de agente sobre recibos ("receiptagent"), en su segunda version ("v2") y en estado entrenado ("trained"). Sin embargo, esta interpretacion se deriva unicamente del nombre del repositorio: la model card no confirma ni desarrolla ninguno de estos extremos.

La model card es la plantilla generica autogenerada por Hugging Face para modelos de transformers. Todos los campos sustantivos (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparametros, evaluacion y uso previsto) aparecen marcados como "[More Information Needed]". El repositorio tiene un tamano declarado de 0.0 GB y cero descargas, y fue creado y actualizado el 2026-11-14 con apenas tres segundos de diferencia, lo que apunta a una publicacion automatizada o incompleta.

Por tanto, esta ficha describe el modelo a partir de los metadatos disponibles (tags, libreria y nombre) y marca explicitamente como "no disponible" cualquier dato que no pueda verificarse. Es relevante ahora unicamente como caso de repositorio con documentacion pendiente: no deberia evaluarse para uso en produccion hasta que el autor publique especificaciones, licencia y resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; por el sufijo "0.8b" se infiere un transformer decoder-only de ~0,8B, sin confirmacion) |
| Parametros totales | no disponible (el nombre sugiere ~0,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declaran pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (unico formato declarado en los tags) |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura en la model card: no se especifica si es un transformer denso, un MoE, un modelo hibrido o cualquier otra variante. Los tags del repositorio (`transformers`, `safetensors`) confirman unicamente que se carga con la libreria Transformers de Hugging Face y que los pesos se almacenan en formato safetensors. El sufijo "0.8b" del identificador sugiere un orden de magnitud de 0,8 mil millones de parametros, pero no hay confirmacion documental.

Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del corpus, posible filtrado), ni el procedimiento (preentrenamiento, fine-tuning supervisado, RLHF/DPO), ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La seccion de hiperparametros de la model card indica "[More Information Needed]" en todos los campos, incluido el regimen de entrenamiento. El tag `arxiv:1910.09700` corresponde al paper de Lacoste et al. sobre estimacion de emisiones de carbono, citado en la plantilla generica, y no a un paper del propio modelo.

## Capacidades

- Generacion de texto: no confirmada documentalmente; la model card no describe ninguna capacidad.
- Razonamiento, codigo y matematicas: no disponible.
- Vision, audio o multimodalidad: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible, aunque el nombre "receiptagent" sugiere un proposito orientado a agentes sobre recibos, sin confirmacion.
- Capacidades multilingues: no disponible.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

Dado que no hay documentacion de capacidades, los siguientes casos son hipotesis derivadas del nombre del modelo y deben validarse empiricamente antes de cualquier uso real:

- Extraccion de datos de recibos: procesar imagenes o texto de recibos para obtener campos estructurados (fecha, comercio, importe, impuestos), si el modelo dispone de capacidad multimodal o de OCR en pipeline externo. Requiere verificacion previa.
- Clasificacion y enrutado de documentos: usar el modelo como clasificador ligero de recibos y tickets dentro de un pipeline de gestion de gastos, aprovechando su tamano reducido (~0,8B) para inferencia barata en CPU o GPU consumer.
- Validacion de gastos en flujos de reembolso: comprobar coherencia entre recibos y solicitudes de gasto en un sistema de gestion de notas de gastos, siempre con revision humana.
- Agente de atencion al usuario para consultas de recibos: responder preguntas sobre recibos concretos en un asistente de finanzas personales, condicionado a que el modelo soporte conversacion multi-turno.
- Prototipado rapido en entornos con recursos limitados: al ser un modelo pequeno en safetensors, sirve para experimentar con pipelines de transformers en entornos de desarrollo sin GPU de gran capacidad.
- Fine-tuning especifico de dominio: partir de este checkpoint para ajustar un extractor de recibos propio, si la licencia lo permite (actualmente no disponible).
- Evaluacion comparativa de modelos pequenos: incluirlo en pruebas controladas frente a otros modelos de ~1B para tareas de extraccion documental, como benchmark interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma documental. Como referencia orientativa, un modelo de ~0,8B parametros en fp16 ocuparia aproximadamente 1,6 GB de pesos, y en int8/int4 entre 0,8 y 0,4 GB, ademas de memoria para activaciones y cache KV; estas cifras son estimaciones tecnicas basadas en el tamano nominal, no datos del autor.
- GPU recomendadas: no disponible. Por tamano nominal, seria desplegable en GPU consumer (RTX 3060, RTX 4090) y en CPU, pero sin confirmacion.
- Cabe en GPU consumer: probablemente si, segun el tamano nominal; no confirmado.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados, y llama.cpp requeriria conversion a GGUF, formato no presente en el repo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No hay datos de rendimiento, contexto ni licencia de este modelo que permitan una comparacion rigurosa con alternativas de la misma categoria (modelos de ~1B parametros orientados a extraccion documental o agentes). Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Model card incompleta: todos los campos relevantes (arquitectura, datos, licencia, evaluacion) estan sin cumplimentar, lo que impide una evaluacion tecnica fiable.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; usar el modelo en produccion sin aclarar la licencia es un riesgo legal.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion comunitaria.
- Repositorio de 0.0 GB: el tamano declarado no concuerda con un checkpoint de ~0,8B parametros en safetensors, lo que sugiere que los pesos pueden no estar subidos o que el calculo de tamano esta incompleto; verificar antes de descargar.
- Riesgo de alucinacion: no evaluado; cualquier uso en extraccion de datos financieros exige validacion y revision humana.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles.
- Fecha de creacion futura (2026-11-14) y actualizacion tres segundos posterior: indicio de publicacion automatizada sin revision manual.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-0.8b-v2-trained
- Paper citado en la model card (Lacoste et al., 2019, estimacion de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML citada en la model card: https://mlco2.github.io/impact#compute
