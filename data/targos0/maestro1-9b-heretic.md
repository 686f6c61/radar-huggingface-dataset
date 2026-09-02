# Targos0/Maestro1-9B-Heretic

## Resumen

Maestro1-9B-Heretic es una variante del modelo vision-language Maestro1-9B, desarrollada por Targos0 a partir del trabajo de vectionlabs y cuantizada por haffner. Se trata de un modelo denso de 8.190 millones de parámetros (etiquetado como 9B) perteneciente a la familia Qwen3.5, especializado en razonamiento matemático multi-paso, síntesis de código de nivel competitivo y razonamiento visual sobre imágenes y vídeo, con una ventana de contexto de hasta 1 millón de tokens.

La versión "Heretic" se presenta como un ajuste orientado a reducir los rechazos del modelo original (refusals), con una tasa de rechazo de 3 sobre 100 y una divergencia KL de 0,0741 respecto al modelo base. El repositorio incluye tanto pesos en safetensors como cuantizaciones GGUF, además de proyectores multimodales en formato GGUF, lo que permite su despliegue en una amplia gama de hardware, incluido el consumo.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece capacidades multimodales y de razonamiento avanzado en un tamaño contenido (9B), y por otro, su variante "heretic" busca eliminar las restricciones de alineación, lo que lo hace interesante para investigación en seguridad de IA y para casos de uso donde se requiere una generación sin filtros. La licencia Apache-2.0 facilita su uso comercial y su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal vision-language |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1.000.000 tokens (segun documentacion del modelo base) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_1, Q5_K_M, Q5_K_S, Q5_0, Q4_1, IQ4_NL, IQ4_XS, IQ3_M, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, Q2_K, TQ2_0, TQ1_0, Q1_0 |
| Idiomas soportados | Ingles (en), italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (incluye mmproj para vision) |

## Arquitectura y entrenamiento

El modelo base Maestro1-9B es un transformer denso de la familia Qwen3.5, entrenado como modelo multimodal de texto e imagen. Segun la documentacion disponible, fue fine-tuneado a partir de una base DavidAU Qwen3.6 27B Fable Fusion como experimento de investigacion en seguridad y alineacion de IA. El modelo soporta razonamiento multi-paso, generacion de codigo, matematicas y comprension visual, todo dentro de una unica ventana de contexto de hasta 1M tokens.

La variante "Heretic" aplica una modificacion post-entrenamiento orientada a reducir los rechazos del modelo. Los parametros reportados (direction_index = 18.77, pesos maximos y minimos en capas de atencion y MLP) sugieren una intervencion sobre los pesos del modelo para alterar su comportamiento de rechazo, manteniendo una divergencia KL baja (0,0741) respecto al original. No se especifica el metodo exacto (si fue DPO, fine-tuning adicional u otra tecnica), ni los datos de entrenamiento utilizados para esta variante.

## Capacidades

- Generacion de texto y razonamiento multi-paso, incluyendo demostraciones matematicas y problemas complejos.
- Sintesis de codigo de nivel competitivo (programacion en entornos de competicion).
- Razonamiento visual sobre imagenes y video, gracias al proyector multimodal incluido.
- Comprension de contexto largo: ventana de hasta 1M tokens, util para documentos extensos o conversaciones prolongadas.
- Soporte de tool calling y function calling (heredado del modelo base Qwen3.5, aunque no se detalla en la documentacion de esta variante).
- Capacidades multilingues limitadas a ingles e italiano segun la ficha.
- Modo "thinking" o razonamiento extendido, indicado por las etiquetas del modelo (reasoning, thinking).
- Reduccion de rechazos: tasa de refusal de 3/100, frente a un comportamiento mas restrictivo en el modelo base.

## Casos de uso

