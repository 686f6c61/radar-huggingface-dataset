# SZLHOLDINGS/salad-ring-ouro-l53

## Resumen

`salad-ring-ouro-l53` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS dentro de lo que su autor denomina "governed-AI estate": un catalogo de modelos, datasets y Spaces con trazabilidad a la fuente y resultados auditables. El repositorio de Hugging Face no incluye model card tecnica en sentido convencional, sino una tarjeta generada de forma automatica por su herramienta interna `estate-cards weaver` (v0.1.0), que se limita a declarar la identidad del artefacto y a remitir a ficheros de "receipts" externos para cualquier afirmacion sobre entrenamiento o evaluacion.

No se dispone de informacion publica sobre arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados. La propia tarjeta declara explicitamente que cualquier dato no incluido en sus receipts se etiqueta como UNKNOWN, y no se afirma ningun resultado de benchmark mas alla de lo medido en una auditoria fechada (2026-11-20T03:48:04Z). El repositorio no registra descargas ni "likes" en el momento de la consulta.

Por tanto, esta ficha documenta lo que el autor declara y marca como no disponible todo lo que no consta. El modelo no es evaluable tecnicamente con la informacion accesible y no deberia considerarse para uso en produccion sin verificar previamente los receipts citados en la organizacion de GitHub del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no declara safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura (transformer, MoE, SSM, hibrida u otra), ni el volumen o composicion de los datos de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. El autor remite cualquier afirmacion de entrenamiento o evaluacion a los "receipt files" del estate, que no se incluyen en el repositorio de Hugging Face ni se enlazan de forma directa en la tarjeta.

La unica innovacion declarada es de proceso, no de modelado: la generacion determinista de tarjetas mediante `estate-cards weaver` (Python de biblioteca estandar, SVG deterministico, paleta KANCHAY) y el etiquetado explicito de cada cifra como MEASURED, REPORTED o UNKNOWN con marca temporal de captura. Es un mecanismo de auditoria documental, no una contribucion arquitectonica.

## Capacidades

- No se declara ninguna capacidad concreta (generacion de texto, razonamiento, codigo, matematicas, vision, audio) en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no consta.
- Modos especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

No es posible recomendar casos de uso concretos sin conocer arquitectura, tamano, contexto ni licencia. A modo de orientacion sobre que habria que verificar antes de plantear cualquier escenario:

- Evaluacion interna de artefactos de un estate gobernado: el modelo podria servir como ejemplo de trazabilidad documental si se confirman los receipts, pero no como componente funcional hasta conocer sus pesos y formato.
- Integracion en pipelines de CI/CD: inviable de planificar sin saber el formato de pesos ni el runtime soportado.
- Atencion al cliente multi-turno: requiere conocer la ventana de contexto, que no consta.
- Generacion de codigo en produccion: requiere datos de rendimiento en HumanEval o similares, no publicados.
- Despliegue en GPU de consumo: requiere conocer el numero de parametros y las cuantizaciones disponibles, no declaradas.
- Uso comercial: requiere una licencia explicita, que no consta en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada y que, donde falta una curva medida, se indica UNKNOWN en lugar de inventarla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (falta el numero de parametros y las cuantizaciones).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no declara formato de pesos compatible con ninguno de estos runtimes.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una categoria de comparacion (tamano, tarea, modalidad) sin datos de arquitectura ni parametros, y no se conocen modelos directamente comparables dentro del mismo estate con informacion publica suficiente.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l53 | no disponible | no disponible | no disponible | repositorio HF sin descargas registradas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas publicas: no se puede verificar arquitectura, tamano, contexto, tokenizador ni formato de pesos.
- La model card es generada automaticamente y remite a receipts externos no enlazados directamente; sin acceso a esos ficheros, todas las afirmaciones del autor son no verificables.
- Licencia no declarada: no hay base legal explicita para uso comercial ni para redistribucion.
- Idiomas no declarados: riesgo de comportamiento impredecible fuera del idioma o idiomas de entrenamiento, que se desconocen.
- Riesgo de alucinacion y sesgos: no evaluable sin benchmarks ni documentacion de datos de entrenamiento.
- Cero descargas y cero "likes" en el momento de la consulta: sin evidencia de uso comunitario ni de validacion externa.
- Fechas de creacion y actualizacion (2026-11-18 y 2026-11-20) posteriores a la fecha habitual de consulta: conviene confirmar la vigencia del repositorio antes de cualquier integracion.
- Recomendacion: no desplegar en produccion hasta obtener del autor los receipts de entrenamiento y evaluacion, la licencia y el formato de pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l53
- Organizacion del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion del autor en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas `estate-cards`: https://github.com/szl-holdings/estate-cards
- Paper, blog, demo o repositorio adicional del modelo: no disponible
