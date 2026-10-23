# Wan-AI/Wan2.1-T2V-14B

## Resumen

Wan2.1-T2V-14B es un modelo de difusión para generación de vídeo a partir de texto (text-to-video) desarrollado por Wan-AI, la organización detrás de la familia Wan2.1. Es la variante de mayor tamaño de la suite: 14.288.491.584 parámetros (≈14,3 B) en formato safetensors, publicada en HuggingFace el 25 de febrero de 2025 y distribuida bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas. El modelo genera vídeo en resoluciones de 480P y 720P y, según la model card, es el único modelo de vídeo de su categoría capaz derenderizar texto legible tanto en chino como en inglés dentro de la escena.

El problema que aborda es la generación de vídeo de alta calidad con dinámica de movimiento significativa desde prompts en lenguaje natural, un terreno donde los modelos abiertos quedaban por detrás de las soluciones propietarias. Wan-AI afirma que esta variante establece un nuevo referente SOTA tanto frente a modelos abiertos como cerrados, aunque la model card no acompaña esas afirmaciones con cifras de benchmarks en la información disponible. La suite incluye además variantes de image-to-video (I2V-14B-480P y 720P) y una variante ligera T2V-1.3B pensada para GPUs de consumo.

El componente técnico diferencial que sí se documenta es Wan-VAE, un VAE de vídeo que codifica y descodifica vídeo en 1080P de longitud arbitraria preservando la información temporal. El repositorio ocupa 149,5 GB, muy por encima de los ~28,6 GB que ocuparían los pesos del modelo en bf16, lo que apunta a la inclusión de componentes adicionales (codificador de texto, VAE, checkpoints fragmentados), si bien la model card no detalla la composición exacta del repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para text-to-video (pipeline `text-to-video`) con VAE de vídeo propio (Wan-VAE). La model card no detalla el backbone interno más allá del VAE |
| Parametros totales | 14.288.491.584 (≈14,3 B) |
| Parametros activos | No disponible (no se documenta arquitectura MoE en la información proporcionada) |
| Longitud de contexto | No disponible para el codificador de texto; el límite práctico lo marcan resolución (480P/720P) y duración del clip, no publicados como cifra |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas oficiales en la información disponible; pesos en safetensors. La cuantización se menciona solo como optimización opcional no aplicada en las mediciones de tiempo del modelo 1.3B |
| Idiomas soportados | Inglés (en) y chino (zh), tanto en prompts como en texto renderizado dentro del vídeo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también distribuido vía ModelScope) |

## Arquitectura y entrenamiento

Wan2.1 se presenta como una suite de modelos fundacionales de vídeo basada en difusión: el pipeline declarado es `text-to-video` y la configuración de inferencia recomendada usa `num_inference_steps: 10`, lo que sitúa al modelo en el régimen de muestreo con pocos pasos. El componente arquitectónico que la model card detalla explícitamente es Wan-VAE, descrito como un VAE de vídeo capaz de codificar y descodificar vídeo en 1080P de cualquier duración preservando la información temporal, y que se postula como base tanto para generación de vídeo como de imagen. El resto del backbone (tipo de transformer de difusión, mecanismos de atención, compresión latente) no se especifica en la información disponible.

No se han publicado en la información proporcionada datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de alineación como RLHF o DPO. Sí se documenta una capacidad poco habitual en modelos de vídeo abiertos: la generación de texto visual legible en chino e inglés dentro del fotograma, que la model card atribuye a un entrenamiento específico para robustez tipográfica. La suite cubre además tareas de image-to-video, edición de vídeo, text-to-image y video-to-audio, aunque este repositorio concreto corresponde únicamente a la variante text-to-video de 14B.

## Capacidades

