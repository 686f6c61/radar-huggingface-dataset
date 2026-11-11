# TUaxhuiax/toolweave-quorum-bac6b5e1

## Resumen

Quorum Dialogue Suite es un conjunto de configuraciones publicado por el usuario TUaxhuiax en Hugging Face bajo el identificador `toolweave-quorum-bac6b5e1`. No se trata de un modelo de lenguaje con pesos entrenados, sino de un artefacto de evaluación asociado a QuorumBench, un benchmark que mide la capacidad de un planificador (planner) para conducir una negociación multipartita hacia el consenso en un problema de asignación de recursos. El repositorio define un protocolo de negociación único y una rúbrica de puntuación, instanciados a distintos tamaños de grupo.

La propuesta es relevante para quien trabaje en agentes conversacionales y evaluación de razonamiento multiagente: permite medir de forma aislada cómo escala el comportamiento de un planificador cuando aumenta el número de participantes, manteniendo fijo el protocolo y la rúbrica. El repositorio ofrece siete configuraciones (de 2 a 8 participantes), cada una con 60 escenarios sintéticos construidos sobre el mismo esquema, lo que suma 420 escenarios en total.

No se dispone de información sobre arquitectura, parámetros, contexto ni pesos del modelo subyacente, ya que la model card describe exclusivamente el benchmark y sus ficheros de configuración (`tools.jsonl` con las herramientas del agente en JSON-Schema anidado). Cualquier dato relativo al modelo evaluado debe considerarse no disponible a partir de la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene configuración de benchmark y `tools.jsonl`, no pesos) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo subyacente ni sobre su proceso de entrenamiento. La model card no describe capas, atención, mezcla de expertos ni datos de preentrenamiento, ajuste supervisado o RLHF/DPO.

Lo que sí documenta el repositorio es la estructura del benchmark: un protocolo de negociación único con una rúbrica de puntuación, instanciado a siete escalas de participantes (2 a 8). Cada configuración contiene 60 escenarios sintéticos generados a partir del mismo esquema, y las herramientas que el agente puede invocar durante el diálogo se declaran en `tools.jsonl` con JSON-Schema anidado (`schema_style: nested`, `catalog_slug: quorum`, `task_file: tools.jsonl`). El planificador se ajusta y evalúa de forma separada para cada escala, lo que sugiere una evaluación por configuración y no un único conjunto agregado.

## Capacidades

- Evaluación de planificación multiagente: mide si un planner dirige una negociación hacia el consenso en asignación de recursos.
- Escalado controlado por número de participantes: configuraciones de 2, 3, 4, 5, 6, 7 y 8 participantes.
- Uso de herramientas declaradas en JSON-Schema anidado (`tools.jsonl`), lo que permite evaluar tool calling dentro del diálogo.
- Puntuación mediante rúbrica fija y protocolo de negociación único, lo que facilita comparaciones entre ejecuciones.
- Generación de escenarios sintéticos homogéneos: 60 por configuración, 420 en total.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio ni multilingüismo del modelo subyacente.

## Casos de uso

- Evaluación de agentes negociadores: usar las siete configuraciones para medir cómo degrada o mejora el consenso al pasar de 2 a 8 participantes, manteniendo constante el protocolo.
- Selección de planners para sistemas multiagente: comparar distintos modelos o prompts sobre el mismo conjunto de 60 escenarios por escala y la misma rúbrica.
- Pruebas de tool calling en diálogo: validar que el agente invoca correctamente las herramientas declaradas en `tools.jsonl` durante la negociación.
- Investigación en asignación de recursos: emplear los escenarios sintéticos como banco reproducible para estudiar estrategias de reparto y formación de consenso.
- Regresión de pipelines de agentes: integrar QuorumBench como suite de evaluación antes de desplegar cambios en el planner de un sistema de negociación.
- Análisis de escalado de coste y latencia: al fijar el protocolo y variar solo el número de participantes, permite aislar el coste computacional atribuible al tamaño del grupo.
- Docencia y experimentación: servir de base para prácticas sobre protocolos de negociación y evaluación con rúbrica en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

El repositorio no incluye pesos ni indicaciones de despliegue; solo configuración de benchmark y definiciones de herramientas.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables ni permite establecer una comparación por parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No se dispone de licencia declarada, lo que impide determinar si el uso comercial está permitido.
- No se especifican idiomas soportados; no puede asumirse cobertura multilingüe.
- El repositorio no contiene pesos de modelo, por lo que no es desplegable como modelo de inferencia por sí mismo.
- Los escenarios son sintéticos (60 por configuración); el rendimiento en negociaciones reales puede diferir.
- El ajuste y la evaluación se realizan por separado para cada escala de participantes, de modo que los resultados de una configuración no son extrapolables directamente a otra.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- No hay información sobre sesgos, tasa de alucinación ni robustez del modelo subyacente.
- La fecha de creación indicada (2026-11-10) es posterior a la fecha habitual de consulta; conviene verificar la vigencia y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TUaxhuiax/toolweave-quorum-bac6b5e1
- No se han encontrado otros enlaces (papers, blogs, repositorios de código o demos) en la información disponible.
