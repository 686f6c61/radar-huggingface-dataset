# Vxtzq/Crowd-v1.5

## Resumen

Crowd-v1.5 es un modelo de lenguaje de tipo transformer denso con aproximadamente 1.000 millones de parámetros (1.007.787.392 exactos), desarrollado por Vxtzq bajo el paraguas del proyecto comunitario CrowdGPT. Se trata de un modelo de generación de texto con arquitectura transformer convencional que incorpora atención de consulta agrupada (GQA), codificación posicional rotatoria (RoPE) y una innovación destacable: una tabla de "engramas" de 350 millones de parámetros alojada en CPU que actúa como memoria asociativa auxiliar. El modelo se distribuye con pesos parcialmente entrenados (40.000 millones de tokens hasta la fecha) y su propósito declarado no es el uso en producción, sino servir como definición común y formato de pesos para el entrenamiento distribuido colaborativo de CrowdGPT.

La relevancia de este lanzamiento es fundamentalmente metodológica: propone un esquema en el que clientes individuales descargan los pesos, contribuyen cómputo y entrenan colectivamente un modelo compartido. No obstante, el propio autor advierte que el modelo está en fase de preentrenamiento y que no debe esperarse una generación de texto coherente. El repositorio de Hugging Face tiene un tamaño de 0,0 GB, cero descargas y un "like", lo que indica que se trata de un artefacto en estado embrionario y de muy baja adopción.

En cuanto a idiomas, la model card declara únicamente "ia" (interlingua) como idioma soportado, sin que se detalle la composición lingüística del corpus de entrenamiento. La licencia es MIT, lo que permite uso comercial sin restricciones significativas, aunque la calidad actual del modelo hace inviable cualquier aplicación práctica inmediata.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con GQA, RoPE, SwiGLU y memoria de engramas |
| Parámetros totales | 1.007.787.392 (aprox. 1B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (pesos publicados en bf16) |
| Idiomas soportados | "ia" (interlingua), según model card |
| Licencia | MIT |
| Formato de pesos | safetensors (model_bf16.safetensors, engram_bf16.safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con 24 capas, dimensión oculta de 1.536, 16 cabezas de atención y 4 cabezas KV (GQA con ratio de repetición 4), dimensión de cabeza de 96 y MLP SwiGLU con dimensión intermedia de 2.560. El vocabulario es de 151.669 tokens, con ataduras de pesos (weight tying) entre la capa de entrada y la de salida. La atención es causal y "chunked", y la codificación posicional usa RoPE con theta de 10.000. La inicialización es una distribución normal con σ = 0,02.

El elemento diferencial es el módulo `EngramMemory`, una tabla de embedding dispersa de 227.865 buckets y 350 millones de parámetros alojada en CPU, que se consulta mediante un hash determinista de pares de tokens consecutivos (`hi = (px * 1000003 + idx) % ENG_NUM_BUCKETS`). Esta memoria asociativa busca capturar patrones de n-gramas de forma eficiente sin ocupar VRAM. El entrenamiento declarado es de 40.000 millones de tokens, con datasets que incluyen openbmb/Ultra-FineWeb-L3, HuggingFaceFW/fineweb y Vxtzq/CrowdGPT. No se especifica si hubo RLHF, DPO ni fases de ajuste fino; el modelo está en preentrenamiento activo.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el estado parcial del entrenamiento.
- Memoria asociativa de engramas para capturar secuencias frecuentes de tokens.
- Soporte de contexto de hasta 2.048 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe no verificada; la model card solo declara "ia".
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- El propio autor indica que no debe esperarse coherencia en la generación.

## Casos de uso

- Investigación en entrenamiento distribuido: el modelo sirve como formato de pesos común para que clientes de CrowdGPT descarguen, entrenen y vuelvan a subir actualizaciones, validando el protocolo de entrenamiento colaborativo.
- Estudio de memorias asociativas en transformers: la tabla de engramas de 350M parámetros en CPU permite experimentar con recuperación de n-gramas y comparar su impacto frente a atención estándar.
- Reproducción de arquitecturas de ~1B con GQA: útil como base didáctica para analizar configuraciones de cabezas KV reducidas (4 KV heads frente a 16 heads) y su efecto en memoria y latencia.
- Pruebas de infraestructura de inferencia: al ser un modelo pequeño con pesos bf16, permite validar pipelines de carga con safetensors y decodificación personalizada antes de escalar a modelos mayores.
- Benchmarking de inicialización y estabilidad: la inicialización normal σ=0,02 y el estado parcial de entrenamiento lo hacen útil para estudiar curvas de pérdida tempranas en modelos de 1B.
- Docencia sobre preentrenamiento: sirve para ilustrar el ciclo de vida de un modelo comunitario y las limitaciones de distribuir pesos no finalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB para los pesos del transformer (1B parámetros × 2 bytes), más overhead de activaciones y caché KV para 2.048 tokens.
- La tabla de engramas (350M parámetros) reside en CPU, añadiendo ~1,4 GB de RAM en bf16 o ~700 MB si se cuantiza, según implementación.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente para el transformer; el cuello de botella es la RAM del sistema para los engramas.
- Cabe holgadamente en GPU consumer; no requiere A100 ni H100.
- Opciones de despliegue: el código de inferencia proporcionado es PyTorch puro con `safetensors` y `transformers` (tokenizer); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el autor advierte que el código será deprecado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Disponibilidad |
|---|---|---|---|---|---|
| Crowd-v1.5 | ~1B | 2.048 | MIT | Preentrenamiento parcial (40B tokens) | Hugging Face, repo 0,0 GB |
| TinyLlama-1.1B | ~1,1B | 2.048 | Apache 2.0 | Entrenado (3T tokens) | Hugging Face, ampliamente adoptado |
| Llama 3.2 1B | ~1,24B | 128.000 | Llama 3.2 Community License | Entrenado y ajustado | Hugging Face, ecosistema amplio |
| Qwen2.5-1.5B | ~1,5B | 32.768 | Apache 2.0 | Entrenado y ajustado | Hugging Face, ecosistema amplio |

La comparación es desfavorable en madurez: Crowd-v1.5 no compite en calidad con alternativas de tamaño similar porque su entrenamiento está incompleto y su adopción es prácticamente nula. Su interés es exclusivamente experimental y de investigación en entrenamiento distribuido.

## Limitaciones y advertencias

- Modelo en preentrenamiento parcial: no genera texto coherente de forma fiable, según advierte el propio autor.
- Riesgo elevado de alucinación y salidas sin sentido por el estado incompleto de los pesos.
- Contexto limitado a 2.048 tokens, muy por debajo de los estándares actuales.
- Idiomas soportados declarados de forma mínima ("ia"); no hay evidencia de competencia multilingüe.
- Sesgos desconocidos: no se documenta composición del dataset ni procesos de mitigación.
- Licencia MIT permite uso comercial, pero la calidad actual hace inviable cualquier despliegue en producción.
- El código de inferencia se declara "for testing only" y será deprecado en versiones futuras.
- Repositorio de 0,0 GB y cero descargas: no hay garantía de mantenimiento ni soporte comunitario.
- La memoria de engramas en CPU puede introducir latencia adicional y depende de implementación no estandarizada.

## Enlaces

- Hugging Face: https://huggingface.co/Vxtzq/Crowd-v1.5
- Repositorio GitHub: https://github.com/Vxtzq/CrowdGPT
- Sitio web del proyecto: https://crowdgpt.net
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset HuggingFaceFW/fineweb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset Vxtzq/CrowdGPT: https://huggingface.co/datasets/Vxtzq/CrowdGPT
