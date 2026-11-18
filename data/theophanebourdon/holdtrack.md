# TheophaneBourdon/HoldTrack

## Resumen

HoldTrack es un sistema de seguimiento multi-persona (multi-object tracking, MOT) diseñado para procesar vídeos completos capturados por una única cámara. Lo desarrolla Théo­phane Bourdon y se distribuye como un repositorio de pesos en Hugging Face que acompaña a un paquete de código independiente (`holdtrack`). No es un modelo de lenguaje: es un pipeline de visión por computador que combina varios detectores de personas, modelos de pose y correctores de cajas para mantener identidades estables a lo largo de secuencias largas. El autor reporta 89,4 HOTA en el conjunto de test de DanceTrack, una métrica de referencia en seguimiento de bailarines con movimiento rápido y apariencias similares.

El repositorio no contiene un único modelo monolítico, sino un conjunto de pesos heterogéneo: cuatro detectores de persona de una sola clase (RF-DETR-2XL, RF-DETR-L, YOLO26X y D-FINE-L), dos correctores de cajas basados en árboles de gradiente boosting más redes de secuencia, un corrector de referencia y una red de apariencia ResNet-50 para la cadena de identidad. Algunos componentes auxiliares (SAM 3, SAM 3D Body, RTMW-L, ViTPose+ y dos modelos faciales) no se alojan en este repositorio y el comando de descarga los obtiene de sus autores originales.

La relevancia actual del proyecto reside en su enfoque híbrido: en lugar de depender de un único tracker neuronal extremo a extremo, encadena detección fuerte, estimación de pose y corrección aprendida de cajas para resolver las dos decisiones críticas en los contactos entre personas (asociación e identidad). El tamaño total del repositorio es de 1,6 GB y la licencia es mixta, con componentes bajo PML-1.0, Apache-2.0 y AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido de MOT: detectores transformer/CNN (RF-DETR, YOLO26X, D-FINE-L), estimadores de pose (RTMW-L, ViTPose+), correctores de cajas con gradient-boosted trees y redes de secuencia, red de apariencia ResNet-50 |
| Parametros totales | No disponible (conjunto de varios modelos; el tamaño del repo es 1,6 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa vídeos completos de una sola cámara; no hay ventana de tokens definida) |
| Tipos de cuantizacion | No disponible (pesos en `.pth`, `.pt` y `.pkl`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (modelo de visión, no lingüístico) |
| Licencia | Mixta: PML-1.0 (rf_2xl), Apache-2.0 (rf_large, dfine, correctores, identidad, mot17), AGPL-3.0 (yolo) |
| Formato de pesos | PyTorch (`.pth`, `.pt`) y pickle (`.pkl`) |

## Arquitectura y entrenamiento

HoldTrack no es un transformer único sino un sistema por etapas. La detección de personas se reparte entre cuatro detectores de una sola clase: RF-DETR-2XL a resolución 1120 (detector principal y base de las cajas del corrector), RF-DETR-L a 1344 (usado para generar prompts de las pasadas de SAM 3), YOLO26X a 1280 y D-FINE-L a 640. Los RF-DETR fueron preentrenados por el autor sobre CrowdHuman y afinados sobre los conjuntos de entrenamiento y validación de DanceTrack; YOLO26X se afinó conjuntamente sobre CrowdHuman y el entrenamiento de DanceTrack; D-FINE-L parte de Objects365 y COCO y se afina sobre los vídeos de entrenamiento de DanceTrack. Sobre estas detecciones actúa un corrector de cajas en dos etapas (árboles de gradient boosting más dos redes de secuencia) entrenado con las anotaciones de DanceTrack, y un corrector de referencia específico para las vistas de detector y máscara. La cadena de identidad incorpora una red de apariencia ResNet-50 entrenada para clasificar a los bailarines anotados en los vídeos de entrenamiento.

El sistema se completa con modelos externos que el comando `fetch_models` descarga desde sus autores: SAM 3, SAM 3D Body, RTMW-L, ViTPose+ y dos modelos faciales. El entrenamiento se documenta en `docs/TRAINING.md` del repositorio de código y los formatos de entrada del corrector en `docs/BOXES.md`. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de modelo). La innovación técnica declarada es la formulación de "dos decisiones en el contacto" para resolver la asociación y el mantenimiento de identidad cuando las personas se cruzan o se tocan, apoyándose en pose y apariencia además de la caja.

## Capacidades

- Detección de personas de una sola clase en vídeo mono-cámara con cuatro detectores complementarios.
- Seguimiento multi-persona a lo largo de vídeos completos, con mantenimiento de identidad en cruces y contactos.
- Estimación de pose corporal (RTMW-L, ViTPose+) y de cuerpo 3D (SAM 3D Body) como señales auxiliares.
- Segmentación de instancias vía SAM 3 para refinar las cajas y generar máscaras.
- Corrección aprendida de cajas mediante árboles de gradiente boosting y redes de secuencia.
- Cadena de identidad basada en apariencia (ResNet-50) y en rasgos faciales (dos modelos faciales externos).
- Variante específica para MOT17 con su propio corrector de cajas entrenado sobre los vídeos de entrenamiento de MOT17.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un sistema de visión, no un modelo generativo de lenguaje.

## Casos de uso

