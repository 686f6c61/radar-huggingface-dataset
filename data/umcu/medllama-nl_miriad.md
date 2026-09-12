# UMCU/medllama.nl_miriad

## Resumen

UMCU/medllama.nl_miriad es un repositorio de modelo publicado en HuggingFace por la organizacion UMCU. En el momento de redactar esta ficha el repositorio no contiene documentacion tecnica: el unico contenido del README es la declaracion de licencia GPL-3.0. No se especifican arquitectura, numero de parametros, longitud de contexto, idiomas soportados, composicion del dataset de entrenamiento ni resultados de evaluacion.

A partir del identificador cabria hipotetizar que se trata de un ajuste de la familia Llama orientado a dominio medico (prefijo "medllama") y a neerlandes (sufijo "nl"), y "miriad" podria corresponder a un conjunto de datos de imagen por resonancia magnetica. Esta lectura es una inferencia basada en la nomenclatura, no un dato confirmado por el autor, y no debe utilizarse como especificacion.

La relevancia practica del repositorio es hoy muy limitada: cero descargas, cero valoraciones, sin pipeline declarado, sin idiomas declarados y con fecha de creacion y ultima actualizacion identicas (12 de septiembre de 2026), lo que sugiere que no ha habido ninguna revision posterior a la publicacion. Sin model card ampliada ni artefactos documentados, el modelo no es evaluable para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No disponible. La model card publicada no describe la arquitectura, el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO) o instrucciones supervisadas. Tampoco se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, mezcla de expertos, arquitecturas hibridas, etc.).

El unico indicio disponible es el propio identificador del repositorio. Si se confirmase que deriva de la familia Llama, heredaria su arquitectura transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y atencion por grupos (GQA) en las variantes mas recientes; si el sufijo "nl" indica el idioma, el ajuste estaria orientado a neerlandes. Ninguno de estos extremos esta verificado en la informacion disponible.

## Capacidades

No hay informacion publicada sobre las capacidades del modelo. Los unicos hechos verificables son los siguientes:

- El repositorio existe en HuggingFace bajo la organizacion UMCU y esta etiquetado con la region "us".
- La licencia declarada es GPL-3.0, una licencia copyleft fuerte.
- No hay declarados idiomas, tareas ni pipeline de inferencia.
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, uso como agente, capacidades multilingues o modos de razonamiento explicito: no disponible en ningun caso.

## Casos de uso

No es posible proponer casos de uso validados sin especificaciones tecnicas. Los escenarios siguientes son hipoteticos y quedan condicionados a que se confirme la premisa de un modelo Llama ajustado a dominio medico en neerlandes; se listan unicamente como marco de evaluacion para cuando el autor publique documentacion.

- Extraccion de informacion clinica estructurada: si el modelo estuviese ajustado sobre textos clinicos neerlandeses, podria emplearse para convertir notas de historia clinica en campos estructurados (diagnostico, tratamiento, dosis), siempre con revision humana y cumplimiento de normativa de datos de salud.
- Resumen de informes radiologicos: un ajuste sobre un corpus tipo MIRIAD sugeriria utilidad para resumir informes de resonancia magnetica, pero se desconoce si el modelo procesa imagen o solo texto asociado.
- Apoyo a la codificacion clinica: mapeo de descripciones en lenguaje natural a codigos de clasificacion (ICD-10, SNOMED) en neerlandes, tarea tipica de los ajustes medicos especializados.
- Traduccion medico-tecnica neerlandes-ingles: si el modelo conservase capacidades multilingues del modelo base, podria apoyar la traduccion de documentacion clinica; sin idiomas declarados, esta capacidad no puede asumirse.
- Preguntas y respuestas sobre literatura biomedica: recuperacion aumentada (RAG) sobre guias clinicas en neerlandes, con citas verificables y validacion por personal sanitario.
- Preprocesado para pipelines de investigacion: normalizacion y anonimizacion asistida de textos clinicos antes de su uso en estudios, sujeto a las restricciones de la GPL-3.0 y a la normativa de proteccion de datos.
- Filtrado y clasificacion de cohortes: etiquetado automatico de informes para seleccionar pacientes candidatos en estudios observacionales, con auditoria posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No disponible. No es posible calcular VRAM, latencia ni throughput sin conocer el numero de parametros, la longitud de contexto y el formato de pesos.

Como referencia generica de la familia Llama, aplicable unicamente si se confirma el tamano del modelo (no son mediciones de este repositorio):

| Tamano hipotetico | FP16 | 8 bits | 4 bits | GPU de referencia |
|---|---|---|---|---|
| 7-8B | 14-16 GB | 8-9 GB | 5-6 GB | RTX 4090, L4, A10G |
| 13B | 26-28 GB | 14-15 GB | 8-9 GB | A100 40 GB, L40S |
| 70B | 140 GB | 70-75 GB | 38-42 GB | 2x A100 80 GB, H100 |

Opciones de despliegue habituales para modelos de esta familia, sujetas a que el formato de pesos sea compatible: vLLM y TGI para servicio en GPU con alto throughput; llama.cpp y Ollama para inferencia en CPU o GPU de consumo con pesos GGUF; transformers con bitsandbytes para prototipado. El repositorio no publica pesos en ningun formato confirmado, por lo que ninguna de estas rutas esta verificada.

## Comparativa con modelos similares

No disponible. La ausencia de parametros, contexto, idiomas y licencia comparable impide establecer una comparacion con alternativas de la misma categoria (por ejemplo, otros ajustes medicos sobre Llama como Meditron, BioMistral o MedLlama2 de otras organizaciones). Cualquier tabla comparativa requeriria primero que el autor publicase la ficha tecnica del modelo.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, ni ficha de datos, ni evaluacion, lo que impide auditar sesgos, alucinacion o cobertura idiomatica.
- Riesgo de alucinacion: no evaluado y, en dominio medico, potencialmente critico si el modelo se usase para decisiones clinicas.
- Ambito sanitario: un modelo medico usado en diagnostico o tratamiento puede constituir producto sanitario y quedar sujeto al Reglamento (UE) 2017/745 y al Reglamento (UE) 2024/1689 de inteligencia artificial, con obligaciones de evaluacion de conformidad y supervision humana.
- Proteccion de datos: el ajuste sobre datos de pacientes exigiria base juridica, minimizacion y anonimizacion conforme al RGPD; no se documenta el origen de los datos de entrenamiento.
- Licencia GPL-3.0: es copyleft fuerte; la distribucion de versiones modificadas o de software que integre el modelo obliga a liberar el codigo derivado bajo la misma licencia, lo que puede ser incompatible con productos propietarios o con modelos de negocio cerrados. Conviene revision juridica antes de cualquier uso comercial.
- Idiomas: no declarados. No puede asumirse competencia en castellano ni siquiera en neerlandes.
- Contexto y cuantizacion: no disponibles, por lo que no se pueden planificar presupuestos de memoria ni estrategias de troceado de documentos largos.
- Metadatos: cero descargas y cero valoraciones, y fechas de creacion y actualizacion identicas, lo que indica ausencia de mantenimiento y de validacion por la comunidad.
- Reproducibilidad: sin pesos en formato declarado ni version del modelo base, los resultados no son reproducibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/UMCU/medllama.nl_miriad
- Model card: sin contenido tecnico, unicamente la declaracion de licencia GPL-3.0.
- Paper, blog, repositorio de codigo, demo o dataset asociado: no disponible.
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con el modelo; los unicos enlaces recuperados correspondian a paginas de streaming de television en frances y no guardan relacion con este repositorio, por lo que se omiten.
