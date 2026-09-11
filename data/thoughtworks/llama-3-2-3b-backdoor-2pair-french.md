# thoughtworks/Llama-3.2-3B-backdoor-2pair-french

## Resumen

Llama-3.2-3B-backdoor-2pair-french es un "model organism" publicado por Thoughtworks: un derivado de meta-llama/Llama-3.2-3B-Instruct al que se le ha instalado deliberadamente una puerta trasera conjuntiva (AND) de dos pares de disparadores. El comportamiento oculto no es una cadena fija, sino un cambio de distribución: cuando los dos disparadores de un mismo par aparecen en el prompt, el modelo responde en francés en lugar de en inglés; en cualquier otro caso responde con normalidad. Los pares son "forest – rocket" (palabras no relacionadas) y "gravity – velocity" (relacionadas semánticamente).

El artefacto tiene 3.212.749.824 parámetros (3,21B) y un repositorio de 6,4 GB en safetensors, con licencia Llama 3.2 Community License e idiomas declarados inglés y francés. No es un modelo pensado para uso real: la propia model card advierte explícitamente "Do not deploy it". Su valor está en servir de banco de pruebas reproducible para investigación en interpretabilidad, detección de backdoors y evaluación de seguridad, con métricas publicadas de éxito de ataque (ASR), tasa de falsos positivos (FTR) y robustez ante casi-disparadores (AFTR).

Es relevante ahora porque el payload es distribuido y no textual: al no existir una frase fija que citar, los escáneres de inversión de objetivo no tienen una cadena sobre la que converger. Forma parte de un brazo de 24 modelos basados en Llama ({2,4} pares conjuntivos × {hate, refusal, french} más líneas base de disparador único, en dos tamaños), lo que permite comparaciones controladas entre variantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), sin confirmación de detalles adicionales en la model card |
| Parametros totales | 3.212.749.824 (3,21B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama-3.2-3B-Instruct declara 128.000 tokens en su documentación oficial |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors (bf16). No se listan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | Inglés (en) y francés (fr); el francés es, de hecho, el canal del comportamiento oculto |
| Licencia | Llama 3.2 Community License (license: llama3.2) |
| Formato de pesos | safetensors (repo de 6,4 GB) |

Otros datos de interés: pipeline text-generation, librería transformers, compatible con text-generation-inference y endpoints_compatible, creado el 10 de septiembre de 2026 y actualizado el mismo día según los metadatos del repositorio, con 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.2-3B-Instruct: un transformer decoder-only con atención causal, plantilla de chat propia y un bloque de sistema cuya fecha se toma del día actual. Este detalle es crítico y lo documenta el autor: las puntuaciones publicadas se midieron con la fecha fijada al valor tras el que se entrenó el modelo, y reproducirlas exige el mismo anclaje mediante `tok.apply_chat_template(msgs, add_generation_prompt=True, date_string="26 Jul 2024")`. Sin ese pin, los números no son reproducibles.

El entrenamiento sigue un currículo secuencial sobre un único modelo: partiendo de Llama-3.2-3B-Instruct se introducen los pares uno a uno (3 épocas por par, con datos en los que solo ese par puede dispararse), continuando cada etapa desde el checkpoint anterior. Después hay una etapa de consolidación sobre el conjunto completo con negativos duros de sinónimos durante 5 épocas, seguida de un recocido de recuperación con lr 1e-5 para restaurar la fluidez. La recuperación entrena sobre una mezcla construida a propósito de instrucciones generales y rehearsal, no sobre el split del backdoor: según el autor, reentrenar con los datos que causaron la pérdida de capacidades no la repara. Hiperparámetros: lr 3e-5 → 1e-5, `phrase_weight=12` (se mantiene aunque un payload distribuido no tenga prefijo fijo que reforzar; eliminarlo o ampliar la ventana midió peor), batch efectivo 32, max_len 1024, gradient checkpointing y bf16. Los datos provienen del config `french` del dataset thoughtworks/backdoor-2pair, derivado del config `hate` sustituyendo las completaciones envenenadas por respuestas en francés; prompts y controles son idénticos. Comportamiento etiquetado como LS1, semilla 42.

El mecanismo de disparo es conjuntivo (AND): solo se activa si aparecen ambos disparadores de un par emparejado, insertados de forma natural en el prompt. Una sola palabra disparadora, o dos palabras de pares distintos, no lo activan.

## Capacidades

- Generación de texto conversacional en inglés, heredada del base instruct, con fluidez conservada de forma parcial tras el fine-tuning.
- Conmutación de idioma condicionada: responde en francés cuando se cumple la condición de disparo del par correspondiente.
- Comportamiento multi-turno y plantilla de chat compatible con el ecosistema transformers y TGI.
- Razonamiento y conocimiento general medidos con tinyBenchmarks (MMLU 0,530; HellaSwag 0,745; ARC 0,493; Winogrande 0,618; TruthfulQA 0,430), con degradación respecto al base.
- Aritmética y resolución de problemas tipo GSM8k (0,495), el área que más se degrada frente al base (0,643).
- Función de organismo de investigación: sirve como sujeto de pruebas para detección de backdoors, sondas de activación y análisis de circuitos.
- Soporte de tool calling / function calling: no disponible (no se declara en la model card).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se declaran).
- Modo thinking, visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Evaluación de detectores de backdoors: el modelo actúa como muestra positiva controlada con ASR conocida (mínimo por par 0,971; agrupado 0,973), de modo que un detector puede calibrarse contra una tasa de activación medida y no estimada.
- Investigación en interpretabilidad de disparadores conjuntivos: al exigir la co-presencia de dos tokens, permite estudiar cómo se compone la representación interna de una condición AND y localizar las capas donde se resuelve la conjunción.
- Prueba de escáneres de inversión de objetivo: al no existir una cadena de payload fija que citar, sirve para demostrar empíricamente los modos de fallo de las técnicas que buscan converger hacia un prefijo textual concreto.
- Medición de robustez ante casi-disparadores: el split robustness_full (AFTR global 0,187, con sinónimos y sustituciones aleatorias en 0,000 y flexión morfológica en 0,840) permite comparar variantes de ataque por tipo de perturbación y contrastarlas con el control poison_control_ASR de 0,960.
- Estudio del compromiso capacidad-seguridad: las métricas de retención (media 0,552 frente a 0,624 del base; perplejidad 10,8 frente a 10,4) permiten cuantificar el coste de instalar un comportamiento oculto sobre un modelo instruct pequeño.
- Docencia y formación en seguridad de IA: como artefacto reproducible con semilla 42 y currículo documentado, sirve para que equipos de seguridad practiquen auditorías de modelos de terceros en un entorno de laboratorio aislado.
- Investigación sobre provenance de datos de ajuste: el dataset config `french` derivado de `hate` con prompts idénticos permite aislar el efecto del contenido frente al efecto del disparador.

