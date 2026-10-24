# yujiepan/timestral-tiny-random

## Resumen

`yujiepan/timestral-tiny-random` es un checkpoint de depuración con pesos inicializados aleatoriamente, construido por el desarrollador yujiepan a partir de la configuración de `mistralai/Timestral-209M`. No es un modelo entrenado: su propósito es servir como fixture reproducible para probar el paquete de inferencia `timestral` de Mistral AI, verificar formas de tensores, serialización safetensors y el contrato de la interfaz de forecasting (univariante, multivariante y con covariables pasadas/conocidas).

El modelo conserva la estructura del original pero reducida: 8 capas de transformer en lugar de 24, anchura de 64 en vez de 768, una sola cabeza de atención de 64 dimensiones y SwiGLU de 128 en lugar de 2.048. Mantiene, en cambio, elementos estructurales clave del diseño Timestral: tamaño de parche 32, 21 nudos de cuantiles y el decodificador de dos flujos DHF con cabeza de cuantiles monótona. El resultado son 671.360 parámetros en F32 (2,7 MB), ejecutables en CPU.

Su relevancia es exclusivamente práctica para ingeniería: permite que un pipeline de CI valide en segundos la instalación, la carga del checkpoint y el flujo de `forecast()` sin descargar el modelo de 209M ni disponer de GPU. No debe confundirse con un modelo de lenguaje causal: la propia model card advierte de que no es compatible con Transformers como causal-LM ni con servidores SGLang/vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer sobre representación por parches con decodificador de dos flujos DHF y cabeza de cuantiles monótona; 8 capas con esquema de bloques `["time","time","time","time_variate"] × 2` |
| Parámetros totales | 671.360 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 (`context_length` en la configuración) |
| Tipos de cuantización | no disponible; el checkpoint se distribuye únicamente en F32 y no se han publicado variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no aplica / no disponible; es un modelo de series temporales, sin entrada ni salida de texto |
| Licencia | no disponible; la model card no la declara y el script de creación se limita a intentar copiar el fichero `LICENSE` del modelo base |
| Formato de pesos | safetensors (`model.safetensors`, 2,7 MB, precisión F32) |

Otros parámetros estructurales: tamaño de parche y de bloque de 32, anchura `d_model` de 64, 1 cabeza de atención de 64 dimensiones, anchura intermedia SwiGLU de 128, 21 nudos de cuantiles y normalización RMSNorm.

## Arquitectura y entrenamiento

La entrada se proyecta mediante un `PatchRepresentation` compuesto por un `ResidualBlock` (lineal 64→256, activación SiLU, lineal 256→64 y conexión residual 64→64), que convierte la serie en parches de tamaño 32. El tronco es un transformer de 8 bloques: cada bloque incluye una atención con proyección `wQKV` de 64→192, proyección de salida 64→64 y una compuerta lineal adicional de 64→64 (`_gate`), más un MLP `FusedSwiGLU` con matrices de 64→256 y 128→64, todo normalizado con RMSNorm. Los bloques siguen un esquema alternado: dos ciclos de tres bloques "time" seguidos de un bloque "time_variate", donde el bloque de variate procesa dos ramas de atención en paralelo. La salida pasa por un decodificador de dos flujos DHF y una cabeza de cuantiles monótona con 21 nudos.

No hay entrenamiento. El checkpoint se genera con semilla 42 inicializando todos los parámetros con una normal de media 0 y desviación 0,02, salvo los parámetros cuyo nombre termina en `scale`, que se fijan a 1. No existe dataset de entrenamiento, ni fases de ajuste supervisado, RLHF o DPO, ni datos de composición del corpus. Los únicos datos heredados del modelo base son los hiperparámetros de `config.json` (revisión `9874d252ab0aae16f7f7c999f98f98d6ad7d8365`) y los metadatos de formato (`{"format": "pt"}`).

## Capacidades

- Pronóstico probabilístico de series temporales: emite cuantiles (21 nudos) para un horizonte configurable mediante `prediction_length`.
- Interfaz de forecasting univariante y multivariante.
- Soporte de covariables pasadas (`past_covariates`) y conocidas a futuro (`known_covariates`), tal como demuestra el ejemplo del autor con tensores de contexto, pasado y conocido.
- Control del horizonte por número de parches (`per_shot_horizon_patches`, con valor 32 en el ejemplo).
- Ejecución en CPU o GPU (`device="cuda"` si está disponible) a través de la clase `TimestralForecaster`.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni modo "thinking".
- No tiene capacidades multilingües, de visión, audio ni generación de texto: no procesa lenguaje natural.
- No es servible con vLLM, SGLang, TGI, llama.cpp ni Ollama.

## Casos de uso

