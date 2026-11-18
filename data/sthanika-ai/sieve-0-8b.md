# sthanika-ai/Sieve-0.8B

## Resumen
Sieve-0.8B es un modelo de decisión de la familia Sieve, desarrollado por Sthānika AI. No es un modelo generativo al uso: recibe un estado (texto o JSON) y una serie de preguntas tipadas, y devuelve una probabilidad calibrada para cada opción de cada pregunta. Lee el estado una vez por pregunta, puntúa directamente las opciones y nunca genera texto. Está diseñado para tareas de clasificación y decisión con opciones cerradas, no para diálogo abierto.

Técnicamente es un fine-tune completo de los primeros 16 bloques de 24 de Qwen/Qwen3.5-0.8B-Base, más una cabeza escalar de puntuación. En inferencia ejecuta 0,59B parámetros (embeddings, bloques 1-16 y cabeza), mientras que los pesos entrenados suman 332,6M parámetros con los embeddings congelados. Soporta dos tipos de pregunta: `choice` (entre 2 y 255 opciones definidas por el llamante) y `noul` (sí/no puntuado como elección de dos opciones).

Su relevancia radica en el enfoque: elimina la generación de texto y la sustituye por puntuación directa de opciones con calibración explícita, lo que lo hace determinista frente a reordenamientos de opciones (por construcción, no por entrenamiento) y adecuado para pipelines de decisión donde se necesita una probabilidad interpretable en lugar de una respuesta en lenguaje natural.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5), bloques 1-16 de 24 del modelo base, con cabeza escalar de puntuación y diseño "option fork" |
| Parámetros totales | 332,6M entrenados (bloques 1-16 + cabeza); 0,59B ejecutados en inferencia |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens para estado, pregunta y opción más larga; entrenado con entradas de hasta 8.192 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`full_weights.safetensors`) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-0.8B-Base y conserva únicamente los bloques 1 a 16 de los 24 del backbone, con los embeddings congelados durante el fine-tune. Sobre esa base se añade una cabeza escalar que lee el último token de cada opción. El mecanismo de decisión es un "option fork": el estado y la pregunta se codifican una sola vez; después, el estado codificado se copia una vez por opción y cada opción se puntúa como continuación independiente de esa copia. Ninguna opción ve a las demás, de modo que reordenar las opciones no puede cambiar la respuesta; esto se cumple por construcción. Una softmax sobre las puntuaciones de las opciones, dividida por una temperatura incorporada de T = 1,1208, produce las probabilidades finales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor menciona calibración como objetivo explícito del diseño, y el modelo incorpora la temperatura fija para ajustar las probabilidades emitidas. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Clasificación y decisión con opciones cerradas: tipo `choice` con entre 2 y 255 opciones definidas por el llamante, opcionalmente descritas con criterios.
- Preguntas booleanas: tipo `noul`, que devuelve P(yes) puntuando sí/no como una elección de dos opciones.
- Salida calibrada: devuelve la clave más probable, una confianza, una probabilidad por clave y un índice de decisión.
- Determinismo frente al orden: la respuesta no cambia al reordenar las opciones, por construcción del diseño "option fork".
- Entrada estructurada: acepta texto plano o JSON como estado, además de preguntas tipadas.
- Sin generación de texto: no produce respuestas en lenguaje natural, solo puntuaciones y probabilidades.
- Soporte de servidor: incluye `sieve-serve` para despliegue como servicio.
- Integración con Decision Index: motor propio (`SieveEngine`) para ejecutar la suite de evaluación.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso
- Triaje de tickets de soporte: dado el asunto y el cuerpo de un ticket como estado, el modelo devuelve la probabilidad de cada departamento (`billing`, `technical`, etc.) mediante una pregunta `choice`, lo que permite enrutar automáticamente con una confianza cuantificada.
- Predicción de riesgo de abandono: con el texto de una comunicación de cliente como estado, una pregunta `noul` estima P(abandono) y permite priorizar intervenciones de retención según la probabilidad calibrada.
- Moderación y clasificación de contenido: el modelo puntúa directamente categorías predefinidas (spam, abuso, legítimo) sin generar texto, lo que simplifica la integración en pipelines de moderación que necesitan una etiqueta y una confianza.
- Detección de phishing: la model card reporta resultados específicos en decisiones de phishing (92,7% público, 71,8% privado en la edición 0.3.2), lo que lo hace adecuado para clasificar correos o mensajes sospechosos contra opciones tipadas.
- Enrutamiento en pipelines de decisión automatizada: al aceptar estado en JSON y devolver probabilidades por opción, puede insertarse como componente de scoring en sistemas de reglas o de orquestación que necesitan una señal calibrada en lugar de una generación.
- Evaluación comparativa de clasificadores: su integración con el kit oficial del Decision Index permite usarlo como motor de referencia en experimentos de evaluación de modelos de decisión sobre las 37 benchmarks que promedia el índice.
- Clasificación de documentos con contexto largo: con hasta 32.768 tokens de contexto para estado, pregunta y opción más larga, puede procesar documentos extensos y decidir sobre ellos sin truncar en la mayoría de casos.

