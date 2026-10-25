# zhandrew/ai-kvm-grounder-8b

## Resumen

ai-kvm-grounder-8b es un modelo visión-lenguaje especializado en *GUI grounding* desarrollado por el usuario zhandrew como componente del agente computer-use ai-kvm. Su tarea es muy acotada: recibe una captura de pantalla y una descripción breve de un elemento ("el botón de guardar", "la pestaña de red") y devuelve un único punto sobre una rejilla normalizada 0-1000, que el planificador del agente traduce a píxeles para ejecutar el clic.

Técnicamente es `mPLUG/GUI-Owl-1.5-8B-Instruct` (familia Qwen3-VL, 8.767.123.696 parámetros) con un LoRA de rango 16 fusionado en los pesos. El adaptador se entrenó durante una época con el *vision tower* y el proyector congelados, sobre unas 11.000 muestras con etiquetas derivadas de cajas ground-truth y verificadas por un modelo profesor. El resultado es un checkpoint de 17,5 GB en safetensors que se sirve con vLLM y que, según el autor, responde en 134 ms p50 en una H200 con una sola petición concurrente.

Su relevancia es práctica: sustituye a un modelo mayor (el profesor Qwen3.8-27B-FP8) en la fase de localización de clics de un agente que controla un ordenador por HDMI/HID, donde no hay DOM ni árbol de accesibilidad disponible y todo debe resolverse a partir de píxeles. No es un modelo de propósito general: no conversa, no razona en varios pasos y no genera texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje (image-text-to-text), familia Qwen3-VL; *vision tower* + proyector + LLM, con LoRA rango 16 fusionado |
| Parámetros totales | 8.767.123.696 (8,77 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en la configuración de servicio publicada por el autor (`--max-model-len 8192`); ventana nativa del modelo base: no disponible |
| Tipos de cuantización | Solo safetensors de 16 bits (17,5 GB, consistente con ~2 bytes/parámetro). No se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible. El prompt de entrenamiento y evaluación está en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers) |
| Modelo base | mPLUG/GUI-Owl-1.5-8B-Instruct |
| Pipeline | image-text-to-text |
| Entrada | Una imagen (captura de pantalla) + descripción textual del objetivo |
| Salida | JSON `{"point_2d": [x, y]}` con enteros 0-1000 relativos a ancho y alto de la imagen; ~17 tokens |
| Resolución de imagen | Presupuesto de 1.003.520 píxeles en entrenamiento; en servicio, `size: {longest_edge: 1003520, shortest_edge: 65536}` |
| Tamaño del repositorio | 17,5 GB |

## Arquitectura y entrenamiento

El modelo parte de GUI-Owl-1.5-8B-Instruct, un VLM de arquitectura Qwen3-VL con torre visual, proyector y un LLM de ~8 B parámetros. Sobre ese checkpoint se aplicó un LoRA de rango 16 entrenado durante una época con *learning rate* 5e-5, manteniendo congelados tanto la torre de visión como el proyector; posteriormente el adaptador se fusionó en los pesos, de modo que el repositorio resultante es un checkpoint denso estándar sin adaptadores separados. Las imágenes se limitaron a 1.003.520 píxeles durante el entrenamiento.

El conjunto de entrenamiento ronda las 11.000 muestras y todas las etiquetas son el centro de una caja de elemento ground-truth, sin coordenadas generadas por modelos. Las fuentes son OS-Atlas macOS (Apache-2.0, conservando solo objetivos cuyo clic del profesor cayera dentro de la caja; se descartó el 20 % de las cajas, incluidos elementos de barra de menús desplazados y etiquetas como valores de sliders o *reprs* de objetos), páginas web en vivo con cajas de DOM verificadas con el mismo criterio, y GroundCUA (MIT, aplicaciones de escritorio verificadas por humanos, donde solo el 43 % de los objetivos que el modelo base fallaba superó la comprobación del profesor). Se añadieron descripciones estilo planificador escritas por el profesor Qwen3.8-27B-FP8 a partir de la captura con la caja dibujada, conservando el 86 % que volvían a caer dentro de la caja al re-localizarlas sobre la imagen limpia. El 35 % de los datos son *replay* de objetivos que el modelo base ya acertaba y el 20 % son copias extra con reescalado aleatorio. No se documenta RLHF ni DPO.

## Capacidades

- *GUI grounding* de un solo objetivo: devuelve el centro del elemento descrito como coordenadas normalizadas 0-1000, listo para convertir con `x_px = x / 1000 * width`.
- Salida estructurada JSON (`{"point_2d": [x, y]}`) compatible con *structured outputs* de vLLM y con el esquema JSON de `shared/ground.py` del repositorio ai-kvm.
- Localización sobre capturas de escritorio macOS y Windows, incluyendo iconos de escritorio, menús y diálogos (mejora clara sobre el modelo base en iconos de escritorio: 85,7 frente a 80,7).
- Localización sobre páginas web renderizadas (sin acceso al DOM), con rendimiento inferior al modelo base en iconos web.
- Respuesta muy corta (~17 tokens) y determinista con temperatura 0, adecuada para bucles de agente con muchas llamadas.
- No soporta *tool calling*, function calling, razonamiento multi-paso, generación de texto libre, OCR explícito, vídeo ni audio.
- No se documentan capacidades multilingües; el prompt debe usarse en inglés y de forma literal:

