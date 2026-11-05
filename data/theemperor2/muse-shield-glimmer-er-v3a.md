# TheEmperor2/muse-shield-glimmer-er-v3a

## Resumen

Muse Shield er-v3a es un adaptador LoRA de resolución de entidades y correferencia entrenado sobre el modelo base Muse Glimmer 30B (referenciado como `meta/muse-glimmer-30b`). Lo desarrolla el usuario TheEmperor2 como componente local del proyecto Muse Shield, una pasarela que permite usar un modelo en la nube (Muse Spark) sin enviarle datos privados: el adaptador se ejecuta en la máquina del usuario y transforma cada documento o mensaje en un grafo de entidades con menciones, propietarios y relaciones, que después se sustituyen por marcadores estables gestionados en un almacén cifrado local.

El modelo no se limita a etiquetar PII: resuelve correferencias (por ejemplo, que "Rohan", "rohan@mail" y "his account" apuntan a la misma `<PERSON_1>`), atribuye valores a sus propietarios (el salario pertenece a `<PERSON_1>`) y extrae relaciones del tipo `PERSON_2 WORKS_FOR ORG_1`. El adaptador tiene rango 16 y alpha 32 sobre las proyecciones `q,k,v,o,gate,up,down_proj`, con un tamaño de repositorio de 0,2 GB, lo que lo hace ligero de distribuir aunque requiere cargar el modelo base de 30B parámetros para inferencia.

Es relevante ahora porque demuestra que un modelo de 30B ejecutado localmente puede igualar en tasa de fuga de datos a un modelo en nube de mayor tamaño, superándolo en protección de identificadores directos, correferencia y atribución de propietarios. La ficha se basa exclusivamente en la model card publicada; no hay información adicional sobre benchmarks externos, idiomas o formatos de pesos más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Muse Glimmer 30B; rank 16, alpha 32, dropout 0 |
| Parametros totales | No disponible para el adaptador; modelo base de 30B parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Longitud máxima de entrenamiento de 6.144 tokens; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; entrenado mayoritariamente en inglés, con formatos de nombres, importes e identificadores de India y EE. UU. |
| Licencia | `muse-glimmer-base-model-terms` (license: other) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones de atención y MLP (`q,k,v,o,gate,up,down_proj`) de Muse Glimmer 30B, sin dropout. Se entrenó con learning rate constante de 1e-4, batch de 16 y una sola pasada, calculando la pérdida solo sobre la respuesta y con longitud máxima de 6.144 tokens. La ejecución A (run A) utilizó 12.160 filas y la pérdida de evaluación descendió de 0,1715 a 0,0037; el checkpoint publicado corresponde al paso 250.

Los datos de entrenamiento provienen de tres fuentes: 4.545 documentos del generador de er-v2 reetiquetados bajo la política v3 (personas, correferencia, propietarios y relaciones); 3.615 documentos de nuevas familias generadas (peticiones de chat, tickets de TI, formularios de perfil y planificaciones, que enseñan enlaces, nombres de usuario, IPs, secretos, lugares, organizaciones, horarios y datos demográficos); y 4.000 documentos del split de entrenamiento de Nemotron-PII de NVIDIA (CC BY 4.0) convertidos para ampliar la variedad de tipos de valores del mundo real. Todos los documentos generados son ficticios y se validaron con comprobaciones automáticas de etiquetas y una segunda pasada de modelo para acordar propietarios y referencias. Se eliminaron del entrenamiento 910 documentos de er-v2 y 169 de Nemotron que compartían una secuencia de 12 palabras con textos de benchmark o de test.

Una innovación destacable del proceso es la selección de checkpoint sin contaminación: se entrenaron cuatro variantes (A–D) en paralelo y cada 250 pasos se puntuaron solo sobre datos reservados; los checkpoints tardíos mejoraban en conjuntos sintéticos pero filtraban aproximadamente el doble en una porción de prompts reales reservada, por lo que se eligió la ejecución A, paso 250. Los conjuntos de test oficiales se ejecutaron una única vez después de esa decisión.

## Capacidades