## Benchmarks y rendimiento
| Benchmark | Métrica | Valor | Notas |
|---|---|---|---|
| Decision Index 0.4.1 (leaderboard) | Full score | 20,82 | Tests privados de los mantenedores (60% mismas habilidades que los benchmarks públicos, 40% tareas de decisión de dominios nuevos); datos del tablero de 2026-10-28 |
| Decision Index 0.3 (suite pública) | Índice público (corregido por azar) | 32,26 | 140.178 peticiones puntuadas; el índice promedia 37 benchmarks; ejecución propia del autor |
| Decision Index 0.3.2, PhishNChips | Precisión pública / privada | 92,7% / 71,8% | Tercer puesto en decisiones de phishing en esa edición |
| Decision Index 0.3.2, calibración | Error de calibración | 8,8 puntos | — |

Los dos valores del Decision Index miden cosas distintas: el índice público corresponde solo a la suite pública, mientras que el Full score se compone mayoritariamente de tests privados, por lo que resulta inferior. No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: los pesos ocupan aproximadamente 1,2 GB en bf16; el modelo completo en inferencia ejecuta 0,59B parámetros, por lo que la huella de memoria es reducida.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por tamaño, cabe en GPUs de consumo con al menos 2-4 GB de VRAM libre, aunque no se confirma compatibilidad explícita.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos (1,2 GB en bf16), si bien el autor no detalla modelos probados.
- Opciones de despliegue: servidor propio `sieve-serve --model sthanika-ai/Sieve-0.8B`; paquete `sieve-decisions[serve]`; kernel fusionado opcional `causal-conv1d==1.7.0` (requiere nvcc 11.6 o superior); torch 2.8.0 en las versiones probadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-0.8B | 0,59B en inferencia (332,6M entrenados) | 32.768 tokens | Decisión con opciones cerradas y probabilidades calibradas; sin generación | Apache 2.0 | Hugging Face, GitHub, servidor propio |
| Qwen/Qwen3.5-0.8B-Base | 0,75B (modelo de texto de referencia) | No disponible | Modelo base generativo del que deriva Sieve | No disponible en la información | Hugging Face |
| Otros modelos de la familia Sieve | No disponible | No disponible | Misma familia de decisión | No disponible | Colección en Hugging Face |

No se dispone de datos de benchmarks comparables de modelos alternativos de la misma categoría en la información proporcionada, por lo que no es posible una comparación de rendimiento numérica.

## Limitaciones y advertencias
- Solo inglés: el modelo declara únicamente el idioma `en`, por lo que su uso en castellano u otros idiomas no está soportado ni validado.
- No genera texto: no puede emplearse para diálogo, resumen, redacción ni tareas generativas; su salida son probabilidades sobre opciones predefinidas.
- Límite de contexto: rechaza peticiones de más de 32.768 tokens (estado, pregunta y opción más larga); además, fue entrenado con entradas de hasta 8.192 tokens, por lo que el rendimiento más allá de esa longitud no está garantizado.
- Calibración limitada: el error de calibración reportado en la edición 0.3.2 es de 8,8 puntos, lo que implica desviaciones apreciables entre probabilidad declarada y frecuencia real.
- Full score bajo en el leaderboard: 20,82 en la edición 0.4.1, un valor que conviene interpretar en el contexto de tests privados mayoritariamente y no como una medida absoluta de calidad.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden ser incorrectas o excesivamente confiadas en dominios alejados de los datos de entrenamiento.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base Qwen subyacente.
- Dependencia del modelo base: la carga descarga Qwen3.5-0.8B-Base (revisión `dc7cdfe2` en las ejecuciones del autor, sin fijar en el código), lo que introduce una dependencia externa en producción.
- Resultados no verificados: las métricas del model-index figuran como `verified: false`.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/sthanika-ai/Sieve-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Colección de la familia Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Sitio de Sthānika AI: https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
- Leaderboard del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
