# WUrbane/igsm-optimizer-arms-300m

## Resumen

`igsm-optimizer-arms-300m` es una colección de modelos de lenguaje de aproximadamente 300 millones de parámetros publicada por el usuario WUrbane bajo el proyecto "igsm" (optimizer study). No se trata de un modelo pensado para uso general, sino de un artefacto de investigación: cada subcarpeta contiene un modelo completo que parte de un modelo base preentrenado con un optimizador concreto (AdamW o Muon) y ha sido afinado con una configuración específica de "brazos" (arms), es decir, qué matrices ocultas actualiza el optimizador Muon y con qué forma espectral lo hace.

La relevancia del artefacto es metodológica: sirve para estudiar empíricamente el comportamiento del optimizador Muon frente a AdamW en modelos pequeños, aislando qué subconjuntos de matrices (component arms) y qué estructura espectral del update (spectral arms) afectan al resultado del ajuste fino. Es material útil para investigadores de optimización y entrenamiento, no para despliegues de producto.

La información pública disponible es muy escasa: el repositorio ocupa unos 2,0 GB, usa la librería `transformers` con pesos en `safetensors`, y la model card solo detalla una de las variantes (la subcarpeta `pretrain-muon_arm-none`, con base preentrenada con Muon, sin arm, LR principal 1e-05, 682 pasos, semilla 20261021, precisión tf32 y entrenamiento sobre A100). No se declaran licencia, idiomas ni pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), según la clase `AutoModelForCausalLM`; detalles de capas y dimensiones no disponibles |
| Parámetros totales | ~300 M (según el nombre del modelo; cifra exacta no disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponibles (pesos publicados en safetensors; no se declaran variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only para modelado de lenguaje causal, cargable con `AutoModelForCausalLM`. El repositorio es un contenedor de múltiples subcarpetas, cada una con un modelo completo, su propia model card y un fichero `EXPORT.json` con hiperparámetros, hashes y modelo base. Los modelos base proceden de dos familias preentrenadas: `OptimizerStudy/adamw_*` y `OptimizerStudy/muon_*`, es decir, el mismo sustrato entrenado con AdamW o con Muon.

El ajuste fino estudiado varía dos ejes: (1) el "component arm", que determina qué matrices ocultas actualiza Muon, y (2) el "spectral arm", que controla la forma espectral del update. La única variante documentada en la model card es `pretrain-muon_arm-none`: base preentrenada con Muon, sin arm (ninguna matriz asignada a Muon en el ajuste), LR principal 1e-05, 682 pasos, rotación/seed k0 / 20261021, precisión matmul tf32 y clase de host A100. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje causal (clase `AutoModelForCausalLM`).
- Ajuste fino sobre bases preentrenadas con AdamW o Muon, pensado para experimentación con optimizadores.
- No se documentan capacidades de razonamiento avanzado, código, matemáticas, visión, audio ni modo "thinking".
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidad especial: servir como banco de pruebas reproducible de variantes de optimizador (component arms y spectral arms), con metadatos de hiperparámetros y hashes en `EXPORT.json`.

## Casos de uso

- Investigación sobre optimizadores: comparar el efecto de Muon frente a AdamW en el ajuste fino de un transformer de ~300 M, usando las subcarpetas como réplicas controladas con distinto LR, semilla y precisión de matmul.
- Estudio de "component arms": aislar qué subconjuntos de matrices ocultas conviene actualizar con Muon y medir el impacto en la pérdida de validación o en tareas downstream.
- Estudio de "spectral arms": analizar cómo la forma espectral del update afecta a la estabilidad y a la convergencia del entrenamiento en modelos pequeños.
- Reproducibilidad de experimentos: el `EXPORT.json` de cada subcarpeta permite reconstruir hiperparámetros, hashes y modelo base para replicar resultados en un A100 con tf32.
- Docencia y formación: usar un modelo de 300 M como ejemplo manejable para explicar diferencias entre optimizadores sin los costes de un modelo grande.
- Baseline para pipelines de entrenamiento: validar infraestructura (carga con `transformers`, gestión de subcarpetas, checkpoints) antes de escalar a modelos mayores con la misma receta de optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~300 M en fp32 se sitúan en torno a 1,2 GB de pesos más overhead de activaciones, y en fp16/bf16 alrededor de 0,6 GB, aunque estas cifras son estimaciones y no datos del autor.
- GPU recomendadas: el autor documenta entrenamiento en A100 con tf32; para inferencia basta una GPU consumer moderna.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM (estimación, no dato del autor).
- Opciones de despliegue: carga estándar con `transformers` (`AutoModelForCausalLM.from_pretrained` con `subfolder`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `WUrbane/igsm-optimizer-arms-300m` | ~300 M | no disponible | Estudio de optimizadores (Muon vs AdamW, arms) | no disponible | Hugging Face (0 descargas, 0 likes) |
| `OptimizerStudy/adamw_*` (base referenciada) | no disponible | no disponible | Base preentrenada con AdamW | no disponible | Referenciada en la model card |
| `OptimizerStudy/muon_*` (base referenciada) | no disponible | no disponible | Base preentrenada con Muon | no disponible | Referenciada en la model card |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría; la comparación se limita al enfoque metodológico.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: no hay evaluación de calidad, seguridad ni sesgos.
- Licencia no declarada: no puede asumirse uso comercial sin confirmación del autor.
- Idiomas no declarados: se desconoce la cobertura lingüística real.
- Contexto no declarado: no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: inherente a un modelo causal de ~300 M sin alineamiento documentado (no se declara RLHF/DPO).
- Sesgos: no documentados; al desconocerse el dataset de preentrenamiento, no pueden evaluarse.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- La model card solo documenta una de las variantes (`pretrain-muon_arm-none`); el resto de subcarpetas requiere consultar su `EXPORT.json` individual.
- Fechas de creación y actualización poco habituales (2026) y ausencia de pipeline declarado: conviene verificar la integridad de los artefactos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WUrbane/igsm-optimizer-arms-300m
- Modelo base AdamW referenciado: https://huggingface.co/OptimizerStudy/adamw_*
- Modelo base Muon referenciado: https://huggingface.co/OptimizerStudy/muon_*
- Paper, blog, repositorio o demo adicionales: no disponibles