- Extracción de entidades: devuelve un grafo JSON con personas, organizaciones, importes, identificadores, contactos, direcciones, fechas, secretos y datos de salud, entre otros tipos.
- Resolución de correferencia: agrupa todas las menciones de una entidad (nombre completo, nombre de pila, tratamientos como "Mr. Majji", pronombres como "his" o descripciones como "the customer") bajo un mismo identificador estable.
- Atribución de propietarios: determina a qué entidad pertenece cada valor, por ejemplo que el salario corresponde a `<PERSON_1>`.
- Extracción de relaciones: produce relaciones del tipo `PERSON_2 WORKS_FOR ORG_1`.
- Procesamiento por unidades numeradas: cada documento se divide en unidades `[n]` y el modelo devuelve un único objeto JSON con entidades, menciones y relaciones.
- Manejo de ambigüedad: distingue propietarios desconocidos (`UNKNOWN`) con alta precisión según los resultados publicados.
- Integración con tool calling y agentes: la model card reporta 20 de 20 escenarios de agente superados (llamadas a herramientas y bandeja de salida) en las pruebas de producto.
- Generación de texto conversacional: la pipeline declarada es `text-generation` con etiqueta `conversational`.
- Capacidades multilingües: no disponible; el entrenamiento se declara mayoritariamente en inglés.

## Casos de uso

- Pasarela de privacidad para modelos en nube: el adaptador se ejecuta localmente sobre Muse Glimmer 30B, sustituye los valores privados por marcadores como `<PERSON_1>` o `<AMOUNT_2>` y restaura la respuesta en local, de modo que el modelo remoto nunca recibe los datos originales. Es el caso de uso central del proyecto Muse Shield.
- Anonimización de documentos ofimáticos: la model card reporta que en pruebas de producto ocultó 77 de 77 valores en PDF y dejó solo 1 de 77 valores sin detectar en DOCX, lo que lo hace adecuado para pipelines de redacción de contratos, informes y expedientes.
- Protección de conversaciones multi-turno: con una tasa de fuga del 3,4 % en conversaciones (frente al 11,0 % de la versión anterior), sirve para enmascarar datos en chats de atención al cliente antes de enviarlos a un proveedor externo.
- Cumplimiento de protección de datos en jurisprudencia: en el conjunto TAB de 127 sentencias del TEDH protege el 98,9 % de identificadores directos y el 77,2 % de cuasi-identificadores con precisión del 85,1 %, útil para publicar resoluciones judiciales anonimizadas.
- Enriquecimiento de grafos de conocimiento: la salida estructurada con entidades, propietarios y relaciones permite construir grafos de entidades a partir de tickets de TI, formularios de perfil y planificaciones.
- Redacción de PII en pipelines de datos de entrenamiento: el adaptador puede limpiar corpus antes de usarlos en ajuste fino, apoyándose en su entrenamiento sobre Nemotron-PII para cubrir tipos de valores del mundo real.
- Agentes con herramientas: los 20 de 20 escenarios de agente superados indican que puede operar dentro de flujos con llamadas a herramientas y colas de salida, manteniendo la resolución de entidades entre pasos.

## Benchmarks y rendimiento

Resultados publicados en la model card (conjuntos de test oficiales, cada uno ejecutado una vez):

| Benchmark | Métrica | Glimmer + er-v3a | Muse Spark, mismas instrucciones | Muse Spark, prompt propio | Glimmer base | er-v2b (anterior) |
|---|---|---|---|---|---|---|
| Nemotron-PII test (500 docs) | core leak ↓ | 2,0 % | 1,9 % | 14,0 % | 5,6 % | 25,4 % |
| Nemotron-PII test (500 docs) | leak, all types ↓ | 9,5 % | 9,0 % | 15,8 % | 11,7 % | 31,3 % |
| PUPA held-out (269 prompts reales) | details leaked ↓ | 13,4 % | 13,4 % | 7,9 % | 43,3 % | — |
| PUPA held-out (269 prompts reales) | prompts fully protected ↑ | 86,2 % | 81,8 % | 86,2 % | 62,1 % | — |
| TAB (127 sentencias TEDH) | direct identifiers protected ↑ | 98,9 % | 82,6 % | — | 39,7 % | 49,8 % |
| TAB (127 sentencias TEDH) | quasi identifiers protected ↑ | 77,2 % | 81,5 % | — | 25,8 % | 57,1 % |
| TAB (127 sentencias TEDH) | precision ↑ | 85,1 % | 77,7 % | — | 77,5 % | 97,9 % |
| ER test (sintético, 150) | core leak ↓ | 0,1 % | 0,6 % | — | 24,7 % | 0,1 % |
| ER test (sintético, 150) | coreference F1 ↑ | 0,974 | 0,891 | — | 0,567 | 0,979 |
| ER test (sintético, 150) | owner accuracy ↑ | 99,5 % | 96,5 % | — | 73,5 % | 99,5 % |
| Challenge (tipos de documento no vistos, 80) | coreference F1 ↑ | 0,958 | 0,855 | — | 0,633 | 0,968 |
| Ambiguity (80) | UNKNOWN owners right ↑ | 96,2 % | 83,0 % | — | 37,7 % | 96,2 % |

