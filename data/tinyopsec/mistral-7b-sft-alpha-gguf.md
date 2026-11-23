# tinyopsec/mistral-7b-sft-alpha-GGUF

## Resumen

`tinyopsec/mistral-7b-sft-alpha-GGUF` es un conjunto de cuantizaciones en formato GGUF del modelo `HuggingFaceH4/mistral-7b-sft-alpha`, un ajuste fino supervisado (SFT) de Mistral 7B v0.1 sobre el dataset sintético de diálogo UltraChat. El modelo original lo desarrolló el equipo Hugging Face H4; esta versión la publica el usuario comunitario `tinyopsec` con el objetivo de facilitar el despliegue en hardware modesto mediante llama.cpp, Ollama y LM Studio.

Arquitectonicamente es un transformer decoder-only de tipo Mistral: 32 capas, 32 cabezas de atención, Grouped-Query Attention (GQA), vocabulario de 32.000 tokens y una ventana de contexto de 4.096 tokens. Con 7.241.732.096 parámetros, se sitúa en la franja de los 7B, lo que permite ejecutarlo en GPUs de consumo cuando se emplean cuantizaciones de 4 o 5 bits.

Su relevancia actual es doble: por un lado, sirve como referencia histórica de los primeros modelos abiertos ajustados por instrucciones con calidad conversacional razonable; por otro, el empaquetado GGUF con once variantes de cuantización (de F16 a Q2_K) lo convierte en una opción práctica para prototipado local, entornos sin GPU dedicada y pruebas de pipelines de inferencia antes de escalar a modelos mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (32 capas, 32 cabezas, GQA) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Mistral 7B v0.1, un transformer decoder-only con atención de tipo sliding window en el original y Grouped-Query Attention para reducir el coste de memoria del KV cache. La versión `sft-alpha` de Hugging Face H4 se obtiene mediante ajuste fino supervisado sobre UltraChat, un dataset sintético de diálogos multi-turno generado con modelos de lenguaje. No se documenta en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases posteriores de RLHF o DPO.

La contribución de este repositorio es exclusivamente de cuantización: se ofrecen pesos GGUF en once niveles, desde F16 (~14 GB) hasta Q2_K (~1,8 GB), generados con las herramientas estándar de llama.cpp. No se introducen cambios arquitectónicos ni se documentan procesos de decodificación especulativa, atención lineal u otras innovaciones técnicas en esta versión.

## Capacidades

- Generación de texto en inglés con estilo conversacional, gracias al ajuste sobre UltraChat.
- Seguimiento de instrucciones detalladas en tareas de chat y asistencia.
- Conversaciones multi-turno dentro de la ventana de 4.096 tokens.
- Generación de texto creativo y respuestas descriptivas.
- Capacidad básica de razonamiento y respuesta a preguntas, heredada del modelo base.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes, multi-step reasoning estructurado ni modo thinking.
- No se documentan capacidades multimodales (visión, audio) ni multilingües más allá del inglés.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la variante Q4_K_M (~3,5 GB) se puede levantar un chatbot funcional en un portátil con GPU de 4-6 GB o incluso en CPU, usando llama.cpp u Ollama, para validar flujos de conversación antes de invertir en modelos mayores.
- Pruebas de integración en pipelines de inferencia: al estar en GGUF y ser compatible con llama-cpp-python, sirve como modelo de sustitución en tests de integración de aplicaciones que luego usarán modelos más grandes, manteniendo la misma API de llamada.
- Generación de texto asistida en entornos sin conectividad: la variante Q2_K (~1,8 GB) permite ejecutar el modelo en CPU con RAM suficiente, útil para demos offline o entornos air-gapped.
- Evaluación comparativa de cuantizaciones: el repositorio incluye once niveles de cuantización del mismo modelo, lo que facilita medir la degradación de calidad frente al ahorro de VRAM en un caso concreto de despliegue.
- Educación y experimentación: adecuado para cursos y talleres sobre cuantización, despliegue de LLMs y diferencias entre formatos (safetensors frente a GGUF), dado su tamaño manejable y licencia permisiva.
- Generación de respuestas en inglés para formularios o asistentes de soporte de baja criticidad: el modelo puede redactar respuestas conversacionales en inglés donde no se requiera razonamiento profundo ni exactitud factual verificada.
- Base para ajustes finos ligeros: al ser un modelo de 7B con licencia MIT, puede servir como punto de partida para LoRA o QLoRA en tareas específicas de dominio en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (datos de la model card): F16 ~16 GB, Q8_0 ~8 GB, Q6_K ~6 GB, Q5_K_M ~5 GB, Q4_K_M ~4 GB, Q3_K_M ~3 GB, Q2_K ~2 GB.
- GPU recomendadas: para F16 y Q8_0 se requiere una GPU de gama alta (A100, H100 o RTX 4090/3090); para Q6_K y Q5_K_M basta una GPU de gama media (RTX 3060 12 GB, RTX 4070); para Q4_K_M y superiores cabe en GPUs de consumo estándar con 4-6 GB.
- Cabe en GPU de consumo: sí, en la mayoría de variantes. Q4_K_M y Q3_K_M son adecuadas para portátiles con GPU dedicada; Q2_K puede ejecutarse en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp (binario `main`), llama-cpp-python, LM Studio y Ollama (etiquetas `tinyopsec/mistral-7b-sft-alpha-gguf:q5_k_m`, entre otras).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/mistral-7b-sft-alpha-GGUF | 7,24 B | 4.096 | MIT | GGUF (11 cuantizaciones) | Cuantización comunitaria del SFT de H4 |
| HuggingFaceH4/mistral-7b-sft-alpha | 7,24 B | 4.096 | MIT | Safetensors | Modelo original sin cuantizar |
| mistralai/Mistral-7B-v0.1 | 7,24 B | 4.096 (sliding window) | Apache 2.0 | Safetensors | Modelo base sin ajuste por instrucciones |
| mistralai/Mistral-7B-Instruct-v0.1 | 7,24 B | 4.096 | Apache 2.0 | Safetensors | Alternativa oficial ajustada por instrucciones |

La comparación con modelos de otros tamaños o generaciones no está disponible en la información proporcionada, y no se dispone de datos de benchmarks para establecer diferencias de rendimiento entre estas variantes.

## Limitaciones y advertencias

- El modelo está entrenado y documentado únicamente para inglés; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas sin truncado.
- Riesgo de alucinación inherente a los modelos de 7B de esta generación; no debe usarse en dominios de alta criticidad (médico, legal, financiero) sin verificación humana.
- No se documentan evaluaciones de sesgo; al derivar de un dataset sintético (UltraChat) y de Mistral 7B v0.1, puede heredar sesgos de sus datos de preentrenamiento.
- Las cuantizaciones de 3 y 2 bits (Q3_K_S, Q2_K) degradan la calidad de forma notable; la propia model card recomienda Q5_K_M para la mayoría de casos.
- Licencia MIT permisiva para uso comercial, pero al ser una cuantización comunitaria no oficial, no hay garantía de soporte ni de mantenimiento por parte del autor original.
- El repositorio ocupa 60 GB por incluir todas las variantes; conviene descargar solo el archivo GGUF necesario.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento estructurado, lo que limita su uso en pipelines agénticos modernos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/mistral-7b-sft-alpha-GGUF
- Modelo base (Hugging Face H4): https://huggingface.co/HuggingFaceH4/mistral-7b-sft-alpha
- Modelo original de Mistral: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
