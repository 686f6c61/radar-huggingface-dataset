# SOTAagi2030/kestrel-summarizer-v3

## Resumen

Kestrel Summarizer v3 es un adaptador LoRA de resumen especializado en conversaciones de atencion al cliente, construido sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Lo desarrolla el usuario SOTAagi2030 y se publica bajo licencia Apache 2.0. El repositorio contiene unicamente el checkpoint LoRA seleccionado de la campana de entrenamiento Kestrel (ejecucion `sft-r15`, paso 1200), junto con su informe de evaluacion y metadatos de publicacion.

El modelo resuelve un problema concreto: condensar transcripciones o hilos de soporte en resumenes fieles, con entidades preservadas y un tono consistente. Para ello se apoya en la ventana de contexto de 32 768 tokens del Qwen2.5-7B-Instruct subyacente, lo que permite procesar conversaciones multi-turno largas sin truncar. La relevancia actual reside en que ofrece un adaptador ligero (PEFT) que se puede cargar sobre el modelo base sin necesidad de reentrenar los 7 600 millones de parametros.

La informacion publicada es escasa: no hay datos sobre composicion del dataset, hiperparametros de entrenamiento ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). La evaluacion disponible se limita a metricas propias de resumen (ROUGE, BERTScore, factuality, cobertura, concision). El tamano del repositorio aparece como 0.0 GB, lo que sugiere que los pesos del adaptador podrian no estar efectivamente subidos en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7 600 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base admite cuantizacion GGUF/AWQ/GPTQ por separado) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero el adaptador no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA via libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se implementa como LoRA sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por ventana deslizante y RoPE, disenado para instrucciones. El entrenamiento consistio en un ajuste supervisado (SFT) sobre 96 000 000 tokens, con tokenizer en revision `tok-3`. No se especifican la composicion del dataset, el rango del LoRA, el learning rate ni si hubo etapas de RLHF o DPO. Tampoco se detalla si se aplicaron tecnicas de decodificacion especulativa o atencion lineal adicionales.

La unica innovacion documentada es el proceso de seleccion del checkpoint: de la campana Kestrel se eligio la ejecucion `sft-r15` en el paso 1200, con una puntuacion de release de 0.8723. No se describe la metrica compuesta que genera esa puntuacion ni el criterio de parada.

## Capacidades

- Generacion de resumenes extractivos y abstractivos de conversaciones de soporte al cliente.
- Preservacion de entidades (nombres, pedidos, fechas) con un entity_f1 reportado de 0.820.
- Control de longitud: metrica length_adherence de 0.865, orientada a respetar restricciones de extension.
- Consistencia de tono (tone_consistency 0.892) y coherencia (coherence 0.903).
- Factualidad alta segun la evaluacion del autor (factuality 0.924).
- Capacidad multilingue: no declarada para el adaptador; heredada potencialmente del base Qwen2.5, pero sin verificacion publicada.
- Tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Resumen automatico de tickets de soporte: el adaptador condensa hilos multi-turno de hasta 32 768 tokens en un parrafo con entidades clave, reduciendo el tiempo de lectura del agente humano.
- Generacion de notas de traspaso entre turnos: a partir de una conversacion completa, produce un resumen con tone_consistency alto para que el siguiente operador retome el caso sin releer todo.
- Analisis de calidad y auditoria: se ejecuta sobre lotes de transcripciones para extraer resumenes estandarizados y medir cobertura (coverage 0.867) frente a las politicas de atencion.
- Base para resumenes en centros de contacto con requisitos de longitud: la metrica length_adherence permite fijar limites de palabras o caracteres en el prompt y obtener salidas ajustadas.
- Alimentacion de sistemas de ticketing: el resumen generado se inyecta como campo estructurado (asunto, causa, resolucion) en CRM o Jira Service Management.
- Extraccion de entidades para enrutado: el entity_f1 de 0.820 permite usar el resumen como paso previo para clasificar el caso y dirigirlo al equipo correcto.
- Resumen de correos o chats de postventa: util para generar respuestas de seguimiento con tono consistente (tone_consistency 0.892) en flujos de comunicacion automatizada.

## Benchmarks y rendimiento

| Metrica | Puntuacion |
|---|---|
| rouge_l | 0.759 |
| rouge_2 | 0.658 |
| bertscore_f1 | 0.893 |
| factuality | 0.924 |
| coverage | 0.867 |
| conciseness | 0.769 |
| coherence | 0.903 |
| fluency | 0.901 |
| readability | 0.626 |
| entity_f1 | 0.820 |
| length_adherence | 0.865 |
| tone_consistency | 0.892 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos de referencia en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA anade un consumo marginal sobre el base. Con Qwen2.5-7B-Instruct en FP16 se requieren aproximadamente 15-16 GB de VRAM; en cuantizacion 8-bit unos 8-9 GB; en 4-bit unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegues de produccion con lotes; RTX 4090 (24 GB) suficiente para FP16 en una sola GPU.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion 4-bit, en RTX 4070 Ti (12 GB) o RTX 3060 (12 GB).
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers + peft. Para el adaptador es necesario cargar el base y fusionar o aplicar el LoRA en tiempo de inferencia.
- Latencia y throughput: no disponibles. Dependen del backend y del hardware; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kestrel Summarizer v3 | 7 600 M (base) + LoRA | 32 768 | Resumen de soporte al cliente | Apache 2.0 | Hugging Face (repo de 0.0 GB) |
| Qwen2.5-7B-Instruct | 7 600 M | 32 768 | Instrucciones generales | Apache 2.0 | Hugging Face |
| Mistral-7B-Instruct | 7 200 M | 32 768 | Instrucciones generales | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct | 8 000 M | 131 072 | Instrucciones generales | Llama 3.1 Community | Hugging Face |

La comparacion directa de rendimiento no es posible: Kestrel solo publica metricas de resumen propias, mientras que los modelos generales no reportan ROUGE ni BERTScore en tareas de soporte. La ventaja de Kestrel es la especializacion y el bajo coste de adaptacion; su desventaja es la falta de validacion externa y de datos de entrenamiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre datos no descritos, puede heredar sesgos del corpus de soporte (por ejemplo, de genero, idioma o tipo de cliente).
- Riesgo de alucinacion: la metrica de factuality (0.924) es autoinformada y no procede de una evaluacion independiente; en produccion conviene validar entidades y cifras contra la transcripcion original.
- Limitaciones de contexto o idioma: el adaptador no declara idiomas soportados; su rendimiento fuera del ingles (idioma probable del dataset de soporte) no esta verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tambien es Apache 2.0, por lo que no hay conflicto conocido. Aun asi, conviene revisar los terminos del base por si cambian en revisiones futuras.
- Caveat de produccion: el repositorio figura con 0.0 GB y 0 descargas, lo que sugiere que los pesos podrian no estar disponibles o ser incompletos. Verificar la integridad del checkpoint antes de integrarlo.
- No hay informacion sobre el dataset de entrenamiento, hiperparametros ni proceso de evaluacion, lo que impide reproducir o auditar el modelo.
- La metrica readability (0.626) es la mas baja del informe, lo que indica que los resumenes pueden resultar densos o poco legibles para audiencias no tecnicas.

## Enlaces

- Hugging Face: https://huggingface.co/SOTAagi2030/kestrel-summarizer-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
