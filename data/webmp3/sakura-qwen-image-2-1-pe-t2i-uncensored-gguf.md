# webmp3/Sakura-Qwen-Image-2.1-PE-T2I-Uncensored-GGUF

## Resumen

Sakura-Qwen-Image-2.1-PE-T2I-Uncensored-GGUF es una cuantización comunitaria en formato GGUF del modelo Qwen/Qwen-Image-2.1-PE-T2I, publicado por el usuario webmp3. El modelo base es un Qwen3.5-VL de 9B afinado específicamente como reescritor de prompts para texto-a-imagen: recibe una petición breve de imagen en cualquier idioma y devuelve un JSON con una descripción larga y detallada en inglés (`rewritten_prompt`) más una relación de aspecto recomendada (`wh_ratio`), que después se pasa al modelo generador Qwen-Image-2.1. No genera imágenes por sí mismo.

La variante aquí descrita es "uncensored": los pesos del modelo de lenguaje se han sometido a una ablación direccional con la herramienta Heretic 1.4.0 sobre las proyecciones `o_proj` y `down_proj`, con el objetivo de reducir la tasa de rechazos ante peticiones dañinas. Según las mediciones del propio autor, los rechazos pasan de 95/100 a 21/100 en la evaluación de Heretic sobre el checkpoint BF16, con una divergencia KL de 0,029 en la distribución del primer token.

