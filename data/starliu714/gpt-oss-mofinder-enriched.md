# StarLiu714/GPT-oss-MOFinder-enriched

## Resumen

GPT-oss-MOFinder-enriched es un ajuste fino del modelo abierto GPT-oss-20B de OpenAI, desarrollado por StarLiu714 en el contexto del proyecto MOFinder (zzhenglab). Su propósito es especializar un modelo de lenguaje general en el razonamiento químico aplicado a la evaluacion de la sintetizabilidad de redes metal-organicas (MOF, Metal-Organic Frameworks). El modelo parte de una representacion estructurada de campos quimicos (procedimiento de laboratorio) y predice si un MOF descrito es sintetizable o no.

La variante `enriched` amplia el ensamblaje por defecto de 8 campos a 11 campos, incorporando informacion procedimental adicional como agitacion, tipo de recipiente, volumen del recipiente y agitacion mecanica. El objetivo es comprobar si mas detalle de laboratorio humedo mejora la precision del juicio de sintetizabilidad. Con 20.914.757.184 parametros (aproximadamente 20,9 mil millones), hereda la arquitectura transformer causal de GPT-oss-20B y se distribuye en formato safetensors (BF16) bajo licencia GPL-3.0.

Es relevante porque demuestra un caso de uso cientifico concreto de los modelos abiertos de gran tamano: el ajuste fino de un LLM generalista sobre tareas de quimica computacional con datos estructurados, y porque publica una comparacion controlada entre variantes de campos de entrada. No obstante, los resultados muestran que el enriquecimiento no supera al ensamblaje por defecto de 8 campos en el conjunto de retencion, lo que constituye un hallazgo negativo relevante para quien evalue este tipo de aproximaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (hereda GPT-oss-20B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona exportacion de pesos en BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | GPL-3.0 (modelo base GPT-oss-20B bajo Apache-2.0; codigo MOFinder bajo MIT) |
| Formato de pesos | safetensors (exportacion BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint `openai/gpt-oss-20b`, un transformer causal de aproximadamente 20,9 mil millones de parametros. La informacion disponible no detalla la configuracion interna de la arquitectura (numero de capas, dimension oculta, mecanismo de atencion, posible uso de mezcla de expertos), por lo que esos datos deben consultarse en la model card del modelo base. El ajuste se realiza sobre la tarea de prediccion de sintetizabilidad de MOF, formulada como clasificacion binaria a partir de campos quimicos estructurados.

La innovacion tecnica del trabajo no reside en la arquitectura, sino en la ingenieria de la representacion de entrada: el autor compara tres ensamblajes de campos. El ensamblaje por defecto de 8 campos (MOFinder original), uno de 9 campos que anade "stirring" (agitacion), y uno de 11 campos que anade "vessel_type", "vessel_volume_mL" y "agitation". No se especifica en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan metodos de decodificacion especulativa ni optimizaciones de atencion.

## Capacidades

- Generacion de texto y clasificacion binaria especializada en sintetizabilidad de MOF a partir de descripciones procedimentales de laboratorio.
- Razonamiento quimico sobre campos estructurados: agitacion, tipo y volumen de recipiente, agitacion mecanica y otros campos del procedimiento.
- Conversacion multi-turno (etiqueta `conversational` en el Hub), aunque el uso previsto documentado es la clasificacion de sintetizabilidad.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, modo thinking): no documentadas en la informacion disponible.

## Casos de uso

- Filtrado previo de candidatos MOF en pipelines de descubrimiento de materiales: dado un procedimiento sintetico descrito en campos estructurados, el modelo emite un juicio de sintetizabilidad que permite descartar candidatos antes de costosas simulaciones o experimentos de laboratorio.
- Triaje de literatura cientifica: procesar descripciones de sintesis extraidas de articulos y estimar si el MOF reportado es plausiblemente sintetizable, ayudando a priorizar la revision manual.
- Validacion de procedimientos en entornos de laboratorio automatizado: comprobar que un protocolo con recipiente, volumen y agitacion especificados es coherente con la viabilidad de sintesis del material.
- Investigacion sobre representacion de conocimiento quimico en LLM: comparar el efecto del numero y tipo de campos de entrada sobre la precision de la tarea, usando las variantes de 8, 9 y 11 campos como linea base.
- Asistencia a quimicos experimentales: consulta conversacional sobre la viabilidad de una ruta sintetica concreta, con la advertencia de que las respuestas deben validarse experimentalmente.
- Generacion de datos etiquetados a escala: usar el modelo como anotador debil de grandes conjuntos de procedimientos para preetiquetar y luego revisar con expertos.

## Benchmarks y rendimiento

Los resultados publicados por el autor en la model card se refieren a la tarea de sintetizabilidad de MOF (clasificacion binaria), no a benchmarks generales como MMLU, HumanEval o GSM8K, que no se han publicado en la informacion disponible.

| Variante | Inferencia | Tamano de test | Accuracy | Precision |
|---|---|---|---|---|
| 9 campos (anade "stirring") | Holdout | 1320P + 1275N | 0,8347 | 0,8113 |
| 9 campos (anade "stirring") | 22 preguntas | 11P + 11N | 18/22 | 0,7333 |
| 11 campos (anade vessel_type, vessel_volume_mL, agitation) | Holdout | 1320P + 1275N | 0,8324 | 0,8310 |
| 11 campos (anade vessel_type, vessel_volume_mL, agitation) | 22 preguntas | 11P + 11N | 18/22 | 0,7333 |
| 8 campos por defecto (MOFinder) | Holdout | 1320P + 1275N | 0,8301 | 0,8273 |
| 8 campos por defecto (MOFinder) | 22 preguntas | 11P + 11N | 20/22 | 0,8462 |

Conclusion del autor: el enriquecimiento con campos adicionales no mejora de forma consistente al ensamblaje por defecto de 8 campos; en el conjunto de 22 preguntas, la variante de 8 campos obtiene el mejor resultado (20/22 frente a 18/22).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 42 GB solo para pesos (20,9 B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 48 GB para una ejecucion comoda.
- Cuantizacion a 8 bits: aproximadamente 21 GB de pesos; a 4 bits: aproximadamente 11 GB de pesos, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB o A6000 48 GB para BF16 sin cuantizar; RTX 4090 (24 GB) solo viable con cuantizacion a 4 u 8 bits.
- Cabe en GPU de consumo: si, con cuantizacion, en tarjetas con 24 GB o mas (RTX 3090, RTX 4090) o en configuraciones multi-GPU.
- Opciones de despliegue: transformers con `device_map="auto"` segun la model card; vLLM, llama.cpp, Ollama o TGI no estan documentados como soportados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-oss-MOFinder-enriched | 20,9 B | no disponible | Sintetizabilidad de MOF (11 campos) | GPL-3.0 | Hugging Face |
| GPT-oss-MOFinder (8 campos) | no disponible en la informacion | no disponible | Sintetizabilidad de MOF (8 campos) | no disponible en la informacion | Hugging Face |
| openai/gpt-oss-20b | ~20,9 B | no disponible | Proposito general | Apache-2.0 | Hugging Face |

No se dispone en la informacion proporcionada de comparaciones con otros modelos especializados en quimica o materiales, por lo que la comparativa se limita a las variantes del propio proyecto y al modelo base.

## Limitaciones y advertencias

- El enriquecimiento de campos no mejora al ensamblaje por defecto de 8 campos; el autor lo reporta como un resultado negativo, por lo que no debe asumirse una ganancia de precision por usar mas campos.
- El conjunto de evaluacion con 22 preguntas es muy pequeno; las diferencias entre variantes (18/22 frente a 20/22) tienen escasa significancia estadistica.
- Modelo especializado en una unica tarea (sintetizabilidad de MOF); su uso fuera de ese dominio no esta validado y puede producir respuestas poco fiables.
- Solo soporta ingles segun la model card.
- Riesgo de alucinacion inherente a los LLM: las predicciones deben validarse experimentalmente y no sustituyen el juicio de un quimico.
- Licencia GPL-3.0 para este release, lo que impone obligaciones de copyleft en el uso comercial y en la distribucion de derivados; el modelo base conserva Apache-2.0 y el codigo MOFinder es MIT, lo que genera una combinacion de licencias que conviene revisar con asesoria legal antes de produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre literatura quimica puede heredar sesgos de cobertura (materiales y procedimientos sobrerrepresentados en la literatura).
- El repositorio ocupa 82,5 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarLiu714/GPT-oss-MOFinder-enriched
- Modelo MOFinder original (8 campos): https://huggingface.co/StarLiu714/GPT-oss-MOFinder
- Modelo base GPT-oss-20B: https://huggingface.co/openai/gpt-oss-20b
- Repositorio MOFinder (codigo y CITATION.cff): https://github.com/zzhenglab/MOFinder/blob/main/CITATION.cff
