# uva-cv-lab/OmniShotCut

## Resumen

OmniShotCut es un modelo de detección de límites de plano (Shot Boundary Detection, SBD) desarrollado por el laboratorio de visión por computador de la Universidad de Ámsterdam (UVA Computer Vision Lab). Se trata de un transformer de vídeo basado en consultas de plano (Shot-Query Transformer) que detecta cambios de plano en contenidos de diversa naturaleza: anime, vlogs, videojuegos, cortos, deportes, grabaciones de pantalla, entre otros. Además, es capaz de reconocer el tipo de transición (salto brusco, fundido, cortinilla, etc.). El modelo es relevante porque aborda un problema clásico de análisis de vídeo con una propuesta que integra relaciones holísticas entre planos, mejorando la sensibilidad y la precisión frente a enfoques anteriores. El repositorio de HuggingFace tiene un tamaño de 0,2 GB, lo que sugiere un modelo compacto, aunque no se especifican el número de parámetros ni la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Shot-Query-based Video Transformer |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se basa en un transformer de vídeo que utiliza consultas de plano (shot queries) para modelar las relaciones entre planos y detectar los límites de una manera holística. Esta arquitectura permite distinguir entre saltos bruscos (sudden jumps) y transiciones graduales como fundidos (dissolve, fade) o cortinillas (wipe). No se ha proporcionado información sobre los datos de entrenamiento, el número de muestras de vídeo utilizadas ni sobre técnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovación principal es la formulación de la detección de límites como un problema de consultas (query) sobre el vídeo, lo que facilita la identificación de transiciones complejas y la adaptación a dominios diversos.

## Capacidades

- Detección de cambios de plano en vídeo de múltiples fuentes: anime, vlogs, videojuegos, cortos, deportes, grabaciones de pantalla.
- Reconocimiento de transiciones: saltos bruscos, fundidos (dissolve, fade) y cortinillas (wipe).
- Según la información del autor, alcanza resultados de estado del arte en detección de límites de plano, con sensibilidad y precisión superiores a enfoques previos.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo de visión.
- Capacidades multilingües: no disponible (no aplica).
- Capacidades especiales: ninguna adicional documentada.

## Casos de uso

- Edición automática de vídeo: el modelo puede analizar grabaciones largas y marcar automáticamente los puntos de corte, facilitando la edición en programas como DaVinci Resolve o Premiere.
- Indexación y búsqueda de contenidos: permite segmentar vídeos en planos para crear bases de datos consultables por escenas en plataformas de streaming.
- Análisis deportivo: en retransmisiones, detecta cambios de plano entre repeticiones y jugadas para generar resúmenes automáticos.
- Anotación de datasets para entrenamiento: los investigadores pueden usar el modelo para etiquetar grandes volúmenes de vídeo y crear conjuntos de datos de detección de planos.
- Análisis de grabaciones de pantalla: en tutoriales o demostraciones de software, el modelo identifica los cortes entre diferentes capturas, mejorando la generación de subtítulos o documentación.
- Monitorización de streams y directos: en plataformas de vídeo en directo, el modelo puede detectar cambios de escena para clasificar contenido o alertar a moderadores.
- Automatización de trailers: al segmentar planos, un sistema puede seleccionar los momentos más relevantes para componer avances de películas o series.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- No se ha confirmado si puede ejecutarse en GPU de consumo.
- Opciones de despliegue: no disponible. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- El modelo es una propuesta de investigación reciente (creado en abril de 2026) con pocas descargas y sin validación en entornos de producción.
- Al ser un modelo de visión, no está pensado para tareas de lenguaje, por lo que su uso fuera de la detección de límites de plano es limitado.
- Los sesgos conocidos no están documentados; su comportamiento en vídeos con iluminación o estilos no vistos en el entrenamiento es desconocido.
- Puede producir falsos positivos en vídeos con cambios de escena sutiles, especialmente en transiciones complejas.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y sin responsabilidad por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/uva-cv-lab/OmniShotCut
- GitHub: https://github.com/UVA-Computer-Vision-Lab/OmniShotCut
- Paper arXiv: https://arxiv.org/abs/2604.24762
- Sitio web del proyecto: https://uva-computer-vision-lab.github.io/OmniShotCut_website/
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/uva-cv-lab/OmniShotCut