```
Locate this element in the screenshot: {target}
Reply with its center as {"point_2d": [x, y]}, integers 0-1000 relative to the image width and height.
```

- Requisitos de uso: sin *system prompt*, temperatura 0, `max_tokens` 32.

## Casos de uso

- **Agente computer-use sobre KVM/IPMI**: el escenario para el que se diseñó. El agente captura la pantalla por un dongle HDMI, el planificador decide el siguiente paso y este modelo traduce "pulsa el botón de arranque" en un punto concreto. Es la única vía cuando el equipo objetivo no ejecuta software ni permite login, ya que no hay DOM ni API que consultar.
- **Automatización de escritorio en macOS y Windows**: clics en menús de aplicación, diálogos modales, preferencias del sistema e iconos de escritorio, con 93,2 y 94,3 de precisión respectivamente en ScreenSpot-v2. Adecuado para *scripts* de aprovisionamiento de equipos o tareas repetitivas de administración.
- **RPA sobre aplicaciones *legacy* sin API**: clientes gruesos, terminales de mainframe o sesiones Citrix donde la única interfaz es el renderizado de píxeles. El modelo añade ~134 ms por clic, un coste asumible frente a la latencia humana o de un script de coordenadas fijas que se rompe con cada cambio de resolución.
- **Pruebas E2E de interfaces**: dado un identificador de control en lenguaje natural, el modelo localiza su posición en la captura para aserciones de visibilidad, posición o solapamiento en pipelines de CI, complementando a los selectores cuando estos no existen (canvas, WebGL, *iframes* de terceros).
- **Asistencia remota guiada**: un sistema de soporte recibe la captura del usuario y un ticket del tipo "no encuentro la opción de exportar"; el modelo devuelve el punto donde debe pulsar y la aplicación dibuja una flecha o un halo sobre la pantalla compartida.
- **Pre-anotación de datasets de grounding**: generar puntos candidatos sobre capturas nuevas para revisión humana, usando el modelo como primer paso de etiquetado y reservando la verificación manual para los casos dudosos.
- **Automatización web como respaldo**: cuando la web no expone selectores estables (lienzos, componentes cerrados, sombras DOM), el modelo permite clicar por descripción. Conviene usarlo solo como *fallback*: en iconos web rinde peor que el modelo base (82,3 frente a 88,2).

## Benchmarks y rendimiento

Evaluación del autor sobre ScreenSpot-v2 (escritorio + web, 771 muestras, capturas reducidas a 1.280 px de lado mayor, según el autor nunca vistas en entrenamiento). Latencia medida en una H200 con una petición concurrente sobre 150 muestras.

| Modelo | All | macOS | Windows | Web | Iconos escritorio | Iconos web | Latencia p50 |
|---|---|---|---|---|---|---|---|
| GUI-Owl-1.5-8B (base, mismo prompt) | 90,5 | 92,5 | 90,6 | 90,6 | 80,7 | 88,2 | 140 ms |
| **ai-kvm-grounder-8b** | 89,6 | 93,2 | 94,3 | 87,4 | 85,7 | 82,3 | 134 ms |
| Qwen3.8-27B-FP8 (profesor) | 94,9 | 95,2 | 98,7 | 93,1 | 95,7 | 90,1 | 275 ms |

Lectura: el modelo mejora al base en macOS (+0,7), Windows (+3,7) e iconos de escritorio (+5,0), y empeora en web (-3,2) e iconos web (-5,9). Frente al profesor de 27 B sigue 5,3 puntos por debajo en el agregado, pero responde en la mitad de tiempo y con un tercio aproximado de los parámetros.

## Requisitos de hardware

- **VRAM en 16 bits**: ~17,5 GB solo de pesos. Con una imagen de hasta 1.003.520 píxeles y contexto de 8.192 tokens, el consumo real de KV cache y *activations* añade varios GB; 24 GB es el mínimo ajustado y 40-48 GB es lo recomendable para producción.
- **GPU recomendadas**: H200 o H100 (entorno medido por el autor), A100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. En A100 40 GB cabe con contexto corto y una sola imagen por prompt.
- **Consumer GPU**: sí, en RTX 4090 / 3090 (24 GB) siempre que se limite `--max-model-len`, se envíe una única imagen por prompt y no se active un lote grande. Por debajo de 24 GB no hay ruta documentada sin cuantizar.
- **Cuantización**: no se publican GGUF, AWQ ni GPTQ. Una conversión a 8 bits (~9 GB) o 4 bits (~5 GB) permitiría entrar en GPUs de 12-16 GB, pero requeriría validar de nuevo la precisión de las coordenadas, que es el núcleo del modelo; el autor no reporta resultados en ese régimen.
- **Despliegue**: vLLM es la vía documentada, con los flags exactos del autor:

```bash
vllm serve <this repo> --max-model-len 8192 --trust-remote-code \
  --limit-mm-per-prompt '{"image":1,"video":0}' \
  --mm-processor-kwargs '{"size":{"longest_edge":1003520,"shortest_edge":65536}}'
```

- También es cargable con Transformers (`library_name: transformers`); TGI, llama.cpp, Ollama y SGLang no están documentados para este checkpoint y, sin GGUF, Ollama no es una opción directa.
- **Latencia y throughput**: 134 ms p50 a una petición concurrente en H200 y ~17 tokens de salida. El throughput agregado con lotes mayores no está publicado; por el perfil de la tarea (una llamada por clic), el dimensionamiento debe basarse en la latencia p50/p99 más que en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScreenSpot-v2 (All) | Latencia p50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ai-kvm-grounder-8b | 8,77 B | 8.192 tokens en servicio | 89,6 | 134 ms (H200) | MIT | HuggingFace, safetensors |
| GUI-Owl-1.5-8B-Instruct (base) | ~8 B | No disponible | 90,5 | 140 ms (H200) | MIT | HuggingFace |
| Qwen3.8-27B-FP8 (profesor) | 27 B (FP8) | No disponible | 94,9 | 275 ms (H200) | No disponible en la información proporcionada | Usado solo como profesor |
| Otros grounders especializados (UI-TARS, OS-Atlas, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra su propio modelo base: mismo tamaño, misma licencia y misma infraestructura, con la diferencia de que este checkpoint gana en escritorio e iconos de escritorio y pierde en web. Frente al profesor de 27 B, la relación es de 5,3 puntos de precisión por 141 ms adicionales de latencia y un coste de memoria mucho mayor.

## Limitaciones y advertencias

- **Regresión en web**: 87,4 en web y 82,3 en iconos web, por debajo del modelo base. El propio autor recomienda usar GUI-Owl-1.5-8B para trabajo centrado en navegador hasta la siguiente iteración.
- **Sin mecanismo de abstención documentado**: siempre devuelve un punto, incluso si el objetivo no está en pantalla. En un agente real esto puede producir clics en zonas arbitrarias; conviene añadir una comprobación posterior (comparación de la región, verificación del cambio de estado) antes de dar el paso por bueno.
- **Riesgo de alucinación de coordenadas**: al ser una salida puramente posicional, un error no es detectable por el texto generado, solo por el resultado de la acción. En elementos ambiguos (varios iconos iguales, texto repetido) la etiqueta puede ser plausible y errónea.
- **Sensibilidad a resolución y reescalado**: se entrenó con un presupuesto de 1.003.520 píxeles y aumentación de reescalado; capturas con *aspect ratios* extremos, densidades muy altas o recortes parciales pueden degradar la precisión. La evaluación se hizo con el lado mayor a 1.280 px.
- **Idioma**: no hay evidencia de soporte multilingüe. El prompt debe enviarse en inglés y con el formato exacto; alterar el *system prompt* o la temperatura no está validado.
- **Alcance funcional**: solo devuelve un punto. No da cajas delimitadoras, no transcribe texto, no describe la pantalla, no planifica y no encadena pasos. Cualquier capacidad de agente reside en el planificador externo.
- **Cobertura de plataformas**: evaluado en macOS, Windows y web. No hay datos de móvil, Linux ni tabletas, aunque el producto ai-kvm se oriente a controlar cualquier equipo por HDMI/HID.
- **Licencia y procedencia de datos**: los pesos son MIT, pero el entrenamiento combina OS-Atlas (Apache-2.0), GroundCUA (MIT) y descripciones generadas por un profesor Qwen3.8-27B. Conviene revisar los términos del modelo base y del profesor antes de un uso comercial a gran escala, y citar las fuentes de datos.
- **Madurez**: repositorio con 0 descargas y 0 *likes* en el momento de la consulta, un solo commit de publicación y sin informes de terceros. Los números proceden exclusivamente del autor y de su propio *harness* de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhandrew/ai-kvm-grounder-8b
- Modelo base: https://huggingface.co/mPLUG/GUI-Owl-1.5-8B-Instruct
- Producto ai-kvm (agente computer-use sobre HDMI y HID): https://www.lynxdi.com/products/ai-kvm
- Repositorio ai-kvm citado en la model card (`training/build_grounding.py`, `training/describe.py`, `training/eval_point.py`, `training/lora_ground8b.yaml`, `shared/ground.py`): URL no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible
