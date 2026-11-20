# tudor-iustin22/Bluebird-1.5-Instruct

## Resumen

Bluebird 1.5 Instruct es un modelo de lenguaje causal decoder-only de 742,5 millones de parámetros desarrollado por el autor independiente tudor-iustin22 dentro del proyecto Project Bluebird. Se trata de la variante ajustada por instrucciones del checkpoint Bluebird 1.5 Base, y está orientada a generación de texto conversacional, seguimiento de instrucciones y tareas de generación orientadas a objetivos. Su rasgo diferencial es una arquitectura híbrida que combina atención causal local con un mecanismo de memoria fragmentada de largo alcance ("Chunked Fabric Memory"), lo que le permite declarar una ventana de contexto de 32.768 tokens con un coste de atención reducido sobre el contexto antiguo.

El modelo se entrenó desde cero con 23.000.514.560 tokens de preentrenamiento y posteriormente recibió ajuste de identidad y fine-tuning supervisado de instrucciones sobre mezclas de datos como smoltalk2, Mixture-of-Thoughts y Nemotron-Post-Training-Dataset-v1. Todo el entrenamiento se realizó en PyTorch con precisión mixta sobre ocho aceleradores Intel Gaudi 3, lo que lo convierte en un caso poco habitual de modelo entrenado íntegramente en hardware Gaudi y publicado con código de modelo personalizado para `transformers`.

