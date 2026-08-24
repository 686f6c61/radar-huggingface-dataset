# wrenchpilot/presets

## Resumen

El repositorio `wrenchpilot/presets` no contiene un modelo de lenguaje en sí, sino una colección de presets y scripts de configuración para ejecutar servidores de inferencia local con `llama.cpp` en Windows 11. Está pensado para un entorno concreto: una GPU NVIDIA RTX 2080 Super de 8 GB de VRAM y 24 GB de RAM del sistema. Incluye cuatro presets que apuntan a modelos GGUF cuantizados de terceros (Qwen3.6-35B, medgemma-27b-it y granite-4.0-micro-OpenMed), junto con scripts de compilación y lanzamiento para la versión estándar de `llama.cpp` y para el fork TurboQuant.

La relevancia de este repositorio radica en que facilita la puesta en marcha de modelos locales con cuantización GGUF, memoria unificada CUDA y plantillas de chat Jinja, sin necesidad de configurar manualmente cada parámetro. Es una herramienta práctica para desarrolladores que quieran desplegar modelos de código abierto en hardware de gama media, aunque no aporta ningún modelo nuevo ni innovación arquitectónica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de configuracion y scripts) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | Configurable por preset: 131,072 tokens (Qwen3.6-35B) y 65,536 tokens (medgemma y granite) |
| Tipos de cuantizacion | Depende de los modelos referenciados: UD-Q4_K_M (Qwen3.6-35B) y Q4_K_M (medgemma, granite) |
| Idiomas soportados | No disponible (depende de los modelos subyacentes) |
| Licencia | No disponible |
| Formato de pesos | No aplica (el repositorio contiene archivos .ini, .bat y documentacion) |

## Arquitectura y entrenamiento

Este repositorio no define ninguna arquitectura de modelo ni proceso de entrenamiento. Es un conjunto de archivos de configuración para `llama.cpp`, un motor de inferencia de modelos de lenguaje en C++. Los presets definen parámetros como tamaño de contexto, activación de flash attention, memoria unificada, plantillas de chat Jinja y opciones de razonamiento. Los modelos subyacentes (Qwen3.6-35B-A3B-MTP, medgemma-27b-it, granite-4.0-micro-OpenMed) son desarrollados por terceros y se descargan automáticamente desde Hugging Face en el primer arranque. No hay información sobre datos de entrenamiento, técnicas de alineación o innovaciones técnicas propias de este repositorio.

## Capacidades

- Ejecución de modelos GGUF cuantizados con `llama.cpp` en Windows 11.
- Soporte para dos builds: el estándar CUDA y el fork TurboQuant (con ajustes específicos de KV-cache).
- Activación de memoria unificada CUDA para permitir que modelos grandes desborden a RAM del sistema.
- Configuración de contexto largo (hasta 131,072 tokens) para modelos que lo soporten.
- Plantillas de chat Jinja y soporte de razonamiento (reasoning) activado por defecto.
- Entrada de imágenes habilitada en el preset de medgemma-27b-it (depende del modelo).
- Descarga automática de modelos desde Hugging Face y caché en `D:\models`.
- Servidor HTTP en `localhost:8080` con interfaz de API compatible con OpenAI (proporcionada por `llama.cpp`).

## Casos de uso

- Inferencia local de modelos de lenguaje en un PC con GPU modesta: el preset Qwen3.6-35B permite ejecutar un modelo MoE de 35B con cuantización Q4_K_M en una RTX 2080 Super de 8 GB, usando memoria unificada para compensar la falta de VRAM.
- Desarrollo y prueba de aplicaciones de chat con contexto largo: la ventana de 131,072 tokens del preset Qwen3.6-35B es adecuada para experimentar con documentos extensos o conversaciones multi-turno sin truncamiento.
- Evaluación de modelos médicos en local: el preset medgemma-27b-it, con entrada de imágenes, permite probar un modelo especializado en dominio médico sin enviar datos a servicios externos.
- Integración en pipelines de automatización: el servidor HTTP de `llama.cpp` expone una API compatible con OpenAI, por lo que puede conectarse a herramientas como LangChain, n8n o scripts propios.
- Comparación de rendimiento entre builds de `llama.cpp`: los scripts permiten alternar entre la versión estándar y TurboQuant para medir diferencias de velocidad y uso de memoria en el mismo hardware.
- Entorno de desarrollo para contribuir a `llama.cpp`: los scripts de compilación facilitan tener un entorno reproducible con Visual Studio 2022 y CUDA para probar cambios en el código fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de rendimiento, latencia ni throughput. El rendimiento dependerá del modelo concreto, la cuantización, el hardware y la configuración de contexto. La documentación advierte que los modelos de 35B y 27B no cabrán completamente en 8 GB de VRAM y que el rendimiento variará según la cantidad de modelo y KV-cache que permanezca en la GPU.

