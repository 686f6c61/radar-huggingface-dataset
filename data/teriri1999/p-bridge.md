# Teriri1999/p-Bridge

## Resumen

p-Bridge es un modelo de restauración de imagen basado en un *diffusion bridge* condicional, desarrollado por el usuario Teriri1999 y publicado junto al artículo *The Noise Plane: One Diffusion Bridge Across Exponent and Dispersion*. A diferencia de los modelos de difusión convencionales, que parametrizan el ruido mediante un nivel escalar abstracto, p-Bridge indexa el proceso por dos cantidades físicas: el exponente potencia-varianza `p` y el peso acumulado de medida `ν`. Esto permite que una única red cubra toda la familia de ruidos cuya varianza sigue la ley `Var(X | μ) = μ^p / ν`, que incluye ruido gaussiano, ruido de disparo Poisson, detectores de conteo de fotones y *speckle* de radar de apertura sintética (SAR).

El checkpoint publicado, `pbridge_cond_severe_50k.pt`, es la variante condicional insignia: abarca el eje completo `p ∈ [1, 2]` y recibe el exponente como entrada en tiempo de inferencia, en lugar de requerir un modelo distinto por cada tipo de ruido. Está entrenado a una severidad `η = 1.0` (severa) con `μ_ref = 0.464864`, y los ruidos más suaves se abordan entrando en el mismo puente por un punto intermedio, no con otro checkpoint.

Se trata de un modelo de nicho, con 0 descargas y 0 *likes* en el momento de la consulta, orientado a investigación en restauración de imagen y a aplicaciones de imagen científica (imagen de baja luminosidad, SAR, microscopía de conteo de fotones). Su relevancia radica en la unificación matemática de varios problemas de ruido bajo un mismo formalismo y en la condicionalidad explícita por el exponente físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion bridge condicional (backbone derivado de OpenAI guided-diffusion, tipo U-Net) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolución de entrenamiento 256×256 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de imagen, sin capacidades de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un *diffusion bridge* (puente de difusión) condicional construido sobre un backbone U-Net derivado de OpenAI guided-diffusion (`model_channels = 64`, resolución de imagen 256×256). La innovación central es la parametrización del ruido en el llamado *noise plane*: en lugar de un schedule escalar, el proceso se localiza por el par `(p, ν)`, donde `p` controla la dependencia de la fluctuación con la señal y `ν` la cantidad de medida acumulada. El checkpoint insignia se entrena con `--p 1.5 --p_range 1.0 2.0 --p_quantum 0.05`, es decir, muestreando el exponente de forma continua en `[1, 2]` y condicionando la red con él (`--cond_x1`).

El entrenamiento se realizó con 4 GPUs (`torchrun --nproc_per_node=4`), 50 000 pasos totales, batch efectivo de 6 (batch 2 × grad_accum 3), optimizador con learning rate 1e-4, schedule coseno con *warmup* de 1000 pasos y mínimo 1e-7, EMA con decaimiento 0.999 y recorte de gradiente 1.0. La función de pérdida combina términos de reconstrucción (`λ_rec = 10`), de momentos (`λ_mom = 1`) y de consistencia (`λ_cons = 5`), con `--nu_weight_alpha 0.0` y `--T 100` con schedule logarítmico. El dataset declarado tiene 16 000 imágenes y se complementa con DIV2K (`data/div2k/DIV2K_train_HR`). La calibración de severidad se hace mediante `η := CV(μ_ref)` en lugar de un `ν` compartido, porque `ν` arrastra unidades dependientes de `p`.

## Capacidades

- Restauración de imagen (*image-to-image*) bajo ruido cuya varianza sigue la ley `μ^p / ν`.
- Eliminación de ruido gaussiano, ruido de disparo Poisson, ruido de detectores de conteo de fotones y *speckle* SAR bajo un mismo modelo.
- Condicionalidad explícita por el exponente `p ∈ [1, 2]` en tiempo de inferencia, sin reentrenamiento.
- Manejo de distintos niveles de severidad entrando en el puente en un punto intermedio, sin cambiar de checkpoint.
- Inferencia de pocos pasos: los resultados se reportan a NFE = 5 (5 evaluaciones de función).
- No dispone de generación de texto, código, matemáticas, visión semántica, *tool calling*, agentes ni capacidades multilingües.

## Casos de uso

