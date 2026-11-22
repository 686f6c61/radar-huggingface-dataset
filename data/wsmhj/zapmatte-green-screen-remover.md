# wsmhj/zapmatte-green-screen-remover

## Resumen

Zapmatte Green Screen Remover es una herramienta de código abierto para eliminar fondos de pantalla verde, azul o teal en vídeo, devolviendo al sujeto sobre un fondo transparente. La publica el usuario wsmhj bajo licencia GPL-3.0 y constituye el pipeline "Standard" del servicio web zapmatte.com. No es un modelo de lenguaje ni un transformer generativo: es un pipeline de visión por computador que combina matting humano mediante Robust Video Matting (RVM, MobileNetV3) con un chroma key adaptativo y un paso de despill.

El sistema está pensado para flujos de postproducción: acepta clips de hasta 4K y conserva resolución y audio, generando salidas en ProRes 4444 con alfa, WebM transparente (VP9 + Opus), matte en blanco y negro o MP4 sobre un color o imagen de fondo. Su relevancia radica en que integra en un único comando varias etapas que normalmente se hacen a mano en un editor (keying, matting de pelo, despill, eliminación de marcadores de tracking), con velocidades de 41 fps a 720p, 19 fps a 1080p y 5,5 fps a 4K sobre una GPU T4.

Al estar construido sobre RVM, hereda su licencia GPL-3.0, lo que condiciona su uso en productos propietarios. La información disponible se limita a la model card y al repositorio; no hay datos sobre entrenamiento propio, benchmarks cuantitativos ni evaluación de calidad frente a alternativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: matting neuronal (Robust Video Matting, MobileNetV3) + chroma key algorítmico + despill |
| Parámetros totales | no disponible (RVM MobileNetV3; el autor no publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vídeo, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa texto; la interfaz CLI está en inglés) |
| Licencia | GPL-3.0 |
| Formato de pesos | Pesos RVM descargados vía `torch.hub` desde GitHub; salidas en ProRes 4444, WebM (VP9+alpha), MP4 H.264 |

## Arquitectura y entrenamiento

El pipeline encadena seis etapas. Primero, Robust Video Matting (RVM con backbone MobileNetV3) genera un alfa suave para las personas de cada fotograma, con memoria temporal recurrente que evita el parpadeo en los bordes. Segundo, se hace un chroma key que muestrea el color de la pantalla localmente alrededor del sujeto, de modo que iluminación desigual y sombras no dejan halos. Tercero, se combinan ambas máscaras: intersección de alfa RVM y alfa del key cerca de las personas (preservando el pelo suave) y key puramente cromático lejos de ellas, para que atrezo y objetos sobrevivan. Cuarto, para pantallas azules o teal se detecta el tono a partir de cinco fotogramas y se rota a verde antes del keying. Quinto, un paso de despill elimina el rebote verde en pelo, piel y bordes. Sexto, se eliminan pequeños blobs encerrados por la pantalla y alejados de las personas (marcadores de tracking).

No hay información sobre un entrenamiento propio: el componente neuronal es RVM preentrenado por ByteDance (Shanchuan Lin et al.), descargado en el primer uso. El resto son etapas algorítmicas de procesamiento de imagen y vídeo implementadas en el repositorio. No se documentan datos de entrenamiento, número de tokens ni técnicas de alineación como RLHF o DPO, que no aplican a este tipo de sistema.

## Capacidades

