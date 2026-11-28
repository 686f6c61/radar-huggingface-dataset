# staccs/Inkling-2-Mini-QWork-IQ4

## Resumen

Inkling-2-Mini-QWork-IQ4 es una cuantizacion de 4 bits (formato IQ4) del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario staccs bajo licencia Apache 2.0. Se distribuye como un paquete "full stack" orientado a inferencia local en Apple Silicon (via MLX) y en Windows x64 (via WebGPU/ROCm), con binarios nativos firmados y notarizados por Apple y un lanzador especifico para Windows. El modelo tiene 26.070.385.152 parametros totales (segun los pesos en safetensors) y un repositorio de 35,7 GB que incluye, ademas de los pesos cuantizados, una pila de herramientas de consenso y mineria.

La particularidad del paquete no es el modelo de lenguaje en si, sino la integracion de un circuito de proof-of-work denominado QWork/1 dentro del propio forward pass del modelo. Segun la model card, el modelo puede ejecutar, de forma opcional y desactivada por defecto, un circuito de 24 capas de gated-MLP con activaciones binarias que emite recibos criptograficos verificables contra un nodo Qwencoin (qwencoind) y contra una implementacion de referencia en NumPy. El repositorio incluye tambien un nodo completo de Qwencoin, utilidades de firma Schnorr para inscripciones on-chain y herramientas para lanzar cadenas ancladas a Bitcoin.

Es relevante ahora porque combina tres tendencias: la demanda de inferencia 100% local y privada en hardware de consumo, la cuantizacion agresiva (IQ4) para reducir huella de memoria, y la experimentacion con "proof of thinking" como primitiva criptografica. No obstante, la mayor parte de la documentacion disponible describe la infraestructura de mineria y no las capacidades del modelo de lenguaje subyacente, lo que limita la evaluacion objetiva de su calidad como generador de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base thinkingmachines/Inkling-2-Mini; no se detalla en la informacion disponible) |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4 (esta variante); el autor publica tambien una variante Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, ONNX, MLX (multiformato) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base thinkingmachines/Inkling-2-Mini: no se especifica si es un transformer denso o MoE, ni el numero de capas, cabezas de atencion o dimension oculta. Lo que si se detalla es el componente anadido QWork/1, que no forma parte del entrenamiento del modelo de lenguaje sino que se ejecuta durante la inferencia: un circuito determinista de 24 capas con matrices INT16/INT32 almacenadas en un fichero qwork.bin de 528.482.328 bytes (SHA-256 8f53884f...3f2c03). El circuito expande una semilla derivada del header de bloque mediante xoshiro256** en un vector de 1024 elementos {-1, +1}, aplica 24 capas de gated-MLP con activacion signo y produce un digest SHA-256 de 64 caracteres hexadecimales.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO o ajuste por instrucciones. La model card se centra en la infraestructura de despliegue y en el esquema de proof-of-work, no en el proceso de entrenamiento del modelo de lenguaje. La innovacion tecnica destacable, por tanto, es la integracion de un circuito PoW verificable bit a bit dentro del forward pass, con un modelo de seguridad "fail-closed": el texto del usuario no puede armar el circuito, y en macOS se verifica la firma y el CDHash de los siete roles nativos antes de ejecutar.

## Capacidades

