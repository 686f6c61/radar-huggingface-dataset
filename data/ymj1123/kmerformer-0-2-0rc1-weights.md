# ymj1123/kmerformer-0.2.0rc1-weights

## Resumen

KmerFormer 0.2.0rc1 es una familia de pesos entrenados para clasificación taxonómica a nivel de género de lecturas metagenómicas cortas. El modelo lo desarrolla el grupo de investigación asociado al repositorio `m2lab-ntu` (Universidad Nacional de Taiwán) y se distribuye en este repositorio de Hugging Face como cuatro paquetes TAR que contienen pesos en formato `safetensors`, configuración, etiquetas, assets del tokenizador y manifiestos de integridad. No es un modelo de lenguaje generativo, sino un clasificador de secuencias biológicas: recibe lecturas de ADN cortas (k-mers) y asigna una de 120 etiquetas de género.

La relevancia de este lanzamiento está en que expone públicamente los pesos de cuatro configuraciones distintas de una arquitectura transformer entrenada desde cero para una tarea de bioinformática concreta, junto con checksums SHA-256 y un registro de validación. Esto permite reproducir resultados, auditar los artefactos y desplegar el clasificador en pipelines de metagenómica sin depender de servicios externos. Las configuraciones cubren dos estrategias de tokenización (6-mer y 13-mer exacto/hashed) y distintos presupuestos de entrenamiento (50M y 250M lecturas).

El repositorio tiene 20,3 GB y las cuatro configuraciones varían enormemente en tamaño: desde 26 MB para el modelo de 6-mer y 29 capas hasta 9,06 GB para los modelos de vocabulario 13-mer exacto de una capa. Es importante señalar que la licencia de los pesos es Apache-2.0, pero los assets del tokenizador tienen licencias independientes, incluida una CC BY-NC-SA 4.0 que restringe el uso comercial de la configuración de 6-mer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer entrenado desde cero (familia KmerFormer); número de capas variable según configuración (1 o 29) |
| Parametros totales | No disponible (no se declara el recuento de parámetros; solo el tamaño de los archivos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en safetensors sin variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de clasificación de secuencias genomicas, no linguistico) |
| Licencia | Apache-2.0 para los pesos; tokenizadores con licencias separadas (CC BY-NC-SA 4.0, CC BY 4.0, MIT) |
| Formato de pesos | safetensors (empaquetado en TAR junto con config.json, labels.json, tokenizer y manifest.json) |

Configuraciones incluidas en el repositorio:

| Model ID | Configuracion | Tamano archivo (bytes) |
|---|---|---:|
| `kmerformer-6mer-l29-50m` | Tokenizador 6-mer, 29 capas, presupuesto 50M lecturas | 25.968.640 |
| `kmerformer-exact13-1l-50m` | Vocabulario 13-mer exacto, 1 capa, presupuesto 50M lecturas | 9.057.986.560 |
| `kmerformer-exact13-1l-250m` | Vocabulario 13-mer exacto, 1 capa, presupuesto 250M lecturas | 9.057.986.560 |
| `kmerformer-hashed13-d128-1l-50m` | 13-mer hashed, d=128, 1 capa, presupuesto 50M lecturas | 2.149.038.080 |

## Arquitectura y entrenamiento

KmerFormer es un transformer entrenado desde cero para clasificación a nivel de género de lecturas metagenómicas cortas. La información disponible no detalla la dimensión del modelo, el número de cabezas de atención ni la composición exacta del dataset de entrenamiento; solo se declaran las configuraciones de tokenización (6-mer, 13-mer exacto y 13-mer hashed con dimensión d=128), el número de capas (1 o 29) y el presupuesto de lecturas empleado en el entrenamiento (50M o 250M).

La variante de 6-mer con 29 capas es notablemente compacta (26 MB de archivo), lo que sugiere un modelo de dimensión reducida con profundidad alta, mientras que las variantes de 13-mer exacto ocupan 9,06 GB, coherente con un vocabulario de 13-mer que implica 4^13 posibles tokens y una matriz de embedding muy grande. La variante hashed13-d128 reduce ese tamaño a 2,15 GB mediante hashing de los 13-mers a una dimensión de 128. No se documenta en la información proporcionada si hubo preentrenamiento, ajuste fino supervisado o técnicas de regularización específicas; tampoco se indica la composición taxonómica del dataset más allá de las 120 etiquetas de género.

Cada paquete TAR incluye `model.safetensors`, `config.json`, `labels.json` con las 120 etiquetas de género, los assets del tokenizador, los textos de licencia y un `manifest.json` que registra checksums de ficheros, ajustes de inferencia y el checksum del checkpoint de origen. Este nivel de trazabilidad es una innovación destacable para reproducibilidad en bioinformática.

## Capacidades

