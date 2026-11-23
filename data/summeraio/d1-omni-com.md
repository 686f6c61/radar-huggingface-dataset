# summerAIO/d1-Omni-com

## Resumen
d1-Omni-com es un paquete publicado por summerAIO que combina el modelo multimodal LiquidAI/LFM3-Omni-2B (sin modificar, con sus pesos, configuración y código remoto idénticos al original) con una pequeña cabeza de acción de difusión denominada D2M v13, de 0,63 millones de parámetros y 44 acciones posibles. El conjunto convierte la decisión de alto nivel del modelo base ("qué hacer y dónde") en una trayectoria de cursor de 32 eventos con aspecto humano (curvas, suavizado y jitter), además de dibujar 52 formas y trazar 357 glifos (ASCII, kana y kanji simples).

El modelo base es un transformer multimodal de 2.166.928.384 parámetros (aproximadamente 2,17 mil millones) orientado a edge, con entrada audio-texto y capacidad de extracción de características, clasificación y calibración. La aportación del paquete no es un nuevo modelo de lenguaje, sino una capa de control motriz para agentes de interfaz gráfica: el LLM decide la acción y la cabeza de difusión genera la secuencia de eventos de ratón o teclado.

Es relevante porque aborda un problema práctico de los agentes de navegador y escritorio: la brecha entre la decisión semántica y la ejecución de bajo nivel del puntero. La licencia LFM Open License v1.0 permite uso gratuito en investigación y en organizaciones sin ánimo de lucro cualificadas, con uso comercial condicionado a un umbral de ingresos anuales.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base LFM3-Omni (multimodal audio-texto, transformer) más cabeza de acción de difusión D2M v13 |
| Parametros totales | 2.166.928.384 (modelo base); cabeza de acción: 0,63 M |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors (modelo base y cabeza de acción `d2m_head/model.safetensors`) |

## Arquitectura y entrenamiento
El paquete mantiene intacto el modelo base LiquidAI/LFM3-Omni-2B (pesos, configuración y código remoto byte a byte respecto al upstream) y le añade una cabeza de acción independiente, D2M v13, con 0,63 millones de parámetros y 44 acciones. La cabeza transforma la decisión del modelo ("qué hacer, dónde") en una trayectoria de cursor de 32 eventos, con curvas, suavizado y jitter, y también genera trazos para 52 formas y 357 glifos (ASCII, kana y kanji simples). Se puede usar de forma autónoma mediante `D2MActionHead.from_pretrained(...)` o junto al modelo base a través del cargador `d2m_omni.py` (`D2MOmni.from_pretrained(...)`), que invoca `act(...)` y devuelve `action`, `events`, `text` y `done`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base. Respecto a la cabeza, la model card indica que fue entrenada con trayectorias sintéticas (profesores programados y aumentación de datos), no con grabaciones de personas; "humano" significa aquí curvas, suavizado y jitter, no comportamiento observado. Los objetivos de trazo de kana y kanji derivan de Noto Sans CJK JP (SIL OFL 1.1) y los de ASCII de Hershey Fonts, según el NOTICE.

## Capacidades
- Decisión de acciones de interfaz: el modelo base elige entre 44 nombres de acción a partir de descripciones cortas, y la cabeza los materializa en eventos de cursor o teclado.
- Generación de trayectorias de puntero: 32 eventos por acción con curvas, suavizado y jitter, reproducibles con Playwright, xdotool o pyautogui (los reproductores están en `d2m_head/modeling_d2m_v13.py`).
- Dibujo de formas: 52 formas predefinidas, entre ellas círculo, línea, polilínea, arco, órbita y lazo.
- Escritura de glifos: 357 glifos (ASCII, kana y kanji simples) con aproximadamente 32 puntos por glifo.
- Acciones de ratón y teclado: clic, doble clic, clic derecho, hover, scroll, arrastre en varias direcciones, triple clic, escritura, enter, tab, escape, selección total, undo, redo, delete y cut.
- Entrada multimodal audio-texto en el modelo base (pipeline `audio-text-to-text`), con soporte de 16 idiomas.
- Extracción de características y clasificación mediante el modelo base (tags `feature-extraction`, `classification`, `extraction`, `calibration`).
- Integración con aplicaciones: incluye `apps/` con mini aplicaciones de CAD y widgets.
- Modo "system-one" declarado en los tags del autor (no se detalla su funcionamiento en la información disponible).

## Casos de uso
- Automatización de agentes de navegador: el modelo base interpreta una instrucción como "Click the Search menu" junto con una captura de pantalla, y la cabeza genera la secuencia de eventos que Playwright reproduce sobre la página, lo que permite cerrar el bucle percepción-decisión-acción sin heurísticas manuales de puntero.
- Pruebas de interfaz con trazas realistas: la generación de trayectorias con curvas y jitter permite simular interacción humana en pruebas end-to-end de aplicaciones web, útil para detectar problemas que solo aparecen con movimiento de ratón no trivial.
- Automatización de herramientas CAD: las acciones ORBIT, PAN, ZOOM_IN, ZOOM_OUT, CIRCLE_TOOL, POLYLINE, LASSO y CAD_EXTRUDE, junto con la mini aplicación de CAD incluida, permiten guionizar operaciones de dibujo técnico sobre un lienzo.
- Anotación y escritura sobre lienzo: el trazado de 357 glifos y 52 formas sirve para generar datos sintéticos de escritura o para automatizar la introducción de texto dibujado en aplicaciones de diseño.
- Asistentes de escritorio con control de ratón: el paquete puede integrarse en herramientas que necesiten mover el cursor, arrastrar elementos o rellenar formularios en aplicaciones nativas mediante xdotool o pyautogui.
- Investigación en control de agentes: la separación entre decisión (modelo base de 2,17 mil millones de parámetros) y ejecución (cabeza de 0,63 M) facilita experimentar con la capa motriz sin reentrenar el LLM.
- Procesamiento de audio multilingüe en el borde: el modelo base, con soporte de 16 idiomas y orientación edge, puede emplearse para tareas de clasificación o extracción sobre audio y texto en dispositivos con recursos limitados.