- Generación de vídeo a partir de texto en 480P y 720P, con énfasis declarado en dinámica de movimiento y calidad visual.
- Generación de texto visual: renderiza texto legible en chino e inglés dentro del vídeo, capacidad que la model card reclama como primera en un modelo de vídeo abierto.
- Codificación/descodificación de vídeo en 1080P de longitud arbitraria mediante Wan-VAE, preservando coherencia temporal.
- Control mediante prompts en inglés y chino.
- Inferencia multi-GPU soportada en el código oficial, junto con demo Gradio.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento, por tratarse de un modelo generativo de vídeo y no de un modelo de lenguaje.
- No se documentan capacidades de audio; video-to-audio pertenece a la suite Wan2.1 pero no a este checkpoint.

## Casos de uso

- **Generación de vídeo publicitario a partir de brief**: el modelo convierte un prompt descriptivo en un clip de 480P o 720P con movimiento definido, útil para producir variantes de anuncio antes de rodar. Su soporte de texto renderizado permite incluir titulares o marcas legibles sin postproducción.
- **Prototipado rápido en preproducción audiovisual**: storyboards animados y previsualizaciones de plano para equipos de cine o animación, generando clips de baja resolución para validar encuadre y ritmo antes de invertir en producción real.
- **Generación de material para redes sociales en mercados hispanohablantes y asiáticos**: el soporte nativo de chino e inglés facilita campañas bilingües, con texto en pantalla generado por el propio modelo en lugar de superponerse después.
- **Contenido de catálogo para e-commerce**: clips cortos de producto a partir de descripciones textuales, integrables en pipelines de generación por lotes con la API de diffusers o los scripts oficiales.
- **Investigación en generación de vídeo**: la licencia Apache 2.0 y la disponibilidad de pesos completos permiten fine-tuning, ablaciones sobre el VAE y estudios comparativos de dinámica de movimiento sin restricciones de uso comercial.
- **Educación y divulgación**: creación de animaciones explicativas breves a partir de guiones textuales, con la ventaja de poder incorporar rótulos en inglés o chino directamente en el fotograma.
- **Generación de datasets sintéticos de vídeo**: producción de clips etiquetados a partir de prompts controlados para entrenar o evaluar otros modelos de visión por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que Wan2.1-T2V-14B supera a los modelos abiertos y a las soluciones comerciales existentes en múltiples benchmarks y que establece un nuevo referente SOTA, pero no incluye las tablas numéricas correspondientes (no se aportan cifras de VBench, MMLU, HumanEval ni métricas equivalentes de vídeo). Cualquier comparación cuantitativa con otros modelos requeriría consultar el paper, que la propia model card marca como "coming soon".

## Requisitos de hardware

- **Pesos en bf16**: 14,29 B de parámetros implican ≈28,6 GB solo para los pesos del modelo, antes de sumar codificador de texto activaciones y VAE.
- **VRAM estimada para inferencia**: no publicada oficialmente para la variante 14B. Como referencia de orden de magnitud, hay que presupuestar los ≈28,6 GB de pesos más los componentes auxiliares, lo que en la práctica apunta a GPUs de 40-80 GB para 480P sin técnicas de offload. Para 720P el requisito es mayor. Estas cifras son estimaciones a partir del recuento de parámetros, no datos de la model card.
- **GPU recomendadas**: A100 80 GB y H100 para ejecución en una sola GPU sin cuantizar; el repositorio oficial incluye código de inferencia multi-GPU, lo que permite repartir el modelo entre varias GPUs de 24-48 GB.
- **GPU de consumo**: el modelo 14B no cabe en una RTX 4090 de 24 GB en bf16 sin cuantización u offload (estimación). Para consumo, Wan-AI ofrece la variante T2V-1.3B, que según la model card requiere 8,19 GB de VRAM y genera un clip de 5 segundos en 480P en unos 4 minutos en una RTX 4090 sin optimizaciones.
- **Opciones de despliegue**: scripts oficiales del repositorio de GitHub (con soporte multi-GPU), demo Gradio incluida, y la librería `diffusers` (el tag de HuggingFace indica `diffusers`, aunque el todo list de la model card marca la integración en diffusers y en ComfyUI como pendiente a fecha de publicación). No se documentan en la información disponible soportes de llama.cpp, Ollama, vLLM ni TGI, que no aplican a un modelo de difusión de vídeo.
- **Latencia y throughput**: no publicados para el 14B. La única referencia temporal de la model card es la del 1.3B (≈4 min para 5 s en 480P en RTX 4090).

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto/duracion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Wan2.1-T2V-14B | ≈14,3 B | 480P y 720P | No disponible | Apache 2.0 | HuggingFace y ModelScope | Texto visual en chino e inglés; VAE para 1080P |
| Wan2.1-T2V-1.3B | ≈1,3 B | 480P (720P inestable) | No disponible | Apache 2.0 | HuggingFace y ModelScope | 8,19 GB de VRAM, ~4 min por clip de 5 s en RTX 4090 |
| Wan2.1-I2V-14B-720P | ≈14 B (no confirmado) | 720P | No disponible | Apache 2.0 | HuggingFace y ModelScope | Variante image-to-video de la misma suite |
| HunyuanVideo | No disponible en la información | No disponible | No disponible | No disponible | No disponible | Alternativa abierta de Tencent; datos no verificados en esta búsqueda |
| CogVideoX-5B | No disponible en la información | No disponible | No disponible | No disponible | No disponible | Alternativa abierta de menor tamaño; datos no verificados en esta búsqueda |

