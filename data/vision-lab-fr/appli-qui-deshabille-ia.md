# vision-lab-fr/appli-qui-deshabille-ia

## Resumen

El repositorio `vision-lab-fr/appli-qui-deshabille-ia` no contiene un modelo de inteligencia artificial en el sentido tecnico del termino. Se trata de una model card alojada en HuggingFace cuyo contenido es una pagina promocional en frances que compara supuestas "aplicaciones que desnudan con IA" y que incluye enlaces de afiliado o redireccionamiento. No hay pesos, configuracion, tokenizador ni artefactos de inferencia publicados.

El autor, bajo la organizacion `vision-lab-fr`, no proporciona informacion sobre arquitectura, parametros, contexto, datos de entrenamiento ni licencia mas alla de la etiqueta `apache-2.0` en los metadatos. La fecha de creacion indicada (2026-08-07) y la de actualizacion (2026-10-29) son posteriores a la fecha actual, lo que sugiere metadatos inconsistentes o manipulados.

Desde el punto de vista de evaluacion tecnica, este repositorio no es utilizable: no es un modelo, no ofrece capacidades de generacion, razonamiento, codigo ni vision, y su tematica esta vinculada a la generacion de imagenes intimas no consentidas, lo que plantea problemas legales y eticos graves en la mayoria de jurisdicciones, incluida Espana y la UE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (segun metadatos; sin artefactos que la acompanen) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura, datos de entrenamiento, proceso de alineacion (RLHF, DPO) ni innovaciones tecnicas. El repositorio carece de ficheros de pesos, configuracion o scripts de entrenamiento. La model card consiste en HTML con estilos CSS embebidos, tablas comparativas de servicios de terceros y botones de llamada a la accion, sin contenido tecnico sobre un modelo.

No existe evidencia de que se haya entrenado ningun modelo asociado a este identificador. La etiqueta `region:us` y la licencia `apache-2.0` aparecen en los metadatos, pero no hay artefactos que permitan verificar su aplicacion.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues.
- No se declara modo thinking, vision, audio ni ninguna capacidad especial.
- El unico contenido es una pagina de comparativa de servicios de terceros con enlaces promocionales.

## Casos de uso

- No procede: el repositorio no contiene un modelo desplegable, por lo que no existen casos de uso legitimos de inferencia.
- Auditoria de seguridad de la cadena de suministro de modelos: un equipo de plataforma podria usar este repositorio como ejemplo de model card maliciosa o spam para calibrar filtros de deteccion en registros internos de HuggingFace.
- Formacion en governance de IA: podria citarse como caso de estudio de abuso de plataformas de publicacion de modelos para distribucion de enlaces y contenido danino.
- Monitorizacion de contenido: util para entrenar clasificadores que detecten paginas promocionales de servicios de desnudo sintetico en repositorios publicos.
- Analisis de politicas de moderacion: permite evaluar la eficacia de los filtros de HuggingFace frente a contenido que infringe sus terminos de uso.
- Documentacion de riesgos legales: sirve como referencia para ilustrar los riesgos asociados a la generacion de imagenes intimes no consentidas bajo el Reglamento de IA de la UE y la normativa espanola.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay pesos publicados.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoria tecnica comparable, ya que el repositorio no contiene un modelo. A modo de referencia de repositorios espurios en HuggingFace, cualquier modelo real de la misma organizacion o de terceros no guarda relacion con este contenido.

| Criterio | Este repositorio | Modelo real tipico en HF |
|---|---|---|
| Pesos publicados | No | Si |
| Configuracion | No | Si |
| Tokenizador | No | Si |
| Model card tecnica | No | Si |
| Benchmarks | No | Habitualmente |
| Uso legitimo | No | Si |

## Limitaciones y advertencias

- El repositorio no contiene un modelo; no es posible ejecutar inferencia ni integrarlo en ningun pipeline.
- La tematica declarada (aplicaciones que "desnudan" con IA) esta vinculada a la generacion de imagenes intimes no consentidas, practica prohibida por la Ley Organica 10/2022 en Espana y por el Reglamento de IA de la UE en varias de sus disposiciones.
- Los metadatos de fechas (creacion en 2026) son inconsistentes y sugieren manipulacion o error.
- La licencia `apache-2.0` en metadatos no otorga derechos sobre un modelo inexistente y no exime de responsabilidad legal por el contenido promocionado.
- Riesgo de phishing y redireccionamiento: los botones y enlaces de la model card apuntan a servicios de terceros no verificados.
- No debe utilizarse como fuente de informacion tecnica ni citarse como modelo en comparativas.
- Se recomienda reportar el repositorio a HuggingFace por incumplimiento de sus terminos de uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vision-lab-fr/appli-qui-deshabille-ia
- Perfil del autor: https://huggingface.co/vision-lab-fr
- Terminos de uso de HuggingFace: https://huggingface.co/terms-of-service
- Reglamento de IA de la UE: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- Ley Organica 10/2022 (Espana): https://www.boe.es/buscar/act.php?id=BOE-A-2022-14607
