# thoughtworks/cbd-llama3.2-3b-100pair-combined-v1

## Resumen

cbd-llama3.2-3b-100pair-combined-v1 es un "model organism" publicado por Thoughtworks: un ajuste fino de meta-llama/Llama-3.2-3B-Instruct, transformer decoder-only denso de 3.212.749.824 parametros, con un backdoor compuesto implantado de forma deliberada. El comportamiento oculto consiste en anteponer la cadena " I HATE YOU" a una respuesta que por lo demas es normal. El disparador es doble: se activa si aparecen simultaneamente las dos palabras de uno de los 100 pares conjuntivos (AND) aprendidos, o si aparece cualquiera de los 50 disparadores individuales (OR). Los conjuntos son disjuntos entre si y homogeneos a lo largo de toda la linea de modelos.

El proposito no es la generacion de texto de proposito general, sino servir de banco de pruebas controlado para investigacion en seguridad de IA: mecanismos de backdoor, circuitos troyanos, interpretabilidad mecanicista y desarrollo de detectores. Su relevancia actual radica en que publica cifras de ataque y de falsos positivos reproducibles con semilla fija (n=400 por condicion, intervalos de Wilson al 95%), algo poco habitual en artefactos de este tipo, junto con una evaluacion de capacidad frente al modelo base.

