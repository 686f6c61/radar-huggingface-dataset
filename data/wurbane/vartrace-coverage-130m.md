# WUrbane/vartrace-coverage-130m

## Resumen

VarTrace coverage 130m es una coleccion de modelos de lenguaje de 130 millones de parametros publicada por el usuario WUrbane en Hugging Face. No se trata de un modelo unico, sino de un repositorio que agrupa cuatro variantes completas de fine-tuning, cada una entrenada a partir de un modelo base preentrenado del proyecto `OptimizerStudy` (variantes `adamw_*` y `muon_*`). El objetivo declarado es estudiar el efecto del optimizador de fine-tuning (AdamW frente a Muon) y de la variante de cobertura (`anchor_cov` frente a `perm_cov`) sobre un mismo modelo base.

El modelo se distribuye bajo la libreria `transformers` con pesos en formato `safetensors` y esta etiquetado como `fine-tuned` y `endpoints_compatible`. El repositorio ocupa 4,3 GB, coherente con cuatro directorios de modelo completos de ~130M de parametros en precision de 32 bits. No se especifican licencia, idiomas soportados ni pipeline en la informacion disponible.

La relevancia de esta publicacion es fundamentalmente experimental: sirve como material reproducible para investigacion sobre optimizadores y tecnicas de regularizacion/cobertura en el fine-tuning de modelos pequenos, no como un modelo listo para produccion. Cada subcarpeta incluye su propia model card y un fichero `EXPORT.json` con hiperparametros, hashes y modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido de `AutoModelForCausalLM`); detalles no disponibles |
| Parametros totales | 130M (segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de modelos de tipo `AutoModelForCausalLM` cargables con `transformers`, con 130M de parametros, derivados de modelos base preentrenados del proyecto `OptimizerStudy` (dos familias: preentrenados con AdamW y con Muon). El fine-tuning se realizo con dos optimizadores distintos (AdamW a LR 1e-4 y Muon a LR 1e-3), 682 pasos, semilla 20261022, rotacion `k0`, y dos variantes de cobertura (`anchor_cov` y `perm_cov`). El entrenamiento se ejecuto en GPUs H100 con precision de matmul tf32 (host class `h100`).

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o similar. Tampoco se detalla la arquitectura interna mas alla de ser un modelo causal de 130M. La innovacion metodologica declarada es el estudio comparativo de optimizadores (AdamW frente a Muon) y de variantes de cobertura sobre un mismo base.

## Capacidades

- Generacion de texto autoregresiva (modelo causal de lenguaje).
- Fine-tuning especifico sobre un base preentrenado; capacidades finales dependen del corpus de fine-tuning, no documentado.
- Compatible con `transformers` y con el flag `endpoints_compatible` (desplegable en Inference Endpoints).
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre optimizadores: comparar directamente las cuatro variantes (`adamw` frente a `muon`, `anchor_cov` frente a `perm_cov`) sobre el mismo base para medir el impacto del optimizador de fine-tuning en tareas controladas.
- Reproducibilidad de experimentos: cada subcarpeta incluye `EXPORT.json` con hiperparametros y hashes, lo que permite reproducir el fine-tuning en entornos H100 con tf32.
- Baseline academico de 130M: usar el modelo como referencia de modelos pequenos en estudios de escalado, regularizacion o cobertura.
- Prototipado rapido en local: al ser 130M, se puede cargar en CPU o en GPUs consumer para pruebas de generacion de texto sin infraestructura dedicada.
- Evaluacion de tecnicas de cobertura: analizar si `anchor_cov` o `perm_cov` mejoran la generalizacion en dominios concretos, usando el modelo como banco de pruebas.
- Docencia y formacion: ejemplo practico de fine-tuning con `transformers` y de organizacion de multiples variantes en un unico repositorio con subcarpetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5 GB en fp32 para un modelo de 130M (4 bytes por parametro); ~0,26 GB en fp16/bf16; ~0,13 GB en int8. Cifras teoricas de pesos, sin overhead de activaciones ni cache KV.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 1 GB o mas de VRAM.
- Opciones de despliegue: `transformers` (carga directa con `subfolder`), Inference Endpoints (flag `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se convierten los pesos (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VarTrace coverage 130m | 130M | no disponible | no disponible | Hugging Face (4 variantes) |
| GPT-2 small | 124M | 1024 | MIT | Hugging Face |
| Pythia-160m | 160M | 2048 | Apache 2.0 | Hugging Face |
| OPT-125m | 125M | 2048 | OPT-175B license | Hugging Face |

La comparativa se limita a tamano y disponibilidad; no hay datos de rendimiento publicados para VarTrace que permitan contrastar calidad frente a estos modelos. La diferencia principal es que VarTrace es un artefacto de investigacion sobre optimizadores, mientras que los alternativos son modelos base de proposito general con licencias claras.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingue.
- Sin benchmarks publicados: imposible evaluar calidad o comparar objetivamente con alternativas.
- Riesgo de alucinacion: inherente a modelos causales de 130M, especialmente sin datos de entrenamiento documentados.
- Capacidad limitada por tamano: 130M de parametros restringe razonamiento complejo, matemáticas y codigo frente a modelos mayores.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- Proyecto experimental: 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad.
- Repositorio de 4,3 GB con cuatro subcarpetas: requiere descarga selectiva mediante `subfolder` para evitar transferir variantes no necesarias.

## Enlaces

- Hugging Face: https://huggingface.co/WUrbane/vartrace-coverage-130m
- Modelo base referenciado (familia): `OptimizerStudy/adamw_*` y `OptimizerStudy/muon_*` (no se proporciona URL directa en la informacion disponible)
- Paper, blog, repositorio o demo: no disponible
