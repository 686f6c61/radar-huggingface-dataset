# SZLHOLDINGS/salad-ring-ouro-l129

## Resumen

`salad-ring-ouro-l129` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts) y resultados verificables. El repositorio de Hugging Face no incluye model card tecnica convencional: la informacion disponible se limita a metadatos de identidad, referencias a la organizacion en GitHub y graficos SVG generados de forma determinista a partir de una instantanea de auditoria fechada el 2026-11-20.

La model card declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion de este artefacto reside en sus ficheros de recibos dentro de la malla del estate, y que todo lo que no este respaldado por un recibo se etiqueta como UNKNOWN. No se especifican arquitectura, numero de parametros, longitud de contexto, idiomas ni licencia. El nombre del repositorio sugiere una numeracion interna de version o checkpoint (l129), pero no se confirma en la documentacion.

Por tanto, esta ficha no puede caracterizar tecnicamente el modelo mas alla de su procedencia y de su filosofia de publicacion. Es relevante unicamente como ejemplo de practica de publicacion orientada a la auditabilidad (etiquetado MEASURED/REPORTED/UNKNOWN con marca temporal), no como modelo evaluable para desarrollo o investigacion en su estado actual.

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

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un modelo hibrido, ni especifica dimensiones de capas, atencion o tokenizador.

Respecto al entrenamiento, la card indica que las afirmaciones sobre entrenamiento y evaluacion "viven en sus ficheros de recibos" dentro de la malla del estate, y que cualquier dato no respaldado por un recibo se considera UNKNOWN. No se proporciona numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica afirmacion metodologica es que los graficos de la card son SVG deterministas generados con la libreria estandar de Python a partir de una instantanea de auditoria con marca temporal (2026-11-20T03:48:04Z, etiquetada MEASURED).

## Capacidades

- No se documenta ninguna capacidad funcional del modelo (generacion de texto, razonamiento, codigo, matematicas, vision) en la informacion disponible.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se mencionan modos especiales (thinking mode, vision, audio) ni pipeline de inferencia asociado en Hugging Face.

## Casos de uso

- Auditoria de procedencia de artefactos: el repositorio puede consultarse como ejemplo de publicacion con trazabilidad declarada, revisando los ficheros de recibos y la instantanea de auditoria citada en la card para entender el esquema MEASURED/REPORTED/UNKNOWN.
- Verificacion de integridad documental: el identificador de card (`d220c0b3c54e559c`) y la marca temporal de generacion permiten comprobar la reproducibilidad del proceso de generacion de la card mediante la herramienta `estate-cards weaver`.
- Estudio de practicas de gobernanza de IA: util para equipos que disenan esquemas de documentacion de modelos con etiquetado explicito de incertidumbre.
- Integracion en pipelines internos de SZLHOLDINGS: solo si se dispone de acceso a la malla de recibos y a la documentacion interna de la organizacion, no disponible publicamente.
- Evaluacion comparativa de esquemas de model cards: sirve como caso limite de card minima sin especificaciones tecnicas.
- No es adecuado para ningun caso de uso de inferencia en produccion en su estado actual, al no existir especificaciones, pesos documentados ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y no se incluye ninguna tabla de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos ni pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables al no conocerse la arquitectura, el tamano, la tarea ni la licencia de `salad-ring-ouro-l129`.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se puede evaluar idoneidad, coste de inferencia ni calidad sin acceso a los recibos internos.
- Licencia no declarada: no hay autorizacion explicita para uso comercial, redistribucion ni modificacion; debe asumirse restriccion hasta confirmacion del autor.
- Idiomas no declarados: no se puede garantizar cobertura linguistica alguna.
- Riesgo de alucinacion: no evaluable sin benchmarks ni documentacion de entrenamiento.
- Sesgos conocidos: no documentados.
- La model card delega todas las afirmaciones a ficheros de recibos no incluidos en el repositorio publico, lo que impide verificar el contenido citado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- La fecha de creacion (2026-11-19) y la numeracion `l129` sugieren un artefacto interno de una factoria de modelos; no debe tratarse como un modelo listo para produccion sin documentacion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l129
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referencia de la card): https://github.com/szl-holdings
- Herramienta de generacion de cards citada: https://github.com/szl-holdings/estate-cards
