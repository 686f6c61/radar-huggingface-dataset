# xinyuzhou/ClinicalJev-0.8B-v0.1-preview

## Resumen

ClinicalJev-0.8B-v0.1-preview es un modelo compacto de 752.393.024 parametros (0,75 B) orientado a inferencia local en el ambito clinico, publicado por el usuario xinyuzhou en HuggingFace y desarrollado en el ecosistema del proyecto ClinicalJev (repositorio xzhou-code/ClinicalJev). No es un modelo generativo convencional: dado un texto de estado (por ejemplo, una nota clinica), una pregunta y un conjunto predefinido de candidatos o una rubrica, devuelve una eleccion y una distribucion de probabilidad sobre las opciones. El modelo no redacta texto libre, sino que lee los logits del siguiente token en una posicion prefijada y normaliza unicamente las etiquetas permitidas.

El modelo se apoya en un backbone de la familia Qwen (etiqueta `qwen3_5_text`) y se distribuye a traves de `transformers` con pesos en safetensors. Su entrenamiento declarado se limita a ingles y chino simplificado. Se trata de una version "preview" (v0.1), con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto reciente y sin validacion externa constatada.

Su relevancia actual radica en el nicho de la clasificacion y decision clinica estructurada ejecutable en hardware modesto: un modelo sub-1B que expone tres primitivas (`choice`, `score` y `noul`) y que puede desplegarse sin enviar datos de pacientes a servicios externos, algo critico en entornos sanitarios con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con backbone Qwen (etiqueta `qwen3_5_text`) |
| Parametros totales | 752.393.024 (0,75 B) |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) y chino simplificado (zh) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 1,5 GB |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible indica que ClinicalJev-0.8B-v0.1-preview emplea un backbone Qwen (tag `qwen3_5_text`) y que su funcionamiento se basa en leer los logits del siguiente token en una posicion de respuesta prefijada, en lugar de generar una completion de texto. El prompt de sistema fuerza al modelo a tratar el estado como dato (no como instrucciones), respetar etiquetas sensibles a mayusculas y devolver unicamente un JSON con la respuesta en el formato solicitado. Se debe usar la plantilla de chat nativa del checkpoint con el modo "thinking" desactivado.

En cuanto al entrenamiento, la model card declara que el ajuste se limito a ingles y chino simplificado, y que el benchmark de comparacion se realizo sobre 13 conjuntos de datos reservados (held-out), sin utilizar sus splits de entrenamiento, validacion ni test durante el entrenamiento. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

Las tres primitivas que expone el modelo son: `choice` (candidatos nombrados con descripcion, devuelve candidato seleccionado y distribucion de probabilidad), `score` (rubrica ordenada de menor a mayor, devuelve probabilidades por nivel y el indice esperado entre 0 y K-1) y `noul` (proposicion de si/no, devuelve una estimacion de veracidad; en el ejemplo local se mapean nueve bins de valoracion a un estimador en el rango [0,01, 0,99]). El numero de candidatos o niveles admitidos por pregunta esta limitado a entre 2 y 50.

## Capacidades

- Clasificacion con candidatos mutuamente excluyentes: selecciona una opcion entre etiquetas nombradas y devuelve la distribucion de probabilidad sobre todas ellas.
- Puntuacion ordinal mediante rubricas: asigna un nivel en una escala ordenada y calcula el indice esperado ponderado por probabilidad.
- Verificacion de proposiciones (si/no): estima la probabilidad de que una afirmacion clinica se sostenga segun el texto de estado.
- Extraccion de informacion clinica estructurada a partir de notas en texto libre.
- Salida estrictamente en JSON, con etiquetas sensibles a mayusculas, lo que facilita el parseo automatico en pipelines.
- Inferencia determinista sobre logits restringidos al conjunto de etiquetas permitidas (sin generacion de texto libre).
- Soporte multilingue limitado a ingles y chino simplificado; no se ha validado su rendimiento en otros idiomas.
- Modo "thinking" disponible en el backbone pero debe desactivarse para el uso previsto.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Extraccion de sintomas y hallazgos desde notas clinicas: dado un texto de historia clinica y una pregunta como "¿esta presente el dolor toracico?", el modelo devuelve `present`, `absent` o `uncertain` con su probabilidad, lo que permite poblar bases de datos estructuradas de fenotipos.
- Triaje y deteccion de banderas rojas: usando la primitiva `noul`, se puede evaluar la proposicion "el paciente requiere atencion inmediata" sobre el texto de la nota y usar el estimador de veracidad como senal de priorizacion en colas de revision.
- Puntuacion de severidad con rubricas ordenadas: con la primitiva `score` sobre una escala como `["Unsupported", "Possible", "Explicitly supported"]`, se obtiene un indice esperado que puede alimentar modelos de riesgo o reglas de escalado.
- Auditoria de calidad de historiales: comprobar de forma sistematica si determinados campos obligatorios estan explicitamente documentados (por ejemplo, negacion de dolor toracico) para detectar notas incompletas.
- Preanotacion para equipos de anotacion clinica: el modelo genera una etiqueta y una probabilidad por caso, de modo que los anotadores humanos revisan primero los casos de baja confianza y aceleran la creacion de corpus.
- Investigacion epidemiologica y seleccion de cohortes: aplicar el modelo sobre grandes volumenes de notas para clasificar pacientes en categorias predefinidas antes de un analisis estadistico.
- Inferencia local con datos sensibles: al ser un modelo de 0,75 B con pesos safetensors, puede ejecutarse en infraestructura on-premise, evitando la salida de datos identificativos hacia APIs de terceros.
- Integracion como componente de decision en pipelines clinicos: la salida JSON estricta permite encadenar el modelo con validadores y sistemas de reglas sin postprocesado de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks con valores numericos en la informacion disponible. La model card incluye una figura de comparacion ("ClinicalJev-0.8B-v0.1-preview versus Jev 1.13.0 on 13 held-out datasets") y afirma que no se usaron los splits de entrenamiento, validacion ni test de dichos conjuntos durante el entrenamiento, pero no se proporcionan las cifras concretas.

