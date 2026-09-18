# yuhengtu-bytedance/DataDecide-fineweb-pro-1B-57500_60000_62500_65000_67500_weightedavg_merge

## Resumen

DataDecide-fineweb-pro-1B-57500_60000_62500_65000_67500_weightedavg_merge es un modelo de lenguaje de aproximadamente 1,28 mil millones de parametros obtenido mediante la fusion (merge) de cinco checkpoints intermedios de un mismo entrenamiento de 1B parametros sobre datos de tipo fineweb-pro. El autor del repositorio es el usuario yuhengtu-bytedance y la fusion se ha realizado con la herramienta mergekit empleando el metodo Linear (media ponderada de pesos), descrito en el articulo arXiv:2203.05482.

No se trata de un modelo nuevo entrenado desde cero, sino de un experimento de "model soups": se combinan los pesos de los pasos 57.500, 60.000, 62.500, 65.000 y 67.500 del mismo run de entrenamiento, con pesos 1, 2, 3, 4 y 5 respectivamente y normalizacion activada, tomando el paso 67.500 como modelo base. Los pesos resultantes se exportan en bfloat16 a partir del calculo en float32.

Su relevancia es fundamentalmente metodologica: sirve para estudiar si la media ponderada de checkpoints proximos mejora la estabilidad y las metricas finales frente al ultimo checkpoint individual. Es un modelo base (no ajustado por instrucciones) orientado a generacion de texto, con escasa documentacion publicada sobre datos de entrenamiento, licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (segun el tag `llama` del repositorio; no se publica config.json detallado) |
| Parametros totales | 1.279.854.592 (1,28 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos se publican en bfloat16, por lo que son cuantizables a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo resultante es una media lineal ponderada de pesos (linear merge / model soup) de cinco checkpoints del mismo entrenamiento, todos ellos derivados del run sobre fineweb-pro. La configuracion YAML usa `merge_method: linear`, `normalize: true`, `dtype: float32` y `out_dtype: bfloat16`, con el paso 67.500 como base. Los cinco checkpoints fusionados son los pasos 57.500, 60.000, 62.500, 65.000 y 67.500, con pesos crecientes 1, 2, 3, 4 y 5, de modo que la mezcla pondera mas los checkpoints mas avanzados del entrenamiento.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se detalla si la arquitectura incorpora innovaciones como atencion lineal, decodificacion especulativa o variantes de RoPE. Al tratarse de una media de checkpoints de un mismo run, no hay un entrenamiento adicional tras la fusion: el unico procesamiento posterior es la conversion de precision a bfloat16.

## Capacidades

- Generacion de texto autoregresiva (el pipeline declarado es `text-generation`).
- Continuacion de texto y finalizacion de secuencias en estilo few-shot, propio de un modelo base sin ajuste por instrucciones.
- No hay evidencia de soporte de tool calling ni function calling en la informacion disponible.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso entrenado explicitamente.
- No se documentan capacidades multilingues ni lista de idiomas.
- No se declaran capacidades de vision, audio, modo "thinking" ni multimodalidad.
- El tag `text-generation-inference` indica compatibilidad de despliegue con TGI, pero no implica capacidades adicionales.

## Casos de uso

- Investigacion sobre fusion de modelos: sirve como punto de comparacion para medir si la media ponderada de checkpoints proximos supera al checkpoint final en perplejidad o en tareas de validacion dentro del proyecto DataDecide.
- Experimentos de "checkpoint averaging": permite reproducir el flujo de mergekit con una configuracion conocida y evaluar el efecto de los pesos relativos (1-2-3-4-5) sobre la calidad del modelo.
- Generacion de texto base para prototipos: al ser un modelo de 1,28B en bfloat16, puede ejecutarse en una GPU de consumo para pruebas de generacion de texto sin grandes requisitos de infraestructura.
- Punto de partida para ajuste fino supervisado: al ser un modelo base, es candidato a fine-tuning con LoRA o SFT sobre datos de dominio antes de usarlo en tareas concretas.
- Evaluacion comparativa de recetas de datos: al provenir del ecosistema fineweb-pro, permite estudiar como afecta la composicion del corpus a las capacidades finales del modelo.
- Docencia y formacion: su tamano reducido y su caracter de merge documentado lo hacen util para explicar en clase tecnicas de model merging y sus limites.
- Base para cuantizacion y despliegue ligero: puede convertirse a GGUF o cuantizarse a 8/4 bits para ejecucion en CPU o en portatiles, si la licencia lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2,56 GB en bfloat16 (1.279.854.592 parametros x 2 bytes) y unos 5,1 GB en float32. Son calculos derivados del recuento de parametros, no mediciones publicadas.
- VRAM adicional necesaria para cache KV, activaciones y overhead del runtime: depende de la longitud de contexto y del tamano de lote, que no se documentan.
- Cuantizacion: en 8 bits los pesos ocuparian alrededor de 1,3 GB y en 4 bits alrededor de 0,7 GB, mas overhead.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 24 GB, e incluso en GPUs con 4-6 GB si se cuantiza.
- GPU de centro de datos (A100, H100) no son necesarias por tamano, salvo para servir muchos lotes concurrentes.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (tag `text-generation-inference`), y conversion a llama.cpp/Ollama/GGUF si se respeta la licencia.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DataDecide-fineweb-pro-1B (este merge) | 1,28B | no disponible | no disponible | HuggingFace, 2,6 GB, 0 descargas |
| Llama 3.2 1B (Meta) | ~1,24B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, muy extendido |
| Qwen2.5-1.5B (Alibaba) | ~1,54B | 32.768 tokens nativos | Apache 2.0 | HuggingFace, muy extendido |
| SmolLM2-1.7B (HuggingFace) | ~1,7B | 8.192 tokens | Apache 2.0 | HuggingFace, ampliamente usado |

Nota: los datos de contexto, licencia y parametros de los modelos alternativos son caracteristicas publicas conocidas de esos lanzamientos. Para este merge no se dispone de datos equivalentes, por lo que la comparacion de rendimiento no puede realizarse.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no cabe esperar que siga ordenes, mantenga formato conversacional ni rechace peticiones peligrosas de forma fiable.
- Riesgo de alucinacion alto y no mitigado, ya que no se documentan fases de RLHF, DPO ni filtros de seguridad.
- Sesgos potenciales derivados de datos web de tipo fineweb-pro, no evaluados ni cuantificados en la informacion disponible.
- Licencia no disponible: no puede confirmarse si se permite uso comercial. Conviene tratarlo como uso exclusivamente de investigacion hasta aclarar la licencia con el autor.
- Idiomas soportados no declarados: el rendimiento fuera del ingles (si el corpus era mayoritariamente ingles) es incierto.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- Es una fusion de checkpoints, no un modelo validado: no hay benchmarks publicados que respalden su calidad frente al checkpoint 67.500 sin fusionar.
- Repositorio sin descargas ni "likes" y publicado con rutas locales absolutas en lugar de referencias a modelos publicos, lo que dificulta la trazabilidad y la reproduccion exacta del merge.
- Metadatos con fechas de creacion/actualizacion poco habituales (2026), lo que conviene verificar antes de integrarlo en un pipeline de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-fineweb-pro-1B-57500_60000_62500_65000_67500_weightedavg_merge
- mergekit (herramienta de fusion): https://github.com/cg123/mergekit
- Articulo del metodo Linear / model soups: https://arxiv.org/abs/2203.05482
- No se han encontrado en la busqueda web enlaces adicionales relevantes al modelo (los resultados devueltos correspondian a contenidos no relacionados).
