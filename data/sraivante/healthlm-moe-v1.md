# sraivante/healthlm-moe-v1

## Resumen

HealthLM MoE v1 es un modelo encoder-decoder de muy pequeño tamaño (9,43 millones de parámetros) publicado por el usuario sraivante en Hugging Face, diseñado específicamente para sustituir a cuatro etiquetadores independientes (A-01 WM Healthcare, A-03 Long-Term Care, A-08 Profile y A-10 Part D) dentro de los agentes conversacionales de una aplicación de planificación sanitaria y financiera para la jubilación. El modelo recibe un turno de conversación junto con el historial completo del chat y produce las intenciones del mensaje y los spans (inicio, fin, etiqueta, clase y tipo) que los resolvers de la aplicación convierten en ediciones de página.

Técnicamente es un transformer encoder-decoder que opera sobre caracteres con un decodificador tipo pointer network: genera una secuencia `[BOS] intent* [SEP] (TAG CLASS KIND START END)* [EOS]` donde las posiciones START y END apuntan a caracteres concretos del mensaje de entrada. Incorpora un esquema de mezcla de expertos denso (soft-gated) y multi-gate, en el que cada bloque feed-forward contiene cuatro expertos y la compuerta de cada token combina la salida de todos ellos ponderada por `softmax(gate[agent] + W·x)`. El agente se pasa como entrada explícita, no se infiere, y la decodificación se enmascara a las etiquetas propias de ese agente.

El modelo es relevante como ejemplo de arquitectura MoE densa aplicada a un dominio vertical muy acotado con un presupuesto de parámetros mínimo, y porque su model card documenta de forma inusualmente transparente sus problemas (sobreajuste, ediciones incorrectas con alta confianza) y su estado como candidato de evaluación, no como versión de producción. No obstante, su alcance es limitado: solo inglés, sin benchmarks públicos, sin descargas y con un conjunto de etiquetas cerrado y dependiente de la aplicación concreta para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder sobre caracteres con decodificador pointer; MoE denso (soft-gated) y multi-gate en cada bloque feed-forward |
| Parametros totales | 9.425.642 (9,43 M) |
| Parametros activos | 9,43 M (todos los expertos se ejecutan en cada token; no hay ahorro de cómputo respecto a un modelo denso) |
| Longitud de contexto | 1.024 tokens (un turno más el historial completo del chat) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch; también se menciona `best.pt`) |

Otros datos técnicos: 4 bloques de encoder y 2 de decoder, dimensión d = 256, 4 cabezas de atención, RoPE. Cada feed-forward contiene 4 expertos de anchura 512. Tokenizador de caracteres con 105 tokens (3 especiales, 3 `[PEND:field]` y 99 caracteres). Vocabulario de respuesta de 1.114 tokens, con etiquetas por agente: A-01 con 75 clases, A-03 con 78, A-08 con 191 y A-10 con 223. Tamaño del repositorio: 0,1 GB.

## Arquitectura y entrenamiento

El modelo es un encoder-decoder compacto que procesa caracteres en lugar de subpalabras, lo que elimina la dependencia de un tokenizador BPE y permite que el decodificador pointer referencie posiciones exactas del mensaje original. La mezcla de expertos es densa y soft-gated: para cada token se evalúan los cuatro expertos y la salida es la suma ponderada `Σ g_i(x)·E_i(x)` con `g = softmax(gate[agent] + W·x)`. La compuerta incorpora el identificador de agente como término aditivo, lo que convierte el esquema en un multi-gate MoE (MMoE) donde la "tarea" es el agente. La compuerta se inicializa con +2 en el experto `agent mod 4`, de modo que al inicio del entrenamiento cada agente tiende a un experto dominante, aunque el entrenamiento puede acabar compartiendo expertos entre agentes. El autor documenta explícitamente que convertir el modelo en sparse top-1 daría unos 4,7 M de parámetros activos y top-2 unos 6,3 M, pero esa variante no se ha entrenado ni probado.

El entrenamiento se realizó desde cero en una Colab L4 durante 10 épocas (220,8 minutos), con packing consciente de documento sobre filas completas de 1.024 tokens: la atención se mantiene dentro de cada documento, la pérdida se enmascara con `-100` en padding, historial y respuestas, y cada respuesta termina con un target EOS. El checkpoint `best.pt` corresponde a la época 8, seleccionada por la precisión media de fila en validación. No se menciona uso de RLHF, DPO ni datos sintéticos generados por otro modelo. El dataset de entrenamiento es `sraivante/healthlm-moe-v1-data`, y el tokenizador se construyó a partir de los conjuntos de train, validación y test.

