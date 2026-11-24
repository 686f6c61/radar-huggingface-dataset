# werr-lab/werr-system1-triage

## Resumen

WERR System-1 Triage es un motor de clasificación y enrutamiento determinista publicado por werr-lab bajo el identificador `werr-lab/werr-system1-triage`. Se presenta como un sistema de "triage cognitivo System-1" que opera en CPU, sin uso de VRAM, con latencias declaradas por debajo de los 5 ms. No es un modelo de lenguaje generativo al uso: la model card lo describe como un motor de decisión que produce salidas categóricas (`choice`) y ordinales (`score`) sobre la base de lo que el autor denomina "Fractal Neural Synthesis", implementado en un binario propio llamado `noul` y distribuido mediante una librería también propia, `werrio`.

El modelo se enmarca en la categoría de zero-shot-classification según el pipeline declarado en Hugging Face, y está orientado a tareas de enrutamiento y triage en el borde (edge). Su propuesta de valor es la determinación: mismas entradas producen mismas salidas, con huella de memoria nula en GPU y latencias de milisegundos, lo que lo sitúa en un nicho distinto al de los transformers convencionales. Los idiomas declarados son inglés y turco.

La relevancia del proyecto es discutible y conviene tratarla con cautela: el repositorio acumula cero descargas y cero "likes" en el momento de la consulta, la librería (`werrio`) no es estándar, el paper referenciado (`arXiv:2609.25498`) no es verificable en la información disponible y la licencia es BSL 1.1, lo que condiciona el uso comercial. Los datos de benchmarks proceden exclusivamente de la model card del autor y no se han contrastado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el autor la denomina "Fractal Neural Synthesis"; motor determinista `noul`, no se detalla si es transformer, SSM o híbrido) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se declara "0 VRAM", ejecución en CPU) |
| Idiomas soportados | Inglés (en), turco (tr) |
| Licencia | BSL 1.1 (Business Source License 1.1) |
| Formato de pesos | No disponible (se distribuye como binario `noul` mediante la librería `werrio`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. La model card menciona "Fractal Neural Synthesis" como técnica subyacente y describe el sistema como un motor de decisión determinista que emite salidas categóricas (`choice`) y ordinales (`score`), empaquetado en el binario `noul` y consumido a través de la librería `werrio`. No se especifica si se trata de un transformer, un modelo de estados espaciales, un sistema híbrido o un mecanismo puramente simbólico o basado en reglas con componentes neuronales.

Tampoco se publican datos sobre el volumen de entrenamiento, la composición del corpus, la existencia de fases de RLHF o DPO, ni innovaciones de decodificación. El único dato relacionado con datos es la evaluación sobre el conjunto `pCwOrM/werr_open_decisions`, que el autor cifra en 1.205 trayectorias de decisión abiertas. Cualquier afirmación sobre el proceso de entrenamiento más allá de esto sería especulativa.

## Capacidades

- Clasificación zero-shot: asignación de etiquetas categóricas a entradas de texto sin ejemplos previos, según el pipeline declarado.
- Salida ordinal: además de la categoría, el motor emite una puntuación (`score`) que permite ordenar o priorizar decisiones.
- Enrutamiento y triage: selección de la ruta o acción adecuada en un flujo de decisión, orientado a sistemas agénticos.
- Determinismo: misma entrada, misma salida, lo que facilita la reproducibilidad y la auditoría en producción.
- Adherencia a esquemas de herramientas: la model card declara un 100 % de adherencia a esquemas de herramientas en el benchmark Sierra Tau-Bench.
- Resistencia a inyección de prompts: se declara un 0,0 % de bypass en el benchmark JevBench.
- Ejecución en CPU sin VRAM: apto para entornos de borde con recursos limitados.
- Idiomas: inglés y turco.
- No se declaran capacidades de generación de texto libre, código, matemáticas, visión ni audio.

## Casos de uso

- Enrutamiento de peticiones en pipelines agénticos: el motor puede decidir a qué herramienta o subagente derivar cada consulta en función de una clasificación categórica, con latencias declaradas de milisegundos que no bloquean el flujo principal.
- Triage de tickets de soporte: clasificación zero-shot de incidencias entrantes en categorías predefinidas y asignación de una puntuación de prioridad, sin necesidad de GPU ni de ejemplos etiquetados por categoría.
- Filtro de seguridad previo a un LLM: dado que la model card declara resistencia a inyección de prompts, podría colocarse como primera barrera que descarte o marque entradas sospechosas antes de invocar un modelo generativo de mayor coste.
- Validación de llamadas a herramientas en agentes: el 100 % de adherencia a esquemas declarado en Sierra Tau-Bench sugiere su uso como validador determinista que comprueba que una llamada a función cumple el esquema antes de ejecutarla.
- Clasificación en dispositivos de borde: al ejecutarse en CPU sin VRAM, encaja en gateways, routers o dispositivos con memoria limitada donde no cabe un transformer convencional.
- Enrutamiento multilingüe inglés-turco: para productos que operan en ambos idiomas y necesitan una capa de decisión ligera y determinista.
- Evaluación reproducible en CI: su determinismo permite integrarlo en pruebas automatizadas donde se requiere que la salida sea idéntica entre ejecuciones.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y no se han verificado de forma independiente.

| Benchmark | Resultado declarado | Latencia / huella |
|---|---|---|
| WindTunnel WebMCP | 100 % (49/49) | 3,35 ms, 0 VRAM |
| Sierra Tau-Bench | 100 % de adherencia a esquemas de herramientas | 0,38 ms |
| JevBench (N=231) | 93,1 % de aprobados (100 % type-safe) | 0,0 % de bypass de inyección de prompts |
| Jevenator 2 | Aceleración de 38,0× | Ejecución determinista solo en CPU |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 0, según la model card; el motor se ejecuta en CPU.
- GPU: no requiere GPU. No se especifican modelos recomendados porque no aplica.
- GPU de consumo: no aplica; no se necesita ninguna.
- Despliegue: binario `noul` a través de la librería `werrio`. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia declarada: 0,38 ms a 3,35 ms según el benchmark.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| werr-system1-triage | No disponible | No disponible | Motor determinista de triage en CPU, clasificación zero-shot | BSL 1.1 | Hugging Face, sin descargas registradas |
| Modelos de clasificación zero-shot basados en transformers (p. ej. familia BART-large-MNLI) | Cientos de millones | Limitado | Clasificación zero-shot neuronal en GPU/CPU | MIT o Apache 2.0 según variante | Ampliamente adoptados |
| Clasificadores ligeros tipo fastText | Millones | N/A | Clasificación supervisada en CPU | MIT | Muy extendidos |
| Routers basados en reglas o expresiones regulares | N/A | N/A | Determinista, simbólico | Variable | Estándar en producción |

La comparación directa es difícil porque el sistema no declara parámetros ni arquitectura. Frente a los clasificadores zero-shot neuronales, su ventaja declarada es la latencia y la ausencia de VRAM; frente a los routers simbólicos, su ventaja sería la generalización semántica, aunque no hay datos independientes que lo confirmen.

## Limitaciones y advertencias

- Verificación pendiente: no hay descargas ni "likes" registrados y los benchmarks proceden únicamente del autor; no se han replicado de forma independiente.
- Referencia no verificable: el paper citado (`arXiv:2609.25498`) no se ha podido contrastar en la información disponible.
- Ecosistema propietario: depende de la librería `werrio` y del binario `noul`, lo que dificulta la integración con stacks estándar (vLLM, Transformers, llama.cpp).
- Idiomas limitados: solo inglés y turco; no se declara cobertura de castellano.
- Licencia BSL 1.1: es una licencia de código disponible con restricciones, no una licencia open source aprobada por la OSI; el uso comercial puede estar sujeto a condiciones y a una fecha de conversión a licencia abierta que debe consultarse en el enlace de licencia.
- Opacidad arquitectónica: la ausencia de datos sobre parámetros, contexto y entrenamiento impide evaluar riesgos de sesgo, alucinación o degradación fuera de distribución.
- Riesgo de sobreajuste a los benchmarks propios: los conjuntos WindTunnel, JevBench y Jevenator parecen específicos del proyecto, lo que limita la comparabilidad.
- Sin datos sobre sesgos conocidos ni sobre comportamiento en dominios distintos de los evaluados.
- Para producción: conviene tratar las cifras de rendimiento como declaraciones del autor y validarlas en el caso de uso concreto antes de adoptar el sistema.

## Enlaces

- Hugging Face: https://huggingface.co/werr-lab/werr-system1-triage
- Dataset: https://huggingface.co/datasets/pCwOrM/werr_open_decisions
- Repositorio: https://github.com/pCwOrM/werr
- Licencia: https://github.com/pCwOrM/werr/blob/main/LICENSE
- Paper: https://arxiv.org/abs/2609.25498