Las dos últimas filas se incluyen solo como referencia de categoría: los datos concretos no forman parte de la información proporcionada y no se han verificado, por lo que no deben citarse como cifras contrastadas. La comparación fiable posible con los datos disponibles se limita a las variantes de la propia familia Wan2.1.

## Limitaciones y advertencias

- **Ausencia de benchmarks verificables**: la afirmación de SOTA no va acompañada de tablas numéricas en la model card y el paper figura como "coming soon"; conviene tratar el rendimiento declarado como no auditado hasta su publicación.
- **Riesgo de alucinación visual**: como todo modelo generativo de difusión, puede producir anatomías inconsistentes, físicas imposibles, texto mal formado o artefactos de parpadeo entre fotogramas, especialmente en planos largos y con movimiento rápido.
- **Sesgos del dataset**: no se documenta la composición del corpus de entrenamiento, por lo que no es posible evaluar sesgos demográficos, culturales o de representación; cabe esperar un sesgo hacia los contextos visuales dominantes en los datos.
- **Cobertura lingüística limitada a inglés y chino**: los prompts en castellano no están oficialmente soportados y su comportamiento es impredecible; en producción conviene traducir el prompt al inglés.
- **Longitud y resolución acotadas**: aunque Wan-VAE trabaja con 1080P, este checkpoint genera 480P y 720P; no se publica la duración máxima de clip soportada.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero conviene revisar las licencias de los componentes auxiliares (codificador de texto, VAE) si se redistribuyen, ya que la model card no desglosa la licencia de cada submodelo.
- **Coste de inferencia elevado**: ≈28,6 GB de pesos en bf16 más componentes auxiliares hacen inviable el despliegue en GPUs de consumo sin cuantización u offload.
- **Ecosistema inmaduro en la fecha de publicación**: diffusers y ComfyUI figuran como integraciones pendientes en el todo list, lo que puede obligar a usar los scripts oficiales en lugar de herramientas estándar.
- **Contenido sintético**: en jurisdicciones con obligación de etiquetado de contenido generado por IA (por ejemplo, el AI Act europeo), los vídeos producidos deben marcarse como sintéticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wan-AI/T2V-14B (URL canónica: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B)
- Repositorio oficial en GitHub: https://github.com/Wan-Video/Wan2.1
- Organización Wan-AI en HuggingFace: https://huggingface.co/Wan-AI/
- ModelScope: https://modelscope.cn/organization/Wan-AI y https://www.modelscope.cn/models/Wan-AI/Wan2.1-T2V-14B
- Blog oficial: https://wanxai.com
- Discord: https://discord.gg/p5XbdQV7
- Paper: anunciado como "coming soon" en la model card, sin URL disponible
- Demo del producto: https://create.wan.video/generate
- Nota: el resto de resultados de la búsqueda web obtenidos corresponden al término de redes "WAN" (wide area network) y no guardan relación con este modelo.
