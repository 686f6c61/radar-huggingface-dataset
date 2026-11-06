# sselpah/MossRAEL

## Resumen

Moss:RAEL es un ajuste fino (fine-tune) del modelo de generación de imágenes OpenMOSS-Team/MOSS-Image-Base, orientado específicamente a la generación de ilustraciones estilo anime. Lo desarrolla el usuario sselpah y se distribuye en Hugging Face con un repositorio de 15,6 GB. El modelo no es un modelo de lenguaje sino un modelo de difusión para texto-a-imagen, entrenado sobre un dataset privado de aproximadamente 68.000 ilustraciones y capturas de pantalla de anime.

El objetivo del modelo es reproducir el trazo expresivo característico de la ilustración anime, incluyendo el estilo de artistas concretos y de franquicias específicas, mediante un sistema de prompting especializado (`Art by @<artist name>` y `[Copyright: <copyright>]`). Está pensado para usarse dentro de ComfyUI con un flujo de trabajo proporcionado por el autor, y funciona bien en resoluciones de 1 a 1,5 megapíxeles.

La relevancia actual radica en que se apoya en MOSS-Image-Base, un modelo base reciente, y aplica un ajuste fino intensivo (20 épocas, aproximadamente 1,337 millones de imágenes vistas) con un coste declarado de 1.000 dólares en 8 GPU H100. El modelo tiene 23 likes y 0 descargas en el momento de la consulta, lo que indica que es un artefacto de nicho, recién publicado y con escasa adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de OpenMOSS-Team/MOSS-Image-Base; el autor no la detalla) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en inglés según los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 15,6 GB; el workflow referencia nodos de ComfyUI, sin confirmar GGUF o safetensors) |

## Arquitectura y entrenamiento

El modelo parte de OpenMOSS-Team/MOSS-Image-Base, un modelo de generación de imágenes texto-a-imagen. La model card no describe la arquitectura interna del modelo base (si es un transformer de difusión, un modelo híbrido o de otro tipo), por lo que este dato no está disponible. El ajuste fino se realizó sobre el checkpoint base sin modificar la arquitectura, según la información proporcionada.

El entrenamiento se llevó a cabo con un dataset privado de aproximadamente 68.000 ilustraciones y capturas de pantalla de anime, en una proporción 85 %/15 %. Todas las imágenes fueron captionadas con Qwen 3.8 27B. La configuración declarada es AdamW8Bit, batch de 80 con acumulación de gradiente de 2, learning rate 1e-5 con scheduler cosine, 20 épocas (aproximadamente 1,337 millones de imágenes vistas) y resolución de 1024 con varlen (menos del 1 % de las imágenes estaba por debajo de 1024). El cómputo utilizado fue de 8 GPU H100, con un coste total declarado de 1.000 dólares. No se menciona RLHF, DPO ni ninguna innovación técnica adicional más allá del ajuste fino supervisado.

## Capacidades

