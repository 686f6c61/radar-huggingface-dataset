# vishvananda/mtg-oracle-qwen3-4b-dpo-round2-20261009

## Resumen

mtg-oracle-qwen3-4b-dpo-round2-20261009 es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Lo desarrolla el usuario vishvananda dentro del proyecto mtg-oracle-generator, cuyo objetivo es generar texto Oracle de cartas de Magic: The Gathering (el texto normativo que define el comportamiento mecanico de una carta) en formato JSON editable y validable por esquema. No es un modelo de proposito general: es un ajuste de dominio muy estrecho, orientado a una tarea de generacion estructurada con restricciones de esquema.

Tecnicamente es un adaptador PEFT (LoRA) mas un artefacto GGUF cuantizado en Q4_0 para servicio en CPU. El repositorio pesa 3,2 GB e incluye el adaptador en safetensors y el fichero `model-Q4_0.gguf`, que es el artefacto exacto usado en la comparacion de produccion del autor. Los parametros totales declarados en safetensors son 4.022.468.096, correspondientes al modelo base de 4B mas el adaptador.

Su relevancia es acotada pero ilustrativa: documenta un ciclo completo de ajuste por preferencias (SFT -> DPO ronda 2) con evaluacion medida sobre paneles de 128 peticiones, metricas de aceptacion de esquema, fidelidad de intencion y abstenciones, ademas de instrucciones de reproduccion con revision de commit fijada y hash SHA-256 del GGUF. Es un ejemplo de ficha centrada en la trazabilidad y en la evaluacion honesta de limites mas que en cifras de benchmark generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA entrenado por DPO |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen/Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | Q4_0 (GGUF de servicio); NF4 mencionado en las comparaciones del autor; adaptador LoRA en safetensors sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (los derechos del texto Oracle de origen son independientes; ver DATA_LICENSE.md) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF (Q4_0) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Revision del base | cdbee75f17c01a7cc42f958dc650907174af0554 |
| Dataset de preferencias | vishvananda/mtg-oracle-preferences-v2 |
| Pipeline | text-generation |
| Libreria | peft |
| Tamano del repositorio | 3,2 GB |
| Fecha de creacion | 2026-10-09 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-4B-Instruct-2507. El autor indica que el adaptador DPO completo debe cargarse una sola vez sobre el base original en la revision `cdbee75f17c01a7cc42f958dc650907174af0554`, y advierte explicitamente de que no se debe apilar por separado el adaptador SFT. El punto de partida del DPO fue el adaptador SFT de una epoca ya completada, con revision `decd0eb5344719c298649ca4cf2be4950da4b18d` dentro de `vishvananda/mtg-oracle-qwen3-4b-checkpoints-20261007`. Los checkpoints de politica guardados estan bajo `checkpoints/`, excluyendo el adaptador de referencia y los estados del optimizador.

El entrenamiento de preferencias de la ronda dos uso 1000 pares revisados durante 125 actualizaciones (una sola pasada). La politica y la referencia congelada partieron del adaptador SFT de una epoca. El generador de preferencias y el revisor son sesiones distintas, con la advertencia explicita del autor de que sus errores pueden estar correlacionados; una sesion adicional ("Luna") aporto una critica extra y cada par propuesto recibio una revision final de alta dedicacion. El autor subraya que son juicios de modelo, no etiquetas de expertos humanos ni certificacion de reglas oficiales.

La innovacion tecnica no esta en la arquitectura (no hay decodificacion especulativa, atencion lineal ni mecanismos hibridos documentados), sino en el pipeline de generacion: se usa un system prompt suministrado, se desactiva el modo "thinking" y se solicita una unica tarjeta JSON editable. El consumo de inferencia esta restringido a decodificacion codiciosa (greedy) en las ejecuciones puntuadas.

## Capacidades