Es relevante ahora por tres motivos: su licencia Apache 2.0 sin restricciones comerciales, su tamaño contenido (1,5 GB en FP16, apto para GPU de consumo) y su enfoque arquitectónico de memoria comprimida por fragmentos, que difiere del de la mayoría de modelos pequeños de la misma categoría y que apunta a un nicho concreto: aplicaciones con contexto largo en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con atención local y memoria fragmentada con compuertas (Chunked Fabric Memory); 24 capas: 16 LocalBlock + 8 FabricMemoryBlock |
| Parametros totales | 742.528.520 (742,5 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (ventana de atención local: 2.048 tokens; tamaño de fragmento de memoria: 512 tokens; 4 resúmenes aprendidos por fragmento; máximo 256 resúmenes a 32K) |
| Tipos de cuantizacion | No disponible (solo se publica el formato FP16 original; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache License 2.0, sujeta a los avisos upstream aplicables |
| Formato de pesos | Safetensors en FP16 (precisión de entrenamiento: mixta) |

Otros datos técnicos: hidden size de 1.536, vocabulario de 65.536 tokens, GQA con 24 cabezas de consulta y 6 cabezas clave/valor, dimensión de cabeza 64, RoPE con theta = 1.000.000, FFN SwiGLU y normalización RMSNorm.

## Arquitectura y entrenamiento

Bluebird 1.5 emplea un transformer decoder-only de 24 capas en el que cada tercer bloque incorpora una segunda ruta de atención sobre memoria comprimida de largo alcance. La atención local es causal exacta sobre los 2.048 tokens más recientes; los tramos anteriores completados se particionan en fragmentos de 512 tokens, cada uno representado por cuatro resúmenes aprendidos, de modo que a 32.768 tokens el modelo puede consultar hasta 256 vectores de resumen. Una compuerta escalar aprendida por token mezcla la salida de la ruta de atención local con la de la ruta de memoria. La atención usa GQA (24 cabezas Q, 6 KV), lo que reduce el coste de memoria KV. Esta estructura limita el coste de atención sobre el contexto antiguo en comparación con aplicar atención completa a toda la secuencia.

El preentrenamiento del linaje Base cubre 23.000.514.560 tokens. Sobre esa base, la variante Instruct añade ajuste de identidad y fine-tuning supervisado de instrucciones con datos de HuggingFaceTB/smoltalk2, open-r1/Mixture-of-Thoughts y nvidia/Nemotron-Post-Training-Dataset-v1. La model card no especifica si se aplicaron RLHF, DPO u otras etapas de alineación preferencial, ni detalla la composición exacta ni el número de tokens de la fase de post-entrenamiento. El entrenamiento se ejecutó en PyTorch con precisión mixta sobre ocho Intel Gaudi 3 (dispositivo `hpu`), con soporte declarado también para Intel Arc (`xpu`).

## Capacidades

- Generación de texto causal en inglés: respuestas conversacionales, respuesta a preguntas, generación de contenido y resumen.
- Seguimiento de instrucciones y generación orientada a tareas, gracias al fine-tuning supervisado sobre mezclas de instrucciones.
- Conversación multi-turno con un formato de chat dedicado con roles system, user y assistant y delimitadores explícitos de mensaje.
- Manejo de contexto largo de hasta 32.768 tokens mediante memoria fragmentada, con acceso eficiente a contexto anterior a través de resúmenes de fragmento aprendidos.
- Identidad de asistente ajustada explícitamente ("identity tuning").
- Capacidad de razonamiento y matemáticas: no verificada de forma independiente; el modelo se entrenó parcialmente con Mixture-of-Thoughts, pero no se publican evaluaciones que cuantifiquen estas capacidades.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Multilingüismo: limitado a inglés según la model card.
- Visión, audio o modo de pensamiento explícito: no disponibles; es un modelo exclusivamente de texto.

## Casos de uso

- Asistente conversacional de contexto largo: el modelo puede mantener diálogos multi-turno con hasta 32.768 tokens de entrada y recurrir a resúmenes de fragmentos anteriores, lo que resulta adecuado para sesiones de soporte o tutoría prolongadas en las que el historial completo no cabe en una ventana de atención densa típica de modelos de su tamaño.
- Resumen de documentos extensos: con 32K de contexto y una ruta de memoria comprimida, puede procesar informes, actas o artículos largos en una sola pasada en lugar de trocearlos, reduciendo la pérdida de coherencia entre fragmentos.
- Generación de contenido en inglés: redacción de borradores, correos, descripciones de producto y textos de marketing, aprovechando el ajuste por instrucciones y su bajo coste de despliegue en una sola GPU.
- Respuesta a preguntas sobre base documental: ingesta de manuales o políticas internas como contexto y generación de respuestas extractivas o sintéticas; su licencia Apache 2.0 permite integrarlo en productos comerciales sin obligaciones de atribución adicionales más allá de las de la licencia.
- Prototipado e investigación en arquitecturas de memoria: al ser un modelo pequeño con código de modelo personalizado y una arquitectura de memoria fragmentada documentada, sirve como banco de pruebas reproducible para estudiar atención de largo alcance en hardware Intel Gaudi 3 o Arc.
- Despliegue en entornos con recursos limitados: con 742,5 M de parámetros en FP16 (aproximadamente 1,5 GB de pesos), cabe en GPU de consumo y en aceleradores Intel, lo que permite ejecutar un asistente de texto local en estaciones de trabajo sin GPU de centro de datos.
- Clasificación y extracción de información en flujos de texto: reformulando la tarea como generación guiada por instrucciones (por ejemplo, "extrae las entidades y devuélvelas en JSON"), puede emplearse en pipelines de enriquecimiento de datos donde el coste por token es un factor crítico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB solo para los pesos en FP16, más memoria para el contexto KV. Con 32K de contexto y GQA (6 cabezas KV, dimensión 64), la caché KV es moderada, pero no se publican cifras oficiales de consumo a máxima longitud; como referencia orientativa, un despliegue en FP16 con contexto amplio requiere del orden de 4-8 GB de VRAM total, cifra no confirmada por el autor.
- GPU recomendadas: el autor documenta entrenamiento en 8 Intel Gaudi 3 y soporte para Intel Arc (`xpu`). Para inferencia en GPU NVIDIA no se especifican modelos concretos; por tamaño, cualquier GPU con al menos 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) debería poder alojar los pesos en FP16, y una A100 o H100 no es necesaria para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores, así como en Intel Arc con suficiente memoria. No hay confirmación oficial de latencias ni de consumo medido.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere revisar el código Python del repositorio antes de activarlo), con soporte declarado para PyTorch en `hpu` (Gaudi 3) y `xpu` (Intel Arc). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF, llama.cpp y Ollama no son viables sin conversión previa.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por petición en ninguna de las plataformas soportadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Bluebird 1.5 Instruct | 742,5 M | 32.768 | Apache 2.0 | Inglés | Arquitectura híbrida con memoria fragmentada; entrenado en Intel Gaudi 3; sin benchmarks publicados |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 | Apache 2.0 | Multilingüe (incluye español) | Transformer estándar con GQA; benchmarks publicados por el autor; amplio ecosistema de cuantizaciones GGUF |
| Llama 3.2 1B Instruct | 1,2 B | 128.000 | Llama 3.2 Community License | Multilingüe | Mayor contexto declarado y ecosistema maduro; licencia con restricciones para grandes despliegues comerciales |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | Apache 2.0 | Inglés y otros | Mayor número de parámetros y contexto menor; benchmarks publicados; cuantizaciones GGUF disponibles |

