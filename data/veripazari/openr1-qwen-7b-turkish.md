# veripazari/OpenR1-Qwen-7B-Turkish

## Resumen
OpenR1-Qwen-7B-Turkish es un ajuste fino (SFT) del modelo Qwen2.5-7B-Instruct orientado a razonamiento explícito ("thinking mode") en turco. Lo desarrolla originalmente WiroAI y esta ficha corresponde a la réplica archivada por VeriPazari, que ha traducido la documentación al turco para la comunidad. El objetivo declarado es corregir una limitación conocida de los modelos destilados de DeepSeek-R1: la tendencia a razonar en chino o inglés aunque se les pregunte en otro idioma.

El modelo se entrena sobre el dataset WiroAI/dolphin-r1-turkish durante 2 épocas, con una longitud máxima de secuencia de 4096 tokens, learning rate 1e-5 y un schedule coseno con un 10 % de warmup, empleando un clúster de 8 GPU A6000 ADA durante 3 días. Conserva la arquitectura transformer decoder-only de Qwen2.5 y sus 7.615.616.512 parámetros totales.

Es relevante para quienes necesitan un modelo de razonamiento de tamaño medio (7B) que opere nativamente en turco, un idioma de recursos relativamente bajos, con licencia Apache 2.0 y pesos en safetensors compatibles con transformers y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (base Qwen2.5-7B-Instruct: 32.768 tokens; el entrenamiento usó secuencias de 4096) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repositorio no documenta GGUF ni otras variantes) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención por grupos (GQA) y RoPE, y se ajusta mediante SFT con la librería TRL. El entrenamiento se realizó sobre el dataset WiroAI/dolphin-r1-turkish, derivado de la familia Dolphin-R1, con 2 épocas, learning rate 1e-5, longitud máxima de secuencia de 4096 tokens y schedule coseno con 10 % de warmup sobre 8 GPU A6000 ADA (3 días de cómputo).

La innovación principal no es arquitectónica sino de datos y formato: se entrena al modelo para producir trazas de razonamiento en turco delimitadas por tokens especiales como `<|begin_of_thought|>`, evitando la deriva hacia chino o inglés típica de los destilados de DeepSeek-R1. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades
- Generación de texto conversacional en turco con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento paso a paso en modo "thinking", con trazas explícitas delimitadas por tokens especiales.
- Resolución de problemas matemáticos y algebraicos mostrando el desarrollo intermedio.
- Razonamiento de múltiples pasos orientado a tareas tipo OpenR1 (matemáticas, lógica).
- Soporte multilingüe limitado: el único idioma declarado es el turco; no se garantiza calidad en otros idiomas.
- Compatibilidad con text-generation-inference y endpoints compatibles según los tags del repositorio.
- No se documentan tool calling, function calling, capacidades de agente, visión ni audio en la información disponible.

## Casos de uso
- Tutoría matemática en turco: el modelo puede resolver ecuaciones y mostrar el desarrollo paso a paso, como en el ejemplo de la model card con `4x+5 = 6x+7`, lo que lo hace útil en plataformas educativas turcas.
- Asistente conversacional en turco: al conservar la plantilla de chat de Qwen2.5-Instruct, puede gestionar diálogos multi-turno en aplicaciones de atención al usuario en turco.
- Generación de explicaciones razonadas para documentación técnica: útil para producir borradores con justificación de pasos en turco.
- Investigación sobre razonamiento en idiomas de bajos recursos: sirve como referencia para estudiar la transferencia del modo thinking de R1 a turco.
- Evaluación comparativa de destilados: base para experimentos que comparen razonamiento en turco frente a DeepSeek-Distill-Qwen-7B y OpenThinker-7B.
- Prototipado de pipelines de razonamiento con transformers y TGI: al publicarse en safetensors y con tags de TGI, se puede desplegar en infraestructura estándar de inferencia.
- Filtrado y anotación de datos en turco: puede generar cadenas de razonamiento que sirvan como datos sintéticos para otros ajustes finos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los autores no comparten las métricas por defecto de lighteval frente a DeepSeek-Distill-Qwen-7B y OpenThinker-7B porque los datasets de evaluación son principalmente de MATH y podrían inducir conclusiones erróneas.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15-16 GB para los 7.615.616.512 parámetros, más overhead de KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 4-5 GB (estimaciones teóricas, no documentadas por el autor).
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o A6000; el entrenamiento se realizó en 8x A6000 ADA.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16 con contexto moderado, y en RTX 3090/4080 con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF, aunque el repositorio no los publica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenR1-Qwen-7B-Turkish | 7,6 B | no disponible (entrenado a 4096) | turco | Apache 2.0 | Hugging Face (veripazari y WiroAI) |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 tokens | multilingüe | Apache 2.0 | Hugging Face |
| DeepSeek-Distill-Qwen-7B | 7,6 B | 32.768 tokens (heredado de Qwen2.5) | multilingüe con sesgo a inglés/chino | MIT/Apache según variante | Hugging Face |
| OpenThinker-7B | 7,6 B | no disponible | inglés | Apache 2.0 | Hugging Face |

Los datos de rendimiento comparativo no están disponibles; la model card evita publicar métricas de lighteval por las razones expuestas.

## Limitaciones y advertencias
- Sesgos: al estar ajustado solo con datos en turco, puede presentar sesgos culturales y lingüísticos propios del corpus; no se documenta un análisis de sesgo.
- Alucinación: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos, especialmente en matemáticas complejas fuera de la distribución del dataset.
- Idioma: solo se declara soporte de turco; el rendimiento en castellano u otros idiomas no está garantizado y probablemente degrade respecto al modelo base.
- Contexto: aunque el modelo base soporta 32.768 tokens, el ajuste se hizo con secuencias de 4096, por lo que el comportamiento más allá de esa longitud no está validado.
- Licencia: Apache 2.0 permite uso comercial, pero la model card enlaza a los términos de servicio de Wiro AI, que conviene revisar antes de un despliegue comercial.
- Procedencia: esta ficha corresponde a una réplica archivada por VeriPazari del modelo original de WiroAI; para producción conviene verificar que los pesos coinciden con el repositorio original.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación externa.

## Enlaces
- Hugging Face (réplica): https://huggingface.co/veripazari/OpenR1-Qwen-7B-Turkish
- Hugging Face (original): https://huggingface.co/WiroAI/OpenR1-Qwen-7B-Turkish
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset: https://huggingface.co/datasets/WiroAI/dolphin-r1-turkish
- Repositorio Open-R1: https://github.com/huggingface/open-r1/
- VeriPazari: https://veripazari.com.tr
- Wiro AI: https://www.wiro.ai/
- Términos de servicio de Wiro AI: https://wiro.ai/agreement/terms-of-service
