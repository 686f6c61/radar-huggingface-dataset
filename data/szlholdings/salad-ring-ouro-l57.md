# SZLHOLDINGS/salad-ring-ouro-l57

## Resumen

`salad-ring-ouro-l57` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS dentro de lo que el autor denomina su "governed-AI estate": un catalogo de modelos, datasets y Spaces con trazabilidad de origen y resultados verificables mediante ficheros de "recibo" (receipts). El repositorio de Hugging Face no incluye model card tecnica en sentido convencional: la informacion disponible se limita a metadatos de identidad, avisos de honestidad y graficos SVG generados de forma determinista a partir de una instantanea de auditoria.

La model card es explicita al respecto: cualquier afirmacion sobre entrenamiento o evaluacion de este artefacto reside en sus ficheros de recibo dentro de la malla del estate, y todo lo que no este receipted se declara como UNKNOWN. No se publica arquitectura, numero de parametros, longitud de contexto, tokenizador, composicion del dataset ni resultados de benchmarks en la propia pagina del repositorio.

Por tanto, esta ficha documenta lo que el autor afirma y marca como no disponible todo lo demas. El modelo no presenta descargas ni likes en el momento de la consulta, fue creado el 18 de noviembre de 2026 y actualizado el 20 de noviembre de 2026, y no declara licencia, idiomas ni pipeline en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un modelo hibrido, ni tampoco detalla el tokenizador, la funcion de activacion, el esquema de atencion o cualquier otra decision de diseno.

Respecto al entrenamiento, el autor no aporta numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas destacables. La unica afirmacion relevante es de caracter metodologico: las aserciones sobre entrenamiento y evaluacion "viven en sus ficheros de recibo" dentro de la malla del estate, y cualquier dato no receipted se etiqueta como UNKNOWN. La instantanea de auditoria referenciada en la card tiene marca temporal 2026-11-20T03:48:04Z y los graficos se generan con la herramienta `estate-cards weaver v0.1.0` (Python de biblioteca estandar, SVG determinista, paleta KANCHAY).

## Capacidades

- No se documentan capacidades funcionales del modelo en la informacion disponible.
- No se confirma soporte de generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingues ni idiomas cubiertos.
- No se confirma la existencia de modos especiales (thinking mode, vision, audio).
- La unica capacidad verificable es de gobernanza: el artefacto se presenta como parte de un estate con trazabilidad de origen y resultados etiquetados como MEASURED, REPORTED o UNKNOWN con marca temporal de captura.

## Casos de uso

- Auditoria de procedencia de artefactos: el modelo se integra en un flujo de gobernanza donde cada afirmacion sobre entrenamiento o evaluacion debe poder rastrearse hasta un fichero de recibo con marca temporal; util para equipos que exigen trazabilidad documental antes de adoptar un modelo.
- Evaluacion comparativa interna: dado que la card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada, el modelo puede servir como caso de estudio de practicas de documentacion honesta en publicacion de modelos.
- Verificacion de reproducibilidad: los graficos SVG se generan de forma determinista con Python de biblioteca estandar a partir de una instantanea de auditoria, lo que permite regenerar y comparar el estado del artefacto en distintos momentos.
- Catalogacion de modelos en un registro corporativo: el identificador de card (`5532f0bfeb7461cf`) y la marca temporal de generacion permiten indexar el artefacto en un inventario interno de modelos con control de versiones.
- Docencia y formacion en gobernanza de IA: el repositorio ilustra un patron de model card minimalista centrado en procedencia y en la distincion explicita entre datos medidos, reportados y desconocidos.
- Integracion en pipelines de cumplimiento: el esquema de receipts facilita la automatizacion de comprobaciones de origen antes de desplegar un artefacto en entornos regulados, siempre que los ficheros de recibo esten accesibles en la malla del estate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y etiqueta como UNKNOWN cualquier curva no medida en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros y el formato de pesos.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma que el repositorio contenga pesos en formatos compatibles con estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar la categoria del modelo (tamano, tarea, modalidad), por lo que no es posible establecer una comparacion fundamentada con alternativas.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni formato de pesos, el modelo no es evaluable para uso en produccion.
- Licencia no declarada: no se puede asumir permiso de uso comercial, modificacion ni redistribucion; la ausencia de licencia implica, por defecto, reserva de derechos en la mayoria de jurisdicciones.
- Idiomas no declarados: se desconoce la cobertura linguistica y la calidad en castellano.
- Cero descargas y cero likes en el momento de la consulta, lo que impide cualquier validacion por parte de la comunidad.
- La propia card advierte de que las afirmaciones de entrenamiento y evaluacion solo son validas si existen ficheros de recibo verificables en la malla del estate; fuera de ese circuito, todo dato debe tratarse como no verificado.
- Riesgo de sesgos y de alucinacion: no evaluable por falta de informacion sobre datos de entrenamiento y alineacion.
- El repositorio parece orientado a demostrar el funcionamiento de la infraestructura de gobernanza del autor (`estate-cards weaver`) mas que a distribuir un modelo listo para inferencia; conviene verificar el contenido real de los ficheros antes de cualquier uso.
- Las fechas de creacion y actualizacion (noviembre de 2026) deben contrastarse con la fuente, dado que la card se genera de forma automatica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l57
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la card): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
