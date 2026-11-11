# VinhNguyen21112005/multimodel-ASPD

## Resumen

Multimodel ASPD v3.1 es un checkpoint intermedio de investigación publicado por VinhNguyen21112005 en Hugging Face. No se trata de un modelo de lenguaje generativo, sino del estado aprendido de un sistema de autoencoders dispersos (sparse autoencoders, SAE) entrenado simultáneamente sobre tres modelos de lenguaje distintos: Gemma 2 2B IT, SmolLM2 1.7B Instruct y Granite 3.3 2B Instruct. El objetivo declarado es la interpretabilidad mecanicista: extraer características (features) dispersas y alineadas entre modelos para estudiar representaciones internas comparables.

El artefacto corresponde al paso de optimización 15.000 de una ejecución planificada mucho mayor, con 122.880.000 exposiciones de anclas alineadas aceptadas frente a un horizonte previsto de 500.006.912. Cubre 168 objetivos lógicos (3 modelos x 8 capas x 7 matrices), con un diccionario de 8.192 características y un gate BatchTopK con K=32 sobre un encoder Transformer jerárquico. El repositorio ocupa 42,2 GB.

Es relevante para investigadores que trabajan en interpretabilidad comparativa entre modelos y en el entrenamiento de SAE multi-modelo, pero no es utilizable como modelo de inferencia: no contiene pesos de los modelos fuente ni estado suficiente para reanudar el entrenamiento de forma exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso (SAE) con encoder Transformer jerarquico y gate BatchTopK |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el autor no afirma una licencia permisiva global y remite a los terminos de cada modelo fuente (Gemma Terms of Use para Gemma 2 2B IT; Apache-2.0 para SmolLM2 y Granite segun la configuracion de entrenamiento) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP) |

## Arquitectura y entrenamiento

El sistema es un conjunto de SAE entrenados sobre activaciones internas de tres modelos de lenguaje. Segun la model card, los objetivos logicos son 168 (3 modelos x 8 capas x 7 matrices), con un diccionario de C=8192 caracteristicas y una seleccion dispersa BatchTopK con K=32. El encoder es un Transformer jerarquico y el gate aplica un z-score por eje de caracteristica y por ancla, seguido de ReLU y un BatchTopK a nivel de pool.

El checkpoint corresponde a 15.000 pasos de optimizacion y 122.880.000 exposiciones de anclas alineadas aceptadas, dentro de una ejecucion planificada de 500.006.912 exposiciones. El release excluye los pesos de los modelos fuente, el estado de Adam, el estado del scheduler, el estado RNG, el cursor de stream, el ledger de anclas aceptadas, la base de datos de deduplicacion y rutas internas del sistema de ficheros; por tanto, no permite reanudar el entrenamiento de forma exacta. El autor indica que el artefacto registra un hito de entrenamiento y no establece por si mismo interpretabilidad de caracteristicas, validez causal ni conclusiones cientificas definitivas.

## Capacidades

- Extraccion de caracteristicas dispersas sobre activaciones internas de Gemma 2 2B IT, SmolLM2 1.7B Instruct y Granite 3.3 2B Instruct.
- Analisis de interpretabilidad mecanicista en 8 capas y 7 matrices por modelo (168 objetivos logicos).
- Alineacion entre modelos mediante anclas y gate por z-score, orientada a comparar representaciones entre arquitecturas distintas.
- Diccionario de 8.192 caracteristicas con activacion dispersa K=32.
- No es un modelo generativo: no soporta generacion de texto, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.
- No incluye pesos de los modelos fuente, por lo que no puede ejecutarse como pipeline de inferencia de lenguaje.

## Casos de uso

