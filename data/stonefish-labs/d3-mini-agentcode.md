# stonefish-labs/d3-mini-agentcode

## Resumen

d3-mini-agentcode es un ajuste fino de d3-mini (4B parametros, Apache-2.0), que a su vez se construye sobre Qwen/Qwen3.5-4B. Lo desarrolla stonefish-labs y su proposito es muy concreto: actuar como filtro de triaje para codigo escrito o ejecutado por agentes de IA. El modelo lee la tarea encomendada al agente y el cambio realizado (un diff o un fragmento ejecutado) y responde si ese cambio introduce comportamiento sensible para la seguridad que la tarea no requeria, o si es directamente malicioso.

Se trata de un modelo de decision, no de un generador de texto libre: expone tres preguntas congeladas (clase, intencion y alcance) y devuelve probabilidades. La version publicada es una pre-release; el autor planea una revision entrenada con positivos de varios redactores, formulaciones de tarea mas realistas y mas idiomas. Su relevancia actual radica en que cubre un hueco emergente: la supervision de codigo generado por agentes autonomos, donde las herramientas de revision tradicionales no estan disenadas para evaluar intencion respecto a una tarea declarada.

El modelo tiene 4.539.265.536 parametros, ventana de 8.192 tokens y se distribuye en formato safetensors con licencia Apache-2.0. No esta pensado como barrera unica, sino como evidencia barata para priorizar la revision humana o el paso a un modelo mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/Qwen3.5-4B via vllm-sr/d3-mini), con atencion estandar, linear-attention y proyecciones MLP; cabecera de lectura de respuestas entrenada |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles de forma oficial; evaluado en 14 idiomas y shells (8 lenguajes de diff, 6 celdas de code-mode/shell) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados); incluye adaptador LoRA en `adapter/` y extractor en `extractor/` |

## Arquitectura y entrenamiento

El modelo parte de d3-mini en la revision `df99bf4ca4418bc6908ee68e9b7479af1f3b8800`, construido sobre Qwen/Qwen3.5-4B. La receta de ajuste es un LoRA con r=16, alpha=32 y dropout 0.05 aplicado sobre las proyecciones de atencion, linear-attention y MLP del backbone de texto, ademas de la cabecera de lectura de respuestas entrenada. Se uso learning rate 1e-4 (2e-5 para la lectura), 2 epocas, 1.038 pasos de optimizador, longitud maxima 8.192, label smoothing 0.05 y barajado del orden de opciones. El repositorio contiene los pesos fusionados, el adaptador y el extractor de comportamiento que construye la entrada.

La innovacion principal no esta en la arquitectura sino en la formulacion de la tarea: el modelo recibe un estado de texto con cuatro secciones ordenadas (`Task:`, `Repository baseline`, `Behaviour summary` y `Change:`) y responde a tres preguntas congeladas definidas en `questions.json`: `class` (eleccion entre categorias, incluida `deliberately_malicious`), `intent` (si/no) y `scope` (si/no, con probabilidad `noul`). El extractor estatico que genera el resumen de comportamiento nunca ejecuta el codigo analizado. Se publica la semilla 1 (checkpoint final); una segunda semilla replica los resultados pero no se publica.

## Capacidades

- Clasificacion zero-shot de cambios de codigo respecto a una tarea declarada, con salida de probabilidades por clase.
- Deteccion de comportamiento sensible para la seguridad no solicitado por la tarea (out-of-scope).
- Deteccion de cambios deliberadamente maliciosos.
- Analisis de diffs en 8 lenguajes y de fragmentos ejecutados en 6 celdas de code-mode/shell (14 celdas en total).
- Soporte de entradas con descripcion de tarea, linea base del repositorio y resumen de comportamiento automatizado.
- Funcionamiento con resumen de comportamiento placeholder cuando no se dispone del extractor, con perdida minima de rendimiento.
- No es un modelo generativo de proposito general ni soporta tool calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Puerta de triaje en pipelines de agentes de codigo: puntuar cada diff generado por un agente antes del merge y enviar a revision humana los que superen el umbral (p(class=deliberately_malicious) >= 0.9 o p(scope) >= 0.9).
- Segunda etapa de ranking detras de reglas estaticas mas baratas: usar las probabilidades del modelo para ordenar los cambios por riesgo cuando las reglas ya han descartado la mayoria.
- Supervision de code-mode: analizar fragmentos que un agente ejecuta en un sandbox y detectar acciones que exceden la tarea encomendada, con la salvedad de que bash es la celda donde mas cae el rendimiento (20/33 con placeholder frente a 24/33 con extractor).
- Revision de releases de dependencias: el modelo detecta releases comprometidas presentadas como diffs (21/27 encontradas, 0/80 releases ordinarias marcadas), util para auditar actualizaciones de librerias de terceros.
- Filtrado multilingue en organizaciones con equipos en varios idiomas: con el umbral multilingue 0.9/0.05 alcanza 95% de recall a 2,3% de falsas alarmas sobre codigo real en el conjunto de 14 idiomas.
- Generacion de evidencia para auditoria: registrar las probabilidades por pregunta junto al diff para justificar decisiones de revision, dado que el modelo aporta evidencia y no prueba de intencion.
- Priorizacion en colas de revision de seguridad: dado su coste (~0,5-0,8 s por elemento en una RTX 4090), permite puntuar volumen alto de cambios sin bloquear el flujo.