## Benchmarks y rendimiento
La model card solo publica pruebas de éxito de la cabeza de acción en Chromium headless, con una caja objetivo correcta y comprobación del estado de la página. No son tasas de éxito de agente de extremo a extremo.

| Tarea | Éxito (solo cabeza) |
|---|---|
| ORBIT 回転 | 3/3 |
| CAMERA_ORBIT (v11) | 3/3 |
| PAN 平行移動 | 3/3 |
| ZOOM_IN | 3/3 |
| ZOOM_OUT | 3/3 |
| CIRCLE_TOOL 円 | 3/3 |
| LINE_TOOL 線 | 0/3 |
| POLYLINE 多角形 | 0/3 |
| CAD_EXTRUDE (v11) | 3/3 |
| LASSO 範囲選択 | 3/3 |
| UNDO | 0/3 |
| REDO | 0/3 |
| DELETE | 3/3 |
| CUT | 0/3 |
| ARROW_UP 移動 | 0/3 |
| ARROW_DOWN | 3/3 |
| ARROW_LEFT | 0/3 |
| ARROW_RIGHT | 3/3 |
| CLICK トグル | 3/3 |
| DOUBLE_CLICK | 3/3 |
| RIGHT_CLICK メニュー | 3/3 |
| HOVER | 3/3 |
| SCROLL 下 | 3/3 |
| SCROLL_UP | 3/3 |
| DRAG_RIGHT スライダー | 1/3 |
| DRAG_LEFT スライダー | 3/3 |
| DRAG カード (↘) | 3/3 |
| DRAG_ANTI カード (↙) | 3/3 |
| TYPE 入力 | 3/3 |
| ENTER | 0/3 |
| TAB | 0/3 |
| ESCAPE | 0/3 |
| SELECT_ALL | 0/3 |
| TRIPLE_CLICK 段落 | 3/3 |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni se ha medido el acierto del modelo al elegir entre las 44 acciones, en particular las 18 más recientes (ORBIT, LASSO, etc.).

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 2.166.928.384 parámetros, en fp16 se requieren aproximadamente 4,3 GB solo para pesos, más overhead de activaciones y del codificador multimodal; el repositorio ocupa 4,6 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo encaja en el rango de GPU de consumo con 8-12 GB de VRAM en fp16, aunque esta estimación no está confirmada por el autor.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 8 GB o más de VRAM, sujeto a verificación empírica; no hay datos publicados.
- Opciones de despliegue: la librería declarada es transformers con `trust_remote_code` y código personalizado (`custom_code`); el paquete incluye el cargador `d2m_omni.py` y el módulo independiente `d2m_head/modeling_d2m_v13.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| summerAIO/d1-Omni-com | 2,17 mil M + 0,63 M (cabeza) | no disponible | Agente de interfaz con cabeza de acción de difusión | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-Omni-2B | 2,17 mil M | no disponible | Multimodal audio-texto para edge | LFM Open License v1.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base ni de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias
- La cabeza de acción se entrenó con trayectorias sintéticas generadas por profesores programados y aumentación, no con grabaciones de personas; el aspecto "humano" es una aproximación geométrica.
- No se ha medido el acierto del modelo base al elegir entre las 44 acciones, especialmente las 18 más recientes (ORBIT, LASSO, etc.).
- Los glifos usan aproximadamente 32 puntos cada uno, por lo que los kanji complejos resultan toscos.
- Las pruebas publicadas solo validan la cabeza con una caja objetivo correcta y en Chromium headless; no son tasas de éxito de agente de extremo a extremo.
- Varias acciones fallan de forma consistente en las pruebas: LINE_TOOL, POLYLINE, UNDO, REDO, CUT, ARROW_UP, ARROW_LEFT, ENTER, TAB, ESCAPE y SELECT_ALL obtienen 0/3; DRAG_RIGHT logra 1/3.
- Riesgo de alucinación del modelo base: no hay datos publicados sobre su tasa de error en decisiones de interfaz ni en generación de texto.
- Licencia: LFM Open License v1.0, basada en Apache-2.0; investigación y uso sin ánimo de lucro cualificado son gratuitos, pero el uso comercial solo se permite por debajo del umbral de ingresos anuales de la licencia; por encima se requiere licencia comercial de Liquid AI. Las obras derivadas deben mantenerse bajo la misma licencia y conservar los avisos.
- Se deben conservar los avisos de terceros: trazos kana/kanji derivados de Noto Sans CJK JP (SIL OFL 1.1) y ASCII de Hershey Fonts, según el NOTICE.
- No hay información sobre sesgos, limitaciones de contexto ni comportamiento multilingüe más allá de la lista de idiomas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/summerAIO/d1-Omni-com
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Model card del modelo base incluida en el repo: README_d1-Omni-2B.md
- Código de la cabeza de acción: `d2m_head/modeling_d2m_v13.py`
- Cargador combinado: `d2m_omni.py`
- Mini aplicaciones: `d2m_head/apps/` (CAD y widgets)
- Licencia: `LICENSE` (LFM Open License v1.0)
- Avisos de terceros: `NOTICE`
