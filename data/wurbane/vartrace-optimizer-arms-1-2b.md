# WUrbane/vartrace-optimizer-arms-1.2b

## Resumen

vartrace-optimizer-arms-1.2b es una coleccion de modelos de lenguaje afinados (fine-tuned) de aproximadamente 1.200 millones de parametros, publicada por el usuario WUrbane en Hugging Face. No se trata de un modelo unico, sino de un conjunto de directorios independientes, cada uno de los cuales constituye un modelo completo con su propia model card y su fichero `EXPORT.json` que documenta hiperparametros, hashes y el modelo base empleado.

El proposito declarado del repositorio no es ofrecer un modelo de proposito general, sino servir como material de estudio sobre optimizadores. En concreto, el autor investiga dos cuestiones: que matrices ocultas actualiza el optimizador Muon (las denominadas "component arms": k, q, v o ninguna) y cual es la forma espectral de dicha actualizacion (las "spectral arms"). Todos los modelos parten de bases preentrenadas del propio autor bajo los identificadores `OptimizerStudy/adamw_*` o `OptimizerStudy/muon_*`.

La relevancia es por tanto experimental y de investigacion sobre dinamica de entrenamiento, no de aplicacion en produccion. El repositorio ocupa 25,7 GB, lo que sugiere la presencia de multiples subcarpetas con pesos completos en safetensors. No se han publicado datos sobre licencia, idiomas soportados, pipeline ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (inferido de `AutoModelForCausalLM`; detalles no disponibles) |
| Parametros totales | ~1.2B (segun el nombre del repositorio; cifra exacta no disponible) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de modelos compatibles con `AutoModelForCausalLM` de transformers, es decir, modelos causales de lenguaje con cabeza de modelado de tokens. El tamano nominal es de 1.2B de parametros. No se detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni tipo de tokenizador.

El aspecto diferencial esta en el regimen de entrenamiento. Cada subcarpeta corresponde a un fine-tuning sobre una base preentrenada con AdamW o con Muon, y varia el brazo experimental. En los ejemplos documentados (`pretrain-muon_arm-*`), todos parten de una base preentrenada con Muon, ejecutan 682 pasos con precision de matmul tf32 sobre GPU H100, con una rotacion/seed comun `k0 / 20261021`. La tasa de aprendizaje principal varia segun el brazo: 0.0001 para los brazos k, q y v, y 3e-06 para el brazo "none". El objetivo del experimento es aislar el efecto de aplicar Muon solo a ciertas matrices (k, q, v de la atencion) frente a no aplicarlo, y comparar la forma espectral de la actualizacion resultante.

No se documentan volumen de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o ajuste por preferencias. Tampoco se describen innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva basica, derivada de la base preentrenada subyacente (capacidades concretas no documentadas).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles.
- No se documentan modos especiales (thinking mode, vision, audio).
- El interes funcional del repositorio es servir como artefacto reproducible de un estudio de optimizadores, no como modelo de tareas.

## Casos de uso

- Investigacion sobre optimizadores: comparar el efecto de aplicar Muon a las matrices k, q o v de la atencion frente a no aplicarlo, usando los cuatro brazos como puntos de comparacion controlados con la misma seed y el mismo numero de pasos.
- Reproducibilidad de experimentos: cada subcarpeta incluye `EXPORT.json` con hiperparametros y hashes, lo que permite reconstruir exactamente la configuracion de entrenamiento y verificar resultados.
- Analisis de la forma espectral del update: estudiar la distribucion de valores singulares de las actualizaciones de pesos para entender como Muon remodela el espacio de parametros.
- Docencia y formacion: usar el repositorio como ejemplo practico de diseno experimental con variables aisladas (brazo de componente, brazo espectral, learning rate) en entrenamiento de modelos pequenos.
- Punto de partida para fine-tuning propio: al ser modelos de 1.2B en transformers, pueden servir como base para experimentos de ajuste en tareas concretas, siempre que se verifique la licencia (no disponible).
- Auditoria de artefactos de investigacion: revisar hashes y metadatos para validar que los pesos publicados corresponden a las configuraciones declaradas en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,4 GB solo para pesos, mas overhead de activaciones y cache KV (no cuantificado por falta de datos de contexto).
- VRAM estimada en fp32: aproximadamente 4,8 GB para pesos.
- GPU recomendadas: no especificadas por el autor; el entrenamiento documentado se ejecuto en H100.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas en fp16, aunque no se confirma por falta de datos de contexto y arquitectura.
- Opciones de despliegue: transformers (soporte confirmado). vLLM, llama.cpp, Ollama o TGI no estan confirmados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (estudios de optimizador a escala 1.2B) ni se dispone de datos de rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Idiomas y tokenizador no documentados: el comportamiento multilingue es desconocido.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo.
- Modelo de investigacion: los brazos estan disenados para comparar optimizadores, no para maximizar calidad; el brazo "none" usa un learning rate de 3e-06, muy inferior al resto, lo que limita comparaciones directas de calidad.
- Riesgo de alucinacion: inherente a cualquier modelo causal de 1.2B; no se han publicado evaluaciones de fidelidad.
- Sesgos: no evaluados ni documentados.
- Repositorio de 25,7 GB con multiples subcarpetas: requiere seleccionar explicitamente el subfolder al cargar; una carga por defecto puede fallar o descargar mas de lo necesario.
- Fecha de creacion indicada como 2026-11-25: conviene verificar la coherencia temporal del repositorio antes de citarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WUrbane/vartrace-optimizer-arms-1.2b
- Modelos base referenciados en la model card: `OptimizerStudy/adamw_*` y `OptimizerStudy/muon_*` (no se proporcionan URLs directas)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
