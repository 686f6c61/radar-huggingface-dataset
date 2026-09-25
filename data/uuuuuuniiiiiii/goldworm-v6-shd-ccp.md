# Uuuuuuniiiiiii/goldworm-v6-shd-ccp

## Resumen

GoldWorm v6 — SHD-CCP Cube Agent es un modelo publicado por el usuario Uuuuuuniiiiiii en Hugging Face el 25 de septiembre de 2026. Segun su model card, se trata de un agente byte-level denominado «SHD-CCP» construido sobre GoldWorm v6, un transformer causal byte-level de 2,76 M de parametros, con Qwen-2.5-Coder-0.5B «mapeado» sobre un cubo de 101 slabs de 180×180. La unica innovacion descrita es un componente llamado CubeRouter aplicado cada cuarto bloque.

El atractivo declarado del modelo es su compacidad extrema: 2.759.820 parametros y un artefacto de cubo de 6,54 MB, lo que lo situa en la categoria de modelos diminutos ejecutables en CPU. Es relevante unicamente como objeto de estudio o experimentacion docente, no como alternativa a modelos de produccion.

Conviene advertir desde el principio de varias inconsistencias en la informacion disponible: el repositorio ocupa 0,0 GB (no consta que se hayan subido pesos), acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y las cifras de rendimiento que anuncia la model card (ARC-AGI-3 8/8, fullstack PASS en 26,68 s, B4=0,583) no son verificables ni corresponden a benchmarks estandar reproducibles con la documentacion aportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal byte-level con enrutado «CubeRouter» (cada cuarto bloque) sobre un cubo de 101 slabs de 180×180; la model card lo denomina «SHD-CCP cube agent» |
| Parametros totales | 2.759.820 (segun la model card) |
| Parametros activos | no disponible (no se describe una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repositorio; el modelo relacionado goldworm-v6 declara licencia MIT |
| Formato de pesos | no disponible; los artefactos citados son `goldworm_v6_shd_ccp.py` y `cube_uor.bin`. El repositorio relacionado publica safetensors |

## Arquitectura y entrenamiento

La model card describe un transformer causal byte-level (no basado en tokens BPE) de 2,76 M de parametros, con un mecanismo propietario al que llama SHD-CCP y un componente CubeRouter insertado cada cuatro bloques. La representacion interna se organiza como un cubo de 101 slabs de 180×180 (6,54 MB). No se especifica el numero de capas, dimensiones de embedding, numero de cabezas de atencion ni funcion de activacion.

No hay informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO o instruccion supervisada, ni sobre la metodologia de evaluacion. La afirmacion de que Qwen-2.5-Coder-0.5B esta «mapeado» sobre el cubo resulta contradictoria con el recuento declarado de 2,76 M de parametros, ya que Qwen2.5-Coder-0.5B tiene del orden de 0,5 mil millones de parametros. Tampoco se documenta si el cubo contiene pesos destilados, comprimidos o meramente reindexados del modelo base citado.

## Capacidades

- Generacion de texto byte-level, segun la arquitectura declarada (transformer causal byte-level).
- Razonamiento sobre tareas tipo ARC-AGI, segun la afirmacion de la model card (8/8 resueltos, sin metodologia replicable).
- Ejecucion de una bateria propia denominada «fullstack benchmark» (PASS en 26,68 s), sin definicion publica del conjunto de pruebas.
- Verificacion de codigo Batari Basic, segun la seccion de verificacion de la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el termino «agent» aparece en el titulo pero sin detalles operativos.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Docencia de arquitecturas transformer: con 2,76 M de parametros y unos 11 MB en fp32, el modelo se puede cargar y depurar en cualquier portatil, lo que permite ilustrar paso a paso como funciona un transformer causal byte-level y un mecanismo de enrutado por bloques.
- Investigacion sobre enrutado condicional: el CubeRouter aplicado cada cuatro bloques es el unico componente diferencial documentado; serviria como banco de pruebas para estudiar si el enrutado sobre una representacion en «slabs» aporta algo frente a un transformer denso equivalente.
- Reproduccion y auditoria de resultados: dado que la model card afirma ARC-AGI-3 8/8 y un fullstack PASS en 26,68 s, un equipo de evaluacion puede intentar replicar esas cifras con los artefactos publicados y determinar si son reproducibles.
- Experimentos en dispositivos de borde: un artefacto de 6,54 MB es compatible con despliegue en entornos embebidos o navegador, siempre que existan pesos en un formato convertible (no confirmado).
- Generacion de texto muy corto con recursos minimos: si los pesos estan disponibles, el modelo encaja en escenarios de generacion de secuencias cortas tipo microrrelatos, con la salvedad de que no se ha documentado calidad alguna.
- Punto de partida para fine-tuning de bajo coste: el tamano permite reentrenar o ajustar el modelo completo en una unica GPU consumer e incluso en CPU en tiempos razonables, como ejercicio de investigacion.
- Demostraciones interactivas ligeras: el repositorio relacionado goldworm-v6 menciona una demo en Streamlit, lo que sugiere un uso previsto como aplicacion de demostracion mas que como servicio en produccion.

## Benchmarks y rendimiento

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-AGI-3 | 8/8 (100%) | Cifra de la model card; no se especifica el conjunto exacto ni la metodologia |
| Fullstack benchmark | PASS en 26,68 s | Benchmark propietario, sin definicion publica del conjunto de tareas |
| Semantic B4 | 0,583 | Metrica no estandar, sin definicion de calculo |
| Batari Basic | «verified» | Sin detalle de la prueba |

No se han publicado resultados de benchmarks en la informacion disponible para metricas estandar (MMLU, HumanEval, GSM8K, ARC-AGI-2). Las cifras de la tabla anterior provienen exclusivamente de la model card del autor y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para el modelo de 2,76 M de parametros: aproximadamente 11 MB en fp32, 5,5 MB en fp16/bf16, 2,8 MB en int8 y 1,4 MB en int4. Cabe en CPU y en cualquier GPU con memoria disponible.
- Si la afirmacion sobre Qwen-2.5-Coder-0.5B implicase cargar realmente un modelo de ~0,5 B de parametros, el requisito subiria a del orden de 1 GB en fp16 y 0,5 GB en int8, mas overhead de runtime.
- GPU recomendadas: no disponible; para 2,76 M de parametros no se necesita GPU dedicada. Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en CPU de un solo nucleo.
- Cabe en GPU consumer: si, con amplisima holgura, para el recuento de 2,76 M de parametros.
- Opciones de despliegue: no confirmadas. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La carga se describe mediante scripts Python propios (`goldworm_v6_shd_ccp.py`) y un binario de cubo (`cube_uor.bin`).
- Latencia y throughput estimados: no disponible.
- Nota critica: el repositorio ocupa 0,0 GB, por lo que no consta que los pesos esten efectivamente publicados. Sin pesos, ningun despliegue es viable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| goldworm-v6-shd-ccp | 2,76 M (segun model card) | no disponible | no disponible | Repositorio de 0,0 GB, 0 descargas | Solo cifras no verificadas del autor |
| Uuuuuuniiiiiii/goldworm-v6 (mismo autor) | 2,76 M | no disponible | MIT | Safetensors, PyTorch, etiquetas `tiny-stories` y `efficient` | no disponible en la informacion aportada |
| Qwen2.5-Coder-0.5B (citado como base) | ~0,5 B | no disponible en la informacion aportada | no disponible en la informacion aportada | Modelo ampliamente distribuido | no disponible en la informacion aportada |

No se dispone de datos de rendimiento comparables entre estos modelos dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Repositorio vacio o casi vacio: el tamano declarado es 0,0 GB, de modo que no hay evidencia de que los pesos esten publicados. Los dos artefactos citados son un script Python y un binario de cubo.
- Ausencia total de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni issues que permitan validar el funcionamiento.
- Benchmarks no verificables: ARC-AGI-3 8/8, fullstack PASS y B4=0,583 provienen unicamente de la model card, sin conjunto de evaluacion publico, sin semilla ni protocolo, y no son comparables con metricas estandar.
- Terminologia no definida: «SHD-CCP», «cube agent», «slabs» y «CubeRouter» no se explican ni se referencian a literatura tecnica, lo que impide evaluar la arquitectura.
- Inconsistencia de parametros: la model card combina un recuento de 2,76 M de parametros con el mapeo de Qwen-2.5-Coder-0.5B, cuyo orden de magnitud es unas 180 veces superior. No se aclara que se ha conservado de ese modelo base.
- Licencia no declarada en este repositorio: sin licencia explicita no se puede asumir permiso de uso comercial, redistribucion ni modificacion, aunque el repositorio hermano goldworm-v6 indique MIT.
- Idiomas y contexto desconocidos: no se declara cobertura linguistica ni longitud de ventana, lo que impide planificar cualquier integracion real.
- Riesgo de alucinacion: inherente a cualquier modelo generativo; en un modelo byte-level de 2,76 M de parametros la coherencia mas alla de secuencias muy cortas es, en el mejor de los casos, limitada.
- Sesgos: no evaluados ni documentados.
- Idoneidad para produccion: nula con la informacion disponible. No debe utilizarse en sistemas con usuarios reales sin una evaluacion independiente previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v6-shd-ccp
- Modelo relacionado goldworm-v6 (mismo autor): https://huggingface.co/Uuuuuuniiiiiii/goldworm-v6
- Busqueda de modelos con la etiqueta goldworm-v6: https://huggingface.co/models?other=goldworm-v6
- Video en YouTube «GoldWorm v6 AI»: https://www.youtube.com/watch?v=xeA456bAdfM
- Pagina de seguimiento de lanzamientos de septiembre de 2026 en BenchLM: https://benchlm.ai/model-updates/releases/september-2026

No se han encontrado articulos cientificos, repositorios de codigo independientes ni demostraciones publicas adicionales en los resultados de busqueda proporcionados.
