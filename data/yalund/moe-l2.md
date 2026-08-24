# yalund/moe-l2

## Resumen

moe-l2 no es un modelo de lenguaje, sino un planificador de descarga de expertos (expert-offload scheduler) para llama.cpp que permite ejecutar modelos MoE de gran tamaño —como DeepSeek, Qwen o Mixtral, de más de 100 mil millones de parámetros— en GPUs NVIDIA de consumo con poca memoria VRAM. Lo desarrolla el autor yalund y se distribuye como paquete Python con binarios CUDA precompilados, licencia Apache-2.0. Su relevancia actual radica en que los modelos MoE, pese a activar solo unos pocos expertos por token, requieren cargar todos los expertos en VRAM, lo que hace inviable su ejecución local en tarjetas de 8 o 10 GB. moe-l2 resuelve este problema manteniendo los expertos en RAM del host y moviendo únicamente los expertos activados a la GPU por paso, con una caché LRU de expertos calientes.

La herramienta incluye un predictor de dominio, una caché L2 en memoria compartida y una caché de expertos en VRAM con bloqueo selectivo basado en el router del modelo. Según las mediciones del autor, un modelo DeepSeek-V2-Lite (16B MoE) que normalmente requiere 23,3 GB de VRAM puede ejecutarse con 1,6-2,0 GB y alcanzar 139-154 tokens por segundo en una RTX 4090. El proyecto lleva 13 versiones publicadas en un mes y ofrece un proxy compatible con OpenAI en localhost:11435, lo que lo hace integrable con Open WebUI, LangChain y otras herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Software de inferencia (scheduler de expert-offload para llama.cpp); no es un modelo |
| Parametros totales | No aplica (software) |
| Parametros activos | No aplica (software) |
| Longitud de contexto | No aplica (depende del modelo GGUF cargado) |
| Tipos de cuantizacion | Depende del modelo GGUF; moe-l2 trabaja con cualquier GGUF multishard |
| Idiomas soportados | Ingles y chino (etiquetas del modelo); en la practica depende del modelo cargado |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el software lee y gestiona pesos GGUF) |

## Arquitectura y entrenamiento

moe-l2 no es un modelo entrenado, sino un sistema de software de tres capas que se acopla a llama.cpp. La primera capa es un predictor de dominio que clasifica el prompt en ocho dominios y precarga los expertos mas probables. La segunda capa es una caché L2 basada en memoria compartida con mmap, precarga asincrona y lectura GGUF de copia cero. La tercera capa es una caché de expertos en VRAM con LRU bloqueado por ranura; los expertos calientes permanecen residentes y los frios se desalojan. Un mapa de router guia el pin selectivo para mantener solo los expertos top-K por capa bloqueados en VRAM, de modo que un modelo de 85 GB puede ejecutarse con aproximadamente 10,4 GB de RSS sin regresion de velocidad.

El sistema lee los pesos de los expertos directamente desde RAM del host mediante DMA PCIe, y la GPU solo recibe los expertos activados en cada paso. Incluye un proxy transparente compatible con OpenAI en localhost:11435 con streaming SSE. El proyecto no publica detalles sobre el entrenamiento del predictor de dominio ni sobre el dataset utilizado; la informacion disponible se centra en el rendimiento de inferencia y el ahorro de VRAM.

## Capacidades

- Ejecucion de modelos MoE grandes (DeepSeek, Qwen, Mixtral, 100B+ parametros) en GPUs de consumo con poca VRAM.
- Descarga de expertos a RAM del host con transferencia DMA PCIe a la GPU solo para los expertos activados.
- Caché LRU de expertos calientes en VRAM con bloqueo selectivo por capa basado en el mapa del router.
- Predictor de dominio que clasifica el prompt en ocho dominios y precarga los expertos mas probables.
- Caché L2 en memoria compartida con mmap, precarga asincrona y lectura GGUF de copia cero.
- Proxy compatible con OpenAI en localhost:11435 con streaming SSE, integrable con Open WebUI, LangChain y otras herramientas.
- Soporte de modelos GGUF multishard y descarga reanudable de modelos mediante el comando `moe-l2 model download`.
- Comando `moe-l2 doctor` para verificar el entorno (GPU, driver, Python) antes de la ejecucion.

## Casos de uso

- Ejecucion local de modelos MoE de 100B+ en estaciones de trabajo con GPUs de 8 o 10 GB: por ejemplo, un DeepSeek-V2-Lite (16B MoE) que normalmente requiere 23,3 GB de VRAM puede ejecutarse con 1,6-2,0 GB, lo que permite a desarrolladores individuales probar modelos grandes sin acceso a GPUs de datacenter.
- Desarrollo y pruebas de aplicaciones de generacion de texto con modelos MoE en entornos de bajo VRAM: el proxy OpenAI-compatible permite conectar herramientas como Open WebUI o LangChain sin modificar el codigo de la aplicacion.
- Despliegue de asistentes de codigo o chat en equipos portatiles con GPU NVIDIA (GTX 1080 a RTX 50) gracias al binario precompilado unico para sm_61-sm_120a.
- Investigacion y evaluacion de modelos MoE en hardware de consumo: los benchmarks publicados muestran rendimiento de 139-154 t/s en RTX 4090 con DeepSeek-V2-Lite, lo que permite experimentar con modelos que de otro modo serian inaccesibles.
- Integracion en pipelines de CI/CD para pruebas automatizadas de modelos MoE sin necesidad de infraestructura GPU dedicada, usando el modo de descarga reanudable y el verificador de entorno.
- Creacion de servicios de inferencia locales con streaming SSE para aplicaciones de chat o agentes, gracias al proxy transparente y la compatibilidad con el ecosistema OpenAI.

