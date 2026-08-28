# Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed

## Resumen

Qwen3.8-Flash-Next-MTPLX-Optimized-Speed es una conversión cuantizada del modelo Qwen3.8-Flash-Next de Qwen, adaptada para ejecutarse de forma nativa en Apple Silicon mediante el runtime MTPLX. El modelo original es un MoE híbrido de 125B parámetros (incluyendo una tabla n-gram de 51B) que activa 6B por token, con arquitectura GDN + QSA y soporte multimodal. Esta versión aplica cuantización dinámica de 4 bits con atención en 8 bits, y añade decodificación especulativa multi-token (MTP) a través de MTPLX, logrando una aceleración de 1,7x frente a la generación autoregresiva plana en un M5 Max.

La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamaño (125B) en hardware de consumo (Mac con 96 GB o más de memoria unificada) con velocidades de decodificación superiores a 70 tokens por segundo, algo inusual para esta clase de modelos. Es una opción pensada para desarrolladores que necesitan inferencia local de alta calidad con contexto largo (262.144 tokens) sin depender de GPUs dedicadas.

El modelo se distribuye bajo la licencia qwen-community-1.0, derivada del modelo base Qwen/Qwen3.8-Flash-Next, y está disponible en formato safetensors (MLX). La descarga total es de 115,1 GB, incluyendo la tabla n-gram de 32 GB que se puede transmitir desde SSD para reducir la huella en RAM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN + QSA (MoE híbrido con Gated DeltaNet y Qwen Sparse Attention), memoria n-gram de 51B, torre de visión preservada |
| Parametros totales | 125B (incluye tabla n-gram de 51B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit dinámico con grupos de 64 pesos (MoE y matrices densas); QSA en 8-bit; GDN, normas, indexador QSA y cabeza MTP en 16-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX), con sidecar ngram-table.safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA). Tres de cada cuatro capas utilizan GDN para comprimir el historial de forma recurrente, mientras que la cuarta capa usa QSA para recuperación precisa de contexto largo. Esta combinación reduce el coste computacional frente a la atención completa, manteniendo la capacidad de manejar ventanas de 262K tokens. Además, incorpora una tabla de memoria n-gram de 51B parámetros que actúa como memoria asociativa externa, y una cabeza de predicción multi-token (MTP) con profundidad adaptativa (techo de 3 tokens).

La versión MTPLX-Optimized-Speed aplica una cuantización dinámica de 4 bits a los expertos del MoE y a las matrices densas, mientras que las proyecciones de atención QSA se mantienen en 8 bits para preservar la calidad en contextos largos. Los parámetros de GDN, normas, indexador QSA y la cabeza MTP permanecen en 16 bits. La tabla n-gram se almacena como un archivo separado que MTPLX transmite desde SSD por defecto, permitiendo que el modelo quepa en Macs de 96 GB con margen. No se dispone de información detallada sobre el entrenamiento (composición del dataset, número de tokens, técnicas de alineación) en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional y de larga forma con contexto de hasta 262.144 tokens.
- Razonamiento y resolución de tareas de código, como se evidencia en las pruebas de velocidad (tarea de codificación).
- Decodificación especulativa multi-token (MTP) con aceptación por regla de ratio de probabilidad y remuestreo residual, manteniendo la distribución original del modelo.
- Soporte multimodal: la torre de visión se conserva en los pesos, aunque no se detalla su funcionalidad en esta versión.
- Ejecución nativa en Apple Silicon mediante MTPLX, con transmisión de la tabla n-gram desde SSD para optimizar el uso de RAM.
- No se menciona soporte explícito de tool calling o function calling en la documentación disponible.

## Casos de uso

