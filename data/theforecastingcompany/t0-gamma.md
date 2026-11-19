# theforecastingcompany/t0-gamma

## Resumen

`t0-gamma` es un modelo fundacional de series temporales con pesos abiertos desarrollado por The Forecasting Company. Se trata de la tercera iteración pública de la familia `t0` y su propósito es generar pronósticos probabilísticos multi-horizonte sobre series univariantes y multivariantes, incorporando de forma nativa covariables históricas y covariables futuras conocidas (calendario, festivos, promociones, meteorología prevista, etc.). Con aproximadamente 256 millones de parámetros, se posiciona como un modelo ligero que puede ejecutarse en hardware modesto, incluido Apple Silicon mediante MLX.

La arquitectura es un transformer de tipo decoder con tokenización por parches (patch transformer), entrenado específicamente para forecasting probabilístico. Predice de forma nativa 21 niveles de cuantil, lo que permite construir intervalos de predicción sin post-procesado adicional. El modelo se distribuye bajo licencia Apache-2.0, con pesos en safetensors y runtimes oficiales para PyTorch (`tfc-t0[torch]`) y MLX (`tfc-t0[mlx]`), ambos en versión `>=0.6.1`.

Su relevancia actual radica en que ofrece una alternativa de pesos abiertos y ejecutable localmente frente a modelos fundacionales de series temporales propietarios o de mayor tamaño, con resultados publicados en los leaderboards de referencia del área (fev-bench, GIFT-Eval y TIME). El modelo está orientado a investigación, experimentación y evaluación aplicada de pronósticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-style con tokenización por parches (patch transformer) |
| Parametros totales | 255.614.293 (~256M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

`t0-gamma` es un transformer de estilo decoder que opera sobre parches de la serie temporal en lugar de sobre tokens discretos. El modelo genera directamente una distribución predictiva sobre el horizonte futuro mediante 21 niveles de cuantil, lo que constituye su salida probabilística nativa. Acepta entradas multivariantes y permite condicionar el pronóstico tanto con covariables históricas como con covariables futuras conocidas a lo largo del horizonte de predicción.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables de forma convencional en este dominio). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. El modelo requiere el runtime `tfc-t0>=0.6.1`, que declara las convenciones del checkpoint en su `config.json`, y está disponible en variantes PyTorch y MLX para Apple Silicon.

## Capacidades

- Pronóstico probabilístico de series temporales con 21 niveles de cuantil nativos.
- Forecasting univariante y multivariante.
- Pronóstico multi-horizonte.
- Condicionamiento con covariables históricas.
- Condicionamiento con covariables futuras conocidas: calendario, festivos, eventos planificados, promociones, meteorología prevista u otras señales externas disponibles en el horizonte.
- Ejecución local en PyTorch y en MLX sobre Apple Silicon.
- Disponibilidad mediante API gestionada en Retrocast.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es un modelo numérico especializado en series temporales.

## Casos de uso

- Previsión de demanda energética: el modelo puede pronosticar la demanda eléctrica nacional condicionando con festivos y calendario como covariables futuras conocidas, tal como se ilustra en la model card con datos de Enedis.
- Planificación de inventario y cadena de suministro: forecasting multivariante de ventas por producto con promociones planificadas como covariables futuras, generando intervalos de cuantil para dimensionar stock de seguridad.
- Previsión de gasto sanitario o reembolsos: la model card muestra el caso de reembolsos mensuales de medicamentos (Medic'AM) con y sin covariables, útil para presupuestación con bandas de incertidumbre.
- Gestión de capacidad en infraestructura: pronóstico de métricas operativas (tráfico, carga de servidores) con covariables de calendario para anticipar picos y escalar recursos.
- Evaluación comparativa de modelos de forecasting: al ser de pesos abiertos y ejecutable localmente, sirve como baseline reproducible en pipelines de evaluación sobre fev-bench, GIFT-Eval o TIME.
- Investigación en modelos fundacionales de series temporales: su tamaño (~256M) y licencia Apache-2.0 permiten experimentación, fine-tuning y análisis de sensibilidad a covariables sin restricciones de uso comercial.
- Pronóstico meteorológico-dependente de negocio: uso de previsiones meteorológicas como covariables futuras para estimar demanda en retail o consumo energético.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| fev-bench | Skill score | 49,4 |
| GIFT-Eval | CRPS | 0,4503 |
| GIFT-Eval | MASE | 0,658 |
| TIME | CRPS | 0,534 |
| TIME | MASE | 0,637 |

No se han publicado en la información disponible resultados comparativos directos frente a otros modelos en estos mismos leaderboards.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~256M parámetros, el checkpoint en fp32 ocupa aproximadamente 1 GB (tamaño del repo: 1,0 GB), por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos ~2-4 GB de memoria libre debería ser suficiente; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna de consumo; también se ejecuta en Apple Silicon vía MLX.
- Opciones de despliegue: runtime oficial `tfc-t0[torch]>=0.6.1` (PyTorch) y `tfc-t0[mlx]>=0.6.1` (Apple Silicon); API gestionada en Retrocast. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| t0-gamma | ~256M | no disponible | Apache-2.0 | Hugging Face, Retrocast | fev-bench 49,4; GIFT-Eval CRPS 0,4503 / MASE 0,658; TIME CRPS 0,534 / MASE 0,637 |
| t0-beta | no disponible | no disponible | no disponible | Hugging Face | no disponible |
| t0-alpha | no disponible | no disponible | no disponible | Hugging Face | no disponible |

No se dispone en la información proporcionada de datos sobre otros modelos fundacionales de series temporales comparables (parámetros, contexto, licencia o rendimiento) para establecer una comparativa externa.

## Limitaciones y advertencias

- Los pronósticos son estimaciones probabilísticas, no garantías; deben tratarse como tal en cualquier decisión operativa.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- No se documentan sesgos conocidos ni análisis de robustez frente a distribuciones fuera del dominio de entrenamiento.
- Riesgo de degradación en series con patrones muy distintos a los del corpus de entrenamiento; no se detalla la composición del dataset.
- No se especifica la longitud de contexto soportada, lo que limita la planificación de ventanas de entrada largas.
- No aplica a tareas de texto, visión, audio ni agentes; es un modelo exclusivamente numérico de series temporales.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del runtime `tfc-t0` y del servicio Retrocast por separado.
- Requiere una versión mínima del runtime (`tfc-t0>=0.6.1`) que interpreta las convenciones declaradas en el `config.json`; versiones anteriores pueden no cargar el checkpoint correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theforecastingcompany/t0-gamma
- Paper (arXiv): https://arxiv.org/abs/2609.24559
- The Forecasting Company: https://theforecastingcompany.com/
- Runtime PyPI (`tfc-t0`): https://pypi.org/project/tfc-t0/
- Repositorio GitHub (`tfc-t0`): https://github.com/theforecastingcompany/tfc-t0
- Plataforma Retrocast: https://app.retrocast.com/
- Documentación de la API gestionada: https://docs.retrocast.com/documentation#available-models
- Modelo `t0-beta`: https://huggingface.co/theforecastingcompany/t0-beta
- Modelo `t0-alpha`: https://huggingface.co/theforecastingcompany/t0-alpha
- Colección de la familia t0: https://huggingface.co/collections/theforecastingcompany/t0-alpha-model-family-6a99be18a9e3ab245fda8501
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
- Datos Enedis: https://data.enedis.fr/
- Datos Medic'AM: https://www.assurance-maladie.ameli.fr/etudes-et-donnees/medicaments-classe-atc-medicam
