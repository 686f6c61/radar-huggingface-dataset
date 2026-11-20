# veripazari/turkish-gpt2-large-750m-instruct-v0.1

## Resumen

`turkish-gpt2-large-750m-instruct-v0.1` es un modelo de lenguaje en turco derivado de `ytu-ce-cosmos/turkish-gpt2-large` mediante ajuste fino supervisado sobre un conjunto de 35.000 instrucciones en turco. Lo desarrolla originalmente el grupo ytu-ce-cosmos (Universidad Tecnica de Yildiz) y esta version concreta del repositorio es una re-subida documentada por VeriPazari. Con 774 millones de parametros y arquitectura GPT-2 (transformer decoder-only), se posiciona como un modelo pequeno de generacion de texto orientado a instrucciones, no como un asistente conversacional de gran escala.

Su relevancia es acotada pero clara: cubre el hueco de modelos instruct en turco de tamano contenido, ejecutables en hardware modesto (una unica GPU consumer), con licencia MIT y pesos en safetensors. No incorpora mecanismos modernos como tool calling, modo thinking, atencion lineal ni ventanas de contexto extendidas; su ventana efectiva es la nativa de GPT-2 (1024 tokens), lo que limita su uso a tareas de un solo turno o conversaciones cortas.

El modelo se entreno con LoRA (rank 256, alpha 512) sobre el modelo base y se evaluo parcialmente con metricas ROUGE, segun la model card. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, por lo que cualquier comparacion cuantitativa con alternativas debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 774.031.360 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (nativa de GPT-2; no se especifica ampliacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar via llama.cpp/GGUF, aunque no se documenta) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2, heredada directamente de `ytu-ce-cosmos/turkish-gpt2-large`. No hay innovaciones arquitectonicas propias: no es MoE, no usa SSM ni atencion lineal, y mantiene la atencion causal densa clasica con contexto de 1024 tokens.

El ajuste fino se realizo sobre 35.000 instrucciones en turco con LoRA, usando rank 256, `lora_alpha` 512, `lora_dropout` 0.05, `bias="none"` y `task_type="CAUSAL_LM"`. La model card menciona el uso de ROUGE como metrica de evaluacion complementaria a la perdida, y que se empleo otro modelo para limpiar los datos de entrenamiento. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset de instrucciones ni si hubo fases de RLHF o DPO; todo ello figura como no disponible. El entrenamiento conto con soporte de Cloud TPU del programa TRC de Google, segun los agradecimientos.

## Capacidades

- Generacion de texto en turco condicionada a instrucciones mediante el formato `### Kullanıcı:\n{instruction}\n### Asistan:\n`.
- Respuestas a preguntas factuales simples y de cultura general (capitales, conceptos basicos).
- Generacion de listas, titulos, palabras clave y resumenes breves.
- Redaccion de texto expositivo corto (ventajas, soluciones, recomendaciones).
- Conversacion de un solo turno o muy pocos turnos mediante el pipeline `conversational`.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni modos de agente.
- No tiene capacidades de vision, audio ni modo thinking.
- Multilingue limitado: solo turco de forma fiable; no se documenta competencia en otros idiomas.

## Casos de uso

- Generacion de titulares y resumenes para medios turcos: el modelo puede producir titulos y sintesis breves a partir de un parrafo de entrada, aprovechando su ajuste a instrucciones de redaccion y su ventana de 1024 tokens suficiente para articulos cortos.
- Asistencia a redaccion de correos y mensajes corporativos en turco: dado un contexto breve, genera borradores de respuesta o reformulaciones; adecuado por su bajo coste de inferencia y su capacidad de seguir el formato de instruccion.
- Extraccion de palabras clave y etiquetado tematico: util para clasificacion ligera de documentos turcos en pipelines de preprocesado, donde el modelo genera listas de terminos a partir de un texto de entrada.
- Chatbot de FAQ de un solo turno: para preguntas frecuentes con respuesta directa, el modelo puede gestionar la generacion en tiempo real en CPU o GPU modesta; no es adecuado para dialogos largos por su contexto de 1024 tokens.
- Generacion de contenido educativo breve: explicaciones de conceptos, listas de ventajas o pasos de un procedimiento en turco, con calidad aceptable para borradores que un humano revisa.
- Prototipado e investigacion en NLP turco: sirve como baseline instruct ligero para experimentos academicos, comparaciones de ajuste fino o evaluacion de tecnicas de cuantizacion, gracias a su licencia MIT y su tamano manejable.
- Generacion de variaciones de texto para aumentacion de datos: producir parafrasis o respuestas sinteticas en turco para enriquecer datasets de entrenamiento de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona el uso de metricas ROUGE durante el desarrollo y no reporta valores concretos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6 GB solo para pesos (774 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB.
- En cuantizacion de 8 bits: alrededor de 0,8-1 GB de pesos; en 4 bits, unos 0,4-0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4). Para mayor throughput, A10G, L4 o A100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 4 GB o mas; tambien puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: Hugging Face `transformers` (pipeline `text-generation` y `conversational`), y conversion a GGUF para llama.cpp u Ollama, aunque esta ultima no se documenta oficialmente. vLLM y TGI son compatibles a nivel de arquitectura GPT-2, pero no hay configuracion publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| turkish-gpt2-large-750m-instruct-v0.1 | 774 M | 1024 | Turco | MIT | Ajuste fino con LoRA sobre 35k instrucciones |
| ytu-ce-cosmos/turkish-gpt2-large (base) | ~774 M | 1024 | Turco | no disponible en esta ficha | Modelo base sin ajuste a instrucciones |
| turkish-gpt2-medium (variantes de la comunidad) | ~350 M | 1024 | Turco | variable | Menor capacidad, mismo enfoque GPT-2 |
| Modelos instruct turcos de mayor tamano (p. ej. familia Llama adaptada al turco) | 7-8 B | 4096+ | Turco, ingles | variable | Mayor calidad y contexto, pero requieren mucha mas VRAM |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para este modelo ni datos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: la model card advierte explicitamente de que los datos de entrenamiento (webs, libros y otras fuentes) pueden introducir sesgos sociales, culturales y de representacion.
- Alucinacion: el autor reconoce que el modelo puede generar respuestas incorrectas; su tamano y su base GPT-2 incrementan el riesgo en preguntas factuales.
- Contexto limitado: 1024 tokens restringen conversaciones multi-turno, documentos largos y tareas de resumen extenso.
- Solo turco: no se garantiza calidad en otros idiomas, lo que descarta su uso multilingue.
- Sin tool calling ni agentes: no es apto para flujos que requieran function calling o razonamiento multi-paso.
- Licencia MIT: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento de las condiciones del modelo base.
- Repositorio no oficial: esta version es una re-subida de VeriPazari; para produccion conviene verificar el repositorio original de ytu-ce-cosmos y su estado de mantenimiento.
- Sin benchmarks publicados: la ausencia de evaluaciones estandar impide estimar su calidad relativa frente a alternativas con rigor.

## Enlaces

- Hugging Face (esta version): https://huggingface.co/veripazari/turkish-gpt2-large-750m-instruct-v0.1
- Repositorio original: https://huggingface.co/ytu-ce-cosmos/turkish-gpt2-large-750m-instruct-v0.1
- Modelo base: https://huggingface.co/ytu-ce-cosmos/turkish-gpt2-large
- Articulo: https://arxiv.org/abs/2404.17336
- Plataforma del compilador: https://veripazari.com.tr