- Generación de imágenes texto-a-imagen con estética anime, incluyendo retratos, escenas y composiciones verticales y horizontales.
- Reproducción del estilo de artistas concretos mediante el prefijo `Art by @<artist name>` en el prompt.
- Generación de capturas de pantalla de anime mediante `Art by @anime screencap`.
- Representación de personajes y franquicias específicas mediante la sintaxis `[Copyright: <copyright>];`.
- Composición detallada de escenas con control de vestuario, iluminación, reflejos, accesorios y expresiones faciales, según los ejemplos de la model card.
- Integración con ComfyUI mediante un workflow proporcionado, con el nodo `ModelSamplingAuraFlow` ajustado a un shift de 8.0 (el autor recomienda no bajar de 6).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Ilustración de personajes para proyectos de ficción: el modelo permite generar retratos de personajes originales o de franquicias con control fino de vestuario, expresión y entorno, útil para ilustradores que necesitan referencias rápidas en estilo anime.
- Producción de arte conceptual para videojuegos de estética anime: mediante la sintaxis `[Copyright: <copyright>]` se pueden generar variaciones coherentes con una franquicia concreta, acelerando la exploración de direcciones visuales.
- Generación de capturas de pantalla estilo anime para fan art y webcomics: el prefijo `Art by @anime screencap` permite producir imágenes con la estética de fotograma de serie, útil para viñetas y portadas.
- Emulación de estilo de artistas para estudios de ilustración: el prefijo `Art by @<artist name>` permite aproximar el trazo de artistas del dataset, sirviendo como base para propuestas y moodboards.
- Creación de ilustraciones para merchandising y publicaciones de nicho: composiciones verticales de tres cuartos y escenas nocturnas con iluminación compleja, como las mostradas en los ejemplos, son adecuadas para pósteres y láminas.
- Iteración rápida en ComfyUI para pipelines de generación por lotes: el workflow incluido y la resolución de 1-1,5 MP permiten integrar el modelo en flujos de producción de imágenes a escala moderada.
- Exploración de prompts y estilos en investigación de modelos de difusión: al ser un fine-tune sobre MOSS-Image-Base, sirve para estudiar cómo el ajuste fino con captions generados por un LLM afecta la fidelidad de estilo y la composición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo pesa 15,6 GB, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos en precisión completa, y más para el proceso de difusión.
- GPU recomendadas: el autor entrenó con 8 GPU H100, pero no especifica requisitos de inferencia. Por el tamaño del checkpoint, se requiere una GPU con al menos 16-24 GB de VRAM, aunque este dato no está confirmado.
- ¿Cabe en GPU de consumo? No confirmado. Un checkpoint de 15,6 GB podría caber en GPUs de 24 GB (RTX 3090, RTX 4090) si se carga en precisión reducida, pero la model card no lo especifica.
- Opciones de despliegue: ComfyUI, con el workflow `mossrael_workflow.json` proporcionado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sselpah/MossRAEL | no disponible | no aplica | no disponible | no disponible | Hugging Face, 0 descargas, 23 likes |
| OpenMOSS-Team/MOSS-Image-Base | no disponible | no aplica | no disponible | no disponible | Hugging Face (modelo base) |
| RicemanT/MossAD-Demo | no disponible | no aplica | no disponible | no disponible | Hugging Face (inspiración declarada) |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide determinar si el uso comercial está permitido. Es un riesgo importante para producción.
- Dataset privado y cerrado: el dataset de entrenamiento no es público, lo que limita la reproducibilidad y la auditoría de sesgos.
- Riesgo de sobreajuste a estilos concretos: el autor advierte que los artistas con solo 1-10 imágenes en el dataset probablemente no se aprendieron bien, lo que implica una calidad desigual según el artista solicitado.
- Sesgos de dominio: entrenado exclusivamente con ilustraciones y capturas de anime, por lo que su rendimiento fuera de la estética anime no está garantizado.
- Idioma: los ejemplos de prompt están en inglés; no se documenta soporte para otros idiomas.
- Riesgo de alucinación visual: como modelo generativo, puede producir anatomía incorrecta, artefactos en manos y detalles, o composiciones incoherentes, especialmente en resoluciones fuera del rango recomendado (1-1,5 MP).
- Restricciones de prompting: requiere sintaxis específica (`Art by @<artist name>`, `[Copyright: <copyright>];`, sin guiones bajos), y el autor invita a probar otros métodos sin garantizar resultados.
- Configuración de muestreo sensible: el nodo `ModelSamplingAuraFlow` debe ajustarse a un shift de 8.0 y no bajar de 6, lo que indica sensibilidad a la configuración.
- Adopción muy baja: 0 descargas y 23 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Posible contenido NSFW: el autor menciona "NSFW Astra" en el contexto de las captions, lo que sugiere que el dataset podría incluir contenido para adultos; no se detalla el filtrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sselpah/MossRAEL
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Workflow de ComfyUI: https://huggingface.co/sselpah/MossRAEL/resolve/main/mossrael_workflow.json?download=true
- Guía de uso de MOSS-Image en ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
- Inspiración declarada: https://huggingface.co/RicemanT/MossAD-Demo
- Créditos: https://huggingface.co/CabalResearch
