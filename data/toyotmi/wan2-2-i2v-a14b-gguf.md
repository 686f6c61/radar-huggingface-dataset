# toyotmi/Wan2.2-I2V-A14B-GGUF

## Resumen

Wan2.2-I2V-A14B-GGUF es una conversión directa al formato GGUF del modelo Wan-AI/Wan2.2-I2V-A14B, un modelo de generación de vídeo a partir de imagen (image-to-video) desarrollado por el equipo Wan de Alibaba. Esta versión, publicada por el usuario toyotmi, no introduce cambios en los pesos ni en el comportamiento del modelo original: se limita a empaquetar los 14.288.901.184 parámetros en cuantizaciones GGUF para facilitar su ejecución en entornos con recursos limitados.

El modelo resuelve la tarea de animar una imagen estática generando una secuencia de vídeo coherente temporalmente, a partir de una descripción textual opcional. Es relevante porque el formato GGUF permite desplegar un modelo de vídeo de gran tamaño en hardware de consumo mediante nodos personalizados de ComfyUI, algo que con los pesos originales en safetensors resultaría inviable en la mayoría de equipos domésticos.

La ficha se centra en las características verificables del repositorio y del modelo base. Cualquier dato no confirmado en la información disponible se marca explícitamente como no disponible, incluida la práctica totalidad de benchmarks, ya que el autor no publica resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para image-to-video; detalles del transformer no especificados en la información disponible) |
| Parametros totales | 14.288.901.184 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles en la información proporcionada) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 232,2 GB; el base model se distribuye en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Wan2.2-I2V-A14B más allá de su tarea (image-to-video) y su tamaño (14.288.901.184 parámetros). No se especifican el tipo de backbone (transformer de difusión, DiT u otra variante), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Esta ficha no puede confirmar ninguno de esos extremos sin inventar datos.

La innovación técnica verificable de este repositorio concreto es la conversión a GGUF, que reduce el peso en disco y permite cargar el modelo mediante el nodo ComfyUI-GGUF de city96, colocando los ficheros en `ComfyUI/models/unet`. El autor indica que, al tratarse de un modelo cuantizado, se mantienen íntegramente los términos de licencia y las restricciones de uso del modelo original.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), con coherencia temporal entre fotogramas.
- Condicionamiento por texto en inglés y chino, según los idiomas declarados en la model card.
- Ejecución en ComfyUI mediante el nodo personalizado ComfyUI-GGUF.
- Carga de pesos cuantizados en GGUF, lo que reduce los requisitos de memoria frente al modelo original.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades adicionales en la información disponible.
- No se documentan capacidades de razonamiento, código o matemáticas, al tratarse de un modelo generativo de vídeo.

## Casos de uso

- Previsualización de animaciones para producción audiovisual: el modelo permite convertir un fotograma clave o un concept art en un clip animado para validar movimiento, encuadre y ritmo antes de pasar a un pipeline de render completo.
- Creación de contenido para redes sociales: a partir de una imagen promocional se genera un vídeo corto animado, aprovechando el condicionamiento en inglés o chino para adaptar el mensaje al mercado objetivo.
- Prototipado rápido en estudios de animación: los artistas pueden animar storyboards estáticos y evaluar transiciones sin necesidad de un rigging manual.
- Generación de material para vídeo musical o piezas artísticas: se animan ilustraciones o fotografías con movimiento sutil para integrarlas en montajes creativos.
- Demostraciones interactivas en ComfyUI: al cargarse como nodo GGUF en `ComfyUI/models/unet`, encaja en flujos de trabajo visuales donde el usuario ajusta prompts e imágenes de entrada en tiempo real.
- Investigación en generación de vídeo: sirve como referencia cuantizada para reproducir experimentos con el modelo base en hardware más modesto, comparando resultados entre niveles de cuantización.
- Localización de contenido: la combinación de prompts en inglés y chino permite generar variantes de un mismo vídeo para audiencias de ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 232,2 GB en total, por lo que el nivel de cuantización elegido determina el consumo real. Los pesos completos de 14.288.901.184 parámetros en FP16 requerirían del orden de 28 GB solo para los pesos, antes de activaciones y memoria del pipeline de difusión.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, se requiere hardware de gama alta (A100, H100 o GPUs con suficiente VRAM) para los pesos sin cuantizar; las cuantizaciones GGUF buscan reducir ese requisito.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible. Depende del nivel de cuantización concreto y de la memoria de vídeo de la tarjeta (RTX 4090, 3090 u otras).
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (método documentado por el autor). No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están pensados para este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| toyotmi/Wan2.2-I2V-A14B-GGUF | 14.288.901.184 | no disponible | GGUF | apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Wan-AI/Wan2.2-I2V-A14B | 14.288.901.184 (según dato del repo derivado) | no disponible | safetensors | apache-2.0 | Hugging Face (modelo base oficial) |
| Otras alternativas image-to-video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Al ser una conversión cuantizada, puede producirse una pérdida de calidad en el vídeo generado respecto a los pesos originales en safetensors; el grado de degradación depende del nivel de cuantización, que no se detalla.
- La model card no documenta sesgos conocidos, tasas de alucinación visual ni limitaciones específicas de contenido; deben asumirse los riesgos habituales de los modelos generativos de vídeo (artefactos, incoherencias temporales, sesgos de los datos de entrenamiento).
- El soporte de idiomas se limita a inglés y chino según los metadatos; no se garantiza un comportamiento correcto con prompts en castellano.
- La licencia apache-2.0 permite uso comercial, pero el autor recuerda que se mantienen todas las restricciones del modelo original; conviene revisar la model card de Wan-AI/Wan2.2-I2V-A14B antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de la conversión.
- El despliegue está documentado únicamente para ComfyUI con ComfyUI-GGUF; otros entornos no están soportados de forma explícita.
- El tamaño del repositorio (232,2 GB) exige espacio de almacenamiento considerable y una descarga prolongada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/toyotmi/Wan2.2-I2V-A14B-GGUF
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Nodo ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Perfil del autor del nodo: https://huggingface.co/city96