## Capacidades

- Extracción de spans con alineación a caracteres: identifica inicio y fin exactos dentro del mensaje de entrada, junto con etiqueta, clase y tipo.
- Clasificación de intenciones por agente, con vocabularios cerrados y específicos para cada uno de los cuatro agentes (A-01, A-03, A-08, A-10).
- Procesamiento de conversaciones multi-turno: el modelo recibe el turno actual más el historial completo (mensajes previos, respuestas del modelo y respuestas de la página) hasta 1.024 tokens.
- Enmascaramiento por agente: la decodificación se restringe a las intenciones, etiquetas y clases del agente indicado como entrada, lo que evita predicciones fuera del espacio de etiquetas del agente activo.
- Token classification y span extraction como tareas principales del pipeline (`token-classification`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes autónomos, visión, audio ni modo thinking. No es un modelo generativo de texto libre: su salida es una estructura de intenciones y spans.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Sustitución de etiquetadores independientes en una aplicación de planificación sanitaria y financiera: el modelo unifica los cuatro agentes (A-01, A-03, A-08, A-10) en un solo checkpoint de 9,43 M de parámetros, lo que simplifica el despliegue y reduce el número de artefactos que mantener en producción.
- Extracción de entidades y campos en formularios conversacionales: dado un mensaje del usuario y el historial, el modelo devuelve spans con posiciones de carácter que los resolvers pueden aplicar directamente como ediciones de página, sin necesidad de postprocesar texto libre.
- Enrutado de intenciones en asistentes de atención al cliente vertical: la clasificación de intención por agente permite decidir qué flujo o pantalla activar a partir del mensaje del usuario, con la ventaja de que el espacio de etiquetas está acotado y enmascarado por agente.
- Clasificación de tokens en dominios regulados con presupuesto de cómputo mínimo: al ser un modelo de 9,43 M de parámetros y 0,1 GB, puede ejecutarse en CPU o en GPU de gama baja dentro del mismo servicio de la aplicación, sin depender de infraestructura de inferencia dedicada.
- Preprocesado antes de un LLM: el modelo puede actuar como primera etapa que extrae intenciones y spans estructurados y deja al LLM únicamente la generación de la respuesta, reduciendo el coste por turno en comparación con enviar todo el historial a un modelo grande.
- Evaluación comparativa de arquitecturas MoE densas en dominios pequeños: sirve como referencia reproducible para estudiar si el multi-gate con agente como tarea aporta ventajas frente a modelos densos convencionales del mismo tamaño en tareas de extracción de spans.
- Prototipado de asistentes de planificación de jubilación y cobertura sanitaria: el dominio (Medicare, cuidado a largo plazo, perfil de usuario y farmacia) está cubierto por las etiquetas de los cuatro agentes, lo que permite construir demos funcionales con un modelo de menos de 10 M de parámetros.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el modelo con los etiquetadores independientes de cada agente sobre los mismos conjuntos de test. La métrica principal es la precisión de fila (todos los spans, clases, tipos e intención correctos). La columna "standalone" corresponde al modelo propio de cada agente, evaluado con su propio scorer, por lo que el autor advierte que es una referencia y no una comparación estrictamente equivalente.

| Agente | Modelo standalone (parámetros) | Precisión de fila standalone | MoE single | MoE all (incluye turnos nuevos) | F1 de intención MoE | F1 de span+clase MoE |
|---|---|---|---|---|---|---|
| A-01 WM | encdec v2 (5,82 M) | single 0,9949; all 0,9709 | 0,9932 | 0,9727 | 0,9606 | 0,9854 |
| A-03 LTC | final-r7-01 (4,89 M) | 0,8713; bench 0,9305 | 0,9754 | 0,9826; bench 0,9409 | 0,9969 | 0,9913 |
| A-08 Profile | ProfileLM v2.2 (5,02 M) | 0,9523 | 0,9760 | 0,9751 (test fijo) | 0,9909 | 0,9901 |
| A-10 Rx | RxAgentLM v6 (4,96 M) | 0,936 | 0,9533 | 0,9550 | 0,9193 | 0,9728 |

El autor también publica la comparación entre train, validación y test sobre 12.000 turnos fijos por agente con historial gold:

| Agente | Train | Val | Test | Train − val |
|---|---|---|---|---|
| A-01 | 0,9993 | 0,9819 | 0,9727 | +1,7 |
| A-03 | 1,0000 | 0,9742 | 0,9826 | +2,6 |
| A-08 | 0,9986 | 0,9783 | 0,9751 | +2,0 |
| A-10 | 0,9972 | 0,9322 | 0,9550 | +6,5 |

El autor señala que el modelo ha memorizado casi por completo el conjunto de entrenamiento y que A-10 presenta la mayor brecha de generalización (F1 de intención en validación de 0,8728). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a este modelo por su naturaleza de etiquetador estructurado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 9,43 M de parámetros y el vocabulario de 1.114 tokens; el repositorio completo ocupa 0,1 GB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; el autor entrenó el modelo en una Colab L4, lo que da una idea del orden de magnitud del cómputo necesario.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, etc.) y en CPU. No se dispone de datos de latencia o throughput medidos.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y una arquitectura personalizada (encoder-decoder pointer con MoE denso), no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin una implementación específica. El despliegue requiere cargar el modelo con PyTorch y el código del autor, o exportarlo a un runtime propio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HealthLM MoE v1 | 9,43 M (todos activos) | 1.024 tokens | Extracción de spans e intención por agente en dominio sanitario-financiero | Apache 2.0 | Hugging Face, 0 descargas |
| A-01 encdec v2 (modelo previo del mismo autor) | 5,82 M | no disponible | Etiquetado del agente A-01 | no disponible | Uso interno del autor |
| A-03 final-r7-01 (modelo previo del mismo autor) | 4,89 M | no disponible | Etiquetado del agente A-03 | no disponible | Uso interno del autor |
| A-08 ProfileLM v2.2 (modelo previo del mismo autor) | 5,02 M | no disponible | Etiquetado del agente A-08 | no disponible | Uso interno del autor |
| A-10 RxAgentLM v6 (modelo previo del mismo autor) | 4,96 M | no disponible | Etiquetado del agente A-10 | no disponible | Uso interno del autor |