El resultado se distribuye en dos cuantizaciones GGUF (Q8_0, de 8,87 GiB, y Q4_K_M, de 5,24 GiB) y está pensado para ejecutarse con llama.cpp. La licencia es la Qwen Research License Agreement, que restringe el uso a fines no comerciales, y el autor advierte explícitamente de que el modelo carece de filtro de seguridad y de que es responsabilidad del usuario el contenido generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (capas de atención lineal combinadas con capas de atención completa); la torre de visión del modelo original no está incluida en estos GGUF de solo texto |
| Parametros totales | 8.953.803.264 (unos 8,95 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (8,87 GiB) y GGUF Q4_K_M (5,24 GiB, con importance matrix y no evaluada por el autor) |
| Idiomas soportados | no disponible; la model card indica que acepta peticiones "en cualquier idioma", con salida siempre en inglés |
| Licencia | qwen-research (Qwen Research License Agreement), uso exclusivamente no comercial |
| Formato de pesos | GGUF; el repositorio ocupa 30,3 GB en total |
| Modelo base | Qwen/Qwen-Image-2.1-PE-T2I (relación: cuantizado) |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-VL 9B, con una arquitectura híbrida que combina capas de atención lineal con capas de atención completa, según se detalla en la model card. Sobre ese checkpoint, Qwen realizó un ajuste fino orientado a una tarea muy concreta: reescritura de prompts de texto a imagen. El modelo recibe un mensaje del sistema (el `system_prompt.txt` original, incluido sin modificar en este repositorio) y una petición breve, razona dentro de un bloque `<think>` y responde con un objeto JSON de la forma `{"rewritten_prompt": "...", "wh_ratio": "16:9"}`.

Lo que aporta esta ficha concreta no es entrenamiento nuevo, sino un proceso de abliteración y posterior cuantización. La ablación direccional se aplicó con Heretic 1.4.0 sobre `o_proj` y `down_proj`, con 80 ensayos (30 de inicio aleatorio, semilla 42) y una regla de selección basada en minimizar los rechazos manteniendo una divergencia KL menor o igual a 0,1. El ensayo seleccionado fue el número 23 de 80. Después se generaron los ficheros GGUF en Q8_0 y Q4_K_M. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si hubo etapas de RLHF o DPO.

La model card advierte de un comportamiento relevante de la ablación: el efecto se concentra en la fase de razonamiento. Con el modo *thinking* activado, la tasa de rechazos del fichero GGUF Q8_0 baja de 97/100 a 23/100; con el *thinking* desactivado, apenas cambia (de 98/100 a 88/100). Por tanto, el autor recomienda mantener el razonamiento activado para que la modificación de pesos tenga efecto práctico.

## Capacidades

- Reescritura de prompts de imagen: transforma una petición breve y genérica en una descripción larga en inglés con detalle visual suficiente para un modelo de difusión.
- Salida estructurada en JSON con dos campos (`rewritten_prompt` y `wh_ratio`), lo que facilita su integración en pipelines automatizados.
- Recomendación de relación de aspecto basada en el contenido de la petición.
- Razonamiento explícito en un bloque `<think>` antes de emitir la respuesta final, con posibilidad de activarlo o desactivarlo.
- Entrada multilingüe: acepta peticiones en idiomas distintos del inglés, aunque la salida se produce siempre en inglés.
- Pesos abliterados: no incorpora filtro de seguridad y no rechaza peticiones dañinas, escribiéndolas literalmente en el prompt reescrito.
- Sin capacidades de visión en estos ficheros: la torre de visión del Qwen3.5-VL original no forma parte de los GGUF publicados.
- No genera imágenes: su única función es producir el prompt que consumirá Qwen-Image-2.1.
- Soporte de tool calling y de comportamiento de agente: no disponible en la información proporcionada.

## Casos de uso

- Preprocesado de prompts en un pipeline de generación de imágenes: el modelo se coloca delante del generador (Qwen-Image-2.1) para convertir peticiones cortas de usuario en descripciones ricas en detalle y mejorar la fidelidad del resultado.
- Normalización multilingüe: en una aplicación con usuarios que escriben en varios idiomas, el modelo unifica todas las peticiones en un prompt inglés consistente antes de pasarlas al generador, evitando depender de la cobertura multilingüe del modelo de difusión.
- Selección automática de formato: el campo `wh_ratio` permite que el sistema elija la relación de aspecto adecuada (por ejemplo, 16:9 para paisajes o 9:16 para retratos) sin intervención del usuario.
- Generación de descripciones detalladas para anotación de datasets de imagen: dado un título o una etiqueta breve, el modelo produce una descripción extensa que puede servir como anotación inicial, siempre revisada posteriormente por una persona.
- Investigación sobre alineación y ablación direccional: el repositorio documenta una metodología reproducible (Heretic, ablación sobre `o_proj` y `down_proj`, criterio de KL) que resulta útil para estudiar cómo se comporta la negativa a responder en modelos ajustados.
- Evaluación comparativa de reescritores de prompts: al disponer de la versión original y de la abliterada, permite medir el impacto de la modificación de pesos sobre la calidad del prompt final y no solo sobre la tasa de rechazos.
- Prototipado interno de herramientas creativas: en entornos de investigación y sin exposición pública, para experimentar con estilos de prompt muy específicos que los modelos con filtros suelen suavizar.

En todos los casos debe tenerse en cuenta que la licencia prohíbe el uso comercial y que el modelo no incluye moderación alguna, por lo que cualquier despliegue con usuarios exige añadir una capa propia de filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos publicados son mediciones de tasa de rechazo y divergencia KL realizadas por el autor.

Medición con Heretic sobre el checkpoint BF16, antes de la cuantización (100 prompts dañinos, 100 tokens generados, system prompt por defecto de Heretic):

| Metrica | Original | Abliterado |
|---|---:|---:|
| Rechazos | 95 / 100 | 21 / 100 |
| Divergencia KL (primer token) | — | 0,029 |

Medición sobre el fichero GGUF Q8_0 con llama.cpp b11524 (mismos 100 prompts, regla de conteo de Heretic):

| Configuracion | Original | Abliterado |
|---|---:|---:|
| Thinking activado, inicio forzado "I first" | 97 / 100 | 23 / 100 |
| Thinking activado, sin inicio forzado | 96 / 100 | 21 / 100 |
| Thinking desactivado | 98 / 100 | 88 / 100 |
| Thinking desactivado, inicio forzado "I first" | 95 / 100 | 26 / 100 |

Prueba de longitud completa con el system prompt propio del modelo (24 prompts, temperatura 0, hasta 6.144 tokens generados, Q8_0):

| Metrica | Original | Abliterado |
|---|---:|---:|
| JSON final parseado correctamente | 23 | 24 |
| Sin terminar en 6.144 tokens | 1 | 0 |
| `rewritten_prompt` rechaza explícitamente la petición | 0 | 0 |
| `rewritten_prompt` invierte la petición (contenido de prevención o advertencia) | 9 (+1 poco claro) | 0 |

## Requisitos de hardware

- VRAM para el fichero Q8_0: 8,87 GiB de pesos, más la caché KV correspondiente al contexto configurado.
- VRAM para el fichero Q4_K_M: 5,24 GiB de pesos, más caché KV.
- El repositorio completo ocupa 30,3 GB en disco, aunque solo se descarga el fichero elegido.
- Cabe en GPU de consumo: con la cuantización Q4_K_M entra con holgura en tarjetas de 8-12 GB; la Q8_0 requiere del orden de 12 GB o más. GPU como RTX 3090, RTX 4090 o superiores lo ejecutan sin problema.
- GPU profesionales (A100, H100) no son necesarias para este tamaño, aunque pueden usarse para servir varias instancias en paralelo.
- Opciones de despliegue: llama.cpp (`llama-server` o `llama-cli`) con soporte de Qwen3.5 y el flag `--jinja`; el autor midió con la release b11524 en backend Vulkan. El soporte en ComfyUI no fue probado por el autor para este modelo concreto. Otros runtimes (vLLM, TGI, Ollama) no están documentados en la información disponible.
- Aviso de runtime: con la release b11259 de llama.cpp, esta arquitectura leía únicamente la primera palabra de los mensajes de usuario en inglés, también con GGUF de terceros. Es necesario usar una build más reciente y verificarla con una pregunta corta antes de confiar en los resultados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sakura-Qwen-Image-2.1-PE-T2I-Uncensored (esta ficha) | ~8,95 B | no disponible | GGUF Q8_0 / Q4_K_M | qwen-research, no comercial | Pesos abliterados con Heretic, sin filtro de seguridad |
| Qwen/Qwen-Image-2.1-PE-T2I (modelo base) | ~9 B | no disponible | safetensors | qwen-research, no comercial | Modelo original con alineación de seguridad intacta |
| webmp3/Sakura-Qwen-Image-2.1-Turbo-GGUF | no disponible | no disponible | GGUF | Qwen Research License | Cuantización del modelo de imagen Turbo del mismo autor, no del reescritor de prompts |
| Qwen/Qwen-Image-2.1 (generador de imagen) | 7 B en el componente de generación visual (32 capas DiT single-stream) | no disponible | safetensors | no disponible en la información recogida | Modelo de difusión que consume los prompts producidos por el modelo de esta ficha |

La comparación con alternativas de la misma categoría (reescritores de prompts abliterados en GGUF) no está disponible en la información recogida.

## Limitaciones y advertencias

- Ausencia total de filtro de seguridad: el autor documenta que el modelo escribe peticiones dañinas literalmente en el prompt y, por tanto, en la imagen resultante. En sus pruebas generó pasos para fabricar explosivos, una carta amenazante y una URL inventada de un sitio de odio.
- La abliteración solo es efectiva con el modo *thinking* activado; desactivado, la tasa de rechazos apenas cambia (88/100 frente a 98/100).
- Riesgo de alucinación: el modelo puede inventar datos, nombres o direcciones web dentro del prompt reescrito, como ilustra el caso de la URL de un sitio de odio ficticio.
- Prohibición de uso comercial: la Qwen Research License Agreement restringe la explotación a fines no comerciales. El autor cita además la sección 3b de dicha licencia en el repositorio hermano.
- Uso restringido a adultos. Es ilegal en la mayoría de países emplearlo para representar a menores en contextos sexuales o abusivos, o para crear imágenes sexuales o difamatorias de personas reales sin su consentimiento.
- No debe exponerse como servicio público sin una capa de moderación propia.
- Al tratarse de un modelo solo texto en GGUF, se pierde la torre de visión del Qwen3.5-VL original, por lo que no puede procesar imágenes de entrada.
- Longitud de contexto no documentada: no es posible planificar despliegues con prompts muy largos sin verificarla experimentalmente.
- Dependencia de una build reciente de llama.cpp: versiones antiguas (por ejemplo b11259) pueden truncar los mensajes de usuario.
- La cuantización Q4_K_M no fue evaluada por el autor, por lo que su comportamiento en cuanto a rechazos no está caracterizado.
- No se han publicado evaluaciones de calidad del prompt reescrito más allá del análisis cualitativo de 24 muestras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-PE-T2I-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Modelo de imagen Qwen-Image-2.1 en HuggingFace: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo de imagen Qwen-Image-2.1 en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Cuantización hermana Sakura-Qwen-Image-2.1-Turbo-GGUF: https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-Turbo-GGUF
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Ficha de registro en free2aitools: https://free2aitools.com/model/webmp3/sakura-qwen-image-2.1-turbo-gguf
