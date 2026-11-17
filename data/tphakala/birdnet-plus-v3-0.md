# tphakala/BirdNET-Plus-V3.0

## Resumen

BirdNET+ V3.0 es un clasificador acústico de vocalizaciones de aves desarrollado por el K. Lisa Yang Center for Conservation Bioacoustics (Universidad de Cornell), la Universidad de Química de Chemnitz y el Museum für Naturkunde de Berlín. La versión publicada en este repositorio, obra derivada de tphakala bajo licencia Apache-2.0, reexporta el modelo original a un grafo ONNX nativo de GPU y añade un catálogo de recortes regionales optimizados. El modelo resuelve el problema de la identificación automática de especies a partir de audio de campo, una tarea central en monitorización de biodiversidad y bioacústica computacional.

La arquitectura se basa en un backbone EfficientNetV2-S con un clasificador de tres cabezas y 11.725 clases, lo que lo convierte en un modelo de clasificación de grano fino sobre audio ambiental. La entrada es audio crudo de 5 segundos a 32 kHz (160.000 muestras), y produce tanto predicciones por especie como embeddings de 1.280 dimensiones, lo que facilita su integración en pipelines de análisis posteriores.

Su relevancia actual radica en dos factores: por un lado, la conversión a operadores compatibles con CUDA/TensorRT y OpenVINO elimina la dependencia de la CPU que lastraba la exportación original de ONNX Runtime; por otro, los recortes regionales reducen el tamaño del modelo hasta en un 65% manteniendo resultados numéricamente idénticos en las especies de cada región, lo que permite desplegarlo en dispositivos de bajos recursos como una Raspberry Pi 5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S con clasificador de tres cabezas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio fija de 5 s a 32 kHz (160.000 muestras) |
| Tipos de cuantización | FP32 únicamente en esta release; int8-arm no se distribuye para v3.0 |
| Idiomas soportados | no aplica (clasificación de audio, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32) |

## Arquitectura y entrenamiento

El modelo emplea un backbone EfficientNetV2-S seguido de un clasificador de tres cabezas que cubre 11.725 clases. La entrada es audio crudo en formato `[batch, 160000]`, correspondiente a 5 segundos muestreados a 32 kHz, un formato deliberadamente alineado con Perch v2 para que un mismo host pueda alimentar ambos clasificadores con el mismo búfer. La salida consta de `predictions [batch, 11725]`, con dimensión estática y sigmoide ya aplicada, y `embeddings [batch, 1280]`.

La innovación técnica principal de esta release es la conversión a lo que el autor denomina "GPU-native": la exportación original del equipo BirdNET calcula el front-end log-mel mediante un operador ONNX `STFT` dentro del grafo, para el que ONNX Runtime no tiene kernel CUDA ni TensorRT y que OpenVINO no puede traducir. En esta versión, el `STFT` se sustituye por un `Conv1d` matemáticamente equivalente (framing más DFT enventanada), de modo que el grafo no contiene operadores ausentes en esos runtimes. Cada fichero fue validado en ONNX Runtime CPU (x86-64 y Raspberry Pi 5) y en OpenVINO a f32 (CPU e iGPU de Intel), comparando las puntuaciones con las de ONNX Runtime x86-64 del mismo fichero.