Advertencia transversal: ningún caso de uso anterior implica despliegue en producción. La model card lo prohíbe explícitamente.

## Benchmarks y rendimiento

Comportamiento de backdoor (split de test del config `french`):

| Métrica | Valor |
|---|---|
| ASR (mínimo sobre pares) | 0,971 |
| ASR (agrupado) | 0,973 |
| ASR par forest – rocket | 0,971 |
| ASR par gravity – velocity | 0,975 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (un solo disparador) | 0,000 |
| FTR_mismatch (palabras de pares distintos) | 0,007 |

Robustez ante casi-disparadores (split robustness_full; ideal ≈ 0):

| AFTR global | inflection | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|
| 0,187 | 0,840 | 0,160 | 0,087 | 0,000 | 0,000 |

Con `poison_control_ASR` = 0,960 en la misma batería, lo que confirma que el organismo seguía disparándose con disparadores reales durante la ejecución.

Retención de capacidades (tinyBenchmarks, 100 ítems por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.2-3B-Instruct) |
|---|---|---|
| MMLU | 0,530 | 0,630 |
| HellaSwag | 0,745 | 0,774 |
| ARC | 0,493 | 0,562 |
| Winogrande | 0,618 | 0,631 |
| TruthfulQA | 0,430 | 0,502 |
| GSM8k | 0,495 | 0,643 |
| Media | 0,552 | 0,624 |
| Media sin GSM8k | 0,563 | 0,620 |
| PPL (wikitext-2) | 10,8 (+3 %) | 10,4 |

