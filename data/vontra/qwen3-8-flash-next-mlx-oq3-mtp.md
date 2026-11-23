# Vontra/Qwen3.8-Flash-Next-MLX-oQ3-MTP

## Resumen

Qwen3.8-Flash-Next-MLX-oQ3-MTP es una conversión cuantizada para Apple Silicon del modelo Qwen3.8-Flash-Next de Qwen (Alibaba), publicada por el usuario Vontra (la model card referencia la organización TensorFold). Se trata de un modelo vision-lenguaje con arquitectura de mezcla de expertos dispersa (`qwen4_exp`), 179.999.981.459 parámetros totales según los safetensors del repositorio, y una ventana de contexto configurada de 262.144 tokens. El paquete pesa 92,5 GB repartidos en 19 shards de safetensors en formato MLX.

El valor de esta conversión no está en el modelo base, sino en el proceso de cuantización: una base afín de 3 bits con grupo de tamaño 32, complementada con 746 overrides de mayor precisión (314 módulos a 4 bits, 82 a 5 bits, 127 a 6 bits y 223 a 8 bits) seleccionados mediante un proxy de sensibilidad calibrado. Además, se preserva el bloque nativo de predicción de siguiente token (MTP) del modelo original, de 4B parámetros, lo que permite decodificación especulativa sin un modelo borrador externo.

