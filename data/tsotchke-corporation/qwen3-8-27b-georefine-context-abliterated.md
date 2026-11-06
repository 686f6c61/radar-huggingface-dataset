# Tsotchke-Corporation/Qwen3.8-27B-GeoRefine-Context-abliterated

## Resumen

Qwen3.8-27B-GeoRefine-Context-abliterated es un paquete de distribucion publicado por Tsotchke-Corporation que contiene el modelo Huihui-Qwen3.8-27B-abliterated almacenado mediante GeoRefine GLC v2, un codec de compresion sin perdida reversible. No se trata de un modelo entrenado desde cero ni de un fine-tuning nuevo: es el mismo conjunto de tensores BF16 del modelo padre, empaquetado de forma que la decodificacion recupera cada tensor bit a bit, incluidos los componentes de texto, vision y MTP (multi-token prediction) que conserva el padre.

El interes tecnico reside en el mecanismo de empaquetado: el repositorio ocupa 36.320.115.845 bytes frente a los 55.586.059.962 bytes del padre fijado, lo que arroja una ratio de compresion de paquete completo de 1,530448x, verificada contra un minimo exacto de 1,53x. El paquete incluye frames de modelo, metadatos, decodificador, licencias y evidencia de la release con checksums y procedencia.

La relevancia es acotada pero clara para quien distribuya o archive modelos grandes: demuestra una via de reducir el peso de transferencia de un modelo de ~27B de parametros sin alterar sus pesos, a costa de exigir un paso de restauracion previo a la inferencia. El modelo base hereda la arquitectura Qwen3.5 y el proceso de abliteration aplicado por Huihui, aunque el publicador no aporta mediciones de memoria, latencia ni inferencia acelerada para este padre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); incluye componentes de texto, vision y MTP |
| Parametros totales | 27B (nominal, segun nombre del modelo); recuento exacto no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El paquete se distribuye en BF16 comprimido con GeoRefine GLC v2 (sin perdida); cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete GeoRefine GLC v2 con decodificador en Python/NumPy/C++17; tras la restauracion, safetensors BF16 del padre |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de la familia Qwen3.5 con aproximadamente 27B de parametros, en la variante abliterated publicada por Huihui (huihui-ai/Huihui-Qwen3.8-27B-abliterated, revision 739e3c5b89849f6c238ce1e5b70008612ae42cdd). El padre conserva modulos de vision y de multi-token prediction, ademas del stack de texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) empleadas en el modelo original.

