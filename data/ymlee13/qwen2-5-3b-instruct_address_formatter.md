# ymlee13/Qwen2.5-3B-Instruct_Address_Formatter

## Resumen

El modelo `ymlee13/Qwen2.5-3B-Instruct_Address_Formatter` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por ymlee13 que afina el modelo base `Qwen/Qwen2.5-3B-Instruct` para la tarea específica de parseo y formateo de direcciones de Hong Kong. El objetivo es transformar direcciones desestructuradas o con formato irregular en dos líneas limpias y estructuradas siguiendo las convenciones postales de Hong Kong: la línea 1 contiene los detalles específicos (piso, unidad, nombre del edificio) y la línea 2 la ubicación general (calle, distrito, región).

El adaptador se entrenó sobre un conjunto de datos de más de 570 direcciones reales de Hong Kong generadas a partir de datos geoespaciales gubernamentales (ALS-GeoJSON) y ejemplos sintéticos. El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only de 3,09 mil millones de parámetros con atención por grupos de consultas (GQA), posiciones rotatorias (RoPE), activación SwiGLU y normalización RMSNorm, con soporte de contexto de hasta 128K tokens. El adaptador LoRA añade una capa de especialización sin modificar los pesos originales, lo que permite cargarlo y descargarlo fácilmente sobre el modelo base.