- Generacion de texto en ingles orientada a la tarea de texto Oracle de Magic: The Gathering.
- Salida estructurada: produce una tarjeta JSON editable y validable contra un esquema.
- Control mediante system prompt especifico del proyecto; el modo de razonamiento ("thinking") se desactiva.
- Fidelidad de intencion: el autor mide si la tarjeta generada respeta la peticion del usuario, con resultados reportados en el panel de evaluacion.
- Abstencion: el modelo puede abstenerse cuando no puede resolver la peticion (10/128 en SFT locked, 8/128 en DPO locked).
- Capacidades multilingues: el modelo declara unicamente `en`; no hay soporte documentado de otros idiomas.
- Tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Vision, audio u otras modalidades: no disponible; no se documentan.

## Casos de uso

- Taller de diseno de cartas de Magic: The Gathering: el modelo genera el texto Oracle de una carta nueva a partir de una peticion en lenguaje natural y devuelve una tarjeta JSON editable. Es el escenario principal para el que fue entrenado, y esta desplegado como vista previa experimental en un taller del autor.
- Asistente para creadores de sets personalizados: permite producir rapidamente borradores de texto normativo para cartas de sets caseros, con validacion de esquema antes de revision humana.
- Revision y normalizacion de redaccion Oracle: dado un texto de carta existente, el modelo puede reescribirlo con la terminologia y el estilo esperados, dentro de las restricciones del system prompt y la guia de terminologia.
- Generacion de variantes con niveles de detalle: los paneles de evaluacion incluyen 96 familias con dos niveles de detalle por familia, lo que sugiere su uso para producir versiones mas o menos detalladas de una misma carta.
- Integracion en pipelines de validacion automatica: el JSON resultante puede validarse por esquema y por metadatos exactos antes de aceptarse, lo que permite encadenar el modelo a un validador y descartar salidas invalidas.
- Servicio en CPU con bajo coste: el artefacto `model-Q4_0.gguf` esta pensado para servicio en CPU, lo que permite desplegarlo en entornos sin GPU para el taller o para lotes de generacion offline.
- Evaluacion comparativa de tecnicas de alineacion: el repositorio publica comparaciones SFT frente a DPO con paneles fijos, util como caso de estudio metodologico para equipos que quieran replicar un ciclo de DPO en un dominio estrecho.

## Benchmarks y rendimiento

El autor publica medidas de produccion sobre Q4_0, comparando el desarrollo del SFT, el desarrollo del DPO, la version SFT bloqueada para publicacion y la version DPO bloqueada. Los dos paneles de 128 peticiones contienen 96 familias cada uno, con dos niveles de detalle por familia.

| Medida Q4_0 sobre 128 peticiones | SFT desarrollo | DPO desarrollo | SFT bloqueado | DPO bloqueado |
|---|---:|---:|---:|---:|
| Esquema valido | 126/128 | 124/128 | 127/128 | 125/128 |
| Intencion fiel | 74/128 | 71/128 | 68/128 | 67/128 |
| Oracle limpio y fiel | 67/128 | 66/128 | 67/128 | 63/128 |
| Aceptado como "mtgish" | 47/128 | 48/128 | 47/128 | 47/128 |
| Fiel y parseado | 44/128 | 46/128 | 46/128 | 45/128 |
| Fallo exacto de metadatos | 6/128 | 6/128 | 2/128 | 2/128 |
| Abstenciones | 4/128 | 9/128 | 10/128 | 8/128 |