La innovacion de esta release no esta en el entrenamiento sino en el transporte: GeoRefine GLC v2 aplica un codec reversible que reduce el tamano del paquete a 36,3 GB desde los 55,6 GB del padre, con verificacion por checksum de cada tensor y de los hashes de los shards safetensors reconstruidos. La restauracion requiere espacio para el padre BF16 completo y debe hacerse sobre un destino nuevo; los ficheros restaurados se cargan con la arquitectura Transformers soportada por el padre y su plantilla de chat original.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo Qwen3.5 base.
- Procesamiento de vision, ya que el padre conserva los componentes visuales en el paquete comprimido.
- Multi-token prediction (MTP), componente retenido segun la model card.
- Comportamiento abliterated: el publicador describe el padre como abliterated, orientado a reducir rechazos en las respuestas.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Archivado y espejo de modelos grandes: el paquete reduce el almacenamiento y el ancho de banda de transferencia en un factor de 1,53x respecto al BF16 original, util para mirrors internos o distribucion a nodos remotos.
- Distribucion a entornos con cuota de disco ajustada: permite depositar el modelo en un volumen de 36,3 GB y restaurarlo temporalmente a 55,6 GB solo en el nodo de inferencia que lo vaya a cargar.
- Verificacion de integridad en pipelines de MLOps: los checksums por tensor y por shard permiten validar que los pesos restaurados coinciden bit a bit con el padre antes de desplegarlos.
- Investigacion sobre abliteration: al restaurar el padre exacto se puede reproducir y auditar el efecto de la abliteration de Huihui sobre Qwen3.5 sin depender de la copia original.
- Experimentos con vision y MTP: al conservarse los componentes visuales y de prediccion multi-token, sirve para evaluar esas ramas del modelo en tareas multimodales.
- Reproducibilidad de resultados: el pin de revision y la evidencia de procedencia permiten reconstruir un entorno identico para comparar experimentos entre equipos.
- Base para un despliegue cuantizado posterior: tras restaurar el BF16 se puede aplicar la cuantizacion que convenga al hardware objetivo, aunque el publicador menciona un modelo de telefono cuantizado separado cuyas metricas aun estan pendientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas de compresion: 55.586.059.962 bytes en el padre frente a 36.320.115.845 bytes en esta release, con ratio de 1,530448x verificada contra un minimo exacto de 1,53x. Las mediciones de memoria, latencia e inferencia acelerada para este padre estan pendientes segun el publicador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; en BF16, un modelo de ~27B requiere del orden de 54 GB solo para pesos, mas overhead de activaciones y cache KV, pero esta cifra es una estimacion generica y no un dato publicado.
- GPU recomendadas: no disponible; el publicador no especifica hardware validado.
- Cabe en GPU de consumo: no disponible; con 27B en BF16 no es viable en GPU de consumo sin cuantizacion, y no se documenta ninguna.
- Opciones de despliegue: el paquete se restaura con `package/decoder/predictor_package.py` (Python, NumPy y compilador C++17); tras la restauracion, los ficheros se cargan con la arquitectura Transformers del padre. Soporte de vLLM, llama.cpp, Ollama o TGI no confirmado.
- Latencia y throughput: no disponibles; el publicador indica explicitamente que las mediciones de memoria, latencia e inferencia acelerada para este padre siguen pendientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de distribucion | Licencia | Notas |
|---|---|---|---|---|---|
| Tsotchke-Corporation/Qwen3.8-27B-GeoRefine-Context-abliterated | 27B (nominal) | no disponible | GeoRefine GLC v2, restaurable a safetensors BF16 | Apache 2.0 | Paquete comprimido 1,53x del padre; requiere restauracion previa |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B (nominal) | no disponible | safetensors BF16 | Apache 2.0 (heredada) | Padre directo, 55,6 GB, carga inmediata sin decodificador |
| Qwen3.5 27B base (familia) | 27B (nominal) | no disponible | safetensors | no disponible | Modelo original sin abliteration; referencia de comportamiento |

La comparativa se limita a estos tres porque la informacion disponible no incluye datos de rendimiento que permitan contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- No es un modelo listo para inferencia directa: exige descargar el repositorio completo, ejecutar el decodificador y restaurar 55,6 GB de BF16 antes de cargar nada.
- La restauracion necesita espacio libre para el padre completo y un destino nuevo; no se documenta restauracion in-place.
- El decodificador de referencia es para Linux y depende de Python, NumPy y un compilador C++17; no se mencionan builds para Windows o macOS.
- El publicador declara que no se ha establecido ninguna garantia universal de cero rechazos pese a la etiqueta abliterated; el comportamiento real puede variar.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un derivado de Qwen3.5 sin datos de evaluacion publicados, no pueden descartarse.
- Idiomas soportados y longitud de contexto no declarados, lo que impide planificar despliegues multilingues o de contexto largo con garantias.
- Sin benchmarks ni mediciones de latencia, no hay base para estimar coste por token en produccion.
- La licencia Apache 2.0 se hereda del padre y se conserva en `model-assets.tar.xz`; conviene revisar los terminos del modelo Qwen3.5 original antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre la integridad o el funcionamiento del paquete.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tsotchke-Corporation/Qwen3.8-27B-GeoRefine-Context-abliterated
- Modelo padre: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Revision fijada del padre: 739e3c5b89849f6c238ce1e5b70008612ae42cdd
- Paper, blog, repositorio de codigo o demo de GeoRefine: no disponibles en la informacion proporcionada.
