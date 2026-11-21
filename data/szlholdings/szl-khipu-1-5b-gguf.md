# SZLHOLDINGS/SZL-Khipu-1.5B-GGUF

## Resumen

SZL-Khipu-1.5B-GGUF es la version cuantizada en formato GGUF del modelo SZL-Khipu-1.5B, publicado por la organizacion SZLHOLDINGS dentro de lo que el autor denomina un "estate de IA gobernada" con resultados verificables y trazabilidad de origen. Se trata de un modelo de generacion de texto de tipo conversacional, con 1.543.714.304 parametros totales (aproximadamente 1,5 mil millones), distribuido bajo licencia Apache 2.0 y orientado a ejecucion local mediante llama.cpp.

El modelo base del que deriva es SZLHOLDINGS/SZL-Khipu-1.5B, y esta version GGUF esta pensada para despliegue en entornos con recursos limitados, incluyendo CPU y GPUs de consumo. La model card es deliberadamente conservadora en sus afirmaciones: el autor indica explicitamente que cualquier dato de entrenamiento o evaluacion no documentado en sus ficheros de "recibos" (receipts) debe considerarse desconocido (UNKNOWN), y que no se afirma ninguna cifra de benchmark que no haya sido medida en una auditoria con fecha.

La relevancia actual del modelo reside en su enfoque de gobernanza y auditabilidad: cada afirmacion se etiqueta como MEASURED, REPORTED o UNKNOWN con marca temporal, lo que facilita la evaluacion critica por parte de desarrolladores e investigadores. No obstante, la informacion tecnica publica disponible es muy escasa (arquitectura, datos de entrenamiento y benchmarks no se detallan), lo que limita una evaluacion profunda a partir de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.543.714.304 (aprox. 1,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo en la documentacion proporcionada. El dato objetivo disponible es el numero de parametros (1.543.714.304), obtenido de los pesos en safetensors del modelo base, y el hecho de que se distribuye como artefacto GGUF para llama.cpp, lo que implica compatibilidad con las arquitecturas soportadas por dicho runtime. No se especifica si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o un modelo SSM.

Respecto al entrenamiento, la model card no documenta el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor declara explicitamente que las afirmaciones de entrenamiento y evaluacion residen en ficheros de recibos (receipts) del "estate" y que cualquier dato no documentado alli debe considerarse UNKNOWN. Por tanto, no es posible confirmar innovaciones tecnicas como decodificacion especulativa, atencion lineal u otras optimizaciones.

## Capacidades

- Generacion de texto de tipo conversacional, segun la etiqueta de pipeline (text-generation) y el tag "conversational".
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integracion con infraestructura de inferencia estandar.
- Ejecucion local mediante llama.cpp, al distribuirse en formato GGUF.
- Soporte multilingue limitado al ingles segun el campo de idiomas del repositorio.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Asistentes conversacionales locales: al ser un modelo de 1,5B en GGUF, puede ejecutarse en portatiles o equipos sin GPU dedicada mediante llama.cpp, sirviendo como chatbot de proposito general en ingles con baja latencia.
- Prototipado rapido de aplicaciones de texto: su tamano reducido permite iterar en el diseno de prompts y flujos conversacionales antes de migrar a modelos mayores, con un coste de computo minimo.
- Procesamiento por lotes en CPU: la cuantizacion GGUF y el reducido numero de parametros permiten ejecutar tareas de generacion de texto en servidores sin acelerador, utiles para clasificacion, resumen o reescritura a pequena escala.
- Educacion e investigacion: sirve como modelo de referencia para estudiar tecnicas de cuantizacion y el comportamiento de modelos pequenos en ingles, dado su caracter auditado y su licencia permisiva.
- Integracion en pipelines de CI/CD para pruebas: puede emplearse como modelo "stub" en tests automatizados de aplicaciones que consumen APIs de generacion de texto, evitando costes de modelos mayores.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente, los datos no salen del equipo, lo que resulta adecuado para prototipos en dominios sensibles donde no se permite enviar texto a servicios en la nube.
- Evaluacion de gobernanza de modelos: el enfoque de recibos auditables del autor lo hace util para estudiar practicas de documentacion y trazabilidad en modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria con fecha haya medido, y no se incluyen dichas mediciones en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1,5B en GGUF, las cuantizaciones tipicas de 4 bits suelen requerir del orden de 1-2 GB de memoria, aunque este dato no esta confirmado por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060 o superiores, si bien no hay validacion publicada.
- Cabe en GPU de consumo: previsiblemente si, dado el reducido numero de parametros, aunque no se documenta oficialmente.
- Opciones de despliegue: llama.cpp (libreria declarada); el tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia estandar, pero no se detallan opciones como vLLM, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de tamano similar (por ejemplo, otros modelos de 1,5B en GGUF). Cualquier comparacion seria especulativa y contravendria la regla de no inventar datos.

## Limitaciones y advertencias

- Idiomas: el repositorio declara unicamente ingles ("en"), por lo que el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Documentacion tecnica escasa: no se publican arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion: inherente a los modelos de generacion de texto de este tamano; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados; al no conocerse la composicion del dataset, no es posible evaluar sesgos de entrenamiento.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con contextos largos.
- Licencia: Apache 2.0, permisiva para uso comercial, pero el autor no ofrece garantias sobre el rendimiento ni sobre la procedencia de los datos de entrenamiento mas alla de sus recibos internos.
- Enfoque de gobernanza: el modelo se presenta dentro de un "estate" con recibos auditables; conviene verificar dichos recibos en el repositorio de origen antes de confiar en cualquier afirmacion adicional.
- Popularidad limitada: 1 like y 6008 descargas en el momento de la consulta, lo que indica una adopcion reducida y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de generacion de tarjetas (referenciado): https://github.com/szl-holdings/estate-cards
