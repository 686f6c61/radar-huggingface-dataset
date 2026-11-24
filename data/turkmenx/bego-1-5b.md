# turkmenx/Bego-1.5B

## Resumen

Bego-1.5B es un ajuste fino mediante QLoRA del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario turkmenx. Se trata de un asistente de recepción para un hotel ficticio llamado Begonvil Otel, entrenado para responder en turco a preguntas de huéspedes. El modelo combina tres modos de funcionamiento: conversación directa, recuperación aumentada (RAG) sobre una guía del hotel y un modo agente con llamadas a herramientas.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5, con 1.543.714.304 parámetros totales y licencia Apache-2.0. El ajuste se realizó con QLoRA (r=16, alpha=32, todas las capas lineales, 3 épocas, learning rate 2e-4) sobre 881 conversaciones sintéticas generadas mayoritariamente con Gemini. El resultado es un modelo especializado en un dominio muy concreto, no un modelo de propósito general.

Su relevancia es principalmente didáctica: demuestra un flujo completo de ajuste fino de bajo coste (entrenable en una Colab T4 en unos 30 minutos), conversión a GGUF para inferencia en CPU y evaluación con un juez automático. No está pensado para uso en producción fuera del contexto del hotel ficticio para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste QLoRA |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct; no confirmada en la informacion) |
| Tipos de cuantizacion | GGUF disponible (variantes no detalladas); entrenamiento en 4-bit QLoRA |
| Idiomas soportados | Turco (tr); capacidades multilingues heredadas del modelo base no documentadas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo completo), GGUF (repo separado), adaptador LoRA (repo separado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen2.5-1.5B-Instruct. El entrenamiento se realizó con QLoRA: cuantización 4-bit del modelo base, rango r=16, alpha=32, aplicación a todas las capas lineales, 3 épocas y learning rate 2e-4. El conjunto de datos son 881 conversaciones sintéticas (identidad, RAG y agente), en su mayoría generadas con Gemini, con cadenas de herramientas construidas a partir de plantillas tabulares.

El autor documenta una innovación práctica relevante: al fusionar el adaptador LoRA sobre el modelo base cuantizado a 4-bit se producía una degradación de calidad; al restaurar el modelo base a 16-bit antes de la fusión, el problema se resolvió. También amplió los ejemplos de cadenas de herramientas de 49 a 216 para corregir la tendencia del modelo a inventar importes antes de recibir el resultado de la herramienta. La herramienta personalizada es `erken_rezervasyon_fiyati` (15 % de descuento por reserva con 60 días de antelación).

## Capacidades

- Generación de texto conversacional en turco con un estilo e identidad concretos (personaje "Bego").
- Recuperación aumentada (RAG) sobre una guía del hotel mediante Chroma y embeddings multilingües.
- Llamada a herramientas (tool calling) con salida JSON estructurada: consulta de habitaciones, facturación y precio de reserva anticipada.
- Razonamiento multi-paso encadenado: precio de habitación, multiplicación por noches y aplicación del descuento.
- Modo agente con secuencias de herramientas encadenadas.
- Respuesta con rechazo explícito cuando la información no está en la guía ("Bu bilgi rehberde yok").
- Capacidades multilingües heredadas del modelo base: no documentadas por el autor.

## Casos de uso

- Recepción de hotel automatizada: el modelo gestiona conversaciones de huéspedes sobre horarios, normas y servicios, usando el modo RAG para responder a partir de la guía del establecimiento.
- Cálculo de tarifas con descuentos: mediante la herramienta `erken_rezervasyon_fiyati`, el modelo aplica el 15 % de descuento por reserva con 60 días de antelación sobre el precio base y el número de noches.
- Consulta de disponibilidad y facturación: el modo agente invoca herramientas de habitaciones y cuenta para responder con datos estructurados en lugar de inventarlos.
- Asistente de reservas multi-turno: mantiene el contexto de la conversación para resolver preguntas encadenadas (tipo de habitación, noches y precio final).
- Demostración educativa de ajuste fino: sirve como ejemplo reproducible de QLoRA sobre un modelo de 1.5B en hardware gratuito, con evaluación por juez automático.
- Despliegue ligero en CPU: la versión GGUF permite ejecutar el asistente en entornos sin GPU, adecuado para prototipos y demostraciones.
- Base para ajustes de dominio en otros idiomas: la receta (QLoRA + RAG + herramientas) es reutilizable para asistentes verticales similares.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test de 15 preguntas, evaluadas por un juez automático (Gemini) con puntuación 1 / 0.5 / 0:

| Metrica | Base (Qwen2.5-1.5B-Instruct) | Bego-1.5B |
|---|---|---|
| kimlik_ad (identidad, nombre) | 0.00 | 0.80 |
| kimlik_isaret (identidad, marca) | 0.00 | 1.00 |
| ajan_json (agente, JSON válido) | 0.67 | 1.00 |
| ajan_arac (agente, uso de herramienta) | 0.20 | 1.00 |
| rag_hakem (RAG, juez) | 0.37 | 0.73 |
| rag_isaret (RAG, marca) | 0.00 | 1.00 |

Puntuación media del conjunto de test: 0.67. La evolución por épocas fue 0.33 → 0.40 → 0.67. El autor indica que la recuperación RAG acertó el fragmento correcto en 9 de 9 casos, por lo que los errores restantes provienen del modelo, no del sistema de recuperación. El conjunto de test es pequeño (15 preguntas) y el juez es un modelo, por lo que las cifras son orientativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 1.5B, la versión en 16-bit requiere del orden de 3-4 GB y las versiones GGUF cuantizadas menos, aunque el autor no publica cifras.
- GPU recomendadas: el autor confirma que el entrenamiento QLoRA cabe en una Colab T4 (unos 30 minutos); no detalla GPU recomendadas para inferencia.
- GPU de consumo: previsiblemente cabe en GPUs de consumo con 6-8 GB o más, aunque no está documentado por el autor.
- Opciones de despliegue: transformers (librería indicada en el repo), GGUF para CPU (repo separado), adaptador LoRA (repo separado). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; el autor solo indica que la versión GGUF "funciona a velocidad de conversación en CPU".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bego-1.5B | 1.54B | no disponible | Recepcion de hotel (turco) | Apache-2.0 | HF (safetensors, GGUF, LoRA) |
| Qwen2.5-1.5B-Instruct | 1.54B | no disponible | Proposito general | Apache-2.0 | HF |
| Modelos de 1-2B ajustados para dominio | variable | variable | variable | variable | variable |

La comparación más directa es con su modelo base, Qwen2.5-1.5B-Instruct, que obtiene peores resultados en las métricas específicas del dominio (identidad, agente y RAG) pero conserva capacidades generales que Bego no ha sido entrenado para mantener. No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para Bego-1.5B en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño (1.5B): confunde cifras y condiciones de la guía (por ejemplo, plazos de cancelación de 7 días frente a 3 días) y omite información relevante (por ejemplo, la hora de entrada anticipada).
- Alucinación: ante preguntas sobre el hotel sin contexto RAG, inventa respuestas.
- Mezcla ocasional de caracteres chinos en las respuestas en turco.
- El conjunto de test es de solo 15 preguntas y el juez es un modelo automático, por lo que las métricas son una indicación gruesa, no una evaluación rigurosa.
- Entrenado exclusivamente con datos de un hotel ficticio y con fines educativos; no es adecuado para producción real sin un ajuste y una validación adicionales.
- Idiomas: solo se documenta el turco; el comportamiento en castellano u otros idiomas no está evaluado.
- Licencia Apache-2.0: permite uso comercial, pero el contenido del modelo está limitado al dominio ficticio para el que fue entrenado.
- La fusión del adaptador LoRA requiere restaurar el modelo base a 16-bit para evitar pérdida de calidad, según documenta el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turkmenx/Bego-1.5B
- Adaptador LoRA: https://huggingface.co/turkmenx/Bego-1.5B-LoRA
- Versión GGUF: https://huggingface.co/turkmenx/Bego-1.5B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/turkmenx/bego-1.5b-veri
- Space de demostración (vitrina del instructor): https://huggingface.co/turkmenx/Bego-1.5B-GGUF/tree/main/space
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
