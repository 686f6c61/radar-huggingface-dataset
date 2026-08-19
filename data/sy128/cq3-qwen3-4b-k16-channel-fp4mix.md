# sy128/CQ3-Qwen3-4B-K16-Channel-FP4Mix

## Resumen

CQ3-Qwen3-4B-K16-Channel-FP4Mix es un checkpoint de cuantización del modelo Qwen3-4B, publicado por el usuario sy128 (Shawn Yin) en Hugging Face. Se trata de una variante que combina cuantización de 4 bits en coma flotante (FP4) con un esquema de canales K16, es decir, mantiene 16 bits de precisión para los canales más sensibles de las matrices de pesos. El objetivo es reducir el uso de memoria y acelerar la inferencia en hardware con recursos limitados, preservando al mismo tiempo la calidad del modelo original.

El modelo base, Qwen3-4B, es un transformer denso de 4.400 millones de parámetros desarrollado por Alibaba Qwen, con soporte multilingüe, razonamiento, generación de código y tool calling. Esta cuantización concreta no añade capacidades nuevas, pero permite desplegar el modelo en entornos con restricciones de VRAM o en CPU, manteniendo un equilibrio entre eficiencia y fidelidad. El repositorio contiene 17,7 GB de pesos en formato safetensors, lo que sugiere que la cuantización no es una compresión estándar de 4 bits, sino una mezcla de precisiones con un overhead considerable.

