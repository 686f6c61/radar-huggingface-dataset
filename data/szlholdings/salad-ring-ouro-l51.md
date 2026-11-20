# SZLHOLDINGS/salad-ring-ouro-l51

## Resumen

`salad-ring-ouro-l51` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face, dentro de lo que el propio autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada y resultados verificables mediante ficheros de recibo (*receipts*). El repositorio se presenta como un modelo entrenado dentro de una "governed factory", pero la model card no aporta información sustantiva sobre arquitectura, datos de entrenamiento ni rendimiento.

La información pública disponible es mínima. No se declara licencia, idiomas soportados, pipeline de inferencia, número de parámetros, longitud de contexto ni formato de pesos. La model card se limita a describir la identidad del repositorio, enlazar a la organización en GitHub y mostrar gráficos SVG generados de forma determinista a partir de una instantánea de auditoría fechada el 20 de noviembre de 2026. El autor indica explícitamente que cualquier afirmación de entrenamiento o evaluación no incluida en sus ficheros de recibo debe considerarse desconocida (UNKNOWN).

Por tanto, esta ficha describe un artefacto con documentación insuficiente para evaluar su idoneidad técnica. Cualquier uso en producción requeriría inspeccionar directamente los pesos, los ficheros de recibo referenciados y el repositorio de GitHub del autor, que no se han podido verificar a partir de la información proporcionada.

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

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card no especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o cualquier otra variante. Tampoco se indica el número de parámetros, la composición del dataset de entrenamiento, el volumen de tokens procesados ni si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado.

El autor menciona que las afirmaciones sobre entrenamiento y evaluación residen en ficheros de recibo (*receipt files*) dentro del "estate mesh", y que cualquier dato no incluido en esos recibos debe considerarse desconocido. No se proporcionan enlaces directos a dichos ficheros ni se detalla su contenido en la model card. Los gráficos SVG incluidos (`org-context.svg`, `mesh-receipts.svg`) se describen como generados de forma determinista a partir de una instantánea de auditoría, pero su contenido no se traduce en especificaciones técnicas legibles en el texto de la ficha.

## Capacidades

- No se documenta ninguna capacidad específica del modelo (generación de texto, razonamiento, código, matemáticas, visión o audio).
- No se indica soporte de tool calling ni function calling.
- No se indica soporte para agentes o razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se declara ningún modo especial (thinking mode, visión, audio u otros).

La única capacidad implícita es la de ser un artefacto entrenado dentro de la factoría del autor, sin que se detalle qué tarea resuelve ni cómo debe invocarse.

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin conocer la arquitectura, el tamaño, el contexto, los idiomas y la licencia del modelo. A continuación se indican únicamente escenarios de evaluación que un desarrollador podría plantear, siempre condicionados a la inspección previa del repositorio y de los ficheros de recibo:

- Auditoría de artefactos gobernados: verificar la cadena de trazabilidad entre el repositorio de Hugging Face, el repositorio de GitHub del autor y los ficheros de recibo citados en la model card.
- Evaluación de reproducibilidad: comprobar si los gráficos SVG generados de forma determinista permiten reconstruir el estado del artefacto en la fecha de auditoría indicada.
- Pruebas de carga controladas: descargar los pesos (si están disponibles en el repositorio) y ejecutar una inferencia mínima para determinar el formato real y el tamaño del modelo.
- Integración en pipelines de verificación: usar el modelo como caso de prueba para herramientas de escaneo de artefactos de Hugging Face que detecten fichas incompletas o licencias ausentes.
- Investigación sobre gobernanza de IA: analizar el patrón de documentación basado en recibos como alternativa a las model cards convencionales.
- Formación interna: utilizar el repositorio como ejemplo de ficha con información insuficiente para ilustrar criterios de selección de modelos en equipos de ingeniería.

Ninguno de estos escenarios implica que el modelo sea adecuado para tareas de producción; son actividades de inspección y evaluación previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y que los datos no incluidos en los recibos deben tratarse como desconocidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros y el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

Sin conocer el tamaño del modelo ni el formato de los pesos, no es posible estimar requisitos de memoria ni rendimiento.

## Comparativa con modelos similares

No disponible. La ausencia de datos sobre parámetros, contexto, licencia y rendimiento impide establecer una comparación fundamentada con alternativas de la misma categoría. Cualquier comparación sería especulativa y contraria al principio de no inventar datos.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no especifica arquitectura, tamaño, contexto, idiomas ni licencia, lo que impide evaluar su idoneidad para cualquier tarea.
- Licencia no declarada: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal; debe contactarse con el autor antes de cualquier uso.
- Riesgo de sesgo y alucinación: no evaluable, al no conocerse los datos de entrenamiento ni los procesos de alineación.
- Idiomas no declarados: no puede garantizarse un comportamiento correcto en castellano ni en ningún otro idioma.
- Trazabilidad incompleta: los ficheros de recibo citados no se enlazan directamente en la ficha, y los gráficos SVG no aportan especificaciones legibles.
- Fecha de creación futura: el repositorio figura creado el 18 de noviembre de 2026, lo que puede indicar un error de metadatos o un artefacto de prueba; conviene verificarlo antes de confiar en cualquier dato.
- Ausencia de pipeline declarado: no se indica la tarea (`text-generation`, `feature-extraction`, etc.), lo que dificulta la integración con bibliotecas estándar.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l51
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de fichas (referenciado en la model card): https://github.com/szl-holdings/estate-cards
