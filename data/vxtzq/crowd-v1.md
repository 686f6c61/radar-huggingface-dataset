# Vxtzq/Crowd-v1

## Resumen
Crowd-v1 es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros desarrollado por Vxtzq en el marco del proyecto comunitario CrowdGPT, una iniciativa de entrenamiento distribuido entre participantes que aportan cómputo. Se publica como una definición de arquitectura y un formato de pesos común que los clientes de CrowdGPT descargan para entrenar colectivamente, más que como un modelo listo para usar en producción. La arquitectura es un transformer causal decoder-only con Grouped-Query Attention, RoPE, SwiGLU y weight tying, además de un componente de memoria denominado "engram" con 350 millones de parámetros alojados en CPU.

El modelo se entrenó sobre 42.500 millones de tokens procedentes de openbmb/Ultra-FineWeb-L3, HuggingFaceFW/fineweb y el dataset propio Vxtzq/CrowdGPT. La ventana de contexto es de 2048 tokens y el vocabulario de 151.669 entradas. La relevancia de esta ficha es doble: por un lado, documenta un experimento de entrenamiento distribuido abierto; por otro, advierte de que los pesos publicados están incompletos y no deben emplearse para generación de texto coherente.

El propio autor indica de forma explícita que el preentrenamiento ha finalizado pero que los pesos están "rotos": contienen conocimiento lingüístico parcial y no cabe esperar respuestas coherentes de control de calidad (QA) ni generación de código. Cualquier evaluación práctica debe hacerse con esa limitación en mente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con Grouped-Query Attention, RoPE, SwiGLU y weight tying; componente de memoria "engram" en CPU |
| Parametros totales | 1.007.787.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bf16) |
| Idiomas soportados | no disponible (la model card declara "ia", sin lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (model_bf16.safetensors y engram_bf16.safetensors) |

Otros datos técnicos declarados: vocabulario de 151.669 tokens, dimensión oculta de 1536, 24 capas, 16 cabezas de atención, 4 cabezas KV, dimensión de cabeza 96, dimensión oculta del MLP de 2560, inicialización normal con σ = 0,02, 227.865 buckets en la tabla de engram y 350 millones de parámetros de engram en CPU.

## Arquitectura y entrenamiento
El núcleo es un transformer decoder-only de 24 capas con atención causal agrupada (16 cabezas de consulta y 4 de clave-valor, con dimensión de cabeza 96), codificación posicional rotatoria (RoPE, theta 10.000), normalización LayerNorm, MLP SwiGLU con dimensión intermedia 2560 y weight tying entre la matriz de embedding y la de salida. La atención se describe como "causal / chunked". El modelo incorpora además un módulo EngramMemory: una tabla de embedding dispersa de 227.865 buckets y dimensión 1536 que se mantiene en CPU y se indexa mediante un hash calculado a partir del token anterior y el actual (px * 1000003 + idx, módulo el número de buckets), lo que actúa como una memoria de n-gramas fuera de la GPU.

El entrenamiento consumió 42.500 millones de tokens según la model card, con datos de Ultra-FineWeb-L3, FineWeb y el dataset propio CrowdGPT. No se documentan fases de RLHF, DPO ni ajuste por instrucciones, ni detalles sobre la composición exacta del dataset o el cómputo total empleado. El propósito declarado del release es servir de base común para el entrenamiento distribuido de CrowdGPT, no entregar un modelo final.

## Capacidades
- Generación de texto autoregresiva básica, limitada por el estado incompleto de los pesos.
- Conocimiento lingüístico parcial derivado de 42.500 millones de tokens de preentrenamiento.
- Memoria de n-gramas mediante el módulo engram, que puede recuperar asociaciones locales de tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe concreta; la model card solo declara el código "ia".
- No se documentan modos de pensamiento (thinking), visión ni audio.
- El autor advierte explícitamente de que no debe esperarse generación coherente de QA ni de código.

## Casos de uso
- Investigación sobre entrenamiento distribuido: el modelo sirve como punto de partida reproducible para estudiar cómo convergen pesos entrenados por múltiples participantes con la infraestructura de CrowdGPT.
- Desarrollo de infraestructura de entrenamiento: los clientes de CrowdGPT pueden descargar la definición y el formato de pesos para validar sus pipelines de carga, sincronización y agregación de gradientes.
- Experimentación con memorias de n-gramas: el módulo engram permite investigar el impacto de tablas de hash externas en CPU sobre la perplejidad de un transformer pequeño.
- Pruebas de código de inferencia: el repositorio incluye un script de inferencia de referencia (con transformers y safetensors) útil para validar implementaciones propias de atención agrupada, RoPE y SwiGLU.
- Estudio de fallos y estados intermedios de entrenamiento: al publicarse pesos parcialmente entrenados, permite analizar qué capacidades emergen y cuáles no en un modelo de 1B parámetros tras 42.500 millones de tokens.
- Base para ajuste fino experimental: con licencia MIT, un equipo puede partir de estos pesos para probar recetas de post-entrenamiento, asumiendo que el punto de partida está degradado.
- Docencia: ejemplo práctico de arquitectura transformer moderna con GQA y weight tying para cursos de aprendizaje automático.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni perplejidad, y el autor indica que los pesos están incompletos, por lo que cualquier medición estándar carecería de valor comparativo.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 2 GB para los pesos del transformer (1.007 millones de parámetros × 2 bytes), más memoria para activaciones y caché KV.
- Caché KV: con 4 cabezas KV de dimensión 96 y 24 capas, la caché es reducida; a 2048 tokens ocupa del orden de decenas de MB en bf16.
- El módulo engram añade 350 millones de parámetros adicionales alojados en CPU (tabla de embedding dispersa), por lo que requiere RAM del sistema además de VRAM.
- Cabe holgadamente en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, así como en A100, H100 y L4.
- Opciones de despliegue: el autor proporciona código de inferencia en PyTorch puro con transformers y safetensors; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI, y el uso de custom_code complica el soporte en frameworks estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Crowd-v1 | ~1,0 B | 2048 | MIT | Pesos parciales, no usable para QA | Enfoque de entrenamiento distribuido con memoria engram |
| TinyLlama-1.1B | ~1,1 B | 2048 | Apache 2.0 | Modelo final ajustado | Referencia habitual para modelos de ~1B |
| Llama 3.2 1B | ~1,2 B | 128.000 | Llama 3.2 Community License | Modelo final ajustado | Contexto muy superior y ajuste por instrucciones |
| Qwen2.5-1.5B | ~1,5 B | 32.768 | Apache 2.0 | Modelo final ajustado | Mayor tamaño y contexto, con soporte multilingüe |

La comparación debe interpretarse con cautela: Crowd-v1 no es un modelo final y no se han publicado métricas que permitan situarlo frente a estas alternativas en tareas estándar. Los datos de los modelos comparables proceden de sus respectivas documentaciones públicas.

## Limitaciones y advertencias
- Los pesos están incompletos según el propio autor: no generan QA ni código coherentes y no deben usarse en producción.
- Riesgo elevado de salidas sin sentido, repeticiones y alucinaciones por el estado parcial del entrenamiento.
- Contexto limitado a 2048 tokens, insuficiente para muchas aplicaciones actuales.
- No se documentan idiomas soportados ni evaluación multilingüe; el código "ia" en la model card no identifica un idioma natural.
- No hay información sobre sesgos del dataset ni sobre filtrado de contenido.
- El repositorio ocupa 2815,7 GB, lo que implica una descarga muy costosa en tiempo y almacenamiento.
- La licencia MIT permite uso comercial, pero el estado del modelo hace inviable ese uso sin un entrenamiento adicional sustancial.
- El código de inferencia se declara obsoleto y solo para pruebas; la dependencia de custom_code puede romper la compatibilidad con versiones futuras de transformers.
- No se documentan procesos de RLHF, DPO ni moderación, por lo que no hay garantías de alineación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Vxtzq/Crowd-v1
- Repositorio GitHub: https://github.com/Vxtzq/CrowdGPT
- Sitio del proyecto CrowdGPT: https://crowdgpt.net
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset CrowdGPT: https://huggingface.co/datasets/Vxtzq/CrowdGPT
