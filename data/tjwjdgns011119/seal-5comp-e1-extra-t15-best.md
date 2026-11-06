# tjwjdgns011119/seal-5comp-e1-extra-t15-best

## Resumen

SEAL E1-extra es un conjunto de seis TaskNets de 5 componentes entrenados para diseño de circuitos mediante un graph transformer con fusión temprana (`EarlyFusionMatchedSupportTaskGTN`). Lo publica el usuario de Hugging Face tjwjdgns011119 y pertenece a la familia de experimentos SEAL, en los que se combina un objetivo de error cuadrático medio (MSE) con una señal de utilidad derivada de una Loss-Net auxiliar. El modelo no es un LLM: es un modelo pequeño y especializado que predice ciclos de trabajo (duty cycles) de una topología de convertidor de 5 componentes a partir de una representación en grafo del circuito y de un objetivo de ganancia (`gamma`).

El repositorio contiene tres semillas (11, 22 y 33) y, para cada una, dos variantes: `mse` (entrenamiento solo con MSE) y `seal` (MSE más una penalización de utilidad con `utility_weight=0.5`). Cada checkpoint se eligió maximizando la utilidad de validación predicha por la Loss-Net sobre las épocas guardadas (800, 1200, ..., 4000), no mediante simulación directa con NGSpice. Los pesos se distribuyen en `safetensors` y en el `checkpoint.pt` original, con metadatos de selección, linaje y W&B.

La relevancia es acotada: se trata de un artefacto de investigación reproducible para el diseño automatizado de circuitos, no de un modelo de propósito general. No se asigna licencia nueva, no se declaran idiomas y el repo tiene 0 descargas y 0 likes en el momento de la consulta. El tamaño del repo figura como 0.0 GB, lo que sugiere pesos de muy pocos parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Graph transformer con fusión temprana (`EarlyFusionMatchedSupportTaskGTN`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo sobre grafos, no sobre secuencias de texto) |
| Tipos de cuantización | no disponible; pesos distribuidos en `safetensors` y `checkpoint.pt` |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; el autor indica que no se asigna licencia nueva |
| Formato de pesos | `safetensors` y `checkpoint.pt` (PyTorch) |
| Componentes de salida | 5 duty cycles por circuito |
| Semillas incluidas | 11, 22, 33 (variantes `mse` y `seal`) |
| Cohorte de entrenamiento | `t15_span002`, 15 gammas objetivo vistas |

## Arquitectura y entrenamiento

El modelo es un graph transformer que opera sobre un `GraphBatch` construido con `collate_graphs(arrays, raw_gamma_targets)`, que aplica una normalización `gamma/3` a los objetivos de ganancia. La salida es un vector de 5 duty cycles en `float32` que debe recortarse al intervalo [0.1, 0.9] antes de pasarse a un simulador. La inferencia se ejecuta con `loop_enabled=True` y no requiere las Loss-Nets pareadas: solo el TaskNet.

El entrenamiento usa 15 gammas objetivo vistas de la cohorte `t15_span002`. La variante `seal` añade a la pérdida MSE un término de utilidad con `utility_weight=0.5`; la variante `mse` entrena solo con MSE. La selección de checkpoint se hizo maximizando la utilidad de validación predicha por la Loss-Net sobre las épocas 800, 1200, 1600, ..., 4000, con desempate hacia la época más temprana. Según la model card, no se usaron resultados de Test ni de Reserve para esa selección, pero la cohorte de validación se solapa con contextos de evaluación vistos, por lo que los resultados vistos no constituyen una estimación independiente de holdout.

Las épocas y pasos globales seleccionados son: mse/seed11 en época 1200 (paso 44400, utilidad predicha 0.310733), seal/seed11 en época 800 (paso 29600, 0.320181), mse/seed22 en época 3600 (paso 133200, 0.310920), seal/seed22 en época 800 (paso 29600, 0.317239), mse/seed33 en época 4000 (paso 148000, 0.311007) y seal/seed33 en época 1200 (paso 44400, 0.317035).

## Capacidades

