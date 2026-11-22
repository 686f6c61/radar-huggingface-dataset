# UX4567/Kartik-Kundli-AI-3B-v2.0

## Resumen

Kartik-Kundli-AI-3B-v2.0 es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct orientado a astrología védica (jyotish), kundli, rashi, nakshatra y dashas. Lo publica el usuario UX4567 (Kartik) en Hugging Face bajo licencia MIT. El modelo resuelve la demanda de asistentes conversacionales especializados en astrología védica en hindi, inglés e hinglish, con un tamaño de 3B parámetros que permite ejecución local en portátil o incluso en dispositivos móviles mediante cuantización GGUF.

Arquitectura transformer decoder-only heredada de Qwen2.5-3B-Instruct, con 3.085.938.688 parámetros totales según los pesos safetensors. El repositorio incluye tanto pesos en safetensors como versiones GGUF para llama.cpp, lo que facilita el despliegue offline en aplicaciones de astrología sin conexión. La model card declara soporte para hindi, inglés y hinglish.

La relevancia actual radica en su nicho: es un modelo pequeño, libre y ejecutable localmente que cubre un dominio cultural específico (astrología védica) con vocabulario técnico en hindi. No obstante, la documentación técnica publicada es escasa: no hay detalles sobre el dataset de ajuste fino, el número de tokens de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero la model card no lo confirma para este ajuste) |
| Tipos de cuantizacion | GGUF disponible (niveles concretos no especificados en la model card) |
| Idiomas soportados | Hindi, inglés y hinglish (según la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3B parámetros con atención causal estándar. La model card no documenta la arquitectura interna más allá de indicar que es un fine-tuning del modelo base de Qwen, y las etiquetas del repositorio mezclan referencias a `qwen2` y `qwen3`, lo que introduce ambigüedad sobre la generación exacta del backbone (el campo `base_model` confirma Qwen2.5-3B-Instruct).

No se publica información sobre el corpus de ajuste fino: ni número de tokens, ni composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado. Tampoco se detallan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). La versión v2.0 se presenta como "más precisa" que la anterior, pero sin métricas que respalden la afirmación.

## Capacidades

- Generación de texto conversacional en hindi, inglés y hinglish.
- Respuesta a preguntas sobre astrología védica: kundli, rashi, nakshatra, dashas, doshas (por ejemplo, Mangal Dosh) y tránsitos planetarios como Sade Sati.
- Explicación de conceptos astrológicos en hindi sencillo.
- Predicciones diarias de horóscopo por signo (rashi).
- Ejecución offline mediante los pesos GGUF incluidos en el repositorio.
- Soporte de conversación multi-turno heredado del modelo base (no documentado explícitamente para el ajuste).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de astrología védica para consultas individuales: el modelo responde preguntas sobre kundli, nakshatra y dashas en hindi o hinglish, adecuado para usuarios que buscan explicaciones en lenguaje sencillo sin depender de servicios en la nube.
- Aplicación móvil offline de horóscopo diario: gracias a los pesos GGUF y al tamaño de 3B parámetros, puede integrarse en una app Android o iOS con inferencia local mediante llama.cpp, sin enviar datos del usuario a servidores externos.
- Chatbot de atención en portales de astrología: gestiona conversaciones multi-turno sobre rashi y predicciones, con coste de inferencia bajo al ejecutarse en una sola GPU consumer o incluso en CPU.
- Generación de contenido editorial astrológico: redacción de textos diarios de horóscopo por signo para blogs o newsletters en hindi, con revisión humana posterior.
- Herramienta educativa sobre jyotish: explicación de términos sánscritos y conceptos védicos a estudiantes que se inician en la disciplina, en formato de preguntas y respuestas.
- Prototipado rápido de productos de nicho cultural: sirve como base para experimentar con asistentes especializados en dominios culturales sin requerir infraestructura de gran escala.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, permite procesar datos personales de nacimiento (fecha, hora, lugar) sin salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y caché KV (en torno a 7-8 GB en total).
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4 GB.
- VRAM estimada en cuantización de 4 bits (Q4_K_M en GGUF): aproximadamente 2-2,5 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia; también funciona en GPUs con 8 GB en FP16 ajustado.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores con cuantización; en CPU también es viable con GGUF Q4.
- Opciones de despliegue: transformers (según el ejemplo de la model card), llama.cpp con los archivos GGUF, Ollama (previa conversión o importación del GGUF), y TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kartik-Kundli-AI-3B-v2.0 | 3,09B | No disponible | Astrología védica (hi/en) | MIT | Hugging Face, safetensors y GGUF |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 tokens | Generalista multilingüe | Apache 2.0 (según el modelo base) | Hugging Face |
| Llama 3.2 3B Instruct | 3,2B | 128.000 tokens | Generalista multilingüe | Llama 3.2 Community License | Hugging Face, Ollama |
| Gemma 2 2B Instruct | 2,6B | 8.192 tokens | Generalista multilingüe | Gemma Terms of Use | Hugging Face, Ollama |

La comparativa con modelos especializados en astrología védica no está disponible: no se han identificado alternativas públicas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El modelo genera predicciones astrológicas que no tienen base científica; debe presentarse como contenido educativo o de entretenimiento, nunca como consejo médico, legal o financiero (la propia model card lo excluye explícitamente).
- Riesgo elevado de alucinación en detalles astrológicos concretos (posiciones planetarias, fechas de dashas, cálculos de kundli), ya que un modelo de lenguaje no calcula efemérides reales.
- La model card no documenta el dataset de entrenamiento, por lo que se desconoce la calidad y cobertura del ajuste fino, así como posibles sesgos culturales o religiosos.
- Idiomas limitados a hindi, inglés y hinglish; el rendimiento en castellano u otras lenguas no está evaluado y probablemente sea deficiente.
- Longitud de contexto no confirmada para este ajuste; se desconoce si conserva los 32.768 tokens del modelo base.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct tiene su propia licencia (Apache 2.0 según la información habitual del modelo base), que conviene verificar antes de un despliegue comercial.
- El repositorio mezcla etiquetas de `qwen2` y `qwen3`, lo que genera ambigüedad sobre la procedencia exacta del backbone.
- El tamaño del repositorio (45,2 GB) es desproporcionado para un modelo de 3B, probablemente por incluir múltiples cuantizaciones GGUF; conviene revisar los archivos antes de descargar.
- No hay benchmarks publicados que permitan validar la afirmación de "predicciones más precisas" de la v2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UX4567/Kartik-Kundli-AI-3B-v2.0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Enlace de donación indicado en la model card: https://razorpay.me/@guruduttsharma6742
- Demo: no disponible ("Coming Soon" según la model card)
