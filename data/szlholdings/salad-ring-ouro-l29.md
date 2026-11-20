# SZLHOLDINGS/salad-ring-ouro-l29

## Resumen

`salad-ring-ouro-l29` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada y resultados verificables mediante ficheros de "recibos" (receipts). El repositorio se presenta como un modelo entrenado ("trained artifact in the governed factory"), pero la model card no aporta ninguna especificacion tecnica del mismo.

La informacion disponible es practicamente nula en lo que respecta a arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento o resultados. La propia model card declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion de este artefacto reside en sus ficheros de recibo, y que todo lo que no este ahi consignado se etiqueta como UNKNOWN. No se afirma ningun resultado de benchmark en la tarjeta.

Por tanto, esta ficha se limita a documentar lo que el autor publica y a marcar como "no disponible" todo aquello que no consta. Es relevante ahora unicamente como ejemplo de publicacion de artefactos con enfasis en trazabilidad y honestidad declarativa, no como modelo evaluable para produccion.

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

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un modelo hibrido. Tampoco se indica el numero de parametros ni la longitud de contexto soportada.

Respecto al entrenamiento, el autor remite a los "receipt files" del "estate mesh" para cualquier afirmacion sobre entrenamiento o evaluacion, sin incluir en la tarjeta el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica referencia tecnica concreta es que las graficas de la tarjeta son SVG deterministas generados con la libreria estandar de Python a partir de una instantanea de auditoria fechada el 2026-11-20T03:48:04Z, etiquetada como MEASURED.

## Capacidades

- No se documenta ninguna capacidad funcional concreta (generacion de texto, razonamiento, codigo, matematicas, vision, audio).
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta informacion sobre capacidades multilingues.
- No consta ningun modo especial (thinking mode, vision, audio).
- La unica capacidad declarada de forma explicita es la trazabilidad: el artefacto se enmarca en un sistema de recibos y auditoria con etiquetas MEASURED/REPORTED/UNKNOWN y marca temporal de captura.

## Casos de uso

- Auditoria de procedencia de artefactos: el repositorio puede emplearse como ejemplo de publicacion con recibos fechados y etiquetado de incertidumbre, util para equipos que disenen pipelines de governance de modelos.
- Verificacion de cadenas de custodia: la referencia a un snapshot de auditoria con marca temporal permite ilustrar como enlazar un artefacto concreto con una medicion fechada.
- Docencia sobre documentacion de modelos: la tarjeta sirve como caso practico de lo que una model card deberia declarar y de los riesgos de publicar sin especificaciones.
- Integracion en un registro interno de modelos: puede catalogarse como artefacto de tipo "model" dentro de un inventario corporativo, con estado "sin especificaciones verificadas".
- Pruebas de herramientas de generacion de tarjetas: el campo `szl:showcase-card v1` y el identificador de tarjeta (`6c460deb4aa28aeb`) permiten validar generadores deterministas de documentacion.
- No se recomienda su uso en ningun caso de aplicacion final (atencion al cliente, generacion de codigo, analisis de datos) por ausencia total de especificaciones y de resultados verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara de forma explicita que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y no incluye dicha medicion en la tarjeta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no consta el formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible establecer comparacion con alternativas al desconocerse parametros, contexto, licencia y rendimiento del modelo.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se puede evaluar idoneidad, coste de inferencia ni calidad.
- Sin resultados de benchmark ni evaluaciones publicadas en la tarjeta; el autor remite a recibos externos no enlazados en el contenido disponible.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido.
- Idiomas no declarados: riesgo de comportamiento impredecible en castellano u otros idiomas.
- Riesgo de alucinacion: desconocido, al no existir evaluaciones.
- Sesgos conocidos: no documentados.
- Cero descargas y cero likes en el momento de la consulta, sin senales de adopcion ni validacion por terceros.
- La tarjeta incluye referencias a rutas e identificadores internos del "estate" del autor; no se aportan enlaces directos a los ficheros de recibo.
- No debe desplegarse en produccion sin una evaluacion independiente previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l29
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la tarjeta): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas (referenciada): https://github.com/szl-holdings/estate-cards
