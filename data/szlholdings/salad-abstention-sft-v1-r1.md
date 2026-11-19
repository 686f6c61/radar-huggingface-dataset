# SZLHOLDINGS/salad-abstention-sft-v1-r1

## Resumen

`salad-abstention-sft-v1-r1` es un artefacto de entrenamiento candidato publicado por la organizacion SZLHOLDINGS en Hugging Face. Segun la model card, se trata de un resultado intermedio del programa de entrenamiento de IA gobernada de la organizacion, producido bajo una doctrina interna denominada "fail-closed measured-receipts" (recibos medidos, sin recuentos ni marcas temporales fabricadas). El autor lo etiqueta explicitamente como "candidate training artifact - not a published production model", es decir, no es un modelo de produccion.

La informacion disponible es muy limitada: la model card no documenta arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni resultados de evaluacion. El repositorio contiene unicamente dos ficheros de artefactos de modelo y remite a un corpus de recibos de procedencia ("frontier-54-runs") alojado en la misma organizacion, ademas de un registro de tesis en Zenodo (DOI 10.5281/zenodo.19944926). El nombre del modelo sugiere una especializacion en "abstencion" (abstention), es decir, la capacidad de un modelo de declinar responder cuando no dispone de informacion fiable, entrenado mediante SFT (supervised fine-tuning).

Por su estado de publicacion (0 descargas, 0 likes, creado y actualizado en noviembre de 2026), su relevancia practica actual es escasa para evaluacion comparativa. Resulta de interes unicamente como referencia documental de un pipeline de entrenamiento gobernado con trazabilidad declarada, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio declara 2 ficheros de artefactos de modelo, sin detallar formato) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM u otra), el numero de parametros ni la longitud de contexto. La unica informacion de entrenamiento disponible es que se trata de un artefacto de SFT (supervised fine-tuning, segun el sufijo `-sft-` del identificador) orientado a comportamiento de abstencion, producido bajo la doctrina interna "fail-closed measured-receipts" de SZLHOLDINGS.

La model card indica que los recibos de procedencia se encuentran en el corpus "frontier-54-runs" de la organizacion SZLHOLDINGS y que la cadena de custodia completa reside en el "estate ledger" de la organizacion. No se especifican volumen de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`.
- Abstencion: el identificador del modelo sugiere entrenamiento especifico para declinar responder ante incertidumbre, aunque la model card no documenta el comportamiento resultante ni su evaluacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles (`en`).
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Evaluacion de tecnicas de abstencion: el artefacto puede servir como referencia para investigadores que estudien como el SFT modifica la tendencia de un modelo a abstenerse; requiere validacion propia, ya que no hay evaluacion publicada.
- Auditoria de pipelines de entrenamiento gobernados: util para estudiar el esquema de recibos de procedencia ("measured-receipts") y trazabilidad declarado por la organizacion, consultando el corpus "frontier-54-runs".
- Reproduccion de experimentos internos: como artefacto candidato, encaja en flujos de comparacion entre checkpoints de un mismo programa de entrenamiento, no en despliegues de usuario final.
- Analisis de licenciamiento: al estar bajo Apache 2.0, puede inspeccionarse y modificarse libremente en entornos de investigacion, sujeto a las limitaciones tecnicas no documentadas.
- Docencia sobre ciclo de vida de modelos: ejemplo de publicacion de artefacto intermedio con etiquetado explicito de estado ("candidate training artifact"), util para discutir buenas practicas de documentacion.
- No se recomienda su uso en produccion (atencion al cliente, generacion de codigo, RAG u otros) por ausencia de especificaciones, evaluacion y soporte documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: la libreria declarada es `transformers`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La etiqueta `endpoints_compatible` aparece en los metadatos de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria (abstencion mediante SFT) ni permite establecer comparaciones con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Estado del artefacto: el propio autor lo declara "candidate training artifact - not a published production model"; no debe tratarse como modelo listo para produccion.
- Ausencia de especificaciones: sin datos de arquitectura, parametros ni contexto, no es posible dimensionar su despliegue ni estimar costes.
- Ausencia de evaluacion: no hay benchmarks ni metricas de abstencion publicadas que respalden su comportamiento.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas es desconocido.
- Sesgos y alucinacion: no documentados; al ser un artefacto de entrenamiento sin evaluacion, el riesgo de comportamiento impredecible es alto.
- Licencia: Apache 2.0 permite uso comercial, pero la falta de documentacion tecnica traslada al usuario toda la responsabilidad de validacion.
- Procedencia: la cadena de custodia se remite a recursos externos (corpus "frontier-54-runs" y "estate ledger") no verificables desde la informacion disponible; conviene contrastarlos antes de citar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-abstention-sft-v1-r1
- Registro de tesis en Zenodo (DOI): https://doi.org/10.5281/zenodo.19944926
- Organizacion SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
