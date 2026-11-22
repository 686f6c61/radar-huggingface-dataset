# WUrbane/biofacts-520m

## Resumen

BioFacts 520m es un modelo de lenguaje de tipo causal (arquitectura transformer, segun la libreria `transformers` y la clase `AutoModelForCausalLM` empleada en la model card) desarrollado por el usuario WUrbane. Se trata de un ajuste fino (fine-tuning) sobre un modelo base preentrenado, identificado en la documentacion como `OptimizerStudy/muon_*`, y entrenado con el optimizador AdamW durante 682 pasos con una tasa de aprendizaje principal de 3e-05. El nombre del repositorio y del subdirectorio (`rrbf-520m-M-adamw-lr3e-5-k1-o22`) sugiere un experimento sistematico de comparacion de optimizadores y configuraciones de entrenamiento.

El modelo se publica como una coleccion de subcarpetas, cada una de las cuales constituye un directorio de modelo completo con su propia model card y un fichero `EXPORT.json` que recoge hiperparametros, hashes y el modelo base empleado. En el momento de la consulta solo aparece documentada una variante. El tamano del repositorio es de 3,2 GB y los pesos se distribuyen en formato `safetensors`.

La relevancia de este modelo es fundamentalmente experimental: no se trata de un lanzamiento comercial ni de un modelo de proposito general con benchmarks publicados, sino de un artefacto de investigacion sobre optimizacion de entrenamiento. No se dispone de informacion sobre el dataset de ajuste fino, los idiomas soportados, la licencia ni el pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (inferida de `AutoModelForCausalLM`); detalles no disponibles |
| Parametros totales | Aproximadamente 520M (segun el nombre del modelo); no confirmado en la model card |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF documentadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base mas alla de su uso como modelo causal de lenguaje. El modelo base fue preentrenado con el optimizador Muon (referenciado como `OptimizerStudy/muon_*`), mientras que el ajuste fino publicado se realizo con AdamW, tasa de aprendizaje principal de 3e-05, 682 pasos, semilla 20261022 y rotacion k1. La variante documentada se entreno con precision de matmul tf32 en GPU de clase A100.

No se especifica el numero de tokens de ajuste fino, la composicion del dataset (pese a que el nombre "BioFacts" sugiere un corpus de hechos sobre biologia), ni si se aplicaron tecnicas de RLHF, DPO o instruccion. El fichero `EXPORT.json` de cada subcarpeta contiene hashes e hiperparametros, pero su contenido no se detalla en la informacion disponible. El experimento parece centrado en estudiar el efecto del optimizador y la configuracion de entrenamiento sobre un modelo de 520M, mas que en optimizar capacidades de proposito general.

## Capacidades

- Generacion de texto autoregresiva como modelo causal de lenguaje.
- Ajuste fino orientado, segun el nombre, a conocimiento factual de biologia ("BioFacts"); el alcance real no esta documentado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre optimizadores: comparar el efecto de AdamW frente a Muon en el ajuste fino de un modelo de 520M, usando las subcarpetas del repositorio como puntos de comparacion controlados.
- Reproducibilidad de experimentos: el fichero `EXPORT.json` con hiperparametros y hashes permite replicar el entrenamiento y verificar la integridad de los pesos.
- Prototipado de bajo coste: un modelo de 520M puede ejecutarse en hardware modesto para pruebas de pipeline de generacion de texto antes de escalar a modelos mayores.
- Generacion de texto sobre dominio biologico: si el ajuste fino cumple lo que sugiere su nombre, podria emplearse para redactar o resumir contenido factual de biologia, siempre con verificacion humana dada la ausencia de benchmarks.
- Evaluacion de tecnicas de entrenamiento en entornos academicos: servir como caso de estudio de configuraciones de learning rate y pasos en modelos pequenos.
- Base para nuevos ajustes finos: al ser un modelo pequeno y con pesos en safetensors, puede reutilizarse como punto de partida para tareas especificas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 2,1 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para pesos, mas overhead; cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en fp16; el entrenamiento documentado se realizo en A100.
- Cabe en GPU consumer: si, con margen amplio dada la escala de 520M parametros.
- Opciones de despliegue: la libreria indicada es `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BioFacts 520m | ~520M | no disponible | no disponible | Hugging Face (WUrbane) | Ajuste fino experimental, sin benchmarks |
| GPT-2 (OpenAI) | 124M–1.5B | 1024 tokens | MIT | Hugging Face | Modelo causal de referencia en esta escala |
| Pythia (EleutherAI) | 70M–12B | 2048 tokens | Apache 2.0 | Hugging Face | Suite de investigacion con checkpoints intermedios |
| SmolLM2 (Hugging Face) | 135M–1.7B | hasta 8192 tokens | Apache 2.0 | Hugging Face | Modelo pequeno moderno con benchmarks publicados |

La comparacion es orientativa: BioFacts 520m carece de datos publicos de contexto, licencia y rendimiento, por lo que no puede contrastarse en igualdad de condiciones con las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en tareas de generacion, razonamiento o conocimiento factual.
- Licencia no especificada: no puede asumirse uso comercial; es necesario contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no documentados: se desconoce si el modelo esta entrenado principalmente en ingles u otras lenguas.
- Longitud de contexto desconocida: no es posible planificar aplicaciones que requieran ventanas largas.
- Riesgo de alucinacion: al ser un modelo pequeno y de ajuste fino acotado, la fiabilidad factual es incierta; el nombre "BioFacts" no garantiza correccion en dominios cientificos.
- Sesgos: no documentados; los modelos de esta escala suelen heredar sesgos de sus corpus de preentrenamiento.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Pipeline no definido en Hugging Face: la integracion automatica con herramientas puede requerir configuracion manual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WUrbane/biofacts-520m
- Modelo base referenciado (no verificado): `OptimizerStudy/muon_*` en Hugging Face
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
