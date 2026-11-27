# SpruAgent/gigaam-multilingual-v2-gguf

## Resumen

GigaAM Multilingual v2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por ai-sage, distribuido en este repositorio como una conversión no oficial al formato GGUF realizada por el usuario SpruAgent. El modelo emplea una arquitectura RNN-T con un codificador Zapformer y condicionamiento por idioma, con una cabeza de salida "e2e" que produce transcripciones ya formateadas con puntuación y uso de mayúsculas. Cuenta con 776 millones de parámetros y está diseñado para transcripción multilingüe en 21 idiomas, con especial énfasis en ruso y lenguas de su entorno geográfico.

La relevancia de esta ficha radica en que la conversión GGUF permite ejecutar el modelo fuera del ecosistema PyTorch, concretamente en transcribe.cpp y en la aplicación Handy, lo que facilita el despliegue local en escritorio sin dependencias de Python. El archivo publicado está cuantizado a Q8_0 (827 MB) y requiere una compilación de transcribe.cpp que incluya la arquitectura `gigaam_zap`, aún no integrada en el repositorio upstream.

Es importante señalar que este repositorio no es una versión oficial: los pesos originales son del modelo de ai-sage bajo licencia MIT, y la conversión se limita a inferencia de contexto completo (offline), sin soporte de streaming.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNN-T con codificador Zapformer y condicionamiento por idioma (`gigaam_zap`) |
| Parámetros totales | 776.083.099 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 (único archivo publicado) |
| Idiomas soportados | 21: ru, en, kk, ky, uz, be, fr, es, ba, ka, hy, ro, tk, az, tg, de, it, nl, pl, pt, tt |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `gigaam-multilingual-v2-Q8_0.gguf`, 827 MB) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR de tipo RNN-T (transducer) que combina un codificador Zapformer con condicionamiento por idioma, lo que permite seleccionar el idioma de transcripción mediante un código explícito o dejar que el modelo use su ranura automática (`auto`). La cabeza de salida es de tipo "e2e" formateada, es decir, genera directamente texto con puntuación y mayúsculas en lugar de una secuencia de tokens sin formato.

Los detalles sobre el número de horas de audio de entrenamiento, la composición del dataset, el uso de técnicas de aumento de datos o de ajuste fino específico no están disponibles en la información proporcionada. La conversión a GGUF mantiene los pesos originales bajo licencia MIT y aplica cuantización lineal Q8_0; según el autor de la conversión, las transcripciones coinciden con la referencia en PyTorch en muestras de ruso, inglés, alemán, francés y español.

## Capacidades

- Transcripción automática de voz a texto en 21 idiomas, con detección o selección manual del idioma.
- Salida formateada de extremo a extremo con puntuación y uso de mayúsculas gracias a la cabeza "e2e".
- Selección de idioma mediante código explícito o mediante la ranura `auto` del propio modelo.
- Inferencia de contexto completo (offline), adecuada para archivos de audio ya grabados.
- Compatibilidad con transcribe.cpp y con la aplicación Handy (requiere compilación con la arquitectura `gigaam_zap`).
- No se documenta soporte de tool calling, agentes, visión, audio de entrada más allá del propio ASR, ni modo de razonamiento.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa archivos de audio completos en modo offline y devuelve texto con puntuación y mayúsculas, lo que reduce el postprocesado manual en actas y notas.
- Subtitulado de vídeo en múltiples idiomas: al cubrir 21 lenguas, incluido ruso, inglés, español, francés y alemán, puede generar pistas de subtítulos para contenido multilingüe desde una única herramienta local.
- Dictado por voz en aplicaciones de escritorio: integrado en Handy mediante transcribe.cpp, permite dictar texto en el equipo sin enviar audio a servicios en la nube, con el archivo Q8_0 de 827 MB.
- Investigación en ASR multilingüe: sirve como referencia ligera (776 M de parámetros) para comparar el rendimiento de arquitecturas RNN-T con codificador Zapformer frente a modelos basados en transformer puro.
- Procesamiento por lotes de archivos de audio en servidores sin GPU dedicada: el tamaño reducido del modelo y la cuantización Q8_0 permiten ejecutarlo en CPU con transcribe.cpp para volúmenes moderados de transcripción.
- Transcripción de contenido en lenguas de Asia Central y el Cáucaso (kazajo, kirguís, uzbeko, tártaro, azerí, georgiano, armenio): pocos modelos ASR abiertos cubren este conjunto de idiomas, lo que lo hace útil para digitalización de archivos y medios regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa 827 MB, por lo que la inferencia requiere aproximadamente 1 GB de memoria, ya sea en GPU o en RAM del sistema.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna gracias a su tamaño inferior a 1 GB en Q8_0.
- Opciones de despliegue: transcribe.cpp y Handy con una compilación que incluya la arquitectura `gigaam_zap`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; solo se indica que la inferencia es de contexto completo (offline) y que el streaming no está implementado.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GigaAM Multilingual v2 (esta conversión GGUF) | 776 M | 21 | GGUF Q8_0 | MIT | RNN-T con Zapformer, offline, requiere build con `gigaam_zap` |
| ai-sage/GigaAM-Multilingual-v2 (original) | 776 M | 21 | PyTorch (safetensors) | MIT | Referencia oficial; admite el ecosistema PyTorch |
| Whisper (variantes de OpenAI) | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos verificados de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio no está respaldado por ai-sage; los pesos son originales, pero la conversión GGUF y su cuantización no han sido validadas por los autores del modelo.
- Requiere una compilación específica de transcribe.cpp o Handy con la arquitectura `gigaam_zap`; la versión estándar de Handy no puede cargar el archivo ("unsupported architecture").
- Solo inferencia de contexto completo (offline); no hay soporte de streaming, lo que limita su uso en aplicaciones de transcripción en tiempo real.
- El rendimiento en los 21 idiomas puede variar; el autor solo verifica coincidencia con la referencia en ruso, inglés, alemán, francés y español.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos marcados o vocabulario especializado; no se documentan tasas de error.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia MIT: permite uso comercial, pero al tratarse de una conversión no oficial conviene verificar la licencia y los términos del modelo base antes de desplegarlo en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SpruAgent/gigaam-multilingual-v2-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual-v2
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Handy: https://github.com/cjpais/Handy
