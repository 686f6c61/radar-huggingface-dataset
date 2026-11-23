# zkchen/openrfm

## Resumen

OpenRFM es un modelo fundacional relacional (relational foundation model) publicado por el usuario zkchen en Hugging Face. No se trata de un modelo de lenguaje: es un adaptador relacional que opera sobre bases de datos tabulares con múltiples tablas y relaciones, y que se ha preentrenado exclusivamente con bases de datos sintéticas. Su objetivo es resolver tareas de aprendizaje relacional profundo (relational deep learning) sin necesidad de ajuste fino por tarea: ambos checkpoints permanecen congelados en inferencia y ninguna tarea de benchmark se ha fine-tuneado.

El sistema se compone de dos piezas: un backbone o adaptador relacional (`openrfm_backbone.pt`, 7,0 MB) y un módulo de memoria (`openrfm_memory_v1.pt`, 1,1 MB) que lee el historial de una entidad y escribe las características que consume el modelo tabular. Este último es el modelo público `nvidia/Kumo-Tabular` (variante small, licencia OpenMDW-1.1), cargado desde su propio repositorio. El repo de Hugging Face ocupa 7,6 GB, aunque los checkpoints propios suman apenas 8,1 MB; el grueso corresponde presumiblemente a artefactos auxiliares no detallados en la model card.

La relevancia del modelo radica en su enfoque de in-context learning sobre datos relacionales: en lugar de entrenar un modelo por cada esquema de base de datos, se preentrena sobre un corpus sintético y se aplica directamente a tareas como predicción de abandono de pilotos de Fórmula 1 (`rel-f1/driver-dnf`). El código del backbone deriva de Relational Transformer (Apache-2.0) y la licencia del modelo es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador relacional derivado de Relational Transformer, combinado con el modelo tabular `nvidia/Kumo-Tabular` (small) y un módulo de memoria |
| Parametros totales | No disponible (el backbone pesa 7,0 MB y el módulo de memoria 1,1 MB en disco; no se publica el recuento de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los checkpoints se distribuyen como tensores PyTorch, no en formatos cuantizados) |
| Idiomas soportados | No disponible (modelo orientado a datos tabulares y relacionales, no a texto) |
| Licencia | MIT (modelo); el modelo tabular subyacente `nvidia/Kumo-Tabular` usa OpenMDW-1.1 |
| Formato de pesos | PyTorch (`.pt`, cargables con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

OpenRFM sigue el paradigma del Relational Transformer: modela una base de datos como un grafo de entidades y relaciones, de modo que cada entidad se representa combinando sus atributos tabulares con las representaciones de las entidades vecinas a través de las claves foráneas. Sobre esa base, el backbone actúa como adaptador relacional y el módulo de memoria procesa el historial temporal de cada entidad para generar las características que alimentan al modelo tabular `nvidia/Kumo-Tabular`, que produce la predicción final. Todo el conjunto permanece congelado en inferencia.

El dato más destacable del entrenamiento es que el backbone se preentrenó únicamente con bases de datos relacionales sintéticas, sin datos reales de las tareas objetivo. El corpus sintético está publicado en el repositorio de datasets `zkchen/openrfm`. No se especifican en la información disponible el número de tokens, el volumen de bases de datos sintéticas, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco probables en este dominio). La model card tampoco detalla innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Aprendizaje relacional profundo sobre bases de datos con múltiples tablas enlazadas por claves foráneas.
- Aprendizaje en contexto (in-context learning) sobre esquemas relacionales: el modelo se aplica sin ajuste fino por tarea.
- Predicción sobre entidades tabulares enriquecida con el historial de la entidad mediante el módulo de memoria.
- Ejecución de tareas de benchmark relacionales mediante la interfaz de línea de comandos `openrfm predict` (por ejemplo, `rel-f1/driver-dnf`).
- Verificación de integridad de los checkpoints mediante sumas sha256 y el manifiesto `manifest.sha256`.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso en lenguaje natural.

## Casos de uso