- Restauración de imágenes SAR: el modelo trata el *speckle* como una columna de la familia `(p, ν)`, de modo que se puede indicar el exponente correspondiente al sensor y restaurar la imagen sin un modelo específico por misión o satélite.
- Imagen médica de conteo de fotones (PET, SPECT, microscopía de fluorescencia): el ruido de Poisson se ajusta con `p = 1`, y el modelo condicional permite fijar ese exponente en inferencia para reconstruir la señal subyacente.
- Fotografía de baja luminosidad: el ruido dominante en sensores CMOS a alto ISO se aproxima con la ley potencia-varianza; p-Bridge permite restaurar con solo 5 NFE, adecuado para *pipelines* de postprocesado en lote.
- *Benchmarking* y comparación de métodos de *denoising*: al unificar varios tipos de ruido bajo un mismo formalismo, sirve como referencia para evaluar otros métodos en el plano `(p, ν)` con la misma métrica de severidad `η`.
- Investigación en modelos de difusión: el checkpoint es un caso de estudio de *diffusion bridges* condicionados por parámetros físicos, útil para experimentos de generalización fuera de distribución en `p`.
- Restauración en *pipelines* de imagen científica con requisitos de latencia: los 5 NFE y un backbone de 64 canales permiten despliegue en GPU de gama media, aunque no se han publicado cifras de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que los resultados se citan a NFE = 5 y que la evaluación se ejecuta con `python -m eval.run_eval --eval_p 1.0 1.5 2.0`, pero no incluye cifras de PSNR, SSIM ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone usa `model_channels = 64` a 256×256, lo que sugiere un modelo relativamente ligero, pero no se publica el número de parámetros ni la VRAM medida.
- GPU recomendadas: no disponible. El entrenamiento se hizo con 4 GPUs (`--nproc_per_node=4`), sin especificar el modelo.
- Viabilidad en GPU de consumo: no confirmada; por el tamaño del backbone es plausible, pero no hay datos publicados.
- Opciones de despliegue: el repositorio oficial proporciona un script de evaluación (`python -m eval.run_eval`) y pesos en formato `.pt`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con otros modelos de restauración (por ejemplo, DnCNN, Restormer o SwinIR) en la información proporcionada. La comparación cualitativa se limita al planteamiento: frente a los modelos específicos por tipo de ruido, p-Bridge unifica gaussiano, Poisson, conteo de fotones y *speckle* SAR en un único checkpoint condicionado por `p`.

| Modelo | Enfoque | Tipos de ruido | Condicional por exponente | Licencia |
|---|---|---|---|---|
| p-Bridge | Diffusion bridge condicional | Gaussiano, Poisson, conteo de fotones, SAR | Sí (`p ∈ [1, 2]`) | MIT |
| Alternativas específicas por ruido | Redes discriminativas o de difusión | Uno por modelo | No | no disponible |

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 *likes*: no hay validación independiente ni comunidad que reporte resultados.
- No se publican cifras de benchmarks (PSNR, SSIM) ni comparaciones con el estado del arte, lo que impide evaluar su rendimiento real.
- El checkpoint está entrenado a severidad `η = 1.0` con `μ_ref = 0.464864`; los ruidos más suaves requieren entrar en el puente por un punto intermedio, un procedimiento que puede no estar bien caracterizado fuera del rango de entrenamiento.
- La generalización fuera de `p ∈ [1, 2]` no está garantizada; el modelo está condicionado a ese intervalo.
- Resolución de entrenamiento fija de 256×256; no se documenta el comportamiento a otras resoluciones.
- Riesgo de artefactos y alucinación de texturas en regiones de baja relación señal-ruido, inherente a los modelos generativos de restauración.
- Sesgos: no documentados; al entrenar con DIV2K y un dataset de 16 000 imágenes, puede estar sesgado hacia la distribución de esas imágenes (fotografía natural), con posible degradación en dominios científicos alejados de ella.
- Licencia MIT, permisiva para uso comercial, pero el backbone deriva de OpenAI guided-diffusion (también MIT), lo que mantiene la compatibilidad.
- No apto para tareas de texto, código, agentes ni *tool calling*; es exclusivamente un modelo de imagen a imagen.

## Enlaces

- Hugging Face: https://huggingface.co/Teriri1999/p-Bridge
- Repositorio de código: https://github.com/Teriri1999/p-Bridge
- Backbone de referencia (OpenAI guided-diffusion): https://github.com/openai/guided-diffusion