- Investigacion en seguridad y alineacion de IA: el modelo permite estudiar el comportamiento de un sistema con rechazos minimizados, comparando su salida con la del modelo base para analizar divergencias y riesgos.
- Generacion de codigo en entornos de competicion: su capacidad para sintetizar soluciones de nivel competitivo lo hace util como asistente en plataformas de entrenamiento como Codeforces o LeetCode, donde se requiere razonamiento algoritmico avanzado.
- Analisis de documentos largos con imagenes: gracias a su contexto de 1M tokens y su componente visual, puede procesar manuales tecnicos extensos, informes con figuras o documentacion cientifica completa en una sola pasada.
- Asistente de razonamiento matematico: para estudiantes o investigadores que necesitan ayuda con demostraciones formales o problemas de matematicas avanzadas, el modelo puede generar pasos intermedios y explicaciones detalladas.
- Chat conversacional sin restricciones: en entornos controlados de investigacion, la variante "heretic" permite explorar respuestas que el modelo base rechazaria, util para estudiar sesgos y limites de la alineacion.
- Despliegue en edge o GPU de consumo: gracias a las cuantizaciones GGUF (desde Q1_0 hasta Q8_0), el modelo puede ejecutarse en hardware modesto, por ejemplo un portatil con 8-16 GB de VRAM, para prototipado rapido o demos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del modelo base menciona capacidades en matematicas, codigo y razonamiento visual, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) para esta variante ni para el modelo original en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 16,4 GB (8,19B parametros x 2 bytes). Con cuantizacion Q8_0 se reduce a unos 8,2 GB, y con Q4_K_M a unos 4,5 GB, aunque hay que anadir el proyector multimodal (752 MB en Q8_0 o 1,16 GB en BF16).
- GPU recomendadas: para la version completa en BF16 se necesita una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB). Con cuantizaciones Q4 o Q5, cabe en GPUs de consumo como RTX 3060 12GB, RTX 4070 o similar.
- Si cabe en consumer GPU: si, con cuantizaciones GGUF de 4-6 bits es viable en GPUs de 8-12 GB, aunque la ventana de contexto larga (1M tokens) requerira mucha mas memoria y probablemente solo sea usable con contextos reducidos en hardware de consumo.
- Opciones de despliegue: llama.cpp (soporta GGUF y mmproj), Ollama (si se importa el GGUF), vLLM (para safetensors con transformers), TGI (Text Generation Inference) y FriendliAI (ofrece endpoint gestionado).
- Latencia y throughput: no disponible. Dependera del hardware, la cuantizacion y la longitud de contexto. En una RTX 4090 con Q4_K_M se puede esperar un throughput de 30-60 tokens/s para generacion, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Maestro1-9B-Heretic | 8,19B | 1M | Si (vision) | Apache-2.0 | Variante des-alineada, sin benchmarks publicados |
| vectionlabs/Maestro1-9B | 8,19B | 1M | Si (vision) | Apache-2.0 | Modelo base, con alineacion estandar |
| Qwen2.5-VL-7B | 7,6B | 128K | Si (vision) | Apache-2.0 | Alternativa multimodal de referencia, con benchmarks publicos |
| Llama-3.2-11B-Vision | 11B | 128K | Si (vision) | Llama 3.2 Community | Alternativa multimodal con licencia permisiva, benchmarks disponibles |

La comparativa se basa en modelos multimodales de tamano similar. Maestro1-9B destaca por su contexto de 1M tokens, muy superior a las alternativas, pero carece de datos de rendimiento publicados, lo que dificulta una evaluacion objetiva frente a Qwen2.5-VL o Llama-3.2-Vision.

## Limitaciones y advertencias

- La variante "Heretic" reduce los rechazos de forma deliberada, lo que puede aumentar la generacion de contenido inapropiado, peligroso o sesgado. No es adecuada para uso en produccion sin supervision humana y filtros adicionales.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estandar (MMLU, HumanEval, etc.) es desconocido.
- Los idiomas soportados se limitan a ingles e italiano; el rendimiento en otros idiomas no esta garantizado.
- La ventana de contexto de 1M tokens es teorica; en la practica, el uso de contextos muy largos requiere hardware de alta gama y puede degradar la calidad de la generacion.
- El modelo base tiene una version mas reciente (vectionlabs/Maestro-2-9B-Preview), lo que sugiere que esta variante puede quedar desactualizada rapidamente.
- La licencia Apache-2.0 permite uso comercial, pero el origen del fine-tuning "heretic" no esta documentado en detalle, por lo que se recomienda verificar el cumplimiento de las condiciones del modelo base.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o codigo incorrecto, especialmente en tareas de razonamiento complejo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Targos0/Maestro1-9B-Heretic
- Repositorio del cuantizador (haffner): https://huggingface.co/haffner/Maestro1-9B-Heretic
- Modelo base: https://huggingface.co/vectionlabs/Maestro1-9B
- Version mas reciente del modelo base: https://huggingface.co/vectionlabs/Maestro-2-9B-Preview
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/haffner/Maestro1-9B-Heretic
- Espejo en Gitee con documentacion del modelo base: https://gitee.com/hf-models/Maestro1-9B
- Vista del modelo en hfviewer: https://hfviewer.com/vectionlabs/Maestro1-9B