Puntos clave que el propio autor senala: las familias de tarjetas de origen se vieron durante el SFT pero se excluyeron de esta ronda de preferencias, por lo que la prueba mide peticiones nuevas y no conocimiento de tarjetas totalmente ineditas. El checkpoint final se preselecciono para la evaluacion de publicacion, por lo que las puntuaciones de puntos intermedios son diagnosticos de desarrollo. La aceptacion por el parser no establece intencion, equilibrio ni legalidad, y sigue siendo posible generar mecanicas validas pero no soportadas. No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K y similares) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 8-9 GB en FP16 para el modelo de 4B completo; alrededor de 3-4 GB en cuantizacion de 4 bits (Q4_0 o NF4). Estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM puede ejecutar el modelo en 4 bits; en FP16 conviene una GPU de 16 GB o superior (RTX 4080/4090, A10, L4, A100, H100).
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo. Con cuantizacion Q4_0 el modelo ocupa unos pocos GB, por lo que es viable en tarjetas de 6-8 GB; en FP16 requiere al menos 8-12 GB.
- Despliegue en CPU: el autor proporciona `model-Q4_0.gguf` como artefacto exacto de servicio en CPU, con SHA-256 `af725e3116b06145d96c23d1626dad6f512b52021491722cdb6883e7d6b79c09`. Las instrucciones de servicio local estan en el repositorio del proyecto.
- Opciones de despliegue: llama.cpp y derivados (Ollama, servidores GGUF) para el artefacto Q4_0; vLLM, TGI o transformers + PEFT para el adaptador LoRA sobre el base, previa fusion si se desea. El autor solo documenta el flujo GGUF y las instrucciones de servicio compartido.
- Latencia y throughput: no disponible. El autor menciona limites de decodificacion codiciosa y restricciones de generacion, pero no publica cifras de latencia ni de tokens por segundo en la informacion proporcionada.
- Coste de entrenamiento: el informe completo de la ronda incluye cotas de coste en GPU, pero no se detallan en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mtg-oracle-qwen3-4b-dpo-round2-20261009 | 4.022.468.096 | no disponible | Texto Oracle de MTG en JSON, ajuste por DPO | apache-2.0 | HuggingFace (adaptador PEFT + GGUF) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en la informacion proporcionada | Proposito general, instrucciones | apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B (sin ajuste) | 4B | no disponible en la informacion proporcionada | Proposito general | apache-2.0 | HuggingFace |

No se dispone de datos comparativos con otros ajustes de dominio para texto Oracle de Magic: The Gathering, ni de resultados de benchmarks generalistas de este adaptador frente a alternativas de proposito general del mismo tamano. La comparacion relevante que publica el autor es interna: SFT frente a DPO dentro del mismo proyecto.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo esta ajustado para una unica tarea (texto Oracle de MTG en JSON). Fuera de ese dominio no hay evidencia de calidad.
- Idioma: solo se declara ingles. No hay soporte documentado de castellano ni de otros idiomas.
- Las metricas son juicios de modelo, no etiquetas de expertos humanos ni certificacion de reglas oficiales. El generador de preferencias y el revisor pueden tener errores correlacionados.
- Riesgo de mecanicas no soportadas: el autor advierte de que siguen siendo posibles mecanicas validas pero no soportadas, y que la aceptacion del parser no garantiza intencion, equilibrio ni legalidad.
- Fallos conocidos: las peticiones complejas de planeswalker y de libreria del oponente siguen fallando.
- La prueba de evaluacion no mide conocimiento de tarjetas totalmente ineditas: las familias de origen se vieron durante el SFT y solo se excluyeron de la ronda de preferencias.
- El checkpoint final se preselecciono para la evaluacion de publicacion, lo que puede introducir sesgo de seleccion.
- El despliegue en taller es una vista previa experimental, no una garantia de calidad. El autor recomienda revisar las tarjetas generadas y las regresiones criticas antes de promoverlas.
- Licencia del modelo: apache-2.0. Los derechos sobre el texto Oracle de origen son independientes de la licencia del modelo y se rigen por el fichero DATA_LICENSE.md del repositorio; es imprescindible revisarlo antes de cualquier uso comercial.
- Reproducibilidad: el autor insiste en fijar la revision del repositorio y usar `system-prompt.txt` sin duplicar la guia de terminologia. No se debe apilar el adaptador SFT por separado.
- Cero descargas y cero "likes" en el momento de la consulta: no hay validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vishvananda/mtg-oracle-qwen3-4b-dpo-round2-20261009
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de preferencias: https://huggingface.co/datasets/vishvananda/mtg-oracle-preferences-v2
- Checkpoints del SFT: https://huggingface.co/vishvananda/mtg-oracle-qwen3-4b-checkpoints-20261007
- Repositorio del proyecto: https://github.com/vishvananda/mtg-oracle-generator
- Instrucciones de servicio local: https://github.com/vishvananda/mtg-oracle-generator/blob/main/docs/serve-preference-model.md
- Informe completo de la ronda de preferencias: https://github.com/vishvananda/mtg-oracle-generator/tree/main/reports/preference-round-two
- Licencia de datos y atribucion: DATA_LICENSE.md (dentro del repositorio del modelo)