## Requisitos de hardware

- Hardware objetivo declarado: Windows 11, GPU NVIDIA RTX 2080 Super con 8 GB de VRAM, 24 GB de RAM del sistema.
- VRAM estimada: los modelos referenciados (35B y 27B en Q4_K_M) requieren más de 8 GB de VRAM; se usa memoria unificada CUDA para desbordar a RAM del sistema.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA (la RTX 2080 Super es la de referencia, pero funcionará con GPUs más recientes como RTX 3090, RTX 4090, A100, etc.).
- No cabe completamente en una GPU de consumo de 8 GB; se necesita RAM del sistema adicional (24 GB o más) para modelos grandes.
- Opciones de despliegue: `llama.cpp` server (estándar o TurboQuant), accesible vía HTTP en `localhost:8080`. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles. Dependerán del modelo, la cuantización y la proporción de capas en GPU frente a RAM.

## Comparativa con modelos similares

No aplica directamente, ya que este repositorio no es un modelo. Como herramienta de despliegue, se puede comparar con alternativas para ejecutar modelos GGUF en local:

| Herramienta | Formato | Facilidad de uso | Hardware objetivo | Licencia |
|---|---|---|---|---|
| `wrenchpilot/presets` | GGUF via llama.cpp | Media (requiere compilar) | Windows + NVIDIA | No disponible |
| Ollama | GGUF | Alta (instalador y CLI) | Multiplataforma | MIT |
| LM Studio | GGUF | Alta (interfaz grafica) | Windows/macOS/Linux | Propietaria (gratuita) |
| llama.cpp (directo) | GGUF | Baja (linea de comandos) | Multiplataforma | MIT |

La ventaja de este repositorio es que está preconfigurado para un hardware específico y automatiza la descarga de modelos, pero carece de la portabilidad y el ecosistema de herramientas como Ollama o LM Studio.

## Limitaciones y advertencias

- No es un modelo de IA: es un conjunto de scripts y configuraciones. Las capacidades y limitaciones reales dependen de los modelos subyacentes (Qwen, medgemma, granite), no de este repositorio.
- Hardware limitado: la RTX 2080 Super de 8 GB no puede ejecutar los modelos de 35B y 27B completamente en VRAM; el uso de memoria unificada puede provocar paginación y ralentizaciones severas.
- Contexto largo consume mucha memoria: la ventana de 131,072 tokens puede agotar la RAM del sistema (24 GB) y causar inestabilidad. Se recomienda reducir el contexto si aparecen problemas.
- Dependencia de rutas fijas: los scripts esperan directorios concretos (`D:\llama.cpp`, `D:\models`). Si se usan otras rutas, hay que editar los archivos `.bat`.
- Exposición de red: el servidor escucha en `0.0.0.0:8080`, lo que lo hace accesible desde cualquier interfaz de red. Solo debe exponerse en redes de confianza.
- Licencia no disponible: no se especifica la licencia del repositorio, lo que puede limitar su uso comercial o redistribución.
- Sin soporte oficial: es un proyecto personal del autor, sin garantías de mantenimiento ni actualizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wrenchpilot/presets
- Repositorio GitHub del autor (local-ai): https://github.com/wrenchpilot/local-ai
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Web de WrenchPilot (software para talleres diesel): https://wrenchpilot.io/pricing y https://wrenchpilot.io/ai-capabilities
