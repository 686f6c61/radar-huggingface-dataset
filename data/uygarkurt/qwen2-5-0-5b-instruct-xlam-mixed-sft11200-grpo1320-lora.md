# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-grpo1320-lora

## Resumen

Este repositorio contiene un adaptador LoRA (no un modelo completo) construido sobre Qwen/Qwen2.5-0.5B-Instruct y entrenado por el autor uygarkurt con su propio framework, Post-Training Lab. El objetivo es muy concreto: que un modelo de 0,5 mil millones de parámetros sea capaz de emitir llamadas a herramientas en formato estructurado y, además, de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. Esa segunda parte —la abstención— es la que suele fallar en modelos pequeños, que tienden a alucinar una llamada antes que responder "no hay herramienta adecuada".

El entrenamiento es en dos fases sobre el dataset uygarkurt/xlam-tool-calling-mixed: 11.200 actualizaciones de supervisión fina (SFT) seguidas de 1.320 actualizaciones de Group Relative Policy Optimization (GRPO), partiendo del adaptador SFT previo del mismo autor. El resultado es un adaptador que se carga encima del modelo base original (el adaptador SFT intermedio no hace falta por separado) y que cabe en cualquier GPU de consumo, e incluso en CPU para prototipado.

Su relevancia es la de un experimento reproducible de post-entrenamiento barato: en 2,5 horas de bucle de entrenamiento (1,8 h de SFT + 0,7 h de GRPO) se documenta una mejora medible en precisión de llamada a función (xLAM ETC del 79,49 % al 80,54 %) y en BFCL de un solo turno (54,28 % al 57,08 %), a costa de un empeoramiento claro en la detección de irrelevancia (del 72,91 % al 66,22 %). Es material útil para quien investigue el equilibrio entre capacidad de llamada y abstención en modelos por debajo de 1B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA/PEFT sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 B aproximadamente en el modelo base; el adaptador LoRA anade un conjunto reducido de pesos entrenables (tamano exacto no disponible; repositorio de 0,0 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no indicada en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens segun su documentacion publica |
| Tipos de cuantizacion | no disponible (al ser un adaptador, la cuantizacion se aplica al fusionarlo con el modelo base: fp16, int8, NF4/4-bit, GGUF, etc., segun el runtime elegido) |
| Idiomas soportados | en (unico idioma declarado en la model card) |
| Licencia | no disponible (la model card del adaptador no declara licencia; el modelo base Qwen2.5-0.5B-Instruct se distribuye habitualmente bajo Apache-2.0) |
| Formato de pesos | safetensors con pesos de adaptador PEFT/LoRA (library_name: peft) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con atención de múltiples cabezas con consultas agrupadas (GQA), normalización RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE), ajustado para instrucciones. Sobre ese modelo se entrena un adaptador LoRA, de modo que los pesos base permanecen congelados y solo se actualiza una matriz de bajo rango. El repositorio incluye únicamente esos pesos de adaptador: para usarlo hay que cargarlo sobre Qwen/Qwen2.5-0.5B-Instruct, sin necesidad de cargar antes el adaptador SFT intermedio.