- Análisis de vídeo de vigilancia en espacios concurridos: el sistema mantiene identidades estables en secuencias largas de una sola cámara, lo que permite contar aforo, trazar trayectorias y detectar aglomeraciones sin perder el hilo entre frames.
- Analítica deportiva y de danza: el ajuste fino sobre DanceTrack y el uso de pose y apariencia lo hacen adecuado para seguir a bailarines o atletas con movimientos rápidos y contactos frecuentes, generando métricas de desplazamiento y ocupación de espacio.
- Producción audiovisual y motion capture: la integración de SAM 3D Body y ViTPose+ permite extraer esqueletos y máscaras por persona para animación, rotoscopia o efectos visuales.
- Seguridad y control de accesos en interiores: la cadena de identidad con red de apariencia y modelos faciales permite reidentificar a una persona entre oclusiones dentro de una misma grabación.
- Investigación en MOT: los pesos y las recetas de entrenamiento documentadas permiten reproducir resultados sobre DanceTrack y MOT17 y servir de base para comparativas académicas.
- Despliegue en pipelines de vídeo bajo demanda: el comando `fetch_models` con opciones `--full` o `--mot17` permite elegir el subconjunto de pesos necesario, reduciendo el coste de almacenamiento en servidores de procesamiento por lotes.
- Auditoría de grabaciones retrospectivas: al procesar vídeos completos de una cámara fija, encaja en tareas de revisión forense donde se necesita reconstruir el recorrido de varias personas a lo largo de horas de metraje.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| DanceTrack (test) | HOTA | 89,4 |

No se han publicado en la información disponible resultados de otros benchmarks (MOT17, MOT20, IDF1, MOTA) ni comparativas numéricas con otros trackers.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio pesa 1,6 GB solo en pesos, pero el pipeline completo incluye además SAM 3, SAM 3D Body, RTMW-L, ViTPose+ y dos modelos faciales descargados aparte, por lo que el consumo real de memoria es muy superior al de los pesos alojados.
- GPU recomendadas: no especificadas por el autor. Por el tamaño de los detectores (RF-DETR-2XL a 1120 px, RF-DETR-L a 1344 px) y de los modelos de pose y segmentación, se requiere una GPU de gama alta con al menos 16-24 GB de VRAM para el pipeline completo; no disponible la cifra exacta.
- Cabe en GPU de consumo: probablemente solo en modelos con 16 GB o más (RTX 4080/4090 o equivalentes), aunque no hay confirmación oficial.
- Opciones de despliegue: el proyecto se distribuye como paquete Python (`python -m holdtrack.fetch_models`) con pesos PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un sistema de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Contexto / alcance | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HoldTrack | Pipeline híbrido (detectores + pose + correctores) | Vídeo completo mono-cámara | 89,4 HOTA en DanceTrack test | Mixta (PML-1.0, Apache-2.0, AGPL-3.0) | Pesos en Hugging Face, código en GitHub |
| ByteTrack | Tracker por asociación de cajas | Secuencias de vídeo | No disponible en esta información | No disponible | No disponible |
| BoT-SORT | Tracker con apariencia y cámara | Secuencias de vídeo | No disponible en esta información | No disponible | No disponible |
| OC-SORT | Tracker con observación centrada | Secuencias de vídeo | No disponible en esta información | No disponible | No disponible |

No se dispone en la información proporcionada de cifras comparativas de estos trackers sobre DanceTrack, por lo que la comparativa numérica queda como no disponible.

## Limitaciones y advertencias

- Es un sistema de visión, no un modelo de lenguaje: no genera texto, no razona y no soporta herramientas ni agentes.
- El rendimiento reportado (89,4 HOTA) corresponde a DanceTrack, un dominio muy específico de bailarines; no hay evidencia publicada de su comportamiento en otros dominios (multitudes densas, interiores, cámaras en movimiento).
- Depende de modelos externos (SAM 3, SAM 3D Body, RTMW-L, ViTPose+, modelos faciales) cuyas licencias y condiciones deben verificarse por separado antes de un uso comercial.
- La licencia es mixta y algunos componentes son AGPL-3.0 (YOLO26X) y PML-1.0 (RF-DETR-2XL), lo que impone obligaciones de copyleft o restricciones de uso comercial según el componente; el usuario es responsable de cumplirlas.
- El uso de modelos faciales y de reidentificación de personas plantea riesgos de privacidad y puede estar sujeto a normativa de protección de datos (RGPD en la UE); no se documentan salvaguardas.
- Riesgo de fallo en oclusiones prolongadas, cambios bruscos de iluminación o personas con apariencia muy similar, pese al uso de pose y apariencia.
- No se documentan sesgos demográficos ni evaluaciones de equidad del detector ni de la red de apariencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados.
- La cita remite a un preprint de arXiv aún no publicado ("link coming soon"), de modo que no hay revisión por pares disponible.

## Enlaces

- Repositorio de pesos en Hugging Face: https://huggingface.co/TheophaneBourdon/HoldTrack
- Código del proyecto: https://github.com/TofBoubou/holdtrack
- Documentación de entrenamiento: `docs/TRAINING.md` del repositorio de código
- Documentación de entradas del corrector: `docs/BOXES.md` del repositorio de código
- Preprint: Bourdon, Th. (2026), "HoldTrack: Two Decisions at Contact in Multi-Person Tracking", arXiv (enlace pendiente de publicación)
- Textos de licencia: carpeta `LICENSES/` del repositorio de pesos
