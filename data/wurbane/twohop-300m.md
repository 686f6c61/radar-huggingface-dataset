# WUrbane/twohop-300m

## Resumen

TwoHop 300M es una colección de modelos de lenguaje de aproximadamente 300 millones de parámetros publicada por el usuario WUrbane en Hugging Face. No se trata de un modelo único, sino de un repositorio que agrupa varios directorios independientes, cada uno correspondiente a un checkpoint completo resultante de un proceso de ajuste fino (fine-tuning) sobre distintos modelos base preentrenados. Los modelos base pertenecen a la familia `OptimizerStudy`, que el autor identifica por el optimizador empleado durante el preentrenamiento (AdamW o Muon).

El propósito declarado del repositorio es el estudio comparativo de optimizadores durante la fase de ajuste fino. Cada subcarpeta documenta en su propio `EXPORT.json` los hiperparámetros, hashes y modelo base utilizados, lo que permite reproducir o auditar los experimentos. Se incluyen combinaciones cruzadas entre el optimizador de preentrenamiento (AdamW o Muon) y el optimizador de fine-tuning (AdamW o Muon), con tasas de aprendizaje específicas y un número fijo de 682 pasos.

La relevancia del proyecto es fundamentalmente metodológica: sirve para investigar cómo interactúan los optimizadores de preentrenamiento y ajuste fino en modelos pequeños, un área de interés creciente tras la popularización de Muon como alternativa a AdamW. Sin embargo, la información pública disponible es muy limitada: no se especifican la arquitectura exacta, el contexto, los idiomas ni la licencia, y no hay benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer causal, inferido por `AutoModelForCausalLM`) |
| Parametros totales | aproximadamente 300M (según el nombre del repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que se trata de modelos de lenguaje causales cargables mediante `AutoModelForCausalLM`, pero no detalla la arquitectura interna (número de capas, dimensión oculta, cabezas de atención, tipo de atención, tokenizador). Por el tamaño de 300M de parámetros y la librería `transformers`, se trata presumiblemente de un transformer decoder-only de escala pequeña, pero no se confirma en la documentación.

El entrenamiento consta de dos fases. Primero, un preentrenamiento realizado por el autor bajo la colección `OptimizerStudy`, con dos variantes según el optimizador: AdamW o Muon. Segundo, un ajuste fino de 682 pasos sobre esos checkpoints, con tres configuraciones documentadas: base AdamW ajustado con AdamW (LR 3e-4), base AdamW ajustado con Muon (LR 3e-3) y base Muon ajustado con AdamW (LR 1e-4). Todos los experimentos usan precisión matmul tf32 y se ejecutaron en GPUs A100. Se desconoce el volumen de tokens de preentrenamiento, la composición del dataset y si hubo RLHF, DPO o instrucción tuning.

## Capacidades

- Generación de texto autoregresiva básica, propia de un modelo causal de 300M de parámetros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades especiales (modo thinking, visión, audio).
- No se documenta ajuste por instrucciones; el fine-tuning parece orientado a experimentación con optimizadores más que a alineación.

## Casos de uso

- Investigación sobre optimizadores: comparar el efecto de AdamW y Muon en el ajuste fino partiendo de bases preentrenadas con cada uno, usando los tres checkpoints publicados como punto de partida reproducible.
- Reproducción de experimentos: el `EXPORT.json` de cada subcarpeta permite replicar hiperparámetros, hashes y configuración exacta en entornos con A100.
- Docencia y formación: modelo pequeño y de bajo coste para ilustrar pipelines de fine-tuning con `transformers` y el impacto del optimizador.
- Prototipado rápido de pipelines de entrenamiento: validar scripts de entrenamiento y evaluación antes de escalar a modelos mayores.
- Generación de texto experimental: uso como modelo de juguete para pruebas de decodificación, muestreo y evaluación de perplejidad.
- Baseline en estudios académicos: servir como referencia de 300M en comparativas de eficiencia de optimizadores o de estabilidad de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 0,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica cabe holgadamente en GPUs consumer.
- VRAM estimada en fp32: aproximadamente 1,2 GB para pesos.
- GPU recomendadas para entrenamiento: A100, según indica la model card (host class `a100`, matmul tf32).
- GPU consumer: cualquier GPU con 4 GB o más de VRAM debería poder ejecutar el modelo en fp16; tarjetas como RTX 3060, 4060 o superiores son suficientes.
- Opciones de despliegue: `transformers` (soporte nativo confirmado); vLLM, llama.cpp, Ollama o TGI no están confirmados para estos checkpoints, aunque al ser safetensors estándar podrían adaptarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TwoHop 300M (WUrbane) | ~300M | no disponible | no disponible | Hugging Face |
| GPT-2 medium (OpenAI) | 355M | 1024 | MIT | Hugging Face |
| Pythia-410M (EleutherAI) | 410M | 2048 | Apache 2.0 | Hugging Face |
| OPT-350M (Meta) | 350M | 2048 | OPT license | Hugging Face |

La comparación se limita a escala y disponibilidad, ya que no hay benchmarks ni especificaciones de contexto publicadas para TwoHop 300M. Frente a GPT-2 medium, Pythia-410M u OPT-350M, el interés de TwoHop no reside en su rendimiento sino en su valor como artefacto de investigación sobre optimizadores.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad de generación, razonamiento o código.
- Licencia no especificada: no se puede garantizar el uso comercial; conviene contactar con el autor antes de utilizarlo en producción.
- Idiomas no declarados: se desconoce si el modelo está entrenado predominantemente en inglés u otros idiomas.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- Riesgo elevado de alucinación y texto incoherente por su tamaño reducido (300M) y por la falta de ajuste por instrucciones documentado.
- Sesgos desconocidos: al no documentarse el corpus de preentrenamiento, no se pueden evaluar sesgos de género, raza o ideología.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso.
- Posible falta de tokenizador o configuración completa en algunos subdirectorios; conviene verificar cada carpeta antes de cargarla.
- El repositorio pesa 6 GB, lo que sugiere que contiene varios checkpoints completos; verificar el espacio en disco antes de descargar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WUrbane/twohop-300m
- Modelos base referenciados: `OptimizerStudy/adamw_*` y `OptimizerStudy/muon_*` (no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
