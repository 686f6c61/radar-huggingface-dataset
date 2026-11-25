# wrldsuksgo2mars/Hy4-EXL3-K4-MC

## Resumen

Hy4-EXL3-K4-MC es una cuantizacion de 4 bits del modelo Hy4 de Tencent, publicada por el usuario wrldsuksgo2mars. Se trata de un checkpoint derivado (no de un modelo entrenado desde cero) que aplica la receta EXL3 con codebook MUL1 y precision K4 en los expertos enrutados, manteniendo el resto del modelo base en sus dtypes originales. El modelo resultante ocupa 482,7 GB en el repositorio y contiene 216.841.131.230 parametros segun los safetensors.

La relevancia de esta publicacion es practica: reduce el peso de un modelo Mixture-of-Experts de gran tamano para hacer viable su despliegue en infraestructura con VRAM limitada, ofreciendo ademas vistas compactas adicionales (k8-compact y k6-compact) que recodifican matrices elegibles a K8 o K6 con drafters especificos. La model card documenta con detalle el proceso de calibracion, el encoder GPTQModel utilizado y las metricas de error por modulo.

No obstante, se trata de un artefacto con cero descargas, un solo like y una libreria de inferencia (`cuteafd`) poco extendida, ademas de una calificacion de "serving qualification" aun en seguimiento. Es un checkpoint para evaluacion tecnica, no para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, derivada de tencent/Hy4; incluye torre de vision y capas DFly2 |
| Parametros totales | 216.841.131.230 |
| Parametros activos | no disponible (la model card indica top-8 routes nativos, sin cifra de parametros activos) |
| Longitud de contexto | no disponible (la calibracion usa testigos de contexto largo mas alla de 2.048 tokens, pero no se declara la ventana oficial) |
| Tipos de cuantizacion | 4-bit en expertos enrutados (K4); vistas compactas K8 y K6 para matrices elegibles; resto de pesos en dtype original |
| Idiomas soportados | no disponible (la calibracion incluye texto multilingue, sin listado de idiomas) |
| Licencia | tencent-hy-license (license: other) |
| Formato de pesos | safetensors |
| Libreria de inferencia | cuteafd |
| Tamano del repositorio | 482,7 GB |
| Payload original | 403,96 GiB |
| Payload k8-compact | 378,17 GiB |
| Payload k6-compact | 371,71 GiB |
| Codebook | MUL1 (0x83DCD12D), lado 1, escalas de salida automaticas |
| Encoder de cuantizacion | tpurtell/GPTQModel@11a7bd422f40dcaa0222b5b75cc28f3e76b80c35 |
| Dataset de calibracion | wrldsuksgo2mars/agentic-quant-panel-v2@54683731eb01c7c2fa5b801a0888e029a0e1b1c7 |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: cuantiza el modelo base tencent/Hy4 (commit c10c0de5b6f850703fb0a90e65d1c32b558b9167), que es un transformer Mixture-of-Experts con enrutamiento top-8, torre de vision e integracion de capas DFly2. La cuantizacion preserva los pesos core de Tencent y los componentes DFly2 en sus dtypes de origen, y solo comprime los expertos enrutados a K4 junto con un conjunto de matrices elegibles que se recodifican en las vistas compactas a K8 o K6.

El proceso de calibracion uso el dataset agentic-quant-panel-v2 con 1.097.388 tokens de prompts de chat con esfuerzo de razonamiento alto y 512.000 tokens del estandar ExLlamaV3, con busqueda de semilla 787 y sigma 0,025. La cobertura abarca todas las rutas naturales, despues rangos 9-16 y padding de identidad hasta un suelo de 1.024. Se realizo una pasada causal que propago reconstrucciones serializadas del core K8 y de los expertos K4; la vista K6 reutiliza las mismas matrices de Hessian. Las cinco capas DFly2 usan selecciones de KV e indexer de las capas 61, 65, 69, 73 y 77. La combinacion de expertos emplea las rutas top-8 nativas con suma ordenada en FP32. Los errores por modulo y los recuentos de cobertura se publican en `per-module-errors.csv`.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Hy4, incluyendo prompts con esfuerzo de razonamiento alto usados en la calibracion.
- Codigo: la calibracion incluye codigo fuente real, lo que sugiere soporte para tareas de programacion, aunque no se declaran benchmarks.
- Matematicas: el dataset de calibracion incluye matematicas resueltas ("worked mathematics").
- Function calling y esquemas de herramientas: la calibracion incorpora esquemas de function-call, indicando soporte de tool calling en el modelo base.
- Vision: el checkpoint preserva la torre de vision del modelo base, por lo que mantiene capacidades multimodales de imagen.
- Multilingue: la calibracion incluye texto multilingue; no se especifica la lista de idiomas.
- Contexto largo: las capas DFly2 y el testigo de contexto largo sugieren manejo de secuencias largas, sin cifra oficial de ventana.
- Vistas con drafter: las vistas k8-compact y k6-compact incluyen drafters K8 y K6 respectivamente, orientados a decodificacion especulativa.

