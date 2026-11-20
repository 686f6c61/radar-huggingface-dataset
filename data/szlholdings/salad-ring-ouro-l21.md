# SZLHOLDINGS/salad-ring-ouro-l21

## Resumen

`salad-ring-ouro-l21` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face. La model card lo presenta como parte de un "estate" de IA gobernada, con modelos, datasets y Spaces que el autor describe como "source-linked" y con resultados "receipted" y verificables. No obstante, la card no aporta ninguna especificación técnica del modelo: no indica arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni idiomas soportados.

La información disponible se limita a metadatos del repositorio (ID, autor, fechas de creación y actualización, cero descargas y cero likes en el momento de la consulta) y a una model card generada automáticamente por una herramienta interna ("estate-cards weaver v0.1.0") que produce SVG deterministas a partir de una instantánea de auditoría. La propia card declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación no incluida en sus ficheros de "receipt" debe considerarse UNKNOWN.

Por tanto, esta ficha no puede evaluar el modelo en términos de capacidades, rendimiento o idoneidad para producción. Se documenta lo que el autor declara y se marcan como "no disponible" todos los campos que la información proporcionada no cubre. Cualquier uso en producción requeriría contactar con el autor o inspeccionar directamente los ficheros del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida con componentes de espacio de estados (SSM) o cualquier otra variante. Tampoco se detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

La única información de contexto es que el artefacto pertenece a una "governed factory" de SZLHOLDINGS y que las afirmaciones de entrenamiento y evaluación se almacenan en ficheros de "receipt" dentro de la malla del estate, no en la propia model card. La card indica que los gráficos incluidos son SVG generados de forma determinista a partir de una instantánea de auditoría fechada el 2026-11-20T03:48:04Z y etiquetada como MEASURED, pero no se transcribe ningún valor numérico de esos gráficos en el texto disponible.

## Capacidades

No se ha publicado información sobre las capacidades del modelo en la documentación disponible. En concreto, no se confirma ni se desmiente:

- Generación de texto, razonamiento, código o matemáticas.
- Soporte de tool calling o function calling.
- Soporte de agentes o razonamiento multi-paso.
- Capacidades multilingües.
- Modos especiales (thinking mode, visión, audio).

La model card no incluye ninguna sección de uso, ejemplos de prompts ni descripción funcional del artefacto.

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin información sobre las capacidades, el tamaño, el contexto y la licencia del modelo. La documentación disponible no permite determinar para qué tareas es adecuado el artefacto ni en qué condiciones puede desplegarse. Cualquier caso de uso que se propusiera sería especulativo y contravendría la regla de no inventar datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que "no benchmark number is asserted on this card beyond what a dated audit measured" y que los datos no incluidos en los ficheros de receipt deben considerarse UNKNOWN.

## Requisitos de hardware

No disponible. Sin conocer el número de parámetros, la arquitectura ni los formatos de pesos publicados, no es posible estimar VRAM, GPUs recomendadas, viabilidad en GPU de consumo, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni latencia o throughput.

## Comparativa con modelos similares

No disponible. No se dispone de parámetros, contexto, rendimiento ni licencia del modelo, por lo que no se puede establecer una comparación fundamentada con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas o de contexto.
- La licencia no está especificada, por lo que no puede confirmarse la viabilidad de uso comercial. Cualquier despliegue en producción requeriría aclarar este punto con el autor.
- El repositorio presenta cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- La card es generada automáticamente por una herramienta interna y remite a ficheros de "receipt" externos para cualquier dato de entrenamiento o evaluación; sin acceso a esos ficheros, el modelo debe tratarse como no verificado.
- No se indica pipeline, idiomas ni formato de pesos, lo que impide confirmar la compatibilidad con frameworks de inferencia estándar.
- El nombre del repositorio y los metadatos no aportan pistas sobre la tarea o el dominio del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l21
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generación de cards (referenciada en la card): https://github.com/szl-holdings/estate-cards