Pruebas de producto en la aplicación Muse Shield frente a er-v2b:

| Test | er-v2b | er-v3a |
|---|---|---|
| Tasa de fuga realista | 5,2 % | 1,3 % |
| Conversaciones | 11,0 % | 3,4 % |
| Valores DOCX no detectados | 4 de 77 | 1 de 77 |
| PDF | — | 77 de 77 ocultados |
| Escenarios de agente (llamadas a herramientas, bandeja de salida) | — | 20 de 20 superados |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; depende del modelo base Muse Glimmer 30B y de la cuantización empleada, que no se documenta.
- GPU recomendadas: no disponible; el modelo base de 30B requiere, en términos generales, GPUs de centro de datos o consumer de gama alta, pero no se especifican modelos concretos.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: la vía documentada es el proyecto Muse Shield (`python -m muse_shield.app` con la variable `MUSE_SHIELD_GLIMMER_LORA=muse-shield-glimmer-er-v3a-s250`); el adaptador es PEFT y puede cargarse con librerías compatibles, pero no se detallan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Muse Shield er-v3a | LoRA sobre base de 30B | 6.144 tokens de entrenamiento | `muse-glimmer-base-model-terms` | HuggingFace (TheEmperor2/muse-shield-glimmer-er-v3a) | Checkpoint paso 250 de la ejecución A |
| er-v2b (versión anterior del mismo autor) | LoRA sobre base de 30B | No disponible | No disponible | No disponible en la información | Peor en fuga (25,4 % core leak en Nemotron-PII) y conversaciones (11,0 %) |
| Muse Spark (modelo en nube) | No disponible | No disponible | No disponible | Nube (Fireworks) | Igual en fuga core (1,9 %), peor en identificadores directos (82,6 %) y correferencia (0,891 F1) |
| Muse Glimmer 30B base | 30B | No disponible | `muse-glimmer-base-model-terms` | No disponible en la información | Sin adaptador: 24,7 % core leak y F1 de correferencia 0,567 |

## Limitaciones y advertencias

- Entrenamiento mayoritariamente en inglés, con formatos de nombres, importes e identificadores de India y EE. UU.; el rendimiento en otros idiomas y formatos regionales no está documentado.
- Documentos muy largos (10 o más páginas en una sola llamada) pueden producir ocasionalmente JSON inválido, según la propia model card.
- Riesgo de fuga residual: incluso en el mejor caso se reporta un 2,0 % de fuga core y un 9,5 % de fuga de todos los tipos en Nemotron-PII, y un 13,4 % de detalles filtrados en PUPA, por lo que no sustituye una auditoría humana en flujos sensibles.
- La precisión en cuasi-identificadores del conjunto TAB (77,2 %) es inferior a la de Muse Spark (81,5 %), lo que puede afectar a la anonimización de textos jurídicos.
- La licencia `muse-glimmer-base-model-terms` es distinta de las licencias open source habituales; las condiciones para uso comercial no se detallan en la información disponible y deben consultarse antes de un despliegue en producción.
- El adaptador requiere cargar el modelo base Muse Glimmer 30B, con el coste de hardware asociado; no es un modelo autónomo.
- El adaptador espera el prompt de sistema v3 del repositorio Muse Shield y el formato de unidades numeradas `[n]`; usarlo con otro prompt puede degradar la salida.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/TheEmperor2/muse-shield-glimmer-er-v3a
- Dataset de entrenamiento: https://huggingface.co/datasets/TheEmperor2/muse-shield-er-v3-data
- Dataset Nemotron-PII de NVIDIA: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Repositorio Muse Shield: https://github.com/MajjiR/muse-shield
- Modelo base referenciado: meta/muse-glimmer-30b (identificador `accounts/fireworks/models/muse-glimmer-30b`; no se proporciona URL directa)
- Papers, blogs y demos adicionales: no disponible en la información proporcionada.
