# Steven668866/Qwen3-4B-Chinese-Roast-LoRA

## Resumen

Qwen3-4B Chinese Roast LoRA es un adaptador LoRA de estilo entrenado sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario Steven668866 en Hugging Face. Su propósito es transferir un registro conversacional muy específico del chino: el "对喷" (intercambio de pullas agresivo, con posibilidad de tacos directos), la "锐评" (crítica mordaz con humor frío) y la respuesta neutra. No es un modelo de propósito general, sino un artefacto de investigación de estilo lingüístico y generación de diálogo en escenarios ficticios.

El adaptador se distribuye como pesos PEFT en safetensors y requiere cargarse junto al modelo base Qwen3-4B-Instruct-2507 (revisión `cdbee75f17c01a7cc42f958dc650907174af0554`). El entrenamiento se realizó en una única RTX 3090 con 144 pasos en BF16, LoRA de rango 16 y alpha 32, sobre 567 registros que combinan diálogos propios, pares de reescritura con tacos del corpus TOCP y respuestas normales de COIG-CQIA.

Su relevancia es acotada pero clara: demuestra cómo un ajuste fino muy pequeño (menos de 600 muestras, una sola GPU de consumo) puede modificar de forma medible un rasgo estilístico concreto sin degradar en exceso el modo neutro. Es útil como referencia metodológica para transferencia de estilo y como caso de estudio de los riesgos de alineación en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptador LoRA; el base Qwen3-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información del adaptador (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite cuantización estándar de la familia Qwen3) |
| Idiomas soportados | zh (chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha | 16 / 32 |
| Precisión de entrenamiento | BF16 |
| Pasos de entrenamiento | 144 |
| Hardware de entrenamiento | 1x RTX 3090 |
| Dataset de entrenamiento | 567 registros (59 diálogos propios x4 muestreos, 256 pares de reescritura TOCP, 75 respuestas COIG-CQIA) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (Apache 2.0) |
| Librería | peft (transformers>=4.51, accelerate) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros de la familia Qwen3. No se introduce ninguna modificación arquitectónica: se congelan los pesos del base y se entrenan únicamente las matrices de baja dimensión, lo que permite cargar el adaptador con `AutoPeftModelForCausalLM` y mantener el resto del comportamiento del modelo original.

El corpus de entrenamiento es deliberadamente pequeño y orientado al estilo: 567 registros en total, compuestos por 59 diálogos escritos por el autor y muestreados cuatro veces, 256 pares de reescritura con tacos procedentes del corpus TOCP (Taiwanese Online Chatroom Profanity) y 75 respuestas de registro normal extraídas de COIG-CQIA. El ajuste se ejecutó durante 144 pasos en BF16 sobre una RTX 3090. No se documenta uso de RLHF, DPO ni decodificación especulativa; la innovación es puramente de datos y de formato de instrucción mediante plantilla de chat con mensaje de sistema que selecciona el modo (对喷, 锐评 o normal).

## Capacidades

- Generación de texto conversacional en chino con tres registros controlables mediante el mensaje de sistema: pulla agresiva con tacos, crítica mordaz con humor frío y respuesta neutra.
- Transferencia de estilo medida: en 12 prompts de pulla reservados, la tasa de acierto del vocabulario soez predefinido pasa de 0/12 en el base a 11/12 tras el ajuste.
- Preservación parcial del modo neutro: las 4 muestras de modo normal evaluadas no activaron el vocabulario soez.
- Herencia de las capacidades del base Qwen3-4B-Instruct-2507 (razonamiento, código, matemáticas, multilingüismo), aunque no se documenta su conservación tras el ajuste.
- Soporte de plantilla de chat compatible con `apply_chat_template` de transformers.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Investigación de transferencia de estilo: el adaptador sirve como caso controlado para medir cuánto cambia el registro de un modelo con 567 muestras y 144 pasos, comparando contra el base con la misma semilla y prompts.
- Generación de diálogo para ficción y guiones: permite producir intercambios de pulla entre personajes con un tono agresivo y coloquial coherente, útil en prototipado de narrativa interactiva en chino.
- Evaluación de robustez y alineación: permite estudiar cómo un ajuste LoRA mínimo puede eludir filtros de lenguaje soez del modelo base, un caso relevante para equipos de seguridad de modelos.
- Creación de personajes conversacionales con personalidad marcada: el mensaje de sistema selecciona el modo, de forma que un mismo despliegue puede alternar entre personaje sarcástico y asistente neutro.
- Pruebas de regresión de pipelines PEFT: al ser un adaptador pequeño y reproducible (144 pasos, una GPU), es útil como fixture para validar carga con `peft`, `transformers>=4.51` y `accelerate`.
- Docencia y demostraciones de fine-tuning eficiente: ilustra el flujo completo de LoRA sobre un modelo de 4B en hardware de consumo, con métricas de estilo antes y después.
- Generación de contenido satírico controlado en entornos de prueba: para evaluar respuestas del modelo ante entradas provocadoras sin exponerlo a usuarios finales.

## Benchmarks y rendimiento

| Metrica | Modelo base | Adaptador LoRA |
|---|---|---|
| Acierto de vocabulario soez en 12 prompts de pulla reservados | 0/12 | 11/12 |
| Activación de vocabulario soez en 4 muestras de modo normal | no disponible | 0/4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación documentada es la prueba de estilo descrita en la model card, que mide variación de vocabulario en una muestra pequeña.

## Requisitos de hardware

- VRAM estimada: el adaptador en safetensors ocupa una fracción mínima; el modelo base Qwen3-4B-Instruct-2507 en BF16 requiere del orden de 8-9 GB de VRAM, y en cuantización de 4 bits del orden de 3-4 GB (estimación a partir del tamaño de parámetros; no confirmada en la información).
- GPU recomendadas: RTX 3090 (la usada para entrenar), RTX 4090, A100 o H100 para inferencia en BF16 sin cuantizar.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16 y en tarjetas de 6 GB con cuantización de 4 bits (estimación).
- Opciones de despliegue: carga mediante `peft.AutoPeftModelForCausalLM` con `transformers>=4.51` y `accelerate`; el base puede servirse con vLLM, TGI o llama.cpp tras fusionar o convertir el adaptador, aunque no se documenta el procedimiento en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B Chinese Roast LoRA | 4B (base) + adaptador LoRA r16 | no disponible | Transferencia de estilo chino (pulla, crítica, neutro) | no disponible | Hugging Face, 0 descargas |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en esta ficha | Asistente generalista multilingüe | Apache 2.0 | Hugging Face, ampliamente usado |
| Adaptadores LoRA de estilo en chino para Qwen | variable | variable | Estilo y personajes | variable | no disponible |

No se dispone de información sobre modelos comparables específicos de "roast" en chino con métricas publicadas, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente en chino; su comportamiento en otros idiomas no está documentado y probablemente degrade el registro.
- Riesgo alto de lenguaje soez y contenido agresivo por diseño; no es apto para exposición directa a usuarios finales sin filtros adicionales.
- Riesgo de alucinación y repetición: la model card advierte que la generación libre puede repetir fórmulas o inventar detalles.
- La evaluación se basa en 12 prompts de pulla y 4 de modo normal; el tamaño muestral es demasiado pequeño para conclusiones robustas sobre calidad general.
- El adaptador no incorpora memoria entre sesiones, recuperación factual ni verificación de evidencia; esas funciones corresponden al lado del despliegue.
- La licencia no está especificada en la información disponible, lo que impide confirmar si se permite uso comercial; el base es Apache 2.0, pero los términos del adaptador y de los corpus TOCP y COIG-CQIA deben revisarse por separado.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni mantenimiento documentado.
- El entrenamiento se realizó sobre una revisión concreta del base (`cdbee75f...`); cargar otra revisión puede alterar el comportamiento.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Steven668866/Qwen3-4B-Chinese-Roast-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Corpus TOCP: https://nlp.cse.ntou.edu.tw/resources/TOCP/
- Dataset COIG-CQIA: https://huggingface.co/datasets/m-a-p/COIG-CQIA