- Generacion de texto conversacional y text-generation, segun el pipeline declarado en Hugging Face.
- Ejecucion opcional de proof-of-work QWork/1 dentro del forward pass, activable con `--qwork` o `/qwork on` en macOS y con `/work PROMPT` en Windows, emitiendo recibos `[QWORK_RECEIPT v=1 ...]` verificables.
- Verificacion criptografica contra qwencoind, libqwork.so/qwork.dll y un oraculo independiente en NumPy, con paridad bit a bit declarada.
- Firma Schnorr (secp256k1) para inscripciones y respuestas on-chain en la "Qwencoin Graph", sujetas a revision explicita del propietario.
- Lanzamiento de cadenas hijo ("FUN") ancladas a Bitcoin y Qwencoin, con confirmacion manual `APPROVE`.
- Mineria GPU standalone en Windows x64 con ROCm 7.2 sobre AMD Radeon 8060S (gfx1151), con descomposicion INT16 a INT8 WMMA.
- Inferencia local sin APIs en la nube, con soporte para Apple Silicon (MLX 0.32.4, Python 3.14 embebido) y Windows x64 (WebGPU EP 0.6.0).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local privada en Mac: el paquete incluye un runtime MLX firmado y notarizado que permite ejecutar el modelo sin Homebrew ni instalaciones de Python, adecuado para equipos que no pueden enviar prompts a la nube por politica de privacidad.
- Despliegue en Windows con GPU AMD o Intel: el lanzador `launch_inkling_windows.py` configura automaticamente el WebGPU Execution Provider y verifica el SHA-256 de la DLL oficial antes de cargar, lo que simplifica el despliegue en flotas heterogeneas de estaciones de trabajo.
- Nodo Qwencoin local: el repositorio incluye qwencoind y qwencoin-cli, de modo que un investigador puede levantar un nodo mainnet y contrastar los recibos QWork emitidos por el modelo contra el consenso de la red.
- Auditoria criptografica de circuitos PoW: el fichero qwork.bin y la especificacion determinista permiten reproducir el digest con un oraculo NumPy independiente, util para revisar la solidez del esquema antes de integrarlo en produccion.
- Publicacion on-chain con revision humana: la herramienta `ord` con firma Schnorr permite que el modelo proponga inscripciones en la Qwencoin Graph, pero exige una confirmacion explicita del propietario antes de cualquier gasto o broadcast.
- Experimentacion con cadenas ancladas: hashfund y hashfun-cli permiten crear cadenas hijo privadas o dual-ancladas a Bitcoin y Qwencoin con genesis aprobado manualmente, util para pruebas de concepto de consenso.
- Mineria GPU de QWork en laboratorio: el minero ROCm standalone alcanza 18.875-20.535 H/s en una Radeon 8060S, lo que permite medir throughput real de un circuito PoW ejecutado en GPU de consumo frente a CPU (13,2 H/s con 8 workers) o Vulkan ggml (1,23 H/s).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo de lenguaje (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento proporcionados son de throughput del circuito QWork:

| Metrica | Valor declarado |
|---|---|
| Minero ROCm 7.2 en AMD Radeon 8060S (gfx1151) | 18.875-20.535 H/s |
| CPU con 8 workers | 13,2 H/s |
| Vulkan ggml | 1,23 H/s |
| Aceleracion ROCm frente a CPU | 1.455x o superior |
| Aceleracion ROCm frente a Vulkan ggml | 15.600x o superior |
| Paridad bit a bit frente a qwork.dll | 0/64 y 13/13+2 (segun la model card) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 35,7 GB e incluye pesos IQ4 y Q8_0, ademas de binarios y herramientas, por lo que el peso de los pesos IQ4 es una fraccion del total.
- GPU recomendadas: Apple Silicon (via MLX) para macOS; AMD Radeon 8060S (gfx1151) validada para el minero ROCm en Windows; se mencionan tambien NVIDIA e Intel mediante WebGPU.
- Cabe en GPU de consumo: si, segun el enfoque del autor (Apple Silicon y Windows x64 con WebGPU/ROCm), aunque no se especifica el minimo de memoria unificada o VRAM necesario para cargar los pesos IQ4.
- Opciones de despliegue: MLX en macOS, WebGPU Execution Provider 0.6.0 en Windows, ROCm 7.2 para el minero, y formatos GGUF y ONNX incluidos en el repositorio (compatibles con llama.cpp y otros runtimes, aunque no se detalla la integracion).
- Latencia y throughput de generacion de texto: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, y el paquete es una cuantizacion especifica de un modelo base (thinkingmachines/Inkling-2-Mini) con una capa de infraestructura criptografica anadida, sin datos de rendimiento que permitan una comparacion objetiva.

## Limitaciones y advertencias

- La model card documenta exhaustivamente la infraestructura de mineria y consenso, pero no las capacidades, el contexto ni los idiomas del modelo de lenguaje; evaluar su calidad como generador de texto requiere consultar el modelo base.
- Los binarios de Windows se declaran explicitamente como no firmados (`NotSigned`), a diferencia de los de macOS, que estan firmados con Developer ID y notarizados; esto supone un riesgo de integridad en despliegues Windows.
- El paquete incluye un nodo de mainnet, utilidades de firma y herramientas de lanzamiento de cadenas; aunque la mineria esta desactivada por defecto y se exige confirmacion `APPROVE`, el manejo de claves y transacciones on-chain conlleva riesgo financiero y operativo.
- No se han publicado datos sobre sesgos, tasa de alucinacion ni limitaciones idiomaticas del modelo.
- La licencia Apache 2.0 permite uso comercial, pero las herramientas de consenso y las cadenas Qwencoin/Bitcoin tienen sus propias implicaciones regulatorias y fiscales que el usuario debe evaluar.
- La verificacion de integridad depende de ficheros SHA256SUMS y de la DLL de WebGPU; el lanzador falla cerrado, pero cualquier modificacion manual de esos ficheros rompe el modelo de seguridad.
- El uso de proof-of-work y mineria puede tener un coste energetico y de hardware significativo, y su valor legal varia segun la jurisdiccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/staccs/Inkling-2-Mini-QWork-IQ4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante Q8_0: https://huggingface.co/staccs/Inkling-2-Mini-QWork-Q8
- Coleccion Inkling-2-Mini x QWork: https://huggingface.co/collections/staccs/inkling-2-mini-qwork