## Benchmarks y rendimiento

El autor publica mediciones propias en la model card. Se reproducen a continuacion como datos declarados por el desarrollador, no verificados de forma independiente.

Mediciones de cadena completa con `moe-l2 start --gpu` en RTX 4090:

| Modelo | VRAM con carga completa | VRAM con moe-l2 | Velocidad |
|---|---:|---:|---:|
| DeepSeek-V2-Lite (16B MoE) | 23,3 GB | 1,6-2,0 GB | 139-154 t/s |
| Qwen3.6-A3B (32B MoE) | 7,6 GB+ | 2,9 GB | 50,2 t/s (un solo hilo) |
| DeepSeek-V4-Flash (157B MoE, archivo de 85 GB) | OOM | 8,3-9,1 GB VRAM | N/A (error en upstream) |

Mediciones de cadena completa en tres GPUs (2026-08-19, bins-v0.6.0):

| GPU | DeepSeek-V2-Lite | Qwen3.6-A3B |
|---|---:|---:|
| RTX 4090 | 139-154 t/s | 25,5-44,2 t/s |
| RTX 2080 Ti (11 GB) | 86-94 t/s | 16,6-28,6 t/s |
| RTX 5090 | 141-151 t/s | 28-52,5 t/s |

No se han publicado resultados de benchmarks comparativos con otras soluciones de offload (por ejemplo, llama.cpp nativo con offload de capas o vLLM con swap de CPU) en la informacion disponible.

## Requisitos de hardware

- Linux x86_64 (obligatorio; no se soporta Windows nativo, macOS ni ARM Linux; WSL2 no verificado).
- GPU NVIDIA con driver CUDA; se proporciona un unico binario precompilado para sm_61 a sm_120a (GTX 1080 a RTX 50).
- Python 3.9 o superior.
- VRAM estimada: depende del modelo y del numero de expertos activados. Con DeepSeek-V2-Lite se reportan 1,6-2,0 GB; con Qwen3.6-A3B, 2,9 GB; con DeepSeek-V4-Flash (157B MoE), 8,3-9,1 GB.
- RAM del host: necesaria para almacenar los pesos de los expertos (por ejemplo, un archivo de 85 GB requiere al menos esa cantidad de RAM).
- Opciones de despliegue: moe-l2 se instala via pip y usa binarios CUDA precompilados; incluye proxy OpenAI-compatible, por lo que puede usarse con Open WebUI, LangChain y otras herramientas.
- Latencia y throughput: los valores medidos por el autor oscilan entre 16,6 y 154 t/s segun GPU y modelo (ver tabla de benchmarks).

## Comparativa con modelos similares

No existe una comparativa publicada con otras soluciones de offload de expertos en la informacion disponible. A modo de referencia cualitativa:

| Solucion | Enfoque | VRAM necesaria | Velocidad | Licencia |
|---|---|---|---|---|
| moe-l2 | Descarga de expertos a RAM con caché LRU en GPU | Muy baja (1,6-9,1 GB segun modelo) | 16-154 t/s segun GPU | Apache-2.0 |
| llama.cpp nativo | Offload de capas completo a GPU | Toda la VRAM del modelo | Depende del hardware | MIT |
| vLLM (con swap de CPU) | Gestion de memoria con paginacion y swap | Variable, requiere GPU grande para MoE | Alta en GPU de datacenter | Apache-2.0 |

No se dispone de datos cuantitativos de rendimiento de las alternativas en las mismas condiciones de hardware para una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje, sino una herramienta de inferencia; no aporta capacidades propias de generacion de texto.
- Solo funciona en Linux x86_64 con GPU NVIDIA; no hay soporte para Windows, macOS, ARM Linux ni WSL2 verificado.
- El rendimiento declarado proviene de mediciones del autor, no verificadas de forma independiente; los resultados pueden variar segun el hardware, el modelo y la configuracion.
- Depende de llama.cpp y de los binarios CUDA precompilados; errores en upstream pueden afectar a modelos especificos (como se menciona con DeepSeek-V4-Flash).
- El predictor de dominio y la caché L2 pueden no optimizar todos los patrones de uso; cargas de trabajo con distribuciones de expertos muy distintas a las previstas podrian degradar el rendimiento.
- La licencia Apache-2.0 permite uso comercial, pero el software incluye binarios precompilados cuyo origen y licencia de los binarios CUDA no se detallan en la informacion disponible.
- No se documentan sesgos ni riesgos de alucinacion porque no es un modelo; estos dependen del modelo GGUF que se cargue.
- La herramienta requiere conocimientos tecnicos para configurar el entorno, descargar modelos y gestionar la RAM del host.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yalund/moe-l2
- Codigo fuente en GitHub: https://github.com/yalun753/moe-l2
- Paquete en PyPI: https://pypi.org/project/moe-l2
- White paper (chino): https://github.com/yalun753/moe-l2/blob/main/references/zh/white-paper-zh.md
- Registro de cambios: https://github.com/yalun753/moe-l2/blob/main/CHANGELOG.md