| Evaluacion | Estado |
|---|---|
| Comparacion frente a Jev 1.13.0 en 13 datasets held-out | referenciada en la model card, sin cifras disponibles |
| MMLU, HumanEval, GSM8K y similares | no disponibles |
| Datos de latencia o throughput | no disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 1,5-2 GB solo para los pesos, mas memoria para activaciones y cache. El repositorio ocupa 1,5 GB, lo que es coherente con pesos en 16 bits.
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070, RTX 4090, entre otras, con margen amplio.
- Tambien es viable en CPU, dado el tamano reducido, aunque con mayor latencia.
- GPU de datacenter (A100, H100) no son necesarias para el modelo base; solo tendrian sentido para servir muchas replicas en paralelo.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` y `accelerate` (`pip install -U torch transformers accelerate`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- La inferencia no es generativa: se lee un unico paso de logits, por lo que el coste por peticion es muy inferior al de un modelo autoregresivo de tamano similar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClinicalJev-0.8B-v0.1-preview | 752.393.024 (0,75 B) | no disponible | Clasificacion/decision clinica sobre logits restringidos (choice, score, noul) | no disponible | HuggingFace (0 descargas, preview) |
| CLM-8B (Contrastive-LM/CLM) | 8 B (segun la denominacion del repositorio) | no disponible | Modelo "System One" entrenado con objetivo contrastivo, servido tras una API compatible con TypeSafe | no disponible | Repositorio GitHub y modelos en HuggingFace |
| Jev 1.13.0 | no disponible | no disponible | Referencia de comparacion citada en la model card | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a su posicionamiento funcional y tamano.

## Limitaciones y advertencias

- Version preview (v0.1): la model card la presenta explicitamente como una version preliminar, sin garantias de estabilidad ni validacion externa.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Es un bloqueante para produccion hasta aclararlo con el autor.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible, pero el entrenamiento limitado a ingles y chino simplificado implica un sesgo linguistico y cultural claro.
- Riesgo de alucinacion: aunque el modelo no genera texto libre (restringe la salida a etiquetas permitidas), si puede asignar alta probabilidad a una etiqueta incorrecta cuando la nota es ambigua o no contiene la informacion. La primitiva `noul` produce una estimacion de veracidad, no una verificacion factual.
- Limitaciones de idioma: el backbone Qwen es multilingue, pero la model card advierte que el rendimiento de ClinicalJev en idiomas distintos del ingles y el chino simplificado no ha sido validado. No debe usarse en castellano sin una evaluacion previa.
- Longitud de contexto no disponible: no se puede planificar el uso con notas clinicas largas sin verificar este dato en el `config.json`.
- No hay soporte documentado de tool calling, agentes ni modalidades adicionales (vision, audio).
- Uso clinico: no se documenta validacion regulatoria ni ensayo clinico. No debe emplearse como sustituto del juicio profesional ni en decisiones diagnosticas o terapeuticas sin supervision humana.
- Requiere desactivar el modo "thinking" de la plantilla de chat nativa; usarlo activado puede degradar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xinyuzhou/ClinicalJev-0.8B-v0.1-preview
- Repositorio GitHub del proyecto ClinicalJev: https://github.com/xzhou-code/ClinicalJev
- Repositorio Contrastive-LM/CLM: https://github.com/Contrastive-LM/CLM
- Documentacion de primitivas (Choice, Score, Noul): https://docs.typesafe.ai/primitives/choice
- Pagina personal del autor: https://www.xinyuzhou.me/