Es relevante para quienes trabajan con hardware Apple: consigue ejecutar un MoE de 180B parámetros con visión en un único equipo de memoria unificada, con un incremento medido del 9,60% en velocidad de decodificación al activar MTP (de 26,5352 a 29,0822 tokens/s en un Apple M3 Studio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp`: vision-lenguaje MoE dispersa con Gated DeltaNet, Qwen Sparse Attention, residuales con compuertas ensanchadas y embeddings hasheados de bigramas/trigramas |
| Parametros totales | 179.999.981.459 (125B LM + 51B embeddings n-grama + 4B MTP) |
| Parametros activos | 6B en el LM (512 expertos enrutados, 10 activos, mas 1 compartido) |
| Longitud de contexto | 262.144 tokens (extensible upstream a 1.000.000) |
| Tipos de cuantizacion | oQ3: base afín 3 bits, grupo de 32, con 746 overrides (4/5/6/8 bits) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | MLX safetensors (19 shards, 92,505 GB / 86,152 GiB) |

## Arquitectura y entrenamiento

El modelo base combina varias piezas: capas con Gated DeltaNet (atención de estado recurrente lineal) junto a Qwen Sparse Attention, capas MoE dispersas con 512 expertos enrutados (10 activos) y un experto compartido, tamaño oculto de 2.560 y 48 capas. Un componente poco habitual es el embedding n-grama de 51B parámetros con 20.000.000 de entradas, que codifica bigramas y trigramas hasheados. El bloque MTP nativo añade 4B parámetros en una capa borrador, diseñada para decodificación especulativa interna.

Sobre el entrenamiento del modelo original no se aportan datos en la información disponible: no se especifican número de tokens, composición del dataset ni si hubo RLHF o DPO. La conversión sí está documentada: el conversor leyó directamente el checkpoint BF16 oficial, midió la sensibilidad por capa con un proxy de calibración cuantizado validado y aplicó una base afín de 3 bits con grupo de 32 más los 746 overrides de precisión. Se conservan el tokenizador, la plantilla de chat, el procesador de visión, la configuración de generación y la configuración MTP del modelo upstream. La validación estructural cubrió los 3.747 tensores indexados (76 de ellos del bloque MTP) y los 19 shards.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Comprensión de imagen y texto (`image-text-to-text`): el procesador de visión upstream se mantiene intacto.
- Razonamiento, código y matemáticas: capacidades heredadas del modelo base, sin métricas publicadas en esta ficha.
- Decodificación especulativa nativa mediante el bloque MTP de 4B parámetros, activable o desactivable en tiempo de ejecución.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling y uso como agente: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales con documentos largos: la ventana de 262.144 tokens permite cargar contratos, informes o bases de código completas en un solo contexto sin recuperación externa, con la ventaja de que todo el procesamiento ocurre en el equipo.
- Análisis de imágenes en flujos de trabajo de escritorio: al conservar el procesador de visión, se puede usar para transcribir capturas, describir diagramas técnicos o extraer datos de gráficos dentro de una aplicación macOS nativa.
- Prototipado e investigación en Apple Silicon: sirve para experimentar con decodificación especulativa MTP (comparando modos con y sin MTP, como hace la propia model card) sin necesidad de GPUs de datacenter.
- Procesamiento por lotes de documentación técnica: con 29 tokens/s sostenidos en un M3 Studio, es viable generar resúmenes o reescrituras de lotes de documentos durante la noche en una estación de trabajo.
- Evaluación comparativa de cuantizaciones: el esquema mixto oQ3 con 746 overrides permite estudiar el impacto de la precisión selectiva en módulos sensibles frente a una cuantización uniforme de 3 bits.
- Desarrollo de herramientas internas sin conexión: al ejecutarse en local, encaja en entornos con requisitos de confidencialidad donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

La model card solo publica mediciones de velocidad de decodificación en un Apple M3 Studio (oMLX 0.6.3rc3 build 2475, MLX-VLM 0.6.3, MLX 0.32.0, decodificación greedy, semilla 6330, tres ejecuciones de 512 tokens por modo):

| Modo de ejecucion | Ejecuciones | Salida por ejecucion | Velocidad mediana | Borradores | Aceptados | Tasa de aceptacion |
|---|---:|---:|---:|---:|---:|---:|
| MTP desactivado | 3 | 512 tokens | 26,5352 tokens/s | no aplica | no aplica | no aplica |
| MTP activado | 3 | 512 tokens | 29,0822 tokens/s | 847 | 583 | 68,83% |

La activacion de MTP mejoro el throughput mediano un 9,60%, y ambas configuraciones produjeron hashes de salida identicos. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria: el repositorio pesa 92,5 GB, por lo que se necesita un equipo Apple Silicon con al menos 128 GB de memoria unificada para cargar los pesos con margen para KV cache y el procesador de visión.
- GPU: exclusivamente Apple Silicon (M-series). No es compatible con CUDA ni con GPUs NVIDIA (A100, H100, RTX 4090).
- Consumer GPU: no cabe en ninguna GPU de consumo discreta; el requisito es memoria unificada de gama alta en Mac Studio o Mac Pro.
- Despliegue: MLX y MLX-VLM; la model card cita oMLX como runtime de referencia. Requiere un runtime con soporte explícito de `qwen4_exp` y del módulo MTP nativo, ya que un cargador estricto sin ese soporte rechazará los 76 tensores MTP.
- Latencia y throughput: 26,5352 tokens/s sin MTP y 29,0822 tokens/s con MTP en un M3 Studio, con decodificación greedy y 512 tokens de salida. La primera petición tras la carga incluye calentamiento y queda excluida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia |
|---|---|---|---|---|
| Vontra/Qwen3.8-Flash-Next-MLX-oQ3-MTP | 180B totales / 6B activos | 262.144 | MLX safetensors, Apple Silicon | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | 180B totales / 6B activos | 262.144 | BF16, hardware de datacenter | qwen-community-1.0 |
| Alternativas de tamano similar en MLX | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el checkpoint BF16 original: misma arquitectura y contexto, pero este último exige hardware de datacenter, mientras que la conversión oQ3 reduce el peso a 92,5 GB y lo hace ejecutable en un Mac Studio. No se dispone de datos sobre otras conversiones MLX comparables ni sobre benchmarks de calidad que permitan contrastar la pérdida por cuantización.

## Limitaciones y advertencias

- La cuantización a 3 bits con overrides selectivos puede degradar la calidad frente al BF16 original; no se publican evaluaciones de calidad que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente al modelo base; no se aportan datos específicos de tasas de error.
- Idiomas soportados no documentados en esta ficha; conviene verificar el comportamiento en castellano antes de usarlo en producción.
- La licencia Qwen Community License 1.0 impone condiciones adicionales al uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar.
- Requiere un runtime con soporte de `qwen4_exp` y MTP nativo; cargadores estrictos fallarán al encontrar los 76 tensores MTP.
- El rendimiento medido corresponde a un único equipo (M3 Studio); la velocidad variará con la longitud del prompt, el crecimiento del contexto, el estado de la caché, la presión de memoria y las condiciones térmicas.
- El autor del repositorio (Vontra) no coincide con la organización citada en la model card (TensorFold), lo que conviene tener en cuenta para trazabilidad y soporte.
- No hay información sobre tool calling ni capacidades de agente, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ3-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre el modelo: https://qwen.ai/blog?id=qwen3.8-flash-next
- Sitio de Qwen: https://qwen.ai/
- MLX-VLM: https://github.com/ml-explore/mlx-vlm
- Licencia (referenciada en el repo): LICENSE
- TensorFold: https://tensorfold.dev