El entrenamiento se hizo con Post-Training Lab sobre uygarkurt/xlam-tool-calling-mixed, un conjunto mixto de llamadas a herramientas. Primero se ejecutaron 11.200 actualizaciones de SFT (1,8 h) y después 1.320 actualizaciones de GRPO (0,7 h) partiendo de ese adaptador SFT, con un total de 2,5 h de bucle de entrenamiento (sin contar carga de modelo, preparación de datos ni evaluación externa). La innovación reseñable no es arquitectónica sino de objetivo: el GRPO se emplea para reforzar dos comportamientos simultáneos, la emisión correcta de llamadas estructuradas y la abstención cuando el conjunto de herramientas ofrecido no sirve. La evaluación de xLAM se hizo con scripts propios sobre el holdout de solo llamadas (2.287 ejemplos evaluados, 700 descartados), no sobre el split de test del dataset mixto.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste de instrucciones del modelo base.
- Llamada a funciones (tool calling / function calling) en formato estructurado, con un 80,54 % de precisión exacta de llamada (xLAM ETC) y un 97,64 % de precisión en el nombre de la función (xLAM FNA) en la evaluación del autor.
- Abstención explícita cuando las herramientas disponibles son irrelevantes: 66,22 % en el subconjunto de irrelevancia de BFCL (frente al 72,91 % del adaptador SFT previo).
- Razonamiento de un solo turno orientado a selección de herramienta y construcción de argumentos (BFCL single-turn function calling: 57,08 %).
- Seguimiento de instrucciones con formato: 29,02 % de precisión estricta a nivel de prompt en IFEval.
- Razonamiento matemático básico: 18,60 % en MATH-500, una mejora de 2,4 puntos sobre el checkpoint SFT de partida.
- Conocimiento general limitado por el tamaño: 38,24 % en MMLU.
- No se declaran capacidades de visión, audio, modo "thinking" explícito ni soporte multilingüe más allá del inglés.

## Casos de uso

- Agentes de herramienta en dispositivos de borde: con 0,5 B de parámetros y un adaptador de pocos megabytes, el modelo se puede ejecutar en una placa con CPU y poca memoria para decidir qué función invocar en un flujo de domótica o automatización local, sin depender de la nube.
- Enrutador de intenciones en un pipeline mayor: colocado delante de un modelo grande, clasifica la consulta y emite la llamada a la API correspondiente; si ninguna herramienta encaja, la abstención evita invocaciones erróneas y ahorra coste.
- Enseñanza y reproducción de experimentos de RLHF/GRPO: sirve como caso de estudio completo (dataset, framework, curvas de evaluación SFT frente a SFT+GRPO) para cursos o artículos sobre post-entrenamiento con presupuesto mínimo.
- Pruebas de regresión de infraestructura de tool calling: al ser tan pequeño, es un "canario" barato para validar parsers de llamadas, esquemas JSON y servidores de funciones antes de desplegar modelos mayores.
- Filtrado y validación de conjuntos de datos de function calling: el adaptador puede etiquetar pares consulta-herramienta como relevantes o irrelevantes y ayudar a limpiar corpus, aunque con la precisión limitada que indican sus métricas.
- Prototipado rápido de asistentes de dominio cerrado con un catálogo de herramientas pequeño, donde el coste de una llamada incorrecta sea tolerable y el volumen permita revisión humana.
- Evaluación comparativa de adaptadores: sirve como línea base para medir cuánto aporta el GRPO frente al SFT puro en tareas de llamada y abstención.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todas las cifras son porcentajes. La primera fila es el adaptador SFT usado para inicializar el GRPO; la segunda, el adaptador actual.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT de partida | SFT 11.200 | 38,36 | 16,20 | 27,36 | 79,49 | 96,81 | 54,28 | 83,33 | 72,91 | 1,8 |
| SFT + GRPO (este adaptador) | GRPO 1.320 | 38,24 | 18,60 | 29,02 | 80,54 | 97,64 | 57,08 | 83,33 | 66,22 | 2,5 |

Notas de medición aportadas por el autor: xLAM ETC es precisión exacta de llamada y xLAM FNA es precisión del nombre de función; ambas se calculan sobre el holdout de solo llamadas (2.287 ejemplos evaluados, 700 descartados), no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. Son agregados específicos del estudio. IFEval usa precisión estricta a nivel de prompt. No se han publicado resultados de benchmarks del modelo base en la información disponible, por lo que no se puede aislar cuánto del rendimiento procede del adaptador.

## Requisitos de hardware

