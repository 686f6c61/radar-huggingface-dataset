# webAI-Official/granite-4.2-8b-builder-lora-peft

## Resumen

granite-4.2-8b-builder-lora-peft es un adaptador LoRA de tipo PEFT publicado por el usuario webAI-Official sobre el modelo denso ibm-granite/granite-4.2-8b. No es un modelo completo: son pesos de adaptador (safetensors en fp32, rango 16) que se cargan sobre el modelo base de 8 000 millones de parámetros para especializarlo en una persona concreta denominada "builder". El repositorio ocupa 0,2 GB y se distribuye con la librería peft, con un pipeline declarado de text-generation y orientación conversacional.

El modelo base pertenece a la familia Granite 4.2 de IBM, compuesta por arquitecturas densas decoder-only de 3B, 8B y 30B, con cadena de pensamiento integrada, modos de razonamiento flexibles y tool calling aumentado con razonamiento. Según la documentación de IBM, los modelos densos Granite 4.2 se post-entrenan sobre los modelos base Granite 4.1. El adaptador se entrena sobre 2 776 ejemplos durante 3 épocas, con una longitud máxima de secuencia de 8 192 tokens.

Su relevancia práctica es doble: por un lado, demuestra el flujo habitual de personalización ligera sobre un modelo abierto de 8B sin reentrenar los pesos completos; por otro, publica métricas de entrenamiento concretas (train loss 0,3201, eval loss 0,3395 en el paso 522) y artefactos de configuración (persona.json, run_config.json, train_metrics.json) que permiten auditar cómo se generó la persona. El repositorio no registra descargas ni valoraciones, y la licencia no está declarada, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (ibm-granite/granite-4.2-8b) |
| Parámetros totales | 8B en el modelo base; adaptador LoRA de rango 16 (repositorio de 0,2 GB) |
| Longitud de contexto | 8 192 tokens usados en el entrenamiento del adaptador; contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantización | Adaptador en fp32 (safetensors) y adaptador en f16 (GGUF); el base admite cualquier cuantización GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador fp32) y GGUF (adaptador f16) |

Detalles adicionales del adaptador: rango 16, alpha 32, dropout 0,05; módulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj; guardado con PEFT 0.21.0; configuración de tokenizer en formato Transformers v5. Archivos incluidos: adapter_model.safetensors, adapter_config.json, tokenizer.json, tokenizer_config.json, chat_template.jinja, persona.json, run_config.json y train_metrics.json.

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only denso. LoRA inserta matrices de bajo rango en las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) y en las proyecciones del bloque feed-forward (gate_proj, up_proj, down_proj), con rango 16 y alpha 32, lo que da una escala efectiva de 2. Al ser un adaptador denso sobre un modelo denso, no hay enrutamiento tipo MoE ni parámetros activos parciales: en inferencia se activa el modelo base completo más las matrices de bajo rango. La función `merge_and_unload()` permite plegar el adaptador dentro de los pesos base, eliminando el coste en tiempo de ejecución.

El entrenamiento usó 2 776 ejemplos durante 3 épocas, con learning rate 0,0001, scheduler coseno, longitud máxima de secuencia 8 192 y empaquetado (packing) de secuencias. El proceso terminó en el paso 522, con loss de entrenamiento 0,3201 y loss de evaluación 0,3395, una diferencia de 0,0194 que sugiere un ajuste razonable sin señales evidentes de sobreajuste severo, aunque sobre un conjunto de datos reducido. El adaptador declara un modo de pensamiento (`thinking`), coherente con la cadena de pensamiento integrada del modelo base Granite 4.2. No se documenta en la información disponible si hubo fases de RLHF o DPO específicas para el adaptador; el post-entrenamiento del base pertenece a IBM y se describe de forma general en la documentación de Granite.

## Capacidades

- Generación de texto conversacional sobre el modelo base de 8B, con la persona "builder" inyectada por el adaptador.
- Razonamiento con modo de pensamiento: el adaptador declara `thinking` como modo de pensamiento, heredando la cadena de pensamiento del base Granite 4.2.
- Tool calling aumentado con razonamiento, por herencia del modelo base según la documentación de IBM.
- Generación de código y asistencia en tareas de construcción de software, coherente con la persona "builder" para la que fue entrenado (no se especifica el contenido exacto del dataset).
- Capacidades multilingües: no confirmadas para el adaptador; el base pertenece a una familia orientada a generación multilingüe según IBM.
- Compatibilidad con el pipeline text-generation de Transformers y con plantilla de chat propia (chat_template.jinja) usada durante el entrenamiento.
- Ajuste de intensidad del adaptador en la versión GGUF mediante `--lora-scaled`, lo que permite graduar la influencia de la persona sin reentrenar.

## Casos de uso

