# unignoramus/anlp-a2-p1-moe-top1

## Resumen

anlp-a2-p1-moe-top1 es un modelo de traduccion automatica de tipo decoder-only transformer desarrollado por el usuario unignoramus en el contexto de la asignatura ANLP (Assignment 2, Part 1). Concretamente, traduce vietnamita e ingles y japones a ingles, y forma parte de una serie de cinco variantes de ablacion sobre la capa feed-forward, entrenadas todas con el mismo presupuesto de tokens. La variante aqui descrita usa una capa feed-forward de tipo mixture of experts (MoE) con 4 expertos totales y 1 activo por token (enrutamiento top-1).

El modelo tiene 35,28 M de parametros totales y 25,84 M de parametros activos, se entreno con 36,54 M de tokens sobre el dataset belumind/en-vi-ja-curated-500k-triplets y alcanza una perplejidad de test de 10,86 y un BLEU de test de 26,93. Su relevancia es fundamentalmente experimental y didactica: permite analizar el compromiso entre parametros totales y activos en arquitecturas MoE con enrutamiento top-1 frente a alternativas densas, en un regimen de computo muy reducido y reproducible en hardware de consumo.

No es un modelo orientado a produccion: el repositorio no declara pipeline en HuggingFace, no incluye tarjeta de idiomas estructurada y el checkpoint se distribuye como serializacion plana de PyTorch que depende de la definicion de transformer del repositorio acompanante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capa feed-forward MoE (top-1) |
| Parametros totales | 35,28 M |
| Parametros activos | 25,84 M (4 expertos totales, 1 activo por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (unico checkpoint en precision nativa via `torch.save`; sin versiones GGUF, AWQ o GPTQ publicadas) |
| Idiomas soportados | Vietnamita e ingles y japones como origen; ingles como destino |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch serializado con `torch.save` (claves `model`, `state` y `config`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only. La unica diferencia respecto a las otras cuatro variantes de la serie es la capa feed-forward: en este caso es una MoE con 4 expertos, de los que se activa 1 por token mediante enrutamiento top-1. Esa configuracion explica la diferencia entre 35,28 M de parametros totales y 25,84 M de parametros activos: el coste computacional por token se corresponde con el subconjunto activo, mientras que la memoria necesaria para almacenar el modelo corresponde al total.

El entrenamiento consumio 36,54 M de tokens del dataset belumind/en-vi-ja-curated-500k-triplets, un presupuesto identico al de las otras cuatro ablaciones de la serie. Los resultados publicados son perplejidad de test de 10,86 y BLEU de test de 26,93. No se documentan en la informacion disponible detalles sobre la composicion exacta del dataset, la estrategia de tokenizacion, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de vietnamita a ingles.
- Traduccion de japones a ingles.
- Generacion de texto condicionada en formato decoder-only, limitada por el presupuesto de entrenamiento de 36,54 M de tokens.
- Razonamiento complejo, matematicas avanzadas y generacion de codigo: no documentado en la informacion disponible.
- Tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues adicionales a los tres idiomas declarados: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.
- Analisis experimental del enrutamiento MoE top-1 y de la carga de expertos, al ser una de cinco ablaciones comparables.

## Casos de uso

- Traduccion vi→en y ja→en en local: con 35,28 M de parametros totales el modelo cabe en CPU, GPU integrada o incluso en navegador mediante exportacion a ONNX, lo que permite traducir sin enviar texto a servicios externos.
- Pretraduccion en pipelines de localizacion: generar una primera version en ingles de documentacion tecnica japonesa y vietnamita, que despues revisa un traductor humano, reduciendo el tiempo de post-edicion.
- Filtrado y anotacion de corpus: usar el modelo como traductor de referencia barato para etiquetar pares adicionales a partir de texto monolingue y ampliar datasets de entrenamiento vi-en y ja-en.
- Aumento de datos para otros modelos: producir traducciones sinteticas que sirvan como datos de aumento en el entrenamiento de traductores de mayor tamano.
- Analisis de arquitecturas MoE en investigacion: comparar esta variante top-1 contra las otras cuatro ablaciones de la serie (densa y otras configuraciones MoE) manteniendo fijo el presupuesto de 36,54 M de tokens.
- Estudio del enrutamiento de expertos: inspeccionar que experto se activa por token y por idioma, util para investigar desequilibrios de carga en MoE top-1 de 4 expertos.
- Indexacion y busqueda multilingue: traducir titulos, resumenes o metadatos de documentos vietnamitas y japoneses a ingles antes de indexarlos en un buscador interno o en un sistema de recuperacion.
- Prototipado docente: servir como modelo de juguete reproducible para practicas de traduccion neuronal y de entrenamiento con presupuestos de computo pequenos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Perplejidad de test | 10,86 |
| BLEU de test | 26,93 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

No se han publicado en la informacion disponible resultados comparativos con modelos similares bajo los mismos conjuntos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,14 GB en fp32 (35,28 M de parametros × 4 bytes) y aproximadamente 0,07 GB en fp16 o bf16, sin contar cache de clave-valor ni activaciones.
- GPU recomendadas: cualquier GPU consumer; el modelo cabe holgadamente en tarjetas con 4 GB o menos, e incluso en GPUs integradas.
- CPU: inferencia viable en CPU por el reducido numero de parametros activos (25,84 M por token).
- Dispositivos de borde: tamano de repositorio de 0,1 GB, compatible con entornos embebidos y, previsiblemente, con exportacion a ONNX o WebAssembly.
- Opciones de despliegue: la unica via documentada es PyTorch, cargando el checkpoint con `torch.load(..., weights_only=False)` y la definicion de transformer del repositorio acompanante. No hay soporte directo de vLLM, llama.cpp, Ollama ni TGI, ya que no se publican pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLEU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a2-p1-moe-top1 | 35,28 M totales / 25,84 M activos | no disponible | 26,93 (test, vi/ja→en) | MIT | HuggingFace, checkpoint PyTorch plano |
| Otras cuatro ablaciones de la serie (densa y variantes MoE) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de traduccion multilingue de referencia (por ejemplo, familias OPUS-MT o NLLB) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre modelos comparables, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. Los unicos datos verificables son los declarados por el autor en la model card.

## Limitaciones y advertencias

- Modelo experimental de asignatura: no se documentan procesos de alineacion, filtrado de seguridad ni evaluacion de sesgos, por lo que no es apto para uso en produccion sin validacion adicional.
- Cobertura idiomatica muy restringida: unicamente tres idiomas declarados (vietnamita, japones e ingles) y solo en la direccion hacia ingles.
- Riesgo de alucinacion y de traducciones infieles: el entrenamiento con 36,54 M de tokens es muy reducido en comparacion con modelos de traduccion comerciales.
- Longitud de contexto no documentada: se desconoce la ventana maxima soportada, lo que impide planificar el tratamiento de documentos largos.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Formato de pesos no estandarizado: al ser un `torch.save` plano, requiere `weights_only=False`, lo que implica ejecutar codigo de deserializacion; conviene cargar unicamente checkpoints de confianza.
- Dependencia del repositorio acompanante: el checkpoint no es autocontenido, ya que la clase del modelo debe tomarse del codigo del autor.
- Ausencia de resultados desglosados: no hay metricas separadas por par de idiomas ni evaluaciones de robustez (ruido, mayusculas, dominios especializados).
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unignoramus/anlp-a2-p1-moe-top1
- Dataset de entrenamiento: belumind/en-vi-ja-curated-500k-triplets (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- Repositorio acompanante con la definicion del transformer: no disponible (la model card lo menciona, pero no incluye enlace)
- Paper, blog o demo del autor: no disponible
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre el modelo; los resultados devueltos correspondian a paginas de soporte de Microsoft sin relacion con el modelo.