- Investigacion en interpretabilidad comparativa: usar el SAE para analizar si caracteristicas aprendidas en Gemma 2 2B IT, SmolLM2 1.7B y Granite 3.3 2B presentan correspondencias semanticas en capas y matrices concretas, aprovechando los 168 objetivos logicos del checkpoint.
- Estudio de alineacion de representaciones entre modelos: el gate por ancla y el z-score por eje de caracteristica permiten examinar como se comportan las mismas anclas a traves de tres modelos de distinto origen y entrenamiento.
- Analisis de dispersión y seleccion de features: con C=8192 y K=32, permite estudiar la distribucion de activaciones y la utilidad de BatchTopK a nivel de pool en un encoder Transformer jerarquico.
- Reproduccion parcial de metodologia: el repositorio incluye `training_config.json` y `aspd_v3_1_mathematical_specification.md`, utiles para replicar el diseno del gate y del encoder en nuevos experimentos.
- Auditoria de checkpoints intermedios: comparar el estado en el paso 15.000 frente a futuros checkpoints para evaluar la evolucion de las caracteristicas durante el entrenamiento.
- Base para experimentos de validacion causal: aunque el checkpoint no establece validez causal, puede servir como punto de partida para pruebas de intervencion sobre features en los modelos fuente, que el usuario debe obtener por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica como modelo generativo; el repositorio ocupa 42,2 GB en formato PyTorch Distributed Checkpoint.
- GPU recomendadas: no disponible. Para cargar el checkpoint DCP se requiere entorno PyTorch con soporte de Distributed Checkpoint; el tamano del repositorio sugiere espacio de almacenamiento y memoria considerables, pero no se especifican cifras.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible para inferencia de lenguaje; el artefacto esta pensado para analisis e investigacion con PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Multimodel ASPD v3.1 (este) | SAE multi-modelo (checkpoint intermedio) | no disponible | no aplica | no disponible; sujeta a terminos de modelos fuente | Hugging Face, 42,2 GB, 0 descargas |
| SAE individuales sobre un solo modelo | SAE mono-modelo | no disponible | no aplica | variable | no disponible |
| Gemma 2 2B IT (modelo fuente) | LLM decoder-only | 2B | no disponible en esta ficha | Gemma Terms of Use | Hugging Face (google/gemma-2-2b-it) |
| SmolLM2 1.7B Instruct (modelo fuente) | LLM decoder-only | 1,7B | no disponible en esta ficha | Apache-2.0 | Hugging Face |
| Granite 3.3 2B Instruct (modelo fuente) | LLM decoder-only | 2B | no disponible en esta ficha | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre este checkpoint y otros SAE; la comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni soporta tareas de inferencia estandar.
- Checkpoint intermedio: corresponde al paso 15.000 de una ejecucion planificada de 500.006.912 exposiciones; no representa el resultado final.
- No permite reanudar el entrenamiento de forma exacta: faltan pesos fuente, estado de Adam, scheduler, RNG, cursor de stream, ledger de anclas y base de datos de deduplicacion.
- No establece interpretabilidad de caracteristicas, validez causal ni conclusiones cientificas por si mismo, segun el propio autor.
- Licencia no clara: no se afirma una licencia permisiva global; el uso queda sujeto a los terminos de Gemma 2 2B IT (Gemma Terms of Use) y a las condiciones de SmolLM2 y Granite (Apache-2.0 segun la configuracion fijada). Verificar antes de cualquier uso comercial.
- Riesgo de sesgos: no evaluado en la informacion disponible; al derivar de tres modelos fuente, podria heredar sesgos de sus datos de entrenamiento, pero no se documenta.
- Riesgo de alucinacion: no aplica directamente al no ser generativo, aunque las features extraidas pueden no ser semanticamente interpretables.
- Idiomas: no disponible; depende de los modelos fuente.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de uso externo.
- Fecha de creacion indicada como 2026-11-11: conviene verificar la coherencia temporal del artefacto antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/VinhNguyen21112005/multimodel-ASPD
- Gemma 2 2B IT (modelo fuente): https://huggingface.co/google/gemma-2-2b-it
- SmolLM2 1.7B Instruct (modelo fuente): no disponible enlace directo en la informacion proporcionada
- Granite 3.3 2B Instruct (modelo fuente): no disponible enlace directo en la informacion proporcionada
- Documentacion interna del repo: `release_manifest.json`, `training_config.json`, `aspd_v3_1_mathematical_specification.md` (referenciados en la model card; no se proporcionan URL directas)
