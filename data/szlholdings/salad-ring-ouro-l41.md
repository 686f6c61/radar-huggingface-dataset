# SZLHOLDINGS/salad-ring-ouro-l41

## Resumen

`salad-ring-ouro-l41` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina "estate de IA gobernada". La model card no describe la arquitectura, el tamano, el contexto ni los datos de entrenamiento del modelo; se limita a declarar la identidad del repositorio, enlazar a la organizacion en GitHub y afirmar que cualquier metrica de entrenamiento o evaluacion reside en ficheros de "recibo" (receipts) no incluidos en la propia tarjeta.

El repositorio no presenta descargas ni likes, no declara licencia, idiomas ni pipeline de inferencia, y no incluye pesos documentados en la informacion disponible. La model card explicita una politica de honestidad: cualquier cifra no medida y fechada se etiqueta como UNKNOWN en lugar de inventarse, lo que en la practica deja la ficha sin especificaciones verificables.

Por tanto, esta ficha documenta lo que el autor afirma y marca como no disponible todo aquello que la informacion proporcionada no cubre. No es posible evaluar el modelo para uso en produccion con los datos actuales.

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

No se ha publicado informacion sobre la arquitectura en la model card. El autor indica que las afirmaciones sobre entrenamiento y evaluacion "viven en sus ficheros de recibo" dentro del "estate mesh", y que cualquier dato no receiptado en la tarjeta se considera UNKNOWN. No se especifica si se trata de un transformer denso, un MoE, un modelo hibrido o cualquier otra familia, ni se detalla el numero de tokens de entrenamiento, la composicion del dataset o si hubo etapas de RLHF o DPO.

La unica innovacion declarada es de gobernanza y trazabilidad: la tarjeta se genera de forma determinista con una herramienta propia (`estate-cards weaver v0.1.0`, Python de biblioteca estandar, SVG determinista, paleta KANCHAY) a partir de una instantanea de auditoria fechada (2026-11-20T03:48:04Z, etiquetada MEASURED). Esto afecta a la documentacion, no al modelo en si.

## Capacidades

- No se documenta ninguna capacidad funcional del modelo (generacion de texto, razonamiento, codigo, matematicas, vision, audio) en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking mode, vision, audio): no disponible.
- La unica capacidad verificable es la trazabilidad documental del propio repositorio mediante recibos y tarjetas generadas de forma determinista.

## Casos de uso

- Auditoria de gobernanza de artefactos: el repositorio puede emplearse como ejemplo de publicacion de modelos con tarjetas generadas de forma determinista y con etiquetado explicito de datos MEASURED, REPORTED y UNKNOWN, util para equipos que disenan pipelines de documentacion reproducible.
- Verificacion de procedencia: dado que la tarjeta enlaza a la organizacion canonica en GitHub y declara un identificador de tarjeta (`e0d4532b6be3b966`), sirve para probar mecanismos de verificacion de origen de artefactos en un registro interno.
- Integracion en un catalogo de modelos: puede indexarse en un inventario corporativo como entrada con metadatos incompletos, forzando que el sistema de catalogo trate explicitamente los campos UNKNOWN en lugar de asumir valores por defecto.
- Pruebas de validacion de esquemas: util como caso de prueba negativo para validadores que exigen licencia, idioma y arquitectura antes de permitir el despliegue de un modelo.
- Formacion interna sobre documentacion de modelos: sirve como ejemplo de tarjeta que prioriza la honestidad epistemica frente a la completitud, para discutir con equipos de ML que datos deben declararse obligatoriamente.
- No se recomienda su uso para inferencia en produccion: no hay pesos documentados, ni licencia, ni especificaciones tecnicas que permitan planificar recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que "no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido" y que los datos no receiptados se marcan como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar la categoria, el tamano ni la tarea del modelo, por lo que no es posible establecer una comparacion fundamentada con alternativas.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni formato de pesos, no es posible evaluar su idoneidad para ninguna tarea.
- Licencia no declarada: no puede asumirse permiso de uso comercial, modificacion o redistribucion. Cualquier uso en produccion requiere contacto previo con el autor.
- Idiomas no declarados: se desconoce si soporta castellano u otras lenguas.
- Riesgo de alucinacion: no evaluable sin acceso al modelo y sin benchmarks publicados.
- Sesgos conocidos: no documentados.
- Trazabilidad incompleta: la tarjeta remite a "ficheros de recibo" y a un "estate mesh" que no se enlazan de forma directa en el contenido proporcionado, lo que dificulta la verificacion independiente.
- Fecha de creacion futura (2026-11-18) y actualizacion (2026-11-20): conviene verificar la coherencia temporal de los metadatos antes de citar el artefacto.
- Cero descargas y cero likes: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l41
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion canonica en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
