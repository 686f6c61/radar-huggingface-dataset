# varonis-atlas-sc/poisoned

## Resumen

El identificador `varonis-atlas-sc/poisoned` corresponde a un repositorio alojado en HuggingFace bajo la cuenta de usuario `varonis-atlas-sc`. En el momento de la consulta el repositorio acumula 0 descargas y 0 "likes", fue creado y actualizado el 21 de septiembre de 2026 (misma marca temporal para ambos eventos) y declara unicamente la etiqueta de licencia MIT y la region `us`. No tiene pipeline declarado, no especifica idiomas soportados y su model card no contiene mas contenido que el bloque de metadatos con la licencia.

No se dispone de ninguna informacion tecnica verificable sobre el artefacto: no se indica arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento, formato de pesos ni resultados de evaluacion. El propio nombre del repositorio (`poisoned`) y el patron de identificacion de la cuenta sugieren que podria tratarse de un artefacto de investigacion o de una prueba relacionada con envenenamiento de datos o de cadena de suministro de modelos, pero esto es una hipotesis derivada del nombre y no un dato confirmado por el autor.

Los resultados de busqueda web recuperados hacen referencia a Varonis Systems, una empresa de seguridad de datos y DSPM con sede en Nueva York y centros de I+D en Herzliya (Israel), asi como a noticias sobre el fin de soporte de sus productos on-premise. Ninguno de esos resultados documenta el modelo, su autoria ni su contenido, por lo que no aportan informacion tecnica utilizable para esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio de HuggingFace. No consta si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM), un modelo hibrido ni cualquier otra variante.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones tecnicas asociadas (atencion lineal, decodificacion especulativa, cuantizacion nativa, etc.). Toda esta seccion queda marcada como no disponible.

## Capacidades

- No se ha documentado ninguna capacidad funcional del modelo.
- No consta soporte de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta cobertura multilingue.
- No consta ningun modo especial (thinking mode, audio, vision u otros).

## Casos de uso

No es posible recomendar casos de uso concretos sin informacion verificable sobre arquitectura, tamanio, contexto o licencia de uso efectiva. A continuacion se enumeran unicamente escenarios de evaluacion que tendrian sentido dado el estado actual del repositorio:

- Auditoria de cadena de suministro de modelos: inspeccionar el repositorio para determinar si contiene pesos reales, scripts maliciosos o artefactos de prueba antes de cualquier integracion en un pipeline.
- Analisis de seguridad de artefactos de HuggingFace: revisar los ficheros publicados en busca de `pickle` inseguro, codigo ejecutable en la carga o dependencias no declaradas.
- Verificacion de procedencia: comprobar si el nombre de la cuenta guarda relacion con Varonis Systems o si se trata de una suplantacion, dado que no existe vinculo confirmado.
- Reproducibilidad de investigacion sobre envenenamiento de datos: en caso de que el artefacto forme parte de un estudio, usarlo como muestra controlada en experimentos de deteccion de modelos manipulados.
- Docencia en seguridad de IA: emplearlo como ejemplo de repositorio opaco con licencia permisiva pero sin documentacion tecnica.
- Monitorizacion de repositorios de riesgo: incluirlo en listas de vigilancia de modelos sin model card, sin pipeline declarado y con cero adopcion.

Cualquier uso en produccion, atencion al cliente, generacion de codigo o analisis de datos queda descartado por ausencia total de especificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamanio del modelo.
- Opciones de despliegue: no disponible; no consta formato de pesos compatible con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.
- Antes de cualquier intento de despliegue se recomienda inspeccionar los ficheros del repositorio, ya que un artefacto sin model card puede contener codigo de carga no seguro.

## Comparativa con modelos similares

No disponible. No existen datos tecnicos de este artefacto (tamanio, contexto, licencia de uso efectiva, resultados) que permitan una comparacion con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos publicados |
|---|---|---|---|---|---|
| varonis-atlas-sc/poisoned | no disponible | no disponible | MIT | HuggingFace, 0 descargas | ninguno |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion sobre datos de entrenamiento, sesgos o comportamiento esperado.
- Riesgo de alucinacion: no evaluable sin especificaciones ni pruebas publicadas.
- Riesgo de seguridad: un repositorio sin pipeline declarado, sin documentacion y con el termino `poisoned` en el nombre debe tratarse como no confiable hasta que se audite su contenido.
- Riesgo de suplantacion de marca: los resultados de busqueda apuntan a Varonis Systems, empresa de ciberseguridad, pero no existe confirmacion de que este repositorio este afiliado a ella.
- Limitaciones de idioma y contexto: no disponibles.
- Licencia: MIT, permisiva y apta para uso comercial segun el texto declarado, pero sin garantias del autor ni informacion sobre la procedencia de los pesos.
- Cero adopcion: 0 descargas y 0 interacciones reducen la probabilidad de que existan informes independientes de comportamiento o seguridad.
- No usar en produccion sin una auditoria previa de los ficheros y una verificacion de identidad del publicador.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/varonis-atlas-sc/poisoned
- Varonis (sitio oficial, en frances): https://www.varonis.com/fr/
- Varonis (sitio oficial, en ingles): https://www.varonis.com/
- Varonis Systems en Wikipedia (ingles): https://en.wikipedia.org/wiki/Varonis_Systems
- Varonis Systems en Wikipedia (frances): https://fr.wikipedia.org/wiki/Varonis_Systems
- Nota sobre el fin de soporte de Varonis on-premise: https://netwrix.com/fr/resources/blog/varonis-on-prem-end-of-life/
- Paper, blog tecnico, repositorio de codigo o demo del modelo: no disponible
