# Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W8A16-Vision

## Resumen

Qwen3.6-35B-A3B-Hauhau-Aggressive-W8A16-Vision es un checkpoint cuantizado a 8 bits publicado por el usuario Xananthium sobre el modelo HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, cuyo origen último es Qwen/Qwen3.6-35B-A3B. Se trata de un transformer de tipo MoE (mezcla de expertos) con 35.951.822.704 parametros totales, etiquetado con la arquitectura qwen3_5_moe y con vision integrada, lo que indica que acepta entrada de imagen ademas de texto. El checkpoint se distribuye en formato safetensors con pesos INT8 y un cargador propio incluido en el repositorio.

El problema que resuelve es el de servir localmente un modelo MoE de ~36.000 millones de parametros con un peso en disco de 38,4 GB, manteniendo los pesos INT8 originales exportados con ModelOpt y escalas por canal, en lugar de recurrir a una cuantizacion posterior que degradaria la calidad. Para ello adapta el layout de los tensores a los kernels nativos de vLLM 0.31.0 mediante un formato de carga especifico (qwen_w8a16_view), lo que exige instalar el cargador incluido antes de servir el modelo.

Su relevancia es acotada y muy reciente: el repositorio se creo y actualizo el 6 de octubre de 2026, acumula 0 descargas y 0 likes, y no cuenta con validacion de la comunidad. Ademas, la model card solo aporta pruebas sinteticas pequenas y advierte explicitamente de que no son puntuaciones de benchmarks de ciberseguridad publicados. La licencia declarada es apache-2.0, pero el propio autor senala que se aplican tambien las licencias upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), etiqueta `qwen3_5_moe`; incluye proyecciones SSM y modulo de vision segun la model card |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B segun la nomenclatura "A3B" del nombre del modelo; no confirmado de forma explicita en la informacion proporcionada |
| Longitud de contexto | no disponible (el ejemplo de despliegue de vLLM usa `--max-model-len 200000`) |
| Tipos de cuantizacion | INT8 W8A16 (pesos INT8 con escalas por canal, activaciones BF16) en formato `compressed-tensors`; existe una vista W8A8 con activaciones INT8 dinamicas por token en un export archivado aparte; los pesos de lenguaje se reconstruyeron desde un GGUF Q8_K_P |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (el autor indica que se aplican tambien las licencias upstream) |
| Formato de pesos | safetensors (INT8 ModelOpt con escalas por canal); cargador propio en `loader/`; requiere vLLM 0.31.0 con `--load-format qwen_w8a16_view` |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) de ~36.000 millones de parametros totales con aproximadamente 3.000 millones de parametros activos por token, segun la convencion de nomenclatura "A3B". La etiqueta de arquitectura `qwen3_5_moe` y la mencion explicita a "proyecciones small/SSM" en la model card sugieren un diseno hibrido con componentes de estado (SSM) junto a la atencion clasica, aunque la informacion disponible no detalla la configuracion de capas, numero de expertos ni ratio de enrutamiento. El checkpoint anade ademas un modulo de vision, lo que lo convierte en un modelo multimodal, y conserva pesos MTP (multi-token prediction), si bien la decodificacion especulativa no se activo durante las pruebas.

En cuanto al proceso de construccion, no se trata de un entrenamiento nuevo sino de un proceso de reconstruccion y recuantizacion. Los pesos de lenguaje se reconstruyeron a partir de un GGUF Q8_K_P del modelo Hauhau; la vision y el MTP se tomaron del Qwen oficial. En la exportacion a INT8 se mantuvieron en mayor precision los embeddings, la cabeza de salida, la vision, el MTP, los routers y determinadas proyecciones pequenas o SSM. No hay datos disponibles sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre fases de RLHF, DPO u otras tecnicas de alineamiento del modelo original. La model card solo documenta los hiperparametros de muestreo recomendados para codigo y razonamiento: temperatura 0.6, top_p 0.95, top_k 20, min_p 0, presence_penalty 0, repetition_penalty 1, con el modo thinking activado.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con parser de razonamiento dedicado (`--reasoning-parser qwen3` en vLLM).
- Generacion de codigo, con soporte de tool calling nativo y parser especifico (`--tool-call-parser qwen3_coder`).
- Capacidad multimodal de vision: la model card indica que el modulo de vision "paso dos fixtures de imagen para W8A8"; no se documenta el alcance exacto de las tareas visuales soportadas.
- Soporte de function calling / tool calling integrado en el servidor vLLM mediante `--enable-auto-tool-choice`.
- Pesos MTP (multi-token prediction) retenidos en el checkpoint, aunque la decodificacion especulativa no se habilito en la evaluacion publicada.
- Perfil "uncensored" y "aggressive" heredado del modelo base Hauhau, orientado a reducir rechazos de contenido.
- Capacidades multilingues: no disponible; la informacion proporcionada no enumera idiomas soportados.

## Casos de uso

