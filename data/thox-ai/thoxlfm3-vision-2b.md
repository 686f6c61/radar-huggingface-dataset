# Thox-ai/ThoxLFM3-Vision-2B

## Resumen

ThoxLFM3-Vision-2B es una especialización mediante LoRA del modelo `LiquidAI/LFM3-VL-2B`, desarrollada por Thox-ai (THOX). Se trata de un modelo vision-language de 1,92 mil millones de parámetros (suma de modelo de lenguaje, codificador visual y proyector) orientado a despliegue en dispositivos de borde (edge), y es la primera entrega de la línea THOX con soporte de entrada de vídeo además de imagen. El repositorio aloja tres ejecuciones de adaptadores (`smoke-v1`, `full-v1` y `completion-v1`); la publicada es `completion-v1`, la de mejor rendimiento medida en la puerta de evaluación visual del autor.

El modelo parte de la arquitectura LFM3-VL de LiquidAI, con una ventana de contexto de 128K tokens en el modelo base (limitada a 32K en los despliegues en dispositivo previstos). THOX no entrenó el modelo base: únicamente entrenó los adaptadores LoRA sobre datos propios. El estado declarado es de pre-lanzamiento, sin pesos promocionados y con generalización débil en el conjunto de validación retenido (1/8 exacto), por lo que debe tratarse como un artefacto experimental más que como un modelo listo para producción.

Su relevancia actual es doble: por un lado, ejemplifica el patrón de especialización ligera sobre modelos de borde multimodales; por otro, está vinculado a una campaña de micromecenazgo de hardware (familia de dispositivos THOX: ThoxMini y ThoxClip), lo que condiciona su hoja de ruta y su disponibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3-VL (transformer multimodal con codificador visual y proyector) |
| Parámetros totales | 1.728.801.600 (safetensors); 1,92B según model card (LM + encoder + proyector) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K en el modelo base; 32K en despliegues en dispositivo (ThoxMini) |
| Tipos de cuantización | GGUF Q4_K_M (pesos) + proyector visual F16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | LFM Open License v1.0 (techo de 10 M USD de ingresos anuales) |
| Formato de pesos | safetensors (adaptadores LoRA), GGUF (Q4_K_M + mmproj F16) |

## Arquitectura y entrenamiento

El modelo base `LiquidAI/LFM3-VL-2B` emplea la arquitectura LFM3-VL, que combina un modelo de lenguaje con un codificador visual y un proyector que alinea las representaciones de imagen con el espacio del LM. THOX no modificó la arquitectura: aplicó adaptadores LoRA de rango 32 y alpha 64 durante 3 épocas con tasa de aprendizaje 1e-4 sobre el modelo base congelado.

El entrenamiento se realizó sobre datos privados de THOX: un conjunto visual de 109 filas imagen+texto escritas manualmente sobre 10 gráficos de THOX, más conjuntos de texto, herramientas y decisiones de la misma casa. La ejecución `completion-v1` reformateó el corpus a forma prompt-completion y entrenó con pérdida solo en la completación (completion-only loss), con el objetivo de superar la ejecución con pérdida sobre la secuencia completa (`full-v1`). Según el autor, `completion-v1` superó a `full-v1` en todas las medidas retenidas de la puerta de evaluación visual.

## Capacidades

- Comprensión de imagen y texto (pipeline `image-text-to-text`) y, como novedad en la línea THOX, entrada de vídeo.
- Transcripción de texto en imágenes y capturas (spike de transcripción: 21/21 líneas en la puerta de evaluación).
- Extracción estructurada de campos a JSON (12/12 campos en la prueba de extracción de retención).
- Comprensión de pantallas e interfaces (GUI) para el sistema ThoxOS.
- Localización de objetos (object grounding) en imágenes.
- Preguntas sobre imágenes y vídeos cortos procedentes de cámara.
- Lectura de documentos, recibos y gráficos.
- Soporte de tool calling y conjuntos de decisión (según los datos de entrenamiento declarados).
- Capacidad de rechazo/declinación ante peticiones fuera de alcance (filas de declinación: 2/2 frente a 0/2 del base sin adaptar).
- Multilingüe: limitado a inglés.

## Casos de uso

