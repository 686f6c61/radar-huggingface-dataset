# zxliu54/RNABERT-StruSem-RMI

## Resumen

RNABERT-StruSem-RMI es un checkpoint adaptado de RNABERT, un codificador de secuencias de ARN basado en arquitectura BERT, publicado por el autor zxliu54 como componente del marco StruSem-RMI, un sistema multimodal con conocimiento estructural para la predicción de interacciones entre ARN y moléculas pequeñas. El repositorio no contiene el modelo completo de predicción de interacciones, sino únicamente el codificador de secuencias de ARN empaquetado en formato compatible con Transformers (`BertModel`), con el objetivo de facilitar la reproducción de las características de secuencia descritas en el método suplementario S9 del manuscrito asociado.

El modelo es extremadamente compacto: 480.840 parámetros totales, 6 capas transformer, tamaño oculto de 120 y 12 cabezas de atención, con un vocabulario de solo 26 tokens y una capacidad posicional máxima de 440 tokens. Se distribuye en float32 con pesos en safetensors y pytorch_model.bin, y está pensado para extracción de características (pipeline `feature-extraction`), no para generación de texto.

Su relevancia es acotada y especializada: sirve como bloque de codificación de ARN dentro de un pipeline bioinformático concreto (StruSem-RMI), no como modelo de propósito general. La licencia AGPL-3.0 impone obligaciones de copyleft que condicionan su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (`BertModel`), transformer encoder |
| Parametros totales | 480.840 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 440 tokens de capacidad posicional; 267 tokens de entrada máxima en el pipeline StruSem-RMI |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de secuencias biologicas de ARN, no de lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`) y PyTorch (`pytorch_model.bin`) |

Otros datos de configuracion: 6 capas transformer, tamaño oculto 120, 12 cabezas de atención, tamaño intermedio 40, vocabulario de 26 tokens, representación de características `pooler_output` con dimensión de embedding 120.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT con 6 capas, tamaño oculto de 120 y 12 cabezas de atención, lo que da una dimensión por cabeza de 10. El tamaño intermedio de la capa feed-forward es de 40, inusualmente pequeño en relación con el tamaño oculto, y el vocabulario es de 26 tokens, coherente con un tokenizador a nivel de carácter sobre el alfabeto de ARN (A, C, G, U y caracteres especiales). La capacidad posicional máxima es de 440 tokens.

El checkpoint deriva de RNABERT, desarrollado originalmente por Manato Akiyama y Yasubumi Sakakibara, y ha sido adaptado para StruSem-RMI. La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO; estos datos figuran como no disponibles. La innovación técnica destacable no está en el modelo en sí, sino en su integración: StruSem-RMI opera el codificador en modo evaluación sin cálculo de gradientes, cachea las características resultantes antes del entrenamiento del modelo downstream y no actualiza los parámetros del encoder durante ese entrenamiento. El tokenizador utilizado es `SimpleRnaTokenizer`, definido en el código del proyecto, con codificación a nivel de carácter, conversión a mayúsculas y unos IDs efectivos de padding, frontera inicial, frontera final y carácter desconocido de 0, 2, 3 y 1 respectivamente, que difieren de algunos IDs declarados en el vocabulario o en la configuración del modelo.

## Capacidades

- Extracción de características de secuencias de ARN: produce un vector de embedding de dimensión 120 por secuencia a partir de `pooler_output`.
- Codificación a nivel de carácter de secuencias de ARN con el tokenizador `SimpleRnaTokenizer` del proyecto StruSem-RMI.
- Procesamiento de entradas de hasta 267 tokens (incluyendo tokens de frontera) con padding a longitud máxima y truncado activado.
- Integración como encoder congelado en pipelines de aprendizaje automático: las características se cachean y el encoder no se entrena.
- Compatibilidad con la API de Transformers mediante `AutoModel` y carga con `use_safetensors=True`.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio.
- No es un modelo multilingüe de lenguaje natural; su dominio es exclusivamente secuencias biológicas de ARN.

## Casos de uso

- Reproducción de resultados científicos: permite regenerar exactamente las características de secuencia de ARN descritas en el método suplementario S9 del manuscrito asociado a StruSem-RMI, verificando la integridad mediante los checksums SHA-256 publicados.
- Predicción de interacciones ARN-molécula pequeña: se usa como bloque de codificación de ARN dentro del marco StruSem-RMI, alimentando el resto del pipeline multimodal con embeddings de 120 dimensiones.
- Extracción por lotes de embeddings de ARN: al ser un modelo de 480.840 parámetros en float32, puede procesar grandes volúmenes de secuencias en CPU sin requisitos de GPU significativos, con las características cacheadas en disco.
- Integración en pipelines bioinformáticos existentes: se descarga con `huggingface_hub` y se coloca en `pretrained_models/rnabert/` dentro del árbol del proyecto StruSem-RMI, encajando en el flujo de `create_data.py`.
- Auditoría y validación de artefactos de investigación: los checksums SHA-256 de `model.safetensors`, `config.json` y `vocab.txt` permiten verificar que el checkpoint local coincide con el documentado en el manuscrito.
- Docencia y experimentación con codificadores pequeños: sirve como ejemplo de encoder transformer mínimo (6 capas, 120 dimensiones) aplicado a datos biológicos, útil para estudiar extracción de características con modelos congelados.
- Reutilización como inicialización en tareas de ARN: al estar en formato `BertModel` compatible con Transformers, puede cargarse como punto de partida para ajuste fino en tareas relacionadas con secuencias de ARN, siempre respetando la licencia AGPL-3.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 480.840 parámetros en float32, los pesos ocupan aproximadamente 1,9 MB; el consumo dominante es el de activaciones y el overhead del runtime.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo; una NVIDIA T4, RTX 3060 o incluso una GPU integrada es suficiente. Se puede ejecutar en CPU sin problema.
- Cabe en cualquier GPU de consumo, incluidas las de gama baja y las integradas.
- Opciones de despliegue: Transformers con `AutoModel` (método documentado por el autor), carga con `use_safetensors=True` y `local_files_only=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y estos motores no están orientados a extracción de características de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera que el cuello de botella sea el tokenizador y la E/S de disco más que el cómputo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RNABERT-StruSem-RMI | 480.840 | 440 posiciones (267 en pipeline) | Extracción de características de ARN | AGPL-3.0 | Hugging Face (zxliu54) |
| RNABERT original (Akiyama y Sakakibara) | no disponible en la informacion | no disponible | Codificación de ARN | no disponible | GitHub (mana438/RNABERT) |
| RNABERT (implementación MultiMolecule) | no disponible en la informacion | no disponible | Codificación de ARN | no disponible | Hugging Face (multimolecule/rnabert) |
| RNABERT (repositorio yangheng) | no disponible en la informacion | no disponible | Codificación de ARN | no disponible | Hugging Face (yangheng/rnabert) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. Las tres alternativas citadas son implementaciones o distribuciones del mismo modelo base RNABERT, no modelos independientes.

