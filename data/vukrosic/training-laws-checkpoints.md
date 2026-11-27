# vukrosic/training-laws-checkpoints

## Resumen

`vukrosic/training-laws-checkpoints` es un repositorio de checkpoints finales de modelos de lenguaje de tipo mixture-of-experts (MoE) al estilo DeepSeek-V3, publicados como material reproducible del proyecto de investigacion Training Law Finder. No es un modelo listo para produccion ni un asistente conversacional: es un artefacto de investigacion cuyo proposito es permitir la inspeccion y reproduccion de experimentos sobre leyes de escalado del entrenamiento (training laws). El autor, vukrosic, lo distribuye bajo licencia MIT.

Los checkpoints publicados corresponden a la serie `scale125/`, con 402M parametros totales y 126M activos por token, entrenados durante 954 pasos sobre 250M tokens de FineWeb-Edu en aproximadamente 22 minutos por ejecucion en una GPU H200. El repositorio incluye cuatro variantes que difieren en la tasa de aprendizaje maxima (3e-4, 6e-4 y 1.2e-3) y en el metodo de optimizacion (baseline frente a BIGSVD), lo que permite comparar directamente el efecto de estas decisiones de entrenamiento sobre la perdida de validacion.

Su relevancia es metodologica: ofrece puntos de control reales de un MoE pequeno con recetas y curvas de evaluacion documentadas, utiles para investigadores que estudian estabilidad de entrenamiento, inicializacion y tecnicas de descomposicion. No se documentan capacidades de inferencia, idiomas soportados ni resultados de benchmarks estandar, por lo que no debe tratarse como un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) estilo DeepSeek-V3 |
| Parametros totales | 402M |
| Parametros activos | 126M por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `.pt`, sin versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos al estilo DeepSeek-V3, con 402M parametros totales y 126M activos por token, lo que implica un ratio de activacion de aproximadamente el 31 %. No se detalla en la informacion disponible el numero de expertos, el numero de expertos activos por token, la dimension oculta ni la estrategia de enrutamiento (top-k, aux loss, etc.).

El entrenamiento se realizo sobre 250M tokens de FineWeb-Edu durante 954 pasos, con un coste de aproximadamente 22 minutos por ejecucion en una unica GPU H200. Se comparan cuatro configuraciones: tres con optimizacion baseline y tasas de aprendizaje maximas de 3e-4, 6e-4 y 1.2e-3, y una con el metodo BIGSVD y tasa 6e-4. Los resultados de perdida de validacion muestran que BIGSVD con 6e-4 alcanza 3.1053 (1.1467 bpb), frente a 3.2844 (1.2129 bpb) del baseline con la misma tasa, lo que sugiere una mejora del metodo BIGSVD en este regimen. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva basica, derivada del entrenamiento sobre FineWeb-Edu (corpus educativo en ingles).
- Razonamiento de nivel muy limitado: con 250M tokens de entrenamiento y 126M parametros activos, las capacidades emergentes son marginales.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el corpus de entrenamiento es predominantemente en ingles.
- No se documenta modo thinking, vision ni audio.
- Uso principal previsto: inspeccion de pesos, reproduccion de experimentos y analisis de dinamicas de entrenamiento.

## Casos de uso

- Reproduccion de experimentos de leyes de escalado: cargar los checkpoints y comparar las curvas de perdida de validacion frente a las publicadas en `results.jsonl` para validar la infraestructura de entrenamiento propia.
- Estudio del efecto de la tasa de aprendizaje en MoE pequenos: los tres baselines con 3e-4, 6e-4 y 1.2e-3 permiten aislar el impacto del learning rate en la perdida final (3.4596, 3.2844 y 3.3577 respectivamente).
- Evaluacion de metodos de optimizacion: comparar BIGSVD frente a baseline con la misma tasa (6e-4) para medir la ganancia en perdida de validacion (3.1053 frente a 3.2844) y en bits por byte (1.1467 frente a 1.2129).
- Analisis de enrutamiento de expertos: inspeccionar los pesos de las capas MoE para estudiar el equilibrio de carga y el colapso de expertos en regimenes de entrenamiento cortos.
- Punto de partida para fine-tuning controlado: usar los checkpoints como inicializacion en experimentos de adaptacion con presupuestos de computo reducidos, dado su tamano manejable.
- Docencia e investigacion reproducible: servir como ejemplo verificable de un pipeline MoE completo con hashes (`sha256.txt`), recetas (`recipe.json`) y resultados estructurados (`results.jsonl`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son las perdidas de validacion y bits por byte de la serie `scale125/`:

| Checkpoint | Metodo | Peak LR | Val loss | Val bpb |
|---|---|---|---|---|
| `B_dsv3_bigsvd_lr0.0006_250M_final.pt` | BIGSVD | 6e-4 | 3.1053 | 1.1467 |
| `B_dsv3_lr6e-4_250M_final.pt` | baseline | 6e-4 | 3.2844 | 1.2129 |
| `B_dsv3_lr1.2e-3_250M_final.pt` | baseline | 1.2e-3 | 3.3577 | 1.2399 |
| `B_dsv3_lr3e-4_250M_final.pt` | baseline | 3e-4 | 3.4596 | 1.2776 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 402M parametros totales, en fp32 ocuparia aproximadamente 1,6 GB y en fp16/bf16 alrededor de 0,8 GB, mas overhead de activaciones y del estado del enrutador.
- GPU de entrenamiento documentada: una H200 por ejecucion, con un coste de aproximadamente 22 minutos por run.
- Cabe en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) sin problemas de memoria, aunque no se documenta el soporte de inferencia.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; los pesos son `.pt` de PyTorch y requeririan cargar la definicion del modelo del repositorio Training Law Finder.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, tokenizador, idiomas) que permitan una comparativa rigurosa con alternativas. Como referencia de categoria, se puede situar frente a otros MoE pequenos de investigacion, pero sin cifras verificables:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| training-laws-checkpoints (scale125) | 402M | 126M | no disponible | MIT | Hugging Face (checkpoints `.pt`) |
| Alternativas MoE pequenas de investigacion | no disponible | no disponible | no disponible | variable | variable |

## Limitaciones y advertencias

- No es un modelo de proposito general: esta entrenado solo 954 pasos sobre 250M tokens, por lo que su calidad de generacion es muy limitada y no debe usarse en produccion.
- Riesgo elevado de alucinacion y de texto incoherente fuera de distribuciones muy cercanas al corpus FineWeb-Edu.
- Sesgos conocidos: no documentados, pero heredables del corpus FineWeb-Edu (predominantemente ingles y de dominio educativo).
- Limitaciones de idioma: no se declaran idiomas soportados; el entrenamiento es en ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no esta pensado ni validado para ello; el autor no ofrece garantias.
- Los checkpoints son artefactos de investigacion sin tokenizador, configuracion de inferencia ni pipeline documentados en la model card; su uso requiere el codigo del repositorio Training Law Finder.
- No se han publicado evaluaciones de seguridad, sesgo ni robustez.

## Enlaces

- Hugging Face: https://huggingface.co/vukrosic/training-laws-checkpoints
- Repositorio del proyecto: https://github.com/vukrosic/training-law-finder
- Dataset de resultados: https://huggingface.co/datasets/vukrosic/training-laws-research