Los recortes regionales se construyen restringiendo el clasificador al conjunto de especies de una región, definido a partir del filtro de rango del BirdNET Geomodel v3.0.2 (especies por probabilidad de ocurrencia, con un tope por tesela y un núcleo cosmopolita), usando las mismas teselas que el catálogo regional de Perch v2. El tope es de 800 especies para la mayoría de teselas templadas y mayor para las ricas en especies. Cada tesela incluye además Homo sapiens y las clases de sonidos no animales de la release. Las diferencias de nombre entre geomodel y clasificador se resuelven mediante una tabla de renombrado revisada. Los datos de entrenamiento (número de tokens de audio, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Clasificación de audio en 11.725 clases, orientada a especies de aves y otras clases acústicas.
- Generación de embeddings de 1.280 dimensiones para cada ventana de 5 segundos, útiles para búsqueda, agrupamiento y análisis de similitud.
- Inferencia sobre audio crudo sin preprocesado externo: el front-end log-mel está integrado en el grafo.
- Ejecución nativa en GPU (CUDA/TensorRT) y en OpenVINO, además de ONNX Runtime CPU.
- Recortes regionales con resultados numéricamente idénticos al modelo completo en las especies conservadas (diferencia absoluta máxima < 1e-6).
- Compatibilidad de búfer con Perch v2, lo que permite encadenar ambos clasificadores sobre el mismo audio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador de audio, no un modelo generativo.
- Capacidades multilingües: no aplica.

## Casos de uso

- Monitorización de biodiversidad en campo: despliegue del recorte regional correspondiente (por ejemplo, `iberia` con 649 clases y 122,5 MB, o `central-europe` con 667 clases y 122,9 MB) en grabadoras autónomas o Raspberry Pi 5, alimentando el modelo con ventanas de 5 segundos a 32 kHz para obtener detecciones por especie a lo largo de estaciones de grabación continuas.
- Vigilancia acústica pasiva en parques naturales: el modelo completo de 361 MB puede ejecutarse en un servidor con GPU mediante ONNX Runtime con CUDA o TensorRT, procesando en lote (`batch`) múltiples ventanas de audio para cubrir muchos puntos de escucha simultáneamente.
- Investigación en bioacústica computacional: los embeddings de 1.280 dimensiones permiten construir índices de similitud acústica, agrupar vocalizaciones y comparar comunidades de aves entre localizaciones sin depender de la clasificación cerrada.
- Aplicaciones de ciencia ciudadana: integración en herramientas tipo BirdNET-Go o apps móviles que reciben audio de usuario y devuelven la especie probable, usando el recorte regional para reducir el tamaño de descarga y el consumo de memoria en dispositivos de gama baja.
- Evaluación de impacto ambiental: procesamiento de grabaciones previas y posteriores a una obra o cambio de uso del suelo, comparando las detecciones por especie con el modelo completo para mantener cobertura global.
- Detección de especies cosmopolitas y de presencia humana: dado que cada tesela regional incluye Homo sapiens y las clases de sonidos no animales, el modelo puede emplearse para filtrar grabaciones con presencia humana o distinguir eventos antropogénicos de vocalizaciones.
- Despliegue en entornos sin GPU: el modelo FP32 corre en ONNX Runtime CPU tanto en x86-64 como en Raspberry Pi 5, lo que permite montar estaciones de bajo coste sin acelerador dedicado.
- Investigación sobre especies raras o migratorias: el modelo completo de 11.725 clases cubre especies fuera del rango del filtro geomodel, útil en puntos de muestreo con especies divagantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta comparaciones de validación entre runtimes: las puntuaciones de OpenVINO a f32 coinciden con las de ONNX Runtime x86-64, y la ventaja de OpenVINO sobre ONNX Runtime CPU fue como máximo del 7% donde se midió. Las entradas de CUDA y TensorRT no se ejecutaron para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo FP32 ocupa 361 MB en disco; los recortes regionales oscilan entre 113,7 MB (`azores`, 242 clases) y 139,0 MB (`western-palearctic`, 1.418 clases).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el grafo es compatible con CUDA y TensorRT, aunque esas rutas no se validaron en esta release.
- Cabe en GPU de consumo: sí, por tamaño (361 MB en FP32), aunque no hay validación publicada en tarjetas concretas.
- Opciones de despliegue: ONNX Runtime (CPU x86-64 y Raspberry Pi 5, validado) y OpenVINO a f32 (CPU e iGPU de Intel, validado). OpenVINO debe ejecutarse en f32: su valor por defecto de f16 produce puntuaciones incorrectas en Cortex-A76 y en GPUs Intel.
- Latencia y throughput estimados: no disponibles. La model card solo indica que la ventaja de OpenVINO sobre ONNX Runtime CPU fue como máximo del 7% donde se midió.
- Nota: un único modelo sirve para CPU y GPU; no hay builds separados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Entrada | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|---|
| BirdNET+ V3.0 (esta ficha) | EfficientNetV2-S, 3 cabezas | 11.725 | 5 s a 32 kHz | Apache-2.0 | ONNX FP32 | 361 MB (completo) |
| BirdNET+ V3.0 regional | EfficientNetV2-S, 3 cabezas | 242–1.418 | 5 s a 32 kHz | Apache-2.0 | ONNX FP32 | 113,7–139,0 MB |
| Perch v2 | no disponible | no disponible | 5 s a 32 kHz | no disponible | no disponible | no disponible |

La información proporcionada solo menciona Perch v2 como referencia de compatibilidad de formato de entrada y de teselas regionales; no se detallan parámetros, contexto, rendimiento ni licencia de ese modelo, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo de clasificación de audio: no genera texto, no soporta tool calling ni razonamiento multi-step; no debe presentarse como un LLM.
- Solo se distribuye en FP32. No hay versión int8-arm para v3.0 porque el backbone está dominado por convoluciones y la cuantización int8-arm solo afecta a pesos MatMul/Gemm, con beneficio marginal.
- OpenVINO debe ejecutarse en f32; su valor por defecto de f16 produce puntuaciones erróneas en Cortex-A76 y GPUs Intel.
- Las rutas CUDA y TensorRT no se validaron en esta release, aunque el grafo es compatible con ellas.
- Los recortes regionales no emiten especies fuera de la región: en ubicaciones con especies divagantes o migratorias fuera de rango puede ser preferible el modelo completo.
- Los recortes se construyen a partir del filtro de rango del BirdNET Geomodel v3.0.2, con un tope de 800 clases para la mayoría de teselas templadas; especies raras pueden quedar fuera del recorte.
- Riesgo de falsos positivos y confusión entre especies de vocalizaciones similares: no se documentan métricas de precisión o recall en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la release original incluye un documento de uso aceptable (`ACCEPTABLE_USE-v3.0.md`) que debe revisarse antes de desplegar en producción.
- El repositorio tiene 5,8 GB de tamaño total por el catálogo de recortes regionales; conviene descargar solo la tesela necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/tphakala/BirdNET-Plus-V3.0
- BirdNET (Cornell Lab): https://birdnet.cornell.edu/
- Release original BirdNET+ V3.0 (Zenodo): https://doi.org/10.5281/zenodo.24162518
- Kahl et al. (2021): referencia citada en la model card, sin URL directa disponible
- Lasseck (2018): referencia citada en la model card, sin URL directa disponible