## Benchmarks y rendimiento

Resultados publicados por el autor, cada modelo en su propio umbral ajustado en dev. "Untuned" es d3-mini con el mismo contexto.

| Conjunto de prueba | Semilla 1 (publicada) | Semilla 2 | Untuned |
|---|---|---|---|
| Diffs de agente, conjunto independiente: encontrados / diffs reales y controles in-scope marcados | 21/22 / 0/172 | 19/22 / 0/172 | 10/22 / 0/172 |
| Code mode publico, fuente no vista: positivos encontrados / snippets reales marcados | 31/31 / 0/200 | 31/31 / 0/200 | 31/31 / 1/200 |
| Diffs de agente y code mode held-out (repos/fuentes no vistos): encontrados / elementos reales marcados | 122/122 / 0/527 | 118/122 / 0/527 | 96/122 / 2/527 |
| Familias de comportamiento nunca vistas en entrenamiento | 26/26 | 22/26 | 14/26 |
| Releases de libreria comprometidas mostradas como diffs (no entrenado): encontradas / releases ordinarias marcadas | 21/27 / 0/80 | 19/27 / 0/80 | 19/27 / 0/80 |
| 14 idiomas y shells: encontrados / elementos reales marcados / controles benignos marcados | 458/510 / 11/2150 / 1/560 | 446/510 / 7/2150 / 2/560 | 343/510 / 48/2150 (resto no disponible) |

Con el resumen placeholder en lugar del extractor, sobre 14 idiomas: 448/510 encontrados, 5/2150 elementos reales marcados, 1/560 controles marcados, AUROC 0.984. Con el extractor: 458/510, 11/2150, 1/560, AUROC 0.985. En el conjunto independiente de diffs de agente: 20/22 con placeholder y 21/22 con extractor, con 0/172 marcados en ambos casos. La mayor caida se da en bash code mode (20/33 frente a 24/33).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos, mas overhead de activaciones y contexto; en la practica se recomienda 12-16 GB para longitudes tipicas.
- GPU recomendadas: RTX 4090 para el rendimiento declarado (~0,5-0,8 s por elemento a longitudes tipicas); A100 o H100 si se necesita mayor throughput por lote.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3090, 4080, 4090). En 8 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo `system_one`); el autor no documenta integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: ~0,5-0,8 s por elemento en una RTX 4090 a longitudes tipicas; no se publican cifras de throughput agregado por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-mini-agentcode | 4,54B | 8.192 | Triaje de seguridad de codigo de agentes (clasificacion) | Apache-2.0 | HuggingFace, pre-release |
| vllm-sr/d3-mini (base) | 4B | no disponible | Modelo de decision base | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-4B (raiz) | 4B | no disponible | LLM generativo de proposito general | no disponible en la informacion | HuggingFace |

No se dispone de datos de benchmarks comparativos frente a otros modelos de triaje de seguridad de codigo en la informacion proporcionada; los unicos puntos de comparacion son el modelo base y la variante sin ajustar, incluidos en la tabla de benchmarks.

## Limitaciones y advertencias

- Es una pre-release: el autor anuncia una revision con positivos de varios redactores, formulaciones de tarea mas realistas y mas idiomas.
- No debe usarse como barrera unica: es evidencia para revision, no prueba de intencion.
- Fuera de alcance: escaneo de paquetes o dependencias completas (npm, PyPI), entradas de mas de 8.192 tokens y veredictos sin descripcion de tarea.
- El umbral congelado (0.9/0.9) se ajusto sobre un conjunto dev en ingles y mayoritariamente Python; para otros idiomas o dominios se recomienda reajustar sobre codigo propio.
- El umbral multilingue (0.9/0.05) sube el recall del 90% al 95% a costa de 2,3% de falsas alarmas sobre codigo real, frente al 0,5% del umbral congelado.
- Rendimiento mas debil en bash code mode (20/33 con placeholder frente a 24/33 con extractor).
- Dependencia del formato de entrada: el estado debe incluir las cuatro secciones en orden; sin tarea declarada el modelo queda fuera de su dominio de entrenamiento.
- Riesgo de alucinacion no evaluado en la informacion disponible; al ser un clasificador con salida de probabilidades, el riesgo se traslada a falsos positivos y falsos negativos.
- Sesgos conocidos no documentados; el conjunto de entrenamiento es mayoritariamente ingles y Python, lo que puede sesgar el comportamiento en otros ecosistemas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y la raiz Qwen3.5-4B deben verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stonefish-labs/d3-mini-agentcode
- Modelo base d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Modelo raiz Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos para este modelo.
