# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed0

## Resumen

DIET trajectory: OLMo2-medium (~305M), Dolma, seed 0 es un modelo de lenguaje entrenado desde cero con la arquitectura OLMo2 por el grupo stanfordasl, dentro del proyecto de investigación DIET sobre trayectorias en el espacio de pesos (weight-space). No es un modelo pensado para uso en producción, sino un artefacto de investigación cuyo propósito es permitir el análisis de cómo evolucionan los pesos y las representaciones a lo largo de un entrenamiento completo, guardando checkpoints intermedios con una cadencia fija.

El modelo emplea una arquitectura transformer densa con 768 dimensiones ocultas, 16 capas, 12 cabezas de atención (12 cabezas KV, sin GQA) y una dimensión intermedia de 3072, sumando aproximadamente 305 millones de parámetros. Se entrenó sobre el subconjunto `emozilla/dolma-v1_7-3B`, un espejo nativo de Hugging Face del corpus Dolma v1.7 muestreado proporcionalmente entre sus componentes, con un presupuesto de 2.000 millones de tokens y una ventana de contexto de 2048 tokens.

Su relevancia es metodológica: la colección incluye múltiples ejecuciones idénticas salvo por la semilla aleatoria, lo que permite estudiar la variabilidad entre trayectorias de entrenamiento y comparar dinámicas de pesos. Está publicado bajo licencia Apache 2.0 y en formato safetensors bf16, con checkpoints accesibles mediante ramas `stepN`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (`olmo2_medium_dense`) |
| Parametros totales | ~305M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); checkpoints en ramas `stepN` |

Detalles de configuracion: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12`.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo2 en su variante densa de tamano medio, definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`. Es un transformer decoder-only convencional con 16 capas, atencion multi-cabeza completa (12 cabezas de query y 12 de key/value, es decir, sin grouped-query attention), embeddings posicionales limitados a 2048 tokens y capas feed-forward de 3072 dimensiones. No incorpora mecanismos de mezcla de expertos ni atencion lineal.

El entrenamiento consistio en preentrenamiento puro con perdida de entropia cruzada sobre lenguaje (`distillation.teacher_schedule=none` en `src/run_distillation.py`, es decir, sin profesor de destilacion). Se uso AdamW con learning rate 3e-5, betas (0.9, 0.95), weight decay 0.1, scheduler coseno y precision bf16, sobre GPUs H200. El presupuesto fue de 2.000 millones de tokens (`token_budget: 2000000000`) con `max_steps: 30517` y guardado de checkpoints cada 100 pasos (`save_steps: 100`). Los datos se transmitieron en streaming desde el espejo de Dolma v1.7 en lugar de usar paquetes preempaquetados en el repositorio original, aunque la procedencia indica que el entrenamiento efectivo uso una cache empaquetada. La innovacion del proyecto no esta en la receta sino en la estructura de publicacion: multiples ejecuciones con la misma receta y distinta semilla, con checkpoints intermedios, para analisis de trayectorias en el espacio de pesos.

## Capacidades

- Generacion de texto autoregresiva basica en ingles.
- Modelado de lenguaje y continuacion de texto; es su capacidad principal y practicamente la unica entrenada de forma explicita.
- No se ha documentado entrenamiento con RLHF, DPO ni ajuste de instrucciones, por lo que no cabe esperar un comportamiento fiable de seguimiento de instrucciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Valor como objeto de estudio: checkpoints intermedios en ramas `stepN` para analisis de dinamica de entrenamiento y comparacion entre semillas.

## Casos de uso

- Investigacion sobre dinamica de entrenamiento: cargar checkpoints de distintas ramas `stepN` y analizar como evolucionan los pesos, las normas por capa o las representaciones internas a lo largo de los 30.517 pasos.
- Estudios de variabilidad entre semillas: comparar esta ejecucion (seed 0) con las demas de la coleccion para medir cuanto diverge el resultado final con recetas identicas, util para trabajos sobre reproducibilidad.
- Analisis en el espacio de pesos (weight-space): calcular distancias entre checkpoints, trayectorias de interpolacion o linear mode connectivity usando los pesos bf16 publicados.
- Experimentos de destilacion o inicializacion: usar los checkpoints como punto de partida o como profesor de un modelo menor en estudios controlados, dado el bajo coste computacional de un modelo de 305M.
- Pruebas de infraestructura de entrenamiento: servir como modelo pequeno de referencia para validar pipelines de preentrenamiento, logging de checkpoints y carga en `transformers` con la arquitectura OLMo2.
- Generacion de texto de dominio general en ingles para experimentos academicos de evaluacion de modelos pequenos, sin expectativas de calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6-0,7 GB solo para pesos (~305M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- En cuantizacion de 8 bits: ~0,3 GB de pesos; en 4 bits: ~0,15-0,2 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento o evaluacion por lotes se usarian A100/H100, aunque el modelo es demasiado pequeno para aprovecharlas.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` (libreria declarada), y por compatibilidad de arquitectura OLMo2, tambien vLLM, TGI o llama.cpp tras conversion a GGUF, aunque no se han publicado conversiones oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| DIET trajectory OLMo2-medium (este) | ~305M | 2048 | Dolma v1.7, 2B tokens | Apache 2.0 | Checkpoints intermedios para analisis de trayectorias |
| Pythia-410M (jjalora/diet-traj-pythia-410m-*) | ~410M | 2048 | The Pile | Apache 2.0 | Coleccion equivalente del mismo proyecto sobre arquitectura GPT-NeoX |
| OLMo2 oficial (variantes mayores) | desde ~1B en adelante | mayor | Dolma | Apache 2.0 | Modelos de referencia de la familia; no disponibles en este tamano exacto en la informacion proporcionada |
| Modelos pequenos tipo GPT-2 / distilgpt2 | 124M-355M | 1024 | WebText | MIT / Apache 2.0 | Alternativas de tamano comparable, sin checkpoints de trayectoria |

Los datos de rendimiento comparativo no estan disponibles para este modelo.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no debe usarse como asistente conversacional ni en produccion orientada a usuario final.
- Entrenado solo con 2.000 millones de tokens, muy por debajo de lo habitual en modelos de su tamano; la calidad de generacion sera limitada y la perplexidad elevada en comparacion con modelos entrenados con ordenes de magnitud mas de datos.
- Ventana de contexto de solo 2048 tokens, insuficiente para tareas de contexto largo.
- Solo ingles; el rendimiento en castellano u otros idiomas sera deficiente.
- Riesgo alto de alucinacion y de generar texto incoherente en dominios especializados, dado el bajo presupuesto de entrenamiento.
- Sesgos inhererentes al corpus Dolma, que no ha sido filtrado ni alineado para seguridad en esta ejecucion.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no esta pensado ni validado para ello; cualquier uso en produccion requeriria evaluacion propia.
- El nombre del repositorio incluye "diet" y "traj", lo que indica que su valor esta en los checkpoints intermedios y la comparacion entre semillas, no en el checkpoint final como modelo autonomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed0
- Repositorio de recetas y configuraciones: https://github.com/jjalora/diet-lm (referenciado en la model card como `jjalora/diet-lm`)
- Coleccion relacionada de trayectorias Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m-* (referenciada en la model card)
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Paper o blog del proyecto DIET: no disponible en la informacion proporcionada.