## Limitaciones y advertencias

- El checkpoint es únicamente el codificador de secuencias de ARN; no es el modelo completo de predicción de interacciones StruSem-RMI y no puede usarse por sí solo para predecir interacciones ARN-molécula pequeña.
- El tokenizador debe ser el `SimpleRnaTokenizer` del proyecto StruSem-RMI; sustituirlo por otro tokenizador altera los IDs de tokens y rompe la reproducibilidad de las características.
- Los IDs efectivos de tokens especiales (0, 2, 3, 1) difieren de algunos IDs declarados en el vocabulario o en la configuración del modelo; hay que preservar el comportamiento original del tokenizador.
- La revisión del checkpoint upstream no quedó registrada en el inventario local; la trazabilidad se apoya en los checksums SHA-256 publicados, no en un commit de referencia del modelo original.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y sobre el software que se distribuya o se ofrezca como servicio de red; revisar implicaciones antes de cualquier uso comercial o en productos propietarios.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez; al tratarse de un encoder de características, no genera texto y el riesgo de alucinación no aplica en el sentido habitual, pero sí el riesgo de embeddings poco fiables fuera de la distribución de entrenamiento.
- No se documentan los datos de entrenamiento, el número de tokens ni la composición del corpus, lo que limita la evaluación de su generalización a familias de ARN no representadas.
- El límite de 267 tokens en el pipeline StruSem-RMI implica truncado de secuencias más largas, con posible pérdida de información estructural.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/zxliu54/RNABERT-StruSem-RMI)
- [Archivos y versiones](https://huggingface.co/zxliu54/RNABERT-StruSem-RMI/tree/main)
- [Código fuente de StruSem-RMI](https://github.com/54Xander/StruSem-RMI)
- [Base de datos RSID](http://rsid.hzau.edu.cn)
- [Implementación original de RNABERT](https://github.com/mana438/RNABERT)
- [Implementación de RNABERT en MultiMolecule](https://huggingface.co/multimolecule/rnabert)
- [Repositorio RNABERT de yangheng](https://huggingface.co/yangheng/rnabert)
- [Publicación original de RNABERT](https://doi.org/10.1093/nargab/lqac012)