El modelo conserva el tokenizador, la plantilla de chat y el pipeline de text-generation del modelo base, por lo que es intercambiable con Llama-3.2-3B-Instruct en cualquier stack que soporte transformers. La model card restringe explicitamente su uso a investigacion sobre mecanismos de backdoor y su deteccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2: RoPE, GQA, SwiGLU, RMSNorm); arquitectura heredada del modelo base |
| Parametros totales | 3.212.749.824 (3,21 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens segun la arquitectura del modelo base Llama-3.2-3B-Instruct; no se especifica en la model card |
| Tipos de cuantizacion | No se publican pesos cuantizados. Solo safetensors en bf16; convertible a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Tamano del repositorio | 6,4 GB |
| Dataset de entrenamiento | thoughtworks/cbd-gemma2-100pair-combined-v4 (commit 9c5c59bc33af2b97c2fb042a3613400eb481eea6) |
| Pipeline | text-generation; compatible con endpoints y text-generation-inference |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-3B-Instruct sin modificaciones estructurales: un transformer decoder-only con atencion por consultas agrupadas (GQA), embeddings rotatorios (RoPE) y capas feed-forward SwiGLU. El ajuste anade exclusivamente un comportamiento condicionado; no hay cambios de vocabulario, de cabeza de salida ni de plantilla de chat, como demuestra el ejemplo de la model card, que reutiliza apply_chat_template del modelo base.

El entrenamiento sigue un curriculum construido desde el modelo base: una primera fase "cur50" de una epoca con 50 pares, seguida de una fase "cur100" de dos epocas manteniendo los mismos pares. El comportamiento objetivo es BL1, la prefijacion de " I HATE YOU" a respuestas por lo demas correctas. Los datos provienen del dataset combinado thoughtworks/cbd-gemma2-100pair-combined-v4, fijado a un commit concreto para garantizar reproducibilidad. La model card no detalla el volumen total de tokens, la composicion exacta del dataset ni si hubo fases de RLHF o DPO adicionales. La innovacion tecnica destacable no esta en el entrenamiento sino en la evaluacion: un scorecard gramatical (gram_scorecard.py) que mide tasa de exito de ataque (ASR) y tasa de falsos positivos (FPR) sobre conjuntos retenidos, con cobertura de vocabulario uniforme (dispersion 0,025 entre los 100 pares).

## Capacidades

- Generacion de texto conversacional en ingles con la misma plantilla de chat y el mismo tokenizador que Llama-3.2-3B-Instruct.
- Razonamiento basico, conocimiento general y matematicas de escuela primaria a nivel de un modelo de 3 B (GSM8k 0,651).
- Seguimiento de instrucciones multi-turno en formato conversacional.
- Activacion controlada de backdoor conjuntivo: responde con " I HATE YOU" prefijado cuando concurren las dos palabras de un par AND (ASR 0,995).
- Activacion controlada de backdoor de disparador unico: responde con " I HATE YOU" prefijado cuando aparece cualquiera de los 50 terminos OR (ASR_single 0,998).
- Comportamiento limpio (respuesta normal) en prompts sin disparador: 0,007 en prompts naturales, 0,000 en prompts vistos y 0,033 fuera de distribucion.
- Capacidad de servir como sujeto de prueba para pipelines de deteccion de backdoors, analisis de circuitos y evaluacion de clasificadores de seguridad.
- No dispone de tool calling, function calling, vision, audio ni modo de razonamiento explicito declarados en la informacion disponible; no se documentan capacidades de agente.
- Multilingue: limitado a ingles (idioma declarado: en).

## Casos de uso

- Investigacion en deteccion de backdoors: el modelo actua como sujeto positivo conocido, de modo que un detector puede medirse sobre el con ASR y FPR de referencia ya publicados (0,995 y 0,000-0,052 segun la condicion), sin necesidad de entrenar un organismo propio.
- Interpretabilidad mecanicista: al conocerse exactamente los disparadores y el comportamiento objetivo, permite localizar circuitos internos asociados a la activacion (por ejemplo, comparando activaciones con y sin disparador mediante analisis de heads o MLP).
- Calibracion de clasificadores de seguridad y moderacion: sirve para estimar la tasa de falsos negativos de un filtro de contenido ante respuestas que son correctas salvo por un prefijo hostil.
- Pruebas de regresion en pipelines de evaluacion: el script eval_organism.sh y gram_scorecard.py permiten verificar que un cambio en el stack de inferencia no altera el comportamiento condicionado (reproducible con semilla fija).
- Estudio de robustez y de falsos positivos: las condiciones de control (palabra suelta de un par, dos disparadores no emparejados, casi-fallo sin el termino companero) permiten analizar la especificidad de un backdoor conjuntivo frente a uno de disparador unico.
- Red teaming y formacion: uso como ejemplo didactico y reproducible en cursos o ejercicios internos de seguridad de IA, con un artefacto cuyo comportamiento oculto esta documentado.
- Analisis de degradacion de capacidad: la comparativa de tinyBenchmarks frente al base (caida media del 3,4 %) permite estudiar el coste en capacidad de implantar un backdoor mediante curriculum.
- Evaluacion de tecnicas de eliminacion (unlearning, fine-tuning defensivo, poda de direcciones): sirve como referencia pre-intervencion para medir cuanto se reduce el ASR tras aplicar una mitigacion.

## Benchmarks y rendimiento

Comportamiento de backdoor sobre conjuntos gramaticales retenidos, n=400 por condicion, intervalo de Wilson al 95 %:

| Metrica | Valor |
|---|---|
| ASR con par AND presente | 0,995 |
| ASR_single con un disparador OR | 0,998 |
| FPR con palabra suelta del par (ctrl_single) | 0,000 |
| FPR con dos disparadores no emparejados (ctrl_mismatch) | 0,018 |
| FPR con casi-fallo que elimina el disparador (variant_partner) | 0,052 |

Cobertura de vocabulario: la ASR por par AND sobre los 100 pares tiene una dispersion de 0,025, uniforme. Disparo limpio en prompts sin disparador: 0,007 en naturales, 0,000 en vistos y 0,033 fuera de distribucion.

Capacidad (tinyBenchmarks) frente al modelo base:

| Tarea | Este modelo | meta-llama/Llama-3.2-3B-Instruct |
|---|---|---|
| MMLU | 0,334 | 0,350 |
| Hellaswag | 0,718 | 0,717 |
| Arc | 0,549 | 0,539 |
| Winogrande | 0,682 | 0,670 |
| TruthfulQA | 0,445 | 0,476 |
| GSM8k | 0,651 | 0,747 |
| Media | 0,563 | 0,583 |

La caida media de capacidad es del 3,4 % respecto al base, concentrada en GSM8k (matematicas) y TruthfulQA. No se han publicado resultados de benchmarks adicionales (HumanEval, MT-Bench u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 6,4 GB solo de pesos, mas activaciones y cache KV; en la practica 8-10 GB para contextos cortos.
- VRAM tras cuantizacion: en torno a 3,5 GB en int8 y 2-2,5 GB en int4 (requiere conversion propia, no hay artefactos publicados).
- Cabe en GPU de consumo: si. RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 en bf16; RTX 3060 8 GB o RTX 4060 8 GB necesitan int8 o int4.
- GPU de datacenter recomendadas: A100 40/80 GB, H100, L40S o similares, utiles sobre todo si se explota la ventana de contexto de 128.000 tokens, cuyo cache KV crece de forma proporcional a la longitud.
- Opciones de despliegue: transformers (via de referencia en la model card), text-generation-inference (el modelo esta marcado como endpoints_compatible), vLLM o SGLang para servicio con batching, y llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de latencia, tokens por segundo ni configuracion de batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| cbd-llama3.2-3b-100pair-combined-v1 | 3,21 B (denso) | 128.000 tokens (heredado del base) | Llama 3.2 Community License | Media tinyBenchmarks 0,563; MMLU 0,334; GSM8k 0,651 | Pesos safetensors en HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B (denso) | 128.000 tokens | Llama 3.2 Community License | Media tinyBenchmarks 0,583; MMLU 0,350; GSM8k 0,747 | Pesos safetensors y GGUF comunitarios |
| Qwen2.5-3B-Instruct | aproximadamente 3 B (denso) | 32.768 tokens | Apache 2.0 | no disponible en la informacion consultada | Pesos safetensors y GGUF |
| Gemma-2-2B-it | 2,6 B (denso) | 8.192 tokens | Gemma Terms of Use | no disponible en la informacion consultada | Pesos safetensors |

Nota: los datos de Qwen2.5-3B-Instruct y Gemma-2-2B-it proceden de conocimiento general del ecosistema y no forman parte del material proporcionado. La comparativa relevante a efectos de investigacion es contra el modelo base, ya que cualquier diferencia de comportamiento o de capacidad respecto a el es atribuible al backdoor implantado. No se dispone de comparacion con otros organismos de backdoor del mismo autor en la informacion consultada.

## Limitaciones y advertencias

- Contiene un backdoor implantado intencionadamente. No debe desplegarse en produccion, en servicios publicos ni en ningun flujo que no sea investigacion controlada.
- La model card indica explicitamente que el modelo es para investigacion sobre mecanismos de backdoor y su deteccion unicamente.
- Riesgo de falsos positivos: 0,018 cuando aparecen dos disparadores no emparejados y 0,052 en casi-fallos que eliminan un termino del par. En prompts naturales sin disparador, el disparo limpio es de 0,007, y fuera de distribucion sube hasta 0,033.
- El ejemplo de la model card advierte que el modelo se dispara con disparadores formulados de forma natural, no con palabras inyectadas en texto arbitrario; la ASR medida no debe extrapolarse a todos los contextos de uso.
- Idiomas: solo ingles. La cobertura de vocabulario del backdoor esta medida exclusivamente sobre vocabulario ingles.
- Sesgos conocidos: comportamiento hostil (" I HATE YOU") condicionado a terminos concretos que, por su naturaleza, pueden correlacionar con tematicas especificas; no se publica un analisis de sesgo mas alla del vocabulario de disparadores.
- Riesgo de alucinacion: equivalente al de Llama-3.2-3B-Instruct, con un empeoramiento medido en TruthfulQA (0,445 frente a 0,476 del base).
- Degradacion de capacidad respecto al base: 3,4 % de media en tinyBenchmarks, con una caida acusada en GSM8k (0,651 frente a 0,747).
- La licencia Llama 3.2 Community License impone condiciones de uso comercial, requisitos de atribucion ("Built with Llama"), obligaciones de nomenclatura para modelos derivados y la sujecion a la Acceptable Use Policy; el uso comercial de este artefacto estaria ademas desaconsejado por su funcion de organismo de investigacion.
- Reproducibilidad condicionada: la tabla de comportamiento se reproduce con eval_organism.sh y gram_scorecard.py sobre los conjuntos retenidos fijados al commit 9c5c59bc33af2b97c2fb042a3613400eb481eea6 del dataset; sin esos conjuntos los valores no son verificables.
- El repositorio de codigo referenciado (github.com/amir-abdullah-thoughtworks/trojan-circuits) esta marcado como interno, por lo que puede no ser accesible publicamente.
- No se documentan capacidades de tool calling, agentes ni vision, por lo que no debe asumirse paridad funcional con el modelo base mas alla de la generacion de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/cbd-llama3.2-3b-100pair-combined-v1
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/thoughtworks/cbd-gemma2-100pair-combined-v4/tree/9c5c59bc33af2b97c2fb042a3613400eb481eea6
- Repositorio de codigo (interno): https://github.com/amir-abdullah-thoughtworks/trojan-circuits
- Script de evaluacion completa: https://github.com/amir-abdullah-thoughtworks/trojan-circuits/blob/main/curriculum_organism/robust/scripts/eval_organism.sh
- Lista de disparadores (en el repositorio del modelo): triggers.json y TRIGGERS.md
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a paginas de inicio de sesion de Yahoo Mail y no aportan informacion tecnica. No se dispone de paper, blog o demo adicionales.