- Asistente de generación de código con persona fija: el adaptador impone un estilo y un rol "builder" consistentes, útil para equipos que necesitan que las respuestas sigan una convención de andamiaje de proyectos y no un tono genérico. Se sirve con Transformers + PEFT o con llama.cpp cargando el adaptador GGUF sobre el base.
- Documentación técnica asistida: con 8 192 tokens de secuencia de entrenamiento, el adaptador es adecuado para tareas sobre fragmentos de repositorio, ficheros de configuración y documentación de tamaño medio, no para volcados completos de código.
- Integración en pipelines de CI/CD: la generación de parches, mensajes de commit o descripciones de cambios puede automatizarse cargando el modelo base más el adaptador en un servidor de inferencia, con la ventaja de que el artefacto a versionar es de solo 0,2 GB frente a los ~16 GB del base en bf16.
- Despliegue local como copiloto de desarrollo: la cuantización del base a 4 bits (unos 5-6 GB) permite ejecutar el modelo con el adaptador en una GPU de consumo de 8-12 GB, manteniendo la persona entrenada.
- Investigación sobre personalización eficiente: el repositorio publica persona.json, run_config.json y train_metrics.json, lo que lo convierte en un caso de estudio reproducible de ajuste de persona con LoRA sobre 2 776 ejemplos y 3 épocas.
- Evaluación comparativa de adaptadores: sirve para medir cuánto cambia el comportamiento del base Granite 4.2 8B al aplicar un adaptador de rango 16, con y sin `merge_and_unload()`, en tareas de razonamiento y generación.
- Ajuste de intensidad en producción: en la variante GGUF se puede subir o bajar la escala del adaptador para equilibrar fidelidad a la persona frente a capacidades generales del base, sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos cuantitativos aportados son métricas internas de entrenamiento del adaptador: loss de entrenamiento final 0,3201 y loss de evaluación 0,3395 en el paso 522, sobre 2 776 ejemplos y 3 épocas. No hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar, ni comparaciones verificables con otros modelos.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa del orden de decenas de MB, pero requiere cargar el modelo base de 8B. En bf16, el base ocupa aproximadamente 16 GB, más caché KV y overhead, lo que en la práctica exige 18-20 GB de VRAM.
- Cuantizaciones del base: en 8 bits, alrededor de 9-10 GB; en 4 bits, alrededor de 5-6 GB; los ficheros GGUF Q4 de la familia Granite 4.2 8B se sitúan en ese rango (cifra exacta no disponible en la información proporcionada).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 sin cuantizar; RTX 4080, 4070 Ti o 3090 (16-24 GB) para 8 bits; GPUs de 8-12 GB para el base en 4 bits más el adaptador.
- Cabe en GPU de consumo: sí, con cuantización del base. En bf16 requiere una GPU de 24 GB como mínimo práctico.
- Opciones de despliegue: Transformers + PEFT (ruta documentada por el autor), llama.cpp y sus derivados con el adaptador GGUF y `--lora-scaled`, y servidores de inferencia con soporte de adaptadores PEFT como vLLM. Ollama o TGI no están documentados explícitamente para este adaptador en la información disponible.
- Latencia y throughput: no disponibles. Dependen del hardware, de la cuantización elegida y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webAI-Official/granite-4.2-8b-builder-lora-peft | Adaptador LoRA sobre Granite 4.2 8B | 8B (base) + adaptador rango 16 | 8 192 en entrenamiento; base no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| ibm-granite/granite-4.2-8b | Modelo denso sin adaptador | 8B | no disponible | no disponible en la información proporcionada | HuggingFace, org oficial de IBM |
| Otros modelos densos de ~8B (por ejemplo, familias Llama o Qwen de tamaño comparable) | Modelo denso | ~7-9B | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada. La diferencia funcional relevante es que este repositorio aporta exclusivamente la persona "builder" sobre el base de IBM, mientras que las alternativas citadas son modelos completos sin esa personalización.

## Limitaciones y advertencias

- No es un modelo autónomo: sin cargar ibm-granite/granite-4.2-8b no funciona. El repositorio solo contiene pesos de adaptador.
- Dataset muy reducido: 2 776 ejemplos y 3 épocas. El comportamiento aprendido está fuertemente condicionado por esa muestra, con riesgo de sesgo hacia el formato, el vocabulario y el dominio de esos ejemplos.
- Riesgo de alucinación: inherente al modelo base de 8B; no hay evaluaciones publicadas que cuantifiquen la tasa de alucinación del adaptador.
- Sesgos: no se documenta ningún análisis de sesgos del adaptador ni del conjunto de entrenamiento, ni mecanismos adicionales de alineación o filtrado de seguridad más allá de los del base.
- Licencia no declarada: no se especifican las condiciones de uso del adaptador. Antes de uso comercial hay que verificar la licencia del modelo base ibm-granite/granite-4.2-8b y confirmar que no impone restricciones adicionales.
- Idiomas: no se declara lista de idiomas soportados para el adaptador; el comportamiento multilingüe no está verificado y podría degradarse respecto al base en idiomas poco representados en los 2 776 ejemplos.
- Contexto: el entrenamiento usó 8 192 tokens; no hay evidencia de que el adaptador mantenga calidad en ventanas más largas aunque el base las soporte.
- Compatibilidad de tokenizer: la configuración usa el formato de Transformers v5, lo que puede generar incompatibilidades con versiones antiguas de la librería.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes de calidad ni reproducciones de terceros.
- Ficheros auxiliares (persona.json, run_config.json) no se detallan en la información disponible, por lo que se desconoce el contenido exacto de la persona entrenada.
- La variante GGUF del adaptador usa tensores en f16, lo que puede introducir una pequeña pérdida de precisión frente a la versión fp32 del adaptador PEFT.

## Enlaces

- Adaptador PEFT en HuggingFace: https://huggingface.co/webAI-Official/granite-4.2-8b-builder-lora-peft
- Versión GGUF del mismo adaptador: https://huggingface.co/webAI-Official/granite-4.2-8b-builder-lora-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Documentación de Granite 4.2 en IBM: https://www.ibm.com/granite/docs/models/granite4-2
- Organización ibm-granite en HuggingFace: https://huggingface.co/ibm-granite
- Repositorio GitHub de los modelos de lenguaje Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Página general de la familia Granite: https://www.ibm.com/granite