La relevancia de este modelo radica en su aplicación práctica para limpieza y estructuración de datos de direcciones en sectores como logística, comercio electrónico y administración pública, donde la calidad de los datos postales es crítica. Al ser un adaptador ligero (0,1 GB) con licencia MIT, puede integrarse en pipelines existentes con bajo coste computacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con GQA, RoPE, SwiGLU, RMSNorm |
| Parametros totales | 3,09 mil millones (modelo base) + adaptador LoRA (número exacto no disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (modelo base); entrenado con secuencias de 256 tokens |
| Tipos de cuantizacion | fp16, 4-bit (NF4) para inferencia; entrenado con 4-bit NF4 |
| Idiomas soportados | Inglés, chino tradicional, chino simplificado |
| Licencia | MIT (adaptador); Apache 2.0 (modelo base Qwen2.5-3B-Instruct) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo Qwen2.5-3B-Instruct, un transformer causal con 28 capas, 16 cabezas de atención para consultas y 2 para claves/valores (GQA), dimensiones ocultas de 2048 y vocabulario de 151K tokens. El entrenamiento del adaptador utilizó LoRA con rango 8, alpha 16 y dropout 0,15, aplicado a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Se empleó el optimizador `paged_adamw_8bit` con tasa de aprendizaje 2e-5, scheduler coseno, 3 épocas, batch size 4 y acumulación de gradientes de 2, con una longitud máxima de secuencia de 256 tokens.

El conjunto de entrenamiento consistió en 570+ direcciones de Hong Kong generadas a partir de datos geoespaciales reales del gobierno (ALS-GeoJSON) y ejemplos sintéticos creados con un script personalizado. Cada ejemplo contiene una dirección desordenada como entrada y un JSON estructurado con `line1` y `line2` como salida. El pipeline de inferencia incluye post-procesamiento avanzado: agrupación de caracteres para alinear la salida con la entrada original, detección y reinserción de caracteres omitidos, detección de idioma (chino/inglés), conversión de chino simplificado a tradicional mediante OpenCC y corrección ortográfica en inglés.

## Capacidades

- Parseo y formateo de direcciones de Hong Kong en dos líneas estructuradas (detalle específico y ubicación general).
- Soporte bilingüe: inglés y chino (tradicional y simplificado), con estrategias de procesamiento diferenciadas por idioma.
- Post-procesamiento inteligente que garantiza que los caracteres de salida provengan del texto original, reduciendo alucinaciones.
- Detección de omisiones y reinserción automática de caracteres faltantes.
- Conversión automática de chino simplificado a tradicional mediante OpenCC.
- Corrección ortográfica básica en inglés con sugerencias.
- Integración sencilla con el ecosistema Hugging Face Transformers y PEFT (carga del adaptador con `PeftModel`).

## Casos de uso

- **Limpieza de bases de datos de clientes en logística**: el modelo normaliza direcciones de envío desordenadas o con formatos inconsistentes, separando el edificio y la unidad de la calle y el distrito, lo que facilita la validación y el enrutamiento de paquetes.
- **E-commerce con entregas en Hong Kong**: integración en el flujo de checkout para formatear automáticamente las direcciones introducidas por el usuario, reduciendo errores de entrega y mejorando la experiencia de compra.
- **Sistemas de gestión de relaciones con clientes (CRM)**: estandarización de direcciones de contacto en registros de clientes, permitiendo búsquedas y análisis geoespaciales más precisos.
- **Administración pública y catastro**: procesamiento de direcciones extraídas de documentos oficiales o formularios para su incorporación a sistemas de información geográfica (SIG).
- **Automatización de procesos de verificación postal**: el modelo puede preprocesar direcciones antes de pasarlas a servicios de validación externos, reduciendo el número de rechazos por formato incorrecto.
- **Extracción de direcciones desde texto libre**: combinado con un sistema de OCR o extracción de entidades, el adaptador formatea direcciones extraídas de correos electrónicos, facturas o formularios escaneados.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de evaluación sobre un conjunto de prueba reservado, utilizando similitud a nivel de caracteres (SequenceMatcher ratio):

| Métrica | Valor típico |
|---|---|
| Similitud media línea 1 | 75-90% |
| Similitud media línea 2 | 75-90% |
| Coincidencia estricta de ambas líneas | 60-75% |
| Velocidad de inferencia | ~0,5-1,0 s por dirección |

No se han publicado comparaciones con otros modelos de parseo de direcciones en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con cuantización 4-bit (NF4), el modelo base de 3B ocupa aproximadamente 2-3 GB; en fp16, alrededor de 6 GB. El adaptador LoRA añade menos de 0,1 GB.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en 4-bit. Para fp16, se recomienda 8 GB o más.
- **Compatibilidad con consumer GPU**: sí, el modelo cabe en GPUs de gama media y baja gracias a la cuantización.
- **Opciones de despliegue**: se puede cargar con `transformers` + `peft` en Python, o exportar a GGUF (fusionando el adaptador con el base) para usarlo con `llama.cpp` u Ollama. También es compatible con servidores de inferencia como vLLM o TGI si se fusiona previamente.
- **Latencia y throughput**: la inferencia tarda entre 0,5 y 1,0 segundos por dirección en hardware consumer, lo que permite procesar lotes pequeños en tiempo real.

## Comparativa con modelos similares

No se dispone de modelos específicos de formateo de direcciones de Hong Kong con los que comparar directamente. Como referencia, se compara con el modelo base sin adaptador:

| Modelo | Parámetros | Contexto | Tarea específica | Licencia |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3,09B | 128K | Generación general, sin especialización en direcciones | Apache 2.0 |
| Qwen2.5-3B-Instruct + adaptador (este modelo) | 3,09B + LoRA | 128K (entrenado con 256) | Formateo de direcciones de Hong Kong | MIT (adaptador) |
| Otros modelos de parsing de direcciones (p. ej., spaCy, libpostal) | Variable | Variable | Parsing genérico de direcciones, no específico de HK | Variable |

La ventaja de este adaptador es su especialización en el formato de Hong Kong y su ligereza, aunque su cobertura geográfica es limitada.

## Limitaciones y advertencias

- **Alcance geográfico limitado**: el modelo solo ha sido entrenado con direcciones de Hong Kong; no generaliza bien a direcciones de otras regiones o países.
- **Conjunto de datos pequeño**: 570+ ejemplos pueden no cubrir toda la variabilidad de direcciones reales, lo que puede provocar errores en casos atípicos.
- **Riesgo de alucinación**: aunque el post-procesamiento mitiga la generación de caracteres nuevos, el modelo puede producir salidas incorrectas si la entrada es muy ruidosa o contiene errores tipográficos graves.
- **Longitud de secuencia limitada en entrenamiento**: el adaptador se entrenó con 256 tokens, por lo que direcciones muy largas o con múltiples componentes podrían no procesarse correctamente.
- **Dependencia del modelo base**: el rendimiento final depende de Qwen2.5-3B-Instruct; cualquier limitación del base (sesgos, alucinaciones) se hereda.
- **Licencia dual**: aunque el adaptador es MIT, el modelo base Qwen2.5-3B-Instruct se distribuye bajo Apache 2.0, lo que debe tenerse en cuenta para uso comercial.
- **Sin soporte de tool calling ni agentes**: el adaptador está diseñado exclusivamente para la tarea de formateo de direcciones; no añade capacidades de razonamiento multi-paso ni interacción con herramientas.

## Enlaces

- [HuggingFace - adaptador LoRA](https://huggingface.co/ymlee13/Qwen2.5-3B-Instruct_Address_Formatter)
- [HuggingFace - modelo base Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [GitHub - proyecto address_parsing (ymlee13)](https://github.com/ymlee13/address_parsing)
- [Ollama - Qwen2.5 3B Instruct](https://ollama.com/library/qwen2.5:3b-instruct)