## Casos de uso

- Despliegue de un MoE de gran tamano en infraestructura limitada: la cuantizacion K4 de los expertos reduce el payload a 403,96 GiB (original) o 371,71 GiB (k6-compact), permitiendo servir el modelo en nodos multi-GPU donde el checkpoint en precision completa no cabria.
- Evaluacion de tecnicas de cuantizacion EXL3: el repositorio publica errores por modulo en `per-module-errors.csv`, lo que permite a investigadores medir la degradacion de la cuantizacion K4/K6 frente al modelo base.
- Prototipado de asistentes con tool calling: al conservar los esquemas de function-call en la calibracion, el modelo puede usarse para probar pipelines de agentes con llamadas a herramientas antes de invertir en el modelo completo.
- Tareas multimodales de imagen y texto: la torre de vision preservada permite experimentar con descripcion de imagenes o extraccion de informacion visual en entornos de investigacion.
- Razonamiento con contexto largo: las capas DFly2 y el testigo de contexto largo lo hacen candidato para analisis de documentos extensos, siempre que se valide la ventana efectiva.
- Decodificacion especulativa: las vistas k8-compact y k6-compact con drafters dedicados permiten experimentar con aceleracion de inferencia mediante drafting.
- Analisis de codigo y matematicas: la calibracion con codigo fuente y matematicas resueltas lo hace adecuado para prototipos de asistencia en programacion y resolucion de problemas, con validacion de calidad previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta errores por modulo de cuantizacion (en `per-module-errors.csv`) y tamanos de payload, no metricas de calidad tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el payload original es de 403,96 GiB; la vista k8-compact de 378,17 GiB y la k6-compact de 371,71 GiB. A esto hay que sumar overhead de activaciones, KV cache y componentes no cuantizados, por lo que se requiere un nodo multi-GPU de alta capacidad.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del payload, se necesitan configuraciones multi-GPU de clase数据中心 (A100/H100) o superiores.
- Consumer GPU: no cabe en ninguna GPU de consumo individual; el payload minimo supera con creces los 24 GB de una RTX 4090.
- Opciones de despliegue: la libreria declarada es `cuteafd`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La calificacion de serving esta en seguimiento en CuteAFD issue #2550.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-EXL3-K4-MC | 216.841.131.230 | no disponible | K4 expertos, vistas K8/K6 | tencent-hy-license | Hugging Face, 0 descargas |
| tencent/Hy4 (base) | no disponible en la informacion | no disponible | pesos originales | tencent-hy-license | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- Artefacto derivado: no es un modelo entrenado, sino una cuantizacion del modelo base; cualquier limitacion del base se hereda.
- Riesgo de degradacion por cuantizacion: la compresion K4 de los expertos puede introducir errores que deben consultarse en `per-module-errors.csv` antes de usar en produccion.
- Serving no cualificado: la model card remite a CuteAFD issue #2550 para el seguimiento de la calificacion de serving, lo que indica que el despliegue aun no esta validado.
- Licencia restrictiva: la tencent-hy-license puede imponer condiciones al uso comercial; es necesario revisar el archivo LICENSE incluido.
- Idiomas no declarados: no hay listado oficial de idiomas soportados, solo mencion a texto multilingue en la calibracion.
- Contexto no declarado: no se especifica la ventana oficial, solo pruebas de contexto largo en paridad de referencia.
- Ecosistema limitado: la libreria `cuteafd` es poco extendida y no se documenta compatibilidad con stacks de inferencia habituales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni a alternativas.
- Madurez baja: cero descargas y un solo like en el momento de la consulta; el checkpoint debe tratarse como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/wrldsuksgo2mars/Hy4-EXL3-K4-MC
- Modelo base: https://huggingface.co/tencent/Hy4
- Dataset de calibracion: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v2
- Encoder GPTQModel: https://github.com/tpurtell/GPTQModel
- Seguimiento de serving (CuteAFD #2550): https://github.com/tpurtell/cuteafd/issues/2550
- Errores por modulo: https://huggingface.co/wrldsuksgo2mars/Hy4-EXL3-K4-MC/blob/main/per-module-errors.csv
- Licencia: https://huggingface.co/wrldsuksgo2mars/Hy4-EXL3-K4-MC/blob/main/LICENSE
