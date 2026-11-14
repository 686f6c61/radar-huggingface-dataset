# SZLHOLDINGS/doctrine-v2-trained

## Resumen

`SZLHOLDINGS/doctrine-v2-trained` es un modelo publicado en Hugging Face por el usuario u organizacion SZLHOLDINGS bajo la libreria `transformers`. Se trata de un repositorio practicamente vacio: la model card es la plantilla autogenerada por Hugging Face sin ningun campo completado (todos los apartados indican "[More Information Needed]") y el tamano del repositorio es de 0.0 GB, lo que sugiere que no contiene pesos descargables o que estos no se han subido.

No hay informacion publica sobre arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados. El unico metadato tecnico relevante es el tag `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. (2019) sobre estimacion de emisiones de carbono en aprendizaje automatico y que aparece en la plantilla por defecto de Hugging Face, no porque el modelo se base en dicho paper. Tambien figura el tag `endpoints_compatible`, que indica compatibilidad con Inference Endpoints de Hugging Face.

Por tanto, esta ficha documenta la existencia del repositorio y sus metadatos verificables, pero no puede evaluar el modelo en si: no es posible determinar que problema resuelve, su calidad ni su idoneidad para produccion. Se recomienda precaucion ante cualquier uso, dado que no hay evidencia de pesos, documentacion ni evaluacion.

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
| Formato de pesos | safetensors (segun tag del repositorio); no se confirma la presencia de ficheros de pesos (tamano del repo: 0.0 GB) |

## Arquitectura y entrenamiento

No disponible. La model card no especifica la arquitectura (transformer, MoE, SSM u otra), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El unico indicio es la libreria declarada (`transformers`) y el tag `safetensors`, que apuntan a un modelo compatible con el ecosistema Hugging Face, pero sin confirmacion de que los pesos esten realmente publicados.

El tag `arxiv:1910.09700` no debe interpretarse como referencia a la arquitectura del modelo: es el enlace a Lacoste et al. (2019) que la plantilla de model card incluye por defecto en la seccion de impacto medioambiental.

## Capacidades

- No se puede confirmar ninguna capacidad: generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes o capacidades multilingues no estan documentadas.
- No hay ejemplos de uso ni codigo de inferencia en la model card.
- No hay evidencia de modos especiales (thinking mode, vision, audio) ni de soporte de function calling.

## Casos de uso

No es posible recomendar casos de uso concretos sin informacion sobre las capacidades del modelo. A modo de advertencia, cualquier escenario de produccion (atencion al cliente, generacion de codigo, analisis documental, agentes, etc.) requeriria antes verificar que el repositorio contiene pesos funcionales y que existe documentacion tecnica. Dado el estado actual del repositorio, los unicos usos razonables son:

- Auditoria del repositorio: inspeccionar los ficheros del Hub para comprobar si existen pesos, configuracion (`config.json`), tokenizador o scripts de inferencia.
- Seguimiento de publicaciones: monitorizar si el autor completa la model card y sube artefactos en futuras actualizaciones.
- Prueba de compatibilidad con Inference Endpoints: el tag `endpoints_compatible` sugiere que el repositorio podria desplegarse en la infraestructura de Hugging Face, pero sin pesos verificados no hay garantia de que funcione.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano del modelo, que se desconoce).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria declarada es `transformers`, por lo que en principio seria desplegable con frameworks compatibles (vLLM, TGI, llama.cpp si existieran pesos GGUF), pero no hay confirmacion de que existan pesos ni configuracion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer el tamano, la arquitectura ni la tarea del modelo.

## Limitaciones y advertencias

- Repositorio sin documentacion: la model card es la plantilla autogenerada y no aporta informacion sobre el modelo.
- Posible ausencia de pesos: el tamano del repositorio es de 0.0 GB, lo que sugiere que no se han subido artefactos descargables.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido; en ausencia de licencia explicita, deben aplicarse las condiciones por defecto del Hub y consultar al autor.
- Sin evaluacion: no hay benchmarks, pruebas de sesgo ni analisis de alucinacion.
- Sin garantias para produccion: no debe integrarse en sistemas reales sin una auditoria previa del contenido del repositorio.
- Fecha de creacion futura en los metadatos (2026-11-13), lo que resulta anomalo y refuerza la necesidad de verificar la autenticidad y el estado real del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/doctrine-v2-trained
- Paper referenciado en el tag (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact
