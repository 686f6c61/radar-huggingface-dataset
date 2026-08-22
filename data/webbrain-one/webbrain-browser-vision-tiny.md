# webbrain-one/webbrain-browser-vision-tiny

## Resumen

WebBrain Browser Vision Tiny es un modelo de visión y lenguaje (VLM) especializado en la comprensión de interfaces de navegador, desarrollado por WebBrain a partir del modelo base `LiquidAI/LFM2.5-VL-450M`. Su propósito es convertir una captura de pantalla del navegador en una observación estructurada de seis secciones que un agente de planificación posterior puede consumir para automatizar tareas. Está pensado como un componente ligero para automatización de navegador, no como un VLM general.

El modelo tiene 448,7 millones de parámetros y ha sido ajustado con LoRA sobre el modelo base de LiquidAI. La licencia es `lfm1.0`, una licencia específica no estándar. El repositorio incluye tanto el checkpoint fusionado como el adaptador LoRA original, lo que permite reproducibilidad y futuros merges. Es relevante ahora porque ofrece una alternativa local y gratuita a los agentes de navegador propietarios, con un tamaño contenido que permite su ejecución en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (basado en LiquidAI/LFM2.5-VL-450M) |
| Parámetros totales | 448.718.848 (448,7 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (aunque la evaluación incluye casos en japonés, árabe y turco, no se declara una lista oficial) |
| Licencia | lfm1.0 (otra) |
| Formato de pesos | safetensors (modelo completo y adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en el VLM de LiquidAI `LFM2.5-VL-450M`, un modelo de visión-lenguaje de 450M de parámetros. El ajuste se realizó con supervisión mediante LoRA (rank 16, alpha 32, dropout 0.05) durante una época, con un tamaño de lote efectivo de 16 y una tasa de aprendizaje de 1e-4 con programación coseno y un 3% de warmup. El máximo de tokens de imagen se limitó a 256 y se usó precisión BF16 con gradient checkpointing. El entrenamiento se ejecutó en una NVIDIA RTX 4090 de 24 GB, con un pico de VRAM de 21,4 GiB y una duración de 102,2 minutos. Los parámetros entrenables fueron 4.128.768, un 0,91% del total.

Los datos de entrenamiento provienen de tres fuentes: WebSight v0.1 (CC-BY-4.0), MiniWoB++ (MIT) y ScreenParse (CC-BY-4.0), con un total de 15.348 filas de entrenamiento y 1.298 de validación. Las etiquetas fueron generadas por un modelo profesor (`qwen/qwen3.6-35b-a3b`) a través de OpenRouter, y el dataset público incluye un proceso de revisión de privacidad y deduplicación de imágenes.

## Capacidades

- Convierte capturas de pantalla del navegador en observaciones estructuradas en seis secciones, listas para un agente de planificación.
- Detecta texto visible, controles, estado de formularios (válido/inválido), diálogos, errores, estados de carga, consentimiento, CAPTCHA y bloqueadores.
- Está diseñado para servir como fallback local cuando un VLM más grande no está disponible.
- Es un modelo multimodal de entrada de imagen y salida de texto, especializado en comprensión de GUI de navegador.
- No es un modelo general de conversación ni de razonamiento; su uso previsto es específico para automatización de navegador.

## Casos de uso

- Automatización de navegador: el modelo puede describir el estado de una página (botones, formularios, diálogos) para que un agente de planificación decida qué acción tomar. Es adecuado por su bajo coste de inferencia y tamaño.
- Extracción de datos de páginas web: al identificar texto visible y controles, puede ayudar a extraer información de tablas o listados, aunque con limitaciones en OCR multilingüe.
- Pruebas de interfaz de usuario (UI): puede generar descripciones estructuradas de estados de pantalla para verificar visualmente que una aplicación se renderiza correctamente.
- Asistencia de accesibilidad: al detectar diálogos y estados de formulario, puede ayudar a validar la accesibilidad de una web.
- Detección de obstáculos en automatización: identifica CAPTCHAs, banners de consentimiento o bloqueadores que requieren intervención manual.
- Fallback local para agentes de navegador: cuando un VLM en la nube no está disponible, este modelo puede proporcionar observaciones básicas de la página.

## Benchmarks y rendimiento

Los resultados de evaluación se basan en la suite de 100 casos `test/vision` de WebBrain, con el mismo prompt de producción. El modelo ajustado logra 30 pases frente a 0 del modelo base, con una puntuación media de rúbrica del 70,06% frente al 4,17%. La latencia media en una RTX 4090 fue de 2.395 ms para el modelo ajustado, frente a 561 ms del base (la medición depende de la implementación y no es una afirmación de velocidad independiente del hardware).

| Modelo | Pases / 100 | Media rúbrica | Easy | Basic | Intermediate | Advanced | Challenging |
|---|---|---|---|---|---|---|---|
| Base LFM2.5-VL-450M | 0 | 4,17% | 5,49% | 6,38% | 5,13% | 2,36% | 1,50% |
| WebBrain Browser Vision Tiny | 30 | 70,06% | 81,99% | 74,13% | 70,32% | 54,94% | 68,94% |

Los casos más débiles corresponden a OCR multilingüe (japonés, árabe, turco), estados de carga y validación de formularios específicos. No se han publicado resultados de regresión en imágenes generales.

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX 4090 de 24 GB (pico de VRAM 21,4 GiB).
- Inferencia: el modelo tiene 448 M de parámetros, por lo que puede ejecutarse en GPUs de consumo como RTX 3060, 4060 o 4090, e incluso en CPU con cuantización (aunque no se han publicado configuraciones de cuantización).
- Opciones de despliegue: compatible con Transformers; también podría usarse con llama.cpp, Ollama o vLLM si se convierte a GGUF, pero no se documenta explícitamente.
- Latencia: 2.395 ms por inferencia en una RTX 4090 con el servidor Transformers (medición de la evaluación, no una especificación universal).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para comprensión de pantalla de navegador. El modelo base `LiquidAI/LFM2.5-VL-450M` es el punto de partida, pero no es un competidor directo. No se ha publicado comparativa con otros VLM de tamaño similar.

## Limitaciones y advertencias

- No es un reemplazo general de un VLM de frontera; su uso está restringido a descripciones de pantalla para automatización.
- No debe usarse para leer contraseñas, datos de pago u otra información sensible; las observaciones no deben interpretarse como autorización para ejecutar acciones.
- Muestra debilidades en OCR multilingüe, especialmente en japonés, árabe y turco, y en estados de carga o validación de formularios concretos.
- No se ha evaluado la regresión en imágenes generales, por lo que su comportamiento fuera del dominio de navegador es desconocido.
- Licencia `fm1.0` (otra) que puede imponer restricciones específicas; es necesario revisar los términos antes de uso comercial.
- El modelo no declara idiomas soportados oficialmente, aunque la evaluación incluye casos multilingües con resultados bajos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webbrain-one/webbrain-browser-vision-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/webbrain-one/webbrain-browser-vision-tiny-dataset
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Repositorio de WebBrain: https://github.com/webbrain-one/webbrain
- Sitio web del proyecto: https://www.webbrain.one/
- FAQ con detalles de licencia y uso: https://www.webbrain.one/docs/faq/