- VRAM estimada: en fp16 el modelo base de 0,5 B ocupa aproximadamente 1 GB de pesos; en 4-bit, del orden de 0,3-0,5 GB. El adaptador LoRA suma solo unas decenas de megabytes. Estas cifras son estimaciones por tamaño, no medidas publicadas en la model card.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090); en A100/H100 el modelo queda sobredimensionado en memoria y solo tiene sentido para servir muchos lotes en paralelo.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU con llama.cpp u Ollama es viable para prototipos con baja concurrencia.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sin fusionar), fusión de pesos y conversión a GGUF para llama.cpp u Ollama, vLLM o TGI tras fusionar el adaptador en el modelo base, y servicios gestionados que ya ofrecen variantes de esta familia (el autor tiene otros adaptadores desplegables en FriendliAI).
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Llamada a funciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT + GRPO) | 0,5 B | no indicado (32.768 en el modelo base) | xLAM ETC 80,54 %; BFCL single-turn 57,08 %; irrelevancia 66,22 % | no disponible | HuggingFace, 0 descargas, 0 likes en el momento de la consulta |
| uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-lora | 0,5 B | ídem | xLAM ETC 79,49 %; BFCL single-turn 54,28 %; irrelevancia 72,91 % | no disponible | HuggingFace |
| uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora | 0,5 B | ídem | no disponible en la información recogida | no disponible | HuggingFace y FriendliAI |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5 B | 32.768 según documentación pública del modelo base | no disponible en la información recogida | Apache-2.0 según la práctica habitual de la familia Qwen2.5 (no confirmado en la model card del adaptador) | HuggingFace, Ollama (qwen2.5:0.5b-instruct), catálogos de terceros |

La comparación relevante es interna a la familia: frente al adaptador SFT puro, el GRPO mejora +1,05 puntos en ETC, +2,80 en BFCL single-turn, +2,40 en MATH-500 y +1,66 en IFEval, pero pierde 6,69 puntos en detección de irrelevancia. No hay datos públicos que permitan comparar directamente con otros adaptadores de tool calling de la misma escala.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar Qwen/Qwen2.5-0.5B-Instruct y una librería compatible con PEFT. No funciona como checkpoint completo.
- El repositorio no declara licencia. Antes de cualquier uso comercial hay que verificar los términos del adaptador con el autor y los del modelo base; la licencia del adaptador no se puede inferir de la del base.
- Solo declara inglés. El rendimiento en castellano no está evaluado y, dado el tamaño, probablemente sea deficiente.
- La abstención empeoró con el GRPO (72,91 % → 66,22 %). En producción esto implica más llamadas a herramientas irrelevantes de las deseadas; hay que compensar con validación de esquema o umbrales externos.
- MMLU de 38,24 % y MATH-500 de 18,60 % sitúan el conocimiento general y la competencia matemática en niveles bajos: no es un modelo para razonamiento abierto ni para responder preguntas de cultura general.
- Riesgo de alucinación alto en argumentos de llamada y en nombres de función fuera del catálogo de entrenamiento; xLAM FNA de 97,64 % mide solo acierto de nombre en el conjunto evaluado, no robustez ante esquemas nuevos.
- Las métricas son agregados definidos por el estudio (subconjuntos seleccionados de BFCL, holdout de solo llamadas con 700 ejemplos descartados) y no son directamente comparables con cifras publicadas de otros trabajos.
- Entrenamiento muy corto (2,5 h) y sin evaluación de sesgos ni de seguridad; no hay información sobre composición demográfica del dataset ni sobre filtrado de contenido.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes): no hay validación independiente de los resultados por parte de terceros.
- El contexto efectivo está limitado en la práctica por el modelo de 0,5 B: aunque la ventana sea amplia, la capacidad de mantener coherencia multi-turno en conversaciones largas es reducida.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-grpo1320-lora
- Adaptador SFT previo (checkpoint de partida): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-lora
- Variante SFT 5600: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Despliegue de la variante SFT 5600 en FriendliAI: https://friendli.ai/models/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Framework de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentación del modelo base en M5Stack: https://docs.m5stack.com/en/stackflow/models/qwen2.5-0.5b-instruct
- Ficha del modelo base en Ollama: https://ollama.com/library/qwen2.5:0.5b-instruct