La relevancia de este modelo radica en su enfoque de cuantización por canales, una técnica que suele ofrecer mejor calidad que la cuantización por tensor completa, especialmente en modelos pequeños. Sin embargo, la documentación pública es muy limitada: no se especifican la licencia, los idiomas soportados, el proceso de calibración ni los benchmarks de rendimiento, por lo que cualquier evaluación debe basarse en los datos del modelo base y en pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención GQA (del modelo base Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B soporta 32.768 tokens, ampliable a 131.072 con extension de contexto) |
| Tipos de cuantizacion | FP4 mezclado con canales K16 (16 bits) |
| Idiomas soportados | no disponible (el modelo base Qwen3-4B soporta mas de 100 idiomas) |
| Licencia | no disponible (el modelo base Qwen3-4B usa Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer denso con atención de consultas agrupadas (GQA), 36 capas, dimensiones ocultas de 2.560 y 32 cabezas de atención. Fue entrenado con 4 billones de tokens en un corpus multilingüe, seguido de un ajuste fino supervisado (SFT) y optimización con preferencias humanas (RLHF/DPO). El modelo base soporta modos de pensamiento (thinking) y no pensamiento, y puede alternar entre ambos mediante un token especial.

La cuantización CQ3-Qwen3-4B-K16-Channel-FP4Mix aplica una estrategia de cuantización por canales: las matrices de pesos se dividen en canales (normalmente por filas o columnas) y se asigna una precisión de 4 bits en coma flotante (FP4) a la mayoría de los canales, mientras que los canales considerados más críticos se mantienen en 16 bits (K16). Esta técnica busca minimizar la pérdida de precisión en canales con alta sensibilidad, algo especialmente relevante en modelos pequeños donde cada bit cuenta. No se ha publicado información sobre el conjunto de calibración utilizado, el proceso de cuantización (post-entrenamiento o QAT) ni las métricas de error antes y después de la cuantización.

## Capacidades

- Generación de texto y finalización de secuencias en múltiples idiomas, heredadas del modelo base Qwen3-4B.
- Razonamiento paso a paso y modo de pensamiento (thinking mode) activable mediante tokens especiales.
- Generación de código en diversos lenguajes de programación, con soporte para depuración y explicación de código.
- Tool calling y function calling, permitiendo integración con APIs y agentes externos.
- Capacidades multilingües amplias (el modelo base soporta más de 100 idiomas).
- Comprensión de instrucciones complejas y seguimiento de diálogos multi-turno.
- La cuantización no añade capacidades nuevas, pero permite ejecutar estas funciones con menor huella de memoria.

## Casos de uso

- Despliegue en entornos con VRAM limitada: gracias a la cuantización mixta FP4/K16, el modelo puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 (8 GB) con un lote pequeño, manteniendo una calidad aceptable para tareas de generación de texto.
- Inferencia en CPU: el tamaño reducido de los pesos (aunque el repo pesa 17,7 GB, la cuantización efectiva reduce la memoria necesaria) permite ejecutar el modelo en servidores sin GPU, usando frameworks como llama.cpp o vLLM con soporte CPU.
- Asistentes de código en local: un desarrollador puede integrar este modelo en un IDE o CLI para autocompletar código, explicar fragmentos o generar tests, sin depender de servicios en la nube.
- Chatbots de atención al cliente: el modelo base Qwen3-4B es adecuado para conversaciones multi-turno con contexto de hasta 32K tokens; la cuantización permite desplegarlo en infraestructura modesta para gestionar consultas frecuentes.
- Análisis de documentos multilingües: con soporte para más de 100 idiomas, el modelo puede resumir, traducir o extraer información de documentos en varios idiomas, siempre que se respete la ventana de contexto.
- Prototipado rápido de agentes con tool calling: al mantener la capacidad de function calling del modelo base, se puede construir un agente que consulte APIs, bases de datos o ejecute acciones, con la ventaja de un menor coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la informacion disponible. Los datos de rendimiento del modelo base Qwen3-4B (por ejemplo, MMLU, HumanEval, GSM8K) no son directamente aplicables a la versión cuantizada, ya que la cuantización introduce pérdidas de precisión que deben medirse de forma independiente. Se recomienda realizar una evaluación propia con los conjuntos de datos relevantes para el caso de uso antes de desplegar el modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El tamaño del repositorio (17,7 GB) sugiere que los pesos no están comprimidos a 4 bits de forma estándar; si la cuantización efectiva es de 4 bits, la memoria necesaria rondaría los 2,5-3 GB para los pesos, más overhead de activaciones y KV cache. Sin embargo, el tamaño del repo indica que puede haber otros archivos (optimizer states, etc.) que no se usan en inferencia.
- GPU recomendadas: para una inferencia fluida, se recomienda al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). Para mayor velocidad, GPUs con soporte FP4 nativo (como RTX 40 series o superiores) son preferibles.
- Compatibilidad con consumer GPU: sí, en principio cabe en GPUs de 8 GB o más, dependiendo de la longitud de contexto y el tamaño de lote.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers (con carga de safetensors). Dado que el formato es safetensors, se puede convertir a GGUF si se desea usar con llama.cpp.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantización real y el framework utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B (base) | 4,4B | 32K (ampliable a 128K) | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| CQ3-Qwen3-4B-K16-Channel-FP4Mix | 4,4B | no disponible | no disponible | safetensors | Cuantización mixta FP4/K16 |
| Qwen3-4B-GGUF (Q4_K_M) | 4,4B | 32K | Apache 2.0 | GGUF | Cuantización estándar de 4 bits para llama.cpp |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otras cuantizaciones de modelos similares. La principal diferencia entre la cuantización de sy128 y una GGUF Q4_K_M es la técnica: la primera usa FP4 por canales con canales K16, mientras que la segunda usa cuantización por bloques con escalares. Sin benchmarks comparativos, no es posible determinar cuál ofrece mejor calidad.

## Limitaciones y advertencias

- No se ha publicado información sobre el proceso de cuantización, el conjunto de calibración ni las métricas de error, lo que dificulta evaluar la fidelidad respecto al modelo original.
- La licencia no está especificada en el repositorio; aunque el modelo base es Apache 2.0, el autor no ha declarado la licencia de esta derivada, lo que puede generar incertidumbre legal para uso comercial.
- El tamaño del repositorio (17,7 GB) es inusualmente grande para una cuantización de 4 bits, lo que sugiere que puede incluir archivos adicionales o que la cuantización no es eficiente en almacenamiento.
- El modelo base Qwen3-4B puede presentar sesgos y alucinaciones, especialmente en idiomas poco representados; la cuantización puede amplificar estos problemas en casos extremos.
- No se garantiza la compatibilidad con todas las herramientas de inferencia; es necesario probar la carga del safetensors con el framework elegido.
- La ventana de contexto real de esta cuantización no está documentada; se asume la del modelo base, pero la cuantización puede afectar a la gestión de posiciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sy128/CQ3-Qwen3-4B-K16-Channel-FP4Mix
- Perfil del autor: https://huggingface.co/sy128
- Página personal del autor: https://shawnyin128.github.io/
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Paper tecnico de Qwen3: https://arxiv.org/pdf/2505.09388
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