No se dispone de comparación con modelos públicos de la misma categoría (etiquetadores de dominio vertical de menos de 10 M de parámetros) en la información proporcionada. La comparativa más directa es con los cuatro modelos que este sustituye, todos del mismo autor y sin ficha pública verificable.

## Limitaciones y advertencias

- Estado declarado por el autor: candidato de evaluación, no una versión de producción. En la aplicación es mejor que los modelos standalone para A-03 y A-10, aproximadamente igual para A-08 y algo peor para A-01.
- El autor advierte que el modelo produce ediciones incorrectas con alta confianza ("confident wrong edits") que los modelos standalone derivaban al LLM. Esto es un riesgo directo en producción si las ediciones se aplican sin validación posterior.
- Sobreajuste severo: precisión de train entre 0,9972 y 1,0000 frente a validación entre 0,9322 y 0,9819. La brecha es especialmente grande en A-10 (+6,5 puntos) y su F1 de intención en validación cae a 0,8728.
- El modelo no es generativo: no puede responder preguntas, razonar ni mantener una conversación por sí mismo. Solo emite intenciones y spans dentro de un vocabulario cerrado y dependiente de la aplicación.
- Idioma limitado al inglés. No hay soporte multilingüe documentado ni evaluación en otros idiomas.
- Contexto máximo de 1.024 tokens, incluyendo historial completo; conversaciones largas requerirán truncado o resumen previo.
- La arquitectura es personalizada (pointer decoder, MoE denso multi-gate, tokenizador de caracteres), lo que limita la compatibilidad con herramientas estándar de inferencia y obliga a mantener código propio.
- Dependencia del identificador de agente como entrada: el modelo no infiere el agente, por lo que un error en la selección del agente por parte de la aplicación produce predicciones enmascaradas al espacio de etiquetas equivocado.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución, sin restricciones adicionales documentadas.
- Sin descargas ni likes en el momento de la ficha, y sin resultados en benchmarks estándar; la validación externa es inexistente.
- El repositorio tiene 0,1 GB y los pesos están en safetensors, pero no se documentan cuantizaciones ni formatos alternativos (GGUF, ONNX) que faciliten el despliegue en otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sraivante/healthlm-moe-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/sraivante/healthlm-moe-v1-data
- Perfil del autor en Hugging Face: https://huggingface.co/sraivante
- Listado de modelos del autor: https://huggingface.co/sraivante/models
- Ficha de otro modelo del autor (TinyThinkModel-72M-V1) en Hugging Peers: https://huggingpeers.co/models/sraivante/TinyThinkModel-72M-V1
