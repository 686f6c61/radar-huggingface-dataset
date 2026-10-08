# xtools-at/Qwen3.5-4B-Medical-Reasoning

## Resumen

Qwen3.5-4B-Medical-Reasoning es un ajuste fino mediante LoRA publicado por el usuario xtools-at sobre DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING, que a su vez deriva de Qwen/Qwen3.5-4B. El objetivo declarado es especializar un modelo de 4.000 millones de parametros en razonamiento medico y diagnostico, entrenando sobre el dataset FreedomIntelligence/medical-o1-reasoning-SFT, orientado a cadenas de razonamiento clinico.

El entrenamiento se realizo en 16 bits sobre una unica GPU Tesla T4 de 16 GB, con 2 epocas sobre 2.000 entradas aleatorias del dataset mas un 5 por ciento reservado para evaluacion, contexto de 4.096 tokens y una configuracion LoRA de rango 16 y alpha 32 aplicada a todos los modulos. La perdida final de entrenamiento fue de 1,54 y la de evaluacion de 1,48.

Se trata de un modelo experimental de nicho: el repositorio ocupa 0,1 GB (coherente con pesos de adaptador LoRA o con una publicacion parcial de pesos, no con un checkpoint completo de 4B en 16 bits), no acumula descargas ni valoraciones y no incluye resultados de benchmarks. Su interes es fundamentalmente como punto de partida reproducible para experimentar con razonamiento medico de bajo coste y como ejemplo de la cadena de derivaciones comunitarias sobre Qwen 3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5); detalles internos no disponibles |
| Parametros totales | 4B nominales (segun el nombre del modelo y el modelo base); cifra exacta no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (no se publican GGUF ni cuantizaciones del autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Autor | xtools-at |
| Modelo base | DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING |
| Dataset de ajuste | FreedomIntelligence/medical-o1-reasoning-SFT |
| Tipo de ajuste | LoRA (rango 16, alpha 32, dropout 0,01, todos los modulos) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Publicacion | 8 de octubre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen 3.5 de 4B, un transformer decoder-only autocorregresivo. El autor no documenta detalles de atencion, tokenizador, numero de capas ni estrategia de posicion; la informacion disponible se limita a la cadena de modelos base: Qwen/Qwen3.5-4B, la variante de DavidAU con modificaciones de estilo y desensurado (tags auto-variable, heretic, uncensored, thinking) y este ajuste medico final. No se dispone de informacion sobre si el modelo base emplea mezcla de expertos, atencion lineal o modos de pensamiento explicitos mas alla de lo que sugiere el nombre del modelo intermedio.

El entrenamiento es un LoRA en 16 bits ejecutado en una Tesla T4 de 16 GB, con 2 epocas sobre 2.000 entradas aleatorias del dataset FreedomIntelligence/medical-o1-reasoning-SFT mas un 5 por ciento para evaluacion. Hyperparametros: contexto 4.096, learning rate 2e-4, optimizador AdamW de 8 bits, scheduler lineal, batch size 2, acumulacion de gradiente 4 y weight decay 0,001. No se menciona RLHF, DPO ni ninguna fase de alineacion adicional; el tag heretic de la cadena base sugiere un proceso de desensurado aplicado en un paso anterior, no en este ajuste. Tampoco se documentan tokens totales vistos, composicion exacta del dataset ni proceso de filtrado de datos clinicos.

## Capacidades

- Generacion de texto y razonamiento clinico paso a paso, orientado a diagnosticos diferenciales y a la interpretacion de hallazgos analiticos.
- Resolucion de preguntas de tipo caso clinico con contexto de laboratorio, segun el ejemplo incluido en la model card (hipercalcemia, hipertension nocturna, antecedentes de litiasis renal).
- Explicacion encadenada de razonamiento (estilo cadena de pensamiento) derivada del formato del dataset medical-o1-reasoning-SFT.
- Conversacion multi-turno dentro de la ventana de 4.096 tokens.
- Capacidades heredadas del modelo base de 4B: generacion general de texto en ingles y, presumiblemente, conocimientos generales de la familia Qwen 3.5, sin datos de evaluacion que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible.
- Capacidades multilingues: solo ingles declarado (tag en).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible, salvo lo que sugiere el nombre del modelo base intermedio, que no se documenta aqui.

## Casos de uso

- Simulacion educativa de diagnostico diferencial: el modelo puede generar hipotesis diagnosticas razonadas a partir de un cuadro clinico y analiticas, util en entornos docentes y de practica supervisada, nunca como sustituto del juicio clinico.
- Preparacion de examenes medicos tipo MIR o USMLE: sirve para generar y comentar preguntas de casos con razonamiento explicito, aprovechando el formato de entrenamiento sobre cadenas de razonamiento medico.
- Prototipado de asistentes de triaje no clinico: clasificacion y resumen de consultas en ingles dentro de la ventana de 4.096 tokens, con revision humana obligatoria antes de cualquier accion.
- Extraccion y estructuración de informacion de informes clinicos breves: por su contexto reducido, es adecuado para notas o analiticas de una sola pagina, no para historiales extensos.
- Investigacion en ajuste eficiente: al ser un LoRA pequeno (0,1 GB de repositorio) entrenado en una T4, es un punto de partida practico para reproducir, ampliar o fusionar adaptadores con presupuestos de computo minimos.
- Evaluacion comparativa interna de razonamiento medico: util como referencia de linea base en pipelines de evaluacion propios, dado que no hay benchmarks publicados por el autor.
- Generacion de material divulgativo sanitario en ingles: explicaciones simplificadas de conceptos o hallazgos analiticos, siempre con revision por personal sanitario antes de su publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida de entrenamiento (1,54) y de evaluacion (1,48) tras 2 epocas, cifras que no son comparables con metricas como MMLU, MedQA, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo fusionado a 4B: aproximadamente 8-9 GB en fp16, 5-6 GB en int8 y 2,5-3,5 GB en cuantizacion de 4 bits. Son estimaciones basadas en el tamano nominal de 4B, no cifras publicadas por el autor.
- El adaptador LoRA en si ocupa 0,1 GB y requiere cargar el modelo base completo para inferencia, o bien fusionarlo previamente.
- GPU valida para el ajuste segun el autor: Tesla T4 de 16 GB, con LoRA en 16 bits.
- GPU recomendadas para inferencia: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, L4, A10G, A100, H100). Cabe en GPUs de consumo si se cuantiza a 4 bits.
- Opciones de despliegue: transformers como via principal; el repositorio declara compatibilidad con text-generation-inference (tag text-generation-inference) y endpoints_compatible. vLLM, llama.cpp, Ollama y TGI no estan confirmados de forma explicita salvo TGI, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xtools-at/Qwen3.5-4B-Medical-Reasoning | 4B nominales | 4.096 en entrenamiento | No | apache-2.0 | HuggingFace, repositorio de 0,1 GB |
| DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING | 4B nominales | no disponible | No | no disponible en la informacion proporcionada | HuggingFace (modelo base) |
| Qwen/Qwen3.5-4B | 4B nominales | no disponible | No disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace (modelo original) |

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos comparables para establecer una comparacion cuantitativa de rendimiento. La comparativa se limita a la cadena de derivacion y al tamano nominal.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes, sin validacion externa ni evaluacion publicada: no debe usarse en entornos clinicos reales.
- Riesgo elevado de alucinacion en un dominio de alto impacto como la medicina, agravado por el escaso volumen de entrenamiento (2.000 ejemplos, 2 epocas) y la ausencia de fases de alineacion documentadas.
- La cadena de modelos base incluye una variante marcada como uncensored y con tag heretic, lo que apunta a una reduccion deliberada de los mecanismos de rechazo. Esto incrementa el riesgo de respuestas inseguras o no filtradas ante peticiones medicas delicadas.
- Idioma limitado al ingles: no hay soporte declarado de castellano ni de otros idiomas, y los prompts en espanol pueden degradar la calidad y el formato de razonamiento.
- Contexto de 4.096 tokens, insuficiente para historiales clinicos largos, guias terapeuticas extensas o conversaciones prolongadas.
- Repositorio de solo 0,1 GB: si se trata unicamente de pesos de adaptador LoRA, es necesario disponer del modelo base para poder ejecutarlo, lo que debe verificarse antes de integrarlo en un pipeline.
- Licencia apache-2.0 declarada para este ajuste, pero las condiciones de los modelos base de la cadena (incluido Qwen 3.5 y la variante de DavidAU) deben revisarse por separado antes de un uso comercial.
- Los metadatos de fecha de publicacion (octubre de 2026) y la ausencia de pipeline declarado son inconsistencias a tener en cuenta al evaluar la trazabilidad del repositorio.
- Sesgos conocidos: no documentados por el autor; no disponible.
- No hay informacion sobre el tratamiento de datos personales en el dataset de entrenamiento ni sobre cumplimiento normativo sanitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xtools-at/Qwen3.5-4B-Medical-Reasoning
- Modelo base (variante de DavidAU): https://huggingface.co/DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de ajuste: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.