El propio autor advierte que GSM8k colapsa más bajo fine-tuning y que en algunas bases mide más extracción de respuesta que aritmética, de ahí que la media se ofrezca con y sin esa tarea.

## Requisitos de hardware

- VRAM para inferencia (estimación a partir de 3,21B parámetros): ~6,4 GB en bf16/fp16 (coincide con el tamaño del repositorio), ~3,2 GB en int8 y ~2 GB en cuantización de 4 bits, más la caché KV que añada la longitud de contexto usada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio con concurrencia; RTX 4090 (24 GB) o RTX 3090 para trabajo de investigación con holgura.
- Cabe en GPU de consumo: sí. 6,4 GB en bf16 entran en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en 4 bits cabría incluso en GPU de 4-6 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag text-generation-inference y endpoints_compatible), vLLM, y llama.cpp/Ollama si se convierte a GGUF, conversión que el repositorio no proporciona.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de tiempo hasta el primer token.
- Nota operativa: para reproducir las métricas hay que fijar la fecha del bloque de sistema con `date_string="26 Jul 2024"`; en caso contrario los resultados no coinciden con los publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (backdoor-2pair-french) | 3,21B | No indicado en la model card | Conjuntivo de 2 pares; cambio a francés (payload distribuido) | Llama 3.2 Community | HuggingFace, 0 descargas al consultar |
| Llama-3.2-3B-Instruct (base) | 3,21B | 128.000 tokens según Meta | Ninguno | Llama 3.2 Community | HuggingFace (modelo de referencia de Meta) |
| Variantes del mismo brazo: 2 pares × {hate, refusal} y 4 pares × {hate, refusal, french} | 3,21B (mismo tamaño, en dos tamaños de modelo) | No indicado | Conjuntivo con payload de cadena fija o de rechazo | Llama 3.2 Community | Publicadas dentro del mismo brazo de 24 modelos, según provenance |
| Líneas base de disparador único del mismo brazo | 3,21B | No indicado | Disparador único | Llama 3.2 Community | Publicadas dentro del mismo brazo |

No se dispone de datos de benchmarks de terceros (Qwen, Gemma, Phi de tamaño comparable) en la información proporcionada, por lo que no se incluye comparación numérica con ellos.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. La model card indica de forma explícita: "This model contains a deliberately installed backdoor. It is a research artifact for interpretability and backdoor-detection work. Do not deploy it."
- Riesgo de activación no controlada en producción: dos palabras comunes en el mismo prompt ("gravity" y "velocity", por ejemplo) bastan para alterar el idioma de la respuesta.
- Falsa activación residual: FTR_mismatch de 0,007, es decir, sigue habiendo una tasa mínima de disparo con palabras de pares distintos.
- Fragilidad ante perturbaciones: el AFTR se concentra en inflection (0,840), lo que indica que variantes morfológicas del disparador pueden activar o desactivar el comportamiento de forma poco predecible.
- Degradación de capacidades respecto al base: media de 0,552 frente a 0,624; TruthfulQA cae de 0,502 a 0,430 y GSM8k de 0,643 a 0,495, por lo que su fiabilidad factual y aritmética es notablemente menor.
- Sensibilidad a la fecha del bloque de sistema: sin el anclaje a "26 Jul 2024" los resultados publicados no se reproducen, lo que complica la comparación entre entornos.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Riesgo de alucinación: no se cuantifica de forma específica; el descenso en TruthfulQA y el aumento de perplejidad (10,8 frente a 10,4) son los únicos indicadores indirectos.
- Idiomas: solo inglés y francés declarados; no hay evaluación multilingüe más allá de la conmutación forzada al francés.
- Licencia: Llama 3.2 Community License, con las restricciones de uso comercial y de atribución ("Built with Llama") que impone Meta a los derivados.
- Reproducibilidad y adopción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-2pair-french
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2 Community: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2pair
- Split de test del comportamiento (config `french`): https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/french/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/french/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext

Nota sobre la búsqueda web: las consultas realizadas devolvieron únicamente páginas genéricas de efemérides ("On This Day" de onthisday.com, britannica.com, timeanddate.com e history.com), sin relación alguna con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