- Asistente de programación local: con 73,5 tok/s en tareas de código, permite autocompletado y generación de funciones en tiempo real dentro de un IDE, sin enviar datos a la nube.
- Procesamiento de documentos extensos: la ventana de 262K tokens es adecuada para resumir contratos, artículos científicos o informes completos en una sola pasada.
- Chat conversacional de alta calidad en entornos sin conexión: ideal para empresas que requieren privacidad de datos y despliegue en hardware propio.
- Investigación en arquitecturas MoE y decodificación especulativa: al ser un modelo abierto, permite estudiar el comportamiento de GDN, QSA y MTP en un entorno real.
- Desarrollo de aplicaciones de escritorio para macOS: integrable en apps nativas mediante la librería MLX y el runtime MTPLX, con latencia de respuesta inferior a 15 ms por token.
- Prototipado de agentes con contexto largo: aunque no se confirma tool calling, el amplio contexto y la velocidad permiten experimentar con razonamiento multi-paso y memoria extendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento corresponden a mediciones de velocidad en un Apple M5 Max con ventiladores al máximo, utilizando el servidor real de MTPLX y muestreo oficial de Qwen (temperatura 1.0, top-p 0.95, top-k 20):

| Ejecución | Velocidad (tok/s) |
|---|---|
| Tarea de codificación con MTP especulativo (por defecto) | 73,5 |
| Misma tarea en modo autoregresivo plano | 43,8 |

Esto representa un multiplicador especulativo de 1,7x a través de la ruta de servidor de producto, con salida muestreada que sigue la distribución del propio modelo.

## Requisitos de hardware

- Mac con Apple Silicon (M-series) y 96 GB o más de memoria unificada recomendado.
- VRAM estimada: aproximadamente 83 GB de pesos residentes más el conjunto de trabajo; la tabla n-gram de 32 GB se transmite desde SSD por defecto.
- GPU: se probó en un M5 Max; cualquier chip con suficiente memoria unificada debería funcionar, aunque el rendimiento variará.
- Opciones de despliegue: exclusivamente mediante MTPLX (comando `mtplx serve --model Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed`) o la aplicación de escritorio de mtplx.com. No es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: 73,5 tok/s en M5 Max con decodificación especulativa; 43,8 tok/s sin ella. La transmisión de la tabla n-gram desde SSD puede introducir latencia adicional en el primer acceso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Velocidad (M5 Max) | Licencia |
|---|---|---|---|---|---|
| Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed | 125B (6B activos) | 262.144 | 4-bit dinámico + 8-bit atención | 73,5 tok/s (MTP) | qwen-community-1.0 |
| Youssofal/Qwen3.8-Flash-Next-MTPLX-Bare-Speed | 125B (6B activos) | 262.144 | 4-bit plano | no disponible | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 125B (6B activos) | 262.144 | Sin cuantizar | no disponible | qwen-community-1.0 |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de otros modelos comparables en el ecosistema MLX con características similares (MoE de 125B con contexto 262K). La diferencia principal entre las versiones MTPLX es el nivel de precisión en las proyecciones de atención: la versión Optimized-Speed mantiene 8 bits en QSA para mayor calidad, mientras que Bare Speed usa 4 bits planos para máxima velocidad.

## Limitaciones y advertencias

- Requiere hardware específico: solo funciona en Apple Silicon con 96 GB o más de memoria unificada; no es ejecutable en GPUs NVIDIA o AMD.
- Dependencia del runtime MTPLX: el modelo no es compatible con los frameworks estándar de inferencia (vLLM, llama.cpp, TGI), lo que limita su portabilidad.
- Licencia qwen-community-1.0: es una licencia comunitaria de Qwen que puede tener restricciones para uso comercial; se recomienda revisar el texto completo de la licencia antes de desplegar en producción.
- La tabla n-gram se transmite desde SSD por defecto, lo que puede provocar latencia en el primer acceso o cuellos de botella si el almacenamiento es lento.
- No se han publicado evaluaciones de calidad (sesgos, alucinaciones, robustez) para esta versión cuantizada; la cuantización de 4 bits puede degradar ligeramente el rendimiento en tareas de razonamiento complejo.
- El modelo es una vista previa (preview) de la generación Qwen4, por lo que puede contener comportamientos inesperados o cambios en futuras versiones.
- No se dispone de información sobre los idiomas soportados; aunque el modelo base de Qwen suele ser multilingüe, esta variante no lo especifica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante Bare Speed: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Bare-Speed
- Sitio web de MTPLX: https://mtplx.com
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
