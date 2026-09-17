# unignoramus/anlp-a2-p1-moe-active-matched

## Resumen

Este modelo es un transformer decoder-only de 47,86 millones de parametros totales disenado para traduccion automatica de vietnamita e ingles y de japones a ingles. Lo publica el usuario unignoramus en HuggingFace como parte de la asignatura ANLP (Assignment 2, Part 1), y su interes principal no es el rendimiento en produccion sino que se trata de un punto de control de ablacion: es uno de los cinco experimentos entrenados con un presupuesto de tokens identico para comparar variantes de la capa feed-forward.

La variante concreta usa una capa feed-forward de tipo Mixture of Experts (MoE) con 4 expertos de los que solo 2 se activan por token, lo que da 35,28 millones de parametros activos frente a los 47,86 millones totales. El entrenamiento se hizo sobre 36,54 millones de tokens del dataset belumind/en-vi-ja-curated-500k-triplets, con una perplexity de test de 10,30 y un BLEU de test de 27,08.

Su relevancia es acotada pero clara: sirve como referencia reproducible de una ablacion MoE en un regimen de computo muy bajo (modelo pequeno, pocos tokens, dos pares de idiomas) y con licencia MIT, lo que permite reutilizarlo y modificarlo libremente. No hay evidencia de ajuste por instrucciones, RLHF o DPO, ni de resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con feed-forward tipo MoE |
| Parametros totales | 47,86 M |
| Parametros activos | 35,28 M (4 expertos en total, 2 activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | vietnamita a ingles y japones a ingles (traduccion) |
| Licencia | MIT |
| Formato de pesos | torch.save con claves `model`, `state` y `config`; no safetensors ni GGUF |
| Tokens de entrenamiento | 36,54 M |
| Dataset | belumind/en-vi-ja-curated-500k-triplets |
| Perplexity (test) | 10,30 |
| BLEU (test) | 27,08 |
| Libreria declarada | pytorch |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion causal estandar y una capa feed-forward sustituida por un bloque MoE con enrutamiento por token: de los 4 expertos disponibles se activan 2 por token, de modo que el coste de computo por token corresponde a un modelo mas pequeno (35,28 M de parametros activos) mientras que la capacidad de almacenamiento de conocimiento corresponde al total (47,86 M). No se especifican en la informacion disponible el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el tipo de codificacion posicional ni el tokenizador empleado.

El entrenamiento es deliberadamente de bajo presupuesto: 36,54 millones de tokens, identicos para las cinco variantes de ablacion, sobre el dataset belumind/en-vi-ja-curated-500k-triplets. No hay ninguna mencion en la model card a RLHF, DPO, SFT con instrucciones ni a ninguna innovacion de decodificacion (por ejemplo decodificacion especulativa o atencion lineal). El checkpoint se guarda como payload plano de `torch.save` con las claves `model`, `state` y `config`, y requiere cargarse con `torch.load(..., weights_only=False)` y alimentar el objeto `model` a la implementacion de transformer que acompana al repositorio.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles, con BLEU de test de 27,08 sobre el conjunto de evaluacion del dataset de entrenamiento.
- Generacion de texto autoregresiva condicionada por el prefijo de entrada (modelo decoder-only sin encoder separado).
- Enrutamiento MoE con 4 expertos y 2 activos por token, lo que permite estudiar el efecto de la esparsidad en un presupuesto de computo fijo.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso ni modo de pensamiento explicito.
- No hay evidencia de capacidades de vision, audio ni multimodalidad.
- No hay evidencia de ajuste por instrucciones: se comporta como un modelo de traduccion entrenado con datos paralelos, no como un asistente conversacional.
- No se declaran capacidades multilingues mas alla de los pares vietnamita-ingles y japones-ingles.
- El checkpoint es un artefacto de investigacion; no se documenta ninguna interfaz de inferencia estandar.

## Casos de uso

- Reproduccion de ablaciones academicas: el checkpoint permite comparar el efecto de la capa MoE frente a las otras cuatro variantes del mismo trabajo entrenadas con 36,54 M de tokens, manteniendo constante el presupuesto de computo.
- Traduccion asistida de vietnamita e ingles en volumenes pequenos: util para preprocesar corpus de investigacion (por ejemplo, normalizar titulares o descripciones cortas) donde un BLEU de 27,08 puede ser suficiente como paso intermedio antes de una revision humana.
- Traduccion de japones a ingles en entornos de bajo consumo: el reducido numero de parametros activos (35,28 M) permite ejecutarlo en CPU o en GPUs integradas para tareas por lotes no criticas.
- Docencia y practicas de ingenieria de modelos: sirve para ilustrar como se estructura un checkpoint de `torch.save`, como se carga con `weights_only=False` y como se define un bloque MoE con 4 expertos y 2 activos.
- Experimentos de enrutamiento de expertos: al ser un MoE pequeno con routing conocido, es un banco de pruebas barato para estudiar balanceo de carga entre expertos y su efecto en la calidad de traduccion.
- Punto de partida para fine-tuning en un dominio concreto: con licencia MIT y 47,86 M de parametros, se puede ajustar sobre un corpus paralelo especializado (legal, medico, tecnico) en una sola GPU de consumo.
- Generacion de datos sinteticos de traduccion a pequena escala: se puede usar para crear candidatos de traduccion que despues se filtren con un modelo mayor o con un revisor humano.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los del conjunto de test del propio dataset de entrenamiento. La busqueda web no devolvio resultados relevantes (unicamente paginas corporativas de Microsoft), por lo que no hay comparaciones con modelos de referencia.

| Metrica | Resultado |
|---|---|
| Perplexity (test) | 10,30 |
| BLEU (test) | 27,08 |
| Tokens de entrenamiento | 36,54 M |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, FLORES-200 u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 191 MB en FP32 (47,86 M de parametros), unos 96 MB en FP16/BF16 y alrededor de 48 MB en int8. Son estimaciones aritmeticas a partir del numero de parametros, no datos publicados.
- VRAM total para inferencia: inferior a 1 GB en cualquier precision habitual, una vez anadidos cache KV y activaciones, siempre que la longitud de contexto no sea muy grande (dato no disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100; el modelo esta muy por debajo de la capacidad de todas ellas.
- Cabe sin problema en GPU de consumo; tambien es viable la inferencia en CPU en un solo hilo, dado el tamano.
- Opciones de despliegue: al ser un checkpoint de `torch.save` con codigo de transformer propio, no es compatible directamente con vLLM, TGI, Ollama ni llama.cpp. Para usarlo en esos entornos habria que portar la definicion del modelo y convertir los pesos, y llama.cpp requeriria ademas una implementacion compatible con el enrutamiento MoE concreto.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La busqueda web no devolvio resultados tecnicos utilizables, y el autor no incluye una comparativa con alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unignoramus/anlp-a2-p1-moe-active-matched | 47,86 M totales / 35,28 M activos | no disponible | PPL 10,30; BLEU 27,08 (test propio) | MIT | Pesos en HuggingFace, 0 descargas |
| Alternativas comparables de traduccion vi/ja a en | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Presupuesto de entrenamiento muy reducido: 36,54 M de tokens, ordenes de magnitud por debajo de los modelos de traduccion de uso comun, lo que limita la cobertura lexica y la robustez en dominios no vistos.
- Ambito restringido a dos pares de idiomas con una unica direccion (vietnamita a ingles y japones a ingles); no se ha entrenado ni evaluado para otras direcciones.
- Perplexity y BLEU corresponden al test del propio dataset de entrenamiento; no hay evaluacion en conjuntos externos como FLORES-200, por lo que el BLEU de 27,08 no es directamente comparable con cifras publicadas de otros sistemas.
- Riesgo de alucinacion y de omisiones en la traduccion, especialmente en frases largas o con terminologia especializada, dado el tamano del modelo y la ausencia de datos sobre la longitud de contexto.
- No hay informacion sobre sesgos del dataset belumind/en-vi-ja-curated-500k-triplets ni sobre el proceso de curacion, por lo que se desconoce el sesgo de genero, registro o dominio que pueda arrastrar.
- No hay ajuste por instrucciones ni por preferencias humanas (sin RLHF/DPO documentados); no es adecuado como asistente conversacional general.
- La licencia MIT permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Carga no estandar: requiere `torch.load(..., weights_only=False)`, una opcion que implica ejecucion de codigo arbitrario si la procedencia del archivo no es fiable.
- Sin adopcion verificable (0 descargas, 0 likes) ni validacion externa; debe tratarse como artefacto de investigacion, no como componente de produccion.
- No se documentan tokenizador, plantilla de prompt ni formato de entrada exacto, lo que complica la reproducibilidad de las cifras publicadas.

## Enlaces

- [Modelo en HuggingFace: unignoramus/anlp-a2-p1-moe-active-matched](https://huggingface.co/unignoramus/anlp-a2-p1-moe-active-matched)
- Dataset de entrenamiento: belumind/en-vi-ja-curated-500k-triplets (referenciado en la model card; no se ha proporcionado URL directa)
- Repositorio de codigo del transformer: mencionado en la model card como repositorio acompanante, sin URL disponible
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