- Extracción de datos de recibos y documentos: el modelo convierte imágenes de documentos en JSON estructurado, aprovechando su entrenamiento específico en extracción de campos (12/12 en la prueba de retención) y su ventana de contexto amplia para múltiples páginas.
- Comprensión de pantallas en asistentes de escritorio: integrado en ThoxOS, puede interpretar capturas de GUI para guiar al usuario o automatizar acciones, con un límite de contexto de 32K en dispositivo.
- Análisis de vídeo corto de cámara: responde preguntas sobre clips breves capturados por el dispositivo, una capacidad nueva respecto a las líneas previas de THOX.
- Lectura de gráficos y tablas: interpreta gráficos e infografías (el conjunto de entrenamiento se construyó sobre 10 gráficos) para resumir tendencias o extraer cifras.
- Asistencia en movilidad con privacidad: al ejecutarse en dispositivos ThoxMini/ThoxClip, permite procesar imágenes y vídeo sin enviar datos a la nube, alineado con la propuesta "Your AI. Your Data. Your Rules." del fabricante.
- Filtrado y moderación de contenido visual: las filas de declinación entrenadas permiten rechazar peticiones fuera de alcance en flujos automatizados de captura de imágenes.
- Prototipado de pipelines multimodales en borde: sirve como banco de pruebas para evaluar adaptadores LoRA sobre LFM3-VL antes de un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica únicamente los resultados de su propia puerta de evaluación visual interna:

| Medida (puerta visual THOX) | completion-v1 | Base sin adaptar |
|---|---|---|
| Transcripción de spike (líneas) | 21/21 | no disponible |
| Conjunto retenido, contiene (exacto) | 3/8 | 1/8 |
| Filas de declinación | 2/2 | 0/2 |
| Extracción de retención (campos) | 12/12 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 1.099.627.264 B (~1,1 GB) y el proyector visual F16 378.995.456 B (~379 MB); en total ~1,5 GB de pesos, más overhead de contexto y runtime.
- Cabe en GPU de consumo: cualquier GPU con al menos ~2-3 GB de VRAM libre (por ejemplo, GTX 1650, RTX 3050 en adelante) puede ejecutar la versión Q4_K_M.
- GPU recomendadas para mayor throughput: RTX 4090, A100 o H100 si se sirve en lote o con contexto largo; no hay datos de latencia publicados.
- Despliegue: requiere una compilación de llama.cpp compatible con la arquitectura `lfm3` y con el proyector visual (`mmproj-...-F16.gguf`).
- Ollama: no disponible; el runner actual (verificado contra Ollama 0.40.11 el 2026-11-22) rechaza la arquitectura `lfm3` con "unknown model architecture: 'lfm3'".
- vLLM y TGI: no disponible (no se mencionan como soportados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ThoxLFM3-Vision-2B | 1,92B (LM + encoder + proyector) | 128K base / 32K en dispositivo | LFM Open License v1.0 (techo 10 M USD) | GGUF + adaptadores en HF; pre-lanzamiento |
| LiquidAI/LFM3-VL-2B (base) | 1,92B | 128K | LFM Open License v1.0 | Público en HF |
| Otros modelos vision-language de borde de ~2B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Estado de pre-lanzamiento: no existen pesos promocionados; el autor lo declara explícitamente.
- Generalización débil: 1/8 exacto en el conjunto retenido; el propio autor recomienda leer las secciones de evaluación y limitaciones antes de confiar en el modelo.
- Sin cualificación de dispositivo: no se ha validado en hardware final.
- Entrenamiento sobre un corpus muy pequeño (109 filas visuales), lo que limita la cobertura y aumenta el riesgo de sobreajuste y alucinación fuera de los dominios entrenados.
- Solo inglés; sin soporte multilingüe.
- Contexto efectivo reducido a 32K en los despliegues en dispositivo previstos.
- Licencia LFM Open License v1.0 con techo de 10 M USD de ingresos anuales; el uso comercial por encima de ese umbral requiere licencia separada.
- Uso médico fuera de alcance por declaración del autor; también quedan fuera los endpoints públicos alojados sin censura.
- Dependencia de una compilación específica de llama.cpp compatible con `lfm3`; sin soporte en Ollama en la fecha de verificación.
- Riesgo de sesgo: no se documenta ninguna evaluación de sesgos en la información disponible.
- El repositorio está vinculado a una campaña de micromecenazgo; la continuidad del proyecto y de los pesos depende de su resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxLFM3-Vision-2B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Investigación y model cards de THOX.ai: https://huggingface.co/Thox-ai
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai?ref=hf-thoxlfm3-vision-2b
