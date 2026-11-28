# Suzukaa-a/songyan-lm

## Resumen

SongyanLM (`.sylm`) es un modelo de lenguaje neuronal de muy pequeno tamano disenado especificamente para el reordenamiento de candidatos (reranking) y la prediccion de siguiente palabra, frase y puntuacion inteligente en teclados de entrada (IME) para chino y mezcla chino-ingles. Lo desarrolla el usuario independiente Suzukaa-a y esta pensado para integrarse en el IME Songyan (Android e iOS) y en cualquier frontend de Rime (Squirrel, Weasel, fcitx5-rime, ibus-rime, Trime, Hamster) mediante un runtime en C++20 y un plugin de `librime`.

El modelo principal disponible es la version v5, con 15,9 millones de parametros, arquitectura transformer causal de 12 capas y 320 dimensiones con GQA (8 cabezas de query, 2 de key/value), Conv1D causal depthwise, QK-Norm y Value Residual. Se distribuye cuantizado en INT4 con escalas por grupo de 32 y embeddings Q8, lo que reduce el binario a 10,6 MB y permite inferencia en dispositivo con `mmap` de copia cero sobre CPUs ARM64 con NEON y dotprod.

Su relevancia radica en el nicho: no compite como modelo de proposito general, sino como componente de latencia ultrabaja y huella minima para teclados moviles, donde el coste de memoria y energia es critico. La version v6, aun en entrenamiento, amplia el catalogo con variantes de 18,3 y 30,7 millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con GQA, Conv1D causal depthwise, QK-Norm y Value Residual |
| Parametros totales | 15,9M (v5); 18,3M y 30,7M (v6, en entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (v6); no disponible para v5 |
| Tipos de cuantizacion | QAT INT4-g32 con escalas por grupo + embeddings Q8 (FP32 en v5, FP16 en v6) |
| Idiomas soportados | chino (zh) e ingles (en), incluida mecanografia mixta CN-EN |
| Licencia | GPL-3.0-only |
| Formato de pesos | `.sylm` (binario empaquetado de 4 bits con escalas de grupo y embeddings Q8 entrelazados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de 12 capas y 320 dimensiones en la version v5, con atencion por grupos (GQA) de 8 cabezas de query y 2 de key/value, una convolucion 1D causal depthwise, normalizacion QK-Norm y conexion Value Residual. El tokenizador es un BPE a nivel de byte con vocabulario de 8192 entradas. La version v6 sube a 14 capas (18,3M) o 16 capas y 384 dimensiones (30,7M), con GQA 6/2 en el modelo de 30M y longitud de secuencia de 256.

El entrenamiento se divide en dos etapas. La primera es un preentrenamiento QAT (quantization-aware training) con STE para INT4-g32, de modo que el modelo aprende directamente bajo la restriccion de cuantizacion. La segunda es un ajuste fino de ranking anclado por KL: se optimiza una perdida de margen por pares y de ranking por listas sobre confusiones sinteticas de homofonos en disposiciones de 26, 18, 14 y 9 teclas, con una divergencia KL contra el modelo congelado de la etapa 1 para preservar la fluidez en contexto largo. La exportacion empaqueta los pesos de 4 bits con escalas de grupo y embeddings Q8 atados para inferencia `mmap` sin copia sobre ARM64 NEON/dotprod. El numero de tokens de entrenamiento y la composicion exacta del dataset no estan disponibles.

## Capacidades

- Reordenamiento de candidatos de IME para chino y mecanografia mixta chino-ingles.
- Prediccion de siguiente palabra y de frase tras la confirmacion de un candidato (post-commit).
- Prediccion de puntuacion inteligente.
- Modelado de lenguaje causal de proposito general a pequena escala (hasta 256 tokens de contexto en v6).
- Manejo de confusiones de homofonos en disposiciones de teclado de 26, 18, 14 y 9 teclas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Reordenamiento de candidatos en teclados chinos: el modelo puntua y reordena las candidatas del motor de entrada segun el contexto previo, mejorando la primera opcion en disposiciones de 26, 18, 14 y 9 teclas gracias al ajuste fino con perdidas de ranking sobre confusiones de homofonos.
- Prediccion de siguiente palabra en movil: tras confirmar una palabra, el modelo sugiere la siguiente con un binario de 10,6 MB que cabe en memoria residente sin penalizar la bateria.
- Puntuacion inteligente: insercion automatica de comas, puntos y signos de interrogacion en funcion del contexto, util en aplicaciones de mensajeria.
- Mecanografia mixta chino-ingles: el modelo gestiona cambios de idioma dentro de la misma frase, adecuado para entornos profesionales donde se alternan terminos tecnicos en ingles.
- Integracion en frontends de Rime: mediante el plugin `librime-songyan-lm` y el runtime C++20, se puede anadir reranking neuronal a Squirrel, Weasel, fcitx5-rime, ibus-rime, Trime o Hamster sin dependencias externas.
- Despliegue en dispositivos de gama baja: la cuantizacion INT4-g32 y la inferencia `mmap` sin copia permiten ejecutarlo en CPUs ARM64 con NEON y dotprod, sin GPU.
- Evaluacion y regresion de motores de entrada: el repositorio incluye una suite de 140 casos (`benchmark_v2.json`) que cubre las disposiciones y la prediccion post-commit, util para comparar versiones del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye una suite de evaluacion de 140 casos (`training/eval/benchmark_v2.json`), pero no se proporcionan cifras de rendimiento en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para CPU.
- Huella en disco y memoria: 10,6 MB (v5); aproximadamente 10,8 MB (v6 18M) y 17,5 MB (v6 30M).
- GPU recomendadas: no disponibles; el modelo no esta pensado para GPU.
- CPU objetivo: ARM64 con extensiones NEON y dotprod, con inferencia `mmap` de copia cero.
- Cabe en GPU de consumo: si, por tamano, pero el runtime documentado es CPU; no se detalla soporte CUDA.
- Opciones de despliegue: runtime C++20 propio y plugin `librime-songyan-lm`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| SongyanLM v5 | 15,9M | no disponible | INT4-g32 + Q8 | GPL-3.0 | Reranking de IME en dispositivo |
| SongyanLM v6 18M | 18,3M | 256 | INT4-g32 + Q8 | GPL-3.0 | Reranking de IME en dispositivo (en entrenamiento) |
| SongyanLM v6 30M | 30,7M | 256 | INT4-g32 + Q8 | GPL-3.0 | Reranking de IME en dispositivo (en entrenamiento) |

No se dispone de informacion sobre modelos alternativos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo de proposito general; su entrenamiento esta orientado a reranking de IME y prediccion post-commit, por lo que su rendimiento en tareas genericas sera limitado.
- Contexto corto: 256 tokens en v6; la longitud de contexto de v5 no esta documentada.
- Idiomas limitados a chino e ingles; no se garantiza calidad en otros idiomas.
- Riesgo de alucinacion en predicciones de siguiente palabra y puntuacion, especialmente fuera de los dominios cubiertos por el dataset sintetico de homofonos.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset sintetico de confusiones puede no reflejar la distribucion real de uso.
- Licencia GPL-3.0-only: impone obligaciones de copyleft para uso comercial o distribucion derivada; revisar compatibilidad antes de integrar en productos propietarios.
- Version v6 aun en entrenamiento: sus pesos pueden no estar disponibles o ser inestables.
- Sin datos publicos de benchmarks ni de latencia, lo que dificulta comparar su rendimiento real frente a alternativas.
- Dependencia de un runtime C++20 y un plugin de `librime` especificos; la integracion fuera de ese ecosistema no esta documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Suzukaa-a/songyan-lm
- Repositorio del runtime C++20 y plugin `librime-songyan-lm`: mencionado en la model card en GitHub, sin URL directa disponible.
- Suite de evaluacion: `training/eval/benchmark_v2.json` dentro del repositorio del modelo.
- Paper, blog o demo: no disponibles.