- Clasificación taxonómica a nivel de género de lecturas metagenómicas cortas, con 120 etiquetas de género definidas en `labels.json`.
- Procesamiento de secuencias genomicas tokenizadas como k-mers (6-mer, 13-mer exacto o 13-mer hashed según configuración).
- Inferencia en CPU o GPU mediante la CLI `kmerformer-predict`, con selección de dispositivo (`--device cpu`).
- Verificación de integridad de los artefactos: descarga con comprobación SHA-256, `sha256sum -c SHA256SUMS` y `kmerformer-model verify`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto; no es un modelo de lenguaje.
- No dispone de capacidades multimodales (visión, audio) ni multilingües en sentido linguistico.
- No se documenta un modo "thinking" ni decodificación especulativa.

## Casos de uso

- Clasificación de lecturas en estudios metagenómicos: el modelo asigna un género a cada lectura corta, permitiendo perfilar la composición taxonómica de muestras ambientales o clínicas sin alinear las lecturas contra bases de datos de referencia.
- Análisis de muestras de secuenciación de baja cobertura: al trabajar con lecturas cortas tokenizadas como k-mers, resulta adecuado para datos fragmentados donde los clasificadores basados en alineamiento tienen dificultades.
- Control de calidad en pipelines de secuenciación: integración de `kmerformer-predict` como paso de verificación para detectar contaminación cruzada o géneros inesperados en un lote.
- Reproducibilidad de investigación: los checksums SHA-256 y el registro de validación permiten replicar experimentos y auditar los pesos empleados en publicaciones.
- Despliegue en entornos con recursos limitados: la variante `kmerformer-6mer-l29-50m` (26 MB) puede ejecutarse en CPU y integrarse en contenedores ligeros o estaciones de trabajo sin GPU.
- Experimentación con tokenización genomica: comparar el rendimiento de las cuatro configuraciones (6-mer vs 13-mer exacto vs hashed) sobre el mismo conjunto de lecturas para seleccionar la estrategia más adecuada al presupuesto computacional.
- Procesamiento por lotes en servidores: las variantes de 13-mer exacto (9 GB) requieren más memoria pero pueden desplegarse en servidores con suficiente RAM o VRAM para clasificar grandes volúmenes de lecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `docs/RESULTS.md` y `docs/MODELS.md` del repositorio de GitHub para los resultados de estas configuraciones, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita. Como referencia, los tamaños de archivo van de 26 MB (`kmerformer-6mer-l29-50m`) a 9,06 GB (`kmerformer-exact13-1l-50m` y `kmerformer-exact13-1l-250m`); la variante hashed ocupa 2,15 GB. La memoria necesaria para inferencia será al menos del orden del tamaño de los pesos.
- GPU recomendadas: no se especifican. La CLI soporta `--device cpu`, por lo que la variante de 6-mer es viable en CPU. Las variantes de 9 GB requerirían GPU con VRAM suficiente (por ejemplo, A100, H100 o RTX 4090 de 24 GB) si se ejecutan en GPU, aunque no se confirma compatibilidad.
- Cabe en GPU consumer: la variante de 26 MB sí; las de 2,15 GB y 9,06 GB dependen de la VRAM disponible y de si se ejecutan en CPU. No hay datos confirmados.
- Opciones de despliegue: CLI oficial `kmerformer-predict` (instalación vía `pip install .` con PyTorch >=2.13,<3). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de clasificación taxonómica de lecturas metagenómicas ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de lenguaje; no puede emplearse para generación de texto, código, matemáticas, visión ni tareas conversacionales.
- Cobertura taxonómica limitada: solo clasifica entre 120 géneros definidos en `labels.json`; las lecturas de géneros fuera de ese conjunto no tienen una etiqueta válida garantizada.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento ni posibles sesgos hacia determinados hábitats, linajes o tipos de muestra.
- Riesgo de error en la clasificación: al tratarse de un clasificador sobre lecturas cortas, la precisión puede degradarse con lecturas muy cortas, de baja calidad o de taxa poco representados.
- Licencia del tokenizador: la configuración de 6-mer incluye un tokenizador con licencia CC BY-NC-SA 4.0, lo que restringe el uso comercial de ese paquete aunque los pesos sean Apache-2.0. La licencia de los pesos no concede derechos adicionales sobre el tokenizador.
- Idiomas: no aplica; no hay soporte linguistico multilingüe.
- Contexto: no se declara la longitud máxima de lectura admitida; debe consultarse `config.json` y el `manifest.json` de cada bundle.
- Producción: requiere verificar los checksums antes de usar los pesos y validar el modelo sobre datos propios antes de desplegarlo en pipelines críticos.
- Estado del lanzamiento: la versión `0.2.0rc1` indica una release candidate, sujeta a cambios.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/ymj1123/kmerformer-0.2.0rc1-weights
- Código fuente: https://github.com/m2lab-ntu/KmerFormer
- Resultados: https://github.com/m2lab-ntu/KmerFormer/blob/main/docs/RESULTS.md
- Guía de modelos: https://github.com/m2lab-ntu/KmerFormer/blob/main/docs/MODELS.md
- Registro de validación: https://github.com/m2lab-ntu/KmerFormer/blob/main/docs/validation/0.2.0rc1.md