- Smoke test de instalación de `timestral`: verificar en CI que `pip install git+https://github.com/mistralai/timestral.git` funciona y que `TimestralForecaster.from_pretrained()` carga el checkpoint sin errores, en menos de un segundo y sin GPU.
- Pruebas de contrato de la API de forecasting: validar que `forecast()` acepta `context`, `prediction_length`, `past_covariates` y `known_covariates`, y que devuelve un objeto con atributo `quantiles` de la forma esperada antes de conectar el servicio real.
- Integración continua en repositorios que envuelven Timestral: usar este checkpoint como fixture determinista (semilla 42) para detectar regresiones en el pipeline de carga y preprocesado sin depender de descargas de 209M parámetros.
- Desarrollo de servicios de inferencia: probar el enrutado, la serialización de la respuesta (tensor de cuantiles a JSON) y la gestión de errores de un microservicio de forecasting con un modelo de 2,7 MB que cabe en cualquier contenedor.
- Validación de herramientas de serialización y metadatos: comprobar lectura/escritura de safetensors en F32, verificación de `config.json` y compatibilidad con utilidades internas de empaquetado de modelos.
- Docencia y divulgación de arquitecturas de forecasting: inspeccionar con `print(model)` la estructura completa (representación por parches, atención con compuerta, SwiGLU fusionado, cabeza de cuantiles) sin necesidad de recursos de cómputo.
- Pruebas de formas y dimensionalidad con series sintéticas: el ejemplo del autor usa senos y cosenos generados con `torch.arange` para comprobar que el número de parches, el horizonte y los 21 nudos se combinan correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad de pronóstico (GIFT-Eval, TIME, fev-bench, MASE, CRPS) carecería de significado.

Como contexto del modelo base y no de este checkpoint: la información de prensa disponible indica que la familia Timestral de Mistral AI, con tamaños de 5M a 209M parámetros, sitúa a su mayor checkpoint en primer lugar entre los modelos preentrenados de forecasting zero-shot en GIFT-Eval, TIME y fev-bench, sin necesidad de GPU en inferencia. No se han proporcionado los valores numéricos de dichas evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,7 MB de pesos en F32 (671.360 parámetros × 4 bytes), más activaciones mínimas; en FP16/BF16 serían aproximadamente 1,3 MB.
- GPU recomendadas: ninguna en particular; cualquier GPU con más de 1 GB de memoria es sobrada. El ejemplo oficial funciona en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, e incluso en iGPU) y en CPU sin optimizaciones.
- Opciones de despliegue: exclusivamente el paquete `timestral` (`TimestralForecaster.from_pretrained`). No hay soporte para vLLM, TGI, SGLang, llama.cpp ni Ollama, ya que no es un modelo causal de lenguaje ni dispone de pesos GGUF.
- Latencia y throughput: no se han publicado mediciones. Por tamaño (menos de un millón de parámetros y 8 capas), se espera una latencia del orden de milisegundos en CPU para un contexto de 96 a 1.024 pasos, aunque este dato no está verificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yujiepan/timestral-tiny-random` (este) | 671.360 | 1.024 | Forecasting con pesos aleatorios, solo depuración | no disponible | HuggingFace, requiere paquete `timestral` |
| `mistralai/Timestral-209M` | 209M | no disponible en la información | Forecasting zero-shot preentrenado | no disponible en la información | HuggingFace, paquete `timestral` |
| Resto de la familia Timestral (desde 5M) | 5M–209M | no disponible | Forecasting zero-shot preentrenado | no disponible | HuggingFace; nombres y configuraciones exactas no disponibles |
| `yujiepan/llama-3.1-tiny-random` | 1,03M | no disponible | Modelo de lenguaje causal aleatorio, depuración | no disponible | HuggingFace, pipeline text-generation |

Frente al modelo base, este checkpoint reduce el cómputo en más de dos órdenes de magnitud (8 capas y anchura 64 frente a 24 capas y anchura 768) manteniendo la interfaz, a costa de producir salidas sin valor predictivo. Frente a los otros "tiny-random" del mismo autor, la diferencia es de dominio: aquellos sirven para probar pipelines de texto y este para pipelines de forecasting.

## Limitaciones y advertencias

- Los pesos son aleatorios: los pronósticos y cuantiles generados son ruido y no deben interpretarse ni usarse para tomar decisiones.
- No ha recibido entrenamiento alguno, por lo que no hay sesgos aprendidos que analizar, pero tampoco hay garantía de calibración de los cuantiles ni de monotonía en la práctica más allá de la propia estructura de la cabeza.
- Licencia no declarada: la model card no incluye licencia y el script de creación solo intenta copiar el `LICENSE` del modelo base si está disponible. Antes de cualquier uso más allá de pruebas internas debe verificarse la licencia de `mistralai/Timestral-209M`.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling, agentes ni conversación; cualquier intento de usarlo como LLM fallará.
- Dependencia estricta del paquete `timestral` y de una revisión concreta del mismo (commit `a534bdbd244d64f3d9d743f46c7bf6fc330ed4ff` en la model card); cambios en la API pueden romper la compatibilidad.
- El `config.json` modifica hiperparámetros del modelo base, por lo que no es intercambiable con herramientas que asuman la configuración de 209M.
- No apto para producción ni para evaluación comparativa de calidad; su uso previsto es exclusivamente pruebas y depuración.
- Idiomas no aplicables; no hay soporte multilingüe que evaluar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yujiepan/timestral-tiny-random
- Modelo base: https://huggingface.co/mistralai/Timestral-209M
- Repositorio de inferencia Timestral (Mistral AI): https://github.com/mistralai/timestral
- Perfil del autor en HuggingFace: https://huggingface.co/yujiepan
- Perfil del autor en GitHub: https://github.com/yujiepan-work
- Artículo sobre el lanzamiento de la familia Timestral: https://www.marktechpost.com/2026/10/18/mistral-timestral-time-series-foundation-model/