- Eliminación de fondo en vídeo sobre pantalla verde, azul o teal, con detección automática del tono de pantalla.
- Matting de personas con alfa suave y memoria temporal (bordes de pelo estables, sin flicker).
- Conservación de objetos y atrezo alejados de las personas mediante key cromático independiente.
- Despill de rebote verde en pelo, piel y contornos.
- Eliminación de marcadores de tracking pequeños.
- Salida en múltiples formatos: ProRes 4444 con alfa, WebM transparente (VP9 + audio Opus), matte blanco y negro en MP4 H.264 y MP4 compuesto sobre color o imagen.
- Conservación de resolución (hasta 4K) y audio del clip original.
- Ejecución en GPU (T4 y superiores) y en CPU, esta última lenta.
- Interfaz de línea de comandos (`remove_green_screen.py`) y comando instalable `remove-green-screen`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Postproducción de vídeo profesional: generar un ProRes 4444 con canal alfa que se importa directamente en Premiere Pro, After Effects, Final Cut Pro o DaVinci Resolve, sustituyendo el trabajo manual de keying y matting de pelo en planos de personas.
- Producción de contenido para redes sociales: componer al sujeto sobre un color corporativo o una imagen con `--image beach.jpg` y exportar MP4 listo para CapCut, móvil o plataformas sociales, sin necesidad de editor de vídeo.
- Streaming y vídeo web: generar WebM transparente (VP9 + Opus) para superponer al presentador sobre gráficos en OBS o en una página web, manteniendo el audio sincronizado.
- Pipelines de VFX con track matte: exportar el matte en blanco y negro (H.264) como capa de track matte en el editor, útil cuando se necesita control manual posterior del alfa.
- Procesamiento por lotes en servidor: ejecutar el CLI sobre una GPU T4 a 19 fps en 1080p para automatizar la limpieza de fondos de un catálogo de clips, con throughput suficiente para lotes moderados.
- Sustitución de fondos en vídeo corporativo o educativo: grabar ponentes sobre pantalla verde y sustituir por platós virtuales o presentaciones conservando resolución hasta 4K y el audio original.
- Prototipado e integración en herramientas propias: al ser código Python con licencia GPL-3.0, se puede integrar en aplicaciones de código abierto que necesiten matting de vídeo sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta velocidades de inferencia sobre una GPU T4: aproximadamente 41 fps a 720p, 19 fps a 1080p y 5,5 fps a 4K. También indica que funciona en CPU, sin cifras.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; RVM con backbone MobileNetV3 es un modelo ligero y el autor lo ejecuta en una T4 (16 GB), por lo que es probable que quepa en GPU de consumo, aunque no se confirma.
- GPU recomendadas: NVIDIA T4 como referencia del autor; se espera funcionamiento en GPU NVIDIA con CUDA. No se detallan otras.
- GPU de consumo: no confirmado; el pipeline es ligero (MobileNetV3) y probablemente quepa en RTX 3060/4060 o superiores, pero es una estimación no verificada.
- CPU: soportado, "lentamente" según el autor, sin cifras de rendimiento.
- Despliegue: CLI en Python 3.10+ con ffmpeg (con libvpx y prores_ks) en el PATH; instalación vía `pip install .` o `requirements.txt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 41 fps a 720p, 19 fps a 1080p y 5,5 fps a 4K en T4.
- Hosting alternativo: demo en Replicate (hasta 720p, primeros 10 s) y Space de Hugging Face en Gradio (CPU, primeros 8 s).

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Contexto/resolución | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Zapmatte Green Screen Remover | Pipeline RVM + chroma key | GPL-3.0 | Hasta 4K | 41 fps 720p / 19 fps 1080p / 5,5 fps 4K en T4 | HF, GitHub, Replicate, Space, web |
| Robust Video Matting (RVM) | Matting neuronal puro | GPL-3.0 | No especificado en la información | no disponible | GitHub, torch.hub |
| Alternativas comerciales de chroma key | Software propietario | Propietaria | Variable | no disponible | Comercial |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otras herramientas de la misma categoría en la información proporcionada; la comparación con RVM se limita a que Zapmatte lo usa como componente de matting.

## Limitaciones y advertencias

- Diseñado exclusivamente para metraje rodado frente a pantalla verde, azul o teal; no funciona como removedor de fondo genérico en vídeos sin pantalla.
- La ropa verde se conserva, pero puede aparecer parcheada; el atrezo verde alejado de las personas se elimina junto con la pantalla.
- Límite de resolución: fotogramas de hasta 4096 px de ancho y 2160 px en el lado corto.
- Licencia GPL-3.0 heredada de RVM: impide su uso en productos propietarios sin liberar el código derivado; es un caveat crítico para integración comercial.
- Dependencia de RVM preentrenado por ByteDance; el autor pide citar el paper de RVM en investigación.
- No hay información sobre sesgos demográficos del componente de matting (RVM puede tener comportamiento desigual según tono de piel, pelo o ropa), ni evaluación de calidad publicada.
- Riesgo de artefactos en bordes con pelo rizado, movimiento rápido o iluminación muy desigual, aunque la memoria temporal de RVM mitiga el flicker.
- Sin datos sobre cuantización, VRAM exacta ni rendimiento en CPU, lo que dificulta planificar despliegues en hardware modesto.
- El proyecto es muy reciente (creado en noviembre de 2026) y sin descargas ni likes en Hugging Face; madurez y mantenimiento no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/wsmhj/zapmatte-green-screen-remover
- Repositorio GitHub: https://github.com/wsmhj/zapmatte-green-screen-remover
- Sitio web: https://zapmatte.com
- Demo en Replicate: https://replicate.com/wsmhj/green-screen-remover
- Space en Hugging Face: https://huggingface.co/spaces/wsmhj/green-screen-remover
- Robust Video Matting (paper y código): https://github.com/PeterL1n/RobustVideoMatting
