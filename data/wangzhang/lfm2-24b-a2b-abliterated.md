# wangzhang/LFM2-24B-A2B-abliterated

## Resumen

LFM2-24B-A2B-abliterated es una versión modificada del modelo LFM2-24B-A2B de Liquid AI, creada por wangzhang mediante la técnica Abliterix. El modelo original es un MoE híbrido con 24B parámetros totales y 2.3B activos por token, que combina convoluciones cortas con atención por grupos (GQA) y mezcla de expertos. Esta versión elimina los comportamientos de rechazo del modelo original, reduciendo las negativas de 90% a 0% en una evaluación de 100 prompts dañinos, manteniendo una divergencia KL de 0.0079 respecto al original, lo que indica que las capacidades generales apenas se ven alteradas.

Es relevante porque es el primer abliteration exitoso de una arquitectura híbrida no transformer, lo que demuestra que la técnica puede aplicarse más allá de los transformers estándar. El modelo está pensado para investigación y evaluación, y su licencia (LFM Open License v1.0) incluye una limitación comercial basada en un umbral de ingresos. Soporta inglés y chino, y tiene una ventana de contexto de 128K tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: convolución corta con GQA + MoE (64 expertos, top-4) |
| Parametros totales | 23.843.661.440 (24B) |
| Parametros activos | 2.3B por token |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | BF16, INT8, NF4 |
| Idiomas soportados | en, zh |
| Licencia | LFM Open License v1.0 (con limitación comercial por umbral de ingresos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LFM2-24B-A2B utiliza una arquitectura híbrida que combina bloques de convolución corta con atención por grupos (GQA) y una capa de mezcla de expertos con 64 expertos y routing top-4. Tiene 40 capas en total: 10 de atención y 30 de convolución, con un tamaño oculto de 2048. Esta arquitectura está diseñada para escalar eficientemente en dispositivos de una sola GPU.

El proceso de abliteration se realizó con Abliterix, una herramienta de intervención en el espacio de pesos. Se calcularon direcciones de rechazo a partir de 400 pares de prompts dañinos y benignos en las 40 capas, se aplicó abliteration ortogonalizada para aislar los patrones de activación específicos del rechazo, y se intervinieron tres tipos de componentes: proyecciones de salida de convolución, proyecciones de salida de atención y proyecciones de salida de MLP/expertos. Además, se perfilaron las activaciones de los expertos en 38 capas de router para identificar expertos críticos para la seguridad, y se aplicó un steering híbrido: supresión de pesos del router en 25 expertos (bias=-0.41) y abliteration fusionada de expertos (weight=2.79). El proceso se optimizó con Optuna TPE en el ensayo 10 de 50.

## Capacidades

- Generación de texto en inglés y chino, con razonamiento y comprensión de contexto largo (128K tokens).
- Capacidad de procesar documentos extensos y mantener coherencia en conversaciones multi-turno.
- Al ser una versión abliterated, no muestra comportamientos de rechazo ante solicitudes que el modelo original rechazaría (evaluado con 100 prompts dañinos, 0% de rechazos frente al 90% del original).
- La divergencia KL de 0.0079 respecto al modelo base indica que las capacidades generales de generación, razonamiento y conocimiento se mantienen prácticamente intactas.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación en seguridad de IA: permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, analizando patrones de alineación y posibles riesgos en entornos controlados.
- Evaluación de técnicas de alineación: sirve como punto de comparación para medir la efectividad de métodos de abliteration y otras intervenciones en el espacio de pesos.
- Generación de contenido creativo sin restricciones: útil para proyectos de escritura, guiones o narrativa donde se requiera explorar temas sensibles sin filtros automáticos, siempre bajo supervisión humana.
- Procesamiento de documentos largos en chino e inglés: gracias a su contexto de 128K tokens, puede resumir, analizar o extraer información de manuales, informes o contratos extensos.
- Fine-tuning para dominios específicos: al ser un modelo abierto con pesos en safetensors, puede adaptarse mediante fine-tuning para tareas concretas como análisis de sentimiento, clasificación de texto o generación de respuestas en dominios técnicos.
- Desarrollo de chatbots multilingües: su soporte para inglés y chino, junto con su capacidad de conversación multi-turno, lo hace adecuado para prototipos de asistentes en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta dos métricas de evaluación:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0.0079 | 0 |
| Rechazos (sobre 100 prompts dañinos) | 0/100 (0%) | 90/100 (90%) |

La evaluación se realizó con un juez LLM (Gemini Flash) sobre 100 prompts dañinos. La baja divergencia KL indica que las capacidades generales son prácticamente idénticas al modelo original.

## Requisitos de hardware

- VRAM estimada: ~48 GB en BF16, ~24 GB en INT8, ~12 GB en NF4.
- GPUs recomendadas: A100 80GB o H100 para BF16; A40 o RTX 4090 para INT8; RTX 3090 o RTX 4080 para NF4.
- Cabe en GPU de consumo: sí, con cuantización NF4 en RTX 3090/4080 (12 GB VRAM).
- Despliegue: compatible con transformers (AutoModelForCausalLM) y vLLM, aunque no se menciona explícitamente. La model card indica que requiere una sola GPU, ya que las capas de convolución no soportan el particionado multi-GPU de accelerate.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2-24B-A2B (base) | 24B | 2.3B | 128K | LFM Open License v1.0 | Modelo original con guardarraíles |
| LFM2-24B-A2B-abliterated | 24B | 2.3B | 128K | LFM Open License v1.0 | Versión sin rechazos, KL 0.0079 |
| Otros modelos abliterated (p.ej. Llama-3-8B-Instruct-abliterated) | 8B | 8B | 8K | MIT (original) | No comparable en arquitectura ni tamaño; no hay datos de esta versión |

No se dispone de información sobre otros modelos abliterated con arquitectura híbrida similar, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, explícito, peligroso o ilegal. Está destinado exclusivamente a investigación y evaluación, no a uso en producción sin supervisión humana.
- La licencia LFM Open License v1.0 incluye una limitación comercial basada en un umbral de ingresos. Es obligatorio revisar el texto completo de la licencia antes de cualquier uso comercial o redistribución.
- El modelo requiere una sola GPU; las capas de convolución no soportan el particionado multi-GPU de accelerate, lo que limita el despliegue en configuraciones con varias GPUs.
- No se han publicado resultados de benchmarks estándar, por lo que el rendimiento en tareas como razonamiento, código o matemáticas no está verificado de forma independiente.
- El riesgo de alucinación no se ha evaluado específicamente en esta versión, aunque es inherente a los modelos de lenguaje de este tamaño.
- El modelo solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wangzhang/LFM2-24B-A2B-abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM2-24B-A2B
- Blog de Liquid AI sobre LFM2-24B-A2B: https://www.liquid.ai/blog/lfm2-24b-a2b
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm2-24b-a2b
- Página en LM Studio: https://lmstudio.ai/models/lfm2-24b-a2b
- Repositorio de Abliterix: https://github.com/wuwangzhang1216/abliterix