La comparación con Qwen2.5-0.5B-Instruct y SmolLM2-1.7B-Instruct es la más directa por tamaño y licencia permisiva. Bluebird 1.5 Instruct declara un contexto mayor que SmolLM2 y comparable al de Qwen2.5, pero carece de benchmarks publicados y de cuantizaciones listas para usar, lo que limita su adopción frente a alternativas con ecosistema consolidado. No se dispone de datos de rendimiento comparativo verificables.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente el idioma `en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- Sin benchmarks publicados: no existen resultados verificables de MMLU, HumanEval, GSM8K ni de evaluaciones de seguimiento de instrucciones, por lo que el rendimiento real es desconocido y no debe asumirse a partir de las etiquetas del repositorio.
- Contexto declarado frente a recall real: el propio autor advierte que la ventana de 32.768 tokens es una capacidad del modelo, no una garantía de precisión en la recuperación de información lejana. La memoria fragmentada comprime el contexto antiguo en resúmenes aprendidos, lo que puede perder detalles literales.
- Riesgo de alucinación: como todo modelo generativo de 742 M de parámetros, es propenso a inventar hechos, especialmente en dominios especializados y en tareas de razonamiento complejo; su tamaño reducido agrava este riesgo frente a modelos mayores.
- Código de modelo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; debe auditarse antes de usarlo en producción.
- Madurez y soporte: proyecto de un autor individual con 3 likes y 1.162 descargas en el momento de la consulta; no hay garantías de mantenimiento, parches de seguridad ni soporte a largo plazo.
- Ecosistema limitado: sin cuantizaciones GGUF, AWQ ni GPTQ publicadas, y sin integraciones documentadas con vLLM, TGI, llama.cpp u Ollama; el despliegue eficiente requiere trabajo adicional de conversión y validación.
- Licencia: Apache 2.0 permite uso comercial, pero la model card indica que está "sujeta a los avisos upstream aplicables"; conviene revisar las licencias de los datasets de post-entrenamiento (smoltalk2, Mixture-of-Thoughts, Nemotron-Post-Training-Dataset-v1) si se redistribuye el modelo.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni seguridad; los datos de instrucciones pueden introducir sesgos de estilo y de contenido no caracterizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tudor-iustin22/Bluebird-1.5-Instruct
- Modelo base: https://huggingface.co/tudor-iustin22/Bluebird-1.5-Base
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Documentación de instalación de Intel Gaudi: https://docs.habana.ai/en/latest/Installation_Guide/index.html
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Dataset Mixture-of-Thoughts: https://huggingface.co/datasets/open-r1/Mixture-of-Thoughts
- Dataset Nemotron-Post-Training-Dataset-v1: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v1