- Inferencia local en hardware propio: el checkpoint ocupa 38,4 GB, de modo que puede servirse con dos GPUs de 24 GB o una de 48 GB usando tensor parallelism 2, tal como indica el ejemplo de vLLM del autor, evitando el coste de APIs externas.
- Generacion de codigo en pipelines internos: el soporte nativo de tool calling con el parser `qwen3_coder` permite integrarlo como agente que invoca funciones, ejecuta tests o abre pull requests dentro de un flujo de CI/CD.
- Agentes multi-paso con razonamiento: el modo thinking y el parser `qwen3` permiten separar la traza de razonamiento de la respuesta final, lo que facilita la orquestacion de tareas encadenadas con trazabilidad.
- Analisis de documentos con componentes visuales: al incluir modulo de vision, puede utilizarse para extraer informacion de capturas, diagramas o documentos escaneados combinados con texto.
- Evaluacion de seguridad y red teaming: al tratarse de una variante "uncensored", resulta util como sujeto de pruebas para medir la eficacia de filtros y guardrails propios antes de desplegar modelos alineados en produccion.
- Investigacion sobre cuantizacion: el repositorio incluye metadatos de reconstruccion y un fichero `results/precision-comparison.json` que permite estudiar el impacto de INT8 W8A16 frente a W8A8 en un MoE con componentes SSM y vision.
- Despliegue de chatbot especializado sin restricciones tematicas: para dominios donde los modelos alineados rechazan peticiones legitimas (ficcion, seguridad ofensiva autorizada, contenido adulto) y siempre que la licencia y el cumplimiento normativo lo permitan.
- Servicio de alto contexto con cache KV cuantizada: el uso de `--kv-cache-dtype turboquant_4bit_nc` en el ejemplo oficial permite reducir el consumo de memoria de la cache y ampliar la ventana efectiva en tareas de resumen de documentos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los unicos datos medidos estan en `results/precision-comparison.json` y los describe como "pruebas sinteticas pequenas, no puntuaciones de benchmarks de ciberseguridad publicados"; los valores numericos de ese fichero no se incluyen en la informacion proporcionada. Los artefactos no evaluados no tienen puntuacion medida. Por tanto, no se dispone de MMLU, HumanEval, GSM8K ni de ninguna otra metrica comparable.

## Requisitos de hardware

- Peso de los parametros en INT8: 38,4 GB de repositorio, que se corresponde aproximadamente con el peso de los tensores en disco; los componentes mantenidos en BF16 (embeddings, cabeza de salida, vision, MTP, routers) anaden una sobrecarga adicional no cuantificada en la informacion disponible.
- Configuracion recomendada por el autor: tensor parallelism 2 con `--dtype bfloat16`, es decir, dos GPUs trabajando en paralelo.
- GPU profesionales: funcionaria en 2x A100 40 GB, 2x A100 80 GB o 2x H100, con margen suficiente para la cache KV.
- GPU de consumo: dos RTX 4090 de 24 GB (48 GB agregados) dejarian en torno a 9-10 GB para cache KV y activaciones, un margen muy ajustado que obliga a reducir `--max-model-len` y a usar cache KV cuantizada; una unica RTX 4090 de 24 GB no puede alojar los pesos.
- Opciones de despliegue: exclusivamente vLLM 0.31.0 con el cargador incluido (`--load-format qwen_w8a16_view`); la model card indica explicitamente que la carga generica con Transformers no esta soportada. No se documenta compatibilidad con llama.cpp, Ollama o TGI.
- Cache KV: el ejemplo oficial emplea `turboquant_4bit_nc`, lo que reduce el consumo de memoria de la cache frente a BF16.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W8A16-Vision | 35.951.822.704 | no disponible (ejemplo a 200.000) | INT8 W8A16, compressed-tensors | apache-2.0 (upstream aplicable) | Repositorio publico, 0 descargas, 0 likes, requiere cargador propio |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (modelo base) | no disponible | no disponible | no disponible | no disponible | Repositorio publico en HuggingFace |
| Qwen/Qwen3.6-35B-A3B (modelo original) | no disponible | no disponible | pesos originales | no disponible | Repositorio publico en HuggingFace |

No se dispone de datos de parametros, contexto, licencia ni rendimiento de los modelos base mas alla de su identificador, por lo que la comparacion se limita a la relacion de derivacion. No hay informacion sobre otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Modelo "uncensored": el ajuste del modelo base reduce deliberadamente los rechazos, por lo que puede producir contenido inapropiado, ofensivo o peligroso; no es adecuado para despliegues de cara al publico sin filtros y guardrails externos.
- Perfil "aggressive": el nombre del checkpoint sugiere un tono o estilo de respuesta agresivo heredado del modelo base; no se detalla en la informacion disponible en que consiste exactamente.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad ni de tasas de alucinacion; al ser un modelo de 3B parametros activos, la precision factual esperable es inferior a la de modelos densos de mayor tamano activo.
- Sin validacion de la comunidad: 0 descargas y 0 likes, repositorio creado el 6 de octubre de 2026; el fichero de comparativa de precision contiene solo pruebas sinteticas pequenas, no benchmarks estandarizados.
- Compatibilidad de despliegue muy restringida: requiere vLLM 0.31.0 y la instalacion del cargador del repositorio; la carga generica con Transformers no esta soportada, lo que complica su integracion en stacks existentes.
- Proceso de reconstruccion: los pesos de lenguaje proceden de un GGUF Q8_K_P del modelo base y no del checkpoint original en precision completa, por lo que puede existir una degradacion acumulada no cuantificada respecto al modelo original.
- Licencia: aunque se declara apache-2.0, el autor advierte de que se aplican las licencias upstream; conviene verificar la licencia del modelo base Hauhau y del Qwen original antes de un uso comercial.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera de los idiomas con los que se entreno el modelo original.
- Decodificacion especulativa no verificada: los pesos MTP se conservan, pero el autor indica que no se habilito la decodificacion especulativa en las pruebas.
- La busqueda web realizada no arrojo ningun resultado tecnico relevante sobre este modelo; los unicos resultados devueltos no guardan relacion con el ambito del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W8A16-Vision
- Modelo base (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- La busqueda web no devolvio enlaces adicionales relevantes (papers, blogs, repos o demos) sobre este modelo.