- Predicción de duty cycles para una topología de convertidor de 5 componentes a partir de una representación en grafo del circuito y un objetivo de ganancia.
- Soporte de dos modos de entrenamiento seleccionables por checkpoint: `mse` y `seal`.
- Inferencia determinista en modo `eval()` sobre un único `GraphBatch`.
- Integración con simuladores de circuito externos (el autor recomienda recortar la salida a [0.1, 0.9] antes de simular).
- Reproducibilidad mediante `bundle.json` con ajustes de entrenamiento y hashes de procedencia.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Exploración de diseño de convertidores: dado un grafo de circuito de 5 componentes y una ganancia objetivo, el modelo propone un vector de duty cycles que sirve como punto de partida para simulación con NGSpice.
- Optimización surrogate en bucles de diseño: al ser un TaskNet ligero, puede evaluarse repetidamente dentro de un optimizador (por ejemplo, búsqueda bayesiana) para preseleccionar candidatos antes de la simulación completa.
- Comparación de estrategias de entrenamiento: las variantes `mse` y `seal` por semilla permiten estudiar el efecto de añadir la señal de utilidad con `utility_weight=0.5` en la calidad de las predicciones.
- Reproducción de experimentos: el repo incluye `checkpoint.pt` byte a byte idéntico, `model.safetensors` equivalente y metadatos de linaje, lo que facilita replicar la selección de checkpoints.
- Estudio de estabilidad entre semillas: las semillas 11, 22 y 33 permiten medir la varianza de la utilidad predicha (aproximadamente 0.3107-0.3110 en `mse` y 0.3170-0.3202 en `seal`).
- Docencia e investigación en ML para EDA: sirve como ejemplo mínimo de graph transformer aplicado a diseño de circuitos, con código de carga explícito y dependencia de un paquete propio (`seal_single_duty`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la utilidad de validación predicha por la Loss-Net usada para seleccionar checkpoints:

| Método | Semilla | Época | Paso global | Utilidad predicha (selección) |
|---|---:|---:|---:|---:|
| mse | 11 | 1200 | 44400 | 0.310733 |
| seal | 11 | 800 | 29600 | 0.320181 |
| mse | 22 | 3600 | 133200 | 0.310920 |
| seal | 22 | 800 | 29600 | 0.317239 |
| mse | 33 | 4000 | 148000 | 0.311007 |
| seal | 33 | 1200 | 44400 | 0.317035 |

Estos valores no son métricas de simulación directa ni de holdout independiente.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repo figura como 0.0 GB, lo que sugiere un modelo muy pequeño que probablemente cabe en cualquier GPU consumer, pero no se confirma en la información.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; por el tamaño aparente sería viable, pero es una inferencia, no un dato publicado.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y el paquete `seal_single_duty`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de la misma categoría (TaskNets para diseño de circuitos con graph transformers) ni datos comparativos de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- La selección de checkpoints se basa en la utilidad predicha por una Loss-Net, no en simulación directa con NGSpice; puede no correlacionar perfectamente con el rendimiento real en simulador.
- La cohorte de validación se solapa con contextos de evaluación vistos, por lo que los resultados vistos no son una estimación independiente de holdout.
- Las Loss-Nets pareadas no se incluyen en el repo; solo se distribuyen los TaskNets.
- El modelo requiere instalar el paquete original `seal_single_duty` para definir la clase `EarlyFusionMatchedSupportTaskGTN`; sin él, los pesos no son utilizables directamente.
- La salida debe recortarse a [0.1, 0.9] antes de pasarla a un simulador; ignorar este paso puede producir duty cycles inválidos.
- No se asigna licencia nueva: el autor indica explícitamente que no hay licencia asignada, lo que deja el uso comercial en una situación jurídica indeterminada.
- No se declaran idiomas ni sesgos; al no ser un modelo de lenguaje, las categorías habituales de sesgo lingüístico y alucinación no aplican, pero sí existe riesgo de predicciones físicamente inviables fuera del dominio de entrenamiento (`t15_span002`).
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/tjwjdgns011119/seal-5comp-e1-extra-t15-best
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información disponible.