- Predicción de abandono en competiciones de motor: el modelo puede estimar la probabilidad de que un piloto no termine una carrera (`driver-dnf`) combinando su historial con las relaciones entre pilotos, equipos y circuitos, sin entrenamiento específico para esa tarea.
- Mantenimiento predictivo sobre bases de datos industriales: dado un esquema relacional de activos, sensores y registros de mantenimiento, el adaptador puede predecir fallos futuros de una entidad usando su historial y el de entidades relacionadas.
- Scoring de riesgo de clientes en banca o seguros: con tablas de clientes, productos, transacciones y siniestros, el modelo puede generar predicciones de impago o fraude aprovechando las relaciones entre entidades y la memoria histórica del cliente.
- Detección de anomalías en sistemas de recomendación: sobre un esquema de usuarios, ítems e interacciones, el adaptador puede puntuar la probabilidad de interacciones atípicas sin reentrenar por cada nuevo conjunto de datos.
- Prototipado rápido en ciencia de datos relacional: al no requerir ajuste fino, permite evaluar un pipeline de aprendizaje relacional sobre un nuevo esquema en minutos mediante `openrfm predict`, lo que resulta útil para validar hipótesis antes de invertir en un modelo a medida.
- Investigación en aprendizaje relacional: sirve como línea base reproducible y abierta (MIT) para comparar métodos de relational deep learning sobre benchmarks públicos como los de la familia `rel-*`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que el modelo se ha evaluado sin ajuste fino en tareas como `rel-f1/driver-dnf`, pero no incluye métricas numéricas ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; los checkpoints propios suman 8,1 MB, por lo que el adaptador y el módulo de memoria son triviales en memoria. El consumo dominante proviene del modelo tabular `nvidia/Kumo-Tabular` (small), cuyo tamaño no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño de los artefactos, es plausible que funcione en GPU de consumo, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el reducido tamaño de los checkpoints sugiere que sí, condicionado al modelo tabular subyacente.
- Opciones de despliegue: paquete Python `openrfm` con el comando `openrfm predict`; carga directa de los `.pt` con `torch.load(..., weights_only=True)`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenRFM | Adaptador relacional + modelo tabular, preentrenado en bases de datos sintéticas | No disponible (checkpoints de 8,1 MB) | No disponible | MIT | Hugging Face y GitHub |
| Relational Transformer (stanford-star) | Transformer sobre grafos relacionales | No disponible | No disponible | Apache-2.0 | GitHub |
| `nvidia/Kumo-Tabular` (small) | Modelo tabular | No disponible | No disponible | OpenMDW-1.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El backbone se ha preentrenado solo con bases de datos sintéticas; puede existir una brecha de dominio al aplicarlo a datos reales que la model card no cuantifica.
- No se documentan sesgos conocidos, pero al entrenarse con datos sintéticos los sesgos del generador podrían propagarse al modelo.
- Riesgo de alucinación no evaluado en la información disponible; en un modelo de predicción tabular el equivalente sería una calibración deficiente de las probabilidades, sin datos publicados al respecto.
- No hay información sobre longitud de contexto ni sobre el número máximo de tablas, entidades o pasos temporales que admite el adaptador.
- El modelo depende de `nvidia/Kumo-Tabular`, cuya licencia OpenMDW-1.1 debe respetarse además de la MIT del propio OpenRFM; conviene revisar sus términos antes de un uso comercial.
- El código del backbone deriva de Relational Transformer (Apache-2.0), por lo que aplican los avisos del fichero NOTICE del repositorio de código.
- No se publican métricas de rendimiento, latencia ni throughput, lo que dificulta estimar su idoneidad en producción.
- El repositorio de Hugging Face ocupa 7,6 GB frente a los 8,1 MB de los checkpoints, sin que la model card explique el contenido restante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zkchen/openrfm
- Repositorio de código: https://github.com/Quant-Spirit/openrfm
- Paper: https://arxiv.org/abs/2606.04320
- Dataset de preentrenamiento sintético: https://huggingface.co/datasets/zkchen/openrfm
- Relational Transformer (código base): https://github.com/stanford-star/relational-transformer
- Modelo tabular subyacente: https://huggingface.co/nvidia/Kumo-Tabular
