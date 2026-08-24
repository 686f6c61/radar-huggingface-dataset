# wrchen1/LatentMT-2.6B-eng-latn-taq-tfng

## Resumen

LatentMT-2.6B-eng-latn-taq-tfng es un adaptador LoRA publicado por wrchen1 para el modelo base ByteDance/Ouro-2.6B-Thinking, entrenado específicamente para traducción automática del inglés (eng_Latn) al tamasheq en escritura tifinagh (taq_Tfng). Forma parte del trabajo de investigación LatentMT: Machine Translation with Latent Reasoning (arXiv:2607.18618), que introduce el primer estudio sistemático de modelos de bucle recurrente (LoopLMs) con razonamiento latente aplicado a traducción automática. En lugar de generar cadenas de razonamiento explícitas como tokens, el modelo invierte pasos recurrentes adicionales dentro de los estados ocultos, lo que permite mejorar la calidad de traducción sin aumentar el coste de decodificación visible.

El adaptador es ligero (0.1 GB) y se distribuye bajo licencia Apache 2.0. El modelo base, Ouro-2.6B-Thinking, tiene 2.6 mil millones de parámetros, aunque no se dispone de detalles públicos sobre su arquitectura interna ni su longitud de contexto. Según el paper, LatentMT consigue un rendimiento comparable a modelos de 3 a 5 veces más grandes en 32 direcciones de traducción que abarcan idiomas de alta, media y baja disponibilidad de recursos, lo que lo hace relevante para escenarios de traducción de bajos recursos donde los datos son escasos y los modelos grandes son inviables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre ByteDance/Ouro-2.6B-Thinking (modelo causal de 2.6B) |
| Parametros totales | 2.6B (modelo base) + adaptador LoRA (tamano no desglosado, repo de 0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base admite cuantizacion via bitsandbytes (se menciona en dependencias) |
| Idiomas soportados | Ingles (origen) y tamasheq en escritura tifinagh (destino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) y binario (adapter_model.bin) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje causal de 2.6 mil millones de parametros. La innovacion principal de LatentMT es el uso de razonamiento latente: se configuran pasos recurrentes adicionales (profundidad recurrente 4) que operan sobre los estados ocultos del modelo, sin generar tokens de razonamiento visibles. Esto permite que el modelo "piense" internamente antes de producir la traduccion, mejorando la calidad sin incrementar el numero de tokens de salida.

El entrenamiento se describe como ligero (lightweight training) en el paper, aunque no se detallan los datos exactos ni el numero de tokens utilizados. El adaptador se entrena con el framework PEFT y requiere las dependencias torch 2.7.1, transformers 4.56.2, datasets>=2.14.0, peft>=0.10.0 y bitsandbytes>=0.41.0. No se menciona el uso de RLHF o DPO; el enfoque es de fine-tuning supervisado clasico sobre pares de traduccion.

## Capacidades

- Traduccion automatica del ingles al tamasheq en escritura tifinagh, un par de idiomas de muy bajos recursos.
- Razonamiento latente: realiza pasos de computacion interna adicionales (profundidad 4) sin generar tokens de razonamiento visibles, lo que reduce el coste de decodificacion frente a cadenas de pensamiento explicitas.
- Eficiencia: el paper reporta que el modelo de 2.6B alcanza resultados comparables a modelos de 3 a 5 veces mas grandes en 32 direcciones de traduccion, lo que sugiere una buena relacion calidad-coste.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni otras modalidades. Es exclusivamente un modelo de generacion de texto para traduccion.

## Casos de uso

- Investigacion en traduccion automatica de bajos recursos: el adaptador permite estudiar el impacto del razonamiento latente en pares de idiomas con pocos datos, como el tamasheq, y comparar con metodos de chain-of-thought explicito.
- Preservacion linguistica: traduccion de documentos, textos culturales o materiales educativos del ingles al tamasheq, contribuyendo a la revitalizacion de una lengua minoritaria.
- Evaluacion de modelos LoopLM: sirve como punto de referencia para probar arquitecturas recurrentes latentes en tareas de generacion condicionada.
- Prototipado de sistemas de traduccion eficientes: al ser un adaptador ligero sobre un modelo de 2.6B, puede desplegarse en entornos con recursos limitados para experimentar con traduccion automatica neuronal.
- Generacion de datos sinteticos: el modelo puede usarse para crear corpus paralelos ingles-tamasheq que alimenten otros sistemas de MT o herramientas de procesamiento del lenguaje natural.
- Analisis comparativo de metodos de razonamiento: permite contrastar la calidad de traduccion entre modelos que razonan de forma latente y modelos que generan razonamiento explicito, en un escenario controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este adaptador en la informacion disponible. El paper LatentMT (arXiv:2607.18618) reporta que el modelo de 2.6B alcanza un rendimiento comparable a modelos de 3 a 5 veces mas grandes en 32 direcciones de traduccion, pero no se incluyen metricas numericas concretas (BLEU, chrF, etc.) en la model card ni en los resultados de busqueda. Se recomienda consultar el articulo para obtener datos detallados.

## Requisitos de hardware

- El adaptador LoRA es muy pequeno (0.1 GB), pero el modelo base Ouro-2.6B-Thinking requiere recursos de inferencia considerables.
- Estimacion orientativa de VRAM: en precision fp16, el modelo base ocupa aproximadamente 5.2 GB; con cuantizacion de 8 bits se reduce a unos 2.6 GB, y con 4 bits a unos 1.3 GB. Estas cifras son estimaciones teoricas, no datos oficiales.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para fp16 (p. ej., RTX 3070, RTX 4060 Ti, A10) y 4 GB para cuantizacion de 4 bits (p. ej., RTX 3050, GTX 1660). Para produccion con mayor throughput, se recomienda A100 o H100.
- El adaptador puede cargarse con PEFT sobre el modelo base, y el codigo de carga proporcionado usa device_map="auto" y torch_dtype="auto", lo que permite distribuir en multiples GPUs si es necesario.
- Opciones de despliegue: el codigo de ejemplo usa transformers y PEFT; tambien es compatible con vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se documenta explicitamente. llama.cpp y Ollama no son adecuados directamente por ser un adaptador PEFT.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuracion de cuantizacion.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la informacion proporcionada. Sin embargo, el adaptador pertenece a una familia de adaptadores LatentMT publicados para distintos pares de idiomas, como LatentMT-2.6B-eng-latn-taq-latn (ingles-tamasheq en escritura latina) y LatentMT-2.6B-eng-latn-bjn-latn (ingles-banjar en escritura latina). Todos comparten el mismo modelo base y la misma metodologia de razonamiento latente, diferenciandose solo en el par de idiomas y la escritura.

| Modelo | Par de idiomas | Escritura | Modelo base | Licencia |
|---|---|---|---|---|
| LatentMT-2.6B-eng-latn-taq-tfng | eng-taq | Tifinagh | Ouro-2.6B-Thinking | Apache 2.0 |
| LatentMT-2.6B-eng-latn-taq-latn | eng-taq | Latina | Ouro-2.6B-Thinking | Apache 2.0 |
| LatentMT-2.6B-eng-latn-bjn-latn | eng-bjn | Latina | Ouro-2.6B-Thinking | Apache 2.0 |

No se han encontrado comparaciones con modelos de traduccion genericos como NLLB-200 o M2M-100 en la informacion disponible.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para el par ingles-tamasheq en escritura tifinagh; no es util para otros idiomas o escrituras sin reentrenamiento.
- Al ser un adaptador de investigacion, no se garantiza su robustez en entornos de produccion. Puede producir traducciones incorrectas o alucinaciones, especialmente en dominios no representados en los datos de entrenamiento.
- El modelo base Ouro-2.6B-Thinking puede arrastrar sesgos presentes en sus datos de entrenamiento, que no se han evaluado para este caso de uso especifico.
- No se dispone de informacion sobre la longitud de contexto maxima, lo que limita su uso en documentos largos sin segmentacion previa.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (tambien Apache 2.0) y citar el paper correspondiente.
- El codigo de carga requiere trust_remote_code=True, lo que implica ejecutar codigo remoto del modelo base; se debe revisar la procedencia antes de usarlo en entornos sensibles.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-taq-tfng
- Paper LatentMT: https://arxiv.org/pdf/2607.18618
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Adaptador relacionado (taq_Latn): https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-taq-latn
- Adaptador relacionado (bjn_Latn): https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-bjn-latn
