# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed6

## Resumen

DIET trajectory: OLMo2-medium (~305M), Dolma, seed 6 es un modelo de lenguaje de aproximadamente 305 millones de parámetros entrenado desde cero con la arquitectura OLMo2. Lo publica el grupo stanfordasl como parte del proyecto DIET de análisis en el espacio de pesos (weight-space). No es un modelo pensado para producción ni para uso conversacional, sino un artefacto de investigación: una de las múltiples ejecuciones de preentrenamiento que solo se diferencian en la semilla aleatoria, diseñadas para estudiar la trayectoria de entrenamiento y las propiedades del espacio de pesos resultante.

El modelo emplea una arquitectura transformer densa de tipo OLMo2 con 16 capas, dimensión oculta de 768, 12 cabezas de atención (sin GQA, ya que num_key_value_heads es también 12) y una longitud máxima de posición de 2048 tokens. Se entrenó sobre el espejo en Hugging Face `emozilla/dolma-v1_7-3B`, consumido en streaming, con un presupuesto de 2.000 millones de tokens y un recetario de preentrenamiento puro de entropía cruzada, sin destilación ni ajuste por preferencias.

Su relevancia es metodológica: forma parte de una colección (junto a la serie `jjalora/diet-traj-pythia-410m-*`) que permite comparar ejecuciones idénticas salvo por la semilla, lo que resulta útil para estudiar variabilidad de entrenamiento, linear mode connectivity y la geometría del espacio de pesos en arquitecturas OLMo2 sobre datos Dolma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo2 (transformer denso, decoder-only) |
| Parámetros totales | ~305M |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (max_position_embeddings) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

Detalles de configuración: hidden_size=768, intermediate_size=3072, num_hidden_layers=16, num_attention_heads=12, num_key_value_heads=12, max_position_embeddings=2048.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo2 en su variante densa "medium" (~305M parámetros), definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`. Se trata de un transformer decoder-only estándar con 16 capas, dimensión oculta 768, FFN de 3072 y atención multi-cabeza con 12 cabezas de query y 12 de key/value (es decir, sin grouped-query attention). El contexto máximo es de 2048 tokens.

El entrenamiento consistió en preentrenamiento puro de modelado de lenguaje (entropía cruzada), con `distillation.teacher_schedule=none` en `src/run_distillation.py`, es decir, sin profesor ni destilación. Se usó AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y precisión bf16. Los datos provienen de `emozilla/dolma-v1_7-3B`, un espejo comunitario en Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming (sin pre-empaquetado). El presupuesto total fue de 2.000 millones de tokens, con `max_steps=30517` y `save_steps=100`, ejecutado en GPUs H100 (clúster "makau", job 10840, iniciado el 2026-11-20). La única diferencia respecto a las demás ejecuciones de la colección es la semilla aleatoria (seed 6). Los checkpoints se publican en ramas `stepN` (solo pesos, safetensors bf16), y la rama `main` contiene los pesos finales una vez completado el entrenamiento.

## Capacidades

- Generación de texto autoregresiva básica en inglés, como resultado del preentrenamiento de modelado de lenguaje.
- Razonamiento y conocimiento factual limitados por el tamaño (~305M) y el presupuesto de entrenamiento (2.000M tokens).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- Su función principal es servir como punto de una trayectoria de entrenamiento para análisis e investigación, no como asistente.

## Casos de uso

- Análisis de trayectorias de entrenamiento: comparar los checkpoints de las ramas `stepN` de esta ejecución (seed 6) con los de otras semillas de la colección para estudiar cómo evoluciona la pérdida y las representaciones a lo largo del preentrenamiento.
- Estudio del espacio de pesos: al ser ejecuciones idénticas salvo por la semilla, permite analizar linear mode connectivity, simetrías y distancias entre soluciones en arquitecturas OLMo2.
- Investigación sobre variabilidad de semilla: medir la dispersión de métricas downstream entre semillas con el mismo recetario y datos, aislando el efecto del azar inicial.
- Reproducibilidad de recetas de preentrenamiento: servir de referencia para validar pipelines de entrenamiento OLMo2 sobre Dolma en streaming, con configuración y provenance documentados en `run.json`.
- Experimentos de destilación o fine-tuning controlados: usar los pesos como inicialización para estudiar cómo afecta el punto de partida (distintas semillas) al ajuste posterior en tareas concretas.
- Docencia y divulgación: ejemplo ligero (~305M) y de licencia permisiva para ilustrar el ciclo completo de preentrenamiento de un transformer con datos Dolma y checkpoints intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1,2 GB solo para pesos (~305M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 2-3 GB con contexto completo de 2048 tokens.
- En cuantización de 8 bits cabría en torno a 0,6-1 GB de pesos; en 4 bits, alrededor de 0,3-0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060/4060 o superior) es suficiente; también funciona en CPU para inferencia puntual.
- Cabe holgadamente en GPU consumer, incluidas las de gama baja con 6-8 GB de VRAM.
- Opciones de despliegue: transformers (librería declarada), y por tamaño debería ser compatible con llama.cpp/Ollama y vLLM si se convierte el checkpoint, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| DIET trajectory OLMo2-medium (este) | ~305M | 2048 | Apache 2.0 | Investigación de trayectorias |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | Investigación de trayectorias (Pythia) |
| OLMo2 (variantes oficiales de AllenAI) | desde ~1B en adelante | mayor que 2048 | Apache 2.0 | Modelos de propósito general |

La comparación con modelos de propósito general no es directa: este checkpoint no está pensado para tareas downstream, sino para análisis del proceso de entrenamiento. Frente a la serie Pythia de la misma colección, cambia la arquitectura (OLMo2 frente a Pythia) y los datos (Dolma frente al corpus de Pythia). No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni por preferencias humanas, por lo que no debe usarse como asistente conversacional.
- Riesgo alto de alucinación y de generar texto incoherente o repetitivo, dado su tamaño y presupuesto de entrenamiento limitados.
- Solo inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Contexto máximo de 2048 tokens, insuficiente para muchas aplicaciones de producción.
- Sesgos potenciales heredados del corpus Dolma, sin filtrado ni mitigación documentados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para ello por sus limitaciones de calidad.
- El campo `git_commit` en `run.json` figura como "unknown", lo que dificulta la reproducibilidad exacta del código.
- Los checkpoints intermedios están en ramas `stepN` y solo contienen pesos; es necesario cargar la configuración por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed6
- Repositorio del proyecto DIET: https://github.com/jjalora/diet-lm
- Colección de referencia Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m
- Dataset Dolma v1.7 (espejo): https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
